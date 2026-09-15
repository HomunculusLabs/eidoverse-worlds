// Pressure scenario 9: MEMORY RETURNS NEAR BASELINE after every synthetic
// participant leaves. Prior scenarios proved the presence plane (1), slow
// spectator isolation (2), join storms (3), authored responsiveness (4), verb
// rate-limiting (5), reconnect hygiene (6), world switching (7), and snapshot
// joins (8). This one asks what 250+ connections across two worlds LEAVE IN
// THE PROCESS: after everyone departs, RSS and heap must return to the quiet
// baseline (retention ≤ 2MB RSS / ≤ 4MB heap), a second full population must
// not ratchet the first (house#2 − house#1 ≤ 8MB), and every per-identity
// structure that keeps state across departures must be a DELIBERATE feature
// with observable, bounded arithmetic — the whisper hold queue is exactly
// that probe: whispers to absent recipients are held in memory (capped
// 20/recipient, per-world key), delivered and DELETED when the recipient
// rejoins.
//
// Legitimate survivors, counted so the band is honest (not waved through):
//   - poses.json entries (one per distinct embodied id, "wake where you fell
//     asleep") — ~60 ids ≈ 10KB
//   - held whispers never claimed — ~68 packets × ~4.1KB ≈ 280KB
//   - world #2's folded state (empty world, tiny)
// All under 1MB; the 2MB band exists for them and nothing else.
//
// Timeline (pinned before measuring — 192 peak concurrent, 250+ joins):
//   t=-5s→0  PRIME: throwaway spectator join creates world loadtest (genesis,
//            grant, fold, snapshot) + ~5s quiet baseline samples.
//   t=0      24 perf anchors (embodied @15Hz) + 136 spectator anchors join.
//   t=+8s    full-house memory sample #1.
//   t=+9s    CYCLE A: 32 cyc join, each whispers a 4KB hold to an absent
//            sleeper-i, stream @15Hz, exit +1.2s (16 clean/16 abrupt).
//   t=+14s   CYCLE B: same 32 ids rejoin (2nd hold per sleeper), exit mixed.
//   t=+19s   CYCLE C: zombie duel — 12 gen1 + 12 same-id gen2 (takeover
//            4002); gen2 each whisper-hold to sleeper-Ci, exit +1.8s.
//   t=+24s   DRAIN: sleeper-0..7 rejoin embodied — each must receive EXACTLY
//            their 2 held whispers on join (keys then deleted). Leave +1.5s.
//   t=+27s   steady full-house sample (informational).
//   t=+29s   TEARDOWN#1 clean (all 160 anchors close).
//   t=+29.5s SETTLE#1: quiet watch (≤12s) + forced full GC (/memory?gc=1) —
//            post-GC heapUsed must be back at baseline (JS plane clean) and
//            its RSS is the settled#1 reference for the ratchet gate.
//   t=+42s   full 160 REJOIN → t=+45.5s house sample #2 (informational).
//   t=+47.5s TEARDOWN#2 abrupt (terminate every socket).
//   t=+49s   AFTERWORLD: 8 fresh ids join world "empty" (world #2), whisper
//            8 more holds (per-world keys), leave clean +1.5s.
//   t=+51s   SETTLE#2: quiet watch (≤15s) + forced GC — post-GC heapUsed at
//            baseline again, and settled#2 RSS − settled#1 RSS bounded.
//   t=+66.5s FINAL PROBES: fresh spectator joins each world — present 0 and
//            ZERO frames in a 2s window; probe's own close prints the
//            describe() "0 present —" line.
//
// Measured platform baseline (this harness's own diagnostic, 2026-09-15):
// Bun/JSC retains a ONE-TIME native ramp of ~53MB RSS at the first 200-socket
// peak; identical later cycles add +2.8/+0.2/+1.9MB (converging plateau), and
// forced-GC heapUsed returns to baseline every cycle. The retention gates
// therefore pin the JS plane exactly and pin RSS as PLATEAU-not-ratchet:
//   - settled#2 RSS − settled#1 RSS ≤ 8MB (a per-join native/fd/timer leak of
//     ≥40KB would breach this across 248 joins)
//     peak − baseline ≤ 90MB (the ~53MB ramp + ~62MB observed peak headroom;
//     runaway per-connection buffering blows past this)
//   - heap gates pin PLATEAU-not-ratchet, mirroring the RSS law: settle#1
//     (first churn through cold code) ≤ baseline + 6MB — run-1 measured
//     +4.80MB once, decaying to +0.56MB at settle#2, the same one-time
//     warm-up signature as the native ramp; settle#2 (steady) ≤ baseline +
//     2MB, the strict no-per-participant-JS-state bound. A LEAK fails this
//     shape by failing settle#2, not settle#1.
//
// Whisper arithmetic (observable): holds = 32 (A) + 32 (B) + 12 (C gen2) +
// 8 (afterworld) = 84 "isn't here — they'll get it when they arrive" echoes;
// deliveries = 16 (sleeper-0..7 × 2 each) on drain-join. Arrive/leave
// arithmetic on the never-leaving seer spectator (original spec-0, connected
// t=0→29s, sees every wave): cyc arrives 88 (32+32+12+12) / leaves 76 (gen1
// superseded — re-arrival, never a leave), sleepers 8/8.
//
// Acceptance gates (pinned before measuring):
//   - anchors 160/160 join p95 < 3s; rejoin 160/160 p95 < 3s
//   - waves A 32/32, B 32/32, C 24/24; takeovers 12/12 (4002)
//   - roster after every wave: EXACTLY the 24 anchor ids (0 ghosts)
//   - whisper holds 84 echoes; sleeper deliveries 8/8 × exactly 2
//   - seer arrive drift 0 (96), leave drift 0 (84)
//   - both worlds empty at final probe: present 0, ZERO frames in 2s
//   - describe() "0 present, 0 watching" printed after the teardown byte-mark
//   - fairness: 3/3 mid-wave says appended, author p95 < 500ms
//   - presence health: fps p50 >= 12, frame lat p95 < 250ms, 0 seq gaps
//   - event loop: storm p95 < 500ms; post-settle quiet p95 < 100ms
//   - settle#1 fires ≤ 12s after teardown#1; settle#2 ≤ 15s after the last
//     departure (the native ramp decays in small steps; 1.5% band, 16/17)
//   - RETENTION: post-GC heapUsed settle#1 ≤ baseline + 6MB (warm) and
//     settle#2 ≤ baseline + 2MB (steady);
//     settled#2 RSS − settled#1 RSS ≤ 8MB; peak − baseline ≤ 90MB;
//     boot quiet |min − ready| ≤ 4MB
//   - world logs: loadtest 5 lines (genesis+grant+3 says), empty 2
//     (genesis+grant) — drift 0; participant churn adds ZERO log lines
//   - 0 suspicious server log lines
//
//   SERVER_DIR=/tmp/pressure9-wt PORT=8997 bun tools/pressure-memory.ts
//   SELFTEST=1 bun tools/pressure-memory.ts   # gate RED/GREEN proof, no server
//
// The harness EXPECTS the scratch tree's routes.ts to carry a read-only
// /memory route (process.memoryUsage()). That patch lives ONLY in the /tmp
// worktree (PRESSURE9-SCRATCH comment) — it is never committed; production
// keeps no memory-introspection surface.
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure9-wt";
const PORT = Number(process.env.PORT ?? 8997);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure9-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const AFTER = "empty";
const N_PERF = 24, N_SPEC = 136;                    // 160 anchors
const N_CYC = 32, N_DUEL = 12, N_SLEEP = 8;         // waves + drain
const POSE_HZ = 15;
const T_QUIET = 5_000;                              // quiet baseline window (pre-join)
const T_HOUSE1 = 8_000;                             // full-house sample #1
const T_WAVE_A = 9_000, T_WAVE_B = 14_000, T_WAVE_C = 19_000;
const T_DRAIN = 24_000;
const T_STEADY = 27_000;                            // steady full-house (informational)
const T_TEARDOWN1 = 29_000;
const T_SETTLE1 = 29_500;                             // settle#1 window (≤12s + GC)
const T_REJOIN = 42_000;
const T_HOUSE2 = 45_500;                              // house sample #2 (informational)
const T_TEARDOWN2 = 47_500;
const T_AFTER = 49_000;                               // afterworld wave
const T_SETTLE = 51_000;                              // settle#2 window
const SETTLE1_DEADLINE = 12_000;
const SETTLE_DEADLINE = 15_000;
const T_FINAL_PROBE = T_SETTLE + SETTLE_DEADLINE + 500;
const DURATION = T_FINAL_PROBE + 3_500;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..8
const SELFTEST = process.env.SELFTEST === "1";

