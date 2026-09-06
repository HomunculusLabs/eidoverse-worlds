# SWEEP-PLAN — sweep-N lane (commons-next integrator audit)

Loop: SWEEP-LOOP.md · Zero world mutation · Bill alone may end this loop.
Standing tool: `agents/arthur/sweep-sat-next.ts` (exit 0 = SWEEP ALL CLEAR).
Baseline census: `agents/arthur/reviews/sweep-census-baseline.json`.

## Sweep history

| tag | date | census | overlap | walks | integrity | verdict |
|-----|------|--------|---------|-------|-----------|---------|
| sweep-1 | 2026-09-05 | 227→229 (+2 mile-nw pair, mid-tick, domain-valid) | ALL CLEAR (194 bbox ents, 202 classified, 0 unclassified) | tier-1 4/4 ALL PASS | pins 15/15, carousel comps 7/7, lamps standing, woodyard lib 1f2c6f592095b204 exact, ledger law exact, gate exit 0 | CLEAN SWEEP |
| sweep-2 | 2026-09-06 | 229→234 (+5 mid-tick siblings: dress-1 hedge, waysign-1 stable sign, mile-2 NE pair, waysign-2 dyer sign — all domain-valid, tuples match ledgers, 0 departures) | ALL CLEAR at 234 (196 bbox ents, 209 classified, 0 unclassified, re-run post-arrival) | tier-1 4/4 ALL PASS (0.38/0.38/0.37; NE re-walked post-arrival) + tier-2 inn 0.364 / stable 0.396 ALL PASS | pins 15/15, carousel comps 7/7, gate lamps + -l lights standing, woodyard 1f2c6f592095b204 exact, ledger law exact, interlane md5 stable, gate exit 0 | CLEAN SWEEP |
| sweep-3 | 2026-09-06 | 234→235 (+1 dress-2 NE work yard nx-dress-ne-yard-001 @ (55.91,-0.034,87.1) yaw 2.571 — domain-valid, tuple matches dress-2 ledger @ HEAD ad9d0d7; 0 departures, 0 pose/lib drift on 234 shared ids) | ALL CLEAR at 235 (200 bbox non-light ents, 209 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs max-arr 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 longhouse 0.346 + tower-house 0.377 ALL PASS | pins 15/15 (bad: []), carousel compKeys exact 7 (motion:carousel, motion:horse_{0,2,4,6}, particles:smoke, sockets), gate lamps + -l lights standing, woodyard 1f2c6f592095b204 exact, interlane md5 stable, standing gate exit 0 | CLEAN SWEEP |
| sweep-4 | 2026-09-06 | 235→239 (+4 domain-valid: dress-3 SE stones nx-dress-se-stones-001 @ (52.61,-0.011,-47.8) yaw 0.785 lib 8dafb9e5; mile-3 SW pair nx-mile-sw-005/-006 @ (-27.06,-0.052,-35.58)/(-29.84,-0.046,-39.24) shared lib 9459eaa3; waysign-3 kiln sign nx-sign-kiln-001 @ (30.47,2.45,38.32) — all tuples match lane ledgers @ HEAD 43bbe86/5c778e8/dc145f7; 0 departures, 0 drift on 235 shared ids) | ALL CLEAR at 239 (204 bbox non-light ents, 214 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 hall 0.360 + row-cottage 0.384 ALL PASS | pins 15/15 (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps + -l lights standing (35 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact, interlane md5 f7865b648dfa9dc4 stable, standing gate exit 0 | CLEAN SWEEP |

## Findings register

sweep-1: none. All 89 raw overlap hits classified into standing classes with
named precedent (below). No defect notes written to any owning lane.

sweep-2: none. Mid-tick sibling arrivals observed and classified in-flight
(expected fleet behavior); overlap re-run after their landing stayed ALL CLEAR.
No defect notes written. Next tier-2 pair (sweep-3): longhouse + tower-house.

sweep-3: none. Sibling arrival (dress-2 yard) domain-valid and tuple-exact.
No defect notes written. Next tier-2 pair (sweep-4): hall + row-cottage.

sweep-4: none. Four sibling arrivals all domain-valid, tuple-exact vs their
lane ledgers. One probe artifact during integrity: first carousel comp
extraction keyed the wrong field (comps vs compKeys) and read empty —
decode against the census payload confirmed the bag intact, no finding.
Next tier-2 pair (sweep-5): bunkhouse + garden-cottage.

## Overlap exemption classes (frozen in sweep-sat-next.ts)

- E1 lights (kind=light) — not geometry.
- E2 thin film/ground: bbox height ≤ 0.5 on either side.
- E3 suspended: pos.y ≥ 2.0 on either side.
- E2b ground-film compounds: nx-town-roads, nx-town-streetlamps,
  nx-core-paths, nx-approach-{nw,ne,sw}-lane-00{1,2,3} — walk-surface meshes
  spanning the plaza/approaches; per-stone clearance proven at placement
  (ground-layer law nvp-109..132 / struct-26; approach-1/2/3 ledgers).
- E4b riders: nx-artwalk-b*, nx-shutters, nx-sign-* — mounted works whose
  bbox envelopes the host seam (host-rider law, artwalk b-series).
- E4 designed pairs: cistern|court, court|sign-bakery, court|sign-smithy
  (nvp-22 intended set); hearth|struct-crossing (struct-34 named exception,
  measured −1.06 vs ledgered −1.22 same artifact class);
  town-monument|welcome (R-114 idiom, arm-points-at-monument bbox kiss).

New pair types not matching a class = UNCLASSIFIED = finding candidate:
decode at source BEFORE registering (probes lie, the village doesn't).

## Frozen route list (tier-1 — walked EVERY sweep, two-way MCPL)

1. core: tower, court-workshop, court-bakery, carousel, south-spoke
   (`next-walk-core-paths.ts`, ALL PASS sweep-1, max arrival 0.32)
2. approach NW winding lane (`nw-approach1-walk.ts`, ALL PASS sweep-1)
3. approach NE gallery lane (`ne-approach2-walk.ts`, ALL PASS sweep-1)
4. approach SW straight (`sw-approach3-walk.ts`, ALL PASS sweep-1)

Tier-2 rotation (starts sweep-2, 2 per sweep, cycle and record): door-lane
circuits interior-walk-{inn,stable,hall,longhouse,tower-house,row-cottage,
garden-cottage,bunkhouse,market,potter,forge}.ts and struct circuit walks.
Tier-2 legs walked in a sweep are named in that sweep's history row; a
tier-2 leg is never claimed without its run that wakeup.

## Integrity pins (checked EVERY sweep)

- struct fleet: `struct18-fleet-pin-check.ts` → ALL_PINS_OK (15 checked).
- carousel comp bag: motion:carousel, horse_{0,2,4,6}, particles:smoke,
  sockets; lib pinned.
- gate lamps: nx-approach-lamp-{e,n,s,w} + matched -l lights standing.
- woodyard: nx-town-woodyard lib 1f2c6f592095b204 (deterministic pin).
- standing gate: bun agents/arthur/verify-repairs.ts real exit 0.
- ledger law EXACT; interlane md5 baseline
  f7865b648dfa9dc4681876fd6855b5c2 (INTERLANE-PROTOCOL.md @ 0b860e4).

## Census snapshot discipline

Each sweep diffs live census against the PREVIOUS sweep's snapshot (not this
baseline); snapshot file updated in-place each sweep. Prefix-domain map per
INTERLANE-PROTOCOL.md (ten lanes). Sibling placements landing mid-tick are
expected fleet behavior — classify as sibling work-in-flight, verify domain
prefix + scale sanity + SAT inclusion, never treat as drift.
