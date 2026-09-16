// Pressure scenario 26: WHISPER SPAM — targeted messages cannot bypass the
// global rate budget.
//
// Whisper mechanics under test (server.ts `case "whisper"`):
//   - whispers ride INSIDE the global per-connection message-rate cap
//     (MSG_RATE=60/s, preamble line ~365) but carry NO verb-lane budget
//     (VERB_RATE=12/4s applies to `verb` messages only);
//   - text capped at 4000 CHARS (emoji = 4 UTF-8 bytes each -> ~16KB wire,
//     legal under the 256KB frame gate);
//   - each accepted whisper = 2 outbound frames (target + author echo),
//     plus 1 error receipt when the target is absent (hold path);
//   - absent targets queue per (world,recipient) key, cap 20, UNBOUNDED
//     distinct keys, memory only;
//   - held whispers deliver after `snapshot` at the next embodied join of
//     that identity, exactly once (queue deleted);
//   - spectator senders silently dropped (`if (!c.world || c.spectator)
//     return;`);
//   - whispers must NEVER appear in the world log (privacy contract: the
//     log is public, append-only, replayed to every future joiner).
//
// Questions this scenario pins (thresholds BEFORE measuring):
//   A. BURST: 200 back-to-back whispers + 25 back-to-back verb says from
//      one quiescent embodied leg — the 60/s wallet is SHARED across
//      message types: <=61 verdicts may return in the burst second, the
//      verb says land ~0 echoes (the whispers spent the wallet first),
//      over-cap sends are silent, and the flight recorder notes
//      `rate-limit` (lane message) at least once.
//   B. SATURATION: 8 quiescent embodied legs at 58 whispers/s each
//      (464/s aggregate, every leg legal) for 6s — each leg keeps >=99%
//      of its echoes; a leg missing more than 1% = starvation.
//   C. FAT TEXT: 30 rounds of 3990-char emoji whispers (~16KB wire) from
//      one leg at 300ms to ONE present target — author echo p95 <300ms,
//      target delivery p95 <300ms, per-frame text CHARACTERS preserved,
//      no spill of whisper text into any other observer's stream.
//   D. GHOST-HOLD: 600 whispers to 600 distinct absent recipients (one
//      per key, under the 20/key cap; 12 legs x 50 @20ms, legs 8-11
//      staggered +600ms so reused senders stay under 60/s), then 20
//      returning recipients join embodied under their EXACT held ids:
//      EXACTLY 1 held whisper each, the RIGHT one, queue drained (rejoin
//      gets 0), no foreign whisper to any returner, delivery AFTER the
//      snapshot frame. Key growth is a REPORTED number (memory-only map;
//      RSS gate covers the leak class).
//   E. PRIVACY: whisper texts appear in 0 world-log verb lines, 0 raw
//      log bytes, and 0 snapshots — the never-append contract. Spectator
//      sender attempt = silently dropped (no delivery, no echo).
//   F. FAIRNESS under the whole storm: healthy authored verbs (say p95,
//      lights), spectator + embodied joins, presence fps, seq-gap
//      continuity, HTTP event-loop probe, roster exactness.
//   G. RATE-WINDOW RECOVERY: after the window rolls, the burst leg's
//      next whisper is accepted (echo) — refusal is never a wedge.
//   H. BOUNDARY: text sliced to 4000 chars by the server (4001-char send
//      echoes text.length == 4000); a ~1.1MB-char legal giant whisper
//      (280k emoji chars, ~1.1MB wire, under the 256KB-frame... NOTE:
//      70x3990 chars = 279,289 chars x 4B = ~1.1MB wire would EXCEED the
//      256KB frame gate — the giant here is sized to stay UNDER it:
//      60,000 emoji chars = 240KB wire, legal) still echoes.
//
// Workload (presence chassis of pressure-1..25): 40 embodied sockets —
// exactly the design-target 24 performers pose @15Hz; the 8 saturation
// legs + 1 burst leg + 1 fat leg + 6 fair controls are embodied but
// QUIESCENT (no pose stream) so their whole 60/s wallet is whisper-lane.
// + 120 spectator anchors = 160 sockets from t=0.
//
// Phases:
//   t=3.0s  ANCHOR   3 says + 1 light (pre-storm fanout evidence)
//   t=6.5s  BURST    burst-0: 200 whispers to present perf-1 + 25 verb
//                    says back-to-back (shared wallet)
//   t=9.0s  SATUR    8 legs x 348 whispers @16.67ms (58/s x 6s) to
//                    present perf-0/2
//   t=15.8s GHOST    600 whispers to 600 distinct absent ids (12x50
//                    @20ms; legs 8-11 +600ms stagger)
//   t=14.0s FAT      fat-0: 30 rounds @300ms of 3990-char emoji texts
//                    to present perf-3 (through t+23)
//   t=15.5s FAIR     solo say + light; t+15.7s 12 spec + 2 emb joins;
//                    roster
//   t=24.5s BOUND    4001-char slice probe + 60,000-emoji (~240KB wire)
//                    legal giant, both to present perf-5
//   t=26.0s REC      burst-0 recovery whisper + spectator-sender attempt
//   t=28.0s DRAIN    all sockets close; ghost-hold queues remain (by
//                    design, memory-only)
//   t=31.5s HOLD     20 returners join under their EXACT ghost ids —
//                    exactly-once held delivery; 1 re-rejoin gets 0
//   t=35.5s FINAL    empty-world probe, privacy census, teardown
//
// Acceptance gates (pinned):
//   - joins 160/160 p95<3s; mid-storm 12/12 spec + 2/2 emb p95<5s;
//     hold-phase 20/20 p95<3s
//   - BURST: verdicts <=61 in the burst second; verb-say echoes <=5
//     (shared wallet); rate-limit notes >=1 for burst-0
//   - SATURATION: per-leg kept >=344/348; aggregate >=2752; p95 <250ms
//   - FAT: 30/30 author echoes p95<300ms; 30/30 target deliveries
//     p95<300ms; echo text 3990 chars; 0 spills to any other socket
//   - GHOST-HOLD: exactly-once 20/20; right recipient 20/20; re-rejoin
//     0; foreign 0; after-snapshot order 20/20; dups 0
//   - PRIVACY: whisper verb lines in log.jsonl == 0; raw-byte marker
//     hits == 0; snapshot marker hits == 0 (markers chosen so legal say
//     texts never match: "w:WS26-", "G26-", "SL26-")
//   - SPECTATOR SENDER: 0 delivered, 0 echoed, silence observed
//   - FAIRNESS: solo say p95<500ms; both lights appended; fps p50>=12;
//     0 seq gaps; HTTP probe p95<1000ms; mid-storm roster == 40; final
//     present == 0
//   - BOUNDARY: slice echo length == 4000; giant echoed
//   - RECOVERY: burst-0 post-window whisper echoed
//   - log.jsonl lines == 2 (genesis+grant) + echoed says + appended
//     lights, drift 0; snapshots <9.5MB; RSS peak growth <60MB;
//     0 suspicious server log lines
//
//   cd /tmp/pressure26-wt && ulimit -n 1024 && PORT=8975 \
//     SERVER_DIR=/tmp/pressure26-wt bun tools/pressure-whisper.ts
//   SELFTEST=1 bun tools/pressure-whisper.ts   # gate RED/GREEN, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only
// if every pinned gate holds.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract ------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure26-wt";
const PORT = Number(process.env.PORT ?? 8975);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure26-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const N_ANCHOR_PERF = 24, N_SAT = 8, N_BURST = 1, N_FAT = 1, N_FAIR = 6; // 40 embodied
const N_SPEC = 120;                                                     // +120 = 160
const POSE_HZ = 15;                    // ONLY the 24 anchor performers pose
const ANCHOR_AT = 3_000;
const BURST_AT = 6_500, BURST_N = 200, BURST_VERB_N = 25;
const SAT_AT = 9_000, SAT_LEGS = N_SAT, SAT_PER_LEG = 348, SAT_PACE_MS = 1000 / 58;
const GHOST_AT = SAT_AT + SAT_PER_LEG * SAT_PACE_MS + 800;   // ~t+15.8
const GHOST_KEYS = 600, GHOST_LEGS = 12, GHOST_PER_LEG = GHOST_KEYS / GHOST_LEGS, GHOST_PACE_MS = 20, GHOST_STAGGER_MS = 600;
const FAT_AT = 14_000, FAT_ROUNDS = 30, FAT_PACE_MS = 300, FAT_EMOJI_N = 3990;
const FAIR_AT = 15_500, FAIR_JOIN_AT = 15_700, FAIR_LIGHT_AT = 15_600;
const BOUND_AT = 24_500, BOUND_SLICE = 4_001, BOUND_GIANT_EMOJI = 60_000;  // 240KB wire, legal
const REC_AT = 26_000;
const DRAIN_AT = 28_000;
const HOLD_AT = 31_500, HOLD_KEYS = 20;
const FINAL_AT = 35_500;
const DURATION = FINAL_AT;
const MSG_RATE = "60";
const VERB_RATE = 12;
const SELFTEST = process.env.SELFTEST === "1";

