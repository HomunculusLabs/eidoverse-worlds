// Pressure scenario 4: AUTHORED CHAT/VERBS RESPONSIVE DURING MAX PRESENCE TRAFFIC.
// The design target's steady state is 24 performers broadcasting 15Hz presence
// to a full 176-spectator house. Scenario 1 proved the presence plane scales;
// scenario 3 proved a join storm doesn't wedge the door. This one asks: while
// that MAXIMUM presence load runs continuously, does the AUTHORED plane — the
// log, the thing the world IS — stay fast and exact?
//
// Workload (identical presence chassis to pressure-1/2/3):
//   24 performers x 15Hz pose + 176 anchor spectators from t=0.
//
// Authored probes, run three rounds mid-load (t=5s, 10s, 15s), all within
// every rate budget (VERB_RATE=12/4s, MSG_RATE=60/s per client — scratch
// envelope MSG_RATE=600 keeps the blast itself inside the message cap):
//   A. one performer says one line per round  -> fanout echo {type:"log",verb:"say"}
//      measured: send->echo latency on the AUTHORING socket (log path incl. append)
//                + full 200-socket delivery (fanout) + exact-text check
//   B. 4 performers each say one line in the same tick (burst) -> fanout completeness
//   C. one performer (open scratch world = builder) authors a `light` verb each
//      round -> a real builder mutation through validate+append+broadcast
//   D. rate-limit PROOF (round 2 only): one performer blasts 20 verbs in a
//      tight burst; 12/4s must admit the first 12 and refuse the rest with the
//      explicit error message — then, AFTER the 4s window expires (t+15.2s),
//      the SAME performer's next say must still land (refusal ≠ wedge).
//
// Acceptance gates (pinned before measuring):
//   - joins: 200/200, p95 < 3s            (same envelope as pressure-1/3)
//   - say author latency: p95 < 500ms, max < 1500ms   (n=3)
//   - say delivery: 200/200 sockets x 3 rounds, exact text, p95 < 1000ms
//   - light verbs: 3/3 appended (echo seen), author latency p95 < 500ms
//   - rate-limit proof: >= 8 refused with the exact "slow down" error,
//     <= 12 accepted (12/4s budget respected), 0 wedged sockets after
//     the window expires
//   - presence never pauses: anchor fps p50 >= 12, frame latency p95 < 250ms,
//     0 seq gaps
//   - event loop (HTTP probe): p95 < 1000ms
//   - server log: 0 error/warn lines; RSS peak growth < 60MB
//
//   SERVER_DIR=/tmp/pressure4-wt PORT=8997 bun tools/pressure-authored.ts
//   SELFTEST=1 bun tools/pressure-authored.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync } from "node:fs";

// ---- pinned scenario contract (printed before measuring) ---------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure4-wt";
const PORT = Number(process.env.PORT ?? 8997);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure4-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_ANCHOR = 176, POSE_HZ = 15;
const PROBE_AT = [5_000, 10_000, 15_000];      // three mid-load rounds
const RATE_PROOF_ROUND = 1;                    // round 2 of 3 (t+10s)
const WEDGE_AT = 15_200;                       // blast+5.2s: the 4s window has expired
const WEDGE_CHECK_AT = 18_500;
const DURATION = 21_000;
const MSG_RATE = "600";                        // same envelope as pressure-1/2/3
const VERB_RATE = 12;                          // server/config.ts default
const SELFTEST = process.env.SELFTEST === "1";

// acceptance thresholds (fail any → exit 1)
const TH = {
  joinsFailed: 0,
  joinP95Ms: 3_000,
  sayAuthorP95Ms: 500,     // author socket: send -> authoritative echo
  sayAuthorMaxMs: 1_500,
  deliveryMisses: 0,       // sockets missing any probe line (exact text)
  deliveryP95Ms: 1_000,    // per-socket send -> receipt of probe line
  deliveryMaxMs: 2_500,
  lightAppended: 3,        // builder light verbs that appended (echo seen)
  lightP95Ms: 500,
  rateRefusedMin: 8,       // explicit refusals observed in the blast
  rateAcceptedMax: 12,     // 12/4s budget respected
  rateErrMsg: "slow down — verb rate limit",
  wedgedAfterRefusal: 0,   // refusing performer's next say (post-window) must land
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  probeP95Ms: 1_000,
  probeErrors: 0,
  logSuspicious: 0,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) -----------------
