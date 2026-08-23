# nx-hearth retrospective model review — nvp-1

Reviewed: 2026-08-23T13:03:33Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-hearth`
- Source: `agents/arthur/assets/mkv3-plaza.ts`
- Output: `agents/arthur/assets/village_plaza3.glb`
- SHA-256: `43fcaf1442f5d6b802810732f1b8641356a2b31c976069fec6001537802aef92`
- Proposed pose: `pos [0, heightAt(0,0), 0], yaw 0, scale 1` (same as provisional live seat)

## Rebuild and structure

- Two consecutive rebuilds were byte-identical at the full SHA-256 above.
- File size: 116.6 KiB; embedded texture bytes: 21,947; three deduplicated images.
- Bounds: min `[-3.1207, -0.0476, -3.1207]`, max `[4.1500, 1.7600, 3.1880]`, size `[7.2707, 1.8076, 6.3087]` metres.
- GLB node census: 18 model nodes by `deep-audit2.ts`; local renderer adds one scene root (19 traversed); 16 draw meshes; build reports 15 top-level children.
- Materials: village `iron`, `stone`, `timber`, emissive `glow3`, plus intentionally flat small-detail materials.
- Deep audit: spec/sanity PASS; zero degenerate triangles; zero NaN vertices; zero unsupported floating clusters; one emissive material.
- Collider posture: low outdoor gathering ensemble, not an enterable room. Its elements remain furniture/landmark scale rather than falsely invoking a room collider.

## Component reconciliation

Fresh live reads show source `commons/av-plaza-hearth` and target `commons-next/nx-hearth` share the exact lib, bbox, pose, scale, and complete component payload:

- `particles` — embers at `[0,0.7,0]`
- `motion:well_` — 3-degree, 9-second damped pendulum
- `motion:pz_kettle` — 2.5-degree, 11-second pendulum
- `sockets` — four log seats plus `tale_seat`

Surviving named targets include `well_` and `pz_kettle`; all socket poses are coordinate seats and do not require a `part` node. No source/live mismatch.

## Visual review

Evidence: `agents/arthur/reviews/nx-hearth/`

- `front.png`, `right.png`, `back.png`, `left.png`: complete from all sides; no false façade. The hearth, four log seats, storyteller stone, cooking tripod/kettle, and working well remain legible as one gathering ensemble.
- `gameplay.png`: at 18m it reads as a deliberately low horizontal landmark, with the orange fire as focus and the well as the secondary vertical accent. It will not carry the village silhouette alone; that is a composition fact, not missing model geometry.
- Material hierarchy is coherent: dark iron at the fire, ashlar for placed stones/well, timber for mechanisms, raw logs kept distinct. Nothing visually floats; low elements meet or slightly bed into ground.
- `night.png`: the emissive fire survives while non-emissive detail recedes. The already-live `nx-plaza-l` companion at `[0,1.2,0]` is therefore part of the required night ensemble; deleting or moving that light would invalidate this review.
- `motion-a.png` / `motion-b.png`: interval pair captured. The pendulum changes are intentionally subtle and are not a primary silhouette event; this matches the slow-and-calm law.

## Highest-value finding

No blocking source defect. The important limitation is contextual: the low hearth and detached well read as a small campsite at gameplay distance until paths, lamps, and principal masses frame them. Do not enlarge the model to compensate for an otherwise empty world. Preserve the current source and solve village-scale readability through the approved composition.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact hash and unchanged center pose above.
Bill explicitly delegated routine model review and placement to Arthur.
No human approval is required. No placement, replacement, or world mutation
occurred during this review.
