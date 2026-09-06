# NIGHT-PLAN — night-N lane durable state (observer, ZERO world mutation)

Loop: `NIGHT-LOOP.md`. Interlane: `INTERLANE-PROTOCOL.md` (ten lanes; this
lane mutates nothing — files and defect notes only). Opened 2026-09-05
(night-1, overnight fleet wave).

## Evidence class (standing disclosure)

All renders are **hash-bound local rigs** (per the harness-only evidence law),
not in-world camera frames: every subject GLB sha256[:16] verified against the
live `/geom` census libs before render; poses = exact live tuples; lights =
the live client contract (`makeLight`: 0xffd9a0, intensity 16, range 10) at
exact `-l` entity positions. Judge channel this tick: ZAI vision (GLM-4.6V) —
native vision_analyze was provider-down (error 1210, two attempts). Rig:
`review-night-nw.ts` (hash gate, env-param palette for the study variants).
Known rig-scope limits are recorded per finding.

## Lamp budget census (2026-09-05, /geom 227 entities; fills DRESSING-PLAN "?")

Counting rule per DRESSING-PLAN (r≥35, quadrant by sign(x,z), light-anchor
tokens in entity json): **NW=2, NE=10, SE=8, SW=2.** NW/SW budgets are the two
approach-leg lamps only — both districts have ZERO native lights. Baked-in
emissives (window glows etc.) are census-invisible; renders are ground truth
for those.

## Night-read register

Rotation: NW → NE → SE → SW → core. One district per wakeup.

| # | district | date | reads (wayfinding / material / emissive) | verdict summary |
|---|----------|------|------------------------------------------|-----------------|
| 1 | NW Cultivation | 2026-09-05 | FAIL / PARTIAL / PASS(1 minor) | 2 lamps over 47m leg; dead stretches r24–49 and r50–67; fields wash past lamplight; emissive disciplined |
| 2 | NE Craft | 2026-09-05 | FAIL / PARTIAL / PASS(2 minor) | gate-edge→lamp-001 33.5m unlit, lamp gaps 24.1/28.1m; only lamp pools + E-road glow keep material at depth; kiln night read UNJUDGED (no view covered the mouth) |
| 3 | SE Wild | 2026-09-06 | FAIL / PARTIAL / PASS(2 minor) | corridor az315 has ZERO lamps (8/8 budget spent on interior anchors); path readable by stone silhouette then black; core arrival cluster coherent but satellites orphaned; facet-3 moonlift rescues mid-ground material (win) |
| 4 | SW Contemplative | 2026-09-06 | FAIL / PARTIAL / PASS(2 minor) | leg dead stretches as NW/NE class + ENTIRE temple grounds zero lights (gravest in fleet); stone terraces pure silhouette, gravel rings barely read; detached-orb lamp class now census-corroborated (light-kind entities, no fixture geometry in world); facet-4 compound (moonlift+stars) reads better than baseline — new packet co-leader |

### night-1 — NW Cultivation detail (renders: `reviews/night-nw/`, 5 views, all judged)

- **Wayfinding FAIL (severity 2, census-verified)**: leg lamps at r49.4 and
  r66.9 only. Inner stretch gate(r18)→lamp-001 = ~31m unlit; mid-gap
  lamp-001→lamp-002 = 17.5m unlit (plaza light range is 10m). Judged from
  renders: path readable only to the near lamp, then dissolves; two-beat
  rhythm reads as a terminus, not a cadence. Routed to approach lane.
  Caveat: the "no core glow on horizon" observation is rig-confounded (core
  lights not in rig); probable-but-unproven, do not cite as fact.
- **Material truth PARTIAL (severity 3, design observation, no owning lane)**:
  near-lamp foreground keeps hue separation (olive ground / mauve cones /
  tan path); past ~1 lamp-range everything washes to one dark mass — deep
  fields keep row STRUCTURE but lose garden-vs-lavender-vs-orchard identity.
  Lavender's faint violet is the only surviving hue at depth. This is a
  sky/ambient question, not an entity defect → goes to the final decision
  packet, not to a lane.
