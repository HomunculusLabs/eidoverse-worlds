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
   [CONTRACT improve-33 (2026-09-07 01:4x — BEFORE edit; decode-first on
   exact local bytes 09938360 == live lib full hash, proven == rebuild
   source mkv3-landmarks.ts windmill block, no disputed bytes):
   DECODE ROOT CAUSES (probe improve33-decode-windmill.ts):
   (R1) MATERIAL CLASS, worst: GLB materials = timber/stone/glow2/glow3
   ONLY — sail cloth+ribs (mat 0xdcdcba), hub (mat 0xa0a248 brass),
   flour sacks/heap are PLAIN mat() → export NO glTF material →
   loader-default near-black (struct-38/improve-31 class). The
   "down-arm-absent / bare rails / banner" reads ARE the black cloth
   vanishing dark-on-dark; canvas also covers only the inner 35% of each
   3.4m whip (y_local 0.75..1.95), leaving the outer half open lattice.
   (R2) GALLERY HALO geometrically true: 0 tower verts in the y[5.0,5.4]
   band; torus r1.9/t0.07 at y5.2 vs tier-2 half-width 1.24 = 0.59m
   standoff, zero brackets/deck — a floating ring.
   (R3) wwin1 HALF-BURIED (improve-12/struct-52 class): y4.7 z1.35 pane
   (z 1.335..1.365) sits BEHIND tier-1 front face (z1.42) for its lower
   0.53m (window spans y4.325..5.075, tier1|tier2 boundary at y4.86) —
   the lit "slot" is the top sliver poking into tier-2's setback; the
   "stray pole" is the DOWN arm's 0.09 shaft at x≈0 crossing the window
   band (sail plane z1.45 only ~0.03m clear of tier-1 face — a scrape).
   FIXES (all in mkv3-landmarks.ts windmill block; kit untouched):
   F1 gallery: timber deck annulus (RingGeometry inner 1.15 outer 1.95,
   DoubleSide, y5.15) + 8 radial timber brackets (0.9×0.1×0.08, inner
   ends embedded in tier-2 wall) under it; existing torus stays as the
   handrail — ring reads as rail-on-deck, halo gone.
   F2 sails: (a) cloth/ribs to a pale cloth texMat family (0xd8d4c4
   tones, rough 0.85 — textured pale, NOT plain mat), hub to warm brass
   texMat+low metal (plain brass = struct-46 desaturation class), sacks/
   heap to the same cloth texMat; (b) canvas extended to the OUTER span
   (y_local 0.9..3.15 of the 3.4 whip, width shaft→spar) — reefed tip
   only; 4 big pale panels = unmistakable sail cross at 18m; (c) sail
   plane z 1.45 → 1.85 (0.4m+ clearance off every tier face; z-max
   stays 2.825 = rfloor extent, envelope x/y/z UNCHANGED → SAT-neutral
   exact-tuple re-place; shaft-crossing-window becomes correct
   rotating-sail mechanics once sails read as sails).
   F3 windows: wwin1 re-seat y 4.7 → 4.5, h 0.75 → 0.6, w 0.55 → 0.5
   (spans y4.2..4.8, wholly inside tier-1 band y3.98..4.86) and z
   1.35 → 1.47 (frame 0.12 proud of the 1.42 face; emissive pane proud
   per improve-12 law). wwin2 re-checked at contract time: ALSO
   quarter-buried (y5.55..5.74 behind tier-2 face 1.24; only the
   tier-3-band top half proud of 1.06) — re-seat y 5.9 → 6.1, z
   1.1 → 1.13 (spans y5.8..6.4 wholly inside tier-3 band y5.74..6.62,
   frame 0.14 proud of the 1.06 face).
   KEEP-OUTS (decode-differential gate): b10 band (x±1.3, y2.4..2.8,
   z1.64..2.63) = 216 verts, sign anchor band [-1.6,2.78,2.5]±0.6 = 0
   verts, rceil front band (z≥2.45, y2.85..3.25) = 0 verts — after-build
   must show identical counts (0 new/gone). Riders b10 + nx-sign-mill-001
   are separate entities, untouched by the placer (verify standing
   post-place). Sails group stays KEEP-named (motion:sails comp target
   unchanged).
   COMPS: live bag captured fresh pre-place in the placer and re-applied
   verbatim post-spawn (comp-wipe law); census hint says a sails motion
   comp may exist (av-windmill lineage) — the placer captures whatever
   is live, re-applies, verifies after.
   FALSIFY: (1) decode audit — cloth/brass buckets present with glTF
   materials, gallery band gains deck+bracket verts, wwin1 pane proud of
   tier-1 face, envelope element-equal, keep-outs 216==216 / 0==0 / 0==0,
   sibling GLBs (belltower3 2419fbc5 / carousel3 0843da4e / inn3
   6e6ff2d0) byte-identical, dirty foreign assets (village_tower3,
   core_paths + review.json) byte-identical to pre-edit backups;
   (2) identical-camera before/after renders, native after-judge at 18m
   gameplay: 4-sail cross reads windmill instantly, gallery reads
   deck+rail attached, lit windows read as windows (fallback ZAI
   disclosed if native 1210); (3) remove+spawn exact tuple (-40,0,0)
   yaw π/2 + comp re-apply + post-place tuple/comp/rider verify +
   idempotent 0-verb rerun; (4) two-way MCPL door walk (enterable mill
   room) ≤0.55m arrivals.
   REVERT: revert the windmill block edits → rebuild returns to
   09938360 → re-place old sha at same tuple.
   GUARD READING (disclosed): host untouched since interior-20 (Sep 1,
   interior-only); waysign's 09-06 touches (waysign-6 01:57, waysign-12
   13:36) re-seated THEIR OWN rider entities against the SAME host pin
   09938360 that stands live now — rider anchors derive against host
   tuple + geometry keep-out bands, both preserved (differential 0), the
   improve-14/15/20/32 proven pattern. Lane tails re-checked fresh at
   execution.]
   [EXECUTED improve-33: R1 material-less sails (cloth/ribs/hub/sacks
   plain mat) + R2 halo gallery + R3 both windows half-buried + sail
   plane scraping tier-1 — ALL fixed in mkv3-landmarks.ts windmill
   block: wm_cloth/wm_brass texMats, canvas to outer span, sail plane
   z1.85, gallery deck + 8 brackets, windows re-seated proud in single
   tier bands (wwin1 4.5/0.6/1.47, wwin2 6.1/0.6/1.13); F4 night-clause
   find: entrance lamp bead buried INSIDE the room since v3 (struct-52
   class) — re-seated proud (0.85,1.7,2.56), first candidate at the
   lintel decode-killed inside the b10 rider box (0.46m y-clear final).
   sha 09938360->369c5724 x2; envelope EXACTLY unchanged (SAT-neutral);
   keep-outs 216==216/0==0/0==0; siblings byte-identical; native
   before-judge confirmed all survey reads on live bytes, native
   after-judge 18m PASS all criteria + night PASS (one 1210 paced
   retry); PLACED_VERIFIED 2 verbs exact tuple + comp {} both sides +
   rider b10/sign standing + idempotent 0-verb rerun; 5-leg door walk
   ALL_PASS 0.393m. Residuals to round-1 eye-gate: bracket stubs small
   at rim extremes, bottom-sail tip crowds lower-window head.]
