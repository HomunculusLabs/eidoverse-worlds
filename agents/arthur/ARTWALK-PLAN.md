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
11. **B-11 Heartwood Measure — DONE**: five concentric brass/bone growth rings
    fill the woodyard windbreak as `nx-artwalk-b11-woodyard-heartwood-measure`.
12. **B-12 Kiln Heat Contours — DONE**: three nested brass/bone burn rings
    radiate around the fire mouth as `nx-artwalk-b12-kiln-heat-contours`.
13. **B-13 South Gate Twin Tides — DONE**: paired seven-mark brass/bone
    cadences ride the outer gateposts as `nx-artwalk-b13-south-tide-{west,east}`.
14. **B-14 East Gate Dawn Fan — DONE**: seven alternating brass/bone rays
    spread above the outer lintel as `nx-artwalk-b14-east-gate-dawn-fan`.
15. **B-15 West Gate Dusk Arcs — DONE**: three nested brass/bone parabolic
    arcs settle over the outer lintel as `nx-artwalk-b15-west-gate-dusk-arcs`.
16. **B-16 Forge Seven Strikes — DONE**: seven widening brass/bone strike
    marks rise above the fire mouth as `nx-artwalk-b16-forge-seven-strikes`.
17. **B-17 Garden Seed Lattice — DONE**: nine connected brass/bone seed marks
    crown the cottage door as `nx-artwalk-b17-garden-seed-lattice`.
18. **B-18 Weaver Warp Count — DONE**: nine alternating warp rules and one
    brass weft crown the row-cottage door as `nx-artwalk-b18-row-warp-count`.
19. **B-19 Longhouse Feast Count — DONE**: twelve alternating place marks rise
    from one brass table line as `nx-artwalk-b19-longhouse-feast-count`.
20. **B-20 Bunkhouse Four Rooms — DONE**: four alternating brass/bone rooms
    line the entry-side wall as `nx-artwalk-b20-bunkhouse-four-rooms`.
21. **B-21 Tower Ascension Count — DONE**: nine widening brass/bone rungs rise
    above the drum-tower door as `nx-artwalk-b21-tower-ascension-count`.
22. **B-22 Mapboard Eight Ways — DONE**: the mapboard's bare plaza-facing back
    carries a compass card — brass datum, bone measure ring, eight brass/bone
    rays (long = the four gates, short = the four spokes), brass center pin —
    live as `nx-artwalk-b22-mapboard-eight-ways` at host-local (0,0,−0.03)
    hugging the slab's back plane (the rider bakes the board's 12° tilt).
    First anchor (0,0,−0.14) was rejected live (rider sat map-side facing
    into the board — host +Z faces the plaza) and reseated via remove-verb.
    Bill eye-check pending from the plaza.
23. **B-23 Cistern Rain Count — DONE**: the bakery cistern's plaza-facing
    slab carries a water memory — brass gauge datum + seven alternating
    brass/bone level ticks widening upward — live as
    `nx-artwalk-b23-cistern-rain-count` at host-local (0,0.31,0.33).
    The SAT gate's nx-court block was decoded at source: the court's 13m
    compound bbox envelops the cistern (standing in the open yard between
    the sheds); exempted under the refine-214/R-105 DESIGNED classification.
    Bill eye-check pending from the court yard.
24. **B-24 Well's Depth — DONE**: the plaza hearth's own well drum (highest
    traffic in the village, zero riders before) carries the answer to B-23
    on its clear north face — brass sounding-line datum + nine alternating
    brass/bone depth marks NARROWING downward — live as
    `nx-artwalk-b24-well-depth` at host-local (3.4,0.375,0.70).
    Bill eye-check pending from the north plaza approach.
25. **B-25 Village Mark — DONE**: the welcome board's bare back face
    (decoded at source: front +Z carries COMMONS; back was empty) carries
    the village's seal — brass hearth-dot, bone gathering-ring, eight
    brass paver ticks — live as `nx-artwalk-b25-welcome-village-mark` at
    host-local (0,1.35,−0.053). The monument SAT block was decoded as a
    bbox-corner kiss (nearest source-true solid ~0.5m away) and exempted
    with a gap-bounded exact-match condition, not a blanket id skip.
    Bill eye-check pending from the SW gate path.
26. **B-26 Way-Band — DONE**: the north approach lamp's bare post shaft
    carries a survey band — forged wrap, brass datum, eight alternating
    brass/bone ticks — live as `nx-artwalk-b26-wayband` at host-local
    (0,1.5,0), concentric with the host post. The Eight Ways echoed at
    the rim, on the same N axis as the mapboard.
    Bill eye-check pending from the north gate road.
27. **B-27 Waterline — DONE**: the field well on the working edge
    (30,−4.5) carries two encircling rings — bone low (dry-year line),
    brass high (wet-year line), embedded in the drum's taper — live as
    `nx-artwalk-b27-waterline` at host-local (0,0,0), concentric.
    The plaza well measures depth; this one remembers seasons.
    Bill eye-check pending from the stable track.
28. **B-28 Bake Count — DONE**: the bakery shed's front counter (source
    mkv3-ring.ts, court-local (−3.0, top 0.82, −1.68)) carries a brass
    datum + seven alternating brass/bone batch marks — a week of bakes —
    live as `nx-artwalk-b28-bake-count` at court-local (−3.0,0,−1.955).
    Host re-pinned after interior-12's court evolution (59534b10…).
    Bill eye-check pending from the court yard.
29. **B-29 Strike Count — DONE**: the workshop shed's front bench
    (court-local (3.2, top 1.06, −1.60)) carries a brass datum + seven
    strike marks (alternating brass/bone AND widths — no two strikes
    alike) — live as `nx-artwalk-b29-strike-count` at court-local
    (3.2,0,−1.875). Sibling to B-28 across the same yard: bread and
    iron, one counting language.
    Bill eye-check pending from the court yard (read B-28 and B-29
    together, facing each other).
30. **B-30 Market Tally — DONE** (interrupted window closed at
    artwalk-41): the cloth stall's counter front carries a brass datum +
    five alternating brass/bone coin marks — the day's takings — live as
    `nx-artwalk-b30-market-tally` at market-local (1.0,0.62,0.408).
    Fives for coin where the court counts sevens; host re-pinned to the
    post-tex-8/interior-14 market (8c16ea9a…).
    Bill eye-check pending from the plaza market, beside the shutters.
