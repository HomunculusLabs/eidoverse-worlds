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
| sweep-5 | 2026-09-06 | 239→241 (+2 domain-valid: dress-4 SW gravel nx-dress-sw-gravel-001 @ (-45.22,-0.05,-59.46) yaw 2.221 lib fd21de9f; waysign-4 potter sign nx-sign-potter-001 @ (23.09,0,38.66) yaw -2.583 lib bc05a4f3 — tuples match lane ledgers @ HEAD 437dccb/2776f27; plus mile-4 corrective reseat of nx-mile-sw-005/-006 off-centerline, live tuples match 0717445; 0 departures, 0 unexplained drift) | ALL CLEAR at 241 (206 bbox non-light ents, 217 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 bunkhouse 0.380 + garden-cottage 0.355 ALL PASS | pins 15/15 (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps + -l lights standing (35 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370180), interlane md5 f7865b648dfa9dc4 stable, standing gate exit 0 | CLEAN SWEEP |
|| sweep-6 | 2026-09-06 | 241→246 (+5 domain-valid: dress-5 NW skeps nx-dress-nw-skeps-001 @ (-53.57,0.04,54.5) yaw 2.356 lib 806f2c4e; mile-5 NW arrival pair nx-mile-nw-007/-008 @ (-47.52,0.03,50.77)/(-50.77,0.04,47.52) shared lib 052120d7 + first LIT milestone lamp nx-mile-nw-007-l @ (-47.68,0.68,50.61); waysign-5 woodyard sign nx-sign-woodyard-001 @ (15.43,2.05,29.89) yaw -2.67 lib 58f5cbe3 — all tuples match lane ledgers @ HEAD 2eba7d0/dc9300d/acd7e9c; 0 departures, 0 drift on 241 shared ids) | ALL CLEAR at 246 (210 bbox non-light ents, 223 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 market 0.389 + forge 0.375 ALL PASS | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps + 4 -l lights standing (36 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370187), interlane md5 f7865b648dfa9dc4 stable, standing gate exit 0 | CLEAN SWEEP |
||| sweep-7 | 2026-09-06 | 246→251 (+5 domain-valid: dress-6 NE bench nx-dress-ne-bench-001 @ (14.23,0,73.13) yaw 0.192 lib 46f3b6b1; mile-6 NE pair nx-mile-ne-009/-010 @ (16.70,0.002,68.30)/(20.57,-0.001,70.79) shared lib 052120d7 + LIT lamp nx-mile-ne-009-l; waysign-6 mill sign nx-sign-mill-001 @ (-37.5,2.78,1.6) yaw 1.571 lib 5b6a55bd — all tuples match lane ledgers @ HEAD 2560e55/ae4bc84/e544ac3; 0 departures, 0 drift on 246 shared ids) | ALL CLEAR at 251 (214 bbox non-light ents, 224 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 stable 0.396 ALL PASS + struct2 observatory circuit ALL_PASS (no kiln interior walk exists — kiln not enterable; struct circuit substituted, named here) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps + -l lights standing (37 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370196), interlane md5 f7865b648dfa9dc4 stable, standing gate exit 0 | CLEAN SWEEP |
||| sweep-9 | 2026-09-06 | 256==256 steady state (218 thing + 38 light; 0 new, 0 departed, 0 drift on all shared ids — no sibling landed between sweep-8 and this tick) | ALL CLEAR at 256 (218 bbox non-light ents, 227 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs max-arr 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 inn 0.364 + stable 0.396 ALL PASS (second cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 36 -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370198), interlane md5 f7865b648dfa9dc4 stable, standing gate exit 0 | CLEAN SWEEP |
||| sweep-10 | 2026-09-06 | 256→258 (+2 domain-valid across two fresh reads: dress-9 NE woodstack nx-dress-ne-woodstack-001 @ (59.708,-0.032,51.781) yaw -2.356 lib c832da5d; dress-10 NW log pile nx-dress-nw-logpile-001 @ (-66.8,0.029,51.2) yaw -0.7854 lib cac71bff — landed mid-tick between survey and ledger, tuples match lane ledgers @ HEAD 9e44a38/9d6411b; 0 departures, 0 drift on shared ids) | ALL CLEAR at 258 (220 bbox non-light, 227 classified, 0 unclassified; SAT re-run post dress-10 arrival) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 hall 0.360 + row-cottage 0.384 ALL PASS (second cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 34 -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 | CLEAN SWEEP |
| sweep-11 | 2026-09-06 | 258==258 steady state (220 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all shared ids vs the committed sweep-10 snapshot) | ALL CLEAR at 258 (220 bbox non-light, 227 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 0.38 / NW 0.38 / NE 0.38 / SW 0.37, zero failing legs) + tier-2 bunkhouse 0.380 + garden-cottage 0.355 ALL PASS (second cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + all matched -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact, interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 at HEAD ac179ce | CLEAN SWEEP |
| sweep-12 | 2026-09-06 | 258→259 (+1 domain-valid: dress-11 NW gate stile nx-dress-nw-stile-001 @ (-45.25,0.046,54.45) yaw 2.356 lib 5a8de30d, tuple matches dress-11 ledger @ HEAD 0998c5a; 0 departures, 0 drift on 258 shared ids) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified, stile included in live SAT set) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37 — SW first attempt hit the tool-layer timeout, one paced retry per malformed-live-response discipline returned ALL PASS) + tier-2 market 0.389 + forge 0.375 ALL PASS (second cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 36 -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370204), interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 at HEAD 0998c5a | CLEAN SWEEP |
| sweep-13 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-12 snapshot — second fully quiet delta of the wave) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 inn 0.364 + stable 0.396 ALL PASS (second cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 36 -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370204), interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 at HEAD 3ba0dd1 | CLEAN SWEEP |
| sweep-14 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-13 snapshot — third fully quiet delta of the wave) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 hall 0.360 + row-cottage 0.384 ALL PASS (third cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 36 -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370204), interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 at HEAD c21a9ee | CLEAN SWEEP |
| sweep-15 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-14 snapshot — fourth fully quiet delta of the wave) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 potter 0.366 + market 0.389 ALL PASS (third cycle; foreign-seam abstains on dress/garden/struct entities = known diagnostics, normalized set unchanged) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 36 -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370204), interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 at HEAD df9f239 | CLEAN SWEEP |
| sweep-16 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-15 snapshot — fifth fully quiet delta of the wave) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 stable 0.396 + observatory circuit ALL PASS (third cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370204), interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 at HEAD 68ff9a3 | CLEAN SWEEP |
| sweep-17 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-16 snapshot — sixth fully quiet delta of the wave) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 bunkhouse 0.380 + garden-cottage 0.355 ALL PASS (fourth cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370204), interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 at HEAD 4132392 | CLEAN SWEEP |
| sweep-18 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-17 snapshot — seventh fully quiet delta of the wave; snapshot byte-identical, no rewrite) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs; NW + NE + SW approach legs — first chained run hit the 400s tool timeout on SW, legs re-run individually, all exit 0 ALL_PASS) + tier-2 inn + stable ALL PASS (fourth cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370204), interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 at HEAD 71ca2b3 | CLEAN SWEEP |
|| sweep-19 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-18 snapshot — eighth fully quiet delta of the wave; snapshot byte-identical, no rewrite) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs; NW + NE + SW approach legs) + tier-2 hall + row-cottage ALL PASS (fifth cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 standing + 36 -l lights (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370204), interlane md5 f7865b648dfa9dc4 stable, standing gate real exit 0 at HEAD 825a844 | CLEAN SWEEP |
| sweep-8 | 2026-09-06 | 251→256 (+5 domain-valid across two post-arrival checks: dress-7 SE cairn nx-dress-se-cairn-001 @ (58.70,0.0076,-58.70) yaw -0.785 lib bc601ed2, tuple matches e1d7968 exactly; mile-7 SW pair nx-mile-sw-013/-014 @ (-36.91,-0.042,-52.34)/(-40.57,-0.0499,-49.55) shared lib 052120d7 + LIT lamp nx-mile-sw-013-l; dress-8 SW prayer stones nx-dress-sw-prayer-001 @ (-52.26,-0.032,-64.53) yaw 2.221 lib 5074600f, landed mid-tick and verified post-arrival — SAT re-run clean; 0 departures, 0 drift on 251 shared ids; 38 lights live) | ALL CLEAR at 256 (218 bbox non-light ents, 227 classified, 0 unclassified — one new NAMED exemption class added: nx-dress-se-cairn-001\|nx-wild-forest-0044, source-true occupancy decode re-run, live lib 43e4c8c3 == decoded bytes, effective clearance 2.58m ≥ 1.4m pinch law, see findings) | tier-1 4/4 ALL PASS (core 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 potter 0.366 + market 0.389 ALL PASS | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps + 4 -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370196 at entry), interlane md5 f7865b648dfa9dc4 stable, standing gate exit 0 | CLEAN SWEEP |

| sweep-20 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-19 snapshot — ninth fully quiet delta of the wave; snapshot byte-identical 71867B, no rewrite) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs; NW + NE + SW approach legs) + tier-2 potter + market ALL PASS (fifth cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370207), interlane md5 1b933f3454e52504 NEW BASELINE (nvp-150 widen-only diff verified line-by-line), standing gate real exit 0 at HEAD bc843e5 | CLEAN SWEEP |

| sweep-21 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-20 snapshot — tenth fully quiet delta of the wave; raw /geom snapshot byte-identical 71867B, no rewrite) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37) + tier-2 inn 0.364 + stable 0.396 ALL PASS (fifth cycle, all real exit 0) | pins 15/15 ALL_PINS_OK (bad: []), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 38 lights standing, woodyard 1f2c6f592095b204 exact, ledger law exact (2370208), interlane md5 1b933f3454e52504 stable, standing gate real exit 0 at HEAD c5ff981 (sibling improve-1 accepted by prefix gate) | CLEAN SWEEP |

| sweep-22 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-21 snapshot — eleventh fully quiet delta of the wave; raw /geom snapshot byte-identical 71867B, no rewrite) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 0.38; NW 0.38 / NE 0.38 / SW 0.37; verdicts content-anchored) + tier-2 hall 0.360 + row-cottage 0.384 ALL PASS (sixth cycle, all real exit 0) | pins 15/15 ALL_PINS_OK (bad: []), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + -l lights standing (38 lights live), woodyard 1f2c6f592095b204 exact, ledger law exact (2370208), interlane md5 1b933f3454e52504 stable, standing gate real exit 0 at HEAD 38482e2 (sibling improve-2 accepted by prefix gate) | CLEAN SWEEP |

| sweep-23 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-22 snapshot — twelfth fully quiet delta of the wave; raw /geom snapshot byte-identical 71867B, no rewrite) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs max-arr 0.38; NW 0.38 / NE 0.38 / SW 0.37, legs run individually, all real exit 0) + tier-2 potter 0.366 + market 0.389 ALL PASS (sixth cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, woodyard 1f2c6f592095b204 exact, ledger law exact (2370208 at entry, 2370208 after D+0/E+0 append), interlane md5 1b933f3454e52504 stable, standing gate real exit 0 at HEAD 1808dd6 (sibling improve-3 analysis-only accepted by prefix gate) | CLEAN SWEEP |

|| sweep-24 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, 0 drift on all shared ids vs the committed sweep-23 snapshot — thirteenth fully quiet delta of the wave; raw /geom snapshot sha-identical 6bc53d31c388710a, no rewrite) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs max-arr 0.38; NW 0.38 / NE 0.38 / SW 0.37, all real exit 0, verdicts content-anchored) + tier-2 inn 0.364 + stable 0.396 ALL PASS (sixth cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, woodyard 1f2c6f592095b204 exact, ledger law exact (2370208 at entry, 2370208 after D+0/E+0 append), interlane md5 1b933f3454e52504d89ff0c167c4e7dc stable, standing gate real exit 0 at HEAD 4100aad (sibling improve-4 decode+plan tick, zero world mutations per its message, accepted by prefix gate) | CLEAN SWEEP |

|| sweep-25 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, ONE documented lib change: nx-town-hall 1306527a→c92c1f91 at identical tuple (9,0,-26) yaw −0.313 — matches the improve-5 re-place ledger @ c455327 exactly, domain-valid, not drift; snapshot rewritten, raw sha 017e7d27a3b5b0b8) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37, all real exit 0) + tier-2 hall 0.360 + row-cottage 0.384 ALL PASS (seventh cycle; hall walked against the new improve-5 bytes — interior door-lane contract intact post re-place) | pins 15/15 ALL_PINS_OK (bad: []), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, woodyard 1f2c6f592095b204 exact, ledger law exact (2370209 at entry, 2370209 after D+0/E+0 append), interlane md5 1b933f3454e52504d89ff0c167c4e7dc stable, standing gate real exit 0 at HEAD f26b224 (sibling improve-5v plan-steer accepted by prefix gate) | CLEAN SWEEP |
||| sweep-26 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, THREE documented lib changes at identical tuples: nx-sign-smithy d8df9400→62a8cfc (waysign-8 @ 66ebbf9), nx-struct-echoarch f38d01bb→baf4c994 (improve-6 @ 2ce5561), nx-town-inn c180c26f→6e6ff2d0 (improve-7 @ aca7c6b) — all match their lane ledgers line-for-line, domain-valid re-places, not drift; snapshot rewritten raw sha f769b09b7fd562c7) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37, all real exit 0) + tier-2 potter 0.366 + market 0.389 ALL PASS (seventh cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, woodyard 1f2c6f592095b204 exact, ledger law exact (2370215), interlane md5 1b933f3454e52504d89ff0c167c4e7dc stable, standing gate real exit 0 at HEAD aeced05 | CLEAN SWEEP |

|| sweep-27 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, TWO documented lib changes at identical tuples: nx-sign-dyer-001 38416bae→8ce2081f (waysign-9 @ 27595e4), nx-struct-crossing a5da939d→216c4bd4 (improve-8 @ 1fa1e19) — both match their lane ledger tails line-for-line, domain-valid re-places, not drift; snapshot rewritten raw sha 36c17c7278f5ed5b) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37, legs run individually, verdicts content-anchored) + tier-2 inn 0.364 + stable 0.396 ALL PASS (seventh cycle) | pins 15/15 ALL_PINS_OK (bad: []), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + companions live, 38 lights standing, woodyard 1f2c6f592095b204 exact, ledger law exact (2370218), interlane md5 1b933f3454e52504d89ff0c167c4e7dc stable, standing gate real exit 0 at HEAD 1fa1e19 | CLEAN SWEEP |
| sweep-28 | 2026-09-06 | 259==259 steady state (221 thing + 38 light; 0 arrivals, 0 departed, FIVE documented lib changes at identical tuples: nx-approach-sw-lane-003 56b35877→43817a4f (approach-4 @ 4ec8a2f), nx-sign-kiln-001 be3d8504→ecbad903 (waysign-10), nx-sign-woodyard-001 58f5cbe3→f46e12ae (waysign-11 @ 61afd73), nx-struct-skene 3a62ee83→df7f7c43 (struct-36 @ 9459238), nx-town-tower-house bd1badd2→11b31000 (improve-10 @ 8be70ed) — all match lane ledger tails line-for-line, domain-valid re-places, not drift; snapshot rewritten raw sha 478fc9d52e36101e) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified, exit 0) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37, legs run individually, verdicts content-anchored) + tier-2 potter 0.366 + market 0.389 ALL PASS (eighth cycle) | pins 14/15 + 1 classified (angler live b3dfb28a UNCHANGED; local 8c1a5047 = known quarantined in-flight sibling improve draft, STRUCTURES-PLAN 110/1088, live world unaffected), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, 38 lights standing, woodyard 1f2c6f592095b204 exact, ledger law exact (2370226), interlane md5 f6254cd02cbcbee79e54104669be6981 NEW BASELINE (improve-5z SURVEY widen-only diff verified line-by-line), standing gate real exit 0 at HEAD 61afd73 | CLEAN SWEEP |

| sweep-29 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, SIX documented lib/tuple changes at identical/micro-offset tuples: nx-approach-nw-lane-001 d46a60fb→dc256065 (approach-6 @ b1195ef), nx-dress-se-cairn-001 bc601ed2→59031a0c (dress-15 @ 13dc760), nx-struct-skymirror 8331ba88→782eb864 (struct-37 @ 4d39920), nx-sign-mill-001 5b6a55bd→870256ce (waysign-12 @ 59157d4), nx-artwalk-b26-wayband yaw π→−π/2 lib unchanged (artwalk-49 @ 5be2fcd), nx-artwalk-b7-shrine-stars y 0.25→0.2487 lib unchanged (artwalk-49) — all match lane ledger tails line-for-line, domain-valid, not drift; snapshot rewritten raw sha fe2cd59caafa41ae) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified, exit 0) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37, verdicts content-anchored) + tier-2 inn 0.364 + stable 0.396 ALL PASS (eighth cycle) | pins 14/15 + 1 classified (angler live b3dfb28a UNCHANGED; local 8c1a5047 = known quarantined in-flight sibling improve draft, racing law honored), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, 38 lights standing, woodyard 1f2c6f592095b204 exact, ledger law exact (2370232), interlane md5 f6254cd02cbcbee79e54104669be6981 stable, standing gate real exit 0 at HEAD 59157d4 | CLEAN SWEEP |

|| sweep-30 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, THREE documented lib changes at identical tuples: nx-dress-nw-stile-001 5a8de30d→5e9d301d (dress-18 v6, placer nw-dress18-place.ts uncommitted), nx-struct-millrace d2f46768→6e82dd2e (struct-38 shard row 13, next-place-struct-millrace38.ts uncommitted), nx-town-stable 5beff62e→98f2d5b6 (improve-12, next-place-improve12-stable.ts uncommitted) — all three classified domain-valid sibling work-in-flight vs their uncommitted placers, tuples unchanged, not drift; sibling night-16 independently observed the millrace settle; snapshot rewritten raw sha ddef1e966ba613c4) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified, exit 0) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37, legs run individually, verdicts content-anchored) + tier-2 potter 0.366 + market 0.389 ALL PASS (ninth cycle) | pins 14/15 + 1 classified (angler live b3dfb28a UNCHANGED; local 8c1a5047 = known quarantined in-flight sibling improve draft, racing law), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, 38 lights standing, woodyard 1f2c6f592095b204 exact, ledger law exact (2370247 after D+0/E+0 append), interlane md5 f6254cd02cbcbee79e54104669be6981 stable, standing gate real exit 0 at HEAD 81578b4 | CLEAN SWEEP |

||| sweep-31 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, ONE documented lib change at identical tuple: nx-sign-potter-001 bc05a4f3→3a6c8fe7 (waysign-13 R2-6 emblem-collapse reseat @ 038ac45, waysign-place-potter-2.ts pins the same sha) — domain-valid, not drift; snapshot rewritten raw sha f901ff3787755b37) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified, exit 0) | tier-1 4/4 ALL PASS (core / NW / NE / SW, legs run individually, verdicts content-anchored) + tier-2 inn + stable ALL PASS (ninth cycle, stable walked against improve-12 new bytes 98f2d5b6) | pins 14/15 + 1 classified (angler live b3dfb28a UNCHANGED; local 8c1a5047 = known quarantined sibling improve draft, racing law), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, 38 lights standing, woodyard 1f2c6f592095b204 exact, ledger law exact (2370250 after D+0/E+0 append), interlane md5 f6254cd02cbcbee79e54104669be6981 stable, standing gate real exit 0 absorbing mid-tick HEAD advances (038ac45 waysign-13, dfecce4 improve-12, 6cafc64 dress-18, 3ec60da artwalk-52, night-20) | CLEAN SWEEP |

