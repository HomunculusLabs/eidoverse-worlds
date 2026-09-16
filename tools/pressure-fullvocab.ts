// Pressure scenario 32: FULL-VOCABULARY WORLD — a scratch world carrying every
// shipped comp family at once; join, fold, restart, replay all consistent.
//
// The scenario is the census itself (mcpl/agent.ts names 27 known comp types;
// client consumes more): ONE scratch world where every family is spawned +
// authored + EXERCISED through its legal use action(s), then — at quiet and
// mid-traffic moments — fresh joiners receive a snapshot whose folded state
// contains every family, a SIGKILL restart replays the log into the SAME
// folded state, and the derived log-line arithmetic is EXACT (every engine
// emission is a pinned comp+say pair or a logged use; nothing drifts).
//
// Out of scope (disclosed, not patched): time-driven emissions (bell tolls,
// weatherzone releases — dedicated scenarios pressure-24/28; the sky is
// PINNED to a fixed hour so bells never toll here), presence-plane sounds
// (music/water/chime — counted report-only), puppet routing, portal/waystone
// TRAVEL (authored + census-verified; firing travel would move users across
// worlds — their own scenario, pressure-7/14).
//
// Family census (28 comp types across 30 entities):
//   sockets+reactions+motion(pendulum) on t-socket · particles t-hearth ·
//   motion(spin) t-car · motion:spin_ t-spin · lock t-sign · lamp t-lamp +
//   tour line L0..L2 · guestbook t-guestbook · plate t-plate · portal
//   t-portal (dest seeded) · music t-music · door+chime t-door · water
//   t-water · growth t-growth · garden t-garden · companion t-companion ·
//   weatherzone t-weatherzone · waystone t-waystone · reservation
//   t-reservation · board t-board · vendor t-vendor · bell t-bell · tour
//   t-tour · sequencer t-sequencer · dedication t-dedication · soundpost
//   t-soundpost · ladder t-swing.
//
// Population (pinned before measuring — 160 anchors + ~8 legs, ~200 peak):
//   24 embodied perf (0..3 authors+walkers, 4..9 static posed users) @15Hz
//   + 136 spectators (seer = witness) + seeder(destworld) + 3 fold probes +
//   1 mid-traffic embodied joiner + final quiet snapshot + restart probe.
//
// Timeline (wall t):
//   t+0.0   perf-0 joins (fresh world owner) then 23 perf + 136 spec.
//   t+0.8   seeder joins world "destworld" (portal target registry), closes.
//   t+1.0   perf-0 winds sky {hours:22} — FIXED clock: bells never toll,
//           midnight never crosses (both are other scenarios' seams).
//   t+1.4   spawn wave: 30 entities (27 ring targets r13 + 3 tour lamps
//           r15), split across perf-0..3, 380ms per author (12/4s law).
//   t+5.0   comp wave: 34 authorings split across perf-0..3, 380ms each.
//   t+9.6   users 4..9 pose beside their targets (1.3m inside the ring).
//   t+10.0  USE WAVE A (16 verbs, 380ms apart, actor re-posed 120ms before
//           each fire so every reach gate passes): light, open, flow,
//           advance, plant, sign, write, post, dedicate, reserve, buy,
//           mute, seq, begin(tour), play(music), beacon(companion).
//   t+16.5  fold probe A + fair say 1.
//   t+17.0  USE WAVE B (12 verbs): snuff, close, still, tend, erase,
//           unpost, retract, release, unmute, start(sequencer), halt(tour),
//           push(t-socket reactions → pendulum impulse).
//           (Tour cue t:1s fired ~t+16 via the 1Hz sweep: L0 ignite +
//           re-anchor.)
//   t+21.8  fold probe B + fair say 2. t+22.0 mid-traffic embodied joiner.
//   t+22.4  fold probe C.
//   t+24.0  teardown (all sockets close).
//   t+25.5  final QUIET snapshot: fold-equal + census 28/28.
//   t+30.0  SIGKILL → restart → replay fold EXACT-equal + census 28/28 +
//           2 sweeps mint nothing (drift 0) + present 0.
//
// Derived log arithmetic (pinned; drift must be 0):
//   2 base (genesis + auto owner-grant)
// + 1 sky
// + 30 spawns
// + 34 human comps (26 A + 5 A2 + 3 tour lamps)
// + 17 uses (wave A) + 33 engine: lamp-light 4 (comp+light+mount+say) ·
//     14× comp+say (door, water, growth, garden, guestbook, plate, board,
//     dedication, reservation, vendor, soundpost, sequencer, tour begin)
//     = 28 · weatherzone ask 3 (weather verb + comp + say) · music 0 ·
//     companion beacon 2 → 37? recount vs run-1 histogram: world comps 26
//     (incl. lamp×3, tour×3) + light 2 + mount 2 + remove 1 + motion 1 +
//     weather 1 + says 26 = 59 engine lines
// + 12 uses (wave B) — included above (door/water/growth/gb/board/ded/
//     resv/sp/tour-halt pairs + lamp snuff comp+remove+say + push motion)
// + 4 tour sweep (L0 ignite comp+light+mount + tour re-anchor comp)
// + 2 fair says (perf-2)
// = 2+1+30+33+17+59+12+4+2 = 160? — run-1 histogram reconciles: the
// authored-comps wave has 33 human comps (26 A + 4 A2 + 3 lamps; run-1
// pinned 34 but the histogram says 33 — A2 lost one), and engine total
// FINAL pin: 160 — run-1's 156 had the seq comp poisoned (no steps), so
// BOTH sequencer emissions were absent; with the fixed use, wave-A seq
// writes comp+say AND wave-B start succeeds comp+say = +4 (run-2 histogram:
// comp:world:sequencer=2, says(world) 25→27). All else reconciles exactly.
//
// Acceptance gates (pinned before measuring — see TH):
//   anchors 160/160 p95<3s · spawn 30/30 · comps 34/34 · 0 author errors ·
//   uses 16+12 fired · 0 rate refusals · census 28/28 at ALL 5 probes (A,B,C,
//   final quiet, restart) · 0 engine-marker misses on the final fold ·
//   fold probes 3/3 == fold(log through covered) · final quiet fold-equal ·
//   log 157 EXACT · restart boot+fold EXACT+drift 0+present 0+census 28 ·
//   says 2/2 p95<500ms · fps p50≥12 · lat p95<250ms · gaps≤300 ·
//   RSS <+60MB · 0 suspicious · HTTP probe p95<500ms.
//
//   SERVER_DIR=/tmp/pressure32-wt PORT=8969 WORLDS_DIR=/tmp/pressure32-worlds bun tools/pressure-fullvocab.ts
//   SELFTEST=1 bun tools/pressure-fullvocab.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { emptyState, foldEntry } from "../shared/fold.js";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure32-wt";
const PORT = Number(process.env.PORT ?? 8969);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure32-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "loadtest";
const DEST_WORLD = "destworld";
const N_PERF = 24, N_SPEC = 136;
const POSE_HZ = 15;
const RING_R = 13;
const FAMILIES = 28;
const SELFTEST = process.env.SELFTEST === "1";
const LOG_JSONL = `${WORLDS}/${WORLD}/log.jsonl`;
const MSG_RATE = "600";
const RATE_REFUSAL = "slow down — verb rate limit";

