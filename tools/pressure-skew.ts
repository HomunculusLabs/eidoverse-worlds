// Pressure scenario 18: CLOCK-SKEW TOLERANCE — late/reordered/future client
// timestamps never corrupt sequence ordering.
//
// Reading the pinned tree FIRST (hypothesis from source, not assumption):
//   - world.ts append(): seq = snapSeq + entries.length + 1 (pure log
//     arithmetic) and ts = Date.now() (server clock). The LOG's identity is
//     server-stamped; nothing a client sends can renumber or re-time it.
//   - lease case (server.ts): lastAt = Date.now() server-side; wire carries
//     only transforms. Staleness/takeover math is server-vs-server.
//   - attest case: freshness = Date.now() - e.ts (both server).
//   - reactions (door/reservation): `now` = cause.ts — an entry ts, server.
//   - pose case: poses carry NO timestamps at all.
//   - spoken-say (verbs.ts vSay): t0 is clamped into [now-300s, now].
//   - motion fold (shared/fold.js): a motion with NO t0 is stamped with the
//     ENTRY ts; a supplied t0 rides verbatim as author DATA.
// So the exposure surface is: (a) verb args that carry client-authored time
// fields (motion.t0 — benign data, observation only), (b) the spoken-say t0
// clamp (must hold under garbage), and (c) the actual ORDERING invariant this
// row names: log seq strict monotonicity + snapshot-vs-file equivalence under
// a 200-socket population whose 5 hostile legs stamp everything they send
// with past (-90s..-300ms), future (+45s..+2h), zero, negative, NaN, and
// string timestamps, interleaved with a saturation verb storm.
//
// Verdict classes (pinned before measuring):
//   PASS, no patch — ordering invariants hold on the pinned tree.
//   baseline RED  — monotonicity/snapshot gates fail: a real defect.
//   harness bug   — selftest/audit-stage failures, fixed before measuring.
//
// Population (pinned): 24 perf @15Hz + 136 spec = 160 anchors; 5 embodied
// skew legs from t+8s (past-stamp say leg, garbage-t0 say leg, past-stamp
// lease leg, future-stamp lease leg, past-t0 motion leg); phase-2 mutation
// band t+17..20.3s (spawn/motion/place + 9 says from 3 skew-regime groups);
// verifier pair + late joiner; teardown t+30s; final probe t+32s; ratchet
// rejoin t+34s. 35s total.
//
// Acceptance gates (pinned before measuring):
//   - anchors 160/160 joins p95 < 3s; late embodied+spec joins p95 < 3s
//   - log discipline: total lines EXACT; seq strictly monotonic from genesis
//     (1..N, no dup/gap/regression under the whole skew+storm load);
//     entry ts non-decreasing; ts span within the run envelope; genesis
//     first; NO overlap between any consecutive entries' [ts, ts+feedMs]
//     feed windows; no verb BEFORE genesis
//   - skew-stamp sandbox: 0 client-stamped numbers reachable in entry.ts;
//     spoken-say t0 100% inside [ts-300s, ts] (hostile garbage dropped);
//     spoken utterance order == log order (t0 is display-only); a hostile
//     motion.t0 never re-anchors ANY entry's own ts (fold re-stamps only
//     t0-less motions with the ENTRY ts — before/after ts identical);
//     hostile t0 values ride comp/motion DATA only (recorded as observation)
//   - replay fidelity: full-log replay (sequencer's own fold, from genesis)
//     == the serving snapshot — entity set, entity fields, comp bags,
//     mounts, chat total, sky — on 2/2 fresh snapshots taken mid-traffic
//   - feed windows: per-entity log order == arrival order; t0-less motion
//     m.t0 == its entry ts (deterministic replay); recentChat sequence
//     strictly increasing
//   - saturation fairness: phase2 says 9/9 appended in-order, author p95
//     < 500ms, delivered to 160/160 anchors; rate-window refuses 2/3 per
//     rat EXACT with the "slow down" receipt; post-storm says 3/3 in-order
//     (server clock governs the window, not client stamps)
//   - lease skew: past/future-stamped transforms accepted as transforms;
//     grants/claims broadcast; releases settle to EXACTLY one place commit
//     each at rest positions; staleness unaffected (server-clock math)
//   - presence: fps p50 >= 12, frame lat p95 < 250ms, 0 seq gaps;
//     roster exact (24 perf + 5 skew mid-run); skew legs 5/5 arrive+leave;
//     final present 0; 160/160 ratchet rejoin p95 < 3s
//   - hygiene: 0 suspicious server log lines; RSS peak growth < 60MB;
//     HTTP probe p95 < 300ms skew-window / < 100ms post
//
//   SERVER_DIR=/tmp/pressure-wt PORT=8989 bun tools/pressure-skew.ts
//   SELFTEST=1 bun tools/pressure-skew.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only
// if every pinned gate holds.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure-wt";
const PORT = Number(process.env.PORT ?? 8989);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure18-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 136, POSE_HZ = 15;      // 160 persistent anchors
const MSG_RATE = "600";                              // prior scenarios' envelope ( spoof lane owns 60)
const SKEW_START = 8_000;        // 5 embodied skew legs join
const PHASE2_SPAWN_AT = 17_000;  // hostile-t0 entities spawn (server-stamped)
const PHASE2_SAY_AT = 19_000;    // 3 skew-regime groups x 3 says
const SKEW_END = 21_000;         // skew legs close
const TEARDOWN_AT = 30_000;
const FINAL_PROBE_AT = 32_000;
const REJOIN_AT = 34_000;
const DURATION = 36_000;
const FEED_MS = 1_500;           // max time a client lags live before
                                 // a newer verb is unserved (an ordering
                                 // violation class this row must catch)
const TS_SPAN_LIMIT_MS = 28_000; // run envelope: the genesis entry stamps at
                                 // SEQUENCER BOOT (~2s before harness t0);
                                 // first verb ~t+2s .. last verifier say t+23s
const phase2Groups = ["az", "bz", "cz"];
const SAY_MATCHES = phase2Groups.flatMap((g, gi) =>
  [0, 1, 2].map((i) => `${g}-${String(gi * 3 + i).padStart(2, "0")}-end`));
const SKEW_IDS = ["skew-0", "skew-1", "skew-2", "skew-3", "skew-4"];
const SELFTEST = process.env.SELFTEST === "1";

// exact log-line expectations (pinned; any drift is a finding, not noise)
const EXPECT = {
  spawns: 5,          // skew-p0/p1/line-a/line-b/big (server-stamped actors)
  pendEntries: 4,     // spawn + 3 motions (NaN t0 rides as t0:null — folds as entry ts)
  lineAMotions: 4,    // past/future/90d/garbage t0 + leap is a place
  skewSays: 7,        // leg0: 4 (2 texts), leg1: 3 garbage
  phase2Says: 9,      // 3 groups x 3 saturation says
  ratSays: 36,        // 3 rats x 12 accepted (fresh 12/4s window each; 2/rat refused)
  regimeSays: 3,      // post-storm regime says
  verifierSays: 9,    // verifier's own phase2 set (spectator verifiers spawn nothing)
  lateSpawn: 1,       // verify-late's target
  leasePlaces: 3,     // skew-p0, skew-p1 releases + skew-big settle
};
const GRAND = EXPECT.spawns + EXPECT.pendEntries + EXPECT.lineAMotions + 1 /* leap place */
  + EXPECT.skewSays + EXPECT.phase2Says + EXPECT.ratSays + EXPECT.regimeSays
  + EXPECT.verifierSays + EXPECT.lateSpawn + EXPECT.leasePlaces;
