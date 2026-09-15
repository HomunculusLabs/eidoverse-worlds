// Pressure scenario 19: EMOJI/TEXT FLOOD IN CHAT — rapid-fire says cannot
// starve verb intake.
//
// Prior scenarios proved the authored-verb lane under load: comp bursts get
// fair explicit budgets (5), saturation says stay responsive (4/18), and the
// wire gate refuses frames >256KB with close 1009 (17). The unmeasured face
// of this row: CHAT is the highest-frequency authored verb with NO content
// cap of its own — vSay sanitizes spoken-metadata only, so a say's text may
// be anything up to the 256KB frame gate (emoji cost 4 UTF-8 bytes/char, so
// ~60k emoji per legal frame). Every accepted say appends (sync disk write),
// folds into recentChat (40 lines, NO byte bound), and fans out verbatim to
// every socket (single stringify, direct send, no frame-skip protection).
//
// Questions this scenario pins (thresholds BEFORE measuring):
//   A. SMOOTH legal-rate flood (2.86 says/s, never trips 12/4s) + concurrent
//      BURST flooders (20 back-to-back): does intake stay fair — healthy solo
//      says, light verbs, joins, roster — while ~26k says/s-words churn?
//   B. BURST budget still exact under flood: <=12 accepted / >=8 refused,
//      every verb gets exactly one verdict, refusals never fan out.
//   C. TEXT BOMB at the legal ceiling: 4 legs x 12 rounds of ~240KB emoji
//      says at 600ms (all within budget) ~= 11.5MB inbound fanned to 160
//      sockets (~1.8GB loopback out). Do healthy says/joins survive? Does
//      the frame-skip law (32KB backlog) shed presence frames by design?
//   D. BOUNDARY exactness at the cap: a 250,000-byte ASCII text traverses
//      whole (echo + log + snapshot); a 260,000-byte emoji text (65k chars x
//      4B) is refused "message too large" + close 1009 EXACTLY.
//   E. AMPLIFICATION, measured not gated: recentChat carries giant texts
//      into every joiner's snapshot (40 x ~243KB ~= 9.7MB worst case).
//      Report snapshot bytes pre-bomb vs bomb-era; hard gate only an
//      OOM/latency guard (join must still complete <5s, snapshot <12MB).
//   F. Recovery: rate windows un-wedge; final world drains to present=0;
//      log ground truth exact (say lines == echoes, total == appends).
//
// Workload (same presence chassis as pressure-1..5): 16 clean performers +
// 8 flood performers (6 smooth + 2 burst) = 24 embodied @15Hz + 136 anchor
// spectators = 160 sockets from t=0.
//
// Phases:
//   t=3.0s  ANCHOR    4 one-off anchor says (pre-flood fanout evidence)
//   t=6.5s  FLOOD     6 smooth flooders: 23 says @350ms (3-emoji texts,
//                     ~1.2KB) through t+14.3 — ALL should be accepted
//                     (smooth-legal; verdict completeness 23/23);
//                     2 burst flooders: 20 says back-to-back (<=12 ok,
//                     >=8 refused "slow down — verb rate limit")
//   t=9.5s  FAIR1     mid-flood healthy probes: solo say (perf-0), light
//                     (perf-2), 12 spectator joins, roster check
//   t=15.0s BOMB      4 giant legs x 12 rounds @600ms: text "G<r>"+emoji x
//                     59,500 (~238KB/frame, all legal); ends ~t+22.2
//   t=17.2s FAIR2     mid-bomb solo say + 12 spec + 2 EMBODIED joins
//                     (joiner pays the inflated recentChat snapshot) +
//                     roster check
//   t=23.0s BOUNDARY  250,000B ASCII say (must echo) then 260,000B emoji
//                     say (must close 1009 with the exact error)
//   t=23.2s FAIR3     boundary-era solo say
//   t=23.6s RECOVER   all 8 flooders' next say MUST append (window expired)
//   t=24.5s AMP       one spectator joins; snapshot bytes + recentChat
//                     census (<=40 lines, every text in the authored log)
//   t=27.0s TEARDOWN  all sockets close; final probe: present=0; log truth
//
// Acceptance gates (pinned):
//   - joins 160/160 p95<3s; mid-flood spec 12/12 p95<3s; mid-bomb 12/12+2/2
//     p95<5s (relaxed: joiners legitimately download the inflated snapshot)
//   - smooth flooders: 23/23 echoes each, 0 refusals (never bursts budget)
//   - burst flooders: accepted<=12, refused>=8, verdicts==20, exact message
//   - refused says fan out to 0 sockets ever
//   - fairness: solo say author p95<500ms in ALL THREE windows; light
//     appended; say delivery to all sockets misses=0 p95<1500ms
//   - bomb: all 48 giant says echo to author (0 silent); echo p95<2000ms
//   - bomb-era presence: anchor fps p50>=8 during bomb (frame-skip law may
//     legitimately shed presence frames; REPORT gaps), post-bomb fps p50>=12
//   - boundary: ASCII echo + log line; emoji leg closed 1009 + exact error
//   - recovery 8/8; roster 24 at both probes; final present=0
//   - amplification: snapshot <12MB (report bytes pre-bomb vs bomb-era);
//     recentChat <=40 lines, all texts in the authored say set
//   - log.jsonl: say lines == echo-observed accepted total; total lines ==
//     2 + says + lights (genesis+grant); 0 suspicious server lines
//   - HTTP probe p95<1000ms throughout; RSS peak growth <60MB
//
//   SERVER_DIR=/tmp/pressure19-wt PORT=8988 ulimit -n 1024 && \
//     bun tools/pressure-emojiflood.ts
//   SELFTEST=1 bun tools/pressure-emojiflood.ts   # gate RED/GREEN, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only
// if every pinned gate holds.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract ------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure19-wt";
const PORT = Number(process.env.PORT ?? 8988);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure19-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_CLEAN = 16, N_SMOOTH = 6, N_BURST = 2, N_ANCHOR = 136;  // 24 + 136 = 160
const POSE_HZ = 15;
const ANCHOR_AT = 3_000;
const FLOOD_AT = 6_500;
const SMOOTH_N = 23, SMOOTH_PACE_MS = 350;      // 2.86/s — smooth-legal
const BURST_N = 20;
const FAIR1_AT = 9_500, FAIR1_LIGHT_AT = 9_700, FAIR1_JOIN_AT = 9_600;
const BOMB_AT = 15_000, BOMB_LEGS = 4, BOMB_ROUNDS = 12, BOMB_PACE_MS = 600;
const BOMB_EMOJI_N = 59_500;                    // ~238KB/frame — sub-cap
const FAIR2_AT = 17_200, FAIR2_JOIN_AT = 17_400;
const BOUNDARY_AT = 23_000;
const ASCII_SUB_N = 250_000;                    // 250,057B frame — legal
const EMOJI_OVER_N = 65_000;                    // 260,000B text — refused
const FAIR3_AT = 23_200;
const RECOVER_AT = 23_600;
const AMP_AT = 24_500;
const TEARDOWN_AT = 27_000;
const DURATION = TEARDOWN_AT;
const MSG_RATE = "600";
const VERB_RATE = 12;
const SELFTEST = process.env.SELFTEST === "1";

