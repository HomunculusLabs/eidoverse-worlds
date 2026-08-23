# nx-sign-bakery model review — nvp-14

Reviewed: 2026-08-23T16:22:03Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-sign-bakery` — bakery blade sign
- Source: `agents/arthur/assets/mkv3-signs11.ts` (bakery section)
- Output: `agents/arthur/assets/village_sign_bakery.glb`
- SHA-256: `599194ee7f4efd810735f59b1e2d686797a2c29b65249fdc958913619f8ec85c`
- Corrected court-local mount: `[-6.13,0,1.4]`
- Proposed pose: `pos [14.022735609615019,0,-18.768525175210893], yaw 2.234032653589793, scale 1`
- Terrain evidence: radius `23.42850083188615m`, inside seed-8128's 24m flat radius, hence entity y=0. Authored geometry hangs at y=1.85–2.45.

## Rebuild and structure

- Two consecutive final rebuilds were byte-identical at the full SHA-256 above.
- File size: 45,356 bytes; three embedded texture images.
- Bounds: min `[-0.03,1.85,-0.12]`, max `[0.70,2.45,0.12]`, size `[0.73,0.60,0.24]` metres.
- Final GLB census: four model nodes / four draw meshes, reduced from the inherited five draws after explicit material folding.
- Materials: iron, `sign_bone`, `sign_loaf`, plus the flat timber board bucket.
- Focused deep audit: four nodes; zero emissive materials; zero degenerate triangles; zero NaN vertices; zero unsupported floating clusters.
- Collider posture: furniture-scale elevated solid attached outside a wall, not an enterable model.
- No component targets or inherited component bag exist.

## Visual review

Evidence: `agents/arthur/reviews/nx-sign-bakery/`

- Initial review showed a credible bracket, hangers, board, and front loaf pictogram, but the back was blank/black. A hanging blade sign must be approached from both directions.
- nvp-14 added a second bone face and mirrored raised loaf/score glyph, then moved both faces and glyphs to explicit exported `sign_bone` / `sign_loaf` materials. This simultaneously reduced the final draw count from five to four.
- The review renderer also gained neutral daylight fill after the one-sided key light falsely hid valid -Z geometry; final evidence distinguishes actual backside content from a lighting artifact.
- Final front/back frames both read as bakery signs; side views show plausible plate/arm/hanger construction.
- `gameplay.png`: too small to act as a skyline landmark, appropriately; it resolves as trade wayfinding on court approach.
- `night.png`: non-emissive by design and dependent on court lighting rather than inventing another beacon.
- No motion applies.

## Mount correction and ensemble clearance

The inherited plan mount `[-3.364,-1.394]` sits inside the bakery shed near its back wall and is poor external wayfinding. The accepted mount uses the bakery's west exterior wall:

- court-local entity origin `[-6.13,1.4]`;
- relative yaw π, so the arm extends west/outward and the double-sided board faces along ±court-Z; one loaf face points toward the hearth approach;
- transformed sign x extent `[-6.83,-6.10]` touches the bakery west exterior surface at x=-6.10 without penetrating it;
- z extent `[1.28,1.52]`; y extent `[1.85,2.45]`, below the roof and outside head-clear travel lanes;
- 0.25m clear of the reviewed bakery workbench, and well clear of both bakery aprons, cistern, forge, and shared yard circulation.

The proposed sign OBB clears every live commons-next entity and remains far inside the 112m rim.

## Highest-value finding

FIXED: the inherited sign was one-sided and mounted inside the bakery. The accepted double-sided sign is now attached to the exterior wall, readable from either court approach, and outside all circulation rectangles.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact repaired hash and corrected mount above. This is the fourth court-ensemble member; it remains unplaced until the smithy sign is reviewed-ready. No target-world mutation occurred during this review.
