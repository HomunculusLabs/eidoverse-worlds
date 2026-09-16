// Pressure scenario 22: MOUNT/DISMOUNT THRASH — rapid mount cycling leaves no
// orphaned rider state. Design target: 24 embodied performers + up to 200
// spectators; riders mount and step off constantly (swings, carousel, ferry,
// horses), and mount/dismount are LOGGED verbs — every cycle is world
// history. The seams this scenario falsifies:
//   S1 fold rider-table exactness: after every thrash pattern the folded
//      mounts table holds EXACTLY the riders the LOG says are seated — no
//      orphan after dismount cycles, host removal (orphan stamp), duplicate
//      mounts, cargo round-trips, or vanish-then-return; entity riders via
//      ent.parent the same.
//   S2 the reconnect contract (#61): a rider that vanishes mid-ride keeps
//      its dormant mounts entry (a rejoiner must know it is seated), a
//      RETURNING rider resolves it with one dismount verb — and a probe
//      joining after the vanish never sees the vanished body in present[]
//      (dormant mount, never a ghost body).
//   S3 the demote boundary (pressure-14 precedent: a body's pose belongs to
//      the world it was posed in — role change is a plane transition): a
//      rider demoted to spectator on the live socket must NOT remain in the
//      mounts table. The world may not claim a seated body that is present
//      as a spectator. Pinned CLEAN; a RED here is the finding.
//   S4 the verb rate budget is per-CLIENT: every thrash leg stays inside its
//      own 12/4s window (audited by the harness before it measures anything).
//   S5 thrash verbs stay cheap under the full 200-socket population: author
//      p95, seer echo p95, zero seq gaps, seer fps p50 >= 12, no wedge.
//   S6 dismount STAMPS the absolute pose the verb carries (plane-transition
//      invariant) — verified through log-verbatim echo args.
//
// Population (pinned before measuring — 200 peak concurrent sockets):
//   SEER spec-0 (spectator, echo witness, connected FIRST)
//   24 perf-* embodied @15Hz, never mounted (the show)
//   171 spec-1..171 pure spectators
//   14 thrash-* (thrash-8 joins as SPECTATOR, promotes at t+7.2)
//   5 late-* embodied joins mid-thrash (t+5.5) — 3 also ride W3
//
// Waves (all verbs in the schedule table below; per-leg rate-audited):
//   t+3.0  perf-0 spawns seat-a..e; perf-1 spawns seat-x; perf-3 crate-1
//   t+3.3  thrash-0..13 join (thrash-8 spectator)
//   W1 t+4.0   thrash-0..7: 8 mount/dismount cycles @800ms (16 verbs/leg)
//   W3 t+6.0   late-2..4 ride seat-x while perf-1 MOVES it mid-ride
//              (places @6.45 and @8.95) — host motion under a seated rider
//   W4 t+7.0   thrash-8 (spectator) mount -> exact authorship refusal;
//              t+7.2 promote on live socket; t+7.6 clean mount
//   W5 t+8.0   back-to-back races: thrash-8, thrash-13, late-0, late-1 —
//              dismount+remount 5ms apart, 4 pairs @900ms, end MOUNTED
//   W6 t+9.0   thrash-9..12 mount, then VANISH (socket close @9.8, no
//              dismount) — dormant-entry + ghost-body probes @10.1;
//              thrash-9 RETURNS embodied @13.5 (reconnect contract) and
//              dismounts @14.0
//   W7 t+10.4  thrash-0 mounts seat-e; perf-2 REMOVES seat-e @10.7 (orphan
//              stamp); thrash-0 remounts seat-d @10.75
//   W2 t+10.8  thrash-0..5 hot-swap hosts a->b->c->d @800ms, 6 cycles,
//              always dismounted between hosts
//   W8 t+11.0  perf-3 cargo: crate-1 mounted onto seat-b, off, on, off, on
//              (entity rider via ent.parent, distinct from body riders)
//   W9 t+11.9  thrash-13 mounts seat-c; t+12.0 DEMOTES to spectator on the
//              live socket — the S3 seam
//   W10 t+13.0 thrash-6 duplicate-mount idempotence: 3 rounds of
//              (mount, mount, dismount) — the fold holds ONE entry
//   t+16.0  CENSUS probe: mounts EXACTLY {thrash-8, late-0, late-1 live
//          riders + thrash-10/11/12 dormant} — thrash-13 ABSENT (S3);
//          present[] EXACTLY 39 embodied ids, zero vanished ghosts;
//          crate-1 riding seat-b via ent.parent
//   t+16.5  perf-5 fairness say
//   t+17.0  survivors dismount (thrash-8, late-0, late-1, crate-1)
//   t+17.5  TEARDOWN (seer closes last @18.1)
//   t+22.0  FINAL probe: present 0; mounts EXACTLY the dormant trio
//          {thrash-10,11,12} (reconnect contract — reported, not a defect);
//          zero entity riders; 6 entities (seat-e removed)
//
// Acceptance gates (pinned before measuring — see TH):
//   SERVER_DIR=/tmp/pressure22-tree PORT=8986 bun tools/pressure-mountthrash.ts
//   SELFTEST=1 bun tools/pressure-mountthrash.ts   # gate RED/GREEN proof, no server
//
// The harness SPAWNS the scratch sequencer itself (never point it at
// production), runs the scenario, tears everything down, and exits 0 only if
// every pinned gate holds. Exit 1 = failed gate(s), with the numbers printed.

import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";

