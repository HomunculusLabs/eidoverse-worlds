# nx-welcome retrospective model review — nvp-4

Reviewed: 2026-08-23T13:33:35Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-welcome`
- Source: `agents/arthur/assets/mkv3-welcome59.ts`
- Output: `agents/arthur/assets/village_welcome3.glb`
- SHA-256: `4b94d42b9ef89826261f24651f7f2d480126a6db495792e515f0aed0b383e7ae`
- Proposed pose: `pos [-3, heightAt(-3,-4.3), -4.3], yaw 0.6092, scale 1` (same seat as provisional live model)

## Rebuild and structure

- Two consecutive rebuilds were byte-identical at the full SHA-256 above.
- File size: 97,556 bytes (95.27 KiB); two embedded texture images.
- Bounds: min `[-0.5655, 0, -0.1500]`, max `[0.6107, 1.6785, 0.2681]`, size `[1.1762, 1.6785, 0.4181]` metres.
- GLB census: 5 model nodes/draw meshes; local renderer adds one scene root (6 traversed).
- Materials: village `timber`, `stone`, emissive `glow2`, plus intentionally flat painted board/letter materials.
- Deep audit: spec/sanity PASS; zero degenerate triangles; zero NaN vertices; zero unsupported floating clusters; one emissive material.
- Collider posture: thin outdoor sign/landmark, not an enterable room.

## Component reconciliation

Fresh live reads show `commons/av-welcome` and `commons-next/nx-welcome` carry the same old lib, bbox, position, scale, and empty component bag. The revised candidate changes only the content-addressed GLB bytes. It introduces no motion/socket/particle target and therefore has no component migration risk.

The companion `nx-welcome-l` light is a separate world entity at `[-3,2.2,-4.3]`; it must remain present after placement because the board's tiny emissive globe is an identity beacon, not sufficient area lighting by itself.

## Visual review

Evidence: `agents/arthur/reviews/nx-welcome/`

- Initial pass exposed a real semantic defect: the source promised “THE COMMONS,” but the face contained only one blank dark name bar. The central identity existed in comments, not geometry.
- nvp-4 replaced that blank bar with a real raised 3×5 `COMMONS` inscription. The pixels merge into one painted-letter bucket, preserving the five-node draw budget.
- Revised `front.png`: the face now carries an actual inscription and reads as a named wayfinding board rather than generic furniture.
- `right.png`, `back.png`, `left.png`: post, foot stone, lamp arm, board thickness, and pointer-arm construction remain complete from every side. The dark back in the local frame is directional-light falloff, not a divergent back material.
- `gameplay.png`: at 18m the literal letters compress, as expected for a 1m board, but the marked face, pointer silhouette, and lamp establish “wayfinding/welcome.” Text is intended for approach distance rather than skyline distance.
- `night.png`: the emissive globe survives as a location beacon. Full face readability depends correctly on the already-standing companion light and will be checked in the later live placement tick.
- No motion evidence is required; source and live model have no motion components.

## Highest-value finding

The one blocking defect—the blank semantic face—was fixed at source. No further blocking model defect remains. Do not enlarge this modest arrival sign merely to make literal text legible from 18m; its role is to resolve on approach while principal masses carry the distant silhouette.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact revised hash and unchanged seat above.
No placement, replacement, or target-world mutation occurred during this review.
