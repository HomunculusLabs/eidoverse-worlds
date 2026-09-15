// Pressure scenario 17: GIANT PAYLOAD HANDLING — max-frame enforcement with
// explicit error, no OOM path. Design target: 24 embodied @15Hz to a full
// house. Prior scenarios proved the presence plane (1), slow-reader
// isolation (2), join storms (3), authored responsiveness (4), verb rate
// limits (5), reconnect hygiene (6), world switching (7), snapshot
// consistency (8), memory return (9), classification (10), malformed
// frames (11), auth storms (12), slow-loris crawlers (13), world-hop churn
// (14), promotion atomicity (15), and pose spoofing (16).
//
// This one asks the question the cap comment begs: WS_MESSAGE_MAX_BYTES
// (256KB) is enforced in the ws.message handler — i.e. AFTER the runtime
// has buffered, unmasked, and delivered the complete frame. What happens
// when a client actually sends megabytes? Three load-bearing paths:
//   (a) COMPLETE oversize frames (1.5MB = 6x cap, 8MB = 32x cap) must be
//       refused with an explicit error + close 1009, quickly, per socket.
//   (b) DECLARED-giant frames (header claims 64MB, only ≤256KB trickled /
//       600KB dumped) must never push the server toward the declared size
//       — the runtime either kills at header-read (its own cap) or buffers
//       only delivered bytes; both are bounded, neither is an OOM path.
//       Which side enforces is a MEASURED CLASSIFICATION, not an assumption.
//   (c) A sub-cap frame (240KB, complete, valid JSON) must traverse to the
//       semantic layer — boundary control: only >cap frames get the size
//       treatment; under-cap giants get ordinary semantic refusals
//       (a 230KB string in a pose trips the pressure-16 string guard).
//
// The hypothesis this harness must FALSIFY, not assume: the sequencer
// answers all of the above per-socket, explicitly, and the presence plane,
// verb intake, join path, and memory stay exactly at their 160-anchor
// baselines throughout.
//
// Population (pinned before measuring — peak ~175 concurrent sockets):
//   160 persistent: 24 perf (embodied @15Hz) + 136 spectator anchors.
//   11 giant legs from t+3s (all join normally FIRST — authenticated
//   sockets, worst case):
//     - bomb-a1..a4 (4 std-WS spec): join, then at t+4 send ONE COMPLETE
//       1.5MB text frame (6x cap), all six bombs simultaneous.
//     - bomb-b1..b2 (2 std-WS spec): same but 8MB (32x cap).
//     - dec-d1..d3 (3 raw-TCP spec): join, then write a hand-crafted
//       header DECLARING a 64MB text frame and trickle masked body at
//       40KB/s, stopping at 256KB delivered (hold the partial open).
//     - dec-g1 (1 raw-TCP spec): header declaring 32MB, dump 600KB of
//       body immediately, then hold.
//     - bound-1 (1 std-WS EMBODIED): join, then at t+4.5 send a complete
//       240KB pose whose pins carry a 230KB string — sub-cap, so the
//       semantic layer (pressure-16 guards) must refuse it with a receipt
//       and the socket must SURVIVE (no 1009).
//   Fairness mid-window: 12 spectator joins at t+8, 3 embodied joins +
//   3 perf says at t+10, roster probe at t+11.5 (expect 28 embodied:
//   24 perf + 3 fair + bound-1; giants that are spectators never appear
//   in present[]).
//   Giant legs still open at t+20 are harness-closed INSIDE the seer's
//   window (leave arithmetic must be exact for all 11). Anchors leave
//   t+23, final empty probe t+25, full 175-socket rejoin ratchet t+27.
//
// Acceptance gates (pinned before measuring):
//   - anchors: 160/160 joins, p95 < 3s; rejoin 175/175 p95 < 3s
//   - presence during the giant window: fps p50 >= 12, frame lat p95
//     < 250ms, 0 seq gaps on healthy spectators
//   - HTTP event-loop probe p95 DURING the window < 300ms, after < 100ms
//   - complete bombs: 6/6 answered within 3s (no hang), 6/6 close code
//     EXACTLY 1009, zero silent TCP drops
//   - boundary: alive at t+12 (not size-closed) + 1 semantic receipt
//   - declared legs: 4/4 classified (terminal close code recorded OR open
//     with bounded delivered bytes) — the OOM-path verdict rides on RSS
//   - RSS peak growth < 60MB (fully-buffered bombs would add ~24MB;
//     declared-size preallocation would add ~192MB and breach)
//   - fairness: 12/12 spec joins p95 < 300ms; 3/3 embodied p95 < 300ms;
//     3/3 says appended p95 < 500ms
//   - no contamination: giant arrive/leave drift 0 across 11 legs,
//     0 giant ids in presence frames, roster exact (28 embodied mid-window),
//     final present 0, world-log drift 0 (only the 3 says), 0 suspicious
//
//   SERVER_DIR=/tmp/pressure17-wt PORT=8990 bun tools/pressure-giant.ts
//   SELFTEST=1 bun tools/pressure-giant.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only
// if every pinned gate holds.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure17-wt";
const PORT = Number(process.env.PORT ?? 8990);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure17-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 136, POSE_HZ = 15;      // 160 persistent anchors
const N_BOMB_A = 4, N_BOMB_B = 2;                   // complete bombs (std WS)
const N_DEC = 3, N_DUMP = 1;                        // raw-TCP declared giants
const BOMB_A_BYTES = 1_500_000;                     // 6x cap
const BOMB_B_BYTES = 8_000_000;                     // 32x cap
const DECLARED_BYTES = 64 * 1024 * 1024;            // header LIES: 64MB
const DECLARED_DUMP_BYTES = 32 * 1024 * 1024;       // header LIES: 32MB
const DEC_DELIVER_CAP = 256_000;                    // trickle stops here, holds
const DEC_RATE_B = 40_000;                          // 40KB/s trickle
const DUMP_BYTES = 600_000;                         // immediate body dump
const BOUNDARY_POSE_PAD = 230_000;                  // 240KB total frame
const GIANTS_AT = 3_000;            // giant legs connect + join
const BOMB_AT = 4_000;              // six complete bombs fire simultaneously
const BOUNDARY_AT = 4_500;          // boundary pose (sub-cap giant)
const DEC_AT = 5_000;               // declared giants begin
const FAIR_SPEC_AT = 8_000;         // 12 spectator joins mid-window
const FAIR_EMB_AT = 10_000;         // 3 embodied + says mid-window
const ROSTER_MID_AT = 11_500;       // roster probe (28 embodied expected)
const CLASSIFY_AT = 12_000;         // giant-state classification snapshot
const GIANTS_EXIT_AT = 20_000;      // harness closes still-open giant legs
const TEARDOWN_AT = 23_000;         // anchors leave
const FINAL_PROBE_AT = 25_000;      // empty world
const REJOIN_AT = 27_000;           // ratchet: full anchor rejoin
const DURATION = 33_000;
const MSG_RATE = "600";             // same scratch envelope as pressure-1..16
const EXPECT_SAYS = 3;              // the three mid-window perf says
const BOMB_ANSWER_MS = 3_000;       // a bomb must be answered within 3s
const SELFTEST = process.env.SELFTEST === "1";

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorFailed: 0,
  anchorJoinP95Ms: 3_000,
  rejoinFailed: 0,
  rejoinP95Ms: 3_000,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  probeGiantP95Ms: 300,
  probePostP95Ms: 100,
  probeErrors: 5,
  fairSpecJoins: 12, fairSpecP95Ms: 300,
  fairEmbJoins: 3, fairEmbP95Ms: 300,
  saysAppended: 3, sayP95Ms: 500,
  bombsAnswered: N_BOMB_A + N_BOMB_B,   // every complete bomb terminal in 3s
  bombsCode1009: N_BOMB_A + N_BOMB_B,   // close code EXACTLY 1009
  bombsHung: 0,
  bombsSilent: 0,                       // closed without code 1009 = silent
  boundaryAlive: 1,                     // sub-cap giant NOT size-closed
  boundaryReceipt: 1,                   // semantic layer answered
  declaredClassified: N_DEC + N_DUMP,   // terminal code OR bounded-delivered
  giantArriveDrift: 0,
  giantLeaveDrift: 0,
  giantsInFrames: 0,
  rosterGhosts: 0,
  finalPresent: 0,
  logDrift: 0,
  logSuspicious: 0,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  fpsP50: number; latP95: number; gaps: number;
  probeGiantP95: number; probePostP95: number; probeErrs: number;
  fairSpecJoins: number; fairSpecP95: number;
  fairEmbJoins: number; fairEmbP95: number;
  saysAppended: number; sayP95: number;
  bombsAnswered: number; bombsCode1009: number; bombsHung: number; bombsSilent: number;
  bombsReceipt: number;                       // how many got the app error text
  bombsP95: number;                           // fire→close latency
  boundaryAlive: number; boundaryReceipt: number;
  declaredClassified: number; declaredKilled: number; declaredOpen: number;
  giantArriveDrift: number; giantLeaveDrift: number;
  giantsInFrames: number;
  rosterGhosts: number; finalPresent: number;
  logDrift: number; logSuspicious: number; rssPeakGrowth: number;
  rejoinFailed: number; rejoinP95: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50} during the giant window`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms during the giant window`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on healthy spectators during the giant window`);
  if (m.probeGiantP95 > TH.probeGiantP95Ms) fail.push(`HTTP probe p95 during giants ${Math.round(m.probeGiantP95)}ms > ${TH.probeGiantP95Ms}ms — a giant frame is blocking the loop`);
  if (m.probePostP95 > TH.probePostP95Ms) fail.push(`post-window HTTP probe p95 ${Math.round(m.probePostP95)}ms > ${TH.probePostP95Ms}ms — still churning after the giants`);
  if (m.probeErrs > TH.probeErrors) fail.push(`${m.probeErrs} HTTP probe errors`);
  if (m.fairSpecJoins < TH.fairSpecJoins) fail.push(`mid-window spectator joins ${m.fairSpecJoins}/12 — join path stalled`);
  if (m.fairSpecP95 > TH.fairSpecP95Ms) fail.push(`mid-window spectator join p95 ${Math.round(m.fairSpecP95)}ms > ${TH.fairSpecP95Ms}ms`);
  if (m.fairEmbJoins < TH.fairEmbJoins) fail.push(`mid-window embodied joins ${m.fairEmbJoins}/3`);
  if (m.fairEmbP95 > TH.fairEmbP95Ms) fail.push(`mid-window embodied join p95 ${Math.round(m.fairEmbP95)}ms > ${TH.fairEmbP95Ms}ms`);
  if (m.saysAppended < TH.saysAppended) fail.push(`mid-window says ${m.saysAppended}/3 — verb path stalled`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms mid-window`);
  if (m.bombsAnswered < TH.bombsAnswered) fail.push(`complete bombs answered ${m.bombsAnswered}/${TH.bombsAnswered} within ${BOMB_ANSWER_MS}ms — a giant frame hung its socket`);
  if (m.bombsCode1009 < TH.bombsCode1009) fail.push(`bombs closed 1009 ${m.bombsCode1009}/${TH.bombsCode1009} — max-frame enforcement not explicit`);
  if (m.bombsHung > TH.bombsHung) fail.push(`${m.bombsHung} bombs never closed`);
  if (m.bombsSilent > TH.bombsSilent) fail.push(`${m.bombsSilent} bombs dropped silently (no 1009)`);
  if (m.boundaryAlive < TH.boundaryAlive) fail.push(`sub-cap 240KB frame was size-closed — the cap is not where the code says it is`);
  if (m.boundaryReceipt < TH.boundaryReceipt) fail.push(`boundary giant got no semantic receipt — under-cap frames must traverse`);
  if (m.declaredClassified < TH.declaredClassified) fail.push(`declared giants classified ${m.declaredClassified}/${TH.declaredClassified} — unobserved socket state`);
  if (m.giantArriveDrift > TH.giantArriveDrift) fail.push(`giant arrive drift ${m.giantArriveDrift} (each of the 11 legs must arrive exactly once)`);
  if (m.giantLeaveDrift > TH.giantLeaveDrift) fail.push(`giant leave drift ${m.giantLeaveDrift} (each of the 11 legs must leave exactly once)`);
  if (m.giantsInFrames > TH.giantsInFrames) fail.push(`${m.giantsInFrames} giant ids inside presence frames`);
  if (m.rosterGhosts > TH.rosterGhosts) fail.push(`${m.rosterGhosts} roster ghosts at probes`);
  if (m.finalPresent > TH.finalPresent) fail.push(`${m.finalPresent} embodied present at final probe — world not empty`);
  if (m.logDrift > TH.logDrift) fail.push(`log.jsonl drift ${m.logDrift} vs ${EXPECT_SAYS} expected say appends — a giant wrote to the world log`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB — declared-size buffering is an OOM path`);
  if (m.rejoinFailed > TH.rejoinFailed) fail.push(`${m.rejoinFailed} anchors failed to REJOIN after the giant window`);
  if (m.rejoinP95 > TH.rejoinP95Ms) fail.push(`rejoin p95 ${Math.round(m.rejoinP95)}ms > ${TH.rejoinP95Ms}ms — server degraded after giant cleanup`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 45,
    fpsP50: 14.9, latP95: 10, gaps: 0,
    probeGiantP95: 6, probePostP95: 3, probeErrs: 0,
    fairSpecJoins: 12, fairSpecP95: 40,
    fairEmbJoins: 3, fairEmbP95: 55,
    saysAppended: 3, sayP95: 8,
    bombsAnswered: 6, bombsCode1009: 6, bombsHung: 0, bombsSilent: 0, bombsReceipt: 6, bombsP95: 40,
    boundaryAlive: 1, boundaryReceipt: 1,
    declaredClassified: 4, declaredKilled: 4, declaredOpen: 0,
    giantArriveDrift: 0, giantLeaveDrift: 0,
    giantsInFrames: 0,
    rosterGhosts: 0, finalPresent: 0,
    logDrift: 0, logSuspicious: 0, rssPeakGrowth: 14,
    rejoinFailed: 0, rejoinP95: 48,
  };
  const breached: Measurements = {
    ...healthy,
    fpsP50: 8, latP95: 900, gaps: 7,
    probeGiantP95: 1_400, probePostP95: 350, probeErrs: 9,
    fairSpecJoins: 6, fairSpecP95: 1_600,
    fairEmbJoins: 1, fairEmbP95: 1_900,
    saysAppended: 0, sayP95: Infinity,
    bombsAnswered: 3, bombsCode1009: 2, bombsHung: 3, bombsSilent: 4, bombsReceipt: 1, bombsP95: 8_000,
    boundaryAlive: 0, boundaryReceipt: 0,
    declaredClassified: 2, declaredKilled: 0, declaredOpen: 2,
    giantArriveDrift: 1, giantLeaveDrift: 2,
    giantsInFrames: 3,
    rosterGhosts: 3, finalPresent: 1,
    logDrift: 2, logSuspicious: 4, rssPeakGrowth: 214,
    rejoinFailed: 5, rejoinP95: 3_400,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = [
    "during the giant window", "frame latency p95", "seq gaps", "blocking the loop",
    "still churning", "probe errors", "join path stalled", "spectator join p95",
    "embodied joins", "embodied join p95", "verb path stalled", "say author p95",
    "hung its socket", "not explicit", "bombs never closed", "dropped silently",
    "cap is not where the code says", "no semantic receipt", "unobserved socket state",
    "giant arrive drift", "giant leave drift", "inside presence frames",
    "roster ghosts", "world not empty", "wrote to the world log",
    "suspicious server log lines", "OOM path", "REJOIN", "degraded after giant cleanup",
  ];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${POSE_HZ}Hz + ${N_SPEC} spec = 160 anchors; ${N_BOMB_A}x${BOMB_A_BYTES / 1e6}MB + ${N_BOMB_B}x${BOMB_B_BYTES / 1e6}MB complete bombs (std WS, simultaneous t+${BOMB_AT / 1000}s); ${N_DEC} declared-${DECLARED_BYTES / 1048576}MB trickle ≤${DEC_DELIVER_CAP}B @${DEC_RATE_B / 1000}KB/s + ${N_DUMP} declared-${DECLARED_DUMP_BYTES / 1048576}MB ${DUMP_BYTES / 1e3}KB dump (raw TCP, t+${DEC_AT / 1000}s); 1 boundary ${BOUNDARY_POSE_PAD / 1000}KB sub-cap embodied pose t+${BOUNDARY_AT / 1000}s; giants connect t+${GIANTS_AT / 1000}s, legs end t+${GIANTS_EXIT_AT / 1000}s; fairness 12 spec t+${FAIR_SPEC_AT / 1000}s + 3 emb+say t+${FAIR_EMB_AT / 1000}s; teardown t+${TEARDOWN_AT / 1000}s; final probe t+${FINAL_PROBE_AT / 1000}s; 175-rejoin ratchet t+${REJOIN_AT / 1000}s. ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=160/160@p95<${TH.anchorJoinP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} probeGiant<${TH.probeGiantP95Ms}ms probePost<${TH.probePostP95Ms}ms bombs=${TH.bombsAnswered}/${TH.bombsAnswered}@1009<${BOMB_ANSWER_MS}ms boundary=alive+receipt declared=classified/${TH.declaredClassified} fairSpec=12/12@p95<${TH.fairSpecP95Ms}ms fairEmb=3/3@p95<${TH.fairEmbP95Ms}ms says=3/3@p95<${TH.sayP95Ms}ms giantDrift=0/0 rosterExact(28emb) finalPresent=0 logDrift=${TH.logDrift} rssPeak<+${TH.rssPeakGrowthMB}MB rejoin=175/175@p95<${TH.rejoinP95Ms}ms`);

