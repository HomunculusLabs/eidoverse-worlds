// Pressure scenario 8: SNAPSHOT JOIN DURING CONCURRENT AUTHORED MUTATIONS IS
// SEQUENCE-CONSISTENT. Design target: 24 embodied performers + spectators.
//
// A joiner's snapshot is (state, tail, throughSeq). The client contract
// (client/lib/state.js hydrate + net.js:700) sets lastSeq =
// max(throughSeq, top tail seq), folds NOTHING from the tail, then folds
// live broadcasts from lastSeq+1. That is only correct if the snapshot is
// ATOMIC: state covers EXACTLY max(throughSeq, top tail seq) — never more
// (double-apply of non-idempotent folds like chat appends), never less
// (missed entries) — and the tail is contiguous from throughSeq+1.
//
// The server's join path is synchronous today (joinPayload -> send, no
// await), so no verb can land between state-capture and send. But the fold
// boundary (FOLD_EVERY appends empties the tail and advances throughSeq)
// and the planned §4 cutover (snapshot-at-boundary + catch-up tail) both
// live exactly here. This harness PINS the invariant: a sustained join
// storm DURING a heavy authored-mutation stream that crosses >=2 fold
// boundaries mid-storm, with every snapshot verified against the world log
// FILE as ground truth (the log is append-only, so fold(log through S) is
// a pure function — any tear is a real defect, not checker timing).
//
// Population (pinned before measuring — 192 peak concurrent sockets):
//   24 performers embodied @15Hz — 16 pure + 8 mutators (mute-0..7,
//   WORLD_ADMIN owners) authoring a rotating say/place/comp stream at
//   2.5 verbs/s each (20 appends/s total, inside the 12/4s budget);
//   150 spectator anchors; 18 storm slots cycling fresh spectator joins
//   for 14s (~170 joins): connect -> join -> VERIFY SNAPSHOT vs log file
//   -> linger 600ms folding live log broadcasts -> close -> 250ms rest.
//
// Phases:
//   t=1.5s   8 mutators spawn mp-0..7 (deco/bench.glb)
//   t=2-22s  mutation stream (k-th verb per mutator rotates
//            say{m{i}-s{k}} / place{mp-i} / comp{mp-i, pressure-mark n:k})
//            -> ~400 appends; folds at ~150 (~t+8s) and ~300 (~t+15.5s)
//            land MID-STORM
//   t=3-17s  JOIN STORM (18 slots, fresh spectator each cycle)
//   t=5/8/11/14s  fairness say probes (perf-3 + spec-7)
//   t=22s    stream stops
//   t=24s    FINAL QUIET JOIN: snapshot must equal fold(full log); its
//            state is the convergence reference for every storm joiner's
//            client-contract shadow replay (seer-recorded broadcasts =
//            exactly what a staying client would have folded)
//   t=25.5s  teardown; world-log ground truth: line count == maxSeq ==
//            genesis+grant+spawns+accepted stream verbs (drift 0)
//
// Acceptance gates (pinned before measuring — see TH):
//   SERVER_DIR=/tmp/pressure8-wt PORT=8996 bun tools/pressure-snapjoin.ts
//   SELFTEST=1 bun tools/pressure-snapjoin.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only
// if every pinned gate holds. Exit 1 = failed gate(s), with the numbers
// printed. shared/fold.js is imported from the harness tree (clean at the
// pinned commit); the server runs from SERVER_DIR (the pinned worktree).

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { emptyState, foldEntry } from "../shared/fold.js";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure8-wt";
const PORT = Number(process.env.PORT ?? 8996);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure8-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "alpha";
const N_PERF = 24, N_MUTE = 8, N_SPEC = 150, N_SLOTS = 18;   // 174 + 18 = 192 peak
const POSE_HZ = 15;
const MUTE_HZ_MS = 400;         // 2.5 verbs/s per mutator (10/4s < 12 budget)
const SPAWN_AT = 1_500;
const STREAM_START = 2_000, STREAM_END = 22_000;
const STORM_START = 3_000, STORM_END = 17_000;
// deterministic empty-tail window (observation-driven, not arithmetic-guessed):
// the sequencer runs with FOLD_EVERY=25 (scratch knob — folds 6x more often;
// the sequence-consistency invariant is per-snapshot and frequency-invariant,
// so higher boundary frequency stresses the SAME contract harder). Tier-1
// (8 mutators) pauses the moment the seer observes covered >= 155 (just past
// the fold at seq 149), a paced closing batch lands EXACTLY on the next fold
// boundary (174) computed from live covered, and the following >=4s quiet
// window serves every joiner throughSeq=173 with an EMPTY tail — the post-
// fold contract path, deterministically. Tier-2 (all 24 performers) then
// resumes and crosses further boundaries mid-storm.
const TIER1_PAUSE_COVERED = 155;
const FOLD_BOUNDARY_SEQ = 174;   // next fold boundary after the tier-1 pause
const QUIET_MS = 4_000;          // guaranteed empty-tail window
const FINAL_AT = 24_000, TEARDOWN_AT = 25_500;
const DURATION = 28_500;
const LINGER_MS = 600;
const MSG_RATE = "600";         // same scratch envelope as pressure-1..7
const SELFTEST = process.env.SELFTEST === "1";
const LOG_JSONL = `${WORLDS}/${WORLD}/log.jsonl`;
const MUTES = Array.from({ length: N_MUTE }, (_, i) => `mute-${i}`);