type Measurements = {
  failed: number; joinP95: number;
  sayAuthorP95: number; sayAuthorMax: number;
  deliveryMisses: number; deliveryP95: number; deliveryMax: number;
  lightAppended: number; lightP95: number;
  rateRefused: number; rateAccepted: number; wedged: number;
  fpsP50: number; latP95: number; gaps: number;
  probeP95: number; probeErrors: number;
  logSuspicious: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.failed > TH.joinsFailed) fail.push(`${m.failed} initial connections failed to join`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`initial join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.sayAuthorP95 > TH.sayAuthorP95Ms) fail.push(`say author latency p95 ${Math.round(m.sayAuthorP95)}ms > ${TH.sayAuthorP95Ms}ms`);
  if (m.sayAuthorMax > TH.sayAuthorMaxMs) fail.push(`say author latency max ${Math.round(m.sayAuthorMax)}ms > ${TH.sayAuthorMaxMs}ms`);
  if (m.deliveryMisses > TH.deliveryMisses) fail.push(`${m.deliveryMisses} socket-rounds missing probe lines — authored traffic lost under presence load`);
  if (m.deliveryP95 > TH.deliveryP95Ms) fail.push(`probe delivery p95 ${Math.round(m.deliveryP95)}ms > ${TH.deliveryP95Ms}ms`);
  if (m.deliveryMax > TH.deliveryMaxMs) fail.push(`probe delivery max ${Math.round(m.deliveryMax)}ms > ${TH.deliveryMaxMs}ms`);
  if (m.lightAppended < TH.lightAppended) fail.push(`builder light verbs appended ${m.lightAppended}/${TH.lightAppended} — authored mutation path stalled`);
  if (m.lightP95 > TH.lightP95Ms) fail.push(`light verb latency p95 ${Math.round(m.lightP95)}ms > ${TH.lightP95Ms}ms`);
  if (m.rateRefused < TH.rateRefusedMin) fail.push(`rate-limit proof: only ${m.rateRefused} refusals < ${TH.rateRefusedMin} — protection not exercised`);
  if (m.rateAccepted > TH.rateAcceptedMax) fail.push(`rate-limit proof: ${m.rateAccepted} accepted > ${TH.rateAcceptedMax} — 12/4s budget not respected`);
  if (m.wedged > TH.wedgedAfterRefusal) fail.push(`${m.wedged} socket(s) wedged after rate-limit refusals`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on anchor spectators`);
  if (m.probeP95 > TH.probeP95Ms) fail.push(`HTTP probe p95 ${Math.round(m.probeP95)}ms > ${TH.probeP95Ms}ms`);
  if (m.probeErrors > TH.probeErrors) fail.push(`${m.probeErrors} HTTP probe errors`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    failed: 0, joinP95: 50,
    sayAuthorP95: 14, sayAuthorMax: 14,
    deliveryMisses: 0, deliveryP95: 60, deliveryMax: 120,
    lightAppended: 3, lightP95: 20,
    rateRefused: 8, rateAccepted: 12, wedged: 0,
    fpsP50: 14.5, latP95: 10, gaps: 0,
    probeP95: 15, probeErrors: 0, logSuspicious: 0, rssPeakGrowth: 5,
  };
  const breached: Measurements = {
    ...healthy,
    sayAuthorP95: 900, deliveryMisses: 40, lightAppended: 1,
    rateRefused: 0, rateAccepted: 20, wedged: 1, gaps: 12,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["say author latency p95 900ms", "socket-rounds missing probe lines", "builder light verbs appended 1/3", "rate-limit proof: only 0 refusals", "rate-limit proof: 20 accepted", "wedged", "frame seq gaps"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf x ${POSE_HZ}Hz + ${N_ANCHOR} anchor spectators from t=0 (MAX presence load); authored probes at t=${PROBE_AT.map((t) => t / 1000 + "s").join(",")} = per round 1 solo say + 4-say burst + 1 builder light verb; round ${RATE_PROOF_ROUND + 1} adds a 20-verb rate-limit blast (expect 12 ok / 8 refused) with post-window wedge probe at t+${WEDGE_AT / 1000}s; ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}, VERB_RATE=${VERB_RATE}/4s`);
console.log(`thresholds: joins=${200 - TH.joinsFailed}/200@p95<${TH.joinP95Ms}ms sayAuthorP95<${TH.sayAuthorP95Ms}ms/max<${TH.sayAuthorMaxMs}ms deliveryMiss=${TH.deliveryMisses}/p95<${TH.deliveryP95Ms}ms/max<${TH.deliveryMaxMs}ms light=${TH.lightAppended}/3@p95<${TH.lightP95Ms}ms rateRefused>=${TH.rateRefusedMin} rateAccepted<=${TH.rateAcceptedMax} wedged=${TH.wedgedAfterRefusal} fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} probeP95<${TH.probeP95Ms}ms logSuspicious=${TH.logSuspicious} rssPeak<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget: 200 concurrent client sockets must fit ------------------------
// (bun's spawned sh can report "unlimited" — bun raises its own rlimit — which
// parses as NaN; an unlimited budget is by definition sufficient.)
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (!Number.isFinite(fdLimit) && fdLimit !== Infinity) {
  console.log(`FAIL: file-descriptor limit unparseable ("${fdRaw}") — launch as: ulimit -n 1024 && bun tools/pressure-authored.ts`);
  process.exit(2);
}
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-authored.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ---------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure4-server-${Date.now()}.log`;
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

// ---- healthy client chassis (loadtest-proven) --------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
  closed: boolean; id: string;
  probeHits: Map<string, number>;   // probe key -> arrival time (performance.now)
  errs: string[];                   // error replies observed
  _blastTexts?: string[];           // rate-proof round: the 20 blast texts
};
// probe keys are registered live so the chassis can time their delivery
const probeKeysLive = new Set<string>();
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, probeHits: new Map(), errs: [] };
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
        if (m.entry?.verb === "say") s.says.add(m.entry.args?.text);
        let key: string | undefined;
        if (m.entry?.verb === "say" && typeof m.entry.args?.text === "string") key = m.entry.args.text;
        else if (m.entry?.verb === "light" && typeof m.entry.args?.id === "string" && m.entry.args.id.startsWith("plight-")) key = `light:${m.entry.args.id}`;
        if (key && probeKeysLive.has(key) && !s.probeHits.has(key)) s.probeHits.set(key, performance.now());
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = () => { s.closed = true; };
    ws.onerror = () => { /* close follows */ };
  });
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
const perfs = ok.filter((s) => s.id.startsWith("perf-"));
const specs = ok.filter((s) => s.id.startsWith("spec-"));
const everyone = [...perfs, ...specs];
const joinTimes = ok.map((s) => s.joinMs);
console.log(`t+0: joined ${ok.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// performers move (identical shape to pressure-1/2/3)
let running = true;
const posesSent = { n: 0 };
const tickers = perfs.map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// HTTP event-loop health probe throughout
const probeSamples: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  probeSamples.push(performance.now() - t);
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

// ---- authored probe rounds ----------------------------------------------------
// Roles (disjoint performers, each well inside its own verb budget):
const SOLO = perfs[0];
const BURSTERS = [perfs[1], perfs[2], perfs[3], perfs[4]];
const BLASTER = perfs[7];
const LIGHTER = perfs[23];

const sayAuthorLat: number[] = [];
const lightLat: number[] = [];
let lightAppended = 0;
let rateRefused = 0, rateAccepted = 0;
let wedged = 0;
let deliveryMisses = 0;
const deliveryLat: number[] = [];

/** account one probe key across every socket: miss -> deliveryMisses, hit -> latency */
function accountDelivery(key: string, sentAt: number) {
  for (const s of everyone) {
    const hitAt = s.probeHits.get(key);
    if (hitAt === undefined) deliveryMisses++;
    else deliveryLat.push(hitAt - sentAt);
  }
}

PROBE_AT.forEach((probeAt, r) => {
  // --- fire the round: solo say + 4-say burst + builder light, same instant ---
  at(probeAt, () => {
    const sentAt = performance.now();
    const soloText = `probe-solo-r${r}-${Math.floor(t0)}`;
    const burstTexts = BURSTERS.map((_, i) => `probe-burst-r${r}-${i}-${Math.floor(t0)}`);
    const lightKey = `light:plight-r${r}`;
    for (const k of [soloText, ...burstTexts, lightKey]) probeKeysLive.add(k);
    if (SOLO.ws.readyState === 1) SOLO.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: soloText } }));
    BURSTERS.forEach((s, i) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: burstTexts[i] } })); });
    if (LIGHTER.ws.readyState === 1) LIGHTER.ws.send(JSON.stringify({ type: "verb", verb: "light", args: { id: `plight-r${r}`, pos: [r, 2, r], color: "#ffb46b", intensity: 0.9, range: 5 } }));

    // --- rate-limit proof on the designated round: 20-verb blast ---
    if (r === RATE_PROOF_ROUND) {
      BLASTER._blastTexts = Array.from({ length: 20 }, (_, i) => `blast-${i}-${Math.floor(t0)}`);
      for (const txt of BLASTER._blastTexts) {
        if (BLASTER.ws.readyState === 1) BLASTER.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: txt } }));
      }
    }

    // --- account the round once fanout has settled (2s) ---
    at(probeAt + 2_000, () => {
      const soloHit = SOLO.probeHits.get(soloText);
      if (soloHit !== undefined) sayAuthorLat.push(soloHit - sentAt);
      const lightHit = LIGHTER.probeHits.get(lightKey);
      if (lightHit !== undefined) { lightLat.push(lightHit - sentAt); lightAppended++; }
      accountDelivery(soloText, sentAt);
      for (const txt of burstTexts) accountDelivery(txt, sentAt);
      accountDelivery(lightKey, sentAt);
      if (r === RATE_PROOF_ROUND && BLASTER._blastTexts) {
        rateAccepted = BLASTER._blastTexts.filter((t: string) => BLASTER.says.has(t)).length;
        rateRefused = BLASTER.errs.filter((e: string) => e.includes(TH.rateErrMsg)).length;
      }
    });
  });
});