// ---- pinned scenario contract -------------------------------------------------
const SERVER_DIR = process.env.SERVER_DIR ?? "/tmp/pressure22-tree";
const PORT = Number(process.env.PORT ?? 8986);
const WORLDS = process.env.WORLDS_DIR ?? "/tmp/pressure22-worlds";
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const LIBDIR = process.env.EIDOVERSE_DIR ?? "/Users/t3rpz/projects/eidoverse-video";
const URL = `ws://127.0.0.1:${PORT}/ws`;
const WORLD = "alpha";
const N_PERF = 24, N_SPEC = 171, N_THRASH = 14, N_LATE = 5;
const PERF_HZ = 15, POSE_HZ = 10;
const SPAWN_AT = 3_000, THASH_JOIN_AT = 3_300, CRATE_AT = 3_400;
const W1_AT = 4_000, W1_CYCLES = 8, W1_PERIOD = 800;
const W3_AT = 6_000, W3_CYCLES = 4;
const W4_AT = 7_000, W4_PROMO_AT = 7_200, W4_MOUNT_AT = 7_600;
const W5_AT = 8_000, W5_PAIRS = 4;
const W6_AT = 9_000, W6_CLOSE_AT = 9_800, VANISH_PROBE_AT = 10_100;
const W7_AT = 10_400, W7_REMOVE_AT = 10_700, W7_REMOUNT_AT = 10_750;
const W2_AT = 10_800, W2_CYCLES = 6, W2_PERIOD = 800;
const W8_AT = 11_000, W8_CYCLES = 2;
const W9_MOUNT_AT = 11_900, W9_AT = 12_000, DEMOTE_PROBE_AT = 13_600;
const RET9_AT = 13_500, RET9_DM_AT = 14_000;
const W10_AT = 13_000, W10_ROUNDS = 3;
const CENSUS_AT = 16_000;
const SAY_AT = 16_500, SURVIVOR_DM_AT = 17_000;
const TEARDOWN_AT = 17_500, SEER_CLOSE_AT = 18_100, FINAL_AT = 22_000, DURATION = 25_000;
const MSG_RATE = "600";           // same scratch envelope as pressure-1..21
const SELFTEST = process.env.SELFTEST === "1";
// dismount stamp poses (absolute, world frame): ring r<=9.5, distinct per leg
const DPOS = (i: number, salt = 0) => [Math.sin(i * 1.3 + salt) * 9, 0, Math.cos(i * 1.7 + salt) * 9] as [number, number, number];
const SEATS = ["seat-a", "seat-b", "seat-c", "seat-d", "seat-e"];
const SEAT_POS = SEATS.map((_, k) => [12 + k * 2, 0, -6] as [number, number, number]);
const SEAT_X0 = [10, 0, 10] as [number, number, number];
const SEAT_X1 = [6, 0, -10] as [number, number, number];
const SEAT_X2 = [14, 0, 8] as [number, number, number];
const CRATE0 = [-8, 0, -8] as [number, number, number];
const REFUSAL = "spectators can't author — join embodied to build";
// poses.json: every leg ever embodied closes with a lastPose (all legs pose
// @10Hz while embodied): 24 perf + 14 thrash + 5 late = 43 keys, band r<=13.5
const EXPECT_POSES = N_PERF + N_THRASH + N_LATE;
// census contracts
const CENSUS_MOUNTED = new Set(["thrash-8", "late-0", "late-1", "thrash-10", "thrash-11", "thrash-12"]);
const CENSUS_PRESENT = 39;        // 24 perf + thrash-0..9 (10, incl returned 9) + late-0..4 (5)
const DORMANT_TRIO = ["thrash-10", "thrash-11", "thrash-12"];

// ---- phase schedule (the EXACT verb plan; also the expected-log oracle) -------
type Planned = { at: number; leg: string; verb: "mount" | "dismount"; args: Record<string, unknown>; refused?: boolean };
const schedule: Planned[] = [];
{
  // W1: thrash-0..7, 8 cycles: mount seat-a, dismount +400ms (800ms period)
  for (let i = 0; i < 8; i++) for (let k = 0; k < W1_CYCLES; k++) {
    const at0 = W1_AT + i * 60 + k * W1_PERIOD;
    schedule.push({ at: at0, leg: `thrash-${i}`, verb: "mount", args: { id: `thrash-${i}`, to: "seat-a" } });
    schedule.push({ at: at0 + 400, leg: `thrash-${i}`, verb: "dismount", args: { id: `thrash-${i}`, pos: DPOS(i, k) } });
  }
  // W2: thrash-0..5 hot-swap hosts (a,b,c,d only — seat-e is removed at W7)
  for (let i = 0; i < 6; i++) for (let k = 0; k < W2_CYCLES; k++) {
    const at0 = W2_AT + i * 50 + k * W2_PERIOD;
    schedule.push({ at: at0, leg: `thrash-${i}`, verb: "mount", args: { id: `thrash-${i}`, to: SEATS[k % 4] } });
    schedule.push({ at: at0 + 400, leg: `thrash-${i}`, verb: "dismount", args: { id: `thrash-${i}`, pos: DPOS(i, 10 + k) } });
  }
  // W3: late-2..4 ride seat-x while perf-1 moves it (places at 6.45 / 8.95)
  for (const leg of ["late-2", "late-3", "late-4"]) {
    const i = 30 + Number(leg.slice(5));
    for (let k = 0; k < W3_CYCLES; k++) {
      const at0 = W3_AT + (i - 30) * 40 + k * 900;
      schedule.push({ at: at0, leg, verb: "mount", args: { id: leg, to: "seat-x" } });
      schedule.push({ at: at0 + 450, leg, verb: "dismount", args: { id: leg, pos: DPOS(i, 20 + k) } });
    }
  }
  // W4: refusal probe (spectator), then the clean mount after promotion
  schedule.push({ at: W4_AT, leg: "thrash-8", verb: "mount", args: { id: "thrash-8", to: "seat-a" }, refused: true });
  schedule.push({ at: W4_MOUNT_AT, leg: "thrash-8", verb: "mount", args: { id: "thrash-8", to: "seat-a" } });
  // W5: back-to-back dismount+remount races, 4 pairs @900ms, end MOUNTED
  for (const [n, leg] of [[0, "thrash-8"], [1, "thrash-13"], [2, "late-0"], [3, "late-1"]] as const) {
    for (let k = 0; k < W5_PAIRS; k++) {
      const at0 = W5_AT + n * 60 + k * 900;
      schedule.push({ at: at0, leg, verb: "dismount", args: { id: leg, pos: DPOS(20 + n, 30 + k) } });
      schedule.push({ at: at0 + 5, leg, verb: "mount", args: { id: leg, to: "seat-c" } });
    }
  }
  // W6: thrash-9..12 mount then VANISH (harness closes sockets at 9.8)
  for (let i = 9; i <= 12; i++) schedule.push({ at: W6_AT + (i - 9) * 40, leg: `thrash-${i}`, verb: "mount", args: { id: `thrash-${i}`, to: "seat-b" } });
  // W7: thrash-0 mounts seat-e (removed at 10.7 by perf-2), remounts seat-d
  schedule.push({ at: W7_AT, leg: "thrash-0", verb: "mount", args: { id: "thrash-0", to: "seat-e" } });
  schedule.push({ at: W7_REMOUNT_AT, leg: "thrash-0", verb: "mount", args: { id: "thrash-0", to: "seat-d" } });
  // W8: perf-3 cargo crate-1 onto seat-b — on/off/on/off/on
  for (let k = 0; k < W8_CYCLES; k++) {
    schedule.push({ at: W8_AT + k * 800, leg: "perf-3", verb: "mount", args: { id: "crate-1", to: "seat-b" } });
    schedule.push({ at: W8_AT + k * 800 + 400, leg: "perf-3", verb: "dismount", args: { id: "crate-1", pos: [...CRATE0] } });
  }
  schedule.push({ at: W8_AT + W8_CYCLES * 800, leg: "perf-3", verb: "mount", args: { id: "crate-1", to: "seat-b" } });
  // W9: thrash-13 mounts, then DEMOTES (live socket) — the S3 seam
  schedule.push({ at: W9_MOUNT_AT, leg: "thrash-13", verb: "mount", args: { id: "thrash-13", to: "seat-c" } });
  // W10: thrash-6 duplicate-mount idempotence, 3 rounds, end dismounted
  for (let k = 0; k < W10_ROUNDS; k++) {
    const at0 = W10_AT + k * 900;
    schedule.push({ at: at0, leg: "thrash-6", verb: "mount", args: { id: "thrash-6", to: "seat-a" } });
    schedule.push({ at: at0 + 50, leg: "thrash-6", verb: "mount", args: { id: "thrash-6", to: "seat-a" } });
    schedule.push({ at: at0 + 400, leg: "thrash-6", verb: "dismount", args: { id: "thrash-6", pos: DPOS(6, 40 + k) } });
  }
  // thrash-9 returns at 13.5 and dismounts its dormant ride at 14.0
  schedule.push({ at: RET9_DM_AT, leg: "thrash-9", verb: "dismount", args: { id: "thrash-9", pos: DPOS(9, 50) } });
  // survivor dismounts before teardown (their own verbs, clean end state)
  for (const [n, spec] of [[0, "thrash-8"], [1, "late-0"], [2, "late-1"]] as const)
    schedule.push({ at: SURVIVOR_DM_AT + n * 40, leg: spec, verb: "dismount", args: { id: spec, pos: DPOS(40 + n, 60) } });
  schedule.push({ at: SURVIVOR_DM_AT + 120, leg: "perf-3", verb: "dismount", args: { id: "crate-1", pos: [...CRATE0] } });
  schedule.sort((a, b) => a.at - b.at);
}
const plannedAccepted = schedule.filter((p) => !p.refused).length;
// expected log lines: genesis + grant + 7 spawns + 2 places (seat-x moves) +
// 1 remove (seat-e) + 1 say + accepted mount/dismount verbs + 1 dismount the
// DEMOTE path must append (S3 contract; baseline RED shows drift 1 here)
const DEMOTE_DM = 1;
const EXPECT_LOG_EXACT = 1 + 1 + 7 + 2 + 1 + 1 + plannedAccepted + DEMOTE_DM;

