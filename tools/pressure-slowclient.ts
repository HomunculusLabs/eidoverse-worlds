// Pressure scenario 2: SLOW-SPECTATOR ISOLATION.
// One deliberately stalled spectator (raw TCP socket: WS handshake + join,
// then socket reads PAUSED so the kernel receive window closes) plus a
// trickle reader (resumes one beat every 2s) must not add latency to healthy
// clients. Same healthy workload as pressure-1 (24 performers x 15Hz pose +
// 176 spectators, 20s) with the stalled sockets added on top.
//
//   bun tools/pressure-slowclient.ts
//   SERVER_DIR=/tmp/pressure2-wt PORT=8995 bun tools/pressure-slowclient.ts
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync } from "node:fs";

// ---- pinned scenario contract (printed before measuring) ---------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure2-wt";
const PORT = Number(process.env.PORT ?? 8995);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure2-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 176, POSE_HZ = 15;
const DURATION = 20_000;             // ms of healthy traffic
const MSG_RATE = "600";              // same envelope as pressure-1
const STALL_AT = 2_000;              // stalled sockets join + stop reading
const LATE_AT = 9_000;               // fresh healthy joiner mid-stall
const RESUME_AT = 17_000;            // unpause stall-0: backlog must arrive
const CLOSE_STALL_AT = 18_500;       // both stalled sockets depart
// acceptance thresholds (fail any → exit 1)
const TH = {
  joinP95Ms: 3_000,                  // healthy burst join p95
  lateJoinMs: 3_000,                 // late joiner during peak stall
  fpsMedian: POSE_HZ * 0.8,          // median spectator frame rate
  latP95Ms: 250,                     // frame latency p95 on healthy clients
  seqGaps: 0,                        // backpressure drops on healthy clients
  burstComplete: 0,                  // spectators missing chat-burst lines
  reconnectFails: 0,
  probeP95StallMs: 300,              // HTTP event-loop probe p95 DURING stall
  stallPausedDataEvents: 0,          // proof the pause actually stopped reads
  resumeBurstBytes: 8 * 1024,       // proof a real kernel backlog formed
  // No-amplification bound: the stalled client's eventual backlog may not
  // exceed the stream's legitimate volume over the same stall window (frames
  // actually sent × frame size + chat overhead) by more than 20% — the server
  // must never multiply a stream for a slow consumer. The 32KB frame-skip
  // (server.ts) engages only after kernel absorption saturates (config.ts
  // documents 33s of latency before bufferedAmount rises on loopback); the
  // queue row's question — do slow clients hurt healthy ones — is answered by
  // the isolation gates, this bound answers "bounded, not runaway".
  resumeBurstFactor: 1.2,
  rssStallGrowthMB: 30,              // server RSS growth attributable to stall
  rssPostCloseMB: 5,                 // runaway after stalled sockets leave
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
const MB = (kb: number) => Math.round(kb / 1024);

console.log(`pinned contract: ${N_PERF} perf x ${POSE_HZ}Hz + ${N_SPEC} spec + 2 stalled (1 frozen, 1 trickle) + 1 late joiner, ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: joinP95<${TH.joinP95Ms}ms lateJoin<${TH.lateJoinMs}ms fpsP50>=${TH.fpsMedian} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} burstMiss=${TH.burstComplete} probeP95(stall)<${TH.probeP95StallMs}ms pausedEvents=${TH.stallPausedDataEvents} resumeBurst>${TH.resumeBurstBytes}B rssStall<${TH.rssStallGrowthMB}MB rssPost<${TH.rssPostCloseMB}MB`);

// ---- scratch sequencer lifecycle ---------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure2-server.log`;
const logFile = Bun.file(logPath);
await logFile.writer().end(); // truncate
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
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0 };
    const to = setTimeout(() => reject(new Error(`${id}: join timeout`)), 30_000);
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
      } else if (m.type === "log" && m.entry?.verb === "say") s.says.add(m.entry.args?.text);
    };
    ws.onerror = () => { /* close follows */ };
  });
}

