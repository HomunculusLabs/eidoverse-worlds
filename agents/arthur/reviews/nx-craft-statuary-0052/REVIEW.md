# nx-craft-statuary-0052 — REVIEW (nvp-60, Mode B)

Subject: NE Craft statuary #4 of 4 — FINAL statuary. One review subject this
tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeStatuary` (index
  1672, rng(1673), theme `THEMES[1672 % L]` = statuary) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1672_statuary.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `8c560202486fa0cd9028b111d18711c2896c51841bff97c951b846fbb9e3ddf5`
- Commons manifest pin: `8c560202486fa0cd` — match. Families:
  timber/stone/plaster/iron.
- Composition: same composer as accepted siblings 0026/0005/0039 — 12
  figures processional + border plinth ring + rubble; symmetric square court.
- Commons source entity read fresh via committed census harness:
  lib `store/8c560202486fa0cd.glb`, comp bag EMPTY. Target id
  `nx-craft-statuary-0052` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 11.84 × 1.8363 × 11.84m (statuary family twin); 5 GLB
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
accept as-is for its θ=63° seat closing the statuary arc. With placement
next tick the STATUARY FAMILY completes 4/4 and hamlets begin per the
planner slot order.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`θ=63°, R=74` →
  world x 33.595297, z 65.934483), yaw −2.35619449, scale 1; row-count
  asserted (=14) before computing.
- Annulus law: inner corner 66.648832m ≥ 66; outer corner 81.548261m ≤ 108.
- Rotated-SAT vs all 13 other exact district seats: nearest neighbors
  +3.039636m (av-mason-0041), +6.8551m (0054); district minimum 0.155675m
  unchanged — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = −0.024298703471806356.

## Evidence

- `agents/arthur/reviews/nx-craft-statuary-0052/contact-sheet.jpg` and frame
  set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-craft-statuary-0052-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-craft-statuary-0052 +
sha256 8c560202486fa0cd9028b111d18711c2896c51841bff97c951b846fbb9e3ddf5 +
pos [33.595297, -0.024298703471806356, 65.934483] yaw −2.35619449 scale 1.
NEXT WAKEUP: place only this exact tuple. With it, STATUARY completes 4/4
and the lane advances to hamlets per the planner slot order.