// per-leg sliding rate audit: no leg may exceed 12 verbs in any 4s window
// (the server refuses #13). Fail the harness BEFORE measuring if violated.
{
  const byLeg = new Map<string, number[]>();
  for (const p of schedule) {
    if (p.refused) continue;                       // spectator gate returns before the rate window
    const a = byLeg.get(p.leg) ?? []; a.push(p.at); byLeg.set(p.leg, a);
  }
  const verbs = ["spawn", "place", "remove", "say"];
  const extra: Planned[] = [];
  const addExtra = (leg: string, at: number) => { const a = byLeg.get(leg) ?? []; a.push(at); byLeg.set(leg, a); };
  for (let k = 0; k < 5; k++) addExtra("perf-0", SPAWN_AT);          // seat spawns
  addExtra("perf-1", SPAWN_AT); addExtra("perf-1", 6_450); addExtra("perf-1", 8_950); // seat-x + 2 places
  addExtra("perf-3", CRATE_AT);                                        // crate spawn
  addExtra("perf-2", W7_REMOVE_AT);                                    // remove
  addExtra("perf-5", SAY_AT);                                          // say
  void verbs; void extra;
  for (const [leg, times] of byLeg) {
    times.sort((a, b) => a - b);
    for (let i = 0; i < times.length; i++) {
      const n = times.filter((t) => t >= times[i] && t < times[i] + 4_000).length;
      if (n > 12) {
        console.log(`FAIL: rate-plan violation — ${leg} has ${n} verbs in a 4s window at t+${(times[i] / 1000).toFixed(2)}s (server cap 12/4s)`);
        process.exit(2);
      }
    }
  }
}

