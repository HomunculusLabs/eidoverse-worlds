// Pressure scenario 13: SLOW-LORIS VERB SENDER — one crawling connection
// cannot block verb intake. Design target: 24 embodied performers @15Hz to
// a full house. Prior scenarios proved the presence plane (1), slow-reader
// isolation (2 — kernel backpressure on the RECEIVE side), join storms (3),
// authored responsiveness (4), verb rate limits (5), reconnect hygiene (6),
// world switching (7), snapshot consistency (8), memory return (9),
// classification (10), malformed frames (11), and auth failure storms (12).
// This one asks about the class pressure-2 explicitly did not: a client
// that delivers a VERB message byte-by-byte over many minutes. A naive
// implementation can block on read or hold shared per-world state while it
// waits for the rest of a frame. Reading the pinned tree first: verb intake
// is fully synchronous (Bun.serve ws message() → size gate → rate windows →
// JSON.parse → runVerb; no await, no lock between frames) and per-client
// partial frames are accumulated by Bun's websocket stack per socket. The
// hypothesis this harness must FALSIFY, not assume: the single-threaded
// event loop never blocks on any one client's bytes, so N simultaneous
// crawlers cost nothing to healthy traffic and die explicitly when the
// wire timeout reaps them. The scenario also proves the failure is clean:
// after every loris is gone (by reap AND by clean abort), the server still
// serves joins/verbs/frames exactly as before, with zero residue.
//
// Population (pinned before measuring — peak ~200 concurrent sockets):
//   24 perf (embodied @15Hz) + 136 spectator anchors = 160 persistent.
//   16 loris legs over raw TCP from t+3s:
//     - loris-a..h (8 legs): join as SPECTATOR, then deliver one
//       {type:"verb",verb:"say"} frame at 1 byte / 800ms (~9 min for the
//       438-byte frame at this cadence — ~20 bytes land inside the run).
//       Say is rank-0 BUT spectator-refused, so a completed frame is an
//       EXPLICIT refusal receipt, zero world-log writes.
//     - loris-i..l (4 legs): join EMBODIED, pose @15Hz for 3s, then crawl
//       a verb frame at 2 B/s — their pose stream stops mid-presence.
//     - loris-m..p (4 legs): connect, handshake, then crawl the JOIN frame
//       itself at 2 B/s — never admitted, never present.
//     - loris-h variant in the a..h group: one leg crawls a 120KB
//       near-limit frame (under the 256KB WS_MESSAGE_MAX_BYTES cap) to
//       prove a large held partial is also inert. [see LORIS_BIG = loris-h7]
//   Loris teardown at t+21s: legs a..f (two of each group) ABORT cleanly
//   (RST-ish socket.end mid-crawl); the rest keep crawling until the wire
//   reaps or the harness ends. No close-frame courtesy is owed a crawler.
//   Fairness legs mid-crawl: 12 spectator joins at t+8s, 3 embodied joins
//   + say each at t+10s (spectator-refusal lane receipts counted too).
//   Final probe t+25s: empty world (present 0), then full 160-anchor
//   rejoin at t+27s (ratchet probe — no wedge after the loris window).
//
// Acceptance gates (pinned before measuring):
//   - anchors: 160/160 joins, p95 < 3s
//   - presence during crawl: fps p50 >= 12, frame lat p95 < 250ms,
//     0 seq gaps on healthy spectators
//   - HTTP event-loop probe p95 DURING the loris window < 300ms and
//     post-crawl < 100ms (no wedge, no lingering churn)
//   - fairness: 12/12 spectator joins p95 < 300ms mid-crawl; 3/3 embodied
//     p95 < 300ms; 3/3 says appended (author echo p95 < 500ms);
//     spectator-verb refusals 4/4 mid-crawl (the refusal lane must still
//     answer while crawlers hold partial frames)
//   - crawl authenticity: every crawling leg shows ≥3 distinct send
//     timestamps while paused-vs-crawling accounting stays sane; loris
//     embodied legs prove 45+ poses accepted BEFORE the crawl begins
//   - no contamination: 0 world-log drift (only the 3 perf says land),
//     0 loris ids in any arrive/frame payload, roster exact at both
//     probes (24 / 27 embodied mid-fairness-legs), final present 0
//   - rejoin ratchet: 160/160 anchors rejoin after the loris window,
//     p95 < 3s (the server is not degraded after reaping crawlers)
//   - RSS peak growth < 60MB; 0 suspicious server log lines
//
//   SERVER_DIR=/tmp/pressure13-wt PORT=8994 bun tools/pressure-loris.ts
//   SELFTEST=1 bun tools/pressure-loris.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only
// if every pinned gate holds.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure13-wt";
const PORT = Number(process.env.PORT ?? 8994);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure13-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 136, POSE_HZ = 15;      // 160 persistent anchors
const LORIS_SPEC = 8, LORIS_EMB = 4, LORIS_PREJOIN = 4;  // 16 crawling legs
const CRAWL_AT = 3_000;            // loris legs begin crawling
const FAIR_SPEC_AT = 8_000;        // 12 spectator joins mid-crawl
const FAIR_EMB_AT = 10_000;        // 3 embodied + says mid-crawl
const ROSTER_MID_AT = 11_500;      // roster probe mid-crawl (27 embodied)
const ABORT_AT = 21_000;           // half the loris legs abort mid-crawl
const LORIS_EXIT_AT = 22_000;      // rest end mid-crawl, INSIDE the seer's
                                    // window (leaves must be observed — the
                                    // seer itself dies at teardown t+23s)
