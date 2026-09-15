// Pressure scenario 20: COMP ATTACH STORM — 200 simultaneous comp placements
// rate-limited fairly with explicit backpressure.
// Design target: 24 embodied performers @ 15Hz presence to a full house. This
// scenario asks what happens when 16 builders each fire a 200-verb comp
// attach storm SIMULTANEOUSLY (3,200 verbs, ~1KB each, all inside one rate
// window): does every verb get an explicit verdict (no silent drops under
// the heaviest burst), does the 12/4s budget hold per client, do refusals
// stay OFF the fanout and OUT of the fold, do healthy clients keep working
// while the storm drains, and does the window recover?
//
// Workload (identical presence chassis to pressure-1..19):
//   24 embodied @ 15Hz (16 pure performers + 16 storm builders — builders
//   replace 8 of the spectator budget to keep 200 sockets total) + 168
//   spectator anchors = the same 200-socket design population.
//
// Phases (pinned before measuring):
//   t=2.0s  SETUP   each storm builder spawns 4 target entities (64 spawns,
//                   a 4-wide rotation set per builder for sparse fold checks)
//   t=6.5s  STORM   all 16 builders send 200 comp verbs back-to-back each,
//                   unique type per verb, rotating targets (i%4), ~1KB data.
//                   Per builder the first 12 must append, the remaining 188
//                   must refuse with the exact "slow down — verb rate limit".
//                   3,200 verdicts, zero silent drops. Drain duration
//                   (first→last verdict) is MEASURED and reported, not gated.
//   t=7.5s  FAIR    mid/post-storm healthy probes from NON-storming clients:
//                   solo say + builder-lane light verb must land while the
//                   storm verdicts churn.
//   t=11.0s SETTLE  verdict accounting once the storm has drained.
//   t=12.6s RECOVER post-window probe: every builder's next comp MUST append
//                   — refusal is flow control, never a wedge. 16/16.
//   t=16.0s FOLD    a fresh spectator joins and reads the folded world:
//                   census exact (64 targets + 1 probe light), every accepted
//                   comp present with EXACT data, every refused type ABSENT,
//                   per-target storm-type counts exactly 3 (the first-12
//                   rotation spread — catches a harness targeting bug too).
//   teardown: world log.jsonl ground truth — comp lines == accepted total
//   (192 storm + 16 recovered), total lines == expected appends, 0
//   suspicious server-log lines.
//
// Acceptance gates (pinned before measuring):
//   - joins: 200/200, p95 < 3s                       (same envelope as 1..19)
//   - spawn echoes: 64/64 targets spawned
//   - storm budgets: per-builder accepted EXACTLY 12, refused >= 188,
//     verdicts == 200 per builder (3,200 total, no silent drops)
//   - refusal message: exact "slow down — verb rate limit"
//   - accepted comp author latency: p95 < 500ms (incl. append + fanout)
//   - fanout: every accepted comp on all 200 sockets, exact data.n,
//     p95 < 1s (38,400 receipts)
//   - refused fanout: 0 sockets ever see any of the 3,008 refused keys
//   - fairness: mid-storm say author p95 < 500ms, light appended, anchor
//     fps p50 >= 12, frame lat p95 < 250ms, 0 seq gaps
//   - recover: 16/16 post-window builder comps appended
//   - fold: census exact; accepted bags exact (round-trip data.n);
//     per-target storm-type count exactly 3; refused/ghost types 0
//   - log ground truth: comp lines == 208; total == expected appends
//   - event loop p95 < 1000ms; RSS peak growth < 60MB; 0 suspicious lines
//
//   SERVER_DIR=/tmp/pressure-wt PORT=8985 bun tools/pressure-attachstorm.ts
//   SELFTEST=1 bun tools/pressure-attachstorm.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract (printed before measuring) ---------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure-wt";
const PORT = Number(process.env.PORT ?? 8985);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure20-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 16, N_STORM = 16, N_ANCHOR = 168;  // 24 embodied + 168 = 200
const TARGETS_PER = 4;                            // rotation set per builder
const POSE_HZ = 15;
const SPAWN_AT = 2_000;
const STORM_AT = 6_500;        // 4.5s after spawns — the verb window is fresh
const STORM_N = 200;           // per builder; 12/4s must refuse >= 188
const FAIR_AT = 7_500;         // healthy probes while/just after storm churn
const SETTLE_AT = 11_000;      // verdict accounting (drain long finished)
const RECOVER_AT = 12_600;     // burst window long expired
const FOLD_AT = 16_000;        // fresh spectator reads the folded world
const DURATION = 19_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..19
const VERB_RATE = 12;          // server/config.ts default
const SELFTEST = process.env.SELFTEST === "1";

