# nx-cultivation-orchard-0046 — REVIEW (nvp-28, Mode B)

Subject: NW Cultivation supporting orchard #3 (district rank 3 of 5, per the
nvp-23 selection rationale — "clear silhouette but weaker central
organization"). One review subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeOrchard` (index 1666,
  rng(1667), theme `THEMES[1666 % L]` = orchard) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1666_orchard.glb`
- Determinism: probe rebuilt the single work twice from source modules — both
  runs byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `ec93dc09acc0ddfa56e817ec3f311d4680c88e097cc1e34fada1e437a96783fd`
- Commons manifest pin: `ec93dc09acc0ddfa` — match. Families:
  timber/stone/plaster/iron.
- Commons source entity read fresh via committed census harness:
  lib `store/ec93dc09acc0ddfa.glb`, comp bag EMPTY. Target id
  `nx-cultivation-orchard-0046` confirmed ABSENT from commons-next.

## Structure

- File: 476,940 bytes; GLB nodes 5 / draw meshes 4 (reviewStats: 14.7716 ×
  4.5400 × 14.5481m).
- Composition: quincunx 9×9 lattice = 41 trees with understory and fruit;
  outdoor auto-trimesh collider class (>16 m²).
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: reads immediately as an orchard — broad olive canopy wall on
  clean trunks, understory cones grounding the floor.
- Aerial/top: five visible column arcs of stacked canopies with readable
  inter-column aisles; rhythm is somewhat softer than siblings (the nvp-23
  "weaker central organization" note) but still organized, not noise.
- Night: quiet coherent non-emissive mass; no floating geometry.
- Back-view darkness: known family/rig characteristic (skill law added last
  tick after cross-checking against accepted siblings) — not re-flagged.

## Highest-value finding

No blocking defect. The inherited rank-3 characterization stands: central
columns lean slightly and canopy clusters read a touch lumpier than 0012's
regular double rows — acceptable for a supporting work seated away from both
the landmark terminus and the core approach axis. One-work-one-defect law:
polishing canopy lean here would spend the district's variation budget on a
non-blocking nuance. Verdict: accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=88.621635,
  t=27.516932` → world x −43.205814584, z 82.188872132), yaw 2.35619449,
  scale 1.
- Annulus law: inner corner 83.913619m ≥ 66; outer corner 102.169013m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.705155m
  (av-mason-0059), +0.709918m (0058), +0.781448m (0045). District-wide
  minimum remains 0.693322m (0040–0053) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.041268072595556725.

## Evidence

- `agents/arthur/reviews/nx-cultivation-orchard-0046/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-orchard-0046-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-orchard-0046 +
sha256 ec93dc09acc0ddfa56e817ec3f311d4680c88e097cc1e34fada1e437a96783fd +
pos [-43.205814584, 0.041268072595556725, 82.188872132] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple; no other ring work may be
reviewed or placed behind it.
