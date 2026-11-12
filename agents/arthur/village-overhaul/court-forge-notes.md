# Court + forge — local architectural rebuild handoff

## Outcome and status

Both host models are rebuilt, double-built deterministically, rendered from exact baseline/final bytes, and locally verified against the frozen contracts and nearby geometry. **No uploads, world mutations, credentials, GUI actions, or commits.** Only the two lane builders and court/forge-specific outputs were edited in the repository. Campaign/shared kits, original builders, before inputs and companions remain untouched.

**Local geometry/route gates pass. Parent final visual review and any subsequent live/served verification remain outstanding.** Two pre-existing displaced rear count boards cannot be backed by a host constrained to the frozen footprint; that scope conflict is explicitly retained, not hidden by an exemption.

## Architectural work

- **Court / bakery:** unequal twin gabled trade halls, limewash on substantial stone plinths, segmented masonry entrance arches, separately terminated overlapping slate roofs, glazed framed windows, and a low oven wing with a genuine opening around the immutable smoke shaft. A custom roof/profile closure avoids the campaign helper's known gable wedge problem. The center is an intentionally **open court**, not an accidentally roofless room.
- **Bakery functions:** beehive oven, hearth ledge, peel, kneading table, finished bread display, proofing shelves and bowls, flour storage, exterior vice bench and rear delivery cart.
- **Repair functions:** workbench, hanging tools, iron stock and finished hardware, heating hearth, anvil/stump and visibly water-filled quench barrel. The central civic bench and balance motif remain separate from the working routes.
- **Forge:** a compact **outdoor charcoal station**, not a miniature enterable house. An open arched refractory hearth supports an artwork-backed hood, tapered masonry shoulder, banded hollow chimney and raised rain cowl. The arch-to-hood front lip is connected while the gathering throat remains open behind it. Anvil, hammer, staved water barrel, stool, toolrack, bellows, tongs, apron and finished blades give it a distinct heat–hammer–quench identity.

## Final deployable host bytes

| Host | File | Bytes | Nodes / meshes | Triangles | Authored premerge parts |
|---|---|---:|---:|---:|---:|
| nx-court | `build/court.glb` | 745684 | 26 / 26 | 11340 | 577 |
| nx-forge | `build/forge.glb` | 193268 | 11 / 10 | 2712 | 120 |

- **Court SHA-256:** `4ec651b30c2686f95693aa06cb345e51f9d4bd670740c15e8d2669657cd70d21`
- **Forge SHA-256:** `d55c86d706774923e57bcec0d30b6ef4bca8cc50879a5c55c15fcd7aff897c58`
- Court served-baseline SHA-256: `06b47d4fb436d642ac4f6a030848c2acb3b0c7a8bff0f8ec416e2e1d8f956245`
- Forge served-baseline SHA-256: `783c3bb2b7ed4f4bd33876853d8bbfb7818713203a702a5a00035c2d3ecf0d37`

`build/court-forge-determinism.json` records two real writes per final model, changed nanosecond mtimes, equal full hashes, source hashes and dependency hashes. These replace all earlier candidates, including court `ca91f81a…` and forge `f4690814…`.

### Decoded default-scene bounds

These are actual loaded final vertices, not planned dimensions or premerge transformed boxes. All four X/Z extrema compare **exactly equal** to the decoded originals (`xzExact:true`), without a tolerance allowance. The court's vice-table edge intentionally preserves the original Draco-derived `z=3.000267505645752` maximum.

```json
{
  "court": {
    "min": [-6.5, -0.20000000298023224, -2.940000057220459],
    "max": [6.5, 4.775000095367432, 3.000267505645752]
  },
  "forge": {
    "min": [-0.8726182579994202, -0.004999999888241291, -0.7770000100135803],
    "max": [1.4600000381469727, 2.9600000381469727, 0.6099370718002319]
  }
}
```

Court top increased from `4.168248653411865` to `4.775000095367432`; forge top from `2.0999999046325684` to `2.9600000381469727`. Height changes require the parent's final architectural acceptance. No footprint or placement expansion was used.

## Exact frozen host/function contract

- Court position `[18.9,-1.5946487083102603e-8,-14.8]`, yaw `-0.90756`, scale `1`.
- Forge position `[22.11785473473295,0,-7.957568494595163]`, yaw `-0.90756`, scale `1`.

