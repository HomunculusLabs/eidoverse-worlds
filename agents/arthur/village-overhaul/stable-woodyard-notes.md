# Stable + woodyard — local architectural overhaul handoff

## Restoration after withdrawn parent height constraint

The coordinator withdrew its requested +1 m cap as a parent error: actual `BRIEF.md` line 6 permits height growth with review, and imported `../cabin-overhaul/contracts.ts` `validatePlan` has no height cap. The temporary roof-lowering changes and both invented builder cap assertions were reversed using the exact archived sources, without a broad git revert. **Both accepted GLBs are restored byte-for-byte**, verified by actual repeated builds and `build/nx-town-stable-restoration.test.ts`. Stable source is identical to its archived source. Woodyard source differs only by removal of the unnecessary proposed exact-collision amendment; geometry bytes are identical.

- Stable source SHA-256: `27d18fbdb1e0b9e5cdd73169546eb79c4bb35cbc46670accfd2635f5712b95a0`.
- Woodyard source SHA-256: `f6fee33be5ae5630e1189c495616ddcbff2c2d8bd6126b1b77aa3a11223afed0`.
- Accepted model SHA-256 values remain those in the table below. All 4,432 stable / 4,952 woodyard triangles and serialized material/texture bytes match the archived accepted models.
- Separately justified new checks pass on the **restored** bytes: actual default full-neighbor routes 20/20 stable and 14/14 woodyard, with independent physical support at 608 and 353 step samples respectively. Declared waypoint/terrain heights are unchanged. No phantom bbox ground was accepted and no companion override was introduced.
- Backing witnesses hit actual host triangles: stable 18/18 rays (art/sign), woodyard 11/11 (art/hanger). Roof-skin first-hit samples remain slate or cap: 24/24 per model. These are geometric witnesses, not engineering certification.
- Fresh restored nine-view solo, interior detail and art/sign exterior-context renders replace the temporary low-roof images. Use `reviews/nx-town-stable-roof-context/aerial.png`, `top.png`, `front.png` and the corresponding `nx-town-woodyard-roof-context/` files. The context GLBs are review-only composites, not upload targets; route checks include all five/ten frozen neighbors, whereas these exterior composites include the two attached art/sign companions.
- `reviews/nx-town-stable-restored-final.log` records the successful final freeze gate. The retired `*-withdrawn-height-*` files and `nx-town-stable-roof-red.log` / `roof-green.log` are historical evidence for a **withdrawn, invalid policy**, not deployment blockers or final model claims. The retired test is text under `reviews/`, not an active test.

## Outcome and deployment boundary

Both final models are rebuilt, deterministic and locally verified. **No uploads, world verbs, live mutations, GUI actions, credential reads, shared/original-kit edits or commits were performed by this lane.** Parent owns deployment, authoritative companion readback, terrain/live-runtime verification and final served-byte tests.

- **Stable:** a coherent enclosed limewashed barn with a slate gable roof, three exposed tied trusses, pegged knee braces, framed daylight openings, stone plinth and supported road entrance. Two care stalls flank a genuinely clear central feed aisle. Tack, saddle stand, grooming equipment, hay, mangers, pitchfork and outside trough remain present. The entrance stays offset to the left of the immovable livery sign; the former rear open face is now a weather wall supporting the unchanged harmonic-rein artwork.
- **Woodyard:** a substantial open timber joinery/fuel workbay, not an enterable room claim. Four masonry-shod posts, wall plates, tied roof frames, attached side diagonals, slate gable roof, low board screens and a rear limewash windbreak organize the original log stock. A real supported workbench adds planked top, apron, ledger, stretcher, vise, plane, mallet and cutting stock. Original axe/stump remain outside at their original positions; a tool board and a visible hanger support the unchanged low sign.

**Woodyard collision:** the source route now preserves automatic collision with **no amendment**. Its pillar classification is not a room, and the exact-only `verify-player` policy still honestly reports `FAIL` solely for that classification. Actual `probeApproach` access and independent physical support pass all 14 service legs, both alone with its attached art/sign and with all ten frozen neighbors. The original served woodyard also passes those 14 routes; its separate required full-height triangle volume has 11 intrusions. Do not label either tested passage blocked or claim an enterable room.

## Exact frozen inputs and final bytes