const RATE_NOTE_KIND = "rate-limit";

const TH = {
  joinsFailed: 0, joinP95Ms: 3_000,
  midJoins: 12, midEmb: 2, midJoinP95: 5_000,
  holdJoins: 20, holdJoinP95: 3_000,
  burstVerdictsMax: 61,      // 60/s global cap + 1 window-tolerance
  rateNotesMin: 1,           // one note per client per second; burst spans ~1-2s
  burstVerbsEchoMax: 5,      // shared wallet: whisper burst already spent it
  satKeepMin: 344, satPerLeg: SAT_PER_LEG, satAggregateMin: 2_752, satP95: 250,
  fatEchoes: FAT_ROUNDS, fatTarget: FAT_ROUNDS, fatAuthorP95: 300, fatTargetP95: 300, fatTextChars: FAT_EMOJI_N,
  fatSpillMax: 0,
  holdExact: 20, holdRightMin: 20, holdRejoinWant: 0, holdForeignMax: 0,
  holdOrderAfterSnapshot: 20, holdDupMax: 0,
  logWhisperLines: 0, snapWhisperHits: 0, logRawWhisperHits: 0,
  specSendDelivered: 0, specSendEchoed: 0, specSendSilence: 1,
  soloSayP95Ms: 500, lightAppended: 2,
  fpsStormP50: 12, gapMax: 0, probeP95Ms: 1_000, probeErrors: 0,
  rosterMid: N_ANCHOR_PERF + N_SAT + N_BURST + N_FAT + N_FAIR, finalPresent: 0,
  sliceLen: 4_000, giantEchoed: true,
  recovered: 1,
  logLineDrift: 0, logSuspicious: 0,
  snapMaxBytes: 9_500_000,
  rssPeakGrowthMB: 60,
};

