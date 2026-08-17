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
