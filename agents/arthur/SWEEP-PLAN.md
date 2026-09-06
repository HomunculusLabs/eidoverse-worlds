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

|| sweep-31 | 2026-09-06 | 259==259 (221 thing + 38 light; 0 arrivals, 0 departures, ONE documented lib change at identical tuple: nx-sign-potter-001 bc05a4f3→3a6c8fe7 (waysign-13 R2-6 emblem-collapse reseat @ 038ac45, waysign-place-potter-2.ts pins the same sha) — domain-valid, not drift; snapshot rewritten raw sha f901ff3787755b37) | ALL CLEAR at 259 (221 bbox non-light, 229 classified, 0 unclassified, exit 0) | tier-1 4/4 ALL PASS (core / NW / NE / SW, legs run individually, verdicts content-anchored) + tier-2 inn + stable ALL PASS (ninth cycle, stable walked against improve-12 new bytes 98f2d5b6) | pins 14/15 + 1 classified (angler live b3dfb28a UNCHANGED; local 8c1a5047 = known quarantined sibling improve draft, racing law), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 + 4 -l companions live, 38 lights standing, woodyard 1f2c6f592095b204 exact, ledger law exact (2370250 after D+0/E+0 append), interlane md5 f6254cd02cbcbee79e54104669be6981 stable, standing gate real exit 0 absorbing mid-tick HEAD advances (038ac45 waysign-13, dfecce4 improve-12, 6cafc64 dress-18, 3ec60da artwalk-52, night-20) | CLEAN SWEEP |

## Findings register

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
- woodyard: nx-town-woodyard lib 1f2c6f592095b204 (deterministic pin).
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