Original builders were located and read only: `agents/arthur/assets/mkv3-stable.ts` and `agents/arthur/assets/mkv3-woodyard27.ts`. Original prose and builders were not substituted for the actual downloaded, Draco-decoded default scenes. `build/nx-town-*-baseline-decode.json` contains complete traversed hierarchies/world transforms and connected-component bounds. `build/nx-town-*-evidence.json` records both full hierarchies, source hashes, furniture triangle selections and explicit reposition transforms.

| Model | Frozen served baseline SHA-256 | Final SHA-256 |
|---|---|---|
| Stable | `3173e66c056459e5551cc9ce3eacf0453a7e54c608c4ce8ba7fe307ddc48cdc1` | `0658345cf7e876a456e43c4c3647655849d5ec5cfa2fa3334d27874cee34d202` |
| Woodyard | `0ff7b5de90d9d4d1a7af925ca2b508c292f17045714d63c49886d01887d38781` | `333e85a41a745d394da953d387ef6a24bb898982ec9d70223876e029a28221bb` |

| Model | Bytes before → final | Triangles before → final | Final nodes / meshes |
|---|---:|---:|---:|
| Stable | 47,652 → 465,108 | 776 → 4,432 | 38 / 37 |
| Woodyard | 56,728 → 546,460 | 2,360 → 4,952 | 18 / 17 |

The final GLBs are uncompressed local build artifacts. Their full hashes intentionally differ from the original hosted lib prefixes. Route contracts retain original `lib` as provenance; parent must substitute the newly served lib after verified upload, not spawn the old lib accidentally.

### Exact world and local contracts

- Stable: `pos:[43,0,0]`, `yaw:-1.5707963267948966`, `scale:1`, `parent:null`, `comp:{}`.
- Woodyard: `pos:[16,0,31]`, `yaw:-2.669815142409043`, `scale:1`, `parent:null`, `comp:{}`.
- Stable serialized bounds: min `[-3,-0.20000000298023224,-2.7750000953674316]`, max `[3,4.900000095367432,2.574972629547119]`.
- Woodyard serialized bounds: min `[-2.0999999046325684,-4.76837147544984e-9,-1.090248942375183]`, max `[2.875746011734009,3.559999942779541,1.5084253549575806]`.
- All four decoded X/Z extrema are **exactly equal** to their corresponding frozen baseline values, not just rounded `/geom` bounds. Height increases are deliberate: stable baseline top `3.4417715072631836`; woodyard baseline top `2.5257210731506348`.
- Stable original floor triangles remain fixed at approximately `Y=.2`; original stoop and threshold remain fixed. Door test floor datum `.22` is the original threshold lip, not a raised clearance trick. The apron only completes support around it.
- Woodyard feet remain on original grade `Y=0`. No room-floor or invisible envelope-padding geometry was introduced. Its baseline minimum Y has nanometre-scale Draco residue; no functional floor-height change was made.

### Retained identity and furniture

Triangle-multiplicity verification compares decoded output to the frozen source after only the manifest's explicit rigid transforms, rounded at 0.1 mm:

- Stable: **25 retained components / 452 triangles**. Floor, stoop, threshold, saddle and stand, tack pegs, harness, bridle, outside trough and water stay at their original coordinates. Hay shifts within the right stall; pitchfork and grooming shelf shift out of the circulation lane; both original manger/hay assemblies rotate to the stall sidewalls. The `glow` group survives; one entrance glow triangle group moves with the redesigned entry lantern and the rear glow stays fixed. No frozen host component targets these glow nodes.
- Woodyard: **106 retained connected components / 2,228 triangles**. Original 87-log stock is retained at its source coordinates (connected-component count is not log count). Original stump and both axe submeshes remain unchanged; exact `wy_axe` anchor name/rest identity survives. Kindling shifts by `[-.8,0,-1.65]` into the store instead of remaining in the work/approach area. The frozen woodyard component bag is empty: no axe motion is invented or silently added.

Material bytes are intentionally redesigned, not claimed identical. A visual iteration exposed an actual export issue: plain, untextured hay/leather omitted glTF materials and read black under glTF metallic defaults. Lane-local textured PBR materials now serialize explicitly; final primitive-material audits show **37/37 stable and 17/17 woodyard primitives have explicit materials**. Hay is straw-colored, tack brown, trough water blue with restrained emissive support. The shared writer is untouched.

## Geometry and protected companions

