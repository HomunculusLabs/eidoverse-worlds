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

### R-107 [INTERSECTION] av-coop × av-garden-fence — FIXED (wakeup 7)
- Root cause: coop at (-30.6, 12.4) stood inside the garden fence's
  footprint (2.01m) — same bearing (ang 158), 2m radial gap intended but
  their footprints crossed.
- Fix: coop now forms the fowl run's west wall: (-33.1, 12.4) yaw 1.956
  (aligned to the fence) — clears the fence by 0.49m; hutch 3.3m, run
  4.8m, cottage 5.4m all clear. Hens are ambient (peck comps) and
  re-path around the new wall naturally.
- Keeper's coop stop (-28.9, 11.4) unchanged and walk-tested (fresh
  body): track 0.25m, coop stop 0.33m, NW exit 0.26m.
- STATUS: FIXED (wakeup 7, 2026-08-17). Ad-hoc verified.

### R-108 [INTERSECTION] av-garden-cottage × av-carousel — RESOLVED-BY-PROBE-CORRECTION (wakeup 8)
- The wakeup-7 "final audit" reported -0.78m using an axis-aligned rect
  approximation with a WRONG carousel yaw (assumed 0; live is 2.5137).
  Proper SAT on true rotated footprints (carousel hw 4.35 x hd 4.1,
  cottage hw 4.33 x hd 3.4): SEPARATED — corner distance minimum
  carousel-S (-19.9, 20.0) vs cottage-N (-21.2, 20.8): ~1.6m clear.
- Per the loop law (probes have been wrong, the village hasn't): corrected
  probe, NO ledger entry, no world change.
- LESSON (applies to all future sweeps): the village's placed props carry
  arbitrary yaws; every intersection sweep must compose live yaw —
  axis-aligned approximations on rotated pairs produce both false
  positives AND false negatives.
- STATUS: RESOLVED (probe blindness; no defect)

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

### R-2xx [REFINEMENT] support-abstain residuals (run/pondlife/fence) — FIXED/CLOSED (refinement wakeup 1-4, 2026-08-17)
- Priority-1 mesh pass on the registered cosmetic residuals. Live lie decode
  first: av-run 0.106, av-garden-fence 0.105, av-pondlife 0.168.
- DECODE AT SOURCE found the real defect under av-run's abstain: the run's
  withes had run ACROSS the yard since loop 85 — atan2(dx,dz) is the
  +Z-forward convention but the cylinders are rotZ(90)-oriented X-forward;
  side rails crossed the pen interior, far rail 0.9m past the back line.
  The 0.106 abstain was the visible tip of a real orientation bug.
- Fix (av-run): yaw law atan2(-dz,dx) — rails now run along the yard lines
  (vertex census: E 102, W 102, N 136 on x=±0.9/z=1.75); stakes cut 0.42
  to 0.34 (tips flush with the top rail) and rhythm tightened 0.45 to 0.24
  (wattle density is FUNCTIONAL: the vertex-grid lie probe sees cylinder
  rims only, so dense stakes fill the classifier cells); sub-visual clover
  clumps removed (they dragged the median to ground). Post-place live lie
  0.106 -> 0.000 (server /geom verified). Placement: hutch stand-off — run
  origin z 17.8 -> 18.6 so the hopper rabbit (hutch-local z 0.39..0.61,
  world z 18.19..18.41) sits mid-hop in the 0.8m gap, E-hurdle
  clears it by 0.54m in z; hutch bbox to yard gap 0.06m reads attached.
  Fence clearance 1.27m (live-yaw SAT). Comps: verified empty pre-place —
  nothing to re-apply.
- Fix (av-garden-fence): gate posts 1.0 -> 0.92 — tops level with the
  picket line. Post-place live lie 0.105 -> 0.025.
- CLOSED-BY-CLASSIFICATION (av-pondlife): the 0.168 lie is the ducks
  standing proud of the waterline — the classifier working as designed
  (pond water is not support). No mesh change.
- Intermediate (no ledger entry, loop law): first re-place at z 17.8 put
  the E hurdle line through the rabbit's x-band (z-projection only —
  rabbit clear by 0.54m in z); corrected to z 18.6 same wakeup.
