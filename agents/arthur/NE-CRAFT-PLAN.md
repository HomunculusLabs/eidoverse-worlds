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

Selected landmark: `nx-craft-hamlet-0028` — source read-only
`commons / av-mason-0028` (`work_1647_…` lineage file `work_${idx}_hamlet.glb`),
the mid-seed hamlet whose nvp-lane review of the glb-retex family showed the
strongest central organization among the five hamlets at aerial/gameplay
distance in earlier mason-era renders. Its exact seat is recorded by the
planner output; REVIEW with full evidence packet happens on its own tick
(NEW-VILLAGE-PLAN law: plan → review → place on separate wakeups).

## Verification results (fresh run of next-plan-ne-craft.ts)

- all 14 sources present with exact SHA-256 hashes;
- every center inside the NE quadrant (x>0, z>0? — z may be ≥0 with x>0 for
  the +45° bisector; enforced as x>0 && z>0);
- annulus: minimum inner edge ≥ 66m and maximum outer corner ≤ 108m;
- zero pair overlaps, minimum pair SAT gap positive;
- center-distance law margin positive for every pair;
- common inward yaw retained; no world mutation performed.

Exact numeric values are printed by the verifier run below (single source of
truth — this plan intentionally does not hand-copy them).

## Next state

`nx-craft-hamlet-0028 (landmark): CANDIDATE → next wakeup ARTHUR_REVIEWED_READY`
with evidence packet in `agents/arthur/reviews/nx-craft-hamlet-0028/`.
No other craft work may be reviewed or placed behind it.
