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

## Post-carousel queue

Ranked by gameplay visibility when carousel is internally hero-ready:
plaza hearth ✅ (polish-262), belltower ✅ (polish-263), welcome ensemble ✅
(polish-264 — board done; the welcome lamp light entity remains), tower.
Present Bill one concise eye-gate packet exactly once at that point.


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
