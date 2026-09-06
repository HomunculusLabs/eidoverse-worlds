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
   [NATIVE-survey-6 CLEAN (restored native, 18m, fresh live bytes, lib
   216c4bd4): resolves the survey-3 ZAI dissent toward improve-8's
   native acceptance — shafts read HEWN STONE (mottled chisel texture,
   stubby monolith proportions, varied lean, chiseled cap slabs, zero
   crossarms/insulators/wires); gold collar bands CLEARLY VISIBLE and
   highest-contrast (left x371-436 y297-320, right x523-585 y314-330);
   pads seat wider than shafts; identity DELIBERATE MONUMENT MARKER.
   Margin notes only: four stones resolve as two paired clusters at 18m
   (rear pair occluded); crossroads context lives in the live world, not
   the isolation rig. Row stays EXECUTED/closed. Evidence:
   reviews/survey6-slice/nx-struct-crossing/gameplay.png]
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
   [EXECUTED improve-9/improve-10: rail rebuilt in deck convention +
   corbels + fascia + swallowtail pennant + balcony door + grounded
   ladder + emissive flames; sha bd1badd2→11b31000; decode-bug fixes
   (flat pennant, buried door, floating ladder); native 5/5+night;
   PLACED_VERIFIED + idempotent; 6-leg walk ALL_PASS 0.377m — row
   annotation repaired improve-14 (execution log had the record; the
   row lacked its bracket tag)]
7. `nx-sign-*` packet (7 signs, emblem-scale collapse class) — CROSS-LANE:
   re-places belong to waysign; improve drafts the build spec for the
   packet. Routing: parked until waysign's queue/eye-gate resolves OR
   Bill routes it here. Not improve's to execute. (guard: waysign-7 today)
8. `nx-town-stable` — no entrance/identity on any face (reads chest/
   monument); squat proportions; corner wedge voids at roof overhang. Sev
   2. (guard: none) [NATIVE-CONFIRMED survey-1: no door/opening on any face,
   featureless walls, black base strip void; silhouette PASS]
   [EXECUTED improve-11/improve-12: road-side livery entrance (hand-built
   off-center door + posts + lintel + stoop, open leaf parked inside),
   stallrails relocated to open front, stone curb ring, proud lit window
   + entrance lantern bead (improve-11 build failed its own night
   falsification — buried pane class; improve-12 re-seated pane proud +
   lintel bead); sha 5beff62e→98f2d5b6; PLACED_VERIFIED + idempotent;
   6-leg walk ALL_PASS 0.325m — row annotation repaired improve-14
   (execution log had the record; the row lacked its bracket tag)]
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
    [EXECUTED struct-38: native re-judge CONFIRMED 4/5 (floating pin
    speck, no-sheen basin, hairline reeds, fountain-not-millrace
    identity), DROPPED open-slit finding (bands already read as
    shadowed risers at 18m); root cause = plain mat() water/reeds
    exported NO glTF material -> COLOR_0 x loader-default metal-1
    material rendered near-black sheenless; fix: real water material
    via emissive lane (canon 0.25/0.5 + polish-281 0x2e4a58@0.45),
    timber launder flume on trestle posts + drop tongue + stone
    chute + visible pour, stemmed textured-gold bead 0.09, clumped
    reeds r0.035-0.045 x3; sha d2f46768->6e82dd2e x2 deterministic,
    6 nodes; day gameplay PASS (weir-pools not slits, reeds read,
    bead attached), top view PASS (launder feeds head on-axis),
    night PASS 3/3 (moonlit water, warm bead, quiet); remove+spawn
    exact tuple, comp {} both sides, PLACED_VERIFIED + idempotent
    0-verb rerun, 5-leg bank walk ALL_PASS 0.38m]
14. `nx-struct-spiralfolly` — floating gold ring; detached treads; gaps;
    no top landing. Sev 2. (guard: none) [NATIVE-CONFIRMED survey-1:
    treads detached blocks with gaps, upper turns drift off core, gold
    ring floats unconnected, stairs stop short, ragged wobble]
    [EXECUTED struct-39: all findings source-true (0.06 treads on 0.14
    rail; 0.18m stick spine; ring TOP+0.5 nothing under it; no landing;
    chord scallop) — honest-carriage rebuild: 52 solid socketed bone
    steps, tapering corbelled core (0.72× envelope), landing platform
    r2.25, compact ring on 3 brass struts (exact contact), outer curb
    owns the silhouette; ALL materials to texMat lane (struct-38 law);
    3-iteration loop w/ 18m falsification (v1 dashed+float, v2 ring PASS
    band FAIL, v3 PASS — one continuous ribbon, ZAI fallback disclosed);
    sha 20c515a0→b85ce018 x2, 4 nodes, bbox ±3.3 x/z unchanged;
    remove+spawn exact tuple comp {}, idempotent rerun, 5-leg circuit
    walk ALL_PASS 0.376m]
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
    [survey-6 (ZAI fallback, native 1210 x2 + paced retry, disclosed; 18m,
    fresh live bytes, lib 43817a4f): second CLEAN vote on the fixed bytes —
    zero floating cubes/debug debris (improve-3 finding class GONE), verge
    reads composed cadenced dressing (near/far alternating rows, perspective-
    consistent spacing), lamps fully legible (post/pan/flame incl. far lamp
    6px globes), ribbon continuous+grounded, no seam. Native re-judge still
    owed (1210 this tick) but 2 fallback CLEAN votes now stand on fixed
    bytes vs the original defect read on pre-fix bytes; retire the survey
    queue candidate — corroborative value only. Evidence:
    reviews/survey6-slice/nx-approach-sw-lane-003/gameplay.png]
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
    [EXECUTED improve-14: F1 flames r 0.038→0.055 + emissive 1.0→1.25
    (improve-9 recipe — night CCL 3 distinct flame components, 18→28-29px,
    +23% warm px); F2 via 3-iteration closed loop — v1 domed r0.06 and
    v2 domed r0.09 mounds both FAILED native 18m judgment (dome RELIEF
    projects ~0.35px at 3.75° depression — grazing kills height, width
    merges into edge highlight; MECHANISM recorded, not taste), v3 UPRIGHT
    pale loaves (cyl 0.048/0.055×0.13 + dome cap, 0.16m tall ≈ 7.6px
    verticals, milestone-idiom) PASSED native 3/3 (countable, deliberate,
    in scale). sha 53709062→948d5c49 ×2 deterministic; decode bbox exact
    unchanged; b7 keep-out DIFFERENTIAL clean (zone verts identical 3==3,
    zero new/gone); remove+spawn exact tuple (−25, −0.00126, −4) yaw
    1.411812, comp {} both sides, PLACED_VERIFIED 2 verbs + idempotent
    zero-verb rerun; 8-leg two-way MCPL approach walk ALL_PASS 0.360m;
    rider b7 + light companion untouched]
18. `nx-town-row-cottage` — left door jamb bare; lamp dot no fixture;
    ridge tabs; dormer seam. Sev 2. (guard: none)
    [NATIVE-PARTIAL survey-2: lamp reads BARE DOT, zero fixture geometry
    (CONFIRMED); small ridge tab just left of dormer + minor ridge
    bumpiness (CONFIRMED, minor); door jambs read COMPLETE both sides
    (DROP); dormer clean, no seam (DROP). Re-ranked Sev 3. Evidence:
    reviews/survey2-sev2-slice/row-cottage/gameplay.png]
    [EXECUTED improve-15: source-of-truth traced to mkv3-ring.ts block 4
    (mkvillage-houses rowCottage LEGACY, not live; live pin bd88cd38 ==
    local village_row3.glb == ring rebuild, no disputed bytes); both
    findings re-confirmed NATIVE this tick then fixed — F1 lamp mounted
    as wall lantern (iron plate+arm+hook+hood, KEEP bead under hood,
    +118 verts); F2 solidRidge=true continuous cap; ring siblings 6/6
    byte-identical; sha add42aea x2; decode keep-out 132==132 identical,
    bbox unchanged; night warm dot retained; ZAI after-judge 2/2 PASS
    (native 1210 x2, disclosed, re-judge owed); remove+spawn exact tuple
    comp {} PLACED_VERIFIED + idempotent; 6-leg walk ALL_PASS 0.3838m
    unchanged; rider b18 + light companion untouched, census 259.
    Note: interior-8 focused-gate sha pin staled by design — owner lane
    re-pins (artwalk-58 class); flag reported to interior lane]
