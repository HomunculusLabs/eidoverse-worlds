# nx-core-paths model review — nvp-20

Reviewed: 2026-08-23T17:48:55Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-core-paths` — accepted-core approach paver network
- Source: `agents/arthur/assets/mkv3-next-core-paths.ts`
- Output: `agents/arthur/assets/village_next_core_paths.glb`
- Review manifest: `agents/arthur/assets/village_next_core_paths.review.json`
- SHA-256: `9ce1378d47fd8a227a6935704d750266e73c4e902781df905ae5da251307560c`
- Manifest SHA-256: `7a78419e12e7042a9b8fb90024468040b1f656469a981f5bfd1936c7989cf24b`
- Proposed pose: `pos [0,0,0], yaw 0, scale 1`

## Design contract

One sparse ground model connects only the accepted core seats:

- four short inner spokes from the hearth edge toward the cardinal lamps;
- NE route from the north lamp to the tower exterior-apron edge `[11.271765,13.529379]`;
- SE route from the east lamp to a deliberate fork at `[12.6,-6.8]`, then to the workshop and bakery exterior-apron edges `[17.447262,-9.350271]` and `[13.260704,-14.708697]`;
- NW route from the west lamp toward the carousel at `[-14.2,12.2]`;
- no branch enters the SW meadow.

The three continuing routes bypass their lamp posts laterally rather than running under them. The south spoke ends at its lamp because the SW arrival meadow stays open.

## Rebuild and structure

- Two consecutive final rebuilds were byte-identical at both hashes above.
- File size: 152,536 bytes; four embedded texture images.
- Bounds: min `[-14.6598,-0.00148,-15.1605]`, max `[17.9164,0.05750,13.9723]`, size `32.5762 × 0.05898 × 29.1328m`.
- Final GLB census: four model nodes / four draw meshes.
- Materials: four deterministic trodden-soil variants, merged by material.
- Review manifest: 75 exact pavers with center, yaw, width, depth and height.
- Paver y range straddles grade by at most 1.5mm and rises no more than 5.75cm: grounded, walkable, not a curb.
- No component targets or component bag.
- Collider posture: wide but extremely shallow trimesh ground dressing.

## Highest-value defects and repair cycle

The first top-down review found the outer branches stopped and restarted across 2m grass gaps at the north/east/west lamp seats. Without the lamp models in isolation, the routes read as disconnected debris.

The source now carries explicit lateral bypasses around each lamp, preserving a continuous stepping rhythm without placing pavers under posts.

A subsequent exact micro-SAT sweep found two technical near-collisions hidden by the visual pass:

- first east spoke paver overlapped the hearth envelope by 2cm;
- east/west/north lamp bypasses had sub-centimetre or 2cm clearances.

Final source starts all inner spokes at radius 4.8 and widens all continuing lamp bypasses to 1.0m. Final 75-paver micro-SAT against every live footprint reports zero overlaps and minimum clearance `0.179586m` to `nx-hearth`; lamp clearances are `0.237790m` east, `0.250373m` west, and `0.267279m` north.

## Visual review

Evidence: `agents/arthur/reviews/nx-core-paths/`.

- The general renderer gained `top.png` and `aerial.png` because four low horizon angles cannot honestly inspect a 5cm-tall network.
- Final top/aerial review shows four readable hearth spokes, three continuing routes, a clear SE fork, and no SW intrusion.
- Paver cadence varies subtly without becoming noisy; four soil materials remain subordinate to buildings and lamps.
- Gameplay view establishes a low stepping-stone rhythm rather than a raised road or scattered rubble.
- Night frame remains intentionally non-emissive; illumination comes from the reviewed cardinal lamps and core beacons.
- No motion applies.

## Endpoint and circulation checks

- Tower and both court endpoints terminate at the exterior edge of each reviewed 2m×1.5m apron, never at or inside a threshold.
- Exact paver micro-bounds clear every current model footprint.
- Pavers around each lamp leave >0.23m model clearance while keeping route gaps below normal walking stride.
- Entire asset lies inside radius 22.56m and far inside the 112m terrain rim.
- All authored routes stay inside the seed-8128 flat-radius ground except negligible bounds corners; paver height is fixed to the accepted near-zero core grade.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact hash and world-origin tuple above. Place on a later wakeup through a dedicated idempotent `commons-next` placer, then run MCPL walks from hearth approaches to tower, both court doors, and carousel. No target-world mutation occurred during nvp-20.