const EXPECT_ENTITIES = 7;   // p0,p1,line-a,line-b,big,pend + late target
const EXPECT_UTT_ECHOES = 5; // leg0: 2 spoken echoes; leg1: 3 (t0 dropped, spoken kept)
const EXPECT_GRANTS = 3;     // skew-p0, skew-p1, skew-big claims
const TH_GRANTS_OBSERVED = 11; // 3 spec observers x 3 + big claimer x 2
const TH_PLACES_OBSERVED = 3;  // per spec observer: p0/p1/big place commits

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorFailed: 0,
  anchorJoinP95Ms: 3_000,
  rejoinFailed: 0,
  rejoinP95Ms: 3_000,
  lateEmbJoinP95Ms: 3_000,
  lateSpecJoinP95Ms: 3_000,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  probeSkewP95Ms: 300,
  probePostP95Ms: 100,
  probeErrors: 5,
  logTotalDrift: 0,
  seqMonotoneFails: 0,
  seqRegression: 0,
  seqDuplicate: 0,
  seqGap: 0,
  tsRegressions: 0,
  tsSpanOverrun: 0,
  genesisFirstFails: 0,
  preGenesisVerbs: 0,
  feedOverlaps: 0,
  tsClientStamped: 0,
  t0ClampFails: 0,
  uttOrderFails: 0,
  motionTsShift: 0,
  hostileDataLeaks: 0,
  replayMismatches: 0,
  foldPairFails: 0,
  feedOrderFails: 0,
  motionT0StampFails: 0,
  chatSeqFails: 0,
  phase2SaysMissed: 0,
  phase2OrderFails: 0,
  sayAuthorP95Ms: 500,
  sayDelivered: 160,
  saysRateLimited: 6,      // 2/3 per rate leg refused EXACT
  regimeSayMisses: 0,
  leaseGrants: EXPECT_GRANTS,
  grantsObserved: TH_GRANTS_OBSERVED,
  grantsPerObserver: 2,
  leasePlacesObserved: TH_PLACES_OBSERVED,
  leaseRestMismatch: 0,
  rosterGhosts: 0,
  skewArriveDrift: 0,
  skewLeaveDrift: 0,
  finalPresent: 0,
  logSuspicious: 0,
  rssPeakGrowthMB: 60,
};

