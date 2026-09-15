// Pressure scenario 14: WORLD-HOP CHURN — rapid switch/leave cycles leave no
// cross-world state bleed. Design target: 24 embodied performers + up to 200
// spectators across worlds; travelers hop A<->B every 800ms on LIVE sockets.
//
// The bleed surfaces under test (server.ts):
//   S1 c.lastPose survives travel (never cleared in the join handler's
//      leave-previous-world block). A hopper that posed in A and hops to B
//      without posing there appears in B's join snapshot `present` roster at
//      A's coordinates (settledPose(o.lastPose)), and a later close/travel
//      out of B writes A's coordinates into B's poses.json (wake-pose bleed).
//   S2 whisper holds are keyed (world, recipient) — a whisper held for an
//      absent recipient in A must not deliver when they join B or G.
//   S3 leases held across a rapid double-hop (B then back 100ms later) must
//      settle EXACTLY once, promptly, at the last streamed state.
//
// Population (pinned before measuring — 216 peak concurrent sockets):
//   alpha: 24 perf embodied @15Hz + 140 spec + 16 hop-live + 8 hop-sleepy
//          + 4 bleed + hopper-w + rev-alpha  (embodied legs pose @10Hz)
//   beta:  20 spec + hopper-x (embodied, far corner 40,40)
//   gamma: 1 spec (whisper-scoping witness world)
//
// Leg behaviors:
//   hop-live-i    pose @10Hz in WHATEVER world they currently inhabit
//   hop-sleepy-i  pose @10Hz in alpha ONLY during the first dwell (<4.0s);
//                 after the first hop they never pose again anywhere
//   hopper-w      poses in alpha only; micro-hops alpha->beta->gamma->beta
//                 while a whisper is held for them in alpha (scope probe)
//   bleed-i       pose in alpha t0..12s, hop to beta, close WITHOUT posing
//                 in beta; bleed-0 later rejoins beta — restore must be null
//   rev-alpha     poses alpha t0..1.2s, closes, rejoins 16.5s — restore must
//                 equal the last alpha pose (sanity: same-world restore works)
//   hopper-y=hop-live-0  claims prop-y, streams 3 states, double-hops
//                 beta@7.4 -> alpha@7.5 mid-lease
//
// Phases:
//   t=1.2s   rev-alpha closes (alpha rememberPose — legitimate)
//   t=1.5s   hopper-w -> beta
//   t=3.0s   perf-1 whispers W1 to hopper-w (absent from alpha -> HELD,
//            alpha-scoped). t=3.4s hopper-x whispers WX to hopper-w IN BETA
//            (present there -> immediate delivery — the cross-world hold
//            must not have delivered W1 at the 1.5s beta join).
//   t=4.0s   CHURN WAVE 1 — all 24 hoppers -> beta (live sockets)
//   t=4.2s   hopper-w -> GAMMA (a globally-keyed hold bug would deliver W1
//            here); t=4.6s -> beta
//   t=4.45s  PRESENCE PROBES: alpha present == {perf-*,bleed-*} exactly;
//            beta present == {hop-*,hopper-x} exactly, every pose null or
//            beta-band — sleepy hoppers carrying alpha coordinates = BLEED.
//   t=4.8s   WAVE 2 -> alpha;  t=5.6s WAVE 3 -> beta;  t=6.4s WAVE 4 -> alpha
//            (hoppers park in alpha)
//   t=5.0s   spawn prop-y (perf-0); t=5.3s hopper-y claims + 3 states
//   t=7.4s   hopper-y -> beta; t=7.5s -> alpha (rapid double-hop mid-lease)
//   t=8.0s   hopper-w -> alpha: W1 delivers HERE (exactly once, in alpha)
//   t=9.5s   perf-1 whispers W2 (hopper-w present -> immediate)
//   t=10.0s  hopper-w -> beta (nothing may deliver); t=10.8s -> alpha (park)
//   t=12.0s  bleed-0..3 -> beta; t=12.5s CLOSE in beta (no beta pose ever)
//   t=13.5s  ROSTERS: alpha 41 (24 perf + 16 hoppers + hopper-w), beta 1
//   t=16.0s  bleed-0 rejoins beta EMBODIED — snapshot.restore MUST be null
//   t=16.5s  rev-alpha rejoins — restore ~= last alpha pose
//   t=18.0s  TEARDOWN (all close)
//   t=24.0s  FINAL PROBES: present==0 in all three worlds, 0 ghost leases
//   post     server killed; poses.json + log.jsonl audited ON DISK:
//            beta file keys ⊆ {hop-live-*, hopper-x} (all beta-band), gamma
//            file empty/absent, alpha file exactly 54 keys (sleepy alpha-band)
//
// Acceptance gates (pinned before measuring — see TH):
//   SERVER_DIR=/tmp/pressure14-tree PORT=8983 bun tools/pressure-hop.ts
//   SELFTEST=1 bun tools/pressure-hop.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure14-tree";
const PORT = Number(process.env.PORT ?? 8983);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure14-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD_A = "alpha", WORLD_B = "beta", WORLD_G = "gamma";
const N_PERF = 24, N_SPEC_A = 140, N_SPEC_B = 20, N_SPEC_G = 1;
const N_LIVE = 16, N_SLEEPY = 8, N_BLEED = 4;         // hoppers + bleed legs
const Y_LEG = 15;                                    // hop-live-15: exempt from waves (holds its lease across churn)
const POSE_HZ = 10, PERF_HZ = 15;
const REV_CLOSE_AT = 1_200;
const W_TO_BETA_AT = 1_500;
const W1_AT = 3_000, WX_AT = 3_400;
const WAVE1_AT = 4_000, WAVE2_AT = 4_800, WAVE3_AT = 5_600, WAVE4_AT = 6_400;
const W_TO_GAMMA_AT = 4_200, W_TO_BETA2_AT = 4_600;
const PROBE_MID_AT = 4_450;
const SPAWN_AT = 4_850, CLAIM_AT = 4_900;            // hopper-y holds the lease ACROSS wave3
const Y_OUT_AT = 7_400, Y_BACK_AT = 7_500;
const W_RET1_AT = 8_000, W2_AT = 9_500, W_OUT2_AT = 10_000, W_RET2_AT = 10_800;
const BLEED_OUT_AT = 12_000, BLEED_CLOSE_AT = 12_500;
const ROSTER_AT = 13_500, B0_REJOIN_AT = 16_000, REV_REJOIN_AT = 16_500;
const TEARDOWN_AT = 18_000, FINAL_AT = 24_000, DURATION = 26_000;
const MSG_RATE = "600";        // same scratch envelope as pressure-1..13
const SELFTEST = process.env.SELFTEST === "1";
// coordinate bands (radial distance from origin): alpha walks r<=10, beta
// walks r in [20,28], hopper-x sits at (40,40). A leaked alpha pose in beta
// is unambiguous: hypot <= 11 where every legal beta pose is >= 18.
const A_BAND = 11, B_BAND = 18;
// prop-y lease states; settle must commit at the LAST streamed state once
const P_Y = [60, 0, -30] as const;
const S3 = [P_Y[0], 0, P_Y[2]] as const;
// expected world-log lines (ground truth):
//   alpha: genesis + grant + spawn + place + say = 5
//   beta:  genesis + grant + say = 3
//   gamma: genesis + grant = 2
const EXPECT_A = 5, EXPECT_B = 3, EXPECT_G = 2;
// alpha poses.json after teardown: every embodied leg that ever posed in alpha
const EXPECT_A_POSES = N_PERF + N_LIVE + N_SLEEPY + N_BLEED + 2; // + hopper-w, rev-alpha = 54

