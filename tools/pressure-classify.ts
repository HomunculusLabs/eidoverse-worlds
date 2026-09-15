// Pressure scenario 10: PERFORMER/SPECTATOR CLASSIFICATION CANNOT MULTIPLY FANOUT.
// Design target: 24 embodied performers @15Hz to a full house. Prior scenarios
// proved the presence plane (1), slow-spectator isolation (2), join storms (3),
// authored responsiveness (4), verb rate-limits (5), reconnect hygiene (6),
// world-switch cancellation (7), snapshot consistency (8), memory return (9).
// This one asks whether CLASSIFICATION can multiply fanout: the spectator bit
// (and the aux surfaces that carry it — voice legs) must never turn one human
// into N presence streams, one body into N roster slots, or N watching sockets
// into embodied traffic. The multiplication seams, pinned from source:
//   · pose intake: `if (!c.world || c.spectator) return` — spectator legs
//     must be presence-MUTE (server.ts case "pose").
//   · arrive/leave: broadcast only `if (!c.spectator)` — spectators and aux
//     legs never announce.
//   · roster `present[]`: non-spectator clients only — voice legs invisible.
//   · stage frames: `w.dirty` is a Map KEYED BY ID — one pose per body per
//     tick regardless of how many sockets that body owns; frames fan out once
//     per client (flat loop, classification-blind).
//   · aux admission: a voice leg must bind to the primary's identity
//     authority (agent bearer or matching sub) — an unbindable masquerade is
//     refused 4009 BEFORE any roster/presence effect.
//
// Population (pinned before measuring — 144 persistent, 194 peak):
//   16 perf (embodied @15Hz) + 8 par (embodied @15Hz) + 120 spec anchors
//   = 144 persistent: 24 embodied + 120 watching.
// A) +34 hoard spectators (178 sockets, still 24 present)
//   B) +12 ghost embodied joiners (190 peak) who spray 5 poses @125ms each,
//      then leave cleanly — frames must carry each ghost id at most once per
//      frame while live and ZERO after departure (dirty-map residue probe).
//   C) +8 late agents (embodied, bearer-bound via scratch tokens.json) and
//      their +8 voice legs (surface "voice", same bearer → spectator-classified
//      aux legs) = 194 peak sockets, 32 present, 162 watching — the census line
//      is EXACT arithmetic. +4 masquerade attempts (par ids, voice surface, NO
//      credential) must be refused 4009 with the binding error.
//
// Phases (t0 = anchor join wave):
//   t+4..9    W_R rest window   — every frame EXACTLY 24 anchor poses
//   t+9.5     roster R: EXACTLY the 24 anchor ids
//   t+12.0    hoard wave joins (34 spectators); t+13.2 hoard-0 sends ONE pose
//   t+13..17.5 W_A window — frames STILL exactly 24 anchor poses (hoard mute)
//   t+15      say #2 mid-hoard (fairness)
//   t+18.0    ghost wave (12 embodied), 5 poses @125ms staggered
//   t+18.2..20.3 W_B_LIVE — ghost frames legit (embodied), no id twice/frame
//   t+20.5    ghosts exit clean
//   t+20.8..21.8 W_B_POST — ZERO ghost ids in any frame (residue gate)
//   t+21.5    roster B: EXACTLY the 24 anchor ids (ghosts gone)
//   t+24.0    late wave: 8 agents join embodied with scratch bearers
//   t+24.8    voice wave: 8 legs join surface "voice" with the same bearers
//             (sequential — the last census line must read 32 present,
//             162 watching, deterministic)
//   t+25.2..27.2 W_C window — frames STILL exactly 24 anchor poses (the 8 new
//             bodies never moved; the 8 voice legs CANNOT move)
//   t+26.0    masquerade wave: 4 par-id voice legs without credentials
//   t+27.5    roster C: EXACTLY 32 ids (24 anchors + 8 lates), no voice legs
//   t+29.0    teardown (all but seer2)
//   t+30.5    seer2 (the broadcast witness) closes
//   t+35.0    final probe: present == 0
//
// Ghost arithmetic (seer2 = spec-119, joined t0, closes t+30.5 — sees every
// broadcast except its own departure):
//   arrives: 12 ghosts + 8 lates = 20 (hoards/voices/masqs NEVER arrive)
//   leaves:  12 ghosts + 8 lates + 24 anchors = 44 (voice legs are
//            spectator-classified: reaped 4007 or closed, never a leave)
//
// Server census lines (operator log, chronological): the join/leave lines
// print `${real} present, ${eyes} watching`. Exact arithmetic gates:
//   max present over the whole run <= 36 (24 anchors + 12 ghosts while live)
//   a "36 present, 154 watching" line EXISTS (ghosts embodied while live)
//   a "24 present, 154 watching" line EXISTS (34 spectators added 0 present)
//   a "32 present, 162 watching" line EXISTS (8 agents in, 8 voice legs
//     watching — if any voice leg were misclassified embodied this reads 40)
//   NO line anywhere with present > 36
//
// Acceptance gates (pinned before measuring):
//   - expected joins: 214/214 accepted (144 anchors + 34 + 12 + 8 + 8 + 8...
//     see JOIN_TOTAL), 0 unexpected failures, p95 < 3s
//   - masquerade refusals: 4/4 closed 4009 with the binding error text
//   - roster probes: R == 24 anchors, A == 24, B == 24, C == 32 exact sets
//   - final present: 0
//   - frame windows: W_R/W_A/W_C every frame exactly 24 anchor poses (0
//     deviants), W_B_POST 0 ghost residue frames, W_B_LIVE >=1 ghost frame
//     and 0 intra-frame id duplication
//   - seer2 arrive drift 0 (20), leave drift 0 (44)
//   - fairness: 3/3 says appended, author p95 < 500ms, 3 says in log.jsonl
//   - presence health: spec fps p50 >= 12, frame lat p95 < 250ms, 0 seq gaps
//   - event loop: HTTP probe p95 < 500ms during load, < 100ms post-settle
//   - census arithmetic: gates above
//   - RSS peak growth < 60MB; 0 suspicious server log lines; log.jsonl
//     drift 0 against the expected append ledger (2 + 3 says)
//
//   SERVER_DIR=/tmp/pressure10-<sha> PORT=8998 bun tools/pressure-classify.ts
//   SELFTEST=1 bun tools/pressure-classify.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure10-scratch";
const PORT = Number(process.env.PORT ?? 8998);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure10-worlds";
const TOKENS = process.env.AGENT_TOKENS_PATH ?? "/tmp/pressure10-tokens.json";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 16, N_PAR = 8, N_SPEC = 120;     // 24 embodied + 120 watching = 144
const N_HOARD = 34, N_GHOST = 12, N_LATE = 8, N_MASQ = 4;
const POSE_HZ = 15;
const HOARD_AT = 12_000, GHOST_AT = 18_000, GHOST_EXIT = 20_500;
const LATE_AT = 24_000, VOICE_AT = 24_800, MASQ_AT = 26_000;
const TEARDOWN_AT = 29_000, SEER2_EXIT = 30_500, FINAL_PROBE_AT = 35_000;
const DURATION = 37_500;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..9
const SELFTEST = process.env.SELFTEST === "1";

