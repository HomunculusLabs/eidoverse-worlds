// Pressure scenario 23: SNAPSHOT SIZE BOMB — worlds with 10k+ entities join
// without OOM or unbounded latency. Design target: 24 embodied performers
// and up to 200 connected spectators.
//
// The join path costs a joiner the size of the WORLD, not its history
// (joinPayload = folded state + tail). At 10,240 entities the surfaces that
// could degrade are:
//   1. BOOT (crash shape: no snapshot.json) — replay 13.5k entries, and
//      every joiner's snapshot then carries the WHOLE log as the entries
//      tail (~3.4MB on the wire per joiner).
//   2. BOOT (clean shape: snapshot.json) — load state, joiners get ~1.15MB
//      state-only snapshots; a 192-socket population hits this path.
//   3. FOLD — every FOLD_EVERY appends, fold() JSON.stringify's the entire
//      10k-entity state and writes it SYNCHRONOUSLY on the event loop while
//      ~190 clients stream. A place-storm at 20 appends/s folds every ~7.5s.
//   4. Per-join O(state) work: joinPayload serialize + sendGeomFollowup's
//      entity scan + recentChat (256 says seeded, 40 ride every snapshot).
//
// Seeding is a SYNTHESIZED LOG FILE in the exact WorldLog JSONL shape
// ({seq,ts,actor,verb,args}, seq from 0, genesis first, monotone ts) — the
// honest on-disk shape of a big world, and the same boot input a
// crash-restart sees. Faithfulness is proven by the boot itself: the replay
// folds the file into exactly 10,240 entities and every fold-equivalence
// sample equals fold(log FILE through covered).
//
// Population (pinned before measuring — 193 peak concurrent sockets):
//   A1: crash-shape boot, 16 sequential spectator joins (tail path).
//   SIGTERM → shutdown fold writes snapshot.json → restart.
//   A2: 24 embodied @15Hz (16 pure + 8 builders, WORLD_ADMIN)
//       + 104 persistent spectators = 128 anchors, then 64 storm slots
//       cycling fresh spectator joins t+3-17s.
//   B:  8 builders × 2.5/s place-storm t+19-39s (400 places; FOLD_EVERY=150
//       → ≥2 whole-state folds mid-traffic) + 8 trickle joins (non-empty
//       tail on a big world) + fairness says.
//   End: quiet final join (== fold(full log)), drain, afterwave join.
//
// Acceptance gates (pinned before measuring — see TH):
//   SERVER_DIR=/tmp/pressure23-wt PORT=8978 bun tools/pressure-snapshotbomb.ts
//   SELFTEST=1 bun tools/pressure-snapshotbomb.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only
// if every pinned gate holds. shared/fold.js is imported from the harness
// tree (clean); the server runs from SERVER_DIR (the pinned worktree).

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { emptyState, foldEntry } from "../shared/fold.js";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure23-wt";
const PORT = Number(process.env.PORT ?? 8978);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure23-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "alpha";
const N_ENT = 10_240, N_COMP = 2_048, N_PLACE = 1_024, N_SAY = 256;
const SEED_LINES = 1 + N_ENT + N_COMP + N_PLACE + N_SAY;   // 13,569 (seq 0..13568)
const N_PERF = 24, N_BUILD = 8, N_SPEC = 104, N_SLOTS = 64; // 128 anchors + 64 slots = 192 peak
const POSE_HZ = 15;
const A1_JOINS = 16;
const A1_TAIL_SAMPLES = 2;
const STORM_SAMPLES = 12;
const STORM_START = 3_000, STORM_END = 17_000;             // A2 storm window
const BUILD_START = 19_000, BUILD_END = 39_000;            // phase B window
const BUILD_HZ_MS = 400;                                    // 2.5/s per builder (10/4s < 12 budget)
const TRICKLE_AT = [21_000, 23_500, 26_000, 28_500, 31_000, 33_500, 36_000, 38_000];
const SAY_AT = [[6_500, "perf-3"], [13_000, "perf-9"], [24_000, "perf-3"], [33_000, "perf-9"]];
const FINAL_AT = 41_000, DRAIN_AT = 43_000, AFTERWAVE_AT = 45_000, TEARDOWN_AT = 46_000;
const DURATION = 50_000;
const LINGER_MS = 600;
const MSG_RATE = "600";                                     // same scratch envelope as pressure-1..22
const SELFTEST = process.env.SELFTEST === "1";
const DEBUG = process.env.PRESSURE_DEBUG === "1";
const LOG_JSONL = `${WORLDS}/${WORLD}/log.jsonl`;
const SNAP_JSON = `${WORLDS}/${WORLD}/snapshot.json`;
const BUILDERS = Array.from({ length: N_BUILD }, (_, i) => `build-${i}`);
const STATE_SAMPLES = STORM_SAMPLES + TRICKLE_AT.length + 1; // 21 fold-equivalence samples