const SEED_AT = 800, SKY_AT = 1_000, SPAWN_WAVE_AT = 1_400, COMP_WAVE_AT = 5_000;
const POSE_AT = 9_600, USE_A_AT = 10_000, USE_B_AT = 17_000;
const FOLD_A_AT = 16_500, FOLD_B_AT = 21_800, FOLD_C_AT = 22_400, MIDJOIN_AT = 22_000;
const TEARDOWN_AT = 24_000, QUIET_AT = 25_500, KILL_AT = 30_000;
const DURATION = 40_000;

// targets on the ring (id → polar deg). 26 + pet = 27; +3 tour lamps = 30.
const TARGETS: Array<[string, number]> = [
  ["t-lamp", 0], ["t-door", 27.7], ["t-plate", 55.4], ["t-water", 83.1],
  ["t-growth", 110.8], ["t-garden", 138.5], ["t-guestbook", 166.2],
  ["t-board", 193.8], ["t-dedication", 221.5], ["t-reservation", 249.2],
  ["t-vendor", 276.9], ["t-soundpost", 304.6], ["t-sequencer", 332.3],
  ["t-tour", 359.99], ["t-music", 26], ["t-portal", 54], ["t-waystone", 82],
  ["t-bell", 110], ["t-weatherzone", 138], ["t-companion", 166],
  ["t-socket", 194], ["t-car", 222], ["t-spin", 250], ["t-sign", 278],
  ["t-swing", 306], ["t-hearth", 334],
];
const PET = "t-pet";
const TARGET_IDS = [...TARGETS.map(([id]) => id), PET];
const TOUR_LAMPS = ["L0", "L1", "L2"];
const N_SPAWN = TARGET_IDS.length + TOUR_LAMPS.length;   // 30
const deg = (d: number) => (d * Math.PI) / 180;
const posOf = (id: string): number[] => {
  const e = TARGETS.find(([t]) => t === id);
  const a = e ? deg(e[1]) : 0;
  return [Math.round(RING_R * Math.cos(a) * 100) / 100, 0, Math.round(RING_R * Math.sin(a) * 100) / 100];
};
const standNear = (id: string): number[] => {
  const p = posOf(id);
  return [Math.round(p[0] * 0.9 * 100) / 100, 0, Math.round(p[2] * 0.9 * 100) / 100];  // ~1.3m inside
};

// authorship plan: [target, compType, data, authorIdx] — 26 + 5 = 31, +3 lamps = 34.
const A: Array<[string, string, any, number]> = [
  ["t-lamp", "lamp", { intensity: 6, range: 6 }, 0],
  ["t-door", "door", { deg: 110, swingSec: 1.4, reach: 6, openAt: "the gate swings open", closeAt: "the gate closes" }, 0],
  ["t-plate", "plate", { maxLen: 120 }, 0],
  ["t-water", "water", { fall: 2, reach: 6, flowAt: "the fountain wakes", stillAt: "the fountain sleeps" }, 0],
  ["t-growth", "growth", { stages: [{ name: "seed", dwell: 600 }, { name: "sprout", dwell: 600 }, { name: "bloom", dwell: 600 }], growAt: "the seedling grows", tendAt: "the seedling is tended" }, 0],
  ["t-garden", "garden", { cols: 3, rows: 3, pitch: 1.2, crops: { radish: [{ name: "sprout", dwell: 1.2 }, { name: "plump", dwell: 30 }] }, logCap: 3, plantAt: "puts a seed in the earth" }, 1],
  ["t-guestbook", "guestbook", { cap: 20 }, 1],
  ["t-board", "board", { maxLen: 60 }, 1],
  ["t-dedication", "dedication", { maxLen: 120, dedicateAt: "a line is carved" }, 1],
  ["t-reservation", "reservation", { holdSec: 120, reach: 6, reserveAt: "the chair is spoken for" }, 1],
  ["t-vendor", "vendor", { wares: { tea: 2 }, salesCap: 2, buyAt: "hands over the goods" }, 1],
  ["t-soundpost", "soundpost", { timbre: "drone", hz: 220, gain: 0.4, range: 30 }, 1],
  ["t-sequencer", "sequencer", { bpm: 120, gain: 0.6, reach: 4 }, 2],
  ["t-tour", "tour", { line: TOUR_LAMPS, cues: [{ t: 1, on: [0] }], beginAt: "the tour begins", haltAt: "the tour halts" }, 2],
  ["t-music", "music", { notes: { ding: "C5" } }, 2],
  ["t-portal", "portal", { to: DEST_WORLD }, 2],
  ["t-waystone", "waystone", { pair: "t-lamp" }, 2],
  ["t-bell", "bell", { hours: [10.5], n: 3, sec: 0.5, minGap: 10, base: "E4" }, 2],
  ["t-weatherzone", "weatherzone", { states: ["rain", "clear"], holdSec: 300, reach: 4, askAt: "the sky answers" }, 3],
  ["t-companion", "companion", { name: "Hop", radius: 2.2 }, 3],
  ["t-socket", "sockets", { seat: { pos: [0, 0.55, 0] } }, 3],
  ["t-car", "motion", { type: "spin", axis: [0, 1, 0], rpm: 3, t0: 0 }, 3],
  ["t-spin", "motion:spin_", { type: "spin", axis: [0, 1, 0], rpm: 6, t0: 0 }, 3],
  ["t-hearth", "particles", { preset: "fire", origin: [0, 0.25, 0], count: 60 }, 3],
  ["t-sign", "lock", true, 3],
];
const A2: Array<[string, string, any, number]> = [
  ["t-socket", "reactions", { push: { impulse: 0.35 } }, 0],
  ["t-socket", "motion", { type: "pendulum", axis: [1, 0, 0], pivot: [0, 2.4, 0], amp: 0, period: 3.2, damp: 0.06 }, 1],
  ["t-swing", "motion", { type: "pendulum", axis: [1, 0, 0], pivot: [0, 2.4, 0], amp: 0, period: 3.2, damp: 0.06 }, 1],
  ["t-swing", "ladder", { min: [-0.3, 0, -0.3], max: [0.3, 3, 0.3] }, 2],
  ["t-door", "chime", { openHz: "A5", closeHz: 260, minGap: 4 }, 3],
];
const N_COMP = A.length + A2.length + TOUR_LAMPS.length;  // 34

