# Shrine + four gates — architectural replacement handoff

**Local geometry ready for parent visual review. Nothing deployed.** Main machine-readable entry point: `build/shrine-gates-delivery.json`.

## Final assets

| Asset / intended hosts | File | Full SHA-256 | Bytes | Triangles / meshes |
|---|---|---|---:|---:|
| Shrine / `nx-town-shrine` | `build/shrine.glb` | `f51be95de91ad5b3b6c5ce7d88a64172a84d31a5e4511847da3ba98bd4060c67` | 128956 | 2324 / 10 |
| Shared portal / `nx-town-gate-n`, `nx-town-gate-s`, `nx-town-gate-e`, `nx-town-gate-w` | `build/gates.glb` | `a39756779c671759dc5f02f878f8122ef7e2a38498f84edb35c1d0d16f7aaed7` | 55828 | 484 / 6 |

These are **authored uncompressed local bytes**, not server store addresses. Do not deploy any `*-assembly.glb`: those are review composites containing unchanged companions.

## Architecture

**Shrine:** replaces the disconnected columns/orbs/bench arrangement with a substantial continuous stone monument: stepped masonry base, thick longitudinal offering altar, oak-framed memorial screen and closed slate coping. The right-offset altar deliberately leaves the existing stars' outward face exposed. Offerings have meanings and recognizable forms: water in a real open bowl, daily bread on a tray, one small wax votive in a timber niche. No decorative field of glowing ornaments, fake doorway, courtyard or walk-in room. Bread and water are reachable from the exterior front edge.

**Gates:** one coherent crafted portal for all four original hosts: dressed stone feet and lower piers, heavy oak posts, shaped corbel soffit, braces/pegs and an assembled header under a closed pitched slate weather cap. No low hanging sign built into the new model. The four variants retain their original independent golden/tidal/dawn/dusk artwork. The historical half-meter depth necessarily produces thin side profiles; it is not widened into the roads.

Both roof caps use lane-local closed polygon profiles rather than the copied kit's known gable-wedge gap. All normal finishes run through campaign-only `kit.ts`; original builders/shared/cabin kits remain read-only.

## Contract and geometry evidence

- Exact host IDs, positions, yaws, scales and component values copied from the frozen contracts and cross-checked with folded hosts. All five comp bags remain `{}`.
- Actual served Draco baselines decoded and full-SHA checked, not rebuilt from historical sources. `build/shrine-gates-baseline-decode.json` includes the eight attached artworks in exact host-local transforms.
- Default-scene decode files: `build/nx-town-shrine-decode.json` and `build/nx-town-gate-{n,s,e,w}-decode.json`.
- Final local XZ envelopes are shrine X `[-1.25,1.25]`, Z approximately `[-1.4,2.5]`; gates X approximately `[-1.8,1.8]`, Z `[-0.25,0.25]`. All four decoded XZ extrema remain within the explicit **1mm Draco/boundary tolerance** of served baseline extrema. No footprint expansion for classifier gaming.
- Final local tops: shrine `2.1925001144m`, gates `3.7725000381m`. Height increases require parent visual review.
- Eight protected artwork volumes pass with **zero host-triangle intrusions and no allowance boxes**. Original companion poses, meshes, materials and files remain unchanged. The shrine stars' historical 0.30m left cantilever is preserved; backing is provided over the in-envelope portion instead of silently widening the shrine.
- `build/shrine-gates-double-build.json`: two real independent Bun builds per asset, newer mtimes each run, identical full SHAs; all **110 available served baseline GLBs** checked against download pins. No stale output accepted.

## Gate collision result — authorized bounded change required

Frozen public runtime uses `ROOM_MIN_AREA=16`, `ROOM_MIN_H=2.2`, `FLOOR_MAX_H=1.0`. Each gate's approximately 1.8m² footprint classifies automatically as a **center pillar**. No captured host has a collision preference.

Parent's mid-turn direction explicitly authorized the user-facing, gate-only **spawn metadata delta `collide: null → 'exact'`**. That is included in final route contracts and the delivery mapping. It is not a component or engine change, and this lane has not applied it live.

- `build/nx-town-gate-{n,s,e,w}-automatic-player.json`: actual public collider **FAIL**, center pillar blocks passage.
- `build/nx-town-gate-{n,s,e,w}-player.json`: with the authorized explicit exact preference, **PASS** for all four hosts, zero triangles in each required **1.4m × 2.2m** passage volume; all sixteen bidirectional gate route legs pass with zero horizontal pushes and zero swept-body geometry hits.
- Every parent-supplied neighbor is decoded from its own pinned file and fitted separately; roads and artworks are not merged into the host classifier or excluded from clearance.

### North artwork / actual floor diagnosis

