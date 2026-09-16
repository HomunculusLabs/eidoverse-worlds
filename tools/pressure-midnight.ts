// Pressure scenario 24: MIDNIGHT ROLLOVER — day-boundary crossing under load
// keeps ledgers and leases consistent.
//
// The world's day is a continuous hour mod 24 (shared/forecast.js hoursAt);
// midnight is the 24→0 wrap. The load-bearing day-boundary consumers:
//   - BellEngine (server/bell.ts + shared/bell.js crossedSlot): the wrap arm
//     "(prev,24] ∪ [0,cur)" — slots straddling midnight must toll exactly once
//     whether one sweep crosses them together (coalesce) or two sweeps split
//     them (second is minGap-consumed). Either path = exactly ONE toll.
//   - foldSkyEntry's weather rebase: a weather verb under a rated sky rebases
//     `hours` to the hour the OLD epoch implies at the verb ts. If the rebase
//     snapped the day, the bell schedule would double-toll or never-toll the
//     slots after the verb, and the derived hour would jump backward.
//   - the lease plane (pure `now`, no day arithmetic): streams and settlements
//     must be untouched by the roll — settle lands at the exact last streamed
//     transform even though the world's day turned over mid-stream.
//   - the log itself: every append through the roll window must replay to the
//     same fold after a SIGKILL restart, and replay must mint no new tolls
//     (recentSays re-seeds lastTollAt; the schedule folds, the wrap re-fires
//     nothing).
//
// Population (pinned before measuring — 160 anchors, peak ~166 sockets):
//   16 perf (embodied @15Hz) + 8 guards (embodied @15Hz; guard-0..3 hold
//   mid-ball-0..3 leases, stream state @10Hz) + 136 spectator anchors, plus
//   4 embodied roll witnesses (t+4s, hold to teardown) and 6 fold-probe
//   spectators cycling during the roll window.
//
// The clock (pinned): owner authors `sky {hours: 22.85, rate: 720}` at t+2.6s
// → the day advances 0.2 world-hours per real second. Midnight (24→0) lands
// ~t+8.35s. Bell schedule (authored t+3.2s, all minGap 10):
//   mid-a hours [0]      n=4 — the midnight slot itself
//   mid-b hours [0.25]   n=1 — AFTER the mid-roll weather verb; exactly-one
//                               toll here proves the rebase never snapped the day
//   mid-c hours [23.9]   n=1 — just before the roll
//   mid-d hours [23.96, 0.04] n=1 — the straddle pair: one sweep coalesces
//                               (tolls 0.04, last sorted) or two sweeps split
//                               (tolls 23.96, second minGap-consumed) — total
//                               must be EXACTLY one toll either way
// t+9.0s: `weather {weather:"rain"}` lands mid-roll (fold rebase seam).
// t+9.5..11.5s: 6 fold-probe spectators join INSIDE the roll window — every
//   snapshot state must deep-equal fold(log through covered).
// t+10.2s: roster probe — exactly 28 embodied (24 anchors + 4 witnesses).
// t+44.8s: guards send pinned final lease states; t+46.0s full teardown.
// t+52.0s: final empty-world probe (present 0, 0 ghost lease states).
// Then: SIGKILL (crash-shape boot — no graceful fold), restart on the same
//   WORLDS_DIR, probe join: throughSeq unchanged, fold(state) == pre-kill
//   final fold, 2+ sweeps mint ZERO new tolls and ZERO new log lines.
//
// Acceptance gates (pinned before measuring — see TH below):
//   anchors 160/160 p95<3s · witnesses 4/4 · tolls a=1@0 b=1@0.25(+true-hour
//   ±0.21) c=1@23.9 d=1 total(hour∈{23.96,0.04}) · toll grammar actor=world,
//   bell{n,hour,at}, no cause/by · strikes 7/7 (first:true on each first) ·
//   weather rebase |Δhours|<0.001 vs hoursAt(pre-sky, weatherTs), rate stays
//   720 · fold-equivalence 6/6 probes == fold(log through covered) · roster
//   mid-roll exactly 28, 0 unknown · witness arrive/leave drift 0 · leases
//   settle 4/4 exactly-once at pinned p3 · lease-state plane alive mid-roll
//   (≥30 states in [7,12]s) · fairness says 3/3 p95<500ms · fps p50≥12,
//   lat p95<250ms, 0 seq gaps · roll-window HTTP probe p95<500ms · final
//   present 0 · restart: boot 1/1, fold EXACT-equal, toll drift 0, line
//   drift 0 · log line drift 0 (27 expected) · RSS peak <+60MB · 0 suspicious.
//
//   SERVER_DIR=/tmp/pressure24-wt PORT=8977 bun tools/pressure-midnight.ts
//   SELFTEST=1 bun tools/pressure-midnight.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { emptyState, foldEntry } from "../shared/fold.js";
import { hoursAt } from "../shared/forecast.js";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure24-wt";
const PORT = Number(process.env.PORT ?? 8977);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure24-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 16, N_GUARD = 8, N_SPEC = 136;   // 24 embodied + 136 = 160
const N_WITNESS = 4, N_PROBE = 6;
const POSE_HZ = 15, LEASE_HZ = 10;
const SKY_HOURS = 22.85, SKY_RATE = 720;         // 0.2 world-hours per second
const SPAWN_AT = 2_000, SKY_AT = 2_600, COMP_AT = 3_200, CLAIM_AT = 3_500;
const WITNESS_AT = 4_000;
const ROLL_START = 7_000, ROLL_END = 12_000;     // wall window covering 23.73→0.73
const WEATHER_AT = 9_000;
const PROBE0_AT = 9_500, PROBE_STEP = 400;
const ROSTER_AT = 10_200;
const SAY_ATS = [7_600, 8_500, 9_400];
const PIN_P3_AT = 44_800, TEARDOWN_AT = 46_000, FINAL_PROBE_AT = 52_000;
const DURATION = 54_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..6
const SELFTEST = process.env.SELFTEST === "1";
const LOG_JSONL = `${WORLDS}/${WORLD}/log.jsonl`;

