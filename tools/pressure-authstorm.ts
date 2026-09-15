// Pressure scenario 12: AUTH FAILURE STORM — BAD TOKENS CANNOT EXHAUST JOIN
// CAPACITY. Design target: 24 embodied performers @15Hz to a full house.
// Prior scenarios proved the presence plane (1), slow-spectator isolation
// (2), join storms (3), authored responsiveness (4), verb rate-limiting (5),
// reconnect hygiene (6), world switching (7), snapshot consistency (8),
// memory return (9), classification (10), and malformed-frame tolerance
// (11). This one asks what a storm of REFUSED joins costs: every bad
// credential must get an explicit refusal (never a hang, never a silent
// drop), must leave zero presence/log residue, and must not slow legitimate
// joins, presence frames, or authored verbs while the storm runs.
//
// The auth surface under test (server.ts join path), in refusal order:
//   A. door token  — wrong / missing / empty JOIN_TOKEN → error + close 4003
//   B. reserved agent names (mcpl/tokens.json roster, AGENT_TOKENS_PATH):
//        spoofed name, no bearer            → error + close 4004
//        spoofed name, unrecognized bearer  → error + close 4004
//        spoofed name, aid1 bad-signature   → error + close 4004  [the
//        expensive lane: verifyToken() runs createPublicKey + ed25519
//        verify PER ATTEMPT, no cache — the only per-attempt crypto here]
//        spoofed name, 100KB aid1 string    → error + close 4004
//        spoofed name, malformed b64 aid1   → error + close 4004
//   C. the healthy aid1 lane must still work mid-storm: one join carrying a
//      VALIDLY-SIGNED token (harness generates its own issuer keypair) is
//      tokenVerified and admitted while the storm hammers the same verify
//      path with garbage.
//
// Population (pinned before measuring — peak ~156 concurrent sockets):
//   24 perf (embodied @15Hz) + 96 spectator anchors = 120 persistent.
//   8 attacker loops, each cycling the 8-shape menu with a FRESH socket per
//   attempt (connect → hostile join → refusal → close), ≥25ms pacing between
//   attempt starts, storm window t+3s..t+11s (~2000+ attempts).
//   Fairness legs mid-storm: 24 legit spectator joins at t+4s, 3 legit
//   embodied joins + one say each at t+5s, 1 valid-aid1 embodied join at
//   t+6s (all four leave at t+12s). Teardown t+18s, final empty probe t+22s.
//
// Acceptance gates (pinned before measuring):
//   - anchor joins: 120/120, p95 < 3s                 (healthy envelope)
//   - storm attempts >= 1000 with 100% explicit error receipt
//   - 0 hangs (5s no-close), 0 connect failures, close code == 4003/4004
//     exactly as the shape dictates (abnormal 1006 counts as a miss)
//   - refusal latency p95 < 500ms overall (per-shape p95 reported; the
//     ed25519-bad-sig shape is expected to be the slowest but must stay
//     well under the gate)
//   - intruder arrives: 0 — no attacker/reserved id EVER broadcast as
//     present; rosters EXACT at every probe (28 embodied mid-storm =
//     24 perf + 3 legit + 1 aidlegit; 24 post-legit-exit; 0 at final)
//   - arrive/leave drift 0 over the legit population (28/28)
//   - join capacity during the storm: legit spectator 24/24 p95 < 300ms,
//     legit embodied 3/3 p95 < 300ms, valid-aid1 1/1 < 3s
//   - fairness: 3/3 mid-storm says appended, author p95 < 500ms
//   - presence health: anchor fps p50 >= 12, frame lat p95 < 250ms, 0 gaps
//   - event loop: storm-window HTTP probe p95 < 500ms; post-storm < 100ms
//   - RSS peak growth < 60MB; 0 suspicious server log lines; log.jsonl
//     drift 0 vs the expected 3 say appends (a refused join must never
//     write a world-log line)
//
//   SERVER_DIR=/tmp/pressure12-wt PORT=8995 bun tools/pressure-authstorm.ts
//   SELFTEST=1 bun tools/pressure-authstorm.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), generates the auth fixtures (issuer keypair, reserved-name
// roster, one validly-signed token) into /tmp, runs the scenario, tears
// everything down, and exits 0 only if every pinned gate holds.

