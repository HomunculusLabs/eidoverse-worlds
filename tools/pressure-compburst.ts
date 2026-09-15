// Pressure scenario 5: COMPONENT-PLACEMENT BURST — FAIR, EXPLICIT RATE-LIMITING.
// Design target: 24 embodied performers @ 15Hz presence to a full house. Prior
// scenarios proved the presence plane (1), slow-spectator isolation (2), join
// storms (3), and authored chat/verb responsiveness (4) under that load. This
// one asks: when builders BURST component placements — the busiest authored
// mutation a dress rehearsal produces — does every verb get an explicit verdict,
// does the 12/4s budget hold PER CLIENT, does the burst stay FAIR (healthy
// clients unaffected), and does the folded state stay EXACT?
//
// Workload (identical presence chassis to pressure-1..4):
//   24 embodied @ 15Hz (16 pure performers + 8 comp builders) + 176 spectators
//   = the same 200-socket design population; builders dress the stage mid-show.
//
// Phases (pinned before measuring):
//   t=2.0s  SETUP   each builder spawns its own target entity (8 spawns)
//   t=6.5s  BURST   each builder sends 20 comp verbs back-to-back (~1KB data
//                   each, distinct type per slot, data.n for round-trip).
//                   Per builder: <=12 accepted, >=8 refused with the exact
//                   "slow down — verb rate limit", accepted+refused == 20
//                   (every verb gets exactly one verdict — no silent drops).
//                   Refused comps must NOT fan out anywhere.
//   t=7.0s  FAIR    mid-burst-window healthy probes: solo say + builder light
//                   on NON-bursting clients must land at unloaded speed while
//                   160 burst verbs churn through validate+append+broadcast.
//   t=12.6s RECOVER post-window probe: each builder's next comp MUST append —
//                   refusal is flow control, never a wedge.
//   t=13.6s PAYLOAD the explicit shape gates: one >8KB comp refused with the
//                   exact "component data too large (8KB max)"; one malformed
//                   comp (no type) refused with the exact shape error; then a
//                   healthy comp on the SAME socket must still land.
//   t=16.0s FOLD    a fresh spectator joins and reads the snapshot: every
//                   final accepted comp present in state.entities[id].comp
//                   with EXACT data; every refused/oversized type ABSENT;
//                   entity census exact (8 targets + 2 probe lights).
//   teardown: world log.jsonl ground truth — comp line count == echo-observed
//   accepted total, total line count == expected appends, 0 suspicious lines.
//
// Acceptance gates (pinned before measuring):
//   - joins: 200/200, p95 < 3s                       (same envelope as 1..4)
//   - spawn echoes: 8/8 targets spawned
//   - burst budgets: per-builder accepted <= 12, refused >= 8, verdicts == 20
//   - refusal message: exact "slow down — verb rate limit"
//   - accepted comp author latency: p95 < 500ms (incl. append + afterComp)
//   - fanout: every accepted comp on all 200 sockets, exact data.n, p95 < 1s
//   - refused fanout: 0 sockets ever see a refused comp's key
//   - fairness: mid-burst say author p95 < 500ms, light appended, anchor fps
//     p50 >= 12, frame lat p95 < 250ms, 0 seq gaps
//   - recover: 8/8 post-window builder comps appended
//   - payload gates: exact 8KB error + exact shape error + follow-up comp ok
//   - fold: snapshot comp bags exact, refused types absent, census exact
//   - log ground truth: comp lines == accepted total; lines == expected appends
//   - event loop p95 < 1000ms; RSS peak growth < 60MB; 0 suspicious log lines
//
//   SERVER_DIR=/tmp/pressure-wt PORT=8998 bun tools/pressure-compburst.ts
//   SELFTEST=1 bun tools/pressure-compburst.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract (printed before measuring) ---------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure5-wt";
const PORT = Number(process.env.PORT ?? 8998);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure5-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 16, N_BUILD = 8, N_ANCHOR = 176;   // 24 embodied + 176 = 200
const POSE_HZ = 15;
const SPAWN_AT = 2_000;
const BURST_AT = 6_500;        // 4.5s after spawns — the verb window is fresh
const BURST_N = 20;            // per builder; 12/4s must refuse >= 8
const FAIR_AT = 7_000;         // mid-burst-window healthy probes
const RECOVER_AT = 12_600;     // burst window long expired
const PAYLOAD_AT = 13_600;     // shape gates on builder-0
const FOLD_AT = 16_000;        // fresh spectator reads the folded world
const DURATION = 19_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..4
const VERB_RATE = 12;          // server/config.ts default
const SELFTEST = process.env.SELFTEST === "1";