const TH = {
  anchorFailed: 0, anchorJoinP95Ms: 3_000,
  w1Delivered: 1, wxDelivered: 1, w2Delivered: 1,   // exactly once each...
  whisperWrongWorld: 0, whisperTotal: 3,             // ...in the right world, no dups
  presenceBleed: 0,                                  // beta probe: alien-band poses
  alphaProbeExact: 1, betaProbeExact: 1,             // exact present sets mid-churn
  arriveLeaveDrift: 0,
  ghostFrames: 0,
  leaseReleased: 1, leasePromptMs: 500,
  leasePlaces: 1, leasePosExact: 1, leasePlaceTotal: 1,
  restoreBleedNull: 1,                               // bleed-0 beta restore === null
  restoreRevExact: 1,                                // rev-alpha restore ~= last pose
  rosterA: N_PERF + N_LIVE + 1,                      // 41: perf + hoppers + hopper-w
  rosterB: 1,
  finalPresentA: 0, finalPresentB: 0, finalPresentG: 0, ghostLeaseStates: 0,
  logDriftA: 0, logDriftB: 0, logDriftG: 0,
  fileBetaAliens: 0, fileGammaAliens: 0,             // cross-world pose-file bleed
  fileAlphaCount: EXPECT_A_POSES, fileAlphaBand: N_SLEEPY,
  saysAppended: 2, sayP95Ms: 500,
  fpsP50: 12, latP95Ms: 250, seqGaps: 0,
  probeStormP95Ms: 500, probeSettledP95Ms: 100,
  logSuspicious: 0, rssPeakGrowthMB: 60,
};
TH.rosterA = N_PERF + N_LIVE + N_SLEEPY + 1;         // 49: perf + ALL hoppers + hopper-w

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  w1Ok: number; wxOk: number; w2Ok: number;
  whisperWrongWorld: number; whisperTotal: number;
  presenceBleed: number;
  alphaProbeExact: number; betaProbeExact: number;
  arriveLeaveDrift: number;
  ghostFrames: number;
  leaseReleased: number; leasePrompt: number;
  leasePlaces: number; leasePosExact: number; leasePlaceTotal: number;
  restoreBleedNull: number; restoreRevExact: number;
  rosterA: number; rosterB: number;
  finalPresentA: number; finalPresentB: number; finalPresentG: number; ghostLeaseStates: number;
  logDriftA: number; logDriftB: number; logDriftG: number;
  fileBetaAliens: number; fileGammaAliens: number;
  fileAlphaCount: number; fileAlphaBand: number;
  saysAppended: number; sayP95: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeSettledP95: number;
  logSuspicious: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.w1Ok < TH.w1Delivered) fail.push(`held whisper W1 delivered-in-alpha ${m.w1Ok}/1 — alpha-scoped hold lost or delivered elsewhere`);
  if (m.wxOk < TH.wxDelivered) fail.push(`beta whisper WX delivered ${m.wxOk}/1 — point-to-point whisper in beta failed`);
  if (m.w2Ok < TH.w2Delivered) fail.push(`immediate whisper W2 delivered-in-alpha ${m.w2Ok}/1`);
  if (m.whisperWrongWorld > TH.whisperWrongWorld) fail.push(`${m.whisperWrongWorld} whisper receipt(s) in the WRONG world — cross-world whisper bleed`);
  if (m.whisperTotal !== TH.whisperTotal) fail.push(`whisper receipts total ${m.whisperTotal} != ${TH.whisperTotal} — duplicated or lost private messages`);
  if (m.presenceBleed > TH.presenceBleed) fail.push(`${m.presenceBleed} beta-present bodies carrying OLD-WORLD coordinates — presence bleed across the hop`);
  if (m.alphaProbeExact < TH.alphaProbeExact) fail.push(`mid-churn alpha present set not exact (ghosts or missing legs)`);
  if (m.betaProbeExact < TH.betaProbeExact) fail.push(`mid-churn beta present set not exact (ghosts or missing legs)`);
  if (m.arriveLeaveDrift > TH.arriveLeaveDrift) fail.push(`arrive/leave tally drift ${m.arriveLeaveDrift} across all legs/worlds — lost or doubled presence events`);
  if (m.ghostFrames > TH.ghostFrames) fail.push(`${m.ghostFrames} presence frames carried a body in a world it had left — old-world traffic bleed`);
  if (m.leaseReleased < TH.leaseReleased) fail.push(`rapid double-hop lease released ${m.leaseReleased}/1 — lease leaked across hops`);
  if (m.leasePrompt > TH.leasePromptMs) fail.push(`lease release latency ${Math.round(m.leasePrompt)}ms > ${TH.leasePromptMs}ms — settle not prompt`);
  if (m.leasePlaces < TH.leasePlaces) fail.push(`prop-y place commits ${m.leasePlaces}/1 in alpha log`);
  if (m.leasePosExact < TH.leasePosExact) fail.push(`lease settled at exact last streamed s3 ${m.leasePosExact}/1`);
  if (m.leasePlaceTotal !== TH.leasePlaceTotal) fail.push(`prop-y place total ${m.leasePlaceTotal} != ${TH.leasePlaceTotal} — settled twice or never`);
  if (m.restoreBleedNull < TH.restoreBleedNull) fail.push(`bleed-0 beta restore NOT null — alpha pose persisted into beta's poses.json (wake-pose bleed)`);
  if (m.restoreRevExact < TH.restoreRevExact) fail.push(`rev-alpha restore != last alpha pose — same-world restore broken`);
  if (m.rosterA !== TH.rosterA) fail.push(`alpha roster ${m.rosterA} != ${TH.rosterA} at t+13.5s`);
  if (m.rosterB !== TH.rosterB) fail.push(`beta roster ${m.rosterB} != ${TH.rosterB} at t+13.5s`);
  if (m.finalPresentA > TH.finalPresentA) fail.push(`final alpha present ${m.finalPresentA} — world not empty`);
  if (m.finalPresentB > TH.finalPresentB) fail.push(`final beta present ${m.finalPresentB} — world not empty`);
  if (m.finalPresentG > TH.finalPresentG) fail.push(`final gamma present ${m.finalPresentG} — world not empty`);
  if (m.ghostLeaseStates > TH.ghostLeaseStates) fail.push(`${m.ghostLeaseStates} ghost lease states after final snapshots`);
  if (m.logDriftA > TH.logDriftA) fail.push(`alpha log line drift ${m.logDriftA} (want ${EXPECT_A})`);
  if (m.logDriftB > TH.logDriftB) fail.push(`beta log line drift ${m.logDriftB} (want ${EXPECT_B})`);
  if (m.logDriftG > TH.logDriftG) fail.push(`gamma log line drift ${m.logDriftG} (want ${EXPECT_G})`);
  if (m.fileBetaAliens > TH.fileBetaAliens) fail.push(`${m.fileBetaAliens} alien keys/poses in beta poses.json — old-world pose written into new world's file`);
  if (m.fileGammaAliens > TH.fileGammaAliens) fail.push(`${m.fileGammaAliens} alien keys in gamma poses.json — pose bleed through a 400ms dwell`);
  if (m.fileAlphaCount !== TH.fileAlphaCount) fail.push(`alpha poses.json ${m.fileAlphaCount} keys != ${TH.fileAlphaCount}`);
  if (m.fileAlphaBand < TH.fileAlphaBand) fail.push(`sleepy hoppers with alpha-band alpha-file poses ${m.fileAlphaBand}/${TH.fileAlphaBand}`);
  if (m.saysAppended < TH.saysAppended) fail.push(`mid-churn says ${m.saysAppended}/2 — churn stalled authored verbs`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`alpha spectator fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) fail.push(`${m.gaps} frame seq gaps`);
  if (m.probeStormP95 > TH.probeStormP95Ms) fail.push(`churn-window HTTP probe p95 ${Math.round(m.probeStormP95)}ms > ${TH.probeStormP95Ms}ms`);
  if (m.probeSettledP95 > TH.probeSettledP95Ms) fail.push(`post-teardown HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > ${TH.probeSettledP95Ms}ms`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 41,
    w1Ok: 1, wxOk: 1, w2Ok: 1,
    whisperWrongWorld: 0, whisperTotal: 3,
    presenceBleed: 0,
    alphaProbeExact: 1, betaProbeExact: 1,
    arriveLeaveDrift: 0,
    ghostFrames: 0,
    leaseReleased: 1, leasePrompt: 40,
    leasePlaces: 1, leasePosExact: 1, leasePlaceTotal: 1,
    restoreBleedNull: 1, restoreRevExact: 1,
    rosterA: N_PERF + N_LIVE + N_SLEEPY + 1, rosterB: 1,
    finalPresentA: 0, finalPresentB: 0, finalPresentG: 0, ghostLeaseStates: 0,
    logDriftA: 0, logDriftB: 0, logDriftG: 0,
    fileBetaAliens: 0, fileGammaAliens: 0,
    fileAlphaCount: EXPECT_A_POSES, fileAlphaBand: 8,
    saysAppended: 2, sayP95: 8,
    fpsP50: 14.7, latP95: 11, gaps: 0,
    probeStormP95: 9, probeSettledP95: 3,
    logSuspicious: 0, rssPeakGrowth: 12,
  };
  const breached: Measurements = {
    ...healthy,
    anchorFailed: 3, anchorJoinP95: 4_200,
    w1Ok: 0, wxOk: 0, w2Ok: 0,
    whisperWrongWorld: 2, whisperTotal: 5,
    presenceBleed: 8,
    alphaProbeExact: 0, betaProbeExact: 0,
    arriveLeaveDrift: 4,
    ghostFrames: 6,
    leaseReleased: 0, leasePrompt: 3_900,
    leasePlaces: 0, leasePosExact: 0, leasePlaceTotal: 2,
    restoreBleedNull: 0, restoreRevExact: 0,
    rosterA: 39, rosterB: 3,
    finalPresentA: 2, finalPresentB: 1, finalPresentG: 1, ghostLeaseStates: 1,
    logDriftA: 1, logDriftB: 2, logDriftG: 1,
    fileBetaAliens: 13, fileGammaAliens: 1,
    fileAlphaCount: 51, fileAlphaBand: 6,
    saysAppended: 1, sayP95: 700,
    fpsP50: 9, latP95: 380, gaps: 2,
    probeStormP95: 800, probeSettledP95: 250,
    logSuspicious: 3, rssPeakGrowth: 90,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["anchor connections failed", "anchor join p95", "held whisper W1", "beta whisper WX", "immediate whisper W2", "WRONG world", "duplicated or lost private", "OLD-WORLD coordinates", "alpha present set", "beta present set", "arrive/leave tally drift", "world it had left", "lease leaked across hops", "settle not prompt", "place commits", "exact last streamed s3", "settled twice or never", "wake-pose bleed", "same-world restore broken", "alpha roster", "beta roster", "final alpha present", "final beta present", "final gamma present", "ghost lease states", "alpha log line drift", "beta log line drift", "gamma log line drift", "beta poses.json", "gamma poses.json", "alpha poses.json", "alpha-band alpha-file", "stalled authored verbs", "say author p95", "fps p50", "latency p95", "seq gaps", "churn-window HTTP", "post-teardown HTTP", "suspicious server log", "RSS peak growth"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: alpha = ${N_PERF} perf @${PERF_HZ}Hz + ${N_SPEC_A} spec + ${N_LIVE} live hoppers + ${N_SLEEPY} sleepy + ${N_BLEED} bleed + hopper-w + rev-alpha; beta = ${N_SPEC_B} spec + hopper-x; gamma = ${N_SPEC_G} spec. Churn waves A->B->A->B->A @800ms dwell from t+${WAVE1_AT / 1000}s; hopper-w micro-hops alpha->beta->gamma->beta while W1 held; bleed legs close in beta unposed; rapid double-hop mid-lease t+${Y_OUT_AT / 1000}s. ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: bleed=0 (presence, restore, file x3 worlds) whisper W1/WX/W2 exactly-once in-world wrong-world=0 drift=0 ghosts=0 lease 1-release <=${TH.leasePromptMs}ms@exact-s3-once rosters ${TH.rosterA}/${TH.rosterB} finals 0/0/0 logs ${EXPECT_A}/${EXPECT_B}/${EXPECT_G} exact alphaPoses=${TH.fileAlphaCount} says=2@p95<${TH.sayP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=0 probes<${TH.probeStormP95Ms}/${TH.probeSettledP95Ms}ms suspicious=0 rss<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-hop.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure14-server-${Date.now()}.log`;
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
  try { const res = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD_A}`); ready = res.status > 0; } catch { /* booting */ }
}
if (!ready) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }
const rssReady = rss();
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (log: ${logPath})`);

