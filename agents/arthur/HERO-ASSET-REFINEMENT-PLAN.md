# HERO-ASSET REFINEMENT PLAN — commons-next carousel

Lane: `polish-N`. Entity: `nx-carousel` (polish-only per INTERLANE-PROTOCOL).
Canonical loop: `agents/arthur/HERO-ASSET-REFINEMENT-LOOP.md`.

## Baseline at campaign start (polish-258)

- Live tuple: `nx-carousel` @ pos `[-18, 0.00014950061063032772, 18]`, yaw `2.35619`, scale 1.
- Baseline hash (nvp-6 optimized build): `d41a898f3054874b9918b1adf4f0fe3674088baa86416cf5a6c8ec84bd8958ec` (43 nodes / 37 draws).
- Comp bag (7 keys, preserve through every re-place): spin `carousel`, bobs `horse_0/2/4/6`, `sockets`, `particles:smoke` (origin `[0,6.3,0]`).
- Evidence: `agents/arthur/reviews/hero-assets/polish-258-carousel/before/`.

## Ranked criteria (from loop file; judge from current pixels)

1. gameplay silhouette / carousel identity
2. crown/canopy hierarchy (apex, pitch, eave rhythm, underside)
3. horse quality (anatomy, poses, pole/suspension, trapping)
4. platform/fascia/ticket-entry storytelling
5. value/material hierarchy (festive cream/red/gold/wood, no noise)
6. night identity (warm glow, beacon crown)
7. motion pair, rider sockets, grounding

## Iteration history

### polish-258 — gold spire + scalloped valance (ACCEPTED, LIVE)

- Defect: apex was a nearly-dead 0.18r brass bead (cone apex 5.99, bead 6.08) and
  the eave a straight dark brass band — silhouette read gazebo, not carousel.
- Change (single coherent crown intervention, `mkcarousel.ts`): brass collar +
  tapered gold spire to y 6.68; 16 alternating gold/fabric point-down scallop
  teeth at r 3.08 under the eave. All merged statics; no new KEEP names.
- Candidate hash: `46b21e1ed494f89da168c4011ddd14077c745ccf50fa007b13290feb145c894f`
  (45 nodes / 38 draws — inside 5–45 band). Two consecutive rebuilds byte-identical.
- Falsification verdict: clearly better — spire crowns the apex, valance reads
  as festive rhythm, gameplay silhouette now carousel; night beacon read holds;
  lanterns unobstructed; no floating teeth / z-fighting.
- Placed via `next-place-carousel.ts` (hash-gated, comp re-applied): live lib
  `store/46b21e1ed494f89d.glb`, tuple exact, 7 comp keys verified, idempotent
  rerun = zero verbs.
- Note: `verify-repairs.ts` pins `av-carousel` in world `commons` (read-only
  reference) — left at polish-256 pin 38fbbc26dcdfcc1a by design.
- Evidence: `agents/arthur/reviews/hero-assets/polish-258-carousel/after/`.

## Next highest-value defects (re-judge from current pixels each tick)

- Horse trappings: saddle/blanket readability at 10–18m still unjudged.
- Mane slab: dark iron fin on the neck reads flat at close range (front view);
  candidate for a softer sweep, next in the horse-quality lane.
- DECK RULE (polish-260 finding): the canopy fully overhangs the deck — deck-top
  detail is invisible from every player vantage. Do not spend nodes on deck
  surfaces; fascia/rim (vertical faces) are the visible storytelling surface.
- Crown underside at close range: rib/valance junction density unjudged.

## Iteration history (continued)

### polish-261 — hero-readiness judgment (NO SOURCE CHANGE; eye-gate delivered)

- Candidate defect this tick: the mane iron slab. Multi-view zoom inspection
  (front/right/aerial crops) could not resolve it at any normal viewing
  distance — it is sub-threshold. No other element (saddles, base, stair,
  lanterns, night structure) rose to an evidenced defect on the contact sheet.
- Loop law: a survey-only wakeup is not progress, but neither is inventing
  ornament for an invisible element. The closed iteration here is the
  readiness JUDGMENT with evidence: night shows structure dimly present
  (horses + base readable), day readability strong, crown/tails/spire all
  accepted in polish-258/259, live tuple and comps verified.
- Verdict: carousel internally hero-ready. Eye-gate packet delivered to Bill
  exactly once (loop law), then the lane advances to the next ranked asset.
- Live hash: `ce3633992d07055e02115782f258de59764f5a9d9b6c461460f90931b8823fa7`
  (fresh rebuild byte-identical; live census lib/pose/7 comp keys verified).
- Evidence: `agents/arthur/reviews/hero-assets/polish-261-carousel/`
  (before/ = live build full rig; contact-sheet.jpg = 6-view packet).