// whisper arithmetic (header)
const EXPECT_HOLDS = N_CYC * 2 + N_DUEL + N_SLEEP;      // 84
const EXPECT_DELIVERS = N_SLEEP * 2;                    // 16
const EXPECT_SEER_ARRIVES = N_CYC * 2 + N_DUEL * 2 + N_SLEEP;  // 96
const EXPECT_SEER_LEAVES = N_CYC * 2 + N_DUEL + N_SLEEP;       // 84
const EXPECT_LOG = { [WORLD]: 2 + 3, [AFTER]: 2 };      // genesis+grant(+says)

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorTotal: 160, anchorJoinP95Ms: 3_000,
  rejoinTotal: 160, rejoinP95Ms: 3_000,
  waveA: 32, waveB: 32, waveC: 24, takeovers: 12,
  ghostClients: 0,
  holdEchoes: EXPECT_HOLDS,
  sleeperExact2: N_SLEEP,
  arriveDrift: 0, leaveDrift: 0,
  finalPresent: 0, finalFrames: 0,
  describeZero: true,
  saysAppended: 3, sayP95Ms: 500,
  fpsP50: POSE_HZ * 0.8, latP95Ms: 250, seqGaps: 0,
  probeStormP95Ms: 500, probeQuietP95Ms: 100,
  settle1Fired: true, settle1Secs: SETTLE1_DEADLINE / 1000,
  settle2Fired: true, settle2Secs: SETTLE_DEADLINE / 1000,
  heapPostGcWarmMB: 6, heapPostGcSteadyMB: 2, rejoinRatchetMB: 8,
  rssPeakGrowthMB: 90, quietStableMB: 4,
  logLineDrift: 0, logSuspicious: 0,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type MemSample = { rss: number; heapUsed: number; heapTotal?: number; external?: number };    // bytes
