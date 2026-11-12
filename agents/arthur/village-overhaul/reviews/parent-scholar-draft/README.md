# Scholar tower — READY approval DRAFT

**Target:** `nx-tower` only. **Offline verdict: PASS / READY.** This folder does not grant deployment authority. Nothing here was copied into `approved.json`; no builders, uploads, world verbs, credentials or live rollout were used.

## Handoff paths

Paths below are relative to `agents/arthur/village-overhaul/`:

- **Slot:** `reviews/parent-scholar-draft/slot.json`
- **Review:** `reviews/parent-scholar-draft/review.json`
- **Schema-complete, single-slot validation wrapper:** `reviews/parent-scholar-draft/approval-draft.json`
- **Final result:** `reviews/parent-scholar-draft/verification.json`
- **Current route evidence:** `reviews/parent-scholar-draft/ground-route-proof.json` and `reviews/parent-scholar-draft/upper-route-proof.json`
- **Audit output:** `reviews/parent-scholar-draft/validation.log`

The single-slot wrapper is an offline validation fixture, **not a replacement for the active multi-slot campaign approval**. The parent may incorporate the reviewed slot after its own checks; it must preserve the other approved slots and refresh affected pins as needed.

## Verified

- Actual current model: `build/nx-tower.glb`, SHA-256 `648ca0c0148cf1cc7ef7197b0eddbfdf6e755c1c22ecd855b28916fd7ec17a1b`, 537072 bytes, 5822 triangles.
- Decoded bounds: min `[-3.25,-0.20000000298023224,-3.25]`, max `[3.506999969482422,8.399999618530273,3.5999999046325684]`.
- Exact captured pose, parent and component bag preserved. No collision amendment or added ladder component.
- `build-tower.ts` and recursive local import closure discovered with Bun's `Transpiler.scanImports`, using the actual `rollout.ts` resolution order. The slot contains 13 source/input pins. Current engine evidence includes 69 source pins.
- Existing two separate-process deterministic builds were revalidated against actual model bytes, recorded source hashes, baseline, changed mtimes, exit codes and final build stdout. No model was rebuilt or rewritten here.
- Fresh public GETs for `colliders.js` and `supportclass.js` returned exact matches to the parent's pinned public runtime. Saved copies are in `runtime/`; execution uses the parent's existing runtime directory and dependency resolution, not repo-local collider logic.
- All 11 frozen mesh neighbors were decoded from exact file/hash/world tuples and passed through parent `prepareNeighbor`. The additional affected-bounds point light `nx-town-kiln-l` is explicitly recorded as non-mesh, not silently omitted.
- Both unchanged saved room routes were replayed through **parent `applyProofFrame` and normalized root yaw**, then `verifyPlayerMesh`. A second fresh `applyProofFrame` preceded **parent `probeApproach`**, because the legacy room verifier mutates its root arguments.

| Proof | Result |
|---|---|
| Ground room route | PASS — 12/12 directed legs |
| Ground physical support | PASS — 424 samples, 0 unsupported |
| Upper room route | PASS — 16/16 directed legs |
| Upper physical support | PASS — 433 samples, 0 unsupported |
| Required door prisms | PASS — 0 intrusive triangles |
| Protected shutter volumes | PASS — 0 unauthorized host triangles |
| Study socket | PASS — actual browser support and independent triangle support |
| Actual `validateCampaign` / `sourceGate` | PASS |
| Actual `validatePlan` / decoded `boundsGate` | PASS |
| Final read-only audit | 9 tests passed, 0 failed, 1193 assertions |

## Visual binding and limits

The native source-model architectural acceptance in `reviews/parent-native/batch-D/review.md` is reused only after verifying its three tower image pins, source model SHA and original render manifest. This task also reinspected those images through **auxiliary textual vision**, not a new native reviewer. The original prose calls the batch ensembles, but tower image pins and labels identify solo source-model renders; `visual-binding.json` explicitly corrects the evidence scope. Existing nine-view before/final camera parity, image bytes, and supplemental/ensemble manifests were also checked.

**No ground-to-upper climb was proven.** The preserved tower has ladder-like geometry but no ladder component. The upper route certifies separate upstairs circulation, lookout and socket support. No controller climb or socket interaction occurred.

Frozen offline neighbors are not a current live census. Parent-only live-context preflight, served-byte proofs, occupancy/readback and live visuals remain necessary before deployment. No universal whole-world intersection or structural-engineering certificate is claimed.

## Reproduce without deployment

From `/Users/t3rpz/projects/eidoverse-worlds`:

```sh
bun agents/arthur/village-overhaul/reviews/parent-scholar-draft/prove.ts
bun test agents/arthur/village-overhaul/reviews/parent-scholar-draft/validate.test.ts
```

The first command writes only this draft directory and performs public runtime GETs; it never calls `inspect`, `runRollout`, a builder or a world transport. The second command is read-only. Rerunning evidence generation changes timestamp-bearing evidence pins: consume the newest `slot.json`/`review.json` pair together.

## Resolved harness issues

- An isolated runtime copy lacked the parent's `node_modules` resolution. Execution now uses the unchanged parent runtime, with current public bytes checked and copied here as evidence.
- Initial affected-bounds coverage included one extra point light. It is now recorded explicitly; no mesh neighbor or physical support check was waived.
- The initial validation wrapper lacked engine/preflight pins. The retained `validation-before-wrapper.log` shows the audit rejecting that incomplete wrapper; the final wrapper and `validation.log` pass.

All authored files remain inside this directory. `approved.json` was only read; the parent continued its independent rollout concurrently. No unresolved offline proof blocker remains.
