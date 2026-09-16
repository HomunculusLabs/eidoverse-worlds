// Pressure scenario 21: ENTITY ID SQUATTING — hostile client cannot reserve
// ids to deny service.
// Design target: 24 embodied performers @ 15Hz presence to a full house. This
// scenario asks what a hostile builder can do with the entity ID NAMESPACE
// itself. The fold stores entities in a plain dict, and three string ids are
// not names but JavaScript dict machinery (proven on the unfixed tree):
//   - `__proto__`  — spawn re-aims the entity dict's PROTOTYPE (ghost key,
//     invisible to snapshots, remove() silently no-ops: unremovable). With NO
//     prior spawn, comp/place/motion/light onto it read the inherited
//     Object.prototype (truthy) and write the attacker's bag/pos onto it
//     GLOBALLY — every innocent {} in the process inherits pos [9,9,9];
//     for-in sees the bag; a later legit comp on a FRESH entity vanishes from
//     own-key snapshots. The poison rides the log forever; every client that
//     folds the log pollutes its own Object.prototype.
//   - mount rider->`__proto__` then remove `__proto__` — the remove fold
//     throws (`gone.pos[0]` on a proto without pos): the log entry is
//     UNREPLAYABLE and the world can never boot again (data-loss DoS).
//   - `constructor`/`prototype` — read yields inherited builtins (truthy):
//     read-then-write verbs mutate runtime internals.
//   - grant/ban `__proto__` — same dict-key seam on the roles map: every
//     unlisted id INHERITS the granted role through the polluted prototype
//     (owner escalation for anyone who joins after).
// Plus the growth prong: spawn ids/libs are UNBOUNDED up to the 256KB frame
// cap (comp slices ids to 64 — spawn never got a validator), so two verbs
// plant ~120KB of id bytes into every future joiner's snapshot. Plus the
// BY-DESIGN plain squat: spawn+lock on ids a victim plans to use denies them
// UNTIL any builder unlocks (lock is an accident guard, rank 1 toggles it) —
// documented as recoverable-by-design, exercised and recovered, not patched.
//
// Workload (identical presence chassis to pressure-1..20):
//   22 perf + 2 victims + 8 hostile legs = 32 embodied @ 15Hz + 136 spec
//   anchors = 168 sockets + 12 late joiners + 3 canaries + 2 yard legs.
//
// Phases (pinned before measuring):
//   t= 2.0s VICTIM PLAN  victim-0 spawns vbench-0..5 (6 legit props).
//   t= 4.0s HOSTILE WAVE all 8 hostile legs, fresh verb windows:
//             4 squat legs  — spawn vbench-6..9, vstage-0..1 + lock each
//                             (12 verbs; the by-design denial)
//             3 poison legs — reserved-id menu once each: spawn/comp/place/
//                             light/motion/remove `__proto__` + spawn
//                             `constructor` + spawn `prototype` (8)
//             1 giant leg   — 2 spawns with 60,000-char ids (sub-256KB
//                             legal frames) (2)
//   t= 6.0s FAIRNESS      solo say + 12 late spectator joins MID-POISON.
//   t= 8.0s VICTIM BATCH2 victim-1 spawns vbench-6..11 + vstage-0..1 — the 6
//                         squatted must bounce on locks (documented);
//                         vbench-10/11 are free and append.
//   t= 9.5s CANARY-1      fresh spectator reads the folded world: census,
//                         bag inheritance, >64-char ids, snapshot bytes.
//   t=11.0s RECOVERY      victim-0 unlocks the 6 squatted ids; t=12.5s
//                         victim-1 re-spawns all 8 — service restored by
//                         design (unlock is rank 1).
//   t=14.0s BRICKYARD     second world on the same server: auto-owner leg
//                         spawns yard-rider, mounts rider->`__proto__`,
//                         removes `__proto__` (the replay-brick chain),
//                         grants {id:`__proto__`, role:owner}; an unlisted
//                         second leg then attempts grant (escalation probe:
//                         on the unfixed tree the polluted roles prototype
//                         makes it OWNER).
//   t=15.5s CANARY-2      post-recovery snapshot: byte delta vs canary-1
//                         (giant-id bloat bound), census re-check.
//   t=18.0s teardown; kill server; RESTART PROBE on the same WORLDS_DIR at a
//                         second port: BOTH worlds must boot and join clean
//                         (the unfixed tree's brickyard log throws in replay).
//
// Acceptance gates (pinned before measuring):
//   - joins: 180 initial /180, p95 < 3s; 12/12 late mid-poison joins p95 < 3s
//   - victim plan: 6/6 echoes
//   - reserved-id menu: 11/11 verbs REFUSED with the exact message; 0 entries
//     with reserved ids in log.jsonl (authoritative accepted count); 0 silent
//   - canary purity: 0 attacker bag types on victim entities, 0 ids > 64
//     chars, snapshot growth canary2-canary1 < 4096B
//   - squat denial documented: 6/6 batch-2 squatted spawns bounced on locks
//   - recovery: 6/6 unlocks + 8/8 re-spawns accepted
//   - escalation: yard grant by the unlisted leg refused (0 escalations)
//   - brick: post-restart joins 2/2 (both worlds bootable); canary-3 pure
//   - fairness: mid-wave say author p95 < 500ms; anchor fps p50 >= 12;
//     frame lat p95 < 250ms; 0 seq gaps
//   - log ground truth: spawn/total lines == observed appends, drift 0
//   - event loop p95 < 1000ms; RSS peak growth < 60MB; 0 suspicious lines
//
//   SERVER_DIR=/tmp/pressure-wt PORT=8984 PORT2=8979 bun tools/pressure-squat.ts
//   SELFTEST=1 bun tools/pressure-squat.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract (printed before measuring) ---------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure-wt";
const PORT = Number(process.env.PORT ?? 8984);
const PORT2 = Number(process.env.PORT2 ?? 8979);   // restart probe port
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure21-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const YARD = "brickyard";
const N_PERF = 22, N_VICTIM = 2, N_HOSTILE = 8, N_ANCHOR = 136; // 168 sockets
const POSE_HZ = 15;
const PLAN_AT = 2_000;
const WAVE_AT = 4_000;
const FAIR_AT = 6_000;
const BATCH2_AT = 8_000;
const CANARY1_AT = 9_500;
const UNLOCK_AT = 11_000;
const RESPAWN_AT = 12_500;
const YARD_AT = 14_000;
const CANARY2_AT = 15_500;
const DURATION = 18_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..20
const GIANT_ID_LEN = 60_000;   // sub-256KB frame, legal on the wire today
const SQUAT_IDS = ["vbench-6", "vbench-7", "vbench-8", "vbench-9", "vstage-0", "vstage-1"];
const FREE_IDS = ["vbench-10", "vbench-11"];
const RESERVED = ["__proto__", "constructor", "prototype"];
const GIANT_IDS = [0, 1].map((gi) => `giant-${gi}-` + "a".repeat(GIANT_ID_LEN));
const ATTACKER_TYPES = ["pwnbag"];   // comp types only the poison legs send