const TH = {
  anchorFailed: 0, anchorJoinP95Ms: 3_000,
  stormJoinFail: 0, stormJoinP95Ms: 2_000, stormJoinsMin: 120,
  snapExactEqualsJoins: true,   // every storm snapshot state == fold(log through covered)
  tailContigFail: 0,
  emptyTailMin: 10,             // post-fold contract path sampled
  nonEmptyTailMin: 10,          // pre-fold contract path sampled
  foldsSeenMin: 2,              // fold boundary provably crossed mid-storm
  seerGaps: 0, seerMissing: 0,  // broadcast stream contiguous + complete
  shadowExactEqualsJoins: true, // every joiner's client-contract replay converges
  liveContigFail: 0, joinersWithLivePct: 50,  // (a 4.4s quiet fold-pause window is part of the design; the load-bearing live gates are continuation exactness + snapshot exactness)
  finalStateExact: 1,           // quiet snapshot == fold(full log)
  logLineDrift: 0, verbArithDrift: 0,
  spectatorRefusalExact: 1,     // spectator author refused with the exact error
  sayP95Ms: 500,
  fpsP50: 12, latP95Ms: 250, seqGaps: 0,
  probeStormP95Ms: 500, probeSettledP95Ms: 100,
  rssPeakGrowthMB: 60,
  logSuspicious: 0,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  stormJoinFail: number; stormJoinP95: number; stormJoins: number;
  snapExact: number; tailContigFail: number;
  emptyTail: number; nonEmptyTail: number; foldsSeen: number;
  seerGaps: number; seerMissing: number;
  shadowExact: number; liveContigFail: number; joinersWithLivePct: number;
  finalStateExact: number;
  logLineDrift: number; verbArithDrift: number;
  spectatorRefusalExact: number;
  sayP95: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeSettledP95: number;
  rssPeakGrowth: number; logSuspicious: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.stormJoinFail > TH.stormJoinFail) fail.push(`${m.stormJoinFail} storm joins failed/timed out`);
  if (m.stormJoinP95 > TH.stormJoinP95Ms) fail.push(`storm join p95 ${Math.round(m.stormJoinP95)}ms > ${TH.stormJoinP95Ms}ms`);
  if (m.stormJoins < TH.stormJoinsMin) fail.push(`storm joins ${m.stormJoins} < ${TH.stormJoinsMin} — storm not sustained`);
  if (TH.snapExactEqualsJoins && m.snapExact !== m.stormJoins)
    fail.push(`snapshot-state exact ${m.snapExact}/${m.stormJoins} — a snapshot disagreed with fold(log through covered): TORN SEQUENCE`);
  if (m.tailContigFail > TH.tailContigFail) fail.push(`${m.tailContigFail} snapshots with non-contiguous tail`);
  if (m.emptyTail < TH.emptyTailMin) fail.push(`post-fold (empty-tail) snapshots ${m.emptyTail} < ${TH.emptyTailMin} — contract path not exercised`);
  if (m.nonEmptyTail < TH.nonEmptyTailMin) fail.push(`pre-fold (non-empty-tail) snapshots ${m.nonEmptyTail} < ${TH.nonEmptyTailMin} — contract path not exercised`);
  if (m.foldsSeen < TH.foldsSeenMin) fail.push(`fold boundaries crossed ${m.foldsSeen} < ${TH.foldsSeenMin} — storm did not bracket a fold`);
  if (m.seerGaps > TH.seerGaps) fail.push(`seer observed ${m.seerGaps} seq gaps in log broadcasts — lost broadcasts`);
  if (m.seerMissing > TH.seerMissing) fail.push(`seer missing ${m.seerMissing} log entries present in file — broadcast stream incomplete`);
  if (TH.shadowExactEqualsJoins && m.shadowExact !== m.stormJoins)
    fail.push(`client-contract shadow convergence ${m.shadowExact}/${m.stormJoins} — a joiner would have diverged (missed or double-folded entries)`);
  if (m.liveContigFail > TH.liveContigFail) fail.push(`${m.liveContigFail} joiners saw live log entries not continuing at covered+1`);
  if (m.joinersWithLivePct < TH.joinersWithLivePct) fail.push(`${m.joinersWithLivePct}% of joiners saw live entries < ${TH.joinersWithLivePct}%`);
  if (m.finalStateExact !== TH.finalStateExact) fail.push(`final quiet snapshot != fold(full log)`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`log line drift ${m.logLineDrift} (want lines == maxSeq+1)`);
  if (m.verbArithDrift > TH.verbArithDrift) fail.push(`verb arithmetic drift ${m.verbArithDrift} (want genesis+grant+spawns+stream == maxSeq+1)`);
  if (m.spectatorRefusalExact !== TH.spectatorRefusalExact) fail.push(`spectator author refusal exact-error ${m.spectatorRefusalExact} != 1 — authoring gate not firing explicitly`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`spectator fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps`);
  if (m.probeStormP95 > TH.probeStormP95Ms) fail.push(`storm-window HTTP probe p95 ${Math.round(m.probeStormP95)}ms > ${TH.probeStormP95Ms}ms`);
  if (m.probeSettledP95 > TH.probeSettledP95Ms) fail.push(`post-settle HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > ${TH.probeSettledP95Ms}ms`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 45,
    stormJoinFail: 0, stormJoinP95: 120, stormJoins: 171,
    snapExact: 171, tailContigFail: 0,
    emptyTail: 40, nonEmptyTail: 131, foldsSeen: 2,
    seerGaps: 0, seerMissing: 0,
    shadowExact: 171, liveContigFail: 0, joinersWithLivePct: 100,
    finalStateExact: 1,
    logLineDrift: 0, verbArithDrift: 0,
    spectatorRefusalExact: 1,
    sayP95: 12,
    fpsP50: 14.6, latP95: 11, gaps: 0,
    probeStormP95: 14, probeSettledP95: 3,
    rssPeakGrowth: 12, logSuspicious: 0,
  };
  const breached: Measurements = {
    ...healthy,
    anchorFailed: 1, anchorJoinP95: 3_100,
    stormJoinFail: 1, stormJoinP95: 2_100, stormJoins: 100,
    snapExact: 170, tailContigFail: 1,
    emptyTail: 5, nonEmptyTail: 5, foldsSeen: 1,
    seerGaps: 1, seerMissing: 1,
    shadowExact: 170, liveContigFail: 1, joinersWithLivePct: 40,
    finalStateExact: 0,
    logLineDrift: 1, verbArithDrift: 1,
    spectatorRefusalExact: 0,
    sayP95: 600,
    fpsP50: 9, latP95: 300, gaps: 1,
    probeStormP95: 600, probeSettledP95: 150,
    rssPeakGrowth: 70, logSuspicious: 1,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["anchor connections failed", "anchor join p95", "storm joins failed", "storm join p95", "storm not sustained",
    "TORN SEQUENCE", "non-contiguous tail", "empty-tail) snapshots", "non-empty-tail) snapshots", "did not bracket a fold",
    "seq gaps in log broadcasts", "broadcast stream incomplete", "shadow convergence", "not continuing at covered+1",
    "saw live entries", "final quiet snapshot", "log line drift", "verb arithmetic drift", "authoring gate not firing", "say author p95",
    "fps p50", "frame latency p95", "frame seq gaps", "storm-window HTTP", "post-settle HTTP", "RSS peak growth", "suspicious server log lines"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} performers embodied @${POSE_HZ}Hz (16 pure + ${N_MUTE} mutators, then ALL 24 after resume) + ${N_SPEC} spectators + ${N_SLOTS} storm slots cycling fresh spectator joins t+${STORM_START / 1000}-${STORM_END / 1000}s; mutation stream t+${STREAM_START / 1000}-${STREAM_END / 1000}s with an OBSERVATION-DRIVEN fold-pause (tier-1 stops at covered>=${TIER1_PAUSE_COVERED}, paced closing says land exactly on fold boundary ${FOLD_BOUNDARY_SEQ}, then ${QUIET_MS / 1000}s QUIET window serving EMPTY tails; scratch FOLD_EVERY=25 so boundaries cross mid-storm); every snapshot verified vs log FILE (fold(log through covered) deep-equal, tail contiguous, live continuation at covered+1); client-contract shadow replay converges to the final quiet snapshot. ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=174@p95<${TH.anchorJoinP95Ms}ms storm>=${TH.stormJoinsMin} joins@p95<${TH.stormJoinP95Ms}ms fail0 snapExact==joins tailContig0 emptyTail>=${TH.emptyTailMin} nonEmptyTail>=${TH.nonEmptyTailMin} folds>=${TH.foldsSeenMin} seer gaps/missing 0 shadow==joins liveContig0 withLive>=${TH.joinersWithLivePct}% finalExact sayP95<${TH.sayP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps0 probes<${TH.probeStormP95Ms}/${TH.probeSettledP95Ms}ms logDrift0 verbDrift0 rss<+${TH.rssPeakGrowthMB}MB suspicious0`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-snapjoin.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure8-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
const server = Bun.spawn({
  cmd: ["bun", "run", "server/server.ts"],
  cwd: SERVER_DIR,
  env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR, WORLD_ADMIN: MUTES.join(","), FOLD_EVERY: "25" },
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
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
let ready = false;
for (let i = 0; i < 60 && !ready; i++) {
  await sleep(250);
  try { const res = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); ready = res.status > 0; } catch { /* booting */ }
}
if (!ready) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }
const rssReady = rss();
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (log: ${logPath})`);

// ---- canonical deep compare (key order irrelevant, values exact) ---------------
function canon(v: any): string {
  if (v === undefined) return "undef";
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
}

/** Fold the log FILE through `covered`. The log is append-only, so this is a
 *  pure function of (file, covered) — any disagreement with a snapshot is a
 *  real tear, never checker timing. The only line allowed to fail parsing is
 *  the final still-growing one (its seq is by construction > any snapshot's
 *  covered). */
function foldPrefix(covered: number): { st: any; parseErr: number; maxSeq: number } {
  const raw = readFileSync(LOG_JSONL, "utf8");
  const lines = raw.split("\n");
  const st = emptyState();
  let parseErr = 0, maxSeq = 0;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (!line.trim()) continue;
    let e: any;
    try { e = JSON.parse(line); } catch {
      if (li === lines.length - 1) break;        // the growing last line — younger than any snapshot
      parseErr++; continue;
    }
    if (Number(e.seq) > maxSeq) maxSeq = Number(e.seq);
    if (Number(e.seq) <= covered) foldEntry(st, e);
  }
  return { st, parseErr, maxSeq };
}

