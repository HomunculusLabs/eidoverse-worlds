# nx-craft-statuary-0039 — REVIEW (nvp-58, Mode B)

Subject: NE Craft statuary #3 of 4. One review subject this tick; no
placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeStatuary` (index
  1659, rng(1660), theme `THEMES[1659 % L]` = statuary) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1659_statuary.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `61d7a70c8b530b83c261eceb959483a6f269bd77a176f1aebb860e04bcab2167`
- Commons manifest pin: `61d7a70c8b530b83` — match. Families:
  timber/stone/plaster/iron.
- Composition: same composer as accepted siblings 0026/0005 — 12 figures
  processional + border plinth ring + rubble; symmetric square court.
- Commons source entity read fresh via committed census harness:
  lib `store/61d7a70c8b530b83.glb`, comp bag EMPTY. Target id
  `nx-craft-statuary-0039` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 11.84 × 1.8364 × 11.84m (statuary family twin); 5 GLB
  nodes / 4 draws; furniture-scale height → solid-box collider posture;
  grounded figure bases at grade.
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: ceremonial-court read identical to accepted siblings;
  figure silhouette and border ring legible.
- Aerial/top: processional line and border ring clean; no floaters or
  missing elements.
- Night: quiet dark mass, tops readable.

## Highest-value finding

No blocking defect and none unique beyond family notes on record. Verdict:
accept as-is for its θ=48° mid-arc seat adjacent to hamlet 0028.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`θ=48°, R=74` →
  world x 49.515665, z 54.992717), yaw −2.35619449, scale 1; row-count
  asserted (=14) before computing.
- Annulus law: inner corner 68.009403m ≥ 66; outer corner 80.41708m ≤ 108.
- Rotated-SAT vs all 13 other exact district seats: nearest neighbors
  +1.550915m (av-mason-0028), +2.923507m (0041); district minimum 0.155675m
  unchanged — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = −0.0301676564610222.

## Evidence

- `agents/arthur/reviews/nx-craft-statuary-0039/contact-sheet.jpg` and frame
  set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-craft-statuary-0039-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-craft-statuary-0039 +
sha256 61d7a70c8b530b83c261eceb959483a6f269bd77a176f1aebb860e04bcab2167 +
pos [49.515665, -0.0301676564610222, 54.992717] yaw −2.35619449 scale 1.
NEXT WAKEUP: place only this exact tuple; no other craft work may be reviewed
or placed behind it.
