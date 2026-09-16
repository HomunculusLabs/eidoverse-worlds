// Pressure scenario 30: GUESTBOOK FLOOD — sign-spam cannot blow the 8KB
// degrade path or the comp write budget.
//
// The guestbook engine (server/guestbook.ts + shared/guestbook.js, vocab-6):
// `use {action:"sign", text}` = rank 0 + arm's reach; every inscription is
// ONE world-authored comp transition (entries newest-first, capped — the
// degrade side drops the carried config and keeps entries) plus ONE say
// with gb {who,text,at} cause-paired to the use. The per-client verb budget
// (12/4s) is the designed aggregate bound: N spammers ≈ N×3 signs/s MAX.
//
// THE MEASUREMENT (pinned before running — 219 peak sockets):
//   24 embodied anchors @15Hz + 136 spectators; TWO books 2m apart —
//   gb-a {cap:64} the long-growth regime, gb-b {cap:5} the every-sign-
//   evicts regime. 40 flooders in the reach overlap sign 160-char texts
//   at 1450ms pace (11/4s — at-budget-legal) for 14s = 400 signs; the
//   chain walk re-derives EVERY world comp from shared/guestbook.js and
//   demands byte-exact match: the growth, the 8KB degrade crossing (ONE
//   overshoot write ~8.2KB — entries alone cross the gate the degrade
//   path nominally protects), the cap collapse 64→20, eviction
//   steady-state, erase churn (fires AND nothing-to-erase skips), the
//   budget boundary (12 ok / 2 refused / window recovery), skip controls
//   (far / empty / whitespace / 200-char slice), spectator refusal,
//   mid-flood snapshot equivalence, and SIGKILL replay of the final book.
//
// Timeline (wall t):
//   t+0     anchors join (perf-0 first → auto-owner).
//   t+2.0   perf-0 spawns gb-a [5,0,6] + gb-b [7,0,6], comps guestbook
//           {cap:64,reach:4} / {cap:5,reach:4}.
//   t+4.0   leg wave: 40 flooders + far-0 + ctrl-budget/empty/ws/long +
//           specask-0, posed in the reach overlap (ring r 2.0–2.6 of the
//           midpoint; far-0 at [54,0,54]).
//   t+5.5   fair say #1 (pre-flood baseline).
//   t+6→20  THE FLOOD: every flooder signs every 1450ms, alternating
//           books (tick even→a, odd→b), text = unique 160-char string.
//   t+9/13/17  snapshot probes (fresh spectator join == fold(log through
//           covered), canon-exact) + snapshot-size report.
//   t+10    erase wave A: fl-0..7 self-erase gb-a (fire or skip — sim
//           decides from the actual log).
//   t+11/15 fair says #2/#3 (mid-flood).
//   t+12    erase wave B: fl-8..15 self-erase gb-b (expected: evicted →
//           nothing-to-erase skips).
//   t+20    flood ends.
//   t+22    late wave: 10 embodied joiners posed in reach (join p95 with
//           the fat folded state riding the snapshot).
//   t+24    controls: ctrl-budget 14 back-to-back signs gb-a (12 ok +
//           2 refused exact) ; far-0 signs (out-of-reach skip) ; ctrl-
//           empty "" ; ctrl-ws "   " (no-text skips) ; ctrl-long 200
//           chars (stored EXACTLY 160 — the slice) ; t+24.5 specask-0
//           signs (spectator shell refusal, 0 log lines).
//   t+26    flight-recorder pull (guestbook kinds) — report-only.
//   t+28.5  ctrl-budget recovery sign (window recovered → accepted).
//   t+27    teardown all legs+anchors.
//   t+35    SIGKILL; restart same WORLDS_DIR; probe: state == fold(full
//           log), books byte-exact vs the simulation's final state,
//           drift 0 after 2 sweeps, present 0.
//
// Acceptance gates (pinned before measuring — see TH):
//   anchors 160/160 p95<3s · legs 46/46 p95<3s · late 10/10 p95<3s ·
//   flood 400/400 signs accepted, 0 flood refusals · chain: EVERY world
//   comp byte-exact vs the shared-math simulation, triples contiguous
//   (use→comp→say), gb.at == use ts, cause == use seq · degrade fires
//   EXACTLY once (the pinned overshoot) · every guestbook comp ≤16.4KB
//   (structural ceiling cap 64 × max entry) · budget 12 ok / 2 refused
//   verbatim / 1 recovery · skips: far 1, empty+ws 2, B-erases sim-exact ·
//   long text stored exactly 160 · specask refused verbatim, 0 lines ·
//   fair says 3/3 p95<500ms · sign echo ≥380/400 own-say receipts p95
//   <500ms · seer received every gb say cause + every world comp EXACT ·
//   fps p50≥12, lat p95<250ms, 0 gaps, HTTP probe p95<100ms · snapshot
//   probes 3/3 fold-equal · final quiet == fold(full) · restart boot +
//   fold-equal + books byte-exact + drift 0 + present 0 · log lines ==
//   walk-derived EXACT (band 1255–1330) · RSS peak−postJoin <+60MB ·
//   0 suspicious lines.
//
//   SERVER_DIR=/private/tmp/pressure-wt PORT=8971 bun tools/pressure-guestbookflood.ts
//   SELFTEST=1 bun tools/pressure-guestbookflood.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { emptyState, foldEntry } from "../shared/fold.js";
import { normalizeGuestbook, guestbookTrim } from "../shared/guestbook.js";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/private/tmp/pressure-wt";
const PORT = Number(process.env.PORT ?? 8971);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure30-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 136;                     // 160 anchors
const N_FLOOD = 40;                                  // the flood fleet
const N_LATE = 10;                                   // late embodied joiners
const POSE_HZ = 15;
const BOOK_A: [string, number] = ["gb-a", 64];       // id, cap — long growth
const BOOK_B: [string, number] = ["gb-b", 5];        // every-sign-evicts
const BOOK_A_POS = [5, 0, 6], BOOK_B_POS = [7, 0, 6];
const MID = [6, 0, 6];
const REACH = 4;
const TEXT_LEN = 160;                                // every flood sign is max-length
const FLOOD_PERIOD_MS = 1450;                        // 11 per 4s — at-budget-legal
const FLOOD_TICKS = 10;                              // t+6..t+19.05 deterministic
const FAR_POS = [54, 0, 54];
const BUDGET_BURST = 14;                             // 12 ok + 2 refused
const DRESS_AT = 2_000, LEG_AT = 4_000;
const FLOOD_AT = 6_000, FLOOD_END = 20_000;
const SNAP_ATS = [9_000, 13_000, 17_000];
const ERASE_A_AT = 10_000, ERASE_B_AT = 12_000;
const FAIR_SAY_ATS = [5_500, 11_000, 15_000];
const LATE_AT = 22_000, CTRL_AT = 24_000, SPECASK_AT = 24_500;
const RECORDER_AT = 26_000, RECOVERY_AT = 28_300, TEARDOWN_AT = 29_000;
const KILL_AT = 35_000;
const DURATION = 35_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..29
const SELFTEST = process.env.SELFTEST === "1";
const LOG_JSONL = `${WORLDS}/${WORLD}/log.jsonl`;
const SPEC_REFUSAL = "spectators can't author — join embodied to build";
const RATE_REFUSAL = "slow down — verb rate limit";
const RATE_REFUSAL_LABEL = "slow down";

