# CAROUSEL REWORK PLAN

Status: ACTIVE — full re-authoring, not a garnish pass
Owner: Arthur / Bill visual gate
Target: `av-carousel` at live pose `[-18.8, 0, 25.9]`, yaw `2.5137152734169854`

## Intent

Rebuild the carousel as a mechanically coherent, materially legible wonder-piece. The current asset has the right noun-level silhouette, but it is not yet a convincing constructed ride: several poles read as floating, the horse leg compositions are weak, the canopy is a flat color slab, and the material families do not carry enough information at gameplay distance.

This working does not count a couple of added primitives as completion. The carousel is complete only when the structure, attachment logic, textures, motion anchors, sockets, and live presentation all survive the gates below.

## Non-negotiable laws

- Preserve entity id `av-carousel`, live footprint, current pose, and the radial village layout.
- Before replacement, capture the complete live component bag and socket map from `/geom`; do not infer it from placers.
- Same-id spawn wipes components. Re-apply every captured component after replacement, including sockets. Pennants are static canopy geometry under the rotating platform; they must not carry independent orbit/pendulum comps.
- Decode suspected defects at source and decode the rebuilt GLB before upload.
- Keep the nested `mergeByMaterial` architecture: static geometry merges; only intentional motion/socket anchors remain named.
- Upload one new content hash, pace the upload, and place at the current live pose—not the stale era-2 `(26,18)` pose in `placecarousel.ts`.
- Use `ad-hoc verified`, never `suite green`; this repo has no canonical test/lint/build command.
- Bill owns the visual eye-check. Arthur may not self-declare the piece finished from geometry counts alone.

## Live contract to preserve or deliberately migrate

Captured from the live world before rework:

- Entity: `av-carousel`
- Pose: `[-18.8, 0, 25.9]`
- Yaw: `2.5137152734169854`
- Motion: platform spin plus four horse bob components
- Sockets: eight riding positions: `horse_0`, `bench_1`, `horse_2`, `bench_3`, `horse_4`, `bench_5`, `horse_6`, `bench_7`
- Pennant anchors: `cr_flag_0` through `cr_flag_7`, parented under the rotating platform with no independent motion components

The current source and live bag disagree about horse motion naming (`horse_0..3` in the live bag versus `horse_0/2/4/6` in the current source-era conventions). This is a contract defect to resolve before rollout, not something to paper over. The rework will establish one canonical anchor map and update the dedicated placer and verifier together.

## Rework phases

### [candidate-1] STRUCTURAL + MATERIAL PASS — LIVE, VISUAL GATE FAILED FOR HORSE SILHOUETTE

Built and deployed as `store/9135e28394ad3632.glb` at the preserved live pose.
The candidate established the attached mast/rib/pole structure, six textured
material families, canonical horse/bench anchors, complete sockets, and all
eight pennant motions. Live component census is complete. The visual frame
shows the deck/base and fabric materially improved, but the horse bodies still
read too rectangular and the legs still read as supports rather than carved
articulated limbs. The front stair also needs a proper landing transition.
Do not call this complete; next pass is horse silhouette + stair attachment.

### [candidate-2] FACETED HORSE VOLUMES — LIVE, VISUAL GATE DEFERRED

Replaced the box-built barrel/chest/rump and block legs with faceted volume
forms and tapered cylindrical upper/lower limbs while preserving all anchor
names. Deployed as `store/1606f2e935e8a7cf.glb`; the live hash, pose, socket
map, four horse motions, and eight flag motions were verified after the
rate-limited placer was repaired. The resident's cooperative auto-seat behavior
made the subsequent approach captures unusable (inside-seat occlusion), so no
claim is made yet about whether this pass clears the horse silhouette bar.
The next valid review must begin from a clean spectator distance.

### [candidate-3] EXPORT-SCALE CORRECTION — LIVE, PRESENTATION STILL OPEN

Live review exposed a real exporter mismatch: the authoring script used
mesh-level `scale` on the new SphereGeometry horse volumes, while the GLB
writer serializes position/quaternion but not mesh scale. The live result was
therefore giant unit spheres instead of horse anatomy. The four scaled sphere
geometries are now baked with `BufferGeometry.scale()` before export.
Candidate `store/d892ed5befe889c6.glb` is live and the giant-volume failure is
gone. Two warm lights were restored at the current carousel pose and added to
the durable placer. Remaining visual work is open: the canopy still dominates
the horse layer, contrast is weak at night, and the pole/underbody connection
needs a clean spectator-distance review.

