# nx-forge model review — nvp-12

Reviewed: 2026-08-23T15:53:52Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-forge` — court-local smithy annex
- Source: `agents/arthur/assets/mkv3-forge98.ts`
- Output: `agents/arthur/assets/village_forge3.glb`
- SHA-256: `fcc66d79b76b109e8d826a1a1ad38e06fc09292a2b8c2da0d31f5702f8893596`
- Court-local anchor: `[7.373,0,1.677]`
- Proposed pose: `pos [22.11785473473295,0,-7.957568494595163], yaw -0.90756, scale 1`
- Terrain evidence: radius `23.505794911317555m`, inside seed-8128's 24m flat radius, hence y=0.

## Rebuild and structure

- Two consecutive rebuilds were byte-identical at the full SHA-256 above.
- File size: 60,172 bytes; three embedded texture images.
- Bounds: min `[-0.872618,-0.005,-0.777]`, max `[1.46,2.10,0.61]`, size `[2.332618,2.105,1.387]` metres.
- Final GLB census: 10 model nodes / 9 draw meshes (renderer traversal adds one root); materials stone, timber, iron, glow3, glow4.
- Exact motion target `fire_fg_coals` survives with two folded coal draw children.
- Focused deep audit: 10 nodes; two emissive families; zero degenerate triangles; zero NaN vertices; zero unsupported floating clusters.
- Collider posture: furniture-scale outdoor solid, not room-scale. Ground minimum is within 5mm of y=0.

## Component reconciliation

Fresh `commons/av-forge` carries:

- `motion:fire_fg_coals = {type:"bob", axis:"y", amp:0.014, period:1.8}` — target exists exactly and remains valid.
- `particles = {preset:"embers", scale:0.6}` — invalid under the current shared particle contract. `scale` is ignored, so the live evaluator produces 140 default embers at entity origin `[0,0,0]`, not at the coal bed.

The reviewed placement contract corrects that latent defect without changing model bytes:

- `motion:fire_fg_coals` unchanged;
- `particles = {preset:"embers", origin:[0,0.45,0.42], count:84}`.

Eighty-four is the explicit 60% count intended by the obsolete `scale:0.6`; the corrected bag has zero evaluator notes and sits on the visible coal bed.

## Visual review

Evidence: `agents/arthur/reviews/nx-forge/`

- Front/right/back/left frames show a coherent complete working annex: masonry hearth and hood, bright coal bed, anvil/stump/hammer, bellows/tongs, and quench barrel.
- Stone/timber/iron hierarchy remains legible; fire is the focal point, tools secondary.
- Back and side views are complete for a freestanding utility satellite; no floating tool, missing wall, or camera trap.
- `gameplay.png`: intentionally small at 18m and correctly subordinate to the principal court mass; chimney/fire silhouette still identifies it.
- `night.png`: the coal mouth remains a clear warm beacon without becoming a second principal landmark.
- `motion-a.png` / `motion-b.png`: the renderer applies the exact 0.014m y-bob to `fire_fg_coals`; pixel evidence changes, but the movement is honestly subtle rather than exaggerated.

## Seat composition

The annex shares the court yaw. In the court's local frame, forge min-x is `7.373 - 0.872618 = 6.500382m`, leaving a 0.000382m non-overlap gap from the court's max-x at 6.5m: flush by design, not intersecting. It sits east of both workshop aprons and keeps the local +Z arrival direction open.

The proposed forge OBB clears every live commons-next entity. The combined court+forge footprint remains far inside the 112m rim and preserves the hearth sightline.

## Highest-value finding

FIXED IN THE REVIEWED COMPONENT CONTRACT: the inherited particle bag used an ignored key and emitted at the wrong origin. No blocking model-source defect remains.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact hash, pose, motion comp, and corrected ember bag above. This is the second court-ensemble member; it remains unplaced until court, cistern, bakery sign, and smithy sign are all reviewed-ready. No target-world mutation occurred during this review.