```json
{
  "nx-court": {
    "particles:smoke": {
      "preset": "smoke",
      "origin": [-4.9, 3.2, -0.8],
      "count": 50,
      "size": 0.4,
      "speed": 0.35
    }
  },
  "nx-forge": {
    "motion:fire_fg_coals": {
      "type": "bob", "axis": "y", "amp": 0.014, "period": 1.8
    },
    "particles": {
      "preset": "embers", "origin": [0, 0.45, 0.42], "count": 84
    }
  }
}
```

The builders decode and retain the **served original functional meshes**, not approximations from old source. Geometry verification finds all original `fire`/`flame`/`lamp`/`glow` names, equal world matrices and zero position-array error. Court retains `fire`, `flame`, `fire2`, `lamp_scale_0`, `lamp_scale_1`, four `flame_sconce_*` nodes, `lamp_foot`, `lamp_post`, `lamp_arm`, `lamp_collar`, and `lamp`. Forge retains `fire_fg_coals` and its two original children. New quench-water geometry does not replace any original anchor.

The whole forge coal swept envelope for the prescribed bob has **zero static-triangle hits**; the ember origin is unchanged. Court's smoke column is clear above its open shaft. Forge's internal throat-to-cowl and side exhaust under the rain cap both have zero obstruction hits. No component was added or changed; in particular the physical forge chimney does not imply a new smoke component.

## Routes, collider classification and geometry gates

`build/court-routes.json` and `build/forge-routes.json` are the route contracts. They retain original host snapshot metadata while binding the final file by full `sha256`; they are **not deployment payloads**. The geometry loader, rather than the old snapshot bbox, determines the actual collider.

### Court — room-scale automatic exact collider, no override

- Bakery entry: **1.4 m width × 2.2 m headroom**, zero triangle-volume hits.
- Repair entry: **1.8 m width × 2.2 m headroom**, zero hits.
- Central court entry: **1.4 m width × 2.2 m headroom**, zero hits.
- **24 directed route segments pass**, traversing bakery approach/landing → bread display → kneading counter → oven station → bakery side door → shared court → repair side door → ironware bench → anvil/quench station → repair landing/approach, and the reverse.
- All route segments have zero collision push and zero player-body geometry hits. Maximum observed supported rise is `0.20000000298023224` m at the landing. This is cross-trade circulation, **not a claim of a straight rear exit through the civic bench**.

### Forge — real pillar collider, outdoor access only

- Actual runtime classification: `exact:false`, `pillar:true`.
- **6 directed external segments pass**, fire/art view → anvil apron → east corner → quench service and back. Zero push, rise and body-triangle hits.
- There are no door contracts and **no enterable-room PASS**. The declared routes stay outside the equipment footprint. No `collide:'exact'` override was used or requested.

Both tests use `../cabin-overhaul/verify-player.ts` and the pinned directory:

`CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime`

Runtime pins: `colliders.js` SHA `b251bf7d894fb7be25d477bffab781d8a192e9f076d201aa9bdd342f32f34826`; `supportclass.js` SHA `b19727b1e13e02dd4adcba3459705dcc9a5356d7352342d2d1b6a3efe3c5672e`. The reports disclose Three revision 184 and repo stub/BVH bindings: this is the public collision module exercised locally, **not a full deployed browser or live walk**. Declared flat terrain and supplied frozen neighbors limit the certificate.

## Companions, signs and artwork

- `build/court-forge-input-integrity.json` verifies frozen neighbor file hashes and records the contract/folded/protected/download-manifest hashes. Court/forge testing uses both **final** hosts together, while all other neighbor inputs remain frozen.
- Exact transformed protected-volume tests report zero intrusion for artwalk H2/H5, B16/B23/B28/B29, bakery/smithy signs and cistern. Nearby hosts/dressing and local road/path triangles also produce zero contacts in the tested envelopes. No broad art/road collision exemption is used.
- Forge B16 has an exposed forward viewing volume with zero host-triangle hits. Nine reverse rays find its modeled backing at `0.0059999954700469815` m. No hood cornice crosses its face.
- **Both hanging signs mount on the court.** `build/court-sign-support.json` checks nine points per sign before and after at the unchanged `x=±6.1` mounting faces. All pass with the same contact distance (`0.000010095367431794955` m from the slightly offset ray origin).
- Comparison assemblies include the real court behind the smithy sign, and the real forge behind B16 even in court-framed views. Earlier partial assemblies omitted those mounting hosts and created false floating-sign/art impressions. No sign was moved to repair the evidence.

### Unresolved baseline defect — escalate, do not silently fix