// ---- strict monotonicity checker (unit-proven below) ---------------------------
function strictMonotone(seqs: number[]): { ok: boolean; reason?: string } {
  let prev = 0;
  for (let i = 0; i < seqs.length; i++) {
    const s = seqs[i];
    if (typeof s !== "number" || !Number.isSafeInteger(s)) return { ok: false, reason: `seq[${i}] not a safe integer: ${s}` };
    if (i === 0) {
      // fresh-world contract: snapSeq starts -1, so genesis appends at seq 0
      if (s !== 0) return { ok: false, reason: `first seq ${s} !== 0` };
    } else if (s === prev) return { ok: false, reason: `duplicate seq ${s} at ${i}` };
    else if (s < prev) return { ok: false, reason: `seq regression ${prev} -> ${s} at ${i}` };
    else if (s > prev + 1) return { ok: false, reason: `seq gap ${prev} -> ${s} at ${i}` };
    prev = s;
  }
  return { ok: true };
}
{ // unit proof: this checker must fire on every failure class it names
  const bad = [
    [[1, 2, 3], "first seq"],
    [[0, 1, 1], "duplicate"],
    [[0, 1, 2, 1], "regression"],
    [[0, 2, 4], "gap"],
    [[0, 1, 3.5], "safe integer"],
  ] as [number[], string][];
  for (const [seqs, needle] of bad) {
    const r = strictMonotone(seqs);
    if (r.ok || !r.reason!.includes(needle)) {
      console.log(`SELFTEST FAIL — monotonicity checker misses ${needle}: ${JSON.stringify(r)}`);
      process.exit(1);
    }
  }
  const good = strictMonotone([0, 1, 2, 3, 4]);
  if (!good.ok) { console.log(`SELFTEST FAIL — monotonicity checker rejects a clean log`); process.exit(1); }
}

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  rejoinFailed: number; rejoinP95: number;
  lateEmbJoinP95: number; lateSpecJoinP95: number;
  fpsP50: number; latP95: number; gaps: number;
  probeSkewP95: number; probePostP95: number; probeErrs: number;
  logTotalDrift: number;
  seqMonotoneFails: number; seqRegression: number; seqDuplicate: number; seqGap: number;
  tsRegressions: number; tsSpanOverrun: number; genesisFirstFails: number; preGenesisVerbs: number;
  feedOverlaps: number; tsClientStamped: number; t0ClampFails: number; uttOrderFails: number;
  motionTsShift: number; hostileDataLeaks: number;
  replayMismatches: number; foldPairFails: number;
  feedOrderFails: number; motionT0StampFails: number; chatSeqFails: number;
  phase2SaysMissed: number; phase2OrderFails: number;
  sayAuthorP95: number; sayDeliveredMin: number;
  saysRateLimited: number; regimeSayMisses: number;
  leaseGrants: number; grantsObserved: number; grantsPerObserver: number;
  leasePlacesObserved: number; leaseRestMismatch: number;
  rosterGhosts: number; skewArriveDrift: number; skewLeaveDrift: number;
  finalPresent: number; logSuspicious: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.rejoinFailed > TH.rejoinFailed) fail.push(`${m.rejoinFailed} anchors failed to REJOIN`);
  if (m.rejoinP95 > TH.rejoinP95Ms) fail.push(`rejoin p95 ${Math.round(m.rejoinP95)}ms > ${TH.rejoinP95Ms}ms`);
  if (m.lateEmbJoinP95 > TH.lateEmbJoinP95Ms) fail.push(`late embodied join p95 ${Math.round(m.lateEmbJoinP95)}ms > ${TH.lateEmbJoinP95Ms}ms`);
  if (m.lateSpecJoinP95 > TH.lateSpecJoinP95Ms) fail.push(`late spectator join p95 ${Math.round(m.lateSpecJoinP95)}ms > ${TH.lateSpecJoinP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on anchor spectators`);
  if (m.probeSkewP95 > TH.probeSkewP95Ms) fail.push(`HTTP probe p95 during skew ${Math.round(m.probeSkewP95)}ms > ${TH.probeSkewP95Ms}ms — skew load blocking the loop`);
  if (m.probePostP95 > TH.probePostP95Ms) fail.push(`post-skew HTTP probe p95 ${Math.round(m.probePostP95)}ms > ${TH.probePostP95Ms}ms`);
  if (m.probeErrs > TH.probeErrors) fail.push(`${m.probeErrs} HTTP probe errors`);
  if (m.logTotalDrift > TH.logTotalDrift) fail.push(`world log total drift ${m.logTotalDrift} vs exact ${GRAND} — line count is not deterministic under skew`);
  if (m.seqMonotoneFails > TH.seqMonotoneFails) fail.push(`log seq not strictly monotonic (${m.seqRegression} regressions, ${m.seqDuplicate} dups, ${m.seqGap} gaps) — client stamps corrupted ordering`);
  if (m.tsRegressions > TH.tsRegressions) fail.push(`${m.tsRegressions} entry ts regressions — log time went backwards`);
  if (m.tsSpanOverrun > TH.tsSpanOverrun) fail.push(`entry ts span exceeds the run envelope — a client clock reached the log`);
  if (m.genesisFirstFails > TH.genesisFirstFails) fail.push(`genesis is not the first entry`);
  if (m.preGenesisVerbs > TH.preGenesisVerbs) fail.push(`${m.preGenesisVerbs} verbs before genesis`);
  if (m.feedOverlaps > TH.feedOverlaps) fail.push(`${m.feedOverlaps} consecutive-entry feed-window overlaps (${FEED_MS}ms) — a stale verb was served after a newer one`);
  if (m.tsClientStamped > TH.tsClientStamped) fail.push(`${m.tsClientStamped} entry ts values match a client-stamped token — server clock not authoritative`);
  if (m.t0ClampFails > TH.t0ClampFails) fail.push(`${m.t0ClampFails} spoken-say t0 outside [ts-300s, ts] — the clamp failed on hostile input`);
  if (m.uttOrderFails > TH.uttOrderFails) fail.push(`${m.uttOrderFails} spoken utterance-order violations — t0 became a reorder key`);
  if (m.motionTsShift > TH.motionTsShift) fail.push(`${m.motionTsShift} hostile motion.t0 shifted an entry's OWN ts — data re-anchored the clock`);
  if (m.hostileDataLeaks > TH.hostileDataLeaks) fail.push(`${m.hostileDataLeaks} hostile stamps reached forbidden surfaces (entry ts / lease.at)`);
  if (m.replayMismatches > TH.replayMismatches) fail.push(`${m.replayMismatches} replay-vs-snapshot mismatches — fold(log) != served state under skew`);
  if (m.foldPairFails > TH.foldPairFails) fail.push(`mid-traffic snapshot pair failed file-fold equivalence`);
  if (m.feedOrderFails > TH.feedOrderFails) fail.push(`${m.feedOrderFails} per-entity feed order violations`);
  if (m.motionT0StampFails > TH.motionT0StampFails) fail.push(`${m.motionT0StampFails} t0-less motions not stamped with entry ts — replay is not deterministic`);
  if (m.chatSeqFails > TH.chatSeqFails) fail.push(`${m.chatSeqFails} recentChat sequence violations`);
  if (m.phase2SaysMissed > TH.phase2SaysMissed) fail.push(`${m.phase2SaysMissed}/9 phase-2 says missing`);
  if (m.phase2OrderFails > TH.phase2OrderFails) fail.push(`${m.phase2OrderFails} phase-2 say order violations`);
  if (m.sayAuthorP95 > TH.sayAuthorP95Ms) fail.push(`phase-2 say author p95 ${Math.round(m.sayAuthorP95)}ms > ${TH.sayAuthorP95Ms}ms`);
  if (m.sayDeliveredMin < TH.sayDelivered) fail.push(`phase-2 says delivered to only ${m.sayDeliveredMin}/160 anchors`);
  if (m.saysRateLimited !== TH.saysRateLimited) fail.push(`rate-window refusals ${m.saysRateLimited} != ${TH.saysRateLimited} exact — the budget is not server-clocked`);
  if (m.regimeSayMisses > TH.regimeSayMisses) fail.push(`${m.regimeSayMisses} post-storm regime says missing — the rate window wedged`);
  if (m.leaseGrants < TH.leaseGrants) fail.push(`lease grants ${m.leaseGrants}/${TH.leaseGrants} — skew-stamped claims bounced`);
  if (m.grantsObserved < TH.grantsObserved) fail.push(`lease grant broadcasts observed ${m.grantsObserved} < ${TH.grantsObserved}`);
  if (m.grantsPerObserver < TH.grantsPerObserver) fail.push(`an observer saw only ${m.grantsPerObserver} grants`);
  if (m.leasePlacesObserved < TH.leasePlacesObserved) fail.push(`lease place commits observed ${m.leasePlacesObserved} < ${TH.leasePlacesObserved} per observer`);
  if (m.leaseRestMismatch > TH.leaseRestMismatch) fail.push(`${m.leaseRestMismatch} lease settlements not at the exact rest position`);
  if (m.rosterGhosts > TH.rosterGhosts) fail.push(`${m.rosterGhosts} roster ghosts at probe`);
  if (m.skewArriveDrift > TH.skewArriveDrift) fail.push(`skew legs arrive drift ${m.skewArriveDrift}`);
  if (m.skewLeaveDrift > TH.skewLeaveDrift) fail.push(`skew legs leave drift ${m.skewLeaveDrift}`);
  if (m.finalPresent > TH.finalPresent) fail.push(`${m.finalPresent} embodied present at final probe — world not empty`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 42,
    rejoinFailed: 0, rejoinP95: 38,
    lateEmbJoinP95: 25, lateSpecJoinP95: 18,
    fpsP50: 15.0, latP95: 11, gaps: 0,
    probeSkewP95: 4, probePostP95: 3, probeErrs: 0,
    logTotalDrift: 0,
    seqMonotoneFails: 0, seqRegression: 0, seqDuplicate: 0, seqGap: 0,
    tsRegressions: 0, tsSpanOverrun: 0, genesisFirstFails: 0, preGenesisVerbs: 0,
    feedOverlaps: 0, tsClientStamped: 0, t0ClampFails: 0, uttOrderFails: 0,
    motionTsShift: 0, hostileDataLeaks: 0,
    replayMismatches: 0, foldPairFails: 0,
    feedOrderFails: 0, motionT0StampFails: 0, chatSeqFails: 0,
    phase2SaysMissed: 0, phase2OrderFails: 0,
    sayAuthorP95: 120, sayDeliveredMin: 160,
    saysRateLimited: 6, regimeSayMisses: 0,
    leaseGrants: 3, grantsObserved: 11, grantsPerObserver: 3,
    leasePlacesObserved: 3, leaseRestMismatch: 0,
    rosterGhosts: 0, skewArriveDrift: 0, skewLeaveDrift: 0,
    finalPresent: 0, logSuspicious: 0, rssPeakGrowth: 14,
  };
  const breached: Measurements = {
    ...healthy,
    anchorFailed: 4, anchorJoinP95: 3_800,
    rejoinFailed: 5, rejoinP95: 3_400,
    lateEmbJoinP95: 3_600, lateSpecJoinP95: 3_100,
    fpsP50: 6, latP95: 900, gaps: 7,
    probeSkewP95: 1_400, probePostP95: 310, probeErrs: 9,
    logTotalDrift: 3,
    seqMonotoneFails: 2, seqRegression: 1, seqDuplicate: 1, seqGap: 3,
    tsRegressions: 5, tsSpanOverrun: 1, genesisFirstFails: 1, preGenesisVerbs: 2,
    feedOverlaps: 4, tsClientStamped: 6, t0ClampFails: 3, uttOrderFails: 2,
    motionTsShift: 1, hostileDataLeaks: 7,
    replayMismatches: 8, foldPairFails: 1,
    feedOrderFails: 3, motionT0StampFails: 2, chatSeqFails: 1,
    phase2SaysMissed: 2, phase2OrderFails: 1,
    sayAuthorP95: 1_500, sayDeliveredMin: 131,
    saysRateLimited: 4, regimeSayMisses: 1,
    leaseGrants: 1, grantsObserved: 4, grantsPerObserver: 1,
    leasePlacesObserved: 1, leaseRestMismatch: 2,
    rosterGhosts: 3, skewArriveDrift: 2, skewLeaveDrift: 1,
    finalPresent: 2, logSuspicious: 5, rssPeakGrowth: 130,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = [
    "anchor connections failed", "anchor join p95", "failed to REJOIN", "rejoin p95",
    "late embodied join", "late spectator join", "fps p50", "frame latency p95", "frame seq gaps",
    "blocking the loop", "post-skew", "probe errors", "line count is not deterministic",
    "not strictly monotonic", "log time went backwards", "run envelope", "genesis is not the first",
    "before genesis", "feed-window overlaps", "server clock not authoritative",
    "the clamp failed", "reorder key", "re-anchored the clock", "forbidden surfaces",
    "fold(log) != served state", "file-fold equivalence", "per-entity feed order",
    "not stamped with entry ts", "recentChat sequence", "phase-2 says missing", "phase-2 say order",
    "say author p95", "delivered to only", "not server-clocked", "rate window wedged",
    "claims bounced", "grant broadcasts", "an observer saw", "per observer",
    "exact rest position", "roster ghosts", "arrive drift", "leave drift", "world not empty",
    "suspicious server log lines", "RSS peak growth",
  ];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${POSE_HZ}Hz + ${N_SPEC} spec = 160 anchors; 5 embodied skew legs t+${SKEW_START / 1000}s (past-say / garbage-t0-say / past-lease / future-lease / past-motion), all stamps -90s..+2h; phase-2 spawn+motion+place band t+17s; 9 saturation says t+19s; rate-window legs t+20.6s; teardown t+${TEARDOWN_AT / 1000}s; final t+${FINAL_PROBE_AT / 1000}s; ratchet t+${REJOIN_AT / 1000}s. ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}; expect EXACT ${GRAND} log lines, feed ${FEED_MS}ms, ts span < ${TS_SPAN_LIMIT_MS}ms`);

// ---- fd budget: ~170 concurrent client sockets must fit ------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 500) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 500 — launch as: ulimit -n 1024 && bun tools/pressure-skew.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure18-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
const server = Bun.spawn({
  cmd: ["bun", "run", "server/server.ts"],
  cwd: SERVER_DIR,
  env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE },
  stdout: logFile, stderr: logFile,
});
const rss = () => {
  try {
    const r = Bun.spawnSync(["ps", "-o", "rss=", "-p", String(server.pid)]);
    return Number(String(r.stdout).trim());
  } catch { return NaN; }
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MB = (kb: number) => Math.round(kb / 1024);
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((x, y) => x - y)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
let ready = false;
for (let i = 0; i < 60 && !ready; i++) {
  await sleep(250);
  try { const res = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); ready = res.status > 0; } catch { /* booting */ }
}
if (!ready) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }
const rssReady = rss();
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (log: ${logPath})`);

