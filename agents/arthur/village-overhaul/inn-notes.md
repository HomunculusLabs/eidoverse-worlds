# Inn architectural overhaul — local handoff

## Outcome

`build/nx-town-inn.glb` is a complete replacement inn, not added trim: substantial limewashed walls and masonry plinth, dark structural bays, a steep intersecting cross-gable slate roof with closed local gable wedges, a correctly seated chimney, a covered external guest stair, and a furnished porch with settle, trestle table, bread board and travel chest. The tavern and original guest furnishings remain.

**Final SHA-256:** `861225bb15230d9bf6cbf7ac7b18a52f6ecb2893e0ac3aa47a073afe6de8f692`

- 589,224 bytes; 7,468 triangles; 30 glTF nodes, 27 mesh resources, 29 rendered mesh instances.
- Deterministic double builds in separate Bun processes: identical full SHA, both exit 0 and both output mtimes advanced. `build/inn-determinism.json`.
- Final decoded default-scene bounds: min `[-4.5, -0.20000000298023224, -3.472568988800049]`, max `[4.5, 7.193999767303467, 4.900000095367432]`.
- Exact baseline X/Z envelope retained. Height grows by `0.9254679679870605` m; parent height/skyline review remains required.
- No uploads, world verbs, GUI use, credential reads, commits, original-builder edits or shared-kit edits.

## Frozen preservation

Host is unchanged: ID `nx-town-inn`, position `[36,0,0]`, yaw `-1.5707963267948966`, scale `1`, parent `null`, component bag `{}`. The replacement asset library is intentionally not deployed.

The served baseline is pinned to SHA `0cac6fa0d663bf80ec8537f9e8734f5e4d5ba641206bd71fdf49e8303b2f6fec`; its compressed download hash is not inferred from the library name. Original source was located and read at `agents/arthur/assets/mkv3-landmarks.ts:353–630`, but never imported or executed.

The builder decodes the served Draco/WebP asset, separates welded connected islands inside its merged material buckets, and selects explicit islands under the full baseline pin. It retains **123 furnishing/sign/light islands, 3,084 triangles**: both tavern table-and-bench ensembles, tankards/candles, bar/bottles/key cabinet, casks/cradles/hoops, hearth/mantel/cooking crane/tools, all three guest beds and bedding/chests/bags, washstand/basin, window seat, original `fire`, `flame`, `sign` subtree, `lamp` and `lamp2`. The sign's tankard pictogram remains double-sided. No motion is invented: the frozen host component bag is empty.

`build/inn-preservation.json` verifies 22 retained nodes after final GLB serialization: exact world matrices and child order, compact indexed attribute bytes, material values and embedded base-color image bytes. `build/inn-baseline-decoded.json` and `build/inn-retention.json` expose the source selection.

All ten exact nearby model tuples/served hashes from `neighbors/nx-town-inn.json` are included in local assembly collision evidence: hens, coop, stable bench, well, inn lintel, inn threshold, waterline art, stable trade sign, stable, and **nx-struct-cellardoor**. All nine protected neighbor volumes have zero unauthorized host triangles, without broad exemptions. The separate cellar entry is outside the preserved inn envelope; no new wall is placed across it. The original inn tankard trade sign is an internal retained subtree, not a separate neighbor.

The frozen separate authored light `nx-town-inn-l` is not mutated. Local renderer lighting deliberately does not simulate that world light or other runtime components.

## Functional evidence

`reviews/inn-function-report.json` binds both reports to the final full SHA and actual tool paths.

