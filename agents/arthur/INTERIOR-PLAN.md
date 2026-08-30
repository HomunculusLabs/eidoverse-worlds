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
7. `nx-town-garden-cottage` — lived-in cottage room.
8. `nx-town-tower-house` — study and sleeping room.
9. `nx-town-row-cottage` — compact household room.
10. `nx-town-bunkhouse` — shared sleeping room.

Queue IDs, poses, hashes, and comp bags are re-read live when each room reaches the head.

## Furniture contracts

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
