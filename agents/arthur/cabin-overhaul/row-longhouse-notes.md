# Row cottage / longhouse — final local overhaul packet

## Delivered

Complete replacement shells using the shared cabin kit: pale lime infill, substantial timber bays, true wall/window apertures with glazing, layered slate roofs, stone footings, new hearth-aligned masonry stacks. Original room floor plates and finished Y=.2 remain. Only `build-row.ts`, `build-longhouse.ts`, this note, and their generated `build/` / `reviews/` outputs were authored. Original ring source, raw assets, shared kit, placers, lights, riders, and live state were not changed. No commits, uploads, live joins, or verbs.

- **Row:** full front-facing west cross-gable, tall offset entrance, real attic aperture, resolved intersecting ridges and physical valley strips. No tiny flat dormer remains. Weaver loom, thread basket, dye shelf and three jars, furnished bed with ruled blanket, linen chest, table, herbs, fire/candle roles remain. Open stone hearth replaces the old fully occluding timber block within its previous envelope. Front lamp moves below the central plaque; no host light comp exists.
- **Longhouse:** wider inhabited porch/gallery, full pitched lower slate roof instead of the narrow shed canopy, supported timber bays and stone-paved grade-level deck, larger/higher main roof with gable trusses, paired windows, substantial hearth stack. Communal tables, benches, sleeping mats, high-seat/dais and complete feast kit, bed alcove, six firewood logs, herbs, three provision chests, original fire/candle/lamp anchors remain. Open stone hearth replaces the opaque timber block; lamp gains physical mount/hood. New porch seats are outside the clear center approach.

## Final bytes and geometry

| Host | SHA-256 | Bytes | Nodes | Triangles |
|---|---|---:|---:|---:|
| nx-town-row-cottage | `0558b5f41bda077772846350737047605f628d9b97a7c159d1f6b9d4574bccfc` | 395820 | 23 | 4744 |
| nx-town-longhouse | `e38bb2a4c79336980d0a6b7479959498dc0347ab69d611b089741af7cf63b29f` | 610648 | 22 | 7482 |

Both final scripts ran twice with byte-identical output and identical stats. Evidence: `build/row-longhouse-double-build.json`.

Decoded final bounds (rounded display; exact float values in report):
- Row min `[-2.84,-.2,-2.64]`, max `[2.84,5.374,2.64]`; baseline served bounds X ±2.950000, Z `[-2.673259,2.719996]`.
- Longhouse min `[-4.61,-.2,-2.91]`, max `[4.61,5.874,4.2875]`; baseline served bounds X ±4.6999998, Z `[-2.922757,4.301304]`.
- Both X/Z envelopes remain inside `before/contracts.json` **and** the independently Draco-decoded served baseline. Height growth is deliberate.

## Player contracts — PASS

Final hash-pinned contracts in the parent verifier's expected schema:
- `build/nx-town-row-cottage-route-contract.json`
- `build/nx-town-longhouse-route-contract.json`

Actual parent `verify-player.ts` reports:
- `build/nx-town-row-cottage-player-report.json`: **PASS**, 10/10 two-way legs, zero swept-body geometry hits and zero lateral pushes. Door 1.45m clear ×2.35m headroom over real Y=.2 floor.
- `build/nx-town-longhouse-player-report.json`: **PASS**, 16/16 two-way legs, zero swept-body geometry hits and zero lateral pushes. Inner door 1.68m ×2.4m over Y=.2 floor. Porch corridor 1.6m ×2.2m over real Y=0 deck.
- Both automatically classify as the real browser's exact trimesh, without forcing a collision policy.
- Independent host+unchanged-rider harness: `build/row-longhouse-verify.ts`; report `build/row-longhouse-verification.json`. Actual decoded triangle/box intersections are zero in both door volumes and the longhouse porch. Positive wall controls hit 18 and 10 triangles. Surface-under samples confirm ground 0, porch 0, room/threshold .2. Largest sampled step is .200000003m. Host+rider player routes have zero lateral push; exact backing planes confirmed by BVH raycasts.
- Room inventory assertion covers 27 row and 32 longhouse required named parts, including all key identity ensembles. `build/row-longhouse-final-bindings.json` binds current bytes, inventories, same-camera renders, and passing player reports.

### Necessary rider-aware entrance decisions

B18 original anchor `[0,2.22,2.2825]`, backing X `[-.81,.81]`, Y `[2.22,2.68]`, rear plane Z=2.25. Retaining the old centered door under this plaque leaves only 2.02m above the .2 floor. The new doorway is therefore **west-offset**, clear X `[-2.29,-.84]`; its route turns into the room before reaching the original west hearth. The central plaque stays exposed on an exact Z=2.25 backing face. The new lamp is below, not across, its artwork.