31. **B-31 Sheaf Tally — DONE**: the harvest cart's outer rail carries a
    brass datum + five alternating brass/bone marks — the count EQUAL to
    the five sheaves on the bed (decoded at source) — live as
    `nx-artwalk-b31-sheaf-tally` at host-local (0.45,0.62,0.505),
    world (12,0,36) yaw −2.6. The cart counts what it carries.
    Bill eye-check pending from the harvest track.
32. **B-32 Morning Measure — DONE** (build tick interrupted pre-place at
    #12; placed clean at artwalk-43): the milk churn's hoop-free band
    carries a brass datum + three alternating brass/bone marks — one per
    goat, count verified at source (three goats: browse/alert/graze) —
    live as `nx-artwalk-b32-morning-measure` at host-local (0,0,0),
    concentric, world (20,0,35) yaw −2.2. The dairy counts threes.
    Bill eye-check pending from the harvest track by the inn porch.
33. **B-33 Milking Order — DONE**: the milking stand's milker-side
    platform face carries a brass datum + three marks (the goats in turn
    order) — live as `nx-artwalk-b33-milking-order` at host-local
    (0,0.30,−0.276), world (22.5,0,33) yaw −2.4. The dairy chain
    (goat → pail → churn → kitchen, per source) now counts threes end
    to end; the stand and the churn (B-32) answer each other across the
    yard.
    Bill eye-check pending from the goat-corner track.
34. **B-34 Four Ways-Bands — DONE**: B-26's band (same bytes, store lib)
    completes the set at E/S/W approach lamps — live as
    `nx-artwalk-b34-wayband-{e,s,w}`, concentric. One village diagram
    (B-22's Eight Ways) echoed at all four rim points.
    Bill eye-check pending from any gate road.
35. **Eye-gate packet DELIVERED (artwalk-46)**: all 15 counting-series
    riders re-verified live-exact; guided circuit + judgments at
    `reviews/artwalk-counting-series-eye-gate.md`. Remaining bare
    candidates (stablebench, giftshelf) are below threshold / carry
    polish's NO-DEFECT verdict — **the series is closed and this lane
    HOLDS for Bill's verdicts or a queue widening** (stop-recommendation:
    `/loop stop` or re-issue when new work is commissioned).
36. Re-derive from live buildings; prefer high-traffic surfaces visitors see
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

### [artwalk-21] THE HEARTWOOD MEASURE (2026-08-30) — DONE, LIVE
The open woodyard receives one source-grounded field above its cordwood: five
slightly offset concentric brass/bone rings read as a cut trunk's years, held
to a forged backing by one datum and four quiet measure marks. The 2.6m-wide
relief is deliberately broad enough to survive the shed approach rather than
becoming decorative grain. Deterministic build
`aa5f2550365c1f7f1abe7046f629cd4086b86f560b52276ff447dc5f0c5431c6`
byte-identical x2; decode 3 merged nodes / 2.600 x 1.066 x 0.148m. Host truth
was pinned to woodyard `store/1f2c6f592095b204.glb`; exact host-local
(0,0.75,−0.80) maps to
(16.3635762733503,0.75,31.712609495766586), yaw −2.669815142409043. Live SAT
found the nearest non-host solid, the harvest cart, 2.650m clear. Exact tuple
verified; idempotent rerun emitted zero verbs. The cordwood-side approach and
lateral yard lane remained 6/6 PASS, max arrival 0.343m. Review frames were
rendered, but native image input remains unavailable under Bill's waiver; no
visual PASS is claimed. Eye-check from the open yard: the five rings should
read immediately as one heartwood measure above the stacked logs, not a sign.

### [artwalk-22] THE KILN HEAT CONTOURS (2026-08-30) — DONE, LIVE
The lime kiln's source-true continuous burn receives a direct architectural
measure: three nested brass/bone relief rings radiate around the fire mouth,
held by four forged mounts and one low datum. The 1.55m-wide contour field
keeps the live flame visible while making the heat legible from the track.
Deterministic build
`1ad2a6139373b973057e0cb0b2c26c9e4b24b7ee83d79ab8f15bfe27bc1e19a0`
byte-identical x2; decode 3 merged nodes / 1.550 x 1.588 x 0.125m. Host truth
was pinned to kiln `store/69c0e48a917d4ed2.glb`; exact host-local
(0,0,1.15) maps to (30.292104422821314,0,38.093697703958085), yaw
−2.4784945651581642. Live SAT found the nearest non-host solid, the charcoal
dressing, 2.391m clear. Exact tuple verified; idempotent rerun emitted zero
verbs. The fire-mouth approach and lateral track remained 6/6 PASS, max
arrival 0.353m. Review frames were rendered, but native image input remains
unavailable under Bill's waiver; no visual PASS is claimed. Eye-check from the
track: the three rings should read as heat contours around the live mouth,
without masking the flame or appearing detached from the tapered drum.

### [artwalk-23] THE SOUTH GATE TWIN TIDES (2026-08-30) — DONE, LIVE
The southern threshold now answers the north gate without copying it: one
seven-mark brass/bone cadence rides each outer post, the paired vertical fields
forming a slow tide rhythm before the hanging village sign. Each panel stays
inside the post width and leaves the opening untouched. Deterministic shared
build `8a6b49f61bcf138e71b9cb281234a406b5626a676bf4449b88714c0e37de3d3a`
byte-identical x2; decode 3 merged nodes / 0.400 x 1.620 x 0.110m. Host truth
was pinned to south gate `store/558489ed8a6477c4.glb`; exact outer-face
host-local anchors (−1.5,0.5,−0.18) and (1.5,0.5,−0.18) map to
(1.5,0.5,19.68) and (−1.5,0.5,19.68), with rider yaw 0 facing the outside
road. Live SAT found the nearest non-host solid, the longhouse, 3.887m clear.
Both tuples verified; idempotent rerun emitted zero verbs. The complete
outside→plaza→outside gate route remained 6/6 PASS, max arrival 0.340m.
Review frames were rendered, but native image input remains unavailable under
Bill's waiver; no visual PASS is claimed. Eye-check from the south road: the
two seven-mark tides should read as one paired threshold rhythm without
competing with the hanging sign or narrowing the passage.

### [artwalk-24] THE EAST GATE DAWN FAN (2026-08-30) — DONE, LIVE
The east threshold receives a low sunrise field on the outer lintel: seven
alternating brass/bone rays open from one brass horizon over a forged backing.
The 2.3m span stays above the hanging sign and entirely inside the gate's top
envelope, making the road-facing crown readable without adding anything to the
passage. Deterministic build
`c67c0402bbfb7fd8d2fb47a3904017139762b15b6f6a2f27295098f52b5c91d4`
byte-identical x2; decode 3 merged nodes / 2.300 x 0.367 x 0.115m. Host truth
was pinned to east gate `store/558489ed8a6477c4.glb`; exact outer-face
host-local (0,2.72,0.2325) maps to (19.7325,2.72,0), yaw π/2. The relief spans
y 2.72–3.087 inside the gate's 3.09m top. Live SAT found the nearest non-host
solid, `nx-forge`, 5.396m clear. Exact tuple verified; idempotent rerun emitted
zero verbs. The complete outside→plaza→outside gate route remained 6/6 PASS,
max arrival 0.340m. Review frames were rendered, but native image input remains
unavailable under Bill's waiver; no visual PASS is claimed. Eye-check from the
east road: the seven rays should read as one dawn fan above the hanging sign,
not as trim, and the threshold should remain visually open.

### [artwalk-25] THE WEST GATE DUSK ARCS (2026-08-30) — DONE, LIVE
The west threshold answers dawn with a distinct settling gesture: three nested
brass/bone parabolic arcs descend toward one brass horizon over a forged field.
The 2.3m span remains above the hanging sign and wholly inside the lintel's top
envelope, so the gateway acquires an evening crown without touching passage.
Deterministic build
`f1efad77be904a59f466ab7d07d04a2825bfad5e85e08d2c674a905e6ea3826c`
byte-identical x2; decode 3 merged nodes / 2.300 x 0.360 x 0.127m. Host truth
was pinned to west gate `store/558489ed8a6477c4.glb`; exact outer-face
host-local (0,2.72,0.2325) maps to (−19.7325,2.72,0), yaw −π/2. The relief
spans y 2.72–3.080 inside the gate's 3.09m top. Live SAT found the nearest
non-host solid, `nx-struct-hypar`, 2.683m clear. Exact tuple verified;
idempotent rerun emitted zero verbs. The complete outside→plaza→outside gate
route remained 6/6 PASS, max arrival 0.340m. Review frames were rendered, but
native image input remains unavailable under Bill's waiver; no visual PASS is
claimed. Eye-check from the west road: the three arcs should read as one dusk
field above the sign and as a true counterpart—not a copy—of the east dawn fan.

### [artwalk-26] THE FORGE SEVEN STRIKES (2026-08-30) — DONE, LIVE
The court annex's working hearth receives a cadence drawn from its own hammer:
seven alternating brass/bone strike marks widen upward from one brass datum on
a forged field above the glowing fire mouth. The compact 0.74m relief stays
inside the hood/flue envelope and leaves the flame, anvil, and work apron clear.
Deterministic build
`54555b39274bc00c54b6e5d649a15db0e643434048ccd38f0e1fffe87c2fdddc`
byte-identical x2; decode 3 merged nodes / 0.740 x 0.860 x 0.120m. Host truth
was pinned to forge `store/2c902a90ed90145e.glb`; exact host-local
(0,1.02,0.39) maps to
(21.81053323270505,1.02,−7.717457073810321), yaw −0.90756. The nearest
non-host solid is the deliberately abutting court at 0.503m; the complete
fire-mouth approach and lateral work-apron route remained 6/6 PASS, max arrival
0.346m. Exact tuple verified; idempotent rerun emitted zero verbs. Review frames
were rendered, but native image input remains unavailable under Bill's waiver;
no visual PASS is claimed. Eye-check from the work apron: the seven marks should
read as one rising hammer cadence above the live coals without hiding the hood
or feeling like a small sign.

### [artwalk-27] THE GARDEN SEED LATTICE (2026-08-30) — DONE, LIVE
The gardener's evolved cottage receives an exterior echo of its interior seed
shelf: nine brass/bone seed marks connect into one branching lattice on a
forged field above the centered door. The 1.5m span stays within the stone wall
and below its 2.58m top, leaving the garden approach and doorway untouched.
Deterministic build
`241db6453224af9fa459eb7749c7c9fa1aee550becab737e8da8995276331315`
byte-identical x2; decode 3 merged nodes / 1.500 x 0.460 x 0.136m. Host truth
was reconciled to the interior-6 garden build
`store/872aec35e3aa43b3.glb`, byte-identical to its durable local GLB; exact
host-local (0,2.08,1.8325) maps to
(−24.51890662066154,2.0809494488404763,17.920917680767694), yaw
2.2004415094410525. The nearest 2D non-host footprint is the carousel at
1.061m, but the lattice is a wall rider above the door; the full
outside→room→outside route remained 6/6 PASS, max arrival 0.370m. Exact tuple
verified; idempotent rerun emitted zero verbs. Review frames were rendered,
but native image input remains unavailable under Bill's waiver; no visual PASS
is claimed. Eye-check from the garden track: the nine marks should read as one
seed lattice crowning the door, not a sign or miniature map.

### [artwalk-28] THE WEAVER WARP COUNT (2026-08-30) — DONE, LIVE
The weaver's evolved row cottage receives an exterior measure of its interior
loom: nine alternating brass/bone warp rules rise through one brass weft trace
on a forged field above the centered door. The 1.62m span remains inside the
front wall and below its 2.8m top, leaving the door and dyehouse approach open.
Deterministic build
`d6d10de199f6fb031bd425e6aa918257a443dd4144c93161c5cacdbd992cf75b`
byte-identical x2; decode 3 merged nodes / 1.620 x 0.490 x 0.117m. Host truth
was reconciled to the interior-8 row-cottage build
`store/bd88cd386aec2a89.glb`, byte-identical to its durable `village_row3.glb`;
exact host-local (0,2.22,2.2825) maps to
(−21.155200197358777,2.22,−15.655931572361396), yaw 0.9411511441487406.
Live SAT found the nearest non-host solid, the dyehouse, 4.638m clear. Exact
tuple verified; idempotent rerun emitted zero verbs. The full
outside→room→outside route remained 6/6 PASS, max arrival 0.365m. Review frames
were rendered, but native image input remains unavailable under Bill's waiver;
no visual PASS is claimed. Eye-check from the weaver track: the nine warp rules
and single crossing trace should read as one woven door crown, not fence bars.

### [artwalk-29] THE LONGHOUSE FEAST COUNT (2026-08-30) — DONE, LIVE
The communal hall receives a front-porch measure drawn from its own use: twelve
alternating brass/bone place marks rise from one brass table line across a
forged fascia at the porch roof edge. The 3.2m span reads at gathering distance
while remaining above avatar height and clear of the center door lane.
Deterministic build
`98a4c17e73e4bac4d3334be1488231b74a3a475e839e3c2f0e2b7ea43e5bc536`
byte-identical x2; decode 3 merged nodes / 3.200 x 0.320 x 0.120m. Host truth
was reconciled to the interior-3 longhouse build
`store/6ffc4fdc75ea2a0e.glb`, byte-identical to its durable
`village_longhouse3.glb`; exact host-local (0,2.22,4.32) maps to
(7.668887408682888,2.22,21.89018987430842), yaw −2.828368080172068. Live
SAT found the nearest non-host solid, `nx-tower`, 3.111m clear. Exact tuple
verified; idempotent rerun emitted zero verbs. The complete
outside→porch→room→outside route remained 6/6 PASS, max arrival 0.370m. Review
frames were rendered, but native image input remains unavailable under Bill's
waiver; no visual PASS is claimed. Eye-check from the gathering path: the
twelve marks should read as one feast count across the porch, not railings.

### [artwalk-30] THE BUNKHOUSE FOUR ROOMS (2026-08-30) — DONE, LIVE
The guest bunkhouse receives an exterior echo of its four furnished bunks and
serial cubbies: four alternating brass/bone open rooms sit over one brass
threshold on a forged field beside the centered entry. The first overhead
siting was rejected before ledgering because its 2.12m bottom would have
violated the 2.2m avatar-clearance law; the same exact bytes were moved to the
west door-side wall, local x −3.11..−1.29, leaving the centered door lane
x −0.65..0.65 fully clear. Deterministic build
`152684b8dd6ba53537d4abfbbe144c435023df30722ae9662fdfdfe1a65082c7`
byte-identical x2; decode 3 merged nodes / 1.820 x 0.460 x 0.120m. Host truth
was reconciled to the interior-9 bunkhouse build
`store/49f5acc4d91c4d45.glb`, byte-identical to its durable
`village_bunkhouse.glb`; final host-local (−2.2,1.05,2.0325) maps to
(−10.466688873766076,1.05,−23.388510004313474), yaw 0.31322457341772525.
Live SAT found the nearest non-host solid, north gate, 7.774m clear. Final exact
tuple verified; idempotent rerun emitted zero verbs. The full
outside→room→outside route remained 6/6 PASS, max arrival 0.365m. Review frames
were rendered, but native image input remains unavailable under Bill's waiver;
no visual PASS is claimed. Eye-check from the north approach: the four open
rooms should read as one guest-house rhythm beside—not above—the door.

### [artwalk-31] THE TOWER ASCENSION COUNT (2026-08-30) — DONE, LIVE
The keeper's drum tower receives a door crown drawn from its own vertical life:
nine alternating brass/bone rungs widen upward around one brass spine on a
forged field. The 1.62m relief begins at y 2.22, just above the committed
2.20m door opening, and keeps the round entry and upper-room route untouched.
Deterministic build
`ba8f63884184b13ea76349bd6041af5e60acb9f9186c3591330f5198aecaffb3`
byte-identical x2; decode 3 merged nodes / 1.620 x 0.460 x 0.120m. Live host
truth was pinned to tower house `store/bd1badd218fdbebd.glb`; exact host-local
(0,2.22,2.8225) maps to
(−8.130308960881354,2.22,23.314828916721183), yaw 2.828368080172068. Live
SAT found the nearest non-host solid, south gate, 5.533m clear. Exact tuple
verified; idempotent rerun emitted zero verbs. The full
outside→tower-room→outside route remained 6/6 PASS, max arrival 0.370m. Review
frames were rendered, but native image input remains unavailable under Bill's
waiver; no visual PASS is claimed. Eye-check from the tower approach: the nine
rungs should read as one ascension count over the doorway, not a literal ladder.

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

### [artwalk-49] INTERRUPTED-WINDOW RECOVERY + FLEET RECONCILIATION (2026-09-06) — CLOSED
The interrupted artwalk-49 window (struct-9 class: b7 micro-reseat executed live,
ledger/plan/commit missing) is closed, and the whole rider fleet re-verified against
CURRENT hosts. Findings and actions:
- b7 shrine-stars: reseat ALREADY_EXACT vs current host 53709062 (dy 0.0,
  zero-verb idempotent rerun) — the interrupted window's mutation stands as
  the intended contract; no re-place.
- 17 placer HOST_LIB re-pins (inn 6e6ff2d0, windmill 09938360, kiln 4d8ef8fc,
  market 8c16ea9a, stable 5beff62e, dyehouse 888be359, potter dad7c82e,
  tower-house 11b31000, longhouse f2344409, shrine 53709062, gate-s hl
  d1b90d6f) verified against live census — all match current host libs.
- 34/34 B-series placers now PLACED_VERIFIED, zero verbs: five had the
  struct-36 idempotency-check-order bug (SAT ran before the already-live
  check, so later-placed fat-bbox approach lanes and waysigns vetoed
  standing verified riders). Short-circuit added to b9/b11/b12/b32/b33.
- ONE REAL DEFECT FIXED LIVE: b26 way-band kept absolute yaw pi after
  polish-280 rotated its approach-lamp host to -pi/2 — a 90° misalignment
  of the band's brass datum vs the host crossarm. Reseated remove+spawn at
  the exact host-derived tuple (0,1.5,10) yaw -1.5707963267948966, lib
  7594436a unchanged, comp {} both sides, RESEATED_VERIFIED + zero-verb
  idempotent rerun. The e/s/w b34 siblings (placed after the rotation)
  were already correct — only b26 needed the artwalk-39 law applied.
- Band-level audit of seven evolved hosts: b2 inn gable lip y-min 3.04
  unchanged (predates, benign); b3 potter ramp extended at -x away from
  porch posts (benign); TWO interior-rider co-habitations routed to
  INTERIOR-PLAN (b9 loom vs interior-17 dyer tally board; b10 crown vs
  interior-20 grist ledger east edge) — interior-lane riders, artwalk
  reports, does not touch (interlane entity-domain law).
- New scripts (durable, lane-owned): artwalk49-b7-reseat.ts,
  artwalk49-b26-reseat.ts, artwalk49-recovery-audit.ts,
  artwalk49-band-identify.ts (+ the interrupted window's band/mount
  decode tools). Gate ALL PASS real exit 0 pre-mutation; census 259
  steady; zero uploads (store already held all libs); 2 verbs total
  (b26 remove+spawn).

### [artwalk-62] PIPELINE-MODE HOLD TICK (2026-09-06) — CLOSED (hold, zero mutations)
Fleet-tick wakeup (pipeline mode, eight sibling lanes), full house discipline.
Gate ALL PASS real exit 0 at HEAD 3ad7363 (night-30 sibling) pre-work. Fresh
reads: ARTWALK-PLAN + INTERLANE-PROTOCOL (md5 steady); ledger tail re-checked
immediately before append (max artwalk-61 → this tag). SHARD EXECUTION
verified at source: zero OPEN IMPROVE-PLAN rows route to nx-artwalk-* (the
54-rider host-anchor row was EXECUTED at artwalk-52; open split routes to
struct/dress/approach/improve-own domains). Eye-gate packet 48bea194
unchanged, zero Bill verdict markers; Phase H 7/7 + B-1..B-34 DONE; no Phase
F commission. Cheap lawful hold verification (two independent checks):
(1) `artwalk52-fleet-anchor-reconcile.ts` fresh run → ALL_RECONCILED exit 0 —
census 259 / 54 riders / 38 lights / 34 placers / 32 host pins exact / 24
inverse-transformed anchors exact, zero verbs, zero uploads; (2) fresh census
capture /tmp/artwalk-census-62.json diffed vs the artwalk-61 capture by
entity-id set: 259/259, 0 new, 0 gone, 0 rider drift — the fleet absorbed
struct-40's hypar reseat (750f82ee) and waysign-15's bakery reseat
(49342c52) with zero rider drift. Zero world mutations, zero shared-budget
use, no visual PASS claimed. Lane HOLDS on the three unblock paths: Bill's
counting-series eye-gate verdicts (reviews/artwalk-counting-series-eye-gate.md),
a Phase F fresh commission, or a queue widening.

### [artwalk-61] PIPELINE-MODE HOLD TICK (2026-09-06) — CLOSED (hold, zero mutations)
Fleet-tick wakeup, full house discipline. Gate ALL PASS real exit 0 at HEAD
08da3ac (waysign-15 sibling) pre-work. Fresh reads: ARTWALK-PLAN (H 7/7 +
B-1..B-34 all DONE, counting series closed at artwalk-46), INTERLANE-PROTOCOL
(f6254cd0 steady), IMPROVE-PLAN shard routing verified at source — zero OPEN
rows route to nx-artwalk-* (routing row 25 EXECUTED at artwalk-52; worktree
diff greps zero artwalk rows). Eye-gate packet md5 48bea194 unchanged, zero
Bill verdict markers. Register 0 artwalk OPEN. Ledger max artwalk-60 → this
tag. Fresh census 259 / 54 riders, 0 new / 0 gone vs census-29. Cheap lawful
hold verification: artwalk52-fleet-anchor-reconcile.ts fresh live run
ALL_RECONCILED exit 0 — 259 census / 54 riders / 38 lights / 34 placers /
32 host pins / 24 anchors exact; zero verbs, zero uploads, zero
shared-budget use. The rider fleet absorbed waysign-15's bakery-sign reseat
with zero drift (sign is a separate nx-sign- entity; all host pins still
exact, including the b28 court pin). Zero world mutations, no visual PASS
claimed. Lane HOLDS for Bill on the three unblock paths: counting-series
eye-gate verdicts (one-line markers in the packet), a Phase F fresh
commission, or a queue widening. Standing recommendation unchanged: /loop
stop or a no-LLM monitor if the blockers take a while — the lane resumes
instantly on any of the three.

### [artwalk-60] PIPELINE-MODE HOLD TICK (2026-09-06) — CLOSED (hold, zero mutations)
Fleet-tick wakeup, full house discipline. Gate ALL PASS real exit 0 at HEAD
6f0c2a0 (sweep-33) pre-work. Fresh reads: ARTWALK-PLAN (H 7/7 + B-1..B-34
all DONE, counting series closed at artwalk-46), INTERLANE-PROTOCOL
(f6254cd0 steady), IMPROVE-PLAN shard routing verified at source — zero OPEN
rows route to nx-artwalk-* (routing row 25, the 54-rider host-anchor
reconciliation, was EXECUTED at artwalk-52). Eye-gate packet md5 48bea194
unchanged, zero Bill verdict markers. Ledger max artwalk-59 → this tag.
Absorbed sibling interleaving: approach-11, night-29, sweep-33 (all
zero-mutation observer ticks). Cheap lawful hold verification:
artwalk52-fleet-anchor-reconcile.ts fresh live run ALL_RECONCILED exit 0 —
259 census / 54 riders / 38 lights / 34 placers / 32 host pins / 24
inverse-transformed anchors, all exact; zero verbs, zero uploads, zero
shared-budget use. Ledger artwalk-60 law exact. Zero world mutations, no
visual PASS claimed. Lane HOLDS for Bill on the three unblock paths:
counting-series eye-gate verdicts (one-line markers in the packet), a
Phase F fresh commission, or a queue widening. Standing recommendation
unchanged: /loop stop or a no-LLM monitor if the blockers will take a
while — the lane resumes instantly on any of the three.

### [artwalk-59] PIPELINE-MODE HOLD TICK (2026-09-06) — CLOSED (hold, zero mutations)
Fleet-tick wakeup, full house discipline. Gate ALL PASS real exit 0 at HEAD
bd552f5 (approach-10) pre-work. Fresh reads: ARTWALK-PLAN (H 7/7 + B-1..B-34
DONE, counting series closed at artwalk-46), INTERLANE-PROTOCOL (9 lanes),
IMPROVE-PLAN SHARD EXECUTION at source — zero OPEN rows route to nx-artwalk-*
(the 54-rider row was EXECUTED at artwalk-52; open split = struct/dress/
approach/improve-own only). Eye-gate packet 48bea194 unchanged, zero Bill
verdict markers. Register 0 artwalk items. Ledger max artwalk-58 → this tag
(sibling dress-20 appended mid-survey — normal pipeline interleaving, disjoint
prefixes). Cheap lawful hold verification: artwalk52-fleet-anchor-reconcile.ts
fresh run → ALL_RECONCILED exit 0 (259 census / 54 riders / 38 lights / 34
placers / 32 host pins / 24 anchors exact, zero verbs, zero uploads) — the
fleet is steady one full tick past artwalk-58's b20 re-pin, absorbing
approach-9/10 + night-27/28 + improve-13 commits with zero rider drift.
No lawful queue work: no Bill verdicts, no Phase F commission, no widening,
no shard rows. Zero world mutations, zero shared-budget use, no visual PASS
claimed. Lane HOLDS on the three unblock paths: Bill's counting-series
eye-gate verdicts (reviews/artwalk-counting-series-eye-gate.md), a Phase F
fresh commission, or a queue widening. Standing recommendation: /loop stop or
no-LLM monitor if the verdicts take a while — the lane resumes instantly.

### [artwalk-58] HOST-RIDER CONTINUITY RE-PIN (2026-09-06) — CLOSED (pin maintenance, zero world mutations)
Fleet-tick wakeup, full house discipline. Gate ALL PASS real exit 0 at HEAD
8d521d5 pre-work; absorbed sibling interleaving approach-8 (6d4a60e) mid-survey.
Ledger max artwalk-57 → this tag; interlane md5 f6254cd0 steady; eye-gate packet
48bea194 unchanged, zero Bill verdict markers; register 0 OPEN; zero open shard
rows route to nx-artwalk-*. The lane's cheap lawful hold verification surfaced
REAL new evidence, not a hold: artwalk52-fleet-anchor-reconcile.ts first fresh
run returned DRIFT exit 1 — next-place-artwalk-b20.ts STALE host pin
(nx-town-bunkhouse store/49f5acc4d91c4d45 vs live c8636968968672af). Root cause:
improve-13's in-flight bunkhouse upgrade (interrupted-after-placement window,
struct-9 class — uncommitted placer/decode/walk on disk, live already reseated)
re-seated the host at the EXACT same tuple (-9,0,-26) yaw 0.31322457 with a
fixed lib (plinth band + proud window panes). Rider b20 itself UNTOUCHED and
live-exact against the new host transform (tuple = host∘L(-2.2,1.05,2.0325),
lib 152684b8, empty comp bag) — no reseat, no verbs. artwalk-39 host-rider
continuity law executed: anchor existence re-verified in the NEW host decode
from hash-gated local bytes (sha256 c8636968968672af60a0… == live lib prefix;
content-addressed store makes local IS live — direct store GET returned 403
without a browser token, disclosed): wall plane z 1.93..2.05 present through
the anchor band (x −2.52..−2.41, y 0.72..0.90, 15 verts, ANCHOR_EXISTS TRUE);
improve-13's committed-contract decode independently proved ZERO new verts in
the b20 KEEP-OUT x[−2.6,−1.8] y[0.8,1.3] z[1.7,2.4]. Placer re-pinned
(49f5acc4 → c8636968); reconciler rerun ALL_RECONCILED exit 0: 259 census /
54 riders / 38 lights / 34 placers / 32 host pins / 24 anchors exact, zero
verbs, zero uploads, zero shared-budget use. Ledger artwalk-58 law exact.
Lane still HOLDS for Bill on the three unblock paths: counting-series
eye-gate verdicts, a Phase F fresh commission, or a queue widening.