### [candidate-4] TANGENTIAL HORSE HEADING — LIVE

The original `-a + PI/2` station rotation pointed the horse radially
outward. The first tangent correction `-a` pointed opposite the carousel's
actual rotation. The live carousel direction is the opposite tangent, so
horse and bench station groups now use `rotation.y = a`. Candidate
`store/9f74f9e5eae39b01.glb` is live with the full component bag restored; a
fresh frame confirms the visible horse heads now follow the travel direction.

### Phase 0 — contract freeze and forensic baseline

1. Obtain a fresh live `/geom` snapshot and, when available, decode the current live GLB by its content hash.
2. Record the current live pose, yaw, component keys/data, socket keys/data, footprint, and current lib hash in the working log.
3. Decode the current source build and live build separately. Produce a node/anchor diff.
4. Mark every current source defect:
   - floating or visually ungrounded poles
   - horse-to-pole attachment ambiguity
   - leg crossings and unsupported stance
   - canopy-to-mast and canopy-to-strut gaps
   - deck/rim/step discontinuities
   - material buckets that should become textured
5. Do not spawn anything during this phase.

Gate: source/live contract is explicit, and no replacement can proceed while an anchor name is unresolved.

### Phase 1 — structural skeleton re-authoring

Replace the current primitive assembly with an authored mechanical hierarchy:

- base: two true steps, faceted drum, visible deck rim, and a stable underside
- deck: radial boards/inlays with consistent thickness and a readable outer fascia
- central mast: lower collar at the drum, deck collar, upper hub, canopy collar
- canopy: hub → eight real radial ribs → fabric shell → edge fascia; every rib terminates in both the hub and canopy edge
- horse poles: each pole passes through a visible deck socket and terminates in a saddle clamp/underbody collar; no rod should appear to float beside a horse
- bench mounts: slab, back, two supports, and an under-deck bracket aligned to the socket point
- stairs: tread thickness, side cheeks, and a clean deck transition

The structure should read as something that could actually be assembled, not a set of overlapping boxes.

Gate: offline bounding/attachment probe shows every pole has a named lower and upper attachment region; no pole endpoint is visibly detached in the live eye-check.

### Phase 2 — horse re-authoring

Rebuild each horse as a coherent low-poly carved/painted figure, keeping the village’s restrained style:

- body: tapered barrel with chest and rump volume, not a single box
- neck: angled and attached through a shoulder/chest transition
- head: skull, muzzle, ears, and a small mane/forelock silhouette
- legs: four distinct legs in a stable two-pair composition; upper and lower segments with slight bends; hooves terminate on a consistent ride-height line
- tail: attached at the rump, with a simple swept profile
- saddle: blanket, saddle body, horn, and pole clamp all share the same local frame
- horse variants: lead horse warm gold; remaining horses bone, dark brown, and muted painted color; variation must be readable without becoming a rainbow

The leg design is a primary visual task. Avoid four parallel sticks and avoid crossed limbs caused by arbitrary local coordinates. Establish a front/back pair layout, then rotate the entire horse around the carousel ring.

Gate: front, side, and three-quarter offline renders/decodes show four readable legs per horse, no leg-body detachments, no pole penetration through the head/neck, and consistent hoof height.

### Phase 3 — material and texture rework

Move the carousel beyond flat PBR colors while respecting the village texture law:

- canopy fabric: deterministic 2–4 tone woven/radial material; subtle panel variation, not a decal
- deck wood: directional timber grain with restrained warm/dark variation
- horse bodies: painted wood/painted metal read through close-tone texture or deliberate color families; no noisy speckle
- saddle blankets: stripe/weave family with distinct but muted dyes
- brass: low-key metallic response on mast collars, pole clamps, finial, and saddle horns
- iron/dark hardware: roughness-led material, near-flat albedo
- stone/base: reuse the village ashlar/stone family where appropriate

Texture bytes remain below 400KB per GLB. Mapped meshes must carry authored UVs and decode with `TEXCOORD_0 == POSITION` for the mapped buckets only. Unmapped trim is allowed to remain flat and must not trigger an over-broad texture assertion.