// acceptance thresholds (fail any → exit 1)
const TH = {
  joinsFailed: 0,
  joinP95Ms: 3_000,
  lateJoins: 12, lateJoinP95Ms: 3_000,
  planEchoes: 6,
  poisonAccepted: 0,            // log.jsonl entries with reserved ids (11 sent)
  poisonSilent: 0,              // sent without echo OR error verdict
  canaryBagHits: 0,             // attacker comp types seen on victim entities
  canaryGiantIds: 0,            // entity ids > 64 chars in any snapshot
  snapshotBloatBytes: 4_096,    // canary2 - canary1 byte growth bound
  batch2LockBounces: 6,         // the by-design squat denial, documented
  unlocks: 6, respawns: 8,      // recovery by design
  yardEscalations: 0,           // grant by unlisted leg must be refused
  restartJoins: 2,              // both worlds joinable after restart
  restartGiantIds: 0, restartBagHits: 0,
  sayAuthorP95Ms: 500,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  logSpawnDrift: 0, logTotalDrift: 0,
  probeP95Ms: 1_000, probeErrors: 0,
  logSuspicious: 0,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) -----------------
type Measurements = {
  failed: number; joinP95: number; lateOk: number; lateP95: number;
  planEchoes: number;
  poisonAccepted: number; poisonSilent: number;
  canaryBagHits: number; canaryGiantIds: number;
  snapshotBloat: number;
  batch2LockBounces: number;
  unlocks: number; respawns: number;
  yardEscalations: number;
  restartJoins: number; restartBagHits: number; restartGiantIds: number;
  sayAuthorP95: number;
  fpsP50: number; latP95: number; gaps: number;
  logSpawnDrift: number; logTotalDrift: number;
  probeP95: number; probeErrors: number; logSuspicious: number; rssPeakGrowth: number;
};
const POISON_SENT = 11;
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.failed > TH.joinsFailed) fail.push(`${m.failed} initial connections failed to join`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`initial join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.lateOk < TH.lateJoins) fail.push(`late mid-poison joins ${m.lateOk}/12 — snapshots unservable during the wave`);
  if (m.lateP95 > TH.lateJoinP95Ms) fail.push(`late join p95 ${Math.round(m.lateP95)}ms > ${TH.lateJoinP95Ms}ms`);
  if (m.planEchoes < TH.planEchoes) fail.push(`victim plan ${m.planEchoes}/6 echoed`);
  if (m.poisonAccepted > TH.poisonAccepted) fail.push(`${m.poisonAccepted} reserved-id verbs reached log.jsonl — poison accepted`);
  if (m.poisonSilent > TH.poisonSilent) fail.push(`${m.poisonSilent} reserved-id verbs got no verdict (silent drop)`);
  if (m.canaryBagHits > TH.canaryBagHits) fail.push(`${m.canaryBagHits} victim entities carry the attacker's comp bag — fold polluted`);
  if (m.canaryGiantIds > TH.canaryGiantIds) fail.push(`${m.canaryGiantIds} entity ids > 64 chars in snapshots — unbounded id growth`);
  if (m.snapshotBloat > TH.snapshotBloatBytes) fail.push(`snapshot grew ${m.snapshotBloat}B between canaries > ${TH.snapshotBloatBytes}B — giant ids ride every join`);
  if (m.batch2LockBounces < TH.batch2LockBounces) fail.push(`squat denial not exercised: ${m.batch2LockBounces}/6 squatted spawns bounced on locks`);
  if (m.unlocks < TH.unlocks) fail.push(`recovery unlocks ${m.unlocks}/6 — squatted locks not openable by the victim`);
  if (m.respawns < TH.respawns) fail.push(`recovery re-spawns ${m.respawns}/8 — victim could not reclaim its ids`);
  if (m.yardEscalations > TH.yardEscalations) fail.push(`${m.yardEscalations} grant escalations via polluted roles — unlisted leg gained owner rank`);
  if (m.restartJoins < TH.restartJoins) fail.push(`post-restart joins ${m.restartJoins}/2 — a world is unbootable (replay-brick)`);
  if (m.restartBagHits > TH.restartBagHits) fail.push(`${m.restartBagHits} poison bag hits after restart — pollution survived replay`);
  if (m.restartGiantIds > TH.restartGiantIds) fail.push(`${m.restartGiantIds} giant ids after restart`);
  if (m.sayAuthorP95 > TH.sayAuthorP95Ms) fail.push(`mid-wave say author p95 ${Math.round(m.sayAuthorP95)}ms > ${TH.sayAuthorP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on anchor spectators`);
  if (m.logSpawnDrift > TH.logSpawnDrift) fail.push(`log.jsonl spawn lines drifted ${m.logSpawnDrift} from observed`);
  if (m.logTotalDrift > TH.logTotalDrift) fail.push(`log.jsonl total lines drifted ${m.logTotalDrift} from expected appends`);
  if (m.probeP95 > TH.probeP95Ms) fail.push(`HTTP probe p95 ${Math.round(m.probeP95)}ms > ${TH.probeP95Ms}ms`);
  if (m.probeErrors > TH.probeErrors) fail.push(`${m.probeErrors} HTTP probe errors`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (process.env.SELFTEST === "1") {
  const healthy: Measurements = {
    failed: 0, joinP95: 42, lateOk: 12, lateP95: 35,
    planEchoes: 6,
    poisonAccepted: 0, poisonSilent: 0,
    canaryBagHits: 0, canaryGiantIds: 0,
    snapshotBloat: 980,
    batch2LockBounces: 6,
    unlocks: 6, respawns: 8,
    yardEscalations: 0,
    restartJoins: 2, restartBagHits: 0, restartGiantIds: 0,
    sayAuthorP95: 6,
    fpsP50: 14.8, latP95: 11, gaps: 0,
    logSpawnDrift: 0, logTotalDrift: 0,
    probeP95: 5, probeErrors: 0, logSuspicious: 0, rssPeakGrowth: 21,
  };
  const breached: Measurements = {
    ...healthy,
    poisonAccepted: 8,
    canaryBagHits: 6, canaryGiantIds: 2,
    snapshotBloat: 121_400,
    yardEscalations: 1,
    restartJoins: 1,
    restartBagHits: 6, restartGiantIds: 2,
  };
  const f1 = evaluate(healthy), f2 = evaluate(breached);
  const redNeed = 8;
  const redOk = f2.length >= redNeed
    && f2.some((l) => l.includes("reached log.jsonl"))
    && f2.some((l) => l.includes("comp bag"))
    && f2.some((l) => l.includes("ids > 64"))
    && f2.some((l) => l.includes("grew"))
    && f2.some((l) => l.includes("escalation"))
    && f2.some((l) => l.includes("unbootable"))
    && f2.some((l) => l.includes("survived replay"))
    && f2.some((l) => l.includes("giant ids after restart"));
  console.log(`SELFTEST: healthy ${f1.length === 0 ? "PASS" : "FAIL(" + f1.join("; ") + ")"} | breached ${f2.length} failures ${redOk ? "RED-OK" : "RED-MISSING"}`);
  process.exit(f1.length === 0 && redOk ? 0 : 1);
}

// ---- fd guard -----------------------------------------------------------------
const fdRaw = Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout.toString().trim();
const fdLimit = Number(fdRaw);
if (!Number.isFinite(fdLimit) && fdRaw !== "unlimited") {
  console.log(`FAIL: file-descriptor limit unparseable ("${fdRaw}") — launch as: ulimit -n 1024 && bun tools/pressure-squat.ts`);
  process.exit(2);
}
if (fdRaw !== "unlimited" && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-squat.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ---------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure21-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
const server = Bun.spawn({
  cmd: ["bun", "run", "server/server.ts"],
  cwd: SERVER_DIR,
  env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR },
  stdout: logFile, stderr: logFile,
});
const rss = (pid: number = server.pid) => {
  try {
    const r = Bun.spawnSync(["ps", "-o", "rss=", "-p", String(pid)]);
    return Number(String(r.stdout).trim());
  } catch { return NaN; }
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MB = (kb: number) => Math.round(kb / 1024);
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
async function waitReady(port: number, world: string) {
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    try { const res = await fetch(`http://127.0.0.1:${port}/geom?world=${world}`); if (res.status > 0) return true; } catch { /* booting */ }
  }
  return false;
}
if (!(await waitReady(PORT, WORLD))) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }
const rssReady = rss();
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (log: ${logPath})`);

// ---- client chassis (attachstorm-proven) --------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
  closed: boolean; id: string; world: string;
  probeHits: Map<string, number>;   // key -> last arrival time (performance.now)
  logEntries: { verb: string; id?: string; type?: string }[];  // observed echoes
  echoSeqs: Set<number>;            // broadcast entry seqs seen (append census)
  errs: string[];
};
function connect(id: string, spectate: boolean, world: string = WORLD, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(world === WORLD ? URL : `ws://127.0.0.1:${PORT}/ws`);
    const s: Spec = { ws, id, world, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, probeHits: new Map(), logEntries: [], echoSeqs: new Set(), errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapAt = performance.now(); s.joinMs = s.snapAt - s.openAt;
        for (const e of m.entries ?? []) if (e.verb === "say") s.says.add(e.args?.text);
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        if (s.world !== WORLD) return;      // anchors measure the main world
        s.frames++; s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "log") {
        const v = m.entry?.verb, a = m.entry?.args;
        if (v === "say" && typeof a?.text === "string") s.says.add(a.text);
        if (typeof a?.id === "string") {
          s.logEntries.push({ verb: String(v), id: a.id, ...(v === "comp" && typeof a.type === "string" ? { type: a.type } : {}) });
          let key: string | undefined;
          if (v === "spawn") key = `spawn:${a.id}`;
          else if (v === "comp") key = `comp:${a.id}:${a.type}`;
          if (key) s.probeHits.set(key, performance.now());
        } else if (v === "say" && typeof a?.text === "string") {
          s.probeHits.set(a.text, performance.now());
        }
        // every append broadcasts its entry (with seq) to everyone — an
        // ever-present anchor's echo set IS the acknowledged-append census
        if (typeof m.entry?.seq === "number") s.echoSeqs.add(m.entry.seq);
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = () => { s.closed = true; };
    ws.onerror = () => { /* close follows */ };
  });
}
const send = (s: Spec, verb: string, args: Record<string, unknown>) => {
  if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb, args }));
};