// expected base lines: genesis + auto-owner grant + 2 spawns + 2 author comps
const EXP_BASE = 6;
const EXP_FLOOD_SIGNS = N_FLOOD * FLOOD_TICKS;       // 400
const EXP_DEGRADE = 1;                               // the single pinned overshoot
const EXP_BOOKB_FINAL = 5;
const MAX_COMP_BYTES = 16_400;                       // cap 64 × ~252B max entry + margin
const EXP_LOG_BAND: [number, number] = [1_255, 1_330];

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorTotal: 160, anchorJoinP95Ms: 3_000,
  legTotal: 46, legJoinP95Ms: 3_000,
  lateTotal: 10, lateJoinP95Ms: 3_000,
  floodAccepted: EXP_FLOOD_SIGNS, floodRefusals: 0,
  chainErr: 0, adjErr: 0, gbAtErr: 0, causeErr: 0, orphanComp: 0,
  degradeTotal: EXP_DEGRADE,
  maxCompBytes: MAX_COMP_BYTES,
  budgetOk: 12, budgetRefused: 2, budgetRecovery: 1,
  farSkips: 1, emptySkips: 2, longStoredLen: 160,
  specRefusals: 1, specLines: 0,
  fairSays: 3, sayP95Ms: 500,
  signEchoMin: 380, signEchoP95Ms: 500,
  seerSayCausesExact: true, seerCompsExact: true,
  fpsP50: 12, latP95Ms: 250, seqGapsMax: 300, probeP95Ms: 100,
  snapProbesOk: 3, finalFoldEqual: true,
  logWalkExact: true, logBand: EXP_LOG_BAND,
  restartBoot: 1, restartFoldEqual: true, restartBooksExact: true,
  restartLineDrift: 0, finalPresent: 0,
  rssPeakGrowthMB: 60, logSuspicious: 0,
};
type Measurements = {
  anchorJoined: number; anchorJoinP95: number;
  legJoined: number; legJoinP95: number;
  lateJoined: number; lateJoinP95: number;
  floodAccepted: number; floodRefusals: number;
  chainErr: number; adjErr: number; gbAtErr: number; causeErr: number; orphanComp: number;
  degradeTotal: number; maxCompBytes: number;
  budgetOk: number; budgetRefused: number; budgetRecovery: number;
  farSkips: number; emptySkips: number; longStoredLen: number;
  specRefusals: number; specLines: number;
  fairSays: number; sayP95: number;
  signEchoN: number; signEchoP95: number;
  seerSayCauses: number; seerSayCausesWant: number;
  seerComps: number; seerCompsWant: number;
  fpsP50: number; latP95: number; gaps: number; probeP95: number;
  snapProbesOk: number; finalFoldEqual: boolean;
  logTotal: number; logWalk: number;
  restartBoot: number; restartFoldEqual: boolean; restartBooksExact: boolean;
  restartLineDrift: number; finalPresent: number;
  rssPeakGrowthMB: number; logSuspicious: number;
};
function evaluate(m: Measurements): string[] {
  const f: string[] = [];
  if (m.anchorJoined !== TH.anchorTotal) f.push(`anchors ${m.anchorJoined}/${TH.anchorTotal} joined`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) f.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.legJoined !== TH.legTotal) f.push(`legs ${m.legJoined}/${TH.legTotal} joined`);
  if (m.legJoinP95 > TH.legJoinP95Ms) f.push(`leg join p95 ${Math.round(m.legJoinP95)}ms > ${TH.legJoinP95Ms}ms`);
  if (m.lateJoined !== TH.lateTotal) f.push(`late wave ${m.lateJoined}/${TH.lateTotal} joined`);
  if (m.lateJoinP95 > TH.lateJoinP95Ms) f.push(`late join p95 ${Math.round(m.lateJoinP95)}ms > ${TH.lateJoinP95Ms}ms`);
  if (m.floodAccepted !== TH.floodAccepted) f.push(`flood signs accepted ${m.floodAccepted} != ${TH.floodAccepted} (lost or duplicated signs)`);
  if (m.floodRefusals !== TH.floodRefusals) f.push(`${m.floodRefusals} flood refusals (want 0 — 1450ms pace is budget-legal)`);
  if (m.chainErr > TH.chainErr) f.push(`${m.chainErr} comp writes != shared-math simulation (chain broken)`);
  if (m.adjErr > TH.adjErr) f.push(`${m.adjErr} non-contiguous use→comp→say triples`);
  if (m.gbAtErr > TH.gbAtErr) f.push(`${m.gbAtErr} gb.at values != the paired use ts`);
  if (m.causeErr > TH.causeErr) f.push(`${m.causeErr} say cause != the paired use seq`);
  if (m.orphanComp > TH.orphanComp) f.push(`${m.orphanComp} world comps without their use (orphans)`);
  if (m.degradeTotal !== TH.degradeTotal) f.push(`degrade fired ${m.degradeTotal}x != ${TH.degradeTotal} (the pinned single overshoot)`);
  if (m.maxCompBytes > TH.maxCompBytes) f.push(`max guestbook comp ${m.maxCompBytes}B > ${TH.maxCompBytes}B (write budget blown)`);
  if (m.budgetOk !== TH.budgetOk) f.push(`budget boundary accepted ${m.budgetOk} != ${TH.budgetOk}`);
  if (m.budgetRefused !== TH.budgetRefused) f.push(`budget refusals ${m.budgetRefused} != ${TH.budgetRefused} (verbatim "${RATE_REFUSAL}")`);
  if (m.budgetRecovery !== TH.budgetRecovery) f.push(`budget window recovery ${m.budgetRecovery} != ${TH.budgetRecovery}`);
  if (m.farSkips !== TH.farSkips) f.push(`out-of-reach skips ${m.farSkips} != ${TH.farSkips}`);
  if (m.emptySkips !== TH.emptySkips) f.push(`no-text skips ${m.emptySkips} != ${TH.emptySkips} (empty + whitespace)`);
  if (m.longStoredLen !== TH.longStoredLen) f.push(`long text stored at ${m.longStoredLen} chars != ${TH.longStoredLen} (the 160 slice)`);
  if (m.specRefusals !== TH.specRefusals) f.push(`spectator refusals ${m.specRefusals}/${TH.specRefusals} verbatim`);
  if (m.specLines !== TH.specLines) f.push(`spectator legs authored ${m.specLines} log lines (want 0)`);
  if (m.fairSays !== TH.fairSays) f.push(`fair says ${m.fairSays}/${TH.fairSays} appended+echoed`);
  if (m.sayP95 > TH.sayP95Ms) f.push(`fair say p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.signEchoN < TH.signEchoMin) f.push(`sign echo receipts ${m.signEchoN} < ${TH.signEchoMin} (of ${EXP_FLOOD_SIGNS})`);
  if (m.signEchoP95 > TH.signEchoP95Ms) f.push(`sign echo p95 ${Math.round(m.signEchoP95)}ms > ${TH.signEchoP95Ms}ms (n=${m.signEchoN})`);
  if (TH.seerSayCausesExact && m.seerSayCauses !== m.seerSayCausesWant) f.push(`seer gb-say causes ${m.seerSayCauses}/${m.seerSayCausesWant} (fanout loss)`);
  if (TH.seerCompsExact && m.seerComps !== m.seerCompsWant) f.push(`seer world-comp receipts ${m.seerComps}/${m.seerCompsWant} (fanout loss)`);
  if (m.fpsP50 < TH.fpsP50) f.push(`fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) f.push(`frame lat p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGapsMax) f.push(`${m.gaps} frame seq gaps > ${TH.seqGapsMax} (designed FRAME_SKIP backpressure ceiling — presence-plane skips only; log fanout must stay exact)`);
  if (m.probeP95 > TH.probeP95Ms) f.push(`HTTP probe p95 ${Math.round(m.probeP95)}ms > ${TH.probeP95Ms}ms`);
  if (m.snapProbesOk !== TH.snapProbesOk) f.push(`mid-flood snapshot probes fold-equal ${m.snapProbesOk}/${TH.snapProbesOk}`);
  if (!m.finalFoldEqual) f.push(`final quiet snapshot != fold(full log)`);
  if (TH.logWalkExact && m.logTotal !== m.logWalk) f.push(`log lines ${m.logTotal} != walk-derived ${m.logWalk}`);
  if (m.logTotal < TH.logBand[0] || m.logTotal > TH.logBand[1]) f.push(`log lines ${m.logTotal} outside pinned band [${TH.logBand[0]}, ${TH.logBand[1]}]`);
  if (m.restartBoot !== TH.restartBoot) f.push(`restart boot failed`);
  if (!m.restartFoldEqual) f.push(`restart fold DIFFERS from fold(log)`);
  if (!m.restartBooksExact) f.push(`restart books != simulation final state`);
  if (m.restartLineDrift !== TH.restartLineDrift) f.push(`restart line drift ${m.restartLineDrift} (replay minted lines)`);
  if (m.finalPresent !== TH.finalPresent) f.push(`final present ${m.finalPresent} (want 0)`);
  if (m.rssPeakGrowthMB > TH.rssPeakGrowthMB) f.push(`RSS peak growth ${m.rssPeakGrowthMB}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.logSuspicious !== TH.logSuspicious) f.push(`${m.logSuspicious} suspicious server-log lines`);
  return f;
}

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
const healthy: Measurements = {
  anchorJoined: 160, anchorJoinP95: 140,
  legJoined: 46, legJoinP95: 190,
  lateJoined: 10, lateJoinP95: 70,
  floodAccepted: 400, floodRefusals: 0,
  chainErr: 0, adjErr: 0, gbAtErr: 0, causeErr: 0, orphanComp: 0,
  degradeTotal: 1, maxCompBytes: 8_250,
  budgetOk: 12, budgetRefused: 2, budgetRecovery: 1,
  farSkips: 1, emptySkips: 2, longStoredLen: 160,
  specRefusals: 1, specLines: 0,
  fairSays: 3, sayP95: 40,
  signEchoN: 398, signEchoP95: 210,
  seerSayCauses: 421, seerSayCausesWant: 421,
  seerComps: 421, seerCompsWant: 421,
  fpsP50: 14.8, latP95: 60, gaps: 0, probeP95: 12,
  snapProbesOk: 3, finalFoldEqual: true,
  logTotal: 1_272, logWalk: 1_272,
  restartBoot: 1, restartFoldEqual: true, restartBooksExact: true,
  restartLineDrift: 0, finalPresent: 0,
  rssPeakGrowthMB: 27, logSuspicious: 0,
};
if (SELFTEST) {
  const a = evaluate(healthy);
  const breaches: Measurements[] = [];
  const mk = (patch: Partial<Measurements>) => ({ ...healthy, ...patch });
  breaches.push(mk({ anchorJoined: 158 }));
  breaches.push(mk({ anchorJoinP95: 3_400 }));
  breaches.push(mk({ legJoined: 44 }));
  breaches.push(mk({ legJoinP95: 3_100 }));
  breaches.push(mk({ lateJoined: 9 }));
  breaches.push(mk({ lateJoinP95: 3_300 }));
  breaches.push(mk({ floodAccepted: 397 }));            // lost signs
  breaches.push(mk({ floodAccepted: 403 }));            // duplicated signs
  breaches.push(mk({ floodRefusals: 5 }));              // legal pace refused
  breaches.push(mk({ chainErr: 3 }));                   // THE chain break
  breaches.push(mk({ adjErr: 2 }));
  breaches.push(mk({ gbAtErr: 1 }));
  breaches.push(mk({ causeErr: 4 }));
  breaches.push(mk({ orphanComp: 1 }));
  breaches.push(mk({ degradeTotal: 0 }));               // degrade never fired
  breaches.push(mk({ degradeTotal: 2 }));               // degrade thrash
  breaches.push(mk({ maxCompBytes: 19_000 }));          // write budget blown
  breaches.push(mk({ budgetOk: 11 }));
  breaches.push(mk({ budgetRefused: 1 }));
  breaches.push(mk({ budgetRecovery: 0 }));
  breaches.push(mk({ farSkips: 0 }));                   // reach gate failed
  breaches.push(mk({ emptySkips: 1 }));
  breaches.push(mk({ longStoredLen: 200 }));            // slice failed
  breaches.push(mk({ specRefusals: 0 }));
  breaches.push(mk({ specLines: 2 }));
  breaches.push(mk({ fairSays: 2 }));
  breaches.push(mk({ sayP95: 900 }));
  breaches.push(mk({ signEchoN: 300 }));
  breaches.push(mk({ signEchoP95: 950 }));
  breaches.push(mk({ seerSayCauses: 415 }));            // fanout loss
  breaches.push(mk({ seerComps: 410 }));
  breaches.push(mk({ fpsP50: 9.5 }));
  breaches.push(mk({ latP95: 480 }));
  breaches.push(mk({ gaps: 450 }));                 // designed-skip ceiling blown
  breaches.push(mk({ probeP95: 240 }));
  breaches.push(mk({ snapProbesOk: 2 }));
  breaches.push(mk({ finalFoldEqual: false }));
  breaches.push(mk({ logTotal: 1_301, logWalk: 1_272 })); // walk mismatch
  breaches.push(mk({ logTotal: 1_180, logWalk: 1_180 })); // outside band
  breaches.push(mk({ restartBoot: 0 }));
  breaches.push(mk({ restartFoldEqual: false }));
  breaches.push(mk({ restartBooksExact: false }));
  breaches.push(mk({ restartLineDrift: 5 }));
  breaches.push(mk({ finalPresent: 3 }));
  breaches.push(mk({ rssPeakGrowthMB: 88 }));
  breaches.push(mk({ logSuspicious: 1 }));
  const names = ["anchors", "anchorP95", "legs", "legP95", "late", "lateP95",
    "flood-lost", "flood-dup", "flood-refused", "chain", "adj", "gbAt", "cause",
    "orphan", "degrade-none", "degrade-thrash", "maxComp", "budgetOk",
    "budgetRefused", "recovery", "far", "empty", "longSlice", "specRefusal",
    "specLines", "fairSays", "sayP95", "echoN", "echoP95", "seerCauses",
    "seerComps", "fps", "lat", "gaps-ceiling", "probe", "snapProbes", "finalFold",
    "logWalk", "logBand", "boot", "restartFold", "restartBooks", "drift",
    "present", "rss", "suspicious"];
  const b: string[] = [];
  breaches.forEach((x, i) => { const r = evaluate(x); if (!r.length) b.push(names[i]); });
  const ok = a.length === 0 && b.length === 0;
  console.log(ok ? `SELFTEST PASS — healthy gates clean, all ${breaches.length} breached gates fire` : `SELFTEST FAIL — clean:[${a}] missing:[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${POSE_HZ}Hz + ${N_SPEC} spec anchors; books gb-a{cap:${BOOK_A[1]}} @[${BOOK_A_POS}] + gb-b{cap:${BOOK_B[1]}} @[${BOOK_B_POS}] reach ${REACH}; ${N_FLOOD} flooders @${FLOOD_PERIOD_MS}ms pace (${FLOOD_TICKS} signs each, ${TEXT_LEN}-char texts, alternating books) + far/empty/ws/long/budget/specask controls + ${N_LATE} late. Expected: ${EXP_FLOOD_SIGNS} signs, degrade EXACTLY ${EXP_DEGRADE}x (the pinned overshoot), cap collapse ${BOOK_A[1]}→20, gb-b final ${EXP_BOOKB_FINAL}, budget 12ok/2refused/1recovery, comp ceiling ${MAX_COMP_BYTES}B, log band [${EXP_LOG_BAND[0]},${EXP_LOG_BAND[1]}]. ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: joins ${TH.anchorTotal}+${TH.legTotal}+${TH.lateTotal}@p95<3s flood=${TH.floodAccepted}EXACT/0-refused chain=sim-byte-exact triples-contiguous degrade=${TH.degradeTotal}EXACT comp≤${TH.maxCompBytes}B budget=${TH.budgetOk}/${TH.budgetRefused}/${TH.budgetRecovery} skips far=${TH.farSkips} empty=${TH.emptySkips} slice=${TH.longStoredLen} spec=${TH.specRefusals}verbatim/0-lines fair=${TH.fairSays}@p95<${TH.sayP95Ms}ms echo≥${TH.signEchoMin}@p95<${TH.signEchoP95Ms}ms seer=exact fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps≤${TH.seqGapsMax}(designed-skip) probeP95<${TH.probeP95Ms}ms snaps=${TH.snapProbesOk}/3-fold-equal log=walk-exact restart=boot+fold+books+drift0+present0 rss<+${TH.rssPeakGrowthMB}MB suspicious=${TH.logSuspicious}`);

// ---- fd budget: ~220 concurrent sockets + server must fit ---------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 500) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 500 — launch as: ulimit -n 1024 && bun tools/pressure-guestbookflood.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure30-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
function spawnServer() {
  return Bun.spawn({
    cmd: ["bun", "run", "server/server.ts"],
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR },
    stdout: logFile,
    stderr: logFile,
  });
}
let server = spawnServer();
const rss = () => {
  try {
    const r = Bun.spawnSync(["ps", "-o", "rss=", "-p", String(server.pid)]);
    return Number(String(r.stdout).trim());
  } catch { return NaN; }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MB = (kb: number) => Math.round(kb / 1024);
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
async function waitReady(): Promise<boolean> {
  for (let i = 0; i < 120; i++) {
    await sleep(250);
    try { const res = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); if (res.status > 0) return true; } catch { /* booting */ }
  }
  return false;
}
if (!(await waitReady())) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }
const rssReady = rss();
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (log: ${logPath})`);

// ---- canonical deep compare + fold-the-log-file (snapjoin-proven) --------------
function canon(v: any): string {
  if (v === undefined) return "undef";
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
}
function logEntries(): any[] {
  if (!existsSync(LOG_JSONL)) return [];
  return readFileSync(LOG_JSONL, "utf8").split("\n").filter((l) => l.trim()).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function foldPrefix(covered: number): { st: any; maxSeq: number } {
  const st = emptyState();
  let maxSeq = 0;
  for (const e of logEntries()) {
    if (Number(e.seq) > maxSeq) maxSeq = Number(e.seq);
    if (Number(e.seq) <= covered) foldEntry(st, e);
  }
  return { st, maxSeq };
}
function verifySnapshot(m: any): { ok: boolean; errs: string[]; covered: number } {
  const errs: string[] = [];
  const throughSeq = typeof m.throughSeq === "number" ? m.throughSeq : -1;
  const tail: any[] = Array.isArray(m.entries) ? m.entries : [];
  const tailTop = tail.length ? Number(tail[tail.length - 1].seq) : throughSeq;
  const covered = Math.max(throughSeq, tailTop);
  if (tail.length !== tailTop - throughSeq) errs.push(`tail len ${tail.length} != span ${tailTop - throughSeq}`);
  tail.forEach((e, i) => { if (Number(e.seq) !== throughSeq + 1 + i) errs.push(`tail gap at ${i}`); });
  const { st } = foldPrefix(covered);
  if (canon(st) !== canon(m.state)) errs.push(`snapshot state != fold(log through ${covered})`);
  return { ok: errs.length === 0, errs, covered };
}

// ---- client chassis (vendorburst-proven, + gb echo tracking) -------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number; snapshot: any;
  closed: boolean; closeCode: number; id: string;
  sayEcho: Map<string, number>;
  useErrors: string[];
  gbSayCauses: Set<number>;              // world gb says received (by cause)
  gbComps: number;                       // world guestbook comps received
  gbEchoAt: Map<string, number>;         // unique sign text → own say echo recv ts
  sendStamps: Map<string, number>;       // unique sign text → send ts
  snapshotBytes: number;
  debugPulls: any[];
  errs: string[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, snapshot: null, closed: false, closeCode: 0, sayEcho: new Map(), useErrors: [], gbSayCauses: new Set(), gbComps: 0, gbEchoAt: new Map(), sendStamps: new Map(), snapshotBytes: 0, debugPulls: [], errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapshot = m; s.snapAt = performance.now(); s.joinMs = s.snapAt - s.openAt;
        s.snapshotBytes = String(ev.data).length;
        for (const e of m.entries ?? []) if (e.verb === "say") s.says.add(e.args?.text);
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "log") {
        const e = m.entry ?? {};
        if (e.verb === "say") {
          s.says.add(e.args?.text);
          if (!s.sayEcho.has(e.args?.text)) s.sayEcho.set(e.args?.text, performance.now());
          const gb = e.args?.gb;
          if (e.actor === "world" && gb != null) {
            const cause = Number(e.args?.cause);
            if (Number.isFinite(cause)) s.gbSayCauses.add(cause);
            const t = gb.text;
            if (typeof t === "string" && !s.gbEchoAt.has(t)) s.gbEchoAt.set(t, performance.now());
          }
        } else if (e.verb === "comp" && e.actor === "world" && e.args?.type === "guestbook") {
          s.gbComps++;
        }
      } else if (m.type === "error") {
        s.useErrors.push(String(m.error ?? ""));
      } else if (m.type === "debug") {
        s.debugPulls.push(m);
      }
    };
    ws.onclose = (ev) => { s.closed = true; s.closeCode = Number(ev.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}
/** One in-reach ring slot in the books' reach overlap (both ≤3.6m < reach 4m). */
function ringPos(i: number): number[] {
  const a = i * 2.399963229728653;   // golden angle — even spread, no clumping
  const r = 2.0 + (i % 4) * 0.2;     // 2.0–2.6m of midpoint → ≤3.6m from either book
  return [MID[0] + r * Math.cos(a), 0, MID[2] + r * Math.sin(a)];
}
const poseOnce = (s: Spec, p: number[]) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "pose", pose: { p, yaw: 0, speed: 0, clip: "idle" } })); };
const RUN = Date.now().toString(36);
/** The unique 160-char flood text (uniqueness rides the echo tracking). */
const floodText = (i: number, k: number) => (`F${i}-${k}-${RUN}:` + "x".repeat(TEXT_LEN)).slice(0, TEXT_LEN);

// ---- anchor population (perf-0 FIRST — the fresh world's owner) ----------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const perf0 = await connect("perf-0", false, 0);          // owner: spawn + author
const rest = await Promise.allSettled([
  ...Array.from({ length: N_PERF - 1 }, (_, i) => connect(`perf-${i + 1}`, false, i + 1)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = [perf0, ...rest.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec)];
const anchorFailed = 1 + rest.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const joinTimes = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${1 + rest.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);
const SEER = specs[0];

// embodied presence @15Hz (the standing crowd's motion — flooders stay
// posed in the reach overlap).
let running = true;
const tickers: any[] = [];
for (const s of perfs) {
  const i = Number(s.id.split("-")[1]);
  tickers.push(setInterval(() => {
    if (!running || s.ws.readyState !== 1) return;
    const t = Date.now() / 1000 + i;
    s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  }, 1000 / POSE_HZ));
}

// HTTP event-loop health probe
const probeAll: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  probeAll.push(performance.now() - t);
}, 500);
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 6_500);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 7_000 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- t+2.0s: dress the world — the two books (perf-0, 4 verbs ≤ budget) --------
at(DRESS_AT, () => {
  if (perf0.ws.readyState !== 1) return;
  perf0.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: BOOK_A[0], lib: "deco/bench.glb", pos: BOOK_A_POS, yaw: 0 } }));
  perf0.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: BOOK_B[0], lib: "deco/bench.glb", pos: BOOK_B_POS, yaw: 0 } }));
  perf0.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: BOOK_A[0], type: "guestbook", data: { cap: BOOK_A[1], reach: REACH } } }));
  perf0.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: BOOK_B[0], type: "guestbook", data: { cap: BOOK_B[1], reach: REACH } } }));
});

// ---- t+4.0s: leg wave — 40 flooders + 6 controls --------------------------------
const flooders: Spec[] = [];
let farLeg: Spec | null = null, specAsk: Spec | null = null;
let ctrlBudget: Spec | null = null, ctrlEmpty: Spec | null = null, ctrlWs: Spec | null = null, ctrlLong: Spec | null = null;
{
  const legs = await Promise.allSettled([
    ...Array.from({ length: N_FLOOD }, (_, j) => connect(`fl-${j}`, false, 100 + j)),
    connect("far-0", false, 300),
    connect("specask-0", true),
    connect("ctrl-budget", false, 320),
    connect("ctrl-empty", false, 321),
    connect("ctrl-ws", false, 322),
    connect("ctrl-long", false, 323),
  ]);
  legs.forEach((r) => {
    if (r.status !== "fulfilled") return;
    const s = r.value as Spec;
    if (s.id.startsWith("fl-")) flooders.push(s);
    else if (s.id === "far-0") farLeg = s;
    else if (s.id === "specask-0") specAsk = s;
    else if (s.id === "ctrl-budget") ctrlBudget = s;
    else if (s.id === "ctrl-empty") ctrlEmpty = s;
    else if (s.id === "ctrl-ws") ctrlWs = s;
    else if (s.id === "ctrl-long") ctrlLong = s;
  });
  flooders.forEach((s, j) => poseOnce(s, ringPos(j)));
  if (farLeg) poseOnce(farLeg, FAR_POS);
  if (ctrlBudget) poseOnce(ctrlBudget, ringPos(60));
  if (ctrlEmpty) poseOnce(ctrlEmpty, ringPos(61));
  if (ctrlWs) poseOnce(ctrlWs, ringPos(62));
  if (ctrlLong) poseOnce(ctrlLong, ringPos(63));
  const allLegs = [...flooders, farLeg, specAsk, ctrlBudget, ctrlEmpty, ctrlWs, ctrlLong].filter(Boolean) as Spec[];
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(1)}s: leg wave joined ${allLegs.length}/${N_FLOOD + 6} — p95 ${Math.round(pct(allLegs.map((s) => s.joinMs), 95))}ms`);
}

