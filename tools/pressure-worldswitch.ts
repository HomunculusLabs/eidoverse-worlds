// Pressure scenario 7: WORLD SWITCHING CANCELS OLD-WORLD TRAFFIC AND STATE
// PROMPTLY. Design target: 24 embodied performers + spectators across worlds.
// Travel is "leave A, join B" on ONE live socket (server.ts join handler,
// c.world block). The close handler does TWO durable acts a traveler bypasses:
//   1. settleLease for every lease the departing client holds (close:302-304)
//   2. rememberPose — "sleep where you stood" (close:318-322)
// This harness measures whether the TRAVEL path does both, promptly, plus the
// traffic-cancellation basics: one leave broadcast per traveler in A, one
// arrive in B, exact rosters, no departed-traveler presence frames after
// settle, and both worlds empty (0 ghosts, 0 ghost leases) after teardown.
//
// Population (pinned before measuring — 200 peak concurrent sockets):
//   world alpha: 24 perf (embodied @15Hz) + 24 trav (embodied @15Hz) + 150
//   spectator anchors = 198.  world beta: 2 observer spectators.
//
// Phases:
//   t=2.0s   8 prop spawns in alpha (verb budget split perf-0/1)
//   t=3.5s   trav-0..7 claim props, stream 3 lease states (p1,p2,p3)
//   t=5.0s   TRAVEL WAVE — all 24 trav send join{world:beta} on the SAME
//            socket, then stream presence in beta. GATES: B snapshot < 3s,
//            exactly 24 leave broadcasts in A (no doubles), 24 arrives in B,
//            all 8 leases RELEASED within 2.5s of travel (prompt settle —
//            the stale sweep alone settles at 5-15s and FAILS this), and the
//            place commits land at the EXACT last streamed p3, once each.
//   t=7.5s   roster probe A: exactly the 24 perf ids (travelers all gone).
//   t=9.0s   RETURN WAVE — trav-0..3 join{world:alpha} again. GATE: each
//            snapshot.restore.p == the last pose they streamed in A (settled
//           Pose) — "sleep where you stood" must survive travel, not just
//            socket close. Baseline expectation: restore is null (travel
//            never remembers) → RED.
//   t=5.5-19s ghost-frame watch: NO alpha frame may carry a departed
//            traveler id (trav-4..23) after the settle window.
//   t=12.0s  fairness says: perf-3 in alpha + trav-10 in beta, both appended.
//   t=19.0s  rosters: A = 24 perf + 4 returned (28); B = 20 travelers.
//   t=21.0s  TEARDOWN — everyone closes cleanly.
//   t=27.0s  FINAL PROBES — one spectator joins EACH world: present EMPTY,
//            0 lease-state messages after either snapshot.
//
// Acceptance gates (pinned before measuring — see TH):
//   SERVER_DIR=/tmp/pressure7-d29ba072 PORT=8994 bun tools/pressure-worldswitch.ts
//   SELFTEST=1 bun tools/pressure-worldswitch.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure7-d29ba072";
const PORT = Number(process.env.PORT ?? 8994);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure7-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD_A = "alpha", WORLD_B = "beta";
const N_PERF = 24, N_TRAV = 24, N_SPEC = 150, N_OBS = 2;   // 198 + 2 = 200 peak
const POSE_HZ = 15;
const SPAWN_AT = 2_000, CLAIM_AT = 3_500, TRAVEL_AT = 5_000;
const RETURN_AT = 9_000, TEARDOWN_AT = 21_000, FINAL_AT = 27_000;
const DURATION = 29_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..6
const SELFTEST = process.env.SELFTEST === "1";