- STATUS: FIXED (refinement wakeups 1-4). Ad-hoc verified (live lie
  decode + vertex census + verify-repairs ALL PASS).

### R-109 [VERIFICATION] stale tex-1 pin in verify-repairs.ts — FIXED (tex-2, audit-22)
- Evidence: verify-repairs.ts FAILs "[tex-1] av-stable stands on the thatch
  build (56d0122215bcca65)" — stable live lib is store/aaf04bc81719be50.glb,
  which IS the sha256[:16] of current local village_stable3.glb (world ==
  source; the WORLD is correct). The pin is stale.
- Decode: a texture-lane tex-2 run (TIMBER via housekit wallSpan) rebuilt
  stable3 + house3 + run3 (~00:21-00:25) and re-placed the stable, but the
  run ended before committing (no tex-2 commit; tree clean; TEXTURE-PLAN
  untouched since 00:15 with tex-2 still `[ ]`). Per the audit-20 escalation
  rule (lane quiet + pin still failing), this registers.
- Fix for the refinement/texture lane: EITHER resume tex-2 (commit the built
  state + update TEXTURE-PLAN + refresh the pin to the live hash aaf04bc8),
  OR pin-refresh alone if tex-2 is abandoned. Do not hand-edit the ledger.
- STATUS: FIXED (tex-2 commits 34caeeb/854ae04/43abf78 pinned the timber libs; verify-repairs.ts ALL PASS; world==source 24/24 confirmed by audit-22)

### R-110 [COLLISION/COMP] av-inn motion:sign comp lost across texture re-places — FIXED (refine-224, tex-4 wakeup 21)
- Evidence: live av-inn comps are [particles:smoke, particles] — motion:sign
  GONE. It was present at audit-16's census (37 comp entities, av-inn had
  4 comps incl. motion:sign + sockets). tex-2 (10 re-places incl. inn) and
  tex-3 (8 re-places incl. inn) both re-placed av-inn; the comp was wiped
  and never re-applied.
- Root decode: `grep -r "motion:sign" agents/arthur/assets/place-*.ts`
  returns NOTHING — no standing placer file re-applies the inn sign comp.
  This is the loop #98 precedent exactly: smoke/embers re-applied, the
  sign comp's placer never existed in the chain. (Texture lane's R-110 fix
  place-inn-sign.ts reconstructed the comp from ledger refine-12 the same
  minute; superseded by the all-comps placer below.)
- Fix (refinement wakeup 17 + tex-4 wakeup 21, convergent): ALL av-inn
  comps re-applied via the standing placer
  agents/arthur/assets/place-inn-comps.ts (sign pendulum verbatim
  refine-193 data + embers + smoke + bench sockets; ember/smoke origins
  recomputed from live pose via local-frame transform). Live verify:
  comp keys [particles:smoke, particles, motion:sign, sockets].
  The placer is standing: any future av-inn re-place re-runs this file.
- STATUS: FIXED (2026-08-17). Ad-hoc verified (verify-r110.ts PASS).

### [OPEN] HORSE PAINT VARIATION UNREADABLE AT SPECTATOR DISTANCE (polish-3, 2026-08-17)

- Evidence: live vision reads at ~18m AND ~10m both report the 4 carousel
  horses "uniform gray/dark brown", blankets invisible, horses "small and
  indistinct" (frames /tmp/polish3-spectate.png, /tmp/polish3-close.png).
- Source decode (RGB avg of paint tiles): gold (180,121,63) lum 0.51,
  bone (188,176,153) lum 0.70, blue (71,86,92) lum 0.33 — distinct at
  source, converging under distance+fog in live view. Rework-plan Phase-2
  gate: "variation must be readable without becoming a rainbow" — FAILS
  readability at gameplay distance.
