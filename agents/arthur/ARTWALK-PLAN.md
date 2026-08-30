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
| H-6 (tail) | Chimes / observatory | `mkobs1.ts`, chimes glb | slow spin | Only if H-1..H-5 land clean and Bill wants more |

## Phase F — fresh commissions (after H, or interleaved if Bill says)

Arthur-originated, sited by plan. Candidates grounded in proven taste:

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