B19 original anchor `[0,2.22,4.32]`, backing X `[-1.6,1.6]`, Y `[2.22,2.54]`, rear plane Z=4.2875. New porch deck top is grade Y=0, so the unchanged low plaque has the required headroom; a single .2m step rises into the original room. Supporting fascia starts at Y=2.205 and its exposed front is exactly Z=4.2875. Do not raise this porch deck during integration.

Both protected-volume tests have zero unauthorized host triangles. Rider front/aerial ensembles preserve original GLB geometry/materials and exact anchors. `*-rider-review.glb` files are **review-only assemblies, never upload as host replacements**. Existing longhouse B19 placer has stale historical `HL=store/f2344409ac67fd77.glb` versus baseline `store/c4aaa7833a1336ac.glb`; this packet does not authorize a rider migration or placer mutation.

## Actual rendered and visual evidence

Final host renders:
- `reviews/after-row-final/`
- `reviews/after-longhouse-final/`

Each contains nine actual 960×720 PNGs: front/right/back/left/gameplay/aerial/top/night/interior; exact SHA-bound manifest; `nine-view-survey.jpg`; and `before-after.jpg`. Before images use actual Draco-served bytes in `before/`, not stale rebuilt originals. Both final camera hashes exactly match their baseline rigs. All final renders completed with zero browser errors; only GPU readback performance warnings.

Unchanged rider ensembles: `reviews/row-rider-final/`, `reviews/longhouse-rider-final/`; combined front/aerial sheet `reviews/row-rider-final/both-riders-review.jpg`.

**Review provenance:** actual images inspected through `vision_analyze`'s auxiliary reviewer; no unsupported native-vision claim. Two initial analysis calls timed out, then retried successfully. Final nine-view surveys, before/after sheets, and rider ensembles were all inspected. Rider reviewer confirms both plaques are visibly exposed and mounted; longhouse entrance hierarchy reads clearly, row entrance reads as an open recessed bay. No major roof gap or detached roof was identified. Final row valley remains visually pronounced and could be refined later; no further scope was added.

**Residuals / conflicting visual judgments, not hidden:** inherited row bedding remains very dark in both baseline and final interior views; the solo renderer cannot establish whether this is a flat-material/lighting limitation. One final reviewer called this a major interior finish issue. Longhouse interior furniture remains visually blocky (original room program retained), and night porch entry is subdued without actual world lights. One comparison reviewer misclassified the longhouse as unchanged geometry; source/decode contradict its specific assertions (porch widened from 3.6 to 5.85m, narrow shed changed to lower gable, main roof rise 1.7→2.05, eave 2.8→3.05, side/back/front apertures rebuilt). Other reviewed longhouse views describe a coherent substantial redesign. Parent should judge final pixels rather than treating either auxiliary opinion as a live visual PASS.

**Parent acceptance received after this packet's review:** parent independently rendered and accepted row `0558b5f4` and longhouse `e38bb2a4` across all nine views in `reviews/parent-*`, and independently confirmed row 10/10 and longhouse 16/16 player legs PASS. Builders are frozen at those exact hashes; no further source changes followed acceptance.

These are **local** visual/player checks, not live-world acceptance. Protected external light entities were untouched and are not simulated by the solo renderer. Actual terrain/neighbors/live lighting and the moved row entry's world-side approach remain for parent integration review. No live migration is approved or attempted here.

## Kit finding for parent — kit.ts untouched

`roof()` defines gable triangles using wall half-depth d/2, while roof slopes use (d+2*over)/2. This leaves narrow triangular edge gaps. Both builders add local `sealGableEdges()` closure wedges; row custom front gable uses the corrected five-point section. If parent fixes shared kit's gable section, remove these local wedges to avoid coplanar duplication. Current kit SHA: `da453cb1e437bbc6889cffe1f16d692a933fa1c956a7dc13e09a087526690b72`.

## Re-run from repository root

```sh
bun agents/arthur/cabin-overhaul/build-row.ts
bun agents/arthur/cabin-overhaul/build-longhouse.ts
bun agents/arthur/cabin-overhaul/build/row-longhouse-verify.ts
bun agents/arthur/cabin-overhaul/verify-player.ts agents/arthur/cabin-overhaul/build/nx-town-row-cottage.glb agents/arthur/cabin-overhaul/build/nx-town-row-cottage-route-contract.json agents/arthur/cabin-overhaul/build/nx-town-row-cottage-player-report.json
bun agents/arthur/cabin-overhaul/verify-player.ts agents/arthur/cabin-overhaul/build/nx-town-longhouse.glb agents/arthur/cabin-overhaul/build/nx-town-longhouse-route-contract.json agents/arthur/cabin-overhaul/build/nx-town-longhouse-player-report.json
```

Rerender final host GLBs using `render.ts` and the matching `reviews/before-*/camera.json`; never reframe the candidate automatically. Build script runtime and both verifier paths execute successfully. Existing repository TypeScript stubs emit Mesh-property/type warnings under editor diagnostics; no whole-repository clean typecheck is claimed.
