# DRESSING-PLAN — dress-N lane durable state

Lane: district dressing for commons-next. One authored installation per
wakeup, districts rotating NW → NE → SE → SW. Loop file:
`DRESSING-LOOP.md`. Interlane: `INTERLANE-PROTOCOL.md` (six lanes).

## Lamp budget ledger (plan §7)

Per-district lamp budget, set by counting LIVE census lights per district at
first wakeup. **FILLED 2026-09-05** (overnight fleet wave; census
`next-live-census.ts` 227 entities, quadrant x/z sign, r ≥ 35, id/comps
anchors lamp/light/glow/flame/fire/ember):

| district   | live lights counted | lamp budget | used | notes |
|------------|--------------------|-------------|------|-------|
| NW cultivation | 2 (approach-nw-lamp-001-l/002-l) | 2 | 0 | unlit dressing so far |
| NE craft       | 2 (approach-ne-lamp-001-l/002-l) | 2 | 0 | |
| SE wild        | 0 | 0 | 0 | unlit dressing only unless Bill widens |
| SW contemplative | 2 (approach-sw-lamp-001-l/002-l) | 2 | 0 | |

Counting rule: entities at r ≥ 35 from plaza center, quadrant by sign of
(x, z); count entities whose id or comps carry lamp/light/glow/flame
anchors. Budget = live count (never exceed existing density).

## District queues (NEW-VILLAGE-PLAN §4 families)

- **NW — CULTIVATION**: hedgerow (dress-1, built), bee skeps, field-edge
  log pile, gate stile
- **NE — CRAFT**: work yard (shaving horse / bench cluster), stone benches,
  woodstack
- **SE — WILD**: path spurs (walk-tested), border stones, cairn marker
- **SW — CONTEMPLATIVE**: gravel paths (walk-tested), lamps (budget-bound),
  prayer stones

Rotation: dress-1 = NW, dress-2 = NE, dress-3 = SE, dress-4 = SW, …

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

## Ledger

- dress-1: BUILT + PLACED + VERIFIED (2026-09-05 fleet wave). Entry in
  IMPROVEMENTS.md covers build + siting proof + placement.
- dress-2: BUILT + PLACED + VERIFIED (2026-09-05 overnight fleet wave).
  Entry in IMPROVEMENTS.md covers the 3-version visual iteration, siting
  proof, and placement.

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