type Measurements = {
  anchors: number; anchorP95: number;
  rejoins: number; rejoinP95: number;
  waveA: number; waveB: number; waveC: number; takeovers: number;
  ghostClients: number;
  holdEchoes: number; sleeperExact2: number;
  arriveDrift: number; leaveDrift: number;
  finalPresent: number; finalFrames: number; afterPresent: number; afterFrames: number;
  describeZero: boolean;
  saysAppended: number; sayP95: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeQuietP95: number;
  settle1Fired: boolean; settle1Secs: number;
  settle2Fired: boolean; settle2Secs: number;
  baseline: MemSample; settled1: MemSample; settled2: MemSample; house1: MemSample; house2: MemSample; peak: MemSample;
  quietStableMB: number; logLineDrift: number; logSuspicious: number;
  diagMissing: boolean;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  const MB = (b: number) => b / 1024 / 1024;
  if (m.diagMissing) fail.push(`diagnostic missing — scratch tree has no /memory route (re-patch routes.ts)`);
  if (m.anchors < TH.anchorTotal) fail.push(`anchors joined ${m.anchors}/${TH.anchorTotal}`);
  if (m.anchorP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.rejoins < TH.rejoinTotal) fail.push(`rejoin wave ${m.rejoins}/${TH.rejoinTotal}`);
  if (m.rejoinP95 > TH.rejoinP95Ms) fail.push(`rejoin p95 ${Math.round(m.rejoinP95)}ms > ${TH.rejoinP95Ms}ms`);
  if (m.waveA < TH.waveA) fail.push(`wave A joins ${m.waveA}/32`);
  if (m.waveB < TH.waveB) fail.push(`wave B rejoins ${m.waveB}/32`);
  if (m.waveC < TH.waveC) fail.push(`wave C joins ${m.waveC}/24 (12 gen1 + 12 gen2)`);
  if (m.takeovers < TH.takeovers) fail.push(`zombie takeovers ${m.takeovers}/12 — 4002 did not fire`);
  if (m.ghostClients > TH.ghostClients) fail.push(`${m.ghostClients} GHOST CLIENTS in a post-wave roster`);
  if (m.holdEchoes !== TH.holdEchoes) fail.push(`whisper holds ${m.holdEchoes} != ${TH.holdEchoes} — held queue arithmetic drifted`);
  if (m.sleeperExact2 < TH.sleeperExact2) fail.push(`sleeper drain ${m.sleeperExact2}/${TH.sleeperExact2} received EXACTLY 2 held whispers — delivery or deletion is wrong`);
  if (m.arriveDrift > TH.arriveDrift) fail.push(`seer arrive drift ${m.arriveDrift} (expected ${EXPECT_SEER_ARRIVES})`);
  if (m.leaveDrift > TH.leaveDrift) fail.push(`seer leave drift ${m.leaveDrift} (expected ${EXPECT_SEER_LEAVES}) — ghost leaves or lost leaves`);
  if (m.finalPresent > TH.finalPresent) fail.push(`${m.finalPresent} embodied in final ${WORLD} probe — world not empty`);
  if (m.finalFrames > TH.finalFrames) fail.push(`${m.finalFrames} frames in the empty ${WORLD} — pose state still live`);
  if (m.afterPresent > TH.finalPresent) fail.push(`${m.afterPresent} embodied in final ${AFTER} probe`);
  if (m.afterFrames > TH.finalFrames) fail.push(`${m.afterFrames} frames in the empty ${AFTER}`);
  if (!m.describeZero) fail.push(`server describe() never showed an empty world ("0 present", no watchers) after teardown`);
  if (m.saysAppended < TH.saysAppended) fail.push(`mid-wave says ${m.saysAppended}/3 — churn stalled authored verbs`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`mid-wave say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps`);
  if (m.probeStormP95 > TH.probeStormP95Ms) fail.push(`storm HTTP probe p95 ${Math.round(m.probeStormP95)}ms > ${TH.probeStormP95Ms}ms`);
  if (m.probeQuietP95 > TH.probeQuietP95Ms) fail.push(`post-settle quiet probe p95 ${Math.round(m.probeQuietP95)}ms > ${TH.probeQuietP95Ms}ms — something still churning`);
  if (!m.settle1Fired) fail.push(`memory never settled after teardown#1 (1.5% band, ${TH.settle1Secs}s)`);
  if (m.settle1Secs > TH.settle1Secs) fail.push(`settle#1 took ${m.settle1Secs.toFixed(1)}s > ${TH.settle1Secs}s`);
  if (!m.settle2Fired) fail.push(`memory never settled into a 1.5% band within ${TH.settle2Secs}s of the last departure`);
  if (m.settle2Secs > TH.settle2Secs) fail.push(`settle#2 took ${m.settle2Secs.toFixed(1)}s > ${TH.settle2Secs}s`);
  const heap1 = Math.max(0, MB(m.settled1.heapUsed - m.baseline.heapUsed));
  if (heap1 > TH.heapPostGcWarmMB) fail.push(`POST-GC HEAP RETENTION (settle#1 warm-up) ${heap1.toFixed(2)}MB > ${TH.heapPostGcWarmMB}MB — per-participant JS state survived collection`);
  const heap2 = Math.max(0, MB(m.settled2.heapUsed - m.baseline.heapUsed));
  if (heap2 > TH.heapPostGcSteadyMB) fail.push(`POST-GC HEAP RETENTION (settle#2 steady) ${heap2.toFixed(2)}MB > ${TH.heapPostGcSteadyMB}MB — per-participant JS state survived collection into cycle 2`);
  const ratchet = Math.max(0, MB(m.settled2.rss - m.settled1.rss));
  if (ratchet > TH.rejoinRatchetMB) fail.push(`REJOIN RATCHET ${ratchet.toFixed(2)}MB > ${TH.rejoinRatchetMB}MB — identical population cycles cost more each time`);
  const peakGrow = Math.max(0, MB(m.peak.rss - m.baseline.rss));
  if (peakGrow > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${peakGrow.toFixed(1)}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.quietStableMB > TH.quietStableMB) fail.push(`boot quiet drifted ${m.quietStableMB.toFixed(2)}MB > ${TH.quietStableMB}MB from ready`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`world log line drift ${m.logLineDrift} — churn must append nothing beyond says+genesis`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  return fail;
}

if (SELFTEST) {
  const base: MemSample = { rss: 88_000_000, heapUsed: 30_000_000 };
  const healthy: Measurements = {
    anchors: 160, anchorP95: 41, rejoins: 160, rejoinP95: 55,
    waveA: 32, waveB: 32, waveC: 24, takeovers: 12,
    ghostClients: 0, holdEchoes: 84, sleeperExact2: 8,
    arriveDrift: 0, leaveDrift: 0,
    finalPresent: 0, finalFrames: 0, afterPresent: 0, afterFrames: 0,
    describeZero: true, saysAppended: 3, sayP95: 8,
    fpsP50: 14.5, latP95: 10, gaps: 0,
    probeStormP95: 12, probeQuietP95: 6,
    settle1Fired: true, settle1Secs: 3.1,
    settle2Fired: true, settle2Secs: 4.2,
    baseline: base,
    settled1: { rss: base.rss + 53 * 1024 * 1024, heapUsed: base.heapUsed + 0.9 * 1024 * 1024 },
    settled2: { rss: base.rss + 55 * 1024 * 1024, heapUsed: base.heapUsed + 1.1 * 1024 * 1024 },
    house1: { rss: base.rss + 20 * 1024 * 1024, heapUsed: 0 },
    house2: { rss: base.rss + 22 * 1024 * 1024, heapUsed: 0 },
    peak: { rss: base.rss + 62 * 1024 * 1024, heapUsed: 0 },
    quietStableMB: 1.1, logLineDrift: 0, logSuspicious: 0, diagMissing: false,
  };
  const breach = (over: Partial<Measurements>): string[] => evaluate({ ...healthy, ...over });
  const checks: [string, string[]][] = [
    [`diag`, breach({ diagMissing: true })],
    [`anchors`, breach({ anchors: 158 })],
    [`anchorP95`, breach({ anchorP95: 4_100 })],
    [`rejoins`, breach({ rejoins: 150 })],
    [`waveA`, breach({ waveA: 30 })],
    [`waveC`, breach({ waveC: 20 })],
    [`takeovers`, breach({ takeovers: 9 })],
    [`ghosts`, breach({ ghostClients: 2 })],
    [`holds`, breach({ holdEchoes: 80 })],
    [`drain`, breach({ sleeperExact2: 6 })],
    [`arriveDrift`, breach({ arriveDrift: 3 })],
    [`leaveDrift`, breach({ leaveDrift: 5 })],
    [`finalPresent`, breach({ finalPresent: 4 })],
    [`finalFrames`, breach({ finalFrames: 7 })],
    [`afterPresent`, breach({ afterPresent: 1 })],
    [`describe`, breach({ describeZero: false })],
    [`says`, breach({ saysAppended: 1 })],
    [`sayP95`, breach({ sayP95: 900 })],
    [`fps`, breach({ fpsP50: 9 })],
    [`lat`, breach({ latP95: 400 })],
    [`gaps`, breach({ gaps: 4 })],
    [`stormProbe`, breach({ probeStormP95: 800 })],
    [`quietProbe`, breach({ probeQuietP95: 300 })],
    [`settle1Fired`, breach({ settle1Fired: false, settle1Secs: 99 })],
    [`settle2Fired`, breach({ settle2Fired: false, settle2Secs: 99 })],
    [`heap1`, breach({ settled1: { rss: 0, heapUsed: base.heapUsed + 9 * 1024 * 1024 } })],
    [`heap2`, breach({ settled2: { rss: 0, heapUsed: base.heapUsed + 3 * 1024 * 1024 } })],
    [`ratchet`, breach({ settled2: { rss: healthy.settled1.rss + 30 * 1024 * 1024, heapUsed: 0 } })],
    [`peak`, breach({ peak: { rss: base.rss + 120 * 1024 * 1024, heapUsed: 0 } })],
    [`quietStable`, breach({ quietStableMB: 7 })],
    [`logDrift`, breach({ logLineDrift: 2 })],
    [`suspicious`, breach({ logSuspicious: 3 })],
  ];
  const wantSub = [`diagnostic missing`, `anchors joined`, `anchor join p95`, `rejoin wave`, `wave A`, `wave C`, `takeovers`, `GHOST CLIENTS`, `whisper holds`, `sleeper drain`, `arrive drift`, `leave drift`, `world not empty`, `pose state still live`, `final empty probe`, `describe() never`, `authored verbs`, `say author p95`, `fps p50`, `frame latency p95`, `seq gaps`, `storm HTTP`, `still churning`, `never settled after teardown#1`, `never settled into`, `settle#1 took`, `settle#2 took`, `POST-GC HEAP RETENTION`, `REJOIN RATCHET`, `peak growth`, `boot quiet drifted`, `log line drift`, `suspicious server log`];
  const missing = checks.filter(([, f]) => f.length === 0).map(([n]) => n);
  const uncovered = wantSub.filter((w) => !checks.some(([, f]) => f.some((line) => line.includes(w))));
  const healthyFail = evaluate(healthy);
  const ok = missing.length === 0 && uncovered.length === 0 && healthyFail.length === 0;
  console.log(ok
    ? `SELFTEST PASS — healthy clean; all ${checks.length} breach probes fire (${wantSub.length} distinct gate strings)`
    : `SELFTEST FAIL — healthy=[${healthyFail}] no-fire=[${missing}] uncovered=[${uncovered}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf anchors @ ${POSE_HZ}Hz + ${N_SPEC} spectator anchors = 160 persistent; CYCLE A ${N_CYC} join/whisper-hold/exit (16 clean/16 abrupt); B same ids rejoin (2nd hold); C zombie duel ${N_DUEL}+${N_DUEL} (takeover 4002); DRAIN sleeper-0..7 rejoin (deliver 2 held whispers each, delete keys); teardown clean → full 160 REJOIN (ratchet) → teardown abrupt; AFTERWORLD ${N_SLEEP} ids create+empty world "${AFTER}" (8 more holds). Whisper arithmetic: holds=${EXPECT_HOLDS} delivers=${EXPECT_DELIVERS}; seer arrives=${EXPECT_SEER_ARRIVES} leaves=${EXPECT_SEER_LEAVES}. Settle: 16/17 samples in 1.5% band ≤ ${SETTLE_DEADLINE / 1000}s. Retention: post-GC heap ≤ baseline+${TH.heapPostGcWarmMB}MB warm (settle#1, first-churn one-time) / +${TH.heapPostGcSteadyMB}MB steady (settle#2), ratchet settled#2−settled#1 ≤ +${TH.rejoinRatchetMB}MB, peak − baseline ≤ +${TH.rssPeakGrowthMB}MB. ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=${TH.anchorTotal}@p95<${TH.anchorJoinP95Ms}ms rejoin=${TH.rejoinTotal} waves=${TH.waveA}/${TH.waveB}/${TH.waveC}@${TH.takeovers}x4002 ghosts=${TH.ghostClients} holds=${TH.holdEchoes} drain=${TH.sleeperExact2}x2 drift=${TH.arriveDrift}/${TH.leaveDrift} empty=present0+frames0 describe=0-present says=${TH.saysAppended}@p95<${TH.sayP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} probeStorm<${TH.probeStormP95Ms}ms quiet<${TH.probeQuietP95Ms}ms settle#1≤${TH.settle1Secs}s settle#2≤${TH.settle2Secs}s postGcHeap<+${TH.heapPostGcWarmMB}MBwarm/+${TH.heapPostGcSteadyMB}MBsteady ratchet<${TH.rejoinRatchetMB}MB peak<+${TH.rssPeakGrowthMB}MB quietStable<${TH.quietStableMB}MB logDrift=${TH.logLineDrift} suspicious=${TH.logSuspicious}`);

// ---- fd budget: 192 peak client sockets must fit -------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-memory.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure9-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
const server = Bun.spawn({
  cmd: ["bun", "run", "server/server.ts"],
  cwd: SERVER_DIR,
  env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR },
  stdout: logFile, stderr: logFile,
});
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MB = (b: number) => Math.round(b / 1024 / 1024);
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
let ready = false;
for (let i = 0; i < 60 && !ready; i++) {
  await sleep(250);
  try { const res = await fetch(`http://127.0.0.1:${PORT}/geom?world=x`); ready = res.status > 0; } catch { /* booting */ }
}
if (!ready) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }

// /memory diagnostic — the scratch tree must carry the PRESSURE9-SCRATCH route
let diagMissing = false;
async function memProbe(gc = false): Promise<MemSample | null> {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/memory${gc ? "?gc=1" : ""}`);
    if (!r.ok) return null;
    const j = await r.json();
    if (typeof j?.rss !== "number") return null;
    return { rss: j.rss, heapUsed: j.heapUsed ?? 0, heapTotal: j.heapTotal, external: j.external };
  } catch { return null; }
}
const memReady = await memProbe();
if (!memReady) diagMissing = true;
console.log(`sequencer ready pid=${server.pid} mem=${memReady ? `${MB(memReady.rss)}MB rss / ${MB(memReady.heapUsed)}MB heap` : "MISSING /memory"} (log: ${logPath})`);

// memory series (1s cadence): quiet pre-join window, then continuous
const quiet: MemSample[] = [];
let anchorsStarted = false;
let peakS: MemSample = memReady ?? { rss: NaN, heapUsed: NaN };
const memTimer = setInterval(async () => {
  const m = await memProbe();
  if (!m) return;
  if (!anchorsStarted) quiet.push(m);
  if (!Number.isFinite(peakS.rss) || m.rss > peakS.rss) peakS = m;
}, 1_000);

// prime the world with a throwaway spectator join (genesis + grant + fold +
// any lazy caches — none of that may be billed to the churn cycles)
{
  const p = await new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("prime timeout")); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "prime-probe", avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => { if (JSON.parse(String(ev.data)).type === "snapshot") { clearTimeout(to); resolve(ws); } };
    ws.onerror = () => { clearTimeout(to); reject(new Error("prime error")); };
  });
  await sleep(400);
  try { p.close(); } catch {}
}
const quietStart = performance.now();   // quiet baseline window opens (post-prime)

// ---- client chassis (reconnect/snapjoin-proven, whisper instruments added) -----
let holdEchoTotal = 0;   // global: wave specs are closure-local, the counter is not
type Spec = {
  ws: WebSocket; id: string; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number; closedAt: number;
  closed: boolean; closeCode: number;
  arrives: string[]; leaves: string[];
  whisperGot: { from: string; text: string }[];   // whispers DELIVERED to me
  sayEcho: Map<string, number>;
  errs: string[];
};
function connect(id: string, spectate: boolean, n = 0, world = WORLD): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(),
      openAt: performance.now(), snapAt: 0, closedAt: 0, closed: false, closeCode: 0,
      arrives: [], leaves: [], whisperGot: [], sayEcho: new Map(), errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapAt = performance.now();
        s.joinMs = s.snapAt - s.openAt;
        for (const e of m.entries ?? []) if (e.verb === "say") s.says.add(e.args?.text);
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "log") {
        const v = m.entry?.verb, a = m.entry?.args;
        if (v === "say") { s.says.add(a?.text); if (!s.sayEcho.has(a?.text)) s.sayEcho.set(a?.text, performance.now()); }
      } else if (m.type === "arrive") {
        s.arrives.push(String(m.id ?? ""));
      } else if (m.type === "leave") {
        s.leaves.push(String(m.id ?? ""));
      } else if (m.type === "whisper" && !m.echo) {
        s.whisperGot.push({ from: String(m.from ?? ""), text: String(m.text ?? "") });
      } else if (m.type === "error" && String(m.error ?? "").includes("when they arrive")) {
        holdEchoTotal++;
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = (ev) => { s.closed = true; s.closedAt = performance.now(); s.closeCode = Number(ev.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}
function exitClean(s: Spec) {
  try {
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "pose", pose: { p: [40, 0, 40], yaw: 0, speed: 0, clip: "idle" } }));
    s.ws.close();
  } catch { /* already gone */ }
}
let abruptMethod = "close-fallback";
function exitAbrupt(s: Spec) {
  const w = s.ws as unknown as { terminate?: () => void };
  try {
    if (typeof w.terminate === "function") { w.terminate(); abruptMethod = "terminate"; return; }
  } catch { /* fall through */ }
  try { s.ws.close(); } catch { /* already gone */ }
}
const WHISPER_TEXT = "w".repeat(4000);   // max-length held payload

// ---- the run -------------------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
let baseline: MemSample = { rss: NaN, heapUsed: NaN };
let house1: MemSample = { rss: NaN, heapUsed: NaN };
let house2: MemSample = { rss: NaN, heapUsed: NaN };
let steadyS: MemSample = { rss: NaN, heapUsed: NaN };
let settled1: MemSample = { rss: NaN, heapUsed: NaN };
let settled2: MemSample = { rss: NaN, heapUsed: NaN };
let settle1Fired = false, settle1Secs = 999;
let settle2Fired = false, settle2Secs = 999;

// anchors (after the quiet window closes; t0 is pinned at anchor-join below)
await sleep(Math.max(200, T_QUIET - (performance.now() - quietStart)));
baseline = (await memProbe()) ?? (quiet.length ? quiet[quiet.length - 1] : baseline);
anchorsStarted = true;
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, false, i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
console.log(`t+${((performance.now() - t0) / 1000).toFixed(1)}s: anchors joined ${anchors.length}/${all.length} — p50 ${Math.round(pct(anchors.map((s) => s.joinMs), 50))}ms p95 ${Math.round(pct(anchors.map((s) => s.joinMs), 95))}ms`);
const anchorIds = new Set(perfs.map((s) => s.id));
console.log(`quiet baseline: rss ${MB(baseline.rss)}MB heap ${MB(baseline.heapUsed)}MB (${quiet.length} pre-join samples)`);

// embodied presence: 24 broadcasters @ 15Hz (same shape as pressure-1..8)
let running = true;
const posesSent = { n: 0 };
const tickers = [...perfs].map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// HTTP event-loop health probe throughout (storm = churn+rejoin, quiet = post-settle)
const probeStorm: number[] = [], probeQuiet: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  const d = performance.now() - t;
  (performance.now() - t0 < T_TEARDOWN2 ? probeStorm : probeQuiet).push(d);
}, 500);

// churn bookkeeping
let waveAJoins = 0, waveBJoins = 0, waveCJoins = 0, duelTakeovers = 0;
const rosterGhosts: string[] = [];
let rejoinCount = 0;
const rejoinTimes: number[] = [];
let reanchors: Spec[] = [];
let drainExact2 = -1;

async function rosterProbe(label: string): Promise<Set<string>> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(new Set(["PROBE-TIMEOUT"])); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `roster-${label}-${Math.floor(Math.random() * 1e6)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        clearTimeout(to); try { ws.close(); } catch {}
        resolve(new Set((m.present ?? []).map((o: any) => String(o.id))));
      }
    };
    ws.onerror = () => { clearTimeout(to); resolve(new Set(["PROBE-ERROR"])); };
  });
}
function checkRoster(set: Set<string>, label: string) {
  const ghosts = [...set].filter((id) => !anchorIds.has(id));
  rosterGhosts.push(...ghosts);
  const missing = [...anchorIds].filter((id) => !set.has(id));
  if (missing.length) rosterGhosts.push(...missing.map((id) => `MISSING:${id}`));
  console.log(`roster ${label}: ${set.size} embodied (${ghosts.length} ghosts, ${missing.length} missing)`);
}

