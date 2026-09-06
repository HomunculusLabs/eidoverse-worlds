# IMPROVE-PLAN — improve-N lane durable state (refinement era)

Lane: object improvement for commons-next. One object per wakeup, full
analyze→evaluate→plan→execute cycle. Loop file: `IMPROVE-LOOP.md`.
Interlane: `INTERLANE-PROTOCOL.md`.

## Era framing

Additive era closed 2026-09-06: sweep-19 CLEAN at 259 entities, all builder
queues drained, four district dressing queues COMPLETE, waysign/mile queues
closed with eye-gates delivered. The refinement era opens here — the same
arc the old commons ran as its refine/texture eras, the highest-yield lanes
in village history.

## Object pool (authored objects, from the sweep-20 census snapshot)

| family | count | notes |
|---|---|---|
| nx-town core buildings | 36 | round-1 analysis focus |
| nx-sign trade signs | 8 | incl. heritage smithy |
| nx-dress district dressing | 27 | 11 fleet-built + 16 legacy core |
| nx-struct structures | 30 | rounds 2+ |
| nx-approach legs | 17 | lamp-gap D-notes pending Bill's budget call |
| nx-mile milestones | 15 | rounds 2+ |
| nx-artwalk riders | 54 | host-anchor reconciliation stays artwalk's own |

## Round structure

A round = one analysis phase (2–3 ticks, family-by-family render+judge
sweeps that commit a ranked worst-first queue) + N execution ticks (one
object each) + one eye-gate circuit at close. Next round re-derives from
the then-current census — never reuse a stale queue.

## Round 1 (OPEN)

**Analysis ticks:**
- improve-1: render+judge the 36 core nx-town buildings at gameplay
  distance (2 views each, existing review chassis), defect list, ranked.
- improve-2: signs (8) + fleet dress pieces (11) — same treatment. DONE —
  findings below (merged into the execution queue at improve-3).
- improve-3: struct + approach + mile families; commit the merged ranked
  round-1 execution queue (worst first, each entry = id + defect + fix). DONE —
  findings below; merged queue supersedes the core-only draft order.

**improve-2 findings (signs + fleet dress, judged at 18m gameplay vantage,
ZAI fallback vision — native down 14th consecutive tick, disclosed; isolation
renders, so host-mount/absent-host-wall reads were filtered as non-defects
per host-rider law):**

Signs (8): `nx-sign-stable-001` CLEAN (dark horseshoe on cream holds).
The other 7 share one root failure class — emblem collapses at 18m
(motif <~1/3 of board face, low contrast, shape ambiguity):
- `nx-sign-smithy` — horseshoe a dark smudge, no U-shape; stray detached
  fragment left of board; bracket hairline-thin. Sev 2 (heritage sign).
- `nx-sign-dyer-001` — flax-blue bolt reads near-black at 18m, fuses with
  dark frame (known waysign flag CONFIRMED). Sev 2.
- `nx-sign-kiln-001` — flame collapses to orange blob; chains hairline.
  Sev 2.
- `nx-sign-woodyard-001` — saw-buck reads chevron; black header slab a
  content-free void; no mount silhouette. Sev 2.
- `nx-sign-mill-001` — sails read as generic X, indistinguishable from
  crossed-tools; header an unresolvable clump. Sev 2.
- `nx-sign-potter-001` — wheel reads, pot a smudge; emblem ~1/3 of panel.
  Sev 3 (closest to passing).
- `nx-sign-bakery` — emblem gold-on-cream blob ~6px. Sev 3.
(Note: waysign lane owns `nx-sign-*` re-places; execution entries route as
a cross-lane packet to waysign or wait for idle-guard to lapse — improve-3
resolves routing before any sign execution.)

Fleet dress (11): `nx-dress-se-stones-001` CLEAN (rock clusters read),
`nx-dress-nw-logpile-001` effectively CLEAN at 18m (minor close-range
notes only: shadow blob, dark end caps, sparse right end).
- `nx-dress-ne-yard-001` — reads rubble-pile not farmyard; floating rail
  ends; uniform near-black value. Sev 2.
- `nx-dress-sw-gravel-001` — collapses to a 1–2px dark line at 18m;
  reads as render artifact. Sev 2.
- `nx-dress-ne-bench-001` — reads as scattered tables not a bench; hard
  misaligned blob shadows. Sev 3.
- `nx-dress-se-cairn-001` — spindly totem not squat cairn; top stones
  dissolve; no per-stone value variation. Sev 3.
- `nx-dress-sw-prayer-001` — reads as rock pile; ZERO fabric/pole read —
  the namesake element is absent. Sev 2 (identity failure).
- `nx-dress-nw-skeps-001` — borderline pass; stray plank reads noise;
  rock swallows 2nd skep. Sev 4.
- `nx-dress-nw-stile-001` — reads as fence not crossing; step stones
  illegible. Sev 3. (dress-11 placed <24h — idle-guarded.)
- `nx-dress-ne-woodstack-001` — right post near-black/burnt read; gaps
  see-through mid rows; left post detached. Sev 3. (idle-guarded.)
- `nx-dress-nw-hedge-001` — passes as hedge; cleanup tier only (lone
  stub riser, stray cube, mid-gap hole). Sev 4.

**improve-3 findings (struct + approach + mile, judged at 18m gameplay
vantage from fresh live census 259 and live store bytes (29 unique GLBs,
HTTP 200 ×29 via curl UA; urllib default-UA gets 403), ZAI fallback vision
— native down 15th consecutive tick, disclosed; vision findings are probes
ranked by 8m-walker severity, decode-at-source precedes any edit):**

Struct (24 unique GLBs): CLEAN — halt/needlerest (shared, 2 entities),
waystone (shared, 4), northneedle, orrery, orreryring, beacon, waterstair.
Defective:
- `nx-struct-echoarch` — ARCH SPAN AND ONE LEG DO NOT RENDER: only a single
  post draws at 18m AND front view; the cast shadow proves the arch
  geometry exists but is invisible (flipped normals / culled faces / hidden
  material). Plus a small orange seam at the post-base joint. Sev 1:
  namesake element invisible, orphan shadow.
- `nx-struct-crossing` — reads as two clusters of utility poles on empty
  grass; no water plane, banks, or stepping stones — the ford is a void;
  posts within a cluster clip through each other; stub pegs read snapped;
  plate feet + stretched detached shadows. Sev 1: identity failure.
- `nx-struct-angler` — reads as a plain park bench; the fisherman figure
  is absent from the render (possible missing export — decode at source
  first). Sev 2: identity failure.
- `nx-struct-skene` — five dark panels render as pure-black voids reading
  as holes; panels hover just above ground; side wings read as detached
  fragments; sub-pixel pole-and-ball finial. Sev 2.
- `nx-struct-skymirror` — reflective face reads flat matte dark — no sky
  reflection visible (material may not render); form collapses to an
  ambiguous dark blob with jagged notched top edge. Sev 2: identity.
- `nx-struct-millrace` — pond interior flat near-black void (dark-water-
  reads-as-hole class, polish-281 law: check for faint same-hue emissive);
  hairline reeds; dark bands between steps read as open slits; floating
  ball finial confirmed on the sluice wall top. Sev 2.
- `nx-struct-spiralfolly` — floating gold ring, detached treads with
  see-through gaps, no top landing; muddy lowest turns. Sev 2.
- `nx-struct-shelltower` — see-through gaps between spiral treads; topmost
  turn near-black below canopy; stairs never connect to the canopy. Sev 2.
- `nx-struct-hypar` — floating/dangling batten lower-left; right batten
  ends hover above the deck; ragged silhouette from overshooting tips. Sev
  2–3.
- `nx-struct-mobius` — see-through slit near roof center; jagged canopy
  top edge; canopy hovers over thin posts. Sev 3.
- `nx-struct-amphi` — seating arcs broken into disconnected slabs with
  gaps; no visible tiering (flat bowl); central pole reads telephone-pole. 
  Sev 3.
- `nx-struct-observatory` — dark trim band reads detached on the right;
  see-through slits between wall top ring and dome. Sev 3.
- `nx-struct-pendulum` — contact shadow renders as broken dashed stripes
  (shadow-map acne); hairline strings; bob colors read inconsistent
  (olive vs near-black). Sev 4 (frame itself solid; identity weak — reads
  gallows-like "hanging-ball display", not pendulum wave). Note: struct-9
  accessor decode already proved one clean sine period — numbers stand,
  the VISUAL read is the defect.