// ---- pure gate evaluation (SELFTEST exercises the same math) ------------------
type Measurements = {
  anchorFailed: number; anchorJoinP95: number; lateJoinP95: number; rejoinP95: number;
  spectatorMountRefusal: number; refusalWrongString: number; unexpectedErrors: number;
  mountVerbsAccepted: number; mountVerbMisses: number;
  thrashVerbP95: number; mountEchoP95: number;
  sayAppended: number; sayP95: number;
  censusMountedExact: number; censusMountedExtra: number; censusMountedMissing: number;
  censusCargoOk: number; censusPresentExact: number; censusGhostBodies: number; censusDups: number;
  rejoinSeated: number;
  vanishedGhostPresent: number;
  demotedListed: number;
  finalMountedBodies: number; finalMountedDormantOnly: number; finalMountedEntities: number;
  finalStateEntities: number; finalPresent: number;
  logDrift: number; posesKeys: number; posesAliens: number;
  fpsP50: number; latP95: number; gaps: number;
  probeStormP95: number; probeSettledP95: number;
  logSuspicious: number; rssPeakGrowth: number;
  rateRefusals: number;
};
function evaluate(m: Measurements): string[] {
  const fail: string[] = [];
  if (m.anchorFailed > 0) fail.push(`${m.anchorFailed} anchor connections failed to join`);
  if (m.anchorJoinP95 > 3_000) fail.push(`anchor join p95 ${Math.round(m.anchorJoinP95)}ms > 3000ms`);
  if (m.lateJoinP95 > 3_000) fail.push(`late join p95 ${Math.round(m.lateJoinP95)}ms > 3000ms`);
  if (m.rejoinP95 > 1_500) fail.push(`role-change/rejoin p95 ${Math.round(m.rejoinP95)}ms > 1500ms`);
  if (m.spectatorMountRefusal < 1) fail.push(`spectator mount was not refused with the exact authorship error`);
  if (m.refusalWrongString > 0) fail.push(`${m.refusalWrongString} refusal(s) with the WRONG error string`);
  if (m.rateRefusals > 0) fail.push(`${m.rateRefusals} rate-limit refusals — the per-client budget did not hold for the thrash wave`);
  if (m.unexpectedErrors > 0) fail.push(`${m.unexpectedErrors} unexpected error message(s)`);
  if (m.mountVerbsAccepted !== plannedAccepted + DEMOTE_DM) fail.push(`accepted mount/dismount verbs ${m.mountVerbsAccepted} != ${plannedAccepted + DEMOTE_DM} — a scheduled verb was lost, duplicated, or the demote path did not append its dismount`);
  if (m.mountVerbMisses > 0) fail.push(`${m.mountVerbMisses} scheduled thrash verbs never echoed — silent drop`);
  if (m.thrashVerbP95 > 1_500) fail.push(`thrash verb author p95 ${Math.round(m.thrashVerbP95)}ms > 1500ms`);
  if (m.mountEchoP95 > 1_500) fail.push(`seer mount-echo p95 ${Math.round(m.mountEchoP95)}ms > 1500ms`);
  if (m.sayAppended < 1) fail.push(`mid-thrash fairness say ${m.sayAppended}/1`);
  if (m.sayP95 > 500) fail.push(`say author p95 ${Math.round(m.sayP95)}ms > 500ms`);
  if (m.censusMountedExtra > 0) fail.push(`${m.censusMountedExtra} EXTRA body rider(s) at census — a resolved rider (dismounted/demoted/vanished-returned) stayed in the mounts table`);
  if (m.censusMountedMissing > 0) fail.push(`${m.censusMountedMissing} pinned body rider(s) MISSING at census — a mounted rider fell off`);
  if (m.censusMountedExact < CENSUS_MOUNTED.size) fail.push(`census mounted set ${m.censusMountedExact}/${CENSUS_MOUNTED.size}`);
  if (m.censusCargoOk < 1) fail.push(`cargo crate-1 not riding seat-b via ent.parent at census`);
  if (m.censusPresentExact < 1) fail.push(`census present[] not the exact ${CENSUS_PRESENT}-id embodied set`);
  if (m.censusDups > 0) fail.push(`${m.censusDups} duplicate ids in census present[]`);
  if (m.censusGhostBodies > 0) fail.push(`${m.censusGhostBodies} vanished body(ies) listed in census present[] — ghost riders`);
  if (m.rejoinSeated < 1) fail.push(`returning rider thrash-9 did not see its dormant seat in the rejoin snapshot — reconnect contract broke`);
  if (m.vanishedGhostPresent > 0) fail.push(`${m.vanishedGhostPresent} vanished body(ies) in the post-vanish probe present[] — close path leaked a body`);
  if (m.demotedListed > 0) fail.push(`${m.demotedListed} snapshot(s) listed the DEMOTED rider as mounted — a spectator may not keep a seat (pressure-14 seam)`);
  if (m.finalMountedBodies !== DORMANT_TRIO.length) fail.push(`final mounts table holds ${m.finalMountedBodies} bodies, want EXACTLY the dormant trio (${DORMANT_TRIO.join(",")}) — live riders did not resolve`);
  if (m.finalMountedDormantOnly < 1) fail.push(`final mounts table is not exactly the dormant trio — unexpected residue or lost reconnect entries`);
  if (m.finalMountedEntities > 0) fail.push(`${m.finalMountedEntities} entity rider(s) still attached at the final fold`);
  if (m.finalStateEntities !== 6) fail.push(`final entity count ${m.finalStateEntities} != 6 — spawn/remove drift`);
  if (m.finalPresent > 0) fail.push(`final present ${m.finalPresent} — world not empty after teardown`);
  if (m.logDrift > 0) fail.push(`world log line drift ${m.logDrift} (want ${EXPECT_LOG_EXACT})`);
  if (m.posesKeys !== EXPECT_POSES) fail.push(`poses.json keys ${m.posesKeys} != ${EXPECT_POSES}`);
  if (m.posesAliens > 0) fail.push(`${m.posesAliens} alien poses.json entries`);
  if (m.fpsP50 < 12) fail.push(`seer fps p50 ${m.fpsP50.toFixed(1)} < 12`);
  if (m.latP95 > 250) fail.push(`frame latency p95 ${Math.round(m.latP95)}ms > 250ms`);
  if (m.gaps > 0) fail.push(`${m.gaps} frame seq gaps`);
  if (m.probeStormP95 > 500) fail.push(`thrash-window HTTP probe p95 ${Math.round(m.probeStormP95)}ms > 500ms`);
  if (m.probeSettledP95 > 100) fail.push(`post-teardown HTTP probe p95 ${Math.round(m.probeSettledP95)}ms > 100ms`);
  if (m.logSuspicious > 0) fail.push(`${m.logSuspicious} suspicious server log lines`);
  if (m.rssPeakGrowth > 60) fail.push(`RSS peak growth ${m.rssPeakGrowth}MB > 60MB`);
  return fail;
}

if (SELFTEST) {
  const healthy: Measurements = {
    anchorFailed: 0, anchorJoinP95: 41, lateJoinP95: 22, rejoinP95: 18,
    spectatorMountRefusal: 1, refusalWrongString: 0, unexpectedErrors: 0,
    mountVerbsAccepted: plannedAccepted + DEMOTE_DM, mountVerbMisses: 0,
    thrashVerbP95: 120, mountEchoP95: 140,
    sayAppended: 1, sayP95: 8,
    censusMountedExact: CENSUS_MOUNTED.size, censusMountedExtra: 0, censusMountedMissing: 0,
    censusCargoOk: 1, censusPresentExact: 1, censusGhostBodies: 0, censusDups: 0,
    rejoinSeated: 1,
    vanishedGhostPresent: 0,
    demotedListed: 0,
    finalMountedBodies: 3, finalMountedDormantOnly: 1, finalMountedEntities: 0,
    finalStateEntities: 6, finalPresent: 0,
    logDrift: 0, posesKeys: EXPECT_POSES, posesAliens: 0,
    fpsP50: 14.8, latP95: 11, gaps: 0,
    probeStormP95: 6, probeSettledP95: 2,
    logSuspicious: 0, rssPeakGrowth: 15,
    rateRefusals: 0,
  };
  const breached: Measurements = {
    ...healthy,
    anchorFailed: 3, anchorJoinP95: 4_100, lateJoinP95: 3_800, rejoinP95: 2_400,
    spectatorMountRefusal: 0, refusalWrongString: 1, unexpectedErrors: 6,
    mountVerbsAccepted: plannedAccepted - 17, mountVerbMisses: 17,
    thrashVerbP95: 2_800, mountEchoP95: 3_100,
    sayAppended: 0, sayP95: 900,
    censusMountedExact: 3, censusMountedExtra: 2, censusMountedMissing: 3,
    censusCargoOk: 0, censusPresentExact: 0, censusGhostBodies: 2, censusDups: 1,
    rejoinSeated: 0,
    vanishedGhostPresent: 1,
    demotedListed: 1,
    finalMountedBodies: 7, finalMountedDormantOnly: 0, finalMountedEntities: 1,
    finalStateEntities: 9, finalPresent: 2,
    logDrift: 5, posesKeys: EXPECT_POSES - 4, posesAliens: 3,
    fpsP50: 7, latP95: 480, gaps: 5,
    probeStormP95: 950, probeSettledP95: 320,
    logSuspicious: 5, rssPeakGrowth: 120,
    rateRefusals: 9,
  };
  const a = evaluate(healthy), b = evaluate(breached);
  const want = ["anchor connections failed", "anchor join p95", "late join p95", "rejoin p95", "not refused", "WRONG error string", "per-client budget", "unexpected error message", "lost, duplicated, or the demote path", "never echoed", "thrash verb author p95", "seer mount-echo p95", "fairness say", "say author p95", "EXTRA body rider", "MISSING at census", "census mounted set", "ent.parent at census", "exact 39-id embodied set", "duplicate ids in census", "ghost riders", "reconnect contract broke", "close path leaked a body", "a spectator may not keep a seat", "EXACTLY the dormant trio", "not exactly the dormant trio", "still attached at the final fold", "spawn/remove drift", "world not empty", "world log line drift", "poses.json keys", "alien poses.json", "seer fps p50", "frame latency p95", "frame seq gaps", "thrash-window HTTP", "post-teardown HTTP", "suspicious server log", "RSS peak growth"];
  const ok = a.length === 0 && want.every((w) => b.some((f) => f.includes(w)));
  console.log(ok ? `SELFTEST PASS — healthy gates clean, breached gates fire (${b.length} fails; plan ${schedule.length} verbs, ${plannedAccepted} accepted, expect log ${EXPECT_LOG_EXACT})` : `SELFTEST FAIL — a=[${a}] b=[${b}] missing=[${want.filter((w) => !b.some((f) => f.includes(w)))}]`);
  process.exit(ok ? 0 : 1);
}

