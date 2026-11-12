# nx-town-hall — local architectural overhaul handoff

**Status: local gates PASS; parent final native acceptance, integration and live verification pending. No upload, world verb, credential read, GUI use or commit performed.**

## Deployable artifact

- GLB: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/nx-town-hall.glb`
- Full SHA-256: `dc871edb1b45ce0f22906bc8ed8227da2cb1a0dbc1e908e1bd3522c3b581286a`
- Size: **961,972 bytes**; **11,584 triangles**; **28 scene nodes/renderable mesh instances**, **25 unique glTF mesh definitions**. Instances and mesh definitions differ because retained lamps share meshes.
- Source: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build-hall.ts`
- Source SHA: `8efca64f25ac85722102661506530d03ec319d1dbe983e468a881801a7deb0a0`
- Frozen host tuple remains exactly **id `nx-town-hall`, pos `[9,0,-26]`, yaw `-0.31322457341772525`, scale `1`, parent `null`, comp `{}`**. No new component requirements.
- Decoded default-scene final bounds: min `[-5,-0.20000000298023224,-3.4700000286102295]`, max `[5,7.164999961853027,4.849999904632568]`.
- Actual before render bounds: min `[-5,-0.20000000298023224,-3.472568988800049]`, max `[5,6.168531894683838,4.853924751281738]`. Final X/Z remains contained within the original envelope. Highest point grows **0.9964680671691895 m**, to the chimney cap; parent must review that permitted height growth.

## Architectural change

The low single-roof cabin is replaced with an **aisled civic hall**: raised clerestory nave, layered slate roof, lower aisle roofs, three hammerbeam bents, high collars and principal rafters, substantial lime infill and stone plinths. An east-gable oculus is a real circular opening with inset leaded glass, not a pane pasted on a solid wall. Its lower record-wall elevation has deliberate tripartite timber framing. The front entrance has a post-supported slate gabled porch, stone footings, knee braces, continuous ridge and explicit rear gable closure into the lower roof. Both opposite entrances remain open.

Interior craftsmanship includes boarded floor over continuous support, retained council furniture with added stretchers/leg tenons, ledger lips, supported porch sconces and a hearth hood with continuous masonry flue. This is a new roof/shell/interior structure, not extra cabin trim.

**Known kit gable gap avoided locally:** the builder does not call the copied `roof()` helper. Custom closed end prisms follow the actual roof pitch at the wall plane, including the clerestory step. The porch rear has its own closed triangular solid with overlap into the roof deck. The front porch gable is intentionally open framing.

## Served-byte furnishings and source provenance