type SnapCheck = { ok: boolean; errs: string[]; covered: number; tailLen: number; emptyTail: boolean; throughSeq: number };
function verifySnapshot(m: any): SnapCheck {
  const errs: string[] = [];
  const throughSeq = typeof m.throughSeq === "number" ? m.throughSeq : -1;
  const tail: any[] = Array.isArray(m.entries) ? m.entries : [];
  const tailTop = tail.length ? Number(tail[tail.length - 1].seq) : throughSeq;
  const covered = Math.max(throughSeq, tailTop);
  if (tail.length !== tailTop - throughSeq) errs.push(`tail len ${tail.length} != span ${tailTop - throughSeq}`);
  tail.forEach((e, i) => { if (Number(e.seq) !== throughSeq + 1 + i) errs.push(`tail gap at ${i}: seq ${e.seq} want ${throughSeq + 1 + i}`); });
  if (tailTop < throughSeq) errs.push(`tail top ${tailTop} < throughSeq ${throughSeq}`);
  const { st, parseErr } = foldPrefix(covered);
  if (parseErr) errs.push(`${parseErr} mid-log parse errors`);
  if (canon(st) !== canon(m.state)) errs.push(`snapshot state != fold(log through ${covered})`);
  return { ok: errs.length === 0, errs, covered, tailLen: tail.length, emptyTail: tail.length === 0, throughSeq };
}

