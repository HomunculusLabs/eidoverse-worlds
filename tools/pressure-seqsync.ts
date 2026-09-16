// Pressure scenario 31: SEQUENCER SYNC STORM — 50 concurrent pattern edits
// converge to ONE consistent playback state.
//
// The sequencer engine (server/sequencer.ts + shared/sequencer.js, vocab-25):
// comp {type:"sequencer"} on an entity; `use {action:"seq", steps}` = rank 0 +
// arm's reach (visitors CAN edit — only the raw comp verb is builder-gated);
// every accepted edit is ONE world-authored comp transition + ONE say with sq
// provenance, cause-paired to the use. A grid swap while playing KEEPS the
// anchor (phase continuity); an identical grid re-write is a mint-nothing
// no-op; start/stop are transitions with skips on same-state. Dispatch is
// synchronous per verb (pressure-8 law), so the storm is the MEASUREMENT: do
// concurrent edits serialize to exactly-one-winner, no-op dedup, explicit
// refusals — and does every runtime (live snapshot, staggered step probes,
// SIGKILL replay) fold the SAME grid + run bit + anchor and derive the same
// step from the closed form?
//
// Population (pinned before measuring — 228 peak sockets):
//   24 embodied perf anchors @15Hz (walking circle) + 136 spectators (seer =
//   witness + recorder) + 8 embodied machine-holders (pose-once in reach,
//   quiescent) + 50 spectator-editors (spectate:true — the hostile/curious
//   crowd) + 6 late embodied joiners + 4 staggered step-derivers.
//
// Timeline (wall t):
//   t+2.0   perf-0 spawns sq-machine @ [6,0,6]; perf-1 attaches comp
//           sequencer {bpm:120, gain:0.6, reach:4}.
//   t+3.5   8 holders join, pose-once on a golden ring r 2.4–3.3m (in reach).
//   t+5.0   50 spectator-editors join (spectate).
//   t+8.0   W1 THE STORM: all 8 holders + all 50 spec-editors fire the SAME
//           canonical 16-step pattern C1 in one drain → 1 accepted write
//           (exactly-one-winner), 7 logged no-op skips ("the pattern is
//           unchanged"), 50 explicit spectator refusals.
//   t+8.35  40 spec-editors re-fire C1 → 40 more refusals (90 total).
//   t+9.5   fold probe A (fresh spectator join) + fair say 1.
//   t+13.0/13.3/13.6  W2 run churn: holders[0..3] start ×4 → 1 transition;
//           holders[4..7] stop ×4 → 1; holders[0..3] start ×4 → 1. (3 run
//           transitions; the 9 same-state extras are skip no-ops.)
//   t+15.0  fold probe B + fair say 2.
//   t+17.0  W3 second storm: 8 holders + 40 spec-editors fire canonical C2
//           (grid swap WHILE PLAYING) → 1 accepted write, anchor preserved,
//           7 no-op skips, 40 refusals.
//   t+18.5  late embodied wave ×6 (posed 40m out — churn join fairness).
//   t+19.0  fold probe C.
//   t+21.0  W4 rate burst: holder-6 fires 14 DISTINCT patterns back-to-back
//           → 12 accepted writes + 2 exact "slow down" refusals.
//   t+23.0  4 staggered step-derivers (400ms apart) — each folds the machine
//           and derives stepAt at its own now; ks must be phase-consistent.
//   t+24.0  probe say + flight-recorder pull (report-only).
//   t+26.0  teardown. t+33.0 SIGKILL → restart → replay fold EXACT, anchor
//           unchanged (time held the truth), 2 sweeps mint nothing.
//
// Acceptance gates (pinned before measuring — see TH):
//   anchors 160/160 p95<3s · holders 8/8 · spec-eds 50/50 · late 6/6 p95<3s ·
//   step probes 4/4 · W1 writes EXACT 1 (single winner) + 14 no-op skips ·
//   W2 run transitions EXACT [start,stop,start] · W3 writes 1 anchor-
//   preserved · W4 writes 12 + refusals 2 "slow down" verbatim · spectator
//   edits refused 130/130 verbatim (50 W1 + 40 W1B + 40 W3), 0 spec-authored log lines · engine chain:
//   every sequencer comp at k pairs use at k−1 + say at k+1 with cause==k−1
//   (0 pair/cause errors) · every written grid ∈ the authored set verbatim ·
//   anchor law: at constant from each start transition until the next stop ·
//   run flags exact · fold probes 3/3 == fold(log through covered) · final
//   snapshot fold-equal with last grid + playing + preserved anchor · 4
//   staggered derivers agree (k monotone, phase-consistent ±1) · restart:
//   boot, fold EXACT-equal, at identical, drift 0, present 0 · fair 2 + probe
//   1 says p95<500ms · fps p50≥12, lat p95<250ms, gaps≤300 · log 81 lines ==
//   derived EXACT · RSS peak−postJoin <+60MB · 0 suspicious lines.
//
//   SERVER_DIR=/tmp/pressure31-wt PORT=8970 bun tools/pressure-seqsync.ts
//   SELFTEST=1 bun tools/pressure-seqsync.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { emptyState, foldEntry } from "../shared/fold.js";
import { normalizeSequencer, stepAt } from "../shared/sequencer.js";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure31-wt";
const PORT = Number(process.env.PORT ?? 8970);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure31-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 136;
const N_HOLD = 8, N_SPECED = 50, N_SPECED2 = 40, N_LATE = 6, N_DERIVE = 4;
const POSE_HZ = 15;
const MACHINE_POS = [6, 0, 6];
const BPM = 120, REACH = 4;
const C1 = [0, null, 4, null, 2, null, 5, null, 0, null, 4, null, 2, null, 6, null];
const C2 = [7, null, 4, null, 9, null, 2, null, 7, null, 4, null, 9, null, 2, null];
const burstPattern = (j: number) => Array.from({ length: 16 }, (_, k) => (k + j) % 7);
const DRESS_AT = 2_000, HOLDERS_AT = 3_500, SPECED_AT = 5_000;
const W1_AT = 8_000, W1B_AT = 8_350, FOLD_A_AT = 9_500;
const W2A_AT = 13_000, W2B_AT = 13_300, W2C_AT = 13_600;
const FOLD_B_AT = 15_000, W3_AT = 17_000, LATE_AT = 18_500, FOLD_C_AT = 19_000;
const W4_AT = 21_000, DERIVE_AT = 23_000, PROBE_AT = 24_000;
const TEARDOWN_AT = 26_000, KILL_AT = 33_000;
const DURATION = 41_000;
const MSG_RATE = "600";
const SELFTEST = process.env.SELFTEST === "1";
const LOG_JSONL = `${WORLDS}/${WORLD}/log.jsonl`;
const SPEC_REFUSAL = "spectators can't author — join embodied to build";
const RATE_REFUSAL = "slow down — verb rate limit";
const STEP_MS = 60000 / BPM;   // 500ms at 120bpm

