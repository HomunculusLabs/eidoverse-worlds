# Village-overhaul live eye evidence

## Canonical BEFORE capture

- `reviews/live-before-05-renderer/manifest.json`: **CAPTURED**, 30 genuine live `/snap` PNGs, 17 hosts. Full PNG SHA-256, actual HTTP metadata, exact target tuples, body poses, nearby-companion tuples, and model-loaded receipts are recorded per frame.
- 17 `approach` views; 5 real `interior` views (hall, inn, stable, court bakery, nx-tower upper study); 7 open-air `workstation` views; 1 open-belfry `detail`. Gates have no claimed interior. The low potter workstation uses a lowered diagnostic eye, not a room/walk proof.
- Fixed matching contract: `live-views.json`. Canonical sorted-JSON views SHA-256: `dbd5c3b57b02d3998f2e8d48fc9687c00c503d9c860679993a8eaf9bd86529a6` (this is not the raw file-byte SHA).
- All 17 frozen baseline targets were checked on every BEFORE census, including subset runs. The final capture's target tuples and selected nearby-companion tuples match exactly before/after every image; the PNG hashes and model-loaded receipts were independently checked from the files.
- Body: 1 join, 1859 stationary poses, **0 authored verbs / 0 uploads**. Owned public renderer: 1 join, 30 `snap-result` replies. Its whitelist blocked 2 unknown messages and its HTTP guard blocked 2 non-read requests; nothing blocked was transmitted. `renderer-close.json` proves `closed: true`, `browserConnected: false`; body closure is true in the manifest. No service, shared browser/GUI, global config, or persistent renderer was installed.
- Two labeled contact sheets and an independent native Codex review are in the same directory. `CAPTURED` means real images and contracts, not an automatic visual PASS. Consult `native-review.md` for framing limitations.

- **Fresh parent deployment handoff:** `reviews/live-before-hall-inn-fresh-renderer/manifest.json` completed `2026-09-08T02:33:41.754Z` with 4 real PNGs (hall/inn approach/interior), all 17 baseline targets guarded, exact per-frame target/nearby tuples, verified PNG hashes and model-loaded receipts, 1 body join / 342 poses / 0 verbs. Renderer sent 1 join / 4 snap replies, then closed; the body closed too. This is the freshest hall/inn original evidence. No live capture remains running.
- **Visual result, not an all-green claim:** independent native review of the canonical 30 frames accepted 27 for matched night comparisons. Hall and court interiors remain too dark for meaningful visual assessment; nx-tower upper-study interior remains foreground-obstructed and dark. Inn and stable interiors are marginal but readable. These raw actual images are retained with their limitations, not represented as full interior appearance verification. No authored light/sky change was made to improve them.

## Reuse AFTER (parent-run only)

From repository root, supplying the explicit 17 target IDs and an **explicit final expected tuple array** (same schema as `before/contracts.json`, with deployed `lib` values):

```sh
bun agents/arthur/village-overhaul/live-eye.ts \
  --targets nx-town-hall,nx-town-inn,nx-town-stable,nx-town-woodyard,nx-court,nx-forge,nx-town-market,nx-town-dyehouse,nx-town-potter,nx-town-kiln,nx-town-belltower,nx-tower,nx-town-shrine,nx-town-gate-n,nx-town-gate-s,nx-town-gate-e,nx-town-gate-w \
  --expected reviews/live-final-expected.json \
  --phase after \
  --views live-views.json \
  --out reviews/live-after-01 \
  --allow-renderer
```

`reviews/live-final-expected.json` is a parent-created input, **not an existing output or fabricated deployed contract**. Input/output paths are resolved from this campaign directory. Targets may be any explicit unique subset; no implicit whole-world target default. The expected array can contain the full campaign; only the explicit subset is photographed. IDs outside the campaign, duplicate IDs, wrong origin/world, and host pose/kind/parent/component/name drift are rejected. BEFORE also pins baseline libs; AFTER only permits lib changes relative to frozen hosts. AFTER is not run by this lane.

