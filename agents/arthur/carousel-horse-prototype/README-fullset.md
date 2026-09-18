# Full carousel — approved v2 horse rollout (offline)

Built from the **served baseline**, never from `assets/village_carousel3.glb`. No upload, world join, live verbs, staging, or commit is performed by these files. Existing prototype sources are imported/read, not modified.

## Exact artifacts

Directory: `/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/`

- `carousel-fullset-v2-a.glb` — primary fullset candidate.
- `carousel-fullset-v2-b.glb` — independent-process deterministic repeat, byte-identical to A.
- Each GLB has a sibling `<filename>.report.json` containing semantic coverage, source coat identities, resource budgets, decoded envelope coordinates, and six named pair checks.
- `fullset-v2-review/fullset-render-manifest.json` — model/renderer hashes and all 27 frame names.
- `fullset-v2-review/fullset-horses-contact-sheet.png` — four stations × four close views.
- `fullset-v2-review/fullset-ensemble-contact-sheet.png` — full-carousel day/night/motion/boarding review.
- Original full-resolution frames and `stats.json` files are under `fullset-v2-review/horse_0`, `horse_2`, `horse_4`, and `horse_6`. The `horse_2` directory also contains the 11 ensemble views.

**Both GLBs:**

```text
SHA-256  1c0128b61b510a5dedb345e5b3348da5f3408ac5b2151fa7406bd9c8ab8e7838
Bytes    2449440
```

The `projects/excalibur` path is a filesystem alias. Reports resolve its directory to `/Users/t3rpz/Documents/Main Vault/60-69 Agents/61 - Agents/61.24 - Arthur/excalibur/`; the requested `projects/excalibur` paths above access those same files.

### Pinned inputs

- Served baseline: `/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-evaluation-2026-09-07/live-carousel.glb`
  - SHA-256 `24d7a62d1454bf06fc179e88179272782ca500ff3e050f5714f3ee6a5c8ca8be`
  - Served library identity: `store/ce3633992d07055e.glb` (the served optimized SHA differs from the original upload identity).
- Approved standalone: `/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-prototype-2026-09-07/cream-horse-v2.glb`
  - SHA-256 `b3709223f5d620eb5418fcc64e3b4dc5f387a0836d4d282d1204b6f12aea392b`
- `baseline-entity.json` in the rollout directory is the parent's captured tuple/component contract, read only by the envelope test to confirm all four bob amplitudes. It is not a claim of freshly observed live state.

## Construction and palette

`packagePrototype` supplies its existing strict GLB/static-scene validation and copies the approved children into the original `horse_2` root. `fullset.ts` then copies those approved children into the existing `horse_0`, `horse_4`, and `horse_6` roots. Original roots, transforms, parents, scene ordering, and nonhorse content remain unchanged. The five approved geometry/accessor sets are shared across all four stations; only necessary mesh/primitive wrappers and paint resources are new.

`assets/mkcarousel.ts` is read as source text, never executed. Its exact four-station table and paint definitions determine the station identities:

| Root | Coat | Blanket | Saddle |
|---|---|---|---|
| `horse_0` | Original gold main hue `#c98a4a` | Gold `#c98a4a` | Brown `#6d3f2b` |
| `horse_2` | **Entire approved cream subtree exact** | Approved muted teal | Approved brown leather |
| `horse_4` | Original slate main hue `#3e5364` | Tawny `#9a7048` | Dark brown `#3b302a` |
| `horse_6` | Same exact approved cream material, retaining its original bone/cream identity | Rust `#754636` | Brown `#6a5340` |

The report's `coats` field records **source identities**, not an assertion that the immutable approved `horse_2` was recolored to old source swatches. New textures contain the original main hue plus a restrained two-sRGB-level lift, weighted 4:1. They retain the approved finishes and texture-coordinate/sampler settings. All paint source materials come from the approved textured horse and have white `[1,1,1,1]` base-color factors; tests decode PNG pixels and check those factors to prevent double tinting. Hair, hooves, facial details, and brass remain approved resources.

No horse is regenerated from `sculpture.ts`. No welding, simplification, deduplication, pruning, quantization, texture compression, or optimizer pass occurs. The existing packager removes the Draco codec after decoding the served values, and consolidates buffers only. Original now-unused horse resources are deliberately retained.

## Verification results

