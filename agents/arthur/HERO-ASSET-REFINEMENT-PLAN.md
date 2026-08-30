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

### polish-265 — tower crowned spire (ACCEPTED, LIVE) — post-carousel subject #4

- Subject: `nx-tower` (NE civic landmark, pos [14.1,0,16.9], yaw −2.44347,
  sockets:study comp). Build source `assets/mkv3-ring.ts` (tower block) →
  `village_tower3.glb` (live was 38f50c9f4fea4583, 19 nodes / 18 draws).
  NOTE: mkv3-ring.ts also carries the interior lane's staged garden-cottage
  furnishing — the polish edit touched ONLY the tower finial block; the
  interior change stayed in the working tree and was verified to reproduce
  the exact pre-tick tower bytes when reverted (38f50c9f… stash-round-trip).
- Defect: the roof finial was a bare 0.12×0.5m stick (y 7.6..8.1) — the crown
  died into a stub, the same unfinished-crown read the carousel had before
  polish-258's accepted spire.
- Change (single edit, tower block only): brass collar (0.3×0.12) at the apex
  + tapered gold cone spire (r 0.2, h 0.75 → apex 8.35). Same accepted crown
  language at tower scale.
- Candidate hash: `a989bdc3cad37b391442fcee313c1d8118f498a1576dea73b7e353eb879b466a`
  (20 nodes / 19 draws, +1 for the split collar/spire). Double rebuild
  byte-identical; stash-round-trip proves the interior residue is inert.
- Falsification: gameplay + front views show a crowned silhouette with a
  readable gold spire; night view keeps the lit window + porch lamp + spire
  profile; no float/tilt/oversize.
- Placed via NEW dedicated placer `next-place-tower.ts`: live lib
  `store/a989bdc3cad37b39.glb`, tuple exact, sockets:study preserved,
  idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-265-tower/`.
- Post-carousel queue (4 named landmarks) is now complete. Next: re-survey
  the core for the next-highest-defect landmark or hold for Bill's eye-gate.

### polish-266 — monument knot-path beads (ACCEPTED, LIVE) — core re-survey subject

- Subject: `nx-town-monument` (plaza NW, pos [-7,0,-7], yaw 0.7853981633974483,
  empty comp bag). Build source `assets/mkv3-monument.ts` →
  `village_monument3.glb` (live was 9520e61fc8e9d887, 10 nodes / 8 draws).
- Defect (stray-dot class): the 6 satellite beads used `cos(3t)/sin(3t)` with
  `t = k·π/3` — every sample lands on `3t = k·π`, so ALL beads collapsed onto
  two points at (±0.77, y, 0): a vertical dark cluster at the knot's edge (the
  "stray dot" in gameplay renders) instead of beads riding the path.
- Change (single edit): beads parametrized on the knot's actual path —
  `x=cos(5t)·0.85, z=sin(5t)·0.85, y=sin(2t)·0.35` (p=2 wave, q=5 ring —
  matching the knot geometry's own frequencies) — uniformly distributed
  around the tube.
- Candidate hash: `d7d3b15c6391aa7efafd8df9e5099ddfdbc2598e22df4a112e2b5492bd252922`
  (10 nodes / 8 draws unchanged). Double rebuild byte-identical.
- Falsification: gameplay view — the isolated stray dot at the knot edge is
  gone; beads now sit ON the tube path woven through the loops (the remaining
  small dark points read as tube gaps/shadows of the 3D weave, not detached
  specks). Monument identity, plinth, approach all unchanged.
- Placed via NEW dedicated placer `next-place-monument.ts`: live lib
  `store/d7d3b15c6391aa7e.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs. commons' av-monument tex-59/18 knot-comp pins
  untouched (different world).
- Evidence: `agents/arthur/reviews/hero-assets/polish-266-monument/`.

### polish-267 — market awning fascia (ACCEPTED, LIVE) — core re-survey subject

- Subject: `nx-town-market` (plaza SW, pos [-6.5,0,6.5], yaw 2.356194490192345,
  empty comp bag; companion light `nx-town-market-l` untouched). Build source
  `assets/mkv3-market.ts` → `village_market3.glb` (live was
  1262295539e80fa1, 13 nodes / 10 draws).