// windows (ms from t0) for the frame-content invariance probes
const W_R: [number, number] = [4_000, 9_000];
const W_A: [number, number] = [13_000, 17_500];
const W_B_LIVE: [number, number] = [18_200, 20_300];
const W_B_POST: [number, number] = [20_800, 21_800];
const W_C: [number, number] = [25_200, 27_200];

// ghost arithmetic (see header)
const N_ANCHOR_EMB = N_PERF + N_PAR;                    // 24
const EXPECT_ARRIVES = N_GHOST + N_LATE;                // 20
const EXPECT_LEAVES = N_GHOST + N_LATE + N_ANCHOR_EMB;  // 44
const JOIN_TOTAL = N_PERF + N_PAR + N_SPEC + N_HOARD + N_GHOST + N_LATE + N_LATE; // 206
const EXPECT_LOG_LINES = 2 + 3;                          // genesis+grant + 3 says
const MASQ_ERR = "must present that identity's credential";

// acceptance thresholds (fail any → exit 1)
const TH = {
  joinFailed: 0,
  joinP95Ms: 3_000,
  voiceJoins: N_LATE,
  masqRefused: N_MASQ,
  rosterExactR: 0, rosterExactA: 0, rosterExactB: 0, rosterExactC: 0, // violations
  finalPresent: 0,
  winR: 0, winA: 0, winC: 0,          // deviant frames (foreign id, dup, over-size)
  unionR: 0, unionA: 0, unionC: 0,    // anchors missing from the window UNION
  ghostLiveFramesMin: 1,
  ghostDup: 0,
  residueFrames: 0,
  arriveDrift: 0,
  leaveDrift: 0,
  saysAppended: 3,
  sayP95Ms: 500,
  saysInLog: 3,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  probeStormP95Ms: 500,
  probeSettledP95Ms: 100,
  censusMax: 36,
  census40: 0,
  logSuspicious: 0,
  logLineDrift: 0,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  joinFailed: number; joinP95: number; voiceJoins: number; masqRefused: number;
  rosterViolations: { R: number; A: number; B: number; C: number };
  finalPresent: number;
  winR: number; winA: number; winC: number;
  unionR: number; unionA: number; unionC: number;
  ghostLiveFrames: number; ghostDup: number; residueFrames: number;
  arriveDrift: number; leaveDrift: number;
  saysAppended: number; sayP95: number; saysInLog: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeSettledP95: number;
  censusMax: number; census40: number;
  censusHas36: boolean; censusHas32: boolean; censusHas24: boolean;
  logSuspicious: number; logLineDrift: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.joinFailed > TH.joinFailed) fail.push(`${m.joinFailed} expected joins failed`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.voiceJoins < TH.voiceJoins) fail.push(`voice legs joined ${m.voiceJoins}/${TH.voiceJoins}`);
  if (m.masqRefused < TH.masqRefused) fail.push(`masquerade refusals ${m.masqRefused}/${TH.masqRefused} — unbindable aux legs got in`);
  if (m.rosterViolations.R > TH.rosterExactR) fail.push(`roster R violations ${m.rosterViolations.R} — spectator hoard entered present[]`);
  if (m.rosterViolations.A > TH.rosterExactA) fail.push(`roster A violations ${m.rosterViolations.A}`);
  if (m.rosterViolations.B > TH.rosterExactB) fail.push(`roster B violations ${m.rosterViolations.B} — departed ghosts still present`);
  if (m.rosterViolations.C > TH.rosterExactC) fail.push(`roster C violations ${m.rosterViolations.C} — voice/masq legs entered present[]`);
  if (m.finalPresent > TH.finalPresent) fail.push(`final present ${m.finalPresent} — world not empty`);
  if (m.winR > TH.winR) fail.push(`W_R deviant frames ${m.winR} — rest window not exactly 24 anchor poses`);
  if (m.winA > TH.winA) fail.push(`W_A deviant frames ${m.winA} — a spectator's pose entered the frame stream`);
  if (m.winC > TH.winC) fail.push(`W_C deviant frames ${m.winC} — voice legs or idle lates moved the frame stream`);
  if (m.unionR > TH.unionR) fail.push(`W_R union missing ${m.unionR} anchors — a body never streamed in the window`);
  if (m.unionA > TH.unionA) fail.push(`W_A union missing ${m.unionA} anchors`);
  if (m.unionC > TH.unionC) fail.push(`W_C union missing ${m.unionC} anchors`);
  if (m.ghostLiveFrames < TH.ghostLiveFramesMin) fail.push(`ghost frames ${m.ghostLiveFrames} < 1 — embodied ghost poses never flowed`);
  if (m.ghostDup > TH.ghostDup) fail.push(`${m.ghostDup} intra-frame id duplications — one body appeared twice in a frame`);
  if (m.residueFrames > TH.residueFrames) fail.push(`${m.residueFrames} residue frames — a departed body still in the stream`);
  if (m.arriveDrift > TH.arriveDrift) fail.push(`arrive drift ${m.arriveDrift} (expected ${EXPECT_ARRIVES}) — spectators arrived or bodies doubled`);
  if (m.leaveDrift > TH.leaveDrift) fail.push(`leave drift ${m.leaveDrift} (expected ${EXPECT_LEAVES}) — ghost leaves or spectator leaves leaked`);
  if (m.saysAppended < TH.saysAppended) fail.push(`says ${m.saysAppended}/3 appended`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.saysInLog !== TH.saysInLog) fail.push(`log.jsonl says ${m.saysInLog} != 3`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`spec fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps`);
  if (m.probeStormP95 > TH.probeStormP95Ms) fail.push(`storm HTTP probe p95 ${Math.round(m.probeStormP95)}ms > ${TH.probeStormP95Ms}ms`);
  if (m.probeSettledP95 > TH.probeSettledP95Ms) fail.push(`settled HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > ${TH.probeSettledP95Ms}ms`);
  if (m.censusMax > TH.censusMax) fail.push(`census present max ${m.censusMax} > ${TH.censusMax} — classification multiplied bodies`);
  if (m.census40 > TH.census40) fail.push(`${m.census40} census lines with 40 present — voice legs counted as bodies`);
  if (!m.censusHas36) fail.push("no census line '36 present, 154 watching' — ghosts not embodied-counted while live");
  if (!m.censusHas24) fail.push("no census line '24 present, 154 watching' — hoard spectators shifted the present count");
  if (!m.censusHas32) fail.push("no census line '32 present, 162 watching' — voice legs did not land as watchers");
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`log.jsonl line drift ${m.logLineDrift} vs ${EXPECT_LOG_LINES}`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    joinFailed: 0, joinP95: 40, voiceJoins: 8, masqRefused: 4,
    rosterViolations: { R: 0, A: 0, B: 0, C: 0 },
    finalPresent: 0,
    winR: 0, winA: 0, winC: 0,
    unionR: 0, unionA: 0, unionC: 0,
    ghostLiveFrames: 38, ghostDup: 0, residueFrames: 0,
    arriveDrift: 0, leaveDrift: 0,
    saysAppended: 3, sayP95: 8, saysInLog: 3,
    fpsP50: 14.6, latP95: 10, gaps: 0,
    probeStormP95: 12, probeSettledP95: 9,
    censusMax: 36, census40: 0,
    censusHas36: true, censusHas32: true, censusHas24: true,
    logSuspicious: 0, logLineDrift: 0, rssPeakGrowth: 11,
  };
  const breached: Measurements = {
    ...healthy,
    joinFailed: 2, joinP95: 4_500, voiceJoins: 5, masqRefused: 1,
    rosterViolations: { R: 3, A: 1, B: 2, C: 4 },
    finalPresent: 6,
    winR: 2, winA: 7, winC: 5,
    unionR: 1, unionA: 2, unionC: 3,
    ghostLiveFrames: 0, ghostDup: 3, residueFrames: 4,
    arriveDrift: 5, leaveDrift: 9,
    saysAppended: 1, sayP95: 900, saysInLog: 2,
    fpsP50: 9, latP95: 400, gaps: 6,
    probeStormP95: 800, probeSettledP95: 300,
    censusMax: 40, census40: 2,
    censusHas36: false, censusHas32: false, censusHas24: false,
    logSuspicious: 3, logLineDrift: 2, rssPeakGrowth: 90,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = [
    "expected joins failed", "join p95", "voice legs joined", "masquerade refusals",
    "roster R", "roster A", "roster B", "roster C", "world not empty",
    "W_R deviant", "W_A deviant", "W_C deviant",
    "W_R union", "W_A union", "W_C union",
    "ghost frames", "intra-frame id duplication",
    "residue frames", "arrive drift", "leave drift", "says", "say author p95",
    "log.jsonl says", "fps p50", "frame latency p95", "seq gaps",
    "storm HTTP", "settled HTTP", "census present max", "census lines with 40",
    "no census line '36", "no census line '24", "no census line '32",
    "suspicious server log", "line drift", "RSS peak",
  ];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_ANCHOR_EMB} embodied anchors (${N_PERF} perf + ${N_PAR} par) @ ${POSE_HZ}Hz + ${N_SPEC} spectator anchors = 144 persistent; +${N_HOARD} spectator hoard (A, t+${HOARD_AT / 1000}s), +${N_GHOST} embodied ghost pose-sprayers (B, t+${GHOST_AT / 1000}s, 5 poses @125ms each, exit t+${GHOST_EXIT / 1000}s), +${N_LATE} bearer-bound agents + ${N_LATE} voice legs (C, t+${LATE_AT / 1000}s) + ${N_MASQ} unbindable masquerades (t+${MASQ_AT / 1000}s) = 198 peak sockets, 32 present max post-B. Windows W_R[4-9] W_A[13-17.5] W_B_LIVE[18.2-20.3] W_B_POST[20.8-21.8] W_C[25.2-27.2]. Census exacts: 36/154 exists, 24/154 exists, 32/162 exists, max<=36. Arithmetic: arrives=${EXPECT_ARRIVES} leaves=${EXPECT_LEAVES} joins=${JOIN_TOTAL}. ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: joins=${JOIN_TOTAL}@p95<${TH.joinP95Ms}ms voice=${TH.voiceJoins} masqRefused=${TH.masqRefused}@4009 rosters exact(24/24/24/32) windows R/A/C=0-deviant ghostLive>=${TH.ghostLiveFramesMin} dup=${TH.ghostDup} residue=${TH.residueFrames} arrive/leaveDrift=0 says=3@p95<${TH.sayP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=0 probeStorm<${TH.probeStormP95Ms}ms probeSettled<${TH.probeSettledP95Ms}ms censusMax<=${TH.censusMax} census40=${TH.census40} logSuspicious=0 logDrift=0 rssPeak<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget: ~200 concurrent client sockets must fit -----------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (!Number.isFinite(fdLimit) && fdLimit !== Infinity) {
  console.log(`FAIL: file-descriptor limit unparseable ("${fdRaw}") — launch as: ulimit -n 1024 && bun tools/pressure-classify.ts`);
  process.exit(2);
}
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-classify.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
// scratch agent-bearer fixture (same posture as WORLDS_DIR — production reads
// its own mcpl/tokens.json): the late wave's agents and their voice legs bind
// through this; the masquerade wave deliberately presents nothing.
writeFileSync(TOKENS, JSON.stringify(Object.fromEntries(
  Array.from({ length: N_LATE }, (_, i) => [`tok-late-${i}`, { id: `late-${i}` }]),
), null, 2));
const logPath = `/tmp/pressure10-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
const server = Bun.spawn({
  cmd: ["bun", "run", "server/server.ts"],
  cwd: SERVER_DIR,
  env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR, AGENT_TOKENS_PATH: TOKENS },
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

// ---- client chassis (loadtest/reconnect-proven, refusal instruments added) ----
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
  closed: boolean; closeCode: number; id: string;
  arrives: string[]; leaves: string[];          // presence broadcasts seen
  surfaceTransitions: number;                    // aux-leg join announcements
  sayEcho: Map<string, number>;
  errs: string[]; refused: boolean;
};
function connect(id: string, opts: { spectate?: boolean; avatar?: number; surface?: string; agentToken?: string } = {}): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, closeCode: 0, arrives: [], leaves: [], surfaceTransitions: 0, sayEcho: new Map(), errs: [], refused: false };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({
      type: "join", world: WORLD, id,
      avatar: opts.avatar ? `av${opts.avatar}.vrm` : "x.vrm",
      spectate: opts.spectate ?? false, token: TOKEN,
      surface: opts.surface, agentToken: opts.agentToken,
    }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapAt = performance.now();
        s.joinMs = s.snapAt - s.openAt;
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "log") {
        if (m.entry?.verb === "say") { s.says.add(m.entry?.args?.text); if (!s.sayEcho.has(m.entry?.args?.text)) s.sayEcho.set(m.entry?.args?.text, performance.now()); }
      } else if (m.type === "arrive") {
        s.arrives.push(String(m.id ?? ""));
      } else if (m.type === "leave") {
        s.leaves.push(String(m.id ?? ""));
      } else if (m.type === "surface-transition") {
        s.surfaceTransitions++;
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = (ev) => {
      s.closed = true; s.closeCode = Number(ev.code ?? 0);
      // refusal path: error message then close, no snapshot — resolve so the
      // wave can proceed (refused:true marks it)
      if (s.snapAt === 0) { s.refused = true; clearTimeout(to); resolve(s); }
    };
    ws.onerror = () => { /* close follows */ };
  });
}
function exitClean(s: Spec) {
  try {
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "pose", pose: { p: [40, 0, 40], yaw: 0, speed: 0, clip: "idle" } }));
    s.ws.close();
  } catch { /* already gone */ }
}

// ---- anchor population --------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, { avatar: i })),
  ...Array.from({ length: N_PAR }, (_, i) => connect(`par-${i}`, { avatar: 200 + i })),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, { spectate: true })),
]);
const anchors = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const joinFailedBase = all.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const pars = anchors.filter((s) => s.id.startsWith("par-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const anchorIds = new Set([...perfs, ...pars].map((s) => s.id));
const SEER = specs.find((s) => s.id === "spec-0")!;   // frame-content witness (t0 → teardown)
const SEER2 = specs.find((s) => s.id === "spec-119")!; // broadcast witness (t0 → t+30.5)
const joinTimesAll: number[] = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimesAll, 50))}ms p95 ${Math.round(pct(joinTimesAll, 95))}ms`);