// ---- pure gate evaluation (SELFTEST exercises the same math) ----------------
type Measurements = {
  failed: number; joinP95: number;
  midJoinOk: number; midEmbOk: number; midJoinP95: number;
  holdJoinOk: number; holdJoinP95: number;
  burstVerdicts: number; rateNotes: number; burstVerbsEchoed: number;
  satKeepMin: number; satAggregate: number; satP95: number;
  fatEchoes: number; fatTarget: number; fatAuthorP95: number; fatTargetP95: number; fatTextLen: number;
  fatSpills: number;
  holdExact: number; holdRight: number; holdRejoinGot: number; holdForeign: number;
  holdOrder: number; holdDups: number;
  logWhisperLines: number; snapWhisperHits: number; logRawWhisperHits: number;
  specSendDelivered: number; specSendEchoed: number; specSendSilent: boolean;
  soloSayP95: number; soloSayMisses: number; lightAppended: number;
  fpsStormP50: number; gaps: number; probeP95: number; probeErrors: number;
  rosterMid: number; finalPresent: number;
  sliceEchoLen: number; giantEchoed: boolean;
  recovered: number;
  logTotalLines: number; logExpected: number;
  snapBytes: number; logSuspicious: number; rssPeakGrowth: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.failed > TH.joinsFailed) fail.push(`${m.failed} initial connections failed to join`);
  if (m.joinP95 > TH.joinP95Ms) fail.push(`initial join p95 ${Math.round(m.joinP95)}ms > ${TH.joinP95Ms}ms`);
  if (m.midJoinOk < TH.midJoins) fail.push(`mid-storm joins ${m.midJoinOk}/12 — whisper storm starved join capacity`);
  if (m.midEmbOk < TH.midEmb) fail.push(`mid-storm embodied joins ${m.midEmbOk}/2`);
  if (m.midJoinP95 > TH.midJoinP95) fail.push(`mid-storm join p95 ${Math.round(m.midJoinP95)}ms > ${TH.midJoinP95}ms`);
  if (m.holdJoinOk < TH.holdJoins) fail.push(`hold-phase joins ${m.holdJoinOk}/20`);
  if (m.holdJoinP95 > TH.holdJoinP95) fail.push(`hold-phase join p95 ${Math.round(m.holdJoinP95)}ms > ${TH.holdJoinP95}ms`);
  if (m.burstVerdicts > TH.burstVerdictsMax) fail.push(`burst verdicts ${m.burstVerdicts} > ${TH.burstVerdictsMax} — whisper burst bypassed the global rate budget`);
  if (m.rateNotes < TH.rateNotesMin) fail.push(`rate-limit notes ${m.rateNotes} < ${TH.rateNotesMin} — over-cap whisper sends dropped silently`);
  if (m.burstVerbsEchoed > TH.burstVerbsEchoMax) fail.push(`burst-adjacent verbs echoed ${m.burstVerbsEchoed} > ${TH.burstVerbsEchoMax} — whisper and verb budgets not shared`);
  if (m.satKeepMin < TH.satKeepMin) fail.push(`saturation leg lost echoes (min kept ${m.satKeepMin}/${TH.satPerLeg}) — legal 58/s starved`);
  if (m.satAggregate < TH.satAggregateMin) fail.push(`saturation aggregate ${m.satAggregate}/${TH.satAggregateMin}`);
  if (m.satP95 > TH.satP95) fail.push(`saturation echo p95 ${Math.round(m.satP95)}ms > ${TH.satP95}ms`);
  if (m.fatEchoes < TH.fatEchoes) fail.push(`fat echoes ${m.fatEchoes}/${TH.fatEchoes} — legal 16KB whispers went silent`);
  if (m.fatTarget < TH.fatTarget) fail.push(`fat target deliveries ${m.fatTarget}/${TH.fatTarget}`);
  if (m.fatAuthorP95 > TH.fatAuthorP95) fail.push(`fat author p95 ${Math.round(m.fatAuthorP95)}ms > ${TH.fatAuthorP95}ms`);
  if (m.fatTargetP95 > TH.fatTargetP95) fail.push(`fat target p95 ${Math.round(m.fatTargetP95)}ms > ${TH.fatTargetP95}ms`);
  if (m.fatTextLen !== TH.fatTextChars) fail.push(`fat echo text ${m.fatTextLen} chars != ${TH.fatTextChars} — bytes lost in transit`);
  if (m.fatSpills > TH.fatSpillMax) fail.push(`${m.fatSpills} sockets saw whisper text uninvited — fanout leak`);
  if (m.holdExact !== TH.holdExact) fail.push(`held-whisper exactly-once ${m.holdExact}/20`);
  if (m.holdRight < TH.holdRightMin) fail.push(`held-whisper right-recipient ${m.holdRight}/20 — cross-identity leak`);
  if (m.holdRejoinGot !== TH.holdRejoinWant) fail.push(`re-rejoin got ${m.holdRejoinGot} whispers (want 0) — queue not drained`);
  if (m.holdForeign > TH.holdForeignMax) fail.push(`${m.holdForeign} foreign whispers seen by returning joiners`);
  if (m.holdOrder < TH.holdOrderAfterSnapshot) fail.push(`held delivery order after-snapshot only ${m.holdOrder}/20`);
  if (m.holdDups > TH.holdDupMax) fail.push(`${m.holdDups} duplicate held deliveries`);
  if (m.logWhisperLines > TH.logWhisperLines) fail.push(`${m.logWhisperLines} whisper verb lines in the world log — PRIVACY CONTRACT BROKEN`);
  if (m.snapWhisperHits > TH.snapWhisperHits) fail.push(`${m.snapWhisperHits} whisper texts in joiner snapshots — privacy leak`);
  if (m.logRawWhisperHits > TH.logRawWhisperHits) fail.push(`${m.logRawWhisperHits} whisper markers in raw log bytes`);
  if (m.specSendDelivered > TH.specSendDelivered) fail.push(`spectator whisper was DELIVERED (${m.specSendDelivered})`);
  if (m.specSendEchoed > TH.specSendEchoed) fail.push(`spectator whisper was ECHOED (${m.specSendEchoed})`);
  if (!m.specSendSilent) fail.push(`spectator-sender silence not observed`);
  if (m.soloSayP95 > TH.soloSayP95Ms) fail.push(`mid-storm solo say p95 ${Math.round(m.soloSayP95)}ms > ${TH.soloSayP95Ms}ms — whisper storm starved verb intake`);
  if (m.soloSayMisses > 0) fail.push(`${m.soloSayMisses} fairness says never echoed`);
  if (m.lightAppended < TH.lightAppended) fail.push(`lights appended ${m.lightAppended}/2`);
  if (m.fpsStormP50 < TH.fpsStormP50) fail.push(`storm-era fps p50 ${m.fpsStormP50.toFixed(1)} < ${TH.fpsStormP50} — presence starved`);
  if (m.gaps > TH.gapMax) fail.push(`${m.gaps} presence seq gaps`);
  if (m.probeP95 > TH.probeP95Ms) fail.push(`HTTP probe p95 ${Math.round(m.probeP95)}ms > ${TH.probeP95Ms}ms`);
  if (m.probeErrors > TH.probeErrors) fail.push(`${m.probeErrors} HTTP probe errors`);
  if (m.rosterMid !== TH.rosterMid) fail.push(`mid-storm roster ${m.rosterMid} != ${TH.rosterMid}`);
  if (m.finalPresent !== TH.finalPresent) fail.push(`final present ${m.finalPresent} != 0 — ghost sessions`);
  if (m.sliceEchoLen !== TH.sliceLen) fail.push(`boundary slice echo ${m.sliceEchoLen} != 4000 chars`);
  if (!m.giantEchoed) fail.push(`legal ~240KB whisper never echoed (at the 4000-char slice) — silent size kill`);
  if (m.recovered < TH.recovered) fail.push(`post-window whisper recovery ${m.recovered}/1 — refusals wedged the lane`);
  if (Math.abs(m.logTotalLines - m.logExpected) > TH.logLineDrift) fail.push(`log.jsonl lines ${m.logTotalLines} != expected ${m.logExpected} (drift ${Math.abs(m.logTotalLines - m.logExpected)})`);
  if (m.snapBytes > TH.snapMaxBytes) fail.push(`probe snapshot ${(m.snapBytes / 1e6).toFixed(1)}MB > ${TH.snapMaxBytes / 1e6}MB`);
  if (m.logSuspicious > TH.logSuspicious) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > TH.rssPeakGrowthMB) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > ${TH.rssPeakGrowthMB}MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    failed: 0, joinP95: 38,
    midJoinOk: 12, midEmbOk: 2, midJoinP95: 90,
    holdJoinOk: 20, holdJoinP95: 24,
    burstVerdicts: 60, rateNotes: 2, burstVerbsEchoed: 1,
    satKeepMin: 347, satAggregate: 2_781, satP95: 40,
    fatEchoes: 30, fatTarget: 30, fatAuthorP95: 22, fatTargetP95: 24, fatTextLen: 3_990,
    fatSpills: 0,
    holdExact: 20, holdRight: 20, holdRejoinGot: 0, holdForeign: 0,
    holdOrder: 20, holdDups: 0,
    logWhisperLines: 0, snapWhisperHits: 0, logRawWhisperHits: 0,
    specSendDelivered: 0, specSendEchoed: 0, specSendSilent: true,
    soloSayP95: 7, soloSayMisses: 0, lightAppended: 2,
    fpsStormP50: 14.6, gaps: 0, probeP95: 8, probeErrors: 0,
    rosterMid: 40, finalPresent: 0,
    sliceEchoLen: 4_000, giantEchoed: true,
    recovered: 1,
    logTotalLines: 42, logExpected: 42,
    snapBytes: 900_000, logSuspicious: 0, rssPeakGrowth: 28,
  };
  const bypass: Measurements = {
    ...healthy,
    burstVerdicts: 200, rateNotes: 0, burstVerbsEchoed: 25,
    satKeepMin: 118, satAggregate: 1_100, satP95: 2_100,
    fatEchoes: 11, fatTarget: 9, fatAuthorP95: 1_900, fatTargetP95: 2_300, fatTextLen: 3_990,
    fatSpills: 8,
    holdExact: 14, holdRight: 11, holdRejoinGot: 7, holdForeign: 5,
    holdOrder: 9, holdDups: 6,
    logWhisperLines: 12, snapWhisperHits: 9, logRawWhisperHits: 12,
    specSendDelivered: 1, specSendEchoed: 1, specSendSilent: false,
    soloSayP95: 2_400, soloSayMisses: 2, lightAppended: 1,
    fpsStormP50: 4.1, gaps: 5, probeP95: 2_600, probeErrors: 4,
    rosterMid: 37, finalPresent: 2,
    sliceEchoLen: 4_001, giantEchoed: false,
    recovered: 0,
    logTotalLines: 45, logExpected: 42,
    snapBytes: 10_500_000, logSuspicious: 5, rssPeakGrowth: 90,
  };
  const a = evaluate(healthy), b = evaluate(bypass);
  const want = [
    "bypassed the global rate budget", "dropped silently", "budgets not shared",
    "legal 58/s starved", "saturation aggregate", "saturation echo p95",
    "went silent", "target deliveries", "fat author p95", "fat target p95",
    "uninvited — fanout leak",
    "exactly-once", "right-recipient", "queue not drained", "foreign whispers", "after-snapshot", "duplicate held",
    "PRIVACY CONTRACT BROKEN", "joiner snapshots", "raw log bytes",
    "spectator whisper was DELIVERED", "spectator whisper was ECHOED", "silence not observed",
    "starved verb intake", "lights appended", "presence starved", "seq gaps",
    "ghost sessions", "boundary slice", "silent size kill", "wedged the lane",
    "lines 45 != expected 42", "10.5MB > 9.5MB", "suspicious server log", "RSS peak growth 90",
  ];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, bypass gates fire (${b.length} fails)` : `SELFTEST FAIL — a=[${a}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_ANCHOR_PERF + N_SAT + N_BURST + N_FAT + N_FAIR} embodied (${N_ANCHOR_PERF} posing performers @${POSE_HZ}Hz + ${N_SAT + N_BURST + N_FAT + N_FAIR} quiescent legs) + ${N_SPEC} spectators = ${N_ANCHOR_PERF + N_SAT + N_BURST + N_FAT + N_FAIR + N_SPEC} sockets; t+${BURST_AT / 1000}s BURST ${BURST_N} whispers + ${BURST_VERB_N} verb-says back-to-back (shared wallet); t+${SAT_AT / 1000}s SATURATION ${SAT_LEGS}x${SAT_PER_LEG} @${SAT_PACE_MS.toFixed(2)}ms (58/s each, all legal); t+${GHOST_AT / 1000}s GHOST-HOLD ${GHOST_KEYS} absent-recipient whispers (${GHOST_LEGS}x${GHOST_PER_LEG} @${GHOST_PACE_MS}ms, legs 8-11 +${GHOST_STAGGER_MS}ms); t+${FAT_AT / 1000}s FAT ${FAT_ROUNDS}x ${FAT_EMOJI_N}-char emoji whispers @${FAT_PACE_MS}ms; t+${FAIR_AT / 1000}s fairness; t+${BOUND_AT / 1000}s boundary slice+giant; t+${REC_AT / 1000}s recovery+spectator-sender; t+${DRAIN_AT / 1000}s drain; t+${HOLD_AT / 1000}s held-delivery phase (${HOLD_KEYS} returners); ${DURATION / 1000}s total, MSG_RATE=${MSG_RATE}, VERB_RATE=${VERB_RATE}/4s`);
console.log(`thresholds: joins=160/160@p95<${TH.joinP95Ms}ms mid=${TH.midJoins}+${TH.midEmb}@<${TH.midJoinP95}ms hold=20/20@<${TH.holdJoinP95}ms burstVerdicts<=${TH.burstVerdictsMax} rateNotes>=${TH.rateNotesMin} burstVerbsEcho<=${TH.burstVerbsEchoMax} satKeep>=${TH.satKeepMin}/${TH.satPerLeg} agg>=${TH.satAggregateMin}@p95<${TH.satP95}ms fat=${TH.fatEchoes}echo+${TH.fatTarget}del@p95<${TH.fatAuthorP95}/${TH.fatTargetP95}ms chars=${TH.fatTextChars} spill=${TH.fatSpillMax} holdExact=${TH.holdExact} right=${TH.holdRightMin} rejoin0 foreign=${TH.holdForeignMax} order=${TH.holdOrderAfterSnapshot} dup=${TH.holdDupMax} logWhisper=${TH.logWhisperLines} snapHits=${TH.snapWhisperHits} rawHits=${TH.logRawWhisperHits} specSend=0del/0echo/1silent soloSayP95<${TH.soloSayP95Ms}ms lights=${TH.lightAppended} fps>=${TH.fpsStormP50} gaps=${TH.gapMax} probeP95<${TH.probeP95Ms}ms roster=${TH.rosterMid} final=${TH.finalPresent} slice=${TH.sliceLen} giant=echo recover=${TH.recovered} logDrift=${TH.logLineDrift} snap<${(TH.snapMaxBytes / 1e6).toFixed(1)}MB suspicious=${TH.logSuspicious} rss<+${TH.rssPeakGrowthMB}MB`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-whisper.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure26-server-${Date.now()}.log`;
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