// wave runner: N cyc ids join staggered, whisper a held 4KB message to an
// absent sleeper, stream @15Hz, exit at +holdMs (mixed clean/abrupt)
function runWave(ids: string[], atMs: number, holdMs: number, sleeperFor: (i: number) => string, onJoined?: (ss: Spec[]) => void, exitOverride?: (s: Spec, idx: number) => void) {
  at(atMs, async () => {
    const joined = await Promise.allSettled(ids.map((id, i) => (i % 8 ? sleep(25) : Promise.resolve()).then(() => connect(id, false, 300 + i))));
    const ss = joined.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
    ss.forEach((s, i) => {
      // whisper to an ABSENT recipient → held in memory (bounded queue)
      if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "whisper", to: sleeperFor(i), text: `${WHISPER_TEXT}#${s.id}` }));
      const iv = setInterval(() => {
        if (s.closed || s.ws.readyState !== 1) { clearInterval(iv); return; }
        const t = Date.now() / 1000 + i;
        s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t) * 15, 0, Math.cos(t) * 15], yaw: t % 6.28, speed: 1.5, clip: "walk" } }));
      }, 1000 / POSE_HZ);
      tickers.push(iv);
    });
    onJoined?.(ss);
    at(atMs + holdMs, () => ss.forEach((s, i) => {
      if (exitOverride) exitOverride(s, i);
      else if (i % 2 === 0) exitClean(s);
      else exitAbrupt(s);
    }));
  });
}

