# STRUCTURES PLAN — artistic-architecture lane (struct-N)

Durable plan for the STRUCTURES LOOP. One authored structure per wakeup:
concept contract → build → decode audit → review → siting → placement →
ledger + commit. Design laws live in STRUCTURES-LOOP.md.

## Design queue

1. [DONE struct-2] S-1 The Observatory — era-1 heritage reborn: ashlar drum
   with oculus-slit dome, harmonic ring courses, brass meridian band,
   circular sky-view bench inside.
2. [DONE struct-3] S-2 Shell Tower — golden-spiral ribbon tower between
   bunkhouse and hall; crown socket access (ramp trimesh not standable —
   engine limitation, same class as artwalk-8 stairs).
3. S-3 Hypar Pavilion — Ruled Sky at building scale: hypar canopy on four
   slender posts, plaza-adjacent shade structure.
4. S-4 Möbius Bandstand — half-twist band roof over a performance circle;
   echoes the Half-Turn Gate.
5. S-5 Reed Bridge / waterfront folly at the fieldpond — ripple rhythm
   balustrade.

## Siting log

| tick | structure | site (deg/r) | world pos | yaw | verdict |
|------|-----------|--------------|-----------|-----|---------|
| struct-2 | S-1 Observatory | 292°/44 (NW wedge, hall↔artwalk column) | (16.48, −0.052, −40.80) | −0.3839 (door→plaza) | LIVE, walk 5/5 |
| struct-3 | S-2 Shell Tower | 266°/38 (bunkhouse↔hall gap, N of axis) | (−2.65, −0.052, −37.91) | 0.0698 (widest→plaza) | LIVE, crown socket; ramp NOT standable (engine) |

## struct-2 — S-1 THE OBSERVATORY (concept contract + record)

**Concept**: the sky-watcher's drum. One idea: a stone eye turned upward.
Silhouette = squat ashlar drum + squashed dome + brass meridian arc riding
over an oculus slit. At gameplay distance it reads "observatory" before any
detail: dome, arc, eye.

- Geometry as ornament: harmonic ring courses (spacings 0.25/0.55 — halving
  rhythm toward the dome), the meridian tube follows the dome's own profile,
  the door is a clean gap in the drum shell with bone jambs/lintel.
- Enterable: yes. Bbox 6.74×4.47×7.32 (49.3m² footprint ≥16, 4.47m ≥2.2 —
  honest room gates, real trimesh). Door clear span 1.87m ≥1.4m, threshold
  rise 0.22 ≤0.25m, stoop two-rise outside.
- Materials: standing families only — ashlar tile (stone), timber tile
  (bench), brass (meridian, oculus rim, gnomon), bone (door), DARK slits.
- Interior: circular 10-segment timber bench ring at r2.35 under the oculus,
  central brass gnomon (1.15m, sphere tip) — a sundial heart under the sky.
- Build: mkv3-observatory.ts → village_observatory3.glb, deterministic ×2,
  sha256 337ce538fc89feaf9862cf97ec8722da948e473d2f8e20996b224c99c935d38e,
  10 nodes after merge, no comps (statuary contract), no motion.
- Review: browser render blocked by approval gate this session; source
  decode audit passed (dome seated at rim after one caught defect — first
  build floated the dome 2.4m; fixed, verified in accessor bbox). Under
  Bill's standing visual-tool waiver this placement proceeds
  source-grounded; VISUAL PASS NOT CLAIMED — Bill's eye-check required.
- Siting: NW wedge 292°/44 chosen from 137 passing candidates (min SAT gap
  6.81m to nx-artwalk-h7); terrain flat (−0.05m). Highest-visibility NW
  spoke candidate was occupied by the artwalk heritage column (315°), so
  the wedge between hall (289°) and column was the honest pick.
- Placement: nx-struct-observatory, store/337ce538fc89feaf.glb,
  PLACED_VERIFIED, idempotent rerun zero verbs, MCPL two-way walk 5/5
  (outside→inside→bench→far→inside→outside, all arrivals ≤0.39m).

**Bill should eye-check**: from plaza NW approach — dome + brass meridian
silhouette; night: no emissive on this structure (deliberate — it reads
by day; an oculus star lamp can be added if he wants a night signal).

## struct-3 — S-2 SHELL TOWER (concept contract + record)

**Concept**: a nautilus you can ascend. One idea: a single logarithmic
ribbon (golden spiral) winding 2.25 turns from a wide base sweep (r3.4) to
a tight crown (r0.6) around a dark columella spine, brass finial eye at
the apex. Silhouette = shrinking spiral; reads "shell" before detail.

- Geometry as ornament: the spiral IS the structure — bone ribbon (76
  tangent segments, one merged node), timber tread caps, dark spine,
  brass tip. No applied trim.
- First consumer of the new housekit `spiralRamp` primitive (reusable
  form family, per loop law — not a one-off).
- Room gates honest: bbox 8.1×8.1 (65.6m² ≥16), height 8.07 ≥2.2 → real
  trimesh. 6 nodes after merge. No motion comps.
- Build: mkv3-shelltower.ts → village_shelltower3.glb, deterministic ×2,
  sha256 c7b641fa9bc9c0e3, true bbox verified via node-transform decode
  (KEEP-node finial initially read as dipping to −0.28 in mesh-local
  space — pitfall #4, transform-applied recheck = clean).
- Siting: 266°/r38 → (−2.65, −0.052, −37.91), gap 3.25m to bunkhouse,
  deliberately N of the 270° road axis, complementing the Observatory
  across the NW quarter. From 216 candidates.
- Placement: nx-struct-shelltower PLACED_VERIFIED at exact tuple,
  idempotent rerun zero verbs.
- **Honest limit — ramp not standable**: MCPL climb legs all arrived
  horizontally but body Y stayed at grade (walked under the ribbon), and
  a physics support probe (drop from 1m above ramp at t=.2/.5/.8) fell
  through to grade at all three points — the same engine trimesh class
  that blocked artwalk-8's stair test. Stairable claim WITHDRAWN. Summit
  access delivered instead via a crown teleport socket (sockets comp,
  pos [0, 7.45, 0]) — the village's proven vertical-access pattern
  (nx-tower study socket). Re-place caught by the gate as deliberate
  comp upgrade (1 verb), rerun idempotent. Socket teleports are a
  Bill-eye-check item: does the crown arrival read as intended?
- Visual PASS not claimed (render approval-blocked again this session;
  source-grounded judgment + decode + probes only).

**Bill should eye-check**: from the plaza, the N approach between hall and
bunkhouse — the shrinking spiral silhouette against the sky; then teleport
to the crown socket and look back at the village.