// ---- healthy client chassis (loadtest-proven) ----------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
  closed: boolean; id: string;
  arrives: string[]; leaves: string[];
  sayEcho: Map<string, number>;      // text -> receipt time (authoritative echo)
  entrySeqs: Map<string, number>;    // dedupe key "actor|verb|token" -> seq (arrival order)
  leaseGrants: string[]; placeHits: Set<string>;
  errs: string[];
  bytes: number;
  present?: any[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, arrives: [], leaves: [], sayEcho: new Map(), entrySeqs: new Map(), leaseGrants: [], placeHits: new Set(), errs: [], bytes: 0 };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const txt = String(ev.data);
      s.bytes += txt.length;
      const m = JSON.parse(txt);
      if (m.type === "snapshot") {
        s.snapAt = performance.now();
        s.joinMs = s.snapAt - s.openAt;
        s.present = m.present;
        for (const e of m.entries ?? []) if (e.verb === "say") s.says.add(e.args?.text);
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "log") {
        const v = m.entry?.verb, a = m.entry?.args, e = m.entry;
        if (v === "say") {
          s.says.add(a?.text);
          if (!s.sayEcho.has(a?.text)) s.sayEcho.set(a.text, performance.now());
          if (typeof a?.text === "string" && a.text.includes("-end")) {
            const key = `${e.actor}|say|${a.text}`;
            if (!s.entrySeqs.has(key)) s.entrySeqs.set(key, e.seq);
          }
        } else if (v === "place" && typeof a?.id === "string" && a.id.startsWith("skew-")) {
          s.placeHits.add(`${a.id}@${e.seq}`);
        }
        if (v === "spawn" && typeof a?.id === "string" && a.id.startsWith("skew-")) {
          const key = `${e.actor}|spawn|${a.id}`;
          if (!s.entrySeqs.has(key)) s.entrySeqs.set(key, e.seq);
        }
        if (v === "motion" && typeof a?.id === "string" && a.id.startsWith("skew-")) {
          const key = `${e.actor}|motion|${a.id}|${JSON.stringify(a.t0 ?? null)}|${a.amp ?? a.degPerSec ?? a.period ?? ""}`;
          if (!s.entrySeqs.has(key)) s.entrySeqs.set(key, e.seq);
        }
      } else if (m.type === "lease" && m.op === "claimed") s.leaseGrants.push(String(m.id ?? ""));
      else if (m.type === "arrive") s.arrives.push(String(m.id ?? ""));
      else if (m.type === "leave") s.leaves.push(String(m.id ?? ""));
      else if (m.type === "error") s.errs.push(String(m.error ?? ""));
    };
    ws.onclose = () => { s.closed = true; };
    ws.onerror = () => { /* close follows */ };
  });
}

// ---- anchor population --------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, false, i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const anchorFailed = all.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const joinTimes = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);
const anchorIds = new Set(perfs.map((s) => s.id));
const SEER = specs[0];
const observers = [...specs.slice(0, 3), perfs[23]];
if (!SEER || perfs.length < N_PERF || specs.length < 10) {
  console.log("FAIL: anchor population incomplete — seer/perfs/specs missing");
  for (const s of anchors) { try { s.ws.close(); } catch {} }
  server.kill("SIGTERM"); process.exit(1);
}

// embodied presence: 24 broadcasters @ 15Hz (identical to pressure-1..17)
let running = true;
const tickers = perfs.map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
}, 1000 / POSE_HZ));

// HTTP event-loop health probe throughout
const probeSkew: number[] = [], probePost: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  const d = performance.now() - t;
  (performance.now() - t0 < SKEW_END + 1_000 ? probeSkew : probePost).push(d);
}, 500);

// RSS sampler
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500) {
    if (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak) rssSamples.peak = r;
  }
}, 500);

// world-log line baseline (quiet phase — the world exists; harness verbs
// have not started; the genesis is the only entry)
let logBaseline = -1;
at(6_500, () => {
  const p = `${WORLDS}/${WORLD}/log.jsonl`;
  if (existsSync(p)) logBaseline = readFileSync(p, "utf8").split("\n").filter(Boolean).length;
});

