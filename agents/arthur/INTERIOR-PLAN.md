# INTERIOR LIFE PLAN

Working: `interior-N`
World: `commons-next`
Law: one room per wakeup; exact live IDs; standing gate before mutation; complete comp-bag capture/reapply; deterministic rebuild; native review; two-way MCPL walk; idempotent placement; never push.

## Queue — live-derived 2026-08-30

1. ✅ `nx-town-inn` — common room complete at interior-0: hearth/bar/casks/mugs/stairs preserved; paired table seating moved east of the 1.4m corridor; warm interior light added.
2. `nx-town-hall` — meeting table, hearth-seats, ledger shelf, warm light.
3. `nx-forge` — anvil, toolrack, quench barrel, coal glow; preserve `motion:fire_fg_coals` and `particles`.
4. `nx-town-longhouse` — sleeping benches and central hearth.
5. `nx-town-market` — stall shelves, scale, coin box.
6. `nx-town-potter` — wheel, ware shelf, clay store; calm wheel motion.
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