// ---- t+6→20s: THE FLOOD — every flooder signs every 1450ms, alternating books --
let floodSent = 0;
const floodTimers: any[] = [];
at(FLOOD_AT, () => {
  flooders.forEach((s, i) => {
    let k = 0;
    const send = () => {
      if (!running || k >= FLOOD_TICKS) { if (floodTimers[i]) clearInterval(floodTimers[i]); return; }
      if (s.ws.readyState !== 1) { k++; return; }
      const book = k % 2 === 0 ? BOOK_A[0] : BOOK_B[0];
      const text = floodText(i, k);
      s.sendStamps.set(text, performance.now());
      floodSent++;
      s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: book, action: "sign", text } }));
      k++;
    };
    send();   // sign k=0 immediately — setInterval alone would first fire at +1450ms (run-1 lesson: 9/10 sent)
    floodTimers.push(setInterval(send, FLOOD_PERIOD_MS));
  });
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(2)}s: FLOOD armed — ${flooders.length} flooders × ${FLOOD_TICKS} signs @${FLOOD_PERIOD_MS}ms`);
});
at(FLOOD_END, () => { floodTimers.forEach(clearInterval); });

// ---- snapshot probes t+9/13/17 (fold-equal + snapshot-size report) -------------
let snapProbesOk = 0;
const snapSizes: number[] = [];
for (const w of SNAP_ATS) {
  at(w, async () => {
    try {
      const p = await connect(`snap-${w / 1000}-${RUN}`, true);
      const v = verifySnapshot(p.snapshot);
      if (v.ok) snapProbesOk++;
      else console.log(`  snap probe t+${w / 1000}s: ${v.errs.join("; ").slice(0, 200)}`);
      snapSizes.push(p.snapshotBytes);
      try { p.ws.close(); } catch {}
    } catch (err) { console.log(`  snap probe t+${w / 1000}s FAILED: ${String(err).slice(0, 120)}`); }
  });
}

// ---- erase waves: A fl-0..7 @t+10 ; B fl-8..15 @t+12 ---------------------------
at(ERASE_A_AT, () => {
  flooders.slice(0, 8).forEach((s) => {
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: BOOK_A[0], action: "erase" } }));
  });
});
at(ERASE_B_AT, () => {
  flooders.slice(8, 16).forEach((s) => {
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: BOOK_B[0], action: "erase" } }));
  });
});

// ---- fairness says (pre/mid/mid) -------------------------------------------------
const FAIR_TEXTS = [`gbfair-a-${RUN}`, `gbfair-b-${RUN}`, `gbfair-c-${RUN}`];
const sayEchoAt = new Map<string, number>();
FAIR_TEXTS.forEach((text, i) => {
  at(FAIR_SAY_ATS[i], () => {
    const sentAt = performance.now();
    const S = perfs[2];
    if (S?.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(FAIR_SAY_ATS[i] + 1_500, () => {
      const hit = S?.sayEcho.get(text);
      if (hit !== undefined) sayEchoAt.set(text, hit - sentAt);
    });
  });
});

// ---- t+22.0s: late wave — 10 embodied joiners (fat-state join p95) ---------------
const lateLegs: Spec[] = [];
at(LATE_AT, async () => {
  const legs = await Promise.allSettled(Array.from({ length: N_LATE }, (_, j) => connect(`late-${j}`, false, 500 + j)));
  legs.forEach((r) => { if (r.status === "fulfilled") lateLegs.push(r.value as Spec); });
  lateLegs.forEach((s, j) => poseOnce(s, ringPos(200 + j)));
});

// ---- t+24.0s: controls — budget boundary / far / empty / ws / long ---------------
let budgetSent = 0;
at(CTRL_AT, () => {
  if (ctrlBudget?.ws.readyState === 1) {
    for (let j = 0; j < BUDGET_BURST; j++) {
      const text = (`B${j}-${RUN}:` + "y".repeat(TEXT_LEN)).slice(0, TEXT_LEN);
      ctrlBudget.sendStamps.set(text, performance.now());
      budgetSent++;
      ctrlBudget.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: BOOK_A[0], action: "sign", text } }));
    }
  }
  if (farLeg?.ws.readyState === 1) farLeg.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: BOOK_A[0], action: "sign", text: "far-away-sign" } }));
  if (ctrlEmpty?.ws.readyState === 1) ctrlEmpty.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: BOOK_A[0], action: "sign", text: "" } }));
  if (ctrlWs?.ws.readyState === 1) ctrlWs.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: BOOK_A[0], action: "sign", text: "     " } }));
  if (ctrlLong?.ws.readyState === 1) ctrlLong.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: BOOK_A[0], action: "sign", text: "L".repeat(200) } }));
});
at(SPECASK_AT, () => {
  if (specAsk?.ws.readyState === 1) specAsk.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: BOOK_A[0], action: "sign", text: "spectators-cannot-sign" } }));
});
at(RECOVERY_AT, () => {
  if (ctrlBudget?.ws.readyState === 1) {
    const text = (`BR-${RUN}:` + "z".repeat(TEXT_LEN)).slice(0, TEXT_LEN);
    ctrlBudget.sendStamps.set(text, performance.now());
    ctrlBudget.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: BOOK_A[0], action: "sign", text } }));
  }
});

// ---- t+26.0s: flight-recorder pull on the seer (report-only; ring 300-capped) ---
at(RECORDER_AT, () => {
  if (SEER?.ws.readyState === 1) SEER.ws.send(JSON.stringify({ type: "debug", reqId: "rec-1", kinds: ["guestbook-lint", "guestbook-skip", "guestbook-trigger"], limit: 300 }));
});

// ---- t+27.0s teardown ------------------------------------------------------------
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  floodTimers.forEach(clearInterval);
  teardownAtTs = performance.now();
  [anchors, flooders, lateLegs, [farLeg, specAsk, ctrlBudget, ctrlEmpty, ctrlWs, ctrlLong].filter(Boolean) as Spec[]].flat().forEach((s) => { try { s.ws.close(); } catch {} });
});

await sleep(DURATION - (performance.now() - t0));
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(300);

// ---- ledger ground truth from log.jsonl (the append-only truth) -----------------
const entries = logEntries();
const logTotalLines = entries.length;
const bySeq = new Map(entries.map((e) => [Number(e.seq), e]));

// ---- THE CHAIN WALK: re-derive every world comp from shared/guestbook.js -------
// Sim state per book = the last WRITTEN comp data (the folded truth). Each use
// fires the same branches reactGuestbook runs; every world write must match
// byte-exactly (canon), triples contiguous, gb.at == use ts, cause == use seq.
type SimRes = { fire: boolean; data?: any; sayArgs?: any; degrade: boolean; skip?: string };
function simFire(state: any, bookId: string, action: string, actor: string, rawText: unknown, rawWho: unknown, atTs: number, inReach: boolean, hasPose: boolean): SimRes {
  const { cfg, entries: cur } = normalizeGuestbook(state ?? {});
  if (action === "sign") {
    if (!cfg.open) return { fire: false, degrade: false, skip: "closed" };
    const text = typeof rawText === "string" ? rawText.trim().slice(0, 160) : "";
    if (!text) return { fire: false, degrade: false, skip: "no text" };
    if (!hasPose || !inReach) return { fire: false, degrade: false, skip: "out of reach" };
    const next = { who: actor, text, at: atTs };
    const shape = { ...(cfg.authored as Record<string, unknown>), entries: guestbookTrim(cur, next, cfg.cap) };
    const over = JSON.stringify(shape).length > 8000;
    const data = over ? { entries: shape.entries } : shape;
    return {
      fire: true, degrade: over, data,
      sayArgs: { text: cfg.signAt ?? `${actor} writes in the guestbook`, id: bookId, gb: { who: actor, text, at: atTs }, cause: undefined, by: actor },
    };
  }
  // erase
  if (!cfg.open) return { fire: false, degrade: false, skip: "closed" };
  const target = typeof rawWho === "string" && rawWho.trim() ? rawWho.trim().slice(0, 64) : null;
  const who = target ?? actor;
  if (!hasPose || !inReach) return { fire: false, degrade: false, skip: "out of reach" };
  const remaining = cur.filter((e: any) => e.who !== who);
  if (remaining.length === cur.length) return { fire: false, degrade: false, skip: "nothing to erase" };
  const erased = [...new Set(cur.filter((e: any) => e.who === who).map((e: any) => e.who))];
  const shape = { ...(cfg.authored as Record<string, unknown>), entries: remaining };
  const over = JSON.stringify(shape).length > 8000;
  const data = over ? { entries: shape.entries } : shape;
  return {
    fire: true, degrade: over, data,
    sayArgs: { text: cfg.eraseAt ?? (target != null ? `${actor} strikes ${who}'s words from the guestbook` : `${who} strikes their words from the guestbook`), id: bookId, gb: { erased, at: atTs }, cause: undefined, by: actor },
  };
}
const BOOK_IDS = new Set([BOOK_A[0], BOOK_B[0]]);
const FAR_IDS = new Set(["far-0"]);
const simState: Record<string, any> = {};
const simFinal: Record<string, any> = {};
let chainErr = 0, adjErr = 0, gbAtErr = 0, causeErr = 0, orphanComp = 0;
let degradeTotal = 0, maxCompBytes = 0;
let floodAccepted = 0, budgetOk = 0, budgetRecovery = 0, farSkips = 0, emptySkips = 0;
let longStoredLen = -1;
let capCollapseAt: number | null = null;
const expectedCompSeqs = new Set<number>();
const walkLines = (() => { let n = 0; return { add: (k = 1) => { n += k; }, get: () => n }; })();
for (const e of entries) {
  const seq = Number(e.seq);
  const verb = e.verb;
  if (verb === "comp" && e.args?.type === "guestbook") {
    const bid = String(e.args.id);
    const raw = JSON.stringify(e.args?.data ?? null);
    if (e.actor !== "world") { simState[bid] = e.args?.data ?? null; walkLines.add(); continue; }
    // a world write must be the expected continuation of a use we processed
    if (!expectedCompSeqs.has(seq)) { orphanComp++; continue; }
    if (raw.length > maxCompBytes) maxCompBytes = raw.length;
    walkLines.add(1);   // the comp only — its say adds itself when the loop reaches it
    continue;
  }
  if (verb !== "use" || !BOOK_IDS.has(String(e.args?.id))) { if (verb !== "comp") walkLines.add(); else walkLines.add(); continue; }
  walkLines.add();
  const bid = String(e.args.id);
  const action = String(e.args.action ?? "use");
  const actor = String(e.actor);
  const inReach = !FAR_IDS.has(actor);
  const r = simFire(simState[bid], bid, action, actor, (e.args as any)?.text, (e.args as any)?.who, Number(e.ts), inReach, true);
  if (actor.startsWith("fl-") && action === "sign" && r.fire) floodAccepted++;
  if (actor === "ctrl-budget" && action === "sign" && r.fire) { if (budgetOk < 12) budgetOk++; else budgetRecovery++; }
  if (actor === "far-0" && !r.fire) farSkips++;
  if ((actor === "ctrl-empty" || actor === "ctrl-ws") && !r.fire) emptySkips++;
  if (actor === "ctrl-long" && r.fire) {
    const ents = (r.data as any)?.entries as any[] | undefined;
    longStoredLen = ents?.[0]?.text?.length ?? -1;
  }
  if (!r.fire) continue;
  if (r.degrade) degradeTotal++;
  // the triple: comp at seq+1, say at seq+2 — byte-exact vs the simulation
  const comp = bySeq.get(seq + 1);
  const say = bySeq.get(seq + 2);
  if (!comp || comp.verb !== "comp" || comp.actor !== "world" || String(comp.args?.id) !== bid || comp.args?.type !== "guestbook") { adjErr++; chainErr++; continue; }
  expectedCompSeqs.add(seq + 1);
  if (canon(comp.args?.data) !== canon(r.data)) {
    chainErr++;
    if (chainErr <= 3) console.log(`  chain mismatch @seq ${seq} (${bid} ${action} by ${actor}): server=${JSON.stringify(comp.args?.data)?.slice(0, 160)} sim=${JSON.stringify(r.data)?.slice(0, 160)}`);
  } else {
    // cap-collapse detection: cap was carried, now absent
    if (capCollapseAt === null && simState[bid]?.cap != null && (r.data as any)?.cap == null) capCollapseAt = floodAccepted + budgetOk + budgetRecovery;
    simState[bid] = r.data;
    simFinal[bid] = r.data;
  }
  if (!say || say.verb !== "say" || say.actor !== "world") { adjErr++; causeErr++; continue; }
  const wantSay = { ...r.sayArgs, cause: seq };
  if (canon(say.args) !== canon(wantSay)) { chainErr++; if (chainErr <= 6) console.log(`  say mismatch @seq ${seq}: server=${JSON.stringify(say.args)?.slice(0, 160)} sim=${JSON.stringify(wantSay)?.slice(0, 160)}`); }
  const gb = (say.args as any)?.gb;
  if (gb && Number(gb.at) !== Number(e.ts)) gbAtErr++;
  if (Number((say.args as any)?.cause) !== seq) causeErr++;
}
// books that never fired keep their authored state as final
for (const bid of BOOK_IDS) if (simFinal[bid] === undefined) simFinal[bid] = simState[bid] ?? null;
const gbSayCausesWant = new Set(entries.filter((e) => e.verb === "say" && e.actor === "world" && (e.args as any)?.gb != null).map((e) => Number((e.args as any).cause)));
const worldCompsWant = entries.filter((e) => e.verb === "comp" && e.actor === "world" && e.args?.type === "guestbook").length;

