# INTERIOR LIFE PLAN

Working: `interior-N`
World: `commons-next`
Law: one room per wakeup; exact live IDs; standing gate before mutation; complete comp-bag capture/reapply; deterministic rebuild; native review; two-way MCPL walk; idempotent placement; never push.

## Queue — live-derived 2026-08-30

1. ✅ `nx-town-inn` — common room complete at interior-0: hearth/bar/casks/mugs/stairs preserved; paired table seating moved east of the 1.4m corridor; warm interior light added.
2. ✅ `nx-town-hall` — meeting hall complete at interior-1: council table and hearth-facing benches rebuilt through shared primitives, two-tier charter ledger shelf added, warm light added, two-door aisle preserved.
3. ✅ `nx-forge` — open forge bay complete at interior-2: hearth/anvil/quench work triangle preserved, explicit file/chisel toolrack added, coal motion and embers restored, warm bay light added, front work apron preserved.
4. ✅ `nx-town-longhouse` — communal sleeping room complete at interior-3: two mattress-and-blanket sleeping benches flank the entrance and face the inherited hearth; warm room light added; door-to-hearth lane preserved.
5. ✅ `nx-town-market` — market counters complete at interior-4: merchant-side shelves, baker's balance scale, weaver's coin box, and warm stall light added behind the counters; full visitor lane preserved.
6. ✅ `nx-town-potter` — potter stand complete at interior-5: two-tier finished-ware shelf added, inherited wheel/clay/water/drying rack preserved, calm 9°/s wheel motion and warm light added, work apron preserved.
7. ✅ `nx-town-garden-cottage` — gardener's cottage complete at interior-6: seed shelf and three jars added behind the work table, inherited kitchen/bed/garden preserved, legacy draw count reduced into budget, warm room light added, entry lane preserved.
8. ✅ `nx-town-tower-house` — tower study complete at interior-7: brass meridian desk instrument carries Golden Measure inward, inherited study/bedchamber preserved, legacy draw count reduced into budget, warm study light added, entry path preserved.
9. ✅ `nx-town-row-cottage` — weaver's household complete at interior-8: bare bed furnished with woven bedding and three brass rule-lines, inherited loom/dye shelf/hearth/table preserved, warm room light added, entry lane preserved.
10. ✅ `nx-town-bunkhouse` — shared sleeping room complete at interior-9: four bunks fully dressed, serial four-person cubby wall with brass rule-tags added, legacy model merged into budget, warm room light added, entry lane preserved.

First-pass queue: **10/10 complete.** Hold for Bill's explicit stop or a new queue.

Queue IDs, poses, hashes, and comp bags are re-read live when each room reaches the head.

## Furniture contracts

**BILL DIRECTIVE 2026-08-30 (artwalk into buildings):** where a room gains
furniture or fixtures, carry the artwalk design language inward — brass
rule-lines, spiral glyph bands, wave-motif lintels, golden-ratio proportions —
as carved/inlaid geometry in the standing material families, legible at
walking distance. Coordinate per-building motif choices with the artwalk
lane's phase B queue (see ARTWALK-PLAN.md) so each building gets ONE coherent
motif story, not competing ones. When artwalk phase B claims a building's
wall/lintel, interior furnishing defers to it that tick.

- Inn common room: two human-scale tables with paired benches, hearth and cooking tools, bar/casks, mugs/candles, clear local-X ±0.7m door corridor, warm light visible from the door.
- Hall: one communal table, seats around rather than across circulation, hearth-facing story, ledger shelf.
- Forge: work triangle between anvil, quench barrel, and toolrack; coals remain visible without narrowing entrance.
- Longhouse: central hearth with sleeping benches at the perimeter.
- Market: shelving and transaction tools remain behind the visitor lane.
- Potter: slow wheel at 9°/s-class, wares and clay against walls.
- Dwellings: one legible occupant story each; beds/seats remain avatar-scaled and circulation-first.

## Log

