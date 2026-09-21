# HERO-ASSET REFINEMENT PLAN — commons-next carousel

Lane: `polish-N`. Entity: `nx-carousel` (polish-only per INTERLANE-PROTOCOL).
Canonical loop: `agents/arthur/HERO-ASSET-REFINEMENT-LOOP.md`.

## Direct commission — carved-horse rollout (polish-283, live)

Bill's approved cream v2 now covers all four horses at `store/1c0128b61b510a5d.glb`. All seats corrected to model-rest Y=3.035, relative yaw=0; actual four-station rides verified rotation/bob, geometry alignment and native hop-off (auxiliary images, NOT native PASS). 137 tests pass. Production source: `carousel-horse-prototype/`; final contract/evidence: Excalibur `artifacts/reports/carousel-horse-rollout/rollout.md` and `final-live-state.json`. Do not rebuild/re-place legacy assets: use hash/from-lib gated `deploy.ts`, never `next-place-carousel.ts` or conflicting historical `assets/` writers. Preserve final tuple, motion roots and corrected component bag. `commons/av-carousel` unchanged. No new automated scope or loop stop is implied; this direct commission is finished.

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

### polish-271 — fountain water (ACCEPTED, LIVE) — first post-verdict subject

- Subject: `nx-dress-fountain` (plaza edge, pos [12.5,0,4], yaw −0.7853981633974483,
  EMPTY comp bag). Build source `assets/mkwater1.ts` (fountain block) →
  `village_fountain.glb` (live was bce94cf4fbef9b1a, 5 nodes / ~4 draws).
- Defect: the fountain was a DRY two-tier stone planter. Source comment promised
  a water-particles comp that was never applied — and `shared/particles.js`
  ships no water preset at all (fire/sparks/embers/smoke/dust/snow/magic/stars/
  muzzle). Every other water body in the village (cistern, ponds, trough) is
  geometry; the plaza centerpiece alone was dry.
- Change (single coherent intervention): palette-water `0x506a78` geometry —
  basin pool disc (r 1.38 at y 0.37), upper-bowl pool disc (r 0.63 at y 1.79),
  central jet column (r 0.045→0.075, y 1.84..2.36), finial lifted 1.95→2.42 to
  crown the jet. First attempt used the cistern's dark 0x303840; falsification
  showed the basin pool blending into dark stone — recolored to the housekit
  water blue (goat-trough precedent) for readability.
- Candidate hash: `3ff7af591b5635d4861b1ef4e0edb24a4f7ea9c248ea77cdc1d0b0bc68c37217`
  (8 top-level nodes). Double rebuild byte-identical.
- Falsification: gameplay-distance silhouette now reads "working fountain"
  (jet + lifted ball clear at range); top view shows both pools; dry-planter
  read eliminated. Day/grip geometry otherwise unchanged.
- Placement hazard note: the first edit run clobbered the baseline GLB before
  the before-render was captured (assets/ is untracked, git show cannot
  recover); recovered by reverting the source to baseline state and relying on
  the build's proven byte-determinism — baseline rebuilt exact bce94cf4, hash
  verified against the live lib before rendering. Lesson: capture before-bytes
  BEFORE the first rebuild of an untracked asset.
- Placed via NEW dedicated placer `next-place-fountain.ts`: live lib
  `store/3ff7af591b5635d4.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-271-fountain/`.
- Next: remaining core-dressing family (birdbath shares mkwater1.ts — re-judge
  from pixels next tick), or first eye-gate consideration for the water pass.

### polish-272 — town gate finished crowns (ACCEPTED, LIVE) ×4

- Subject: `nx-town-gate-n/s/e/w` (four gates at r 19.5 on the compass axes,
  one shared GLB → one edit improves four landmarks; empty comp bags). Build
  source `assets/mkgate.ts` → `village_gate.glb` (live was 558489ed8a6477c4,
  6 nodes).
- Defect: the post crowns died into flat 0.5×0.16 cap slabs — the same
  unfinished-crown class repaired on the carousel (polish-258) and tower
  (polish-265). At gameplay distance the caps read clipped.
- Change: brass collar + tapered gold spire (r 0.15, h 0.45) per post, the
  accepted crown language at gate scale. **Falsified first placement**: crown
  on the post cap (y 2.76..3.31) was occluded by the lintel (top y 3.09) —
  renders showed only sub-threshold nub tips peeking over the beam.
  REJECTED, then corrected in the same tick: re-based on the lintel top
  (collar y 3.14, spire 3.19..3.64) where it crosses each post, fully open.
  First rejected build 23e32f1a; accepted candidate
  `d1b90d6fc66b2db805155a52f0ef844b6ac2c354bb77fb3810406e1bee660d1f`
  (6 nodes / 6 meshes unchanged — crowns merge into material buckets).
  Double rebuild byte-identical.
- Falsification: front + gameplay views show both finials clearly; entrance
  marker read completes; no float/clip/proportion issues. Lesson recorded:
  check crown elements against OVERHANGING geometry above them, not just
  what's beneath.
- Placed via NEW batch placer `next-place-gates.ts` (4 slots, one upload):
  live lib `store/d1b90d6fc66b2db8.glb` on all four gates, tuples exact,
  empty comp bags preserved, idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-272-gate/`.
- Next: welcome lamp light entity remains from the old queue; otherwise
  core-dressing re-survey continues (giftshelf, banner, bench next ranked).

### polish-273 — plaza banner swallowtail pennant (ACCEPTED, LIVE)

- Subject: `nx-dress-banner` (plaza SE edge, pos [-4,0,9.5], yaw 2.356194490192345,
  empty comp bag). Build source `assets/mkvillage-civic.ts` (`bannerPole`) →
  `village_banner.glb` (live was e7347a24a8f9f0cc). Note: mkvillage-civic.ts
  also emits 13 sibling assets — the edit touched ONLY the bannerPole block;
  all other GLBs rebuilt byte-identical (determinism held across the shared
  script, verified via the double rebuild).
- Defect: the "banner" was a rigid 0.7×1.3 brass slab hung beside the pole —
  a sign board, not cloth — under a bare 0.14m bone CUBE finial (unfinished-
  crown class, polish-258/265/272 lineage).
- Change: swallowtail pennant via THREE.ShapeGeometry (V-notch in the free
  edge, DoubleSide, dark hem bar at the hoist for weight, hung y 2.02..2.67);
  crown → brass collar + gold spire (r 0.07, h 0.3), based ABOVE the pennant
  top per polish-272's overhang law.
- Candidate hash: `d32e7bcb8b007d210e4cdbe4272a43f4861e937c79dc7eaa3bc574af1e6642f8`.
  Double rebuild byte-identical.
- Falsification: the swallowtail notch reads unambiguously at gameplay
  distance; pennant ≠ board; crown finished; no float/clip.
- Placed via NEW dedicated placer `next-place-banner.ts`: live lib
  `store/d32e7bcb8b007d21.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-273-banner/`.
- Next: core-dressing re-survey (giftshelf, bench, fountain-night check), or
  eye-gate consideration for the water/crown/pennant pass.

### polish-274 — fountain night identity (ACCEPTED, LIVE)

- Subject: `nx-dress-fountain` (same tuple as polish-271). Build source
  `assets/mkwater1.ts` (fountain block) → `village_fountain.glb`
  (live was 3ff7af591b5635d4).
- Defect (judged from the durable polish-271 night.png, exact live bytes): the
  water faces vanish entirely after dark — the fountain is 13m from the plaza
  light, past its range, so pools + jet go total black; night criterion 6
  failed for the water the day pass had just added.
- Change: faint same-hue emissive (0x2e4a58, intensity 0.55) on the three
  water faces ONLY (shared waterMat) — moonlit-water read; no added light
  source, no bulb noise; stone stays unlit dark.
- Candidate hash: `72f07c2a466feae3d932a02cda1a1ecfdd4fb88684559cbd2b2cb2f7b53e0a7e`.
  Double rebuild byte-identical.
- Falsification: night render — jet column now faintly visible beneath the
  finial ball (before: black); day render — water unchanged, no artificial
  glow. Restrained per the no-noise law.
- Placed: `next-place-fountain.ts` hash updated to the new pin; live lib
  `store/72f07c2a466feae3.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-274-fountain-night/`.
- Next: core-dressing re-survey (giftshelf, bench) or eye-gate packet for the
  full water/crown/pennant/night pass.

### polish-275 — plaza bench center leg (ACCEPTED, LIVE) + giftshelf no-defect verdict

- Subjects: `nx-dress-bench-plaza` (plaza NW, pos [-9.5,0,-9.5], yaw 0.7853981633974483,
  empty comp bag); `nx-dress-giftshelf` (surveyed, untouched).
- Giftshelf verdict (survey-only but evidenced): objects readable at close
  range, stand proportioned, cloth scrap marks the taking-place — no defect
  above threshold. Deliberately small piece; forcing a change would be
  invented ornament (loop law). Recorded, not forced.
- Bench defect: legs existed only at the two arc ENDS — the three center
  slabs cantilevered unsupported; the middle read floating/broken (visible
  in the front render as a gap-to-ground under the arc center).
- Change (one line): legs at `[0, mid, segs-1]` — third leg under the arc
  center. Build source `assets/mkvillage-polish.ts` (`arcBench`) →
  `village_bench_arc.glb` (live was 185bc8466382b5c1, 7 nodes → 8).
- Candidate hash: `09f4d1741fdb24a631a42d0ecf8e89e03f95e1ea63ba557514b369bb64becc29`.
  Double rebuild byte-identical. Note: mkvillage-polish.ts also emits
  village_tree.glb — rebuilt byte-identical (edit touched only arcBench).
- Falsification: center leg reads sound, no clip/float/proportion change;
  seat silhouette unchanged.
- Placed via NEW dedicated placer `next-place-bench.ts`: live lib
  `store/09f4d1741fdb24a6.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-275-giftshelf/` (before
  only — no change made) + `polish-275-bench/`.
- Next: second bench (village_bench_arc has a sibling instance? — census
  check), chess table, then the water/crown/pennant/night eye-gate packet.

### polish-276 — chess table pedestal (ACCEPTED, LIVE)

- Subject: `nx-dress-chess` (SW of plaza, pos [-27.5,0,-9], yaw 1.2, empty
  comp bag). Build source `assets/mkqol1.ts` (chess block) →
  `village_chess.glb` (live was 6ea47f4abc95cbdc, 24 nodes → 25).
- Defect: the board sat at y=0 — frame on the grass, a mat rather than
  furniture; nothing about it read "table" at any range.
- Change: dark foot (0.34²) + pedestal post (0.09×0.68) raising frame to
  BOARD_Y 0.75; squares and pieces lifted with it. mkqol1.ts emits 4 sibling
  assets — rebuilt byte-identical (edit touched only the chess block).
- Candidate hash: `cb215e8c13c8ac79dc607208c7e1cfbd5ddddc6b6300f29f7fe5b00b36d4d08a`.
  Double rebuild byte-identical.
- Falsification: reads as a proper pedestal game table close-up; at gameplay
  range holds a table silhouette (vs the old ground patch); support sound,
  no clip/float.
- Placed via NEW dedicated placer `next-place-chess.ts`: live lib
  `store/cb215e8c13c8ac79.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs.
- Census note: fresh live census (190 entities) confirmed the bench at its
  polish-275 pin and exactly ONE arc-bench instance (stable bench is a
  different GLB) — no hidden second subject from polish-275.
- Evidence: `agents/arthur/reviews/hero-assets/polish-276-chess/`.
- Next: water/crown/pennant/night eye-gate packet (core-dressing wave
  complete: fountain ✓ night ✓ gates ×4 ✓ banner ✓ bench ✓ chess ✓).

### polish-277 — EYE-GATE PACKET delivered (wave: polish-271..276, no source change)

- Contact sheet: `agents/arthur/reviews/hero-assets/polish-277-eye-gate-packet.jpg`
  (6 tiles, label-verified against the images before delivery).
- Subjects and exact live hashes:
  | subject | tick | live lib |
  |---|---|---|
  | fountain water (day) | polish-271 | store/3ff7af591b5635d4.glb (superseded by 274) |
  | fountain night | polish-274 | store/72f07c2a466feae3.glb ← current pin |
  | gate crowns ×4 | polish-272 | store/d1b90d6fc66b2db8.glb |
  | banner pennant | polish-273 | store/d32e7bcb8b007d21.glb |
  | bench center leg | polish-275 | store/09f4d1741fdb24a6.glb |
  | chess pedestal | polish-276 | store/cb215e8c13c8ac79.glb |
- Eye-check walking circuit: spawn → fountain (12.5, 4, SE of plaza, ~14m)
  → bench (NW −9.5, −9.5) → gates N/S/E/W at r 19.5 → banner (SE −4, 9.5)
  → chess (SW −27.5, −9). Fountain night check after dusk (jet reads faint
  under the finial ball).
- Per loop law: packet delivered exactly once; no hold while waiting. Next
  tick re-surveys the core for any remaining evidenced defect above
  threshold.

### polish-278 — shrine stone embers (ACCEPTED, LIVE)

- Subject: `nx-town-shrine` (W of plaza, pos [-25,-0.0012609260510534298,-4],
  yaw 1.4118119548622732, empty comp bag). Build source `assets/mkv3-shrine.ts`
  → `village_shrine3.glb` (live was 78611c7dc9a3cb6e, 11 nodes → 12).
- Defect: the four standing stones ended in flat cuts (unfinished-crown
  class) AND the night render showed the whole circle black except three
  altar candle points — the weakest night identity in the core.
- Change: one small warm ember bead (icosahedron r 0.045, votive flame
  material family, intensity 0.9) on each stone summit. Stones become lit
  markers ringing the altar; no new light entities.
- Candidate hash: `53709062d3095dccd8410f2baa8c35dfb133f16a859f801a02aea758ad3713af`.
  Double rebuild byte-identical.
- Falsification: night — warm summit points visible above the altar candles,
  restrained (4 small points, not a light show); day — beads read as unlit
  warm stone, not pasted glow-orbs.
- Placed via NEW dedicated placer `next-place-shrine.ts` (py from the
  committed town placer, not snapped to 0): live lib
  `store/53709062d3095dcc.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-278-shrine/`.
- Next: bakery/smithy trade signs (the remaining named polish candidates
  from the core-town buildout list), then core re-survey or verdict hold.

### polish-279 — trade sign survey (bakery + smithy): NO DEFECT, both closed

- Subjects: `nx-sign-bakery` (599194ee7f4efd81…, unchanged) and
  `nx-sign-smithy` (d8df94003084af39…, unchanged). Baseline bytes rendered
  from the local deterministic builds (hash-verified against live lib).
- Bakery: raised loaf glyph with score marks reads clearly; board hangs
  believably from the iron bracket arm; two-way faces present (nvp-14 law);
  iron/bone/wood material truth holds.
- Smithy: hammer glyph (iron head, wood handle) reads clearly; same sound
  kit; two-way faces present (nvp-15 law).
- Verdict: NO DEFECT above threshold on either sign. These were the last
  named polish candidates from the core-town buildout list — the named
  queue is now fully closed (every core landmark + dressing piece has been
  surveyed: improved, or judged clean and left untouched).
- Live world untouched; no placement; evidence:
  `agents/arthur/reviews/hero-assets/polish-279-signs/`.
- Next: unnamed-core re-survey on fresh evidence (artwalk keeps adding
  riders), or hold for Bill's eye-gate verdicts on polish-271..278.
  If repeated identical no-op surveys accrue, recommend /loop stop per the
  hold-law amendment.

### polish-280 — approach lamp post finials (ACCEPTED, LIVE) ×4

- Subject: `nx-approach-lamp-n/s/e/w` (one shared GLB instanced at the
  cardinal axes r 10; empty comp bags; companion `*-l` light entities are
  separate and untouched). Build source `assets/mkv3-next-approach-lamp.ts`
  → `village_approach_lamp.glb` (live was 409084706b801f8d, 3 nodes).
- Defect: the post above the crossarm ended in a bare flat cut — the
  unfinished-crown class, reading as a stub at gameplay distance.
- Change: brass finial spike (cone r 0.055, h 0.26) capping the post summit;
  accepted crown language at lamp scale (iron post, brass cap — material
  truth).
- Candidate hash: `18b69a6bb2f5862f9848ec25687981a1eba5cd07b23b90d1ed6e735086672b87`.
  3 nodes unchanged (finial merges into the iron... into the brass bucket
  via its own material). Double rebuild byte-identical.
- Falsification: post top now completes the silhouette close and at
  gameplay range; spike proportionate, no clip/float.
