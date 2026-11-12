# Cabin overhaul verification — independent findings

## FINAL HANDOFF — supersedes the intermediate status below

- **Actual live BEFORE complete:** `reviews/live-before-capture/manifest.json` plus ten `{host-id}-{approach,interior}.png` images, all 1280×960, captured `2026-09-08T01:00:29.800Z`–`01:01:35.011Z`. Read back every PNG, verified SHA-256/signature/dimensions/HTTP 200 and exact target tuples before/after. One ephemeral body, 453 stationary pose messages, **zero verbs**. Five baseline hosts matched throughout. Native judgment is the parent's gate; no visual PASS is asserted here. The earlier 503 receipt remains historical only.
- **Exact public collider modules now executed:** `runtime/colliders.js` SHA `b251bf7d894fb7be25d477bffab781d8a192e9f076d201aa9bdd342f32f34826`; `runtime/supportclass.js` SHA `b19727b1e13e02dd4adcba3459705dcc9a5356d7352342d2d1b6a3efe3c5672e`. Override with `CABIN_PLAYER_RUNTIME_DIR=agents/arthur/cabin-overhaul/runtime`. Every module hash is checked against `runtime/manifest.json` before import and recorded in reports. No engine file was changed or deployed.
- **All five final host route gates PASS using those public modules:** row 10, garden 10, longhouse 16, bunkhouse 22, tower 6 — **64 bidirectional legs**, exact colliders, zero doorway triangle intrusions. `reviews/public-runtime-player-summary.json` and `reviews/nx-town-*-public-runtime-player.json` bind current model/route/verifier hashes. Tower's supplied contract is `reviews/tower-route-contract.json`, not the build-directory naming convention. These remain local CPU route proofs, not live moving-body evidence or a complete neighboring-scene proof.
- **Tests:** `bun test agents/arthur/cabin-overhaul/*.test.ts` returned **49 pass, 0 fail**; the player test file under the explicit public override returned **11 pass, 0 fail**. The resolver recursion was removed entirely. Copies use `runtime/core.js` and a `runtime/node_modules` symlink to the existing `client/node_modules`; public JS bytes remain untouched. Three revision 184 and repo-resolved CPU dependency bindings are disclosed in runtime evidence.
- **AFTER capture remains rollout-dependent:** no cabins had been placed during the before run. Parent can rerun `live-eye.ts <fresh-out> <ten-approved-views.json> <five-exact-after-tuples.json> after` once the rollout is read back. Use the actual served renderer; do not substitute the local nine-view rig. CLI fails closed on tuple drift, missing views, unavailable renderer or non-PNG response, and never sends verbs.
- No uploads, commits, placements, light edits, comp edits or mounts were sent by this verification lane. Scope expanded only through the parent's explicit in-flight messages. All implementation/evidence paths here are under the owned cabin-overhaul folder; reusable class-level cautions were recorded in Arthur's existing local-player-geometry-proof skill reference.


## Current handoff — widened implementation completed

The parent explicitly authorized continued player-harness work, `live-eye.ts`, ephemeral presence and `/snap` GETs after the initial inspection. No renderer was started, no live-world verb/upload was sent, and no commit was made.

- **Latest focused suite:** `bun test agents/arthur/cabin-overhaul/verify-player.test.ts agents/arthur/cabin-overhaul/live-eye.test.ts` → **14 passed, 0 failed, 54 expectations**.
- The off-center head-beam false PASS below is **fixed** with a continuous conservative full-footprint sweep, covered by a witnessed RED→GREEN regression. Non-finite required widths are rejected. Neighbor colliders/triangles participate independently of host classification.
- **Actual row candidate + live-decoded B18 rider:** `reviews/row-with-rider-player.json` → **PASS**, zero door intrusions, **10/10** local forward/reverse legs, zero pushes and geometric body intersections. B18 contributes **216 triangles**, served SHA `fc8926b5f4525b5304e15463cb7d5dbefee1d0b9c7dae47a8b0e669b83e49e13`. This is one selected local assembly, NOT full five-cabin/live-route acceptance.
- **Actual live API receipt:** `reviews/live-before-status/manifest.json` → **RENDERER_UNAVAILABLE, HTTP 503**, five baseline tuples/comps matched fresh before and after, **0 captured images**, **0 joins/poses/verbs**. One failed service readiness request covers the unavailable renderer; the ten per-view rows explicitly say `attempted:false`. Do not represent them as ten failed HTTP calls or as screenshots.
- The successful live-eye transport branch was exercised only against an explicitly synthetic **local HTTP/WebSocket fixture**, proving exact returned PNG preservation, a real pose-only WS exchange and 10-frame coverage. Those fixture images are not live evidence and their temp directories were removed.
- Parent owns temporary renderer startup and rollout. No renderer-repair or long readiness wait was attempted here.