Frozen source GLB: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/before/nx-town-hall.glb`.

- Served baseline full SHA: `b36554d18d70bc5cb45af9892667e59c4600caf3131c82ca3308f4a55e57de16`.
- Frozen lib identifier: `store/c92c1f91ed4fd45f.glb`. Do not confuse this identifier prefix with the actual downloaded-byte digest.
- Read-only source located by symbol `MEETING HALL v3` in `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/mkv3-ring.ts`, lines 661–792. It was not run or edited.
- Read-only source explained function; actual decoded Draco geometry determined retention.

**780 triangles remain in their exact served pose**, comprising council table/legs, two bench rows, three stools, six ledger books and two shelves, decision-history frieze, speaker dais, firewood stack, firebowl, fire and all seven named lamp anchors. The retained named nodes include `firebowl`, `fire`, `lamp`, `lamp2`, `lamp_nsconce_l`, `lamp_nsconce_r`, `lamp_porch`, `lamp_slant_l`, `lamp_slant_r`. There are no hall motion/socket components to restore.

The old **228-triangle founding banner/wheel assembly** intersected the west wall sideways. Its exact decoded geometry/materials are preserved but it is deliberately reoriented and raised above the separate protected charter: Y rotation `π/2`, old reference anchor `[-4.35,0,0]`, new reference anchor `[-4.24,1.9,0]`, ornament plane shifted inward to `x=-4.17`. This is an explicitly disclosed internal display relocation, not a change to host pose or any companion entity.

Fresh emitted-byte comparison proves **20 retained primitive streams** match the selected source: referenced raw POSITION/NORMAL/COLOR/UV values, normalization, world matrices, material scalar values and original texture-image bytes. The banner comparison uses its declared relocated frame. The original WebP textures and `EXT_texture_webp` remain intact. Only decoded Draco compression is removed; there is no lossy recompression. Selected indexed geometry is compacted so discarded vertices cannot pollute browser bounds.

## Exact companion bindings

**West charter: `nx-artwalk-b1-hall-charter`**

- Lib `store/100eb5e9e89694a9.glb`.
- Full served SHA `53f77cb8f17d264bce019915ebf3695d724f82c7b97468c45f9c5567562814d4`.
- Exact world pos `[4.928243671768526,1.1,-27.318787474730843]`, yaw `-0.31322457341772525`, scale `1`, parent `null`, comp `{}`.
- Host-local decoded volume: x `[-4.3199999991059315,-4.124963833689691]`, y `[1.1149999978020788,2.884932255744934]`, z `[-1.3999999761581436,1.3999999761581405]`.
- **Binding plane:** west interior wall; artwork faces inward along **+X**. The new timber backing face is **x = -4.321**, about 1 mm behind the back of the artwork. Backing volume x `[-4.342,-4.321]`, y `[1.045,2.955]`, z `[-1.47,1.47]`. Carved lime backing behind it ends at x `-4.331`.
- No host triangles intersect the slightly expanded protected artwork volume or the additional inward view slab x `[-4.124,-3.95]`. **No intrusion allowance/exemption is used.**

**Authored light `nx-town-hall-l`** remains exact: world pos `[9,2.5,-26]`, host local `[0,2.5,0]`, color `16756838`, intensity `1.7`, range `6.5`. A 14 cm cube centered at its origin contains no host triangles. The renderer does not evaluate this light.

The route and review assembly load **all 13 frozen neighbors** from `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/neighbors/nx-town-hall.json`: north gate, town roads, H5 artwork, shelltower, hall charter, three golden-gate artwork pieces, bake-count, north waystone, bakery sign, court and waterstair. This includes the large town-road network rather than filtering by entity-center distance. Full SHA/path and original tuple pins are explicit in the route contract. Other companion components remain parent-managed, untouched inputs.

## Functional proof

Route contract: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/nx-town-hall-route-contract.json`.

Actual public-runtime modules are pinned by `CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime`; no fallback to invented collider thresholds. Result is **exact browser collider, roomScale=true**.

- Front and rear doors each pass **1.8 m × 2.4 m** triangle-volume clearance from the true threshold surface **floorY=0.2**, not an elevated fake clearance datum.
- Porch approach passes **1.4 m × 2.2 m**.
- All doorway triangle intrusion counts are **0**; artwork/view-slab/light-origin intrusion counts are **0**.
- **42/42 bidirectional route legs PASS**, including ground → porch → threshold → assembly aisle → council table/stools → hearth viewing → speaker dais → charter-reading station → rear egress, with supported detours and returns.
- **13 neighbors** are decoded into the real collider assembly.
- Maximum lateral push **0 m**; largest real step **0.2499590963125229 m** onto the retained dais; largest terminal floor error **0.010000002384185802 m**, due to the shallow board joints/threshold edge.
- The old firewood stack crosses the dais center. A straight traverse hit its low triangles even when the browser hip probe gave no push. It was **not removed, raised over, or exempted**: the tour visits the dais/charter from the two clear approaches and detours around the hearth. The open central hall through-route remains useful.
- Independent emitted-triangle rays: **428/428** closed-gable samples, **22/22** porch-rear-closure samples, **242/242** threshold-support samples PASS.
- Khronos glTF Validator: **0 errors, 0 warnings, 0 infos, 0 hints**.

## Determinism and evidence files

Two separate real Bun build processes, both exit `0`, rewrote the GLB with increasing nanosecond mtimes and identical full SHA/byte size. Both assembly artifacts also repeat identically. Final renders, player report, validator, preservation and closure reports all bind to the final host digest.