### [artwalk-57] PIPELINE-MODE HOLD TICK (2026-09-06) — CLOSED (hold, zero mutations)
Fleet-tick wakeup, full house discipline. State re-derived fresh: ledger
max artwalk-56 → this tag; interlane md5 f6254cd0 steady; plan re-read
(Phase H 7/7 + B-1..B-34 all DONE, PLACED_VERIFIED). Eye-gate packet md5
48bea194 unchanged, zero Bill verdict markers. IMPROVE-PLAN shard routing
read precisely at source (IMPROVE-PLAN.md): the only nx-artwalk line is
routing row 25 (54-rider host-anchor reconciliation, this lane's own,
executed at artwalk-52); zero open rows route to nx-artwalk-*; the
working-tree diff carries zero artwalk rows. Register 0 OPEN. Cheap lawful
hold verification artwalk52-fleet-anchor-reconcile.ts fresh live run
ALL_RECONCILED exit 0: 259 census / 54 riders / 38 lights / 34 placers /
32 host pins / 24 inverse-transformed anchors, all exact; zero verbs,
zero uploads, zero shared-budget use. Ledger artwalk-57 law exact
(2370260). Zero world mutations, no visual PASS claimed. Lane HOLDS for
Bill on the same three unblock paths: counting-series eye-gate verdicts,
a Phase F fresh commission, or a queue widening. Standing recommendation
unchanged: /loop stop or a no-LLM monitor if the blockers will take a
while — the lane resumes instantly on any of the three.