- **70 tests passed, zero failures** in the scoped seven-file suite: the original 51 builder/package/sculpture tests plus 19 fullset tests.
- Both independent CLI builds wrote real GLBs and read them back before success; A/B hashes and bytes match.
- All original five motion roots/anchors (`carousel`, `horse_0/2/4/6`) preserved exactly. The served baseline has no separate named flag anchors; none were invented.
- 24 original nodes outside replaced descendants, 18 nonhorse mesh instances, and 253 original graph resources verified semantically, including exact accessor bits, texture bytes, and resource-sharing identity.
- Approved cream materials and child hierarchy exact. All four horses use the exact approved 22,532 triangles each, 90,128 horse triangles in total.
- Output budgets: 44 nodes, 45 mesh resources, 165 accessors, 20 materials, 19 textures, 141,612 embedded texture bytes, 2,449,440 total GLB bytes. Gates cap textures at 200,000 bytes and GLB at 3,000,000 bytes. No new geometry accessors per paint station.
- 27 rendered frames passed nonempty/frustum checks. Color-station close views and ensemble contact sheets were visually reviewed: consistent silhouette and restrained station identity, no obvious broken geometry or blackened tack. Front/back projections naturally occlude opposite horses; this is not geometric intersection. Dark slate loses detail in canopy shadow/night, consistent with its original identity.

### Continuous bob envelope

The source's nominal top surfaces are wooden deck **1.08 m**, capped rim **1.33 m**, and capped rim band **1.37 m** in model-rest coordinates. The actual served upward triangles reach **1.3698254227638245 m**. Using only the lower wooden deck would overstate clearance.

The gate traces 144 decoded upward platform triangles beneath all **52,163 vertices per horse** and expands each horse's vertical bounds by independent bob extrema ±0.18 m. All four lower swept bounds are **1.5800000095367432 m**, leaving at least **0.21017458677291878 m** above the actual support surface, including the lower moving hardware.

All six named swept AABB pairs separate. The minimum maximum-axis separation is **0.593675285577774 m**; opposite pairs separate by **3.3360000252723694 m**. These are conservative AABB separating-axis gaps, not claimed nearest mesh-surface distances or pedestrian-lane clearances. Because the carousel spin is a shared rigid rotation, separation in this co-rotating frame is preserved. Independent bob extrema cover every relative phase.

This checks horse/platform and horse/horse geometry only. It is **not** a live rider, socket seating, canopy headroom, or engine-collision test. The existing renderer's motion and night lighting are synthetic.

## Reproduce safely

From `/Users/t3rpz/projects/eidoverse-worlds`:

```sh
ROLL=/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout
BASE=/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-evaluation-2026-09-07/live-carousel.glb
HORSE=/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-prototype-2026-09-07/cream-horse-v2.glb

# Use NEW names; existing GLBs/reports/directories are deliberately refused.
bun agents/arthur/carousel-horse-prototype/fullset-build.ts \
  --baseline "$BASE" --horse "$HORSE" --output "$ROLL/carousel-fullset-v2-c.glb"
bun agents/arthur/carousel-horse-prototype/fullset-render.ts \
  "$ROLL/carousel-fullset-v2-c.glb" "$ROLL/fullset-v2-review-c"

bun test agents/arthur/carousel-horse-prototype/fullset*.test.ts \
  agents/arthur/carousel-horse-prototype/package.test.ts \
  agents/arthur/carousel-horse-prototype/build.test.ts \
  agents/arthur/carousel-horse-prototype/sculpture.test.ts
```

The build CLI accepts only a new `carousel-fullset-*.glb` beneath the real rollout directory. It rejects canonical/other basenames, existing outputs or reports, symlinks, out-of-scope directories, network inputs, and missing/duplicate/unknown flags. Both files use exclusive creation; failed paired writes remove only files created by that invocation.

The renderer reuses `render.ts` unchanged for the ensemble/cream pass. Additional stations are narrowly checked in-memory variants of that source, run via Bun without creating or modifying another script. Their cameras, lights, material order and clipping gates remain the original rig's. Existing review directories are refused.

### Files owned by this lane

Only these new repository files were created:

- `fullset.ts`, `fullset.test.ts`
- `fullset-build.ts`, `fullset-build.test.ts`
- `fullset-verify.ts`, `fullset-verify.test.ts`
- `fullset-render.ts`, `fullset-render.test.ts`
- `README-fullset.md`

One broad directory test run included concurrent parent-owned deployment tests and returned 114 passes / 2 failures (`deploy.test.ts`: incomplete CLI invocation; HTTP adapter missing). The isolated acceptance suite above subsequently passed 70/70; no parent deployment file was changed by this lane.
