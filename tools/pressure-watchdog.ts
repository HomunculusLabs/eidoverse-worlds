// Pressure scenario 27: WATCHDOG STARVATION — a stuck/hot tick cannot block
// heartbeat/liveness paths.
//
// The shared-clock surface under test (server.ts + behaviors.ts):
//   - ONE event loop carries: the 66ms stage-frame heartbeat (presence plane),
//     the 1s behavior tick (timers + prox/regions/zones/bells/tours sweeps),
//     the 5s lease sweep + seat poll, ws message intake (joins/poses/verbs/
//     whispers), and HTTP. All synchronous per callback.
//   - QuickJS sandbox gas: per-ACTIVATION wall-clock deadline (GAS_MS=25
//     handler/timer, LOAD_MS=150 top-level), setInterruptHandler — a hot
//     while(1) is interrupted (behaviortest proves the single case).
//   - The UNCLOSED seam this scenario pins: `world.every()` registrations are
//     UNCAPPED per script (only the period is floored to TIMER_MIN_S=5s), and
//     BehaviorHost.tick() fires EVERY due timer synchronously, EACH with a
//     FRESH 25ms gas. N load-time timers due in the same tick = up to N x 25ms
//     of contiguous loop blockage. 240 hot timers = a ~5-6s stall every 5s —
//     frames stop, joins/verbs/whispers queue behind it, HTTP climbs. Gas
//     bounds each activation; NOTHING bounds the aggregate.
//
// Hostile fleet (all server-side behaviors, bound by the world owner —
// rank builder+, exactly the advertised authoring surface):
//   - bhv-fleet    240 load-time `world.every(5, hot)` timers (~2e6-op loop
//                  each), self-quieting 12s after load so the run is bounded
//                  even if removal were delayed.
//   - bhv-spin     on('say' text==='SPIN27') and on('use' action==='spin')
//                  while(true){} — the classic single hot activation; 5 says
//                  drive it to the 5-consecutive-error PAUSE (the operator
//                  recovery path), proving strikes+pause work UNDER load.
//   - bhv-membomb  load-time allocation past the 24MB VM cap — the sandbox
//                  fault / OOM-strike path, RSS-bounded.
//   - controls     bhv-bell (every 5s emits 'TOCK27-n' — the lighthouse:
//                  timer lane alive), bhv-echo (PONG27 on PING27 — dispatch
//                  lane alive), 7 inert pads to fill the 12-behavior cap,
//                  13th bind = the exact cap refusal.
//
// Questions this scenario pins (thresholds BEFORE measuring):
//   A. HOSTILE-WINDOW HEARTBEATS (the load-bearing gate, predicted RED
//      unfixed): spectator fps p50 >= 8 across [T0+7, T0+15.5) while the
//      fleet runs; HTTP probe p95 <= 1500ms; 12 spec + 2 embodied joins
//      14/14 p95 <= 5s; solo say p95 <= 1000ms; whisper echo p95 <= 1500ms;
//      use-lane echo p95 <= 1000ms; pong dispatch echo <= 1500ms; tock
//      delivery p95 <= 1500ms (the bell fires but arrives seconds late when
//      the tick is blocked).
//   B. GAS HOLDS per-activation under load: SPIN27 x5 -> >=5 script-error
//      recorder entries (interrupted) + >=1 script-pause; roster shows the
//      spin behavior 'paused' at recovery while every control stays
//      'running'; the membomb strikes (>=1 script-error) without taking the
//      server down; a plain 'poke' use (non-spin action) stays cheap.
//   C. TIMER CAP (the fix's contract — RED unfixed): fleet registers <= 32
//      timers at load (300 unfixed) and the flight recorder carries >= 1
//      `timer-cap` note naming the behavior.
//   D. RECOVERY is not a wedge: after removals at T0+16, fps p50 >= 13,
//      says p95 <= 500ms, tocks resume on schedule, final present == 0.
//   E. CAP: 13th bind refused with the exact "already runs 12 behaviors"
//      error; 12/12 binds + 4 removes land as exact log lines (drift 0).
//   F. RSS peak growth <= 90MB (10 live VMs incl. one at the 24MB cap);
//      0 suspicious server console lines.
//
// Workload (presence chassis of pressure-1..26): 24 embodied performers
// @15Hz + 2 quiescent embodied fair legs + 1 owner author + 136 spectators
// = 163 sockets. Uploads (6 scripts) are paced pre-scenario at ~16.5s
// (4/min/IP server limit, 429-retry).
//
// Phases (T0 = uploads complete):
//   T0+2.0  BIND     bell, echo, membomb, fleet, spin, pad x7 (12 total,
//                    paced 380ms), then the 13th (cap refusal) at +4.6s;
//                    spawn pylon-27
//   T0+3.0  BASE     3 says + light + ping (pre-hostility baseline window)
//   T0+7.6  ARMED    roster pull via author socket: fleet timer count,
//                    all 12 'running'
//   T0+8.5-17 HOSTILE  fleet waves (load+5s, +10s; quiet ~+12s); T0+9.5 3
//                    fairness says; T0+10.5 whisper + use-poke + ping; T0+11.3
//                    5x SPIN27 (strike->pause) then 12+2 join probes at
//                    T0+11.8; T0+15 roster pull via a connected spectator
//   T0+17.5 UNBIND   remove fleet, membomb, spin (controls stay; queued
//                    verbs land in the first gap)
//   T0+19.5 RECOVER  3 says + ping; tock census resumes; fps window
//   T0+24.5 DRAIN    all sockets close; final empty-world probe; log census
//
// Acceptance gates (pinned, the AFTER contract — the unfixed tree REDs on
// the starvation + cap families):
//   joins 163/163 p95<3s; hostile joins 14/14 p95<5s; binds 12/12 + exact
//   cap refusal; spinErrors>=5 spinPause>=1 rosterPaused; membombError>=1;
//   hostile fps p50>=8 probeP95<=1500ms sayP95<=1000ms whisperP95<=1500ms
//   useP95<=1000ms pongP95<=1500ms tockP95<=1500ms; fleetTimers<=32;
//   timerCapNotes>=1; recovery fps>=13 sayP95<=500ms tocksResume>=1;
//   final present 0; log drift 0; suspicious 0; RSS <= +90MB.
//
//   cd /tmp/pressure27-wt && ulimit -n 1024 && PORT=8974 \
//     SERVER_DIR=/tmp/pressure27-wt bun tools/pressure-watchdog.ts
//   SELFTEST=1 bun tools/pressure-watchdog.ts   # gate RED/GREEN, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only
// if every pinned gate holds.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract ------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure27-wt";
const PORT = Number(process.env.PORT ?? 8974);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure27-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_ANCHOR_PERF = 24, N_FAIR = 2;              // 26 embodied + author
const N_SPEC = 136;                                 // +136 = 163 sockets
const POSE_HZ = 15;                                 // only the 24 performers pose
const N_BINDS = 12;                                 // behavior cap fill
const FLEET_TIMERS = 1600, FLEET_LIFETIME_S = 12, FLEET_LOOP = 100_000;
const SPIN_ROUNDS = 5;
const UPLOAD_PACE_MS = 16_500;                      // 4/min/IP, keep 3 in hand