// expected world-log lines (ground truth, both worlds):
//   alpha: genesis + grant(first embodied joiner) + 8 spawns + 8 lease places + 1 say
//   beta:  genesis + grant(first traveler) + 1 say
const EXPECT_A_LINES = 2 + 8 + 8 + 1;
const EXPECT_B_LINES = 2 + 1;
// last streamed lease states (settle expectation): p3 per prop
const P3 = Array.from({ length: 8 }, (_, i) => [60 + i * 2, 0, -30 + i]);
// last alpha poses per traveler (restore expectation) — recorded live
const TH = {
  anchorFailed: 0,
  anchorJoinP95Ms: 3_000,
  travelSnaps: 24, travelSnapP95Ms: 3_000,
  returnSnaps: 4,
  aLeaveDrift: 0,            // exactly 24 leave broadcasts, no doubles/loss
  bArriveDrift: 0,           // exactly 24 arrive broadcasts in beta
  leasePromptMs: 2_500,      // released within 2.5s of the travel send
  leasePlaces: 8, leasePosExact: 8, leasePlaceTotal: 8,   // once each, at p3
  restoreExact: 4,           // returned travelers wake at last alpha pose
  ghostFrames: 0,            // departed-traveler ids in alpha frames
  rosterA_mid: 24,           // post-travel: perf only
  rosterA_late: 28,          // perf + 4 returned
  rosterB_late: 20,
  finalPresentA: 0, finalPresentB: 0, ghostLeaseStates: 0,
  saysAppended: 2, sayP95Ms: 500,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250, seqGaps: 0,
  probeStormP95Ms: 500, probeSettledP95Ms: 100,
  rssPeakGrowthMB: 60,
  logSuspicious: 0, logDriftA: 0, logDriftB: 0,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  travelSnaps: number; travelSnapP95: number; returnSnaps: number;
  aLeaveDrift: number; bArriveDrift: number;
  leasePrompt: number; leaseReleased: number;
  leasePlaces: number; leasePosExact: number; leasePlaceTotal: number;
  restoreExact: number;
  ghostFrames: number;
  rosterA_mid: number; rosterA_late: number; rosterB_late: number;
  finalPresentA: number; finalPresentB: number; ghostLeaseStates: number;
  saysAppended: number; sayP95: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeSettledP95: number;
  logSuspicious: number; logDriftA: number; logDriftB: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.travelSnaps < TH.travelSnaps) fail.push(`travel snapshots into beta ${m.travelSnaps}/24 — travel join did not complete`);
  if (m.travelSnapP95 > TH.travelSnapP95Ms) fail.push(`travel snapshot p95 ${Math.round(m.travelSnapP95)}ms > ${TH.travelSnapP95Ms}ms`);
  if (m.returnSnaps < TH.returnSnaps) fail.push(`return snapshots into alpha ${m.returnSnaps}/4`);
  if (m.aLeaveDrift > TH.aLeaveDrift) fail.push(`alpha leave drift ${m.aLeaveDrift} (want exactly 24) — lost or doubled leave broadcasts`);
  if (m.bArriveDrift > TH.bArriveDrift) fail.push(`beta arrive drift ${m.bArriveDrift} (want exactly 24)`);
  if (m.leaseReleased < TH.leasePlaces) fail.push(`traveling holders' leases released ${m.leaseReleased}/8 — old-world lease outlived the switch`);
  if (m.leasePrompt > TH.leasePromptMs) fail.push(`lease release latency ${Math.round(m.leasePrompt)}ms > ${TH.leasePromptMs}ms — settle NOT prompt (stale-sweep fallback, 5-15s class)`);
  if (m.leasePlaces < TH.leasePlaces) fail.push(`lease place commits ${m.leasePlaces}/8 in alpha log`);
  if (m.leasePosExact < TH.leasePosExact) fail.push(`lease settles at exact last streamed p3 ${m.leasePosExact}/8`);
  if (m.leasePlaceTotal !== TH.leasePlaceTotal) fail.push(`lease place total ${m.leasePlaceTotal} != ${TH.leasePlaceTotal} — settled twice or never`);
  if (m.restoreExact < TH.restoreExact) fail.push(`returned travelers restored at last alpha pose ${m.restoreExact}/4 — travel did not rememberPose (wake-at-null/stale class)`);
  if (m.ghostFrames > TH.ghostFrames) fail.push(`${m.ghostFrames} alpha frames carried a DEPARTED traveler after settle — old-world presence traffic not cancelled`);
  if (m.rosterA_mid !== TH.rosterA_mid) fail.push(`post-travel alpha roster ${m.rosterA_mid} != ${TH.rosterA_mid} (24 perf only)`);
  if (m.rosterA_late !== TH.rosterA_late) fail.push(`late alpha roster ${m.rosterA_late} != ${TH.rosterA_late} (24 perf + 4 returned)`);
  if (m.rosterB_late !== TH.rosterB_late) fail.push(`late beta roster ${m.rosterB_late} != ${TH.rosterB_late} (20 travelers)`);
  if (m.finalPresentA > TH.finalPresentA) fail.push(`final alpha present ${m.finalPresentA} — world not empty`);
  if (m.finalPresentB > TH.finalPresentB) fail.push(`final beta present ${m.finalPresentB} — world not empty`);
  if (m.ghostLeaseStates > TH.ghostLeaseStates) fail.push(`${m.ghostLeaseStates} ghost lease states after final snapshots`);
  if (m.saysAppended < TH.saysAppended) fail.push(`mid-travel says ${m.saysAppended}/2 — travel stalled authored verbs`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`alpha spectator fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps`);
  if (m.probeStormP95 > TH.probeStormP95Ms) fail.push(`storm-window HTTP probe p95 ${Math.round(m.probeStormP95)}ms > ${TH.probeStormP95Ms}ms`);
  if (m.probeSettledP95 > TH.probeSettledP95Ms) fail.push(`post-settle HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > ${TH.probeSettledP95Ms}ms`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.logDriftA > TH.logDriftA) fail.push(`alpha log line drift ${m.logDriftA}`);
  if (m.logDriftB > TH.logDriftB) fail.push(`beta log line drift ${m.logDriftB}`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 40,
    travelSnaps: 24, travelSnapP95: 30, returnSnaps: 4,
    aLeaveDrift: 0, bArriveDrift: 0,
    leasePrompt: 8, leaseReleased: 8,
    leasePlaces: 8, leasePosExact: 8, leasePlaceTotal: 8,
    restoreExact: 4,
    ghostFrames: 0,
    rosterA_mid: 24, rosterA_late: 28, rosterB_late: 20,
    finalPresentA: 0, finalPresentB: 0, ghostLeaseStates: 0,
    saysAppended: 2, sayP95: 9,
    fpsP50: 14.6, latP95: 12, gaps: 0,
    probeStormP95: 11, probeSettledP95: 4,
    logSuspicious: 0, logDriftA: 0, logDriftB: 0, rssPeakGrowth: 10,
  };
  const breached: Measurements = {
    ...healthy,
    travelSnaps: 19, travelSnapP95: 4_100, returnSnaps: 2,
    aLeaveDrift: 3, bArriveDrift: 2,
    leasePrompt: 7_800, leaseReleased: 5,
    leasePlaces: 6, leasePosExact: 5, leasePlaceTotal: 6,
    restoreExact: 0,
    ghostFrames: 4,
    rosterA_mid: 27, rosterA_late: 24, rosterB_late: 24,
    finalPresentA: 2, finalPresentB: 1, ghostLeaseStates: 1,
    saysAppended: 1, sayP95: 800,
    fpsP50: 9, latP95: 400, gaps: 3,
    probeStormP95: 900, probeSettledP95: 300, logDriftA: 2, logDriftB: 1,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["travel snapshots into beta", "travel snapshot p95", "return snapshots", "leave drift", "arrive drift", "lease outlived", "settle NOT prompt", "lease place commits", "exact last streamed p3", "settled twice or never", "rememberPose", "DEPARTED traveler", "post-travel alpha roster", "late alpha roster", "late beta roster", "alpha present", "beta present", "ghost lease states", "stalled authored verbs", "say author p95", "fps p50", "latency p95", "seq gaps", "storm-window HTTP", "post-settle HTTP", "alpha log line drift", "beta log line drift"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: alpha = ${N_PERF} perf + ${N_TRAV} travelers embodied @${POSE_HZ}Hz + ${N_SPEC} spectators (198); beta = ${N_OBS} observers. t+${SPAWN_AT / 1000}s 8 spawns; t+${CLAIM_AT / 1000}s trav-0..7 claim props (3 states each); t+${TRAVEL_AT / 1000}s TRAVEL WAVE all 24 -> beta on live sockets (gates: snapshot<3s, 24 leaves in alpha, 24 arrives in beta, 8 leases released <=${TH.leasePromptMs}ms at exact p3 once each); t+${RETURN_AT / 1000}s RETURN trav-0..3 (restore == last alpha pose, 4/4); ghost-frame watch on departed travelers; t+${TEARDOWN_AT / 1000}s teardown; t+${FINAL_AT / 1000}s empty-world probes BOTH worlds. Logs: alpha ${EXPECT_A_LINES} lines, beta ${EXPECT_B_LINES}. ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=200@p95<${TH.anchorJoinP95Ms}ms travelSnaps=${TH.travelSnaps}@p95<${TH.travelSnapP95Ms}ms leaves/arrives drift 0 leasePrompt<${TH.leasePromptMs}ms places=${TH.leasePlaces}@exact-p3-once restore=${TH.restoreExact}/4 ghostFrames=${TH.ghostFrames} rosters ${TH.rosterA_mid}/${TH.rosterA_late}/${TH.rosterB_late} finals 0/0/0 says=${TH.saysAppended}@p95<${TH.sayP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=0 probes<${TH.probeStormP95Ms}/${TH.probeSettledP95Ms}ms logDrift=0 rss<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-worldswitch.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure7-server-${Date.now()}.log`;
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
  try { const res = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD_A}`); ready = res.status > 0; } catch { /* booting */ }
}
if (!ready) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }
const rssReady = rss();
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (log: ${logPath})`);

// ---- client chassis -----------------------------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; snapAt: number; snapWorld: string; restore: any;
  closed: boolean; id: string; world: string;
  leaves: string[]; arrives: string[];               // presence broadcasts seen
  leaseEvents: { op: string; id: string; at: number }[];
  frameIds: { id: string; at: number }[];             // traveler ids seen in frames
  sayEcho: Map<string, number>; errs: string[];
};
function connect(id: string, world: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], snapAt: 0, snapWorld: "", restore: null, closed: false, world, leaves: [], arrives: [], leaseEvents: [], frameIds: [], sayEcho: new Map(), errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapAt = performance.now(); s.joinMs = s.snapAt - (s as any).openAt2!;
        if (!(s as any).openAt2) s.joinMs = -1;
        s.snapWorld = String(m.world ?? ""); s.restore = m.restore ?? null;
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++; s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
        for (const k of Object.keys(m.poses ?? {})) if (k.startsWith("trav-")) s.frameIds.push({ id: k, at: performance.now() });
      } else if (m.type === "arrive") s.arrives.push(String(m.id ?? ""));
      else if (m.type === "leave") s.leaves.push(String(m.id ?? ""));
      else if (m.type === "lease") s.leaseEvents.push({ op: String(m.op ?? ""), id: String(m.id ?? ""), at: performance.now() });
      else if (m.type === "log" && m.entry?.verb === "say") { if (!s.sayEcho.has(m.entry.args?.text)) s.sayEcho.set(m.entry.args?.text, performance.now()); }
      else if (m.type === "error") s.errs.push(String(m.error ?? ""));
    };
    (s as any).openAt2 = performance.now();
    s.joinMs = -1; // recomputed below
    ws.onclose = () => { s.closed = true; };
    ws.onerror = () => { /* close follows */ };
    // recompute joinMs correctly: open->snapshot
    const origResolve = resolve;
    resolve = ((v: Spec) => { v.joinMs = v.snapAt - (v as any).openAt2; origResolve(v); }) as any;
  });
}
// clean re-join (travel): send join for the NEW world on the same socket
function travel(s: Spec, world: string): Promise<void> {
  return new Promise((resolve) => {
    const prevSnapAt = s.snapAt;
    const iv = setInterval(() => {
      if (s.snapWorld === world && s.snapAt !== prevSnapAt) { clearInterval(iv); resolve(); }
      if (s.closed) { clearInterval(iv); resolve(); }
    }, 25);
    setTimeout(() => { clearInterval(iv); resolve(); }, 10_000);
    if (s.ws.readyState === 1) {
      s.world = world;
      s.ws.send(JSON.stringify({ type: "join", world, id: s.id, avatar: "x.vrm", spectate: false, token: TOKEN }));
    } else { clearInterval(iv); resolve(); }
  });
}

// ---- anchor population --------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, WORLD_A, false, i)),
  ...Array.from({ length: N_TRAV }, (_, i) => connect(`trav-${i}`, WORLD_A, false, 100 + i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, WORLD_A, true)),
  ...Array.from({ length: N_OBS }, (_, i) => connect(`obs-${i}`, WORLD_B, true)),
]);
const anchors = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const anchorFailed = all.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const travs = anchors.filter((s) => s.id.startsWith("trav-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const obs = anchors.filter((s) => s.id.startsWith("obs-"));
const joinTimes = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);
const perfIds = new Set(perfs.map((s) => s.id));

// embodied presence in alpha (48 broadcasters @15Hz) + travelers later in beta
let running = true;
const tickers: any[] = [];
const lastAPose = new Map<string, number[]>();        // traveler -> last alpha p
for (const s of [...perfs, ...travs]) {
  const i = Number(s.id.split("-")[1]);
  tickers.push(setInterval(() => {
    if (!running || s.ws.readyState !== 1) return;
    const t = Date.now() / 1000 + i;
    const p = s.world === WORLD_A ? [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10] : [Math.sin(t * 0.7 + i) * 6, 0, Math.cos(t * 0.7 + i) * 6];
    if (s.world === WORLD_A) lastAPose.set(s.id, p);
    s.ws.send(JSON.stringify({ type: "pose", pose: { p, yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  }, 1000 / POSE_HZ));
}

// HTTP event-loop probes (storm = through teardown, settled = after)
const probeStorm: number[] = [], probeSettled: number[] = [];
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD_A}`); await r.arrayBuffer(); } catch { /* counted by absence */ }
  (performance.now() - t0 < TEARDOWN_AT ? probeStorm : probeSettled).push(performance.now() - t);
}, 500);
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- scenario bookkeeping -----------------------------------------------------
const SEER = specs[0];        // alpha: sees every leave/lease broadcast
const BOBS = obs[0];          // beta: sees every arrive
let travelSnaps = 0; const travelSnapMs: number[] = [];
let returnSnaps = 0; let restoreExact = 0;
const leaseReleaseMs = new Map<string, number>();     // prop id -> ms from travel send
let travelSendAt = 0;
let teardownAtTs = 0;

