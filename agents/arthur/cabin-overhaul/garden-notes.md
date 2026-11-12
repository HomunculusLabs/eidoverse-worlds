# Garden cottage — final local handoff

**Ready for parent integration; no upload, spawn, place, rider move, commit or push executed here.**

## Exact final artifact

- Builder: `build-garden.ts` (imports shared `kit.ts`; no shared-kit changes).
- GLB: `build/nx-town-garden-cottage.glb`
- SHA-256: `b5b3f1022785657167b43dffb04e501a83f1b76c53d06e0cf4998384177a265f`
- 779,708 bytes; 14 decoded meshes/nodes; 8,180 triangles.
- Double rebuild byte-identical, with both output mtimes advancing: `build/nx-town-garden-cottage-determinism.json`.
- Final exact-mesh bounds: min `[-5.099999905,-0.129999995,-3.900000095]`, max `[3.619999886,6.000500202,2.700000048]`.
- X/Z remain within the saved footprint (floating-point boundary tolerance only). Chimney top is approximately 0.5815m above the old 5.419m maximum; height extension was allowed.
- **Original floor unchanged in geometry:** 6.6 × 5.4 × .26m, center `(0,0,0)`, top `.13m`. The east potting wing nests into the already-existing floor rather than inventing extra floor plate.

## Architectural result

A front-gabled dark-timber/lime hall now meets a lower perpendicular garden wing. Roof faces are clipped against one another at their actual plane intersections, with closed slate decks, overlapping staggered slate courses, thin valley flashing, ridges and verge framing. This replaces the live-source wing roof that was authored without the wing translation.

The entry has a wide framed opening, two fully-open cedar leaves, a bracketed rain hood, warm windows, and a nearly flush threshold. A substantial stone chimney now follows the actual hearth axis, with a flashed roof penetration and twin pots.

The gardener identity is preserved through meaningful equivalents: northwest kitchen counter and basin, three hanging cookware pots, hearth and mantel, west worktable and stool, basket of herbs, three seed jars, east bed with green cover and pillow, plus a sunlit wing potting bench. Two raised herb beds, trained vine, west/back fenced garden and supported bench remain. The new beds and bench were moved wholly inside the west fence after a geometric audit caught the original placement pattern crossing it.

## Real player-geometry PASS

- Parent verifier input: **`build/nx-town-garden-cottage-route-contract.json`**.
- Parent verifier output: **`build/nx-town-garden-cottage-player-report.json`**.
- Status `PASS`, actual browser collider `exact:true`, room-scale classification true.
- **10/10 route legs pass**, inward and outward: front path → stone apron → threshold → inside door → worktable/bed → kitchen/hearth viewpoint and reverse.
- Zero lateral pushes and zero swept-body geometry hits. Source interior floor `.13`; real threshold top `.148`.
- Required doorway/room volume: x `[-.7,.7]`, y `[.148,2.348]`, z `[-.72,2.69]`: **1.4m width and full 2.2m height**, zero intruding triangles.
- Builder's independent THREE triangle/box SAT check uses y `[.149,2.349]`, also a full 2.2m volume, excluding the support surface by 1mm; zero blocking triangles. The old raw live-source GLB failed the initial lane test with 197 blocking triangles.
- Door-frame clear height above threshold is approximately **2.372m** (head underside 2.52 minus threshold .148). Jamb clearance is 1.78m; 1.4m is the guaranteed complete entry-to-room corridor.
- Scope is local host geometry and the protected rider volume, not live terrain, neighboring models or an in-world walk. Do not promote this to a live deployment verdict.

## b17 rider — parent-approved proposal only

Rider `nx-artwalk-b17-garden-seed-lattice` stays separate and its geometry was not incorporated into this GLB.

- Old local anchor `[0,2.08,1.8325]`.
- Parent-authorized proposed anchor **`[0,2.62,1.8325]`**, delta **`[0,.54,0]`**.
- Preserve artwork bytes, x/z/yaw/scale. Parent executes and verifies any live migration.
- Blank lime backing face remains at **z=1.8**, x `[-.9,.9]`, y `[2.52,3.12]`.
- At the approved anchor, the original rider occupies y `[2.62,3.08]`, giving .10m backing below and .04m above. The rain hood remains above it.
- Protected test volume `[-.75,2.62,1.8]..[.75,3.08,1.94]`: **zero host triangle intersections, no allowance or exemption**.
- A previous candidate had the front timber plate intruding into the top 1cm of this volume. The actual plate was raised 4cm; its underside is now 3.11. The test was not weakened.
- For precision: `.268m` is the theoretical minimum upward delta for 2.2m clearance over the .148m threshold; `.44m` is the minimum fully-backed seat without reducing this design's 2.372m host headroom. The parent's selected `.54m` provides the stated margins. Do not silently substitute either lower value for the approved proposal.

## Exact-byte visual review

Final images and per-frame hashes: **`reviews/after-garden-final/`**. Contact sheet: `review-grid.jpg`.

All nine final views rendered with the parent's unchanged baseline rig from `reviews/before-garden-cottage/camera.json`: front, right, back, left, gameplay, aerial, top, night and interior. Camera SHA `235323dd305ee51fff97b06a40929d199cddf34eb75998b309db9678a2fdae34`. Render manifest pins the final `b5b3f102…` model. Zero browser errors; only GPU ReadPixels performance warnings.

Visual judgment used the image-analysis tool on the actual final nine-view sheet and full-resolution aerial, after earlier individual front/interior/aerial checks. It returned a local visual PASS: coherent timber/lime architecture, connected roof masses, readable open entry and night glazing, visible west/north garden and furnished gardener room. No serious visible gap, detached roof panel or missing roof. The lower valley/fascia meeting point remains deliberately chunky low-poly trim; the close aerial review treated further seam cleanup as optional rather than a demonstrated fault. This is tool-assisted image review, not claimed native-agent vision or in-world sight.

Earlier visual corrections: changed a heavy dark valley member to thin slate-colored flashing, added chimney flashing and open door leaves, and replaced the round fire prop with small pointed flames. An initial single aerial's claim that the garden was absent was falsified by the top/left/back views; occlusion was not treated as missing geometry.

## Reproduction (from repository root)

```sh
bun agents/arthur/cabin-overhaul/build-garden.ts
bun agents/arthur/cabin-overhaul/verify-player.ts \
  agents/arthur/cabin-overhaul/build/nx-town-garden-cottage.glb \
  agents/arthur/cabin-overhaul/build/nx-town-garden-cottage-route-contract.json \
  agents/arthur/cabin-overhaul/build/nx-town-garden-cottage-player-report.json
bun agents/arthur/cabin-overhaul/render.ts \
  agents/arthur/cabin-overhaul/build/nx-town-garden-cottage.glb \
  agents/arthur/cabin-overhaul/reviews/after-garden-final \
  agents/arthur/cabin-overhaul/reviews/before-garden-cottage/camera.json
```

The true source was read from `assets/mkvillage-houses.ts::gardenCottage`, not the stale ring sibling. Raw original GLB remains untouched at SHA `cee52aca03429a62e2213ee6318f40118f9b9841d4efbf3e5932f9206dd2b2f5`. Served Draco baseline is preserved separately. Existing global TS/Three typing diagnostics were not repaired; real Bun builds, decoding, collider execution and rendering are the executed evidence. No global helper fix was required.
