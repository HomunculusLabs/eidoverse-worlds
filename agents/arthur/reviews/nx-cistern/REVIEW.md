# nx-cistern model review — nvp-13

Reviewed: 2026-08-23T16:03:53Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-cistern` — bakery water satellite
- Source: `agents/arthur/assets/mkv3-bakery-cistern97.ts`
- Output: `agents/arthur/assets/village_bcistern3.glb`
- SHA-256: `85d956f6600f336d11666b59d53d8e5a889a793aa1b26cbce27b5d993f903f8d`
- Corrected court-local anchor: `[-1.8,0,2.65]`
- Proposed pose: `pos [15.703583236444484,0,-14.586880611718946], yaw -0.90756, scale 1`
- Terrain evidence: radius `21.433142850372697m`, inside seed-8128's 24m flat radius, hence y=0.

## Rebuild and structure

- Two consecutive final rebuilds were byte-identical at the full SHA-256 above.
- File size: 39,696 bytes; three embedded texture images.
- Bounds: min `[-0.45,0,-0.34]`, max `[1.21623,0.75553,0.49]`, size `[1.66623,0.75553,0.83]` metres.
- Final GLB census: four model nodes / four draw meshes; materials stone, timber, iron, with flat water in the unnamed bucket.
- Focused deep audit: four nodes; zero emissive materials; zero degenerate triangles; zero NaN vertices; zero unsupported floating clusters.
- Collider posture: furniture-scale outdoor solid. Model bottom is at grade; water remains recessed below the 0.62m rim.
- No component targets or inherited component bag exist.

## Visual review

Evidence: `agents/arthur/reviews/nx-cistern/`

- Initial four-angle review showed a coherent ashlar tank, water, scoop, and wood family, but the shallow 0.35rad lid floated approximately 13cm above grade and read as detached rails.
- nvp-13 increased the lean to 0.70rad and reseated lid/battens so the board spans grade to rim. Final bbox min-y is zero.
- Final front/right/back/left views now read as one grounded open cistern with a real supported lid; water and scoop survive every relevant angle.
- `gameplay.png`: intentionally tiny and appropriately subordinate to the court, but the tank/lid silhouette remains distinct on approach.
- `night.png`: non-emissive as expected; it relies on ensemble lighting rather than inventing an isolated beacon.
- No motion applies.

## Seat correction and ensemble clearance

The inherited plan anchor `[-2.949,1.980]` placed the cistern directly in the bakery opening: its local bbox occupied x `[-3.399,-1.733]`, z `[1.64,2.47]`, blocking both the reviewed interior and exterior arrival rectangles. A good model at that seat was not ready.

The corrected anchor `[-1.8,2.65]` gives local extents x `[-2.25,-0.584]`, z `[2.31,3.14]`:

- bakery apron edge ends at x=-2.4, leaving 0.15m clearance;
- low court wall geometry ends at z=2.1, leaving 0.21m clearance;
- roof overhang is above 2.8m, more than 2m above the cistern;
- workbench, yard lamp, crates, workshop opening, and reviewed forge are all disjoint;
- both 1.4m travel lanes and both 2m×1.5m bakery aprons remain clear.

The corrected world pose clears every live commons-next entity and remains far inside the 112m rim.

## Highest-value finding

FIXED: the inherited court-local seat blocked the bakery threshold/aprons. The accepted seat moves the cistern beside the opening; the source lid was also grounded during the same review rather than carrying a visibly floating cover forward.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact repaired hash and corrected pose above. This is the third court-ensemble member; it remains unplaced until bakery and smithy signs are reviewed-ready. No target-world mutation occurred during this review.
