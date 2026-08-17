# REPAIR REGISTER — village defect ledger (repair loop, from 2026-08-16)

Loop prompt classes: COLLISIONS / INTERSECTIONS / REFINEMENT. One defect fully
repaired per wakeup. Verification: walk-test if enterable, else corner-aware
vertex probe; probes are files, run once, deleted.

Audit basis (wakeup 1, offline pass): placement-plan.ts composed with local
GLB bboxes (node translations added, inclusive bounds). Live `/geom?world=`
cross-check + content-hash drift PENDING (network reads blocked this tick —
approval timeout). Re-run live audit before acting on any R-2xx item.

## COLLISION POLICY (per object class — keep decisions consistent)

- Room-scale buildings (house, longhouse, tower, garden, row, bunk, hall,
  court, inn): walkable trimesh. Build >=20m² / >=2.4m (housekit CLEAR margin
  over the 16/2.2 browser gates). Doorways 1.4m clear, aprons 2.0 x 1.5m kept
  empty of blocking verts.
- Furniture-scale props (hutch, run, cistern, forge, laundry, carts, signs,
  watchpost): solid box under the room gate — intended SOLID; solid reads
  correctly, do not convert.
- Flat decor (rugs, doormats, path stones, stepping stones): L4 walk-safe by
  construction (thin boxes); pass-through by height, keep thin.
- Ground features (fieldpond, flax, grain fields, treeline, roads): flat /
  sparse; no support boxes; pass-through.
- World-scale libs (trees, roads, plaza, paths): excluded from sibling-overlap
  audit (bbox spans map).
- Riders (shutters, pondlife, run, inndoor): same-frame riders by design.
- Comp attachments (smoke, embers, lights): not geometry; excluded.
- Deliberate abutments: bellbase→belltower, gardenfence→garden cottage,
  watchpost→court.

### R-201 [REFINEMENT] arthur-house stale standing build — FIXED (wakeup 2)
- Evidence: content-hash drift, the only one of 24 checked libs. Live lib
  07adbde6f8719cc4 (20 nodes, no hv3_17, pre-merge vertex distribution) vs
  current source build 65b368b3d993f64d (21 nodes incl. hv3_17 = loop #97
  plinth class). All other 23 libs byte-identical to local builds.
- Fix: rebuilt (deterministic — same hash), uploaded (content-addressed),
  spawned same id/pos/yaw. Post-place /geom verify: lib MATCH, pos [22,0,16],
  yaw -2.35. No comps on this entity (snapshot comp={}), nothing re-applied.
- STATUS: FIXED (wakeup 2, 2026-08-16). Ad-hoc verified.

### R-202 [INTERSECTION] stable x paddock x inn cluster — FIXED (wakeup 3)
- Root cause: av-paddock stood at (39.6, -5.6) yaw -1.43 — an 8° skew off
  the stable frame plus a north position that put its NE rail through the
  stable floor slab and its east rail into the inn's SE porch corner.
- Fix: re-placed aligned to the stable frame (yaw -1.571), final center
  (39.6, -8.3). Verified against fresh live transforms (SAT rect math on
  source extents: pen 7.0x5.0, stable 5.4x4.2, inn 9.0x8.9): pen x stable
  2.1m CLEAR, pen x inn 0.3m CLEAR. Gate (local +Z) now faces the village.
- Keeper route updated: paddock stop moved (38.0,-2.6) -> (36.9,-8.3), gate
  approach. Daemon parse-verified + restarted clean.
- Residual classification: stable x inn 0.46m edge-kiss (inn porch step vs
  stable slab) — "the livery behind the inn" is the designed adjacency
  (mkv3-stable header comment); registered as ABJECT, no move.
- Probe-blindness note (loop law): first clearance probe had an inverted
  SAT predicate (min-vs-max) and my first re-place at -6.8 still kissed the
  inn corner (-0.7m); corrected probe + final position verified ALL CLEAR
  against live state. No ledger entry for the intermediate.
- STATUS: FIXED (wakeup 3, 2026-08-16). Ad-hoc verified.

## REGISTER (worst-first)

### R-101 [INTERSECTION + COLLISION] av-run × cottage apron/door-lane — FIXED (wakeup 4)
### R-102 [INTERSECTION] av-hutch × cottage apron — FIXED (wakeup 4)
- Root cause (decoded at source, live): the hutch sat at cottage-local
  (2.55, 2.10) — ON the cottage's front-right floor apron, inside the 2.0 x
  1.5m clear apron the door lane requires; the run (3.2 x 2.3m) covered part
  of the door lane itself. "Beside the garden fence" (plan comment) was never
  true at these coordinates.
- Fix: pair relocated to open ground south of the garden fence's east end:
  hutch (-28.0, 17.8) yaw 0, run (-28.0, 19.8) yaw 0 — run gate abuts the
  hutch (0.12m, designed adjacency), both face east toward the track.
  Verified vs fresh live transforms: hutch x slab 1.08m / x fence 2.48m;
  run x slab 0.4m / x fence 4.04m; door apron 10.1m clear (was on the lane).
  Two-way MCPL walk-test (fresh body): track point 0.35m, hutch front 0.30m,
  coop-side exit 0.39m, cottage door apron now WALKABLE at 0.28m — the door
  lane defect is closed with the move.