// toll expectations (the coalesce-or-split pair: ONE toll total either way)
const D_HOURS = new Set([23.96, 0.04]);

const EXPECT_LOG_LINES = 28;   // genesis + auto-owner grant + 9 spawns + 4 comps + sky + weather + 4 tolls + 3 says + 4 places
const EXPECT_PLACES = 4;
const EXPECT_STRIKES = 7;      // mid-a n=4 + three n=1 bells

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorFailed: 0,
  anchorJoinP95Ms: 3_000,
  witnesses: 4,
  tollA: 1, tollB: 1, tollC: 1, tollD: 1,
  tollGrammar: 4,            // every toll say: actor world, bell{n,hour,at}, no cause/by
  trueHourTol: 0.21,         // mid-b toll fires at true world-hour 0.25 ± one sweep span
  strikes: EXPECT_STRIKES,
  firstStrikes: 4,           // each tolling bell's first strike carries first:true
  rebaseErr: 0.001,
  ratePreserved: SKY_RATE,
  foldEquiv: N_PROBE,
  rosterExact: 28,           // 24 anchors + 4 witnesses
  rosterUnknown: 0,
  arriveDrift: 0,
  leaveDrift: 0,
  leaseExact: EXPECT_PLACES, // settled at pinned p3, exactly once each
  placeTotal: EXPECT_PLACES,
  ghostLeaseStates: 0,
  leaseStatesMidRoll: 30,
  saysAppended: 3,
  sayP95Ms: 500,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  probeRollP95Ms: 500,
  finalPresent: 0,
  restartBoot: 1,
  restartFoldEqual: true,
  restartTollDrift: 0,
  restartLineDrift: 0,
  logSuspicious: 0,
  logLineDrift: 0,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  witnesses: number;
  tollA: number; tollB: number; tollC: number; tollD: number;
  tollGrammar: number; trueHourErr: number;
  strikes: number; firstStrikes: number;
  rebaseErr: number; ratePreserved: number;
  foldEquiv: number;
  rosterMid: number; rosterUnknown: number;
  witnessArrives: number; witnessLeaves: number;
  leaseExact: number; placeTotal: number; ghostLeaseStates: number; leaseStatesMidRoll: number;
  saysAppended: number; sayP95: number;
  fpsP50: number; latP95: number; gaps: number;
  probeRollP95: number;
  finalPresent: number;
  restartBoot: number; restartFoldEqual: boolean; restartTollDrift: number; restartLineDrift: number;
  logSuspicious: number; logLineDrift: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.witnesses < TH.witnesses) fail.push(`roll witnesses joined ${m.witnesses}/4`);
  if (m.tollA !== TH.tollA) fail.push(`midnight bell tolls ${m.tollA} (want exactly 1 @ hour 0)`);
  if (m.tollB !== TH.tollB) fail.push(`post-weather bell tolls ${m.tollB} (want exactly 1 @ hour 0.25) — the weather rebase snapped the day`);
  if (m.tollC !== TH.tollC) fail.push(`pre-roll bell tolls ${m.tollC} (want exactly 1 @ hour 23.9)`);
  if (m.tollD !== TH.tollD) fail.push(`straddle bell tolls ${m.tollD} total (want exactly 1 — coalesce or minGap-consume, never 0 or 2)`);
  if (m.tollGrammar < TH.tollGrammar) fail.push(`toll say grammar ${m.tollGrammar}/4 — time-caused grammar broken`);
  if (m.trueHourErr > TH.trueHourTol) fail.push(`mid-b toll fired ${m.trueHourErr.toFixed(3)}h from true world-hour 0.25 — day jumped`);
  if (m.strikes !== TH.strikes) fail.push(`bell strikes ${m.strikes}/${TH.strikes}`);
  if (m.firstStrikes < TH.firstStrikes) fail.push(`first-strike markers ${m.firstStrikes}/4`);
  if (m.rebaseErr > TH.rebaseErr) fail.push(`weather rebase error ${m.rebaseErr.toFixed(4)}h > ${TH.rebaseErr} — hours not rebased to verb ts`);
  if (m.ratePreserved !== TH.ratePreserved) fail.push(`sky rate after weather ${m.ratePreserved} != ${TH.ratePreserved}`);
  if (m.foldEquiv < TH.foldEquiv) fail.push(`roll-window fold-equivalence ${m.foldEquiv}/${TH.foldEquiv} — snapshot != fold(log through covered): TORN SEQUENCE`);
  if (m.rosterMid !== TH.rosterExact) fail.push(`mid-roll roster ${m.rosterMid} embodied (want exactly ${TH.rosterExact})`);
  if (m.rosterUnknown > TH.rosterUnknown) fail.push(`${m.rosterUnknown} unknown ids in the mid-roll roster`);
  if (Math.abs(m.witnessArrives - m.witnesses) > TH.arriveDrift) fail.push(`witness arrives ${m.witnessArrives} != ${m.witnesses}`);
  if (Math.abs(m.witnessLeaves - m.witnesses) > TH.leaveDrift) fail.push(`witness leaves ${m.witnessLeaves} != ${m.witnesses} — ghost or lost departure`);
  if (m.leaseExact < TH.leaseExact) fail.push(`leases settled at pinned p3 ${m.leaseExact}/${TH.leaseExact} — the roll disturbed the lease plane`);
  if (m.placeTotal !== TH.placeTotal) fail.push(`place verbs ${m.placeTotal} != ${TH.placeTotal} — a lease settled twice or never`);
  if (m.ghostLeaseStates > TH.ghostLeaseStates) fail.push(`${m.ghostLeaseStates} ghost lease states in the final empty world`);
  if (m.leaseStatesMidRoll < TH.leaseStatesMidRoll) fail.push(`lease-state plane mid-roll ${m.leaseStatesMidRoll} < ${TH.leaseStatesMidRoll} — lease stream stalled at the wrap`);
  if (m.saysAppended < TH.saysAppended) fail.push(`mid-roll says ${m.saysAppended}/3 — the roll stalled verb intake`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`mid-roll say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps across the roll`);
  if (m.probeRollP95 > TH.probeRollP95Ms) fail.push(`roll-window HTTP probe p95 ${Math.round(m.probeRollP95)}ms > ${TH.probeRollP95Ms}ms`);
  if (m.finalPresent !== TH.finalPresent) fail.push(`final present ${m.finalPresent} embodied — world not empty after teardown`);
  if (m.restartBoot < TH.restartBoot) fail.push(`post-SIGKILL restart failed to boot — the log through the roll is a replay brick`);
  if (!m.restartFoldEqual) fail.push(`restart fold != pre-kill final fold — the rolled ledger replays to a DIFFERENT world`);
  if (m.restartTollDrift > TH.restartTollDrift) fail.push(`replay re-tolled ${m.restartTollDrift} times — restart truth broken`);
  if (m.restartLineDrift > TH.restartLineDrift) fail.push(`restart log line drift ${m.restartLineDrift}`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`log.jsonl line drift ${m.logLineDrift} vs expected ${EXPECT_LOG_LINES}`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 45,
    witnesses: 4,
    tollA: 1, tollB: 1, tollC: 1, tollD: 1,
    tollGrammar: 4, trueHourErr: 0.02,
    strikes: 7, firstStrikes: 4,
    rebaseErr: 0.0001, ratePreserved: 720,
    foldEquiv: 6,
    rosterMid: 28, rosterUnknown: 0,
    witnessArrives: 4, witnessLeaves: 4,
    leaseExact: 4, placeTotal: 4, ghostLeaseStates: 0, leaseStatesMidRoll: 41,
    saysAppended: 3, sayP95: 8,
    fpsP50: 14.8, latP95: 10, gaps: 0,
    probeRollP95: 12,
    finalPresent: 0,
    restartBoot: 1, restartFoldEqual: true, restartTollDrift: 0, restartLineDrift: 0,
    logSuspicious: 0, logLineDrift: 0, rssPeakGrowth: 12,
  };
  const breached: Measurements = {
    ...healthy,
    anchorFailed: 2, anchorJoinP95: 4_000,
    witnesses: 2,
    tollA: 0, tollB: 2, tollC: 0, tollD: 2,
    tollGrammar: 2, trueHourErr: 3.1,
    strikes: 3, firstStrikes: 1,
    rebaseErr: 1.9, ratePreserved: 0,
    foldEquiv: 4,
    rosterMid: 31, rosterUnknown: 3,
    witnessArrives: 4, witnessLeaves: 1,
    leaseExact: 2, placeTotal: 6, ghostLeaseStates: 2, leaseStatesMidRoll: 4,
    saysAppended: 1, sayP95: 900,
    fpsP50: 9, latP95: 400, gaps: 5,
    probeRollP95: 800,
    finalPresent: 3,
    restartBoot: 0, restartFoldEqual: false, restartTollDrift: 2, restartLineDrift: 3,
    logSuspicious: 2, logLineDrift: 4, rssPeakGrowth: 90,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["failed to join", "join p95", "witnesses joined", "midnight bell tolls", "rebase snapped", "pre-roll bell", "straddle bell", "say grammar", "true world-hour", "bell strikes", "first-strike", "weather rebase error", "sky rate after weather", "fold-equivalence", "mid-roll roster", "unknown ids", "witness arrives", "ghost or lost departure", "roll disturbed the lease plane", "settled twice or never", "ghost lease states", "lease stream stalled", "stalled verb intake", "say author p95", "fps p50", "frame latency p95", "seq gaps", "roll-window HTTP", "world not empty", "replay brick", "replays to a DIFFERENT world", "re-tolled", "restart log line drift", "suspicious server log", "log.jsonl line drift", "RSS peak growth"];
  const missing = want.filter((w) => !b.some((f) => f.includes(w)));
  const ok = a.length === 0 && missing.length === 0;
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — clean:[${a}] missing:[${missing}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF + N_GUARD} embodied anchors @${POSE_HZ}Hz (guard-0..3 lease mid-ball-0..3 @${LEASE_HZ}Hz) + ${N_SPEC} spec = 160; + ${N_WITNESS} roll witnesses (t+4s, hold) + ${N_PROBE} fold-probes cycling in the roll window. sky {hours:${SKY_HOURS}, rate:${SKY_RATE}} at t+${SKY_AT / 1000}s → midnight ~t+8.35s; bells a[0]·b[0.25]·c[23.9]·d[23.96,0.04] (minGap 10); weather rain mid-roll t+${WEATHER_AT / 1000}s (fold rebase seam); probes t+${PROBE0_AT / 1000}-${(PROBE0_AT + PROBE_STEP * (N_PROBE - 1)) / 1000}s each verified == fold(log through covered); roster t+${ROSTER_AT / 1000}s wants exactly 28; teardown t+${TEARDOWN_AT / 1000}s; final probe t+${FINAL_PROBE_AT / 1000}s; SIGKILL restart must replay the rolled log to the SAME fold with 0 new tolls. ${DURATION / 1000}s+restart, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=160@p95<${TH.anchorJoinP95Ms}ms tolls a/b/c/d=1/1/1/1@exact-hours grammar=${TH.tollGrammar} trueHour±${TH.trueHourTol} strikes=${TH.strikes} rebaseErr<${TH.rebaseErr} rate=${TH.ratePreserved} foldEquiv=${TH.foldEquiv} roster=${TH.rosterExact}+${TH.rosterUnknown}unknown arrive/leave=4/4 leases=${TH.leaseExact}@p3-exactly-once ghostLeases=0 midRollLeaseStates≥${TH.leaseStatesMidRoll} says=3@p95<${TH.sayP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} probeRoll<${TH.probeRollP95Ms}ms finalPresent=0 restart=boot+fold-equal+tollDrift0+lineDrift0 logLines=${EXPECT_LOG_LINES} rssPeak<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget: ~166 concurrent sockets + server must fit ---------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-midnight.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure24-server-${Date.now()}.log`;
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
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
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

// ---- client chassis (reconnect-proven) -----------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number; snapshot: any;
  closed: boolean; closeCode: number; id: string;
  arrives: string[]; leaves: string[];
  leaseStates: number[];        // timestamps of lease state broadcasts (seer)
  sounds: any[];                // bell strikes (seer)
  sayEcho: Map<string, number>;
  errs: string[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, snapshot: null, closed: false, closeCode: 0, arrives: [], leaves: [], leaseStates: [], sounds: [], sayEcho: new Map(), errs: [] };
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
        const v = m.entry?.verb, a = m.entry?.args;
        if (v === "say") { s.says.add(a?.text); if (!s.sayEcho.has(a?.text)) s.sayEcho.set(a?.text, performance.now()); }
      } else if (m.type === "arrive") {
        s.arrives.push(String(m.id ?? ""));
      } else if (m.type === "leave") {
        s.leaves.push(String(m.id ?? ""));
      } else if (m.type === "lease" && m.op === "state") {
        s.leaseStates.push(performance.now());
      } else if (m.type === "sound" && m.bell != null) {
        s.sounds.push(m);
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = (ev) => { s.closed = true; s.closeCode = Number(ev.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}
function exitClean(s: Spec) {
  try {
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "pose", pose: { p: [40, 0, 40], yaw: 0, speed: 0, clip: "idle" } }));
    s.ws.close();
  } catch { /* already gone */ }
}

// ---- anchor population (perf-0 FIRST — the fresh world's owner authors sky) ----
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const perf0 = await connect("perf-0", false, 0);          // owner: sky + weather
const rest = await Promise.allSettled([
  ...Array.from({ length: N_PERF - 1 }, (_, i) => connect(`perf-${i + 1}`, false, i + 1)),
  ...Array.from({ length: N_GUARD }, (_, i) => connect(`guard-${i}`, false, 100 + i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = [perf0, ...rest.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec)];
const anchorFailed = 1 + rest.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const guards = anchors.filter((s) => s.id.startsWith("guard-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const joinTimes = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${1 + rest.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);
const SEER = specs[0];
const anchorIds = new Set([...perfs, ...guards].map((s) => s.id));

// embodied presence @15Hz + guard lease streams @10Hz (both span the roll)
let running = true;
const tickers: any[] = [];
for (const s of [...perfs, ...guards]) {
  const i = Number(s.id.split("-")[1]);
  tickers.push(setInterval(() => {
    if (!running || s.ws.readyState !== 1) return;
    const t = Date.now() / 1000 + i;
    s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  }, 1000 / POSE_HZ));
}

// HTTP event-loop health probe (roll window vs settled)
const probeRoll: number[] = [], probeSettled: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  const d = performance.now() - t;
  (performance.now() - t0 < TEARDOWN_AT ? probeRoll : probeSettled).push(d);
}, 500);
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- t+2.0s: dress the world (verb budget: perf-0 3, perf-1 8 — under 12/4s) ---
const LEASE_IDS = ["mid-ball-0", "mid-ball-1", "mid-ball-2", "mid-ball-3"];
at(SPAWN_AT, () => {
  const spawn = (s: Spec | undefined, id: string, pos: number[]) => {
    if (s && s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id, lib: "deco/bench.glb", pos, yaw: 0 } }));
  };
  spawn(perf0, "canary", [30, 0, 30]);
  LEASE_IDS.forEach((id, i) => spawn(perf0, id, [50 + i * 2, 0, -30 + i]));
  for (const name of ["mid-a", "mid-b", "mid-c", "mid-d"]) spawn(perfs[1], name, [5, 0, 5]);
});

// ---- t+2.6s: the owner winds the clock — 0.2 world-hours per second ------------
at(SKY_AT, () => {
  if (perf0.ws.readyState === 1) perf0.ws.send(JSON.stringify({ type: "verb", verb: "sky", args: { hours: SKY_HOURS, rate: SKY_RATE } }));
});

// ---- t+3.2s: the bell schedule around the wrap (all minGap 10) -----------------
at(COMP_AT, () => {
  const comp = (id: string, data: Record<string, unknown>) => {
    if (perfs[1]?.ws.readyState === 1) perfs[1].ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id, type: "bell", data } }));
  };
  comp("mid-a", { hours: [0], n: 4, sec: 0.5, minGap: 10, base: "E4", line: "the day turns — midnight at the town bell" });
  comp("mid-b", { hours: [0.25], n: 1, sec: 0.5, minGap: 10 });
  comp("mid-c", { hours: [23.9], n: 1, sec: 0.5, minGap: 10 });
  comp("mid-d", { hours: [23.96, 0.04], n: 1, sec: 0.5, minGap: 10 });
});

// ---- t+3.5s: guards claim the lease targets; streams span the roll --------------
// Each guard's stream ticker CLEARS itself the moment the pinned p3 is sent —
// the last streamed state IS the settle expectation (pressure-6 law).
const guardStreamDone = [false, false, false, false];
at(CLAIM_AT, () => {
  guards.slice(0, 4).forEach((g, i) => {
    if (g.ws.readyState === 1) g.ws.send(JSON.stringify({ type: "lease", op: "claim", id: LEASE_IDS[i] }));
    tickers.push(setInterval(() => {
      if (!running || g.ws.readyState !== 1 || guardStreamDone[i]) return;
      const t = Date.now() / 1000;
      g.ws.send(JSON.stringify({ type: "lease", op: "state", id: LEASE_IDS[i], p: [50 + i * 2 + Math.sin(t) * 0.5, 0, -30 + i + Math.cos(t) * 0.5], yaw: t % 6.28 }));
    }, 1000 / LEASE_HZ));
  });
});

// ---- t+4.0s: roll witnesses (embodied, still, hold to teardown) -----------------
const witnesses = await Promise.allSettled(Array.from({ length: N_WITNESS }, (_, i) => connect(`witness-${i}`, false, 400 + i)));
const witnessSpecs = witnesses.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
// pressure-6 observed-departure window law: witnesses close 1s BEFORE anchor
// teardown so the seer (still connected) observes all four leave broadcasts.
setTimeout(() => { witnessSpecs.forEach((s) => { try { s.ws.close(); } catch {} }); }, TEARDOWN_AT - (performance.now() - t0) - 1_000);

// ---- t+9.0s: weather lands MID-ROLL (the fold's hours-rebase seam) --------------
at(WEATHER_AT, () => {
  if (perf0.ws.readyState === 1) perf0.ws.send(JSON.stringify({ type: "verb", verb: "weather", args: { weather: "rain" } }));
});

// ---- roll-window fold probes: snapshot == fold(log through covered) -------------
const probeResults: { id: string; ok: boolean; errs: string[]; covered: number; sky?: any }[] = [];
for (let k = 0; k < N_PROBE; k++) {
  at(PROBE0_AT + k * PROBE_STEP, async () => {
    try {
      const p = await connect(`foldprobe-${k}`, true);
      const v = verifySnapshot(p.snapshot);
      probeResults.push({ id: p.id, ok: v.ok, errs: v.errs, covered: v.covered, sky: p.snapshot?.state?.sky ?? undefined });
      try { p.ws.close(); } catch {}
    } catch (err) {
      probeResults.push({ id: `foldprobe-${k}`, ok: false, errs: [String(err)], covered: -1 });
    }
  });
}

// ---- t+10.2s: mid-roll roster probe --------------------------------------------
let rosterMid = -1, rosterUnknown = -1;
at(ROSTER_AT, () => {
  const ws = new WebSocket(URL);
  const to = setTimeout(() => { try { ws.close(); } catch {} rosterMid = -2; rosterUnknown = -2; }, 10_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `roster-mid-${Date.now()}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
  ws.onmessage = (ev) => {
    const m = JSON.parse(String(ev.data));
    if (m.type === "snapshot") {
      clearTimeout(to); try { ws.close(); } catch {}
      const present = (m.present ?? []).map((o: any) => String(o.id));
      rosterMid = present.length;
      const known = new Set([...anchorIds, ...witnessSpecs.map((s) => s.id)]);
      rosterUnknown = present.filter((id: string) => !known.has(id)).length;
    }
  };
});