// use waves: [id, action, extra, actorIdx]. Actor re-posed 120ms before fire.
const UA: Array<[string, string, any, number]> = [
  ["t-lamp", "light", null, 4],
  ["t-door", "open", null, 4],
  ["t-water", "flow", null, 4],
  ["t-growth", "advance", null, 5],
  ["t-garden", "plant", null, 5],
  ["t-guestbook", "sign", { text: "first" }, 5],
  ["t-plate", "write", { text: "hello" }, 5],
  ["t-board", "post", { text: "news" }, 6],
  ["t-dedication", "dedicate", { text: "for bill" }, 6],
  ["t-reservation", "reserve", null, 6],
  ["t-vendor", "buy", null, 6],
  ["t-soundpost", "mute", null, 7],
  ["t-sequencer", "seq", { steps: [0, null, 4, null, 2, null, 5, null, 0, null, 4, null, 2, null, 6, null] }, 7],
  ["t-tour", "begin", null, 7],
  ["t-music", "play", null, 7],
  ["t-companion", "beacon", { name: "Hop" }, 8],
  ["t-weatherzone", "rain", null, 9],
];
const UB: Array<[string, string, any, number]> = [
  ["t-lamp", "snuff", null, 4],
  ["t-door", "close", null, 4],
  ["t-water", "still", null, 4],
  ["t-growth", "tend", null, 5],
  ["t-guestbook", "erase", null, 5],
  ["t-board", "unpost", null, 6],
  ["t-dedication", "retract", null, 6],
  ["t-reservation", "release", null, 6],
  ["t-soundpost", "unmute", null, 7],
  ["t-sequencer", "start", null, 7],
  ["t-tour", "halt", null, 7],
  ["t-socket", "push", null, 8],
];
const EXP_LOG = 160;

// acceptance thresholds (fail any → exit 1)
const TH = {
  anchorTotal: 160, anchorJoinP95Ms: 3_000,
  spawnOk: N_SPAWN, compOk: N_COMP, authErrors: 0,
  useAFired: UA.length, useBFired: UB.length, useRefusals: 0,
  famCensus: FAMILIES, famCensusProbes: 5,
  logExact: true,
  foldProbes: 3, finalFoldEqual: true,
  restartBoot: 1, restartFoldEqual: true, restartLineDrift: 0, restartPresent: 0,
  engineMarkers: 0,
  sayP95Ms: 500, sayOk: 2,
  fpsP50: 12, latP95Ms: 250, seqGaps: 300,
  rssPeakGrowthMB: 60, logSuspicious: 0,
  probeP95Ms: 500,
};
type Measurements = {
  anchorJoined: number; anchorJoinP95: number;
  spawnOk: number; compOk: number; authErrors: number;
  useAFired: number; useBFired: number; useRefusals: number;
  famCensusMin: number; famCensusProbes: number;
  logTotal: number; logExpected: number;
  foldProbes: number; finalFoldEqual: boolean;
  restartBoot: number; restartFoldEqual: boolean; restartLineDrift: number; restartPresent: number;
  engineMarkers: number;
  sayOk: number; sayP95: number;
  fpsP50: number; latP95: number; gaps: number;
  rssPeakGrowthMB: number; logSuspicious: number;
  probeP95: number;
};

