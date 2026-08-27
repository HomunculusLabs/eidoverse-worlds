# nx-cultivation-orchard-0012 — REVIEW (nvp-26, Mode B)

Subject: NW Cultivation supporting orchard #2 (district rank 2 of 5, per the
nvp-23 selection rationale — "tall and visible but visually busier at the
front edge"). One review subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeOrchard` (index 1692,
  rng(1693), theme `THEMES[1692 % L]` = orchard) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1692_orchard.glb`
- Determinism: probe rebuilt the single work twice from source modules — both
  runs byte-identical to the reference (`byteIdentical: true`), and the mason
  daemon's stop-file contract held ("stop file found — halting").
- SHA-256: `dc4d7059985e47a87aa3d50534748a51276b9be00afd1c92fb8b9ec82b03d0bb`
- Commons manifest pin: `dc4d7059985e47a8` — match.
- Families: timber/stone/plaster/iron → renders show one textured canopy
  family plus soil-grade detail; material hierarchy coherent.
- Commons source entity read fresh via committed census harness:
  lib `store/dc4d7059985e47a8.glb`, comp bag EMPTY. Target id
  `nx-cultivation-orchard-0012` confirmed ABSENT from commons-next.

## Structure

- File: 469,984 bytes; GLB nodes 4 / draw meshes 4; images 1; materials 1.
- Bounds: 14.5789 × 4.5733 × 14.9143 m (accessor-exact).
- Composition: quincunx 9×9 odd-parity lattice = 41 trees with understory
  tufts and fallen fruit. Collider class: outdoor auto-trimesh (>16 m²).
- Degenerate/floating: none observed in any frame; trunks meet grade;
  minY −0.049 is buried footing, not float.
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames: front/right/back/left daylight, top, aerial, 18m gameplay, night —
all regenerated fresh this tick plus contact sheet.

- Gameplay 18m: reads immediately as a deliberate tall orchard wall of
  canopies on visible trunks; understory cones ground it.
- Aerial/top: six-ish columns with regular spacing — the quincunx reads
  clearly from above; strong district-canopy texture from the core approach.
- Night: quiet non-emissive mass, coherent silhouette.
- Back/side darkness note: under the renderer's fixed key light any
  back-facing view shows near-black canopy faceting. Cross-checked against
  the ACCEPTED 0033 landmark rendered by the same rig — identical behavior.
  Verdict: rig/lighting characteristic shared by the whole retex family
  (single timber-family texture on low-poly icosahedra), not a defect
  introduced by or unique to this work; the approach face is fully lit.

## Highest-value finding

No blocking construction defect. The honest one-line weakness inherited from
the nvp-23 ranking stands: at 18m the continuous double-canopy rows are
busier than the landmark's disciplined aisle form — which is exactly why it
is a SUPPORTING work seated away from the approach terminus, not the
landmark. Duplicating the landmark aisle treatment here would erase the
district's figure-ground distinction. Verdict: accept as-is.

## Proposed pose (numeric checks)

- pos [-88.7346892568504, heightAt, 35.79681905684085], yaw 2.35619449, scale 1
- Slot algebra re-derived from the committed planner table matches exactly.
- Annulus law: inner corner 86.094342m ≥ 66; outer corner 105.510276m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbor gap
  +0.783827m (av-mason-0020); full-district minimum remains 0.653458m
  (0027–0040) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.019921379876134182.
- Approaches: slot sits well off the 135° bisector approach lane that
  terminates at the 0033 landmark; nothing between core edge and seat.

## Evidence

- `agents/arthur/reviews/nx-cultivation-orchard-0012/contact-sheet.jpg`
- same directory: front/right/back/left/top/aerial/gameplay/night.png
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-orchard-0012-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-orchard-0012 +
sha256 dc4d7059985e47a87aa3d50534748a51276b9be00afd1c92fb8b9ec82b03d0bb +
pos [-88.7346892568504, 0.019921379876134182, 35.79681905684085] yaw
2.35619449 scale 1. NEXT WAKEUP: place only this exact tuple; no other ring
work may be reviewed or placed behind it.
