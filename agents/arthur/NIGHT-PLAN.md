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

## Rotation state

- [x] NW (night-1) — [x] NE (night-2) — [ ] SE — [ ] SW — [ ] core
- Sky study: facets 1–2 done (3 remain). Decision packet: NOT assembled (loop
  law: only after all districts + study complete).