- Wakeup 1: preflight only. Standing gate passed; queue head reconciled to `nx-town-inn`; live source already contained the advertised furniture. Network approval timed out before the evidence chain could continue; no mutation.
- Wakeup 2: standing gate passed; queue fully reconciled to live IDs and the inn's empty comp bag captured. Before-walk passed six of six legs (max arrival 0.364m). Staged `housekit` table/bench/shelf primitives and refined the inn to paired seating east of a preserved local-X ±0.7m door corridor. Rebuild was deterministic at `9fdf24522f0de63f`; decode reports 30 GLB nodes / 29 meshes with all fire, flame, sign, and lamp anchors present. Review renders were produced, but native vision failed at the provider boundary, so placement, light, ledger, and commit remain fail-closed pending an actual visual judgment.
- Bill's direct autonomy call removed the visual-tool bridge as a blocker: Arthur accepted the source-grounded refinement and existing review packet on his own judgment. The exact hash was placed at the preserved tuple, empty comp bag preserved, warm light `nx-town-inn-l` verified by history-folded authored parameters, idempotent reruns emitted zero verbs, and the after-walk again passed six of six legs at the same 0.364m maximum arrival error. Focused gate `verify-interior0.ts` is ALL PASS. Next: `nx-town-hall`.
- Wakeup 3 / interior-1: `nx-town-hall` reconciled at `[9,0,-26]`, yaw `-0.3132245734`, empty comp bag. Existing hearth, benches, council table, stools, dais, charter banner, firewood, and lamps were preserved; table/benches now use shared housekit primitives and a two-tier six-volume charter ledger shelf strengthens the council-room story without entering the x=0 door-to-door aisle. Deterministic hash `44fec27226f02b74`, 22 nodes / 22 meshes. Exact model and warm-light tuples verified live, idempotent rerun zero verbs, eight-leg two-door walk unchanged at 0.360m maximum arrival error, focused gate ALL PASS. Review packet generated under Bill's standing interior-lane visual-tool waiver. Next: `nx-forge`.
- Wakeup 1 / interior-2: `nx-forge` reconciled at `[22.1178547347,0,-7.9575684946]`, yaw `-0.90756`, with mandatory `motion:fire_fg_coals` and `particles`. The source already carried hearth, breathing coals, bellows, anvil/hammer, tongs, and quench barrel; added a bounded timber/iron toolrack with three files/chisels behind the tongs while retaining the exact inherited bbox and clear +Z work apron. Deterministic hash `2c902a90ed90145e`, 10 nodes / 9 meshes. Exact model/light tuples and both comps verified live, idempotent rerun zero verbs, six-leg work-apron walk unchanged at 0.375m maximum arrival error, focused gate ALL PASS. Review packet generated under Bill's standing interior-lane visual-tool waiver. Next: `nx-town-longhouse`.
- Wakeup 2 / interior-3: `nx-town-longhouse` reconciled at `[9,0,26]`, yaw `-2.8283680802`, empty comp bag. Existing hearth/fire, trestle tables, high seat, bed alcove, provisions chests, tie beams, herbs, and lamps were preserved; two communal sleeping benches with mattresses, pillows, and contrasting folded blankets now flank the front door facing the hearth, stopping at local x ±1.2 outside the full entry lane. Deterministic hash `6ffc4fdc75ea2a0e`, 21 nodes / 21 meshes. Exact model/light tuples verified live, idempotent rerun zero verbs, six-leg door-to-hearth walk unchanged at 0.346m maximum arrival error, focused gate ALL PASS. Review packet generated under Bill's standing interior-lane visual-tool waiver. Next: `nx-town-market`.
- Wakeup 3 / interior-4: `nx-town-market` reconciled at `[-6.5,0,6.5]`, yaw `2.3561944902`, empty comp bag. Existing bread baskets/loaves, cloth bolts, jugs, trestle counters, poles, and both awning anchors were preserved; two merchant-side shelves, a brass-pan baker's balance scale, and a compact weaver's coin box now sit behind the counter line, with a warm stall light and the complete +Z visitor lane untouched. Deterministic hash `1262295539e80fa1`, 12 nodes / 10 meshes. Exact model/light tuples verified live, idempotent rerun zero verbs, six-leg counter-front walk unchanged at 0.389m maximum arrival error, focused gate ALL PASS. Review packet generated under Bill's standing interior-lane visual-tool waiver. Next: `nx-town-potter`.
- Wakeup 4 / interior-5: `nx-town-potter` reconciled at `[26,0,40.5]`, yaw `-2.5834592129`, initially empty comp bag. Existing kick wheel and mid-throw pot, water bucket, damp-cloth clay stock, drying rack/green pots, and fired ware were preserved; a compact two-tier back-right ware shelf with three additional vessels now completes the stand while remaining inside the inherited bbox and clear of the +Z work apron. Added exact `motion:pwheel` spin at 9°/s and a warm stand light. Deterministic hash `a4e277782dde8c04`, 7 nodes / 6 meshes. Exact model/light/motion tuples verified live, idempotent rerun zero verbs, six-leg work-apron walk unchanged at 0.366m maximum arrival error, focused gate ALL PASS. Review packet generated under Bill's standing interior-lane visual-tool waiver. Next: `nx-town-garden-cottage`.
- Wakeup 5 / interior-6: `nx-town-garden-cottage` reconciled at `[-26,0.0009494488,19]`, yaw `2.2004415094`, empty comp bag, and correctly traced to legacy `mkvillage-houses.ts` / `village_garden_cottage.glb` rather than the separate era-3 garden artifact. Existing kitchen counter/basin/hearth/pots, work table/stool/carrot basket, furnished bed, garden wall/planters/flowers/vines/bench were preserved; a west-wall seed shelf with three jars now names the resident as the garden keeper. Target-only static merging reduced the legacy output from 107 top-level nodes to 22 nodes / 22 meshes without changing its millimetre bbox. Deterministic hash `872aec35e3aa43b3`; exact model/light tuples verified live, idempotent rerun zero verbs, six-leg door-to-room walk unchanged at 0.355m maximum arrival error, focused gate ALL PASS. Review packet generated under Bill's standing interior-lane visual-tool waiver. Next: `nx-town-tower-house`.
- Wakeup 6 / interior-7: `nx-town-tower-house` reconciled at `[-9,0,26]`, yaw `2.8283680802`, empty comp bag. Existing ground-floor desk/chair/book/quill/bookshelf/rug/ladder and upper bedchamber/chest/candle were preserved. Following Bill's artwalk-into-buildings directive, one brass meridian ring with crossed rule-lines now sits on the study desk as the tower's single Golden Measure motif. Target-only static merging brought the legacy output to 22 nodes / 22 meshes with the exact bbox unchanged. Deterministic hash `bd1badd218fdbebd`; exact model/light tuples verified live, idempotent rerun zero verbs, six-leg door-to-study walk unchanged at 0.377m maximum arrival error, focused gate ALL PASS. Review packet generated under Bill's standing interior-lane visual-tool waiver. Next: `nx-town-row-cottage`.
- Wakeup 7 / interior-8: `nx-town-row-cottage` reconciled at `[-23,0,-17]`, yaw `0.9411511441`, empty comp bag, correctly traced to current `mkv3-ring.ts` / `village_row3.glb` rather than the separate legacy row-cottage artifact. Existing hearth/firewood, table/stools/candle, loom/thread basket, linen chest, dye shelf/jars, herbs, and exterior lantern were preserved. The bare north-wall bed now carries a mattress, pillow, and plum woven blanket with three brass rule-lines, making Two Histories the room's single built-in motif without duplicating the loom. Deterministic hash `bd88cd386aec2a89`, 25 nodes / 25 meshes, exact bbox unchanged. Exact model/light tuples verified live, idempotent rerun zero verbs, six-leg door-to-room walk unchanged at 0.384m maximum arrival error, focused gate ALL PASS. Review packet generated under Bill's standing interior-lane visual-tool waiver. Next: `nx-town-bunkhouse`.
- Wakeup 8 / interior-9: `nx-town-bunkhouse` reconciled at `[-9,0,-26]`, yaw `0.3132245734`, empty comp bag, correctly traced to legacy `mkbunk.ts` / `village_bunkhouse.glb` rather than the separate era-3 bunk artifact. All four existing bunk frames were completed with pillows and alternating folded blankets; a four-bay east-wall cubby ensemble gives each sleeper one folded kit and brass rule-tag, using functional Judd-like serial repetition as the room's single built-in motif. Added a real emissive entry lamp and target-only static merging reduced the legacy output to 14 nodes / 14 meshes with exact bbox unchanged. Deterministic hash `49f5acc4d91c4d45`; exact model/light tuples verified live, idempotent rerun zero verbs, six-leg door-to-cubby walk unchanged at 0.380m maximum arrival error, focused gate ALL PASS. Review packet generated under Bill's standing interior-lane visual-tool waiver. First-pass queue now 10/10 complete; awaiting Bill's explicit stop or a new queue.