### [artwalk-56] PIPELINE-MODE HOLD TICK (2026-09-06) — CLOSED (hold, zero mutations)
Fleet-tick wakeup, full house discipline. State re-derived fresh: ledger
max artwalk-55 → this tag; interlane md5 f6254cd0 steady; plan re-read
(Phase H 7/7 + B-1..B-34 all DONE, all PLACED_VERIFIED). Eye-gate packet
reviews/artwalk-counting-series-eye-gate.md md5 48bea194 unchanged, zero
verdict markers. Shard EXECUTION section read precisely at source (improve-5y
sharding law): zero open rows route to nx-artwalk-* (row 25's 54-rider
host-anchor reconciliation was this lane's, executed at artwalk-52); the
uncommitted sibling IMPROVE-PLAN working-tree diff greps ZERO nx-artwalk
rows — no in-flight routing change. Zero REPAIR-REGISTER OPEN items.
Absorbed sibling interleaving: night-24 (HEAD 6477bcb, zero-mutation
observer tick). Cheap lawful hold verification:
artwalk52-fleet-anchor-reconcile.ts fresh live run ALL_RECONCILED exit 0 —
259 census / 54 riders / 38 lights / 34 placers / 32 host pins / 24
inverse-transformed anchors, all exact; zero verbs, zero uploads. Ledger
artwalk-56 law exact 2370258. Zero world mutations, zero shared-budget
use, no visual PASS claimed. Lane HOLDS for Bill on the same three unblock
paths: counting-series eye-gate verdicts (one-line markers in the packet),
a Phase F fresh commission, or a queue widening. Standing recommendation
unchanged: /loop stop or a no-LLM monitor if the blockers will take a while
— the lane resumes instantly on any of the three.

### [artwalk-55] PIPELINE-MODE HOLD TICK (2026-09-06) — CLOSED (hold, zero mutations)
Fleet-tick wakeup, full house discipline. State re-derived fresh: ledger
max artwalk-54 → this tag; interlane md5 f6254cd0 steady; plan re-read
(Phase H 7/7 + B-1..B-34 all DONE, all PLACED_VERIFIED). Eye-gate packet
reviews/artwalk-counting-series-eye-gate.md md5 48bea194 unchanged, zero
verdict markers. Shard EXECUTION section read precisely at source (improve-5y
sharding law): routes are nx-struct→struct, nx-dress→dress, nx-approach→
approach, nx-sign→waysign, nx-town→improve; the only artwalk line is the
54-rider host-anchor note (this lane's own, executed at artwalk-52). The
uncommitted sibling IMPROVE-PLAN working-tree diff (98 added lines) greps
ZERO nx-artwalk rows — no in-flight routing change. Zero REPAIR-REGISTER
OPEN items. Sibling interleaving absorbed: dress-19 (HEAD e06f69c), night-23,
survey-5 (uncommitted ledger entry observed and left in place — shared-file
attribution by tag). Cheap lawful hold verification:
artwalk52-fleet-anchor-reconcile.ts fresh live run ALL_RECONCILED exit 0 —
259 census / 54 riders / 38 lights / 34 placers / 32 host pins / 24
inverse-transformed anchors, all exact; zero verbs, zero uploads. Ledger
artwalk-55 law exact 2370258. Zero world mutations, zero shared-budget
use, no visual PASS claimed. Lane HOLDS for Bill on the same three unblock
paths: counting-series eye-gate verdicts (one-line markers in the packet),
a Phase F fresh commission, or a queue widening. Standing recommendation
unchanged: /loop stop or a no-LLM monitor if the blockers will take a while
— the lane resumes instantly on any of the three.

### [artwalk-54] PIPELINE-MODE HOLD TICK (2026-09-06) — CLOSED (hold, zero mutations)
Fleet-tick wakeup, full house discipline. State re-derived fresh: ledger
max artwalk-53 → this tag; interlane md5 f6254cd0 steady; plan re-read in
full (Phase H 7/7 + B-1..B-34 all DONE). Eye-gate packet
reviews/artwalk-counting-series-eye-gate.md md5 48bea194 unchanged, zero
Bill verdict markers (three unblock paths all pending: counting-series
verdicts, Phase F commission, queue widening). Zero REPAIR-REGISTER OPEN
items. IMPROVE-PLAN queue + EXECUTION SHARDING section read precisely
(rows 1–39 + sharding map): zero open rows route to nx-artwalk-* (the
54-rider host-anchor row was executed at artwalk-52). Absorbed sibling
interleaving: struct-39 (spiralfolly re-place) + night-22 landed between
artwalk-53 and this tick. Cheap lawful hold verification:
artwalk52-fleet-anchor-reconcile.ts fresh run → ALL_RECONCILED exit 0 —
census 259 / 54 riders / 38 lights / 34 placers / 32 host pins / 24
inverse-transformed anchors exact, zero verbs, zero uploads. Gate ALL
PASS real exit 0 pre-work at HEAD 2003491; ledger law EXACT 2370258.
Zero world mutations, zero shared-budget use, no visual PASS claimed.
Standing recommendation unchanged: /loop stop or no-LLM monitor if the
verdicts will take a while — lane resumes instantly on any of the three
triggers.

### [artwalk-53] PIPELINE-MODE HOLD TICK (2026-09-06) — CLOSED (hold, zero mutations)
Fleet-tick wakeup, full house discipline. State re-derived fresh: ledger
max artwalk-52 → this tag; interlane md5 f6254cd0 steady; plan fa2b15ea
re-read; eye-gate packet reviews/artwalk-counting-series-eye-gate.md md5
48bea194 unchanged, zero Bill verdict markers (three unblock paths all
pending: counting-series verdicts, Phase F commission, queue widening);
zero REPAIR-REGISTER OPEN items for artwalk. SHARD EXECUTION section read
precisely: routing table sends nx-struct→struct, nx-dress→dress,
nx-approach→approach, nx-sign→waysign, nx-town→improve — ZERO open rows
route to nx-artwalk-* (the 54-rider host-anchor row was executed at
artwalk-52). Phase H 7/7 + B-1..B-34 all DONE; no lawful queue work.
Cheap lawful hold verification: `artwalk52-fleet-anchor-reconcile.ts`
fresh run → ALL_RECONCILED exit 0 — census 259 / 54 riders / 38 lights /
34 placers / 32 host pins / 24 inverse-transformed anchors exact, zero
verbs, zero uploads. Gate ALL PASS real exit 0 pre-work at HEAD df5a390
(sweep-31, zero mutations); ledger law EXACT 2370250. Zero world
mutations, zero shared-budget use, no visual PASS claimed. Standing
recommendation unchanged: /loop stop or no-LLM monitor if the verdicts
will take a while — lane resumes instantly on any of the three triggers.

### [artwalk-52] FULL-FLEET ANCHOR RECONCILIATION — SHARD ROW EXECUTED (2026-09-06) — CLOSED (verification, zero mutations)
Executed the IMPROVE-PLAN shard row ("nx-artwalk riders | 54 | host-anchor
reconciliation stays artwalk's own") as priority work per the fleet-tick
directive. New durable lane-owned verifier `artwalk52-fleet-anchor-reconcile.ts`
(read-only, zero verbs/uploads) runs the complete artwalk-39 continuity law
across the whole fleet from one fresh census:
- 259 census / 54 riders present / 38 lights; comps only h6/h7 motion bags.
- Host pins: all 34 b-series placers' HOST/HL pins match live host libs
  (strict + loose + multi-rider forms); zero stale, zero gone — artwalk-51's
  b8 re-pin and artwalk-49's 17-placer re-pin both holding.
- Host-derived anchors: every single-rider rider's live pos inverse-transformed
  into its host's local frame and compared to the placer's pinned L — b13
  IDS/LOC pair (rider yaw = host yaw + π), b4 three-spec gate set, b34/b26
  four lamp way-bands (concentric, dYaw 0), b7 shrine stars exact host-derived
  tuple. All within 1e-4.
- Static h-series tuples (6 models) and all 7 `-l` light companions verified
  exact against placer pins (h3 carries an OLD_LIGHT_POS migration constant;
  live matches the CURRENT pin).
First run reported false DRIFT on 19 pins and the b13 pair — both comparison
bugs (store/ prefix not stripped before startsWith; −π vs +π same-angle), fixed
in the same tick; world state was never wrong. Final: ALL_RECONCILED exit 0.
Zero world mutations, zero uploads, zero verbs, no shared-budget use; no
visual PASS claimed. Lane still HOLDS for Bill's counting-series eye-gate
verdicts (reviews/artwalk-counting-series-eye-gate.md) or a Phase F
commission; this verifier is now the cheap lawful hold check for future ticks.

### [artwalk-51] STABLE HOST-PIN REFRESH, THIRD GENERATION (2026-09-06) — CLOSED
Sibling improve-11/12 evolved `nx-town-stable` (5beff62e→98f2d5b6: road-side
livery entrance, partition cut + stallrail removal, curb split, trough move).
Reconciliation at source: local `village_stable3.glb` sha256 98f2d5b6… verified
byte-equal to the live lib prefix; `artwalk51-stable-decode.ts` confirms the
b8 rider band (host-local z −2.29..−2.03, y 2.0..2.65, x ±2.55) holds ZERO
new-host verts — improve-12's edits are all road-side (west) and interior;
the open-front wall `st3_1` still spans x ±2.7 to z −2.78 (rein flank mounts
intact), roof `st3_8` starts y 2.64 above the band. Host pose (43,0,0)
yaw −π/2 unchanged. Durable fix: placer `next-place-artwalk-b8.ts` HOST_LIB
re-pinned 5beff62e→98f2d5b6 (a rerun had been dying on "stable host drift").
Idempotent rerun after re-pin: zero verbs, PLACED_VERIFIED at the exact
host-derived tuple (45.16,2.22,~0), fresh live SAT minGap 2.825m vs the new
sibling `nx-dress-stablebench`. Exhaustive HOST_LIB sweep of all 10 pinned
placers vs fresh census: b8 was the ONLY stale pin (b1/b2/b3/b4/b5/b9/b10/
b11/b12 all match live). `artwalk49-recovery-audit.ts` rerun fresh: census
259 / 54 riders all present / b7 tuple EXACT dy 0.0 / lights 38 steady.
Zero world mutations, zero uploads, zero verbs; no visual PASS claimed.
Lane still HOLDS for Bill's counting-series eye-gate verdicts
(reviews/artwalk-counting-series-eye-gate.md) or a Phase F commission.

### [artwalk-50] CROSS-SIBLING FLEET HOLD VERIFICATION (2026-09-06) — CLOSED (hold, zero mutations)
Pipeline-mode hold tick: three sibling lanes mutated the live world after
artwalk-49 (waysign-12 mill-sign reseat on the b10 windmill host, approach-6
SW/NW solids + flame_beads_nw, struct-37 skymirror). Every host-rider
continuity risk they could create re-verified fresh, all green:
- `artwalk49-recovery-audit.ts` rerun: census 259 / 54 riders all present;
  b7 host-derived tuple EXACT (dy 0.0, shrine 53709062); comps only h6/h7
  motion bags as designed.
- Full 11-host re-pin table re-checked live ok, including tower-house
  11b31000 (improve-9's bd1badd218 record predates artwalk-49's re-pin —
  live is 11b31000, no second host evolution). b21 placer pin matches live.
- b26 + b34 way-bands: all four dYaw 0.0000 vs their approach-lamp hosts
  (artwalk-49's b26 fix holding; approach-6's NW work did not rotate lamp
  hosts).
- No IMPROVE-PLAN rows route to nx-artwalk-* (the 54-rider note is the
  reconciliation this lane executed at artwalk-49 and just re-verified).
Lane HOLDS for Bill's counting-series eye-gate verdicts or a Phase F
commission / queue widening. Zero world mutations, zero uploads, zero
verbs. Gate ALL PASS real exit 0 at HEAD ab6a916.

### [artwalk-48] CHARTER WALL HOST-PIN REFRESH, SECOND GENERATION (2026-09-06) — CLOSED
Sibling improve-5 evolved `nx-town-hall` again (1306527a→c92c1f91: trueGableHalf
D2 fix, solid ridge D3, N-door casing/header D1, 5-anchor warm light kit, 28
nodes). Reconciliation at source: `village_hall3.glb` sha256 c92c1f91… verified
byte-equal to the live lib prefix; decode confirms `wall_w` inner face x=−4.28
unchanged (wall box −5.0..−4.5 + plaster return, per mkv3-ring.ts hall build).
All improve-5 additions sit outside the rider band (host-local y 1.115–2.885,
z ±1.4, x −4.32..−4.125): N header y 1.79–1.95 on the z-wall, gable/ridge/roof
above 3.16, lamps on E/N/S surfaces. The banner-cloth + wheel + win_w overlap
dance in the rider's band predates to nvp-17 (git log -S: no touches since) —
it belongs to Bill's still-pending b1 eye-check, not to drift; no rider move
was made. Durable fix: placer `next-place-artwalk-b1.ts` HOST_LIB re-pinned
c5964bc8→c92c1f91 (a rerun had been dying on "hall host drift"). Idempotent
rerun after re-pin: zero verbs, PLACED_VERIFIED, host-relative anchor
(−4.28,1.1,0) exact, fresh live SAT minGap 3.245m vs `nx-struct-waterstair`.
Zero world mutations, zero shared-budget use; no visual PASS claimed.
