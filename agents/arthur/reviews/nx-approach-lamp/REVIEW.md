# nx-approach-lamps model review — nvp-9

Reviewed: 2026-08-23T15:22:21Z  
Target world changed: no

## Candidate tuple

- Subject: four-way `nx-approach-lamp-{e,n,w,s}` atomic ensemble
- Source: `agents/arthur/assets/mkv3-next-approach-lamp.ts`
- Output: `agents/arthur/assets/village_approach_lamp.glb`
- SHA-256: `409084706b801f8d55282b44d2dc4635ea19f5ad4e0eded499aacc7a8932998b`
- Model poses (all scale 1):
  - east: `[10,0,0]`, yaw `-1.5707963267948966`
  - north: `[0,0,10]`, yaw `3.141592653589793`
  - west: `[-10,0,0]`, yaw `1.5707963267948966`
  - south: `[0,0,-10]`, yaw `0`
- Companion point lights: `nx-approach-lamp-{e,n,w,s}-l`, warm `0xffb066`, intensity `1.35`, range `4.5`, at the transformed local midpoint `[0,1.96,0.10]`: east `[9.9,1.96,0]`, north `[0,1.96,9.9]`, west `[-9.9,1.96,0]`, south `[0,1.96,-9.9]`.

## Rebuild and structure

- Two consecutive final rebuilds were byte-identical at the full SHA-256 above.
- File size: 42,060 bytes; one embedded iron texture image.
- Bounds: min `[-0.44,0,-0.21]`, max `[0.44,2.315,0.25]`, size `[0.88,2.315,0.46]` metres.
- Final GLB census: two model nodes / two draw meshes; materials `iron` and emissive `glow1` (renderer traversal adds one scene root).
- Focused deep audit: two nodes; one emissive material; zero degenerate triangles; zero NaN vertices; zero unsupported floating clusters.
- Collider posture: furniture-scale outdoor solid. The 0.44m-radius base is grounded; the four instances remain independent micro-colliders rather than one plaza-spanning aggregate bbox.

## Component and placement compatibility

- The model has no component targets. Illumination is deliberately carried by four separate `light` entities; replacing a lamp model cannot silently wipe its light.
- All four seats lie inside seed-8128's 24m flat radius at terrain y=0.
- Each micro-OBB clears the live hearth, welcome board, and carousel, and the four lamps clear one another by more than 13m.
- Each crossarm is yawed so local +Z's 0.10m bias faces the hearth. The direct hearth sightline remains open.
- The posts occupy the cardinal marker points. Future 1.4m approach paths must pass beside them rather than through their micro-footprints; the coordinate plan explicitly designs paths around accepted seats, not vice versa.
- All corners remain near r=10.5, far inside the 112m rim.

## Visual review

Evidence: `agents/arthur/reviews/nx-approach-lamp/`

- Initial one-lantern draft was technically valid at two draws but failed its actual purpose: from the outward/back approach the lamp was exactly occluded by its own post.
- Highest-value fix: replace the one-sided arm with a transverse twin-lantern crossarm, biased 0.10m inward. Iron and glow geometry still merge to the same two draws.
- Revised front/right/back/left frames show a grounded, coherent iron post, visible warm lantern identity from every direction, and no incomplete backside.
- `gameplay.png`: twin-light punctuation remains readable at 18m without competing with the hearth or carousel.
- `night.png`: two emissive points give a clear beacon crown; the later four companion point lights provide real pool illumination.
- No motion applies.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact hash, four model poses, and four companion-light tuples above. No placement or target-world mutation occurred during this review.