// embodied presence (identical shape to pressure-1..9): 24 broadcasters @ 15Hz
let running = true;
const tickers: ReturnType<typeof setInterval>[] = [];
[...perfs, ...pars].forEach((s, i) => tickers.push(setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
}, 1000 / POSE_HZ)));

// frame-content invariance probe on the seer: per window, count frames whose
// pose-count or id-set deviates from the classification contract. Wrapped
// around the chassis handler (proven pattern — no second listener).
type FrameProbe = { deviant: number; ghostFrames: number; dup: number; residue: number; total: number; union: Set<string> };
const winProbe: Record<string, FrameProbe> = {
  R: { deviant: 0, ghostFrames: 0, dup: 0, residue: 0, total: 0, union: new Set() },
  A: { deviant: 0, ghostFrames: 0, dup: 0, residue: 0, total: 0, union: new Set() },
  B_LIVE: { deviant: 0, ghostFrames: 0, dup: 0, residue: 0, total: 0, union: new Set() },
  B_POST: { deviant: 0, ghostFrames: 0, dup: 0, residue: 0, total: 0, union: new Set() },
  C: { deviant: 0, ghostFrames: 0, dup: 0, residue: 0, total: 0, union: new Set() },
};
const inWin = (ms: number, w: [number, number]) => ms >= w[0] && ms < w[1];
const deviantLog: string[] = [];
{
  const orig = SEER.ws.onmessage;
  SEER.ws.onmessage = (ev) => {
    try {
      const m = JSON.parse(String(ev.data));
      if (m.type === "frame") {
        const tNow = performance.now() - t0;
        const ids = Object.keys(m.poses ?? {});
        for (const w of ["R", "A", "B_LIVE", "B_POST", "C"] as const) {
          if (!inWin(tNow, { R: W_R, A: W_A, B_LIVE: W_B_LIVE, B_POST: W_B_POST, C: W_C }[w])) continue;
          const P = winProbe[w];
          P.total++;
          // the batching race (24 unsynchronized 66.67ms senders vs the 66ms
          // batcher) makes a frame legitimately carry 19..24 anchor poses —
          // per-frame completeness is NOT the invariant. Classification is:
          // (a) no foreign id EVER, (b) no intra-frame duplication, (c) no
          // frame larger than the embodied population, (d) window UNION is
          // exactly the classified body set.
          const seen = new Set<string>();
          let dup = 0;
          for (const id of ids) { if (seen.has(id)) dup++; seen.add(id); if (!P.union.has(id)) P.union.add(id); }
          P.dup += dup;
          if (dup) { P.deviant++; if (deviantLog.length < 40) deviantLog.push(`W_${w} t=${Math.round(tNow)}ms DUPLICATE id in frame n=${ids.length}`); }
          if (ids.length > N_ANCHOR_EMB) { P.deviant++; if (deviantLog.length < 40) deviantLog.push(`W_${w} t=${Math.round(tNow)}ms n=${ids.length} > ${N_ANCHOR_EMB}`); }
          if (w === "B_LIVE") {
            if (ids.some((id) => id.startsWith("ghost-"))) P.ghostFrames++;
            const foreign = ids.filter((id) => !anchorIds.has(id) && !id.startsWith("ghost-"));
            if (foreign.length) { P.deviant++; if (deviantLog.length < 40) deviantLog.push(`W_B_LIVE t=${Math.round(tNow)}ms FOREIGN [${foreign.join(",")}]`); }
          } else if (w === "B_POST") {
            if (ids.some((id) => id.startsWith("ghost-"))) { P.residue++; if (deviantLog.length < 40) deviantLog.push(`W_B_POST t=${Math.round(tNow)}ms GHOST RESIDUE`); }
            const foreign = ids.filter((id) => !anchorIds.has(id));
            if (foreign.length) { P.deviant++; if (deviantLog.length < 40) deviantLog.push(`W_B_POST t=${Math.round(tNow)}ms FOREIGN [${foreign.join(",")}]`); }
          } else {
            // R, A, C: no id outside the 24 anchors may EVER ride a frame
            const foreign = ids.filter((id) => !anchorIds.has(id));
            if (foreign.length) { P.deviant++; if (deviantLog.length < 40) deviantLog.push(`W_${w} t=${Math.round(tNow)}ms FOREIGN [${foreign.join(",")}]`); }
          }
        }
      }
    } catch { /* fall through to chassis handler */ }
    orig?.call(SEER.ws, ev);
  };
}
// window-union completion: every anchor streamed in R/A/C (checked at results
// time — see unionViol below)

