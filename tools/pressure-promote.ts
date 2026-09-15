// Pressure scenario 15: SPECTATOR-PERFORMER PROMOTION UNDER LOAD — role change
// is atomic. Design target: 24 embodied performers + up to 200 spectators; a
// spectator becoming a performer (and back) is a LIVE-SOCKET role change: the
// client re-sends `join` (the travel path against the SAME world), the old
// role's durable acts run under the OLD flag (demotion: settle leases,
// rememberPose, broadcast leave), then the flag flips and the new role's acts
// run (promotion: arrive, held-whisper delivery, restore, presence frames).
// All synchronous — the atomicity claim this scenario falsifies is that no
// observable intermediate state exists: no window where a leg is BOTH present
// (double-counted roster) or NEITHER (missing arrive/leave/frames), no state
// bleed (pose restored into the wrong role, whispers delivered to a
// spectator, verbs authored by one), and no fairness cost to the 200-socket
// population while it happens 136 times.
//
// Population (pinned before measuring — 200 peak concurrent sockets):
//   SEER spec-0 (spectator, tally witness, connected FIRST)
//   24 perf-* embodied @15Hz, never change role (the show)
//   95 spec-1..95 pure spectators, never change role
//   48 promo-* join t+0 as SPECTATORS:
//     promo-0..23   promote t+4.0 (20ms stagger) -> demote t+8.0 -> re-promote
//                   t+10.5 (full P->S->P cycle on one socket)
//     promo-0..3    NOISY: keep posing @10Hz for 2s after demotion — a naive
//                   client; the server must drop those poses SILENTLY (no
//                   error amplification, never a frame)
//     promo-24..31  promote t+4.0, stay embodied
//     promo-32..39  promote t+4.0, then t+11.0 EIGHT FRESH SOCKETS join
//                   embodied under the SAME ids while the old sockets are
//                   still live — identity takeover (old kicked 4002,
//                   superseded: no leave broadcast, re-arrival only)
//     promo-40..47  promote t+4.0, stay embodied
//   24 late-spec-* join t+9 as spectators, ALL promote t+10.0 (spike);
//     late-0..7 demote t+12.0, re-promote t+13.0
//   promo-7 holds a prop lease across its demotion (t+6.2 claim, 3 states) —
//     demotion must settle it exactly once at the last streamed state.
//
// Role seams under falsification (server.ts / verbs.ts):
//   R1 verb authority flips with the flag: say as spectator -> exact refusal
//      "spectators can't author — join embodied to build"; same socket, same
//      id, seconds apart, embodied say appends.
//   R2 whisper eligibility: whispers target EMBODIED legs only — a whisper to
//      a (demoted) spectator is HELD and delivers at the promotion join,
//      exactly once, never to a spectator; a spectator SENDING a whisper is
//      silently dropped.
//   R3 pose intake: spectator poses drop silently (no error, never a frame).
//   R4 demotion snapshot: restore === null; re-promotion snapshot: restore ==
//      last remembered pose (sleep where you stood works through role cycles).
//   R5 gen strictly increases across every re-join (B2 session generations).
//   R6 takeover of a promoted leg: arrive without leave, roster never >1 body
//      per id (maxPresent <= 96), kicked socket 4002, no double rememberPose.
//   R7 arrive/leave arithmetic EXACT per (id): 112 arrives / 128 leaves.
//   R8 lease held across demotion settles promptly, once, at exact last state.
//   R9 fairness: fps/lat/gaps/probes/RSS/say-lat under the full churn.
//
// Phases (t0 = anchor batch):
//   t+3.5  promo-10 say -> refused (spectator)
//   t+3.8  perf-1 whisper W1 -> promo-20 (spectator: HELD + "isn't here")
//   t+3.9  promo-22 (spectator) whisper attempt -> silent drop
//   t+4.0  WAVE P1: 48 promotions (20ms stagger); posing @10Hz from t+4.2
//   t+4.5  promo-10 say S1 -> appended
//   t+5.8  perf-0 spawns prop-z
//   t+6.2  promo-7 claims prop-z; states t+6.4/6.6/6.8 (sZ last)
//   t+8.0  WAVE D1: promo-0..23 demote (20ms stagger); promo-7's lease settles
//   t+8.5  promo-10 say -> refused again; perf-2 whisper W2 -> promo-21 HELD
//   t+9.0  24 late-spec joins (fresh sockets, spectators)
//   t+10.0 WAVE P2: 24 late promotions (spike)
//   t+10.5 WAVE R1: promo-0..23 re-promote; promo-5 restore ~= last pose
//   t+11.0 DUEL: 8 fresh embodied sockets take over promo-32..39 ids
//   t+11.05 late-spec-10 say S2 -> appended
//   t+12.0 WAVE D2: late-0..7 demote
//   t+12.5 late-spec-2 say -> refused; late-spec-8 whisper W3 -> late-spec-5
//          (demoted: HELD)
//   t+13.0 WAVE R2: late-0..7 re-promote; W3 delivers
//   t+14.0 perf-5 say S3 (fairness at peak: 96 embodied posing)
//   t+15.0 CENSUS probe: present == exact 96-id set, "96 present, 97 watching"
//   t+18.0 TEARDOWN (SEER closes last at t+18.6 so all 96 leaves are observed)
//   t+23.0 FINAL probe: present == 0
//   post   server killed; log.jsonl == 6 lines (genesis, grant, say x3, place
//          x1 at exact sZ); poses.json == 96 keys, all alpha-band, no spec-*
//
// Acceptance gates (pinned before measuring — see TH):
//   SERVER_DIR=/tmp/pressure15-tree PORT=8982 bun tools/pressure-promote.ts
//   SELFTEST=1 bun tools/pressure-promote.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure15-tree";
const PORT = Number(process.env.PORT ?? 8982);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure15-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "alpha";
const N_PERF = 24, N_SPEC = 95, N_PROMO = 48, N_LATE = 24, N_DUEL = 8;
const PERF_HZ = 15, POSE_HZ = 10;
const STAGGER = 20;
const SAY1_AT = 3_500, W1_AT = 3_800, WSEND_AT = 3_900;
const P1_AT = 4_000, POSE_FROM = 4_200;
const S1_AT = 4_500, SPAWN_AT = 5_800, CLAIM_AT = 6_200;
const D1_AT = 8_000, NOISY_END = 10_000;
const SAY2_AT = 8_500, W2_AT = 8_500;
const LATE_AT = 9_000, P2_AT = 10_000, R1_AT = 10_500;
const DUEL_AT = 11_000, S2_AT = 11_050;
const D2_AT = 12_000, SAY3_AT = 12_500, W3_AT = 12_500, R2_AT = 13_000;
const S3_AT = 14_000, CENSUS_AT = 15_000;
const TEARDOWN_AT = 18_000, SEER_CLOSE_AT = 18_600, FINAL_AT = 23_000, DURATION = 26_000;
const TALLY_CUTOFF = 18_450;      // observed events must land before the seer closes
const MSG_RATE = "600";           // same scratch envelope as pressure-1..14
const SELFTEST = process.env.SELFTEST === "1";
// coordinate band: everyone walks r<=10; poses.json keys must all be r<=11
const BAND = 11;
// prop-z lease states; settle must commit at the LAST streamed state, once
const P_Z = [25, 0, -25] as const;
const S1_Z = [24.5, 0, -25] as const;
const S2_Z = [24.6, 0, -25.2] as const;
const SZ = [24.7, 0, -25.3] as const;
// expected world-log lines (ground truth): genesis + grant + spawn + place + say x3
const EXPECT_LOG = 7;
// poses.json after teardown: every embodied id (perf 24 + promo 48 + late 24)
const EXPECT_POSES = N_PERF + N_PROMO + N_LATE;   // 96
const REFUSAL = "spectators can't author — join embodied to build";