// ---- fd budget: ~200 concurrent client sockets must fit ------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 500) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 500 — launch as: ulimit -n 1024 && bun tools/pressure-giant.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure17-server-${Date.now()}.log`;
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
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
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
  closed: boolean; closedAt: number; closeCode: number;
  id: string;
  arrives: string[]; leaves: string[];
  sayEcho: Map<string, number>;
  errs: string[];
  frameForeign: number;
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, closedAt: 0, closeCode: -1, arrives: [], leaves: [], sayEcho: new Map(), errs: [], frameForeign: 0 };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const raw = String(ev.data);
      const m = JSON.parse(raw);
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
        if (raw.includes("bomb-") || raw.includes("dec-") || raw.includes("bound-")) s.frameForeign++;
      } else if (m.type === "log") {
        const v = m.entry?.verb, a = m.entry?.args;
        if (v === "say") { s.says.add(a?.text); if (!s.sayEcho.has(a?.text)) s.sayEcho.set(a?.text, performance.now()); }
      } else if (m.type === "arrive") s.arrives.push(String(m.id ?? ""));
      else if (m.type === "leave") s.leaves.push(String(m.id ?? ""));
      else if (m.type === "error") s.errs.push(String(m.error ?? ""));
    };
    ws.onclose = (ev) => { s.closed = true; s.closedAt = performance.now(); s.closeCode = Number(ev.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}

// ---- raw-TCP chassis: hand-rolled WS frames + declared-giant headers ------------
// Sequential frame walker over the server's (unmasked) stream: handles frames
// split across data events AND text+close coalesced into one chunk — the
// v1 run missed a close frame that arrived glued behind an error text.
type SrvFrame = { op: number; payload: Buffer };
function walkFrames(carry: Buffer, chunk: Buffer): { frames: SrvFrame[]; rest: Buffer } {
  const buf = carry.length ? Buffer.concat([carry, chunk]) : chunk;
  const frames: SrvFrame[] = [];
  let o = 0;
  while (o + 2 <= buf.length) {
    const op = buf[o] & 0x0f;
    const maskBit = (buf[o + 1] & 0x80) !== 0;
    let len = buf[o + 1] & 0x7f, hdr = 2;
    if (len === 126) { if (o + 4 > buf.length) break; len = buf.readUInt16BE(o + 2); hdr = 4; }
    else if (len === 127) { if (o + 10 > buf.length) break; const hi = buf.readUInt32BE(o + 2); const lo = buf.readUInt32BE(o + 6); if (hi > 0) break; len = lo; hdr = 10; }
    const maskLen = maskBit ? 4 : 0;
    if (o + hdr + maskLen > buf.length) break;
    if (buf.length - (o + hdr + maskLen) < len) break;   // split payload — wait
    const payload = buf.subarray(o + hdr + maskLen, o + hdr + maskLen + len);
    frames.push({ op, payload: Buffer.from(payload) });
    o += hdr + maskLen + len;
  }
  return { frames, rest: Buffer.from(buf.subarray(o)) };
}
function wsFrame(payload: string): Uint8Array {
  const data = new TextEncoder().encode(payload);
  const mask = crypto.getRandomValues(new Uint8Array(4));
  const masked = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ mask[i & 3];
  let head: Uint8Array;
  if (data.length < 126) head = new Uint8Array([0x81, 0x80 | data.length]);
  else if (data.length < 65536) head = new Uint8Array([0x81, 0x80 | 126, data.length >> 8, data.length & 0xff]);
  else {
    const len = data.length;
    head = new Uint8Array([0x81, 0x80 | 127,
      0, 0, 0, 0,
      (len / 2 ** 32) >>> 0 & 0xff, (len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff]);
  }
  const out = new Uint8Array(head.length + 4 + data.length);
  out.set(head, 0); out.set(mask, head.length); out.set(masked, head.length + 4);
  return out;
}
/** Header for a text frame whose payload length is DECLARED, not yet sent.
 *  Returns { head, mask } — body chunks must be masked with mask[i % 4] at
 *  their payload offset i. */
function declaredHeader(declaredLen: number): { head: Uint8Array; mask: Uint8Array } {
  const mask = crypto.getRandomValues(new Uint8Array(4));
  const head = new Uint8Array([0x81, 0x80 | 127,
    0, 0, 0, 0,
    (declaredLen / 2 ** 32) >>> 0 & 0xff, (declaredLen >>> 24) & 0xff, (declaredLen >>> 16) & 0xff, (declaredLen >>> 8) & 0xff, declaredLen & 0xff,
    ...mask]);
  return { head, mask };
}
function maskChunk(chunk: Uint8Array, mask: Uint8Array, payloadOffset: number): Uint8Array {
  const out = new Uint8Array(chunk.length);
  for (let i = 0; i < chunk.length; i++) out[i] = chunk[i] ^ mask[(payloadOffset + i) & 3];
  return out;
}
type RawLeg = {
  id: string; declaredLen: number; deliverCap: number; rateB: number;
  sock: any; openAt: number; handshakeMs: number; joinMs: number;
  bytesDelivered: number; closed: boolean; closedAtMs: number; closeCode: number;
  receipt: string; pend: Buffer; joined: boolean; ticker: any; classifyOpen: boolean;
  rxBuf: Buffer;                                // frame-walker carry
};
async function rawConnect(L: RawLeg) {
  const key = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const req = `GET /ws HTTP/1.1\r\nHost: 127.0.0.1:${PORT}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`;
  const sock = await Bun.connect({
    hostname: "127.0.0.1", port: PORT,
    socket: {
      data(sk: any, data: Buffer) {
        let buf: Buffer = data;
        if (!L.joined && L.handshakeMs < 0) {
          const txt = new TextDecoder().decode(buf);
          const i = txt.indexOf("\r\n\r\n");
          if (i < 0) return;                        // partial headers — wait
          if (!txt.startsWith("HTTP/1.1 101")) { console.log(`FAIL: ${L.id} upgrade refused`); L.closed = true; return; }
          L.handshakeMs = performance.now() - L.openAt;
          buf = buf.subarray(Buffer.byteLength(txt.slice(0, i)) + 4);
          if (buf.length === 0) return;
        }
        // sequential frame walk (coalesced + split frames both handled)
        const { frames, rest } = walkFrames(L.rxBuf, buf);
        L.rxBuf = rest;
        for (const f of frames) {
          if (f.op === 0x08 && f.payload.length >= 2) {
            L.closeCode = f.payload.readUInt16BE(0);
            L.closed = true; L.closedAtMs = performance.now() - L.openAt;
          } else if (f.op === 0x01) {
            const txt = new TextDecoder().decode(f.payload);
            if (!L.joined && txt.includes(`"type":"snapshot"`)) {
              L.joined = true; L.joinMs = performance.now() - L.openAt;
            } else if (txt.includes("error")) {
              L.receipt = txt.slice(0, 200);
            }
          }
        }
        if (!L.joined && L.rxBuf.length > 0 && !L.closed) {
          // partial snapshot still in carry — hold it for the next chunk
          const txt = new TextDecoder().decode(L.rxBuf);
          if (txt.includes(`"type":"snapshot"`)) { L.joined = true; L.joinMs = performance.now() - L.openAt; L.rxBuf = Buffer.alloc(0); }
        }
      },
      error() { L.closed = true; L.closedAtMs = performance.now() - L.openAt; },
      close() { L.closed = true; L.closedAtMs = L.closedAtMs || performance.now() - L.openAt; },
    },
  });
  L.sock = sock;
  sock.write(req);
  await sleep(150); // let the 101 land
  sock.write(wsFrame(JSON.stringify({ type: "join", world: WORLD, id: L.id, avatar: "x.vrm", spectate: true, token: TOKEN })));
}
// declared-giant delivery: write header once, then masked body at the pinned
// cadence until the deliver cap, then HOLD the partial open forever
function beginDeclared(L: RawLeg) {
  const { head, mask } = declaredHeader(L.declaredLen);
  try { L.sock.write(head); } catch { L.closed = true; return; }
  const body = new Uint8Array(Math.min(32_768, L.deliverCap));   // reusable chunk
  body.fill(0x78);                                                 // 'x' — invalid JSON tail
  L.ticker = setInterval(() => {
    if (L.closed) { clearInterval(L.ticker); return; }
    if (L.bytesDelivered >= L.deliverCap) return;                 // cap reached — hold
    const n = Math.min(body.length, L.deliverCap - L.bytesDelivered);
    try { L.sock.write(maskChunk(body.subarray(0, n), mask, L.bytesDelivered)); } catch { L.closed = true; clearInterval(L.ticker); return; }
    L.bytesDelivered += n;
  }, Math.max(50, (body.length / L.rateB) * 1000));
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

// embodied presence (identical shape to pressure-1..16): 24 broadcasters @ 15Hz
let running = true;
const posesSent = { n: 0 };
const tickers = perfs.map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// HTTP event-loop health probe throughout (giant window vs post)
const probeGiant: number[] = [], probePost: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  const d = performance.now() - t;
  (performance.now() - t0 < GIANTS_EXIT_AT + 2_000 ? probeGiant : probePost).push(d);
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

// ---- giant legs -----------------------------------------------------------------
type Bomb = {
  id: string; sizeBytes: number; firedAt: number;
  answeredMs: number; closeCode: number; receipt: string;
  closed: boolean; joined: boolean;
};
const bombs: Bomb[] = [];
for (let i = 0; i < N_BOMB_A; i++) bombs.push({ id: `bomb-a${i + 1}`, sizeBytes: BOMB_A_BYTES, firedAt: 0, answeredMs: -1, closeCode: -1, receipt: "", closed: false, joined: false });
for (let i = 0; i < N_BOMB_B; i++) bombs.push({ id: `bomb-b${i + 1}`, sizeBytes: BOMB_B_BYTES, firedAt: 0, answeredMs: -1, closeCode: -1, receipt: "", closed: false, joined: false });
const bombSpecs = new Map<string, Spec>();
const rawLegs: RawLeg[] = [];
for (let i = 0; i < N_DEC; i++) rawLegs.push({ id: `dec-d${i + 1}`, declaredLen: DECLARED_BYTES, deliverCap: DEC_DELIVER_CAP, rateB: DEC_RATE_B, sock: null, openAt: 0, handshakeMs: -1, joinMs: -1, bytesDelivered: 0, closed: false, closedAtMs: 0, closeCode: -1, receipt: "", pend: Buffer.alloc(0), joined: false, ticker: null, classifyOpen: false, rxBuf: Buffer.alloc(0) });
rawLegs.push({ id: `dec-g1`, declaredLen: DECLARED_DUMP_BYTES, deliverCap: DUMP_BYTES, rateB: DUMP_BYTES * 2, sock: null, openAt: 0, handshakeMs: -1, joinMs: -1, bytesDelivered: 0, closed: false, closedAtMs: 0, closeCode: -1, receipt: "", pend: Buffer.alloc(0), joined: false, ticker: null, classifyOpen: false, rxBuf: Buffer.alloc(0) });

// holder object so late closure assignment is visible to the ground-truth pass
const G = {
  boundary: null as Spec | null,
  boundaryFiredAt: 0,
};

at(GIANTS_AT, async () => {
  // complete bombs + boundary: std-WS legs that join FIRST, then misbehave
  const conns = await Promise.allSettled([
    ...bombs.map((b) => connect(b.id, true)),
    connect("bound-1", false, 400),
  ]);
  conns.forEach((r, i) => {
    if (i < bombs.length) {
      bombs[i].joined = r.status === "fulfilled";
      if (r.status === "fulfilled") bombSpecs.set(bombs[i].id, (r as any).value as Spec);
    } else if (r.status === "fulfilled") {
      G.boundary = (r as any).value as Spec;
    }
  });
  // raw declared giants
  for (const L of rawLegs) { L.openAt = performance.now(); rawConnect(L).catch(() => { L.closed = true; }); }
  console.log(`t+${GIANTS_AT / 1000}s: giant legs up — bombs joined ${bombs.filter((b) => b.joined).length}/${bombs.length}, raw legs connecting, boundary ${G.boundary ? "embodied+joined" : "FAILED"}`);
});

// fire all complete bombs SIMULTANEOUSLY
at(BOMB_AT, () => {
  for (const b of bombs) {
    const s = bombSpecs.get(b.id);
    if (!s || s.ws.readyState !== 1) { b.closed = true; b.closeCode = -2; continue; }
    b.firedAt = performance.now();
    // one COMPLETE text frame of sizeBytes — the runtime frames it
    s.ws.send(`{"type":"verb","verb":"say","args":{"text":"${"x".repeat(b.sizeBytes - 80)}"}}`);
  }
  console.log(`t+${BOMB_AT / 1000}s: ${bombs.length} complete bombs fired simultaneously (${N_BOMB_A}x${BOMB_A_BYTES / 1e6}MB + ${N_BOMB_B}x${BOMB_B_BYTES / 1e6}MB)`);
});

// boundary pose: 240KB total, valid JSON, sub-cap → semantic layer must answer
at(BOUNDARY_AT, () => {
  const b = G.boundary;
  if (!b || b.ws.readyState !== 1) return;
  G.boundaryFiredAt = performance.now();
  const pose = JSON.stringify({ type: "pose", pose: { p: [2, 0, 2], yaw: 0.5, speed: 0, clip: "idle", pins: { pad: "y".repeat(BOUNDARY_POSE_PAD) } } });
  b.ws.send(pose);
  console.log(`t+${BOUNDARY_AT / 1000}s: boundary pose sent (${pose.length}B, sub-cap)`);
});

// declared giants begin delivering
at(DEC_AT, () => {
  for (const L of rawLegs) if (L.joined && !L.closed) beginDeclared(L);
  console.log(`t+${DEC_AT / 1000}s: ${rawLegs.filter((L) => L.ticker).length} declared giants delivering (${N_DEC} trickle ≤${DEC_DELIVER_CAP}B + ${N_DUMP} dump ${DUMP_BYTES / 1e3}KB, headers claim ${DECLARED_BYTES / 1048576}MB/${DECLARED_DUMP_BYTES / 1048576}MB)`);
});

// ---- fairness legs mid-window ----------------------------------------------------
const fairSpecs: Spec[] = [];
at(FAIR_SPEC_AT, async () => {
  const r = await Promise.allSettled(Array.from({ length: 12 }, (_, i) => connect(`fair-${i}`, true)));
  fairSpecs.push(...r.filter((x) => x.status === "fulfilled").map((x: any) => x.value as Spec));
  anchors.push(...fairSpecs);
});
let fairEmb: Spec[] = [];
const saysAppendedArr: boolean[] = [];
const sayLat: number[] = [];
at(FAIR_EMB_AT, async () => {
  const r = await Promise.allSettled([0, 1, 2].map((i) => connect(`legit-${i}`, false, 300 + i)));
  fairEmb = r.filter((x) => x.status === "fulfilled").map((x: any) => x.value as Spec);
  anchors.push(...fairEmb);
  const SAY_TEXTS = [`giantfair-a-${Math.floor(t0)}`, `giantfair-b-${Math.floor(t0)}`, `giantfair-c-${Math.floor(t0)}`];
  SAY_TEXTS.forEach((text, i) => {
    const S = perfs[3 + i];
    if (S.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  });
  setTimeout(() => {
    SAY_TEXTS.forEach((text, i) => {
      const hit = perfs[3 + i].sayEcho.get(text);
      saysAppendedArr.push(hit !== undefined);
    });
  }, 2_500);
  const sentAt = performance.now();
  setTimeout(() => {
    const hit = perfs[3].sayEcho.get(SAY_TEXTS[0]);
    if (hit !== undefined) sayLat.push(hit - sentAt);
  }, 2_500);
});

// ---- roster probe -----------------------------------------------------------------
const rosterGhosts: string[] = [];
async function rosterProbe(label: string, wantIds: Set<string>): Promise<void> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} rosterGhosts.push("PROBE-TIMEOUT"); resolve(); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `roster-${label}-${Math.floor(Math.random() * 1e6)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        clearTimeout(to); try { ws.close(); } catch {}
        const got = new Set<string>((m.present ?? []).map((o: any) => String(o.id)));
        const ghosts = [...got].filter((id) => !wantIds.has(id));
        const missing = [...wantIds].filter((id) => !got.has(id));
        rosterGhosts.push(...ghosts, ...missing.map((id) => `MISSING:${id}`));
        console.log(`roster ${label}: ${got.size} embodied (want ${wantIds.size} — ${ghosts.length} ghosts, ${missing.length} missing)`);
        resolve();
      }
    };
    ws.onerror = () => { clearTimeout(to); rosterGhosts.push("PROBE-ERROR"); resolve(); };
  });
}
at(ROSTER_MID_AT, async () => {
  // embodied mid-window: 24 perf + 3 fairness legs + bound-1 (embodied boundary)
  const want = new Set([...anchorIds, "legit-0", "legit-1", "legit-2", "bound-1"]);
  await rosterProbe("midgiant", want);
});

// ---- classification snapshot -------------------------------------------------------
let declaredKilled = 0, declaredOpen = 0, declaredClassified = 0;
let boundaryAliveAtClassify = -1;    // 1 = alive at t+12 (before harness close)
at(CLASSIFY_AT, () => {
  const b = G.boundary;
  boundaryAliveAtClassify = b && !b.closed && b.ws.readyState === 1 ? 1 : 0;
  for (const L of rawLegs) {
    L.classifyOpen = !L.closed;
    if (L.closed) declaredKilled++; else declaredOpen++;
    // classified = state OBSERVED: a clean close (code captured), an abrupt
    // termination with bytes on the wire (runtime killed it — acceptable
    // defense, code simply not delivered), or held-open with bounded
    // delivery. Only a leg we learned nothing about stays unclassified.
    if (L.closed ? (L.closeCode >= 0 || L.bytesDelivered > 0) : L.bytesDelivered > 0) declaredClassified++;
  }
  console.log(`t+${CLASSIFY_AT / 1000}s: declared giants — killed ${declaredKilled} (delivered ${rawLegs.filter((L) => L.closed).map((L) => L.bytesDelivered).join("/")}B, codes ${rawLegs.filter((L) => L.closed).map((L) => L.closeCode).join(",")}), open ${declaredOpen} (delivered ${rawLegs.filter((L) => !L.closed).map((L) => L.bytesDelivered).join("/")}B vs declared ${rawLegs.filter((L) => !L.closed).map((L) => L.declaredLen).join("/")}) — boundary alive ${boundaryAliveAtClassify}/1`);
});

// world-log baseline before any fairness says land
let logBaseline = -1;
at(7_000, () => {
  const p = `${WORLDS}/${WORLD}/log.jsonl`;
  if (existsSync(p)) logBaseline = readFileSync(p, "utf8").split("\n").filter(Boolean).length;
});

// ---- end still-open giant legs inside the seer's window ---------------------------
at(GIANTS_EXIT_AT, () => {
  let n = 0;
  for (const L of rawLegs) {
    if (L.ticker) clearInterval(L.ticker);
    if (!L.closed) { try { L.sock?.end(); } catch {} n++; }
  }
  const b = G.boundary;
  if (b && !b.closed) { try { b.ws.close(); } catch {} }
  console.log(`t+${GIANTS_EXIT_AT / 1000}s: ended ${n} still-open raw legs + boundary (observed-departure window)`);
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
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
for (const L of rawLegs) if (L.ticker) clearInterval(L.ticker);
await sleep(300);

// ---- ground truth -----------------------------------------------------------------
const SEER = specs[0];
// pressure-13 law: spectators NEVER arrive/leave — the arrive/leave contract
// belongs to the EMBODIED leg only (bound-1). Giant spectators must appear in
// NO roster (roster probe covers that) and no presence frame (frameForeign).
const giantArr = SEER ? SEER.arrives.filter((id) => id === "bound-1").length : -1;
const giantLv = SEER ? SEER.leaves.filter((id) => id === "bound-1").length : -1;
const N_GIANT_EMB = 1;                              // bound-1 only
const giantArriveDrift = giantArr < 0 ? 999 : Math.abs(giantArr - N_GIANT_EMB);
const giantLeaveDrift = giantLv < 0 ? 999 : Math.abs(giantLv - N_GIANT_EMB);
const worldLogPath = `${WORLDS}/${WORLD}/log.jsonl`;
let logTotalLines = -1, logDriftVal = 999;
if (existsSync(worldLogPath) && logBaseline >= 0) {
  const wl = readFileSync(worldLogPath, "utf8").split("\n").filter(Boolean);
  logTotalLines = wl.length;
  logDriftVal = Math.abs((logTotalLines - logBaseline) - EXPECT_SAYS);
}
const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const giantsInFrames = specs.reduce((a, s) => a + s.frameForeign, 0);
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

// bomb outcomes: derive from their captured Spec sockets (close code + timing
// recorded by the Spec's own onclose)
let bombsAnswered = 0, bombsCode1009 = 0, bombsHung = 0, bombsSilent = 0, bombsReceipt = 0;
const bombLat: number[] = [];
for (const b of bombs) {
  const s = bombSpecs.get(b.id);
  if (!s) { bombsHung++; continue; }
  const receipt = s.errs.find((e) => e.includes("too large"));
  if (receipt) { b.receipt = receipt; bombsReceipt++; }
  if (s.closed) {
    b.closed = true;
    b.closeCode = s.closeCode;
    if (b.firedAt) {
      b.answeredMs = s.closedAt - b.firedAt;
      if (b.answeredMs <= BOMB_ANSWER_MS) { bombsAnswered++; bombLat.push(b.answeredMs); }
      else bombsHung++;
    } else bombsAnswered++;          // closed before firing (join-window death) — still answered
    if (s.closeCode === 1009) bombsCode1009++;
    else bombsSilent++;
  } else bombsHung++;
}

// boundary outcome: alive AT CLASSIFY (t+12 — before the harness's own t+20
// close; the pinned gate is "the 240KB frame did not size-close the socket"),
// and a semantic receipt arrived after the frame traversed.
const boundaryAlive = boundaryAliveAtClassify;
const boundaryReceiptOk = G.boundary && G.boundary.errs.length > 0 ? 1 : 0;

const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeGiantP95: pct(probeGiant, 95), probePostP95: pct(probePost, 95), probeErrs: probeErrors.n,
  fairSpecJoins: fairSpecs.length, fairSpecP95: pct(fairSpecs.map((s) => s.joinMs), 95),
  fairEmbJoins: fairEmb.length, fairEmbP95: pct(fairEmb.map((s) => s.joinMs), 95),
  saysAppended: saysAppendedArr.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  bombsAnswered, bombsCode1009, bombsHung, bombsSilent, bombsReceipt, bombsP95: pct(bombLat, 95),
  boundaryAlive, boundaryReceipt: boundaryReceiptOk,
  declaredClassified, declaredKilled, declaredOpen,
  giantArriveDrift, giantLeaveDrift, giantsInFrames,
  rosterGhosts: rosterGhosts.length,
  finalPresent: Math.max(finalPresent, 0) === finalPresent ? finalPresent : 999,
  logDrift: logDriftVal, logSuspicious: suspicious.length, rssPeakGrowth,
  rejoinFailed, rejoinP95: pct(rejoins.map((s) => s.joinMs), 95),
};
const fail = evaluate(m);

console.log(`\nresults
  poses sent            ${posesSent.n}
  anchor joins          ${all.length - anchorFailed}/${all.length} — p95 ${Math.round(m.anchorJoinP95)}ms
  complete bombs        answered ${bombsAnswered}/${bombs.length} — 1009 exact ${bombsCode1009}/${bombs.length}, silent ${bombsSilent}, hung ${bombsHung}, fire→close p95 ${bombLat.length ? Math.round(m.bombsP95) : "-"}ms
  bomb receipts         ${bombsReceipt}/${bombs.length} got the app "too large" error text (server-path vs runtime-path classification)
  declared giants       classified ${declaredClassified}/${rawLegs.length} — killed-early ${declaredKilled} (delivered ${rawLegs.filter((L) => L.closed).map((L) => L.bytesDelivered).join("/")}B, codes ${rawLegs.filter((L) => L.closed).map((L) => L.closeCode).join(",")}), held-open ${declaredOpen} (delivered ${rawLegs.filter((L) => !L.closed).map((L) => L.bytesDelivered).join("/")}B vs declared ${rawLegs.filter((L) => !L.closed).map((L) => L.declaredLen).join("/")})
  boundary 240KB        alive ${boundaryAlive}/1 — semantic receipt ${boundaryReceiptOk}/1 (${G.boundary?.errs?.[0]?.slice(0, 80) ?? "none"})
  giant arrive/leave    bound-1 ${giantArr}/1 arrives (drift ${giantArriveDrift})  ${giantLv}/1 leaves (drift ${giantLeaveDrift}) — spectator giants appear in no roster/frame by design
  giants in frames      ${giantsInFrames} (must be 0)
  mid-window joins      spec ${m.fairSpecJoins}/12 p95 ${Math.round(m.fairSpecP95)}ms  emb ${m.fairEmbJoins}/3 p95 ${Math.round(m.fairEmbP95)}ms
  mid-window says       ${saysAppendedArr.filter(Boolean).length}/3 appended — author p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchor spectators
  http probe ms         giant-window p95 ${Math.round(m.probeGiantP95)} (n=${probeGiant.length})  post p95 ${Math.round(m.probePostP95)} (n=${probePost.length})  errors ${probeErrors.n}
  rosters               ${rosterGhosts.length === 0 ? "exact at all probes" : `${rosterGhosts.length} ghosts: ${rosterGhosts.slice(0, 8).join(",")}`}
  final present         ${finalPresent} embodied (must be 0)
  world log             baseline ${logBaseline} → ${logTotalLines} lines (drift ${logDriftVal} vs ${EXPECT_SAYS} says)
  ratchet rejoin        ${rejoins.length}/${rejoins.length + rejoinFailed} — p95 ${Math.round(m.rejoinP95)}ms
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
for (const s of rejoins) { try { s.ws.close(); } catch {} }
for (const b of bombSpecs.values()) { try { b.ws.close(); } catch {} }
if (G.boundary) { try { G.boundary.ws.close(); } catch {} }
for (const L of rawLegs) { try { L.sock?.end(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — megabyte frames die explicitly per socket (1009, sub-cap frames traverse) and no declared-giant path moves RSS`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