- Next subject (post-carousel queue head): `nx-hearth` plaza hearth.

## EYE-GATE PACKET (delivered once, polish-261)

- Subject: `nx-carousel`, world commons-next. Live exact hash:
  `ce3633992d07055e02115782f258de59764f5a9d9b6c461460f90931b8823fa7`
- What changed this campaign: gold spire + scalloped valance crown
  (polish-258), horse tail re-orientation (polish-259); deck-inlay
  experiment tested and rejected with the canopy-occlusion proof (polish-260).
- Packet paths: reviews/hero-assets/polish-261-carousel/contact-sheet.jpg
  (front/right/gameplay/night/aerial/motion) + full 10-view rigs in
  polish-258/259/261 dirs. Live surface: billding.dev/?world=commons-next,
  carousel NW of plaza at (-18, 18).
- Bill's visual correction on this packet immediately re-prioritizes the
  carousel; otherwise the lane moves to the plaza hearth next wakeup.

### polish-260 — deck inlay enlargement (REJECTED, reverted, nothing placed)

- Hypothesis: 16 deck inlays (0.72 x 0.035 x 0.12, 4.75cm protrusion) were
  present but sub-resolution; enlarging them would give the deck a readable
  alternating cream/blanket ray pattern.
- Candidate hash 4fc3bdc2493a563a3240c478c82e5c32a9336e02a320c01525274193cc08e37d
  (inlays 1.15 x 0.055 x 0.3). Two rebuilds byte-identical.
- Falsification: identical-camera aerial diff = 2 pixels of 691200; true
  top-down probe showed the canopy (r 3.12, eave 4.83) fully overhangs the
  deck (r 2.86) — the deck top is occluded from every player vantage.
- Verdict: rejected; reverted to the exact live hash
  `ce3633992d07055e…` (verified: fresh rebuild byte-identical, live census
  lib/pose/7 comp keys unchanged). Nothing placed; live world untouched.
- Durable finding: deck-surface detail is canopy-shaded — polish the fascia/
  rim vertical faces instead. Top-down probe script pattern saved at
  /tmp (one-shot; rewrite as needed).
- Evidence: `agents/arthur/reviews/hero-assets/polish-260-carousel/`
  (before/ = live build; after/ = rejected candidate, retained as record).

### polish-259 — horse tail re-orientation (ACCEPTED, LIVE)

- Defect: tail cone `rotation.x = PI/2 + 0.3` pointed its TIP forward-down into
  the rump, so the wide BASE protruded backward as a black horizontal
  spike/arrow (clear in the back render; the element that reads as an arrow
  beside the white horse in old frames).
- Change (single edit, `mkcarousel.ts`): negated axis to `rotation.x = -PI*0.71`
  (sign-checked: tip dir (0,-0.61,-0.79) = ~38° below horizontal, down-and-back),
  re-anchored to (0, 0.44, -0.72), lengthened 0.55→0.65, radius 0.12→0.13.
  Tip at local (0, 0.24, -0.98) clears hooves/deck.
- Candidate hash: `ce3633992d07055e02115782f258de59764f5a9d9b6c461460f90931b8823fa7`
  (45 nodes / 38 draws, unchanged counts). Two rebuilds byte-identical.
- Falsification verdict: accepted — left view shows a natural down-and-back
  sweep on the blue horse, no clipping; gameplay silhouette unharmed; night
  unaffected. Spike read eliminated.