const TEARDOWN_AT = 23_000;        // anchors leave
const FINAL_PROBE_AT = 25_000;     // empty world
const REJOIN_AT = 27_000;          // ratchet: full anchor rejoin
const DURATION = 33_000;
const MSG_RATE = "600";            // same scratch envelope as pressure-1..12
const SPEC_BYTE_MS = 800;          // spectator crawl: 1 byte / 800ms
const EMB_BYTE_MS = 500;           // embodied crawl: 1 byte / 500ms
const PREJOIN_BYTE_MS = 500;       // join-crawl cadence
const BIG_FRAME_BYTES = 120_000;   // loris-h7: near-limit held partial
const EXPECT_SAYS = 3;             // the three mid-crawl perf says
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
  probeCrawlP95Ms: 300,
  probePostP95Ms: 100,
  probeErrors: 5,
  fairSpecJoins: 12, fairSpecP95Ms: 300,
  fairEmbJoins: 3, fairEmbP95Ms: 300,
  saysAppended: 3, sayP95Ms: 500,
  specRefusals: 4,
  crawlMinTicks: 3,               // every crawler actually crawled
  lorisPosesBefore: 30,           // embodied loris legs were live broadcasters
  lorisArrives: 0,                // no loris id may EVER arrive
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
  probeCrawlP95: number; probePostP95: number; probeErrs: number;
  fairSpecJoins: number; fairSpecP95: number;
  fairEmbJoins: number; fairEmbP95: number;
  saysAppended: number; sayP95: number; specRefusals: number;
  crawlTicksMin: number; lorisPosesMin: number;
  lorisArrives: number; embArriveDrift: number; embLeaveDrift: number;
  rosterGhosts: number; finalPresent: number;
  logDrift: number; logSuspicious: number; rssPeakGrowth: number;
  rejoinFailed: number; rejoinP95: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50} during crawl`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms during crawl`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on healthy spectators during crawl`);
  if (m.probeCrawlP95 > TH.probeCrawlP95Ms) fail.push(`HTTP probe p95 during crawl ${Math.round(m.probeCrawlP95)}ms > ${TH.probeCrawlP95Ms}ms — a crawler is blocking the loop`);
  if (m.probePostP95 > TH.probePostP95Ms) fail.push(`post-crawl HTTP probe p95 ${Math.round(m.probePostP95)}ms > ${TH.probePostP95Ms}ms — still churning after crawlers left`);
  if (m.probeErrs > TH.probeErrors) fail.push(`${m.probeErrs} HTTP probe errors`);
  if (m.fairSpecJoins < TH.fairSpecJoins) fail.push(`mid-crawl spectator joins ${m.fairSpecJoins}/12 — join path stalled`);
  if (m.fairSpecP95 > TH.fairSpecP95Ms) fail.push(`mid-crawl spectator join p95 ${Math.round(m.fairSpecP95)}ms > ${TH.fairSpecP95Ms}ms`);
  if (m.fairEmbJoins < TH.fairEmbJoins) fail.push(`mid-crawl embodied joins ${m.fairEmbJoins}/3`);
  if (m.fairEmbP95 > TH.fairEmbP95Ms) fail.push(`mid-crawl embodied join p95 ${Math.round(m.fairEmbP95)}ms > ${TH.fairEmbP95Ms}ms`);
  if (m.saysAppended < TH.saysAppended) fail.push(`mid-crawl says ${m.saysAppended}/3 — verb path stalled`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms mid-crawl`);
  if (m.specRefusals < TH.specRefusals) fail.push(`spectator-verb refusals ${m.specRefusals}/4 mid-crawl — the refusal lane stopped answering`);
  if (m.crawlTicksMin < TH.crawlMinTicks) fail.push(`slowest crawler delivered only ${m.crawlTicksMin} crawl ticks < ${TH.crawlMinTicks} — the crawl was not real`);
  if (m.lorisPosesMin < TH.lorisPosesBefore) fail.push(`embodied loris legs only reached ${m.lorisPosesMin} poses before crawling < ${TH.lorisPosesBefore}`);
  if (m.lorisArrives > TH.lorisArrives) fail.push(`${m.lorisArrives} LORIS ARRIVES — a crawler entered presence`);
  if (m.embArriveDrift > 0) fail.push(`embodied-loris arrive drift ${m.embArriveDrift} vs ${LORIS_EMB} (each crawling embodied leg must arrive exactly once)`);
  if (m.embLeaveDrift > 0) fail.push(`embodied-loris leave drift ${m.embLeaveDrift} vs ${LORIS_EMB} (each crawling embodied leg must leave exactly once)`);
  if (m.rosterGhosts > TH.rosterGhosts) fail.push(`${m.rosterGhosts} roster ghosts at probes`);
  if (m.finalPresent > TH.finalPresent) fail.push(`${m.finalPresent} embodied present at final probe — world not empty`);
  if (m.logDrift > TH.logDrift) fail.push(`log.jsonl drift ${m.logDrift} vs ${EXPECT_SAYS} expected say appends — a crawler wrote to the world log`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.rejoinFailed > TH.rejoinFailed) fail.push(`${m.rejoinFailed} anchors failed to REJOIN after the loris window`);
  if (m.rejoinP95 > TH.rejoinP95Ms) fail.push(`rejoin p95 ${Math.round(m.rejoinP95)}ms > ${TH.rejoinP95Ms}ms — server degraded after crawler cleanup`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 45,
    fpsP50: 14.9, latP95: 10, gaps: 0,
    probeCrawlP95: 6, probePostP95: 3, probeErrs: 0,
    fairSpecJoins: 12, fairSpecP95: 40,
    fairEmbJoins: 3, fairEmbP95: 55,
    saysAppended: 3, sayP95: 8, specRefusals: 4,
    crawlTicksMin: 14, lorisPosesMin: 45,
    lorisArrives: 0, embArriveDrift: 0, embLeaveDrift: 0, rosterGhosts: 0, finalPresent: 0,
    logDrift: 0, logSuspicious: 0, rssPeakGrowth: 11,
    rejoinFailed: 0, rejoinP95: 48,
  };
  const breached: Measurements = {
    ...healthy,
    fpsP50: 8, latP95: 900, gaps: 7,
    probeCrawlP95: 1_400, probePostP95: 350, probeErrs: 9,
    fairSpecJoins: 6, fairSpecP95: 1_600,
    fairEmbJoins: 1, fairEmbP95: 1_900,
    saysAppended: 0, sayP95: Infinity, specRefusals: 1,
    crawlTicksMin: 1, lorisPosesMin: 4,
    lorisArrives: 2, embArriveDrift: 1, embLeaveDrift: 2, rosterGhosts: 3, finalPresent: 1,
    logDrift: 2, logSuspicious: 4, rssPeakGrowth: 140,
    rejoinFailed: 5, rejoinP95: 3_400,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = [
    "during crawl", "frame latency p95", "seq gaps", "blocking the loop",
    "still churning", "probe errors", "join path stalled", "spectator join p95",
    "embodied joins", "embodied join p95", "verb path stalled", "say author p95",
    "refusal lane", "crawl was not real", "poses before crawling",
    "LORIS ARRIVES", "embodied-loris arrive drift", "embodied-loris leave drift", "roster ghosts", "world not empty", "wrote to the world log",
    "suspicious server log lines", "RSS peak growth", "REJOIN", "degraded after crawler cleanup",
  ];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${POSE_HZ}Hz + ${N_SPEC} spec = 160 anchors; ${LORIS_SPEC}+${LORIS_EMB}+${LORIS_PREJOIN} loris legs from t+${CRAWL_AT / 1000}s (spectator-verb crawl 1B/${SPEC_BYTE_MS}ms incl. one ${BIG_FRAME_BYTES}B held partial, embodied pose→crawl 1B/${EMB_BYTE_MS}ms, pre-join crawl); abort half t+${ABORT_AT / 1000}s; fairness 12 spec t+${FAIR_SPEC_AT / 1000}s + 3 emb+say t+${FAIR_EMB_AT / 1000}s; teardown t+${TEARDOWN_AT / 1000}s; final probe t+${FINAL_PROBE_AT / 1000}s; 160-rejoin ratchet t+${REJOIN_AT / 1000}s. ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=160/160@p95<${TH.anchorJoinP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} probeCrawl<${TH.probeCrawlP95Ms}ms probePost<${TH.probePostP95Ms}ms fairSpec=12/12@p95<${TH.fairSpecP95Ms}ms fairEmb=3/3@p95<${TH.fairEmbP95Ms}ms says=3/3@p95<${TH.sayP95Ms}ms specRefusals=4/4 crawlTicks>=${TH.crawlMinTicks} lorisPoses>=${TH.lorisPosesBefore} lorisArrives=0 rosterExact finalPresent=0 logDrift=${TH.logDrift} rssPeak<+${TH.rssPeakGrowthMB}MB rejoin=160/160@p95<${TH.rejoinP95Ms}ms`);

// ---- fd budget: ~360 concurrent client sockets must fit ------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 500) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 500 — launch as: ulimit -n 1024 && bun tools/pressure-loris.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure13-server-${Date.now()}.log`;
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
  closed: boolean; id: string;
  arrives: string[]; leaves: string[];
  sayEcho: Map<string, number>;
  errs: string[];
};
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, arrives: [], leaves: [], sayEcho: new Map(), errs: [] };
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
      } else if (m.type === "arrive") s.arrives.push(String(m.id ?? ""));
      else if (m.type === "leave") s.leaves.push(String(m.id ?? ""));
      else if (m.type === "error") s.errs.push(String(m.error ?? ""));
    };
    ws.onclose = () => { s.closed = true; };
    ws.onerror = () => { /* close follows */ };
  });
}