// derived log arithmetic (pinned):
//   base: genesis + owner grant + spawn + comp author = 4
//   W1: 8 logged uses (1 write) = 8 + 1 comp + 1 say
//   W2: 12 logged uses, 3 transitions = 12 + 3 + 3
//   W3: 8 logged uses (1 write) = 8 + 1 + 1
//   W4: 12 accepted uses (2 refused never log) = 12 + 12 + 12
//   fair 2 + probe 1 says
const EXP_LOG = 4 + 10 + 18 + 10 + 36 + 3;          // 81
const EXP_NOOP_SKIPS = 14;                          // 7 (W1) + 7 (W3)
const EXP_RUN_TRANSITIONS = 3;                      // start, stop, start

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorTotal: 160, anchorJoinP95Ms: 3_000,
  holderTotal: N_HOLD, specEdTotal: N_SPECED,
  lateTotal: N_LATE, lateJoinP95Ms: 3_000,
  deriveTotal: N_DERIVE,
  w1Writes: 1, noopSkips: EXP_NOOP_SKIPS,
  runTransitions: EXP_RUN_TRANSITIONS,
  w3Writes: 1, w4Writes: 12, w4Refusals: 2,
  specRefusals: 130, specEdLines: 0,
  pairErr: 0, causeErr: 0, unknownGrid: 0, runFlagErr: 0, anchorErr: 0,
  foldProbes: 3, finalFoldEqual: true, anchorPreserved: true,
  deriveAgree: N_DERIVE,
  restartBoot: 1, restartFoldEqual: true, restartAtEqual: true,
  restartLineDrift: 0, finalPresent: 0,
  fairSays: 2, probeSays: 1, sayP95Ms: 500,
  fpsP50: 12, latP95Ms: 250, seqGaps: 300,
  logExact: true,
  rssPeakGrowthMB: 60, logSuspicious: 0,
};
type Measurements = {
  anchorJoined: number; anchorJoinP95: number;
  holderJoined: number; specEdJoined: number;
  lateJoined: number; lateJoinP95: number;
  deriveJoined: number;
  w1Writes: number; noopSkips: number;
  runTransitions: number;
  w3Writes: number; w4Writes: number; w4Refusals: number;
  specRefusals: number; specEdLines: number;
  pairErr: number; causeErr: number; unknownGrid: number; runFlagErr: number; anchorErr: number;
  foldProbes: number; finalFoldEqual: boolean; anchorPreserved: boolean;
  deriveAgree: number;
  restartBoot: number; restartFoldEqual: boolean; restartAtEqual: boolean;
  restartLineDrift: number; finalPresent: number;
  fairSays: number; probeSays: number; sayP95: number;
  fpsP50: number; latP95: number; gaps: number;
  logTotal: number; logExpected: number;
  rssPeakGrowthMB: number; logSuspicious: number;
};