19. `nx-town-bunkhouse` — facade value crush; stray diagonal face right
    wall; ridge tabs. Sev 2. (guard: re-check interior lane tail at
   execution; interior-20 last Sep 1)
   [NATIVE-CONFIRMED survey-2: facade crushes to one dark value — only
   the pure-black doorway void reads, door/window faint tonal ghosts;
   thin lighter diagonal streak through right window area (stray face/
   seam class); evenly spaced ridge notch/bump artifacts. Identity
   carried by silhouette alone. Sev 2 stands. Evidence:
   reviews/survey2-sev2-slice/bunkhouse/gameplay.png]
   [EXECUTED improve-13: interrupted pre-place window recovered
   (artwalk-32 class — dead window left build+renders on disk, zero
   world mutation, live still at baseline 49f5acc4); two-build loop —
   v1 a89b29ec passed day decode+native but FAILED its own night
   falsification (interior bead occluded behind E door-flank wall,
   improve-12 buried-lantern class) → v2 + entrance bead on door lintel
   c8636968 ACCEPTED; walls→village timber texMat, 0.22h ashlar plinth
   ring, proud back windows, door posts/threshold, solidRidge+
   trueGableHalf (horn killed, bbox z ±3.5→±2.621, x/y unchanged);
   native 8/8 (door reads DOOR, ridge continuous, plinth band reads,
   windows cased+proud, night warm lantern, day bead mounted, top
   horn-free, zero floating); stray-diagonal DROPPED (was the buried
   shutters — improve-12 class); west-edge "floating railing" probe
   DROPPED (pixel-diff region byte-stable, attention artifact);
   remove+spawn exact tuple (−9,0,−26) lib 49f5acc4→c8636968, comp {}
   both sides, PLACED_VERIFIED + idempotent zero-verb rerun; 6-leg
   MCPL door walk ALL_PASS 0.333m; rider b20 + light companion
   untouched, census 259]
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
    [ZAI-survey-4 re-judge (fallback, native 1210 x2 + paced retry,
    disclosed): rope float re-CONFIRMED (~20-25px empty gap under the
    handle, x480-492 y448-462, no cleat/beam); lamp-fuse re-CONFIRMED
    (orange blob merges into corner post/beam junction, x505-545
    y195-235, no mount separation); rungs FLIP back to floating-read
    (no resolvable stringers, ticks-over-X-brace) — fallback flip-flop
    vs the survey-3 drop, native re-judge owed. Evidence:
    reviews/survey4-slice/town-belltower/gameplay.png]
    [NATIVE-survey-5 re-judge (restored native, 18m, exact live bytes
    29f28b53 == survey-4 pin): rope float re-CONFIRMED NATIVE — terminus
    knob/handle at x481-495 y448-462, ~25-30px of empty air below, zero
    cleat/beam/floor anchor; lamp-fuse re-CONFIRMED NATIVE — single warm
    dot x516-523 y208-215 embedded exactly at the eave/belfry-beam/post
    convergence, no bracket/housing/mount separation; rungs re-CONFIRMED
    FLOATING NATIVE (resolves the fallback flip-flop toward float): ~10
    discrete bars x455-471 y283-470 at 20px pitch, at most ONE faint
    stringer line hugging the left leg, right rung-ends terminate in
    open air between the legs. All three sub-findings now native-confirmed;
    Sev 3 stands (engine-1 ladder-comp note rides the row). Evidence:
    reviews/survey5-slice/town-belltower/gameplay.png]

22. `nx-struct-hypar` — dangling batten; hovering batten ends; ragged
    tips. Sev 2–3. (guard: none)
    [ZAI-CONFIRMED survey-3 (native 1210 x2, one paced retry, ZAI fallback — native re-judge owed):
    dangling tips, hovering fan ends, ragged margins all re-confirmed at
    18m; INTENSIFIED — central sky-through gap splits the canopy into two
    fans (open sky ~70% of center span), daylight band between canopy and
    deck with no hangers, 9px finial specks, edge beams sub-legible so the
    ruled-surface read fails. Sev 2. Evidence:
    reviews/survey3-slice/hypar/gameplay.png]
    [ZAI-survey-4 CONTRADICTION (fallback, native 1210 x2 + paced retry,
    disclosed): the SAME fallback judge on byte-identical live bytes
    8e4643de (fetched fresh, == survey-3 pin) now reads 5/5 CLEAN —
    battens anchored at fan pivots, fans interlock across centerline
    (no split), tips bear on deck with contact shadows, finials ~10px
    legible, ruled-surface twist reads. Irreconcilable with survey-3
    Sev 2; row MUST hold for NATIVE re-judge before any execution.
    Evidence: reviews/survey4-slice/struct-hypar/gameplay.png]
    [EXECUTED struct-40: decode-first resolution — survey-3 findings
    SOURCE-TRUE (hyparShell fixed t-space overhang extrapolated steep corner
    rulings: 156 verts y>5.8 max 6.41 spearing 0.63m ABOVE crest beam, 300
    verts y<1.0 low tips at GRADE −0.02 — dangling+ragged+hover one cause;
    survey-4's 5/5 CLEAN was the probe artifact), material root confirmed
    (posts/pins plain mat() → material:undefined → near-black — the specks
    finding); FIX: hyparShell overhang-budget law in housekit (z-budget
    0.15m + 3D-length budget 0.30m caps) + call-site over=0 FLUSH rim
    (beams own the silhouette) + posts→hypar_iron pins→hypar_gold texMat;
    3-iteration judge loop v1 tails→v2 trim→v3 flush: dangling/hover/ragged
    NOT-PRESENT, pins PRESENT gold, twist PRESENT (v1 native 1/3 flips
    disclosed, v3 ZAI fallback, native 1210 x2 disclosed); sole residual =
    designed saddle-dip reveal ~0.1m at mid-span (disclosed to eye-gate);
    sha ce246def→750f82ee x2 deterministic, 4 nodes, slat bucket y
    [0.48,5.82] flush on beams; remove+spawn exact tuple (−27.57,−0.0053,4.86)
    yaw π/2 comp {} both sides, PLACED_VERIFIED 2 verbs, idempotent 0-verb
    rerun, 5-leg deck walk ALL_PASS]
    [survey-5 (ZAI fallback AGAIN, native 1210 x2 burned its paced retry,
    disclosed — native STILL owed; flap law recorded): resolves the
    contradiction toward the DEFECT side — upper batten ends anchored at
    the arc-rail pivots (ball finials ~(250,173)/(712,172)) BUT lower
    ends hover ~20-45px above the deck (left tips (243,418)/(280,432)/
    (318,446), right (688,412)/(652,428)/(615,442); batten shadows on
    the deck prove elevation); top-center sky-through notch x455-585
    y282-352 (~130x70px) splits the silhouette into two wing-halves
    though an X-lattice interlace below (x360-600 y310-435) keeps them
    one structure; twist reads at the wings, muddles at center (no
    inter-member depth shading). 2 fallback votes vs 1 clean — row stays
    Sev 2-3 pending the owed native pass. Evidence:
    reviews/survey5-slice/struct-hypar/gameplay.png]

23. `nx-struct-mobius` — center slit; jagged canopy edge; hovering
    canopy. Sev 3. (guard: none)
    [ZAI-PARTIAL survey-3 (native 1210 x2, one paced retry, ZAI fallback — native re-judge owed): jagged canopy
    edge CONFIRMED — asymmetric half-loop sawtooth (x≈495-740) reads
    damage, not crenellation; facet seams read venetian panels; center
    slit DROPPED (falsifiable negative: zero sky pixels inside band
    faces); hovering DROPPED-ambiguous (under-edge strip reads as the
    shaded far side of the loop). Sev 3 stands. Evidence:
    reviews/survey3-slice/mobius/gameplay.png]
    [ZAI-survey-4 re-judge (fallback, disclosed): jagged edge CONFIRMED
    (6+ irregular V-notches, shredded right tip, ragged left tail);
    center slit RE-OPENED as right-half only (~14px sky strip x445-710
    y270-288 broken only by the center post; left half solid);
    hover stays DROPPED; NEW identity-invisible — no twist/crossover
    cue at 18m, reads "pavilion with damaged roof". Sev 3 stands.
    Evidence: reviews/survey4-slice/struct-mobius/gameplay.png]
    [NATIVE-survey-5 re-judge (restored native, 18m, exact live bytes
    68edf12c == survey-4 pin): jagged edge CONFIRMED NATIVE — V-notch
    steps at panel seams ~(345,118-130)/(510,110-130)/(570,112-125)/
    (700,126-140)/(780,150-165) plus adjacent-panel height offsets;
    right-half slit CONFIRMED NATIVE (matches survey-4) — sky gap
    x512-573 y268-280, ~55-60px wide x 8-12px tall, immediately right
    of the center post which penetrates the band; identity holds
    DELIBERATE PAVILION at native (upgrades survey-4's
    identity-invisible) — looping band twist + 5 even columns + formal
    radial-plank deck read designed; serration reads panelization, not
    damage. Net: 2 defect sub-findings native-confirmed, identity
    sub-finding DOWNGRADED to clean; Sev 3 stands on the slit+jag.
    Evidence: reviews/survey5-slice/struct-mobius/gameplay.png]
    [EXECUTED struct-42: native re-judge CONFIRMED both findings on exact
    live bytes 04d088e1 (V-notches 4-22px at seams, worst x755-838; slit
    x505-570); root cause = 36 DISCRETE pitched boxes (pitch steps 5deg
    per joint — rim staircases, flat end-faces at mismatched pitch open
    wedge see-throughs); fix = ONE continuous 144-segment swept band,
    welded Mobius join, texMat lanes (struct-38 law); sha
    04d088e1->5617f376 x2
    deterministic, 4 nodes, bbox inside old envelope (6.2475<6.2876);
    serration quantified GONE (residual at native-cited seams 0px; worst
    sector max 17->10px = post tips, designed); survey-5 'slit'
    DECODE+FALSIFIED as the ring's designed open aperture (ray-trace:
    y262-270 HIT near face t12.5m, miss row y274 threads BETWEEN
    sections — 0 rays through any face; identical miss pattern on before
    bytes) — disclosed to eye-gate; lib-swap re-place exact tuple, comp
    {} both sides, PLACED_VERIFIED 1 verb + idempotent 0-verb rerun;
    5-leg MCPL walk ALL_PASS 0.37m]

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
    [ZAI-survey-4 re-judge (fallback, disclosed): 4/4 CONFIRMED —
    straight-slab rows with 5+ ground-through gaps (widest channel
    x448-495 under the pole); telephone-pole silhouette unambiguous
    (shaft+T-crossarm+insulator, x420-487); bowl flat (row offset
    ~10-15px, perspective-attributable, no risers); wrap ~40-45%.
    Sev 2-3 stands, pole worst. Evidence:
    reviews/survey4-slice/struct-amphi/gameplay.png]
    [NATIVE-survey-5 re-judge (restored native, 18m, exact live bytes
    43d0c955 == survey-4 pin): ALL FOUR native-confirmed — rows are
    axis-aligned rectangles (left x70-262/x140-332, right x490-680/
    x630-885) fragmented into 2-3 slabs each with gaps (~x160, x262-285,
    x545, x680) and a wide central aisle x332-490; zero curvature;
    telephone-pole silhouette unmistakable (shaft x451-459 y290-388 +
    T-crossarm x420-487 y298-305 + insulator knobs + ball finial) —
    reads telecom infrastructure, not sculpture; bowl flat — checkerboard
    disc x208-642 y418-492, 2-3 thin rim layers, no concavity or tiers;
    wrap ~120-150deg single rear bank, front 180deg empty. Sev 2-3
    stands, pole worst (2 native + 2 fallback unanimous). Evidence:
    reviews/survey5-slice/struct-amphi/gameplay.png]