const TH = {
  bootReplayMs: 15_000,          // crash-shape boot + first join (replay 13.5k + 3.4MB send)
  tailJoinsMin: A1_JOINS, tailP95Ms: 2_000, tailEntityFail: 0, tailLenFail: 0, tailSampleExact: A1_TAIL_SAMPLES,
  snapSeqExact: 1, snapBytesExact: 1,
  bootSnapshotMs: 8_000,
  anchorFailed: 0, anchorJoinP95Ms: 3_000,
  stormJoinFail: 0, stormJoinsMin: 180, stormP95Ms: 1_000, stormEntityFail: 0,
  stateExactMin: STATE_SAMPLES,  // EVERY sampled snapshot must equal fold(log through covered)
  trickleJoinsMin: TRICKLE_AT.length, trickleP95Ms: 1_000,
  fpsP50: 12, latP95Ms: 250, seqGaps: 0,
  sayP95Ms: 500, placeP95Ms: 500,
  probeStormP95Ms: 250, probeMaxMs: 1_000, probeSettledP95Ms: 100,
  foldsDuringBMin: 2,
  rssPeakGrowthMB: 500,
  finalStateExact: 1,
  afterwaveJoinMs: 1_000,
  arriveLeaveDrift: 0,
  logLineDrift: 0, verbArithDrift: 0,
  logSuspicious: 0,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  bootReplayMs: number;
  tailJoins: number; tailP95: number; tailEntityFail: number; tailLenFail: number; tailSampleExact: number;
  snapSeqExact: number; snapBytesExact: number;
  bootSnapshotMs: number;
  anchorFailed: number; anchorJoinP95: number;
  stormJoinFail: number; stormJoins: number; stormP95: number; stormEntityFail: number;
  stateExact: number; stateSamples: number;
  trickleJoins: number; trickleP95: number;
  fpsP50: number; latP95: number; gaps: number;
  sayP95: number; placeP95: number;
  probeStormP95: number; probeMax: number; probeSettledP95: number;
  foldsDuringB: number;
  rssPeakGrowth: number;
  finalStateExact: number;
  afterwaveJoinMs: number;
  arriveLeaveDrift: number;
  logLineDrift: number; verbArithDrift: number;
  logSuspicious: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.bootReplayMs > TH.bootReplayMs) fail.push(`crash-shape boot+first join ${Math.round(m.bootReplayMs)}ms > ${TH.bootReplayMs}ms`);
  if (m.tailJoins < TH.tailJoinsMin) fail.push(`tail-path joins ${m.tailJoins} < ${TH.tailJoinsMin}`);
  if (m.tailP95 > TH.tailP95Ms) fail.push(`tail-path join p95 ${Math.round(m.tailP95)}ms > ${TH.tailP95Ms}ms`);
  if (m.tailEntityFail > TH.tailEntityFail) fail.push(`${m.tailEntityFail} tail joins with wrong entity count`);
  if (m.tailLenFail > TH.tailLenFail) fail.push(`${m.tailLenFail} tail joins with wrong tail length`);
  if (m.tailSampleExact < TH.tailSampleExact) fail.push(`tail fold-equivalence samples ${m.tailSampleExact} < ${TH.tailSampleExact}`);
  if (m.snapSeqExact !== TH.snapSeqExact) fail.push("shutdown snapshot seq != seeded maxSeq");
  if (m.snapBytesExact !== TH.snapBytesExact) fail.push("shutdown snapshot byte offset != log size");
  if (m.bootSnapshotMs > TH.bootSnapshotMs) fail.push(`snapshot-shape boot ${Math.round(m.bootSnapshotMs)}ms > ${TH.bootSnapshotMs}ms`);
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchors failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.stormJoinFail > TH.stormJoinFail) fail.push(`${m.stormJoinFail} storm joins failed/timed out`);
  if (m.stormJoins < TH.stormJoinsMin) fail.push(`storm joins ${m.stormJoins} < ${TH.stormJoinsMin} — storm not sustained`);
  if (m.stormP95 > TH.stormP95Ms) fail.push(`storm join p95 ${Math.round(m.stormP95)}ms > ${TH.stormP95Ms}ms — unbounded latency`);
  if (m.stormEntityFail > TH.stormEntityFail) fail.push(`${m.stormEntityFail} storm joins with wrong entity count`);
  if (m.stateExact < TH.stateExactMin) fail.push(`fold-equivalence ${m.stateExact}/${m.stateSamples} sampled snapshots disagreed with fold(log) — torn or dropped state`);
  if (m.trickleJoins < TH.trickleJoinsMin) fail.push(`trickle joins ${m.trickleJoins} < ${TH.trickleJoinsMin}`);
  if (m.trickleP95 > TH.trickleP95Ms) fail.push(`trickle join p95 ${Math.round(m.trickleP95)}ms > ${TH.trickleP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`spectator fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.placeP95 > TH.placeP95Ms) fail.push(`place author p95 ${Math.round(m.placeP95)}ms > ${TH.placeP95Ms}ms`);
  if (m.probeStormP95 > TH.probeStormP95Ms) fail.push(`storm-window HTTP probe p95 ${Math.round(m.probeStormP95)}ms > ${TH.probeStormP95Ms}ms`);
  if (m.probeMax > TH.probeMaxMs) fail.push(`HTTP probe MAX ${Math.round(m.probeMax)}ms > ${TH.probeMaxMs}ms — event-loop stall (fold?)`);
  if (m.probeSettledP95 > TH.probeSettledP95Ms) fail.push(`post-settle HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > ${TH.probeSettledP95Ms}ms`);
  if (m.foldsDuringB < TH.foldsDuringBMin) fail.push(`folds during place-storm ${m.foldsDuringB} < ${TH.foldsDuringBMin} — fold path not exercised`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB — OOM-shaped retention`);
  if (m.finalStateExact !== TH.finalStateExact) fail.push("final quiet snapshot != fold(full log)");
  if (m.afterwaveJoinMs > TH.afterwaveJoinMs) fail.push(`post-drain afterwave join ${Math.round(m.afterwaveJoinMs)}ms > ${TH.afterwaveJoinMs}ms — degraded after load`);
  if (m.arriveLeaveDrift > TH.arriveLeaveDrift) fail.push(`embodied arrive/leave drift ${m.arriveLeaveDrift}`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`log line drift ${m.logLineDrift} (want lines == maxSeq+1)`);
  if (m.verbArithDrift > TH.verbArithDrift) fail.push(`verb arithmetic drift ${m.verbArithDrift}`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    bootReplayMs: 3_200,
    tailJoins: A1_JOINS, tailP95: 480, tailEntityFail: 0, tailLenFail: 0, tailSampleExact: A1_TAIL_SAMPLES,
    snapSeqExact: 1, snapBytesExact: 1,
    bootSnapshotMs: 900,
    anchorFailed: 0, anchorJoinP95: 400,
    stormJoinFail: 0, stormJoins: 214, stormP95: 180, stormEntityFail: 0,
    stateExact: STATE_SAMPLES, stateSamples: STATE_SAMPLES,
    trickleJoins: TRICKLE_AT.length, trickleP95: 210,
    fpsP50: 14.6, latP95: 14, gaps: 0,
    sayP95: 8, placeP95: 12,
    probeStormP95: 30, probeMax: 90, probeSettledP95: 3,
    foldsDuringB: 2,
    rssPeakGrowth: 180,
    finalStateExact: 1,
    afterwaveJoinMs: 160,
    arriveLeaveDrift: 0,
    logLineDrift: 0, verbArithDrift: 0,
    logSuspicious: 0,
  };
  const breached: Measurements = {
    ...healthy,
    bootReplayMs: 16_000,
    tailJoins: 12, tailP95: 2_400, tailEntityFail: 1, tailLenFail: 1, tailSampleExact: 1,
    snapSeqExact: 0, snapBytesExact: 0,
    bootSnapshotMs: 9_000,
    anchorFailed: 1, anchorJoinP95: 3_100,
    stormJoinFail: 1, stormJoins: 100, stormP95: 1_400, stormEntityFail: 2,
    stateExact: 10, stateSamples: STATE_SAMPLES,
    trickleJoins: 6, trickleP95: 1_200,
    fpsP50: 9, latP95: 300, gaps: 1,
    sayP95: 600, placeP95: 700,
    probeStormP95: 300, probeMax: 1_400, probeSettledP95: 150,
    foldsDuringB: 1,
    rssPeakGrowth: 640,
    finalStateExact: 0,
    afterwaveJoinMs: 1_300,
    arriveLeaveDrift: 1,
    logLineDrift: 1, verbArithDrift: 1,
    logSuspicious: 1,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["crash-shape boot", "tail-path joins", "tail-path join p95", "wrong entity count", "wrong tail length",
    "tail fold-equivalence", "snapshot seq", "byte offset", "snapshot-shape boot", "anchors failed", "anchor join p95",
    "storm joins failed", "storm not sustained", "unbounded latency", "storm joins with wrong entity",
    "torn or dropped state", "trickle joins", "trickle join p95", "fps p50", "frame latency p95", "frame seq gaps",
    "say author p95", "place author p95", "storm-window HTTP", "event-loop stall", "post-settle HTTP",
    "fold path not exercised", "OOM-shaped retention", "final quiet snapshot", "degraded after load",
    "arrive/leave drift", "log line drift", "verb arithmetic drift", "suspicious server log lines"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_ENT.toLocaleString()}-entity world (seeded log ${SEED_LINES.toLocaleString()} lines ~3.4MB: genesis + ${N_ENT} spawns props/ball.glb + ${N_COMP} comps + ${N_PLACE} places + ${N_SAY} says). A1 crash-shape boot then ${A1_JOINS} sequential tail-path joins (whole log rides the entries tail); SIGTERM then shutdown fold then restart; A2 snapshot path: ${N_PERF} embodied @${POSE_HZ}Hz (16 pure + ${N_BUILD} builders) + ${N_SPEC} persistent spec = 128 anchors, ${N_SLOTS}-slot join storm t+${STORM_START / 1000}-${STORM_END / 1000}s (peak 192); phase B place-storm ${N_BUILD}x2.5/s t+${BUILD_START / 1000}-${BUILD_END / 1000}s (400 places, FOLD_EVERY=150: >=2 whole-state folds mid-traffic) + ${TRICKLE_AT.length} trickle joins + fairness says; quiet final join, drain, afterwave. ${STATE_SAMPLES} fold-equivalence samples vs the log FILE. ${DURATION / 1000}s A2, MSG_RATE=${MSG_RATE}.`);