function evaluate(m: Measurements): string[] {
  const f: string[] = [];
  if (m.anchorJoined !== TH.anchorTotal) f.push(`anchors ${m.anchorJoined}/${TH.anchorTotal} joined`);
  if (m.anchorJoinP95 > TH.anchorJoinP95Ms) f.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > ${TH.anchorJoinP95Ms}ms`);
  if (m.spawnOk !== TH.spawnOk) f.push(`spawn wave ${m.spawnOk}/${TH.spawnOk} verified`);
  if (m.compOk !== TH.compOk) f.push(`comp wave ${m.compOk}/${TH.compOk} verified`);
  if (m.authErrors !== TH.authErrors) f.push(`${m.authErrors} authoring/use errors`);
  if (m.useAFired !== TH.useAFired) f.push(`use wave A ${m.useAFired}/${TH.useAFired} fired`);
  if (m.useBFired !== TH.useBFired) f.push(`use wave B ${m.useBFired}/${TH.useBFired} fired`);
  if (m.useRefusals !== TH.useRefusals) f.push(`${m.useRefusals} unexpected rate refusals`);
  if (m.famCensusMin !== TH.famCensus) f.push(`family census minimum ${m.famCensusMin}/${TH.famCensus} across probes`);
  if (m.famCensusProbes !== TH.famCensusProbes) f.push(`census probes ${m.famCensusProbes}/${TH.famCensusProbes} run`);
  if (TH.logExact && m.logTotal !== m.logExpected) f.push(`log lines ${m.logTotal} != derived ${m.logExpected} (drift ${Math.abs(m.logTotal - m.logExpected)})`);
  if (m.foldProbes !== TH.foldProbes) f.push(`fold probes ${m.foldProbes}/${TH.foldProbes} == fold(log through covered)`);
  if (!m.finalFoldEqual) f.push(`final quiet snapshot != fold(log)`);
  if (m.restartBoot !== TH.restartBoot) f.push(`restart boot failed`);
  if (!m.restartFoldEqual) f.push(`restart fold DIFFERS`);
  if (m.restartLineDrift !== TH.restartLineDrift) f.push(`restart line drift ${m.restartLineDrift}`);
  if (m.restartPresent !== TH.restartPresent) f.push(`restart present ${m.restartPresent} (want 0)`);
  if (m.engineMarkers > TH.engineMarkers) f.push(`${m.engineMarkers} engine marker misses`);
  if (m.sayOk !== TH.sayOk) f.push(`probe says ${m.sayOk}/${TH.sayOk}`);
  if (m.sayP95 > TH.sayP95Ms) f.push(`say p95 ${Math.round(m.sayP95)}ms > ${TH.sayP95Ms}ms`);
  if (m.fpsP50 < TH.fpsP50) f.push(`fps p50 ${m.fpsP50.toFixed(1)} < ${TH.fpsP50}`);
  if (m.latP95 > TH.latP95Ms) f.push(`frame lat p95 ${Math.round(m.latP95)}ms > ${TH.latP95Ms}ms`);
  if (m.gaps > TH.seqGaps) f.push(`${m.gaps} frame seq gaps > ${TH.seqGaps}`);
  if (m.rssPeakGrowthMB > TH.rssPeakGrowthMB) f.push(`RSS peak growth ${m.rssPeakGrowthMB}MB > ${TH.rssPeakGrowthMB}MB`);
  if (m.logSuspicious !== TH.logSuspicious) f.push(`${m.logSuspicious} suspicious server-log lines`);
  if (m.probeP95 > TH.probeP95Ms) f.push(`HTTP probe p95 ${Math.round(m.probeP95)}ms > ${TH.probeP95Ms}ms`);
  return f;
}

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
const healthy: Measurements = {
  anchorJoined: 160, anchorJoinP95: 140,
  spawnOk: N_SPAWN, compOk: N_COMP, authErrors: 0,
  useAFired: UA.length, useBFired: UB.length, useRefusals: 0,
  famCensusMin: FAMILIES, famCensusProbes: 5,
  logTotal: EXP_LOG, logExpected: EXP_LOG,
  foldProbes: 3, finalFoldEqual: true,
  restartBoot: 1, restartFoldEqual: true, restartLineDrift: 0, restartPresent: 0,
  engineMarkers: 0,
  sayOk: 2, sayP95: 12,
  fpsP50: 14.8, latP95: 20, gaps: 0,
  rssPeakGrowthMB: 21, logSuspicious: 0,
  probeP95: 8,
};
if (SELFTEST) {
  const a = evaluate(healthy);
  const mk = (patch: Partial<Measurements>) => ({ ...healthy, ...patch });
  const breaches: Measurements[] = [
    mk({ anchorJoined: 158 }), mk({ anchorJoinP95: 3_400 }),
    mk({ spawnOk: 28 }), mk({ compOk: 31 }), mk({ authErrors: 2 }),
    mk({ useAFired: 14 }), mk({ useBFired: 10 }), mk({ useRefusals: 3 }),
    mk({ famCensusMin: 26 }), mk({ famCensusProbes: 4 }),
    mk({ logTotal: EXP_LOG + 2 }), mk({ foldProbes: 2 }),
    mk({ finalFoldEqual: false }), mk({ restartBoot: 0 }),
    mk({ restartFoldEqual: false }), mk({ restartLineDrift: 2 }),
    mk({ restartPresent: 1 }), mk({ engineMarkers: 3 }),
    mk({ sayOk: 1 }), mk({ sayP95: 700 }),
    mk({ fpsP50: 10.2 }), mk({ latP95: 400 }), mk({ gaps: 400 }),
    mk({ rssPeakGrowthMB: 75 }), mk({ logSuspicious: 1 }), mk({ probeP95: 900 }),
  ];
  const names = ["anchors", "joinP95", "spawn", "comp", "authErr", "useA", "useB", "useRef",
    "famCensus", "censusProbes", "logExact", "foldProbes", "finalFold", "boot", "restartFold",
    "lineDrift", "present", "markers", "sayOk", "sayP95", "fps", "lat", "gaps", "rss", "suspicious", "probeP95"];
  const b: string[] = [];
  breaches.forEach((x, i) => { const r = evaluate(x); if (!r.length) b.push(names[i]); });
  const ok = a.length === 0 && b.length === 0;
  console.log(ok ? `SELFTEST PASS — healthy gates clean, all ${breaches.length} breached gates fire` : `SELFTEST FAIL — clean:[${a}] missing:[${b}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${POSE_HZ}Hz + ${N_SPEC} spec; ${N_SPAWN} spawns ring r${RING_R}+lamps; ${N_COMP} comps / ${FAMILIES} families; use waves A(${UA.length})+B(${UB.length}) paced 380ms with actor re-pose; sky FIXED hours 22 (no tolls); 3 fold probes + midjoin; SIGKILL t+${KILL_AT / 1000}s. Log ${EXP_LOG} EXACT; ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);
console.log(`thresholds: spawn=${TH.spawnOk} comp=${TH.compOk} uses=${TH.useAFired}+${TH.useBFired}/0ref census=${TH.famCensus}x${TH.famCensusProbes} markers=0 log=${EXP_LOG}EXACT fold=3+final restart=boot+fold+drift0+present0 says=2@p95<${TH.sayP95Ms}ms fpsP50>=${TH.fpsP50} latP95<${TH.latP95Ms}ms gaps<=${TH.seqGaps} rss<+${TH.rssPeakGrowthMB}MB suspicious=0 probeP95<${TH.probeP95Ms}ms`);

// ---- fd budget -----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 600) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 600 — launch as: ulimit -n 1024 && bun tools/pressure-fullvocab.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ------------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure32-server-${Date.now()}.log`;
const logFile = Bun.file(logPath);
function spawnServer() {
  return Bun.spawn({
    cmd: ["bun", "run", "server/server.ts"],
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT), WORLDS_DIR: WORLDS, JOIN_TOKEN: TOKEN, MSG_RATE, EIDOVERSE_DIR: LIBDIR },
    stdout: logFile, stderr: logFile,
  });
}
let server = spawnServer();
const rss = () => {
  try {
    const r = Bun.spawnSync(["ps", "-o", "rss=", "-p", String(server.pid)]);
    return Number(String(r.stdout).trim());
  } catch { return NaN; }
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MB = (kb: number) => Math.round(kb / 1024);
const pct = (xs: number[], p: number) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))] : 0;
async function waitReady(): Promise<boolean> {
  for (let i = 0; i < 120; i++) {
    await sleep(250);
    try { const res = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); if (res.status > 0) return true; } catch { /* booting */ }
  }
  return false;
}
if (!(await waitReady())) { console.log("FAIL: scratch sequencer never became ready"); server.kill(); process.exit(1); }
const rssReady = rss();
console.log(`sequencer ready pid=${server.pid} rss=${MB(rssReady)}MB (log: ${logPath})`);

