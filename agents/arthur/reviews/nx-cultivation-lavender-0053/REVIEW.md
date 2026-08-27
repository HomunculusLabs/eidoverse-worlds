# nx-cultivation-lavender-0053 — REVIEW (nvp-48, Mode B)

Subject: NW Cultivation lavender #3 of 4 (inner soft edge). One review
subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeLavender` (index
  1673, rng(1674), theme `THEMES[1673 % L]` = lavender) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1673_lavender.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `d8fac6d1e0279f07742fb72cf858cebb13015f54d661dd286e5c6f19a27e003a`
- Commons manifest pin: `d8fac6d1e0279f07` — match. Families:
  timber/stone/plaster/iron.
- Composition: same composer as accepted siblings 0027/0040 — 14 rows × 40
  plants; low flat strip 19.8886 × 12.0649m.
- Commons source entity read fresh via committed census harness:
  lib `store/d8fac6d1e0279f07.glb`, comp bag EMPTY. Target id
  `nx-cultivation-lavender-0053` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 19.8886 × 0.4816 × 12.0649m; furniture-scale height →
  solid-box collider posture; grounded bush bases at grade.
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: dense rowed lavender field, strong furrow rhythm, pale tips
  on every row.
- Aerial/top: fourteen clean parallel dashed lines, even spacing, no breaks,
  bare patches, or clumping.
- Night: quiet low mass; coherent.
- Family texture note (violet-grey) applies verbatim from the recorded
  lavender reviews.

## Highest-value finding

No blocking defect and none unique beyond family notes. Verdict: accept
as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=72.170355,
  t=37.064199` → world x −24.825469984, z 77.242548616), yaw 2.35619449,
  scale 1; row-count asserted (14) before computing.
- Annulus law: inner corner 71.487315m ≥ 66; outer corner 91.248856m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.693322m
  (av-mason-0040), +1.167056m (0059); district minimum remains 0.653458m
  (0027–0040, both placed and live) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.03635458301689514.

## Evidence

- `agents/arthur/reviews/nx-cultivation-lavender-0053/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-lavender-0053-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-lavender-0053 +
sha256 d8fac6d1e0279f07742fb72cf858cebb13015f54d661dd286e5c6f19a27e003a +
pos [-24.825469984, 0.03635458301689514, 77.242548616] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple; no other ring work may be
reviewed or placed behind it.
