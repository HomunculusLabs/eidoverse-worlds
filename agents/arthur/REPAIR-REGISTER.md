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

### [FIXED] COURT ROOFS COVERS NEITHER SHED — both gables stacked at court center over the yard (lift-1, 2026-08-18; FIXED lift-2 rollout)

- Entity: av-court, live pose (21, 0, -15.3), live lib `store/ac75f33cab3fb5ce.glb` (tex-82 build, verify-repairs.ts:38).
- Evidence: (a) summoner's in-world report 2026-08-18 (resident.log, walked with Arthur to the bakery): "the roof is wonky. It doesn't cover both units here. also lots of objects are outside the bakery" — Bill's camera, not a probe; (b) source decode of the live-pinned build: roof slabs `ct3_6`/`ct3_9` span x [-3.05,+3.05], gable ends `ct3_8` x [-2.70,+2.70] — but the two sheds stand at x=±3.4 spanning [-6.1,-0.7] and [+0.7,+6.1]; both gable roofs sit mid-court over the open yard, covering neither unit; the yard furniture (cart, crates, workbench, display board) stands under open sky between/beside them.
- Root cause: `gableRoof(g,...)` builds in PARENT frame with no x argument; mkv3-ring.ts called it twice on the court group whose two sheds are offset ±3.4 — the roof geometry was authored for one building per group, the court broke that assumption silently.
- Fix staged (lift-1): `addRoofAt` helper — gableRoof into a scratch group, children reparented with the shed x baked in (pure parent-frame translation); bakery roof at x=-3.4, workshop at x=+3.4, same stone/ridge/rake/gable-end kit so the court reads as two sibling sheds of one build. Sibling GLBs byte-identical.
- STATUS: FIXED (lift-2) — rolled live: av-court on store/bb31e8a5ffdc1e16.glb at preserved pose (21,0,-15.3, yaw -0.941), smoke comp captured + re-applied; verify-lift1.ts 11/11 ALL PASS incl. live after-read; pins refreshed (tex-4/tex-82 in the gate + verify-tex82's 5 sites) with full trail ac75f33c → bb31e8a5; /tmp court backup refreshed.

### [OPEN] CAROUSEL ROOF TOO LOW — rider-head clearance ~0.08m at horse radius (audit-101, 2026-08-17; source fix staged polish-1)

- Entity: av-carousel, pose (-18.8, 0, 25.9). Live lib `store/cd22d0b09e70bebc.glb` (tex lane pin, verify-tex69.ts:106 — CORRECTED polish-37: this entry previously cited audit-101-era `937fd0b6a9c07b5b.glb`; then RE-CORRECTED polish-38: my polish-37 note claimed "roof geometry unchanged between builds" — WRONG. Chronology: live `cd22d0b0` was rolled at tex-69 (daytime Aug 17), BEFORE the polish loop existed (21:43) — it carries the OLD LOW ROOF. The staged `38fbbc26` (current mkcarousel.ts: textured families + roof lift + paint widening + stair fix) carries the fix. Implication: live roof is still low (defect live, register correct), the staged rollout IS the close path, and it regresses nothing — the staged build is already texture-family converted, same as live).
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

### [OPEN->STAGED-HEAL] CAROUSEL SMOKE COMP LOST AT TEX-69 RE-PLACE — live bag 6/7 (polish-45 find, 2026-08-18; heal staged same tick)

- Entity: av-carousel, pose (-18.8, 0, 25.9), live lib store/cd22d0b09e70bebc.glb.
- Defect: comp-wipe law casualty — the tex-69 carousel re-place restored motion:carousel + horse_0/2/4/6 + sockets but NOT particles:smoke. Live census this tick: 6 comps; polish-13's pre-replace capture at ~00:00 carried 7. Every chimney in the village smokes (9 entities); the carousel's boiler-puff is the only lost one.
- Decode before declaring: av-car-l1/l2 are separate LIGHT ENTITIES at the carousel pose (present, intact — not comps, not lost). Smoke absence confirmed against live /geom and the polish-13 record.
- Heal staged (polish-45, DATA CORRECTED polish-46): placecarousel.ts gained KNOWN_BAG {particles:smoke} — the capture-then-reapply loop now MERGES known-lost comps, never overwrites live data, no double-apply (verified: 6-comp capture -> 7 planned; 7-comp capture -> still 1 smoke). polish-46: the original data was never captured; the first stub {x:1} mirrored the mock — corrected to the LIVE village idiom (all 9 smoking entities + place-smoke.ts:28): {preset:"smoke", origin:[-18.8, 6.3, 25.9] (finial top, source-decoded), count:50, size:0.4, speed:0.35}; honest reconstruction, tune-down note recorded (charcoal precedent 6 @ 0.22). Rides the consent-gated carousel rollout; closes when the live bag reads 7 again.
- STATUS: OPEN — heal staged in the placer; live confirmation pending rollout consent.

### R-111 [INTERSECTION] av-rainbarrel-h sunk INTO arthur-house wall — stale era-2 plan slot vs live-true house pose (align-1, 2026-08-18)

- Entities: av-rainbarrel-h live (22.2, 0, 18.6) yaw -2.268, lib store/85edf547c4a2e96f.glb, comp {} (none to lose); arthur-house live (22, 0, 16) yaw -2.35.
- Source decode (mkv3-house: S=5.5 → wall lines at local ±2.75, T=0.2): barrel in house-local (1.71, -1.97) — INSIDE the wall square (clear requires |x| or |z| > 3.09 with barrel r=0.34). Corrected-axes rotated-SAT: 1.598m mesh-bbox overlap; barrel body visibly interpenetrates the E wall interior face.
- Root cause: coordinate epoch mismatch, NOT a bad nudge. The barrel stands on its era-2 plan slot (r29 ang40 = (22.2,18.6)); arthur-house moved after era-3 to live (22,16) (refine-210 re-verified the house at [22,0,16]; refine-220/285 same) while the plan file still says (21,15.3). At the PLAN house pose the barrel decodes house-local (1.50, -3.17) = 0.42m off the back wall — a legal under-eave barrel (mkv3-barrels header: "under the down-eave corner... placed at corners clear of door lanes"). House is live-true; the barrel is stale-plan.
- Defect class: visible interpenetration (furniture-scale barrel embedded in a building wall).
- Walk-test n/a (furniture-scale, per collision policy); sweep-suspect decoded at source per law — the house×barrel hit SURVIVED decode (unlike the 138 raw suspects that dissolved into ground-layers/riders/ABJECT/yard-dressing classifications).
- Fix: re-place av-rainbarrel-h at the DESIGN-RELATIVE pose against the live house: house-local (1.505, -3.173) → world (23.2, 0, 19.3), yaw -2.268 unchanged, same lib. Clearances: 0.42m off back wall face→0.08m gap past wall line + barrel radius... (target: ≥0.08m wall face gap per under-eave design; ≥0.3m to every other footprint entity).
- STATUS: FIXED (align-1, 2026-08-18). Live /geom after: pos (23.2,0,19.3), house-local (1.50,-3.17) — outside wall square (was (1.71,-1.97) INSIDE), wall face gap 0.08m flush under-eave, nearest other footprint 3.5m+ (chopblock 10.0m), lib/comp unchanged (bag was empty — nothing to re-apply). Residual mesh-bbox contact vs house = roof-eave overhang = the designed under-eave read, classified deliberate abutment. verify-repairs.ts ALL PASS after fix.

### R-112 [INTERSECTION] av-sign-livery board passes through av-stable's back wall — plate mounted inside the stall interior (align-2, 2026-08-18)

- Entities: av-sign-livery live (38.3, 0, 1.4) yaw -2.350 (ON its plan slot r38.3 ang2; static, no comps per mkv3-signs11); av-stable live (40,0) yaw -1.571, back wall slab stable-local z 1.9..2.1 (outer face world x=37.90), W=5.4/D=4.2; av-inn live (34,0), wall face at sign height world x=37.0 (D/2+T; bbox -4.0 is beyond-wall geometry).
- Source decode: sign plate (group origin) at stable-local (1.40, +1.70) — 0.20m INSIDE the back wall's inner face (interior of stall), y 2.15..2.45 < wall top 2.7 → mounted inside the building, concealed from the seam. Board center decodes stable-local (1.72, +2.02) — INSIDE the wall slab (1.9..2.1): the board crosses the wall plane at 45° (center 0.08m in, far corner 0.09m out). Corrected-axes rotated-SAT: 0.49m vs inn (2D, y-blind).
- Family-language decode (why yaw stays): all five trade signs are angled flag mounts aimed at approach lanes, none wall-perpendicular — bakery sign floats 0.7m proud of the workshop face and has stood classified through 100+ audits; sign-dyer×tower R-104 = rider-by-classification. The DEFECT is the embed (plate inside the stable + board crossing the slab), not the 45°.
- Defect class: visible interpenetration (board through wall; plate floating inside the stall).
- Fix: slide the sign 0.725m along its own arm axis (+local-X̂ → world (-0.703,+0.711)) → new pos (37.79, 0, 1.91), yaw -2.350 unchanged, same lib. After (corner math): plate spans world x 37.70..37.88 — near corner 0.02m off the stable wall face 37.90 (corner-mount kiss on the livery's own building), fully out of the interior; board far corner (37.30, 2.41) — 0.30m clear of the inn wall face 37.0 and 0.60m clear of the stable face; seam span at sign height 0.90m, sign occupies it as a wall-mounted angled flag per family language.
- STATUS: FIXED (align-2, 2026-08-18). Live /geom after: sign at (37.79, 0, 1.91) yaw -2.350, same lib afb2309a, comp bag preserved (empty — nothing to re-apply). Plate origin stable-local (1.91, 2.21), board center (2.23, 2.53) — both fully OUTSIDE the wall slab (was (1.40,+1.70) plate-inside-interior / (1.72,+2.02) board-inside-slab). Board far corner world (37.30, 2.41): 0.30m clear of inn face x=37.0, plate 0.02m off the stable face 37.90 (corner-mount kiss on the livery's own building). Full re-sweep after fix: 0 unclassified hits. Two-way MCPL seam walk-test: N→S 0.39m, S→N 0.34m, control 0.27m — seam walkable, sign hangs clear at head height. verify-repairs.ts ALL PASS after fix (at lift-4 f5a87a7).

### [OPEN->ROUTED: align] R-113 (registered R-112 at lift-3; renumbered lift-4 — the concurrent in-flight align-2 entry took R-112 for its livery-sign find) WATCHPOST BLOCKS THE BAKERY DOOR — summoner-falsified classification (lift-3, 2026-08-18)

- Entity: av-watchpost (era-2 heritage, 1.1m-square scaffold legs, deck at y2.6) at the court's W edge, directly off the bakery's open face (R-105 cistern-clearance geometry places it ≈ court-local W edge; live pose read consent-blocked this tick — align lane to ground exact numbers from /geom).
- Evidence: (a) the summoner's in-world report 2026-08-18 (resident.log, walked to the bakery with Arthur): "the tower in front of the door doesn't allow me to go inside" — his avatar could not enter; (b) align-1 (007f8d1) walk-tested the same pinch at 0.38m/0.35m and classified it THREADABLE + "watchpost→court already ABJECT per policy, deferred".
- Verdict: the summoner's body outranks the probe walk-test — the deliberate-abutment classification is falsified for THIS seam (a decorative abutment that blocks the only entrance to a building is a defect, not a policy). Root cause is placement (era-2 pose vs the court's live pose), the fix is a re-place — the align lane's exact tool, one wakeup's work.
- Routed: lift lane defers to align; reclassify ABJECT→defect and nudge the watchpost off the door lane (target ≥1.4m clear per the lane law).
- Fix plan (align-3): slide scaffold Δcourt-local (−2.2,+0.35) → court-local (−5.62,+4.54) = world (14.02,−18.17), yaw −0.785 unchanged (sentry facing reads the lane + court). Posts then span court-local x −6.24..−5.00 — the bakery lane band (x −4.5..−2.3) is COMPLETELY EMPTY (was straddled −4.04..−2.80); nearest post face 0.50m W of the band edge; workshop lane untouched; display board/workbench/yard-lamp all clear (0.3m+); bcistern 6.6m. Comps: particles:embers + motion:fire_coals captured before, re-applied after with origin translated by the scaffold's world delta (−1.58,−2.57) → [13.56,3,−18.14] (relative arrangement preserved exactly, refine-239 verbatim law). Light av-watchpost-l (separate entity, deck-center at y3.2) re-spawned at (13.98,3.2,−18.13); its color/intensity/range are NOT in /geom and the refine-57 placer is gone — RECONSTRUCTED with the standing outdoor-lantern idiom (0xffb066 warm, intensity 1.6, range 5.5; goatlamp/gate-lantern precedents), recorded as honest reconstruction (polish-46 law). Keeper circuit waypoint (14.9,−14.9) now stops 3.4m NE of the scaffold — stop-and-look still reads; spur path (refine-103) lands ~3m NE — cosmetic residual noted for a future lane (door-paths is not this lane's artifact).
- STATUS: FIXED (align-3, 2026-08-18). Live /geom after: scaffold (14.02,0,−18.17) yaw −0.7854 same lib, court-local (−6.43,+3.95), posts x −7.05..−5.81 — bakery lane band (−4.5..−2.3) COMPLETELY EMPTY, 1.31m clear ground before its W edge. Comps re-applied: embers origin [13.56,3,−18.14] (Δ vs scaffold (−0.46,+0.03) preserved EXACTLY), fire_coals verbatim; light av-watchpost-l at (13.98,3.2,−18.13) (Δ (−0.04,+0.04) preserved; params reconstructed 0xffb066/1.6/5.5 — honest reconstruction recorded above). TWO-WAY MCPL WALK-TEST of THE SUMMONER'S OWN BLOCKED MOVE: outside→bakery-inside 0.39m, inside→outside 0.34m, repeat entry 0.39m, control 0.27m — bakery door OPEN, enterable both ways, repeatedly. Full sweep: 1 residual hit court×watchpost 0.065m = compound-bbox corner artifact (empty bbox corner vs scaffold; nearest REAL post clears bakery W wall 0.80m in z, workbench 1.92m+ away) — probe-vs-source, source wins, no defect. Residuals recorded: keeper waypoint (14.9,−14.9) 3.4m NE stop-and-look reads fine; watchpost spur (refine-103, av-door-paths artifact) now lands ~3m NE of the moved scaffold — cosmetic drift, noted for whichever lane owns door-paths; mapboard chip position (refine-82) unchanged — acceptable at board scale. verify-repairs.ts ALL PASS after fix (at lift-9 2b5e4c9).

### R-114 [CLASSIFIED-NON-DEFECT ×3] align-8 sweep: three pairs first-flagged, all dissolved at source — now registered expected so no lane re-flags them (align-8, 2026-08-18)

- Context: first sweep after lift-10 (live dp_watch re-aim) + H-1 artwalk landings. 71 village footprint entities (masons excluded per audit-era class), 136 candidate pairs. Two probe-side bugs found and fixed in the same wakeup: unsorted DESIGNED/ABUT pair keys (alphabetical join never matched hand-written pairs — court×bcistern, windmill×millyard re-flagged as false UNCLASSIFIED) and lossy id strings (av-barrel-* vs av-rainbarrel-*, av-gardenfence vs av-garden-fence). Root cause of both: the sweep table was rebuilt from compacted context, not from source — fixed durably by promoting the sweep to a standing tool (agents/arthur/sweep-align.ts, table lives in a file now).
- (1) av-monument × av-welcome 0.933m, y-overlap 1.56m — artifact. Monument pos (-6.40,0,-6.40) yaw 0.785 ON plan r9/225°; welcome (-3.00,0,-4.30) yaw 0.609 ON plan r5.2/235°. Source (mkv3-monument/mkv3-welcome59): welcome decodes monument-local (0.92,+3.89) — its widest ground element (0.30 foot stone) clears the approach-paver strip (east edge local x=+0.40) by ~0.37m; the monument's only wide element (the knot, swing radius ~1.35m incl. bbox) sits at y=2.05 above the 1.56m welcome top. The 0.933m = knot swing radius + paver tail inflating the compound bbox. The welcome's SW pointer arm aims AT the monument (mkv3-welcome59 arms table) — adjacency is the design.
- (2) av-woodyard × av-charcoal 0.737m, y-overlap 1.51m — artifact (y-separated elements). Woodyard (15.00,0,29.40) yaw -2.670; charcoal (19.10,0,29.40) yaw -2.565; both ON plan (r33/63°, r35/57°). Source: charcoal dome decodes woodyard-local x∈[-4.92,-2.38] — clears the shed back-wall boards (x≥-1.6) by 0.78m; the cooled pile (charcoal-local +1.9,+0.8 → woodyard-local ≈ (-2.3,+2.1), y∈[0,0.385]) passes under the slanted roof overhang 1.9m above it. Clamp "near the wood yard" is the plan's own comment (fuel-wood country). Ground heap beside the eave line — no shared volume.
- (3) av-millyard × av-millbench 0.135m — designed. Bench r34/180° deliberately inside the mill yard r37/180° (same maker family mkv3-farbench34; stablebench rides the stable the same way). Yard seating idiom.
- STATUS: CLOSED (align-8, 2026-08-18). No defect — all three classified expected-by-design with source decode; baked into sweep-align.ts's standing table. Post-close sweep: 0 unclassified hits on 136 pairs. verify-repairs.ts ALL PASS.

### R-115 [INTERSECTION/BLOCKED-MOVEMENT] av-forge sunk INTO av-court interior floor — summoner-falsified (align-9, 2026-08-18)
- Summoner evidence: Bill in-world "nope forge is still sticking out at my
  current location" AFTER the tex-86 material fix — the summoner's body
  outranks the sweep's designed-abutment classification (R-113 precedent).
- Live evidence: forge pos (20.9, 0, -16.3) yaw -0.908 vs court
  (21, 0, -15.3) yaw -0.941. Forge center is 1.00m from court center; in
  COURT local frame forge center = (-0.87, -0.51) vs court span lx ±6.5,
  lz -2.94..3 → fully contained in the court interior, 7.4m in lx from the
  NE corner (6.5, 3). Rotated-SAT: 1.387m overlap on the forge's FULL 1.387m
  depth axis = fully inside.
- Root cause: plan polar slot forge (r=26.5, ang=322) is only ~0.9m of arc
  from the court's slot (r=26, ang=324); the court's 13m bbox dwarfs that
  separation, so the "NE corner annex" slot lands at court center.
- Classification bug: old R-3xx "designed annex" read the plan comment but
  never computed court-local coords — annex INTENT real, POSE never achieved
  it. av-court|av-forge stays in the sweep table; now it will actually be an
  abutment.
- Fix: re-place flush against court E face at the NE corner — court-local
  origin (7.373, 1.677) (forge W face lx=-0.873 flush on court E face
  lx=6.5; lz span 0.9..2.29), yaw = court yaw (-0.9411511441487406).
  Companion light av-forge-l (old forge center +1m y) moves with it.
  Comps captured BEFORE (particles:embers scale 0.6;
  motion:fire_fg_coals bob y amp 0.014 period 1.8), re-applied AFTER.
- STATUS: FIXED (align-9, 2026-08-18). Live /geom after: forge
  (23.986, 0, -8.353) yaw -0.9412 (= court yaw), court-local origin
  (7.373, 1.677) — W face flush on court E face lx=6.5, lz span 0.9..2.29
  at the NE corner. forge×court SAT 1.387m -> 0.0000m (true abutment); vs
  every other entity 0.000m (only ground decal av-door-paths 1.387m =
  classified ground layer). Comps re-applied verbatim (particles:embers
  scale 0.6; motion:fire_fg_coals bob y amp 0.014 period 1.8 — live comp
  bag keys match pre-place capture). Light av-forge-l re-spawned at
  (23.986, 1, -8.353), Δ(0,1,0) vs forge preserved EXACTLY; color/intensity
  honestly reconstructed (0xffa050/1.6/5, mason fire idiom — align-3
  precedent, params not exposed by /geom). Resident "GO forge" waypoint
  re-aimed in resident.ts source (20.9,-15.5 -> 23.99,-8.35; picks up on
  daemon's natural restart — resident lane owns that restart). Sweep after:
  73 entities, 135 pairs, 0 unclassified ALL CLEAR; verify-repairs.ts ALL
  PASS exit 0.
- [ ] R-116 MASON FIELD UNTExTURED (Bill-confirmed 2026-08-18: "all of these models are messed up" at (-35.8,39.5)) — 78 av-mason-* works (60 slots + 18 lights) from the era-2 mason daemon stood vertex-color-only outside every lane's instrument scope; also collides with windmill approach lanes. FIX: familymap.ts + masonretex.ts rebuilt all 60 with the seven standing families (byte-family law verbatim params), masonrollout.ts re-placed 60/60 same-id with comp capture/reapply. OPEN: lane-collision survey of the 60 sites vs windmill/spoke lanes (next tick).
- [ ] R-117 MASON ORIGIN-SITTERS (mason-0 survey, 2026-08-18): sweep-mason-r116.ts found 5 of 60 works at pos (0,0,0) yaw 0 ON the plaza hearth — av-mason-0009/0017/0030/0043/0056, all wayside theme. Root cause at source: masonrollout.ts:48 `pos: b?.pos ?? [0,0,0]` — the lift-99 before-capture missed 5 slots and the placer silently defaulted them to origin; its live-pin check verified lib hashes only, never pos. siteFor(idx) cannot return origin (all branches ring-bound), so these are lift-99 regressions. FIX: re-seat same-id at lawful siteFor sites (35.6,42.9 / -10.2,58.3 / 2.8,63.2 / 17.1,64.3 / 31.8,61.7) with lawful yaw (idx*2.1)%(2π), comps captured before/reapplied after (comp-wipe law), verify pos+bbox after.