// HTTP event-loop health probe throughout
const probeStorm: number[] = [], probeSettled: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  const d = performance.now() - t;
  (performance.now() - t0 < TEARDOWN_AT ? probeStorm : probeSettled).push(d);
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

// ---- roster probe: fresh spectator reads present[] ----------------------------
async function rosterProbe(label: string): Promise<Set<string>> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(new Set([`PROBE-TIMEOUT-${label}`])); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `roster-${label}-${Math.floor(Math.random() * 1e6)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        clearTimeout(to); try { ws.close(); } catch {}
        resolve(new Set((m.present ?? []).map((o: any) => String(o.id))));
      }
    };
    ws.onerror = () => { clearTimeout(to); resolve(new Set([`PROBE-ERROR-${label}`])); };
  });
}
function rosterViolations(set: Set<string>, want: Set<string>): number {
  let v = 0;
  for (const id of set) if (!want.has(id)) v++;
  for (const id of want) if (!set.has(id)) v++;
  return v;
}
const roster = { R: NaN as number, A: NaN as number, B: NaN as number, C: NaN as number };
at(9_500, async () => { roster.R = rosterViolations(await rosterProbe("R"), anchorIds); console.log(`roster R: ${roster.R} violations (expect 0 — rest window)`); });
at(16_000, async () => { roster.A = rosterViolations(await rosterProbe("A"), anchorIds); console.log(`roster A: ${roster.A} violations (expect 0 — hoard live)`); });
at(21_500, async () => { roster.B = rosterViolations(await rosterProbe("B"), anchorIds); console.log(`roster B: ${roster.B} violations (expect 0 — ghosts gone)`); });
at(27_500, async () => {
  const wantC = new Set([...anchorIds, ...Array.from({ length: N_LATE }, (_, i) => `late-${i}`)]);
  roster.C = rosterViolations(await rosterProbe("C"), wantC);
  console.log(`roster C: ${roster.C} violations (expect 0 — 32 exact: 24 anchors + 8 lates, no voice legs)`);
});

// ---- wave A (t+12): spectator hoard -------------------------------------------
let hoardJoins = 0;
at(HOARD_AT, async () => {
  const hs = await Promise.allSettled(Array.from({ length: N_HOARD }, (_, i) => connect(`hoard-${i}`, { spectate: true })));
  const ok = hs.filter((r) => r.status === "fulfilled" && !(r as any).value.refused).map((r: any) => r.value as Spec);
  hoardJoins = ok.length;
  ok.forEach((s) => joinTimesAll.push(s.joinMs));
  console.log(`t+12: hoard ${ok.length}/${N_HOARD} spectators joined (${(ok[0]?.arrives.length ?? 0)} arrive broadcasts from their own view — must stay 0)`);
  // hoard-0's pose MUST be silently dropped (spectator-classified)
  at(HOARD_AT + 1_200, () => { if (ok[0]?.ws.readyState === 1) ok[0].ws.send(JSON.stringify({ type: "pose", pose: { p: [99, 0, 99], yaw: 0, speed: 9, clip: "run" } })); });
});

// ---- wave B (t+18): embodied ghost pose-spray ---------------------------------
let ghostJoins = 0;
at(GHOST_AT, async () => {
  const gs = await Promise.allSettled(Array.from({ length: N_GHOST }, (_, i) => connect(`ghost-${i}`, { avatar: 300 + i })));
  const ok = gs.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
  ghostJoins = ok.length;
  ok.forEach((s) => joinTimesAll.push(s.joinMs));
  ok.forEach((s, i) => {
    for (let k = 0; k < 5; k++) {
      at(GHOST_AT + 300 + k * 125 + i * 30, () => {
        if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "pose", pose: { p: [60 + i, 0, -20 + k], yaw: k, speed: 2, clip: "walk" } }));
      });
    }
  });
  at(GHOST_EXIT, () => ok.forEach((s) => exitClean(s)));
});

// ---- wave C (t+24): bearer-bound agents + voice legs + masquerades -------------
let lateJoins = 0, voiceJoins = 0, masqRefused = 0;
const masqFindings: string[] = [];
let lateSpecs: Spec[] = [];
let voiceSpecs: Spec[] = [];
at(LATE_AT, async () => {
  const ls = await Promise.allSettled(Array.from({ length: N_LATE }, (_, i) => connect(`late-${i}`, { avatar: 400 + i, agentToken: `tok-late-${i}` })));
  const okL = ls.filter((r) => r.status === "fulfilled" && !(r as any).value.refused).map((r: any) => r.value as Spec);
  lateJoins = okL.length;
  lateSpecs = okL;
  okL.forEach((s) => joinTimesAll.push(s.joinMs));
  console.log(`t+24: late agents ${okL.length}/${N_LATE} joined embodied with scratch bearers (idle bodies — no poses)`);
  // voice legs, SEQUENTIAL: the last census line is deterministic (32/162)
  at(VOICE_AT, async () => {
    for (let i = 0; i < N_LATE; i++) {
      try {
        const v = await connect(`late-${i}`, { surface: "voice", agentToken: `tok-late-${i}` });
        if (!v.refused) { voiceJoins++; joinTimesAll.push(v.joinMs); voiceSpecs.push(v); }
      } catch { /* counted as failure below */ }
    }
    console.log(`t+25: voice legs ${voiceJoins}/${N_LATE} joined (spectator-classified aux)`);
  });
  // masquerades: par ids on a voice surface with NO credential — must be
  // refused 4009 with the binding error, before any presence effect
  at(MASQ_AT, async () => {
    for (let i = 0; i < N_MASQ; i++) {
      try {
        const m = await connect(`par-${i}`, { surface: "voice" });
        const rightCode = m.closed && m.closeCode === 4009;
        const rightErr = m.errs.some((e) => e.includes(MASQ_ERR));
        if (m.refused && rightCode && rightErr) masqRefused++;
        else masqFindings.push(`par-${i}: closed=${m.closed} code=${m.closeCode} err=${JSON.stringify(m.errs).slice(0, 120)}`);
      } catch (e) {
        masqFindings.push(`par-${i}: ${(e as Error).message}`);
      }
    }
    console.log(`t+26: masquerade refusals ${masqRefused}/${N_MASQ} (4009 + binding error)${masqFindings.length ? ` — findings: ${masqFindings.join(" | ")}` : ""}`);
  });
});

// fairness: one anchor say per phase, mid-traffic
const SAY_TEXTS = [`cls-r-${Math.floor(t0)}`, `cls-a-${Math.floor(t0)}`, `cls-c-${Math.floor(t0)}`];
const saysAppendedArr: boolean[] = [];
const sayLat: number[] = [];
[SAY_TEXTS[0], SAY_TEXTS[1], SAY_TEXTS[2]].forEach((text, i) => {
  const when = [5_000, 15_000, 25_000][i];
  at(when, () => {
    const sentAt = performance.now();
    const S = perfs[3];
    if (S.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(when + 1_500, () => {
      const hit = S.sayEcho.get(text);
      saysAppendedArr.push(hit !== undefined);
      if (hit !== undefined) sayLat.push(hit - sentAt);
    });
  });
});

// ---- teardown + final probe ----------------------------------------------------
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  anchors.forEach((s) => { if (s !== SEER2) { try { s.ws.close(); } catch {} } });
  lateSpecs.forEach((s) => { try { s.ws.close(); } catch {} });
  voiceSpecs.forEach((s) => { try { s.ws.close(); } catch {} });
});
at(SEER2_EXIT, () => { try { SEER2.ws.close(); } catch {} });

let finalPresent = -1;
at(FINAL_PROBE_AT, () => {
  const ws = new WebSocket(URL);
  const to = setTimeout(() => { try { ws.close(); } catch {} finalPresent = -2; }, 10_000);
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `final-empty-${Math.floor(t0)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
  ws.onmessage = (ev) => {
    const m = JSON.parse(String(ev.data));
    if (m.type === "snapshot") { finalPresent = (m.present ?? []).length; clearTimeout(to); try { ws.close(); } catch {} }
  };
});