- Placed via NEW batch placer `next-place-approachlamps.ts` (4 slots, one
  upload): live lib `store/18b69a6bb2f5862f.glb` on all four lamps, tuples
  exact, empty comp bags preserved, idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-280-approachlamp/`.
- Next: unnamed-core re-survey on fresh evidence, or hold for Bill's
  eye-gate verdicts on polish-271..280.

### polish-281 — cistern readable water (ACCEPTED, LIVE)

- Subject: `nx-cistern` (bakery cistern, court E side, pos
  [15.703583236444484, 0, -14.586880611718946], yaw −0.90756, empty comp
  bag). Build source `assets/mkv3-bakery-cistern97.ts` →
  `village_bcistern3.glb` (live was 85d956f6600f336d, 4 buckets).
- Defect: the interior water plane existed (bc_water, y 0.45 — accessor-
  verified, not a probe artifact) but in cistern-dark `0x303840`; from above
  it read as an EMPTY BLACK HOLE — the same falsification class the fountain
  water showed at polish-271. (Artwalk's B-23 rain-count rider on the face
  ignored during host judgment — ownership law.)
- Change: housekit water blue `0x506a78` + faint same-hue emissive
  `0x2e4a58` @ 0.45, the accepted fountain water treatment (polish-271/274).
- Candidate hash: `d3d3ad75932cb3da0abbb800251d9d94205e2ba5a834464741b0feee655b8f4d`.
  Double rebuild byte-identical.
- Falsification: top view — interior now unmistakably a water surface,
  natural not artificial; stone/lid/scoop unchanged.
- Placed via NEW dedicated placer `next-place-cistern.ts`: live lib
  `store/d3d3ad75932cb3da.glb`, tuple exact, empty comp bag preserved,
  idempotent rerun zero verbs.
- Evidence: `agents/arthur/reviews/hero-assets/polish-281-cistern/`.
- Next: nx-shutters survey, then re-survey/hold.

### polish-282 — shutters survey: NO DEFECT, core survey fully closed

- Subject: `nx-shutters` (tower study-shutter host-rider, 26259f89feb92736…,
  unchanged). Mounted on the tower drum at z≈2.82 — rendered alone it floats
  by nature, so mount falsification is impossible in isolation; the live
  mount tuple was already verified by the tower-ensemble placer gate.
- Panels judged correct: timber slats, iron hinge straps, believable
  open/shut pair (left folded, right drawn). No defect above threshold.
- **Campaign milestone:** with this, every core landmark, dressing piece,
  sign, and host-rider in commons-next has been surveyed — 9 accepted
  improvements (polish-271..279+281), 4 clean no-defect verdicts
  (giftshelf, trade signs, shutters). The survey list is EMPTY; further
  productive ticks require new evidence (Bill's verdict, a sibling change,
  or a fresh defect) or queue widening.
- Live world untouched; no placement.
- Next: hold for Bill's eye-gate verdicts on the wave, or re-survey on new
  evidence. Identical no-op surveys from here: say so once per the hold-law
  amendment and recommend `/loop stop` or a no-LLM monitor.

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

### polish-300 — hearth flagstone gathering ring (ACCEPTED, LIVE)

- Eye-gate packet for the polish-285..299 carousel night campaign DELIVERED
  (see packet section below) per loop law — exactly once.
- Subject: `nx-hearth` (village center, pos [0,0,0], yaw 0, 4 comp keys:
  motion:pz_kettle, motion:well_, particles:embers, sockets×5). Build source
  `assets/mkv3-plaza.ts` → `village_plaza3.glb` (live was 027f6f019f9981bf,
  polish-262's tangential-slab ring).
- Defect (ZAI judge on exact live served bytes, 18m, dress-80-calibrated via
  the accepted plaza-bench control frame: "partly presentation-driven" but
  "real strike for the debris-read"): the gathering ring read as scattered
  debris, not paving. Root causes probed: (a) plank-scale slabs — 8 long
  1.62/1.34m boards with ~0.5m gaps read as dropped planks; (b) A/B diff
  showed old slab surfaces already ~39% darker than ground (value was NOT
  the failing dimension — the re-lay is the cure, darkening supporting).
- Change (ONE intervention, mkv3-plaza.ts): re-laid the ring as 17 darker
  cut-flag stones (0.58/0.46m flags × 0.7m, r 2.95, slots at 9°+k·18°) in a
  new `flag` texMat family (0x4e4a38 base — pixel-probed separation 43.3%
  vs local ground); TWO deliberate sector breaks — the well owns E, the
  storyteller's stone owns S (v1's two tiny well-apron flags read as
  ambiguous slivers at aerial zoom and were cut). Inner edge r 2.60 clears
  bench tips (2.475) by 0.125m all around; v1's drum clearance 2.2cm kept
  only as the record (flags removed there).
- Candidate `890163cb872597e2d62b7861a8a954519fa1daf0a9a3cdf162a2ff940a104ecb`
  (rejected v1 `a36c3069…`: apron-flag sliver read, never placed). Double
  rebuild byte-identical. Source-truth control: stone bucket lost exactly
  the 8 old pavers (556→364 verts), flag bucket = 408 verts (17×24), all
  other buckets + both motion anchors byte-equivalent; flag material bound
  (pz3_4 → mat 2 'flag' tex) — an initial material-null false alarm
  (pz3_10) was retracted after full decode: legit COLOR_0-only ladle bucket.
- Judge verdicts (ZAI fallback, no native vision in this cron session,
  native re-judge owed — same class as polish-285..299): gameplay 18m
  ACCEPT (ring reads as intentional paved gathering circle, gaps read as
  designed entrances, no clutter, no float, scale correct — "from broken to
  shippable"); aerial CLEAN (no contact with well/teller stone, no slivers,
  two deliberate breaks). Bench-overlap nit falsified by aerial (source
  math 12.5cm clear; 18m projection class).
- Placed via updated dedicated placer `next-place-hearth.ts`: PLACED_VERIFIED,
  4-key comp bag replayed verbatim (motion anchors pz_kettle/well_ live in
  the new bytes), idempotent rerun zero verbs, live census pin
  `store/890163cb872597e2.glb` exact.
- Evidence: `agents/arthur/reviews/hero-assets/polish-300-hearth/` (before/ =
  live 027f6f01 rig + baseline.glb; after/ = v1 retained as record;
  after-v2/ = accepted; probes: pixdiff, aerial-diff, control, control-b,
  node-control).
- Next: plaza-core re-survey on fresh evidence (stringlights night read,
  mapboard, belltower clock face) or judge-named candidates from any lane's
  survey notes.

## EYE-GATE PACKET — polish-285..299 carousel night campaign (delivered 2026-09-19)

- Subject: `nx-carousel`, world commons-next, at polish-299 bytes. Live exact
  lib: `store/3ed80c49d16e89d8.glb` @ (-18, 0.0001495, 18) yaw 2.35619.
- What changed across the campaign (14 accepted ticks, all live): warm
  ceiling (285), rose four-coat set (286), night coat emissives (287),
  canopy fabric night form (288), structural material truth day+night (289),
  crown beacon (290), valance ember teeth (291), scenery ring (292),
  structural night value (293), panel separation (294), bone coat (295),
  navy coat (296), rose coat value (297), canopy wedge striping day (298) +
  night banding (299).
- Full per-tick evidence: `agents/arthur/reviews/hero-assets/
  polish-285-carousel-horses/` … `polish-299-carousel-seamtracery/` (each
  with before/after rigs, probes, deploy reports).
- Eye-check: spawn → walk NW ~36m to the carousel — day: pieced cream/red/
  gold canopy, four distinct coats (bone/rose/gold/navy), readable structure;
  night: lanterns brightest, crown beacon, lit valance ring, panel ring with
  four readable horses, striped cone, grounded base.
- Per loop law: delivered exactly once; no hold while awaiting verdict.


### polish-301 — mapboard parchment + ink map (ACCEPTED, LIVE)

- Subject: `nx-town-mapboard` (pos [2.5,0,9.5], yaw −2.944197, empty comp
  bag; artwalk riders b22/b26 untouched — map-side vertex envelope −0.0645
  preserved by decode). Source `assets/mkv3-mapboard.ts` (live was
  95231f20a016b303, byte-verified; 24→29 nodes).
- Defect (ZAI judge, disclosed fallback, native re-judge owed): chips
  indistinguishable from timber speckle — "signal and noise are
  indistinguishable"; no hierarchy beneath the wheel; map face blank at 18m.
- Change (ONE intervention): painted parchment sheet 0xcfc39a (chip-law
  emissive .38) 0.5mm proud of the slab face; roads re-inked 0x2e2a20;
  welcome-idiom title band + 9 glyph bars (improve-29 lineage);
  grainfield/laundry/welcome chips parchment-corrected. Two staging bugs
  caught in-tick (v1 sheet buried inside the slab — face pixels unchanged,
  polish-269 class; v2 band over glyphs) — rejected a82da177, 60235c47.
- Accepted v3 `4f9bb8a586f00f6d…` deterministic ×2; stack ladder
  −0.0355/−0.036/−0.0375; probes: map-face 18m avg 107→137, board-face
  103→140, night unchanged. Judge v3: contrast cured, title band reads,
  zero geometric defects.
- Placed via NEW `next-place-polish301-mapboard.ts`: PLACED_VERIFIED (1
  upload + 2 verbs), comp bag {} preserved, idempotent 0 verbs; live pin
  `store/4f9bb8a586f00f6d.glb` exact tuple; served DRACO (ba20ce99) keeps
  all four authored material signatures + emissives, 29/29/26 structure.
- Evidence: `reviews/hero-assets/polish-301-mapboard/` (before/ + buried
  v1 after/ + inverted after-v2/ + accepted after-v3/, backgameplay/
  backnight map-side 18m probes). Excalibur cast unreachable — recorded
  here + ledger.
- Next: chip clustering at spoke-ring junctions (both judges' convergent
  recipe — settlements at crossroads), or stringlights night survey.

### polish-302 — mapboard spoke-ring junctions (ACCEPTED, LIVE)

- Subject: `nx-town-mapboard` (same tuple as polish-301, empty comp bag).
  Build source `assets/mkv3-mapboard.ts` (live was 4f9bb8a586f00f6d).
- Defect (decode-proven at source, the polish-301 queue item's foundation):
  all 8 spokes ended at board r 0.2963 while the ring band starts at 0.385 —
  a uniform 8.9cm gap at EVERY junction; the map's own contract ("radial
  bars hearth->ring so roads CONNECT") was violated. Root cause: the spoke
  loop mixed frames — `outer = 0.83*S` for the box LENGTH while the center
  passed through onBoard's `ax*S` again (double-scale on center, unscaled
  length). polish-301's title band hid the wheel's mid-radius zone from the
  closeup probe; the decode manifest exposed it.
- Change (ONE source edit): spoke unit law — authored radii throughout
  (outer 0.83 = ring centerline, inner 0.12 = hearth disc rim), length
  (outer-inner)*S. Spoke 0 tip now 0.4150 == the ring band centerline
  exactly; diagonal AABB tips 0.4149; junctions covered by the torus tube
  ink. E-W bar/junctions + pin contact preserved; envelope unchanged
  (reader extreme still the torus poke -0.0645 = the artwalk b22/b26
  anchor; plaza-side -0.0335 unchanged).
- Candidate `1a73015f5ec4fdf44251ab69ecbaca9fcedda5278fe323cfb52ae6fbd16570b4`
  (29 nodes / 63 elements unchanged). Double rebuild byte-identical,
  mtime-verified. NaN scan clean (0 non-finite in served decode).
- Falsification: map-side 18m pixel diff = 154 changed px confined to the
  wheel rim zone (464..494, 310..349), 23-26 px in each of the six gapped
  junction sectors (E/W junctions were already covered by the E-W diameter
  bar — 2-5 px there); top/aerial byte-identical (0 px); front/night/
  gameplay diffs 10-28 px (sub-threshold micro). ZAI ui_diff judge on
  4x-zoom before/after crops (disclosed fallback — no native vision tool
  loadable in this cron session, same class as polish-285..301, native
  re-judge owed): BEFORE "8 floating bars inside a circle", AFTER
  "connected hub-and-spoke network", junctions read as solid welds, no
  floating marks/double lines/smudges, hearth hub reads as a disc — PASS.
- Placed via the updated dedicated placer `next-place-polish301-mapboard.ts`
  (hash gate advanced 4f9bb8a5 -> 1a73015f): PLACED_VERIFIED, 1 upload + 2
  verbs, comp bag {} preserved, idempotent rerun ALREADY_LIVE_NO_VERBS,
  live census pin `store/1a73015f5ec4fdf4.glb` @ (2.5,0,9.5) yaw
  -2.944197 exact.
- Served-bytes proof (struct-104 law): served DRACO 1138f60c… radial
  histogram of the ink bucket vs the previous served build ba20ce99:
  defect band r[0.29,0.305] 96 verts -> 0, ring band r[0.41,0.425]
  64 -> 160, ink verts 356 unchanged — the extension survived the
  re-encode; the player's served truth shows connected roads.
- Evidence: `reviews/hero-assets/polish-302-mapboard-spokes/` (before/ =
  live 4f9bb8a5 baseline 12-view rig + baseline.glb; after/ = candidate;
  probes: sector-classified pixel diff, served DRACO decode histogram).
  Probe scripts: `agents/arthur/p302-verify-served.ts`, /tmp/p302-hist.ts
  (one-shot, rewritten durable below).
- Durable probe: `agents/arthur/p302-verify-served.ts` (served decode +
  ink-bucket radial spans). Excalibur checkpoint: `eidoverse-hero-assets`
  cast NOT reachable (no workings/ tree at the Excalibur path) — recorded
  here + ledger instead. Not fabricated.
- Next: chip clustering at the four axis junctions (the remaining half of
  the polish-301 recipe — settlements at crossroads, now that the roads
  connect), or stringlights night survey.



## BILL VERDICT 2026-08-31: ALL APPROVED, KEEP IMPROVING

Bill: "they all look good, we should keep improving." All ten accepted
changes (carousel suite, hearth, belltower belfry lamp, welcome ensemble,
mapboard) eye-gate PASS. Hold lifted. The lane resumes the ranked-asset
queue at plaza-core landmarks, now with the standing artwalk language
directive active: motif geometry may join hero refinement where it serves
readability at gameplay distance (coordinated with the artwalk lane's
phase B log to avoid motif collisions per building).

## SEPTEMBER VERDICT + polish-284 outage tick (2026-09-18)

Bill's September wave verdict: all ten accepted, keep improving — hold
lifted (recorded in the cron prompt; the plan's named core set is fully
surveyed, so the resume queue = fresh evidence-driven re-survey of
plaza-core under the artwalk language directive).

Local recovery work instead: closed the interrupted polish-283
window's bookkeeping gap — committed its untracked production source
(carousel-horse-prototype/, 316K, sole builder of live lib
store/1c0128b61b510a5d) + tracked edits (plan note, legacy-guard placer
hook, mergekit +dove_) + polish-271..282 evidence dirs incl. exact-byte
baseline GLBs. Resume: fresh survey + first plaza-core visual iteration on
next wake once the gateway answers.

### polish-285 — carved-horse carousel warm ceiling (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-283 carved-horse fullset (live was
  `store/1c0128b61b510a5d.glb`). First polish-lane visual iteration on the
  new horse build (highest-value plaza-core subject after the September
  verdict).
- Defect (ZAI judge on exact live bytes, 18m): the under-canopy interior
  was a pitch-black void — the fabric cone's dark bottom cap swallowed the
  eight glow3 lanterns; night read "dark shed with horses / fireflies over
  a black mass". Adjacent finding: same-color horse pairs merge at 18m
  (projection, NOT contact — rollout decode already proved all six horse
  AABBs separate; noted as future motif-geometry candidate).
- Change (ONE intervention, new production step `carousel-horse-prototype/
  ceiling.ts`): split the 16 down-normal cap triangles out of the merged
  fabric bucket `cr3_4` (18 cap verts, capY 4.8098) and seat a warm self-lit
  ceiling disc r 3.02 at y 4.7898 (2cm below the true cap plane, ribs/
  lanterns stay above it). Base 0.87/0.76/0.58 warm cream; emissive tuned
  0.38→[0.53, 0.31, 0.14] after the first judge pass read "just above
  perception" (~3x dimmer than lanterns now). No new lights; fountain/
  cistern/shrine lineage. Nodes 45→46 (documented: unique emissive material
  cannot merge), draws 38→39.
- Rejected intermediate: v1-v4 builds carried a NaN vertex (value-vs-index
  bug in the split loop — `for (const k of keep)` passed VALUES to an
  indexing helper). Caught by the review renderer's frustum gate + offline
  NaN scan; never placed, fixed in v5.
- Candidate `329322416e14bc0342ca9044d9acfe51c12020bbba8e42aa61d906199cc6d5e0`,
  A/B byte-identical, NaN scan clean, 15/15 views clip-clean, bounds
  unchanged. Judge verdict (disclosed: ZAI — no native vision tool in this
  session): night "categorical fix, strong pass" — glow reads as a volume,
  lantern hierarchy intact ~3x; day 18m no new defects, visibility
  geometry-limited (shallow angle under valance) — accepted as the
  night-criterion fix.
- Placed via sanctioned `deploy.ts --apply` (never legacy
  next-place-carousel.ts): PLACED_VERIFIED, 1 upload + 8 verbs, comp bag
  (7 keys) replayed verbatim; idempotent rerun ALREADY_TARGET_VERIFIED
  (0/0); live census exact pin; SERVED bytes decode: ceiling node +
  material + emissive [0.53, 0.31, 0.14] survived the DRACO re-encode
  (served sha 597864a6…, NaN scan clean).
- Evidence: `agents/arthur/reviews/hero-assets/polish-285-carousel-horses/`
  (before/ = live baseline fullset + 15-view rig; after/ = candidate).
- Next: judge-remaining candidates — horse pair separation at 18m (motif/
  spacing, coordinate with artwalk phase log), gold spire speckle read,
  stairs contrast; or re-survey plaza-core on fresh evidence.

### polish-286 — carved-horse carousel four-coat set (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-285 ceiling build (live was
  `store/329322416e14bc03.glb`). Second visual iteration on the carved-horse
  fullset — the pair-separation candidate named at polish-285's close.
- Defect (judge finding confirmed source-true this tick): the two bone
  stations horse_2 (0,2) and horse_6 (0,-2) sit diametrically opposite and
  share ONE body material — `prototype_cream_paint` (fullset.ts's paint loop
  skips bonePaint stations: `identity.body !== 'bonePaint'`), so the pair
  merges in projection at 18m. The campaign's criterion 5 names the festive
  palette "cream/red/gold/wood" — red appeared on no coat.
- Change (ONE intervention, paint-only, new production step
  `carousel-horse-prototype/rose.ts` — exact ceiling.ts chassis + fullset.ts
  `paint()` recipe): rose-red coat 0xa8433c on horse_6's body (village-
  weathered red between canopy brown-red and true carousel rose; luminance
  96 vs bone 204/gold 150/blue 79 — every diametric + adjacent pair now
  separates in hue or ~0.2+ luminance, polish-3 readability law). horse_6_0
  and horse_2_0 SHARE the prototype body mesh, so the mesh is cloned
  (primitive wrappers only, accessors bit-shared) before the swap.
  horse_2/stations/sockets/motion roots untouched; nodes 45 unchanged,
  materials 21→22.
- Candidate `dfad459e492d97273f0ba21c43a4be2a4a7935ebcb7f8597d3501d2accd0a377`,
  A/B byte-identical. NaN scan clean. Controls: all four horse_2 frozen
  closeups + top view byte-IDENTICAL (change provably confined to horse_6);
  11 views containing horse_6 differ.
- Judge verdict (disclosed: ZAI — no native vision tool in this cron
  session, same class as polish-285, native re-judge owed): front 18m —
  baseline "two cream horses… zero body-color contrast… fails at distance"
  → candidate "passes color-distinction test, red unambiguous, no
  duplication"; back — 4 distinct, red focal horse; night — unchanged class
  from the accepted polish-285 ceiling verdict (threshold navy horse is
  pre-existing, not this edit).
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED, 1 upload +
  8 verbs, 7-key comp bag replayed verbatim; idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census exact pin
  `store/dfad459e492d9727.glb` @ (-18, 0.0001495, 18) yaw 2.35619.
  Served DRACO bytes keep `horse_6_rose_paint` material + webp texture +
  horse_6_0 binding (served sha 5e44fb40…, swatch avg RGB 168/67/60 exact,
  NaN scan clean).
- Evidence: `agents/arthur/reviews/hero-assets/polish-286-carousel-coats/`
  (before/ = live ceiling build full 16-view rig + baseline GLB;
  after/ = rose candidate).
- Next: judge-remaining candidates — gold spire speckle read, stairs
  contrast, night navy-horse threshold (occlusion-not-color class from the
  judge note); or re-survey plaza-core on fresh evidence.


### polish-287 — carousel night coat identity (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-286 rose-coat build (live was dfad459e492d9727).
- Defect (ZAI judge on exact live bytes, night frame): after dark only the bone
  horse read at 18m — rose invisible, blue a dark mass, gold muted (criterion 6
  failing 3 of 4 coats; lantern dots + ceiling carried the whole night).
- Change (ONE intervention, new production step `carousel-horse-prototype/
  coats.ts`): faint same-hue emissiveFactor on exactly the three failing body
  materials — gold [0.26,0.16,0.05] (v1 [0.15,0.10,0.06] judged "reads cream",
  retuned in-tick per polish-285 precedent), blue [0.07,0.12,0.17], rose
  [0.30,0.05,0.04]. No new lights (fountain-274/cistern-281/shrine-278/
  ceiling-285 lineage); bone control prototype_cream_paint untouched.
- Candidate `0144587820eb5e67…` A/B byte-identical; night pixel probes:
  blue-dominant 0→1807 px, warm 2697→4514; day diff confined to the three
  coats (horse_2 control closeups + top view = 0 changed px); 15/15 views
  clip-clean. Judge verdict (ZAI fallback, no native vision this cron session,
  native re-judge owed): four readable coats, "painted wood with mild
  self-illumination, not glow-orbs", lanterns still brightest, no new
  defects, "passes as a night read".
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED (1 upload + 8
  verbs), 7-key comp bag replayed verbatim, idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0), live census pin `store/0144587820eb5e67.glb`
  at the exact tuple; served DRACO bytes keep all three emissiveFactors
  exact; nodes 45 unchanged.
- Evidence: `reviews/hero-assets/polish-287-carousel-night/` (before/ = live
  build 15-view rig + stats; after/ = rejected v1 gold, disk-only, not
  committed; after-v2/ = accepted).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no such
  working exists in the current Excalibur layout); recorded here + ledger + 
  rollout artifact tree instead. Not fabricated.
- Next: canopy fabric night read (judge: canopy is the darkest large object,
  cream/red/gold absent after dark) — restrained fabric-emissive candidate;
  or re-survey plaza-core on fresh evidence.

### polish-289 — carousel structural material truth (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-288 canopy build (live was
  `store/e16a1bc002cb1650.glb`). Queue item named at polish-288's close
  (stairs contrast) expanded by survey into the whole structural band.
- Survey finding (ZAI judge + day-band pixel probe on exact live bytes):
  plinth/rim/poles/stairs rendered flat near-black RGB(35,27,22) in DAY
  (10:1 darker than ground) and a void at night. Center-horse night
  occlusion (queue head) was judged RESOLVED — front grey horse ~95%
  readable (polish-287/288 cures held).
- Decode root cause: NINE primitives carried NO glTF material — legacy
  v3 COLOR_0-only convention rendered as default-white-metal (near-black
  without envmap; the polish-283 horse-darkness class): `cr3_0` (plinth),
  `carousel_1` (rim+brass band), `carousel_2` (deck floor web + drop-pole
  shafts + collars), `cr3_2` (mid web/poles), `cr3_3` (upper ribs/hub/
  finial/valance armature), stair cheeks ×2 + treads ×2 (one shared mesh).
- Change (ONE coherent intervention, new production step
  `carousel-horse-prototype/materials.ts`, ceiling.ts chassis): assign
  authored families — stone plinth (plain mat), brass hardware (plain),
  wood stairs (carousel_wood texture + synthesized planar UVs) — with
  COLOR_0 re-normalized to white so the material owns color.
- Two build bugs caught by staging gates before any render/judge:
  (a) shared-mesh second-touch on deduped treads → deterministic OOM kill,
  fixed with an assigned-prims set; (b) normalized-UBYTE COLOR_0
  `getArray()` returns RAW bytes — writing float 1 = 1/255 BLACK, which
  multiplied v1-v4 outputs to near-invisibility; write 255.
- v6 tuning (3 measured rounds: 35→45→255-clip→190-225): stone
  [0.44,0.39,0.32] rough .85; brass [0.58,0.44,0.22] rough .5 metal .15.
  Measured 18m reads: plinth risers 190-225 pale limestone, brass band
  177-215 (lit) / 115-137 (shaded), wood treads 227 tan, night base
  2→54-61 readable dark-warm; four horse coats + canopy + lanterns
  byte-identical (horse-solo controls).
- Candidate `429cde23a16d1c1750af3f86f42a40f4f22816fa2acf19cfd304230e9ae99b53`,
  A/B byte-identical ×2, NaN scan clean, 15/15 views clip-clean, nodes 45
  unchanged, materials 22→24 (+2 plain families).
- Judge verdicts (disclosed: ZAI fallback, no native vision this cron
  session — same class as polish-285..288, native re-judge owed): day
  BASE READ: IMPROVED; night NIGHT BASE: IMPROVED (identity intact,
  lanterns still brightest); aerial: IMPROVED (regression check clean).
  A v4 judge "identical frames" verdict was falsified by pixel probes
  (hashes differed; sensitivity limit on dark masses) — pixel probes
  outrank prose.
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED, 1 upload +
  8 verbs, 7-key comp bag replayed verbatim; idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin
  `store/429cde23a16d1c17.glb` @ (-18, 0.0001495, 18) yaw 2.35619 exact;
  served DRACO bytes (sha 127a20bf…) decode with 0 material-nulls — the
  cure survived the re-encode.
- Evidence: `agents/arthur/reviews/hero-assets/polish-289-carousel-centerhorse/`
  (before/ = live baseline full rig; after/ = v6; deploy-report.json +
  .verified.served.glb).
- Next: ceiling-disc 18m dimness is GEOMETRY-LIMITED (ray test: ~50% of
  the disc occluded by valance teeth from the 18m eye at ~11° grazing;
  emissive cannot fix occlusion — a candidate needs rim-adjacent warm
  accent geometry, judge first); gold spire speckle; stairs contrast now
  largely cured by v6 wood.

### polish-291 — carousel night valance ember (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-290 crown-beacon build (live was
  `store/08ce1189b2d4b42b.glb`). Queue-head candidate named at polish-290's
  close: valance teeth still dark maroon at night.
- Defect: the 8 FABRIC teeth share `carousel_fabric` (polish-288 emissive
  lum≈0.06, ~14x below the ceiling) while the 8 gold teeth got the
  polish-290 beacon — the eave line strobes gold/maroon instead of reading
  as a lit festoon ring.
- Decode (polish291-probe-teeth2.ts): fabric teeth = the 48 cr3_4 triangles
  touching the tip row — 48 tip verts at EXACTLY y 4.580 r 3.080 in 8
  clusters spaced 45° (matching cr3_5's gold tip row: the 16-tooth valance);
  weld row y 4.860; cr3_4 has NO UV (corner-texel sampling; factor
  [1,1,1,1] + unnamed baseColorTexture own the look).
- Change (ONE intervention, new production step `valance.ts`, ceiling.ts
  chassis): split the 48 teeth triangles into `cr_valance_glow` with
  `carousel_valance_glow` = full clone of carousel_fabric + ember
  emissiveFactor [0.35,0.17,0.09] (lum≈0.215: cone 0.06 < teeth < ceiling
  0.36 < crown 0.62 < lanterns 0.86). Triangle conservation asserted.
  v1 REJECTED at pixel-diff: the clone omitted the baseColorTexture —
  teeth rendered white in day (~1000 warm px lost/view); v2 carries every
  channel (texture reference shared, asserted). Nodes 45→46, materials
  23→24 (documented: unique emissive material cannot merge).
- Candidate `a35f40f1925ce93bffdee46d7d60c7f8f3d2de0be45996c86f237c91ffdc1bc1`,
  A/B byte-identical ×2. Horse-solo controls 0 changed px; night warm
  5987→6754; day warm +36..+46 (faint emissive only); changed px confined
  to the eave band.
- Judge verdicts (ZAI fallback, no native vision this cron session, native
  re-judge owed — same class as polish-285..290): NIGHT PASS — lit garland
  read on the visible arc, rear arc correctly occluded at eye height,
  hierarchy lanterns > finial > teeth intact, restrained self-illuminated
  fabric not glow-orbs, zero new defects. DAY PASS — invisible change,
  natural festive fabric.
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED, 1 upload +
  8 verbs, 7-key comp bag replayed verbatim; idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin
  `store/a35f40f1925ce93b.glb` @ (-18, 0.0001495, 18) yaw 2.35619 exact.
  Served sha == upload sha (a35f40f1…): served decode keeps the valance
  material + emissive + texture, 48 tris, 0 non-finite, nodes 46 /
  materials 24, emissive set 8 exact.
- Evidence: `agents/arthur/reviews/hero-assets/polish-291-carousel-valance/`
  (before/ = live baseline full 15-view rig + baseline GLB; after/ =
  valance v2 candidate; deploy reports + verified served bytes).
- Next: judge-remaining candidates — (a) under-canopy rim-adjacent warm
  accent geometry for the ceiling-void (geometry-limited, needs new
  geometry, judge first), (b) gold spire speckle at 18m day; or
  re-survey plaza-core on fresh evidence.

### polish-290 — carousel crown beacon (ACCEPTED, LIVE)


- Subject: `nx-carousel` at the polish-289 structural build (live was
  `store/429cde23a16d1c17.glb`; polish-289's verified-served bytes
  127a20bf…, 327KB — the first polish tick to pin the SERVED lineage
  directly as input).
- Survey (ZAI judge on exact live served bytes, night 18m + fresh 15-view
  rig): polish-289's base fix held (stairs/plinth readable dark-warm,
  lanterns brightest, zero new defects). Weakest failing night elements:
  under-canopy ceiling void (KNOWN geometry-limited, polish-289 ray test —
  occlusion, not emissive) and the DEAD-DARK CROWN: "crown as village
  beacon" (criterion 6) fails outright — finial x475-492 reads as
  silhouette only.
- Decode (new probe `polish290-probe-crown.ts`): `carousel_gold_paint`
  (spire/hub/valance armature + gold teeth) carries NO emissiveFactor and
  is used by EXACTLY two nodes — `cr3_5` (241 verts, wy 4.58..6.77, the
  topmost element; polish-272 overhang law satisfied by construction) +
  `carousel_5` (68 verts, wy 4.53..4.83 lantern-ring trim). 100% crown
  zone, zero ground-level usage → material edit is surgically scoped by
  construction.
- Change (ONE intervention, new production step
  `carousel-horse-prototype/crown.ts`, materials.ts chassis): warm-gold
  emissiveFactor [0.85, 0.55, 0.2] on `carousel_gold_paint` ONLY — night
  beacon at the crown; ladder lanterns (glow3 lum≈0.80) > crown (0.62) >
  ceiling (0.35) so the eight lantern dots stay decisively brightest. No
  geometry/node/mesh/texture change; nodes 45, emissive set 6→7.
  Build-law note: first polish write-step reading SERVED DRACO bytes
  needed BOTH draco3d deps (decoder+encoder) registered.
- Candidate `08ce1189b2d4b42bf969b09a8643486afaf0f6e72da8a8fedde69f9ea08a6ea3`,
  A/B byte-identical ×2 (independent /tmp outputs), horse-solo closeup
  controls 0 changed pixels across all four views (change provably
  confined to the crown band y96..355), night warm px 4411→5987 (+36%),
  crown-band goldBright 591→1901 night / 1067→2433 day, nearWhite=0 both
  states (no clip, no glow-orb), 15/15 views clip-clean.
- Judge verdicts (disclosed: ZAI fallback, no native vision this cron
  session — same class as polish-285..289, native re-judge owed): NIGHT
  PASS — finial reads as "muted warm-gold beacon clearly separated from
  the night sky", lanterns remain brightest by far, "matte/dimly self-lit
  gilded metal, not neon", zero new defects. DAY PASS — "natural sunlit
  gilded metal… emissive genuinely faint and invisible in daylight",
  silhouette crisp, no regressions.
- Placed via sanctioned `deploy.ts --apply` (never legacy
  next-place-carousel.ts): PLACED_VERIFIED, 1 upload + 8 verbs, 7-key comp
  bag replayed verbatim; idempotent rerun ALREADY_TARGET_VERIFIED (0/0);
  live census pin `store/08ce1189b2d4b42b.glb` @ (-18, 0.0001495, 18)
  yaw 2.35619 exact, 7 comp keys. Served bytes sha == upload sha
  (08ce1189…): the emissive roundtrips; decode confirms
  `carousel_gold_paint` emissiveFactor exact [0.85,0.55,0.2], cr3_5
  nonFinite=0, emissive set 7 exact.
- Evidence: `agents/arthur/reviews/hero-assets/polish-290-carousel-rim/`
  (before/ = live served baseline + 15-view rig; after/ = crown candidate;
  deploy-report.json + .verified.served.glb + baseline-entity.json).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path) — recorded here + ledger instead.
  Not fabricated.
- Next: judge-remaining candidates — (a) crown-hub/valance second-pass
  warm rim (judge noted beacon rests on the finial alone; teeth still dark
  maroon), (b) under-canopy rim-adjacent warm accent geometry for the
  ceiling-void (geometry-limited; needs new geometry, judge first), (c)
  gold spire speckle at 18m day; or re-survey plaza-core on fresh evidence.

### polish-288 — carousel canopy fabric night read (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-287 night-coat build (live was
  `store/0144587820eb5e67.glb`).
- Defect (judge on exact live bytes, night 18m): the canopy cone read as a
  black void / silhouette hole above the lit interior — the landmark's
  largest exterior surface registered NO color after dark; festive
  cream/red/gold palette absent from the night identity (criterion 6).
- Baseline re-proof: on-disk dfad459e baseline + deterministic coats.ts
  rebuild → 01445878… byte-exact ×2 (determinism re-proven this tick);
  pinned input derived fresh.
- Change (ONE intervention, new production step
  `carousel-horse-prototype/canopy.ts`): same-hue emissiveFactor
  [0.10, 0.05, 0.035] on the single `carousel_fabric` material (cone
  slopes + fabric half of the scallop valance, both in merged cr3_4).
  Hue ratio preserved from the fabric's own decoded texture swatch
  (center (88,60,53), avg (100,68,55)); luminance ≈ 0.059 — ~6x below the
  accepted ceiling glow, ~25x below lanterns. Gold trim/spire
  (`carousel_gold_paint`) control untouched (shrine-stone law).
- Adjacent judge findings, NOT this edit: front-center horse reads dark
  grey/olive at night (pre-existing occlusion class, named polish-287);
  ceiling-disc interior glow reads dim at 18m front (pre-existing
  polish-285 element). Both queued as future candidates.
- Candidate `e16a1bc002cb1650b07460a28d40c750d3513fecd436d9669613e8c38b843971`,
  A/B byte-identical; night probe: canopy band warm px 4894→5875, all
  2916 changed px inside the silhouette (x 324–650); day diff confined to
  cone rows y 146–243 only; four horse-solo controls byte-IDENTICAL.
  15/15 views clip-clean, nodes 45 unchanged.
- Judge verdict (disclosed: ZAI fallback — no native vision tool in this
  cron session, same class as polish-285/286/287, native re-judge owed):
  canopy reads as dark warm-red/brown tent FORM via hue separation from
  the cool sky (not brute brightness), restrained fabric response not
  artificial glow, lanterns still decisively brightest, no new defects
  (no z-fighting/banding/orbs). Clear improvement vs black umbrella.
- Placed via sanctioned `deploy.ts --apply` (never legacy
  next-place-carousel.ts): PLACED_VERIFIED, 1 upload + 8 verbs, 7-key comp
  bag replayed verbatim; idempotent rerun ALREADY_TARGET_VERIFIED (0/0);
  live census pin `store/e16a1bc002cb1650.glb` @ (-18, 0.0001495, 18)
  yaw 2.35619 exact; served DRACO decode: all 7 emissive materials exact
  (served sha 89659740…, fabric [0.10, 0.05, 0.035] preserved).
- Evidence: `agents/arthur/reviews/hero-assets/polish-288-carousel-canopy/`
  (before/ = live 01445878 build full 15-view rig + baseline GLB;
  after/ = canopy candidate + stats).
- Next: night-tier candidates queue — center-horse night occlusion
  (judge-named), ceiling-disc 18m dimness (judge-named), gold spire
  speckle read, stairs contrast; or re-survey plaza-core on fresh
  evidence.

### polish-292 — carousel interior scenery ring (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-291 valance build (live was a35f40f1).
- Defect (judge ×2 + pixels): under-canopy vertical volume read as a dark
  cavity ("lit lampshade over a void") — night rows 285..300 measured 0 warm
  px except the pole; lantern dots floated disembodied. Day spire-speckle
  candidate FALSIFIED this tick (finial judged clean — no edit made).
- Change (ONE intervention, new step `carousel-horse-prototype/scenery.ts`,
  ceiling.ts chassis): 16 cream scenery panels r 2.6, y 3.00..4.28, 16° arc
  + 6.5° slits (far lanterns flicker through), static scene-level node —
  spin subtree/sockets/motion untouched. Emissive [0.40,0.24,0.11]
  (lanterns .80 > crown .62 > ceiling .36 > scenery .26 > teeth .215).
  Clearances decode-proven: web ≤2.16, lanterns 2.90..3.10, heads ≤2.75.
- Candidate `c62a8bbd8e794a9d…` A/B byte-identical; 15/15 clip-clean; nodes
  46→47. Night void-band warm 44→4025 px (frame +85%); day top view 6 px;
  horse-solo controls 4/4 byte-identical. Judge night PASS (classic
  carousel read restored, lanterns brightest, restrained) + day PASS
  (scenery not wall, horses dominant). ZAI fallback disclosed, native
  re-judge owed (same class as polish-285..291).
- Placed via `deploy.ts --apply`: PLACED_VERIFIED (1 upload + 8 verbs),
  7-key comp bag verbatim, idempotent 0/0, live pin
  `store/c62a8bbd8e794a9d.glb` exact; served sha == upload sha, served
  decode keeps node/material/emissive, 0 non-finite.
- Evidence: `agents/arthur/reviews/hero-assets/polish-292-carousel/`.
- Next: night plinth/brass-band value (judge-named, polish-289 v6 re-tune
  candidate); tan-horse vs panel value proximity (judge optimization
  note); or re-survey plaza-core on fresh evidence.

### polish-294 — carousel scenery-panel night separation (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-293 structural build (live was 0cdd7eed).
  Queue-head candidate from polish-292's close (tan-horse vs scenery-panel
  value proximity), re-judged fresh this tick on exact live bytes.
- Defect (judge, night 18m): the gold/tan horse read as a HOLE in the
  glowing panel ring — warm-on-warm with the horse value-INFERIOR (gold
  coat emissive lum 0.173 < panel 0.265; hue ratios 5.2 vs 3.64,
  near-matched). Day passed but on a thin margin (dark-mane dependence,
  judge caveat). Judge's own recommendation: dim + desaturate the panels.
- Survey findings, NOT defects (phase-transient / inherent): rose horse
  occluded behind bone horse at the rig's phase-0 front alignment — the
  live carousel spins 6°/s continuously, an authentic moment, not a defect
  class; bone horse reading near-black at night — universal hue-loss under
  emissive-only night lighting (pre-existing polish-291 class), reads as
  a figure.
- Change (ONE intervention, new production step
  `carousel-horse-prototype/scenerysep.ts`, plinth/crown chassis):
  emissive-only edit `carousel_scenery_panel` [0.40,0.24,0.11] →
  [0.28,0.20,0.15]. Lum 0.265→0.213 (−19%); R/B 3.64→1.87 (warm cream →
  grey-cream). Hue split vs gold coat more than doubles (5.2 vs 1.87).
  No new lights, no geometry, no nodes; horse materials byte-untouched.
- Night ladder after: lanterns .80 > crown .62 > ceiling .36 > teeth .202 ≈
  scenery .213 > gold coat .173 > canopy .06 > structural .039/.036.
- Candidate `8cd33f4423d8f7e7ab676789d3b30bca7984da848efd5f9d766faefca98f4eab`,
  A/B byte-identical ×2. 15/15 views clip-clean. Night pixel diff 19311 px
  confined to the panel band (rows 249..346, maxDelta 24); day 18m subtle
  (maxDelta 16, cooler panels); horse-solo controls 4/4 byte-IDENTICAL.
- Judge verdicts (ZAI fallback, no native vision this cron session, native
  re-judge owed — same class as polish-285..293): NIGHT PASS — gold horse
  now reads as a warm GOLD FIGURE against neutral grey-cream panels,
  silhouette intact, panels not muddy, hierarchy correct; ≥3 horses
  readable as individuals. DAY PASS — cool shift judged a net positive
  (navy/rose/gold gain margin), festive read held by independent elements;
  watch-item recorded: the bone-horse torso margin is the FLOOR — do not
  cool or lighten the panels further or the bone horse merges.
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED (1 upload +
  8 verbs), 7-key comp bag replayed verbatim, idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin `store/8cd33f4423d8f7e7.glb`
  @ (-18, 0.0001495, 18) yaw 2.35619 exact. Served sha == upload sha
  (8cd33f44… identity).
- Evidence: `agents/arthur/reviews/hero-assets/polish-294-carousel-scenerysep/`
  (before/ = live 0cdd7eed build full 15-view rig + baseline GLB;
  after/ = candidate; deploy dry/apply/idem reports + verified served
  bytes; baseline-entity.json regenerated fresh from the live census).
- Next: judge-remaining candidates — (a) bone/rose night-hue-loss class
  (pre-existing; a motif-geometry candidate under the standing artwalk
  language directive, needs artwalk phase-log coordination), (b) crown-hub
  second-pass warm rim (judge-named at polish-290 close, still unjudged);
  or re-survey plaza-core on fresh evidence.

### polish-295 — carousel bone-coat night identity (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-294 scenerysep build (live was 8cd33f44).
  Queue-head candidate from polish-294's close (bone/rose night-hue-loss),
  re-judged fresh this tick on exact live bytes.
- Defect (judge, night 18m): the BONE horse (horse_2,
  prototype_cream_paint) read as the DARKEST object in the frame — darker
  than the night sky — an inversion of its role as brightest day coat;
  bone+rose compressed into one muddy black mass. Root cause: emissive
  [0,0,0] — polish-287's control was the remaining hole.
- Change (ONE intervention, new production step `bonecoat.ts`, scenerysep
  chassis): faint warm-neutral emissive [0.28,0.25,0.21] on
  prototype_cream_paint ONLY. Lum 0→0.254 — brightest coat (1.46× gold),
  1.19× above scenery panels with a hue split (R/B 1.33 vs 1.87) so no
  polish-294 warm-on-warm "hole" recurrence; below ceiling .345, crown
  .59, lanterns .80. Scope gate asserts single-primitive usage
  (horse_2_0[0], 8021 verts). No new lights/geometry/nodes; other three
  coats byte-untouched.
- Candidate `2d61deabf0c2560d…` A/B byte-identical ×2; NaN scan clean;
  15/15 views clip-clean; night changed-band avgRGB 47→138 (~3×);
  day same-band 155→197, judge-verified no washout.
- Judge verdicts (ZAI fallback, no native vision this cron session, native
  re-judge owed — same class as polish-285..294): NIGHT PASS — bone reads
  as pale-coat figure (legs/bridle/saddle legible), painted-wood not
  glow-orb, all four horses distinct for the first time, lanterns still
  brightest, clean panel separation, zero new defects. DAY PASS —
  shading/musculature intact, palette harmony, no clipping.
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED (1 upload +
  8 verbs), 7-key comp bag replayed verbatim, idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin `store/2d61deabf0c2560d.glb`
  @ (-18, 0.0001495, 18) yaw 2.35619 exact. Served sha == upload sha
  (identity); served DRACO decode keeps emissive [0.28,0.25,0.21] on
  horse_2_0[0] only.
- Evidence: `agents/arthur/reviews/hero-assets/polish-295-carousel-nightcoats/`
  (before/ = live 8cd33f44 build full 15-view rig + baseline GLB;
  after/ = bone-coat candidate; deploy dry/apply/idem reports + verified
  served bytes; polish295 probes: mats, pixdiff).
- Next: judge-remaining candidates — (a) NAVY coat night margin (judge
  note: now the thinnest readability margin, survives on hue+shape alone
  — a whisper-raise of horse_4_cream_paint [0.07,0.12,0.17] is the
  obvious next edit, but judge fresh first), (b) rose night occlusion
  (geometry-limited: fragment-readable; judge suggested angular offset of
  the rose horse on its pole would help more than material — motif
  geometry, artwalk coordination), or (c) re-survey plaza-core on fresh
  evidence.

### polish-293 — carousel structural night value (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-292 scenery build (live was
  `store/c62a8bbd8e794a9d.glb`). Queue-head candidate from polish-292's
  close: night plinth/brass-band value.
- Defect (measured this tick, night band probe on exact live bytes):
  after dark the plinth/base band (rows 396..432, world y 0..0.5) read
  mean RGB (43,37,24) — luminance ~40 vs the lit interior's 140-175 and
  even the valance teeth's ~90. The carousel's carrying structure
  vanished into a void under the lit drum (criterion 6). Day was sound
  (plinth 190-225, polish-289 v6) — a night-only value gap.
- Change (ONE intervention, new production step
  `carousel-horse-prototype/plinth.ts`, crown.ts chassis — emissive-only
  edit on the two existing structural plain materials, no new lights, no
  geometry, no nodes): `carousel_stone_plain` (sole user cr3_0 plinth)
  → [0.050,0.034,0.018]; `carousel_brass_plain` (rim band + poles +
  ribs/valance armature) → [0.055,0.036,0.014]. Night ladder:
  lanterns .80 > crown .62 > scenery .26 > teeth .215 > brass .039 ≈
  stone .036. Day impact ≈ +8/255 on 190-225 bases — invisible
  (polish-287 law).
- Candidate `0cdd7eedcc22b312c9b74702a2a4035fdc4b1a6da336a6440b078e65aebf0492`,
  A/B byte-identical (independent /tmp rebuild). Nodes 47 / materials 25
  unchanged. Horse-solo closeup controls 4/4 byte-IDENTICAL (edit
  provably confined to structural mats). Night plinth rows lift
  (43,37,24) → (77-82,65-68,42) warm-dominant; day maxDelta 22 across
  11 views, extent inside the silhouette.
- Judge verdicts (ZAI fallback, no native vision this cron session,
  native re-judge owed — same class as polish-285..292): NIGHT PASS —
  "no longer floating over a void — stands on a grounded, readable
  base", hierarchy lanterns > interior > structure intact, zero new
  defects. DAY PASS — natural sunlit material, "no emissive look,
  oversaturation, or pasted-on luminance anywhere", clean pass.
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED (1 upload +
  8 verbs), 7-key comp bag replayed verbatim, idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin `store/0cdd7eedcc22b312.glb`
  @ (-18, 0.0001495, 18) yaw 2.35619 exact. Served sha == upload sha:
  served DRACO decode keeps all 11 emissive materials EXACT (incl. the
  two new structural factors). Deploy notes: baseline-entity.json was
  regenerated fresh from the live census (the copied polish-292 one
  pinned a35f40f1 and would not validate); one transient gateway
  failure absorbed by a single paced retry (DRY_RUN_READY on retry).
- Evidence: `agents/arthur/reviews/hero-assets/polish-293-carousel-plinth/`
  (before/ = live build full 15-view rig + baseline GLB; after/ =
  candidate + stats; deploy dry/apply/idem reports + verified served
  bytes; polish293 probes: plinth bands, node decode, pixdiff).
- Next: tan-horse vs scenery-panel value proximity (judge optimization
  note, polish-292); or re-survey plaza-core on fresh evidence.

### polish-296 — carousel navy-coat night identity (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-295 bone-coat build (live was 2d61deab).
  Queue-head candidate from polish-295's close (navy-coat night margin),
  re-judged fresh this tick on exact live bytes.
- Defect (judge, night 18m): the NAVY horse (horse_4, horse_4_cream_paint)
  was the least legible ride figure — silhouette-only against the cream
  scenery panels (~10-25% of bone's legibility), color identity near-lost,
  anatomy unresolved, dissolving against panel gaps and the sky.
- Change (ONE intervention, new production step `navycoat.ts`, bonecoat
  chassis): emissive-only edit horse_4_cream_paint [0.07,0.12,0.17] →
  [0.10,0.20,0.28]. Lum 0.113→0.185 (+64%), blue saturation UP (R/B 0.41
  → 0.357 — opposite of desaturating toward the grey-cream panels R/B
  1.87), night ladder: lanterns .80 > crown .59 > ceiling .35 > bone .254
  > panels .213 > teeth .203 > NAVY .185 > gold .173 > rose .102. Day
  delta sized BEFORE building: ≈ +17 sRGB points, milder than polish-295's
  judge-cleared bone +42. Single-primitive scope (horse_4_0[0], 8021
  verts) proven by probe on the pinned bytes; no new lights/geometry/nodes
  (47/25 unchanged); other three coats byte-untouched.
- Candidate `bad22d1963d3a78b…` A/B byte-identical ×2; NaN scan clean;
  15/15 views clip-clean; night band avgRGB 93→115, day 111→130 (+19);
  horse_2-solo controls 4/4 byte-IDENTICAL (scope proof).
- Judge verdicts (ZAI fallback, no native vision this cron session, native
  re-judge owed — same class as polish-285..295): NIGHT PASS — legible blue
  figure, head/neck/legs/tail separable, reads "blue horse" not dark blob,
  hierarchy bone > gold > navy intact, painted-wood not glow-orb, zero new
  defects; disclosed nuance: hue reads dusty-slate at this lift (inherent
  ceiling of raising a dark coat). DAY PASS — natural navy painted wood,
  no glow/sheen/washout, hierarchy holds, functionally invisible change.
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED (1 upload +
  8 verbs), 7-key comp bag replayed verbatim, idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin `store/bad22d1963d3a78b.glb`
  @ (-18, 0.0001495, 18) yaw 2.35619 exact. Served sha == upload sha
  (identity); served decode keeps horse_4_cream_paint [0.10,0.20,0.28] on
  horse_4_0[0] only, other coats exact.
- Evidence: `agents/arthur/reviews/hero-assets/polish-296-carousel-navy/`
  (before/ = live 2d61deab build full 15-view rig + baseline GLB;
  after/ = navy candidate; baseline-entity.json regenerated fresh from the
  live census; deploy dry/apply/idem reports + verified served bytes).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path) — recorded here + ledger instead.
  Not fabricated.
- Next: judge-remaining candidates — (a) rose night occlusion
  (geometry-limited; judge suggested angular offset of the rose horse on
  its pole — motif geometry, artwalk coordination), (b) bone-slate vs
  navy hue nuance (fine as judged), or (c) re-survey plaza-core on fresh
  evidence.

### polish-298 — carousel canopy pieced-wedge striping (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-297 rose-coat build (live was acee7bcf).
  Queue-head candidate from polish-290/297 close (crown-hub/valance second
  pass — the mid-cone dead surface), re-judged fresh on exact live bytes.
- Defect (judge ×2): DAY 18m mid-roof cone a flat untextured mass; NIGHT the
  weakest element, barely separated from the sky (criteria 2 + 6).
- Change (ONE canopy-piecing intervention, new production step
  `carousel-horse-prototype/ribbing.ts`, additive-only): 4 deep-red 45°
  full-slope wedge panels (y 4.84..5.78) alternating with bare cream fabric
  + 8 cream seam battens (22cm × 6cm proud) with teeth-parity night
  emissive [0.30,0.21,0.085]. Six falsified builds en route (v1/v2 thin
  battens sub-resolution; v3 primitive split caught by probe pre-render;
  v4 rose/cream winding+sky-collision; v5 cream wedges collide with day sky
  lum 212 — scanline-proven; v6 16-wedge rhythm broken). Red completes the
  cream/red/gold festive palette (criterion 5).
- Candidate `75b413c2…` A/B byte-identical ×2; NaN clean; 15/15 clip-clean;
  horse-solo controls 4/4 byte-identical; nodes 47→49, materials 25→27
  (+2 documented). Judge day PASS (classic pieced canopy, sewn-gore read) +
  night PASS (tangible tent form, hierarchy intact, nothing too bright).
  ZAI fallback disclosed, native re-judge owed.
- Placed via `deploy.ts --apply`: PLACED_VERIFIED (1 upload + 8 verbs),
  7-key comp bag verbatim, idempotent 0/0, live pin
  `store/75b413c27e9cfbe1.glb` @ (-18, 0.0001495, 18) yaw 2.35619 exact;
  served sha == upload sha; served decode keeps wedges + ribs.
- Evidence: `reviews/hero-assets/polish-298-carousel-crownrim/`.
- Next: night seam tracery refinement (judge nuance: implied not drawn —
  4-6 subtle darker radial seams judge-suggested); carousel is otherwise
  polled clean across criteria 1-7 — consider eye-gate packet for the
  polish-285..298 night campaign, or re-survey plaza-core on fresh evidence.

### polish-299 — carousel wedge night banding (ACCEPTED, LIVE)

- Subject: `nx-carousel` at the polish-298 wedge build (live was 75b413c2).
  Queue-head candidate from polish-298's close (night seam tracery,
  "implied not drawn"), re-judged fresh this tick on exact live bytes.
- Defect (fresh judge on exact live bytes, night 18m + pixel probes): the
  cone read "smooth, unbroken… no discrete radial lines, battens, or
  seams"; red/cream wedge alternation "does not survive night lighting";
  night identity 4/10 "generic dark umbrella roof"; weakest element =
  the canopy cone. Root cause decoded: `carousel_fabric_b` emissive
  [0.15,0.05,0.04] (lum .071) vs cream fabric .059 — Δ.012 renders ≈ +4
  sRGB, value-dead; the 13px batten lines alone cannot carry the read.
- Change (ONE intervention, new production step `wedges.ts`, ribbing.ts
  chassis): emissive-only edit `carousel_fabric_b` → [0.62,0.20,0.13]
  (lum .285). Three measured rounds: v1 .149 "barely-there warm tint";
  v2 .212 A/B-confirmed 2v1 segments but full-frame underpowered AND
  pixel-diagnosed as sitting AT the scenery-panel value (.213) — roof
  band merged with the lit clerestory; v3 .285 lifts the stripes clearly
  above the interior band (lit-from-within circus canvas read), decisively
  below ceiling .35, crown .59, lanterns .80. Day falsifier PASSED
  (+40.6 avg, "no panel reads as self-lit in daylight", natural painted
  gores, zero regressions). Scope gate: sole primitive user
  cr_canopy_wedges[0] (16 verts) asserted; no new lights/geometry/nodes
  (49/27 unchanged); spin subtree/sockets/motion untouched.
- Candidate `3ed80c49d16e89d8c0eb4900d8dbd8ab1b0850a4aa3cf8603bad88b3e3e41f1b`
  A/B byte-identical ×2, NaN scan clean, 15/15 views clip-clean, horse-solo
  controls 4/4 byte-IDENTICAL, night changed-px 234 warm 98% confined rows
  188..211 (cone band); night A/B crop judge: legibility roughly doubled,
  "clearly pieced near the apex", eave boundary clean, zero artifacts;
  watch-item: near saturation ceiling — no further intensity push.
- Judge verdicts (ZAI fallback, no native vision this cron session, native
  re-judge owed — same class as polish-285..298): night A/B PASS (2-3 vs 1-2
  red segments, red reads deliberate not accidental, hierarchy lanterns >
  interior > wedges intact, restrained not glow-orb); day PASS (subsumed by
  daylight, "correct outcome"). One judge claim ("emissive might not have
  rendered") pixel-falsified (sha-confirmed render + 234 changed px) —
  polish-289 class, probes outrank prose.
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED (1 upload + 8
  verbs), 7-key comp bag replayed verbatim, idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin `store/3ed80c49d16e89d8.glb`
  @ (-18, 0.0001495, 18) yaw 2.35619 exact. Served sha == upload sha
  (identity); served decode keeps emissive [0.62,0.2,0.13] on
  cr_canopy_wedges[0] only, NaN clean.
- Evidence: `agents/arthur/reviews/hero-assets/polish-299-carousel-seamtracery/`
  (before/ = live 75b413c2 build full 15-view rig + baseline GLB;
  after/ = v1 retained as record; after-v2/, after-v3/ = measured rounds;
  night-cone-ab*.png = judge A/B crops; deploy dry/apply/idem reports +
  verified served bytes; census-baseline/fresh + baseline-entity.json
  regenerated fresh; polish299 probes durable-copied).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path) — recorded here + ledger instead.
  Not fabricated.
- Next: carousel polled clean across criteria 1-7 after polish-285..299 —
  eye-gate packet candidate for the night campaign (deliver exactly once
  per loop law); or re-survey plaza-core on fresh evidence.



- Subject: `nx-carousel` at the polish-296 navy-coat build (live was
  bad22d19). Queue-head candidate from polish-296's close (rose night
  occlusion), re-judged fresh this tick on exact live bytes.
- Defect (judge, night 18m): the ROSE horse functionally invisible —
  70–80% occluded behind the bone horse (spin-transient alignment,
  authentic per polish-294), and its visible slivers VALUE-DEAD (lum
  0.102, darkest coat) — mis-read as "red tack/blanket on the white
  horse". Ranking bone > gold > navy > rose. Judge's angular-offset
  alternative rejected: geometry would touch the polish-283 rollout
  contract (motion roots, seat Y=3.035); the material lever cures the
  mis-read.
- Change (ONE intervention, new production step
  `carousel-horse-prototype/rosecoat.ts`, navycoat chassis):
  emissive-only edit horse_6_rose_paint [0.30,0.05,0.04] →
  [0.52,0.10,0.08]. Lum 0.102→0.188 (+84%): above navy .185/gold .173,
  below bone .254; R/B 6.5 keeps a huge hue split (panels 1.87, bone
  1.33). Day delta +22 sRGB (half polish-295's cleared +42).
  Single-primitive scope (horse_6_0[0], 8021 verts) probe-proven.
- Candidate `acee7bcf13d20bf2…` A/B byte-identical ×2; NaN scan clean
  (full output = 0 bad entries); 15/15 views clip-clean; night band
  89→116, day 118→140; horse_2-solo controls 4/4 byte-IDENTICAL
  (confinement proof).
- Judge verdicts (ZAI fallback, no native vision this cron session,
  native re-judge owed — same class as polish-285..296): NIGHT PASS all
  six items — rose head ear+muzzle silhouette above the bone backline
  now does the identificatory work, "tack does not include a head with
  ears"; bone stays ~1.5× brighter (correct hierarchy); lanterns still
  brightest; painted-wood not glow-orb; zero new defects. Watch-item:
  coral/salmon drift is the dark-surround value floor — do not raise
  further. DAY PASS — natural painted wood, no washout, palette
  harmonious.
- Deploy: dry-run initially tripped its no-overwrite report guard (the
  "runtime failure" on retry was the 'wx' open on the same report path
  — recovered on a fresh report path, DRY_RUN_READY); `--apply`
  PLACED_VERIFIED (1 upload + 8 verbs), 7-key comp bag replayed
  verbatim; idempotent rerun ALREADY_TARGET_VERIFIED (0/0); live census
  pin `store/acee7bcf13d20bf2.glb` @ (-18, 0.0001495, 18) yaw 2.35619
  exact. Served sha == upload sha (identity); served decode keeps
  [0.52,0.10,0.08] on horse_6_0[0] only.
- Evidence: `agents/arthur/reviews/hero-assets/polish-297-carousel-rose/`
  (before/ = live bad22d19 build full 15-view rig + baseline GLB;
  after/ = rose-coat candidate; deploy dry/apply/idem reports +
  verified served bytes; census-baseline.json).
- Next: judge-remaining candidates — (a) crown-hub/valance second-pass
  warm rim (judge-named at polish-290 close, still unjudged), (b) navy
  sky-value runner-up (pre-existing polish-296 nuance; whisper-raise
  candidate — judge fresh first), or (c) re-survey plaza-core on fresh
  evidence.

### polish-303 — mapboard junction gate plaques (ACCEPTED, LIVE)

- Subject: `nx-town-mapboard` (same tuple as polish-301/302, empty comp
  bag). Build source `assets/mkv3-mapboard.ts` (live was 1a73015f5ec4fdf4).
- Defect (ZAI judge on exact live served bytes, 18m reader-side,
  dress-80-calibrated A/B control): the four cardinal spoke-ring
  junctions read as PLAIN EMPTY CROSSROADS — no distinct node at any
  road exit; off-road chips read as scatter ("settlements at
  crossroads" missing — the convergent recipe of both judges since
  polish-301).
- Change (ONE intervention): four gate PLAQUES at the cardinal
  junctions — landmark-brown 0xa06c32 raised relief bars (authored
  0.30 x 0.12, tangential) straddling the ring band, face 0.5mm shy of
  the ink rope crest (-0.064 vs -0.0645) so the torus stays the reader
  extreme (b22 anchor envelope law) and the road reads as passing UNDER
  the gate. Truthful: the village's four real gates (nx-town-gate-n/s/
  e/w, polish-272) stand exactly at the cardinal exits; ring buildings
  correctly sit BETWEEN spokes (36deg family) and were NOT moved.
- Falsified iterations (all caught by gates, never placed): v1 ink
  bars ON the chip plane — z-fight risk decode-caught (inn overlap);
  v2 ink-on-ink INVISIBLE (12px front diff); v3 brass 0xc9a86a too
  close to parchment (judge: 2 of 4 only); v4 chip-plane occlusion
  GEOMETRY-LIMITED behind the 30mm ink rope (132px slivers; the
  polish-52 recessed-glow class in the horizontal plane) — v5 seats
  the plaques at crest height (the board's own pin precedent, reader
  face -0.061 vs plaques -0.064).
- Candidate `02f6cb96442af8cd…` (29 nodes unchanged — gates merge into
  the landmark-brown bucket), deterministic x2 (mtime-verified), NaN
  scan clean (served decode nonFinite=0). Pixel diffs vs baseline:
  back 571px / backnight 128px / backgameplay 128px confined to the
  four junctions; all other views byte-IDENTICAL (0 px).
- Judge verdicts (ZAI fallback, no native vision in this cron session,
  native re-judge owed — same class as polish-285..302): solo back
  read placed 3/4 plaques (E read "missing"); the 2x A/B control
  (dress-80 discipline) confirmed ALL FOUR (12/3/6/9 YES) + no other
  changes anywhere — the solo miss was presentation-driven, not a
  placement defect. Night: plaques render after dark (chip-law
  emissive), subordinate to the hub. Reader asked for a 6-o'clock
  twin + snapping: delivered exactly that, fourfold.
- Placed via the updated dedicated placer `next-place-polish301-mapboard.ts`
  (hash gate advanced 1a73015f -> 02f6cb96): PLACED_VERIFIED, 1 upload +
  2 verbs, comp bag {} preserved, idempotent rerun ALREADY_LIVE_NO_VERBS,
  live census pin `store/02f6cb96442af8cd.glb` @ (2.5,0,9.5) yaw
  -2.9441970937399127 exact.
- Served-bytes proof (struct-104 law, new durable probe
  `agents/arthur/p303-verify-served.ts`): served DRACO 0a0811ac… vs
  previous 1138f60c… — every cardinal gained EXACTLY +24 verts
  (4 x 6 gate-box verts) in the 0.34..0.49 plaque band within +-12
  degrees of cardinal; ink envelope r 1.790 (connectivity contract
  holds); 0 non-finite. Probe development caught TWO of its own bugs
  pre-truth (window too tight 4.5/6.5deg; meaningless spanning>=9
  control on DRACO-merged served bytes) — RED->GREEN discipline.
- Evidence: `reviews/hero-assets/polish-303-mapboard-gates/` (before/ =
  live 1a73015f 12-view rig + baseline.glb; after/ = v1 retained as
  record; after-v3/ = brass rejected; after-v4/ = occlusion rejected;
  after-v5/ = ACCEPTED; ab-back-v5.png = the confirming A/B control;
  backnight probes before/after).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path) — recorded here + ledger
  instead. Not fabricated.
- Next: stringlights night survey (named at polish-300 close), or
  belltower clock face / plaza-core re-survey on fresh evidence.

### polish-304 — stringlights night identity (ACCEPTED, LIVE)

- Subject: `nx-dress-stringlights` (plaza SE, pos [-6, 2.6, 7.5], yaw pi/4,
  EMPTY comp bag; one live instance only — census-verified). Build source
  `assets/mkatmos1.ts` (stringLights block) → `village_stringlights.glb`
  (live was 0c0dee37b07aa7df, 44 nodes, materials: NONE — decoded proof).
- Defect (decoded + pixel-proven): the bulb spheres carried no glTF
  material at all (mat() alone exports COLOR_0-only) — night render
  measured 0 warm px; the prop whose entire identity is light read as a
  dark cable with dead beads. polish-285/263 dead-emissive class, total
  variant.
- Change (ONE edit): `bulbMat.emissive = WARM, intensity 1.0` rides
  glbwrite's glow lane → real emissiveFactor [1, 0.6939, 0.3515] ("glow0")
  on the 9 bulb spheres. No geometry/node/motion change.
- Controls: round-trip revert-rebuild reproduced live 0c0dee37 byte-exact;
  sibling assets (glowjar/torch/fireflies) hash-identical across builds;
  candidate ee40ab96 double-build byte-identical; bounds/nodes unchanged.
- Falsification: night warm 0 → 156 px; day diff 346 px of 691k confined
  to bulbs; A/B judge (ZAI fallback disclosed, native re-judge owed — same
  class as polish-285..303): BEFORE "FAIL as a light prop / dark cable",
  AFTER "12-13 festive glow points along the catenary, not glare orbs, no
  new defects — the fix works". Judge's "~4-6 dark dots" = the authored
  iron bulb caps, correct.
- Placed via NEW dedicated placer `next-place-stringlights.ts` (banner
  chassis): PLACED_VERIFIED (1 upload + 1 verb), comp bag {} preserved,
  idempotent rerun zero verbs, live pin `store/ee40ab96e8f0785e.glb`
  @ (-6, 2.6, 7.5) yaw 0.7853981633974483 exact.
- Served-bytes proof (NEW durable probe `p304-verify-served.ts`,
  struct-104 law): served DRACO 1744d648… keeps `glow0` emissiveFactor
  exact, 9 emissive bulb meshes, bulb locus OK, 0 non-finite.
- Evidence: `reviews/hero-assets/polish-304-stringlights/` (before/ =
  baseline GLB + 10-view rig; after/ = candidate + rig).
- Next: wire-readability candidate (judge note: strand reads as a dotted
  curve at night, wire near-invisible — possible faint sheen, judge fresh
  first), or belltower clock face / plaza-core re-survey on fresh evidence.

### polish-305 — stringlights wire readability (ACCEPTED, LIVE)

- Subject: `nx-dress-stringlights` (same tuple as polish-304, empty comp bag).
  Build source `assets/mkatmos1.ts` (live was store/ee40ab96e8f0785e).
- Defect (queue-head named at polish-304 close, judged fresh this tick on
  exact live bytes + decode): after dark the strand read as floating glow
  dots — the 24 wire segments (and caps/hooks) exported COLOR_0-only, no
  glTF material; night wire ≈ ground ±20 RGB. Judge: "connected only by
  inference… the cable is doing almost none of the work". Adjacent note
  (hooks sub-pixel at 18m) recorded below, not treated.
- Change (ONE edit): module-level `wireMat` (0x44402e iron + emissive WARM
  @ 0.15) rides glbwrite's glow lane on the 24 strand segments ONLY —
  caps/hooks stay honest dark iron, bulbs stay glow1 [1,.6939,.3515]
  (6.7x brighter). Measured round: v1 @ 0.30 rejected (night wire ~150 vs
  bulbs' ~210 — glow-tube risk; day +66 over the judge's 25-40 ask);
  v2 @ 0.15 accepted: night wire mean 74 vs ground 46 (faint continuous
  line, ~3x below bulbs), day delta p50 +37.
- Candidate `246af38663aa698150f930a882a76717da5785eccbdb9b1e3880880818bea714`,
  deterministic x2. Round-trip control: revert-rebuild reproduced live
  ee40ab96 byte-exact; glowjar/torch/fireflies hash-identical across builds;
  `_s` sibling advanced as intended (shared builder). NaN scan 0/7848;
  nodes 44 unchanged.
- Judge verdicts (ZAI fallback disclosed — no native vision tool loadable in
  this cron session, native re-judge owed, polish-285..304 class): night A/B
  PASS — continuous garland read, faint sheen on a cable (not an artificial
  glow line), bulbs decisively brightest, zero new defects; day A/B PASS —
  natural sunlit cable, no self-lit read, no artifacts.
- Placed via updated `next-place-stringlights.ts` (hash gate
  ee40ab96 -> 246af386): PLACED_VERIFIED, 1 upload + 1 verb, comp bag {}
  preserved, idempotent rerun zero verbs, live pin
  `store/246af38663aa6981.glb` @ (-6, 2.6, 7.5) yaw 0.7853981633974483 exact.
- Served-bytes proof (NEW durable probe `p305-verify-served.ts`,
  struct-104 law): served DRACO keeps glow0 [0.15,0.1041,0.0527] and glow1
  [1,0.6939,0.3515] EXACT, 9 bulb + 24 wire meshes, 0 non-finite.
- Standing gate re-run after mutation: ALL PASS exit 0 (sibling struct-250
  landed mid-tick — accepted by the gate, normal interlane life).
- Evidence: `reviews/hero-assets/polish-305-stringlights-wire/` (before/ =
  live baseline GLB + 10-view rig; after/ = v1 @ .30 retained as record;
  after-v2/ = ACCEPTED; probes: p305-probe-mats, p305-nightprobe,
  p305-abdiff, p305-wirevals, p305-nan).
- Judge-named open note (below threshold this tick): end hooks sub-pixel at
  18m — strand terminates "suspended from nothing"; a candidate would be
  tiny anchor plates, judge fresh first.
- Next: belltower clock face survey (named at polish-303 close), or
  plaza-core re-survey on fresh evidence.

### polish-306 — belltower crown (ACCEPTED, LIVE)

- Subject: `nx-town-belltower` (civic ring, pos [6.5,0,6.5], yaw
  −2.356194490192345, ladder comp — improve-17 lineage: live baseline was
  the improve-17 build 2419fbc5, NOT polish-263's 30407b95; improve-17
  rebuilt the ladder/rope/lantern 2026-09-06, survey-75 cleared its
  native debt). Build source `assets/mkv3-landmarks.ts` (belltower block)
  → `village_belltower3.glb`.
- Survey: named "clock face" candidate FALSIFIED at source (no clock
  exists anywhere in the build — adding one would be invented ornament,
  loop law). Fresh judge on exact live bytes found the real #1 defect:
  the apex finial was a bare 0.1×0.4 brass stick — unfinished-crown
  class, 6th village instance (carousel-258, tower-265, gates-272,
  banner-273, approach lamps-280). At 18m: "flat-topped stick chopped
  off... reads as antenna mast/placeholder", probe-confirmed near-neutral
  olive (91,90,55) R/B 1.0 vs cap — camouflaged, no crown form resolves.
- Judge's secondary notes recorded as queue (NOT this tick, one edit per
  wakeup): bell reads near-black "black lump" at 18m (value candidate);
  lamp mount sub-pixel (improve-17 housing exists — presentation nuance);
  rope hairline 1px; ladder-deck landing ambiguous at 18m.
- Change (ONE edit, belltower block): brass collar 0.24×0.10 seated on
  the cap apex (y 7.2..7.3) + tapered gold spire r 0.16, h 0.6
  (y 7.3..7.9) — the accepted village crown language (polish-265/272/273
  recipe) at belltower scale. Unlit by design: material truth (bell
  brass, gate brass unlit), the tower's night signal remains the
  polish-263 belfry lamp. Polish-272 overhang law: nothing above the
  spire. Footprint unchanged 3.4².
- Candidate `f9ceea6e82b481e5…` deterministic ×2 (mtime-verified);
  siblings byte-identical to live pins (inn 6e6ff2d0, windmill 369c5724,
  legacy carousel3 0843da4e). Nodes 12→13 (finial merged away, +2
  material buckets bt3_6/bt3_7); KEEP anchors bell/bell_0..2/lamp
  intact; NaN 0; ladder comp box (y ≤ 5.15) untouched by construction;
  rider b5 (local y ≤ 2.07) far below the crown band.
- Falsification: gameplay probe — old stick (91,90,55) vs new spire
  (112,81,50) R/B 2.24 warm gold-brown, sunlit maxL 181 vs sky ~215:
  real silhouette punctuation. Judge AFTER: crown reads finished
  collar+taper, antenna gone, zero regressions (no float/clip/malformed/
  proportion issues), "ship-safe geometrically". Disclosed nuance:
  brass reads "tonally shy" at 18m — recorded as NEXT candidate (value
  bump), same family as polish-265's judge note, not a second edit.
- Placed via NEW dedicated placer `next-place-polish306-belltower.ts`
  (improve-17 chassis adapted: hash gate 2419fbc5→f9ceea6e, bbox height
  gate 7.6→7.9, ladder comp captured-before-spawn and replayed
  verbatim, rider b5 verified standing post-place): PLACED_VERIFIED,
  1 upload + 3 verbs, live pin `store/f9ceea6e82b481e5.glb` @ exact
  tuple, census bbox [3.4, 7.9, 3.4], idempotent rerun
  ALREADY_LIVE_NO_VERBS (0 verbs).
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p306-verify-served.ts`): served DRACO 0544ba85… keeps
  13 nodes / 12 meshes / all five KEEP anchors; census bbox 7.9 live.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD fc779dcf
  (dress-184 landed mid-tick — absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-306-belltower-crown/` (before/ =
  live 2419fbc5 baseline GLB + 10-view rig; after/ = candidate + rig).
  Probes: /tmp/p306-decode.ts, spire-probe, pixdiff (one-shot).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path — same as polish-285..305);
  recorded here + ledger instead. Not fabricated.
- Next ranked: (a) belltower spire brass value bump (judge nuance,
  family precedent), (b) bell reads black-lump at 18m (brass value /
  warm emissive candidate — needs falsification vs current pixels
  first), or (c) plaza-core re-survey on fresh evidence.

### polish-307 — belltower bell-gold re-author (ACCEPTED, LIVE)

- Subject: `nx-town-belltower` (civic ring, same tuple as polish-306; ladder
  comp). Build source `assets/mkv3-landmarks.ts` (belltower block) →
  `village_belltower3.glb` (live was f9ceea6e, polish-306's crown build).
- Defect (polish-306's judge-named queue item (b), confirmed by fresh
  pixels this tick): the bell — the tower's namesake — read as a dark
  near-neutral olive mass at 18m: gameplay band (118,113,53), R≈G, no hue
  split from the blue-grey sky-through (125,130,133). "Black lump" class.
- Root cause (decode-corrected): the bell's `mat(0xdada70, …, metal .3/.5)`
  exports COLOR_0-only (legacy flat-color lane, NO glTF material — village
  convention); the metalness parameters never reach the wire. The authored
  COLOR_0 itself was the wrong color: yellow-green 0xdada70 reads olive.
- Change (ONE edit, bell crown+body only): COLOR_0 0xdada70 → bell-gold
  0xd9ac52 (mat(0xd9ac52, 0.45, 0.15), polish-289 carousel-brass recipe;
  brighter/warmer than the polish-306 spire's 0xb98245 so the bell leads
  the belfry). Clapper untouched. Unlit (material truth; belfry lamp stays
  the night signal — night band stays (21,16,12)).
- Candidate `4a84e77127d736540b68cea4b5df6f5a5b134d59f6a5a5cc163699dd8083a0b1`
  deterministic ×2; siblings byte-identical (carousel3 0843da4e, inn
  6e6ff2d0, windmill 369c5724). Nodes 14→13 (crown+body merged — same
  bucket now), KEEP group `bell` + `bell_0`/`bell_1` + `lamp` intact.
- Rig-law finding recorded: the standard 10-view rig showed ZERO changed
  pixels (bell occluded/sub-pixel at its framing); the dedicated belfry
  rig (p307-belfry-rig.ts, cameras at bell height + a gameplay-distance
  belfry-aimed view) measured the change: 815 px at 18m gpAim, 13k px
  belfry view. Probe-honesty pass: first row-model was WRONG (probed the
  wrong rows); the gpAim diff located the true bell band before judging.
- Falsification (ZAI fallback disclosed — no native vision tool loadable
  in this cron session, polish-285..306 class, native re-judge owed):
  A/B judge "AFTER clearly better… Ship it" — warm bronze against BOTH
  sky (value) and shadow (value+hue), sole warm element = focal point,
  natural not glowing, zero regressions. Measured: (118,113,53) →
  (117,84,40), R/B 2.2→2.9.
- Placed via NEW dedicated placer `next-place-polish307-belltower.ts`
  (polish-306 chassis, pins f9ceea6e→4a84e771): PLACED_VERIFIED, 1 upload
  + 3 verbs (remove/spawn/comp), ladder comp replayed verbatim, rider b5
  standing, idempotent rerun ALREADY_LIVE_NO_VERBS (0 verbs), live census
  pin `store/4a84e77127d73654.glb` @ (6.5,0,6.5) yaw −2.35619 exact.
- Served-bytes proof (struct-104 law, durable probe
  `agents/arthur/p307-verify-served.ts`): served DRACO dd5bd6a2… census
  12/11, anchors bell/bell_0/bell_1/lamp, bell_0 COLOR_0 123/123 verts
  bell-gold (linear (177,105,22)), 0 olive, 0 non-finite. Probe
  development caught its own bugs (COLOR_0 enum → COLOR; *255 vs
  byte-scale; sRGB-vs-linear target) before truth — RED→GREEN discipline.
- Evidence: `reviews/hero-assets/polish-307-belltower-bell/` (before/ =
  live f9ceea6e full 10-view rig + baseline.glb; after/ = candidate rig;
  belfry-before/ + belfry-after/ = dedicated belfry rig; gpaim crops).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree) — recorded here + ledger instead. Not fabricated.
- Next ranked: (a) belltower spire brass value bump (polish-306 judge
  nuance, still open), (b) rose-horse angular-offset motif geometry
  (artwalk coordination), or (c) plaza-core re-survey on fresh evidence.

### polish-308 — belltower crown bell-gold (ACCEPTED, LIVE)

- Subject: `nx-town-belltower` (same tuple as polish-306/307; ladder comp).
  Build source `assets/mkv3-landmarks.ts` (belltower block) ->
  `village_belltower3.glb` (live was 4a84e771, polish-307's bell-gold build).
- Defect (queue head from polish-307 close, confirmed fresh this tick by
  pixel probe + judge on exact live bytes): the crown (finial collar +
  spire) read tonally shy at 18m — spire proper (96,69,39) lum 73 vs sky
  212; ZAI judge: "reads as dark bronze or neutral brown, not distinctly
  brass/gold... the bell sells the golden material language and the spire
  doesn't match it."
- Change (ONE edit): crown re-authored on ONE material mat(0xd9ac52,
  0.45, 0.15) — the polish-307 bell-gold recipe proven at 18m on this
  same tower. One tower, one metal; the sunlit apex now carries the gold
  read. Still unlit (belfry lamp stays the night signal).
- Candidate `3e4f470b38d94bb7d18097ac908fb5db4943c54f863f47b89afc0d8ee6baad4f`,
  deterministic x2 (mtime-verified). Nodes 12->11 / meshes 11->10 (old
  spire bucket merged into the bell-gold bucket — mergekit material-key
  law, one material = one bucket). Siblings byte-identical (carousel3
  0843da4e, inn 6e6ff2d0, windmill 369c5724). Decode: crown 67 verts
  COLOR_0 (177,105,22) bell-gold in ONE bucket (old: collar (90,92,17) +
  spire (124,57,15) split); accessor NaN 0.
- Falsification: A/B pixel diff — gameplay 280 px / night 144 px / top
  5657 px ALL confined to the crown band; front/back/left/right +
  belfryClose byte-IDENTICAL (spire sub-pixel at those framings,
  polish-307 rig-law class). Spire band lum 73->90.6 (+24%), R/B
  2.45->2.66. Judge AFTER (ZAI fallback disclosed, native re-judge owed —
  same class as polish-285..307): "now reads as brass/gold metal, no dark
  bronze or wood character left"; one-metal family with the bell ("as-is,
  it passes" — minor saturation gap recorded as the expected
  lighting-neighborhood nuance, bell beside warm lamp vs spire against
  cool sky); zero geometry/proportion regressions; "deliberate design
  punctuation." Night PASS — single belfry lamp stays the sole signal,
  spire dark, no new glow.
- Placed via NEW dedicated placer `next-place-polish308-belltower.ts`
  (polish-307 chassis, pins 4a84e771->3e4f470b): PLACED_VERIFIED, 1
  upload + 3 verbs (remove/spawn/comp), ladder comp replayed verbatim,
  rider b5 standing, bbox 7.9 exact, idempotent rerun
  ALREADY_LIVE_NO_VERBS (0 verbs), live census pin
  `store/3e4f470b38d94bb7.glb` @ (6.5,0,6.5) yaw -2.35619 exact.
- Served-bytes proof (struct-104 law, durable probe
  `agents/arthur/p308-verify-served.ts`): served DRACO 7b707aa6… crown
  66/66 verts bell-gold (y 7.2..7.9), bell_0 control 123/123 untouched,
  anchors bell/bell_0/bell_1/lamp, 0 non-finite. Probe self-caught its
  own y-cut selection bug pre-truth (picked the cap bucket) — RED->GREEN.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD c2f808a7
  (dress-187 landed mid-tick — absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-308-belltower-spire/` (before/ =
  live 4a84e771 baseline GLB + 10-view rig + belfry-before/ 6-view;
  after/ = candidate + rig + belfry-after/ 6-view; probes /tmp one-shot:
  p308-probe-spire, p308-abdiff, p308-crown-verts, p308-decode).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path — same as polish-285..307);
  recorded here + ledger instead. Not fabricated.
