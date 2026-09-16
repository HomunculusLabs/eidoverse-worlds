# FAUNA PLAN — living animals for commons-next (fauna-N lane)

Mandate (Bill, 2026-09-16): "improving the animals, they're not very good."
Every standing animal up from prop to creature: readable silhouettes,
articulated idle life, honest species character. New fauna from the
homestead language (goats/ducks/bunnies first). Loop law: FAUNA-LOOP.md.
One species per wakeup, worst-first. Bill alone may end this loop.

## Standing-animal census (2026-09-16, fauna-1) + baseline verdicts

| entity | id | tuple | lib (sha16) | baseline verdict |
|---|---|---|---|---|
| goat pen | `nx-dress-goats` | (34,0,13) yaw -1.2 | c47861e4 → **7e9af5a5** (fauna-1) | WORST — box-goats, floating heads, ZERO comps (motion lost to a re-place comp-wipe; tex-41's pin checks lib only), build bug: N/S post rows spacing R marched to x=9.6 (bbox 14.21m) → **FIXED fauna-1** |
| hen | `nx-dress-hens` | (33.5,0,-6) yaw -1.8 | edc1a4c7 (`village_hen_a.glb`) | WORST-NEXT — ONE 0.4m hen micro-entity standing alone by the coop (the flock's b/c siblings were never spawned here); 7-seg cylinders, ZERO comps, frozen |
| fox den | `nx-dress-se-foxden-001` | (73,-0.05,-10.5) yaw 4.712 | 856deec5 | static dressing (v17, dress-107 PLACED_VERIFIED) — no animal present; candidate: a fox presence at the den mouth (new species row below) |
| rabbit hutch | `nx-dress-hutch` | (38.5,0,-9.5) yaw -1.9 | f5f47791 | static hutch, ZERO comps; rabbits live in old-commons pins only — candidate: hutch rabbits |

Cross-world note: `verify-repairs.ts` pins `av-goats`/`av-hutch` in
old commons (world=commons) — that gate stays untouched; this lane's
domain is commons-next `nx-dress-*` fauna only.

## Species queue (worst-first)

1. **[OPEN] nx-dress-hens — the hen flock.** Rebuild hen micro-model with
   the goats' anchor discipline (hen_a/body articulation: peck-bob head,
   tail flick), spawn the missing b/c individuals around the coop run
   (coop at (37.5,-6.5) yaw -1.8, run to its S/W), staggered phases.
   Check coop+rider interactions before any coop-adjacent spawn.
2. **[CANDIDATE] pond ducks — new species.** Village water: fieldpond
   (av-fieldpond), reedpool. A mallard pair (drake + duck) as floating
   geometry on the water plane (water-is-geometry law), bob + slow orbit
   comps, drake green-head read at 18m. Homestead language: Bill keeps
   ducks. Siting follows the seat-scan law (skill reference).
3. **[CANDIDATE] hutch rabbits.** Rebuild the hutch model with 1-2 rabbit
   anchors (ear-flick + nose-bob micro-motion), same pen language as the
   goat yard.
4. **[CANDIDATE] fox at the den.** A fox presence at the SE den mouth
   (curled or peeking — small, low); motion: breathing bob only.

## Per-species rebuild records

### goats — fauna-1 (2026-09-16) CLOSED
- **v4 sha16 7e9af5a5** (full: 7e9af5a59d4b77adb0eceffcb7b13c22072d8140c7803f6d178ef04b4451df52), PLACED_VERIFIED same tuple (34,0,13) yaw -1.2 scale 1, census 344→344, idempotent rerun 0 verbs, walk probe ALL_PASS 3/3 (gate 18m approach), live bbox 6.5×1.31×6.5 (was 14.21×1.28×6.5).
- Build: pen bugs fixed (post rows R/2 spacing; gate = two symmetric rails), goats rebuilt with necks (heads no longer float), drop ears, thickened pale-bone horns (0xd8cf9e), billy beard, tail stubs, three coats (cream/dark-cream/tan); hay = tall timber MANGER with pale rim plank, hay wisps on the rim only + droop + spill (no floating slab); trough gains the shared rim + palette water 0x506a78.
- Motion: 6 comps live — head-nod pendulums (amp .16/.075/.11, periods 4.6/5.8/3.9s) + tail-swish (amp .45/.5/.4, periods 1.9/1.7/2.1s), phases staggered per individual, explicit epoch t0. Judge arc: v1 FAIL (floating hay), v2 FAIL (half-supported), v3 FAIL (screen-line coincidence), **v4 PASS** — motion-pair pixel diff 618px clustered in the goat band only (rig drives REAL motioneval.js closed forms).
- Anchors: goat_{a,b,c} + _head + _tail (9; KEEP regex already matched goat_).
- Judge identity: **ZAI fallback (glm vision) — cron lane has no native vision; native 18m re-judge DEBT recorded below.**

## Native re-judge debt (payable only in an interactive judge-capable session)

| row | owed since | subject |
|---|---|---|
| NATIVE-1 | fauna-1 (2026-09-16) | goats v4 7e9af5a5 18m gameplay + closeface frames (`reviews/fauna1-goats/new-{gameplay,closeface}.png`) — fallback PASS stands until natively confirmed |

## Rig law (learned fauna-1, hard way)

Review renders MUST render at module scope (async loadAsync + prep at top
level, evaluate only calls sync setters). Renders driven from
page.evaluate after an await boundary produce BLANK canvases (background
color only, renderer.info still counts triangles) with zero errors —
the chassis is `fauna1-render-goats.ts`; `fauna1-probe-render.ts` is the
falsification record. Always pixel-count unique colors before judging.
