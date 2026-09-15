// Pressure scenario 6: RECONNECT STORM — NO GHOST CLIENTS, LEASES, OR TIMERS.
// Design target: 24 embodied performers @ 15Hz presence to a full house. Prior
// scenarios proved the presence plane (1), slow-spectator isolation (2), join
// storms (3), authored responsiveness (4), and verb rate-limiting (5). This one
// asks what a RECONNECT STORM leaves behind: every dropped-and-returned body
// must leave exactly one roster slot (takeover, never stacking), every lease a
// vanishing holder held must settle exactly once at its last transform, and a
// fully-departed world must return to EMPTY — no ghost clients in `present`,
// no ghost leases, no lingering per-client state. Timer hygiene is measured by
// proxy (the only timers are module intervals): post-settle HTTP latency must
// return to the idle envelope and the stale-lease sweep must fire within its
// bound (interval 5s + staleness 10s).
//
// Population (pinned before measuring — peak 200 concurrent):
//   16 perf (embodied @15Hz) + 8 guards (embodied @15Hz, hold pball-0..7
//   leases, stream lease state @10Hz) + 144 spectator anchors = 168 persistent.
//   + 32 churn identities (cyc-0..31) arriving in waves = 200 at wave peak.
//
// Phases:
//   t=2.0s  14 spawns: pchurn-0..5 (claim targets) + pball-0..7 (guard props)
//   t=3.5s  guards claim pball-i each (one lease per guard, held to teardown)
//   t=6.0s  WAVE A — 32 cyc join, stream @15Hz, exit at +1.2s:
//           16 CLEAN (final pose + close), 16 ABRUPT (terminate, no close
//           frame). Roster probe +2.5s: exactly the 24 anchors embodied.
//   t=9.0s  WAVE B — same 32 ids REJOIN; cyc-0..5 claim pchurn-i, stream 3
//           lease states (p1,p2,p3) each; ALL exit +1.2s mixed clean/abrupt —
//           cyc-0..2 vanish mid-lease CLEAN (immediate settle on close),
//           cyc-3..5 vanish mid-lease ABRUPT (stale-sweep settle ≤ ~15s).
//           Roster probe +2.5s: exactly the 24 anchors.
//   t=12.0s WAVE C — zombie duel: 12 cyc join (gen1), +0.6s the SAME ids join
//           again WITHOUT closing gen1 (the half-open reconnect). Server must
//           take over: gen1 sockets close 4002 "session takeover", roster
//           stays ONE per id. Gen2 exits +1.8s. Roster probe +3.0s: 24 anchors.
//   t=20.0s TEARDOWN — all 168 anchors close cleanly (guards' pball leases
//           settle on close); 6.5s quiet.
//   t=26.5s FINAL PROBE — one spectator joins: present[] must be EMPTY (0
//           ghost clients) and NO lease-state messages may follow the
//           snapshot (0 ghost leases).
//
// Ghost arithmetic (observed by anchor spectator spec-0, who sees every
// broadcast and never disconnects before teardown):
//   cyc arrives: 32 (A) + 32 (B) + 12+12 (C gens) = 88 — every accepted join.
//   cyc leaves:  32 (A) + 32 (B) + 12 (C gen2)    = 76 — gen1 are SUPERSEDED
//                (takeover = re-arrival, no leave) and must NOT double-leave.
//   arrives - leaves drift == 0 and leave excess == 0 are the ghost gates.
//
// Acceptance gates (pinned before measuring):
//   - anchor joins: 168/168, p95 < 3s                  (same envelope as 1..5)
//   - wave joins: A 32/32, B 32/32, C 24/24 (12 gen1 + 12 gen2)
//   - duels: 12/12 gen1 sockets closed with code 4002 (takeover fired)
//   - roster after every wave: EXACTLY the 24 anchor ids (0 cyc ghosts)
//   - final present: 0 embodied, 0 watching residue — empty world
//   - arrive drift 0 (88 observed), leave drift 0 (76 observed)
//   - leases: pchurn settled 6/6 at EXACT last streamed p3; pball 8/8 on
//     teardown; total place verbs == 14 (each lease settles EXACTLY once)
//   - ghost lease states seen by final probe: 0
//   - fairness: 3/3 mid-wave says appended, author p95 < 500ms
//   - presence health: anchor fps p50 >= 12, frame lat p95 < 250ms, 0 gaps
//   - event loop: storm-window HTTP probe p95 < 500ms; post-settle p95 < 100ms
//   - RSS peak growth < 60MB; 0 suspicious server log lines; log.jsonl line
//     drift 0 against the expected append ledger
//
//   SERVER_DIR=/tmp/pressure6-d29ba072 PORT=8999 bun tools/pressure-reconnect.ts
//   SELFTEST=1 bun tools/pressure-reconnect.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure6-d29ba072";
const PORT = Number(process.env.PORT ?? 8999);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure6-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 16, N_GUARD = 8, N_SPEC = 144;   // 24 embodied + 144 = 168
const N_CYC = 32;                                // churn wave size (200 peak)
const N_DUEL = 12;                               // wave C duel identities
const POSE_HZ = 15, LEASE_HZ = 10;
const SPAWN_AT = 2_000;
const CLAIM_AT = 3_500;
const WAVE_A = 6_000, WAVE_B = 9_000, WAVE_C = 12_000;
const TEARDOWN_AT = 20_000;
const FINAL_PROBE_AT = 26_500;
const DURATION = 29_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..5
const SELFTEST = process.env.SELFTEST === "1";