- Next ranked: (a) rose-horse angular-offset motif geometry (artwalk
  coordination per the standing language directive), or (b) plaza-core
  re-survey on fresh evidence.

### polish-309 — stringlights festoon poles (ACCEPTED, LIVE)

- Subject: `nx-dress-stringlights` (same tuple as polish-304/305, empty comp
  bag). Build source `assets/mkatmos1.ts` (live was store/246af38663aa6981).
- Defect (queue-head from polish-305 close, judge-fresh this tick on exact
  live bytes + live-context census): the strand's end hooks are 0.05m cubes —
  sub-pixel at 18m; both endpoints hung at 2.6m over OPEN GROUND (W end
  0.73m from the 1.35m giftshelf, E end's nearest tall structure the 2.15m
  market at 2.4m). Judge verdict: both ends "terminate in mid-air as 2-3px
  dark specks… suspended from nothing"; the lit bulbs appear to float.
- Change (ONE edit): real festoon poles at both strand ends — 0.07m iron
  post spanning local y -2.6..0 (ground-to-strand, terrain-verified flat
  feet at world (-8.15,9.65)/(-3.85,5.35)) + 0.24m stone foot; post material
  = wireMat so night reads a faint warm support line (polish-305 sheen
  lineage, scope widened to poles). Torch/improve-15 fixture grammar at
  festoon scale.
