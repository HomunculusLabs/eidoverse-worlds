# nx-cultivation-orchard-0020 — REVIEW (nvp-32, Mode B)

Subject: NW Cultivation supporting orchard #5 (district rank 5 of 5, per the
nvp-23 selection rationale — "broad uniform roofline, weakest depth cue").
Final orchard of the district. One review subject this tick; no placement.

## Provenance and identity

- Source maker: `agents/arthur/assets/mason.ts` `composeOrchard` (index 1640,
  rng(1641), theme `THEMES[1640 % L]` = orchard) through the lift-99
  `masonretex.ts` family-pass + `mergeByMaterial` + `toGLB` pipeline.
- Output: `agents/arthur/mason/glb-retex/work_1640_orchard.glb`
- Determinism: probe rebuilt the single work from source modules —
  byte-identical to the reference (`byteIdentical: true`); mason daemon
  stop-file contract held.
- SHA-256: `24bcfc6a15d556134df9b9e42e789735272c8ef69ce2819aaa88f2dbfe4b58b4`
- Commons manifest pin: `24bcfc6a15d55613` — match. Families:
  timber/stone/plaster/iron.
- Commons source entity read fresh via committed census harness:
  lib `store/24bcfc6a15d55613.glb`, comp bag EMPTY. Target id
  `nx-cultivation-orchard-0020` confirmed ABSENT from commons-next.

## Structure

- ReviewStats bounds: 14.7061 × 4.6038 × 14.5175m; 5 GLB nodes / 4 draws.
- Composition: quincunx 9×9 lattice = 41 trees with understory and fruit;
  outdoor auto-trimesh collider class (>16 m²).
- No motion/light/socket anchors; component contract empty.

## Visual audit

Frames regenerated fresh: front/right/back/left/top/aerial/18m-gameplay/night
plus contact sheet.

- Gameplay 18m: reads as a solid broad-crowned orchard — wide olive canopy
  masses over a clean trunk hall with visible ground layer between the
  columns. Depth cue is flatter than siblings at eye height (the inherited
  rank-5 note), but identity is unambiguous.
- Aerial/top: quincunx columns read clearly; inter-column aisles open and
  regular; not an undifferentiated mass from above despite the uniform
  roofline note.
- Night: quiet coherent non-emissive mass, nothing floating or clipped.
- Back-view darkness: known family/rig characteristic (skill law) — not
  re-flagged.

## Highest-value finding

No blocking defect. The uniform roofline caps silhouette interest — correct
character for a background seat tucked in the district's inner west arc where
it backs onto lavender rather than facing any approach axis. Verdict: accept
as-is.

## Proposed pose (numeric checks)

- Slot parsed verbatim from the committed planner table (`r=84.253740,
  t=-22.172881` → world x −75.073890346, z 43.892251036), yaw 2.35619449,
  scale 1. NOTE: the planner's own output slot list showed only 8 rows this
  tick because my earlier extraction regex was too strict; the tolerant
  re-parse recovered all 14 rows including 0020 — parsed from the committed
  source, never hand-transcribed.
- Annulus law: inner corner 78.102416m ≥ 66; outer corner 95.830436m ≤ 108.
- Rotated-SAT vs all 14 exact district seats: nearest neighbors +0.693138m
  (av-mason-0027), +0.783827m (0012). District-wide minimum remains
  0.653458m (0027–0040) — candidate does not reduce it.
- Terrain preflight via real WorldAgent terrain module (commons-next):
  heightAt(slot) = 0.03541361196741313.

## Evidence

- `agents/arthur/reviews/nx-cultivation-orchard-0020/contact-sheet.jpg` and
  frame set in the same directory
- rebuild prover: `agents/arthur/assets/mkv3-cultivation-orchard-0020-probe.ts`
- terrain reader: `agents/arthur/next-terrain-nw-cultivation.ts`

## Decision

Reviewer: Arthur · Review date: 2026-08-27 · Placement state: UNCONSUMED

ARTHUR_REVIEWED_READY — bind: id nx-cultivation-orchard-0020 +
sha256 24bcfc6a15d556134df9b9e42e789735272c8ef69ce2819aaa88f2dbfe4b58b4 +
pos [-75.073890346, 0.03541361196741313, 43.892251036] yaw 2.35619449
scale 1. NEXT WAKEUP: place only this exact tuple; no other ring work may be
reviewed or placed behind it. With it, the ORCHARD FAMILY (5/5) completes and
the lane advances to gardens per the nvp-23 slot map.
