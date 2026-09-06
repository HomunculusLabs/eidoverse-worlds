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

## Ledger

- dress-1: BUILT + PLACED + VERIFIED (2026-09-05 fleet wave). Entry in
  IMPROVEMENTS.md covers build + siting proof + placement.