- Build bug caught by the NEW served-bytes probe AFTER v1 placed: box()
  takes a color NUMBER; v1 passed the wireMat OBJECT — exported pole nodes
  carried NO glTF material (dark silhouettes only, sheen dead). v2 = direct
  Mesh with wireMat. v1 (942797df) briefly live, superseded same tick.
- Candidate `8788b5ff3f132b896eea5f0e670f176663183ddadf0e7abda91f823fcb2acb64`
  deterministic x2; round-trip revert-rebuild reproduced live 246af386
  byte-exact; siblings glowjar/torch/fireflies hash-identical; `_s` advanced
  as intended (shared builder). Nodes 44->48, bounds y-span 0.59->2.625.
- Falsification: judge night PASS (anchored at post tops, faint warm
  verticals readable, bulbs decisively brightest, zero defects — v1 judge
  "phantom glint" flag pixel-falsified: 0 warm px in the flagged zone;
  v2 "dashed ground line" flag pixel-falsified: identical RGB to baseline's
  pre-existing wire shadow). Day PASS (believable supports, feet grounded,
  no new defects).
- Placed via updated `next-place-stringlights.ts`: PLACED_VERIFIED (v1 then
  v2), comp bag {} preserved, idempotent rerun zero verbs, live pin
  `store/8788b5ff3f132b89.glb` @ (-6,2.6,7.5) yaw 0.7853981633974483 exact,
  census bbox grown to 6.32 x 2.625 x 0.27.
- Served-bytes proof (NEW durable probe `p309-verify-served.ts`, struct-104
  law; probe self-caught its own mesh-local/translation frame bug RED->GREEN):
  served DRACO 8f6d2c0b… keeps glow0 [0.15,0.1041,0.0527] on 24 wire + 2
  POLE meshes (node-space y -2.6..0.02, |x| 3.04), glow1 on 9 bulbs, 2
  polefoot nodes, 0 non-finite, 48 served nodes. P309_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEADs c2f808a7 ->
  bfc26c6b (dress-187/188, struct-249/250/255/256 landed mid-tick —
  absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-309-stringlights-hooks/` (before/ =
  live 246af386 baseline rig; after/ = v2 accepted rig; v1 GLB not retained
  — superseded in-tick, record in ledger).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path — same as polish-285..308);
  recorded here + ledger instead. Not fabricated.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) the
  belltower polish-306 judge-named sub-threshold notes (lamp mount
  sub-pixel nuance, rope hairline), judge fresh first.

### polish-310 — belltower rope thickness (ACCEPTED, LIVE)

- Subject: `nx-town-belltower` (same tuple as polish-306..308; ladder comp).
  Build source `assets/mkv3-landmarks.ts` (belltower block) ->
  `village_belltower3.glb` (live was 3e4f470b, polish-308's crown build).
- Defect (the polish-306 judge-named sub-threshold notes, re-judged fresh
  this tick from current pixels, belfry rig + 18m gpAim on exact live
  bytes): the bell rope read as a ~1px line — "a rendering glitch rather
  than an interactive object", "zero thickness headroom" at close range,
  will alias in motion. Lamp mount judged sub-threshold-but-second (housing
  exists; reads "touching the post"); ladder landing acceptable.
- Change (ONE family edit): rope 0.018->0.030, knot 0.035->0.055, tail
  0.014->0.024 (6 segments) — same hemp material/positions; clears the
  brass guide-ring bore (r 0.046) and brace planes by construction.
- Candidate `b0b1e2766e145c02…` deterministic x2; siblings byte-identical
  (inn/windmill/carousel3). Decode: 11/10 nodes/meshes unchanged, anchors
  bell/bell_0/bell_1/lamp, nonFinite=0 (POSITION set), rope bucket
  98->122 verts in exactly one accessor. Pixel diff confined to the rope
  band (18m strip 1px -> ~3px core / 7px AA bbox).
- Judge verdicts (ZAI fallback disclosed — no native vision tool loadable
  in this cron session, native re-judge owed, polish-285..309 class):
  A/B PASS — before "reads as a glitch… floating dot + scratch", after
  "reads as a bell pull-rope… single readable affordance"; thickness
  "natural, upper comfortable bound, do not increase further"; systematic
  region sweep = zero collateral changes. Two pre-existing notes recorded
  not treated: bell/rope off-centerline (authored drop-to-cleat, loop #75),
  straight hang vs slight bow (optional future nuance).
- Placed via NEW `next-place-polish310-belltower.ts` (polish-308 chassis,
  pins 3e4f470b->b0b1e276): PLACED_VERIFIED, 1 upload + 3 verbs, ladder
  comp replayed verbatim, rider b5 standing, bbox 7.9 exact, idempotent
  rerun ALREADY_LIVE_NO_VERBS (0 verbs), live census pin
  `store/b0b1e2766e145c02.glb` @ (6.5,0,6.5) yaw -2.35619 exact.
- Served-bytes proof (struct-104 law, durable `p310-verify-served.ts`;
  probe self-caught a DRACO-dedup vert-count miscalibration RED->GREEN,
  thickness gates unchanged): served DRACO 6ee9089b… ropeMaxRad 0.0301
  with 13 verts >= 0.025 (impossible at baseline r 0.018), knot 0.0524
  with 14 >= 0.045, anchors + maxY 7.9 + nonFinite 0. P310_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEADs 25c44549 ->
  0ec449c7 (fauna-46, struct-257 landed mid-tick — absorbed, normal
  interlane life).
- Evidence: `reviews/hero-assets/polish-310-belltower-notes/` (before/ =
  live 3e4f470b baseline GLB + belfry rig 6 views; after/ = candidate).
  Probes: `p310-abdiff.ts`, `p310-decode.ts`.
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path — same as polish-285..309);
  recorded here + ledger instead. Not fabricated.
- Next ranked: (a) lamp-mount bracket silhouette (judge-named second,
  close-range class — tiny arm+strap geometry, judge fresh first), or
  (b) plaza-core re-survey on fresh evidence.

### polish-311 — belltower lamp cage self-lit (ACCEPTED, LIVE)

- Subject: `nx-town-belltower` (same tuple as polish-306..310; ladder
  comp). Build source `assets/mkv3-landmarks.ts` (belltower block) ->
  `village_belltower3.glb` (live was b0b1e276, polish-310's rope build).
- Queue head (lamp-mount bracket silhouette) re-judged fresh on exact live
  bytes with a NEW dedicated lamp rig (`p311-lamp-rig.ts`: lampFace /
  lampDiag face-on to the housing corner, lampClose/lampNight diagonal,
  belfry + 18m gpAim day+night). Findings: the improve-17 housing ALREADY
  reads as deliberate hardware at close range (hood resolves as a pyramid,
  arm bridges housing-to-post with a visible sky gap; corner posts at
  Nyquist = inferable). The two diagonal views were post-occlusion RIG
  ARTIFACTS (camera on the post sightline) — discarded as evidence. At 18m
  day the housing is framing-limited (struct-13 class; placement anchors).
  The real evidenced defect: after dark the bead glows ALONE — the housing
  is COLOR_0-only legacy iron (zero night pixels), so the tower's single
  night signal reads as a "lit pixel"/possible floating ember; both the
  day and night judges converged on attached-by-placement-only.
- Change (ONE intervention, polish-305 wire-sheen lineage — the support
  hardware of a light prop reads faintly warm at night): housing iron
  emissive 0xffc98a (the bead's own hue). SIX measured rounds: 0.18 (day
  shade = lit-timber band, hood washed) → hood-split 0.06 (still mid-brown:
  the hood backs onto SHADOWED fascia — polish-287's day-invisibility law
  does NOT hold in permanent shade, first observed here) → 0.035 → 0.05 →
  0.04 (judge rule "every iron sample >=15 under gable shadow 59" fails by
  2 pts on the arm) → ACCEPTED UNIFORM 0.02: day arm 26→47 / post 28→44 /
  hood 32→42 (uniform kills the falloff-inversion the last judge flagged);
  night cage ≈39 vs cavity 21 = the 1-2px warm whisper the night judge
  asked for. Bead [0.9,0.5257,0.2287] untouched.
- **mergekit law found (v2 staging catch)**: the bucket key
  `color:roughness:metalness:tex` has NO emissive term — same-base
  materials with different emissiveIntensity silently MERGE (v2's
  hood-split rebuilt byte-identical to v1; the 0.06 never reached the
  file). Cured by KEEP-renaming the hood `lamp_hood` (own mesh, own
  signature). Kit-level fix candidate (widen the key with the emissive
  factor) needs a dedicated rebuild-all tick; mergekit.ts carries foreign
  uncommitted mods — not touched mid-lane.
- Candidate `6359999041251ad9…` deterministic ×2; 12 nodes / 11 meshes
  (+lamp_hood anchor); siblings byte-identical (inn/windmill/carousel3);
  nonFinite 0; diffs confined (18m spot 66-68 px, lampFace housing band
  3361 px, maxDelta 39). v1 (ccc98366) / after-v1..v4 rounds retained as
  record in the evidence dir.
- Judge verdicts (ZAI fallback disclosed — no native vision tool loadable
  in this cron session, polish-285..310 class, native re-judge owed):
  18m night IMPROVED partial-pass (glow now has a capped shape — form, not
  bare pixel; restraint/hierarchy excellent; zero defects; hardware
  framing-limited, struct-13 class); day rounds drove the value down to
  the judges' own quantitative rule (dropper probe `p311-pixels.ts`
  settled two inflated judge hex reads — probes outrank prose, polish-289
  law). Accepted on: quantitative gates green + hood per-judge "hold
  40-46" + night gain + zero regressions across every round.
- Placed via NEW dedicated placer `next-place-polish311-belltower.ts`
  (polish-310 chassis, pins b0b1e276→63599990): PLACED_VERIFIED, 1 upload
  + 3 verbs, ladder comp replayed verbatim, rider b5 standing, bbox 7.9
  exact, idempotent rerun ALREADY_LIVE_NO_VERBS (0 verbs), live census pin
  `store/6359999041251ad9.glb` @ (6.5,0,6.5) yaw -2.35619 exact.
- Served-bytes proof (struct-104 law, durable `p311-verify-served.ts`;
  probe self-caught a mesh-local/node-translation frame bug RED->GREEN):
  served DRACO 351e4f99… 12/11 census, anchors bell/bell_0/bell_1/lamp/
  lamp_hood, BOTH emissives exact (cage [0.02,0.0117,0.0051], bead
  [0.9,0.5257,0.2287]), lamp_hood centroid (0.7539, 5.6978, 0.7539),
  0 non-finite. P311_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 (sibling struct-259 landed
  mid-tick at b0526793 — absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-311-belltower-lampmount/`
  (before/ = live b0b1e276 baseline GLB + 7-view rig; after/ = accepted v6;
  after-v1..v4 = measured rounds; probes: p311-lamp-rig, p311-probe,
  p311-pixels, p311-verify-served).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path — same as polish-285..310);
  recorded here + ledger instead. Not fabricated.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b)
  rose-horse angular-offset motif geometry (artwalk coordination).

### polish-312 — core streetlamps lantern heads + iron sheen (ACCEPTED, LIVE)

- Subject: `nx-town-streetlamps` (ground-layer network at origin, pos
  [0,0,0], yaw pi, EMPTY comp bag — census-fresh this tick). Build source
  `assets/mkv3-lamp33.ts` -> `village_streetlamps3.glb` (live was
  e815a897c7d73373, tex-33 pin; 8 groups, 40 loose meshes, zero merging).
- Defect (judged fresh from current pixels on exact live bytes, night +
  day, ZAI fallback disclosed): the lantern head was a box-with-lid —
  0.13m cube core under a bare 0.2x0.05 plate, finial floating 3cm over
  it — judged "crude/placeholder, stick with LED", head ~10% of height
  (utility-pole read). At night the iron vanished entirely: posts ~1px
  hairlines, cap/finial indistinguishable from sky, distant lamps read
  as floating glow dots (judge: "glow cores effectively float").
- Change (ONE intervention): real lantern head per the village crown
  language — iron collar at the post top, glass core grown to 0.15x0.26
  (a 2.6x taller light), overhanging eave plate 0.27 square wider than
  the core (the readability step), 4-sided pyramid roof, finial re-based
  on the roof apex (polish-272 overhang law). Head 0.38 -> 0.66m, total
  height 2.62 -> 2.95m. Plus polish-305's proven iron night-sheen
  (0xffc98a @ 0.15) on the shared ironTex so posts/roofs support the
  glow instead of floating over it. Lamp groups KEEP-named (lampsl0..7)
  so per-lamp statics fold per-material: 24 nodes / 16 meshes, FEWER
  draws than the baseline's 40 loose meshes.
- Candidate `a7b05aefe1e971e8e0b928635a2388b5340c23f2dd41269779ce47bab073a531`
  deterministic x2 (mtime-verified); before-bytes captured FIRST (baseline
  GLB hash-matches live pin exactly); decode: iron emissive [0.15, 0.0876,
  0.0381] WITH baseColorTexture, glow1 cores untouched [0.9, 0.5257,
  0.2287], NaN 0/5760, verts on the r10 locus, headTop 2.9475.
- Falsification: night + gameplay + front pixel diffs real (3.11% / 3.11% /
  0.92%). Judge night PASS on all four cure-targets (cores read supported
  at near AND far, sheen restrained matte warm metal not glow-tube, roof
  pyramid reads, hierarchy cores >> iron, zero new defects); day PASS
  (classic lantern silhouette at near + distance via the eave T-step,
  head ~18-20% believable ratio, iron stays natural sunlit metal, zero
  defects). Judge nits recorded not treated: uniform-post read (source-
  false — post IS tapered 0.05->0.08; projection scale), glass reads lit
  in day (authored always-on lamp, village-wide convention).
- Placed via NEW dedicated placer `next-place-polish312-streetlamps.ts`
  (stringlights chassis): PLACED_VERIFIED, 1 upload + 1 verb, comp bag {}
  preserved, idempotent rerun zero verbs, live census pin
  `store/a7b05aefe1e971e8.glb` @ (0,0,0) yaw 3.14159 exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p312-verify-served.ts`; probe self-caught its own locus
  band bug RED->GREEN — band [9.0,9.8] flagged all 1520 verts because
  lamps stand at r10, corrected to [9.5,10.5]): served DRACO keeps iron
  sheen + texture + glow1 exact, 8/8 lamp groups, headTop 2.9475, 0
  non-finite. P312_SERVED_PASS.
- Cross-lane pin refresh: night lane's `review-night-core.ts` streetlamps
  pin advanced e815a897 -> a7b05aef in this commit (polish-267 precedent;
  the rig hard-dies on local-file drift). Gate re-run after mutation:
  ALL PASS exit 0 at sibling HEAD c8345744 (sweep-350 absorbed mid-tick).
- commons' av-streetlamps (verify-repairs tex-33 pin) untouched — different
  world; the old bytes persist in the content-addressed store.
- Evidence: `reviews/hero-assets/polish-312-streetlamps/` (before/ =
  baseline GLB + 10-view rig; after/ = candidate + rig).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path — same as polish-285..311);
  recorded here + ledger instead. Not fabricated.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b)
  wellhead/waystone night reads (sibling-owned subjects — route defects
  to owners), or (c) belltower remaining sub-threshold notes, judge
  fresh first.

### polish-313 — well water (ACCEPTED, LIVE)

- Subject: `nx-dress-well` (E approach lane, pos [30,0,-4.5], yaw 0, EMPTY comp
  bag — census-fresh). Build source `assets/mkvillage-civic.ts` (well block) →
  `village_well.glb` (live was 35f17cf4f6a6db9f, Aug-31 build; on-disk sha ==
  live lib exact).
- Defect (ZAI judge ×3 on exact live bytes, no native vision this cron session
  — same class as polish-285..312, native re-judge owed): the well had NO water
  surface — the ring is an open cylinder and the mouth read as a solid mass /
  ambiguous black void (gameplay: "passes as an icon; fails as a well"; aerial:
  "nothing identifiable inside the ring"; night: "functionally invisible").
  The polish-271/281 dry-water class, total variant — the last waterless water
  feature in the core (fountain/cistern/trough lineage).
- Change (ONE intervention, three measured sizing rounds v1 r0.95 / v2 r0.70 /
  v3 r0.62): palette-water disc 0x506a78 + faint same-hue emissive 0x2e4a58 @
  0.55 (the exact fountain/cistern recipe), y 0.33 (0.42 below the rim crest).
  v1 rejected: posts at |x|0.8 pierced the full-width disc ("planted in
  water"); v2 rejected: zero-clearance post bases + hairline far reveal;
  v3 clean — posts clear full-length, readable shelf reveal, no spill/clip.
- Candidate `c02d594e0873f4e4fafbcdf1947721c22de4704e160f0e36aba174e2980cf77a`
  deterministic ×2 (+ whole-14-set rebuild ×2 = SET_DETERMINISTIC; banner
  32e7bcb live pin byte-identical). Nodes 21→22 (water node), materials +glow1.
- Falsification: rimclose day "reads as a working well at a glance" (posts
  clear, shelf reveal, still-water read); aerial "water resolved — the blue
  disc does the most work selling the object as a well", no blue outside the
  ring; night mouth reads blue-dominant at rim vantage (rimclose-night
  avgRGB (33,55,67) vs void baseline). Diffs confined to the mouth region
  (aerial ~5.4k px; night 18m 0 px = rim-occlusion geometry, polish-284
  class — players read well water at the rim, proved by the dedicated
  close rig `p313-close-rig.ts`).
- Placed via NEW dedicated placer `next-place-polish313-well.ts`
  (stringlights chassis): PLACED_VERIFIED, 1 upload + 1 verb, comp bag {}
  preserved, idempotent rerun zero verbs, live pin
  `store/c02d594e0873f4e4.glb` @ [30,0,-4.5] yaw 0 exact.
- Served-bytes proof (struct-104 law, durable `p313-verify-served.ts`; probe
  self-caught the mesh-local vs node-translation frame bug RED→GREEN, p311
  class): served DRACO c334653d… keeps well_water 62 verts, radius 0.62
  exact, node y 0.33, emissive [0.015,0.0377,0.0537] exact, 0 non-finite.
  P313_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 (sibling fauna-51 landed
  mid-tick at 6e64a340 — absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-313-well/` (before/ = live 35f17cf4
  10-view rig + close rig + baseline.glb; after/ = candidate + close rig;
  rejected v1/v2 sizes in the source comment + this record).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree at the Excalibur path) — recorded here + ledger instead.
- Next ranked: (a) well single-dark-mass value separation (aerial judge
  secondary note: posts merge with ring at distance — a value/material
  candidate), (b) well night identity beyond the mouth glint (lantern hook
  candidate, judge-suggested), or (c) plaza-core re-survey on fresh evidence.

### polish-314 — well wood frame (ACCEPTED, LIVE)