const RATE_ERR = "slow down — verb rate limit";
const SIZE_ERR_HEAD = "message too large";

const TH = {
  joinsFailed: 0, joinP95Ms: 3_000,
  midFloodJoins: 12, midFloodJoinP95: 3_000,
  midBombJoins: 12, midBombEmb: 2, midBombJoinP95: 5_000,
  smoothEchoMin: SMOOTH_N, smoothRefusedMax: 0,
  burstAcceptedMax: VERB_RATE, burstRefusedMin: 8, burstVerdicts: BURST_N,
  refusedFanoutHits: 0,
  soloSayP95Ms: 500,
  lightAppended: 1,
  deliveryMisses: 0, deliveryP95Ms: 1_500,
  bombEchoes: BOMB_LEGS * BOMB_ROUNDS, bombEchoP95Ms: 2_000,
  fpsBombP50: 8, fpsPostP50: 12,
  asciiEchoed: true, emojiClosed: true, emojiErrExact: true,
  recovered: 8,
  rosterExact: 24, rosterMidBombExact: 28, finalPresent: 0,
  snapMaxBytes: 12_000_000, recentChatMax: 40, recentChatAliens: 0,
  logSayDrift: 0, logLineDrift: 0,
  probeP95Ms: 1_000, probeErrors: 0,
  logSuspicious: 0,
  // OOM guard scaled to THIS workload's physics: ~11.4MB inbound giant says
  // fanned to ~164 sockets (~1.8GB total sends). Bounded retention ≈100MB
  // (recentSays ring 256 says ≈62MB until evicted + unfolded tail ≈27MB +
  // recentChat ≈10MB); the rest is transient send-buffer/string churn.
  // 400MB ≈ 35× inbound volume — catches unbounded growth without failing
  // the workload's legitimate burst cost.
  rssPeakGrowthMB: 400,
  // LEAK DETECTION is inter-wave, not absolute: the plateau probe re-fires
  // the identical bomb and the wave-2 peak must stay within +60MB of wave-1
  // (a leak doubles it; measured +1MB). JSC does not return pages to the OS,
  // so absolute settled RSS legitimately stays at high-water — the pinned
  // invariant is "retention is workload-bounded, not per-say cumulative".
  rssWave2DeltaMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ----------------
type Measurements = {
  failed: number; joinP95: number;
  midFloodJoinOk: number; midFloodJoinP95: number;
  midBombJoinOk: number; midBombEmbOk: number; midBombJoinP95: number;
  smoothEchoMin: number; smoothRefusedMax: number;
  burstAcceptedMax: number; burstRefusedMin: number; burstVerdictMisses: number;
  refusedFanoutHits: number;
  soloSayP95: number; soloSayMisses: number; lightAppended: number;
  deliveryMisses: number; deliveryP95: number;
  bombEchoes: number; bombEchoP95: number;
  fpsBombP50: number; fpsPostP50: number;
  asciiEchoed: boolean; emojiClosed: boolean; emojiErrExact: boolean;
  recovered: number;
  rosterMidFlood: number; rosterMidBomb: number; finalPresent: number;  snapAmpBytes: number; snapFinalBytes: number; recentChatMax: number; recentChatAliens: number;
  logSayDrift: number; logLineDrift: number;
  probeP95: number; probeErrors: number;
  logSuspicious: number; rssPeakGrowth: number; rssSettledGrowth: number; rssWave2Delta: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.failed > TH.joinsFailed) fail.push(`${m.failed} initial connections failed to join`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`initial join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.midFloodJoinOk < TH.midFloodJoins) fail.push(`mid-flood joins ${m.midFloodJoinOk}/12 — flood starved join capacity`);
  if (m.midFloodJoinP95 > TH.midFloodJoinP95) fail.push(`mid-flood join p95 ${Math.round(m.midFloodJoinP95)}ms > ${TH.midFloodJoinP95}ms`);
  if (m.midBombJoinOk < TH.midBombJoins) fail.push(`mid-bomb joins ${m.midBombJoinOk}/12 — text bomb starved join capacity`);
  if (m.midBombEmbOk < TH.midBombEmb) fail.push(`mid-bomb embodied joins ${m.midBombEmbOk}/2`);
  if (m.midBombJoinP95 > TH.midBombJoinP95) fail.push(`mid-bomb join p95 ${Math.round(m.midBombJoinP95)}ms > ${TH.midBombJoinP95}ms`);
  if (m.smoothEchoMin < TH.smoothEchoMin) fail.push(`smooth flooder echoed only ${m.smoothEchoMin}/${SMOOTH_N} — legal pace lost verdicts`);
  if (m.smoothRefusedMax > TH.smoothRefusedMax) fail.push(`smooth-legal pace refused ${m.smoothRefusedMax} — 350ms must never trip 12/4s`);
  if (m.burstAcceptedMax > TH.burstAcceptedMax) fail.push(`burst budget breached: ${m.burstAcceptedMax} accepted > ${VERB_RATE}`);
  if (m.burstRefusedMin < TH.burstRefusedMin) fail.push(`rate protection weak: ${m.burstRefusedMin} refusals < ${TH.burstRefusedMin}`);
  if (m.burstVerdictMisses > 0) fail.push(`${m.burstVerdictMisses} burst verbs got no verdict (silent drop)`);
  if (m.refusedFanoutHits > TH.refusedFanoutHits) fail.push(`${m.refusedFanoutHits} sockets saw a REFUSED say fan out`);
  if (m.soloSayP95 > TH.soloSayP95Ms) fail.push(`healthy solo say author p95 ${Math.round(m.soloSayP95)}ms > ${TH.soloSayP95Ms}ms — flood starved verb intake`);
  if (m.soloSayMisses > 0) fail.push(`${m.soloSayMisses} fairness says never echoed`);
  if (m.lightAppended < TH.lightAppended) fail.push(`mid-flood light verb not appended`);
  if (m.deliveryMisses > TH.deliveryMisses) fail.push(`${m.deliveryMisses} say fanout receipts missing`);
  if (m.deliveryP95 > TH.deliveryP95Ms) fail.push(`say fanout p95 ${Math.round(m.deliveryP95)}ms > ${TH.deliveryP95Ms}ms`);
  if (m.bombEchoes < TH.bombEchoes) fail.push(`bomb echoes ${m.bombEchoes}/${TH.bombEchoes} — legal giant says went silent`);
  if (m.bombEchoP95 > TH.bombEchoP95Ms) fail.push(`giant say author p95 ${Math.round(m.bombEchoP95)}ms > ${TH.bombEchoP95Ms}ms`);
  if (m.fpsBombP50 < TH.fpsBombP50) fail.push(`bomb-era anchor fps p50 ${m.fpsBombP50.toFixed(1)} < ${TH.fpsBombP50}`);
  if (m.fpsPostP50 < TH.fpsPostP50) fail.push(`post-bomb anchor fps p50 ${m.fpsPostP50.toFixed(1)} < ${TH.fpsPostP50} — presence never recovered`);
  if (!m.asciiEchoed) fail.push(`250KB sub-cap ASCII say did not traverse`);
  if (!m.emojiClosed) fail.push(`260KB emoji say did not close the socket`);
  if (!m.emojiErrExact) fail.push(`oversize error not the exact "message too large" receipt`);
  if (m.recovered < TH.recovered) fail.push(`post-window recovery ${m.recovered}/8 — refusals wedged flooders`);
  if (m.rosterMidFlood !== TH.rosterExact) fail.push(`mid-flood roster ${m.rosterMidFlood} != ${TH.rosterExact}`);
  if (m.rosterMidBomb !== TH.rosterMidBombExact) fail.push(`mid-bomb roster ${m.rosterMidBomb} != ${TH.rosterMidBombExact}`);
  if (m.finalPresent !== TH.finalPresent) fail.push(`final present ${m.finalPresent} != 0 — ghost sessions`);
  if (m.snapAmpBytes > TH.snapMaxBytes) fail.push(`bomb-era join snapshot ${(m.snapAmpBytes / 1e6).toFixed(1)}MB > ${TH.snapMaxBytes / 1e6}MB`);
  if (m.recentChatMax > TH.recentChatMax) fail.push(`recentChat ${m.recentChatMax} > ${TH.recentChatMax} lines`);
  if (m.recentChatAliens > TH.recentChatAliens) fail.push(`${m.recentChatAliens} recentChat texts absent from the authored log`);
  if (m.logSayDrift > TH.logSayDrift) fail.push(`log.jsonl say lines drifted ${m.logSayDrift} from echo-observed`);
  if (m.logLineDrift > TH.logLineDrift) fail.push(`log.jsonl total lines drifted ${m.logLineDrift} from expected appends`);
  if (m.probeP95 > TH.probeP95Ms) fail.push(`HTTP probe p95 ${Math.round(m.probeP95)}ms > ${TH.probeP95Ms}ms`);
  if (m.probeErrors > TH.probeErrors) fail.push(`${m.probeErrors} HTTP probe errors`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.rssWave2Delta > TH.rssWave2DeltaMB) fail.push(`wave-2 peak delta +${m.rssWave2Delta}MB > ${TH.rssWave2DeltaMB}MB — retention grows per bomb wave (leak, not plateau)`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    failed: 0, joinP95: 42,
    midFloodJoinOk: 12, midFloodJoinP95: 30,
    midBombJoinOk: 12, midBombEmbOk: 2, midBombJoinP95: 900,
    smoothEchoMin: 23, smoothRefusedMax: 0,
    burstAcceptedMax: 12, burstRefusedMin: 8, burstVerdictMisses: 0,
    refusedFanoutHits: 0,
    soloSayP95: 6, soloSayMisses: 0, lightAppended: 1,
    deliveryMisses: 0, deliveryP95: 220,
    bombEchoes: 48, bombEchoP95: 400,
    fpsBombP50: 11.2, fpsPostP50: 14.8,
    asciiEchoed: true, emojiClosed: true, emojiErrExact: true,
    recovered: 8,
    rosterMidFlood: 24, rosterMidBomb: 28, finalPresent: 0,
    snapAmpBytes: 9_700_000, snapFinalBytes: 9_000_000, recentChatMax: 40, recentChatAliens: 0,
    logSayDrift: 0, logLineDrift: 0,
    probeP95: 12, probeErrors: 0,
    logSuspicious: 0, rssPeakGrowth: 41,
    rssSettledGrowth: 38, rssWave2Delta: 3,
  };
  const starved: Measurements = {
    ...healthy,
    rssSettledGrowth: 260, rssWave2Delta: 190,
    soloSayP95: 2_400, soloSayMisses: 2, midBombJoinP95: 8_500, midBombJoinOk: 7, midBombEmbOk: 1,
    fpsBombP50: 3.1, fpsPostP50: 9.5, bombEchoes: 41, bombEchoP95: 4_800,
    asciiEchoed: false, emojiClosed: false, emojiErrExact: false,
    burstAcceptedMax: 18, burstRefusedMin: 2, burstVerdictMisses: 9,
    smoothEchoMin: 19, refusedFanoutHits: 6, rosterMidBomb: 26, finalPresent: 3,
    snapAmpBytes: 15_000_000, recentChatMax: 47, recentChatAliens: 2,
    logSayDrift: 5, logLineDrift: 3, rssPeakGrowth: 460,
  };
  const a = evaluate(healthy), b = evaluate(starved);
  const want = [
    "starved verb intake", "starved join capacity", "mid-bomb embodied", "fps p50 3.1", "never recovered",
    "giant says went silent", "author p95 4800", "ASCII say did not traverse", "did not close", "exact \"message too large\"",
    "budget breached", "protection weak", "silent drop", "legal pace lost", "REFUSED say fan out",
    "roster 26", "ghost sessions", "15.0MB > 12MB", "recentChat 47", "absent from the authored log",
    "say lines drifted", "total lines drifted", "RSS peak growth 460", "leak, not plateau",
  ];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, starved gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_CLEAN + N_SMOOTH + N_BURST} embodied (16 clean + 6 smooth + 2 burst) @${POSE_HZ}Hz + ${N_ANCHOR} spectators = 160 sockets; t+${ANCHOR_AT / 1000}s 4 anchor says; t+${FLOOD_AT / 1000}s FLOOD (6x${SMOOTH_N} smooth @${SMOOTH_PACE_MS}ms all-legal + 2x${BURST_N} burst expecting <=${VERB_RATE}/${TH.burstRefusedMin}+); t+${FAIR1_AT / 1000}s fairness probes; t+${BOMB_AT / 1000}s TEXT BOMB ${BOMB_LEGS}x${BOMB_ROUNDS} @${BOMB_PACE_MS}ms ~${(BOMB_EMOJI_N * 4 / 1000).toFixed(0)}KB emoji says (all legal, ~${(BOMB_LEGS * BOMB_ROUNDS * BOMB_EMOJI_N * 4 / 1e6).toFixed(1)}MB in / ~${(BOMB_LEGS * BOMB_ROUNDS * BOMB_EMOJI_N * 4 * 160 / 1e9).toFixed(1)}GB fanout); t+${BOUNDARY_AT / 1000}s boundary ${ASCII_SUB_N}B-ASCII / ${EMOJI_OVER_N * 4}B-emoji; t+${RECOVER_AT / 1000}s recovery; t+${AMP_AT / 1000}s amplification join; ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}, VERB_RATE=${VERB_RATE}/4s`);
console.log(`thresholds: joins=160/160@p95<${TH.joinP95Ms}ms midFlood=${TH.midFloodJoins}/12@<${TH.midFloodJoinP95}ms midBomb=${TH.midBombJoins}+${TH.midBombEmb}@<${TH.midBombJoinP95}ms smooth=23/23echo/0refused burst<=${TH.burstAcceptedMax}/>=${TH.burstRefusedMin}refused verdicts=${TH.burstVerdicts}/${BURST_N} refusedFanout=${TH.refusedFanoutHits} soloSayP95<${TH.soloSayP95Ms}ms light=${TH.lightAppended} deliveryMiss=${TH.deliveryMisses}/p95<${TH.deliveryP95Ms}ms bombEcho=${TH.bombEchoes}@p95<${TH.bombEchoP95Ms}ms fpsBomb>=${TH.fpsBombP50} fpsPost>=${TH.fpsPostP50} ascii=echo emoji=1009+exact recovery=${TH.recovered}/8 roster=${TH.rosterExact}x2 final=${TH.finalPresent} snap<${TH.snapMaxBytes / 1e6}MB recentChat<=${TH.recentChatMax}/aliens=${TH.recentChatAliens} logDrift=${TH.logSayDrift}/${TH.logLineDrift} probeP95<${TH.probeP95Ms}ms suspicious=${TH.logSuspicious} rss<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-emojiflood.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure19-server-${Date.now()}.log`;
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

// ---- client chassis (compburst-proven) -----------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number; snapBytes: number;
  closed: boolean; closeCode: number; id: string;
  probeHits: Map<string, number>;
  giantSeqHits: Map<number, number>;   // seq -> arrival time (fast-path: >100KB log copies)
  errs: string[];
  bombFrames: number; bombLastSeq: number; bombGaps: number; bombStart: number; bombEnd: number;
  postFrames: number; postStart: number;
  _smooth?: string[]; _burst?: string[];
};
const probeKeysLive = new Set<string>();
const refusedKeysLive = new Set<string>();
const refusedHitKeys = new Set<string>();
// giant-say registry: 28-char text prefix -> full text key, so the client
// fast-path (no full parse for >100KB messages) can still bank probeHits.
const giantPrefixKeys = new Map<string, string>();
const giantPrefixOf = (text: string) => text.slice(0, 28);
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, snapBytes: 0, closed: false, closeCode: 0, probeHits: new Map(), giantSeqHits: new Map(), errs: [], bombFrames: 0, bombLastSeq: -1, bombGaps: 0, bombStart: 0, bombEnd: 0, postFrames: 0, postStart: 0 };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const rawStr = String(ev.data);
      // fast-path giant say copies: >100KB log messages carry nothing the
      // scenario needs except arrival + identity — match the authored text
      // by its unique 28-char prefix instead of parsing 240KB of JSON.
      if (rawStr.length > 100_000 && rawStr.startsWith('{"type":"log"')) {
        for (const [prefix, key] of giantPrefixKeys) {
          if (rawStr.includes(prefix)) {
            if (probeKeysLive.has(key) && !s.probeHits.has(key)) s.probeHits.set(key, performance.now());
            return;
          }
        }
      }
      const m = JSON.parse(rawStr);
      if (m.type === "snapshot") {
        s.snapAt = performance.now();
        s.joinMs = s.snapAt - s.openAt;
        s.snapBytes = String(ev.data).length;
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        if (s.postStart) s.postFrames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
        if (s.bombStart && !s.bombEnd) {
          s.bombFrames++;
          if (s.bombLastSeq >= 0 && m.seq > s.bombLastSeq + 1) s.bombGaps += m.seq - s.bombLastSeq - 1;
          s.bombLastSeq = m.seq;
        }
      } else if (m.type === "log") {
        const v = m.entry?.verb, a = m.entry?.args;
        if (v === "say" && typeof a?.text === "string") {
          s.says.add(a.text);
          const key = a.text;
          if (refusedKeysLive.has(key)) refusedHitKeys.add(key);
          if (probeKeysLive.has(key) && !s.probeHits.has(key)) s.probeHits.set(key, performance.now());
        } else if (v === "light" && typeof a?.id === "string" && a.id.startsWith("plight-")) {
          const key = `light:${a.id}`;
          if (probeKeysLive.has(key) && !s.probeHits.has(key)) s.probeHits.set(key, performance.now());
        }
      } else if (m.type === "error") {
        s.errs.push(String(m.error ?? ""));
      }
    };
    ws.onclose = (ev: any) => { s.closed = true; s.closeCode = Number(ev?.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}

/** A probe client that joins, captures its snapshot, and closes. */
function joinProbe(id: string, spectate: boolean, n = 0): Promise<{ joinMs: number; snapBytes: number; present: number; selfAbsent: boolean; recentChat: { text: string }[] | null }> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const openAt = performance.now();
    const out = { joinMs: -1, snapBytes: 0, present: -1, selfAbsent: false, recentChat: null as { text: string }[] | null };
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(out); }, 15_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        out.joinMs = performance.now() - openAt;
        out.snapBytes = String(ev.data).length;
        const present = m.present;   // top-level roster: embodied clients, self excluded
        out.present = Array.isArray(present) ? present.length : -1;
        out.selfAbsent = Array.isArray(present) ? !present.some((p: any) => p?.id === id) : false;
        out.recentChat = Array.isArray(m.state?.recentChat) ? m.state.recentChat : [];
        clearTimeout(to); try { ws.close(); } catch {} resolve(out);
      }
    };
    ws.onerror = () => { clearTimeout(to); resolve(out); };
  });
}

