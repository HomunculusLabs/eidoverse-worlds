// Pressure scenario 3: JOIN STORM WHILE PERFORMERS BROADCAST.
// 24 performers keep streaming 15Hz presence while 180 synthetic spectators
// arrive in three simultaneous 60-client waves, overwhelm-or-survive, then ALL
// depart at once. What the design target (200 spectators) needs to hold:
//   - every storm join completes (180/180) with bounded latency
//   - performers' stage stream never degrades (fps/latency/gaps on anchors)
//   - authored traffic (chat burst) still lands everywhere mid-storm
//   - the event loop stays responsive while 180 joins fold (HTTP probe)
//   - after the storm departs, ZERO ghosts: roster returns to "24 present,
//     0 watching" and fresh joins confirm it server-side
//
//   SERVER_DIR=/tmp/pressure3-wt PORT=8996 bun tools/pressure-joinstorm.ts
//   SELFTEST=1 bun tools/pressure-joinstorm.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync } from "node:fs";

// ---- pinned scenario contract (printed before measuring) ---------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure3-wt";
const PORT = Number(process.env.PORT ?? 8996);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure3-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_ANCHOR = 176, POSE_HZ = 15;
const STORM_SIZE = 60, WAVE_AT = [3_000, 7_000, 11_000];   // 3 waves x 60
const STORM_TOTAL = STORM_SIZE * WAVE_AT.length;           // 180
const CLOSE_STORM_AT = 19_000;      // all 180 storm sockets depart at once
const DURATION = 24_000;            // total scenario window
const MSG_RATE = "600";             // same envelope as pressure-1/2
const GHOST_GRACE = 3_000;          // server may take this long to reap 180
const GHOST_WINDOW_END = CLOSE_STORM_AT + 6_000;
const SELFTEST = process.env.SELFTEST === "1";

// acceptance thresholds (fail any → exit 1)
const TH = {
  joinsFailed: 0,                   // initial 200-connect failures
  joinP95Ms: 3_000,                 // initial doors moment (pressure-1 parity)
  warmFpsP50: POSE_HZ * 0.8,        // performer stage fps during storm
  warmLatP95Ms: 250,                // frame latency p95 on anchor spectators
  seqGaps: 0,                       // backpressure drops on anchor spectators
  burstComplete: 0,                 // anchors missing chat-burst lines
  reconnectFails: 0,
  stormFulfilled: STORM_TOTAL,      // every storm join completes
  stormJoinP95Ms: 5_000,            // per-storm-join latency p95
  worstWaveJoinMs: 12_000,          // slowest single join in any wave
  probeP95StormMs: 1_000,           // HTTP event-loop probe p95 during storm
  probeErrors: 0,
  probeStormCount: 8,               // minimum probe samples during storm
  settleFulfilled: 9,               // post-storm fresh joins all complete
  settleJoinP95Ms: 3_000,
  settleJoinMaxMs: 5_000,
  stormDepartLogged: STORM_TOTAL,   // storm sockets with a "stopped watching" line
  perfSurvivors: N_PERF,            // performer sockets still open at end of run
  ghostWatchers: 0,                 // roster samples EXCEEDING the legit bound
  absentGhosts: 0,                  // roster lines missing after departures
  rssPeakGrowthMB: 60,              // server RSS growth attributable to storm
  rssAfterCloseMB: 15,              // runaway after storm departs
};
// Legitimate spectators still connected during the ghost window: the roster
// line cannot say WHO is watching, so "watchers > 0" would false-fail on our
// own probes. The bound is the exact known set: anchors (replacements keep
// the count at N_ANCHOR) + settle probes + the census probe itself.
const LEGIT_WATCHERS_GHOST_WINDOW = N_ANCHOR + 9 + 1;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
const MB = (kb: number) => Math.round(kb / 1024);