- Subject: `nx-dress-well` (same tuple as polish-313, empty comp bag).
  Build source `assets/mkvillage-civic.ts` (well block) → `village_well.glb`
  (live was c02d594e, polish-313's water build; on-disk sha == live exact).
- Defect (queue head (a) from polish-313 close, judged fresh this tick on
  exact live bytes, ZAI fallback disclosed — polish-285..313 class, native
  re-judge owed): the frame (posts+crossbar) wore C.DARK lum 64 against the
  ring's C.STONE lum 80 — aerial judge: "frame dissolves into a shadow
  mass… cannot count two posts", frame-to-ring boundary "the single largest
  unreadable region"; 2.5 parts not 3.
- Change (ONE edit): canon wood ACCENTS.WOOD 0xa09832 (lum 143) on the
  three frame boxes (posts + crossbar) — material truth, village wood canon
  (loop #86 census). Ring/roof/water/bucket untouched.
- Candidate `38ab2eef4aee610697cb0ac571f9928b806bcc450e115e78c487addab591f113`
  deterministic ×2 (mtime-verified); whole-14-set rebuild: banner sibling
  byte-identical to its live pin (edit provably confined to the well).
  Nodes 22 / draws 21 unchanged. Pixel diffs confined to the post bands
  (aerial 1306 px x[528..552], front 1357, right 1519, gameplay 307;
  night-18m/top/back/left 0 px — unlit wood, no new glow).
- Falsification: aerial after — "no longer a fused mass… three parts",
  lit post clean against water + ring, palette natural ("brightness is not
  the problem"); 18m gameplay — "reads as three parts — not a single dark
  mass", two posts visible, zero new defects. Shaded-side post = the rig's
  static sun (both posts share ONE material; in-world the rated-sky sun
  moves) — recorded, not treated.
- Placed via NEW dedicated placer `next-place-polish314-well.ts` (p313
  chassis, hash gate c02d594e→38ab2eef): PLACED_VERIFIED, 1 upload + 1
  verb, comp bag {} preserved, idempotent rerun "already live — no verbs",
  live pin `store/38ab2eef4aee6106.glb` @ [30,0,-4.5] yaw 0 exact.
- Served-bytes proof (struct-104 law, durable `p314-verify-served.ts`):
  served DRACO 84947bf8… keeps wood COLOR_0 24/24 verts on all three frame
  meshes, zero dark remnants, node translations exact, polish-313 water
  disc + emissive intact, 0 non-finite. P314_SERVED_PASS. **Probe law
  found**: the served re-encode assigns generic attribute ids per-mesh
  non-deterministically and GetAttributeId can disagree with GetAttribute
  (normals misread as colors on one mesh) — classify candidate lanes by
  value range (colors ≫ 1, normals = units), never by semantic id alone.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD dd9d5a28
  (dress-197 hold absorbed mid-tick and pre-classified this placement as
  polish-314 in-flight — normal interlane life).
- Evidence: `reviews/hero-assets/polish-314-well-frame/` (before/ = live
  c02d594e 13-view rig + baseline.glb; after/ = candidate).
- Next ranked: (a) well night identity beyond the mouth glint (lantern
  hook candidate, judge-suggested at polish-313 close), (b) plaza-core
  re-survey on fresh evidence.

### polish-315 — well night lantern (ACCEPTED, LIVE)

- Subject: `nx-dress-well` (same tuple as polish-313/314, empty comp bag).
  Build source `assets/mkvillage-civic.ts` (well block) → `village_well.glb`
  (live was 38ab2eef, polish-314's wood-frame build).
- Defect (queue head from polish-313/314 close, judged fresh this tick on
  exact live bytes, ZAI fallback disclosed — polish-285..314 class, native
  re-judge owed): ZERO night identity — 18m night "no lamp, lantern,
  emissive material, or warm glow anywhere"; below the roofline
  night-invisible, read as "small dark shed or shrine"; water collapses
  beyond ~6m. Both night judges independently prescribed a hanging lantern.
- Change (ONE intervention): village streetlamp fixture grammar
  (polish-312) at well scale — iron bracket arm on the W approach post
  (0.34m, y 1.64, clears crossbar 1.72 + eave underside 1.78 by
  construction) + hanging tab + warm-core lantern (0.09×0.13 core,
  0xffc98a @ 0.9 = the canonical [0.9, 0.5257, 0.2287] streetlamp
  emissive) under a peaked 4-sided iron cap at x −1.12, fully outside the
  eave edge (polish-272 overhang law). Iron sheen 0.15 on arm/cap/tab
  (polish-305/312 lineage). No new light entity — the emissive IS the
  light.
- Candidate `9a88e9a8c3d67d25…` deterministic ×2 (mtime-verified);
  whole-14-set rebuild: banner/fountain siblings byte-identical to live
  pins. Nodes 21→25, draws 21→25 (4 lantern meshes). bbox −x grows 0.19
  (to −1.24); nearest non-rider entity 4.67m out (rooster) — no SAT
  contact by construction; artwalk b27-waterline rider concentric,
  ownership law, ignored during host judgment.
- Judge verdicts: NIGHT A/B PASS as night-identity cure ("converts the
  scene from unidentified dark shed to inhabited village well"; lantern
  anchored by visible bracket + hanging yoke; restrained glow, no bleed;
  zero new defects). DAY PASS ("natural unlit daytime hardware";
  ~28–30cm lantern vs 2m roof plausible; no floating/clipping). Judge
  nits recorded not treated: iron sheen faint at 18m exposure; no cast
  light on post/roof underside (engine has no point-light-from-emissive;
  emissive-tint near-lantern candidate noted for a future tick).
- Pixel diffs: night 18m 2314 px confined to the lantern locus
  x[422..542]; day diffs = whole-model ~3px shift (review rig
  auto-recenters on the grown bbox) + lantern; close-rig rimclose/
  oblique cameras frame +x — the −x lantern is outside those frames
  (0 px, expected; polish-307 rig-law class).
- Placed via NEW dedicated placer `next-place-polish315-well.ts` (p314
  chassis, pins 38ab2eef→9a88e9a8): PLACED_VERIFIED, 1 upload + 1 verb,
  comp bag {} preserved, idempotent rerun zero verbs, live pin
  `store/9a88e9a8c3d67d25.glb` @ [30,0,-4.5] yaw 0 exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `p315-verify-served.ts`; probe self-caught its own census gate
  miscalibration RED→GREEN — the served re-encode DEDUPES meshes 25→19,
  p310 law): served DRACO e4f1fdcc… keeps glow3 [0.9,0.5257,0.2287] on
  well_lantern_core, glow2 [0.15,0.0876,0.0381] on arm/cap/tab, node
  translations exact (core (−1.12, 1.44, 0)), water glow1 + wood-frame
  regressions intact, 0 non-finite. P315_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 (sibling struct-265 landed
  mid-tick — absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-315-well-night/` (before/ = live
  38ab2eef baseline GLB + 15-view rig; after/ = candidate + rig).
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) recorded
  candidates — near-lantern emissive cast-tint on the W post (night judge
  ask, restrained), well rope thickness (polish-310 lineage).

### polish-316 — well lantern cast-light (ACCEPTED, LIVE)

- Subject: `nx-dress-well` (same tuple as polish-313..315, empty comp bag).
  Build source `assets/mkvillage-civic.ts` (well block) -> `village_well.glb`
  (live was 9a88e9a8, polish-315's lantern build).
- Defect (queue head from polish-315 close, confirmed fresh on exact live
  bytes via NEW `p316-west-rig.ts` — polish-307 rig-law class: every standing
  rig is a +Z camera; the -x lantern face was never framed): the lantern read
  as an ISOLATED GLOW DOT — post "dark, unaffected wood right up to the
  lantern", warm pixels stop at the fixture edge, zero warmth on post/roof/
  ring (engine has no light-from-emissive).
- Change (ONE edit): W mount post = two-band baked falloff. Upper band
  `well_post_w_hi` (lantern-adjacent, full visible post) warm emissive
  0xffc98a; lower band plain wood — seam lands behind the ring at every
  vantage. Three measured rounds: 0.045 day-rejected (painted band read,
  polish-311 permanent-shade law — the W face is under-eave), 0.02 day
  seam-claim pixel-falsified (uniform to ring crest) but still warm,
  0.012 ACCEPTED (day SHIP convention-aware; night PASS attached, posts
  separable, plausible falloff).
- Candidate `f6320f9f27334936...` deterministic x2; sibling control 406
  files (only village_well changed; village_dtria3 = foreign struct-267
  build); nodes 25->27. Served DRACO probe `p316-verify-served.ts`
  P316_SERVED_PASS (glow0 [0.012,0.007,0.003] on well_post_w_hi only; all
  313/314/315 regressions intact; 0 non-finite).
- Placed via NEW `next-place-polish316-well.ts` (pins 9a88e9a8->f6320f9f):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun already-live-no-verbs, live pin `store/f6320f9f27334936.glb` @
  [30,0,-4.5] yaw 0 exact.
- Judges: ZAI fallback disclosed (no native vision tool loadable this cron
  session, polish-285..315 class, native re-judge owed).
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) optional
  judge-noted future: warm rim-kiss on the ring crest near the lantern
  (restrained), well rope thickness (polish-310 lineage).

### polish-317 — well rope mechanism (ACCEPTED, LIVE)

- Subject: `nx-dress-well` (same tuple as polish-313..316, empty comp
  bag — census-fresh this tick). Build source `assets/mkvillage-civic.ts`
  (well block) -> `village_well.glb` (live was f6320f9f, polish-316's
  cast-light build; on-disk sha == live exact).
- Defect (queue head named at polish-315/316 close, judged fresh on exact
  live bytes via NEW `p317-rope-rig.ts` — polish-307 rig-law: frame the
  element under judgment; the rope/bucket zone was never framed): the rope
  mechanism read as RIGID ARCHITECTURE — close judges: the square 0.03
  BONE rod read as "wooden dowel"/"post"/"mooring line" (~45% of post
  width), flush merges at both ends ("pole glued to box", "column
  supporting the beam"), no knot, no pulley; the bucket read as a crate
  with no tie. polish-310 bell-rope lineage at well scale.
- Change (ONE intervention, 7 measured judge rounds — v1 rejected: bell-
  tower-canon olive rope separated from the LIGHT-olive wood frame by
  value only; v2 rejected: sheave entombed inside the housing (polish-52
  class) + knot sub-resolution; v3 rejected: tail floated 8mm beside the
  wheel tangent and its end-knot merged into the main knot reading as a
  "stray sphere"; v4 partial: wrap arc added but 180° left wheel face
  visible; v5: brass bail arc (iron arc read "same tan as rope");
  v6: lugs lifted proud + 270° wrap — still a gap read; v7 ACCEPTED):
  round hemp rope r 0.016 in pale tan 0xcdb67e (hue-flip vs olive wood),
  FULL-CIRCLE rope wrap (TorusGeometry r 0.046 tube 0.012) riding the
  brass sheave rim — rope-in-groove from every vantage, top disappears
  into the block slot; iron pulley block with EXPOSED brass sheave
  (z ±0.026 beyond cheeks ±0.007, 14mm below); short kicked haul tail
  (r 0.012, 19cm) leaving the wrap's E tangent with a whipped end knot;
  brass bail arc (r 0.09) over the bucket with barrel knot at the apex
  (seats across it) and brass lug pads cresting the rim 1.4cm proud.
- Candidate `605bb2c2eba1327d552de392be4631d4f972e44ea3268363e15760ef8e0eefcd`
  deterministic x2 (mtime-verified); round-trip control: HEAD source
  rebuilt reproduced live f6320f9f byte-exact (determinism re-proven);
  banner sibling byte-identical to its live pin d32e7bcb (edit confined).
  Nodes 26 -> 35 (9 new named mechanism anchors), NaN 0/2361+.
- Falsification: final judge (ZAI fallback disclosed — no native vision
  loadable this cron session, polish-285..316 class, native re-judge
  owed): pulley YES (continuous ring, no gap between ring and strand),
  tie YES (knot-as-lashing, brass-vs-rope separation, both pads proud),
  tail YES (free end, unambiguous), OVERALL YES — believable well-bucket
  mechanism, "hierarchy reads instantly"; zero disqualifying geometry.
  The judge's one ask (does the ring close behind the wheel) is answered
  by construction: full TorusGeometry. Pixel diffs vs baseline confined
  to the mechanism column x[381..592] (aerial 0 px — mechanism under the
  roof; 18m gameplay/night 100 px sub-pixel; westclose 764 px). Judge
  misreads falsified by decode/probe where they occurred (v6 "arc leg
  draping over the edge" = the merged knot cluster, arc lies in z=0
  plane; v5 "no E lug" = lugs flush inside the top plane — the REAL
  entombment, cured v6).
- Placed via NEW dedicated placer `next-place-polish317-well.ts`
  (p316 chassis, pins f6320f9f -> 605bb2c2): PLACED_VERIFIED, 1 upload +
  1 verb, comp bag {} preserved, idempotent rerun already-live-no-verbs,
  live census pin `store/605bb2c2eba1327d.glb` @ [30,0,-4.5] yaw 0 exact.
- Served-bytes proof (struct-104 law, durable probe
  `agents/arthur/p317-verify-served.ts`): served DRACO 71f7552b… keeps
  all 10 mechanism anchors at exact authored bands (rope 1.31..1.60, wrap
  1.587..1.703, knot 1.258..1.342, sheave 1.632..1.658, lugs crest
  1.214..1.242 > rim 1.22, handle apex 1.321), both COLOR_0 families
  exact after x257 UINT16 normalization (rope tan 156,119,53; brass
  90,92,17 — p314 value-range lane law), polish-313 water / 314 wood /
  315 lantern glow3 / 316 cast-band glow0 regressions all intact,
  0 non-finite. Probe self-caught 3 of its own bugs pre-truth (wrong
  served-URL form, nodeTr not covering regression meshes, UINT16 color
  scale + forgotten tube radius in the handle-band gate) — RED->GREEN.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD a2a72636
  (fauna-56 landed mid-tick — absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-317-well-rope/` (before/ = live
  f6320f9f 18-view rig incl. the 6 new rope-rig views + baseline.glb;
  after/ = v1 ff62d1a9; after-v2 d9d29997; after-v3 2e773b6e;
  after-v4 0fc987e0; after-v5 4c3e033f; after-v6 aaa21499; after-v7
  605bb2c2 = ACCEPTED; probes: p317-rope-rig.ts, p317-verify-served.ts,
  /tmp pixdiff/hue/abdiff one-shots).
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) the
  two judge-named future notes — warm ring-crest rim-kiss near the
  lantern (polish-316 lineage), bucket staves/rim read (v7 judge:
  "plain box, no staves" — a value/geometry candidate, judge fresh
  first).

### polish-318 — well coopered bucket (ACCEPTED, LIVE)

- Subject: `nx-dress-well` (same tuple as polish-313..317, empty comp
  bag). Build source `assets/mkvillage-civic.ts` (well block) ->
  `village_well.glb` (live was 605bb2c2, polish-317's rope build;
  on-disk sha == live exact).
- Defect (queue head (b) from polish-317 close, judged fresh on exact
  live bytes via NEW `p318-bucket-rig.ts` — polish-307 rig-law: frame
  the element under judgment; the bucket was never framed): the bucket
  was a plain 0.3 C.MID box — judge: "single unmodified cube… zero
  surface detail… indistinguishable from a crate".
- Change (ONE coopering intervention, judge's own recipe): tapered
  octagonal body (8 flats = staves, r_top 0.17 > r_base 0.14), iron rim
  ring r 0.185, two taper-sized hoop bands. v1 hoops shared
  wellLanternIron — judge flagged warm-tan material-family failure; v2
  dedicated bucketIron 0x3d4046 gunmetal (cool hue-flip; lantern/pulley
  warm sheen untouched). Handle/lugs/knot/rope/pulley untouched.
- Candidate `579e0a1faa446680af0d781645ed6b768d9e9f4947bd10344797105e14f2eb1b`
  deterministic x2; banner + fountain siblings byte-identical to live
  pins. Nodes 35->38, NaN 0.
- Judge verdicts (ZAI fallback disclosed, native re-judge owed —
  polish-285..317 class): close v2 PASS all five (coopered grammar
  fully legible, wood/iron distinction unambiguous, zero defects);
  gameplay 9m PASS ("step-change improvement, not marginal" — taper +
  open-top edge carry the read); night PASS (coherent mass, zero
  artifacts). Non-blocking notes: bail olive = brass canon; capped top
  + knot blob below threshold.
- Placed via NEW `next-place-polish318-well.ts`: PLACED_VERIFIED, 1
  upload + 1 verb, comp bag {} preserved, idempotent rerun
  already-live-no-verbs, live pin `store/579e0a1faa446680.glb` @
  [30,0,-4.5] yaw 0 exact.
- Served-bytes proof (struct-104 law, durable `p318-verify-served.ts`;
  probe self-caught its own sRGB-vs-linear COLOR_0 calibration bug
  RED->GREEN): served DRACO d5858e2d… PROVES the taper (top r 0.17 vs
  base r 0.14 y-stratified), rim/hoop bands exact, gunmetal + rope +
  brass + all three emissive regressions intact, 0 non-finite.
  P318_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD 1bee51e6
  (sweep-360 absorbed mid-tick — normal interlane life).
- Evidence: `reviews/hero-assets/polish-318-well-bucket/` (before/ =
  live 605bb2c2 baseline GLB + 7-view bucket rig; after/ = v1
  warm-iron rejected round; after-v2/ = ACCEPTED + rig).
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b)
  judge-noted candidates — warm ring-crest rim-kiss near the lantern
  (polish-316 lineage), bucket open-top interior disc (this tick's
  close-range note, judge fresh first).

### polish-319 — monument knot night material (ACCEPTED, LIVE)

- Subject: `nx-town-monument` (plaza NW, pos [-7,0,-7], yaw 0.7853981633974483,
  empty comp bag; polish-owned — live d7d3b15c == on-disk build byte-exact).
  First plaza-core re-survey subject after the September verdict; hall/welcome
  skipped as sibling-contested (live dc871edb / 7d1bd0c9 != polish pins,
  not byte-reproducible from HEAD — improve-lane lineage).
- Defect (ZAI judge ×3, disclosed fallback, native re-judge owed —
  polish-285..318 class): the KNOT — the monument's namesake — read as a
  dark mass at night in BOTH rigs. Solo 18m: 3/10, "the brass never catches
  the lamps". Live-light rig (NEW p319-monument-rig2.ts, dress-80 discipline:
  PointLight(0xffd9a0,16,10,2) at the four real light positions via align-1
  inverse): 5.5-6/10, "the focal object is the darkest interesting thing in
  frame" — the night lane's "monument gold read inside pools" was pool-adjacent
  prose, not knot material. Root cause: knot core mat(0xc9a86a,.28,.9) exported
  COLOR_0-only (polish-307 class — params never reached the wire).
- Change (ONE intervention, THREE measured rounds): knot material re-authored
  v3 = rough 0.45 / metal 0.15 (polish-307 bell-gold recipe) + emissive
  0xffc98a @ 0.025 → linear [0.025,0.0146,0.0064] (~+47 sRGB floor in dark
  zones only). v1 @ 0.35 REJECTED (emissiveFactor is LINEAR — ~160 sRGB added
  in ALL lighting; day p10 0→131 milky wash, polish-287 law; judge FAIL).
  v2 @ 0.025 + rough .28/metal .9 REJECTED at the live-light probe (smooth-
  metal conversion killed the broad diffuse pool response the engine-default
  rough-1 baseline surface had — live night tube net delta ~0; polish-289
  diffuse/metal trade, live variant). Bead/stones/plaque untouched.
- Candidate `1b4cca52022ff356acfa045411f49c539c3b98ac1210c0f5d4b9142c562c2c1c`
  deterministic ×2; decode ALL PASS (knot emissive exact, bead [0.9,0.5257,
  0.2287] unchanged, node/mesh census 9/8 identical, 0 non-finite).
- Falsification: day PASS ("satin/brushed brass, believable, no washout" —
  p10 41 ≤ +50 law, span 94 vs v1's 54). Night solo PASS (3→6/10, quiet
  self-lit metal, bead brightest, zero defects). Night LIVE PASS (5.5-6→7.5,
  warm lit-form + speculars, hierarchy corrected, restraint clean). Tube
  means: live night close (60,43,19)→(80,55,28); 18m (53,40,26)→(66,48,32).
- Placed via updated `next-place-monument.ts` (pins d7d3b15c→1b4cca52):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent rerun
  already-live-no-verbs, live census pin `store/1b4cca52022ff356.glb` exact.
- Served-bytes proof (struct-104 law, durable `p319-verify-served.ts`;
  self-caught 2 probe bugs RED→GREEN — 3-vs-4-component factor compare,
  mergekit mn3_* bucket names): served DRACO bf2e4814… keeps knot
  base/rough/metal/emissive EXACT + bead + both texture materials.
  P319_SERVED_PASS. Gate re-run after mutation: ALL PASS exit 0 at sibling
  HEAD e2e9e9cb (dress-206/struct-272 absorbed mid-tick).
- Evidence: `reviews/hero-assets/polish-319-monument/` (before/ = live
  baseline 12-view rig; after/ = v1 rejected; after-v2/ = rejected;
  after-v3/ = ACCEPTED; live/ = the four live-light rig rounds ×3 views +
  served-verified.glb; probes: p319-monument-rig/rig2, decode, bandvals,
  tubestats, cropmean, verify-served).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree) — recorded here + ledger instead. Not fabricated.
- Next ranked: (a) plaza-core re-survey (mapboard night slab N6-class note
  is approach-lane routed; tower/inn are interior-lane hosts), or (b)
  judge-named monument follow-ups — lower-tube night warmth + contact-shadow
  anchor (this tick's judge notes, future rounds).

### polish-320 — fountain water-read (ACCEPTED, LIVE)

- Subject: `nx-dress-fountain` (plaza SE edge [12.5,0,4], yaw −π/4, empty comp
  bag; polish-owned, live == on-disk 72f07c2a byte-exact). First plaza-core
  re-survey subject after polish-319; market/gate-n/shrine surveyed
  sibling-contested (live 8c16ea9a/a3975677/f51be95d != local pins) and
  skipped per polish-319 precedent.
- Defect (ZAI judge ×2 on exact live bytes, disclosed fallback, native
  re-judge owed — polish-285..319 class): the fountain read DRY — water
  invisible AS water (gameplay: "birdbath or lamp post"; close: "dry stone
  monument with a blue disc balanced on top"). Decode-confirmed roots:
  basin pool rim-occluded at grazing (dress-79), upper disc flush with the
  drum top (zero freeboard — "cannot hold water"), jet an opaque rod.
- Change (ONE coherent water-read intervention, SIX measured rounds in one
  tick): bone retaining lip + bowl water at 9.5cm freeboard; cascade of 12
  clustered/gapped tapered strands (widths 0.4x..2.2x, landings spread
  r 0.82..1.02) from under the lip; impact foam = broken ring + 8 blobs +
  3 lobed arcs + 4 droplets living in the rim-visibility WINDOW (crest
  0.485..0.53 — v3 y-0.40 invisible, v5 y-0.52/swallowing); splash dome
  cresting the lip; thin widening plume jet + flat burst crown. THREE water
  materials: calm water (polish-274 recipe), bright spray 0xcfe4ec, foam
  0xe9f5f9 (falling water reads by VALUE — fountains photograph white).
  Rejected rounds: v1 palette-dark sheet (37,61,73 monolith), v2 bright
  solid sheet ("cake tier"), v3 rods + invisible foam, v5 baluster jet +
  cream-pie basin.
- Candidate `9c27a28e846fee30…` deterministic ×2; siblings byte-identical
  (birdbath/chimes/weathervane); nodes 8→39, materials →3. Pixel census:
  water-class px 85 → 12,778 day / 0 → 2,024 night.
- Judge verdict (v6): ACCEPT — working/running fountain at 18m, dark-water
  basin ringed by broken foam, thin plume (not baluster), zero defects
  (clip/float/noise/saturation all clean). Open nit: burst crown not
  legible at 18m (geometric cause recorded: crown r 0.14 == ball r 0.14,
  radially enclosed — the v7 candidate).
- Placed via updated `next-place-fountain.ts` (pins 72f07c2a→9c27a28e):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun "already live — no verbs", live census pin
  `store/9c27a28e846fee30.glb` @ [12.5,0,4] yaw −π/4 exact.
- Served-bytes proof (struct-104 law, durable `p320-verify-served.ts`;
  self-caught 1 probe bug RED→GREEN): served DRACO dd0ab1d8… keeps all
  THREE emissive families exact (calm/spray/foam), 12 strands, 15 foam
  elements, all 7 named anchors. P320_SERVED_PASS. Gate re-run after
  mutation: ALL PASS exit 0 at sibling HEAD 04acdace (sweep-364 absorbed
  mid-tick — normal interlane life).
- Evidence: `reviews/hero-assets/polish-320-fountain/` (before/ = live
  72f07c2a 10-view rig + baseline.glb; after..after-v5 = rejected rounds;
  after-v6/ = ACCEPTED; probes: p320-decode.ts, p320-verify-served.ts,
  /tmp spray census one-shots).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree) — recorded here + ledger instead. Not fabricated.
- Next ranked: (a) plaza-core re-survey on fresh evidence (birdbath is the
  mkwater1 sibling — judge fresh), or (b) fountain v7 crown legibility
  (judge nit, needs crown wider than the ball), or (c) monument
  judge-named follow-ups (lower-tube night warmth, contact shadow).

### polish-321 — fountain v7 burst crown (ACCEPTED, LIVE)

- Subject: `nx-dress-fountain` (same tuple as polish-320; empty comp bag).
  Build source `assets/mkwater1.ts` (live was 9c27a28e, polish-320's v6).
  Queue-head (b) re-judged fresh: birdbath queue item FALSIFIED at census
  (village_birdbath.glb has NO live entity in commons-next — era-1 commons
  asset; routing a placement would be dress-lane scope, not polish).
- Defect (ZAI judge on exact live bytes, 18m gameplay, disclosed fallback,
  native re-judge owed — polish-285..320 class): the burst crown merged
  DOWNWARD into the white jet — a "2-4px flare where jet meets ball",
  white-on-white; polish-320's recorded cause (crown r == ball r) refined:
  occlusion is NOT the failure mode, value-merge with the jet is.
- Change (ONE edit): crown SphereGeometry r 0.14 -> 0.24 (same node/pos/
  material, crest 2.35 stays under ball equator 2.42). Candidate
  `d44315f635690f5e…` deterministic ×2 (mtime-verified); siblings
  birdbath/chimes/weathervane byte-identical; decode: crown ±0.228 local,
  finial ±0.140 unchanged, nodes/meshes/materials 39/39/3 unchanged.
- Falsification: judge AFTER — burst reads as distinct wide cap (40px vs
  8px jet neck, 5:1 ratio), ball still crowns, zero new defects
  (float/clip/z-fight/proportion all clean). Night PASS (distinct
  restrained burst cushion, hierarchy correct, contained 1-2px bloom).
  Pixel diffs confined to the apex band in every view (gameplay 411px
  x[468..491] y[278..308] = exactly the judge's ball/burst zone).
- toGLB SCALE-DROP finding (probe-derived, pre-existing, affects v6+v7
  identically): node.scale NEVER reaches the GLB — crown/dome/blobs ship
  as full spheres in every build; the flatten read is the ball-overlap
  composite. Recorded as kit-level candidate (glbwrite.ts scale support),
  needs a dedicated rebuild-all tick; NOT treated mid-lane (mergekit/
  glbwrite carry foreign uncommitted mods — polish-311 precedent).
- Placed via updated `next-place-fountain.ts` (pins 9c27a28e -> d44315f6):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun already-live-no-verbs, live pin `store/d44315f635690f5e.glb` @
  [12.5,0,4] yaw −π/4 exact.
- Served-bytes proof (struct-104 law, durable `p321-verify-served.ts`,
  p317 DRACO chassis): served DRACO keeps crown maxXZ 0.2283 (v6 0.133),
  finial control 0.1400, all 3 emissive families exact, 12 strands + 15
  foam + 8 named anchors, 0 non-finite. Probe self-caught its own unscaled
  ySpan gate bug RED→GREEN before the scale-drop discovery reframed it.
  P321_SERVED_PASS. Gate re-run after mutation: ALL PASS exit 0 at sibling
  HEAD cdfbb966 (fauna-60 absorbed — normal interlane life).
- Evidence: `reviews/hero-assets/polish-321-fountain-crown/` (before/ =
  live 9c27a28e baseline GLB + 10-view rig; after/ = candidate + rig;
  probes: p321-abdiff.ts, p321-verify-served.ts).
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) judge
  notes — brass ball washes to near-burst white at 18m (day) / foam-white
  at night (brass tint candidate, material-only, judge fresh first).

### polish-323 — fountain cascade wire-read cure (ACCEPTED, LIVE)

- Subject: `nx-dress-fountain` (same tuple as polish-320..322; empty comp
  bag). Build source `assets/mkwater1.ts` (live was 657f3c22).
- Defect (day+night judges' convergent #1 on exact live bytes — NOT the
  queued apex nits, which held at 7/10): the cascade read as "harp strings
  / chains, not water" — constant width, dead-straight, metronomic spacing,
  strand tops floating 1-2px below the lip (night 4/10).
- Change (ONE intervention, 7 measured in-tick rounds): overflow-curved
  tapered strands (lean-out parabola s^1.35 from tucked-under-lip tops,
  wTop 0.32x wBot, lower-third erosion, 2 merged pairs, wide-angle jitter);
  foam pads re-aimed UNDER the six fat landings, grown to a connected foam
  band (squash BAKED — polish-321 scale-drop law); foam night emissive
  0.55->0.78 (polish-287 day-clip law: day +18 near-white px, night +468
  bright-blue px); +6 vertical splash fins on pad crests (v6 fail = dress-79
  inverted: flat pads compress to ~4px at 18m grazing; first fin attempt
  entombed 0-px — polish-52 enclosure — rebased proud).
- Judge arc: day 3->4.5->6->7->7.5 (v5), v7 regression PASS (fins natural
  churn, zero defects); night 4->6->6->7 (v7 churn registers, hierarchy
  water > ball correct). ZAI fallback disclosed, native re-judge owed
  (polish-285..322 class).
- Candidate `6fa99d31623d1b56c5b464ae5e542de8ce80df7515d4921d989b3bb9dbe6fd1a`
  deterministic x2; siblings birdbath/chimes/weathervane byte-identical;
  decode 43 nodes / 0 nonFinite / landings <= 1.13 < basin 1.38; diffs
  confined to the cascade band all views.
- Placed via `next-place-fountain.ts` (pins 657f3c22 -> 6fa99d31):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun zero verbs. Served proof `p323-verify-served.ts` P323_SERVED_PASS
  (20 gates; served sha 3ef909f9d47699fd; strand bows 0.187+, pad squash
  0.143, fin spans 0.130, 321/322 regressions exact). Gate re-run ALL PASS
  exit 0 at sibling HEAD dress-211.
- Evidence: `reviews/hero-assets/polish-323-fountain-ball/` (before/ +
  after..after-v7/ = the 7 judge rounds, each with candidate.glb).
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) judge
  nits — fin height/width variance (kill picket regularity), strand
  brightness variation along length, pedestal dead-mass rim light
  (night), basin water tone; apex ball scale+20-30% (polish-322 carry).

### polish-322 — fountain brass-ball identity (ACCEPTED, LIVE)

- Subject: `nx-dress-fountain` (same tuple as polish-320/321; empty comp bag).
  Build source `assets/mkwater1.ts` (live was d44315f6, polish-321's v7).
- Defect (queue head from polish-321 close, judged fresh day+night on exact
  live bytes, ZAI fallback disclosed — polish-285..321 class, native re-judge
  owed): apex read "white blob on white spray" (day; ball near-white #F2F0EA,
  zero metal read) / "foam-white glowing orb, brightest element" (night).
  Decode found TWO roots: (a) `ft_finial` was the legacy COLOR_0-only
  mat(C.BRASS=0xa0a248 olive) lane — params never reached the wire
  (polish-307 bell class); (b) the toGLB scale-drop (polish-321 finding)
  shipped `ft_crown` as a FULL r0.24 sphere topping y2.55 vs ball top y2.56 —
  the brass ball was ~96% ENCLOSED in white foam (polish-52: enclosure
  beats tint; no material change could survive it).
- Change (ONE apex intervention, mkwater1.ts): finial re-authored REAL
  bell-gold 0xd9ac52 r.45 m.15 (polish-307 recipe) + warm night accent
  0xffc98a@0.06; crown squash BAKED into vertex geometry (mesh-local y-span
  0.48 -> 0.134, crest 2.377 < ball equator 2.42 — ball stands 0.18m clear
  above the burst disc).
- Candidate `657f3c222e2ba98d35a3128d162b9951783de936f7ffd013c33f47c32cd422cb`
  deterministic x2; birdbath/chimes/weathervane siblings byte-identical (edit
  confined — chimes/weathervane brass untouched). Pixel diffs confined to
  the apex zone in all 8 views (maxDelta 493-722); materials 3->4 (finial's
  unique emissive cannot merge — documented).
- Judge verdicts: DAY PASS — no white bleed, ball hard-separates (L*55 vs
  L*94), "ball crowning a water plume" NOT white blob, zero defects
  (float/clip/z-fight/oversize all clean). NIGHT PASS — no foam-orb failure,
  water brighter than brass (correct hierarchy), hue-separated, "warm brass
  finial on a glowing water plume".
- Placed via updated `next-place-fountain.ts` (pins d44315f6 -> 657f3c22):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun zero verbs, live census pin `store/657f3c222e2ba98d.glb` @
  [12.5,0,4] yaw -pi/4 exact.
- Served-bytes proof (struct-104 law, durable `p322-verify-served.ts`):
  served DRACO bc2f93c0… P322_SERVED_PASS 17 gates — ft_finial binds the
  emissive glTF mat exact [0.06,0.035,0.015], crown squash BAKED ySpan
  0.1344, radial width 0.2283 held, all 320/321 regressions intact
  (3 water families, 12 strands, 15 foam, anchors), 0 non-finite.
- Ledger note: first append hit the loop-h-1 class (prose ended with its own
  (D+1, E+0) pair — tool wrote its own, flagged BROKEN); stripped the
  prose pair same tick, tool-arithmetic law re-verified EXACT (2336002 +
  35082 = 2371084), single pair on the entry line.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) judge
  nits — ball matte-vs-specular read (needs sun-angle or higher-metal
  falsification; rig's static sun), ball +20-30% scale for a stronger
  crown read, judge fresh first.

### polish-324 — fountain drum dead-mass cure (ACCEPTED, LIVE)

- Subject: `nx-dress-fountain` (same tuple as polish-320..323; empty comp
  bag, census-fresh this tick). Build source `assets/mkwater1.ts` (live was
  6fa99d31; on-disk sha == live exact).
- Defect (queue head from polish-323 close, judged fresh day+night on exact
  live bytes, ZAI fallback disclosed — polish-285..323 class, native
  re-judge owed): the drum read as a flat dead dark mass — night "near-black
  wedge, no tonal separation from the shadowed basin" (4/10, weakest
  element); day "single flat tone, smooth dark plug, not a constructed
  stone drum".
- Change (ONE defect class, 2 measured rounds): r1 = 3 stepped courses
  (3cm reveals, top course cool night-spill 0x9fc9dd@0.05) — night PASS
  (dead-mass cured, believable spill "falloff within 5-8px, no bloom"),
  day judged invisible ("value, not geometry; zero contrast budget").
  r2 = dressed limestone 0x75705a + 7cm reveals; the r2 judge's FAIL
  ("limestone not present on any drum pixel") was FALSIFIED by the band
  probe — day drum-upper (44,47,48)->(83,90,91) vs basin (35,32,21) = 2.4x
  separation; probes outrank prose (polish-289/299 law). ACCEPT r2.
- Candidate `9e6b197741bdd227e25de9fbc76999f97dc0ae525c03e17f352422dd3e3ae980`
  deterministic x2 (mtime-verified); siblings birdbath/chimes/weathervane
  byte-identical to live pins; nodes 43->45 (3 courses replace 1 pedestal).
- Placed via updated `next-place-fountain.ts` (pins 6fa99d31 -> 9e6b1977):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun already-live-no-verbs, live pin `store/9e6b197741bdd227.glb` @
  [12.5,0,4] yaw -pi/4 exact.
- Served-bytes proof (struct-104 law, durable `p324-verify-served.ts`;
  probe self-caught 2 bugs RED->GREEN before truth: VEC4-stride COLOR_0
  misread + sRGB-vs-linear gate expectation): served DRACO f3dc568c…
  P324_SERVED_PASS 35 gates — drum radii 0.435/0.365/0.295 (steps
  0.070/0.070), heights 0.36/0.36/0.38, limestone linear (45,41,26),
  cool-spill mat [0.017,0.029,0.036], all p320..323 regressions exact,
  0 non-finite.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD 34ca6e04
  (dress-213 absorbed the live move mid-tick, classified polish-owned).
- Evidence: `reviews/hero-assets/polish-324-fountain-pedestal/` (before/ =
  live 6fa99d31 rig + baseline.glb; after/ = r1; after-v2/ = r2 ACCEPTED;
  /tmp/p324-bandvals.ts drum-zone probe).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree) — recorded here + ledger instead. Not fabricated.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) remaining
  judge nits — foam blob-merge into a continuous spill line at the drum
  foot (night), fin height/width variance, strand brightness variation,
  basin water tone.