The full golden-top bbox minimum is `2.2441330213m`; golden threshold top is `0.0519749112m`. Their bbox-only gap really is `2.1921581100m`, below 2.2m. But the low pendant ends are **outside** the specified central width. Clipping the actual unchanged overhead triangles to X `[-0.7,0.7]` gives minimum Y `2.4866330210m`.

Furthermore, the protected road actually covers the older threshold: measured local road support is `0.1011078507m`. The central artwork headroom above that true road is **2.3855251703m**, and the complete rebuilt host plus neighbors passes the 2.2m requirement. No artwork moved, no overhead triangles omitted, no invented clearance lift. Exact support-ray grid samples are in each `*-floor-samples.json`.

### Route boundary, not an extended-road approval

Final gate routes run between local Z `+0.63` and `-0.63`, with the entire 0.32m-radius body beyond both historical gate faces at each endpoint. The separate existing road curb starts near `|Z|=0.9688167572`; a trial endpoint at 0.65 made the conservative body square graze that next, higher support surface. Those honest failed broader-approach reports are preserved as `*-approach-curb-diagnostic.json`. The final result certifies traversal through the gate, **not** the extended approach across that old curb or the full world road network.

## Shrine exterior result

`build/shrine-exterior-player.json` uses parent-owned `verify-approach.ts` and the pinned public runtime. **PASS**: arrival → water offering → bread offering and reverse, all four legs with zero pushes and zero swept-body hits. All supplied nearby entities are included.

The shrine remains an ordinary **box-classified, non-enterable monument** without any collision override. `build/shrine-verification.json` preserves the generic room harness's expected “host is not an exact browser collider” failure instead of laundering it into a room pass. No access to the altar platform or internal room is claimed. Terrain is the stated local world-zero stand-in, not live terrain sampling.

## Render and actual image review

`../cabin-overhaul/render.ts` produced **126 verified PNGs** in **seven matching-camera before/after comparisons**: shrine solo, common gate solo, and all five host/artwork assemblies. Each set contains front/right/back/left/gameplay/aerial/top/night/interior. Before-camera JSON is reused verbatim, with matching camera SHA, and all PNG/model/manifest hashes are checked in `reviews/shrine-gates-visual-review.json`.

Actual inspection route: **`vision_analyze` returned auxiliary text image analysis, not native image attachments. No native visual acceptance claimed.** All nine panels of all ten before/after assembly contact sheets were inspected through that auxiliary route; targeted full-size images were also checked during iteration. Final auxiliary findings: coherent, grounded portals with exposed artwork; quiet substantial non-enterable shrine with recognizable offerings; no demonstrated final float or clipping. Night is deliberately dark, and generic interior gate views crop parts of the structure. Parent independent image review remains pending.

Useful first views:
- `reviews/nx-town-shrine-after-assembly/contact-sheet.jpg`
- `reviews/nx-town-gate-n-after-assembly/contact-sheet.jpg`
- `reviews/nx-town-gate-s-after-assembly/back.png`
- `reviews/nx-town-gate-e-after-assembly/front.png`
- `reviews/nx-town-gate-w-after-assembly/front.png`

Renderer errors: none. Only ReadPixels GPU-stall performance warnings. Review composites contain exact artwork but not full terrain/world lighting; collision assemblies have the broader neighbor coverage.

## Resolved defects and remaining work

A first shrine export lost a KEEP-named flame's mesh scale, creating an oversized sphere. Both decoded envelope failure and actual image inspection caught it. The final source bakes primitive sizing into geometry; final decode and imagery confirm the small votive. Review assembly export initially required buffer consolidation; `unpartition()` now joins copied buffers without geometry/texture recompression. Initial assumed ground/threshold datums were rejected by real road triangles and corrected from decoded support rays.

Remaining parent work: independent visual approval (including height changes), deployment with exact frozen host/comp tuples plus only the authorized gate collision metadata change, served-byte geometry reruns, and live terrain/snapshot readback. No uploads, world verbs, credentials, GUI use, engine edits, original asset writes or commits occurred.

## Reproduction

Run from `/Users/t3rpz/projects/eidoverse-worlds`:

```sh
bun agents/arthur/village-overhaul/build-shrine.ts
bun agents/arthur/village-overhaul/build-gates.ts
CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime bun agents/arthur/village-overhaul/build-shrine.ts --verify
CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime bun agents/arthur/village-overhaul/build-gates.ts --verify
bun agents/arthur/village-overhaul/build-shrine.ts --assemblies
bun agents/arthur/village-overhaul/build-gates.ts --assemblies
```

Owned repository sources: `build-shrine.ts`, `build-gates.ts`, this note, and shrine/gates-prefixed outputs in `build/` and `reviews/` only.
