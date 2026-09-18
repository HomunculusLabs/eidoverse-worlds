# Carved carousel horses — production source

Bill approved the cream v2 sculpture. It was deployed first, then carried through all four existing horse roots in `commons-next/nx-carousel`. The complete set is live at `store/1c0128b61b510a5d.glb`. All sockets now use decoded model-rest saddle Y=3.035 and part-relative yaw=0. Actual isolated public-client rides on all four verified rotation/bob attachment, loaded-geometry seat alignment and native hop-off; image review was auxiliary, not parent-native PASS. Final suite: 137 passed, zero failed. See the rollout report for exact evidence and limits.

## Source and boundaries

- `sculpture.ts`: continuous implicit coat (body, neck, head, ears, joint-connected legs); swept mane/tail; padded saddle/blanket; small surface-bound eyes; girth and original-size suspension hardware.
- `build.ts`: deterministic standalone GLB, new local output only.
- `package.ts`: replaces only the served baseline's `horse_2` children. Retains the original horse root, all transforms and every other scene mesh. Validates hierarchy/resources; prohibits external resource loading, malformed inputs, extra motion anchors, canonical filename and existing-output writes.
- `render.ts`: loopback-only headless Chromium inspection. Cameras frozen to the served baseline; identical opaque sorting; transformed-vertex frustum checks. Boarding view is an explicitly under-canopy **horse closeup**, not a whole-roof frame. Motion frames are illustrative, not the runtime evaluator or live rider evidence.
- `compare.ts`: fifteen identical-byte pixel controls and before/after panels.

This directory is the authoritative production source for the carved-horse commission. `fullset-build.ts` packages the approved sculpture into the preserved served baseline; `fullset-render.ts` provides offline review; `deploy.ts` is the hash/from-lib gated writer; `seat-repair.ts` corrects only selected sockets; `live-review.ts` exercises the actual public client with an isolated rider. See `README-fullset.md` for palette, geometry and reproduction details.

The two legacy asset generators still conflict and remain historical. Neither is authorized to rebuild the migrated live entity. `next-place-carousel.ts` now refuses a migrated library rather than overwriting it. Builds use new immutable output names outside `assets/village_carousel3.glb`.

Rollout evidence: `/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/`.

Use its standalone `final-entity.json` as the current deployment baseline. Earlier stage baselines deliberately retain the old sockets and must not be restored over the repaired riding contract.

Run live review with one `--slot` per OS process. The initial same-process `--all-slots` attempt completed gold then timed out during the next guest setup; independent processes completed the remaining stations. That batch-startup issue is unresolved and is not the acceptance path. Under-canopy camera framing now uses native right-drag, without disabling camera collisions or modifying the renderer.

## Reproduce from repository root

The preserved exact-served baseline lives at:
`/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-evaluation-2026-09-07/live-carousel.glb`

```sh
bun test agents/arthur/carousel-horse-prototype/
bun agents/arthur/carousel-horse-prototype/build.ts /tmp/cream-horse-NEW.glb
bun agents/arthur/carousel-horse-prototype/package.ts \
  --baseline /Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-evaluation-2026-09-07/live-carousel.glb \
  --horse /tmp/cream-horse-NEW.glb --output /tmp/carousel-candidate-NEW.glb
bun agents/arthur/carousel-horse-prototype/render.ts /tmp/carousel-candidate-NEW.glb /tmp/carousel-candidate-review
```

Use genuinely new output filenames: the builders refuse overwrites. For comparison, render the baseline twice into `before/` and `before-control/`, candidate into `after/`, then run `compare.ts <parent-directory>`.

## Verified candidate v2

- Horse SHA-256: `b3709223f5d620eb5418fcc64e3b4dc5f387a0836d4d282d1204b6f12aea392b`
- Complete candidate SHA-256: `07c7feba5157336b3d8f9087906e6c7fab04f456475c91d489eec481215bcadb`
- 51 Bun tests passed; 15 identical-image controls passed.
- 39 preserved nodes (including the target root), 33 unaffected mesh instances, 234 compared resources.
- 38 rendered meshes total, unchanged; replacement horse uses five merged material meshes.
- Seat contact remains level at horse-local Y `1.015`.
- Horse has 22,532 triangles. Full candidate is 2,360,560 bytes, intentionally uncompressed to preserve decoded non-horse geometry. This is a shape-review artifact, not a finished bandwidth/performance optimization.

Evidence and review notes:
`/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-prototype-2026-09-07/`

## Historical prototype-stage limits

At the original prototype-only stage, no upload, world verb, canonical rebuild, commit or push occurred, and no rider/dismount test was performed. Those network/riding statements are historical and superseded by the rollout evidence. Image tool reviews remain auxiliary, not a parent-native visual PASS. A full-project TypeScript/lint build is not claimed (editor reports Three.js inferred-type diagnostics in this workspace).