const T_BIND = 2_000, BIND_PACE_MS = 380, T_BASE = 3_000, T_ARMED = 7_600;
const T_HOSTILE = 8_500, T_HOSTILE_END = 17_000;
const T_FAIR_SAY = 9_500, T_PROBE = 10_500, T_SPIN = 11_300, T_JOINS = 11_800;
const T_ROSTER_MID = 15_000, T_UNBIND = 17_500, T_RECOVER = 19_500;
const T_DRAIN = 24_500, DURATION = T_DRAIN + 1_500;
const MSG_RATE = "60";
const SELFTEST = process.env.SELFTEST === "1";

const TH = {
  joinsFailed: 0, joinP95Ms: 3_000,
  bindsOk: N_BINDS, capRefusalExact: 1,
  spinErrorsMin: SPIN_ROUNDS, spinPauseMin: 1, membombErrorMin: 1,
  rosterMidRunning: 9, rosterPausedSpin: 1,   // post-removal survivors: bell + echo + 7 pads = 9
  hostileFpsP50: 8, hostileProbeP95: 1_500,
  hostileJoins: 14, hostileJoinP95: 5_000,
  hostileSayP95: 1_000, hostileWhisperP95: 1_500, hostileUseP95: 1_000,
  pongP95: 1_500, tockP95: 1_500,
  fleetTimersMax: 16, timerCapNotesMin: 1,
  recFpsP50: 13, recSayP95: 500, recTocksMin: 1,
  finalPresent: 0, logDrift: 0, logSuspicious: 0, rssPeakGrowthMB: 150,
  fpsBaselineP50: 12, gapMax: 0,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ----------------
type Measurements = {
  failed: number; joinP95: number;
  bindsOk: number; capRefusals: number;
  spinErrors: number; spinPause: number; membombError: number;
  rosterMidRunning: number; rosterSpinPaused: boolean;
  hostileFpsP50: number; hostileProbeP95: number;
  hostileJoinOk: number; hostileJoinP95: number;
  hostileSayP95: number; hostileWhisperP95: number; hostileUseP95: number;
  pongP95: number; tockP95: number;
  fleetTimers: number; timerCapNotes: number;
  recFpsP50: number; recSayP95: number; recTocks: number;
  baselineFpsP50: number; gaps: number;
  finalPresent: number;
  logTotalLines: number; logExpected: number;
  logSuspicious: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.failed > TH.joinsFailed) fail.push(`${m.failed} initial connections failed to join`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`initial join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.bindsOk < TH.bindsOk) fail.push(`behavior binds ${m.bindsOk}/${TH.bindsOk} — authoring surface broken under load`);
  if (m.capRefusals < TH.capRefusalExact) fail.push(`13th bind not refused with the exact cap error (got ${m.capRefusals})`);
  if (m.spinErrors < TH.spinErrorsMin) fail.push(`spin strikes ${m.spinErrors}/${TH.spinErrorsMin} — per-activation gas failed under load`);
  if (m.spinPause < TH.spinPauseMin) fail.push(`spin never paused after ${SPIN_ROUNDS} consecutive errors — the loud-pause contract broke`);
  if (m.membombError < TH.membombErrorMin) fail.push(`membomb produced no script-error — the sandbox fault path is silent`);
  if (m.rosterMidRunning < TH.rosterMidRunning) fail.push(`recovery roster shows only ${m.rosterMidRunning} running (want >=${TH.rosterMidRunning}) — collateral pausing`);
  if (!m.rosterSpinPaused) fail.push(`roster never showed the spin behavior paused`);
  if (m.hostileFpsP50 < TH.hostileFpsP50) fail.push(`HOSTILE fps p50 ${m.hostileFpsP50.toFixed(1)} < ${TH.hostileFpsP50} — presence heartbeat starved by the behavior tick`);
  if (m.hostileProbeP95 > TH.hostileProbeP95) fail.push(`HOSTILE HTTP probe p95 ${Math.round(m.hostileProbeP95)}ms > ${TH.hostileProbeP95}ms — event loop blocked`);
  if (m.hostileJoinOk < TH.hostileJoins) fail.push(`hostile-window joins ${m.hostileJoinOk}/14 — join capacity starved`);
  if (m.hostileJoinP95 > TH.hostileJoinP95) fail.push(`hostile join p95 ${Math.round(m.hostileJoinP95)}ms > ${TH.hostileJoinP95}ms`);
  if (m.hostileSayP95 > TH.hostileSayP95) fail.push(`hostile solo say p95 ${Math.round(m.hostileSayP95)}ms > ${TH.hostileSayP95}ms — verb intake starved`);
  if (m.hostileWhisperP95 > TH.hostileWhisperP95) fail.push(`hostile whisper echo p95 ${Math.round(m.hostileWhisperP95)}ms > ${TH.hostileWhisperP95}ms`);
  if (m.hostileUseP95 > TH.hostileUseP95) fail.push(`hostile use echo p95 ${Math.round(m.hostileUseP95)}ms > ${TH.hostileUseP95}ms`);
  if (m.pongP95 > TH.pongP95) fail.push(`behavior dispatch echo p95 ${Math.round(m.pongP95)}ms > ${TH.pongP95}ms — dispatch lane starved`);
  if (m.tockP95 > TH.tockP95) fail.push(`bell tock delivery p95 ${Math.round(m.tockP95)}ms > ${TH.tockP95}ms — timer lane starved`);
  if (m.fleetTimers > TH.fleetTimersMax) fail.push(`fleet registered ${m.fleetTimers} timers (cap ${TH.fleetTimersMax}) — aggregate timer gas unbounded`);
  if (m.timerCapNotes < TH.timerCapNotesMin) fail.push(`timer-cap recorder notes ${m.timerCapNotes} < ${TH.timerCapNotesMin} — capping is silent`);
  if (m.recFpsP50 < TH.recFpsP50) fail.push(`recovery fps p50 ${m.recFpsP50.toFixed(1)} < ${TH.recFpsP50} — starvation wedged past removal`);
  if (m.recSayP95 > TH.recSayP95) fail.push(`recovery say p95 ${Math.round(m.recSayP95)}ms > ${TH.recSayP95}ms`);
  if (m.recTocks < TH.recTocksMin) fail.push(`bell never resumed after removals (${m.recTocks} recovery tocks)`);
  if (m.baselineFpsP50 < TH.fpsBaselineP50) fail.push(`BASELINE fps p50 ${m.baselineFpsP50.toFixed(1)} < ${TH.fpsBaselineP50} — chassis unhealthy before hostility`);
  if (m.gaps > TH.gapMax) fail.push(`${m.gaps} presence seq gaps`);
  if (m.finalPresent !== TH.finalPresent) fail.push(`final present ${m.finalPresent} != 0 — ghost sessions`);
  if (Math.abs(m.logTotalLines - m.logExpected) > TH.logDrift) fail.push(`log.jsonl lines ${m.logTotalLines} != expected ${m.logExpected} (drift ${Math.abs(m.logTotalLines - m.logExpected)})`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    failed: 0, joinP95: 41,
    bindsOk: 12, capRefusals: 1,
    spinErrors: 5, spinPause: 1, membombError: 1,
    rosterMidRunning: 9, rosterSpinPaused: true,
    hostileFpsP50: 12.4, hostileProbeP95: 380,
    hostileJoinOk: 14, hostileJoinP95: 2_100,
    hostileSayP95: 260, hostileWhisperP95: 310, hostileUseP95: 240,
    pongP95: 420, tockP95: 610,
    fleetTimers: 16, timerCapNotes: 1,
    recFpsP50: 14.6, recSayP95: 120, recTocks: 2,
    baselineFpsP50: 14.9, gaps: 0,
    finalPresent: 0,
    logTotalLines: 48, logExpected: 48,
    logSuspicious: 0, rssPeakGrowth: 95,
  };
  const starved: Measurements = {
    ...healthy,
    hostileFpsP50: 3.9, hostileProbeP95: 5_503,
    hostileJoinOk: 12, hostileJoinP95: 5_100,
    hostileSayP95: 4_846, hostileWhisperP95: 3_845, hostileUseP95: 3_707,
    pongP95: 60_000, tockP95: 2_157,
    fleetTimers: 1_600, timerCapNotes: 0,
    recFpsP50: 9.2, recSayP95: 2_900, recTocks: 0,
    spinErrors: 2, spinPause: 0, membombError: 0,
    rosterMidRunning: 6, rosterSpinPaused: false,
    bindsOk: 10, capRefusals: 0,
    gaps: 14, finalPresent: 2,
    logTotalLines: 44, logExpected: 48,
    logSuspicious: 3, rssPeakGrowth: 240,
  };
  const a = evaluate(healthy);
  const b = evaluate(starved);
  const want = ["presence heartbeat starved", "event loop blocked", "join capacity starved", "hostile join p95", "verb intake starved", "whisper echo p95", "use echo p95", "dispatch lane starved", "timer lane starved", "aggregate timer gas unbounded", "capping is silent", "wedged past removal", "never resumed", "gas failed under load", "loud-pause contract", "sandbox fault path", "collateral pausing", "never showed the spin behavior paused", "authoring surface broken", "exact cap error", "ghost sessions", "drift", "suspicious server log", "RSS peak growth", "seq gaps"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, starvation gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_ANCHOR_PERF} performers @${POSE_HZ}Hz + ${N_FAIR} quiescent embodied + 1 owner author + ${N_SPEC} spectators = ${N_ANCHOR_PERF + N_FAIR + 1 + N_SPEC} sockets; 6 paced script uploads (~${UPLOAD_PACE_MS / 1000}s apart); T0+${T_BIND / 1000}s bind 12 behaviors (fleet=${FLEET_TIMERS} hot every-5s timers lifetime ${FLEET_LIFETIME_S}s, spin, membomb, bell+echo controls, 7 pads) + 13th cap refusal; hostile window [T0+${T_HOSTILE / 1000}, T0+${T_HOSTILE_END / 1000}); ${SPIN_ROUNDS}x SPIN27 strike->pause; T0+${T_JOINS / 1000}s 12+2 join probes; T0+${T_UNBIND / 1000}s unbind fleet/membomb/spin/bell; T0+${T_RECOVER / 1000}s recovery probes; T0+${T_DRAIN / 1000}s drain; ${DURATION / 1000}s scenario, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: joins=163/163@p95<${TH.joinP95Ms}ms binds=${TH.bindsOk}/12 capRefusal=${TH.capRefusalExact} spinErr>=${TH.spinErrorsMin} pause>=${TH.spinPauseMin} membombErr>=${TH.membombErrorMin} roster>=${TH.rosterMidRunning}running+spin-paused HOSTILE fps>=${TH.hostileFpsP50} probeP95<${TH.hostileProbeP95}ms joins=14/14@<${TH.hostileJoinP95}ms sayP95<${TH.hostileSayP95}ms whisperP95<${TH.hostileWhisperP95}ms useP95<${TH.hostileUseP95}ms pongP95<${TH.pongP95}ms tockP95<${TH.tockP95}ms fleetTimers<=${TH.fleetTimersMax} timerCapNotes>=${TH.timerCapNotesMin} RECOVERY fps>=${TH.recFpsP50} sayP95<${TH.recSayP95}ms tocks>=${TH.recTocksMin} baselineFps>=${TH.fpsBaselineP50} gaps=${TH.gapMax} final=${TH.finalPresent} logDrift=${TH.logDrift} suspicious=${TH.logSuspicious} rss<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-watchdog.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure27-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
const server = Bun.spawn({
  cmd: ["bun", "run", "server/server.ts"],
  cwd: SERVER_DIR,
  env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR },
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

// ---- client chassis (pressure-26-proven, frame-window aware) --------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; openAt: number; snapAt: number; snapBytes: number;
  closed: boolean; closeCode: number; id: string;
  frameTs: number[];
  probeHits: Map<string, number>;
  errs: string[];
  whisperRxs: { text: string; at: number }[];
  says: Map<string, number>;
  debugRoster: any[]; debugEvents: any[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], openAt: performance.now(), snapAt: 0, snapBytes: 0, closed: false, closeCode: 0, frameTs: [], probeHits: new Map(), errs: [], whisperRxs: [], says: new Map(), debugRoster: [], debugEvents: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const rawStr = String(ev.data);
      if (rawStr.length > 8_000 && !rawStr.includes('"type":"whisper"')) return;
      let m: any;
      try { m = JSON.parse(rawStr); } catch { return; }
      if (m.type === "snapshot") {
        s.snapAt = performance.now();
        s.joinMs = s.snapAt - s.openAt;
        s.snapBytes = rawStr.length;
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++; s.frameTs.push(performance.now());
        if (s.frameTs.length > 6_000) s.frameTs.splice(0, 1_000);
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "whisper") {
        if (typeof m.text === "string") s.whisperRxs.push({ text: m.text, at: performance.now() });
      } else if (m.type === "log") {
        const v = m.entry?.verb, a = m.entry?.args;
        if (v === "say" && typeof a?.text === "string") {
          if (!s.says.has(a.text)) s.says.set(a.text, performance.now());
          if (probeKeysLive.has(a.text) && !s.probeHits.has(a.text)) s.probeHits.set(a.text, performance.now());
        } else if (v === "light" && typeof a?.id === "string" && a.id.startsWith("plight-")) {
          const key = `light:${a.id}`;
          if (probeKeysLive.has(key) && !s.probeHits.has(key)) s.probeHits.set(key, performance.now());
        } else if (v === "use" && a?.id === "pylon-27") {
          if (probeKeysLive.has("use:pylon-27") && !s.probeHits.has("use:pylon-27")) s.probeHits.set("use:pylon-27", performance.now());
        }
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = (ev: any) => { s.closed = true; s.closeCode = Number(ev?.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}

/** A probe client that joins, captures its snapshot, closes. */
function joinProbe(id: string, spectate: boolean, n = 0): Promise<{ joinMs: number; snapBytes: number; present: number }> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const openAt = performance.now();
    const out = { joinMs: -1, snapBytes: 0, present: -1 };
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(out); }, 15_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      let m: any;
      try { m = JSON.parse(String(ev.data)); } catch { return; }
      if (m.type === "snapshot") {
        out.joinMs = performance.now() - openAt;
        out.snapBytes = String(ev.data).length;
        const present = m.present;
        out.present = Array.isArray(present) ? present.length : -1;
        clearTimeout(to); try { ws.close(); } catch {} resolve(out);
      }
    };
    ws.onerror = () => { clearTimeout(to); resolve(out); };
  });
}

/** Request/response over an ALREADY-CONNECTED socket (debug pulls during stalls). */
let reqSeq = 0;
function reqVia<T>(s: Spec, msg: Record<string, unknown>, timeoutMs = 12_000): Promise<T | null> {
  return new Promise((resolve) => {
    const reqId = `rq${reqSeq++}`;
    const to = setTimeout(() => resolve(null), timeoutMs);
    const onMsg = (ev: any) => {
      try {
        const m = JSON.parse(String(ev.data));
        if (m.reqId === reqId) { clearTimeout(to); resolve(m as T); }
      } catch { /* ignore */ }
    };
    s.ws.addEventListener("message", onMsg, { once: false });
    s.ws.send(JSON.stringify({ ...msg, reqId }));
  });
}

/** Script upload with rate-limit pacing + 429 retry (4/min/IP). */
async function uploadScript(src: string): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = await fetch(`http://127.0.0.1:${PORT}/upload?as=script&token=${TOKEN}&by=pressure27`, { method: "POST", body: src });
    if (r.ok) return (await r.json()).path;
    if (r.status === 429) { await sleep(8_000); continue; }
    throw new Error(`upload ${r.status}: ${await r.text()}`);
  }
  throw new Error("upload exhausted 429 retries");
}