// budget refusals heard by the boundary leg
const budgetRefused = ctrlBudget ? ctrlBudget.useErrors.filter((x) => x.includes(RATE_REFUSAL_LABEL)).length : 0;
const floodRefusals = flooders.reduce((a, s) => a + s.useErrors.filter((x) => x.includes(RATE_REFUSAL_LABEL)).length, 0);
const specRefusals = specAsk ? specAsk.useErrors.filter((x) => x === SPEC_REFUSAL).length : 0;
const specLines = entries.filter((e) => e.actor === "specask-0").length;

// sign echo: every flood text's own say echo (latency from send stamp)
const signLat: number[] = [];
for (const s of flooders) {
  for (const [text, sentAt] of s.sendStamps) {
    const recv = s.gbEchoAt.get(text);
    if (recv !== undefined) signLat.push(recv - sentAt);
  }
}
signLat.sort((a, b) => a - b);

// final quiet fold equality (post-teardown world, snapshot from a fresh join)
let finalFoldEqual = false;
{
  try {
    const quiet = await connect(`quiet-${RUN}`, true);
    finalFoldEqual = verifySnapshot(quiet.snapshot).ok;
    try { quiet.ws.close(); } catch {}
  } catch { /* world torn down? */ }
}

const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const suspicious = (await logFile.text()).split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));
const logBytes = readFileSync(LOG_JSONL, "utf8").length;

