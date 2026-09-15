// Pressure scenario 11: MALFORMED-FRAME STORM — partial/truncated JSON payloads
// never wedge the sequencer.
// Design target: 24 embodied performers @15Hz to a full house. Prior scenarios
// proved the presence plane (1), slow-spectator isolation (2), join storms (3),
// authored responsiveness (4), verb rate-limits (5), reconnect hygiene (6),
// world-switch cancellation (7), snapshot consistency (8), memory return (9),
// classification fanout (10). This one attacks the INPUT BOUNDARY itself:
// not malformed BYTES only (the parse catch is proven) but structurally
// hostile frames that PARSE: envelopes that are not objects, truncated JSON
// prefixes, well-formed-but-wrong typed fields, unknown types — and the
// serializer killer, a parse-valid deep-nested pose (60k-deep array, 120KB —
// legal at the 256KB gate) that used to wedge the whole world's presence
// plane forever (pressure-11's measured defect: 30/30 frames → 0, HTTP and
// says green — a silent partial outage; fixed by intake validation + the
// serialize-before-clear stage tick).
//
// Population (pinned before measuring — 160 persistent, 200 peak):
//   24 embodied anchors @15Hz + 136 spectator anchors
// A) +8 raw-TCP corrupt legs (2 frozen mid-frame, 2 tricklers, 2 prefix
//    fuzzers, 2 resyncers) — byte-level garbage straight at the WS parser
// B) +16 protocol garbage legs (real WebSockets sending size-legal hostile
//    envelopes at 3Hz: non-objects, truncated prefixes, wrong-typed poses,
//    unknown types, deep-nested 60k poison, NaN/Infinity spelled out,
//    100KB-wide flat poses, hostile JOINs)
// C) +16 fresh joins mid-storm (snapshot integrity) + 3 fairness says
//
// Acceptance gates (pinned before measuring):
//   - all 216 joins accepted (160+8 refuse-path closes are NOT joins —
//     corrupt legs join as spectators first, then turn hostile), 0 unexpected
//     failures, join p95 < 3s
//   - storm-window spectator fps p50 >= 12, frame lat p95 < 250ms, 0 seq gaps
//   - healthy anchors: every frame in every window carries ONLY anchor ids
//     (0 foreign ids — garbage legs' poses must never enter frames)
//   - deep-poison gate: frames continue through and after the poison window
//     (>= 10 frames in the 2s post-poison window on the seer), 0 permanent
//     frame-silence mid-run
//   - explicit refusals: garbage legs receive >= 1 error message each (no
//     silent swallowing), 0 sockets closed by the server for anything but
//     oversize
//   - mid-storm fresh joins 16/16 snapshot + say round-trips 3/3, author
//     p95 < 500ms, 3 says in log.jsonl
//   - final present == 0; arrive/leave arithmetic drift 0
//   - event loop: HTTP probe p95 < 500ms during storm, < 100ms post-settle
//   - log.jsonl drift 0 (2 + 3 expected lines: genesis+grant... plus says)
//   - RSS peak growth < 60MB; 0 suspicious server log lines; 0 RangeError
//
//   SERVER_DIR=/tmp/pressure11-<sha> PORT=8999 bun tools/pressure-malformed.ts
//   SELFTEST=1 bun tools/pressure-malformed.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure11-scratch";
const PORT = Number(process.env.PORT ?? 8999);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure11-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 16, N_PAR = 8, N_SPEC = 136;              // 24 embodied + 136 watching
const N_CORRUPT = 8, N_GARBAGE = 16, N_MIDJOIN = 16;
const POSE_HZ = 15;
const GARBAGE_HZ = 3;                                    // hostile msg/s per leg
const STORM_AT = 10_000, MIDJOIN_AT = 14_000, POISON_AT = 16_000, TEARDOWN_AT = 24_000;
const FINAL_PROBE_AT = 29_000;
const DURATION = 30_500;
const W_STORM: [number, number] = [10_500, 16_000];      // corrupt+garbage active
const W_POISON: [number, number] = [16_200, 18_200];     // post-poison stream health
const MSG_RATE = "600";
const SELFTEST = process.env.SELFTEST === "1";

