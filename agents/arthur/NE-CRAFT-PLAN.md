# NE CRAFT DISTRICT PLAN — nvp-53

Status: `SLOTS_VERIFIED / LANDMARK ARTHUR_REVIEWED_READY / NO WORLD MUTATION`

Canonical verifier: `agents/arthur/next-plan-ne-craft.ts` (this lane)

## District geometry

NE Craft contains 14 inherited works from three themes:

- hamlet ×5: `av-mason-0007, -0015, -0028, -0041, -0054`
- cloister ×5: `av-mason-0008, -0016, -0029, -0042, -0055`
- statuary ×4: `av-mason-0005, -0026, -0039, -0052`

The coordinate frame mirrors the NW district law, rotated to the NE bisector
(+45°): radial basis `u = (+√½, +√½)`, tangent basis `v = (−√½, +√½)`,
world point `p = r·u + t·v`, common inward-facing yaw `−2.35619449 rad`
(facing the core). Y resolves through fresh `WorldAgent.heightAt(x,z)` at each
later review/place tick. Scale stays `1`.

This planner `agents/arthur/next-plan-ne-craft.ts` is the NE mirror of the
proven NW layout law (annulus [66,108], per-pair rotated SAT > 0,
center-distance law `.75·max(width)`) applied to the fourteen craft sources'
exact accessor bboxes.

## Landmark selection

Selected landmark: `nx-craft-statuary-0026` — source read-only
`commons / av-mason-0026` (`work_1646_statuary.glb`), seated at the district
bisector seat `pos [62.061622, heightAt, 40.303289]`, yaw −2.35619449, where
the core-to-district approach terminates. Its exact seat and hash are
recorded by the planner output (single source of truth).

## Verification results (fresh run of next-plan-ne-craft.ts)

- all 14 sources present with exact SHA-256 hashes;
- every center inside the NE quadrant;
- annulus: minimum inner edge `66.088276m` ≥ 66, maximum outer corner
  `106.988450m` ≤ 108;
- zero pair overlaps; minimum pair SAT gap `0.155675m`
  (av-mason-0041 vs av-mason-0029 — hamlet/cloister interleave);
- center-distance law margin positive for every pair;
- common inward yaw retained (cloisters +90° so their long axis follows the
  arc); no world mutation performed.

Polar scheme proven after four rejected solver iterations (the hand-(r,t)
tables violated rim or pair law — the failing values are preserved in git
history of this file's creation commit). The polar form places each work at
(θ, R) with cloister rotation so corner radii stay inside the band.

## Next state

Landmark candidate: `nx-craft-statuary-0026 → next wakeup ARTHUR_REVIEWED_READY`
with evidence packet in `agents/arthur/reviews/nx-craft-statuary-0026/`.
No other craft work may be reviewed or placed behind it.

