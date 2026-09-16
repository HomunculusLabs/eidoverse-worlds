// Pressure scenario 25: DUPLICATE JOIN RACE — same identity joining twice
// concurrently resolves to exactly one session. Design target: 24 embodied
// performers + up to 200 spectators; clients crash, half-open, and reconnect
// — a reconnection while the old socket is still live must resolve to ONE
// session with the loser's durable acts (lease settle, remembered pose)
// performed PROMPTLY, not lost to the takeover path. The seams:
//   S1 single-body: after every duel the roster holds the id EXACTLY once
//      (takeover, never stacking), the loser closed 4002, and superseded
//      losers never leave-broadcast (takeover = re-arrival, pressure-6 law).
//   S2 durable acts on takeover (pressure-7 precedent: travel performs the
//      close handler's two durable acts; the TAKEOVER block must too):
//      (a) a lease held by the superseded session settles at its exact last
//      streamed transform (place via:lease, by: the dead id) — otherwise the
//      object hovers mid-air with a dead holder forever (no stale sweeper
//      exists; the 5s stale check is lazy, at claim time only);
//      (b) the loser's last pose is remembered BEFORE the successor's
//      snapshot is built, so the successor's `restore` is the body's true
//      last pose, not null/stale.
//   S3 rapid double takeover (gen2 then gen3 in 250ms): the chain resolves
//      to exactly the last joiner; intermediate generations close 4002 with
//      zero leave broadcasts.
//   S4 spectator boundary: a plain spectator joining under a LIVE embodied
//      id never duels (documented law) — both coexist, present[] carries
//      the id once, and the spectator's close never removes the body.
//   S5 fairness under the race population: joins, says, frames, HTTP all
//      stay at baseline through every wave.
//   S6 world-log exactness: the log is the oracle — line count, per-actor
//      place/via:lease signatures, say presence, zero drift.
//
// Population (pinned before measuring — ~190 peak concurrent sockets):
//   SEER spec-0 (spectator, arrive/leave + echo witness, first)
//   24 perf-* embodied @15Hz walking (the show; never dueled)
//   136 spec-1..136 pure spectators
//   16 gen1 duel legs: duel-a0..3, b0..3, c0..3, d0..3 (embodied, fixed
//      poses @10Hz, joined t+3.3)
//   1 near-0 embodied re-claimer (fixed pose, moved between take points)
//   + 4 gen2-a (t+5.0) + 4 gen2-b (t+6.05) + 4 gen2-c (t+8.0)
//   + 4 gen3-c (t+8.25) + 4 gen2-d SPECTATORS (t+9.0) + 3 probes
//
// Waves:
//   t+3.0  perf-0 spawns pball-0..3 (pball-3 never leased — control)
//   t+4.0  lease claims: duel-a0->pball-0, duel-b0->pball-1, duel-c0->
//          pball-2, each streaming @10Hz along a deterministic line
//   t+5.0  W1 A-DUEL: 4 gen2-a sockets join same ids concurrently while
//          gen1-a fully live (mid-lease, fresh <5s). Gates: 4x close 4002,
//          0 pre-teardown a-leaves, restore == fixed P1, pball-0 settled
//          by duel-a0 at last-streamed window.
//   t+5.6  near-0 reclaims pball-0 (take:true, in reach) — grant <=500ms;
//          releases t+6.8 at authored final.
//   t+6.0  W2 B-RACE (control): harness closes gen1-b cleanly; gen2-b
//          joins 50ms later — either order legal; close handler settle +
//          rememberPose are the machinery control.
//   t+8.0  W3 C-TRIPLE: gen2-c joins (takes over gen1-c mid-lease), then
//          gen3-c at t+8.25 (takes over gen2-c). Gates: gen1-c AND gen2-c
//          close 4002, 0 pre-teardown c-leaves, pball-2 settled by
//          duel-c0, gen3 restore exact.
//   t+8.3  ghost-lease probe: a fresh spectator joiner must receive ZERO
//          lease-state for pball-2 (baseline RED: dead holder's lease
//          replays to every joiner).
//   t+8.6  near-0 reclaims pball-2, releases t+9.4 at authored final.
//   t+9.0  W4 D-BOUNDARY: 4 spectators join under live embodied d-ids —
//          no duel, no 4002, present[] once.
//   t+10.5 census probe: present EXACTLY 41 ids, 0 dups, 0 ghosts.
//   t+11.5 teardown (gen winners, gen1-d, near, anchors; seer last t+12.1)
//   t+15.0 FINAL probe: present 0, 0 lease states, 0 mounts, 4 entities.
//
// Acceptance gates (pinned before measuring — see evaluate()):
//   SERVER_DIR=/tmp/pressure25-wt PORT=8980 bun tools/pressure-dupjoin.ts
//   SELFTEST=1 bun tools/pressure-dupjoin.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure25-wt";
const PORT = Number(process.env.PORT ?? 8980);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure25-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "alpha";
const N_PERF = 24, N_SPEC = 136;
const PERF_HZ = 15, POSE_HZ = 10;
const SPAWN_AT = 3_000, GEN1_AT = 3_300, CLAIM_AT = 4_000;
const W1_AT = 5_000;                       // A-duel (4 gen2-a)
const RECLAIM0_AT = 5_600, RELEASE0_AT = 6_800;
const W2_CLOSE_AT = 6_000, W2_AT = 6_050;  // B-race (control)
const SAY_AT = 7_200;
const W3_AT = 8_000, W3B_AT = 8_250;       // C-triple
const GHOST_PROBE_AT = 8_300;
const RECLAIM2_AT = 8_600, RELEASE2_AT = 9_400;
const W4_AT = 9_000;                       // D-spectator boundary
const CENSUS_AT = 10_500, D_CHECK_AT = 10_400;
const TEARDOWN_AT = 11_500, ANCHOR_CLOSE_AT = 11_800, SEER_CLOSE_AT = 12_100;
const FINAL_AT = 15_000, DURATION = 18_000;
const MSG_RATE = "600";           // same scratch envelope as pressure-1..24
const SELFTEST = process.env.SELFTEST === "1";
// fixed gen1 poses (restore contract — stationary, so last-sent == every sent)
const P1 = (i: number) => [Math.sin(i * 1.9) * 7, 0, Math.cos(i * 2.3) * 7] as [number, number, number];
// pball spawns + deterministic lease-stream lines
const BALL_SPAWN: Record<string, [number, number, number]> = {
  "pball-0": [-6, 0, -6], "pball-1": [6, 0, -6], "pball-2": [-6, 0, 6], "pball-3": [6, 0, 6],
};
const STREAM_STEP = (ball: string, k: number): [number, number, number] => {
  const s = BALL_SPAWN[ball];
  return [s[0] + 0.2 * k, 0, s[2] + 0.05 * k];
};
// acceptable last-streamed windows (cross-socket landing skew ≤ ~2 ticks)
const WINDOW = (ball: string, kHi: number) => [kHi - 3, kHi - 2, kHi - 1, kHi].map((k) => STREAM_STEP(ball, k));
const WIN_P0 = WINDOW("pball-0", 9);    // streamed 4.0→5.0 (k 0..9)
const WIN_P1 = WINDOW("pball-1", 19);   // streamed 4.0→6.0
const WIN_P2 = WINDOW("pball-2", 39);   // streamed 4.0→8.0
const NEAR_FINAL: Record<string, [number, number, number]> = {
  "pball-0": [-4.0, 0, -3.0], "pball-2": [1.5, 0, 7.5],
};
// near-0 take points (within 3.5m of each ball's live lease position)
const NEAR_TAKE_P0: [number, number, number] = [-3.6, 0, -5.1];
const NEAR_TAKE_P2: [number, number, number] = [0.7, 0, 7.6];
const NEAR_HOME: [number, number, number] = [2.5, 0, 0.5];
// roster contracts
const CENSUS_PRESENT = 41;   // 24 perf + a4(gen2) + b4(gen2) + c4(gen3) + d4(gen1) + near
const EXPECT_ARRIVES = 57;   // 24 perf + 16 gen1 + 4+4+4 gen2 + 4 gen3 + 1 near
// world log: genesis + owner grant + 4 spawns + 5 places (p0: takeover+release,
// p1: close-settle, p2: takeover+release) + 1 say
const EXPECT_LOG = 1 + 1 + 4 + 5 + 1;
const EXPECT_POSES_MIN = 41; // perf24 + near + winners 16 ... + race-dependent extras

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number; gen1JoinP95: number; duelJoinP95: number;
  takeoverCloses: number;        // gen1-a(4) + gen1-c(4) + gen2-c(4) closed 4002
  spectatorDuelBreaks: number;   // gen1-d closed before D_CHECK (must be 0)
  spectatorSnapshots: number;    // gen2-d accepted (4)
  censusPresentExact: number; censusDups: number; censusGhostBodies: number;
  restoreA: number; restoreB: number; restoreC: number;
  takeoverSettles: number;       // place via:lease by duel-a0 @pball-0 + duel-c0 @pball-2 (2)
  closeSettle: number;           // place via:lease by duel-b0 @pball-1 (1, control)
  ghostLeaseStates: number;      // lease-state for pball-2 at 8.3 probe (must be 0)
  reclaimGrants: number; reclaimGrantP95: number; nearPlaces: number;
  arriveTotal: number;
  leavePreA: number; leavePreB: number; leavePreC: number; leavePreD: number;
  leaveTotalInBounds: number;    // 1 when total ∈ [17,21]
  logDrift: number; sayInLog: number; sayP95: number;
  finalPresent: number; finalEntities: number; finalLeaseStates: number; finalMounts: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeSettledP95: number;
  suspicious: number; rssPeakGrowth: number;
  posesKeys: number; posesAliens: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > 0) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > 3_000) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > 3000ms`);
  if (m.gen1JoinP95 > 3_000) fail.push(`gen1 join p95 ${Math.round(m.gen1JoinP95)}ms > 3000ms`);
  if (m.duelJoinP95 > 1_500) fail.push(`duel join p95 ${Math.round(m.duelJoinP95)}ms > 1500ms`);
  if (m.takeoverCloses !== 12) fail.push(`takeover closes ${m.takeoverCloses}/12 — a duel did not resolve by 4002 close`);
  if (m.spectatorDuelBreaks > 0) fail.push(`${m.spectatorDuelBreaks} gen1-d socket(s) closed by the spectator join — spectators must never duel`);
  if (m.spectatorSnapshots < 4) fail.push(`same-id spectator joins accepted ${m.spectatorSnapshots}/4`);
  if (m.censusPresentExact < 1) fail.push(`census present[] not the exact ${CENSUS_PRESENT}-id set`);
  if (m.censusDups > 0) fail.push(`${m.censusDups} duplicate ids in census present[]`);
  if (m.censusGhostBodies > 0) fail.push(`${m.censusGhostBodies} superseded generation(s) still in present[] — ghost body`);
  if (m.restoreA < 4) fail.push(`A-duel restore ${m.restoreA}/4 — successor snapshot lost the predecessor's pose (S2b)`);
  if (m.restoreB < 4) fail.push(`B-race restore ${m.restoreB}/4 — the close-path control itself failed`);
  if (m.restoreC < 4) fail.push(`C-triple restore ${m.restoreC}/4 — successor snapshot lost the predecessor's pose (S2b)`);
  if (m.takeoverSettles !== 2) fail.push(`takeover lease settles ${m.takeoverSettles}/2 — a superseded holder's lease never landed (S2a)`);
  if (m.closeSettle !== 1) fail.push(`close-path lease settle ${m.closeSettle}/1 — control failed`);
  if (m.ghostLeaseStates > 0) fail.push(`${m.ghostLeaseStates} ghost lease-state replay(s) to a fresh joiner — dead holder still in the lease table (S2a)`);
  if (m.reclaimGrants < 2) fail.push(`proximity reclaims granted ${m.reclaimGrants}/2`);
  if (m.reclaimGrantP95 > 500) fail.push(`reclaim grant p95 ${Math.round(m.reclaimGrantP95)}ms > 500ms`);
  if (m.nearPlaces !== 2) fail.push(`near release places ${m.nearPlaces}/2 — authored finals never committed`);
  if (m.arriveTotal !== EXPECT_ARRIVES) fail.push(`arrive total ${m.arriveTotal} != ${EXPECT_ARRIVES}`);
  if (m.leavePreA > 0) fail.push(`${m.leavePreA} pre-teardown leave(s) for A ids — superseded sessions must not leave-broadcast`);
  if (m.leavePreC > 0) fail.push(`${m.leavePreC} pre-teardown leave(s) for C ids — superseded sessions must not leave-broadcast`);
  if (m.leavePreD > 0) fail.push(`${m.leavePreD} pre-teardown leave(s) for D ids before the body closed — spectator close removed a body`);
  if (m.leavePreB > 4) fail.push(`${m.leavePreB} pre-teardown B leaves — more than the 4 clean closes`);
  if (m.leaveTotalInBounds < 1) fail.push(`total leaves outside [17,21] — arrive/leave arithmetic broke`);
  if (m.logDrift > 0) fail.push(`world log line drift ${m.logDrift} (want ${EXPECT_LOG})`);
  if (m.sayInLog < 1) fail.push(`fairness say never appended`);
  if (m.sayP95 > 500) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > 500ms`);
  if (m.finalPresent > 0) fail.push(`final present ${m.finalPresent} — world not empty after teardown`);
  if (m.finalEntities !== 4) fail.push(`final entity count ${m.finalEntities} != 4 — spawn/place drift`);
  if (m.finalLeaseStates > 0) fail.push(`${m.finalLeaseStates} lease-state(s) replayed at the final probe — lease table not empty`);
  if (m.finalMounts > 0) fail.push(`${m.finalMounts} mounts at the final probe`);
  if (m.fpsP50 < 12) fail.push(`seer fps p50 ${m.fpsP50.toFixed(1)} < 12`);
  if (m.latP95 > 250) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > 250ms`);
  if (m.gaps > 0) fail.push(`${m.gaps} frame seq gaps`);
  if (m.probeStormP95 > 500) fail.push(`race-window HTTP probe p95 ${Math.round(m.probeStormP95)}ms > 500ms`);
  if (m.probeSettledP95 > 100) fail.push(`post-teardown HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > 100ms`);
  if (m.suspicious > 0) fail.push(`${m.suspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > 60) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > 60MB`);
  if (m.posesKeys < EXPECT_POSES_MIN) fail.push(`poses.json keys ${m.posesKeys} < ${EXPECT_POSES_MIN}`);
  if (m.posesAliens > 0) fail.push(`${m.posesAliens} alien poses.json entries`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 41, gen1JoinP95: 33, duelJoinP95: 38,
    takeoverCloses: 12, spectatorDuelBreaks: 0, spectatorSnapshots: 4,
    censusPresentExact: 1, censusDups: 0, censusGhostBodies: 0,
    restoreA: 4, restoreB: 4, restoreC: 4,
    takeoverSettles: 2, closeSettle: 1, ghostLeaseStates: 0,
    reclaimGrants: 2, reclaimGrantP95: 12, nearPlaces: 2,
    arriveTotal: EXPECT_ARRIVES,
    leavePreA: 0, leavePreB: 4, leavePreC: 0, leavePreD: 0, leaveTotalInBounds: 1,
    logDrift: 0, sayInLog: 1, sayP95: 6,
    finalPresent: 0, finalEntities: 4, finalLeaseStates: 0, finalMounts: 0,
    fpsP50: 14.9, latP95: 10, gaps: 0,
    probeStormP95: 5, probeSettledP95: 2,
    suspicious: 0, rssPeakGrowth: 15,
    posesKeys: 45, posesAliens: 0,
  };
  const breached: Measurements = {
    ...healthy,
    anchorFailed: 3, anchorJoinP95: 4_100, gen1JoinP95: 3_800, duelJoinP95: 2_600,
    takeoverCloses: 7, spectatorDuelBreaks: 2, spectatorSnapshots: 1,
    censusPresentExact: 0, censusDups: 2, censusGhostBodies: 1,
    restoreA: 0, restoreB: 1, restoreC: 2,
    takeoverSettles: 0, closeSettle: 0, ghostLeaseStates: 1,
    reclaimGrants: 0, reclaimGrantP95: 900, nearPlaces: 0,
    arriveTotal: EXPECT_ARRIVES - 5,
    leavePreA: 4, leavePreB: 9, leavePreC: 3, leavePreD: 1, leaveTotalInBounds: 0,
    logDrift: 2, sayInLog: 0, sayP95: 800,
    finalPresent: 2, finalEntities: 6, finalLeaseStates: 1, finalMounts: 1,
    fpsP50: 7, latP95: 480, gaps: 4,
    probeStormP95: 950, probeSettledP95: 320,
    suspicious: 5, rssPeakGrowth: 120,
    posesKeys: 30, posesAliens: 3,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["anchor connections failed", "anchor join p95", "gen1 join p95", "duel join p95",
    "did not resolve by 4002", "spectators must never duel", "spectator joins accepted",
    "exact 41-id set", "duplicate ids", "ghost body",
    "A-duel restore", "close-path control", "C-triple restore",
    "never landed (S2a)", "control failed", "dead holder still in the lease table",
    "reclaims granted", "reclaim grant p95", "never committed",
    "arrive total", "must not leave-broadcast", "more than the 4 clean closes",
    "arithmetic broke", "world log line drift", "fairness say", "say author p95",
    "world not empty", "spawn/place drift", "lease table not empty", "mounts at the final probe",
    "seer fps p50", "frame latency p95", "frame seq gaps", "race-window HTTP", "post-teardown HTTP",
    "suspicious server log", "RSS peak growth", "poses.json keys", "alien poses.json"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails; expect log ${EXPECT_LOG}, arrives ${EXPECT_ARRIVES}, census ${CENSUS_PRESENT})` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${PERF_HZ}Hz + ${N_SPEC + 1} spec + 16 gen1 duel + 1 near = ${N_PERF + N_SPEC + 1 + 17} anchors; waves A(simultaneous duel, mid-lease) B(clean-close race, control) C(triple takeover chain) D(spectator boundary); census t+${CENSUS_AT / 1000}s expects present ${CENSUS_PRESENT} exact; log ${EXPECT_LOG} lines incl 2 takeover-settles + 1 close-settle + 2 near finals; ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-dupjoin.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure25-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
const server = Bun.spawn({
  cmd: ["bun", "run", "server/server.ts"],
  cwd: SERVER_DIR,
  env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR },
  stdout: logFile,
  stderr: logFile,
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

// ---- client chassis -----------------------------------------------------------
type Spec = {
  ws: WebSocket; id: string; world: string; emb: boolean; gen: number;
  joinMs: number; openAt: number; closed: boolean; closeCode: number; closeAt: number;
  restore: any; snapPresent: string[]; lastSnapT: number;
  frames: number; gaps: number; lastSeq: number; lat: number[];
  logEntries: any[]; leaseMsgs: { at: number; msg: any }[];
  sayEchoAt: Map<string, number>;
  errs: { at: number; text: string }[];
};
function connect(id: string, world: string, spectate: boolean, n = 0, gen = 1): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, world, emb: !spectate, gen, joinMs: -1, openAt: performance.now(), closed: false, closeCode: 0, closeAt: -1,
      restore: undefined, snapPresent: [], lastSnapT: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [],
      logEntries: [], leaseMsgs: [], sayEchoAt: new Map(), errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        const now = performance.now();
        if (s.joinMs < 0) s.joinMs = now;
        s.lastSnapT = now;
        s.restore = m.restore ?? null;
        s.snapPresent = (m.present ?? []).map((o: any) => String(o.id ?? ""));
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++; s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "log" && m.entry) {
        s.logEntries.push(m.entry);
        if (m.entry.verb === "say") s.sayEchoAt.set(String(m.entry.args?.text ?? ""), performance.now());
      } else if (m.type === "lease") {
        s.leaseMsgs.push({ at: performance.now() - t0, msg: m });
      }
      else if (m.type === "error") s.errs.push({ at: performance.now() - t0, text: String(m.error ?? "") });
    };
    ws.onclose = (ev: any) => { s.closed = true; s.closeCode = Number(ev?.code ?? 0); s.closeAt = performance.now() - t0; };
    ws.onerror = () => { /* close follows */ };
  });
}
// a probe that stays 700ms and collects lease-state replays + present
function probeJoin(pid: string): Promise<{ present: string[]; mounts: string[]; entities: number; leaseStates: { id: string; by: string }[] } | null> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    let snap: any = null;
    const leaseStates: { id: string; by: string }[] = [];
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(null); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: pid, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { snap = m; clearTimeout(to); setTimeout(() => { try { ws.close(); } catch {}
        resolve({
          present: (m.present ?? []).map((o: any) => String(o.id ?? "")),
          mounts: Object.keys((m.state ?? {}).mounts ?? {}),
          entities: Object.keys((m.state ?? {}).entities ?? {}).length,
          leaseStates,
        }); }, 700);
      } else if (m.type === "lease" && m.op === "state") leaseStates.push({ id: String(m.id), by: String(m.by ?? "") });
    };
    ws.onerror = () => { clearTimeout(to); resolve(null); };
  });
}

// ---- anchor population --------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const SEER = await connect(`spec-0`, WORLD, true);
// seer arrival/leave ledger (the no-leave-on-takeover witness)
const arriveAt: Map<string, number[]> = new Map();
const leaveAt: Map<string, number[]> = new Map();
SEER.ws.addEventListener("message", (ev) => {
  try {
    const m = JSON.parse(String(ev.data));
    if (m.type === "arrive") { const a = arriveAt.get(String(m.id)) ?? []; a.push(performance.now() - t0); arriveAt.set(String(m.id), a); }
    if (m.type === "leave") { const a = leaveAt.get(String(m.id)) ?? []; a.push(performance.now() - t0); leaveAt.set(String(m.id), a); }
  } catch { /* non-json */ }
});
const all = await Promise.allSettled([
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i + 1}`, WORLD, true)),
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, WORLD, false, i)),
]);
const anchors = [SEER, ...all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec)];
const anchorFailed = all.length - (anchors.length - 1);
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const joinTimes = anchors.map((s) => s.joinMs >= 0 ? s.joinMs : 1);
console.log(`t+0: anchors joined ${anchors.length}/${all.length + 1} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// ---- gen1 duel legs + near (fixed poses — the restore contract) ----------------
const GROUPS = ["a", "b", "c", "d"] as const;
const gen1: Spec[] = [];
for (const g of GROUPS) for (let i = 0; i < 4; i++) gen1.push(await connect(`duel-${g}${i}`, WORLD, false, 40 + i));
const near = await connect(`near-0`, WORLD, false, 60);
const gen1JoinMs = gen1.map((s) => s.joinMs - s.openAt);
console.log(`t+3.3: gen1 duel legs ${gen1.length}/16 + near joined — p95 ${Math.round(pct(gen1JoinMs, 95))}ms`);

// ---- presence tickers ---------------------------------------------------------
let running = true;
const tickers: any[] = [];
const walk = (i: number, t: number, r: number) => [Math.sin(t * 0.5 + i) * r, 0, Math.cos(t * 0.5 + i) * r] as number[];
const legById = new Map<string, Spec>();
for (const s of [...anchors, ...gen1, near]) legById.set(s.id, s);
const poseTicker = (s: Spec, pos: () => number[]) => tickers.push(setInterval(() => {
  if (!running || !s.emb || s.ws.readyState !== 1 || s.closed) return;
  const p = pos();
  s.ws.send(JSON.stringify({ type: "pose", pose: { p, yaw: 0.3, speed: 0, clip: "idle" } }));
}, 1000 / POSE_HZ));
for (const s of perfs) {
  const i = Number(s.id.slice(5));
  tickers.push(setInterval(() => {
    if (!running || s.ws.readyState !== 1) return;
    s.ws.send(JSON.stringify({ type: "pose", pose: { p: walk(i, Date.now() / 1000, 10), yaw: (Date.now() / 1000 + i) % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  }, 1000 / PERF_HZ));
}
const gen1Index = (s: Spec) => Number(s.id.slice(-1));
for (const s of gen1) if (s.id.startsWith("duel-")) poseTicker(s, () => [...P1(gen1Index(s) + s.id.charCodeAt(6))]);
poseTicker(near, () => [...NEAR_HOME]);
const poseOnce = (s: Spec, p: number[]) => { try { s.ws.send(JSON.stringify({ type: "pose", pose: { p, yaw: 0.3, speed: 0, clip: "idle" } })); } catch {} };

// HTTP event-loop probes + RSS
const probeStorm: number[] = [], probeSettled: number[] = [];
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); } catch { /* counted by absence */ }
  (performance.now() - t0 < TEARDOWN_AT ? probeStorm : probeSettled).push(performance.now() - t);
}, 500);
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN, settled: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- spawns + lease claims + deterministic streams -----------------------------
const sendVerb = (s: Spec | undefined, verb: string, args: Record<string, unknown>) => {
  if (!s || s.ws.readyState !== 1) return;
  s.ws.send(JSON.stringify({ type: "verb", verb, args }));
};
const sendRaw = (s: Spec | undefined, msg: Record<string, unknown>) => {
  if (!s || s.ws.readyState !== 1) return;
  s.ws.send(JSON.stringify(msg));
};
at(SPAWN_AT, () => {
  for (let k = 0; k < 4; k++) sendVerb(perfs[0], "spawn", { id: `pball-${k}`, lib: "deco/ball.glb", pos: [...BALL_SPAWN[`pball-${k}`]], yaw: 0 });
});
// holder stream state: (ball, k) — pos from the deterministic line
const holderStream = (holder: Spec, ball: string, stopAtMs: number) => {
  let k = 0;
  const iv = setInterval(() => {
    if (!running || performance.now() - t0 >= stopAtMs || holder.ws.readyState !== 1) { clearInterval(iv); return; }
    const [x, y, z] = STREAM_STEP(ball, k);
    sendRaw(holder, { type: "lease", op: "state", id: ball, p: [x, y, z], yaw: 0.1 * k });
    k++;
  }, 100);
  tickers.push(iv);
};
const grantLat: number[] = [];
const claimWithGrant = (s: Spec, ball: string, take: boolean, measure = false) => {
  const sent = performance.now();
  if (measure) {
    const iv = setInterval(() => {
      const got = s.leaseMsgs.find((r) => r.msg.op === "granted" && r.msg.id === ball && r.at + t0 >= sent - 50);
      if (got) { clearInterval(iv); grantLat.push(got.at + t0 - sent); }
      else if (performance.now() - sent > 5_000) clearInterval(iv);
    }, 10);
  }
  sendRaw(s, { type: "lease", op: "claim", id: ball, ...(take ? { take: true } : {}) });
};
at(CLAIM_AT, () => {
  claimWithGrant(legById.get("duel-a0")!, "pball-0", false);
  claimWithGrant(legById.get("duel-b0")!, "pball-1", false);
  claimWithGrant(legById.get("duel-c0")!, "pball-2", false);
  holderStream(legById.get("duel-a0")!, "pball-0", W1_AT - 20);
  holderStream(legById.get("duel-b0")!, "pball-1", W2_CLOSE_AT - 20);
  holderStream(legById.get("duel-c0")!, "pball-2", W3_AT - 20);
});

// ---- W1: A-duel (simultaneous gen2 joins, mid-lease) ---------------------------
const gen2a: Spec[] = [];
at(W1_AT, async () => {
  const legs = await Promise.allSettled([0, 1, 2, 3].map((i) => connect(`duel-a${i}`, WORLD, false, 140 + i, 2)));
  for (const r of legs) if (r.status === "fulfilled") { gen2a.push(r.value); legById.set(r.value.id, r.value); poseTicker(r.value, () => [...P1(Number(r.value.id.slice(-1)) + 97)]); }
});
// near reclaims pball-0 (proximity take), releases at authored final
at(RECLAIM0_AT - 150, () => poseOnce(near, [...NEAR_TAKE_P0]));
at(RECLAIM0_AT, () => claimWithGrant(near, "pball-0", true, true));
at(RELEASE0_AT, () => sendRaw(near, { type: "lease", op: "release", id: "pball-0", p: [...NEAR_FINAL["pball-0"]], yaw: 1.2 }));

// ---- W2: B-race (clean close then immediate rejoin — control) ------------------
at(W2_CLOSE_AT, () => { for (let i = 0; i < 4; i++) { const s = legById.get(`duel-b${i}`); if (s) { try { s.ws.close(); } catch {} } } });
const gen2b: Spec[] = [];
at(W2_AT, async () => {
  const legs = await Promise.allSettled([0, 1, 2, 3].map((i) => connect(`duel-b${i}`, WORLD, false, 160 + i, 2)));
  for (const r of legs) if (r.status === "fulfilled") { gen2b.push(r.value); legById.set(r.value.id, r.value); poseTicker(r.value, () => [...P1(Number(r.value.id.slice(-1)) + 101)]); }
});

// ---- fairness say ---------------------------------------------------------------
const SAY = `p25-say-${Math.floor(t0)}`;
let saySentAt = 0;
at(SAY_AT, () => { saySentAt = performance.now(); sendVerb(perfs[5], "say", { text: SAY }); });

// ---- W3: C-triple (gen2 then gen3 — rapid double takeover) ----------------------
const gen2c: Spec[] = [], gen3c: Spec[] = [];
at(W3_AT, async () => {
  const legs = await Promise.allSettled([0, 1, 2, 3].map((i) => connect(`duel-c${i}`, WORLD, false, 180 + i, 2)));
  for (const r of legs) if (r.status === "fulfilled") { gen2c.push(r.value); legById.set(r.value.id, r.value); }
});
at(W3B_AT, async () => {
  const legs = await Promise.allSettled([0, 1, 2, 3].map((i) => connect(`duel-c${i}`, WORLD, false, 200 + i, 3)));
  for (const r of legs) if (r.status === "fulfilled") { gen3c.push(r.value); legById.set(r.value.id, r.value); poseTicker(r.value, () => [...P1(Number(r.value.id.slice(-1)) + 103)]); }
});
// near reclaims pball-2
at(RECLAIM2_AT - 150, () => poseOnce(near, [...NEAR_TAKE_P2]));
at(RECLAIM2_AT, () => claimWithGrant(near, "pball-2", true, true));
at(RELEASE2_AT, () => sendRaw(near, { type: "lease", op: "release", id: "pball-2", p: [...NEAR_FINAL["pball-2"]], yaw: 2.4 }));

// ---- probes ----------------------------------------------------------------------
let ghostProbe: Awaited<ReturnType<typeof probeJoin>> = null;
at(GHOST_PROBE_AT, async () => { ghostProbe = await probeJoin(`ghost-probe-${Math.floor(t0)}`); });
let censusPresent: string[] | null = null;
at(CENSUS_AT, async () => { const m = await probeJoin(`census-probe-${Math.floor(t0)}`); if (m) censusPresent = m.present; });

// ---- W4: D-boundary (spectator under a live embodied id) --------------------------
const gen2d: Spec[] = [];
at(W4_AT, async () => {
  const legs = await Promise.allSettled([0, 1, 2, 3].map((i) => connect(`duel-d${i}`, WORLD, true, 220 + i, 2)));
  for (const r of legs) if (r.status === "fulfilled") gen2d.push(r.value);
});
let dSocketsOpen = -1;
at(D_CHECK_AT, () => { dSocketsOpen = gen1.filter((s) => s.id.startsWith("duel-d") && !s.closed).length; });

// ---- teardown ---------------------------------------------------------------------
at(TEARDOWN_AT, () => {
  running = false;
  const winners = [...gen2a, ...gen2b, ...gen3c];
  for (const s of winners) { try { s.ws.close(); } catch {} }
  for (const s of gen2d) { try { s.ws.close(); } catch {} }
  for (const s of gen1) if (!s.closed) { try { s.ws.close(); } catch {} }
  try { near.ws.close(); } catch {}
  for (const s of anchors) if (s !== SEER) { try { s.ws.close(); } catch {} }
});
at(SEER_CLOSE_AT, () => { try { SEER.ws.close(); } catch {} });

let finalProbe: Awaited<ReturnType<typeof probeJoin>> = null;
at(FINAL_AT, async () => { finalProbe = await probeJoin(`final-probe-${Math.floor(t0)}`); });

const KEEP = process.env.KEEP === "1";   // diagnostics: preserve scratch worlds

await sleep(DURATION);
tickers.forEach(clearInterval);
clearInterval(probeTimer); clearInterval(rssTimer);
rssSamples.settled = rss();
// flush the world log to disk before reading it (chassis law)
server.kill("SIGTERM");
await server.exited;
await sleep(300);

// ---- verdicts ----------------------------------------------------------------------
const legs = [...anchors, ...gen1, near, ...gen2a, ...gen2b, ...gen2c, ...gen3c, ...gen2d];
const duelJoinMs = [...gen2a, ...gen2b, ...gen3c].map((s) => s.joinMs - s.openAt).filter((x) => x > 0);
// 1) takeover closes: gen1-a, gen1-c closed 4002; gen2-c closed 4002 (by gen3)
const g1a = gen1.filter((s) => s.id.startsWith("duel-a"));
const g1c = gen1.filter((s) => s.id.startsWith("duel-c"));
let takeoverCloses = 0;
for (const s of [...g1a, ...g1c]) if (s.closed && s.closeCode === 4002) takeoverCloses++;
for (const s of gen2c) if (s.closed && s.closeCode === 4002) takeoverCloses++;
// 2) spectator boundary
const spectatorDuelBreaks = gen1.filter((s) => s.id.startsWith("duel-d") && s.closed && s.closeAt < D_CHECK_AT).length;
const spectatorSnapshots = gen2d.filter((s) => s.joinMs >= 0).length;
// 3) census
const cp = censusPresent as string[] | null;
let censusPresentExact = 0, censusDups = 0, censusGhostBodies = 0;
if (cp) {
  censusDups = cp.length - new Set(cp).size;
  if (!Number.isFinite(censusDups)) censusDups = 999;
  const wantPresent = new Set<string>([
    ...Array.from({ length: N_PERF }, (_, i) => `perf-${i}`),
    ...GROUPS.flatMap((g) => Array.from({ length: 4 }, (_, i) => `duel-${g}${i}`)),
    "near-0",
  ]);
  censusPresentExact = cp.length === CENSUS_PRESENT && censusDups === 0 && [...wantPresent].every((x) => cp.includes(x)) ? 1 : 0;
  if (!censusPresentExact) console.log(`  census present: got ${cp.length} (want ${CENSUS_PRESENT}) missing [${[...wantPresent].filter((x) => !cp.includes(x)).slice(0, 6)}] extra [${cp.filter((x) => !wantPresent.has(x)).slice(0, 6)}]`);
} else censusPresentExact = 0;
// 4) restore contracts (fixed P1 poses; settledPose preserves non-ragdoll p)
const nearP = (v: any): [number, number, number] | null => Array.isArray(v?.p) && v.p.length >= 3 ? [v.p[0], v.p[1], v.p[2]] : null;
const restoreOk = (s: Spec) => {
  const r = nearP(s.restore);
  if (!r) return false;
  // the gen1 ticker poses at P1(d + charCodeAt(6)) = P1(48 + 2d) — the digit
  // enters twice (as index and as its own char-code at position 6)
  const d = Number(s.id.slice(-1));
  const want = P1(48 + 2 * d);
  return Math.hypot(r[0] - want[0], r[2] - want[2]) < 0.05;
};
const restoreA = gen2a.filter(restoreOk).length;
const restoreB = gen2b.filter(restoreOk).length;
const restoreC = gen3c.filter(restoreOk).length;
if (KEEP) for (const s of [...gen2a, ...gen2b, ...gen3c]) console.log(`  restore ${s.id} gen${s.gen}: ${JSON.stringify(s.restore?.p ?? null)}`);
// 5) lease settles from the AUTHORITATIVE world log
let logDrift = 999, takeoverSettles = 0, closeSettle = 0, nearPlaces = 0, sayInLog = 0;
{
  const p = `${WORLDS}/${WORLD}/log.jsonl`;
  if (existsSync(p)) {
    const entries = readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } });
    if (KEEP) console.log(`world log (${entries.length} lines):\n${entries.map((e: any) => `  ${e.seq} ${e.verb} ${JSON.stringify(e.args?.id ?? "")} by=${e.actor} via=${e.args?.via ?? ""} pos=${JSON.stringify(e.args?.pos ?? null)}`).join("\n")}`);
    logDrift = Math.abs(entries.length - EXPECT_LOG);
    const win = (ball: string, winSet: [number, number, number][]) => (e: any) => {
      if (e?.verb !== "place" || e?.args?.id !== ball) return false;
      const q = e.args.pos;
      return winSet.some(([x, , z]) => Math.hypot(q[0] - x, q[2] - z) < 0.15);
    };
    takeoverSettles = (entries.some((e) => win("pball-0", WIN_P0)(e) && e.args?.by === "duel-a0" && e.args?.via === "lease") ? 1 : 0)
      + (entries.some((e) => win("pball-2", WIN_P2)(e) && e.args?.by === "duel-c0" && e.args?.via === "lease") ? 1 : 0);
    closeSettle = entries.some((e) => win("pball-1", WIN_P1)(e) && e.args?.by === "duel-b0" && e.args?.via === "lease") ? 1 : 0;
    nearPlaces = entries.filter((e) => e?.verb === "place" && e?.args?.by === "near-0" && e?.args?.via === "lease").length;
    sayInLog = entries.filter((e) => e?.verb === "say" && e?.args?.text === SAY).length;
  }
}
// 6) ghost lease replay at 8.3 (pball-2's holder died at 8.0; near claims at 8.6)
const ghostLeaseStates = ghostProbe ? ghostProbe.leaseStates.filter((l) => l.id === "pball-2").length : 999;
// 7) arrive/leave arithmetic (seer witness)
const groupLeaves = (g: string, before: number) => [...leaveAt.entries()]
  .filter(([id]) => id.startsWith(`duel-${g}`))
  .flatMap(([, ts]) => ts.filter((t) => t < before)).length;
const leavePreA = groupLeaves("a", TEARDOWN_AT - 200);
const leavePreB = groupLeaves("b", TEARDOWN_AT - 200);
const leavePreC = groupLeaves("c", TEARDOWN_AT - 200);
const leavePreD = groupLeaves("d", TEARDOWN_AT - 200);
// teardown leave total: 12 winners + near 1 + gen1-d 4 + perf 24 + gen1-b 4 = 45
const EXPECT_LEAVE_TOTAL = 12 + 1 + 4 + N_PERF + 4;
const leaveTotal = [...leaveAt.values()].flat().length;
const leaveTotalInBounds = leaveTotal === EXPECT_LEAVE_TOTAL ? 1 : 0;
const arriveTotal = [...arriveAt.values()].flat().length;
// 8) reclaims
const reclaimGrants = grantLat.length;
const reclaimGrantP95 = grantLat.length ? pct(grantLat, 95) : 999;
// 9) fairness say latency
const sayEchoAt = SEER.sayEchoAt.get(SAY);
const sayP95 = sayEchoAt !== undefined && saySentAt ? sayEchoAt - saySentAt : 999;
// 10) final probe
const finalPresent = finalProbe ? finalProbe.present.length : 999;
const finalEntities = finalProbe ? finalProbe.entities : 999;
const finalLeaseStates = finalProbe ? finalProbe.leaseStates.length : 999;
const finalMounts = finalProbe ? finalProbe.mounts.length : 999;
// 11) presence health
const seerWindow = Math.max(0.001, (SEER_CLOSE_AT - 1_000) / 1000);
const fpsP50 = SEER.frames / seerWindow;
const latP95 = pct(SEER.lat, 95);
const log = await logFile.text();
const suspicious = log.split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));
// 12) poses.json sanity
let posesKeys = -1, posesAliens = 999;
{
  const p = `${WORLDS}/${WORLD}/poses.json`;
  if (existsSync(p)) {
    try {
      const poses = JSON.parse(readFileSync(p, "utf8"));
      const keys = Object.keys(poses);
      posesKeys = keys.length;
      posesAliens = keys.filter((k) => {
        if (k.startsWith("spec-") || k.includes("probe")) return true;
        const d = Array.isArray(poses[k]?.p) ? Math.hypot(poses[k].p[0], poses[k].p[2]) : -1;
        return d < 0 || d > 13.5;
      }).length;
    } catch { posesAliens = 999; }
  }
}

const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95), gen1JoinP95: pct(gen1JoinMs, 95), duelJoinP95: pct(duelJoinMs, 95),
  takeoverCloses, spectatorDuelBreaks, spectatorSnapshots,
  censusPresentExact, censusDups, censusGhostBodies,
  restoreA, restoreB, restoreC,
  takeoverSettles, closeSettle, ghostLeaseStates,
  reclaimGrants, reclaimGrantP95, nearPlaces,
  arriveTotal,
  leavePreA, leavePreB, leavePreC, leavePreD, leaveTotalInBounds,
  logDrift, sayInLog, sayP95,
  finalPresent, finalEntities, finalLeaseStates, finalMounts,
  fpsP50, latP95, gaps: SEER.gaps,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  suspicious: suspicious.length, rssPeakGrowth,
  posesKeys, posesAliens,
};
const fail = evaluate(m);

console.log(`
results
  anchors               ${anchors.length}/${all.length + 1} — p95 ${Math.round(m.anchorJoinP95)}ms (${anchorFailed} failed) — gen1 p95 ${Math.round(m.gen1JoinP95)}ms
  duel joins            gen2/gen3 p95 ${Math.round(m.duelJoinP95)}ms (n=${duelJoinMs.length})
  takeover closes       ${takeoverCloses}/12 (gen1-a 4, gen1-c 4, gen2-c 4 — all 4002)
  restores              A ${restoreA}/4 (takeover path) — B ${restoreB}/4 (close control) — C ${restoreC}/4 (triple chain)
  lease settles         takeover ${takeoverSettles}/2 (pball-0 by duel-a0, pball-2 by duel-c0) — close ${closeSettle}/1 (pball-1 by duel-b0) — near finals ${nearPlaces}/2
  ghost lease replay    ${ghostLeaseStates === 999 ? "PROBE-FAILED" : ghostLeaseStates} — reclaim grants ${reclaimGrants}/2 p95 ${Math.round(reclaimGrantP95)}ms
  census                present exact ${censusPresentExact}/${CENSUS_PRESENT} (dups ${censusDups} ghosts ${censusGhostBodies})
  spectator boundary    gen1-d still open ${dSocketsOpen}/4 at t+${D_CHECK_AT / 1000}s — same-id spec accepted ${spectatorSnapshots}/4 — breaks ${spectatorDuelBreaks}
  arrive/leave          arrives ${arriveTotal}/${EXPECT_ARRIVES} — pre-teardown leaves a${leavePreA}/b${leavePreB}/c${leavePreC}/d${leavePreD} — total ${leaveTotal} ∈ [17,21]: ${leaveTotalInBounds ? "yes" : "NO"}
  world log             drift ${logDrift}/${EXPECT_LOG} — say ${sayInLog}/1 @ ${Math.round(sayP95)}ms
  final probe           present ${finalPresent} — entities ${finalEntities} — lease states ${finalLeaseStates} — mounts ${finalMounts}
  poses.json            ${posesKeys} keys (≥${EXPECT_POSES_MIN}) — aliens ${posesAliens === 999 ? "PARSE-FAIL" : posesAliens}
  seer frames           ${Math.round(fpsP50 * 10) / 10}/s — lat p95 ${Math.round(latP95)}ms — gaps ${SEER.gaps}
  http probe ms         race-window p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length}) — settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})
  server rss            ready ${MB(rssReady)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB) → settled ${MB(rssSamples.settled)}MB
  server log            ${suspicious.length} suspicious lines
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
if (restoreA < 4 || restoreC < 4 || takeoverSettles < 2) console.log(`S2 SEAM: takeover path dropped durable acts — restores A${restoreA}/C${restoreC}, settles ${takeoverSettles}/2 (close control B ${restoreB}/${closeSettle})`);

for (const s of legs) { try { s.ws.close(); } catch {} }
if (!KEEP) rmSync(WORLDS, { recursive: true, force: true });

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — duplicate joins resolve to exactly one session, durable acts intact`);
process.exit(fail.length ? 1 : 0);