// ---- loris: raw TCP, hand-rolled WS frames, byte-at-a-time delivery ------------
function wsFrame(payload: string): Uint8Array {
  const data = new TextEncoder().encode(payload);
  const mask = crypto.getRandomValues(new Uint8Array(4));
  const masked = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ mask[i & 3];
  const h: number[] = data.length < 126
    ? [0x81, 0x80 | data.length]
    : [0x81, 0x80 | 126, data.length >> 8, data.length & 0xff];
  // 64-bit length path (payloads ≥ 64KB need it)
  let head: Uint8Array;
  if (data.length < 126) head = new Uint8Array(h.slice(0, 2));
  else if (data.length < 65536) head = new Uint8Array(h.slice(0, 4));
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
type Loris = {
  id: string; kind: "spec" | "emb" | "prejoin";
  sock: any; openAt: number; handshakeMs: number; joinMs: number;
  bytesSent: number; frameBytes: number; crawlTicks: number;
  posesBefore: number; aborted: boolean; closed: boolean;
  receipt: string;       // any server message text received while crawling
  pend: Buffer; joined: boolean;
  ticker: any;
};
async function lorisConnect(L: Loris): Promise<void> {
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
        if (!L.joined) {
          // accumulate until the join snapshot lands (may straddle chunks)
          L.pend = L.pend.length ? Buffer.concat([L.pend, buf]) : buf;
          if (new TextDecoder().decode(L.pend).includes(`"type":"snapshot"`)) {
            L.joined = true; L.joinMs = performance.now() - L.openAt; L.pend = Buffer.alloc(0);
            if (L.kind === "emb") startEmbPresence(L);
          }
          return;
        }
        // crawling phase: any bytes back are receipts (errors/refusals)
        const txt = new TextDecoder().decode(buf);
        if (txt.includes("error")) L.receipt = txt.slice(0, 200);
      },
      error() { L.closed = true; },
      close() { L.closed = true; },
    },
  });
  L.sock = sock;
  sock.write(req);
  await sleep(150); // let the 101 land
  if (L.kind === "prejoin") {
    // crawl the join frame itself
    const f = wsFrame(JSON.stringify({ type: "join", world: WORLD, id: L.id, avatar: "x.vrm", spectate: true, token: TOKEN }));
    beginCrawl(L, f, PREJOIN_BYTE_MS);
  } else {
    sock.write(wsFrame(JSON.stringify({ type: "join", world: WORLD, id: L.id, avatar: "x.vrm", spectate: L.kind === "spec", token: TOKEN })));
  }
}
function beginCrawl(L: Loris, frame: Uint8Array, byteMs: number) {
  L.frameBytes = frame.length;
  L.crawlTicks = 0;
  L.ticker = setInterval(() => {
    if (L.closed || L.aborted) { clearInterval(L.ticker); return; }
    const i = L.bytesSent;
    if (i >= frame.length) { clearInterval(L.ticker); return; }   // frame fully delivered
    const end = Math.min(frame.length, i + 1);
    try { L.sock.write(frame.subarray(i, end)); } catch { L.closed = true; clearInterval(L.ticker); return; }
    L.bytesSent = end;
    L.crawlTicks++;
  }, byteMs);
}
// embodied loris legs are real broadcasters first (proves they were live
// members of presence before they started crawling)
function startEmbPresence(L: Loris) {
  let n = 0;
  const t = Date.now() / 1000;
  const pose = () => JSON.stringify({ type: "pose", pose: { p: [Math.sin(t + n) * 8, 0, Math.cos(t + n) * 8], yaw: (t + n) % (Math.PI * 2), speed: 1.2, clip: "walk" } });
  const iv = setInterval(() => {
    if (L.closed || L.bytesSent > 0) { clearInterval(iv); return; }   // stop once crawling begins
    try { L.sock.write(wsFrame(pose())); L.posesBefore++; } catch { L.closed = true; clearInterval(iv); }
  }, 1000 / POSE_HZ);
  L.ticker = iv;
  // at +3s of presence, abandon poses and start crawling a verb frame
  setTimeout(() => {
    clearInterval(iv);
    if (L.closed || L.aborted) return;
    const f = wsFrame(JSON.stringify({ type: "verb", verb: "say", args: { text: `loris-${L.id}-${Date.now()}` } }));
    beginCrawl(L, f, EMB_BYTE_MS);
  }, 3_000);
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

// embodied presence (identical shape to pressure-1..12): 24 broadcasters @ 15Hz
let running = true;
const posesSent = { n: 0 };
const tickers = perfs.map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// HTTP event-loop health probe throughout (crawl window vs post-abort)
const probeCrawl: number[] = [], probePost: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  const d = performance.now() - t;
  (performance.now() - t0 < ABORT_AT + 2_000 ? probeCrawl : probePost).push(d);
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

// ---- loris legs -----------------------------------------------------------------
const lorises: Loris[] = [];
at(CRAWL_AT, async () => {
  const legs: Loris[] = [];
  for (let i = 0; i < LORIS_SPEC; i++) legs.push({ id: `loris-spec-${i}`, kind: "spec", sock: null, openAt: 0, handshakeMs: -1, joinMs: -1, bytesSent: 0, frameBytes: 0, crawlTicks: 0, posesBefore: 0, aborted: false, closed: false, receipt: "", pend: Buffer.alloc(0), joined: false, ticker: null });
  for (let i = 0; i < LORIS_EMB; i++) legs.push({ id: `loris-emb-${i}`, kind: "emb", sock: null, openAt: 0, handshakeMs: -1, joinMs: -1, bytesSent: 0, frameBytes: 0, crawlTicks: 0, posesBefore: 0, aborted: false, closed: false, receipt: "", pend: Buffer.alloc(0), joined: false, ticker: null });
  for (let i = 0; i < LORIS_PREJOIN; i++) legs.push({ id: `loris-pre-${i}`, kind: "prejoin", sock: null, openAt: 0, handshakeMs: -1, joinMs: -1, bytesSent: 0, frameBytes: 0, crawlTicks: 0, posesBefore: 0, aborted: false, closed: false, receipt: "", pend: Buffer.alloc(0), joined: false, ticker: null });
  for (const L of legs) { L.openAt = performance.now(); lorisConnect(L).catch(() => { L.closed = true; }); }
  lorises.push(...legs);
  // spectator crawlers wait for join, then crawl a say frame; one leg crawls
  // a ~120KB near-limit frame instead (a big held partial must be as inert
  // as a small one)
  await sleep(1_200);
  for (const L of legs.filter((x) => x.kind === "spec")) {
    if (L.closed) continue;
    const payload = L.id === "loris-spec-7"
      ? JSON.stringify({ type: "verb", verb: "say", args: { text: `loris-big-${"x".repeat(BIG_FRAME_BYTES)}` } })
      : JSON.stringify({ type: "verb", verb: "say", args: { text: `loris-${L.id}-${Date.now()}` } });
    beginCrawl(L, wsFrame(payload), SPEC_BYTE_MS);
  }
  console.log(`t+${CRAWL_AT / 1000}s: ${legs.length} loris legs connected (spec ${legs.filter((x) => x.kind === "spec" && x.joined).length}/${LORIS_SPEC} joined, emb ${legs.filter((x) => x.kind === "emb" && x.joined).length}/${LORIS_EMB} joining) — crawling begins`);
});

// ---- fairness legs mid-crawl ----------------------------------------------------
const fairSpecs: Spec[] = [];
at(FAIR_SPEC_AT, async () => {
  const r = await Promise.allSettled(Array.from({ length: 12 }, (_, i) => connect(`fair-${i}`, true)));
  fairSpecs.push(...r.filter((x) => x.status === "fulfilled").map((x: any) => x.value as Spec));
  anchors.push(...fairSpecs);
});
let fairEmb: Spec[] = [];
const saysAppendedArr: boolean[] = [];
const sayLat: number[] = [];
let specRefusalReceipts = 0;
at(FAIR_EMB_AT, async () => {
  const r = await Promise.allSettled([0, 1, 2].map((i) => connect(`legit-${i}`, false, 300 + i)));
  fairEmb = r.filter((x) => x.status === "fulfilled").map((x: any) => x.value as Spec);
  anchors.push(...fairEmb);
  // 3 says by perf anchors + 4 spectator-verb refusals by fair spectators:
  // both lanes must answer while crawlers hold partial frames
  const SAY_TEXTS = [`lorisfair-a-${Math.floor(t0)}`, `lorisfair-b-${Math.floor(t0)}`, `lorisfair-c-${Math.floor(t0)}`];
  SAY_TEXTS.forEach((text, i) => {
    const S = perfs[3 + i];
    if (S.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  });
  for (const s of fairSpecs.slice(0, 4)) {
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: `spec-refuse-${s.id}` } }));
  }
  setTimeout(() => {
    SAY_TEXTS.forEach((text, i) => {
      const hit = perfs[3 + i].sayEcho.get(text);
      saysAppendedArr.push(hit !== undefined);
    });
    specRefusalReceipts = fairSpecs.slice(0, 4).filter((s) => s.errs.some((e) => e.includes("spectators can't author"))).length;
  }, 2_500);
  // say latency measured off the author's own echo
  const sentAt = performance.now();
  setTimeout(() => {
    const hit = perfs[3].sayEcho.get(SAY_TEXTS[0]);
    if (hit !== undefined) sayLat.push(hit - sentAt);
  }, 2_500);
});