const N_ANCHOR_EMB = N_PERF + N_PAR;                     // 24
const EXPECT_LOG_LINES = 2 + 3;                          // genesis+grant + 3 says
// garbage menu — every entry size-legal, each breaks a different assumption
const depth = 60_000;
const deep = "[".repeat(depth) + "]".repeat(depth);
const GARBAGE_MENU: string[] = [
  "5",
  "null",
  '"a string envelope"',
  "[1,2,3]",
  '{"type":"verb","verb":"say","args":',
  '{"type":"pose","pose":{"p":"not-a-point"}}',
  '{"type":"pose","pose":{"p":[1,0,1],"junk":' + deep + "}}",
  '{"type":"pose","pose":{"p":[1,0,1],"yaw":NaN}}',
  '{"type":"pose","pose":{"pose":{"a":{"b":{"c":{"d":{"e":[1,2,3]}}}}}}}',
  '{"type":"totally-unknown-type","payload":{"x":1}}',
  '{"type":"pose","pose":{"p":[0,0,0],"clip":"' + "A".repeat(100_000) + '"}}',
  '{"type":"join","world":"../etc/passwd","id":"x","token":"test-door"}',
];
// thresholds
const TH = {
  joinFailed: 0,
  joinP95Ms: 3_000,
  midjoins: N_MIDJOIN,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  foreignIds: 0,
  postPoisonFramesMin: 10,
  refusalRate: 0.6,          // fraction of garbage legs that saw >=1 explicit error
  saysAppended: 3,
  sayP95Ms: 500,
  saysInLog: 3,
  finalPresent: 0,
  arriveDrift: 0,
  leaveDrift: 0,
  probeStormP95Ms: 500,
  probeSettledP95Ms: 100,
  logSuspicious: 0,
  logLineDrift: 0,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  joinFailed: number; joinP95: number; midjoins: number;
  fpsP50: number; latP95: number; gaps: number;
  foreignIds: number; postPoisonFrames: number; refusalRate: number;
  saysAppended: number; sayP95: number; saysInLog: number;
  finalPresent: number; arriveDrift: number; leaveDrift: number;
  probeStormP95: number; probeSettledP95: number;
  logSuspicious: number; logLineDrift: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.joinFailed > TH.joinFailed) fail.push(`${m.joinFailed} expected joins failed`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.midjoins < TH.midjoins) fail.push(`mid-storm joins ${m.midjoins}/${TH.midjoins} — snapshot integrity broken under garbage`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`spec fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps`);
  if (m.foreignIds > TH.foreignIds) fail.push(`${m.foreignIds} frames carried foreign ids — garbage poses entered the presence stream`);
  if (m.postPoisonFrames < TH.postPoisonFramesMin) fail.push(`post-poison frames ${m.postPoisonFrames} < ${TH.postPoisonFramesMin} — presence wedged`);
  if (m.refusalRate < TH.refusalRate) fail.push(`explicit-refusal rate ${(m.refusalRate * 100).toFixed(0)}% < ${(TH.refusalRate * 100).toFixed(0)}% — hostile frames silently swallowed`);
  if (m.saysAppended < TH.saysAppended) fail.push(`says ${m.saysAppended}/3 appended`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.saysInLog !== TH.saysInLog) fail.push(`log.jsonl says ${m.saysInLog} != 3`);
  if (m.finalPresent > TH.finalPresent) fail.push(`final present ${m.finalPresent} — world not empty`);
  if (m.arriveDrift > TH.arriveDrift) fail.push(`arrive drift ${m.arriveDrift}`);
  if (m.leaveDrift > TH.leaveDrift) fail.push(`leave drift ${m.leaveDrift}`);
  if (m.probeStormP95 > TH.probeStormP95Ms) fail.push(`storm HTTP probe p95 ${Math.round(m.probeStormP95)}ms > ${TH.probeStormP95Ms}ms`);
  if (m.probeSettledP95 > TH.probeSettledP95Ms) fail.push(`settled HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > ${TH.probeSettledP95Ms}ms`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`log.jsonl line drift ${m.logLineDrift} vs ${EXPECT_LOG_LINES}`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    joinFailed: 0, joinP95: 45, midjoins: 16,
    fpsP50: 14.5, latP95: 11, gaps: 0,
    foreignIds: 0, postPoisonFrames: 28, refusalRate: 1.0,
    saysAppended: 3, sayP95: 8, saysInLog: 3,
    finalPresent: 0, arriveDrift: 0, leaveDrift: 0,
    probeStormP95: 12, probeSettledP95: 9,
    logSuspicious: 0, logLineDrift: 0, rssPeakGrowth: 12,
  };
  const breached = { ...healthy,
    joinFailed: 3, joinP95: 4_200, midjoins: 9,
    fpsP50: 8, latP95: 460, gaps: 7,
    foreignIds: 12, postPoisonFrames: 0, refusalRate: 0.2,
    saysAppended: 1, sayP95: 800, saysInLog: 2,
    finalPresent: 5, arriveDrift: 4, leaveDrift: 6,
    probeStormP95: 900, probeSettledP95: 250,
    logSuspicious: 4, logLineDrift: 3, rssPeakGrowth: 95,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = [
    "expected joins failed", "join p95", "mid-storm joins", "fps p50",
    "frame latency p95", "seq gaps", "foreign ids", "post-poison frames",
    "explicit-refusal rate", "says", "say author p95", "log.jsonl says",
    "world not empty", "arrive drift", "leave drift", "storm HTTP",
    "settled HTTP", "suspicious server log", "line drift", "RSS peak",
  ];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_ANCHOR_EMB} embodied anchors @${POSE_HZ}Hz + ${N_SPEC} spec = 160 persistent; wave A t+${STORM_AT / 1000}s: ${N_CORRUPT} raw-TCP corrupt legs (frozen-mid-frame/trickle/prefix-fuzz/resync) + ${N_GARBAGE} protocol-garbage legs @${GARBAGE_HZ}Hz (12-item hostile menu incl. 60k-deep poison); wave B t+${MIDJOIN_AT / 1000}s: ${N_MIDJOIN} fresh EMBODIED joins mid-storm (snapshot integrity + arrive/leave arithmetic); teardown t+${TEARDOWN_AT / 1000}s. Windows W_STORM[${W_STORM.join("-")}] W_POISON[${W_POISON.join("-")}]. ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}`);
const JOIN_EXPECT = N_PERF + N_PAR + N_SPEC + N_MIDJOIN + N_CORRUPT + N_GARBAGE; // 200
console.log(`thresholds: joins=${JOIN_EXPECT}@p95<${TH.joinP95Ms}ms midjoins=16/16 fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=0 foreignIds=0 postPoisonFrames>=${TH.postPoisonFramesMin} refusals>=60% says=3@p95<${TH.sayP95Ms}ms finalPresent=0 drift=0 probeStorm<${TH.probeStormP95Ms}ms probeSettled<${TH.probeSettledP95Ms}ms logSuspicious=0 logDrift=0 rssPeak<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-malformed.ts`);
  process.exit(2);
}

// ---- scratch sequencer --------------------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure11-server-${Date.now()}.log`;
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