console.log(`pinned contract: ${N_PERF} perf @${PERF_HZ}Hz + ${N_SPEC + 1} spec + ${N_THRASH} thrash + ${N_LATE} late = ${N_PERF + N_SPEC + 1 + N_THRASH + N_LATE} peak sockets; ${schedule.length} scheduled mount/dismount verbs (${plannedAccepted} accepted + 1 refused spectator probe); census t+${CENSUS_AT / 1000}s expects mounts {${[...CENSUS_MOUNTED].join(",")}} + crate-1 on seat-b, present ${CENSUS_PRESENT} exact; final fold expects exactly the dormant trio + 0 entity riders. ${DURATION / 1000}s, MSG_RATE=${MSG_RATE}`);

// ---- fd budget ----------------------------------------------------------------
const fdRaw = new TextDecoder().decode(Bun.spawnSync(["sh", "-c", "ulimit -n"]).stdout).trim();
const fdLimit = fdRaw === "unlimited" ? Infinity : Number(fdRaw);
if (fdLimit !== Infinity && fdLimit < 400) {
  console.log(`FAIL: file-descriptor limit ${fdLimit} < 400 — launch as: ulimit -n 1024 && bun tools/pressure-mountthrash.ts`);
  process.exit(2);
}

// ---- scratch sequencer lifecycle ----------------------------------------------
rmSync(WORLDS, { recursive: true, force: true });
mkdirSync(WORLDS, { recursive: true });
const logPath = `/tmp/pressure22-server-${Date.now()}.log`;
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
  ws: WebSocket; id: string; world: string; emb: boolean;
  joinMs: number; openAt: number; closed: boolean; closeCode: number;
  snapMounts: Record<string, any> | null; snapPresent: string[];
  lastSnapT: number;
  frames: number; gaps: number; lastSeq: number; lat: number[];
  verbEcho: Map<string, { at: number; entry: any }>;
  sayEcho: Map<string, number>;
  errs: { at: number; text: string }[];
};
function connect(id: string, world: string, spectate: boolean, n = 0): Promise<Spec> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const s: Spec = { ws, id, world, emb: !spectate, joinMs: -1, openAt: performance.now(), closed: false, closeCode: 0,
      snapMounts: null, snapPresent: [], lastSnapT: -1, frames: 0, gaps: 0, lastSeq: -1, lat: [],
      verbEcho: new Map(), sayEcho: new Map(), errs: [] };
    const to = setTimeout(() => { try { ws.close(); } catch {} reject(new Error(`${id}: join timeout`)); }, 30_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world, id, avatar: n ? `av${n}.vrm` : "x.vrm", spectate, token: TOKEN }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.type === "snapshot") {
        const now = performance.now();
        if (s.joinMs < 0) s.joinMs = now;
        s.lastSnapT = now;
        s.snapMounts = { ...((m.state ?? {}).mounts ?? {}) };
        s.snapPresent = (m.present ?? []).map((o: any) => String(o.id ?? ""));
        clearTimeout(to); resolve(s);
      } else if (m.type === "frame") {
        s.frames++; s.lat.push(Date.now() - m.t);
        if (s.lastSeq >= 0 && m.seq > s.lastSeq + 1) s.gaps += m.seq - s.lastSeq - 1;
        s.lastSeq = m.seq;
      } else if (m.type === "log" && m.entry) {
        const e = m.entry;
        if (e.verb === "mount" || e.verb === "dismount") s.verbEcho.set(String(e.seq), { at: performance.now(), entry: e });
        else if (e.verb === "say" && !s.sayEcho.has(String(e.args?.text ?? ""))) s.sayEcho.set(String(e.args?.text ?? ""), performance.now());
      }
      else if (m.type === "error") s.errs.push({ at: performance.now() - t0, text: String(m.error ?? "") });
    };
    ws.onclose = (ev: any) => { s.closed = true; s.closeCode = Number(ev?.code ?? 0); };
    ws.onerror = () => { /* close follows */ };
  });
}
function rejoin(s: Spec, spectate: boolean): Promise<number> {
  return new Promise((resolve) => {
    const prev = s.lastSnapT;
    if (s.ws.readyState !== 1) { resolve(-1); return; }
    const sent = performance.now();
    const iv = setInterval(() => {
      if (s.lastSnapT !== prev) { clearInterval(iv); resolve(performance.now() - sent); }
      else if (s.closed) { clearInterval(iv); resolve(-1); }
    }, 10);
    setTimeout(() => { clearInterval(iv); resolve(-1); }, 10_000);
    s.ws.send(JSON.stringify({ type: "join", world: s.world, id: s.id, avatar: "x.vrm", spectate, token: TOKEN }));
  });
}

// ---- anchor population --------------------------------------------------------
const t0 = performance.now();
const at = (ms: number, fn: () => void) => setTimeout(fn, ms - (performance.now() - t0));
const SEER = await connect(`spec-0`, WORLD, true);
const all = await Promise.allSettled([
  ...Array.from({ length: N_SPEC }, (_, i) => connect(`spec-${i + 1}`, WORLD, true)),
  ...Array.from({ length: N_PERF }, (_, i) => connect(`perf-${i}`, WORLD, false, i)),
  ...Array.from({ length: N_THRASH }, (_, i) => connect(`thrash-${i}`, WORLD, i === 8, 100 + i)),
]);
const anchors = [SEER, ...all.filter((r) => r.status === "fulfilled").map((r: any) => r.value as Spec)];
const anchorFailed = all.length - (anchors.length - 1);
const perfs = anchors.filter((s) => s.id.startsWith("perf-"));
const joinTimes = anchors.map((s) => s.joinMs >= 0 ? s.joinMs : 1);
console.log(`t+0: anchors joined ${anchors.length}/${all.length + 1} — p50 ${Math.round(pct(joinTimes, 50))}ms p95 ${Math.round(pct(joinTimes, 95))}ms`);