// ---- anchor chassis -----------------------------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; snapAt: number; closed: boolean; id: string;
  sayEcho: Map<string, number>; errs: string[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], snapAt: 0, closed: false, sayEcho: new Map(), errs: [] };
    let openAt = 0;
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => { openAt = performance.now(); ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN })); };
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { s.snapAt = performance.now(); s.joinMs = s.snapAt - openAt; clearTimeout(to); resolve(s); }
      else if (m.type === "frame") {
        s.frames++; s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      }
      else if (m.type === "log" && m.entry?.verb === "say") { if (!s.sayEcho.has(m.entry.args?.text)) s.sayEcho.set(m.entry.args?.text, performance.now()); }
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
  ...Array.from({ length: N_PERF }, (_, i) => connect(i < N_MUTE ? MUTES[i] : `perf-${i}`, false, i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const anchorFailed = all.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-") || s.id.startsWith("mute-"));
const mutes = anchors.filter((s) => s.id.startsWith("mute-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const joinTimes = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${all.length} (${mutes.length} mutators) in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// SEER: the first spectator records EVERY log broadcast — ground truth for
// (a) broadcast completeness/contiguity, (b) the client-contract shadow
// replay (what a staying client would have folded).
const SEER = specs[0];
const seerEntries = new Map<number, any>();
const seerOrder: number[] = [];
let seerFirst = -1;
{
  const orig = SEER.ws.onmessage;
  SEER.ws.onmessage = (ev: any) => {
    (orig as any)?.call(SEER.ws, ev);
    const m = JSON.parse(String(ev.data));
    if (m.type === "log" && m.entry && typeof m.entry.seq === "number") {
      const seq = Number(m.entry.seq);
      if (!seerEntries.has(seq)) { seerEntries.set(seq, m.entry); seerOrder.push(seq); }
      if (seerFirst < 0) seerFirst = seq;
      if (seq > seerCovered) seerCovered = seq;
    }
  };
}

// embodied presence @15Hz for all 24 performers
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

// HTTP event-loop probes (storm = through stream end, settled = after)
const probeStorm: number[] = [], probeSettled: number[] = [];
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); } catch { /* counted by absence */ }
  (performance.now() - t0 < STREAM_END ? probeStorm : probeSettled).push(performance.now() - t);
}, 500);
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- mutation stream: 8 mutators x 2.5/s rotating say/place/comp ---------------
const saySendAt = new Map<string, number>();          // mutator say text -> send ts (author latency)
const mutStat = { say: 0, place: 0, comp: 0 };
let mutTick = 0;
let sentVerbs = 0;               // (diagnostics)
let closingState: "running" | "closing" | "paused" = "running";
let seerCovered = -1;            // highest seq the seer has observed live
// closing-loop feedback: the seer's covered converges on the live covered
// within one verb's echo (~10ms) — a bounded at-most-one-verb overrun past
// the fold boundary is the accepted tolerance
let nextClosingSend = 0, pauseStart = 0, scheduleResume = 0, tier2 = false, closingSay = false;
const sendLedger: { at: number; who: string; kind: number; k: number; mi: number }[] = [];
at(SPAWN_AT, () => {
  mutes.forEach((s, i) => {
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: `mp-${i}`, lib: "deco/bench.glb", pos: [i * 2 - 7, 0, 20], yaw: 0 } }));
  });
});
const streamTimer = setInterval(() => {
  const el = performance.now() - t0;
  if (el < STREAM_START || el >= STREAM_END) return;
  let senders: Spec[] = [];
  if (closingState === "running") {
    // tier-1 (8 mutators) until the seer observes covered >= TIER1_PAUSE_COVERED
    if (seerCovered >= TIER1_PAUSE_COVERED) { closingState = "closing"; nextClosingSend = 0; return; }
    mutTick++;
    senders = mutes;
  } else if (closingState === "closing") {
    // paced single verbs until the live covered lands exactly ON the next
    // fold boundary — that append folds the tail to empty
    if (el < nextClosingSend) return;
    if (seerCovered >= FOLD_BOUNDARY_SEQ) { closingState = "paused"; pauseStart = el; scheduleResume = el + QUIET_MS; return; }
    mutTick++;
    // three paced closing says per tick (rotating authors, ~1 verb/client/1.2s)
    // — closes the ~19-entry gap in ~3s so the quiet window starts mid-storm
    senders = [mutes[mutTick % mutes.length], mutes[(mutTick + 1) % mutes.length], mutes[(mutTick + 2) % mutes.length]];
    closingSay = true;           // closing verbs are says (no target validation)
    nextClosingSend = el + 450;
  } else if (closingState === "paused") {
    if (scheduleResume && el >= scheduleResume) { tier2 = true; closingState = "running"; closingSay = false; }
    else return;                                   // QUIET WINDOW — empty tails served
  }
  if (tier2) senders = perfs;
  senders.forEach((s, i) => {
    if (s.ws.readyState !== 1) return;
    const k = mutTick;
    const kind = closingSay ? 0 : k % 3;   // whole closing batch is says
    sendLedger.push({ at: Math.round(el), who: s.id, kind, k, mi: Number(s.id.split("-")[1]) });
    if (kind === 0) {
      const text = `m${i}-s${k}`;
      saySendAt.set(text, performance.now());
      s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
      mutStat.say++;
    } else if (kind === 1) {
      const a = k * 0.05 + i;
      s.ws.send(JSON.stringify({ type: "verb", verb: "place", args: { id: `mp-${i}`, pos: [Math.sin(a) * 3 + i * 2 - 7, 0, 20 + Math.cos(a) * 3], yaw: a % 6.28 } }));
      mutStat.place++;
    } else {
      s.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: `mp-${i}`, type: "pressure-mark", data: { n: k, by: i } } }));
      mutStat.comp++;
    }
  });
}, MUTE_HZ_MS);
// mutator say author latency: send ts -> seer receipt
const mutSayLat: number[] = [];
{
  const orig = SEER.ws.onmessage;
  SEER.ws.onmessage = (ev: any) => {
    (orig as any)?.call(SEER.ws, ev);
    const m = JSON.parse(String(ev.data));
    if (m.type === "log" && m.entry?.verb === "say") {
      const sent = saySendAt.get(String(m.entry.args?.text ?? ""));
      if (sent !== undefined) { mutSayLat.push(performance.now() - sent); saySendAt.delete(String(m.entry.args?.text)); }
    }
  };
}