console.log(`thresholds: bootReplay<${TH.bootReplayMs}ms tail ${A1_JOINS}@p95<${TH.tailP95Ms}ms entities/tail exact snapSeq+bytes exact bootSnap<${TH.bootSnapshotMs}ms anchors 128@p95<${TH.anchorJoinP95Ms}ms storm>=${TH.stormJoinsMin}@p95<${TH.stormP95Ms}ms stateExact==${TH.stateExactMin} trickle ${TH.trickleJoinsMin}@p95<${TH.trickleP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps0 sayP95<${TH.sayP95Ms}ms placeP95<${TH.placeP95Ms}ms probes p95<${TH.probeStormP95Ms}ms MAX<${TH.probeMaxMs}ms settled<${TH.probeSettledP95Ms}ms folds>=${TH.foldsDuringBMin} rss<+${TH.rssPeakGrowthMB}MB finalExact afterwave<${TH.afterwaveJoinMs}ms drift 0/0/0 suspicious0`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-snapshotbomb.ts`);
  process.exit(2);
}

// ---- seed the big world's log (exact WorldLog JSONL shape) --------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(`${WORLDS}/${WORLD}`, { recursive: true });
{
  const t0 = performance.now();
  const ts0 = Date.now() - SEED_LINES * 100;      // monotone, ~22min of history
  const parts: string[] = [];
  parts.push(JSON.stringify({ seq: 0, ts: ts0, actor: "world", verb: "genesis", args: { v: 2, dialect: "eidoverse-log" } }));
  let seq = 0;
  for (let i = 0; i < N_ENT; i++) {
    parts.push(JSON.stringify({ seq: ++seq, ts: ts0 + seq * 100, actor: "seed-bot", verb: "spawn",
      args: { id: `b${i}`, lib: "props/ball.glb", pos: [(i % 101) * 1.2 - 60, 0, Math.floor(i / 101) * 1.2 - 60], yaw: 0 } }));
  }
  for (let i = 0; i < N_COMP; i++) {
    parts.push(JSON.stringify({ seq: ++seq, ts: ts0 + seq * 100, actor: "seed-bot", verb: "comp",
      args: { id: `b${i}`, type: `mark-${i % 7}`, data: { n: i, s: "x".repeat(64) } } }));
  }
  for (let i = 0; i < N_PLACE; i++) {
    const j = N_PLACE + i;
    parts.push(JSON.stringify({ seq: ++seq, ts: ts0 + seq * 100, actor: "seed-bot", verb: "place",
      args: { id: `b${j}`, pos: [(i % 53) * 2.1 - 55, 0, Math.floor(i / 53) * 2.1 - 55], yaw: (i % 12) * 0.5 } }));
  }
  for (let i = 0; i < N_SAY; i++) {
    parts.push(JSON.stringify({ seq: ++seq, ts: ts0 + seq * 100, actor: "seed-a", verb: "say",
      args: { text: `seed-say-${i} — the world is its log; presence is a plane, not a file.` } }));
  }
  await Bun.write(LOG_JSONL, parts.join("\n") + "\n");
  const seedBytes = Bun.file(LOG_JSONL).size;
  console.log(`seeded ${parts.length.toLocaleString()} entries (${(seedBytes / 1e6).toFixed(2)}MB) in ${(performance.now() - t0).toFixed(0)}ms`);
}

// ---- helpers -------------------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MB = (kb: number) => Math.round(kb / 1024);
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
function startServer() {
  const logPath = `/tmp/pressure23-server-${Date.now()}.log`;
  const server = Bun.spawn({
    cmd: ["bun", "run", "server/server.ts"],
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, WORLD_ADMIN: BUILDERS.join(","), EIDOVERSE_DIR: process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video" },
    stdout: Bun.file(logPath), stderr: Bun.file(logPath),
  });
  return { server, logPath };
}
const rssOf = (pid: number) => {
  try {
    const r = Bun.spawnSync(["ps", "-o", "rss=", "-p", String(pid)]);
    return Number(String(r.stdout).trim());
  } catch { return NaN; }
};
async function waitReady(pid: number) {
  for (let i = 0; i < 120; i++) {
    await sleep(250);
    try { const r = await fetch(`http://127.0.0.1:${PORT}/version`); if (r.status > 0) return; } catch { /* booting */ }
  }
  throw new Error(`sequencer (pid ${pid}) never became ready`);
}

