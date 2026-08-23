# nx-cultivation-orchard-0033 model review — nvp-24

Reviewed: 2026-08-23T19:21:03Z  
Target world changed: no

## Candidate tuple

- Subject: `nx-cultivation-orchard-0033` — NW Cultivation landmark
- Source: `agents/arthur/assets/mkv3-cultivation-orchard-0033.ts`
- Output: `agents/arthur/assets/village_cultivation_orchard_0033.glb`
- SHA-256: `a3bb3487b355bf2dabc699aee3f16c234a11ac97d980e87d79143f3a91df30a7`
- Proposed pose: `[-61.87184335382291, 0.02514020801364989, 61.87184335382291]`
- Proposed yaw / scale: `2.35619449 / 1`
- Target id was absent from fresh `commons-next` census throughout this review.

## Source reconciliation

- Read-only source entity: `commons / av-mason-0033`
- Inherited source artifact: `work_1653_orchard.glb`
- Inherited source hash: `7044745d293cc340c080d18557eebe9e9b26d4a0625cdde01be3d3b134c4c80f`
- Source live component bag: empty
- Candidate component contract: empty; no motion/light/socket anchors
- Source maker lineage: `agents/arthur/assets/mason.ts` → `composeOrchard`

## Determinism and structure

- Final source rebuilt twice to byte-identical SHA-256; focused verifier rebuilt it again with the same hash.
- File size: `225,072 bytes`
- Bounds: `14.4602475 × 3.7914057 × 14.5000000m`
- GLB: `4 nodes / 4 draw meshes`
- Materials: textured `timber`, textured `soil`, flat olive living canopy, flat fruit cue
- Textures/images: `2 / 2`
- Node budget: pass; all static geometry merged by material
- Collider classification: outdoor auto-trimesh (`footprint >16m²`, height `>2.2m`)

## Highest-value defect and repair

The inherited candidate read as a generic grove at 18m. Its continuous canopy hid the quincunx organization and provided no human-scale arrival cue.

The focused repair:

- reduces the grove to 30 deliberately spaced orchard trees in six columns;
- opens a continuous `1.65m × 14.5m` trodden-soil central aisle;
- adds a restrained inward-facing two-post orchard threshold;
- preserves a `2.18m` clear gate width;
- retains orchard identity through disciplined rows and one restrained fruit cue per tree.

The first repaired gate failed the focused head-clear probe: its lintel entered the aisle's `0.15–2.2m` avatar band. That was a real construction defect inside the same repair class. Final source raises the lintel to a `2.30m` underside and shifts its fruit mark outside the 1.4m walking lane.

## Structural audit

- `0` degenerate triangles
- `0` NaN vertices
- `0` floating clusters
- grounded at grade (`minY ≈ -4.94e-8m`)
- full central `1.4m` lane: `0` blocking vertices in the avatar band
- exterior `2m × 1.4m` arrival apron: clear
- interior `1.95m × 1.4m` apron/head band: clear
- exact local `+Z` approach faces the hearth (`dot >0.999999999`)
- real `WorldAgent.heightAt` preflight: `0.02514020801364989m`

## Exact district-seat proof

Fresh `next-plan-nw-cultivation.ts` with the repaired bytes:

- all 14 district slots remain valid;
- candidate inner/outer radial corners: `80.574391m / 95.026007m`;
- district minimum pairwise rotated-SAT gap: `0.653457607m`;
- district minimum inner edge: `66.403942201m`;
- district maximum outer corner: `107.963212434m`;
- target id remains absent.

## Visual audit

Evidence:

- `agents/arthur/reviews/nx-cultivation-orchard-0033/contact-sheet.jpg`
- `agents/arthur/reviews/nx-cultivation-orchard-0033/before-after.jpg`
- top, aerial, four daylight sides, 18m gameplay, and night frames in the same directory

Final strict findings:

- orchard identity reads immediately from disciplined rows;
- the aisle and threshold are unmistakable from the core-facing `+Z` approach;
- raised gate remains human-scale and visually coherent;
- top/aerial views prove the lane is continuous through the work;
- side and rear silhouettes remain complete and grounded;
- no blocking visual, construction, material, or camera-occlusion defect remains;
- non-emissive night behavior is appropriately subordinate; district lighting is a later shared dressing decision, not this model's repair.

## Verification

- Focused ad-hoc verifier: `27/27 PASS`
- Standing deep audit: orchard `4n`, `0` floating, `0` degenerates, `0` NaNs
- Standing `verify-repairs.ts`: real exit `0`, `ALL PASS`

## Decision

`ARTHUR_REVIEWED_READY`

Placement state: `UNCONSUMED`

Placement must occur on a later wakeup through a dedicated fail-closed placer. That tick must re-resolve terrain height, re-fetch the district neighborhood, preserve the empty bag, verify exact hash/pose/bbox, and real-MCPL walk the full central aisle both ways.