// ---- pure gate evaluation (SELFTEST exercises the same math) -----------------
type Measurements = {
  failed: number; joinP95: number; fpsP50: number; latP95: number; gaps: number;
  burstMisses: number; reconnFails: number;
  stormFulfilled: number; stormJoinP95: number; worstWaveJoin: number;
  probeP95Storm: number; probeErrors: number; probeStormCount: number;
  settleFulfilled: number; settleJoinP95: number; settleJoinMax: number;
  stormDepartLogged: number; perfSurvivors: number; perfLosses: string[]; ghostWatchers: number; absentGhosts: number;
  rssPeakGrowth: number; rssAfterClose: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.failed > TH.joinsFailed) fail.push(`${m.failed} initial connections failed to join`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`initial join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.fpsP50 < TH.warmFpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.warmFpsP50}`);
  if (m.latP95 > TH.warmLatP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.warmLatP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on anchor spectators`);
  if (m.burstMisses > TH.burstComplete) fail.push(`${m.burstMisses} anchors missed chat-burst lines`);
  if (m.reconnFails > TH.reconnectFails) fail.push(`${m.reconnFails} reconnects failed`);
  if (m.stormFulfilled < TH.stormFulfilled) fail.push(`storm joins ${m.stormFulfilled}/${STORM_TOTAL} — joins lost under load`);
  if (m.stormJoinP95 > TH.stormJoinP95Ms) fail.push(`storm join p95 ${Math.round(m.stormJoinP95)}ms > ${TH.stormJoinP95Ms}ms`);
  if (m.worstWaveJoin > TH.worstWaveJoinMs) fail.push(`worst single storm join ${Math.round(m.worstWaveJoin)}ms > ${TH.worstWaveJoinMs}ms`);
  if (m.probeErrors > TH.probeErrors) fail.push(`${m.probeErrors} HTTP probe errors during storm`);
  if (m.probeStormCount < TH.probeStormCount) fail.push(`only ${m.probeStormCount} storm-window probes — insufficient evidence`);
  if (m.probeP95Storm > TH.probeP95StormMs) fail.push(`HTTP probe p95 during storm ${Math.round(m.probeP95Storm)}ms > ${TH.probeP95StormMs}ms`);
  if (m.settleFulfilled < TH.settleFulfilled) fail.push(`post-storm joins ${m.settleFulfilled}/${TH.settleFulfilled} — door wedged by the storm`);
  if (m.settleJoinP95 > TH.settleJoinP95Ms) fail.push(`post-storm join p95 ${Math.round(m.settleJoinP95)}ms > ${TH.settleJoinP95Ms}ms`);
  if (m.settleJoinMax > TH.settleJoinMaxMs) fail.push(`post-storm join max ${Math.round(m.settleJoinMax)}ms > ${TH.settleJoinMaxMs}ms`);
  if (m.stormDepartLogged < TH.stormDepartLogged) fail.push(`${m.stormDepartLogged}/${STORM_TOTAL} storm departures logged — sockets left without close handlers (ghost class)`);
  if (m.perfSurvivors < TH.perfSurvivors) fail.push(`${m.perfSurvivors}/${N_PERF} performers still connected at end of run — the server shed performers under the storm: ${m.perfLosses.join(", ")}`);
  if (m.ghostWatchers > TH.ghostWatchers) fail.push(`${m.ghostWatchers} roster sample(s) with watchers >${LEGIT_WATCHERS_GHOST_WINDOW} after departures — ghost spectators`);
  if (m.absentGhosts > TH.absentGhosts) fail.push(`${m.absentGhosts} expected roster line(s) missing after departures — close handlers not running`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS growth during storm ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.rssAfterClose > TH.rssAfterCloseMB) fail.push(`RSS kept growing after storm left: +${m.rssAfterClose}MB`);
  return fail;
}

if (SELFTEST) {
  // RED/GREEN proof the gates are live: a healthy measurement set must produce
  // zero failures and a deliberately breached one must fail the breached gates.
  const healthy: Measurements = {
    failed: 0, joinP95: 60, fpsP50: 14.5, latP95: 12, gaps: 0, burstMisses: 0,
    reconnFails: 0, stormFulfilled: 180, stormJoinP95: 300, worstWaveJoin: 900,
    probeP95Storm: 30, probeErrors: 0, probeStormCount: 24, settleFulfilled: 9,
    settleJoinP95: 40, settleJoinMax: 90, stormDepartLogged: 180, perfSurvivors: 24,
    perfLosses: [], ghostWatchers: 0, absentGhosts: 0, rssPeakGrowth: 5, rssAfterClose: 0,
  };
  const breached: Measurements = {
    ...healthy, stormFulfilled: 171, worstWaveJoin: 14_000, ghostWatchers: 3, gaps: 7,
    stormDepartLogged: 174, perfSurvivors: 21, perfLosses: ["perf-0: server closed (1006) @21s"],
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["storm joins 171/180", "worst single storm join 14000ms", "frame seq gaps", "storm departures logged", "ghost spectators"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf x ${POSE_HZ}Hz + ${N_ANCHOR} anchor spectators from t=0; ${STORM_TOTAL} storm spectators in 3 simultaneous waves of ${STORM_SIZE} at t=${WAVE_AT.map((w) => w / 1000 + "s").join(",")}; all storm depart t+${CLOSE_STORM_AT / 1000}s; ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: joinsFailed=${TH.joinsFailed} joinP95<${TH.joinP95Ms}ms fpsP50>=${TH.warmFpsP50} latP95<${TH.warmLatP95Ms}ms gaps=${TH.seqGaps} burstMiss=${TH.burstComplete} stormFulfilled=${TH.stormFulfilled}/${STORM_TOTAL} stormP95<${TH.stormJoinP95Ms}ms worstJoin<${TH.worstWaveJoinMs}ms probeP95(storm)<${TH.probeP95StormMs}ms settle=${TH.settleFulfilled}/${TH.settleFulfilled}@p95<${TH.settleJoinP95Ms}ms ghosts=${TH.ghostWatchers} absent=${TH.absentGhosts} rssPeak<+${TH.rssPeakGrowthMB}MB rssPost<+${TH.rssAfterCloseMB}MB`);

