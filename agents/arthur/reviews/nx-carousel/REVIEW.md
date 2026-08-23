# nx-carousel retrospective model review — nvp-6

Reviewed: 2026-08-23T14:47:42Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-carousel`
- Source: `agents/arthur/assets/mkcarousel.ts` + `agents/arthur/assets/mergekit.ts`
- Output: `agents/arthur/assets/village_carousel3.glb`
- SHA-256: `d41a898f3054874b9918b1adf4f0fe3674088baa86416cf5a6c8ec84bd8958ec`
- Proposed pose: `pos [-18, 0.00014950061063032772, 18], yaw 2.35619, scale 1`
- Terrain evidence: live seed-8128 terrain `heightAt(-18,18) = 0.00014950061063032772`; current detached seat `heightAt(-18.8,25.9) = 0.00780083934309112`.

## Rebuild and structure

- Two consecutive final rebuilds were byte-identical at the full SHA-256 above.
- File size: 349,852 bytes; six embedded texture images.
- Bounds: min `[-3.55, 0, -3.55]`, max `[3.55, 6.2600, 3.8400]`, size `[7.10, 6.2600, 7.3900]` metres.
- Final GLB census: 43 model nodes and 37 draw meshes (renderer traversal adds one scene root: 44).
- Materials: carousel wood/fabric/blanket, gold/bone/blue paint families, emissive `glow2`.
- Deep audit: spec/sanity PASS; zero degenerate triangles; zero NaN vertices; zero unsupported floating clusters; one emissive material.
- Collider posture: structural outdoor ride/landmark. Stairs terminate outside the swept platform radius; base is grounded.

## Component reconciliation

Fresh `commons/av-carousel` and `commons-next/nx-carousel` reads were exact at the old hash/pose: seven component keys—platform spin, horse bobs `0/2/4/6`, four rider sockets, and smoke.

The revised GLB preserves the exact live targets `carousel`, `horse_0`, `horse_2`, `horse_4`, and `horse_6`. The four socket `part` targets therefore remain valid. Motion/socket payloads carry unchanged. The proposed reseat changes the world-space smoke origin from `[-18.8,6.3,25.9]` to `[-18,6.30014950061063,18]`; the later placement tick must rewrite that payload after spawn.

## Visual review

Evidence: `agents/arthur/reviews/nx-carousel/`

- Initial front/right/back/left/gameplay/night frames showed a coherent, complete landmark: stepped grounded base, external boarding stair, attached mast/ribs/drop poles, readable warm/cool horse paint, full canopy, and eight warm lanterns.
- Initial static census exposed the blocking defect: the source bypassed the village merge law and wrote 193 model nodes / 187 draw meshes. The visual result did not justify that cost; each horse limb, inlay, and static flag was an independent draw.
- nvp-6 added `mergeByMaterial` and narrowed the KEEP rule from every `horse_*` descendant to exact `horse_N` roots. Static flags now merge because no live component targets them. Result: 193→43 model nodes and 187→37 draw meshes, while all five motion roots survive.
- Revised frames are visually unchanged across every angle: no missing limbs, paint-family drift, canopy break, floating pole, or stair regression.
- `gameplay.png`: silhouette remains immediately identifiable at 18m; canopy/base/horse ring hierarchy is strong.
- `night.png`: lantern ring remains readable and gives the landmark a distinct night crown.
- `motion-a.png` / `motion-b.png`: interval pair visibly establishes platform rotation and alternating horse elevation; the renderer applies the live 6°/s spin vocabulary and 0.18m phased bobs to exact anchors.

## Highest-value finding

FIXED: catastrophic draw-node waste. The model now sits within the village's 5–45 node health band with no visual loss. No further blocking model defect remains.

## Seat composition

The compact NW seat is 25.456m from the hearth versus the old 32m detached seat. It preserves the deliberate three-anchor composition (carousel NW, future tower NE, future working court SE), clears the standing hearth/welcome ensemble by wide margins, and remains far inside the 112m rim.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact optimized hash and compact pose above.
No placement, replacement, or target-world mutation occurred during this review.