- **Ground floor PASS:** `reviews/inn-player.json`, 34 bidirectional route legs. Street → porch → porch settle service → actual artwork threshold → tavern center → both table-service positions → bar/cask station → hearth station → return.
- **Guest floor PASS:** `reviews/inn-upper-player.json`, 22 bidirectional route legs. Separate street approach clears the neighboring well → seven supported treads → landing → guest gallery → window-seat and washstand approach.
- Both gates run the pinned public `colliders.js` / `supportclass.js` through `../cabin-overhaul/verify-player.ts`, with `CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime`.
- Browser classifier is exact room-scale trimesh, not a bounding box. Triangle-volume doors, swept standing-body clearance, support heights and real collider response are checked.
- Main door requires **1.4 m × 2.2 m above the actual threshold top `0.2499852861762047`**, not above the ordinary floor. Preserved lintel bottom is `2.499999998807907`; no fabricated clearance lift or art exemption. The porch arrival also has a 1.4 × 2.2 m gate.
- Floor is actual supported geometry at y `.198`; retained inlay supplies the `.2499852861762047` threshold surface.
- Guest stair has broad `.65` m treads and `.44` m game-scale rises, within the tested `.55` m step limit. This is **not real-world accessibility/building-code certification**.

The first stair prototype's narrow treads failed the conservative swept-square gate; the first longer-tread approach collided with the nearby well, and a later handrail termination pinched the gallery turn. Geometry/route changes were rebuilt and rerun; the final two reports are PASS, not carried-over earlier results.

## Visual evidence and limits

**Vision mode: auxiliary.** `functions.vision_analyze` returned textual auxiliary image analyses, not native image pixels to this agent. No native or live visual acceptance is claimed. `reviews/inn-visual-report.json` binds the actual model, cameras, manifests and inspected montage hashes.

All nine prescribed cameras are retained, unchanged between before/final: front, right, back, left, gameplay, aerial, top, night and interior.

- `reviews/inn-before/` vs `reviews/inn-final/`: host-only, identical camera hash `7e39bf95328026aa2a4c6c3c8145fa78ca9a5614a4c0800f6d210d4abb03e646`.
- `reviews/inn-before-assembly/` vs `reviews/inn-final-assembly/`: all ten exact companions, same host camera rig.
- `reviews/inn-detail-before/` vs `reviews/inn-detail-final/`: identical supplementary rig for porch arrival, tavern tables, hearth, guest room, stair approach, assembly aerial/top/night and bar/casks. Camera hash `d88a9163f9f7f5500269a720d9e389f9b4d6155b9f97ff3fc80ef4e6e6546b2b`.
- Inspected complete nine-panel before/final host and detail montages: `reviews/inn-*-montage.jpg`.

Auxiliary judgment: substantial coherent redesign, closed roof planes, legible inn frontage, visibly furnished common/guest rooms and inhabited porch; ready for independent parent review. Initial pale roof stripes were coplanar gable caps; lowering caps below slate removed them. A remaining pale stair-bay cheek is intentional closure. The unchanged brown stable visible behind the inn is not a new inn canopy. The auxiliary reviewer occasionally conflated that stable with a canopy, and the tankard sign with the geometric lintel; decoded identities take precedence.

Remaining limits: solo night approach and original dark casks/props are underlit without authored world lights; no live terrain or whole deployed component evaluation; only the explicitly assembled neighbors are collision-tested; parent must independently inspect the stair-bay junction/height increase, restore/verify exact world components and companions if deploying, and rerun served-byte geometry after rollout.

## Reproduce from repository root

```sh
bun agents/arthur/village-overhaul/build-inn.ts
CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime bun agents/arthur/cabin-overhaul/verify-player.ts agents/arthur/village-overhaul/build/nx-town-inn.glb agents/arthur/village-overhaul/build/nx-town-inn-route-contract.json agents/arthur/village-overhaul/reviews/inn-player.json
CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime bun agents/arthur/cabin-overhaul/verify-player.ts agents/arthur/village-overhaul/build/nx-town-inn.glb agents/arthur/village-overhaul/build/inn-upper-route-contract.json agents/arthur/village-overhaul/reviews/inn-upper-player.json
bun agents/arthur/cabin-overhaul/render.ts agents/arthur/village-overhaul/build/nx-town-inn.glb agents/arthur/village-overhaul/reviews/inn-final agents/arthur/village-overhaul/reviews/inn-before/camera.json
```

Deploy only `build/nx-town-inn.glb`. `build/inn-*-assembly.glb` files are review composites, **never replacement hosts**. Parent controls rollout.