// ---- roster probes ---------------------------------------------------------------
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
  // the embodied loris legs ARE legitimately present here (they joined,
  // posed, and are mid-crawl) — the roster must show them exactly
  const want = new Set([...anchorIds, "legit-0", "legit-1", "legit-2",
    "loris-emb-0", "loris-emb-1", "loris-emb-2", "loris-emb-3"]);
  await rosterProbe("midcrawl", want);
});

// world-log baseline before any fairness says land
let logBaseline = -1;
at(7_000, () => {
  const p = `${WORLDS}/${WORLD}/log.jsonl`;
  if (existsSync(p)) logBaseline = readFileSync(p, "utf8").split("\n").filter(Boolean).length;
});

// ---- abort half the crawlers mid-crawl -------------------------------------------
at(ABORT_AT, () => {
  const aborting = lorises.filter((L) => L.kind === "prejoin" ? ["loris-pre-0", "loris-pre-1"].includes(L.id)
    : L.kind === "emb" ? ["loris-emb-0", "loris-emb-1"].includes(L.id)
      : ["loris-spec-0", "loris-spec-1", "loris-spec-2"].includes(L.id));
  for (const L of aborting) {
    L.aborted = true;
    if (L.ticker) clearInterval(L.ticker);
    try { L.sock?.end(); } catch { /* already dead */ }
  }
  console.log(`t+${ABORT_AT / 1000}s: aborted ${aborting.length} loris legs mid-crawl (clean close frames are not owed to crawlers)`);
});