- Placer bug decoded (probe blindness, not a village defect): first placer
  gated verb 2 on a second snapshot that never comes — verbs are timer-paced
  now; av-run landed on the retry placer.
- Residual (registered, not fixed this wakeup): sim still abstains support
  on av-run ("uneven top, lie 0.11m") — the run's mesh reads uneven-topped
  to the classifier. Cosmetic-class; candidate for a mesh refinement pass.
- STATUS: FIXED (wakeup 4, 2026-08-16). Ad-hoc verified.

### R-3xx [INTERSECTION] av-forge × av-court — 2.69m × 2.2m
- Evidence: forge3 local bbox [-0.87..1.46]x[-0.78..0.6] at r=26.5 ang=322;
  court3 spans local [-6.14..6.14]x[-2.94..3] at r=26 ang=324 — the forge
  annex "at court NE corner" is an intentional annex placement... but
  2.69x2.53m overlap needs intent decode: mkv3-ring court comment says
  "WORKSHOP: open-front shed, mirrored on +X side of the court" — the forge
  is its own entity placed at the court's corner. Read mkv3-forge98 source
  comment: "court NE corner — the smithy annex". The overlap is by design
  (annex attached to court corner) → reclassify as deliberate abutment,
  register the exclusion, no fix needed. Register-only decision.
- STATUS: RESOLVED-BY-CLASSIFICATION (designed annex) — added to ABJECT list.

### R-3xx [INTERFECTION] av-bcistern × av-court — 1.77m × 1.16m
- Evidence: bcistern3 bbox [-0.45..1.19]x[-0. positions34..0.49] small box at
  r=24.2 ang=317 — plan comment "at the court E side". Court spans ±6.1m
  local; cistern at court E side overlapping 1.77x1.73 — again an annex-style
  deliberate placement at the court edge? Plan says "at the court E side —
  the/ bakery water". Same class as forge: annex at court edge. Read as
  designed adjacency; register exclusion, no fix.
- STATUS: RESOLVED-BY-CLASSIFICATION (designed annex) — added to ABJECT list.

### R-3xx [INTERSECTION] av-dyelaundry × av-row-cottage — 2.38m × 0.64m
- Evidence: dyelaundry3 bbox [-1.88..1.5]x[-0.04..0.7] at r=26.5 ang=205
  "behind the weaver row, E of the dye house". Row cottage at r=26 ang=216.
  The 2.38m overlap reads as the line standing IN the row's wall/back yard.
