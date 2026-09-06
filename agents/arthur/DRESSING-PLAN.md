# DRESSING-PLAN — dress-N lane durable state

Lane: district dressing for commons-next. One authored installation per
wakeup, districts rotating NW → NE → SE → SW. Loop file:
`DRESSING-LOOP.md`. Interlane: `INTERLANE-PROTOCOL.md` (six lanes).

## Lamp budget ledger (plan §7)

Per-district lamp budget, set by counting LIVE census lights per district.
**FILLED 2026-09-05, RECONCILED 2026-09-06 (dress-3, closing night-2/N3)**:
the original fill had counted approach-leg lamps only; recounted by the
plan's own counting rule (r ≥ 35, quadrant, id/kind/comp anchor tokens
lamp/light/glow/flame/fire/ember) on the 235-entity dress-3 census:

| district   | live lights counted | lamp budget | used | notes |
|------------|--------------------|-------------|------|-------|
| NW cultivation | 2 (approach lamps only) | 2 | 0 | zero native lights |
| NE craft       | 10 (approach ×2, hamlet ×5, kiln/potter/stable) | 10 | 0 | |
| SE wild        | 8 (artwalk h-lights ×6, struct beacons ×3… recount: 8 anchors) | 8 | 0 | unlit dressing only unless Bill widens |
| SW contemplative | 3 (approach ×2, inn) | 3 | 0 | |

Counting rule: entities at r ≥ 35 from plaza center, quadrant by sign of
(x, z); count entities whose id or comps carry lamp/light/glow/flame
anchors. Budget = live count (never exceed existing density).

## District queues (NEW-VILLAGE-PLAN §4 families)

- **NW — CULTIVATION**: hedgerow (dress-1, built), bee skeps, field-edge
  log pile, gate stile
- **NE — CRAFT**: work yard (shaving horse / bench cluster), stone benches,
  woodstack
- **SE — WILD**: path spurs (walk-tested), border stones, cairn marker
- **SW — CONTEMPLATIVE**: ~~gravel paths~~ (dress-4, walk-tested 7/7),
  lamps (budget-bound), prayer stones

Rotation: dress-1 = NW, dress-2 = NE, dress-3 = SE, dress-4 = SW, …
(dress-1..4 complete — first full rotation 2026-09-06; next: NW round 2)

## Siting log

### dress-1 — NW Cultivation hedgerow (PLACED, LIVE)

- **Concept contract**: a laid hedgerow edging the NW district's field
  plots, with a worker's gap (stone step through) where a spur meets the
  plots. Grounds use: stock barrier, windbreak, boundary marker. Static,
  unlit — spends no lamp budget.
- **Build**: `assets/mkv3-dress-nw-hedge1.ts` →
  `assets/village_dress_nw_hedge1.glb`
  - v1 (sha `233d6ca4…`) **REJECTED** on native-view gameplay render:
    two plain slabs, no hedge mass, gap illegible. Corrected same tick.
  - v2 (sha `f595e862465c49e01a97f757930aa5dfaa70a144bb5ab9310a60c6d76915f782`,
    double-rebuild byte-identical) **ACCEPTED**: massed irregular segments
    in two palette greens, ragged top, legible gap with kerb stones, hazel
    pleacher with branch nubs, foot stones. Gameplay + front views judged
    natively; consistent with the village's low-poly idiom.
- **Decode**: 6.6 × 1.99 × 1.835 m, bbox x −3.3..3.3, z −0.885..0.95,
  y 0..1.99; 5 nodes after merge (budget 3–25 ✓). No light anchors
  (KEEPTOK-free), empty comp bag by design.
- **Siting (2026-09-05 fleet wave, census 227)**: first candidate — the
  plaza-facing edge of lavender-0027 — was **proven occupied by source-true
  decode**: the NW approach lane GLB's terminus bed physically reaches the
  lavender corner (nearest lane vertex INSIDE the candidate footprint at
  0m; the lane's census bbox is a fat compound OBB h2.61 whose overlap was
  REAL here, not a fat-bbox artifact). Full-edge scans of lavender-0027
  found no lawful site (lane bed s≈−3.4..terminus; orchard-0033 SAT + 18m
  approach cone close off both ends). **Final site**: plaza-facing (local
  +z) edge of `nx-cultivation-lavender-0040`, offset 2.5m, s=+2.5 along
  the edge — center (−35.34, 62.14), yaw −2.36, py 0.04 (terrain flat,
  Δ5mm across the 6.6m span). Gap faces local +x = NE, toward the
  district's inter-plot path. SAT clear of every solid (min gap 7.0m vs
  echoarch; no sub-1.4m adjacency); arrival-cone clear (nearest works
  13m+, outside every plaza-ward 25° wedge); lane fat-bbox exempted by
  NAMED exemption with source-true clearance 17.6m
  (`dress-hedge1-lane-decode.ts`, sha-pinned); lamp-002 19.9m.