- Placed live: lib `store/ce3633992d07055e.glb`, tuple exact, 7 comp keys
  restored, idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-259-carousel/`.

### polish-262 — plaza hearth gathering ring (ACCEPTED, LIVE) — first post-carousel subject

- Subject: `nx-hearth` (village center of gravity, pos [0,0,0]). Build source
  `assets/mkv3-plaza.ts` → `village_plaza3.glb` (live was 43fcaf1442f5d6b8,
  19 nodes / 16 draws).
- Defect: the 8 outer pavers of the gathering ring had their LONG side RADIAL
  after the -a yaw — the ring was 8 disconnected slabs with ~1.6m bare gaps and
  read as scattered planks around the fire, not a gathering circle.
- Change (single edit): long side now TANGENTIAL (0.62/0.5 radial x
  1.62/1.34 tangential), near-continuous ring with ~0.5m deliberate worn
  gaps; wear alternation + UV windows kept; second edit trimmed radial depth
  (0.56/0.44) after corner math showed a 2.5cm plan overlap with the log
  benches at the shared diagonals (bench tip r 2.475 vs paver inner edge 2.45).
- Candidate hash: `027f6f019f9981bfe11f53963996c5a56594e7021ad962aa40e90c98291ee5e6`
  (19 nodes / 16 draws, unchanged). Double rebuild byte-identical.
- Falsification: aerial + gameplay confirm the ring reads as a paved gathering
  circle; benches/well/storyteller seat clear; no clipping.
- Placed via NEW dedicated placer `next-place-hearth.ts` (chassis copied from
  next-place-carousel.ts): live lib `store/027f6f019f9981bf.glb`, tuple exact,
  all 4 comp keys restored, idempotent rerun zero verbs. Note: the first
  placement attempt wiped comps (spawn before comp restore is inherent to
  re-place); `next-comps.ts` re-applied all 4 immediately, then the placer's
  own idempotent verify passed with the full bag.
- Standing gate ALL PASS (commons av-plaza-hearth pins untouched — different
  world, different entity).
- Evidence: `agents/arthur/reviews/hero-assets/polish-262-hearth/`
  (before/ = live 43fcaf14 build, after/ = 027f6f01 candidate).
- Next subject: belltower (post-carousel queue #2).

### polish-263 — belltower belfry lamp un-entombed (ACCEPTED, LIVE) — post-carousel subject #2

- Subject: `nx-town-belltower` (civic ring, pos [6.5,0,6.5], yaw −2.35619).
  Build source `assets/mkv3-landmarks.ts` (belltower block) →
  `village_belltower3.glb` (live was 66524bcde061a437, 11 nodes / 9 draws).
- Defect: the belfry lamp bead sat at (0, PH+1.9) = y 6.3 — 0.4 INSIDE the
  closed pyramid cap (cone base 5.9, radius 1.32 at that height). Geometrically
  occluded from EVERY vantage, day and night: a dead emissive. Warm-pixel
  count in the night render was 0.
- Change (single edit): lamp moved into open belfry air at (0.75, 5.6, 0.75),
  between the arch posts, clear of the bell (r 0.42). The tower gains its warm
  night signal.
- Candidate hash: `30407b959aa149626be5b2d706887b5def4ade86b7027a1914c8fe2a8f10f5bb`
  (11 nodes / 9 draws unchanged). Double rebuild byte-identical.
- Falsification: night warm-pixel count 0 → 34 (lamp now renders); day view
  shows a small warm accent in the belfry, not clutter. Carousel rebuild after
  the shared landmarks script still byte-identical (ce3633992…).
- Placed via NEW dedicated placer `next-place-belltower.ts`: live lib
  `store/30407b959aa14962.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs. commons' av-belltower tex-69/20 pins untouched.
- Evidence: `agents/arthur/reviews/hero-assets/polish-263-belltower/`.
- Next subject: welcome ensemble or tower (post-carousel queue #3/#4).

### polish-264 — welcome board COMMONS lettering enlargement (ACCEPTED, LIVE) — post-carousel subject #3

- Subject: `nx-welcome` (S rim, pos [-3,0,-4.3], yaw 0.6092). Build source
  `assets/mkv3-welcome59.ts` → `village_welcome3.glb` (live was
  4b94d42b9ef89826, 6 nodes / 5 draws).
- Defect: the COMMONS lettering pixels were 0.13m tall / 0.59m wide on a
  1.0m board — a dark smudge at gameplay distance (18m needs ~0.3m+ letter
  height); the sign's central greeting promise failed its own read.
- Change (single edit): letters enlarged to 0.26m tall × 0.94m word width
  (cw 0.021→0.0333, ch 0.026→0.052). First attempt (cw 0.038) computed
  wordW 1.038 > board 1.0 — caught in math BEFORE rendering, trimmed to fit.
  Vertical band re-centered (top 1.46 → bottom 1.20 inside board 1.14..1.56).
- Candidate hash: `362c5be14cb9a2459987851090e2e0c3afd0ca35fbced61386d5058c74a2b567`
  (6 nodes / 5 draws unchanged). Double rebuild byte-identical.
- Falsification: COMMONS readable at gameplay + medium views; lamp bead and
  pointer arms clear; no board-edge overflow.
- Placed via NEW dedicated placer `next-place-welcome.ts`: live lib
  `store/362c5be14cb9a245.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs. Companion light `nx-welcome-l` untouched.
  commons' av-welcome polish-29 pin untouched.
- Evidence: `agents/arthur/reviews/hero-assets/polish-264-welcome/`.
- Next subject: `nx-tower` (post-carousel queue #4).

## Post-carousel queue

Ranked by gameplay visibility when carousel is internally hero-ready:
plaza hearth ✅ (polish-262), belltower ✅ (polish-263), welcome ensemble ✅
(polish-264 — board done; the welcome lamp light entity remains), tower.
Present Bill one concise eye-gate packet exactly once at that point.
