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
| 2 | NE | jink pivot r48 | outer | **PLACED mile-2** |
| 3 | SW | midpoint r47 | outer | **PLACED mile-3** |
| 4 | NW | district arrival r71 | inner (district-facing) | **PLACED mile-5** (resite −1.5m, see log) |
| 5 | NE | district arrival r72 | inner | pending |
| 6 | SW | district arrival r71 | inner | pending |
| 7+ | SE | per Bill's siting call | TBD | held |

"Outer" = village-facing side of the lane (walking outward, the left-hand
verge); "inner" = district-facing. First wakeup may swap sides where the
live leg decode shows a better verge shoulder.

## Lamp budget (per district, counted from LIVE census at first wakeup, mile-1)

| district | live lights | budget | used | notes |
|----------|-------------|--------|------|-------|
| NW | 5 (market, garden-cottage, tower-house, approach-lamp-001/002) | lamp only if a marker lands past every light | 1 | mile-5 arrival pair LIT (last leg light r66.9 < marker r71); bend marker unlit |
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

- **mile-2 (2026-09-06, overnight fleet)** — NE jink milestone pair. Boundary:
  the NE leg's jink pivot P1 = pol(48,54) = (38.833, 28.216) from the
  committed polyline (mkv3-ne-approach2.ts). Posts on the corner bisector
  (run az54 → jink az9.3, bis az31.66) at ±2.3m: `nx-mile-ne-003` village-side
  (36.875, −0.0328, 29.421) and `nx-mile-ne-004` district-side (40.791,
  −0.0255, 27.011). 2.13m clearance to BOTH segment centerlines (paver
  0.46 + hem 1.35 law satisfied on both arms). Same proven GLB as mile-1
  (village_mile_nw.glb, sha `9459eaa3…` — degenerate-fleet + deterministic
  hold-shortcut: byte-identical bytes carry the accepted visual verdict;
  anchors: mile-1 entry + reviews/mile-nw-001/). Placement: hash-gated placer
  `mile-ne-place.ts` — fresh-census SAT clean (min solid gaps 2.20m vs
  nx-dress-charcoal / 3.50m vs nx-struct-spiralfolly, both >1.4 pinch law),
  NO upload (lib already live on sibling nx-mile-nw-001 — no-upload law),
  2 spawn verbs @800ms, post-place tuple verify, idempotent rerun zero verbs.
  Terrain: fresh preflight next-terrain-mile-ne.ts (pivot −0.030, posts
  −0.033/−0.026). Unlit stone — NE lamp budget 0 spent (pivot flanked by the
  leg's own lamp rhythm). Verdict: PLACED_VERIFIED.
  NEXT: mile-3 SW midpoint r47.

- **mile-3 (2026-09-06, overnight fleet)** — SW midpoint milestone pair.
  Boundary: the SW leg's midpoint M = pol(47,217.25) = (−28.4488, −37.4121)
  from the committed polyline (mkv3-sw-approach3.ts; straight radial az217.25
  r24→71). Straight leg → pair straddles the PERPENDICULAR (pair axis
  az307.25/127.25): `nx-mile-sw-005` village-side (−27.057, −0.052, −35.581)
  and `nx-mile-sw-006` district-side (−29.841, −0.046, −39.243), ±2.3m off M.
  Centerline clearance 2.3 − 0.46 paver half = 1.84m (paver + hem + pinch law
  satisfied). Same proven GLB as mile-1/2 (village_mile_nw.glb, sha
  `9459eaa3…` — degenerate fleet; accepted verdict carried by byte-identical
  bytes, anchors MILESTONE-PLAN mile-1 + reviews/mile-nw-001). Placement:
  hash-gated placer `mile-sw-place.ts` — fresh-census SAT clean (min solid
  gaps 2.28m / 4.85m vs nx-struct-angler, both > 1.4 pinch law), NO upload
  (lib already live on sibling nx-mile-nw-001 — no-upload law), 2 spawn verbs
  @800ms, post-place tuple verify, idempotent rerun zero verbs. Terrain:
  fresh preflight next-terrain-mile-sw.ts (M −0.050, posts −0.052/−0.046).
  Unlit stone — SW lamp budget 0 spent (midpoint between the leg's own lamps
  at r≈39.7/r≈55.4, 7.5m/8.5m away). Verdict: PLACED_VERIFIED.
  **CORRECTED mile-4 (2026-09-06, overnight fleet)** — the pair was ON the
  pavers: the placer derived the "perpendicular" as N=(cos(pa),-sin(pa)),
  pa=az+90, which is the direction of azimuth pa+90 = the NEGATED leg travel
  direction, not a perpendicular. Live evidence: posts sat on the centerline
  at r44.7/r49.3. The logged 1.84m clearance was hand-derived from the same
  wrong formula; no code check had measured centerline distance. Fix: dir(az)
  =(sin,cos) (matches pol()); corrective reseat remove→spawn over one WS
  (`mile-swfix-place.ts`, terrain fresh via next-terrain-mile-swfix.ts
  −0.047/−0.053): nx-mile-sw-005 (−26.618, −0.047, −38.804) and
  nx-mile-sw-006 (−30.280, −0.053, −36.020), true perp 2.30m both posts
  (verge clear 1.40m past paver half). SAT at corrected tuples: 1.62m /
  5.29m vs nx-struct-angler (>1.4 pinch). A centerline check is now IN CODE
  in the placer. mile-1 (2.29m) and mile-2 (2.13m) re-verified this tick
  from committed sources — correct, only mile-3 was affected.
  NEXT: mile-5 NW district arrival r71 (inner, district-facing verge).

- **mile-5 (2026-09-06, overnight fleet)** — NW district ARRIVAL milestone
  pair, first LIT variant. Boundary: the NW leg's arrival A = pol(71,315),
  end of the committed az315 home straight (mkv3-nw-approach1.ts P2).
  RESITE: the live SAT gate caught a 1.37m pinch vs sibling
  nx-dress-nw-skeps-001 (dress lane landed at r76.4 az315.5 mid-tick) —
  pair pulled 1.5m inward along the leg: M = A − 1.5·dir(315) =
  (−49.1439, 49.1439), posts still exactly 2.30m off the az315 radial
  (in-code centerline check), SAT now 2.87m both posts. Posts:
  `nx-mile-nw-007` village-side (−47.518, 0.028, 50.770) yaw 135° LIT and
  `nx-mile-nw-008` district-side (−50.770, 0.039, 47.518) yaw −45° unlit —
  each arm aims at the lane centerline. Build: `assets/mkv3-mile-nw2.ts` →
  `village_mile_nw2.glb` v3, sha
  `052120d7646f5f746fd3559f7274d4d57d30e0d81ce97b4a741f469162bc9145`,
  deterministic ×2. Decode: 5 nodes (2 material buckets + KEEP "lamp"
  cage group), 136 verts, top 0.91m ≤ 1.1 law, footprint x [−0.21, 0.325]
  (asymmetric arm — SAT used the target-bbox-center transform). Review:
  v1 rejected (arm read as a nub — no suspension), v2 accepted-in-structure
  with micro-pass, v3 ACCEPT via zai-vision fallback (native vision down,
  5th consecutive tick; disclosed) — hanging-lantern read, plinth+cap marker
  read, no new defects. Lamp: marker provably past every NW light (last leg
  light r66.9) → ONE refine-198 milestone-lamp on the village-side post,
  `nx-mile-nw-007-l` at cage center (−47.680, 0.678, 50.608), warm
  0xffb066, intensity 1.2, range 8, verified via light history fold.
  NW lamp budget: 1 used. Placement: hash-gated placer `mile-nw2-place.ts`
  — single upload, 3 verbs @800ms (2 spawn + 1 light), post-place tuple +
  light verify, idempotent zero-verb rerun. Verdict: PLACED_VERIFIED.
  NEXT: mile-6 NE district arrival r72 (inner).

## Lesson (mile-3 defect, class-level)

Perpendicular = 90° from the leg's travel direction dir(az)=(sin,cos) — the
same convention as pol(). Never derive offsets with N=(cos(pa),−sin(pa)):
that compound is the direction of azimuth pa+90 and for pa=az+90 collapses
to the negated travel direction. Any logged clearance claim must be computed
by code, not hand-derived from the siting formula.

## Carried laws

- No paver contact: verge-side only; ground-layer exemption for the leg's
  thin film; 1.4m pinch law against every solid neighbor.
- Height ≤1.1m; 18m arrival cones of district works stay clear.
- Standing gate real exit 0 before any live mutation; ledger law EXACT;
  one append per wakeup; stage only lane-owned paths.