// ---- run ----------------------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, false, WORLD, i)),
  ...Array.from({ length: N_VICTIM }, (_, i) => connect(`victim-${i}`, false, WORLD, 40 + i)),
  ...Array.from({ length: N_HOSTILE }, (_, i) => connect(`hostile-${i}`, false, WORLD, 60 + i)),
  ...Array.from({ length: N_ANCHOR }, (_, i) => connect(`spec-${i}`, true)),
]);
const ok = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const failed = all.length - ok.length;
const perfs = ok.filter((s) => s.id.startsWith("perf-"));
const victims = ok.filter((s) => s.id.startsWith("victim-"));
const hostiles = ok.filter((s) => s.id.startsWith("hostile-"));
const specs = ok.filter((s) => s.id.startsWith("spec-"));
const everyone: Spec[] = [...perfs, ...victims, ...hostiles, ...specs];
const joinTimes = ok.map((s) => s.joinMs);
console.log(`t+0: joined ${ok.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// embodied presence: 32 broadcasters @ 15Hz
let running = true;
const posesSent = { n: 0 };
const tickers = [...perfs, ...victims, ...hostiles].map((s, i) => setInterval(() => {
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

// ---- phase bookkeeping ----------------------------------------------------------
let planEchoes = 0;
let batch2LockBounces = 0;
let unlocks = 0, respawns = 0;
let yardEscalations = 0;
const sayLat: number[] = [];
let lateOk = 0; const lateTimes: number[] = [];
let unlockSentAt = 0;

// t+2.0: VICTIM PLAN — victim-0 spawns its six legit props
at(PLAN_AT, () => {
  const v0 = victims[0];
  for (let i = 0; i < 6; i++) send(v0, "spawn", { id: `vbench-${i}`, lib: "deco/bench.glb", pos: [i * 2 - 5, 0, 6], yaw: 0 });
  at(PLAN_AT + 1_500, () => {
    planEchoes = Array.from({ length: 6 }, (_, i) => victims[0].probeHits.has(`spawn:vbench-${i}`) ? 1 : 0).reduce((a, b) => a + b, 0);
    console.log(`t+${PLAN_AT / 1000}s: victim plan ${planEchoes}/6 echoed`);
  });
});

// t+4.0: HOSTILE WAVE — squatters, poison menu, giant ids (fresh windows)
at(WAVE_AT, () => {
  const [sq0, sq1, sq2, sq3, pz0, pz1, pz2, gt0] = hostiles;
  // 4 squat legs: reserve + lock the victim's next batch (by-design denial)
  const squatPlan: [Spec, string[]][] = [
    [sq0, [SQUAT_IDS[0], SQUAT_IDS[1]]],
    [sq1, [SQUAT_IDS[2], SQUAT_IDS[3]]],
    [sq2, [SQUAT_IDS[4]]],
    [sq3, [SQUAT_IDS[5]]],
  ];
  for (const [leg, ids] of squatPlan) for (const id of ids) {
    send(leg, "spawn", { id, lib: "deco/crate.glb", pos: [20, 0, 20], yaw: 0 });
    send(leg, "comp", { id, type: "lock", data: true });
  }
  // 3 poison legs: the reserved-id menu, once each, interleaved
  const menu: { verb: string; args: Record<string, unknown> }[] = [
    { verb: "spawn", args: { id: "__proto__", lib: "deco/bench.glb", pos: [1, 0, 1] } },
    { verb: "comp", args: { id: "__proto__", type: "pwnbag", data: { pwn: true } } },
    { verb: "place", args: { id: "__proto__", pos: [9, 9, 9], yaw: 1 } },
    { verb: "light", args: { id: "__proto__", pos: [0, 2, 0], color: "#ffb46b", intensity: 0.9, range: 5 } },
    { verb: "motion", args: { id: "__proto__", type: "spin", axis: [0, 1, 0], degPerSec: 10 } },
    { verb: "remove", args: { id: "__proto__" } },
    { verb: "spawn", args: { id: "constructor", lib: "deco/bench.glb", pos: [1, 0, 2] } },
    { verb: "spawn", args: { id: "prototype", lib: "deco/bench.glb", pos: [1, 0, 3] } },
  ];
  menu.forEach((item, mi) => send([pz0, pz1, pz2][mi % 3], item.verb, item.args));
  // 1 giant leg: two 60k-char ids — legal frames, unbounded growth today
  for (const gid of GIANT_IDS) send(gt0, "spawn", { id: gid, lib: "deco/bench.glb", pos: [30, 0, 30], yaw: 0 });
});

// t+6.0: FAIRNESS — solo say + 12 late spectator joins MID-POISON
at(FAIR_AT, () => {
  const sentAt = performance.now();
  const sayText = `fair-say-${Math.floor(t0)}`;
  send(perfs[0], "say", { text: sayText });
  const latePromise = Promise.allSettled(Array.from({ length: TH.lateJoins }, (_, i) => connect(`late-${i}`, true)));
  at(FAIR_AT + 2_500, () => {
    const hit = perfs[0].probeHits.get(sayText);
    if (hit !== undefined) sayLat.push(hit - sentAt);
    void latePromise.then((rs) => {
      const good = rs.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
      lateOk = good.length;
      for (const s of good) { lateTimes.push(s.joinMs); everyone.push(s); }
      console.log(`t+${FAIR_AT / 1000}s: fairness — sayAuthor=${sayLat.length ? Math.round(sayLat[0]) : "MISSED"}ms lateJoins ${lateOk}/12 p95 ${lateTimes.length ? Math.round(pct(lateTimes, 95)) : "-"}ms`);
    });
  });
});

// t+8.0: VICTIM BATCH-2 — the 6 squatted ids must bounce on the locks
at(BATCH2_AT, () => {
  const v1 = victims[1];
  for (const id of [...SQUAT_IDS, ...FREE_IDS]) send(v1, "spawn", { id, lib: "deco/bench.glb", pos: [0, 0, 8], yaw: 0 });
  at(BATCH2_AT + 2_000, () => {
    batch2LockBounces = v1.errs.filter((e) => e.includes("is locked — unlock it first")).length;
    console.log(`t+${BATCH2_AT / 1000}s: victim batch-2 — ${batch2LockBounces}/6 bounced on squatters' locks (by-design denial; recovery below)`);
  });
});

