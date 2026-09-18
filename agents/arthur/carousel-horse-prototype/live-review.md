# Carousel live review

Only `--help`, `--check`, and the tests are offline. Running without either offline flag opens a live guest inspection. Live execution belongs to the parent/operator after placement authorization.

## Offline checks

From `/Users/t3rpz/projects/eidoverse-worlds`:

```sh
bun test agents/arthur/carousel-horse-prototype/live-review.test.ts
bun agents/arthur/carousel-horse-prototype/live-review.ts --ride --check --all-slots --expect-lib store/07c7feba5157336b.glb
```

Tests launch isolated headless Chrome on an inert data URL with all HTTP/WebSocket networking blocked. Transport and Three/raycast fixtures are explicitly synthetic unit-test inputs, not live ride evidence. No test reads a door config or joins a world.

## Parent: installed cream horse_2

```sh
cd /Users/t3rpz/projects/eidoverse-worlds
bun agents/arthur/carousel-horse-prototype/live-review.ts --ride --slot horse_2 --expect-lib store/07c7feba5157336b.glb --door-config agents/arthur/config.json --channel chrome --times 2,5,9,14,20 --out "/tmp/carousel-cream-ride-$(uuidgen)"
```

For the installed full set, replace the exact `--expect-lib` value with the parent's verified new lib and replace `--slot horse_2` with `--all-slots`. Four slots run sequentially in distinct fresh guests, stopping on the first failure. Output directories must not already exist.

## Scope and evidence

- Fixed `commons-next` / `nx-carousel`; default `horse_2`, optionally `horse_0`, `horse_4`, `horse_6`.
- Node relay and serialized page guard both fail closed. A single own guest join, presence and read-only requests; an explicitly armed single own mount and native own dismount only. No `use`, comp, motion, upload, lease, puppet, drag, resident identity, browser attachment, or socket edits.
- Only `joinToken` is selected by the scoped Node loader; it never enters the page/URL. No config contents are printed.
- Exact lib, occupied-carrier, nested part hierarchy, motion-base and public API checks precede arming. Missing public module hashes block mounting. Actual loaded module hashes and checkout comparisons are recorded, not assumed identical.
- Three close views, wide timed captures, dense samples, dismount capture, PNG/video hashes, camera and rider screen positions, authoritative/local mounts, root/state errors, horse motion, rider travel and horse-local drift. The stationary entity root is not the carousel motion oracle.
- Optional geometry contact uses actual loaded saddle material `prototype_saddle_leather` or `horse_N_saddle_leather` within that horse. The downward ray starts at horse-local `[.075,1.12,0]`, away from the pole; the approved seat plane is local Y `1.015`. Merged mesh names are not assumed. A ray miss stays `null`.
- Socket metadata, including original heights, is captured and compared throughout the ride; never corrected by this harness.

Each slot writes `report.json`, PNGs, and an unedited public-browser video for rides; the root writes `summary.json`. Errors produce `BLOCKED`/`RIDE_METRICS_FAILED` and a nonzero exit, with native own-dismount cleanup attempted. Join rejection, missing WebGPU/avatar, missing public APIs or nested motion, stale lib, occupied ride, socket drift, or unresolved dismount are blockers, not reasons to patch the engine or broaden permissions.

`RIDE_METRICS_CAPTURED` means numeric evidence was collected, **not** a native visual PASS. `visualVerdict` always remains `NOT_JUDGED`; the parent must inspect saddle contact/occupancy, rotation/bob attachment and dismount frames. The harness is ad-hoc evidence, not the repository's nonexistent canonical seating suite.