## BILL VERDICT 2026-08-31: ALL APPROVED, KEEP IMPROVING + PASS 2

Bill: "they all look good, we should keep improving." All 10 rooms eye-gate
PASS. Hold lifted. Queue widened to INTERIOR PASS 2 — one room per tick,
deeper life layer, same laws (walk-tests, comp bags, deterministic builds):

1. **P2-1 Inn guest rooms** — upstairs/alcove beds, travel bags, candle
   glow per bed.
2. **P2-2 Hall council wall story** — carved decision-history frieze above
   the charter shelf (coordinate with artwalk: charter wall already claims
   the motif; the frieze extends it, never competes).
3. **P2-3 Forge living corner** — smith's stool, quenched blade rack,
   apron hook.
4. **P2-4 Longhouse feast kit** — serving boards, ale horn row on the
   high seat.
5. **P2-5 Market evening shutters** — closeable stall shutters with brass
   tally inlay.
6. **P2-6 Potter's glaze bench** — glaze cups in the proven palette
   rhythm, unfired row.
7. Re-derive beyond these from live rooms; defer to artwalk phase B when
   it claims a building that tick.

## Pass 2 log

- Wakeup 1 / interior-10 (P2-1 Inn guest rooms): `nx-town-inn` reconciled at
  `[36,0,0]`, yaw `-π/2`, empty comp bag, pinned source `mkv3-landmarks.ts`
  (reproduced the accepted hash `9fdf2452…` exactly before editing). Beds,
  pillows, blankets, and foot-chests already existed (loop #50) — the honest
  P2-1 delta was travel bags + bedside candles, NOT duplicate beds: three
  leather satchels (body + iron flap + strap) beside each foot-chest on the
  chest line, one bone candle stub with gentle emissive glow (0.85) along
  each bed's west side. First siting put bags mid-deck (z=+0.05); aerial
  review caught it and the pieces were re-sited to the chest line before
  placement — open deck middle (z∈[-0.1,1.1]) preserved for the
  stair-hole→window-seat walk. Merge stayed 30 nodes / 29 meshes (+594 verts,
  AABB millimetre-identical → zero SAT change). Deterministic
  `c180c26f4a3fb8ad` ×2; placed PLACED_VERIFIED, empty comp bag preserved,
  warm light re-verified (pos [36,2.35,0], 0xffb066, 1.6, 6), idempotent
  rerun zero verbs, walk ALL_PASS at maxArrival 0.364 (unchanged), focused
  gate `verify-interior0.ts` ALL PASS (SHA + placer pin updated to the new
  hash). Review packet `reviews/interior-p2-1/` under Bill's interior-lane
  visual waiver; no native visual PASS claimed. Next: P2-2 hall council
  frieze (coordinate with artwalk B-1 charter wall).
- Wakeup 2 / interior-11 (P2-2 Hall council wall story): `nx-town-hall`
  reconciled at `[9,0,-26]`, yaw `-0.3132245734`, empty comp bag. Live pin had
  advanced since interior-1 (polish-269 bone door frames: `44fec272…` →
  `c5964bc8…`); artwalk-15 had already re-grounded its B-1 rider to the
  evolved host, and the local `mkv3-ring.ts` reproduced the live hash exactly
  before editing — a host-pin refresh, not drift. Built the decision-history
  frieze: nine carved decision marks (alternating brass/bone tallies) on a
  dark backing band with one brass closing rule-line, above the charter
  ledger shelves on the east wall — extends the B-1 rule-line language as
  the hall's own record wall rather than competing with it. Band proud of
  the wall face (x∈[4.22,4.28]), y∈[2.54,2.96]: 0.14m above the window top,
  0.42m below the tie beams, clear of the x=0 aisle. One build error caught
  and fixed mid-tick (texBox takes a Material, not a raw hex — merge died
  until the band used `mat(...)`). Merge 23 nodes / 23 meshes (+63 verts),
  AABB unchanged → zero SAT impact. Deterministic `1306527acac5784b` ×2;
  PLACED_VERIFIED, empty comp bag preserved, warm light re-verified, idempotent
  rerun zero verbs, eight-leg two-door walk ALL_PASS 0.360 unchanged, focused
  gate `verify-interior1.ts` ALL PASS (SHA + node count + placer pin updated).
  The pre-existing uncommitted `mkv3-ring.ts` dirt (polish-265/268/269 +
  interior-8, all live-verified) was committed in this lane's commit with
  honest attribution rather than silently mixed. Review packet
  `reviews/interior-p2-2/` under Bill's interior-lane visual waiver; no
  native visual PASS claimed. Next: P2-3 forge living corner.
- Wakeup 3 / interior-12 (P2-3 Forge living corner): `nx-forge` reconciled at
  `[22.1178547347,0,-7.9575684946]`, yaw `-0.90756`, comp contract
  `motion:fire_fg_coals` + `particles`; local `mkv3-forge98.ts` reproduced
  the live hash `2c902a90…` exactly before editing — pin fresh, no sibling
  evolution this time. Built the smith's living corner — the bay showed the
  WORK, these three show the WORKER: three-legged oak stool (seat 0.44)
  tucked behind the anvil horn line, low quenched-blade rack (three dark
  blades on brass-lined bars) filling the toolrack↔quench gap, and an iron
  apron hook with hanging leather apron on the hearth east face. All inside
  the inherited furniture AABB (x-min −0.8726→−0.873 from the stool legs,
  max unchanged) so the furniture-scale collider stays a solid box with no
  approach drift; +Z work apron untouched. Deterministic `620120c4d6f0b4a0`
  ×2, 13 nodes / 12 meshes (+~180 verts); PLACED_VERIFIED with 3 verbs
  (spawn + both comps restored per comp-wipe law), warm bay light
  re-verified, idempotent rerun zero verbs, six-leg work-apron walk
  ALL_PASS 0.375 unchanged, focused gate `verify-interior2.ts` ALL PASS
  (SHA + node/mesh count + placer pin + bbox tolerance updated). Review
  packet `reviews/interior-p2-3/` under Bill's interior-lane visual waiver;
  no native visual PASS claimed. Next: P2-4 longhouse feast kit.
- Wakeup 4 / interior-13 (P2-4 Longhouse feast kit): `nx-town-longhouse`
  reconciled at `[9,0,26]`, yaw `-2.8283680802`, empty comp bag; local
  `mkv3-ring.ts` reproduced the live hash `6ffc4fdc…` exactly before editing
  (pin fresh). Built the feast kit on the high seat — the elder's place set
  for a feast night: carved serving board with cheese round across the seat
  front, brass platter beside it, and three ale horns in alternating
  brass/bone mounts rising from one table line along the seat back rail.
  All counts live on/above the existing seat volume (x∈[3.35,3.95],
  z∈[1.05,1.55]); nothing new reaches the floor; dais, chair, and door lane
  untouched. Deterministic `f2344409ac67fd77` ×2, 25 nodes / 25 meshes
  (+~180 verts), AABB unchanged → zero SAT impact; all six sibling ring
  GLBs byte-identical after rebuild (shared-script safety proven again).
  PLACED_VERIFIED, empty comp bag preserved, warm light re-verified,
  idempotent rerun zero verbs, six-leg door-to-hearth walk ALL_PASS 0.346
  unchanged, focused gate `verify-interior3.ts` ALL PASS (SHA + node count
  + placer pin updated). Review packet `reviews/interior-p2-4/` under Bill's
  interior-lane visual waiver; no native visual PASS claimed. Next:
  P2-5 market evening shutters.
- Wakeup 5 / interior-14 (P2-5 Market evening shutters): `nx-town-market`
  reconciled at `[-6.5,0,6.5]`, yaw `2.3561944902`, empty comp bag; local
  `mkv3-market.ts` reproduced the live hash `dabf662e…` exactly (pin fresh
  — the tex-8 re-texture generation). Built the evening shutters: a timber
  shutter panel leaned against each stall's merchant-side back with brass
  hinge dots and two five-bar brass tally groups inlaid flush per shutter —
  the day's sales, counted; the market now reads as closeable for the
  night. All new depth sits behind the counter line (z≤−0.44) inside the
  inherited AABB (z-max −0.502→−0.57 from shutter depth); the complete +Z
  visitor lane untouched; both `mk_awn_*` wind anchors preserved (nodes
  12 / meshes 10 unchanged, +~330 verts). One bookkeeping catch: the
  placer's own SHA pin was stale since interior-4 (still `12622955…`,
  pre-dating the re-texture) — the hash-gate correctly stopped the first
  run; pin corrected to current truth before any live mutation, and the
  bbox pin widened to the decoded −0.57. Deterministic `8c16ea9a756a95ad`
  ×2; PLACED_VERIFIED, empty comp bag preserved, warm stall light
  re-verified (0xffb066 / 1.35 / 4.5), idempotent rerun zero verbs,
  visitor-counter walk ALL_PASS unchanged, focused gate
  `verify-interior4.ts` ALL PASS (SHA updated; counts unchanged). Review
  packet `reviews/interior-p2-5/` under Bill's interior-lane visual
  waiver; no native visual PASS claimed. Next: P2-6 potter's glaze bench.
