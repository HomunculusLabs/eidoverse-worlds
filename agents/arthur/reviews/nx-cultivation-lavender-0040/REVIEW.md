# nx-cultivation-lavender-0040 — REVIEW (nvp-46, Mode B)

Subject: NW Cultivation lavender #2 of 4 (inner soft edge). One review
subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeLavender` (index
  1660, rng(1661), theme `THEMES[1660 % L]` = lavender) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1660_lavender.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `56b752abf7f5eba4b816b4afb535de02578b5b22147845aade0df057c35f1936`
- Commons manifest pin: `56b752abf7f5eba4` — match. Families:
  timber/stone/plaster/iron.
- Composition: same composer as accepted sibling 0027 — 14 rows × 40 plants;
  low flat strip 19.8896 × 12.0713m.
- Commons source entity read fresh via committed census harness:
  lib `store/56b752abf7f5eba4.glb`, comp bag EMPTY. Target id
  `nx-cultivation-lavender-0040` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 19.8896 × 0.4816 × 12.0713m; furniture-scale height →
  solid-box collider posture; grounded bush bases at grade.
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: dense rowed lavender field, unmistakable furrow rhythm; pale
  flower tips present along every row.
- Aerial/top: fourteen clean parallel dashed lines, even spacing, no breaks
  or bare patches — essentially identical in character to accepted 0027.
- Night: quiet low mass; coherent.
- Family texture note from 0027's review applies verbatim (violet-grey, not
  saturated purple) — consistent across the lavender set.

## Highest-value finding

No blocking defect and none unique beyond the recorded family notes. Verdict:
accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=72.460363,
  t=16.482309` → world x −39.582634215, z 62.891797921), yaw 2.35619449,
  scale 1; row-count asserted (14) before computing.
- Annulus law: inner corner 66.745598m ≥ 66; outer corner 82.825075m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.653458m
  (av-mason-0027 — already PLACED and live at its slot) and +0.693322m (0053).
  The candidate clears the LIVE neighbor 0027 by exactly the district minimum
  gap designed for this pair; nothing about the live state invalidates it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.04024847506294396.

## Evidence

- `agents/arthur/reviews/nx-cultivation-lavender-0040/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-lavender-0040-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-lavender-0040 +
sha256 56b752abf7f5eba4b816b4afb535de02578b5b22147845aade0df057c35f1936 +
pos [-39.582634215, 0.04024847506294396, 62.891797921] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple; no other ring work may be
reviewed or placed behind it.