// ---- SIGKILL restart: the flood log must replay to the SAME books ---------------
let restartBoot = 0, restartFoldEqual = false, restartBooksExact = false, restartLineDrift = 999;
let restartDiff = ""; let restartPresent = -1;
{
  const pre = foldPrefix(Infinity);
  const preCanon = canon(pre.st);
  const preLines = logTotalLines;
  server.kill("SIGKILL");
  await sleep(600);
  server = spawnServer();
  if (await waitReady()) {
    restartBoot = 1;
    try {
      const probe = await connect(`restart-probe-${RUN}`, true);
      const v = verifySnapshot(probe.snapshot);
      restartPresent = (probe.snapshot?.present ?? []).length;
      const booksState = probe.snapshot?.state?.entities ?? {};
      const gotA = booksState[BOOK_A[0]]?.comp?.guestbook ?? null;
      const gotB = booksState[BOOK_B[0]]?.comp?.guestbook ?? null;
      const booksOk = canon(gotA) === canon(simFinal[BOOK_A[0]]) && canon(gotB) === canon(simFinal[BOOK_B[0]]);
      restartBooksExact = booksOk;
      restartFoldEqual = v.ok && v.covered === pre.maxSeq;
      if (!restartFoldEqual || !booksOk) {
        const parts: string[] = [`covered=${v.covered} logMaxSeq=${pre.maxSeq} v.ok=${v.ok}`, `gb-a final len ${Array.isArray((gotA as any)?.entries) ? (gotA as any).entries.length : "?"} vs sim ${Array.isArray(simFinal[BOOK_A[0]]?.entries) ? simFinal[BOOK_A[0]].entries.length : "?"}`];
        if (canon(preCanon) !== canon(probe.snapshot?.state ?? {})) parts.push("state canon differs");
        restartDiff = v.errs.concat(parts).join(" | ").slice(0, 500);
      }
      await sleep(2_600);   // ≥2 sweeps on the replayed world — boot heal mints nothing
      const post = logEntries();
      restartLineDrift = Math.abs(post.length - preLines);
      try { probe.ws.close(); } catch {}
    } catch (err) { restartFoldEqual = false; restartLineDrift = 999; restartDiff = String(err).slice(0, 300); }
  }
}