// acceptance thresholds (fail any → exit 1)
const TH = {
  joinsFailed: 0,
  joinP95Ms: 3_000,
  spawnEchoes: 8,
  burstAcceptedMax: 12,      // per builder — 12/4s budget respected
  burstRefusedMin: 8,        // per builder — protection actually engages
  burstVerdicts: 20,         // accepted + refused == sent (no silent drops)
  rateErrMsg: "slow down — verb rate limit",
  compAuthorP95Ms: 500,
  deliveryMisses: 0,
  deliveryP95Ms: 1_000,
  refusedFanoutHits: 0,
  sayAuthorP95Ms: 500,
  lightAppended: 1,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  recovered: 8,              // post-window builder comps appended
  sizeErr: "component data too large (8KB max)",
  shapeErr: "comp wants {id, type, data|null}",
  payloadFollowUp: true,
  foldMisses: 0,             // final types absent/wrong from snapshot
  foldGhost: 0,              // refused/oversized types present in snapshot
  foldCensus: 9,             // 8 targets + 1 probe light, exactly
  logCompMismatch: 0,        // log.jsonl comp lines vs observed accepted
  logLineDrift: 0,           // log lines vs expected appends
  probeP95Ms: 1_000,
  probeErrors: 0,
  logSuspicious: 0,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) -----------------
