# Potter + lime-kiln handoff — local candidates, not deployed

**Acceptance: PASS for local deterministic builds, GLB validity, decoded envelopes, pinned-client external approach, protected geometry/backing and potter part motion. No world mutation.**

## Handcrafted redesigns

- **nx-town-potter:** open kick-wheel studio, not a miniature cabin. A visibly spoked flywheel and throwing head sit between separate limestone-topped wedging and glazing benches. A tall timber drying/display rack carries varied greenware and glazed vessels; open-rim pots, clay stock, wire/tool details, slip bowls, water pail, under-bench boards and restrained tile inlays make the workflow readable. Original empty-envelope furniture was reconstructed, not wrapped in trim. The unchanged separate ruled porch and pottery sign remain separate entities, exposed in assembly renders.
- **nx-town-kiln:** retain the original **lime-burning/slaking** purpose. Individual coursed tapered stone blocks and an open charging shaft replace the simple solid cylinder. A genuine recessed voussoir fire mouth contains retained named `fire` geometry and emissive tongues; old heat rings remain proud of the mouth on four discrete backing pads. The sign's encircling straps stay outside the masonry, with two explicit arm sockets. A rebuilt charging ladder bears on both crown rails; a limestone charge chest, braced slate lean-to, open lime-slaking vat, lime deposits, tools and retained named `glow` lantern complete the yard. It is not a walk-through firing chamber, and no climb/light/interaction component was invented.

Both use `kit.ts` stone, plaster, wood, slate, iron and campaign texture finish. `build-kiln.ts` imports the lane-local shared verification/export helpers from `build-potter.ts`; preserve both source files together.

## Final bytes and real decoded geometry

| Target | Bytes | Triangles | Meshes / nodes | Served collider classification |
|---|---:|---:|---:|---|
| nx-town-potter | 633544 | 17284 | 13 / 14 | box: `exact=false`, `pillar=false` |
| nx-town-kiln | 2198868 | 19768 | 17 / 19 | central pillar: `exact=false`, `pillar=true` |

Final SHA-256:

- Potter: `412bb53af8aca242f1e6f015b529b54025921ac961cb778c340c8f668ce24aed`
- Kiln: `3e96c8b074852ddc150212f35c8236973751c79633c6d7290bcc44da03211e03`

Pinned served baseline SHA-256:

- Potter: `698f2bc412d25fff39453521a18983a5d88f6c0a2d3c713938e765700c711709`
- Kiln: `b2a415c8daeb62a1f0ec7614520ca5335612043165ffe3b4c21755424156c545`

Model-local bounds from decoded exported vertices, not guessed accessor envelopes (rounded here; exact values in `*-decoded.json`):

- Potter: min `[-1.705000043, -0.00000000149, -0.985000014]`, max `[1.670000076, 2.109999895, 0.584999979]`.
- Kiln: min `[-2.194999933, -0.00000000715, -1.260323405]`, max `[2.609999895, 3.110533476, 1.530323386]`.

Both X/Z envelopes fit inside their independently decoded served baselines. Ground epsilon is floating-point noise, not intentional underground geometry. Height changes are deliberate. Host position, yaw, scale and component records are asserted against folded contracts; these builds do not change any host tuple.

Original reference sources were read only: `assets/mkv3-potter41.ts`, `assets/mkv3-kiln38.ts`; served GLBs, rather than old source estimates, govern geometry and pins. `*-baseline-decode.json` records actual named baseline nodes/materials and primitives.

## Executed verification

- **Real double builds:** `*-double-build.json` holds two successive executions, increasing file mtimes, identical output hashes, actual stdout/stderr and source/dependency hashes. The first campaign-writer hash in stdout is an intermediate export; `FINAL_ALIGNED` and the JSON's final hash are authoritative.
- **Khronos validator:** `*-validation.json` reports **zero errors, warnings, infos and hints** for both final GLBs. The campaign writer initially emitted invalid 3-byte U8 color attribute packing. An owned-path NodeIO repack repairs alignment after `kit.finish`, while comparing per-primitive semantic attribute/index bytes, node frames/children and embedded image bytes. Shared writer/kit files were not modified. Kiln emissive values also stay within valid glTF bounds.
- **External access:** `*-approach-contract.json`, `*-approach.json` and `*-functionality.json`. Declared routes run in both directions with zero collision push and zero geometry hits, checking the supplied neighbor assemblies. Potter visits wheel, wedging and glazing stations from outside the box; kiln visits furnace, charge chest and slaking front outside the pillar. These are **external workstations, not walk-in rooms**. Shared approach regression suite ran: **4 pass, 0 fail, 5 expectations**.
- **Pinned runtime:** `CABIN_PLAYER_RUNTIME_DIR` points at the archived cabin-overhaul served runtime. `colliders.js` SHA `b251bf7d894fb7be25d477bffab781d8a192e9f076d201aa9bdd342f32f34826`; `supportclass.js` SHA `b19727b1e13e02dd4adcba3459705dcc9a5356d7352342d2d1b6a3efe3c5672e`. Three revision 184 with repo core-stub/BVH bindings; this is not a cloned complete renderer deployment.
- **Protected geometry:** decoded neighbor-triangle volume broadphase followed by exact triangle intersection, not one giant artwork AABB. Potter has no intersections with its protected assembly. Kiln only permits the measured four heat-ring backing pad contacts and two sign-arm socket contacts (40 and 148 triangle pairs respectively); all other supplied protected geometry has zero crossings. Six backing rays pass. Furnace recess and open-throat rays pass.
- **Ladder/heat:** `nx-town-kiln-integrity.json` confirms both ladder rail tops meet stone at `y=3.099999905`, retained `fire` and `glow` groups, and emissive fire. Support rays exclude the ladder itself. The earlier unsupported-rake failure is retained as `nx-town-kiln-integrity-red.json`; fixing support initially contacted sign straps, so the final rake and charge-chest placement were adjusted and all checks rerun.
- **pwheel:** `nx-town-potter-motion.json` preserves the actual baseline identity frame and exact `motion:pwheel={type:spin,axis:[0,1,0],pivot:[0,0,0],degPerSec:9}`. Conservative continuous full-turn geometry sweep gives a minimum non-bearing static clearance of **0.004999985 m**; missing/frozen/crossing negatives are checked. Mechanical hub/bearing contact is intentional.
- **Actual browser motion:** `nx-town-potter-browser-motion.json` exercises the final byte-identical GLB through real GLTFLoader and unmodified repo `motion.js`/`motioneval.js`, with only ambient dependencies isolated. Samples at 0, 2.5, 10, 20 and 40 seconds pass, with three moving meshes, ten unchanged static meshes, a fixed pivot and restored rest pose. No browser errors or external HTTP requests. This improves on the older flattened-loader unit harness; it is still local-repo engine conformance, not public-served motion parity or a live world test.