// ---- run -------------------------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const probeKeysLive = new Set<string>();

// author first: embodied, owns the world (auto-grant), binds behaviors
const author = await connect("author-27", false, 90);
await sleep(300);
const V = (verb: string, args: Record<string, unknown>) => {
  if (author.ws.readyState === 1) author.ws.send(JSON.stringify({ type: "verb", verb, args }));
};

// ---- upload phase (paced, BEFORE the scenario clock) -----------------------------
const SRC = {
  // each timer burns a CLEAN ~3ms (measured: this QuickJS strikes any loop
  // over ~100k ops inside the 25ms gas — quickjs interrupts are level-triggered,
  // so NO try/catch shape can hide an over-deadline burn; probes 2-8). The
  // aggregate is the attack: registrations are UNCAPPED (probe 9: a ~40KB
  // script registers 1600 timers ≈ 4.8s contiguous per all-due tick — fps 0
  // for four straight seconds, HTTP p95 4.3s). Calibrated 100k ops = the
  // largest clean burn; 1600 timers is one legal script upload.
  fleet: `const QUIT = Date.now() + ${FLEET_LIFETIME_S * 1000};\nfor (let i = 0; i < ${FLEET_TIMERS}; i++) world.every(5, () => { if (Date.now() > QUIT) return; const s = Date.now(); let x = 0; for (let j = 0; j < ${FLEET_LOOP}; j++) x += j; if ((i % 200) === 0) world.log('t' + i + ' burned ' + (Date.now() - s) + 'ms'); });\n`,
  spin: `world.on('say', (e) => { if (e.text === 'SPIN27') { while (true) {} } });\nworld.on('use', (e) => { if (e.action === 'spin') { while (true) {} } });\n`,
  membomb: `const a = []; for (let i = 0; i < 3_000_000; i++) a.push({ x: i, y: i * 2 }); world.log('allocated ' + a.length);\n`,
  bell: `let n = 0; world.every(5, () => { n++; world.emit('say', { text: 'TOCK27-' + n }); });\n`,
  echo: `world.on('say', (e) => { if (e.text === 'PING27') world.emit('say', { text: 'PONG27' }); });\n`,
  noop: `// pad — deliberately inert (cap filler)\n`,
};
const uploadT0 = performance.now();
const paths: Record<string, string> = {};
for (const [k, src] of Object.entries(SRC)) {
  paths[k] = await uploadScript(src);
  console.log(`upload ${k} -> ${paths[k]} (${Math.round(performance.now() - uploadT0)}ms into upload phase)`);
  if (k !== "noop") await sleep(UPLOAD_PACE_MS);   // last upload needs no trailing pace
}