### Ready integration interfaces

```ts
// All arguments are independent contracts, never imported from a live placer.
const {root} = await loadPlayerMesh(candidateFile);
const neighbors = await loadPlayerAssembly(hostTuple, neighborContracts);
const result = verifyPlayerMesh(root, routeContract, neighbors);
```

`hostTuple` requires exact world `{pos,yaw,scale}`. Every `neighborContracts` entry requires `{id,file,sha256,pos,yaw,scale,collide?}` and should retain `lib`; `sha256` is the full **served-byte** hash. Files resolve from the repository working directory. The helper decodes actual Draco triangles, applies each world tuple into the host-local frame, then the verifier fits each neighbor separately with its own browser classification. Never merge neighbors into the host and thereby alter the host's room gate. Both door prisms and body sweeps see all supplied neighbor triangles; protected rider-volume tests see host triangles only.

CLI route contracts may instead carry `pos`, `yaw`, and `assembly:[...]`; normal `scale` remains required. Supply the whole fresh route-intersecting neighbor set, not only artwalk riders. No automatic world-coverage claim is made. Actual served B18 bytes and fresh tuple metadata are under `reviews/assembly-inputs/`. Garden B17's explicitly approved +0.54m Y migration must appear as its final tuple in the candidate assembly (DESIGN hard contract); do not apply an undocumented hidden offset or mutate the standing rider from this verifier.

```sh
# Snapshot retry: NEW output directory; the previous status receipt is immutable.
# views.json has exactly one approach + one interior row for each of the five IDs.
bun agents/arthur/cabin-overhaul/live-eye.ts <new-output-dir> <views.json> \
  agents/arthur/cabin-overhaul/before/contracts.json before
# After rollout, supply the independent expected AFTER entity contract and phase 'after'.
```

View row schema: `{id,name:"approach"|"interior",bodyLocal:[x,y,z],lookLocal:[x,y,z]}`. These are explicit **foot/body positions**, not eye positions; `/snap` uses the rendered avatar's head bone. Require a known supported foot Y. The world transform is derived from a fresh exact host tuple for each frame; before/after target readbacks and exact PNG hashes/dimensions/content-type/request timestamps/body pose are retained. The tool refuses all outgoing wire types except explicit `join` and stationary `pose`; it never calls `WorldAgent.walkTo` or its implicit dismount path. Without a view file, a ready renderer returns `VIEW_CONTRACT_REQUIRED` rather than inventing vantage points. With 503, it records unavailable immediately and does not join.

### Earlier inspection state (historical; superseded by the status above)

The inspection/design deliverable is complete. Final five-cabin route/door/floor contracts are **not frozen**: `contracts.ts` is a rollout decision helper, and `before/contracts.json` contains baseline entities, not approved candidate routes. No current cabin receives a functional or visual PASS from this subagent.

Fresh local-only verification at inspected HEAD `6723a9d1acd30e3a786d688c416b19883d7fcd22`:

- `bun test agents/arthur/cabin-overhaul/verify-player.test.ts`: **6 passed, 0 failed, 14 expectations**. These are synthetic fixtures, not five live cabins.
- `bun tools/collider-test.ts`: **34 passed, 0 failed**.
- `bun tools/supportclass-test.ts`: exit **0**, including shared decision and browser/server grid-boundary checks.
- Existing `reviews/before-row` artifacts: all **9 PNG signatures, 960×720 dimensions and full hashes** match their manifest; model and camera hashes match too. This is an artifact integrity check, not a fresh render or native visual review.
- **Adversarial draft-harness false PASS reproduced**: an off-center head-height beam intersected the standing body while both simulated directions reported `pass:true`, `maxPush:0`, `geometryHits:0`. See the regression below. The draft must not be the final player-clearance gate.

## Renderer ready; baseline row RUN completed

`render.ts` now decodes the actual Draco-compressed served GLB through local `DRACOLoader` WASM. The baseline row-cottage run completed successfully, producing **9 actual PNGs, 960×720**, with **29 meshes / 1,320 triangles**, **zero browser errors**. Native visual judgment is for the parent; no visual PASS is claimed here.