25. `nx-struct-observatory` — detached trim band; dome-to-wall slits. Sev
    3. (guard: none)
    [ZAI-CONFIRMED survey-3 (native 1210 x2, one paced retry, ZAI fallback — native re-judge owed): trim band
    reads detached — three pieces at mismatched heights (left tab ~20px
    high with wall-colored gap below; right stroke separated from the dome
    by a light gap; only the door lintel attaches); dome-to-wall slits
    CONFIRMED — two symmetric light strips flanking the lintel read seam
    artifact, not shutter; band-end whisker stubs. Sev 3 stands. Evidence:
    reviews/survey3-slice/observatory/gameplay.png]
    [ZAI-survey-4 re-judge (fallback, disclosed): trim detach CONFIRMED
    (twin offset arcs left+right, orphan chips past silhouette x300-312
    and x645-660, band terminates at door reveals); slits CONFIRMED
    (2-3 sky slivers above the lintel x412-556 y263-301); NEW lintel
    height-mismatch sub-finding (trim line steps down at entrance);
    dome itself reads curved+coherent. Sev 3 stands. Evidence:
    reviews/survey4-slice/struct-observatory/gameplay.png]
    [NATIVE-survey-5 re-judge (restored native after one paced retry,
    18m, exact live bytes acd0259e == survey-4 pin): scope NARROWED —
    left AND right flanks read ATTACHED (trim flush against wall top
    x305-432 and x538-655, no sky behind); defect is LOCALIZED to the
    front-center bay x425-545 y255-300 — trim splits into floating
    fragments with two exact-sky-match see-through slits (upper y255-268
    between dome underside and trim; lower y285-298 between trim and
    lintel top). Dome clean, curved, coherent (smooth arc to apex
    ~(470,205), no tears). Survey-3/4's "three detached pieces +
    orphan chips" scope corrects to central-bay-only; lintel
    height-mismatch corroborated (trim line steps at entrance).
    Sev 3 stands (slits in the door-facing bay). Evidence:
    reviews/survey5-slice/struct-observatory/gameplay.png]

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
    [ZAI-survey-4 re-judge (fallback, disclosed): ziggurat read, black
    void interior (no concavity/specular cue), gizmo cross all
    re-CONFIRMED; NEW: failure is angle-dependent — the identity lives
    in the concave dish face, which is edge-on/occluded at the 18m
    gameplay angle; silhouette fix alone cannot carry identity.
    Sev 3 stands. Evidence:
    reviews/survey4-slice/struct-soundmirror/gameplay.png]
    [NATIVE-survey-5 re-judge (restored native after one paced retry,
    18m, exact live bytes e5f2fc69 == survey-4 pin): ziggurat read
    CONFIRMED NATIVE — three stacked plumb centered disks (base x356-600,
    mid x400-562, top x428-532), zero tilt/rim-lip/bowl-mouth in the
    silhouette; black void CONFIRMED NATIVE — top face x428-532 y344-364
    uniform near-black, no specular, no radial rim-to-center gradient;
    gizmo cross CONFIRMED NATIVE — 2-7px flat unshaded gold, no cast
    shadow, dead-center vertical, no thickness cue. Angle-dependence
    corroborated (survey-4 NEW finding stands). 2 native + 2 fallback
    unanimous across all four rounds. Sev 3 stands. Evidence:
    reviews/survey5-slice/struct-soundmirror/gameplay.png]

27. `nx-town-mapboard` — map face dirt smudges; side edge fragments. Sev
    3. (guard: none)
    [ZAI-survey-4 CONFIRM (fallback, native 1210 x2 + paced retry,
    disclosed): face reads noise/scratches — dark sub-2px strokes on a
    dark olive face, no road/block/label semantics, no paper panel
    (x418-545 y290-370); stray side fragments BOTH edges (x404-417 and
    x544-557, floating past the body); identity reads generic dark
    kiosk/lectern, not map board. Sev 3 stands. Evidence:
    reviews/survey4-slice/town-mapboard/gameplay.png]
    [NATIVE-survey-5 re-judge (restored native, 18m, exact live bytes
    e6d02dd8 == survey-4 pin): FULL CONFIRM — face reads noise, not
    cartography (isolated specks/dashes x440-535 y308-365, no road/
    block/label semantics, no connectivity/hierarchy; single orange
    dot x479-483 y320-324 the only chromatic hint, orphaned); stray
    fragments BOTH edges re-CONFIRMED NATIVE (left x405-420 y320-352,
    right x545-562 y308-322, outside the silhouette); silhouette itself
    PASSES (cap+panel+two legs+shadow reads kiosk/board) — structure
    passable, map FUNCTION failed. Sev 3 stands, native-cleared for
    execution. Evidence: reviews/survey5-slice/town-mapboard/gameplay.png]
