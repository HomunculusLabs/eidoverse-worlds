# ARTWALK PLAN — the signature-touch loop

**Created:** 2026-08-17 (Bill's mandate: "we're lacking Arthur's signature touch, like the statue in the plaza")
**Shape chosen:** HYBRID — Phase H reclaims proven era-1 stars, then Phase F graduates to fresh Arthur commissions.
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
- Ledger via `python3 agents/arthur/ledger-append.py`, exact `(D+N, E+n)` suffix.
- REPAIR-REGISTER OPEN items belong to the refinement lane unless Bill assigns them here.
- LOOP_COMPLETE only if Bill says stop in his own message.
- Siting: Bill iterates placement verbally through 2–3 positions — propose, place, let him steer; never over-commit to the first site.

## Phase H — heritage reclamation (ordered queue)

Rebirth = re-site for the radial village, re-material into the standing families, KEEP-law motion anchors, verified rollout. Era-1 GLBs in `_era1-2/` are the decode reference for what the piece WAS; the radial village decides what it becomes.

| # | Piece | Era-1 source | Motion | Notes |
|---|-------|--------------|--------|-------|
| H-1 | Lissajous sculpture | `mklissa.ts`, `placelissa.ts` | spin y 9°/s + slow precession | Era-1's "math pieces, as requested" star; full script chain exists |
| H-2 | Golden spiral shell + borromean rings | `mkmath1.ts` | none (static pedestals) | Pedestal duo for one art-walk stop |
| H-3 | Hypar canopy | `mkmath1.ts` | none | Saddle from straight generatrices; may need UV authoring care |
| H-4 | Mural stone pair | `_era1-2/village_mural_{a,b}.glb` | none | Story stones; decode era-1 glyphs, redraw in village palette |
| H-5 | Möbius arch v2 | `_era1-2/village_mobius2.glb` (122 D) | none | The big one — a gate-class piece for an art-walk entry |
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

_(entries appended per wakeup, TEXTURE-PLAN style)_