const TH = {
  anchorFailed: 0, anchorJoinP95Ms: 3_000,
  freshJoinP95Ms: 3_000, rejoinP95Ms: 1_500,
  sayRefusals: 3, sayRefusalMisses: 0, unexpectedErrors: 0,
  saysAppended: 3, sayP95Ms: 500,
  whisperDelivered: 3, whisperWrongTime: 0, whisperTotal: 3,
  spectatorSendSilent: 1, notHereMissing: 0, notHereExtra: 0,
  arriveLeaveDrift: 0,
  ghostFrames: 0,
  frameWindowA: N_PROMO, frameWindowB: N_PROMO + N_LATE,
  noisyErrors: 0, noisyFrames: 0,
  demoteRestoreNull: 24, rePromoteRestoreExact: 1,
  genViolations: 0, selfPresent: 0,
  censusExact: 1, censusDup: 0, censusLine: 1, maxPresent: N_PERF + N_PROMO + N_LATE,
  takeoverKicked: 8,
  leaseReleased: 1, leasePromptMs: 500, leasePlaces: 1, leasePosExact: 1, placeTotal: 1,
  logDrift: 0, posesKeys: EXPECT_POSES, posesAliens: 0,
  finalPresent: 0,
  fpsP50: 12, latP95Ms: 250, seqGaps: 0,
  probeStormP95Ms: 500, probeSettledP95Ms: 100,
  logSuspicious: 0, rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number;
  freshJoinP95: number; rejoinP95: number; rejoinCount: number;
  sayRefusals: number; sayRefusalMisses: number; unexpectedErrors: number;
  saysAppended: number; sayP95: number;
  whisperOk: number; whisperWrongTime: number; whisperTotal: number;
  spectatorSendSilent: number; notHereMissing: number; notHereExtra: number;
  arriveLeaveDrift: number;
  ghostFrames: number;
  frameWindowA: number; frameWindowB: number;
  noisyErrors: number; noisyFrames: number;
  demoteRestoreNull: number; rePromoteRestoreExact: number;
  genViolations: number; selfPresent: number;
  censusExact: number; censusDup: number; censusLine: number; maxPresent: number;
  takeoverKicked: number;
  leaseReleased: number; leasePrompt: number;
  leasePlaces: number; leasePosExact: number; placeTotal: number;
  logDrift: number; posesKeys: number; posesAliens: number;
  finalPresent: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeSettledP95: number;
  logSuspicious: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > TH.anchorFailed) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.freshJoinP95 > TH.freshJoinP95Ms) fail.push(`fresh-join p95 ${Math.round(m.freshJoinP95)}ms > ${TH.freshJoinP95Ms}ms`);
  if (m.rejoinP95 > TH.rejoinP95Ms) fail.push(`role-change rejoin p95 ${Math.round(m.rejoinP95)}ms > ${TH.rejoinP95Ms}ms (n=${m.rejoinCount})`);
  if (m.sayRefusals !== TH.sayRefusals) fail.push(`spectator say refusals ${m.sayRefusals} != ${TH.sayRefusals} — authority did not flip with the role`);
  if (m.sayRefusalMisses > TH.sayRefusalMisses) fail.push(`${m.sayRefusalMisses} refusal(s) with the WRONG error string`);
  if (m.unexpectedErrors > TH.unexpectedErrors) fail.push(`${m.unexpectedErrors} unexpected error message(s) — silent paths became loud or new refusals appeared`);
  if (m.saysAppended < TH.saysAppended) fail.push(`embodied says appended ${m.saysAppended}/${TH.saysAppended} — promotion did not grant authorship`);
  if (m.sayP95 > TH.sayP95Ms) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.whisperOk < TH.whisperDelivered) fail.push(`held whispers delivered-at-promotion ${m.whisperOk}/${TH.whisperDelivered}`);
  if (m.whisperWrongTime > TH.whisperWrongTime) fail.push(`${m.whisperWrongTime} whisper(s) delivered while the recipient was a spectator`);
  if (m.whisperTotal !== TH.whisperTotal) fail.push(`whisper receipts total ${m.whisperTotal} != ${TH.whisperTotal} — duplicated or lost private messages`);
  if (m.spectatorSendSilent < TH.spectatorSendSilent) fail.push(`spectator whisper send was not silent (echo or error returned)`);
  if (m.notHereMissing > TH.notHereMissing) fail.push(`${m.notHereMissing} expected "isn't here" hold notice(s) MISSING — hold path broke`);
  if (m.notHereExtra > TH.notHereExtra) fail.push(`${m.notHereExtra} unexpected "isn't here" notice(s) — whisper delivered AND held, or new hold sources`);
  if (m.arriveLeaveDrift > TH.arriveLeaveDrift) fail.push(`arrive/leave tally drift ${m.arriveLeaveDrift} — a role change lost or doubled a presence event`);
  if (m.ghostFrames > TH.ghostFrames) fail.push(`${m.ghostFrames} frames carried a body while it was a spectator — presence plane leaked across the role change`);
  if (m.frameWindowA < TH.frameWindowA) fail.push(`promoted legs riding frames in window A ${m.frameWindowA}/${TH.frameWindowA} — promotion never reached the presence plane`);
  if (m.frameWindowB < TH.frameWindowB) fail.push(`embodied legs riding frames in window B ${m.frameWindowB}/${TH.frameWindowB}`);
  if (m.noisyErrors > TH.noisyErrors) fail.push(`${m.noisyErrors} error(s) sent to noisy demoted legs — spectator pose drop is no longer silent`);
  if (m.noisyFrames > TH.noisyFrames) fail.push(`${m.noisyFrames} frame(s) carried a noisy demoted leg's pose`);
  if (m.demoteRestoreNull < TH.demoteRestoreNull) fail.push(`demotion snapshots with restore===null ${m.demoteRestoreNull}/${TH.demoteRestoreNull} — a spectator was offered a wake pose`);
  if (m.rePromoteRestoreExact < TH.rePromoteRestoreExact) fail.push(`re-promotion restore != last remembered pose — sleep-where-you-stood broke across the role cycle`);
  if (m.genViolations > TH.genViolations) fail.push(`${m.genViolations} gen monotonicity violations across re-joins`);
  if (m.selfPresent > TH.selfPresent) fail.push(`${m.selfPresent} snapshot(s) listed the joiner in its own present[] roster`);
  if (m.censusExact < TH.censusExact) fail.push(`census present set not exact at peak (ghosts, dups, or missing bodies)`);
  if (m.censusDup > TH.censusDup) fail.push(`${m.censusDup} duplicate ids in one census present[] — two bodies for one identity`);
  if (m.censusLine < TH.censusLine) fail.push(`server census line at t+15s did not read "${TH.maxPresent} present, ${TH.maxPresent + 1} watching"`);
  if (m.maxPresent > TH.maxPresent) fail.push(`max present in server log ${m.maxPresent} > ${TH.maxPresent} — a role change double-counted a body`);
  if (m.takeoverKicked < TH.takeoverKicked) fail.push(`fresh-socket takeover kicked ${m.takeoverKicked}/${TH.takeoverKicked} old sessions with 4002`);
  if (m.leaseReleased < TH.leaseReleased) fail.push(`lease held across demotion released ${m.leaseReleased}/1 — demotion did not settle it`);
  if (m.leasePrompt > TH.leasePromptMs) fail.push(`lease release latency ${Math.round(m.leasePrompt)}ms > ${TH.leasePromptMs}ms`);
  if (m.leasePlaces < TH.leasePlaces) fail.push(`prop-z place commits ${m.leasePlaces}/1 in world log`);
  if (m.leasePosExact < TH.leasePosExact) fail.push(`lease settled at exact last streamed sZ ${m.leasePosExact}/1`);
  if (m.placeTotal !== TH.placeTotal) fail.push(`place verb total ${m.placeTotal} != ${TH.placeTotal} — settled twice or never`);
  if (m.logDrift > TH.logDrift) fail.push(`world log line drift ${m.logDrift} (want ${EXPECT_LOG})`);
  if (m.posesKeys !== TH.posesKeys) fail.push(`poses.json keys ${m.posesKeys} != ${TH.posesKeys} — a role cycle lost or duplicated a remembered body`);
  if (m.posesAliens > TH.posesAliens) fail.push(`${m.posesAliens} alien poses.json entries (out-of-band coords or never-embodied ids)`);
  if (m.finalPresent > TH.finalPresent) fail.push(`final present ${m.finalPresent} — world not empty after teardown`);
  if (m.fpsP50 < TH.fpsP50) fail.push(`seer fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
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
    anchorFailed: 0, anchorJoinP95: 38,
    freshJoinP95: 21, rejoinP95: 6, rejoinCount: 136,
    sayRefusals: 3, sayRefusalMisses: 0, unexpectedErrors: 0,
    saysAppended: 3, sayP95: 9,
    whisperOk: 3, whisperWrongTime: 0, whisperTotal: 3,
    spectatorSendSilent: 1, notHereMissing: 0, notHereExtra: 0,
    arriveLeaveDrift: 0,
    ghostFrames: 0,
    frameWindowA: 48, frameWindowB: 72,
    noisyErrors: 0, noisyFrames: 0,
    demoteRestoreNull: 24, rePromoteRestoreExact: 1,
    genViolations: 0, selfPresent: 0,
    censusExact: 1, censusDup: 0, censusLine: 1, maxPresent: 96,
    takeoverKicked: 8,
    leaseReleased: 1, leasePrompt: 8,
    leasePlaces: 1, leasePosExact: 1, placeTotal: 1,
    logDrift: 0, posesKeys: 96, posesAliens: 0,
    finalPresent: 0,
    fpsP50: 14.9, latP95: 11, gaps: 0,
    probeStormP95: 6, probeSettledP95: 2,
    logSuspicious: 0, rssPeakGrowth: 14,
  };
  const breached: Measurements = {
    ...healthy,
    anchorFailed: 4, anchorJoinP95: 4_100,
    freshJoinP95: 3_800, rejoinP95: 2_400, rejoinCount: 131,
    sayRefusals: 1, sayRefusalMisses: 2, unexpectedErrors: 5,
    saysAppended: 1, sayP95: 900,
    whisperOk: 1, whisperWrongTime: 2, whisperTotal: 5,
    spectatorSendSilent: 0, notHereMissing: 2, notHereExtra: 1,
    arriveLeaveDrift: 7,
    ghostFrames: 11,
    frameWindowA: 39, frameWindowB: 60,
    noisyErrors: 19, noisyFrames: 4,
    demoteRestoreNull: 18, rePromoteRestoreExact: 0,
    genViolations: 3, selfPresent: 2,
    censusExact: 0, censusDup: 1, censusLine: 0, maxPresent: 104,
    takeoverKicked: 5,
    leaseReleased: 0, leasePrompt: 3_100,
    leasePlaces: 0, leasePosExact: 0, placeTotal: 2,
    logDrift: 3, posesKeys: 88, posesAliens: 6,
    finalPresent: 3,
    fpsP50: 8, latP95: 420, gaps: 4,
    probeStormP95: 900, probeSettledP95: 300,
    logSuspicious: 4, rssPeakGrowth: 95,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["anchor connections failed", "anchor join p95", "fresh-join p95", "role-change rejoin p95", "authority did not flip", "WRONG error string", "unexpected error message", "did not grant authorship", "say author p95", "delivered-at-promotion", "while the recipient was a spectator", "duplicated or lost private", "was not silent", "hold notice(s) MISSING", "unexpected \"isn't here\" notice", "arrive/leave tally drift", "presence plane leaked", "window A", "window B", "no longer silent", "noisy demoted leg", "was offered a wake pose", "sleep-where-you-stood", "gen monotonicity", "own present[] roster", "census present set", "duplicate ids in one census", "census line at t+15s", "double-counted a body", "old sessions with 4002", "demotion did not settle", "release latency", "place commits", "exact last streamed sZ", "settled twice or never", "world log line drift", "remembered body", "alien poses.json", "world not empty", "seer fps p50", "frame latency p95", "seq gaps", "churn-window HTTP", "post-teardown HTTP", "suspicious server log", "RSS peak growth"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${PERF_HZ}Hz + ${N_SPEC + 1} spec + ${N_PROMO} promo (join spectator, P1 promote t+${P1_AT / 1000}s x48, D1 demote t+${D1_AT / 1000}s x24 incl 4 noisy posers, R1 re-promote t+${R1_AT / 1000}s) + ${N_LATE} late (join t+${LATE_AT / 1000}s, spike-promote t+${P2_AT / 1000}s, x8 demote/re-promote t+${D2_AT / 1000}/${R2_AT / 1000}s) + ${N_DUEL} fresh-socket takeovers of live promoted ids t+${DUEL_AT / 1000}s = 200 peak sockets, 96 embodied peak. ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: refusals=3@exact-string says=3@p95<${TH.sayP95Ms}ms whispers=3 exactly-once-at-promotion wrong-time=0 silent-spectator-send=1 tally-drift=0 ghosts=0 noisy=0err/0frames restoreNull=24/24 restoreExact=1 genViolations=0 census=exact-96/"96 present, 97 watching" maxPresent<=96 kicks=8@4002 lease=1-release<=${TH.leasePromptMs}ms@exact-sZ-once log=${EXPECT_LOG} poses=96/band/no-spec finals=0 fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps=0 probes<${TH.probeStormP95Ms}/${TH.probeSettledP95Ms}ms suspicious=0 rss<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-promote.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure15-server-${Date.now()}.log`;
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
  ws: WebSocket; id: string; world: string; emb: boolean; noisy: boolean;
  joinMs: number; openAt: number; closed: boolean; closeCode: number;
  snaps: { t: number; gen: number; restore: any; presentCount: number; selfPresent: boolean }[];
  lastSnapT: number;
  frames: number; gaps: number; lastSeq: number; lat: number[];
  arrives: { id: string; at: number }[]; leaves: { id: string; at: number }[];
  frameIds: { id: string; at: number }[];
  leaseEvents: { op: string; id: string; at: number }[];
  whispers: { text: string; from: string; at: number; echo: boolean }[];
  sayEcho: Map<string, number>; errs: { at: number; text: string }[];
};
function connect(id: string, world: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, world, emb: !spectate, noisy: false, joinMs: -1, openAt: performance.now(), closed: false, closeCode: 0,
      snaps: [], lastSnapT: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [],
      arrives: [], leaves: [], frameIds: [], leaseEvents: [], whispers: [], sayEcho: new Map(), errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        const now = performance.now();
        if (s.joinMs < 0) s.joinMs = now;
        s.lastSnapT = now;
        s.snaps.push({ t: now - t0, gen: Number(m.gen ?? 0), restore: m.restore ?? null,
          presentCount: (m.present ?? []).length,
          selfPresent: (m.present ?? []).some((o: any) => String(o.id ?? "") === id) });
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++; s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
        for (const k of Object.keys(m.poses ?? {})) s.frameIds.push({ id: k, at: performance.now() - t0 });
      } else if (m.type === "arrive") s.arrives.push({ id: String(m.id ?? ""), at: performance.now() - t0 });
      else if (m.type === "leave") s.leaves.push({ id: String(m.id ?? ""), at: performance.now() - t0 });
      else if (m.type === "lease") s.leaseEvents.push({ op: String(m.op ?? ""), id: String(m.id ?? ""), at: performance.now() - t0 });
      else if (m.type === "whisper") s.whispers.push({ text: String(m.text ?? ""), from: String(m.from ?? ""), at: performance.now() - t0, echo: !!m.echo });
      else if (m.type === "log" && m.entry?.verb === "say") { if (!s.sayEcho.has(m.entry.args?.text)) s.sayEcho.set(m.entry.args?.text, performance.now()); }
      else if (m.type === "error") s.errs.push({ at: performance.now() - t0, text: String(m.error ?? "") });
    };
    ws.onclose = (ev: any) => { s.closed = true; s.closeCode = Number(ev?.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}
// Role change on the LIVE socket: re-send `join` with the new spectate flag.
// Resolves with the rejoin latency (send -> fresh snapshot), or -1.
function rejoin(s: Spec, spectate: boolean): Promise<number> {
  return new Promise((resolve) => {
    const prev = s.lastSnapT;
    const sent = performance.now();
    const iv = setInterval(() => {
      if (s.lastSnapT !== prev) { clearInterval(iv); resolve(performance.now() - sent); }
      else if (s.closed) { clearInterval(iv); resolve(-1); }
    }, 10);
    setTimeout(() => { clearInterval(iv); resolve(-1); }, 10_000);
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "join", world: s.world, id: s.id, avatar: "x.vrm", spectate, token: TOKEN }));
    else { clearInterval(iv); resolve(-1); }
  });
}