// ---- canonical deep compare + log-file folding (pressure-8 chassis) -------------
function canon(v: any): string {
  if (v === undefined) return "undef";
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
}
const foldCache = new Map<number, string>();      // covered -> canon(fold(log through covered))
function foldPrefixCanon(covered: number): string {
  const hit = foldCache.get(covered);
  if (hit !== undefined) return hit;
  const raw = readFileSync(LOG_JSONL, "utf8");
  const lines = raw.split("\n");
  const st = emptyState();
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (!line.trim()) continue;
    let e: any;
    try { e = JSON.parse(line); } catch { if (li === lines.length - 1) break; continue; }
    if (Number(e.seq) <= covered) foldEntry(st, e);
  }
  const c = canon(st);
  foldCache.set(covered, c);
  return c;
}
function maxSeqInFile(): number {
  let mx = 0;
  for (const line of readFileSync(LOG_JSONL, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try { const e = JSON.parse(line); if (Number(e.seq) > mx) mx = Number(e.seq); } catch { /* torn tail */ }
  }
  return mx;
}
function snapFacts(m: any) {
  const throughSeq = typeof m.throughSeq === "number" ? m.throughSeq : -1;
  const tail: any[] = Array.isArray(m.entries) ? m.entries : [];
  const tailTop = tail.length ? Number(tail[tail.length - 1].seq) : throughSeq;
  return {
    entities: m.state?.entities ? Object.keys(m.state.entities).length : -1,
    covered: Math.max(throughSeq, tailTop), tailLen: tail.length, throughSeq,
  };
}

// ---- client chassis -------------------------------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; snapAt: number; closed: boolean; id: string;
  sayEcho: Map<string, number>; errs: string[]; snapMsg: any;
  arrives: number; leaves: number;
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], snapAt: 0, closed: false, id,
      sayEcho: new Map(), errs: [], snapMsg: null, arrives: 0, leaves: 0 };
    let openAt = 0;
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => { openAt = performance.now(); ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN })); };
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { s.snapAt = performance.now(); s.joinMs = s.snapAt - openAt; s.snapMsg = m; clearTimeout(to); resolve(s); }
      else if (m.type === "frame") {
        s.frames++; s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      }
      else if (m.type === "arrive") s.arrives++;
      else if (m.type === "leave") s.leaves++;
      else if (m.type === "log" && m.entry?.verb === "say" && !s.sayEcho.has(m.entry.args?.text)) s.sayEcho.set(m.entry.args?.text, performance.now());
      else if (m.type === "error") s.errs.push(String(m.error ?? ""));
    };
    ws.onclose = () => { s.closed = true; };
    ws.onerror = () => { /* close follows */ };
  });
}
/** one-shot spectator join that returns the raw snapshot (for verification). */
function joinOnce(id: string, timeoutMs = 15_000): Promise<{ joinMs: number; msg: any } | null> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    let openAt = 0, done = false;
    const finish = (r: any) => { if (!done) { done = true; resolve(r); } };
    const to = setTimeout(() => { try { ws.close(); } catch {} finish(null); }, timeoutMs);
    ws.onopen = () => { openAt = performance.now(); ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: "x.vrm", spectate: true, token: TOKEN })); };
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { clearTimeout(to); finish({ joinMs: performance.now() - openAt, msg: m }); try { ws.close(); } catch {} }
    };
    ws.onclose = () => { clearTimeout(to); finish(null); };
    ws.onerror = () => { /* close follows */ };
  });
}