import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { generateKeyPairSync, sign as cryptoSign, randomBytes } from "node:crypto";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure12-wt";
const PORT = Number(process.env.PORT ?? 8995);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure12-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const FIXDIR = "/tmp/pressure12-fixtures";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_PERF = 24, N_SPEC = 96;                     // 120 persistent anchors
const N_ATK = 8;                                    // attacker loops
const POSE_HZ = 15;
const STORM_START = 3_000, STORM_END = 11_000;      // attacker window
const FAIR_SPEC_AT = 4_000, FAIR_EMB_AT = 5_000, AID_LEGIT_AT = 6_000;
const LEGIT_EXIT_AT = 12_000;
const TEARDOWN_AT = 18_000;
const FINAL_PROBE_AT = 22_000;
const DURATION = 24_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..11
const MIN_ATTEMPTS = 1_000;    // lower-bound sanity on storm volume
const HN_ISS = "id.animalabs.ai", HN_AUD = "eidoverse";
const SELFTEST = process.env.SELFTEST === "1";

// legit presence arithmetic: the counted population is the fairness legs
// (3 legit embodied + 1 valid-aid1), which arrive strictly AFTER the seer's
// snapshot — the 24 perf anchors co-join with the seer so their arrives
// predate it (pressure-6 pattern: count the churn, not the anchors; the
// anchors' exactness is proven by the roster probes instead).
const LEGIT_EMB = 3 + 1;                             // 3 fair + 1 aidlegit
const EXPECT_SAYS = 3;

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorFailed: 0,
  anchorJoinP95Ms: 3_000,
  minAttempts: MIN_ATTEMPTS,
  refusalsMissed: 0,        // attempts without an explicit error message
  closeCodeMissed: 0,       // closed with a code other than the shape's
  hangs: 0,
  connFail: 0,
  refusalP95Ms: 500,
  fairSpecJoins: 24, fairSpecP95Ms: 300,
  fairEmbJoins: 3, fairEmbP95Ms: 300,
  aidLegit: 1,
  saysAppended: 3, sayP95Ms: 500,
  intruderArrives: 0,
  rosterGhosts: 0,          // wrong/extra/missing ids at any roster probe
  finalPresent: 0,
  arriveDrift: 0,
  leaveDrift: 0,
  fpsP50: POSE_HZ * 0.8,
  latP95Ms: 250,
  seqGaps: 0,
  probeStormP95Ms: 500,
  probeSettledP95Ms: 100,
  logSuspicious: 0,
  logDrift: 0,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  attempts: number; explicitRefusals: number; closeCodeOk: number;
  hangs: number; connFail: number; refusalP95: number;
  fairSpecJoins: number; fairSpecP95: number;
  fairEmbJoins: number; fairEmbP95: number;
  aidLegitJoins: number;
  saysAppended: number; sayP95: number;
  intruderArrives: number;
  rosterGhosts: number; finalPresent: number;
  arriveDrift: number; leaveDrift: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeSettledP95: number;
  logSuspicious: number; logDrift: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.attempts < TH.minAttempts) fail.push(`storm volume ${m.attempts} < ${TH.minAttempts} — attackers did not run`);
  if (m.explicitRefusals < m.attempts - TH.refusalsMissed) fail.push(`${m.attempts - m.explicitRefusals} attempts got NO explicit error (silent drop or wedge)`);
  if (m.closeCodeOk < m.attempts - TH.closeCodeMissed) fail.push(`${m.attempts - m.closeCodeOk} attempts closed with the WRONG code (expected 4003/4004 per shape)`);
  if (m.hangs > TH.hangs) fail.push(`${m.hangs} attempts HUNG (no close within 5s) — refusal path stalled`);
  if (m.connFail > TH.connFail) fail.push(`${m.connFail} connect failures — server stopped accepting sockets under the storm`);
  if (m.refusalP95 > TH.refusalP95Ms) fail.push(`refusal latency p95 ${Math.round(m.refusalP95)}ms > ${TH.refusalP95Ms}ms`);
  if (m.fairSpecJoins < TH.fairSpecJoins) fail.push(`mid-storm legit spectator joins ${m.fairSpecJoins}/24 — join capacity exhausted`);
  if (m.fairSpecP95 > TH.fairSpecP95Ms) fail.push(`mid-storm legit spectator join p95 ${Math.round(m.fairSpecP95)}ms > ${TH.fairSpecP95Ms}ms`);
  if (m.fairEmbJoins < TH.fairEmbJoins) fail.push(`mid-storm legit embodied joins ${m.fairEmbJoins}/3`);
  if (m.fairEmbP95 > TH.fairEmbP95Ms) fail.push(`mid-storm legit embodied join p95 ${Math.round(m.fairEmbP95)}ms > ${TH.fairEmbP95Ms}ms`);
  if (m.aidLegitJoins < TH.aidLegit) fail.push(`valid-aid1 join ${m.aidLegitJoins}/1 — the healthy crypto lane is blocked mid-storm`);
  if (m.saysAppended < TH.saysAppended) fail.push(`mid-storm says ${m.saysAppended}/3 — auth storm stalled authored verbs`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`mid-storm say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.intruderArrives > TH.intruderArrives) fail.push(`${m.intruderArrives} INTRUDER ARRIVES — a refused id entered presence`);
  if (m.rosterGhosts > TH.rosterGhosts) fail.push(`${m.rosterGhosts} roster ghosts — present[] wrong at a probe`);
  if (m.finalPresent > TH.finalPresent) fail.push(`${m.finalPresent} embodied present in the FINAL probe — world not empty`);
  if (m.arriveDrift > TH.arriveDrift) fail.push(`legit arrive drift ${m.arriveDrift} (expected ${LEGIT_EMB})`);
  if (m.leaveDrift > TH.leaveDrift) fail.push(`legit leave drift ${m.leaveDrift} (expected ${LEGIT_EMB})`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`anchor fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps on anchor spectators`);
  if (m.probeStormP95 > TH.probeStormP95Ms) fail.push(`storm-window HTTP probe p95 ${Math.round(m.probeStormP95)}ms > ${TH.probeStormP95Ms}ms`);
  if (m.probeSettledP95 > TH.probeSettledP95Ms) fail.push(`post-storm HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > ${TH.probeSettledP95Ms}ms — something still churning`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.logDrift > TH.logDrift) fail.push(`log.jsonl line drift ${m.logDrift} vs expected ${EXPECT_SAYS} say appends — a refusal wrote to the world log`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 40,
    attempts: 2_140, explicitRefusals: 2_140, closeCodeOk: 2_140,
    hangs: 0, connFail: 0, refusalP95: 18,
    fairSpecJoins: 24, fairSpecP95: 60,
    fairEmbJoins: 3, fairEmbP95: 55,
    aidLegitJoins: 1,
    saysAppended: 3, sayP95: 9,
    intruderArrives: 0, rosterGhosts: 0, finalPresent: 0,
    arriveDrift: 0, leaveDrift: 0,
    fpsP50: 14.8, latP95: 11, gaps: 0,
    probeStormP95: 14, probeSettledP95: 8,
    logSuspicious: 0, logDrift: 0, rssPeakGrowth: 12,
  };
  const breached: Measurements = {
    ...healthy,
    attempts: 2_140, explicitRefusals: 2_112, closeCodeOk: 2_130,
    hangs: 4, connFail: 2, refusalP95: 900,
    fairSpecJoins: 19, fairSpecP95: 1_400,
    fairEmbJoins: 1, fairEmbP95: 1_100,
    aidLegitJoins: 0,
    saysAppended: 1, sayP95: 800,
    intruderArrives: 3, rosterGhosts: 5, finalPresent: 2,
    arriveDrift: 2, leaveDrift: 4,
    fpsP50: 9, latP95: 400, gaps: 5,
    probeStormP95: 800, probeSettledP95: 300, logDrift: 3,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  // volume breach is exclusive of the silence breach (silence needs attempts >
  // refusals; volume needs attempts < min) — prove it on its own sample
  const vol = evaluate({ ...healthy, attempts: 800, explicitRefusals: 800, closeCodeOk: 800 });
  const want = ["attackers did not run", "NO explicit error", "WRONG code", "HUNG", "stopped accepting", "refusal latency p95", "join capacity exhausted", "spectator join p95", "embodied joins", "embodied join p95", "crypto lane is blocked", "stalled authored verbs", "say author p95", "INTRUDER ARRIVES", "roster ghosts", "world not empty", "arrive drift", "leave drift", "fps p50", "frame latency p95", "seq gaps", "storm-window HTTP", "still churning", "line drift"];
  const bf = [...b, ...vol];
  const ok = a.length === 0 && want.every((w) => bf.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length}+${vol.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] vol=[${vol}] missing=[${want.filter((w) => !bf.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} embodied anchors @${POSE_HZ}Hz + ${N_SPEC} spectator anchors = 120 persistent; ${N_ATK} attacker loops x 8-shape hostile menu (3x door-token 4003 + 5x reserved-name 4004 incl. full ed25519 bad-sig, 100KB token, malformed b64), fresh socket per attempt, >=25ms pacing, storm t+${STORM_START / 1000}s..t+${STORM_END / 1000}s (>=${MIN_ATTEMPTS} attempts); fairness mid-storm: 24 spec joins t+${FAIR_SPEC_AT / 1000}s + 3 embodied t+${FAIR_EMB_AT / 1000}s + 1 valid-aid1 t+${AID_LEGIT_AT / 1000}s (exit t+${LEGIT_EXIT_AT / 1000}s); teardown t+${TEARDOWN_AT / 1000}s; final empty probe t+${FINAL_PROBE_AT / 1000}s. ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: anchors=120/120@p95<${TH.anchorJoinP95Ms}ms attempts>=${TH.minAttempts}@100%explicit/0hang/0connFail/exit-code-exact refusalP95<${TH.refusalP95Ms}ms fairSpec=24/24@p95<${TH.fairSpecP95Ms}ms fairEmb=3/3@p95<${TH.fairEmbP95Ms}ms aidLegit=1/1 says=${TH.saysAppended}@p95<${TH.sayP95Ms}ms intruderArrives=${TH.intruderArrives} rosterGhosts=${TH.rosterGhosts} finalPresent=${TH.finalPresent} arrive/leaveDrift=0/${LEGIT_EMB} fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=${TH.seqGaps} probeStorm<${TH.probeStormP95Ms}ms probeSettled<${TH.probeSettledP95Ms}ms logSuspicious=${TH.logSuspicious} logDrift=${TH.logDrift} rssPeak<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget: ~156 concurrent client sockets must fit ------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (!Number.isFinite(fdLimit) && fdLimit !== Infinity) {
  console.log(`FAIL: file-descriptor limit unparseable ("${fdRaw}") — launch as: ulimit -n 1024 && bun tools/pressure-authstorm.ts`);
  process.exit(2);
}
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-authstorm.ts`);
  process.exit(2);
}

