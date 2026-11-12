# Dyehouse + market architectural overhaul

## Handoff

- **Dyehouse: READY for parent integration / `PASS_NON_ROOM`.** Ten bidirectional full-body approach legs pass with the complete six-entity supplied neighbor assembly, the pinned public-runtime collider modules, and the parent-approved host `collide: 'exact'` correction. This is a craft workstation, not a room.
- **Market: design and local evidence complete; `HOLD_EXISTING_COMPANION_COLLIDER`.** Final host geometry, protected-art backing/exposure, roof/string-light clearance, lamp-origin clearance, deterministic generation, and matched-camera evidence pass. The unchanged `nx-core-paths` companion produces an unsupported +0.058276183903217316 m box-top floor. Baseline and candidate show the same actual floor failure, with zero push and zero body-geometry obstruction. No waypoint height was changed to conceal it.
- Parent owns native final acceptance, any explicit companion-collision scope decision, deployment, component readback, live terrain, and served-geometry reruns. **No world connection, uploads, verbs, credentials, GUI, original source edits, or commits were used by this lane.**

## Deliverables and architecture

Owned builders: `build-dyehouse.ts`, `build-market.ts`. Both use **only campaign `kit.ts` finish**. The dyehouse file also contains lane-local geometry and offline audit/ensemble helpers; importing it from the market builder does not build the dyehouse.

### nx-town-dyehouse

Replaced the thin sloped shed with a braced, open-gabled slate pavilion on stone pier feet and real wash-court paving. Limewashed windbreak is a physical backing for the crossing-loom artwork. Three stave-built open vats contain distinct visible dye surfaces; their resting paddles remain below the artwork's lowest band. Raised blue/bone cloths, a side folding bench, colored folded cloth and an indigo bolt preserve an explicit textile trade. The low fixed sign is carried by a short drop from the front framing; it was not raised to manufacture a doorway. Existing lamp origin now has a supported lantern.

### nx-town-market

Replaced the two spindly trestle stalls with one continuous slate-roof produce pavilion on three braced timber bents and masonry/cabinet counter bodies. Four filled display crates distinguish apples, loaves, cabbages and roots. Balance scale, coin till, storage doors, rear shelves, and a heritage cloth bolt retain transactional/work functions. Cream/ochre textile valances sit beneath the real roof, clear of the unchanged string lights. The center post is set behind—not through—the fixed lamp origin. Both lower-front artwork fields remain exposed.

Roofs use **closed vertical-thickness clipped wedges**, not the campaign helper's mismatched filled gables. All roof geometry stays inside the inherited X/Z envelope. Open gables are intentional, visibly framed, not missing wall wedges.

## Exact final assets

| Host | SHA-256 | Bytes | Nodes / meshes | Triangles |
|---|---|---:|---:|---:|
| `nx-town-dyehouse` | `8a916bb1beade151d0bb77694e7363757806dd3165c4b0fc44eb294d3bb2d275` | 278100 | 23 / 20 | 5004 |
| `nx-town-market` | `4950c6d432619891bd778af42c46e69d5e5a9c4c66ab54200126ba1d35500ab3` | 363960 | 20 / 17 | 4268 |

Final host GLBs: `build/nx-town-dyehouse.glb`, `build/nx-town-market.glb`. Decoded evidence: `build/<id>-verification.json`; campaign parts census: `build/<id>.json`.

Actual served baselines were decoded through glTF-Transform/Draco and pinned to `before/downloads.json`, rather than regenerated from source:

- Dyehouse: `0e5204b8fd1d0afb11d9a38583a3155287d91e81de43dbb31e8588856af40fa6`, 27736 bytes, 11 meshes, 788 triangles.
- Market: `87245e97b1f848df57b4c128107586d533a7c3add98b37e39c391cb757f86de8`, 27296 bytes, 10 meshes, 1202 triangles.

Both final builds were run **twice in separate Bun processes**, with matching full hashes and advancing file mtimes. Results and exact builder hashes are in `build/<id>-determinism.json`.

### Envelope and tuple