// =====================================================================
// PHASE A1 — crash-shape boot (no snapshot.json): replay + tail-path joins
// =====================================================================
let { server, logPath: serverLog1 } = startServer();
await waitReady(server.pid);

let bootReplayMs = 0;
const tailJoins: { id: string; joinMs: number; entities: number; tailLen: number; throughSeq: number }[] = [];
let tailEntityFail = 0, tailLenFail = 0, tailSampleExact = 0;
for (let k = 0; k < A1_JOINS; k++) {
  const s = await connect(`a1-${k}`, true);
  const f = snapFacts(s.snapMsg);
  if (k === 0) bootReplayMs = s.joinMs;
  if (f.entities !== N_ENT) tailEntityFail++;
  if (f.tailLen !== SEED_LINES || f.throughSeq !== -1) tailLenFail++;
  if (k < A1_TAIL_SAMPLES) {
    const okState = canon(s.snapMsg.state) === foldPrefixCanon(f.covered);
    if (okState) tailSampleExact++;
    if (DEBUG) console.log(`DBG a1-${k}: joinMs=${s.joinMs.toFixed(0)} covered=${f.covered} tailLen=${f.tailLen} entities=${f.entities} foldEq=${okState}`);
  }
  tailJoins.push({ id: s.id, joinMs: s.joinMs, entities: f.entities, tailLen: f.tailLen, throughSeq: f.throughSeq });
  await sleep(250);
  try { s.ws.close(); } catch {}
}
console.log(`A1 crash-shape boot: first join (lazy replay of ${SEED_LINES.toLocaleString()} entries + ${(3.4).toFixed(1)}MB tail send) = ${Math.round(bootReplayMs)}ms; ${tailJoins.length} tail joins p50 ${Math.round(pct(tailJoins.map((t) => t.joinMs), 50))}ms p95 ${Math.round(pct(tailJoins.map((t) => t.joinMs), 95))}ms (entities ${N_ENT} exact: ${tailEntityFail === 0 ? "yes" : "NO"}, tail ${SEED_LINES} exact: ${tailLenFail === 0 ? "yes" : "NO"})`);

// SIGTERM → shutdown fold writes snapshot.json for the A2 boot
server.kill("SIGTERM");
await server.exited;
let snapSeqExact = 0, snapBytesExact = 0;
if (existsSync(SNAP_JSON)) {
  const snap = JSON.parse(readFileSync(SNAP_JSON, "utf8"));
  const logSize = Bun.file(LOG_JSONL).size;
  if (snap.seq === SEED_LINES - 1) snapSeqExact = 1;
  if (snap.bytes === logSize) snapBytesExact = 1;
  if (DEBUG) console.log(`DBG shutdown snapshot: seq=${snap.seq} bytes=${snap.bytes} logSize=${logSize} stateEntities=${Object.keys(snap.state?.entities ?? {}).length}`);
}