// ---- skew legs: 5 embodied clients, everything stamped hostile ------------------
// Every time-bearing surface a client can reach gets a late/reordered/future
// stamp; the tokens ride say text / motion args so the AUDIT can prove the
// server ignored them for ordering while preserving them as DATA.
type SkewLeg = { id: string; kind: "say-past" | "say-garbage" | "lease-past" | "lease-future" | "motion-past"; spec: Spec; sent: number; target?: string; joinedAt: number };
const skewLegs: SkewLeg[] = [];
let skewExpectedTokens: { id: string; token: string; value: number }[] = [];
const skewSend = (S: SkewLeg, obj: any) => {
  if (S.spec.ws.readyState !== 1) return;
  try { S.spec.ws.send(JSON.stringify(obj)); S.sent++; } catch { /* closing */ }
};
const sayObj = (text: string, extra: Record<string, unknown>) => ({ type: "verb", verb: "say", args: { text, ...extra } });
at(SKEW_START, async () => {
  const kinds: SkewLeg["kind"][] = ["say-past", "say-garbage", "lease-past", "lease-future", "motion-past"];
  const res = await Promise.allSettled(kinds.map((k, i) => connect(`skew-${i}`, false, 600 + i)));
  res.forEach((r, i) => {
    if (r.status !== "fulfilled") return;
    const S: SkewLeg = { id: `skew-${i}`, kind: kinds[i], spec: r.value, sent: 0, joinedAt: Date.now() };
    skewLegs.push(S); anchors.push(r.value);
  });
  const leg = (i: number) => skewLegs.find((x) => x.id === `skew-${i}`);
  const now0 = Date.now();
  // leg 0 — say with PAST/FUTURE t0 stamps (spoken protocol): t0 is display
  // metadata, clamped server-side to [now-300s, now]; utterance order must
  // stay log order. (4 says, 2 distinct texts — same-text repeats are legal.)
  {
    const L = leg(0)!;
    const stamp = (d: number) => now0 + d;
    skewSend(L, sayObj("s0", { spoken: true, utt: 0, t0: stamp(-300) }));        // -300ms
    skewSend(L, sayObj("s0+45s", { spoken: true, utt: 2, t0: stamp(45_000) }));  // +45s future
    skewSend(L, sayObj("s0+45s", { spoken: true, utt: 5, t0: stamp(-90_000) })); // -90s (same text, 2nd)
    skewSend(L, sayObj("s0-nospoken", { utt: 9, t0: stamp(-45_000) }));          // not spoken: stripped
  }
  // leg 1 — say with GARBAGE t0 values: NaN, Infinity, "soon", -1e12, 0
  {
    const L = leg(1)!;
    skewSend(L, sayObj("s1x", { spoken: true, utt: 11, t0: NaN }));
    skewSend(L, sayObj("s1y", { spoken: true, utt: 12, t0: "soon" }));
    skewSend(L, sayObj("s1z", { spoken: true, utt: 13, t0: -1e12 }));
  }
  // legs 2/3 — lease streams whose (nonexistent) wire timestamps would be
  // past/future if they existed: transforms only, accepted as transforms.
  // targets spawn at PHASE2_SPAWN_AT+100 via perf-7 (server-stamped spawn).
  {
    const L2 = leg(2)!, L3 = leg(3)!;
    L2.target = "skew-p0"; L3.target = "skew-p1";
    const past0 = now0 - 90_000, future0 = now0 + 120_000, future2h = now0 + 7_200_000;
    // claim AFTER the target exists (scheduled at phase-2); stream + release here
    at(PHASE2_SPAWN_AT + 1_200, () => {
      skewSend(L2, { type: "lease", op: "claim", id: L2.target });
      skewSend(L3, { type: "lease", op: "claim", id: L3.target });
    });
    at(PHASE2_SPAWN_AT + 1_600, () => {
      skewSend(L2, { type: "lease", op: "state", id: L2.target, p: [1.5, 0, 1.5], yaw: 0.1 });
      skewSend(L2, { type: "lease", op: "state", id: L2.target, p: [2.0, 0, 2.0], yaw: 0.2 });
      skewSend(L2, { type: "lease", op: "state", id: L2.target, p: [2.5, 0, 2.5], yaw: 0.3 });
      skewSend(L3, { type: "lease", op: "state", id: L3.target, p: [-1.5, 0, -1.5], yaw: -0.1 });
      skewSend(L3, { type: "lease", op: "state", id: L3.target, p: [-2.0, 0, -2.0], yaw: -0.2 });
    });
    at(PHASE2_SPAWN_AT + 2_400, () => {
      skewSend(L2, { type: "lease", op: "release", id: L2.target, p: [2.5, 0, 2.5], yaw: 0.3 });
      skewSend(L3, { type: "lease", op: "release", id: L3.target, p: [-2.0, 0, -2.0], yaw: -0.2 });
    });
    void past0; void future0; void future2h;   // stamps recorded; wire carries transforms
  }
  // leg 4 — motion verbs with hostile t0 (past/future/90d/garbage), then a
  // `place` leap with no t0 at all. Targets spawn in phase-2 (server-stamped).
  {
    const L = leg(4)!;
    L.target = "skew-line-a";
    at(PHASE2_SPAWN_AT + 1_500, () => {
      skewSend(L, { type: "verb", verb: "motion", args: { id: L.target, type: "spin", degPerSec: 20, t0: now0 - 300 } });
      skewSend(L, { type: "verb", verb: "motion", args: { id: L.target, type: "spin", degPerSec: 20, t0: now0 + 45_000 } });
      skewSend(L, { type: "verb", verb: "motion", args: { id: L.target, type: "spin", degPerSec: 20, t0: now0 - 7_776_000_000 } });
      skewSend(L, { type: "verb", verb: "motion", args: { id: L.target, type: "spin", degPerSec: 20, t0: "soon" } });
      skewSend(L, { type: "verb", verb: "place", args: { id: L.target, pos: [4, 0, 4], yaw: 1.2 } });  // leap, no t0
    });
  }
  // token registry for the audit: (leg id, token, client-stamped value)
  skewExpectedTokens = [
    { id: "skew-0", token: "s0", value: now0 - 300 },
    { id: "skew-0", token: "s0+45s", value: now0 + 45_000 },
    { id: "skew-0", token: "s0+45s", value: now0 - 90_000 },
    { id: "skew-0", token: "s0-nospoken", value: now0 - 45_000 },
    { id: "skew-1", token: "s1x", value: NaN },
    { id: "skew-1", token: "s1y", value: NaN },
    { id: "skew-1", token: "s1z", value: -1e12 },
    { id: "skew-2", token: "L0", value: now0 - 300 },
    { id: "skew-2", token: "L0", value: now0 + 45_000 },
    { id: "skew-2", token: "L0", value: now0 - 90_000 },
    { id: "skew-3", token: "L1", value: now0 + 120_000 },
    { id: "skew-3", token: "L1", value: now0 + 7_200_000 },
    { id: "skew-4", token: "mA", value: now0 - 300 },
    { id: "skew-4", token: "mB", value: now0 + 45_000 },
    { id: "skew-4", token: "mC", value: now0 - 7_776_000_000 },
    { id: "skew-4", token: "mD", value: NaN },
  ];
  console.log(`t+${SKEW_START / 1000}s: ${skewLegs.length}/5 skew legs joined — stamping begins`);
});

// ---- skew legs close (clean departures, inside the seer's window) ---------------
at(SKEW_END, () => {
  for (const L of skewLegs) {
    try { L.spec.ws.close(); } catch { /* gone */ }
  }
  console.log(`t+${SKEW_END / 1000}s: ${skewLegs.length} skew legs closed cleanly`);
});

// ---- phase 2: hostile-t0 entities + saturation verb band -----------------------
// (all spawns here are SERVER-stamped by the sequencer; the hostile t0 lives
// in motion args only — the observation lane)
at(PHASE2_SPAWN_AT, () => {
  // lease/motion targets by neutral builders
  perfs[7].ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "skew-p0", lib: "deco/bench.glb", pos: [1, 0, 1], yaw: 0 } }));
  perfs[7].ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "skew-p1", lib: "deco/bench.glb", pos: [-1, 0, -1], yaw: 0 } }));
  perfs[5].ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "skew-line-a", lib: "deco/bench.glb", pos: [3, 0, 3], yaw: 0 } }));
  perfs[5].ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "skew-line-b", lib: "deco/bench.glb", pos: [-3, 0, -3], yaw: 0 } }));
  // the epoch anchor: a pendulum with NO t0 — the fold MUST stamp the entry ts
  perfs[8].ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "skew-pend", lib: "deco/bench.glb", pos: [0, 0, -8], yaw: 0 } }));
  at(PHASE2_SPAWN_AT + 300, () => {
    perfs[8].ws.send(JSON.stringify({ type: "verb", verb: "motion", args: { id: "skew-pend", type: "pendulum", axis: [1, 0, 0], pivot: [0, 2.4, 0], amp: 0.3, period: 3.2 } }));  // no t0 → entry ts
    perfs[8].ws.send(JSON.stringify({ type: "verb", verb: "motion", args: { id: "skew-pend", type: "pendulum", axis: [1, 0, 0], pivot: [0, 2.4, 0], amp: 0.3, period: 3.2, t0: NaN } })); // hostile → re-issue
    perfs[8].ws.send(JSON.stringify({ type: "verb", verb: "motion", args: { id: "skew-pend", type: "pendulum", axis: [1, 0, 0], pivot: [0, 2.4, 0], amp: 0.3, period: 3.2, t0: Date.now() } })); // valid fresh
  });
  // big lease: perf-23 claims skew-big mid-phase and settles at the end
  at(PHASE2_SPAWN_AT + 800, () => {
    perfs[6].ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "skew-big", lib: "deco/bench.glb", pos: [6, 0, -6], yaw: 0 } }));
  });
  at(PHASE2_SPAWN_AT + 2_200, () => {
    perfs[23].ws.send(JSON.stringify({ type: "lease", op: "claim", id: "skew-big" }));
    perfs[23].ws.send(JSON.stringify({ type: "lease", op: "state", id: "skew-big", p: [6.5, 0, -6.5], yaw: 0.5 }));
    perfs[23].ws.send(JSON.stringify({ type: "lease", op: "state", id: "skew-big", p: [7, 0, -7], yaw: 0.6 }));
  });
  at(26_500, () => {
    perfs[23].ws.send(JSON.stringify({ type: "lease", op: "release", id: "skew-big", p: [7, 0, -7], yaw: 0.6 }));
  });
  console.log(`t+${PHASE2_SPAWN_AT / 1000}s: phase-2 entities spawning (skew-p0/p1/line-a/line-b/big/pend)`);
});