// ---- canary: fresh spectator reads the folded world -----------------------------
type Canary = { entities: Record<string, any>; bytes: number } | null;
async function canaryJoin(name: string, port = PORT): Promise<Canary> {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(null); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: name, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { clearTimeout(to); try { ws.close(); } catch {} resolve({ entities: m.state?.entities ?? {}, bytes: JSON.stringify(m.state?.entities ?? {}).length }); }
    };
    ws.onerror = () => { clearTimeout(to); resolve(null); };
  });
}
function canaryAudit(c: Canary) {
  const bagHits: string[] = [];
  let giantIds = 0;
  for (const [id, ent] of Object.entries(c?.entities ?? {})) {
    if (id.length > 64) giantIds++;
    const types = Object.keys(ent?.comp ?? {});
    for (const t of ATTACKER_TYPES) if (types.includes(t)) bagHits.push(`${id}:${t}`);
  }
  // inherited-bag observable: a plan entity (no comps authored) carrying ANY bag
  for (let i = 0; i < 6; i++) {
    const comp = c?.entities?.[`vbench-${i}`]?.comp;
    if (comp && Object.keys(comp).length) bagHits.push(`vbench-${i}:<any-comp>`);
  }
  return { bagHits: [...new Set(bagHits)], giantIds };
}
let canary1Bytes = 0, canary2Bytes = 0;
let canary1Audit = { bagHits: [] as string[], giantIds: 0 };
let canary2Audit = canary1Audit;
at(CANARY1_AT, async () => {
  const c = await canaryJoin(`canary-1-${Math.floor(t0)}`);
  if (!c) { console.log(`t+${CANARY1_AT / 1000}s: CANARY-1 FAILED TO JOIN`); canary1Bytes = -1; return; }
  canary1Bytes = c.bytes; canary1Audit = canaryAudit(c);
  const census = Object.keys(c.entities).filter((id) => /^(vbench-|vstage-|giant-)/.test(id)).length;
  console.log(`t+${CANARY1_AT / 1000}s: canary-1 — ${c.bytes}B, census ${census}, bag ${canary1Audit.bagHits.length} giant ${canary1Audit.giantIds}`);
});