// ---- canonical deep compare + fold-the-log-file (snapjoin-proven) ----------------
function canon(v: any): string {
  if (v === undefined) return "undef";
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
}
function logEntries(): any[] {
  if (!existsSync(LOG_JSONL)) return [];
  return readFileSync(LOG_JSONL, "utf8").split("\n").filter((l) => l.trim()).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function foldPrefix(covered: number): { st: any; maxSeq: number } {
  const st = emptyState();
  let maxSeq = 0;
  for (const e of logEntries()) {
    if (Number(e.seq) > maxSeq) maxSeq = Number(e.seq);
    if (Number(e.seq) <= covered) foldEntry(st, e);
  }
  return { st, maxSeq };
}
function verifySnapshot(m: any): { ok: boolean; errs: string[]; covered: number } {
  const errs: string[] = [];
  const throughSeq = typeof m.throughSeq === "number" ? m.throughSeq : -1;
  const tail: any[] = Array.isArray(m.entries) ? m.entries : [];
  const tailTop = tail.length ? Number(tail[tail.length - 1].seq) : throughSeq;
  const covered = Math.max(throughSeq, tailTop);
  if (tail.length !== tailTop - throughSeq) errs.push(`tail len ${tail.length} != span ${tailTop - throughSeq}`);
  tail.forEach((e, i) => { if (Number(e.seq) !== throughSeq + 1 + i) errs.push(`tail gap at ${i}`); });
  const { st } = foldPrefix(covered);
  if (canon(st) !== canon(m.state)) errs.push(`snapshot state != fold(log through ${covered})`);
  return { ok: errs.length === 0, errs, covered };
}

// family census: the 28 comp types expected present in a folded state
const FAM_LIST = ["sockets", "reactions", "particles", "motion", "motion:spin_", "lock", "lamp", "guestbook", "plate", "portal", "music", "door", "chime", "water", "growth", "garden", "companion", "weatherzone", "waystone", "reservation", "board", "vendor", "bell", "tour", "sequencer", "dedication", "soundpost", "ladder"];
function famCensusOf(st: any): { n: number; missing: string[] } {
  let n = 0; const missing: string[] = [];
  for (const fam of FAM_LIST) {
    let found = false;
    for (const ent of Object.values<any>(st.entities ?? {})) {
      const comp = ent?.comp ?? {};
      if (fam === "motion" ? comp["motion"] != null : comp[fam] != null) { found = true; break; }
    }
    if (found) n++; else missing.push(fam);
  }
  return { n, missing };
}

// ---- client chassis (seqsync-proven) --------------------------------------------
type Spec = {
  ws: WebSocket; joinMs: number; frames: number; gaps: number; lastSeq: number;
  lat: number[]; says: Set<string>; openAt: number; snapAt: number; snapshot: any;
  closed: boolean; closeCode: number; id: string;
  sayEcho: Map<string, number>;
  useErrors: string[];
  sounds: number;
  soundTags: Set<string>;
  errors: number;
};
function connect(id: string, spectate: boolean, n = 0, world = WORLD): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, joinMs: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [], says: new Set(), openAt: performance.now(), snapAt: 0, snapshot: null, closed: false, closeCode: 0, sayEcho: new Map(), useErrors: [], sounds: 0, soundTags: new Set(), errors: 0 };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        s.snapshot = m; s.snapAt = performance.now(); s.joinMs = s.snapAt - s.openAt;
        for (const e of m.entries ?? []) if (e.verb === "say") s.says.add(e.args?.text);
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++;
        s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "sound") {
        s.sounds++;
        s.soundTags.add(String(m.id ?? "?"));
      } else if (m.type === "log") {
        if (m.entry?.verb === "say") {
          s.says.add(m.entry.args?.text);
          if (!s.sayEcho.has(m.entry.args?.text)) s.sayEcho.set(m.entry.args?.text, performance.now());
        }
      } else if (m.type === "error") {
        s.useErrors.push(String(m.error ?? ""));
        s.errors++;
      }
    };
    ws.onclose = (ev) => { s.closed = true; s.closeCode = Number(ev.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}
const verb = (s: Spec, verbName: string, args: any) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "verb", verb: verbName, args })); };
const poseOnce = (s: Spec, p: number[]) => { if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: "pose", pose: { p, yaw: 0, speed: 0, clip: "idle" } })); };