// ---- stalled spectator: raw TCP, hand-rolled WS handshake --------------------
function wsFrame(payload: string): Uint8Array {
  const data = new TextEncoder().encode(payload);
  const mask = crypto.getRandomValues(new Uint8Array(4));
  const masked = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ mask[i & 3];
  const h: number[] = data.length < 126
    ? [0x81, 0x80 | data.length]
    : [0x81, 0x80 | 126, data.length >> 8, data.length & 0xff];
  return new Uint8Array([...h, ...mask, ...masked]);
}
type Stall = {
  sock: any; openAt: number; handshakeMs: number; joinMs: number;
  phase: string; paused: boolean; pausedDataEvents: number;
  bytesAfterResume: number; closed: boolean; pend: Buffer;
};
async function stallConnect(id: string): Promise<Stall> {
  const key = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const req = `GET /ws HTTP/1.1\r\nHost: 127.0.0.1:${PORT}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`;
  const s: Stall = { sock: null, openAt: performance.now(), handshakeMs: -1, joinMs: -1, phase: "headers", paused: false, pausedDataEvents: 0, bytesAfterResume: 0, closed: false, pend: Buffer.alloc(0) };
  const sock = await Bun.connect({
    hostname: "127.0.0.1", port: PORT,
    socket: {
      data(sk: any, data: Buffer) {
        let buf: Buffer = data;
        if (s.phase === "headers") {
          const txt = new TextDecoder().decode(buf);
          const i = txt.indexOf("\r\n\r\n");
          if (i < 0) return;                        // partial headers — wait
          if (!txt.startsWith("HTTP/1.1 101")) { console.log(`FAIL: ${id} upgrade refused`); process.exit(1); }
          s.handshakeMs = performance.now() - s.openAt;
          s.phase = "ws";
          buf = buf.subarray(Buffer.byteLength(txt.slice(0, i)) + 4);
          if (buf.length === 0) return;
        }
        if (s.joinMs < 0) {
          // accumulate until the join snapshot is fully received (it can
          // straddle TCP chunk boundaries — includes() on one chunk misses it)
          s.pend = s.pend.length ? Buffer.concat([s.pend, buf]) : buf;
          if (new TextDecoder().decode(s.pend).includes(`"type":"snapshot"`)) {
            s.joinMs = performance.now() - s.openAt;
            s.pend = Buffer.alloc(0);
            if (typeof sk.pause !== "function") { console.log(`FAIL: stall mechanism unavailable (socket.pause missing)`); process.exit(1); }
            sk.pause(); s.paused = true;            // kernel window closes NOW
          }
          return;                                   // pre-join bytes not stall evidence
        }
        if (s.paused) { s.pausedDataEvents++; return; }
        s.bytesAfterResume += buf.byteLength;
      },
      error() { s.closed = true; },
      close() { s.closed = true; },
    },
  });
  s.sock = sock;
  sock.write(req);
  await sleep(150); // let the 101 land first
  sock.write(wsFrame(JSON.stringify({ type: "join", world: WORLD, id, avatar: "x.vrm", spectate: true, token: TOKEN })));
  return s;
}

