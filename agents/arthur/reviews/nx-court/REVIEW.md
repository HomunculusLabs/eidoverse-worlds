# nx-court model review — nvp-11

Reviewed: 2026-08-23T15:42:03Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-court` — bakery + workshop principal mass
- Source: `agents/arthur/assets/mkv3-ring.ts` (court section)
- Output: `agents/arthur/assets/village_court3.glb`
- SHA-256: `38096b30b9131685be9d8ed829839767ded39dae26e54086dd6604f68cbb7b22`
- Proposed pose: `pos [18.9,-1.5946487083102603e-8,-14.8], yaw -0.90756, scale 1`
- Terrain evidence: seed-8128 `heightAt(18.9,-14.8)` above; radius `24.005207768315607m`.

## Rebuild and structure

- Two consecutive final rebuilds were byte-identical at the full SHA-256 above.
- File size: 212,808 bytes; four embedded texture images.
- Bounds: min `[-6.5,-0.2,-2.94]`, max `[6.5,4.09,3]`, size `[13,4.29,5.94]` metres.
- Final GLB census: 27 model nodes / 27 draw meshes (renderer traversal adds one scene root).
- Materials: timber, stone, plaster, iron, and four emissive glow families; named surviving anchors `fire`, `flame`, `fire2`, `lamp`.
- Focused deep audit: 27 nodes; three emissive families reported by the audit; zero degenerate triangles; zero NaN vertices; zero unsupported floating clusters.
- Collider posture: room-scale structural building; exact trimesh preserves both open fronts and the shared yard.

## Door, apron, and circulation gate

Both sibling sheds have a `2.2m × 2.3m` open front on local +Z, exceeding the 1.4m travel law. Floor top / threshold is `0.20m`, within the ≤0.25m law.

Required 2.0m-wide × 1.5m-deep rectangles:

- Bakery, centered `x=-3.4`: `x[-4.4,-2.4]`; interior `z[0.5,2.0]`; exterior `z[2.0,3.5]`.
- Workshop, centered `x=3.4`: `x[2.4,4.4]`; same interior/exterior z bands.
- The 1.4m travel corridors are the centered subsets `[-4.1,-2.7]` and `[2.7,4.1]`.

The gate exposed one defect class: craft furniture occupied those arrival rectangles despite old comments calling the lanes clear. nvp-11 moved:

- bakery exterior workbench from door center to `x=-5.2` (right edge `-4.55`);
- bakery flour bin/lid to `x=-4.9` (right edge `-4.6`);
- workshop anvil/hot-work station to `x=5.0+` (left edge `4.69`).

Both full aprons and both 1.4m corridors are now unobstructed. Interior circulation reaches the oven/counter and forge/bench without crossing furniture; yard cart/crates remain outside both door lanes.

## Component reconciliation

Fresh `commons/av-court` carries one key, `particles:smoke`. Its old value `origin [18.8,3.2,-19.7]` is world-space and violates the entity-relative particles contract. Inverting it through the live court pose gives local `[-4.8517,3.2,-0.8129]`, confirming the authored oven target `[-4.9,3.2,-0.8]`.

The later placement tick must apply exactly:

`particles:smoke = {preset:"smoke", origin:[-4.9,3.2,-0.8], count:50, size:0.4, speed:0.35}`

No other live component targets exist. The named emissive anchors survive for visual identity but have no inherited motion/socket payload.

## Visual review

Evidence: `agents/arthur/reviews/nx-court/`

- The front/gameplay read is coherent: two sibling roofed sheds, bakery oven/counter on the left, hot-work/anvil on the right, and a deliberately open working yard between.
- Roofs correctly cover their own offset sheds; neither is stacked over the center yard.
- Timber/stone/plaster/iron hierarchy remains readable; orange fire points distinguish the functions without adding a duplicate bakery mass.
- Right/left/back views are plain but structurally complete and grounded; no missing roof, wall, or floating craft element.
- Final furniture shifts preserve composition while opening both arrival faces.
- Night frame is dark by design but the oven, hot work, and yard lamp retain three readable functional points. Ensemble-level lighting can be decided after its remaining satellites are reviewed.
- No motion applies.

## Pose composition

At the reviewed yaw, local +Z points toward the hearth. The proposed court OBB clears the live plaza trio and four cardinal lamp micro-OBBs, leaves the SW meadow open, and remains far inside the 112m rim. Both exterior aprons point into open ground for later path design.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact repaired hash and proposed pose above. This is only the first court-ensemble member; it must not be placed until forge, cistern, bakery sign, and smithy sign are each independently reviewed-ready. No target-world mutation occurred during this review.