type Measurements = {
  failed: number; joinP95: number; spawnEchoes: number;
  acceptedMin: number; acceptedMax: number; refusedMin: number; verdictMisses: number;
  compAuthorP95: number; deliveryMisses: number; deliveryP95: number; refusedFanoutHits: number;
  sayAuthorP95: number; lightAppended: number;
  fpsP50: number; latP95: number; gaps: number;
  recovered: number; sizeErrOk: boolean; shapeErrOk: boolean; payloadFollowUp: boolean;
  foldMisses: number; foldGhost: number; foldCensus: number;
  logCompMismatch: number; logLineDrift: number;
  probeP95: number; probeErrors: number; logSuspicious: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.failed > TH.joinsFailed) fail.push(`${m.failed} initial connections failed to join`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`initial join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.spawnEchoes < TH.spawnEchoes) fail.push(`only ${m.spawnEchoes}/8 target spawns echoed`);
  if (m.acceptedMax > TH.burstAcceptedMax) fail.push(`burst budget breached: one builder had ${m.acceptedMax} accepted > ${TH.burstAcceptedMax}`);
  if (m.refusedMin < TH.burstRefusedMin) fail.push(`rate protection weak: min refusals per builder ${m.refusedMin} < ${TH.burstRefusedMin}`);
  if (m.verdictMisses > 0) fail.push(`${m.verdictMisses} burst verbs got no verdict (silent drop)`);
  if (m.compAuthorP95 > TH.compAuthorP95Ms) fail.push(`comp author latency p95 ${Math.round(m.compAuthorP95)}ms > ${TH.compAuthorP95Ms}ms`);
  if (m.deliveryMisses > TH.deliveryMisses) fail.push(`${m.deliveryMisses} socket-rounds missing comp echoes — burst fanout lost`);
  if (m.deliveryP95 > TH.deliveryP95Ms) fail.push(`comp echo delivery p95 ${Math.round(m.deliveryP95)}ms > ${TH.deliveryP95Ms}ms`);
  if (m.refusedFanoutHits > TH.refusedFanoutHits) fail.push(`${m.refusedFanoutHits} sockets saw a REFUSED comp fan out — refusals must not broadcast`);
  if (m.sayAuthorP95 > TH.sayAuthorP95Ms) fail.push(`mid-burst say author p95 ${Math.round(m.sayAuthorP95)}ms > ${TH.sayAuthorP95Ms}ms — burst made healthy clients wait`);
  if (m.lightAppended < TH.lightAppended) fail.push(`mid-burst light verb not appended — builder path stalled during burst`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on anchor spectators`);
  if (m.recovered < TH.recovered) fail.push(`post-window recovery ${m.recovered}/8 — refusal wedged builders`);
  if (!m.sizeErrOk) fail.push(`oversized comp did not return the exact 8KB error`);
  if (!m.shapeErrOk) fail.push(`malformed comp did not return the exact shape error`);
  if (!m.payloadFollowUp) fail.push(`healthy comp after payload refusals did not land — shape gates wedge`);
  if (m.foldMisses > TH.foldMisses) fail.push(`${m.foldMisses} final accepted comps missing from fresh snapshot fold`);
  if (m.foldGhost > TH.foldGhost) fail.push(`${m.foldGhost} refused/oversized comps present in fold — refusals leaked into state`);
  if (m.foldCensus !== TH.foldCensus) fail.push(`fold census ${m.foldCensus} != ${TH.foldCensus} (8 targets + 1 light)`);
  if (m.logCompMismatch > TH.logCompMismatch) fail.push(`log.jsonl comp lines != observed accepted (${m.logCompMismatch} drift)`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`log.jsonl line count drifted ${m.logLineDrift} from expected appends`);
  if (m.probeP95 > TH.probeP95Ms) fail.push(`HTTP probe p95 ${Math.round(m.probeP95)}ms > ${TH.probeP95Ms}ms`);
  if (m.probeErrors > TH.probeErrors) fail.push(`${m.probeErrors} HTTP probe errors`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    failed: 0, joinP95: 50, spawnEchoes: 8,
    acceptedMin: 12, acceptedMax: 12, refusedMin: 8, verdictMisses: 0,
    compAuthorP95: 8, deliveryMisses: 0, deliveryP95: 40, refusedFanoutHits: 0,
    sayAuthorP95: 6, lightAppended: 1,
    fpsP50: 14.6, latP95: 9, gaps: 0,
    recovered: 8, sizeErrOk: true, shapeErrOk: true, payloadFollowUp: true,
    foldMisses: 0, foldGhost: 0, foldCensus: 9,
    logCompMismatch: 0, logLineDrift: 0,
    probeP95: 12, probeErrors: 0, logSuspicious: 0, rssPeakGrowth: 8,
  };
  const breached: Measurements = {
    ...healthy,
    acceptedMax: 20, refusedMin: 0, verdictMisses: 14,
    deliveryMisses: 30, refusedFanoutHits: 5,
    sayAuthorP95: 900, lightAppended: 0, recovered: 3,
    sizeErrOk: false, foldGhost: 4, foldCensus: 13, logCompMismatch: 2,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["burst budget breached", "rate protection weak", "no verdict (silent drop)", "missing comp echoes", "REFUSED comp fan out", "healthy clients wait", "builder path stalled", "wedged builders", "exact 8KB error", "refused/oversized comps present", "fold census 13", "comp lines != observed"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF + N_BUILD} embodied (16 perf + 8 comp builders) x ${POSE_HZ}Hz + ${N_ANCHOR} anchor spectators = 200 sockets from t=0; t+${SPAWN_AT / 1000}s 8 target spawns; t+${BURST_AT / 1000}s BURST ${BURST_N} comps x 8 builders (~1KB data each, expect <=12 accepted / >=8 refused each); t+${FAIR_AT / 1000}s fairness probes mid-burst-window; t+${RECOVER_AT / 1000}s post-window recovery comp per builder; t+${PAYLOAD_AT / 1000}s >8KB + malformed shape-gate probes; t+${FOLD_AT / 1000}s fresh-spectator fold check; ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}, VERB_RATE=${VERB_RATE}/4s`);
console.log(`thresholds: joins=${200 - TH.joinsFailed}/200@p95<${TH.joinP95Ms}ms spawns=${TH.spawnEchoes}/8 burstAcc<=${TH.burstAcceptedMax}/builder burstRef>=${TH.burstRefusedMin}/builder verdicts=${TH.burstVerdicts}/${BURST_N} compAuthorP95<${TH.compAuthorP95Ms}ms deliveryMiss=${TH.deliveryMisses}/p95<${TH.deliveryP95Ms}ms refusedFanout=${TH.refusedFanoutHits} sayP95<${TH.sayAuthorP95Ms}ms light=${TH.lightAppended} fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} recovered=${TH.recovered}/8 sizeErr+shapeErr exact followUp=${TH.payloadFollowUp} foldMiss=${TH.foldMisses} foldGhost=${TH.foldGhost} census=${TH.foldCensus} logCompDrift=${TH.logCompMismatch} logLineDrift=${TH.logLineDrift} probeP95<${TH.probeP95Ms}ms logSuspicious=${TH.logSuspicious} rssPeak<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget: 201 concurrent client sockets must fit ------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (!Number.isFinite(fdLimit) && fdLimit !== Infinity) {
  console.log(`FAIL: file-descriptor limit unparseable ("${fdRaw}") — launch as: ulimit -n 1024 && bun tools/pressure-compburst.ts`);
  process.exit(2);
}
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-compburst.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ---------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure5-server-${Date.now()}.log`;
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

// ---- healthy client chassis (loadtest-proven) --------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
  closed: boolean; id: string;
  probeHits: Map<string, number>;   // probe key -> arrival time (performance.now)
  compData: Map<string, unknown>;   // comp key -> entry.args.data (round-trip check)
  errs: string[];                   // error replies observed
  _bursts?: string[];               // builder burst keys (accepted-echo accounting)
};
const probeKeysLive = new Set<string>();       // keys whose fanout we account
const refusedKeysLive = new Set<string>();     // keys that must NEVER fan out
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, probeHits: new Map(), compData: new Map(), errs: [] };
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
        if (v === "say") s.says.add(a?.text);
        let key: string | undefined;
        if (v === "comp" && typeof a?.id === "string" && typeof a?.type === "string") key = `comp:${a.id}:${a.type}`;
        else if (v === "spawn" && typeof a?.id === "string" && String(a.id).startsWith("ptarget-")) key = `spawn:${a.id}`;
        else if (v === "light" && typeof a?.id === "string" && a.id.startsWith("plight-")) key = `light:${a.id}`;
        else if (v === "say" && typeof a?.text === "string") key = a.text;
        if (key) {
          if (refusedKeysLive.has(key)) {
            // a refused/oversized comp echo reaching ANY socket is a contract break
            refusedHitKeys.add(key);
          }
          if (probeKeysLive.has(key) && !s.probeHits.has(key)) {
            s.probeHits.set(key, performance.now());
            if (v === "comp") s.compData.set(key, a.data);
          }
        }
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = () => { s.closed = true; };
    ws.onerror = () => { /* close follows */ };
  });
}
const refusedHitKeys = new Set<string>();

// ---- run ----------------------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, false, i)),
  ...Array.from({ length: N_BUILD }, (_, i) => connect(`builder-${i}`, false, 100 + i)),
  ...Array.from({ length: N_ANCHOR }, (_, i) => connect(`spec-${i}`, true)),
]);
const ok = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const failed = all.length - ok.length;
const perfs = ok.filter((s) => s.id.startsWith("perf-"));
const builders = ok.filter((s) => s.id.startsWith("builder-"));
const specs = ok.filter((s) => s.id.startsWith("spec-"));
const everyone = [...perfs, ...builders, ...specs];
const joinTimes = ok.map((s) => s.joinMs);
console.log(`t+0: joined ${ok.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// embodied presence (identical shape to pressure-1..4): 24 broadcasters @ 15Hz
let running = true;
const posesSent = { n: 0 };
const tickers = [...perfs, ...builders].map((s, i) => setInterval(() => {
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

// ---- phase bookkeeping ---------------------------------------------------------
let spawnEchoes = 0;
const burstAccepted: number[] = [];        // per builder
const burstRefused: number[] = [];         // per builder (exact-message only)
let verdictMisses = 0;                     // sent verbs with neither echo nor refusal
const compAuthorLat: number[] = [];
const deliveryLat: number[] = [];
let deliveryMisses = 0;
const sayAuthorLat: number[] = [];
let lightAppended = 0;
let recovered = 0;
let sizeErrOk = false, shapeErrOk = false, payloadFollowUp = false;

// final accepted comp per (target,type) — the fold must carry exactly these
const finalCompState = new Map<string, unknown>();   // "id:type" -> data
const expectedEntities = new Set<string>(["plight-fair"]);

function accountDelivery(key: string, sentAt: number) {
  for (const s of everyone) {
    const hitAt = s.probeHits.get(key);
    if (hitAt === undefined) deliveryMisses++;
    else deliveryLat.push(hitAt - sentAt);
  }
}

// t+2.0s: each builder spawns its own target
at(SPAWN_AT, () => {
  builders.forEach((b, i) => {
    const key = `spawn:ptarget-${i}`;
    probeKeysLive.add(key);
    if (b.ws.readyState === 1) b.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: `ptarget-${i}`, lib: "deco/bench.glb", pos: [i * 2 - 7, 0, -6], yaw: 0 } }));
  });
  at(SPAWN_AT + 1_500, () => {
    for (const b of builders) {
      const i = Number(b.id.split("-")[1]);
      if (b.probeHits.has(`spawn:ptarget-${i}`)) spawnEchoes++;
    }
    console.log(`t+${SPAWN_AT / 1000}s: target spawns echoed ${spawnEchoes}/8`);
  });
});