// ---- auth fixtures: issuer keypair, reserved roster, one valid token -----------
rmSync(FIXDIR, { recursive: true, force: true });
mkdirSync(FIXDIR, { recursive: true });
const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const spki = publicKey.export({ format: "der", type: "spki" }) as Buffer;
const pubRaw = spki.subarray(12);                     // strip the 12-byte SPKI header → raw 32B
const b64u = (b: Buffer) => b.toString("base64url");
const ISSUER_KEY = `ed25519:${b64u(pubRaw)}`;
const nowSec = Math.floor(Date.now() / 1000);
const payloadSeg = b64u(Buffer.from(JSON.stringify({
  v: 1, iss: HN_ISS, sub: "agent:aidlegit@pressure", kind: "agent",
  name: "aidlegit", aud: HN_AUD, scopes: ["worlds:join"],
  iat: nowSec, exp: nowSec + 600,
}), "utf8"));
const goodSig = cryptoSign(null, Buffer.from(`aid1.${payloadSeg}`, "utf8"), privateKey);
const GOOD_TOKEN = `aid1.${payloadSeg}.${b64u(goodSig)}`;                       // verifies against ISSUER_KEY
const BAD_SIG_TOKEN = `aid1.${payloadSeg}.${b64u(randomBytes(64))}`;            // well-formed, signature fails
const LONG_TOKEN = `aid1.${"A".repeat(100_000)}`;                                // 100KB string, fast-fail
const MALFORMED_TOKEN = "aid1.!!!not-b64!!!.x";                                  // b64url charset violation
writeFileSync(`${FIXDIR}/tokens.json`, JSON.stringify({
  "bearer-res-0-secret": { id: "arthur-res-0" },
  "bearer-res-1-secret": { id: "arthur-res-1" },
  "bearer-res-2-secret": { id: "arthur-res-2" },
}), { mode: 0o600 });