- Dyehouse unchanged X `[-1.5, 1.7750358581542969]`, Z `[-1.0456808805465698, 1.1456724405288696]`; decoded top Y `3.1105000972747803`, increase `0.9691228866577148` m. Host remains at `[-23,0,-23]`, yaw `0.941`, scale `1`.
- Market unchanged X `[-1.9500000476837158,1.9500000476837158]`, Z `[-0.5023053884506226,0.5699890851974487]`; decoded top Y `3.0404999256134033`, increase `0.8899264335632324` m. Host remains at `[-6.5,0,6.5]`, yaw `2.356194490192345`, scale `1`.
- Both archived host component maps are `{}` and remain `{}`. Retained exact anchor names: dyehouse `dh_strip_blue`, `dh_strip_bone`, `glow`; market `mk_awn_0`, `mk_awn_1`, `glow`. Cloth/valance anchors remain named but no invented wind component is added.
- Public runtime default fits: **baseline box → candidate center pillar** for both hosts. Neither footprint is room-scale: dyehouse `7.17676070440757 m²`, market `4.181948549489448 m²`. Final functional contracts explicitly request parent-approved **host-only `collide: 'exact'`**; this is not an engine change or a new component.

## Protected contracts and geometry

Exact archived companion bytes and poses were used. Host triangles are clipped against each decoded protected mesh volume with 1 mm boundary tolerance. There are no broad intrusion allowances.

- Dyehouse: zero host triangle intrusion into crossing-loom, original sign, or nearby accepted row cottage. All 18 backing-ray witnesses pass. Loom display-field and sign-face exclusion prisms have zero new-host triangles. The sign retains its `1.4000000238418577 m` lowest Y; front routes turn around it rather than under it.
- Market: zero intrusion into both B6 Lissajous panels, B30 tally, string-light meshes, banner, and gift shelf. All 27 backing-ray witnesses pass. Both lower-front display fields have zero new-host triangles.
- Light-center exclusion volumes contain zero non-emissive host triangles. The only excluded geometry is the deliberately centered `glow` emitter, not framing. Dyehouse unchanged world light `[-23.625,1.62,-21.971]`; market unchanged world light `[-6.217157287525381,1.75,6.217157287525381]`. Both retain color `16756838`, intensity `1.35`, range `4.5`.

### Frozen market artwork conflict

All three artworks survive exactly. The right B6 board is already in front of B30: B30's maximum Z is `0.4380367398262024`; the right board face lies at approximately `0.4774649018049239` (center motif reaches `0.5154922330379486`). Rays through all five old coin centers hit the unchanged right board first. **This pre-existing concealment cannot be repaired while preserving both exact companion poses.** No arbitrary move or claim of tally restoration was made. The new host itself does not add an obstruction.

## External service access and inherited market HOLD

Read-only `../cabin-overhaul/verify-player.ts` provides exact mesh/assembly decoding and the pinned runtime loader. Parent-owned `verify-approach.ts` provides continuous swept whole-body tests and the actual browser collider. `CABIN_PLAYER_RUNTIME_DIR` is explicitly `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime`.

- **No room-door CLI test is claimed.** These are shallow workstations, so applying the cabin room gate would create a false enterability contract.
- Dyehouse: six meaningful waypoints approach left/right vat stations through the external front strip, with an explicit lateral turn around the low sign. **10/10 directional legs PASS**, zero body geometry hits/push, full six-neighbor supplied assembly.
- Market: eight waypoints approach bread and produce counters; **14 directional legs fail only the inherited floor expectation**, with **zero horizontal push and zero body-geometry intersections**. Full ten-neighbor assembly is retained; nothing is silently omitted.
- Flat terrain `0` is an explicit local assumption. The actual geometry and collider behavior of supplied neighbors is included; this is not a live terrain/walk proof.

### Exact offending companion tuple

```json
{
  "id": "nx-core-paths",
  "lib": "store/c31b6e3f22641e14.glb",
  "pos": [0, 0, 0],
  "yaw": 0,
  "scale": 1,
  "collide": null,
  "comp": {},
  "file": "agents/arthur/village-overhaul/before/nx-core-paths.glb",
  "sha256": "2a6a725528cf444e0eae773996bc2fef105c8a5386a301fe7e8c5325a0237999"
}
```