// t+6.5s: THE BURST — 20 comp verbs per builder, back-to-back
at(BURST_AT, () => {
  const sentAt = performance.now();
  builders.forEach((b, bi) => {
    b._bursts = Array.from({ length: BURST_N }, (_, vi) => `comp:ptarget-${bi}:burst-${vi}`);
    for (let vi = 0; vi < BURST_N; vi++) {
      probeKeysLive.add(`comp:ptarget-${bi}:burst-${vi}`);
      // ~1KB of honest component data with a per-verb scalar for round-trip
      const data = { n: vi, pad: "p".repeat(1000) };
      if (b.ws.readyState === 1) b.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: `ptarget-${bi}`, type: `burst-${vi}`, data } }));
    }
  });
  // account the burst once it has settled (2s)
  at(BURST_AT + 2_000, () => {
    builders.forEach((b, bi) => {
      const acc = (b._bursts ?? []).filter((k) => b.probeHits.has(k)).length;
      const ref = b.errs.filter((e) => e === TH.rateErrMsg).length;
      burstAccepted.push(acc);
      burstRefused.push(ref);
      verdictMisses += Math.max(0, BURST_N - acc - ref);
      for (const k of b._bursts ?? []) {
        if (b.probeHits.has(k)) {
          compAuthorLat.push(b.probeHits.get(k)! - sentAt);
          accountDelivery(k, sentAt);
          // accepted comps MUST round-trip through append→fold→snapshot exactly
          const vi = Number(k.split(":burst-")[1]);
          finalCompState.set(k.slice(5), { n: vi, pad: "p".repeat(1000) });
        } else {
          refusedKeysLive.add(k);
        }
      }
    });
    // re-arm: refused keys discovered now must not appear on LATE sockets —
    // the in-flight trap only fired for oversized; retroactively sweep ALL
    // sockets for refused burst keys (probeKeysLive already recorded any
    // ghost echo that arrived during the settle window, so this is race-free)
    for (const k of refusedKeysLive) {
      for (const s of everyone) if (s.probeHits.has(k)) refusedHitKeys.add(k);
    }
    console.log(`t+${(BURST_AT + 2_000) / 1000}s: burst settled — accepted [${burstAccepted.join(",")}] refused [${burstRefused.join(",")}] verdictMisses=${verdictMisses}`);
  });
});