// ---- fd budget: 380 concurrent client sockets must fit ------------------------
const fdLimit = Number(new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim());
if (!Number.isFinite(fdLimit) || fdLimit < 600) {
  console.log(`FAIL: file-descriptor limit ${fdLimit || "?"} < 600 — launch as: ulimit -n 1024 && bun tools/pressure-joinstorm.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ---------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
// unique per run: an overlapped/killed generation can keep a stale-offset
// writer into a shared path (torn mixed-generation lines observed when a
// piped harness died before cleanup). A fresh path makes every within-run
// read pristine by construction.
const logPath = `/tmp/pressure3-server-${Date.now()}.log`;
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
let ready = false;
for (let i = 0; i < 60 && !ready; i++) {
  await sleep(250);
  try { const res = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); ready = res.status > 0; } catch { /* booting */ }
}
if (!ready) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }
const rssReady = rss();
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (log: ${logPath})`);

// ---- healthy client chassis (loadtest-proven) --------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number; wave: number;
  closed: boolean; closeCode: number; closeAt: number; id: string; teardownClose: boolean;
};
function connect(id: string, spectate: boolean, n = 0, wave = -1): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, wave, closed: false, closeCode: 0, closeAt: -1, teardownClose: false };
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
      } else if (m.type === "log" && m.entry?.verb === "say") {
        s.says.add(m.entry.args?.text);
      }
    };
    ws.onclose = (ev) => { s.closed = true; s.closeCode = ev.code; s.closeAt = performance.now() - t0; };
    ws.onerror = () => { /* close follows */ };
  });
}