const m: Measurements = {
  anchorJoined: anchors.length, anchorJoinP95: pct(joinTimes, 95),
  legJoined: [...flooders, farLeg, specAsk, ctrlBudget, ctrlEmpty, ctrlWs, ctrlLong].filter(Boolean).length,
  legJoinP95: pct([...flooders, farLeg, specAsk, ctrlBudget, ctrlEmpty, ctrlWs, ctrlLong].filter(Boolean).map((s: Spec) => s.joinMs), 95),
  lateJoined: lateLegs.length, lateJoinP95: lateLegs.length ? pct(lateLegs.map((s) => s.joinMs), 95) : Infinity,
  floodAccepted, floodRefusals,
  chainErr, adjErr, gbAtErr, causeErr, orphanComp,
  degradeTotal, maxCompBytes: JSON.stringify(maxCompBytes).length ? maxCompBytes : 0,
  budgetOk, budgetRefused, budgetRecovery,
  farSkips, emptySkips, longStoredLen,
  specRefusals, specLines,
  fairSays: FAIR_TEXTS.filter((t) => sayEchoAt.has(t)).length,
  sayP95: sayEchoAt.size ? pct([...sayEchoAt.values()], 95) : Infinity,
  signEchoN: signLat.length, signEchoP95: signLat.length ? pct(signLat, 95) : Infinity,
  seerSayCauses: SEER ? SEER.gbSayCauses.size : 0, seerSayCausesWant: gbSayCausesWant.size,
  seerComps: SEER ? SEER.gbComps : 0, seerCompsWant: worldCompsWant,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal, probeP95: pct(probeAll, 95),
  snapProbesOk, finalFoldEqual,
  logTotal: logTotalLines, logWalk: walkLines.get(),
  restartBoot, restartFoldEqual, restartBooksExact,
  restartLineDrift, finalPresent: restartPresent < 0 ? 999 : restartPresent,
  rssPeakGrowthMB: rssPeakGrowth, logSuspicious: suspicious.length,
};
const fail = evaluate(m);