// t+7.0s: FAIRNESS — healthy probes from NON-bursting clients, mid-burst-window
at(FAIR_AT, () => {
  const sentAt = performance.now();
  const sayText = `fair-say-${Math.floor(t0)}`;
  const lightKey = `light:plight-fair`;
  probeKeysLive.add(sayText); probeKeysLive.add(lightKey);
  const SOLO = perfs[0], LIGHTER = perfs[15];
  if (SOLO.ws.readyState === 1) SOLO.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: sayText } }));
  if (LIGHTER.ws.readyState === 1) LIGHTER.ws.send(JSON.stringify({ type: "verb", verb: "light", args: { id: "plight-fair", pos: [0, 2, 0], color: "#ffb46b", intensity: 0.9, range: 5 } }));
  at(FAIR_AT + 2_000, () => {
    const hit = SOLO.probeHits.get(sayText);
    if (hit !== undefined) sayAuthorLat.push(hit - sentAt);
    if (LIGHTER.probeHits.has(lightKey)) lightAppended++;
    accountDelivery(sayText, sentAt);
    console.log(`t+${FAIR_AT / 1000}s: fairness probes — sayAuthor=${sayAuthorLat.length ? Math.round(sayAuthorLat[0]) : "MISSED"}ms light=${lightAppended}/1`);
  });
});