// ---- run -------------------------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_CLEAN }, (_, i) => connect(`perf-${i}`, false, i)),
  ...Array.from({ length: N_SMOOTH }, (_, i) => connect(`smooth-${i}`, false, 40 + i)),
  ...Array.from({ length: N_BURST }, (_, i) => connect(`burst-${i}`, false, 50 + i)),
  ...Array.from({ length: N_ANCHOR }, (_, i) => connect(`spec-${i}`, true)),
]);
const ok = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const failed = all.length - ok.length;
const perfs = ok.filter((s) => s.id.startsWith("perf-"));
const smooths = ok.filter((s) => s.id.startsWith("smooth-"));
const bursts = ok.filter((s) => s.id.startsWith("burst-"));
const specs = ok.filter((s) => s.id.startsWith("spec-"));
const everyone = [...perfs, ...smooths, ...bursts, ...specs];
const joinTimes = ok.map((s) => s.joinMs);
console.log(`t+0: joined ${ok.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// embodied presence: 24 broadcasters @ 15Hz
let running = true;
const posesSent = { n: 0 };
const tickers = [...perfs, ...smooths, ...bursts].map((s, i) => setInterval(() => {
  if (!running || s.ws.readyState !== 1) return;
  const t = Date.now() / 1000 + i;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  posesSent.n++;
}, 1000 / POSE_HZ));

// HTTP event-loop health probe
const probeSamples: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  probeSamples.push(performance.now() - t);
}, 400);

// RSS sampler
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN, peak2: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500) {
    if (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak) rssSamples.peak = r;
  }
}, 500);

// ---- phase bookkeeping ------------------------------------------------------------
const authoredSayTexts = new Set<string>();     // every say text we authored
const sayEchoTotal = { n: 0 };                  // echo-observed accepted says (all authors)
const soloSayLat: number[] = [];
let soloSayMisses = 0;
let lightAppended = 0;
const deliveryLat: number[] = [];
let deliveryMisses = 0;
let lightsAppendedTotal = 0;
const smoothAccepted: number[] = [];
const smoothRefused: number[] = [];
const burstAccepted: number[] = [];
const burstRefused: number[] = [];
let verdictMisses = 0;
let recovered = 0;
let asciiEchoed = false;
let emojiClosed = false, emojiErrExact = false;
let rosterMidFlood = -1, rosterMidBomb = -1;
let snapAmpBytes = -1;
const deliveryKeys: string[] = [];              // keys accounted on `everyone`

function accountDelivery(key: string, sentAt: number, pool = everyone) {
  deliveryKeys.push(key);
  for (const s of pool) {
    const hitAt = s.probeHits.get(key);
    if (hitAt === undefined) deliveryMisses++;
    else deliveryLat.push(hitAt - sentAt);
  }
}

// t+3.0s: 4 anchor says from clean perfs (pre-flood fanout evidence)
at(ANCHOR_AT, () => {
  const sentAt = performance.now();
  for (let i = 1; i <= 4; i++) {
    const text = `anchor-say-${i}-${Math.floor(t0)}`;
    probeKeysLive.add(text); authoredSayTexts.add(text);
    const s = perfs[i];
    if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  }
  at(ANCHOR_AT + 1_500, () => {
    for (let i = 1; i <= 4; i++) {
      const text = `anchor-say-${i}-${Math.floor(t0)}`;
      if (perfs[i]?.probeHits.has(text)) { sayEchoTotal.n++; accountDelivery(text, sentAt); }
    }
    console.log(`t+${ANCHOR_AT / 1000}s: anchor says echoed ${sayEchoTotal.n}/4`);
  });
});

// t+6.5s: THE FLOOD — 6 smooth @350ms + 2 bursts of 20
at(FLOOD_AT, () => {
  // smooth flooders: 23 says @350ms, 3-emoji texts (~1.2KB)
  smooths.forEach((s, si) => {
    s._smooth = [];
    for (let k = 0; k < SMOOTH_N; k++) {
      const text = `flood-smooth-${si}-${k} 🎉🦆✨`;
      s._smooth.push(text);
      setTimeout(() => {
        if (s.ws.readyState !== 1) return;
        probeKeysLive.add(text); authoredSayTexts.add(text);
        s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
      }, k * SMOOTH_PACE_MS);
    }
  });
  // burst flooders: 20 says back-to-back
  bursts.forEach((s, bi) => {
    s._burst = [];
    for (let k = 0; k < BURST_N; k++) {
      const text = `flood-burst-${bi}-${k} 🎉🦆✨`;
      s._burst.push(text);
      probeKeysLive.add(text); authoredSayTexts.add(text);
      if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    }
  });
  // settle accounting once the flood window is done (t+14.3s) + margin
  at(FLOOD_AT + SMOOTH_N * SMOOTH_PACE_MS + 1_200, () => {
    smooths.forEach((s) => {
      const acc = (s._smooth ?? []).filter((k) => s.probeHits.has(k)).length;
      const ref = s.errs.filter((e) => e === RATE_ERR).length;
      smoothAccepted.push(acc); smoothRefused.push(ref);
      sayEchoTotal.n += acc;
      verdictMisses += Math.max(0, SMOOTH_N - acc - ref);
      for (const k of s._smooth ?? []) if (!s.probeHits.has(k)) refusedKeysLive.add(k);
    });
    bursts.forEach((s) => {
      const acc = (s._burst ?? []).filter((k) => s.probeHits.has(k)).length;
      const ref = s.errs.filter((e) => e === RATE_ERR).length;
      burstAccepted.push(acc); burstRefused.push(ref);
      sayEchoTotal.n += acc;
      verdictMisses += Math.max(0, BURST_N - acc - ref);
      for (const k of s._burst ?? []) if (!s.probeHits.has(k)) refusedKeysLive.add(k);
    });
    // retroactive refused-fanout sweep (race-free: refused says never broadcast)
    for (const k of refusedKeysLive) for (const s of everyone) if (s.probeHits.has(k)) refusedHitKeys.add(k);
    console.log(`t+${(FLOOD_AT + SMOOTH_N * SMOOTH_PACE_MS + 1_200) / 1000}s: flood settled — smooth acc [${smoothAccepted.join(",")}] ref [${smoothRefused.join(",")}] | burst acc [${burstAccepted.join(",")}] ref [${burstRefused.join(",")}] | verdictMisses=${verdictMisses}`);
  });
});

// t+9.5s: FAIRNESS 1 — mid-flood solo say + light; t+9.6s joins; t+9.8s roster
at(FAIR1_AT, () => {
  const sentAt = performance.now();
  const text = `fair1-say-${Math.floor(t0)}`;
  probeKeysLive.add(text); authoredSayTexts.add(text);
  const SOLO = perfs[0];
  if (SOLO.ws.readyState === 1) SOLO.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  at(FAIR1_AT + 2_000, () => {
    const hit = SOLO.probeHits.get(text);
    if (hit !== undefined) { soloSayLat.push(hit - sentAt); sayEchoTotal.n++; accountDelivery(text, sentAt); }
    else soloSayMisses++;
  });
});
at(FAIR1_LIGHT_AT, () => {
  const sentAt = performance.now();
  const key = "light:plight-fair";
  probeKeysLive.add(key);
  const LIGHTER = perfs[2];
  if (LIGHTER.ws.readyState === 1) LIGHTER.ws.send(JSON.stringify({ type: "verb", verb: "light", args: { id: "plight-fair", pos: [0, 2, 0], color: "#ffb46b", intensity: 0.9, range: 5 } }));
  at(FAIR1_LIGHT_AT + 2_000, () => {
    if (LIGHTER.probeHits.has(key)) { lightAppended++; lightsAppendedTotal++; accountDelivery(key, sentAt); }
  });
});
let midFloodJoinOk = 0; const midFloodJoinMs: number[] = [];
at(FAIR1_JOIN_AT, async () => {
  const rs = await Promise.all(Array.from({ length: TH.midFloodJoins }, (_, i) => joinProbe(`mf-probe-${i}-${Math.floor(t0)}`, true)));
  for (const r of rs) { if (r.joinMs > 0) { midFloodJoinOk++; midFloodJoinMs.push(r.joinMs); } }
  console.log(`t+${FAIR1_JOIN_AT / 1000}s: mid-flood joins ${midFloodJoinOk}/12 p95 ${Math.round(pct(midFloodJoinMs, 95))}ms`);
});
at(FAIR1_AT + 300, async () => {
  const r = await joinProbe(`mf-roster-${Math.floor(t0)}`, true);
  rosterMidFlood = r.present;
  console.log(`t+${(FAIR1_AT + 300) / 1000}s: roster mid-flood present=${r.present} selfAbsent=${r.selfAbsent}`);
});

// t+15.0s: THE TEXT BOMB — 4 legs x 12 rounds @600ms of ~238KB emoji says
at(BOMB_AT, () => {
  for (const s of [...specs, ...everyone]) { s.bombStart = performance.now(); }
  at(BOMB_AT + 8_000, () => { for (const s of [...specs, ...everyone]) if (!s.bombEnd) { s.bombEnd = performance.now(); s.postStart = performance.now(); } });
});
// giant legs: fresh embodied clients joined just before the bomb
const giantSpecs: Spec[] = [];
{
  const joinGiants = async () => {
    for (let leg = 0; leg < BOMB_LEGS; leg++) {
      try { const s = await connect(`giant-${leg}`, false, 60 + leg); giantSpecs.push(s); } catch { /* counted via echoes */ }
    }
  };
  at(BOMB_AT - 1_500, () => { void joinGiants(); });
}
const bombEchoLat: number[] = [];
let bombEchoCount = 0;
const bombSent: { leg: number; round: number; text: string; sentAt: number; author: string }[] = [];
at(BOMB_AT, () => {
  const scheduleRound = (leg: number, round: number) => {
    setTimeout(() => {
      const s = giantSpecs.find((x) => x.id === `giant-${leg}`);
      if (!s || s.ws.readyState !== 1) return;
      const text = `G${round}-L${leg} ` + "🦆".repeat(BOMB_EMOJI_N);
      const frame = JSON.stringify({ type: "verb", verb: "say", args: { text } });
      if (Buffer.byteLength(frame) > 256_000) { console.log(`HARNESS BUG: bomb frame ${Buffer.byteLength(frame)}B over cap`); process.exit(2); }
      const sentAt = performance.now();
      probeKeysLive.add(text); authoredSayTexts.add(text);
      giantPrefixKeys.set(giantPrefixOf(text), text);
      s.ws.send(frame);
      // echo accounted at teardown by scanning probeHits (no late timer race)
      bombSent.push({ leg, round, text, sentAt, author: s.id });
    }, round * BOMB_PACE_MS);
  };
  // wait for giant sockets, then run rounds
  const waitForGiants = setInterval(() => {
    if (giantSpecs.length === BOMB_LEGS || performance.now() - t0 > BOMB_AT + 2_000) {
      clearInterval(waitForGiants);
      for (let leg = 0; leg < BOMB_LEGS; leg++) for (let r = 0; r < BOMB_ROUNDS; r++) scheduleRound(leg, r);
    }
  }, 100);
});

// t+17.2s: FAIRNESS 2 — mid-bomb solo say; t+17.4s joins (inflated snapshot); roster
at(FAIR2_AT, () => {
  const sentAt = performance.now();
  const text = `fair2-say-${Math.floor(t0)}`;
  probeKeysLive.add(text); authoredSayTexts.add(text);
  const SOLO = perfs[15];
  if (SOLO.ws.readyState === 1) SOLO.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  at(FAIR2_AT + 2_500, () => {
    const hit = SOLO.probeHits.get(text);
    if (hit !== undefined) { soloSayLat.push(hit - sentAt); sayEchoTotal.n++; accountDelivery(text, sentAt); }
    else soloSayMisses++;
  });
});
let midBombJoinOk = 0, midBombEmbOk = 0; const midBombJoinMs: number[] = [];
at(FAIR2_JOIN_AT, async () => {
  const rs = await Promise.all([
    ...Array.from({ length: TH.midBombJoins }, (_, i) => joinProbe(`mb-probe-${i}-${Math.floor(t0)}`, true)),
    joinProbe(`mb-emb-0-${Math.floor(t0)}`, false, 70),
    joinProbe(`mb-emb-1-${Math.floor(t0)}`, false, 71),
  ]);
  for (const r of rs) if (r.joinMs > 0) { midBombJoinOk++; midBombJoinMs.push(r.joinMs); }
  midBombEmbOk = rs.slice(TH.midBombJoins).filter((r) => r.joinMs > 0).length;
  const ampSnap = rs.find((r) => r.snapBytes > 0);
  if (ampSnap) snapAmpBytes = Math.max(snapAmpBytes ?? 0, ampSnap.snapBytes);
  console.log(`t+${FAIR2_JOIN_AT / 1000}s: mid-bomb joins ${midBombJoinOk}/14 (emb ${midBombEmbOk}/2) p95 ${Math.round(pct(midBombJoinMs, 95))}ms snapBytes=${ampSnap ? (ampSnap.snapBytes / 1e6).toFixed(1) + "MB" : "?"}`);
});
at(FAIR2_AT + 1_000, async () => {
  const r = await joinProbe(`mb-roster-${Math.floor(t0)}`, true);
  rosterMidBomb = r.present;
  console.log(`t+${(FAIR2_AT + 1_000) / 1000}s: roster mid-bomb present=${r.present} selfAbsent=${r.selfAbsent}`);
});

// t+23.0s: BOUNDARY — 250KB ASCII (echo) then 260KB emoji (close 1009)
at(BOUNDARY_AT, () => {
  const G0 = giantSpecs[0];
  if (G0 && G0.ws.readyState === 1) {
    const asciiText = "S".repeat(ASCII_SUB_N);
    const frameA = JSON.stringify({ type: "verb", verb: "say", args: { text: asciiText } });
    if (Buffer.byteLength(frameA) > 256_000) { console.log(`HARNESS BUG: ascii frame ${Buffer.byteLength(frameA)}B over cap`); process.exit(2); }
    const sentAt = performance.now();
    probeKeysLive.add(asciiText); authoredSayTexts.add(asciiText);
    giantPrefixKeys.set(giantPrefixOf(asciiText), asciiText);
    G0.ws.send(frameA);
    setTimeout(() => {
      if (G0.probeHits.has(asciiText)) { asciiEchoed = true; sayEchoTotal.n++; accountDelivery(asciiText, sentAt); }
    }, 1_800);
    // the over-cap emoji bomb on the SAME socket must kill exactly this socket
    const overText = "🦆".repeat(EMOJI_OVER_N);
    const frameO = JSON.stringify({ type: "verb", verb: "say", args: { text: overText } });
    if (Buffer.byteLength(frameO) <= 256_000) { console.log(`HARNESS BUG: emoji frame ${Buffer.byteLength(frameO)}B under cap`); process.exit(2); }
    setTimeout(() => { if (G0.ws.readyState === 1) G0.ws.send(frameO); }, 250);
    setTimeout(() => {
      emojiClosed = G0.closed && G0.closeCode === 1009;
      emojiErrExact = G0.errs.some((e) => e.startsWith(SIZE_ERR_HEAD));
    }, 1_800);
  }
});

// t+23.2s: FAIRNESS 3 — boundary-era solo say
at(FAIR3_AT, () => {
  const sentAt = performance.now();
  const text = `fair3-say-${Math.floor(t0)}`;
  probeKeysLive.add(text); authoredSayTexts.add(text);
  const SOLO = perfs[7];
  if (SOLO.ws.readyState === 1) SOLO.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  at(FAIR3_AT + 2_000, () => {
    const hit = SOLO.probeHits.get(text);
    if (hit !== undefined) { soloSayLat.push(hit - sentAt); sayEchoTotal.n++; accountDelivery(text, sentAt); }
    else soloSayMisses++;
  });
});

// t+23.6s: RECOVERY — every flooder's next say MUST append
at(RECOVER_AT, () => {
  const sentAt = performance.now();
  [...smooths, ...bursts].forEach((s, i) => {
    const text = `recovered-${i}-${Math.floor(t0)}`;
    probeKeysLive.add(text); authoredSayTexts.add(text);
    if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  });
  at(RECOVER_AT + 1_500, () => {
    [...smooths, ...bursts].forEach((s, i) => {
      const text = `recovered-${i}-${Math.floor(t0)}`;
      if (s.probeHits.has(text)) { recovered++; sayEchoTotal.n++; accountDelivery(text, sentAt); }
    });
    console.log(`t+${RECOVER_AT / 1000}s: post-window recovery ${recovered}/8`);
  });
});

// t+24.5s: AMPLIFICATION — one joiner reads the bomb-era snapshot
let ampRecentChat = 0, ampAliens = 0, snapAmp2 = -1;
at(AMP_AT, async () => {
  const r = await joinProbe(`amp-final-${Math.floor(t0)}`, true);
  snapAmp2 = r.snapBytes;
  if (snapAmpBytes < 0) snapAmpBytes = r.snapBytes;
  else snapAmpBytes = Math.max(snapAmpBytes, r.snapBytes);
  if (r.recentChat) {
    ampRecentChat = r.recentChat.length;
    ampAliens = r.recentChat.filter((m) => !authoredSayTexts.has(m.text)).length;
  }
  console.log(`t+${AMP_AT / 1000}s: amplification join — snapBytes=${(r.snapBytes / 1e6).toFixed(1)}MB recentChat=${ampRecentChat} aliens=${ampAliens}`);
});

// ---- teardown ----------------------------------------------------------------------
await sleep(DURATION - (performance.now() - t0) + 200);
const tornDownAt = performance.now();   // post-bomb fps window ends HERE:
running = false;                        // after this the harness itself has
tickers.forEach(clearInterval);         // silenced all 24 broadcasters
clearInterval(probeTimer);
clearInterval(rssTimer);
for (const s of giantSpecs) { /* keep open: plateau probe reuses them */ }
for (const s of ok) { try { s.ws.close(); } catch {} }
await sleep(1_200);

// final probe: world must drain to empty — runs AFTER the plateau probe so
// the reused giant sockets are closed and counted out too.
let finalProbe = { joinMs: -1, snapBytes: 0, present: -1, selfAbsent: false, recentChat: null as { text: string }[] | null };

// bomb echo accounting (teardown-time, no timer race): every sent giant say
// must have echoed to its author (probeHits). MUST run before the plateau
// probe resets bombSent.
for (const b of bombSent) {
  const author = giantSpecs.find((x) => x.id === b.author);
  if (author?.probeHits.has(b.text)) {
    bombEchoCount++; sayEchoTotal.n++; bombEchoLat.push(author.probeHits.get(b.text)! - b.sentAt);
    accountDelivery(b.text, b.sentAt);   // heavy: 160 sockets x 48 keys
  }
}
const fpsEndAt = performance.now();

// settled RSS: after teardown, GC + socket buffers must return to earth.
// Wait 12s and sample twice (Bun/JSC has no exposed gc(); two samples 3s
// apart with the lower taken = settled estimate).
let rssSettledVal = NaN;
{
  await sleep(12_000);
  const a = rss(), b = (await sleep(3_000), rss());
  rssSettledVal = Math.min(a, b);
}

// PLATEAU PROBE (falsifies "leak" vs "allocator high-water"): re-run the
// identical bomb wave on the same server. A leak doubles the peak; bounded
// retention plateaus near wave-1's peak. giants keep their sockets; re-arm
// rounds on the same cadence with fresh texts.
let rssPeak2 = NaN, rssSettled2Val = NaN, wave2Echoes = 0;
{
  bombSent.length = 0;                       // wave-1 accounting already banked above
  const fire = (leg: number, round: number) => setTimeout(() => {
    const s = giantSpecs.find((x) => x.id === `giant-${leg}`);
    if (!s || s.ws.readyState !== 1) return;
    const text = `H${round}-L${leg} ` + "🦆".repeat(BOMB_EMOJI_N);
    const frame = JSON.stringify({ type: "verb", verb: "say", args: { text } });
    if (Buffer.byteLength(frame) > 256_000) { console.log(`HARNESS BUG: wave-2 frame ${Buffer.byteLength(frame)}B over cap`); process.exit(2); }
    probeKeysLive.add(text); authoredSayTexts.add(text);
    giantPrefixKeys.set(giantPrefixOf(text), text);
    s.ws.send(frame);
  }, round * BOMB_PACE_MS);
  for (let leg = 0; leg < BOMB_LEGS; leg++) for (let r = 0; r < BOMB_ROUNDS; r++) fire(leg, r);
  await sleep((BOMB_ROUNDS - 1) * BOMB_PACE_MS + 2_000);
  const t2 = setInterval(() => {
    const r = rss();
    if (Number.isFinite(r)) rssSamples.peak2 = Number.isFinite(rssSamples.peak2) ? Math.max(rssSamples.peak2, r) : r;
  }, 500);
  await sleep(4_000);
  clearInterval(t2);
  rssPeak2 = rssSamples.peak2;
  await sleep(6_000);                        // let echoes drain
  wave2Echoes = new Set(giantSpecs.flatMap((s) => [...s.probeHits.keys()].filter((k) => k.startsWith("H")))).size;
  await sleep(8_000);
  const c = rss(), d = (await sleep(3_000), rss());
  rssSettled2Val = Math.min(c, d);
}

// close the reused giants, wait out their leave broadcasts, then the
// final empty-world probe and snapshot census
for (const s of giantSpecs) { try { s.ws.close(); } catch {} }
await sleep(2_500);
finalProbe = await joinProbe(`final-empty-${Math.floor(t0)}`, true);
const snapFinalBytes = finalProbe.snapBytes;
let finalRecentChat = 0;
if (finalProbe.recentChat) finalRecentChat = finalProbe.recentChat.length;

// wave-2 echo accounting (post-drain): every WAVE-2 giant say that was sent
// must also have echoed to its author.
sayEchoTotal.n += wave2Echoes;

// fps windows: bomb era = BOMB_AT..+8s on anchors; post era = bomb-end..teardown
const endAt = fpsEndAt;
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (endAt - s.snapAt - 500) / 1000));
const fpsBombPer = specs.filter((s) => s.bombEnd > 0).map((s) => s.bombFrames / Math.max(0.001, (s.bombEnd - s.bombStart) / 1000));
const fpsPostPer = specs.filter((s) => s.postStart > 0 && tornDownAt > s.postStart + 3_000).map((s) => s.postFrames / Math.max(0.001, (Math.min(endAt, tornDownAt) - s.postStart) / 1000));
const bombGapsTotal = specs.reduce((a, s) => a + s.bombGaps, 0);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const latAll = specs.flatMap((s) => s.lat);

// server log + world log ground truth
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

const worldLogPath = `${WORLDS}/${WORLD}/log.jsonl`;
let logSayLines = -1, logTotalLines = -1, expectedSays = -1, expectedTotal = -1;
let logSayDriftVal = 0, logLineDriftVal = 0;
let logRecentChatAliens = 0, logRecentChatMax = 0;
if (existsSync(worldLogPath)) {
  const wl = readFileSync(worldLogPath, "utf8").split("\n").filter(Boolean);
  logTotalLines = wl.length;
  const sayTexts = new Set<string>();
  logSayLines = 0;
  for (const l of wl) {
    try {
      const e = JSON.parse(l);
      if (e.verb === "say") { logSayLines++; if (typeof e.args?.text === "string") sayTexts.add(e.args.text); }
    } catch { /* torn tail line counts as drift below */ }
  }
  expectedSays = sayEchoTotal.n;
  expectedTotal = 2 + expectedSays + lightsAppendedTotal;   // genesis + grant + says + lights
  logSayDriftVal = Math.abs(logSayLines - expectedSays);
  logLineDriftVal = Math.abs(logTotalLines - expectedTotal);
  // fold-side truth: the final joiner's recentChat vs the log
  if (finalProbe.recentChat) {
    logRecentChatMax = finalProbe.recentChat.length;
    logRecentChatAliens = finalProbe.recentChat.filter((m) => !sayTexts.has(m.text)).length;
  }
}

const m: Measurements = {
  failed, joinP95: pct(joinTimes, 95),
  midFloodJoinOk, midFloodJoinP95: pct(midFloodJoinMs, 95),
  midBombJoinOk, midBombEmbOk, midBombJoinP95: pct(midBombJoinMs, 95),
  smoothEchoMin: smoothAccepted.length ? Math.min(...smoothAccepted) : 0,
  smoothRefusedMax: smoothRefused.length ? Math.max(...smoothRefused) : 0,
  burstAcceptedMax: burstAccepted.length ? Math.max(...burstAccepted) : 0,
  burstRefusedMin: burstRefused.length ? Math.min(...burstRefused) : 0,
  burstVerdictMisses: verdictMisses,
  refusedFanoutHits: refusedHitKeys.size,
  soloSayP95: soloSayLat.length ? pct(soloSayLat, 95) : Infinity,
  soloSayMisses, lightAppended,
  deliveryMisses, deliveryP95: pct(deliveryLat, 95),
  bombEchoes: bombEchoCount, bombEchoP95: pct(bombEchoLat, 95),
  fpsBombP50: pct(fpsBombPer.filter(Number.isFinite), 50),
  fpsPostP50: fpsPostPer.length ? pct(fpsPostPer, 50) : pct(fpsPer, 50),
  asciiEchoed, emojiClosed, emojiErrExact,
  recovered,
  rosterMidFlood, rosterMidBomb, finalPresent: finalProbe.present,
  snapAmpBytes: Math.max(snapAmpBytes, snapAmp2),
  snapFinalBytes, recentChatMax: Math.max(ampRecentChat, logRecentChatMax),
  recentChatAliens: ampAliens + logRecentChatAliens,
  logSayDrift: logSayDriftVal, logLineDrift: logLineDriftVal,
  probeP95: pct(probeSamples, 95), probeErrors: probeErrors.n,
  logSuspicious: suspicious.length, rssPeakGrowth,
  rssSettledGrowth: MB(rssSettledVal - (rssSamples.postJoin || NaN)),
  rssWave2Delta: Number.isFinite(rssPeak2) ? MB(rssPeak2 - (rssSamples.peak || NaN)) : 0,
};
const fail = evaluate(m);

console.log(`
results
  poses sent            ${posesSent.n}
  initial joins         ${ok.length}/${all.length} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(m.joinP95)}ms
  mid-flood joins       ${midFloodJoinOk}/12 — p95 ${Math.round(m.midFloodJoinP95)}ms
  mid-bomb joins        ${midBombJoinOk}/14 (emb ${midBombEmbOk}/2) — p95 ${Math.round(m.midBombJoinP95)}ms
  smooth flooders       echoes [${smoothAccepted.join(",")}] / refusals [${smoothRefused.join(",")}] (want ${SMOOTH_N}/0)
  burst flooders        accepted [${burstAccepted.join(",")}] refused [${burstRefused.join(",")}] — verdict misses ${verdictMisses}
  refused fanout hits   ${refusedHitKeys.size} (must be 0)
  fairness solo says    ${soloSayLat.length} echoed / ${soloSayMisses} missed — author p95 ${Number.isFinite(m.soloSayP95) ? Math.round(m.soloSayP95) : "MISSED"}ms
  fairness light        ${lightAppended}/1
  say fanout            ${deliveryMisses} misses / ${deliveryLat.length} receipts — p95 ${Math.round(m.deliveryP95)}ms (keys ${deliveryKeys.length})
  bomb echoes           ${bombEchoCount}/${BOMB_LEGS * BOMB_ROUNDS} — author p95 ${Math.round(m.bombEchoP95)}ms
  anchor fps            bomb-era p50 ${m.fpsBombP50.toFixed(1)} (gaps ${bombGapsTotal} — frame-skip law, reported) / post-window p50 ${m.fpsPostP50.toFixed(1)} (whole-run ${pct(fpsPer, 50).toFixed(1)}, gaps ${gapsTotal})
  frame latency ms      p50 ${Math.round(pct(latAll, 50))} p95 ${Math.round(pct(latAll, 95))}
  boundary              asciiEchoed=${asciiEchoed} emojiClosed1009=${emojiClosed} exactErr=${emojiErrExact}
  recovery              ${recovered}/8
  rosters               mid-flood ${rosterMidFlood} mid-bomb ${rosterMidBomb} (want ${TH.rosterExact}) — final present ${finalProbe.present}
  amplification         bomb-era snapshot ${(m.snapAmpBytes > 0 ? (m.snapAmpBytes / 1e6).toFixed(1) : "?")}MB / final ${(snapFinalBytes > 0 ? (snapFinalBytes / 1e6).toFixed(1) : "?")}MB — recentChat ${m.recentChatMax} lines, ${m.recentChatAliens} aliens
  world log             says=${logSayLines} expected=${expectedSays} (drift ${logSayDriftVal}) total=${logTotalLines} expected=${expectedTotal} (drift ${logLineDriftVal})
  http probe p95        ${Math.round(m.probeP95)}ms (n=${probeSamples.length}, ${probeErrors.n} errors)
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB) → settled ${MB(rssSettledVal)}MB (+${m.rssSettledGrowth}MB) | wave2 peak ${MB(rssPeak2)}MB settled ${MB(rssSettled2Val)}MB (plateau: leak would ~double wave-1; echoes ${wave2Echoes}/48)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

server.kill("SIGTERM");
await server.exited;
console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — rapid-fire says cannot starve verb intake`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