- `nx-struct-soundmirror` — identity failure: edge-on collapse reads
  wedding-cake mound, not a dish; central cross 1-2px; dish interior pure
  black. Sev 3. (struct-33 added a warm-emissive listening seat — defer
  to that lane's recent work; re-analyze after dark view if needed.)

Approach (5 unique GLBs): lamp (shared ×4) CLEAN. Lanes: NE lane-002
CLEAN; NW lane-001 minor only — surface banding (possibly intended dirt
decal), razor-thin taper at the end, raw-box marker stones, lamp no base
(Sev 4); SW lane-003 — scattered floating tan cubes jittering off the path
edge reading as debug debris (Sev 2, the worst approach finding), thin
plane seam, detached lamp shadow.

Mile (2 unique GLBs ×6 each): both CLEAN at 18m (marker silhouette, cap,
grounded contact shadow hold; 0521 variant's side plate borderline
legible — note only). Mile lane idle-guarded until 2026-09-07 04:14
(mile-8 today); moot for the queue (CLEAN).

Idle-guard ledger at improve-3 (2026-09-06): waysign signs guarded until
09-07 02:12 (waysign-7 today); mile CLEAN and guarded until 09-07 04:14
(moot); struct lane clear (struct-35 Aug 31); approach lane clear
(approach-3 Sep 3); dress subjects woodstack/logpile/stile guarded until
09-07 (dress-9/10/11 <24h at improve-2, aging out through the morning).

**Seeded defects (enter the ranked queue regardless of sweep):**
- `nx-town-inn` porch emblem reads "wheel, not tankard" (waysign-7 flag) —
  host defect, waysign folded the inn sign over it.
- tex-85 woodyard live-freeze: live bytes ≠ source rebuild by design —
  any improvement derives from the LIVE store copy, never a source rebuild
  (disputed-bytes law).

**MERGED ROUND-1 EXECUTION QUEUE (committed at improve-3 — this is the
CURRENT round queue; the improve-1 core-only draft below is historical. Worst-first across all families; every entry decodes at source
before editing — vision findings are probes ranked by 8m-walker severity,
not verdicts. Seeded entries: inn emblem, woodyard live-freeze. Idle-guard:
any object another lane touched within 24h defers. Sign re-places route as
a cross-lane packet to waysign — improve never re-places a waysign-owned
`nx-sign-*` rider. Native vision RESTORED 2026-09-06 (~08:40, Bill set
glm-5.3-flash for the lane vision model; falsified on a live frame before
this note): the merged queue below items already executed was ranked under
ZAI fallback (improve-1..3, native down ticks 13-16). Items not yet executed
MUST be re-judged under native vision (render 8 views at 18m, judge the
exact live bytes) BEFORE execution; confirm-or-drop each finding, and
re-rank worst-first if confirmations move severities. Entries that fail
native confirmation drop out of the round queue with a one-line note here.
Executed entries keep their record regardless — re-judgment is forward-only):**

1. `nx-town-hall` — see-through hole: sky visible through porch opening (no
   door/backstop); eave sliver top-right; ridge dashes. Sev 1: reads as
   unfinished mesh. (guard: none) [EXECUTED improve-5: cased 1.4 N door,
   recessed header, 5-anchor warm kit, trueGableHalf ridge; D1 residual
   lit-doorway patch routed to round-1 eye-gate]
2. `nx-struct-echoarch` — arch span + one leg invisible (renders as single
   post; orphan shadow proves hidden geometry — suspect flipped normals /
   culled faces); orange seam at post-base joint. Sev 1: namesake absent.
   DECODE FIRST. (guard: none — struct lane idle since Aug 31)
   [EXECUTED improve-6: fins-absent root-caused at decode; fixed, re-placed]
3. `nx-town-inn` — two floating diagonal planes at roof corners; dead
   unattached ridge box; porch emblem reads wheel-not-tankard (seeded,
   waysign-7); off-center entrance recess. Sev 1: floating geometry.
   (guard: none) [EXECUTED improve-7: gable horns killed via kit opt-ins,
   solid ridge, chimney re-seated (was floating 0.72m — the "dead ridge
   box"), tankard emblem built both faces; off-center-recess finding
   DROPPED as probe artifact; D-note: emblem 18m front-view legibility
   routed to round-1 eye-gate — decode-verified only, ZAI judged
   side-view illegible at that resolution]
4. `nx-town-windmill` — gallery ring floats with zero attachment; stray pole
   clips lit window; sail cross lopsided (one arm bare). Sev 1: floating
   geometry + weak identity. (guard: interior-20 Sep 1 interior only —
   treat exterior as clear; re-check lane tail at execution)
   [DEFERRED improve-8: idle-guard FIRED — waysign-6 hung nx-sign-mill-001
   rider live on the windmill 09-06 01:57 (<24h); a host re-place would
   also strand the rider's fresh anchor against changed host bytes.
   Re-check waysign tail when this item returns.]
   [NATIVE-CONFIRMED survey-2: gallery ring floats with NO deck/brackets
   (halo read); sail cross is an upright "+" — DOWN arm absent entirely,
   right arm bare rails, up-arm reads banner not sail; thin vertical rod
   drops from hub and clips the lit window slot; identity reads
   watchtower/lighthouse hybrid, not instant windmill. Sev 1 stands.
   Evidence: reviews/survey2-sev2-slice/windmill/gameplay.png]
5. `nx-struct-crossing` — reads as utility-pole clusters; no water/banks/
   stones — ford is a void; clipping posts, snapped stub pegs. Sev 1:
   identity failure. DECODE FIRST. (guard: none)
5. `nx-dress-sw-prayer-001` — reads as rock pile; ZERO fabric/pole read —
   namesake absent. Sev 2: identity failure (worst dress finding).
   (guard: dress-8 placed it — idle-guarded until 09-06 18:15)
   [DROPPED dress-13: native re-judgment on exact live bytes (pin
   5074600f, 8-view rejudge rig) — piece reads FIRST as a deliberate
   devotional mound, not rubble: size-sorted stacking, pale crown
   stones, flat bowing slab (vocabulary break), sparse kicked strays
   all legible at 18m; verdict "pass — quiet, correct". The
   fabric/pole expectation was the fallback judge's invention (the
   dress-8 concept contract is a stone mound by design); dress-8's
   standing slab-marginal note resolved to CONFIRMED-LEGIBLE. No edit,
   no world mutation.]
6. `nx-town-tower-house` — front stilts emerge from pure-black underside
   (floating read); balcony door ~4m with no stair/ladder; broken railing. 
   Sev 1–2. (guard: none)
7. `nx-sign-*` packet (7 signs, emblem-scale collapse class) — CROSS-LANE:
   re-places belong to waysign; improve drafts the build spec for the
   packet. Routing: parked until waysign's queue/eye-gate resolves OR
   Bill routes it here. Not improve's to execute. (guard: waysign-7 today)
8. `nx-town-stable` — no entrance/identity on any face (reads chest/
   monument); squat proportions; corner wedge voids at roof overhang. Sev
   2. (guard: none) [NATIVE-CONFIRMED survey-1: no door/opening on any face,
   featureless walls, black base strip void; silhouette PASS]
9. `nx-town-kiln` — floating quad on cone flank; orphan rod; no flue/vent;
   firebox dead void. Sev 2. (guard: none) [NATIVE-DROPPED survey-1: CLEAN
   4/4 at 18m on exact live bytes 4d8ef8fc — flue stub, firebox mouth,
   trough+poker, rocks all read; findings were ZAI probe artifacts]
10. `nx-struct-angler` — reads as plain park bench; fisherman figure
    absent from render. Sev 2: identity failure. DECODE FIRST (possible
    missing export). (guard: none) [NATIVE-CONFIRMED survey-1: no figure,
    no rod, nothing legible as fishing — plain bench; geometry itself
    grounded/clean]
11. `nx-struct-skene` — panels read as black voids/holes; hovering panels;
    detached side wings; sub-pixel finial. Sev 2. (guard: none)
    [NATIVE-CONFIRMED survey-1: five near-black slats with sky gaps + ground
    gaps, unsupported, read as voids; reads colonnade/gateway not stage —
    no deck visible; finial hairline+speck]
    [EXECUTED struct-36: root cause = NO WALL BODY (piers + floating dark
    insets + lintels, nothing between — sky through every bay); fix = solid
    stone back body + sill course + 4 golden-division mullions + niches
    recessed on 0.16m sill (proud surround), finial re-materialized waysign
    textured-gold 0xa09832 family bead 0.07→0.11; sha 3a62ee83→df7f7c43 x2
    deterministic, x/z bbox identical, y 2.03→2.07; native re-judgment on
    exact live bytes CONFIRMED first (ZAI candidate PASS 4/4 — native 1210
    12th tick, disclosed), pixel falsification 0 sky-bleed/5 niches flanked/
    44 gold px; remove+spawn exact tuple, comp {} both sides, idempotent
    zero-verb rerun, 4-leg walk ALL_PASS 0.398m; standing fat-bbox SAT
    exemption named nx-approach-nw-lane-001 (true vertex 19.37m, struct-26
    class); dropped: detached-wings (cheeks read attached)]
12. `nx-struct-skymirror` — no visible reflection (material suspect);
    ambiguous dark blob; notched top edge. Sev 2: identity. DECODE FIRST.
    (guard: none) [NATIVE-CONFIRMED survey-1: flat matte dark two-tier
    disc, zero reflection/sheen, reads tire-stack/rock — identity failure
    core confirmed; notched edge NOT observed at 18m — drop that sub-finding]
    [EXECUTED struct-37: recovered dead sibling window (artwalk-32 pre-place
    class, named), 4-iteration closed loop — v2 open hex cup + recessed
    water (0.45 emissive → 0.7 → 1.0, grazing 2px physics), v5 water
    lightened 0x506a78→0x8fb6c8 sky-catching + bead to textured-gold
    0xa09832 family (improve-8 law); ZAI near-view 3/3 PASS (native 1210,
    disclosed), 18m residual = grazing physics (open-cup identity carries
    far read — ZAI's own disposition), night 25.9k blue px verified; sha
    8331ba88→782eb864 deterministic x2; remove+spawn exact tuple (24,
    -0.05395918022037476, -35.5) yaw 0, comp {} both sides,
    PLACED_VERIFIED + idempotent 0-verb rerun, live pin re-read]
13. `nx-struct-millrace` — pond black void (polish-281 dark-water class);
    hairline reeds; slit bands; floating finial. Sev 2. (guard: none)
    [NATIVE-CONFIRMED survey-2: inter-tread bands read as OPEN SLITS
    (pure black full-width gaps — slatted read, not shadowed risers);
    ball finial a 1-2px speck floating above cap with no visible stem;
    pond water flat near-black no-sheen (borderline basin, rim saves it
    from hole-read); reeds hairline; identity reads generic ornamental
    fountain, millrace function absent. Sev 2 stands. Evidence:
    reviews/survey2-sev2-slice/millrace/gameplay.png; intake note
    STRUCTURES-PLAN SURVEY INTAKE]
14. `nx-struct-spiralfolly` — floating gold ring; detached treads; gaps;
    no top landing. Sev 2. (guard: none) [NATIVE-CONFIRMED survey-1:
    treads detached blocks with gaps, upper turns drift off core, gold
    ring floats unconnected, stairs stop short, ragged wobble]
15. `nx-struct-shelltower` — gaps between treads; top turn near-black;
    stairs never reach canopy. Sev 2. (guard: none) [NATIVE-DROPPED survey-1:
    CLEAN at 18m — treads read attached (dark notches = step shadow), top
    tread meets canopy rim, silhouette solid; optional polish: rim-light
    the upper turn]
16. `nx-approach-sw-lane-003` — floating tan cubes off path edge read as
    debug debris. Sev 2. (guard: approach lane idle since Sep 3)
    [SUPERSEDED survey-2: judged pre-fix bytes 56b35877 (fetched 12:26,
    confirmed debug-cube read — sub-finding corrected: cubes grounded,
    not floating; seam + blob shadows confirmed) — sibling approach-4
    re-placed the lane at 12:32 (live lib 43817a4f, verge re-dressed,
    walk ALL_PASS). Row closed by owner; no note routed. Survey re-judge
    of the fixed bytes deferred to a later slice; approach-4's own
    PASS was ZAI-judged (native 1210 x2) — a native pass/judge of
    43817a4f at 18m is a candidate for the next survey slice.]
    [EXECUTED approach-4: verge re-dressed as cool gray-bone stone clusters
    in a tightened 1.22-1.45m band, companions offset along the walk; sha
    43817a4f reseat, walk ALL_PASS 0.37, row closed]
17. `nx-town-shrine` — offering clumps illegible; torch flames 1-2px;
    asymmetric base plate; dead side faces. Sev 2. (guard: none)
    [NATIVE-PARTIAL survey-2: flames readable but at threshold (~2px
    orange specks); offerings borderline-legible pale speck row (not
    smudges); base reads SYMMETRIC (drop); side faces alive — pillars
    show mottled taper (drop); identity legible. Re-ranked Sev 3.
    Evidence: reviews/survey2-sev2-slice/shrine/gameplay.png]
18. `nx-town-row-cottage` — left door jamb bare; lamp dot no fixture;
    ridge tabs; dormer seam. Sev 2. (guard: none)
    [NATIVE-PARTIAL survey-2: lamp reads BARE DOT, zero fixture geometry
    (CONFIRMED); small ridge tab just left of dormer + minor ridge
    bumpiness (CONFIRMED, minor); door jambs read COMPLETE both sides
    (DROP); dormer clean, no seam (DROP). Re-ranked Sev 3. Evidence:
    reviews/survey2-sev2-slice/row-cottage/gameplay.png]
19. `nx-town-bunkhouse` — facade value crush; stray diagonal face right
    wall; ridge tabs. Sev 2. (guard: re-check interior lane tail at
   execution; interior-20 last Sep 1)
   [NATIVE-CONFIRMED survey-2: facade crushes to one dark value — only
   the pure-black doorway void reads, door/window faint tonal ghosts;
   thin lighter diagonal streak through right window area (stray face/
   seam class); evenly spaced ridge notch/bump artifacts. Identity
   carried by silhouette alone. Sev 2 stands. Evidence:
   reviews/survey2-sev2-slice/bunkhouse/gameplay.png]
20. `nx-town-garden-cottage` — front face zero info; extension fuses with
    main volume. Sev 2. (guard: re-check interior lane tail at execution)
    [NATIVE-PARTIAL survey-2: front face near-featureless — windows
    dark-on-dark do NOT read, only central door void faint (CONFIRMED);
    extension reads DISTINCT mass with clean step-down silhouette (DROP
    fuse finding); left garden fence illegible blob (new sub-finding).
    Re-ranked Sev 3. Evidence:
    reviews/survey2-sev2-slice/garden-cottage/gameplay.png]
21. `nx-town-belltower` — ladder rungs float (no stringers); rope
   [ENGINE NOTE 2026-09-06 engine-1: ladders are CLIMBABLE via a `ladder`
   comp — fix the rungs AND place `{type:'ladder', min:[..], max:[..]}`
   covering the run band (bottom -0.1 to landing lip) in the same tick;
   W/S climbs, Space hops off, top-out steps onto the belfry floor]
    unanchored mid-air; muddy belfry corner. Sev 3. (guard: none)
    [ZAI-PARTIAL survey-3 (native 1210 x2, one paced retry, ZAI fallback — native re-judge owed): rungs DROP —
    stringers + attached rungs resolve at 18m (contrast flicker only where
    the X-brace crosses the rail); rope CONFIRMED — lower terminus floats
    ~1m mid-air with knot-tick and no beam/floor beneath (x484-496,
    y440-465 class) + mid-shaft fusion with brace; belfry corner PARTIAL —
    left junction clean, right lamp fuses with post/beam junction (move
    lamp inboard). Scope narrowed, Sev 3 stands. Evidence:
    reviews/survey3-slice/beltower/gameplay.png]

22. `nx-struct-hypar` — dangling batten; hovering batten ends; ragged
    tips. Sev 2–3. (guard: none)
    [ZAI-CONFIRMED survey-3 (native 1210 x2, one paced retry, ZAI fallback — native re-judge owed):
    dangling tips, hovering fan ends, ragged margins all re-confirmed at
    18m; INTENSIFIED — central sky-through gap splits the canopy into two
    fans (open sky ~70% of center span), daylight band between canopy and
    deck with no hangers, 9px finial specks, edge beams sub-legible so the
    ruled-surface read fails. Sev 2. Evidence:
    reviews/survey3-slice/hypar/gameplay.png]

23. `nx-struct-mobius` — center slit; jagged canopy edge; hovering
    canopy. Sev 3. (guard: none)
    [ZAI-PARTIAL survey-3 (native 1210 x2, one paced retry, ZAI fallback — native re-judge owed): jagged canopy
    edge CONFIRMED — asymmetric half-loop sawtooth (x≈495-740) reads
    damage, not crenellation; facet seams read venetian panels; center
    slit DROPPED (falsifiable negative: zero sky pixels inside band
    faces); hovering DROPPED-ambiguous (under-edge strip reads as the
    shaded far side of the loop). Sev 3 stands. Evidence:
    reviews/survey3-slice/mobius/gameplay.png]

24. `nx-struct-amphi` — disconnected seating slabs; flat bowl; telephone
    pole. Sev 3. (nx-struct-amphi is a struct lane work — struct lane
    idle since Aug 31; approach shared structures: none)
    [ZAI-CONFIRMED survey-3 (native 1210 x2, one paced retry, ZAI fallback — native re-judge owed):
    disconnected slabs CONFIRMED (three ground-through gaps, zero readable
    curvature — flat sagitta over 360px run; tiers read coplanar);
    telephone pole CONFIRMED dead-center (T-crossarm silhouette, ~7x row
    height, composition focal); flat bowl CONFIRMED; NEW: seating wraps
    <180deg — single bank flanking bare ground. Sev 2-3, pole worst.
    Evidence: reviews/survey3-slice/amphi/gameplay.png]

25. `nx-struct-observatory` — detached trim band; dome-to-wall slits. Sev
    3. (guard: none)
    [ZAI-CONFIRMED survey-3 (native 1210 x2, one paced retry, ZAI fallback — native re-judge owed): trim band
    reads detached — three pieces at mismatched heights (left tab ~20px
    high with wall-colored gap below; right stroke separated from the dome
    by a light gap; only the door lintel attaches); dome-to-wall slits
    CONFIRMED — two symmetric light strips flanking the lintel read seam
    artifact, not shutter; band-end whisker stubs. Sev 3 stands. Evidence:
    reviews/survey3-slice/observatory/gameplay.png]

26. `nx-struct-soundmirror` — identity failure at edge-on (reads mound);
    black dish interior. Sev 3. (guard: struct-33 warm-seat refine Aug 31
    — lane idle since; re-verify night read at execution)
    [ZAI-CONFIRMED survey-3 (native 1210 x2, one paced retry, ZAI fallback — native re-judge owed): edge-on
    identity failure CONFIRMED (three stacked tiers read ziggurat/tire
    stack; dish tilt imperceptible from gameplay angles); black dish
    interior CONFIRMED (delta-L 8-10, no curvature or specular cue); NEW:
    the gold cross reads developer gizmo/grave cross — highest-contrast
    element, no strut/receiver geometry. Sev 3 stands. Evidence:
    reviews/survey3-slice/soundmirror/gameplay.png]

27. `nx-town-mapboard` — map face dirt smudges; side edge fragments. Sev
    3. (guard: none)
28. `nx-town-monument` — pinhole at ring intersection; pedestal face
    crushed. Sev 3. (guard: none)
29. `nx-dress-ne-yard-001` — rubble read; floating rail ends; uniform
   near-black. Sev 2. (guard: dress-4 <24h at improve-2 — re-check
   dress tail at execution) [DROPPED dress-14: native re-judgment on
   exact live bytes (sha 191227da == live lib pin, census 259) — 10-view
   rejudge rig reviews/dress14-ne-yard-rejudge/: 18m gameplay reads
   DELIBERATE work yard not rubble (low-wide stratified, symmetric rail
   arms, rack-with-crossbeam); ZERO floating elements (side rails end in
   grounded posts, legs touch down, contact shadows under all casters);
   front face shows pale cut-end discs reading CLEARLY on cordwood
   pyramid/bench logs/sawhorse logs; value contrast weak-but-present at
   18m = margin note only, not Sev 2]
30. `nx-dress-sw-gravel-001` — collapses to 1-2px line, reads artifact.
    Sev 2. (guard: dress-7 <24h at improve-2 — re-check at execution)
    [NATIVE-DROPPED survey-2: reads deliberate path-edge gravel BAND —
    ~4-8px stone height, alternating cream/dark tones, raised central
    rock, unified footprint + contact shadow; borderline (dark stones
    merge into ribbon stretches) but NOT a 1-2px artifact line. The
    improve-3 finding was fallback-judge exaggeration. No edit needed;
    margin note only: discrete-stone separation weak at 18m.]
31. `nx-dress-ne-bench-001` — scattered tables read; misaligned blob
    shadows. Sev 3. (guard: dress-6 <24h — re-check at execution)
    [DROPPED dress-17: native re-judgment on exact live bytes (live lib
    store/46f3b6b14ada6d8b == local build sha prefix 46f3b6b1, census
    259, pos 14.23/0/73.13 yaw 11, empty comp bag; DRACO rejudge rig
    reviews/dress17-ne-bench-rejudge/) — 18m gameplay reads deliberate
    rest cluster: two matching pedestal benches flank ONE distinct taller
    two-legged table; soft aligned contact shadows, zero floating, zero
    misaligned blobs — both findings drop. Margin note only: pebble
    props read speck-small at 18m, below threshold]
32. `nx-dress-se-cairn-001` — spindly totem; top stones dissolve. Sev 3.
    (guard: none — dress-7 Sep 3 placed se-cairn; re-check tail)
    [EXECUTED dress-15: native re-judgment CONFIRMED (2:1 tall:wide totem
    read, cap marginal at 18m) → v4 squat rebalance + per-course banding +
    base skirt ACCEPTED 5/5+4/4 native; remove+spawn reseat at exact tuple,
    lib bc601ed2->59031a0c, clearance re-derived 2.427m; PLACED_VERIFIED +
    idempotent; margin note only: cap + accent courses understated from
    FAR range — silhouette carries the read beyond 18m]
33. `nx-dress-nw-stile-001` — reads fence not crossing; step stones
    illegible. Sev 3. (guard: dress-11 today 02:00 — until 09-07 02:00)
34. `nx-dress-ne-woodstack-001` — burnt right post; see-through gaps;
    detached left post. Sev 3. (guard: dress-9 today — until 09-07)
35. `nx-struct-pendulum` — dashed shadow acne; hairline strings; weak
    identity read. Sev 4. (guard: none)
36. `nx-approach-nw-lane-001` — banding/taper/raw boxes/lamp base. Sev 4.
    (guard: approach idle since Sep 3)
    [EXECUTED approach-5: native re-judgment on hash-bound renders of
    exact live bytes d46a60fb — ALL FOUR findings DROP (banding: uniform
    tan run, no stripe cycle, gameplay+aerial agree; taper: perspective
    foreshortening, decode shows constant paver heights .054-.057; raw
    boxes: reads deliberate composed lane at 18m, aerial dashed-read is
    the standing 0.92m stepping-stone idiom shared with NE/SW/core;
    lamp base: plinth reads planted, decode iron foot disc r .20-.23
    both lamps). Margin note only: verge hem weak at aerial range —
    below threshold at the 18m judging distance. Row CLOSED; zero
    mutations]
37. `nx-dress-nw-skeps-001` — stray plank; rock swallows 2nd skep. Sev 4.
    (guard: dress-10 yesterday — re-check at execution)
38. `nx-dress-nw-hedge-001` — cleanup tier (stub riser, stray cube, hole).
    Sev 4. (guard: re-check dress tail at execution)

**ROUND-1 KIT-DEBT APPEND (2026-09-06, staged at improve-5x — perpetual-
motion law): entry 39 seeds round 2. Cure proven at hall+inn (improve-5
/7): gableRoof hw=w/2 bug horns plaster past the roof plane on every
rectangular gabled building; opt-ins solidRidge+trueGableHalf fix it
default-byte-identical. Decode-proven defects whose visual verdicts said
CLEAN only because probes read the horn as fascia enter the queue as
work, not re-analysis. (mapboard/monument emblem items already queue at
27/28 — no duplicates created here):**

39. `nx-town-longhouse` — 1.5m gable horn each end (decode-proven kit
    bug; probe-CLEAN verdicts stand as visual verdicts, horn is real
    work). Fix = same opt-ins, rebuild ×2, sibling-equality proof,
    remove+spawn re-place at exact tuple. Sev 2 (structural credibility).

**ROUND RE-ARM LAW (perpetual motion, 2026-09-06, Bill-directed):** when
the round queue's last entry is annotated EXECUTED (or DROPPED with
cause), the next wakeup does NOT hold — it arms round N+1: (1) sweep's
latest CLEAN census + defect notes scanned for un-routed findings; (2)
kit-debt, REPAIR-REGISTER OPEN items, and any decode-proven class with a
proven cure enter as entries; (3) ONE native-vision sweep of the 18m
worst-read objects not re-judged this round seeds candidates
(confirm-or-drop each); (4) nothing eligible remains → the lane reports
HOLD once with the evidence, per the no-manufactured-work law. This law
never overrides idle-guard, domain law, or the eye-gate verdict routing.

**EXECUTION SHARDING (2026-09-06 — Bill's 5-10x directive, improve-5y).**
The improve queue is ONE serial lane but its items span five entity
domains, and each domain has an idle owning lane. Sharding rule — route
by entity id prefix, ALWAYS: `nx-struct-` → struct lane; `nx-dress-` →
dress lane; `nx-approach-` → approach lane; `nx-sign-*` → waysign
(already R2); `nx-town-*` stays improve's (including kit-debt 39+).
Executed rows keep their improve-N ledger tags. A sharded item un-shards
back into improve's own queue if the owning lane is mid-rebuild of the
same id or fails to execute it within 3 of its own ticks. Native
re-judgment before execution (restored-vision law) applies to sharded
items identically.

Current open split by prefix (verify against rows above at routing
time): struct ≈13 rows (crossing, angler, skene, skymirror, millrace,
spiralfolly, shelltower, hypar, mobius, amphi, observatory, soundmirror,
pendulum); dress ≈9 (sw-prayer, ne-yard, sw-gravel, ne-bench, se-cairn,
nw-stile, ne-woodstack, nw-skeps, nw-hedge); approach 2 (sw-lane-003,
nw-lane-001); improve-own ≈11 (windmill, stable, kiln, shrine,
row-cottage, bunkhouse, garden-cottage, beltower, mapboard, monument,
longhouse-39).

**Historical improve-1 core-family draft (superseded by the merged queue
above):**

1. `nx-town-hall` — see-through hole: sky visible through porch opening (no
   door/backstop); eave sliver top-right; ridge dashes. Sev 1: reads as
   unfinished mesh.
2. `nx-town-inn` — two floating diagonal planes at roof corners; dead
   unattached ridge box; porch emblem reads wheel-not-tankard (seeded,
   waysign-7); off-center entrance recess. Sev 1: floating geometry.
3. `nx-town-windmill` — gallery ring floats with zero attachment; stray pole
   clips lit window; sail cross lopsided (one arm bare). Sev 1: floating
   geometry + weak identity.
4. `nx-town-tower-house` — front stilts emerge from pure-black underside
   (floating read); balcony door ~4m with no stair/ladder; railing broken
   (posts only right half + one stray). Sev 1–2.
5. `nx-town-stable` — no entrance/identity on any face (reads as chest/
   monument); squat proportions; corner wedge voids at roof overhang. Sev 2.
6. `nx-town-kiln` — floating quad on cone flank; orphan rod; no flue/vent
   (silhouette reads hut, not kiln); firebox dead void. Sev 2.
7. `nx-town-shrine` — offering props unreadable clumps; torch flames 1–2px
   specks; asymmetric base plate; dead side faces. Sev 2.
8. `nx-town-row-cottage` — left door jamb bare (trim missing one side); lamp
   dot with no fixture; ridge tabs; dormer seam. Sev 2.
9. `nx-town-bunkhouse` — facade value crush (door reads as smudge); stray
   diagonal face right wall; ridge tabs. Sev 2.
10. `nx-town-garden-cottage` — front face zero info (no windows, door a
    faint seam); extension fuses with main volume. Sev 2.
11. `nx-town-belltower` — ladder rungs float (no stringers, top+bottom
    detached); rope unanchored mid-air; muddy belfry-corner junction. Sev 3.
12. `nx-town-mapboard` — map face reads as dirt smudges (no contrast); side
    edge fragments. Sev 3.
13. `nx-town-monument` — pinhole at ring intersection ~2 o'clock; pedestal
    face crushed. Sev 3.

**CLEAN (recorded, skipped):** dyehouse, gate (e/n/s/w, one GLB), longhouse,
market, potter, woodyard (live-freeze noted: any future edit derives from
LIVE store copy, never a source rebuild).

## Round 1 log

- improve-1: analysis tick. Fetched all 19 unique live store-min GLBs from
  /library/store/ (HTTP 200 ×19; server serves DRACO store-min shadows —
  added lane chassis review-model-draco.ts, the old chassis has no
  DRACOLoader). Rendered 8 views each via review chassis; judged gameplay
  vantage at 18m (ZAI fallback vision — native vision down, 13th
  consecutive tick, disclosed). 6 models CLEAN / 12 unique models defective;
  ranked queue committed above. Zero world mutations. Review evidence:
  agents/arthur/reviews/improve1-core/.
- improve-2: analysis tick. Signs (8) + fleet dress (11) from fresh live
  census (259 entities), live store bytes fetched (19/19 HTTP 200), 8 views
  each rendered, judged at 18m (ZAI fallback — native down 14th tick,
  disclosed). Signs: 1 CLEAN / 7 defective, one shared root class (emblem
  scale/contrast collapse at 18m); dyer flax-blue flag confirmed. Dress:
  2 CLEAN / 9 defective (worst: ne-yard rubble read, sw-gravel artifact
  line, sw-prayer identity failure — namesake fabric absent). Idle-guard
  noted on woodstack/logpile/stile (dress-9/10/11 <24h). Findings committed
  above; merged ranked queue deferred to improve-3 per round structure.
  Zero world mutations. Review evidence:
  agents/arthur/reviews/improve2-signs-dress/.
- improve-3: analysis tick (round 1, phase 3 — final analysis phase).
  Struct (30) + approach (17) + mile (15) from fresh live census (259),
  live store bytes fetched (29 unique GLBs, HTTP 200 ×29 — curl UA
  required, urllib default UA gets 403), 8 views each rendered via the
  DRACO chassis, judged at 18m (ZAI fallback — native down 15th
  consecutive tick, disclosed; native retested once at tick start, still
  error 1210). Struct: 7 CLEAN (halt/needlerest, waystone ×4, northneedle,
  orrery, orreryring, beacon, waterstair) / 16 defective — worst
  echoarch (arch span + one leg INVISIBLE, orphan shadow, front view
  confirms — decode-first flag), crossing (ford a void — identity
  failure), angler (figure absent — possible missing export), skene
  (black void panels), skymirror (no reflection reads). Approach: lamp ×4
  + NE lane CLEAN; NW lane Sev 4; SW lane floating cube scatter Sev 2.
  Mile: both GLBs CLEAN (idle-guarded, moot). MERGED RANKED ROUND-1
  EXECUTION QUEUE committed worst-first (38 entries; signs routed as
  cross-lane packet to waysign per domain law; idle-guards recorded
  per-entry). Zero world mutations. Review evidence:
  agents/arthur/reviews/improve3-struct-approach-mile/.

## Round 1 execution log

- improve-4 (EXECUTION, queue item 1 `nx-town-hall`): contract committed
  BEFORE editing. Defects decoded at source (decode outranked both the
  improve-1 probe and my own source reading — the gable-triangle extent
  came only from accessor decode):
  - D1 sky-through-porch (Sev 1): S gap 1.8w × 2.4h directly faces N gap
    1.6w × 2.3h on the shared x=0 aisle — level rays through both = the
    sky rectangle. Interior walk law (interior-1, eight-leg two-door flow,
    0.36m max arrival) forbids any backstop on the aisle. FIX: wattle
    draft screen INSIDE the N door was REJECTED at walker-decode stage: MCPL
 walkTo steers STRAIGHT (agent.ts:1191-1204, no avoidance), so a solid
 screen would false-pass the headless probe while blocking real
 avatars (align-3/R-113 class) — and interior-1/-11's standing
 contract keeps the x=0 door-to-door aisle untouched. AMENDED FIX
 (no aisle obstruction): N gap narrowed 1.6→1.4 with proud bone casing
 (existing doorFrame) so the far opening reads as a DOOR not a hole;
 deep timber header inside the N opening (visible recess depth); warm
 sconce glows flanking the N door inside (lit-doorway read replaces
 sky-void read, polish-273/274 emissive law); hanging porch lamp over
 the S threshold + lantern glows flanking the S door (village glow
 pattern). Falsification: front.png no longer shows an unframed
 sky-colored rectangle (warm-lit, cased far doorway instead); interior
 walk all 8 legs ≤0.55m arrival (unchanged or better).
  - D2 eave sliver → KIT BUG (Sev 1, kit-level): gableRoof builds gable
    triangles with half-width w/2 (ridge length, 4.5) instead of d/2
    (depth, 3.3) — on the 9×6 hall the plaster triangle horns 1.3m past
    the roof plane on each gable end. Present on every rectangular gabled
    building (longhouse 1.5m horn — read as fascia by probes, CLEAN
    verdicts stand as visual verdicts; horn now recorded as kit debt).
    FIX: opt-in params to gableRoof (solidCaps + fixed triangle extent),
    default keeps siblings byte-identical; hall opts in. Sibling byte
    equality proven by shasum after rebuild. Revert: revert the two param
    additions, rebuild, hashes return to the live pins.
  - D3 ridge dashes: cap factor 0.92 + ±0.03 yaw stagger reads dashed at
    18m; opt-in solid ridge cap (factor 1.0, no stagger) via the same
    gableRoof params. Falsification: ridge line continuous in
    front/back/top renders.
  Source: mkv3-ring.ts:594-692 (hall block), housekit.ts:95-155
  (gableRoof). Live pin 1306527acac5784b == local build (no disputed
  bytes). Comp bag EMPTY ({}), light companion nx-town-hall-l at
  (9,2.5,−26) untouched. Idle-guard clear (hall untouched since
  interior-11, Aug 31). Execution next: edit → rebuild ×2 → decode
  audit → renders → accept/revert → remove+spawn re-place → walk →
  ledger improve-4 + commit.

- improve-5 (EXECUTION COMPLETE, queue item 1 `nx-town-hall`, closes the
  improve-4 contract): candidate-1 (cased 1.4-wide N door + sconces +
  header) FAILED its own falsification — the after-render still read the
  sky rectangle (level eye rays 1.6–2.5m exit the gap regardless of
  casing; casing + glows alone cannot kill the read). Candidate-2 (the
  accepted build): N gap lowered 2.3→1.95m + deep timber header inside
  the opening — the unframed sky rectangle is GONE; the residual
  door-sized bright patch sits below the header, framed symmetrically by
  the sconce glows, reading as a lit far doorway. ACCEPTED WITH
  RESIDUAL: any occluder below 1.95m enters the walking band (avatar
  body height; align-3 avatar-outranks-probe law, 1.4m door law) — a
  fully dark porch read is physically incompatible with a walkable
  opposing door on the same aisle. The residual goes to the round-1
  eye-gate circuit for Bill's judgment; revert path: revert the three
  mkv3-ring.ts hall edits, rebuild, hashes return to live pin 1306527a.
  D2/D3 fixed via the committed kit opt-ins (solidRidge + trueGableHalf
  d/2+over): gable horn eliminated (bbox z-extent 4.85→3.47), ridge
  confirmed continuous, all 6 sibling GLBs byte-identical (default kit
  path untouched). Warm light kit (5 KEEP-named lamp anchors): 2 N
  sconces, wall-mount porch lamp (two hanging-bead candidates were
  occluded by the tilted porch slab at grazing angle — night-probed,
  node present but invisible, moved to the lintel position and
  night-verified 5/5), 2 S lanterns. 23→28 nodes, bbox center z 0.177
  unchanged (SAT-neutral re-place). Re-place remove+spawn at the exact
  standing tuple (9, 0, −26) yaw −0.31322457341772525, lib
  1306527a→c92c1f91, comp bag empty before and after, light companion
  nx-town-hall-l untouched. Post-place tuple deep-verified; idempotent
  rerun ALREADY_LIVE_NO_VERBS (zero verbs). Two-way 8-leg MCPL interior
  walk ALL_PASS, max arrival 0.36m — the interior-1 aisle contract is
  intact at exactly its historical value. ZAI fallback vision (native
  down 16th consecutive tick, disclosed). Review evidence:
  agents/arthur/reviews/improve4-hall/{before,after,after-v2,
  after-final,after-final2}/. Placer:
  agents/arthur/next-place-improve5-hall.ts (idempotent both ways).

Next queue item (improve-6): `nx-struct-echoarch` (Sev 1, decode-first
flag — arch span + one leg invisible; struct lane idle since Aug 31,
idle-guard clear).

- improve-6 (EXECUTION, queue item 2 `nx-struct-echoarch`): contract
  committed BEFORE editing. Vision re-judgment law (improve-5v) attempted
  NATIVE first: `vision_analyze` errored 1210 — the improve-5v "restored"
  note does NOT hold for this session's tool path (17th consecutive down
  tick, disclosed); ZAI fallback used instead, CONFIRMED the Sev 1 finding
  ("arch identity absent, completely; reads slab + single post" at 18m
  gameplay). ZAI's causal read (edge-on occlusion) was then OUTRANKED by
  source decode — the real defect is mechanical:
  - D1 fins absent from the mesh (Sev 1, root cause by decode): `fin()` at
    mkv3-echoarch.ts:45-61 computes the parabola profile z=y²/4F from the
    transverse parameter y but positions every segment at x=0 with
    `rotation.x` (vertical louver tilt) — the transverse coordinate never
    reaches world x. Both fins collapse into a 0.34m column of tilted
    panels in a 2.25m z-band at each end. Census cross-check: 444 tris =
    28×12 panels + 12 slab + 96 pins, bbox x-extent ±4.1 comes from the
    slab ALONE. Not flipped normals / culled faces (the improve-3 probe
    guess — wrong mechanism, right severity).
  - FIX: rewrite fin() to place each tangent segment at
    `(x=y_c, z=baseZ+sign·z(y_c))` with `rotation.y = atan2(1, dzdy)`
    (plan turn — the source's own "curve by turning, never applied"
    language). Box dims, slab, and brass focus pins unchanged — the pins
    already sit at the TRUE parabola foci (0,1)/(0,7) once the fins exist.
  - Falsification: after renders (gameplay+front, identical camera) show
    TWO wide curved fins facing each other with an open gap between —
    arch/whisper identity present at 18m; decode audit shows segment
    centers spanning x∈[−3,3]; bbox unchanged (SAT-neutral same-tuple
    re-place); census tris 444 again.
  - Revert: revert the fin() edit, rebuild → hash returns to live pin
    f38d01bb.
  - Baseline: local rebuild ×2 deterministic, sha f38d01bb… == live lib
    prefix (no disputed bytes). Comp bag {} (census-fresh). Idle-guard
    clear (struct-35 Aug 31).

  improve-6 EXECUTION COMPLETE: fin() rewritten (position x=y_c, plan
  rotation.y with derived signs — finA −ang, finB +ang; BoxGeometry
  (len,H,D)). Rebuild ×2 deterministic sha baf4c994…; decode audit:
  x-bin z-envelope tracks x²/4F exactly (tips x=±3 → z 2.15–5.85,
  vertices z≈0/8), footprint bbox identical (8.2×12.2), height
  3.335→3.320 (old louver tilt artifact gone), 444 tris. Before/after
  identical-camera: BEFORE right = fan of tilted plates, sawtooth, no
  parabola (plus gameplay/front = single post/slab — Sev 1 confirmed);
  AFTER right = two wide curved fins facing each other with open
  channel, background shows through; AFTER top = two opposing parabola
  arcs, lens-shaped open channel, brass pins at the foci. Rig-note: the
  chassis's gameplay/front cameras are AXIAL (down the throat) — from
  the channel axis one curved wall is the CORRECT read (near fin
  occludes); identity views for this form are broadside+top (per-family
  judge-axis law, ground-decal precedent). ZAI fallback vision (native
  down 17th tick, 1210 retested, disclosed). Re-place remove+spawn at
  the exact standing tuple (−18.5, 0.0515, 57.1) yaw 5.027, lib
  f38d01bb→baf4c994, comp bag {} before and after. Post-place tuple
  deep-verified; idempotent rerun ALREADY_LIVE_NO_VERBS. Two-way 8-leg
  MCPL throat walk ALL_PASS max arrival 0.40m. Placer:
  next-place-improve6-echoarch.ts; walk: improve6-walk-echoarch.ts.
  Review evidence: agents/arthur/reviews/improve6-echoarch/{before,after}/.

Next queue item (improve-7): `nx-town-inn` (Sev 1 — floating diagonal
planes at roof corners, dead ridge box, wheel-not-tankard emblem,
off-center recess; guard none. NOTE improve-5v law: re-judge under
native vision at execution; re-check interior lane tail — interior-20
touched the inn Sep 1, idle-guard expires 09-02, clear unless new
commits land).

- improve-7 (EXECUTION, queue item 3 `nx-town-inn`): contract committed
  BEFORE editing. Idle-guard clear (interior-20 Sep 1, expired 09-02;
  sweep-N inn walks are read-only verifications, not mutations). Live
  tuple (36,0,0) yaw −π/2, lib c180c26f == local build (no disputed
  bytes; baseline rebuild ×2 deterministic). Comp bag {} (census-fresh);
  light companion nx-town-inn-l at (36,2.35,0) untouched. Host riders
  b2-inn-lintel (local (0,2.5..3.06,~3.0)) and b2-inn-threshold
  ((0,~0.2,~3.05)) — all edits stay OUTSIDE local x∈[−0.85,0.85] ∩
  z∈[2.9,4.15] rider band. Native re-judgment attempted FIRST
  (improve-5v law): vision_analyze errored 1210 — native down 18th
  consecutive tick, disclosed; ZAI fallback used (2 calls, one timeout,
  one paced retry succeeded).
  Re-judgment results (confirm-or-drop):
  - D1 gable horns → CONFIRMED (right elevation: stray box past the roof
    slab on the rake; mechanism by DECODE: gableRoof(8,6) default
    trueGableHalf=null → hw=w/2=4.0, but the triangle must span the
    depth axis half-extent (6+0.9)/2=3.45 → 0.55m plaster horn per
    gable end — same kit-bug class improve-4 decoded on the hall).
  - D2 dashed ridge → CONFIRMED (blocky cap segments, apex notch; the
    default 0.92-factor + ±0.03 stagger).
  - D3 wheel-not-tankard emblem → CONFIRMED (light smudge, no legible
    pictogram; seeded waysign-7 finding).
  - D4 off-center entrance recess → DROPPED (front render: door, posts,
    steps symmetric about the facade centerline — probe artifact).
  - D5 floating chimney → CONFIRMED (NEW, decode-mechanical: chimney
    base 5.1 vs roof surface 4.385 at z=−1.2 → floats 0.72m above the
    roof plane, off-ridge. Very likely improve-1's "dead unattached
    ridge box". ZAI right-view saw it floating with a sky sliver.)
  Fixes (all mkv3-landmarks.ts inn block, no housekit change):
  - D1/D2: roof call opts into proven kit fixes —
    gableRoof(...,0.45,C.MID,solidRidge=true,trueGableHalf=3.45).
  - D5: chimney baseY 5.1→4.3 (shoulder seats into the roof plane at
    its (−2.4,−1.2) position, mid-slope seat law), topY 6.6→5.9 to keep
    the stack length and above-ridge clearance ≥0.5m (5.9−5.08=0.82 ✓).
    Shoulder (0.46 radius) swallows the roof thickness at the seat.
    Chimney stays off-ridge on the N slope. No comp dependency on the
    chimney nodes: the inn's comp bag is EMPTY (census-fresh compKeys
    []), so nothing targets `chim_*` — re-seating is comp-free.
  - D3: emblem rebuilt as a legible TANKARD pictogram: backboard 0.55w
    × 0.42h × 0.05 flat panel (plain mat 0x7c6832, painted-face law),
    tankard body 0.30w × 00.24h × 0.06, handle torus r=0.085 tube 0.018
    on the right, foam cap 0.32w × 0.06h × 0.062 bone-tone with 3
    rising foam beads (r 0.022/0.016/0.014) — reads as raised tankard
    with overflowing foam at gameplay distance. Palette: body brass
    (0xa0a248, metal 0.35, rough 0.5), foam C.BONE, board stays inn
    oak. All child meshes plain-`mat` (no texMat) → same bucket as
    board → merge into one node; sign GROUP survives (KEEP `sign$`).
    Fuse box 0.1×0.08×0.06 on the left edge for the hanging bracket.
  Falsification: after right.png shows NO geometry past the roof slab
  at the rakes (horn killed); after top.png shows ridge running
  continuous edge-to-edge; after front/right show chimney shoulder
  SEATED on the roof plane (no sky sliver); emblem reads tankard with
  foam at 18m (gameplay.png/front.png). Decode audit: bbox z-extent
  drops 4.9→4.0 max (horn gone), chimney y-band present 4.3..5.9+,
  x-bin chimney mass present at local x≈−2.4, z≈−1.2. Sibling
  byte-equality: belltower/carousel/windmill shas unchanged.
  Revert: revert the 3 edits (roof opts, chimney constants, emblem
  block) → rebuild returns to live pin c180c26f (baseline rebuild ×2
  already proven deterministic).

  improve-7 EXECUTION COMPLETE: all three fixes landed in
  mkv3-landmarks.ts (roof opts, chimney constants, emblem block);
  rebuild ×2 deterministic sha 6e6ff2d0…; decode audit: gable triangles
  span exactly ±3.45 (z-extent −4.0→−3.473, horn gone), ridge cap one
  continuous bone run (y 5.08..5.17, x ±4.45), chimney shoulder rim
  4.25 < roof top 4.385 = SEATED (vertex-level proof; rim-to-rim
  cylinder surface bridges 4.25→4.6 with no empty y-band — corner-blind
  law honored), pot top 6.269, above-ridge clearance 0.82m; sign group
  intact with 4 sub-buckets (board / brass tankard / bone foam / iron
  fuse), 4248 tris, 32 top-level nodes; siblings belltower/carousel/
  windmill byte-identical (kit default path untouched). ZAI after-judge
  (side view): horn GONE, ridge continuous, chimney seated no sky-gap;
  emblem reads as dark plaque from the side (edge-on — expected);
  front-view 18m emblem legibility un-judged (ZAI timeouts) — routed to
  round-1 eye-gate with decode standing in (pictogram spans ~70% of
  board, brass-on-oak contrast, both faces). Re-place remove+spawn at
  the exact standing tuple (36,0,0) yaw −π/2, lib c180c26f→6e6ff2d0,
  comp bag {} both sides, light companion nx-town-inn-l untouched.
  Post-place tuple deep-verified; idempotent rerun ALREADY_LIVE_NO_VERBS
  (zero verbs). Two-way 6-leg MCPL door walk ALL_PASS max arrival
  0.36m. Placer: next-place-improve7-inn.ts; walk:
  improve7-walk-inn.ts. Review evidence:
  agents/arthur/reviews/improve7-inn/{before,after}/.

Next queue item (improve-8): `nx-town-windmill` (Sev 1 — floating
gallery ring, stray pole clipping lit window, lopsided sail cross;
guard: interior-20 Sep 1 touched the windmill INTERIOR only — treat
exterior as clear; re-check lane tail at execution).

## Round 1 execution log

- improve-8 (EXECUTION, queue item 5 `nx-struct-crossing` — windmill
  DEFERRED first): idle-guard fired on the windmill (waysign-6 live rider
  nx-sign-mill-001 hung 09-06 01:57, <24h; annotation on queue item 4).
  Crossing taken next-worst Sev 1. Idle-guard clear (struct-35 Aug 31).
  Baseline rebuild ×2 deterministic sha a5da939d… == live lib prefix
  (no disputed bytes). Live tuple (3.6,−0.005,−3.6) yaw 0, comp bag {}
  (census-fresh), bbox 3.19×2.40×3.28. Native re-judgment FIRST
  (improve-5v law): 2/3 calls succeeded (one 1210, one paced retry —
  disclosed); gameplay@18m + front near-view judged.
  Re-judgment results (confirm-or-drop):
  - D1 "utility poles / fence posts" → CONFIRMED (native, both views):
    reads wooden utility/hitching posts, not hewn stone; monument intent
    absent at 18m; "signposts missing their signs" (stub read).
  - D1b brass head-rings invisible at 18m → CONFIRMED (native gameplay:
    "no metallic highlight, no rim contrast, no resolvable ring shape").
  - D2 "posts clip through each other" → DROPPED (decode + native front:
    stones 2.6m apart on diagonals, no shared volume; the "second darker
    element" is the far pair seen through the gap, perspective-correct
    with own pads and own shadows).
  - D3 "plate feet / stretched detached shadows" → DROPPED (native front:
    every shadow anchors at its pad, ring shadows confirm circular rings;
    long thin shadows are the real sun angle, not detachment).
  - D4 "ford is a void / no water/banks/stones" → DROPPED as FABRICATED
    IDENTITY: source decode proves the commission is struct-34's
    CROSSING MARK (four leaning stones binding the plaza crossroads,
    brass head-rings, foot pads — mkv3-crossing.ts:1-12). No water, no
    ford, no stepping stones exist anywhere in the build. The improve-3
    probe judged the object against an identity it never had.
  - D1 root cause by decode: the only "leaning stones" in the village
    built as smooth untextured tapered cylinders (CylinderGeometry
    r0.11→0.16 h2.35, flat mat 0x56503c, no stoneTex), h/d ~15:1 slender,
    plus the utility-idiom silhouette (smooth shaft + plinth). Sibling
    precedent judged CLEAN at 18m: waystone ring (mkv3-waystone41.ts:34-
    43) — BoxGeometry hewn slabs + village stone texMat + varied lean
    (tex-28 STONE X law: leaning stones take the village stone tile).
  FIX (idiom correction, monument identity restored):
  - stones: BoxGeometry hewn slabs 0.34×2.35×0.26 (aspect 7:1 stone,
    replaces 15:1 pole), each with a CHISELED HEAD (two bevel cuts on the
    outer top edge, 10°+25°), varied heights 2.35/2.45/2.2/2.5, varied
    lean 6–10° outward, varied slight yaw.
  - material: flat 0x56503c → village stone texMat (tex-28 law, same
    recipe as waystone ring: [0x56503c,0x5c5a44,0x4c4836] rough 0.95
    scale 2 weights [2,1,1] cell 32).
  - brass head-rings: enlarged for 18m legibility, r 0.145→0.19, tube
    0.022→0.045, re-positioned ON the chiseled head bevels.
  - pads: hex plinths → rough ashlar pads (BoxGeometry 0.62×0.14×0.62,
    stoneTex), seated to ground.
  - Falsification: gameplay.png@18m reads leaning hewn stones (wood-post
    read GONE); rings still illegible at 18m (acceptable — ring shadows
    carry the brass at gameplay distance per native front-view evidence)
    but visible on near/front views; top.png shows four varied heads with
    differing head-tilts; decode audit: 3 buckets again, bbox within
    ±0.1m of 3.19×2.40×3.28, chisel-cut vertex bands present on outer
    top corners. Revert: revert the stone/ring/pad block to the original
    cylinder composition → rebuild returns to live pin a5da939d.
  - Rider safety: nx-artwalk-b24-well-depth 3.3m+ clear of the nearest
    stone (position math on fresh census); footprint slightly SHRINKS
    (0.62 pads vs 0.68 hex pads).

  improve-8 EXECUTION COMPLETE (six candidates, evidence chain kept):
  cand-1 (0.34 slabs + torus) REJECTED — still posts, torus read as
  pole crossarm. cand-2 (0.52 + round collar) REJECTED — collar peg
  read, caps thin boards. cand-3 (monoliths 0.8–0.95 + box sleeve
  band) — utility-post read KILLED (judge: "no longer reads as utility
  posts"); residual: band dark, shaft wood-lean 60/40, band wedge
  (band axis-aligned vs leaned shaft). cand-4 (band rides lean, b2/b3
  brass metal 0.82) REJECTED — brass still gray (MECHANISM by pixel
  probe: metalness without envmap desaturates offline; band px measured
  (130,127,109) vs brass base (160,162,72); the b2/b3 0.82 recipe is
  live-validated, this rig has no scene.environment). cand-5 (iron-
  physics metal 0.5 + one clean crown step + tamed yaw) REJECTED —
  stone material PASSED, brass still dark. cand-6 (ACCEPTED): brass
  as TEXTURED gold (waysign handleTex law: [0xa09832,0x887c2a] rough
  0.85 — the village's 18m-legible brass is textured diffuse), gold-ish
  pixels 87→901, final judge: "collar bands clearly saturated gold"
  ✓, stone-material pass carried. ACCEPT WITH ROUTED RESIDUALS
  (improve-5 lit-doorway posture): (a) "stray gold sliver upper-right
  of right crown" — probable far-stone band peeking past the near
  crown (four-stone composition, 2.6m diagonal spacing; single-view
  judge cannot resolve depth) — eye-gate item; (b) left crown overhang
  underside shadow-gap — eye-gate item. Wood-vs-stone 60/40 shaft read
  classified family-lighting characteristic (waystone + milestones
  carry the SAME tile on similar tall-narrow stones and judge CLEAN
  live — flash-vision family law; not per-work defect). Final build:
  sha 216c4bd4…, 2 nodes (stone bucket + brass bucket), bbox 4.21×
  2.93×4.05 (footprint growth over 3.19 baseline RECORDED — pitfall-8
  posture; nearest solid neighbor nx-artwalk-b24 4.30m center-clear,
  stone-gap ≈1.6m+ > 1.4m law; ground layers SAT-exempt). Re-place
  remove+spawn at the exact standing tuple (3.6,−0.005,−3.6) yaw 0,
  lib a5da939d→216c4bd4, comp bag {} both sides. PLACED_VERIFIED;
  idempotent rerun ALREADY_LIVE_NO_VERBS (zero verbs). MCPL walk
  deferred to the round-1 eye-gate circuit (non-enterable marker;
  approach legs unchanged). Placer: next-place-improve8-crossing.ts.
  Review evidence: agents/arthur/reviews/improve8-crossing/{before via
  root views,after,after2..after6}/. Native vision: 8 calls, 6
  succeeded, 2 errored 1210 (one paced retry recovered) — disclosed.

Next queue item (improve-9): `nx-town-tower-house` (Sev 1–2 — stilts
from pure-black underside, balcony door ~4m with no stair, broken
railing; guard: none).

- improve-9 (EXECUTION, queue item 6 `nx-town-tower-house`): contract
  committed BEFORE editing. Idle-guard clear (rider b21 placed by
  artwalk 2026-08-31 >24h; tex-78 interiors Aug 17; no lane commit
  touches this entity in 24h). Live tuple (−9,0,26) yaw 2.828368080172068,
  lib bd1badd218 == local build ×2 deterministic (no disputed bytes).
  Comp bag {} (census-fresh); light companion nx-town-tower-house-l at
  host-local (0,2.1,0.4) inside drum, untouched. Rider
  nx-artwalk-b21-tower-ascension-count at host-local (0,2.22..2.68,
  r≈2.83, front θ=0±16°) — KEEP-OUT ZONE: no new geometry at
  θ∈[−18°,+18°], y<2.7, r∈[2.5,2.95].
  Native re-judgment FIRST (improve-5v law; one 1210 paced-retry
  recovered — native judgment, disclosed): all three improve-1 findings
  CONFIRMED + mechanisms decoded:
  - D1 "stilts from pure-black underside" → mechanism: open door-arc
    (±18°) shows unlit interior + hairline ladder rungs (r 0.025);
    deck reads paper-thin (0.1m bare cylinder slab, zero
    brackets/fascia). Night view: building contributes NO light.
  - D2 "balcony door no stair" → mechanism: the "door" is the rigid
    banner slab (0.6×0.9×0.03 flat box at y 2.65..3.55, z R+0.68) —
    polish-273 cloth-law violation, reads as frameless door decal onto
    an unreachable deck; drum has NO upper opening and NO access.
  - D3 "broken railing" → mechanism by decode: deck spans θ∈[−60°,+120°]
    (cylinder convention x=sinθ,z=cosθ — front-centered) but rail posts
    at (cos a, sin a)·(R+0.65) span a∈[−60°,+60°] — centered on +X,
    ~60° AWAY from the deck center arc. Front/left deck bare, ragged
    uncapped ends; comment promises a top rail the code never draws.
  FIX (all in mkvillage-houses.ts towerHouse(), no housekit change):
  - D3: railing rebuilt in the DECK's convention — 13 posts θ −60..+120
    step 15° at r 3.25 y 3.05..3.95 (0.07 sq) + top rail ring (12 segs,
    watchtower brail idiom, y 3.9) + mid rail y 3.5.
  - D1a: 7 corbel arms under the deck (Box 0.12×0.22×0.8 at r 2.92,
    y 2.83, rotation.y=θ, θ −52.5..+112.5 step 22.5 SKIPPING θ=0 —
    b21 keep-out), STONE mat (merges with walls).
  - D1b: fascia band under deck edge (open cylinder r=R+0.7=3.3,
    h 0.24, y 2.88..3.12, same arc params as deck, MID mat) — kills
    paper-thin read, caps both ragged ends.
  - D1c: night/life — tw_flame and new study-desk candle flame get the
    proven emissive recipe (color 0xffc98a, emissive 0xffa45f,
    intensity 1.25 — mkatmos/windowFrame lit-pane law); study candle on
    the desk (visible through door bay → warm read replaces void).
  - D2a: banner replaced per polish-273 — swallowtail pennant
    (ShapeGeometry V-notch 0.22 in free edge, DoubleSide, rust
    0xa06c32), hoist bar at rail y 3.88, hangs OUTSIDE deck edge z 3.31
    (clear of b21 — new cloth y 2.91..3.86 all above rider top 2.68).
  - D2b: real balcony door on the drum above the deck — doorFrame
    (0.95×1.25, y 3.0..4.25, front) + timber slab 0x5c4a30 + brass
    handle dot (front θ=0 has no window — clean wall zone).
  - D2c: exterior ladder at the deck's θ=−60° end (front-left, plaza-
    visible): 2 stringers 0.09 sq × 3.35 + 9 rungs, raked ~10° leaning
    to the fascia top, base under the deck overhang at r 2.75 — entire
    ladder inside existing bbox (SAT-neutral same-tuple re-place).
  Falsification: (1) after gameplay@18m: continuous railing full-arc
  both ends, no bare third; (2) right/front views: corbels visible
  under deck, fascia edge thickness (no paper read); (3) banner reads
  hanging cloth with V-notch (not door slab); (4) timber door reads on
  drum above deck; (5) ladder reads as access; (6) night: warm points
  in door bay + bedchamber flame; (7) decode: b21 keep-out zone clean;
  (8) bbox unchanged ±3.3/8.3, siblings (longhouse/garden/row) byte-
  identical; (9) two-way MCPL door walk ALL_PASS.
  Revert: revert towerHouse() edits → rebuild returns bd1badd218.

  improve-9 STATUS (this tick, run-budget close): source edits LANDED
  (rail arc fix, corbels, fascia, pennant, balcony door, ladder,
  emissive flames) — build succeeds, 24 nodes, sha 34fb63fd…, all 3
  siblings byte-identical (872aec35/b4ac2df4/30bc8ec3). EXECUTION
  REMAINS: rebuild ×2 determinism, decode audit (b21 keep-out clean,
  bbox ±3.3/8.3), before/after renders + native judge, remove+spawn
  re-place at exact tuple, MCPL walk, PLACED_VERIFIED + idempotent
  rerun. No world mutation yet — improve-4 contract-tick precedent.

Next queue item (improve-10): FINISH improve-9 execution (above), then
queue item 7 `nx-sign-*` packet stays waysign's; next eligible:
`nx-town-stable` (Sev 2, guard none).

- improve-10 (EXECUTION COMPLETE + 3 decode-bug fixes): improve-9 candidate
  34fb63fd failed its own decode audit — (a) pennant rotation.x=-pi/2 laid
  the cloth FLAT (fin at y2.91, vertex-proven corners (-0.17,2.91,2.38));
  (b) balcony door slab z 2.46..2.56 buried INSIDE wall band (outer face
  2.60), zero verts proud — invisible; (c) ladder stringers spanned y
  1.55..4.85 — floating 1.5m (the exact class this lane kills). Fixed in
  towerHouse(): pennant vertical (no rotation, z R+0.73, y 2.96..3.88 under
  widened centered hoist bar), door proud at z 2.57..2.67 with frame+
  handle, ladder grounded y 0.03..3.88 vertical at theta -60 (clear of
  door arc +-16 and b21 keep-out; 60 keep-out-zone verts = original lintel,
  predates rider, no NEW geometry in zone). Final sha 11b31000 x2
  deterministic, siblings byte-identical, bbox z +0.03 (SAT-neutral).
  Native judge (all calls up, no fallback): gameplay 5/5 PASS (rail
  continuous, corbels/fascia read, pennant cloth+V-notch, timber door,
  grounded ladder), night PASS (warm study-candle point in door bay —
  replaces the black void), front PASS x3. Re-place remove+spawn exact
  tuple (-9,0,26) yaw 2.828368, lib bd1badd218->11b31000, comp {} both
  sides; PLACED_VERIFIED + idempotent zero-verb rerun; two-way 6-leg MCPL
  walk ALL_PASS 0.377m; rider b21 + light -l intact, census 259. Placer:
  next-place-improve10-towerhouse.ts. Evidence:
  reviews/improve9-towerhouse/{before,after}/.

Next queue item (improve-11): windmill idle-guard re-check (waysign-6
rider placed 09-06 01:57 — if >24h at execution, take it; else stable).

- improve-11 (EXECUTION, queue item 8 `nx-town-stable` — windmill guard
  STILL LIVE at 12:53 EDT (rider 01:57, 11h < 24h), stable taken next):
  contract committed BEFORE editing. Idle-guard clear (source last touched
  interior-16; no lane commit touches this entity in 24h). Survey-1 native
  CONFIRM stands as the restore-law re-judgment (exact live bytes, Sev 2).
  Live tuple (43,0,0) yaw −1.5707963267948966, lib 5beff62e == local build
  ×2 deterministic (proven this tick; no disputed bytes). Comp bag {}
  (census-fresh). Mechanism decoded at source:
  - D1 "no entrance on any face" → CONFIRMED by transform math: yaw −π/2
    maps local −z (open front, stalls, trough, b8 reins) to world EAST
    (empty lawn); local +z (SOLID back wall) faces WEST where the inn road
    dead-ends at the stable. The walker's arrival face is 5.4m of blank
    timber with the livery sign on it. The mk comment "facing the village"
    is inverted by the standing yaw. Rotation is FORBIDDEN (would strand
    sign rider local (0,2.02..2.7,z 1.94..2.26) and b8 reins local
    (x±2.45, y 2.22..2.64, z −2.16) — domain law).
  - D2 "black base strip" → the C.DARK floor slab's 0.4m bare edge at the
    open front (no wall, no plinth) reads as a void band; walled sides
    carry plinths already.
  FIX (all in mkv3-stable.ts, no housekit change):
  - Real livery entrance on the ROAD-side (local +z) wall, OFF-CENTER at
    x∈[−2.05,−0.65] (1.4 clear, 2.2 tall) — centered is impossible: the
    sign rider occupies wall-center y 2.02..2.7, any centered head
    structure intersects it. Hand-built (doorGapWall only does centered
    gaps): flank E x∈[−0.65,2.7] via wallSpan (carries sign + new
    windowFrame at x=1.8), flank W x∈[−2.7,−2.05], timber lintel beam
    y 2.4..2.56 x∈[−2.15,−0.55] (clear of sign x by 0.3), timber door
    posts ±(0.14×2.2×0.34) proud, threshold (C.MID, kit semantics) +
    stoop (C.STONE 0.21) at grade, door leaf parked OPEN flat against
    inner flank E face (x −0.545..−0.495, z 0.6..1.88 — zero aisle
    intrusion).
  - Interior circulation: partition cut aligned to door (spans
    x∈[−0.65,1.9] now, 2.55 long — still the stall divider); mangers
    unchanged (x=0, off the aisle by ≥0.1 + z-band disjoint from posts);
    stallrails MOVED z −1.05 → −1.85 (their semantic home at the open
    front as stall half-doors; clears the entire mid-bay for the door
    aisle; center 1.0m yard gap preserved).
  - D2 fix: stone curb ring at grade (0.24 tall, texMat stone recipe —
    same params as wallSpan plinths → merges) around the footprint,
    split at the door for the stoop; trough shifted z −2.45 → −2.55
    (clears curb by 0.145 and b8 z-band by 0.09).
  - Warm read: windowFrame lit pane (emissive) on flank E + interior
    light companion nx-town-stable-l at local (1.8,1.9,0) unchanged —
    door shows warm interior at dusk.
  Falsification: (1) native judge after-renders at 18m road-side reads
  an ENTRANCE (opening+posts+beam+stoop+lit window), not blank wall;
  (2) decode audit — door lane x∈[−2.0,−0.7] y∈[0.5,1.9] zero blocking
  verts across wall plane; sign keep-out (x±0.32,y 1.96..2.76,z 1.88..
  2.32) zero NEW verts; b8 band (z −2.28..−2.04, y>2.1) zero new verts;
  partition gap clear x∈[−2.0,−0.7]; (3) MCPL two-way 5-waypoint walk
  through the door (world line x 40.1→43.9 at z −1.35) arrivals ≤0.55m;
  (4) bbox growth recorded (+x 0.15, +z 0.22, −z 0.675 trough) — SAT
  checked vs bench/sign/b8; (5) night.png shows warm door + window.
  Revert: revert mkv3-stable.ts edits → rebuild returns 5beff62e.


## Carried laws

- Full house discipline: gate exit 0 before mutation, ledger law EXACT,
  one append per tick, stage only lane-owned paths, never push.
- Comp capture/reapply on every re-place; idempotent rerun proof.
- CLEAN verdicts are recorded results; no manufactured work.