- Machine handoff: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-handoff.json`
- Final statistics: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-final-stats.json`
- Determinism/mtimes: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-determinism.json`
- Build output 1: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-double-build-1.log`
- Build output 2: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-double-build-2.log`
- Decoded source islands and charter: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-baseline-decode.json`
- Retention proof: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-preservation-report.json`
- Player proof: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-player-report.json`
- Closure/support proof: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-closure-support-report.json`
- Independent proof script: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-verify.ts`
- glTF validation: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-gltf-validation.json`

Only the hall builder, these notes, and owned hall/model-prefixed campaign outputs were authored. Campaign `kit.ts`, cabin kit/render/player scripts, original assets and before/neighbor inputs are read-only. The isolated validator dependency was installed under `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-validator-runtime/`, not the repository package manifest.

## Visual review evidence and limitations

**Actual rendered baseline vs final, identical cameras; nine views per side:**

- `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/reviews/hall-before/`
- `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/reviews/hall-after/`
- Shared camera SHA: `9cddb6be3abbfb05df8ac8d6e5ee8d65fb1cfd881f158635e3bf7257a3c0a98e`.

**Nine additional matched-camera assembly details per side:**

- `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/reviews/hall-detail-before/`
- `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/reviews/hall-detail-after/`
- Rig/purpose map: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/reviews/hall-detail-camera.json`
- Shared detail camera SHA: `0a06a96d6c23e8a4a11c9bf820cccc7a486ce110580da13f52d6ad6c8d0d81d6`.

Every directory has actual PNGs, `camera.json`, `render-manifest.json` and `hall-nine-view.jpg`. All individual PNG SHA values were independently checked against the manifests. The detail `front`/`aerial` views examine the porch rear connection; `right` shows ledgers/frieze; `back` shows the exact charter and rehoused banner; `left`/`top` show roof craftsmanship; `interior` shows hearth and speaker space.

The review-only assembly GLBs are `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-review-assembly-before.glb` and `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul/build/hall-review-assembly-after.glb`. **Never deploy these composites.**

Subagent inspection used `functions.vision_analyze`, which returned **auxiliary textual image analysis, not native vision in this subagent**. Final host inspection reports no obvious roof, silhouette, entrance-blockage or displaced-part defect. Final assembly inspection visibly confirms furniture, artwork, hearth/dais and ceiling framing. The baseline is much darker; absence of furniture cannot be inferred from its standard interior view. Historical artwork marks remain abstract/unreadable and some ledger/frieze details appear dark in these renders; the retention fingerprint, not the reviewer prose, proves their exact source fidelity.

Parent independently reviewed early native aerial/front and requested clearer porch connection/east framing. The final candidate includes the additional closure/oculus/framing and detail evidence, but **parent final native acceptance is still pending**.

Limitations: local fixed flat terrain only; no live terrain slope, world light/component evaluator or post-deployment runtime test. Detail day lighting uses higher ambient for diagnostics, identically before/after, not as a live-lighting claim. Night excludes authored world lights. Ray sampling is not a global manifold/watertight certificate. Full component/companion readback, served-asset recompression checks, any inter-lane changed neighbors and live walking are parent integration gates.

## Reproduction

From `/Users/t3rpz/projects/eidoverse-worlds`:

```sh
bun agents/arthur/village-overhaul/build-hall.ts --review-assembly
CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime bun agents/arthur/cabin-overhaul/verify-player.ts agents/arthur/village-overhaul/build/nx-town-hall.glb agents/arthur/village-overhaul/build/nx-town-hall-route-contract.json agents/arthur/village-overhaul/build/hall-player-report.json
CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime bun agents/arthur/village-overhaul/build/hall-verify.ts
bun agents/arthur/cabin-overhaul/render.ts agents/arthur/village-overhaul/build/nx-town-hall.glb agents/arthur/village-overhaul/reviews/hall-after agents/arthur/village-overhaul/reviews/hall-before/camera.json
bun agents/arthur/cabin-overhaul/render.ts agents/arthur/village-overhaul/build/hall-review-assembly-after.glb agents/arthur/village-overhaul/reviews/hall-detail-after agents/arthur/village-overhaul/reviews/hall-detail-camera.json
```

The initial validator run caught stripped WebP extension declarations despite successful rendering; preserving that extension fixed it without changing texture bytes. Index compaction removed stale discarded-vertex bounds. These checks are retained in the builder/proof rather than hidden as manual output fixes.