### polish-325 — fountain bowl dead-hole cure (ACCEPTED, LIVE)

- Subject: `nx-dress-fountain` (same tuple as polish-320..324; empty comp
  bag, census-fresh this tick). Build source `assets/mkwater1.ts` (live was
  9e6b1977, polish-324's drum build; on-disk sha == live exact).
- Defect (day+night judges converge + pixel probes on exact live bytes, ZAI
  fallback disclosed — no native vision tool loadable in this cron session,
  polish-285..324 class, native re-judge owed): the bowl band (ft_bowl,
  y 1.50..1.80 — the vessel connecting cascade to drum) read as a HOLE in
  the silhouette — pixel-probe pure (0,0,0) in BOTH lighting states; night
  judge "black doorway / water wings over a void / floating light fixture"
  (identity 5/10); day judge "dark void, not a constructed structure".
  Decode root cause: ft_bowl shipped material-NULL (legacy COLOR_0-only
  mat() lane, polish-289/307 class) while drum/water/finial all had real
  materials. Adjacent falsified judge claims recorded, not treated: day
  "drum near-black" (band probe 2.4x separated, polish-324 stood);
  "no basin water" (dress-79 rim-occlusion geometry, not absence);
  night "foam blobs merge into a spill line" (probe: 7 separate runs,
  2-8px — the polish-324 queue item is FALSIFIED at 18m; orphan-dot
  read may merit a future variance pass, judge fresh).
- Change (ONE edit, mkwater1.ts): ft_bowl joins the drum's own `drumStone`
  material (dressed limestone 0x75705a + cool night spill @ 0.05) — one
  stone, one structure (polish-307/308 one-metal precedent). No geometry,
  no node, no light change.
- Candidate `68e5b75e73a1405840c9a24137f283928816bc1dbdfcf01edcf5cb3d46f93999`
  deterministic x2 (mtime-verified); round-trip control: git-stash revert ->
  rebuild reproduced live 9e6b1977 byte-exact, stash-pop rebuild ->
  68e5b75e. Nodes 45 / materials 5 unchanged; siblings birdbath/chimes/
  weathervane byte-stable across the double rebuild (no live entities for
  census pins — hash stability is the control).
- Falsification: pixel diffs confined to the bowl band in ALL 7 views
  (gameplay/night 792 px x[445..516] y[326..339]; close 16911; aerial
  4830; mid 3184; zero collateral). Band values (0,0,0) -> day (45,54,56)
  / night (37,48,54) — joins the drum spill family. Night A/B judge
  (ui_diff): "B clearly better — model one-material edit; doorway cured,
  continuous mass rim->drum, hierarchy water > stone intact, zero new
  defects". Day A/B judge claimed "no visible change" — FALSIFIED by the
  measured 792px/56-delta diff (judge sensitivity limit on a dark 14px
  band, polish-324 class; probes outrank prose). Bowl-vs-drum-top value
  split (45/68 day) is same-material normal-direction shading
  (down-tilting bowl faces catch less sky) — physically correct, not a
  material mismatch.
- Placed via updated `next-place-fountain.ts` (pins 9e6b1977 -> 68e5b75e):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun "already live at reviewed tuple — no verbs", live census pin
  `store/68e5b75e73a14058.glb` @ [12.5,0,4] yaw -0.7853981633974483 exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p325-verify-served.ts`): served DRACO 9121494e… keeps
  ft_bowl -> glow0 (limestone baseColor + spill emissive EXACT), geometry
  span/radius unchanged, all 5 emissive families + p320..324 regressions
  (3 stepped drum courses, 12 strands, 6 pads, 6 fins, crown/finial
  controls) intact, 0 non-finite. P325_SERVED_PASS (31 gates).
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD 56fa9eea
  (struct-283 hold landed mid-tick — absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-325-fountain-bowl/` (before/ =
  live baseline GLB + 8-view rig; after/ = candidate GLB + 8-view rig).
- Excalibur checkpoint: `eidoverse-hero-assets` cast NOT reachable (no
  workings/ tree) — recorded here + ledger instead. Not fabricated.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) judge
  nits — foam pad size/variance at 18m night (the "rivets" note, now that
  blob-merge is falsified), fin height/width variance, strand brightness
  variation, basin water tone.

- ERRATUM (attribution, this tick, corrected after sibling self-revert):
  this lane's staged changeset (mkwater1.ts, placer pin, p325 probe) was
  consumed by sibling struct-284's FIRST commit 6a1eedca (broad index add);
  that lane then reset its own commit (reflog HEAD@{2}) and re-committed
  cleanly as 0e202135 carrying only its own files — the whole-file
  IMPROVEMENTS.md add preserved this lane's polish-325 ledger entry (law
  verified EXACT at HEAD). This lane's remaining files are re-committed by
  this lane in the erratum follow-up commit (survey-318 misattribution
  class, foreign-direction, self-corrected by the owning lane). Live pin
  68e5b75e, P325_SERVED_PASS, and evidence are unaffected — attribution
  only.

### polish-326 — fountain splash-zone variance (ACCEPTED, LIVE)

- Subject: `nx-dress-fountain` (same tuple as polish-320..325; empty comp
  bag, census-fresh this tick). Build source `assets/mkwater1.ts` (live was
  68e5b75e, polish-325's bowl build; on-disk sha == live exact at survey).
- Defect (day+night judges on exact live bytes, queue-head from polish-325
  close, ZAI fallback disclosed — no native vision tool loadable in this
  cron session, polish-285..325 class, native re-judge owed): "instanced
  uniformity without breakup" — the foam pads + fins read as an
  evenly-cadenced row of identical marks ("riveted / picket fence", worst
  offender per BOTH judges), and every cascade strand shared one
  brightness. Source-true: pads spanned 6% in size, fins 7%, one material
  per family. Falsified adjacent judge claims (recorded, not treated):
  "no drum courses" (7cm reveals exist, polish-324), "no basin water
  plane" (dress-79 rim occlusion), "mirrored strands" (deterministic
  jitter, no mirror in source), "identical strand widths" (0.4x..2.2x
  swing, sub-pixel at 9m).
- Change (ONE intervention, 2 measured rounds): per-instance VARIANCE, all
  deterministic literal tables — (a) strands take one of THREE emissive
  classes keyed to their own WPROF width (fat catches more light); (b) pads:
  size factor 0.74..1.30, squash 0.24..0.34, radial+height jitter,
  brightness tier table; (c) fins: height factor 0.62..1.45, width
  0.85..1.20, lean +-7deg, independent brightness tiers. ft_splash torus
  + dome/jet/crown keep the exact 0.78 connective signature. Rejected r1
  `431c07ae…` (classes 0.30/0.50/0.70 + wp-keyed pad tiers): night judge
  "change not effective at this distance" — variance real (decode-proven)
  but amplitude-diluted (4/6 pads and 6/6 fins shared one tier). r2
  widened spray classes 0.22/0.50/0.80 and explicit PAD_B/FIN_B tables.
- Candidate `056157db8d860b083d5a0c96b835952d0c54cd58b788549d06596ebef2d917a6`
  deterministic x2 (mtime-verified); siblings birdbath/chimes/weathervane
  byte-stable; nodes 45 unchanged, materials 25->29 (+4 documented
  emissive-class families that cannot merge). Decode probe P326_DECODE
  _PASS: 3 spray + 3 foam classes present, strand tiers match WPROF,
  fin quaternions = authored leans, fin heights = authored table
  (0.145/0.209/0.084/0.179/0.111/0.145), pad squashes vary, apex/finial
  regressions exact, 0 non-finite.
- Falsification: pixel diffs confined to the cascade + landing band in all
  7 views (gameplay/night 1968/2178 px, rows 325..393; apex untouched).
  Night A/B r2 (ui_diff): waterline PASS (pad heights 4..11px varied,
  brightness stepped ~160..~230, clumping), strands PASS (clearly
  bright/dim contrast, "effectively zero" before), one LOW watch
  (right-side dim segment) — close-range re-judge: ring CONTINUOUS,
  varied, "distribution you'd expect from falling water impact", zero
  detached/broken. Day A/B: coherent, zero new defects (strand-class
  day-delta sub-threshold = polish-287 diffuse-clip law; night is the
  target state). Day judge's "subtle at 9m" recorded as inherent — the
  riveted read it cured is the 18m NIGHT read both judges failed.
- Placed via updated `next-place-fountain.ts` (pins 68e5b75e -> 056157db):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun "already live at reviewed tuple — no verbs", live census pin
  `store/056157db8d860b08.glb` @ [12.5,0,4] yaw -0.7853981633974483 exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p326-verify-served.ts`): served DRACO 43ca198e…
  P326_SERVED_PASS (22 gates) — all 3+3 classes, strand/pad/fin tier
  bindings, authored fin heights + quaternion leans, and every p320..325
  regression (crown squash 0.1344, finial 0.1400, drum steps 0.070/0.070,
  strand bows 0.187+, connective + finial emissives exact) survived the
  re-encode; 0 non-finite.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD dd65a8e9
  (struct-286 hold landed mid-tick — absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-326-fountain-basin/` (before/ =
  live 68e5b75e baseline GLB + 7-view rig; after/ = rejected r1;
  after-r2/ = ACCEPTED + rig; probes: /tmp/p326-decode.ts, /tmp/p326-
  abdiff.ts, /tmp/p326-rig.ts one-shots).
- Excalibur checkpoint: cast REACHABLE this tick (layout moved:
  `vessel/workings/eidoverse-hero-assets` + `grimoire/engine/workings.mjs`)
  — checkpoint appended post-commit.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) judge
  notes — fin height/width variance now shipped (watch: right-side dim
  segment at extreme distance), strand brightness variation shipped;
  remaining nits: basin water tone, the two long rim streaks (ft_splash
  arc segments) named by the day judge as the strongest remaining
  regularity anchors — a future round if 18m evidence warrants.

### polish-328 — monument satellite-bead material truth (ACCEPTED, LIVE)

- Subject: `nx-town-monument` (plaza NW, same tuple as polish-319/327; empty
  comp bag). Build source `assets/mkv3-monument.ts` (live was 43c9dcf3,
  polish-327's contact-shadow build; on-disk sha == live exact at survey).
  Queue head from polish-327 close.
- Defect (ZAI judge on fresh baseline pixels, disclosed fallback — no native
  vision tool loadable in this cron session, polish-285..327 class, native
  re-judge owed): the 6 satellite beads exported via `mat(0xe8caa0, 0.3,
  0.8)` = the legacy COLOR_0-only lane (rough/metal params never reached the
  wire, polish-289/307 class) — judge read them as 4 dark stray specks
  ~55-60% darker than the knot, no specular, faceted-against-smooth-tube
  ("dirt/placeholder/defect" read); at 18m one read as a detached dot.
- Change (ONE coherent bead re-author): bell-gold PBR (0xd9ac52, r 0.45,
  m 0.15 — the polish-307/319 recipe proven at 18m on this exact monument)
  + subtle same-hue emissive floor 0xffc98a @ 0.02 (LINEAR [0.02,0.0117,
  0.0051], below the knot's own 0.025 floor — polish-319 v3 law) + smooth
  spheres (SphereGeometry r 0.07 12x8 replacing the faceted icosahedra).
  All six beads share ONE material; they fold into the bead bucket riding
  the knot GROUP's spin (no new KEEP name).
- Candidate `cfbb31a637ea7b743c8dd09ae3a5a9cd5d29134c658e96788d3cb90df464adae`
  deterministic x2 (mtime-verified). Decode probe `p328-decode.ts`
  P328_DECODE_PASS (15 gates; probe self-caught its own bufferView-offset
  bug RED->GREEN — GLB bufferView offsets are BIN-CHUNK-RELATIVE, not
  absolute file offsets; absolute reads returned denormals ~1e-34): bead
  material exact, 702 verts = 6x117 spheres, 100% on the knot path
  (r 0.7..1.0, |y|<0.48), accessor envelope [-0.92,-0.373,-0.806]..matches
  source math, emissive set stays exactly 3 (knot/lamp/bead — no stray),
  discs-2 + knot/lamp regressions intact, 0 non-finite.
- Falsification (3 A/B judges, ZAI fallback disclosed): DAY CLOSE — B
  clearly better, 4/4 targeted beads cured (L~25 -> matched-family brass
  9/9/9/8.5 out of 10, specular dots present, smooth spheres), zero new
  defects, ~98% pixel-match outside bead regions. The judge's "unchanged
  bead #5 (bright lemon at base)" is source-falsified: decode proves all
  six beads share ONE material — that element is the under-glow LAMP
  (emissive 0.9, intentional, polish-319's accepted night signal). NIGHT
  CLOSE — clearly better: beads readable as quiet gold accents without
  glow-orbs, hierarchy lamp > knot speculars > beads > tube intact, zero
  bloom/bleed/artifacts, change provably material-scoped. 18M GAMEPLAY —
  better: "the problematic dark detached dot visible in A is gone in B",
  beads read as gold punctuation on the silhouette; identity/plinth/
  contact-shadow/plaque approach all verified unchanged. Judge nit
  (recorded, not treated): bead saturation ~10% hotter than the knot body —
  within accent intent per the judge's own tolerance.
- Placed via updated `next-place-monument.ts` (pins 43c9dcf3->cfbb31a6):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun "already live at reviewed tuple — no verbs", live census pin
  `store/cfbb31a637ea7b74.glb` @ [-7,0,-7] yaw 0.7853981633974483 exact.
- Served-bytes proof (struct-104 law, durable probe `p328-verify-served.ts`,
  DRACO chassis p327): P328_SERVED_PASS (15 gates) — served bytes keep the
  bead material + PBR + emissive exact, bead bucket 624 verts (DRACO dedup
  from 702) 100% on-path, emissive set 3, both contact-shadow discs, knot/
  lamp regressions, 0 non-finite.
- Gate re-run after mutation: ALL PASS exit 0. Excalibur checkpoint: cast
  reachable at `vessel/workings/eidoverse-hero-assets` (polish-326/327
  precedent) — appending post-commit.
- Evidence: `reviews/hero-assets/polish-328-monument/` (baseline.glb =
  before-bytes captured FIRST; beads-before/ + beads-after/ = identical
  11-view live-light rigs; probes: p328-decode.ts, p328-verify-served.ts).
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) monument
  judge-named candidates — knot specular/metal response at day (polish-319
  judge #2, needs sun falsification), plaque night misread ("vent/grille"
  note, value candidate), bead saturation trim (-10% if a future judge
  flags it again).

### polish-327 — monument contact-shadow anchor (ACCEPTED, LIVE)

- Subject: `nx-town-monument` (plaza NW, pos [-7,0,-7], yaw 0.7853981633974483,
  empty comp bag; polish-owned, live 1b4cca52 == on-disk byte-exact). First
  plaza-core subject after the seven-tick fountain arc (320..326) — the
  polish-319 queue item (b) judged fresh on current pixels.
- Defect (day+night judges, ZAI fallback disclosed — no native vision
  loadable in this cron session, polish-285..326 class, native re-judge
  owed): ZERO grounding at the plinth base — both judges' unanimous #1.
  Night: grounding 3/10, "0 px of contact darkening... cannot tell if the
  plinth sits on the terrain or hovers"; day: "pasted on, binary
  perception issue, distance-independent". Engine truth (lightrig.js:70):
  point-lights never cast, so at night the monument had NO anchoring at
  all — the defect is real in the live world, not rig-limited.
- Change (ONE intervention, mkv3-monument.ts): collie-law contact shadow
  at monument scale (village canon: kfish/hog/magpi `mat(0x37452a, 1, 0)`
  discs, "the #1 floating-prop cure"). Two-step falloff per the judges'
  own spec: penumbra disc r 1.58 (~144% of tier_0 base, enclosing the
  corner radius 1.1·√2=1.556) @ y 0.004 + core disc r 1.18 (footprint +7%)
  @ y 0.008 in darker 0x2b3322; discs under tier_0's volume so only the
  rim beyond the plinth renders. Judge-noted stray dark dot ~ (525,340)
  classified AUTHORED satellite bead (mat() COLOR_0-only legacy,
  polish-289/307 class — queued as material-truth candidate, not a
  geometry defect); knotclose-view diff 0 px confirms the edit is
  confined to the ground band.
- Candidate `43c9dcf3ee52c6f30ff2c82d724fbaa25135a6419714021cf86d8c74ed1a050a`
  deterministic ×2 (mtime-verified); decode P327_DECODE_PASS (discs at
  exact radii/y-bands, 0 non-finite, polish-319 knot/bead/texture
  regressions intact, nodes 9→11 — mn3_5/mn3_6 merged buckets).
- Falsification: pixel diffs confined to the base line in every view
  (gameplay 465 px rows 444..456; approach 1506; plaquefront 10334;
  sideeast 5843; aerial 16521 full ring; knotclose 0 — under frame).
  Night A/B judge PASS: contact band drops 35–45% luminance, classic AO
  falloff signature, "the plinth now visually presses into the ground",
  zero artifacts, zero collateral. Day A/B PASS: grounding 8.5/10, hue
  natural olive 9/10, zero artifacts; one LOW non-blocking note (outer
  edge could be softer — recorded, no second edit per loop law).
- Placed via updated `next-place-monument.ts` (pins 1b4cca52→43c9dcf3):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun "already live at reviewed tuple — no verbs", live census pin
  `store/43c9dcf3ee52c6f3.glb` @ [-7,0,-7] yaw 0.7853981633974483 exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p327-verify-served.ts`, DRACO chassis p323; probe
  self-caught 3 of its own bugs RED→GREEN — color heuristic grabbed
  normals, unnormalized scale, linear-vs-sRGB lane): served DRACO keeps
  BOTH discs (mn3_5 r 1.580 y 0.004, mn3_6 r 1.180 y 0.008, flat ySpan
  0.0000) with COLOR_0 = exact LINEAR encodings of the authored sRGB
  (10,15,6 / 6,8,4 == linear(55,69,42)/(43,51,34)); knot emissive + PBR,
  bead, textures, anchors exact; 0 non-finite. P327_SERVED_PASS (13
  gates). Served-render equality: NEW durable DRACO-aware rig
  `p327-rig.ts` (struct-104/struct210 chassis) renders the served bytes —
  vs local after: 19 px day / 12 px night (knot-band DRACO
  re-quantization only, 0 px in the disc band).
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEADs
  2515bf60/2515bf60 (dress-218 absorbed mid-tick — normal interlane life).
- Ledger-repair note (ledger-hygiene class, NEW): the dress-218 append
  left a DUPLICATE running-total line mid-file (its D+0 entry made both
  totals read 2371097, so every D+0 gate pass masked it); my +1 append
  then failed the law (first total 2371097 vs run 2371098). Repair:
  removed the stale mid-file total (commit 99ad2ab7), law EXACT 2371098,
  gate ALL PASS real exit 0 verified unpiped. LAW: a duplicate-total
  failure on append means a sibling's D+0 entry hid the stale line —
  remove all but the EOF total; never re-append.
- Evidence: `reviews/hero-assets/polish-327-monument/` (before/ = live
  1b4cca52 baseline GLB + 11-view live-light rig; after/ = candidate +
  rig; served/ = served-bytes render set; probes: p327-rig.ts,
  p327-abdiff.ts, p327-verify-served.ts).
- Excalibur checkpoint: cast REACHABLE (`vessel/workings/
  eidoverse-hero-assets`) — checkpoint appended post-commit.
- Next ranked: (a) plaza-core re-survey on fresh evidence (streetlamp /
  bell / welcome families), or (b) monument judge-named candidates —
  satellite-bead material truth (COLOR_0-only legacy class, polish-289/
  307 cure), knot specular/metal response at day (judge #2 — needs sun
  falsification first), plaque night misread (judge-named "vent/grille"
  — value candidate).

### polish-329 — monument plaque inscription rhythm (ACCEPTED, LIVE)

- Subject: `nx-town-monument` (same tuple as polish-319/327/328; empty comp
  bag, census-fresh). Queue head from polish-328 close (plaque night
  "vent/grille" misread, judge-named), re-judged fresh on exact live bytes.
- Defect (ZAI judge, disclosed fallback — no native vision tool loadable in
  this cron session, polish-285..328 class, native re-judge owed): plaque
  night identity 6.5/10 — all three pline bars were uniform 0.5-wide
  full-width slats, exactly how a low-poly vent/grille is drawn; "coin flip"
  between dedication plaque and grille.
- Change (ONE edit, mkv3-monument.ts): inscription text-line rhythm —
  bar widths 0.50 / 0.40 / 0.26 (title / dedication / date), centered; the
  judge's own named cheapest fix. No other element touched.
- Candidate `d4bc6c990c713c78b4ff73403568aa44305b1ae5d6bf6a7fc778933f0e0fc237`
  deterministic x2 (mtime-verified; on-disk == live baseline cfbb31a6 was
  verified BEFORE the first rebuild).
- Falsification: pixel diffs confined to the plaque band in all 11 views
  (plaquefront 637 px [434..525, 517..544]; gameplay 74; approach 136;
  knotclose 6 at frame edge; sideeast 12; aerial 0). Night A/B judge:
  plaque identity 3/10 -> 7/10, vent gestalt collapses, "Ship B", zero new
  defects. Day A/B: 5/10 -> 8/10, correct typographic rhythm, zero defects.
  18m gameplay A/B: change imperceptible at distance (LOW, cosmetic
  close-range improvement), zero regressions — the misread it cures is the
  close/mid-range read. Judge polish notes recorded, not treated (thinner
  strokes, non-monotonic rag, 4th line).
- Placed via updated `next-place-monument.ts` (pins cfbb31a6->d4bc6c99):
  PLACED_VERIFIED, 1 upload + 1 verb, comp bag {} preserved, idempotent
  rerun "already live — no verbs", live census pin
  `store/d4bc6c990c713c78.glb` @ [-7,0,-7] yaw pi/4 exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p329-verify-served.ts`; probe self-caught 2 gate bugs
  RED->GREEN: box-vert row tolerance must exceed bar half-height 0.0225,
  and the offering bowls at |x|>=0.71 share the y/z band): served DRACO
  keeps the rhythm exact — row half-widths 0.2500/0.2000/0.1300, 72 band
  verts, plus every p319/327/328 regression (knot/bead PBR+emissive, lamp,
  2 textures, both discs, anchors) — P329_SERVED_PASS (16 gates), 0
  non-finite.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD 17a76e6f
  (struct-294 hold absorbed mid-tick — normal interlane life).
- Evidence: `reviews/hero-assets/polish-329-monument/` (before/ = live
  baseline + 11-view live-light rig; after/ = candidate + rig).
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) judge
  polish notes — thinner bar strokes / 4th date line (sub-threshold), knot
  day specular (needs sun falsification), bead saturation trim.