// ---- anchor population --------------------------------------------------------
// SEER FIRST: it must be connected before any leg arrives, so the presence
// tallies are deterministic (every post-t0 arrive/leave is observed).
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const SEER = await connect(`spec-0`, WORLD, true);
const all = await Promise.allSettled([
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i + 1}`, WORLD, true)),
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, WORLD, false, i)),
  ...Array.from({ length: N_PROMO }, (_, i) => connect(`promo-${i}`, WORLD, true, 100 + i)),
]);
const anchors = [SEER, ...all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec)];
const anchorFailed = all.length - (anchors.length - 1);
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const promos = anchors.filter((s) => s.id.startsWith("promo-"));
const joinTimes = anchors.map((s) => s.joinMs >= 0 ? s.joinMs : 1);
console.log(`t+0: anchors joined ${anchors.length}/${all.length + 1} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// ---- presence tickers ---------------------------------------------------------
let running = true;
const tickers: any[] = [];
const lastPose = new Map<string, number[]>();
const walk = (i: number, t: number, r: number) => [Math.sin(t * 0.5 + i) * r, 0, Math.cos(t * 0.5 + i) * r] as number[];
const sendPose = (s: Spec, p: number[]) => {
  if (s.ws.readyState !== 1) return;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p, yaw: (Date.now() / 1000 + p[0]) % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
};
for (const s of perfs) {
  const i = Number(s.id.slice(5));
  tickers.push(setInterval(() => { if (running) { const p = walk(i, Date.now() / 1000, 10); lastPose.set(s.id, p); sendPose(s, p); } }, 1000 / PERF_HZ));
}
// promo + late legs pose @10Hz while embodied (or, for the 4 noisy legs, for
// 2s after demotion — the naive client whose poses must drop silently)
const poseWhileActive = (s: Spec, i: number) => {
  if (!running) return;
  const noisyOk = s.noisy && (performance.now() - t0) < NOISY_END;
  if (!s.emb && !noisyOk) return;
  const p = walk(i, Date.now() / 1000, 8.6);
  lastPose.set(s.id, p);
  sendPose(s, p);
};
for (const s of promos) {
  const i = Number(s.id.slice(6));
  if (i < 4) s.noisy = true;
  tickers.push(setInterval(() => poseWhileActive(s, i), 1000 / POSE_HZ));
}

// HTTP event-loop probes
const probeStorm: number[] = [], probeSettled: number[] = [];
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); } catch { /* counted by absence */ }
  (performance.now() - t0 < TEARDOWN_AT ? probeStorm : probeSettled).push(performance.now() - t);
}, 500);
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN, settled: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- role-change waves --------------------------------------------------------
const rejoinMs: number[] = [];
const promoteT = new Map<string, number>();   // id -> t0-rel ts of its LATEST promotion completion
const markPromoted = (s: Spec) => promoteT.set(s.id, performance.now() - t0);
// WAVE P1: all 48 promo legs promote (20ms stagger)
for (const s of promos) {
  const i = Number(s.id.slice(6));
  at(P1_AT + i * STAGGER, async () => { const ms = await rejoin(s, false); if (ms > 0) rejoinMs.push(ms); s.emb = true; markPromoted(s); });
}
// WAVE D1: promo-0..23 demote (the 4 noisy keep posing via the ticker)
const demoteSnaps: { id: string; restore: any }[] = [];
for (const s of promos) {
  const i = Number(s.id.slice(6));
  if (i >= 24) continue;
  at(D1_AT + i * STAGGER, async () => {
    const ms = await rejoin(s, true); if (ms > 0) rejoinMs.push(ms);
    s.emb = false;
    // `?? "NOSNAP"` would swallow a legit null restore — keep null verbatim
    const snap = s.snaps[s.snaps.length - 1];
    demoteSnaps.push({ id: s.id, restore: snap ? snap.restore : "NOSNAP" });
  });
}
// WAVE R1: promo-0..23 re-promote (full P->S->P cycle on one socket)
let r1Restore: any = "UNSET";
let r1Baseline = new Map<string, number[]>();   // frozen at D1 (poses frozen while demoted)
for (const s of promos) {
  const i = Number(s.id.slice(6));
  if (i >= 24) continue;
  at(R1_AT + i * STAGGER, async () => {
    const ms = await rejoin(s, false); if (ms > 0) rejoinMs.push(ms);
    s.emb = true; markPromoted(s);
    if (s.id === "promo-5") r1Restore = s.snaps[s.snaps.length - 1]?.restore ?? "UNSET";
  });
}
// late-spec joins (t+9) then synchronized promotions (t+10)
const lateJoins: Spec[] = [];
for (let j = 0; j < N_LATE; j++) {
  at(LATE_AT + j * STAGGER, async () => {
    try { const s = await connect(`late-spec-${j}`, WORLD, true, 300 + j); lateJoins.push(s);
      const i = 200 + j;
      tickers.push(setInterval(() => poseWhileActive(s, i), 1000 / POSE_HZ));
    } catch { /* counted by fresh-join gate */ }
  });
}
for (let j = 0; j < N_LATE; j++) {
  at(P2_AT + j * STAGGER, async () => {
    const s = lateJoins[j]; if (!s) return;
    const ms = await rejoin(s, false); if (ms > 0) rejoinMs.push(ms);
    s.emb = true; markPromoted(s);
  });
}
// WAVE D2 + R2 on late-0..7
for (let j = 0; j < 8; j++) {
  at(D2_AT + j * STAGGER, async () => {
    const s = lateJoins[j]; if (!s) return;
    const ms = await rejoin(s, true); if (ms > 0) rejoinMs.push(ms);
    s.emb = false;
    const snap = s.snaps[s.snaps.length - 1];
    demoteSnaps.push({ id: s.id, restore: snap ? snap.restore : "NOSNAP" });
  });
  at(R2_AT + j * STAGGER, async () => { const s = lateJoins[j]; if (!s) return; const ms = await rejoin(s, false); if (ms > 0) rejoinMs.push(ms); s.emb = true; markPromoted(s); });
}// DUEL: 8 fresh embodied sockets take over the LIVE promoted ids promo-32..39
const duelLegs: Spec[] = [];
for (let k = 0; k < N_DUEL; k++) {
  at(DUEL_AT + k * 25, async () => {
    try {
      const s = await connect(`promo-${32 + k}`, WORLD, false, 400 + k);
      duelLegs.push(s);
      const i = 32 + k;
      tickers.push(setInterval(() => poseWhileActive(s, i), 1000 / POSE_HZ));
    } catch { /* counted by takeover gates */ }
  });
}