// ---- fairness: says at the roll instant, before/during/after --------------------
const SAY_TEXTS = [`roll-a-${Math.floor(t0)}`, `roll-b-${Math.floor(t0)}`, `roll-c-${Math.floor(t0)}`];
const saysAppendedArr: boolean[] = [];
const sayLat: number[] = [];
SAY_ATS.forEach((when, i) => {
  at(when, () => {
    const sentAt = performance.now();
    const S = perfs[3];
    if (S?.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: SAY_TEXTS[i] } }));
    at(when + 1_500, () => {
      const hit = S?.sayEcho.get(SAY_TEXTS[i]);
      saysAppendedArr.push(hit !== undefined);
      if (hit !== undefined) sayLat.push(hit - sentAt);
    });
  });
});

// ---- t+44.8s: pinned final lease states; t+46.0s full teardown ------------------
const PINNED_P3 = LEASE_IDS.map((_, i) => [50 + i * 2, 0, -31 + i]);
at(PIN_P3_AT, () => {
  guards.slice(0, 4).forEach((g, i) => {
    if (g.ws.readyState === 1) g.ws.send(JSON.stringify({ type: "lease", op: "state", id: LEASE_IDS[i], p: [...PINNED_P3[i]], yaw: 1.5 }));
    guardStreamDone[i] = true;   // p3 is the LAST stream — the settle expectation
  });
});
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  anchors.forEach((s) => { try { s.ws.close(); } catch {} });
});