// ghost arithmetic (see header): every cyc join arrives; only non-superseded
// exits leave. gen1 of the duel is superseded — no leave, no double-leave.
const EXPECT_ARRIVES = N_CYC * 2 + N_DUEL * 2;          // 88
const EXPECT_LEAVES = N_CYC * 2 + N_DUEL;               // 76
const EXPECT_PLACES = 14;                                // 8 pball + 6 pchurn
const EXPECT_LOG_LINES = 2 + 14 + EXPECT_PLACES + 3;     // genesis+grant + spawns + places + says

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorFailed: 0,
  anchorJoinP95Ms: 3_000,
  waveJoinsA: 32, waveJoinsB: 32, waveJoinsC: 24,
  duelTakeovers: 12,
  ghostClients: 0,        // cyc ids present in any post-wave roster
  finalPresent: 0,        // embodied ids in the final empty-world probe
  arriveDrift: 0,
  leaveDrift: 0,
  pchurnPlaces: 6,        // settled at EXACT last streamed p3
  pballPlaces: 8,
  placeTotal: EXPECT_PLACES,
  ghostLeaseStates: 0,    // lease-state messages after final snapshot
  saysAppended: 3,
  sayP95Ms: 500,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  probeStormP95Ms: 500,
  probeSettledP95Ms: 100, // timer-hygiene proxy: idle loopback envelope
  rssPeakGrowthMB: 60,
  logSuspicious: 0,
  logLineDrift: 0,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  waveA: number; waveB: number; waveC: number; duelTakeovers: number;
  ghostClients: number; finalPresent: number;
  arriveDrift: number; leaveDrift: number;
  pchurnPlaces: number; pchurnPosExact: number; pballPlaces: number; placeTotal: number;
  ghostLeaseStates: number;
  saysAppended: number; sayP95: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeSettledP95: number;
  logSuspicious: number; logLineDrift: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.waveA < TH.waveJoinsA) fail.push(`wave A rejoins ${m.waveA}/32`);
  if (m.waveB < TH.waveJoinsB) fail.push(`wave B rejoins ${m.waveB}/32`);
  if (m.waveC < TH.waveJoinsC) fail.push(`wave C joins ${m.waveC}/24 (12 gen1 + 12 gen2)`);
  if (m.duelTakeovers < TH.duelTakeovers) fail.push(`zombie duels resolved ${m.duelTakeovers}/12 — takeover did not fire`);
  if (m.ghostClients > TH.ghostClients) fail.push(`${m.ghostClients} GHOST CLIENTS: departed cyc ids still in a post-wave roster`);
  if (m.finalPresent > TH.finalPresent) fail.push(`${m.finalPresent} embodied present in the FINAL probe — world not empty after everyone left`);
  if (m.arriveDrift > TH.arriveDrift) fail.push(`cyc arrive drift ${m.arriveDrift} (observed != ${EXPECT_ARRIVES}) — joins lost or doubled`);
  if (m.leaveDrift > TH.leaveDrift) fail.push(`cyc leave drift ${m.leaveDrift} (observed != ${EXPECT_LEAVES}) — ghost leaves or lost leaves`);
  if (m.pballPlaces < TH.pballPlaces) fail.push(`pball leases settled ${m.pballPlaces}/8 on teardown`);
  if (m.pchurnPlaces < TH.pchurnPlaces) fail.push(`pchurn leases settled ${m.pchurnPlaces}/6 — vanishing holder left a live lease`);
  if (m.pchurnPosExact < TH.pchurnPlaces) fail.push(`pchurn settled at wrong transform ${m.pchurnPosExact}/6 exact — settle did not commit last streamed state`);
  if (m.placeTotal !== TH.placeTotal) fail.push(`place verbs ${m.placeTotal} != ${TH.placeTotal} — a lease settled twice or never`);
  if (m.ghostLeaseStates > TH.ghostLeaseStates) fail.push(`${m.ghostLeaseStates} ghost lease states in the final empty world`);
  if (m.saysAppended < TH.saysAppended) fail.push(`mid-wave says ${m.saysAppended}/3 — reconnect storm stalled authored verbs`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`mid-wave say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on anchor spectators`);
  if (m.probeStormP95 > TH.probeStormP95Ms) fail.push(`storm-window HTTP probe p95 ${Math.round(m.probeStormP95)}ms > ${TH.probeStormP95Ms}ms`);
  if (m.probeSettledP95 > TH.probeSettledP95Ms) fail.push(`post-settle HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > ${TH.probeSettledP95Ms}ms — something still churning (timers?)`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`log.jsonl line drift ${m.logLineDrift} vs expected appends`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 45,
    waveA: 32, waveB: 32, waveC: 24, duelTakeovers: 12,
    ghostClients: 0, finalPresent: 0,
    arriveDrift: 0, leaveDrift: 0,
    pchurnPlaces: 6, pchurnPosExact: 6, pballPlaces: 8, placeTotal: 14,
    ghostLeaseStates: 0,
    saysAppended: 3, sayP95: 8,
    fpsP50: 14.6, latP95: 10, gaps: 0,
    probeStormP95: 12, probeSettledP95: 9,
    logSuspicious: 0, logLineDrift: 0, rssPeakGrowth: 9,
  };
  const breached: Measurements = {
    ...healthy,
    duelTakeovers: 7, ghostClients: 3, finalPresent: 5,
    arriveDrift: 2, leaveDrift: 4,
    pballPlaces: 5, pchurnPlaces: 4, pchurnPosExact: 3, placeTotal: 11,
    ghostLeaseStates: 2, saysAppended: 1, sayP95: 900,
    fpsP50: 9, latP95: 400, gaps: 6,
    probeStormP95: 800, probeSettledP95: 300, logLineDrift: 3,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["takeover did not fire", "GHOST CLIENTS", "world not empty", "arrive drift", "leave drift", "pball leases settled", "vanishing holder left a live lease", "wrong transform", "settled twice or never", "ghost lease states", "stalled authored verbs", "say author p95", "fps p50", "frame latency p95", "seq gaps", "storm-window HTTP", "still churning", "line drift"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF + N_GUARD} embodied anchors (16 perf + 8 lease guards) @ ${POSE_HZ}Hz + ${N_SPEC} spectator anchors = 168 persistent; + ${N_CYC} churn identities in 3 waves = 200 peak. t+${SPAWN_AT / 1000}s 14 spawns; t+${CLAIM_AT / 1000}s 8 guard lease claims; t+${WAVE_A / 1000}s WAVE A 32 join→exit(16 clean/16 abrupt); t+${WAVE_B / 1000}s WAVE B 32 rejoin, cyc-0..5 hold pchurn leases, all exit mid-lease (0-2 clean settle-on-close, 3-5 abrupt settle-by-sweep); t+${WAVE_C / 1000}s WAVE C zombie duel: 12 gen1 + 12 same-id gen2 (takeover 4002); t+${TEARDOWN_AT / 1000}s full teardown; t+${FINAL_PROBE_AT / 1000}s empty-world probe. Ghost arithmetic: arrives=${EXPECT_ARRIVES} leaves=${EXPECT_LEAVES} places=${EXPECT_PLACES}. ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=${168 - TH.anchorFailed}/168@p95<${TH.anchorJoinP95Ms}ms waves=${TH.waveJoinsA}/${TH.waveJoinsB}/${TH.waveJoinsC} duels=${TH.duelTakeovers} ghostClients=${TH.ghostClients} finalPresent=${TH.finalPresent} arrive/leaveDrift=${TH.arriveDrift}/${TH.leaveDrift} places pball/pchurn/total=${TH.pballPlaces}/${TH.pchurnPlaces}/${TH.placeTotal}@exact-p3 ghostLeases=${TH.ghostLeaseStates} says=${TH.saysAppended}@p95<${TH.sayP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} probeStorm<${TH.probeStormP95Ms}ms probeSettled<${TH.probeSettledP95Ms}ms logSuspicious=${TH.logSuspicious} logDrift=${TH.logLineDrift} rssPeak<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget: 200 concurrent client sockets must fit ------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (!Number.isFinite(fdLimit) && fdLimit !== Infinity) {
  console.log(`FAIL: file-descriptor limit unparseable ("${fdRaw}") — launch as: ulimit -n 1024 && bun tools/pressure-reconnect.ts`);
  process.exit(2);
}
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-reconnect.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure6-server-${Date.now()}.log`;
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

// ---- client chassis (loadtest/compburst-proven, ghost instruments added) ------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
  closed: boolean; closeCode: number; id: string;
  arrives: string[]; leaves: string[];               // presence broadcasts seen
  leaseStates: { id: string; by: string }[];          // lease state broadcasts
  sayEcho: Map<string, number>;                       // say text -> echo time
  errs: string[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, closeCode: 0, arrives: [], leaves: [], leaseStates: [], sayEcho: new Map(), errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
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
      } else if (m.type === "lease" && m.op === "state") {
        s.leaseStates.push({ id: String(m.id ?? ""), by: String(m.by ?? "") });
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = (ev) => { s.closed = true; s.closeCode = Number(ev.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}
// clean exit: final pose (sleep-where-you-stood), then a Close handshake
function exitClean(s: Spec) {
  try {
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "pose", pose: { p: [40, 0, 40], yaw: 0, speed: 0, clip: "idle" } }));
    s.ws.close();
  } catch { /* already gone */ }
}
// abrupt exit: kill the TCP stream without a Close frame if the runtime allows
// (half-open server-side); fall back to a plain close and say which one ran.
let abruptMethod = "close-fallback";
function exitAbrupt(s: Spec) {
  const w = s.ws as unknown as { terminate?: () => void };
  try {
    if (typeof w.terminate === "function") { w.terminate(); abruptMethod = "terminate"; return; }
  } catch { /* fall through */ }
  try { s.ws.close(); } catch { /* already gone */ }
}

// ---- anchor population --------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, false, i)),
  ...Array.from({ length: N_GUARD }, (_, i) => connect(`guard-${i}`, false, 200 + i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const anchorFailed = all.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const guards = anchors.filter((s) => s.id.startsWith("guard-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const joinTimes = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);
const anchorIds = new Set([...perfs, ...guards].map((s) => s.id));

// embodied presence (identical shape to pressure-1..5): 24 broadcasters @ 15Hz
let running = true;
const posesSent = { n: 0 };
const tickers = [...perfs, ...guards].map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// HTTP event-loop health probe throughout (storm window = waves, settled = post-teardown)
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

// ---- churn bookkeeping --------------------------------------------------------
let waveAJoins = 0, waveBJoins = 0, waveCJoins = 0, duelTakeovers = 0;
const rosterGhosts: string[] = [];                    // cyc ids found in post-wave rosters
const pchurnP3 = Array.from({ length: 6 }, (_, i) => [50 + i * 2, 0, -30 + i]);  // last streamed states
let finalPresent = -1, ghostLeaseStates = -1;
const saysAppendedArr: boolean[] = [];
const sayLat: number[] = [];

// roster probe: fresh spectator reads present[], returns embodied id set
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

// t+2.0s: spawn the lease targets (verb budget: perf-0 6, perf-1 4, perf-2 4)
at(SPAWN_AT, () => {
  const spawn = (s: Spec | undefined, id: string, pos: number[]) => {
    if (s && s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id, lib: "deco/bench.glb", pos, yaw: 0 } }));
  };
  for (let i = 0; i < 6; i++) spawn(perfs[0], `pchurn-${i}`, [50 + i * 2, 0, -30 + i]);
  for (let i = 0; i < 4; i++) spawn(perfs[1], `pball-${i}`, [i * 2 - 6, 0, -8]);
  for (let i = 4; i < 8; i++) spawn(perfs[2], `pball-${i}`, [i * 2 - 6, 0, -8]);
});

// t+3.5s: guards claim pball-i and stream lease state @10Hz until teardown
at(CLAIM_AT, () => {
  guards.forEach((g, i) => {
    if (g.ws.readyState === 1) g.ws.send(JSON.stringify({ type: "lease", op: "claim", id: `pball-${i}` }));
  });
  tickers.push(...guards.map((g, i) => setInterval(() => {
    if (!running || g.ws.readyState !== 1) return;
    const t = Date.now() / 1000;
    g.ws.send(JSON.stringify({ type: "lease", op: "state", id: `pball-${i}`, p: [i * 2 - 6 + Math.sin(t) * 0.5, 0, -8 + Math.cos(t) * 0.5], yaw: t % 6.28 }));
  }, 1000 / LEASE_HZ)));
});

// wave runner: N cyc ids join, stream @15Hz, exit at +holdMs (mixed clean/abrupt)
function runWave(ids: string[], atMs: number, holdMs: number, onJoined?: (specs: Spec[]) => void, exitOverride?: (s: Spec, idx: number) => void) {
  at(atMs, async () => {
    const joined = await Promise.allSettled(ids.map((id) => connect(id, false, 300)));
    const ss = joined.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
    ss.forEach((s, i) => {
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
    return ss.length;
  });
}

// WAVE A (t+6s): 32 join, exit +1.2s — 16 clean / 16 abrupt
runWave(Array.from({ length: N_CYC }, (_, i) => `cyc-${i}`), WAVE_A, 1_200,
  (ss) => { waveAJoins = ss.length; });
at(WAVE_A + 2_500, async () => checkRoster(await rosterProbe("postA"), "postA"));

// WAVE B (t+9s): same ids rejoin; cyc-0..5 claim pchurn, stream 3 states, all
// exit mid-lease at +1.2s — cyc-0..2 clean (settle-on-close), cyc-3..5 abrupt
// (settle-by-stale-sweep). Everyone else mixed clean/abrupt.
runWave(Array.from({ length: N_CYC }, (_, i) => `cyc-${i}`), WAVE_B, 1_200,
  (ss) => {
    waveBJoins = ss.length;
    ss.slice(0, 6).forEach((s, i) => {
      if (s.ws.readyState !== 1) return;
      s.ws.send(JSON.stringify({ type: "lease", op: "claim", id: `pchurn-${i}` }));
      // 3 states at +600/+900/+1200ms: p1, p2, p3 (p3 = settle expectation)
      at(WAVE_B + 600, () => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "lease", op: "state", id: `pchurn-${i}`, p: [50 + i * 2, 0, -31 + i] })); });
      at(WAVE_B + 900, () => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "lease", op: "state", id: `pchurn-${i}`, p: [50 + i * 2 + 0.5, 0, -30.5 + i] })); });
      at(WAVE_B + 1_150, () => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "lease", op: "state", id: `pchurn-${i}`, p: [...pchurnP3[i]] })); });
    });
  },
  (s, i) => { if (i < 6 && i % 3 === 0) exitClean(s); else if (i < 6) exitAbrupt(s); else if (i % 2 === 0) exitClean(s); else exitAbrupt(s); });
at(WAVE_B + 2_500, async () => checkRoster(await rosterProbe("postB"), "postB"));

// WAVE C (t+12s): zombie duel — gen1 joins, +0.6s SAME ids join again with
// gen1 still open. Server must take over (gen1 closes 4002), roster stays 1/id.
at(WAVE_C, async () => {
  const gen1 = await Promise.allSettled(Array.from({ length: N_DUEL }, (_, i) => connect(`cyc-${i}`, false, 400 + i)));
  const g1 = gen1.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
  waveCJoins += g1.length;
  at(WAVE_C + 600, async () => {
    const gen2 = await Promise.allSettled(Array.from({ length: N_DUEL }, (_, i) => connect(`cyc-${i}`, false, 500 + i)));
    const g2 = gen2.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
    waveCJoins += g2.length;
    // takeover proof: gen1 sockets closed by the server with 4002
    await sleep(400);
    duelTakeovers = g1.filter((s) => s.closed && s.closeCode === 4002).length;
    at(WAVE_C + 1_800, () => g2.forEach((s, i) => (i % 2 === 0 ? exitClean(s) : exitAbrupt(s))));
  });
});
at(WAVE_C + 3_000, async () => checkRoster(await rosterProbe("postC"), "postC"));

// fairness: one anchor say per wave, mid-storm
const SAY_TEXTS = [`storm-a-${Math.floor(t0)}`, `storm-b-${Math.floor(t0)}`, `storm-c-${Math.floor(t0)}`];
[SAY_TEXTS[0], SAY_TEXTS[1], SAY_TEXTS[2]].forEach((text, i) => {
  const when = [WAVE_A + 500, WAVE_B + 500, WAVE_C + 700][i];
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

// t+20s: TEARDOWN — anchors leave cleanly (guard leases settle on close).
// This also ends the frame stream (dirty-pose batching: no broadcasters, no
// frames), so per-spectator fps must divide by the CONNECTED window, not the
// whole run — 20s of frames over a 29s divisor reads as a false 10fps.
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  anchors.forEach((s) => { try { s.ws.close(); } catch {} });
});

// t+26.5s: FINAL PROBE — the empty world. One spectator joins: present must be
// EMPTY and no lease-state message may follow the snapshot.
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

// ---- world-log ground truth ---------------------------------------------------
const worldLogPath = `${WORLDS}/${WORLD}/log.jsonl`;
let placeTotal = -1, pballPlaces = 0, pchurnPlaces = 0, pchurnPosExact = 0, logTotalLines = -1, logLineDriftVal = 999;
if (existsSync(worldLogPath)) {
  const wl = readFileSync(worldLogPath, "utf8").split("\n").filter(Boolean);
  logTotalLines = wl.length;
  logLineDriftVal = Math.abs(logTotalLines - EXPECT_LOG_LINES);
  const places = wl.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((e) => e?.verb === "place");
  placeTotal = places.length;
  for (const e of places) {
    const id = String(e.args?.id ?? "");
    if (id.startsWith("pball-")) pballPlaces++;
    if (id.startsWith("pchurn-")) {
      pchurnPlaces++;
      const i = Number(id.slice(7));
      const got = e.args?.pos, want = pchurnP3[i];
      if (Array.isArray(got) && want && got.length === 3 && got.every((v: number, k: number) => v === want[k])) pchurnPosExact++;
    }
  }
}

// ghost arithmetic from the one spectator who saw every broadcast
const SEER = specs[0];
const cycArrives = SEER ? SEER.arrives.filter((id) => id.startsWith("cyc-")).length : -1;
const cycLeaves = SEER ? SEER.leaves.filter((id) => id.startsWith("cyc-")).length : -1;
const arriveDrift = cycArrives < 0 ? 999 : Math.abs(cycArrives - EXPECT_ARRIVES);
const leaveDrift = cycLeaves < 0 ? 999 : Math.abs(cycLeaves - EXPECT_LEAVES);

const endAt = performance.now();
// connected window per spectator: snapshot → teardown (frames flow only while
// an embodied population exists; the -500ms shaves the settle ramp)
const frameWindowMs = (teardownAtTs || endAt) - 500;
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  waveA: waveAJoins, waveB: waveBJoins, waveC: waveCJoins, duelTakeovers,
  ghostClients: rosterGhosts.filter((g) => !g.startsWith("MISSING:")).length,
  finalPresent: Math.max(finalPresent, 0) === finalPresent ? finalPresent : 999,
  arriveDrift, leaveDrift,
  pchurnPlaces, pchurnPosExact, pballPlaces, placeTotal,
  ghostLeaseStates: ghostLeaseStates < 0 ? 999 : ghostLeaseStates,
  saysAppended: saysAppendedArr.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  logSuspicious: suspicious.length, logLineDrift: logLineDriftVal, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n} (abrupt-exit method: ${abruptMethod})
  anchor joins          ${anchors.length}/${all.length} — p95 ${Math.round(m.anchorJoinP95)}ms
  wave joins            A ${waveAJoins}/32  B ${waveBJoins}/32  C ${waveCJoins}/24
  zombie takeovers      ${duelTakeovers}/12 gen1 sockets closed 4002
  roster ghosts         ${rosterGhosts.length} across 3 post-wave probes${rosterGhosts.length ? ` — ${rosterGhosts.slice(0, 8).join(",")}` : ""}
  final present         ${finalPresent} embodied (must be 0)
  ghost lease states    ${ghostLeaseStates} after final snapshot (must be 0)
  cyc arrive/leave      ${cycArrives}/${EXPECT_ARRIVES} arrives (drift ${arriveDrift})  ${cycLeaves}/${EXPECT_LEAVES} leaves (drift ${leaveDrift})
  lease settlements     pchurn ${pchurnPlaces}/6 (${pchurnPosExact} at exact p3)  pball ${pballPlaces}/8  total ${placeTotal}/${EXPECT_PLACES}
  mid-wave says         ${saysAppendedArr.filter(Boolean).length}/3 appended — author p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchor spectators
  http probe ms         storm p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length})  settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})  errors ${probeErrors.n}
  world log             ${logTotalLines} lines vs expected ${EXPECT_LOG_LINES} (drift ${logLineDriftVal})
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
if (rosterGhosts.length) console.log(`roster findings:\n  ${rosterGhosts.slice(0, 12).join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — reconnect storms leave no ghost clients, leases, or state`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
