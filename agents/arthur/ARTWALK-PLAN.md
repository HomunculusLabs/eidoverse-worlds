# ARTWALK PLAN — the signature-touch loop

**Created:** 2026-08-17 (Bill's mandate: "we're lacking Arthur's signature touch, like the statue in the plaza")
**Retargeted:** 2026-08-30 to `commons-next` (the town build-out made it the main world; old-commons log kept below as heritage record)
**Shape chosen:** HYBRID — Phase H reclaims proven era-1 stars, then Phase F graduates to fresh Arthur commissions.

## CURRENT TARGET (commons-next)

- World: `commons-next`; live surface `https://eidoverse.billding.dev/?world=commons-next`
- Entity ids: `nx-artwalk-*` (spawn via WebSocket verb; never `mx-`)
- Old-commons heritage: `av-artwalk-lissa` still stands in `commons` (read-only reference); the era-1 sources remain the decode reference for Phase H pieces.
- Siting: derive FRESH at first wakeup from the live census.commons-next layout (core r0–30, four districts r66–108, gallery-row precedent at r≈45 from nvp-105..108). Candidate lanes: a spoke between two districts (walkable sequence entry-arch → pedestals → kinetic terminus), or a second gallery row. Ground-layer SAT exemptions apply if pavers are added; suspended-decor law if anything hangs.
**Gap (quantified at loop start):** the radial village carries exactly ONE Arthur signature piece — the Founder's Knot (`av-monument`, SW diagonal). Era-1's entire art layer sits orphaned in `mk*.ts` + `_era1-2/*.glb`, never reborn: lissajous, möbius arch v2 (122-node half-twist), mural pair, golden shell, borromean rings, hypar canopy, observatory, chimes.

## Standing laws (inherited, non-negotiable)

- Load skill `eidoverse-world-building` first at every wakeup.
- Build chain: mk script edit → `bun` rebuild → upload/spawn SAME id → re-apply ALL comps via placer FILES (comp-wipe law).
- Motion anchors must survive `mergeByMaterial` KEEP — either name groups to an existing KEEP token or extend the KEEP regex in the same edit (the knot$ class-law from refine-225).
- Decade the suspect at source before editing any era-1 geometry you believe is wrong.
- Rate limits: uploads ~16–21s apart (429 → retry), verbs 12/4s (placers 380ms+).
- Texture law: pieces join the standing material families (village timber / ashlar / forge iron / soil) with byte-identical tiles where they touch construction; art media (brass, bone) stay flat — brass is its own material.
- Motion taste law (Bill, proven): SLOW and CALM, single-frequency; 9°/s-class spins, no fast or multi-frequency motion.
- Verify ad-hoc (never "suite green"): decode + census + walk-test if enterable; report honestly.
- Bill's 2026-08-30 visual-gate waiver: render review frames, but native image-input
  failure does not block this lane. Proceed through deterministic decode,
  geometry/material, SAT/rim, and live tuple gates; never invent a visual PASS,
  and always name the exact live eye-check Bill should make after the reversible
  first siting.
- Ledger via `python3 agents/arthur/ledger-append.py`, exact `(D+N, E+n)` suffix.
- REPAIR-REGISTER OPEN items belong to the refinement lane unless Bill assigns them here.
- LOOP_COMPLETE only if Bill says stop in his own message.
- Siting: Bill iterates placement verbally through 2–3 positions — propose, place, let him steer; never over-commit to the first site.

## Phase H — heritage reclamation (ordered queue)

Rebirth = re-site for the radial village, re-material into the standing families, KEEP-law motion anchors, verified rollout. Era-1 GLBs in `_era1-2/` are the decode reference for what the piece WAS; the radial village decides what it becomes.

| # | Piece | Era-1 source | Motion | Notes |
|---|-------|--------------|--------|-------|
| H-1 | Lissajous sculpture | `mklissa.ts`, `placelissa.ts` | spin y 9°/s + slow precession | Era-1's "math pieces, as requested" star; full script chain exists |
| H-2 | Golden spiral shell + borromean rings — DONE | `mkmath1.ts` | none (static pedestals) | Pedestal duo live as `nx-artwalk-h2`; Bill eye-check pending |
| H-3 | Hypar canopy — DONE | `mkmath1.ts` | none | Walk-through ruled saddle live as `nx-artwalk-h3`; Bill eye-check pending |
| H-4 | Mural stone pair — DONE | `_era1-2/village_mural_{a,b}.glb` | none | Spiral/wave story stones live as `nx-artwalk-h4`; Bill eye-check pending |
| H-5 | Möbius arch v2 — DONE | `_era1-2/village_mobius2.glb` (122 D) | none | Half-turn entry gate live as `nx-artwalk-h5`; Bill eye-check pending |
| H-6a (tail) | Chimes — DONE | chimes glb / `mkwater1.ts` | whole assembly spin 2°/s | Seven Voices terminus live as `nx-artwalk-h6`; Bill eye-check pending |
| H-6b (tail) | Observatory — DONE | `mkobs1.ts` | scope spin −0.8°/s | Night Table live as `nx-artwalk-h7`; browser stair eye-check pending |

## Phase F — fresh commissions (after H, or interleaved if Bill says)

**BILL DIRECTIVE 2026-08-30: "artwalk is so cool — I would love to see more of
these style of designs built into the buildings."** Phase H standalone pieces
are done; the artwalk language now moves INTO the architecture. New queue
(phase B — built-in art), one intervention per tick, same evidence laws:

1. **B-1 Hall charter wall — DONE**: brass rule-lines + spiral glyph band on
   the council-room wall, live as `nx-artwalk-b1-hall-charter`.
2. **B-2 Inn lintel — DONE**: wave-motif lintel + brass threshold live as
   `nx-artwalk-b2-inn-{lintel,threshold}`.
3. **B-3 Ruled-Sky porch — DONE**: straight-generatrix canopy live over the
   potter's work apron as `nx-artwalk-b3-ruled-porch`.
4. **B-4 Golden-ratio gate — DONE**: nested φ frame, threshold, and spiral
   hinge plates live on `nx-town-gate-n` as three `nx-artwalk-b4-*` riders.
5. **B-5 Belltower three-ring pier — DONE**: Borromean echo live on the
   plaza-facing east pier as `nx-artwalk-b5-belltower-rings`.
6. **B-6 Market Lissajous counters — DONE**: twin 3:2 reliefs live as
   `nx-artwalk-b6-market-lissa-{left,right}`.
7. **B-7 Shrine seven-star panel — DONE**: connected brass/bone constellation
   live as `nx-artwalk-b7-shrine-stars`.
8. **B-8 Livery Harmonic Rein — DONE**: twin single-frequency brass/bone
   reins bridge the stable's open-front lintel as
   `nx-artwalk-b8-stable-harmonic-rein`.
9. **B-9 Dyer's Crossing Loom — DONE**: seven brass warp rules cross seven
   bone weft rules over the dye-house windbreak as
   `nx-artwalk-b9-dyehouse-crossing-loom`.
10. **B-10 Four-Wind Crown — DONE**: a four-axis brass/bone wind rose crowns
    the mill-room door as `nx-artwalk-b10-windmill-four-wind-crown`.
11. Re-derive from live buildings; prefer high-traffic surfaces visitors see
   at door-height. Motifs readable at walking distance, not micro-detail.

Laws for phase B: motifs are carved/inlaid geometry in the standing families
(brass and bone flat, ashlar/timber substrates), never painted noise; each
intervention must be legible at 2m; keep node budgets (extend housekit with
reusable motif primitives rather than one-offs).

Host-rider continuity law: a host re-place may change its pinned lib without
moving the rider. Before adding another intervention, reconcile every evolved
host against the rider's exact local anchor and passage contract; refresh the
host pin only when pose/bbox/attachment geometry remain compatible.

### [artwalk-16] THE MARKET LISSAJOUS COUNTERS (2026-08-30) — DONE, LIVE
The current high-traffic target re-derived to the plaza market: two separate
counter-front riders leave polished `nx-town-market` untouched. Each forged
panel carries the same source law as H-1 — 24 brass/bone marks on
x=sin(3t), y=sin(2t) — scaled to read across a transaction rather than as a
miniature sculpture. Deterministic shared build
`5fcdd1ef922f7794350d710da3f7b745d17c30d69006df7b93a198bda8ffd586`
byte-identical x2; decode 3 nodes / 600 vertices / 1.450 x 0.500 x 0.113m.
Host pinned to `store/dabf662e5fe11f96.glb`; exact local anchors
(−1,0.38,0.44) and (1,0.38,0.44) place both reliefs on the existing counter
fronts. Exact tuples verified; idempotent rerun emitted zero verbs. Market
visitor circulation remained 6/6 PASS, max arrival 0.389m. Native review was
unavailable under Bill's waiver; eye-check from the plaza counter line: both
curves should read as one paired 3:2 rhythm without hiding goods or hems.

### [artwalk-17] THE SHRINE SEVEN-STAR PANEL (2026-08-30) — DONE, LIVE
Night Table vocabulary enters the quiet west shrine as a forged rear-stone
rider: seven connected brass/bone stars, geometry rather than painted symbol.
Deterministic build
`a7ef8541e9561833a553e44a0afef95f2f1d47f9216aefb5b1254e6c2e13b8ed`
byte-identical x2; 3 merged nodes. Host pinned to
`store/78611c7dc9a3cb6e.glb`; exact host-local (−0.95,0.25,−1.16) maps to
(−26.295770450820214,0.25,−3.245626790785106). Exact tuple verified;
idempotent rerun emitted zero verbs. Shrine approach/rear circuit remained
6/6 PASS, max arrival 0.360m. Native review unavailable under Bill's waiver;
eye-check from the altar: the seven-star line should read as a quiet chart on
the rear stone without competing with candles, altar, or bench.

### [artwalk-18] THE LIVERY HARMONIC REIN (2026-08-30) — DONE, LIVE
The stable's source-true open front receives one walking-distance architectural
rhythm: two calm, counter-running single-frequency brass/bone reins across a
forged lintel. The 4.9m-wide intervention is geometry rather than paint and
stays below the roof line while clearing avatar height. Deterministic build
`cba8d0efb0518938c39120d1d3cdf80d9062fd47fab9e73bfd3c2f1f6959b9ea`
byte-identical x2; decode 3 merged nodes / 4.900 x 0.420 x 0.153m. Host truth
was pinned to stable `store/84ba3b1b110282d9.glb`; exact host-local
(0,2.22,−2.16) maps to (45.16,2.22,0), yaw −π/2. The first back-wall trial
at (40.84,1.65,0) left the work hidden in the 0.73m inn seam and was rejected;
the final open-front siting is 2.825m clear of the nearest non-host solid.
Exact tuple verified; idempotent rerun emitted zero verbs. Both stall approach
lanes remained 6/6 PASS, max arrival 0.393m. Native image input failed under
Bill's waiver, so no visual PASS is claimed. Eye-check from the paddock/open
front: the two reins should read as one restrained harmonic lintel, not beads
or signage, and should remain comfortably overhead.

### [artwalk-19] THE DYER'S CROSSING LOOM (2026-08-30) — DONE, LIVE
The craft lane's small dye shelter receives a wall-scale woven field above its
three vats: seven brass warp rules cross seven bone weft rules on a forged
backing, bounded by two quiet measure lines. It is geometry rather than paint,
and the broad crossing remains readable through the open shed rather than
becoming textile micro-detail. Deterministic build
`6c3c85dee69191cf83802dc76fe15150a217e10f20fc5a5b2491aa06a070658e`
byte-identical x2; decode 3 merged nodes / 2.250 x 0.860 x 0.137m. Host truth
was pinned to dyehouse `store/8d750d7826584d9d.glb`; exact host-local
(0,0.48,−0.77) maps to
(−23.62227356310568,0.48,−23.4535147325719), yaw 0.941. Live SAT placed the
nearest non-host solid, the row cottage, 1.527m clear. Exact tuple verified;
idempotent rerun emitted zero verbs. The vat-side approach and lateral craft
lane remained 6/6 PASS, max arrival 0.362m. Review frames were rendered, but
native image input remains unavailable under Bill's waiver; no visual PASS is
claimed. Eye-check from the row-cottage approach: the crossing should read as
one woven architectural field above the vats without hiding the dyed cloth.

### [artwalk-20] THE FOUR-WIND CROWN (2026-08-30) — DONE, LIVE
The west-spoke windmill receives one unmistakable door crown: four alternating
brass/bone rules converge through a central brass ring on a forged field, with
four quiet edge measures. The 2.25m-wide wind rose is architecture-scale rather
than sign-sized detail. Deterministic build
`8e55e366b5a289877ef7386fe04be3bef9e797b94b417a276fe06a94ba3a37d8`
byte-identical x2; decode 3 merged nodes / 2.250 x 0.650 x 0.170m. Host truth
was pinned to windmill `store/4feee38977d7c6e5.glb`; exact host-local
(0,2.22,2.62) maps to (−37.38,2.22,0), yaw π/2. The crown's bottom is 2.22m,
above the 2.20m door opening, and its top is 2.87m inside the room/ceiling
envelope. Live SAT found the nearest non-host solid, `nx-struct-hypar`, 4.615m
clear. Exact tuple verified; idempotent rerun emitted zero verbs. The full
outside→mill-room→outside door route remained 6/6 PASS, max arrival 0.370m.
Review frames were rendered, but native image input remains unavailable under
Bill's waiver; no visual PASS is claimed. Eye-check from the west spoke: the
four axes and center ring should read as one wind crown before the sails take
over above it, without narrowing the door.

Arthur-originated standalone commissions (unchanged, siting by plan):

- **Pendulum wave** — plaza-adjacent; the one calibration every village can read.
- **Waterfront pieces at the fieldpond** (`-42.3,-7.5`) — ripple rings, reed harmonics.
- **Millrace cascade** — near windmill/millyard (`-37,0`); harmonic steps down the race.
- **An orrery reborn** — era-1's `orrery.glb` predates the village; a proper planetary clock.

## Siting principle

The four diagonals carry landmarks (NE belltower, NW market+mapboard, SW monument+waystone, SE watchpost). The art walk claims ONE lane — preferred: the SE spoke beyond the watchpost (r≈30–45) or the S spoke past gate-s — as a walkable sequence: entry arch (H-5) → pedestal stops (H-2/H-3) → kinetic terminus (H-1) at the far end, lamp-lit on the village's forge-iron law. Final siting per-piece, Bill's eye rules.

## Per-wakeup procedure

1. Load skill, read this plan fresh, check REPAIR-REGISTER for lane-assigned OPEN items.
2. Survey the live village (`/geom?world=commons&boxes=0`) + the era-1 source for the queued piece.
3. Build: new/reworked `mkv3-` script → rebuild → upload/spawn `av-artwalk-*` id → comps via placer file.
4. Verify: decode (nodes, KEEP anchors, texture families byte-identical), census, walk-test the lane.
5. Ledger entry + update this plan (mark piece DONE with evidence) + commit batch per cadence.
6. Report concisely: what was reborn, where it stands, what Bill should eye-check.

## Log

### [h-1] THE LISSAJOUS REBORN (2026-08-17) — DONE, LIVE
Era-1's curve reborn on the village's own materials: same curve (x=sin3t,
y=sin2t+π/2, z=sint, R=1.35), same brass, same 9°/s y-spin; two-tier ashlar
pedestal ≡ Founder's Knot stone, pole/collar/ferrule ≡ streetlamp iron, 3 soil
approach pavers; curve + plaque flat (material truth). KEEP class extended
`lissa$` (knot-class law). Build deterministic `66b208d1ce30ab12` ×4; decode
14/14 (both family sources re-verified ≡ live pins before byte-compare);
rollout 4 verbs; live census: `av-artwalk-lissa` (26.9,-26.9) yaw -0.79,
comp `motion:lissa` spin y 9°/s, warm light at 2.5m; standing gate ALL PASS.
Ledger refine-273 (D+9, E+2). SITED: SE diagonal r=38 (r=33 refused by
pre-flight — smithy sign 2.7m). Bill's eye-check pending; he may steer pose.

### [artwalk-3] THE GOLDEN MEASURE (2026-08-30) — DONE, LIVE
Era-1's source-true golden spiral shell and Borromean rings reborn as one
paired stop: flat bone/brass figures over standing ashlar, forge iron, and
soil families, with one warm midpoint light. Deterministic build
`f14d70564a107879977dec03fd46bf83422ecb43fa451d743502d0323bb13cd0`
byte-identical x2; decode 9 meshes / 6,124 vertices / 3.628 x 2.645 x
3.597m. Bill waived native image inspection as a blocking gate; review frames
exist, but no visual PASS is claimed. Reversible first siting:
`nx-artwalk-h2` at (27,-0.03516135170548859,-27), yaw -0.7853981633974483,
SE spoke r≈38; band corners 36.430–40.023m, nearest live solid `nx-court`
8.948m clear. Live tuple + warm light verified; idempotent rerun emitted zero
verbs. Bill eye-check: whether both mathematical figures read immediately as
one paired stop from the court-side approach, and whether he wants position
two or three.

### [artwalk-4] THE RULED SKY (2026-08-30) — DONE, LIVE
Era-1's 18 straight generatrices + four posts decoded at source, then reborn
as a genuinely walk-through hyperbolic-paraboloid shelter: 22 straight
brass/bone rulings over a twisted quadrilateral, four forge-iron posts on
ashlar feet, soil approach pavers, and one warm pendant. The 4.94 x 7.64m
footprint intentionally crosses the room-scale collider threshold so the
open underside uses exact trimesh rather than a solid furniture box.
Deterministic build
`f33e9839b5d9524109f86d70f07ef67d1a6bf1b2c8aa276913ea601d4328f84a`
byte-identical x2; decode 6 meshes / 1,540 vertices / 4.940 x 3.552 x
7.640m. Native review unavailable under Bill's standing waiver; frames exist,
but no visual PASS is claimed. Final reversible siting: `nx-artwalk-h3` at
(32.526911934581186,-0.0313912325769002,-32.526911934581186), yaw
-0.7853981633974483, SE spoke center r=46; corridor corners 40.905–48.533m,
1.764m clear of `nx-artwalk-h2`. The first r=45 siting left only 0.764m and
was corrected within the same wakeup before ledgering. Exact model/light
tuples verified; idempotent rerun emitted zero verbs. Two-way transverse
walk through the canopy passed 4/4 legs, max arrival 0.32m. Bill eye-check:
whether the two ruling families read as one saddle-shaped sky from H-2 and
whether the warm pendant makes the shelter feel inhabited at night.

### [artwalk-5] TWO HISTORIES (2026-08-30) — DONE, LIVE
Era-1 sources decoded as a 14-mark spiral stone (16 meshes, 576 vertices) and
a four-by-eight wave stone (34 meshes, 1,224 vertices), both 1.8 x 2.4 x
0.6m. Reborn as one paired telling: enlarged 18-mark brass spiral and
four-by-nine bone wave field on two ashlar slabs, forge-iron panel frames,
shared crest, soil approach pavers, and warm pendant. The 4.5 x 4.78m
footprint deliberately crosses the room-scale threshold so the paver approach
remains exact-trimesh walkable rather than a solid furniture box.
Deterministic build
`0b29c15ad1b8d04f8e1cb57b7953b6f92895030438c537164f3e9aefcbc71562`
byte-identical x2; decode 7 meshes / 1,876 vertices / 4.500 x 2.800 x
4.780m. Native review unavailable under Bill's waiver; frames exist, but no
visual PASS is claimed. Final side-stop siting: `nx-artwalk-h4` at
(35.70889244992065,-0.041880605288849126,-23.68807716974934), yaw
-2.356194490192345, SE basis r42/t8.5; corridor corners 39.959–45.128m,
1.610m clear of `nx-artwalk-h3`. The t6 trial overlapped H-3 and t8 left a
1.110m pinch; both were rejected before mutation. Exact model/light tuples
verified; idempotent rerun emitted zero verbs. Both mural approaches passed
two-way MCPL walking, 4/4 legs with max arrival 0.312m. Bill eye-check: whether
the spiral and wave languages read distinctly at walking distance and whether
the pair feels like one story stop rather than two unrelated signs.

### [artwalk-6] THE HALF-TURN GATE (2026-08-30) — DONE, LIVE
Era-1 source decoded as a 120-segment brass half-twist over a 5.5 x 2.709 x
0.7m arch envelope, plus two feet (122 meshes, 4,392 vertices). Reborn with
the same 120-segment / exact-180-degree law as a 5.8m-span walk-through brass
ribbon, ashlar feet, forge-iron collars, compact two-sided soil pavers, and
paired warm footlights. The visible 6.52 x 3.46m composition remains honestly
above the room-scale threshold, preserving exact-trimesh passage without
invisible classifier padding. Deterministic build
`3c48f921d262907aeabd8b5f808ab21870665ea9d50db37090fee9a95d1520a8`
byte-identical x2; decode 6 meshes / 3,272 vertices / 6.520 x 3.655 x
3.460m. Native review unavailable under Bill's waiver; frames exist, but no
visual PASS is claimed. The first r30 centered plan overlapped `nx-court` by
1.109m; compacting the overlong approach and shifting to SE basis r31/t-3
resolved the gate without touching prior pieces. Final `nx-artwalk-h5` pose:
(19.79898987322333,-0.015837100520963706,-24.041630560342615), yaw
-0.7853981633974483; corridor corners 29.271–33.323m, 1.730m clear of
`nx-court`. Exact model/two-light tuples verified; idempotent rerun emitted
zero verbs. Two-way passage through the arch passed 4/4 legs with max arrival
0.340m. Bill eye-check: whether the half-twist reads from both approaches and
whether the gate feels like the unmistakable beginning of the art walk.

### [artwalk-7] SEVEN VOICES (2026-08-30) — DONE, LIVE
Era-1 source decoded as a porch-scale seven-tube chime: hook, disc, seven
unequal brass tubes + bone cords, clapper, and sail (18 meshes, 1,092
vertices, 0.266 x 0.750 x 0.280m), turning as one assembly at 2°/s. Reborn
as the kinetic terminus: the same seven-length law enlarged beneath a
freestanding forge-iron yoke on ashlar feet, with soil approach pavers and a
warm center lamp. The named `chime` group carries one calm
`motion:chime` spin at 2°/s; no sound behavior is claimed. Deterministic build
`a61457df1538000628c4efac846e0b973b851124a35af0999abf9637cae0de9b`
byte-identical x2; recursive decode 32 nodes / 31 meshes / 1,191 vertices /
4.320 x 4.065 x 4.800m. Native review unavailable under Bill's waiver;
frames exist, but no visual PASS is claimed. Final `nx-artwalk-h6` pose:
(38.53731957466684,-0.02768908298729972,-38.53731957466684), yaw
-0.7853981633974483, SE terminus r=54.5; corridor corners 50.167–54.962m,
1.650m clear of `nx-artwalk-h3`. Exact model/motion/light tuple verified;
idempotent rerun emitted zero verbs. Approach and transverse passage passed
6/6 MCPL legs with max arrival 0.372m. Bill eye-check: whether all seven tubes
read as distinct hanging voices, whether the 2°/s turn stays calm, and whether
the piece closes the walk decisively rather than reading as porch furniture.

### [artwalk-9] THE NIGHT TABLE (2026-08-30) — DONE, LIVE
Era-1 source decoded as a raised observatory with stair, three-sided rail,
mounted brass telescope, and deterministic seven-star chart (42 meshes).
Reborn with six true support posts, a 4.4m timber deck, seven contiguous
0.28m-rise stair solids, forge-iron rails, ashlar scope pier, flat brass/bone
instrument media, warm stair lamp, and a named `scope` group turning at a
calm −0.8°/s. Deterministic build
`7baac8fd9b45bc923faaae427abec3bc41fd0c7a9fccba381fdff7d405835ca0`
byte-identical x2; decode 45 nodes / 44 meshes / 4.400 x 3.527 x 7.300m.
Native review unavailable under Bill's waiver; frames exist, but no visual
PASS is claimed. Final `nx-artwalk-h7` pose:
(31.819805153394636,-0.037292896876929355,-43.13351365237939), yaw
-0.7853981633974483, SE basis r53/t−8; corridor corners 48.250–56.134m,
3.330m clear of `nx-artwalk-h3`. Exact model/scope-motion/light tuple verified;
idempotent rerun emitted zero verbs. Live server geometry proves 782 triangles,
a certified 19.36m² deck at y=2.10, and seven contiguous stair boxes rising
0.28→1.96m. Horizontal approach/deck-plan routing passed 8/8 legs, max arrival
0.388m. Verification boundary: `WorldAgent.heightAt` is terrain-only and
cannot prove vertical stair ascent; the browser alone evaluates exact-trimesh
stairs. Bill eye-check: climb the seven steps, circulate the deck, and confirm
the slow scope sweep and star table read as an observatory rather than a raised
platform.

### [artwalk-10] THE CHARTER WALL (2026-08-30) — DONE, LIVE
Bill's built-in-art directive begins in the meeting hall without crossing
lane ownership: a separate `nx-artwalk-*` wall-rider leaves
`nx-town-hall` untouched. Two Histories vocabulary is compressed to one
interior-scale intervention — an open forge-iron frame, three brass rule-lines
+ one datum, an 18-mark brass/bone spiral, and four bone oath-bars. The marks
are geometry, not paint or text imitation. Deterministic build
`100eb5e9e89694a9841f0a459d66f7256d52020cfdae241a50c481633d31e420`
byte-identical x2; decode 3 nodes / 3 meshes / 720 vertices / 0.195 x 1.770 x
2.800m. Native review unavailable under Bill's waiver; frames exist, but no
visual PASS is claimed. Host truth was pinned to live hall
`store/44fec27226f02b74.glb`; the relief sits on the W council wall at exact
host-local (−4.28,1.10,0), world
(4.928243671768526,1.1,−27.318787474730843), hall yaw
−0.31322457341772525. Host overlap is explicitly classified as a wall-rider;
nearest non-host solid is 5.730m clear. Exact tuple and host-relative anchor
verified; idempotent rerun emitted zero verbs. Hall flow remained 8/8 PASS,
max arrival 0.360m. Bill eye-check: stand at the council table about 2m away
and confirm the spiral + rule-lines read as one charter surface rather than a
floating sign or micro-detail.

### [artwalk-11] THE WAVE THRESHOLD (2026-08-30) — DONE, LIVE
Two Histories enters the Traveler's Rest as two collider-honest satellites,
leaving `nx-town-inn` untouched: a suspended ashlar lintel with three
nine-mark brass/bone wave rows and forged ends, plus a separate 5.2cm brass
threshold plate with three iron rules. Splitting them prevents one tall
compound furniture box from blocking the doorway. Deterministic builds:
lintel `875942618767052c16b33def214b4d3843a0d57c211dd905d0621ee27e581670`
(4 nodes / 720 vertices / 2.350 x 0.560 x 0.205m), threshold
`cc80fa377494a76c3211ba3495e15094d403d1737de27d323379b4bc91f5d133`
(2 nodes / 96 vertices / 1.660 x 0.052 x 0.360m), each byte-identical x2.
Native review unavailable under Bill's waiver; frames exist, but no visual
PASS is claimed. Host truth was pinned to live inn
`store/9fdf24522f0de63f.glb`. Exact host-local anchors: lintel
(0,2.78,3.03), threshold (0,0.198,2.95); the threshold top is 0.250m,
matching the walkable threshold law. Host contacts are explicitly classified
as suspended wall-rider + thin ground-layer; nearest non-host solid is 2.275m
clear. Both tuples and host-relative transforms verified; idempotent rerun
emitted zero verbs. Inn entry/exit remained 6/6 PASS, max arrival 0.364m.
Bill eye-check: approach from the plaza at 2m and confirm the wave lintel reads
before the brass threshold flashes underfoot, without either feeling pasted on.

### [artwalk-12] THE POTTER'S RULED SKY (2026-08-30) — DONE, LIVE
The Ruled Sky moves into a working building as a separate `nx-artwalk-*`
host-rider, leaving the animated `nx-town-potter` and its wheel comp untouched.
The porch is a compact hyperbolic-paraboloid canopy: two nine-line families of
straight timber generatrices over a twisted quadrilateral, four forge-iron
posts on ashlar feet, and two flat brass crest pins. Its visible 4.55 x 4.15m
footprint is honestly room-scale (18.883m²), so exact trimesh preserves the
open work apron instead of sealing it in a furniture box. Deterministic build
`e1b66075d8e911e7e5c557c48d7e267253c15291d9299d62ce2db9b5a63773fb`
byte-identical x2; decode 4 nodes / 4 meshes / 1,096 vertices / 4.550 x 3.085
x 4.150m. Native review unavailable under Bill's waiver; frames exist, but no
visual PASS is claimed. Host truth was pinned to potter
`store/a4e277782dde8c04.glb`. The first host-local (0.45,0,0.35) candidate
left only 0.396m to the kiln and was rejected before upload; final host-local
(1.55,0,0.35) sits at world
(24.49985871863018,0,41.02400012970429), potter yaw
−2.5834592128922376, with 1.496m kiln clearance. Exact tuple and host-relative
anchor verified; idempotent rerun emitted zero verbs. Potter approach and
cross-apron circulation remained 6/6 PASS, max arrival 0.366m. Bill eye-check:
approach from the open work side and confirm the straight ruling families read
as one saddle-shaped porch while the turning wheel remains the focal craft.

### [artwalk-13] THE GOLDEN MEASURE GATE (2026-08-30) — DONE, LIVE
The north village gate receives a mathematically explicit inner measure without
changing `nx-town-gate-n`: a suspended brass top with bone corner drops, a
separate thin brass baseline, and a forged three-plate hinge stack carrying
three nine-mark brass/bone spirals on the existing east stone post. The visual
opening is width 1.560m x height 2.524133m, ratio exactly
φ=1.618033988749895; the physical clear width between corner drops remains
1.485m, above the 1.4m avatar law. Three collider-honest satellites prevent a
compound box from sealing the passage. Deterministic builds, each
byte-identical x2: top
`98fabb814c668f298887a97229456c2956415ddb934fe3aa4c74509fd45809fc`
(2 nodes / 72 vertices), baseline
`db99bae44aa6ebcc7adf4afa6ccc8119850ad69caf24bf691f5f2a9545d725d8`
(2 nodes / 96 vertices), hinges
`78a457a5bab6874da9cad96da9e0a427e52e0f5039d19d29e4da354c52aa448f`
(3 nodes / 720 vertices). Native review unavailable under Bill's waiver;
frames exist, but no visual PASS is claimed. Host truth was pinned to gate
`store/558489ed8a6477c4.glb`; exact host-local anchors are top
(0,2.524133,0.26), baseline (0,0,0), hinges (1.5,0.7,0.26). Host contacts are
classified as suspended frame, thin ground layer, and existing-post rider;
nearest non-host solid is 4.051m clear. All tuples and relative transforms
verified; idempotent rerun emitted zero verbs. Two-way gate passage remained
6/6 PASS, max arrival 0.390m. Bill eye-check: approach from outside the north
gate at 2m and confirm the nested golden rectangle reads before the spiral
hinge plates, without the frame feeling narrow or decorative-only.

### [artwalk-14] THE BELLTOWER THREE-RING PIER (2026-08-30) — DONE, LIVE
The next built-in target was re-derived from current core traffic rather than
invented from the old queue: the NE belltower is seen from every plaza circuit,
and its door-height east pier had no art language. A separate `nx-artwalk-*`
rider leaves the newly polished `nx-town-belltower` untouched. Three flat
brass/bone relief rings interlock over a forged vertical backing, bounded by
two brass rule marks — a Borromean echo compressed to pier scale rather than a
miniature monument. Deterministic build
`48aed5dabcb16a45632fb2b93f900d74b3a53d659f905d65430f7888b73dbca5`
byte-identical x2; decode 3 nodes / 3 meshes / 528 vertices / 0.645 x 1.420 x
0.140m. Native review unavailable under Bill's waiver; frames exist, but no
visual PASS is claimed. Host truth was pinned to live belltower
`store/30407b959aa14962.glb`; exact host-local anchor (0.75,0.65,0.99) maps to
world (5.269634200735408,0.65,6.330294372515229), tower yaw
−2.356194490192345. Host contact is classified as a plaza-facing existing-pier
rider; the compound `nx-town-streetlamps` bbox is explicitly exempted as the
standing core-layer precedent. Nearest real non-host solid is the mapboard,
1.982m clear. Exact tuple and relative anchor verified; idempotent rerun emitted
zero verbs. Plaza→tower→back passage remained 6/6 PASS, max arrival 0.350m.
Bill eye-check: approach from the plaza at door height and confirm the three
rings read as one interlock on the pier without competing with the bell or the
new warm belfry lamp.

### [artwalk-15] CHARTER WALL HOST-EVOLUTION RECONCILIATION (2026-08-30) — CLOSED
The polish lane evolved `nx-town-hall` from `store/44fec27226f02b74.glb` to
`store/c5964bc886ad1a5c.glb` by adding proud bone frames to both door openings.
Before selecting another built-in target, B-1 was re-grounded against current
live truth. Hall pose, yaw, bbox, west council wall, and the charter's world
tuple are unchanged; exact inverse transform still returns host-local
(−4.28,1.10,0). The charter remains on
`store/100eb5e9e89694a9.glb`; its idempotent placer emitted zero verbs after
the host-pin refresh. Nearest non-host solid is now the Water Stair at 3.245m,
and the full south↔north hall route remains 8/8 PASS, max arrival 0.360m. No
world mutation and no visual PASS are claimed. Durable result: phase-B riders
now explicitly reconcile host evolution before the next intervention.
