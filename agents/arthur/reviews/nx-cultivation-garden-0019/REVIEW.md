# nx-cultivation-garden-0019 — REVIEW (nvp-40, Mode B)

Subject: NW Cultivation garden #4 of 5. One review subject this tick; no
placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeGarden` (index 1639,
  rng(1640), theme `THEMES[1639 % L]` = garden) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1639_garden.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `d916f37355701255d870729d39cfa3ebe495d362978faf925190aeb34faae6af`
- Commons manifest pin: `d916f37355701255` — match. Families:
  timber/stone/plaster/iron.
- Composition: same composer as accepted siblings 0045/0058/0032 — three
  concentric hedge rings + scattered two-tone flowers inside r5.4m.
- Commons source entity read fresh via committed census harness:
  lib `store/d916f37355701255.glb`, comp bag EMPTY. Target id
  `nx-cultivation-garden-0019` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 10.8531 × 0.64 × 11.0694m (smallest footprint of the
  garden set); furniture-scale height → solid-box collider posture;
  grounded hedge spheres (centers y=0.32).
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: coherent low hedge band, gold/pale flower specks distributed
  through the interior; slightly narrower than siblings but reads identically
  as a deliberate planted bed.
- Aerial/top: concentric rings legible with an even flower spread between
  them; nothing floating or clipped.
- Night: quiet low mass, coherent.
- Support-resolver behavior consistent (placed siblings correctly abstained
  as non-walkable during terrain read).

## Highest-value finding

No blocking defect and none unique to this instance beyond the family notes
already on record. Most compact garden of the set with an even flower
spread — suited to its seat in the outer northeast arc beside the landmark.
Verdict: accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=100.985110,
  t=-11.113809` → world x −79.354255867, z 63.545330212), yaw 2.35619449,
  scale 1; row-count asserted (14) before computing (skill law 7).
- Annulus law: inner corner 95.747556m ≥ 66; outer corner 107.935200m ≤ 108
  (0.065m margin — comfortable, and no rim ambiguity this time).
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.760544m
  (av-mason-0033), +1.191422m (0032); district minimum remains 0.653458m
  (0027–0040) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.03701553556368211.

## Evidence

- `agents/arthur/reviews/nx-cultivation-garden-0019/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-garden-0019-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-garden-0019 +
sha256 d916f37355701255d870729d39cfa3ebe495d362978faf925190aeb34faae6af +
pos [-79.354255867, 0.03701553556368211, 63.545330212] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple; no other ring work may be
reviewed or placed behind it.
