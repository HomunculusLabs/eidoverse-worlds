# nx-cultivation-orchard-0059 — REVIEW (nvp-30, Mode B)

Subject: NW Cultivation supporting orchard #4 (district rank 4 of 5, per the
nvp-23 selection rationale — "coherent low canopy, less landmark authority").
One review subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeOrchard` (index 1679,
  rng(1680), theme `THEMES[1679 % L]` = orchard) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1679_orchard.glb`
- Determinism: probe rebuilt the single work twice from source modules — both
  runs byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `8d3959f01e32c335c290d94b46da3551d45d55e624805c2c36638fa851f1672f`
- Commons manifest pin: `8d3959f01e32c335` — match. Families:
  timber/stone/plaster/iron.
- Commons source entity read fresh via committed census harness:
  lib `store/8d3959f01e32c335.glb`, comp bag EMPTY. Target id
  `nx-cultivation-orchard-0059` confirmed ABSENT from commons-next.

## Structure

- File: reviewStats bounds 14.6445 × 4.6109 × 14.4455m; 5 GLB nodes /
  4 draw meshes.
- Composition: quincunx 9×9 lattice = 41 trees with understory and fruit;
  outdoor auto-trimesh collider class (>16 m²).
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: reads as a coherent orchard — broad connected canopy band on
  tall slim trunks, uniform height rhythm, understory cones and fruit cues
  grounding the floor. The nvp-23 "less landmark authority" note is fair: no
  single anchor tree or aisle, an even canopy wall throughout — exactly what
  a supporting work should be, seated away from the approach terminus.
- Aerial/top: six quincunx columns clearly readable, spacing regular,
  inter-column aisles clean.
- Night: quiet coherent non-emissive mass, nothing floating.
- Back-view darkness: known family/rig characteristic (skill law) — not
  re-flagged.

## Highest-value finding

No blocking defect. Even canopy wall without a focal element caps this work's
authority below its siblings — acceptable at a rank-4 seat on the district's
outer north arc where it reads as pure background cultivation texture.
Verdict: accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=86.667822,
  t=42.978943` → world x −30.841783310, z 91.622432800), yaw 2.35619449,
  scale 1.
- Annulus law: inner corner 86.947152m ≥ 66; outer corner 106.387608m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.705155m
  (av-mason-0046), +1.167056m (0053). District-wide minimum remains
  0.693322m (0040–0053) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = −0.0002733106081673675.

## Evidence

- `agents/arthur/reviews/nx-cultivation-orchard-0059/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-orchard-0059-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-orchard-0059 +
sha256 8d3959f01e32c335c290d94b46da3551d45d55e624805c2c36638fa851f1672f +
pos [-30.841783310, -0.0002733106081673675, 91.622432800] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple; no other ring work may be
reviewed or placed behind it.