- **Placement**: `nw-dress1-place.ts` — hash gate → live blocker-epoch
  guard (lavender-0040, echoarch, orchard-0046, lane, lamp-002) → SAT
  preflight vs FRESH census → upload (content-addressed) → spawn →
  post-place tuple verify. **PLACED_VERIFIED**
  `nx-dress-nw-hedge-001` @ lib `store/f595e862465c49e0.glb`,
  pos (−35.34, 0.04, 62.14), yaw −2.36. Idempotent rerun: no verbs.
  One honest wart: the first rerun re-spawned unconditionally before the
  `!before[ID]` guard was added (identical bytes/tuple, empty comp bag —
  no-op re-place); the guard is in the committed placer now.
- **Eye-check for Bill** (after placement): does the hedge read as a laid
  field boundary at walking pace on lavender-0040's plaza-facing edge, and
  does the gap read as a way through (gap faces NE, toward the
  inter-plot path)?

### dress-2 — NE Craft shared work yard (PLACED, LIVE)

- **Concept contract**: the NE craft workshops back onto a shared staging
  yard where timber arrives and sawn stock leaves — log rack (two posts,
  strap rail, one full-length round overhanging both posts), sawbench
  (thick plank on bark bearers and rock pads), two A-frame sawhorses each
  carrying a log in use, pyramid cordwood stack with pale end-grain discs,
  shavings spill, loose rounds. Grounds use: craft districts keep their
  messy useful back-of-shop strip. Static, unlit — spends no lamp budget.
- **Build**: `assets/mkv3-dress-ne-yard1.ts` →
  `assets/village_dress_ne_yard1.glb`
  - v1 (sha `bd8a81b3…`) REJECTED: cordwood read as crates, bench top a
    hairline, sawhorse legs invisible, mid-stack cantilever (ZAI fallback
    vision — native vision provider-down, error 1210 both attempts).
  - v2 (sha `cb4fa755…`) rejected: end caps value-identical to bark,
    rack load floating between posts.
  - v3 (sha `6893f453…`) rejected at gameplay distance: rack log a thin
    stick on the horizon; close view showed caps still too subtle.
  - v5/v4 line (sha `191227da…`, double-rebuild byte-identical) ACCEPTED
    at both distances: pale straw end discs read as cut log ends; rack log
    (r0.2) reads heavy and cradled by posts; sawhorses read in use.
- **Decode (final)**: 4.80 × 1.32 × 3.49 m, bbox x −2.4..2.4,
  z −2.215..1.275, y −0.03..1.29 (center z −0.47); 5 nodes (budget ✓).
  No light anchors, empty comp bag by design.
- **Siting (census 231)**: seam BEHIND the cloister row between
  cloister-0029 and cloister-0042, r 103.5 az 57.3° — a systematic NE
  scan found no legal front-of-work site anywhere in the band (the
  inter-work seams at az 53-60 are physically occupied: hamlet/cloister
  fat bboxes SAT-overlap −0.65..−4.96m). The back-of-shop strip is the
  honest grounding: yard backs to the cloisters (stack side inward),
  faces the district interior. Center (55.91, 87.10), yaw 147.3°.
  SAT re-verified on final footprint: min gap 5.05m vs cloister-0042,
  no sub-1.4m adjacency; rim corner 106.61; arrival cones clear (nearest
  works 13.7m+, outside every plaza-ward wedge); lane footprint cleared
  by >15m both axes (fat-bbox exemption documented in placer header);
  lamp-002 33m. Terrain flat (py −0.034, Δ5mm across 3.5m span).
- **Placement**: `ne-dress2-place.ts` — hash gate → blocker-epoch guard →
  fresh-census SAT preflight → upload → spawn → post-place tuple verify.
  **PLACED_VERIFIED** `nx-dress-ne-yard-001` @ lib
  `store/191227dafd0d05dc.glb`, pos (55.91, −0.034, 87.10), yaw 147.3°.
  Idempotent rerun: no verbs. NE lamp budget used 0 of 2.