// recorder observation (report-only)
const recPull = SEER?.debugPulls?.find((d) => d.reqId === "rec-1");
const recByKind: Record<string, number> = {};
if (recPull) for (const ev of recPull.events ?? []) recByKind[ev.kind] = (recByKind[ev.kind] ?? 0) + 1;

const simLenA = Array.isArray(simFinal[BOOK_A[0]]?.entries) ? simFinal[BOOK_A[0]].entries.length : -1;
const simLenB = Array.isArray(simFinal[BOOK_B[0]]?.entries) ? simFinal[BOOK_B[0]].entries.length : -1;

console.log(`\nresults
  anchors               ${anchors.length}/${1 + rest.length} joined — p95 ${Math.round(m.anchorJoinP95)}ms (${anchorFailed} failed)
  leg wave              ${m.legJoined}/${N_FLOOD + 6} joined — p95 ${Math.round(m.legJoinP95)}ms · late ${m.lateJoined}/${N_LATE} p95 ${Math.round(m.lateJoinP95)}ms
  THE FLOOD            ${floodSent} signs sent — ${m.floodAccepted}/${EXP_FLOOD_SIGNS} accepted · ${m.floodRefusals} flood refusals (pace is budget-legal)
  chain vs simulation  ${m.chainErr} data mismatches · ${m.adjErr} adjacency breaks · ${m.orphanComp} orphan comps · gb.at err ${m.gbAtErr} · cause err ${m.causeErr}
  degrade path         fired ${m.degradeTotal}x (pinned ${EXP_DEGRADE}) · cap collapse ${BOOK_A[1]}→20 observed at sign #${capCollapseAt ?? "—"} · max comp ${m.maxCompBytes}B (ceiling ${MAX_COMP_BYTES}B)
  final books          gb-a ${simLenA} entries · gb-b ${simLenB} entries (want ${EXP_BOOKB_FINAL})
  budget boundary      ${m.budgetOk} ok / ${m.budgetRefused} refused verbatim / recovery ${m.budgetRecovery}
  controls             far skips ${m.farSkips} · no-text skips ${m.emptySkips} · long text stored ${m.longStoredLen} chars · spectator ${m.specRefusals}/1 verbatim · ${m.specLines} spec lines
  fair says            ${m.fairSays}/3 — p95 ${sayEchoAt.size ? Math.round(m.sayP95) : "MISSED"}ms
  sign echo            ${m.signEchoN} own-say receipts — p95 ${Math.round(m.signEchoP95)}ms
  seer fanout          gb-say causes ${m.seerSayCauses}/${m.seerSayCausesWant} · world comps ${m.seerComps}/${m.seerCompsWant}
  anchor frame/s       p50 ${m.fpsP50.toFixed(1)} (window ${Math.round((teardownAtTs - t0) / 1000)}s connected)
  frame latency ms     p50 ${Math.round(pct(latAll, 50))} p95 ${Math.round(m.latP95)} max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps       ${gapsTotal} across ${specs.length} spectators
  http probe ms        p95 ${Math.round(m.probeP95)} (n=${probeAll.length}) · errors ${probeErrors.n}
  snapshot probes      ${m.snapProbesOk}/3 fold-equal mid-flood · sizes ${snapSizes.map((b) => Math.round(b / 1024) + "KB").join(" ")} · final quiet fold ${finalFoldEqual ? "EXACT" : "DIFFERS"}
  world log            ${logTotalLines} lines == walk ${m.logWalk} · ${Math.round(logBytes / 1024)}KB total (~${Math.round(logBytes / Math.max(1, m.floodAccepted + m.budgetOk + m.budgetRecovery))}B/sign)
  flight recorder      ${JSON.stringify(recByKind)} in 300-ring at t+26s (report-only)
  SIGKILL restart      boot ${restartBoot}/1 · fold ${restartFoldEqual ? "EXACT-equal" : "DIFFERS"} · books ${restartBooksExact ? "byte-exact vs sim" : "WRONG"} · line drift ${restartLineDrift} · present ${restartPresent}
  server rss           ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log           ${suspicious.length} suspicious lines
`);
if (restartDiff) console.log(`  restart diff: ${restartDiff}`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of [anchors, flooders, lateLegs, [farLeg, specAsk, ctrlBudget, ctrlEmpty, ctrlWs, ctrlLong].filter(Boolean) as Spec[]].flat()) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — ${m.floodAccepted} signs flooded: every comp byte-exact vs the shared math, degrade fired exactly ${EXP_DEGRADE}x, comp ceiling held, budget exact, replay books exact`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