function evaluate(m: Measurements): string[] {
  const f: string[] = [];
  if (m.anchorJoined !== TH.anchorTotal) f.push(`anchors ${m.anchorJoined}/${TH.anchorTotal} joined`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) f.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.holderJoined !== TH.holderTotal) f.push(`holders ${m.holderJoined}/${TH.holderTotal} joined`);
  if (m.specEdJoined !== TH.specEdTotal) f.push(`spectator-editors ${m.specEdJoined}/${TH.specEdTotal} joined`);
  if (m.lateJoined !== TH.lateTotal) f.push(`late wave ${m.lateJoined}/${TH.lateTotal} joined`);
  if (m.lateJoinP95 > TH.lateJoinP95Ms) f.push(`late join p95 ${Math.round(m.lateJoinP95)}ms > ${TH.lateJoinP95Ms}ms`);
  if (m.deriveJoined !== TH.deriveTotal) f.push(`step-derivers ${m.deriveJoined}/${TH.deriveTotal} joined`);
  if (m.w1Writes !== TH.w1Writes) f.push(`W1 writes ${m.w1Writes} != ${TH.w1Writes} (exactly-one-winner violated)`);
  if (m.noopSkips !== TH.noopSkips) f.push(`no-op skips ${m.noopSkips} != ${TH.noopSkips} (dedup broken)`);
  if (m.runTransitions !== TH.runTransitions) f.push(`run transitions ${m.runTransitions} != ${TH.runTransitions}`);
  if (m.w3Writes !== TH.w3Writes) f.push(`W3 writes ${m.w3Writes} != ${TH.w3Writes}`);
  if (m.w4Writes !== TH.w4Writes) f.push(`W4 writes ${m.w4Writes} != ${TH.w4Writes} (rate burst arithmetic)`);
  if (m.w4Refusals !== TH.w4Refusals) f.push(`W4 rate refusals ${m.w4Refusals} != ${TH.w4Refusals} verbatim`);
  if (m.specRefusals !== TH.specRefusals) f.push(`spectator-edit refusals ${m.specRefusals}/${TH.specRefusals} verbatim`);
  if (m.specEdLines !== TH.specEdLines) f.push(`spectator-editors authored ${m.specEdLines} log lines (want 0)`);
  if (m.pairErr > TH.pairErr) f.push(`${m.pairErr} engine comps without adjacent use/say pairing`);
  if (m.causeErr > TH.causeErr) f.push(`${m.causeErr} say cause != its use seq`);
  if (m.unknownGrid > TH.unknownGrid) f.push(`${m.unknownGrid} written grids outside the authored set`);
  if (m.runFlagErr > TH.runFlagErr) f.push(`${m.runFlagErr} run-flag errors in the transition chain`);
  if (m.anchorErr > TH.anchorErr) f.push(`${m.anchorErr} anchor violations (at moved without a start transition)`);
  if (m.foldProbes !== TH.foldProbes) f.push(`fold probes ${m.foldProbes}/${TH.foldProbes} == fold(log through covered)`);
  if (!m.finalFoldEqual) f.push(`final snapshot state != fold(log)`);
  if (!m.anchorPreserved) f.push(`grid swaps moved the anchor (phase continuity broken)`);
  if (m.deriveAgree !== TH.deriveAgree) f.push(`step derivers agreeing ${m.deriveAgree}/${TH.deriveAgree} (runtimes diverged)`);
  if (m.restartBoot !== TH.restartBoot) f.push(`restart boot failed`);
  if (!m.restartFoldEqual) f.push(`restart fold DIFFERS from fold(log)`);
  if (!m.restartAtEqual) f.push(`restart anchor at DIFFERS (replay moved the anchor)`);
  if (m.restartLineDrift !== TH.restartLineDrift) f.push(`restart line drift ${m.restartLineDrift} (replay minted lines)`);
  if (m.finalPresent !== TH.finalPresent) f.push(`final present ${m.finalPresent} (want 0)`);
  if (m.fairSays !== TH.fairSays) f.push(`fair says ${m.fairSays}/${TH.fairSays} appended+echoed`);
  if (m.probeSays !== TH.probeSays) f.push(`probe says ${m.probeSays}/${TH.probeSays}`);
  if (m.sayP95 > TH.sayP95Ms) f.push(`say p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) f.push(`fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) f.push(`frame lat p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) f.push(`${m.gaps} frame seq gaps > ${TH.seqGaps}`);
  if (TH.logExact && m.logTotal !== m.logExpected) f.push(`log lines ${m.logTotal} != derived ${m.logExpected} (drift ${Math.abs(m.logTotal - m.logExpected)})`);
  if (m.rssPeakGrowthMB > TH.rssPeakGrowthMB) f.push(`RSS peak growth ${m.rssPeakGrowthMB}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.logSuspicious !== TH.logSuspicious) f.push(`${m.logSuspicious} suspicious server-log lines`);
  return f;
}

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
const healthy: Measurements = {
  anchorJoined: 160, anchorJoinP95: 140,
  holderJoined: 8, specEdJoined: 50,
  lateJoined: 6, lateJoinP95: 80,
  deriveJoined: 4,
  w1Writes: 1, noopSkips: 14,
  runTransitions: 3,
  w3Writes: 1, w4Writes: 12, w4Refusals: 2,
  specRefusals: 130, specEdLines: 0,
  pairErr: 0, causeErr: 0, unknownGrid: 0, runFlagErr: 0, anchorErr: 0,
  foldProbes: 3, finalFoldEqual: true, anchorPreserved: true,
  deriveAgree: 4,
  restartBoot: 1, restartFoldEqual: true, restartAtEqual: true,
  restartLineDrift: 0, finalPresent: 0,
  fairSays: 2, probeSays: 1, sayP95: 12,
  fpsP50: 14.8, latP95: 20, gaps: 0,
  logTotal: EXP_LOG, logExpected: EXP_LOG,
  rssPeakGrowthMB: 21, logSuspicious: 0,
};
if (SELFTEST) {
  const a = evaluate(healthy);
  const breaches: Measurements[] = [];
  const mk = (patch: Partial<Measurements>) => ({ ...healthy, ...patch });
  breaches.push(mk({ anchorJoined: 158 }));
  breaches.push(mk({ anchorJoinP95: 3_400 }));
  breaches.push(mk({ holderJoined: 7 }));
  breaches.push(mk({ specEdJoined: 48 }));
  breaches.push(mk({ lateJoined: 5 }));
  breaches.push(mk({ lateJoinP95: 3_300 }));
  breaches.push(mk({ deriveJoined: 3 }));
  breaches.push(mk({ w1Writes: 2 }));                 // two winners = torn state
  breaches.push(mk({ w1Writes: 0 }));                 // lost edit
  breaches.push(mk({ noopSkips: 6 }));
  breaches.push(mk({ runTransitions: 5 }));           // double-write run churn
  breaches.push(mk({ runTransitions: 2 }));
  breaches.push(mk({ w3Writes: 2 }));
  breaches.push(mk({ w4Writes: 13 }));                // rate gate leaked
  breaches.push(mk({ w4Refusals: 0 }));
  breaches.push(mk({ specRefusals: 88 }));
  breaches.push(mk({ specEdLines: 3 }));
  breaches.push(mk({ pairErr: 1 }));
  breaches.push(mk({ causeErr: 2 }));
  breaches.push(mk({ unknownGrid: 1 }));              // a grid nobody authored
  breaches.push(mk({ runFlagErr: 1 }));
  breaches.push(mk({ anchorErr: 1 }));                // anchor drift
  breaches.push(mk({ foldProbes: 2 }));
  breaches.push(mk({ finalFoldEqual: false }));
  breaches.push(mk({ anchorPreserved: false }));
  breaches.push(mk({ deriveAgree: 2 }));              // runtimes diverged
  breaches.push(mk({ restartBoot: 0 }));
  breaches.push(mk({ restartFoldEqual: false }));
  breaches.push(mk({ restartAtEqual: false }));
  breaches.push(mk({ restartLineDrift: 2 }));
  breaches.push(mk({ finalPresent: 1 }));
  breaches.push(mk({ fairSays: 1 }));
  breaches.push(mk({ probeSays: 0 }));
  breaches.push(mk({ sayP95: 700 }));
  breaches.push(mk({ fpsP50: 10.2 }));
  breaches.push(mk({ latP95: 400 }));
  breaches.push(mk({ gaps: 400 }));
  breaches.push(mk({ logTotal: EXP_LOG + 2 }));
  breaches.push(mk({ rssPeakGrowthMB: 75 }));
  breaches.push(mk({ logSuspicious: 1 }));
  const names = ["anchors", "joinP95", "holders", "specEd", "late", "lateP95", "derivers",
    "w1-two-winners", "w1-lost", "noops", "run-over", "run-under", "w3", "w4-writes",
    "w4-refusals", "specRefusals", "specLines", "pair", "cause", "unknownGrid", "runFlag",
    "anchor", "foldProbes", "finalFold", "anchorKept", "deriveAgree", "boot", "restartFold",
    "restartAt", "lineDrift", "present", "fair", "probe", "sayP95", "fps", "lat", "gaps",
    "logExact", "rss", "suspicious"];
  const b: string[] = [];
  breaches.forEach((x, i) => { const r = evaluate(x); if (!r.length) b.push(names[i]); });
  const ok = a.length === 0 && b.length === 0;
  console.log(ok ? `SELFTEST PASS — healthy gates clean, all ${breaches.length} breached gates fire` : `SELFTEST FAIL — clean:[${a}] missing:[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${POSE_HZ}Hz + ${N_SPEC} spec anchors; ${N_HOLD} embodied holders (ring r2.4-3.3 < reach ${REACH}); ${N_SPECED} spectator-editors; machine @[${MACHINE_POS}] bpm ${BPM}. W1 t+${W1_AT / 1000}s THE STORM: 8+50 simultaneous seq edits of canonical C1 → 1 winner + 7 no-op skips + 50 refusals; +${W1B_AT - W1_AT}ms 40 re-fires → 90 refusals; W2 t+13/13.3/13.6s start/stop/start ×4 each → 3 transitions; W3 t+${W3_AT / 1000}s 8+40 fire C2 while playing → 1 write anchor-preserved; W4 t+${W4_AT / 1000}s holder-6 ×14 distinct → 12 writes + 2 "slow down"; 4 staggered derivers t+${DERIVE_AT / 1000}s; SIGKILL t+${KILL_AT / 1000}s → replay fold+anchor exact. Log ${EXP_LOG} lines; ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: joins 160+8+50+6+4 · w1=${TH.w1Writes} noop=${TH.noopSkips} run=${TH.runTransitions} w3=${TH.w3Writes} w4=${TH.w4Writes}+${TH.w4Refusals}refused specRefusals=${TH.specRefusals}verbatim/0-lines chain(pair/cause/grid/run/anchor)=0 foldProbes=3 finalFold=equal anchorPreserved=true derivers=4 restart=boot+fold+at+drift0+present0 says=2+1@p95<${TH.sayP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps<=${TH.seqGaps} log=${EXP_LOG}EXACT rss<+${TH.rssPeakGrowthMB}MB suspicious=${TH.logSuspicious}`);

// ---- fd budget: ~230 concurrent sockets + server must fit ----------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 600) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 600 — launch as: ulimit -n 1024 && bun tools/pressure-seqsync.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure31-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
function spawnServer() {
  return Bun.spawn({
    cmd: ["bun", "run", "server/server.ts"],
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR },
    stdout: logFile, stderr: logFile,
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

// ---- client chassis (vendorburst-proven + sequencer tracking) ------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number; snapshot: any;
  closed: boolean; closeCode: number; id: string;
  sayEcho: Map<string, number>;
  useErrors: string[];
  seqEchoAt: number | undefined;        // first world sq say caused by THIS client
  debugPulls: any[];
  derivedK: number | undefined;         // step-derivers: k at own now
  derivedAt: number | undefined;        // anchor the derivation used
  derivedNow: number | undefined;
  errs: string[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, snapshot: null, closed: false, closeCode: 0, sayEcho: new Map(), useErrors: [], seqEchoAt: undefined, derivedK: undefined, derivedAt: undefined, derivedNow: undefined, debugPulls: [], errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapshot = m; s.snapAt = performance.now(); s.joinMs = s.snapAt - s.openAt;
        for (const e of m.entries ?? []) if (e.verb === "say") s.says.add(e.args?.text);
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "log") {
        const v = m.entry?.verb;
        if (v === "say") {
          s.says.add(m.entry.args?.text);
          if (!s.sayEcho.has(m.entry.args?.text)) s.sayEcho.set(m.entry.args?.text, performance.now());
          const sq = m.entry.args?.sq;
          if (m.entry.actor === "world" && sq && sq.who === s.id && s.seqEchoAt === undefined) s.seqEchoAt = performance.now();
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
/** One in-reach ring slot around the machine (r 2.4–3.3m < reach 4m). */
function ringPos(i: number): number[] {
  const a = i * 2.399963229728653;   // golden angle — even spread, no clumping
  const r = 2.4 + (i % 4) * 0.3;
  return [MACHINE_POS[0] + r * Math.cos(a), 0, MACHINE_POS[2] + r * Math.sin(a)];
}
const poseOnce = (s: Spec, p: number[]) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "pose", pose: { p, yaw: 0, speed: 0, clip: "idle" } })); };
const sendSeq = (s: Spec, steps: unknown) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "sq-machine", action: "seq", steps } })); };
const sendRun = (s: Spec, action: string) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "sq-machine", action } })); };

