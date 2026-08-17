# Village Audit Log

Find-only quality gate. One rotating depth per wakeup (1 true-SAT sweep /
2 door-lane walk-tests / 3 content-hash drift / 4 comp census / 5 keeper
sanity). Defects appended to REPAIR-REGISTER.md for the refinement loop.
verify-repairs.ts runs first each wakeup — a failure is itself a finding.

## 2026-08-17 00:5x — wakeup 1 (depth 1: true-SAT sweep, baseline)

- verify-repairs.ts: ALL PASS (13/13) — every past repair's live pose +
  clearances hold; ledger law exact at 2,367,880; hygiene clean.
- Live-yaw rotated-SAT sweep over 28 footprint entities (191 live total):
  **ALL CLEAR** — zero accidental overlaps; all standing contacts fixed or
  classified designed/rider.
- No commits existed since loop start (baseline run — AUDIT-LOG created;
  refinement/textures loops not yet launched by Bill).
- Register: 0 OPEN items. No new findings.

## 2026-08-17 ~01:2x — wakeups 2-13 consolidated (depth 2 logged; batch cheap-ticks)

- Depth 2 (door-lane walk-tests, run under wakeup 1's rotation): 4/4 PASS —
  av-inn 0.28/0.39m, av-row-cottage 0.36/0.27m, av-garden-cottage
  0.31/0.38m, arthur-house 0.25/0.28m (fresh MCPL body, probe deleted).
- verify-repairs.ts: ALL PASS both before and after the tex-1 work landed.
- Uncommitted tex-1 state observed mid-flight (refine-218 thatch on the
  stable roof, ledger law EXACT at 2,367,882): the textures loop is ACTIVE
  in parallel — its commit is its own to make (no audit-side commits of
  another lane's work).
- Wakeups 3-13: no new commits appeared between checks (texture loop's
  next commit still pending) — cheap ticks, consolidated here.
- Register: 0 OPEN items.
- 2026-08-17 ~01:4x — wakeup 14: cheap tick (no new commits since c672f93; tex-1 still mid-flight).

## 2026-08-17 ~02:0x — wakeup 15 (depth 3: content-hash drift)

- New commits since audit-14: tex-1 thatch rollout live-confirmed
  (aba3d0d + 65febfd) — the audit's first real coverage of texture work.
- verify-repairs.ts: ALL PASS (incl. the tex-1 verify pin).
- Depth 3: sha256[:16] of all 24 village GLBs vs live lib paths —
  **24 MATCH / 0 DRIFT**. The thatched stable is live on the new content
  hash (store/56d0122215bcca65 per tex-1's own confirm); standing world
  == source of truth across the whole set.
- Register: 0 OPEN items. No findings.

## 2026-08-17 ~02:1x — wakeup 16 (depth 4: comp census)

- verify-repairs.ts: ALL PASS.
- Census: 37 entities carry comps — all smoke/particles, motion anchors
  (carousel horses, hens, sails, bell, well, knot, waystone, mason works),
  sockets, and fireflies present and accounted.
- **Probe-blindness catch, not a defect:** my EXPECT table listed
  av-stable as a smoke carrier — it is NOT one by design. Decoded at
  source: mkv3-stable.ts (open-front livery) has no chimney/hearth/lamp
  anchor, and place-smoke.ts's chimney list correctly excludes it. So
  comp=[] on the tex-1 re-placed stable is the design, not a comp-wipe
  loss. No register entry per the loop law.
- Interior lights census (separate light entities, not comps):
  6/6 PRESENT (tw/gc/rc/bk/hl/ct).
- Register: 0 OPEN items.

## 2026-08-17 ~02:2x — wakeup 17 (depth 5: keeper daemon + route sanity)

- New since audit-16: refine-218 (honest-top run+fence — the support-abstain
  residuals FIXED, lie 0.106→0.000 / 0.105→0.025; register close-out).
  verify-repairs.ts: ALL PASS (now accepts refine- prefixed HEADs too).
- Keeper daemon: launchctl shows dev.arthur.eidoverse-resident PID 43556
  running (exit-code slot −15 = previously SIGTERMed instance, current one
  alive). resident.log writing as of 1 min ago — 746 circuit entries, laps
  completing ("lap complete — resting at home"), goat-pen-night stop
  reached: true. Route sanity: GOOD.
- resident.err holds 3 OOM RangeErrors — timestamps decode to the OLD
  daemon (19:37, pre-restart; err file not written since). Not a live
  fault; watching for recurrence next depth-5 rotation.
- Register: 0 OPEN items. No findings.
- 2026-08-17 ~02:3x — wakeup 18: cheap tick (no new commits since audit-17; depth-1 re-sweep ALL CLEAR over 28 entities for good measure).
- 2026-08-17 ~02:4x — wakeup 19: cheap tick (no new commits since audit-18).
- 2026-08-17 ~02:5x — wakeup 20: cheap tick (no new commits since audit-19).

## 2026-08-17 ~02:5x — wakeup 20 (cheap tick + verify FAIL decode)

- verify-repairs.ts: 1 FAILURE — "[tex-1] av-stable stands on the thatch
  build (56d0122215bcca65)".
- Decoded at source (not a village defect): av-stable live lib is
  store/aaf04bc81719be50.glb, and the LOCAL village_stable3.glb hashes to
  exactly aaf04bc81719be50 — **live == current source**. The world is
  consistent; the verify PIN is stale: TEXTURE-PLAN shows tex-2 (TIMBER via
  housekit wallSpan, which the stable consumes) as the next unchecked item —
  an in-flight texture-loop run rebuilt + re-placed the stable after tex-1,
  and the pin refresh belongs to that run's close-out (tex-1 did the same).
- No register entry: the standing world is correct; the pin is the texture
  lane's to update on commit. ESCALATION RULE for next wakeup: if verify
  still FAILs on this pin AND the texture lane has gone quiet (no new
  commits), append it to the register as a stale-pin defect.
- 2026-08-17 ~03:0x — wakeup 21: R-109 registered (stale pin per audit-20 escalation rule; texture lane quiet since 00:25, tex-2 uncommitted).

## 2026-08-17 ~03:1x — wakeup 22 (depth 3: hash drift, post-tex-2)

- New since audit-21: tex-2 TIMBER landed (854ae04 timber on all 10 wallSpan
  buildings, live census 22/22, comps re-applied; 34caeeb pins timber libs;
  43abf78 plan closed). R-109 CLOSED — the texture lane resumed, committed,
  and refreshed the pins exactly per the register's fix path.
- verify-repairs.ts: ALL PASS (superseded tex-1 pin now pinned to the
  thatch+timber build).
- Depth 3: 24 MATCH / 0 DRIFT across all village GLBs incl. the rebuilt
  timber batch — world == source everywhere.
- Register: 0 OPEN.
