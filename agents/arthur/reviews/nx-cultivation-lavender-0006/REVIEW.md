# nx-cultivation-lavender-0006 — REVIEW (nvp-50, Mode B)

Subject: NW Cultivation lavender #4 of 4 — FINAL district work. One review
subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeLavender` (index
  1686, rng(1687), theme `THEMES[1686 % L]` = lavender) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1686_lavender.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `26f0eed96a94e0d2deac052aa7dee8578134d4f1990ee34edd51eed668ef7afa`
- Commons manifest pin: `26f0eed96a94e0d2` — match. Families:
  timber/stone/plaster/iron.
- Composition: same composer as accepted siblings 0027/0040/0053 — 14 rows ×
  40 plants; low flat strip 19.8850 × 12.0643m.
- Commons source entity read fresh via committed census harness:
  lib `store/26f0eed96a94e0d2.glb`, comp bag EMPTY. Target id
  `nx-cultivation-lavender-0006` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 19.8850 × 0.4816 × 12.0643m; furniture-scale height →
  solid-box collider posture; grounded bush bases at grade.
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: dense rowed lavender field, strong furrow rhythm, pale tips
  along every row; identical in character to accepted siblings.
- Aerial/top: fourteen clean parallel dashed lines, even spacing, no breaks,
  bare patches, or clumping.
- Night: quiet low mass; coherent.
- Family texture note (violet-grey) applies verbatim.

## Highest-value finding

No blocking defect and none unique beyond family notes. Verdict: accept
as-is. With placement next tick the ENTIRE NW Cultivation district completes
14/14 (orchards 5/5, gardens 5/5, lavender 4/4).

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=70.014900,
  t=-35.078289` → world x −74.311739752, z 24.706417735), yaw 2.35619449,
  scale 1; row-count asserted (14) before computing.
- Annulus law: inner corner 68.744318m ≥ 66; outer corner 88.374891m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.814471m
  (av-mason-0020), +4.580634m (0012); district minimum remains 0.653458m
  (placed 0027–0040 pair) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = −0.012819972711928234.

## Evidence

- `agents/arthur/reviews/nx-cultivation-lavender-0006/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-lavender-0006-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-lavender-0006 +
sha256 26f0eed96a94e0d2deac052aa7dee8578134d4f1990ee34edd51eed668ef7afa +
pos [-74.311739752, -0.012819972711928234, 24.706417735] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple. With it, the ENTIRE NW
CULTIVATION DISTRICT COMPLETES 14/14 and a district-level completion audit
(occupancy + sweep + composition) becomes the natural next lane milestone.