// ---- authority-flip probes (say / whisper) -------------------------------------
const SAY1 = `p15-say1-${Math.floor(t0)}`, SAY2 = `p15-say2-${Math.floor(t0)}`, SAY3 = `p15-say3-${Math.floor(t0)}`;
const saySent = new Map<string, number>();
const sendSay = (s: Spec | undefined, text: string) => {
  if (!s || s.ws.readyState !== 1) return;
  saySent.set(text, performance.now() - t0);
  s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
};
at(SAY1_AT, () => sendSay(promos[10], "refusal-probe-1"));           // spectator -> refused
at(S1_AT, () => sendSay(promos[10], SAY1));                          // promoted -> appended
at(SAY2_AT, () => sendSay(promos[10], "refusal-probe-2"));           // demoted -> refused
at(S2_AT, () => { const s = lateJoins[10]; if (s) sendSay(s, SAY2); }); // late promoted -> appended
at(SAY3_AT, () => { const s = lateJoins[2]; if (s) sendSay(s, "refusal-probe-3"); }); // demoted -> refused
at(S3_AT, () => sendSay(perfs[5], SAY3));                            // fairness at peak

// whisper seams: W1/W2/W3 held while recipient is a spectator, delivered at promotion
const W1 = `p15-w1-${Math.floor(t0)}`, W2 = `p15-w2-${Math.floor(t0)}`, W3 = `p15-w3-${Math.floor(t0)}`;
at(W1_AT, () => { if (perfs[1]?.ws.readyState === 1) perfs[1].ws.send(JSON.stringify({ type: "whisper", to: "promo-20", text: W1 })); });
at(WSEND_AT, () => { if (promos[22]?.ws.readyState === 1) promos[22].ws.send(JSON.stringify({ type: "whisper", to: "perf-1", text: "spectator-send-must-drop" })); });
at(W2_AT, () => { if (perfs[2]?.ws.readyState === 1) perfs[2].ws.send(JSON.stringify({ type: "whisper", to: "promo-21", text: W2 })); });
at(W3_AT, () => { const s = lateJoins[8]; if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "whisper", to: "late-spec-5", text: W3 })); });