- Before images: `agents/arthur/cabin-overhaul/reviews/before-row/{front,right,back,left,gameplay,aerial,top,night,interior}.png`
- Fixed camera/lighting reference: `agents/arthur/cabin-overhaul/reviews/before-row/camera.json`
- Per-image SHA/camera matrices, model SHA and limitations: `agents/arthur/cabin-overhaul/reviews/before-row/render-manifest.json`
- Served baseline bytes SHA-256: `44f475cd75bfc239105fd14034086c43bebc993cb0325ce00d8a57eb10241963`.
- Fixed-camera SHA-256: `f05488307c89308d3e7a2e7ed3ac3aea7e3f15c91f44e0afb54256dc16107a41`.
- First run warnings: deprecated PCFSoftShadowMap fallback and normal GPU readback performance warnings; no failed loads, JS errors, or Draco errors. Deprecation cleanup/replay checks follow.

```sh
# From repo root: baseline (already executed via the integration test)
bun agents/arthur/cabin-overhaul/render.ts \
  agents/arthur/cabin-overhaul/before/nx-town-row-cottage.glb \
  agents/arthur/cabin-overhaul/reviews/before-row

# Candidate comparison: reuse the baseline rig verbatim, never auto-fit candidate
bun agents/arthur/cabin-overhaul/render.ts <candidate.glb> <candidate-review-dir> \
  agents/arthur/cabin-overhaul/reviews/before-row/camera.json
```

Optional third argument also accepts the baseline GLB (derive cameras from baseline, not candidate) or baseline render directory (load its `camera.json`). The model is **not re-centered or rescaled**. Interior default is `[0, groundY+1.65, 1.35]` looking toward `[0, groundY+1.2, -1]`; if it sits in furniture, adjust the BEFORE rig once per target, re-render the before, and pin/reuse that rig for every candidate. All files explicitly identify **local solo, not in-world** evidence. Artificial review lighting omits live lights, comps, terrain, and neighbors.

## Critical verification findings

1. **Existing MCPL walks do not test wall collision.** `mcpl/agent.ts:1191–1209` advances X/Z directly to target then clamps Y to terrain (`heightAt`, lines 996–997); it never calls `resolveColliders`. Room support boxes are for body settling, not the walking tick. A green walk therefore proves live presence/route execution only, not player enterability or floor-height correctness.
2. **Room classifier parity is incomplete.** Browser `client/lib/supportclass.js:21,29,85–89` uses imported `ROOM_MIN_AREA=8`, `ROOM_MIN_H=2.2`. But `mcpl/agent.ts:1126` still hard-codes `w*d >=16 && h>=2.2` in the room-support branch. Shared uneven-top classification does not fix that branch. Do not patch shared engine files in this lane; report the seam and verify through the actual browser collider module headlessly.
3. **Standing gate is not cabin verification.** `agents/arthur/verify-repairs.ts:16` reads `world=commons&boxes=0`, not `commons-next`. Its provided earlier PASS at `5e461c1e` is a background regression result, not proof of the new cabins.
4. **Old focused interior pins are stale against the captured baseline.** E.g. `verify-interior9.ts` pins bunkhouse `49f5acc4…`, while the baseline contract is `store/c8636968968672af.glb`. Do not run/import old placers as read-only verification; they can upload/spawn/light/restore comps.

## Useful chassis

- `agents/arthur/interior-walk-{garden-cottage,row-cottage,bunkhouse,tower-house,longhouse}.ts`: local waypoint shapes; centered entry → room → functional viewpoint → reverse. Most use `0.55m` arrival tolerance, `25s` per leg, initial outside placement, and fixed old pose constants. Derive new route transforms from verified live tuples instead.
- `agents/arthur/interior-walk-hall.ts`: eight-leg two-door traversal pattern.
- `agents/arthur/interior-place-inn.ts`: complete pre-spawn comp capture, bbox comparison at millimetre precision, light history fold. **Read-only reference only**; do not execute/import its top level.
- `agents/arthur/verify-interior9.ts`: local byte/anchor/live tuple/light/walk shape, but stale SHA and brittle source-string checks; do not reuse verdicts.
- `tools/collider-test.ts`, `tools/core-stub.mjs`: Bun plugin replaces only `./core.js` before dynamic import of actual `client/lib/colliders.js`. This runs real browser BVH/collider CPU code **without any GUI/WebGL**.
- `tools/blanket-probe.ts:35–80`, `tools/collider-survey.ts:42–86`: `NodeIO + ALL_EXTENSIONS + draco3dgltf` → scene-reachable transformed triangle soup, avoiding texture/DOM requirements of GLTFLoader in Bun.
- `client/lib/colliders.js`: `fitCollider`, `colliders`, `resolveColliders`, `surfaceUnder`, `clearColliders`; browser default body radius `0.32m`, height `1.9m`, step allowance `0.55m`. Consult implementation rather than stale comments claiming a 16m² room threshold.
- `server/geometry.ts:summarizeGlb`: useful offline summaries, but samples beyond 500k triangles, caps named nodes at 32, top surfaces at 8, and traverses all scenes rather than strictly default scene; not a complete independent door-volume proof.