- **Emissive discipline PASS, 1 minor (informational, approach lane)**: lamps
  read as markers with no ground pool (range-10 reality); possible
  half-lit-orb/shade-disc inconsistency at one lamp head (judge flagged as
  "could be intentional"); no bloom, no bleed, no stray brights anywhere.
- Rig defects found and fixed this tick (probe discipline): THREE.Color
  rejects `0x…` strings → first pass had a white sky (caught by pixel probe);
  one hand-transcribed hash typo caught by the rig's own hash gate.

## Defect log (routed)

| id | finding | severity | owner lane | routed to | state |
|----|---------|----------|-----------|-----------|-------|
| night-1/D1 | NW leg unlit dead stretches (2 lamps / 47m) | 2 | approach-N | APPROACH-PLAN `### night-1 defect note` | OPEN, budget-bound (NW budget=2, already spent by these same lamps — closing needs Bill or budget policy) |
| night-1/N1 | lamp-head emissive consistency question | 4 (informational) | approach-N | same note | noted, no re-open |
| night-2/D2 | NE leg unlit dead stretches: gate-edge(r~20)→lamp-001 33.5m, lamp-001→002 24.1m, lamp-002→first lit interior 28.1m (all census-verified; worse than NW) | 2 | approach-N | APPROACH-PLAN `### night-2 defect note` | OPEN, budget-bound (NE budget=2, spent by the same two lamps) |
| night-2/N2 | lamps cast weak/no ground pools at range-10 — lights read as points pasted on darkness, not fixtures in space (recurring night-1/N1 class, now judged in 3 views) | 3 (informational→design) | approach-N (contract is live-client) | same note | noted; likely ambient/sky-budget question for the final packet |
| night-2/N3 | DRESSING-PLAN lamp-budget table rows (NE=2, SE=0) contradict the census light count (NE=10, SE=9 at r≥35 — night-1 note says SE=8; +1 is sibling work) | 3 | dress-N | DRESSING-PLAN `### night-2 defect note` | OPEN for dress lane reconciliation |
| night-3/D3 | SE corridor az315 ZERO lamps; path fades to black within a third of frame; last-stone→wild-margin link implied but unlit | 3 | approach-N | APPROACH-PLAN `### night-3 defect note` | OPEN, budget-bound (SE budget 8/8 spent on interior anchors) |
| night-3/N4 | pavilion lamps read as detached points not fixtures (no ground pool/spill); one bare-emissive globe with no visible mount | 4 (informational) | approach-N (contract is live-client) | same note | noted; final packet question |
| night-4/D4 | SW corridor dead stretches: gate-edge(~r20)→lamp-001(r39.7) ~20m unlit, lamp-001→002 15.8m, lamp-002(r55.4)→gravel gate(r74.7) ~19m; then the ENTIRE temple grounds (terraces/seeds/labyrinths, r71–98) carry ZERO lights of any kind — worst-in-class dead district after dark | 2 | approach-N | APPROACH-PLAN `### night-4 defect note` | OPEN, budget-bound (SW budget 3 per table; live in-quadrant count = 2 — table's third 'inn' anchor sits core-side, outside the r≥35 rule; census note recorded) |
| night-4/N5 | detached-orb lamp class now census-corroborated: SW + NW leg lamps are light-kind entities with NO fixture model entity in the world — judges in all four districts read them as floating orbs; whether the live client renders a post for kind=light is UNVERIFIED (rig bead stands in for the head, disclosed) | 3 (informational→design) | approach-N (contract is live-client) | same note | noted; final packet question + client-contract check |

### night-2 — NE Craft detail (renders: `reviews/night-ne/`, 6 views, all judged; rig `review-night-ne.ts`)

- **Wayfinding FAIL (severity 2, census-verified)**: the E road ends at the
  gate (plaza lamp covers r≤10 only); from the gate edge (~r20 on the leg) to
  lamp-001 is 33.5m unlit — judged from renders: foreground dead stretch, eye
  jumps to the brightest cluster instead of walking the lane. Lamp-001→002 gap
  24.1m; past lamp-002 another 28.1m to the first lit hamlet. Distant hamlet
  window-dots DO read as a destination magnet (8–12 amber points) — depth
  appeal exists, cadence does not. The center-homebound read confirms night-1's
  now-rig-true observation: core glow IS visible on the horizon (all 33 live
  lights in rig this time — confound fixed), but the lamp string reads flat and
  unconverging from the district side.
- **Material truth PARTIAL (severity 3, design observation, no owning lane)**:
  identical law to NW — inside a lamp pool or the E-road glow, material reads
  (timber posts of the potter porch, flagstones, kiln form); past one lamp-range
  everything silhouettes. Cloisters/hamlets read by window rhythm alone. Goes
  to the final decision packet (ambient/moonlight-lift question), not to a lane.
- **Emissive discipline PASS, 2 minor**: no bloom, no bleed, no strays in any
  view; horizon light haze reads as fog scatter (good). (a) Lamp flares at
  frame edges are the RIG's 0.14m basic-material bead standing in for the lamp
  head — rig artifact, disclosed; live head geometry differs (same class as
  night-1/N1). (b) One pavilion orb read hotter/whiter than the amber consensus
  — flagged informational only (single judge pass, unverified against source).
- **Kiln night read UNJUDGED (rig-scope limit, not a defect)**: `kiln-l` light
  is live at the kiln mouth and present in the rig, but no judged view put the
  kiln in frame (it sits behind the arrival/center cameras). A judge claim of
  "no ember glow from any kiln mouth" was rejected as view-coverage artifact.
  First SE/verify pass that covers the kiln should close this.
- Rig engineering notes: subject table generated programmatically from the
  census + local hash map (43 subjects, zero hand-transcription); woodyard
  rendered from the LIVE at-rest store copy (`/library/store/1f2c6f59…`, 8676B,
  Draco — live bytes are pre-canon with no local twin per interior-10; store
  route is `/library/store/`, not `/store/`; at-rest generation is
  draco+webp-optimized so the render is evidence of the optimized generation,
  recorded as a scope note); DRACOLoader wired (first run failed without it);
  all 33 live `-l` lights included, fixing night-1's horizon-glow confound.

### night-3 — SE Wild detail (renders: `reviews/night-se/`, 6 views, all judged via ZAI fallback; rig `review-night-se.ts`)

- Census: 239 entities (fresh 2026-09-06, up from 235 at sweep-3 — sibling
  arrivals are outside this lane's concern; SE subject set = 39 entities
  r≥35, of which 31 GLB subjects hash-mapped locally + 8 light-anchor
  entities with lib='' rendered as lamps). SE lamp budget per DRESSING-PLAN
  recount: 8 live, all interior (artwalk h-lights ×5, struct
  beacon/northneedle/observatory ×3). Used 8 of 8 — matches.
- **Wayfinding FAIL (severity 3 → D3, routed to approach-N)**: the az-315
  visitor corridor has ZERO corridor lamps. Inbound view: one beacon
  (chime pavilion orb on the vanishing point) pulls the eye, but no rhythm —
  mid-corridor stretch dead both flanks. Outbound view: path stones fade to
  pure black by bottom third of frame; the player's own footing is
  unreadable; last readable stone → cairn cluster link implied but unlit.
  Arrival view: core cluster (plinths + pergola lamp + on-axis orb) reads as
  destination, but satellites orphaned — needle beacon high and off-axis,
  platform lamp floats with no intermediate cue. Aerial: no secondary light
  tier; forest belt a hard dead zone. Budget-bound: any corridor lamp needs
  Bill or budget policy.
- **Material truth PARTIAL (severity 3, design observation, no owning lane)**:
  same law as NW/NE — inside a lamp pool or the pavilion glow, material reads
  (timber lattice slat undersides, stone plinth texture, metal specular on
  chime tubes/helix); past one lamp-range everything silhouettes. Needle
  tower pure black except beacon tip. Forest belt reads as faceted masses
  (barely, at the horizon luminance band). Goes to the final decision packet
  (ambient/moonlight-lift question).
- **Emissive discipline PASS, 2 minor**: no bloom blowouts, no bleed-through
  in any view. (a) center orb's halo cuts into the dark disc silhouette —
  reads as intentional moon-behind-gong, flagged informational; (b) one loose
  ground sphere reads as a bare emissive ball with no visible fixture
  (recurring N1/N2/N4 class — rig bead artifact possible, disclosed); (c)
  aerial view: one stray dot beside an unlit structure at far right of the
  lit cluster — source unknown, below action threshold, informational.
- Judge channel disclosure: native vision_analyze provider down (error 1210,
  two attempts) — judged via ZAI fallback (GLM-4.6V), same as night-2.
- Rig engineering notes: subject table generated programmatically from the
  census + local hash map (31 GLB subjects, zero hand-transcription); ALL 38
  live world lights included for rig-true horizon glow; light-anchor
  entities (lib='') render as lamps only.

### night-4 — SW Contemplative detail (renders: `reviews/night-sw/`, 6 views, all judged via ZAI fallback; rig `review-night-sw.ts`)

- Census: 241 entities (fresh 2026-09-06, +2 sibling arrivals vs sweep-4's 239 —
  outside this lane's concern). SW subject set = 23 entities r≥35 (5 terraces,
  4 seeds, 4 labyrinths, 4 struct, 1 mosaic, 2 mile posts, gravel path, 2
  approach lamps); 21 GLB subjects hash-mapped LOCALLY (assets/ + glb-retex/,
  zero store-scope caveat this district), 2 light-anchor entities rendered as
  lamps. Rig subject table census-generated, zero hand-transcription; ALL 40
  live world lights in rig.
- **Wayfinding FAIL (severity 2 → D4, routed to approach-N)**: same leg class
  as NW/NE (dead stretches between the two leg lamps and beyond lamp-002),
  then worse — the temple grounds themselves are entirely unlit. Inbound view:
  eye jumps from foreground pool to plaza band, nothing in between. Outbound:
  route dies at the gravel oval's graze-lit edge; terrace stones read as
  "fence teeth". Center-outward: pure void. Arrival: composition reads
  (terrace procession, post cadence) but as an UNLIT scene, not a night scene
  — zero emissive anchors anywhere in the district. Aerial: coherent
  double-arc composition legible just above crush-to-black; district has no
  light tier of its own (plaza is the only warm point in frame).
- **Material truth PARTIAL (severity 3, design observation, no owning lane)**:
  harshest district yet for the recurring law — gravel is the ONLY material
  that reads at depth (rake rings, and only where grazed); timber post of the
  leg reads in its lamp pool; stone terraces (the district's primary
  material, meant for contemplation) are flat silhouettes at every distance
  past one lamp-range. Goes to the final decision packet.
- **Emissive discipline PASS, 2 minor**: no bloom, no bleed-through in any
  view. (a) Detached-orb class → N5: census shows the SW/NW leg lamps are
  kind=light entities with NO fixture model in the world; the mile-post
  silhouette near lamp-001 is unlit stone BY DESIGN (judge misread it as a
  failed second lamp — probe discipline: verified against census before
  routing). Whether the live client renders a post is unverified. (b) pale
  speckle at the gravel's grazed edge — texture/moonlight interplay, below
  threshold, informational.
- Judge channel disclosure: native vision_analyze provider down (error 1210,
  2 attempts) — judged via ZAI fallback (GLM-4.6V), same as night-2/3.
- Rig engineering notes: generator script had a dir-mapping bug (retex-only
  files labeled ASSETS — hash gate caught both instances before render);
  facet-4 star dome initially fogged to invisibility (Fog 60–260 kills r=500
  stars — matches facet-2's "stars underpowered" finding); fixed with
  `fog:false` on star materials and re-rendered BEFORE judging facet 4.

## Sky-palette study log (render-only overlays, NEVER applied)

Facet rotation: 1=cool-vs-warm base hue, 2=horizon gradient+stars, next:
moonlight ambient lift, then one free facet.

- **Facet 1 (night-1): standing cool blue-black `#0a0d18` vs warm dark
  `#171310`** (same geometry/lights/camera; variant in
  `reviews/night-nw-skyvar-warm/`). Judge verdict: cool wins for natural
  night + beacon hierarchy (lamps pop on complementary ground; treeline
  silhouettes snap); warm trades that for dusk-cozy cohesion (lamps merge
  into ambient warmth, treeline edges dissolve, horizon flattens to one
  brown register). Warm reads as "evening", cool reads as "night".
  Recommendation deferred until every district has one pass (loop law).
- **Facet 2 (night-2): flat `#0a0d18` vs gradient + faint star dome**
  (variant in `reviews/night-ne-skyvar-stars/`; rig env `NIGHT_STARS=1`).
  Judge verdict: the **gradient earns its keep** — horizon-to-zenith
  transition reads as atmospheric depth, not decoration, and distant light
  clusters' glow along the horizon reads as fog scatter that motivates the
  gradient. **The star dome reads as absent** — so dim at threshold that it
  registers as nothing; no vertical anchor, no dome sensation. Roofline
  separation is only marginally better than flat (10–15%), and what actually
  separates those buildings is their own warm windows, not the sky. Verdict:
  gradient natural, stars underpowered; if adopted, push the brightest 10–15%
  of stars 1–2 stops so a few register. Recommendation deferred (loop law).
- **Facet 4 (night-4, free facet): standing baseline vs the COMPOUND of every
  facet winner so far** — moonlight ambient lift (hemi 0.9, moon 1.1, sky
  `#0e1626`) + pushed star dome (420 stars, top ~15% pushed 1–2 stops white
  and 2.4× size, per facet-2's fix; `fog:false` after the fog-kill was caught
  pre-judgment) (variant in `reviews/night-sw-skyvar-facet4/`; rig env
  `NIGHT_STARS=1 NIGHT_MOON=1`). Judge verdict: **better than baseline, new
  packet co-leader with facet 3**. WIN: unfogged stars sell the dome — the
  field terminates at the horizon, so sky reads as a vault, not a backdrop;
  size/brightness variation adds depth; ground keeps a legible luminance
  gradient and path-tile read; silhouettes stay clean against the lifted
  horizon band; lamp salience survives (the near lamp still wins its frame).
  COST: star distribution is uniform — no zenith concentration, no pole-star
  vertical anchor (the only up-axis is incidental, under the bright orb);
  warm dots hugging the horizon can masquerade as distant waypoints
  (false-positive clutter); ground olive cast reads slightly stylized vs
  neutral moonlight. If adopted: concentrate ~20% of stars toward zenith and
  clear a low-altitude band near approach corridors. Recommendation deferred
  (loop law: core pass + reserve facet remain).
- **Facet 3 (night-3): standing ambient (hemi 0.5, moon 0.55) vs moonlight
  ambient lift (hemi 0.9, moon 1.1, sky `#0e1626`)** (variant in
  `reviews/night-se-skyvar-moon/`; rig env `NIGHT_MOON=1`). Judge verdict:
  **partial rescue — worth the lift, but not full material recovery**. WIN:
  mid-distance material identity returns (path slabs read unambiguously as
  stone — individual tiles, tonal edge separation; chime tubes as metal via
  warm-specular-vs-dark-flank; trellis slats separate as timber lattice);
  crucially NOT a flat blue-gray wash — ground reads green-gray, sky stays
  deep navy, warm pools stay localized, so night mood survives. COST:
  periphery stays shape-only (far structures near-silhouette); lamp pop
  softens but survives because separation becomes temperature contrast
  (warm vs cool) rather than brightness. This is the first candidate that
  directly answers the recurring "material truth PARTIAL" observation in
  all three districts. Recommendation deferred until SW + core passes.

## Rotation state

- [x] NW (night-1) — [x] NE (night-2) — [x] SE (night-3) — [x] SW (night-4) — [ ] core
- Sky study: facets 1–4 done (1 remains: reserve). Decision packet: NOT
  assembled (loop law: only after all districts + study complete — core pass
  + reserve facet left).
