# nx-cultivation-garden-0032 — REVIEW (nvp-38, Mode B)

Subject: NW Cultivation garden #3 of 5. One review subject this tick; no
placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeGarden` (index 1652,
  rng(1653), theme `THEMES[1652 % L]` = garden) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1652_garden.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `38e4718c5efd13749ea57027ad5216254d15266d99c2526b4aa9d1b8634566fe`
- Commons manifest pin: `38e4718c5efd1374` — match. Families:
  timber/stone/plaster/iron.
- Composition: same composer as accepted siblings 0045/0058 — three
  concentric hedge rings + scattered two-tone flowers inside r5.4m.
- Commons source entity read fresh via committed census harness:
  lib `store/38e4718c5efd1374.glb`, comp bag EMPTY. Target id
  `nx-cultivation-garden-0032` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 11.3491 × 0.64 × 11.2090m; furniture-scale height →
  solid-box collider posture; grounded hedge spheres (centers y=0.32).
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: coherent low hedge band with dense gold flower specks across
  the middle; tightest flower clustering of the three siblings — reads as a
  fuller, richer bed rather than noise.
- Aerial/top: concentric rings legible; flowers concentrated between the
  middle ring and center (this instance's rng draw) giving a seeded-heart
  look; nothing floating or clipped.
- Night: quiet low mass, coherent.

## Live-behavior observation (noted, not blocking)

Support resolver again correctly abstained on placed siblings 0058 and 0045
("uneven top… no box") while reading terrain at the slot — bumpy garden
tops are properly non-walkable for bodies. Consistent with last tick's
note; walkers route around via the wide inter-work gaps.

## Highest-value finding

No blocking defect. Densest interior flower fill of the sibling set gives
this instance the strongest color presence at eye level — well suited to
its seat near the district's outer east edge beside gardens 0045/0058 and
the landmark. Verdict: accept as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=101.258989,
  t=1.027643` → world x −70.894119993, z 72.469434032), yaw 2.35619449,
  scale 1; row-count asserted (14) before computing (skill law 7).
- Annulus law: inner corner 95.987520m ≥ 66; outer corner 107.312640m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +1.018828m
  (av-mason-0033), +1.191422m (0019); district minimum remains 0.653458m
  (0027–0040) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.0276505409363984.

## Evidence

- `agents/arthur/reviews/nx-cultivation-garden-0032/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-garden-0032-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-garden-0032 +
sha256 38e4718c5efd13749ea57027ad5216254d15266d99c2526b4aa9d1b8634566fe +
pos [-70.894119993, 0.0276505409363984, 72.469434032] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple; no other ring work may be
reviewed or placed behind it.
