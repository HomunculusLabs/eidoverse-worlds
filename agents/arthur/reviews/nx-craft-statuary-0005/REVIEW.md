# nx-craft-statuary-0005 — REVIEW (nvp-56, Mode B)

Subject: NE Craft statuary #2 of 4. One review subject this tick; no
placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeStatuary` (index
  1685, rng(1686), theme `THEMES[1685 % L]` = statuary) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1685_statuary.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `dd0985508d0157c2d8c5a17af42978fe62964e7c375b2d219e4751996bdc9f7a`
- Commons manifest pin: `dd0985508d0157c2` — match. Families:
  timber/stone/plaster/iron.
- Composition: same composer as accepted landmark sibling 0026 — 12 figures
  processional + border plinth ring + rubble; symmetric square court.
- Commons source entity read fresh via committed census harness:
  lib `store/dd0985508d0157c2.glb`, comp bag EMPTY. Target id
  `nx-craft-statuary-0005` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 11.84 × 1.8363 × 11.84m (twin of 0026's footprint);
  5 GLB nodes / 4 draws; furniture-scale height → solid-box collider
  posture; grounded figure bases at grade.
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: identical ceremonial-court read to the accepted landmark —
  tall stone figures with sphere-finial tops over the dotted border ring;
  strong silhouette.
- Aerial/top: processional line and border ring both legible; no floaters or
  missing elements.
- Night: quiet dark mass, tops readable.

## Highest-value finding

No blocking defect and none unique beyond family notes on record. Verdict:
accept as-is for its θ=18° inner-arc seat at the district's low edge.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`θ=18°, R=74` →
  world x 70.378182, z 22.867258), yaw −2.35619449, scale 1; row-count
  asserted (=14) before computing.
- Annulus law: inner corner 66.088276m ≥ 66; outer corner 82.003204m ≤ 108.
- Rotated-SAT vs all 13 other exact district seats: nearest neighbors
  +3.897651m (av-mason-0007), +4.738107m (0015) — wide-open seat on the
  outer-northwest end of the statuary arc; district minimum 0.155675m
  unchanged.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = −0.026565256802728945.

## Evidence

- `agents/arthur/reviews/nx-craft-statuary-0005/contact-sheet.jpg` and frame
  set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-craft-statuary-0005-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-craft-statuary-0005 +
sha256 dd0985508d0157c2d8c5a17af42978fe62964e7c375b2d219e4751996bdc9f7a +
pos [70.378182, -0.026565256802728945, 22.867258] yaw −2.35619449 scale 1.
NEXT WAKEUP: place only this exact tuple; no other craft work may be reviewed
or placed behind it.