// ---- lease across demotion ----------------------------------------------------
at(SPAWN_AT, () => { if (perfs[0]?.ws.readyState === 1) perfs[0].ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: "prop-z", lib: "deco/bench.glb", pos: [...P_Z], yaw: 0 } })); });
at(CLAIM_AT, () => {
  const s = promos[7];
  if (s?.ws.readyState === 1 && s.emb) s.ws.send(JSON.stringify({ type: "lease", op: "claim", id: "prop-z" }));
  at(CLAIM_AT + 200, () => { if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "lease", op: "state", id: "prop-z", p: [...S1_Z] })); });
  at(CLAIM_AT + 400, () => { if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "lease", op: "state", id: "prop-z", p: [...S2_Z] })); });
  at(CLAIM_AT + 600, () => { if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "lease", op: "state", id: "prop-z", p: [...SZ] })); });
});
let demoteSendAt = Infinity;
at(D1_AT + 7 * STAGGER, () => { demoteSendAt = performance.now() - t0; }); // promo-7's demotion instant
at(D1_AT + 24 * STAGGER, () => { r1Baseline = new Map(lastPose); });      // baseline frozen after the D1 wave (poses frozen while demoted)

// ---- census + final probes ----------------------------------------------------
let censusIds: string[] | null = null;
let finalPresent = -1;
function probeJoin(pid: string): Promise<any> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(null); }, 10_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: pid, avatar: "x.vrm", spectate: true, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") { clearTimeout(to); try { ws.close(); } catch {} resolve(m); }
    };
    ws.onerror = () => { clearTimeout(to); resolve(null); };
  });
}
at(CENSUS_AT, async () => {
  const m = await probeJoin(`census-probe-${Math.floor(t0)}`);
  censusIds = m ? (m.present ?? []).map((o: any) => String(o.id ?? "")) : null;
});
at(FINAL_AT, async () => {
  const m = await probeJoin(`final-probe-${Math.floor(t0)}`);
  finalPresent = m ? (m.present ?? []).length : 999;
});