// ---- presence tickers (every embodied leg poses; riders are live bodies) -------
let running = true;
const tickers: any[] = [];
const walk = (i: number, t: number, r: number) => [Math.sin(t * 0.5 + i) * r, 0, Math.cos(t * 0.5 + i) * r] as number[];
const legById = new Map<string, Spec>();
for (const s of anchors) legById.set(s.id, s);
const poseTicker = (s: Spec, i: number) => tickers.push(setInterval(() => {
  if (!running || !s.emb || s.ws.readyState !== 1) return;
  s.ws.send(JSON.stringify({ type: "pose", pose: { p: walk(i, Date.now() / 1000, 8.6), yaw: (Date.now() / 1000 + i) % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
}, 1000 / POSE_HZ));
for (const s of perfs) {
  const i = Number(s.id.slice(5));
  tickers.push(setInterval(() => {
    if (!running || s.ws.readyState !== 1) return;
    s.ws.send(JSON.stringify({ type: "pose", pose: { p: walk(i, Date.now() / 1000, 10), yaw: (Date.now() / 1000 + i) % (Math.PI * 2), speed: 1.4, clip: "walk" } }));
  }, 1000 / PERF_HZ));
}
for (const s of anchors) if (s.id.startsWith("thrash-")) poseTicker(s, 100 + Number(s.id.slice(7)));

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

// ---- host spawns + host motion + remove ---------------------------------------
const sendVerb = (s: Spec | undefined, verb: string, args: Record<string, unknown>) => {
  if (!s || s.ws.readyState !== 1) return;
  s.ws.send(JSON.stringify({ type: "verb", verb, args }));
};
at(SPAWN_AT, () => {
  for (let k = 0; k < SEATS.length; k++) sendVerb(perfs[0], "spawn", { id: SEATS[k], lib: "deco/bench.glb", pos: [...SEAT_POS[k]], yaw: 0 });
  sendVerb(perfs[1], "spawn", { id: "seat-x", lib: "deco/bench.glb", pos: [...SEAT_X0], yaw: 0 });
});
at(CRATE_AT, () => sendVerb(perfs[3], "spawn", { id: "crate-1", lib: "deco/crate.glb", pos: [...CRATE0], yaw: 0 }));
at(6_450, () => sendVerb(perfs[1], "place", { id: "seat-x", pos: [...SEAT_X1], yaw: Math.PI / 2 }));
at(8_950, () => sendVerb(perfs[1], "place", { id: "seat-x", pos: [...SEAT_X2], yaw: 0 }));
at(W7_REMOVE_AT, () => sendVerb(perfs[2], "remove", { id: "seat-e" }));

// ---- the thrash schedule engine -------------------------------------------------
const sentLog: { leg: string; verb: string; args: Record<string, unknown>; sentAt: number }[] = [];
for (const p of schedule) {
  at(p.at, () => {
    const s = legById.get(p.leg);
    if (!s || s.ws.readyState !== 1) return;
    sentLog.push({ leg: p.leg, verb: p.verb, args: p.args, sentAt: performance.now() });
    s.ws.send(JSON.stringify({ type: "verb", verb: p.verb, args: p.args }));
  });
}

// late embodied joins mid-thrash (double as W3/W5 race legs)
const lateJoins: Spec[] = [];
for (let j = 0; j < N_LATE; j++) {
  at(5_500 + j * 60, async () => {
    try {
      const s = await connect(`late-${j}`, WORLD, false, 300 + j);
      lateJoins.push(s); legById.set(s.id, s); poseTicker(s, 300 + j);
    } catch { /* counted by late-join gate */ }
  });
}

// W4 promotion (live socket) — the clean mount at 7.6 is already scheduled
const rejoinMs: number[] = [];
at(W4_PROMO_AT, async () => {
  const s = legById.get("thrash-8"); if (!s) return;
  const ms = await rejoin(s, false); if (ms > 0) rejoinMs.push(ms); s.emb = true;
});
// W6 vanish while mounted — close sockets after the mounts land
at(W6_CLOSE_AT, () => {
  for (let i = 9; i <= 12; i++) { const s = legById.get(`thrash-${i}`); if (s) { try { s.ws.close(); } catch {} } }
});
// W9 demote-while-mounted on the live socket
at(W9_AT, async () => {
  const s = legById.get("thrash-13"); if (!s) return;
  const ms = await rejoin(s, true); if (ms > 0) rejoinMs.push(ms); s.emb = false;
});
// thrash-9 RETURNS embodied (reconnect contract) — its dismount is scheduled at 14.0
let returned9: Spec | undefined;
at(RET9_AT, async () => {
  try {
    returned9 = await connect(`thrash-9`, WORLD, false, 109);
    legById.set("thrash-9", returned9); poseTicker(returned9, 109);
  } catch { returned9 = undefined; }
});

// ---- fairness say ---------------------------------------------------------------
const SAY = `p22-say-${Math.floor(t0)}`;
let saySentAt = 0;
at(SAY_AT, () => { saySentAt = performance.now(); sendVerb(perfs[5], "say", { text: SAY }); });

// ---- probes ----------------------------------------------------------------------
let vanishProbePresent: string[] | null = null;
let vanishProbeMounts: string[] | null = null;
let demoteProbeHas13: boolean | null = null;
let censusMounts: Set<string> | null = null;
let censusCargoTo: string | null = null;
let censusPresent: string[] | null = null;
let finalMounts: Set<string> | null = null;
let finalParents: Set<string> | null = null;
let finalEntities = -1;
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
at(VANISH_PROBE_AT, async () => {
  const m = await probeJoin(`vanish-probe-${Math.floor(t0)}`);
  if (m) {
    vanishProbePresent = (m.present ?? []).map((o: any) => String(o.id ?? ""));
    vanishProbeMounts = Object.keys((m.state ?? {}).mounts ?? {});
  }
});
at(DEMOTE_PROBE_AT, async () => {
  const m = await probeJoin(`demote-probe-${Math.floor(t0)}`);
  if (m) demoteProbeHas13 = "thrash-13" in ((m.state ?? {}).mounts ?? {});
});
at(CENSUS_AT, async () => {
  const m = await probeJoin(`census-probe-${Math.floor(t0)}`);
  if (m) {
    censusMounts = new Set(Object.keys((m.state ?? {}).mounts ?? {}));
    const ents = (m.state ?? {}).entities ?? {};
    const crate = ents["crate-1"];
    censusCargoTo = crate?.parent?.to ?? null;
    censusPresent = (m.present ?? []).map((o: any) => String(o.id ?? ""));
  }
});
at(FINAL_AT, async () => {
  const m = await probeJoin(`final-probe-${Math.floor(t0)}`);
  if (m) {
    finalMounts = new Set(Object.keys((m.state ?? {}).mounts ?? {}));
    const ents = (m.state ?? {}).entities ?? {};
    finalParents = new Set(Object.entries(ents).filter(([, e]: any) => e?.parent).map(([k]) => k));
    finalEntities = Object.keys(ents).length;
    finalPresent = (m.present ?? []).length;
  }
});

// ---- teardown ---------------------------------------------------------------------
at(TEARDOWN_AT, () => {
  running = false;
  for (const s of anchors) if (s !== SEER) { try { s.ws.close(); } catch {} }
  for (const s of lateJoins) { try { s.ws.close(); } catch {} }
  if (returned9) { try { returned9.ws.close(); } catch {} }
});
at(SEER_CLOSE_AT, () => { try { SEER.ws.close(); } catch {} });

await sleep(DURATION);
tickers.forEach(clearInterval);
clearInterval(probeTimer); clearInterval(rssTimer);
rssSamples.settled = rss();
await sleep(300);

// ---- verdicts ----------------------------------------------------------------------
const legs = [...anchors, ...lateJoins, ...(returned9 ? [returned9] : [])];
// 1) echo accounting: every scheduled accepted verb appears in the seer's
// broadcast echo stream exactly once (per (verb, id) key)
let mountVerbMisses = 0;
{
  const want = new Map<string, number>();
  for (const p of schedule) if (!p.refused) { const k = `${p.verb}|${p.args.id}`; want.set(k, (want.get(k) ?? 0) + 1); }
  // the demote path's appended dismount is an EXTRA dismount for thrash-13
  want.set("dismount|thrash-13", (want.get("dismount|thrash-13") ?? 0) + DEMOTE_DM);
  const got = new Map<string, number>();
  const seerLog = [...SEER.verbEcho.values()];
  for (const v of seerLog) { const k = `${v.entry.verb}|${String(v.entry.args?.id ?? "")}`; got.set(k, (got.get(k) ?? 0) + 1); }
  for (const [k, w] of want) {
    const g = got.get(k) ?? 0;
    if (g !== w) { mountVerbMisses += Math.abs(g - w); if (mountVerbMisses <= 8) console.log(`  echo drift ${k}: got ${g} want ${w}`); }
  }
}
// 2) error accounting
const allErrs = legs.flatMap((s) => s.errs.map((e) => ({ id: s.id, ...e })));
const refusalTexts = allErrs.filter((e) => e.text.includes("spectators can't author"));
const spectatorMountRefusal = refusalTexts.some((e) => e.at > W4_AT - 300 && e.at < W4_AT + 2_000) ? 1 : 0;
const refusalWrongString = refusalTexts.filter((e) => e.text !== REFUSAL).length;
const rateRefusals = allErrs.filter((e) => e.text.includes("slow down")).length;
const unexpectedErrors = Math.max(0, allErrs.length - 1);   // exactly the W4 refusal is expected
// 3) thrash verb latency: per-leg send -> that leg's own authoritative echo
const authorLat: number[] = [];
{
  const used = new Set<string>();
  for (const rec of sentLog) {
    const s = legById.get(rec.leg); if (!s) continue;
    for (const [seq, v] of s.verbEcho) {
      if (used.has(seq)) continue;
      if (v.entry?.verb === rec.verb && String(v.entry?.args?.id ?? "") === String(rec.args.id) && v.at >= rec.sentAt - 5) {
        used.add(seq); authorLat.push(v.at - rec.sentAt); break;
      }
    }
  }
}
// seer echo latency: per-key chronological pairing
const seerMountLat: number[] = [];
{
  const key = (v: string, id: string) => `${v}|${id}`;
  const sentB = new Map<string, number[]>(), echoB = new Map<string, number[]>();
  for (const rec of sentLog) { const k = key(rec.verb, String(rec.args.id)); const a = sentB.get(k) ?? []; a.push(rec.sentAt); sentB.set(k, a); }
  for (const v of SEER.verbEcho.values()) { const k = key(v.entry.verb, String(v.entry.args?.id ?? "")); const a = echoB.get(k) ?? []; a.push(v.at); echoB.set(k, a); }
  for (const [k, sents] of sentB) {
    const echoes = echoB.get(k) ?? [];
    const n = Math.min(sents.length, echoes.length);
    for (let i = 0; i < n; i++) seerMountLat.push(echoes[i] - sents[i]);
  }
}
// 4) census verdicts (assertions: TS cannot see closure assignments)
const cm = censusMounts as Set<string> | null;
let censusMountedExact = 0, censusMountedExtra = 0, censusMountedMissing = 0;
if (cm) {
  censusMountedExtra = [...cm].filter((x) => !CENSUS_MOUNTED.has(x)).length;
  censusMountedMissing = [...CENSUS_MOUNTED].filter((x) => !cm.has(x)).length;
  censusMountedExact = censusMountedExtra === 0 && censusMountedMissing === 0 ? cm.size : Math.min(cm.size, CENSUS_MOUNTED.size);
  if (censusMountedExtra || censusMountedMissing) console.log(`  census riders: got [${[...cm].join(",")}] want [${[...CENSUS_MOUNTED].join(",")}]`);
} else censusMountedMissing = 999;
const censusCargoOk = censusCargoTo === "seat-b" ? 1 : 0;
const cp = censusPresent as string[] | null;
let censusPresentExact = 0, censusGhostBodies = 0, censusDups = 0;
if (cp) {
  const vanished = ["thrash-10", "thrash-11", "thrash-12"];
  censusGhostBodies = cp.filter((x) => vanished.includes(x)).length;
  censusDups = cp.length - new Set(cp).size;
  const wantPresent = new Set<string>([
    ...Array.from({ length: N_PERF }, (_, i) => `perf-${i}`),
    ...Array.from({ length: 10 }, (_, i) => `thrash-${i}`),   // 0..9 (9 returned at 13.5)
    ...Array.from({ length: N_LATE }, (_, j) => `late-${j}`),
  ]);
  censusPresentExact = cp.length === CENSUS_PRESENT && censusDups === 0 && censusGhostBodies === 0
    && [...wantPresent].every((x) => cp.includes(x)) ? 1 : 0;
  if (!censusPresentExact) console.log(`  census present: got ${cp.length} (want ${CENSUS_PRESENT}) missing [${[...wantPresent].filter((x) => !cp.includes(x)).slice(0, 5)}] extra [${cp.filter((x) => !wantPresent.has(x)).slice(0, 5)}]`);
}
// 5) vanish/demote/return verdicts
const vpp = vanishProbePresent as string[] | null;
const vanishedGhostPresent = vpp ? ["thrash-9", "thrash-10", "thrash-11", "thrash-12"].filter((x) => vpp.includes(x)).length : 999;
const vpm = vanishProbeMounts as string[] | null;
const demotedListed = demoteProbeHas13 === null ? 999 : (demoteProbeHas13 ? 1 : 0);
const rejoinSeated = returned9 && (returned9 as any).snapMounts && "thrash-9" in (returned9 as any).snapMounts ? 1 : 0;
// 6) final fold verdicts
const fm = finalMounts as Set<string> | null;
const fpar = finalParents as Set<string> | null;
const finalMountedBodies = fm ? fm.size : 999;
const finalMountedDormantOnly = fm && DORMANT_TRIO.every((x) => fm.has(x)) && fm.size === DORMANT_TRIO.length ? 1 : 0;
const finalMountedEntities = fpar ? fpar.size : 999;
// 7) fairness say
const sayEchoAt = SEER.sayEcho.get(SAY);
const saysAppended = sayEchoAt !== undefined ? 1 : 0;
const sayP95 = sayEchoAt !== undefined && saySentAt ? sayEchoAt - saySentAt : 999;
// 8) presence health
const seerWindow = Math.max(0.001, (SEER_CLOSE_AT - 1_000) / 1000);
const fpsP50 = SEER.frames / seerWindow;
const latP95 = pct(SEER.lat, 95);
const log = await logFile.text();
const suspicious = log.split("\n").filter((l: string) => /error|warn|uncaught|failed/i.test(l));
const rssPeakGrowth = MB((rssSamples.peak || NaN) - (rssSamples.postJoin || NaN));

// ---- world-log + poses.json ground truth (kill server first for flush) -----------
server.kill("SIGTERM");
await server.exited;
let logDrift = 999, logMounts = 0, logDismounts = 0, sayInLog = 0;
{
  const p = `${WORLDS}/${WORLD}/log.jsonl`;
  if (existsSync(p)) {
    const entries = readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } });
    logDrift = Math.abs(entries.length - EXPECT_LOG_EXACT);
    logMounts = entries.filter((e) => e?.verb === "mount").length;
    logDismounts = entries.filter((e) => e?.verb === "dismount").length;
    sayInLog = entries.filter((e) => e?.verb === "say" && e?.args?.text === SAY).length;
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
        if (k.startsWith("spec-") || k.includes("probe")) return true;
        const d = Array.isArray(poses[k]?.p) ? Math.hypot(poses[k].p[0], poses[k].p[2]) : -1;
        return d < 0 || d > 13.5;
      }).length;
    } catch { posesAliens = 999; }
  }
}