28. `nx-town-monument` — pinhole at ring intersection; pedestal face
    crushed. Sev 3. (guard: none)
    [ZAI-survey-4 PARTIAL (fallback, disclosed): pinhole CONFIRMED minor
    (3-5px seam gap x511-517 y283-289, the only affected crossing);
    pedestal crush DROPPED — inset plaque with 3-4 score lines reads
    crafted (x452-493 y391-412); identity CONFIRM (interlocking-loop
    silhouette + centered approach stair = commemorative grammar).
    Re-rank Sev 4. Evidence:
    reviews/survey4-slice/town-monument/gameplay.png]
    [NATIVE-survey-5 re-judge (restored native after one paced retry,
    18m, exact live bytes 8ab30593 == survey-4 pin): pinhole
    re-CONFIRMED NATIVE at the same spot — isolated dark pinpoint
    ~(511-515, 321-325) on the right limb where two rings abut, exposing
    shadowed interior (not a legitimate open loop like the cluster
    center x455-505 y285-340); pedestal CRAFTED re-CONFIRMED NATIVE
    (three tonal groups: mid-brown tiers, near-black plaque insets
    x460-492 y393-410, darker course seams y375-390 — margin note only:
    plaque insets 8-15px register as dark recessed panel, one value
    step more contrast would help); identity CONFIRMED — central
    sculpture + stepped plinth + approach stair (x450-500 y417-446)
    reads commemorative clearly. Sev 4 stands (pinhole minor).
    Evidence: reviews/survey5-slice/town-monument/gameplay.png]
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
    [EXECUTED dress-18: interrupted-window recovery (struct-9 class —
    prior window reseated live then died pre-bookkeeping); native
    CONFIRMED both findings on v4, v6 fix ACCEPTED 4/4 gameplay + 4/4
    close (ZAI fallback, native 1210 ×2 disclosed) — 0.95m pale-flagged
    gap in split lower rail, full-span upper bar, two worn flags
    aligned through; remove+spawn reseat at exact unchanged tuple, lib
    5a8de30d -> 5e9d301d x2 deterministic, PLACED_VERIFIED + idempotent
    zero-verb rerun this tick; margin note: pale end blocks at lower
    bound of 18m legibility]
34. `nx-dress-ne-woodstack-001` — burnt right post; see-through gaps;
    detached left post. Sev 3. (guard: dress-9 today — until 09-07)
    [EXECUTED dress-19: native re-judgment on exact live bytes CONFIRMED
    burnt-post + porous-rack (2 of 3; detached-left DROPPED — reads
    planted); root causes: x-tilted leaners at x=1.28 fused with the
    right post AND floated, courses 8/7/6 unbonded; v7 fix: leaners
    removed, running-bond courses 9/8/9, posts BARK->stile TIMBER +
    pale CUT caps (dress-11 idiom; pixel decode v5 posts pure black);
    judged 4/4 gameplay + 3/3 close native; sha 692bc54e x2; reseat at
    exact unchanged tuple, lib c832da5d->692bc54e, PLACED_VERIFIED +
    idempotent, comp {} both sides]
35. `nx-struct-pendulum` — dashed shadow acne; hairline strings; weak
    identity read. Sev 4. (guard: none)
    [NATIVE-survey-6 (restored native, 18m, live bytes lib 0a3120b2
    unchanged pre/post tick): dashed-shadow acne CONFIRMED NATIVE — band
    y419-433 fragmented into ~12-15 discrete dashes (gaps x≈355/415/480/
    585), only the A-frame leg shadows solid; strings hairline 1px CONFIRMED
    (continuous, attached, but alias/shimmer risk at in-game resolution);
    bob colors CONSISTENT (uniform olive, specular variation only — improve-3
    inconsistent-colors finding drops); identity reads PENDULUM WAVE on a
    swing-set frame, NOT gallows (gallows silhouette absent — improve-3
    weak-identity note softens). Sev 4 stands on shadow acne + hairline
    strings. Evidence: reviews/survey6-slice/nx-struct-pendulum/gameplay.png]
    [EXECUTED struct-41: rod cross-section 0.028→0.065 (one number, both
    findings) — strings now solid-continuous at 18m, rod shadows lifted
    2px→4-5px off the raster floor (+44% coverage 9.9→14.1%); decode
    falsified the "acne" premise: dash centers align exactly with the nine
    rod x-positions, the band IS nine discrete rod shadows at physically
    correct positions; envelope 8.295×3.585×2.732 unchanged; sha
    0a3120b2→c32a35a8 ×2 deterministic, exact standing tuple re-place, 1
    verb, idempotent 0-verb rerun, circuit walk 5/5 maxArrival 0.34m.
    Before-frame judged NATIVE (defect confirmed), after-frame judged ZAI
    fallback (native 1210 ×2 disclosed) — fixed-bytes native re-judge owed
    when provider returns; residual discloses as correct-physics nine-line
    shadow, not consolidated band. Evidence:
    reviews/struct41-pendulum/{before,after}/gameplay.png]
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
    [survey-6 interleave (NATIVE, 18m, judged pre-fix bytes lib 806f2c4e):
    plank-debris + boulder findings corroborated — stray plank reads
    debris/noise x577-640 y381-390 breaking the row rhythm; boulder
    zero-clearance overlap occludes skep 2's left third (swallow NARROWED:
    all four skeps countable; not a full hide); identity reads clean apiary
    row, zero floating. dress-20 executed v6 LIVE mid-tick (spill clumps
    removed, boulder past row's left end, sha 87d2dd16) — pre-fix judgment
    stands as corroboration of the owning lane's own native CONFIRM; no
    note routed, no reopening. Evidence:
    reviews/survey6-slice/nx-dress-nw-skeps-001/gameplay.png]
    [EXECUTED dress-20: native rejudge on exact live bytes (lib 806f2c4e)
    CONFIRMED plank-debris read + boulder-intruder (swallow narrowed: skep 2
    survives; near-black r0.66 boulder on row line, tallest+darkest, value-
    fuses with skep 2). v6 = spill clumps REMOVED (minimalism law, 2nd
    failed accent) + boulder past row's left end / r0.36 sunk / plinth-
    family stone; native 4/4 gameplay, sha 87d2dd16, reseat at exact
    unchanged tuple, PLACED_VERIFIED + idempotent]