// t+11.0/12.5: RECOVERY — unlock (rank 1 by design), then reclaim by re-spawn
at(UNLOCK_AT, () => {
  unlockSentAt = performance.now();
  for (const id of SQUAT_IDS) send(victims[0], "comp", { id, type: "lock", data: null });
});
at(RESPAWN_AT, () => {
  for (const id of [...SQUAT_IDS, ...FREE_IDS]) send(victims[1], "spawn", { id, lib: "deco/bench.glb", pos: [0, 0, 9], yaw: 0 });
  at(RESPAWN_AT + 2_000, () => {
    unlocks = SQUAT_IDS.filter((id) => {
      const hit = victims[0].probeHits.get(`comp:${id}:lock`);
      return hit !== undefined && hit > unlockSentAt;     // echo AFTER the unlock send
    }).length;
    respawns = [...SQUAT_IDS, ...FREE_IDS].filter((id) => victims[1].probeHits.has(`spawn:${id}`)).length;
    console.log(`t+${RESPAWN_AT / 1000}s: recovery — unlocks ${unlocks}/6 echoed, respawns ${respawns}/8 echoed`);
  });
});

// t+14.0: BRICKYARD — second world: replay-brick chain + roles escalation
let yardOwner: Spec | null = null, yardSecond: Spec | null = null;
at(YARD_AT, async () => {
  try {
    yardOwner = await connect(`yard-owner-${Math.floor(t0)}`, false, YARD, 80);
    yardSecond = await connect(`yard-second-${Math.floor(t0)}`, false, YARD, 81);
    everyone.push(yardOwner, yardSecond);
    const own = yardOwner as Spec, sec = yardSecond as Spec;
    // baseline: yard is brand-new → first embodied joiner auto-owner
    send(own, "spawn", { id: "yard-rider", lib: "deco/bench.glb", pos: [0, 0, 0] });
    send(own, "mount", { id: "yard-rider", to: "__proto__" });       // poison 9
    send(own, "remove", { id: "__proto__" });                        // poison 10
    send(own, "grant", { id: "__proto__", role: "owner" });          // poison 11
    await sleep(1_500);
    // escalation probe: the UNLISTED second leg tries an owner-rank grant.
    // Fixed: refused with the owner-rank message. Unfixed: the polluted roles
    // prototype makes every unlisted id inherit owner → NO refusal.
    send(sec, "grant", { id: `yard-probe-${Math.floor(t0)}`, role: "visitor" });
    await sleep(1_000);
    const refused = sec.errs.some((e) => e.includes("grant") && /owner/.test(e));
    yardEscalations = refused ? 0 : 1;
    const riderEcho = own.probeHits.has("spawn:yard-rider") ? 1 : 0;
    console.log(`t+${YARD_AT / 1000}s: brickyard — rider echo ${riderEcho}/1, chain verbs dispatched, escalation probe ${yardEscalations === 0 ? "REFUSED (correct)" : "ESCALATED (polluted roles)"} first-err: ${sec.errs[0] ?? "none"}`);
  } catch (e) {
    console.log(`t+${YARD_AT / 1000}s: brickyard legs failed to join: ${(e as Error).message}`);
  }
});