// ---- anchor population (perf-0 FIRST — the fresh world's owner) ----------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const perf0 = await connect("perf-0", false, 0);          // owner: spawn + dress
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

// embodied presence @15Hz (the standing crowd's motion — holders stay posed).
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

// ---- t+2.0s: dress the world — the machine ------------------------------------
at(DRESS_AT, () => {
  if (perf0.ws.readyState === 1) perf0.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "sq-machine", lib: "deco/bench.glb", pos: MACHINE_POS, yaw: 0 } }));
  const p1 = perfs[1];
  if (p1?.ws.readyState === 1) p1.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: "sq-machine", type: "sequencer", data: { bpm: BPM, gain: 0.6, reach: REACH } } }));
});

// ---- t+3.5s: the 8 machine-holders (pose-once, in reach) -----------------------
const holders: Spec[] = [];
{
  const legs = await Promise.allSettled(Array.from({ length: N_HOLD }, (_, j) => connect(`holder-${j}`, false, 200 + j)));
  legs.forEach((r) => { if (r.status === "fulfilled") holders.push(r.value as Spec); });
  holders.forEach((s, j) => poseOnce(s, ringPos(j)));
}

// ---- t+5.0s: the 50 spectator-editors ------------------------------------------
const specEds: Spec[] = [];
{
  const legs = await Promise.allSettled(Array.from({ length: N_SPECED }, (_, j) => connect(`sedit-${j}`, true)));
  legs.forEach((r) => { if (r.status === "fulfilled") specEds.push(r.value as Spec); });
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(1)}s: holders ${holders.length}/${N_HOLD} + spectator-editors ${specEds.length}/${N_SPECED} joined`);
}

// ---- t+8.0s: W1 THE STORM — 58 simultaneous edits of ONE canonical pattern -----
let stormSent = 0;
at(W1_AT, () => {
  for (const s of holders) { sendSeq(s, C1); stormSent++; }
  for (const s of specEds) { sendSeq(s, C1); stormSent++; }
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(2)}s: W1 STORM fired — ${stormSent} simultaneous pattern edits`);
});
at(W1B_AT, () => {
  let n = 0;
  for (const s of specEds.slice(0, N_SPECED2)) { sendSeq(s, C1); n++; }
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(2)}s: W1 re-fire — ${n} more`);
});

// ---- fold probe A (t+9.5s) -----------------------------------------------------
let foldProbesOk = 0;
const foldProbeErrs: string[] = [];
async function foldProbe(tag: string): Promise<void> {
  try {
    const p = await connect(`fold-${tag}-${Math.floor(t0)}`, true);
    const v = verifySnapshot(p.snapshot);
    if (v.ok) foldProbesOk++;
    else foldProbeErrs.push(`${tag}: ${v.errs.join(";").slice(0, 200)}`);
    try { p.ws.close(); } catch {}
  } catch (err) { foldProbeErrs.push(`${tag}: ${String(err).slice(0, 120)}`); }
}
at(FOLD_A_AT, () => { void foldProbe("a"); });

// ---- t+13.0-13.6s: W2 run churn — start ×4, stop ×4, start ×4 ------------------
at(W2A_AT, () => { for (let j = 0; j < 4; j++) sendRun(holders[j], "start"); });
at(W2B_AT, () => { for (let j = 4; j < 8; j++) sendRun(holders[j], "stop"); });
at(W2C_AT, () => { for (let j = 0; j < 4; j++) sendRun(holders[j], "start"); });

at(FOLD_B_AT, () => { void foldProbe("b"); });

// ---- t+17.0s: W3 second storm — C2 while PLAYING (grid swap, anchor kept) ------
at(W3_AT, () => {
  let n = 0;
  for (const s of holders) { sendSeq(s, C2); n++; }
  for (const s of specEds.slice(0, N_SPECED2)) { sendSeq(s, C2); n++; }
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(2)}s: W3 STORM fired — ${n} simultaneous C2 edits (machine playing)`);
});

