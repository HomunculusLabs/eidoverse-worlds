# MILESTONE-PLAN — mile-N lane durable state

Lane: approach-network milestones for commons-next. One marker pair per
wakeup. Loop file: `MILESTONE-LOOP.md`. Interlane: `INTERLANE-PROTOCOL.md`.

## Idiom bank (refine-295 heritage)

- Paired boundary markers: stone posts + ashlar caps + forge-iron lantern
  arms (old commons, r30.6 field edges, "the village edge reads in stone
  and iron").
- Milestone-lamp language (refine-198): one warm lamp, range 8, for a
  marker provably past every light.

## Seed geometry (from APPROACH-PLAN.md leg records — the proven polylines)

- **NW leg** (`nx-approach-nw-lane-001`, sha `d46a60fb…`): run az306
  r37→58, bend, az315 r58→71. Boundary candidates: bend at r58; district
  arrival r71 (lavender corner).
- **NE leg** (`nx-approach-ne-lane-002`, sha `a27bc9a2…`): run az54 r24→48,
  jink pivot (54, az48), home straight to (72, az15). Boundary candidates:
  jink pivot r48; district arrival r72.
- **SW leg** (`nx-approach-sw-lane-003`, sha `56b35877…`): straight radial
  az217.25 r24→71. Boundary candidates: midpoint r47; district arrival
  r71 (temple seed ring).
- **SE leg**: NO proven corridor (infeasibility proof, APPROACH-PLAN) —
  queue holds until Bill's siting call.

## Queue (seed; FIRST WAKEUP re-verifies each boundary against the LIVE
census and the legs' live tuples before building)

Rotation NW → NE → SW (→ SE if Bill opens a corridor).

| # | Leg | Boundary | Verge side | Status |
|---|-----|----------|-----------|--------|
| 1 | NW | bend r58 (az306→315) | outer | **PLACED mile-1** |
| 2 | NE | jink pivot r48 | outer | pending |
| 3 | SW | midpoint r47 | outer | pending |
| 4 | NW | district arrival r71 | inner (district-facing) | pending |
| 5 | NE | district arrival r72 | inner | pending |
| 6 | SW | district arrival r71 | inner | pending |
| 7+ | SE | per Bill's siting call | TBD | held |

"Outer" = village-facing side of the lane (walking outward, the left-hand
verge); "inner" = district-facing. First wakeup may swap sides where the
live leg decode shows a better verge shoulder.

## Lamp budget (per district, counted from LIVE census at first wakeup, mile-1)

| district | live lights | budget | used | notes |
|----------|-------------|--------|------|-------|
| NW | 5 (market, garden-cottage, tower-house, approach-lamp-001/002) | lamp only if a marker lands past every light | 0 | bend marker sits between the leg's own lamps — unlit |
| NE | 6 | same law | 0 | counted mile-1 |
| SW | 6 | same law | 0 | counted mile-1 |
| SE | — (no leg) | — | — | holds with the SE call |

## Siting + build log (filled per marker)

- **mile-1 (2026-09-05)** — NW bend milestone pair. Boundary: the NW leg's
  bend (az306 run → az315 home), B = (−46.923, 34.092) from the committed
  polyline (mkv3-nw-approach1.ts P1). Posts on the bend bisector az310.5 at
  ±2.3m: `nx-mile-nw-001` inner (village-side, −45.429, 0.0155, 35.840) and
  `nx-mile-nw-002` outer (district-side, −48.417, 0.0222, 32.343) — note the
  placer's slot comments swap the labels; live tuples are authoritative.
  Build: `assets/mkv3-mile-nw.ts` → `village_mile_nw.glb`, sha
  `9459eaa30382fb3c7113a449f2403cf427f6be728d0bc047a03a0c47ae88bd9e`,
  deterministic ×2. Decode: 2 nodes (stone, iron buckets), top 1.04m
  (≤1.1 law), footprint ±0.21m. Review: `reviews/mile-nw-001/` judged via
  zai-vision fallback (native vision backend rejected image content;
  browser down) — pitfall-5 cross-check vs the ACCEPTED live sibling
  `village_milestone_n.glb` under the same rig drew the identical critique
  (wood-read, flat iron at distance), so family/rig characteristics, not
  per-work defects; contract met. Unlit stone — no lamp budget spent.
  Placement: hash-gated placer `mile-nw-place.ts` — fresh-census SAT clean
  (no solid within 15m), single upload (content-addressed), 2 spawn verbs,
  post-place tuple verify, idempotent rerun zero verbs. Verdict: PLACED_VERIFIED.
  NEXT: mile-2 NE jink pivot r48.

## Carried laws

- No paver contact: verge-side only; ground-layer exemption for the leg's
  thin film; 1.4m pinch law against every solid neighbor.
- Height ≤1.1m; 18m arrival cones of district works stay clear.
- Standing gate real exit 0 before any live mutation; ledger law EXACT;
  one append per wakeup; stage only lane-owned paths.
