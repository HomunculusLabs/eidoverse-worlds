# nx-craft-statuary-0026 — REVIEW (nvp-54, Mode B)

Subject: NE Craft district LANDMARK. First review subject of the second
district. One review subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeStatuary` (index
  1646, rng(1647), theme `THEMES[1646 % L]` = statuary) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1646_statuary.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `ba69e7158262698aff10603075c6ea7f174648242a729ebc6ebf86224bb22145`
- Commons manifest pin: `ba69e7158262698a` — match. Families:
  timber/stone/plaster/iron.
- Composition: statuary court, 12 figures (processional center + border),
  bounded by a ring of plinth blocks and scattered rubble pebbles.
- Commons source entity read fresh via committed census harness:
  lib `store/ba69e7158262698a.glb`, comp bag EMPTY. Target id
  `nx-craft-statuary-0026` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 11.84 × 1.8364 × 11.84m; 5 GLB nodes / 4 draws;
  symmetric court on a square footprint; furniture-scale height → solid-box
  collider posture; grounded figure bases at grade.
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: reads immediately as a ceremonial statuary court — a row of
  tall stone figures with sphere-and-finial tops rising above a dotted border
  ring; silhouette has genuine landmark authority against sky.
- Aerial/top: figures arranged in an inner arc with the processional line
  reading through the court center; border plinths form a clean broken ring;
  no floaters or missing elements.
- Night: quiet coherent dark mass, figure tops still distinct against sky.

## Highest-value finding

No blocking construction defect. One honest observation recorded: figure
heights vary slightly stepwise (two height classes across the twelve), which
reads as intentional processional hierarchy rather than error. Verdict:
accept as-is for its landmark seat on the NE bisector.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`θ=33°, R=74` →
  world x 62.061622, z 40.303289), yaw −2.35619449, scale 1; row-count
  asserted (=14) before computing (skill law 7).
- Annulus law: inner corner 67.133561m ≥ 66; outer corner 81.14968m ≤ 108.
- Rotated-SAT vs all 13 other exact district seats: nearest neighbors
  +0.543633m (av-mason-0015 hamlet), +3.066578m (0028); district minimum
  0.155675m unchanged — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = −0.033680292362306775.

## Evidence

- `agents/arthur/reviews/nx-craft-statuary-0026/contact-sheet.jpg` and frame
  set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-craft-statuary-0026-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-craft-statuary-0026 +
sha256 ba69e7158262698aff10603075c6ea7f174648242a729ebc6ebf86224bb22145 +
pos [62.061622, -0.033680292362306775, 40.303289] yaw −2.35619449 scale 1.
NEXT WAKEUP: place only this exact tuple; no other craft work may be reviewed
or placed behind it.