// ---- client chassis (emojiflood-proven, whisper-aware) ---------------------------
type Rx = { text: string; at: number; echo: boolean };
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; openAt: number; snapAt: number; snapBytes: number;
  closed: boolean; closeCode: number; id: string;
  probeHits: Map<string, number>;
  errs: string[];
  whisperRxs: Rx[];
  says: Set<string>;
};
const probeKeysLive = new Set<string>();
function connect(id: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], openAt: performance.now(), snapAt: 0, snapBytes: 0, closed: false, closeCode: 0, probeHits: new Map(), errs: [], whisperRxs: [], says: new Set() };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const rawStr = String(ev.data);
      // whisper frames are parsed at ANY size (the 4000-char slice contract
      // makes whisper echoes ≤ ~16.1KB; run-1's fast path silently dropped
      // them); only non-whisper giants would skip parsing (none in this run)
      if (rawStr.length > 8_000 && !rawStr.includes('"type":"whisper"')) return;
      let m: any;
      try { m = JSON.parse(rawStr); } catch { return; }
      if (m.type === "snapshot") {
        s.snapAt = performance.now();
        s.joinMs = s.snapAt - s.openAt;
        s.snapBytes = rawStr.length;
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "whisper") {
        if (typeof m.text === "string") s.whisperRxs.push({ text: m.text, at: performance.now(), echo: m.echo === true });
      } else if (m.type === "log") {
        const v = m.entry?.verb, a = m.entry?.args;
        if (v === "say" && typeof a?.text === "string") {
          s.says.add(a.text);
          if (probeKeysLive.has(a.text) && !s.probeHits.has(a.text)) s.probeHits.set(a.text, performance.now());
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

/** A probe client that joins, captures its snapshot + all frames, closes. */
function joinProbe(id: string, spectate: boolean, n = 0): Promise<{ joinMs: number; snapBytes: number; present: number; selfAbsent: boolean; snapRaw: string; whisperRxs: Rx[] }> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const openAt = performance.now();
    const out = { joinMs: -1, snapBytes: 0, present: -1, selfAbsent: false, snapRaw: "", whisperRxs: [] as Rx[] };
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(out); }, 15_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const raw = String(ev.data);
      let m: any;
      try { m = JSON.parse(raw); } catch { return; }
      if (m.type === "snapshot") {
        out.joinMs = performance.now() - openAt;
        out.snapBytes = raw.length;
        out.snapRaw = raw;
        const present = m.present;
        out.present = Array.isArray(present) ? present.length : -1;
        out.selfAbsent = Array.isArray(present) ? !present.some((p: any) => p?.id === id) : false;
        clearTimeout(to); try { ws.close(); } catch {} resolve(out);
      } else if (m.type === "whisper") {
        if (typeof m.text === "string") out.whisperRxs.push({ text: m.text, at: performance.now(), echo: m.echo === true });
      }
    };
    ws.onerror = () => { clearTimeout(to); resolve(out); };
  });
}