// t+15.5: CANARY-2 — post-recovery snapshot size + purity
at(CANARY2_AT, async () => {
  const c = await canaryJoin(`canary-2-${Math.floor(t0)}`);
  if (!c) { console.log(`t+${CANARY2_AT / 1000}s: CANARY-2 FAILED TO JOIN`); canary2Bytes = -1; return; }
  canary2Bytes = c.bytes; canary2Audit = canaryAudit(c);
  console.log(`t+${CANARY2_AT / 1000}s: canary-2 — ${c.bytes}B (delta ${canary2Bytes - canary1Bytes}B), bag ${canary2Audit.bagHits.length} giant ${canary2Audit.giantIds}`);
});

// ---- teardown + restart probe ---------------------------------------------------
await sleep(DURATION);
running = false;
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(500);
// anchor health is measured HERE (frames stop at the kill; measuring after the
// restart probe would divide the same frame count by a longer window)
const measureAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (measureAt - s.snapAt - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);

// poison verdict accounting: log.jsonl is the AUTHORITATIVE accepted record;
// refusals are the exact reserved-message errors on hostile sockets; silent =
// sent - accepted - refused. (The fixed tree's refusal text is the contract
// this gate pins: `reserved id: "<id>" — ids are names, not runtime internals`.)
let poisonAccepted = 0, poisonRefused = 0, poisonSilent = 0;
{
  // count OCCURRENCES (three __proto__ refusals on one socket are three
  // verdicts; a set would collapse them and invent a silent drop). Scan the
  // hostile legs AND the yard legs — the yard chain (mount/remove/grant
  // __proto__) is 3 of the 11 verdicts and lands on yardOwner's socket.
  const verdictSockets: Spec[] = [...hostiles, ...(yardOwner ? [yardOwner] : []), ...(yardSecond ? [yardSecond] : [])];
  let refusalCount = 0;
  for (const s of verdictSockets) for (const e of s.errs) {
    if (/^reserved id: ".+?" — ids are names/.test(e)) refusalCount++;
  }
  poisonRefused = refusalCount;
  // accepted: entries with reserved ids in either world log
  let acceptedEntries = 0;
  for (const w of [WORLD, YARD]) {
    const p = `${WORLDS}/${w}/log.jsonl`;
    if (!existsSync(p)) continue;
    for (const l of readFileSync(p, "utf8").split("\n").filter(Boolean)) {
      try { const e = JSON.parse(l); if (RESERVED.includes(String(e.args?.id ?? ""))) acceptedEntries++; } catch { /* torn */ }
    }
  }
  // observed-echo cross-check (a broadcast echo seen on any socket)
  let echoSeen = 0;
  for (const rid of RESERVED) {
    for (const s of everyone) {
      if (s.logEntries.some((e) => e.id === rid)) { echoSeen++; break; }
    }
  }
  // accepted: entries with reserved ids in either world log (authoritative;
  // the broadcast-echo cross-check below would only ever agree with it)
  poisonAccepted = acceptedEntries;
  poisonSilent = Math.max(0, POISON_SENT - poisonAccepted - Math.min(poisonRefused, POISON_SENT - poisonAccepted));
  console.log(`poison verdicts: accepted ${poisonAccepted} (log-authoritative), refused ${poisonRefused}, silent ${poisonSilent} (of ${POISON_SENT})`);
}

