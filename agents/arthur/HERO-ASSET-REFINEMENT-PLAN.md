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

## Post-carousel queue

Ranked by gameplay visibility when carousel is internally hero-ready:
plaza hearth, belltower, welcome ensemble, tower. Present Bill one concise
eye-gate packet exactly once at that point.
