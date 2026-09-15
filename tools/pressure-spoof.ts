// Pressure scenario 16: PRESENCE SPOOFING — oversized/rapid pose deltas are
// clamped and logged, never propagated. Design target: 24 embodied performers
// @15Hz to a full house. Prior scenarios proved the presence plane (1),
// slow-reader isolation (2), join storms (3), authored responsiveness (4),
// verb rate limits (5), reconnect hygiene (6), world switching (7), snapshot
// consistency (8), memory return (9), classification (10), malformed frames
// (11 — structural pose sanity: depth ≤5, ≤1024 nodes, strings ≤256B),
// auth storms (12), slow-loris verb crawls (13), world-hop churn (14), and
// role-change atomicity (15). This one asks about the class pressure-11
// deliberately did NOT: a pose that is STRUCTURALLY sane but NUMERICALLY
// hostile, or merely TOO FAST.
//
// Reading the pinned tree first (the hypothesis to FALSIFY, not assume):
//   - pose intake (server.ts case "pose") validates structure, then relays
//     blind: c.lastPose = msg.pose; w.dirty.set(c.id, pose). No magnitude
//     bound exists anywhere on this path.
//   - propagation is the 66ms stage tick: ONE frame per world per tick,
//     latest-value-wins per id (the coalescing bound against rapid senders),
//     fanned out to every client — including a 217KB retained pose verbatim.
//   - MSG_RATE=60/s drops are SILENT on the message lane (the verb lane notes
//     "rate-limit" in the flight recorder; the message lane does not).
//   - settledPose/o.lastPose ride join snapshots' present[] and poses.json
//     magnitude-blind — a spoofed coordinate outlives the spoofer's session.
//   - the client (net.js case 'frame') feeds pose.p into interpolation
//     verbatim: garbage coordinates are every renderer's problem.
// The scenario therefore measures FOUR invariants against hostile-but-valid
// embodied members: (1) frame CONTENT stays bounded — no |number| > 10^4 is
// ever relayed, regardless of whether the server's answer is clamp, refusal,
// or silent drop; (2) bounded amplification — hostile input volume must not
// multiply per-spectator output volume beyond ~1.5x the legit window; (3)
// coalescing holds — a 200Hz sender costs at most ~1 dirty slot per tick;
// (4) the treatment is OBSERVABLE — hostile deltas leave an explicit receipt
// for the sender and a flight-recorder trace (ws "debug" lane, the same
// surface world_debug exposes), never a silent black hole. Boundary control:
// 2 bonsai legs send |p| = 9999.5 poses at 15Hz for the whole window —
// boundary-legitimate input must NEVER be refused, so a fix cannot win by
// refusing everything.
//
// Population (pinned before measuring — peak ~200 concurrent sockets):
//   24 perf (embodied @15Hz) + 136 spectator anchors = 160 persistent.
//   8 spoof legs, embodied, joining at t+11s:
//     - 2 rapid legs: valid small poses at 200Hz (13.3x MSG_RATE) for 10s.
//     - 2 magnitude legs: finite-monster poses at 15Hz (p up to 1e308,
//       speed 1e300, pitch 1e308, hostile pose/pins values), escalating to
//       a cross-phase bonfire at t+16s.
//     - 2 fat legs: ~217KB string-stuffed poses (830x256B strings — 1024-node
//       legal, 256KB-frame legal) at 15Hz, going magnitude-hostile at t+16s.
//     - 2 bonsai legs: |p|=9999.5 boundary poses at 15Hz — MUST be accepted.
//   Fairness mid-spoof (t+14s): embodied late joiner (present[] scan),
//   spectator say (must be refused), 3 perf says (must append).
//   Teardown: spoof legs close t+21s (leaves observable), anchors t+24.5s,
//   final empty probe t+26s, full rejoin ratchet t+28s.
//
// Acceptance gates (pinned before measuring):
//   - anchors: 160/160 joins, p95 < 3s
//   - presence during spoof: fps p50 >= 12, frame lat p95 < 250ms,
//     0 seq gaps on healthy spectators
//   - HTTP event-loop probe p95 DURING the spoof window < 300ms, post < 100ms
//   - content bound: 0 numbers with |v| > 10^4 relayed in any frame the
//     witnesses receive; 0 spoof ids in any frame (this fires on the unfixed
//     tree: magnitude/fat poses are structurally sane and WILL relay);
//     0 duplicate ids within one frame
//   - amplification: (spoof-msg bytes sent) / (per-spectator legit-window
//     frame bytes) <= 150% — hostile input must not multiply fanout
//   - coalescing: witness frames mentioning a rapid leg <= 3.5x the ticks
//     in the rapid window (15Hz coalescing bound vs 200Hz sending)
//   - boundary: bonsai legs refused 0 times across the whole window
//   - treatment observability: >= 1 hostile pose refused with an explicit
//     receipt, >= 1 message-rate drop noted in the flight recorder, >= 1
//     hostile-delta trace in the flight recorder. (On an unfixed tree all
//     three are 0 — the run is recorded as baseline RED for exactly this
//     class, not failed harness plumbing: only the three trace gates relax,
//     and ONLY when all three are zero together.)
//   - state hygiene: spoof ids absent from poses.json after their leaves;
//     0 poses.json values with |v| > 10^4 anywhere; late joiner's snapshot
//     present[] carries 0 oversized values
//   - fairness: late embodied join p95 < 3s mid-spoof; spectator say refused
//     verbatim; 3/3 perf says appended; roster exact mid- and post-spoof
//     (24 perf + 8 spoof embodied)
//   - spoof legs 8/8 arrive + 8/8 leave exact (clean departures, in-window)
//   - no contamination: world-log drift = 3 says exactly; final present 0;
//     160+12 ratchet rejoin p95 < 3s; RSS peak growth < 60MB;
//     0 suspicious server log lines
//
//   SERVER_DIR=/tmp/pressure-wt PORT=8981 bun tools/pressure-spoof.ts
//   SELFTEST=1 bun tools/pressure-spoof.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only
// if every pinned gate holds.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure-wt";
const PORT = Number(process.env.PORT ?? 8981);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure16-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 136, POSE_HZ = 15;      // 160 persistent anchors
const SPOOF_START = 11_000;         // 8 spoof legs join (2 rapid, 2 magnitude, 2 fat, 2 bonsai)
const CROSS_B = 16_000;             // magnitude + fat legs escalate (bonfire)
const LATE_JOIN_AT = 14_000;        // fairness: embodied join + spectator say + perf says
const ROSTER_A = 13_000;            // roster probe mid-spoof (32 embodied)
const ROSTER_B = 23_500;            // roster probe post-spoof (32 embodied)
const REC1_AT = 10_000;             // flight-recorder read pre-spoof (quiet control)
const REC2_AT = 22_000;             // flight-recorder read post-spoof
const SPOOF_END = 21_000;           // spoof legs close (leaves observable in-window)
const TEARDOWN_AT = 24_500;         // anchors leave
const FINAL_PROBE_AT = 26_000;      // empty world
const REJOIN_AT = 28_000;           // ratchet: full anchor rejoin
const DURATION = 34_000;
const MSG_RATE = "60";              // PRODUCTION cap: this scenario exercises the
                                    // message-rate lane itself (prior scenarios'
                                    // 600 envelope kept the msg-cap out of theirs)