// hostile menu: every shape is REFUSED, with its dictated close code
const SHAPES: { tag: string; code: number; join: Record<string, unknown> }[] = [
  { tag: "door-wrong",   code: 4003, join: { id: "atk-door", token: "wrong-door-token" } },
  { tag: "door-missing", code: 4003, join: { id: "atk-door" } },
  { tag: "door-empty",   code: 4003, join: { id: "atk-door", token: "" } },
  { tag: "reserved-none",     code: 4004, join: { id: "arthur-res-0", token: TOKEN } },
  { tag: "reserved-badbear",  code: 4004, join: { id: "arthur-res-1", token: TOKEN, agentToken: "unrecognized-bearer-xyz" } },
  { tag: "reserved-aidsig",   code: 4004, join: { id: "arthur-res-2", token: TOKEN, agentToken: BAD_SIG_TOKEN } },
  { tag: "reserved-longtok",  code: 4004, join: { id: "arthur-res-0", token: TOKEN, agentToken: LONG_TOKEN } },
  { tag: "reserved-malb64",   code: 4004, join: { id: "arthur-res-1", token: TOKEN, agentToken: MALFORMED_TOKEN } },
];

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure12-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
const server = Bun.spawn({
  cmd: ["bun", "run", "server/server.ts"],
  cwd: SERVER_DIR,
  env: {
    ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE,
    EIDOVERSE_DIR: LIBDIR,
    HN_ISSUER_KEY: ISSUER_KEY, HN_ISS: HN_ISS, HN_AUD,
    AGENT_TOKENS_PATH: `${FIXDIR}/tokens.json`,
  },
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
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (issuer lane live, 3 reserved names) (log: ${logPath})`);

// ---- client chassis (loadtest/reconnect-proven) --------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number;
  closed: boolean; closeCode: number; id: string;
  arrives: string[]; leaves: string[];
  sayEcho: Map<string, number>;
  errs: string[];
};
function connect(id: string, spectate: boolean, n = 0, agentToken?: string): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, closed: false, closeCode: 0, arrives: [], leaves: [], sayEcho: new Map(), errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN, ...(agentToken ? { agentToken } : {}) }));
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
      } else if (m.type === "arrive") {
        s.arrives.push(String(m.id ?? ""));
      } else if (m.type === "leave") {
        s.leaves.push(String(m.id ?? ""));
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = (ev) => { s.closed = true; s.closeCode = Number(ev.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}

// attacker attempt: fresh socket → hostile join → expect explicit error + dictated close
type Attempt = { tag: string; gotError: boolean; closeCode: number; codeOk: boolean; ms: number; hung: boolean; connFail: boolean };
function attempt(shape: { tag: string; code: number; join: Record<string, unknown> }): Promise<Attempt> {
  return new Promise((resolve) => {
    const a: Attempt = { tag: shape.tag, gotError: false, closeCode: 0, codeOk: false, ms: 0, hung: false, connFail: false };
    const started = performance.now();
    let opened = false;
    let ws: WebSocket;
    try { ws = new WebSocket(URL); } catch { a.connFail = true; resolve(a); return; }
    const to = setTimeout(() => { a.hung = true; a.ms = performance.now() - started; try { ws.close(); } catch {} resolve(a); }, 5_000);
    ws.onopen = () => { opened = true; try { ws.send(JSON.stringify({ type: "join", world: WORLD, avatar: "x.vrm", ...shape.join })); } catch { /* racing close */ } };
    ws.onmessage = (ev) => { try { const m = JSON.parse(String(ev.data)); if (m.type === "error") a.gotError = true; } catch { /* non-JSON */ } };
    ws.onclose = (ev) => {
      clearTimeout(to);
      a.closeCode = Number(ev.code ?? 0);
      a.codeOk = a.closeCode === shape.code;
      if (!opened) a.connFail = true;
      a.ms = performance.now() - started;
      resolve(a);
    };
    ws.onerror = () => { /* close follows */ };
  });
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

// embodied presence (identical shape to pressure-1..11): 24 broadcasters @ 15Hz
let running = true;
const posesSent = { n: 0 };
const tickers = perfs.map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// HTTP event-loop health probe throughout (storm = attacker window, settled = post-storm)
const probeStorm: number[] = [], probeSettled: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  const d = performance.now() - t;
  (performance.now() - t0 < STORM_END + 2_000 ? probeStorm : probeSettled).push(d);
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

// ---- attacker storm ------------------------------------------------------------
const attempts: Attempt[] = [];
at(STORM_START, async () => {
  await Promise.all(Array.from({ length: N_ATK }, async (_, k) => {
    let i = 0;
    while (performance.now() - t0 < STORM_END) {
      const shape = SHAPES[(k + i) % SHAPES.length];
      const started = performance.now();
      attempts.push(await attempt(shape));
      const dt = performance.now() - started;
      if (dt < 25) await sleep(25 - dt);
      i++;
    }
  }));
  console.log(`t+${Math.round((performance.now() - t0) / 100) / 10}s: storm done — ${attempts.length} attempts (${SHAPES.map((s) => `${s.tag.split("-")[1]}:${attempts.filter((a) => a.tag === s.tag).length}`).join(" ")})`);
});

// ---- fairness legs mid-storm ---------------------------------------------------
const fairSpecs: Spec[] = [];
at(FAIR_SPEC_AT, async () => {
  const r = await Promise.allSettled(Array.from({ length: 24 }, (_, i) => connect(`fair-${i}`, true)));
  fairSpecs.push(...r.filter((x) => x.status === "fulfilled").map((x: any) => x.value as Spec));
  anchors.push(...fairSpecs);
});
let fairEmb: Spec[] = [];
let aidLegit: Spec | null = null;
const saysAppendedArr: boolean[] = [];
const sayLat: number[] = [];
at(FAIR_EMB_AT, async () => {
  const r = await Promise.allSettled([0, 1, 2].map((i) => connect(`legit-${i}`, false, 300 + i)));
  fairEmb = r.filter((x) => x.status === "fulfilled").map((x: any) => x.value as Spec);
  anchors.push(...fairEmb);
});
at(AID_LEGIT_AT, async () => {
  try { aidLegit = await connect("aidlegit", false, 400, GOOD_TOKEN); anchors.push(aidLegit); } catch { /* gate reads null */ }
});
// one say per storm sub-window, authored by a perf anchor
const SAY_TEXTS = [`authstorm-a-${Math.floor(t0)}`, `authstorm-b-${Math.floor(t0)}`, `authstorm-c-${Math.floor(t0)}`];
[5_500, 7_500, 9_500].forEach((when, i) => {
  at(when, () => {
    const sentAt = performance.now();
    const S = perfs[3];
    if (S.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: SAY_TEXTS[i] } }));
    at(when + 1_500, () => {
      const hit = S.sayEcho.get(SAY_TEXTS[i]);
      saysAppendedArr.push(hit !== undefined);
      if (hit !== undefined) sayLat.push(hit - sentAt);
    });
  });
});

// ---- roster probes -------------------------------------------------------------
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
at(8_000, async () => {
  const want = new Set([...anchorIds, "legit-0", "legit-1", "legit-2", "aidlegit"]);
  await rosterProbe("midstorm", want);
});
at(13_500, async () => {
  await rosterProbe("poststorm", new Set(anchorIds));
});

// world-log baseline: count lines once anchors are in and before any says land
let logBaseline = -1;
at(4_500, () => {
  const p = `${WORLDS}/${WORLD}/log.jsonl`;
  if (existsSync(p)) logBaseline = readFileSync(p, "utf8").split("\n").filter(Boolean).length;
});

// t+12s: fairness legs exit cleanly
at(LEGIT_EXIT_AT, () => {
  fairEmb.forEach((s) => { try { s.ws.close(); } catch {} });
  if (aidLegit) { try { aidLegit.ws.close(); } catch {} }
});

// t+18s: TEARDOWN — anchors leave cleanly; frame stream ends with the broadcasters
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  anchors.forEach((s) => { try { s.ws.close(); } catch {} });
});

// t+22s: FINAL PROBE — the empty world
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

await sleep(DURATION);
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(300);

// ---- ground truth ---------------------------------------------------------------
const SEER = specs[0];
const legitArrives = SEER ? SEER.arrives.filter((id) => /^(perf-|legit-|aidlegit)/.test(id)).length : -1;
const legitLeaves = SEER ? SEER.leaves.filter((id) => /^(perf-|legit-|aidlegit)/.test(id)).length : -1;
const intruderArrives = SEER ? SEER.arrives.filter((id) => /^(atk-|arthur-res-)/.test(id)).length : 999;
const arriveDrift = legitArrives < 0 ? 999 : Math.abs(legitArrives - LEGIT_EMB);
const leaveDrift = legitLeaves < 0 ? 999 : Math.abs(legitLeaves - LEGIT_EMB);

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

const refusalLat = attempts.filter((a) => !a.hung && !a.connFail).map((a) => a.ms);
const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  attempts: attempts.length,
  explicitRefusals: attempts.filter((a) => a.gotError).length,
  closeCodeOk: attempts.filter((a) => a.codeOk).length,
  hangs: attempts.filter((a) => a.hung).length,
  connFail: attempts.filter((a) => a.connFail).length,
  refusalP95: pct(refusalLat, 95),
  fairSpecJoins: fairSpecs.length, fairSpecP95: pct(fairSpecs.map((s) => s.joinMs), 95),
  fairEmbJoins: fairEmb.length, fairEmbP95: pct(fairEmb.map((s) => s.joinMs), 95),
  aidLegitJoins: aidLegit ? 1 : 0,
  saysAppended: saysAppendedArr.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  intruderArrives,
  rosterGhosts: rosterGhosts.length,
  finalPresent: Math.max(finalPresent, 0) === finalPresent ? finalPresent : 999,
  arriveDrift, leaveDrift,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  logSuspicious: suspicious.length, logDrift: logDriftVal, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n}
  anchor joins          ${anchors.length - fairSpecs.length - fairEmb.length - (aidLegit ? 1 : 0)}/${all.length} — p95 ${Math.round(m.anchorJoinP95)}ms
  storm attempts        ${attempts.length} (${(attempts.length / ((STORM_END - STORM_START) / 1000)).toFixed(0)}/s across ${N_ATK} attackers)
  explicit refusals     ${m.explicitRefusals}/${attempts.length} — ${attempts.length - m.explicitRefusals} silent
  close codes exact     ${m.closeCodeOk}/${attempts.length} (4003: ${attempts.filter((a) => a.closeCode === 4003).length}, 4004: ${attempts.filter((a) => a.closeCode === 4004).length}, other: ${attempts.filter((a) => a.closeCode !== 4003 && a.closeCode !== 4004).length})
  hangs / conn fails    ${m.hangs} / ${m.connFail}
  refusal latency ms    p50 ${Math.round(pct(refusalLat, 50))}  p95 ${Math.round(m.refusalP95)}  max ${Math.round(Math.max(...refusalLat, 0))}
  per-shape p95 ms      ${SHAPES.map((s) => {
    const xs = attempts.filter((a) => a.tag === s.tag).map((a) => a.ms);
    return `${s.tag} ${xs.length ? Math.round(pct(xs, 95)) : "-"}`;
  }).join("  ")}
  mid-storm joins       spec ${m.fairSpecJoins}/24 p95 ${Math.round(m.fairSpecP95)}ms  emb ${m.fairEmbJoins}/3 p95 ${Math.round(m.fairEmbP95)}ms  valid-aid1 ${m.aidLegitJoins}/1
  mid-storm says        ${saysAppendedArr.filter(Boolean).length}/3 appended — author p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms
  intruder arrives      ${intruderArrives} (must be 0)
  rosters               ${rosterGhosts.length === 0 ? "exact at all probes" : `${rosterGhosts.length} ghosts: ${rosterGhosts.slice(0, 8).join(",")}`}
  final present         ${finalPresent} embodied (must be 0)
  legit arrive/leave    ${legitArrives}/${LEGIT_EMB} arrives (drift ${arriveDrift})  ${legitLeaves}/${LEGIT_EMB} leaves (drift ${leaveDrift})
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)}  min ${fpsPer.length ? Math.min(...fpsPer).toFixed(1) : "-"}
  frame latency ms      p50 ${Math.round(pct(latAll, 50))}  p95 ${Math.round(m.latP95)}  max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} anchor spectators
  http probe ms         storm p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length})  settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})  errors ${probeErrors.n}
  world log             baseline ${logBaseline} → ${logTotalLines} lines (drift ${logDriftVal} vs ${EXPECT_SAYS} says)
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — bad tokens get explicit refusals at full storm rate and join capacity never wavers`);
rmSync(WORLDS, { recursive: true, force: true });
rmSync(FIXDIR, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