38. `nx-dress-nw-hedge-001` — cleanup tier (stub riser, stray cube, hole).
    Sev 4. (guard: re-check dress tail at execution) [EXECUTED dress-21:
    ALL THREE findings confirmed (survey-6 native + lane rejudge; the
    rejudge's hole-DROP was a leading-prompt artifact, corrected by an
    unprompted zoomed native read = missing mass); v4 = stub/nubs REMOVED
    + foot stones tucked flush + gap re-dressed in the pale aperture-tell
    idiom (CUTWOOD end plates, PALE_STONE kerbs, dogleg); zoomed gap read
    FLIPPED to intentional-passage, gameplay 4/4 native, close 3/3 ZAI
    (native 1210 ×2 disclosed); sha 3d5c7d44, reseat at exact unchanged
    tuple, PLACED_VERIFIED + idempotent — dress shard queue now EMPTY]
    [NATIVE-survey-6 CONFIRM (restored native, 18m, live bytes lib f595e862
    unchanged post-tick): all three cleanup findings confirmed — mid-gap
    hole x505-556 y345-388 (~50px break, dark base exposed); lone stub
    riser x384-397 y293-322 jutting ~30px above roofline; stray warm-gray
    cube x298-337 y376-404 off-material, laterally detached from the hedge
    line; massing otherwise deliberate (common base, stepped height rhythm).
    Zero floating. Sev 4 cleanup tier stands — routed to DRESSING-PLAN
    SURVEY INTAKE (first dress-domain note routed under the new section).
    Evidence: reviews/survey6-slice/nx-dress-nw-hedge-001/gameplay.png]

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

  improve-12 EXECUTION COMPLETE (closing the improve-11 contract): improve-11's
  build 10fd723c FAILED its own night falsification — night.png max R 42,
  zero warm pixels. Root cause by decode + kit read: the windowFrame pane
  was BURIED (kit z default puts the emissive pane at wall-center z 1.98,
  behind the wallSpan's outer face z 2.1 — it can never render; the hall's
  identical call is the same class, its night glow actually comes from lamp
  beads), and the only lantern bead sat at the FAR open-front (world W),
  invisible from the road-side night vantage. Fixed in improve-12 (same
  contract, night clause): (a) window seated PROUD of the wall face
  (z = D/2−T/2+0.09 → pane 2.075..2.105, bone frame proud, shutters flare
  from 2.21); (b) entrance lantern bead on the door lintel E end (local
  (−0.55, 2.5, 2.05), same ember recipe as the yard lantern, polish-278
  law; clears sign keep-out — bead y 2.3..2.55 at x −0.495..−0.605 vs
  rider x≥−0.32 band at y 1.96..2.76 z 1.88..2.32, x-disjoint by 0.17).
  Final sha 98f2d5b6 deterministic ×2, 17 nodes (pane stays own node;
  door bead joins glow bucket). Decode audit on final: door-lane blocking
  verts 0, sign keep-out 0, b8 keep-out 0, aisle verts 0; pane proud
  2.075..2.105 (face 2.1), glow bucket 120 verts (yard + door beads).
  Night falsification PASSED: 304 warm px at the window (max R 244,
  x 570..602 = flank E) + door-bead speck (5 warm px, x 447). Native judge
  (1210 ×2, paced retry recovered — native judgment): entrance clean
  (opening/posts/lintel/stoop, no clipping), window seated with real
  reveal + shutter contact shadows, zero floating/detached/intersecting
  geometry, coherent enterable stable. ZAI fallback judged first
  (disclosed): PASS on all four mechanics, semantic notes only (isolated
  render — the livery sign rider hangs on this wall in the live world,
  host-rider law). Re-place remove+spawn at the exact standing tuple
  (43,0,0) yaw −π/2, lib 5beff62e→98f2d5b6, comp bag {} both sides
  (census-fresh; riders + nx-town-stable-l untouched — separate entities).
  PLACED_VERIFIED (2 verbs) + idempotent rerun ALREADY_LIVE_NO_VERBS.
  Two-way 6-leg MCPL door walk ALL_PASS max arrival 0.325m (outside→door→
  center→yard→back). Placer: next-place-improve12-stable.ts; walk:
  improve12-walk-stable.ts. Review evidence:
  agents/arthur/reviews/improve11-stable/{before,after,after2}/.

## SURVEY CANDIDATES (round-2 intake)

Confirmed under NATIVE vision at 18m from fresh live store bytes
(survey-7, 2026-09-06). Findings are probes — confirm-or-drop and
decode-at-source law stays with the executing lane. Grep-verified: no
open duplicate notes for these objects.

- `nx-town-woodyard` — Sev 3 (native survey-7): vertical stack mass is a
  pure-black blob (x370-552 y300-390 in gameplay frame) — zero wood
  read, no bark/end-grain/lit-face variation; inter-panel gaps read as
  voids, not shaded depth; stump floats shadowless right of shelter.
  Identity currently carried by log-end courses + planted axe alone.
  NOTE: tex-85 live-freeze law applies — any edit derives from LIVE
  store bytes 1f2c6f59, never a source rebuild. Evidence:
  reviews/survey7-slice/nx-town-woodyard/gameplay.png
- `nx-welcome` — Sev 3 (native survey-7): left stub arm detached from
  post (~5px sky gap x466-470 y341-345); welcome text dark-on-dark
  illegible at 18m (board holds sign-identity, welcome semantic fails).
  Evidence: reviews/survey7-slice/nx-welcome/gameplay.png
- `nx-town-potter` — Sev 4 identity-marginal (native survey-7): wheel
  disc reads generic flat ellipse (could read table/press), pot on ~1px
  spindle reads floating (x470 y352-360); shelf pots sub-pixel texture.
  Craft-station read holds; potter-specific read rests on sub-pixel
  cues. Related: nx-sign-potter-001 emblem fix is waysign R2 work.
  Evidence: reviews/survey7-slice/nx-town-potter/gameplay.png
- `nx-court` — Sev 3 (survey-8, 2026-09-06, native gameplay + front
  cross-check): court identity fails at 18m — reads two dark workshop
  huts, zero court vocabulary (no bench row, posts, banner, or dais);
  both open fronts read pure-black voids with interior props floating
  in blackness (L x210-350 y295-435, R x608-752 y295-430); orphaned
  plank between structures x455-500 y428-444; left-roof stub
  x440-465 y265-305; floating wall-lamp dot x196-206 y284-292.
  Interleave note: next-place-court-ensemble.ts dirty in tree = sha
  re-pin to LIVE lib 59534b10 (landed re-place bookkeeping, GLB clean,
  judged bytes current). Evidence:
  reviews/survey8-slice/nx-court/{gameplay,front}.png
- `nx-forge` — Sev 4 identity-marginal (survey-8, ZAI fallback): reads
  furnace/oven-hut, not forge — anvil illegible (flat plate x532 y380,
  no horn/waist/stump), no hood over hearth, left appendage
  x412-432 y343-392 pure dark blob; hearth opening x435-497 y358-400
  black void w/ blobby glow; floating right plate x532 y379 (gap
  x522-528 y378-386); quench barrel marginal (no contact shadow
  x510-530 y402). Glow alone carries identity. Evidence:
  reviews/survey8-slice/nx-forge/gameplay.png
- `nx-cistern` — Sev 4 identity-marginal (survey-8, ZAI + decode):
  no water read at 18m; reads dark box + leaning plank; no tiering;
  stone too dark. DECODE (live store bytes): water plane EXISTS — mat
  `glow1` base #14242f met .5 rough .25 emissive #03070b — DARKER than
  the polish-271-falsified #303840 (palette law: #506a78); survey
  chassis has no envmap (metalness-.5 water renders near-black there),
  so the render read overstates — but the live hue itself sits in the
  known-fails band; rim-vs-water value separation likely absent
  in-world too. Strut hairline contacts x483→520. Evidence:
  reviews/survey8-slice/nx-cistern/gameplay.png