- Defect: the awnings were 3.5cm-thick bare slabs — razor-thin edges read as
  floating tabletops, not cloth canopies.
- Change (single edit): 1.9×0.11m fascia hems on both awnings' front edges,
  riding the existing `mk_awn_${si}` KEEP anchors (wind comps keep their
  targets; no new named nodes — merges into the awning bucket). Geometry
  verified: fascia (y 1.946..2.054 at z 0.545) covers the slab's front edge
  (y 1.987 at z 0.540) with no gap or z-fight.
- Candidate hash: `dabf662e5fe11f96ae9548385e4e260987d3a4aeedb1e67b2bbacb68ddcdee8a`
  (13 nodes / 10 draws unchanged). Double rebuild byte-identical.
- Falsification: front view shows a clear cloth hem at both canopies; gameplay
  view slightly improved (edge thickness reads at 18m); interior lane's
  visitor walk, warm stall light, and all other checks still PASS.
- Cross-lane pin refresh: `verify-interior4.ts` market byte pin advanced
  1262295539e80fa1… → dabf662e… in this commit (the pin tracks the live
  entity; interior lane notified via ledger).
- Placed via NEW dedicated placer `next-place-market.ts`: live lib
  `store/dabf662e5fe11f96.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-267-market/`.

### polish-268 — court bakery oven chimney (ACCEPTED, LIVE) — core re-survey subject

- Subject: `nx-court` (SE court, pos [18.9,~0,-14.8], yaw −0.90756,
  particles:smoke comp). Build source `assets/mkv3-ring.ts` (court block) →
  `village_court3.glb` (live was 38096b30b9131685, 28 nodes / 27 draws).
- Defect: the bakery oven — the court's fire source, whose live smoke origin
  is [-4.9, 3.2, -0.8] — rose from a bare dome with NO chimney, while every
  other fired building in the village vents through the housekit chimney.
  Smoke had no source structure; the shed's working silhouette was unfinished.
- Change (single edit): housekit `chimney()` stack at the oven's back edge
  (x −5.5, z −0.8), base FY+1.2, top FY+3.6. First sizing (top FY+3.1) was
  caught by decode: stack top y 3.42 sat BELOW the roof slope (~3.08 at that x
  was cleared, but front-view occlusion + ridge 4.04 hid it) — raised to
  FY+3.6 so cap+pot clear the slope; decode confirms chimney verts in the
  stone bucket (ct3_3 max y 2.8→3.42→3.9, count 336→360) and left view shows
  the stack breaking the ridge, attached and proportionate.
- Candidate hash: `59534b10122e6b476996f619476328d7dd8c0ea090f6107747020b1b646b4d89`
  (28 nodes / 27 draws unchanged — chimney merges into stone/iron buckets).
  Double rebuild byte-identical.
- Falsification: left + aerial views show the chimney breaking the roofline;
  gameplay composition unchanged; smoke comp untouched (comp bag preserved
  verbatim through re-place).
- Cross-lane care: the shared `next-place-court-ensemble.ts` was NOT used —
  it pins the interior lane's re-built nx-forge hash and would force foreign
  entities. Wrote court-only `next-place-court.ts` instead; ensemble placer
  untouched for its owner.
- Placed: live lib `store/59534b10122e6b47.glb`, tuple exact, smoke comp
  preserved, idempotent rerun zero verbs. commons' av-court pin untouched.
- Evidence: `agents/arthur/reviews/hero-assets/polish-268-court/`.
- Next: eye-gate consideration — the named core landmark set is exhausted;
  next tick surveys for any remaining evidenced defect or holds for Bill.

### polish-269 — town hall framed civic doors (ACCEPTED, LIVE) — core re-survey subject

- Subject: `nx-town-hall` (N of plaza, pos [9,0,-26], yaw −0.31322457341772525,
  empty comp bag; companion light `nx-town-hall-l` untouched). Build source
  `assets/mkv3-ring.ts` (hall block) → `village_hall3.glb` (live was
  44fec27226f02b74, 23 nodes / 22 draws).