// ---- teardown -----------------------------------------------------------------
at(TEARDOWN_AT, () => {
  running = false;
  for (const s of [...anchors, ...lateJoins, ...duelLegs]) if (s !== SEER) { try { s.ws.close(); } catch {} }
});
at(SEER_CLOSE_AT, () => { try { SEER.ws.close(); } catch {} });

await sleep(DURATION);
tickers.forEach(clearInterval);
clearInterval(probeTimer); clearInterval(rssTimer);
rssSamples.settled = rss();
await sleep(300);

// ---- schedule ground truth (arrive/leave tally + embodied spans) ----------------
// Events at t+0 are EXCLUDED from the tally (they race the seer's own join in
// one connect batch — pressure-14 law); initial presence is pinned instead by
// the census-exactness gate. Takeover re-arrivals carry arrive WITHOUT leave.
type Ev = { arr?: boolean; at: number };
const sched = new Map<string, Ev[]>();
for (const s of perfs) sched.set(s.id, [{ at: TEARDOWN_AT, arr: false }]);   // close while embodied = leave
for (const s of promos) {
  const i = Number(s.id.slice(6));
  const evs: Ev[] = [{ arr: true, at: P1_AT + i * STAGGER }];
  if (i < 24) evs.push({ arr: false, at: D1_AT + i * STAGGER }, { arr: true, at: R1_AT + i * STAGGER });
  if (i >= 32 && i < 40) evs.push({ arr: true, at: DUEL_AT + (i - 32) * 25 });  // takeover: arrive, NO leave
  evs.push({ at: TEARDOWN_AT, arr: false });
  sched.set(s.id, evs);
}
for (let j = 0; j < N_LATE; j++) {
  const evs: Ev[] = [{ arr: true, at: P2_AT + j * STAGGER }];
  if (j < 8) evs.push({ arr: false, at: D2_AT + j * STAGGER }, { arr: true, at: R2_AT + j * STAGGER });
  evs.push({ at: TEARDOWN_AT, arr: false });
  sched.set(`late-spec-${j}`, evs);
}
// expected per-(id, kind) counts + embodied spans (for ghost frames)
const wantTally = new Map<string, number>();
const spans = new Map<string, { from: number; to: number }[]>();
{
  for (const [id, evs] of sched) {
    const sp: { from: number; to: number }[] = [];
    let open: number | null = null;
    for (const e of evs) {
      if (e.arr && open == null) open = e.at;
      else if (!e.arr && open != null) { sp.push({ from: open, to: e.at }); open = null; }
      if (e.at < TALLY_CUTOFF) {
        const k = `${id}|${e.arr ? "arrive" : "leave"}`;
        wantTally.set(k, (wantTally.get(k) ?? 0) + 1);
      }
    }
    if (open != null) sp.push({ from: open, to: TEARDOWN_AT });
    spans.set(id, sp);
  }
}
let arriveLeaveDrift = 0;
{
  const got = new Map<string, number>();
  for (const e of SEER.arrives) if (e.at < TALLY_CUTOFF && sched.has(e.id)) { const k = `${e.id}|arrive`; got.set(k, (got.get(k) ?? 0) + 1); }
  for (const e of SEER.leaves) if (e.at < TALLY_CUTOFF && sched.has(e.id)) { const k = `${e.id}|leave`; got.set(k, (got.get(k) ?? 0) + 1); }
  for (const [k, want] of wantTally) {
    const g = got.get(k) ?? 0;
    if (g !== want) { arriveLeaveDrift += Math.abs(g - want); if (arriveLeaveDrift <= 8) console.log(`  tally drift ${k}: got ${g} want ${want}`); }
  }
}
// ghost frames: a frame carrying id X outside its embodied spans (300ms grace
// after a span end for the in-flight dirty flush)
let ghostFrames = 0;
{
  for (const f of SEER.frameIds) {
    const sp = spans.get(f.id); if (!sp) continue;         // perf anchors span [0, teardown]
    if (f.id.startsWith("perf-")) continue;                // embodied throughout
    const present = sp.some((s) => f.at >= s.from && f.at < s.to);
    if (present) continue;
    const lastEnd = Math.max(0, ...sp.filter((s) => s.to <= f.at).map((s) => s.to));
    if (f.at > lastEnd + 300) { ghostFrames++; if (ghostFrames <= 5) console.log(`  ghost frame ${f.id} at t+${(f.at / 1000).toFixed(2)}s`); }
  }
}
// frame-window membership: promotion must actually reach the presence plane
let frameWindowA = 0, frameWindowB = 0, noisyFrames = 0;
{
  const inWin = (id: string, from: number, to: number) => SEER.frameIds.some((f) => f.id === id && f.at >= from && f.at <= to);
  for (const s of promos) if (inWin(s.id, P1_AT + 600, D1_AT - 100)) frameWindowA++;
  for (const s of promos) {
    const i = Number(s.id.slice(6));
    const from = i < 24 ? R1_AT + N_PERF * STAGGER + 600 : P1_AT + 600;
    if (inWin(s.id, from, 17_900)) frameWindowB++;
  }
  for (let j = 0; j < N_LATE; j++) if (lateJoins[j] && inWin(`late-spec-${j}`, (j < 8 ? R2_AT : P2_AT) + 600, 17_900)) frameWindowB++;
  // noisy demoted legs: zero frames between grace-end and re-promotion
  for (let i = 0; i < 4; i++) {
    if (SEER.frameIds.some((f) => f.id === `promo-${i}` && f.at > D1_AT + i * STAGGER + 400 && f.at < R1_AT + i * STAGGER)) noisyFrames++;
  }
}
// authority-flip verdicts (lateJoins carry their own refusal/hold receipts)
const sayRefusalTexts = [...anchors, ...lateJoins].flatMap((s) => s.errs.filter((e) => e.text.includes("spectators can't author")).map((e) => ({ id: s.id, at: e.at, text: e.text })));
const sayRefusals = sayRefusalTexts.length;
const sayRefusalMisses = sayRefusalTexts.filter((e) => e.text !== REFUSAL).length;
const notHereTexts = [...anchors, ...lateJoins].flatMap((s) => s.errs.filter((e) => e.text.includes("isn't here")).map((e) => ({ id: s.id, at: e.at, text: e.text })));
const notHereSenders = new Set(notHereTexts.map((e) => e.id));
const notHereMissing = 3 - [...notHereSenders].filter((id) => id === "perf-1" || id === "perf-2" || id === "late-spec-8").length;
const notHereExtra = [...notHereSenders].filter((id) => id !== "perf-1" && id !== "perf-2" && id !== "late-spec-8").length;
const expectedErrTotal = sayRefusals + notHereTexts.length;
const allErrs = [...anchors, ...lateJoins, ...duelLegs].flatMap((s) => s.errs.map((e) => ({ id: s.id, ...e })));
const unexpectedErrors = Math.max(0, allErrs.length - expectedErrTotal);
const sayLat: number[] = [];
for (const [text, sentAt] of saySent) {
  const author = [...anchors, ...lateJoins].find((s) => s.sayEcho.has(text));
  const hit = author?.sayEcho.get(text);
  if (hit !== undefined) sayLat.push(hit - sentAt);
}
const saysAppended = [SAY1, SAY2, SAY3].filter((t) => SEER.sayEcho.has(t)).length;
// whisper verdicts. A delivery is valid iff it lands inside an EMBODIED span
// of the recipient (between an arrive and the next leave, both SEER-observed
// server broadcasts) — wrong-time = delivered inside a spectator span (after
// a leave, before the next arrive). Held whispers deliver at the FIRST
// embodied join after the send (pressure-15 measured: W1 sent t+3.8 to a
// spectator delivered at the P1 promotion t+4.404 — correct; an earlier draft
// compared against the id's LATEST arrive and false-flagged exactly this).
const legs = [...anchors, ...lateJoins, ...duelLegs];
const arriveAt = new Map<string, number[]>(), leaveAt = new Map<string, number[]>();
for (const e of SEER.arrives) { const l = arriveAt.get(e.id) ?? []; l.push(e.at); arriveAt.set(e.id, l); }
for (const e of SEER.leaves) { const l = leaveAt.get(e.id) ?? []; l.push(e.at); leaveAt.set(e.id, l); }
const spectatorSpans = new Map<string, { from: number; to: number }[]>();   // (leave, next arrive)
{
  const ids = new Set([...arriveAt.keys(), ...leaveAt.keys()]);
  for (const id of ids) {
    const events = [
      ...(arriveAt.get(id) ?? []).map((at) => ({ at, arrive: true })),
      ...(leaveAt.get(id) ?? []).map((at) => ({ at, arrive: false })),
    ].sort((a, b) => a.at - b.at);
    const spans: { from: number; to: number }[] = [];
    let open: number | null = null;
    for (const e of events) { if (!e.arrive && open == null) open = e.at; else if (e.arrive && open != null) { spans.push({ from: open, to: e.at }); open = null; } }
    if (open != null) spans.push({ from: open, to: Infinity });
    spectatorSpans.set(id, spans);
  }
}
const inSpectatorSpan = (id: string, t: number) => (spectatorSpans.get(id) ?? []).some((s) => t > s.from + 50 && t < s.to - 0);
const receipts = legs.flatMap((s) => s.whispers.filter((w) => !w.echo && (w.text === W1 || w.text === W2 || w.text === W3)).map((w) => ({ ...w, id: s.id })));
const whisperTotal = receipts.length;
const whisperOk = [W1, W2, W3].filter((t) => receipts.some((x) => x.text === t && !inSpectatorSpan(x.id, x.at))).length;
const whisperWrongTime = receipts.filter((r) => {
  if (!inSpectatorSpan(r.id, r.at)) return false;
  console.log(`  whisper-timing ${r.text} -> ${r.id}: receipt t+${(r.at / 1000).toFixed(3)}s landed in a spectator span`);
  return true;
}).length;
const spectatorSendSilent = (promos[22]?.whispers.filter((w) => w.text === "spectator-send-must-drop").length ?? 1) === 0
  && !promos[22]?.errs.some((e) => e.at > WSEND_AT - 100 && e.at < WSEND_AT + 2_000) ? 1 : 0;