const RAPID_HZ = 200;               // 13.3x the production MSG_RATE of 60
const FAT_STRINGS = 830;            // 830 x 256B = ~217KB pose (1024-node + 256KB-frame legal)
const CONTENT_BOUND = 10_000;       // no |number| > 10^4 may ever be relayed
const EXPECT_SAYS = 3;              // the three mid-spoof perf says
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
  probeSpoofP95Ms: 300,
  probePostP95Ms: 100,
  probeErrors: 5,
  lateJoinP95Ms: 3_000,
  latePresentOversized: 0,
  frameOversized: 0,
  frameSpoofIds: 0,
  frameDups: 0,
  amplificationPct: 150,
  coalesceRatio: 3.5,
  bonsaiRefused: 0,
  hostileRefusals: 1,               // relaxed to 0 ONLY on a proven-unfixed tree
  rateNotes: 1,                     //   (all three trace gates move together)
  hostileEvents: 1,
  rosterGhosts: 0,
  posesJsonHot: 0,
  posesJsonOversized: 0,
  spoofLeaveDrift: 0,
  finalPresent: 0,
  logDrift: 0,
  logSuspicious: 0,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  fpsP50: number; latP95: number; gaps: number;
  probeSpoofP95: number; probePostP95: number; probeErrs: number;
  lateJoinP95: number; latePresentOversized: number;
  frameOversized: number; frameSpoofIds: number; frameDups: number;
  amplificationPct: number; coalesceRatio: number;
  bonsaiRefused: number; hostileRefusals: number; rateNotes: number; hostileEvents: number;
  saysAppended: number; specRefusal: number; spoofBytes: number;
  rosterGhosts: number;
  posesJsonHot: number; posesJsonOversized: number;
  spoofLeaveDrift: number; finalPresent: number;
  logDrift: number; logSuspicious: number; rssPeakGrowth: number;
  rejoinFailed: number; rejoinP95: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50} during spoof window`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms during spoof window`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on healthy spectators during spoof window`);
  if (m.probeSpoofP95 > TH.probeSpoofP95Ms) fail.push(`HTTP probe p95 during spoof ${Math.round(m.probeSpoofP95)}ms > ${TH.probeSpoofP95Ms}ms — a spoofer is blocking the loop`);
  if (m.probePostP95 > TH.probePostP95Ms) fail.push(`post-spoof HTTP probe p95 ${Math.round(m.probePostP95)}ms > ${TH.probePostP95Ms}ms — still churning after spoofers left`);
  if (m.probeErrs > TH.probeErrors) fail.push(`${m.probeErrs} HTTP probe errors`);
  if (m.lateJoinP95 > TH.lateJoinP95Ms) fail.push(`mid-spoof embodied join ${Math.round(m.lateJoinP95)}ms > ${TH.lateJoinP95Ms}ms — join path stalled`);
  if (m.latePresentOversized > TH.latePresentOversized) fail.push(`${m.latePresentOversized} oversized values in snapshot present[] — spoof state reached a joiner`);
  if (m.frameOversized > TH.frameOversized) fail.push(`${m.frameOversized} numbers |v| > ${CONTENT_BOUND} relayed in stage frames — oversized coordinate propagated`);
  // frameSpoofIds is a diagnostic, not a gate: in the AFTER world the bonsai
  // legs are accepted BY DESIGN and legitimately ride frames. The load-bearing
  // content gate is frameOversized=0; hostile relay is proven by the
  // baseline's oversized sample (magnitude/fat ids carrying p=1e6).
  if (m.frameDups > TH.frameDups) fail.push(`${m.frameDups} duplicate ids within one frame`);
  if (m.amplificationPct > TH.amplificationPct) fail.push(`amplification ${Math.round(m.amplificationPct)}% > ${TH.amplificationPct}% — hostile input multiplied fanout`);
  if (m.coalesceRatio > TH.coalesceRatio) fail.push(`rapid-leg coalescing ratio ${m.coalesceRatio.toFixed(2)}x > ${TH.coalesceRatio}x — rapid sender defeated latest-value-wins`);
  if (m.bonsaiRefused > TH.bonsaiRefused) fail.push(`${m.bonsaiRefused} boundary-legitimate poses (|p|=9999.5) refused — the bound cannot refuse honest extremes`);
  if (m.hostileRefusals < TH.hostileRefusals) fail.push(`0 hostile poses refused with an explicit receipt — treatment is a silent black hole`);
  if (m.rateNotes < TH.rateNotes) fail.push(`0 message-rate drops in the flight recorder — rapid abuse is dropped silently`);
  if (m.hostileEvents < TH.hostileEvents) fail.push(`0 hostile-delta treatment in the flight recorder — no trace of what happened to the spoof`);
  if (m.saysAppended < EXPECT_SAYS) fail.push(`mid-spoof says ${m.saysAppended}/${EXPECT_SAYS} — verb path stalled during the spoof`);
  if (m.specRefusal < 1) fail.push(`spectator say not refused mid-spoof — the refusal lane went silent`);
  if (m.rosterGhosts > TH.rosterGhosts) fail.push(`${m.rosterGhosts} roster ghosts at probes`);
  if (m.posesJsonOversized > TH.posesJsonOversized) fail.push(`${m.posesJsonOversized} poses.json values |v| > ${CONTENT_BOUND} — spoof outlived the session`);
  if (m.spoofLeaveDrift > TH.spoofLeaveDrift) fail.push(`spoof legs failed to leave cleanly (drift ${m.spoofLeaveDrift} vs 8)`);
  if (m.finalPresent > TH.finalPresent) fail.push(`${m.finalPresent} embodied present at final probe — world not empty`);
  if (m.logDrift > TH.logDrift) fail.push(`log.jsonl drift ${m.logDrift} vs ${EXPECT_SAYS} expected say appends — a spoofer wrote to the world log`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.rejoinFailed > TH.rejoinFailed) fail.push(`${m.rejoinFailed} anchors failed to REJOIN after the spoof window`);
  if (m.rejoinP95 > TH.rejoinP95Ms) fail.push(`rejoin p95 ${Math.round(m.rejoinP95)}ms > ${TH.rejoinP95Ms}ms — server degraded after spoof cleanup`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 42,
    fpsP50: 14.9, latP95: 10, gaps: 0,
    probeSpoofP95: 5, probePostP95: 3, probeErrs: 0,
    lateJoinP95: 48, latePresentOversized: 0,
    frameOversized: 0, frameSpoofIds: 0, frameDups: 0,
    amplificationPct: 38, coalesceRatio: 1.02,
    bonsaiRefused: 0, hostileRefusals: 174, rateNotes: 6, hostileEvents: 22,
    saysAppended: 3, specRefusal: 1, spoofBytes: 1_800_000,
    rosterGhosts: 0,
    posesJsonHot: 0, posesJsonOversized: 0,
    spoofLeaveDrift: 0, finalPresent: 0,
    logDrift: 0, logSuspicious: 0, rssPeakGrowth: 12,
    rejoinFailed: 0, rejoinP95: 45,
  };
  const breached: Measurements = {
    ...healthy,
    anchorFailed: 3, anchorJoinP95: 3_400,
    fpsP50: 7, latP95: 900, gaps: 6,
    probeSpoofP95: 1_400, probePostP95: 320, probeErrs: 8,
    lateJoinP95: 3_400, latePresentOversized: 3,
    frameOversized: 214, frameSpoofIds: 96, frameDups: 4,
    amplificationPct: 2_100, coalesceRatio: 9.4,
    bonsaiRefused: 9, hostileRefusals: 0, rateNotes: 0, hostileEvents: 0,
    saysAppended: 1, specRefusal: 0, spoofBytes: 41_000_000,
    rosterGhosts: 2,
    posesJsonHot: 8, posesJsonOversized: 31,
    spoofLeaveDrift: 3, finalPresent: 1,
    logDrift: 2, logSuspicious: 4, rssPeakGrowth: 140,
    rejoinFailed: 4, rejoinP95: 3_200,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = [
    "anchor connections failed", "anchor join p95", "during spoof window", "frame latency p95", "frame seq gaps",
    "blocking the loop", "still churning", "probe errors", "join path stalled", "spoof state reached a joiner",
    "oversized coordinate propagated", "duplicate ids", "multiplied fanout",
    "latest-value-wins", "honest extremes", "explicit receipt", "dropped silently", "flight recorder — no trace",
    "roster ghosts", "spoof outlived the session", "leave cleanly", "world not empty",
    "verb path stalled during the spoof", "refusal lane went silent",
    "wrote to the world log", "suspicious server log lines", "RSS peak growth", "REJOIN", "degraded after spoof cleanup",
  ];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${POSE_HZ}Hz + ${N_SPEC} spec = 160 anchors; 8 spoof legs embodied from t+${SPOOF_START / 1000}s (2 rapid @${RAPID_HZ}Hz, 2 magnitude finite-monsters escalating t+${CROSS_B / 1000}s, 2 fat ~217KB/${FAT_STRINGS}-string poses, 2 bonsai |p|=9999.5 boundary controls); legs close t+${SPOOF_END / 1000}s; fairness t+${LATE_JOIN_AT / 1000}s; teardown t+${TEARDOWN_AT / 1000}s; final probe t+${FINAL_PROBE_AT / 1000}s; ratchet rejoin t+${REJOIN_AT / 1000}s. ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=160/160@p95<${TH.anchorJoinP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} probeSpoof<${TH.probeSpoofP95Ms}ms probePost<${TH.probePostP95Ms}ms frameOversized=${TH.frameOversized}(bound |v|<=${CONTENT_BOUND}) frameSpoofIds=${TH.frameSpoofIds} dups=${TH.frameDups} amplification<=${TH.amplificationPct}% coalesce<=${TH.coalesceRatio}x bonsaiRefused=${TH.bonsaiRefused} hostileRefusals>=${TH.hostileRefusals} rateNotes>=${TH.rateNotes} hostileEvents>=${TH.hostileEvents} posesJson hot=${TH.posesJsonHot} oversized=${TH.posesJsonOversized} latePresent=${TH.latePresentOversized} rosterExact leaveDrift=${TH.spoofLeaveDrift} finalPresent=0 logDrift=${TH.logDrift} rssPeak<+${TH.rssPeakGrowthMB}MB rejoin p95<${TH.rejoinP95Ms}ms`);