- Defect: the civic hall's two doors (S plaza-facing 1.8m, N flow-through
  1.6m) were the last RAW-HOLE openings in the village — loop #89 gave the
  tower jambs+lintel, but the hall silently lost the same treatment in v3.
- Change (single edit): housekit `doorFrame()` bone frames on both doors.
  First attempt centered the frames in the wall thickness — decode proved
  them buried (front-view diff = 1 pixel). Second attempt offsets the frames
  +0.12m proud of the wall face; diff 1 → 66 px, lintel and jambs visible as
  civic trim at close/medium range.
- Candidate hash: `c5964bc886ad1a5cacb365a878ecd85a87ace8a00fa5de626df5622a1c72f187`
  (23 nodes / 22 draws unchanged). Double rebuild byte-identical.
- Falsification: honest read — the gain is finish/correctness more than
  gameplay-distance spectacle; accepted as completing the village door-craft
  law (no raw holes) rather than as a silhouette change.
- Placed via NEW dedicated placer `next-place-hall.ts`: live lib
  `store/c5964bc886ad1a5c.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-269-hall/`.
- Core re-survey status: carousel, hearth, belltower, welcome, tower,
  monument, market, court, hall — all surveyed/polished. Remaining named
  candidate: none above threshold. Lane next: hold for Bill's eye-gate
  verdicts on the campaign (carousel crown, tails, hearth ring, belltower
  lamp, welcome lettering, tower spire, monument beads, market fascia,
  court chimney, hall frames) or re-survey on new evidence.

## HOLD — polish-270 (2026-08-30, wakeup #13)

Fresh full survey at hold time: standing gate ALL PASS; all 9 polish-lane
live pins verified in the live census (165 entities); local builds of every
touched subject byte-identical to their live hashes. The named campaign
defect set is exhausted:

| subject | tick | outcome |
|---|---|---|
| nx-carousel crown | polish-258 | spire + valance, live |
| nx-carousel tails | polish-259 | spike read eliminated, live |
| nx-carousel deck | polish-260 | rejected (canopy occlusion proof) |
| nx-carousel overall | polish-261 | judged hero-ready; eye-gate sent |
| nx-hearth ring | polish-262 | gathering circle, live |
| belltower lamp | polish-263 | un-entombed, night signal restored, live |
| welcome lettering | polish-264 | readable at 18m, live |
| tower spire | polish-265 | crowned, live |
| monument beads | polish-266 | stray dots eliminated, live |
| market fascia | polish-267 | cloth hem, live |
| court chimney | polish-268 | smoke source restored, live |
| hall frames | polish-269 | door-craft law completed, live |

No remaining evidenced defect above threshold in the named core set.
HOLDING for Bill's eye-gate verdicts on the ten accepted changes; the lane
resumes on a visual correction, a new evidenced defect, or a widened queue.
(Also once: per the hold-law amendment — if this hold produces repeated
identical no-op surveys, say so and recommend /loop stop rather than burning
tokens.)

Hold tick (wakeup #14, self-paced): state unchanged — gate ALL PASS,
carousel pin re-verified live (`store/ce3633992d07055e.glb` at tuple),
9/9 pins held at last full census. Still holding for Bill's eye-gate
verdicts; no new evidence. Per the hold-law amendment this is the first
identical no-op survey since the hold began.

Hold tick (wakeup #15): state unchanged — gate ALL PASS, HEAD on sibling
artwalk-15 commit (gate accepts), carousel/hall/court build-bytes and live
carousel pin spot-checked identical. Second identical no-op survey since the
hold began. Per the hold-law amendment, stated once last tick: this loop
produces nothing until you act — recommend /loop stop, or hand me a visual
correction / new subject and I resume immediately.

## Post-carousel queue

Ranked by gameplay visibility when carousel is internally hero-ready:
plaza hearth ✅ (polish-262), belltower ✅ (polish-263), welcome ensemble ✅
(polish-264 — board done; the welcome lamp light entity remains), tower.
Present Bill one concise eye-gate packet exactly once at that point.
