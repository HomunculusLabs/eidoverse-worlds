# Village cabin overhaul — live delivery

**Commission:** Bill — “can you give a total overhaul to the cabins in the village? they're kind of lame”

**Outcome:** All five commissioned homes have been rebuilt and replaced **in place** in [commons-next](https://eidoverse.billding.dev/?world=commons-next). This is shipped world geometry, not a proposal. No commits or pushes were made by this commission.

## What changed

| Home | Built result | Current library address |
|---|---|---|
| Weaver's row cottage | Pale lime-and-timber walls, intersecting slate gables, tall west-offset entrance, masonry hearth/chimney; loom, dyes, bed and working room retained | `store/0558b5f41bda0777.glb` |
| Garden cottage | Front-gabled main hall with a lower wing, resolved roof valleys, real windows, rebuilt garden/fence edges, gardener's furnished room | `store/b5b3f10227856571.glb` |
| Longhouse | Broad inhabited porch, substantial timber bays, layered slate roof, masonry hearth; communal tables, sleeping places and provisions retained | `store/e38bb2a4c7933698.glb` |
| Guest bunkhouse | Low broad lodge, open gabled portal, four individually reachable floor-level berth beds with blue bedding and personal storage, supported plank floor | `store/2b618274fa316c78.glb` |
| Scholar's tower-house | Stone lower drum, timber/plaster upper storey, proper wraparound balcony, uninterrupted conical slate roof, furnished study and retained upper chamber | `store/90723087ca8b5eb3.glb` |

All host IDs, positions, rotations, scales and component bags remain as captured. New X/Z envelopes fit inside the original envelopes; roof-height growth is intentional. Existing light companions remain exact. The four unchanged wall artworks remain at their original tuples. Garden artwork **b17 alone** moved upward by **0.54m**, with the same ID, mesh, horizontal location, rotation, scale and component/provenance state; its bottom is now local Y=2.62. This is the explicit bounded amendment in `DESIGN.md`, preserving the wall piece while clearing a properly tall entrance.

## Evidence → decision → outcome

- **Before was real:** captured the original served GLBs, full host contracts, folded state and all ten companion contracts before rebuilding. Server Draco compression means the upload-address hash and served-byte hash differ; both identities are retained, not falsely equated.
- **Visual redesign was inspected:** all five exact final authored GLBs received matching-camera front/right/back/left/gameplay/aerial/top/night/interior renders. Supplemental views cover all four guest berths, the tower apex and both storeys, garden/wing junctions, and retained wall artwork. Available `vision_analyze` inspection was auxiliary image review; no native-vision claim is made.
- **Functional failures were fixed, not hidden:** real door datums prevent low plaque mounts from manufacturing headroom; crossing triangles and off-center overhead obstructions are tested; the guest lodge's board joints now have real subfloor support. Width is at least 1.4m and required door headroom at least 2.2m over actual authorized thresholds.
- **Production-code mismatch was caught:** the live site serves collider/support-class JS different from the repository. Exact public copies were pinned and executed without changing the engine. All five authored models, then all five downloaded **served** models, passed **64 bidirectional route legs** and their doorway-volume checks.
- **Placement actually ran:** five uploads, eleven acknowledged world verbs, five authoritative post-placement readbacks. The only non-host verb was the bounded b17 upward `place`. Re-running the actual applicator read back all five and emitted **zero uploads / zero verbs**.
- **Actual live appearance was inspected:** ten 1280×960 `/snap` PNGs show the placed exterior and furnished interior of every home. The fixed exterior viewpoints match the live before set. Visual inspection found the redesigned homes present, the new row entry exposed, garden plaque clear of the entrance, and no visible severe floor/furniture or neighboring-entry intersection in those views.
- **Tests at delivery:** `bun test agents/arthur/cabin-overhaul/*.test.ts` → **49 passed, 0 failed**. The delayed-audit capture-helper correction below increases the current suite to **51 passed, 0 failed**. Standing `verify-repairs.ts` gate also passed at the observed repository epoch. These are distinct checks: the standing gate is not itself the cabin visual proof.

## Inspect the result

- `reviews/cabins-live-before-after.jpg` — actual live before/after comparison, same exterior body viewpoints.
- `reviews/cabins-daylight-final.png` — clear daytime **local studio** inspection of the final designs, not an in-world screenshot.
- `reviews/live-final-interior-sheet.png` — actual live furnished interiors.
- `reviews/live-exterior-before/manifest.json` and `reviews/live-exterior-after-retry/manifest.json` — frame HTTP status, SHA-256, dimensions, camera/body tuples and exact target readbacks. World time is not forced; controlled lighting comparisons are in the local rig, not falsely inferred from the live timestamps.
- `approved.json` — exact reviewed authored hashes, source hashes, bounds, player/visual evidence references and bounded b17 migration.
- `rollout-receipts.jsonl` — authoritative verb acknowledgments, current served hashes, migration rollback tuple and idempotent readbacks.
- `reviews/served-player-summary.json` and `reviews/nx-town-*-served-player.json` — final delivered-geometry route results using pinned public collider code.
- `before/`, `served/`, `after/` — exact original bytes/contracts and delivered bytes/contracts/census.

## Reproduce / maintain

Run builders from the repository root. Canonical cabin build sources for this commission are `build-row.ts`, `build-garden.ts`, `build-longhouse.ts`, `build-bunkhouse.ts`, `build-tower.ts` plus `kit.ts` in this folder. Each must reproduce its approved full SHA before any new rollout.

```sh
bun test agents/arthur/cabin-overhaul/*.test.ts
bun agents/arthur/cabin-overhaul/rollout.ts
# Explicit mutation path; an already exact world returns zero writes:
bun agents/arthur/cabin-overhaul/rollout.ts --apply
```

Historical `next-place-improve*` and artwalk host-pin one-shots elsewhere in the repository have **not** been silently rewritten or granted wider migration authority. Their old pins are historical and may now fail closed. Use this commission's manifest/receipts to re-derive any future host-relative work; do not run an old placer as a rollback. b17's old mounting height is no longer the accepted current contract.

## Honest boundaries

### Delayed-audit follow-up: local capture helper

The safety review identified a remaining unconditional event-tail replay in `capture.ts`, separate from the already-corrected rollout decoder. An in-memory execution of the actual capture script reproduced both duplicate application (chat count 1 became 2) and silent acceptance of an ambiguous entity fold. The helper now reuses the rollout's non-mutating `snapshotState` decoder and ambiguity gate. Both regressions pass; the complete suite reports 51 passed / 0 failed. All nine archived top-level baseline files remained hash-identical across verification. The production capture command was **not** rerun, and no live reads, uploads, world verbs, baseline recapture, commits or pushes were performed by this follow-up. Existing placement/readback and visual evidence remain unchanged.

- The 64 route legs execute the real public collider algorithms against exact delivered cabin geometry, **not a live keyboard/avatar walk** and not a comprehensive terrain/all-neighbor collision simulation. In-world captures are stationary ephemeral viewpoints; they prove appearance, not locomotion. Visible nearby approaches were separately inspected in the actual live shots.
- The scholar tower's existing ladder remains geometry only; its empty component bag was deliberately preserved. This overhaul does not claim new functional ladder/climbing behavior.
- Original room furnishings were retained where they define the dwelling; this was not an engine/material-system or village-layout rewrite.
- The snapshot service initially returned 503 (no renderer). A temporary headless public-client renderer, with authored world verbs blocked, supplied the actual `/snap` evidence. No persistent renderer service was installed. One after-capture received a transient HTTP 502; that failed manifest is retained, and the paced retry genuinely captured all ten PNGs.
- Budget record: five uploads paced by the shared upload budget, eleven acknowledged world verbs, no additional light entities, no fabricated Excalibur charge debit. Final aesthetic ownership remains Bill's; operator acceptance is not represented as Bill's personal eye verdict.