- **Eye-check for Bill**: from the district interior between the shops,
  the yard should read as a shared back-of-shop staging strip — rack log
  silhouetted against the sky, stack discs catching light. If it reads
  "stray clutter" from the approach lane instead, say so and it re-sites.

### dress-4 — SW Contemplative raked gravel path (PLACED, LIVE)

- **Concept contract**: the SW approach's civic pavers end at the seed ring
  (r71, az 217.25). Where the town's stone gives out, a raked gravel path
  carries the walker through the threshold into the temple grounds — the
  first act of contemplation is walking on raked ground. Grounds USE: the
  district's own surface idiom. Static, unlit — spends no lamp budget
  (SW budget 3, used 0).
- **Build**: `assets/mkv3-dress-sw-gravel1.ts` →
  `assets/village_dress_sw_gravel1.glb`. Six-version iteration (ZAI
  fallback vision throughout — native provider-down error 1210, 5th
  consecutive tick; disclosed):
  - v1 (`a9ec1a13…`) plank-with-pebbles; v2 (`55bed476…`) tonal inversion
    (railroad tie); v3 (`cb1f0e3e…`/`723bf02b…`) value structure fixed,
    straight-edge plank silhouette; v4 (`ec6343f5…`) rim still read as
    continuous cut outline; v5 (`07d4c70f…`) gapped floor + bow —
    gameplay verdict: passes as tended path, raking close-range;
  - v7 (sha `fd21de9ff797e249974481dbce662955a6fd3330846ddece243792d79abb8be5`,
    double-rebuild byte-identical) **ACCEPTED** at the top-view placement
    gate: pale-ridge/dark-groove raking with groove ratio ~38%, torus
    ripple-arc bullseye around the tall anchor stone, secondary ripple at
    the medium stone, broken gapped floor (terrain shows through), kerb +
    threshold stones, spill pebbles.
- **Decode (final)**: 6 nodes; bbox x −3.623..3.64, z −1.184..1.309,
  y −0.1..0.372 — ground-film class (h≤0.5). No light anchors, empty comp
  bag by design.
- **Siting (census 239)**: continues the leg radially outward — center
  pol(74.7, 217.25) = (−45.22, −59.46), yaw 127.25° (local +x = outward
  walking direction). Rim corners 71.0..78.5 in [66,108]. SAT min real gap
  2.62m (temple-terrace-0049), no sub-1.4m solid adjacency. NAMED fat-bbox
  exemption for `nx-approach-sw-lane-003` (world-coords GLB; source-true
  collinear end-to-end junction at the r71 threshold, both walking
  surfaces; same dress-1 precedent). seed-0021 3.39m off centerline
  (ground-film-vs-wall class, lawful). Terrain flat (py −0.05, Δ14mm).
- **Placement**: `sw-dress4-place.ts` — hash gate → blocker-epoch guard
  (approach lane, seed-0021, terrace-0049) → fresh-census SAT + rim-corner
  + arrival-cone gates → upload → spawn → post-place tuple verify.
  **PLACED_VERIFIED** `nx-dress-sw-gravel-001` @ lib
  `store/fd21de9ff797e249.glb`, pos (−45.22, −0.05, −59.46), yaw 127.25°.
  Idempotent rerun: no verbs. SW lamp budget used 0 of 3.
- **Walk-test**: two-way MCPL through the real surface 7/7 ALL_PASS (leg
  r66 → path-center r74 → path-far r78 and back; max arrival 0.37m).
- **Eye-check for Bill**: walk the SW leg out past the seed ring — the
  path should read as tended raked gravel with a ripple bullseye around
  the tall dark stone, not decking or a painted crossing. If the dark
  gravel value reads too dark in context, it re-colors (one pass).

## Ledger

- dress-1: BUILT + PLACED + VERIFIED (2026-09-05 fleet wave). Entry in
  IMPROVEMENTS.md covers build + siting proof + placement.
- dress-2: BUILT + PLACED + VERIFIED (2026-09-05 overnight fleet wave).
  Entry in IMPROVEMENTS.md covers the 3-version visual iteration, siting
  proof, and placement.