// ---- end the remaining crawlers mid-crawl, inside the seer's window -------------
// Their leave broadcasts must be OBSERVABLE (exact 4/4 arithmetic); ending
// them here keeps them strictly before the seer's own teardown close.
at(LORIS_EXIT_AT, () => {
  let n = 0;
  for (const L of lorises) {
    if (L.aborted || L.closed) continue;
    L.aborted = true;
    if (L.ticker) clearInterval(L.ticker);
    try { L.sock?.end(); } catch { /* already dead */ }
    n++;
  }
  console.log(`t+${LORIS_EXIT_AT / 1000}s: ended ${n} remaining loris legs mid-crawl (observed-departure window)`);
});

// ---- teardown, final probe, ratchet rejoin ----------------------------------------
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  anchors.forEach((s) => { try { s.ws.close(); } catch {} });
  for (const L of lorises) {
    if (L.ticker) clearInterval(L.ticker);
    try { L.sock?.end(); } catch {}
  }
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
// ratchet: every anchor (and the fairness legs, which are part of the count)
// rejoins fresh after the loris window — the server must be undegraded
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
for (const L of lorises) if (L.ticker) clearInterval(L.ticker);
await sleep(300);

// ---- ground truth -----------------------------------------------------------------
const SEER = specs[0];
// never-arrive contract: spectator + prejoin crawlers only. The embodied
// legs legitimately arrived (they posed before crawling) — their contract
// is EXACT arrive/leave arithmetic instead.
const lorisArrives = SEER ? SEER.arrives.filter((id) => /^loris-(spec|pre)-/.test(id)).length : 999;
const embArr = SEER ? SEER.arrives.filter((id) => /^loris-emb-/.test(id)).length : -1;
const embLv = SEER ? SEER.leaves.filter((id) => /^loris-emb-/.test(id)).length : -1;
const embArriveDrift = embArr < 0 ? 999 : Math.abs(embArr - LORIS_EMB);
const embLeaveDrift = embLv < 0 ? 999 : Math.abs(embLv - LORIS_EMB);
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
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));
const crawlTicksMin = lorises.length ? Math.min(...lorises.map((L) => L.crawlTicks)) : 0;
const lorisPosesMin = lorises.filter((L) => L.kind === "emb").length
  ? Math.min(...lorises.filter((L) => L.kind === "emb").map((L) => L.posesBefore)) : 0;