// --- wedge probe: AFTER the 4s verb window from the blast (t+10s) has expired,
//     the refusing performer's next say must append and fan out normally ---
at(WEDGE_AT, () => {
  const sentAt = performance.now();
  const wedgeText = `probe-postrefusal-${Math.floor(t0)}`;
  probeKeysLive.add(wedgeText);
  if (BLASTER.ws.readyState === 1) BLASTER.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: wedgeText } }));
  at(WEDGE_CHECK_AT, () => {
    const hit = BLASTER.probeHits.get(wedgeText);
    if (hit === undefined) wedged++;
    else accountDelivery(wedgeText, sentAt);
  });
});

await sleep(DURATION);
running = false;
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(1_000);

// ---- measurements -------------------------------------------------------------
const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (endAt - s.snapAt - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

const m: Measurements = {
  failed, joinP95: pct(joinTimes, 95),
  sayAuthorP95: pct(sayAuthorLat, 95), sayAuthorMax: sayAuthorLat.length ? Math.max(...sayAuthorLat) : Infinity,
  deliveryMisses, deliveryP95: pct(deliveryLat, 95), deliveryMax: deliveryLat.length ? Math.max(...deliveryLat) : Infinity,
  lightAppended, lightP95: pct(lightLat, 95),
  rateRefused, rateAccepted, wedged,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeP95: pct(probeSamples, 95), probeErrors: probeErrors.n,
  logSuspicious: suspicious.length, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n}
  initial joins         ${ok.length}/${all.length} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(m.joinP95)}ms
  say author lat ms     n=${sayAuthorLat.length} p95 ${Math.round(m.sayAuthorP95)} max ${Number.isFinite(m.sayAuthorMax) ? Math.round(m.sayAuthorMax) : "n/a"} (${sayAuthorLat.map((x) => Math.round(x)).join(", ")})
  delivery              ${deliveryMisses} miss / ${deliveryLat.length} receipts — p50 ${Math.round(pct(deliveryLat, 50))}ms p95 ${Math.round(m.deliveryP95)}ms max ${Number.isFinite(m.deliveryMax) ? Math.round(m.deliveryMax) : "n/a"}ms
  builder light verbs   ${lightAppended}/3 appended — author lat p95 ${Math.round(m.lightP95)}ms (${lightLat.map((x) => Math.round(x)).join(", ")})
  rate-limit proof      accepted ${rateAccepted}/20 refused ${rateRefused} (budget ${VERB_RATE}/4s)
  wedged after refusal  ${wedged}
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchor spectators
  http probe p95        ${Math.round(m.probeP95)}ms (n=${probeSamples.length}, ${probeErrors.n} errors)
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of ok) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — authored plane stayed fast and exact under maximum presence load`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