// CYCLE A (+9s): 32 join, whisper-hold → sleeper-i, exit +1.2s
runWave(Array.from({ length: N_CYC }, (_, i) => `cyc-${i}`), T_WAVE_A, 1_200,
  (i) => `sleeper-${i}`, (ss) => { waveAJoins = ss.length; });
at(T_WAVE_A + 2_500, async () => checkRoster(await rosterProbe("postA"), "postA"));

// CYCLE B (+14s): same ids rejoin, whisper-hold again (2nd per sleeper-0..31)
runWave(Array.from({ length: N_CYC }, (_, i) => `cyc-${i}`), T_WAVE_B, 1_200,
  (i) => `sleeper-${i}`, (ss) => { waveBJoins = ss.length; });
at(T_WAVE_B + 2_500, async () => checkRoster(await rosterProbe("postB"), "postB"));

// CYCLE C (+19s): zombie duel — gen1 joins, +0.6s SAME ids join with gen1
// still open (server takes over: gen1 closes 4002), gen2 whisper-holds to
// sleeper-Ci, exits +1.8s.
at(T_WAVE_C, async () => {
  const gen1 = await Promise.allSettled(Array.from({ length: N_DUEL }, (_, i) => connect(`cyc-${i}`, false, 400 + i)));
  const g1 = gen1.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
  waveCJoins += g1.length;
  at(T_WAVE_C + 600, async () => {
    const gen2 = await Promise.allSettled(Array.from({ length: N_DUEL }, (_, i) => connect(`cyc-${i}`, false, 500 + i)));
    const g2 = gen2.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
    waveCJoins += g2.length;
    g2.forEach((s, i) => {
      if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "whisper", to: `sleeper-C${i}`, text: `${WHISPER_TEXT}#${s.id}` }));
      const iv = setInterval(() => {
        if (s.closed || s.ws.readyState !== 1) { clearInterval(iv); return; }
        const t = Date.now() / 1000 + i;
        s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t) * 15, 0, Math.cos(t) * 15], yaw: t % 6.28, speed: 1.5, clip: "walk" } }));
      }, 1000 / POSE_HZ);
      tickers.push(iv);
    });
    await sleep(400);
    duelTakeovers = g1.filter((s) => s.closed && s.closeCode === 4002).length;
    at(T_WAVE_C + 1_800, () => g2.forEach((s, i) => (i % 2 === 0 ? exitClean(s) : exitAbrupt(s))));
  });
});
at(T_WAVE_C + 3_000, async () => checkRoster(await rosterProbe("postC"), "postC"));

// full-house samples
at(T_HOUSE1, async () => { house1 = (await memProbe()) ?? house1; console.log(`house#1 sample: rss ${MB(house1.rss)}MB heap ${MB(house1.heapUsed)}MB`); });
at(T_STEADY, async () => { steadyS = (await memProbe()) ?? steadyS; });
at(T_HOUSE2, async () => { house2 = (await memProbe()) ?? house2; console.log(`house#2 sample (post-rejoin): rss ${MB(house2.rss)}MB heap ${MB(house2.heapUsed)}MB`); });

// DRAIN (+24s): sleeper-0..7 rejoin embodied — the held whispers from A and B
// (2 each) must arrive ON JOIN and their keys be deleted. Then they leave.
at(T_DRAIN, async () => {
  const dr = await Promise.allSettled(Array.from({ length: N_SLEEP }, (_, i) => connect(`sleeper-${i}`, false, 600 + i)));
  const ds = dr.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
  await sleep(600);   // delivery happens inside the join handler
  drainExact2 = ds.filter((s) => s.whisperGot.length === 2).length;
  console.log(`drain: ${ds.length}/8 sleepers rejoined, ${drainExact2} received EXACTLY 2 held whispers`);
  at(T_DRAIN + 1_500, () => ds.forEach(exitClean));
});