// ---- run ----------------------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, false, i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const ok = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const failed = all.length - ok.length;
const perfs = ok.slice(0, N_PERF - Math.min(failed, N_PERF));
const specs = ok.slice(perfs.length);
const joinTimes = ok.map((s) => s.joinMs);
console.log(`joined ${ok.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// performers move (identical shape to pressure-1)
let running = true;
const posesSent = { n: 0 };
const tickers = perfs.map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// HTTP event-loop health probe throughout (all I/O shares one loop)
const probe = { pre: [] as number[], stall: [] as number[], post: [] as number[] };
let probePhase: keyof typeof probe = "pre";
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  probe[probePhase].push(performance.now() - t);
}, 500);

// RSS sampler
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, midStall: NaN, afterClose: NaN };

// stalled sockets join then stop reading
let stall0: Stall | null = null, stall1: Stall | null = null;
at(STALL_AT, async () => {
  stall0 = await stallConnect("stall-0");
  stall1 = await stallConnect("stall-1");
  probePhase = "stall";
  setTimeout(() => { rssSamples.postJoin = rss(); }, 1_000);
  // stall-1: trickle reader — one short unpause every 2s, then re-freeze
  const trickle = setInterval(() => {
    if (!stall1 || stall1.closed || !running) { clearInterval(trickle); return; }
    stall1.paused = false;           // resumed window: bytes count into bytesAfterResume
    stall1.sock.resume();
    setTimeout(() => { if (!stall1.closed) { stall1.sock.pause(); stall1.paused = true; } }, 250);
  }, 2_000);
  console.log(`t+${STALL_AT / 1000}s: stalled spectators joined (joinMs ${Math.round(stall0.joinMs)}ms / ${Math.round(stall1.joinMs)}ms) and stopped reading`);
});

// late healthy joiner during peak stall
let lateSpec: Spec | null = null;
at(LATE_AT, async () => {
  try { lateSpec = await connect("spec-late", true); console.log(`t+${LATE_AT / 1000}s: late joiner during stall: ${Math.round(lateSpec!.joinMs)}ms`); }
  catch { lateSpec = null; console.log("late joiner FAILED to join during stall"); }
});

// chat burst mid-run (broadcast path, unguarded sends): every line everywhere
const burstTexts = Array.from({ length: N_PERF }, (_, i) => `burst-${i}-${Math.floor(t0)}`);
at(DURATION / 2, () => {
  perfs.forEach((s, i) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: burstTexts[i] } })); });
});

// reconnect churn under stall (same as pressure-1)
at(DURATION * 0.6, async () => {
  for (let i = 0; i < Math.min(10, specs.length); i++) {
    const idx = specs.length - 1 - i;
    specs[idx].ws.close();
    try { specs[idx] = await connect(`spec-re-${i}`, true); } catch { specs[idx].joinMs = -2; }
  }
});

// resume stall-0 — the frozen backlog must arrive at once (stall proof)
at(RESUME_AT, () => {
  if (!stall0) return;
  stall0.paused = false;
  stall0.sock.resume();
});

// stalled sockets depart like citizens
at(CLOSE_STALL_AT, () => {
  for (const st of [stall0, stall1]) if (st && !st.closed) st.sock.end();
  probePhase = "post";
});

// mid-stall RSS sample
at(12_000, () => { rssSamples.midStall = rss(); });

await sleep(DURATION);
running = false;
tickers.forEach(clearInterval);
clearInterval(probeTimer);
await sleep(2_000); // let close handlers + settle land
rssSamples.afterClose = rss();

// ---- gates --------------------------------------------------------------------
const fail: string[] = [];
const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (endAt - s.snapAt - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const recipients = [...specs, ...(lateSpec ? [lateSpec] : [])];
const burstMisses = recipients.filter((s) => burstTexts.filter((t) => t && !s.says.has(t)).length > 0).length;
const reconnFails = specs.filter((s) => s.joinMs === -2).length;
const probeP95Stall = Math.round(pct(probe.stall, 95));
const rssStallGrowth = MB((rssSamples.midStall || NaN) - (rssSamples.postJoin || NaN));
const rssPostClose = MB((rssSamples.afterClose || NaN) - (rssSamples.midStall || NaN));
const resumeBurst = stall0 ? stall0.bytesAfterResume : 0;
const trickleRead = stall1 ? stall1.bytesAfterResume : 0;
const pausedEvents = (stall0?.pausedDataEvents ?? 0) + (stall1?.pausedDataEvents ?? 0);

if (failed > 0) fail.push(`${failed} connections failed to join`);
if (pct(joinTimes, 95) > TH.joinP95Ms) fail.push(`join p95 ${Math.round(pct(joinTimes, 95))}ms > ${TH.joinP95Ms}ms`);
if (pct(fpsPer, 50) < TH.fpsMedian) fail.push(`median spectator fps ${pct(fpsPer, 50).toFixed(1)} < ${TH.fpsMedian}`);
if (pct(latAll, 95) > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(pct(latAll, 95))}ms > ${TH.latP95Ms}ms`);
if (gapsTotal > TH.seqGaps) fail.push(`${gapsTotal} frame seq gaps on healthy spectators`);
if (burstMisses > TH.burstComplete) fail.push(`${burstMisses}/${recipients.length} missed chat-burst lines`);
if (reconnFails > TH.reconnectFails) fail.push(`${reconnFails} reconnects failed`);
if (!lateSpec) fail.push(`late joiner never completed during stall`);
else if (lateSpec.joinMs > TH.lateJoinMs) fail.push(`late join ${Math.round(lateSpec.joinMs)}ms > ${TH.lateJoinMs}ms`);
if (probeErrors.n > 0) fail.push(`${probeErrors.n} HTTP probe errors`);
if (probe.stall.length < 10) fail.push(`only ${probe.stall.length} stall-window probes — insufficient evidence`);
if (probeP95Stall > TH.probeP95StallMs) fail.push(`HTTP probe p95 during stall ${probeP95Stall}ms > ${TH.probeP95StallMs}ms`);
const s0 = stall0 as Stall | null, s1 = stall1 as Stall | null;   // assigned in a timer callback — defeat TS narrowing
if (!(s0 && s0.joinMs >= 0)) fail.push(`stall-0 never joined/paused (joinMs ${s0?.joinMs}) — stall not real`);
if (!(s1 && s1.joinMs >= 0)) fail.push(`stall-1 never joined/paused (joinMs ${s1?.joinMs}) — trickle stall not real`);
if (pausedEvents > TH.stallPausedDataEvents) fail.push(`${pausedEvents} data events fired while paused — stall mechanism broken`);
if (resumeBurst < TH.resumeBurstBytes) fail.push(`resume burst ${resumeBurst}B < ${TH.resumeBurstBytes}B — backlog never formed, stall not real`);
// no-amplification: backlog ≤ legitimate stream volume over the stall window
const stallFramesSent = Math.max(0, Math.round(((RESUME_AT - STALL_AT) / 1000) * POSE_HZ));
const legitStallBytes = stallFramesSent * 3 * 1024;   // measured ~2.9KB/frame at 24 poses
if (resumeBurst > legitStallBytes * TH.resumeBurstFactor) fail.push(`resume burst ${resumeBurst}B > ${Math.round(legitStallBytes * TH.resumeBurstFactor)}B (legit ${legitStallBytes}B × ${TH.resumeBurstFactor}) — stalled client unboundedly buffered / stream amplified`);
if (!(rssStallGrowth <= TH.rssStallGrowthMB)) fail.push(`RSS growth during stall ${rssStallGrowth}MB > ${TH.rssStallGrowthMB}MB`);
if (!(rssPostClose <= TH.rssPostCloseMB)) fail.push(`RSS kept growing after stalled close: +${rssPostClose}MB`);