### polish-330 — hearth cooking kettle (ACCEPTED, LIVE)

- Subject: `nx-hearth` (village origin [0,0,0], yaw 0, 4-key comp bag:
  motion:pz_kettle pendulum + motion:well_ + particles:embers +
  sockets x5 — census-fresh this tick, captured verbatim before spawn).
  Build source `assets/mkv3-plaza.ts` -> `village_plaza3.glb` (live was
  890163cb, polish-300's flagstone-ring build; on-disk == live exact at
  survey; before-bytes captured FIRST).
- Defect (day+night ZAI judges on exact live bytes, disclosed fallback —
  no native vision tool in this cron session, polish-285..329 class,
  native re-judge owed): the hanging kettle — bare squashed sphere at the
  tripod apex, the composition's focal point — read as a placeholder
  primitive (day: "no rim, no handle, no spout, no hanging chain"; night:
  "the darkest object in the frame... actively contradicts the fire").
- Change (ONE pot intervention, inside the KEPT pz_kettle group so the
  pendulum comp swings it unchanged): tapered cast-iron body + rim torus
  + domed lid w/ knob + bail-handle arch + angled spout + three
  alternating chain links to the apex. One firelit `potIron` texMat (iron
  tones) + warm underglow emissive 0xffc98a @ 0.15 (polish-312 streetlamp
  sheen recipe — the fire-underglow BOTH judges prescribed).
- **Build-law found (texMat name-collision)**: glbwrite's texMat export
  dedupes BY NAME — a texMat("iron",...) clone with emissive silently
  reuses the plain emissive-less iron entry (name-collision variant of
  polish-311's emissive-key law). Caught RED by p330-decode before any
  render; cured by naming the material `potIron`.
- Candidate `0bb8fb0e973e6b35478378150b6589d30eaab1d1031269cc79fb0b48266bbe49`
  deterministic x2; nodes 19 / meshes 17 unchanged; materials 5->6;
  type-aware NaN scan 0 of 22344 (probe self-caught a VEC2-overread bug
  RED->GREEN); anchors fire/pz_kettle/well_* intact; kettle envelope
  y 0.940..1.738, maxR 0.297 (inside the fire column).
- Falsification: pixel diffs confined to the kettle column in all 8
  views (gameplay 510 px x[411..471]; night 489; well/benches/ring
  byte-identical). Day judge: pot reads by spout + bail + suspension
  ("unambiguous cultural signature of a cook kettle"), believable hang
  height, correct scale, zero defects; chain links at legibility
  threshold = close-range detail (recorded, not treated). Night judge:
  PASS — shaped underglow attached to the underside, painted-iron-not-
  lantern, coals decisively brightest (peak locked 0.15 vs 1.0 by
  construction), zero bloom/bleed/floating defects.
- Placed via updated `next-place-hearth.ts` (pins 890163cb -> 0bb8fb0e):
  PLACED_VERIFIED, 1 upload + 5 verbs, 4-key comp bag replayed verbatim,
  idempotent rerun zero verbs, live census pin `store/0bb8fb0e973e6b35.glb`
  @ [0,0,0] yaw 0 exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p330-verify-served.ts`; probe self-caught 2 of its own
  bugs RED->GREEN — a dead Face() line from the chassis copy, then the
  p313-law DracoFloat32Array receiver): served DRACO e3a8c083… keeps the
  whole pot (649 verts, y 0.940..1.738, maxR 0.297), potIron emissive
  [0.15,0.0876,0.0381] + texture, all 8 anchors, 0 non-finite.
  P330_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD 11750c4f
  (struct-296 hold absorbed mid-tick — normal interlane life).
- Evidence: `reviews/hero-assets/polish-330-hearth/` (before/ = live
  890163cb baseline GLB + 10-view rig; after/ = candidate + rig; probes:
  p330-decode.ts, p330-pixdiff.py, p330-verify-served.ts).
- Excalibur checkpoint: appended to
  `vessel/workings/eidoverse-hero-assets/CHECKPOINT.md`.
- Next ranked: (a) plaza-core re-survey on fresh evidence — this tick's
  day-judge notes name bench value (logs read near-silhouette), ring
  uniformity, and the SW firewood pile vs the old bench-read confusion;
  judge fresh first, or (b) hearth judge-named follow-ups (bowl interior
  warm-bounce, ring stone albedo contrast).

### polish-331 — hearth split-log benches re-grounded (ACCEPTED, LIVE)

- Subject: `nx-hearth` (village origin [0,0,0], yaw 0, 4-key comp bag,
  census-fresh; live was polish-330's 0bb8fb0e; on-disk == live exact at
  survey, determinism re-proven, before-bytes captured FIRST).
- Defect: decode-proven at source (p331-decode-bench.ts, declared
  accessor min/max) + fresh day-judge (ZAI fallback, native re-judge
  owed): the bench "flatten" scale sat on the cylinder's local Y —
  the LENGTH axis under rotation.z=PI/2 — so the intended split-flat
  tops actually squashed the 1.15m seats into 0.71m ROUND stubs sunk
  5cm (the firewood pile's own shape class; why judges kept reading
  benches as logs, 2 of 4 silhouette-only). The end-grain disc offset
  mirrored the z term (sin(-a)): all four discs sat ~45deg off their
  bench ends, floating in the grass (monument collapsed-bead class).
- Change (ONE bench-block edit, mkv3-plaza.ts): flatten the true
  vertical (local X): full 1.15m seats, split tops y 0.198, grounded
  (centerline 0.0992 = bottom exactly at grade); true-radial disc
  offset at r 2.485, matching the bench elliptical section. polish-300
  ring clearance restored to the DESIGNED 1.15m contract (tip 2.475 vs
  flag inner 2.60).
- Candidate `74f16c88b1e9c7392580997c8329c3125ff0160d507e9a91848f7ba93d70fac7`
  deterministic x2; nodes 19 / meshes 17 / materials 6 unchanged; NaN
  clean via served decode. Decode: bench y 0.00..0.20 full-length
  (±1.86 union), discs concentric (±1.87), no grass-floaters.
- Falsification (day + night ZAI judges): day — geometry CLEAN, no
  float/clip/ring-poke, 3 of 4 benches shape-readable with pale sawn
  tops (4th occluded by the tripod column — the "short front-right
  form" the judge flagged is the woodpile itself); night — CLEAN,
  grounded reads, fire > kettle > lantern hierarchy intact.
- Placed via updated `next-place-hearth.ts` (pin 0bb8fb0e ->
  74f16c88): PLACED_VERIFIED, 1 upload + 5 verbs, 4-key comp bag with
  ONE authored amendment — sockets log_* y 0.32 -> 0.25 tracking the
  re-grounded tops (tale_seat untouched; the captured bag would replay
  the stub-era height); idempotent rerun zero verbs; live census pin
  `store/74f16c88b1e9c739.glb` @ [0,0,0] yaw 0 exact.
- Served-bytes proof (struct-104 law, durable probe
  `agents/arthur/p331-verify-served.ts`): served DRACO 3afe281b…
  keeps benches y 0.002..0.197 rMax 2.480 + concentric discs + all
  anchors + potIron emissive. P331_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 (sibling HEAD 9364d854
  fauna-72, foreign).
- Evidence: `reviews/hero-assets/polish-331-hearth-bench/` (before/ =
  live 0bb8fb0e baseline GLB + 10-view rig; after/ = candidate + rig).
- Next ranked: (a) bench-top value lift (judge: tops carry the seat
  read at 18m; 2 dark benches still bottom-tier), (b) woodpile
  separation from bench (judge: strongest single fix — move pile
  beside the ring or value-split), or (c) plaza-core re-survey on
  fresh evidence.

### polish-332 — hearth firewood stack re-sited (ACCEPTED, LIVE)

- Subject: `nx-hearth` (village origin [0,0,0], yaw 0, 4-key comp bag,
  census-fresh; live was 74f16c88, polish-331's benches build; on-disk ==
  live exact at survey, before-bytes captured FIRST).
- Defect (queue head from polish-331 close, confirmed fresh by day judge on
  exact live bytes; ZAI fallback, native re-judge owed — polish-285..331
  class): the 5 loose logs at r 1.45 INSIDE the ring shared the bench bark
  color and read as scattered debris merging with the seats — only 2-3 of 4
  benches parsed at 18m; the big log mass read as clutter ~0.5m from the
  focal fire. Judge's own #1 fix: move the pile beside the ring + value-split.
- Change (ONE intervention, mkv3-plaza.ts firewood block): deliberate stack
  at 202.5deg OUTSIDE the ring (center r 3.75, in the deliberate 18deg flag
  gap): 2 split-log bearers + 6 logs in 2 radial courses (4+2, top skewed
  20deg — crisscross), sawn cut faces outward, bark one step lighter
  (0x6c5426 -> 0x7a6234) + end-grain popped 2 steps (0x9e8e46 -> 0xb59d55).
  Zero wood remains inside r 3.0 (decode-proven).
- Candidate `ad165b6ee4f0d0e45337f74596ed5c2b27191e01ca7d1af45a24c8f561519b01`
  deterministic x2; nodes 19 / meshes 17 / materials 6 unchanged (merges
  into 2 COLOR_0 buckets pz3_6/pz3_7); NaN scan 0/3544. Decode: bark r
  3.221..4.122 y -0.009..0.358 theta 192..213; old debris zone now holds
  only flags (255,255,255 texture-white) + stone.
- Falsification (ZAI fallback disclosed): pile-day SHIP (deliberate stack
  on bearers, organized courses, cut faces visible; judge's one conditional
  — peak-vs-flag contact — resolves CLEAN by decode: wood band r 3.41..4.10
  vs flags outer 3.30, disjoint; 2D contact was projection of flags behind
  the stack); pile-night PASS (grounded store, fire/kettle still brightest,
  zero bloom/bleed/float); gameplay-18m SHIP — bench legibility 3/4 -> 4/4,
  stack reads as outside-the-ring fuel store, hierarchy unchanged. Pixel
  diffs confined to the SW wood zones in all 9 views (gameplay 993 px band
  y[392..413] = debris removal + distant stack; zero collateral).
- Placed via updated `next-place-hearth.ts` (pins 74f16c88 -> ad165b6e):
  PLACED_VERIFIED, 1 upload + 5 verbs, 4-key comp bag replayed verbatim
  (sockets amendment retained, idempotent on the live 0.25 bag), idempotent
  rerun zero verbs, live census pin `store/ad165b6ee4f0d0e4.glb` @ [0,0,0]
  yaw 0 exact.
- Served-bytes proof (struct-104 law, durable probe `p332-verify-served.ts`,
  p331 DRACO chassis): served 7d862f41… P332_SERVED_PASS — bark bucket r
  3.410..4.099 theta 192..213 (nothing inside 2.95), cut faces r 3.974..4.122
  at the outer ends, bench/grain/potIron regressions exact, 0 non-finite.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD 1fb3b028
  (dress-226 absorbed mid-tick — normal interlane life).
- Evidence: `reviews/hero-assets/polish-332-hearth-woodpile/` (before/ =
  live baseline GLB + 10-view rig incl. dedicated pile views; after/ =
  candidate + rig; probes: /tmp/p332-decode3.ts chunk-walk audit,
  p332-verify-served.ts durable).
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) judge
  polish notes — stack contact-shadow under the bearers (18m judge "placed
  on" note, collie-law candidate), optional bark-vs-bench tint widening
  (recorded, one intervention per tick).

### polish-333 — hearth pile contact shadow (ACCEPTED, LIVE)

- Subject: `nx-hearth` (village origin [0,0,0], yaw 0, 4-key comp bag,
  census-fresh; live was ad165b6e, polish-332's firewood stack build;
  on-disk == live exact at survey, before-bytes captured FIRST).
- Defect (queue head from polish-332 close, confirmed fresh by day+night
  judges on exact live bytes; ZAI fallback, native re-judge owed —
  polish-285..332 class): "zero contact evidence where the bearers meet
  the grass" (day 6/10, night 3/10 — "placed ON the scene rather than IN
  it"). Engine point-lights never cast (lightrig.js), so a baked anchor is
  the only cure.
- Change (ONE intervention, mkv3-plaza.ts): two-step collie-law contact
  shadow under the pile — penumbra + core discs (24-gon, rotated YXZ to
  the radial axis at 202.5deg). Four measured judge rounds: r1 monument
  hues 0x37452a/0x2b3322 at footprint scale read "dark puddle" 65-75% +
  overshoot past log ends (KEEP A); r2 lighter but same fails (KEEP A);
  r3 geometric discovery — the log courses ride ELEVATED on the bearers
  (y 0.155/0.29), so any disc reaching the log-end radius shows as bare
  crescent; r4 hugs the BEARER band only (radial 3.57..3.93 / 3.61..3.89,
  tangential 0.66/0.52) with rig-calibrated values 0xeaeecc/0xa4aa84
  (renders ~2% iso-luminant warm pen tint + 39% core strip).
- Candidate `69ccd14a7d01901fb62b2e12cd52c8147ecccfddccb140e2fa376ba2cb75e602`
  deterministic x2; nodes 19 / meshes 20 / materials 6 unchanged counts;
  discs merge as new buckets pz3_8/pz3_9 (COLOR_0 lane, +2 meshes — bucket
  renumber shifts well buckets, extents byte-identical).
- Falsification (ZAI fallback disclosed): r4 day A/B SHIP B — "two-layer
  construction mimics true contact occlusion... no visible hard boundary...
  doesn't read as a decal... fixes the stack being the only ungrounded
  prop in the scene" (the judge's own scene-consistency observation). r4
  night A/B SHIP B — grounded, fire glow hierarchy intact, zero artifacts.
  Pixel diffs confined to the pile zone in all 10 views (pile 2623 px x
  [339..622] y[366..433]; kettle/ring/benches byte-identical).
- Placed via updated `next-place-hearth.ts` (pins ad165b6e -> 69ccd14a):
  PLACED_VERIFIED, 1 upload + 5 verbs, 4-key comp bag replayed verbatim
  (sockets 0.25 amendment retained), idempotent rerun zero verbs, live
  census pin `store/69ccd14a7d01901f.glb` @ [0,0,0] yaw 0 exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p333-verify-served.ts`, p332 chassis): served DRACO
  f004c012… P333_SERVED_PASS — both discs flat at 0.0040/0.0080, radial
  bands + theta centered 202.5 exact, >= 20 verts, all p330/331/332
  regressions (potIron, pile bark/faces, bench/grain) intact, 0
  non-finite.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD b3e7737f
  (sweep-384, foreign).
- Evidence: `reviews/hero-assets/polish-333-hearth-pileshadow/` (before/ =
  live ad165b6e baseline GLB + 10-view rig; after/ = candidate + rig;
  probes: /tmp/p333-rig.ts, p333-decode rounds, p333-probe band analyses,
  p333-verify-served.ts durable).
- Excalibur checkpoint: appending to
  `vessel/workings/eidoverse-hero-assets/CHECKPOINT.md`.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) judge
  notes — night fire-rim warm tint on the pile (judge #1 night note,
  recorded not treated), scene-wide AO consistency is the live engine's
  own lighting law, not a per-model defect.

### polish-334 — hearth pile fire-rim (ACCEPTED, LIVE)

- Subject: `nx-hearth` (village origin [0,0,0], yaw 0, 4-key comp bag,
  census-fresh; live was ad165b6e→69ccd14a lineage; on-disk == live 69ccd14a
  exact at survey, before-bytes captured FIRST).
- Defect (queue head from polish-333 close — its night judge's #1 note —
  confirmed fresh this tick by a new ZAI judge on exact live bytes,
  disclosed fallback, native re-judge owed — polish-285..333 class): the
  fuel store read at night 2.5-3/10 — "night obstacle on the grass, not
  fuel for that fire… zero warm-light linkage" — silhouette-only, interior
  a hole, bark ~#141008 black. Root: `mat(0x7a6234, .95, 0)` COLOR_0-only
  + the engine never casts light from the fire emissive (lightrig.js) —
  the pile cannot be lit by anything.