|||| sweep-33 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, FOUR documented lib changes at identical tuples: nx-approach-ne-lane-002 a27bc9a2→dc52264c (approach-7 D2 night-correction @ HEAD 873a138), nx-dress-ne-woodstack-001 c832da5d→692bc54e (dress-19 committed reseat @ e06f69c), nx-dress-nw-skeps-001 806f2c4e→87d2dd16 (dress-20 rejudge, mid-tick arrival, re-captured per sweep-8/10 precedent), nx-town-bunkhouse 49f5acc4→c8636968 (improve-13 decode-bunk, mid-tick arrival, re-captured) — all domain-valid, not drift; snapshot rewritten raw sha 0f9955a3f47345f3, post-rewrite drift vs live ZERO) | ALL CLEAR at 259 (221 bbox non-light, 230 classified, 0 unclassified, exit 0 — SAT re-run post skeps+bunkhouse arrivals) | tier-1 4/4 ALL PASS (core 64 legs; NW 5 / NE 7 / SW 5 legs run individually, real exit 0, verdicts content-anchored — NE walked against the new approach-7 bytes) + tier-2 potter + market ALL PASS (eleventh cycle) | pins 13 ok / 2 classified (angler live b3dfb28a UNCHANGED, quarantined sibling improve draft, racing law; hypar live ce246def UNCHANGED, local f4cfcade→750f82ee across two reads = struct-40 actively rebuilding mid-tick 15:11, live verified fresh via curl UA, same racing-law class), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4, windmill standing 0993836012d1b17d, woodyard 1f2c6f592095b204 exact, 38 lights, ledger law exact (2370260 at gate), interlane md5 f6254cd02cbcbee79e54104669be6981 stable, standing gate real exit 0 at HEAD 873a138 (approach-7) | CLEAN SWEEP |
| sweep-32 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, ONE documented lib change at identical tuple: nx-struct-spiralfolly 20c515a0→b85ce018 (struct-39 shard row 14 honest-carriage rebuild, uncommitted at this tick — placer next-place-struct-spiralfolly.ts + mkv3-spiralfolly.ts modified in tree, ledger entry [struct-39] present uncommitted, PLACED_VERIFIED + idempotent per its own prose) — domain-valid sibling work-in-flight, not drift; snapshot rewritten raw sha 65184df6bfe4bcd5, 1-line diff, post-rewrite drift vs live ZERO) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified, exit 0 — live set includes the new spiralfolly bytes) | tier-1 4/4 ALL PASS (core 64 legs ALL_PASS; NW / NE / SW legs run individually, real exit 0, verdicts content-anchored; SW stderr abstentions = known normalized set, unchanged) + tier-2 hall + row-cottage ALL PASS (tenth cycle) | pins 14/15 + 1 classified (angler live b3dfb28a UNCHANGED; local 8c1a5047 = known quarantined sibling improve draft, same class as sweep-28..31; racing law), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4, windmill standing 0993836012d1b17d, woodyard 1f2c6f592095b204 exact, 38 lights, ledger law exact (2370258 at gate; artwalk-53..56 sibling holds appended mid-tick, prefix-disjoint), interlane md5 f6254cd02cbcbee79e54104669be6981 stable, standing gate real exit 0 at HEAD 2003491 (artwalk-53, zero-mutation hold) | CLEAN SWEEP |

| sweep-34 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, EIGHT documented domain-valid lib changes at identical tuples across two live reads: sign-bakery→waysign-15, hypar→struct-40, hedge→dress-21/24, shrine→improve-14, smithy→waysign-16, pendulum→struct-41, sw-lane→approach-13 D4 — all match committed ledgers/in-tree placers) | ALL CLEAR 221/230/0 exit 0 (SAT re-run twice) | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37 re-walked post-D4) + tier-2 twelfth cycle inn 0.36 + stable 0.325 ALL PASS | pins 14/15 + angler classified (hypar resolved), carousel comps exact 7, gate lamps 4/4, windmill+woodyard pins exact, 38 lights, ledger law exact, interlane md5 f6254cd0 stable, standing gate real exit 0 at 969a7bf, snapshot rewritten final sha e2012f709effaab3 drift ZERO | CLEAN SWEEP |
|| sweep-35 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, ONE documented domain-valid lib change at identical tuple: nx-town-row-cottage bd88cd38→add42aea — committed improve-15 execution, remove+spawn exact tuple, sha ×2 deterministic, door walk re-proven by its own lane; live bbox z max 2.673→2.72 cosmetic ridge-cap consequence, walk/SAT green; server /geom payload now also emits tris+parent — normalized out of the snapshot like-for-like per sweep-9 discipline) | ALL CLEAR 221/230/0 exit 0 | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37, verdicts content-anchored, `[physics]` banner parse handled) + tier-2 thirteenth cycle potter 0.366 + market 0.389 ALL PASS | pins 14/15 + angler classified (live b3dfb28a UNCHANGED, quarantined sibling draft, racing law), carousel comps exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, ledger law exact (2370273), interlane md5 f6254cd0 stable, standing gate real exit 0 at e8a9eb0, snapshot rewritten normalized sha 06765b248775d8a3 drift ZERO post-rewrite | CLEAN SWEEP |
|| sweep-36 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, ONE documented domain-valid lib change at identical tuple: nx-struct-mobius 04d088e1→5617f376 — committed struct-42 continuous-band rebuild @ 4b3275a, sha 5617f376 ×2 deterministic, exact-tuple re-place comp {}, PLACED_VERIFIED + idempotent + 5-leg walk 0.37 re-proven by its own lane; snapshot rewrite key-diff vs HEAD exactly this one lib field) | ALL CLEAR 221/230/0 exit 0 | tier-1 4/4 ALL PASS (core 64 legs 0.38; NW 0.38 / NE 0.38 / SW 0.37, legs run individually, verdicts content-anchored) + tier-2 fourteenth cycle inn 0.364 + stable 0.396 ALL PASS | pins 14/15 + angler classified (live b3dfb28a UNCHANGED, quarantined sibling improve draft, sweep-28..35 class, racing law), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 standing + 38 lights, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, ledger law exact 2370274 (first probe summed whole file; canonical post-[audit-balance] slice EXACT — corrected before verdict), interlane md5 f6254cd0 stable, standing gate real exit 0 at ece31e4, snapshot rewritten normalized sha 92086afc2ea7f562, post-rewrite drift vs live ZERO | CLEAN SWEEP |

||| sweep-37 | 2026-09-06 | 259==259 fully steady (221 thing + 38 light; 0 arrivals, 0 departures, 0 drift on id+pos+yaw+lib vs BOTH the committed sweep-36 snapshot and the /tmp capture — first fully-quiet delta since sweep-24 (sweeps 25–36 each carried ≥1 classified lib change); no snapshot rewrite needed) | ALL CLEAR 221/230/0 exit 0 | tier-1 4/4 ALL_PASS (core 64/64 ok max-arr 0.38; NW 5 @ 0.38; NE 7 @ 0.38; SW 5 @ 0.37, legs run individually, verdicts content-anchored on status strings + per-leg ok counts) + tier-2 fifteenth cycle potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL_PASS | pins 14/15 + angler classified (live b3dfb28a unchanged, quarantined sibling improve draft, sweep-28..36 class, racing law), carousel compKeys exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, standing gate real exit 0 at ab7eb39, ledger law exact (base 2370285 at append — sibling holds appended mid-tick, absorbed) | CLEAN SWEEP |

| sweep-38 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, SEVEN documented lib/pos changes all classified domain-valid vs authored sources: gate lamps x4 pos+lib (town-1 off-axis placer next-place-gate-lamps-offaxis.ts, uncommitted) + companions x4 follow; nx-core-paths 9ce1378d->c31b6e3f (town straight-paths replace next-replace-core-paths-straight.ts, uncommitted); nx-struct-amphi ->95a98c74 (committed struct-43 @ 4d9d061); nx-town-garden-cottage ->cee52aca (committed improve-16, classified by 3 sibling lanes); 0 drift on other shared ids) | COVERAGE HOLE exit 4 (217 bbox non-light — 4 lamps bbox:null on truncated lib, R-120; pair-set 215 classified 0 unclassified; source-true decode finds lamp-n x mapboard 9mm head-band kiss R-121) | tier-1 4/4 ALL_PASS (core 64/64 ok max-arr 0.38 against NEW core-paths bytes; NW 5/5 @ 0.38; NE 7/7 @ 0.38; SW 5/5 @ 0.37) + tier-2 sixteenth cycle inn 6/6 @ 0.364 + stable 5/5 @ 0.396 | pins 14/15 + angler classified (racing law), carousel comps exact 7 + lib ce3633992d07055e, gate lamps 4/4 at authored off-axis tuples BUT bbox:null (R-120), windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, standing gate real exit 0 at c13c022 | FINDINGS — R-120 Sev 1 + R-121 Sev 2 (both town lane, both routed REPAIR-REGISTER) |
| sweep-39 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, SIX drift fields classified domain-valid: nx-town-belltower 30407b95->2419fbc5 improve-17 @ HEAD 30dec29 (exact HEAD commit), nx-struct-observatory eb3c9b15->3d9d6ae1 struct-44 @ 537903a, nx-artwalk-b26/b34-wayband-e/s/w pos +1.75m artwalk-83 reseats @ 0efff67 — all match lane ledgers line-for-line; snapshot rewritten normalized sha 4cf99855f200008d, post-rewrite drift ZERO) | exit 4 SWEEP COVERAGE HOLE on exactly the four bbox:null lamps (217 bbox non-light, 215 classified, 0 unclassified pairs — correct loud state per sweep-38 hardening; R-120 unaddressed second sweep) | tier-1 4/4 ALL_PASS per-leg verified (core 64/64 ok 0.38, NW 5/5, NE 7/7, SW 5/5 — 81/81 legs; NW/NE/SW dist fields per-route) + tier-2 seventeenth cycle potter 6/6 @ 0.366 + market 6/6 @ 0.389 | pins 14/15 + angler classified (racing law), carousel compKeys exact 7 + lib ce3633992d07055e, belltower ladder comp live in bag corroborates improve-17, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, standing gate real exit 0 at 30dec29 + re-run ALL PASS at mid-tick HEAD 24d5632 pre-commit, ledger law exact 2370298 | ESCALATION — R-120 second register note appended (escalation law), named for Bill; R-121 unchanged, fix travels with R-120 |

