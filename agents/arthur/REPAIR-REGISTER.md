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

### R-101 [INTERSECTION] av-run × av-garden-cottage — LIVE: 3.6m × 3.34m
- Evidence: composed footprints. run3 bbox local
  [-1.6..1.6]x[0.34..2.65]; garden3 extends to local x -4.85 (garden beds W
  side). At plan (r=24, ang=150) vs (r= 26, ang=144) the run's local +Z
  (world +X at yaw≈324°… verify) penetrates the cottage garden beds.
- Class: INTERSECTION (accidental — run placed "beside the garden fence",
  but its foot overlaps the beds ~2.4m x ~2.0m in the worst axis pair).
- Planned fix: move av-run along the fence line (away from beds, keep rider
  adjacency to hutch), verify ≥0.3m clearance numerically post-place.
- STATUS: OPEN
- Live-verify: /geom id=av-run + av-garden-cottage; walk-probe not needed
  (furniture-scale).

### R-102 [INTERSECTION] av-hutch × av-garden-cottage — 2.31m × 2.16m
- Evidence: same audit. hutch3 local bbox [-0.62..1.22]x[-0.38..1.2] roughly,
  at r=24 ang=150; garden beds extend to local -4.85 (W side, toward hutch).
- Class: accidental overlap of hutch into the cottage garden beds — hutch
  plan comment says "beside the garden fence" (deliberate adjacency), but the
  numeric overlap (2.3 x 2.2) reads as buried-in rather than beside.
- Planned fix: shift hutch + run together (keep hutch→run rider spacing)
  along fence, clear of beds; verify clearance.
- STATUS: OPEN

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

### R-103 [INTERSECTION] av-dyelaundry × av-row-cottage — 2.38m × 0.64m
### R-104 [INTERSECTION] av-tower-house × av-sign-dyer — 0.54m × 0.72m
- Evidence: sign_dyer local bbox is y 1.81..2.45 only (a hanging sign
  bracket on the dye-house wall — at r=24.4 ang=118, tower at r=26 ang=108.
  Overlap 0.54x0.72: the sign hangs within the tower's footprint. Plan
  comment: "dye-house front (-11.5,21.5)" — the sign hangs on the dye-house
  wall; dyehouse is a separate plan entity (mkv3-dyehouse70)? Check: dyehouse
  exists (village_dyehouse3.glb). The sign rides the dye house wall by
  design. Rider-like → exclusion.
- STATUS: RESOLVED-BY-CLASSIFICATION (sign rides dye-house wall).

### R-105 [INTERSECTION] av-bcistern × av-watchpost — 0.26m × 1.41m
- Evidence: watchpost at r=22 ang=315 (1.7x1.8m footprint, h=3.9); cistern
  at r=24.2 ang=3 annex at court E. Overlap 0.26 x 1.41 — marginal edge
  kiss between two furniture props near the court. 0.26m penetration.
- Planned fix: 0.26m nudge of cistern along court wall, verify clear.
- STATUS: OPEN

### R-2xx [REFINEMENT] "messed-up houses cluster" — LIVE DECODE REQUIRED
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
- STATUS: OPEN (live phase pending)

### R-2xx [COLLISION] wrong-solid / wrong-pass audit — LIVE DECODE REQUIRED
- Policy table above sets the per-class intent. Live checks needed:
  door-lane blocking verts (1.4m clear) for the 9 buildings; furniture
  under-gate sanity; sparse-support sanity (DECK_FILL 0.45 class).
- STATUS: OPEN (live phase pending)

## Probe hygiene
- probe-overlap1.ts created, run once (exit 0, 32 footprints, 7 raw overlaps,
  4 real after designed-contact exclusions). DELETE after register write.
- All offline decode used local GLBs + plan; no network was touched.