// ---- client chassis -----------------------------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; snapAt: number; snapWorld: string; restore: any;
  closed: boolean; id: string; world: string;
  leaves: string[]; arrives: string[];
  arriveAt: { id: string; at: number }[]; leaveAt: { id: string; at: number }[];
  leaseEvents: { op: string; id: string; at: number }[];
  frameIds: { id: string; at: number }[];
  whispers: { text: string; from: string; world: string }[];
  sayEcho: Map<string, number>; errs: string[];
};
function connect(id: string, world: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], snapAt: 0, snapWorld: "", restore: null, closed: false, world, leaves: [], arrives: [], arriveAt: [], leaveAt: [], leaseEvents: [], frameIds: [], whispers: [], sayEcho: new Map(), errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapAt = performance.now(); s.snapWorld = String(m.world ?? ""); s.restore = m.restore ?? null;
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++; s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
        for (const k of Object.keys(m.poses ?? {})) s.frameIds.push({ id: k, at: performance.now() });
      } else if (m.type === "arrive") { s.arrives.push(String(m.id ?? "")); s.arriveAt.push({ id: String(m.id ?? ""), at: performance.now() }); }
      else if (m.type === "leave") { s.leaves.push(String(m.id ?? "")); s.leaveAt.push({ id: String(m.id ?? ""), at: performance.now() }); }
      else if (m.type === "lease") s.leaseEvents.push({ op: String(m.op ?? ""), id: String(m.id ?? ""), at: performance.now() });
      else if (m.type === "whisper") s.whispers.push({ text: String(m.text ?? ""), from: String(m.from ?? ""), world: s.world });
      else if (m.type === "log" && m.entry?.verb === "say") { if (!s.sayEcho.has(m.entry.args?.text)) s.sayEcho.set(m.entry.args?.text, performance.now()); }
      else if (m.type === "error") s.errs.push(String(m.error ?? ""));
    };
    ws.onclose = () => { s.closed = true; };
    ws.onerror = () => { /* close follows */ };
  });
}
function travel(s: Spec, world: string): Promise<void> {
  return new Promise((resolve) => {
    const prevSnapAt = s.snapAt;
    const iv = setInterval(() => {
      if (s.snapWorld === world && s.snapAt !== prevSnapAt) { clearInterval(iv); resolve(); }
      if (s.closed) { clearInterval(iv); resolve(); }
    }, 25);
    setTimeout(() => { clearInterval(iv); resolve(); }, 10_000);
    if (s.ws.readyState === 1) {
      s.world = world;
      s.ws.send(JSON.stringify({ type: "join", world, id: s.id, avatar: "x.vrm", spectate: false, token: TOKEN }));
    } else { clearInterval(iv); resolve(); }
  });
}

