# Rest of village — architectural overhaul

Bill's commission: “omg this is insane, can we do the rest of the buildings in the village please”. This follows his approval of five new cabins. World: commons-next. Parent coordinator: Arthur. Do not mutate world or commit from builder lanes.

## Scope
17 exact existing hosts in before/contracts.json: hall, inn, stable, woodyard, court (bakery/workyard), forge, market, dyehouse, potter, kiln, belltower, nx-tower, shrine and four town gates. New cabins, new windmill, carousel, signs, wall artwork, lights, roads, district models and outlying sculptural structures are protected, not rebuild targets. No new land use/relayout. Same host ID/position/yaw/scale; preserve original X/Z envelope (height may grow with review). Existing host component values and names survive exactly. If any contract prevents sound architecture, escalate rather than silently change it.

## Architectural intent
A major architectural redesign, not bolted-on trim. Calm substantial limewash, real masonry plinths and arches, dark joinery, coherent layered slate roofs. Each trade must remain distinct and recognizable: not seventeen copies of a cabin. Preserve useful furnished interiors and exact working parts; improve circulation and material craftsmanship. Work inside existing footprints. Keep entrances inviting, threshold-supported and clear over at least 1.4m width / 2.2m standing height where walk-in. Open small shops may remain outdoor workstations; never pretend a bbox-classified prop is an enterable room.

## Frozen inputs / owned outputs
before/ is read-only, captured from live /geom plus validated live-folded join snapshot. before/<id>.glb is the actual downloaded served asset, often Draco-compressed. Original source files may differ: decode the real baseline before selecting retained interior nodes. Local kit.ts is campaign-only; shared cabin-overhaul/kit.ts, assets/housekit.ts and all original builders are read-only. Builders own build-<lane>.ts, <lane>-notes.md and their model-prefixed generated outputs in build/ and reviews/ only. Never call the old cabinet finish routine (writes accepted cabin paths); use village-overhaul/kit.ts.

The copied roof helper retains a KNOWN gable wedge gap (inner wall vs overhang roof slope). Close it in your lane-specific geometry or use a proper custom clipped roof. Do not duplicate other builder's wedges or modify the shared kit during the fleet. No nested multi-root asset rebuilds.

## Gates before handoff
- Actual deterministic double build and full SHA-256, decoded default-scene envelope, no silently retained stale output.
- Exact-name animated nodes / sockets / particle origins must still exist and function; no component changes without parent scope amendment. Decode protected artwork and nearby signs, preserve backing and expose their faces; no broad intrusion exemptions.
- Entrances: triangle-volume clearance, floor support, actual browser collider classification and bidirectional routes through meaningful room stations. Reuse ../cabin-overhaul/verify-player.ts and pin the public-runtime module directory; report limits for non-room workstations rather than fake a room PASS.
- Render real baseline and final GLBs under identical cameras with ../cabin-overhaul/render.ts; keep nine views, plus tailored interiors/top/animation poses as needed. Inspect actual images; state tool native/auxiliary route honestly. Parent independently reviews final imagery. No GUI. No synthetic/fabricated reviews.
- File evidence only, no uploads/world verbs/commits. Parent owns deployment, full component/companion readback, served-geometry reruns and live snapshots.

## Explicit scoped correction: collision preference
Parent reproduced the public client's automatic central-pillar collision on the original north gate: both directed center traversals pushed by .04m; supplying the engine's EXISTING `collide:'exact'` option removed both pushes without changing geometry. The original doorway still fails its separate full-height triangle test; this is not a baseline PASS. User-facing disclosure made before this amendment. Final approvals may explicitly permit a spawn-only absent→`exact` collision preference for the four gates, bell tower, woodyard, dyehouse or market where verified passage/service access requires it. Each must carry a specific reason, passing exact-byte functional evidence and authoritative final snapshot check. No `box`, arbitrary override, component change, engine modification or implicit preference default is admitted. All other host fields and all companion contracts remain protected.

## Budgets and continuity
One eight-lane building fleet plus one deployment-engine lane and one live-evidence lane, at most ten concurrent children. Shared live uploads parent-only, paced 22s+, world verbs 700ms+ with authoritative acknowledgments. Manual charge allocation: 100 units from manifest starting-charge 120; eight design lanes x10 + deployment x10 + live evidence x10; 20 integration reserve. These are planning allocations, not measured runtime debits or enforced Hermes charges. Real task/upload/verb counts recorded separately. Working: village-building-overhaul in Excalibur; durable report added under artifacts/studio/village-building-overhaul/.
