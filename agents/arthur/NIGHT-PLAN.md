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

## Sky-palette study log (render-only overlays, NEVER applied)

Facet rotation: 1=cool-vs-warm base hue, next: horizon gradient/stars,
then moonlight ambient lift.

- **Facet 1 (night-1): standing cool blue-black `#0a0d18` vs warm dark
  `#171310`** (same geometry/lights/camera; variant in
  `reviews/night-nw-skyvar-warm/`). Judge verdict: cool wins for natural
  night + beacon hierarchy (lamps pop on complementary ground; treeline
  silhouettes snap); warm trades that for dusk-cozy cohesion (lamps merge
  into ambient warmth, treeline edges dissolve, horizon flattens to one
  brown register). Warm reads as "evening", cool reads as "night".
  Recommendation deferred until every district has one pass (loop law).

## Rotation state

- [x] NW (night-1) — [ ] NE — [ ] SE — [ ] SW — [ ] core
- Sky study: facet 1 done (4 remain). Decision packet: NOT assembled (loop law:
  only after all districts + study complete).