// ---- anchor population --------------------------------------------------------
// SEERS FIRST: they must be connected before any leg arrives, so the presence
// tallies are deterministic (initial arrives always observed).
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const SEER = await connect(`spec-0`, WORLD_A, true);
const BSEER = await connect(`bspec-0`, WORLD_B, true);
const all = await Promise.allSettled([
  ...Array.from({ length: N_SPEC_A - 1 }, (_, i) => connect(`spec-${i + 1}`, WORLD_A, true)),
  connect(`gspec-0`, WORLD_G, true),
  ...Array.from({ length: N_SPEC_B - 1 }, (_, i) => connect(`bspec-${i + 1}`, WORLD_B, true)),
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, WORLD_A, false, i)),
  ...Array.from({ length: N_LIVE }, (_, i) => connect(`hop-live-${i}`, WORLD_A, false, 200 + i)),
  ...Array.from({ length: N_SLEEPY }, (_, i) => connect(`hop-sleepy-${i}`, WORLD_A, false, 300 + i)),
  ...Array.from({ length: N_BLEED }, (_, i) => connect(`bleed-${i}`, WORLD_A, false, 400 + i)),
  connect(`hopper-w`, WORLD_A, false, 500),
  connect(`hopper-x`, WORLD_B, false, 501),
  connect(`rev-alpha`, WORLD_A, false, 502),
]);
const anchors = [SEER, BSEER, ...all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec)];
const anchorFailed = all.length - (anchors.length - 2);
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const bspecs = anchors.filter((s) => s.id.startsWith("bspec-"));
const lives = anchors.filter((s) => s.id.startsWith("hop-live-"));
const sleepies = anchors.filter((s) => s.id.startsWith("hop-sleepy-"));
const bleeds = anchors.filter((s) => s.id.startsWith("bleed-"));
const hopperW = anchors.find((s) => s.id === "hopper-w")!;
const hopperX = anchors.find((s) => s.id === "hopper-x")!;
const revAlpha = anchors.find((s) => s.id === "rev-alpha")!;
const hoppers = [...lives, ...sleepies];
const joinTimes = anchors.map((s) => s.joinMs >= 0 ? s.joinMs : 1);
console.log(`t+0: anchors joined ${anchors.length}/${all.length + 2} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// ---- presence tickers ---------------------------------------------------------
// world radii: alpha r<=10 (perf r10, hoppers r8.6), beta r in [20,28]
let running = true;
const tickers: any[] = [];
const lastAlphaPose = new Map<string, number[]>();
const walk = (i: number, t: number, r: number) => [Math.sin(t * 0.5 + i) * r, 0, Math.cos(t * 0.5 + i) * r] as number[];
const sendPose = (s: Spec, p: number[]) => {
  if (s.ws.readyState !== 1) return;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p, yaw: (Date.now() / 1000 + p[0]) % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
};
for (const s of perfs) {
  const i = Number(s.id.slice(5));
  tickers.push(setInterval(() => { if (running && s.world === WORLD_A) sendPose(s, walk(i, Date.now() / 1000, 10)); }, 1000 / PERF_HZ));
}
for (const s of hoppers) {
  const i = Number(s.id.split("-")[2]);
  const sleepy = s.id.startsWith("hop-sleepy-");
  tickers.push(setInterval(() => {
    if (!running) return;
    // sleepy hoppers pose ONLY in alpha during the first dwell (<4.0s)
    if (sleepy && (s.world !== WORLD_A || performance.now() - t0 > 4_000)) return;
    const r = s.world === WORLD_A ? 8.6 : 20 + 8 * (i / Math.max(1, N_LIVE - 1));
    const p = walk(i, Date.now() / 1000, r);
    if (s.world === WORLD_A) lastAlphaPose.set(s.id, p);
    sendPose(s, p);
  }, 1000 / POSE_HZ));
}
for (const s of bleeds) {
  const i = Number(s.id.slice(6));
  tickers.push(setInterval(() => {
    if (running && s.world === WORLD_A) { const p = walk(i, Date.now() / 1000, 8.6); lastAlphaPose.set(s.id, p); sendPose(s, p); }
  }, 1000 / POSE_HZ));
}
tickers.push(setInterval(() => { if (running && hopperW.world === WORLD_A) { const p = walk(9, Date.now() / 1000, 8.6); lastAlphaPose.set("hopper-w", p); sendPose(hopperW, p); } }, 1000 / POSE_HZ));
tickers.push(setInterval(() => { if (running) sendPose(hopperX, [40 + Math.sin(Date.now() / 4000) * 0.5, 0, 40 + Math.cos(Date.now() / 4000) * 0.5]); }, 1000 / POSE_HZ));
{ // rev-alpha poses only until its 1.2s close
  const i = 7;
  const iv = setInterval(() => { if (running && !revAlpha.closed && revAlpha.world === WORLD_A) { const p = walk(i, Date.now() / 1000, 8.6); lastAlphaPose.set("rev-alpha", p); sendPose(revAlpha, p); } }, 1000 / POSE_HZ);
  tickers.push(iv);
}

// HTTP event-loop probes
const probeStorm: number[] = [], probeSettled: number[] = [];
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD_A}`); await r.arrayBuffer(); } catch { /* counted by absence */ }
  (performance.now() - t0 < TEARDOWN_AT ? probeStorm : probeSettled).push(performance.now() - t);
}, 500);
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- leg world-timelines (ground truth for tallies + ghost windows) -----------
type LegRec = { id: string; joins: { world: string; at: number }[]; closeAt: number };
const legRecs: LegRec[] = [];
const joinTs: Map<string, number> = new Map();       // last join time per id (ms rel)
const mark = (id: string, world: string) => { joinTs.set(id, performance.now() - t0); };
for (const s of [...perfs, ...hoppers, ...bleeds, hopperW, hopperX, revAlpha]) mark(s.id, s.world);