- dress-3: BUILT + PLACED + VERIFIED (2026-09-06 overnight fleet wave).
  Entry covers the v1-reject/v2-accept iteration, rim-law catch (0.45m
  inside the 66m floor, shifted +1.0m radially), and placement. Also
  closed night-2/N3 by reconciling the lamp-budget table (see above).
- dress-4: BUILT + PLACED + VERIFIED (2026-09-06 overnight fleet wave).
  Entry covers the six-version iteration (plank → tie → silhouette →
  gapped-floor → relief → gate-pass), the fat-bbox lane exemption, and
  the 7/7 walk-test.

### dress-3 — SE Wild border stones (PLACED, LIVE)

- **Concept contract**: the SE visitor corridor (az 315, the h2→h3→h6
  artwalk axis) runs out past the last art work into the forest belt. Where
  the tended edge gives way to deep wild, the walker finds stones cleared
  from the path and stacked in small piles at its edge — the district is
  tended at its margins, wild at its core. Grounds USE: path maintenance,
  boundary marking. Static, unlit — spends no lamp budget.
- **Build**: `assets/mkv3-dress-se-stones1.ts` →
  `assets/village_dress_se_stones1.glb`
  - v1 (sha `bc491b91…`) REJECTED on review: uniform rhythm read as placed
    fence-of-stones, center pile compact (ZAI fallback vision — native
    provider-down, error 1210; disclosed).
  - v2 (sha `8dafb9e58f8354f16a263ac340d602ac94045bde54c0a1561e6574e40a854cf2`,
    double-rebuild byte-identical) **ACCEPTED**: spacing jitter ±0.22m,
    tall landmark pile (second capstone) at the forest end, moss caps on
    three piles, wider center base, kicked loose stones.
- **Decode (final)**: footprint x −4.54..4.53, z −0.56..0.58, y −0.02..0.58
  (knee-height); 2 nodes (budget ✓). No light anchors, empty comp bag.
- **Siting (census 235)**: run along the az-315 corridor at r≈70, offset
  3.4m off-axis (SW side). **Rim law caught the first pose** — corners at
  r 65.52/65.58, 0.45m inside the 66m floor — shifted 1.0m radially
  outward; final corners 66.52..75.64. SAT min gap 2.85m vs
  nx-wild-forest-0044, no sub-1.4m adjacency; arrival cones clear (stones
  knee-height, nearest work 10m+). Terrain flat (py −0.011, Δ16mm).
- **Placement**: `se-dress3-place.ts` — hash gate → blocker-epoch guard
  (forest-0044/0057, h6/h7, northneedle) → fresh-census SAT + rim-corner +
  arrival-cone gates → upload → spawn → post-place tuple verify.
  **PLACED_VERIFIED** `nx-dress-se-stones-001` @ lib
  `store/8dafb9e58f8354f1.glb`, pos (52.61, −0.011, −47.80), yaw 45°.
  Idempotent rerun: no verbs. SE lamp budget used 0 of 8 (recounted).
- **Eye-check for Bill**: walk the SE corridor past the last art work
  toward the forest — the five stone piles should read as field-clearing
  at the wild margin (one taller pile at the forest end), not as scattered
  rubble or a fence.

### night-1 census note (from night-N observer lane, 2026-09-05 — fills your "?" blocker)

Fresh live census landed 2026-09-05 (227 entities, /geom). Per-district
light counts by your counting rule (r≥35, quadrant, light-anchor tokens):
**NW=2, NE=10, SE=8, SW=2.** NW's 2 and SW's 2 are the approach-leg lamps
themselves — both districts have ZERO native lights. Baked emissives are
census-invisible (render-checked in NW: window glows exist but don't count
here). Fill your budget table from these numbers at your next wakeup; raw
census at /tmp/night1-census.json (ephemeral) — re-fetch if you need it.

### night-2 defect note (from night-N observer lane, 2026-09-05)

- **N3 (severity 3)**: the lamp-budget table above (NE craft = 2 lights
  counted, SE wild = 0) contradicts the census light count at r≥35 by the
  same counting rule: **NE=10, SE=9** (night-1 note said SE=8; the +1 is
  sibling work since). The 2/0 rows appear to count approach-leg lamps only.
  Please reconcile at your next wakeup — the budget table is the dress lane's
  spend authority and the night lane cites it. Raw census:
  /tmp/night2-census.json (ephemeral).
