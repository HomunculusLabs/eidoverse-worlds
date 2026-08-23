# nx-shutters model review — nvp-18

Reviewed: 2026-08-23T17:16:28Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-shutters` — tower study half-open shutter satellite
- Source: `agents/arthur/assets/mkv3-shutters72.ts`
- Output: `agents/arthur/assets/village_shutters3.glb`
- SHA-256: `26259f89feb9273689f236f4b876d411d6f8d79873564e73f5a5fc5818d81181`
- Proposed pose: `pos [14.1,0,16.9], yaw -2.44347, scale 1` — exact shared tower origin.

## Rebuild and structure

- Two consecutive final rebuilds were byte-identical at the full SHA-256 above.
- File size: 36,084 bytes; two embedded texture images.
- Bounds: min `[-0.61643,4.0,2.74954]`, max `[0.3300,4.595,2.9280]`, size `0.94643 × 0.595 × 0.17846m`.
- Final census: two GLB model nodes / two draw meshes.
- Materials: village `timber` and `iron`.
- No named motion/light/socket anchors and no component bag.
- Focused deep audit: zero degenerate triangles and zero NaN vertices. The standalone audit reports four elevated clusters by design: this is a wall-mounted satellite authored at y≈4.3, and exact-hash composition evidence proves all four attach to the tower drum/window.
- Collider posture: tiny elevated attachment, not a room or ground prop.

## Highest-value defect and repair

The inherited “folded open” left leaf was modeled as 0.66m-deep radial blades. In the exact tower composition it projected from the drum like a small fence and did not read as a shutter folded flat against the round wall.

The source now:

- builds the left leaf with broad `0.27m` timber slats rather than depth blades;
- seats its center at local `[-0.48,4.3,2.79]`;
- rotates it `asin(-0.48/2.79) = -0.17290rad`, tangent to the round drum;
- gives it two rails and a full-height iron hinge;
- leaves the right `0.27m` leaf shut over the right half of the `0.60m` study window, with its pull ring intact.

The repair keeps the same two-draw material budget.

## Source/tower reconciliation

- Read-only `commons` source `av-shutters` carries the old hash and an empty component bag; `commons` remains untouched.
- Tower window source: center `[0,4.3,2.79]`, `0.60 × 0.75m`, +Z-facing.
- Revised shutter y-range `[4.0,4.595]` lies inside the 0.75m window height.
- Closed right leaf x-range `[0.02,0.29]` covers the right window half and remains just proud of the pane.
- Left open leaf x-range approximately `[-0.616,-0.344]`, outside the pane, with radial/tangent seating against the drum.
- Exact shared pose is mandatory; any independent offset or yaw returns both tower members to review.

## Visual review

Evidence:

- standalone: `agents/arthur/reviews/nx-shutters/contact-sheet.jpg`
- exact-hash composition: `agents/arthur/reviews/nx-tower-ensemble/contact-sheet.jpg`

Final tower-composition review confirms:

- the left broad leaf reads beside the window instead of projecting radially;
- the right leaf closes one half while the other half remains visible;
- hinge/rail construction is coherent at front and oblique views;
- back and side silhouettes add no stray detached geometry;
- gameplay view preserves the lived-in half-open study detail without competing with the tower landmark;
- the uncovered half-window remains a restrained night signal.

No blocking visual defect remains.

## Proposed-seat checks

The shutter micro-bounds lie wholly within the already reviewed tower envelope. Therefore the tower ensemble retains nvp-17's fresh seat proof:

- nearest live-field rotated-SAT clearance: 10.305m;
- farthest tower corner radius: 25.510m;
- local +Z faces the hearth with dot `0.999996`;
- terrain height at the shared seat is zero.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact repaired shutter hash and exact shared tower pose above. Both tower-ensemble members are now independently reviewed-ready; the next wakeup may place them atomically, restore the tower study socket, walk-test the door/ladder lane, and inspect the study/night silhouette. No target-world mutation occurred during nvp-18.