// ---- roster scanner: server's own census line ("N present, M watching — id") --
function rosterFromText(txt: string): { present: number; watching: number; line: string } | null {
  const lines = txt.split("\n").filter(Boolean);
  const roster = lines.filter((l) => l.includes("— ") && /(joined|watching|left|stopped watching)\s*$/.test(l));
  const last = roster[roster.length - 1];
  if (!last) return null;
  const m = last.match(/(\d+) present(?:, (\d+) watching)?/);
  if (!m) return null;
  return { present: +m[1], watching: m[2] === undefined ? 0 : +m[2], line: last };
}

// ---- run ----------------------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, false, i)),
  ...Array.from({ length: N_ANCHOR }, (_, i) => connect(`spec-${i}`, true)),
]);
const ok = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const failed = all.length - ok.length;
const perfs = ok.slice(0, N_PERF - Math.min(failed, N_PERF));
const specs = ok.slice(perfs.length);
const joinTimes = ok.map((s) => s.joinMs);
console.log(`t+0: joined ${ok.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// performers move (identical shape to pressure-1/2)
let running = true;
let teardownStarted = false;
const posesSent = { n: 0 };
const tickers = perfs.map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));
// performer close events log IMMEDIATELY (timeline evidence, not post-hoc)
for (const s of perfs) s.ws.addEventListener("close", (ev: any) => {
  s.teardownClose = teardownStarted;
  console.log(`PERF-CLOSE ${s.id} code=${ev.code} at t+${((performance.now() - t0) / 1000).toFixed(2)}s teardown=${teardownStarted}`);
});

// HTTP event-loop health probe throughout (all I/O shares one loop)
const probe = { pre: [] as number[], storm: [] as number[], post: [] as number[] };
let probePhase: keyof typeof probe = "pre";
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  probe[probePhase].push(performance.now() - t);
}, 500);

// RSS sampler (peak tracked across the storm)
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN, afterClose: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= WAVE_AT[0]) {
    if (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak) rssSamples.peak = r;
  }
}, 500);

// ---- the storm: three simultaneous 60-client waves ----------------------------
const stormSpecs: Spec[] = [];
const stormFailures: string[] = [];
WAVE_AT.forEach((waveAt, wave) => {
  at(waveAt, () => {
    probePhase = "storm";
    Promise.allSettled(Array.from({ length: STORM_SIZE }, (_, i) =>
      connect(`storm-${wave}-${i}`, true, i, wave),
    )).then((rs) => {
      const joined = rs.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
      stormSpecs.push(...joined);
      for (const r of rs.filter((x) => x.status === "rejected")) stormFailures.push(String((r as any).reason));
      const js = joined.map((s) => s.joinMs);
      console.log(`t+${waveAt / 1000}s: wave ${wave + 1} — ${joined.length}/${STORM_SIZE} joined, p50 ${Math.round(pct(js, 50))}ms p95 ${Math.round(pct(js, 95))}ms max ${js.length ? Math.round(Math.max(...js)) : "-"}ms`);
    });
  });
});

// chat burst DURING the storm (authored plane must stay responsive): wave 3 is
// mid-join at t+12.5s — every line must still land on every anchor + completed
// storm clients alike
const burstTexts = Array.from({ length: N_PERF }, (_, i) => `burst-${i}-${Math.floor(t0)}`);
at(12_500, () => {
  perfs.forEach((s, i) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: burstTexts[i] } })); });
});

// reconnect churn mid-storm (5 anchors drop + rejoin while wave 3 processes)
at(15_000, async () => {
  for (let i = 0; i < Math.min(5, specs.length); i++) {
    const idx = specs.length - 1 - i;
    specs[idx].ws.close();
    try { specs[idx] = await connect(`spec-re-${i}`, true); } catch { specs[idx].joinMs = -2; }
  }
});

// ghost watch: after the storm departs (+grace), the server's own roster line
// must show at most the KNOWN legitimate watchers (anchors + settle/census
// probes — the roster line cannot say who), every one of the 180 storm ids
// must have its own "stopped watching" line, and the census probe forces the
// server to print a fresh census inside the window (absence is a defect too)
let ghostWatchers = 0, absentGhosts = 0, stormDepartLogged = 0;
let lastRosterSample: { present: number; watching: number; line: string } | null = null;
const censusProbe = { ws: null as WebSocket | null };
const ghostTimer = setInterval(async () => {
  const now = performance.now() - t0;
  if (now < CLOSE_STORM_AT + GHOST_GRACE || now > GHOST_WINDOW_END) return;
  try {
    if (!censusProbe.ws || censusProbe.ws.readyState > 1) {
      // one extra spectator for the sole purpose of forcing a roster print
      censusProbe.ws = new WebSocket(URL);
      censusProbe.ws.onopen = () => censusProbe.ws!.send(JSON.stringify({ type: "join", world: WORLD, id: "census-probe", avatar: "x.vrm", spectate: true, token: TOKEN }));
    }
    const txt = await logFile.text();
    const r = rosterFromText(txt);
    if (r) lastRosterSample = r;
    if (!r) absentGhosts++;
    else if (r.watching > LEGIT_WATCHERS_GHOST_WINDOW) { ghostWatchers++; if (ghostWatchers === 1) console.log(`GHOST EVIDENCE: ${r.line}`); }
    stormDepartLogged = txt.split("\n").filter((l: string) => l.includes("stopped watching")).length - 5; // minus the 5 churn leaves
  } catch { absentGhosts++; }
}, 250);

// all 180 storm sockets depart at once — the exodus moment
at(CLOSE_STORM_AT, () => {
  for (const s of stormSpecs) { try { s.ws.close(); } catch {} }
  console.log(`t+${CLOSE_STORM_AT / 1000}s: ${stormSpecs.length} storm spectators departing en masse`);
});

// settle probes: fresh joins AFTER the exodus must be fast and must force the
// server to print its roster — server-side proof of "24 present, 0 watching"
const settleSpecs: Spec[] = [];
const settleFailures: string[] = [];
at(20_500, async () => {
  const rs = await Promise.allSettled(Array.from({ length: 9 }, (_, i) => connect(`storm-check-${i}`, true)));
  for (const r of rs) {
    if (r.status === "fulfilled") settleSpecs.push(r.value);
    else settleFailures.push(String((r as any).reason));
  }
  const js = settleSpecs.map((s) => s.joinMs);
  console.log(`t+20.5s: post-storm joins ${settleSpecs.length}/9, p50 ${Math.round(pct(js, 50))}ms p95 ${Math.round(pct(js, 95))}ms max ${js.length ? Math.round(Math.max(...js)) : "-"}ms`);
  probePhase = "post";
});

at(23_500, () => { rssSamples.afterClose = rss(); });

await sleep(DURATION);
running = false;
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
clearInterval(ghostTimer);
await sleep(1_000);

// ---- measurements -------------------------------------------------------------
const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (endAt - s.snapAt - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const recipients = [...specs, ...settleSpecs];
const burstMisses = recipients.filter((s) => burstTexts.filter((t) => t && !s.says.has(t)).length > 0).length;
const reconnFails = specs.filter((s) => s.joinMs === -2).length;
const stormJoins = stormSpecs.map((s) => s.joinMs);
const perWaveWorst = [0, 1, 2].map((w) => {
  const js = stormSpecs.filter((s) => s.wave === w).map((s) => s.joinMs);
  return js.length ? Math.max(...js) : Infinity;
});
const settleJoins = settleSpecs.map((s) => s.joinMs);
const probeP95Storm = Math.round(pct(probe.storm, 95));
// performer survival: no performer socket may close before the harness's own
// teardown begins (final read ~25s). The immediate PERF-CLOSE log lines give
// the timeline; this gate fails on any close with teardown=false.
const perfLosses = perfs
  .filter((s) => s.closed && !s.teardownClose)
  .map((s) => `${s.id}: closed ${s.closeCode ? `(code ${s.closeCode})` : "(no code)"} @${Math.round(s.closeAt / 1000)}s`);
const perfSurvivors = N_PERF - perfLosses.length;
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));
const rssAfterClose = MB((rssSamples.afterClose || NaN) - (rssSamples.peak || NaN));
// final roster line: use the last GHOST-WINDOW sample (pre-teardown by
// construction) — a fresh read here races our own 385 bulk closes (the read's
// file-bytes can land ~30ms later, mid-teardown, and pick up the first few
// processed performer closes as a false "perf-N left" tail)
const finalRoster = lastRosterSample as { present: number; watching: number; line: string } | null;

const m: Measurements = {
  failed, joinP95: pct(joinTimes, 95), fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95),
  gaps: gapsTotal, burstMisses, reconnFails,
  stormFulfilled: stormSpecs.length, stormJoinP95: pct(stormJoins, 95),
  worstWaveJoin: Math.max(...perWaveWorst),
  probeP95Storm, probeErrors: probeErrors.n, probeStormCount: probe.storm.length,
  settleFulfilled: settleSpecs.length, settleJoinP95: pct(settleJoins, 95),
  settleJoinMax: settleJoins.length ? Math.max(...settleJoins) : Infinity,
  stormDepartLogged, perfSurvivors, perfLosses, ghostWatchers, absentGhosts, rssPeakGrowth, rssAfterClose,
};
const fail = evaluate(m);

// server log hygiene
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const bad = logLines.filter((l) => /error|warn|uncaught|failed/i.test(l));

console.log(`
results
  poses sent            ${posesSent.n}
  initial joins         ${ok.length}/${all.length} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(m.joinP95)}ms
  storm joins           ${stormSpecs.length}/${STORM_TOTAL} (${stormFailures.length} failures) — p50 ${Math.round(pct(stormJoins, 50))}ms p95 ${Math.round(m.stormJoinP95)}ms worst ${Number.isFinite(m.worstWaveJoin) ? Math.round(m.worstWaveJoin) + "ms" : "n/a"}
  per-wave worst        ${perWaveWorst.map((w) => Number.isFinite(w) ? Math.round(w) + "ms" : "none").join("  ")}
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${Math.min(...fpsPer).toFixed(1)}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchor spectators
  chat burst (mid-storm) ${recipients.length - burstMisses}/${recipients.length} recipients got all ${burstTexts.length}
  reconnect churn       ${5 - reconnFails}/5 ok
  http probe p95        pre ${Math.round(pct(probe.pre, 95))}ms  STORM ${probeP95Storm}ms (n=${probe.storm.length})  post ${Math.round(pct(probe.post, 95))}ms
  post-storm joins      ${settleSpecs.length}/9 — p95 ${Math.round(m.settleJoinP95)}ms max ${Number.isFinite(m.settleJoinMax) ? Math.round(m.settleJoinMax) + "ms" : "n/a"}
  performer survival   ${perfSurvivors}/${N_PERF} at end of run${perfLosses.length ? ` — LOST: ${perfLosses.join(", ")}` : ""}
  ghost census          storm departures logged: ${stormDepartLogged}/${STORM_TOTAL}; watchers>${LEGIT_WATCHERS_GHOST_WINDOW}: ${ghostWatchers} sample(s)${finalRoster ? `; final roster line: "${finalRoster.line.trim()}"` : "; NO FINAL ROSTER LINE"}; absent: ${absentGhosts}
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB) → afterClose ${MB(rssSamples.afterClose)}MB
  server log            ${logLines.length} lines, ${bad.length} suspicious
`);
if (bad.length) console.log(`suspicious lines:\n  ${bad.slice(0, 10).join("\n  ")}`);

for (const s of ok) s.ws.close();
for (const s of [...stormSpecs, ...settleSpecs]) { try { s.ws.close(); } catch {} }
try { censusProbe.ws?.close(); } catch {}
teardownStarted = true;
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — the storm was absorbed: ${STORM_TOTAL}/${STORM_TOTAL} joins, stage stream intact, zero ghosts`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