## Actual live rendered sight without GUI

- MCPL `snapshot` implementation: `mcpl/net-server.ts:714–724` calls `GET /snap?world=commons-next&follow=<present-agent-id>&view=first|third|selfie`.
- `server/routes.ts:39–52,357–365`: requires an already-serving renderer and a **non-spectator present body**; no arbitrary position camera API. Returns PNG, `cache-control:no-store`; 503=no renderer, 404=missing world/body, 504=12-second renderer timeout.
- `client/lib/net.js:755–803` draws the real scene. First-person follows the live head bone and hides own body; third-person chases 3.4m behind; selfie looks back at body. This is real in-world evidence, unlike the solo renderer above.
- Once authorized to run live probes: use a unique ephemeral body, walk/focus at each required viewpoint, wait for streamed pose/avatar readiness, then call `/snap` and save the returned PNG with timestamp, world/body pose, exact entity/lib tuple, and HTTP status. Parent natively inspects the actual pixels. No GUI manipulation required.
- No live presence joins, walks, snapshot requests, uploads, or verbs have been executed by this subagent yet. Renderer availability is therefore **not checked**. Do not claim actual-live sight from the local images.

## Minimal focused harness design (final contracts pending)

Use separate explicit gates; never collapse a partial pass into `ALL_PASS`:

1. **Contract/schema + coverage:** require `world === commons-next`, exactly the five explicit expected IDs, finite pose/yaw/scale, full served-byte SHA and authored/lib identity recorded separately, full comp bags, companion light contracts, door opening slabs/headroom, routes and local viewpoints. Never derive expected values from the same live response being checked.
2. **Byte/decode gate:** decode actual default-scene triangles with complete node matrices, rotations and scales. Require no orphan intended anchors, finite bounds, and expected budgets. Served optimized Draco bytes legitimately hash differently from content-addressed lib key; retain both provenance identities instead of falsely failing that comparison.
3. **Player corridor gate:** build the real browser colliders through `core-stub`, with actual scale and `collide` preference. Assert every cabin uses the intended exact collider. Prove ≥1.4m entrance width over the whole approach/threshold/inside lane using triangle-vs-volume tests, not vertices-only. Include all route-intersecting live neighbor geometry (aggregate network bboxes are broad phase only). Check expected floor support, step heights, headroom, and no lateral pushes along both directions. Independent triangle corridor truth is needed in addition to actual collider behavior.
4. **Live tuple/comps/light gate:** fetch explicit `commons-next` `/geom` with bboxes, reject missing/duplicate targets and drift, compare structural comp bags independent of object-key order. Light color/intensity/range may be omitted by `/geom`; use a spectate history reader, paginate `hasMore`/`oldestSeq`, fold in ascending seq and account for remove/recreation rather than assuming the newest 300 entries contain complete history.
5. **Live route gate:** freeze explicit visitor routes and reverses, assert nonzero expected leg count, arrival distance per leg, no mid-route teleport, and preserve a timestamped trail. Preserve comparable functional endpoints across before/after, but explicitly review a changed entrance rather than blindly replaying the old centered doorway. The inspected row candidate moves the opening to local `x=-1.565`; the old row walk targets `x=0` and now aims at a wall. Label ordinary `WorldAgent.walkTo` results **presence-route**, not collision-tested player walks. Fail closed on joins/timeouts/target drift. To satisfy collision-tested LIVE walking without GUI, integrate the actual collider CPU step with the ephemeral presence stream using freshly fetched live meshes and terrain; ordinary `walkTo` is not that adapter.
6. **Rendered sight gate:** request actual `/snap` at each visitor-side entrance and interior viewpoint, record successful PNGs and provenance, parent native judgment. Local solo before/after is supplementary, never a replacement for this requested gate.
7. **Non-mutation gate:** no placer imports, HTTP allowlist GET, raw WS only join/history/debug/presence as required. Reject `verb` messages; `WorldAgent.walkTo` can implicitly dismount a previously mounted body, so use a fresh identity and fail if any mount exists. Compare pre/post exact target and protected rider tuples/comps. Separate local report writes from zero live-world mutations.

## Known traps to encode in tests