// t+2.0s: spawn 8 props (verb budget split perf-0/perf-1)
at(SPAWN_AT, () => {
  for (let i = 0; i < 8; i++) {
    const s = i < 4 ? perfs[0] : perfs[1];
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: `pobj-${i}`, lib: "deco/bench.glb", pos: [...P3[i]], yaw: 0 } }));
  }
});
// t+3.5s: trav-0..7 claim props; 3 states each (p1, p2, p3)
at(CLAIM_AT, () => {
  travs.slice(0, 8).forEach((s, i) => {
    if (s.ws.readyState !== 1) return;
    s.ws.send(JSON.stringify({ type: "lease", op: "claim", id: `pobj-${i}` }));
    at(CLAIM_AT + 400, () => { if (s.ws.readyState === 1 && s.world === WORLD_A) s.ws.send(JSON.stringify({ type: "lease", op: "state", id: `pobj-${i}`, p: [P3[i][0] - 1, 0, P3[i][2] ] })); });
    at(CLAIM_AT + 700, () => { if (s.ws.readyState === 1 && s.world === WORLD_A) s.ws.send(JSON.stringify({ type: "lease", op: "state", id: `pobj-${i}`, p: [P3[i][0] - 0.5, 0, P3[i][2]] })); });
    at(CLAIM_AT + 1_150, () => { if (s.ws.readyState === 1 && s.world === WORLD_A) s.ws.send(JSON.stringify({ type: "lease", op: "state", id: `pobj-${i}`, p: [...P3[i]] })); });
  });
});
// t+5.0s: TRAVEL WAVE — all 24 -> beta on the same socket
at(TRAVEL_AT, async () => {
  travelSendAt = performance.now();
  await Promise.all(travs.map((s) => travel(s, WORLD_B)));
  for (const s of travs) if (s.snapWorld === WORLD_B && !s.closed) {
    travelSnaps++;
    travelSnapMs.push(s.snapAt - travelSendAt);
  }
});
// t+7.5s: alpha roster probe — exactly the 24 perf ids
let rosterA_mid = -1;
at(TRAVEL_AT + 2_500, async () => {
  const set = await rosterProbe(WORLD_A, "midA");
  const ghosts = [...set].filter((id) => !perfIds.has(id));
  const missing = [...perfIds].filter((id) => !set.has(id));
  rosterA_mid = set.size - ghosts.length + missing.length === perfIds.size && ghosts.length === 0 && missing.length === 0 ? perfIds.size : (set.size - missing.length + ghosts.length * 1000);
  console.log(`roster midA: ${set.size} embodied (${ghosts.length} ghosts: ${ghosts.slice(0, 6).join(",")}${ghosts.length ? "" : ""}, ${missing.length} missing)`);
});
// t+9.0s: RETURN WAVE — trav-0..3 back to alpha; restore gate
at(RETURN_AT, async () => {
  const four = travs.slice(0, 4);
  await Promise.all(four.map((s) => travel(s, WORLD_A)));
  for (const s of four) {
    if (s.snapWorld !== WORLD_A || s.closed) continue;
    returnSnaps++;
    const want = lastAPose.get(s.id);
    const got = s.restore?.p;
    if (Array.isArray(got) && want && got.length === 3 && got.every((v: number, k: number) => Math.abs(v - want[k]) < 0.75)) restoreExact++;
    else console.log(`  restore miss ${s.id}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
  }
});
// t+12.0s: fairness says — perf-3 in alpha, trav-10 in beta
const SAY_A = `ws-a-${Math.floor(t0)}`, SAY_B = `ws-b-${Math.floor(t0)}`;
const saysOk: boolean[] = []; const sayLat: number[] = [];
at(12_000, () => {
  const send = (s: Spec | undefined, text: string) => {
    if (!s || s.ws.readyState !== 1) return;
    const sentAt = performance.now();
    s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(13_500, () => { const hit = s.sayEcho.get(text); saysOk.push(hit !== undefined); if (hit !== undefined) sayLat.push(hit - sentAt); });
  };
  send(perfs[3], SAY_A); send(travs[10], SAY_B);
});
// t+19.0s: late rosters
let rosterA_late = -1, rosterB_late = -1;
at(19_000, async () => {
  const a = await rosterProbe(WORLD_A, "lateA");
  const b = await rosterProbe(WORLD_B, "lateB");
  const wantA = new Set([...perfIds, "trav-0", "trav-1", "trav-2", "trav-3"]);
  const wantB = new Set(travs.slice(4).map((s) => s.id));
  const eq = (got: Set<string>, want: Set<string>) => got.size === want.size && [...want].every((x) => got.has(x));
  rosterA_late = eq(a, wantA) ? wantA.size : a.size;
  rosterB_late = eq(b, wantB) ? wantB.size : b.size;
  console.log(`roster lateA: ${a.size} (want ${wantA.size})  lateB: ${b.size} (want ${wantB.size})`);
});
// t+21.0s: TEARDOWN
at(TEARDOWN_AT, () => { running = false; teardownAtTs = performance.now(); anchors.forEach((s) => { try { s.ws.close(); } catch {} }); });
// t+27.0s: FINAL empty-world probes on BOTH worlds
let finalPresentA = -1, finalPresentB = -1, ghostLeaseStates = -1;
at(FINAL_AT, () => {
  let n = 0;
  const probe = (world: string, k: (v: number) => void) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} k(999); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id: `final-${world}-${Math.floor(t0)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { clearTimeout(to); k((m.present ?? []).length); }
      else if (m.type === "lease" && m.op === "state") ghostLeaseStates = (ghostLeaseStates < 0 ? 1 : ghostLeaseStates + 1);
    };
    setTimeout(() => { clearTimeout(to); try { ws.close(); } catch {} }, 3_000);
  };
  probe(WORLD_A, (v) => { finalPresentA = v; if (++n === 2) ghostLeaseStates = Math.max(ghostLeaseStates, 0); });
  probe(WORLD_B, (v) => { finalPresentB = v; if (++n === 2) ghostLeaseStates = Math.max(ghostLeaseStates, 0); });
});

async function rosterProbe(world: string, label: string): Promise<Set<string>> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(new Set([`PROBE-TIMEOUT-${label}`])); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id: `roster-${label}-${Math.floor(Math.random() * 1e6)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { clearTimeout(to); try { ws.close(); } catch {} resolve(new Set((m.present ?? []).map((o: any) => String(o.id)))); }
    };
    ws.onerror = () => { clearTimeout(to); resolve(new Set([`PROBE-ERROR-${label}`])); };
  });
}

await sleep(DURATION);
tickers.forEach(clearInterval);
clearInterval(probeTimer); clearInterval(rssTimer);
await sleep(300);

// ---- world-log ground truth ---------------------------------------------------
function logFacts(world: string, expectLines: number) {
  const p = `${WORLDS}/${world}/log.jsonl`;
  if (!existsSync(p)) return { drift: 999, places: 0, posExact: 0, placeTotal: 0 };
  const wl = readFileSync(p, "utf8").split("\n").filter(Boolean);
  const drift = Math.abs(wl.length - expectLines);
  const places = wl.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((e) => e?.verb === "place");
  let posExact = 0;
  for (const e of places) {
    const i = Number(String(e.args?.id ?? "").slice(5));
    const got = e.args?.pos;
    if (Array.isArray(got) && P3[i] && got.length === 3 && got.every((v: number, k: number) => v === P3[i][k])) posExact++;
  }
  return { drift, places: places.filter((e) => String(e.args?.id ?? "").startsWith("pobj-")).length, posExact, placeTotal: places.length };
}
const fa = logFacts(WORLD_A, EXPECT_A_LINES), fb = logFacts(WORLD_B, EXPECT_B_LINES);

// ---- derive measurements ------------------------------------------------------
const aTravLeaves = SEER ? SEER.leaves.filter((id) => id.startsWith("trav-")).length : -1;
const bTravArrives = BOBS ? BOBS.arrives.filter((id) => id.startsWith("trav-")).length : -1;
const aLeaveDrift = aTravLeaves < 0 ? 999 : Math.abs(aTravLeaves - N_TRAV);
const bArriveDrift = bTravArrives < 0 ? 999 : Math.abs(bTravArrives - N_TRAV);
// lease release latency per prop, from the alpha seer's lease events
const settleWindowStart = travelSendAt || Infinity;
let leaseReleased = 0; const promptArr: number[] = [];
if (SEER) for (let i = 0; i < 8; i++) {
  const evs = SEER.leaseEvents.filter((e) => e.id === `pobj-${i}` && e.op === "released" && e.at >= settleWindowStart);
  if (evs.length) { leaseReleased++; promptArr.push(evs[0].at - settleWindowStart); }
}
const leasePrompt = promptArr.length ? Math.max(...promptArr) : Infinity;
// ghost frames: departed travelers (trav-4..23) in alpha frames after settle (+2s past travel)
const departed = new Set(travs.slice(4).map((s) => s.id));
let ghostFrames = 0;
if (SEER) for (const f of SEER.frameIds) if (departed.has(f.id) && f.at > settleWindowStart + 2_000) ghostFrames++;
// presence health over the connected window
const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const log = await logFile.text();
const suspicious = log.split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  travelSnaps, travelSnapP95: pct(travelSnapMs, 95), returnSnaps,
  aLeaveDrift, bArriveDrift,
  leasePrompt, leaseReleased,
  leasePlaces: fa.places, leasePosExact: fa.posExact, leasePlaceTotal: fa.placeTotal,
  restoreExact, ghostFrames,
  rosterA_mid, rosterA_late, rosterB_late,
  finalPresentA: finalPresentA < 0 ? 999 : finalPresentA, finalPresentB: finalPresentB < 0 ? 999 : finalPresentB,
  ghostLeaseStates: ghostLeaseStates < 0 ? 999 : ghostLeaseStates,
  saysAppended: saysOk.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  logSuspicious: suspicious.length, logDriftA: fa.drift, logDriftB: fb.drift, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  anchor joins          ${anchors.length}/${all.length} — p95 ${Math.round(m.anchorJoinP95)}ms
  travel -> beta        ${travelSnaps}/24 snapshots — p95 ${Math.round(m.travelSnapP95)}ms
  return -> alpha       ${returnSnaps}/4 snapshots — restore exact ${restoreExact}/4
  alpha leaves          ${aTravLeaves}/24 (drift ${aLeaveDrift})   beta arrives ${bTravArrives}/24 (drift ${bArriveDrift})
  lease cancellation    released ${leaseReleased}/8 — worst latency ${Number.isFinite(leasePrompt) ? Math.round(leasePrompt) + "ms" : "NEVER"} (gate <= ${TH.leasePromptMs}ms)
  lease place commits   ${fa.places}/8 in alpha log — exact-p3 ${fa.posExact}/8 — total places ${fa.placeTotal}
  ghost frames          ${ghostFrames} departed-traveler frames after settle
  rosters               midA ${rosterA_mid} (want 24)  lateA ${rosterA_late} (want 28)  lateB ${rosterB_late} (want 20)
  final present         alpha ${finalPresentA}  beta ${finalPresentB}  ghost lease states ${ghostLeaseStates}
  mid-travel says       ${saysOk.filter(Boolean).length}/2 appended — p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms
  alpha frame/s         p50 ${m.fpsP50.toFixed(1)} — lat p95 ${Math.round(m.latP95)}ms — gaps ${gapsTotal}
  http probe ms         storm p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length})  settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})
  world logs            alpha drift ${fa.drift}  beta drift ${fb.drift}
  server rss            ready ${MB(rssReady)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${suspicious.length} suspicious lines
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — world switching cancels old-world traffic and state promptly`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