// ---- t+52.0s: final empty-world probe ------------------------------------------
let finalPresent = -1, ghostLeaseStates = -1;
at(FINAL_PROBE_AT, () => {
  const ws = new WebSocket(URL);
  const to = setTimeout(() => { try { ws.close(); } catch {} finalPresent = -2; ghostLeaseStates = -2; }, 10_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `final-empty-${Math.floor(t0)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
  ws.onmessage = (ev) => {
    const m = JSON.parse(String(ev.data));
    if (m.type === "snapshot") {
      finalPresent = (m.present ?? []).length;
      ghostLeaseStates = 0;   // count from here on
    } else if (m.type === "lease" && m.op === "state" && ghostLeaseStates >= 0) {
      ghostLeaseStates++;
    }
  };
  setTimeout(() => { clearTimeout(to); try { ws.close(); } catch {} }, 2_000);
});

await sleep(DURATION);
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(300);

// ---- ledger ground truth from log.jsonl (the append-only truth) ----------------
const entries = logEntries();
const logTotalLines = entries.length;
const logLineDriftVal = Math.abs(logTotalLines - EXPECT_LOG_LINES);
const skyEntry = entries.find((e) => e.verb === "sky");
const weatherEntry = entries.find((e) => e.verb === "weather");
const tollSays = entries.filter((e) => e.verb === "say" && e.actor === "world" && e.args?.bell != null);
const tollsFor = (id: string) => tollSays.filter((e) => e.args?.id === id);
const tollA = tollsFor("mid-a"), tollB = tollsFor("mid-b"), tollC = tollsFor("mid-c"), tollD = tollsFor("mid-d");
const tollGrammar = tollSays.filter((e) =>
  typeof e.args?.bell?.n === "number" && typeof e.args?.bell?.hour === "number" && typeof e.args?.bell?.at === "number"
  && e.args?.cause === undefined && e.args?.by === undefined).length;

// true-hour check on mid-b: the toll's `at` must sit at true world-hour 0.25 under
// the ORIGINAL sky epoch (hoursAt is rebase-invariant — if the weather verb snapped
// the day, this distance explodes).
let trueHourErr = 999;
if (skyEntry && tollB.length === 1) {
  const preSky = { hours: SKY_HOURS, rate: SKY_RATE, ts: Number(skyEntry.ts) };
  const eh = hoursAt(preSky, Number(tollB[0].args.bell.at));
  trueHourErr = Math.abs(eh - 0.25);
}

// weather rebase: the first post-weather fold probe's sky must carry hours ==
// hoursAt(pre-sky, weatherTs) (rebase to the verb ts) with the rate preserved.
let rebaseErr = 999, ratePreserved = -1;
const postWx = probeResults.find((p) => p.sky != null && weatherEntry && p.covered >= Number(weatherEntry.seq));
if (postWx?.sky && skyEntry && weatherEntry) {
  const preSky = { hours: SKY_HOURS, rate: SKY_RATE, ts: Number(skyEntry.ts) };
  rebaseErr = Math.abs(Number(postWx.sky.hours) - hoursAt(preSky, Number(weatherEntry.ts)));
  ratePreserved = Number(postWx.sky.rate);
}

// strikes: seer counts presence-plane sounds per tolling bell; first:true on #1
const sounds = SEER ? SEER.sounds.filter((m) => m.bell != null) : [];
const strikes = sounds.length;
const firstStrikes = ["mid-a", "mid-b", "mid-c", "mid-d"].filter((id) =>
  sounds.some((m) => m.id === id && m.bell?.first === true)).length;

// leases: each target settled EXACTLY once at the pinned p3
const places = entries.filter((e) => e.verb === "place");
const placeTotal = places.length;
let leaseExact = 0;
for (let i = 0; i < LEASE_IDS.length; i++) {
  const ps = places.filter((e) => e.args?.id === LEASE_IDS[i]);
  if (ps.length === 1 && Array.isArray(ps[0].args?.pos)
    && ps[0].args.pos.length === 3 && ps[0].args.pos.every((v: number, k: number) => v === PINNED_P3[i][k])) leaseExact++;
}

// ghost arithmetic from the seer (witnesses are the only embodied arrivals)
const witnessArrives = SEER ? SEER.arrives.filter((id) => id.startsWith("witness-")).length : -1;
const witnessLeaves = SEER ? SEER.leaves.filter((id) => id.startsWith("witness-")).length : -1;
const leaseStatesMidRoll = SEER ? SEER.leaseStates.filter((ts) => ts - t0 >= ROLL_START && ts - t0 <= ROLL_END).length : -1;

const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const suspicious = (await logFile.text()).split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));
const foldEquivOk = probeResults.filter((p) => p.ok).length;

// ---- SIGKILL restart: the rolled log must replay to the SAME world -------------
let restartBoot = 0, restartFoldEqual = false, restartTollDrift = 999, restartLineDrift = 999;
let restartDiff = "";
{
  const pre = foldPrefix(Infinity);
  const preCanon = canon(pre.st);
  const preTolls = tollSays.length;
  server.kill("SIGKILL");
  await sleep(600);
  server = spawnServer();
  if (await waitReady()) {
    restartBoot = 1;
    try {
      const probe = await connect(`restart-probe-${Math.floor(t0)}`, true);
      const v = verifySnapshot(probe.snapshot);
      // sequence identity rides the TAIL's top seq (throughSeq is -1 on every
      // join in this build — crash boot serves the whole log as entries tail;
      // the snapjoin law: covered = max(throughSeq, tailTop))
      restartFoldEqual = v.ok && v.covered === pre.maxSeq;
      if (!restartFoldEqual) {
        // key-level diagnosis: WHICH top-level state key diverged, and the
        // sequence-identity pair (throughSeq vs the log's max seq)
        const post = probe.snapshot?.state ?? {};
        const keys = new Set([...Object.keys(pre.st), ...Object.keys(post)]);
        const parts: string[] = [`covered=${v.covered} logMaxSeq=${pre.maxSeq} v.ok=${v.ok}`];
        for (const k of keys) if (canon((pre.st as any)[k]) !== canon((post as any)[k])) {
          const a = JSON.stringify((pre.st as any)[k])?.slice(0, 200) ?? "undefined";
          const b = JSON.stringify((post as any)[k])?.slice(0, 200) ?? "undefined";
          parts.push(`${k}: pre=${a} post=${b}`);
        }
        restartDiff = v.errs.concat(parts).join(" | ").slice(0, 600);
      }
      await sleep(2_600);   // ≥2 sweeps on the replayed schedule
      const post = logEntries();
      restartLineDrift = Math.abs(post.length - logTotalLines);
      const postTolls = post.filter((e) => e.verb === "say" && e.actor === "world" && e.args?.bell != null).length;
      restartTollDrift = Math.abs(postTolls - preTolls);
      try { probe.ws.close(); } catch {}
    } catch (err) { restartFoldEqual = false; restartTollDrift = 999; restartDiff = String(err).slice(0, 300); }
  }
}

const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  witnesses: witnessSpecs.length,
  tollA: tollA.length, tollB: tollB.length, tollC: tollC.length, tollD: tollD.length,
  tollGrammar, trueHourErr,
  strikes, firstStrikes,
  rebaseErr, ratePreserved,
  foldEquiv: foldEquivOk,
  rosterMid: Math.max(rosterMid, 0) === rosterMid ? rosterMid : 999,
  rosterUnknown: Math.max(rosterUnknown, 0) === rosterUnknown ? rosterUnknown : 999,
  witnessArrives, witnessLeaves,
  leaseExact, placeTotal,
  ghostLeaseStates: ghostLeaseStates < 0 ? 999 : ghostLeaseStates,
  leaseStatesMidRoll,
  saysAppended: saysAppendedArr.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeRollP95: pct(probeRoll, 95),
  finalPresent: Math.max(finalPresent, 0) === finalPresent ? finalPresent : 999,
  restartBoot, restartFoldEqual, restartTollDrift, restartLineDrift,
  logSuspicious: suspicious.length, logLineDrift: logLineDriftVal, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  anchors               ${anchors.length}/${1 + rest.length} joined — p95 ${Math.round(m.anchorJoinP95)}ms (${anchorFailed} failed)
  roll witnesses        ${witnessSpecs.length}/4 (t+4s, held through the roll)
  tolls at the wrap      mid-a[0] ${tollA.length} (hour ${tollA[0]?.args?.bell?.hour}) · mid-b[0.25] ${tollB.length} (hour ${tollB[0]?.args?.bell?.hour}) · mid-c[23.9] ${tollC.length} (hour ${tollC[0]?.args?.bell?.hour}) · mid-d[23.96,0.04] ${tollD.length} total (hour ${tollD[0]?.args?.bell?.hour})
  toll grammar          ${tollGrammar}/4 time-caused (actor world, bell{n,hour,at}, no cause/by)
  true hour at mid-b    err ${trueHourErr === 999 ? "N/A" : trueHourErr.toFixed(4) + "h"} from world-hour 0.25 (tol ±${TH.trueHourTol})
  strikes               ${strikes}/${EXPECT_STRIKES} presence-plane, first-markers ${firstStrikes}/4
  weather rebase        |Δhours| ${rebaseErr === 999 ? "N/A" : rebaseErr.toFixed(5)}h (tol ${TH.rebaseErr}) · rate after ${ratePreserved}
  fold-equivalence      ${foldEquivOk}/${N_PROBE} roll-window probes == fold(log through covered)${probeResults.some((p) => !p.ok) ? ` — ${probeResults.filter((p) => !p.ok).map((p) => `${p.id}: ${p.errs.join(";")}`).join(" | ")}` : ""}
  mid-roll roster       ${rosterMid} embodied (want 28), ${rosterUnknown} unknown
  witness arrive/leave  ${witnessArrives}/4, ${witnessLeaves}/4 (drift ${Math.abs(witnessArrives - 4)}/${Math.abs(witnessLeaves - 4)})
  leases across roll    ${leaseExact}/4 settled exactly-once at pinned p3 · place verbs ${placeTotal}/${EXPECT_PLACES} · lease states mid-roll ${leaseStatesMidRoll} (floor ${TH.leaseStatesMidRoll})
  ghost lease states    ${ghostLeaseStates} after final snapshot (must be 0)
  mid-roll says         ${saysAppendedArr.filter(Boolean).length}/3 appended — author p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)} (window ${Math.round((teardownAtTs - t0) / 1000)}s connected)
  frame latency ms      p50 ${Math.round(pct(latAll, 50))} p95 ${Math.round(m.latP95)} max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} spectators spanning the roll
  http probe ms         roll p95 ${Math.round(m.probeRollP95)} (n=${probeRoll.length}) · settled p95 ${Math.round(pct(probeSettled, 95))} (n=${probeSettled.length}) · errors ${probeErrors.n}
  final present         ${finalPresent} embodied (must be 0)
  SIGKILL restart       boot ${restartBoot}/1 · fold ${restartFoldEqual ? "EXACT-equal" : "DIFFERS"} · toll drift ${restartTollDrift} · line drift ${restartLineDrift}${restartDiff ? `\n    restart diff: ${restartDiff}` : ""}
  world log             ${logTotalLines} lines vs expected ${EXPECT_LOG_LINES} (drift ${logLineDriftVal})
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${suspicious.length} suspicious lines
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — the day turned over mid-load and every ledger held: tolls, fold, leases, replay`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