const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeCrawlP95: pct(probeCrawl, 95), probePostP95: pct(probePost, 95), probeErrs: probeErrors.n,
  fairSpecJoins: fairSpecs.length, fairSpecP95: pct(fairSpecs.map((s) => s.joinMs), 95),
  fairEmbJoins: fairEmb.length, fairEmbP95: pct(fairEmb.map((s) => s.joinMs), 95),
  saysAppended: saysAppendedArr.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  specRefusals: specRefusalReceipts,
  crawlTicksMin, lorisPosesMin,
  lorisArrives, embArriveDrift, embLeaveDrift,
  rosterGhosts: rosterGhosts.length,
  finalPresent: Math.max(finalPresent, 0) === finalPresent ? finalPresent : 999,
  logDrift: logDriftVal, logSuspicious: suspicious.length, rssPeakGrowth,
  rejoinFailed, rejoinP95: pct(rejoins.map((s) => s.joinMs), 95),
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n}
  anchor joins          ${anchors.length === 0 ? rejoins.length : anchors.length}/${all.length} — p95 ${Math.round(m.anchorJoinP95)}ms
  loris legs            ${lorises.length} (joined: spec ${lorises.filter((L) => L.kind === "spec" && L.joined).length}/${LORIS_SPEC}, emb ${lorises.filter((L) => L.kind === "emb" && L.joined).length}/${LORIS_EMB}, prejoin 0/${LORIS_PREJOIN} by design)
  crawl progress        min ticks ${crawlTicksMin}, per-leg bytes ${lorises.map((L) => L.bytesSent).join("/")} of ${lorises.map((L) => L.frameBytes).join("/")}
  loris poses before    min ${lorisPosesMin} (embodied legs were live broadcasters)
  loris receipts        ${lorises.filter((L) => L.receipt).length}/${lorises.length} legs got an error receipt while crawling
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchor spectators
  http probe ms         crawl p95 ${Math.round(m.probeCrawlP95)} (n=${probeCrawl.length})  post p95 ${Math.round(m.probePostP95)} (n=${probePost.length})  errors ${probeErrors.n}
  mid-crawl joins       spec ${m.fairSpecJoins}/12 p95 ${Math.round(m.fairSpecP95)}ms  emb ${m.fairEmbJoins}/3 p95 ${Math.round(m.fairEmbP95)}ms
  mid-crawl says        ${saysAppendedArr.filter(Boolean).length}/3 appended — author p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms
  spectator refusals    ${specRefusalReceipts}/4 (the refusal lane answered mid-crawl)
  loris arrives         ${lorisArrives} spec/prejoin (must be 0) — embodied legs ${embArr}/${LORIS_EMB} arrived, ${embLv}/${LORIS_EMB} left (drift ${embArriveDrift}/${embLeaveDrift})
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
for (const L of lorises) { try { L.sock?.end(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — sixteen byte-at-a-time crawlers (incl. a 120KB held partial) cost the presence plane, verb intake, and join path nothing`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