// ---- client chassis -----------------------------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
  closed: boolean; closeCode: number; id: string;
  arrives: string[]; leaves: string[]; errs: string[]; sayEcho: Map<string, number>;
};
function connect(id: string, opts: { spectate?: boolean; avatar?: number } = {}): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, closeCode: 0, arrives: [], leaves: [], errs: [], sayEcho: new Map() };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({
      type: "join", world: WORLD, id,
      avatar: opts.avatar ? `av${opts.avatar}.vrm` : "x.vrm",
      spectate: opts.spectate ?? false, token: TOKEN,
    }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapAt = performance.now(); s.joinMs = s.snapAt - s.openAt;
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
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = (ev) => {
      s.closed = true; s.closeCode = Number(ev.code ?? 0);
      if (s.snapAt === 0) { clearTimeout(to); resolve(s); }  // refuse-path close: resolve marked (snapAt 0)
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

// ---- anchors ------------------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, { avatar: i })),
  ...Array.from({ length: N_PAR }, (_, i) => connect(`par-${i}`, { avatar: 200 + i })),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, { spectate: true })),
]);
const anchors = all.filter((r) => r.status === "fulfilled" && (r as any).value.snapAt > 0).map((r: any) => r.value as Spec);
const joinFailedBase = all.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const pars = anchors.filter((s) => s.id.startsWith("par-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const anchorIds = new Set([...perfs, ...pars].map((s) => s.id));
const SEER = specs.find((s) => s.id === "spec-0")!;      // frame witness
const SEER2 = specs.find((s) => s.id === "spec-135")!;   // broadcast witness
const joinTimesAll: number[] = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimesAll, 50))}ms p95 ${Math.round(pct(joinTimesAll, 95))}ms`);

// embodied presence: 24 broadcasters @ 15Hz (same shape as pressure-1..10)
let running = true;
const tickers: ReturnType<typeof setInterval>[] = [];
[...perfs, ...pars].forEach((s, i) => tickers.push(setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
}, 1000 / POSE_HZ)));

// frame-content probe on the seer: no foreign id EVER rides a frame; count
// post-poison stream health
let foreignIds = 0, postPoisonFrames = 0, midRunSilence = false;
const deviantLog: string[] = [];
{
  const orig = SEER.ws.onmessage;
  SEER.ws.onmessage = (ev) => {
    try {
      const m = JSON.parse(String(ev.data));
      if (m.type === "frame") {
        const tNow = performance.now() - t0;
        const ids = Object.keys(m.poses ?? {});
        const foreign = ids.filter((id) => !anchorIds.has(id));
        if (foreign.length) { foreignIds++; if (deviantLog.length < 40) deviantLog.push(`t=${Math.round(tNow)}ms FOREIGN [${foreign.join(",")}]`); }
        if (tNow >= W_POISON[0] && tNow < W_POISON[1]) postPoisonFrames++;
      }
    } catch { /* fall through */ }
    orig?.call(SEER.ws, ev);
  };
}

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

// ---- wave A: raw-TCP corrupt legs (byte-level garbage at the WS parser) --------
const corruptClosedByServer = { n: 0 };
let corruptJoins = 0;
function wsFrameBytes(payload: string): Uint8Array {
  const data = new TextEncoder().encode(payload);
  const mask = crypto.getRandomValues(new Uint8Array(4));
  const masked = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ mask[i & 3];
  const h = data.length < 126
    ? [0x81, 0x80 | data.length]
    : [0x81, 0x80 | 126, data.length >> 8, data.length & 0xff];
  return new Uint8Array([...h, ...mask, ...masked]);
}
const corruptSockets: any[] = [];
at(STORM_AT, async () => {
  const modes = ["frozen", "frozen", "trickle", "trickle", "prefix", "prefix", "resync", "resync"];
  for (let i = 0; i < N_CORRUPT; i++) {
    const mode = modes[i];
    const id = `corrupt-${i}`;
    try {
      const s: any = await new Promise((resolve, reject) => {
        const key = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
        const req = `GET /ws HTTP/1.1\r\nHost: 127.0.0.1:${PORT}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`;
        const st: any = { sock: null, phase: "headers", pend: Buffer.alloc(0), joined: false };
        const to = setTimeout(() => reject(new Error(`${id}: corrupt join timeout`)), 15_000);
        Bun.connect({
          hostname: "127.0.0.1", port: PORT,
          socket: {
            data(sk: any, data: Buffer) {
              if (st.phase === "headers") {
                const txt = new TextDecoder().decode(data);
                const j = txt.indexOf("\r\n\r\n");
                if (j < 0) return;
                if (!txt.startsWith("HTTP/1.1 101")) { clearTimeout(to); reject(new Error(`${id}: upgrade refused`)); return; }
                st.phase = "ws";
                const rest = data.subarray(j + 4);
                if (rest.length) st.pend = Buffer.concat([st.pend, rest]);
              } else if (data.length) st.pend = Buffer.concat([st.pend, data]);
              if (!st.joined && new TextDecoder().decode(st.pend).includes(`"type":"snapshot"`)) {
                st.joined = true; st.pend = Buffer.alloc(0); clearTimeout(to); resolve(st);
              }
            },
            close() { if (!st.joined) { clearTimeout(to); reject(new Error(`${id}: closed pre-join`)); } },
            error() { if (!st.joined) { clearTimeout(to); reject(new Error(`${id}: error pre-join`)); } },
          },
        }).then((sock: any) => { st.sock = sock; sock.write(req); sock.write(wsFrameBytes(JSON.stringify({ type: "join", world: WORLD, id, avatar: "x.vrm", spectate: true, token: TOKEN }))); });
      });
      corruptJoins++;
      corruptSockets.push(s);
      // now turn hostile per mode
      if (mode === "frozen") {
        // write a partial frame header promising 64KB, deliver 200 bytes, stop
        const head = new Uint8Array([0x81, 0x80 | 126, 0xff, 0xff]);  // promises 65535
        s.sock.write(head);
        s.sock.write(crypto.getRandomValues(new Uint8Array(200)));
        // stays half-open; resync mode legs will send new frames after it
      } else if (mode === "trickle") {
        // send a truncated-JSON frame one byte every 120ms for the storm window
        const frame = wsFrameBytes('{"type":"verb","verb":"say","args":');
        let off = 0;
        const iv = setInterval(() => {
          if (off >= frame.length || !s.sock) { clearInterval(iv); return; }
          try { s.sock.write(frame.subarray(off, off + 1)); off++; } catch { clearInterval(iv); }
        }, 120);
        setTimeout(() => clearInterval(iv), W_STORM[1] - STORM_AT);
      } else if (mode === "prefix") {
        // random binary prefixes followed by well-formed frames — parser must resync
        let n = 0;
        const iv = setInterval(() => {
          if (n++ > 12 || !s.sock) { clearInterval(iv); return; }
          try {
            s.sock.write(crypto.getRandomValues(new Uint8Array(64)));
            s.sock.write(wsFrameBytes(GARBAGE_MENU[(n * 3) % GARBAGE_MENU.length]));
          } catch { clearInterval(iv); }
        }, 400);
        setTimeout(() => clearInterval(iv), W_STORM[1] - STORM_AT);
      } else {  // resync
        // garbage between well-formed frames: server should recover parsing
        let n = 0;
        const iv = setInterval(() => {
          if (n++ > 12 || !s.sock) { clearInterval(iv); return; }
          try {
            s.sock.write(wsFrameBytes('{"type":"debug","limit":1}'));
            s.sock.write(crypto.getRandomValues(new Uint8Array(48)));
            s.sock.write(wsFrameBytes('{"type":"history","limit":1}'));
          } catch { clearInterval(iv); }
        }, 400);
        setTimeout(() => clearInterval(iv), W_STORM[1] - STORM_AT);
      }
    } catch { /* counted via corruptJoins */ }
  }
  console.log(`t+${STORM_AT / 1000}: corrupt legs joined ${corruptJoins}/${N_CORRUPT} (byte-level hostility begins)`);
});

// ---- wave B: protocol garbage legs (real WS, hostile envelopes @3Hz) -----------
let garbageJoins = 0, garbageErrSeen = 0;
const garbageSpecs: Spec[] = [];
at(STORM_AT + 500, async () => {
  const gs = await Promise.allSettled(Array.from({ length: N_GARBAGE }, (_, i) => connect(`garb-${i}`, { spectate: true })));
  const ok = gs.filter((r) => r.status === "fulfilled" && (r as any).value.snapAt > 0).map((r: any) => r.value as Spec);
  garbageJoins = ok.length;
  garbageSpecs.push(...ok);
  ok.forEach((s) => joinTimesAll.push(s.joinMs));
  const ivs: ReturnType<typeof setInterval>[] = [];
  ok.forEach((s, i) => {
    const iv = setInterval(() => {
      if (s.ws.readyState !== 1) { clearInterval(iv); return; }
      s.ws.send(GARBAGE_MENU[(i + Math.floor(Date.now() / 1000)) % GARBAGE_MENU.length]);
    }, 1000 / GARBAGE_HZ);
    ivs.push(iv);
  });
  setTimeout(() => ivs.forEach(clearInterval), TEARDOWN_AT - STORM_AT);
  console.log(`t+${(STORM_AT + 500) / 1000}: garbage legs ${garbageJoins}/${N_GARBAGE} joined, hostility @${GARBAGE_HZ}Hz from 12-item menu (60k-deep poison in rotation)`);
});

// poison sync marker (the menu already rotates the deep poison through every
// leg multiple times; the window probe does the stream-health measurement)

// ---- wave C: fresh EMBODIED joins mid-storm + fairness says --------------------
let midjoins = 0;
const midjoinSpecs: Spec[] = [];
at(MIDJOIN_AT, async () => {
  const ms = await Promise.allSettled(Array.from({ length: N_MIDJOIN }, (_, i) => connect(`mid-${i}`, { avatar: 500 + i })));
  const ok = ms.filter((r) => r.status === "fulfilled" && (r as any).value.snapAt > 0).map((r: any) => r.value as Spec);
  midjoins = ok.length;
  midjoinSpecs.push(...ok);
  ok.forEach((s) => joinTimesAll.push(s.joinMs));
  console.log(`t+${MIDJOIN_AT / 1000}: mid-storm EMBODIED joins ${midjoins}/${N_MIDJOIN} (snapshot integrity under garbage fire)`);
});

const SAY_TEXTS = [`mal-r-${Math.floor(t0)}`, `mal-s-${Math.floor(t0)}`, `mal-t-${Math.floor(t0)}`];
const saysAppendedArr: boolean[] = [];
const sayLat: number[] = [];
[SAY_TEXTS[0], SAY_TEXTS[1], SAY_TEXTS[2]].forEach((text, i) => {
  const when = [8_000, 13_000, 19_000][i];
  at(when, () => {
    const sentAt = performance.now();
    const S = perfs[2];
    if (S.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(when + 1_500, () => {
      const hit = S.sayEcho.get(text);
      saysAppendedArr.push(hit !== undefined);
      if (hit !== undefined) sayLat.push(hit - sentAt);
    });
  });
});

// ---- teardown + final probe ---------------------------------------------------
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  anchors.forEach((s) => { if (s !== SEER2) { try { s.ws.close(); } catch {} } });
  midjoinSpecs.forEach((s) => { try { s.ws.close(); } catch {} });
  garbageSpecs.forEach((s) => { try { s.ws.close(); } catch {} });
  for (const st of corruptSockets) { try { st.sock?.end?.(); } catch {} }
});
at(TEARDOWN_AT + 2_000, () => { try { SEER2.ws.close(); } catch {} });

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

// ---- world-log ground truth ---------------------------------------------------
const worldLogPath = `${WORLDS}/${WORLD}/log.jsonl`;
let logTotalLines = -1, logLineDriftVal = 999, saysInLog = -1;
if (existsSync(worldLogPath)) {
  const wl = readFileSync(worldLogPath, "utf8").split("\n").filter(Boolean);
  logTotalLines = wl.length;
  logLineDriftVal = Math.abs(logTotalLines - EXPECT_LOG_LINES);
  saysInLog = wl.filter((l) => { try { return JSON.parse(l)?.verb === "say"; } catch { return false; } }).length;
}

// ---- server log forensics -----------------------------------------------------
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));

// ---- broadcast arithmetic from seer2 -------------------------------------------
const bArrives = SEER2 ? SEER2.arrives.filter((id) => !id.startsWith("final-empty")).length : -1;
const bLeaves = SEER2 ? SEER2.leaves.length : -1;
const arriveDrift = bArrives < 0 ? 999 : Math.abs(bArrives - (N_MIDJOIN));
const leaveDrift = bLeaves < 0 ? 999 : Math.abs(bLeaves - (N_MIDJOIN + N_ANCHOR_EMB));

const endAt = performance.now();
garbageErrSeen = garbageSpecs.filter((s) => s.errs.length > 0).length;
const activeUntil = Math.min(teardownAtTs || endAt, endAt);
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (activeUntil - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

const m: Measurements = {
  joinFailed: joinFailedBase + Math.max(0, JOIN_EXPECT - anchors.length - corruptJoins - garbageJoins - midjoins),
  joinP95: pct(joinTimesAll, 95),
  midjoins,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  foreignIds, postPoisonFrames,
  refusalRate: garbageJoins > 0 ? garbageErrSeen / garbageJoins : 0,
  saysAppended: saysAppendedArr.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  saysInLog: saysInLog < 0 ? -1 : saysInLog,
  finalPresent: finalPresent < 0 ? 999 : finalPresent,
  arriveDrift, leaveDrift,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  logSuspicious: suspicious.length, logLineDrift: logLineDriftVal, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  joins                 anchors ${anchors.length}/160, corrupt ${corruptJoins}/8, garbage ${garbageJoins}/16, mid ${midjoins}/16 — p95 ${Math.round(m.joinP95)}ms (n=${joinTimesAll.length})
  mid-storm joins       ${midjoins}/16 snapshots delivered under garbage fire
  spec frame/s          p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} spectators
  foreign ids in frames ${foreignIds} (must be 0 — garbage poses never entered the stream)
  post-poison frames    ${postPoisonFrames} in W_POISON (>= ${TH.postPoisonFramesMin} — presence not wedged)
  explicit refusals     ${garbageErrSeen}/${garbageJoins} garbage legs saw >=1 error (${Math.round(m.refusalRate * 100)}%)
  says                  ${saysAppendedArr.filter(Boolean).length}/3 appended — author p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms — in log ${saysInLog}/3
  final present         ${finalPresent} embodied (must be 0)
  seer2 arithmetic      arrives ${bArrives}/${N_MIDJOIN} (drift ${arriveDrift})  leaves ${bLeaves}/${N_MIDJOIN + N_ANCHOR_EMB} (drift ${leaveDrift})
  http probe ms         storm p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length})  settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})  errors ${probeErrors.n}
  world log             ${logTotalLines} lines vs expected ${EXPECT_LOG_LINES} (drift ${logLineDriftVal})
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
if (deviantLog.length) console.log(`foreign-id frames (first 40):\n  ${deviantLog.join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — malformed-frame storm never wedged the sequencer`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