- Change (ONE intervention, polish-316 cast-light lineage): faint fire-rim
  warm wash baked into the pile BARK only — shared material instance
  `pileBark` (0x7a6234 + emissive 0xffc98a @ 0.055) on bearers + both log
  courses; sawn cut faces stay neutral (they face SW, AWAY from the fire —
  the split preserves the directional hint); bench bark 0x6c5426 untouched
  (seats are seats; the pile alone is the fire's store). Night ladder
  fire 1.0 > kettle 0.15 > pile fire-rim 0.055 (far under smolder reads).
- Candidate `8f095330ef8bc1c7…` deterministic ×2 (mtime-verified);
  P334_DECODE_PASS (glow4 factor [0.055,0.0321,0.014] bound by exactly
  pz3_6, pile radial/y extents unchanged, NaN 0/368, potIron/fire/anchors
  intact; probe self-caught its own missing-glow5-whitelist bug
  RED→GREEN). Pixel diffs confined to the pile locus in all 10 views
  (pile-night 10338 px warm-lift 100%, bbox x[330..632] y[309..404];
  gameplay-night 970; day maxDelta 80 on shadow-side bark only).
- Falsification: night A/B judge PASS all four items — pile now reads as
  "fuel store lit by the hearth" (tonally rhymes with the lit bucket),
  bark-only distribution is the correct tell vs smolder (cut faces dark),
  fire decisively #1, zero new defects; watch-items recorded: peak
  headroom (do not raise intensity), directionality gradient (optional),
  cut-face near-black contrast (optional). Day A/B judge PASS —
  sub-perceptual in sun, no halo/banding, change trapped inside dark
  end-grain dots reading as heartwood figure; canary pixels named
  ((437..524, 351..353) — first to read as embers if ever raised).
- Placed via updated `next-place-hearth.ts` (pins 69ccd14a -> 8f095330):
  PLACED_VERIFIED, 1 upload + 5 verbs, 4-key comp bag replayed verbatim
  (sockets 0.25 amendment retained), idempotent rerun zero verbs, live
  census pin `store/8f095330ef8bc1c7.glb` @ [0,0,0] yaw 0 exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p334-verify-served.ts`, p333 DRACO chassis): served
  DRACO 265e1aa2… keeps glow4 [0.055,0.0321,0.014] EXACT bound to pz3_6
  only, all p330..333 regressions (potIron underglow, cut faces,
  benches/grain, both contact-shadow discs, anchors), 0 non-finite.
  P334_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEADs
  106ba951/fd787f79 (dress-229v absorbed mid-tick — normal interlane
  life).
- Evidence: `reviews/hero-assets/polish-334-hearth-firerim/` (before/ =
  live 69ccd14a baseline GLB + 10-view rig; after/ = candidate + rig;
  probes: agents/arthur/p334-decode.ts, /tmp/p334-abdiff.py one-shot).
- Excalibur checkpoint: appending to
  `vessel/workings/eidoverse-hero-assets/CHECKPOINT.md`.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b) judge
  watch-items — pile peak-intensity headroom law (never raise), optional
  directionality gradient, optional cut-face neutral lift.

### polish-335 — carousel scenery panel-ring re-author (ACCEPTED, LIVE)

- Subject: `nx-carousel` @ polish-299 bytes `3ed80c49` (September-verdict
  pin; on-disk served == live identity at survey, fresh census 7-key bag).
  First resume tick after Bill's September wave verdict (hold lifted).
- Survey (NEW DRACO-aware rig `agents/arthur/p335-rig.ts`, p327 chassis,
  11 views of exact live served bytes; ZAI fallback disclosed — no native
  vision tool loadable in this cron session, polish-285..334 class, native
  re-judge owed): DAY 6/10 — panel band (225,208,186) vs bone horse head
  (224,210,186) Δ≈0, hero coat dissolving into the backdrop at EVERY
  rotation phase (far panels back every near horse head — phase-persistent,
  not phase-transient); panels read as floating cards (decode: flat quads
  y 3.00..4.28, 0.66m air gap below cone underside at r 2.6). NIGHT 5/10 —
  panels (emissive .213) + bone (.254) the brightest large masses,
  architecture outshining lanterns — hierarchy inverted.
- Change (ONE intervention, new production step `carousel-horse-prototype/
  panelring.ts`, scenerysep chassis): value drop base [0.87,0.76,0.58] →
  [0.63,0.52,0.40], emissive [0.28,0.20,0.15] → [0.125,0.10,0.085]; hung-
  cloth geometry — scalloped swag hem (corners 3.00, mid-dip 2.90; head
  clearance 2.75 law kept) + 3-column grid; one 7cm strap per panel r 2.60
  → 2.52 tilted inward, y 4.281..4.90, tucking under the cone slope.
  Same node/material name; spin subtree, sockets, motion roots, all other
  materials untouched.
- BUILD-LAW (RED caught pre-placement): adding a SECOND primitive to
  cr_scenery_ring produced a garbage duplicate (decoded extents r 0..1.79,
  y {0,4.9}) rendering as a cream wedge near the boarding stair — caught
  by decode3 + the A/B judge, root-caused by unprojection (zero ray hits),
  CURED by deleting the added primitive (single rewritten primitive carries
  panels+straps). Accessor law reaffirmed: one primitive, plain
  createAccessor(). Rejected v1 `881dd1be`; evidence flagcrop in reports/.
- Accepted v2 `3d4550fac7d1cf21…` deterministic ×2; 49 nodes / 27
  materials unchanged; single prim 160 verts / 96 tris, y 2.9..4.9,
  r 2.52..2.60 exact.
- Falsification: pixel diffs confined to the panel band in all 11 views
  (gameplay 20406 px; aerial 1 px = canopy overhang law holds; lantern/
  crown/teeth/plinth probes byte-identical). Day A/B judge: bone-horse
  separation HIGH impact (full silhouette reads), hung-cloth MEDIUM-HIGH,
  wedge absent, zero new defects — slightly better (18m is incremental by
  nature). Night A/B judge: hierarchy FIXED (spire/lanterns unambiguously
  brightest), white horse pops, "lit machine not glowing box", zero new
  defects — CLEARLY better. Watch-item recorded: navy-horse edge contrast
  slightly reduced by the dim-down (one intervention per tick).
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED, 1 upload + 8
  verbs, 7-key comp bag replayed verbatim, idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0), live census pin
  `store/3d4550fac7d1cf21.glb` @ (-18, 0.0001495, 18) yaw 2.35619 exact.
  Served sha == upload sha (identity); P335_SERVED_PASS (1 prim, 160 verts,
  extents + factors exact in served DRACO).
- Gate re-run after mutation: ALL PASS exit 0 at absorbed sibling HEAD
  b382ebd1 (sweep-388 — normal interlane life).
- Excalibur checkpoint: appended to `vessel/workings/eidoverse-hero-assets/
  CHECKPOINT.md`.
- Evidence: `reviews/hero-assets/polish-335-carousel-panelring/` (before/ =
  live served baseline + 11-view rig; after/ = v2; reports/ = deploy dry/
  apply/idem + verified served + rejected-v1 flagcrop; probes:
  p335-rig.ts, p335-decode/2/3.ts).
- Next ranked: (a) navy-horse night edge (watch-item; judge fresh —
  whisper panel lift BEHIND navy only would be the surgical form, but
  violates uniform-ring simplicity; default no-action), or (b) plaza-core
  re-survey on fresh evidence (belltower/deck/boarding views of the new
  ring at 5m from the next tick's survey), or (c) the residual judge
  polish notes (deeper swags at close range, panel warm tint).

### polish-336 — carousel panel-ring cloth read (ACCEPTED, LIVE)

- Subject: `nx-carousel` @ polish-335 bytes `3d4550fa` (on-disk verified-served
  == live identity at survey; fresh census 7-key bag). Queue head from
  polish-335's close: judge the re-authored ring at the un-judged 5m views.
- Survey (fresh p335-rig renders of exact live bytes, boarding + deck day;
  ZAI fallback disclosed — no native vision tool loadable in this cron
  session, polish-285..335 class, native re-judge owed): ring clean but
  reads as flat uniform CARDS — swag below threshold (dip 0.10m = 7% of
  panel height; judges name 15-20% legible), identical-panel copy-paste
  repetition, straps invisible (same COLOR_0 as panel), fill reads
  desaturated gray ("placeholder slab"). Judges' "short floating panels"
  item FALSIFIED at source: all tops y 4.28 with straps 4.281..4.90 —
  projection of the 6.5deg slits, not geometry.
- Change (ONE cloth-read intervention, new production step
  `carousel-horse-prototype/clothswag.ts`, panelring chassis): alternating
  deep/shallow swag hems (odd panels mid-dip 2.80 = 15.6% of height, even
  2.94; head clearance 2.75 law kept, min hem 2.78); per-vertex COLOR_0
  drape gradient 0.80 top -> 1.0 hem; strap tape COLOR_0 0.35 (binding-tape
  read); baseColor warmed at constant luminance [0.63,0.52,0.40] ->
  [0.71,0.52,0.38]. Night emissive UNTOUCHED (polish-335 hierarchy holds).
- Candidate `c0c8c565e244bbc3…` deterministic x2 (49 nodes unchanged;
  160 verts / 96 tris). P336 decode: 0 non-finite of 404098 floats;
  exactly ONE material diff (scenery baseColor, emissive identical);
  geometry drift confined to cr_scenery_ring d=0.100 exactly (the hem);
  COLOR_0 range [0.35,1.0]; extents r 2.6 / hem 2.80 / strap 4.899 exact.
- Falsification (ZAI fallback disclosed): boarding-day A/B — identical-card
  read destroyed, long-short rhythm visible, warm intentional fill, zero
  new defects; deck-day A/B — "hanging boards" 60% toward cloth, warmth
  working, horses now judged the strongest element (judge residuals:
  gradient below 5m perception floor, straight hems, straps 1-2px —
  recorded). Deck "long panels hide horse heads" dispositioned as rig
  vantage (camera y 3.4 outside the r 2.6 ring shoots down THROUGH the near
  panels; no occupied vantage does — rider eye 3.3 looks out over hems,
  boarder eye 2.2 sight lines cross under the 2.80 hem; boarding judge
  confirms zero obstruction). boarding-night A/B PASS — panels read as dim
  hung cloth, hierarchy lanterns > teeth > ceiling > horses > panels > sky,
  all four coats distinct, no glow-wall, zero new defects.
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED, 1 upload +
  8 verbs, 7-key comp bag replayed verbatim; idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin `store/c0c8c565e244bbc3.glb`
  @ (-18, 0.0001495, 18) yaw 2.35619 exact. Served DRACO 9b13ed64…
  P336_SERVED_PASS — hem/straps/gradient/COLOR_0 range/scenery factors all
  exact in served decode, 0 non-finite (horse-material baseColor diffs are
  the store's texture-baking re-encode; every emissive identical).
- Evidence: `reviews/hero-assets/polish-336-carousel-boarding/` (before/ =
  live baseline GLB + 11-view rig; after/ = candidate + rig; reports/ =
  baseline-entity + deploy dry/apply/idem + verified served bytes).
  Probes: `agents/arthur/p336-decode.ts` durable (self-caught 2 probe bugs
  RED->GREEN: getAttributes API misuse; uint8-as-float NaN overread).
- Excalibur checkpoint: appending to `vessel/workings/eidoverse-hero-assets/
  CHECKPOINT.md`.
- Next ranked: (a) judge polish notes — per-panel 1-2deg yaw skew + wider
  darker straps (deck judge's named cheapest drape wins; one intervention
  per tick), or (b) plaza-core re-survey on fresh evidence.

### polish-337 — carousel panel-ring skew + binding straps (ACCEPTED, LIVE)

- Subject: `nx-carousel` @ polish-336 bytes `c0c8c565` (on-disk verified ==
  live identity at survey; fresh census 7-key bag). Queue head from
  polish-336's close: the deck judge's named cheapest drape wins.
- ONE intervention (new production step `carousel-horse-prototype/skew.ts`,
  clothswag chassis): per-panel alternating 2deg YAW twists about each
  panel's own arc-mid + straps widened 0.035->0.055m arc, darkened COLOR_0
  0.35->0.24. Hems, drape gradient, base color, night emissive untouched.
- r1 boarding judge (ZAI fallback disclosed, native re-judge owed) exposed a
  REAL 0.146m air gap: strap tops y 4.90 vs canopy skin y 5.046 at r 2.52
  (decoded from exact bytes — an orbit-rotation of the straps was rejected at
  design time; the gap was always there, the new dark tapes made it legible).
  Cured in-family same tick: Y_STRAP_HI 4.90->5.06, a 14mm angled pierce
  occluded from below by the skin itself (aerial delta 44px = rim ticks).
- r2 `b1f1154962631d22…` deterministic x2; 49 nodes unchanged; 0 non-finite
  of 404098; zero material diffs; extent drift exactly cr_scenery_ring
  0.16m (the strap extension); frame-independent radial signature exact in
  local AND served DRACO (32 bulged r 2.6127 = 2.6+0.3628·sin2°, mids
  2.6000, y-set {5.06×32, 4.28×80, 3.00×32, 2.80/2.94×16}, slits alternating
  6.47/7.41deg — probe `agents/arthur/p337-radialproof.ts` durable).
- Falsification (ZAI fallback disclosed): boarding r2 — no gap visible, no
  new defects, hung-read holds; deck A/B — straps "the most successful
  change in the build", wedge gaps "read as natural cloth hung by hand, not
  errors", zero new defects, horses/deck/columns/roof unchanged. Watch-items
  recorded: 2deg skew at the perception threshold (4-6deg would require
  narrowing panels to keep slit floors — next decision point, one
  intervention per tick); perspective "inconsistent tape width" is inherent
  to a flat-strap ring (edge-on vs face-on), not treated.
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED, 1 upload + 8
  verbs, 7-key comp bag replayed verbatim; idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin `store/b1f1154962631d22.glb`
  @ (-18, 0.0001495, 18) yaw 2.35619 exact. Served DRACO carries the exact
  skew signature (P337 radial proof on verified.served bytes).
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD 64f08592
  (dress-235, foreign — normal interlane life).
- Evidence: `reviews/hero-assets/polish-337-carousel-skew/` (before/ = live
  c0c8c565 baseline GLB + 11-view rig; after/ = candidate + rig; reports/ =
  baseline-entity + deploy dry/apply/idem + verified served bytes).
- Next ranked: (a) skew amplitude decision — 4-6deg + narrowed panels (deck
  judge's priority-1; compositional change, judge fresh first), or (b)
  plaza-core re-survey on fresh evidence, or (c) strap shade one notch
  darker (LOW judge note).

### polish-338 — carousel skew amplitude + twisted normals (ACCEPTED, LIVE)

- Subject: `nx-carousel` @ polish-337 bytes `b1f11549` (on-disk verified == live
  identity at survey; fresh census 7-key bag). Queue head from polish-337's
  close: the skew-amplitude decision, judged fresh first.
- Survey (ZAI fallback disclosed — no native vision tool loadable in this cron
  session, polish-285..337 class, native re-judge owed): deck-day 5m band of
  exact live bytes — hung-cloth read 2/10; the 2deg skew "produces no visible
  effect". Judge root cause MATCHED SOURCE: polish-337 twisted panel POSITIONS
  but left every NORMAL dead-radial, so the yaw-skew cue (perceived through
  differential shading) had nothing to act on. Geometrically present,
  functionally absent.
- ONE intervention (new production step `carousel-horse-prototype/skewamp.ts`,
  skew.ts chassis): SKEW_DEG 2->5 (judge band 4-6, midpoint) + ARC_DEG
  16->13.5 (slits 6.5->9.0deg wide — first-order porosity) + NORMALS twisted
  with each panel (the polish-337 omission; correctness, not ornament).
  In-build asserts: per-vertex normal deviates from lattice radial by exactly
  sgn*5deg (1e-9), hem clearance 2.75 law, 160 verts / 96 tris exact.
- Design-record correction: the slit-floor arithmetic that fired the first
  assert exposed the honest geometry — a yaw twist about a panel's own center
  displaces corners ~2.7cm RADIALLY (angular slit change second-order;
  polish-337's "~2.5cm slit alternation" comment overstated). The legible
  channel is the normal twist: adjacent panels' sun response differs up to
  17% — the shading alternation the judges named. Comments corrected; no
  geometry built on the wrong model.
- Candidate `193c897dd511b5e050cf4dddf34d2c18a8793ab81fbae631d864bef666bfca8f`
  deterministic x2; 49 nodes / 96 tris unchanged; decode: zero material diffs
  (night hierarchy untouched by construction), drift confined to
  cr_scenery_ring d=0.0087 (corner bulge 2.6087 = analytic exact), 0
  non-finite of 404098.
- Falsification (ZAI fallback disclosed): deck-day A/B CONDITIONAL SHIP ->
  resolved: items 2/3 PASS HIGH (wider slits read as separate hung panels —
  sky + far panels + center pole now visible through genuine gaps; "the
  win"), item 1 shading PASS-WEAK (present, directionally correct, few
  percent — watch-item: per-panel albedo jitter would amplify, NOT this
  tick); the one flagged artifact (dark tick in far-left slit) ray-classified
  by probe `p338-artifact-probe.ts`: pixel hits a shadowed FAR-SIDE panel
  through the widened slit (baseline: near panel at same pixel) — revealed
  structure, the porosity win itself, not stray geometry. boarding-day A/B
  PASS (panel individuation achieved, porosity reads as depth not clutter,
  zero foreground regressions); strap-band A/B ATTACHED-SECURE (all anchors
  hold under 5deg skew). Watch-items: right-side gap reads "opening" at 5m —
  do not widen further; verify shading does not strobe in motion (client
  check; skew sign alternates per panel so spin sweeps bright/dark steadily).
- Placed via sanctioned `deploy.ts --apply`: PLACED_VERIFIED, 1 upload + 8
  verbs, 7-key comp bag replayed verbatim (baseline-entity.json regenerated
  fresh from live census — polish-293 law); idempotent rerun
  ALREADY_TARGET_VERIFIED (0/0); live census pin `store/193c897dd511b5e0.glb`
  @ (-18, 0.0001495, 18) yaw 2.35619 exact, comp bag deep-equal.
- Served-bytes proof (struct-104 law, NEW durable probe
  `agents/arthur/p338-verify-served.ts`): P338_SERVED_PASS — radial
  histogram 32/32/64/32 exact (out-corners 2.6267 / in-corners 2.5732 /
  mids+strap-bottoms 2.60 / strap-tops 2.52), y-set exact, panel normals at
  5deg 96/96 with alternating sign, scenery emissive [0.125,0.10,0.085]
  exact, 0 non-finite. Probe self-caught 2 of its own bugs RED->GREEN
  (own-position radial reference; panel-major index assumption that
  DRACO reordering broke) — final form is ORDER-INDEPENDENT and proven
  discriminating on the negative control (polish-337 bytes fail 0/96).
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD 30bbe324
  (advanced mid-tick from d367c391 — absorbed, normal interlane life).
- Evidence: `reviews/hero-assets/polish-338-carousel-skewamp/` (before/ =
  live served baseline + 11-view rig; after/ = candidate + rig; reports/ =
  baseline-entity + deploy dry/apply/idem + verified served bytes +
  ab-pixdiff.json). Probes: `agents/arthur/p338-verify-served.ts`,
  `agents/arthur/p338-artifact-probe.ts` durable (three.js raycaster
  pixel-classification chassis — p335-rig server + fixed-camera raycast).
- Excalibur checkpoint: appending to
  `vessel/workings/eidoverse-hero-assets/CHECKPOINT.md`.
- Next ranked: (a) plaza-core re-survey on fresh evidence (ring now reads
  cloth at 5m; next weakest core element by fresh judge), or (b) per-panel
  albedo jitter follow-up (deck judge's amplifier — low priority, one
  intervention per tick), or (c) strap shade one notch darker (LOW note).

### polish-339 — mapboard roads out of the village (ACCEPTED, LIVE)

- Subject: `nx-town-mapboard` (same tuple as polish-301..303, empty comp bag,
  census-fresh; live was 02f6cb96442af8cd, polish-303's gates build — the
  least-recently-judged subject still at a polish pin, 09-19 07:44).
- Defect (third independent judge, ZAI fallback disclosed, native re-judge
  owed — polish-285..338 class): 18m reader-side read "sign with wheel
  emblem, not a map" — every outlying chip floated on bare parchment
  because ALL spokes stop at the ring; the p301/p303 convergent
  "settlements at crossroads" recipe was half-delivered (gates yes, roads
  no). Source-true: spokes end at authored 0.83.
- ONE intervention (mkv3-mapboard.ts): 8 road extensions ring centerline
  0.83 -> fringe 1.30 — cardinals run under the gate plaques (road-under-
  gate p303 language), diagonals to the districts; waylamp rides the SW
  ray; quarry (1.74) + whisper (1.73) stay beyond the fringe (the road
  fades before the unknown). inkMat family (merges; no new
  material/node), 0.05 width; z-ladder front -0.0358 (0.3mm proud of
  parchment, 0.2mm behind chip plane so chips read ON roads, 3cm behind
  plaques). Torus crest -0.066 = reader extreme unchanged (b22 law).
- Candidate `db9e564dbf0166f8…` deterministic ×2 (mtime-verified);
  p339-decode multiset diff: +192 verts = exactly 8×24 at analytic radii
  0.4158..0.6505 on all 8 rays, ZERO removed, 0 non-finite, 29/29/26
  nodes/meshes/materials unchanged. Pixel diffs map-side ONLY (back 937px
  close / 249px 18m / 254px night; every other view byte-identical).
- Judges: close-range A/B SHIP (4 cardinals continuous to fringe, chips
  read as settlements on roads — E grainfield / N road-cap / W mid-road,
  single-road junctions, zero regressions, "settlement network vs wheel
  emblem"); 18m HOLD dispositioned — extensions are approach-range detail
  by the board's own source contract (polish-16 floors law; 18m skeleton
  unchanged + eye-gate-approved); "stripes" = pre-existing tangential
  chip row (byte-identical); diagonal-shortness = tilt foreshortening.
- Placed via updated `next-place-polish301-mapboard.ts` (pins
  02f6cb96→db9e564d): PLACED_VERIFIED, 1 upload + 2 verbs, comp bag {}
  preserved, idempotent rerun ALREADY_LIVE_NO_VERBS, live census pin
  `store/db9e564dbf0166f8.glb` @ (2.5,0,9.5) yaw -2.9441970937399127.
- Served proof (NEW durable probe `p339-verify-served.ts`; first draft
  self-caught RED — filtering inside the DRACO read loop, rewritten on the
  proven p303 chassis): served DRACO keeps all 8 extensions — uniform +12
  verts per ray vs p303 served control, ink envelope 1.79, 0 non-finite.
- Gate re-run after mutation: ALL PASS real exit 0 at absorbed sibling
  HEAD ab2cb14c (sweep-395). Evidence:
  `reviews/hero-assets/polish-339-mapboard/` (before 13-view + baseline;
  after rig; ab-back / ab-backgameplay panels).
- Next ranked: (a) belltower (p311 pin, 09-19) or streetlamps (p312 pin)
  fresh survey — the least-recently-judged pinned plaza-core subjects, or
  (b) the 18m judge's amplifier (thicker cardinal roads / larger diagonal
  chips — falsify at 18m first).

### polish-340 — belltower belfry lantern re-author (ACCEPTED, LIVE)

- Subject: `nx-town-belltower` (same tuple as polish-306..311; ladder
  comp). Build source `assets/mkv3-landmarks.ts` (belltower block) ->
  `village_belltower3.glb` (live was 63599990, polish-311's cage build —
  the least-recently-judged pinned plaza-core subject).
- Fresh survey (NEW `p340-rig.ts`, p311 chassis, 14 views of exact live
  bytes; ZAI fallback disclosed — no native vision loadable this cron
  session, polish-285..339 class, native re-judge owed): day 18m the lamp
  read as a "bare saturated yellow dot"/artifact — cage posts 1.3px, hood
  4px, dark iron dissolved into the shadowed belfry; night BOTH judges
  read "floating pixel / detached ember" — the tower's sole night signal
  was sub-resolution (p312's identical streetlamp class). One crownClose
  judge claim ("finial absent") falsified at source (p308 decode lineage)
  — framing artifact, discarded.
- DEP-DRIFT FINDING (disclosed): HEAD-source rebuild of the UNTOUCHED
  script gives 3d99b847, not live 63599990 — the dep chain (mergekit KEEP
  widenings etc.) changed bytes without source change. Decode-diff: live
  vs HEAD-source structurally IDENTICAL (12/11/4, zero node/material
  diffs) — serialization-only. Candidate evaluated against this
  proven-equivalent baseline; round-trip git-checkout rebuild reproduced
  63599990 at p311's era deps is NOT current law — record this drift.
- Change (ONE intervention, p312 streetlamp-head idiom at belltower
  scale): hanging lantern OFF the cap-ring corner eave in open air —
  bracket plate laged on the ring face + drop strap + yoke + twin bail
  straps + lantern body (base, glass core 0.14x0.26 = 2.4x area,
  overhanging eave, pyramid roof, finial) at radial 2.02, y 5.38..6.01,
  clear of the cap cone (polish-272 overhang law). Old sub-pixel cage +
  lamp_hood removed. Core KEEP-named `lamp`, glow3 emissive
  [0.9,0.5257,0.2287] carried over exact; iron whisper 0.02 kept. Bbox
  UNCHANGED (fixture max axis extent 1.598 < base 1.7).
- Candidate `886a06156db18add…` deterministic ×2; NaN 0/10584 (upload
  bytes); nodes 12→11. Judges: day A/B CLEARLY BETTER (support+mass+form
  legible, zero new defects); night A/B CLEARLY BETTER (housed landmark
  signal, restraint correct, no ghost of the old bead); close-range 4/4
  PASS (clean removal, plausible forged hardware, bell dominant). Judge
  nits recorded not treated: strap thin at 25m+, no bounce light (rig has
  no point lights).
- Placed via NEW `next-place-polish340-belltower.ts` (pins
  63599990→886a0615): PLACED_VERIFIED, 1 upload + 3 verbs, ladder comp
  replayed verbatim, rider b5 standing, idempotent rerun
  ALREADY_LIVE_NO_VERBS; live census pin `store/886a06156db18add.glb` @
  (6.5,0,6.5) yaw -2.35619 exact.
- Served proof (NEW durable `p340-verify-served.ts`; self-caught its own
  radial-gate bug RED→GREEN, analytic corner radial 2.0911): served DRACO
  keeps census 11/10, anchors bell/bell_0/bell_1/lamp, both emissives
  exact, lamp locus exact, 0 non-finite. P340_SERVED_PASS.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD a01946de
  (struct-324 absorbed — normal interlane life).
- Evidence: `reviews/hero-assets/polish-340-belltower/` (before/ = live
  baseline + 14-view rig; after/ = candidate + rig; ab-*.jpg A/B panels).
  Probes: p340-rig, p340-decode-diff, p340-nan, p340-verify-served.
- Next ranked: (a) streetlamps (p312 pin) fresh survey — now the
  least-recently-judged pinned plaza-core subject, or (b) plaza-core
  re-survey on fresh evidence.

### polish-341 — streetlamp glass cage (ACCEPTED, LIVE)

- Subject: `nx-town-streetlamps` (ground-layer network at origin, pos
  [0,0,0], yaw pi, EMPTY comp bag — census-fresh this tick). Build source
  `assets/mkv3-lamp33.ts` -> `village_streetlamps3.glb` (live was a7b05aef,
  polish-312's lantern-head build; on-disk == live exact at survey,
  before-bytes captured FIRST). Queue head from polish-340's close: the
  least-recently-judged pinned plaza-core subject.
- Survey (NEW 12-view rig `p341-rig.ts`, p340 chassis; ZAI fallback
  disclosed — no native vision tool loadable in this cron session,
  polish-285..340 class, native re-judge owed): near-night 7/10 and day
  6.5/10 judges CONVERGED on one defect — the glass core read as a bare
  glowing slab "clamped top and bottom" / "lampshade on a stick", the
  head's largest surface with zero ironwork. gp18-night 7/10 (p312 cures
  hold: lamps read as lamps, not floating dots).
- Change (ONE intervention, mkv3-lamp33.ts): glass cage — four iron corner
  posts per lantern (0.025 sq, half-proud of the glass faces at corner
  offset 0.075, y 2.36..2.63 seating collar-to-eave), all 8 lamps, +768
  verts (32 x 24). merges into the existing iron bucket — nodes 24 /
  meshes 16 / materials 2 UNCHANGED; both emissive materials untouched.
- Candidate `9b8cdb73051beb5eaf7821c3581f1863f4c55683e1bbcf022e317a196083711e`
  deterministic x2 (mtime-verified). Decode (p341-decode.ts, probe
  self-caught its own GLB-chunk-NUL + bufferView-offset bugs RED->GREEN):
  +768 verts exact, 0 non-finite, y extent 0..2.947 (census bbox exact).
- Falsification: pixel diffs confined to lantern-head zones in all views
  (near 3941 px; base-day 0 px = perfect control; aerial 104 px = the 8
  head dots at r10). Judges: night A/B CLEARLY BETTER ("glowing glass
  panes in an iron frame", zero night penalties); day A/B ship ("framed
  lantern", no defects, nit: posts read dark-brown not near-black iron —
  recorded); 18m night A/B BETTER (framing detail at zero legibility
  cost; watch-item: aliasing in motion at ~35m — client check, recorded).
- Placed via updated `next-place-polish312-streetlamps.ts` (pins
  a7b05aef -> 9b8cdb73): PLACED_VERIFIED, 1 upload + 1 verb, comp bag {}
  preserved, idempotent rerun zero verbs, live census pin
  `store/9b8cdb73051beb5e.glb` @ (0,0,0) yaw pi exact, bbox unchanged.
- Served-bytes proof (struct-104 law, NEW durable probe
  `p341-verify-served.ts`, p312 chassis): P341_SERVED_PASS — 32/32 cage
  clusters at the glass-corner loci in served DRACO, ironVerts 2096
  (= baseline 1328 + 768 exact), 8/8 lamp groups, headTop 2.9475, both
  emissive factors exact WITH baseColorTexture, 0 non-finite.
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD 65c7e90d
  (struct-327 absorbed mid-tick — normal interlane life).
- Excalibur checkpoint: cast REACHABLE — appended to
  `vessel/workings/eidoverse-hero-assets/CHECKPOINT.md`.
- Evidence: `reviews/hero-assets/polish-341-streetlamps/` (before/ =
  baseline GLB + 12-view rig; after/ = candidate + rig; ab-*.jpg panels).
  Probes durable: p341-rig.ts, p341-decode.ts, p341-abdiff.py,
  p341-verify-served.ts.
- Next ranked: (a) plaza-core re-survey on fresh evidence — judge-named
  residuals this tick: roof-pitch/fused-cap read (near-night judge #2,
  needs steepening + finial re-base — compositional, judge fresh first),
  post color at night distance (gp18 judge), or (b) another
  least-recently-judged pinned subject (well p314, fountain p326,
  hearth p334 pins) fresh survey.

### polish-342 — streetlamp cap articulation (ACCEPTED, LIVE)

- Subject: `nx-town-streetlamps` (ground-layer network at origin, pos
  [0,0,0], yaw pi, EMPTY comp bag — census-fresh this tick). Build source
  `assets/mkv3-lamp33.ts` -> `village_streetlamps3.glb` (live was 9b8cdb73,
  polish-341's glass-cage build; on-disk == live exact at survey,
  before-bytes captured FIRST). Queue head from polish-341's close: the
  near-night judge's #2 residual (roof-pitch/fused-cap read).
- Survey (fresh p341-rig renders of exact live bytes, 12 views; ZAI fallback
  disclosed — no native vision tool loadable in this cron session,
  polish-285..341 class, native re-judge owed): BOTH fresh judges confirmed
  the residual. Night: cap reads medium-pitch (~30-35deg apparent vs the
  ~49deg built) with the roof value nearly merging into the sky and the
  roof-finial seat blending tonally. Day close: finial named weakest —
  "one pointed hood with a tack on top" (16% of roof span, tangent seat,
  no collar); pitch 38-40deg apparent, "safe middle".
- Change (ONE cap-articulation intervention, mkv3-lamp33.ts): roof
  steepened h 0.16 -> 0.24 on r 0.14 (true pitch ~49 -> ~60deg), iron
  collar bead (CylinderGeometry 0.055/0.068 x 0.035) engulfing the apex
  seam (bottom 2.895 vs roof apex 2.9075 — no tangent seat), finial
  widened r 0.04 -> 0.05 and re-based on the collar (2.93..3.06). The
  polish-272 crown language in the tex-33 one-smith's-iron family (no new
  material); cap collar merges into the iron bucket — nodes 24 / meshes 16
  / materials 2 UNCHANGED.
- Candidate `a4b572a315b9a9793236bb049a19afadb397589e4beade75ef647fa0efc45256`
  deterministic x2 (mtime-verified). Decode (NEW durable probe
  `p342-decode.ts`; first draft's +336-vert guess failed RED against the
  real build — corrected to the three.js-empirical 52 verts/collar = +416,
  the exact observed delta; all other gates green first run): +416 verts
  exact, 0 non-finite, maxY 3.06 exact, collar band present (344) vs
  baseline 0, both emissive materials byte-identical, counts unchanged.
- Falsification (ZAI fallback disclosed): night near A/B — pitch 8/10
  ("steepening survived the projection", clean glass->brim->slope->finial
  step), articulation 7/10 (tangent seam gone; watch-item: bead only
  ~10% wider than spike base — "ball finial" read), hierarchy 9/10, zero
  new defects. Day close A/B — articulation 8/10 ("assembled ironwork,
  not a fused cone", genuine collar notch), pitch 9/10 (54deg on-screen,
  consistent with spec), cage read 7/10 holds, zero new defects; judge
  named glass-pane recess as next candidate (recorded). First A/B call
  passed the WRONG plate (before image) — the judge caught it itself
  ("either is the BEFORE plate or the fix didn't survive export"),
  re-run on the true after plate; no verdict was taken from the bad call.
  Pixel diffs confined to the CAP zones in all 12 views (near-day/night
  bbox (437,119)-(529,244), strictly above polish-341's glass band; base-day
  0 px perfect control; distance views head-top dots only).
- Placed via updated `next-place-polish312-streetlamps.ts` (pins
  9b8cdb73 -> a4b572a3): PLACED_VERIFIED, 1 upload + 1 verb, comp bag {}
  preserved, idempotent rerun zero verbs, live census pin
  `store/a4b572a315b9a979.glb` @ (0,0,0) yaw pi exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `p342-verify-served.ts`, p341 chassis): P342_SERVED_PASS — headTop
  3.0599 exact, collarBand 448 verts at the analytic locus, 8/8 lamp
  groups, iron sheen + glow1 factors exact with baseColorTexture kept,
  0 non-finite, ring locus intact; negative control (polish-341 served
  lib) fails the new-cap gates exactly as required (headTop 2.9475,
  collarBand 0) — the probe discriminates. finialZone gate corrected to
  the geometry-true bound (cones carry no intermediate height rings; 40
  observed = ~5 x 8 lamps).
- Gate re-run after mutation: ALL PASS exit 0 at sibling HEAD cc04f85c
  (struct-329 absorbed mid-tick — normal interlane life).
- Evidence: `reviews/hero-assets/polish-342-streetlamps/` (before/ =
  baseline GLB + 12-view rig; after/ = candidate + 12-view rig).
  Probes durable: p342-decode.ts, p342-abdiff.py, p342-verify-served.ts.
- Next ranked: (a) streetlamp glass-pane recess (day judge's named
  cheapest upgrade — panes inset behind the frame plane; judge fresh
  first), or (b) plaza-core re-survey — post-color-at-night-distance
  (gp18 judge note), or (c) least-recently-judged pinned subjects (well
  p314, fountain p326, hearth p334).

### polish-343 — streetlamp glass-pane recess (ACCEPTED, LIVE)

- Subject: `nx-town-streetlamps` (ground-layer network at origin, pos
  [0,0,0], yaw pi, EMPTY comp bag — census-fresh this tick). Build source
  `assets/mkv3-lamp33.ts` -> `village_streetlamps3.glb` (live was a4b572a3,
  polish-342's cap build; on-disk == live exact at survey, before-bytes
  captured FIRST). Queue head from polish-342's close: the day judge's
  named cheapest upgrade (panes inset behind the frame plane).
- Survey (fresh p341-rig renders of exact live bytes; ZAI fallback
  disclosed — no native vision loadable this cron session, polish-285..342
  class, native re-judge owed): the p341 cage bars sit centered ON the
  glass face plane (bars ±0.075 == glass ±0.075) — judge: glass "flush,
  borderline proud", posts read as "coplanar strips painted on the surface
  of a glowing box", zero separation cues; weakest element the corner-post
  contact read. Source-true by construction.
- Change (ONE intervention, mkv3-lamp33.ts): cage bars moved OUT
  ±0.075 -> ±0.095 — glass faces now sit 7.5mm BEHIND the bar inner faces
  (±0.0825) with notched corners at every corner. Glass box untouched
  (polish-312 night-dot size preserved by moving the FRAME, not shrinking
  the glass); bar outer 0.1075 stays under the eave overhang (half 0.135).
  Nodes 24 / meshes 16 / materials 2 UNCHANGED; both emissive materials
  byte-identical.
- Candidate `fdade00cdd911e44…` deterministic x2 (mtime-verified). Decode
  (NEW durable probe `p343-decode.ts`; self-caught 2 of its own RED bugs —
  emissive-presence cannot classify materials when BOTH carry emissive,
  and modeled BoxGeometry face counts are wrong: dumped the empirical
  multiset instead, 12 verts/bar/plane = 4 corners x 3 face-duplicates):
  768 bar verts in the new corner envelope (empirical 576 max-coord +
  192 inner-corner baseline control), 0 at the old flush loci, glass 192
  verts at extent 0.075 exact, 0 non-finite, deltaVerts 0.
- Falsification: pixel diffs confined to lantern-head zones all views
  (near-day 5063 px bbox 418..543 x 250..381; base-day 0 px perfect
  control). Judges (ZAI fallback disclosed): near-day A/B — frame-around-
  glass IMPROVED (real step + shadowed gap at junctions), overall
  IMPROVED/ship; gp18-day A/B — SHIP, distance-neutral, zero new defects;
  near-night A/B — SAME (no regression, glow containment PASS, zero new
  night defects; recess sub-threshold under emissive dominance, expected).
  Judge nit recorded not treated: exposed post feet above the collar read
  as cut ends (pre-existing p341 class, amplified) — next queue head.
- Placed via updated `next-place-polish312-streetlamps.ts` (pins
  a4b572a3 -> fdade00c): PLACED_VERIFIED, 1 upload + 1 verb, comp bag {}
  preserved, idempotent rerun zero verbs, live census pin
  `store/fdade00cdd911e44.glb` @ (0,0,0) yaw pi exact.
- Served-bytes proof (struct-104 law, NEW durable probe
  `p343-verify-served.ts`, p342 chassis): P343_SERVED_PASS — served DRACO
  keeps 768 bar verts at the new corner loci, oldFlush 0, headTop 3.06,
  8/8 lamp groups, both emissive factors exact WITH baseColorTexture,
  0 non-finite; negative control (p342 served lib) fails the gates exactly.
- Gate re-run after mutation: ALL PASS real exit 0 (HEAD 045ae187 at
  close — no sibling landing mid-tick this window).
- Evidence: `reviews/hero-assets/polish-343-streetlamps/` (before/ =
  baseline GLB + 12-view rig; after/ = candidate + rig; ab-*.jpg panels).
  Probes durable: p343-decode.ts, p343-verify-served.ts.
- Next ranked: (a) cage-bar feet anchoring at the collar (judge nit:
  outward move exposes bar feet as cut ends hovering above the collar
  throat — judge fresh first), or (b) plaza-core re-survey on fresh
  evidence, or (c) least-recently-judged pinned subjects (well p318,
  fountain p326, hearth p334).

### polish-344 — streetlamp cage base plate (ACCEPTED, LIVE)

- Subject: `nx-town-streetlamps` (ground-layer network at origin, pos
  [0,0,0], yaw pi, EMPTY comp bag — census-fresh this tick). Build source
  `assets/mkv3-lamp33.ts` -> `village_streetlamps3.glb` (live was fdade00c,
  polish-343's pane-recess build; on-disk == live exact at survey,
  before-bytes captured FIRST). Queue head from polish-343's close: the
  judge nit (outward bar move exposes bar feet as cut ends).
- Defect confirmed AT SOURCE before rendering: bar feet at y 2.36 sit
  beside the neck collar, whose top disc is only r 0.062 while bar
  footprints reach ~0.117 diagonal — feet ended in OPEN AIR (the judge's
  "cut ends hovering above the collar throat", now source arithmetic).
- Change (ONE intervention, mkv3-lamp33.ts): iron cage base plate
  0.25 sq x 0.04 @ y 2.35 (spans 2.33..2.37) — bars seat 1cm deep, collar
  overlap 3cm (solid union), glass base seam covered; half-width 0.125
  under the eave 0.135 — the eave plate's mirror, honest cage-lantern
  anatomy. Merges into the iron bucket; nodes/meshes/materials UNCHANGED.
- Candidate `530fc49a9c31e441fa5240162e718084cd09949b67d18ea2d64e3ff1c7f62027`
  deterministic x2 (mtime-verified). Decode (NEW durable `p344-decode.ts`):
  P344_DECODE_PASS — +192 verts exact (24/box x 8) at the plate's unique
  planes 2.33/2.37, p343 bar gates held (beyondOld 576 / innerOld 0),
  glass 192 verts extent 0.075 untouched, 0 non-finite.
- Falsification (p344-abdiff.py): changes confined to lantern-head zones
  all 12 views; base-day 0 px perfect control. Judges (ZAI fallback
  disclosed — no native vision loadable this cron session, polish-285..343
  class, native re-judge owed): close-day IMPROVED -> effectively SHIP
  (feet terminate in ironwork, assembled cage read, glass bottom edge
  captured, plate reads designed not patched, zero new defects); near-night
  IMPROVED -> SHIP (glow has a hard physical terminus, stack reads
  cap->cage->sill->collar->pole, brightness parity, zero night defects).
  Judge close-questions answered at source (3cm collar overlap = rests ON;
  symmetric loop = all four feet identical; ±0.075 vs ±0.125 = no coplanar
  face, no z-fight).
- Placed via updated `next-place-polish312-streetlamps.ts` (pins
  fdade00c -> 530fc49a): PLACED_VERIFIED, 1 upload + 1 verb, comp bag {}
  preserved, idempotent rerun zero verbs, live census pin
  `store/530fc49a9c31e441.glb` @ (0,0,0) yaw pi exact.
- Served-bytes proof (struct-104 law, NEW durable `p344-verify-served.ts`):
  P344_SERVED_PASS — 192 plate verts at 8/8 lamps in served DRACO, p343
  loci regression gates held, headTop 3.06, both emissives exact, 0
  non-finite; negative control (fdade00c lib) 0 plate verts.
- Gate re-run after mutation: ALL PASS real exit 0 (HEAD 33738b23
  unchanged — no sibling landing mid-tick this window).
- Evidence: `reviews/hero-assets/polish-344-streetlamps/` (before/ =
  baseline GLB + 12-view rig; after/ = candidate + rig; ab-*.jpg A/B
  panels). Probes durable: p344-decode.ts, p344-abdiff.py,
  p344-verify-served.ts.
- Next ranked: (a) plaza-core re-survey on fresh evidence, or (b)
  least-recently-judged pinned subjects (well p318, fountain p326, hearth
  p334).