- Class: accidental (2.4m into the row cottage's back wall zone).
- Planned fix: nudge dyelaundry along local frame away from row wall,
  verify ≥0.3m clearance.
- R-3xx numbering: keep as R-103.

### R-103 [INTERSECTION] av-dyelaundry × av-row-cottage — FIXED (wakeup 5)
- Root cause (live decode): the laundry line stood at (-24.0, -11.2) yaw
  1.134 — its z-band (-12.9..-9.5) crossed the row cottage's slab edge
  (z -11.3) by 1.6m, i.e. the line stood IN the row's back-wall zone,
  "behind the weaver row" only by intent, not by geometry.
- Fix: re-placed at the row's W end, aligned to the row's frame:
  (-26.7, -13.0) yaw 0.941. Verified vs fresh live transforms: clearance
  to row slab 0.49m; nearest real neighbor (av-sign-weaver, a wall-mount
  rider) 2.47m; generous-rect sibling sweep found no other contacts.
- Two-way MCPL walk-test (fresh body): row-side start 0.27m, laundry front
  0.35m, exit toward shrine path 0.39m. No comps on the entity; keeper
  route does not reference the laundry.
- STATUS: FIXED (wakeup 5, 2026-08-16). Ad-hoc verified.

### R-104 [INTERSECTION] av-tower-house × av-sign-dyer — 0.54m × 0.72m
- Evidence: sign_dyer local bbox is y 1.81..2.45 only (a hanging sign
  bracket on the dye-house wall — at r=24.4 ang=118, tower at r=26 ang=108.
  Overlap 0.54x0.72: the sign hangs within the tower's footprint. Plan
  comment: "dye-house front (-11.5,21.5)" — the sign hangs on the dye-house
  wall; dyehouse is a separate plan entity (mkv3-dyehouse70)? Check: dyehouse
  exists (village_dyehouse3.glb). The sign rides the dye house wall by
  design. Rider-like → exclusion.
- STATUS: RESOLVED-BY-CLASSIFICATION (sign rides dye-house wall).

### R-105 [INTERSECTION] av-bcistern × av-watchpost — FIXED (wakeup 5)
- Root cause: edge kiss at the court corner — cistern at (17.7,-16.5)
  overlapped the watchpost's platform corner by 0.07-0.26m (both furniture
  props near the court W edge).
- Fix: 0.5m nudge along the court wall to (18.2,-16.5). Verified vs fresh
  live transforms: cistern x watchpost 0.43m CLEAR; court annex contact
  unchanged (designed, per R-3xx classification).
- STATUS: FIXED (wakeup 5, 2026-08-16). Ad-hoc verified (numeric; both
  furniture-scale — walk-test not applicable per collision policy).

### R-106 [INTERSECTION] av-dyehouse × tower-house bay (+carousel) — FIXED (wakeup 6)
- Root cause (fresh full-audit finding, missed by wakeup-1's narrower
  footprint set): the tower-house's bay porches overflow its ring slot; the
  dyehouse at ang 118 r 27 overlapped it by 1.54m AND kissed the carousel
  (-0.21m). No ring bearing clears both — the exclusion zones of tower bay
  and carousel overlap at ang 116-119.
- Fix: relocated to the plan comment's own intent — "behind the weaver's
  row cottage": (-21.0, -21.6) yaw 0.941 (aligned to the row). Verified vs
  fresh live transforms: row 0.37m, laundry 5.02m, tower 40m, carousel
  39.7m, garden 29.4m, shrine 14m — all CLEAR. The sign-dyer (wall-mount
  rider, dyehouse-local (0.03, 2.59)) moved with it to (-18.89, -20.10);
  rider offset preserved exactly.
- Two-way MCPL walk-test (fresh body): row-side start 0.26m, dye vats
  0.36m, south exit 0.28m.
- Probe-blindness note: first move (ang 122 r 27.5) cleared tower/garden
  but DROVE INTO the carousel (-2.08m) — the carousel was missing from the
  earlier footprint sets. Corrected by the widened audit; no ledger entry
  for the intermediate.
- STATUS: FIXED (wakeup 6, 2026-08-16). Ad-hoc verified.

### R-107 [INTERSECTION] av-coop × av-garden-fence — 2.01m — OPEN
- Evidence (fresh full audit): coop (-30.6, 12.4) yaw 1.956 (2.12 x 2.27)
  overlaps the garden fence's footprint (-28.7, 11.6, 6.46 x 2.68) by
  2.01m. Both furniture-scale; coop plan comment "the fowl run" at r 33
  ang 158, fence at r 31 ang 158 — same bearing, 2m radial gap intended
  but their footprints cross.
- Planned fix: nudge coop outward along its ray (r 33 -> 34+) or rotate to
  align with the fence line; verify numeric clearance + walk-probe the
  coop approach.
- STATUS: OPEN (next wakeup's defect).

### R-2xx [COLLISION] door-lane audit — CLOSED CLEAN (wakeup 6)
- Fresh audit of all 12 enterable buildings' 1.4m x 2.2m door lanes vs
  every known-footprint prop: ZERO blockers. (The R-101 fix had already
  cleared the worst — the run on the garden cottage's lane.)
- STATUS: CLOSED (no defects).

### R-2xx [REFINEMENT] "messed-up houses cluster" — PARTIALLY RESOLVED
- Bill's report: "bunch of houses clustered together that are totally messed
  up, some objects are not fully together/look bad visually because they're
  not completed". The offline pass can decode geometry presence per building
  (buckets + named nodes) but "messed up visually" needs the live state
  (live lib hash vs local bytes → drift = the standing world is stale) and
  possibly eye-check. The housing ring entities: arthur-house, av-longhouse,
  ring scripts mkv3-ring.ts (garden/row/bunk/hall/court). All 9 buildings
  source-fresh (mtimes check clean), all parse, all have expected named
  anchors (fire/flame/lamp kept through merge).
- Live decode plan (next wakeup w/ network): /geom?world=&id= each building;
  content-hash drift check (re-upload local bytes → compare lib paths);
  walk-test the 5 enterable buildings' door lanes.
- RESOLVED across wakeups 2-6: content-hash audit 24/24 clean (the one
  drift — arthur-house — fixed as R-201); buildings parse with named
  anchors intact; door lanes walk-true. Bill's "messed-up houses" report
  is best explained by the R-201 stale build + the overlap cluster since
  fixed (R-101/102/103/106). Residual: eye-check with Bill.
- STATUS: RESOLVED (live phases done; awaiting Bill's eye pass)

### R-2xx [COLLISION] wrong-solid / wrong-pass audit — RESOLVED (wakeup 6)
- Door-lane audit: all 12 enterable buildings, zero blockers (wakeup 6).
- Furniture under-gate sanity: per collision policy table; support-abstain
  findings (av-run lie 0.11m, av-pondlife 0.17m) registered as cosmetic
  refinement candidates, not blockers.
- STATUS: RESOLVED

## Probe hygiene
- probe-overlap1.ts created, run once (exit 0, 32 footprints, 7 raw overlaps,
  4 real after designed-contact exclusions). DELETE after register write.
- All offline decode used local GLBs + plan; no network was touched.