await sleep(DURATION);
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(300);

// ---- world-log ground truth ----------------------------------------------------
const worldLogPath = `${WORLDS}/${WORLD}/log.jsonl`;
let logTotalLines = -1, logLineDriftVal = 999, saysInLog = -1;
if (existsSync(worldLogPath)) {
  const wl = readFileSync(worldLogPath, "utf8").split("\n").filter(Boolean);
  logTotalLines = wl.length;
  logLineDriftVal = Math.abs(logTotalLines - EXPECT_LOG_LINES);
  saysInLog = wl.filter((l) => { try { return JSON.parse(l)?.verb === "say"; } catch { return false; } }).length;
}

// ---- server census arithmetic --------------------------------------------------
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const census = [...log.matchAll(/\[(?:world:\w+)\]\s+(\d+) present(?:,\s+(\d+) watching)?/g)].map((m) => ({
  present: Number(m[1]), watching: m[2] === undefined ? -1 : Number(m[2]),
}));
const censusMax = census.length ? Math.max(...census.map((c) => c.present)) : -1;
const census40 = census.filter((c) => c.present >= 37).length;   // any over-count line
const censusHas36 = census.some((c) => c.present === 36 && c.watching === 154);
const censusHas24 = census.some((c) => c.present === 24 && c.watching === 154);
const censusHas32 = census.some((c) => c.present === 32 && c.watching === 162);