// =====================================================================
// PHASE A2 — snapshot-shape boot + population + storm; then B place-storm
// =====================================================================
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
let server2: any = null, serverLog2 = "";
{
  const r = startServer();
  server2 = r.server; serverLog2 = r.logPath;
}
await waitReady(server2.pid);

// first join loads the world from snapshot.json — that is the boot measure
let bootSnapshotMs = 0;
{
  const first = await joinOnce(`boot2-${Math.floor(Date.now() / 1000)}`);
  if (!first) { console.log("FAIL: snapshot-shape boot join never completed"); server2.kill("SIGTERM"); process.exit(1); }
  bootSnapshotMs = first.joinMs;
  const f = snapFacts(first.msg);
  if (f.entities !== N_ENT || f.tailLen !== 0) {
    console.log(`FAIL: snapshot boot served entities=${f.entities} tailLen=${f.tailLen} (want ${N_ENT}/0)`);
    server2.kill("SIGTERM"); process.exit(1);
  }
}
console.log(`A2 snapshot-shape boot: first join (state load + ${(1.15).toFixed(2)}MB state-only send) = ${Math.round(bootSnapshotMs)}ms (snapshot seq/bytes exact: ${snapSeqExact === 1 ? "yes" : "NO"}/${snapBytesExact === 1 ? "yes" : "NO"})`);

