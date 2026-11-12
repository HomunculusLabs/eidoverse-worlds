# Town tower-house — final local overhaul

## Outcome

**Local build and actual-browser-collider verification PASS. No live mutations, uploads, commits, or original/global source changes.**

- Target only `nx-town-tower-house`, inherited upload key `store/11b31000ff639083.glb`; source identity is the first `towerHouse()` in `assets/mkvillage-houses.ts`, not `village_tower3.glb` / `nx-tower`.
- Served Draco baseline: `before/nx-town-tower-house.glb`, SHA `c129086ab28d76c8c73cba37c845064ceead9dedecc0a7604c57f37d67702525`.
- Final GLB: `build/nx-town-tower-house.glb`, SHA **`90723087ca8b5eb3d5e3e7d13828ee12e254266ad63504d07f7f4d14b4b29253`**.
- 2,079,972 bytes; 11 merged meshes/nodes; 20,264 triangles; 1,599 authored parts. Shared `kit.ts` materials, merge/writer consumed without changes.
- Exact decoded final bounds: X `[-3.094131470, 3.259999990]`, Y `[0, 8.284999847]`, Z `[-3.099997520, 3.305000067]`. Entire X/Z and height envelope remains within baseline X `[-3.25,3.329]`, Z `[-3.25,3.33]`, height `8.3`. No floor-plate expansion or pose change.

## Architectural replacement

Stone-course plinth; warm lime lower/upper panels; calm substantial verticals and floor/eave belts; six genuinely cut and framed windows; generously framed entry with the original rider backing plane; front/east annular balcony with discrete radial boards, fascia, joists, diagonal knees, newels and balusters. Preserves the inherited balcony sweep `[-60°,120°]`, exterior ladder, and small swallowtail.

The cone is locally authored, not `kit.roof` (which is gabled): **310 closed solid slate shingles in 11 staggered overlapping courses**, compact capped finial, eave fascia, 12 recessed rafters, roof ties and kingpost. V1 exposed tan rafters through the slate; that candidate was rejected. Final recesses rafters and backing below the skin. A regression test reproduced the defect before correction, and 60 above-roof ray probes now pass. Final visual review finds continuous slate, no tan radial interruptions, and a complete uncropped apex.

Ground study retains equivalent desk/chair, open book, quill/inkwell, meridian instrument, open bookshelf/books, rug and candle. Upper bedchamber retains bed/pillow/blanket, chest and candle stand. Upper floor remains **Y=2.625**; balcony deck remains **Y=3.05**, linked by three shallow steps. The formerly square upper slab is now round and has a real east ladder hatch. Ground finish is only 2cm high; no raised threshold is used to manufacture headroom.

## Actual player geometry gate

Run from repository root:

```sh
bun agents/arthur/cabin-overhaul/build-tower.ts --test
bun agents/arthur/cabin-overhaul/build-tower.ts
bun agents/arthur/cabin-overhaul/verify-player.ts \
  agents/arthur/cabin-overhaul/build/nx-town-tower-house.glb \
  agents/arthur/cabin-overhaul/reviews/tower-route-contract.json \
  agents/arthur/cabin-overhaul/reviews/tower-player-report.json
```

`reviews/tower-player-report.json`: **PASS**, actual browser collider `exact:true`, `pillar:false`, `roomScale:true`. This uses decoded exact final triangles and the real browser CPU collider module, not a headless-body approximation.

- Ground entrance: **1.60m × 2.20m**, local X `[-.8,.8]`, Y `[.02,2.22]`, Z `[1.85,3.33]`; zero intersecting triangles.
- Upper balcony aperture: **1.40m × 2.20m**, X `[-.7,.7]`, Y `[3.05,5.25]`, Z `[2.48,2.73]`; zero intersecting triangles. Upper header and center eave knee were raised to clear this volume.
- Four explicit ground waypoints: outside → threshold → study rug → desk approach. **All six directed legs PASS**, zero collider push and zero swept standing-body geometry intersections.
- Protected rider `nx-artwalk-b21-tower-ascension-count`: local origin remains `[0,2.22,2.8225]`; tested volume X `[-.81,.81]`, Y `[2.22,2.68]`, Z `[2.788,2.91]`. The **only allowance is the 4mm rear-contact strip Z `[2.788,2.792]`** on the same bounded X/Y face. Final lintel face Z=2.79 supports the rider; zero unauthorized host triangles enter the protected artwork volume. No rider bytes/pose/components changed.

**Climbing limitation:** the captured host component bag is empty. Both ladders are authored geometry, not a `ladder` capability. The upper room exists and its aperture is clear, but no ground-to-upper climbing or live walk has been claimed. The ground route is a local browser-collider simulation, not a live-world visit.

## Determinism and review evidence

`reviews/tower-determinism.json` records two real final builds, changed output mtimes, identical full GLB hashes, source/kit hashes and actual test stdout. Tests cover source-envelope, exact triangle-box clear door lanes, slate courses, hidden rafters, retained interior identities, original upper floor height, and an actual floor hatch.

- Baseline rig and served-byte frames: `reviews/tower-before/`.
- Final same-camera nine-view review: `reviews/tower-final/` (front/right/back/left/gameplay/top/aerial/night/interior, manifest and `contact.jpg`). Baseline/final camera SHA is exactly `1cfe5fbe995b22b702d2aed9066542bf57ae25e645671dbc76711211f2625cfc`.
- Supplementary full-silhouette / upper-bedchamber evidence: `reviews/tower-final-supplement/`, rig `reviews/tower-supplement-camera.json`. This supplements rather than replaces the unchanged before camera comparison.
- Every final manifest binds SHA `90723087…b29253`. Rendering completed without browser errors; GPU ReadPixels performance warnings only.
- Visual inspection used the `vision_analyze` auxiliary image judge, not a claimed native or live-world review. All exterior sides, gameplay/top/aerial/night/study contact sheet, full apex and upper bedchamber were inspected.
- Residual visual limitations: isolated night rig has no authored world lights; amber window/candle accents read, but roof/balcony remain dark. Upper rectangular floor-board ends show a slightly stepped junction against the curved wall; no major furniture or room-geometry failure was identified. These are disclosed, not passed off as live-light or climb verification.

## Ownership / remaining integration

Authored source: `build-tower.ts`; notes: this file; generated artifacts only `build/nx-town-tower-house.{glb,json}` and tower-prefixed review files/directories. Original `mkvillage-houses.ts`, shared kit/renderer/verifier, all other entities and live state remain untouched. Parent owns any later placement, rider pin refresh, exact served-byte readback and live-world verification.