- `nx-dress-fountain` — Sev 4 (survey-8, ZAI + decode; DRESS-DOMAIN,
  legacy-core off-limits set — ownership is Bill's call, not dress
  rotation): water fails at 18m. DECODE: ENTIRE asset is ONE material
  `glow0` base #14242f met .5 rough .25 em #03090d — stone and water
  share a single material, so no rim/water separation exists by
  construction; basin interior x405-555 y376-396 reads black void.
  Baseline-vs-law flag: polish-273/274 validated this fountain with
  water #506a78 + emissive #2e4a58 — live bytes decode #14242f/#03090d
  (darker than the falsified #303840). Stem 3-4px shimmer x479-483
  y291-313. Note routed to DRESSING-PLAN SURVEY INTAKE. Evidence:
  reviews/survey8-slice/nx-dress-fountain/gameplay.png
- `nx-temple-seed-0003` — Sev 4 (survey-8, ZAI gameplay + top): flat
  rubble/mosaic read confirmed from BOTH angles — flower-of-life disc
  at constant height, no central seed core or vertical form (uniform
  shallow shadows prove no raised mass); reads crop-circle/paving, not
  seed; no ground contact shadow at gameplay (x310-655 y412-418).
  Design caveat: 4-seed family shares ONE sha — if confirmed at
  decode, the fix is family-wide (0003/0013/0022/0047-class).
  Evidence: reviews/survey8-slice/nx-temple-seed-0003/{gameplay,top}.png
- `nx-cultivation-garden-0011` — Sev 3 (survey-8, ZAI): cultivation
  grammar absent at 18m — no bed geometry, no crop rows, no fence;
  spheres read bushes/boulders (uniform near-black green, zero size
  variation, ~25 stamps); sticks read saplings/weeds (lollipop
  silhouettes, no row rhythm); front-row spheres read floating over
  offset shadow voids (x330-365, x415-445, x500-540, x600-645,
  y420-436); stray edge sticks x160-235, x740-785. Family note:
  5 gardens share the pattern (0011/0019/0032/0045/0058 — verify
  before fleet-wide work). Evidence:
  reviews/survey8-slice/nx-cultivation-garden-0011/gameplay.png
- `nx-craft-hamlet-0007` — Sev 2 (survey-9, 2026-09-06, ZAI + native
  UNANIMOUS): hamlet identity FAILS at 18m — reads abstract blocky
  tower/ruin; both flanking upper masses hover with open sky beneath,
  exposed near-black undersides, zero support to ground; stair-slab
  runs float detached left and right; a true see-through hole in the
  mid-tower column shows sky THROUGH the geometry; dwelling cues
  confined to a tiny central gable. Value crush across the whole mass
  (roofs/walls/undersides near-identical luma). Family note: 5 hamlets
  (0007/0015/0028/0041/0054) each carry DISTINCT shas — confirm at
  decode whether the float/hole class is shared before fleet work.
  Evidence: reviews/survey9-slice/nx-craft-hamlet-0007/gameplay.png
- `nx-gallery-mosaic-0036` — Sev 3 (survey-9, 2026-09-06, ZAI + native
  UNANIMOUS): mosaic-panel identity FAILS at 18m — hundreds of loose
  tiles flat on grass read as scattered paving/confetti scatter, not
  an artwork; no frame, no backing, no coherent panel outline survives
  distance; silhouette dissolves into noise. No floats/voids (tiles
  flush, closed boxes). Fix class: merge/frame into one legible panel
  (texture-family pipeline candidate). Family note: 4 mosaics
  (0036/0048/0052/0059) distinct shas — verify pattern spread.
  Evidence: reviews/survey9-slice/nx-gallery-mosaic-0036/gameplay.png
- `nx-wild-cairn-0022` — Sev 3 (survey-9, 2026-09-06, ZAI + native
  UNANIMOUS): stacked-stone identity passes but TRUE FLOATERS —
  numerous small pebble spheres hover isolated against the sky above
  the stack tops (both judges: detached, touching nothing); shreds the
  row's top silhouette; secondary: smooth spheroid stacking flirts
  with blob-heap read. Fix class: drop/snap floaters onto surfaces.
  Family note: 5 cairns (0022/0043/0047/0048/0050) distinct shas —
  verify the floater class spread before fleet work.
  Evidence: reviews/survey9-slice/nx-wild-cairn-0022/gameplay.png

## Carried laws

- improve-13 (EXECUTION CONTRACT, queue item 19 `nx-town-bunkhouse`): idle-guard clear (no lane commit touches this entity in 24h; interior-9 lineage 2026-08-19; artwalk-52 read-only). Survey-2 native CONFIRM on exact live bytes stands as the restored-vision re-judgment (fallback-judge law satisfied). Live tuple (−9,0,−26) yaw 0.31322457341772525, lib 49f5acc4… == local rebuild ×2 deterministic (no disputed bytes). Comp bag {} (census-fresh 259); light companion nx-town-bunkhouse-l at host-local (0.5,2.1,0.5) — untouched, separate entity. Rider nx-artwalk-b20-bunkhouse-four-rooms host-local L=[−2.2,1.05,2.0325] (KEEP-OUT x∈[−2.6,−1.8], y 0.8..1.3, z 1.7..2.4). Findings + mechanisms (decoded at source mkbunk.ts):
  - D1 facade value crush (Sev 2 core): walls flat untextured C.STONE, roof flat C.MID — near-identical luma, no plinth course; every opening a near-black void with zero casing; only the door void reads at 18m. Kit has proven cures: tex-4 ashlar stone plinths (tex-28 law class), plaster gables (already via gableRoof).
  - D2 thin lighter diagonal streak through right window area (stray face/seam class) — verify at decode; remove if stray.
  - D3 ridge notch/bump artifacts = the gableRoof 0.92-factor ±0.03-yaw staggered cap (identical class to hall D3 / inn D2; proven kit opt-in cure).
  FIX (all in mkbunk.ts, no housekit change):
  - D1a ashlar plinth ring (texMat stone [0x56503c,0x5c5a44,0x4c4836] rough .95 scale 2 weights [2,1,1] cell 32), 0.9h course under S/N/E/W walls.
  - D1b bone window casings/sills proud of the wall face on all six windows.
  - D1c door dignity: threshold stone + two timber door posts flanking the wide entry (lintel exists).
  - D2 verified at decode: stray-face hunted in win_se shutter/lintel region; remove if stray.
  - D3 roof opts into solidRidge=true, trueGableHalf=(D+0.9)/2=2.45.
  - D4 (night clause): entry lantern bead already emissive; verify night.png warm bead; no new light entities (Bill-only).
  Falsification: after gameplay@18m facade reads layered (plinth + stone walls + plaster gable + cased openings), door reads DOOR (posts+threshold+lintel) not void; ridge continuous front/top; decode plinth band y 0.26..1.16, zero new verts in b20 keep-out, bbox unchanged (SAT-neutral same-tuple re-place); night warm bead visible. Revert: revert mkbunk.ts → rebuild returns 49f5acc4 (baseline ×2 proven this tick). SAT preflight vs fresh live census; nearest neighbor nx-town-dyehouse well clear.

  improve-13 EXECUTION COMPLETE (this tick, recovering the dead window):
  the prior window's build a89b29ec was re-verified deterministic ×2, decode
  PASS, but its after-renders predated the final source edit — re-shot fresh
  from pinned bytes. Native judgment (all calls up, no fallback): door reads
  DOOR, ridge continuous (before: notched — direct corroboration), plinth
  reads, back windows cased+proud, top horn-free, zero floating; night FAILED
  (dead black — bead occluded, see v1 note) → v2 entrance bead on the door
  lintel: center (0, y 2.52, z 2.05), spans z 1.97..2.13 proud of the wall
  face, bead bottom y 2.44 clears the 2.31 opening head by 0.13m → night
  PASS (warm lantern above entry), day bead PASS mounted
  not floating. Final sha c8636968 ×2, 16 nodes, materials timber/stone/
  plaster+2 glow buckets. Decode: keep-out NEW=0 (9=9), plinth 312 verts,
  windows proud 162 verts, bbox x/y unchanged, z ±3.5→±2.621 (horn dead).
  Back-view "floating railing past west edge" DROPPED by pixel-diff (region
  byte-stable before/after, roof-overhang geometry predates edit — attention
  artifact, probe law #5). Re-place remove+spawn exact tuple (−9,0,−26) yaw
  0.313225, lib 49f5acc4→c8636968, comp {} both sides; PLACED_VERIFIED
  (2 verbs) + idempotent ALREADY_LIVE_NO_VERBS; 6-leg MCPL door walk
  ALL_PASS 0.333m; rider b20 + light companion nx-town-bunkhouse-l
  untouched, census 259. Placer: next-place-improve13-bunk.ts; walk:
  improve13-walk-bunk.ts; decode: improve13-decode-bunk.ts; renders:
  reviews/improve13-bunkhouse/{before,after}/. Next: windmill guard expires
  09-07 01:57, then queue item 4; then shrine (17, re-ranked Sev 3).

- improve-14 (EXECUTION CONTRACT, queue item 17 `nx-town-shrine`): windmill
  guard still live at 15:2x EDT (rider 09-06 01:57, <24h); row 17 taken by
  the plan's own next-pointer (re-ranked Sev 3). Survey-2 NATIVE-PARTIAL
  stands as the restored-vision re-judgment (bunkhouse precedent; survey-2
  final judgments all-native per a777dc1). Idle-guard clear (last shrine
  mutation polish-278 Aug 31; tex-58/tex-13 earlier; survey reads are
  read-only). Live tuple (−25, −0.0012609260510534298, −4) yaw
  1.4118119548622732, lib 53709062d3095dcc == local rebuild ×2
  deterministic THIS TICK (no disputed bytes; foreign working-tree housekit
  dirt proven non-contaminating — struct-40's hyparShell-only edit, region
  untouched by this build's imports). Comp bag {} (census-fresh). Rider
  nx-artwalk-b7-shrine-stars inverse-transformed host-local ≈ (−0.9497,
  0.2487, −1.1603) at host yaw → KEEP-OUT x∈[−1.55,−0.35], y∈[0.24,1.45],
  z∈[−1.20,−1.03]; all edits at |x|≤0.35, z∈[−0.2,+0.36] — disjoint by
  construction. Findings (survey-2 native-PARTIAL on exact live bytes):
  - F1 votive flames at legibility threshold (~2px warm specks at 18m).
  - F2 offering row borderline-legible pale speck row (improve-1 "clumps
    illegible" downgraded but still below clean).
  - DROPPED (survey-2 native): asymmetric base plate (reads symmetric);
    dead side faces (mottled taper alive).
  FIX (mkv3-shrine.ts only, no housekit change):
  - F1: votive flame radius 0.038→0.055 + emissiveIntensity 1.0→1.25
    (improve-9 proven recipe) — clear warm points at 18m without blob
    noise (stone embers at 0.045 are accepted quiet points; flames sit
    modestly above).
  - F2: pale offering row on the altar top front (bench-facing) edge:
    three rounded mounds (IcosahedronGeometry r 0.06, y-scale 0.6,
    mat 0xdcdcba = candle bucket) at x −0.30/0/+0.30, y 0.505, z 0.24 —
    each ~5.7px at 18m, 0.6m spacing: reads deliberate offerings, not
    smudge.
  Falsification: (1) night-front.png shows ≥3 distinct clear warm points
  (pixel-probe warm-px count materially up vs before); (2) gameplay@18m
  pale offering row legible on the altar; (3) decode bbox unchanged
  (SAT-neutral same-tuple re-place); (4) b7 keep-out zero NEW verts;
  (5) 4-leg approach MCPL walk ALL_PASS; (6) native judge on after
  renders. Revert: revert the two mkv3-shrine.ts edits → rebuild returns
  53709062d3095dcc (baseline ×2 proven this tick).

- improve-15 (EXECUTION CONTRACT, queue item 18 `nx-town-row-cottage`): windmill guard still live (expires 09-07 01:57); row 18 taken by queue order (survey-2 NATIVE-PARTIAL stands as the restored-vision re-judgment, improve-13/14 precedent — re-confirmed NATIVE this tick on the exact live bytes before editing). Idle-guard clear (last mutation interior-8 lineage; sweep tier-2 walks read-only). Live tuple (−23, 0, −17) yaw 0.9411511441487406, lib bd88cd386aec2a89… == local `village_row3.glb` == `mkv3-ring.ts` block 4 rebuild (source-of-truth traced through interior-8/artwalk-28 lineage; mkvillage-houses.ts rowCottage() is a LEGACY builder, NOT live). Comp bag {} (census-fresh 259); light companion nx-town-row-cottage-l at host-local (0, 2.1, 0.40) — untouched, separate entity. Rider nx-artwalk-b18-row-warp-count host-local (0, 2.22, 2.2825) door-crown band — KEEP-OUT x∈[−0.85, 0.85], y 2.0..2.7, z 2.0..2.6; all edits at x=−1.7 or the ridge, disjoint by construction. Native confirm (this tick, gameplay.png @18m):
  - F1 lamp bare dot (CONFIRMED NATIVE): 3–4px emissive core at (368–388, 300–320), zero bracket/housing/mount — decode: node `lamp` bead r 0.06 at (−1.7, 2.35, 2.6), floating 0.35m proud of the front wall face (z 2.25), no fixture geometry anywhere in the build.
  - F2 ridge tab/bumpiness (CONFIRMED NATIVE): bump right of dormer at (596–614, 204–214) + seam notches — the gableRoof 0.92-factor ±0.03-yaw staggered cap class (identical to hall D3 / inn D2 / bunkhouse D3; proven kit opt-in cure).
  - DROPPED (survey-2 native, standing): door jambs complete both sides; dormer clean no seam.
  FIX (mkv3-ring.ts block 4 only, no housekit change):
  - F1: wall lantern fixture around the existing bead — iron wall plate on the front wall face, horizontal arm, drop hook, hood cap above the bead (C.DARK iron family, polish-273/278 mount law: no naked glow dot without visible mount); bead stays KEEP-named `lamp` at its position.
  - F2: roof call opts into `solidRidge=true` (continuous cap, no stagger). No trueGableHalf needed — W 5 < D+2·over 5.3, the gable triangle (±2.5) sits INSIDE the slab edge (±2.65), no horn on this plan.
  Falsification: (1) after gameplay@18m reads a mounted lantern (dark bracket/hood silhouette + warm dot), not a bare dot; (2) after front/top ridge continuous edge-to-edge, no tab right of the dormer; (3) decode audit — fixture verts present at x≈−1.7 z 2.25..2.6 y 2.26..2.57, b18 keep-out zero NEW verts, bbox unchanged (SAT-neutral same-tuple re-place); (4) night.png warm dot retained under hood; (5) MCPL door walk ALL_PASS (fixture above head height, outside door lane); (6) native judge on after renders; (7) 6 ring siblings byte-identical (ring-safety: snapshot → rebuild → restore six, village_tower3.glb carries sibling dirt).
  Revert: revert the two block-4 edits → rebuild returns bd88cd386aec2a89 (baseline == live pin, proven this tick).

  improve-15 EXECUTION COMPLETE (this tick): both fixes landed in mkv3-ring.ts
  block 4; rebuild ×2 deterministic sha add42aeacca2ecc8…; ring-safety
  siblings 6/6 byte-identical (village_tower3 sibling dirt reproduced
  exactly — a989bdc3 both sides); decode audit ALL PASS (fixture nodes
  lamp_plate/lamp_arm/lamp_hook/lamp_hood at x≈−1.7 z 2.20..2.72, KEEP lamp
  bead under hood; b18 keep-out differential 132==132 identical, zero new;
  bbox unchanged 5.9×4.695×5.346 = SAT-neutral; ridge caps staggered →
  uniform −0.12 continuous); night falsification PASS (warm cluster 8px
  peak R 251 under hood, dormer window 36px unchanged); after-judge ZAI
  fallback 2/2 PASS with pixel evidence (hood silhouette + cast shadow
  mount the dot; ridge continuous, tab gone; native 1210 ×2 with paced
  retry — disclosed, native re-judge owed when provider returns);
  re-place remove+spawn at the exact standing tuple (−23, 0, −17) yaw
  0.9411511441487406, lib bd88cd38→add42aeac, comp {} both sides;
  PLACED_VERIFIED 2 verbs + idempotent rerun ALREADY_LIVE_NO_VERBS; 6-leg
  MCPL door walk ALL_PASS maxArrival 0.3838m (historical value unchanged);
  rider b18 + light companion nx-town-row-cottage-l untouched, census 259.
  Placer: next-place-improve15-rowcottage.ts. Review evidence:
  reviews/improve15-rowcottage/{before,after}/. Residual (routed to
  round-1 eye-gate): ZAI noted the bracket arm is 1-2px thin at render
  scale — the mounted read currently carries on hood+shadow; if Bill's
  eye-check finds the mount weak at gameplay distance, one widening pass
  (arm 0.05→0.07) is the standing fix. Interior-8 focused gate pins the
  OLD sha — flagged to interior lane for re-pin (artwalk-58 class, not
  touched by this lane).

Next queue item (improve-16): windmill idle-guard re-check (rider placed
09-06 01:57 — expires 09-07 01:57; if clear, queue item 4 Sev 1 native-
confirmed; else row 20 `nx-town-garden-cottage` Sev 3).

- improve-16 (EXECUTION CONTRACT, row 20 `nx-town-garden-cottage`): windmill
  guard STILL LIVE at 16:22 EDT (rider 09-06 01:57, ~14.5h < 24h) — row 20
  taken by the plan's own next-pointer. Survey-2 NATIVE-PARTIAL stands as the
  restored-vision re-judgment (bunkhouse precedent, a777dc1; re-confirmed
  NATIVE survey-7 slice flow). Idle-guard clear (last host mutation interior-6
  Aug 30; artwalk-27 rider Aug 30; no lane commit touches this entity in 24h).
  SOURCE-OF-TRUTH traced: live lib 872aec35e3aa43b3 == `mkvillage-houses.ts`
  gardenCottage() rebuild ×2 deterministic THIS TICK (interior-6 lineage;
  `mkv3-ring.ts` block 3 `village_garden3` is a SIBLING non-live build —
  improve-15 trap inverted, caught by baseline hash mismatch e0a6a7c4≠live).
  Live tuple (−26, 0.0009494488404761625, 19) yaw 2.2004415094410525, comp
  bag {} (census-fresh 259), light companion nx-town-garden-cottage-l at
  (−25.758, 2.101, 18.823) — untouched, separate entity. Rider
  nx-artwalk-b17-garden-seed-lattice inverse-transform verified against the
  ledger's own host-local record (artwalk-27: exact host-local (0, 2.08,
  1.8325), rider yaw == host yaw, rider bbox ±0.75 x / 0.46 y / 0.136 z) —
  CORRECTED KEEP-OUT (contract amendment pre-edit; the first derivation in
  this tick's draft was wrong): x∈[−0.75, 0.75], y∈[2.08, 2.54], z∈[1.75,
  1.92] — the rider CROWNS THE DOOR. Consequence: NO new geometry above the
  door head (no header course, no raised lintel) — the seed lattice is the
  door's crown; door dignity stays below y 2.03. The windows/front edits sit
  on the N face and front flanks, disjoint by construction (front window
  x-band −1.86..−0.84 y ≤1.98, rider x ≥−0.75 y ≥2.08 — double-disjoint). Sibling outputs of this builder:
  village_tower_house (LIVE 11b31000 — improve-9/10 pin), village_longhouse +
  village_row_cottage (legacy non-live, still byte-compared for safety).
  Findings (survey-2 native on exact live bytes):
  - F1 front face near-featureless — windows dark-on-dark, only central door
    void faint (CONFIRMED). Mechanism by source decode: gc_win_e at x=2.1 is
    the WALL CENTERLINE (wall spans 2.0..2.2) — emissive pane (0.03 thick →
    2.04..2.06) and bone frame (d 0.14 → 2.03..2.17) sit INSIDE the wall;
    the lit pane can never render (improve-12 buried-pane class, stable cure
    proven: seat proud +0.09 → pane/frame past the outer face). Same class
    on gc_win_n (z −1.7 in wall −1.8..−1.6). Doors/frames stay shy of faces.
  - F2 door void faint (CONFIRMED minor): door frame at wall center, 10mm shy
    of the face; no threshold/stoop; opening reads as a hole not a DOOR.
  - F3 garden fence illegible blob (survey-2 NEW sub-finding, CONFIRMED):
    0.14-thin flat C.STONE ribbons at 0.7 grade — no posts, no caps, no
    rhythm; merge into one dark value at 18m.
  - KIT-DEBT present (round-1 append law): gableRoof calls carry NO
    solidRidge (0.92/±0.03 staggered cap — hall D3/inn D2/bunk D3/row F2
    class) and main roof horn 0.05m (W/2 2.2 > trueGableHalf 2.15).
  FIX (mkvillage-houses.ts gardenCottage() only, no housekit change):
  - F1: NEW FRONT WINDOW on the door wall W flank (x −1.35, y 1.05, w 1.02,
    h 0.93) with the improve-12 proud-seat cure baked in: frame + lit pane
    past the wall's outer face (z 2.21..2.35), shutters flanking on the
    face. E wall window gc_win_e re-seated proud (x 2.19→2.30, shutters
    re-flared +x). N wall window gc_win_n stays at −1.7 (its shutters already
    read on the face) but gets a lit pane added at the outer face z −1.81.
    No new light entities (Bill-only).
  - F2: door dignity — doorFrame seated proud (z 1.68..1.86, 0.06 proud of
    the 1.8 face — improve-12 seat arithmetic, NOT a floating offset),
    threshold stone (C.MID, kit semantics), stoop stone at grade
    (doorGapWall stoop law); NO raised lintel/header above the opening —
    the b17 seed lattice IS the door's crown (keep-out above y 2.03).
  - F3: fence posts (7, ~0.85m rhythm) + pale CUT caps + tone-lifted boards
    (plain C.STONE 0x56503c→0x5e5c48 tint mix — legacy builder has no texMat
    infra; a 2-tone board mix gives the rhythm without new infra).
  - KIT: gableRoof opts in solidRidge=true; trueGableHalf=2.15 on the main
    roof (kill 0.05m horn); wing roof solidRidge only (horn-free by shape).
  Falsification: (1) after gameplay@18m reads layered front — cased lit
    windows, cased door with threshold+stoop, plinth reads; (2) night.png
    shows warm panes (F1 buried-pane cure); (3) fence reads posted wall with
    cap rhythm, not blob; (4) decode audit — b17 keep-out zero NEW verts,
    bbox unchanged ±(5.0/2.5+... re-derive), siblings byte-identical (tower
    11b11000, longhouse+row legacy outputs byte-compared); (5) 6-leg MCPL
    door walk ALL_PASS; (6) native judge on after renders. Revert: revert
    the gardenCottage() edits → rebuild returns 872aec35e3aa43b3 (baseline
    ×2 proven this tick). SAT preflight vs fresh live census (footprint
    grows only by fence caps/posts within the fenced plot, re-check corner
    clearance vs carousel 1.061m historical pin — budget for SAT preflight
    before upload).

  improve-16 EXECUTION COMPLETE (this tick): all fixes landed in
  `mkvillage-houses.ts` gardenCottage(); rebuild ×2 deterministic sha
  cee52aca03429a62; siblings byte-identical (tower_house 11b31000 = live
  improve-9/10 pin, longhouse b4ac2df4, row_cottage 30bc8ec3). Decode audit
  10/10 ALL PASS: b17 keep-out differential IDENTICAL 12==12 (zero new/gone
  verts — the crown untouched), win_e pane proud 2.205 (5mm past the x 2.2
  face, improve-12 posture), win_s pane proud z 1.805, win_n pane proud
  z −1.805, gcwall texMat present, bbox growth = fence post-cap extent only
  (x −5.105, z −3.905 — toward open ground, carousel binding face +z
  UNCHANGED). Night falsification PASS: warm px 0→1702 (three lit panes
  render; before: zero — the panes were buried). After-judge ZAI fallback
  PASS with residual (native 1210 ×2, paced retry, disclosed — native
  re-judge owed): F1 "lit two-pane window left of door — strongest feature,
  excellent contrast"; F2 door reads DOOR via stoop ("stoop anchors the
  door"; dark-on-dark residual is isolation-render worst-case side lighting
  + host-rider law — live, the b17 brass/bone lattice crowns the door);
  F3 fence grounded with cast shadow, zero floating geometry. Pre-existing
  margin notes (byte-unchanged regions, attention artifacts probe law 5):
  prop cluster near W wall merges at zero clearance; annex floor edge. Two
  placer lessons hit and fixed IN TICK: (a) square-proxy SAT on the round
  carousel = struct-19 inflation artifact (read gap 0) — replaced with exact
  disc-vs-OBB: standing clearance 1.065m vs artwalk-27's 1.061 pin (4mm
  agree), ALLOWED_ADJACENT, binding face unchanged, gate = regression only;
  (b) my WS verb block never sent the JOIN frame — two 30s timeouts with
  ZERO verbs landing (fresh census proved live untouched, artwalk-32
  pre-place interruption class); fixed to the proven improve-15 chassis
  (join → snapshot → setInterval-paced verbs). Re-place remove+spawn at the
  exact standing tuple (−26, 0.000949, 19) yaw 2.2004415, lib
  872aec35→cee52aca, comp {} both sides, PLACED_VERIFIED 2 verbs + idempotent
  rerun ALREADY_LIVE_NO_VERBS; rider b17 + light companion verified standing
  post-place. Standing interior-6 walk route re-run: 6-leg MCPL ALL_PASS
  maxArrival 0.355m (historical value, unchanged). Placer:
  next-place-improve16-garden.ts; decode: improve16-decode-garden.ts;
  evidence: reviews/improve16-garden/{before,after}/.

- Full house discipline: gate exit 0 before mutation, ledger law EXACT,
  one append per tick, stage only lane-owned paths, never push.
- Comp capture/reapply on every re-place; idempotent rerun proof.
- CLEAN verdicts are recorded results; no manufactured work.