// t+12.6s: RECOVERY — each builder's next comp MUST append post-window
at(RECOVER_AT, () => {
  const sentAt = performance.now();
  builders.forEach((b, bi) => {
    const key = `comp:ptarget-${bi}:recovered`;
    probeKeysLive.add(key);
    finalCompState.set(`ptarget-${bi}:recovered`, { ok: true });
    if (b.ws.readyState === 1) b.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: `ptarget-${bi}`, type: "recovered", data: { ok: true } } }));
  });
  at(RECOVER_AT + 1_500, () => {
    for (const b of builders) {
      const bi = Number(b.id.split("-")[1]);
      if (b.probeHits.has(`comp:ptarget-${bi}:recovered`)) recovered++;
    }
    console.log(`t+${RECOVER_AT / 1000}s: post-window recovery ${recovered}/8`);
  });
});

// t+13.6s: PAYLOAD GATES — explicit refusals, then a healthy comp must land
at(PAYLOAD_AT, () => {
  const B0 = builders[0];
  const sentAt = performance.now();
  const followKey = `comp:ptarget-0:followup`;
  probeKeysLive.add(followKey);
  finalCompState.set(`ptarget-0:followup`, { ok: 1 });
  const oversized = { n: -1, pad: "x".repeat(8800) };   // JSON > 8192 chars
  if (B0.ws.readyState === 1) {
    B0.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: "ptarget-0", type: "oversized", data: oversized } }));
    B0.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: "ptarget-0", data: { x: 1 } } }));   // no type
    B0.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: "ptarget-0", type: "followup", data: { ok: 1 } } }));
  }
  refusedKeysLive.add(`comp:ptarget-0:oversized`);   // must never echo/fan out
  at(PAYLOAD_AT + 1_500, () => {
    sizeErrOk = B0.errs.some((e) => e.includes(TH.sizeErr));
    shapeErrOk = B0.errs.some((e) => e === TH.shapeErr);
    payloadFollowUp = B0.probeHits.has(followKey);
    if (payloadFollowUp) compAuthorLat.push(B0.probeHits.get(followKey)! - sentAt);
    console.log(`t+${PAYLOAD_AT / 1000}s: payload gates — sizeErr=${sizeErrOk} shapeErr=${shapeErrOk} followUp=${payloadFollowUp}`);
  });
});

// t+16.0s: FOLD — verified post-teardown by a raw spectator join whose snapshot
// state is read directly (below, after DURATION); the connect() chassis resolves
// on snapshot but keeps the payload, so the fold check re-joins raw.
let foldMisses = 0, foldGhost = 0, foldCensus = -1;

await sleep(DURATION);
running = false;
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(500);

