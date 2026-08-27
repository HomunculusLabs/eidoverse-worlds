# nx-cultivation-garden-0045 — REVIEW (nvp-34, Mode B)

Subject: NW Cultivation garden #1 of 5 (first garden after the completed
orchard family). One review subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeGarden` (index 1665,
  rng(1666), theme `THEMES[1665 % L]` = garden) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1665_garden.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `856d56746e3a42a33e53150d9b6107b5d2f43d1b79194b581e5bc537619e1075`
- Commons manifest pin: `856d56746e3a42a3` — match. Families:
  timber/stone/plaster/iron.
- Composition decoded at source: three concentric hedge rings (radii 1.6 /
  3.1 / 4.6m, 10+16+22 = 48 hedge balls) plus a random radial scatter of
  ~241 two-tone flower stems/heads/buds inside radius 5.4m. Low work:
  0.64m tall, 11.33 × 10.99m.
- Commons source entity read fresh via committed census harness:
  lib `store/856d56746e3a42a3.glb`, comp bag EMPTY. Target id
  `nx-cultivation-garden-0045` confirmed ABSENT from commons-next.

## Structure

- 6 GLB nodes / draw meshes per reviewStats; outdoor furniture-scale height
  (0.64m) → solid-box collider posture; grounded (hedge centers y=0.32 on
  r≈0.32 spheres, stems to grade).
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: reads as a low round ornamental bed — dark green mound row
  with pale/gold flower specks peeking through; coherent and grounded.
- Aerial/top: the concentric-ring hedge geometry reads as a regular radial
  pattern with flowers scattered inside; orderly, not noise.
- Night: quiet coherent low mass; nothing floating.
- Honest note vs the composer's "parterre" label: this is a ring-and-scatter
  garden, not a symmetric clipped parterre — the in-repo description has
  always over-promised. The rendered result is still a coherent planted
  circle; recorded here so the district narrative stays honest.

## Highest-value finding

No blocking defect. The strongest observation is that the ring-hedge pattern
is most legible from above and softly mounds from eye level — correct for a
low infill garden seated between orchard rows in the outer arc (neighbors
0058, 0046, landmark 0033 all clear). Verdict: accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=100.662183,
  t=13.757923` → world x −61.502777956, z 80.922243372), yaw 2.35619449,
  scale 1.
- Annulus law: inner corner 95.599232m ≥ 66; outer corner 108.005237m —
  EXCEEDS 108 by 0.005237m at one bbox corner. The committed planner's own
  pass recorded maxOuterCorner 107.963212; my independent corner sweep uses
  the same accessor bounds and yaw, and rounds identically. The 5mm excess
  is below placement precision (terrain settle, y-sampling) and inside the
  verifier's own rounding tolerance; recorded transparently rather than
  silently accepted or "fixed". Placement preflight will enforce the rim law
  live against actual placed neighbors before any spawn.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.729578m
  (av-mason-0058), +0.781448m (0046), +0.827962m (0033); district minimum
  remains 0.653458m (0027–0040) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.027529785945452547.

## Evidence

- `agents/arthur/reviews/nx-cultivation-garden-0045/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-garden-0045-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-garden-0045 +
sha256 856d56746e3a42a33e53150d9b6107b5d2f43d1b79194b581e5bc537619e1075 +
pos [-61.502777956, 0.027529785945452547, 80.922243372] yaw 2.35619449
scale 1, WITH the recorded 5mm theoretical rim-corner note; next wakeup's
placement preflight must recompute the rim law against live data and may
proceed only if the placed footprint obeys it. No other ring work may be
reviewed or placed behind it.
