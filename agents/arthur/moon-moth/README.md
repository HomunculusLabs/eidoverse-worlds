# Moon Moth

An ivory-and-brass mechanical moth with living wing strokes and a real passenger cushion. A bounded flight rises above the west district, traces a gentle circle, and returns to its original perch.

## Live ride (automatic)

World: https://eidoverse.billding.dev/?world=commons-next

Target: `nx-moonmoth-001`, perch `[-90, 0.0008015504140560737, 13]`, heading `Math.PI/2` (east-facing). From the plaza, head west past the windmill, toward the screw-well and lavender beds. The perch is 13 metres toward +Z from the west axis. It is not guaranteed visible from spawn.

The public client supports an explicitly named seat from anywhere:

1. `/sit nx-moonmoth-001.seat`
2. `/use nx-moonmoth-001 fly`
3. Remain seated through the 90-second flight. Press X or WASD to get off after landing.

The flight holds a fixed heading deliberately; the current native path evaluator cannot smoothly bank through waypoint corners. Wings articulate independently while the central passenger seat stays rigid. The circuit reaches 22 metres above perch ground; it is not terrain-following. Activation requires a present actor within four metres of the seat, not a server-proven seated passenger. Repeated activation during flight does not restart it.

## Manual steering — local implementation, not deployed

Start the isolated playground from the repository root:

`bun agents/arthur/moon-moth/manual-local.ts`

It prints a loopback-only URL. The playground has its own world log and source snapshot; it does not copy resident credentials or live-world state. Mount with `/sit nx-moonmoth-001.seat`, then:

| Key | Action |
|---|---|
| F | Claim pilot control and take off |
| W / S | Forward thrust / brake |
| A / D | Turn |
| Space / C | Climb / descend |
| Release keys | Decelerate to hover |
| X | Return to dock, land, then dismount |

Build/edit mode owns its editing keys and pauses flight. The local corridor has a 30 m root radius, 22–35 m cruise band and a vertical dock shaft. This is authored clear-airspace flight, not obstacle avoidance. A disconnect freezes the last accepted pose; reconnect and press F or X to recover. There is no server-simulated automatic landing.

`docs/pilot.md` contains the shared client/server authority contract. `manual-browser.ts <fresh-evidence-directory>` runs the real isolated client/sequencer flight, captures video and checks steering, attachment, landing and reconnect. `manual-assets.json` pins the public live chair animation because the local upstream copy differs; only the scratch server receives that overlay. Do not adjust the socket to compensate for stale animation bytes.

Final local verification: 84 tests passed, one opt-in live inspection skipped; 18 browser checks passed against matching source pins. Evidence: `/Users/t3rpz/projects/excalibur/artifacts/studio/moon-moth/manual-steering/RESULT.md`. Image-tool review is auxiliary, not native vision. Live rollout still requires separate approval and fresh village airspace clearance; the automatic binding must not coexist with a pilot component.

## Reproduce and verify

Run from `/Users/t3rpz/projects/eidoverse-worlds`:

- `bun agents/arthur/moon-moth/build.ts` — rebuild the source GLB and model contract.
- `bun test agents/arthur/moon-moth/` — focused offline tests; the live inspection test is opt-in.
- `bun agents/arthur/moon-moth/model-review.ts --no-video` — exact-source local wing-motion review.
- `bun agents/arthur/moon-moth/site-preflight.ts --self-test` — signed clearance and malformed-input checks.
- `bun agents/arthur/moon-moth/place.ts` — dry run; no uploads or verbs.
- `bun agents/arthur/moon-moth/place.ts --stage` — stage content only; never a spawn permission.
- `bun agents/arthur/moon-moth/place.ts --apply` — explicit guarded installer or exact idempotent verifier. Do not run during a flight.
- `bun agents/arthur/moon-moth/live-review.ts --inspect --door-config agents/arthur/config.json --out <fresh-directory>` — isolated public-client inspection, zero durable verbs.

Read `SITE.md`, the complete source/served contracts, and current placement receipts before any live action. Never regenerate an accepted hash pin merely to make a failed gate pass.

## Authority

One newly commissioned object and one self-scoped behavior. No existing work moved or replaced, no engine deployment, no changes to resident controls, and no new permissions. The behavior may emit only `motion` against itself, with a five-second reconciliation timer and bounded refusal backoff. Private runtime state is not chat.

The model and script are content-addressed separately. Eidoverse serves an optimized GLB shadow at the source-addressed library URL; the reviewed source digest and the actual served digest must both be pinned. Source hash alone is not rendered-byte proof.

## Evidence boundary

`placement-*.json` documents exact authoritative entity, full component bag, scoped behavior, running status, current spatial evidence and emitted-operation counts. A successful placement receipt is not a successful ride.

`live-ride*/report.json` and its PNG/WebM captures document the actual public WebGPU client, isolated guest, self-mount, use, movement, return and self-dismount. The harness deliberately labels visual judgment `NOT_JUDGED`: metrics and screenshot creation never award visual PASS. The configured image-tool reviews in this working return auxiliary analysis; they are not described as native vision.

See the final `RESULT.md` for the observed completion status and remaining limitations. Until that exists, this file is usage documentation, not a claim that placement or flight has occurred.