// ---- fold join (raw, captures snapshot state directly) -------------------------
{
  const foldState = await new Promise<Record<string, any> | null>((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(null); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `fold-final-${Math.floor(t0)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { clearTimeout(to); try { ws.close(); } catch {} resolve(m.state?.entities ?? {}); }
    };
    ws.onerror = () => { clearTimeout(to); resolve(null); };
  });
  if (foldState) {
    foldCensus = Object.keys(foldState).filter((id) => id.startsWith("ptarget-") || id.startsWith("plight-")).length;
    foldMisses = 0; foldGhost = 0;
    for (const [kt, data] of finalCompState) {
      const [id, type] = kt.split(":");
      const got = foldState[id]?.comp?.[type];
      if (got === undefined || JSON.stringify(got) !== JSON.stringify(data)) foldMisses++;
    }
    for (let bi = 0; bi < N_BUILD; bi++) {
      const ent = foldState[`ptarget-${bi}`];
      // accepted burst types ARE in the fold (checked above via finalCompState);
      // ghost check: only types that were REFUSED (missing from author's echo
      // record) or the oversized probe may never appear
      for (const type of Object.keys(ent?.comp ?? {})) {
        const wasAccepted = builders[bi]?.probeHits.has(`comp:ptarget-${bi}:${type}`);
        if (!wasAccepted && (/^burst-/.test(type) || type === "oversized")) foldGhost++;
      }
    }
    // data round-trip spot proof: recovered comps carry exact {ok:true}
    for (let bi = 0; bi < N_BUILD; bi++) {
      const got = foldState[`ptarget-${bi}`]?.comp?.["recovered"];
      if (got && JSON.stringify(got) !== JSON.stringify({ ok: true })) foldMisses++;
    }
  } else { foldCensus = -2; foldMisses = 999; }
}

// ---- measurements -------------------------------------------------------------
const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (endAt - s.snapAt - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

// world log ground truth
const worldLogPath = `${WORLDS}/${WORLD}/log.jsonl`;
let logCompLines = -1, logTotalLines = -1, expectedAppends = -1;
let logLineDriftVal = 0, logCompMismatchVal = 0;
if (existsSync(worldLogPath)) {
  const wl = readFileSync(worldLogPath, "utf8").split("\n").filter(Boolean);
  logTotalLines = wl.length;
  logCompLines = wl.filter((l) => JSON.parse(l).verb === "comp").length;
  // genesis + grant + 8 spawns + 1 say + 1 light + burst accepted + 8 recovered + 1 followup
  const burstAcceptedTotal = burstAccepted.reduce((a, b) => a + b, 0);
  expectedAppends = 1 + 1 + 8 + 1 + 1 + burstAcceptedTotal + 8 + (payloadFollowUp ? 1 : 0);
  logLineDriftVal = Math.abs(logTotalLines - expectedAppends);
  logCompMismatchVal = Math.abs(logCompLines - (burstAcceptedTotal + 8 + (payloadFollowUp ? 1 : 0)));
}

const m: Measurements = {
  failed, joinP95: pct(joinTimes, 95), spawnEchoes,
  acceptedMin: burstAccepted.length ? Math.min(...burstAccepted) : 0,
  acceptedMax: burstAccepted.length ? Math.max(...burstAccepted) : 0,
  refusedMin: burstRefused.length ? Math.min(...burstRefused) : 0,
  verdictMisses,
  compAuthorP95: pct(compAuthorLat, 95),
  deliveryMisses, deliveryP95: pct(deliveryLat, 95),
  refusedFanoutHits: refusedHitKeys.size,
  sayAuthorP95: sayAuthorLat.length ? pct(sayAuthorLat, 95) : Infinity,
  lightAppended,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  recovered, sizeErrOk, shapeErrOk, payloadFollowUp,
  foldMisses, foldGhost, foldCensus,
  logCompMismatch: logCompMismatchVal, logLineDrift: logLineDriftVal,
  probeP95: pct(probeSamples, 95), probeErrors: probeErrors.n,
  logSuspicious: suspicious.length, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n}
  initial joins         ${ok.length}/${all.length} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(m.joinP95)}ms
  target spawns         ${spawnEchoes}/8 echoed
  burst accepted/builder [${burstAccepted.join(",")}] (cap ${VERB_RATE})
  burst refused/builder  [${burstRefused.join(",")}] exact "${TH.rateErrMsg}"
  burst verdict misses  ${verdictMisses}/${BURST_N * N_BUILD} (silent drops)
  comp author lat ms    n=${compAuthorLat.length} p95 ${Math.round(m.compAuthorP95)}
  comp echo delivery    ${deliveryMisses} miss / ${deliveryLat.length} receipts — p95 ${Math.round(m.deliveryP95)}ms
  refused fanout hits   ${refusedHitKeys.size} (must be 0)
  fairness: say author  ${sayAuthorLat.length ? Math.round(m.sayAuthorP95) : "MISSED"}ms  light ${lightAppended}/1
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchor spectators
  post-window recovery  ${recovered}/8
  payload gates         sizeErr=${sizeErrOk} shapeErr=${shapeErrOk} followUp=${payloadFollowUp}
  fold                  census=${foldCensus} miss=${foldMisses} ghost=${foldGhost}
  world log             comp=${logCompLines} total=${logTotalLines} expected=${expectedAppends} (drift ${logLineDriftVal}/${logCompMismatchVal})
  http probe p95        ${Math.round(m.probeP95)}ms (n=${probeSamples.length}, ${probeErrors.n} errors)
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of ok) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — component bursts get fair, explicit, budget-exact rate limiting`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