const lateJoinMs = lateJoins.map((s) => s.joinMs - s.openAt).filter((x) => x > 0);
const m: Measurements = {
  anchorFailed, anchorJoinP95: pct(joinTimes, 95), lateJoinP95: pct(lateJoinMs, 95), rejoinP95: pct(rejoinMs, 95),
  spectatorMountRefusal, refusalWrongString, unexpectedErrors,
  mountVerbsAccepted: logMounts + logDismounts, mountVerbMisses,
  thrashVerbP95: authorLat.length ? pct(authorLat, 95) : Infinity,
  mountEchoP95: seerMountLat.length ? pct(seerMountLat, 95) : Infinity,
  sayAppended: sayInLog, sayP95,
  censusMountedExact, censusMountedExtra, censusMountedMissing,
  censusCargoOk, censusPresentExact, censusGhostBodies, censusDups,
  rejoinSeated,
  vanishedGhostPresent,
  demotedListed,
  finalMountedBodies, finalMountedDormantOnly, finalMountedEntities,
  finalStateEntities: finalEntities < 0 ? 999 : finalEntities,
  finalPresent: finalPresent < 0 ? 999 : finalPresent,
  logDrift, posesKeys, posesAliens,
  fpsP50, latP95, gaps: SEER.gaps,
  probeStormP95: pct(probeStorm, 95), probeSettledP95: pct(probeSettled, 95),
  logSuspicious: suspicious.length, rssPeakGrowth,
  rateRefusals,
};
const fail = evaluate(m);

