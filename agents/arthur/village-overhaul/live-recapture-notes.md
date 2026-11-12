# Hall/inn supplementary live recapture

**Status: VERIFIED_SUPPLEMENTAL_LIVE_WITH_LIMITATIONS.** Seven genuine live `/snap` PNGs and four separately labeled local exact-served-byte daylight/fill PNGs. No authored world verbs, uploads, GUI mutation, live light/sky/exposure edits, client edits, shared-tool edits, or commits. The assigned ephemeral camera-body poses are not walked collision routes.

## Preferred evidence — exact campaign-relative paths

| Purpose | Actual live PNG | Native finding |
|---|---|---|
| Hall doorway-facing interior | `reviews/live-recapture-01-renderer/nx-town-hall-interior.png` | Complete doorway and threshold-connected floor clearer; foreground bench masks some floor and overhead luminous crop remains conspicuous. |
| Inn inhabited porch, corrected sideways view | `reviews/live-recapture-02-renderer/nx-town-inn-approach.png` | Settle left, table right, sign beyond right post now read as separate objects. Post still partly obscures sign and overlaps table in projection. |
| Inn doorway-facing interior, reduced bulb dominance | `reviews/live-recapture-02-renderer/nx-town-inn-interior.png` | No large central bulb visible. Doorway and right-hand stair establish layout. Foreground table still overlaps lower doorway in projection; ceiling/exterior remain dark. |

Supplementary alternatives are preserved, including the first porch view that did **not** resolve the overlap:
- `reviews/live-recapture-01-renderer/nx-town-hall-approach.png`
- `reviews/live-recapture-01-renderer/nx-town-inn-approach.png` — superseded for the porch question.
- `reviews/live-recapture-01-renderer/nx-town-inn-interior.png` — rear-right view still contains the bulb at upper right.
- `reviews/live-recapture-01-renderer/nx-town-inn-detail.png` — rear-left doorway view, useful floor relationship but conspicuous overhead luminous crop.

**Primary packet / exact image hashes / camera metrics / status / traffic:**
`reviews/live-recapture-diagnostics/snapmanifest.json`.

Actual per-snap manifests:
- `reviews/live-recapture-01-renderer/manifest.json` — CAPTURED, 5 images.
- `reviews/live-recapture-02-renderer/manifest.json` — CAPTURED, 2 images.
- Corresponding `frame-*.json`, `supplement-telemetry.json`, and `renderer-close.json` are beside each manifest.
- `reviews/live-recapture-01/manifest.json` and `reviews/live-recapture-02/manifest.json` preserve the real 503 renderer-unavailable attempts; they are not image evidence.

`reviews/live-views-recapture.json` now selects the preferred mixed-round stations for future supplemental use; it is **not** the original fixed before/after contract. Round-one input is archived at `reviews/live-recapture-diagnostics/views-01-captured.json`; round-two input at `reviews/live-recapture-diagnostics/views-02.json`. Immutable manifests embed the exact inputs used, including their canonical views hashes. The round-two planning note guessed the bulb would leave the left edge; actual camera projection proves it leaves the **right** edge. The preferred contract corrects that annotation without altering a captured manifest.

## Actual lighting and camera diagnosis

Do **not** report these captures simply as night. The premise did not survive telemetry:
- Both owned live renderers reported `dayness: 1`, unchanged exposure `1`, FOV `55`, aspect `4/3`, near `0.15`.
- The separate fresh read-only join found `snapshot.state.sky: null`; the repository's shared `effectiveClock` resolves this to **fixed noon, hour 12**. The second live renderer returned `skyArgs() == {}`. `sky-snapshot.json` contains the exact sky/light readback and closure receipt.
- The authored hall light is at world `[9,2.5,-26]`, host-local `[0,2.5,0]`, intensity `1.7`, range `6.5`.
- The authored inn light is at world `[36,2.35,0]`, host-local `[0,2.35,0]`, intensity `1.6`, range `6`.
- Each target light won slot 0 near its host, yet its **runtime point-light intensity was zero**. All eight sampled point-light slots were zero in every captured frame. The requests were day-aware; this is consistent with the public rig's daytime dimming, not a missing light entity or an authored fix. Inferred host lamps had no assigned slots.
- The light gizmos still render: the observed inn authored gizmo world bounds are approximately `[35.87,2.22,-.13]..[36.13,2.48,.13]`. A visible glow is not evidence that it illuminates surrounding furniture. We do not claim every luminous crop is this one authored gizmo.

The corrected inn interior moved from the rear-right station `[3.2,.198,-1.95]` to the east aisle `[3.2,.198,-.6]`, looking toward `[0,.198,3]`. Its observed actual eye was host-local `[3.1023833247732213,1.6173950175776541,-0.4569794101990676]`. The authored bulb center is 3.2203 m from that camera and 40.7204 degrees off-axis, beyond the 34.7641-degree horizontal half-FOV. Projecting the **actual observed bulb bounds** gives NDC X `1.117398..1.365012`, entirely beyond the right edge. Native review independently confirms no large central bulb in this frame. Camera geometry, not exposure manipulation, produced the improvement.