// ---- join storm ----------------------------------------------------------------
type JoinRec = {
  id: string; joinMs: number; check: SnapCheck; snapState: any; covered: number;
  live: number[]; ok: boolean;
};
const joins: JoinRec[] = [];
let stormJoinFail = 0;
function stormJoin(slot: number, cycle: number): Promise<JoinRec | null> {
  const id = `snap-${slot}-${cycle}`;
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const rec: JoinRec = { id, joinMs: -1, check: { ok: false, errs: ["no snapshot"], covered: -1, tailLen: -1, emptyTail: false, throughSeq: -1 }, snapState: null, covered: -1, live: [], ok: false };
    let openAt = 0, done = false;
    const finish = (r: JoinRec | null) => { if (!done) { done = true; resolve(r); } };
    const to = setTimeout(() => { try { ws.close(); } catch {} finish(null); }, 15_000);
    ws.onopen = () => { openAt = performance.now(); ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: "x.vrm", spectate: true, token: TOKEN })); };
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        rec.joinMs = performance.now() - openAt;
        rec.check = verifySnapshot(m);
        rec.snapState = m.state;
        rec.covered = rec.check.covered;
        if (DEBUG) console.log(`DBG join ${id}: at=${(performance.now() - t0).toFixed(0)}ms covered=${rec.covered} throughSeq=${rec.check.throughSeq} tailLen=${rec.check.tailLen} emptyTail=${rec.check.emptyTail}`);
        setTimeout(() => { try { ws.close(); } catch {} }, LINGER_MS);   // linger: fold live broadcasts
      } else if (m.type === "log" && m.entry && typeof m.entry.seq === "number") {
        rec.live.push(Number(m.entry.seq));
      }
    };
    ws.onclose = () => { clearTimeout(to); finish(rec); };
    ws.onerror = () => { /* close follows */ };
    void 0;
  });
}
// debug: dump per-join facts for post-hoc analysis (PRESSURE_DEBUG=1)
const DEBUG = process.env.PRESSURE_DEBUG === "1";
let stormCycle = 0;
async function slotLoop(slot: number) {
  await sleep(Math.max(0, STORM_START - (performance.now() - t0)) + 200 * slot);
  while (running && performance.now() - t0 < STORM_END - 500) {
    stormCycle++;
    const rec = await stormJoin(slot, stormCycle);
    if (rec) joins.push(rec); else stormJoinFail++;
    await sleep(250);
  }
}
const slotPs = Array.from({ length: N_SLOTS }, (_, i) => slotLoop(i));