If `/snap` has no renderer, the original output retains its honest HTTP 503 manifest. With `--allow-renderer`, one paced retry starts a fresh bounded headless **actual public client**, captures to `<out>-renderer`, and closes it. It never uploads a model or sends a world verb. If the API already serves a renderer, the tool uses that API without touching the shared renderer; only an owned fallback has inspectable local renderer identity/model-loaded telemetry.

Keep the same `live-views.json`, avatar configuration and public-client viewport for matched AFTER, and compare the resulting `viewsSha256`, frame `bodyPose`, dimensions, and per-target view IDs against the canonical BEFORE manifest. Matching is evidenced by those fields; the current CLI does not silently infer a BEFORE manifest. Keep matched approach shots even when taller new roofs crop them. Add separately labeled supplemental AFTER evidence rather than replacing the matched baseline or calling a changed camera a matched view. The current fixed-view validator intentionally supports approach/interior/workstation/detail, not arbitrary supplemental names.

## Scope, protection, and interpretation

Nearby companions are selected by intersection with the frozen host's transformed world-XZ envelope plus 1.5 m. Selection uses a point fallback for lights, is explicit in `nearbyCompanionSelection.byHost`, and includes protected signs, artwork, lights, roads and accepted cabins that genuinely lie nearby. Selected companion tuples are pinned at capture start and checked unchanged on every census. Existing baseline-to-current differences are reported, never silently accepted as a placement approval.

Unrelated protected objects are observations, not capture blockers. A separate approved carousel lane changed `nx-carousel` from frozen `store/ce3633992d07055e.glb` through `store/07c7feba5157336b.glb` to observed `store/1c0128b61b510a5d.glb`. This lane emitted none of those changes. Final capture records that pre-existing discrepancy; no protected tuple changed during final capture. It is not permission to mutate the carousel and not a claim that the whole world matches the old baseline.

The public client streams distant geometry as translucent placeholder boxes. Before each owned-renderer `/snap`, the tool moves only its ephemeral renderer camera to the requested body position and waits until the target and selected model companions are real loaded entities (`!userData.placeholder`). `/snap` still composes the live body's own first-person eyes through the unmodified public runtime. No local mock scene or local GLB render is substituted.

The first-person API uses avatar/runtime eye height and a fixed shallow down-pitch; `lookLocal` supplies yaw, not arbitrary camera pitch. Body positions are diagnostic assignments, not collision-tested walking. Nighttime limits material and interior legibility; weather, particles and unrelated activity are live. Do not change authored sky, lights, floors or geometry to brighten these evidence captures.

## Preserved attempts

- `live-before-01`: failed before joining because the first protection reader treated `{geom, folded}` records as plain entities. Fixed under a failing regression test.
- `live-before-02`: failed before joining on the out-of-scope carousel's independently changed lib. Preserved; no target drift.
- `live-before-03`: true API 503. `live-before-03-renderer`: 15 actual PNGs before the original overbroad guard stopped on another carousel update. Owned renderer/body closed. An auxiliary vision-tool response reviewed that early contact sheet; it is not native parent sight.
- `live-before-04`: true API 503. `live-before-04-renderer`: complete 30-image capture, all target tuples exact. Native independent Codex review identified five weak views; these are preserved, not rewritten.
- `live-before-05`: true API 503. `live-before-05-renderer`: revised, fully loaded canonical 30-image capture with local companion guards. Native review uses the parent-provided Codex 0.153.4 `gpt-6-astra` path in ephemeral read-only mode; reviewer sight is not parent-coordinator sight.

## Verification

```sh
bun test agents/arthur/village-overhaul/live-eye.test.ts
```

Tests include schema/scope negatives, both wire whitelists, real local HTTP-PNG and WebSocket capture, immutable failed manifests, strict renderer identity, a real browser transport guard, renderer cleanup on success/failure, protected wrapper parsing, unrelated protected drift, nearby selection, and actual browser waiting for non-placeholder models. Synthetic fixture PNGs are explicitly labeled test-only and removed with their temporary directories; none are in live review outputs.

Only campaign `live-eye.ts`, `live-eye.test.ts`, `live-views.json`, this note and `reviews/live-*` evidence were authored by this lane. No commits, uploads, live authored verbs, original builder edits, or cabin-tool edits.