// anchor population — 128 concurrent joins against the big world
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(i < N_BUILD ? BUILDERS[i] : `perf-${i}`, false, i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const anchorFailed = all.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-") || s.id.startsWith("build-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
console.log(`t+${((performance.now() - t0) / 1000).toFixed(1)}s: anchors joined ${anchors.length}/${all.length} in ${Math.round(pct(anchors.map((s) => s.joinMs), 50))}/${Math.round(pct(anchors.map((s) => s.joinMs), 95))}ms p50/p95`);

// SEER = specs[0]: arrive/leave arithmetic + say receipt ground truth
const SEER = specs[0];
const present0 = SEER.snapMsg?.present?.length ?? 0;
const expectedArrives = N_PERF - present0;   // embodied that joined after the seer's snapshot

// embodied presence @15Hz
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

// HTTP event-loop probes: /version is world-independent (isolation by design)
const probeStorm: number[] = [], probeSettled: number[] = [];
let probeMax = 0;
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/version`); await r.arrayBuffer(); } catch { /* counted by absence */ }
  const d = performance.now() - t;
  if (d > probeMax) probeMax = d;
  (performance.now() - t0 < BUILD_END ? probeStorm : probeSettled).push(d);
}, 500);
const rssSamples: Record<string, number> = { postAnchor: NaN, peak: NaN };
setTimeout(() => { rssSamples.postAnchor = rssOf(server2.pid); }, 2_500);
const rssTimer = setInterval(() => {
  const r = rssOf(server2.pid);
  if (Number.isFinite(r) && performance.now() - t0 >= 3_000 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- A2 join storm: 64 slots cycling fresh spectator joins ---------------------
type StormRec = { joinMs: number; entities: number; covered: number; tailLen: number; stateOk: boolean | null };
const stormJoins: StormRec[] = [];
let stormJoinFail = 0, stormEntityFail = 0, stormVerified = 0;
let stormCycle = 0;
const stormP = (async () => {
  await sleep(Math.max(0, STORM_START - (performance.now() - t0)));
  const slots = Array.from({ length: N_SLOTS }, async (_, slot) => {
    await sleep(150 * slot);
    while (running && performance.now() - t0 < STORM_END - 500) {
      stormCycle++;
      const r = await joinOnce(`a2-${slot}-${stormCycle}`);
      if (!r) { stormJoinFail++; }
      else {
        const f = snapFacts(r.msg);
        if (f.entities !== N_ENT) stormEntityFail++;
        let stateOk: boolean | null = null;
        if (stormVerified < STORM_SAMPLES) {   // verify the first N sampled joins
          stateOk = canon(r.msg.state) === foldPrefixCanon(f.covered);
          stormVerified++;
        }
        stormJoins.push({ joinMs: r.joinMs, entities: f.entities, covered: f.covered, tailLen: f.tailLen, stateOk });
      }
      await sleep(250);
    }
  });
  await Promise.all(slots);
})();

// ---- fairness says (embodied authors, receipt on own echo) ----------------------
const sayLat: number[] = [];
for (const [tms, who] of SAY_AT as [number, string][]) {
  at(tms, () => {
    const s = perfs.find((x) => x.id === who);
    if (!s || s.ws.readyState !== 1) return;
    const text = `probe-${tms}-${Math.floor(t0)}`;
    const sentAt = performance.now();
    s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(tms + 2_000, () => { const hit = s.sayEcho.get(text); if (hit !== undefined) sayLat.push(hit - sentAt); });
  });
}

// ---- phase B: builder place-storm (folds the whole 10k state mid-traffic) ------
const placeLat: number[] = [];
let placeAccepted = 0, placeRefused = 0, sayAccepted = 0;
const builders = anchors.filter((s) => s.id.startsWith("build-"));
for (const b of builders) {
  const orig = b.ws.onmessage;
  b.ws.onmessage = (ev: any) => {
    (orig as any)?.call(b.ws, ev);
    const m = JSON.parse(String(ev.data));
    if (m.type === "log" && m.entry?.verb === "place") {
      const key = `${m.entry.args?.id}@${m.entry.args?.pos?.join(",")}`;
      const sent = placeSendAt.get(key);
      if (sent !== undefined) { placeLat.push(performance.now() - sent); placeSendAt.delete(key); placeAccepted++; }
    } else if (m.type === "log" && m.entry?.verb === "say" && String(m.entry.args?.text ?? "").startsWith("probe-")) sayAccepted++;
    else if (m.type === "error" && String(m.error ?? "").includes("slow down")) placeRefused++;
  };
}
const placeSendAt = new Map<string, number>();
let placeTick = 0;
const buildTimer = setInterval(() => {
  const el = performance.now() - t0;
  if (el < BUILD_START || el >= BUILD_END) return;
  const k = placeTick++;
  builders.forEach((b, i) => {
    if (b.ws.readyState !== 1) return;
    const id = `b${N_PLACE + ((k * N_BUILD + i) % N_PLACE)}`;
    const pos = [((k * N_BUILD + i) % 53) * 2.1 - 55, 0, (Math.floor((k * N_BUILD + i) / 53) % 20) * 2.1 - 21];
    placeSendAt.set(`${id}@${pos.join(",")}`, performance.now());
    b.ws.send(JSON.stringify({ type: "verb", verb: "place", args: { id, pos, yaw: (k % 12) * 0.5 } }));
  });
}, BUILD_HZ_MS);

// ---- trickle joins during B (non-empty tail on a big world) --------------------
const trickleJoins: { joinMs: number; stateOk: boolean; covered: number; tailLen: number }[] = [];
const trickleP = (async () => {
  for (const tt of TRICKLE_AT) {
    await sleep(Math.max(0, tt - (performance.now() - t0)));
    const r = await joinOnce(`tri-${tt}`);
    if (r) {
      const f = snapFacts(r.msg);
      trickleJoins.push({ joinMs: r.joinMs, stateOk: canon(r.msg.state) === foldPrefixCanon(f.covered), covered: f.covered, tailLen: f.tailLen });
    }
  }
})();

// ---- quiet final join: must equal fold(full log) --------------------------------
let finalSnap: any = null;
const finalP = (async () => {
  await sleep(Math.max(0, FINAL_AT - (performance.now() - t0)));
  const r = await joinOnce(`final-${Math.floor(t0)}`);
  if (r) finalSnap = r.msg;
})();

// ---- drain + afterwave -----------------------------------------------------------
const drainP = (async () => {
  await sleep(Math.max(0, DRAIN_AT - (performance.now() - t0)));
  for (const s of anchors) { try { s.ws.close(); } catch {} }
})();
let afterwaveJoinMs = 0;
const afterwaveP = (async () => {
  await sleep(Math.max(0, AFTERWAVE_AT - (performance.now() - t0)));
  const r = await joinOnce(`after-${Math.floor(t0)}`);
  if (r) afterwaveJoinMs = r.joinMs;
})();

await sleep(DURATION);
running = false;
tickers.forEach(clearInterval);
clearInterval(probeTimer); clearInterval(rssTimer); clearInterval(buildTimer);
await Promise.allSettled([stormP, trickleP, finalP, drainP, afterwaveP]);
await sleep(300);

// ---- ground truth from the world log FILE ----------------------------------------
const logText = readFileSync(LOG_JSONL, "utf8");
const logLines = logText.split("\n").filter((l) => l.trim()).length;
const logMaxSeq = maxSeqInFile();
const fileVerbs = new Map<string, number>();
for (const line of logText.split("\n")) {
  if (!line.trim()) continue;
  let e: any; try { e = JSON.parse(line); } catch { continue; }
  fileVerbs.set(e.verb, (fileVerbs.get(e.verb) ?? 0) + 1);
}
const expectedMaxSeq = SEED_LINES + (fileVerbs.get("place") ?? 0) - N_PLACE + (fileVerbs.get("say") ?? 0) - N_SAY;
const log1Text = await Bun.file(serverLog1).text();
const log2Text = await Bun.file(serverLog2).text();
const foldsDuringB = (log2Text.match(/folded through seq \d+ \(threshold\)/g) ?? []).length;
const suspicious = [...log1Text.split("\n"), ...log2Text.split("\n")].filter((l: string) => /error|warn|uncaught|failed/i.test(l));
// arrive/leave arithmetic is SERVER-LOG authoritative (pressure-3 law): a peer
// observer is itself an anchor, and the en-masse drain closes it before it can
// witness the departure broadcast it is supposed to count.
const arrivesLogged = log2Text.split("\n").filter((l: string) => /— \S+ joined$/.test(l.trim())).length;
const leavesLogged = log2Text.split("\n").filter((l: string) => /— \S+ left$/.test(l.trim())).length;

// ---- derive measurements ----------------------------------------------------------
const finalCovered = finalSnap ? snapFacts(finalSnap).covered : -1;
const finalStateExact = finalSnap && finalCovered === logMaxSeq && canon(finalSnap.state) === foldPrefixCanon(logMaxSeq) ? 1 : 0;
const stateSamples = stormJoins.filter((j) => j.stateOk !== null).length + trickleJoins.length + (finalSnap ? 1 : 0);
const stateExact = stormJoins.filter((j) => j.stateOk === true).length + trickleJoins.filter((j) => j.stateOk).length + finalStateExact;
const arriveLeaveDrift = Math.abs(arrivesLogged - N_PERF) + Math.abs(leavesLogged - N_PERF);
const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, t0 + TEARDOWN_AT) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postAnchor || NaN));

const m: Measurements = {
  bootReplayMs,
  tailJoins: tailJoins.length, tailP95: pct(tailJoins.map((t) => t.joinMs), 95), tailEntityFail, tailLenFail, tailSampleExact,
  snapSeqExact, snapBytesExact,
  bootSnapshotMs,
  anchorFailed, anchorJoinP95: pct(anchors.map((s) => s.joinMs), 95),
  stormJoinFail, stormJoins: stormJoins.length, stormP95: pct(stormJoins.map((j) => j.joinMs), 95), stormEntityFail,
  stateExact, stateSamples,
  trickleJoins: trickleJoins.length, trickleP95: pct(trickleJoins.map((j) => j.joinMs), 95),
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity, placeP95: placeLat.length ? pct(placeLat, 95) : Infinity,
  probeStormP95: pct(probeStorm, 95), probeMax, probeSettledP95: pct(probeSettled, 95),
  foldsDuringB,
  rssPeakGrowth,
  finalStateExact,
  afterwaveJoinMs,
  arriveLeaveDrift,
  logLineDrift: Math.abs(logLines - (logMaxSeq + 1)), verbArithDrift: Math.abs((logMaxSeq + 1) - expectedMaxSeq),
  logSuspicious: suspicious.length,
};
const fail = evaluate(m);

console.log(`
results
  boot (crash shape)     first join ${Math.round(bootReplayMs)}ms — lazy replay ${SEED_LINES.toLocaleString()} entries + tail send
  A1 tail joins          ${tailJoins.length} p95 ${Math.round(m.tailP95)}ms — entities exact ${tailEntityFail === 0 ? "YES" : `NO (${tailEntityFail} bad)`}, tail ${SEED_LINES} exact ${tailLenFail === 0 ? "YES" : `NO (${tailLenFail} bad)`}, fold-equiv ${tailSampleExact}/${A1_TAIL_SAMPLES}
  shutdown snapshot      seq ${snapSeqExact === 1 ? "exact" : "DRIFT"} / bytes ${snapBytesExact === 1 ? "exact" : "DRIFT"}
  boot (snapshot shape)  first join ${Math.round(bootSnapshotMs)}ms — state-only load
  anchors                ${anchors.length}/${all.length} joined p95 ${Math.round(m.anchorJoinP95)}ms (${perfs.length} embodied)
  join storm             ${stormJoins.length} joins (fail ${stormJoinFail}) p95 ${Math.round(m.stormP95)}ms — entities exact ${stormEntityFail === 0 ? "YES" : `NO (${stormEntityFail} bad)`}
  fold-equivalence       ${stateExact}/${stateSamples} sampled snapshots == fold(log through covered)
  trickle joins (B)      ${trickleJoins.length} p95 ${Math.round(m.trickleP95)}ms — tail lens ${trickleJoins.map((j) => j.tailLen).join(",")}
  place-storm            accepted ${placeAccepted} refused ${placeRefused} — author p95 ${Math.round(m.placeP95)}ms — folds during B ${foldsDuringB}
  says                   author p95 ${Math.round(m.sayP95)}ms (n=${sayLat.length})
  spectator frames       p50 ${m.fpsP50.toFixed(1)} fps — lat p95 ${Math.round(m.latP95)}ms — gaps ${gapsTotal}
  http probe ms          storm p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length}) MAX ${Math.round(probeMax)} — settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})
  server rss             postAnchor ${MB(rssSamples.postAnchor)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  final quiet snapshot   ${finalStateExact === 1 ? "EXACT (== fold(full log))" : "MISMATCH"} — covered ${finalCovered} == log maxSeq ${logMaxSeq}
  afterwave join         ${Math.round(afterwaveJoinMs)}ms (post-drain)
  arrive/leave           server-log: ${arrivesLogged}/${N_PERF} joined, ${leavesLogged}/${N_PERF} left (drift ${arriveLeaveDrift})
  log arithmetic         lines ${logLines.toLocaleString()} == maxSeq+1 ${logMaxSeq + 1} == expected ${expectedMaxSeq.toLocaleString()} (drift ${m.logLineDrift}/${m.verbArithDrift})
  server logs            ${suspicious.length} suspicious lines across both boots
`);
if (fail.length) console.log(`first failing sample details:\n  storm stateOk=false: ${stormJoins.filter((j) => j.stateOk === false).length}, trickle stateOk=false: ${trickleJoins.filter((j) => !j.stateOk).length}`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

server2.kill("SIGTERM");
await server2.exited;
console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — 10k-entity world joins without OOM or unbounded latency on all three boot/fold paths`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