// acceptance thresholds (fail any → exit 1)
const TH = {
  joinsFailed: 0,
  joinP95Ms: 3_000,
  spawnEchoes: 64,
  burstAcceptedExact: 12,      // per builder — in-order window: exactly 12
  burstRefusedMin: 188,        // per builder — protection actually engages
  burstVerdicts: 200,          // accepted + refused == sent (no silent drops)
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
  recovered: 16,               // post-window builder comps appended
  foldMisses: 0,               // final accepted comps wrong/missing from fold
  foldGhost: 0,                // refused types present in any entity bag
  foldPerTargetStorm: 3,       // sparse spread: exactly 3 storm types/target
  foldCensus: 65,              // 64 targets + 1 probe light, exactly
  logCompLines: 16 * 12 + 16,        // accepted storm (16x12) + recovered (16)
  logLineDrift: 0,                   // log lines vs expected appends
  logCompDrift: 0,
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
  recovered: number;
  foldMisses: number; foldGhost: number; foldPerTargetBad: number; foldCensus: number;
  logCompMismatch: number; logLineDrift: number;
  probeP95: number; probeErrors: number; logSuspicious: number; rssPeakGrowth: number;
  drainMs: number;               // measured, reported, deliberately NOT gated
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.failed > TH.joinsFailed) fail.push(`${m.failed} initial connections failed to join`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`initial join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.spawnEchoes < TH.spawnEchoes) fail.push(`only ${m.spawnEchoes}/64 target spawns echoed`);
  if (m.acceptedMin !== TH.burstAcceptedExact || m.acceptedMax !== TH.burstAcceptedExact)
    fail.push(`storm budget not exact-12: per-builder accepted [${m.acceptedMin}..${m.acceptedMax}]`);
  if (m.refusedMin < TH.burstRefusedMin) fail.push(`rate protection weak: min refusals per builder ${m.refusedMin} < ${TH.burstRefusedMin}`);
  if (m.verdictMisses > 0) fail.push(`${m.verdictMisses} storm verbs got no verdict (silent drop)`);
  if (m.compAuthorP95 > TH.compAuthorP95Ms) fail.push(`comp author latency p95 ${Math.round(m.compAuthorP95)}ms > ${TH.compAuthorP95Ms}ms`);
  if (m.deliveryMisses > TH.deliveryMisses) fail.push(`${m.deliveryMisses} socket-rounds missing comp echoes — storm fanout lost`);
  if (m.deliveryP95 > TH.deliveryP95Ms) fail.push(`comp echo delivery p95 ${Math.round(m.deliveryP95)}ms > ${TH.deliveryP95Ms}ms`);
  if (m.refusedFanoutHits > TH.refusedFanoutHits) fail.push(`${m.refusedFanoutHits} sockets saw a REFUSED comp fan out — refusals must not broadcast`);
  if (m.sayAuthorP95 > TH.sayAuthorP95Ms) fail.push(`mid-storm say author p95 ${Math.round(m.sayAuthorP95)}ms > ${TH.sayAuthorP95Ms}ms — storm made healthy clients wait`);
  if (m.lightAppended < TH.lightAppended) fail.push(`mid-storm light verb not appended — builder path stalled during storm`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on anchor spectators`);
  if (m.recovered < TH.recovered) fail.push(`post-window recovery ${m.recovered}/16 — refusal wedged builders`);
  if (m.foldMisses > TH.foldMisses) fail.push(`${m.foldMisses} final accepted comps missing/wrong from fresh snapshot fold`);
  if (m.foldGhost > TH.foldGhost) fail.push(`${m.foldGhost} refused comps present in fold — refusals leaked into state`);
  if (m.foldPerTargetBad > 0) fail.push(`${m.foldPerTargetBad} targets without exactly ${TH.foldPerTargetStorm} storm types — sparse spread broken`);
  if (m.foldCensus !== TH.foldCensus) fail.push(`fold census ${m.foldCensus} != ${TH.foldCensus} (64 targets + 1 light)`);
  if (m.logCompMismatch > TH.logCompDrift) fail.push(`log.jsonl comp lines != observed accepted (${m.logCompMismatch} drift)`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`log.jsonl line count drifted ${m.logLineDrift} from expected appends`);
  if (m.probeP95 > TH.probeP95Ms) fail.push(`HTTP probe p95 ${Math.round(m.probeP95)}ms > ${TH.probeP95Ms}ms`);
  if (m.probeErrors > TH.probeErrors) fail.push(`${m.probeErrors} HTTP probe errors`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    failed: 0, joinP95: 50, spawnEchoes: 64,
    acceptedMin: 12, acceptedMax: 12, refusedMin: 188, verdictMisses: 0,
    compAuthorP95: 22, deliveryMisses: 0, deliveryP95: 190, refusedFanoutHits: 0,
    sayAuthorP95: 6, lightAppended: 1,
    fpsP50: 14.6, latP95: 12, gaps: 0,
    recovered: 16,
    foldMisses: 0, foldGhost: 0, foldPerTargetBad: 0, foldCensus: 65,
    logCompMismatch: 0, logLineDrift: 0,
    probeP95: 14, probeErrors: 0, logSuspicious: 0, rssPeakGrowth: 22,
    drainMs: 850,
  };
  const breached: Measurements = {
    ...healthy,
    acceptedMin: 11, acceptedMax: 200, refusedMin: 0, verdictMisses: 300,
    deliveryMisses: 40, refusedFanoutHits: 7,
    sayAuthorP95: 900, lightAppended: 0, recovered: 9,
    foldMisses: 5, foldGhost: 12, foldPerTargetBad: 48, foldCensus: 71, logCompMismatch: 3,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["storm budget not exact-12", "rate protection weak", "no verdict (silent drop)", "missing comp echoes", "REFUSED comp fan out", "storm made healthy clients wait", "builder path stalled", "wedged builders", "missing/wrong from fresh snapshot fold", "refused comps present in fold", "sparse spread broken", "fold census 71", "comp lines != observed"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF + N_STORM} embodied (16 perf + 16 storm builders) x ${POSE_HZ}Hz + ${N_ANCHOR} anchor spectators = 200 sockets from t=0; t+${SPAWN_AT / 1000}s 64 target spawns (4 per builder); t+${STORM_AT / 1000}s STORM ${STORM_N} comp verbs x 16 builders simultaneous (~1KB each, unique type per verb, rotating targets — expect EXACTLY 12 accepted / >=188 refused each, ${STORM_N * N_STORM} verdicts 0 silent); t+${FAIR_AT / 1000}s fairness probes; t+${SETTLE_AT / 1000}s settle accounting; t+${RECOVER_AT / 1000}s post-window recovery comp per builder; t+${FOLD_AT / 1000}s fresh-spectator fold check; ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}, VERB_RATE=${VERB_RATE}/4s`);
console.log(`thresholds: joins=${200 - TH.joinsFailed}/200@p95<${TH.joinP95Ms}ms spawns=${TH.spawnEchoes}/64 stormAcc=EXACT${TH.burstAcceptedExact}/builder stormRef>=${TH.burstRefusedMin}/builder verdicts=${TH.burstVerdicts}/${STORM_N} compAuthorP95<${TH.compAuthorP95Ms}ms deliveryMiss=${TH.deliveryMisses}/p95<${TH.deliveryP95Ms}ms refusedFanout=${TH.refusedFanoutHits} sayP95<${TH.sayAuthorP95Ms}ms light=${TH.lightAppended} fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} recovered=${TH.recovered}/16 foldMiss=${TH.foldMisses} foldGhost=${TH.foldGhost} perTargetStorm=${TH.foldPerTargetStorm} census=${TH.foldCensus} logCompDrift=${TH.logCompDrift} logLineDrift=${TH.logLineDrift} probeP95<${TH.probeP95Ms}ms logSuspicious=${TH.logSuspicious} rssPeak<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget: 201 concurrent client sockets must fit ------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (!Number.isFinite(fdLimit) && fdLimit !== Infinity) {
  console.log(`FAIL: file-descriptor limit unparseable ("${fdRaw}") — launch as: ulimit -n 1024 && bun tools/pressure-attachstorm.ts`);
  process.exit(2);
}
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-attachstorm.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ---------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure20-server-${Date.now()}.log`;
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
 errAt: number[];                  // arrival time of each error reply (verdict drain)
 _storms?: string[];               // builder storm keys (accepted-echo accounting)
};
const probeKeysLive = new Set<string>();       // keys whose fanout we account
const refusedKeysLive = new Set<string>();     // keys that must NEVER fan out
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, probeHits: new Map(), compData: new Map(), errs: [], errAt: [] };
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
            // a refused comp echo reaching ANY socket is a contract break
            refusedHitKeys.add(key);
          }
          if (probeKeysLive.has(key) && !s.probeHits.has(key)) {
            s.probeHits.set(key, performance.now());
            if (v === "comp") s.compData.set(key, a.data);
          }
        }
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
        s.errAt.push(performance.now());
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
  ...Array.from({ length: N_STORM }, (_, i) => connect(`builder-${i}`, false, 100 + i)),
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

// embodied presence (identical shape to pressure-1..19): 24 broadcasters @ 15Hz
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
let stormSentAt = 0;

// final accepted comp per (target,type) — the fold must carry exactly these
const finalCompState = new Map<string, unknown>();   // "id:type" -> data

function accountDelivery(key: string, sentAt: number) {
  for (const s of everyone) {
    const hitAt = s.probeHits.get(key);
    if (hitAt === undefined) deliveryMisses++;
    else deliveryLat.push(hitAt - sentAt);
  }
}
// measured verdict drain: first→last verdict arrival across all builders
// (accepted echoes via probeHits, refusals via errAt — before SETTLE the only
// errors on builder sockets are storm refusals, so the span is exact)
function verdictSpan() {
  let first = Infinity, last = 0;
  for (const b of builders) {
    for (const k of b._storms ?? []) {
      const h = b.probeHits.get(k);
      if (h !== undefined) { if (h < first) first = h; if (h > last) last = h; }
    }
    for (const e of b.errAt) { if (e < first) first = e; if (e > last) last = e; }
  }
  return first === Infinity ? -1 : last - first;
}

// t+2.0s: each builder spawns its 4 rotation targets (64 total)
at(SPAWN_AT, () => {
  builders.forEach((b, i) => {
    for (let j = 0; j < TARGETS_PER; j++) {
      const key = `spawn:ptarget-${i}-${j}`;
      probeKeysLive.add(key);
      if (b.ws.readyState === 1) b.ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: `ptarget-${i}-${j}`, lib: "deco/bench.glb", pos: [i * 2 - 15, 0, j * 2 - 8], yaw: 0 } }));
    }
  });
  at(SPAWN_AT + 2_000, () => {
    for (const b of builders) {
      const i = Number(b.id.split("-")[1]);
      for (let j = 0; j < TARGETS_PER; j++) if (b.probeHits.has(`spawn:ptarget-${i}-${j}`)) spawnEchoes++;
    }
    console.log(`t+${SPAWN_AT / 1000}s: target spawns echoed ${spawnEchoes}/64`);
  });
});

// t+6.5s: THE STORM — 200 comp verbs per builder, back-to-back, all 16 at once
at(STORM_AT, () => {
  stormSentAt = performance.now();
  builders.forEach((b, bi) => {
    b._storms = Array.from({ length: STORM_N }, (_, vi) => `comp:ptarget-${bi}-${vi % TARGETS_PER}:st-${vi}`);
    for (let vi = 0; vi < STORM_N; vi++) {
      probeKeysLive.add(`comp:ptarget-${bi}-${vi % TARGETS_PER}:st-${vi}`);
      // ~1KB of honest component data with a per-verb scalar for round-trip
      const data = { n: vi, pad: "s".repeat(1000) };
      if (b.ws.readyState === 1) b.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: `ptarget-${bi}-${vi % TARGETS_PER}`, type: `st-${vi}`, data } }));
    }
  });
});

// t+7.5s: FAIRNESS — healthy probes from NON-storming clients, while/just after
// the storm verdicts churn through validate+refuse/append+broadcast
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
    console.log(`t+${FAIR_AT / 1000}s: fairness probes — sayAuthor=${sayAuthorLat.length ? Math.round(sayAuthorLat[0]) : "MISSED"}ms light=${lightAppended}/1 (drain ${Math.round(verdictSpan())}ms so far)`);
  });
});

// t+11.0s: SETTLE — verdict accounting once the storm has fully drained
at(SETTLE_AT, () => {
  builders.forEach((b, bi) => {
    const acc = (b._storms ?? []).filter((k) => b.probeHits.has(k)).length;
    const ref = b.errs.filter((e) => e === TH.rateErrMsg).length;
    burstAccepted.push(acc);
    burstRefused.push(ref);
    verdictMisses += Math.max(0, STORM_N - acc - ref);
    for (let vi = 0; vi < STORM_N; vi++) {
      const k = `comp:ptarget-${bi}-${vi % TARGETS_PER}:st-${vi}`;
      if (b.probeHits.has(k)) {
        compAuthorLat.push(b.probeHits.get(k)! - stormSentAt);
        accountDelivery(k, stormSentAt);
        // accepted comps MUST round-trip through append→fold→snapshot exactly
        finalCompState.set(k.slice(5), { n: vi, pad: "s".repeat(1000) });
      } else {
        refusedKeysLive.add(k);
      }
    }
  });
  // re-arm: refused keys discovered now must not appear on LATE sockets —
  // retroactively sweep ALL sockets for refused storm keys (probeKeysLive
  // already recorded any ghost echo that arrived during the settle window,
  // so this is race-free)
  for (const k of refusedKeysLive) {
    for (const s of everyone) if (s.probeHits.has(k)) refusedHitKeys.add(k);
  }
  console.log(`t+${SETTLE_AT / 1000}s: storm settled — accepted [${burstAccepted.join(",")}] refused [${burstRefused.join(",")}] verdictMisses=${verdictMisses}/${STORM_N * N_STORM} (verdict drain observed ${Math.round(verdictSpan())}ms)`);
});

// t+12.6s: RECOVERY — every builder's next comp MUST append post-window
at(RECOVER_AT, () => {
  const sentAt = performance.now();
  builders.forEach((b, bi) => {
    const key = `comp:ptarget-${bi}-0:recovered`;
    probeKeysLive.add(key);
    finalCompState.set(`ptarget-${bi}-0:recovered`, { ok: true });
    if (b.ws.readyState === 1) b.ws.send(JSON.stringify({ type: "verb", verb: "comp", args: { id: `ptarget-${bi}-0`, type: "recovered", data: { ok: true } } }));
  });
  at(RECOVER_AT + 1_500, () => {
    for (const b of builders) {
      const bi = Number(b.id.split("-")[1]);
      if (b.probeHits.has(`comp:ptarget-${bi}-0:recovered`)) recovered++;
    }
    console.log(`t+${RECOVER_AT / 1000}s: post-window recovery ${recovered}/16`);
  });
});

// t+16.0s: FOLD — verified post-teardown by a raw spectator join whose snapshot
// state is read directly (below, after DURATION); the connect() chassis resolves
// on snapshot but keeps the payload, so the fold check re-joins raw.
let foldMisses = 0, foldGhost = 0, foldCensus = -1, foldPerTargetBad = 0;

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
    foldMisses = 0; foldGhost = 0; foldPerTargetBad = 0;
    // every accepted comp present with EXACT data
    for (const [kt, data] of finalCompState) {
      const idx = kt.indexOf(":");
      const id = kt.slice(0, idx), type = kt.slice(idx + 1);
      const got = foldState[id]?.comp?.[type];
      if (got === undefined || JSON.stringify(got) !== JSON.stringify(data)) foldMisses++;
    }
    // ghost check: only st-* types that were REFUSED may never appear
    for (let bi = 0; bi < N_STORM; bi++) {
      for (let j = 0; j < TARGETS_PER; j++) {
        const ent = foldState[`ptarget-${bi}-${j}`];
        const types = Object.keys(ent?.comp ?? {});
        let stormCount = 0;
        for (const type of types) {
          if (/^st-/.test(type)) {
            stormCount++;
            if (!builders[bi]?.probeHits.has(`comp:ptarget-${bi}-${j}:${type}`)) foldGhost++;
          }
        }
        // the first-12 rotation spread puts exactly 3 storm types on each target
        if (stormCount !== TH.foldPerTargetStorm) foldPerTargetBad++;
      }
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
  // genesis + grant + 64 spawns + 1 say + 1 light + storm accepted + 16 recovered
  const burstAcceptedTotal = burstAccepted.reduce((a, b) => a + b, 0);
  expectedAppends = 1 + 1 + N_STORM * TARGETS_PER + 1 + 1 + burstAcceptedTotal + 16;
  logLineDriftVal = Math.abs(logTotalLines - expectedAppends);
  logCompMismatchVal = Math.abs(logCompLines - (burstAcceptedTotal + 16));
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
  recovered,
  foldMisses, foldGhost, foldPerTargetBad, foldCensus,
  logCompMismatch: logCompMismatchVal, logLineDrift: logLineDriftVal,
  probeP95: pct(probeSamples, 95), probeErrors: probeErrors.n,
  logSuspicious: suspicious.length, rssPeakGrowth,
  drainMs: verdictSpan(),
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n}
  initial joins         ${ok.length}/${all.length} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(m.joinP95)}ms
  target spawns         ${spawnEchoes}/64 echoed
  storm accepted/builder [${burstAccepted.join(",")}] (cap ${VERB_RATE})
  storm refused/builder  [${burstRefused.join(",")}] exact "${TH.rateErrMsg}"
  storm verdict misses  ${verdictMisses}/${STORM_N * N_STORM} (silent drops)
  storm verdict drain   ${Math.round(m.drainMs)}ms for ${STORM_N * N_STORM} verbs (measured, ungated)
  comp author lat ms    n=${compAuthorLat.length} p95 ${Math.round(m.compAuthorP95)}
  comp echo delivery    ${deliveryMisses} miss / ${deliveryLat.length} receipts — p95 ${Math.round(m.deliveryP95)}ms
  refused fanout hits   ${refusedHitKeys.size} across ${refusedKeysLive.size} refused keys (must be 0)
  fairness: say author  ${sayAuthorLat.length ? Math.round(m.sayAuthorP95) : "MISSED"}ms  light ${lightAppended}/1
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchor spectators
  post-window recovery  ${recovered}/16
  fold                  census=${foldCensus} miss=${foldMisses} ghost=${foldGhost} perTargetBad=${foldPerTargetBad}
  world log             comp=${logCompLines} total=${logTotalLines} expected=${expectedAppends} (drift ${logLineDriftVal}/${logCompMismatchVal})
  http probe p95        ${Math.round(m.probeP95)}ms (n=${probeSamples.length}, ${probeErrors.n} errors)
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of ok) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — 3,200-verb comp attach storm gets exact, fair, explicitly-backpressured rate limiting`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