// noisy legs: zero errors during the noisy window
const noisyErrors = promos.slice(0, 4).flatMap((s) => s.errs.filter((e) => e.at > D1_AT && e.at < NOISY_END + 500)).length;
// restore + gen verdicts
const demoteRestoreNull = demoteSnaps.filter((d) => d.restore === null).length;
let rePromoteRestoreExact = 0;
{
  const want = r1Baseline.get("promo-5"); const got = r1Restore?.p;
  if (Array.isArray(got) && want && got.length === 3 && got.every((v: number, k: number) => Math.abs(v - want[k]) < 0.75)) rePromoteRestoreExact = 1;
  else if (r1Restore !== "UNSET") console.log(`  promo-5 re-promote restore got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
}
let genViolations = 0;
for (const s of legs) for (let i = 1; i < s.snaps.length; i++) if (s.snaps[i].gen <= s.snaps[i - 1].gen) genViolations++;
const selfPresent = legs.reduce((a, s) => a + s.snaps.filter((x) => x.selfPresent).length, 0);
// census verdicts
let censusExact = 0, censusDup = 0;
{
  const want = new Set<string>([...perfs.map((s) => s.id), ...promos.map((s) => s.id), ...Array.from({ length: N_LATE }, (_, j) => `late-spec-${j}`)]);
  if (censusIds) {
    const ids: string[] = censusIds;
    censusDup = ids.length - new Set(ids).size;
    censusExact = ids.length === want.size && [...want].every((x) => ids.includes(x)) && censusDup === 0 ? 1 : 0;
    if (!censusExact) console.log(`  census: got ${ids.length} ids (want ${want.size}), dups ${censusDup}, missing ${[...want].filter((x) => !ids.includes(x)).slice(0, 6).join(",")}, extra ${ids.filter((x) => !want.has(x)).slice(0, 6).join(",")}`);
  }
}
// takeover verdicts
const oldDuel = promos.slice(32, 40);
const takeoverKicked = oldDuel.filter((s) => s.closed && s.closeCode === 4002).length;
// lease verdicts
let leaseReleased = 0, leasePrompt = Infinity;
{
  const evs = SEER.leaseEvents.filter((e) => e.id === "prop-z" && e.op === "released" && e.at >= demoteSendAt);
  if (evs.length) { leaseReleased = 1; leasePrompt = evs[0].at - demoteSendAt; }
}
// presence health over the connected window (all clock terms in t0-relative ms)
const seerSnapT0 = SEER.snaps[0]?.t ?? 0;    // relative already (snaps store t - t0)
const seerWindow = Math.max(0.001, (SEER_CLOSE_AT - Math.max(seerSnapT0, 500) - 500) / 1000);
const fpsP50 = SEER.frames / seerWindow;
const latP95 = pct(SEER.lat, 95);
const log = await logFile.text();
const suspicious = log.split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const maxPresent = Math.max(0, ...[...log.matchAll(/(\d+) present/g)].map((x) => Number(x[1])));
// census line: the census probe's own join must log "96 present, 97 watching"
const censusLine = log.split("\n").some((l: string) => l.includes("census-probe") && l.includes(`${TH.maxPresent} present, ${TH.maxPresent + 1} watching`)) ? 1 : 0;
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

// ---- world-log + poses.json ground truth (kill server first for flush) ---------
server.kill("SIGTERM");
await server.exited;
let logDrift = 999, leasePlaces = 0, leasePosExact = 0, placeTotal = 0;
{
  const p = `${WORLDS}/${WORLD}/log.jsonl`;
  if (existsSync(p)) {
    const entries = readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } });
    logDrift = Math.abs(entries.length - EXPECT_LOG);
    const places = entries.filter((e) => e?.verb === "place" && String(e.args?.id ?? "") === "prop-z");
    leasePlaces = places.length;
    leasePosExact = places.filter((e) => { const g = e.args?.pos; return Array.isArray(g) && g.length === 3 && g.every((v: number, k: number) => v === SZ[k]); }).length;
    placeTotal = entries.filter((e) => e?.verb === "place").length;
  }
}
let posesKeys = -1, posesAliens = 999;
{
  const p = `${WORLDS}/${WORLD}/poses.json`;
  if (existsSync(p)) {
    try {
      const poses = JSON.parse(readFileSync(p, "utf8"));
      const keys = Object.keys(poses);
      posesKeys = keys.length;
      posesAliens = keys.filter((k) => {
        if (k.startsWith("spec-") || k.startsWith("census-probe") || k.startsWith("final-probe")) return true;    // never-embodied id remembered
        const d = Array.isArray(poses[k]?.p) ? Math.hypot(poses[k].p[0], poses[k].p[2]) : -1;
        return d < 0 || d > BAND;
      }).length;
    } catch { posesAliens = 999; }
  }
}

const freshJoinMs = [...lateJoins, ...duelLegs].map((s) => s.joinMs - s.openAt).filter((x) => x > 0);
const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95),
  freshJoinP95: pct(freshJoinMs, 95), rejoinP95: pct(rejoinMs, 95), rejoinCount: rejoinMs.length,
  sayRefusals, sayRefusalMisses, unexpectedErrors,
  saysAppended, sayP95: sayLat.length ? pct(sayLat, 95) : Infinity,
  whisperOk, whisperWrongTime, whisperTotal,
  spectatorSendSilent, notHereMissing, notHereExtra,
  arriveLeaveDrift,
  ghostFrames,
  frameWindowA, frameWindowB,
  noisyErrors, noisyFrames,
  demoteRestoreNull, rePromoteRestoreExact,
  genViolations, selfPresent,
  censusExact, censusDup, censusLine, maxPresent,
  takeoverKicked,
  leaseReleased, leasePrompt,
  leasePlaces, leasePosExact, placeTotal,
  logDrift, posesKeys, posesAliens,
  finalPresent: finalPresent < 0 ? 999 : finalPresent,
  fpsP50, latP95, gaps: SEER.gaps,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  logSuspicious: suspicious.length, rssPeakGrowth,
};
const fail = evaluate(m);

console.log(`
results
  anchors               ${anchors.length}/${all.length + 1} — p95 ${Math.round(m.anchorJoinP95)}ms (${anchorFailed} failed)
  fresh joins           ${freshJoinMs.length}/32 — p95 ${Math.round(m.freshJoinP95)}ms
  role changes          ${rejoinMs.length} live-socket rejoins — p95 ${Math.round(m.rejoinP95)}ms
  authority flip        refusals ${sayRefusals}/3 exact-string (misses ${sayRefusalMisses}) — embodied says ${saysAppended}/3 p95 ${sayLat.length ? Math.round(m.sayP95) : "MISSED"}ms
  whispers              delivered-at-promotion ${whisperOk}/3 — wrong-time ${whisperWrongTime} — total ${whisperTotal} — spectator-send silent ${spectatorSendSilent}/1 — hold notices sent ${notHereSenders.size}/3 (missing ${notHereMissing}, extra ${notHereExtra})
  arrive/leave drift    ${arriveLeaveDrift} across ${wantTally.size} expected events
  ghost frames          ${ghostFrames} — window A ${frameWindowA}/48 — window B ${frameWindowB}/72 — noisy ${noisyFrames} frames/${noisyErrors} errors
  restore               demote null ${demoteRestoreNull}/${demoteSnaps.length} — promo-5 re-promote exact ${rePromoteRestoreExact}/1
  gen/self              violations ${genViolations} — self-present snapshots ${selfPresent}
  census                exact ${censusExact} — dups ${censusDup} — log line "${TH.maxPresent} present, ${TH.maxPresent + 1} watching" ${censusLine}/1 — max present ${maxPresent} (<=${TH.maxPresent})
  takeover              ${takeoverKicked}/8 old sockets kicked 4002
  lease-across-demote   released ${leaseReleased}/1 — ${Number.isFinite(leasePrompt) ? Math.round(leasePrompt) + "ms" : "NEVER"} — places ${leasePlaces}@exact ${leasePosExact} (total ${placeTotal})
  world log             drift ${logDrift}/${EXPECT_LOG}
  poses.json            ${posesKeys}/${EXPECT_POSES} keys — aliens ${posesAliens}
  final present         ${finalPresent}
  seer frames           ${Math.round(fpsP50 * 10) / 10}/s — lat p95 ${Math.round(latP95)}ms — gaps ${SEER.gaps}
  http probe ms         churn p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length}) — settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})
  server rss            ready ${MB(rssReady)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB) → settled ${MB(rssSamples.settled)}MB
  server log            ${suspicious.length} suspicious lines
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
if (unexpectedErrors > 0) console.log(`unexpected errors:\n  ${allErrs.slice(0, 8).map((e) => `${e.id}@${Math.round(e.at)}: ${e.text}`).join("\n  ")}`);

for (const s of legs) { try { s.ws.close(); } catch {} }
rmSync(WORLDS, { recursive: true, force: true });

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — spectator/performer role change is atomic under load`);
process.exit(fail.length ? 1 : 0);