// fairness: one anchor say per wave, mid-storm
const sayResults: boolean[] = [];
const sayLat: number[] = [];
const SAY_TEXTS = [`storm-a-${Math.floor(t0)}`, `storm-b-${Math.floor(t0)}`, `storm-c-${Math.floor(t0)}`];
SAY_TEXTS.forEach((text, i) => {
  const when = [T_WAVE_A + 500, T_WAVE_B + 500, T_WAVE_C + 700][i];
  at(when, () => {
    const sentAt = performance.now();
    const S = perfs[3];
    if (S.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(when + 1_500, () => {
      const hit = S.sayEcho.get(text);
      sayResults.push(hit !== undefined);
      if (hit !== undefined) sayLat.push(hit - sentAt);
    });
  });
});

// TEARDOWN#1 (+29s): clean close of all 160 anchors
at(T_TEARDOWN1, () => {
  running = false;
  anchors.forEach((s) => { try { s.ws.close(); } catch {} });
});

// SETTLE#1 (+29.5s): quiet band watch (≤12s) + forced full GC — post-GC
// heapUsed must be back at baseline (JS plane holds nothing per-participant);
// its RSS is the reference the settle#2 ratchet compares against.
at(T_SETTLE1, async () => {
  const r = await settleWatch(SETTLE1_DEADLINE, 1);
  settled1 = (await memProbe(true)) ?? settled1;
  settle1Secs = r.secs;
  settle1Fired = r.fired;
  console.log(`settle#1: fired=${settle1Fired} after ${settle1Secs.toFixed(1)}s — post-GC rss ${MB(settled1.rss)}MB heap ${MB(settled1.heapUsed)}MB (baseline ${MB(baseline.rss)}MB / ${MB(baseline.heapUsed)}MB)`);
});

// REJOIN (+42s): the SAME 160 ids all come back at once — the memory
// ratchet probe (settled#2 vs settled#1). Identical population must cost
// no more the second time.
at(T_REJOIN, async () => {
  const re = await Promise.allSettled([
    ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, false, i)),
    ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
  ]);
  reanchors = re.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
  rejoinCount = reanchors.length;
  rejoinTimes.push(...reanchors.map((s) => s.joinMs));
  running = true;
  const rePerfs = reanchors.filter((s) => s.id.startsWith("perf-"));
  tickers.push(...rePerfs.map((s, i) => setInterval(() => {
    if (!running || s.ws.readyState !== 1) return;
    const t = Date.now() / 1000 + i;
    s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
    posesSent.n++;
  }, 1000 / POSE_HZ)));
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(1)}s: rejoin ${rejoinCount}/${all.length} — p95 ${Math.round(pct(rejoinTimes, 95))}ms`);
});

// TEARDOWN#2 (+37s): abrupt terminate of the second house
at(T_TEARDOWN2, () => {
  running = false;
  reanchors.forEach(exitAbrupt);
  anchors.forEach((s) => { if (!s.closed) exitAbrupt(s); });
});

// AFTERWORLD (+49s): 8 fresh ids join world "empty" (world #2), whisper 8
// more holds (per-world keys), leave clean. Second world created + emptied.
const afterSpecs: Spec[] = [];
at(T_AFTER, async () => {
  const aw = await Promise.allSettled(Array.from({ length: N_SLEEP }, (_, i) => (i ? sleep(100) : Promise.resolve()).then(() => connect(`after-${i}`, false, 700 + i, AFTER))));
  afterSpecs.push(...aw.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec));
  afterSpecs.forEach((s, i) => {
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "whisper", to: `sleeper-${i}`, text: `${WHISPER_TEXT}#after` }));
  });
  at(T_AFTER + 1_500, () => afterSpecs.forEach(exitClean));
});

// SETTLE WATCH helper: 500ms samples inside settle windows only (1s cadence
// cannot collect 17 samples inside a 12s deadline — the 16-of-17 band needs
// ≥17 points; run-1 of this harness false-failed on exactly that); settled =
// 16 of last 17 within 1.5%
async function settleWatch(deadlineMs: number, phase: number): Promise<{ fired: boolean; secs: number }> {
  const win: number[] = [];
  const dl = performance.now() + deadlineMs;
  while (performance.now() < dl) {
    await sleep(500);
    const m = await memProbe();
    if (!m) continue;
    win.push(m.rss);
    if (win.length > 17) win.shift();
    if (win.length === 17) {
      const band = 0.015 * win[16];
      const inBand = win.filter((v) => Math.abs(v - win[16]) <= band).length;
      if (inBand >= 16) return { fired: true, secs: (performance.now() - (t0 + (phase === 1 ? T_SETTLE1 : T_SETTLE))) / 1000 };
    }
  }
  return { fired: false, secs: deadlineMs / 1000 + 1 };
}

// SETTLE#2 (+51s): quiet band watch (≤15s) + forced GC — post-GC heapUsed at
// baseline again; settled#2 RSS − settled#1 RSS is the plateau/ratchet gate.
at(T_SETTLE, async () => {
  const r = await settleWatch(SETTLE_DEADLINE, 2);
  settled2 = (await memProbe(true)) ?? settled2;
  settle2Secs = r.secs;
  settle2Fired = r.fired;
  console.log(`settle#2: fired=${settle2Fired} after ${settle2Secs.toFixed(1)}s — post-GC rss ${MB(settled2.rss)}MB heap ${MB(settled2.heapUsed)}MB (settled#1 ${MB(settled1.rss)}MB)`);
});