// server log hygiene
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const bad = logLines.filter((l) => /error|warn|uncaught|failed/i.test(l));

console.log(`
results
  poses sent            ${posesSent.n}
  spectator frame/s     p50 ${pct(fpsPer, 50).toFixed(1)}  min ${Math.min(...fpsPer).toFixed(1)}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(pct(latAll, 95))}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} healthy spectators
  chat burst            ${recipients.length - burstMisses}/${recipients.length} got all ${burstTexts.length}
  reconnect churn       ${10 - reconnFails}/10 ok
  late join (mid-stall) ${lateSpec ? Math.round(lateSpec.joinMs) + "ms" : "FAILED"}
  http probe p95        pre ${Math.round(pct(probe.pre, 95))}ms  STALL ${probeP95Stall}ms (n=${probe.stall.length})  post ${Math.round(pct(probe.post, 95))}ms
  stall proof           paused data events=${pausedEvents}  resume burst=${(resumeBurst / 1024).toFixed(0)}KB  trickle read=${(trickleRead / 1024).toFixed(0)}KB over ${DURATION / 1000}s
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → midStall ${MB(rssSamples.midStall)}MB (+${rssStallGrowth}MB) → afterClose ${MB(rssSamples.afterClose)}MB
  server log            ${logLines.length} lines, ${bad.length} suspicious
`);
if (bad.length) console.log(`suspicious lines:\n  ${bad.slice(0, 10).join("\n  ")}`);

for (const s of ok) s.ws.close();
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : "ALL GATES PASS — slow spectators were fully isolated");
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