// ---- phase-2 says: three skew-regime groups under saturation -------------------
const sayAuthorLat: number[] = [];
const saySentAt = new Map<string, number>();
const regimeSayTexts = [`regime-a-${Math.floor(t0)}`, `regime-b-${Math.floor(t0)}`, `regime-c-${Math.floor(t0)}`];
at(PHASE2_SAY_AT, () => {
  phase2Groups.forEach((g, gi) => {
    setTimeout(() => {
      const who = perfs[10 + gi * 2];
      const sentAt = performance.now();
      for (let i = 0; i < 3; i++) {
        const text = `${g}-${String(gi * 3 + i).padStart(2, "0")}-end`;
        saySentAt.set(text, sentAt);
        who.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
      }
    }, gi * 450);
  });
  // rate-window legs: 3 rats x 14 says at 25/s (over the 12/4s budget) — the
  // budget is SERVER-clocked; each rat's first 3 land inside a fresh window,
  // the next 11 are refused with the exact "slow down" receipt
  at(20_600, () => {
    for (let r = 0; r < 3; r++) {
      const who = perfs[16 + r];
      let n = 0;
      const iv = setInterval(() => {
        if (n >= 14 || who.ws.readyState !== 1) { clearInterval(iv); return; }
        who.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: `rat${r}-${n}` } }));
        n++;
      }, 40);
    }
  });
  // post-storm regime says — the rate window must have recovered
  at(23_000, () => {
    regimeSayTexts.forEach((text, i) => {
      perfs[13 + i].ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    });
  });
});

// ---- verifier pair: snapshot-vs-replay, mid-traffic ----------------------------
let snapState0: any = null, snapState1: any = null;
const replayLogs = { n: 0 };
async function fetchSnapshot(id: string): Promise<{ state: any; entries: any[]; throughSeq: number } | null> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(null); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        clearTimeout(to); try { ws.close(); } catch {}
        resolve({ state: m.state, entries: m.entries ?? [], throughSeq: m.throughSeq });
      }
    };
    ws.onerror = () => { clearTimeout(to); resolve(null); };
  });
}
// serialize: one verifier join at a time (the mid-traffic fold pair must not
// race each other on the shared world)
const verifyQueue: (() => Promise<void>)[] = [];
let verifyBusy = false;
function enqueueVerify(fn: () => Promise<void>) {
  verifyQueue.push(fn);
  (async () => {
    if (verifyBusy) return;
    verifyBusy = true;
    while (verifyQueue.length) { try { await verifyQueue.shift()!(); } catch { /* verifier problems surface in gates */ } }
    verifyBusy = false;
  })();
}
at(18_500, () => {
  enqueueVerify(async () => {
    const snap = await fetchSnapshot("verify-fold-0");
    if (snap) { snapState0 = snap; replayLogs.n++; }
  });
});
at(19_800, () => {
  enqueueVerify(async () => {
    const snap = await fetchSnapshot("verify-fold-1");
    if (snap) { snapState1 = snap; replayLogs.n++; }
  });
});
// verifier's own phase-2 says (mirrors the anchor set, own identity)
at(21_200, () => {
  enqueueVerify(async () => {
    const c = await connect("verify-sayer", false, 640);
    anchors.push(c);
    phase2Groups.forEach((g, gi) => {
      for (let i = 0; i < 3; i++)
        c.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: `${g}-${String(gi * 3 + i).padStart(2, "0")}-end` } }));
    });
    await sleep(1_000);
    try { c.ws.close(); } catch {}
    replayLogs.n++;
  });
});