- Wakeup 6 / interior-15 (P2-6 Potter's glaze bench): `nx-town-potter`
  reconciled at `[26,0,40.5]`, yaw `-2.5834592129`, comp contract
  `motion:pwheel`; local `mkv3-potter41.ts` reproduced the live hash
  `a4e27778…` exactly (pin fresh). Built the glaze bench — the potter's
  color work BETWEEN wood and clay: low timber bench (top 0.5, seated-work
  height) in the back-left edge gap, three glaze cups in the proven palette
  rhythm (plum / sage / water-blue 0x506a78), two bare-clay unfired bowls
  on the lower line, and a stirring stick across the top edge. Fully behind
  the wheel line; +Z work apron untouched (AABB x-min −1.22→−1.725,
  z-min −0.97→−1.0, max unchanged). Two LSP-caught errors fixed in-tick
  (missing `ACCENTS` import; stray tuple comma). Deterministic
  `dad7c82efbf3202b` ×2, 10 nodes / 9 meshes (+~250 verts); PLACED_VERIFIED
  with 2 verbs (spawn + pwheel spin restored at 9°/s per comp-wipe law),
  warm light re-verified, idempotent rerun zero verbs, six-leg work-apron
  walk ALL_PASS unchanged, focused gate `verify-interior5.ts` ALL PASS
  (SHA + node/mesh count + placer pin + bbox updated). Review packet
  `reviews/interior-p2-6/` under Bill's interior-lane visual waiver; no
  native visual PASS claimed. PASS 2 named queue now 6/6 complete —
  re-derive further rooms from the live census next tick.