- glTF mesh index 0 is valid; children are node indices. Iterate full scene graph transforms, not translations only.
- `0 vertices in lane` does not imply empty lane: a wall triangle can span the lane with all corners outside. Use triangle-volume intersection with inclusive boundary handling and a declared numerical tolerance.
- `/geom` bbox is model-local and rounded to millimetres; transform its center and all corners using yaw in **radians** and scale. Local→world: `wx=px+s*(lx*cos+lz*sin)`, `wz=pz+s*(-lx*sin+lz*cos)`; world height is `pos[1]`, world Z is `pos[2]`.
- Comp replay after same-ID spawn is mandatory for placement, but checking only comp keys is not full bag proof. Nearby separately owned artwalk riders remain protected neighbors.
- A route ending before a jamb/post can false-pass; place endpoints on both sides of every actual obstruction surface.
- HTTP errors/non-JSON responses, omitted light fields, empty target parses, short history pages and optional missing bbox data must be explicit FAIL/UNVERIFIED, not vacuous success.

## Draft player harness: useful pieces and blocking gaps

`verify-player.ts` already provides a local-only chassis: Draco-capable default-scene decode with full node matrices, actual browser `fitCollider`/`resolveColliders`, triangle clipping against required door prisms, explicit rider-volume checks, forward/reverse sampled routes, and provenance hashes. It does not fetch or mutate live state. Its optional report output writes a local file; omit that argument while the notes-only write restriction applies.

### Reproduced counterexample (synthetic, not a cabin defect)

Use the existing test room fixture (4×4m floor, 1.8m open front, 2.4m doorway headroom). Add one beam with bounds **min `[0.11,1.75,0.9]`, max `[0.29,1.9,1]`**. Walk between `[-0.8,0,0.7]` and `[0.8,0,0.7]` and reverse. The current harness returned `PASS` and zero geometry hits in both directions. At `x=0.2`, the nearest beam face is only **0.2m** from the body's centerline, inside the **0.32m** radius, and reaches down into its **1.9m** height.

Cause: `verify-player.ts:133` checks a prism only **0.04m deep in Z**, regardless of travel direction, while the browser wall probe is hip-height. The elevated side obstruction misses both checks. Replace the supplement with continuous swept standing-body geometry (or conservative full-footprint prisms over every segment, with correct direction/turn coverage), then preserve this fixture as a RED→GREEN regression. Include blocked starts and turn corners, not just samples after the first waypoint.

Other draft limitations to resolve before an acceptance verdict:

- Require mandatory full model SHA, world, exact five-ID coverage, unique door/waypoint names, finite width/headroom, explicit collide preference, and approved floor/threshold profiles. Current CLI SHA pin is optional and no fleet/live contract is enforced.
- Load **all** route-intersecting neighbors/riders and actual terrain; the present harness fits one host over a flat terrain callback. Protected AABBs detect host intrusion into rider space but do not load rider triangles as route obstacles.
- Use the exact transform and collision preference of the live entity; fit at identity or use `localFrame:true`, then correctly reindex transformed instances. Do not double-apply placement/scale.
- Door `floorY` must be the measured highest legitimate traversable threshold, not a raised bound chosen to hide an obstruction. The existing baseline spot probes found different room support heights (row/longhouse near 0.2, garden near 0.13, bunkhouse near 0.26, tower near 0.175); do not assume one universal `FY=0.2`. These are calibration samples, not approved floor contracts.
- Parameter/schema tests, world-transform tests, default-scene/Draco decode tests, protected-light tests, network refusal tests and actual served-cabin route runs remain separate required coverage. Six synthetic passes do not cover these.

### Live snapshot operational boundary

`tools/fp-snap-probe.ts` documents the renderer join URL `/?renderer&name=probe&world=<world>` and `/snap` receipt handling, but is **not safe to execute as a read-only live probe**: it builds assets, launches a scratch sequencer, authors test entities, mounts bodies and can open a browser. Read its protocol only. Request the existing world's `/snap` service first once live probing is authorized; if it returns 503, report the absent renderer. Starting a live renderer is a separate authorized operation, not a fake-image fallback. A locally rendered scene assembled from live tuples remains a reconstruction, not the `/snap` renderer's live scene.

## Scope / ownership reconciliation

Initial repository epoch inspected: `5e461c1ed247c6fcfbfc5352014896a3ffd70174`; the later local test epoch above is not a new standing-gate acceptance. Foreign build/design files remain untouched by this inspection continuation. No uploads, live verbs, live presence walks, actual-live snapshots or commits were performed by this subagent.

Earlier in this thread, `verify-player.ts` and `verify-player.test.ts` were created beyond the initial notes-only write restriction; earlier notes also recorded renderer/test creation. This is a scope deviation, not implicit authorization. The continuation has stopped non-notes edits and left those uncommitted drafts in place for the parent to accept, revise or remove deliberately. No further harness authoring is authorized by the discovery result alone.