/** Flight-recorder pull over the WS debug message (the sanctioned shape). */
function pullDebug(kinds: string[]): Promise<any[]> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL);
    const events: any[] = [];
    const to = setTimeout(() => { try { ws.close(); } catch {} resolve(events); }, 5_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: `dbg-${Date.now() % 100000}`, spectate: true, avatar: "x.vrm", token: TOKEN }));
    ws.onmessage = (ev) => {
      let m: any;
      try { m = JSON.parse(String(ev.data)); } catch { return; }
      if (m.type === "snapshot") ws.send(JSON.stringify({ type: "debug", kinds, limit: 300 }));
      else if (m.type === "debug") { events.push(...(m.events ?? [])); clearTimeout(to); try { ws.close(); } catch {} resolve(events); }
    };
    ws.onerror = () => { clearTimeout(to); resolve(events); };
  });
}

// ---- run -------------------------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const all = await Promise.allSettled([
  ...Array.from({ length: N_ANCHOR_PERF }, (_, i) => connect(`perf-${i}`, false, i)),
  ...Array.from({ length: N_SAT }, (_, i) => connect(`sat-${i}`, false, 24 + i)),
  connect(`burst-0`, false, 32),
  connect(`fat-0`, false, 33),
  ...Array.from({ length: N_FAIR }, (_, i) => connect(`fair-${i}`, false, 34 + i)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const ok = all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec);
