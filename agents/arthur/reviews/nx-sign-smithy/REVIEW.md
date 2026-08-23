# nx-sign-smithy model review — nvp-15

Reviewed: 2026-08-23T16:37:20Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-sign-smithy` — smithy blade sign
- Source: `agents/arthur/assets/mkv3-signs11.ts` (smithy section)
- Output: `agents/arthur/assets/village_sign_smithy.glb`
- SHA-256: `d8df94003084af390e4f6ef0e15f5d13ade33f8e98ad101b7b0408a9dda577e0`
- Corrected court-local mount: `[6.13,0,-1.4]`
- Proposed pose: `pos [23.777264390384975,-1.5946487083102603e-8,-10.831474824789108], yaw -0.90756, scale 1`
- The sign shares the reviewed court base-y rather than independent terrain y (`-0.0027182` at this x/z), preserving exact wall attachment. Authored geometry hangs at y=1.85–2.45.

## Rebuild and structure

- Two consecutive final rebuilds were byte-identical at the full SHA-256 above.
- File size: 38,572 bytes; three embedded texture images.
- Bounds: min `[-0.03,1.85,-0.12]`, max `[0.70,2.45,0.12]`, size `[0.73,0.60,0.24]` metres.
- Final GLB census: four model nodes / four draw meshes.
- Materials: iron, `sign_bone`, `sign_handle`, plus flat timber board bucket.
- Focused deep audit: four nodes; zero emissive materials; zero degenerate triangles; zero NaN vertices; zero unsupported floating clusters.
- Collider posture: furniture-scale elevated solid attached outside a wall.
- No component targets or inherited component bag exist.

## Visual review

Evidence: `agents/arthur/reviews/nx-sign-smithy/`

- Initial neutral-fill review showed a clear front hammer pictogram and plausible bracket/hangers, but the inherited back remained blank.
- nvp-15 applies the nvp-14 blade-sign law: explicit second bone face, mirrored hammer head/handle, and exported `sign_bone` / `sign_handle` / iron materials.
- Final front/back frames both read as smithy signs; right/left views preserve the blade-sign construction and hanging depth.
- `gameplay.png`: intentionally resolves on court approach, not as a distant landmark.
- `night.png`: non-emissive by design and dependent on court/forge illumination.
- No motion applies.

## Mount correction and ensemble clearance

The inherited plan anchor `[-3.729,-4.372]` is detached behind the bakery half of the court and does not identify the workshop or forge.

The accepted mount uses the workshop east exterior wall, behind the forge zone:

- court-local origin `[6.13,-1.4]`, court yaw unchanged;
- sign x extent `[6.10,6.83]` flush-touches the workshop east exterior surface at x=6.10 and extends outward;
- sign z extent `[-1.52,-1.28]`, y extent `[1.85,2.45]`, below the roof;
- reviewed forge occupies z `[0.90,2.287]`, leaving more than 2.18m separation;
- workshop aprons end at x=4.4, leaving 1.70m horizontal clearance;
- the double-sided board faces along ±court-Z, with one hammer face toward the hearth approach.

The proposed sign OBB clears every live commons-next entity and remains far inside the 112m rim.

## Highest-value finding

FIXED: the inherited smithy sign was one-sided and detached behind the wrong half of the court. The accepted double-sided sign mounts on the workshop exterior wall, clears the forge and circulation, and reads from either approach.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact repaired hash and corrected wall mount above. All five court-ensemble members are now independently reviewed-ready; the next wakeup may place them as the pre-declared atomic ensemble with corrected court smoke and forge embers. No target-world mutation occurred during this review.