// fairness say probes: EMBODIED authors only (spectators can't author —
// verbs.ts gates them with "spectators can't author"); one deliberate
// spectator probe asserts the refusal fires with that exact error.
const probeSayLat: number[] = [];
const perf3 = perfs.find((s) => s.id === "perf-3"), perf9 = perfs.find((s) => s.id === "perf-9");
for (const [tms, who] of [[4_500, perf3], [6_500, perf9], [16_500, perf3], [18_500, perf9]] as [number, Spec | undefined][]) {
  at(tms, () => {
    if (!who || who.ws.readyState !== 1) return;
    const text = `probe-${tms}-${Math.floor(t0)}`;
    const sentAt = performance.now();
    who.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(tms + 1_500, () => { const hit = who.sayEcho.get(text); if (hit !== undefined) probeSayLat.push(hit - sentAt); });
  });
}
let spectatorRefusalExact = 0;
at(10_000, () => {
  const s = specs[7];
  if (!s || s.ws.readyState !== 1) return;
  s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: `spec-probe-${Math.floor(t0)}` } }));
  at(11_500, () => { if (s.errs.some((e) => e.includes("spectators can't author"))) spectatorRefusalExact = 1; });
});

// final quiet join: THE convergence reference
let finalSnap: any = null;
at(FINAL_AT, () => {
  return new Promise<void>((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(); }, 15_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `final-${Math.floor(t0)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { finalSnap = m; clearTimeout(to); try { ws.close(); } catch {} resolve(); }
    };
  });
});

await sleep(DURATION);
running = false;
tickers.forEach(clearInterval);
clearInterval(probeTimer); clearInterval(rssTimer); clearInterval(streamTimer);
await Promise.allSettled(slotPs);
await sleep(300);

// ---- world-log ground truth ---------------------------------------------------
const fullFold = foldPrefix(Infinity);
const logLines = readFileSync(LOG_JSONL, "utf8").split("\n").filter((l) => l.trim()).length;
const logMaxSeq = fullFold.maxSeq;
// verb arithmetic from the FILE (the seer is itself under measurement)
const fileVerbs = new Map<string, number>();
for (const line of readFileSync(LOG_JSONL, "utf8").split("\n")) {
  if (!line.trim()) continue;
  let e: any; try { e = JSON.parse(line); } catch { continue; }
  fileVerbs.set(e.verb, (fileVerbs.get(e.verb) ?? 0) + 1);
}
const expectedMaxSeq = 1 /* genesis */ + 1 /* grant */ + N_MUTE /* spawns */
  + (fileVerbs.get("say") ?? 0) + (fileVerbs.get("place") ?? 0) + (fileVerbs.get("comp") ?? 0);

// ---- derive measurements ------------------------------------------------------
const seerSorted = [...seerOrder];
let seerGaps = 0;
for (let i = 1; i < seerSorted.length; i++) if (seerSorted[i] !== seerSorted[i - 1] + 1) seerGaps += seerSorted[i] - seerSorted[i - 1] - 1;
const finalCovered = finalSnap ? Math.max(typeof finalSnap.throughSeq === "number" ? finalSnap.throughSeq : -1, ...(finalSnap.entries?.length ? finalSnap.entries.map((e: any) => Number(e.seq ?? -1)) : [-1])) : -1;
// seer completeness: every seq any joiner could need (min covered+1 .. finalCovered) is recorded
const minCovered = joins.length ? Math.min(...joins.map((j) => j.covered)) : 0;
let seerMissing = 0, seerStartLate = 0;
if (seerFirst >= 0 && finalCovered > 0) {
  for (let s = Math.max(minCovered + 1, seerFirst); s <= finalCovered; s++) if (!seerEntries.has(s)) seerMissing++;
  // entries the seer could never see (it joined after they landed): min covered+1 .. seerFirst-1
  if (seerFirst > minCovered + 1) seerStartLate = seerFirst - (minCovered + 1);
}

const snapExact = joins.filter((j) => j.check.ok).length;
const tailContigFail = joins.filter((j) => j.check.errs.some((e) => e.includes("tail"))).length;
const emptyTail = joins.filter((j) => j.check.emptyTail).length;
const nonEmptyTail = joins.filter((j) => !j.check.emptyTail).length;
const liveContigFail = joins.filter((j) => j.live.length > 0 && !j.live.every((s, i) => s === j.covered + 1 + i)).length;
const joinersWithLivePct = joins.length ? Math.round((joins.filter((j) => j.live.length > 0).length / joins.length) * 100) : 0;

// client-contract shadow replay: state as the client adopts it, then fold the
// seer-recorded broadcasts (== what a staying client received) to the end
let shadowExact = 0;
let finalStateExact = 0;
let finalStateCanon = "";
if (finalSnap && finalCovered === logMaxSeq) {
  finalStateCanon = canon(finalSnap.state);
  const finalCheck = verifySnapshot(finalSnap);
  finalStateExact = finalCheck.ok && canon(fullFold.st) === finalStateCanon ? 1 : 0;
  for (const j of joins) {
    if (!j.snapState) continue;
    const st = structuredClone(j.snapState);
    let okk = true;
    for (let s = j.covered + 1; s <= finalCovered; s++) {
      const e = seerEntries.get(s);
      if (!e) { okk = false; break; }
      foldEntry(st, e);
    }
    if (okk && canon(st) === finalStateCanon) shadowExact++;
  }
}

const logText = await logFile.text();
const foldsSeen = (logText.match(/folded through seq/g) ?? []).length;
const suspicious = logText.split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const endAt = performance.now();
const teardownAtTs = TEARDOWN_AT;
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, t0 + teardownAtTs) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const sayAll = [...mutSayLat, ...probeSayLat];
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

if (DEBUG) {
  // cross-check the send ledger against the FILE + author echoes + seer view
  const lf = readFileSync(LOG_JSONL, "utf8");
  const sayHit = (mi: number, k: number) => lf.includes(`"text":"m${mi}-s${k}"`);
  console.log(`DBG sendLedger: ${sendLedger.length} sends — kinds ${JSON.stringify(sendLedger.reduce((a, x) => (a[x.kind] = (a[x.kind] ?? 0) + 1, a), {} as Record<number, number>))}`);
  console.log(`DBG last tier-1 sends: ${JSON.stringify(sendLedger.filter((x) => x.at < 12_000).slice(-12))}`);
  const saySends = sendLedger.filter((x) => x.kind === 0 && x.at < 12_000);
  const sayMisses = saySends.filter((x) => !sayHit(x.mi, x.k));
  console.log(`DBG tier-1 says: ${saySends.length} sent, ${sayMisses.length} NOT IN FILE: ${JSON.stringify(sayMisses.slice(0, 6))}`);
  const pauseSayMisses = saySends.filter((x) => x.at >= 8_800).filter((x) => !sayHit(x.mi, x.k));
  console.log(`DBG final-batch says (>=8.8s): ${saySends.filter((x) => x.at >= 8_800).length} sent, NOT IN FILE: ${JSON.stringify(pauseSayMisses)}`);
  console.log(`DBG anchor errs: ${JSON.stringify(anchors.flatMap((s) => s.errs.map((e) => `${s.id}: ${e}`)).slice(0, 8))}`);
  const seerSayTexts = [...seerEntries.values()].filter((e: any) => e.verb === "say").map((e: any) => e.args?.text);
  console.log(`DBG seer says 148..152 window: ${JSON.stringify(seerSayTexts.filter((t: any) => String(t).startsWith("m0-")).slice(-8))}`);
  console.log(`DBG seer seqs 145..155: ${JSON.stringify([...seerEntries.keys()].filter((q) => q >= 145 && q <= 155).sort((a, b) => a - b))}`);
  const rawLines = lf.split("\n").filter(Boolean);
  for (const line of rawLines) {
    let e: any; try { e = JSON.parse(line); } catch { continue; }
    if (e.seq >= 146 && e.seq <= 152) console.log(`DBG file seq ${e.seq}: ${e.verb} by ${e.actor} ${JSON.stringify(e.args ?? {}).slice(0, 90)}`);
  }
}
const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  stormJoinFail, stormJoinP95: pct(joins.map((j) => j.joinMs), 95), stormJoins: joins.length,
  snapExact, tailContigFail,
  emptyTail, nonEmptyTail, foldsSeen,
  seerGaps, seerMissing: seerMissing + seerStartLate,
  shadowExact, liveContigFail, joinersWithLivePct,
  finalStateExact,
  logLineDrift: Math.abs(logLines - (logMaxSeq + 1)), verbArithDrift: Math.abs((logMaxSeq + 1) - expectedMaxSeq),
  spectatorRefusalExact,
  sayP95: sayAll.length ? pct(sayAll, 95) : Infinity,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  rssPeakGrowth, logSuspicious: suspicious.length,
};
const fail = evaluate(m);

console.log(`
results
  anchors               ${anchors.length}/${all.length} joined — p95 ${Math.round(m.anchorJoinP95)}ms (${mutes.length} mutators)
  join storm            ${joins.length} snapshots (fail ${stormJoinFail}) — join p95 ${Math.round(m.stormJoinP95)}ms
  snapshot exactness    ${snapExact}/${joins.length} == fold(log through covered) — tail contiguity fails ${tailContigFail}
  contract paths        empty-tail ${emptyTail} / non-empty-tail ${nonEmptyTail} — folds crossed ${foldsSeen}
  live continuation     ${liveContigFail} joiners not continuing at covered+1 — ${joinersWithLivePct}% saw live entries
  shadow convergence    ${shadowExact}/${joins.length} client-contract replays == final state
  final quiet snapshot  ${finalStateExact === 1 ? "EXACT (== fold(full log))" : "MISMATCH"} — covered ${finalCovered} == log maxSeq ${logMaxSeq}
  seer broadcast        ${seerEntries.size} entries — ${seerGaps} gaps, ${seerMissing} missing + ${seerStartLate} before-seer (first ${seerFirst})
  verb arithmetic       maxSeq ${logMaxSeq} == lines ${logLines} == expected ${expectedMaxSeq} (drift ${m.logLineDrift}/${m.verbArithDrift})
  spectator author      refusal exact-error ${spectatorRefusalExact === 1 ? "YES" : "NO"}
  says                  author p95 ${Math.round(m.sayP95)}ms (n=${sayAll.length}: ${mutSayLat.length} stream + ${probeSayLat.length} probes)
  spectator frames      p50 ${m.fpsP50.toFixed(1)} fps — lat p95 ${Math.round(m.latP95)}ms — gaps ${gapsTotal}
  http probe ms         storm p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length})  settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})
  server rss            ready ${MB(rssReady)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${suspicious.length} suspicious lines — ${foldsSeen} folds
`);
const firstErrs = joins.filter((j) => !j.check.ok).slice(0, 5);
if (firstErrs.length) console.log(`snapshot check failures:\n  ${firstErrs.map((j) => `${j.id}: ${j.check.errs.join("; ")}`).join("\n  ")}`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — snapshot join during concurrent authored mutations is sequence-consistent`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