// FINAL PROBES (+51s): both worlds empty — present 0 and ZERO frames in a 2s
// window on a fresh spectator socket (no embodied, no dirty poses, no ticks).
// The probe's own close makes the server print describe() for a world that
// must now hold nobody — the post-mark "0 present, 0 watching" line.
let finalPresent = -1, finalFrames = -1, afterPresent = -1, afterFrames = -1;
async function emptyProbe(world: string): Promise<{ present: number; frames: number }> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const out = { present: -1, frames: 0 };
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve({ present: -2, frames: -2 }); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id: `final-empty-${world}-${Math.floor(t0)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        out.present = (m.present ?? []).length;
        setTimeout(() => { clearTimeout(to); try { ws.close(); } catch {} resolve(out); }, 2_000);
      } else if (m.type === "frame") {
        out.frames++;
      }
    };
    ws.onerror = () => { clearTimeout(to); resolve({ present: -3, frames: -3 }); };
  });
}
at(T_FINAL_PROBE, async () => {
  const a = await emptyProbe(WORLD);
  finalPresent = a.present; finalFrames = a.frames;
  await sleep(400);   // let the probe's own close line land in the log
  const b = await emptyProbe(AFTER);
  afterPresent = b.present; afterFrames = b.frames;
  await sleep(400);
  console.log(`final probes: ${WORLD} present=${finalPresent} frames=${finalFrames} | ${AFTER} present=${afterPresent} frames=${afterFrames}`);
});

await sleep(DURATION);
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(memTimer);
await sleep(300);

// ---- ground truth: world logs + server log -------------------------------------
let logLineDrift = 0;
for (const [wn, want] of Object.entries(EXPECT_LOG)) {
  const p = `${WORLDS}/${wn}/log.jsonl`;
  const got = existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean).length : -1;
  const d = Math.abs(got - (want as number));
  logLineDrift += d;
  console.log(`world log ${wn}: ${got} lines (expected ${want}, drift ${d})`);
}
const logText = await logFile.text();
const logLines = logText.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
// describe(): `${real} present${eyes ? ", ${eyes} watching" : ""}` — zero eyes
// OMIT the watching clause, so the empty-world line is exactly "0 present —".
// \b guards against "20 present"; requiring the em-dash rejects spectator
// ghosts ("0 present, 5 watching —"). Searched in the FULL log: a "0 present —"
// line can only be printed after a populated world emptied (the final probes'
// own joins/leaves print it at the very end), and finalPresent/afterPresent
// gate the end-state independently.
const describeZero = /\b0 present —/.test(logText);

// ghost arithmetic from the one spectator who saw every broadcast
const SEER = specs[0];
const cycArrives = SEER ? SEER.arrives.filter((id) => id.startsWith("cyc-")).length : -1;
const cycLeaves = SEER ? SEER.leaves.filter((id) => id.startsWith("cyc-")).length : -1;
const sleepArr = SEER ? SEER.arrives.filter((id) => id.startsWith("sleeper-")).length : -1;
const sleepLea = SEER ? SEER.leaves.filter((id) => id.startsWith("sleeper-")).length : -1;
const arriveDrift = cycArrives < 0 ? 999 : Math.abs(cycArrives + sleepArr - EXPECT_SEER_ARRIVES);
const leaveDrift = cycLeaves < 0 ? 999 : Math.abs(cycLeaves + sleepLea - EXPECT_SEER_LEAVES);

// connected-window fps per spectator socket — window capped at the LAST
// embodied departure (pressure-6 law: frames flow only while embodied exist;
// rejoin spectator sockets stay open ~18s past teardown#2 and would dilute
// to a false ~4fps if divided by their full connected window)
const endAt = performance.now();
const lastEmbodied = t0 + T_TEARDOWN2 + 500;
const fpsPop = [...specs, ...reanchors.filter((s) => s.id.startsWith("spec-"))].map((s) => {
  const stop = Math.min(endAt, s.closedAt || endAt, lastEmbodied);
  return s.frames / Math.max(0.001, (stop - Math.max(s.snapAt, s.openAt) - 500) / 1000);
});
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0) + reanchors.reduce((a, s) => a + s.gaps, 0);

const quietStableMB = quiet.length && memReady ? Math.abs(Math.min(...quiet.map((q) => q.rss)) - memReady.rss) / 1024 / 1024 : 999;
const m: Measurements = {
  anchors: anchors.length, anchorP95: pct(anchors.map((s) => s.joinMs), 95),
  rejoins: rejoinCount, rejoinP95: pct(rejoinTimes, 95),
  waveA: waveAJoins, waveB: waveBJoins, waveC: waveCJoins, takeovers: duelTakeovers,
  ghostClients: rosterGhosts.filter((g) => !g.startsWith("MISSING:")).length,
  holdEchoes: holdEchoTotal,
  sleeperExact2: drainExact2 < 0 ? 999 : drainExact2,
  arriveDrift, leaveDrift,
  finalPresent: Math.max(finalPresent, 0) === finalPresent ? finalPresent : 999,
  finalFrames: Math.max(finalFrames, 0) === finalFrames ? finalFrames : 999,
  afterPresent: Math.max(afterPresent, 0) === afterPresent ? afterPresent : 999,
  afterFrames: Math.max(afterFrames, 0) === afterFrames ? afterFrames : 999,
  describeZero,
  saysAppended: sayResults.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  fpsP50: pct(fpsPop, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeStormP95: pct(probeStorm, 95), probeQuietP95: pct(probeQuiet, 95),
  settle1Fired, settle1Secs, settle2Fired, settle2Secs,
  baseline,
  settled1: Number.isFinite(settled1.rss) ? settled1 : peakS,
  settled2: Number.isFinite(settled2.rss) ? settled2 : { rss: Infinity, heapUsed: 0 },
  house1: Number.isFinite(house1.rss) ? house1 : baseline,
  house2: Number.isFinite(house2.rss) ? house2 : { rss: Infinity, heapUsed: 0 },
  peak: peakS,
  quietStableMB, logLineDrift, logSuspicious: suspicious.length,
  diagMissing,
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n} (abrupt-exit method: ${abruptMethod})
  anchors               ${anchors.length}/${all.length} p95 ${Math.round(m.anchorP95)}ms — rejoin ${rejoinCount}/${all.length} p95 ${Math.round(m.rejoinP95)}ms
  waves                 A ${waveAJoins}/32  B ${waveBJoins}/32  C ${waveCJoins}/24 — takeovers ${duelTakeovers}/12
  roster ghosts         ${rosterGhosts.length} across 3 post-wave probes
  whisper holds         ${holdEchoTotal}/${EXPECT_HOLDS} hold echoes
  drain exact-2         ${m.sleeperExact2}/8 sleepers received EXACTLY 2 held whispers
  seer arrive/leave     cyc+sleep ${cycArrives + sleepArr}/${EXPECT_SEER_ARRIVES} arrives (drift ${arriveDrift})  ${cycLeaves + sleepLea}/${EXPECT_SEER_LEAVES} leaves (drift ${leaveDrift})
  final worlds          ${WORLD} present=${finalPresent} frames=${finalFrames} | ${AFTER} present=${afterPresent} frames=${afterFrames}
  describe zero line    ${describeZero}
  mid-wave says         ${m.saysAppended}/3 — author p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms
  spectator frame/s     p50 ${m.fpsP50.toFixed(1)} (n=${fpsPop.length} sockets)
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${latAll.length ? Math.round(Math.max(...latAll)) : "-"}
  frame seq gaps        ${gapsTotal}
  http probe ms         storm p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length})  quiet p95 ${Math.round(m.probeQuietP95)} (n=${probeQuiet.length})  errors ${probeErrors.n}
  memory MB             ready ${MB(memReady?.rss ?? NaN)} → baseline ${MB(baseline.rss)} → house#1 ${MB(house1.rss)} → steady ${MB(steadyS.rss)} → house#2 ${MB(house2.rss)} → peak ${MB(peakS.rss)} → settled#1 ${MB(m.settled1.rss)} (post-GC heap ${MB(m.settled1.heapUsed)}) → settled#2 ${MB(m.settled2.rss)} (post-GC heap ${MB(m.settled2.heapUsed)})
  settles               #1 ${settle1Fired ? `${settle1Secs.toFixed(1)}s` : "NOT FIRED"}  #2 ${settle2Fired ? `${settle2Secs.toFixed(1)}s` : "NOT FIRED"}
  retention MB          post-GC heap#1 ${((m.settled1.heapUsed - baseline.heapUsed) / 1024 / 1024).toFixed(2)}  heap#2 ${((m.settled2.heapUsed - baseline.heapUsed) / 1024 / 1024).toFixed(2)} (gates ≤ ${TH.heapPostGcWarmMB} warm / ≤ ${TH.heapPostGcSteadyMB} steady)  ratchet settled2−settled1 ${((m.settled2.rss - m.settled1.rss) / 1024 / 1024).toFixed(2)} (≤ ${TH.rejoinRatchetMB})
  world log drift       ${logLineDrift}   server log ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
if (rosterGhosts.length) console.log(`roster findings:\n  ${rosterGhosts.slice(0, 12).join("\n  ")}`);

for (const s of anchors.concat(reanchors, afterSpecs)) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — memory returns near baseline; every cross-departure structure is a bounded, deliberate feature`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