Custom lane-local roof prisms enforce the exact roof X/Z edges. Gables evaluate the true overhang roof slope at the inner wall plane; the known copied-kit gable wedge is not used. Courses are actual staggered slate prisms, with continuous underdeck, ridge, eaves and verges. Joinery is attached to frame members; woodyard bench front supports no longer occupy the original log stock.

Protected art and signs are decoded from frozen bytes and assembled using their exact source world tuples:

- `nx-artwalk-b8-stable-harmonic-rein`
- `nx-sign-stable-001`
- `nx-artwalk-b11-woodyard-heartwood-measure`
- `nx-sign-woodyard-001`

All four protected-volume tests report **zero unauthorized host-triangle intrusions, without allowances**. New backing stays behind the original faces. The woodyard sign necessarily overlaps the artwork in a centered frontal sightline because both are frozen, but the heartwood face is exposed from meaningful work/approach angles. No claim is made that every angle is unobstructed.

`nx-town-stable-l` remains protected at `pos:[43,1.9,1.8]`, `color:16756838`, `intensity:1.4`, `range:5`. It was not moved, recreated, weakened or absorbed into the GLB. Exact frozen related records are supplied in `build/nx-town-*-companion-contract.json`. Local renderers do not instantiate live world light entities, so dark solo night frames are not claims about final world lighting.

## Reproducible gates

Run from `/Users/t3rpz/projects/eidoverse-worlds`:

```sh
bun agents/arthur/village-overhaul/build-stable.ts
bun agents/arthur/village-overhaul/build-woodyard.ts
python3 agents/arthur/village-overhaul/build/nx-town-stable-verify-final.py
```

The final Python gate was actually run and exited **0**. It double-builds each model, records advancing nanosecond mtimes and identical full hashes, runs triangle retention/falsification checks, recreates hash-bound source assemblies, verifies frame/material coverage, runs the actual public collider modules, validates all render manifests against final bytes and asserts frozen inputs are unchanged across execution.

The browser-collider module gate is always pinned with:

```sh
CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime \
  bun agents/arthur/cabin-overhaul/verify-player.ts \
  agents/arthur/village-overhaul/build/nx-town-stable.glb \
  agents/arthur/village-overhaul/build/nx-town-stable-route-context.json \
  agents/arthur/village-overhaul/build/nx-town-stable-player-context.json
```

For woodyard, use the actual `probeApproach` results in `build/nx-town-woodyard-approach-context.json` (generated by `build/nx-town-stable-verify-roof.ts`); substituting woodyard into the exact-only room CLI intentionally exits 1 for its automatic pillar, not an access failure. Runtime manifests pin `colliders.js` to `b251bf7d894fb7be25d477bffab781d8a192e9f076d201aa9bdd342f32f34826` and `supportclass.js` to `b19727b1e13e02dd4adcba3459705dcc9a5356d7352342d2d1b6a3efe3c5672e`. The actual pinned classifier uses `ROOM_MIN_AREA=16`, not outdated skill prose constants. Binding is the repository core stub/Three revision 184/three-mesh-bvh, not a full deployed renderer clone or live walk.

| Gate | Stable | Woodyard |
|---|---|---|
| Classification | automatic exact; `roomScale:true`, no pillar | automatic pillar; `roomScale:false`; actual external-workstation access PASS |
| Required full-height triangle volumes | entry + central aisle, each 1.65 m × 2.2 m; 0 hits | sign-left approach, 1.4 m × 2.2 m; 0 hits |
| Bidirectional route | 20/20 legs; entry, saddle station, feed aisle and both care stalls | 14/14 legs; fuel selection, joiner's bench, vise and axe/stump |
| Context packet | all 5 supplied neighbors | all 10 supplied neighbors |
| Route pushes / swept geometry hits | 0 / 0 | 0 / 0 |
| Protected art/sign intrusions | 0 | 0 |

The separate `*-player-baseline.json` runs are intentionally failing controls, not accepted baseline navigation: stable's new advertised route finds 50 entry-volume and 88 aisle-volume intrusions and passes only 6/20 legs against old geometry; woodyard's old roof/post geometry gives 11 approach-volume intrusions and a default pillar. The final woodyard `*-player-default.json` fails **only** the exact-collider requirement; all 14 route legs and the triangle-volume test still pass. These results are preserved, not suppressed.

Triangle falsification controls include a triangle crossing the test box with every vertex outside and a clear noncrossing triangle. This guards against a misleading vertex-only doorway check. Terrain `Y=0`, supplied neighbor coverage and frozen world poses are caller contracts; parent still owns fresh terrain and live integration.