- Caveat: second frame had camera heading off-subject (walk positions the
  body, not the view direction — gate lesson recorded in polish plan);
  magnitude of the defect is fog-dependent. Silhouette itself PASSES
  (horses read as carved figures, legs readable, none malformed).
- Fix direction (polish-3, source-side): widen pairwise paint luminance —
  gold lifted ~0.51→~0.58 warm amber, bone ~0.70→~0.74 cream, blue
  deepened to saturated slate ~0.34; blankets untouched (close-range
  detail). Ships with the staged audit-101 roof-lift rollout (one rollout,
  both fixes); live distance re-read closes this item after rollout.
- STATUS: OPEN — source fix staged, live confirmation pending network
  consent.

### [OPEN] CAROUSEL ROOF TOO LOW — rider-head clearance ~0.08m at horse radius (audit-101, 2026-08-17; source fix staged polish-1)

- Entity: av-carousel, pose (-18.8, 0, 25.9), live lib store/937fd0b6a9c07b5b.glb (== local source, byte-identical).
- Source decode (parent-chain world Y): deck top ≈1.1; horse head top 3.49; saddle 3.02 (rider seat); canopy edge 4.38; peak 5.54.
- Numbers: cone underside at horse radius r=2.0 ≈ 4.68m (slope 0.43/m from edge 4.38 @ r≈2.7 to peak 5.54). Seated rider head ≈ 4.6m → clearance ≈ 0.08m. Canopy clears horse ears by ~0.9m at peak, reads compressed over the horse layer at gameplay distance.
- Evidence: (a) summoner's explicit ask ~11:04 "roof too short — lift it higher" has NO candidate in CAROUSEL-REWORK-PLAN.md (candidates 1-6: structure, horses, export-scale, heading, sockets, pennants — none lifts the roof); (b) live frame vision review independently reads "low and flat, compressed appearance"; (c) decoded source numbers above.
- Fix direction (for refinement lane): raise canopy_hub/fabric/edge and lengthen ribs/drop-pole tops; target rider-head clearance ≥ 0.4m at r=2.0 and canopy ≥ 1.5m above horse ears; re-apply full comp bag + sockets after re-place; pins refresh.

### [OPEN->STAGED] WELCOME BOARD UNREADABLE AT NIGHT, 5m — name bar/arms invisible in the charitable case (polish-28, 2026-08-18; source fix staged polish-29)

- Entity: av-welcome, plaza S rim (0, -5), facing N. Live lib at tex-15 build.
- Defect class: polish-16 (source-distinct, night-unreadable). Offline rasterizer gate (charitable case — no fog, ideal angle): 5m NIGHT = FAIL ("plain board": name bar barely discernible, 5 timber pointer arms unreadable); 5m DAY = PASS (bar + arms read). Defect is night-specific: no emissive, no lamp; the S-rim board sits dark under the lightrig 8-slot budget.
- Live corroboration: polish-25/30 — Bill's camera read the board as a "plain solid white rectangle" at ~5m night; pixel-located at x998-1191 y572-609 (before-anchor banked for the post-rollout after-comparison).
- Fix staged (polish-29): NIGHT LAMP — timber arm + warm emissive globe (0xffb066 / emissive 0xff9a4a x1.5, node wb_lamp per the KEEP lamp law, the carousel-lantern and map-hearth tone). Staged build 62746d1af698eacc (5 nodes; x2 byte-deterministic; decode: glow2 emissiveFactor [1.5, .48, .10]).
- Post-fix gate (rasterizer, 5m night): PASS on the claim — lantern clearly visible, "reads as a signposted place at night"; arms dark by design (landing point, not full illumination); pixel corroboration 116 warm px.
- Rollout: staged-rollout law (live av-welcome untouched until consent or the tex lane's next live-evolution pass; placer placewelcome.ts staged polish-33, offline 7/7). Close this item on the live after-read (same crop coords, lamp visible).
- STATUS: OPEN — source fix staged + offline-gated; live confirmation pending rollout consent.