// ---- anchor population (perf-0 FIRST — the fresh world's owner) -----------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const perf0 = await connect("perf-0", false, 0);          // owner
const rest = await Promise.allSettled([
  ...Array.from({ length: N_PERF - 1 }, (_, i) => connect(`perf-${i + 1}`, false, i + 1)),
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i}`, true)),
]);
const anchors = [perf0, ...rest.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec)];
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const specs = anchors.filter((s) => s.id.startsWith("spec-"));
const joinTimes = anchors.map((s) => s.joinMs);
console.log(`t+0: anchors joined ${anchors.length}/${1 + rest.length} in ${Math.round(performance.now() - t0)}ms — join p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// destworld seeder (portal target must exist in the registry before auth)
at(SEED_AT, () => { void (async () => { try { const s = await connect("seeder", false, 0, DEST_WORLD); setTimeout(() => { try { s.ws.close(); } catch {} }, 500); } catch {} })(); });

// fixed sky (no tolls, no midnight)
at(SKY_AT, () => { verb(perf0, "sky", { hours: 22 }); });

// embodied presence @15Hz; users 4..9 pose statically (posed per-verb below)
let running = true;
const tickers: any[] = [];
for (const s of perfs) {
  const i = Number(s.id.split("-")[1]);
  if (i >= 4 && i <= 9) continue;
  tickers.push(setInterval(() => {
    if (!running || s.ws.readyState !== 1) return;
    const t = Date.now() / 1000 + i;
    s.ws.send(JSON.stringify({ type: "pose", pose: { p: [Math.sin(t * 0.5 + i) * 10, 0, Math.cos(t * 0.5 + i) * 10], yaw: t % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  }, 1000 / POSE_HZ));
}

// HTTP event-loop health probe
const probeAll: number[] = [];
const probeErrors = { n: 0 };
const probeTimer = setInterval(async () => {
  const t = performance.now();
  try { const r = await fetch(`http://127.0.0.1:${PORT}/geom?world=${WORLD}`); await r.arrayBuffer(); if (!r.ok) probeErrors.n++; }
  catch { probeErrors.n++; }
  probeAll.push(performance.now() - t);
}, 500);
const rssSamples: Record<string, number> = { ready: rssReady, postJoin: NaN, peak: NaN };
setTimeout(() => { rssSamples.postJoin = rss(); }, 6_500);
const rssTimer = setInterval(() => {
  const r = rss();
  if (Number.isFinite(r) && performance.now() - t0 >= 7_000 && (!Number.isFinite(rssSamples.peak) || r > rssSamples.peak)) rssSamples.peak = r;
}, 500);

// ---- spawn wave: 30 entities split across perf-0..3, 380ms per author ------------
at(SPAWN_WAVE_AT, () => {
  const all: Array<[string, number[]]> = [
    ...TARGET_IDS.map((id) => [id, posOf(id)] as [string, number[]]),
    ...TOUR_LAMPS.map((id, j) => [id, [Math.round(15 * Math.cos(deg(353 + j * 2)) * 100) / 100, 0, Math.round(15 * Math.sin(deg(353 + j * 2)) * 100) / 100]] as [string, number[]]),
  ];
  const byAuthor: Record<number, Array<[string, number[]]>> = {};
  all.forEach(([id, p], i) => { const a = i % 4; (byAuthor[a] ??= []).push([id, p]); });
  for (const [a, queue] of Object.entries(byAuthor)) {
    queue.forEach(([id, p], i) => {
      setTimeout(() => { verb(perfs[Number(a)], "spawn", { id, lib: "deco/bench.glb", pos: p, yaw: 0 }); }, i * 380);
    });
  }
});

// ---- comp wave: 34 authorings split across perf-0..3, 380ms per author -----------
at(COMP_WAVE_AT, () => {
  const byAuthor: Record<number, Array<[string, string, any]>> = {};
  for (const [id, type, data, a] of [...A, ...A2]) (byAuthor[a] ??= []).push([id, type, data]);
  for (const id of TOUR_LAMPS) (byAuthor[3] ??= []).push([id, "lamp", { intensity: 5, range: 5 }]);
  let longest = 0;
  for (const [a, queue] of Object.entries(byAuthor)) {
    longest = Math.max(longest, queue.length);
    queue.forEach(([id, type, data], i) => {
      setTimeout(() => { verb(perfs[Number(a)], "comp", { id, type, data }); }, i * 380);
    });
  }
  console.log(`t+${((performance.now() - t0) / 1000).toFixed(1)}s: comp wave dispatched — ${N_COMP} comps across 4 authors, longest queue ${longest}`);
});

// ---- use waves: actor re-posed 120ms before each fire (reach gates) --------------
function fireWave(wave: Array<[string, string, any, number]>, base: number, counter: { n: number }): void {
  wave.forEach(([id, action, extra, u], i) => {
    const fireAt = base + i * 380;
    at(fireAt - 120, () => { const S = perfs[u]; if (S) poseOnce(S, standNear(id)); });
    at(fireAt, () => { const S = perfs[u]; if (S) { verb(S, "use", { id, action, ...(extra ?? {}) }); counter.n++; } });
  });
}
const useACount = { n: 0 }, useBCount = { n: 0 };
at(POSE_AT, () => {
  // initial static poses for users 4..9 near their first target
  const seen = new Set<number>();
  for (const [id, , , u] of [...UA, ...UB]) {
    if (seen.has(u)) continue;
    seen.add(u);
    const S = perfs[u];
    if (S) poseOnce(S, standNear(id));
  }
});
at(USE_A_AT, () => fireWave(UA, USE_A_AT, useACount));
at(USE_B_AT, () => fireWave(UB, USE_B_AT, useBCount));

// ---- fold probes + mid-traffic joiner --------------------------------------------
let foldProbesOk = 0;
const foldProbeErrs: string[] = [];
const censusMins: number[] = [];
const censusMissingAll: string[][] = [];
async function foldProbe(tag: string): Promise<void> {
  try {
    const p = await connect(`fold-${tag}-${Math.floor(t0)}`, true);
    const v = verifySnapshot(p.snapshot);
    const cen = famCensusOf(p.snapshot?.state ?? {});
    censusMins.push(cen.n); censusMissingAll.push(cen.missing);
    if (v.ok) foldProbesOk++;
    else foldProbeErrs.push(`${tag}: ${v.errs.join(";").slice(0, 200)}`);
    try { p.ws.close(); } catch {}
  } catch (err) { foldProbeErrs.push(`${tag}: ${String(err).slice(0, 120)}`); }
}
at(FOLD_A_AT, () => { void foldProbe("a"); });
at(FOLD_B_AT, () => { void foldProbe("b"); });
at(FOLD_C_AT, () => { void foldProbe("c"); });

const mid: { s: Spec | null } = { s: null };
at(MIDJOIN_AT, () => {
  void (async () => {
    try { mid.s = await connect(`mid-${Math.floor(t0)}`, false, 300); poseOnce(mid.s, [40, 0, 40]); }
    catch { mid.s = null; }
  })();
});

// ---- fairness says ----------------------------------------------------------------
const FAIR_TEXTS = [`fvocab-a-${Math.floor(t0)}`, `fvocab-b-${Math.floor(t0)}`];
const sayEchoAt = new Map<string, number>();
[FOLD_A_AT + 300, FOLD_B_AT + 300].forEach((w, i) => {
  at(w, () => {
    const sentAt = performance.now();
    const S = perfs[2];
    if (S?.ws.readyState === 1) S.ws.send(JSON.stringify({ type: "verb", verb: "say", args: { text: FAIR_TEXTS[i] } }));
    at(w + 1_500, () => {
      const hit = S?.sayEcho.get(FAIR_TEXTS[i]);
      if (hit !== undefined) sayEchoAt.set(FAIR_TEXTS[i], hit - sentAt);
    });
  });
});

// ---- teardown ----------------------------------------------------------------------
let teardownAtTs = 0;
at(TEARDOWN_AT, () => {
  running = false;
  teardownAtTs = performance.now();
  anchors.forEach((s) => { try { s.ws.close(); } catch {} });
});

await sleep(DURATION - (performance.now() - t0));
tickers.forEach(clearInterval);
clearInterval(probeTimer);
clearInterval(rssTimer);
await sleep(300);

// ---- ledger ground truth from log.jsonl ---------------------------------------------
const entries = logEntries();
const logTotalLines = entries.length;
const spawnVerbs = entries.filter((e) => e.verb === "spawn");
const compVerbs = entries.filter((e) => e.verb === "comp");
const useVerbs = entries.filter((e) => e.verb === "use");
const worldComps = entries.filter((e) => e.verb === "comp" && e.actor === "world");
const worldSays = entries.filter((e) => e.verb === "say" && e.actor === "world");
const lightVerbs = entries.filter((e) => e.verb === "light");
const mountVerbs = entries.filter((e) => e.verb === "mount");
const removeVerbs = entries.filter((e) => e.verb === "remove");
const motionVerbs = entries.filter((e) => e.verb === "motion");
const humanSays = entries.filter((e) => e.verb === "say" && e.actor !== "world");

const spawnOk = spawnVerbs.filter((e) => TARGET_IDS.includes(String(e.args?.id)) || TOUR_LAMPS.includes(String(e.args?.id))).length;
const compOk = compVerbs.filter((e) => e.actor !== "world").length;
const useRefusals = [...anchors, mid.s ?? ({ useErrors: [] } as unknown as Spec)].reduce((a, s) => a + (s?.useErrors ?? []).filter((x) => x === RATE_REFUSAL).length, 0);

// verb histogram for drift reconciliation (printed on any log drift)
const hist: Record<string, number> = {};
for (const e of entries) {
  const k = e.verb === "comp" ? `comp:${e.actor === "world" ? "world" : "human"}:${e.args?.type ?? "?"}` : e.verb === "say" ? `say:${e.actor === "world" ? "world" : "human"}` : e.verb;
  hist[k] = (hist[k] ?? 0) + 1;
}

// engine marker checks on the FINAL folded state (post wave B):
const finalFold = foldPrefix(Infinity);
const markerChecks: string[] = [];
{
  const E = finalFold.st.entities ?? {};
  const c = (id: string) => E[id]?.comp ?? {};
  if (c("t-lamp").lamp?.on !== false) markerChecks.push("lamp not snuffed");
  if (c("t-door").door?.open !== false) markerChecks.push("door not closed");
  if (c("t-water").water?.on !== false) markerChecks.push("water not still");
  if (!(Number(c("t-growth").growth?.stage) >= 0)) markerChecks.push("growth stage missing");
  if (!Array.isArray(c("t-garden").garden?.tiles) && typeof c("t-garden").garden?.tiles !== "object") markerChecks.push("garden tiles missing");
  if (!Array.isArray(c("t-guestbook").guestbook?.entries)) markerChecks.push("guestbook entries missing");
  if (typeof c("t-plate").plate?.text !== "string") markerChecks.push("plate text missing");
  if (typeof c("t-board").board?.text === "string" && c("t-board").board?.text !== "") markerChecks.push("board not unposted");
  if (c("t-dedication").dedication?.line != null && String(c("t-dedication").dedication?.line) !== "") markerChecks.push("dedication not retracted");
  if (c("t-reservation").reservation?.heldBy != null) markerChecks.push("reservation not released");
  if (!Array.isArray(c("t-vendor").vendor?.sales)) markerChecks.push("vendor sales missing");
  if (c("t-soundpost").soundpost?.muted !== false) markerChecks.push("soundpost not unmuted");
  if (!Array.isArray(c("t-sequencer").sequencer?.steps)) markerChecks.push("sequencer steps missing");
  if (c("t-sequencer").sequencer?.playing !== true) markerChecks.push("sequencer not started");
  if (c("t-tour").tour?.playing !== false) markerChecks.push("tour not halted");
  if (typeof c("t-companion").companion?.name !== "string") markerChecks.push("companion name missing");
  if (c("t-sign").lock !== true) markerChecks.push("lock not true");
  if (c("t-hearth").particles?.preset !== "fire") markerChecks.push("particles not fire");
  if (c("t-socket").sockets?.seat == null) markerChecks.push("sockets seat missing");
  if (c("t-socket").reactions?.push == null) markerChecks.push("reactions push missing");
  if (c("t-bell").bell?.hours == null) markerChecks.push("bell hours missing");
  if (c("t-weatherzone").weatherzone?.states == null) markerChecks.push("weatherzone states missing");
  if (c("t-waystone").waystone?.pair == null) markerChecks.push("waystone pair missing");
  if (c("t-portal").portal?.to !== DEST_WORLD) markerChecks.push("portal dest missing");
  if (c("t-music").music?.notes == null) markerChecks.push("music notes missing");
  if (c("t-swing").ladder == null) markerChecks.push("ladder missing");
  if (c("t-spin")["motion:spin_"] == null) markerChecks.push("motion:part missing");
  if (c("t-swing").motion?.type !== "pendulum") markerChecks.push("swing motion missing");
  if (c("t-car").motion?.type !== "spin") markerChecks.push("carousel motion missing");
  if (c("t-socket").motion?.type !== "pendulum") markerChecks.push("socket motion missing");
  if (c("t-door").chime?.openHz == null) markerChecks.push("chime comp missing");
}

// presence-plane sound observation (report-only)
const soundTotal = specs.reduce((a, s) => a + s.sounds, 0);
const soundTags = new Set<string>(specs.flatMap((s) => [...s.soundTags]));

// ---- final quiet snapshot: fold-equal + census --------------------------------------
let finalFoldEqual = false;
let finalCensus = { n: -1, missing: [] as string[] };
{
  try {
    const p = await connect(`final-${Math.floor(t0)}`, true);
    const v = verifySnapshot(p.snapshot);
    finalFoldEqual = v.ok && v.covered === finalFold.maxSeq;
    finalCensus = famCensusOf(p.snapshot?.state ?? {});
    censusMins.push(finalCensus.n); censusMissingAll.push(finalCensus.missing);
    try { p.ws.close(); } catch {}
  } catch { finalFoldEqual = false; }
}

// ---- SIGKILL restart: replay folds the same world ----------------------------------
let restartBoot = 0, restartFoldEqual = false, restartLineDrift = 999;
let restartDiff = ""; let restartPresent = -1; let restartCensus = { n: -1, missing: [] as string[] };
{
  const pre = foldPrefix(Infinity);
  const preCanon = canon(pre.st);
  const preLines = logTotalLines;
  server.kill("SIGKILL");
  await sleep(600);
  server = spawnServer();
  if (await waitReady()) {
    restartBoot = 1;
    try {
      const probe = await connect(`restart-probe-${Math.floor(t0)}`, true);
      const v = verifySnapshot(probe.snapshot);
      restartPresent = (probe.snapshot?.present ?? []).length;
      restartCensus = famCensusOf(probe.snapshot?.state ?? {});
      censusMins.push(restartCensus.n); censusMissingAll.push(restartCensus.missing);
      restartFoldEqual = v.ok && v.covered === pre.maxSeq && canon(probe.snapshot?.state ?? {}) === preCanon;
      if (!restartFoldEqual) {
        const post = probe.snapshot?.state ?? {};
        const keys = new Set([...Object.keys(pre.st), ...Object.keys(post)]);
        const parts: string[] = [`covered=${v.covered} logMaxSeq=${pre.maxSeq} v.ok=${v.ok}`];
        for (const k of keys) if (canon((pre.st as any)[k]) !== canon((post as any)[k])) {
          parts.push(`${k}: pre=${JSON.stringify((pre.st as any)[k])?.slice(0, 160)} post=${JSON.stringify((post as any)[k])?.slice(0, 160)}`);
        }
        restartDiff = v.errs.concat(parts).join(" | ").slice(0, 600);
      }
      await sleep(2_600);   // ≥2 sweeps on the replayed world — boot heal mints nothing
      const post = logEntries();
      restartLineDrift = Math.abs(post.length - preLines);
      try { probe.ws.close(); } catch {}
    } catch (err) { restartFoldEqual = false; restartLineDrift = 999; restartDiff = String(err).slice(0, 300); }
  }
}

const endAt = performance.now();
const fpsPer = specs.map((s) => s.frames / Math.max(0.001, (Math.min(endAt, teardownAtTs || endAt) - Math.max(s.snapAt, t0) - 500) / 1000));
const latAll = specs.flatMap((s) => s.lat);
const gapsTotal = specs.reduce((a, s) => a + s.gaps, 0);
const suspicious = (await logFile.text()).split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));
const famCensusMin = censusMins.length ? Math.min(...censusMins) : -1;
const logDrift = Math.abs(logTotalLines - EXP_LOG);

const m: Measurements = {
  anchorJoined: anchors.length, anchorJoinP95: pct(joinTimes, 95),
  spawnOk, compOk, authErrors: anchors.reduce((a, s) => a + s.errors, 0),
  useAFired: useACount.n, useBFired: useBCount.n, useRefusals,
  famCensusMin, famCensusProbes: censusMins.length,
  logTotal: logTotalLines, logExpected: EXP_LOG,
  foldProbes: foldProbesOk, finalFoldEqual,
  restartBoot, restartFoldEqual, restartLineDrift, restartPresent,
  engineMarkers: markerChecks.length,
  sayOk: FAIR_TEXTS.filter((t) => sayEchoAt.has(t)).length,
  sayP95: sayEchoAt.size ? pct([...sayEchoAt.values()], 95) : Infinity,
  fpsP50: pct(fpsPer, 50), latP95: pct(latAll, 95), gaps: gapsTotal,
  rssPeakGrowthMB: rssPeakGrowth, logSuspicious: suspicious.length,
  probeP95: pct(probeAll, 95),
};
const fail = evaluate(m);

console.log(`
results
  anchors               ${anchors.length}/${1 + rest.length} joined — p95 ${Math.round(m.anchorJoinP95)}ms
  authoring             spawns ${spawnOk}/${TH.spawnOk} · comps ${compOk}/${TH.compOk} · author/use errors ${m.authErrors}
  use waves             A ${useACount.n}/${UA.length} · B ${useBCount.n}/${UB.length} · rate refusals ${useRefusals} (want 0)
  family census         min ${famCensusMin}/${FAMILIES} across ${censusMins.length} probes${censusMissingAll.some((x) => x.length) ? ` — missing seen: ${[...new Set(censusMissingAll.flat())].join(",")}` : ""}
  engine markers        ${markerChecks.length} misses${markerChecks.length ? `: ${markerChecks.join(";")}` : " — every family carries its expected folded state"}
  fold probes           ${foldProbesOk}/3 == fold(log through covered)${foldProbeErrs.length ? ` — ${foldProbeErrs.join(" | ").slice(0, 300)}` : ""}
  final quiet snapshot  ${finalFoldEqual ? "fold-equal" : "DIFFERS"} · census ${finalCensus.n}/${FAMILIES}
  world log             ${logTotalLines} lines vs derived ${EXP_LOG} (drift ${logDrift})
  log composition       spawns ${spawnVerbs.length} · comps(human) ${compVerbs.length - worldComps.length} · comps(world) ${worldComps.length} · uses ${useVerbs.length} · says(world) ${worldSays.length} · says(human) ${humanSays.length} · lights ${lightVerbs.length} · mounts ${mountVerbs.length} · removes ${removeVerbs.length} · motions ${motionVerbs.length}
  verb histogram        ${Object.entries(hist).map(([k, v]) => `${k}=${v}`).join(" ")}
  presence sounds       ${soundTotal} seen by seers · distinct sources ${soundTags.size}
  SIGKILL restart       boot ${restartBoot}/1 · fold ${restartFoldEqual ? "EXACT-equal" : "DIFFERS"} · line drift ${restartLineDrift} · present ${restartPresent} · census ${restartCensus.n}/${FAMILIES}
  fair says             ${m.sayOk}/2 — p95 ${sayEchoAt.size ? Math.round(m.sayP95) : "MISSED"}ms
  anchor frame/s        p50 ${m.fpsP50.toFixed(1)} (window ${Math.round((teardownAtTs - t0) / 1000)}s connected)
  frame latency ms      p50 ${Math.round(pct(latAll, 50))} p95 ${Math.round(m.latP95)} max ${Math.round(Math.max(...latAll, 0))}
  frame seq gaps        ${gapsTotal} across ${specs.length} spectators
  http probe ms         p95 ${Math.round(m.probeP95)} (n=${probeAll.length}) · errors ${probeErrors.n}
  mid-traffic joiner    ${mid.s ? `joined ${Math.round(mid.s.joinMs)}ms` : "FAILED"}
  server rss            ready ${MB(rssReady)}MB → postJoin ${MB(rssSamples.postJoin)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB)
  server log            ${suspicious.length} suspicious lines
`);
if (restartDiff) console.log(`  restart diff: ${restartDiff}`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);

anchors.forEach((s) => { try { s.ws.close(); } catch {} });
if (mid.s) { try { mid.s.ws.close(); } catch {} }
server.kill("SIGTERM");
await server.exited;

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — a ${FAMILIES}-family world joins, folds, replays consistently: census ${famCensusMin}/28 at every probe, log arithmetic EXACT, restart fold-equal`);
rmSync(WORLDS, { recursive: true, force: true });
process.exit(fail.length ? 1 : 0);
