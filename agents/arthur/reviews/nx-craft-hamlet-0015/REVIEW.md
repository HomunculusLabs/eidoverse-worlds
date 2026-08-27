# nx-craft-hamlet-0015 — REVIEW (nvp-64, Mode B)

Subject: NE Craft hamlet #2 of 5. One review subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeHamlet` (index 1635,
  rng(1636), theme `THEMES[1635 % L]` = hamlet) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1635_hamlet.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `353dd6fbcf5215c3897dd4ec5846d903861890a53e4c4b137b20a466280dcca0`
- Commons manifest pin: `353dd6fbcf5215c3` — match. Families:
  timber/stone/plaster (3-family build).
- Composition: 3 cottages around a green (well + firepit), same composer as
  accepted sibling 0007.
- Commons source entity read fresh via committed census harness:
  lib `store/353dd6fbcf5215c3.glb`, bbox 13.953 × 13.177 × 13.416m
  (min y −7.507: buried foundation like 0007), comp bag = `particles` embers
  `{preset:embers, origin:[2.2,0.35,1.2], count:40, size:0.25, speed:0.4}` —
  same firepit recipe as 0007. Target id `nx-craft-hamlet-0015` confirmed
  ABSENT from commons-next.

## Structure

- ReviewStats bounds: 13.9531 × 13.1768 × 13.4156m; 5 GLB nodes; building
  height, buried-foundation class like 0007.
- Component contract: MANDATORY embers comp restore bound to the placement
  placer (same payload as 0007).

## Visual audit (true-grade renders via fixed review-model-grade.ts)

The grade variant was generalized this tick: the hard-coded 0007 drop
constant is replaced by keep-authored-y semantics (commons seats buried-
foundation models at entity pos y=0 WITHOUT grounding). All 0015 frames
regenerated at true grade.

- Gameplay 18m: reads as a small settlement — three cottages around a green,
  well and firepit legible, lantern lights on.
- Aerial/top: arrangement organized, roofs and walls intact at grade, stepping
  stones present; no floaters above grade.
- Night: coherent dark mass with warm firepit/lantern glints.

## Highest-value finding

No blocking defect at true grade. The grade-variant generalization (drop
constant → authored-y semantics) is the tick's pipeline improvement, banked
for remaining building-height works. Verdict: accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`θ=26°, R=88` →
  world x 79.285079, z 38.519433), yaw −2.35619449, scale 1; row-count
  asserted (=14) before computing.
- Annulus law: inner corner 79.787442m ≥ 66; outer corner 97.020301m ≤ 108.
- Rotated-SAT vs all 13 other exact district seats: nearest neighbors
  +0.543633m (av-mason-0026 — the placed landmark), +1.472943m (0016);
  district minimum 0.155675m unchanged — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = −0.019683875057015642.

## Evidence

- `agents/arthur/reviews/nx-craft-hamlet-0015/contact-sheet.jpg` and frame
  set in the same directory (true-grade renders)
- rebuild prover: `agents/arthur/assets/mkv3-craft-hamlet-0015-probe.ts`
- true-grade render variant (generalized): `agents/arthur/review-model-grade.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-craft-hamlet-0015 +
sha256 353dd6fbcf5215c3897dd4ec5846d903861890a53e4c4b137b20a466280dcca0 +
pos [79.285079, -0.019683875057015642, 38.519433] yaw −2.35619449 scale 1,
WITH mandatory embers comp restore (origin [2.2,0.35,1.2], count 40,
size 0.25, speed 0.4) in the placement placer. NEXT WAKEUP: place only this
exact tuple; no other craft work may be reviewed or placed behind it.