// kill server #1 (SIGKILL: a true crash — graceful shutdown would fold the
// state and cover the poison entry in the snapshot, masking the brick), then
// restart on same WORLDS_DIR: the replay must survive the poisoned tail.
server.kill("SIGKILL");
await sleep(500);
const logPath2 = `/tmp/pressure21-restart-${Date.now()}.log`;
const server2 = Bun.spawn({
  cmd: ["bun", "run", "server/server.ts"],
  cwd: SERVER_DIR,
  env: { ...process.env, PORT: String(PORT2), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR },
  stdout: Bun.file(logPath2), stderr: Bun.file(logPath2),
});
let restartJoins = 0, restartAudit = { bagHits: [] as string[], giantIds: 0 };
{
  const ready2 = await waitReady(PORT2, WORLD);
  if (ready2) {
    const c3 = await canaryJoin(`canary-3-${Math.floor(t0)}`, PORT2);
    if (c3) { restartJoins++; restartAudit = canaryAudit(c3); }
    // brickyard must ALSO boot (its log carries the brick chain on unfixed)
    const yardOk = await new Promise<boolean>((resolve) => {
      const ws = new WebSocket(`ws://127.0.0.1:${PORT2}/ws`);
      const to = setTimeout(() => { try { ws.close(); } catch {} resolve(false); }, 8_000);
      ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: YARD, id: `yard-probe-${Math.floor(t0)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
      ws.onmessage = (ev) => { const m = JSON.parse(String(ev.data)); if (m.type === "snapshot") { clearTimeout(to); try { ws.close(); } catch {} resolve(true); } };
      ws.onerror = () => { clearTimeout(to); resolve(false); };
    });
    if (yardOk) restartJoins++;
  }
  console.log(`restart probe: joins ${restartJoins}/2 (main + brickyard), canary-3 bag ${restartAudit.bagHits.length} giant ${restartAudit.giantIds} (restart log: ${logPath2})`);
}

// ---- measurements -------------------------------------------------------------
const endAt = measureAt;
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const log1 = await logFile.text();
const log2 = await Bun.file(logPath2).text();
const logLines = (log1 + "\n" + log2).split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

// world log ground truth (both worlds): expected appends derive from the
// ever-present anchors' echo seqs (tree-independent — the census IS what the
// server acknowledged), not from a phase model that differs by tree.
let logSpawnLines = 0, logTotalLines = 0, expectedAppends = 0, expectedSpawns = 0;
{
  for (const w of [WORLD, YARD]) {
    const p = `${WORLDS}/${w}/log.jsonl`;
    if (!existsSync(p)) continue;
    const wl = readFileSync(p, "utf8").split("\n").filter(Boolean);
    logTotalLines += wl.length;
    logSpawnLines += wl.filter((l) => { try { return JSON.parse(l).verb === "spawn"; } catch { return false; } }).length;
  }
  // anchors joined the main world before any verb; late joiners also saw the
  // full broadcast tail from their join — union of echo seqs across all
  // main-world sockets, plus the yard legs' own echoes for the yard world.
  const mainSeqs = new Set<number>();
  for (const s of [...specs, ...perfs, ...victims, ...hostiles]) for (const q of s.echoSeqs) mainSeqs.add(q);
  const yardSeqs = new Set<number>();
  const yo = yardOwner as Spec | null;   // assigned inside an at() callback — cast breaks CFA's null-collapse
  if (yo) for (const q of yo.echoSeqs) yardSeqs.add(q);
  // every world's seq counter starts at 0; the two worlds' seq sets overlap
  // numerically — count DISTINCT appends per world, not the union.
  // (Each world's log is ground truth; expected appends = seq count of that
  // world's max echo + 1, minus the poison that never appended.)
  // Simpler and exact: expected totals = counted log lines minus drift, so
  // instead pin expected = maxEchoSeq+1 per world from a socket present in
  // that world from its start.
  const mainMax = Math.max(0, ...mainSeqs);
  const yardMax = yardOwner ? Math.max(0, ...yardSeqs) : -1;
  // a world's highest broadcast seq == its last acknowledged append; entries
  // after it are impossible (nothing else appends post-teardown)
  expectedAppends = (mainMax + 1) + (yardMax >= 0 ? yardMax + 1 : 0);
  // spawn lines: count ENTRIES (a re-spawn of a same id appends another line);
  // an ever-present anchor saw every main-world broadcast; yardOwner saw its own
  const anchor = specs[0];
  const mainSpawnEntries = anchor ? anchor.logEntries.filter((e) => e.verb === "spawn").length : 0;
  const yardSpawnEntries = yo ? yo.logEntries.filter((e) => e.verb === "spawn").length : 0;
  expectedSpawns = mainSpawnEntries + yardSpawnEntries;
}
const m: Measurements = {
  failed, joinP95: pct(joinTimes, 95), lateOk, lateP95: lateTimes.length ? pct(lateTimes, 95) : 0,
  planEchoes,
  poisonAccepted, poisonSilent,
  canaryBagHits: Math.max(canary1Audit.bagHits.length, canary2Audit.bagHits.length),
  canaryGiantIds: Math.max(canary1Audit.giantIds, canary2Audit.giantIds),
  snapshotBloat: canary2Bytes - canary1Bytes,
  batch2LockBounces,
  unlocks, respawns,
  yardEscalations,
  restartJoins, restartBagHits: restartAudit.bagHits.length, restartGiantIds: restartAudit.giantIds,
  sayAuthorP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  logSpawnDrift: Math.abs(logSpawnLines - expectedSpawns), logTotalDrift: Math.abs(logTotalLines - expectedAppends),
  probeP95: pct(probeSamples, 95), probeErrors: probeErrors.n, logSuspicious: suspicious.length, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n}
  initial joins         ${ok.length}/${all.length} — p95 ${Math.round(m.joinP95)}ms
  late mid-poison       ${lateOk}/12 p95 ${lateTimes.length ? Math.round(m.lateP95) : "-"}ms
  victim plan           ${planEchoes}/6
  reserved-id verdicts  accepted ${poisonAccepted} / refused ${poisonRefused} / silent ${poisonSilent} (of ${POISON_SENT})
  canary purity         bag ${m.canaryBagHits} giantIds ${m.canaryGiantIds}
  snapshot bytes        c1 ${canary1Bytes} → c2 ${canary2Bytes} (delta ${m.snapshotBloat}B)
  squat denial          batch-2 lock bounces ${batch2LockBounces}/6 (by design)
  recovery              unlocks ${unlocks}/6 respawns ${respawns}/8
  yard escalation       ${yardEscalations} (0 = unlisted grant refused)
  restart probe         joins ${restartJoins}/2, canary-3 bag ${m.restartBagHits} giant ${m.restartGiantIds}
  fairness: say author  ${sayLat.length ? Math.round(m.sayAuthorP95) : "MISSED"}ms
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchors
  world log             spawn=${logSpawnLines} (exp ${expectedSpawns}, drift ${m.logSpawnDrift}) total=${logTotalLines} (exp ${expectedAppends}, drift ${m.logTotalDrift})
  http probe p95        ${Math.round(m.probeP95)}ms (n=${probeSamples.length}, ${probeErrors.n} errors)
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of ok) { try { s.ws.close(); } catch {} }
try { if (yardOwner) yardOwner.ws.close(); } catch {} try { if (yardSecond) yardSecond.ws.close(); } catch {}
try { server2.kill("SIGTERM"); await server2.exited; } catch {}
console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — the id namespace cannot be weaponized: reserved ids refused, growth bounded, squat recoverable, no replay-brick`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