Gate: decoded material inventory names the intended families; the canopy reads as fabric and the deck reads as wood at distance; no texture becomes a high-frequency sticker.

### Phase 4 — anchor, motion, and affordance contract

Canonicalize the named hierarchy and the live component placer in one change:

- platform anchor: `carousel`
- horse anchors: choose one contract and use it everywhere; preferred migration is the existing socket-compatible `horse_0`, `horse_2`, `horse_4`, `horse_6`
- bench anchors: `bench_1`, `bench_3`, `bench_5`, `bench_7`
- pennants: `cr_flag_0..7`
- sockets: preserve all eight live socket names and offsets unless a deliberate geometry correction is decoded and documented

Motion should be calm and mechanically meaningful:

- platform: slow spin, roughly 5–7 degrees/sec
- horses: four out-of-phase vertical bobs targeting actual horse group nodes
- pennants: independent low-amplitude pendulums targeting actual flag groups
- no motion target may point at a merged-away or nonexistent node

Gate: post-place live census proves the expected platform, horse, flag, and socket components; two frames separated by a known interval show platform rotation, horse bob, and at least one pennant phase change.

### Phase 5 — lighting and visual presentation

Add or restore warm lights only after geometry and placement are stable:

- one elevated warm source to catch canopy fabric and mast
- one lower source to separate deck, steps, and horse legs
- calculate light positions from the live entity pose/yaw, never by eye
- keep the carousel readable in the village’s neutral daytime view; do not rely on a dramatic night-only look

Capture visual review frames from:

1. approach/distance: whole silhouette and relationship to north gate
2. three-quarter medium: canopy, deck, horses, stairs
3. close: pole clamps, saddle/legs, deck materials, pennants
4. rider view: seat socket and horse/bench scale

Gate: Bill’s eye-check decides whether the improvement is beautiful enough to keep.

## Execution pipeline

For each rollout candidate:

1. Edit `mkcarousel.ts` and any shared texture/helper source.
2. Rebuild deterministically with Bun.
3. Decode node tree, bounds, anchors, material/texture chain, bytes, and hash.
4. Run focused offline checks; delete one-shot probes after one run.
5. Upload with rate-limit retry and record the returned content hash.
6. Spawn `av-carousel` at the captured live pose/yaw.
7. Re-apply the complete captured component/socket bag through a dedicated placer file. Never use the stale `placecarousel.ts` unchanged.
8. Verify live pose, lib hash, component census, socket census, and motion targets.
9. Capture visual frames and compare against the baseline.
10. Only after Bill’s eye-check: append the exact ledger entry and include the source/placer/verification evidence in the refinement record.

### [candidate-6] RIDER SOCKET CONTACT + NO-ORBIT PENNANTS — LIVE

- Horse sockets moved to the authored saddle plane at local `y=1.97`.
- Bench sockets moved to the authored bench slab plane at local `y=1.46`.
- A live mount/dismount smoke test mounted `arthur-builder` to `av-carousel.horse_0`, observed the live parent/slot record, and dismounted cleanly.
- Mounted-body composition follows the parent entity's animated transform through the server's effective-transform contract, so riders inherit carousel rotation.
- Pennant motion comps were removed; the eight pennant nodes remain under the rotating platform and inherit only its spin.

## Acceptance criteria

The rework is not complete until all are true:

- no visibly floating mast, rib, horse pole, bench support, or pennant pin
- horse legs have deliberate, stable compositions and read at gameplay distance
- canopy, deck, horse bodies, blankets, brass, and dark hardware read as different materials
- canopy ribs visibly connect the mast hub to the fabric edge
- platform spin, horse bob, and all eight riding sockets survive replacement; pennants inherit platform spin without independent orbit
- current pose and village footprint remain unchanged
- rebuilt GLB is deterministic, under texture budget, and has no dead motion anchors
- live hash and component/socket census are recorded
- Bill approves the visual result after the multi-distance eye-check

## Deferred until the structural rebuild earns approval

- extra canopy ornament
- more pennants or decorative lettering
- new interaction verbs
- particle effects
- broad village-wide material changes

The first objective is not more content. It is one carousel that looks assembled, rides correctly, and carries its materials and motion honestly.
