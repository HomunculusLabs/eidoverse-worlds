# nx-cultivation-garden-0058 — REVIEW (nvp-36, Mode B)

Subject: NW Cultivation garden #2 of 5. One review subject this tick; no
placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeGarden` (index 1678,
  rng(1679), theme `THEMES[1678 % L]` = garden) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1678_garden.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `e54ee386f08a7c21c4abf92a4db15224c08717a4befaf08943948954cb8b8111`
- Commons manifest pin: `e54ee386f08a7c21` — match. Families:
  timber/stone/plaster/iron.
- Composition: same composer as accepted sibling 0045 — three concentric
  hedge rings + scattered two-tone flowers inside r5.4m; this instance's rng
  yields a slightly wider flower spread and more outward seedlings.
- Commons source entity read fresh via committed census harness:
  lib `store/e54ee386f08a7c21.glb`, comp bag EMPTY. Target id
  `nx-cultivation-garden-0058` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 11.4078 × 0.64 × 10.8951m; 6 GLB nodes / draws per
  reviewStats; furniture-scale height → solid-box collider posture;
  grounded (hedge centers y=0.32 on r≈0.32 spheres).
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: coherent low hedge mound band with gold/pale flower specks;
  several seedlings poke past the outer ring — livelier edge than 0045,
  reads as intentional garden sprawl, not damage.
- Aerial/top: concentric rings legible, flowers distributed between rings;
  nothing floating or clipped.
- Night: quiet low mass, coherent.

## Live-behavior observation (noted, not blocking)

While reading terrain at the slot, the headless support resolver logged
"support seam on nx-cultivation-garden-0045 — uneven top (lie 0.16m)
without a usable grid — abstaining, no box": the just-placed sibling's
bumpy hedge tops are correctly NOT treated as walkable ground by bodies.
Expected physics posture for furniture-scale bumpy flora; walkers route
around it (12m+ gaps to any neighbor). No action needed.

## Highest-value finding

No blocking defect, and none unique to this instance beyond sibling 0045's
already-recorded family notes ("parterre" label over-promise, ring-and-
scatter truth). Slightly looser outer-ring boundary than 0045 gives it a
wilder character — fine for its seat in the mid arc beside orchard 0046.
Verdict: accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=89.077833,
  t=13.853542` → world x −53.224217316, z 72.691689056), yaw 2.35619449,
  scale 1.
- Annulus law: inner corner 83.926254m ≥ 66; outer corner 96.409936m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.709918m
  (av-mason-0046), +0.729578m (0045), +0.824323m (0033); district minimum
  remains 0.653458m (0027–0040) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.03137989008033212.

## Evidence

- `agents/arthur/reviews/nx-cultivation-garden-0058/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-garden-0058-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-garden-0058 +
sha256 e54ee386f08a7c21c4abf92a4db15224c08717a4befaf08943948954cb8b8111 +
pos [-53.224217316, 0.03137989008033212, 72.691689056] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple; no other ring work may be
reviewed or placed behind it.