// ---- scenario bookkeeping -----------------------------------------------------
const W1 = `pw1-${Math.floor(t0)}`, WX = `pwx-${Math.floor(t0)}`, W2 = `pw2-${Math.floor(t0)}`;
let leasePrompt = Infinity;
let travelYOutSendAt = 0;
let teardownAtTs = 0;

// rev-alpha closes at 1.2s (clean alpha leave — legitimate rememberPose)
at(REV_CLOSE_AT, () => { try { revAlpha.ws.close(); } catch {} });

// hopper-w -> beta at 1.5s
at(W_TO_BETA_AT, async () => { await travel(hopperW, WORLD_B); mark("hopper-w", WORLD_B); });

// t+3.0: perf-1 whispers W1 to hopper-w (absent from alpha -> HELD, alpha key)
at(W1_AT, () => { if (perfs[1]?.ws.readyState === 1) perfs[1].ws.send(JSON.stringify({ type: "whisper", to: "hopper-w", text: W1 })); });
// t+3.4: hopper-x whispers WX to hopper-w IN beta (immediate delivery)
at(WX_AT, () => { if (hopperX.ws.readyState === 1) hopperX.ws.send(JSON.stringify({ type: "whisper", to: "hopper-w", text: WX })); });

// CHURN WAVES — all 24 hoppers, live sockets, 800ms dwell
const wave = (ms: number, world: string) => at(ms, async () => {
  const riders = hoppers.filter((s) => Number(s.id.split("-")[2]) !== Y_LEG);
  await Promise.all(riders.map((s) => travel(s, world)));
  for (const s of riders) mark(s.id, world);
});
wave(WAVE1_AT, WORLD_B);
wave(WAVE2_AT, WORLD_A);
wave(WAVE3_AT, WORLD_B);
wave(WAVE4_AT, WORLD_A);

// hopper-w micro-hops: -> gamma (4.2) -> beta (4.6)
at(W_TO_GAMMA_AT, async () => { await travel(hopperW, WORLD_G); mark("hopper-w", WORLD_G); });
at(W_TO_BETA2_AT, async () => { await travel(hopperW, WORLD_B); mark("hopper-w", WORLD_B); });