// ---- broadcast arithmetic from seer2 -------------------------------------------
const bArrives = SEER2 ? SEER2.arrives.filter((id) => !id.startsWith("roster-") && !id.startsWith("final-empty")).length : -1;
const bLeaves = SEER2 ? SEER2.leaves.length : -1;
const arriveDrift = bArrives < 0 ? 999 : Math.abs(bArrives - EXPECT_ARRIVES);
const leaveDrift = bLeaves < 0 ? 999 : Math.abs(bLeaves - EXPECT_LEAVES);

const endAt = performance.now();
const frameWindowMs = (teardownAtTs || endAt) - 500;
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

const rosterViol = {
  R: Number.isFinite(roster.R) ? roster.R : 999,
  A: Number.isFinite(roster.A) ? roster.A : 999,
  B: Number.isFinite(roster.B) ? roster.B : 999,
  C: Number.isFinite(roster.C) ? roster.C : 999,
};
// window-union completion: every anchor streamed in every R/A/C window
const unionViol = {
  R: [...anchorIds].filter((id) => !winProbe.R.union.has(id)).length,
  A: [...anchorIds].filter((id) => !winProbe.A.union.has(id)).length,
  C: [...anchorIds].filter((id) => !winProbe.C.union.has(id)).length,
};

const m: Measurements = {
  joinFailed: joinFailedBase + (JOIN_TOTAL - anchors.length - hoardJoins - ghostJoins - lateJoins - voiceJoins > 0 ? JOIN_TOTAL - anchors.length - hoardJoins - ghostJoins - lateJoins - voiceJoins : 0),
  joinP95: pct(joinTimesAll, 95),
  voiceJoins, masqRefused,
  rosterViolations: rosterViol,
  finalPresent: finalPresent < 0 ? 999 : finalPresent,
  winR: winProbe.R.deviant, winA: winProbe.A.deviant, winC: winProbe.C.deviant,
  unionR: unionViol.R, unionA: unionViol.A, unionC: unionViol.C,
  ghostLiveFrames: winProbe.B_LIVE.ghostFrames, ghostDup: winProbe.B_LIVE.dup, residueFrames: winProbe.B_POST.residue,
  arriveDrift, leaveDrift,
  saysAppended: saysAppendedArr.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  saysInLog: saysInLog < 0 ? -1 : saysInLog,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  censusMax: censusMax < 0 ? 999 : censusMax, census40,
  censusHas36, censusHas32, censusHas24,
  logSuspicious: suspicious.length, logLineDrift: logLineDriftVal, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  joins                 anchors ${anchors.length}/144, hoard ${hoardJoins}/34, ghosts ${ghostJoins}/12, lates ${lateJoins}/8, voice ${voiceJoins}/8 — p95 ${Math.round(m.joinP95)}ms (n=${joinTimesAll.length})
  masquerade refusals   ${masqRefused}/4 at 4009 with binding error${masqFindings.length ? ` — ${masqFindings.length} findings` : ""}
  roster violations     R ${rosterViol.R}  A ${rosterViol.A}  B ${rosterViol.B}  C ${rosterViol.C} (exact sets 24/24/24/32)
  final present         ${finalPresent} embodied (must be 0)
  frame windows         R ${winProbe.R.deviant}/${winProbe.R.total} deviant (union ${24 - unionViol.R}/24)  A ${winProbe.A.deviant}/${winProbe.A.total} deviant (union ${24 - unionViol.A}/24)  C ${winProbe.C.deviant}/${winProbe.C.total} deviant (union ${24 - unionViol.C}/24)
  ghost frames          live ${winProbe.B_LIVE.ghostFrames}/${winProbe.B_LIVE.total} frames carried ghosts, ${winProbe.B_LIVE.dup} intra-frame dups; post-exit residue ${winProbe.B_POST.residue}/${winProbe.B_POST.total}
  seer2 arithmetic      arrives ${bArrives}/${EXPECT_ARRIVES} (drift ${arriveDrift})  leaves ${bLeaves}/${EXPECT_LEAVES} (drift ${leaveDrift})  surface-transitions ${SEER2?.surfaceTransitions ?? "-"} (expect 8)
  says                  ${saysAppendedArr.filter(Boolean).length}/3 appended — author p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms — in log ${saysInLog}/3
  spec frame/s          p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} spectators
  http probe ms         storm p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length})  settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})  errors ${probeErrors.n}
  census arithmetic     ${census.length} census lines — max present ${censusMax} (<=36), >=37-lines ${census40}; 36/154 ${censusHas36 ? "SEEN" : "MISSING"}, 24/154 ${censusHas24 ? "SEEN" : "MISSING"}, 32/162 ${censusHas32 ? "SEEN" : "MISSING"}
  world log             ${logTotalLines} lines vs expected ${EXPECT_LOG_LINES} (drift ${logLineDriftVal})
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
if (deviantLog.length) console.log(`deviant frames (first 40):\n  ${deviantLog.join("\n  ")}`);
if (masqFindings.length) console.log(`masq findings:\n  ${masqFindings.slice(0, 6).join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — classification (spectator bit, aux surfaces) never multiplies presence fanout`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