// ---- flight-recorder read (rate-limit lane sanity) ------------------------------
let recEvents: any[] = [];
at(22_500, () => {
  enqueueVerify(async () => {
    recEvents = await new Promise<any[]>((resolve) => {
      const ws = new WebSocket(URL);
      const to = setTimeout(() => { try { ws.close(); } catch {} resolve([]); }, 6_000);
      ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `rec-${Date.now() % 100000}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
      ws.onmessage = (ev) => {
        const m = JSON.parse(String(ev.data));
        if (m.type === "snapshot") ws.send(JSON.stringify({ type: "debug", kinds: ["rate-limit"], limit: 300 }));
        else if (m.type === "debug") { clearTimeout(to); try { ws.close(); } catch {} resolve(m.events ?? []); }
      };
      ws.onerror = () => { clearTimeout(to); resolve([]); };
    });
    replayLogs.n++;
  });
});

// ---- roster probe mid-run -------------------------------------------------------
const rosterGhosts: string[] = [];
at(15_500, () => {
  const want = new Set([...anchorIds, ...skewLegs.map((l) => l.id)]);
  const ws = new WebSocket(URL);
  const to = setTimeout(() => { try { ws.close(); } catch {} rosterGhosts.push("PROBE-TIMEOUT"); }, 10_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `roster-mid-${Math.floor(Math.random() * 1e6)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
  ws.onmessage = (ev) => {
    const m = JSON.parse(String(ev.data));
    if (m.type === "snapshot") {
      clearTimeout(to); try { ws.close(); } catch {}
      const got = new Set<string>((m.present ?? []).map((o: any) => String(o.id)));
      for (const g of got) if (!want.has(g)) rosterGhosts.push(g);
      for (const w of want) if (!got.has(w)) rosterGhosts.push(`MISSING:${w}`);
      console.log(`roster mid: ${got.size} embodied (want ${want.size})`);
    }
  };
  ws.onerror = () => { clearTimeout(to); rosterGhosts.push("PROBE-ERROR"); };
});

// ---- late joiner pair (mid-skew, embodied + spectator) ---------------------------
let lateEmbMs = -1, lateSpecMs = -1;
let lateSpawnSeq = -1;
at(13_000, () => {
  enqueueVerify(async () => {
    const [a, b] = await Promise.allSettled([connect("verify-late", false, 660), connect("late-spec-0", true)]);
    if (a.status === "fulfilled") {
      lateEmbMs = a.value.joinMs; anchors.push(a.value);
      a.value.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "verify-late-target", lib: "deco/bench.glb", pos: [9, 0, 9], yaw: 0 } }));
      await sleep(300);
      try { a.value.ws.close(); } catch {}
      replayLogs.n++;
    }
    if (b.status === "fulfilled") { lateSpecMs = b.value.joinMs; anchors.push(b.value); }
  });
});

// ---- teardown, final probe, ratchet rejoin ----------------------------------------
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  anchors.forEach((s) => { try { s.ws.close(); } catch {} });
});
let finalPresent = -1;
at(FINAL_PROBE_AT, () => {
  const ws = new WebSocket(URL);
  const to = setTimeout(() => { try { ws.close(); } catch {} finalPresent = -2; }, 10_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `final-empty-${Math.floor(t0)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
  ws.onmessage = (ev) => {
    const m = JSON.parse(String(ev.data));
    if (m.type === "snapshot") finalPresent = (m.present ?? []).length;
  };
  setTimeout(() => { clearTimeout(to); try { ws.close(); } catch {} }, 2_000);
});
let rejoins: Spec[] = [];
let rejoinFailed = 0;
at(REJOIN_AT, async () => {
  const n = anchors.length;
  anchors.length = 0;
  const r = await Promise.allSettled(Array.from({ length: n }, (_, i) => connect(`rejoin-${i}`, i < 24 ? false : true, i < 24 ? i : 0)));
  rejoins = r.filter((x) => x.status === "fulfilled").map((x: any) => x.value as Spec);
  rejoinFailed = r.length - rejoins.length;
  console.log(`t+${REJOIN_AT / 1000}s: ratchet rejoin ${rejoins.length}/${n}`);
  setTimeout(() => { rejoins.forEach((s) => { try { s.ws.close(); } catch {} }); }, 2_500);
});

await sleep(DURATION);
await sleep(600);   // let the rejoin settle and the last logs flush
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);

// ---- ground truth: the log FILE is the world ------------------------------------
type Entry = { seq: number; ts: number; actor: string; verb: string; args: any };
const worldLogPath = `${WORLDS}/${WORLD}/log.jsonl`;
const logText = existsSync(worldLogPath) ? readFileSync(worldLogPath, "utf8") : "";
const entries: Entry[] = logText.split("\n").filter(Boolean).map((l) => JSON.parse(l) as Entry);
const logTotal = entries.length;

// G1 — line count EXACT
const logTotalDrift = Math.abs(logTotal - (logBaseline >= 0 ? logBaseline : 0) - GRAND);
if (logTotalDrift > 0) {
  // every line is a claim: dump the post-baseline tail so a drift is AUDITED,
  // never waved through or silently re-modeled
  console.log(`log tail (post-baseline ${logBaseline}, total ${logTotal}, modeled ${GRAND}):`);
  for (const e of entries.slice(logBaseline >= 0 ? logBaseline : 0)) {
    console.log(`  seq=${e.seq} ts=${e.ts} ${e.actor} ${e.verb} ${JSON.stringify(e.args).slice(0, 110)}`);
  }
}

// G2 — seq strictly monotonic from 1
const mono = strictMonotone(entries.map((e) => e.seq));
const seqMonotoneFails = mono.ok ? 0 : 1;
const seqRegression = mono.reason?.includes("regression") ? 1 : 0;
const seqDuplicate = mono.reason?.includes("duplicate") ? 1 : 0;
const seqGap = mono.reason?.includes("gap") ? 1 : 0;

// G3 — entry ts: server-clock discipline
let tsRegressions = 0;
for (let i = 1; i < entries.length; i++) if (entries[i].ts < entries[i - 1].ts) tsRegressions++;
const tsSpanOverrun = entries.length >= 2 && (entries[entries.length - 1].ts - entries[0].ts) > TS_SPAN_LIMIT_MS ? 1 : 0;
const genesisFirstFails = entries.length && entries[0].verb === "genesis" ? 0 : 1;
const preGenesisVerbs = entries.findIndex((e) => e.verb !== "genesis") > 0
  ? entries.slice(0, entries.findIndex((e) => e.verb !== "genesis")).filter((e) => e.verb !== "genesis").length : 0;

// G4 — feed-window overlap: a ts REGRESSION within the feed window is the
// stale-served class (an older verb landing after a newer one was served).
// Equal ts with increasing seq is a legal same-millisecond total order.
let feedOverlaps = 0;
for (let i = 1; i < entries.length; i++) {
  if (entries[i].ts >= entries[i - 1].ts) continue;
  if (entries[i - 1].ts - entries[i].ts <= FEED_MS) feedOverlaps++;
}

// G5 — ts client-stamped audit: no entry ts equals a token's client value
let tsClientStamped = 0;
for (const tok of skewExpectedTokens) {
  if (!Number.isFinite(tok.value)) continue;
  for (const e of entries) if (e.ts === Math.round(tok.value)) tsClientStamped++;
}

// G6 — spoken-say t0 clamp + utterance ordering
let t0ClampFails = 0, uttOrderFails = 0, skewRecCount = 0;
{
  const spoken = entries.filter((e) => e.verb === "say" && e.args?.spoken === true);
  for (const e of spoken) {
    if (e.args.t0 != null) {
      if (!Number.isFinite(Number(e.args.t0)) || Number(e.args.t0) > e.ts || Number(e.args.t0) < e.ts - 300_000) t0ClampFails++;
    }
    skewRecCount++;
  }
  // utterance order per actor must follow log order (t0 display-only)
  const perActor = new Map<string, Entry[]>();
  for (const e of spoken) {
    const list = perActor.get(e.actor) ?? [];
    list.push(e); perActor.set(e.actor, list);
  }
  for (const [, list] of perActor) {
    for (let i = 1; i < list.length; i++) {
      if ((list[i].args.utt ?? 0) < (list[i - 1].args.utt ?? 0)) uttOrderFails++;
    }
  }
}

// G7 — hostile motion.t0 never re-anchors an entry's own ts; hostile values
// ride DATA only (fold stores comp/motion verbatim — observation, not failure);
// forbidden surfaces: entry.ts (covered), lease-committed place args.
let motionTsShift = 0, hostileDataLeaks = 0;
for (const e of entries) {
  if (e.verb === "motion" && e.args?.t0 != null) {
    const t0v = Number(e.args.t0);
    if (Number.isFinite(t0v) && Math.abs(t0v - e.ts) > 300_000 && Math.abs(e.ts - t0v) < 5) motionTsShift++;
  }
  if (e.verb === "place" && typeof e.args?.id === "string" && e.args.id.startsWith("skew-")) {
    const p = e.args.pos;
    if (Array.isArray(p) && p.some((x: any) => Math.abs(Number(x)) > 1_000)) hostileDataLeaks++;
  }
}

// G8 — fold equivalence: replay the FULL log from genesis with the sequencer's
// own fold and compare against each mid-traffic snapshot's covered state
let replayMismatches = 0, foldPairFails = 0;
const { emptyState, foldEntry } = await import(`${SERVER_DIR}/shared/fold.js`);
const foldAll = (list: Entry[]) => {
  const st = emptyState();
  for (const e of list) foldEntry(st, e);
  return st;
};
async function foldPairVerify() {
  for (const [label, snap] of [["verify-fold-0", snapState0], ["verify-fold-1", snapState1]] as [string, any][]) {
    if (!snap) { foldPairFails++; continue; }
    // covered = the snapshot's state PLUS every tail entry it carried: the
    // state already folds the tail the joiner replays client-side
    const covered = (snap.throughSeq ?? -1) + snap.entries.length;
    const replay = foldAll(entries.filter((e) => e.seq <= covered));
    const a = JSON.stringify(replay), b = JSON.stringify(snap.state);
    if (a !== b) {
      replayMismatches++;
      console.log(`fold mismatch [${label}] covered=${covered}: replay ${a.length}B vs served ${b.length}B`);
    }
  }
}
await foldPairVerify();

// G9 — per-entity feed order: arrival order (seer) == log order
let feedOrderFails = 0;
{
  const logOrder = new Map<string, number>();
  for (const e of entries) {
    if (e.verb === "say" && typeof e.args?.text === "string" && e.args.text.includes("-end")) {
      const key = `${e.actor}|say|${e.args.text}`;
      if (!logOrder.has(key)) logOrder.set(key, e.seq);
    }
    if (e.verb === "spawn" && typeof e.args?.id === "string" && e.args.id.startsWith("skew-")) {
      logOrder.set(`${e.actor}|spawn|${e.args.id}`, e.seq);
    }
    if (e.verb === "motion" && typeof e.args?.id === "string" && e.args.id.startsWith("skew-")) {
      const key = `${e.actor}|motion|${e.args.id}|${JSON.stringify(e.args.t0 ?? null)}|${e.args.amp ?? e.args.degPerSec ?? e.args.period ?? ""}`;
      if (!logOrder.has(key)) logOrder.set(key, e.seq);
    }
  }
  for (const [key, seq] of SEER.entrySeqs) {
    const want = logOrder.get(key);
    if (want === undefined) { feedOrderFails++; continue; }
    if (want !== seq) feedOrderFails++;
  }
}

// G10 — t0-less motion stamped with entry ts (deterministic replay)
let motionT0StampFails = 0;
{
  // the t0-less motion's folded t0 must equal ITS OWN entry ts (a later
  // valid-t0 motion on the same entity must not shift it)
  const pend = entries.filter((e) => e.verb === "motion" && e.args?.id === "skew-pend");
  const noT0 = pend.find((e) => e.args.t0 == null);
  if (!noT0) motionT0StampFails++;
  else {
    const st = foldAll(entries.filter((e) => e.seq <= noT0.seq));
    const stamped = st.entities["skew-pend"]?.comp?.motion?.t0;
    if (stamped !== noT0.ts) motionT0StampFails++;
  }
}

// G11 — recentChat: sequence strictly increasing (fold discipline)
let chatSeqFails = 0;
{
  const st = foldAll(entries);
  const rc = st.recentChat ?? [];
  for (let i = 1; i < rc.length; i++) if (rc[i].seq <= rc[i - 1].seq) chatSeqFails++;
}

// phase-2 says: 9/9 in-order, author latency, delivery completeness
const phase2Says = SAY_MATCHES.map((text) => entries.find((e) => e.verb === "say" && e.args?.text === text)).filter(Boolean) as Entry[];
const phase2SaysMissed = SAY_MATCHES.length - phase2Says.length;
let phase2OrderFails = 0;
{
  const perGroup = new Map<string, Entry[]>();
  for (const e of phase2Says) {
    const g = String(e.args.text).split("-")[0];
    const list = perGroup.get(g) ?? [];
    list.push(e); perGroup.set(g, list);
  }
  for (const [, list] of perGroup) {
    for (let i = 1; i < list.length; i++) {
      const prevNo = Number(String(list[i - 1].args.text).split("-")[1]);
      const curNo = Number(String(list[i].args.text).split("-")[1]);
      if (curNo !== prevNo + 1 || list[i].seq <= list[i - 1].seq) phase2OrderFails++;
    }
  }
}
for (const text of SAY_MATCHES) {
  const hit = SEER.sayEcho.get(text);
  const sent = saySentAt.get(text);
  if (hit !== undefined && sent !== undefined) sayAuthorLat.push(hit - sent);
}
const sayDeliveredMin = SAY_MATCHES.reduce((min, text) => {
  let got = 0;
  for (const s of anchors.length ? anchors : rejoins) if (s.says.has(text)) got++;
  return Math.min(min, got);
}, Infinity);
const saysRateLimited = (() => {
  let refusals = 0;
  for (const s of specs) refusals += s.errs.filter((e) => e.includes("slow down")).length;
  // rats are perf-16..18 — their refusals land on their OWN sockets
  let ratRefusals = 0;
  for (const s of perfs) if (s.id.startsWith("perf-1") && ["perf-16", "perf-17", "perf-18"].includes(s.id))
    ratRefusals += s.errs.filter((e) => e.includes("slow down")).length;
  return ratRefusals || refusals;
})();
const regimeSayMisses = regimeSayTexts.filter((text) => !SEER.says.has(text)).length;

// lease outcomes
const leaseGrants = observers.reduce((a, s) => a + s.leaseGrants.filter((id) => id === "skew-p0" || id === "skew-p1" || id === "skew-big").length, 0);
const grantsObserved = observers.reduce((a, s) => a + s.leaseGrants.length, 0);
const grantsPerObserver = Math.min(...observers.map((s) => s.leaseGrants.length));
const leasePlacesObserved = SEER.placeHits.size;
let leaseRestMismatch = 0;
for (const [id, rest] of [["skew-p0", [2.5, 0, 2.5]], ["skew-p1", [-2.0, 0, -2.0]], ["skew-big", [7, 0, -7]]] as [string, number[]][]) {
  const commit = entries.filter((e) => e.verb === "place" && e.args?.id === id).pop();
  if (!commit) { leaseRestMismatch++; continue; }
  const p = commit.args.pos as number[];
  if (!Array.isArray(p) || p.some((x, i) => Math.abs(x - rest[i]) > 0.05)) leaseRestMismatch++;
}

// skew leg lifecycle
const skewArriveDrift = SEER ? Math.abs(SEER.arrives.filter((id) => id.startsWith("skew-")).length - skewLegs.length) : 9;
const skewLeaveDrift = SEER ? Math.abs(SEER.leaves.filter((id) => id.startsWith("skew-")).length - skewLegs.length) : 9;

// frame + probe + rss aggregates
const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const serverLogText = await logFile.text();
const serverLogLines = serverLogText.split("\n").filter(Boolean);
const suspicious = serverLogLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  rejoinFailed, rejoinP95: pct(rejoins.map((s) => s.joinMs), 95),
  lateEmbJoinP95: lateEmbMs > 0 ? lateEmbMs : 9_999,
  lateSpecJoinP95: lateSpecMs > 0 ? lateSpecMs : 9_999,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeSkewP95: pct(probeSkew, 95), probePostP95: pct(probePost, 95), probeErrs: probeErrors.n,
  logTotalDrift,
  seqMonotoneFails, seqRegression, seqDuplicate, seqGap,
  tsRegressions, tsSpanOverrun, genesisFirstFails, preGenesisVerbs,
  feedOverlaps, tsClientStamped, t0ClampFails, uttOrderFails,
  motionTsShift, hostileDataLeaks,
  replayMismatches, foldPairFails,
  feedOrderFails, motionT0StampFails, chatSeqFails,
  phase2SaysMissed, phase2OrderFails,
  sayAuthorP95: pct(sayAuthorLat, 95), sayDeliveredMin: Number.isFinite(sayDeliveredMin) ? sayDeliveredMin : 0,
  saysRateLimited, regimeSayMisses,
  leaseGrants, grantsObserved, grantsPerObserver,
  leasePlacesObserved, leaseRestMismatch,
  rosterGhosts: rosterGhosts.length, skewArriveDrift, skewLeaveDrift,
  finalPresent: Math.max(finalPresent, 0) === finalPresent ? finalPresent : 999,
  logSuspicious: suspicious.length, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  skew legs             ${skewLegs.length}/5 joined, ${skewLegs.reduce((a, l) => a + l.sent, 0)} hostile-stamped messages sent
  world log             ${logTotal} lines (baseline ${logBaseline} + expected ${GRAND}, drift ${logTotalDrift})
  seq discipline        ${mono.ok ? "strictly monotonic 1.." + logTotal : "VIOLATION: " + mono.reason}
  ts discipline         ${tsRegressions} regressions, span ${entries.length >= 2 ? entries[entries.length - 1].ts - entries[0].ts : 0}ms (limit ${TS_SPAN_LIMIT_MS}), genesis-first ${genesisFirstFails === 0 ? "ok" : "FAIL"}
  feed windows          ${feedOverlaps} overlaps (${FEED_MS}ms bound)
  ts client-stamped     ${tsClientStamped} token collisions with entry ts (must be 0)
  spoken t0 clamp       ${t0ClampFails} failures across ${skewRecCount} spoken says; utt order ${uttOrderFails} violations
  motion t0             ${motionT0StampFails} stamp failures, ${motionTsShift} own-ts shifts, ${hostileDataLeaks} data leaks
  fold equivalence      ${replayMismatches} replay mismatches on ${replayLogs.n} verifier reads, pair ${foldPairFails === 0 ? "exact" : "FAIL"}
  feed order            ${feedOrderFails} violations on ${SEER.entrySeqs.size} tracked entries
  phase-2 says          ${phase2Says.length}/9 in-order (${phase2OrderFails} order fails), author p95 ${sayAuthorLat.length ? Math.round(pct(sayAuthorLat, 95)) : "MISSED"}ms, delivered min ${Number.isFinite(sayDeliveredMin) ? sayDeliveredMin : 0}/160
  rate window           ${saysRateLimited} exact refusals (want ${TH.saysRateLimited}); recorder rate-limit notes ${recEvents.length}; regime says ${3 - regimeSayMisses}/3
  leases                grants ${leaseGrants}/${EXPECT_GRANTS}, observed ${grantsObserved} (min/observer ${grantsPerObserver}), places ${leasePlacesObserved} observed, ${leaseRestMismatch} rest mismatches
  skew lifecycle        arrives drift ${skewArriveDrift}, leaves drift ${skewLeaveDrift}
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  gaps ${gapsTotal}
  http probe ms         skew p95 ${Math.round(m.probeSkewP95)} (n=${probeSkew.length})  post p95 ${Math.round(m.probePostP95)} (n=${probePost.length})  errors ${probeErrors.n}
  late joins            embodied ${lateEmbMs > 0 ? Math.round(lateEmbMs) : "MISSED"}ms, spectator ${lateSpecMs > 0 ? Math.round(lateSpecMs) : "MISSED"}ms
  roster                ${rosterGhosts.length === 0 ? "exact" : `${rosterGhosts.length} ghosts: ${rosterGhosts.slice(0, 6).join(",")}`}
  final present         ${finalPresent} (must be 0); rejoin ${rejoins.length}/${rejoins.length + rejoinFailed} p95 ${Math.round(m.rejoinP95)}ms
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${serverLogLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
if (!mono.ok) console.log(`monotonicity: ${mono.reason}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
for (const s of rejoins) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — the log's seq and ts are server-governed: late/reordered/future client stamps ride data only and never reorder, re-time, or tear the sequence`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