// anchors join DURING the tail of the upload phase (realistic standing load)
const all = await Promise.allSettled([
  ...Array.from({ length: N_ANCHOR_PERF }, (_, i) => connect(`perf-${i}`, false, i)),
  ...Array.from({ length: N_FAIR }, (_, i) => connect(`fair-${i}`, false, 40 + i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const okLegs = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const failed = all.length - okLegs.length;
const perfs = okLegs.filter((s) => s.id.startsWith("perf-"));
const fairs = okLegs.filter((s) => s.id.startsWith("fair-"));
const specs = okLegs.filter((s) => s.id.startsWith("spec-"));
const joinTimes = okLegs.map((s) => s.joinMs);
console.log(`anchors: joined ${okLegs.length}/${all.length} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// dedicated debug socket, connected ONCE during the join wave and held for the
// whole run — a debug request sent in the same tick as a fresh join can race
// `if (!c.world) return` and be silently dropped (micro-probe p27 finding);
// every recorder pull rides this one long-lived spectator
const dbgSocket = await connect("dbg-hold-27", true).catch(() => null as unknown as Spec | null);
const pullViaDbg = async (msg: Record<string, unknown>) => {
  if (!dbgSocket || dbgSocket.ws.readyState !== 1) return null;
  return reqVia<any>(dbgSocket, msg, 12_000);
};

// embodied presence: ONLY the 24 anchor performers pose @15Hz
let running = true;
const posesSent = { n: 0 };
const tickers = perfs.map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// HTTP event-loop health probe (windowed)
const probeSamples: { t: number; ms: number }[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  probeSamples.push({ t, ms: performance.now() - t });
}, 400);

// RSS sampler
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500) {
    if (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak) rssSamples.peak = r;
  }
}, 500);

const T0 = performance.now();   // scenario clock: uploads complete
const atS = (ms: number, fn: () => void) => setTimeout(fn, T0 + ms - performance.now());

// ---- T0+2.0: BIND wave + cap refusal + pylon -------------------------------------
let bindsOk = 0, capRefusals = 0, capProbeErrs = 0;
atS(T_BIND, async () => {
  V("spawn", { id: "pylon-27", lib: "x/pylon.glb", pos: [3, 0, 3] });
  // bind order matters post-fix (per-tick firing budget iterates bind order):
  // controls first so the bell stays on schedule even under fleet pressure.
  const binds: [string, string][] = [
    ["bhv-bell", paths.bell], ["bhv-echo", paths.echo], ["bhv-membomb", paths.membomb],
    ["bhv-fleet", paths.fleet], ["bhv-spin", paths.spin],
    ...Array.from({ length: 7 }, (_, i) => [`bhv-pad-${i}`, paths.noop] as [string, string]),
  ];
  const bindQueue: [string, string][] = [...binds];
  // pace the 12 binds under the author's own 12/4s verb budget (spawn rode an
  // earlier window), then the cap probe rides the NEXT window — so every
  // bind lands and the 13th meets the exact cap refusal, not "slow down"
  const drain = setInterval(() => {
    const [id, src] = bindQueue.shift()!;
    V("behavior", { id, src });
    if (!bindQueue.length) clearInterval(drain);
  }, BIND_PACE_MS);
  await sleep(12 * BIND_PACE_MS + 600);
  const bindErrs = author.errs.filter((e) => e.includes("slow down") || e.includes("already runs"));
  bindsOk = 12 - bindErrs.length;
  // 13th bind: the exact cap refusal — re-read at send+1.2s AND at teardown:
  // during a stall the error frame can sit queued behind the blocked loop
  setTimeout(async () => {
    const before = author.errs.length;
    V("behavior", { id: "bhv-over", src: paths.noop });
    await sleep(1_200);
    const newErrs = author.errs.slice(before);
    capRefusals = newErrs.filter((e) => e.includes("already runs 12 behaviors")).length;
    capProbeErrs = newErrs.length;
    console.log(`T0+${(T_BIND + 4_600) / 1000}s: cap probe — refusals ${capRefusals}/1 so far (errs seen: ${newErrs.length ? JSON.stringify(newErrs).slice(0, 200) : "none"})`);
  }, 4_600);
  console.log(`T0+${T_BIND / 1000}s: 12 binds queued @${BIND_PACE_MS}ms + cap probe at +4.6s`);
});

// ---- T0+3.0: baseline window (says + light + ping) --------------------------------
atS(T_BASE, () => {
  for (let i = 1; i <= 3; i++) {
    const text = `base-say-${i}-${Math.floor(t0)}`;
    probeKeysLive.add(text);
    const s = perfs[i];
    if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  }
  probeKeysLive.add("light:plight-base");
  const s = perfs[4];
  if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "light", args: { id: "plight-base", pos: [0, 2, 0], color: "#ffb46b", intensity: 0.9, range: 5 } }));
  probeKeysLive.add("PONG27");
  V("say", { text: "PING27" });
});

// ---- T0+7.6: armed roster pull (fleet timer count, all running) --------------------
let fleetTimers = -1, armedRunning = 0;
atS(T_ARMED, async () => {
  const r = await reqVia<any>(author, { type: "debug", behaviors: true }, 8_000);
  if (!r) { console.log("T0+7.6: armed roster pull timed out"); return; }
  const evs = r.events ?? [];
  const fleet = evs.find((e: any) => e.id === "bhv-fleet");
  fleetTimers = fleet ? Number(fleet.timers) : -1;
  armedRunning = evs.filter((e: any) => e.status === "running").length;
  console.log(`T0+7.6: armed — fleet timers ${fleetTimers} (cap gate <=${TH.fleetTimersMax}), running ${armedRunning}/12`);
});

// ---- T0+8.0: hostile fairness says --------------------------------------------
const fairSayLat: number[] = [];
let fairSayMisses = 0;
atS(T_FAIR_SAY, () => {
  for (let i = 0; i < 3; i++) {
    const sentAt = performance.now();
    const text = `hostile-say-${i}-${Math.floor(t0)}`;
    probeKeysLive.add(text);
    const s = fairs[0] ?? perfs[10];
    if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    setTimeout(() => {
      const hit = s?.probeHits.get(text);
      if (hit !== undefined) fairSayLat.push(hit - sentAt);
      else fairSayMisses++;
    }, 6_000);
  }
});

// ---- T0+9.0: whisper + use-poke + ping (dispatch/heartbeat lanes under fire) ----
let whisperSentAt = 0, useSentAt = 0, pongSentAt = 0;
atS(T_PROBE, () => {
  const F = fairs[0], T = perfs[5];
  if (F?.ws.readyState === 1 && T) {
    whisperSentAt = performance.now();
    F.ws.send(JSON.stringify({ type: "whisper", to: T.id, text: "w:WD27-hostile" }));
  }
  const U = perfs[6];
  if (U?.ws.readyState === 1) {
    probeKeysLive.add("use:pylon-27");
    useSentAt = performance.now();
    U.ws.send(JSON.stringify({ type: "verb", verb: "use", args: { id: "pylon-27", action: "poke" } }));
  }
  if (author.ws.readyState === 1) {
    pongSentAt = performance.now();
    V("say", { text: "PING27" });
  }
});

// ---- T0+11.3: SPIN27 x5 (strike -> pause under load) -----------------------------
atS(T_SPIN, () => {
  for (let k = 0; k < SPIN_ROUNDS; k++) {
    const s = perfs[7 + (k % 4)];
    if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: "SPIN27" } }));
  }
});

// ---- T0+9.8: hostile-window join probes ------------------------------------------
let hostileJoinOk = 0, hostileEmbOk = 0; const hostileJoinMs: number[] = [];
atS(T_JOINS, async () => {
  const rs = await Promise.all([
    ...Array.from({ length: 12 }, (_, i) => joinProbe(`hj-spec-${i}-${Math.floor(t0)}`, true)),
    joinProbe(`hj-emb-0-${Math.floor(t0)}`, false, 50),
    joinProbe(`hj-emb-1-${Math.floor(t0)}`, false, 51),
  ]);
  for (const r of rs) if (r.joinMs > 0) { hostileJoinOk++; hostileJoinMs.push(r.joinMs); }
  hostileEmbOk = rs.slice(12).filter((r) => r.joinMs > 0).length;
  console.log(`T0+${T_JOINS / 1000}s: hostile joins ${hostileJoinOk}/14 (emb ${hostileEmbOk}/2) p95 ${Math.round(pct(hostileJoinMs, 95))}ms`);
});

// ---- T0+13: mid-stall roster pull via a CONNECTED spectator ----------------------
let rosterMid: any[] = [];
atS(T_ROSTER_MID, async () => {
  // prefer the dedicated debug socket (race-proof); specs[3] as fallback
  const r = (await pullViaDbg({ type: "debug", behaviors: true }))
    ?? (specs[3] ? await reqVia<any>(specs[3], { type: "debug", behaviors: true }, 12_000) : null);
  rosterMid = r?.events ?? [];
  const spinSt = rosterMid.find((e: any) => e.id === "bhv-spin")?.status ?? "?";
  const bellSt = rosterMid.find((e: any) => e.id === "bhv-bell")?.status ?? "?";
  console.log(`T0+${T_ROSTER_MID / 1000}s: mid-stall roster — spin=${spinSt} bell=${bellSt} (${rosterMid.length} entries)`);
});

// ---- T0+17.5: unbind the hostiles (queued verbs land in the first gap) -------------
// bhv-bell and bhv-echo are CONTROLS — they stay bound through recovery so
// the timer lane and dispatch lane stay observable there.
atS(T_UNBIND, () => {
  for (const id of ["bhv-fleet", "bhv-membomb", "bhv-spin"]) V("behavior", { id, remove: true });
});

// ---- T0+18: recovery probes -------------------------------------------------------
const recSayLat: number[] = [];
let recSayMisses = 0, recPongSentAt = 0;
atS(T_RECOVER, () => {
  for (let i = 0; i < 3; i++) {
    const sentAt = performance.now();
    const text = `rec-say-${i}-${Math.floor(t0)}`;
    probeKeysLive.add(text);
    const s = fairs[1] ?? perfs[11];
    if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    setTimeout(() => {
      const hit = s?.probeHits.get(text);
      if (hit !== undefined) recSayLat.push(hit - sentAt);
      else recSayMisses++;
    }, 4_000);
  }
  if (author.ws.readyState === 1) { recPongSentAt = performance.now(); V("say", { text: "PING27" }); }
});

// ---- teardown ----------------------------------------------------------------------
await sleep(T0 + DURATION - performance.now() + 200);
running = false;
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
// close everyone EXCEPT the dedicated debug socket — the recorder pulls below
// ride it (a fresh join's debug request can race `!c.world` and drop)
for (const s of ([author, ...okLegs].filter(Boolean) as Spec[])) { try { s.ws.close(); } catch {} }
await sleep(1_500);

// final roster (statuses after removals) — the dedicated socket if it
// survived, else one fresh connection
const finalRoster = await (async () => {
  const r = await pullViaDbg({ type: "debug", behaviors: true });
  if (r) return r.events ?? [];
  const s = await connect(`final-dbg-${Math.floor(t0)}`, true).catch(() => null as unknown as Spec | null);
  if (!s) return [] as any[];
  const r2 = await reqVia<any>(s, { type: "debug", behaviors: true }, 8_000);
  try { s.ws.close(); } catch {}
  return r2?.events ?? [];
})();
let spinErrors = 0, spinPause = 0, membombError = 0, timerCapNotes = 0;
let ringDump: any[] = [];
{
  // recorder pull via the dedicated socket FIRST (it has seniority — a fresh
  // join's debug request can race); fresh connection only as fallback
  let evs: any[] = [];
  const r = await pullViaDbg({ type: "debug", limit: 400 });
  if (r) evs = r.events ?? [];
  else {
    const s = await connect(`rec-pull-${Math.floor(t0)}`, true).catch(() => null as unknown as Spec | null);
    if (s) {
      const r2 = await reqVia<any>(s, { type: "debug", limit: 400 }, 8_000);
      evs = r2?.events ?? [];
      try { s.ws.close(); } catch {}
    }
  }
  ringDump = evs;
  for (const e of ringDump) {
    const who = String(e?.behavior ?? e?.who ?? "");
    const err = String(e?.error ?? e?.why ?? "");
    if (e.kind === "script-error") {
      if (who === "bhv-spin") spinErrors++;
      if (who === "bhv-membomb") membombError++;
      if (/timer-cap/.test(err) || e.kind === "timer-cap") timerCapNotes++;
    } else if (e.kind === "script-pause") {
      if (who === "bhv-spin") spinPause++;
    } else if (e.kind === "timer-cap") {
      timerCapNotes++;
    }
  }
}
try { dbgSocket?.ws.close(); } catch {}   // debug socket's job is done

// teardown-time cap re-read: the cap error may have arrived after the probe's
// 1.2s window (queued behind a stall) — count it whenever it landed
capRefusals = Math.max(capRefusals, author.errs.filter((e) => e.includes("already runs 12 behaviors")).length);

// final empty-world probe
const finalProbe = await joinProbe(`final-empty-${Math.floor(t0)}`, true);

// world log ground truth — PRESERVE on FAIL (dump the full log so RED runs can
// be run to ground; deleted only on green)
const worldLogPath = `${WORLDS}/${WORLD}/log.jsonl`;
let logTotalLines = -1, logExpected = -1, tocksInLog = 0, pongsInLog = 0;
let tockTexts: string[] = [];
if (existsSync(worldLogPath)) {
  const raw = readFileSync(worldLogPath, "utf8");
  const wl = raw.split("\n").filter(Boolean);
  logTotalLines = wl.length;
  for (const l of wl) {
    try {
      const e = JSON.parse(l);
      if (e.verb === "say" && String(e.args?.text ?? "").startsWith("TOCK27-")) { tocksInLog++; tockTexts.push(String(e.args.text)); }
      if (e.verb === "say" && e.args?.text === "PONG27") pongsInLog++;
    } catch { /* torn tail counts as drift */ }
  }
  // structure: genesis + grant + spawn + 12 binds + 3 removes + authored says
  // (3 base + 3 pings + 3 hostile + 5 spin + 3 rec) + 1 light + 1 use + bell
  // tocks + echo pongs — every term observed or self-sent (pings = 3: base,
  // hostile, recovery).
  const authoredSays = 3 + 3 + 3 + SPIN_ROUNDS + 3;
  logExpected = 2 + 1 + 12 + 3 + authoredSays + 1 + 1 + tocksInLog + pongsInLog;
}

// server log census
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));

// windowed metrics
const winFrames = (s: Spec, a: number, b: number) => s.frameTs.filter((t) => t >= a && t < b).length;
const baseStart = T0 - 0, baseEnd = T0 + T_HOSTILE - 500;
const hostStart = T0 + T_HOSTILE, hostEnd = T0 + T_HOSTILE_END;
const recStart = T0 + T_RECOVER, recEnd = T0 + T_DRAIN - 500;
const fpsIn = (s: Spec, a: number, b: number) => winFrames(s, a, b) / Math.max(0.001, (b - a) / 1000);
const fpsBase = specs.map((s) => fpsIn(s, baseStart, baseEnd)).filter(Number.isFinite);
const fpsHost = specs.map((s) => fpsIn(s, hostStart, hostEnd)).filter(Number.isFinite);
const fpsRec = specs.map((s) => fpsIn(s, recStart, recEnd)).filter(Number.isFinite);
const probeIn = (a: number, b: number) => probeSamples.filter((p) => p.t >= a && p.t < b).map((p) => p.ms);

// lane latencies
const F0 = fairs[0], T5 = perfs[5], P6 = perfs[6];
const whisperLat = F0 && whisperSentAt ? (F0.whisperRxs.find((r) => r.text === "w:WD27-hostile")?.at ?? Infinity) - whisperSentAt : Infinity;
const useHit = P6?.probeHits.get("use:pylon-27");
const useLat = useHit !== undefined && useSentAt ? useHit - useSentAt : Infinity;
const pongLat = (() => {
  // first PONG27 arrival after the hostile ping across any anchor
  const cands = okLegs.map((s) => s.says.get("PONG27")).filter((t): t is number => t !== undefined);
  return cands.length ? Math.max(0, Math.min(...cands) - pongSentAt) : Infinity;
})();
// tock delivery: the bell's kv COUNTER rides rebuilds (fresh VM = fresh n), so
// a same-text TOCK can legitimately repeat — account DISTINCT texts in first-
// arrival order, each scheduled at bell-load + k*5s, and count skipped texts
// (the number of bell lives observed — a bounded, reported rebuild count)
const firstArr = new Map<string, number>();
for (const s of okLegs) for (const [k, t] of s.says) if (k.startsWith("TOCK27-") && k !== "PONG27") {
  const prev = firstArr.get(k);
  if (prev === undefined || t < prev) firstArr.set(k, t);
}
const tockOrder = [...firstArr.entries()].sort((a, b) => a[1] - b[1]);
const bellBindEst = T0 + T_BIND + 400;   // bind sent T0+2s, sandbox load ~0.4s
const tockLats: number[] = [];
tockOrder.forEach(([_, arr], i) => {
  const sched = bellBindEst + (i + 1) * 5_000;
  tockLats.push(Math.max(0, arr - sched));
});
const tockDistinct = tockOrder.length;
const tockLivesSkipped = Math.max(0, (tockOrder.at(-1)?.[1] ?? bellBindEst) > 0 ? 0 : 0);  // reported via tockTexts below
const tocksRecWindow = tockOrder.filter(([, t]) => t >= recStart && t < T0 + T_DRAIN).length;
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const latAll = specs.flatMap((s) => s.lat);
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));
const rosterSpinPaused = rosterMid.some((e: any) => e.id === "bhv-spin" && /paused/i.test(String(e.status)))
  || finalRoster.some((e: any) => e.id === "bhv-spin" && /paused/i.test(String(e.status)));
const rosterRunningAfter = finalRoster.filter((e: any) => e.status === "running").length;

const m: Measurements = {
  failed, joinP95: pct(joinTimes, 95),
  bindsOk, capRefusals,
  spinErrors, spinPause, membombError,
  rosterMidRunning: rosterRunningAfter, rosterSpinPaused,
  hostileFpsP50: pct(fpsHost, 50), hostileProbeP95: pct(probeIn(hostStart, hostEnd), 95),
  hostileJoinOk, hostileJoinP95: pct(hostileJoinMs, 95),
  hostileSayP95: fairSayLat.length ? pct(fairSayLat, 95) : Infinity,
  hostileWhisperP95: Number.isFinite(whisperLat) ? whisperLat : 60_000,
  hostileUseP95: Number.isFinite(useLat) ? useLat : 60_000,
  pongP95: Number.isFinite(pongLat) ? pongLat : 60_000,
  tockP95: tockLats.length ? pct(tockLats, 95) : 60_000,
  fleetTimers, timerCapNotes,
  recFpsP50: pct(fpsRec, 50), recSayP95: recSayLat.length ? pct(recSayLat, 95) : Infinity, recTocks: tocksRecWindow,
  baselineFpsP50: pct(fpsBase, 50), gaps: gapsTotal,
  finalPresent: finalProbe.present,
  logTotalLines, logExpected,
  logSuspicious: suspicious.length, rssPeakGrowth,
};

console.log(`
results
  poses sent            ${posesSent.n} (24 performers only)
  initial joins         ${okLegs.length}/${all.length} — p95 ${Math.round(m.joinP95)}ms
  binds                 ${bindsOk}/12 + cap refusals ${capRefusals}/1
  armed roster          fleet timers ${fleetTimers} (gate <=${TH.fleetTimersMax}); running ${armedRunning}/12
  GAS                   spin strikes ${spinErrors}/${SPIN_ROUNDS}, pauses ${spinPause}; membomb errors ${membombError}; timer-cap notes ${timerCapNotes}
  roster                mid-stall spin=${rosterMid.find((e: any) => e.id === "bhv-spin")?.status ?? "?"}; post-recovery running ${rosterRunningAfter}, spin paused=${rosterSpinPaused}
  HOSTILE window        fps p50 ${m.hostileFpsP50.toFixed(1)} (gate >=${TH.hostileFpsP50}); probe p95 ${Math.round(m.hostileProbeP95)}ms; joins ${hostileJoinOk}/14 p95 ${Math.round(m.hostileJoinP95)}ms
  lanes under fire      say p95 ${Number.isFinite(m.hostileSayP95) ? Math.round(m.hostileSayP95) : "MISSED"}ms; whisper ${Number.isFinite(whisperLat) ? Math.round(whisperLat) : "MISSED"}ms; use ${Number.isFinite(useLat) ? Math.round(useLat) : "MISSED"}ms; pong ${Number.isFinite(pongLat) ? Math.round(pongLat) : "MISSED"}ms; tock p95 ${tockLats.length ? Math.round(m.tockP95) : "NONE"}ms (n=${tockLats.length})
  recovery              fps p50 ${m.recFpsP50.toFixed(1)} (gate >=${TH.recFpsP50}); say p95 ${Number.isFinite(m.recSayP95) ? Math.round(m.recSayP95) : "MISSED"}ms; tocks in window ${tocksRecWindow}; say misses ${fairSayMisses + recSayMisses}
  baseline fps p50      ${m.baselineFpsP50.toFixed(1)} (gate >=${TH.fpsBaselineP50}); gaps ${gapsTotal}; frame lat p95 ${Math.round(pct(latAll, 95))}ms
  world log             lines ${logTotalLines} expected ~${logExpected} (tocks ${tocksInLog}, pongs ${pongsInLog}); final present ${finalProbe.present}
  bell census           distinct tock texts ${tockDistinct} (lives observable in seq); log tock texts [${tockTexts.join(", ")}]
  http probe            baseline p95 ${Math.round(pct(probeIn(baseStart, baseEnd), 95))}ms / hostile ${Math.round(m.hostileProbeP95)}ms / recovery ${Math.round(pct(probeIn(recStart, recEnd), 95))}ms (${probeErrors.n} errors)
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
const failPreview = evaluate(m);   // computed early for RED forensics
if (failPreview.length) {
  // RED-run forensics: everything needed to run a failure to ground without
  // re-deriving the timeline
  console.log(`\nRED forensics
  fps timeline (spec-0, frames/s): ${Array.from({ length: Math.ceil((T0 + T_DRAIN - T0) / 1000) }, (_, i) => winFrames(specs[0], T0 + i * 1000, T0 + (i + 1) * 1000)).join(" ")}
  ring dump (${ringDump.length} events, kinds ${[...new Set(ringDump.map((e: any) => e.kind))].join("/")}):
${ringDump.slice(-25).map((e: any) => `    ${e.kind} ${e.behavior ?? e.who ?? ""} ${String(e.error ?? e.why ?? "").slice(0, 90)}`).join("\n")}
  tock first-arrivals: ${tockOrder.map(([k, t]) => `${k}@+${Math.round(t - T0)}ms`).join(" ")}
  tock log texts:      [${tockTexts.join(", ")}]
  world log tail:
${existsSync(worldLogPath) ? readFileSync(worldLogPath, "utf8").split("\n").filter(Boolean).slice(-20).map((l) => `    ${l.slice(0, 150)}`).join("\n") : "    (log gone)"}`);
}

server.kill("SIGTERM");
await server.exited;
const fail = evaluate(m);
console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — hostile behaviors cannot starve the heartbeat paths`);
if (fail.length) console.log(`(world log preserved at ${worldLogPath})`);
else rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