B28 bake-count lies behind the court at local z `[-3.951000051498415,-3.8874777126312274]`, leaving `0.9474776554107684` m between its nearest face and the original rear envelope. B29 strike-count lies at `[-3.7910000085830684,-3.7274777889251705]`, a `0.7874777317047115` m separation. Their decoded geometry/entity offsets predate this rebuild. Both remain byte/tuple unchanged, exposed, and visibly detached. A new backing there would violate the frozen footprint; relocating the boards would violate companion scope. **Parent needs explicit companion-scope authorization if those defects are to be repaired.** Passing non-intrusion is not represented as passing backing for these boards.

## Render and visual evidence

Exact served originals and final models were rendered through `../cabin-overhaul/render.ts`. `build/court-forge-render-proof.json` validates **6 before/after pairs, 108 PNG frames**, matching camera file hashes plus eye/quaternion/projection values, current model hashes, renderer hash, PNG hashes and file sizes. Model geometry statistics embedded in camera records are deliberately excluded from camera-pose equality. No renderer errors; the renderer emitted only GPU ReadPixels performance warnings.

Pairs: `court`, `forge`, `court-detail`, `court-assembly`, `court-assembly-detail`, `forge-assembly-detail`, each with `-before/` and `-after/` nine-view directories and refreshed contact sheets. Assembly GLBs are **review-only containers**, never upload them as hosts.

### Correctly targeted parent-review images

- `reviews/court-bakery-interior.png` — bakery oven, peel, loaf table and working floor.
- `reviews/court-repair-station.png` — repair hearth, tools, anvil and quench, **not the bakery interior**.
- `reviews/court-open-courtyard.png` — ground-level open court and civic bench.
- `reviews/court-roof-separation.png` — separated roof masses/intentional courtyard.
- `reviews/forge-smithy-sign-mount.png` — actual court wall → mount board → bracket → hanging sign.
- `reviews/forge-hearth-art.png` and `reviews/forge-open-hearth-detail.png` — B16 exposure and connected hood-front lip.

These are byte-identical semantic aliases of rendered PNGs, with provenance in the render proof. In the detailed camera, `front` means bakery, `interior` means repair, `gameplay` means open court and `top` is the chimney close-up.

**Inspection mode: auxiliary vision via `vision_analyze`, not native vision by this agent.** Actual current images were inspected: baseline court/forge nine-view sheets; final court/forge nine-view sheets; both final detailed assembly nine-view sheets; full-resolution bakery interior and smithy mount. The auxiliary reviewer found distinct useful trade spaces, intentional central openness, a connected sign support chain and the corrected arch/hood connection. It retained uncertainty about concealed roof joints, exact walking clearance and live behavior. Some baseline object interpretations were unreliable; those were not promoted to geometry facts.

To address the dark-roof-underside/sky ambiguity, `build/court-roof-coverage.json` records **239 passing upward rays against the exact decoded slate triangles** across bakehouse, low oven wing and repair hall. Only the intentional chimney aperture is omitted from that roof coverage grid and independently tested open. `court-roof-gap.json` proves positive **1.1649999994039537 m** separation between conservative full roof-part bounds. These supplement—not replace—visual review and do not certify watertightness.

The parent's earlier `reviews/parent-native/batch-B/review.md` remains historical criticism of older/partial evidence. This lane has **not** declared that review superseded by a new parent approval. Re-review the corrected semantic images and final hashes above.

## Reproduction

From `/Users/t3rpz/projects/eidoverse-worlds`:

```sh
bun agents/arthur/village-overhaul/build-court.ts
bun agents/arthur/village-overhaul/build-forge.ts
export CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime
bun agents/arthur/village-overhaul/build/court-forge-verify.ts
bun agents/arthur/village-overhaul/build/court-sign-support.ts
bun agents/arthur/village-overhaul/build/court-roof-coverage.ts
bun agents/arthur/village-overhaul/build/court-forge-assembly.ts
```

Use each render manifest's exact `modelPath` and `cameraReference` with `../cabin-overhaul/render.ts`, then run `build/court-forge-review-proof.py` in a Python environment with Pillow. Both final double-build executions and hash checks already ran; these commands are reproduction guidance, not deferred work.

### Evidence limits / integration handoff

No live terrain sampling, in-world image capture, particle evaluator run, live motion playback, upload verification or companion/component readback was performed by this lane. Parent owns final visual approval, any scope amendment, deployment, exact full component restoration and authoritative post-deployment served-byte/tuple/route verification. Local pass must not be described as live acceptance.