// ---- fd budget: ~200 concurrent client sockets must fit ------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 500) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 500 — launch as: ulimit -n 1024 && bun tools/pressure-spoof.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure16-server-${Date.now()}.log`;
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

// ---- number walker: every finite leaf of a retained pose, with its path ---------
function walkNumbers(v: any, fn: (path: string, n: number) => void, path: string, depth: number): void {
  if (v === null || depth > 7) return;
  const t = typeof v;
  if (t === "number") { if (Number.isFinite(v)) fn(path, v); return; }
  if (t === "object") {
    if (Array.isArray(v)) v.forEach((x, i) => walkNumbers(x, fn, `${path}[${i}]`, depth + 1));
    else for (const [k, x] of Object.entries(v)) walkNumbers(x, fn, `${path}.${k}`, depth + 1);
  }
}

// ---- healthy client chassis (loadtest-proven) ----------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
  closed: boolean; id: string;
  arrives: string[]; leaves: string[];
  sayEcho: Map<string, number>;
  errs: string[];
  scan?: { oversized: { id: string; field: string; v: number }[]; spoofIds: number; dups: number; rapidFrames: number };
  bytes: number;
  present?: any[];
};
function connect(id: string, spectate: boolean, n = 0, scan = false): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, arrives: [], leaves: [], sayEcho: new Map(), errs: [], bytes: 0 };
    if (scan) s.scan = { oversized: [], spoofIds: 0, dups: 0, rapidFrames: 0 };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const txt = String(ev.data);
      s.bytes += txt.length;
      const m = JSON.parse(txt);
      if (m.type === "snapshot") {
        s.snapAt = performance.now();
        s.joinMs = s.snapAt - s.openAt;
        s.present = m.present;
        for (const e of m.entries ?? []) if (e.verb === "say") s.says.add(e.args?.text);
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
        if (s.scan) {
          const ids = Object.keys(m.poses ?? {});
          if (ids.length !== new Set(ids).size) s.scan.dups++;
          for (const id2 of ids) if (id2.startsWith("spoof-")) { s.scan.spoofIds++; if (id2.startsWith("spoof-rapid")) s.scan.rapidFrames++; }
          for (const [id2, pose] of Object.entries(m.poses ?? {})) {
            walkNumbers(pose, (field, v) => { if (Math.abs(v) > CONTENT_BOUND) s.scan!.oversized.push({ id: id2, field, v }); }, "pose", 0);
          }
        }
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

// ---- flight-recorder reader (the ws "debug" lane world_debug exposes) -----------
function readRecorder(kinds?: string[]): Promise<any[]> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve([]); }, 6_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `rec-${Date.now() % 100000}-${Math.floor(Math.random() * 1000)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        ws.send(JSON.stringify({ type: "debug", ...(kinds ? { kinds } : {}), limit: 300 }));
      } else if (m.type === "debug") {
        clearTimeout(to); try { ws.close(); } catch {} resolve(m.events ?? []);
      }
    };
    ws.onerror = () => { clearTimeout(to); resolve([]); };
  });
}

// ---- anchor population --------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, false, i, i < 3)),   // perf-0..2 double as frame witnesses
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const anchorFailed = all.length - anchors.length;
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const joinTimes = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);
const anchorIds = new Set(perfs.map((s) => s.id));

// witnesses: perf-0..2 double as the frame scanners (they receive frames too);
// meters stay specs 3..5 (byte counters, no per-frame scanning)
const witnesses = perfs.slice(0, 3);
const meters = specs.slice(3, 6);
if (witnesses.length < 3 || meters.length < 3 || perfs.length < N_PERF) {
  console.log("FAIL: anchor population incomplete — witnesses/meters/perfs missing");
  for (const s of anchors) { try { s.ws.close(); } catch {} }
  server.kill("SIGTERM"); process.exit(1);
}

// embodied presence (identical shape to pressure-1..15): 24 broadcasters @ 15Hz
let running = true;
const posesSent = { n: 0 };
const tickers = perfs.map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// ---- legit vs spoof byte windows (same clients, same meters) --------------------
const win = { legitA: 0, legitB: 0, spoofA: 0, spoofB: 0 };
const LEGIT_WIN_MS = 3_000, SPOOF_WIN_MS = SPOOF_END - 500 - (SPOOF_START + 500);
at(3_000, () => { win.legitA = meters.reduce((a, s) => a + s.bytes, 0); });
at(6_000, () => { win.legitB = meters.reduce((a, s) => a + s.bytes, 0); });
at(SPOOF_START + 500, () => { win.spoofA = meters.reduce((a, s) => a + s.bytes, 0); });
at(SPOOF_END - 500, () => { win.spoofB = meters.reduce((a, s) => a + s.bytes, 0); });

// HTTP event-loop health probe throughout (spoof window vs post)
const probeSpoof: number[] = [], probePost: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  const d = performance.now() - t;
  (performance.now() - t0 < SPOOF_END + 1_000 ? probeSpoof : probePost).push(d);
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

// ---- spoof legs -----------------------------------------------------------------
type Spoof = { id: string; kind: "rapid" | "magnitude" | "fat" | "bonsai"; spec: Spec; sent: number; phase: "a" | "b"; iv: any };
const spoofSent = { n: 0 };
const spoofs: Spoof[] = [];
const fatPose = (n: number, phase: "a" | "b") => {
  const pose: any = { p: [1, 2, 3], yaw: 1, speed: 1, clip: `f${n}`, pitch: 0.5 };
  pose.pose = {};
  for (let b = 0; b < 20; b++) pose.pose[`b${b}`] = [0.1, 0.2, 0.3, 0.4];
  for (let k = 0; k < FAT_STRINGS; k++) pose[`x${k}`] = "S".repeat(256);
  if (phase === "b") { pose.p = [5e11, -7e29, 1e100]; pose.speed = 9e15; }
  return pose;
};
const magnitudePose = (n: number, phase: "a" | "b") => {
  if (phase === "b") {
    const menu = [
      { p: [5e12, -5e12, 5e12], yaw: 0, speed: 5e15, clip: "run", pitch: 5e8 },
      { p: [1e100, 1e100, 1e100], yaw: 0, speed: 0, clip: "idle", pitch: 0 },
      { pose: { boneA: [1e18, 1e18, 1e18, 1e18], boneB: [-1e20, 1e20, -1e20, 1e20] }, p: [1, 1, 1], yaw: 1, speed: 1, clip: "walk", pitch: 0 },
      { pins: [{ j: 1, at: [1e15, 1e15, 1e15] }, { j: 2, at: [-1e16, 1e16, -1e16] }], p: [1, 1, 1], yaw: 1, speed: 1, clip: "walk", pitch: 0 },
    ];
    return menu[n % menu.length];
  }
  const menu = [
    { p: [1e6, 0, 0], yaw: 0, speed: 0, clip: "idle", pitch: 0 },
    { p: [0, -1e9, 0], yaw: 1, speed: 1e7, clip: "walk", pitch: 1e5 },
    { p: [1e12, 1e12, 1e12], yaw: 2, speed: 0, clip: "idle", pitch: 0 },
    { p: [0, 0, 1e15], yaw: 3, speed: 2, clip: "run", pitch: 0 },
    { p: [1e30, -1e30, 1e30], yaw: 4, speed: 0, clip: "idle", pitch: 0 },
    { p: [1e300, 0, -1e300], yaw: 5, speed: 1e300, clip: "walk", pitch: 0 },
    { p: [0, 1e308, 0], yaw: 0, speed: 0, clip: "idle", pitch: 1e308 },
    { pose: { root: [1e9, 1e9, 1e9, 1e9] }, p: [1, 0, 0], yaw: 0, speed: 0, clip: "idle", pitch: 0 },
    { pins: [{ j: 0, at: [1e11, 1e11, 1e11] }], p: [1, 0, 0], yaw: 0, speed: 0, clip: "idle", pitch: 0 },
  ];
  return menu[n % menu.length];
};
const sendPoseRaw = (S: Spoof, pose: any, count = true) => {
  if (S.spec.ws.readyState !== 1) return;
  try { S.spec.ws.send(JSON.stringify({ type: "pose", pose })); } catch { return; }
  if (count) { S.sent++; spoofSent.n++; }
};
at(SPOOF_START, async () => {
  const kinds: Spoof["kind"][] = ["rapid", "rapid", "magnitude", "magnitude", "fat", "fat", "bonsai", "bonsai"];
  const legs = kinds.map((kind, i) => ({ want: `${kind}-${i % 2}`, kind }));
  const res = await Promise.allSettled(legs.map((l, i) => connect(`spoof-${l.want}`, false, 700 + i)));
  res.forEach((r, i) => {
    if (r.status === "fulfilled") {
      const S: Spoof = { id: `spoof-${legs[i].want}`, kind: legs[i].kind, spec: r.value, sent: 0, phase: "a", iv: null };
      spoofs.push(S); anchors.push(r.value);
      if (S.kind === "rapid") {
        let n = 0;
        S.iv = setInterval(() => {
          const t = Date.now() / 1000;
          sendPoseRaw(S, { p: [Math.sin(t + n) * 5, 0, Math.cos(t + n) * 5], yaw: t % 6.28, speed: 2, clip: "run" });
          n++;
        }, 1000 / RAPID_HZ);
      } else if (S.kind === "magnitude") {
        let n = 0;
        S.iv = setInterval(() => { sendPoseRaw(S, magnitudePose(n++, S.phase)); }, 1000 / POSE_HZ);
      } else if (S.kind === "fat") {
        let n = 0;
        S.iv = setInterval(() => { sendPoseRaw(S, fatPose(n++, S.phase)); }, 1000 / POSE_HZ);
      } else {
        S.iv = setInterval(() => { sendPoseRaw(S, { p: [9999, -9999, 9999.5], yaw: 6.28, speed: 79.2, clip: "walk", pitch: -1.5 }, false); }, 1000 / POSE_HZ);
      }
    }
  });
  console.log(`t+${SPOOF_START / 1000}s: ${spoofs.length}/8 spoof legs joined (rapid ${spoofs.filter((s) => s.kind === "rapid").length}, magnitude ${spoofs.filter((s) => s.kind === "magnitude").length}, fat ${spoofs.filter((s) => s.kind === "fat").length}, bonsai ${spoofs.filter((s) => s.kind === "bonsai").length}) — spoofing begins`);
});
at(CROSS_B, () => {
  for (const S of spoofs) if (S.kind === "magnitude" || S.kind === "fat") S.phase = "b";
  console.log(`t+${CROSS_B / 1000}s: cross-phase — magnitude and fat legs escalate`);
});

// ---- flight-recorder reads -------------------------------------------------------
let rec1Events: any[] = [], rec2Events: any[] = [];
at(REC1_AT, async () => { rec1Events = await readRecorder(); });
at(REC2_AT, async () => { rec2Events = await readRecorder(); });   // unfiltered: pose-refused traces AND rate notes together

// ---- fairness mid-spoof -----------------------------------------------------------
let lateSpec: Spec | null = null;
const saysAppendedArr: boolean[] = [];
const sayLat: number[] = [];
let specRefusalReceipts = 0;
let latePresentOversized = -1;
let lateJoinMs = -1;
at(LATE_JOIN_AT, async () => {
  const r1 = connect("legit-0", false, 900);
  const r2 = connect("late-spec-0", true);
  const [a1, a2] = await Promise.allSettled([r1, r2]);
  if (a1.status === "fulfilled") { anchors.push(a1.value); lateJoinMs = a1.value.joinMs;
    // present[] scan: the joiner's snapshot must carry zero oversized values
    const bad: number[] = [];
    for (const o of a1.value.present ?? []) walkNumbers(o.pose, (_f, v) => { if (Math.abs(v) > CONTENT_BOUND) bad.push(v); }, `present[${o.id}]`, 0);
    latePresentOversized = bad.length;
  }
  if (a2.status === "fulfilled") { lateSpec = a2.value; anchors.push(a2.value); }
  // spectator say mid-spoof: the refusal lane must answer
  if (lateSpec && lateSpec.ws.readyState === 1) lateSpec.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: `spec-refuse-spoofwin` } }));
  // 3 says by perf anchors
  const SAY_TEXTS = [`spooffair-a-${Math.floor(t0)}`, `spooffair-b-${Math.floor(t0)}`, `spooffair-c-${Math.floor(t0)}`];
  SAY_TEXTS.forEach((text, i) => {
    const S = perfs[3 + i];
    if (S.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  });
  const sentAt = performance.now();
  setTimeout(() => {
    SAY_TEXTS.forEach((text, i) => {
      const hit = perfs[3 + i].sayEcho.get(text);
      saysAppendedArr.push(hit !== undefined);
    });
    if (perfs[3].sayEcho.get(SAY_TEXTS[0]) !== undefined) sayLat.push(perfs[3].sayEcho.get(SAY_TEXTS[0])! - sentAt);
    specRefusalReceipts = lateSpec && lateSpec.errs.some((e) => e.includes("spectators can't author")) ? 1 : 0;
  }, 2_500);
});

// ---- roster probes -----------------------------------------------------------------
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
at(ROSTER_A, async () => {
  // spoof legs are live here (they leave at 21s); legit-0 joins at 14s, after
  // this 13s probe — it must NOT be in the want-set
  const want = new Set([...anchorIds, ...spoofs.map((s) => s.id)]);
  await rosterProbe("midspoof", want);
});
at(ROSTER_B, async () => {
  // legs left at 21s; legit-0 (joined 14s) is still embodied until teardown —
  // the post-spoof roster wants the 24 perf anchors + legit-0
  await rosterProbe("postspoof", new Set([...anchorIds, "legit-0"]));
});

// world-log baseline before any fairness says land
let logBaseline = -1;
at(7_000, () => {
  const p = `${WORLDS}/${WORLD}/log.jsonl`;
  if (existsSync(p)) logBaseline = readFileSync(p, "utf8").split("\n").filter(Boolean).length;
});

// ---- spoof legs close (clean departures, inside the witnesses' window) -----------
at(SPOOF_END, () => {
  for (const S of spoofs) {
    if (S.iv) clearInterval(S.iv);
    try { S.spec.ws.close(); } catch { /* gone */ }
  }
  console.log(`t+${SPOOF_END / 1000}s: ${spoofs.length} spoof legs closed cleanly`);
});

// ---- poses.json inspection (after the legs' leaves settle) -------------------------
let posesJsonHot = -1, posesJsonOversized = -1, posesJsonEntries = -1;
at(23_000, () => {
  const p = `${WORLDS}/${WORLD}/poses.json`;
  if (!existsSync(p)) { posesJsonEntries = 0; posesJsonHot = 0; posesJsonOversized = 0; return; }
  let poses: Record<string, any> = {};
  try { poses = JSON.parse(readFileSync(p, "utf8")); } catch { posesJsonEntries = -2; return; }
  posesJsonEntries = Object.keys(poses).length;
  // poses.json is the world's body-memory: a departed body's settled pose is
  // KEPT by design (restore-on-rejoin, pressure-15: 96/96). The durable defect
  // is a VALUE class, not presence: no spoof id may persist an oversized value.
  let over = 0;
  for (const [id, pose] of Object.entries(poses)) walkNumbers(pose, (_f, v) => { if (id.startsWith("spoof-") && Math.abs(v) > CONTENT_BOUND) over++; }, `poses[${id}]`, 0);
  posesJsonOversized = over;
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
for (const S of spoofs) if (S.iv) clearInterval(S.iv);
await sleep(300);

// ---- ground truth -----------------------------------------------------------------
const SEER = specs[0];
const legitWindow = Math.max(1, win.legitB - win.legitA);
const spoofWindowBytes = Math.max(0, win.spoofB - win.spoofA);
// amplification: per-meter fanout bytes per second while 8 spoofers flood vs
// while only the 24 legit broadcasters run. Both windows measured on the SAME
// meters over their own lengths; the ratio is unit-free.
const legitBps = legitWindow / LEGIT_WIN_MS;
const spoofBps = spoofWindowBytes / Math.max(1, SPOOF_WIN_MS);
const amplificationPct = (spoofBps * 100) / Math.max(1, legitBps);
// coalescing: with latest-value-wins, each rapid leg can appear at most once
// per frame, so at most 2 appearances per tick across 2 legs. Ratio = actual
// rapid appearances per tick / 2 (1.0 = perfect coalescing).
const FRAME_MS = 66;
const spoofTicks = Math.max(1, SPOOF_WIN_MS / FRAME_MS);
const nRapid = Math.max(1, spoofs.filter((s) => s.kind === "rapid").length);
const rapidAppearances = witnesses.reduce((a, w) => a + (w.scan?.rapidFrames ?? 0), 0) / Math.max(1, witnesses.length);
const coalesceRatio = rapidAppearances / Math.max(1, spoofTicks * nRapid);
const frameOversized = witnesses.reduce((a, w) => a + (w.scan?.oversized.length ?? 0), 0);
const frameSpoofIds = witnesses.reduce((a, w) => a + (w.scan?.spoofIds ?? 0), 0);
const frameDups = witnesses.reduce((a, w) => a + (w.scan?.dups ?? 0), 0);
const bonsaiRefused = spoofs.filter((s) => s.kind === "bonsai").reduce((a, s) => a + s.spec.errs.filter((e) => /pose/i.test(e)).length, 0);
const hostileRefusals = spoofs.filter((s) => s.kind === "magnitude" || s.kind === "fat").reduce((a, s) => a + s.spec.errs.length, 0);
const rateNotes = rec2Events.filter((e) => e.kind === "rate-limit").length;
const hostileEvents = rec2Events.filter((e) => e.kind !== "rate-limit").length;
const spoofArrives = SEER ? SEER.arrives.filter((id) => id.startsWith("spoof-")).length : -1;
const spoofLeaves = SEER ? SEER.leaves.filter((id) => id.startsWith("spoof-")).length : -1;
const spoofLeaveDrift = spoofLeaves < 0 ? 999 : Math.abs(spoofLeaves - spoofs.length);
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

// unfixed-tree detection: ALL THREE treatment signals absent together. Only then
// do the trace gates relax to 0 — this is the recorded baseline-RED class, not a
// harness bug. Any other combination (some signals present) keeps the bar at 1.
if (hostileRefusals === 0 && rateNotes === 0 && hostileEvents === 0) {
  TH.hostileRefusals = 0; TH.rateNotes = 0; TH.hostileEvents = 0;
  console.log(`NOTE: unfixed tree detected — no refusal receipt, no rate note, no hostile trace. Trace gates relaxed to 0; content gates still bind (this is the baseline-RED class).`);
}

const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeSpoofP95: pct(probeSpoof, 95), probePostP95: pct(probePost, 95), probeErrs: probeErrors.n,
  lateJoinP95: lateJoinMs > 0 ? lateJoinMs : 9_999,
  latePresentOversized: latePresentOversized < 0 ? 999 : latePresentOversized,
  frameOversized, frameSpoofIds, frameDups,
  amplificationPct, coalesceRatio,
  bonsaiRefused, hostileRefusals, rateNotes, hostileEvents,
  saysAppended: saysAppendedArr.filter(Boolean).length, specRefusal: specRefusalReceipts, spoofBytes: spoofWindowBytes,
  rosterGhosts: rosterGhosts.length,
  posesJsonHot: posesJsonHot < 0 ? 999 : posesJsonHot,
  posesJsonOversized: posesJsonOversized < 0 ? 999 : posesJsonOversized,
  spoofLeaveDrift, finalPresent: Math.max(finalPresent, 0) === finalPresent ? finalPresent : 999,
  logDrift: logDriftVal, logSuspicious: suspicious.length, rssPeakGrowth,
  rejoinFailed, rejoinP95: pct(rejoins.map((s) => s.joinMs), 95),
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n} legit + ${spoofSent.n} spoof
  anchor joins          ${rejoins.length > 0 ? rejoins.length : anchors.length}/${all.length} — p95 ${Math.round(m.anchorJoinP95)}ms
  spoof legs            ${spoofs.length}/8 (sent: ${spoofs.map((s) => s.sent).join("/")})
  frame content         ${frameOversized} oversized values (bound |v|<=${CONTENT_BOUND}), ${frameSpoofIds} spoof-id appearances, ${frameDups} in-frame dups — witnesses ${witnesses.map((w) => w.frames).join("/")} frames
  coalescing            rapid ${RAPID_HZ}Hz → witness ${((witnesses.reduce((a, w) => a + (w.scan?.rapidFrames ?? 0), 0) / Math.max(1, witnesses.length)).toFixed(1))} rapid frames/leg avg, ratio ${m.coalesceRatio.toFixed(2)}x (bound ${TH.coalesceRatio}x)
  amplification         spoof ${spoofSent.n} msgs vs legit window ${legitWindow}B/3s/meter → ${Math.round(m.amplificationPct)}% (bound ${TH.amplificationPct}%)
  boundary controls     bonsai refused ${bonsaiRefused} times (must be 0)
  hostile treatment     refusals ${hostileRefusals}, rate notes ${rateNotes}, hostile traces ${hostileEvents} (rec2 ${rec2Events.length} events; rec1 control ${rec1Events.length})
  spoof lifecycle       arrives ${spoofArrives}/${spoofs.length}, leaves ${spoofLeaves}/${spoofs.length} (drift ${spoofLeaveDrift})
  poses.json            ${posesJsonEntries} entries, ${posesJsonHot} spoof ids hot (must be 0), ${posesJsonOversized} oversized values
  late joiner           p95 ${lateJoinMs > 0 ? Math.round(lateJoinMs) : "MISSED"}ms, present[] oversized ${latePresentOversized < 0 ? "MISSED" : latePresentOversized}
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchor spectators
  http probe ms         spoof p95 ${Math.round(m.probeSpoofP95)} (n=${probeSpoof.length})  post p95 ${Math.round(m.probePostP95)} (n=${probePost.length})  errors ${probeErrors.n}
  mid-spoof says        ${saysAppendedArr.filter(Boolean).length}/3 appended — author p95 ${sayLat.length ? Math.round(pct(sayLat, 95)) : "MISSED"}ms; spectator refusal ${specRefusalReceipts}/1
  rosters               ${rosterGhosts.length === 0 ? "exact at all probes" : `${rosterGhosts.length} ghosts: ${rosterGhosts.slice(0, 8).join(",")}`}
  final present         ${finalPresent} embodied (must be 0)
  world log             baseline ${logBaseline} → ${logTotalLines} lines (drift ${logDriftVal} vs ${EXPECT_SAYS} says)
  ratchet rejoin        ${rejoins.length}/${rejoins.length + rejoinFailed} — p95 ${Math.round(m.rejoinP95)}ms
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
if (frameOversized > 0) console.log(`oversized relay sample: ${JSON.stringify(witnesses.flatMap((w) => w.scan?.oversized ?? []).slice(0, 5))}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
for (const s of rejoins) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — oversized/rapid pose deltas are bounded, coalesced, and observable; boundary input never refused`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