const failed = all.length - ok.length;
const perfs = ok.filter((s) => s.id.startsWith("perf-"));
const sats = ok.filter((s) => s.id.startsWith("sat-"));
const bursts = ok.filter((s) => s.id.startsWith("burst-"));
const fats = ok.filter((s) => s.id.startsWith("fat-"));
const fairs = ok.filter((s) => s.id.startsWith("fair-"));
const specs = ok.filter((s) => s.id.startsWith("spec-"));
const everyone = [...perfs, ...sats, ...bursts, ...fats, ...fairs, ...specs];
const joinTimes = ok.map((s) => s.joinMs);
console.log(`t+0: joined ${ok.length}/${all.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// embodied presence: ONLY the 24 anchor performers pose @15Hz (design target)
let running = true;
const posesSent = { n: 0 };
const tickers = perfs.map((s, i) => setInterval(() => {
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
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 2_000);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 2_500) {
    if (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak) rssSamples.peak = r;
  }
}, 500);

// ---- phase bookkeeping ------------------------------------------------------------
let lightsAppendedTotal = 0;
const soloSayLat: number[] = [];
let soloSayMisses = 0;
let lightAppended = 0;
const satKeysByLeg = new Map<number, string[]>();
const ghostKeys: string[] = [];
const fatTexts: string[] = [];
const W = (to: string, k: string) => JSON.stringify({ type: "whisper", to, text: `w:${k}` });
const WE = (to: string, text: string) => JSON.stringify({ type: "whisper", to, text });
// markers that ONLY whisper texts carry (legal say texts never contain these)
const whisperMarkers = ["w:WS26-", "G26-", "SL26-"];

// t+3.0s: anchor says + light (pre-storm evidence)
at(ANCHOR_AT, () => {
  for (let i = 1; i <= 3; i++) {
    const text = `anchor-say-${i}-${Math.floor(t0)}`;
    probeKeysLive.add(text);
    const s = perfs[i];
    if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  }
  probeKeysLive.add("light:plight-anchor");
  const s = perfs[4];
  if (s?.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: "light", args: { id: "plight-anchor", pos: [0, 2, 0], color: "#ffb46b", intensity: 0.9, range: 5 } }));
  setTimeout(() => { if (perfs[4]?.probeHits.has("light:plight-anchor")) { lightsAppendedTotal++; lightAppended++; } }, ANCHOR_AT + 2_500 - (performance.now() - t0));
});

// t+6.5s: THE BURST — 200 back-to-back whispers + 25 back-to-back verb says
let burstVerdicts = 0, burstEchoes = 0, burstVerbsEchoed = 0;
const burstWin = { start: 0, end: 0 };
at(BURST_AT, () => {
  const B = bursts[0];
  const TARGET = perfs[1];
  if (!B || !TARGET || B.ws.readyState !== 1) return;
  burstWin.start = performance.now();
  burstWin.end = burstWin.start + 1_000;
  for (let k = 0; k < BURST_N; k++) B.ws.send(W(TARGET.id, `WS26-burst-${k}`));
  for (let k = 0; k < BURST_VERB_N; k++) {
    probeKeysLive.add(`WS26-bverb-${k}`);
    B.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: `WS26-bverb-${k}` } }));
  }
  setTimeout(() => {
    const inWin = (atMs: number) => atMs >= burstWin.start - 50 && atMs <= burstWin.end + 50;
    burstEchoes = B.whisperRxs.filter((r) => r.text.startsWith("w:WS26-burst-") && inWin(r.at)).length;
    const absentErrs = B.errs.filter((e) => e.includes("isn't here")).length;   // burst target is present: expect 0
    burstVerdicts = burstEchoes + absentErrs;
    burstVerbsEchoed = [...B.probeHits.keys()].filter((k) => k.startsWith("WS26-bverb-")).length;
    console.log(`t+${BURST_AT / 1000}s settle: burst echoes ${burstEchoes}, verdicts ${burstVerdicts} (gate <=${TH.burstVerdictsMax}), verb-say echoes ${burstVerbsEchoed}/${BURST_VERB_N} (gate <=${TH.burstVerbsEchoMax})`);
  }, 4_500);
});

// t+9.0s: SATURATION — 8 quiescent legs x 348 @16.67ms (58/s) to present perf-0/2
const satSendAt = new Map<string, number>();   // key -> actual send timestamp
at(SAT_AT, () => {
  sats.forEach((s, si) => {
    const target = si % 2 === 0 ? perfs[0] : perfs[2];
    if (!target) return;
    const keys: string[] = [];
    for (let k = 0; k < SAT_PER_LEG; k++) {
      const key = `WS26-sat-${si}-${k}`;
      keys.push(key);
      setTimeout(() => {
        if (s.ws.readyState !== 1) return;
        satSendAt.set(key, performance.now());
        s.ws.send(W(target.id, key));
      }, k * SAT_PACE_MS);
    }
    satKeysByLeg.set(si, keys);
  });
});

// t+~15.8s: GHOST-HOLD — 600 whispers to 600 distinct absent recipients
at(GHOST_AT, () => {
  for (let leg = 0; leg < GHOST_LEGS; leg++) {
    const s = sats[leg % sats.length];
    if (!s || s.ws.readyState !== 1) continue;
    const stagger = leg >= 8 ? GHOST_STAGGER_MS : 0;   // reused senders stay under 60/s
    for (let k = 0; k < GHOST_PER_LEG; k++) {
      const idx = leg * GHOST_PER_LEG + k;
      ghostKeys.push(`WS26-ghost-${idx}`);
      setTimeout(() => { if (s.ws.readyState === 1) s.ws.send(W(`WS26-ghost-${idx}`, `WS26-gh-${idx}`)); }, stagger + k * GHOST_PACE_MS);
    }
  }
});

// t+14.0s: FAT — 30 rounds @300ms of 3990-UTF-16-unit emoji whispers to
// present perf-3. NOTE (run-2 decode): 🦆 is U+1F986 = a SURROGATE PAIR = 2
// JS string units, so the server's slice(0,4000) caps text at 4000 UNITS —
// the honest wire ceiling is 2000 emoji ≈ 8.0KB UTF-8 (or 4000 ASCII chars
// = 4KB), NOT "4000 emoji ≈ 16KB" as first drafted. Texts here are exactly
// 3990 units (6 ASCII + 1992 emoji) so they traverse UNSLICED and the
// byte-preservation gate compares whole strings.
const fatSendAt = new Map<string, number>();
at(FAT_AT, () => {
  const F = fats[0];
  const TARGET = perfs[3];
  if (!F || !TARGET) return;
  for (let r = 0; r < FAT_ROUNDS; r++) {
    const text = `G26-${r} ` + "🦆".repeat((FAT_EMOJI_N - 6) / 2);   // 6 + 1992×2 = 3990 units
    fatTexts.push(text);
    setTimeout(() => {
      if (F.ws.readyState !== 1) return;
      fatSendAt.set(text, performance.now());
      F.ws.send(WE(TARGET.id, text));
    }, r * FAT_PACE_MS);
  }
});

// t+15.5s: FAIRNESS — solo say + light; t+15.7s joins; roster
at(FAIR_AT, () => {
  const sentAt = performance.now();
  const text = `fair-say-${Math.floor(t0)}`;
  probeKeysLive.add(text);
  const SOLO = fairs[0];
  if (SOLO?.ws.readyState === 1) SOLO.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
  setTimeout(() => {
    const hit = SOLO?.probeHits.get(text);
    if (hit !== undefined) soloSayLat.push(hit - sentAt);
    else soloSayMisses++;
  }, 2_000);
});
at(FAIR_LIGHT_AT, () => {
  probeKeysLive.add("light:plight-fair");
  const LIGHTER = fairs[1];
  if (LIGHTER?.ws.readyState === 1) LIGHTER.ws.send(JSON.stringify({ type: "verb", verb: "light", args: { id: "plight-fair", pos: [2, 2, 0], color: "#ffb46b", intensity: 0.8, range: 4 } }));
  setTimeout(() => { if (LIGHTER?.probeHits.has("light:plight-fair")) { lightAppended++; lightsAppendedTotal++; } }, 2_000);
});
let midJoinOk = 0, midEmbOk = 0; const midJoinMs: number[] = [];
const midSnaps: { snapRaw: string; snapBytes: number }[] = [];
at(FAIR_JOIN_AT, async () => {
  const rs = await Promise.all([
    ...Array.from({ length: TH.midJoins }, (_, i) => joinProbe(`ms-probe-${i}-${Math.floor(t0)}`, true)),
    joinProbe(`ms-emb-0-${Math.floor(t0)}`, false, 50),
    joinProbe(`ms-emb-1-${Math.floor(t0)}`, false, 51),
  ]);
  for (const r of rs) if (r.joinMs > 0) { midJoinOk++; midJoinMs.push(r.joinMs); midSnaps.push({ snapRaw: r.snapRaw, snapBytes: r.snapBytes }); }
  midEmbOk = rs.slice(TH.midJoins).filter((r) => r.joinMs > 0).length;
  console.log(`t+${FAIR_JOIN_AT / 1000}s: mid-storm joins ${midJoinOk}/14 (emb ${midEmbOk}/2) p95 ${Math.round(pct(midJoinMs, 95))}ms`);
});
let rosterMid = -1;
at(FAIR_AT + 1_000, async () => {
  const r = await joinProbe(`ms-roster-${Math.floor(t0)}`, true);
  rosterMid = r.present;
  console.log(`t+${(FAIR_AT + 1_000) / 1000}s: roster mid-storm present=${r.present}`);
});

// t+24.5s: BOUNDARY — 4001-char slice contract + legal ~240KB giant (sliced)
let sliceEchoLen = -1, giantEchoed = false;
at(BOUND_AT, () => {
  const F = fats[0];
  const T5 = perfs[5];
  if (!F || !T5 || F.ws.readyState !== 1) return;
  const sliceText = "SL26-" + "S".repeat(BOUND_SLICE - 4);
  F.ws.send(WE(T5.id, sliceText));
  setTimeout(() => {
    const rx = F.whisperRxs.find((r) => r.text.startsWith("SL26-") && r.text.endsWith("SSSS"));
    sliceEchoLen = rx ? rx.text.length : -1;
  }, 1_200);
  // legal giant: 60,000 emoji chars = 240KB wire — under the 256KB frame
  // gate; the server's 4000-char slice caps the echo at 4000 chars by design
  const giantText = "SL26-GIANT " + "🦆".repeat(BOUND_GIANT_EMOJI);
  setTimeout(() => { if (F.ws.readyState === 1) F.ws.send(WE(T5.id, giantText)); }, 300);
  setTimeout(() => {
    giantEchoed = F.whisperRxs.some((r) => r.text.length === 4_000 && r.text.startsWith("SL26-GIANT"));
  }, 1_800);
});

// t+26.0s: RECOVERY + spectator-sender silence
let recovered = 0;
const specSend = { delivered: 0, echoed: 0, silent: false };
at(REC_AT, () => {
  const B = bursts[0];
  const T6 = perfs[6];
  if (B?.ws.readyState === 1 && T6) {
    B.ws.send(W(T6.id, "WS26-recovered"));
    setTimeout(() => {
      recovered = B.whisperRxs.some((r) => r.text === "w:WS26-recovered") ? 1 : 0;
    }, 1_200);
  }
  const S0 = specs[0];
  const T7 = perfs[7];
  if (S0?.ws.readyState === 1 && T7) {
    S0.ws.send(W(T7.id, "WS26-spec-send"));
    setTimeout(() => {
      specSend.delivered = T7.whisperRxs.filter((r) => r.text === "w:WS26-spec-send").length;
      specSend.echoed = S0.whisperRxs.filter((r) => r.text === "w:WS26-spec-send").length;
      specSend.silent = specSend.delivered === 0 && specSend.echoed === 0;
    }, 1_200);
  }
});

// t+28.0s: DRAIN — everyone closes (ghost-hold queues remain by design)
let drainAt = 0;
at(DRAIN_AT, async () => {
  running = false;
  tickers.forEach(clearInterval);
  drainAt = performance.now();
  for (const s of ok) { try { s.ws.close(); } catch {} }
  await sleep(1_500);
  const r = await joinProbe(`drain-check-${Math.floor(t0)}`, true);
  console.log(`t+${DRAIN_AT / 1000}s: drained — present=${r.present} (senders closed; ghost-hold queues remain by design)`);
});

// t+31.5s: HOLD — 20 returners join under their EXACT ghost ids
type HoldResult = { joinMs: number; got: number; right: boolean; foreign: number; order: boolean };
let holdResults: HoldResult[] = [];
let holdRejoinGot = -1;
at(HOLD_AT, async () => {
  holdResults = await Promise.all(ghostKeys.slice(0, HOLD_KEYS).map((rid, i) =>
    (async (): Promise<HoldResult> => {
      const s = await connect(rid, false, 60 + (i % 8)).catch(() => null as unknown as Spec | null);
      if (!s) return { joinMs: -1, got: 0, right: false, foreign: 0, order: false };
      await sleep(700);
      const mine = s.whisperRxs.filter((r) => r.text === `w:WS26-gh-${i}`);
      const others = s.whisperRxs.filter((r) => r.text.startsWith("w:") && r.text !== `w:WS26-gh-${i}`);
      const orderOk = s.whisperRxs.every((r) => r.at >= s.snapAt - 5);
      const res: HoldResult = { joinMs: s.joinMs, got: mine.length, right: mine.length === 1, foreign: others.length, order: orderOk };
      try { s.ws.close(); } catch {}
      return res;
    })()
  ));
  // re-rejoin of ghost-0: its queue must be drained
  const re = await connect(ghostKeys[0], false, 61).catch(() => null as unknown as Spec | null);
  if (re) {
    await sleep(700);
    holdRejoinGot = re.whisperRxs.filter((r) => r.text === "w:WS26-gh-0").length;
    try { re.ws.close(); } catch {}
  }
  const got = holdResults.filter((r) => r.got === 1).length;
  console.log(`t+${HOLD_AT / 1000}s: held delivery — exactly-once ${got}/20, re-rejoin got ${holdRejoinGot} (want 0)`);
});

// ---- teardown ----------------------------------------------------------------------
await sleep(DURATION - (performance.now() - t0) + 200);
clearInterval(probeTimer);
clearInterval(rssTimer);

// saturation accounting (teardown-time, race-free)
const satKeep: number[] = [];
const satEchoLat: number[] = [];
let satAggregate = 0;
sats.forEach((s, si) => {
  const keys = satKeysByLeg.get(si) ?? [];
  let kept = 0;
  keys.forEach((k) => {
    const r = s.whisperRxs.find((x) => x.text === `w:${k}`);
    if (r) { kept++; const sent = satSendAt.get(k); if (sent !== undefined) satEchoLat.push(r.at - sent); }
  });
  satKeep.push(kept);
  satAggregate += kept;
});

// fat accounting (author echo + target delivery, per-round latency)
const F = fats[0];
const TARGET3 = perfs[3];
let fatEchoCount = 0, fatTargetCount = 0, fatEchoLen = -1;
const fatEchoLat: number[] = [], fatTargetLat: number[] = [];
fatTexts.forEach((t, i) => {
  const sent = fatSendAt.get(t);
  const ae = F?.whisperRxs.find((r) => r.text === t);
  if (ae) { fatEchoCount++; if (sent !== undefined) fatEchoLat.push(ae.at - sent); if (fatEchoLen < 0) fatEchoLen = ae.text.length; }
  const td = TARGET3?.whisperRxs.find((r) => r.text === t);
  if (td && sent !== undefined) { fatTargetCount++; fatTargetLat.push(td.at - sent); }
  else if (td) fatTargetCount++;
});
// spill: any socket other than author + target that saw ANY fat text
let fatSpills = 0;
for (const s of everyone) {
  if (s === F || s === TARGET3) continue;
  if (s.whisperRxs.some((r) => r.text.includes("G26-"))) fatSpills++;
}

// hold accounting
const holdExact = holdResults.filter((r) => r.got === 1).length;
const holdRight = holdResults.filter((r) => r.right && r.foreign === 0).length;
const holdForeign = holdResults.reduce((a, r) => a + r.foreign, 0);
const holdOrder = holdResults.filter((r) => r.order).length;
const holdDups = holdResults.filter((r) => r.got > 1).length;
const holdJoinOk = holdResults.filter((r) => r.joinMs > 0).length;
const holdJoinMs = holdResults.filter((r) => r.joinMs > 0).map((r) => r.joinMs);

// flight recorder: rate-limit notes for the burst leg
let rateNotes = 0;
try {
  const events = await pullDebug([RATE_NOTE_KIND]);
  rateNotes = events.filter((e: any) => e?.kind === RATE_NOTE_KIND && e?.who === "burst-0").length;
} catch { rateNotes = 0; }

// final empty-world probe
const finalProbe = await joinProbe(`final-empty-${Math.floor(t0)}`, true);

// world log ground truth
const worldLogPath = `${WORLDS}/${WORLD}/log.jsonl`;
let logTotalLines = -1, logWhisperLines = -1, logRawWhisperHits = -1, logExpected = -1;
if (existsSync(worldLogPath)) {
  const raw = readFileSync(worldLogPath, "utf8");
  const wl = raw.split("\n").filter(Boolean);
  logTotalLines = wl.length;
  logWhisperLines = 0;
  for (const l of wl) {
    try { const e = JSON.parse(l); if (e.verb === "whisper") logWhisperLines++; } catch { /* torn tail counts as drift */ }
  }
  const echoedSays = [...probeKeysLive].filter((k) => !k.startsWith("light:") && !k.includes("🦆") && k.length < 200)
    .filter((k) => everyone.some((s) => s.probeHits.has(k))).length;
  logExpected = 2 + echoedSays + lightsAppendedTotal;   // genesis + auto-owner grant + says + lights
  logRawWhisperHits = whisperMarkers.reduce((a, mk) => a + (raw.split(mk).length - 1), 0);
}
// snapshot privacy sweep: every probe snapshot collected this run
const allSnapRaw = [...midSnaps.map((s) => s.snapRaw), finalProbe.snapRaw].filter(Boolean);
let snapWhisperHits = 0;
for (const raw of allSnapRaw) for (const mk of whisperMarkers) snapWhisperHits += raw.split(mk).length - 1;
const snapBytesMax = Math.max(0, ...midSnaps.map((s) => s.snapBytes), finalProbe.snapBytes);

// server log census
const log = await logFile.text();
const logLines = log.split("\n").filter(Boolean);
const suspicious = logLines.filter((l: string) => /error|warn|uncaught|failed/i.test(l));

const fpsEnd = drainAt || performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (fpsEnd - s.snapAt - 500) / 1000));
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const latAll = specs.flatMap((s) => s.lat);
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

const m: Measurements = {
  failed, joinP95: pct(joinTimes, 95),
  midJoinOk, midEmbOk, midJoinP95: pct(midJoinMs, 95),
  holdJoinOk, holdJoinP95: pct(holdJoinMs, 95),
  burstVerdicts, rateNotes, burstVerbsEchoed,
  satKeepMin: satKeep.length ? Math.min(...satKeep) : 0,
  satAggregate, satP95: pct(satEchoLat.filter((x) => x >= 0), 95),
  fatEchoes: fatEchoCount, fatTarget: fatTargetCount,
  fatAuthorP95: pct(fatEchoLat, 95), fatTargetP95: pct(fatTargetLat, 95),
  fatTextLen: fatEchoLen, fatSpills,
  holdExact, holdRight, holdRejoinGot: holdRejoinGot < 0 ? 99 : holdRejoinGot, holdForeign,
  holdOrder, holdDups,
  logWhisperLines, snapWhisperHits, logRawWhisperHits,
  specSendDelivered: specSend.delivered, specSendEchoed: specSend.echoed, specSendSilent: specSend.silent,
  soloSayP95: soloSayLat.length ? pct(soloSayLat, 95) : Infinity, soloSayMisses, lightAppended,
  fpsStormP50: pct(fpsPer.filter(Number.isFinite), 50), gaps: gapsTotal,
  probeP95: pct(probeSamples, 95), probeErrors: probeErrors.n,
  rosterMid, finalPresent: finalProbe.present,
  sliceEchoLen, giantEchoed,
  recovered,
  logTotalLines, logExpected,
  snapBytes: snapBytesMax, logSuspicious: suspicious.length, rssPeakGrowth,
};

console.log(`
results
  poses sent            ${posesSent.n} (24 performers only)
  initial joins         ${ok.length}/${all.length} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(m.joinP95)}ms
  mid-storm joins       ${midJoinOk}/14 (emb ${midEmbOk}/2) — p95 ${Math.round(m.midJoinP95)}ms
  BURST                 verdicts ${burstVerdicts} (gate <=${TH.burstVerdictsMax}) — echoes ${burstEchoes}; rate-notes ${rateNotes} (>=${TH.rateNotesMin}); shared-wallet verb echoes ${burstVerbsEchoed}/${BURST_VERB_N} (gate <=${TH.burstVerbsEchoMax})
  SATURATION            kept [${satKeep.join(",")}] of ${SAT_PER_LEG} — aggregate ${satAggregate}/${SAT_LEGS * SAT_PER_LEG}, echo p95 ${Math.round(m.satP95)}ms
  FAT                   author echoes ${fatEchoCount}/${FAT_ROUNDS} p95 ${Math.round(m.fatAuthorP95)}ms; target ${fatTargetCount}/${FAT_ROUNDS} p95 ${Math.round(m.fatTargetP95)}ms; echo len ${fatEchoLen} chars; spills ${fatSpills}
  GHOST-HOLD            keys ${ghostKeys.length}; exactly-once ${holdExact}/20, right+foreign-free ${holdRight}/20, foreign ${holdForeign}, order-after-snapshot ${holdOrder}/20, dups ${holdDups}, re-rejoin ${holdRejoinGot}
  PRIVACY               log whisper verb lines ${logWhisperLines}, raw log marker hits ${logRawWhisperHits}, snapshot marker hits ${snapWhisperHits}
  SPECTATOR SENDER      delivered ${specSend.delivered} echoed ${specSend.echoed} silent=${specSend.silent}
  fairness              solo say ${soloSayLat.length} echoed / ${soloSayMisses} missed — p95 ${Number.isFinite(m.soloSayP95) ? Math.round(m.soloSayP95) : "MISSED"}ms; lights ${lightAppended}/2
  presence              fps p50 ${m.fpsStormP50.toFixed(1)}, gaps ${gapsTotal}, frame lat p50 ${Math.round(pct(latAll, 50))}ms p95 ${Math.round(pct(latAll, 95))}ms
  boundary              slice echo ${sliceEchoLen} chars (want 4000); giant echoed=${giantEchoed}
  recovery              ${recovered}/1
  rosters               mid-storm ${rosterMid} (want ${TH.rosterMid}) — final present ${finalProbe.present}
  world log             lines ${logTotalLines} expected ~${logExpected} (genesis+grant+echoed says+lights)
  probe snapshot        max ${(snapBytesMax / 1e6).toFixed(2)}MB
  http probe p95        ${Math.round(m.probeP95)}ms (n=${probeSamples.length}, ${probeErrors.n} errors)
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${logLines.length} lines, ${suspicious.length} suspicious
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

server.kill("SIGTERM");
await server.exited;
const fail = evaluate(m);
console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — targeted messages cannot bypass the global rate budget`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
