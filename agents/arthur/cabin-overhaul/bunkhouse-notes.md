# Bunkhouse — Four-Berth Lodge

## Final outcome

Local-only architectural overhaul complete. No upload, world join, verbs, commits, or original/shared-source changes.

- Main artifact: `build/nx-town-bunkhouse.glb`
- Final SHA-256: `2b618274fa316c7846a1b8c0cf601b3465a5cbfd7227a5cdc0510568f87df59c`
- 529,652 bytes; 10 meshes/nodes; 5,782 rendered triangles.
- Envelope: X `[-4,4]`, Z approximately `[-2.55,2.60]`, inside the original X `±4.15`, Z `±2.621`. Roof top `4.30` versus baseline `4.05`; no footprint growth.
- Floor nominal Y `.26`; shallow board joints have a structural tongue/subfloor at `.258` rather than dropping to the stone foundation.

## Architecture and room

Pale lime infill in a substantial dark frame, cedar end-wall panels, stone footing, six actual window openings, long layered slate roof with staggered joints, true-slope end gables, and an open king-post entry porch. The perpendicular porch roof is joined by triangle clipping against actual valley planes, not pasted over an uninterrupted main roof. Narrow slate-colored valley flashing resolves the join.

Four floor-level foot-entry berth bunks replace the original two stacked pairs, preserving exactly four sleepers without requiring a ladder component. Each has a `2.02 × .94m` mattress, pillow, blue-gray blanket, supporting frame, and its own open-front head cubby. All mattresses fit inside the actual wall faces. The central aisle is open; the player proof visits the foot of every berth in both directions.

The open portal has a minimum `1.86m` width at the stone shoes, `1.90m` between porch posts, and nominal lowest overhead clearance `2.35m`. Its conservative verified opening is `1.80 × 2.20m`, starting at the true `.26` floor. The pale rectangle seen through the entry is the rear interior wall, not a closed door; flat frontal lighting still makes that depth less obvious than a three-quarter view.

## Actual player gate — PASS

- Contract: `build/nx-town-bunkhouse-route-contract.json`
- Report: `build/nx-town-bunkhouse-player-report.json`
- Harness: parent/sibling-owned `verify-player.ts`, consuming the real `client/lib/colliders.js` CPU module and decoded default-scene triangles.
- Exact browser collider: **true**; room-scale classification: **true**.
- Door clipped-triangle intrusions: **0**.
- Bidirectional route legs: **22/22 PASS**, outside → porch → entry → all four berth approaches → return, plus the reverse.
- Maximum lateral push: **0**. Maximum step rise: approximately `.13m`.
- Unauthorized rider-volume triangles: **0**.

This is real browser-collider execution on local geometry, not a live world walk or a neighbor/terrain-assembly claim. The contract samples both porch risers in one outside-to-porch segment; an intermediate waypoint on the short lower tread would incorrectly classify the following authorized tread as a body obstruction. Floor height is never raised to manufacture clearance.

Run:

```sh
bun agents/arthur/cabin-overhaul/build-bunkhouse.ts
bun agents/arthur/cabin-overhaul/verify-player.ts \
  agents/arthur/cabin-overhaul/build/nx-town-bunkhouse.glb \
  agents/arthur/cabin-overhaul/build/nx-town-bunkhouse-route-contract.json \
  agents/arthur/cabin-overhaul/build/nx-town-bunkhouse-player-report.json
```

## Exact rider preservation — important correction

The old `assets/mkbunk.ts` comment claims Y `.82..1.28`; that is **not the actual b20 mesh extent**. The exact hash-matching `assets/village_artwalk_b20.glb` has local Y approximately `0..0.46`, so the fixed host-relative anchor `[-2.2,1.05,2.0325]` puts the artwork at host Y `1.05..1.51`.

Decoded rider SHA: `152684b8dd6ba53537d4abfbbe144c435023df30722ae9662fdfdfe1a65082c7`.

Exact protected host-local volume recorded in the route contract:

- Min `[-3.110000026226044,1.049999995827675,2.000000001192093]`
- Max `[-1.2899999737739565,1.5100000083446503,2.119999998509884]`

Only the unchanged lime backing at `z=2.0` is allowed, confined to the exact artwork X/Y footprint and a `z=1.9995..2.0005` band. No trim/frame/sill exemption. Front windows were raised so their sills start at Y `1.58`, above the artwork. The actual wall plane and rider anchor remain unchanged; no separate rider entity was touched.

## Build and visual evidence

- Deterministic final double build with increasing mtimes: `build/nx-town-bunkhouse.double-build.json`.
- Build/source/kit pins and decoded geometry checks: `build/nx-town-bunkhouse.checks.json`.
- Baseline served bytes: `before/nx-town-bunkhouse.glb`, SHA `601895e7562552f0aa583408526f446c586e9786ed39841ad797b4d2e9770400`. Its upload-address identity remains `store/c8636968968672af.glb` (served Draco SHA differs).
- Exact matching-camera before: `reviews/bunkhouse-before/`.
- Latest exact-byte after: `reviews/bunkhouse-final/`.
- Additional latest exact-byte interior cameras: `reviews/bunkhouse-final-overhead/`, `reviews/bunkhouse-final-west/`, `reviews/bunkhouse-final-east/`.
- Main before/after camera SHA: `ad5fa64520e0c5cfbfb041d78593762a06002e6c4f987704f56452a476b3d0ae`.
- Open `reviews/bunkhouse-final/comparison.png`, `elevations.png`, `roof-night.png`, and `interior-proof.png` for the review packet.

All latest four montages were actually inspected through `vision_analyze`: four elevations PASS; aerial/top/gameplay/night ACCEPT with no visible structural defect; all four beds/cubbies and circulation visually PASS; fixed-camera comparison judged a substantial overhaul. The judge was the tool's auxiliary vision analysis, not a claimed native eye or live in-world view. A minor valley seam and the straight-through portal depth read remain presentation notes, not geometry failures. No lighting-spill claim: warm panes/lantern are emissive geometry in a solo rig.

## Issues found and fixed

1. Original bed frames extended across front/back interior wall faces. Four fully contained, directly reachable berth equivalents replace them.
2. Initial porch flashing was too prominent; narrowed, slate-colored, extended to the eave, then visually accepted.
3. Wood-colored blankets read as bare slats; all four now use blue-gray bedding.
4. Stale rider prose missed the artwork's upper extent; decoded exact bytes, raised front windows, passed the exact protected-volume check.
5. The actual browser support ray dropped through floorboard gaps. Added a real tongue/subfloor. The failed proof is retained at `build/nx-town-bunkhouse-player-rejected-floor-seams.json`; the final proof is PASS.

## Kit integration notes / remaining parent work

No shared kit edit is required. This builder locally replaces the generated gable end triangles because the kit's default gable baseline is at the eave despite the overhang; the replacement follows the actual roof underside at the wall plane. All roof helpers and material definitions remain shared-kit consumers. Do not overwrite this local correction with default gable ends.

The parent owns any assembly/neighbor checks, upload/placement, reapplication of host components, unchanged companion/rider tuple checks, and post-placement served-byte rendering. Existing host contract is still the one in `before/contracts.json`: ID `nx-town-bunkhouse`, pose `[-9,0,-26]`, yaw `0.31322457341772525`, scale `1`, empty component bag. Nothing here mutates that contract or the world.