`build/nx-town-market-baseline-approach.json`: original market default box, 14/14 failed floor legs, actual Y `0.058276183903217316`, max push `0`, geometry hits `0`.

`build/nx-town-market-approach.json`: candidate host exact, same 14/14 floor failures and actual Y. Individual `nx-core-paths` collider/geometry witnesses at all eight stations show that box-top ground while downward triangle rays return **null**. This is false support, not a raised threshold or a new market obstruction.

The same report preserves `diagnosticOnlyUnapprovedExactCorePaths`: a **local-only hypothetical** exact path-collider fit yields **14/14 PASS**, with the full assembly unchanged otherwise. That experiment is **not an approved final companion contract**, and no state was changed. The HOLD remains for parent scope decision.

## Matching-camera visual evidence

Every image was rendered by unmodified `../cabin-overhaul/render.ts` in loopback-only headless Chromium from the actual GLBs. Model roots were not recentered or resized. Before cameras were reused verbatim for after; exterior frustum checks pass for all 32 baseline/candidate solo/ensemble views per model. Interior views are explicitly closeups. Each baseline was re-rendered as an identical-byte control: **9/9 PNG hashes identical** for each model. No custom draw ordering was required.

Useful review entry points:

- `reviews/nx-town-dyehouse-detail-comparison.jpg`
- `reviews/nx-town-market-detail-comparison.jpg`
- `reviews/<id>-ensemble-comparison.jpg` — matched aerial pair.
- `reviews/<id>-after-nine.jpg` — nine final solo views.
- `reviews/<id>-ensemble-after-nine.jpg` — nine final composite views.
- `reviews/<id>-before/`, `-after/`, `-ensemble-before/`, `-ensemble-after/`, `-detail-before/`, `-detail-after/` retain individual full-resolution images, camera JSON and hash-bound render manifests.
- `reviews/<id>-framing-control.json` records actual frustum and identical-image results.

**Vision route disclosure:** lane image inspection used `vision_analyze`, which returned **auxiliary textual analyses**, not direct native-image judgment by this lane. Final solo and composite nine-view reviews found coherent grounded framing, continuous roofs, recognizable trades, and no obvious new lower-art obstruction. The matched market detail review specifically identified the dark lower panels correctly and confirmed their faces exposed. One dyer paired-detail auxiliary call timed out; it is not counted as a successful judgment. Parent native batch review is separate and was underway at handoff; no more auxiliary calls were made after that steering.

The fixed renderer's raw caption says `LOCAL SOLO` even for an input assembled into a composite GLB. Composite manifests and comparison-sheet headers explicitly identify these as **local composites, not in-world**. No live terrain, world lights, or component evaluator is present. Night renders are consequently dark and show material emission only. Rendering produced zero console/page errors; the only warnings were GPU `ReadPixels` performance notices. Fine artwork and trade details naturally reduce at 18 m gameplay scale.

## Reproduction

From `/Users/t3rpz/projects/eidoverse-worlds`:

```sh
bun agents/arthur/village-overhaul/build-dyehouse.ts
bun agents/arthur/village-overhaul/build-market.ts
CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime bun agents/arthur/village-overhaul/build-dyehouse.ts --audit
CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime bun agents/arthur/village-overhaul/build-market.ts --audit
bun agents/arthur/village-overhaul/build-dyehouse.ts --ensemble nx-town-dyehouse after
bun agents/arthur/village-overhaul/build-market.ts --ensemble after
```

Inspect the audit **status field**, not just process exit: market intentionally preserves its HOLD rather than rewriting an unrelated path contract. Builders execute successfully in Bun. Per-file LSP diagnostics reported missing `Mesh`/`Group` properties; no project-wide clean TypeScript claim is made.

Original scripts read-only: `assets/mkv3-dyehouse70.ts`, `mkv3-market.ts`, `mkv3-sign-dyer.ts`, `mkv3-artwalk-b30.ts`; shared writer/merge helpers were read but unchanged. Ensemble export initially rejected multiple glTF buffers; lane code now consolidates accessors into one buffer before writing. No original asset or accepted cabin file was touched.