## Actual visual evidence and camera coverage

The official `../cabin-overhaul/render.ts` generated nine views for each frozen baseline and final model under identical camera JSON. It also rendered nine tailored baseline/final assembly detail views with exact protected art/sign bytes. No camera was re-framed only for the candidate.

- Stable solo camera SHA: `cef1fabbdbc3a09c1a0aeb3444483b284df31ac1324790017448594febb7f5b9`.
- Woodyard solo camera SHA: `9e79588ff2c409c6c9e061aa90b065aef9acafb845f6151be1093392313ec30c`.
- Stable detail camera SHA: `629f323782e2b8d618a9e99bc7fce8f4180295fb44c5663773ce5db483fb3428`.
- Woodyard detail camera SHA: `76728c05a84ef3069442aaf9087c78913fe90c0bde2b40acc2dd29bebe94c8e2`.

**Use these true exterior roof views for parent acceptance:**

- `reviews/nx-town-stable-after/aerial.png`
- `reviews/nx-town-stable-after/top.png`
- `reviews/nx-town-woodyard-after/aerial.png`
- `reviews/nx-town-woodyard-after/top.png`

The `candidate-details/aerial.png` cameras intentionally point upward from inside to inspect trusses; they are **not exterior roof evidence**. The solo top frames show both roof slopes/ridge, and the solo aerial frames show eaves/gable relationships. Decoded-vertex projection checks confirm all geometry fits every one of the eight solo exterior cameras, with zero out-of-frustum vertices. Interior/detail cameras are intentionally cropped and excluded from that full-envelope framing assertion.

All nine before and final solo frames, all nine final detail frames, plus the individual final roof aerial/top views were submitted to `vision_analyze`. **In this child session that tool returned textual auxiliary analysis, not image pixels to the reasoning model.** Do not relabel its internal claim of receiving an image natively as child-native inspection. Parent independently performs native review. Auxiliary analyses sometimes misidentified baseline feeders as seats and roof details as texture-only; the source and decoded geometry govern those facts.

Observed visual results: final stable reads as a coherent furnished barn with complete roof/closed gables; woodyard reads as an organized crafted timber workbay with identifiable working furniture and attached braces. Actual hay/tack black-export defect was corrected and final imagery reviewed. Final roof aerial/top analyses found no definite gross roof separation, open seam or missing corner. Remaining presentation reservations are heavy but consistent timber/roof edge detailing, busy stone patterning, the frozen artwork's low contrast, and weak solo night illumination. These are disclosed, not invented functional failures. The unchanged sign/art placement prevents curing their centered sightline overlap without violating scope.

Parent reported woodyard visually accepted, with true exterior roof coverage requested; stable awaited the true exterior roof image rather than a demonstrated defect. Parent's final native verdict is not claimed by this child.

### Render controls

Identical-byte official rerenders show sparse pixel-order variance. A lane-local copy, `build/nx-town-stable-render.ts`, changes only opaque render ordering plus its deeper package path; shared renderer, model geometry/material bytes, lighting and camera data remain untouched. Its independent `ordered-a` / `ordered-b` outputs are pixel-identical in all nine views for both models. This is supplemental renderer control evidence, not replacement official imagery or proof that no coplanar surfaces exist. Full counts are in `reviews/nx-town-*-render-controls.json`.

## Owned files and remaining work

Authored `build-stable.ts`, `build-woodyard.ts`, this note, and the `nx-town-stable*` / `nx-town-woodyard*` outputs under `build/` and `reviews/`. Lane-owned helpers include final-freeze, retention, render-assembly, frame/material and supplemental render-control scripts. No other model outputs were rebuilt by these builders.

Start integration at `build/nx-town-stable-final-verification.json` and `build/nx-town-woodyard-final-verification.json`; each binds final bytes, complete host tuple, retained geometry, context-route results, matching-camera manifests and source/input hashes. `*-route-context.json` are the full local route contracts; `*-route.json` includes only the two directly attached geometry companions.

Remaining parent-only work: any final native integration review; upload and exact host replacement with automatic woodyard collision preserved; preservation/readback of all component and companion/light records; served-geometry reruns and genuine live snapshots/walks. **No clean static TypeScript typecheck is claimed:** editor diagnostics reported incompatible Three Mesh/Object3D and Bun import-meta declarations; actual Bun builds, decoded-byte tests and pinned collider execution pass.