// ---- t+18.5s: late embodied wave (join fairness during churn) ------------------
// late-0 poses IN REACH: it fires the W4 burst at t+21 with a guaranteed-empty
// rate window (its prior verb count is zero), so 12-accepted/2-refused is
// deterministic — a holder would sit on the 4s window boundary from its W3 verb.
const lateLegs: Spec[] = [];
{
  const legs = await Promise.allSettled(Array.from({ length: N_LATE }, (_, j) => connect(`late-${j}`, false, 400 + j)));
  legs.forEach((r) => { if (r.status === "fulfilled") lateLegs.push(r.value as Spec); });
  lateLegs.forEach((s, j) => poseOnce(s, j === 0 ? ringPos(60) : [40 + j, 0, 40 + j]));
}

at(FOLD_C_AT, () => { void foldProbe("c"); });

// ---- t+21.0s: W4 rate burst — late-0 (in reach, empty window) ×14 DISTINCT ----
at(W4_AT, () => {
  const b = lateLegs[0];
  if (b?.ws.readyState === 1) for (let j = 0; j < 14; j++) sendSeq(b, burstPattern(j));
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(2)}s: W4 burst — 14 back-to-back distinct patterns from late-0`);
});

// ---- t+23.0s: 4 staggered step-derivers (the convergence read) ------------------
const derivers: Spec[] = [];
for (let d = 0; d < N_DERIVE; d++) {
  at(DERIVE_AT + d * 400, () => {
    void (async () => {
      try {
        const p = await connect(`derive-${d}`, true);
        derivers.push(p);
        const data = p.snapshot?.state?.entities?.["sq-machine"]?.comp?.sequencer;
        if (data) {
          const nrm = normalizeSequencer(data);
          const now = Date.now();
          const s = stepAt(nrm.cfg, nrm.steps, nrm.playing, nrm.at, now);
          p.derivedK = s.k; p.derivedAt = nrm.at; p.derivedNow = now;
        }
      } catch { /* join failure counted via derivers.length */ }
    })();
  });
}

// ---- fairness: says during/after the storms ------------------------------------
const FAIR_TEXTS = [`seqsync-a-${Math.floor(t0)}`, `seqsync-b-${Math.floor(t0)}`];
const PROBE_TEXTS = [`seqsync-p1-${Math.floor(t0)}`];
const sayEchoAt = new Map<string, number>();
[...FAIR_TEXTS.map((text, i) => ({ w: [FOLD_A_AT + 1_500, FOLD_B_AT + 1_500][i], text })), ...PROBE_TEXTS.map((text) => ({ w: PROBE_AT, text }))].forEach(({ w, text }) => {
  at(w, () => {
    const sentAt = performance.now();
    const S = perfs[2];
    if (S?.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(w + 1_500, () => {
      const hit = S?.sayEcho.get(text);
      if (hit !== undefined) sayEchoAt.set(text, hit - sentAt);
    });
  });
});

// ---- t+24.0s: flight-recorder pull on the seer (report-only) --------------------
at(PROBE_AT, () => {
  if (SEER?.ws.readyState === 1) SEER.ws.send(JSON.stringify({ type: "debug", reqId: "rec-1", kinds: ["sequencer-skip", "sequencer-trigger", "sequencer-lint"], limit: 300 }));
});

// ---- t+26.0s teardown ------------------------------------------------------------
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  [anchors, holders, specEds, lateLegs, derivers].flat().forEach((s) => { try { s.ws.close(); } catch {} });
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
const sqComps = entries.filter((e) => e.verb === "comp" && e.args?.type === "sequencer");
const engineComps = sqComps.filter((e) => e.actor === "world");
const sqSays = entries.filter((e) => e.verb === "say" && e.actor === "world" && e.args?.sq != null);
const seqUses = entries.filter((e) => e.verb === "use" && e.args?.id === "sq-machine" && e.args?.action === "seq");
const runUses = entries.filter((e) => e.verb === "use" && e.args?.id === "sq-machine" && (e.args?.action === "start" || e.args?.action === "run" || e.args?.action === "stop" || e.args?.action === "pause"));

const t0Wall = Date.now() - Math.round(performance.now() - t0);   // wall-clock at harness t0
const wallOf = (e: any) => Number(e.ts) - t0Wall;
const compsIn = (lo: number, hi: number) => engineComps.filter((e) => { const w = wallOf(e); return w >= lo && w < hi; });
const w1Writes = compsIn(W1_AT - 500, W2A_AT).filter((e) => Array.isArray((e.args as any)?.data?.steps)).length;
const w3Writes = compsIn(W3_AT - 500, W4_AT).filter((e) => Array.isArray((e.args as any)?.data?.steps)).length;
const w4Writes = compsIn(W4_AT - 500, KILL_AT).filter((e) => Array.isArray((e.args as any)?.data?.steps)).length;

// run transitions: engine comps whose data carries playing, paired with a say
// carrying sq.start/sq.stop. Count transitions (skip no-ops mint no pair).
const runTransitions = engineComps.filter((e) => {
  const say = bySeq.get(Number(e.seq) + 1);
  return say?.verb === "say" && (say.args?.sq?.start === true || say.args?.sq?.stop === true);
}).length;

// ---- THE CHAIN: pairing, causes, grid provenance, run flags, anchor law ---------
const AUTHORED_GRIDS: string[] = [canon(normalizeSequencer({ steps: C1 }).steps), canon(normalizeSequencer({ steps: C2 }).steps), ...Array.from({ length: 14 }, (_, j) => canon(normalizeSequencer({ steps: burstPattern(j) }).steps))];
let pairErr = 0, causeErr = 0, unknownGrid = 0, runFlagErr = 0, anchorErr = 0, noopSkips = 0;
{
  // chain seed = the AUTHORED comp folded (excluded above): a fresh machine
  // starts STOPPED with anchor 0 — W1's grid write must match that state.
  let livePlaying: boolean | null = false;
  let liveAt = 0;
  for (const c of engineComps) {
    const seq = Number(c.seq);
    const use = bySeq.get(seq - 1);
    const say = bySeq.get(seq + 1);
    const isRunWrite = say?.args?.sq?.start === true || say?.args?.sq?.stop === true;
    // the SAY shape discriminates the write kind (a run write also carries the
    // grid in its comp — composeCarry always includes steps): sq.start/sq.stop
    // = run transition; sq.seq === true = grid write.
    const isGridWrite = !isRunWrite && say?.args?.sq?.seq === true;
    // pairing: a grid write pairs with a say carrying sq.seq; a run write with
    // sq.start/sq.stop. Both must have their use at seq-1.
    if (!use || use.verb !== "use" || !(isGridWrite || isRunWrite)) { pairErr++; continue; }
    if (Number(say.args?.cause) !== seq - 1) causeErr++;
    const data = (c.args as any)?.data ?? {};
    // grid provenance: every written grid is one the harness authored (sanitized)
    if (isGridWrite && !AUTHORED_GRIDS.includes(canon(data.steps))) unknownGrid++;
    // run-flag law: start writes playing:true + at == its use ts; stop keeps at
    if (say.args?.sq?.start === true) {
      if (data.playing !== true) runFlagErr++;
      if (livePlaying === true) runFlagErr++;                    // start on playing
      if (Number(data.at) !== Number(use.ts)) runFlagErr++;      // re-anchored at the cause
      liveAt = Number(data.at);
      livePlaying = true;
    } else if (say.args?.sq?.stop === true) {
      if (data.playing !== false) runFlagErr++;
      if (livePlaying !== true) runFlagErr++;                    // stop on stopped
      if (Number(data.at) !== liveAt) anchorErr++;               // stop must not move the anchor
      livePlaying = false;
    } else if (isGridWrite) {
      // grid swap: playing/at ride UNCHANGED (phase continuity)
      if (data.playing !== livePlaying) runFlagErr++;
      if (Number(data.at) !== liveAt) anchorErr++;
    }
  }
  // no-op skips: logged seq uses with no engine write following
  for (const u of seqUses) {
    const next = bySeq.get(Number(u.seq) + 1);
    if (!next || next.verb !== "comp" || next.actor !== "world") noopSkips++;
  }
}

// spectator-editors: 130 verbatim refusals (50 W1 + 40 W1B + 40 W3), 0 authored lines
const specRefusals = specEds.reduce((a, s) => a + s.useErrors.filter((e) => e === SPEC_REFUSAL).length, 0);
const specEdIds = new Set(specEds.map((s) => s.id));
const specEdLines = entries.filter((e) => specEdIds.has(String(e.actor))).length;
// W4 rate refusals: late-0's 13th+14th verbs (empty window → exactly 2)
const w4Refusals = lateLegs[0]?.useErrors.filter((e) => e === RATE_REFUSAL).length ?? 0;

// anchor preservation through the W3 swap + W4 burst: the final folded anchor
// must equal the LAST start transition's ts
const lastStart = [...engineComps].reverse().find((e) => bySeq.get(Number(e.seq) + 1)?.args?.sq?.start === true);
const finalComp = engineComps[engineComps.length - 1];
const finalAnchor = Number((finalComp.args as any)?.data?.at);
const anchorPreserved = lastStart != null && Number((lastStart.args as any)?.data?.at) === finalAnchor && (finalComp.args as any)?.data?.playing === true;

// ---- final quiet snapshot: fold-equal + machine state ---------------------------
let finalFoldEqual = false;
let finalMachine: any = null;
{
  try {
    const p = await connect(`final-${Math.floor(t0)}`, true);
    const v = verifySnapshot(p.snapshot);
    finalFoldEqual = v.ok && v.covered === foldPrefix(Infinity).maxSeq;
    finalMachine = p.snapshot?.state?.entities?.["sq-machine"]?.comp?.sequencer ?? null;
    try { p.ws.close(); } catch {}
  } catch { finalFoldEqual = false; }
}

// ---- deriver agreement: 4 staggered runtimes, one beat --------------------------
let deriveAgree = 0;
{
  const ds = derivers.filter((d) => d.derivedK !== undefined).sort((a, b) => (a.derivedNow! - b.derivedNow!));
  for (const d of ds) {
    if (d.derivedAt !== finalAnchor) continue;                    // folded the same anchor
    const expect = Math.floor((d.derivedNow! - d.derivedAt!) / STEP_MS);
    if (d.derivedK! >= expect - 1 && d.derivedK! <= expect + 1) deriveAgree++;   // phase-safe ±1
  }
}

// ---- SIGKILL restart: replay folds the same machine, anchor intact --------------
let restartBoot = 0, restartFoldEqual = false, restartAtEqual = false, restartLineDrift = 999;
let restartDiff = ""; let restartPresent = -1; let restartK = -1;
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
      const probe = await connect(`restart-probe-${Math.floor(t0)}`, true);
      const v = verifySnapshot(probe.snapshot);
      restartPresent = (probe.snapshot?.present ?? []).length;
      const data = probe.snapshot?.state?.entities?.["sq-machine"]?.comp?.sequencer ?? null;
      if (data) {
        const nrm = normalizeSequencer(data);
        restartAtEqual = nrm.at === finalAnchor && nrm.playing === true;
        restartK = stepAt(nrm.cfg, nrm.steps, nrm.playing, nrm.at, Date.now()).k;   // time held the truth
      }
      restartFoldEqual = v.ok && v.covered === pre.maxSeq && canon(probe.snapshot?.state ?? {}) === preCanon && restartAtEqual;
      if (!restartFoldEqual) {
        const post = probe.snapshot?.state ?? {};
        const keys = new Set([...Object.keys(pre.st), ...Object.keys(post)]);
        const parts: string[] = [`covered=${v.covered} logMaxSeq=${pre.maxSeq} v.ok=${v.ok} anchor=${String(data?.at ?? "?")}`];
        for (const k of keys) if (canon((pre.st as any)[k]) !== canon((post as any)[k])) {
          parts.push(`${k}: pre=${JSON.stringify((pre.st as any)[k])?.slice(0, 160)} post=${JSON.stringify((post as any)[k])?.slice(0, 160)}`);
        }
        restartDiff = v.errs.concat(parts).join(" | ").slice(0, 600);
      }
      await sleep(2_600);   // ≥2 sweeps on the replayed world — boot heal mints nothing
      const post = logEntries();
      restartLineDrift = Math.abs(post.length - preLines);
      try { probe.ws.close(); } catch {}
    } catch (err) { restartFoldEqual = false; restartLineDrift = 999; restartDiff = String(err).slice(0, 300); }
  }
}

const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const suspicious = (await logFile.text()).split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

const m: Measurements = {
  anchorJoined: anchors.length, anchorJoinP95: pct(joinTimes, 95),
  holderJoined: holders.length, specEdJoined: specEds.length,
  lateJoined: lateLegs.length, lateJoinP95: lateLegs.length ? pct(lateLegs.map((s) => s.joinMs), 95) : Infinity,
  deriveJoined: derivers.length,
  w1Writes, noopSkips, runTransitions, w3Writes, w4Writes, w4Refusals,
  specRefusals, specEdLines,
  pairErr, causeErr, unknownGrid, runFlagErr, anchorErr,
  foldProbes: foldProbesOk, finalFoldEqual, anchorPreserved,
  deriveAgree,
  restartBoot, restartFoldEqual, restartAtEqual,
  restartLineDrift, finalPresent: restartPresent < 0 ? 999 : restartPresent,
  fairSays: FAIR_TEXTS.filter((t) => sayEchoAt.has(t)).length,
  probeSays: PROBE_TEXTS.filter((t) => sayEchoAt.has(t)).length,
  sayP95: sayEchoAt.size ? pct([...sayEchoAt.values()], 95) : Infinity,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  logTotal: logTotalLines, logExpected: EXP_LOG,
  rssPeakGrowthMB: rssPeakGrowth, logSuspicious: suspicious.length,
};
const fail = evaluate(m);

// recorder observation (report-only)
const recPull = SEER?.debugPulls?.find((d) => d.reqId === "rec-1");
const recEvents = recPull ? (recPull.events ?? []).length : -1;
const noopNotes = recPull ? (recPull.events ?? []).filter((e: any) => String(e?.detail?.why ?? e?.why ?? "").includes("unchanged")).length : -1;

console.log(`
results
  anchors               ${anchors.length}/${1 + rest.length} joined — p95 ${Math.round(m.anchorJoinP95)}ms (${anchorFailed} failed) · holders ${holders.length}/8 · spec-eds ${specEds.length}/50
  late wave             ${m.lateJoined}/${N_LATE} joined — p95 ${Math.round(m.lateJoinP95)}ms · derivers ${derivers.length}/4
  THE STORM             ${stormSent} + ${N_SPECED2} simultaneous edits fired
  writes                W1 ${w1Writes} (want 1 — single winner) · W3 ${w3Writes} (want 1, mid-play) · W4 ${w4Writes} (want 12) · no-op skips ${noopSkips} (want 14)
  run transitions       ${runTransitions} (want 3: start→stop→start) · W4 rate refusals ${w4Refusals}/2 verbatim
  spectator edits       refused ${specRefusals}/130 verbatim · ${specEdLines} spec-authored lines (want 0)
  engine chain          pair ${pairErr} · cause ${causeErr} · unknown-grid ${unknownGrid} · run-flag ${runFlagErr} · anchor ${anchorErr} (all want 0)
  anchor                final ${finalAnchor} · preserved through swaps+burst: ${anchorPreserved} · restart at identical: ${m.restartAtEqual} (k=${restartK})
  fold probes           ${foldProbesOk}/3 == fold(log through covered)${foldProbeErrs.length ? ` — ${foldProbeErrs.join(" | ").slice(0, 300)}` : ""}
  final snapshot        ${finalFoldEqual ? "fold-equal" : "DIFFERS"} · machine grid ${Array.isArray(finalMachine?.steps) ? `${finalMachine.steps.length} steps` : "MISSING"} playing ${finalMachine?.playing}
  deriver agreement     ${deriveAgree}/4 staggered runtimes derive the same beat
  fair/probe says       fair ${m.fairSays}/2 · probe ${m.probeSays}/1 — p95 ${sayEchoAt.size ? Math.round(m.sayP95) : "MISSED"}ms
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)} (window ${Math.round((teardownAtTs - t0) / 1000)}s connected)
  frame latency ms      p50 ${Math.round(pct(latAll, 50))} p95 ${Math.round(m.latP95)} max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} spectators
  http probe ms         p95 ${Math.round(pct(probeAll, 95))} (n=${probeAll.length}) · errors ${probeErrors.n}
  flight recorder       sequencer events in 300-ring at t+24s: ${recEvents < 0 ? "pull missed" : recEvents} · no-op notes ${noopNotes < 0 ? "?" : noopNotes} (report-only)
  world log             ${logTotalLines} lines vs derived ${EXP_LOG} (drift ${Math.abs(logTotalLines - EXP_LOG)})
  SIGKILL restart       boot ${restartBoot}/1 · fold ${restartFoldEqual ? "EXACT-equal" : "DIFFERS"} · line drift ${restartLineDrift} · present ${restartPresent}
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${suspicious.length} suspicious lines
`);
if (restartDiff) console.log(`  restart diff: ${restartDiff}`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of [anchors, holders, specEds, lateLegs, derivers].flat()) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — ${stormSent + N_SPECED2} concurrent edits converged to one playback state: single winner per cohort, no-op dedup, 90 explicit refusals, chain/anchor exact, 4 runtimes + replay agree`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