5. `nx-struct-crossing` — reads as utility-pole clusters; no water/banks/
   stones — ford is a void; clipping posts, snapped stub pegs. Sev 1:
   identity failure. DECODE FIRST. (guard: none)
   [EXECUTED improve-8 (annotation repaired improve-29 — the original
   same-commit annotation was never committed; execution itself landed
   2026-09-06, ledger improve-8, live lib 216c4bd4): monolith re-carve
   2-3:1 village stone tile + crown step + textured-gold sleeve collars
   (brass metal-mat desaturation root-caused offline); ford-is-void
   finding DROPPED as fabricated identity (commission = 4 leaning
   stones, no water); remove+spawn exact tuple PLACED_VERIFIED +
   idempotent; survey-6 native CLEAN on fixed bytes]
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
    [EXECUTED struct-46: interrupted-sibling-window recovery — improve's
    pre-sharding draft (11:56-12:04, candidate 8c1a5047: rod-at-rest +
    reel + line + bobber) was 6h dead, live UNTOUCHED at struct-13 bytes
    b3dfb28a; sharding routed nx-struct-* to struct lane, row taken per
    recovery law. Execution added: (a) struct-38 material law — plain
    mat() dark/brass buckets exported NO glTF material (loader-default
    near-black in-game: the survey's "no rod" was partly THIS) -> dark =
    texMat angler_iron (hypar_iron tones), brass = emissive brass
    0x8a5a20@0.55 (bobber = night water-marker); (b) bobber RE-AIMED —
    sibling target (2.6,0.28,-1.9) decoded AGAINST THE POOL SOURCE:
    lands on the BANK 1.6m short of water (water ellipse semi-axes
    4.5/3.0); new target (2.8,0.144,-4.92) = pool-local (2.8,1.6),
    normalized water radius 0.82, half-submerged at the disc top, 0.6m
    east of the bridge deck, >=0.75m from reeds. Native before-judge
    CONFIRMED all survey findings (plain bench, zero fishing cue);
    native after-judge (v2) PASS: rod propped tip-up reads, line+bobber
    at water height, deliberate+attached, no floating geometry, no
    clipping. SAT: sw-lane class-0b network-bbox block disproven at
    source (centerline arithmetic; rod tip perp 4.09m, true clearance
    2.19m; old solids 2.54m standing); gap-bounded exemption + live
    re-proof bounds in placer. sha b3dfb28a->6bf06a35 x2 deterministic;
    remove+spawn exact tuple (-23.6,-0.0479815,-38.37) yaw -pi/2 comp {}
    both sides, PLACED_VERIFIED 2 verbs + idempotent zero-verb rerun;
    4-leg bank/deck/bench/rail walk ALL_PASS 0.397m; bbox 3.4x1.45x2.2
    -> 4.56x2.79x6.08 crosses room gates honestly (real rod geometry —
    collider now exact trimesh)]
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
    [EXECUTED improve-16 (annotation repaired improve-29 — improve-21
    claimed this annotation landed but it was never committed; execution
    itself landed 2026-09-06, ledger improve-16, live lib cee52aca ==
    source rebuild): F1 buried-window class cured (win_e/win_n proud
    +0.09, NEW cased lit gc_win_s), F2 door dignity (threshold + stoop,
    b17 seed-lattice crown keep-out honored), F3 fence rhythm (13 posts
    pale caps), kit solidRidge+trueGableHalf 2.15 horn killed; sha
    872aec35->cee52aca x2; night warm px 0->1702; PLACED_VERIFIED exact
    tuple + idempotent; ZAI after-judge PASS w/ routed residual]
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
    [EXECUTED improve-17 (annotation repaired improve-29 — improve-21
    claimed this annotation landed but it was never committed; execution
    itself landed 2026-09-06, ledger improve-17, live lib 2419fbc5):
    interrupted-window recovery; stringers+attached rungs, rope anchored
    to beam/cleat, lamp moved inboard off the junction; ENGINE-1 ladder
    comp live over climb plane; PLACED_VERIFIED exact tuple + idempotent;
    2-leg walk ALL_PASS; residuals disclosed to round-1 eye-gate]

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
    [NATIVE-rejudge struct-48 (refine-cadence tick; provider PARTIAL this
    tick — mobius frame judged natively clean): binding law fresh (census
    lib 5617f376 == local sha256, this-tick renders 8/8 byte-identical to
    the struct-47 substrate); rim SMOOTH — struct-42 jag fix CONFIRMED at
    native; posts connected (no hover); half-twist + edge-crossing cue
    legible; identity DELIBERATE MATHEMATICAL PAVILION PASS. One residual
    native note: thin seam-region sliver x490-640 — EXTENDED ray-trace
    fresh over the full cited range: band watertight (576 verts, 0 dups,
    0 open edges), rows y262-266 NEAR-face hits 12.1-12.9m, rows y274-278
    FAR-only threads 21-23m through the designed open aperture, 0
    through-face rays — DECODE+FALSIFIED (struct-42 aperture class, not a
    slit). Row stays EXECUTED/closed. Evidence:
    reviews/struct48-mobius-rejudge/gameplay.png]

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
    [EXECUTED struct-43: form rebuilt — five concentric tier walls, 204°
    wrap, exterior grand stair (0.165 rises) + channel quarter-treads,
    orchestra kerb with south mouth; mast deleted; native gameplay+
    night PASS, walk 10/10; sha 95a98c74 live at exact tuple]

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
    [EXECUTED struct-44: front-bay closure — decode-first root cause (door
    gap ran full wall height; above lintel y2.62 the bay was open sky, the
    y3.15 course crossed sky); one source change: gapped lower band +
    full-ring drum_head 2.62→3.4; raycast RED→GREEN (head ray 13.2→6.8m,
    door ray open both), native after-render PASS (continuous stone
    lintel→dome, bands flush, zero light leaks), walk 5/5 max 0.389m; sha
    3d9d6ae17804c83d live at exact tuple]

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
    ziggurat read, black void interior (no concavity/specular cue), gizmo cross all
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
    [EXECUTED struct-45: root cause DECODED AT SOURCE — the build's zW = H − r²/(4F) INVERTED the parabola (center high, rim low): the "dish" was a convex 3-plateau mound. Fixed: 5 rings centered on the true conic z = r²/(4F) (concave bowl, floor at plinth, rim 0.98m), stand from bowl floor to true focus (1.26m) ending in a 3-prong beaded crown holding the enlarged brass ring, ashlar to family stone texMat lane (struct-38 law — the curvature cue); brass night emissive retained (struct-33). Native before-judge confirmed all 3 findings; ZAI after-judge (native down, disclosed): concave parabolic stepped dish reads "very successfully", fountain identity, no voids/regressions; 18m crown-vs-bar unresolvable at any geometry per ZAI's own framing note (close view: jeweled setting + beaded tips read); sha 5216db0a→f313e59a ×2 deterministic; re-place exact tuple (28.7, −0.026087, −18) yaw 0 comp {}, PLACED_VERIFIED + idempotent rerun, 6-leg circuit walk ALL_PASS 0.354m]

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
    [CONTRACT improve-18 (this): ROOT CAUSE decode-proven at source —
    onBoard() tilts chips −0.21 from HORIZONTAL while the slab is −0.21 from
    VERTICAL, so the chip field is a near-horizontal tray PERPENDICULAR to
    the face (plane-normal dot ≈ 0), smearing ±0.6 fore-aft through BOTH
    faces (36 verts stab through the b22 compass rider on the plaza side —
    the survey's "noise"); authored map spans 2.79×2.76 vs the 2.44×1.64
    bone plate (maxChipX 1.405 vs plate 1.22 — the "stray fragments both
    edges"); census z-extent 2.63 for a ~0.5-deep board. FIX: rebuild the
    map block into a board-local mapG (slab's own tilt+center), chips ride
    the −z face at board-local z −0.115; uniform S=0.55 fits the round map
    (content rim 1.43·0.55=0.787 ≤ plate half-width 1.22; 1.4·0.55=0.77 ≤
    half-height 0.82); skeleton absolute floors preserved (torus tube 0.03,
    spoke width 0.05, hearth r≥0.06 emissive 1.5) so ring+spokes+blocks
    read at 18m; spokes extended hearth→ring (connectivity semantics);
    flatten-to-world-bake before merge (dress-10 direct-children law).
    NOT in scope, recorded residuals: chip layout data stays era-2
    heritage (commons-next cartography needs a scale decision — round-2
    candidate); board orientation + b22 rider untouched (compass = plaza
    face, map = far face, artwalk's committed design; host tuple EXACT).
    FALSIFY: decode audit RED(x8 on baseline)→GREEN; identical-camera
    renders both faces day+night, before vs after; judge confirms face
    reads cartography (ring/spoke/block structure) not noise, zero
    fragments outside silhouette; re-place remove+spawn exact tuple +
    idempotent rerun; census bbox z-extent ~0.5; siblings byte-identical.
    REVERT: checkout mk source, rebuild (byte-repro proven this tick),
    re-place old sha 1f1a10f4dce71a0e at same tuple.]
    [STATE improve-18 (build+audit landed, world untouched — run budget):
    sha 383c6ad3 ×2 deterministic, 24 nodes ==24, 48 elements; AUDIT ALL
    PASS 16/16 (manifest-driven, RED ×8 on baseline); three seating defects
    caught by decode PRE-PLACE (FACE g-vs-mapG frame error; torus hd; pin
    hd) — none shipped; post/plate composite decoded NOT a defect (0.183m
    stand-off). REMAINS next wakeup: renders day/night both faces + judged,
    remove+spawn re-place exact tuple + idempotent + census. Live still
    1f1a10f4; zero uploads/verbs this tick.]
    [EXECUTED improve-19: carryover closed + OCCLUSION ROOT CAUSE found
    during render verification — the bone frame was a SOLID 2.44×1.64
    plate over the whole face whose map-side surface (off −0.0392) sat
    OUTSIDE every chip front (−0.036..−0.006), permanently burying the
    improve-18 flush map (model-local ray: frame hit FIRST from −z; the
    visible "ring" was the torus tube punching through the plate; the
    emissive hearth showed only because it's emissive). Fixes this tick:
    (1) frame → 4-bar border, same plane/tilt/material/footprint (interior
    opens; map-side extremes unchanged — torus −0.066 still the extreme,
    R-121 lamp-n kiss untouched); (2) polish-274 law: the map face points
    away from every light source, so chips+ring+spokes+landmarks carry
    faint same-hue emissive 0.5 (sun-flip experiment proved the mechanism:
    bone content 0→17,946 px); (3) four diagonal district spokes added
    (8-road radial — TRUE: four districts at 45°); (4) ring bldgs r0.68→
    0.74 (house-ring-true) size 0.19/0.16, tangent-rotated (buildings face
    roads). Native judges: noise read SOLVED ("unmistakably intentional
    cartography"), fragments PASS, flush PASS, front face no regression.
    RESIDUAL disclosed (Bill's call, not falsified away): at 8m the ink
    budget still leans emblem over map — judge's proposed fixes (delete
    hub-converging spokes, cartoon road casing, 8× buildings) would
    FALSIFY the village's true radial geometry; struct-45 law applied:
    true form kept, distance-residual disclosed. Probe self-catches this
    tick (disclosed): (a) vision judge read the disc as empty — decode +
    COLOR_0 + raycasts outranked it; (b) first pixel probe classified sky
    as bone (threshold bug); (c) one replace-without-assert re-ran the
    canonical rig (no evidence lost). sha chain 383c6ad3→a4d58880→
    c94749f2→95231f20, each ×2 deterministic; AUDIT ALL PASS 16/16 at
    every step; PLACED_VERIFIED remove+spawn exact tuple (2.5,0,9.5) yaw
    −2.944197, empty comp bag; idempotent rerun ALREADY_LIVE_NO_VERBS;
    census 259, z-extent 2.63→0.543; b22 rider untouched at its pin.]

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
     [DROPPED improve-36 (2026-09-07): pinhole finding CLOSED as probe
     artifact by decode-then-native re-judge on exact live bytes
     d7d3b15c6391aa7e == local village_monument3.glb (no disputed bytes;
     fresh census pin tuple (-7,0,-7) yaw 0.7853981633974483 comp {}).
     DECODE (improve36-decode-monument.ts): the knot is ONE continuous
     watertight tube on the (2,5) curve — TorusKnotGeometry(0.85,0.16,
     140,18) exports 2679 verts = exactly (140+1)×(18+1); re-computing
     the three.js curve at N=4000 samples finds ZERO near-tangent strand
     junctions (global min non-adjacent center distance 0.4837 vs fuse
     threshold 2×TUBE 0.320) — no pass ever gets closer than a 0.164m
     SURFACE gap, so a crack/see-through pinhole is excluded by
     construction; no overlapping passes either (0 fused pairs). NATIVE
     re-judge on fresh-rendered exact live bytes (reviews/improve36-
     monument/): the flagged ~(513,323) pinpoint EXISTS but is a narrow
     window between strands onto the knot's shadowed interior — dark
     umber = interior strands (a true pinhole would bleed sky/ground),
     boundary = smooth tube silhouettes (not torn-triangle edges), and
     the 0.164m clearance seen near-edge-on foreshortens to ~4-5px.
     Knot reads deliberate interwoven sculpture, legitimate through-
     openings, zero damage/artifact reads; walker at 8m: resolvable but
     not salient (one more shadow gap in a busy weave). Row CLOSED
     CLEAN — no edit, no mutation. Pedestal-crafted margin note (one
     more value step on plaque insets) stands as round-2 polish tier.]
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
    [NATIVE-rejudge struct-48 (fixed bytes c32a35a8, binding law fresh,
    renders 8/8 deterministic): strings SOLID-CONTINUOUS all nine —
    struct-41 rod-width fix CONFIRMED at native; rod ground shadows read
    as dashes but struct-41 decode already proved dash centers align
    EXACTLY with the nine rod x-positions — correct-physics nine-line
    shadow, disclosed, not defect; bob shading variation is lighting-
    only within one family; identity reads pendulum wave (frozen sine
    form is the documented design). NATIVE re-judge debt CLEARED. Row
    stays EXECUTED/closed. Evidence:
    reviews/struct48-pendulum-rejudge/gameplay.png]
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
    [EXECUTED improve-20: opt-ins per the proven hall idiom (improve-4
    D2/D3) — gableRoof(g,"roof",W,D,1.7,FY+H,0.4,C.MID,true,D/2+0.4) at
    mkv3-ring.ts block 1; accessor decode on exact live bytes f2344409
    proved the horn (plaster bucket z ±4.250 vs roof slabs ±2.923 = 1.35m
    floating fin each end, back horn WAS the live bbox z-min −4.25);
    native before-judge CONFIRMED both ends (plaster fin cantilevered
    past the roof plane, floating unsupported); fix: plaster z ±2.900
    seated at the roof plane, bbox z-min −4.25→−2.923 (strict subset,
    no new overlap possible); rider b19 keep-out differential 0==0 verts
    at host-local (0,2.22,4.32) porch-roof edge; sha f2344409→e3adcd3d
    ×2 deterministic, 6 ring siblings byte-identical (dirty tower3
    snapshot law, foreign lane state untouched); native after-judges:
    back view CLEAN both ends + left gable view flush/no regression;
    PLACED_VERIFIED remove+spawn exact tuple (9,0,26) yaw −2.828368,
    comp {} both sides, live bbox z-extent 8.551→7.224; idempotent
    rerun ALREADY_LIVE_NO_VERBS 0 verbs; 6-leg MCPL b19 approach walk
    ALL_PASS 0.370m; rider b19 + light companion verified standing]

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

## Round 1 execution log (continued — duplicate header retitled improve-29; single non-overlapping sequence improve-4..7 above, improve-8+ below)

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

**survey-23 sub-section (2026-09-07, ZAI fallback 6/8 + NATIVE 2/8
disclosed — native hard down this tick: 1210 x5 consecutive, paced
retries burned on orchard-rows and meridianstair; every fallback
verdict names its judge):**

- `nx-dress-well` — ZAI Sev 3 candidate (legacy-core off-limits set,
  probe-only, Bill's call — same routing shape as fountain survey-8 and
  hutch survey-20): at 18m the identity rests entirely on the suspended
  bucket + rope; no windlass drum/crank between the posts (span
  x441-520 empty), no water read in the mouth (base reads as a solid
  battered block, zero teal/blue, zero rim highlight at the top edge),
  value crush severe (entire object in darkest 20% band; bucket ~#141414
  merges with posts ~#1f1810; roof soffit melts into post tops), 1px
  rope. Well-envelope grammar note: roof span == base span, no waist.
  Evidence: reviews/survey23-slice/nx-dress-well/
- `nx-dress-bench-plaza` — ZAI Sev 4 candidate (off-limits set,
  probe-only, Bill's call): backless bench reads marginally — the
  second-guess reads are "low rail / fence segment / plank barrier";
  leg-gap + shadow carry the furniture read alone, 3-4px legs at
  shimmer threshold; plank-joint notches at top silhouette (x455-462 /
  x530-537, y365-374) read as gaps at 18m; no backrest geometry. Fix
  direction: lit seat-top face + tighter shadow + wider legs. Evidence:
  reviews/survey23-slice/nx-dress-bench-plaza/
- `nx-dress-charcoal` — ZAI Sev 3 candidate (off-limits set, probe-only,
  Bill's call): kiln function not legible at 18m — reads tan dome with
  grass clumps (turf crown merges to one olive blob, no clump
  separation); NO vent aperture anywhere on the mound; charcoal pile
  x510-592 value-crushed to a near-black void blob reading as a
  terrain hole; smoke = 3-4 detached dark dashes at y310-332 fully
  disconnected from the crown and DARKER than sky (reads insects/
  artifacts — comp bag census-confirmed EMPTY this tick, so these are
  geometry dashes, not a comp; a light-valued vent-anchored plume is a
  dress/improve decision). Evidence:
  reviews/survey23-slice/nx-dress-charcoal/
  [survey-26 second ZAI vote, native still down: CONFIRMS shaft crush
  on sharper evidence — straight rim top edge y369±2 x430-532 with zero
  rim lip/opening/stone segmentation, one-value ~#33241a block; posts
  dissolve into shaft 6px at y366-372; no windlass axle in the post
  span (rope anchor unresolved, "rope glued to roof"); overall well
  read still HOLDS via roof+posts+rope+bucket (silhouette hourglass
  PASS). Row corroborated 2x ZAI, native owed. Evidence:
  reviews/survey26-slice/well/]
  [survey-27 third vote (NATIVE, provider recovered mid-tick):
  CLEAN-with-margin at 18m/960x720 — wishing-well formula PASS (roof
  x425-537 y281-315, posts, 1-2px rope x477-479 y318-343, bucket
  x470-487 y343-358 strongest cue), grounded with contact shadow; margins:
  rope 1-2px dies under resolution loss, well-mouth/hole sub-legible at
  18m, monolithic dark albedo polish-tier. Native-debt PAID. Evidence:
  reviews/survey27-slice/dress-well/]
  [survey-26 second ZAI vote: bench read MARGINAL 6/10 — arc bow ~4px
  sub-perceptual (reads straight rail), band only 13px tall, 7px legs
  at legibility floor, cantilevered ends +~20px add to rail read;
  3-of-4 joints readable as 1-2px seams; zero floats, zero holes,
  shadow contact solid. Rail/fence collapse risk = the standing row's
  core finding, second vote. Native owed. Evidence:
  reviews/survey26-slice/bench-plaza/
  [survey-27 third vote (ZAI fallback): CLEAN-with-margin consistent —
  identity marginal-but-passes (bench vs rail second-guess persists,
  arc bow 3-4px sub-perceptual as shape cue), grounding PASS, joint
  gaps NOT reproduced this frame (<=1px notch jitter); motion-shimmer
  risk on 3-4px legs/notches named Sev 5. Cluster stays
  3x ZAI consistent, native re-judge carries forward. Evidence:
  reviews/survey27-slice/dress-bench-plaza/]]
  [survey-28 fourth vote (ZAI fallback, native 1210 x2 + paced retry
  burned, one ZAI 300s timeout then paced retry landed): NEW
  CONFIRMED-tier finding — seat segment rotation mismatch / warped
  plank read: seat top edge kinks at (450,371) and (519,370),
  silhouette waves ±3px about mean y370 (peaks y366 right end,
  troughs y375 mid-left) — reads warped/broken plank, not intentional
  arc; segments not meeting tangentially (same defect either way).
  Identity weak-PASS (legs+shadow carry it, three evenly spaced legs
  x~391/478/564, symmetric overhang, nothing structurally fence-like);
  grounding PASS (shadow band x356-586 y399-405 contacts all three
  feet); joints PASS at tolerance (<=1px AA seams, no through-gaps).
  Margin: seat height reads LOW (L:H ~7:1 vs expected ~4.5-5.5:1,
  seat resolves ~300-330mm equivalent — kerb/rail territory, the
  primary identity risk corroborating the standing row); right foot
  1-2px light gap (shadow-edge AA probable); D1-vs-arc-intent note:
  prior votes called the bow sub-perceptual (3-4px), this read
  resolves it as a KINK not an arc — decode at source before any
  execution (probe law). Cluster 4 votes: 3 clean-with-margin, 1
  defect-side with new finding. Native tie-break STILL owed. Probe,
  not a verdict. Evidence: reviews/survey28-slice/bench-plaza/]
  [survey-29 (NATIVE) tie-break EXECUTED: CONFIRM — warped double-wave
  plank native-confirmed on fresh live bytes (crests ~x405/x530
  y363-364, valley ~x465 y370, 5-7px amplitude, slope REVERSES
  mid-span = non-tangent joints) + seat-reads-low corroborated (h:l
  ~0.145). Grounding PASS, identity PASS-but-damaged. Cluster CLOSED
  defect-side, native-backed. Evidence: reviews/survey29-slice/
  bench-plaza/]
  [survey-26 second ZAI vote: floating-dash islands RE-CONFIRMED on
  exact pixel regions — dash1 x444-460 y311-316, dash2 x448-462
  y323-328, dot x443-448 y336-340 with void bands between and 7px sky
  gap to the turf cap; dome still has no legible vent aperture; dark
  pile x515-595 y385-403 value-crushed featureless. Row corroborated
  2x ZAI, native owed. Evidence: reviews/survey26-slice/charcoal/]
  [survey-27 third vote (NATIVE): CONFIRM Sev 2 headline — smoke reads
  4 detached hard-edged near-black dashes x442-462 y310-341 in open sky
  (glitch-class, exact survey-23/26 regions reproduced); dark pile
  value-crushed to void x508-596 y377-404; NO vent (identity collapses
  to mound); turf blobs; stick sliver ambiguous grounding x365-396
  y331-403 Sev 4. Native-debt PAID, 3rd vote unanimous. Evidence:
  reviews/survey27-slice/dress-charcoal/]

**survey-24 sub-section (2026-09-07, ZAI fallback — native 1210 x2 +
paced retry burned, hard down all tick; decode cross-check on served
bytes):**

- `nx-town-longhouse` — Sev 4 identity-marginal candidate (improve-own
  domain; native re-judge owed before execution): at 18m reads generic
  dark shed, not longhouse — facade flanks featureless near-black in
  BOTH gameplay (x240-350, x527-585) and front (x250-355, x520-585)
  views, zero plank/frame detail legible; no stone-footing read at the
  wall foot (y~465-470 both views); chimney (x365-400 y183-232) reads
  modern metal flue with rain cap. VOID RULED OUT by cross-check: cast
  ground shadow uninterrupted, nothing shows through — unlit surfaces,
  not holes. DECODE CAVEAT: served bytes carry the FULL village texMat
  family (timber/stone/plaster/iron TEX + 3 warm glows) — the crush is
  chassis-no-ambient aggravated; probe only, confirm-or-drop + decode
  law stays with improve lane. Evidence:
  reviews/survey24-slice/nx-town-longhouse/
  [survey-25 (2026-09-07): NATIVE re-judge on live bytes e3adcd3d
  (served 2014154288019dcb) — debt PAID, Sev 4 CONFIRMED natively:
  flank voids reproduce BOTH sides (L x~232-345, R x~590-730 y~315-478
  zero material variation; shadow diagonal is lighting, not material),
  NO stone footing band anywhere (wall value uninterrupted to ground
  y~478), chimney x~360-395 y~185-235 still reads modern metal flue
  w/ rain cowl (under-scaled for 3 hearths), roof plane flat unbroken.
  NEW sub-finding: porch canopy x~345-615 y~310-340 reads POSTLESS
  (cantilevers ~40% into daylight, no supports to deck y~450) —
  floating-read class, decode before executing. Native outranks the
  ZAI caveat; chassis-aggravation still expected part. Evidence:
  reviews/survey25-slice/nx-town-longhouse/]
  [EXECUTED improve-35 (this lane, 2026-09-07): full cure via improve-34
  build+audit (17 material-less prims → rockfoot footings/masonry
  chimney/porch posts/proud lit panes incl. NEW flank win_w1+win_e1)
  + this tick's emissive-probe resolution, native re-judge
  (back/flank views: lit amber panes, distinct footing band, post-
  supported porch, masonry chimney, zero floats) and PLACED_VERIFIED
  reseat c4aaa783 exact tuple + idempotent + 6/6 walk. Row CLOSED.]
  [CONTRACT improve-34 (2026-09-07 — BEFORE edit; standing judgment = survey-25 NATIVE on exact live bytes e3adcd3d == local village_longhouse3.glb == current source rebuild, no disputed bytes; idle-guard clear — last host mutation = improve-20 own-lane, survey-25/24 read-only):
   DECODE GROUND TRUTH (improve34-decode-longhouse.ts on e3adcd3d):
   25 primitives, 17 MATERIAL-LESS (struct-38 class: roof slabs, porch
   deck/posts/roof, window shutters, floor, chimney, feast props all
   plain mat() → loader-default near-black in-game = the "generic dark
   shed" crush); N-window PANES BURIED (pane z −2.485..−2.455 inside wall
   −2.5..−2.3, improve-12 containment class — lit panes invisible by
   construction); PORCH POSTS: kit porch() axis "z" collapses all 4 posts
   to 2 coincident centerline posts (z 3.55, 96 verts) — deck outer edge
   z 4.25 and roof tip z 4.30 (b19 anchor surface) ZERO support = the
   native "cantilevers into daylight"; PLINTH EXISTS (0.22h × 0.04/side
   proud, stoneTex) but stone tones ≈ timber tones → no value break at
   the foot; CHIMNEY = kit narrow 0.42 stack + 0.58 cap + pot + torus
   rim = rain-cowl gestalt. E/W end walls carry ZERO openings (flank
   voids source-true).
   FIX (mkv3-ring.ts block 1 only + one default-byte-identical wallSpan
   opt-in in housekit.ts):
   F1 porch posts: 2 outer posts 0.10×2.16×0.10 timberTex at (±1.72,
   1.28, 3.75) — grade through deck into slab underside (2.304) —
   canopy reads post-supported; kit center posts stay.
   F2 footing: wallSpan gains optional plinth opts {h?, proud?, tones?}
   (defaults 0.22/0.04/stoneMat = byte-identical, 6 ring siblings
   proven); longhouse opts in h 0.30, proud 0.085/side, canon
   ACCENTS.ROCK ladder [0x8c887e, 0x847f74, 0x77726a] texMat
   "rockfoot" — visible value break wall-vs-foot.
   F3 chimney: kit call REPLACED by hand-built masonry in-block — base
   0.98sq×0.35 at roof plane, shaft 0.62sq to y 5.085, cap slab
   0.80×0.11 top 5.195 (< old rim 5.34, strict y subset), stoneTex, NO
   pot/rim — hearth-chimney read, rain-cowl killed.
   F4 flank windows: win_w1 (x −4.28, z −1.2) + win_e1 (x +4.28, z
   +1.2) axis "x", 0.8×0.8 — panes proud 0.045 outside wall faces,
   emissive amber (lit windows carry the flank read); win_n1/n2 re-seat
   z −2.4 → −2.34 (same buried-pane class cured, proud 0.055).
   NOT in scope (disclosed): roof-slab re-material (material-less roof
   is a village-wide kit class, not a longhouse decision — deferred to
   round-2 kit-debt review); porch deck dark (shadow-floor read,
   acceptable); feast/interior props untouched.
   KEEP-OUTS (differential 0==0): b19 anchor band (|x|≤0.6, y 1.9..2.65,
   z 3.9..4.7 — all new geometry |x|≥1.72 or z<2.5, none can enter);
   b19 anchor SURFACE = porch roof slab UNTOUCHED (no slab edit); light
   companion local (0, 2.2, 0.6) — no new geometry within 0.3m.
   ENVELOPE: strict subset or equal every axis (|x| new max 4.44
   shutter flare < roof 4.65 < floor 4.7; z −2.923..4.301 unchanged;
   y max 5.195 < 5.369) → SAT-neutral exact-tuple re-place.
   FALSIFY: (a) rebuild ×2 deterministic; (b) decode audit — 6 ring
   siblings byte-identical (tower3 == known-snapshot a989bdc3), rockfoot
   material present, panes proud of wall faces, posts at ±1.72/3.75
   grade-to-slab, keep-outs 0==0, envelope subset; (c) identical-camera
   before/after renders (baseline banked before/), native after-judge
   at 18m: footing reads, chimney reads masonry hearth-chimney not
   metal flue, flank windows read as lit windows, porch canopy reads
   post-supported, no new floats; night view; (d) remove+spawn exact
   tuple (9,0,26) yaw −2.828368 + comp {} + rider b19/light standing +
   idempotent zero-verb rerun; (e) interior-walk-longhouse.ts 6-leg
   two-way ALL_PASS ≤0.55m.
   REVERT: git checkout housekit.ts mkv3-ring.ts → rebuild → e3adcd3d
   → re-place old pin.]
  [STATE improve-34 (build+audit landed, WORLD UNTOUCHED — run budget;
   improve-31/dress-82/struct-59 deferred-placement class): edit =
   housekit.ts wallSpan plinth opts (defaults byte-identical) + mkv3-ring.ts
   block 1 (rockfoot footings, kit-chimney→masonry, 2 outer porch posts
   grade-to-slab y0..2.36, win_n1/n2 re-seat proud z −2.54 (contract said
   −2.34 — direction self-catch, back face is −z), NEW flank win_w1/win_e1).
   sha e3adcd3d→c4aaa783 ×2 deterministic; AUDIT improve34-audit-longhouse.ts
   ALL PASS (envelope strict subset y 5.245<5.369, x/z unchanged; outposts
   24+24 verts; chimney 84 verts masonry, 0 above 5.20; b19 slab-band
   0==0, door-lane 24==24); 6 ring siblings byte-identical; before/after
   10-view renders banked reviews/improve34-longhouse/. NATIVE after-judge
   (gameplay 18m): chimney masonry PASS, porch post-supported PASS, footing
   judge-FAIL-vs-pixel-grid CONFLICT (grid shows base-band break
   1e190e→34382b/484a35 at r13→r14; judge read unbroken — break exists but
   modest), flank window reads dark at 18m, night frame zero warm px BOTH
   before and after (rig emissive question unresolved — emissive probe
   improve34-emissive-probe.ts authored but not run). REMAINS next wakeup:
   (1) run emissive probe — if flank/N panes lack live emissive in the rig,
   strengthen (bigger pane/emissive up) per improve-12/15 precedent;
   (2) re-judge; (3) remove+spawn re-place exact tuple + idempotent +
   walk; live still e3adcd3d; zero uploads/verbs this tick.]
  [EXECUTED improve-35 (2026-09-07, recovery tick — deferred placement
   closed): (1) emissive probe RUN and RESOLVED — pane bucket lg3_6
   (all 4 windows, glow2 amber ecdc6f int 1) + fire/flame/lamp KEEP
   meshes carry LIVE emissive in bytes; the zero night warm px was CAMERA
   GEOMETRY (front-elevation rig: N windows on the hidden back face,
   flanks edge-on), NOT missing emissive — no strengthen needed.
   (2) NATIVE re-judge on banked after-renders: back.png N-windows
   CLEARLY LIT amber, footing band DISTINCT, zero floats; right.png
   flank win_e1 CLEARLY LIT, footing DISTINCT, porch post-supported,
   zero floats; gameplay 18m chimney masonry PASS + porch PASS; footing
   pixel-grid break 1e190e→34382b judge-confirmed on back/right (the
   gameplay-front angle was solar-flattened); one 1210 paced retry.
   (3) Reseat next-place-improve34-longhouse.ts PLACED_VERIFIED 2 verbs
   exact tuple (9,0,26) yaw −2.828368 lib e3adcd3d→c4aaa783, comp {}
   both sides, rider b19 + light companion standing, idempotent 0-verb
   rerun; interior walk 6/6 ALL_PASS maxArrival 0.346m. Rebuild ×2
   fresh-deterministic re-proven; audit ALL PASS re-run; siblings
   byte-identical. Row CLOSED.]

**ROUTING (town-4, 2026-09-06, Bill 24h-usefulness directive):** candidates
with no live shard prefix (`nx-welcome`, `nx-court`, `nx-forge`, `nx-cistern`,
`nx-temple-*`, `nx-cultivation-*`, `nx-craft-*`, `nx-gallery-*`, `nx-wild-*`)
default to the IMPROVE lane as primary refinement executor — they are
committed queue rows, so domain law is satisfied. Exception per Bill's
survey-8 call: `nx-dress-fountain` stays DRESS-domain.


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
  [improve-31 CONTRACT (2026-09-07 00:4x — BEFORE edit): take order —
  windmill row 4 idle-guarded until 09-07 01:57 (waysign-6 rider hung
  09-06 01:57, <24h at 00:28 tick start); woodyard is next-worst OPEN
  improve-own SURVEY CANDIDATES row (Sev 3, native survey-7 standing
  re-judgment on exact live bytes). Idle-guard clear: git tail — last
  host mutation = the tex-85 freeze itself; since then only read-only
  sweep/survey pins + rider work on separate entities (waysign-5 sign,
  b11 rider, interior-19 note). Live tuple (16, 0, 31) yaw −2.669815142409043,
  lib 1f2c6f592095b204, comps null, bbox 4.976×2.526×2.599.
  DECODE GROUND TRUTH (improve31-decode-woodyard.ts, DRACO decode of
  the served store-min bytes 80c2e142, plus probe2):
  - ALL FIVE primitives carry material: ABSENT — the whole-asset
    struct-38/55 class. three GLTFLoader default material for
    material-absent primitives is {color white, metalness 1.0,
    roughness 1.0} with vertexColors — vertex diffuse is multiplied by
    a metal-1 surface (diffuse term ~0) → the survey's pure-black blob
    stack, sheenless, no bark/end-grain variation.
  - Every bucket is ONE flat color (source-true old-gen freeze):
    wy3_0 (stack+shed posts/backwall, 1836v) #1a1008; wy3_1 (roof
    slab, 24v) #251c14; wy3_2 (7 ground logs + kindling, 980v) #41250b;
    wy_axe_0 (handle) #41250b; wy_axe_1 (head) #19191d.
  - wy3_0 y-level histogram: cordwood courses at pitch 0.0375 (14
    courses to y 0.465), posts to 2.2; normals ±z dominate (logs axis
    along x). wy3_2: x-clusters pitch ~0.53 (7 log runs), 294 x-facing
    end-cap verts; wy_axe_1 box at (2.62, 0.85, 0.4).
  - The live vertex structure does NOT match current mkv3-woodyard27.ts
    (source ~7300v) — live is an older revision; live-freeze law binds.
  FIX (improve31-woodyard-rebuild.ts — decode→re-encode, geometry
  byte-faithful, POSITION/NORMAL/indices untouched; texMat material
  tier per struct-38 law; UVs derived per-vertex analytically):
  - wy3_0 → two materials: bark texMat [0x6a6030, 0x5f5730, 0x54502a]
    (posts/backwall/tops of courses) and split-face texMat
    [0xa09832, 0x97842e, 0x8a7a2a] (the ±z course faces = log ends).
    Classification: |nz|≥0.9 → split face; else bark. UV = (x·3 + y·14
    mod 1, y·14 mod 1) plane-mapped — course pitch 0.0375 → 0.525-unit
    tile rows so each course reads as its own band.
  - wy3_1 (roof) → mid-timber texMat [0x787250, 0x6f6a49, 0x676344]
    plane-mapped (x·2.4, z·2.4), rough 0.9.
  - wy3_2 (ground logs) → same bark/split pair as wy3_0, split on the
    294 x-facing end-cap verts (|nx|≥0.9); body bark.
  - wy_axe_0 (handle) → split-face flat mat 0xa09832 r0.95 m0 — a
    handled tool reads as its pale wood.
  - wy_axe_1 (head) → iron texMat [0x5c5c60, 0x54545a] r0.4 m0.55
    (mkv3-sign-woodyard.ts idiom).
  - Keep-out: rider nx-artwalk-b11-woodyard-heartwood-measure at
    world (16.3636, 0.75, 31.7126) → host-local center ≈ (0.041,
    0.75, 1.064) (host yaw −2.6698) — geometry untouched so the anchor
    is safe by construction; placer verifies rider standing post-place.
  - Node names preserved exactly (wy3_0/wy3_1/wy3_2/wy_axe group +
    wy_axe_0/wy_axe_1) — comps (none live) and motion anchors intact.
  FALSIFY: (a) rebuild ×2 deterministic; (b) geometry diff vs the
  decoded live mesh: POSITION/NORMAL/index counts identical, envelope
  identical (SAT-neutral same-tuple re-place); (c) identical-camera
  before/after renders (front/right/gameplay/aerial/night) — before
  = the served store-min bytes re-rendered by the same chassis; stack
  reads layered wood (bark vs end-grain tones), not a black blob;
  judge native first, ZAI fallback disclosed; (d) upload (429 pacing)
  + remove+spawn exact tuple + comp null→null + post-place verify +
  idempotent zero-verb rerun; (e) rider b11 + sign nx-sign-woodyard-001
  standing post-place; (f) 2-leg two-way approach walk along the shed
  front (host-local x −2..+2 at z 2.0) ALL_PASS.
  REVERT: re-run placer with prior lib (tuple-identical revert path);
  served store-min bytes banked /tmp/improve31-woodyard-live.glb +
  reviews/improve31-woodyard/before/.]
  [EXECUTED improve-32 (2026-09-07 01:2x — closes the improve-31 contract):
  rebuild improve31-woodyard-rebuild.ts from the banked buckets (geometry
  byte-faithful, no mergeByMaterial — named-node contract preserved);
  sha 1f2c6f59->01b78fdd ×2 deterministic. v1 split tones [0xa09832…]
  judged NATIVE partial-pass (bottom course + stump read correctly; close
  view resolved the "flat slab above" complaint as STRUCTURE TRUTH — the
  5-board windbreak backwall, stack genuinely 2 courses/0.465m per decode,
  course seam visible; right-panel lightness = directional light from
  right, shadow-confirmed); v2 warmed the green cast to tan
  [0xaa955a,0x9c8850,0x8a7a4a] (both judges' one shared critique) ->
  NATIVE 4/4 PASS ship-ready at 18m (one 1210, paced retry recovered);
  night PASS quiet silhouette zero artifacts. Contract deviation disclosed:
  wy_axe_0 got the shared split texMat instead of plain 0xa09832 — a plain
  mat exports material-less (glbwrite emits only texMat/emissive lanes),
  re-introducing the defect class; same pale-wood intent, real material.
  Audit improve31-audit-woodyard.py: 7/7 primitives material+TEXCOORD_0,
  COLOR_0 white, POSITION/NORMAL/idx element-exact vs buckets, envelope
  equal, wy_axe tree preserved, 2888 verts conserved. Reseat
  improve32-place-woodyard.ts: PLACED_VERIFIED 2 verbs exact tuple
  (16,0,31) yaw −2.669815, comp null->null, idempotent 0-verb rerun,
  rider b11 + sign nx-sign-woodyard-001 standing; 2-leg two-way front
  walk 5/5 ALL_PASS worst 0.370m. Idle-guard clear (24h git tail: read-only
  sweep/survey pins only). Gate ALL PASS exit 0 at 5b7518f pre-tick and
  re-run at fd0fa73 pre-mutation (mid-tick sibling HEAD advance absorbed).]
  [survey-25 (2026-09-07): ZAI fallback corroboration on CURED bytes
  01b78fdd (served 0ff7b5de90d9d4d1; native 1210 + paced retry burned):
  cure CONFIRMED at 18m — pure-black blob GONE; ~13-15 end-grain discs
  read (x~376-536 y~377-412, pale split faces vs bark sides), 5-board
  windbreak seams x405/434/463/494 verify the spec, massing hierarchy
  crisp (roof slab / posts / backwall / log row / stump prop), zero
  floats, zero voids, all bases at consistent ground line y~411-413.
  MARGINS (not defects): stack reads 2 courses deep (row, not hoard);
  axe head protrusion only ~2-4px at this distance; stump/axe contact
  shadow weak; dark sliver x~558-582 y~403-411 between right post and
  stump (lying log or shadow — source-check tier). Corroborates CLEAN;
  row may close when improve lane concurs. Evidence:
  reviews/survey25-slice/nx-town-woodyard/]

- `nx-welcome` — Sev 3 (native survey-7): left stub arm detached from
  post (~5px sky gap x466-470 y341-345); welcome text dark-on-dark
  illegible at 18m (board holds sign-identity, welcome semantic fails).
  Evidence: reviews/survey7-slice/nx-welcome/gameplay.png
  [EXECUTED improve-29, 2026-09-07: both findings CONFIRMED at source +
  ZAI before-judge on exact live bytes (native 1210 x2, disclosed, debt
  owed); ROOT = arms centered at ax*0.8 stop 0.11-0.19m short of the
  post AND rotation.y swings inner ends 0.07-0.15m sideways — 4-iteration
  decode-driven loop: v1 local-x embedding FAILED its own audit (yaw
  swing), v2 uniform-w pivot distorted reach, v3 sign error, v4 ACCEPTED
  — each arm RADIATES from the post toward its original far tip (tips
  preserved, envelope strict-subset live bbox, inner ends 0.031-0.036
  all rows); F2 name-bar idiom (monument/mapboard lineage): dark band
  0.92x0.25 + pale carved glyphs enlarged to cw0.036/ch0.042 (bar covers
  full 5-row band, 0 glyph verts outside); sha 362c5be1->7d1bd0c9 x2
  deterministic; AUDIT ALL PASS (envelope/below-grade/bar-coverage);
  ZAI after-judge 3/3 PASS (arms attached, inscription reads as text,
  zero floats); reseat remove+spawn 2 verbs exact tuple comp {} both
  sides, PLACED_VERIFIED + rider b25 + light companion standing + 
  idempotent zero-verb rerun; walk 3/3 ALL_PASS 0.000/0.280/0.389.
  Residual disclosed: native after-judge owed (1210 this tick); the
  welcome WORD itself stays sub-legible at 18m by geometry (band reads
  as inscription, per the contract's stated 18m expectation).]
- `nx-town-potter` — Sev 4 identity-marginal (native survey-7): wheel
  disc reads generic flat ellipse (could read table/press), pot on ~1px
  spindle reads floating (x470 y352-360); shelf pots sub-pixel texture.
  Craft-station read holds; potter-specific read rests on sub-pixel
  cues. Related: nx-sign-potter-001 emblem fix is waysign R2 work.
  Evidence: reviews/survey7-slice/nx-town-potter/gameplay.png
  [improve-37 CONTRACT (2026-09-07, this tick — BEFORE edit): round-2
  re-arm take, town-4 routing (improve-own, no shard prefix). Idle-guard
  clear (36h lane-tail: read-only sweep/survey potter walk+pin commits
  only, no mutation since interior-15 @ lib dad7c82e). Live pin census
  fresh: tuple (26,0,40.5) yaw -2.5834592128922376 scale 1, lib
  store/dad7c82efbf3202b.glb, comp bag motion:pwheel spin {axis [0,1,0],
  pivot [0,0,0], degPerSec 9} (CAPTURE + re-apply on re-place), light
  companion nx-town-potter-l + rider nx-artwalk-b3-ruled-porch separate
  entities (keep-out: rider host-local (1.55,0,0.35), back-edge posts).
  Baseline: local sha dad7c82e… == live pin prefix, rebuild ×2 proven
  this tick (no disputed bytes); before-bytes banked
  reviews/improve37-potter/before/. DECODE (this tick): 10 nodes = 7
  static buckets + pwheel group (fly+head timber 140v, throwing clay
  52v); envelope x [-1.725,1.71] y [-0.002,1.015] z [-1.0,0.706].
  ROOT CAUSES at source (mkv3-potter41.ts): D1 fly = SOLID uniform
  timber disc r0.45 h0.09 y0.28 — zero internal structure at 18m AND
  the spin comp rotates a featureless disc = motion invisible; reads
  table/press ellipse. D2 head y0.85 on 0.09-wide post (≈5px at 18m,
  no value breaks) + narrow throwing pot r0.08 → floating read. D3
  shelf ware 3× r0.09/h0.16 ≈ 9px < legibility floor.
  FIX (three falsifiable fronts): F1 spoked flywheel — DELETE solid
  disc, add iron rim torus (r0.46 tube0.03 y0.28) + iron hub (r0.07
  h0.10) + 6 timber spokes 0.05×0.06 hub→rim at 60° pitch, all INSIDE
  pwheel group on the [0,1,0] axis (spin pivot stays valid; open
  sectors make the standing 9°/s spin VISIBLE = identity cue). F2
  support read — pw_post 0.09→0.14, collar 0.22² at y0.36, head
  under-flare cone (r 0.16→0.09 h0.06) at y0.82, throwing pot widened
  r0.11/0.08 h0.10 seated on head top y0.925. F3 shelf ware — bottom
  tier 2 pots r0.13/h0.22 + r0.10/h0.18, top tier 1 wide bowl r0.14/
  h0.10 at z -0.85 (top y0.88). Envelope: all additions ⊆ live bbox
  (rim ±0.46 < 1.725; y ≤ 1.015; z ≥ -0.99 > -1.0) — SAT-neutral
  same-tuple re-place.
  Falsification: (1) after gameplay@18m — wheel reads WHEEL (open
  sectors + rim, not solid ellipse), pot visibly supported (collar/
  flare mass transitions), shelf bumps resolvable on tier silhouette
  (native preferred, ZAI fallback disclosed); (2) decode audit: pwheel
  group intact, all spin-part geometry on-axis (centroid x,z = 0 ±
  1e-6), node count ≤ 12, envelope ⊆ baseline; (3) rebuild ×2
  deterministic; (4) re-place remove+spawn exact tuple + comp re-apply
  via placer FILE + idempotent 0-verb rerun; (5) potter approach MCPL
  walk legs re-run PASS. Revert: revert mkv3-potter41.ts → rebuild
  returns dad7c82e (banked).]
  [EXECUTED improve-37 (2026-09-07, this tick): full closed loop on
  exact live bytes. Build: sha dad7c82e→2062c446 x2 deterministic,
  12 nodes (7 static + pwheel group of 3 folded buckets: iron rim+hub
  241v, timber spokes+head 208v, clay throwing pot 64v); AUDIT ALL
  PASS — envelope strict-subset vs true before-bytes (x ±1.725/1.710,
  y -0.002..1.015, z -1..0.7063541 bounds byte-equal), pwheel spin
  axis verified by unique-vertex min/max symmetry (raw centroid probe
  INVALID — mergekit welds duplicated verts asymmetrically, self-caught
  on the centered throwing-pot cylinder). VISUAL: gameplay 18m NATIVE —
  D2 PASS (column continuous, no gaps), D3 PASS (shelf bumps 12-19px,
  two distinct silhouettes + notch), D1 judged FAIL-at-18m but
  struct-13 framing-limited (wheel interior ~0.08% of frame vs ~2%
  floor; judge itself conceded sectors compress to sliver) — pixel
  falsification of the judge's "uniformly dark" claim: wheel box 67.4%
  ground-through vs 79.2% BEFORE (open sectors measurably present);
  motion-a/b zero-delta traced to chassis (setMotionPhase animates
  carousel/well/kettle/horses only, never pwheel — probe artifact #2);
  front ~8.5m concept-distance ZAI fallback (native 1210 ×2 burned,
  paced retry, disclosed): WHEEL READ PASS — rim ring resolved
  (428-537×386-449), near-side open sectors resolved (right
  497-528×410-434, left 434-462×412-440), hub resolved (473-492×407-426),
  5-6 spokes individually distinguishable, column continuous at 1-px,
  zero floats (far-sector compression = viewing geometry). Reseat
  next-place-improve37-potter.ts: baseline pin gate → upload (1st try)
  → remove+spawn+comp 3 verbs exact tuple (26,0,40.5) yaw
  -2.5834592128922376 lib dad7c82e→2062c446, motion:pwheel spin
  re-applied (capture verified BEFORE), rider b3 + light companion
  standing, PLACED_VERIFIED; idempotent rerun ALREADY_LIVE_NO_VERBS
  0 verbs; MCPL walk 6/6 ALL_PASS maxArrival 0.366m (historical pin
  matched). Gate ALL PASS exit 0 pre-mutation at 0989074.]
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
  [improve-30 CONTRACT (2026-09-06, this tick — BEFORE edit): take order:
  windmill row 4 idle-guarded until 09-07 01:57 (waysign-6 rider 09-06
  01:57, <24h at 23:48 tick start); court is next-worst Sev 3. Standing
  re-judgment = survey-8 NATIVE on exact live bytes 59534b10 (improve-13/14
  precedent) + fresh census this tick lib 59534b10 UNCHANGED; native vision
  down this tick (1210), findings re-root-caused at source + pixel-probed
  on banked survey-8 frames. Idle-guard clear (court LIB_STABLE across
  waysign-38/39/52/55 holds; 19:28 local GLB = sibling baseline rebuild
  only, live untouched). Live tuple (18.9, −1.59e-08, −14.8) yaw −0.90756,
  comp bag particles:smoke {origin:[-4.9,3.2,-0.8]} (capture + RE-APPLY via
  own placer). Baseline: local 59534b10 == live == rebuild (verify ×2 this
  tick). Keep-outs (census inverse-transform fresh): b28 bake-count
  (−3.0, −1.955), b29 strike-count (3.2, −1.875) — pad 0.3m.
  SOURCE-TRUE mechanisms (mkv3-ring.ts block 7, screen-projection match):
  F1 no-court-grammar: no bench/banner/beam exists anywhere in the yard
  (source grep). F2 black voids: open fronts show unlit C.DARK floors.
  F3 orphaned plank = 6-paver strip (−1.5..1.5, z −0.6..0.7) seen through
  the yard gap — projects exactly to survey x455-500 y428-444 (px probe:
  plank-green (113,126,100)+timber (76,72,53) on grass). F4 left-roof
  stub = gable triangle hw=w/2=2.7 > roof half-depth (BD+2over)/2=2.45 →
  0.25m plaster horn into the yard gap (proven trueGableHalf kit debt,
  addRoofAt carries no opts; px probe: dark protrusion at x440-465 vs
  clean sky right). F5 floating lamp = glow("lamp",−4.6,2.6,2.6) — comment
  promises "lamp on a post", NO post built (improve-15 bare-dot class; px
  probe: warm dot (255,232,144) in pure black).
  FIX (mkv3-ring.ts block 7 only, no housekit change):
  F1a court bench INSIDE the yard gap as the bridging member: 3 seat
  slabs 1.6×0.07×0.34 + legs, y 0.46..0.53, z −0.78..0.78 at x ±0.55 —
  the gap reads as shared furnishing, not missing building. F1b justice
  beam across both shed fronts: tiebeam_court 5.6 long at y 2.62,
  x −0.1 (fronts at z 1.99) + brass scale-bead pair on the beam
  (keep-out z ≤1.6). F2 keep-open warm: 2 sconce beads flanking each
  front inside (bakery x −4.4/−2.4, workshop x 2.4/4.4, y 1.85,
  z 1.7, r 0.05). F3 pavers → 2 flagstones flush under the bench
  (x −0.4/0.4, z 0, 0.75×0.06×0.6, stoneTex). F4 addRoofAt gains
  solidRidge/trueGableHalf opts (default = old behavior, siblings
  byte-identical); court opts in trueGableHalf=(D+2*over)/2, horn 0.25m
  killed, strict-subset bbox. F5 iron post under the bead: 0.07 sq ×
  2.32 (y 0.15..2.47) + arm + collar, bead recentered (−4.6, 2.55, 2.6).
  FALSIFY: (a) decode — horn verts gone (gable z ±2.45), post verts at
  x −4.6±0.04, bench/beam z-extents, b28/b29 keep-out 0 new verts,
  envelope strict-subset; (b) rebuild ×2 deterministic; (c) 6 ring
  siblings byte-identical; (d) identical-camera before/after renders:
  horn gone, lamp post visible, bench/beam read, night warm beads; (e)
  remove+spawn exact tuple + smoke comp re-apply + PLACED_VERIFIED +
  idempotent zero-verb rerun; (f) next-walk-court.ts 4 legs ALL_PASS.
  REVERT: git checkout mkv3-ring.ts, rebuild → 59534b10, re-place + comp.]
  [EXECUTED improve-30, 2026-09-07: all five findings landed in one pass;
  RED→GREEN proven on true baseline bytes (HEAD-source rebuild 59534b10 ==
  live pin exactly — audit FAILs ×8 on baseline: horn |z| 2.700, zero
  bench/beam/flags/beads; edited build passes ALL). Build chain: v1
  b1a4a65f — audit caught merged-statics blindspot (renamed emissives to
  KEEP prefixes lamp_scale_/flame_sconce_, mergekit regex verified) and
  pixel falsification caught sconces OCCLUDED at z 1.7 behind the front
  wall (struct-52 containment class) → v2 77cab2c3 jamb-mounted at the
  front plane z 1.99; night warm px 307→360 (new clusters both
  thresholds), gameplay 442→510, front 147→177; bench/beam read in the
  yard-gap band (dark 86,91,70 → timber 113,126,100). NATIVE after-judge
  6/6 PASS (glm-5.3-flash recovered mid-tick — first call 1210, retried):
  "reads as a shared COURT" (beam+bench+furnishing carry the read, judge's
  own decomposition), horn gone "nothing juts above the roofline", lamp
  post reads, warm-lit thresholds not dead voids. Rebuild ×2 deterministic
  77cab2c3; 6 ring siblings byte-identical (longhouse e3adcd3d, tower3
  a989bdc3 known-snapshot value, garden e0a6a7c4, row add42aea, hall
  c92c1f91, bunk3 e4c0651d non-live file — live bunkhouse is
  village_bunkhouse.glb c8636968). Envelope decode strict-subset (x ±6.5,
  y −0.2..4.169, z ±2.94/3.0 — byte-identical mins/maxes); horn
  roof-band |z| 2.700→2.470 (rake-corner bound 2.48); post grounded
  y 0.12..2.47 at (−4.6, 2.2) + stone foot 39 verts at grade; bench 144+
  168 verts, beam 59, flags 24, scale beads 120, sconces 240; b28/b29
  keep-outs 0 new verts; KEEP lamp/fire/fire2/flame survive. Re-seat
  remove+spawn+comp 3 verbs at exact tuple (18.9, −1.59e-08, −14.8) yaw
  −0.90756, lib 59534b10→77cab2c3, smoke comp
  {origin:[−4.9,3.2,−0.8]} re-applied, PLACED_VERIFIED + idempotent
  zero-verb rerun; riders b23/b28/b29 verified standing post-place;
  two-way 4-leg court walk ALL_PASS 0.340m; census 265 steady. Residual
  disclosed: justice beam meets the shed fronts at the very top of the
  openings (y 2.62 vs 2.3 header) — reads as roofline tie in the native
  judge's read, routed to round-1 eye-gate with this row. Evidence:
  reviews/improve30-court/{before,after}/.]
  [survey-25 (2026-09-07): ZAI fallback corroboration on CURED bytes
  77cab2c3 (served 06b47d4fb436d642; native 1210 x2 + paced retry
  burned — owner's native after-judge outranks fallback dissent):
  ALL FIVE survey-8 defect classes read FIXED — both openings
  warm-filled (dome-oven ember cluster (218,368)-(240,396); hearth
  firebox (698,373)-(737,396)), four jamb sconce beads read attached,
  zero orphans/zero horns/zero floating dots, beam spans the gap
  (462,288)→(498,301). RESIDUALS (margin-tier, fallback-judged):
  bench reads as solid gray block x~524-586 y~398-446 (U-form
  unresolved at 18m from this angle); lamp post not visible in this
  gameplay frame (chassis vantage; F5 decode + owner walk stand);
  portal slot x~466-496 dark upper 80% (judge suggests a bead under
  the beam ~(480,310)); left-shed sconce pair height-mismatched
  (296 vs 337) vs right-shed level pair. Corroborates-with-residuals;
  no reopening. Evidence: reviews/survey25-slice/nx-court/]
- `nx-forge` — Sev 4 identity-marginal (survey-8, ZAI fallback): reads
  furnace/oven-hut, not forge — anvil illegible (flat plate x532 y380,
  no horn/waist/stump), no hood over hearth, left appendage
  x412-432 y343-392 pure dark blob; hearth opening x435-497 y358-400
  black void w/ blobby glow; floating right plate x532 y379 (gap
  x522-528 y378-386); quench barrel marginal (no contact shadow
  x510-530 y402). Glow alone carries identity. Evidence:
  reviews/survey8-slice/nx-forge/gameplay.png
  survey-16 NATIVE re-judge (live bytes served 783c3bb2,
  reviews/survey16-slice/forge-views/): CLEAN 4/4 — furnace +
  stacked chimney + side hood + anvil-on-stump all read, firebox
  emissive glow anchors identity instantly, contact shadows ground
  everything, zero voids (survey-8 "floating plate" reads as
  tool/stock sliver, attached); row may close (ZAI Sev 4 was
  identity-marginal; native upgrades to clean, margin only).
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
  survey-16 NATIVE re-judge (served 39e513dd,
  reviews/survey16-slice/cistern-views/): CONFIRM, Sev raised
  4→2 — 18m gameplay read = closed dry crate, zero basin/water
  cues, identity weak-fail; TOP cross-check: water plane EXISTS
  and reads navy-still inside the OPEN LEFT HALF (recessed rim
  legible) but the right half is a flush closed panel — polish-281
  shadowed-interior sibling class; fix lane per polish-271/281
  lineage: palette #506a78 + same-hue emissive + widen/recess the
  basin opening so the tank read survives 18m.
  [improve-28 CONTRACT (2026-09-07, this tick — BEFORE edit): ZAI
  fallback corroborate on banked survey-16 before-views CONFIRMS
  class (no water read / closed flush top / plain dark box read /
  zero floats — unanimous with survey-16 native). DECODE GROUND
  TRUTH (local == live d3d3ad75, rebuild ×2 deterministic): water
  plane EXISTS as `bc_water` at y=0.45, 0.72×0.44m, palette law
  colors correct (#506a78 base + #2e4a58@0.45 emissive) — NOT a
  polish-281-class missing/dark material; the mechanical root is
  RIM OCCLUSION: sight-line math (eye 1.65m → water back edge)
  crosses the near rim (0.62m) at 0.485m at 18m / 0.601m at 4m —
  the water plane is geometrically hidden from every standing
  vantage >2.5m. survey-16's "right half flush panel" = the lid
  leaning on the E side occluding the tank's right half from its
  camera. F1 FIX: raise water y 0.45→0.60 (17cm below rim) —
  sight-line at near rim becomes 0.631m@18m / 0.732m@4m (VISIBLE
  at all distances); same palette + emissive per law. F2 (Sev 3):
  basin read at 18m carried by water plane + rim profile; raising
  water alone widens the visible water band ~3× (back edge now
  visible over near rim) — no geometry reshaping, keeps SAT/bbox
  unchanged (water stays inside footprint). FALSIFICATION: (a)
  decode water y 0.60 exact; (b) after-render 18m gameplay frame
  must show a visible blue/navy interior band (before frame shows
  none — ZAI-judged this tick); (b2) top view unchanged water
  disc; (c) walk leg past cistern stays ALL_PASS. REVERT: rebuild
  from git source (deterministic d3d3ad75) + re-place. Judge
  plan: native first; ZAI fallback acceptable disclosed (row
  confirm class = unanimous across both judges already).]
  [EXECUTED improve-28, 2026-09-07: fix = water y 0.45→0.60 +
  emissive 0.45→0.70 (in-tick v2 after native 18m judge showed
  emissive wasn't the day lever; skymirror-37 0.7 precedent);
  rebuild ×2 deterministic 156b4fc8 (v1 30c45c0a superseded);
  decode GREEN — footprint x/z byte-identical SAT-neutral, 0
  below-grade, 338/338 verts, water bucket 0.44/0.46→0.59/0.61
  asserted; pixel falsification front 0→602 navy px (stone row
  89,85,62 → water 36,61,73), gameplay 0→31px sliver, night
  0→34px emissive band, top 3023→3096; native after-judge front
  4/4 PASS (glm-5.3-flash recovered mid-tick), 18m residual
  DISCLOSED per struct-45 distance law (2px geometry-bound
  sliver; water read is the approach-range 2–8m read, native-
  passed at 600px band); reseat remove+spawn 2 verbs exact
  tuple lib d3d3ad75→156b4fc8, comp {} both sides, PLACED_VERIFIED
  + rider b23 standing unchanged, idempotent zero-verb rerun;
  walk 3/3 ALL_PASS 0.000/0.248/0.261; row closed.]
  [survey-22 annotation, 2026-09-07 — NATIVE 18m gameplay re-read on
  post-fix bytes 156b4fc8 (fresh fetch, curl UA, byte-pinned this
  tick): water-read at 18m gameplay STILL FAILS — zero teal/blue
  px anywhere in the asset bbox (415-525 x 352-399); top slit
  (438-481 x 358-366) reads dark umber, merging with the near-rim
  interior wall, not water; overall read stays "closed dry crate
  with leaning plank." Native calls improve-28's own after-judge
  (front-view 602px navy band + approach-range contract,
  struct-45 distance law) CAMERA-ANGLE-divergent from the survey
  chassis's 18m gameplay view. PROBE, not a verdict — the row's
  executed state stands; question for the next improve pass (or
  Bill): is the 18m gameplay water-read a contract the cistern
  must meet (fix direction: raise water to ≥0.75 tank height /
  widen the rim opening / saturated cyan-teal + stronger
  emissive), or does the 2–8m approach read close it? Evidence:
  reviews/survey22-slice/nx-cistern/gameplay.png (judge = native
  glm-5.3-flash, no fallback needed this object)]
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
  survey-16 ZAI-fallback corroboration (served f4fcc0ac,
  reviews/survey16-slice/fountain-views/): re-CONFIRM, Sev
  reconciled 4→3 — shape identity PASSES both views (canonical
  basin→pedestal→bowl→finial stack, no floats, clean silhouette)
  but main-basin water-read FAILS at 18m AND aerial (dry matte
  brown interior, no blue/gloss/jets; the small upper tier alone
  shows the correct teal-blue treatment — the fix template is
  already in the asset).   survey-18 NATIVE corroboration (served f4fcc0ac,
  reviews/survey18-slice/fountain-views/): shape 4/4 PASS
  natively; main-basin water FAIL in BOTH gameplay and top
  views (unanimous across all judges); upper-bowl water EXISTS
  as #3D5F80 disc in top view but reads dark at gameplay
  grazing angle — upper-tier fix template confirmed
  CONDITIONAL (angle-dependent). Row stands Sev 3; ownership
  stays Bill's call.
  (legacy-core off-limits set unchanged).
- `nx-temple-seed-0003` — Sev 4 (survey-8, ZAI gameplay + top): flat
  rubble/mosaic read confirmed from BOTH angles — flower-of-life disc at
  constant height, no central seed core or vertical form (uniform
  shallow shadows prove no raised mass); reads crop-circle/paving, not
  seed; no ground contact shadow at gameplay (x310-655 y412-418).
  Design caveat: 4-seed family shares ONE sha — if confirmed at
  decode, the fix is family-wide (0003/0013/0022/0047-class).
  Evidence: reviews/survey8-slice/nx-temple-seed-0003/{gameplay,top}.png
  [improve-38 CONTRACT (2026-09-07, this tick — BEFORE edit): round-2
  re-arm take 3, worst-first OPEN improve-own row (Sev 4, family 4/4
  UNANIMOUS: survey-8 ZAI 0003, survey-11 ZAI 0013, survey-12 NATIVE
  0021, survey-13 ZAI 0034 — flat ~30:1 disc, no seed core, no vertical
  element, pasted-on shadow). town-4 routing (no shard prefix; temple
  district = improve's own surface). Idle-guard clear (git tail 36h: no
  lane commit touches any seed; last mutations nvp-era placements;
  survey-8/11/12/13 reads only). FAMILY DEGENERATE-CONFIRMED fresh this
  tick: census 271 — all four ids (0003/0013/0021/0034) share ONE live
  lib store/710ec3e5c66a0378.glb at yaw -2.35619449, comps {} x4,
  nearest neighbors >=5.09m (gravel path 5.09, mile marker 7.01, no
  riders, no light companions), live bbox 6.55x0.12x6.55. Baseline
  NO-DISPUTED-BYTES proof: agents/arthur/mason/glb-retex/
  work_1644_seed.glb sha256 710ec3e5c66a0378c08eea518a597c43445ae3f15
  dd6249dfd5c26b41a534425 == live pin exactly; before-bytes banked
  reviews/improve38-seed/before/ (9 views rendered on exact bytes).
  BUILD CHAIN: mason.ts composeSeedOfLife (THEMES idx 6; works 1644/
  1657/1670/1683; composer voids its rng -> one shared sha) ->
  mergeByMaterial -> toGLB -> glb-retex/work_NNNN_seed.glb. 60-work
  sibling hash snapshot banked /tmp/improve38-retex-before.txt.
  DECODE GROUND TRUTH (review-model-grade on baseline: 3 nodes, 2
  buckets plaster+timber (familyPass mapped C.BONE->plaster,
  C.MID->timber), stone borders = 19 circles of 32 segs each (608
  segs), all at y 0.06, stone size 0.16x0.12x0.10, ring radii R=1.1
  and 2R=2.2). ROOT CAUSE: the classic construction is drawn purely
  as FLAT border stones — the center circle has NO core, and nothing
  rises above y 0.12; at 18m the whole reads as a flat mosaic disc
  (the survey-8 "crop-circle/paving" identity failure).
  FIX (mason.ts composeSeedOfLife only; family-wide by construction —
  same composer builds all four works):
  F1 SEED CORE (identity): central monolith group (ashlar texMat by
  familyPass C.STONE mapping) — base plinth cylinder r 0.52 h 0.55 +
  tapered shaft r 0.52->0.30 h 1.15 + ovoid cap icosahedron r 0.30
  scaled y 1.6 at top, total height 2.45m, all centered (0, *, 0)
  INSIDE the disc's empty center (ring 1 stones at r 1.1, core fills
  the void). COLLIDER LAW CHECK: height 2.45 > 2.2 AND footprint
  42.9m² >= 8m² => roomScale=true => exact trimesh, honest collision,
  disc stays walkable; the 0.22–2.2m uneven band is avoided by design.
  F2 SEED WORD (night identity): one brass bead (iron family
  C.BRASS->iron, emissive) named `lamp` (KEEP anchor) r 0.045 at
  (0, 2.58, 0) atop the cap — a quiet warm point marking the temple
  marker at night; day reads as unlit warm stone (polish-278 class).
  F3 GROUNDING: contact shadow comes free via the renderer's sun
  castShadow (all meshes cast) — the monolith's shadow proves raised
  mass to the gameplay view.
  ENVELOPE: monolith + bead ⊆ disc footprint (r 0.52 << 3.275
  half-extent; y 2.58 total vs 0.12 baseline — height growth is the
  POINT of the fix (vertical presence), footprint byte-stable at the
  same tuple; SAT-neutral (no horizontal growth).
  FALSIFICATION: (1) rebuild ×2 deterministic (same output sha both
  runs); (2) 56 sibling works byte-identical (only 4 seed files
  change; compare against /tmp/improve38-retex-only-seeds.sh
  snapshot); (2b re-run outputs compared byte-for-byte); (3)
  decode audit — node census (3->4: plaster/timber buckets + lamp
  bead + no stray), y-extent 0..2.58, core on-center (unique-vertex
  min/max symmetry), zero verts below grade; (4) identical-camera
  before/after renders — after gameplay@18m reads vertical seed
  marker (monolith silhouette over disc), night shows quiet warm
  point; (5) native judge preferred, ZAI fallback disclosed; (6)
  upload (429 pacing, shared budget) + remove+spawn exact tuple for
  ALL FOUR seeds (family set-completion: one upload, 4 spawns, one
  ledger entry, artwalk-d class) — placer gates on baseline lib
  710ec3e5 at each exact tuple, accepts new pin; (7) post-place
  census: 4 seeds at new lib, comps {} x4, 271 steady; (8)
  idempotent rerun zero verbs; (9) NO walk required — non-enterable
  open ground (floor-shaped disc now room-scale trimesh; walk legs
  unnecessary; walk gates already standing from SW batch placer era).
  REVERT: re-run placer with prior lib 710ec3e5 (tuple-identical);
  source revert = git checkout mason.ts -> rebuild returns 710ec3e5
  (proven this tick).]
  [STATE improve-38 (build+audit landed, placement DEFERRED fail-closed
  on judge flap — improve-31/dress-85/struct-61 class): 3-version
  source arc, all in mason.ts composeSeedOfLife — v1 3c233f78 caught
  PRE-render by gate reading (monolith used plain mat() inside the
  sol_core group; familyPass walks top-level children only -> nested
  plain mats export MATERIAL-LESS = improve-32 deviation class,
  loader-default near-black in-game) -> v2 f9d00690 real texMat stone
  + emissive bead (tw_flame idiom 0xffc98a/0xffa45f/1.25); NATIVE
  after-judge v2 gameplay@18m: IDENTITY PASS (156px vertical
  silhouette breaks horizon, shrine/obelisk grammar), MONOLITH PASS
  (taper 58->22px, cap 32px ovoid, plinth step, block courses
  resolvable), GROUNDING PASS (AO band 305-650x424-437 + disc rim
  thickness), DEFECTS FAIL — bead floated ~0.1m: judge read a 6-8px
  sky wedge at the bead flanks (~480,282-287); root cause GEOMETRIC
  (cap is a 45-deg cone from its apex vertex — vertex-embed
  arithmetic leaves flank sky even with the apex inside the ball)
  -> v3 e35efe72 bead nestled to center y 2.44 (lower hemisphere
  fully inside the cone; apex 0.04 < r 0.045 = ball swallows the
  tip). Rebuild ×2 deterministic (dedicated improve38-rebuild-seed.ts,
  masonretex chassis, --again determinism mode; baseline restored
  from banked before/ between runs); FAMILY_ONE_SHA x4 (1644/1657/
  1670/1683 all e35efe724cd998e6); sibling diff EXACTLY 4 lines (56
  works byte-identical vs /tmp snapshot). DECODE AUDIT ALL PASS: 7
  nodes (2 flat buckets + sol_core group + 3 core meshes + lamp KEEP
  bead), real materials (stone texMat + glow3 emissive [1.25,0.464,
  0.143]), footprint ±3.275 BYTE-IDENTICAL (SAT-neutral), 0 below
  grade, y 0..2.545. Renders banked reviews/improve38-seed/{before,
  after,after-v3}/. v3 after-judge: native 1210 ×2 + paced retry
  burned (flap law) -> NO placement under the standing waiver (bead-
  attach is the one unjudged contract criterion; the v2->v3 change
  is documented geometric arithmetic, not a judged PASS). Live world
  unchanged: all four seeds still at 710ec3e5, census 271. REMAINS
  next wakeup: (1) v3 after-judge native-first (bead attached, no
  sky gap = the flip criterion); (2) on PASS: upload ONE lib
  (429 pacing, shared budget) + remove+spawn x4 exact tuples +
  post-place census (4 seeds @ e35efe72, comps {} x4, 271 steady) +
  idempotent rerun; (3) annotate EXECUTED. Revert: baseline banked
  reviews/improve38-seed/before/baseline-710ec3e5.glb; source revert
  = git checkout mason.ts + rebuild returns 710ec3e5 (proven).]
  [EXECUTED improve-39 (2026-09-07, this tick — family 4/4 PLACED_VERIFIED):
   v3 after-judge NATIVE FAILED honestly — bead-float TRUE and one level
   deeper: export pipeline DROPS mesh .scale (cap exported bare ±0.30
   sphere, top 2.30; v3's nestle arithmetic targeted a phantom 2.48 ovoid
   top — gap 0.095m = the judged 5px sky wedge, pixels+accessors agree).
   Judge's "no contact shadow" claim FALSIFIED by before/after pixel-diff
   (0 px changed outside the monolith column; v2 grounding PASS stands).
   v4: ovoid baked into geometry (cap.geometry.scale(1,1.6,1) — pitfall-4
   transform-survival class) + bead re-derived against the TRUE surface
   (center 2.465; bottom 2.42 buried 0.06m into the 0.145-wide crown
   shoulder; 2/3 ball proud; zero sky by construction). 699387ab ×2
   deterministic, FAMILY_ONE_SHA ×4, 56 siblings byte-identical, decode
   ALL PASS (cap y 1.520–2.480, bead 2.420–2.510, footprint ±3.275
   byte-identical SAT-neutral, 0 below grade). Pixel probe pre-judge: 0
   sky px in flank box. NATIVE after-judge 4/4 PASS (bead flush at seam
   y280–283, obelisk read 15:1, AO-grounded, zero floaters). ONE upload
   + remove+spawn ×4 exact tuples (8 verbs) → all four ids at store/
   699387abdef0b16f.glb, census 273 steady, idempotent 0-verb rerun.
   Night probe: exactly 12 warm px at the bead, 0 in baseline — quiet
   warm point (polish-278 class). Banked: reviews/improve38-seed/
   {before,after-v3,after-v4}. New export law banked: never trust
   mesh.scale to survive toGLB — bake non-unit scales into geometry.
   Source revert = git checkout mason.ts + baseline-710ec3e5.glb.]
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
  [Family cured by improve-42 (kitchen-garden rebuild, family-wide composer); all five members including this one reseated live at new libs.]
  [survey-10 annotation, 2026-09-06]: garden-0019 (NATIVE, 18m
  gameplay, live store bytes d916f373) — IDENTICAL class confirmed:
  sphere mass reads hedge/shrubbery not crops, rows merge into one
  mass x300-560 y360-425, no bed/fence geometry, 3-4px stalk heads
  on 1px stems fragile. Geometry integrity clean (all grounded).
  Family class now CONFIRMED at 2-of-5 (0011/0019). Evidence:
  reviews/survey10-slice/nx-cultivation-garden-0019/gameplay.png
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
  [survey-10 annotation, 2026-09-06]: hamlet-0015 (distinct sha
  353dd6fb, NATIVE, 18m gameplay) exhibits the IDENTICAL class —
  see-through tower hole x418-512 y428-497, detached stair string
  x555-685 y220-300, free-floating dash slabs, orphaned upper-left
  slab cluster, hovering upper masses w/ sky beneath. Family class
  now CONFIRMED at 2-of-5 (0007/0015) — executing lane should treat
  as family-wide unless decode says otherwise. Evidence:
  reviews/survey10-slice/nx-craft-hamlet-0015/gameplay.png
  [EXECUTED improve-24, 2026-09-06: 0015 cured by the committed family
  fix (improve-22 composeHamlet cure already in mason.ts HEAD — zero
  source edits this tick; dead-window probe script pre-staged, I=1635
  confirmed) and RESEATED live — lib 353dd6fb → b5a9de3d ×2
  deterministic, tuple unchanged (79.285079, −0.019684, 38.519433) yaw
  −2.35619449, embers restored, live bbox y-span 13.177 → 4.467,
  footprint x/z byte-identical (SAT-neutral same-tuple), walk 8/8
  ALL_PASS 0.381m; both judges down (native 1210 ×2, ZAI 300s ×2) —
  source-grounded under standing waiver, visual PASS not claimed,
  after-renders banked reviews/improve24-hamlet/after/. Siblings
  0028/0041/0054 remain queued.]
  [survey-19 annotation, 2026-09-07, NATIVE 18m live bytes: 0015 native
  debt CLOSED — 4/4 PASS (cured); verify-tier monitors only (roof-plane
  shadow gap x305-375 y225-290, roof specks x818-845 y278-295 —
  non-blocking). Evidence: reviews/survey19-slice/
  nx-craft-hamlet-0015-views/]
  [EXECUTED improve-23, 2026-09-06: 0007 cured at source (composeHamlet
  slot fix, improve-22) and RESEATED live — lib e2f134cf → edd3da3e,
  tuple unchanged, embers restored, walk 8/8 ALL_PASS, ZAI after-judge
  4/4 PASS. Siblings 0015/0028/0041/0054 confirmed byte-stable = still
  corrupted, queued next ticks. Native re-judge debt disclosed.]
  [survey-19 annotation, 2026-09-07, NATIVE 18m live bytes: 0007 native
  debt CLOSED — 4/4 PASS, zero defects (grounding/sky-beneath/hole/
  floats all cured); family verdict 5-of-5 CURED per improve-27's 0054.
  Evidence: reviews/survey19-slice/nx-craft-hamlet-0007-views/]
- `nx-gallery-mosaic-0036` — Sev 3 (survey-9, 2026-09-06, ZAI + native
  UNANIMOUS): mosaic-panel identity FAILS at 18m — hundreds of loose
  tiles flat on grass read as scattered paving/confetti scatter, not
  an artwork; no frame, no backing, no coherent panel outline survives
  distance; silhouette dissolves into noise. No floats/voids (tiles
  flush, closed boxes). Fix class: merge/frame into one legible panel
  (texture-family pipeline candidate). Family note: 4 mosaics
  (0036/0048/0052/0059) distinct shas — verify pattern spread.
  Evidence: reviews/survey9-slice/nx-gallery-mosaic-0036/gameplay.png
  [survey-10 annotation, 2026-09-06]: mosaic-0048 (distinct sha
  b6491515, NATIVE, 18m gameplay) — IDENTICAL class confirmed: flat
  scatter w/ ~50-60% ground show-through, no frame/backing at any
  rim, far edge aliases into horizon, ragged orphan-tile front edge,
  no pictorial pattern (random tan/gray/gold). Family class now
  CONFIRMED at 2-of-4 (0036/0048). Evidence:
  reviews/survey10-slice/nx-gallery-mosaic-0048/gameplay.png
  [improve-40 CONTRACT (2026-09-07, this tick — BEFORE edit): round-2
   re-arm take 4, worst-first OPEN improve-own row = MOSAIC family
   (Sev 4, 4/4 UNANIMOUS: survey-9 ZAI+native 0036, survey-10 NATIVE
   0048, survey-11 ZAI 0052, survey-12 NATIVE 0059 — panel identity
   fails at 18m on every member; distinct shas). town-4 routing (no
   shard prefix; gallery district = improve's own surface). Idle-guard
   clear (git tail 36h: zero nx-gallery-mosaic mutations since the
   nvp-era placements; survey reads only). NATIVE before-judge PAID
   this tick on exact live bytes work_1643 (reviews/improve40-mosaic/
   before/): confirms ALL classes — reads scattered paving/confetti
   not artwork, zero frame/backing/outline, ~65-75% ground
   show-through, edges dissolve all four sides, far field aliases to
   detached 1-4px dash noise. Live pins census-fresh (273): 0036
   (38.971143,-0.023303,22.5) / 0048 (0,0.001575,45) / 0052
   (-38.971143,0.012804,22.5) / 0059 (-38.971143,-0.040735,-22.5),
   all yaw -2.35619449 scale 1, comps {} x4, libs ==
   store/{1655ae80,b6491515,83c4817f,505bec0b}.glb, bbox 21x0.05x21
   each, no riders, no light companions. BASELINE NO-DISPUTED-BYTES:
   improve40-rebuild-mosaic.ts (masonretex chassis, no-write mode)
   reproduces ALL FOUR live pins byte-identically this tick; local
   glb-retex outputs == live libs; before-bytes + 10-view renders
   banked reviews/improve40-mosaic/before/. Build chain: mason.ts
   composeMosaic (THEMES idx 5; works 1643/1656/1669/1682; rng(i+1)
   per work -> 4 distinct shas) -> familyPass -> mergeByMaterial ->
   toGLB -> glb-retex/work_NNNN_mosaic.glb. 60-work sibling snapshot
   banked /tmp/improve40-retex-before.txt.
   DECODE GROUND TRUTH (improve40-decode-mosaic.ts on work_1643):
   658 tesserae, rings 0..13, rad 0.6..10.35, ALL y 0..0.05; 5 merged
   buckets = plaster 3816v / stone 3216v / timber 3000v / iron 2760v /
   MATERIAL-LESS 3000v (=125 gold 0xdec64e tiles: familyPass maps only
   the five C tones, gold accents keep plain mat() -> export NO glTF
   material -> loader-default near-black = struct-38 class INSIDE this
   asset); ring pitch 0.75 vs tile 0.3 -> ~60-70% ground show-through
   source-true; zero frame/backing/medallion.
   ROOT CAUSES: (R1) loose-tile scatter — no frame, no backing, grass
   reads through every ring, edges dissolve (survey class); (R2) the
   gold accent lane renders near-black (material-less) — the one
   pigment that would organize the pattern is a void; (R3) no center
   anchor — the radial read has no focal element and far rings alias
   to detached dash noise.
   FIX (mason.ts composeMosaic only; family-wide by construction —
   same composer builds all four works; rng voided for the authored
   geometry, kept for jitter):
   F1 BACKING: three ring-annulus slabs (radEnd 2.25 / 5.75 / 9.0 =
   interior extent +0.15 overhang), h 0.045/0.045/0.06, radius-jittered
   ±3%, REAL texMats mos_dark [0x4a4636,0x504a3c,0x423e30] r.92 s2.2
   and mos_mid [0x787250,0x807c58,0x6c6846] r.92 s2.2 — kills ground
   show-through; the artwork becomes one coherent slightly-raised
   panel mass.
   F2 FIELD: interior rings rad 0.6..8.85, tessera count
   ceil(2π·rad/0.42) ARC-PITCHED (tangential gaps ~0.12 max), tessera
   size 0.36 falling to 0.30 by ring, NO arc jitter (set-tile read),
   radial jitter ±0.03 kept; palette C.BONE/C.MID/C.STONE weights
   [2,1,1] + 5% gold; RING AT rad 2.85 = FULL GOLD RING in mos_gold.
   F3 GOLD LANE: new texMat mos_gold [0xd4a43c,0xc2942e,0xb8862a]
   rough .6 metal .35 scale 1.2 — real material, art-glass gold,
   brighter than the iron-lane C.BRASS map (golds are the artwork's
   pigment, not hardware).
   F4 BORDER: dark course ring rad 9.55 (C.DARK 0.44x0.07x0.30) +
   pale cap ring rad 10.20 (C.BONE 0.46x0.055x0.34, alternating +0.02
   proud) — the panel outline survives 18m; outer vertex radius
   <= 10.49 vs baseline 10.50 (footprint subset, SAT-neutral).
   F5 MEDALLION (center anchor, group survives merge like sol_core):
   pier-textured base cyl r0.95 h0.10 (mos_dark family) + ashlar
   plinth r0.62 h0.30 + shaft r0.22 h1.90 + gold disc r0.42 h0.10
   (mos_gold) + emissive brass finial sphere r0.10 (mat C.BRASS r.55
   emissive 0x9a6a28 @0.65 — ninesbridge bead verbatim), top y 2.60.
   HEIGHT LAW: total 2.60 >= ROOM_MIN_H 2.2 and footprint 441m² >= 8
   -> roomScale -> exact trimesh, honest collision, mosaic floor
   stays walkable around the medallion; a 2.0m medallion would land
   in the 0.22-2.2 uneven-lie band and float the whole 21x21 floor
   at top-protrusion height (improve-38 law, Bill's own report
   class). Ashlar tones verbatim [0x56503c,0x5c5a44,0x4c4836]
   r.95 s2 w[2,1,1] cell 32.
   F6 NIGHT: the emissive finial = one quiet warm point (polish-278
   class); no new light entities.
   ENVELOPE: footprint strict-subset (border 10.49 < 10.50 baseline;
   backing 9.0; medallion r0.95) -> SAT-neutral exact-tuple re-place
   x4; y 0..2.60 (vertical presence is the point of F5).
   FALSIFY: (1) rebuild x2 deterministic (--write then --again);
   (2) 56 sibling works byte-identical vs /tmp snapshot; (3) decode
   audit — zero MATERIAL-LESS buckets, gold bucket carries
   TEXCOORD_0, medallion element heights (0.10/0.40/2.30/2.40/2.60),
   border outer radius <= 10.49, envelope x/z subset vs before-bytes;
   (4) identical-camera before/after renders, native after-judge 18m:
   panel reads FRAMED MOSAIC ARTWORK (border outline visible,
   continuous field, gold ring resolves, medallion anchors center,
   zero dissolve/confetti), night shows one quiet warm point; (5) on
   PASS: FOUR uploads (paced 20s+, shared 4/min budget, 429 backoff)
   + remove+spawn x4 exact tuples + comp {} x4 + post-place census
   (273 steady, all four libs flipped) + idempotent 0-verb rerun;
   (6) NO walk — floor-shaped artwork on open ground, roomScale
   trimesh keeps it honestly walkable; approach legs stand unchanged.
   REVERT: git checkout mason.ts -> rebuild reproduces the four live
   pins (proven this tick) -> re-run placer with prior libs;
   before-bytes banked reviews/improve40-mosaic/before/.]
  [STATE improve-40 (2026-09-07, this tick — BUILD+AUDIT complete, placement
   DEFERRED fail-closed on placer neighbor gate): source edit =
   mason.ts composeMosaic full cure; self-catch in-tick: palette divisor
   4.75 -> 4.2 (committed 5% gold accents, was shipping 15.8%). Rebuild
   x2 deterministic FOUR_NEW_SHAS 1643 f2faa018 / 1656 751485c7 / 1669
   68be6c5a / 1682 c237715d; 56 siblings byte-identical vs
   /tmp/improve40-retex-before.txt (exactly 4 lines diff). Decode AUDIT
   ALL PASS: zero MATERIAL-LESS buckets, mos_gold 3100v TEXCOORD_0,
   medallion heights exact (base .14-.24 / plinth .24-.54 / shaft .54-2.44
   / disc 2.44-2.54 / finial 2.40-2.60), outerR 10.490 <= 10.49, y
   0..2.60, 13 nodes. After-renders banked reviews/improve40-mosaic/
   after/ (10 views). JUDGE: native 1210 x2 + paced retry HARD DOWN —
   ZAI fallback 6/6 PASS disclosed (framed mosaic artwork, continuous
   pale-cap + dark-course border, ZERO grass show-through, gold ring +
   disc read gold, medallion grounded focal anchor, zero floats/
   artifacts; margins: interior rings soft at 18m, gold ring arcs
   broken by plinth = designed foreground). Night probe: exactly 8 warm
   px at night ALL in the finial box vs 58870 day = one quiet warm
   point PASS. PLACEMENT BLOCKED FAIL-CLOSED (next-place-improve40-
   mosaics.ts neighbor gate, census 274): nx-dress-goats pen (pos 34,13
   yaw -1.2, bbox 14.21x6.5 LOCAL fat-network class pitfall-0b) has
   its true long-axis corner region INSIDE mosaic-0036's disc footprint
   (nearest rotated corner (40.53,20.82) = 2.29m from disc center
   (38.97,22.5); disc R 10.49) — standing world coexists because live
   tiles are sparse rings, but the SOLID bed_base disc would bury pen
   posts 5cm (new defect class). NOT exempted blind (0b law: decode
   actual goat-pen vertices before any exemption or redesign). REMAINS
   next wakeup: (1) decode goats true solids (store/c47861e4) in
   mosaic-0036 local frame; (2) redesign backing per decode — leading
   option: bed_base stays full disc ONLY if pen solids prove outside
   r10.49; else clip the 0036-family backing to terraced ring annuli
   that clear the pen sector (border ring r9.55/10.2 at the rim is far
   from the pen crossing and stays) — family note: 0048/0052/0059
   neighbor-clear, only 0036 carries the pen overlap, but ONE composer
   builds all four — a sector-clip needs a per-work param or the
   overlap resolved geometrically; (3) re-judge if geometry changes;
   (4) run placer (idempotent chassis stands ready). Live world
   UNCHANGED: all four mosaics still at baseline libs, census 274
   (absorbed sibling struct-65 wavepergola arrival). Zero uploads, zero
   verbs this tick.]
  [STATE improve-41 (2026-09-07, this tick — DECODE-ONLY closure, family
   placement DEFERRED to Bill, no mutation): committed step (1) decode
   goats true solids executed and it CHANGED THE VERDICT SCOPE — improve-
   40's "0048/0052/0059 neighbor-clear" premise was census-bbox evidence;
   source-true decode of ALL standing neighbors (improve41-decode-goats.ts,
   hash-domain law: local village_goats3/village_mobius3/village_millrace3
   sha16 == live lib names; served /library/store bytes are DRACO store-min
   and hash differently — store fetch is reachability-only) proves the
   gallery row is structure-entangled in EVERY disc:
   | slot | intruder (lane domain) | decode-truth |
   | 0036 | nx-dress-goats (dress) | solids to r2.202, 584v in bed r9.0,
     1000v in r10.49, sectors 150-300deg (plaza-facing incl. approach
     bearing), pen y -0.00..1.28 |
   | 0048 | nx-struct-mobius (struct) | stands ON panel: nearest low vert
     (y<=2.6) r2.421 -> medallion clearance 1.471m (pinch law passes by
     71mm), bed film meets legs, gold ring r2.85 threads leg cluster |
   | 0052 | nx-approach-nw-lamp-001 post (approach, ground-layer lane
     network) | inside bed at r7.76, light at y1.96; millrace 35.2m clear,
     nearest pen solid 40.8m |
   | 0059 | nx-struct-millrace (struct) | penetrates to r7.892, 967v
     inside r10.49, y -0.00..2.00, bearing 79.9deg |
   FAMILY LAW CONFLICT: the v2 cure's SOLID bed disc is lawful only over
   clear ground; every disc carries a foreign-domain standing structure.
   Per-slot sector clips would gut the panels (0036 penetration INSIDE
   the r2.85 gold ring; 0048 mobius legs mid-field; 0059 millrace spans
   the east half). The four discs sit as ONE Bill-approved gallery row
   (nvp-105 exception class) — reseating any member is a row siting
   decision crossing dress/struct/approach domains; no foreign lane may
   be asked to move by this lane without routing. JUDGE DEBT PAID this
   tick: native UP opportunistically, re-judged improve-40
   after/gameplay.png — FRAMED YES / field CONTINUOUS / medallion reads
   monument finial / zero floats / identity FRAMED MOSAIC ARTWORK
   (margin: mid-radius gold ring reads as arcs broken by plinth =
   designed foreground, pre-classified in contract). The v2 bytes stand
   judged PASS by both judges. PLACER PARKED fail-closed (SLOTS emptied,
   deferred-invariant gate x4 verified all four at baselines LIVE this
   tick, re-arm templates commented in chassis). BILL'S CALL (row siting):
   (a) RESITE the row to clear ground r~45 on a fresh bearing — my
   recommendation: family whole + judged bytes as-built, 4 reseats, zero
   redesign; (b) partial place 0048+0059 with per-slot accommodations
   (mixed row state, clips needed); (c) keep row, revert to scattered
   baseline (Sev 4 stands); (d) move the three intruders instead
   (crosses three foreign lanes — heaviest). Live world UNCHANGED census
   274, all four mosaics at baseline libs, zero uploads zero verbs zero
   comp edits.]
- `nx-wild-cairn-0022` — Sev 3 (survey-9, 2026-09-06, ZAI + native
  UNANIMOUS): stacked-stone identity passes but TRUE FLOATERS —
  numerous small pebble spheres hover isolated against the sky above
  the stack tops (both judges: detached, touching nothing); shreds the
  row's top silhouette; secondary: smooth spheroid stacking flirts
  with blob-heap read. Fix class: drop/snap floaters onto surfaces.
  Family note: 5 cairns (0022/0043/0047/0048/0050) distinct shas —
  verify the floater class spread before fleet work.
  Evidence: reviews/survey9-slice/nx-wild-cairn-0022/gameplay.png
- `nx-cultivation-lavender-0006` — Sev 3 (survey-10, 2026-09-06, NATIVE,
  18m gameplay, live store bytes 26f0eed9 HTTP 206): lavender identity
  FAILS — desaturated purple-charcoal (~#4a4044) canopy reads dead
  crop/winter scrub, not lavender (identity at gameplay distance is
  ~90% hue; mid-value violet needed); discrete-blob front row with
  gaps reads potted-plant grid, not continuous hedgerow strips; rows
  illegible past ~3 deep (zero soil/furrow contrast); ambiguous
  central-aisle void x430-545; suspected stray scatter specks above
  canopy (x65-95/x348-368/x865-885, verify-tier). Family note:
  4 lavenders (0006 first judged) — family spread unverified.
  Evidence: reviews/survey10-slice/nx-cultivation-lavender-0006/gameplay.png
- `nx-cultivation-orchard-0012` — Sev 3 (survey-10, 2026-09-06, NATIVE,
  18m gameplay, live store bytes dc4d7059 HTTP 206): orchard identity
  FAILS — irregular organic spacing + merged crowns read forest-edge
  tree line, not orchard (no regular planting pitch, no legible
  alleys); right-half value collapse to near-black void under single
  key light (x540-960 worst at far-right tree); detached blob-shadow
  ellipses offset from trunks misaligned with light (x520-565/x690-735
  y462-500); fruit sub-pixel noise (~2-3px dots). Trunk grounding
  PASS (all bases contact). Family note: 5 orchards (0012 first
  judged) — family spread unverified.
  Evidence: reviews/survey10-slice/nx-cultivation-orchard-0012/gameplay.png

### survey-11 family-class extensions (2026-09-06)

Second members judged on distinct shas; extend the standing family
classes family-wide unless decode dissents (confirm-or-drop stays with
the executing lane). NATIVE 2/8 + ZAI fallback 6/8 disclosed — native
flapped mid-slice; every verdict corroborates an already-NATIVE family
class except seed (ZAI-native stack 0003+0013).

- `nx-craft-hamlet-0028` — Sev 2 (survey-11, ZAI): IDENTICAL to
  hamlet-0007/0015 class — flanking masses L x95-390 / R x545-870
  float with open sky beneath (undersides y125-215), see-through hole
  x655-795 y80-120, detached stair slabs x0-135 y58-135 + two airborne
  slab rows x545-670 y225-298, broken bridge planks x395-545 y26-46 —
  family 3-of-5. Evidence:
  reviews/survey11-slice/nx-craft-hamlet-0028/gameplay.png
  [EXECUTED improve-25, 2026-09-06: 0028 cured by the committed family
  fix (improve-22 composeHamlet cure in mason.ts HEAD, work index 1648)
  and RESEATED live — lib 032b6e24 → 44d78463 ×2 deterministic, tuple
  unchanged (65.396745, 0.0016024, 58.883493) yaw −2.35619449, embers
  restored, live bbox y-span 13.311 → 4.724, footprint x/z
  byte-identical (SAT-neutral same-tuple), rim 81.20–95.30 legal,
  minGap +0.540 vs cloister-0029, PLACED_VERIFIED + idempotent
  zero-verb rerun, walk 8/8 ALL_PASS 0.381m; ZAI fallback after-judge
  3/3 PASS with pixel evidence (native 1210 down this tick, disclosed —
  native re-judge owed); after-renders banked
  reviews/improve25-hamlet/after/. Siblings 0041/0054 remain queued.]
  [survey-19 annotation, 2026-09-07, ZAI 18m live bytes: 0028 debt
  re-judged (native hard down after flap) — PASS, cure confirmed; one
  cosmetic margin (pole tip x428 y365 reads detached, sub-threshold).
  Native re-judge debt rolls to a future tick; evidence:
  reviews/survey19-slice/nx-craft-hamlet-0028-views/]
- `nx-cultivation-garden-0032` — Sev 3 (survey-11, NATIVE): IDENTICAL
  to garden-0011/0019 class — rows merge into continuous hedgerow
  x240-755 (two short gaps only), tan sprouts interspersed = weed
  grammar, no bed substrate/border/fence; fringes dissolve x160-235 /
  x745-800; geometry grounded — family 3-of-5. Evidence:
  reviews/survey11-slice/nx-cultivation-garden-0032/gameplay.png
  [Family cured by improve-42 (kitchen-garden rebuild, family-wide composer); all five members including this one reseated live at new libs.]
- `nx-cultivation-lavender-0027` — Sev 3 (survey-11, NATIVE):
  IDENTICAL to lavender-0006 class — plant luminance ~22% vs ground
  ~68% (charcoal-purple dead read, darkest element in frame), hue
  near-neutral at 18m, rows fused past ~2 deep, stray 2-4px speck
  clusters along band top y350-364 (x95-235 / x455-545 / x600-880) —
  family 2-of-5. Evidence:
  reviews/survey11-slice/nx-cultivation-lavender-0027/gameplay.png
- `nx-cultivation-orchard-0020` — Sev 3 (survey-11, ZAI): IDENTICAL to
  orchard-0012 class — crown band x0-960 reads continuous forest edge
  (sky gaps slot-scale), right-cluster value collapse x680-960 (worst
  x918-960 y140-235), z-fight banding x695-800 y318-378; trunk rhythm
  + fruit litter PASS — family 2-of-5. Evidence:
  reviews/survey11-slice/nx-cultivation-orchard-0020/gameplay.png
- `nx-gallery-mosaic-0052` — Sev 3 (survey-11, ZAI): IDENTICAL to
  mosaic-0036/0048 class — no frame/backing, field runs off both
  lateral edges, ground show-through throughout, far-field dissolve
  band y345-392 (tiles unresolvable ~40px); geometry clean — family
  3-of-4. Evidence:
  reviews/survey11-slice/nx-gallery-mosaic-0052/gameplay.png
- `nx-wild-cairn-0043` — Sev 3 (survey-11, ZAI): IDENTICAL to
  cairn-0022 class — floating pebbles isolated against sky above stack
  tops, six regions (densest x455-555 y290-320, ~8-10 specks), top
  edge dissolves to speck halo; stacked-stone identity itself PASS —
  family 2-of-5. Evidence:
  reviews/survey11-slice/nx-wild-cairn-0043/gameplay.png
- `nx-temple-seed-0013` — Sev 4 (survey-11, ZAI): IDENTICAL to
  seed-0003 class — zero vertical presence (10:1 footprint-to-height
  ellipse x300-655 y377-412, never breaks skyline y346), no seed core
  at center x440-520, reads ground decal/rubble; grounded — family
  2-of-4. Evidence:
  reviews/survey11-slice/nx-temple-seed-0013/gameplay.png

### survey-12 family-class extensions (2026-09-06)

Third-family members judged on distinct shas; MAJORITY LOCKED for
cairn/lavender/orchard/seed (3-of-5, 3-of-5, 3-of-5, 3-of-4) —
family-wide remediation is now probe-backed, confirm-or-drop stays
with the executing lane. NATIVE 8/8 (one 1210 flap on orchard first
call, single paced retry recovered; zero ZAI fallback this tick).

- `nx-wild-cairn-0047` — Sev 3 (survey-12, NATIVE): IDENTICAL to
  cairn-0022 class — floating pebbles detached against sky above
  stack tops in five regions (x230-242 y296-324, x348-390 y296-310,
  x480-532 y293-306, x555-580 y292-306, x655-712 y290-325); stacked
  stone identity + values PASS — family 3-of-5 MAJORITY. Evidence:
  reviews/survey12-slice/nx-cairn-0047/gameplay.png
- `nx-cultivation-lavender-0040` — Sev 3 (survey-12, NATIVE):
  IDENTICAL to lavender-0006 class — charcoal-mauve dead-crop read
  (no bloom-tip brightness anywhere), discrete front-row blobs with
  ground gaps (y395-435), stray 1-3px specks above canopy (x228/390/
  652/692/862 y355-366); rows countable = PASS — family 3-of-5
  MAJORITY. Evidence:
  reviews/survey12-slice/nx-cultivation-lavender-0040/gameplay.png
- `nx-cultivation-orchard-0033` — Sev 3 (survey-12, NATIVE):
  IDENTICAL to orchard-0012 class — crown walls merge into continuous
  hedgerow bands (L x0-420, R x535-960, zero sky gaps), fruit reads
  ZERO at 18m (single ~20px orange dot x553-578 y298-322 beside gate
  post is the only crop indicator); trunk rhythm/shadows PASS —
  family 3-of-5 MAJORITY. Evidence:
  reviews/survey12-slice/nx-cultivation-orchard-0033/gameplay.png
- `nx-temple-seed-0021` — Sev 4 (survey-12, NATIVE): IDENTICAL to
  seed-0003 class — flat block-mosaic disc x300-660 y376-414
  (~360px wide, ~12px tall, 30:1), no seed core, no vertical element,
  no contact shadow (reads pasted-on); rim bumps attached = no float
  — family 3-of-4 MAJORITY. Evidence:
  reviews/survey12-slice/nx-temple-seed-0021/gameplay.png
- `nx-craft-hamlet-0041` — Sev 2 (survey-12, NATIVE): IDENTICAL to
  hamlet-0007/0015/0028 class — flanking mega-masses hover with open
  sky beneath (L x95-460 y0-215, R x565-960 y0-260, own ground
  shadows prove the gap), true see-through hole in tower midsection
  x400-552 y405-492 (sky-tone fill), detached stair-cube run
  x565-685 y195-265 + floating slab rows x0-170 y55-130 and
  x568-668 y272-296, underside value crush x95-460 y140-215 —
  family 4-of-5. Evidence:
  reviews/survey12-slice/nx-craft-hamlet-0041/gameplay.png
  [EXECUTED improve-26, 2026-09-07: 0041 cured by the committed family
  fix (improve-22 composeHamlet cure in mason.ts HEAD, work index 1661)
  and RESEATED live — lib 473f671c -> caa851af x2 deterministic, tuple
  unchanged (46.632895, -0.0238922, 74.628232) yaw -2.35619449, embers
  restored, live bbox y-span 13.363 -> 4.744, footprint x/z
  byte-identical (14.011 x 13.43, SAT-neutral same-tuple); rim
  80.058/96.266 legal; native ANALYZE before-judge confirmed the family
  class on live-corrupt bytes (hovering masses sky-beneath, through-hole
  x405-565, floating runs — 4th member confirmed); ZAI fallback
  after-judge 4/4 PASS pixel-evidenced (native 1210 mid-tick, disclosed
  — re-judge owed); SAT exemption tier-b for nx-approach-ne-lane-002:
  fat-bbox corner artifact, exact decode-vs-decode true 3D clearance
  19.4815m / plan-view 19.3245m, zero lane verts in overlap band,
  pre-existing (certifies pre+post state); PLACED_VERIFIED + idempotent
  zero-verb rerun; walk 8/8 ALL_PASS 0.381m; after-renders banked
  reviews/improve26-hamlet/after/. Sibling 0054 remains queued — hamlet
  family 4-of-5 cured, next tick completes 5/5.]
  [survey-19 annotation, 2026-09-07, NATIVE 18m live bytes: 0041 native
  debt CLOSED — 4/4 PASS, zero defects (cured); eave-soffit darkness
  margin note only. 0054 cured by improve-27 since; family 5-of-5
  CURED. Evidence: reviews/survey19-slice/nx-craft-hamlet-0041-views/]
- `nx-cultivation-garden-0045` — Sev 3 (survey-12, NATIVE):
  IDENTICAL to garden-0011/0019 class — sphere-mass bush read with
  scattered stick weeds, zero bed/row/fence grammar, one shapeless
  clump x225-745; minor stem-above-shadow-dot floats (flank groups
  x165-235 / x735-790); geometry solid — family 4-of-5. Evidence:
  reviews/survey12-slice/nx-cultivation-garden-0045/gameplay.png
- `nx-gallery-mosaic-0059` — Sev 4 (survey-12, NATIVE): IDENTICAL to
  mosaic-0036/0048/0052 class — no frame/backing/plinth, loose
  ground-scatter tile field with ragged dissolving perimeter
  (outlier trails both margins + far arc), 60-70% ground show-through
  mid/outer rings, low contrast on ground — family 4-of-4 UNANIMOUS.
  (Sev raised 3→4 at family-unanimous: zero members carry the
  gallery-art identity.) Evidence:
  reviews/survey12-slice/nx-mosaic-0059/gameplay.png

### survey-13 family-class extensions — LOCK-OUT COMPLETE (2026-09-06)

Final unjudged members of every confirmed family judged on distinct
shas; families now FULLY censused (every live member judged, all
confirmed). ZAI fallback 7/8 + NATIVE 1/8 disclosed — native flapped
(1210 x2 on first call, paced retry burned); one mid-tick native
recovery re-judged garden-0058 natively (dual-judged, corroborates);
hamlet native re-judge retry burned after. Confirm-or-drop stays with
the executing lane. Grep-verified: no open duplicate notes.

- `nx-craft-hamlet-0054` — Sev 2 (survey-13, ZAI): IDENTICAL to
  hamlet-0007 class — see-through tower shaft hole x400-556 y396-502,
  flanking mega-masses hover with open sky beneath (L x100-390,
  R x620-860, undersides y235-495), detached stair runs x0-134
  y38-106 + x563-688 y196-266, orphan slab row x575-680 y268-296,
  right-facade value crush x575-860 y0-170 — family 5-of-5
  UNANIMOUS. Evidence: reviews/survey13-slice/hamlet-0054/gameplay.png
  [Family cured by improve-42; this member reseated live at new lib.]
  [EXECUTED improve-27, 2026-09-07: 0054 cured by the committed family
  fix (improve-22 composeHamlet cure in mason.ts HEAD, work index 1674)
  and RESEATED live — lib 76699206 -> 43f4b4ac x2 deterministic, tuple
  unchanged (24.256087, 0.00605516, 84.591029) yaw -2.35619449, embers
  restored, live bbox y-span 13.396 -> 4.45, footprint x/z
  byte-identical (13.820 x 13.736, SAT-neutral same-tuple); rim
  78.690/97.395 legal, minGap +2.890 vs cloister-0042, zero SAT
  exemptions; native before-judge CONFIRMED all four family findings
  on live-corrupt bytes (hover masses sky-beneath, through-hole
  x400-560, detached stair runs, orphan slabs); native after-judge
  4/4 PASS on cure criteria (grounded / no holes / no floating /
  deliberate hamlet read) with one DROPPED probe finding — the
  "flat-slab roofs not gables" FAIL fired IDENTICALLY on the accepted
  live-standing 0041 sibling control (pitfall-5 family/rig
  characteristic, gable geometry merges at 18m rig distance; source
  decode confirms gableRoof ridges present at true heights); native
  both judges this tick (no fallback debt); PLACED_VERIFIED + idempotent
  zero-verb rerun; walk 8/8 ALL_PASS 0.381m; after-renders banked
  reviews/improve27-hamlet/after/. HAMLET FAMILY 5-OF-5 CURED —
  district family census closed.]
- `nx-cultivation-garden-0058` — Sev 3 (survey-13, NATIVE re-judge
  corroborating ZAI first-pass): IDENTICAL to garden-0011 class —
  zero bed/soil/fence grammar, back rank merges to one continuous
  dark hedgerow x245-735, tan sprouts shadowless read weeds, back
  rank shadowless reads airborne — family 5-of-5 UNANIMOUS.
  Evidence: reviews/survey13-slice/garden-0058/gameplay.png
  [improve-42 CONTRACT (2026-09-07, this tick — BEFORE edit): round-2
   re-arm take 5, worst-first OPEN improve-own row = GARDEN family
   (Sev 3, 5/5 UNANIMOUS: survey-8 ZAI 0011, survey-10 NATIVE 0019,
   survey-11 NATIVE 0032, survey-12 NATIVE 0045, survey-13 NATIVE
   0058 — identity fails at 18m on every member; distinct shas).
   town-4 routing (no shard prefix; cultivation district = improve's
   own surface). Idle-guard clear (git tail 36h: zero
   nx-cultivation-garden mutations since nvp-era placements; survey
   reads only). Family pins census-fresh this tick (274): 0011
   (-86.104625929, 0.0456712809132166, 52.696406703) lib
   store/01a4e80c02f03de7 = work_1691; 0019 (-79.354255867,
   0.03701553556368211, 63.545330212) lib store/d916f37355701255 =
   work_1639; 0032 (-70.894119993, 0.0276505409363984, 72.469434032)
   lib store/38e4718c5efd1374 = work_1652; 0045 (-61.502777956,
   0.027529785945452547, 80.922243372) lib store/856d56746e3a42a3 =
   work_1665; 0058 (-53.224217316, 0.03137989008033212,
   72.691689056) lib store/e54ee386f08a7c21 = work_1678; all yaw
   2.35619449 scale 1 comps {} x5, no riders, no light companions.
   BASELINE NO-DISPUTED-BYTES: local glb-retex sha16 x5 == live lib
   names exactly (verified this tick); baseline reproduction gate =
   improve42-rebuild-gardens.ts no-write mode must regenerate all
   five live pins byte-identically BEFORE the edit.
   BUILD CHAIN: mason.ts composeGarden (THEMES idx 1; works 1639/
   1652/1665/1678/1691; rng(i+1) per work -> 5 distinct shas) ->
   familyPass -> mergeByMaterial -> toGLB -> glb-retex/
   work_NNNN_garden.glb. 60-work sibling snapshot
   /tmp/improve42-retex-before.txt.
   DECODE GROUND TRUTH (source-read this tick, accessor audit after
   build): composeGarden builds 3 hedge-ball rings (r 1.6/3.1/4.6,
   10/16/22 icosahedron r0.32 balls, plain mat 0x528638) + 240-340
   flower stems r0.012-0.016 + heads r0.05 + buds r0.03 (plain mat
   0x446632 / 0xdec64e / 0xe6e6b4 / 0xc4b42c). ALL colors outside
   the five familyPass C tones -> familyPass swaps NOTHING, toGLB
   exports zero glTF materials (glbwrite.ts:266-283 non-emissive
   plain-mat branch) -> loader-default near-black mass (struct-38
   class, family-wide).
   ROOT CAUSES: (R1) MATERIAL: entire garden material-less ->
   near-black value crush at 18m (the "uniform near-black green"
   finding). (R2) GRAMMAR: no bed/soil substrate, no edging, no
   row rhythm — 300 sub-pixel flowers + 3 ball rings read bush
   scatter/weeds, not a planted garden (the "no bed/fence/rows"
   finding). R1+R2 together = identity failure.
   FIX (mason.ts composeGarden only; family-wide by construction —
   same composer builds all five works; rng kept for jitter):
   F1 KITCHEN GARDEN BEDS (identity): two 4.5x2.4 raised beds
   (soil texMat inlay + timber frame boxes, h 0.24) on a ±5.1
   ground plan, plus a central path strip (soil) between them.
   F2 ROW CROPS (grammar): per bed, 3 crop rows of cabbage clusters
   (bone/pale weave tones, r 0.10-0.14 heads on short stems) with
   REGULAR 0.45 pitch — row rhythm legible at 18m; a few gold
   flower accents (mos_gold family, small) as companion planting.
   F3 EDGE: low timber edge boards + corner posts around the plot
   (C.MID -> timber via familyPass, plus 2-3 pale stone step
   stones at the path mouth (C.STONE -> ashlar).
   F4 KEEP NAMED ANCHOR: none required (no comps on any garden,
   census-proven {} x5) — but keep node count low (merge statics).
   ENVELOPE: all additions inside live bbox footprint ±5.1 (beds
   at |x|<=2.4, |z|<=1.35, path strip, edge boards at the ±5.1
   rim); height <= 1.0 (raised beds 0.24, crops ~0.55, corner
   posts 0.7). NOTE: baseline hedge rings reach r 4.6+0.32 ~ 4.92
   and flowers scatter to rad 5.8 — new footprint must stay
   within ±6.0 square (strict subset of baseline scatter extent);
   verify at decode (min/max x/z vs before-bytes).
   FALSIFICATION: (1) rebuild x2 deterministic (improve42 rebuild
   tool --write then --again); (2) 55 sibling works byte-identical
   vs /tmp snapshot (exactly 5 garden lines diff); (3) decode
   audit — real materials present (soil/timber texMat buckets),
   zero MATERIAL-LESS buckets, row-pitch regularity (crop cluster
   centers at ~0.45 pitch), envelope subset; (4) identical-camera
   before/after renders (review-model-draco chassis, local bytes),
   native after-judge at 18m gameplay: reads KITCHEN GARDEN (beds,
   rows, path), NOT bush scatter; night view quiet (no new lights);
   (5) on PASS: FIVE uploads (paced 20s+, shared 4/min budget, 429
   backoff) + remove+spawn x5 exact tuples + post-place census
   (274 steady, all five libs flipped) + idempotent 0-verb rerun;
   (6) NO walk — ground-level planting on open ground, walkable
   (below all collider gates; no room scale).
   REVERT: git checkout mason.ts -> rebuild reproduces the five
   live pins (proven by baseline gate) -> re-run placer with prior
   libs; before-bytes banked reviews/improve42-garden/before/.]
  [EXECUTED improve-42 (2026-09-07, same tick — family 5/5
   PLACED_VERIFIED): contract executed in full + one self-caught
   build defect repaired in tick. BUILD: mason.ts composeGarden
   rebuilt as kitchen garden (2 timber raised beds L7.2xW2.2xH0.26
   w/ soil inlay flanking a soil path, 8 cabbage rows/104 heads in
   two crop texMats with baked y-scale, marigold gold borders,
   segmented leaf hedge + 4 corner posts, step stones); v1 defect
   SELF-CAUGHT at decode — rows ran along X, crops spilled past
   the frames to x ±5.41 (baseline breach −5.32) — axis-fixed v3:
   rows along Z, crops x ±3.0 z ±3.25 INSIDE frames. Rebuild x2
   deterministic, FIVE new shas (1639 f4b36cb3 / 1652 54590f7e /
   1665 7610a674 / 1678 45a88727 / 1691 185a2218), 55 siblings
   byte-identical. DECODE AUDIT ALL PASS x5: 0 material-less
   primitives, 7 real texMat materials (gd_soil/timber/crop_pale/
   crop_mid/gold/leaf/step), envelope strict-subset every axis
   (x ±5.0, z ±5.22, y 0..0.78 vs baseline x 5.32/5.64 z 5.74/5.72
   y 0.62), 0 below grade. JUDGED: native before-judge CONFIRMS
   family class ("bush cluster / scrub patch", zero structure);
   native after-judge 4/4 PASS — kitchen garden unmistakable,
   beds framed+grounded, regular row rhythm legible at 18m, zero
   floats; identity "a tidy hedged cottage kitchen garden with rows
   of cabbages"; night 0 warm px (quiet). RESEAT: 5 uploads paced
   21s (no 429) + remove+spawn x5 exact tuples (10 verbs) +
   PLACED_VERIFIED + census 274 steady + idempotent 0-verb rerun.
   Family rows 0011/0019/0032/0045 close with this entry; garden
   family 5-of-5 CURED — district family census now: hamlet 5/5,
   seed 4/4, garden 5/5 cured; mosaic 4/4 built/Bill-blocked;
   cairn 5/5, orchard 5/5, lavender 4/4 remain OPEN.]
- `nx-cultivation-lavender-0053` — Sev 3 (survey-13, ZAI): IDENTICAL
  to lavender-0006 class — charcoal-mauve dead-crop value (~20-25%
  luma, zero purple chroma at 18m), no tilled strips, discrete
  front-row blobs with ground gaps, stray stem spikes above canopy
  (9 regions x60-850) — family 4-of-4 UNANIMOUS. Evidence:
  reviews/survey13-slice/lavender-0053/gameplay.png
- `nx-temple-seed-0034` — Sev 4 (survey-13, ZAI): IDENTICAL to
  seed-0003 class — flat ~32:1 block-mosaic disc (355px wide x ~11px
  true extrusion), no seed core x400-570, no vertical element, soft
  single-smear shadow with 3-4px detach gap y421-424 — family 4-of-4
  UNANIMOUS. Evidence: reviews/survey13-slice/seed-0034/gameplay.png
- `nx-wild-cairn-0048` — Sev 3 (survey-13, ZAI): IDENTICAL to
  cairn-0022 class — floating pebbles detached against sky above
  stack tops, ten regions x160-760 y292-323 (~20-25 specks, worst
  cluster x438-522), central stacks merge to rubble mound x270-560;
  flanking stacks + grounding PASS — family 4-of-5. Evidence:
  reviews/survey13-slice/cairn-0048/gameplay.png
- `nx-wild-cairn-0050` — Sev 3 (survey-13, ZAI): IDENTICAL to
  cairn-0022 class — ~19 floating pebbles in six regions A1-A6
  (worst: even row A3 x395-492 y293-305), central blob zone
  x335-565; discrete stacks + grounding PASS — family 5-of-5
  UNANIMOUS. Evidence: reviews/survey13-slice/cairn-0050/gameplay.png
- `nx-cultivation-orchard-0046` — Sev 3 (survey-13, ZAI): IDENTICAL
  to orchard-0012 class — forest-edge read (crown height variance
  30-40%, irregular trunk deltas 58-117px), fruit ZERO at 18m (no
  in-canopy break; ground spheres read debris), right-edge tree
  crushed-black x922-960 y222-500, understory clutter — family
  4-of-5. Evidence: reviews/survey13-slice/orchard-0046/gameplay.png
- `nx-cultivation-orchard-0059` — Sev 3 (survey-13, ZAI): IDENTICAL
  to orchard-0012 class — forest-edge read, major central skyline
  break x440-500 y290-390, fruit ZERO, value collapse zones A-C
  (worst x555-790 y325-400), broken rank rhythm (gaps x385-480,
  x838-895) — family 5-of-5 UNANIMOUS. Evidence:
  reviews/survey13-slice/orchard-0059/gameplay.png

FAMILY CENSUS CLOSED (confirmed district families): hamlet 5/5,
garden 5/5, cairn 5/5, orchard 5/5, lavender 4/4, seed 4/4, mosaic
4/4 — every confirmed family fully judged with unanimous or
majority lock; family-wide remediation is probe-backed end to end.
Remaining unjudged universe: clean-family members (cloister/
statuary/labyrinth/terrace/forest/wayside partial coverage) + town
core rotation.

### survey-20 new intake (2026-09-07)

First core-legacy-dressing sweep (`nx-dress-*` off-limits set, nvp-133..148
core-town dressing pass; town-4 no-shard-prefix default = improve lane;
probe-only for the off-limits set, ownership Bill's call per fountain
precedent). NATIVE 3/3 first-pass lands on the clean verdicts (banner/
chess/milkstand native, stringlights ZAI after burned retry; meridianstair
ZAI after burned retry, echoarch + hutch native), 18m gameplay, fresh live
store bytes 8/8 HTTP 200 curl UA on exact census-20 libs, served-shas
pinned.

- `nx-struct-echoarch` — Sev 3 (survey-20, NATIVE, served-sha 92ce1922):
  identity failure — reads as SOLID curved retaining wall, not arch/
  arcade (gameplay camera: continuous mass x290-670 y228-440, ZERO sky
  penetration, no pier rhythm on visible faces; arch voids face away or
  absent); left-third value crush x295-410 to #0A0806 erases curvature;
  slab front edge crushed. Silhouette + grounding PASS (no floats, clean
  convex top arc, slab-flush contact, shadow anchored). struct-lane
  commission (not round-queue); note routed to STRUCTURES-PLAN SURVEY
  INTAKE. Evidence: reviews/survey20-slice/echoarch-gameplay.png
- `nx-dress-hutch` — Sev 4 identity-marginal (survey-20, NATIVE,
  served-sha 75381ffb): hutch structure CLEAN (box+stilts+ramp grounded,
  silhouette closed, mesh-door interiors framed); the RABBIT figures read
  as ground clutter — 20x5px blob x505-530 y384-394, no head/body/ear
  silhouette, ~#2E2A22 at ground-shadow luma. CAVEAT: live entity carries
  rabbit sit+hop MOTION comps (census compKeys) — static chassis may
  under-represent; verify-tier for dress lane. Off-limits set member —
  probe only, Bill's call. Evidence:
  reviews/survey20-slice/hutch-gameplay.png
- CLEAN records (survey-20, judged index in SURVEY-PLAN):
  ninesbridge NATIVE 4/4 on post-fix bytes (survey-19 ZAI debt closed),
  banner NATIVE 4/4, chess NATIVE 4/4 (0.8m working height verified),
  milkstand NATIVE 4/4, stringlights ZAI 4/4 (wire sub-pixel = expected
  aliasing; bulb-chain catenary carries read). Meridianstair base-read
  flag 2nd vote (ZAI, adjacent evidence in STRUCTURES-PLAN) — no new row,
  verify cluster stands.

### survey-21 new intake (2026-09-07)

Second core-legacy-dressing sweep (`nx-dress-*` off-limits set, nvp-133..148
core-town dressing pass; probe-only for the off-limits set, ownership Bill's
call per fountain precedent). NATIVE 5/8 + ZAI fallback 3/8 disclosed (native
1210 x2 + paced retries burned on waterstair + meridianstair; native landed
goats/hens/coop/harvestcart/churn/giftshelf), 18m gameplay, fresh live store
bytes 8/8 curl UA on exact census-21 libs, served-shas pinned.

- `nx-dress-hens` — Sev 4 identity-marginal (survey-21, NATIVE, served-sha
  5a6ec433): hens read as a 24x14px dark smudge cluster x466-492 y383-398 —
  count indeterminate (dark left mass x466-480 + warm-ochre right mass
  x480-490), zero head/body/tail silhouettes, no separable shadow; the
  warm-yellow tint is the only hen-carrying cue. Off-limits set member —
  probe only, Bill's call. Evidence: reviews/survey21-slice/nx-dress-hens/
- `nx-dress-churn` — Sev 4 identity-marginal (survey-21, NATIVE,
  served-sha 761baf15): reads as staved dairy vessel; the churn-specific
  dasher/plunger is a 7px lid-knob stub x464-471 y352-361 — identity hinges
  on a sub-threshold element (churn-vs-barrel ambiguous at 18m); hoops
  low-contrast against ground-blended lower body. Off-limits set member —
  probe only, Bill's call. Evidence: reviews/survey21-slice/nx-dress-churn/
- CLEAN records (survey-21, judged index in SURVEY-PLAN): coop NATIVE PASS
  (roof/body/legs/ramp stack, dark doorway, nest-box; ramp 1-2px thicken
  margin), harvestcart NATIVE PASS (bed+load+wheels+hitch gestalt, contact
  shadow; orphaned shadow speck x385-396 y390-399 + 1px hitch/spokes margins),
  giftshelf NATIVE marginal-PASS (double-rail rack reads, top-shelf goods
  x460-498 y320-337; mid shelf EMPTY x455-509 y344-352 = biggest identity
  lever, Item B 1-3px hover verify-flag), goats NATIVE borderline (3
  quadrupeds read as livestock-not-goats — no horns/head offset/horns; fence
  pen reads; orphaned rail-less posts x645-928). Meridianstair base-read
  flag NOT reproduced (ZAI third vote, split 2-1) + pins 1-of-3 third vote
  — adjacent evidence in STRUCTURES-PLAN, native tie-break owed on both.

### survey-30 sub-section (2026-09-07, NATIVE 6/7 + ZAI fallback 1/7
disclosed — native flap: 1210 x2 + paced retry burned on ellipsecourt
only; every fallback verdict names its judge):** arrivals + core-dressing
corroboration slice. Slice = dryingracks (dress-88 arrival, first
independent read) + ellipsecourt (struct-64 arrival, first INDEPENDENT
read — owner's final judge was ZAI fallback) + five core nx-dress props
(banner, chess, stringlights, stablebench, ne-bench-001).

- `nx-dress-stringlights` — Sev 3 night-identity candidate (survey-30,
  NATIVE day-read + night frame + source decode + served-byte decode,
  off-limits set member, probe-only, Bill's call): day catenary read
  CLEAN per survey-20; NEW finding — night read is dead-by-construction:
  night frame ZERO warm px across all 9 bulbs (x318-642 y362-392),
  source bulbs mat(0xffd9a0,0.3,0.1) carry NO emissive arg, served store
  bytes have 0 materials (COLOR_0 only), live comps {}. The namesake
  night function of "string LIGHTS" cannot fire. Full note + evidence
  path routed DRESSING-PLAN SURVEY INTAKE (core-era, off-limits set —
  same routing shape as fountain survey-8 / well survey-23). Evidence:
  reviews/survey30-slice/stringlights/
- CLEAN records (survey-30, judged index in SURVEY-PLAN): dryingracks
  NATIVE CLEAN-with-margin — concurs dress-87's owner-acceptance:
  trestle grammar falsifies fence (foot/apex width ratio), 7 countable
  tied bundles in dye-varied hues, zero floats, soft contact shadows;
  margins: empty second rail row, faint foot AO. ellipsecourt
  ZAI-fallback CLEAN 4/4 — corroborates struct-64's placement: 13 shafts
  resolved + 14th occluded on-axis behind the center front pier (the
  correct 14-pier signature), ring continuous 360 deg, both brass foci
  pins present + symmetric about frame center (~291/~285px offsets =
  c=5.6=0.8a), all plinths grounded, zero voids/floats; native re-judge
  debt carries (owner's judge was also fallback); compatible with
  sweep-66's R-122 sub-law gap finding (different class — adjacency,
  not read quality). banner NATIVE CLEAN-with-margin — corroborates
  survey-20 native CLEAN: pennant identity PASS (pole+finial+
  swallowtail notch), grounding PASS; margins: rigid die-cut plane
  (zero cloth drape/wave), hairline 1-2px shadow streak x348-462
  y424-433, no market heraldry on the cloth, verify doubleside from
  reverse azimuth. chess NATIVE CLEAN — corroborates survey-20 +
  polish-276 working-height law: aerial two-tone checker reads
  (cream/dark diamond x440-520 y325-388), pieces present on both sides
  (~3-4 visible of the 6-per-side set), pedestal column + flared foot
  grounded; the 18m pole/crossarm first read is framing-limited
  (struct-45 class — board interior sub-2% of frame at 18m;
  judge-at-concept-distance holds). stablebench NATIVE CLEAN 4/4 —
  corroborates survey-19/20 CLEAN: canonical bench anatomy (thin plank
  + elevated thin legs, under-seat gap visible), sitting-height read,
  grounded, zero floats; margins negligible. ne-bench-001 NATIVE CLEAN —
  corroborates dress-17's DROP verdict literally: two matching pedestal
  benches flank ONE taller two-legged table, matched heights (~1px),
  consistent lower-left contact shadows, zero floats/zero misaligned
  blobs; the three flagged "clutter" blobs are dress-17's own
  below-threshold pebble margin.

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

Next queue item (improve-18): windmill guard re-check (rider placed 09-06
01:57 — expires 09-07 01:57; if clear, row 4 Sev 1 native-confirmed; else
row 27 `nx-town-mapboard` Sev 3, native-cleared survey-5).

improve-17 EXECUTION COMPLETE (this tick — interrupted-window recovery,
artwalk-32 pre-place class): the prior window died after writing this
contract + landing the full source edit + rebuild (17:26) + before-renders
(17:11) but BEFORE any world mutation (fresh census proved live still at
baseline 30407b95, comp {}). This tick recovered forward, nothing re-done
from scratch: baseline reproduction proof FIRST (HEAD-source rebuild →
30407b959aa14962 == live census pin exactly — no disputed bytes, edit
lineage is the true live source), edited rebuild 2419fbc5 ×2 deterministic,
siblings byte-identical (inn 6e6ff2d0 + windmill 09938360 both == live
pins). Decode audit 17/17 ALL PASS after three HONEST probe fixes (tool
fixed, not evidence waved): A6 was an absolute-zero check over a zone that
legitimately contains 6 pre-existing z-face brace verts → differential
(baseline 78 verts incl. the 72 old-ladder verts → edited 6 brace-only);
C3 was a placeholder `ck()` with no condition → real check (lamp KEEP node
present at exact (0.75, 5.6, 0.75) — read via traverse, name survives
merge); D1 was VACUOUS (0==0 — the exact rider volume is air on the host
side, and the first wider zone hit pitfall 2: exclusive y>0.3 excluded the
plinth band sitting AT 0.3) → wider zone with INCLUSIVE bound, 83-char
nonempty differential identical, vacuous-guard added. Night falsification
PASS: warm px 2→5 at the same centroid (520, 211-212) — hood edges catch
bead light, no occlusion. Visual: ZAI fallback 3/3 PASS on after-gameplay
(stringers x426-445, rungs terminate ON rails, feet planted within 1-3px,
rope → cleat block seated x480-495 y467-488 with tail, lantern two-tone
hood x512-525) + left-view corroboration (rail continuous y115-675, rungs
die into rail, feet contact-shadow not gap) + front-view full corroboration
(rope continuous x489-494 into cleat with wrapped tail, guide ring ellipse
x484-500 y145-154 at the floor penetration, BOTH rails continuous
x355-366/x388-398, zero floating anywhere) — native 1210 ×2, paced retry,
DISCLOSED, native re-judge owed. Gate ALL PASS real exit 0 at bb900f9
(survey-11 absorbed). Re-place remove+spawn+comp 3 verbs at the exact
standing tuple (6.5, 0, 6.5) yaw −2.356194490192345, lib 30407b95→2419fbc5;
engine-1 ladder comp LIVE in the bag {min:[−0.98,0.30,0.98],
max:[−0.52,5.15,1.22]} entity-local over the climb plane z 1.10 — derived
from decode, NOT the stale contract box z 0.93..1.05; climb itself is
client-side and ships with deploy = Bill's lane). PLACED_VERIFIED +
idempotent zero-verb rerun with comp-pin gate. 2-leg two-way MCPL approach
walk ALL_PASS maxArrival 0.40m (ladder foot world (6.253, 5.192), walker
clean to the slab edge). Rider nx-artwalk-b5-belltower-rings untouched
standing at pinned tuple; census 259 steady. Residuals disclosed to the
round-1 eye-gate: ladder-top merge into the corner post (reads as deck
termination); bracket arm sub-pixel at 18m (lantern reads eave-mounted);
bare lower rail below first rung = designed reach-height start.
Placer: next-place-improve17-belltower.ts; decode:
improve17-decode-belltower.ts; walk: improve17-walk-belltower.ts; evidence:
reviews/improve17-belltower/{before,after}/.

- improve-17 (EXECUTION CONTRACT, row 21 `nx-town-belltower`): idle-guard
  clear (last host mutation polish-263 era; survey-3/engine-1 touches are
  read-only/client-side). Live tuple (6.5, 0, 6.5) yaw −2.356194490192345,
  lib 30407b959aa14962 == local rebuild deterministic THIS TICK (no
  disputed bytes; live store fetch sha 29f28b53 == survey-5 pin). Comp bag
  {} (census-fresh 259). NO light companion entity (census: only host +
  rider). Rider nx-artwalk-b5-belltower-rings host-local KEEP-OUT
  x∈[0.433,1.077], y∈[0.65,2.07], z∈[0.952,1.092] (placer LOCAL
  [0.75,0.65,0.99] + rider bbox; east/plaza-facing pier outer S face).
  Native re-judgment THIS TICK (restored after one 1210 paced retry,
  disclosed): all three findings CONFIRMED with pixel evidence + two scope
  extensions — (a) ladder accesses nothing at either end (top ~19px short
  of belfry floor, no landing; bottom floats ~20px above slab), (b) rope
  passes through the belfry floor beam with no guide. Mechanisms decoded
  at source (mkv3-landmarks.ts belltower block):
  - R1 rungs float: `blrail_a` (x −0.45) spears the rung band CENTER;
    `blrail_b` (x −0.77) is buried INSIDE the NW pier column and misses
    the rung ends by 40mm — right rung-ends terminate in open air (the
    rungs' left ends merely embed in the pier).
  - R2 rope terminus floats: cleat at y 1.05 in open air (no block, no
    floor anchor); visible terminus = knot y 1.35 with ~1.05m air below.
  - R3 lamp bare dot: glow bead (0.75, 5.6, 0.75) embedded at the
    cap-ring/arch-post convergence, zero mount geometry (improve-15
    bare-dot class).
  FIX (mkv3-landmarks.ts belltower block only, no housekit change):
  - R1+extensions: ladder REBUILT on the OUTER S face of the SW pier
    (plaza-facing, rider-disjoint): 2 stringers x −0.87/−0.63, z 0.99,
    y 0.30..5.00 seated on the base slab; 11 rungs x −0.90..−0.60, y
    0.75+0.42k → top rung 4.95 ABOVE belfry floor top (4.82) — climber
    steps inward onto the deck corner (real top-out). Old embedded
    rungs/rails REMOVED. PLUS the engine-1 `ladder` comp in the same
    tick: {type:'ladder', min:[-0.95,0.2,0.93], max:[-0.55,5.05,1.05]}
    (entity-local, yaw applied client-side; climb is client-side —
    CLIENT NOT DEPLOYED, deploy is Bill's lane; comp folds blindly
    server-side per engine-1).
  - R2: cleat seated on a timber mounting block (0.16×0.25×0.16 at
    (0.12, 0.425, 0.58) on slab top) with brass cleat y 0.5 + tail knot
    y 0.36 on the block; rope z 0.62→0.58 (clears the z-face brace
    plane by 0.08); brass guide ring (horizontal torus r 0.06) at the
    belfry floor penetration (0.12, 4.76, 0.58) — rope reads threaded,
    not through-solid.
  - R3: lantern housing around the KEEP-named lamp bead — 4 iron corner
    posts (0.025 sq × 0.16) + 4-side pyramid hood (cone r 0.10 h 0.08 at
    y 5.72) + diagonal iron mount arm from the arch post inner corner
    (0.90,5.6,0.90)→(0.72,5.6,0.72). Bead position/name unchanged.
  Falsification: (1) after gameplay@18m rung ends BOTH terminate on
    visible stringers, ladder reads planted on the slab and REACHES the
    belfry deck; (2) rope terminates at a visible block-mounted cleat,
    guide ring at the floor; (3) lamp reads hooded lantern on a bracket,
    not fused dot; (4) night.png warm px retained (hood must not occlude
    — bead at 5.6, hood base 5.68); (5) decode audit — bbox unchanged
    ±1.7 (SAT-neutral same-tuple re-place), zero NEW verts in b5
    keep-out, stringers seated y 0.30, top rung 4.95; (6) live comp bag
    readback shows the ladder box after the comp verb; (7) 2-leg MCPL
    approach walk to the ladder foot ALL_PASS; (8) native judge on after
    renders; (9) siblings (carousel/inn/windmill) byte-identical.
  Revert: revert the belltower block edits → rebuild returns
  30407b959aa14962 (baseline ×2 proven this tick); comp removal = one
  verb if ever needed.

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

## improve-22 (EXECUTION CONTRACT, 2026-09-06 20:0x — round-2 take 1: `nx-craft-hamlet-0007`, worst-first Sev 2, survey-9 ZAI+native UNANIMOUS, family 5/5)

Why lawful: round-1 terminal; re-arm item (2)+(3) → SURVEY CANDIDATES
(round-2 intake, town-4 routing: no-shard-prefix default improve). Idle-guard
clear (36h lane-tail grep: read-only survey commits only). Live tuple
(86.671814, −0.01918958686956854, 15.480445) yaw −2.35619449, lib e2f134cf ==
source rebuild byte-identical THIS TICK (probe re-run: no disputed bytes).
Comp bag = particles:embers only. Source = assets/mason.ts composeHamlet +
lift-99 retex pipeline (familymap + mergeByMaterial).

ROOT CAUSE (decode-proven, improve22-decode-hamlet.ts): composeHamlet's
spread idiom `box(g,name,w,h,d,...(rot(x,z) as [number,number]),Y,C)` feeds
rot's planar z into the Y slot and the intended height into Z — all 8 sites
(walls nw/ne/s/w/e, lintel, chimney, step; mason.ts:142-167). Cottages'
walls stand at heights = planar positions: live bbox y ∈ [−7.569, +5.511],
216 verts below grade, walls spanning y ±7. Roof-retarget list also misses
`_cap_N` ridge caps + `_rake*` boards (they stay at green-center coords →
the floating-slab reads). Survey findings literal: floating masses +
sky-through hole + detached slab runs (ZAI fallback re-judge THIS TICK
confirms on before/gameplay.png: hole x615-700 y500-560; slabs x388-575
y398-428; dashes x615-725 y585-605 — native 1210 ×2, retry burned,
disclosed; native re-judge owed on after-renders).

FIX (assets/mason.ts composeHamlet only; family-wide cure, no housekit
change): reorder every affected box() call to (…, x, y, z, C) with correct
slots — wall center y = H/2+0.3 (seated on the 0.3 floor), lintel y =
2.05+(H−2.05)/2, chimney y = H+1.0 seated via rot x/z, step y = 0.06; and
extend roofNames to include every `${t}_roof_cap_${rc}` + `${t}_roof_rake*`
node so caps/rakes retarget with the slabs/ends/ridge.

Falsification: (1) after gameplay@18m — three grounded cottages, zero
sky-through holes, zero floating slab runs (ZAI then native when it
returns); (2) decode: min y ≥ −0.35 (village sink idiom bound), max y ≤
5.0, wall buckets' y-span ≈ wall height not ±7; (3) rebuild ×2
deterministic; (4) probe still byte-identical on SIBLINGS (0015/0028/
0041/0054 rebuilds change — family fix changes their bytes too, siblings
re-place next ticks per family-wide remediation); (5) rim/SAT preflight on
fresh census — bbox shrinks (y-span 13.08 → ~5.9), footprint must stay rim-
legal; (6) remove+spawn exact tuple + embers comp re-apply; idempotent
rerun zero verbs; (7) ledger improve-22 + commit (mason.ts + decode +
placer + plan + evidence).
Revert: revert composeHamlet edits → rebuild returns e2f134cf (baseline
×2 proven this tick; before-bytes banked reviews/improve22-hamlet/before/).

improve-22 PARTIAL — build+audit complete, PLACEMENT DEFERED (judge
outage; artwalk-32 pre-place interruption class): source edit landed,
rebuild ×2 deterministic sha edd3da3ef7737bef (e2f134cf → edd3da3e),
decode GREEN (0 verts below grade, was 216; max y 4.586, was 5.511;
stone bucket y [0,4.104] = true wall heights), after-renders 8 views
banked. AFTER-JUDGE BLOCKED: native 1210 ×2 + paced retry burned (before
AND after), ZAI fallback timed out 300s ×2 — visual accept-or-revert NOT
obtained, so NO upload/re-place per the visual-gate law. World untouched:
live entity still at baseline lib e2f134cf, tuple unchanged, comp bag
intact. NEXT TICK RECOVERY (exact): (1) re-verify on-disk build sha ==
edd3da3e; (2) after-judge (native preferred; the falsification criteria
are the contract's four); (3) update next-place-craft-hamlet-0007.ts —
PINNED_SHA → edd3da3e…, BW/BD → new bbox footprint, keep tuple/comp
contract; (4) upload (429 pacing) + remove+spawn + embers comp re-apply +
post-place verify + idempotent rerun; (5) annotate the SURVEY CANDIDATES
row [EXECUTED improve-22]; (6) siblings 0015/0028/0041/0054 same-class
cures on their own ticks (rebuilds change bytes by design — family-wide
remediation law).

improve-23 RECOVERY COMPLETE (2026-09-06): (1) on-disk sha re-verified
edd3da3e + rebuild ×2 fresh determinism proof this tick; (2) after-judge
obtained via ZAI (contract names "ZAI then native when it returns") —
4/4 PASS: three grounded cottages, zero sky-through holes, zero floating
runs (one exposed-rafter borderline judged attached into the upper slab),
coherent silhouettes; native 1210 ×2 persists — native re-judge debt
disclosed. (3) reseat placer next-reseat-craft-hamlet-0007.ts: disputed-
bytes gate (old-pin/new-pin only), fresh-census rim/SAT preflight
(inner 78.65 / outer 97.48 legal, minGap +3.63 vs cloister-0008),
upload → store/edd3da3ef7737bef.glb, remove+spawn + embers re-apply,
post-place PLACED_VERIFIED (lib/pos/yaw/scale/comp exact, bbox y-span
4.622), idempotent rerun ALREADY_SEATED zero verbs; (4) walk 8/8
ALL_PASS (4 rays two-way, max arrival 0.38m — improve23-walk-hamlet.ts);
(5) row annotated [EXECUTED improve-23]; (6) siblings remain.

## improve-21 (EXECUTION CONTRACT, 2026-09-06 — R-120/R-121 take, re-arm item 2)

**Why this is lawful improve-lane work:** round 1 fully terminal (39/39
annotated; rows 20/21 gap-fixed this tick via improve-16/17 annotations —
CLAIM CORRECTED improve-29: that annotation text was never committed
(git log -S empty on both strings); the gap was real and starved the
re-arm inputs for 12 ticks; repaired this tick with sourced annotations);
re-arm law fired → item (2) = REPAIR-REGISTER OPEN items. R-120 (Sev 1, five
sweeps unaddressed, unowned) + R-121 ride together; register names improve as
the executor of last resort. Prefix is `nx-approach-lamp-*` — no lane owns it
(fleet LANES re-read: improve/struct/dress/approach/waysign/sweep/artwalk/night;
approach lane owns legs + leg lamps `nx-approach-<dir>-...`, not the four
cardinal plaza gate lamps). Idle-guard clear: no lane commit touches these
entities; town-1 was the last mutation (uncommitted placer, then town-2
committed it) — all 2026-09-06 morning.

**R-120 (Sev 1):** all four cardinal gate lamps live on truncated lib
`store/18b69a6bb2.glb` (404) — client cannot download, landmarks invisible,
bbox:null x4, dropped from SAT set (221→217). Fix per register: re-spawn at
SAME tuples on full 16-hex `store/18b69a6bb2f5862f.glb` (bytes already in
store — verified local file == full hash, NO upload). Placer hardening in the
same edit: PINNED_SHA → 16-hex, post-verify requires bbox presence.
**Rider safety (b26 law):** `nx-artwalk-b26-wayband` mounts lamp-n concentric
at (1.75, 1.5, 10) — same-tuple re-spawn leaves it standing untouched
(concentric at identical pose; the full lib was always the intended bytes).

**R-121 (Sev 2) re-derived on LIVE bytes this tick** (improve21-decode-kiss.ts,
vertex-true, translation-aware):
- OLD finding (9mm) was against the retired solid-plate mapboard 1f1a10f4.
- Current head-band (y1.4-2.6) clearance: **0.076m** — improve-19's border
  frame already relaxed 0.009 → 0.076.
- z 10→10.6 would give 0.602m; z→11.2 gives 1.179m.
- **Blocker:** moving lamp-n strands the b26 rider (concentric on the post,
  artwalk domain). Interlane law: I do not move/re-place foreign riders.
  → R-121 NOT executed this tick. Re-derived numbers + the two-entity
  choreography requirement routed to artwalk's plan via defect note;
  remainder routed back here on artwalk's confirmation.

**Falsification:** post-place census — all four lamps lib == full 16-hex,
bbox PRESENT x4, comps {} x4, companions -l standing at pinned tuples, b26
rider standing at pinned tuple, total entities unchanged; idempotent rerun
zero verbs. N-spoke re-walk not required (pose unchanged; R-121 defers the move).
**Revert path:** re-run placer with prior lib (trivial, tuple-identical).

**improve-21 OUTCOME (this tick):** R-120 EXECUTED — placer hardened first
(PINNED_SHA → 16-hex 18b69a6bb2f5862f, bbox-presence post-verify,
companion-entity verify, known-bad 10-hex accepted as pre-state only), then
remove+spawn x4 at the same off-axis tuples. Two probe self-catches during
placer repair (disclosed): (a) the committed placer's companion loop
compared HOST pos against companion targets (always "drift" — copied from
the original, caught when it died on a correct state); (b) its
spawn-kind-light companion verbs SILENTLY FAILED — run 1 lost all four -l
companions (census 260→256) with the watch handler reporting success; fixed
to the proven "light" verb idiom reading authored color/intensity/range from
the history fold (struct-beacon chassis), all four restored (census 260,
lights 38). Final live state: hosts lib exact + bbox PRESENT x4, comps {}
x4, companions at committed pins, b26 rider standing, idempotent rerun zero
verbs. R-121: re-derived on live bytes (9mm → 0.076m post-improve-19 frame);
move DEFERRED to artwalk-paired choreography (defect note delivered to
ARTWALK-PLAN Log); register boxes checked + STATUS: FIXED line appended for
R-120; R-121 stays open as routed remainder.

## improve-29 (EXECUTION CONTRACT — EXECUTED same tick, 2026-09-06 23:2x — plan-repair tick +
`nx-welcome`, SURVEY CANDIDATES row Sev 3 native survey-7, town-4 routing
no-shard default improve; worst improve-own take after rows 20/21/5 found
EXECUTED-but-unannotated — annotation repair executed this tick)

Why lawful: rows 20/21 (next improve-own Sev 3) proved executed at ledger
improve-16/17 with live libs matching; taking them would duplicate cured
work — repaired instead (annotation law). Row 4 windmill idle-guarded
(waysign rider <24h until 09-07 01:57). Next worst: `nx-welcome` Sev 3.
Idle-guard clear (zero lane commits touch welcome in 24h; survey-7 read
only). Live tuple (-3, 0, -4.3) yaw 0.6092, lib 362c5be1 == local
village_welcome3.glb == rebuild x2 THIS TICK (no disputed bytes). Comp {}
both sides by census. Riders: b25 mark at local (0,1.35,-0.043) -z face
+ `-l` warm light companion (0,2.2,0) — both outside the edit zone.

ROOT CAUSE (decode at source, mkv3-welcome59.ts):
- F1 arm detachment SOURCE-TRUE: all five pointer arms are 0.34-long
  slats centered at ax*0.8 — inner ends stop 0.11-0.19m short of the
  post surface (r 0.06-0.08). Arms 1/2 (y 1.16) hide their gap behind
  the board (board bottom 1.14); arms 3/4/5 (y 1.05/0.94) float in the
  open — the survey-7 native ~5px sky gap.
- F2 text illegibility SOURCE-TRUE: COMMONS glyphs are 3x5 pixel fonts
  cw 0.0333 ch 0.052 fill 0.82, dark 0x4a432e proud only 0.011 on the
  bone board — ~6px letters at 18m, smear below legibility.

FIX (single element each, outer envelope preserved):
- F1: re-derive per-arm geometry so inner end = 0.045 (0.025 embedded
  past post surface r 0.07): w = outer - 0.045, cx = (0.045+outer)/2 —
  outer extents preserved by construction (SAT-neutral same-tuple),
  uniform law all five arms (class fix incl. occluded 1/2).
- F2: name-bar idiom (monument plaque / mapboard ink lineage): dark
  bar 0.92x0.15 at the inscription row + glyphs enlarged (cw 0.038
  ch 0.060 gap 0.018 fill 0.92) recolored pale carved 0xd8d2ae proud
  of the bar — dark band + pale letters reads as painted inscription
  at 18m even sub-legible. Board/post/foot/lamp untouched.

FALSIFICATION: (a) decode — every arm inner end within [-0.05,0.05] x
at its y/z row (embedded); b25 keep-out zone verts identical 0 new/gone;
bbox x-extent change <= 0.01. (b) identical-camera before/after renders
(18m gameplay + front near + night): native judge confirms arms attached
(zero sky gaps), name band reads as inscription, no new floating. (c)
rebuild x2 deterministic. (d) re-place remove+spawn exact tuple, comp {}
both sides, riders standing, idempotent zero-verb rerun. (e) 2-leg
two-way approach walk ALL_PASS. REVERT: git checkout mkv3-welcome59.ts,
rebuild (byte-repro 362c5be1 proven this tick), re-place.