The corrected porch station `[1,.198,3.85] → [2.85,.198,3.95]` is inside the central porch aisle, looking sideways across the seating. This presents the settle, table and sign at separated bearings instead of stacking them along an exterior-front sightline. Some post/sign occlusion remains; no hidden physical clearance is certified.

Discovery and served geometry files: `reviews/live-recapture-diagnostics/discovery.json`, `geom-initial.json`, `geom-final.json`, `served-decode.json`, and both `*-served.glb` files. The initial Python urllib GET received 403; ordinary curl successfully read the public endpoint. The archived initial-census traffic timestamp in `discovery.json` is its local readback time, not the earlier curl request start.

## Explicitly LOCAL daylight/fill supplements — not live and not a light fix

`reviews/live-recapture-local-daylight/manifest.json` records four renders with the same observed live camera matrices/FOV, byte-checked in-browser from downloaded served GLBs. Every image includes a conspicuous **LOCAL / NOT LIVE / NOT A LIGHT FIX** label outside the image canvas:
- `reviews/live-recapture-local-daylight/nx-town-hall-interior-LOCAL-DAYLIGHT.png`
- `reviews/live-recapture-local-daylight/nx-town-inn-detail-LOCAL-DAYLIGHT.png` — native review's clearest inn doorway/furniture relationship.
- `reviews/live-recapture-local-daylight/nx-town-inn-approach-LOCAL-DAYLIGHT.png`
- `reviews/live-recapture-local-daylight/nx-town-inn-interior-LOCAL-DAYLIGHT.png`

These are a host-only synthetic neutral fill rig, not the public runtime: no terrain, neighbors, avatar, authored point-light gizmos, live weather, or public postprocessing. No model recoloring or remodeling was performed. Identical consecutive raw canvas controls were byte-identical for all four views. Browser/server closed; 11 loopback GET reads, zero world requests. The local rig is deliberately more legible and must not be compared as a live lighting improvement.

Served byte pins (not original-upload hashes):
- Hall `store/dc871edb1b45ce0f.glb`: `8a4f16dd7a86361f9d4496bfba5cf94a5385be6fb1523b290bb7a6225217d13c`.
- Inn `store/861225bb15230d9b.glb`: `858604174a71249b4b0cae77d6bb38988c014acbf5a51d48db36bfb6a9723a5a`.

## Native review and remaining limitations

Independent native `gpt-6-astra`, Codex CLI **0.153.4**, ephemeral/read-only, with actual PNG image attachments and no model tool calls:
- `reviews/live-recapture-native-review/review-v2.md` + `.log` — reviewed original inn interior and all first-round live frames.
- `reviews/live-recapture-native-review/final-review.md` + `.log` — reviewed both corrected live frames and all four local supplements; explicitly confirmed sight of all six.

This is independent reviewer native sight, not coordinator native sight. The system-installed CLI 0.152.1 failed before review with the provider's newer-version requirement; its failed log is retained. CLI 0.153.4 was installed only under owned `reviews/live-recapture-native-cli/`; no shared CLI/config was changed.

Remaining: dark ceilings/exterior; projected furniture/post overlaps; no collision/walking proof; original hall luminous crop remains conspicuous. Native local review saw no definite floating part or solid doorway obstruction, but noted thin background-colored slivers along some inn window bottoms, warranting a separate interface check. These are unresolved observations, not certified cracks or hidden collision failures. No geometry or lighting repair was attempted in this lane.

## Verified preservation and read-only traffic

`verify.ts` exercised actual PNG hashes/dimensions, all model-loaded receipts, companion equality around each snap, renderer/body closure, shared `live-eye.ts` source hash, local byte/control checks, and a final fresh census matching **both** exact deployed tuples. No protected tuple changed during either capture. **203 pre-existing live-evidence files, including original `live-views.json`, remain byte-identical.** New frames never replace fixed BEFORE/AFTER images.

Capture/world observation traffic (excludes npm package retrieval and native model API requests):
- Bodies: **3 joins**, **610 stationary poses**, **0 authored verbs**; all closed. Third join was sky-only, zero poses.
- Owned renderers: **2 joins**, **7 snap-result replies**; both closed, browser disconnected.
- **38 direct HTTP GET attempts** + **689 renderer GET/HEAD requests** = **727 capture-related HTTP reads**. Browser count includes its asset origins. Direct count includes one 403, two 503 availability attempts, two 404 pre-body probes, and final census.
- Guards refused **4 unknown renderer WebSocket messages** and **1 non-read HTTP request**; none was transmitted. **0 uploads**, **0 authored world mutations**.

Reproduction helpers live only in `reviews/live-recapture-diagnostics/`: `discover.py`, `decode.ts`, `capture.ts`, `sky.ts`, `local-daylight.ts`, `verify.ts`. Evidence-writing helpers refuse existing manifest targets; choose a fresh `live-recapture-*` output rather than overwriting. No capture or renderer process remains running.