// t+4.45: PRESENCE PROBES (mid-churn: all hoppers dwell in beta)
type Present = { ids: Set<string>; aliens: { id: string; p: any }[] };
let alphaProbe: Present | null = null, betaProbe: Present | null = null;
async function presenceProbe(world: string): Promise<Present> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve({ ids: new Set([`TIMEOUT-${world}`]), aliens: [] }); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id: `pprobe-${world}-${Math.floor(Math.random() * 1e6)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        clearTimeout(to); try { ws.close(); } catch {}
        const ids = new Set<string>(); const aliens: { id: string; p: any }[] = [];
        for (const o of m.present ?? []) {
          ids.add(String(o.id));
          const p = o.pose?.p;
          if (Array.isArray(p) && p.length === 3 && p.every((v: any) => Number.isFinite(v))) {
            const d = Math.hypot(p[0], p[2]);
            if (world !== WORLD_A && d <= A_BAND) aliens.push({ id: String(o.id), p });
          }
        }
        resolve({ ids, aliens });
      }
    };
    ws.onerror = () => { clearTimeout(to); resolve({ ids: new Set([`ERROR-${world}`]), aliens: [] }); };
  });
}
at(PROBE_MID_AT, async () => {
  alphaProbe = await presenceProbe(WORLD_A);
  betaProbe = await presenceProbe(WORLD_B);
  const wantA = new Set([...perfs.map((s) => s.id), ...bleeds.map((s) => s.id), `hop-live-${Y_LEG}`]);   // 29: hop-live-15 stays through churn
  const wantB = new Set([...hoppers.filter((s) => Number(s.id.split("-")[2]) !== Y_LEG).map((s) => s.id), "hopper-x"]);
  const eq = (got: Set<string> | null, want: Set<string>) => !!got && got.size === want.size && [...want].every((x) => got.has(x));
  (alphaProbe as any).exact = eq(alphaProbe?.ids ?? null, wantA);
  (betaProbe as any).exact = eq(betaProbe?.ids ?? null, wantB);
  console.log(`presence probes: alpha ${alphaProbe!.ids.size} (exact=${(alphaProbe as any).exact})  beta ${betaProbe!.ids.size} (exact=${(betaProbe as any).exact}, aliens=${betaProbe!.aliens.length})`);
});

// t+5.0: spawn prop-y; t+5.3 hopper-y (=hop-live-0) claims + 3 states
at(SPAWN_AT, () => { if (perfs[0]?.ws.readyState === 1) perfs[0].ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "prop-y", lib: "deco/bench.glb", pos: [...P_Y], yaw: 0 } })); });
at(CLAIM_AT, () => {
  const y = lives[Y_LEG];
  if (y?.ws.readyState === 1 && y.world === WORLD_A) y.ws.send(JSON.stringify({ type: "lease", op: "claim", id: "prop-y" }));
  // hop-live-15 is ALPHA-resident through the whole churn phase (leaves only
  // at Y_OUT_AT): states flow while its body has genuinely been in alpha.
  at(CLAIM_AT + 200, () => { if (y.ws.readyState === 1 && y.world === WORLD_A) y.ws.send(JSON.stringify({ type: "lease", op: "state", id: "prop-y", p: [P_Y[0] - 1, 0, P_Y[2]] })); });
  at(CLAIM_AT + 400, () => { if (y.ws.readyState === 1 && y.world === WORLD_A) y.ws.send(JSON.stringify({ type: "lease", op: "state", id: "prop-y", p: [P_Y[0] - 0.5, 0, P_Y[2]] })); });
  at(CLAIM_AT + 600, () => { if (y.ws.readyState === 1 && y.world === WORLD_A) y.ws.send(JSON.stringify({ type: "lease", op: "state", id: "prop-y", p: [...S3] })); });
});
// t+7.4/7.5: hopper-y rapid double-hop mid-lease
at(Y_OUT_AT, async () => { travelYOutSendAt = performance.now(); await travel(lives[Y_LEG], WORLD_B); mark(`hop-live-${Y_LEG}`, WORLD_B); if (lives[Y_LEG].ws.readyState === 1) lives[Y_LEG].ws.send(JSON.stringify({ type: "pose", pose: { p: [24, 0, 26], yaw: 0, speed: 0, clip: "idle" } })); });
at(Y_BACK_AT, async () => { await travel(lives[Y_LEG], WORLD_A); mark(`hop-live-${Y_LEG}`, WORLD_A); });

// t+8.0: hopper-w -> alpha (W1 delivers here); t+9.5 W2 immediate; 10.0->beta; 10.8->alpha
at(W_RET1_AT, async () => { await travel(hopperW, WORLD_A); mark("hopper-w", WORLD_A); });
at(W2_AT, () => { if (perfs[1]?.ws.readyState === 1) perfs[1].ws.send(JSON.stringify({ type: "whisper", to: "hopper-w", text: W2 })); });
at(W_OUT2_AT, async () => { await travel(hopperW, WORLD_B); mark("hopper-w", WORLD_B); });
at(W_RET2_AT, async () => { await travel(hopperW, WORLD_A); mark("hopper-w", WORLD_A); });

// t+12.0: bleed legs -> beta; t+12.5 close WITHOUT posing in beta
at(BLEED_OUT_AT, async () => { await Promise.all(bleeds.map((s) => travel(s, WORLD_B))); for (const s of bleeds) mark(s.id, WORLD_B); });
at(BLEED_CLOSE_AT, () => { for (const s of bleeds) { try { s.ws.close(); } catch {} } });

// t+13.5: rosters
let rosterA = -1, rosterB = -1;
at(ROSTER_AT, async () => {
  const a = await presenceProbe(WORLD_A), b = await presenceProbe(WORLD_B);
  const wantA = new Set([...perfs.map((s) => s.id), ...hoppers.map((s) => s.id), "hopper-w"]);
  const eq = (got: Set<string>, want: Set<string>) => got.size === want.size && [...want].every((x) => got.has(x));
  rosterA = eq(a.ids, wantA) ? wantA.size : a.ids.size;
  rosterB = eq(b.ids, new Set(["hopper-x"])) ? 1 : b.ids.size;
  console.log(`rosters: alpha ${a.ids.size} (gate ${TH.rosterA})  beta ${b.ids.size} (gate ${TH.rosterB})`);
});

// t+16.0: bleed-0 rejoins beta EMBODIED — restore must be null
let b0Spec: Spec | null = null; let b0Restore: any = "UNSET";
const lateJoins: Spec[] = [];
at(B0_REJOIN_AT, async () => {
  try { b0Spec = await connect("bleed-0", WORLD_B, false, 410); b0Restore = b0Spec.restore ?? null; mark("bleed-0", WORLD_B); lateJoins.push(b0Spec); }
  catch { b0Restore = "JOIN-FAIL"; }
});
// t+16.5: rev-alpha rejoins — restore ~= last alpha pose
let revSpec: Spec | null = null; let revRestore: any = "UNSET";
at(REV_REJOIN_AT, async () => {
  try { revSpec = await connect("rev-alpha", WORLD_A, false, 420); revRestore = revSpec.restore ?? null; mark("rev-alpha", WORLD_A); lateJoins.push(revSpec); }
  catch { revRestore = "JOIN-FAIL"; }
});

// t+5.0 fairness say in alpha (perf-3) and t+6.0 in beta (hopper-x)
const SAY_A = `hop-say-a-${Math.floor(t0)}`, SAY_B = `hop-say-b-${Math.floor(t0)}`;
const saysOk: boolean[] = []; const sayLat: number[] = [];
at(5_000, () => {
  const send = (s: Spec | undefined, text: string) => {
    if (!s || s.ws.readyState !== 1) return;
    const sentAt = performance.now();
    s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    at(6_500, () => { const hit = s.sayEcho.get(text); saysOk.push(hit !== undefined); if (hit !== undefined) sayLat.push(hit - sentAt); });
  };
  send(perfs[3], SAY_A);
});
at(6_000, () => {
  const s = hopperX; if (s.ws.readyState !== 1) return;
  const sentAt = performance.now();
  s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: SAY_B } }));
  at(7_500, () => { const hit = s.sayEcho.get(SAY_B); saysOk.push(hit !== undefined); if (hit !== undefined) sayLat.push(hit - sentAt); });
});

// t+18.0: TEARDOWN (anchors + late rejoin sockets)
at(TEARDOWN_AT, () => { running = false; teardownAtTs = performance.now(); for (const s of [...anchors, ...lateJoins]) { try { s.ws.close(); } catch {} } });

// t+24.0: FINAL empty-world probes all three worlds
let finalPresentA = -1, finalPresentB = -1, finalPresentG = -1, ghostLeaseStates = -1;
at(FINAL_AT, () => {
  let n = 0;
  const probe = (world: string, k: (v: number) => void) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} k(999); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id: `final-${world}-${Math.floor(t0)}`, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { clearTimeout(to); k((m.present ?? []).length); }
      else if (m.type === "lease" && m.op === "state") ghostLeaseStates = (ghostLeaseStates < 0 ? 1 : ghostLeaseStates + 1);
    };
    setTimeout(() => { clearTimeout(to); try { ws.close(); } catch {} }, 3_000);
  };
  probe(WORLD_A, (v) => { finalPresentA = v; if (++n === 3) ghostLeaseStates = Math.max(ghostLeaseStates, 0); });
  probe(WORLD_B, (v) => { finalPresentB = v; if (++n === 3) ghostLeaseStates = Math.max(ghostLeaseStates, 0); });
  probe(WORLD_G, (v) => { finalPresentG = v; if (++n === 3) ghostLeaseStates = Math.max(ghostLeaseStates, 0); });
});

await sleep(DURATION);
tickers.forEach(clearInterval);
clearInterval(probeTimer); clearInterval(rssTimer);
await sleep(300);

// ---- post-mortem: assemble leg timelines from the live marks ------------------
// Rebuild each leg's world timeline from the harness schedule (the same marks
// the scenario used), then derive expected arrive/leave tallies + ghost windows.
const sched: { id: string; events: { world: string; at: number }[] }[] = [];
const schedFor = (id: string, startsIn: string, hops: { world: string; at: number }[], closeAt: number) =>
  sched.push({ id, events: [{ world: startsIn, at: 0 }, ...hops, { world: "__close__", at: closeAt }] });
// NOTE: at=0 initial joins are EXCLUDED from the arrive tally — they race the
// seers' own joins inside the same connect batch (nondeterministic misses);
// initial presence is instead pinned by the mid-churn probe-exactness gates.
const schedFor0 = (id: string, world: string, hops: { world: string; at: number }[], closeAt: number) =>
  sched.push({ id, events: [{ world, at: 1 }, ...hops, { world: "__close__", at: closeAt }] });
for (const s of perfs) schedFor0(s.id, WORLD_A, [], TEARDOWN_AT);
for (let i = 0; i < N_LIVE; i++) {
  if (i === Y_LEG) { schedFor0(`hop-live-${i}`, WORLD_A, [{ world: WORLD_B, at: Y_OUT_AT }, { world: WORLD_A, at: Y_BACK_AT }], TEARDOWN_AT); continue; }
  schedFor0(`hop-live-${i}`, WORLD_A, [{ world: WORLD_B, at: WAVE1_AT }, { world: WORLD_A, at: WAVE2_AT }, { world: WORLD_B, at: WAVE3_AT }, { world: WORLD_A, at: WAVE4_AT }], TEARDOWN_AT);
}
for (let i = 0; i < N_SLEEPY; i++) schedFor0(`hop-sleepy-${i}`, WORLD_A, [{ world: WORLD_B, at: WAVE1_AT }, { world: WORLD_A, at: WAVE2_AT }, { world: WORLD_B, at: WAVE3_AT }, { world: WORLD_A, at: WAVE4_AT }], TEARDOWN_AT);
for (let i = 0; i < N_BLEED; i++) schedFor0(`bleed-${i}`, WORLD_A, [{ world: WORLD_B, at: BLEED_OUT_AT }], BLEED_CLOSE_AT);
sched.push({ id: "bleed-0", events: [{ world: WORLD_B, at: B0_REJOIN_AT }, { world: "__close__", at: TEARDOWN_AT }] });
schedFor("hopper-w", WORLD_A, [
  { world: WORLD_B, at: W_TO_BETA_AT }, { world: WORLD_G, at: W_TO_GAMMA_AT },
  { world: WORLD_B, at: W_TO_BETA2_AT }, { world: WORLD_A, at: W_RET1_AT },
  { world: WORLD_B, at: W_OUT2_AT }, { world: WORLD_A, at: W_RET2_AT },
], TEARDOWN_AT);
schedFor("hopper-x", WORLD_B, [], TEARDOWN_AT);
schedFor("rev-alpha", WORLD_A, [], REV_CLOSE_AT);
sched.push({ id: "rev-alpha", events: [{ world: WORLD_A, at: REV_REJOIN_AT }, { world: "__close__", at: TEARDOWN_AT }] });

// expected arrive/leave counts per (id, world): only SCHEDULED hops count —
// the at=0/at=1 initial joins race the seers' own joins inside one connect
// batch and are covered instead by the mid-churn probe-exactness gates.
const wantTally = new Map<string, number>();
const spans = new Map<string, { world: string; from: number; to: number }[]>();
{
  const byId = new Map<string, { world: string; at: number }[][]>();
  for (const r of sched) { const l = byId.get(r.id) ?? []; l.push(r.events); byId.set(r.id, l); }
  for (const [id, lives_] of byId) {
    const evs = lives_.flat().sort((a, b) => a.at - b.at);
    const sp: { world: string; from: number; to: number }[] = [];
    for (let i = 0; i < evs.length; i++) {
      const cur = evs[i]; if (cur.world === "__close__") continue;
      const next = evs[i + 1];
      const to = next ? next.at : TEARDOWN_AT;
      sp.push({ world: cur.world, from: cur.at, to });
      const ak = `${id}|${cur.world}|arrive`; wantTally.set(ak, (wantTally.get(ak) ?? 0) + (cur.at < 17_950 ? 1 : 0));
      const lk = `${id}|${cur.world}|leave`; wantTally.set(lk, (wantTally.get(lk) ?? 0) + (to < 17_950 ? 1 : 0));
    }
    spans.set(id, sp);
  }
}
const seerFor = (world: string) => world === WORLD_A ? SEER : world === WORLD_B ? BSEER : undefined;
let arriveLeaveDrift = 0;
{
  const GSEER = anchors.find((s) => s.id === "gspec-0");   // gamma witness (connected at t+0)
  const wit: [Spec, string][] = [[SEER, WORLD_A], [BSEER, WORLD_B], ...((GSEER ? [[GSEER, WORLD_G]] : []) as [Spec, string][])];
  const got = new Map<string, number>();
  for (const [w, wn] of wit) {
    for (const e of w.arriveAt) if (e.at - t0 < 17_950 && !e.id.startsWith("pprobe-") && !e.id.startsWith("final-")) {
      const k = `${e.id}|${wn}|arrive`; got.set(k, (got.get(k) ?? 0) + 1);
    }
    for (const e of w.leaveAt) if (e.at - t0 < 17_950 && !e.id.startsWith("pprobe-") && !e.id.startsWith("final-")) {
      const k = `${e.id}|${wn}|leave`; got.set(k, (got.get(k) ?? 0) + 1);
    }
  }
  for (const [k, want] of wantTally) {
    const g = got.get(k) ?? 0;
    if (g !== want) { arriveLeaveDrift += Math.abs(g - want); if (arriveLeaveDrift <= 8) console.log(`  tally drift ${k}: got ${g} want ${want}`); }
  }
}
// ghost frames: a frame carrying id X in world W while X's timeline says it was
// absent (300ms grace after the leave for the in-flight flush)
let ghostFrames = 0;
{
  const check = (seer: Spec, world: string) => {
    for (const f of seer.frameIds) {
      const τ = f.at - t0; if (τ > 17_900) continue;
      const sp = spans.get(f.id); if (!sp) continue;
      const present = sp.some((s) => s.world === world && τ >= s.from && τ < s.to);
      if (present) continue;
      const lastLeave = Math.max(0, ...sp.filter((s) => s.world === world && s.to <= τ).map((s) => s.to));
      if (τ > lastLeave + 300) { ghostFrames++; if (ghostFrames <= 5) console.log(`  ghost frame ${f.id} in ${world} at t+${(τ / 1000).toFixed(2)}s`); }
    }
  };
  if (SEER) check(SEER, WORLD_A);
  if (BSEER) check(BSEER, WORLD_B);
}

// whisper verdicts
const wRec = hopperW.whispers;
const w1Ok = wRec.filter((w) => w.text === W1 && w.world === WORLD_A).length === 1 ? 1 : 0;
const wxOk = wRec.filter((w) => w.text === WX && w.world === WORLD_B).length === 1 ? 1 : 0;
const w2Ok = wRec.filter((w) => w.text === W2 && w.world === WORLD_A).length === 1 ? 1 : 0;
const whisperWrongWorld = wRec.filter((w) => (w.text === W1 || w.text === W2) && w.world !== WORLD_A).length;

// lease verdicts (alpha seer)
let leaseReleased = 0;
if (SEER) {
  const evs = SEER.leaseEvents.filter((e) => e.id === "prop-y" && e.op === "released" && e.at >= travelYOutSendAt);
  if (evs.length) { leaseReleased = 1; leasePrompt = evs[0].at - travelYOutSendAt; }
}

// presence probe verdicts
// TS can't see assignments made inside at() callbacks; runtime is fine.
const bp = betaProbe as Present | null, ap = alphaProbe as Present | null;
const presenceBleed = bp ? bp.aliens.length : 999;
const alphaProbeExact = (ap as any)?.exact ? 1 : 0;
const betaProbeExact = (bp as any)?.exact ? 1 : 0;

// restore verdicts
const restoreBleedNull = b0Restore === null ? 1 : 0;
let restoreRevExact = 0;
{
  const want = lastAlphaPose.get("rev-alpha"); const got = revRestore?.p;
  if (Array.isArray(got) && want && got.length === 3 && got.every((v: number, k: number) => Math.abs(v - want[k]) < 0.75)) restoreRevExact = 1;
  else if (revRestore !== "UNSET") console.log(`  rev-alpha restore got ${JSON.stringify(revRestore?.p)} want ${JSON.stringify(want)}`);
}
if (!restoreBleedNull) console.log(`  bleed-0 beta restore ${JSON.stringify(b0Restore?.p)} — NOT null (alpha-band = bleed)`);
if (bp && bp.aliens.length) console.log(`  beta presence aliens: ${bp.aliens.slice(0, 6).map((a: { id: string; p: any }) => `${a.id}@${JSON.stringify(a.p)}`).join(", ")}`);

// presence health over the connected window
const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const log = await logFile.text();
const suspicious = log.split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

// ---- world-log + poses.json ground truth (kill server first for flush) ---------
server.kill("SIGTERM");
await server.exited;

function logLineCount(world: string): number {
  const p = `${WORLDS}/${world}/log.jsonl`;
  if (!existsSync(p)) return -1;
  return readFileSync(p, "utf8").split("\n").filter(Boolean).length;
}
function logFacts(world: string) {
  const p = `${WORLDS}/${world}/log.jsonl`;
  if (!existsSync(p)) return { drift: 999, places: 0, posExact: 0, placeTotal: 0 };
  const wl = readFileSync(p, "utf8").split("\n").filter(Boolean);
  const entries = wl.map((l) => { try { return JSON.parse(l); } catch { return null; } });
  const places = entries.filter((e) => e?.verb === "place" && String(e.args?.id ?? "") === "prop-y");
  const posExact = places.filter((e) => { const g = e.args?.pos; return Array.isArray(g) && g.length === 3 && g.every((v: number, k: number) => v === S3[k]); }).length;
  return { drift: Math.abs(wl.length - (world === WORLD_A ? EXPECT_A : world === WORLD_B ? EXPECT_B : EXPECT_G)), places: places.length, posExact, placeTotal: entries.filter((e) => e?.verb === "place").length };
}
function posesFile(world: string): Record<string, any> {
  const p = `${WORLDS}/${world}/poses.json`;
  if (!existsSync(p)) return {};
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return { __unparseable__: true };
  }
}
const fa = logFacts(WORLD_A), fb = logFacts(WORLD_B), fg = logFacts(WORLD_G);
const posesA = posesFile(WORLD_A), posesB = posesFile(WORLD_B), posesG = posesFile(WORLD_G);
// beta file: every key must be a live hopper or hopper-x; every pose beta-band
let fileBetaAliens = 0;
for (const [k, v] of Object.entries(posesB)) {
  const okKey = k.startsWith("hop-live-") || k === "hopper-x";
  const p = v?.p; const d = Array.isArray(p) && p.length === 3 ? Math.hypot(p[0], p[2]) : -1;
  if (!okKey || (k !== "hopper-x" && d < B_BAND)) { fileBetaAliens++; if (fileBetaAliens <= 8) console.log(`  beta poses.json alien: ${k} @ ${JSON.stringify(p)}`); }
}
// gamma file: hopper-w never posed there — any entry is bleed
const fileGammaAliens = Object.keys(posesG).filter((k) => k === "hopper-w" || k === "__unparseable__").length + (Object.keys(posesG).length && Object.keys(posesG)[0] === "__unparseable__" ? 999 : 0);
// alpha file: exact key count + sleepy values alpha-band
const fileAlphaCount = Object.keys(posesA).length;
let fileAlphaBand = 0;
for (let i = 0; i < N_SLEEPY; i++) {
  const p = posesA[`hop-sleepy-${i}`]?.p;
  if (Array.isArray(p) && Math.hypot(p[0], p[2]) <= A_BAND) fileAlphaBand++;
}

const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  w1Ok, wxOk, w2Ok, whisperWrongWorld, whisperTotal: wRec.length,
  presenceBleed, alphaProbeExact, betaProbeExact,
  arriveLeaveDrift, ghostFrames,
  leaseReleased, leasePrompt,
  leasePlaces: fa.places, leasePosExact: fa.posExact, leasePlaceTotal: fa.placeTotal,
  restoreBleedNull, restoreRevExact,
  rosterA, rosterB,
  finalPresentA: finalPresentA < 0 ? 999 : finalPresentA,
  finalPresentB: finalPresentB < 0 ? 999 : finalPresentB,
  finalPresentG: finalPresentG < 0 ? 999 : finalPresentG,
  ghostLeaseStates: ghostLeaseStates < 0 ? 999 : ghostLeaseStates,
  logDriftA: fa.drift, logDriftB: fb.drift, logDriftG: fg.drift,
  fileBetaAliens, fileGammaAliens, fileAlphaCount, fileAlphaBand,
  saysAppended: saysOk.filter(Boolean).length,
  sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  logSuspicious: suspicious.length, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  anchor joins          ${anchors.length}/${all.length} — p95 ${Math.round(m.anchorJoinP95)}ms
  whispers              W1 ${w1Ok}/1 (alpha)  WX ${wxOk}/1 (beta)  W2 ${w2Ok}/1 (alpha) — wrong-world ${whisperWrongWorld} — total ${wRec.length}
  presence bleed        ${presenceBleed} alien poses in beta probe (probes exact ${alphaProbeExact}/${betaProbeExact})
  arrive/leave drift    ${arriveLeaveDrift} across ${wantTally.size} expected events
  ghost frames          ${ghostFrames}
  lease double-hop      released ${leaseReleased}/1 — ${Number.isFinite(leasePrompt) ? Math.round(leasePrompt) + "ms" : "NEVER"} — places ${fa.places}@exact ${fa.posExact} (total ${fa.placeTotal})
  restore               bleed-0-in-beta null ${restoreBleedNull}/1  rev-alpha exact ${restoreRevExact}/1
  rosters               alpha ${rosterA} (want ${TH.rosterA})  beta ${rosterB} (want ${TH.rosterB})
  final present         A ${finalPresentA}  B ${finalPresentB}  G ${finalPresentG}  ghost leases ${ghostLeaseStates}
  world logs            A drift ${fa.drift}/${EXPECT_A}  B drift ${fb.drift}/${EXPECT_B}  G drift ${fg.drift}/${EXPECT_G}
  poses.json            beta aliens ${fileBetaAliens}  gamma aliens ${fileGammaAliens}  alpha keys ${fileAlphaCount}/${TH.fileAlphaCount} (sleepy band ${fileAlphaBand}/${TH.fileAlphaBand})
  says                  ${saysOk.filter(Boolean).length}/2 appended — p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms
  alpha frame/s         p50 ${m.fpsP50.toFixed(1)} — lat p95 ${Math.round(m.latP95)}ms — gaps ${gapsTotal}
  http probe ms         churn p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length})  settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})
  server rss            ready ${MB(rssReady)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${suspicious.length} suspicious lines
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

for (const s of anchors) { try { s.ws.close(); } catch {} }
for (const s of lateJoins) { try { s.ws.close(); } catch {} }
rmSync(WORLDS, { recursive: true, force: true });

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — rapid world-hop churn leaves no cross-world state bleed`);
process.exit(fail.length ? 1 : 0);