||| sweep-48 | 2026-09-07 | 261→262 (+1 domain-valid arrival nx-dress-nw-orchard-rows-001 @ (-48.062,0.034,67.53) yaw 2.3562 lib 7359f025 comp {} = dress-74 round-3 widening @ 3590c11 committed mid-tick, tuple matches its committed ledger line-for-line; ONE documented lib change nx-craft-hamlet-0015 353dd6fb→b5a9de3d at identical tuple with embers comp live (full preset payload: particles/embers/origin/count/size/speed) = improve-24 @ 6daf516, EPOCH-CORRECTION class — landed after first census, all affected evidence re-taken fresh (census2, SAT re-run, NE re-walked, gate re-run); 0 departures, 0 unexplained drift; snapshot rewritten normalized sha16 54fa3947fb7b45a2, post-rewrite drift ZERO) | exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard −0.407 (known Sev 2 routed artwalk b26 @ sweep-43, tuple identical per drift set, fifth sweep since routing, no escalation due — law keys Sev 1); 224 bbox non-light, 233 classified, 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS (core 64/64 ok, NW 5/5 @ real exit 0; NE 7/7 epoch A + re-run 7/7 epoch B over the improve-24 bytes; SW 5/5) + tier-2 26th cycle hall 8/8 + row-cottage 6/6 ALL_PASS | pins 15/15 ALL_PINS_OK (7th consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2cf592095b204 exact, hamlet-0007 embers live on edd3da3e, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370317 at append, standing gate ALL PASS real exit 0 at tick-start d9c2e09 + re-run at 6daf516 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |

|| sweep-51 | 2026-09-07 | 263→264 across three live reads (+1 domain-valid arrival nx-dress-ne-anvilpad-001 @ (24.765,0,−4.570) yaw −0.90756 lib 65d686b023348c9b = dress-76 @ 2881ef6, tuple matches committed ledger + in-tree placer ne-dress76-place.ts line-for-line; THREE documented lib flips at identical tuples all classified domain-valid: nx-craft-hamlet-0054 76699206→43f4b4ac = improve-27 @ 71eb54b HAMLET FAMILY COMPLETE 5-of-5, y-span 13.396→4.45, embers live; nx-struct-beacon f5076e00→03d278be = struct-52 @ 1a275e1 slit lit-window fix, envelope byte-identical; plus sweep-50's own two changes hamlet-0041+ninesbridge reconciled — sweep-50's plan row + snapshot rewrite were UNCOMMITTED in-tree (interrupted-predecessor class, struct-9 family), folded into this commit with disclosure; register sha16 discrepancy noted: sweep-50 row says 6c8626acc088a90a, actual on-disk pre-tick was 1c19f6f56b23ee49 — content verified identical in classified fields either way; 0 departures, 0 unexplained drift; snapshot rewritten sha16 591f4644c9948938, entity diff exactly 5 classified rows + 1 arrival, post-rewrite drift ZERO) | exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard −0.407 (known Sev 2 routed artwalk b26 @ sweep-43, tuple identical per zero-drift census, EIGHTH sweep since routing, no escalation due — law keys Sev 1); 226 bbox non-light, 233 classified, 0 coverage holes | tier-1 81/81 ALL_PASS real exit 0 each (core 64/64 ok max dist 0.38; NW 5/5 @ 0.38; NE 7/7 epoch B post-anvilpad; SW 5/5 @ 0.37) + tier-2 29th cycle hall 8/8 @ 0.36 + row-cottage 6/6 @ 0.384 ALL PASS | pins 15/15 ALL_PINS_OK (10th consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + companions live @ 1.96m, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact (canonical; sweep-48 row's 1f2cf… is a transposition typo), hamlet-0007/0015/0028/0041/0054 embers ALL live 5-of-5, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370325 at append, standing gate ALL PASS real exit 0 at tick-start caeb34b + re-run at 2881ef6 after all three interleaves | CLEAN SWEEP — R-121 open, known, no escalation due |
||| sweep-52 | 2026-09-07 | 264==264 fully quiet vs sweep-51 baseline, then EPOCH-CORRECTION: improve-28 cistern reseat landed mid-tick; epoch-B census exactly ONE drift field nx-cistern lib d3d3ad75→156b4fc8 identical tuple (domain-valid, classified), 0 arrivals 0 departures; snapshot rewrite NOT needed (see register note: baseline pre-dates the flip and is now stale by exactly that one lib field — recorded here as the known epoch) | ALL CLEAR-equivalent: exit 3 on exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard −0.407 (known Sev 2 artwalk-routed @ sweep-43, tuple identical per zero-drift census, ninth sweep since routing, no escalation due — law keys Sev 1); 226 bbox non-light, 233 classified, 0 coverage holes, SAT re-run at epoch B neutral | tier-1 81/81 ALL_PASS every leg real exit 0 (core 64/64 ok max 0.38 epoch A + re-run 64/64 @ 0.38 epoch B over new cistern bytes; NW 5/5; NE 7/7; SW 5/5) + tier-2 30th cycle potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS | pins 14/15 + waterstair classified (live 3ffa182c UNCHANGED in census, local GLB rebuilt 23:03 tonight = in-flight sibling struct draft per survey-17 Sev 3 intake, racing law, live unaffected), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + companions live, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers 5-of-5, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370326 at append (improve-28 D+1 absorbed mid-tick, base re-read fresh), standing gate ALL PASS real exit 0 at tick-start 57c954c + re-run at 3cb1a6b post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
|||| sweep-53 | 2026-09-07 | 264→265 across two live reads, EPOCH-CORRECTION tick: epoch A exactly the register's pre-write assertion (TWO domain-valid lib flips at identical tuples, bbox drift ZERO: nx-cistern d3d3ad75→156b4fc8 = improve-28 @ 3cb1a6b, nx-struct-waterstair 3ffa182c→4acda521 = struct-53 @ 932a756 = tick-start HEAD, both SAT-neutral material cures); then struct-54 @ 600f5c4 re-placed nx-struct-observatory 3d9d6ae1→07d18163 (envelope byte-identical, exact tuple) and dress-77/78 landed nx-dress-se-funguslogs-001 @ (40,−0.0349,−63) yaw 3.66519 lib fbc626eb comp {} (tuple matches committed DRESSING-PLAN contract line-for-line) — all affected evidence re-taken fresh: epoch-B census, SAT re-run (set 226→227, same single unclassified), gate re-run ALL PASS exit 0 at 2e71c16; snapshot rewritten final 105943B/265 entities with asserted diffs at both epochs, post-rewrite drift ZERO | exit 3 on exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard −0.407 (known Sev 2 artwalk-routed, tenth sweep since routing, no escalation due — law keys Sev 1); 227 bbox non-light epoch B, 233 classified, 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each at epoch A (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; both mid-tick changed entities >40m from every walked leg — observatory r43.7, funguslogs r74.5, tier-1 legs all r<20, no SE approach legs in the standing list — epoch-A walks unaffected by construction, SAT re-run covers the collision surface) + tier-2 31st cycle bunkhouse 6/6 @ 0.380 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK (11th consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + companions live @ 1.96m, belltower 2419fbc5 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers 5-of-5 live, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370327 at append (survey-20 + struct-54 interleaves absorbed via snapshot commits, entry at HEAD exactly once), standing gate ALL PASS real exit 0 at tick-start 932a756 + re-run at 2e71c16 | CLEAN SWEEP — R-121 open, known, no escalation due |

|| sweep-54 | 2026-09-07 | 265==265 (227 thing + 38 light; 0 arrivals, 0 departures, ONE domain-valid lib flip at identical tuple: nx-welcome 362c5be1→7d1bd0c9 = improve-29 @ 3dc4db4, PRE-tick commit — not an epoch correction, sweep-53's final census predated the reseat verbs; bbox envelope strict-subset 1.176→1.17 x; rider b25 host-local anchor on-axis exact (lx 0.000, y 1.35, lz −0.053), welcome-l companion live; 0 unexplained drift) | exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard −0.407 (known Sev 2 routed artwalk b26 @ sweep-43, eleventh sweep since routing, no escalation due — law keys Sev 1); 227 bbox non-light, 233 classified, 0 coverage holes, SAT re-run fresh over the new welcome bytes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 32nd cycle hall 8/8 @ 0.36 + row-cottage 6/6 @ 0.384 ALL PASS | pins 15/15 ALL_PINS_OK (12th consecutive), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved), belltower 2419fbc5 + ladder live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers 5-of-5, welcome-l live, 38 lights, interlane f6254cd0 stable, ledger law EXACT 2370329 at append, standing gate real exit 0 at tick-start 1849af8 | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-55 | 2026-09-07 | 265→266 (+1 arrival nx-dress-sw-incense-001 @ (−46.69,−0.0349,−65) yaw −0.92066 lib c66c4fbf scale 1 = dress-lane domain prefix, sibling work-in-flight, bbox ~1.5m footprint y −0.014..1.286 scale-sane, no departures, 0 drift on 265 shared ids on id/pos/yaw/lib/scale/kind) | exit 3 on exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard −0.407 (known Sev 2 routed artwalk b26 @ sweep-43, TWELFTH sweep since routing, no escalation due — law keys Sev 1); 228 bbox non-light, 233 classified, 0 coverage holes, incense included in live SAT set | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64, NW 5/5, NE 7/7, SW 5/5) + tier-2 33rd cycle potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK (13th consecutive), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved), belltower 2419fbc53a1d65e1 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers 5-of-5 live, welcome 7d1bd0c9 (improve-29) + welcome-l companion live, 38 lights, interlane f6254cd0 stable, ledger law EXACT at append, standing gate ALL PASS real exit 0 at tick-start 3bea55d | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-56 | 2026-09-07 | 266==266 (228 thing + 38 light; 0 arrivals, 0 departures, exactly ONE drift field set at identical tuple: nx-struct-cellardoor 5608e9f8ccdeac75→fe755f78b3f300d9 = struct-56 @ af29c5d committed PRE-tick, bbox y-min 0→−0.24 / y-span 2.16→2.4 = its ledgered below-grade steps, domain-valid, not drift) | exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard −0.407 (known Sev 2 artwalk-routed @ sweep-43, THIRTEENTH sweep since routing, no escalation due — law keys Sev 1); 228 bbox non-light, 233 classified, 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5, NE 7/7, SW 5/5) + tier-2 34th cycle bunkhouse 6/6 @ 0.380 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 14th consecutive, carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers 5-of-5 live, welcome 7d1bd0c9 + welcome-l companion live, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370597 at append, standing gate ALL PASS real exit 0 at tick-start af29c5d | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-57 | 2026-09-07 | 266→267 (+1 domain-valid arrival nx-dress-nw-compost-001 @ (−72.78,0.036,57.68) yaw 2.35619 lib 330adcbf = dress-80 @ 275e69b PRE-tick commit, live-landing visible this tick, bbox ~1.9×0.72 footprint scale-sane; struct-57 waterstair v3 re-author landed mid-tick @ 334c7c2 AFTER census → epoch B re-taken fresh per polish-270 law: final 267==267 (229 thing + 38 light; 0 departures), exactly ONE classified drift field-set nx-struct-waterstair lib 4acda521→2b418077 at identical tuple (0,−0.0322,−32) yaw 0, bbox y-min 0→−0.33 strict-subset = its ledgered envelope, domain-valid not drift; 0 unexplained drift on 265 shared ids; snapshot rewritten 106174B/267 entities/sha16 6026b9b73426307c with pre-write assertion, post-rewrite drift ZERO) | exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard −0.407 (known Sev 2 artwalk-routed @ sweep-43, FOURTEENTH sweep since routing, no escalation due — law keys Sev 1); 229 bbox non-light, 233 classified, 0 coverage holes, SAT re-run at epoch B | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; waterstair r32 south outside every walked leg — epoch-A walks stand by construction, sweep-53 precedent; SAT re-run covers collision surface) + tier-2 35th cycle stable 5/5 @ 0.396 + observatory circuit 5/5 ALL PASS (inn 6/6 @ 0.364 also walked; plan pair honored as sweep-56 recorded: stable + observatory) | pins 15/15 ALL_PINS_OK 15th consecutive, carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers 5-of-5 live, welcome 7d1bd0c9 + welcome-l companion live, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370599 at append, standing gate ALL PASS real exit 0 at tick-start ca1e243 + re-run ALL PASS exit 0 at 334c7c2 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-58 | 2026-09-07 | 267==267 (229 thing + 38 light; epoch A fully quiet vs sweep-57 baseline 6026b9b73426307c; dress-81 espalier reseat landed mid-tick @ d0a6524 -> epoch-B re-read: exactly ONE classified drift field-set nx-dress-nw-orchard-rows-001 lib 7359f025→962c5fb0 at identical tuple (−48.062,0.034,67.53) yaw 2.35619, bbox y-max 1.510→1.772 v7 canopy growth, ledger-matched, domain-valid not drift; struct-58 @ fd0fa73 analysis-only interleave; 0 departures, 0 unexplained drift) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, FIFTEENTH sweep since routing, no escalation due — law keys Sev 1); 229 bbox non-light / 233 classified / 0 coverage holes, SAT re-run at epoch B | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37, NW 5/5 @ 0.38 re-walked at epoch B — change sits 17.5m off the NW route, inside the re-verify band); tier-2 36th cycle potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 16th consecutive, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + 4 -l companions, belltower 2419fbc5 + ladder live, windmill 09938360 + woodyard 01b78fdd @ epoch C (improve-32 re-place, bbox byte-identical, classified), hamlet embers 5-of-5, welcome 7d1bd0c9 + welcome-l, 38 lights, interlane f6254cd0 stable, ledger law EXACT 2370601 at append, gate ALL PASS exit 0 at d2ad8bc + re-run at fd0fa73 | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-51: CLEAN SWEEP, triple-epoch-correction tick — the busiest
interleave window this lane has absorbed: HEAD advanced three times
mid-tick (improve-27 @ 71eb54b, struct-52 @ 1a275e1, dress-76 @ 2881ef6),
each landing AFTER earlier census reads, so per the polish-270 epoch law
every affected piece of evidence was re-taken fresh before any verdict:
census2 and census3 (final epoch stable 264==264, 0/0/0 between the last
two), SAT re-run over the anvilpad-inclusive live set (226 bbox
non-light, 233 classified, 0 coverage holes, same single unclassified =
R-121), NE approach re-walked 7/7 ALL_PASS @ 0.38 at epoch B, standing
gate re-run ALL PASS real exit 0 at 2881ef6. Census delta fully
classified: hamlet-0054 family-cure flip (HAMLET FAMILY COMPLETE
5-of-5), beacon slit lit-window flip, anvilpad arrival; 0 departures.
Interrupted-predecessor reconciliation (struct-9 class): sweep-50's own
plan row + register block + baseline rewrite sat UNCOMMITTED in-tree
while its ledger entry had already reached HEAD via improve-26's
snapshot — verified the on-disk diff was exactly sweep-50's two
classified changes, folded the files into this commit, and disclosed the
baseline sha16 discrepancy in the register (6c8626acc088a90a recorded
vs 1c19f6f56b23ee49 actual on-disk pre-tick; classified-field content
identical). Snapshot rewritten to the 7-key full-precision convention,
sha16 591f4644c9948938, post-rewrite drift vs live ZERO. Overlap: exit 3
on ONLY R-121 (lamp-n | nx-town-mapboard −0.407) — known Sev 2 routed to
artwalk with b26 choreography @ sweep-43, tuple identical per zero-drift
census, eighth sweep since routing, no escalation due (law keys Sev 1).
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core
64/64 ok max dist 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 (epoch B), SW 5/5 @
0.37. Tier-2 29th cycle: hall 8/8 @ 0.36 + row-cottage 6/6 @ 0.384 ALL
PASS. Integrity: pins 15/15 ALL_PINS_OK (10th consecutive clean),
carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full
16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) +
companions live @ 1.96m, belltower 2419fbc53a1d65e1 + ladder comp live,
windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet
embers ALL live 5-of-5, 38 lights, interlane md5 f6254cd0 stable, ledger
law EXACT 2370325. Probes self-caught pre-verdict: guessed windmill
entity id + transposed woodyard pin hash (both re-derived from the
census, not memory). Zero world mutations, zero defect notes written.
Next tier-2 pair (sweep-52): potter + market (30th cycle).

sweep-52: CLEAN SWEEP, epoch-correction tick. Census 264==264 vs the
committed sweep-51 baseline (sha16 591f4644c9948938): 0 arrivals, 0
departures, 0 drift on id+pos+yaw+lib+scale+kind — first fully-quiet
delta since sweep-50 — then improve-28 (nx-cistern raised-water reseat,
mutating) landed mid-tick at 3cb1a6b AFTER my census/SAT/walks. Per the
polish-270 epoch law all affected evidence was re-taken fresh before any
verdict: epoch-B census re-run (264==264, exactly ONE drift field =
nx-cistern lib d3d3ad75→156b4fc8 at identical tuple, domain-valid,
classified; 0 arrivals, 0 departures), SAT re-run neutral (226 bbox
non-light, 233 classified, 0 coverage holes, same single unclassified =
R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2 routed to artwalk
with b26 choreography @ sweep-43, ninth sweep since routing, NOT new, no
escalation due — the escalation law keys on severity-1), core walk
re-walked 64/64 ALL_PASS @ 0.38 at epoch B over the new cistern bytes,
standing gate re-run ALL PASS real exit 0 at 3cb1a6b. Baseline
bookkeeping: the committed snapshot pre-dates the cistern flip, so it is
now stale by exactly that one lib field; the flip is recorded here as
the known epoch and the NEXT sweep should rewrite the snapshot with this
one-field change (pre-write assert: entity diff = exactly [nx-cistern
lib]). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0: core 64/64 ok max-arr 0.38 (epochs A and B), NW 5/5, NE 7/7, SW 5/5.
Tier-2 30th cycle: potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS.
Integrity: pins 14/15 + waterstair classified (live 3ffa182c UNCHANGED
in census; local village_waterstair3.glb rebuilt 23:03 tonight =
in-flight sibling struct draft per survey-17 Sev 3 intake; racing law,
live world unaffected — angler/hypar class), carousel comp bag exact 7 +
lib ce3633992d07055e, gate lamps 4/4 on the full 16-hex
18b69a6bb2f5862f with bbox PRESENT (R-120 stays resolved) + companions
live, belltower 2419fbc53a1d65e1 + ladder comp live, windmill
0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers
5-of-5 live, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT
2370326 at append. Zero world mutations, zero defect notes, zero
uploads, zero shared-budget use. Next tier-2 pair (sweep-53): bunkhouse
+ garden-cottage (31st cycle).

sweep-53: CLEAN SWEEP, epoch-correction tick. Epoch A: census 264==264
vs the committed sweep-52 baseline — exactly the pre-write assertion
sweep-52's register note demanded (nx-cistern d3d3ad75→156b4fc8 =
improve-28 @ 3cb1a6b; nx-struct-waterstair 3ffa182c→4acda521 =
struct-53 @ 932a756, the tick's starting HEAD; bbox drift ZERO, both
SAT-neutral material cures). While the sweep ran, struct-54 (@ 600f5c4)
re-placed nx-struct-observatory 3d9d6ae1→07d18163 (envelope
byte-identical, exact tuple, walk 5/5 re-proven by its own lane) and
dress-77/78 landed nx-dress-se-funguslogs-001 @ (40, −0.0349, −63)
yaw 3.66519 lib fbc626eb comp {} — tuple matches the committed
DRESSING-PLAN contract line-for-line. Per the polish-270 epoch law all
affected evidence was re-taken fresh before commit: epoch-B census (265,
0 further change after the two classified fields), SAT re-run over the
new bytes (set 226→227 bbox non-light, 233 classified, 0 coverage
holes, same single unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk with b26 choreography @
sweep-43, tenth sweep since routing, NOT new, no escalation due — the
law keys on severity-1), standing gate re-run ALL PASS real exit 0 at
2e71c16. Walk classification: tier-1 81/81 ran at epoch A and both
changed entities sit >40m from every walked leg (observatory r43.7,
funguslogs r74.5; all tier-1 legs are r<20; the standing route list has
no SE approach legs) — epoch-A walks unaffected by construction, the
SAT re-run covers the collision surface. Snapshot rewritten in two
asserted stages (epoch A 105499B two-flip diff; epoch B final 105943B /
265 entities, +1 arrival +1 flip), post-rewrite drift vs live ZERO. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0:
core 64/64 ok max-arr 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37.
Tier-2 31st cycle: bunkhouse 6/6 @ 0.380 + garden-cottage 6/6 @ 0.355 ALL
PASS. Integrity: pins 15/15 ALL_PINS_OK (eleventh consecutive clean),
carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 on the
full 16-hex 18b69a6bb2f5862f with bbox PRESENT (R-120 stays resolved) +
companions live @ 1.96m, belltower 2419fbc5 + ladder comp live, windmill
0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers 5-of-5
live, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370327
at append (survey-20 sibling interleave absorbed, base re-read fresh
immediately before writing). Standing gate ALL PASS real exit 0 at
tick-start HEAD 932a756. PLAN-EDIT self-catch, repaired before commit: the
sweep-53 history-row patch fuzzy-matched and consumed the
'## Findings register' header (adjacent-token-bleed class, sweep-43/50
family); restored via asserted-unique-anchor python edit, header and both
sections verified whole by grep after repair. Zero world mutations, zero
defect notes, zero uploads, zero shared-budget use. Next tier-2 pair
(sweep-54): hall + row-cottage (32nd cycle).

sweep-54: CLEAN SWEEP, classified-drift tick (no epoch correction needed —
the one live change predates this tick). Census 265==265 vs the committed
sweep-53 baseline: 0 arrivals, 0 departures, exactly ONE drift field set =
nx-welcome lib 362c5be1→7d1bd0c9 (+ cosmetic bbox shrink 1.176→1.17 x-width,
envelope strict-subset) at identical tuple (−3,0,−4.3) yaw 0.6092 =
improve-29 @ 3dc4db4, committed 23:43:11, BEFORE this tick's start (HEAD
1849af8 already carried it — sweep-53's final census simply predated the
reseat verbs). Classified domain-valid, not drift. SAT re-ran fresh over the
new bytes: 227 bbox non-light, 233 classified, 0 coverage holes, exit 3 on
exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 (known
Sev 2 routed artwalk b26 choreography @ sweep-43, tuple identical,
ELEVENTH sweep since routing, NOT new, no escalation due — law keys
severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38, NW 5/5 @ 0 drift on dist, NE 7/7 @ 0.38, SW
5/5 @ 0.37. Tier-2 32nd cycle: hall 8/8 @ 0.36 + row-cottage 6/6 @ 0.384
ALL PASS. Integrity: pins 15/15 ALL_PINS_OK (twelfth consecutive clean),
carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 on full
16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved), belltower
2419fbc5 + ladder comp live, windmill 0993836012d1b17d + woodyard
1f2c6f592095b204 exact, hamlet embers 5-of-5 live, welcome-l companion
live, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370329
at append (base re-read fresh immediately before writing — two sibling
increments struct-54/survey-21 landed after sweep-53, absorbed normally).
Snapshot rewritten with pre-write assertion (diff exactly [nx-welcome
lib+bbox]) and post-rewrite drift ZERO: 265 entities, 105942B, sha16
edc71d341c08640c. Probe self-catches before verdicts: guessed entity ids
for windmill/woodyard/b25 rider (re-derived from census per sweep-51 law);
core-walk extract keyed `distance` where schema uses `dist` (re-anchored
on per-leg ok-counts, sweep-48 class). Zero world mutations, zero defect
notes, zero uploads, zero shared-budget use. Next tier-2 pair (sweep-55):
potter + market (33rd cycle).

sweep-55: CLEAN SWEEP. Census 266==265-baseline+1: exactly ONE arrival
nx-dress-sw-incense-001 @ (−46.69,−0.0349,−65) yaw −0.92066 lib c66c4fbf
scale 1, empty comp bag — dress-lane domain prefix (sibling work-in-flight;
untracked dress79-terrain.ts in tree corroborates the active dress tick),
bbox footprint ~1.5m, y −0.014..1.286 scale-sane, no departures, ZERO drift
on all 265 shared ids across id/pos/yaw/lib/scale/kind. Classified
domain-valid, not drift. Overlap: exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard −0.407 (known Sev 2 routed artwalk b26
choreography @ sweep-43, TWELFTH sweep since routing, tuple identical, NOT
new, no escalation due — law keys severity-1); 228 bbox non-light, 233
classified, 0 coverage holes, incense included in the live SAT set. Tier-1
4/4 per-leg verified 81/81 ALL_PASS every leg real exit 0: core 64/64,
NW 5/5, NE 7/7, SW 5/5. Tier-2 33rd cycle: potter 6/6 @ 0.366 + market
6/6 @ 0.389 ALL PASS. Integrity: pins 15/15 ALL_PINS_OK (thirteenth
consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, gate
lamps 4/4 on full 16-hex 18b69a6bb2f5862f with bbox PRESENT (R-120 stays
resolved), belltower 2419fbc53a1d65e1 + ladder comp live, windmill
0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers 5-of-5
live, welcome 7d1bd0c9 (improve-29 bytes) + welcome-l companion live, 38
lights, interlane md5 f6254cd0 stable, ledger law EXACT at append (base
re-read fresh immediately before writing). Snapshot rewritten with
pre-write assertion (diff exactly [arrival nx-dress-sw-incense-001]) and
post-rewrite drift ZERO: 266 entities, 106385B, sha16 a74a327ef34c5d8f.
Probe self-catches before verdicts, both repaired in-tick and disclosed:
(a) the integrity checker compared 8-hex pin shorthand against full 16-hex
libs and printed two false FAILs (belltower/welcome) — actual libs printed
from the census and prefix-verified exact; the pins were probe artifacts
(sweep-51 guessed-id class). (b) the FIRST prose-history insert for this
very row came out corrupted — fabricated SAT lines, a wrong byte count,
and a misspelled carousel hash entered the file (adjacent-token-bleed
class, sweep-43/50/53 family; caught by re-reading the written region
immediately, replaced wholesale by this block — the table row was checked
and contains none of it). (c) the first snapshot write used the census
tool's pretty schema instead of the committed normalized 7-field
projection (caught by the commit's 9156-insertion diff stat); rewritten
like-for-like and amended into this tick's commit. Zero world mutations, zero defect notes, zero
uploads, zero shared-budget use. EPOCH-B CORRECTION (disclosed): improve-30
(a3d0bfd, court reseat 59534b10→77cab2c3 @ 00:26) landed mid-tick — my
epoch-A census predates it, so per the polish-270 law all affected evidence
was re-taken fresh BEFORE the ledger append and final commit: epoch-B census
266==266 with exactly three classified sibling in-flight changes (court lib
+ smoke comp re-applied = improve-30; incense re-sited (-46.69,-65)→
(-55.475,-61.329) r82.7 = dress lane still working the piece; echoarch lib
baf4c994→103be93e @ r60 NW = struct lane in-flight), SAT re-run fresh
228/233/0-same-single-R-121, core re-walked 64/64 ALL_PASS @ 0.38 over the
new court bytes, SW re-walked 5/5 @ 0.37, pins re-run 15/15 ALL_PINS_OK +
court 77cab2c3/smoke + belltower 2419fbc5/ladder verified in epoch-B census.
Snapshot rewritten to epoch B: 266 entities, 106390B, sha16
819486a866ede438, pre-write assertion diff-classified exactly
[court.lib, incense.pos, echoarch.lib], post-rewrite drift ZERO. Next
tier-2 pair (sweep-56): bunkhouse + garden-cottage (34th cycle).

sweep-56: CLEAN SWEEP, single-classified-drift tick (no epoch correction
needed). Census 266==266 vs sweep-55 baseline: 0 arrivals, 0 departures,
exactly ONE drift field set — nx-struct-cellardoor lib
5608e9f8ccdeac75→fe755f78b3f300d9 = struct-56 @ af29c5d (tick-start
HEAD, committed pre-tick), tuple identical, bbox y-min 0→−0.24 /
y-span 2.16→2.4 exactly as its ledger documents (below-grade steps);
domain-valid, not drift. Overlap 228 bbox non-light, 233 classified, 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
mapboard −0.407 (known Sev 2 artwalk-routed @ sweep-43, THIRTEENTH
sweep since routing, no escalation due — law keys Sev 1). Tier-1 4/4
per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38;
NW 5/5; NE 7/7; SW 5/5). Tier-2 34th cycle bunkhouse 6/6 @ 0.380 +
garden-cottage 6/6 @ 0.355 ALL PASS. Pins 15/15 ALL_PINS_OK (14th
consecutive), carousel comp bag exact 7 + lib ce3633992d07055e, gate
lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays
resolved) + 4 -l companions live, belltower 2419fbc53a1d65e1 + ladder
comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204
exact, hamlet embers 5-of-5 live, welcome 7d1bd0c9 (improve-29) +
welcome-l companion live, 38 lights, interlane md5 f6254cd0 stable,
ledger law EXACT 2370597 at append, standing gate ALL PASS real exit 0
at tick-start af29c5d. Snapshot rewritten 266 ents / 106393B / sha16
c0644e98557871ec, pre-write assertion diff exactly [cellardoor.lib,
cellardoor.bbox], post-rewrite drift ZERO. Probes self-caught
pre-verdict: (a) comps-key artifact — the naive diff that read
baseline compKeys against live comp fields reported 17 false
comp-drifts (sweep-5 class, baseline schema carries no comp fields);
re-derived drift keys on id/pos/yaw/scale/lib/bbox = exactly ONE
classified change; (b) first snapshot write used indent=2 (138697B, a
32KB pure-formatting delta vs the committed indent=1 format) — caught
by size-vs-prior probe, rewritten like-for-like. Zero world mutations,
zero defect notes written, zero uploads, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-57): stable + observatory circuit
(35th cycle).


