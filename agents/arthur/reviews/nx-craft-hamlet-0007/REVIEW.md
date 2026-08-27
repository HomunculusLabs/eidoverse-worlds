# nx-craft-hamlet-0007 — REVIEW (nvp-62, Mode B)

Subject: NE Craft hamlet #1 of 5. One review subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeHamlet` (index 1687,
  rng(1688), theme `THEMES[1687 % L]` = hamlet) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1687_hamlet.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `e2f134cfba7f9e86c4068eeca6bcdf4a9476182973e850dd813a85c375daaa0f`
- Commons manifest pin: `e2f134cfba7f9e86` — match. Families:
  timber/stone/plaster/iron.
- Composition: 3 cottages around a green (well + firepit); hamlets are the
  first building-height works in a ring district.
- Commons source entity read fresh via committed census harness:
  lib `store/e2f134cfba7f9e86.glb`, bbox 13.854 × 13.080 × 13.293m
  (min y −7.569: a deep buried foundation), comp bag = `particles` embers
  `{preset:embers, origin:[2.2,0.35,1.2], count:40, size:0.25, speed:0.4}`.
  Target id `nx-craft-hamlet-0007` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 13.8539 × 13.0804 × 13.2930m; 5 GLB nodes / draws.
- IMPORTANT render discovery: unlike every cultivation work so far, this
  model's accessor bbox extends 7.57m BELOW zero. The first render pass
  (standard grounding at min.y=0) hoisted the buried foundation into view
  and made the hamlet read as wreckage. This lane's review pipeline ground
  the model at TRUE grade (drop = bbox min.y, as commons seats it) and
  re-rendered all frames: at true grade the hamlet reads correctly.
- Review-render variant with true-grade grounding:
  `agents/arthur/review-model-grade.ts` (kept for future building-height
  works — the standard min.y=0 grounding is only correct for grade-seated
  flora/flat works).

## Component contract (first building-height work)

- Commons source bag = `particles` embers, origin [2.2, 0.35, 1.2] (the
  firepit). PLACEMENT LAW: after spawn, the embers comp MUST be re-applied
  with this exact payload (re-place wipes comps). The placement placer for
  this subject must include the comp restore step.

## Visual audit (true-grade renders)

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: reads as a small settlement — three cottages around a green,
  well and firepit legible between them; window lantern lights visible.
- Aerial/top: cottages arranged around the green, roofs and walls intact at
  grade; stepping stones and lanterns present; no floaters above grade.
- Night: coherent dark mass with warm firepit/lantern glints.

## Highest-value finding

RENDER PIPELINE, not model defect: the standard review grounding
(min.y=0) is wrong for models with buried foundations. Fixed for this
review via the grade-drop variant; the variant is banked for all remaining
building-height craft works (hamlets, cloisters). Model itself: no blocking
defect at true grade. Verdict: accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`θ=10°, R=88` →
  world x 86.671814, z 15.480445), yaw −2.35619449, scale 1; row-count
  asserted (=14) before computing.
- Annulus law: inner corner 78.701034m ≥ 66; outer corner 97.515199m ≤ 108.
- Rotated-SAT vs all 13 other exact district seats: nearest neighbors
  +3.630586m (av-mason-0008 cloister), +3.897651m (0005); district minimum
  0.155675m unchanged.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = −0.01918958686956854.

## Evidence

- `agents/arthur/reviews/nx-craft-hamlet-0007/contact-sheet.jpg` and frame
  set in the same directory (true-grade renders)
- rebuild prover: `agents/arthur/assets/mkv3-craft-hamlet-0007-probe.ts`
- true-grade render variant: `agents/arthur/review-model-grade.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-craft-hamlet-0007 +
sha256 e2f134cfba7f9e86c4068eeca6bcdf4a9476182973e850dd813a85c375daaa0f +
pos [86.671814, -0.01918958686956854, 15.480445] yaw −2.35619449 scale 1,
WITH mandatory embers comp restore (origin [2.2,0.35,1.2], count 40,
size 0.25, speed 0.4) in the placement placer. NEXT WAKEUP: place only this
exact tuple; no other craft work may be reviewed or placed behind it.
