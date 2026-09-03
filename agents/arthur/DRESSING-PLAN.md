# DRESSING-PLAN — dress-N lane durable state

Lane: district dressing for commons-next. One authored installation per
wakeup, districts rotating NW → NE → SE → SW. Loop file:
`DRESSING-LOOP.md`. Interlane: `INTERLANE-PROTOCOL.md` (six lanes).

## Lamp budget ledger (plan §7)

Per-district lamp budget, set by counting LIVE census lights per district at
first wakeup. **PENDING**: the live census fetch has been approval-blocked
for two consecutive wakeups (wakeup #1 composite, wakeup #2 direct curl) in
this window. The ledger below is set to `?` until a census lands; no lit
dressing piece may be placed before it is filled. Unlit pieces (hedges,
benches, stones, paths) are unaffected — they spend no lamp budget.

| district   | live lights counted | lamp budget | used | notes |
|------------|--------------------|-------------|------|-------|
| NW cultivation | ? (census blocked) | ?       | 0    | fills at first successful census |
| NE craft       | ? (census blocked) | ?       | 0    | |
| SE wild        | ? (census blocked) | ?       | 0    | |
| SW contemplative | ? (census blocked) | ?     | 0    | |

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

### dress-1 — NW Cultivation hedgerow (BUILT, SITING PENDING)

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
- **Siting**: PENDING live census (approval-blocked this window). Plan:
  edge the NW field plots along their district-side approach, long axis
  parallel to the plot edge, gap facing the spur. Requires: fresh census →
  SAT/rim preflight vs live entities → arrival-cone check (nothing knee-high
  in any work's 18m approach cone) → hash-gated placer file → upload/spawn
  `nx-dress-nw-hedge-001` → post-place tuple verify + idempotent rerun.
  No path, so no MCPL walk-test owed this tick.
- **Eye-check for Bill** (after placement): does the hedge read as a laid
  field boundary at walking pace, and does the gap read as a way through?

## Ledger

- dress-1: BUILD COMPLETE (v2 accepted), placement pending census access.
  No ledger append yet — entry lands with the placement (one entry covers
  build+place per the one-installation-per-wakeup shape; if the next
  wakeup can place, that entry records both).
