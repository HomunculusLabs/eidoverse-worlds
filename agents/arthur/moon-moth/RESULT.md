# Moon Moth — live and flown

## Result

A rideable ivory-and-brass Moon Moth now stands in **commons-next**. Two complete guest flights were exercised in the actual public WebGPU client. It returned to its unchanged perch, both guests dismounted, and the final independent readback reports the behavior **running**, phase **rest**, outcome **returned**.

## Ride it

Open https://eidoverse.billding.dev/?world=commons-next and enter:

1. `/sit nx-moonmoth-001.seat`
2. `/use nx-moonmoth-001 fly`
3. Enjoy the 90-second ride; press X or WASD to get off after landing.

The named-seat command reaches the seat from anywhere. For a walking approach, head west from the plaza past the windmill toward the screw-well and lavender beds; the perch is at X −90, Z +13. It is not necessarily visible from spawn.

## Evidence → decision → outcome

| Evidence | Decision / outcome |
|---|---|
| Source model, exact optimized public GLB, named wing/seat anchors and actual engine-motion tests | Bind source and served hashes separately. Model intact; both wings articulate while cabin and cushion stay still. |
| Fresh articulated radius 6.8m, dock/lift column, elevated-circuit clearance against 295 existing entities | Place one new object without moving or replacing anyone else’s work. |
| Installer protocol review found ignored `log` echoes and incomplete drift guards | Fix before spawning; tests cover exact echoes, refused commands, full remaining-plan drift, source/served pins and stage-only isolation. |
| Live avatar root follows the derived mount at all eight flight samples; Y range 22m and X/Z travel about 11.97m | Actual moving attachment, not just a server mount record. |
| Hips bone about 0.60m above cushion looked suspicious | Capture an orthogonal close side. Image review finds the visible trouser/pelvis surface flush on the cushion; bone height is not mesh contact height. No speculative socket change. |
| Two timed sequences reach the exact original root position; guests dismount through native controller | Closed flights and cleanup exercised, not merely simulated. |
| Final independent snapshot plus behavior debug | Full target/components exact; running/rest/returned; verification rerun emits zero uploads and zero verbs. |

### Test and execution scope

- Focused command: `bun test agents/arthur/moon-moth/` — **53 passed, 1 skipped, 0 failed** after the post-delivery installer correction below (initial delivery: 51 passed). The skip is an explicitly opt-in live-inspection test; public inspection and both rides were executed separately.
- Six initial installation verbs; no upload required during final installation because both exact assets were already stored. Subsequent verification reruns: zero uploads, zero verbs.
- Latest live ride: `agents/arthur/moon-moth/live-ride-02/report.json`; eight flight samples, `movingAttachment=true`, `maxRootErrorM=0`, verified native-KeyW dismount, no harness errors.
- Last authoritative readback: **2026-09-08T01:50:05.736Z**, `post-review-readback.json`, strictly read-only. The earlier installation receipt remains `placement-1788831321018.json`.
- Target: `nx-moonmoth-001`, position `[-90,0.0008015504140560737,13]`, yaw `Math.PI/2`, scale 1.
- Source SHA256: `df959099a243ef27945380da52591cc3a7a0f34cc5ecc378abb0cc461498e519`.
- Actual served SHA256: `727de2063cde20d194f83959d72337c13ac18d4b3b4f5a1a10531455dd0c677c`.
- Script SHA256: `4adcd4929578e6501b7a96bcd6a4b7fa267b53a260afe0b31bbbf52514cd7389`.

### Post-delivery installer correction

The complete delayed preflight review exposed two findings that parent verification had not actually closed: join replayed an already-applied snapshot tail, and the binding check did not constrain its author. Successful flights and the previous green suite did not prove those edge cases safe.

Both were reproduced RED and corrected GREEN. The wire regression reproduces a mount→remove tail resurrecting a dangling parent; the corrected join retains authoritative current state and uses the tail only to establish the sequence watermark. Binding validation now requires the approved `arthur-moonmoth-builder` author, rejecting missing/foreign authors without mutation. The other review findings—exact log echoes, source/served pins, full remaining-plan drift, runtime and extra-controller guards—were already present and re-tested.

Targeted installer tests: **20 passed**. Full focused suite: **53 passed, 1 skipped, 0 failed**. A separate read-only live join/debug check found the exact target, approved author, no pending operations, and running/rest/returned state. No uploads, world verbs, redeployment, model or flight-script changes, commits, or new ledger credit. The original footage remains valid evidence of the unchanged ride, not proof of the corrected installer edge cases.

### Visual evidence

Excalibur artifact directory: `/Users/t3rpz/projects/excalibur/artifacts/studio/moon-moth/`.

- `moon-moth-live.mp4`: actual public-client recording, opening setup trimmed, normal speed, no generated flight frames or recoloring. Verified MP4: 1280×900, 25fps, 100.32 seconds.
- `moon-moth-seated.png`: orthogonal close view of the actual avatar/cushion contact.
- `moon-moth-airborne.png`: actual mid-flight view over the west district.

Original PNGs, complete WebM recordings and timestamped telemetry remain under `live-ride-01/` and `live-ride-02/` in the world repository. The exported video was decoded and sampled at its beginning/middle/end; no blank export frames appeared in those checks.

### Limitations and authority

This is a first version with a **fixed heading**, not banking or tangent-steered flight. Its path rises 22m above the perch ground; it does not terrain-follow. Activation checks nearby presence, not server-proven seating. Testing used an isolated guest avatar, not every possible custom avatar.

The world was dark during capture, so distant scenery is harder to read. The configured image tool returned **auxiliary analysis, not native image attachment**. Close front/rear/side, airborne and returned views were reviewed with that provenance; the numeric harness intentionally retains `visualVerdict: NOT_JUDGED`.

The behavior has only `motion` authority against itself. There was no engine deployment, new permission, resident-control write, user-browser takeover, commit, or push. Excalibur’s working/ledger records are real files; no automatic cast or engine-enforced charge debit is claimed. Ledger tag `moonmoth-1` counts conservatively one new installation.

**Next action:** Bill rides it and judges the feel. Tangent banking, richer interaction UI and custom-avatar-specific fitting remain deferred, not claimed implemented.