console.log(`
results
  anchors               ${anchors.length}/${all.length + 1} — p95 ${Math.round(m.anchorJoinP95)}ms (${anchorFailed} failed)
  late joins            ${lateJoinMs.length}/${N_LATE} — p95 ${Math.round(m.lateJoinP95)}ms — rejoins p95 ${Math.round(m.rejoinP95)}ms (n=${rejoinMs.length})
  thrash verbs          ${schedule.length} scheduled — log mounts ${logMounts} / dismounts ${logDismounts} (want ${plannedAccepted + DEMOTE_DM}) — echo misses ${mountVerbMisses}
  thrash latency        author p95 ${Math.round(m.thrashVerbP95)}ms (n=${authorLat.length}) — seer echo p95 ${Math.round(m.mountEchoP95)}ms (n=${seerMountLat.length})
  errors                spectator-mount refusal ${spectatorMountRefusal}/1 — wrong-string ${refusalWrongString} — rate ${rateRefusals} — unexpected ${unexpectedErrors}
  census                riders ${censusMountedExact}/${CENSUS_MOUNTED.size} (extra ${censusMountedExtra} missing ${censusMountedMissing}) — cargo ${censusCargoOk}/1 — present exact ${censusPresentExact}/${CENSUS_PRESENT} (dups ${censusDups} ghosts ${censusGhostBodies})
  vanish/return         post-vanish ghosts ${vanishedGhostPresent} — dormant listed [${vpm ? vpm.filter((x) => x.startsWith("thrash-")).join(",") : "PROBE-FAILED"}] — thrash-9 reseated on return ${rejoinSeated}/1
  demote                thrash-13 in mounts after demote: ${demotedListed === 0 ? "NO (clean)" : demotedListed === 1 ? "YES (S3 seam)" : "PROBE-FAILED"}
  final fold            mounts ${finalMountedBodies} (want exactly ${DORMANT_TRIO.length} dormant) — entity riders ${finalMountedEntities} — entities ${m.finalStateEntities} — present ${m.finalPresent}
  world log             drift ${logDrift}/${EXPECT_LOG_EXACT} — say ${sayInLog}/1 @ ${Math.round(sayP95)}ms
  poses.json            ${posesKeys}/${EXPECT_POSES} keys — aliens ${posesAliens}
  seer frames           ${Math.round(fpsP50 * 10) / 10}/s — lat p95 ${Math.round(latP95)}ms — gaps ${SEER.gaps}
  http probe ms         thrash p95 ${Math.round(m.probeStormP95)} (n=${probeStorm.length}) — settled p95 ${Math.round(m.probeSettledP95)} (n=${probeSettled.length})
  server rss            ready ${MB(rssReady)}MB → peak ${MB(rssSamples.peak)}MB (+${rssPeakGrowth}MB) → settled ${MB(rssSamples.settled)}MB
  server log            ${suspicious.length} suspicious lines
`);
if (suspicious.length) console.log(`suspicious lines:\n  ${suspicious.slice(0, 10).join("\n  ")}`);
if (unexpectedErrors > 0) console.log(`unexpected errors:\n  ${allErrs.slice(0, 8).map((e) => `${e.id}@${Math.round(e.at)}: ${e.text}`).join("\n  ")}`);
if (fm) console.log(`final mounts table: [${[...fm].join(",")}]`);

for (const s of legs) { try { s.ws.close(); } catch {} }
rmSync(WORLDS, { recursive: true, force: true });

console.log(fail.length ? `FAIL:\n  ${fail.join("\n  ")}` : `ALL GATES PASS — mount/dismount thrash leaves no orphaned rider state`);
process.exit(fail.length ? 1 : 0);