sweep-57: CLEAN SWEEP, arrival + epoch-correction tick. Census epoch A
266==266 vs the committed sweep-56 baseline with ONE domain-valid arrival
(nx-dress-nw-compost-001 @ (−72.78, 0.036, 57.68) yaw 2.35619 lib 330adcbf
= dress-80 @ 275e69b, committed PRE-tick, live-landing visible this tick;
footprint ~1.9×0.72m, scale 1, y 0.036 — scale/pose sane). While walks
ran, struct-57 (waterstair v3 re-author) committed at 334c7c2 and re-placed
nx-struct-waterstair AFTER my census, so per the polish-270 epoch law all
affected evidence was re-taken fresh before verdicts: epoch-B census (267
final, exactly ONE classified drift field-set = waterstair lib
4acda521→2b418077 at identical tuple, bbox y-min 0→−0.33 strict-subset =
its ledgered envelope; 0 departures, 0 unexplained drift on 265 shared
ids), SAT re-run (229 bbox non-light, 233 classified, 0 coverage holes,
same single unclassified = R-121), gate re-run ALL PASS real exit 0 at
334c7c2. Waterstair sits r32 south — outside every tier-1/tier-2 leg (all
r<20, sweep-53 precedent) — so epoch-A walks stand by construction and the
SAT re-run covers the collision surface. Overlap: exit 3 on ONLY R-121
(lamp-n | nx-town-mapboard −0.407), known Sev 2 routed to artwalk b26 @
sweep-43, fourteenth sweep since routing, no escalation due (law keys
severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37.
Tier-2 35th cycle exactly as sweep-56 recorded: stable 5/5 @ 0.396 +
observatory circuit 5/5 ALL PASS (inn 6/6 @ 0.364 also walked this
wakeup). Integrity: pins 15/15 ALL_PINS_OK (15th consecutive clean),
carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full
16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + 4 -l
companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill
0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet embers 5-of-5
live, welcome 7d1bd0c9 + welcome-l companion live, 38 lights, interlane
md5 f6254cd0 stable, ledger law EXACT 2370599 at append. Snapshot
rewritten 106174B / 267 entities / sha16 6026b9b73426307c with a pre-write
assertion (diff set exactly the compost arrival + waterstair lib/bbox),
post-rewrite drift vs live ZERO. Probe self-catch pre-verdict: first pin
read printed a welcome MISMATCH from prefix-comparing an 8-hex pin against
the 16-hex live lib (sweep-55 class; re-derived exact). Zero world
mutations, zero defect notes, zero uploads, zero shared-budget use.
Next tier-2 pair (sweep-58): potter + market (36th cycle).

sweep-58: CLEAN SWEEP, epoch-correction tick. Census epoch A 267==267
vs the committed sweep-57 baseline (sha16 6026b9b73426307c): 0 arrivals,
0 departures, 0 drift on id/pos/yaw/lib/scale/kind — quiet across two
early reads. Sibling dress-81 (espalier fence-read cure) landed mid-tick
at d0a6524 AFTER the census, so per the polish-270 epoch law all affected
evidence was re-taken fresh before verdicts: epoch-B census 267==267 with
exactly ONE classified drift field-set — nx-dress-nw-orchard-rows-001 lib
7359f025→962c5fb0 at identical tuple (−48.062, 0.034, 67.53) yaw 2.35619,
bbox y-max 1.510→1.772 (v7 canopy cure growth), matching its committed
ledger line-for-line; struct-58 (fd0fa73) interleaved analysis-only, zero
mutations per its own entry. SAT re-run at epoch B: 229 bbox non-light,
233 classified, 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, fifteenth sweep since routing, NOT new, no
escalation due (law keys severity-1). Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64 @ 0.38, NE 7/7 @ 0.38, SW 5/5
@ 0.37, NW 5/5 @ 0.38 RE-WALKED AT EPOCH B (the reseeded rows sit 17.5m
off the NW route — inside the re-verify band, so epoch-A NW legs were not
allowed to stand). Tier-2 36th cycle: potter 6/6 @ 0.366 + market 6/6 @
0.389 ALL PASS (all legs >74m from the change). Integrity: pins 15/15
ALL_PINS_OK (16th consecutive clean), carousel comp bag exact 7 + lib
ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT
(R-120 stays resolved) + 4 -l companions, belltower 2419fbc53a1d65e1 +
ladder comp live, windmill 0993836012d1b17d + woodyard
1f2c6f592095b204 exact, hamlet embers 5-of-5 live, welcome 7d1bd0c9 +
welcome-l companion live, 38 lights, interlane md5 f6254cd0 stable,
ledger law EXACT 2370601 at append (dress-81 D+1 absorbed mid-tick, base
re-read fresh immediately before writing). Standing gate ALL PASS real
exit 0 at tick-start d2ad8bc, re-run ALL PASS exit 0 at fd0fa73 after the
interleaves. Snapshot rewritten 106187B / 267 entities / sha16
a0f11d5e6748993b with pre-write assertion (entity diff set exactly
[orchard-rows lib+bbox]), post-rewrite drift vs live ZERO. Probes
self-caught pre-verdict: the three-way census diff mislabeled its own
comparison loop (printed epoch-B data against both baselines; timeline
and mtime review proved epoch A genuinely clean and epoch B carrying
only the classified flip — re-derived, sweep-5 class); the walk-output
parser keyed wrong result keys twice before reading the actual schema
(re-anchored on per-leg fields, sweep-48 class). Zero world mutations,
zero defect notes, zero uploads, zero shared-budget use. Next tier-2
pair (sweep-59): stable + observatory circuit (37th cycle).
| sweep-59 | 2026-09-07 | 267==267 (229 thing + 38 light; 0 arrivals, 0 departures, 0 drift on id/pos/yaw/lib/scale/kind/bbox vs sweep-58 epoch-C baseline sha16 cd9a07607226962e — single-read epoch, no mid-tick interleave, count stable across the whole tick) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, SIXTEENTH sweep since routing, no escalation due — law keys Sev 1); 229 bbox non-light / 233 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 37th cycle recorded pair stable 5/5 @ 0.396 + observatory 5/5 ALL PASS; coverage pair hall 8/8 @ 0.360 + forge 6/6 @ 0.375 (LRU rotation repair — stale sweep-58 pointer read bunkhouse+garden-cottage, the true LRU pair was hall/forge, both pairs walked and recorded this wakeup) | pins 15/15 ALL_PINS_OK 17th consecutive, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + 4 -l companions, belltower 2419fbc5 + ladder live, windmill 09938360, woodyard 01b78fdd exact, hamlet embers 5-of-5, welcome 7d1bd0c9 + welcome-l, 38 lights, 16 comp-bearing entities census-matched, interlane f6254cd0 stable, ledger law EXACT at append, gate ALL PASS exit 0 at afcc0c7 tick-start | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-60 | 2026-09-07 | 267→268 epoch-corrected (+1 domain-valid arrival nx-dress-ne-timberyard-001 @ (76.7,-0.006,69.4) yaw -2.35619 lib 10b449fa = dress-83 @ 645bba1 tuple-matched, bbox 3x1.25x2.68 scale-sane; ONE classified lib flip nx-town-windmill 09938360→369c5724 at identical tuple, bbox BYTE-IDENTICAL = improve-33 @ 71b7bd1; 0 departures, 0 unexplained drift; snapshot rewritten 107262B/268 ents/sha16 09a5c2e48a28699e, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, SEVENTEENTH sweep since routing, no escalation due — law keys Sev 1); 230 bbox non-light / 233 classified / 0 coverage holes, SAT re-run at epoch B | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 epoch A + 7/7 @ 0.38 epoch B re-walk, SW 5/5 @ 0.37) + tier-2 38th cycle row-cottage 6/6 @ 0.384 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 18th consecutive (epoch-B re-run), carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + 4 -l companions, belltower 2419fbc5 + ladder live, windmill 369c5724 (owner re-place, bbox identical), woodyard 01b78fdd exact, hamlet embers 5-of-5, welcome 7d1bd0c9 + welcome-l, 38 lights, 16 comp-bearing census-matched, interlane f6254cd0 stable, ledger law EXACT at append, gate ALL PASS exit 0 at de1b4e4 tick-start + re-run 645bba1 | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-61 | 2026-09-07 | 268→269 epoch-corrected (epoch A 268==268 fully quiet vs sweep-60 baseline sha16 09a5c2e48a28699e 0/0/0; +1 domain-valid arrival nx-struct-stillwind @ (-52,-0.031,0) yaw 0 lib 35eab2fb comp {} = struct-60 @ 0fa0508 mid-tick, tuple matches its committed ledger line-for-line, bbox 4.13x3.06x16.43 scale-sane, 39.7m from the nearest tier-1 waypoint — W mid-ring, no W route exists; 0 departures, 0 unexplained drift; snapshot rewritten 107679B/269 ents/sha16 8ab94a95922678e3, pre-write assertions, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, EIGHTEENTH sweep since routing, no escalation due — law keys Sev 1); 231 bbox non-light / 233 classified / 0 coverage holes, SAT re-run at epoch B (stillwind in live set, corroborates struct-60's own +7.26m clearance) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 @ 0.370 — epoch-A walks stand by construction, sweep-53 precedent) + tier-2 39th cycle longhouse 6/6 @ 0.346 + tower-house 6/6 @ 0.377 ALL PASS | pins 15/15 ALL_PINS_OK 19th consecutive (epoch-B re-run), carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + 4 -l companions, belltower 2419fbc5 + ladder live, windmill 369c5724 live, woodyard 01b78fdd exact, hamlet embers 5-of-5, welcome 7d1bd0c9 + welcome-l, 38 lights, 16 comp-bearing census-matched (arrival comp-neutral {}), interlane f6254cd0 stable, ledger law EXACT 2370613 at epoch-B gate, gate ALL PASS exit 0 at 96a1368 tick-start + re-run ba74502 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |

EPOCH-C CORRECTION (disclosed, correction-of-record class — improve-32
woodyard cure landed at 82a49f2 AFTER this sweep's ledger append): census-C
267==267 with exactly ONE additional classified drift field-set =
nx-town-woodyard lib 1f2c6f592095b204→01b78fdd00f090a7 at identical tuple
(16, 0, 31) yaw −2.6698151, bbox BYTE-IDENTICAL (envelope-faithful rebuild
per its own audit; [−2.1,0,−1.09]..[2.876,2.526,1.508] unchanged),
domain-valid not drift; census-D then fully quiet (epoch C stable). All
affected evidence re-taken fresh before commit: SAT re-run at epoch C
(229/233/0, same single unclassified R-121), pins re-run 15/15
ALL_PINS_OK, standing gate re-run ALL PASS real exit 0 at 82a49f2.
Walks stand by construction — the woodyard sits 17.2m (NE route), 18.1m
(core), 46.8m (NW) from every walked leg with a byte-identical collision
envelope; improve-32's own 2-leg front walk 5/5 ALL_PASS 0.370 re-proves
the approach. The ledger entry (immutably at HEAD since improve-32's
snapshot) is epoch-B-true; this block is the correction of record.
Snapshot final epoch C: 106187B / 267 entities / sha16
cd9a07607226962e (diff vs epoch-B baseline exactly [woodyard lib];
vs sweep-57 committed baseline [orchard-rows lib+bbox, woodyard lib]).

sweep-59: CLEAN SWEEP, single-epoch quiet tick. Census 267==267 (229 thing +
38 light) vs the committed sweep-58 epoch-C baseline (sha16
cd9a07607226962e): 0 arrivals, 0 departures, 0 drift on id/pos/yaw/lib/
scale/kind/bbox — one read, no interleaves (HEAD afcc0c7 = own sweep-58
close, no sibling commits since). Overlap: 229 bbox non-light, 233
classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk @
sweep-43, sixteenth sweep since routing, not new, no escalation due (law
keys severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0
each: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37.
Tier-2 37th cycle: recorded pair stable 5/5 @ 0.396 + observatory circuit
5/5 ALL PASS; ADDITIONAL coverage pair hall 8/8 @ 0.360 + forge 6/6 @
0.375. Rotation repair (disclosed, sweep-56 pointer-class): sweep-58's
"next pair" pointer named stable+observatory, but coverage analysis shows
bunkhouse+garden-cottage last walked sweep-56, making hall/forge the true
LRU pair — BOTH pairs walked this wakeup, both recorded, pointer now
corrected to the next LRU pair. Integrity: pins 15/15 ALL_PINS_OK (17th
consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e,
gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 resolved
and standing) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder comp
live, windmill 0993836012d1b17d, woodyard 01b78fdd00f090a7 exact
(improve-32 pin, plan pin-line updated to match), hamlet embers 5-of-5
live, welcome 7d1bd0c9 + welcome-l companion live, 38 lights, 16
comp-bearing entities census-matched (5 hamlets, carousel, court, forge,
hearth, tower, belltower, orrery, shelltower, artwalk h6/h7), interlane
md5 f6254cd0 stable, standing gate ALL PASS real exit 0 at tick-start
afcc0c7. Snapshot rewritten like-for-like (indent=1, sweep-56 formatting
class self-caught and reverted before commit): 106833B / 267 entities /
sha16 db344186b51caef8, pre-write assertions (old+new counts 267),
post-rewrite drift vs live ZERO. Zero world mutations, zero defect notes,
zero uploads, zero shared-budget use. Next tier-2 pair (sweep-60):
row-cottage + market (38th cycle).

sweep-60: CLEAN SWEEP, epoch-correction tick. Census epoch A 267==267
vs the committed sweep-59 baseline (sha16 db344186b51caef8): 0 arrivals,
0 departures, 0 drift on id/pos/yaw/lib/scale/kind/bbox — then two sibling
mutations landed mid-tick (improve-33 @ 71b7bd1 windmill re-place, dress-83
@ 645bba1 timberyard spawn), so per the polish-270 epoch law the affected
evidence was re-taken fresh: epoch-B census final 268 (230 thing + 38
light) with exactly ONE arrival nx-dress-ne-timberyard-001 @
(76.7,-0.006,69.4) yaw -2.35619 lib 10b449fa (dress-83, tuple matches its
committed ledger line-for-line, bbox 3x1.25x2.68 scale-sane, rim
101.59..104.42 in-band per its own placer) and ONE classified drift
field-set nx-town-windmill lib 09938360->369c5724 at identical tuple
(-40,0,0) yaw pi/2 with bbox BYTE-IDENTICAL (improve-33 Sev 1 material
cure, envelope exactly unchanged per its ledger) — domain-valid, not
drift. Overlap re-run at epoch B: 230 bbox non-light, 233 classified,
0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk @ sweep-43,
seventeenth sweep since routing, not new, no escalation due (law keys
severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0
each: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 epoch A +
re-walked 7/7 @ 0.38 at epoch B (timberyard sits 10.1m off the approach
cone — inside the re-verify band, sweep-58 precedent), SW 5/5 @ 0.37.
Tier-2 38th cycle: row-cottage 6/6 @ 0.384 + market 6/6 @ 0.389 ALL
PASS. Integrity: pins 15/15 ALL_PINS_OK (18th consecutive clean, re-run
at epoch B), carousel comp bag exact 7 + lib ce3633992d07055e, gate
lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 resolved
and standing) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder
comp live, windmill live 369c5724 (owner re-place class, envelope
byte-identical — recorded in history rows, not a sweep pin), woodyard
01b78fdd00f090a7 exact, hamlet embers 5-of-5 live, welcome 7d1bd0c9 +
welcome-l companion live, 38 lights, 16 comp-bearing entities
census-matched (epoch shift comp-neutral — both changed entities carry
empty comp bags), interlane md5 f6254cd0 stable, standing gate ALL PASS
real exit 0 at tick-start de1b4e4 + re-run at 645bba1 post-interleave.
Snapshot rewritten like-for-like: 107262B / 268 entities / sha16
09a5c2e48a28699e, pre-write assertions (exactly one arrival + exactly
one lib flip), post-rewrite drift vs live ZERO. Probes self-caught
pre-verdict: lib-pin parse sliced the store/ path prefix (re-parsed on
hex-after-path); windmill entity id derived from the census, not memory
(sweep-51 class); approach-walk dist keys re-anchored on actual schema
(sweep-48 class). Zero world mutations, zero defect notes, zero
uploads, zero shared-budget use. Next tier-2 pair (sweep-61):
longhouse + tower-house (39th cycle — last walked sweep-50, the true
LRU pair).

sweep-61: CLEAN SWEEP, epoch-correction tick. Census epoch A 268==268
fully quiet vs the committed sweep-60 baseline (sha16
09a5c2e48a28699e): 0 arrivals, 0 departures, 0 drift on
id/pos/yaw/lib/scale/kind/bbox — then survey-26 (@ ba74502) and
struct-60 (@ 0fa0508) landed mid-tick; struct-60 spawned
nx-struct-stillwind, so per the polish-270 epoch law all affected
evidence was re-taken fresh: epoch-B census 269 (231 thing + 38 light)
with exactly ONE arrival nx-struct-stillwind @ (-52,-0.031,0) yaw 0 lib
35eab2fb comp {} — tuple matches struct-60's committed ledger
line-for-line, domain-valid (struct owns nx-struct-*), bbox
4.13x3.06x16.43 scale-sane, W mid-ring site 39.7m from the nearest
tier-1 waypoint (no W route exists in the frozen list); 0 departures,
0 unexplained drift. SAT re-run at epoch B with stillwind in the live
set: 231 bbox non-light, 233 classified, 0 coverage holes, exit 3 on
exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard -0.407 —
known Sev 2 routed to artwalk @ sweep-43, eighteenth sweep since
routing, not new, no escalation due (law keys severity-1); stillwind
introduced no new contacts, corroborating struct-60's own +7.26m
clearance ledger. Tier-1 4/4 per-leg verified 81/81 ALL_PASS real
exit 0 each: core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW
5/5 @ 0.370 (epoch-A walks stand by construction — the arrival is
39.7m off every walked leg, sweep-53 precedent). Tier-2 39th cycle:
longhouse 6/6 @ 0.346 + tower-house 6/6 @ 0.377 ALL PASS. Integrity:
pins 15/15 ALL_PINS_OK (19th consecutive clean, re-run at epoch B),
carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4
full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + 4
-l companions, belltower 2419fbc53a1d65e1 + ladder comp live,
windmill 369c5724 live, woodyard 01b78fdd00f090a7 exact, hamlet
embers 5-of-5 live, welcome 7d1bd0c9 + welcome-l companion live, 38
lights, 16 comp-bearing entities census-matched (arrival
comp-neutral — stillwind carries {}), interlane md5 f6254cd0 stable,
ledger law EXACT 2370613 at the epoch-B gate, standing gate ALL PASS
real exit 0 at tick-start 96a1368 + re-run at ba74502
post-interleave. Snapshot rewritten like-for-like: 107679B / 269
entities / sha16 8ab94a95922678e3, format round-trip proven
byte-identical BEFORE the write, pre-write assertions (exactly one
arrival, sorted insert, count bump), post-rewrite drift vs live ZERO.
Probe self-caught pre-verdict: first walk-parse keyed `dist` where
the approach walkers emit `distance` — printed maxdist 0.000
plausible-looking but wrong; re-anchored on the actual per-file
schema before recording (sweep-58 class recurrence). One chained
walk re-run loop hit the 400s tool timeout on its last leg (SW);
SW re-run standalone clean — no evidence rests on the timed-out
pass. Zero world mutations, zero defect notes, zero uploads, zero
shared-budget use. Next tier-2 pair (sweep-62): bunkhouse +
garden-cottage (40th cycle — true LRU pair, both last walked
sweep-56; next-stalest inn @ sweep-57).

## Findings register

| sweep-49 | 2026-09-07 | 262→263 (+1 domain-valid arrival nx-struct-ruledtower @ (58,−0.0426,0) yaw 0 lib 4070ecc4d8f1d0e6 comp {} = struct-50 @ 990ddeb, tuple matches its committed ledger line-for-line; ONE lib flip nx-craft-hamlet-0028 032b6e24→44d78463 at identical tuple with embers comp live (particles key verified in comp JSON) = improve-25 @ 6df80eb, EPOCH-CORRECTION class — landed after first census, all affected evidence re-taken fresh (census2, SAT re-run, NE re-walked 7/7, gate re-run ALL PASS exit 0 at 6df80eb); live bbox y-span 13.311→4.724 confirms the family-cure took; 0 departures, 0 unexplained drift; snapshot rewritten normalized sha16 55af543ec07eef46, diff exactly +1 entity block +1 lib flip +count, post-rewrite drift ZERO) | exit 3 on exactly ONE unclassified = R-121 lamp-n\\|nx-town-mapboard −0.407 (known Sev 2 routed artwalk b26 @ sweep-43, tuple identical per drift set, sixth sweep since routing, no escalation due — law keys Sev 1); 225 bbox non-light, 233 classified, 0 coverage holes | tier-1 81/81 ALL_PASS real exit 0 each (core 64/64 ok max-arr 0.38; NW 5/5; NE 7/7 epoch A + re-run 7/7 epoch B; SW 5/5) + tier-2 27th cycle bunkhouse 6/6 @ 0.380 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK (8th consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet-0007/0015/0028 embers all live, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370320 at append, standing gate ALL PASS real exit 0 at tick-start a3344f1 + re-run at 6df80eb post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |

| sweep-50 | 2026-09-07 | 263→263 (225 thing + 38 light; 0 arrivals, 0 departures, TWO documented lib changes at identical tuples, epoch-verified: nx-struct-ninesbridge 1e4e84e98900d89c→8c5d9ccea9cb4076 = struct-51 stair-inversion fix @ 4fedb7c (bbox envelope unchanged, walk 9/9 ALL_PASS 0.396 re-proven by its own lane), nx-craft-hamlet-0041 473f671c→caa851af = improve-26 family-cure @ 122fc69 (live bbox y-span 13.363→4.744, fourth hamlet sibling cured) — both landed AFTER first census/SAT/walks, all affected evidence re-taken fresh per epoch law: census2 0 further change, SAT re-run neutral, NE re-walked 7/7 epoch B, gate re-run ALL PASS exit 0 at 122fc69; snapshot rewritten full-precision-normalized sha16 6c8626acc088a90a, entity diff exactly the two classified changes, post-rewrite drift ZERO) | exit 3 on exactly ONE unclassified = R-121 lamp-n\\|nx-town-mapboard −0.407 (known Sev 2 routed artwalk b26 @ sweep-43, tuple identical per zero-drift census, seventh sweep since routing, NOT new, no escalation due — law keys Sev 1); 225 bbox non-light, 233 classified, 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 ok max-arr 0.38; NW 5/5; NE 7/7 @ 0.38; SW 5/5 @ 0.37) + tier-2 28th cycle longhouse 6/6 @ 0.346 + tower-house 6/6 @ 0.377 ALL PASS (first re-walk of this pair since sweep-3) | pins 15/15 ALL_PINS_OK (9th consecutive clean, struct18-fleet-pin-check real exit 0), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + 36 -l companions, belltower 2419fbc5 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, hamlet-0007/0015/0028 embers all live, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT 2370321 at append (sibling D+1 absorbed mid-tick, base re-read fresh), standing gate ALL PASS real exit 0 at tick-start HEAD c523943 | CLEAN SWEEP — R-121 open, known, no escalation due |

|| sweep-40 | 2026-09-06 | 259==259 fully quiet (221 thing + 38 light; 0 arrivals, 0 departures, 0 drift on id+pos+yaw+lib vs the committed sweep-39 baseline — second fully-quiet delta since sweep-37; no snapshot rewrite, committed file already exact) | exit 4 SWEEP COVERAGE HOLE on exactly the four bbox:null lamps (217 bbox non-light, 215 classified, 0 unclassified — correct loud state per R-120) | tier-1 4/4 per-leg verified (core 64/64 ok ALL_PASS, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 eighteenth cycle inn 6/6 + stable 5/5 ALL PASS | pins 14/15 + angler classified (racing law), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 bbox:null (R-120) + 4 companions live @ 1.96m, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, ledger law exact 2370298 at gate | FINDINGS — R-120 note 3 appended (escalation law) |

|| sweep-41 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, ONE documented lib change at identical tuple: nx-struct-soundmirror 5216db0a->f313e59a — committed struct-45 true-bowl rebuild @ 14fc884, PLACED_VERIFIED + idempotent + 6-leg walk 0.354m by its own lane — domain-valid, not drift; snapshot rewritten normalized sha 11a86e0cf7714cea, post-rewrite drift ZERO) | exit 4 SWEEP COVERAGE HOLE on exactly the four bbox:null lamps (217 bbox non-light, 215 classified, 0 unclassified — correct loud state per R-120) | tier-1 4/4 per-leg verified (core 64/64 ok ALL_PASS 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — 81/81 legs) + tier-2 nineteenth cycle potter 6/6 + market 6/6 ALL PASS | pins 14/15 + angler classified (racing law), carousel comp bag exact 7 + lib ce3633992d07055e, belltower 2419fbc5 + ladder comp live in bag (corroborates improve-17), gate lamps 4/4 bbox:null (R-120) + 4 companions live @ 1.96m, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, ledger law exact 2370302 at gate | ESCALATION — R-120 note 4 appended (escalation law): placer now committed but pins the truncated prefix; no lane owns the fix (no town lane in fleet, no improve row) |

| sweep-42 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, TWO documented lib changes at identical tuples landed mid-tick and epoch-verified: nx-struct-angler b3dfb28a->6bf06a35 (committed struct-46 @ c87d502, DESIGNED bank seat, fresh 4-leg circuit 0.397m), nx-town-mapboard 1f1a10f4->95231f20 (improve-19 @ 7b9fec9, live-verified post-arrival); snapshot rewritten normalized sha ee99e7cf36a972ac, post-rewrite drift ZERO) | exit 4 SWEEP COVERAGE HOLE on exactly the four bbox:null lamps (217 bbox non-light, 215 classified, 0 unclassified — correct loud state per R-120) | tier-1 4/4 per-leg verified (core 64/64 ok ALL_PASS max-arr 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — 81/81 legs) + tier-2 twentieth cycle inn 6/6 @ 0.364 + stable 5/5 @ 0.396 ALL PASS | pins 15/15 ALL_PINS_OK (angler RESOLVED — struct-46 committed the draft re-pin, live b3dfb28a == local; first clean 15/15 since sweep-27), carousel comp bag EXACT 7 + lib ce3633992d07055e (probe self-catch: compKeys field again read [] — comp is the census key, sweep-40 class), belltower 2419fbc5 + ladder comp live, gate lamps 4/4 bbox:null (R-120) + 4 companions live @ 1.96m, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, ledger law exact 2370302 at gate | ESCALATION — R-120 note 5 appended (fifth consecutive sweep unaddressed; ownership re-checked this sweep: no town lane, no improve row, no town plan) |
| sweep-43 | 2026-09-06 | 259→260 (EPOCH-CORRECTION sweep: first census 259 at old epoch caught the R-120 fix IN FLIGHT; second census 260 epoch-verified. +1 domain-valid arrival nx-struct-meridianstair store/dec58a3b6bfcae4a @ (5.7,-0.0378,-54.7) yaw 3.037 = struct-47 @ bc192bc; FIVE drift fields all classified: lamps x4 18b69a6bb2→18b69a6bb2f5862f = improve-21 R-120 execution @ cd0a8c9 (bbox PRESENT x4), nx-town-longhouse f2344409→e3adcd3d = improve-20 kit-debt @ a5e62b4; 0 departures; snapshot rewritten normalized sha 8e8c00544df4850b, post-rewrite drift ZERO) | ALL CLEAR-equivalent: exit 0 with 233 classified, 0 coverage holes (exit-4 CLOSED — lamps rejoined SAT set 217→222), 1 UNCLASSIFIED = R-121 lamp-n\|nx-town-mapboard gap −0.407 NOW SAT-VISIBLE on restored bboxes — known Sev 2, improve-21 re-derived 0.076m on the post-improve-19 board and routed artwalk with b26 choreography (routing verified in ARTWALK-PLAN tail); NOT a new finding | tier-1 4/4 RE-RUN at epoch B over the new lamp colliders: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — 81/81; tier-2 21st cycle hall 8/8 + row-cottage 6/6 ALL_PASS (epoch A, buildings >40m from every mid-tick change) | pins 15/15 ALL_PINS_OK (2nd consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, belltower 2419fbc5 + ladder comp live, gate lamps 4/4 bbox PRESENT on full lib + 4 companions @ 1.96m, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, ledger law exact 2370309, gate real exit 0 at 22ea039 | R-120 RESOLVED LIVE (improve-21); R-121 open, freshly routed to artwalk — no escalation due |
|| sweep-44 | 2026-09-06 | 260==260 fully quiet (222 thing + 38 light; 0 arrivals, 0 departures, 0 drift on id+pos+yaw+lib vs the committed sweep-43 baseline — first fully-quiet delta since sweep-40; no snapshot rewrite, committed file already exact) | exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard gap −0.407 (known Sev 2, routed artwalk b26 choreography @ sweep-43, tuple identical, NOT new); 222 bbox non-light, 233 classified, 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS (core 64/64 ok max-arr 0.38, NW 5/5, NE 7/7, SW 5/5, real exit 0 each) + tier-2 22nd cycle potter 6/6 + market 6/6 ALL PASS | pins 15/15 ALL_PINS_OK (3rd consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT, belltower 2419fbc5 + ladder comp live, windmill + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, ledger law exact 2370309 (D+0/E+0 append), standing gate real exit 0 at 08119ca + re-run ALL PASS at mid-tick HEAD 0e6f52a pre-append | CLEAN SWEEP — R-121 open, known, no escalation due |

|| sweep-46 | 2026-09-06 | 260==260 fully quiet (222 thing + 38 light; 0 arrivals, 0 departures, 0 drift on id+pos+yaw+lib+kind vs the committed sweep-45 baseline — third consecutive fully-quiet delta; no snapshot rewrite, committed file already exact) | exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard gap −0.407 (known Sev 2, routed artwalk b26 choreography @ sweep-43, tuple identical per zero-drift census, NOT new, third sweep since routing); 222 bbox non-light, 233 classified, 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS (core 64/64 ok status ALL_PASS real exit 0; NW 5/5, NE 7/7, SW 5/5, real exit 0 each) + tier-2 24th cycle potter 6/6 + market 6/6 ALL PASS | pins 15/15 ALL_PINS_OK (5th consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved), belltower 2419fbc5 + ladder comp live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, ledger law exact 2370309 at gate, standing gate real exit 0 at ac79ab1 | CLEAN SWEEP — R-121 open, known, no escalation due (Sev 2, escalation keys on Sev 1) |
|| sweep-47 | 2026-09-06 | 260→261 (+1 domain-valid arrival nx-struct-ninesbridge @ (-7.28,0.028,69.62) yaw -1.67552 lib 1e4e84e98900d89c comp {} = struct-49 @ 40d8cab, tuple matches its committed ledger; ONE documented lib change nx-craft-hamlet-0007 e2f134cf→edd3da3e identical tuple, embers comp live = improve-23 @ b1efdb2, ledger line-for-line; 0 departures, 0 unexplained drift; snapshot rewritten normalized sha16 60e42544f54d9daa, post-rewrite drift ZERO) | exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard −0.407 (known Sev 2 routed artwalk b26 @ sweep-43, tuple identical per drift set, fourth sweep since routing, no escalation due — law keys Sev 1); 223 bbox non-light, 233 classified, 0 coverage holes | tier-1 81/81 ALL_PASS real exit 0 each (core 64/64 all-arrived max_dist 0.38; NW 5/5; NE 7/7; SW 5/5) + tier-2 25th cycle forge 6/6 @ 0.375 + garden-cottage 6/6 @ 0.355 | pins 15/15 ALL_PINS_OK (6th consecutive), carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full 16-hex bbox PRESENT (R-120 stays resolved) + 4 companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane f6254cd0 stable, ledger law EXACT 2370314, gate real exit 0 at 5505f24 (survey-16) | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-45 | 2026-09-07 | 260==260 fully quiet (222 thing + 38 light; 0 arrivals, 0 departures, 0 drift on id+pos+yaw+lib+scale+kind vs the committed sweep-44 baseline — second consecutive fully-quiet delta, first two-quiet run since sweeps 37/40; no snapshot rewrite, committed file already exact) | exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard gap −0.407 (known Sev 2, routed artwalk b26 choreography @ sweep-43, tuple identical per zero-drift census, NOT new, second sweep since routing); 222 bbox non-light, 233 classified, 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS (core 64/64 status ALL_PASS real exit 0, `[physics]` banner parse handled; NW 5/5, NE 7/7, SW 5/5, real exit 0 each) + tier-2 23rd cycle inn 6/6 + stable 5/5 ALL PASS | pins 15/15 ALL_PINS_OK (4th consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved), belltower 2419fbc5 + ladder comp live, windmill + woodyard 1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, ledger law exact 2370309 (D+0/E+0 append), standing gate real exit 0 at 0560efd + re-run ALL PASS at mid-tick HEAD e767c97 pre-append | CLEAN SWEEP — R-121 open, known, no escalation due (Sev 2, first-consecutive-sweep key not met) |


sweep-44: CLEAN SWEEP, fully quiet epoch. Census 260==260 (222 thing +
38 light; 0 arrivals, 0 departures, 0 drift on id+pos+yaw+lib vs the
committed sweep-43 baseline — first fully-quiet delta since sweep-40;
no snapshot rewrite, the committed file already describes the live
world exactly). Overlap: 222 bbox-bearing non-light, 233 classified, 0
coverage holes, exit 3 on exactly ONE unclassified = R-121
(lamp-n | nx-town-mapboard gap −0.407) — the known Sev 2 routed to
artwalk with b26 choreography at sweep-43, tuple identical, NOT a new
finding, no escalation due (first sweep after its routing; the owning
lane holds pending its own cadence). Tier-1 4/4 per-leg verified
81/81 ALL_PASS: core 64/64 ok max-arr 0.38, NW 5/5, NE 7/7, SW 5/5 —
every leg real exit 0, verdicts anchored on per-leg ok-counts + status
strings. Tier-2 22nd cycle: potter 6/6 + market 6/6 ALL PASS.
Integrity: pins 15/15 ALL_PINS_OK (third consecutive clean), carousel
comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 on the full
16-hex 18b69a6bb2f5862f with bbox PRESENT (R-120 stays resolved),
belltower 2419fbc5 + ladder comp live, windmill + woodyard
1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable,
ledger law exact 2370309 (D+0/E+0 append). HEAD advanced 2× mid-tick
(dress-65/dress-66, both zero-mutation holds) — live-world evidence
unaffected by construction, standing gate re-run ALL PASS real exit 0
at 0e6f52a before the append. Zero world mutations, zero defect notes
written. Next tier-2 pair (sweep-45): inn + stable (23rd cycle).

sweep-48: CLEAN SWEEP, epoch-correction tick. Census 261→262 (+1
domain-valid arrival: nx-dress-nw-orchard-rows-001 @ (−48.062, 0.034,
67.53) yaw 2.3562, lib 7359f025, comp {} — dress-74 round-3 widening
commissioned by Bill's "expand scope hella", committed 3590c11 mid-tick
between my first census and HEAD read; tuple + lib + empty comp bag
match its committed ledger entry line-for-line). ONE documented lib
change at identical tuple: nx-craft-hamlet-0015 353dd6fb→b5a9de3d with
embers comp live (full preset payload particles/embers verified in the
comp JSON, not just key presence) = improve-24 @ 6daf516, the
composeHamlet family-cure reseat — EPOCH-CORRECTION class: it landed
AFTER my first census, so per the polish-270 law all affected evidence
was re-taken fresh before any verdict: second census (epoch-verified,
0 further change), SAT re-run over the new bbox (neutral, same single
unclassified), NE approach re-walked 7/7 ALL_PASS at epoch B over the
new bytes, standing gate re-run ALL PASS real exit 0 at 6daf516. Live
bbox y-span 13.177→4.467 confirms the floating-mass cure took. 0
departures, 0 unexplained drift. Snapshot rewritten normalized
(id/kind/pos/yaw/scale/lib/bbox, sorted) 136455B, sha16
54fa3947fb7b45a2, post-rewrite drift vs live ZERO. Overlap: exit 3 on
exactly ONE unclassified = R-121 (lamp-n | nx-town-mapboard −0.407) —
known Sev 2 routed to artwalk with b26 choreography @ sweep-43, tuple
identical per the zero-drift census, fifth sweep since routing, NOT
new, no escalation due (escalation law keys on severity-1). Set 224
bbox non-light (arrival + hamlet re-place), 233 classified, 0 coverage
holes. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0: core 64/64 ok, NW 5/5, NE 7/7 epoch A + 7/7 epoch B, SW 5/5. Tier-2
26th cycle: hall 8/8 + row-cottage 6/6 ALL PASS. Integrity: pins 15/15
ALL_PINS_OK (7th consecutive clean — struct18-fleet-pin-check real
exit 0), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps
4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) +
4 -l companions live, belltower 2419fbc53a1d65e1 + ladder comp live,
windmill 0993836012d1b17d + woodyard 1f2cf592095b204 exact, hamlet-0007
embers live on edd3da3e, 38 lights, interlane md5 f6254cd0 stable,
ledger law EXACT 2370317 at append (naive whole-file probe read
2369378 — known sweep-36 class, canonical post-[audit-balance] slice
run under the verify-repairs algorithm before verdict). Standing gate
ALL PASS real exit 0 at tick-start HEAD d9c2e09, re-run at 6daf516
after both mid-tick interleaves. Probes this tick, self-caught before
verdicts: naive ledger-law probe (corrected via canonical algorithm);
a pins-probe KeyError on a guessed entity id (re-derived ids from
census, not memory); a shell-parser block on command-substitution
constructs (re-issued as simple commands — tool-layer only). Zero
world mutations, zero defect notes written. Next tier-2 pair
(sweep-49): bunkhouse + garden-cottage (27th cycle).

sweep-50: CLEAN SWEEP, epoch-correction tick. Census 263→263 (225
thing + 38 light; 0 arrivals, 0 departures, TWO documented lib changes at
identical tuples, epoch-verified: nx-struct-ninesbridge
1e4e84e98900d89c→8c5d9ccea9cb4076 = struct-51 stair-inversion fix @
4fedb7c, committed AFTER my first census — its live bbox envelope is
UNCHANGED (24.3×2.47×3.1, the fix reordered tread heights inside the
envelope), walk 9/9 ALL_PASS 0.396 re-proven by its own lane; and
nx-craft-hamlet-0041 473f671c→caa851af = improve-26 family-cure @
122fc69, live bbox y-span 13.363→4.744 (fourth hamlet sibling cured,
0007/0015/0028/0041). Per the polish-270 epoch law all affected
evidence was re-taken fresh before any verdict: census2 (0 further
change), SAT re-run over the new bytes (neutral, same single
unclassified), NE approach re-walked 7/7 ALL_PASS @ 0.38 at epoch B,
standing gate re-run ALL PASS real exit 0 at 122fc69. Snapshot rewritten
full-precision normalized sha16 6c8626acc088a90a — after TWO probe
self-catches on the rewrite itself: (a) first drafts rounded bboxes to
4dp and dropped size/center, producing a 40% size drop and 227 false
entity diffs (serialization drift, not world drift; the 4-bbox-key
full-precision shape with explicit lib:null on lights is the byte-stable
convention); (b) my own assert then failed on list-ORDER of the diff
keys while the set was exactly the two classified entities — fixed by
inspecting, not by loosening. Final: entity diff vs sweep-49 baseline
exactly [hamlet-0041 lib+bbox, ninesbridge lib], on-disk 136990B,
post-rewrite drift ZERO. LEDGER NOTE: the sweep-50 ledger entry (already
at HEAD via improve-26's snapshot, immutable) describes epoch A
("fully quiet, 0 drift") — written before the two sibling interleaves
were discovered; this register block is the correction of record. Overlap: 225 bbox-bearing non-light, 233 classified, 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 (lamp-n | nx-town-mapboard
gap −0.407) — known Sev 2 routed to artwalk with b26 choreography @
sweep-43, tuple identical per the zero-drift census, seventh sweep since
routing, NOT a new finding, no escalation due (escalation law keys on
severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 ok max-arr 0.38, NW 5/5, NE 7/7 @ 0.38, SW 5/5 @ 0.37.
Tier-2 28th cycle: longhouse 6/6 @ 0.346 + tower-house 6/6 @ 0.377 ALL
PASS — first re-walk of this pair since sweep-3, both interior door-lane
contracts intact. Integrity: pins 15/15 ALL_PINS_OK (9th consecutive
clean, struct18-fleet-pin-check real exit 0), carousel comp bag exact 7 +
lib ce3633992d07055e, gate lamps 4/4 on the full 16-hex 18b69a6bb2f5862f
with bbox PRESENT (R-120 stays resolved) + 36 -l companions, belltower
2419fbc5 + ladder comp live, windmill 0993836012d1b17d + woodyard
1f2c6f592095b204 exact, hamlet-0007/0015/0028 embers all live, 38 lights,
interlane md5 f6254cd0 stable, ledger law EXACT 2370321 at append
(sibling D+1 absorbed mid-tick, base re-read fresh immediately before
writing). Standing gate ALL PASS real exit 0 at tick-start HEAD c523943
(my own sweep-49 commit, accepted by prefix gate). PLAN-EDIT self-catch,
repaired before commit: the sweep-50 history-row patch fuzzy-matched and
consumed the sweep-49 row's opening tokens, leaving the row starting
mid-sentence (sweep-43 adjacent-token-bleed class); restored via
asserted-unique-anchor python edit, both rows verified whole by grep
after repair — the second plan-corruption self-catch in two sweeps,
named here per the register discipline. Zero world mutations, zero defect
notes written. Next tier-2 pair (sweep-51): hall + row-cottage (29th
cycle).

sweep-49: CLEAN SWEEP, epoch-correction tick. Census 262→263 (+1
domain-valid arrival: nx-struct-ruledtower @ (58, −0.0426, 0) yaw 0,
lib 4070ecc4d8f1d0e6, comp {} — struct-50 @ 990ddeb, the hyperboloid
rulings tower; tuple + lib + empty comp bag match its committed ledger
entry line-for-line). ONE lib flip at identical tuple:
nx-craft-hamlet-0028 032b6e24→44d78463 with embers comp live
(particles key verified in the comp JSON) = improve-25 @ 6df80eb,
composeHamlet family-cure — EPOCH-CORRECTION class: it landed AFTER my
first census, so per the polish-270 law all affected evidence was
re-taken fresh before any verdict: second census (epoch-verified, no
further change), SAT re-run (neutral, same single unclassified), NE
approach re-walked 7/7 ALL_PASS at epoch B, standing gate re-run ALL
PASS real exit 0 at 6df80eb. Live bbox y-span 13.311→4.724 confirms
the floating-mass cure took (third hamlet sibling cured: 0007, 0015,
0028). 0 departures, 0 unexplained drift. Snapshot rewritten normalized
sha16 55af543ec07eef46 — verified the diff is exactly +1 entity block
+1 lib flip +count (+40/−6 lines, on-disk 136990B); post-rewrite drift
vs live ZERO. Overlap: exit 3 on exactly ONE unclassified = R-121
(lamp-n | nx-town-mapboard −0.407) — known Sev 2 routed to artwalk
with b26 choreography @ sweep-43, tuple identical per the drift set,
sixth sweep since routing, NOT new, no escalation due (law keys Sev 1).
Set 225 bbox non-light, 233 classified, 0 coverage holes. Tier-1 81/81
ALL_PASS, every leg real exit 0: core 64/64 ok max-arr 0.38, NW 5/5,
NE 7/7 epoch A + 7/7 epoch B, SW 5/5. Tier-2 27th cycle: bunkhouse
6/6 @ 0.380 + garden-cottage 6/6 @ 0.355 ALL PASS. Integrity: pins
15/15 ALL_PINS_OK (8th consecutive clean), carousel comp bag exact 7 +
lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox
PRESENT (R-120 stays resolved) + 4 -l companions, belltower
2419fbc53a1d65e1 + ladder comp live, windmill 0993836012d1b17d +
woodyard 1f2c6f592095b204 exact, hamlet-0007/0015/0028 embers all
live, 38 lights, interlane md5 f6254cd0 stable, ledger law EXACT
2370320 at append (improve-25's D+1 absorbed mid-tick, base re-read at
append). Standing gate ALL PASS real exit 0 at tick-start a3344f1,
re-run at 6df80eb after both mid-tick interleaves. Probes this tick,
self-caught before verdicts: compact-string snapshot-size misread
(json.dumps string length 69885 vs on-disk 136990B — diff-stat
re-anchor); bare-hash lib grep without the store/ prefix (re-anchored
on full lib strings); the known [physics] banner + results-schema
drift in walk JSONs (anchored on first-{ parse + per-leg ok-counts).
Zero world mutations, zero defect notes written. Next tier-2 pair
(sweep-50): longhouse + tower-house (28th cycle — first re-walk of
that pair since sweep-3).

sweep-45: CLEAN SWEEP, fully quiet epoch. Census 260==260 (222 thing +
38 light; 0 arrivals, 0 departures, 0 drift on id+pos+yaw+lib+scale+kind
vs the committed sweep-44 baseline — second consecutive fully-quiet
delta; no snapshot rewrite, the committed file already describes the
live world exactly. Sibling tree-dirt (struct millrace/orrery terrain
preflights, improve-22 hamlet decode, housekit/village_tower3 sources)
exists in-worktree but NOTHING has landed live — quiet census is the
proof). Overlap: 222 bbox-bearing non-light, 233 classified, 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 (lamp-n |
nx-town-mapboard gap −0.407) — known Sev 2 routed to artwalk with b26
choreography at sweep-43, tuple identical per the zero-drift census,
NOT a new finding; second sweep since routing, no escalation due (the
escalation law keys on severity-1; R-121 is Sev 2 and the owning lane
holds pending its own cadence). Tier-1 4/4 per-leg verified 81/81
ALL_PASS: core 64/64 status ALL_PASS real exit 0 (`[physics]` stdout
banner parse handled per sweep-35 class), NW 5/5, NE 7/7, SW 5/5 —
every leg real exit 0. Tier-2 23rd cycle: inn 6/6 + stable 5/5 ALL
PASS. Integrity: pins 15/15 ALL_PINS_OK (fourth consecutive clean),
carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 on
the full 16-hex 18b69a6bb2f5862f with bbox PRESENT (R-120 stays
resolved), belltower 2419fbc5 + ladder comp live, windmill + woodyard
1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable,
ledger law exact 2370309 (D+0/E+0 append). HEAD advanced 3× mid-tick
(dress-68/69/70, all zero-mutation holds on own files) — live-world
evidence unaffected by construction, standing gate re-run ALL PASS
real exit 0 at e767c97 before the append. Zero world mutations, zero
defect notes written. Next tier-2 pair (sweep-46): potter + market
(24th cycle).

sweep-43: EPOCH-CORRECTION sweep — R-120 RESOLVED LIVE mid-tick. First
census (259, quiet vs sweep-42 baseline: 0/0/0) ran at the old epoch and
caught the fix IN FLIGHT; improve-21 (@ cd0a8c9) landed while the sweep
ran. Second census epoch-verified: all four cardinal gate lamps now live
on the FULL 16-hex lib 18b69a6bb2f5862f with bbox PRESENT x4 — the SAT
coverage hole is CLOSED (set 217→222, exit-4 state gone), and the
register carries STATUS FIXED (checked). Drift set fully classified:
lamps x4 = improve-21; nx-town-longhouse f2344409→e3adcd3d = improve-20
kit-debt (gable horn, @ a5e62b4); +1 arrival nx-struct-meridianstair
(struct-47 @ bc192bc, own commission R4-1). R-121 is NOW SAT-VISIBLE
(lamp-n | nx-town-mapboard gap −0.407) on the restored bboxes — known
Sev 2; improve-21 re-derived true clearance 0.076m on the post-improve-19
board and routed the remainder to artwalk with b26 rider choreography;
routing verified present in ARTWALK-PLAN tail — NOT a new finding, no
escalation due (first sweep since sweep-37 with the pair visible to the
standing tool). Tier-1 4/4 RE-RUN at epoch B over the NEW lamp colliders
(the exact cross-lane regression this lane exists for): core 64/64 @
0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — 81/81 legs green,
lamp posts at r10 obstruct nothing. Tier-2 21st cycle: hall 8/8 +
row-cottage 6/6 ALL_PASS (run at epoch A; both buildings >40m from every
mid-tick change, none of which are in their neighborhoods — improve-21
itself re-proved its own b19/b26 rider walks). Integrity: pins 15/15
ALL_PINS_OK (second consecutive clean), carousel comp bag exact 7 +
ce3633992d07055e, belltower 2419fbc5 + ladder live, windmill
0993836012d1b17d + woodyard 1f2c6f592095b204 exact, 38 lights, interlane
md5 f6254cd0 stable, ledger law exact 2370309. HEAD advanced 3× mid-tick
(cd0a8c9 improve-21 mutating; 57d9233 struct-48 + c612798 dress-64
zero-mutation holds) — all affected evidence re-taken fresh per the
epoch law (second census, SAT re-run, pins re-run, tier-1 re-walked).
Snapshot rewritten normalized sha 8e8c00544df4850b with pre-write
assertions (arrival/drift set/directions exact-matched before write);
post-rewrite drift vs live ZERO. Probes this tick, self-caught before
verdicts: approach-leg walk schema keyed dist/arrival where results
carry `distance` (re-anchored on per-leg ok-counts); a tail-masked SAT
exit (content-anchored on the verdict line, known class). PLAN-EDIT
self-catch: inserting the sweep-43 history row via fuzzy patch also
corrupted one hash inside the sweep-42 row (7b9fec9→7b2f5862f, adjacent-
token bleed) — caught by re-grepping the diff, restored; plan-file
corruption class (waysign-19/lift-77), disclosed here. Zero world
mutations. Next tier-2 pair (sweep-44): potter + market (22nd cycle).

sweep-42: FIFTH-ESCALATION sweep. R-120 (Sev 1) re-proven with fresh
evidence (truncated lib 404 / full 16-hex 18b69a6bb2f5862f 200 with
7648B, /geom bbox:null x4 at the unchanged off-axis tuples, hardened SAT
exit 4 on exactly those four, companions -l all live at 1.96m) —
UNADDRESSED a FIFTH consecutive sweep; note 5 appended to
REPAIR-REGISTER per the escalation law and named for Bill. Ownership
re-checked fresh this sweep: fleet-pipeline.sh LANES carries no town
lane, IMPROVE-PLAN.md has no nx-approach-lamp row, no TOWN plan or loop
file exists — the defect remains unowned. R-121 (Sev 2) unchanged
(lamp-n tuple identical); fix travels with the R-120 re-spawn. Census
259==259 with TWO mid-tick lib changes epoch-verified (see row). This
tick is itself an EPOCH CORRECTION case (polish-270 law): first census
and records were taken at HEAD d833f3e; ledger base read 2370302;
struct-46 (c87d502), improve-19 (7b9fec9), and dress-55..58 holds then
landed while the sweep ran — angler + mapboard re-placed live — so ALL
affected evidence was re-taken fresh before commit: second census
captured (259, 0/0 vs first, 2 drift fields), snapshot rewritten
normalized (ee99e7cf36a972ac, post-rewrite drift ZERO), SAT re-run
twice, pins 15/15 re-run ALL_PINS_OK at the new lib, gate re-run ALL
PASS exit 0 at c9c3d21, core walk re-walked against the new mapboard
bytes ALL_PASS 64/64 0.38. The angler|reedpool pair surfaced as 1
UNCLASSIFIED on the new SAT state — decoded/verified at source: the
committed struct-46 placer names it DESIGNED (next-place-struct46-angler
.ts:68, commissioned bank seat per struct-13); standing-precedent E4
entry added to sweep-sat-next.ts with evidence (fresh 4-leg MCPL circuit
ALL_PASS 0.397m; pool compound bbox h2.65 defeats the auto film
exemption) — RED->GREEN discipline: the un-classified state was observed
before the entry (216 classified / 0 unclassified after). Overlap final:
exit 4 loud on exactly the four R-120 lamps, 216 classified, 0
unclassified. Tier-1 4/4 per-leg verified 81/81: core 64/64 0.38
(re-walked post-mapboard), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37.
Tier-2 twentieth cycle: inn 6/6 @ 0/364 + stable 5/5 @ 0.396 ALL PASS.
Integrity: pins 15/15 ALL_PINS_OK — angler RESOLVED (struct-46 committed
the draft re-pin, live 6bf06a35; first clean 15/15 since sweep-27);
carousel comp bag EXACT 7 + lib ce3633992d07055e (probe self-catch:
compKeys field again read [] — comp is the census key, sweep-40 class,
world correct); belltower 2419fbc5 + ladder comp live; gate lamps 4/4
bbox:null (R-120) + 4 companions @ 1.96m; windmill 0993836012d1b17d +
woodyard 1f2c6f592095b204 exact; 38 lights; interlane md5
f6254cd0 stable; ledger law exact (base moved 2370302->2370306 mid-tick
via uncommitted sibling appends, disclosed; re-read at append). Probes
this tick: two schema-guess extracts on walk JSON missed (space-after-
colon status regex; physics banner before JSON) — re-anchored on
banner-stripped parse; anchor collision on register note 5 (notes 3+4
share a tail — re-anchored on the unique note-4 header line). Foreign
working-tree dirt is sibling work-in-flight, untouched per interlane
law. Next tier-2 pair (sweep-43): hall + row-cottage (twenty-first
cycle). Standing note for Bill unchanged: with R-120 open expect exit 4
to persist until a town-style wakeup re-spawns the four lamps on the
full 18b69a6bb2f5862f lib — correct loud state, not a tool defect; the
four gate landmarks remain invisible meanwhile.

sweep-41: FOURTH-ESCALATION sweep, no new findings. R-120 (Sev 1)
re-proven independently with fresh evidence (truncated lib
store/18b69a6bb2.glb 404 / full 16-hex 18b69a6bb2f5862f 200 with
7648B, /geom bbox:null x4 at the unchanged off-axis tuples, hardened
SAT exit 4 on exactly those four, companions -l all live at 1.96m) —
now UNADDRESSED a FOURTH consecutive sweep; note 4 appended to
REPAIR-REGISTER per the escalation law and named for Bill. NEW
evidence in note 4: the off-axis placer IS NOW COMMITTED (town-2 @
15a5dec) but pins PINNED_SHA="18b69a6bb2" (10-hex prefix,
next-place-gate-lamps-offaxis.ts:19) with a prefix-INCLUDES lib
check — the town lane's own idempotent rerun would PERPETUATE the
truncated lib rather than fix it; and the running fleet pipeline
(fleet-pipeline.sh) carries NO town lane
(LANES="improve struct dress approach waysign sweep artwalk night")
while IMPROVE-PLAN has no gate-lamp row (town-4's "routed to improve"
did not include R-120) — so NO lane currently owns this fix. R-121
(Sev 2) unchanged (lamp-n tuple identical); fix travels with the
R-120 re-spawn. Census 259==259 (0 arrivals, 0 departures, ONE
documented lib change classified domain-valid: soundmirror
5216db0a->f313e59a = committed struct-45 @ 14fc884, corroborated by
its ledger prose + live comp {} + PLACED_VERIFIED tuple; snapshot
rewritten normalized sha 11a86e0cf7714cea, one-field change asserted
pre-write, post-rewrite drift ZERO). Overlap: exit 4 loud on exactly
the four R-120 lamps (215 classified, 0 unclassified). Tier-1 4/4
per-leg verified 81/81: core 64/64 ok max 0.38 ALL_PASS, NW 5/5 @
0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 nineteenth cycle: potter
6/6 + market 6/6 ALL PASS. Integrity: pins 14/15 + angler classified
(live b3dfb28a unchanged, quarantined sibling draft, racing law);
carousel comp bag exact 7 + lib ce3633992d07055e; belltower 2419fbc5
+ ladder comp live in bag (corroborates improve-17); windmill
0993836012d1b17d + woodyard 1f2c6f592095b204 exact; 38 lights;
interlane md5 f6254cd0 stable; ledger law exact 2370302 at gate
(survey-13 + dress-53 interleaves absorbed, both D+0/E+0, running
total unchanged). Probes this tick: first "full 16-hex" curl used a
literal-x placeholder path (invalid — 404 for the wrong reason),
re-proven with the real hash 18b69a6bb2f5862f (200); walk-JSON
schema-guess hit legs-as-int (core emits results[] + int legs),
verdicts re-anchored on per-leg ok-counts + status strings. Foreign
working-tree dirt (improve18 decodes/review, terrain probes,
core-paths GLB/review, tower3, court placer, fleet watcher) is
sibling work-in-flight, untouched per interlane law. Next tier-2
pair (sweep-42): inn + stable (twentieth cycle). Standing note for
Bill unchanged: with R-120 open expect exit 4 to persist until a
town-style wakeup re-spawns the four lamps on the full 16-hex lib —
correct loud state, not a tool defect; the four gate landmarks
remain invisible meanwhile.

sweep-40: THIRD-ESCALATION sweep, no new findings. R-120 (Sev 1) re-proven
independently with fresh evidence (truncated lib 404, full 16-hex 200 with
7648B, bbox:null x4 at off-axis tuples, SAT exit 4 on exactly those four,
companions live) — now UNADDRESSED a THIRD consecutive sweep; note 3
appended to REPAIR-REGISTER per the escalation law and named for Bill.
NEW evidence in note 3: night-49 @ 6802c85's "town-lane reseat stable end
state" covers only the four -l companion lights it re-pinned; the lamp
meshes remain on the truncated lib; town-3 and town-4 ran after sweep-39
with zero register action; no town plan/loop exists (re-checked this
sweep). R-121 (Sev 2) unchanged; fix travels with the R-120 re-spawn.
Census 259==259 SECOND fully-quiet delta since sweep-37 (0/0/0 on
id+pos+yaw+lib vs the committed sweep-39 snapshot; no rewrite needed).
Overlap: exit 4 loud on exactly the four R-120 lamps (215 classified, 0
unclassified). Tier-1 4/4 per-leg verified 81/81: core 64/64 ok max 0.38
ALL_PASS, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 eighteenth
cycle: inn 6/6 + stable 5/5 ALL PASS. Integrity: pins 14/15 + angler
classified (quarantined sibling draft, racing law); carousel comp bag
exact 7 + lib ce3633992d07055e (probe self-catch: field is `comp` not
`comps` — first read showed {}, corrected, world correct); windmill
0993836012d1b17d + woodyard 1f2c6f592095b204 exact; 38 lights; interlane
md5 f6254cd0 stable; ledger law exact 2370298 at gate (tail later moved
to 2370302 via sibling dress-48 mid-tick — base will be re-read at
append). Probes this tick: SAT exit printed 0 after `tail` (tail's exit,
not bun's — content-anchored on the SWEEP COVERAGE HOLE line + four
NO_BBOX ids, known class); core max-arr extractor keyed wrong field
names, verdict anchored on ok-count + ALL_PASS status + real exit 0;
register first-draft attributed 541c42e to town-4 — caught and corrected
pre-commit (approach-34's hash; town-4 is 3be2573). Foreign working-tree
dirt (IMPROVE-PLAN, soundmirror mk, core-paths GLB/review, tower3, court
placer, fleet watcher, terrain probes, improve18 mapboard decode/review)
is sibling work-in-flight, untouched per interlane law. Next tier-2 pair
(sweep-41): potter + market (nineteenth cycle). Standing note for Bill:
with R-120 open expect exit 4 to persist until the town lane re-spawns
the four lamps on the full 16-hex lib — correct loud state, not a tool
defect; the four gate landmarks remain invisible meanwhile.

sweep-39: ESCALATION sweep, no new findings. R-120 (Sev 1) re-proven live
with fresh evidence (truncated lib 404 / full 200 unchanged, bbox:null x4
at identical tuples, hardened SAT exit 4 on exactly those four) and now
UNADDRESSED for a second consecutive sweep — second register note appended
to REPAIR-REGISTER per the escalation law and named for Bill in this
report. R-121 (Sev 2) geometry unchanged (lamp-n tuple identical to
sweep-38's decode); its fix travels with the R-120 re-spawn. Census
259==259 (0 arrivals, 0 departures) with SIX drift fields, all classified
domain-valid against committed sibling work (improve-17 belltower @ the
tick-start HEAD itself, struct-44 observatory, artwalk-83 wayband reseats
x4). Tier-1 4/4 per-leg verified 81/81 (core 64/64 @ 0.38, NW 5/5, NE 7/7,
SW 5/5). Tier-2 seventeenth cycle: potter 6/6 @ 0.366 + market 6/6 @
0.389. Integrity: pins 14/15 + angler classified (quarantined sibling
draft, racing law — do not touch); carousel comp bag exact 7 + lib
ce3633992d07055e; belltower ladder comp live in bag (corroborates
improve-17's claim); windmill + woodyard pins exact; 38 lights; interlane
md5 f6254cd0 stable; ledger law exact 2370298 (base absorbed mid-tick
sibling appends dress-46/survey-12). Standing gate real exit 0 at
tick-start HEAD 30dec29; sibling survey-12 landed mid-tick (24d5632) and
the gate re-ran ALL PASS at the new HEAD before this commit. Probe
discipline this tick: walk-JSON parse hit the `[physics]` banner twice
(known class, sweep-29) — resolved by anchoring on `{`; my first
schema-guess read 0 legs from files that actually carried 64/5/7/5 — the
per-leg ok-count law caught it before any verdict was drawn. Foreign
working-tree dirt (core-paths GLB/review, tower3, court placer, fleet
watcher, terrain probes, review rigs) is sibling work-in-flight, untouched
per interlane law. Next tier-2 pair (sweep-40): inn + stable (eighteenth
cycle). Standing note for Bill: with R-120 open, expect the SAT tool to
keep reporting exit 4 until the town lane re-spawns the four lamps on the
full 16-hex lib — that is the correct loud state, not a tool defect; the
four gate landmarks remain invisible in the live world meanwhile.

sweep-38: TWO findings, both routed to the repair register (no town plan/loop
file exists to receive a plan note — register is the lawful fallback):

R-120 (Sev 1, town) GATE LAMPS UNRESOLVABLE LIB. All four cardinal gate lamps
(nx-approach-lamp-e/n/s/w) live on lib `store/18b69a6bb2.glb` — a 10-hex
TRUNCATED store path written by the uncommitted town-1 placer
next-place-gate-lamps-offaxis.ts (PINNED_SHA is 10-hex). GET
/library/store/18b69a6bb2.glb -> 404; the 16-hex path -> 200 (7648B). The
client resolves lib via direct fetch of /library/<lib> with no fallback
(client/lib/assets.js:481). Consequences: (a) the four plaza gate landmarks
cannot download — INVISIBLE in world (companions -l still shine as floating
lights); (b) /geom returns bbox:null for exactly those four — they silently
left the SAT collision set (221 -> 217). The placer's own post-verify passed
because its lib check is prefix-INCLUDES (line 106) and it never checks bbox.
Independently flagged by artwalk-83 @ 0efff67 ("truncated 10-hex lib x4
bbox-lost"). Fix is town-lane: re-spawn with full 16-hex lib (bytes already
in store, no upload), verify bbox non-null.

R-121 (Sev 2, town) LAMP-N x MAPBOARD 9mm KISS. Translation-aware decode of
both live libs at live tuples (mapboard 1f1a10f4dce71a0e == local
village_mapboard3.glb; lamp 18b69a6bb2f5862f == local village_approach_lamp.glb
— extents match census bboxes, decoder asserted sane): min 3D 0.0251m; y
1.4-2.6 band min horizontal 0.009m (lamp head 9mm from board face); base
band 0.118m. Pre-move clearance +0.857m — the off-axis move CREATED the
contact. No exemption for this pair; invisible to the standing SAT for the
R-120 reason. Independently flagged by artwalk-83 (0.025m). Fix is
town-lane: adjust lamp-n pose when re-spawning per R-120 and re-derive true
clearance from decoded libs, aim >= 0.5m head-band; re-walk N spoke.

Tooling hardening (this lane's own, committed this tick): sweep-sat-next.ts
now fails loud (exit 4, "SWEEP COVERAGE HOLE") on any lib-bearing thing with
bbox:null — proven RED on the live defect (4 lamps) before this verdict;
the prior ALL CLEAR over 217 entities was a pitfall-12-class vacuous pass
that this sweep caught only because census bbox accounting flagged the set
shrink. Probes this tick: one tool-layer bounce (mapboard/lamp decoder
first draft had translation-compose garbage — extents assert caught it,
corrected decode produced extents matching census bboxes before any
verdict); one invented-URL probe (/store/<hash>.glb 404s even for known-good
libs — discarded, not evidence). Census 259==259 (0 arrivals, 0 departures)
with SEVEN documented lib/pos changes each classified against its authored
source (town-1 uncommitted placer x4 lamps + companions, town straight-paths
replace, struct-43 committed, improve-16 committed). Tier-1 4/4 + tier-2
inn+stable sixteenth cycle green over the new core-paths bytes. Pins 14/15 +
angler classified (quarantined sibling draft, racing law). Interlane md5
f6254cd0 stable. Standing gate real exit 0 at tick-start HEAD c13c022;
ledger base absorbed mid-tick sibling appends (2370285 -> 2370292+ at
write). Next tier-2 pair (sweep-39): potter + market (seventeenth cycle).
Standing note for Bill unchanged: with the town lane's Sev-1 (R-120) open,
expect gate-lamp bbox coverage to stay at 217 until the town lane re-spawns
the four lamps on the full 16-hex lib; the hardened SAT tool will keep
reporting exit 4 until then — that is the correct loud state, not a tool
defect.


sweep-37: none. Census 259==259, the first fully-quiet delta since sweep-36
(0 arrivals, 0 departures, 0 drift on id+pos+yaw+lib against BOTH the
committed sweep-census baseline and the sweep-36 /tmp capture — verified
two independent ways before calling it quiet; no snapshot rewrite, the
committed file already describes the live world exactly). Overlap ALL
CLEAR 221/230/0 exit 0. Tier-1 4/4 with per-leg ok counts verified (not
just status strings): core 64/64 ok max-arr 0.38, NW 5 @ 0.38, NE 7 @
0.38, SW 5 @ 0.37. Tier-2 fifteenth cycle: potter 6/6 @ 0.366 + market
6/6 @ 0.389. Integrity: struct pins 14/15 + angler classified (live
b3dfb28a UNCHANGED; local 8c1a5047 = known quarantined sibling improve
draft, sweep-28..36 class, racing law — do not touch); carousel comp bag
exact 7 + lib ce3633992d07055e; gate lamps 4/4 + 4 -l companions live;
windmill 0993836012d1b17d + woodyard 1f2c6f592095b204 exact; 38 lights;
interlane md5 f6254cd0 stable. Probes: one of my own in-tick probes was
wrong and corrected before any verdict (per-result walk filter keyed
`status` where results carry `ok` — read 64/64 as "bad", corrected to the
ok-field count; also my first gate-lamp grep keyed `gate`-in-id where the
lamps are `nx-approach-lamp-{e,n,s,w}` — found by lib 18b69a6b instead)
— probe discipline, village unaffected. Ledger base moved 2370274→2370285
between gate and append (sibling holds appending mid-tick, normal
pipeline life; law closed EXACT). Foreign working-tree dirt (IMPROVE-PLAN,
mkvillage-houses.ts, village_tower3.glb, court placer, improve16 files,
fleet watcher, struct terrain probes, review rigs) is sibling
work-in-flight, untouched per interlane law. No defect notes written.
Next tier-2 pair (sweep-38): inn + stable (sixteenth cycle). Standing
note for Bill unchanged: improve/waysign/struct/dress/approach lanes hold
with shards exhausted and Bill-bound verdicts pending; if verdicts stay
pending expect continued quiet census deltas.

sweep-36: none. Census 259==259 (0 arrivals, 0 departures). ONE documented
lib change at identical tuple, classified domain-valid against the COMMITTED
struct-42 ledger entry @ 4b3275a: nx-struct-mobius 04d088e1→5617f376 at
identical pos/yaw/scale — "36 discrete pitched segments -> ONE 144-segment
continuous swept band", sha 5617f376 ×2 deterministic, exact-tuple re-place
comp {}, PLACED_VERIFIED + idempotent, walk 5/5 0.37m re-proven by the struct
lane itself, and this sweep's tier-1 + SAT both green over the same live
bytes. Snapshot rewrite key-diff vs HEAD exactly this one lib field;
post-rewrite drift vs live ZERO. Integrity classification, not a finding:
struct fleet pins 14/15 + angler classified (live b3dfb28a UNCHANGED in this
sweep's drift set; local 8c1a5047 = known quarantined sibling improve draft,
sweep-28..35 class, racing law — do not touch). Probes: one of my own
in-tick probes was wrong and corrected before any verdict (ledger-law check
first summed (D,E) pairs over the WHOLE file, contradicting the gate's EXACT
verdict; the canonical algorithm in verify-repairs.ts sums only the
post-[audit-balance] slice with base 2336002 — re-run under the canonical
slice, EXACT 2370274) — probe discipline, village unaffected. Five sibling
commits since sweep-35 (dress-32, night-41, waysign-28, approach-23,
artwalk-75) all zero-mutation holds, prefix-gate accepted. Foreign
working-tree dirt (IMPROVE-PLAN, village_tower3.glb, court placer, fleet
watcher, struct terrain probes, review rigs) is sibling work-in-flight,
untouched per interlane law. No defect notes written. Next tier-2 pair
(sweep-37): potter + market (fifteenth cycle). Standing note for Bill
unchanged: improve/waysign/struct/dress/approach lanes continue active
re-place queues — expect further domain lib changes in coming census diffs,
each classifiable only against that tick's ledger tail or uncommitted
placer.

sweep-35: none. Census 259==259 (0 arrivals, 0 departures). ONE documented
lib change at identical tuple, classified domain-valid against the COMMITTED
improve-15 ledger entry: nx-town-row-cottage bd88cd38→add42aea at
(-23, 0, -17) yaw 0.9411511 — remove+spawn exact tuple, sha add42aea ×2
deterministic, comp {} both sides, 6-leg MCPL door walk ALL_PASS 0.3838
re-proven by the improve lane itself, and this sweep's tier-1 core walk +
SAT both green over the same live bytes. Live bbox z max 2.673→2.72
(+4.7cm, the solidRidge cap consequence documented in the improve-15 entry:
"bbox unchanged 5.9x4.695x5.346" refers to x/y; the z envelope grew by the
cap depth — cosmetic, no overlap consequence, SAT ALL CLEAR includes the
new bbox). Server payload observation, not a finding: /geom now emits tris
and parent fields the baseline shape never carried; the snapshot rewrite
normalizes them out per the sweep-9 like-for-like discipline (drift keys on
id/pos/yaw/lib only; post-rewrite drift vs live ZERO on those keys).
Integrity classification, not a finding: struct fleet pins 14/15 + angler
classified (live b3dfb28a UNCHANGED; local 8c1a5047 = known quarantined
sibling improve draft, sweep-28..34 class, racing law — do not touch).
Probes: two of my own in-tick probes were wrong and corrected before any
verdict (tail-3 swallow → status-string content-anchoring; a python syntax
error and a workdir miss, both re-run clean) — probe discipline, village
unaffected. Foreign working-tree dirt (mkv3-ring.ts, village_tower3.glb,
court-ensemble placer, fleet watcher, review rigs, IMPROVE-PLAN/IMPROVEMENTS
modified) is sibling work-in-flight, untouched per interlane law. No defect
notes written. Next tier-2 pair (sweep-36): inn + stable (fourteenth cycle).
Standing note for Bill unchanged: improve/waysign/struct/dress/approach
lanes continue active re-place queues — expect further domain lib changes
in coming census diffs, each classifiable only against that tick's ledger
tail or uncommitted placer.

sweep-34: none. Census 259==259 across two live reads (0 arrivals, 0
departures). EIGHT documented lib changes at identical tuples across the two
reads, each classified domain-valid against committed lane ledgers or in-tree
placers: sign-bakery 599194ee→49342c52 (waysign-15 @ 08da3ac), struct-hypar
ce246def→750f82ee (struct-40 @ 1602f3c flush-rim fix, previously classified
as actively-rebuilding), dress-nw-hedge f595e862→a80e9121→3d5c7d44 (dress-21
in-flight at first read, settled as dress-24's committed 3d5c7d44 at second
read — sibling night-31/32 corroborated both states), town-shrine
53709062→948d5c49 (improve-14 votive+offering execution, corroborated by
artwalk-67's independent host-pin reconciliation), sign-smithy 62a8c7fc→
3522e5ab (waysign-16 v3 brace fix), struct-pendulum 0a3120b2→c32a35a8
(struct-41 rod carriage fix), approach-sw-lane 43817a4f→fb04a144
(approach-13 D4 leg-dead-stretch night cadence, corroborated by night-34/35).
Overlap ALL CLEAR 221/230/0 exit 0, SAT re-run after each read (new bytes in
the live set both times). Tier-1 4/4 ALL PASS: core 64 legs max-arr 0.38, NW
5 legs 0.38, NE 7 legs 0.38, SW 5 legs 0.37 re-walked against the new
fb04a144 D4 bytes; tier-2 twelfth cycle: inn 6/6 ALL_PASS 0.36 (re-walked
fresh post-changes) + stable 6/6 ALL_PASS 0.325 (verdict from this wakeup's
earlier run at 15:49 — its town-SE neighborhood is untouched by all 5 later
changes, none of which are within 40m of the stable; the second inn run hit
the tool-layer 420s timeout AFTER printing its verdict — known WS-hang class,
verdict content-anchored on two identical runs). Integrity classification,
not a finding: struct fleet pins 14/15 + angler classified (live b3dfb28a
UNCHANGED; local 8c1a5047 = known quarantined sibling improve draft, racing
law — do not touch); hypar pin classified at first read → RESOLVED (750f82ee
landed, live==local). Carousel comp bag exact 7 + lib ce3633992d07055e, gate
lamps 4/4 standing, windmill 0993836012d1b17d + woodyard
1f2c6f592095b204 exact, 38 lights, interlane md5 f6254cd0 stable, ledger law
exact (2370269 after D+0/E+0 append). Snapshot rewritten twice (74306eec
then final e2012f709effaab3 post the 5 later changes; post-rewrite drift vs
live ZERO both times). Foreign working-tree dirt (DRESSING-PLAN/IMPROVE-PLAN
modified, mk scripts, review rigs, fleet watcher) is sibling work-in-flight,
untouched per interlane law. No defect notes written. Next tier-2 pair
(sweep-35): potter + market (thirteenth cycle). Standing note for Bill
unchanged: improve/waysign/struct/dress/approach lanes continue active
re-place queues — expect further domain lib changes in coming census diffs,
each classifiable only against that tick's ledger tail or uncommitted
placer.

sweep-33: none. Census 259==259 (0 arrivals, 0 departures, 0 unexplained
drift), FOUR documented lib changes at identical tuples, all classified
domain-valid against lane ledger tails / uncommitted in-tree evidence:
nx-approach-ne-lane-002 a27bc9a2→dc52264c (approach-7 D2 night-correction
@ HEAD 873a138, "sha a27bc9a2->dc52264c x2 deterministic"), nx-dress-ne-
woodstack-001 c832da5d→692bc54e (dress-19 committed reseat @ e06f69c,
"sha 692bc54e x2"), nx-dress-nw-skeps-001 806f2c4e→87d2dd16 (dress-20
skeps rejudge, mid-tick arrival AFTER this sweep's first census — review
rig dress20-skeps-rejudge/ in tree, per the sweep-8/sweep-10 mid-tick
precedent; re-captured, tuple unchanged), nx-town-bunkhouse
49f5acc4→c8636968 (improve-13 decode-bunk, mid-tick arrival, review rig
review-improve13-bunk/ in tree; re-captured, tuple unchanged) — SAT re-run
post both arrivals, ALL CLEAR 221/230/0 exit 0. Integrity classification,
not a finding: struct fleet pins 13 ok / 2 classified — nx-struct-angler
live b3dfb28a UNCHANGED (known quarantined sibling improve draft, sweep-28
class, racing law) and NEW this sweep nx-struct-hypar live ce246def
UNCHANGED in the drift set (local f4cfcade then 750f82ee across two reads
= struct-40 actively rebuilding the GLB mid-tick at 15:11, untracked
reviews struct-40-hypar/ + -v2/ in tree; live world unaffected — verified
fresh via curl UA after one 403 on the default urllib UA; same racing-law
class, do not touch). All five phases verified fresh this wakeup with
zero failing checks (tier-1 legs run individually per sweep-18 timeout
lesson, verdicts content-anchored on ALL_PASS status strings — core 64
legs, NW 5, NE 7 walked against the new approach-7 bytes, SW 5; tier-2
eleventh cycle: potter 6/6 + market 6/6 ALL PASS; foreign-seam
abstentions on cultivation gardens/temple-labyrinth/dress-nw-logpile =
known normalized diagnostic set, unchanged class). Foreign working-tree
dirt (hypar + tower3 + potter sign + stile + signs11 mk scripts,
approach7 corridor/decode/review, millrace/orrery terrain probes, fleet
watcher, court-ensemble placer, improve13-bunk + waysign14 review rigs)
is sibling work-in-flight, untouched per interlane law. Snapshot
rewritten this sweep (raw sha 0f9955a3f47345f3 from the post-arrival
re-capture; post-rewrite drift vs live ZERO). No defect notes written.
Next tier-2 pair (sweep-34): inn + stable (twelfth cycle). Standing note
for Bill unchanged: improve/waysign/struct/dress/approach lanes continue
active re-place queues — expect further domain lib changes in coming
census diffs, each classifiable only against that tick's ledger tail or
uncommitted placer.

sweep-32: none. Census 259==259 (0 arrivals, 0 departures, 0 unexplained
drift). ONE documented lib change at identical tuple, classified as
expected sibling work-in-flight, not drift: nx-struct-spiralfolly
20c515a0→b85ce018 at (46.114, −0.0372, 33.5038) yaw 0 (struct-39 shard
row 14 honest-carriage rebuild; at this tick the struct-39 commit had
not landed at HEAD — classified against the uncommitted ledger entry
[struct-39] and modified placer/build sources in the working tree, per
the census-diff hold law; its prose records remove+spawn exact tuple,
comp {} both sides, PLACED_VERIFIED + idempotent 0-verb rerun, 5-leg
circuit walk ALL_PASS 0.376m). Tuple unchanged, scale 1. Integrity
classification, not a finding: struct fleet pins 14/15 + 1 classified
(nx-struct-angler live=store/b3dfb28a UNCHANGED in this sweep's drift
set; local 8c1a5047 = the known quarantined in-flight sibling improve
draft, same class as sweep-28..31; racing law — do not touch). All five
phases verified fresh this wakeup with zero failing checks (tier-1 legs
run individually per sweep-18 timeout lesson, verdicts content-anchored
on ALL_PASS status strings; tier-2 tenth cycle completed: hall +
row-cottage — pair rotation continues at sweep-33 with potter +
market, eleventh cycle). Foreign working-tree dirt (spiralfolly +
tower3 + potter sign + stile + signs11 + dress-ne-woodstack mk
scripts, approach7 corridor/decode/review, millrace/orrery terrain
probes, fleet watcher, court-ensemble placer, review-improve13-bunk,
review-waysign14-bakery) is sibling work-in-flight, untouched per
interlane law. Snapshot rewritten this sweep (raw sha
65184df6bfe4bcd5 — one lib field changed, so no-rewrite was not
available). No defect notes written. Standing note for Bill unchanged:
improve/waysign/struct/dress lanes continue active re-place queues —
expect further domain lib changes in coming census diffs, each
classifiable only against that tick's ledger tail or uncommitted
placer.

sweep-31: none. Census 259==259 (0 arrivals, 0 departures, 0 unexplained
drift). ONE documented lib change at identical tuple, classified as
expected sibling work, not drift: nx-sign-potter-001 bc05a4f3→3a6c8fe7 at
(23.086, 0, 38.665) yaw −2.5835 (waysign-13 R2-6 emblem-collapse reseat @
038ac45; waysign-place-potter-2.ts pins the same sha; waysign's own battery
re-judged the exact live bytes) — this is the same entity improve-12
touched nothing of, and the potter tier-2 door-lane circuit was walked by
sweep-30 against the PREVIOUS bytes; this sweep's tier-2 pair (inn +
stable) exercises the improve-12 stable new bytes 98f2d5b6 with door-lane
ALL PASS. Integrity classification, not a finding: struct fleet pins
14/15 + 1 classified (nx-struct-angler live=store/b3dfb28a UNCHANGED;
local 8c1a5047 = the known quarantined in-flight sibling improve draft,
same class as sweep-28/29/30; racing law — do not touch). All five phases
verified fresh this wakeup with zero failing checks (tier-1 legs run
individually per sweep-18 timeout lesson, verdicts content-anchored on
the ALL_PASS status strings; tier-2 ninth cycle completed: inn + stable —
pair rotation restarts at sweep-32 with hall + row-cottage, tenth cycle).
Foreign working-tree dirt (millrace/millrace38 terrain probes,
spiralfolly + tower3 + potter sign + stile mk scripts, approach7
corridor/decode/review, fleet watcher, court-ensemble placer) is sibling
work-in-flight, untouched per interlane law. Snapshot rewritten this
sweep (raw sha f901ff3787755b37 — one lib field changed, so no-rewrite
was not available). No defect notes written. Standing note for Bill
unchanged: improve/waysign/struct/dress lanes continue active re-place
queues — expect further domain lib changes in coming census diffs, each
classifiable only against that tick's ledger tail or uncommitted placer.

sweep-30: none. Census 259==259 (0 arrivals, 0 departures, 0 unexplained
drift). THREE documented lib changes at identical tuples, each classified
as expected sibling work-in-flight (commits not yet landed at this tick's
HEAD 81578b4 — classified against each entity's uncommitted placer in the
working tree, per the census-diff hold law): nx-dress-nw-stile-001
5a8de30d→5e9d301d (dress-18 v6, nw-dress18-place.ts pins SHA
5e9d301d46d4dcafb631a020f969091db4dda5cc3642b21257544f5a45d53411),
nx-struct-millrace d2f46768→6e82dd2e (struct-38 shard row 13 reseat,
next-place-struct-millrace38.ts pins the same sha),
nx-town-stable 5beff62e→98f2d5b6 (improve-12,
next-place-improve12-stable.ts pins the same sha) — tuples unchanged on
all three; sibling night-16 independently observed the millrace settle
mid-tick. Integrity classification, not a finding: struct fleet pins
14/15 + 1 classified (nx-struct-angler live=store/b3dfb28a UNCHANGED;
local 8c1a5047 = the known quarantined in-flight sibling improve draft,
same class as sweep-28/29; racing law — do not touch). All five phases
verified fresh this wakeup with zero failing checks (tier-1 legs run
individually per sweep-18 timeout lesson, verdicts content-anchored on
the ALL_PASS status strings; tier-2 ninth cycle: potter 0.366 +
market 0.389). Foreign working-tree dirt (dress18/millrace38/
improve12-stable placers, potter review rig, terrain probes) is sibling
work-in-flight, untouched per interlane law. Snapshot rewritten this
sweep (raw sha ddef1e966ba613c4 — three lib fields changed, so
no-rewrite was not available). No defect notes written. Next tier-2
pair (sweep-31): inn + stable (ninth cycle). Standing note for Bill
unchanged: improve/waysign/struct/dress lanes continue active re-place
queues — expect further domain lib changes in coming census diffs, each
classifiable only against that tick's ledger tail or uncommitted placer.

sweep-29: none. Census 259==259 (0 arrivals, 0 departures, 0 unexplained
drift). SIX documented lib/tuple changes, each classified as expected
sibling work, not drift: nx-approach-nw-lane-001 d46a60fb→dc256065
(approach-6 D1 verge reseat @ b1195ef), nx-dress-se-cairn-001
bc601ed2→59031a0c (dress-15 shard reseat @ 13dc760),
nx-struct-skymirror 8331ba88→782eb864 (struct-37 skymirror reborn @
4d39920), nx-sign-mill-001 5b6a55bd→870256ce (waysign-12 R2-5 emblem
fix @ 59157d4), nx-artwalk-b26-wayband yaw π→−π/2 at (0,1.5,10) lib
unchanged (artwalk-49 host-rotation reseat @ 5be2fcd),
nx-artwalk-b7-shrine-stars y 0.25→0.2487 micro-reseat lib unchanged
(artwalk-49 reconciliation @ 5be2fcd) — all six match their lane ledger
tails line-for-line. Integrity classification, not a finding: struct
fleet pins 14/15 + 1 classified (nx-struct-angler live=store/b3dfb28a
UNCHANGED in this sweep's drift set; local 8c1a5047 = the known
quarantined in-flight sibling improve draft, same class as sweep-28;
racing law — do not touch). All five phases verified fresh this wakeup
with zero failing checks (tier-1 legs run individually, verdicts
content-anchored — the [physics] banner prepended to walk JSON breaks
naive parsing, first-occurrence noted; tier-2 eighth cycle: inn 0.364 +
stable 0.396). Foreign working-tree dirt (NIGHT-PLAN, village_tower3,
terrain probes, fleet watcher) is sibling work-in-flight, untouched per
interlane law; the waysign-12 staged index partition cleared itself when
its sibling window committed mid-tick (normal pipeline life). Snapshot
rewritten this sweep (raw sha fe2cd59caafa41ae — six lib/tuple fields
changed, so no-rewrite was not available). No defect notes written.
Next tier-2 pair (sweep-30): potter + market (ninth cycle). Standing
note for Bill unchanged: improve/waysign/struct lanes continue active
re-place queues — expect further domain lib changes in coming census
diffs, each classifiable only against that tick's ledger tail.

sweep-28: none. Census 259==259 (0 arrivals, 0 departures, 0
unexplained drift). Five documented lib changes at identical tuples, each
classified as expected sibling work, not drift: nx-approach-sw-lane-003
56b35877→43817a4f (approach-4 verge fix @ 4ec8a2f), nx-sign-kiln-001
be3d8504→ecbad903 (waysign-10 R2-3), nx-sign-woodyard-001
58f5cbe3→f46e12ae (waysign-11 @ HEAD 61afd73), nx-struct-skene
3a62ee83→df7f7c43 (struct-36 wall-body fix @ 9459238),
nx-town-tower-house bd1badd2→11b31000 (improve-10 @ 8be70ed) — all
match their lane ledger tails line-for-line. Integrity classification,
not a finding: struct18-fleet-pin-check now lists nx-struct-angler as bad
(live=store/b3dfb28a…, local=8c1a5047…) — the live lib is UNCHANGED
in this sweep's drift set; the mismatch is the known quarantined
in-flight sibling improve draft sitting uncommitted in the working tree
(STRUCTURES-PLAN lines 110-111/1088-1089; racing law — do not touch;
mkv3-skymirror.ts carries the same sibling-draft class). Live world
unaffected; no defect note routed. Interlane md5 changed
1b933f3454e52504d89ff0c167c4e7dc → f6254cd02cbcbee79e54104669be6981
via sibling improve-5z (SURVEY lane registration); diff read
line-by-line, widen-only, no rule change touching this lane; new
baseline recorded in the integrity pins section. All five phases
verified fresh this wakeup with zero failing checks (tier-1 legs run
individually per sweep-18 timeout lesson; tier-2 eighth cycle: potter
0.366 + market 0.389). Foreign-seam abstentions (cultivation gardens,
dress skeps/stones) are the known normalized diagnostic set, unchanged.
Snapshot rewritten this sweep (raw sha 478fc9d52e36101e — five lib
fields changed, so no-rewrite was not available). No defect notes
written. Next tier-2 pair (sweep-29): inn + stable (eighth cycle).
Standing note for Bill: the improve lane continues executing its
round-1 queue (tower-house complete at improve-10; skene fixed by
struct-36) and waysign is 5 of 7 through the R2 emblem packet — expect
further improve/waysign/struct-domain lib changes in coming census
diffs, each classifiable only against that tick's ledger tail.

sweep-27: none. Census 259==259 (0 arrivals, 0 departures, 0 unexplained
drift). Two documented lib changes at identical tuples, each classified as
expected sibling work, not drift: nx-sign-dyer-001 38416bae→8ce2081f at
(-22.087, 2.05, -22.334) yaw 0.941 (waysign-9 dyer emblem fix @ 27595e4)
and nx-struct-crossing a5da939d→216c4bd4 at (3.6, -0.005, -3.6) yaw 0
(improve-8 monolith rebuild @ 1fa1e19) — both match their lane ledger tails
line-for-line, each with its own lane's walk/idempotency re-proof, plus THIS
sweep's tier-1/tier-2 legs over the same live bytes. New sibling commits
since sweep-26: improve-8 1fa1e19 (crossing re-place, world-mutating),
waysign-9 27595e4 (dyer sign re-place, world-mutating), improve-5x 622265f
(perpetual-motion law, plan-only) — all accepted by the prefix gate; interlane
md5 1b933f3454e52504d89ff0c167c4e7dc stable. All five phases verified fresh
this wakeup with zero failing checks (tier-1 legs run individually per the
sweep-18 timeout lesson; tier-2 seventh cycle: inn 0.364 + stable 0.396).
NE walk foreign-seam abstentions (cultivation gardens + dress-se-stones)
are the known normalized diagnostic set, unchanged. Snapshot rewritten this
sweep (raw sha 36c17c7278f5ed5b — two lib fields changed, so no-rewrite was
not available). No defect notes written. Next tier-2 pair (sweep-28):
potter + market (eighth cycle). Standing note for Bill: the improve lane
continues executing its round-1 queue (hall 1, echoarch 2, inn 3, crossing 4
complete; windmill deferred by idle-guard) and waysign is 3 of 7 through the
R2 emblem packet — expect further improve/waysign-domain lib changes in
coming census diffs.

sweep-25: none. Census 259==259 (0 arrivals, 0 departures, 0 unexplained
drift). One documented lib change classified as expected sibling work, not
drift: nx-town-hall 1306527a→c92c1f91 at identical tuple (9,0,-26) yaw −0.313,
matching the improve-5 re-place ledger @ c455327 line-for-line (remove+spawn,
comp bag empty/unchanged, 8-leg walk re-proven by the improve lane itself, and
independently re-walked by THIS sweep's tier-2 hall leg against the new bytes
— 0.360 ALL_PASS, interior door-lane contract intact). New sibling commits
since sweep-24: improve-5 @ c455327 (world-mutating execution tick, re-place
verified) and improve-5v @ f26b224 (plan steer only, zero mutations); both
accepted by the prefix gate; interlane md5 1b933f3454e52504d89ff0c167c4e7dc
stable. All five phases verified fresh this wakeup with zero failing checks
(tier-1 legs run individually per sweep-18 timeout lesson, all real exit 0
with status strings anchored; tier-2 seventh cycle: hall 0.360 + row-cottage
0.384). Foreign-seam abstentions in walk stderr (cultivation gardens +
dress-se-stones + struct-skymirror) are the known normalized diagnostic set,
unchanged. Snapshot rewritten this sweep (raw sha 017e7d27a3b5b0b8 — the hall
lib field changed, so no-rewrite was not available). No defect notes written.
Next tier-2 pair (sweep-26): potter + market (seventh cycle). Standing note
for Bill: the improve lane has begun EXECUTING its 38-entry round-1 queue
(hall = item 1 complete; improve-5v re-judges unexecuted entries under the
restored native vision before executing) — census diffs from sweep-26 on
should expect further improve-domain lib changes on re-placed objects, each
classifiable only against that tick's ledger tail.

sweep-24: none. Steady-state census (259==259 vs the committed sweep-23
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; thirteenth
fully quiet delta of the wave; raw /geom snapshot sha-identical
6bc53d31c388710a so no rewrite was needed). New sibling commit since
sweep-23: improve-4 @ HEAD 4100aad (round-1 execution item 1 nx-town-hall
decode+plan tick — analysis + housekit.ts opt-in commit only, zero world
mutations per its message, accepted by the prefix gate); interlane md5
1b933f3454e52504d89ff0c167c4e7dc stable. All five phases verified fresh this
wakeup with zero failing checks (tier-1 legs run individually per sweep-18
timeout lesson, all real exit 0 with status strings anchored; tier-2 sixth
cycle: inn 0.364 + stable 0.396). Foreign-seam abstentions in walk stderr
are the known normalized diagnostic set (cultivation gardens), unchanged.
No defect notes written. Next tier-2 pair (sweep-25): hall + row-cottage
(seventh cycle). Standing note for Bill unchanged: improve-1..3 committed a
38-entry ranked execution queue in IMPROVE-PLAN.md, so sweeps 25+ should
expect improve-N domain activity in the census diff once execution ticks
begin mutating (improve-4 was decode+plan only, still zero mutations).

sweep-23: none. Steady-state census (259==259 vs the committed sweep-22
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; twelfth
fully quiet delta of the wave; raw /geom snapshot byte-identical 71867B so no
rewrite was needed). New sibling commit since sweep-22: improve-3 @ HEAD
1808dd6 (round-1 analysis phase 3 final — judged live bytes only, zero world
mutations per its message, accepted by the prefix gate); interlane md5
1b933f3454e52504 stable. All five phases verified fresh this wakeup with
zero failing checks (tier-1 legs run individually per sweep-18 timeout
lesson, all exit 0 with status strings anchored; tier-2 sixth cycle: potter
0.366 + market 0.389). Foreign-seam abstentions in walk stderr are the known
normalized diagnostic set (cultivation gardens), unchanged. No defect notes
written. Next tier-2 pair (sweep-24): inn + stable (sixth cycle).


sweep-22: none. Steady-state census (259==259 vs the committed sweep-21
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; eleventh
fully quiet delta of the wave; raw /geom snapshot byte-identical 71867B so no
rewrite was needed). New sibling commit since sweep-21: improve-2 @ HEAD
38482e2 (round-1 analysis phase 2, zero world mutations per its message,
accepted by the prefix gate); interlane md5 1b933f3454e52504 stable. All four
phases verified fresh this wakeup with zero failing checks (tier-2 sixth
cycle: hall 0.360 + row-cottage 0.384 walked ALL PASS, all real exit 0; tier-1
legs run individually after core/NW verdict strings were truncated by output
filtering — verdicts re-anchored on content, not exit codes alone). No defect
notes written. Next tier-2 pair (sweep-23): potter + market (sixth cycle).

sweep-21: none. Steady-state census (259==259 vs the committed sweep-20
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; tenth fully
quiet delta of the wave; raw /geom snapshot byte-identical 71867B so no
rewrite was needed). All four phases verified fresh this wakeup with zero
failing checks (tier-2 fifth cycle: inn 0.364 + stable 0.396 walked ALL
PASS, all real exit 0). Standing gate real exit 0 at HEAD c5ff981 — the
sibling improve-1 commit (round-1 analysis, zero world mutations, plan
files only) was accepted by the prefix gate; interlane md5 unchanged so
no protocol re-read was triggered beyond the fresh full read this wakeup.
No defect notes written. Next tier-2 pair (sweep-22): hall + row-cottage
(sixth cycle).

sweep-20: none. Steady-state census (259==259 vs the committed sweep-19
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; ninth
fully quiet delta of the wave; no sibling lane has landed since dress-11).
One protocol observation, not a finding: INTERLANE-PROTOCOL.md md5 changed
f7865b648dfa9dc4 → 1b933f3454e52504 via sibling commit nvp-150 (HEAD
bc843e5); the diff was read line-by-line and is exactly the improve-N
lane-domain widening (5 lines) — no rule change touching this lane. New
md5 baseline recorded in the integrity pins section. All four phases
verified fresh this wakeup with zero failing checks (tier-2 fifth cycle:
potter + market walked ALL PASS). No defect notes written. Next tier-2
pair (sweep-21): inn + stable (fifth cycle).

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

sweep-6: none. Five sibling arrivals all domain-valid and tuple-exact vs their
lane ledgers. Tier-2 rotation: market + forge walked (ALL PASS). No defect
notes written. Next tier-2 pair (sweep-7): stable + kiln.

sweep-7: none. Five sibling arrivals all domain-valid and tuple-exact vs their
lane ledgers (dress-6 / mile-6 / waysign-6). Tier-2 rotation: stable walked
(ALL PASS); kiln has no interior walk — kiln is not an enterable building, so
no door-lane circuit was ever authored; struct2 observatory circuit walked as
the second leg (ALL_PASS). No defect notes written. Next tier-2 pair
(sweep-8): potter + market (second cycle).

sweep-8: one severity-3 doc-only finding, routed to the dress lane (defect
note appended to DRESSING-PLAN.md, treated as a Bill correction): the dress-7
siting prose cites "source-true cell clearance 3.37m" but that figure is the
R83 OFF-1.1 candidate row; the PLACED tuple (58.70, −58.70) is R83 OFF0,
decoding to 2.58m effective clearance (already minus 0.9m cairn radius).
2.58m ≥ 1.4m pinch law so the siting is LAWFUL — the plan figure overstates
margin and should be corrected to 2.58m when the dress lane next edits the
entry. Evidence: dress7-forest44-occupancy.ts re-run this sweep against live
lib 43e4c8c3a843881d (sha verified == decoded bytes). The same pair was
classified into a new NAMED exemption in sweep-sat-next.ts (E4 ALLOWED) with
source-true numbers in the comment. Sibling arrivals (+5: dress-7 cairn,
mile-7 SW pair + LIT lamp, dress-8 prayer stones mid-tick) all domain-valid
and tuple-exact; SAT re-run post dress-8 arrival stayed ALL CLEAR. Tier-2
rotation: potter + market walked (ALL PASS). Next tier-2 pair (sweep-9):
inn + stable (second cycle).

sweep-9: none. Steady-state census (256==256, no sibling arrivals between
sweep-8 and this tick — first fully quiet delta since the fleet wave began).
Two integrity probe artifacts decoded as non-findings before registering:
(a) the comp census field is `comp` (not `compKeys`) — the carousel bag
decoded exact 7 with the correct key; (b) the woodyard lib string is the
full `store/…glb` path — prefix-match scripting, not drift. Both are my
probe's shape, not the village's (probe-discipline law). No defect notes
written. Next tier-2 pair (sweep-10): hall + row-cottage (second cycle).

sweep-10: none. Two sibling arrivals (dress-9 woodstack, dress-10 log pile —
the latter landing mid-tick between census and ledger append) both
domain-valid and tuple-exact vs their lane ledgers; SAT re-run after the
dress-10 arrival stayed ALL CLEAR. No defect notes written. Next tier-2
pair (sweep-11): bunkhouse + garden-cottage (second cycle).

sweep-11: none. Steady-state census (258==258 vs the committed sweep-10
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids). All four
phases verified fresh this wakeup with zero failing checks. No defect
notes written. Next tier-2 pair (sweep-12): market + forge (second cycle).

sweep-12: none. One sibling arrival (dress-11 NW gate stile) domain-valid
and tuple-exact vs the dress-11 ledger @ HEAD 0998c5a; SAT already included
it in the live set (ALL CLEAR at 259). SW approach walk's first attempt hit
the tool-layer timeout (400s command limit, not a walk verdict); the single
paced retry per malformed-live-response discipline returned ALL_PASS 0.37.
No defect notes written. Next tier-2 pair (sweep-13): inn + stable
(second cycle).

sweep-13: none. Steady-state census (259==259 vs the committed sweep-12
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; second
fully quiet delta of the wave). All four phases verified fresh this wakeup
with zero failing checks. No defect notes written. Next tier-2 pair
(sweep-14): hall + row-cottage (third cycle).

sweep-14: none. Steady-state census (259==259 vs the committed sweep-13
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; third
fully quiet delta of the wave — no sibling lane has landed since dress-11).
All four phases verified fresh this wakeup with zero failing checks. No
defect notes written. Next tier-2 pair (sweep-15): potter + market
(third cycle).

sweep-15: none. Steady-state census (259==259 vs the committed sweep-14
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; fourth
fully quiet delta of the wave). All four phases verified fresh this
wakeup with zero failing checks (tier-2 rotation third cycle: potter +
market walked ALL PASS; foreign-seam abstentions in walk logs are known
non-lane diagnostics, normalized set unchanged). No defect notes
written. Next tier-2 pair (sweep-16): stable + observatory circuit
(third cycle).

sweep-16: none. Steady-state census (259==259 vs the committed sweep-15
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; fifth
fully quiet delta of the wave). All four phases verified fresh this
wakeup with zero failing checks (tier-2 third cycle: stable 0.396 +
observatory circuit walked ALL PASS). No defect notes written. Next
tier-2 pair (sweep-17): bunkhouse + garden-cottage (fourth cycle).

sweep-17: none. Steady-state census (259==259 vs the committed sweep-16
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; sixth
fully quiet delta of the wave; no sibling lane has landed since
dress-11). All four phases verified fresh this wakeup with zero failing
checks (tier-2 fourth cycle: bunkhouse 0.380 + garden-cottage 0.355
walked ALL PASS). No defect notes written. Next tier-2 pair (sweep-18):
inn + stable (fourth cycle).

sweep-18: none. Steady-state census (259==259 vs the committed sweep-17
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; seventh
fully quiet delta of the wave, snapshot byte-identical so no rewrite was
needed). All four phases verified fresh this wakeup with zero failing
checks (tier-2 fourth cycle: inn + stable walked ALL PASS; the first
chained tier-1 run hit the tool-layer 400s timeout on the SW leg — not a
walk verdict — legs re-run individually, all exit 0 ALL_PASS). No defect
notes written. Next tier-2 pair (sweep-19): hall + row-cottage (fifth
cycle).

sweep-19: none. Steady-state census (259==259 vs the committed sweep-18
snapshot — 0 arrivals, 0 departures, 0 drift on all shared ids; eighth fully
quiet delta of the wave, snapshot byte-identical so no rewrite was needed).
All four phases verified fresh this wakeup with zero failing checks (tier-2
fifth cycle: hall + row-cottage walked ALL PASS). No defect notes written.
Next tier-2 pair (sweep-20): potter + market (fifth cycle).

sweep-5: none. Two sibling arrivals domain-valid and tuple-exact; mile-4's
corrective reseat of the SW milestone pair verified against its ledger
(live tuples match 0717445 — documented reseat, not drift). Same comps-key
probe artifact recurred during integrity and was again decode-confirmed
as a non-finding (second occurrence; the census key is compKeys). No
defect notes written. Next tier-2 pair (sweep-6): market + forge.

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
- woodyard: nx-town-woodyard lib 01b78fdd00f090a7 (improve-32 re-place pin, envelope byte-identical; prior 1f2c6f592095b204).
- standing gate: bun agents/arthur/verify-repairs.ts real exit 0.
- ledger law EXACT; interlane md5 baseline
  f6254cd02cbcbee79e54104669be6981 (INTERLANE-PROTOCOL.md @ 4a7db63;
  prior baseline 1b933f3454e52504d89ff0c167c4e7dc @ bc843e5 — sweep-28
  verified the improve-5z SURVEY widen-only diff line-by-line before
  adopting; earliest baseline f7865b648dfa9dc4 @ 0b860e4).

## Census snapshot discipline

NOTE (sweep-9): the snapshot file switched from a post-processed payload
(computed compKeys, local bboxes, pretty-printed) to the RAW /geom response
(compact, `comp` field, world bboxes, `parent`/`tris`). Id set, pos, yaw, and
lib verified identical across the switch (0 drift); sweep-10+ diffs compare
like-for-like raw snapshots. Drift checks key on id/pos/yaw/lib, never on
payload schema.

Each sweep diffs live census against the PREVIOUS sweep's snapshot (not this
baseline); snapshot file updated in-place each sweep. Prefix-domain map per
INTERLANE-PROTOCOL.md (ten lanes). Sibling placements landing mid-tick are
expected fleet behavior — classify as sibling work-in-flight, verify domain
prefix + scale sanity + SAT inclusion, never treat as drift.
