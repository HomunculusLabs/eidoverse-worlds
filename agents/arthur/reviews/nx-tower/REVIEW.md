# nx-tower model review — nvp-17

Reviewed: 2026-08-23T17:06:05Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-tower` — round tower-house principal mass
- Source: `agents/arthur/assets/mkv3-ring.ts` (tower section)
- Output: `agents/arthur/assets/village_tower3.glb`
- SHA-256: `38f50c9f4fea4583b2b8917752cfec0ef550f0aafb410fcbbd0e92994b186e2c`
- Proposed pose: `pos [14.1,0,16.9], yaw -2.44347, scale 1`
- Terrain: seed-8128 `heightAt(14.1,16.9)=0`; radial seat 22.0095m lies inside the flat radius.

## Rebuild and structure

- Two consecutive final rebuilds were byte-identical at the full SHA-256 above.
- File size: 112,152 bytes; one embedded texture image.
- Bounds: min `[-3.25,-0.20,-3.25]`, max `[3.5072,8.10,3.60]`, size `6.7572 × 8.30 × 6.85m`.
- Final GLB census: 18 model nodes / 18 draw meshes (renderer reports one additional scene root).
- Materials: timber + glow1/glow2/glow3 and flat structural buckets.
- Named retained anchors: `flame`, `lamp`, `finial`; no motion target.
- Focused deep audit: zero degenerate triangles, zero NaN vertices, zero unsupported floating clusters.
- Collider posture: enterable room-scale tower.

## Component reconciliation

The read-only `commons` source `av-tower-house` carries one component:

```json
{"sockets":{"study":{"pos":[-1.35,3,-0.5],"yaw":-1.5707963267948966}}}
```

This socket remains inside the furnished upper study and requires no named-part target. Preserve it exactly when the later tower ensemble is placed. `commons` was not modified.

## Highest-value defect and repair

The inherited upper floor was one solid `5.36 × 5.36m` slab. Although seven ladder rungs reached above the deck (`3.12m > 2.55m`), the slab sealed the landing, making the furnished upper study physically impossible to enter.

The source now builds four floor slabs around a real hatch:

- hatch x `[1.05,2.35]`, z `[0.85,2.25]` — `1.30 × 1.40m` clear;
- ladder rails x `1.42/1.98`, z `1.55` lie fully inside that opening;
- floor continuity remains on all four sides;
- study furniture, king post, balcony and roof are unchanged.

Evidence: `agents/arthur/reviews/nx-tower/hatch-proof.png`.

## Door, circulation, and structural checks

- Door frame inner clear width: `1.48m` between jamb inner edges, above the 1.4m law.
- Door height: 2.2m; threshold/floor top: 0.20m.
- Interior and exterior `2.0 × 1.5m` approach rectangles on local +Z are free of furniture.
- Door-to-ladder lane remains clear; ladder now terminates in the open hatch.
- Upper study has desk, candle, books, bed/chest, king post and balcony access.
- Balcony has nine posts and ten top-rail segments around its intended front arc.

## Visual review

Evidence: `agents/arthur/reviews/nx-tower/`.

- Four daylight angles, gameplay silhouette and night frame were inspected after the hatch repair.
- Exterior remains a coherent round two-level tower-house: conical roof and finial establish the vertical landmark; bone jambs/lintel establish the door; balcony and balustrade remain structurally readable.
- Front and gameplay views reveal the working entry and vertical circulation. Back/side silhouettes are intentionally quieter but complete.
- The emissive doorway lamp and upper study/window points remain visible at night without turning the tower into a floodlit beacon.
- No exterior regression resulted from splitting the concealed upper slab.

## Proposed-seat checks

- Local +Z/front points at the hearth with dot product `0.999996`.
- Rotated-SAT nearest clearance is 10.305m to `nx-approach-lamp-n`; hearth clearance 13.300m; court clearance 17.578m.
- Farthest proposed corner radius: 25.510m, far inside the 112m rim.
- The tower preserves the NE principal anchor and the open SW meadow.

## Verdict

`ARTHUR_REVIEWED_READY` for the exact repaired hash and pose above, under tower-ensemble hold until `village_shutters3.glb` is independently reviewed. Do not place this tower during nvp-17. No target-world mutation occurred.
