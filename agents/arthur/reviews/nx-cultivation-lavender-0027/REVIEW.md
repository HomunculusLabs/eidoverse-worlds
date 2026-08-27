# nx-cultivation-lavender-0027 — REVIEW (nvp-44, Mode B)

Subject: NW Cultivation lavender #1 of 4 (inner soft edge of the district
per the nvp-23 layout law). One review subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeLavender` (index
  1647, rng(1648), theme `THEMES[1647 % L]` = lavender) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1647_lavender.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `d4ab74d0d530b4a89ff37b466c936cb863819b9cc44a49b993bd28919c824819`
- Commons manifest pin: `d4ab74d0d530b4a8` — match. Families:
  timber/stone/plaster/iron.
- Composition: 14 rows × 40 plants = ~560 low lavender bushes; very low
  flat strip (0.48m tall, 19.89 × 12.07m — widest work in the district).
- Commons source entity read fresh via committed census harness:
  lib `store/d4ab74d0d530b4a8.glb`, comp bag EMPTY. Target id
  `nx-cultivation-lavender-0027` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 19.8864 × 0.4816 × 12.0683m; furniture-scale height →
  solid-box collider posture; grounded bush bases at grade.
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: reads immediately as a planted lavender field — dense dark
  violet-grey mound rows with pale flower tips glinting along each row;
  strong furrow rhythm from this angle.
- Aerial/top: fourteen clean parallel rows legible as dashed lines; even
  spacing; no breaks or bare patches.
- Night: quiet low mass; coherent.
- Honest color note: after the lift-99 family pass the bushes render
  violet-GREY rather than saturated purple lavender. Recorded as a family
  texture truth, not a defect — it still distinguishes clearly from the
  olive orchard canopies and dark green garden hedges.

## Highest-value finding

No blocking defect. The grey-leaning tone is the honest family-texture read
(consistent across all four lavender works); its identity as a rowed field
is unmistakable from any angle. Well suited to the inner soft edge next to
orchard 0040 and orchard 0020. Verdict: accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=72.176004,
  t=-4.061642` → world x −53.907189114, z 48.166349585), yaw 2.35619449,
  scale 1; row-count asserted (14) before computing.
- Annulus law: inner corner 66.405026m ≥ 66 (this is the tightest inner-edge
  seat in the district — matches the planner's recorded minInnerEdge
  66.403942m exactly); outer corner 79.455096m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.653458m
  (av-mason-0040), +0.693138m (0020); candidate sits AT the district minimum
  pair gap — planned by design (the planner's own minPairGap is this exact
  pair), not a reduction of any existing margin.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.02563520209327475.

## Evidence

- `agents/arthur/reviews/nx-cultivation-lavender-0027/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-lavender-0027-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-lavender-0027 +
sha256 d4ab74d0d530b4a89ff37b466c936cb863819b9cc44a49b993bd28919c824819 +
pos [-53.907189114, 0.02563520209327475, 48.166349585] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple; no other ring work may be
reviewed or placed behind it.