## Render and visual evidence

All final solo and final assembly frames use the exact corresponding BEFORE camera JSON with `../cabin-overhaul/render.ts`.

- `reviews/nx-town-potter-{before,final}/`: nine views each, plus `montage.jpg`.
- `reviews/nx-town-potter-assembly-{before,final}/`: nine views including unchanged porch/sign.
- `reviews/nx-town-kiln-{before,final}/` and `reviews/nx-town-kiln-assembly-{before,final}/`: same-camera nine-view pairs.
- `reviews/nx-town-kiln-detail-{before,final}/`: paired supplemental near-mouth and elevated ladder views. The ordinary baseline-derived interior camera looks into masonry; that poor crop was retained honestly rather than silently changing only the final camera.
- `reviews/nx-town-potter-wheel-pose/`: supplemental rotated geometry nine-view set.
- `reviews/nx-town-potter-browser-motion/`: five actual-engine phase PNGs, `bearing-detail.png`, and self-contained offline `viewer.html`.

Final handoff audit `build/nx-town-potter-kiln-acceptance.json` verifies **11 nine-view manifest sets**, their actual model/camera/frame hashes, same-camera before/final pairs, browser phase images, build hashes, baseline/neighbor pins and verification reports. Render errors are empty; only normal headless ReadPixels performance warnings occurred.

**Vision route:** real images were inspected with `functions.vision_analyze`, which returned auxiliary image analysis. This is **not native-model or in-world visual approval**. It found the pottery/craft and kiln/masonry purposes readable; supplemental kiln detail showed exposed contour rings, recessed flame geometry, ladder crown contact and visible sign straps. Limits: generic unglazed/limestone shapes can be ambiguous at distant scale; the slate roof hides the kiln from the right; night light is mostly emissive appearance, not authored scene lighting. Some auxiliary descriptions incorrectly guessed furniture or support details. The wheel's lower bearing interface remained difficult to inspect even in a low-camera detail; source bearing continuity and numeric tests, not that image interpretation, govern the load-path claim.

## Reproduce locally

From `/Users/t3rpz/projects/eidoverse-worlds`:

```sh
export CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime
npm install --prefix /tmp/nx-town-potter-kiln-validator gltf-validator@2.0.0-dev.3.10
bun agents/arthur/village-overhaul/build-potter.ts
bun agents/arthur/village-overhaul/build-potter.ts
bun agents/arthur/village-overhaul/build-kiln.ts
bun agents/arthur/village-overhaul/build-kiln.ts
bun agents/arthur/village-overhaul/build-potter.ts --validate
bun agents/arthur/village-overhaul/build-kiln.ts --validate
bun agents/arthur/village-overhaul/build-potter.ts --test
bun agents/arthur/village-overhaul/build-kiln.ts --test
bun agents/arthur/village-overhaul/build-potter.ts --browser-motion
bun agents/arthur/village-overhaul/build-potter.ts --assembly
bun agents/arthur/village-overhaul/build-kiln.ts --assembly
bun test agents/arthur/village-overhaul/verify-approach.test.ts
```

`GLTF_VALIDATOR_MODULE` can override the temporary validator module path. Render command shape: `bun agents/arthur/cabin-overhaul/render.ts <glb> <output-directory> <corresponding-before-camera.json>`.

## Scope and remaining limits

Authored repository files: `build-potter.ts`, `build-kiln.ts`, this note, and corresponding `build/nx-town-potter*`, `build/nx-town-kiln*`, `reviews/nx-town-potter*`, `reviews/nx-town-kiln*` outputs only. No shared/original/cabin source edits, GUI, credentials, uploads, live verbs, commits or world writes. A reusable exporter/support-ray lesson was recorded in the active profile's existing world-building skill reference.

No room/ladder traversal, seated operator animation, crafting interaction, live terrain integration, unprovided-neighbor occlusion, or final native/in-world aesthetic acceptance is claimed. Candidate deployment belongs to the parent campaign after review.
