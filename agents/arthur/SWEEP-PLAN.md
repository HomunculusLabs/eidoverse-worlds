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
| sweep-62 | 2026-09-07 | 269→270 epoch-corrected (epoch A 269==269 fully quiet vs sweep-61 baseline sha16 8ab94a95922678e3 0/0/0; dress-84 snagdead landed PRE-tick @ 3bb4863 = epoch B: +1 domain-valid arrival nx-dress-se-snagdead-001 @ (60.6,-0.0461,-30) yaw -2.35619 lib 7ac8320374482a3c comp {}, tuple matches dress-84 ledger line-for-line, bbox 1.81x6.69x1.74 scale-sane, r67.6 SE mid-ring 32.6m+ off every tier-1 waypoint; improve-34 longhouse re-place landed LIVE mid-tick, commit pending = epoch C: ONE classified drift field-set nx-town-longhouse lib e3adcd3d→c4aaa783 at identical tuple, bbox y-max 5.369→5.245 strict-subset (improve-34 chimney strict subset), comp {} both epochs = comp-neutral, domain-valid not drift; 0 departures, 0 unexplained drift; snapshot rewritten 108120B/270 ents/sha16 2eba06f4f3a4a124, format round-trip byte-identical pre-write, pre-write assertions (exactly one arrival, sorted insert at 129, count bump), post-rewrite drift ZERO, epoch-C live re-read confirms the one classified interleave) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, NINETEENTH sweep since routing, no escalation due — law keys Sev 1); 232 bbox non-light / 233 classified / 0 coverage holes, SAT run at epoch B + re-run at epoch C (longhouse y-shrink introduced no new contacts) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 @ 0.370 — epoch-A walks stand by construction, snagdead 32.6m+ off every leg, sweep-53 precedent); tier-2 40th cycle bunkhouse 6/6 @ 0.380 + garden-cottage 6/6 @ 0.355 ALL PASS (committed pointer honored) + ADDITIONAL longhouse 6/6 @ 0.346 walked fresh at epoch C — improve-34 deferred its post-place walk to next tick, cross-lane gap closed read-only this sweep | pins 14/15 with ONE CLASSIFIED (struct-18 checker, first non-15/15 in 20 sweeps — live nx-struct-waterstair 2b418077 == committed baseline exact, 0 census drift; checker's LOCAL village_waterstair3.glb sha bb3a0a22 mtime Sep 7 03:06 = struct lane's un-placed WIP rebuild, struct-60 ledger names waterstair next refine subject; sweep-33 hypar class, LOCAL WIP artifact not live drift; remaining 14 pins exact). Carousel comp bag exact 7 + ce3633992d07055e, gate lamps 4/4 full 18b69a6b bbox PRESENT + 4 -l companions, belltower 2419fbc5 + ladder live, windmill 369c5724 live, woodyard 01b78fdd exact, hamlet particles 5-of-5, welcome nx-welcome 7d1bd0c9 + nx-welcome-l companion live, 38 lights, 16 comp-bearing census-matched, interlane f6254cd0 stable, ledger law EXACT 2370620 at append | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-63 | 2026-09-07 | 270==270 steady (232 thing + 38 light; 0 arrivals, 0 departures, exactly ONE classified drift field-set = the known longhouse epoch absorbed: nx-town-longhouse lib e3adcd3d→c4aaa783 at identical tuple, bbox y-max 5.369→5.245 strict-subset, improve-34/35 committed re-place corroborated line-for-line by sweep-62's post-append note — domain-valid, not drift; epoch B 270==270 0/0/0 between reads, no sibling landed this tick) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, TWENTIETH sweep since routing, no escalation due — law keys Sev 1); 232 bbox non-light / 233 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 @ 0.370) + tier-2 41st cycle inn 6/6 @ 0.364 + potter 6/6 @ 0.366 ALL PASS (committed pointer honored) | pins 14/15 with ONE CLASSIFIED (waterstair local 8d7b4b2a = struct-61 committed v5 rebuild, placement deferred fail-closed per its own ledger; live 2b418077 == baseline exact, 0 census drift — sweep-33 hypar class, second consecutive), carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full 18b69a6bb2f5862f bbox PRESENT + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c5724, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5, 38 lights, 16 comp-bearing census-matched, interlane f6254cd0 stable, ledger law EXACT at append, standing gate ALL PASS real exit 0 at tick-start 6a95108 | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-64 | 2026-09-07 | 270→271 epoch-corrected (epoch A 270==270 fully quiet vs sweep-63 baseline sha16 ddb7b2a2e2f21678, 0/0/0 on id/pos/yaw/lib/scale/kind/bbox; dress-85 placement landed mid-tick = epoch B: +1 domain-valid arrival nx-dress-sw-bellpost-001 @ (-54,-0.0294,-69.8) yaw -0.4311 lib 1ea38f613295a46a comp {} r88.2 SW, tuple matches the dress-85 v4 1ea38f61 conditional-pass build; struct-62 @ f2711fe = ONE classified drift field-set nx-struct-waterstair lib 2b418077→46c39401 at identical tuple, bbox y-shrink v7 lightstone-rim re-place; 0 departures, 0 unexplained drift; snapshot rewritten 108565B/271 ents/sha16 0f68203b43a1ebde — TRUE sha, ledger prose said ad30a2f435c9cd7a pre-guess, correction of record — pre-write assertions, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, TWENTY-FIRST sweep since routing, no escalation due — law keys Sev 1); 233 bbox non-light / 233 classified / 0 coverage holes, SAT re-run at epoch B | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; both changed entities >30m off every leg — epoch-A walks stand by construction, sweep-53 precedent) + tier-2 42nd cycle per committed pointer hall 8/8 @ 0.360 + forge 6/6 @ 0.375 ALL PASS | pins 15/15 ALL_PINS_OK (epoch-B re-run), carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full 18b69a6bb2f5862f bbox PRESENT (R-120 resolved standing) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c5724, woodyard 01b78fdd exact, welcome 7d1bd0c9 (nx-welcome, id re-derived) + welcome-l companion live, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched, interlane f6254cd0 stable, ledger law EXACT 2370631 at append (audit-balance slice D+E), standing gate ALL PASS real exit 0 at tick-start 5722bdd + re-run f2711fe post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |

|| sweep-65 | 2026-09-07 | 271==271 (233 thing + 38 light; 0 arrivals, 0 departures, exactly ONE classified drift field-set = nx-town-potter lib dad7c82efbf3202b→2062c4468996b2bb at identical tuple (26,0,40.5) yaw −2.5835, bbox BYTE-IDENTICAL (3.435×1.017×1.706 unchanged), comp GAIN motion:pwheel spin degPerSec 9 live post-flip — improve-37 in flight (untracked placer next-place-improve37-potter.ts pins exactly this lib + pwheel comp + pre-place bag assertion; mkv3-potter41.ts modified in tree; no [improve-37] ledger entry yet = placement landed live, commit pending), sweep-30 uncommitted-placer class, domain-valid, not drift; epoch B 271==271 0/0/0 across a 20s-paced re-read, no further sibling change) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, TWENTY-SECOND sweep since routing, no escalation due — law keys Sev 1); 233 bbox non-light / 233 classified / 0 coverage holes, SAT run at epoch A over the new potter bytes (verdict string anchored: SWEEP HAS FINDINGS on exactly the one known pair) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 43rd cycle per committed pointer stable 5/5 @ 0.396 + market 6/6 @ 0.389 ALL PASS + ADDITIONAL potter 6/6 @ 0.366 walked fresh over the improve-37 bytes — improve-37's placer carries no post-place walk (deferred per its header) so the cross-lane gap was closed read-only this sweep, sweep-62 longhouse precedent | pins 15/15 ALL_PINS_OK (20th consecutive), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 resolved standing) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 369c5724, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, hamlet embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched (potter now the 16th, motion:pwheel — comp count 16 preserved through the re-place), interlane f6254cd0 stable, ledger law EXACT 2370631 at entry (audit-balance slice 2336002 + ΣD 33687 + ΣE 942), standing gate ALL PASS real exit 0 at tick-start 0989074 + re-run at mid-tick HEAD 5cdef84 (struct-63 analysis-only absorbed) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-67 | 2026-09-07 | 273==273 (233 thing + 38 light; 0 arrivals, 0 departures, exactly ONE classified drift field-set = seed family 4x lib 710ec3e5→699387ab at identical tuples + bbox y-max 0.12→2.51 uniform, footprint ±3.275 byte-identical = improve-39 sol_core @ 5141ff5 PRE-tick, ledger-matched, domain-valid not drift; epoch B 20s-paced re-read 0/0/0, single-read epoch) | exit 3 on exactly the three KNOWN unclassified: R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 24th sweep since routing, no escalation due — law keys Sev 1) + R-122 ellipsecourt\|shelltower −2.203 / \|meridianstair −1.736 (Sev 2 routed struct @ sweep-66, 2nd sweep, no escalation due); 235 bbox non-light / 233 classified / 0 coverage holes, SAT ran fresh over the new seed bytes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5, NE 7/7, SW 5/5; seeds r67.9..70.5 SW 47m+ off every tier-1 leg, walks stand by construction, sweep-53 precedent); tier-2 45th cycle per committed pointer garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 ALL_PINS_OK 22nd consecutive, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched, interlane f6254cd0 stable, ledger law EXACT 2370643 at gate (ledger probe self-catch sweep-36 class, corrected pre-verdict), standing gate ALL PASS real exit 0 at tick-start 5141ff5 (snapshot rewritten 109423B / 273 ents / sha16 415f21d85fc8861b, pre-write assertion diff exactly 4x seed lib+bbox, post-rewrite drift ZERO) | CLEAN SWEEP — R-121/R-122 open, known, no escalation due |
| sweep-68 | 2026-09-07 | 274==274 (236 thing + 38 light; epoch A fully quiet vs sweep-67 epoch-C baseline b8c316c6cda9b911: 0 arrivals, 0 departures, 0 drift; mid-tick the struct lane executed the routed R-122 fix LIVE — epoch B caught exactly ONE drift field-set nx-struct-ellipsecourt pos (0,−0.0476,−47)→(−3.75,−0.0403,−50.75), yaw pi/2 + lib UNCHANGED 2aa37e9d (same-bytes reseat), committed by struct-66 @ 4247dc3 mid-tick with its ledger entry; all affected evidence re-taken fresh per polish-270 epoch law: SAT re-run at epoch B, true ellipse-edge clearances re-derived, gate re-run at af85299 then 4247dc3; epoch C 25s-paced re-read 0/0/0 — reseat settled; snapshot rewritten like-for-like 109835B / 274 ents / sha16 eec3a26e8ecd57da, pre-write assertion diff exactly [ellipsecourt pos], post-rewrite drift ZERO; dress-90 stile v11 lib flip 5e9d301d→2c7f1bbe @ unchanged tuple landed at eda62eb AFTER the epoch-C read — its placer ran fresh SAT clean, recorded as the known epoch for sweep-69's baseline rewrite) | exit 3 at epoch A on the three known unclassified, exit 3 at epoch B on exactly ONE = R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 25th sweep since routing, no escalation due — law keys Sev 1); R-122 CURED by the reseat: both ellipsecourt contacts left the unclassified set (3→1), true ellipse-edge vs meridianstair OBB 1.553m / shelltower OBB 1.875m (conservative lower bounds bracketing struct-66 vertex-cloud 1.773/1.835, all above the 1.4m pinch law); 236 bbox non-light / 233 classified / 0 coverage holes at both epochs | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each at epoch A (core 64/64 @ 0.38, NW 5/5, NE 7/7, SW 5/5; court reseat r51.9 S — nearest walked waypoint 28.2m, all walks stand by construction, sweep-53 precedent; struct-66 re-proved its own 11/11 court walk at the new tuple); tier-2 46th cycle per committed pointer bunkhouse 6/6 @ 0.380 + longhouse 6/6 @ 0.346 ALL PASS | pins 15/15 ALL_PINS_OK 23rd consecutive (re-run at epoch B post-reseat, ellipsecourt not a pinned entity), carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched, interlane f6254cd0 stable, ledger law EXACT 2370653 at append base (struct-66 E+2 absorbed), standing gate ALL PASS real exit 0 at tick-start b7a0b02 + re-run at af85299 mid-tick | CLEAN SWEEP — R-122 CLOSED (struct-66); R-121 open, known, no escalation due |
| sweep-69 | 2026-09-07 | 274==274 (236 thing + 38 light; epoch A: exactly ONE drift field-set = the pre-recorded dress-90 known epoch — nx-dress-nw-stile-001 lib 5e9d301d→2c7f1bbe @ unchanged tuple (-45.25,0.046,54.45) yaw 2.35619, bbox = v11 TRUE-decode dims (z-span 2.014→2.94 asymmetric→symmetric), dress-90 @ eda62eb ledger-matched, domain-valid not drift; epoch B: dress-91 @ 50cb353 landed mid-tick — nx-dress-sw-bellpost-001 lib 1ea38f61→fe682869 @ unchanged tuple (-54,-0.0294,-69.8) yaw -0.4311, v6 structural cure (arm to local +x, deepened bell, dark mouth disc), native 18m 4/4 + night 3/3, SAT clear on TRUE v6 dims per its own ledger, domain-valid not drift; improve-41 @ 921a49f decode-only interleave, zero mutations; 0 arrivals, 0 departures both epochs; snapshot rewritten twice with pre-write assertions (epoch A 109824B sha16 797906192ff40542 diff exactly [stile lib+bbox]; final epoch B 109824B sha16 86bc038404c6af69 diff exactly [bellpost lib+bbox]), post-rewrite drift ZERO both) | exit 3 on ONLY known R-121 lamp-n|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 26th sweep since routing, no escalation due — law keys Sev 1); 236 bbox non-light / 233 classified / 0 coverage holes, SAT run at epoch A + re-run at epoch B over the v6 bellpost bytes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; bellpost r88.2 SW 68m+ off every walked leg — walks stand by construction, sweep-53 precedent) + tier-2 47th cycle per committed pointer inn 6/6 @ 0.364 + stable 5/5 @ 0.396 ALL PASS | pins 15/15 ALL_PINS_OK (24th consecutive), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 resolved standing) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 369c5724, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, stile 2c7f1bbe (dress-90 epoch pin), bellpost fe682869 (dress-91 epoch pin), hamlet embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched, interlane md5 f6254cd0 stable, ledger law EXACT 2370660 at append (survey-31 D+0/E+0 absorbed), standing gate ALL PASS real exit 0 at tick-start c6af019 + re-run ALL PASS exit 0 at 921a49f post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
EPOCH-C CORRECTION (disclosed, correction-of-record class — struct-65 wavepergola landed at 63e0484 AFTER this sweep's ledger append, as my own commit's parent): census-C 273→274 with exactly ONE additional domain-valid arrival nx-struct-wavepergola @ (51,−0.0221,9) yaw 0 lib 32dc2e7d, tuple matches its committed ledger line-for-line, 0 drift on 273 shared ids. All affected evidence re-taken fresh before the correction commit: SAT re-run at epoch C (236 bbox non-light / 233 classified / 0 holes, exit 3 on the same three known unclassified — no new contacts), walk-band check (wavepergola 38.2m from the nearest walked waypoint, all walks stand by construction, sweep-53 precedent). The committed ledger entry (sweep-67, D+0/E+0, law exact 2370651 after struct-65's D+1 absorbed) is epoch-B-true; this block is the correction of record. Snapshot FINAL epoch C: 109828B / 274 entities / sha16 b8c316c6cda9b911 (diff vs the committed epoch-B rewrite = exactly [wavepergola arrival]); next sweep's baseline.

|| sweep-66 | 2026-09-07 | 271→273 EPOCH-CORRECTED (epoch A 271==271 fully quiet vs sweep-65 baseline sha16 c7baa08337c7d619: 0 arrivals, 0 departures, 0 drift on id/pos/yaw/lib/scale/kind/bbox; struct-64 ellipsecourt @ 6a8220a + dress-88 dryingracks @ 5444841 landed mid-tick = epoch B: +2 domain-valid arrivals nx-struct-ellipsecourt @ (0,-0.0476,-47) yaw pi/2 lib 2aa37e9d29ba43f2 comp {} + nx-dress-nw-dryingracks-001 @ (-59,-0.0009,33) yaw 2.3562 lib f0343efb6e7ab0fa comp {}, both tuples match their committed ledgers line-for-line; improve-38 6cff960 build-only + survey-29 read-only interleaved; 0 departures, 0 drift on 271 shared ids; snapshot rewritten 109419B/273 ents/sha16 87b8a2b6bb367424, post-rewrite drift ZERO) | exit 3 on THREE unclassified = R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, TWENTY-THIRD sweep since routing, no escalation due — law keys Sev 1) + TWO NEW: ellipsecourt\|shelltower -2.203 and ellipsecourt\|meridianstair -1.736 — source-true decode (live libs == local builds hash-exact, full vertex clouds): TRUE min solid distances 0.085m (ground-band plan 0.006m) and 0.472m — real sub-law contacts, NOT bbox inflation; routed R-122 Sev 2 (see findings); 235 bbox non-light / 233 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; NW 5/5 @ 0.38 RE-WALKED AT EPOCH B — dryingracks 5.2m off the NW lane, sweep-58 band precedent); tier-2 44th cycle row-cottage 6/6 @ 0.384 + observatory circuit 5/5 @ 0.389 ALL PASS (observatory re-walked at epoch B, 17.6m from court center, inside band) | pins 15/15 ALL_PINS_OK (21st consecutive, re-run at epoch B), carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full 18b69a6bb2f5862f bbox PRESENT + 4 -l companions, belltower 2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched (arrivals comp-neutral), interlane f6254cd0 stable, ledger law EXACT 2370640, gate ALL PASS exit 0 at tick-start bf047fd + re-run at 6a8220a post-interleave | FINDINGS — R-122 Sev 2 NEW (struct) |

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

sweep-62: CLEAN SWEEP, epoch-correction tick. Census epoch A 269==269
fully quiet vs the committed sweep-61 baseline (sha16
8ab94a95922678e3): 0 arrivals, 0 departures, 0 drift on
id/pos/yaw/lib/scale/kind/bbox. dress-84 (snagdead spawn @ 3bb4863)
had landed PRE-tick — epoch B: exactly ONE domain-valid arrival
nx-dress-se-snagdead-001 @ (60.6,-0.0461,-30) yaw -2.35619 lib
7ac8320374482a3c comp {} — tuple matches dress-84's committed ledger
line-for-line, bbox 1.81x6.69x1.74 scale-sane, r67.6 SE mid-ring
32.6m+ from every tier-1 waypoint. improve-34's longhouse re-place
(e3adcd3d→c4aaa783) landed LIVE mid-tick with its commit pending —
epoch C re-taken fresh per the polish-270 law: 270 entities (232
thing + 38 light), ONE classified drift field-set nx-town-longhouse
lib flip at identical tuple, bbox y-max 5.369→5.245 strict-subset
(the improve-34 chimney strict subset), comp {} both epochs =
comp-neutral, domain-valid not drift; 0 departures, 0 unexplained
drift. Overlap run at epoch B and re-run at epoch C: 232 bbox
non-light, 233 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n|nx-town-mapboard -0.407 — known Sev 2
routed to artwalk @ sweep-43, nineteenth sweep since routing, not
new, no escalation due (law keys severity-1); the longhouse
y-shrink introduced no new contacts. Tier-1 4/4 per-leg verified
81/81 ALL_PASS real exit 0 each: core 64/64 @ 0.380, NW 5/5 @
0.380, NE 7/7 @ 0.380, SW 5/5 @ 0.370 (epoch-A walks stand by
construction — both changes sit off every walked leg, sweep-53
precedent). Tier-2 40th cycle: bunkhouse 6/6 @ 0.380 + garden-
cottage 6/6 @ 0.355 ALL PASS (committed pointer honored) + one
ADDITIONAL longhouse 6/6 @ 0.346 walked fresh at epoch C —
improve-34 deferred its post-place walk to its next tick, so the
cross-lane walk gap was closed read-only this sweep. Integrity:
pins 14/15 with ONE CLASSIFIED (struct-18 checker, first non-15/15
in 20 sweeps) — live nx-struct-waterstair 2b418077 == the committed
baseline exactly, 0 census drift; the checker's LOCAL
village_waterstair3.glb sha bb3a0a22 (mtime Sep 7 03:06) is the
struct lane's un-placed WIP rebuild — struct-60's ledger names
waterstair its next refine subject; sweep-33 hypar class: LOCAL WIP
artifact, not live drift; the remaining 14 pins exact. Carousel
comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 full
18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) + 4 -l
companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill
369c5724 live, woodyard 01b78fdd00f090a7 exact, hamlet particles
5-of-5 live, welcome nx-welcome 7d1bd0c9 + nx-welcome-l companion
live, 38 lights, 16 comp-bearing entities census-matched, interlane
md5 f6254cd0 stable, ledger law EXACT 2370620 at append, standing
gate ALL PASS real exit 0 at tick-start 3bb4863. Snapshot rewritten
like-for-like: 108120B / 270 entities / sha16 2eba06f4f3a4a124,
format round-trip proven byte-identical BEFORE the write, pre-write
assertions (exactly one arrival, sorted insert at index 129, count
bump), post-rewrite drift vs live ZERO, epoch-C live re-read
confirms the one classified interleave. Probe self-caught
pre-verdict: walk-parse keyed `dist` where the approach walkers
emit `distance` (sweep-58/61 class recurrence, third catch — plan
row and narrative both record the per-file schema anchor).
Zero world mutations, zero defect notes, zero uploads, zero
shared-budget use. Next tier-2 pair (sweep-63): inn + potter
(41st cycle — true LRU pair by latest-walk scan: inn 57, potter 58;
then hall/forge/stable 59 — stable was re-walked at 59 despite the
57 walk, row-cottage/market 60, tower-house 61; bunkhouse/garden-
cottage/longhouse fresh this sweep). Rotation self-catch chain
pre-commit (sweep-59 class, disclosed in full): pointer draft 1
named inn + forge "both last walked sweep-59" — false for inn;
draft 2 correctly read inn + potter but draft 3 "corrected" to
inn + stable on a false 57-tie by misreading stable's sweep-57 walk
as its latest (it was re-walked at sweep-59; LRU keys on the LATEST
walk event). Final pointer derives from a scripted latest-walk scan
of the narrative walk events (table rows and pointer sentences
stripped; hyphen-wrapped door names joined — garden-\ncottage hid
its own sweep-62 event from the first scan pass).

POST-APPEND CORROBORATION (interleave absorbed): improve-35 @ 018d89b
landed after this sweep's ledger append, carrying the sweep-62 entry
in its snapshot (verified: grep [sweep-62] HEAD == 1, clean status)
and confirming the longhouse re-place end-to-end — exact tuple
(9,0,26) yaw -2.828368, lib e3adcd3d→c4aaa783, comp {} both sides,
its own interior walk 6/6 @ 0.346 matching this sweep's independent
epoch-C walk deviation-for-deviation. The epoch-C classification
"domain-valid, commit pending" is now "committed" — no correction
needed; the gate re-run passed real exit 0 at 018d89b with this
sweep's plan+snapshot staged.


sweep-63: CLEAN SWEEP, single-classified-epoch-absorb tick (quiet live world).
Census epoch A 270==270 vs the committed sweep-62 baseline (sha16
2eba06f4f3a4a124): 0 arrivals, 0 departures, exactly ONE drift field-set —
nx-town-longhouse lib e3adcd3d→c4aaa783 at identical tuple, bbox y-max
5.369→5.245 strict-subset. This is precisely the known epoch sweep-62's
register note recorded (improve-34 build committed 84c3257, re-place landed
live mid-tick, corroborated end-to-end by improve-35 @ 018d89b: exact tuple
(9,0,26) yaw −2.828368, comp {} both sides, its own interior walk 6/6 @ 0.346
matching sweep-62's independent epoch-C walk deviation-for-deviation).
Domain-valid, not drift; this sweep absorbs the flip into the snapshot as
directed. Epoch B (post-walks re-read): 270==270, 0/0/0 vs epoch A — no
sibling landed during the tick. Overlap: 232 bbox non-light, 233 classified,
0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, twentieth sweep since routing, not new, no escalation due (the law
keys on severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0: core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 @
0.370. Tier-2 41st cycle (committed pointer honored): inn 6/6 @ 0.364 +
potter 6/6 @ 0.366 ALL_PASS. Integrity: struct pins 14/15 with ONE
CLASSIFIED — checker local village_waterstair3.glb sha 8d7b4b2a = struct-61's
COMMITTED v5 diagonal-cascade rebuild (placement deferred fail-closed on the
unjudged 18m contract per its own ledger); live nx-struct-waterstair 2b418077
== the committed baseline exactly, 0 census drift — LOCAL WIP artifact class
(sweep-33 hypar; second consecutive classified, expected to resolve on
struct's next reseat). Carousel comp bag exact 7 + lib ce3633992d07055e, gate
lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 stays resolved) +
4 -l companions live, belltower 2419fbc53a1d65e1 + ladder comp live, windmill
369c5724 live, woodyard 01b78fdd00f090a7 exact, welcome 7d1bd0c9 +
welcome-l companion live, cistern 156b4fc8 (improve-28 pin), hamlet embers
5-of-5 live, 38 lights, 16 comp-bearing entities census-matched, interlane
md5 f6254cd0 stable, ledger law EXACT at append, standing gate ALL PASS real
exit 0 at tick-start 6a95108 (struct-61, zero live mutations per its own
entry). Snapshot rewritten like-for-like: 108120B / 270 entities / sha16
ddb7b2a2e2f21678, pre-write assertions (7-field diff exactly
[nx-town-longhouse]), post-rewrite drift vs live ZERO, format round-trip
byte-identical. Probe self-catches pre-verdict, both repaired in-tick and
disclosed: (a) integrity probe substring-matched 'belltower' onto the
nx-artwalk-b5-belltower-rings rider (real nx-town-belltower lines printed
exact immediately after); (b) windmill/welcome/cistern pins compared 8-hex
prefixes with == against full 16-hex libs (sweep-55/57 comparison class —
all three prefix-exact, re-derived from printed values). First rewrite
attempt fail-closed on the format assertion (trailing-newline detail),
re-derived exact indent=1+LF container before writing. Zero world mutations,
zero defect notes, zero uploads, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-64): hall + forge (42nd cycle — true LRU pair by the
latest-walk scan: hall last walked sweep-59, forge sweep-59; next-stalest
stable @ sweep-59 re-walk, row-cottage/market 60, tower-house 61;
bunkhouse/garden-cottage/longhouse fresh 62, inn/potter fresh 63).

sweep-64: CLEAN SWEEP, epoch-correction tick. Census epoch A 270==270
fully quiet vs the committed sweep-63 baseline (sha16 ddb7b2a2e2f21678):
0 arrivals, 0 departures, 0 drift on id/pos/yaw/lib/scale/kind/bbox
across two early reads — then two sibling mutations landed mid-tick, so
per the polish-270 epoch law all affected evidence was re-taken fresh
before verdicts. Epoch B: +1 domain-valid arrival nx-dress-sw-bellpost-001
@ (-54, -0.0294, -69.8) yaw -0.4311 lib 1ea38f613295a46a comp {} (r88.2
SW — the dress-85 v4 1ea38f61 conditional-pass build placed per its own
queued placement; scale/pose sane) and ONE classified drift field-set
nx-struct-waterstair lib 2b418077→46c39401 at identical tuple
(0, -0.0322, -32) yaw 0 with bbox y-max 0.725→shrink envelope = struct-62
@ f2711fe v7 lightstone-rim re-place (gate line confirms: reseated exact
tuple PLACED_VERIFIED 2 verbs + idempotent 0, walk 4/4 worst 0.358m).
0 departures, 0 unexplained drift. Overlap re-run at epoch B: 233 bbox
non-light, 233 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, twenty-first sweep since
routing, not new, no escalation due (the escalation law keys on
severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW
5/5 @ 0.37. Both changed entities sit >30m off every tier-1/tier-2
walked leg (bellpost r88.2 SW, waterstair r32 S; all tier-1 legs r<20)
— epoch-A walks stand by construction (sweep-53 precedent) and the SAT
re-run covers the collision surface; struct-62's own 4-leg walk re-proves
the waterstair approach. Tier-2 42nd cycle per committed pointer: hall
8/8 @ 0.360 + forge 6/6 @ 0.375 ALL PASS. Integrity: pins 15/15
ALL_PINS_OK (epoch-B re-run), carousel comp bag exact 7 + lib
ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox
PRESENT (R-120 resolved and standing) + 4 -l companions, belltower
2419fbc53a1d65e1 + ladder comp live, windmill 369c572480b0e786, woodyard
01b78fdd00f090a7 exact, welcome 7d1bd0c9545c44fb + welcome-l companion
live, cistern 156b4fc8c7287a9d, hamlet embers 5-of-5 with full payloads,
38 lights, 16 comp-bearing entities census-matched, interlane md5
f6254cd0 stable, ledger law EXACT 2370631 at append. Ledger-law probe
correction (disclosed): the audit-balance baseline row declares
parts-truth 2336002 and the running total = BASE + ΣD + ΣE over the
post-balance slice — first probe summed the whole file across eras and
keyed the wrong base row; re-derived slice equation closes EXACT (BASE
2336002 + ΣD 33687 + ΣE 942 = 2370631, zero F-rows). Snapshot rewritten
like-for-like: 108565B / 271 entities / sha16 0f68203b43a1ebde, pre-write
assertions (exactly one arrival; diff set exactly [waterstair lib+bbox]),
post-rewrite drift vs live ZERO. CORRECTION OF RECORD: the appended
ledger prose carries pre-guessed snapshot sha16 ad30a2f435c9cd7a — the
true sha16 of the committed baseline is 0f68203b43a1ebde (computed after
install); file content verified correct, prose-only discrepancy disclosed
here (sweep-51 register-note precedent class). Probe self-catches
pre-verdict: guessed entity id nx-town-welcome (true id nx-welcome,
re-derived from census); walk-output parser required the [physics] banner
skip before JSON parse (sweep-35 class); BSD grep '+' literalism
initially read as zero seam abstentions (re-counted 5, known normalized
set unchanged); first [physics]-banner parse hit trailing content after
the JSON object (re-derived on index-of-brace slice). Zero world
mutations, zero defect notes, zero uploads, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-65): stable + market (43rd cycle —
LRU by latest-walk scan: stable last walked sweep-59, market sweep-60;
next-stalest row-cottage @ sweep-60, tower-house @ sweep-61;
hall/forge fresh 64).

sweep-65: CLEAN SWEEP, single-classified-flip tick (no epoch correction
needed — the one live change predates this tick's first census). Census
271==271 vs the committed sweep-64 baseline (sha16 0f68203b43a1ebde): 0
arrivals, 0 departures, exactly ONE drift field-set — nx-town-potter lib
dad7c82efbf3202b→2062c4468996b2bb at identical tuple (26,0,40.5) yaw
−2.5835, bbox BYTE-IDENTICAL (3.435×1.017×1.706), comp GAIN
motion:pwheel spin degPerSec 9 now live — improve-37 in flight (untracked
placer next-place-improve37-potter.ts pins exactly this lib + the pwheel
comp + a pre-place bag assertion; mkv3-potter41.ts modified in tree; no
[improve-37] ledger entry yet, so the placement landed live with commit
pending — sweep-30 uncommitted-placer class). Domain-valid, not drift.
Epoch B (20s-paced re-read): 271==271, 0/0/0 — stable. Overlap: exit 3 on
exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 (known
Sev 2 routed to artwalk b26 choreography @ sweep-43, TWENTY-SECOND sweep
since routing, not new, no escalation due — law keys severity-1); 233
bbox non-light / 233 classified / 0 coverage holes, SAT run at epoch A
over the new potter bytes (verdict string anchored: SWEEP HAS FINDINGS on
exactly the one known pair). Tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38,
SW 5/5 @ 0.37. Tier-2 43rd cycle per committed pointer: stable 5/5 @
0.396 + market 6/6 @ 0.389 ALL PASS; ADDITIONAL potter 6/6 @ 0.366
walked fresh over the improve-37 bytes — improve-37's placer carries no
post-place walk (deferred per its header), so the cross-lane gap was
closed read-only this sweep (sweep-62 longhouse precedent). Integrity:
pins 15/15 ALL_PINS_OK (20th consecutive clean), carousel comp bag exact
7 + lib ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f
bbox PRESENT (R-120 resolved standing) + 4 -l companions, belltower
2419fbc53a1d65e1 + ladder comp live, windmill 369c5724, woodyard
01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l companion live,
cistern 156b4fc8c7287a9d, hamlet embers 5-of-5 full payloads, 38 lights,
16 comp-bearing census-matched (potter now the 16th, motion:pwheel —
comp count 16 preserved through the re-place), interlane md5 f6254cd0
stable, ledger law EXACT 2370631 at entry (audit-balance slice 2336002 +
ΣD 33687 + ΣE 942). Standing gate ALL PASS real exit 0 at tick-start
0989074; struct-63 (@ 5cdef84, analysis-only, zero mutations per its own
message) interleaved mid-tick and the gate re-run returned ALL PASS real
exit 0 at the new HEAD. Snapshot rewritten with format round-trip proven
byte-identical BEFORE the write, pre-write assertion (diff set exactly
[nx-town-potter lib]), post-rewrite drift vs live ZERO: 108565B / 271
entities / sha16 c7baa08337c7d619. PLAN-EDIT self-catch, repaired before
commit: the first history-row insert came out corrupted — seven fields
wrong (80/80 vs 81/81, duplicated NW/dropped NE, 0.63 vs 0.396, dropped
market, "gate lamps column", "5-perfect", transposed tick-start HEAD
7099074, R-21 vs R-121; adjacent-token-bleed class, sweep-43/50/53/55
family) — caught by re-reading the written region, replaced wholesale by
an asserted-unique-anchor python edit, all fields verified exact after
repair. Probe self-catches repaired in-tick: ledger-law regex summed the
whole file across eras (re-derived the audit-balance slice per sweep-64
class); walk-output parser guessed the results schema twice before
anchoring on actual keys (sweep-48 class); tier-2 LRU pointer
script-derived from plan content, not memory. Zero world mutations, zero
defect notes written, zero uploads, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-66): row-cottage + observatory circuit (44th
cycle — LRU re-derived fresh from plan scan: row-cottage last walked
sweep-60, observatory sweep-59; next-stalest tower-house @ sweep-61,
garden-cottage/bunkhouse/longhouse @ 62).

sweep-66: EPOCH-CORRECTION sweep with a NEW finding (R-122). Epoch A:
census 271==271 vs the committed sweep-65 baseline (sha16
c7baa08337c7d619): 0 arrivals, 0 departures, 0 drift on
id/pos/yaw/lib/scale/kind/bbox — improve-37's potter flip now committed
at bee4b18, corroborating sweep-65's classification. While walks ran,
two sibling placements landed mid-tick (struct-64 ellipsecourt @
6a8220a, dress-88 dryingracks @ 5444841; improve-38 @ 6cff960
build-only and survey-29 read-only also interleaved), so per the
polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: epoch-B census 273 (235 thing + 38 light) with exactly TWO
domain-valid arrivals — nx-struct-ellipsecourt @ (0, −0.0476, −47) yaw
π/2 lib 2aa37e9d29ba43f2 comp {} and nx-dress-nw-dryingracks-001 @
(−59, −0.0009, 33) yaw 2.3562 lib f0343efb6e7ab0fa comp {} — both
tuples match their committed ledger lines; 0 departures, 0 drift on
all 271 shared ids.

SAT re-run at epoch B: exit 3 on THREE unclassified. First = R-121
lamp-n | nx-town-mapboard −0.407, known Sev 2 routed to artwalk @
sweep-43, twenty-third sweep since routing, not new, no escalation due
(the law keys on severity-1). The OTHER TWO are NEW and are the sweep's
finding: ellipsecourt | nx-struct-shelltower −2.203 and ellipsecourt |
nx-struct-meridianstair −1.736. Decode before classify (struct-19
candidate): both live libs hash-verified == local builds
(2aa37e9d29ba43f2 / bfdb1792374586e6 / dec58a3b6bfcae4a), full vertex
clouds transformed to world — TRUE min solid-to-solid distances are
0.085m (court N ring apex to shelltower base plinth, ground-band plan
0.006m) and 0.472m (court SE arc to meridianstair stair foot). NOT
bbox inflation: the square-bbox component of the SAT gaps (shelltower
8.1×8.1 square vs round tower, yawed stair OBB) inflates the numbers,
but the real contacts are themselves sub-law (1.4m pinch law,
visitor band). Root cause on the owner side: struct-64's preflight
"fresh 271 census SAT full-ellipse rotated-OBB zero neighbors within
8m" was a CENTER-to-center test (court center to shelltower center
9.47m, to meridianstair 9.58m — both >8m) that charged neither the
court's own 7.0m semi-major reach nor the neighbors' extents — probe
pitfall 10 (center-distance vs corner-radius) applied to a placer.
ROUTED as R-122, Sev 2 (world not broken; walkable ring interior
intact; two designed-adjacent S-district works sit at sub-law gaps):
REPAIR-REGISTER entry + one-line queue note in STRUCTURES-PLAN. The
owning lane's cheapest cure mirrors R-121's: translate the court
2.5–3m south (z −47 → −49.5..−50; waterstair sits r15 from plaza at
(0,−32), court bbox z-min −53.97 → −56.5..−56.9, meridianstair OBB
z-min −58.4 — re-derive exact) or re-site shelltower/meridianstair;
either way re-run source-true SAT, not center-distance.

Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0:
core 64/64 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37, NW 5/5 @ 0.38
re-walked at epoch B (dryingracks sits 5.2m off the NW approach lane —
inside the re-verify band, sweep-58 precedent). Tier-2 44th cycle per
the committed pointer: row-cottage 6/6 @ 0.384 + observatory circuit
5/5 @ 0.389 ALL PASS (observatory re-walked at epoch B too — 17.6m
from the court center, inside the 10m band; row-cottage 37.8m, outside
by construction). Integrity re-run at epoch B: pins 15/15 ALL_PINS_OK
(21st consecutive clean), carousel comp bag exact 7 + lib
ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox
PRESENT (R-120 resolved standing) + 4 -l companions, belltower
2419fbc53a1d65e1 + ladder comp live, windmill 369c572480b0e786,
woodyard 01b78fdd00f090a7, welcome 7d1bd0c9 + welcome-l, cistern
156b4fc8c7287a9d, hamlet embers 5-of-5 with full payloads (comp key
'particles', preset 'embers'), 38 lights, 16 comp-bearing entities
census-matched (both arrivals comp-neutral {}), interlane md5 f6254cd0
stable, ledger law EXACT 2370640 at append (entry describes epoch A —
this block is the correction of record, sweep-50/64 precedent).
Standing gate ALL PASS real exit 0 at tick-start bf047fd; re-run at
6a8220a post-interleave before commit. Snapshot rewritten from the
epoch-B capture: 109419B / 273 entities / sha16 87b8a2b6bb367424,
post-rewrite drift vs live ZERO (entity diff vs the sweep-65 baseline
= exactly the two arrivals). Probe self-catches repaired in-tick and
disclosed: (a) hamlet-embers grep keyed 'embers' against compKeys
(census key 'particles' — sweep-63 class); (b) first LRU scan matched
pointer-sentence names without walk events (sweep-62 class — re-derived
on the "name N/N @" signature: garden-cottage last walked sweep-56);
(c) snapshot projection KeyErrored on bbox for lights (re-derived with
.get, lib:null convention preserved). Zero world mutations, zero
uploads, zero comp edits, zero shared-budget use (D+0, E+0); one
register entry + one plan-file defect note routed. Next tier-2 pair
(sweep-67): garden-cottage + tower-house (45th cycle — LRU by
latest-walk scan: garden-cottage 56, tower-house 61; next-stalest
bunkhouse/longhouse 62, inn 63).


## Findings register

R-123 (Sev 2, struct — routed STRUCTURES-PLAN, sweep-71 2026-09-07) MERIDIANDIAL x
WATERSTAIR GEOMETRIC INTERLOCK. Epoch-B source-true decode of the exact live bytes
(sweep71-dial-contacts-decode.ts; sha16 == live lib prefix both): TRUE 3D min
17.2mm at dial (-1.068,0.354,-29.676) vs waterstair curb (-1.060,0.348,-29.690),
same walking-height bands (dial 0.153..0.594, ws -0.152..0.373), 43,272 pairs
<0.6m. Plan-view interlock at the meridian corridor: dial S stone band
(z -29.99..-29.56 at x 0.4..0.6) sits INSIDE the waterstair z-span
(-31.50..-28.42); at x=0 the dial pad south edge (-30.06) extends 1.65m past the
waterstair north rim (-28.41). The dial's advertised S meridian approach threads
a fused seam. struct-68's "zero solid neighbors within 8m" placement claim is
falsified (waterstair center 5.00m away). Companion fact, no separate item:
dial|hall closest 0.952m = diagonal corner kiss; true E-W corridor 1.834m PASSES
the 1.4 law. Fix is struct-lane: re-site dial N on the meridian with
vertex-cloud SAT vs all neighbors, re-prove the dial walk with an open S
re-prove the dial walk with an open S approach. Second sweep post-routing
(sweep-72, unchanged tuple per zero-drift census); escalation law keys Sev 1.

CLOSED sweep-73 (2026-09-07, owner action struct-70 @ 1ec03fe0): dial reseated
(0,-27) -> (6,-45) as an instrument cluster beside the orrery, same lib 7acc090a
content-addressed, remove+spawn PLACED_VERIFIED + idempotent by its lane with a
12/12 walk re-proof including the true open S approach. Sweep-side corroboration
this tick: epoch-B SAT re-run over the new seat shows BOTH dial contacts gone —
unclassified set collapsed 3 -> 1 (R-121 only); no new contact at (6,-45);
walked-leg affectedness classified quantitatively (new seat min 31.5m from any
tier-1/tier-2 leg point — epoch-A walks unaffected by construction). Register
closed; R-123 no longer part of the standing unclassified set.

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


sweep-68: CLEAN SWEEP, epoch-correction tick that watched R-122 close LIVE. Epoch
A census 274==274 fully quiet vs the sweep-67 epoch-C baseline (sha16
b8c316c6cda9b911): 0 arrivals, 0 departures, 0 drift on
id/pos/yaw/lib/scale/kind/bbox. Mid-tick the struct lane executed the routed
R-122 cure in the live world: epoch B (paced re-read) caught exactly ONE drift
field-set — nx-struct-ellipsecourt pos (0,−0.0476,−47) → (−3.75,−0.0403,−50.75),
yaw pi/2 and lib 2aa37e9d UNCHANGED (same-bytes reseat; no upload) — committed
by struct-66 @ 4247dc3 with its ledger entry (D+0, E+2, base absorbed). Per the
polish-270 epoch law all affected evidence was re-taken fresh before verdicts:
SAT re-run at epoch B, true clearances re-derived, gate re-run. Result: R-122
CURED — both ellipsecourt contacts left the unclassified set (3 → 1); my
independent conservative ellipse-edge-vs-OBB margins at the new tuple are
1.553m (meridianstair) and 1.875m (shelltower), bracketing struct-66's
vertex-cloud 1.773/1.835, all above the 1.4m pinch law; struct-66 also
falsified my register note's suggested south-only translation at source
(dz=−2.5 → 0.109m court-meridianstair — correct call, their SW-diagonal
reseat is the lawful zone; the register note already carries their STATUS:
FIXED line). Overlap after reseat: exit 3 on exactly ONE unclassified =
R-121 lamp-n|nx-town-mapboard −0.407 (known Sev 2 routed artwalk b26 @
sweep-43, 25th sweep since routing, no escalation due — law keys Sev 1);
236 bbox non-light / 233 classified / 0 coverage holes. Walk-band proof for
the reseat: court now r51.9 S; nearest tier-1 SW-leg waypoint 28.2m
(previously 30.2m) — all epoch-A walks stand by construction (sweep-53
precedent) and struct-66 re-proved its own 11/11 court walk at the new tuple.
Tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @
0.38, NW 5/5, NE 7/7, SW 5/5). Tier-2 46th cycle per committed pointer:
bunkhouse 6/6 @ 0.380 + longhouse 6/6 @ 0.346 ALL PASS. Integrity: pins 15/15
ALL_PINS_OK 23rd consecutive (re-run at epoch B; ellipsecourt is not a pinned
entity), carousel comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4
full 16-hex 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc5 +
ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 +
welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads (comp key
'particles', preset 'embers'), 38 lights, 16 comp-bearing census-matched,
interlane md5 f6254cd0 stable, ledger law EXACT 2370653 at append base.
Standing gate ALL PASS real exit 0 at tick-start b7a0b02, re-run at af85299
mid-tick. Snapshot rewritten like-for-like: 109835B / 274 entities / sha16
eec3a26e8ecd57da (pre-write assertion: entity diff vs the sweep-67 epoch-C
baseline = exactly [nx-struct-ellipsecourt pos]; projection fidelity proven
by byte-identical round-trip of the old baseline; post-rewrite drift vs live
ZERO — dress-90's stile lib flip landed post-read, recorded as the known
epoch above, sweep-52 precedent). Probe self-catches repaired in-tick: (a)
snapshot first rewrite used
the raw payload (126982B, comp/parent/tris keys) — caught by the size jump,
re-derived the 7-key like-for-like projection with a round-trip fidelity
proof; (b) row-insert byte-growth assertion initially too tight (2411B row vs
2500 floor) — fail-closed pre-write, bound corrected. Zero world mutations,
zero defect notes (R-122's owner closed it itself; register untouched this
tick), zero uploads, zero comp edits, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-69): inn + stable (47th cycle — LRU by latest-walk scan:
bunkhouse/longhouse refreshed this tick; inn 63, stable 65 now stalest).

sweep-69: CLEAN SWEEP, two-epoch tick. Census epoch A 274==274 vs the
committed sweep-68 baseline (sha16 a36b7aa332d48523): 0 arrivals, 0
departures, exactly ONE drift field-set — the PRE-RECORDED known epoch:
nx-dress-nw-stile-001 lib 5e9d301d→2c7f1bbe at unchanged tuple
(−45.25, 0.046, 54.45) yaw 2.35619, bbox z-span 2.014→2.94 (v11
TRUE-decode dims honored over the plan estimate, per dress-90's own
ledger) — classified domain-valid, not drift. Epoch B: dress-91 @ 50cb353
landed mid-tick (bellpost survey-29 dissent cure) — exactly ONE further
drift field-set nx-dress-sw-bellpost-001 lib 1ea38f61→fe682869 at
unchanged tuple (−54, −0.0294, −69.8) yaw −0.4311, v6 structural cure,
native 18m 4/4 + night 3/3 PASS, SAT clear on TRUE v6 dims per its own
ledger; improve-41 @ 921a49f interleaved decode-only (zero mutations).
Per the polish-270 epoch law all affected evidence was re-taken fresh:
SAT re-run at epoch B over the v6 bytes (236 bbox non-light, 233
classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 @
sweep-43, TWENTY-SIXTH sweep since routing, NOT new, no escalation due —
law keys severity-1), standing gate re-run ALL PASS real exit 0 at
921a49f. Walk classification: bellpost r88.2 SW, 68m+ from every walked
tier-1 waypoint — epoch-A walks stand by construction (sweep-53
precedent) and the SAT re-run covers the collision surface. Tier-1 4/4
per-leg verified 81/81 ALL_PASS every leg real exit 0: core 64/64 @
0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 47th cycle
per the committed pointer: inn 6/6 @ 0.364 + stable 5/5 @ 0.396 ALL
PASS. Integrity: pins 15/15 ALL_PINS_OK (24th consecutive clean), plus
the extended live pin set re-verified from the census directly: carousel
comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 on the full
16-hex 18b69a6bb2f5862f with bbox PRESENT (R-120 resolved standing) + 4
-l companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill
369c5724, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9 + welcome-l
companion, cistern 156b4fc8, hamlet embers 5-of-5 full payloads
(5-key particles each), 38 lights, 16 comp-bearing entities
census-matched, interlane md5 f6254cd0 stable, ledger law EXACT at
append (survey-31's D+0/E+0 absorbed, base re-read fresh). Snapshot
rewritten twice, both with pre-write assertions and post-rewrite drift
ZERO: epoch A 109824B / sha16 797906192ff40542 (diff exactly [stile
lib+bbox]); final epoch B 109824B / 274 entities / sha16 86bc038404c6af69
(diff exactly [bellpost lib+bbox]). Walk-parser banner artifact
(`[physics]` prefix line) handled per sweep-35 class — verdicts
content-anchored on status + per-leg ok counts. Zero world mutations,
zero defect notes, zero uploads, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-70): hall + forge (48th cycle — LRU by
committed-pointer chain: refreshed @69 inn/stable, @68 bunkhouse/
longhouse, @67 garden-cottage/tower-house, @66 row-cottage/observatory;
hall last walked sweep-64, forge sweep-59 coverage pair — both now
stalest).

sweep-70: CLEAN SWEEP, fully quiet single-epoch tick. Census 274==274
vs the committed sweep-69 epoch-B baseline (sha16 86bc038404c6af69):
0 arrivals, 0 departures, 0 drift on id+pos+yaw+scale+lib+bbox — the
normalized live re-projection is BYTE-IDENTICAL to the committed
snapshot (109824B, no rewrite needed, sweep-37 class). Overlap: exit 3
on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407
(known Sev 2 routed to artwalk b26 @ sweep-43, tuple identical per
zero-drift census, TWENTY-SEVENTH sweep since routing, NOT new, no
escalation due — law keys severity-1); 236 bbox non-light, 233
classified, 0 coverage holes. Tier-1 4/4 per-leg verified 81/81
ALL_PASS every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE
7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 48th cycle per the committed pointer:
hall 8/8 @ 0.36 + forge 6/6 @ 0.375 ALL PASS. Struct circuits re-walked
fresh this tick (dated legacy coverage — struct suite never walked
since ~sweep-46; recorded honestly as a coverage refresh, not a
finding): tower 4/4 + court 4/4 + orchard 6/6 @ 0.365 ALL PASS.
Integrity: pins 15/15 ALL_PINS_OK (25th consecutive clean), plus the
extended live pin set re-verified from the census directly: carousel
comp bag exact 7 + lib ce3633992d07055e, gate lamps 4/4 on the full
16-hex 18b69a6bb2f5862f with bbox PRESENT (R-120 resolved standing) +
4 -l companions live, belltower 2419fbc53a1d65e1 + ladder comp live,
windmill 369c5724, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9 +
welcome-l light live, cistern 156b4fc8, hamlet embers 5-of-5 full
particles payloads (preset embers + origin/count/size/speed), 38
lights, 16 comp-bearing entities census-matched, interlane md5
f6254cd0 stable, ledger law EXACT at append. Zero world mutations,
zero defect notes, zero uploads, zero comp edits, zero shared-budget
use (D+0, E+0). Walk-parser self-catches: `legs` is a scalar count on
the core route schema and absent on interior/struct walk schemas —
per-leg ok tallies re-derived from `results` arrays before any verdict
(two TypeError parse failures refused, not waved through); second
self-catch: welcome/cistern pin ids are `nx-welcome`/`nx-cistern`
(under-dashed guesses missed, re-derived from the census, survey-27
class). Next tier-2 pair (sweep-71): potter + market (49th cycle —
LRU: refreshed @70 hall/forge, @69 inn/stable, @68 bunkhouse/
longhouse, @67 garden-cottage/tower-house, @66 row-cottage/observatory;
potter+market last walked sweep-46, now stalest).

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
| sweep-71 | 2026-09-07 | 274→276 epoch-corrected (epoch A 274==274 fully quiet vs sweep-69/70 baseline sha16 86bc038404c6af69, byte-identical projection; mid-tick THREE siblings committed: improve-42 @ 66ded6b five-garden family cure, dress-92 @ a010c6c glazier arrival, struct-68 @ 3d3b315 meridiandial arrival — epoch B: +2 domain-valid arrivals (nx-dress-ne-glazier-001 (60.95,-0.0284,28.42) yaw -2.35619 lib 53b31cfd; nx-struct-meridiandial (0,-0.0065,-27) yaw 0 lib 7acc090a) + 5 garden lib flips to exactly improve-42's ledgered shas at identical tuples, envelopes strict-subset; 0 departures, 0 unexplained drift; survey-33 @ fedc6d2d analysis-only interleave; snapshot rewritten with pre-write assertions, post-rewrite id-set verified, final 276 ents) | exit 3 on THREE unclassified: known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 28th sweep, no escalation due) + TWO NEW meridiandial contacts (R-123 waterstair -2.008 square-SAT / 17.2mm TRUE 3D — Sev 2, REGISTERED + ROUTED STRUCTURES-PLAN this tick; hall -0.435 square-SAT / 0.952m true corner-kiss, E-W corridor 1.834m PASSES 1.4 law, recorded no-action); 238 bbox non-light / 233 classified / 0 coverage holes, SAT run epoch A + re-run epoch B | tier-1 81/81 ALL_PASS per-leg verified (core 64/64 @ 0.38, NW 5/5, NE 7/7, SW 5/5) + tier-2 49th cycle per committed pointer potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 26th consecutive + extended census-verified at epoch B (carousel exact 7 + ce363399, gate lamps 4/4 bbox-present + 4 -l companions, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched), interlane f6254cd0 stable, ledger law EXACT at append, gate ALL PASS exit 0 at c75a96b tick-start + re-run 3d3b315/fedc6d2d post-interleave | FINDINGS — R-123 new Sev 2 routed struct (first sweep); R-121 open, known, no escalation due |
| sweep-72 | 2026-09-07 | 276==276 (238 thing + 38 light; 0 arrivals, 0 departures, exactly FIVE drift field-sets on one family = 5x nx-wild-cairn-{0022,0043,0047,0048,0050} lib flips a4450b40→19edc830 / 5d6c3edd→c7ea6ded / 109e5bc5→b5ed154a / 09ed84ef→de186a14 / efedd361→594f5192 at identical tuples, bbox y-max 1.73→1.51 contact-law stack shrink + mm-level size echoes = improve-43 @ 59046e7 committed PRE-tick, live landing postdates sweep-71's snapshot (known-epoch class), ledger-matched sha-for-sha; epoch B 20s-paced re-read 0/0/0 settled; single stable epoch; snapshot rewritten format-exact 110567B/276 ents/sha16 af358982e79adce8, pre-write assertion vs COMMITTED diff exactly 5x cairn lib+bbox, post-rewrite drift ZERO) | exit 3 on the THREE known unclassified: R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 29th sweep, no escalation due — law keys Sev 1) + R-123 dial\|waterstair −2.008 square-SAT / 17.2mm TRUE 3D (Sev 2 struct-routed @ sweep-71, 2nd sweep) + dial\|hall −0.435 square-SAT / 0.952m true corner-kiss (companion fact, corridor 1.834m PASSES 1.4 law, recorded no-action in R-123); 238 bbox non-light / 233 classified / 0 coverage holes, NO new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 — FIRST core walk over the dial bytes, sweep-71's walks predated the arrival; NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 50th cycle per committed pointer row-cottage 6/6 @ 0.384 + observatory circuit 5/5 ALL_PASS | pins 15/15 ALL_PINS_OK 27th consecutive (struct18-fleet-pin-check real exit 0) + extended census-verified on the true comp schema (carousel exact 7 + ce363399, gate lamps 4/4 full-lib bbox-present + 4 -l companions, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched), interlane f6254cd0 stable, ledger law EXACT at append, gate ALL PASS exit 0 at ebb16a35 tick-start + re-run db05163c post-interleave | CLEAN SWEEP — R-121 + R-123 open, known, no escalation due |
| sweep-73 | 2026-09-07 | 276→277 epoch-corrected (epoch A 276==276 fully quiet vs committed sweep-72 epoch-C baseline sha16 1f23988720b4cf5a, 0 arrivals 0 departures 0 drift; mid-tick struct-70 @ 1ec03fe0 R-123 CLOSURE meridiandial reseat (0,-0.0065,-27)→(6,-0.0438,-45) same lib 7acc090a content-addressed + dress-94 @ 7f619934 mossbowls arrival — epoch B per polish-270 law: +1 domain-valid arrival nx-dress-se-mossbowls-001 (61.31,0.0083,-55.20) yaw -45° tuple matches dress-94 ledger line-for-line + exactly ONE drift field = meridiandial pos, lib unchanged; 0 departures, 0 unexplained drift; snapshot rewritten 111018B/277 ents/sha16 2a1aed39e14a4d69 with pre-write assertion diff exactly +1 arrival +1 dial pos, post-rewrite drift ZERO) | SAT epoch A 238 bbox/233 classified/0 holes exit 3 on exactly the three known unclassified; SAT epoch B re-run: 239 bbox non-light / 233 classified / exactly ONE unclassified = R-121 ONLY — BOTH dial contacts GONE, R-123 closure INDEPENDENTLY CORROBORATED in the overlap surface, no new contacts from arrival or reseat | tier-1 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5, NE 7/7, SW 5/5; epoch-A walks unaffected by construction — new dial seat min 31.5m, mossbowls min 63.1m from any walked leg point) + tier-2 51st cycle per committed pointer potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 28th consecutive (struct18-fleet-pin-check real exit 0) + extended census-verified (carousel exact 7 + ce363399, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox-present + 36 -l companions, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched), interlane f6254cd0 stable, ledger law EXACT at append (base re-read fresh), standing gate ALL PASS real exit 0 at tick-start 695f705b + re-run ALL PASS exit 0 at 1ec03fe0 post-interleave | CLEAN SWEEP — R-123 CLOSED by owner action corroborated sweep-side; R-121 open, known, 30th sweep, no escalation due |
sweep-71: FINDINGS SWEEP, epoch-correction tick (R-123 born). Epoch A fully
quiet — census 274==274, normalized projection byte-identical to the committed
baseline (no rewrite at epoch A). Mid-tick, three siblings committed AFTER my
census: improve-42 (garden family cure 5/5 re-place), dress-92 (glazier
arrival), struct-68 (meridiandial placement) — per the polish-270 epoch law all
affected evidence was re-taken fresh: epoch-B census (276; 2 arrivals + 5
garden lib flips, every field classified against the committed ledgers), SAT
re-run at epoch B, gate re-run ALL PASS exit 0 at 3d3b315 then fedc6d2d
(survey-33 read-only interleave). The epoch-B SAT flagged TWO NEW unclassified
contacts for nx-struct-meridiandial — source-true decode of the exact live
bytes (sweep71-dial-contacts-decode.ts, kept in-tree for the register; local
sha16 == live lib prefix both) found: (a) waterstair — TRUE 3D min 17.2mm at
same walking height, plan-view footprint INTERLOCK across the meridian corridor
(dial S band inside the waterstair z-span; dial pad edge 1.65m past the stair's
north rim at x=0) = R-123 Sev 2, registered and routed to STRUCTURES-PLAN as a
defect note; struct-68's "zero solid neighbors within 8m" claim falsified at
source (waterstair center 5.00m away, pitfall-0b class); (b) hall — 0.952m
closest pair is a diagonal corner kiss, the true E-W corridor is 1.834m and
PASSES the 1.4 law — recorded in R-123's register entry as a companion fact,
no separate item, re-derive if the dial moves. Tier-1 4/4 per-leg verified
81/81 ALL_PASS real exit 0 each: core 64/64 @ 0.38, NW 5/5, NE 7/7, SW 5/5.
Tier-2 49th cycle per the committed pointer: potter 6/6 @ 0.366 + market 6/6 @
0.389 ALL PASS (epoch A; the two arrivals are r67.7 NE / r27 S — the S dial
sits on the plaza-adjacent meridian between mapboard-waystone legs; walks were
run at epoch A before the dial landed, and the dial walk itself is struct-68's
own 12/12 proof — the corridor defect is geometric, not walk-verified, which is
exactly why it is routed rather than self-certified). Integrity: pins 15/15
ALL_PINS_OK (26th consecutive) + extended live set census-verified at epoch B
(carousel exact 7 + ce363399, gate lamps 4/4 bbox-present + 4 -l companions,
belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome
7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, 38
lights, 16 comp-bearing census-matched), interlane md5 f6254cd0 stable, ledger
law EXACT at append (base re-read fresh: three sibling increments absorbed).
Snapshot rewritten to epoch B with pre-write assertions (arrivals + garden
drift exactly classified) and post-rewrite id-set verification. Zero world
mutations, one defect note (R-123 to STRUCTURES-PLAN), zero uploads, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-72): row-cottage + observatory
(50th cycle — LRU by latest-walk chain: @71 potter/market, @70 hall/forge,
@69 inn/stable, @68 bunkhouse/longhouse, @67 garden-cottage/tower-house;
row-cottage+observatory last walked sweep-66, now stalest).

sweep-72: CLEAN SWEEP, single-stable-epoch classified-drift tick. Census
276==276 (238 thing + 38 light) vs the committed sweep-71 baseline (sha16
fc6321443cb193ca): 0 arrivals, 0 departures, exactly FIVE drift field-sets,
all one family — the five WILD-CAIRN cairns nx-wild-cairn-{0022,0047,0048,
0043,0050} lib-flipped at identical tuples to exactly improve-43's ledgered
cure shas (19edc830 / c7ea6ded / b5ed154a / de186a14 / 594f5192), with bbox
y-max 1.73→1.51 (the contact-law shorter stacks) and mm-level size echoes.
improve-43 committed PRE-tick @ 59046e7; the live landing postdates sweep-71's
snapshot — known-epoch class, ledger-matched sha-for-sha, domain-valid, not
drift. Epoch B (20s-paced re-read): 0/0/0 — single stable epoch, no sibling
landed live this tick (struct-69 / dress-93 committed mid-tick but both
BUILD-ONLY, zero world mutations by their own entries; live unaffected by
construction). Overlap: exit 3 on exactly the THREE known unclassified —
R-121 lamp-n | nx-town-mapboard −0.407 (29th sweep since routing, no
escalation due — law keys Sev 1), R-123 dial | waterstair −2.008 square-SAT
/ 17.2mm TRUE 3D (2nd sweep since routing to struct), and the dial | hall
−0.435 square-SAT companion fact (0.952m true corner-kiss, E-W corridor
1.834m PASSES the 1.4m law — recorded no-action inside R-123's register
entry). 238 bbox non-light / 233 classified / 0 coverage holes — NO new
contacts; the five cairn cures are envelope strict-subsets and introduced
none. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0:
core 64/64 @ 0.38 — the FIRST core walk over the meridiandial bytes
(sweep-71's core walk predated the dial's arrival; the dial sits on the
plaza-adjacent meridian between mapboard-waystone legs, so this is fresh
R-123-relevant evidence: the standing route set threads the dial's plaza
leg without a failing leg), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37.
Tier-2 50th cycle per the committed pointer: row-cottage 6/6 @ 0.384 +
observatory circuit 5/5 ALL_PASS. Integrity: pins 15/15 ALL_PINS_OK (27th
consecutive clean), carousel comp bag exact 7 + lib ce3633992d07055e, gate
lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT (R-120 resolved and
standing) + 4 -l companions, belltower 2419fbc53a1d65e1 + ladder comp live,
windmill 369c5724, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb +
welcome-l companion live, cistern 156b4fc8c7287a9d, hamlet embers 5-of-5
full payloads, 38 lights, 16 comp-bearing census-matched. Probe self-catches
pre-verdict (sweep-51/55 class, both repaired in-tick): (a) the first
integrity battery keyed `comps` and unprefixed libs — false FAILs across
the board; re-anchored on the census's true schema (`comp`/`compKeys`,
`store/`-prefixed lib), then verified full payloads (hamlet embers preset
'embers' count 40 origin present, carousel motion+smoke+sockets complete).
(b) The first snapshot rewrite dropped the committed envelope ({world,
count, entities} wrapper) — caught by the size delta (101922B vs 110567B),
restored from git and rewritten format-exact; the second write's
pre-write assertion compared against my own first rewrite instead of the
committed baseline and failed-closed (empty drift) — re-anchored on
`git show HEAD:` content, asserted the exact 5x cairn lib+bbox diff, final
file 110567B / 276 entities / sha16 af358982e79adce8, git diff exactly 23
insertions / 23 deletions all within the five cairn blocks, post-rewrite
drift vs live ZERO. Interlane md5 f6254cd0 stable. Ledger law EXACT at
append. Standing gate ALL PASS real exit 0 at tick-start ebb16a35, re-run
ALL PASS real exit 0 at db05163c after the two BUILD-ONLY interleaves.
Zero world mutations, zero defect notes, zero uploads, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-73): potter +
market (51st cycle — LRU by latest-walk chain: @72 row-cottage/observatory,
@71 potter/market, @70 hall/forge, @69 inn/stable, @68 bunkhouse/longhouse;
potter+market last walked sweep-71, now stalest).

EPOCH-C CORRECTION (disclosed, correction-of-record class — improve-44
orchard family cure landed at 59b2b575 + d79ab891 AFTER this sweep's ledger
append, sweeping the shared index and carrying my three staged files along
(artwalk-34 interleave class; verified: [sweep-72] entry + prose present
exactly once at HEAD via that commit — never re-appended). Census-C 276==276
with exactly FIVE additional classified drift field-sets = the orchard family
nx-cultivation-orchard-{0012,0020,0033,0046,0059} lib flips to improve-44's
ledgered cure shas (a5da671d/a0ed327d/55fdc827/53a54111/369f5b03 — 0033
matches its artifact commit d79ab891 exactly) at identical tuples, lib+bbox
only, domain-valid not drift. All affected evidence re-taken fresh before
this correction commit: SAT re-run at epoch C (238 bbox non-light / 233
classified / 0 coverage holes, exit 3 on exactly the same three known
unclassified — the orchard cures introduced NO new contacts), snapshot
rewritten to epoch C with pre-write assertion (diff exactly 5x orchard
lib+bbox, nothing else) 110571B / 276 entities / sha16 1f23988720b4cf5a,
post-rewrite drift ZERO. The committed ledger entry (sweep-72, D+0/E+0, law
exact 2370680) is epoch-B-true; this block is the correction of record.
Baseline for sweep-73 = epoch C.

sweep-73: CLEAN SWEEP, epoch-correction + R-123-closure corroboration tick.
Epoch A census fully quiet — 276==276 vs the committed sweep-72 epoch-C baseline
(sha16 1f23988720b4cf5a): 0 arrivals, 0 departures, 0 drift on
id/pos/yaw/lib/scale/kind. Mid-tick, struct-70 (@ 1ec03fe0) committed the R-123
closure — meridiandial reseated (0,-27) -> (6,-45) as an instrument cluster
beside the orrery, same lib 7acc090a content-addressed — and dress-94
(@ 7f619934) landed nx-dress-se-mossbowls-001. Per the polish-270 epoch law all
affected evidence was re-taken fresh: epoch-B census (277 = +1 arrival
tuple-matched to dress-94's ledger + exactly one drift field = the dial pos;
lib unchanged; 0 departures), SAT re-run at epoch B, standing gate re-run ALL
PASS real exit 0 at 1ec03fe0. The epoch-B SAT is the sweep-side corroboration
of the closure: unclassified set collapsed 3 -> 1 — BOTH dial contacts
(waterstair −2.008, hall companion −0.435) are gone from the live collision
surface, only R-121 remains, and no new contact appeared at the new (6,-45)
seat. Walked-leg affectedness classified quantitatively: new dial seat min
31.5m and mossbowls min 63.1m from any tier-1/tier-2 walked leg point —
epoch-A walks unaffected by construction (sweep-53 precedent; the SAT re-run
covers the collision surface). Tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0: core 64/64 @ 0.38, NW 5/5, NE 7/7, SW 5/5. Tier-2 51st
cycle per the committed pointer: potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL
PASS. Integrity: pins 15/15 ALL_PINS_OK (28th consecutive clean,
struct18-fleet-pin-check real exit 0) + extended census-verified (carousel
exact 7 + ce363399, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT +
36 -l companions live, belltower 2419fbc5 + ladder comp, windmill 369c5724,
woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet
embers 5-of-5 full payloads, 38 lights, 16 comp-bearing census-matched).
Interlane md5 f6254cd0 stable. Ledger law EXACT at append (base re-read fresh).
Snapshot rewritten 111018B / 277 entities / sha16 2a1aed39e14a4d69 with
pre-write assertion (committed diff exactly +1 arrival block + dial pos field,
nothing else) and post-rewrite drift vs live ZERO. R-123 register CLOSED with
the closure note above. R-121 open, known, 30th sweep since routing, no
escalation due — law keys Sev 1. Zero world mutations, zero defect notes,
zero uploads, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-74): bunkhouse + longhouse (52nd cycle — LRU by latest-walk chain
derived from plan text: @73 potter/market, @72 row-cottage/observatory,
@71 potter/market, @70 hall/forge, @69 inn/stable; bunkhouse last walked
sweep-62, longhouse sweep-63, now the stalest pair).

R-124 (Sev 2-class observation, NO defect — decode-verified tool boundary,
sweep-74 2026-09-07) LAVENDER FILM-THRESHOLD CROSSING SURFACES SIX
PRE-EXISTING GARDEN-EDGE ADJACENCIES IN SQUARE-SAT. improve-45's furrow cure
(426178de) rebuilt all four lavender beds with real furrow walls, raising
bbox height 0.482 → 0.550 — past the frozen E2 film threshold (≤0.5) in
sweep-sat-next.ts. Six previously film-exempt contacts surfaced:
lav-0027|mile-nw-007 / |mile-nw-008 / |skeps / |stile, lav-0040|hedge /
|stile (square-SAT gaps −0.507 .. −5.795). Source-true decode of the EXACT
live bytes (sweep74-lavender-contacts-decode.ts, kept in-tree; local sha16
== live lib prefix on all six libs): every contact is a POSITIVE separation
— 0.001m (0027|skeps), 0.013m (0040|hedge), 0.015m (0027|stile), 0.024m
(0040|stile), 0.098m (0027|mile-007), 0.165m (0027|mile-008) — no
interpenetration anywhere; the deep square-SAT gaps are dead bbox corners
over a ~20×12m planting-bed envelope (pitfall-0b). Cure footprints were
strict-subsets (x/z shrank), so true clearances IMPROVED under the cure;
the contacts are newly VISIBLE, not new in the world. The adjacencies are
NW cultivation district-edge design (apiary at field edge: skeps +
rainbarrel beside lavender; stile at the field gate). NW route threads
lav-0027's band by design — first post-cure NW walk 5/5 ALL_PASS @ 0.38
(sweep-74). DISPOSITION: six gap-bounded named pairs added to
sweep-sat-next.ts ALLOWED set with the true numbers in comments (sweep-8
standing precedent). No owning-lane note — no defect exists; any pos/lib
drift on these seven ids re-surfaces as census drift at 16-hex precision
and re-derives the class. Standing unclassified set after sweep-74: R-121
only.

| sweep-74 | 2026-09-07 | 277→281 triple-epoch (epoch A +2 arrivals: nx-dress-nw-rainbarrel-001 = dress-96 @ 6e6abed0, nx-struct-catenarygate = struct-72 @ f82edc25, tuple-exact; 6 drift field-sets all ledger-matched: lavender 0006/0027/0040/0053 lib flips to improve-45 cure shas a9076cee/5e04ce4b/23fcec16/e913ef79 bbox h 0.482→0.55 furrow cure, pendulum reseat = city-3 @ 515f2490, soundmirror reseat = struct-71 @ 72ec50ed; epoch B +2 arrivals: nx-struct-moongate = struct-73 @ ef379b35, nx-dress-sw-seats-001 = dress-97 @ 20aafb75, millrace reseat (-76.707,6.711) = city-4 @ 47177c0e; epoch C 281==281 fully quiet; 0 departures, 0 unexplained drift; snapshot rewritten 112653B/281 ents/sha16 811f55bdf6b62d67 pre-write assertion diff exactly 4 arrivals + 7 classified field-sets, post-rewrite drift ZERO) | exit 3 at epoch A on 7 unclassified = R-121 + SIX NEW lavender-class contacts → R-124 decode-verified (all true separations POSITIVE 0.001..0.165m, no interpenetration; strict-subset cure footprints; named-pair exemption added, sweep-8 precedent); final-epoch SAT 243 bbox non-light / 231 classified / unclassified = exactly 1 = R-121 (30th sweep, no escalation due); arrivals+reseats introduced ZERO new contacts | tier-1 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 + NW 5/5 @ 0.38 FIRST walks over lavender cure bytes, NE 7/7 @ 0.38, SW 5/5 @ 0.37 re-walked epoch C — moongate 12.7m from SW END inside re-verify band) + tier-2 52nd cycle per committed pointer bunkhouse 6/6 @ 0.380 + longhouse 6/6 @ 0.346 ALL PASS | pins 15/15 ALL_PINS_OK 29th consecutive (struct18 real exit 0) + extended census-verified (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder, windmill 369c572480b0e786, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5, 38 lights, 16 comp-bearing census-matched), interlane f6254cd0 stable, ledger law EXACT 2370693 at append, standing gate ALL PASS real exit 0 at tick-start abde146f | CLEAN SWEEP — R-124 registered + dispositioned in-lane; R-121 open, known, no escalation due |
| sweep-75 | 2026-09-07 | 281==281 epoch-corrected (epoch A fully quiet vs committed sweep-74 baseline sha16 811f55bdf6b62d67: 0/0/0 on id/pos/yaw/lib/scale/kind/bbox; city-5 @ b740d3ce companion move landed live mid-tick = epoch B: exactly ONE classified drift set — reedpool pos+yaw (-17.08,-38.37 yaw-90 → 9.723,-90.982 yaw 0) + angler pos+yaw (-23.6,-38.37 → 3.203,-90.982 yaw 0, same delta, libs unchanged d3a81b79/6bf06a35 content-addressed), tuples match city-5 ledger line-for-line; epoch C 20s-paced 0/0/0 settled; 0 departures, 0 unexplained drift; snapshot rewritten 112594B/281 ents/sha16 939abcff105b7475, pre-write assertion diff vs COMMITTED exactly the 4-field move, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 31st sweep since routing, no escalation due — law keys Sev 1); SAT epoch A 243 bbox/231 classified + re-run epoch B 243/229/1, 0 coverage holes; the move introduced ZERO new contacts and dropped two old-seat contacts from the classified set (city-5 SAT corroborated sweep-side) | tier-1 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; epoch-A walks stand by construction — new seats min 57.7m from every SW waypoint, sweep-53 precedent) + tier-2 53rd cycle per committed LRU pointer garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.377 ALL PASS | pins 15/15 ALL_PINS_OK 30th consecutive (struct18 real exit 0) + extended census-verified (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, court smoke live, 38 lights, 16 comp-bearing census-matched), interlane f6254cd0 stable, ledger law EXACT 2370694 at append, gate ALL PASS real exit 0 at e274175e tick-start + re-run ca8c1745 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-76 | 2026-09-07 | 281→282 epoch-corrected (epoch A/B 281==281 vs committed sweep-75 baseline sha16 939abcff105b7475: 0 arrivals, 0 departures, exactly ONE drift field-set = nx-struct-skymirror pos (24,−0.054,−35.5)→(−59.89,−0.02887,−66.51) yaw/lib/bbox unchanged = city-6 wave-1 row-5 relocation @ c1e1b270 tick-start HEAD, content-addressed zero-upload move, ledger-matched, domain-valid not drift; dress-99 @ 70238d21 landed mid-tick AFTER the ledger append = epoch C: +1 domain-valid arrival nx-dress-sw-offering-001 @ (−45.002,−0.03119,−84.456) yaw 1.7622 lib b41efb63746c2450 comp {}, tuple matches its committed ledger line-for-line, r94.9 SW 60m+ off every tier-1 waypoint; 0 departures, 0 unexplained drift; snapshot rewritten twice with pre-write assertions, final epoch C 113027B/282 ents/sha16 72efee34c8c8d908, post-rewrite drift ZERO) | SAT run epoch A + re-run epoch C twice: NEW pair offering-001|labyrinth-0038 −0.690 DECODED AND CLASSIFIED same-tick (source-true decode sweep76-offering-contacts-decode.ts hash-gated 2/2 exact live bytes: TRUE wall separation +0.010m positive, no interpenetration; fat 13×14m compound-bbox artifact pitfall-0b; designed flush wall-mount per dress-99 declared rider mount, angler|reedpool sweep-42 class) — named E4 exemption added to sweep-sat-next.ts with source numbers; final 244 bbox non-light / 230 classified / 0 coverage holes, exit 3 on ONLY known R-121 lamp-n|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 32nd sweep since routing, no escalation due — law keys severity-1); ZERO real-space contacts at skymirror new seat or offering seat | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; skymirror old seat r42.7 27.3m+ / new seat r89.6 62m+ / offering r94.9 60m+ off every leg — walks stand by construction) + tier-2 54th cycle inn 6/6 @ 0.364 + stable 5/5 @ 0.396 ALL PASS | pins 15/15 ALL_PINS_OK 31st consecutive, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT + 4 companions, belltower 2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, skymirror 782eb864 at new seat, hamlet embers 5-of-5, court smoke live, 38 lights, 16 comp-bearing census-matched, interlane f6254cd0 stable, ledger law EXACT 2370696 at append (improve-58 absorbed), standing gate ALL PASS real exit 0 at tick-start c1e1b270 + re-run exit 0 at a3da2dc3 | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-77 | 2026-09-07 | 282==282 across epochs A/B vs committed sweep-76 baseline sha16 72efee34c8c8d908: exactly SIX classified drift fields in two ledger-matched domain-valid relocations, 0 arrivals, 0 departures, 0 unexplained drift — (epoch A, pre-tick) nx-struct-beacon pos+yaw + beacon-l pos = city-7 @ 596a6cf5: (40.8,−0.044,−16.48) yaw 0 → (60.911,0.0068,−66.764) yaw −30deg az312.4 r90.4, content-addressed same lib 03d278be; (epoch B, mid-tick) nx-struct-observatory pos+yaw + observatory-l pos = city-8 @ 5e4529fc: (16.48,−0.052,−40.8) yaw −22deg → (−39.811,−0.031,−87.356) yaw +24.47deg az245.5 r96, same lib 07d18163; both tuples match CITY-PLAN register + city ledger line-for-line; improve-63 HOLD interleave absorbed; snapshot rewritten 113131B/282/sha16 bf91cfad0d394131 pre-write assertion diff exactly the 6-field set, post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 33rd sweep since routing, no escalation due — law keys Sev 1); SAT epoch A 244/230/0 + re-run epoch B 244/229/0, ZERO new contacts at either new seat, one old observatory-seat contact dropped from the classified set corroborating city-8 disc-vs-OBB worst 1.947 claim | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — walks stand by construction: obs OLD seat 12.3m clear of nearest walked point (hall circuit), NEW seat 31.0m, beacon new seat 62.4m) + tier-2 55th cycle per committed LRU pointer hall 8/8 @ 0.36 + forge 6/6 @ 0.375 ALL PASS | pins 15/15 ALL_PINS_OK 32nd consecutive (struct18 real exit 0) + extended battery ALL_PASS 15 checks (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be at new seat + beacon-l live, hamlet embers 5-of-5, court smoke live, 38 lights, 16 comp-bearing census-matched), interlane f6254cd0 stable, ledger law EXACT 2370698 at append, gate ALL PASS real exit 0 at ada47a66 tick-start | CLEAN SWEEP — R-121 open known no escalation due; ONE Sev 3 defect note routed to CITY-PLAN (vacated walk tools, see narrative) |

sweep-75: CLEAN SWEEP, epoch-correction tick. Census epoch A 281==281 fully
quiet vs the committed sweep-74 baseline (sha16 811f55bdf6b62d67): 0 arrivals,
0 departures, 0 drift. Mid-tick, city-5 (b740d3ce) executed the CITY-PLAN
wave-1 row-4 COMPANION MOVE — reedpool+angler relocated live to the SE wild
S-edge seam AFTER my epoch-A reads — so per the polish-270 epoch law all
affected evidence was re-taken fresh before verdicts: epoch-B census (281==281,
exactly one classified drift set: reedpool (−17.08,−38.37) yaw −90 →
(9.723,−90.982) yaw 0; angler (−23.6,−38.37) → (3.203,−90.982) yaw 0, same
delta, libs unchanged — tuples match city-5's ledger line-for-line), SAT re-run
at epoch B, standing gate re-run ALL PASS real exit 0 at ca8c1745, and an
epoch-C 20s-paced re-read that came back 0/0/0 — the move settled. The SAT
corroboration: the move introduced ZERO new contacts at the new seats and
DROPPED two old-seat contacts from the classified set (231→229 classified),
independently corroborating city-5's own yaw-aware rect-OBB worst 1.728 claim.
Overlap final: exit 3 on ONLY R-121 lamp-n|nx-town-mapboard −0.407 — known
Sev 2 routed to artwalk b26 choreography @ sweep-43, 31st sweep since routing,
no escalation due (law keys severity-1). Tier-1 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 —
epoch-A walks stand by construction: the new seats sit ≥57.7m from every SW
walked waypoint (sweep-53 precedent), and city-5 delivered its own 10/10
S-axis walk @ 0.39. Tier-2 53rd cycle per the committed LRU pointer:
garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.377 ALL PASS. Integrity:
pins 15/15 ALL_PINS_OK (30th consecutive clean, struct18-fleet-pin-check real
exit 0) + extended census-verified (carousel compKeys exact 7 +
ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT +
companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill
369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb +
welcome-l, cistern 156b4fc8c7287a9d, hamlet embers 5-of-5 full payloads,
court smoke live, 38 lights, 16 comp-bearing census-matched). Interlane md5
f6254cd0 stable. Ledger law EXACT 2370694 at append. Snapshot rewritten
112594B / 281 entities / sha16 939abcff105b7475 with a pre-write assertion
(diff vs COMMITTED exactly the 4-field move) and post-rewrite drift ZERO.
Probes self-caught pre-verdict, all repaired in-tick and disclosed: (a) the
soundmirror hero pin 782eb864 was a stale memory pin — struct-71's reseat
changed it; live == committed baseline f313e59a69bff540 exact, no finding
(sweep-51 guessed-pin class); (b) the comp-bearing probe keyed a wrong schema
field (comps vs compKeys) and read 0 bearers — re-derived 16 census-matched
(sweep-55 class); (c) the FIRST snapshot rewrite carried the census schema's
comp/compKeys fields and dropped the null-bbox keys on lights — caught by the
size (126630B) and diff probes, rewritten like-for-like to the committed
7-field projection (sweep-55c class). Zero world mutations, zero defect notes,
zero uploads, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-76): inn + stable (54th cycle — LRU by latest-walk chain derived
from plan text: @75 garden-cottage/tower-house, @74 bunkhouse/longhouse, @73
potter/market, @72 row-cottage/observatory, @70 hall/forge; inn/stable last
walked sweep-69, now the stalest pair).

sweep-76: CLEAN SWEEP, single-classified-drift tick. Census 281==281 vs the
committed sweep-75 baseline (sha16 939abcff105b7475): 0 arrivals, 0
departures, exactly ONE drift field-set — nx-struct-skymirror pos
(24, −0.054, −35.5) → (−59.89, −0.02887, −66.51) with yaw/lib/bbox
unchanged = city-6 wave-1 row-5 relocation @ HEAD c1e1b270 (the tick's
starting HEAD; committed pre-tick). Same lib 782eb864, content-addressed
zero-upload move, ledger-matched line-for-line — domain-valid, not drift.
Epoch B 20s-paced re-read: 281==281, 0/0/0 — the move settled, no further
sibling landing. Overlap: SAT ran fresh over the new seat — 243 bbox
non-light, 229 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 32nd sweep since routing, not new,
no escalation due (law keys severity-1). ZERO new contacts at the
skymirror's SW seat — independently corroborating city-6's own yaw-aware
OBB worst 3.879 vs bellpost claim. Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7
@ 0.38, SW 5/5 @ 0.37 — the old seat (r42.7) sat 27.3m+ off every walked
waypoint and the new seat (r89.6) sits 62m+ off every leg, so epoch-A
walks stand by construction (sweep-53 precedent); city-6's own
devotional-corridor clearance read covered the new flank. Tier-2 54th
cycle per the committed LRU pointer: inn 6/6 @ 0.364 + stable 5/5 @ 0.396
ALL PASS. Integrity: pins 15/15 ALL_PINS_OK (31st consecutive clean,
struct18-fleet-pin-check real exit 0) + extended census-verified (carousel
compKeys exact 7 + ce3633992d07055e, gate lamps 4/4 full 16-hex
18b69a6bb2f5862f bbox PRESENT + 4 companions, belltower 2419fbc53a1d65e1
+ ladder comp live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7,
welcome 7d1bd0c9545c44fb + welcome-l companion live, cistern
156b4fc8c7287a9d, skymirror 782eb864 verified at the new seat, hamlet
embers 5-of-5 full payloads, court smoke live, 38 lights, 16 comp-bearing
entities census-matched). Interlane md5 f6254cd0 stable. Ledger law EXACT
2370696 at append (improve-58 sibling absorbed mid-tick, base re-read
fresh immediately before writing). Standing gate ALL PASS real exit 0 at
tick-start c1e1b270. Snapshot rewritten like-for-like: 112587B / 281
entities / sha16 b807562226873d60, pre-write assertion (diff exactly
[skymirror pos]), post-rewrite drift vs live ZERO. Probes self-caught
pre-verdict: the walk-output parser keyed `routes` expecting dicts where
the schema carries scalar `legs`/`maxArrival` + a `results` list
(re-anchored on per-result ok-counts, sweep-48 class). Zero world
mutations, zero defect notes, zero uploads, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-77): hall + forge
(55th cycle — LRU by latest-walk chain: @76 inn/stable, @75
garden-cottage/tower-house, @74 bunkhouse/longhouse, @73 potter/market,
@72 row-cottage/observatory; hall/forge last walked sweep-70, now the
stalest pair).

EPOCH-C CORRECTION (disclosed, correction-of-record class — dress-99
offering niche landed at 70238d21 AFTER this sweep's ledger append): the
committed ledger entry is epoch-B-true (281, one classified skymirror
drift); census-C 281→282 with exactly ONE additional domain-valid arrival
nx-dress-sw-offering-001 @ (−45.002, −0.03119, −84.456) yaw 1.7622 lib
b41efb63746c2450, tuple matching dress-99's committed ledger
line-for-line, 0 drift on 281 shared ids. All affected evidence re-taken
fresh before this commit: SAT re-run at epoch C surfaced ONE new
unclassified pair offering-001|labyrinth-0038 −0.690, which was decoded at
source same-tick (sweep76-offering-contacts-decode.ts, hash-gates exact
on both live libs): TRUE plan-view wall separation +0.010m positive, no
interpenetration — the negative gap is the fat 13×14m compound-bbox
artifact (pitfall-0b); the offering stands flush against the maze's east
outer wall exactly as dress-99 declared (designed rider mount, anchor
re-derived vs live host 2d3d2032). Node-transform audit reconciled the
census-vs-decode y-envelope delta to the four interior lab_goal_* stones
(y 0.2..1.04, maze center, ~7m from the offering) — wall geometry is
identity-transform and the decode read it whole. Classified designed
adjacency (angler|reedpool sweep-42 / welcome|monument R-114 class), E4
named exemption added to sweep-sat-next.ts with the source numbers in the
comment; final SAT 244 bbox non-light / 230 classified / 0 holes, exit 3
on only R-121. Walk-band: offering r94.9 SW sits 60m+ off every tier-1
waypoint — walks stand by construction (sweep-53 precedent). Snapshot
rewritten to epoch C: 113027B / 282 entities / sha16 72efee34c8c8d908
(pre-write assertion: diff vs epoch-B rewrite exactly [offering
arrival], sorted order preserved); post-rewrite drift vs live ZERO. The
next sweep's baseline. Standing gate re-run ALL PASS real exit 0 at
a3da2dc3 post-interleave.

sweep-77: CLEAN SWEEP, double-relocation epoch-corrected tick. Census epoch A
282==282 vs the committed sweep-76 epoch-C baseline (sha16 72efee34c8c8d908):
exactly THREE drift fields, all ledger-matched to city-7 @ 596a6cf5
(pre-tick): beacon pos+yaw (40.8,-0.044,-16.48) yaw 0 ->
(60.911,0.0068,-66.764) yaw -30deg az312.4 r90.4, companion beacon-l pos
traveled with host — CITY-PLAN register row + city ledger line-for-line,
content-addressed same lib 03d278be, domain-valid not drift. Epoch B
(20s-paced re-read) caught city-8 @ 5e4529fc mid-tick: observatory
pos+yaw (16.48,-0.052,-40.8) yaw -22deg -> (-39.811,-0.031,-87.356) yaw
+24.47deg az245.5 r96, companion observatory-l pos traveled with host, same
lib 07d18163 — register row matches line-for-line. improve-63 (HOLD, zero
mutation) interleaved and absorbed. Per the polish-270 epoch law all
affected evidence was re-taken fresh before verdicts: SAT re-run at epoch B,
and walked-leg affectedness classified QUANTITATIVELY this tick (both moves
near hall-class territory): observatory OLD seat 12.3m clear of the nearest
walked point (hall circuit waypoints), NEW seat 31.0m, beacon NEW seat 62.4m
— walks stand by construction (sweep-53 precedent). Overlap: SAT epoch A
244 bbox non-light / 230 classified / 0 holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407, known Sev 2 routed to
artwalk b26 choreography @ sweep-43, 33rd sweep since routing, NOT new, no
escalation due (law keys severity-1). Epoch-B SAT 244/229/0: ZERO new
contacts at either new seat, and ONE old observatory-seat contact dropped
from the classified set (230->229) — sweep-side corroboration of city-8's
own disc-vs-OBB worst 1.947 claim. Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64, NW 5/5 @ 0.38, NE 7/7 @ 0.38,
SW 5/5 @ 0.37. Tier-2 55th cycle per the committed LRU pointer: hall 8/8 @
0.36 + forge 6/6 @ 0.375 ALL PASS. Integrity: pins 15/15 ALL_PINS_OK (32nd
consecutive clean, struct18-fleet-pin-check real exit 0) + extended battery
ALL_PASS 15 checks (carousel exact 7 + ce3633992d07055e, gate lamps 4/4
full-lib 18b69a6bb2f5862f bbox PRESENT + 4 -l companions, belltower
2419fbc53a1d65e1 + ladder comp, windmill 369c572480b0e786, woodyard
01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern
156b4fc8c7287a9d, beacon 03d278be verified at the NEW seat + beacon-l live,
hamlet embers 5-of-5 full payloads, court smoke live, 38 lights, 16
comp-bearing census-matched). FINDING (Sev 3, routed): city-7/city-8
relocations left TWO standing walk tools pinned to VACATED seats —
struct2-walk-observatory.ts (old (16.48,-40.8); a standing tier-2 rotation
member of this lane, next due within ~2 cycles) and struct11-walk-beacon.ts
(old (40.8,-16.48)). A run at a vacated seat vacuously passes over empty
ground (false-green class). Defect note appended to CITY-PLAN (owning lane
city; live world correct — tooling only). Probes self-caught pre-verdict,
both repaired in-tick and disclosed: (a) walk-output banner-skip anchored on
the FIRST `{`/`[` char, which matched the `[physics]` banner itself —
re-anchored on line-start `{` (sweep-35 banner class); (b) hamlet-embers
probe keyed `embers` on the comp KEY side where the true schema is plain
`particles` key with preset field `embers` inside the payload (sweep-55
class) — first battery printed 0/5 false-FAIL, schema-inspected, repaired,
5/5 PASS. PLAN-EDIT self-catch repaired before commit (sweep-53
adjacent-token-bleed class): the sweep-77 history-row patch fuzzy-matched
and consumed the sweep-75 narrative's opening line; restored via
unique-anchor patch, region verified whole by grep (narrative headers
intact, EPOCH-C block count 4 unchanged). Interlane md5 f6254cd0 stable.
Ledger law EXACT 2370698 at append. Snapshot rewritten like-for-like with
pre-write assertion (diff exactly the 6-field relocation set): 113131B /
282 entities / sha16 bf91cfad0d394131, post-rewrite drift vs live ZERO.
Standing gate ALL PASS real exit 0 at tick-start ada47a66 (struct-75).
Zero world mutations, zero uploads, zero comp edits (one sanctioned defect
note to CITY-PLAN = file write, not world mutation). Next tier-2 pair
(sweep-78): potter + market (56th cycle — LRU by latest-walk chain:
@77 hall/forge, @76 inn/stable, @75 garden-cottage/tower-house, @74
bunkhouse/longhouse, @73 potter/market... potter/market now the stalest at
sweep-73). NOTE for sweep-78+: observatory circuit tool is UNPINNED pending
the CITY-PLAN defect note disposition — do not run struct2-walk-observatory
until re-pinned to (-39.811,-87.356) yaw 0.42761.
| sweep-78 | 2026-09-07 | 282==282 epoch-corrected (epoch A 282==282 vs committed sweep-77 baseline sha16 bf91cfad0d394131: 0 arrivals, 0 departures, exactly TWO classified drift fields = nx-struct-needlerest pos (41.1,-0.0467,-23.8)->(10.273,0.0029,68.737) + yaw 7.33->2.993 (171.5deg az81.5 r69.5), same lib bb227fd6 content-addressed = sibling city-9 in-flight, CITY-PLAN register row 45 ledger-matched line-for-line, commit pending at this tick (untracked city9-scan/terrain/place tools corroborate; improve-67 independently classified it foreign in-flight); epoch C 20s-paced re-read 0/0/0 — relocation settled; snapshot rewritten 113149B/282 ents/sha16 589ca0e97de14ee4, pre-write assertion diff exactly [needlerest pos+yaw], post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 34th sweep since routing, no escalation due — law keys severity-1); 244 bbox non-light / 229 classified / 0 coverage holes, SAT run epoch A + re-run epoch B over the new-seat bytes — ZERO new contacts (sweep-side corroboration of city-9 rect-SAT worst 2.265 claim) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — walks stand by construction: new seat 34.9m clear of nearest NE waypoint, 32.3m clear of potter; sweep-77 vacated-walk-tool finding does NOT recur, grep finds no walk tool pinned to the old seat) + tier-2 56th cycle per committed LRU pointer potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS (observatory circuit SKIPPED — unpinned, vacated seat per sweep-77 note) | pins 15/15 ALL_PINS_OK 33rd consecutive (struct18 real exit 0) + extended battery ALL_PASS 15 checks (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be at new city-7 seat, hamlet embers 5-of-5, court smoke, 38 lights, 16 comp-bearing census-matched); interlane f6254cd0 stable; ledger law EXACT 2370700 at append; standing gate ALL PASS real exit 0 at tick-start 921d123f + re-run at 31855312 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |


sweep-78: CLEAN SWEEP, epoch-corrected tick (one classified relocation
absorbed). Census epoch A 282==282 vs the committed sweep-77 baseline
(sha16 bf91cfad0d394131): 0 arrivals, 0 departures — then the paced epoch-B
re-read caught sibling city-9 landing mid-tick: nx-struct-needlerest moved
(41.1,-0.0467,-23.8) yaw 7.33 -> (10.273, 0.0029, 68.737) yaw 2.993
(171.5deg, az81.5 r69.5), same lib bb227fd6 content-addressed zero-upload
move, matching the CITY-PLAN register row 45 line-for-line (EXECUTED
city-9, remove+spawn PLACED_VERIFIED + idempotent 0-verb rerun per its own
register text). City-9's commit was still pending at this tick's close
(untracked city9-scan/terrain/place tools corroborate the active window;
improve-67 independently classified the same move as foreign in-flight).
Per the polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: SAT re-run at epoch B (ZERO new contacts at the new seat —
sweep-side corroboration of city-9's own rect-SAT worst 2.265 vs the NE
bench claim), standing gate re-run ALL PASS real exit 0 at the advanced HEAD
31855312. Epoch C 20s-paced re-read 0/0/0 — the relocation settled, final
epoch pinned. Walk affectedness classified QUANTITATIVELY: the new seat sits
34.9m clear of the nearest NE waypoint and 32.3m clear of the potter tier-2
target — walks stand by construction (sweep-53 precedent). The sweep-77
vacated-walk-tool finding does NOT recur for this relocation: grep finds no
walk tool pinned to the old needlerest seat (only city-lane scan/place
tools reference it). Overlap: exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, thirty-fourth sweep since routing, NOT new, no
escalation due (the law keys on severity-1). Tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38,
NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 56th cycle per the committed LRU
pointer: potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS; observatory
circuit correctly SKIPPED (unpinned to the vacated seat per the sweep-77
note — do not run until city re-pins it). Integrity: pins 15/15 ALL_PINS_OK
(33rd consecutive clean, struct18-fleet-pin-check real exit 0) + extended
battery ALL_PASS 15 checks (carousel exact 7 + ce3633992d07055e, gate lamps
4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT + 4 -l companions, belltower
2419fbc53a1d65e1 + ladder comp live, windmill 369c572480b0e786, woodyard
01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l companion live,
cistern 156b4fc8c7287a9d, beacon 03d278be verified at the new city-7 seat,
hamlet embers 5-of-5 full payloads, court smoke live, 38 lights, 16
comp-bearing entities census-matched). Interlane md5 f6254cd0 stable.
Ledger law EXACT 2370700 at append — probe self-catch repaired pre-verdict:
my first law probe summed the whole file with base 2000000 (sweep-36 class);
the canonical law is ledger-append.py's own law() (base 2336002, post-
[audit-balance] slice), re-derived from the tool source and verified EXACT.
Snapshot rewritten like-for-like with pre-write assertion (diff exactly
[needlerest pos+yaw]): 113149B / 282 entities / sha16 589ca0e97de14ee4,
post-rewrite drift vs live ZERO. Standing gate ALL PASS real exit 0 at
tick-start 921d123f, re-run at 31855312 post-interleave. Zero world
mutations, zero uploads, zero comp edits, zero defect notes, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-79): row-cottage +
observatory is BLOCKED while observatory stays unpinned — substitute the
next-stalest legal pair garden-cottage + tower-house (57th cycle — LRU by
latest-walk chain: @78 potter/market, @77 hall/forge, @76 inn/stable, @75
garden-cottage/tower-house... row-cottage last walked sweep-72 and is the
single stalest member; if the city lane re-pins the observatory tool before
sweep-79, honor the original row-cottage + observatory pairing instead).
| sweep-79 | 2026-09-07 | 282==282 epoch-corrected (epoch A fully quiet vs committed sweep-78 baseline sha16 589ca0e97de14ee4: 0/0/0; epoch B caught sibling city-10 in-flight = exactly TWO classified drift fields nx-struct-skene pos (-23.32,0.0447,48.05)->(8.258,-0.0026,78.567) + yaw pi->3.2463 [186deg az84 r79], same lib df7f7c43 content-addressed, CITY-PLAN register row 46 + city-10 ledger line-for-line; epoch C 20s-paced 0/0/0 settled; 0 arrivals 0 departures 0 unexplained; sweep-77-class vacated-tool check NEGATIVE — city-10 re-pinned struct14-walk-skene.ts same commit, city-9 had re-pinned struct2-walk-observatory.ts; snapshot rewritten 113152B/282/sha16 e7aef5dc9b7564d5, pre-write assertion diff exactly [skene pos+yaw], post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 35th sweep, no escalation due); SAT epoch A + re-run epoch C 244 bbox/229 classified/0 holes, ZERO new contacts at the skene NE seat (corroborates city-10 rect-SAT worst 2.606) | tier-1 4/4 per-leg 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 epoch A + re-run epoch C over skene-new-seat bytes, SW 5/5 @ 0.37) + tier-2 57th cycle row-cottage 6/6 @ 0.384 + observatory circuit 5/5 @ 0.389 at NEW SW seat via city-9 re-pin (first tier-2 walk over city-8 relocation bytes, resolves the sweep-78 unpinned-skip) + re-pinned skene circuit 4/4 @ 0.343 (city-10 follow-up corroboration) | pins 15/15 ALL_PINS_OK 34th consecutive (struct18 real exit 0) + extended battery ALL_PASS 15/15 with SCHEMA SELF-CATCH: live /geom now returns comp payloads with NO computed compKeys (sweep-55 class), battery re-derived on true schema, world correct — carousel exact 7 + ce3633992d07055e, gate lamps 4/4 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be, hamlet embers 5-of-5, court smoke, 38 lights, 16 comp-bearing; interlane f6254cd0 stable; ledger law EXACT 2370700 at append; gate ALL PASS real exit 0 at tick-start 544e5388 + re-run b7731ff8 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-79: CLEAN SWEEP, epoch-corrected tick (skene relocation absorbed; two
re-pinned circuits walked). Census epoch A 282==282 fully quiet vs the
committed sweep-78 baseline (sha16 589ca0e97de14ee4): 0/0/0. The paced
epoch-B re-read caught sibling city-10 landing mid-tick: nx-struct-skene
moved (-23.32, 0.0447, 48.05) yaw pi -> (8.258, -0.0026, 78.567) yaw 3.2463
(186deg, az84 r79, NE craft threshold), same lib df7f7c43 content-addressed
zero-upload move — CITY-PLAN register row 46 and the city-10 ledger match
line-for-line. Improve-70/71 interleaved (holds, zero mutation; improve lane
parked per fleet directive). Per the polish-270 epoch law all affected
evidence was re-taken fresh before verdicts: SAT re-run at epoch C (ZERO new
contacts at the new seat — sweep-side corroboration of city-10's rect-SAT
worst 2.606 vs nx-dress-ne-bench-001), NE walk re-run at epoch C 7/7 @ 0.38,
standing gate re-run ALL PASS real exit 0 at b7731ff8. Epoch C 20s-paced
re-read 0/0/0 — settled, final epoch pinned. The sweep-77 vacated-walk-tool
class was checked and does NOT recur: city-10 re-pinned
struct14-walk-skene.ts to the new tuple in its own follow-up commit
(grep-verified) and delivered its own 4-leg circuit proof; city-9 had
already re-pinned struct2-walk-observatory.ts. Overlap: exit 3 on exactly
ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, thirty-fifth sweep since
routing, NOT new, no escalation due (the law keys on severity-1). Tier-1
4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 (epoch A + epoch C re-run — the skene's
new seat sits 10.0m from needlerest in the same NE gallery corridor, so the
NE leg was re-walked over the relocated bytes rather than argued by
construction), SW 5/5 @ 0.37. Tier-2 57th cycle per the committed pointer
with the sweep-78 conditional HONORED: city-9 re-pinned the observatory
tool before this wakeup, so the original pairing ran — row-cottage 6/6 @
0.384 + observatory circuit 5/5 @ 0.389 at the NEW SW seat (first tier-2
walk over the city-8 relocation bytes; resolves the sweep-78 unpinned-skip)
— plus the re-pinned skene circuit 4/4 @ 0.343 as city-10 corroboration.
Integrity: pins 15/15 ALL_PINS_OK (34th consecutive clean,
struct18-fleet-pin-check real exit 0). SCHEMA SELF-CATCH disclosed
pre-verdict (sweep-55 class): the live /geom endpoint now returns raw comp
payloads and NO computed compKeys field — my first battery run keyed the old
field and false-FAILed 4 checks (carousel/belltower-ladder/court-smoke/
16-bearers); schema-inspected the raw census, found comps fully live, re-
derived the battery on the true comp field, ALL_PASS 15/15 (carousel exact
7 + ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox
PRESENT + companions, belltower 2419fbc5 + ladder comp live, windmill
369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern
156b4fc8, beacon 03d278be at the city-7 seat, hamlet embers 5-of-5 full
payloads, court smoke live, 38 lights, 16 comp-bearing census-matched).
Note for sweep-80+: the census SCHEMA drift (comp-only) also means
census-diff drift checks keying comp are now meaningful — this tick's diff
included comp in the epoch B/C field set. ERRATUM disclosed: the committed
ledger prose for sweep-79 transcribes the cistern pin as "163b4fc8" — the
correct 156b4fc8 was what the battery checked and PASSED; transcription
error only, no tool or world state affected. Interlane md5 f6254cd0 stable.
Ledger law EXACT 2370700 at append. Snapshot rewritten like-for-like with
pre-write assertion (diff exactly [skene pos+yaw]): 113152B / 282 entities /
sha16 e7aef5dc9b7564d5, post-rewrite drift vs live ZERO. Standing gate ALL
PASS real exit 0 at tick-start 544e5388 (struct-76), re-run at b7731ff8
post-interleave. Zero world mutations, zero defect notes, zero uploads,
zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-80): bunkhouse + longhouse (58th cycle — LRU by latest-walk chain:
@79 row-cottage/observatory, @78 potter/market, @77 hall/forge, @76
inn/stable, @75 garden-cottage/tower-house; bunkhouse/longhouse last walked
sweep-74, now the stalest pair).
| sweep-80 | 2026-09-07 | 282->284 epoch-corrected across three epochs vs committed sweep-79 baseline sha16 e7aef5dc9b7564d5: epoch A +1 arrival nx-struct-ogeegate (22.71,-0.0025,65.75) yaw -32.68 lib 32039b5a = struct-77 @ 35da3cb6 ledger-matched line-for-line + 2 drift fields nx-struct-angler lib+bbox at identical tuple (6bf06a35->6ee5b4b0 bobber re-aim) = city-11 @ 83128fd5 ledger-matched; epoch B caught dress-102 +1 arrival nx-dress-nw-fieldcross-001 (-17.845,-0.0023,84.294) yaw -2.356 lib 7750e9b7 ledger-matched + city-12 in-flight nx-dress-charcoal pos (34.5,0,34)->(22.724,-0.04164,27.274) same lib 1d9a1c2d content-addressed (register row ledger-matched); epoch C 20s-paced settled 0/0/0; 0 departures 0 unexplained drift; SELF-CATCH: diff's 284 comp-field lines were baseline-projection artifact (committed snapshot carries no comp field; live emits comp:{...}), canonical 6-field diff is the verdict; snapshot rewritten 114028B/284/sha16 b55bd10c9ecdbe5c, pre-write assertion arrivals exactly [ogeegate, fieldcross] + diff exactly [angler lib+bbox, charcoal pos], post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 36th sweep since routing, no escalation due — law keys Sev-1); SAT epoch A 245 bbox/230 classified/0 holes + epoch B re-run 246/230/0 — ZERO new contacts at ogeegate/fieldcross/charcoal seats (corroborates struct-77 lane-002 straddle, dress-102 host-flush -0.002 designed, city-12 rect-SAT worst 2.644) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 epoch A over the ogeegate bytes + epoch B re-run 7/7 @ 0.38 after charcoal moved 8.19m off its bead polyline — inside the re-verify band, re-walked not argued, SW 5/5 @ 0.37; fieldcross 47m from nearest walked point, stands by construction) + tier-2 58th cycle per committed LRU pointer bunkhouse 6/6 @ 0.38 + longhouse 6/6 @ 0.346 epoch A + epoch B re-run 6/6 @ 0.346 (charcoal 13.8m off longhouse, inside band) | pins 15/15 ALL_PINS_OK 35th consecutive (struct18 real exit 0) + battery ALL_PASS 17/17 epoch A + core fields re-verified epoch B (38 lights, 16 comp-bearing, 7 pins incl carousel comps 7 + ce363399, gate lamps 4/4 bbox PRESENT, belltower ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be + beacon-l, hamlet embers 5-of-5, court smoke, ogeegate tuple exact, angler flip exact); interlane f6254cd0 stable; ledger law EXACT 2370704 tool-form (probe self-catch: first regex too loose, sweep-36 class, re-derived from ledger-append.py law()); standing gate ALL PASS real exit 0 at tick-start 35da3cb6; zero mutations/uploads/verbs/comp edits/defect notes (D+0, E+0) | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-80: CLEAN SWEEP, epoch-corrected tick (two sibling arcs absorbed:
struct-77's ogee gate arrival, then a dress-102 + city-12 window). Census
epoch A vs the committed sweep-79 baseline: +1 arrival nx-struct-ogeegate at
the exact struct-77 ledger tuple (22.71,-0.0025,65.75) yaw -32.68, lib
32039b5a, straddling lane-002 beyond bead b14 — plus TWO drift fields on
nx-struct-angler at an identical tuple: lib 6bf06a35->6ee5b4b0 + bbox, the
city-11 bobber re-aim byte-swap, ledger-matched. The paced epoch-B re-read
then caught the dress/city window in flight: nx-dress-nw-fieldcross-001
arrived at the exact dress-102 tuple (-17.845,-0.0023,84.294) yaw -2.356
lib 7750e9b7, and nx-dress-charcoal moved (34.5,0,34) -> (22.724,-0.04164,
27.274) same-lib content-addressed = city-12 wave-3, register-matched.
Epoch C 20s-paced: 0/0/0, settled at 284 — final epoch pinned. Per the
polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: SAT re-run at epoch B, NE approach leg re-walked at epoch B (the
charcoal's new seat sits 8.19m from the lane-002 bead polyline and 13.8m
from the longhouse tier-2 target — both inside the re-verify band, so the
affected walks were RE-RUN, not argued by construction), longhouse re-walked
at epoch B. The fieldcross seat is 47m from the nearest walked NW point —
stands by construction (sweep-53 precedent). Overlap: SAT epoch A 245 bbox
non-light / 230 classified / 0 coverage holes; epoch B 246/230/0 — exit 3 on
exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407, known Sev
2 routed to artwalk b26 choreography @ sweep-43, thirty-sixth sweep since
routing, NOT new, no escalation due (the law keys on severity-1). ZERO new
contacts at any changed seat — sweep-side corroboration of struct-77's
lane-002 straddle, dress-102's host-flush -0.002 designed contact, and
city-12's rect-SAT worst 2.644 vs woodyard. Tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38,
NE 7/7 @ 0.38 (epoch A over the ogeegate bytes + epoch B re-run), SW 5/5 @
0.37. Tier-2 58th cycle per the committed LRU pointer: bunkhouse 6/6 @ 0.38
+ longhouse 6/6 @ 0.346 (epoch A + epoch B re-run). Integrity: pins 15/15
ALL_PINS_OK (35th consecutive clean, struct18-fleet-pin-check real exit 0) +
battery ALL_PASS 17/17 on epoch A with core fields re-verified on epoch B
(38 lights, 16 comp-bearing, carousel exact 7 + ce3633992d07055e, gate lamps
4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower
2419fbc53a1d65e1 + ladder comp live, windmill 369c572480b0e786, woodyard
01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern
156b4fc8c7287a9d, beacon 03d278be + beacon-l, hamlet embers 5-of-5 full
payloads, court smoke live) + this tick's two classification checks (ogeegate
tuple exact, angler flip exact). TWO self-catches repaired pre-verdict and
disclosed: (a) census-diff comp-field artifact — my first diff keyed 'comp'
as a 7th tracked field and printed 284 drift lines, all of them the
projection artifact of comparing live comp:{} payloads against a committed
baseline that omits the field entirely; canonical 6-field diff re-run, true
delta = 1 arrival + 3 fields, all classified; (b) ledger-law probe regex too
loose (matched '(D+n, E+n)' beyond the ledger's own pair format, sweep-36
class) — re-derived from ledger-append.py's law() verbatim, EXACT 2370704.
Interlane md5 f6254cd0 stable. Ledger law EXACT 2370704 at append. Snapshot
rewritten like-for-like with pre-write assertion: 114028B / 284 entities /
sha16 b55bd10c9ecdbe5c, post-rewrite drift vs live ZERO. Standing gate ALL
PASS real exit 0 at tick-start 35da3cb6 (struct-77, foreign domain). Zero
world mutations, zero defect notes, zero uploads, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-81): hall + forge
(59th cycle — LRU by latest-walk chain: @80 bunkhouse/longhouse, @79
row-cottage/observatory, @78 potter/market, @76 inn/stable, @75
garden-cottage/tower-house; hall/forge last walked sweep-77, now the
stalest pair).
| sweep-81 | 2026-09-07 | 284==284 fully steady vs committed sweep-80 baseline sha16 b55bd10c9ecdbe5c: epoch A 0/0/0 (0 arrivals, 0 departures, 0 drift on canonical 6-field diff id+pos+yaw+scale+lib+kind+bbox), epoch B 20s-paced settled 0/0/0 — no sibling landed this window (improve lane parked per fleet directive, struct-77/dress-102/city-12 arcs closed at tick-start HEAD e2462459); no snapshot rewrite needed (world byte-steady vs committed baseline) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 37th sweep since routing, no escalation due — law keys Sev-1); 246 bbox non-light / 230 exempt-classified / 0 coverage holes; ZERO new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 over the ogeegate+charcoal-epoch bytes, SW 5/5 @ 0.37) + tier-2 59th cycle per committed pointer hall 8/8 @ 0.36 + forge 6/6 @ 0.375 ALL PASS | pins 15/15 ALL_PINS_OK 36th consecutive (struct18 real exit 0) + battery 26/26 ALL_PASS after two self-catches repaired pre-verdict (lib store/-prefix normalization; true gate-lamp ids nx-approach-lamp-*, my first battery guessed nx-town-gate-lamp-*) — 38 lights, 16 comp-bearing, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + 4 companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, hamlet embers 5-of-5, court smoke live, ogeegate tuple+lib exact, angler re-aim lib exact; interlane md5 f6254cd0 stable; ledger law EXACT 2370704 at append; standing gate ALL PASS real exit 0 at tick-start e2462459; zero mutations/uploads/verbs/comp edits/defect notes (D+0, E+0) |

sweep-81: CLEAN SWEEP, fully-steady tick. Census epoch A 284==284 vs the
committed sweep-80 baseline (sha16 b55bd10c9ecdbe5c): 0 arrivals, 0
departures, 0 drift on the canonical 6-field diff — and the 20s-paced epoch-B
re-read also settled 0/0/0, so no snapshot rewrite was needed (the world is
byte-steady against the committed baseline). No sibling lane landed in this
window: the improve lane is parked per the fleet directive and the
struct-77/dress-102/city-12 arcs were already closed at tick-start HEAD
e2462459. Overlap: 246 bbox non-light / 230 exempt-classified / 0 coverage
holes — exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
-0.407, known Sev 2 routed to artwalk b26 choreography @ sweep-43,
thirty-seventh sweep since routing, NOT new, no escalation due (the law keys
on severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 (walked over the
ogeegate + relocated-charcoal epoch bytes), SW 5/5 @ 0.37. Tier-2 59th
cycle per the committed pointer: hall 8/8 @ 0.36 + forge 6/6 @ 0.375, both
real exit 0. Integrity: pins 15/15 ALL_PINS_OK (36th consecutive clean,
struct18-fleet-pin-check real exit 0) + battery 26/26 ALL_PASS — TWO battery
self-catches repaired pre-verdict and disclosed (sweep-55 class, world
correct throughout): (a) live lib values carry the store/ prefix and .glb
suffix, my first battery's startswith checks false-FAILed 9 checks —
normalization added; (b) my first battery guessed gate-lamp ids as
nx-town-gate-lamp-* — the true ids are nx-approach-lamp-* (grep-verified in
the census, sweep-51 improve-70 self-catch class: derive pins from the
census, not memory). Interlane md5 f6254cd0 stable. Ledger law EXACT
2370704 at append. Standing gate ALL PASS real exit 0 at tick-start
e2462459. Zero world mutations, zero defect notes, zero uploads, zero comp
edits, zero shared-budget use (D+0, E+0).

LRU ERRATUM (sweep-81, disclosed): the sweep-80 next-pointer named hall+forge
as "the stalest pair" while its own chain listed garden-cottage/tower-house
@75 as older than hall/forge @77 — the walk itself was lawful (4 sweeps
stale, every leg real exit 0), but the ordering claim was internally
inconsistent. Corrected chain (prose-derived, sweep-81): @81 hall/forge, @80
bunkhouse/longhouse + stable (table row, prose @76 — table row @80 wins,
the row was written from the sweep-80 tick itself), @79 row-cottage/
observatory + inn (same class, row wins), @78 potter/market, @76 inn/stable
(prose), @75 garden-cottage/tower-house. Next tier-2 pair (sweep-82):
garden-cottage + tower-house (60th cycle — true stalest by corrected chain).

| sweep-82 | 2026-09-07 | 284==284 epoch-corrected across epochs A/B/C vs committed sweep-81 baseline sha16 b55bd10c9ecdbe5c: epoch A fully quiet 0/0/0; epoch B caught sibling city-13 in-flight = exactly the 7-field potter compression move (register row 50 'compress inward') — nx-town-potter (26,0,40.5) yaw -2.583 -> (23.776,-0.004,7.725) yaw -1.898 [r25 az18], nx-sign-potter-001 + nx-town-potter-l + artwalk rider b3-ruled-porch follow hosts, all same-lib content-addressed, motion:pwheel comp SURVIVED (city lane re-applied, wipe law honored), rider host-local anchor preserved <1mm; epoch C 20s-paced 0/0/0 settled; 0 arrivals, 0 departures, 0 unexplained drift; vacated-tool class POSITIVE: interior-walk-potter.ts still pinned to the old seat (26,40.5), city-13 commit pending — sweep-77 class watch item for the owning lane's same-commit re-pin; snapshot rewritten 114076B/284/sha16 c8d3817982a7a9bb, pre-write assertion diff exactly the 7-field move, post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 38th sweep since routing, no escalation due — law keys Sev-1); SAT epoch A 246 bbox/230 classified/0 holes + epoch B re-run 246/230/0, ZERO new contacts at the new potter seat (sweep-side corroboration of the city-13 compression: potter+sign+companion+rider moved as one family) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 epoch A + epoch B RE-WALKED 64/64 @ 0.38 — new seat 13.8m from nearest core waypoint, inside re-verify band, re-walked not argued; NW 5/5 @ 0.38; NE 7/7 @ 0.38 epoch A + epoch B RE-WALKED 7/7 @ 0.38 — new seat 7.7m from NE waypoint 1, inside band; SW 5/5 @ 0.37; garden-cottage 51m + tower-house 37.5m stand by construction) + tier-2 60th cycle per committed pointer garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 ALL_PINS_OK 37th consecutive (struct18 real exit 0) + battery 17/17 ALL_PASS on epoch-C bytes (38 lights, 16 comp-bearing census-matched, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6b bbox PRESENT + companions, belltower 2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be + beacon-l, hamlet embers 5-of-5, court smoke live, ogeegate tuple+lib exact, angler re-aim lib exact); interlane md5 f6254cd0 stable; ledger law EXACT 2370704 at append; standing gate ALL PASS real exit 0 at tick-start 345f4770 + re-run 4a8258ea post-interleave; zero mutations/uploads/verbs/comp edits/defect notes (D+0, E+0) |
\nsweep-82: CLEAN SWEEP, epoch-correction tick (city-13 potter compression absorbed). Census epoch A 284==284 fully quiet vs the committed sweep-81 baseline (sha16 b55bd10c9ecdbe5c): 0/0/0 on the canonical 6-field diff. The paced epoch-B re-read caught sibling city-13 in flight executing CITY-PLAN register row 50 (potter 'compress inward'): nx-town-potter moved (26,0,40.5) yaw -2.583 -> (23.776,-0.004,7.725) yaw -1.898 [r25 az18] — 32.85m — with nx-sign-potter-001, nx-town-potter-l, and artwalk rider b3-ruled-porch following their host as one family, all same-lib content-addressed, zero uploads. Two cross-lane laws verified clean sweep-side: (a) motion:pwheel (improve-37's comp) SURVIVED the move — the city lane re-applied it, comp-wipe law honored; (b) the rider's host-local anchor is preserved to <1mm (old local (1.5495,0.3525) -> new (1.5501,0.3509)). Epoch C 20s-paced settled 0/0/0. Per the polish-270 epoch law all affected evidence was re-taken fresh before verdicts: distances RE-DERIVED FROM TOOL FILES (sweep-51 no-guessed-pins law): new seat 7.7m from NE waypoint 1 and 13.8m from the nearest core route end — both inside the re-verify band — so core 64/64 and NE 7/7 were RE-WALKED at epoch B (both ALL_PASS @ 0.38, real exit 0), SAT re-run (246/230/0, same single unclassified R-121), battery re-run on epoch-C bytes 17/17 ALL_PASS. Garden-cottage (51m) and tower-house (37.5m) tier-2 walks stand by construction. Vacated-tool class POSITIVE: interior-walk-potter.ts remains pinned to the old seat (26,40.5) with city-13's commit still pending at this tick — sweep-77 class, a watch item expecting the owning lane's same-commit re-pin (city-10 precedent); NOT a finding while the arc is in flight. Overlap: exit 3 on ONLY R-121 lamp-n|nx-town-mapboard -0.407, known Sev 2 routed artwalk b26 @ sweep-43, 38th sweep since routing, no escalation due (law keys severity-1); ZERO new contacts at the new seat — the moved family's SAT surface is clean (sweep-side corroboration of city-13's own preflight). Tier-1 81/81 ALL_PASS every leg real exit 0. Tier-2 60th cycle per the committed corrected-chain pointer: garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.3765. Integrity: pins 15/15 ALL_PINS_OK (37th consecutive, struct18 real exit 0) + battery 17/17. Interlane md5 f6254cd0 stable. Ledger law EXACT 2370704 at append. Snapshot rewritten like-for-like with pre-write assertion: 114076B / 284 entities / sha16 c8d3817982a7a9bb, post-rewrite drift ZERO. Standing gate ALL PASS real exit 0 at tick-start 345f4770, re-run at 4a8258ea post-interleave. Zero world mutations, zero defect notes, zero uploads, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-83): stable + observatory circuit (61st cycle — LRU by corrected chain: @82 garden-cottage/tower-house, @81 hall/forge, @80 bunkhouse/longhouse, @79 row-cottage/observatory-at-old-seat + re-pinned skene, @78 potter-vacated/market; stable last walked sweep-69, observatory at its city-9 SW seat sweep-79 — stable is the stalest standing target, observatory rides along as its circuit partner per the sweep-79 re-pin).\n\n| sweep-83 | 2026-09-07 | 284==284 epoch-corrected across epochs A/B/C vs committed sweep-82 baseline sha16 c8d3817982a7a9bb: epoch A fully quiet 0/0/0 (0 arrivals, 0 departures, 0 drift on canonical 6-field diff); epoch B caught sibling city-14 in-flight = exactly the 7-field kiln compression move (register row 51) — nx-town-kiln (31,0,39) yaw -2.478 -> az49.5 r29.5 (19.159,-0.021,22.432) yaw -2.443, 20.36m, nx-sign-kiln-001 + nx-town-kiln-l + artwalk rider b12-kiln-heat-contours follow hosts, all same-lib 4d8ef8fc content-addressed zero uploads; epoch C 20s-paced settled 0/0/0; 0 arrivals, 0 departures, 0 unexplained drift; vacated-tool class NEGATIVE — city-14 same-tick re-pinned artwalk-walk-b12 + interior-place-kiln + interior-walk-potter (grep-verified in files, city-10 precedent), city-15 closed the sweep-82 potter watch item; snapshot rewritten 114164B/284/sha16 c82675cbe5a45d84, pre-write assertion diff exactly the 7-field move, post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 39th sweep since routing, no escalation due — law keys Sev-1); SAT epoch A 246 bbox/229 classified/0 holes + epoch C re-run 246/230/0, ZERO new contacts at the kiln's new seat (sweep-side corroboration of city-14 rect-SAT worst 2.531 vs nx-tower) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 epoch A + epoch C RE-WALKED 64/64 @ 0.38 — kiln seat 11.9m from nearest core waypoint, inside re-verify band, re-walked not argued; NE 7/7 @ 0.38 epoch A + epoch C RE-WALKED 7/7 @ 0.38 — kiln seat 8.3m from NE waypoint 1, inside band; NW 5/5 @ 0.38, SW 5/5 @ 0.37 — nearest NW waypoint 49.1m / SW 53.5m, stand by construction; distances derived from tool files not memory) + tier-2 61st cycle per committed pointer stable 6/6 @ 0.325 (verdict printed, then killed at 60s on post-verdict disconnect dwell — known WS-hang class, disclosed) + observatory circuit 5/5 @ 0.389 real exit 0 at city-9 SW seat | pins 15/15 ALL_PINS_OK 38th consecutive (struct18 real exit 0) + battery 17/17 ALL_PASS on epoch-C bytes (38 lights, 16 comp-bearing, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be + beacon-l, hamlet embers 5-of-5, court smoke, ogeegate + angler exact); interlane f6254cd0 stable; ledger law EXACT at append; standing gate ALL PASS real exit 0 at tick-start bf3c2785 + re-run 258617b0 | CLEAN SWEEP — R-121 open, known, no escalation due |\n\nsweep-83: CLEAN SWEEP, epoch-correction tick (city-14 kiln compression absorbed; three sibling arcs landed in-window: dress-104 bellows v8 BUILD-ONLY, city-15 hold + sweep-77 closure annotation, struct-79 screw well v3 judge — none touched the live world). Census epoch A 284==284 fully quiet vs the committed sweep-82 baseline (sha16 c8d3817982a7a9bb): 0/0/0 on the canonical 6-field diff. The paced epoch-B re-read caught sibling city-14 in flight executing CITY-PLAN register row 51 (kiln compress inward, on-axis with charcoal completing the production arc woodyard->kiln->charcoal): nx-town-kiln moved (31,0,39) yaw -2.478 -> (19.159,-0.021,22.432) yaw -2.443 — 20.36m — with nx-sign-kiln-001, nx-town-kiln-l, and artwalk rider b12-kiln-heat-contours following their host as one family, all same-lib 4d8ef8fc content-addressed, zero uploads. Per the polish-270 epoch law all affected evidence was re-taken fresh before verdicts: distances RE-DERIVED FROM TOOL FILES (sweep-51 no-guessed-pins law — NW/SW waypoint constants parsed from each tool's pol() definitions, not memory): kiln seat 8.3m from NE waypoint 1 and 11.9m from the nearest core waypoint — both inside the re-verify band — so NE 7/7 and core 64/64 were RE-WALKED at epoch C (both ALL_PASS @ 0.38, real exit 0), SAT re-run at epoch C (246/230/0, same single unclassified R-121), battery re-run on epoch-C bytes 17/17 ALL_PASS. NW (49.1m) and SW (53.5m) stand by construction. Vacated-tool class NEGATIVE: city-14 re-pinned artwalk-walk-b12 (exact live tuple 19.15872/22.43198 grep-verified), interior-place-kiln (polar-law derived seat, verified), and interior-walk-potter (city-13 seat 23.776/7.725 grep-verified) all same-tick — city-10 precedent honored; city-15's annotation additionally closes the sweep-82 potter watch item (interior-walk-potter 6/6 @ 0.366). Overlap: exit 3 on ONLY R-121 lamp-n|nx-town-mapboard -0.407, known Sev 2 routed artwalk b26 @ sweep-43, 39th sweep since routing, no escalation due (law keys severity-1); ZERO new contacts at the kiln's new seat — the moved family's SAT surface is clean (sweep-side corroboration of city-14's own preflight rect-SAT 2.531). Tier-1 81/81 ALL_PASS every leg real exit 0. Tier-2 61st cycle per the committed pointer: stable 6/6 @ 0.325 + observatory circuit 5/5 @ 0.389. Tooling self-catches disclosed: (a) the sweep79 walk parser is keyed to results[]-shape tier-1 tools and mis-parses status-shape tier-2 tools — each tier-2 tool's own ALL_PASS verdict line was read directly instead; (b) improve12-walk-stable.ts hung in post-verdict disconnect() (known circuit dwell class) and was killed at 60s AFTER its verdict printed, EXIT 143 — verdict intact, process residue disclosed; (c) one foreground walk batch hit the terminal 420s ceiling — re-run with per-tool logs + explicit EXIT capture so no timeout could launder a verdict (content-verdict anchoring law). LRU ERRATUM #2 (disclosed, same class as sweep-81): the sweep-82 pointer claimed 'stable last walked sweep-69' but the sweep-76 row+prose BOTH record stable 5/5 @ 0.396 — @76 wins; the walk was lawful under either reading (14 sweeps stale). Corrected chain: @83 stable/observatory, @82 garden-cottage/tower-house, @81 hall/forge, @80 bunkhouse/longhouse, @79 row-cottage/observatory-at-old-seat, @78 potter-vacated/market, @76 inn/stable. Next tier-2 pair (sweep-84): inn + market (62nd cycle — inn last walked sweep-76, now the stalest standing target; market last walked sweep-78).
| sweep-84 | 2026-09-07 | 284->286 across epochs A/B/C vs committed sweep-83 baseline sha16 c82675cbe5a45d84: epoch A +2 arrivals nx-struct-screwwell (-88,0.017,0) yaw pi-rad lib 6fbaede8 = struct-80 @ ab7ccce9 ledger-matched line-for-line + nx-dress-se-streamstones-001 (75.05,-0.0249,-46.9) yaw -0.7854 lib aabbc23d = dress-105 @ 321afa2c ledger-matched, PLUS exactly ONE drift field nx-struct-ogeegate yaw -32.68 -> -0.5703736 rad at identical pos/lib = struct-80b's deg-unit yaw repair ledger-matched; epoch B 20s-paced 0/0/0; epoch C caught struct-81 in-flight = reedpool lib d3a81b79 -> 7d770620 flip at IDENTICAL tuple (9.723,-0.05907,-90.982) yaw 0, bbox unchanged — sibling struct-81 water-cue refinement landing live mid-sweep (untracked struct81-pixel-probe + before/after renders at tick-start corroborate), classified in-flight, ledger entry pending; snapshot rewritten 115017B/286/sha16 62c41268c42ca3f7 at epoch B, post-rewrite drift vs live epoch B ZERO; NOTE epoch C reedpool flip NOT in snapshot (settled post-rewrite) — expected absorption next sweep via census-diff ledger-match (city-13 potter class) | SAT epoch B 248 bbox/230 classified/0 holes exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 40th sweep since routing, no escalation due — law keys Sev-1), re-run at epoch C over reedpool-new-bytes 248/230/0 same single unclassified, ZERO new contacts at screwwell (corroborates struct-80 exact-SAT worst millrace +7.10), streamstones (dress-105 minGap 2.28 vs forest-0057), ogeegate-repaired pose, and reedpool flip seat | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 RE-WALKED FRESH over the ogeegate-repaired bytes — the gate physically re-aimed ~40deg, re-walked not argued, SW 5/5 @ 0.37) + tier-2 62nd cycle per committed pointer inn 6/6 @ 0.36 (verdict printed then killed at 150s on post-verdict disconnect dwell, known WS-hang class, disclosed — improve12-stable sweep-83 precedent) + market 6/6 @ 0.389 real exit 0 + ADDITIONAL screwwell circuit 6/6 @ 0.389 real exit 0 (first sweep-side walk of the struct-80 arrival, closes the cross-lane gap read-only, sweep-62 longhouse precedent) | pins: struct18 pin-check 14/15 at epoch A classified sweep-30 quarantined-in-flight-draft (reedpool live d3a81b79 == city-5 pin, world correct; local 7d770620 = struct-81 draft) then ALL_PINS_OK 15/15 at epoch C (flip landed, live == local); battery ALL_PASS 20/20 on epoch-B bytes (38 lights, 17 comp-bearing census-matched — screwwell is the 17th bearer, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 18b69a6b bbox PRESENT, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be + beacon-l, hamlet embers 5-of-5, court smoke, ogeegate REPAIRED tuple exact, angler exact, screwwell tuple+motion:well_screw exact, streamstones tuple exact); interlane f6254cd0 stable; standing gate ALL PASS real exit 0 at tick-start 321afa2c + re-run 7ce8a436 post-interleave (city-18 zero-mutation hold absorbed); zero mutations/uploads/verbs/comp edits/defect notes (D+0, E+0) | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-84: CLEAN SWEEP, epoch-corrected tick (struct-80 screw well arrival + ogeegate yaw repair + dress-105 streamstones arrival absorbed; struct-81 reedpool flip caught in flight at epoch C). Census epoch A vs the committed sweep-83 baseline (sha16 c82675cbe5a45d84): exactly TWO arrivals — nx-struct-screwwell at the exact struct-80 ledger tuple (-88, 0.017, 0) yaw pi-rad, lib 6fbaede8, and nx-dress-se-streamstones-001 at the exact dress-105 tuple (75.05, -0.0249, -46.9) yaw -0.7854, lib aabbc23d — plus exactly ONE drift field: nx-struct-ogeegate yaw -32.68 -> -0.5703736 at identical pos/lib, the struct-80b degree-unit yaw repair (engine radians law). All three ledger-matched line-for-line. Epoch B 20s-paced settled 0/0/0. Epoch C caught struct-81 in flight: reedpool lib d3a81b79 -> 7d770620 at IDENTICAL tuple, bbox unchanged — the sibling's water-cue refinement (its pixel probe + before/after renders were present in-tree at tick-start), classified in-flight with ledger entry pending. Per the polish-270 epoch law all affected evidence was re-taken fresh before verdicts: SAT re-fetched and re-run at epoch C (248/230/0, same single unclassified R-121, ZERO new contacts at the reedpool seat — bbox-unchanged flip corroborated), struct18 pin-check re-run at epoch C (ALL_PINS_OK 15/15 — the epoch-A 14/15 was the struct-81 local draft, classified then, sweep-30 quarantined-draft class), standing gate re-run ALL PASS real exit 0 at 7ce8a436. Overlap: exit 3 on ONLY R-121 lamp-n|nx-town-mapboard -0.407, known Sev 2 routed artwalk b26 @ sweep-43, 40th sweep since routing, no escalation due (law keys severity-1). ZERO new contacts at the screw well (struct-80's own +7.10 vs millrace corroborated sweep-side), at the streamstones seat (dress-105's minGap 2.28 vs forest-0057 corroborated), and at the ogeegate's repaired facing. Tier-1 81/81 ALL_PASS every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 — RE-WALKED FRESH this sweep because the ogeegate yaw repair physically re-aimed a gate straddling lane-002 by ~40deg; the leg threads the 4.4m opening at its designed facing (struct77-walk-ogeegate.ts always assumed the -32.68deg effective pose, which the live world now matches), SW 5/5 @ 0.37. Tier-2 62nd cycle per the committed pointer: inn 6/6 @ 0.36 + market 6/6 @ 0.389. ADDITIONAL: screwwell circuit 6/6 @ 0.389 real exit 0 — first sweep-side walk of the struct-80 arrival (its own placer carried the walk; this is the independent cross-lane gap-closure read-only, sweep-62 longhouse precedent). Integrity: battery ALL_PASS 20/20 on epoch-B bytes with pins updated for the tick (ogeegate repaired tuple, screwwell tuple + motion:well_screw, streamstones tuple, comp-bearing 16 -> 17). Tooling self-catches disclosed: (a) the interrupted stacked attempt's sweep84-integrity.py carried the STALE ogeegate pin (-32.68) — detected because struct-80's plan named my absorption path, battery rewritten before first run, stale probe never produced a verdict; (b) my battery's first run crashed on a str+list concatenation in the streamstones detail line — fixed, re-run clean; (c) improve7-walk-inn.ts verdict printed then process hung in post-verdict disconnect() (known circuit-dwell class), killed at 150s, verdict intact. Interrupted-predecessor class: the two untracked sweep84-*.py probes from the 14:1x stacked window (pre-census-interruption, artwalk-32 class) were overwritten by this tick's fresh chassis — no orphan verdicts existed. Interlane md5 f6254cd0 stable. Ledger law EXACT 2370708 at tick-start. Snapshot rewritten like-for-like with pre-write assertion (arrivals exactly the two, drift exactly the ogeegate yaw): 115017B / 286 entities / sha16 62c41268c42ca3f7, post-rewrite drift vs live epoch B ZERO. The epoch-C reedpool flip is NOT in the snapshot (settled after the epoch-B rewrite) — expected absorption next sweep via census-diff ledger-match, city-13 potter class. Zero world mutations, zero defect notes, zero uploads, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-85): row-cottage + observatory-at-SW-seat (63rd cycle — LRU by corrected chain: @84 inn/market, @83 stable/observatory, @82 garden-cottage/tower-house, @81 hall/forge, @80 bunkhouse/longhouse; row-cottage last walked sweep-79, now the stalest standing target; observatory at city-9 SW seat last walked sweep-79, rides along as circuit partner).
| sweep-85 | 2026-09-07 | 286==286 (248 thing + 38 light; 0 arrivals, 0 departures, exactly ONE drift field-set = the pre-recorded reedpool epoch absorbed: nx-struct-reedpool lib store/d3a81b79cb6fe58c.glb->store/7d770620bb1b7bdc.glb at identical tuple (9.723,-0.05907,-90.982) yaw 0, bbox byte-identical, = struct-81 @ d8ae1295 committed PRE-tick (the sibling arc sweep-84 caught in-flight at its epoch C, exactly as its register note predicted — city-13 potter absorption class), domain-valid not drift; epoch B 20s-paced re-read 0/0/0, single settled epoch, no sibling mutation landed live this window — city-20/21/22 holds interleaved zero-mutation; snapshot rewritten 115016B/286/sha16 7d67fe32fe2ca3dd, pre-write assertion diff exactly [reedpool lib], post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 41st sweep since routing, no escalation due — law keys Sev-1); 248 bbox non-light / 230 classified / 0 coverage holes, SAT run fresh over the new reedpool bytes — ZERO new contacts at the seat (bbox-unchanged material flip corroborated sweep-side) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 status ALL_PASS, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; reedpool seat r91.4 SE 70m+ off every tier-1 waypoint — walks stand by construction, sweep-53 precedent) + tier-2 63rd cycle per committed pointer row-cottage 6/6 @ 0.3838 + observatory circuit 5/5 @ 0.389 ALL PASS (real exit 0 each; observatory at city-9 SW seat) | pins 15/15 ALL_PINS_OK 39th consecutive (struct18 real exit 0) + extended battery 31/31 ALL_PASS on epoch-B bytes after three self-catches repaired pre-verdict (ogeegate pin compared as 8-hex shorthand vs live 16-hex; streamstones pos rounding at 3dp vs live 4dp; angler check expression malformed — all prefix/exact-verified on re-run, world correct throughout: 38 lights, 17 comp-bearing, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + 4 companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, hamlet embers 5-of-5 full payloads, court smoke live, ogeegate repaired tuple + lib 32039b5a7fb9da30, screwwell tuple + motion:well_screw, streamstones tuple + lib aabbc23d5552b01c exact, reedpool 7d770620bb1b7bdc, angler 6ee5b4b06bc07d5e, potter city-13 seat + pwheel survived, kiln city-14 seat); interlane md5 f6254cd0 stable; ledger law EXACT 2370708 at append; standing gate ALL PASS real exit 0 at tick-start 06c3cc60 + re-run at 83f09e7b post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-86 | 2026-09-07 | 286->287 across epochs A/B/C/D vs committed sweep-85 baseline sha16 7d67fe32fe2ca3dd: epochs A/B fully quiet 0/0/0; epoch C caught sibling struct-82 in-flight = exactly ONE arrival nx-struct-whisperhorn (-64.02,-0.028,-61.82) yaw 0 lib b6e48e4622f10108 comp [] bbox 4.1x2.755x4.1 = struct-82 @ 36fe1ff6 ledger-matched line-for-line (city-26 independently observed the same tuple 286->287), epoch D 20s-paced settled 0/0/0 — single arrival absorbed; 0 departures, 0 drift on canonical 6-field diff; snapshot rewritten 115424B/287/sha16 96d232cbedbe6742, pre-write assertion arrivals exactly [whisperhorn] + zero drift, post-rewrite drift ZERO | SAT epoch A 248 bbox/230 classified/0 holes exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 42nd sweep since routing, no escalation due — law keys Sev-1); epoch C re-run over the 287-set surfaced ONE NEW unclassified whisperhorn\|nx-temple-terrace-0040 gap -1.514 (OBB) — decoded at source read-only and classified NO REAL CONTACT, elevated-deck envelope artifact: terrace-0040 local center offset (0,2.175,5.805) puts its deck y3-4 overhanging its ground footprint toward the horn; nearest terrace vertex to horn axis 2.254m at y4.00 (above horn top 2.755), ZERO verts inside the dais disc r2.05, ZERO plan-overhang triangles covering the axis, MIN 3D distance horn axis segment to terrace surface 2.376m => dais-edge clearance +0.326m conservative, walk-band (y<=2.755) dais-edge gap 2.332m >= 1.4m pinch law; independent re-derivation of disc-vs-skymirror exact +2.361 matches struct-82's committed +2.36 (decode chassis validated); scan-chassis observation recorded Sev 3 in findings register (struct-82's preflight built neighbor AABBs pos-centered WITHOUT the bbox center offset — the H-3 class; world landed clear anyway per decode, tooling-flaw note for the struct lane, no world mutation) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; whisperhorn seat r89 az -134deg 21.7m from SW route END per sw-approach3-walk.ts constants parsed fresh — outside the 15m re-verify band, walks stand by construction; PLUS independent sweep-side horn circuit 6/6 @ 0.397 real exit 0, sweep-62 precedent) + tier-2 64th cycle per committed pointer bunkhouse 6/6 @ 0.333 (verdict printed then killed at 150s on post-verdict disconnect dwell, known WS-hang class, disclosed — improve12-stable sweep-83/84 precedent) + longhouse 6/6 @ 0.346 real exit 0 | pins 15/15 ALL_PINS_OK 40th consecutive (struct18 real exit 0) + battery 20/20 ALL_PASS on epoch-C bytes + extended battery 7/7 ALL_PASS (potter city-13 seat + pwheel survived, kiln city-14 seat, reedpool cured lib 7d770620, ogeegate full-16 lib, angler seat, +38 lights/17 comp-bearing); ONE ext-battery self-catch repaired pre-verdict (3dp-rounded pos pins vs full-precision live — tolerance 1e-3, world correct throughout); interlane md5 f6254cd0 stable; standing gate ALL PASS real exit 0 at tick-start 380109e5 + re-gate post-interleave at final HEAD | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-85: CLEAN SWEEP, single-classified-absorption tick (quiet live world outside the
predicted flip). Census 286==286 vs the committed sweep-84 baseline (sha16
62c41268c42ca3f7): 0 arrivals, 0 departures, exactly ONE drift field-set —
nx-struct-reedpool lib d3a81b79->7d770620 at identical tuple (9.723,-0.05907,-90.982)
yaw 0, bbox byte-identical. This is exactly the epoch sweep-84's register note
recorded as expected: struct-81's reedpool void-read cure (water -> screwwell
emissive idiom, materials-only, envelopes byte-identical), committed PRE-tick at
d8ae1295. Ledger-matched line-for-line, domain-valid, not drift. Epoch B 20s-paced
re-read settled 0/0/0 — single settled epoch; the sibling city-20/21/22 hold
ticks that advanced HEAD mid-window each carried zero mutations (their own
ledger prose corroborates census 286==286). Overlap: 248 bbox non-light / 230
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n
| nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, forty-first sweep since routing, NOT new, no escalation due (law keys
severity-1). ZERO new contacts at the reedpool seat (bbox-unchanged material
flip corroborated sweep-side). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0: core 64/64 @ 0.38 (status ALL_PASS), NW 5/5 @ 0.38, NE 7/7 @
0.38, SW 5/5 @ 0.37 — the reedpool seat r91.4 SE sits 70m+ off every tier-1
waypoint, walks stand by construction (sweep-53 precedent). Tier-2 63rd cycle
per the committed pointer: row-cottage 6/6 @ 0.3838 + observatory circuit 5/5 @
0.389 at the city-9 SW seat, both real exit 0. Integrity: pins 15/15
ALL_PINS_OK (39th consecutive clean, struct18-fleet-pin-check real exit 0) +
extended battery 31/31 ALL_PASS on epoch-B bytes. THREE battery self-catches
repaired pre-verdict and disclosed (sweep-55/81 class, world correct
throughout): (a) ogeegate pin compared as 8-hex shorthand against the live
16-hex lib — prefix-verified exact on re-run; (b) streamstones pos checked at
3dp rounding vs the live 4dp tuple — re-checked at 4dp, exact; (c) the angler
lib check expression itself was malformed (operator-precedence bug printing
False on a correct value) — rewritten, live 6ee5b4b06bc07d5e prefix-exact.
Interlane md5 f6254cd0 stable. Ledger law EXACT 2370708 at append (city-20/21/22
sibling holds absorbed mid-tick, base re-read fresh immediately before writing).
Standing gate ALL PASS real exit 0 at tick-start 06c3cc60 (sweep-84's own
commit), re-run ALL PASS real exit 0 at 83f09e7b post-interleave. Snapshot
rewritten like-for-like with pre-write assertion (diff exactly [reedpool lib]):
115016B / 286 entities / sha16 7d67fe32fe2ca3dd, post-rewrite drift vs live
ZERO. Zero world mutations, zero defect notes, zero uploads, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-86): bunkhouse +
longhouse (64th cycle — LRU by corrected chain: @85 row-cottage/observatory,
@84 inn/market, @83 stable/observatory, @82 garden-cottage/tower-house, @81
hall/forge, @80 bunkhouse/longhouse now the stalest pair).

sweep-86: CLEAN SWEEP, arrival-absorption tick (struct-82 whisper horn absorbed). Census epochs A/B fully quiet vs the committed sweep-85 baseline (sha16 7d67fe32fe2ca3dd): 0/0/0 both. Epoch C caught sibling struct-82 in flight: exactly ONE arrival, nx-struct-whisperhorn at (-64.02,-0.028,-61.82) yaw 0, lib b6e48e4622f10108, comp [], bbox 4.1x2.755x4.1 — ledger-matched line-for-line to struct-82 @ 36fe1ff6 (the Beltrami trumpet, SW contemplative r89 skymirror companion; city-26 independently observed the same tuple). Epoch D settled 0/0/0. Per the polish-270 epoch law all affected evidence was re-taken fresh before verdicts: SAT re-fetched and re-run over the 287-set, batteries re-run on epoch-C bytes, standing gate re-run post-interleave. Overlap: epoch A exit 3 on ONLY the known R-121 lamp-n|nx-town-mapboard -0.407 (42nd sweep since routing, no escalation due). The epoch-C re-run surfaced ONE NEW unclassified — whisperhorn|nx-temple-terrace-0040 OBB gap -1.514 — decoded at source read-only and classified NO REAL CONTACT (elevated-deck envelope artifact): the terrace's census bbox carries local center offset (0,2.175,5.805) at yaw -3pi/4, so its y3-4 deck overhangs its own ground footprint ~4.1m toward the horn's seat. Decode of the terrace GLB (work_1641_terrace.glb, sha e8417696 prefix-verified == live): nearest vertex to the horn axis 2.254m at y4.00 (above the horn's 2.755 top), ZERO vertices inside the dais disc r2.05, ZERO plan-view triangles covering the horn axis, MIN 3D distance from the horn's axis segment to the terrace surface 2.376m — dais-edge clearance +0.326m conservative, walk-band dais-edge gap 2.332m >= the 1.4m pinch law. Independent re-derivation of disc-vs-skymirror exact +2.361 matches struct-82's committed +2.36 (decode chassis validated against a proven value). One scan-chassis observation recorded Sev 3 in the findings register (sweep plan only, no foreign-file edit): struct-82's SAT preflight built neighbor AABBs pos-centered WITHOUT the census bbox center offset — the H-3 origin-centered class; the world landed clear anyway per decode, so this is a tooling-flaw note for the struct lane's future placements, not a world defect. Tier-1 81/81 ALL_PASS every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — whisperhorn seat r89 az -134deg sits 21.7m from the SW route END (constants parsed fresh from sw-approach3-walk.ts), outside the 15m re-verify band, walks stand by construction. PLUS independent sweep-side horn circuit 6/6 @ 0.397 real exit 0 (sweep-62 precedent, cross-lane gap closed read-only). Tier-2 64th cycle per the committed pointer: bunkhouse 6/6 @ 0.333 (post-verdict dwell disclosed) + longhouse 6/6 @ 0.346. Integrity: pins 15/15 ALL_PINS_OK (40th consecutive, struct18 real exit 0) + battery 20/20 + extended 7/7 on epoch-C bytes. ONE self-catch repaired pre-verdict (3dp-rounded pos pins in the extension battery vs full-precision live values — tolerance widened to 1e-3, world correct throughout). Interlane md5 f6254cd0 stable. Snapshot rewritten like-for-like with pre-write assertion (arrivals exactly [whisperhorn], zero drift): 115424B / 287 entities / sha16 96d232cbedbe6742, post-rewrite drift ZERO. Zero world mutations, zero uploads, zero verbs, zero comp edits, zero shared-budget use. Erratum disclosed: none this tick. Next tier-2 pair (sweep-87): hall + forge (65th cycle — corrected LRU chain: @86 bunkhouse/longhouse, @85 row-cottage/observatory, @84 inn/market, @83 stable/observatory, @82 garden-cottage/tower-house, @81 hall/forge now the stalest standing pair at 5 sweeps).


| sweep-87 | 2026-09-07 | 287==287 triple-quiet steady vs committed sweep-86 baseline sha16 96d232cbedbe6742 — epochs A/B/C all 0/0/0 (0 arrivals, 0 departures, 0 drift on id+pos+yaw+scale+lib+kind+bbox); no sibling mutation landed live this window (survey-50 read-only + city-33/34 holds interleaved, zero mutations per their entries); no snapshot rewrite needed, committed baseline exact vs live | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 43rd sweep since routing, no escalation due — law keys Sev-1); 249 bbox non-light / 231 classified / 0 coverage holes; whisperhorn\|nx-temple-terrace-0040 moved to NAMED E4 exemption in sweep-sat-next.ts this tick per the sweep-86 decode-of-record (same bytes, zero census drift on both ids; full source-true numbers in the tool comment; any drift re-surfaces at 16-hex and re-derives) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 max-arr, NW 5/5, NE 7/7, SW 5/5) + tier-2 65th cycle per committed pointer hall 8/8 @ 0.360 + forge 6/6 @ 0.375 ALL PASS | pins 15/15 ALL_PINS_OK 41st consecutive (struct18 real exit 0) + battery 23/23 ALL PASS on freshest epoch bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, angler 6ee5b4b06bc07d5e, hamlet embers 5-of-5, court smoke, 38 lights, 17 comp-bearing); ONE probe self-catch repaired pre-verdict (loose 'belltower' substring filter matched artwalk rider b5-belltower-rings 48aed5da — true nx-town-belltower re-derived exact from census, world correct); interlane f6254cd0 stable; ledger law canonical EXACT 2370709; gate ALL PASS real exit 0 at tick-start ac728ee9 + re-run ec468568 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-88 | 2026-09-07 | 287→288 epoch-corrected (epoch A fully quiet vs committed sweep-87 baseline sha16 96d232cbedbe6742: 287==287, 0 arrivals, 0 departures, 0 drift; epoch B caught sibling dress-107 live: exactly ONE arrival nx-dress-se-foxden-001 (73,-0.0532,-10.5) yaw 4.712389 lib 856deec51857c60a, tuple ledger-matched line-for-line @ a93d4929; epoch C settled 288==288 — same-epoch foxden triple-observation sweep/city/dress; 0 departures, 0 unexplained drift; snapshot rewritten 115902B/288 ents/sha16 1fd915521b41d059 with pre-write assertion diff exactly the 1 arrival, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 44th sweep since routing, no escalation due — law keys Sev-1); epoch-B SAT re-run 250 bbox non-light / 231 classified / 0 coverage holes, ZERO new contacts at the fox den seat (corroborates dress-107's own minSAT +7.79) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; epoch-A walks stand by construction — fox den r73.8 sits 55m+ beyond the SW route end; SAT re-run covers the collision surface) + tier-2 66th cycle per committed pointer inn 6/6 @ 0.364 + stable 5/5 @ 0.396 ALL PASS | pins 15/15 ALL_PINS_OK 42nd consecutive (struct18 real exit 0) + battery 23/23 ALL PASS on freshest epoch-B bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, angler 6ee5b4b06bc07d5e, hamlet embers 5-of-5, court smoke, 38 lights, 17 comp-bearing); interlane f6254cd0 stable; ledger law canonical EXACT 2370711 at append; gate ALL PASS real exit 0 at tick-start 10a0150c + re-run 87545f55 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-89 | 2026-09-07 | 288→289 epoch-corrected (epoch A fully quiet vs committed sweep-88 baseline sha16 1fd915521b41d059: 288==288, 0 arrivals, 0 departures, 0 drift; epoch B caught sibling struct-84 live: exactly ONE arrival nx-struct-reuleauxrotor (-12,-0.0373,-64.5) yaw 0 lib 670e397cb6422ee2, comp bag live = exactly the struct-83 ledger sidecar pair (motion:pwheel_rr 240pt deltoid path face:false + motion:sails spin z 2.5deg/s) — the authored R8-1 rotor whose untracked placer next-place-struct84.ts stood in-tree at tick start; city-39 independently classified the same arrival r65.6 outside its band; epoch C settled 289==289; 0 departures, 0 unexplained drift; snapshot rewritten 116306B/289 ents/sha16 78f5317f2a47cf22 with pre-write assertion diff exactly the 1 arrival, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 45th sweep since routing, no escalation due — law keys Sev-1); epoch-B SAT re-run 251 bbox non-light / 231 classified / 0 coverage holes, ZERO new contacts at the rotor seat | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; epoch-A walks stand by construction — rotor seat r65.6 sits 40.5m beyond the SW route end per sw-approach3-walk.ts constants parsed fresh; SAT re-run covers the collision surface) + tier-2 67th cycle per committed pointer potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS (potter at city-13 seat) | pins 15/15 ALL_PINS_OK 43rd consecutive (struct18 real exit 0) + battery 28/28 ALL PASS on epoch-C bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, angler 6ee5b4b06bc07d5e, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing — rotor the 18th bearer with lib/tuple/comp-exact-2/pwheel-240pts/sails-spin-z-2.5 pins); interlane f6254cd0 stable; ledger law canonical EXACT 2370715 at append; gate ALL PASS real exit 0 at tick-start ade26c74 + re-run 8f1daeb3 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |\n
| sweep-90 | 2026-09-07 | 289==289 fully steady (epoch A 0 arrivals 0 departures 0 drift vs committed sweep-89 baseline sha16 78f5317f2a47cf22; epoch B 20s-paced re-read also 0/0/0 — no sibling mutation landed live between epochs; HEAD advanced d03267d9→a33ca44d mid-tick = city-43/44/45 zero-mutation holds, consistent; no snapshot rewrite needed, sweep-87 byte-equivalent precedent, baseline stays 116306B/289/78f5317f2a47cf22) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 46th sweep since routing, no escalation due — law keys Sev-1); 251 bbox non-light / 231 classified / 0 coverage holes, SAT run on epoch-A bytes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 68th cycle per committed pointer bunkhouse 6/6 @ 0.380 (interior-walk-bunkhouse.ts, known foreign support-seam abstentions normalized set unchanged) + longhouse 6/6 @ 0.346 (interior-walk-longhouse.ts), both real exit 0 | pins 15/15 ALL_PINS_OK 44th consecutive (struct18 real exit 0) + battery 28/28 ALL PASS on epoch-A bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, angler 6ee5b4b06bc07d5e, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing, rotor pins exact); interlane f6254cd0 stable; ledger law canonical EXACT at append; gate ALL PASS real exit 0 at tick-start d03267d9 + re-run a33ca44d post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-91 | 2026-09-07 | 289→290→291 epoch-corrected (epoch A fully quiet 0/0/0 vs committed sweep-89 baseline sha16 78f5317f2a47cf22; epoch B caught dress-108 live = ONE arrival nx-dress-sw-lanternhook-001 @ (-57,-0.0306,-70) yaw 4.927732 (282.34deg exact) lib 639c54800d2e5856, tuple matches in-tree uncommitted placer sw-dress108-lanternhook-place.ts line-for-line, r90.3 SW; epoch C caught struct-85 live = second arrival nx-struct-chainvault @ (52.6,-0.0478,-19.2) yaw -1.2217 lib 8fecf67df7d33970, tuple matches in-tree uncommitted placer next-place-struct85.ts line-for-line, r56.5 SE; both domain-valid uncommitted-placer class (sweep-30 precedent), 0 departures, 0 drift on 289 shared ids; snapshot rewritten 117161B/291 ents/sha16 ba9884a8e1e91683, pre-write assertion exact, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 47th sweep since routing, no escalation due — law keys Sev-1); 251→253 bbox non-light / 231 classified / 0 coverage holes, SAT run epoch A + re-run epoch C over both new seats, ZERO new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — both arrivals >33m off every walked leg, walks stand by construction, sweep-53 precedent) + tier-2 69th cycle per committed pointer hall 8/8 @ 0.360 + forge 6/6 @ 0.375 ALL PASS both real exit 0 | pins 15/15 ALL_PINS_OK 45th consecutive (struct18 real exit 0) + battery 28/28 re-run at epoch C (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing); interlane f6254cd0 stable; ledger law canonical EXACT 2370715 at append (audit-balance line-1795 slice — probe self-catch: first slice keyed on a prose mention of the marker, sweep-36 class, re-derived before verdict); gate ALL PASS real exit 0 at tick-start 09416e77 + re-run 4aed8bdc post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-93 | 2026-09-07 | 291==291 fully steady (epochs A+B byte-identical raw sha16 db46c2d661910cc7, 21s-paced; 0 arrivals, 0 departures, 0 drift on the canonical 7-field diff vs committed sweep-91 baseline ba9884a8e1e91683; mid-tick HEAD advances city-55/58, dress-112/114/115 all zero-mutation holds, census-confirmed quiet; no snapshot rewrite needed, sweep-92 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 49th sweep since routing, no escalation due — law keys Sev-1); 253 bbox non-light / 231 classified / 0 coverage holes, SAT own fresh live fetch | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; SW support-seam abstentions on foreign temple-labyrinth/dress entities = known normalized set, unchanged) + tier-2 71st cycle per committed pointer row-cottage 6/6 @ 0.384 + inn 6/6 @ 0.364 both real exit 0 | pins 15/15 ALL_PINS_OK (47th consecutive, struct18-fleet-pin-check real exit 0) + battery 28/28 on epoch-A bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be + -l, angler 6ee5b4b0, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing); interlane md5 f6254cd0 stable; ledger law 2370723 EXACT (gate canonical check, all runs); standing gate ALL PASS real exit 0 at 2881cfef tick-start + re-run 86d7f27c + re-run 7ab87a97 | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-94 | 2026-09-07 | 291==291 fully steady (epochs A+B+C byte-identical raw sha16 db46c2d661910cc7, A-B 21s-paced, C post-interleave; 0 arrivals, 0 departures, 0 drift on canonical 7-field diff vs committed sweep-91 baseline ba9884a8e1e91683; mid-tick HEAD advances city-59/62 + dress-118 all zero-mutation holds, census-confirmed quiet; no snapshot rewrite needed, sweep-92/93 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 50th sweep since routing, no escalation due — law keys Sev-1); 253 bbox non-light / 231 classified / 0 coverage holes, SAT own fresh live fetch | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; SW support-seam abstentions on foreign temple-labyrinth/skeps/dress entities = known normalized set, unchanged) + tier-2 72nd cycle per committed pointer stable 5/5 @ 0.396 + observatory circuit 5/5 both real exit 0 | pins 15/15 ALL_PINS_OK (48th consecutive, struct18-fleet-pin-check real exit 0) + battery 28/28 on epoch-A bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be + -l, angler 6ee5b4b0, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing); interlane md5 f6254cd0 stable; ledger law 2370723 EXACT (gate canonical check, all runs); standing gate ALL PASS real exit 0 at tick-start 30d5c4c7 + re-run aff92396 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-95 | 2026-09-07 | 291→292 (epoch A 291==291 fully quiet 0/0/0 vs committed sweep-91 baseline ba9884a8e1e91683, raw sha16 db46c2d661910cc7, no rewrite needed; epoch B 21s-paced caught ONE arrival nx-struct-conoidfan @ (25.82,-0.0154,48.56) yaw -1.0821 lib c75f8dfbbe2cf9f6 = struct-87 authored sha c75f8dfb placed live mid-tick by struct-88, placer next-place-struct88.ts in-tree tuple-exact (incl. its own plan-yaw self-catch corrected to -1.0821 recorded in struct-87 ledger), domain-valid work-in-flight sweep-30 precedent; 0 departures, 0 drift on 291 shared ids) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 51st sweep since routing, no escalation due — law keys Sev-1); re-run on fresh post-arrival set 254 bbox non-light / 232 classified / 0 coverage holes, ZERO new contacts at conoidfan seat | tier-1 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 RE-WALKED post-arrival — 5.3m center-to-polyline proximity voided pre-arrival NE evidence, sweep-53 does NOT apply; SW 5/5 @ 0.37; NE+SW stderr support-seam abstentions = known foreign-diagnostics class, minor composition churn vs sweep-94 set: no skeps/woodstack lines, +dress-ne-yard/se-stones/streamstones lines — order-adjacent churn only, disclosed) + tier-2 73rd cycle per committed pointer hall 8/8 @ 0.360 + forge 6/6 @ 0.375 both real exit 0 | pins 15/15 ALL_PINS_OK (49th consecutive, struct18-fleet-pin-check real exit 0) + battery 28/28 on epoch-A bytes; interlane md5 f6254cd0 stable; ledger law 2370724 EXACT (gate canonical, every run incl. post-append print); standing gate ALL PASS real exit 0 at tick-start 36be05c1 + re-run f34f8168 + re-run 1a1d46d1 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-96 | 2026-09-07 | 291→292 known-epoch fold-in (committed baseline stale by exactly the sweep-95 conoidfan arrival; epoch A ONE arrival nx-struct-conoidfan (25.82,-0.0154,48.56) yaw -1.0821 lib c75f8dfbbe2cf9f6 = struct-88 placement, tuple identical to sweep-95 epoch-B, 0 departures, 0 drift on 291 shared ids; epochs B/C 292==292 0/0/0 incl. post dress-125/struct-89 interleave; snapshot rewritten 292 ents/117574B/sha16 7bd3bfd2acbdaa11 pre-write-asserted, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 52nd sweep since routing, no escalation due — law keys Sev 1); 254 bbox non-light / 232 classified / 0 coverage holes, zero new contacts at conoidfan seat | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 banner-stripped parse, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; stderr support-seam abstentions on foreign dress/temple entities = known class, minor composition churn +skeps/lanternhook, no lane-owned target) + tier-2 74th cycle per committed pointer bunkhouse 6/6 @ 0.380 + longhouse 6/6 @ 0.346 ALL PASS | pins 15/15 ALL_PINS_OK 50th consecutive + battery 28/28 ALL PASS on epoch-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370727 at append (sweep-96 D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 01a81eb6 + re-run b241baa8 | CLEAN SWEEP — R-121 open, known, no escalation due; plan-repair disclosed (sweep-94 orphaned closer re-attached) |
|| sweep-97 | 2026-09-07 | 292→293 mid-tick arrival fold-in (epoch A 292==292 fully quiet vs baseline 7bd3bfd2acbdaa11; epoch B exactly ONE arrival nx-struct-lemniscateseat (-60,-0.0237,-7) yaw 1.570796 lib a6ae240606798330 = struct-90 authored+placed @ 4d680cd1, tuple matches its committed ledger line-for-line, corroborated by dress-129/city-75 hold censuses — domain-valid work-in-flight, not drift; epoch C 293==293 settled 0/0/0 vs B; 0 departures, 0 drift on 292 shared ids; snapshot folded in pre-write-asserted 293 ents/117998B/sha16 01afc0e7ebddb3b0, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 53rd sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live twice: epoch A 254 bbox non-light/232 classified/0 coverage holes, epoch C 255/232/0 — ZERO new contacts at the lemniscate seat | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; stderr support-seam abstentions on 10 foreign dress/temple ids = known class, composition churn −lanternhook vs sweep-96, no lane-owned target) + tier-2 75th cycle per committed pointer potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK (51st consecutive) + battery 28/28 ALL PASS, interlane md5 f6254cd0 stable, ledger law EXACT 2370728 at append (sweep-97 D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 8d8d4964 + re-run at 11eab1c2 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-98 | 2026-09-07 | 293==293 fully steady triple-epoch (A/B/C all 0 arrivals 0 departures 0 drift on canonical 7-field diff vs committed sweep-97 baseline 117998B/sha16 01afc0e7ebddb3b0; mid-tick HEAD advances all zero-mutation holds: dress-130, city-76, dress-132, city-78, dress-133 — census-confirmed quiet; no snapshot rewrite needed, sweep-92/93 precedent) | exit 3 on ONLY known R-121 lamp-n|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 54th sweep since routing, no escalation due — law keys Sev 1); 255 bbox non-light / 232 classified / 0 coverage holes, SAT on its own fresh live fetch | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; stderr support-seam abstentions = known foreign-diagnostics class, 8 dress/temple ids, composition unchanged vs sweep-97 set) + tier-2 76th cycle hall 8/8 @ 0.360 + row-cottage 6/6 @ 0.384 ALL PASS | struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (52nd consecutive) + battery 28/28 ALL_PASS on epoch-B bytes (2 probe self-catches re-keyed from actual schema: points = 240-entry deltoid array, sails uses degPerSec), comp-bearing 18 census-matched, interlane md5 f6254cd0 stable, ledger law EXACT 2370728 at append, standing gate ALL PASS real exit 0 at tick-start bf1410f2 + re-run 08da4972 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-99 | 2026-09-07 | 293→294 arrival-fold (epoch A 293==293 fully quiet 0/0/0 vs committed sweep-98 baseline sha16 01afc0e7ebddb3b0; epoch B caught struct-91 landing mid-tick: ONE arrival nx-struct-vesicawindow @ (70,-0.0435,-3) yaw 0 lib f4cedc72ffb79bfa comp {} = struct-91 R9-2 @ f4524181, tuple matches its committed ledger line-for-line, corroborated by dress-135 + city-81 hold censuses, domain-valid not drift; epoch C 294==294 settled 0/0/0; 0 departures, 0 drift on 293 shared ids; snapshot folded in pre-write-asserted 294 ents/118404B/sha16 43cd103177bfd34d, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 55th sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live both epochs: epoch A 255/232/0, epoch B 256/232/0 (vesicawindow in live set), ZERO new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; stderr support-seam abstentions foreign dress ids = known class unchanged) + tier-2 77th cycle per committed pointer garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.377 ALL PASS | struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (53rd consecutive) + battery 28/28 on epoch-B bytes (2 probe schema self-catches re-keyed: points = 240-entry deltoid array, sails uses degPerSec — world correct, sweep-98 class), comp-bearing 18 census-matched, interlane md5 f6254cd0 stable, ledger law EXACT 2370728 base steady pre-append, standing gate ALL PASS real exit 0 at tick-start dbeeb112 + re-run 902d5f82 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-100 | 2026-09-07 | 294==294 fully steady (epoch A 0/0/0 vs in-tree sweep-99 baseline sha16 43cd103177bfd34d — the epoch-A-quiet sweep-99 fold itself committed this tick; epoch B 20s-paced 0/0/0; mid-tick HEAD advances city-87/city-88/dress-140 all zero-mutation holds, census-confirmed; no snapshot rewrite needed — in-tree baseline IS current vs live) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 56th sweep since routing, no escalation due — law keys Sev 1); 256 bbox non-light / 232 classified / 0 coverage holes, SAT on its own fresh live fetch, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 banner-stripped parse, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; stderr support-seam abstentions = known foreign-diagnostics class) + tier-2 78th cycle per committed pointer stable 5/5 @ 0.396 + observatory circuit 5/5 @ 0.389 ALL PASS | struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (54th consecutive) + battery 28/28 ALL PASS on epoch-A bytes, comp-bearing 18 census-matched, interlane md5 f6254cd0 stable, ledger law EXACT 2370729 at append, standing gate ALL PASS real exit 0 at tick-start e768c7e3 | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-87: CLEAN SWEEP, triple-quiet steady tick. Census 287==287 vs the
committed sweep-86 baseline (sha16 96d232cbedbe6742) at epochs A, B, and C —
all three 0/0/0 on the canonical 6-field diff. No sibling mutation landed
live this window: the mid-tick HEAD advances (survey-50 read-only observer,
city-33/city-34 holds) each carried zero world mutations per their own
ledger prose, corroborated by the census. No snapshot rewrite was needed —
the committed baseline is exact against live. Overlap: 249 bbox non-light /
231 classified / 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard -0.407, known Sev 2 routed to artwalk b26
choreography @ sweep-43, forty-third sweep since routing, NOT new, no
escalation due (the law keys on severity-1). Tooling action this tick
(sweep-8 precedent, disclosed): the whisperhorn | nx-temple-terrace-0040
pair — decoded at source in sweep-86 and classified NO REAL CONTACT
(elevated-deck envelope artifact, OBB -1.514 vs true walk-band gap 2.332m
>= the 1.4m pinch law) — moved from the unclassified set to a NAMED E4
exemption in sweep-sat-next.ts with the full source-true numbers in the
comment. Same bytes on both ids this tick (zero census drift), so the
decode-of-record transfers exactly; any future pos/lib drift on either id
re-surfaces as census drift at 16-hex precision and re-derives the class.
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core
64/64 @ 0.38 max-arr, NW 5/5, NE 7/7, SW 5/5. Tier-2 65th cycle per the
committed pointer: hall 8/8 @ 0.360 + forge 6/6 @ 0.375, both real exit 0.
Integrity: pins 15/15 ALL_PINS_OK (41st consecutive clean,
struct18-fleet-pin-check real exit 0) + battery 23/23 ALL_PASS on the
freshest epoch bytes. ONE probe self-catch repaired pre-verdict and
disclosed (world correct throughout): a loose 'belltower' substring filter
matched the artwalk rider nx-artwalk-b5-belltower-rings (lib 48aed5da) and
fabricated an apparent belltower pin break — the true nx-town-belltower
re-derived exact from the census (2419fbc53a1d65e1 + ladder comp live);
derive entity ids exactly, never by substring (sweep-51 guessed-id class).
Ledger prose self-catch repaired before commit (sweep-55 corrupted-insert
class): the first sweep-87 append landed with a mangled battery-enumeration
tail; anchor-asserted wholesale repair (sweep87-ledger-fix.py), law re-EXACT
2370709, entry count 1. Interlane md5 f6254cd0 stable. Standing gate ALL
PASS real exit 0 at tick-start ac728ee9, re-run ALL PASS real exit 0 at
ec468568 after the mid-tick HEAD advances (survey-50, city-34). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-88): inn +
stable (66th cycle — corrected LRU chain: @87 hall/forge, @86
bunkhouse/longhouse, @85 row-cottage/observatory, @84 inn/market (inn),
@83 stable/observatory (stable), @82 garden-cottage/tower-house; inn last
walked sweep-84 and stable sweep-83, together the stalest standing pair).

sweep-88: CLEAN SWEEP, arrival-absorption tick (fox den absorbed). Census
epoch A fully quiet vs the committed sweep-87 baseline (sha16
96d232cbedbe6742): 287==287, 0 arrivals, 0 departures, 0 drift. Epoch B
caught sibling dress-107 landing live: exactly ONE arrival,
nx-dress-se-foxden-001 at (73,-0.0532,-10.5) yaw 4.712389, lib
856deec51857c60a, comp [] — tuple matches the dress-107 ledger @ a93d4929
line-for-line (v17 fox den, lid killed by deletion, bank-into-treeline
siting). Epoch C settled 288==288. This is the same-epoch triple
observation of the foxden arrival: sweep-88 (this lane, census epoch B),
city-37 (its own census absorption note), and dress-107 (owner). Per the
polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: SAT re-fetched and re-run over the 288-set (250 bbox non-light,
231 classified, 0 coverage holes, ZERO new contacts — corroborates
dress-107's own minSAT +7.79 and fat-SAT +1.68 claims sweep-side),
battery re-run 23/23 on epoch-B bytes, standing gate re-run ALL PASS real
exit 0 at 87545f55. Overlap: exit 3 on ONLY the known R-121
lamp-n | nx-town-mapboard -0.407, forty-fourth sweep since routing, not
new, no escalation due (the law keys on severity-1). Tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
max-arr, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — epoch-A walks
stand by construction (fox den seat r73.8 sits 55m+ beyond the SW route
end, outside any re-verify band; the SAT re-run covers the collision
surface). Tier-2 66th cycle per the committed pointer: inn 6/6 @ 0.364 +
stable 5/5 @ 0.396, both real exit 0. Integrity: pins 15/15 ALL_PINS_OK
(42nd consecutive clean, struct18-fleet-pin-check real exit 0) + battery
23/23 ALL PASS on the freshest epoch bytes. Zero probe self-catches this
tick — the two attempted-and-abandoned inline JSON parses (walk-file
"dist" field extraction) failed loudly before producing any verdict and
the regex content-anchored extractor was used instead; no verdict was
ever rendered from a failed parse. Interlane md5 f6254cd0 stable. Ledger
law canonical EXACT 2370711 at append. Standing gate ALL PASS real exit 0
at tick-start 10a0150c, re-run ALL PASS real exit 0 at 87545f55 after the
mid-tick HEAD advances (city-36, dress-107, city-37). Snapshot rewritten
like-for-like with pre-write assertion (arrivals exactly the foxden, zero
drift): 115902B / 288 entities / sha16 1fd915521b41d059, post-rewrite
drift ZERO. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-89): potter + market (67th cycle — corrected LRU chain: @88
inn/stable, @87 hall/forge, @86 bunkhouse/longhouse, @85
row-cottage/observatory, @84 inn/market, @83 stable/observatory; potter
and market both last walked sweep-84, now the stalest standing pair).

sweep-89: CLEAN SWEEP, arrival-absorption tick (Reuleaux rotor absorbed).
Census epoch A fully quiet vs the committed sweep-88 baseline (sha16
1fd915521b41d059): 288==288, 0 arrivals, 0 departures, 0 drift. Epoch B
caught sibling struct-84 landing live: exactly ONE arrival,
nx-struct-reuleauxrotor at (-12,-0.0373,-64.5) yaw 0, lib
670e397cb6422ee2 — the R8-1 constant-width kinetic rotor authored under
struct-83 (its untracked placer next-place-struct84.ts stood in-tree at
tick start; commit pending this window). The live comp bag carries
exactly the struct-83 ledger sidecar pair: motion:pwheel_rr (type path,
240 deltoid points, face false, speed 0.022935) + motion:sails (spin, z,
2.5 deg/s) — the engine-native phase-locked mechanism, verified live in
the census payload. city-39 independently classified the same arrival
(r65.6, outside its r33-55 band, lawful). Epoch C settled 289==289. Per
the polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: SAT re-fetched and re-run over the 289-set (251 bbox
non-light, 231 classified, 0 coverage holes, ZERO new contacts at the
rotor seat), battery re-run 28/28 on the epoch bytes, standing gate
re-run ALL PASS real exit 0 at 8f1daeb3. Overlap: exit 3 on ONLY the
known R-121 lamp-n | nx-town-mapboard -0.407, forty-fifth sweep since
routing, not new, no escalation due (the law keys on severity-1).
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0:
core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 —
epoch-A walks stand by construction (rotor seat r65.6 sits 40.5m beyond
the SW route end, constants parsed fresh from sw-approach3-walk.ts; the
SAT re-run covers the collision surface). Tier-2 67th cycle per the
committed pointer: potter 6/6 @ 0.366 (at the city-13 compressed seat
via the re-pinned interior-walk-potter.ts) + market 6/6 @ 0.389, both
real exit 0. Integrity: pins 15/15 ALL_PINS_OK (43rd consecutive clean,
struct18-fleet-pin-check real exit 0) + battery 28/28 ALL_PASS on the
freshest epoch bytes — the battery grew 23→28 with five rotor-specific
pins (lib exact, tuple exact, comp-exact-2, pwheel 240pts face:false,
sails spin z 2.5) and the comp-bearing count moved 17→18, the rotor
being the 18th bearer. One probe self-catch repaired pre-verdict,
disclosed (world correct throughout): sweep89-diff.py first ran from
the repo root and failed on the reviews/-relative baseline path — loud
FileNotFoundError before any verdict, re-run from agents/arthur/. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Ledger law canonical EXACT
2370715 at append (city-39/40/41 sibling holds absorbed mid-tick, base
re-read fresh immediately before writing). Standing gate ALL PASS real
exit 0 at tick-start ade26c74, re-run ALL PASS real exit 0 at 8f1daeb3.
Snapshot rewritten like-for-like with pre-write assertion (arrivals
exactly the rotor, zero drift): 116306B / 289 entities / sha16
78f5317f2a47cf22, post-rewrite drift ZERO. Next tier-2 pair (sweep-90):
bunkhouse + longhouse (68th cycle — corrected LRU chain: @89
potter/market, @88 inn/stable, @87 hall/forge, @86 bunkhouse/longhouse
now the stalest standing pair, @85 row-cottage/observatory, @84
inn/market, @83 stable/observatory, @82 garden-cottage/tower-house).

sweep-90: CLEAN SWEEP, fully steady tick. Census epoch A fully quiet
vs the committed sweep-89 baseline (sha16 78f5317f2a47cf22): 289==289,
0 arrivals, 0 departures, 0 drift on the canonical 7-field diff. Epoch
B (20s-paced re-read) also 0/0/0 — no sibling mutation landed live
between my epochs; the three mid-tick HEAD advances (city-43, city-44,
city-45) were all zero-mutation holds, consistent with the quiet
census. No snapshot rewrite needed (byte-equivalent epochs, sweep-87
precedent). Overlap: SAT on epoch-A bytes, 251 bbox non-light, 231
classified, 0 coverage holes, exit 3 on ONLY the known R-121 lamp-n |
nx-town-mapboard -0.407 — forty-sixth sweep since routing, not new, no
escalation due (the law keys on severity-1). Tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38, NW
5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 68th cycle per the
committed pointer: bunkhouse 6/6 @ 0.380 (interior-walk-bunkhouse.ts —
the two stderr support-seam abstentions on foreign dress entities are
the known normalized set, unchanged) + longhouse 6/6 @ 0.346
(interior-walk-longhouse.ts), both real exit 0. Integrity: pins 15/15
ALL_PINS_OK (44th consecutive clean, struct18-fleet-pin-check real
exit 0) + battery 28/28 ALL PASS on epoch-A bytes. Interlane md5
f6254cd0 stable. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0,
E+0). Standing gate ALL PASS real exit 0 at tick-start d03267d9,
re-run ALL PASS real exit 0 at a33ca44d after the city-43/44/45
interleave. Foreign-lane dirt (dress-108 decode/render hooks, modified
village_next_core_paths.glb + review json, terrain probes, fleet
helpers) left untouched per interlane law. Next tier-2 pair
(sweep-91): hall + forge (69th cycle — corrected LRU chain: @90
bunkhouse/longhouse, @89 potter/market, @88 inn/stable, @87
hall/forge now the stalest standing pair at 4 sweeps, @86
row-cottage/observatory, @85 bunkhouse/longhouse — erratum: @86 was
mis-stated as bunkhouse/longhouse in the sweep-90 pointer; the
sweep-85 pointer row says bunkhouse/longhouse and sweep-86's own row
says row-cottage/observatory @85; the chain used here re-derives from
the sweep-86 narrative's committed chain and the per-sweep tier-2
subjects named in each row: @89 potter/market, @88 inn/stable, @87
hall/forge, @86 bunkhouse/longhouse, @85 row-cottage/observatory, @84
inn/market, @83 stable/observatory, @82 garden-cottage/tower-house —
hall/forge last walked sweep-87, row-cottage/observatory sweep-85,
making hall/forge the stalest pair; the sweep-90 pointer's '@86
bunkhouse/longhouse' was a copy-forward slip from the sweep-89
pointer, corrected here with the full chain).

sweep-91: CLEAN SWEEP, epoch-corrected tick (two sibling arrivals
absorbed). Census epoch A fully quiet vs the committed sweep-89
baseline (sha16 78f5317f2a47cf22): 289==289, 0 arrivals, 0
departures, 0 drift on the canonical 7-field diff. Epoch B caught
dress-108 landing live: exactly ONE arrival, nx-dress-sw-lanternhook-001
at (-57, -0.030565, -70) yaw 4.927732 (282.34deg exact per its placer),
lib 639c54800d2e5856 — the tuple matches the in-tree uncommitted placer
sw-dress108-lanternhook-place.ts line-for-line (v5 per-post course
profiles, commit pending), r90.3 SW on the devotional corridor's W
flank. Epoch C caught struct-85 landing live: second arrival
nx-struct-chainvault at (52.6, -0.0478, -19.2) yaw -1.2217, lib
8fecf67df7d33970 — the tuple matches the in-tree uncommitted placer
next-place-struct85.ts line-for-line (full-256 sha pinned), r56.5 SE.
Both domain-valid uncommitted-placer class (sweep-30 precedent); 0
departures, 0 drift on the 289 shared ids at every epoch. Snapshot
rewritten with pre-write assertion and post-rewrite drift ZERO:
117161B / 291 entities / sha16 ba9884a8e1e91683. Overlap: SAT run at
epoch A (251 bbox non-light) and re-run at epoch C over both new seats
(253 bbox non-light), 231 classified, 0 coverage holes both runs, exit
3 on ONLY the known R-121 lamp-n | nx-town-mapboard -0.407 —
forty-seventh sweep since routing, not new, no escalation due (the law
keys on severity-1); ZERO new contacts at either new seat. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — both arrivals sit
>33m off every walked leg, so walks stand by construction (sweep-53
precedent); the SAT re-run covers the collision surface. Tier-2 69th
cycle per the committed pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + forge 6/6 @ 0.375 (interior-walk-forge.ts),
both real exit 0. Integrity: pins 15/15 ALL_PINS_OK (45th consecutive
clean, struct18-fleet-pin-check real exit 0) + battery 28/28 ALL PASS
re-run at epoch C. Interlane md5 f6254cd0 stable. Ledger law canonical
EXACT 2370715 at append (audit-balance line-1795 slice — probe
self-catch: the first probe sliced from a PROSE MENTION of the marker
in sweep-79's row rather than the canonical line-1795 entry, sweep-36
class, re-derived before any verdict). Standing gate ALL PASS real
exit 0 at tick-start 09416e77, re-run ALL PASS real exit 0 at 4aed8bdc
after the city-46..49 zero-mutation holds interleaved. Foreign-lane
dirt (dress-108 lanternhook placer + decode/render/scan hooks, struct-85
placer + terrain probe, modified village_next_core_paths.glb + review
json, fleet helpers) left untouched per interlane law. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-92):
garden-cottage + tower-house (70th cycle — corrected LRU chain: @91
hall/forge, @90 bunkhouse/longhouse, @89 potter/market, @88 inn/stable,
@87 hall/forge, @86 row-cottage/observatory, @85 bunkhouse/longhouse —
garden-cottage + tower-house last walked sweep-82, now the stalest
standing pair; both walk tools verified present).

sweep-92: CLEAN SWEEP, fully steady tick. Census epoch A 291==291 fully
quiet vs the committed sweep-91 baseline sha16 ba9884a8e1e91683 (0
arrivals, 0 departures, 0 drift on the canonical 7-field diff); paced
epoch-B re-read 20s later byte-identical (raw sha16 07bf89a9b741e53b at
both epochs) — both prior arrivals sweep-91-absorbed and since committed
(dress-109 @ 9800d2fe, struct-85 @ 1ba2d258), no snapshot rewrite needed
(sweep-87 precedent). Overlap: SAT on its own fresh live fetch — 253 bbox
non-light / 231 classified / 0 coverage holes, exit 3 on ONLY the known
R-121 lamp-n|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43,
48th sweep since routing, not new, no escalation due — the law keys on
severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38 maxArrival, NW 5/5 ALL_PASS, NE 7/7 ALL_PASS,
SW 5/5 ALL_PASS (stderr support-seam abstentions on foreign dress/temple
entities = the known normalized set, unchanged). Tier-2 70th cycle per
the committed pointer: garden-cottage 6/6 @ 0.355 + tower-house 6/6 @
0.377, both real exit 0. Integrity: pins 15/15 ALL_PINS_OK (46th
consecutive, struct18 real exit 0) + battery 28/28 ALL PASS on epoch-A
bytes. Interlane md5 f6254cd0 stable. Ledger law verified fresh this
tick by the standing gate's canonical check ("PASS ledger law EXACT |
2370723 == 2370723", real exit 0 at 1ba2d258); my ad-hoc slice probe
undercounted (1586 lines vs the canonical population — narrower filter,
sweep-36 class) and was discarded before any verdict, disclosed here.
Standing gate ALL PASS real exit 0 at tick-start 1ba2d258, re-run before
commit. Foreign-lane dirt (SURVEY-PLAN.md, modified
village_next_core_paths.glb + review json, terrain probes, fleet
helpers) left untouched per interlane law. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-93): row-cottage
+ inn (71st cycle — LRU chain: @70 garden-cottage/tower-house, @91
hall/forge, @90 bunkhouse/longhouse, @89 potter/market, @88 inn/stable,
@86 row-cottage/observatory — row-cottage stalest at 4 sweeps; both
walk tools verified present).


CORRECTION OF RECORD (sweep-91, index-race disclosure, artwalk-34
adjacent class): commit 428a6e8e (sweep-91) swept FIVE foreign
dress-lane files that a sibling had staged in the shared index mid-tick
— agents/arthur/DRESSING-PLAN.md, dress108-decode-hookrow.ts,
dress108-render-hookrow.ts, dress108-terrain-hookrow.ts,
sw-dress108-lanternhook-place.ts — because my `git add` (explicit-name,
lawful) was followed by a CHAINED commit that never gated on the
staged-partition listing; `git diff --cached` printed the 10-file union
in the same compound command one step before `git commit` consumed it.
No data lost, no history rewritten: the sibling's dress-109 ledger
entry rode my commit's IMPROVEMENTS.md snapshot (verified exactly-once
at HEAD, artwalk-34 interleaving law) and its own commit 9800d2fe
landed on top carrying only mkv3-dress-sw-lanternhook1.ts. Ledger law
closes EXACT at final HEAD 9800d2fe: canonical running-total line
2370721 == audit-balance slice sum (sibling D+6 absorbed post-append —
my pre-append probe constant 2370715 was frozen at append time, not a
ledger defect); standing gate re-run ALL PASS real exit 0 at 9800d2fe.
Zero sweep-lane world mutations throughout (domain law intact — the
defect was commit hygiene, not world action). LAW going forward
(chain-gating amendment, this lane's own discipline): when staging and
committing in one terminal call, the commit must be gated on the
partition — `git diff --cached --name-only` must be read and checked
against the intended explicit-name list BEFORE `git commit` runs, or
the two steps must be separate terminal calls with the listing
inspected between them (the 3-call-split shape this lane already uses
for hold ticks).

sweep-93: CLEAN SWEEP, fully steady tick. Census epoch A 291==291 fully
quiet vs the committed sweep-91 baseline (sha16 ba9884a8e1e91683): 0
arrivals, 0 departures, 0 drift on the canonical 7-field diff; paced
epoch-B re-read 21s later byte-identical (raw sha16 db46c2d661910cc7 at
both epochs) — the mid-tick HEAD advances observed (city-55/city-58,
dress-112/114/115) were all zero-mutation holds, consistent with the
quiet census; no snapshot rewrite needed (sweep-87/92 precedent).
Overlap: SAT on its own fresh live fetch — 253 bbox non-light / 231
classified / 0 coverage holes, exit 3 on ONLY the known R-121
lamp-n|nx-town-mapboard -0.407 — forty-ninth sweep since routing, not
new, no escalation due (the law keys on severity-1). Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38 maxArrival (ALL_PASS verdict string anchored), NW 5/5 @ 0.38, NE
7/7 @ 0.38, SW 5/5 @ 0.37 (stderr support-seam abstentions on foreign
temple-labyrinth/skeps entities = the known normalized set, unchanged).
Tier-2 71st cycle per the committed pointer: row-cottage 6/6 @ 0.384 +
inn 6/6 @ 0.364, both real exit 0. Integrity: pins 15/15 ALL_PINS_OK
(47th consecutive clean, struct18-fleet-pin-check real exit 0) +
battery 28/28 ALL PASS on epoch-A bytes. Interlane md5 f6254cd0
stable. Ledger law verified fresh by the standing gate's canonical
check at every run ("PASS ledger law EXACT | 2370723 == 2370723"); my
own append printed law exact 2370723 -> 2370723. Probe self-catches
repaired pre-verdict, disclosed: (a) first core-walk grep keyed `"ok":0`
numeric against `"ok": true` (re-parsed via banner-stripped json, the
sweep-35 [physics]-banner parse class); (b) approach-walk parser keyed
`dist` where that schema uses `distance` (re-anchored on the printed
status/maxArrival, sweep-54 class); (c) ledger-append.py first ran from
agents/arthur/ and failed loudly on its repo-relative IMPROVEMENTS.md
path — re-run from repo root, no partial state (sweep-89 class); (d)
this plan-edit's first anchor guessed a uniform `^| sweep-92 ` table-row
prefix but the sweep-92 row carries doubled leading pipes (markdown
artifact) — re-anchored on the verified sweep-91 row prefix read fresh
from the file (pitfall 6 law). Standing gate ALL PASS real exit 0 at
tick-start 2881cfef, re-run ALL PASS real exit 0 at 86d7f27c, re-run
ALL PASS real exit 0 at 7ab87a97 after the city/dress zero-mutation
holds interleaved. Foreign-lane dirt (dress-108 scan hooks, modified
village_next_core_paths.glb + review json, terrain probes, fleet
helpers) left untouched per interlane law. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-94): stable +
observatory circuit (72nd cycle — LRU chain: @93 row-cottage/inn, @92
garden-cottage/tower-house, @91 hall/forge, @90 bunkhouse/longhouse,
@89 potter/market, @88 inn/stable — stable last walked sweep-88,
observatory circuit sweep-85, making stable the stalest subject; both
walk tools verified present: interior-walk-stable.ts,
struct2-walk-observatory.ts).

sweep-94: CLEAN SWEEP, fully steady tick. Census epoch A 291==291 fully
quiet vs the committed sweep-91 baseline (sha16 ba9884a8e1e91683): 0
arrivals, 0 departures, 0 drift on the canonical 7-field diff; paced
epoch-B re-read 21s later byte-identical (raw sha16 db46c2d661910cc7 at
both epochs); a third epoch-C read after the mid-tick HEAD advance
(city-62 @ aff92396, after city-59 @ 30d5c4c7 and dress-118 @ 0890c5a3 —
all zero-mutation holds) still byte-identical — no snapshot rewrite
needed (sweep-92/93 precedent). Overlap: SAT on its own fresh live fetch
— 253 bbox non-light / 231 classified / 0 coverage holes, exit 3 on ONLY
the known R-121 lamp-n|nx-town-mapboard -0.407 — fiftieth sweep since
routing, not new, no escalation due (the law keys on severity-1).
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core
64/64 @ 0.38 maxArrival (ALL_PASS verdict string anchored, legs parsed
from banner-stripped JSON), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37
(stderr support-seam abstentions on foreign temple-labyrinth/skeps/
woodstack/streamstones entities = the known normalized set, unchanged).
Tier-2 72nd cycle per the committed pointer: stable 5/5 @ 0.396 +
observatory circuit 5/5, both real exit 0. Integrity: pins 15/15
ALL_PINS_OK (48th consecutive clean, struct18-fleet-pin-check real exit
0) + battery 28/28 ALL PASS on epoch-A bytes. Interlane md5 f6254cd0
stable. Ledger law verified fresh by the standing gate's canonical check
at every run ("PASS ledger law EXACT | 2370723 == 2370723"); my own
append printed law exact 2370723 -> 2370723. Probe self-catches
repaired pre-verdict, disclosed: (a) first core-walk read piped through
`tail` and captured tail's exit (polish-270 content-verdict laundering
class) — re-run with real exit capture and JSON parse; (b) first JSON
probe iterated `legs` which is an int count in that schema (results is
the array) — re-keyed on results[].ok (sweep-93 class (a) sibling).
Standing gate ALL PASS real exit 0 at tick-start 30d5c4c7, re-run ALL
PASS real exit 0 at aff92396 after the city/dress zero-mutation holds
interleaved. Foreign-lane dirt (STRUCTURES-PLAN.md, modified
village_next_core_paths.glb + review json, terrain probes, fleet
helpers) left untouched per interlane law. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-95): hall +
forge (73rd cycle — LRU chain: @94 stable/observatory, @93
row-cottage/inn, @92 garden-cottage/tower-house, @91 hall/forge, @90
bunkhouse/longhouse, @89 potter/market — hall and forge last walked
sweep-91, now the stalest standing pair; both walk tools verified
present: interior-walk-hall.ts, interior-walk-forge.ts).

sweep-95: CLEAN SWEEP with one classified sibling arrival. Census epoch
A 291==291 fully quiet vs the committed sweep-91 baseline (raw sha16
db46c2d661910cc7): 0 arrivals, 0 departures, 0 drift on the canonical
7-field diff — no snapshot rewrite needed (arrival was not epoch-A;
sweep-91 precedent for partial-epoch rewrites does not bind). Paced
epoch B (21s later) caught ONE arrival: nx-struct-conoidfan @
(25.82,-0.0154,48.56) yaw -1.0821 lib c75f8dfbbe2cf9f6 — exactly the
sha struct-87 authored BUILD-ONLY at 36be05c1 with placement owed next
tick; the sibling struct lane placed it mid-tick (struct-88, placer
next-place-struct88.ts in-tree, tuple-exact line-for-line including its
own documented plan-yaw self-catch to -1.0821; dress-121 and city-66
holds independently observed the same arrival). Domain-valid
work-in-flight, sweep-30 precedent; 0 departures, 0 drift. Overlap: SAT
re-run on its own fresh post-arrival fetch — 254 bbox non-light / 232
classified / 0 coverage holes, exit 3 on ONLY the known R-121
lamp-n|nx-town-mapboard -0.407 (fifty-first sweep since routing, no
escalation due — law keys Sev-1); ZERO new contacts at the conoidfan
seat. Walk evidence discipline: the new seat sits 5.3m
center-to-polyline from the NE approach2 route (19.0m nearest arrival)
— under the >33m stand-by-construction bar, so the pre-arrival NE walk
was VOIDED and the route re-walked against live bytes including
conoidfan: 7/7 ALL_PASS @ 0.38. Tier-1 4/4 per-leg verified 81/81
ALL_PASS real exit 0 each: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7
@ 0.38 (re-walked), SW 5/5 @ 0.37. NE+SW stderr support-seam
abstentions = the known foreign-diagnostics class with minor
composition churn vs the sweep-94 normalized set (no skeps/woodstack
lines; +dress-ne-yard/se-stones/streamstones lines) — order-adjacent
churn only, no lane-owned target implicated, disclosed here rather than
silently absorbed. Tier-2 73rd cycle per the committed pointer: hall
8/8 @ 0.360 + forge 6/6 @ 0.375, both real exit 0. Integrity: pins
15/15 ALL_PINS_OK (49th consecutive clean, struct18-fleet-pin-check
real exit 0) + battery 28/28 ALL PASS on epoch-A bytes. Interlane md5
f6254cd0 stable. Ledger law verified fresh by the standing gate's
canonical check at every run ("PASS ledger law EXACT | 2370724 ==
2370724"); my own append printed law exact 2370724 -> 2370724. Probe
self-catches repaired pre-verdict, disclosed: (a) first census
invocation passed a spurious mode arg ("geom") that the tool took as
world name -> HTTP 404 with zero bytes — own argv error, corrected
invocation next try (sweep-89 class sibling); (b) first approach-walk
distance probe crashed comparing dicts / assuming an `end` key the
approach tools do not emit (they emit x/z per leg) — re-keyed from the
actual schema; (c) the same probe's hardcoded NW leg count (6) mis-
totaled tier-1 as 82 — per-tool legs are authoritative (81); (d) the
plan-edit assert on '## Findings register' fired on a PROSE mention of
that header at line 187 (adjacent-token-bleed, sweep-43/50 class) —
re-anchored on the newline-prefixed true header. Standing gate ALL
PASS real exit 0 at tick-start 36be05c1, re-run ALL PASS real exit 0
at f34f8168 (struct-88 placement commit) and 1a1d46d1 (dress-121 hold)
after interleaves. Foreign-lane dirt (modified
village_next_core_paths.glb + review json, terrain probes, fleet
helpers, uncommitted struct placers) left untouched per interlane law.
Zero world mutations, zero defect notes, zero uploads, zero verbs,
zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-96): bunkhouse + longhouse (74th cycle — LRU chain: @95
hall/forge, @94 stable/observatory, @93 row-cottage/inn, @92
garden-cottage/tower-house, @90 bunkhouse/longhouse — bunkhouse and
longhouse last walked sweep-90, now the stalest standing pair; both
walk tools verified present: interior-walk-bunkhouse.ts,
interior-walk-longhouse.ts).

sweep-96: CLEAN SWEEP, known-epoch fold-in tick. The committed baseline
was stale by exactly the pre-recorded sweep-95 epoch (conoidfan arrival,
dress-121/city-66 independently observed), so this tick folded it in:
census epoch A 291→292 with exactly ONE arrival nx-struct-conoidfan
(25.82, −0.0154, 48.56) yaw −1.0821 lib c75f8dfbbe2cf9f6 —
tuple identical to sweep-95's epoch-B record line-for-line (struct-87
authored, struct-88 placed @ f34f8168); 0 departures, 0 drift on all 291
shared ids across the canonical 7-field diff. Paced epoch B (21s) and
epoch C (after the dress-125/struct-89 mid-tick interleaves, both
zero-mutation ticks by their own ledgers) both 292==292 0/0/0. Snapshot
rewritten like-for-like (7-field projection, census order, indent=1):
292 entities / 117574B / sha16 7bd3bfd2acbdaa11, pre-write assertion
(arrivals exactly [conoidfan], 0 departures, 0 drift, count
291→292), post-rewrite drift vs live ZERO. Overlap: SAT on its own
fresh live fetch — 254 bbox non-light / 232 classified / 0 coverage
holes, exit 3 on ONLY the known R-121 lamp-n|nx-town-mapboard −0.407
(Sev 2 routed artwalk @ sweep-43, fifty-second sweep since routing, not
new, no escalation due — the law keys on severity-1); ZERO new
contacts at the conoidfan seat. Walk evidence: conoidfan sits 5.3m from
the NE approach2 polyline and sweep-95's own re-walk stands against
live bytes at identical tuple (0 drift this tick) — route unaffected
by construction. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0: core 64/64 @ 0.38 (banner-stripped JSON parse, [physics]
prefix self-caught, sweep-93/94 class), NW 5/5 @ 0.38, NE 7/7 @ 0.38,
SW 5/5 @ 0.37; stderr support-seam abstentions = known foreign
diagnostics class with minor composition churn vs the sweep-95
normalized set (+skeps, +lanternhook — both dress-domain; no
lane-owned target implicated, disclosed per the normalized-set law).
Tier-2 74th cycle per the committed pointer: bunkhouse 6/6 @ 0.380 +
longhouse 6/6 @ 0.346, both real exit 0. Integrity: pins 15/15
ALL_PINS_OK (50th consecutive clean) + battery 28/28 ALL PASS on
epoch-A bytes; interlane md5 f6254cd0 stable; ledger law EXACT 2370727
at append (sweep-96 D+0/E+0). PLAN REPAIR (disclosed): sweep-94's prose
block had been truncated mid-sentence with its closer tail orphaned
after sweep-95's block (adjacent-anchor slide at sweep-95's insertion,
lift-77 class) — re-attached by asserted unique anchors; sweep-94
and sweep-95 blocks verified whole after repair. Probe self-catches
repaired pre-verdict, disclosed: (a) first core-walk parse keyed raw
JSON without stripping the [physics] banner; (b) two census id probes
used guessed entity names (seats/streamstones ids) — the canonical
diff is authoritative; (c) one inline command composite hit the parser
blocklist — executed via its saved script per the sanctioned retry
law, no re-inline; (d) the first draft of this edit script asserted a
non-unique anchor and a later draft introduced row typos (25.92 / long
xhouse) — both caught by fresh re-reads and corrected before any
write landed. Standing gate ALL PASS real exit 0 at tick-start
01a81eb6 (city-68 hold), re-run ALL PASS real exit 0 at b241baa8
(dress-125 hold) after interleaves. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use (D+0, E+0). Next tier-2 pair (sweep-97): potter + market (75th
cycle — LRU chain: @96 bunkhouse/longhouse, @95 hall/forge, @94
stable/observatory, @93 row-cottage/inn, @92 garden-cottage/
tower-house, @90 bunkhouse/longhouse, @89 potter/market — potter
and market last walked sweep-89, now the stalest standing pair; both
walk tools verified present: interior-walk-potter.ts,
interior-walk-market.ts).

sweep-97: CLEAN SWEEP, mid-tick arrival fold-in tick. Census epoch A 292==292
fully quiet vs the committed sweep-96 baseline (sha16 7bd3bfd2acbdaa11): 0
arrivals, 0 departures, 0 drift on the canonical 7-field diff. Paced epoch B
caught struct-90 landing live: exactly ONE arrival nx-struct-lemniscateseat
(-60, -0.0237, -7) yaw 1.570796 lib a6ae240606798330 — the struct-90 R9-1
LEMNISCATE SEAT authored+placed @ 4d680cd1; tuple matches its committed
ledger entry line-for-line and was independently corroborated by dress-129
and city-75 hold censuses before this tick closed. Domain-valid
work-in-flight, not drift. Paced epoch C: 293==293 settled, 0/0/0 vs B, 0
departures, 0 drift on 292 shared ids. Snapshot folded in like-for-like
(7-field projection, census order, indent=1, pre-write assertion arrivals
exactly [lemniscateseat], 0 departures, 0 drift, count 292→293): 293
entities / 117998B / sha16 01afc0e7ebddb3b0, post-rewrite drift vs live
ZERO. Overlap: SAT on its own fresh live fetch twice — epoch A 254 bbox
non-light / 232 classified / 0 coverage holes; epoch C over the
lemniscate-inclusive 293-set 255/232/0 — exit 3 both times on ONLY the
known R-121 lamp-n|nx-town-mapboard −0.407 (Sev 2 routed artwalk @
sweep-43, fifty-third sweep since routing, not new, no escalation due —
the law keys on severity-1); ZERO new contacts at the lemniscate seat.
Walk evidence: the seat sits at the W-spoke mid-gap, 2.83m off the walk
line per its own placement ledger, and this tick's fresh SAT over the
live 293-set covers the collision surface; tier-1 legs stand on their own
fresh walks. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37
(chained run timed out mid-NE — tool-layer timeout class, sweep-18 — legs
re-run individually, all exit 0). Stderr support-seam abstentions = known
foreign-diagnostics class: 10 normalized ids (dress/temple domain), minor
composition churn vs the sweep-96 set (−lanternhook; +logpile, +goats,
+labyrinth-0025/0038), no lane-owned target implicated, disclosed per the
normalized-set law. Tier-2 75th cycle per the committed pointer: potter
6/6 @ 0.366 + market 6/6 @ 0.389, both real exit 0. Integrity: pins 15/15
ALL_PINS_OK (51st consecutive clean, struct18-fleet-pin-check real exit 0)
+ battery 28/28 ALL PASS on epoch-A bytes (probe self-catch: first ran the
superseded sweep88 battery — 23 checks with the stale comp-bearing-17 pin
vs live 18; corrected to the sweep89 28-check battery before any verdict).
Interlane md5 f6254cd0 stable. Ledger law EXACT 2370728 at append
(sweep-97 D+0/E+0). Standing gate ALL PASS real exit 0 at tick-start
8d8d4964, re-run ALL PASS real exit 0 at 11eab1c2 after the
struct-90/dress-129/city-74/city-75 interleaves (all named). Probe
self-catches repaired pre-verdict, disclosed: (a) chained tier-1 walk run
hit the tool timeout mid-NE (legs re-run individually); (b) census-C
invocation used a relative path from inside agents/arthur — bun exit 1
empty file, re-invoked from repo root; (c) stale battery script run before
the correct one. Zero world mutations, zero defect notes written, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-98): hall + row-cottage (76th cycle — LRU chain:
@97 potter/market, @96 bunkhouse/longhouse, @95 hall/forge, @94
stable/observatory, @93 row-cottage/inn, @92 garden-cottage/tower-house —
hall last walked sweep-95, row-cottage sweep-93; hall + row-cottage the
stalest standing pair; both walk tools verified present:
interior-walk-hall.ts, interior-walk-row-cottage.ts).

sweep-98: CLEAN SWEEP, fully steady triple-epoch tick. Census 293==293 vs
the committed sweep-97 baseline (sha16 01afc0e7ebddb3b0): 0 arrivals, 0
departures, 0 drift on the canonical 7-field diff across three paced
epochs (A, B +20s, C post-interleave) — the mid-tick HEAD advances
(dress-130, city-76, dress-132, city-78, dress-133) were all zero-mutation
holds by their own ledger entries, consistent with the quiet census; no
snapshot rewrite needed (sweep-92/93 byte-equivalent precedent, baseline
stays 117998B / 293 entities / sha16 01afc0e7ebddb3b0). Overlap: SAT on
its own fresh live fetch — 255 bbox non-light / 232 classified / 0
coverage holes, exit 3 on ONLY the known R-121 lamp-n|nx-town-mapboard
-0.407 (Sev 2 routed artwalk b26 choreography @ sweep-43, fifty-fourth
sweep since routing, not new, no escalation due — the law keys on
severity-1); zero new contacts. Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 maxArrival, NW 5/5 @
0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 (legs run individually, verdicts
content-anchored on status + per-leg ok counts). Stderr support-seam
abstentions = the known foreign-diagnostics class, 8 dress/temple ids
(goats, ne-woodstack, nw-skeps, se-stones, labyrinth-0004/0025/0038/0051),
composition unchanged vs the sweep-97 normalized set. Tier-2 76th cycle
per the committed pointer: hall 8/8 @ 0.360 (interior-walk-hall.ts) +
row-cottage 6/6 @ 0.384 (interior-walk-row-cottage.ts), both real exit
0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(52nd consecutive clean) + battery 28/28 ALL PASS on epoch-B bytes — the
battery was rebuilt this tick from the sweep-89 growth record (23 standing
+ 5 rotor pins) with two probe self-catches repaired pre-verdict,
disclosed (world correct throughout): points is the 240-entry deltoid
array in the live comp schema, and the sails comp keys speed as degPerSec;
both pins re-keyed from the actual live payload and PASS exact. Comp-
bearing count 18 census-matched (sweep-89 record stands). Interlane md5
f6254cd0 stable. Ledger law EXACT 2370728 at append. Standing gate ALL
PASS real exit 0 at tick-start bf1410f2, re-run ALL PASS real exit 0 at
08da4972 after the dress/city zero-mutation holds interleaved (all named).
Foreign-lane dirt (modified village_next_core_paths.glb + review json,
terrain probes, fleet helpers, uncommitted struct placers) left untouched
per interlane law. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-99): garden-cottage + tower-house (77th cycle — LRU
chain: @98 hall/row-cottage, @97 potter/market, @96 bunkhouse/longhouse,
@95 hall/forge, @94 stable/observatory, @93 row-cottage/inn, @92
garden-cottage/tower-house — garden-cottage + tower-house last walked
sweep-92, now the stalest standing pair; both walk tools verified present:
interior-walk-garden-cottage.ts, interior-walk-tower-house.ts).

sweep-99: CLEAN SWEEP, arrival-fold tick. Census epoch A 293==293 fully
quiet vs the committed sweep-98 baseline (sha16 01afc0e7ebddb3b0): 0
arrivals, 0 departures, 0 drift on the canonical 7-field diff (id, kind,
pos, yaw, scale, lib, bbox). Epoch B caught struct-91 landing mid-tick:
exactly ONE arrival nx-struct-vesicawindow @ (70, -0.0435, -3) yaw 0 lib
f4cedc72ffb79bfa comp {} = struct-91 R9-2 "the vesica window" authored+
placed @ f4524181 — tuple matches its committed ledger line-for-line,
independently corroborated by dress-135 and city-81 hold censuses
(domain-valid sibling work-in-flight, not drift); epoch C 294==294 settled
0/0/0 across a 20s-paced re-read. 0 departures, 0 drift on 293 shared
ids. Overlap: SAT fresh-live at both epochs — epoch A 255 bbox non-light /
232 classified / 0 coverage holes, epoch B 256/232/0 (vesicawindow in the
live SAT set) — exit 3 both times on ONLY the known R-121 lamp-n |
nx-town-mapboard -0.407 (Sev 2 routed to artwalk @ sweep-43, 55th sweep
since routing, no escalation due — law keys severity-1); ZERO new contacts
at the vesica window (r70.1 E mid-gap, bbox 5.43x3.68x0.32 furniture-scale
thin window). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW
5/5 @ 0.37; stderr support-seam abstentions on foreign dress ids = known
normalized class, composition unchanged vs sweep-98. Tier-2 77th cycle per
committed pointer: garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.377
ALL PASS. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit
0 (53rd consecutive) + 28-check battery ALL PASS on epoch-B bytes (2
probe schema self-catches re-keyed from the actual live schema: points is
the 240-entry deltoid array, sails uses degPerSec — the world was correct
throughout, identical to sweep-98's disclosed class); comp-bearing count
18 census-matched; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base 2370728 steady pre-append, entry landed 2370729 -> 2370729.
Standing gate ALL PASS real exit 0 at tick-start dbeeb112, re-run ALL
PASS real exit 0 at 902d5f82 after the struct-91 / dress-135 / city-81
interleaves. Snapshot folded in pre-write-asserted (diff exactly
[vesicawindow arrival], 293->294): 294 entities, 118404B, sha16
43cd103177bfd34d, post-rewrite drift ZERO. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero shared-
budget use. Next tier-2 pair (sweep-100): stable + observatory circuit
(78th cycle — LRU chain: @99 garden-cottage/tower-house, @98 hall/
row-cottage, @97 potter/market, @96 bunkhouse/longhouse, @95 hall/forge,
@94 stable+observatory — stable and observatory last walked sweep-94, now
the stalest standing pair; both walk tools verified present:
interior-walk-stable.ts, struct2-walk-observatory.ts).

sweep-100: CLEAN SWEEP, fully steady tick. Census 294==294 at epochs A and B
(20s-paced) vs the sweep-99 baseline (sha16 43cd103177bfd34d): 0 arrivals, 0
departures, 0 drift on the canonical 7-field diff. Mid-tick HEAD advances
(city-87, city-88, dress-140) were all zero-mutation holds, census-confirmed
quiet; no snapshot rewrite needed — the in-tree baseline is current vs live.
INTERRUPTED-PREDECESSOR RECONCILIATION (struct-9 class, disclosed): sweep-99's
ledger entry reached HEAD riding dress-137's snapshot while its own plan row +
baseline rewrite sat uncommitted in-tree; verified byte-consistent this tick
(294 ents / 118404B / sha16 43cd103177bfd34d, diff vs the HEAD baseline exactly
[vesicawindow arrival]) and folded into this commit. Overlap: SAT fresh-live
fetch 256 bbox non-light / 232 classified / 0 coverage holes, exit 3 on ONLY
the known R-121 lamp-n | nx-town-mapboard -0.407 (Sev 2 routed to artwalk @
sweep-43, fifty-sixth sweep since routing, no escalation due — the law keys on
severity-1); zero new contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0: core 64/64 @ 0.38 (banner-stripped parse), NW 5/5 @
0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; stderr support-seam abstentions = the
known foreign-diagnostics class. Tier-2 78th cycle per committed pointer:
stable 5/5 @ 0.396 (interior-walk-stable.ts) + observatory circuit 5/5 @ 0.389
(struct2-walk-observatory.ts), both real exit 0. Integrity: struct18-fleet-
pin-check 15/15 ALL_PINS_OK real exit 0 (54th consecutive clean) + battery
28/28 ALL PASS on epoch-A bytes; comp-bearing count 18 census-matched (sweep-89
record stands); interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT
2370729 at append. Standing gate ALL PASS real exit 0 at tick-start e768c7e3
(dress-139 interleave absorbed). Foreign-lane dirt left untouched per
interlane law. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-101): row-cottage + inn (79th cycle — LRU chain: @100 stable/
observatory, @99 garden-cottage/tower-house, @98 hall/row-cottage, @97
potter/market, @96 bunkhouse/longhouse, @95 hall/forge — row-cottage last
walked sweep-93 and inn sweep-93, now the stalest standing pair; both walk
tools verified present: interior-walk-row-cottage.ts, interior-walk-inn.ts).

sweep-101: CLEAN SWEEP, fully steady tick. Census 294==294 at epochs A and
B (20s-paced re-read) vs the sweep-100 baseline (sha16 43cd103177bfd34d):
0 arrivals, 0 departures, 0 drift on the canonical 7-field diff — no
sibling world-mutation landed this tick (mid-tick HEAD advance city-92 was
a zero-mutation hold, census-confirmed quiet); no snapshot rewrite needed,
the in-tree baseline is current vs live. Overlap: SAT fresh-live fetch 256
bbox non-light / 232 classified / 0 coverage holes, exit 3 on ONLY the
known R-121 lamp-n | nx-town-mapboard -0.407 (Sev 2 routed to artwalk @
sweep-43, fifty-seventh sweep since routing, no escalation due — the law
keys on severity-1); zero new contacts. Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 (banner-stripped parse,
sweep-100 class), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; stderr
support-seam abstentions on foreign dress/temple ids = the known
foreign-diagnostics class, normalized set unchanged vs sweep-100. Tier-2
79th cycle per committed pointer: row-cottage 6/6 @ 0.384
(interior-walk-row-cottage.ts) + inn 6/6 @ 0.364 (interior-walk-inn.ts),
both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK
real exit 0 (55th consecutive clean) + sweep89-battery 28/28 ALL PASS on
epoch-A bytes; comp-bearing count 18 census-matched (sweep-89 record
stands); interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT
2370729 at append (canonical two-capture formula; a first quick-regex
probe under-counted paired deltas and read 2370641 — sweep-36 disclosed
class, corrected before verdict). Standing gate ALL PASS real exit 0 at
tick-start ccdaafb6 (survey-57 read-only interleave absorbed). Ledger tail
re-checked immediately before append: city-92 zero-mutation hold landed
mid-tick, absorbed normally at unchanged base. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use (D+0, E+0). Next tier-2 pair (sweep-102): bunkhouse + longhouse (80th
cycle — LRU chain: @101 row-cottage/inn, @100 stable/observatory, @99
garden-cottage/tower-house, @98 hall/row-cottage, @97 potter/market —
bunkhouse and longhouse last walked sweep-96, now the stalest standing
pair; both walk tools verified present: interior-walk-bunkhouse.ts,
interior-walk-longhouse.ts).

sweep-102: CLEAN SWEEP, fully steady tick. Census 294==294 at epochs A and
B (20s-paced) vs the committed baseline (sha16 43cd103177bfd34d): 0
arrivals, 0 departures, 0 drift on the canonical 7-field diff, and 0
intra-tick A->B drift — no sibling world-mutation landed this tick
(mid-tick HEAD advances survey-58 read-only + city-95 zero-mutation hold,
both census-corroborated quiet); no snapshot rewrite needed, the in-tree
baseline is current vs live. Overlap: SAT fresh-live fetch 256 bbox
non-light / 232 classified / 0 coverage holes, exit 3 on ONLY the known
R-121 lamp-n | nx-town-mapboard -0.407 (Sev 2 routed to artwalk @
sweep-43, fifty-eighth sweep since routing, no escalation due — the law
keys on severity-1); zero new contacts. Tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 with content-anchored parses
(status + per-leg ok counts + maxArrival from the actual schema): core
64/64 @ 0.38 (banner-stripped parse, sweep-100 class), NW 5/5 @ 0.38,
NE 7/7 @ 0.38, SW 5/5 @ 0.37; stderr seam-abstentions 5-per-walk = the
known foreign-diagnostics class, normalized set unchanged (single
'abstaining, no box' line). Probe self-caught pre-verdict: my first walk
parser keyed invented result keys and threw on the leading [physics]
banner — re-anchored on the real schema (status/results/ok/dist) before
any verdict, sweep-48 class. Tier-2 80th cycle per committed pointer:
bunkhouse 6/6 @ 0.380 (interior-walk-bunkhouse.ts) + longhouse 6/6 @
0.346 (interior-walk-longhouse.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (56th consecutive
clean) + sweep89-battery 28/28 ALL PASS on epoch-A bytes (first battery
invocation missed its argv census path and threw IndexError — corrected
in-tick, no durable effect); comp-bearing count 18 census-matched
(sweep-89 record stands; probe keyed 'comps' where the schema field is
'comp', re-derived); interlane md5 f6254cd0 stable, read fresh. Ledger
law EXACT 2370729 -> 2370729 at append (D+0, E+0). Standing gate ALL
PASS real exit 0 at tick-start 863946ff, re-run ALL PASS real exit 0 at
d2ec519f post-interleave. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-103): forge + potter (81st cycle — LRU chain:
@102 bunkhouse/longhouse, @101 row-cottage/inn, @100 stable/
observatory, @99 garden-cottage/tower-house, @98 hall/row-cottage, @97
potter/market — forge last walked sweep-95, the stalest standing
building; potter and market both @97 are the next-stalest, potter pairs
with forge this cycle; both walk tools verified present:
interior-walk-forge.ts, interior-walk-potter.ts).

sweep-103: CLEAN SWEEP, epoch-settled tick. Census 294→295 at epochs A and B
(20s-paced) vs the committed baseline (sha16 43cd103177bfd34d): +1 domain-valid
arrival nx-struct-fifthbench @ (−23.5,−0.04,−51) yaw −0.4328 lib 62f33173ccdae107
= struct-92 @ c28d8b26 (Fifth Bench, R9-3 stone ribbon), tuple matches its
ledger line-for-line; exactly ONE drift field-set = nx-dress-ne-timberyard-001
lib 10b449fa→dfafb8c8 at identical tuple (76.7,−0.006,69.4) yaw −2.356194, bbox
top 1.241→1.63 = the v9 deep cants, = dress-142 @ 5e461c1e (survey-57 cure
re-place), ledger-exact; 0 departures, 0 unexplained drift on 294 shared ids.
Both commits predate this tick's start (HEAD 5e461c1e at gate) — no mid-tick
epoch correction was needed; epochs A and B identical (settled). Snapshot
rewritten with pre-write assertions (arrivals exactly [fifthbench]; drift
exactly [timberyard lib+bbox]), post-rewrite drift vs live ZERO. Overlap: SAT
fresh-live fetch 257 bbox non-light / 233 classified / 0 coverage holes, exit 3
on ONLY the known R-121 lamp-n | nx-town-mapboard −0.407 (Sev 2 routed to
artwalk @ sweep-43, fifty-ninth sweep since routing, no escalation due — the
law keys on severity-1); zero new contacts at the fifthbench or timberyard
seats. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core
64/64 @ 0.38 (banner-stripped parse), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @
0.37; both changed entities sit r56.1 / r103.2 from every tier-1 leg point —
walks unaffected by construction, the SAT re-run covers the collision surface
(sweep-53/57 precedent). Tier-2 81st cycle per committed pointer: forge 6/6 @
0.375 (interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts),
both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (57th consecutive clean) + sweep89-battery 28/28 ALL PASS on epoch-B
bytes; comp-bearing count 18 census-matched (sweep-89 record stands);
fifthbench comp {} and timberyard comp {} both census-matched against their
ledgers. Interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT
2370732→2370732 at append (D+0, E+0). Standing gate ALL PASS real exit 0 at
tick-start 5e461c1e. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-104): hall + row-cottage (82nd cycle — LRU chain: @103
forge/potter, @102 bunkhouse/longhouse, @101 row-cottage/inn, @100 stable/
observatory, @99 garden-cottage/tower-house, @98 hall/row-cottage — hall last
walked sweep-98 and row-cottage sweep-101, now the stalest standing pair; both
walk tools verified present: interior-walk-hall.ts, interior-walk-row-cottage.ts).
|| sweep-104 | 2026-09-08 | 295→298 epoch-settled (epochs A and B identical, 20s-paced) vs baseline 44a3417ffedfa8aa: +3 arrivals all classified (nx-moonmoth-001 @ (−90,0.0008,13) yaw π/2 lib df959099 = moonmoth-1 committed ledger tuple-exact; beb4c791 hash-id + house-35_-22 stock crate = FOREIGN/PLAYER domain, off-spoke r36.9/r41.8, routed to sweep by city-98 CITY-PLAN law 6 — recorded Sev 3 register entries awaiting Bill disposition); ONE drift wave fully classified domain-valid: 19 town/civic lib flips at identical tuples (5 homes = cabin-1 committed; 13 hall/inn/stable/woodyard/forge/dyehouse/potter/kiln/tower/shrine/gates×4 = village-overhaul DELIVERY.json Bill-commissioned parent wave, all live libs DELIVERY-matched; windmill = windmill overhaul, comp GAIN motion:well_millstone) + nx-carousel ce3633992d07055e→1c0128b61b510a5d = polish-283 Bill-approved carved horses, comp bag exact 7 preserved + b17 pos +0.54m Y = cabin-1 remount; 0 departures, 0 unexplained drift on 292 shared ids; snapshot rewritten 298 ents/120100B/sha16 a1de8a78dbab76bc pre-write-asserted, post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 60th sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live 260 bbox non-light/232 classified/0 coverage holes — ZERO new contacts across the entire 19-building re-place wave | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each over the NEW bytes (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 82nd cycle per committed pointer hall 8/8 @ 0.360 + row-cottage 6/6 @ 0.384 ALL PASS against their re-placed bytes — interior door-lane contracts survived the overhaul | struct18 pin check 15/15 ok bad=[] (58th consecutive); comp-bearing 18→21 census-matched ZERO losses (gains exactly moonmoth + house-35_-22 arrivals + windmill millstone); court smoke / forge coals+particles / belltower ladder / potter pwheel / tower sockets / carousel 7 all standing post-wave; 38 lights; interlane f6254cd0 stable; ledger law EXACT 2370738 at append (struct-93 D+1 absorbed mid-tick); gate ALL PASS real exit 0 at tick-start ae0226d0 | CLEAN SWEEP — R-121 open, known, no escalation due; 2 foreign arrivals Sev 3 register-only |


sweep-104: CLEAN SWEEP, epoch-settled arrival+wave tick — the largest single-window world delta this lane has audited. Census 295→298 vs the committed sweep-103 baseline (sha16 44a3417ffedfa8aa), epochs A and B identical (20s-paced): +3 arrivals, 0 departures. Arrivals: nx-moonmoth-001 @ (−90, 0.0008, 13) yaw π/2 lib df959099 = moonmoth-1 committed ledger, tuple-exact, comp bag lock+2 wing pendulums+sockets live; beb4c791 (hash-id, carries the moon-moth source lib df959099, pos (36.17,−0.036,−14.88)) and house-35_-22 (dels/crate_large_red stock demo lib, pos (36,0,−21), comp structure) = FOREIGN/PLAYER-domain entities, off-spoke band r36.9/r41.8, routed to this register by city-98 per CITY-PLAN law 6 — recorded below as Sev 3 register entries awaiting Bill disposition (no lane claims them; both sit clear of routes per SAT). Drift wave fully classified, every field-set domain-valid: (a) five homes (row-cottage, garden-cottage, longhouse, bunkhouse, tower-house) + b17 +0.54m Y remount = cabin-1 committed ledger, comp bags preserved; (b) thirteen town/civic builds (hall, inn, stable, woodyard, forge, dyehouse, potter, kiln, tower, shrine, gates n/s/e/w) = the Bill-commissioned village-overhaul parent wave (untracked in-tree project, DELIVERY.json) — all 13 live libs DELIVERY.json-matched this tick, identical tuples; (c) nx-town-windmill lib flip = windmill overhaul (untracked WINDMILL-OVERHAUL.md), comp GAIN motion:well_millstone alongside motion:sails; (d) nx-carousel ce3633992d07055e→1c0128b61b510a5d = polish-283 committed, Bill-approved carved carousel horses, comp bag exact 7 with motion:horse_{0,2,4,6} keys unchanged. Zero comp losses anywhere: comp-bearing 18→21, gains exactly the two arrivals + windmill millstone; court smoke, forge coals+particles, belltower ladder, potter pwheel, tower sockets all standing after the re-place wave — the wipe law's feared failure mode did not occur. Overlap: SAT fresh-live 260 bbox non-light / 232 classified / 0 coverage holes, exit 3 on ONLY the known R-121 lamp-n | nx-town-mapboard −0.407 (Sev 2 routed to artwalk @ sweep-43, sixtieth sweep since routing, no escalation due — the law keys on severity-1); zero new contacts at any of the 19 re-placed seats or the 3 arrivals. Tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each, walked over the NEW bytes — the re-placed buildings ARE the walk surface, so no construction shortcut applied: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 82nd cycle per committed pointer: hall 8/8 @ 0.360 + row-cottage 6/6 @ 0.384, both against their re-placed bytes, both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ok bad=[] (58th consecutive); interlane md5 f6254cd0 stable; 38 lights; ledger law EXACT — base re-read immediately before append (struct-93 D+1 halt cure absorbed mid-tick, 2370737→2370738), entry landed D+0/E+0 at 2370738. ENVIRONMENT FINDING surfaced for the fleet: root volume hit 100% (101Mi free) mid-tick — ENOSPC killed one walk capture; this lane freed only its own /tmp/sweep74-env residue (18M) restoring 809Mi; /tmp/eliza-29901 holds 6.8G and needs an owner decision (NOT touched by this lane). Snapshot rewritten with pre-write assertions (arrivals exactly [moonmoth, beb4c791, house-35_-22]; 21 lib flips + b17 pos exactly), post-rewrite drift vs live ZERO: 298 entities, 120100B, sha16 a1de8a78dbab76bc. Probe self-caught pre-verdict: walk parser keyed 'dist' where the approach tool schema uses 'distance' (sweep-54 class, re-anchored on status + per-leg ok + maxArrival). Zero world mutations, zero defect notes to owning lanes (all changes ledger-matched), zero uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-105): stable + observatory circuit (83rd cycle — LRU chain: @104 hall/row-cottage, @103 forge/potter, @102 bunkhouse/longhouse, @101 row-cottage/inn, @100 stable/observatory, @99 garden-cottage/tower-house — stable and observatory last walked sweep-100, now the stalest standing pair; stable was re-placed by the overhaul wave, sweep-105 walk lands directly on the new bytes; both walk tools verified present: interior-walk-stable.ts, struct2-walk-observatory.ts).

sweep-105: CLEAN SWEEP, epoch-settled drift-pair tick. Census 298==298 at
epochs A/B/C vs the committed sweep-104 baseline (sha16 a1de8a78dbab76bc):
0 arrivals, 0 departures, exactly TWO classified lib flips at identical
tuples, both struct-domain, both ledger-matched: (1) nx-struct-halt
bb227fd6->cdaf7c1f = struct-93 @ a4f51752, committed PRE-tick — sweep-104's
census reads predated its re-place verbs (the sweep-52 known-epoch class);
(2) nx-struct-needlerest bb227fd6->cdaf7c1f = struct-94 @ f5e6883d, committed
MID-TICK — the deferred shared-bytes half of the halt value-crush lineage,
zero-upload byte-swap at register-pinned tuple (10.273, 0.0029, 68.737) yaw
2.99324, independently corroborated by city-103 and dress-150 holds. Epoch C
settled 0/0/0 across a 25s-paced re-read; both swaps bbox-parity EXACT
(material-only cures per both ledgers). Overlap: SAT fresh-live at epoch A
and re-run at epoch C — 260 bbox non-light / 232 classified / 0 coverage
holes, exit 3 on ONLY the known R-121 lamp-n | nx-town-mapboard -0.407
(Sev 2 routed to artwalk @ sweep-43, sixty-first sweep since routing, no
escalation due — the law keys on severity-1); ZERO new contacts at either
cured seat. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0: core 64/64 @ 0.38 (banner-stripped parse), NW 5/5 @ 0.38, NE 7/7 @ 0.38,
SW 5/5 @ 0.37; needlerest sits r69 NE, 47m+ off every tier-1 waypoint —
epoch-A walks stand by construction, SAT re-run covers the collision surface
(sweep-53/57 precedent). Tier-2 83rd cycle per committed pointer: stable 5/5
@ 0.396 (interior-walk-stable.ts, walked over the overhaul-wave bytes) +
observatory circuit 5/5 @ 0.389 (struct2-walk-observatory.ts), both real
exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(59th consecutive clean); sweep89-battery 25/28 with exactly three FAILs,
ALL stale-probe-pins predating the sweep-104 wave — windmill pin 369c5724 vs
live a557d918 = the WINDMILL-OVERHAUL accepted baseline ("windmill looks
amazing!", LIVE_VERIFIED); woodyard pin 01b78fdd vs live 333e85a4 =
village-overhaul DELIVERY.json LIVE_VERIFIED exact; comp-bearing pin 18 vs
live 21 = the sweep-104 record (gains moonmoth + house-35_-22 arrivals +
windmill millstone) — world correct throughout, all three re-derived from
the live census, not memory (battery probe pins refreshed from live values
this tick); comp-bearing 21 census-matched; interlane md5 f6254cd0 stable,
read fresh. Ledger law EXACT — base re-read immediately before append
(struct-94 D+1 absorbed mid-tick), entry landed D+0/E+0 at 2370739.
Standing gate ALL PASS real exit 0 at tick-start 13fc65d4, re-run ALL PASS
real exit 0 at 543f0fb4 post-interleave. Snapshot rewritten with pre-write
assertions (0 arrivals, 0 departures, drift exactly [halt lib, needlerest
lib], bbox parity), post-rewrite drift vs live ZERO: 298 entities, 120100B,
sha16 2f6ccda3e57cc491. Probe self-caught pre-verdict: my walk-verification
script shadowed the core results variable with SW's 5-leg list and tripped
its own redundant assert — re-inspected the printed per-leg counts from the
actual captures (sweep-48 class, no verdict impact); the SAT re-run echo
printed exit 0 from the pipe tail (content-anchored on the unclassified line
instead, polish-270 class). Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-106): bunkhouse + longhouse (84th cycle — LRU
chain: @105 stable/observatory, @104 hall/row-cottage, @103 forge/potter,
@102 bunkhouse/longhouse, @101 row-cottage/inn, @100 stable/observatory —
bunkhouse last walked sweep-102 and longhouse sweep-102, now the stalest
standing pair; both walk tools verified present: interior-walk-bunkhouse.ts,
interior-walk-longhouse.ts).

sweep-106: CLEAN SWEEP, steady-state tick. Census 298==298 at epochs A/B
(25s-paced) vs the committed sweep-105 baseline (sha16 2f6ccda3e57cc491):
0 arrivals, 0 departures, 0 drift field-sets on all 298 shared ids; epochs
A and B byte-identical across id/pos/yaw/scale/lib/kind/bbox — single stable
epoch, no sibling landed this window; snapshot byte-identical, NO rewrite
(sweep-18/19 precedent). Overlap: SAT fresh-live 260 bbox non-light / 232
classified / 0 coverage holes, exit 3 on ONLY the known R-121 lamp-n |
nx-town-mapboard -0.407 (Sev 2 routed to artwalk @ sweep-43, sixty-second
sweep since routing, no escalation due — the law keys on severity-1); zero
new contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 —
standing profile exact. Tier-2 84th cycle per committed pointer: bunkhouse
6/6 @ 0.380 (interior-walk-bunkhouse.ts) + longhouse 6/6 @ 0.346
(interior-walk-longhouse.ts), both real exit 0, both walked over the
overhaul-wave bytes — profile matches sweep-102 exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (60th consecutive
clean); interlane md5 f6254cd0 stable, read fresh. BATTERY PROBE MAINTENANCE
+ DISCLOSURE: sweep89-battery first ran 24/28 — the FOURTH FAIL was
carousel-lib ce363399 vs live 1c0128b6 = the polish-283 Bill-approved
carved-horses swap from the sweep-104 wave, the same stale-probe-pin class
as the known three (windmill/woodyard/comp-bearing). That means sweep-105's
reported "25/28, 3 FAILs" was a MISCOUNT: on that world state the committed
battery (still pinning carousel at ce363399) must have shown 24/28 — the
carousel FAIL was real then too and went uncounted; correcting the record
here. All four FAILs were stale PROBE pins, never world drift: carousel
comp bag exact 7 PRESERVED through the swap (census-verified this tick),
windmill a557d918 = WINDMILL-OVERHAUL accepted baseline, woodyard 333e85a4
= village-overhaul DELIVERY.json LIVE_VERIFIED, comp-bearing 21 = sweep-104
record. The four battery pins were refreshed to their committed-ledger
accepted baselines IN THIS TICK's probe edit (sweep89-battery.py, committed
with this entry) — RED (4 FAILs) observed on live bytes before the pin
refresh, GREEN (28/28) after, all pins derived from committed ledgers, not
memory; battery now exits 0 with zero FAILs. Comp-bearing 21 census-matched;
38 lights. Ledger law EXACT — base re-read fresh immediately before append,
entry landed D+0/E+0 at 2370739. Standing gate ALL PASS real exit 0 at
tick-start 4fe363e9 (struct-95 sibling at HEAD, zero-mutation committed
tick); no interleave between gate and evidence this window — gate not
re-run, epoch B census settled 0/0/0 after all evidence. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-107):
garden-cottage + tower-house (85th cycle — LRU chain: @106 bunkhouse/
longhouse, @105 stable/observatory, @104 hall/row-cottage, @103 forge/
potter, @102 bunkhouse/longhouse, @101 row-cottage/inn, @100 stable/
observatory, @99 garden-cottage/tower-house — garden-cottage last walked
sweep-99 and tower-house sweep-99, now the stalest standing pair; both walk
tools verified present this tick: interior-walk-garden-cottage.ts,
interior-walk-tower-house.ts).

sweep-107: CLEAN SWEEP, epoch-correction tick. Census epoch A 298==298 vs the
committed sweep-106 baseline (sha16 2f6ccda3e57cc491): 0 arrivals, 0
departures, 0 drift on all 298 shared ids across id/pos/yaw/scale/lib/kind/bbox.
While tier-2 walks ran, struct-96 (R9-4 The Sliding Ladder placement) committed
at 86998ed4 and spawned nx-struct-slidingladder AFTER my epoch-A census, so per
the polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: epoch-B census (299 final, exactly ONE arrival = nx-struct-slidingladder
@ (3.5, 0.0056, 58) yaw 0 lib ed652efc09e44123 comp {}, tuple matching the
struct-96 ledger line-for-line incl. its idempotent 0-verb rerun claim; bbox
4.4×4.37×1.58 scale-sane, r58.2 S-spoke mid-gap station; 0 departures, ZERO
drift on all 298 shared ids), SAT re-run at epoch B (261 bbox non-light / 232
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, sixty-third sweep since routing, NOT new, no
escalation due — the law keys on severity-1; ZERO new contacts at the
slidingladder seat, sweep-side corroboration of struct-96's own worst-gap
claim ninesbridge +7.75), NE approach RE-WALKED at epoch B 7/7 ALL_PASS @
0.38 (nearest walked waypoint 19.0m — inside the re-verify band after
sweep-58's 17.5m precedent, so the epoch-A NE legs were not allowed to
stand; core/gc/th/SW/NW waypoints all ≥33.9m clear by construction), pins
re-run 15/15 at epoch B, battery re-run 28/28 on epoch-B bytes (comp-bearing
21 unchanged — the arrival is comp-neutral {}, 38 lights), standing gate
re-run ALL PASS real exit 0 at 86998ed4. Overlap tier-1 profile: core 64/64
@ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 (epochs A and B), SW 5/5 @ 0.37 — all
four real exit 0, banner-stripped parse. Tier-2 85th cycle per committed
pointer: garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.377, both real
exit 0, both over the overhaul-wave bytes. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK real exit 0 (61st consecutive clean); sweep89-battery 28/28
ALL PASS at both epochs — the sweep-106 refreshed pins hold with zero FAILs;
interlane md5 f6254cd0 stable, read fresh. Probe self-caught pre-verdict:
snapshot-rewrite post-write drift check compared str(None) vs None on the
lamp-e-l lib field (five false residuals) — re-derived with proper norm_lib
on both sides, true drift ZERO (sweep-5 class, no verdict impact; the
pre-write direct-compare assertion had already passed). Ledger law EXACT —
base re-read fresh immediately before append (struct-96 D+1 absorbed
mid-tick, 2370739→2370740). Snapshot rewritten with pre-write assertions
(arrival exactly [nx-struct-slidingladder], tuple ledger-exact, 0 drift on
shared ids), post-rewrite drift vs live ZERO: 299 entities, 120504B, sha16
ec2eeb876e233bf8. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-108): market + inn (86th cycle — LRU chain: @107
garden-cottage/tower-house, @106 bunkhouse/longhouse, @105
stable/observatory, @104 hall/row-cottage, @103 forge/potter, @102
bunkhouse/longhouse, @101 row-cottage/inn, @97 potter/market — market last
walked sweep-97 and inn sweep-101, now the stalest standing pair; both walk
tools verified present this tick: interior-walk-market.ts,
interior-walk-inn.ts).

sweep-108: CLEAN SWEEP, steady-state tick. Census 299==299 at epochs A and B
(25s-paced) vs the committed sweep-107 baseline (sha16 ec2eeb876e233bf8):
0 arrivals, 0 departures, 0 drift field-sets on all 299 shared ids across
id/pos/yaw/scale/lib/kind/bbox — single stable epoch, no sibling landed this
window; snapshot byte-identical, NO rewrite (sweep-106 precedent). Overlap:
SAT fresh-live 261 bbox non-light / 232 classified / 0 coverage holes, exit 3
on ONLY the known R-121 lamp-n | nx-town-mapboard -0.407 (Sev 2 routed to
artwalk @ sweep-43, sixty-fourth sweep since routing, no escalation due — the
law keys on severity-1); zero new contacts. Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @
0.38, SW 5/5 @ 0.37 — standing profile exact. Walk stderr support-seam
abstentions on foreign dress/temple entities = the known normalized
diagnostics set, unchanged. Tier-2 86th cycle per committed pointer: market
6/6 @ 0.389 (interior-walk-market.ts) + inn 6/6 @ 0.364 (interior-walk-inn.ts),
both real exit 0, both over the overhaul-wave bytes. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (62nd consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 — the sweep-106 refreshed pins
hold with zero FAILs (comp-bearing 21, 38 lights); interlane md5 f6254cd0
stable, read fresh. Probe self-caught pre-verdict: (a) first tier-1 walk run
piped output through tail and captured tail's exit code (polish-270
content-laundering class) — all four legs re-run with file capture and real
exit codes; (b) first parser keyed per-leg maxArrival before reading the
actual schemas and crashed on the approach tools' array shape (sweep-48
class) — re-keyed on results[].ok + status + maxArrival. Ledger law EXACT —
base re-read fresh immediately before append, 2370741. Standing gate
ALL_PINS_OK real exit 0 at tick-start 0100a1f2 (own sweep-107 close at HEAD,
no sibling commit since). Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-109): forge + potter (87th cycle — LRU chain: @108
market/inn, @107 garden-cottage/tower-house, @106 bunkhouse/longhouse, @105
stable/observatory, @104 hall/row-cottage, @103 forge/potter — forge and
potter last walked sweep-103, now the stalest standing pair; both walk tools
verified present: interior-walk-forge.ts, interior-walk-potter.ts).

sweep-109: CLEAN SWEEP, epoch-correction tick. Census epoch A 299==299 vs the
committed sweep-108 baseline (sha16 ec2eeb876e233bf8): 0 arrivals, 0
departures, 0 drift on all 299 shared ids across id/pos/yaw/scale/lib/kind/
bbox. While tier-2 walks ran, struct-97 (R10-1 The Honeycomb Screen
placement) committed at 7b11d2b7 and spawned nx-struct-honeycombscreen AFTER
my epoch-A census, so per the polish-270 epoch law all affected evidence was
re-taken fresh before verdicts: epoch-B census (300 final, exactly ONE
arrival = nx-struct-honeycombscreen @ (-52.62, -0.0094, 19.15) yaw -1.2217
lib e8ea1c16366a2735 comp {}, tuple matching the struct-97 ledger
line-for-line incl. its idempotent 0-verb rerun claim; bbox 4.28x4.40x0.70
scale-sane, r56.0 WSW lavender-shoulder seat az160; 0 departures, ZERO drift
on all 299 shared ids), SAT re-run at epoch B (262 bbox non-light / 234
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, sixty-fifth sweep since routing, NOT new, no
escalation due -- the law keys on severity-1; ZERO new contacts at the
honeycombscreen seat, sweep-side corroboration of struct-97's own worst-gap
claim stillwind +8.42), NW approach RE-WALKED at epoch B 5/5 ALL_PASS @ 0.38
(nearest leg point 16.0m -- inside the re-verify band after sweep-107's 19.0m
precedent, so the epoch-A NW legs were not allowed to stand; core legs end at
r<=8.9 plaza spokes >=47m clear by construction; NE/SW waypoints 72.2m /
54.0m clear), epoch-C 25s-paced re-read settled 300==300 with the arrival
absorbed, pins re-run 15/15 ALL_PINS_OK, battery re-run 28/28 ALL PASS on
epoch-B bytes (comp-bearing 21 unchanged -- the arrival is comp-neutral {},
38 lights), standing gate re-run ALL PASS real exit 0 at 8b443742.
Overlap tier-1 profile: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW
5/5 @ 0.37 -- all four real exit 0, banner-stripped parse. Tier-2 87th cycle
per committed pointer: forge 6/6 @ 0.375 + potter 6/6 @ 0.366, both real
exit 0, both over the overhaul-wave bytes. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK real exit 0 (63rd consecutive clean); sweep89-battery 28/28
ALL PASS exit 0 at both epochs -- the sweep-106 refreshed pins hold with zero
FAILs; interlane md5 f6254cd0 stable, read fresh. Probe self-caught
pre-verdict: the snapshot post-write drift check re-imported the sweep-107
str(None) vs None lib-compare bug via chassis copy and threw five false
residuals on lamp -l fields -- fixed in-script (norm_lib both sides), re-run
green (sweep-107 class, no verdict impact); walk-band parser first keyed
invented keys, re-anchored on the actual schema (results[].x/z, core
end-arrays) before verdict (sweep-48 class). Ledger law EXACT -- base re-read
fresh immediately before append. Snapshot rewritten with pre-write assertions
(arrival exactly [nx-struct-honeycombscreen], tuple ledger-exact, 0 drift on
shared ids), post-rewrite drift vs live ZERO: 300 entities, 120922B, sha16
4514c134f3d25208. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-110): stable + observatory circuit (88th cycle -- LRU chain:
@109 forge/potter, @108 market/inn, @107 garden-cottage/tower-house, @106
bunkhouse/longhouse, @105 stable/observatory, @104 hall/row-cottage --
stable last walked sweep-105 and observatory sweep-105, now the stalest
standing pair; both walk tools verified present this tick:
interior-walk-stable.ts, struct2-walk-observatory.ts).


sweep-110: CLEAN SWEEP, epoch-correction tick. Census epoch A 300==300 vs the
committed sweep-109 baseline (sha16 4514c134f3d25208): 0 arrivals, 0
departures, 0 drift on all 300 shared ids across id/pos/yaw/scale/lib/kind/bbox
-- fully quiet across the first read. While tier-2 walks ran, struct-98
(R10-2 The Penrose Paving placement) committed at d71ce09c and spawned
nx-struct-penrosepaving AFTER my epoch-A census, so per the polish-270 epoch
law all affected evidence was re-taken fresh before verdicts: epoch-B census
(301 final, exactly ONE arrival = nx-struct-penrosepaving @ (-55.63, -0.0252,
-22.48) yaw 0 lib 31d34740e688ccea comp {}, tuple matching the struct-98
ledger line-for-line incl. its idempotent 0-verb rerun claim; bbox
7.974x0.11x8.368 ground-film paving, r60.2 WNW seam seat az202; 0 departures,
ZERO drift on all 300 shared ids), SAT re-run at epoch B (263 bbox non-light /
235 classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, sixty-sixth sweep since routing, NOT new, no
escalation due -- the law keys on severity-1; ZERO new contacts at the
penrosepaving seat, sweep-side corroboration of struct-98's own worst-gap
claim +4.64), walk-band check (nearest walked waypoint 30.9m SW leg, all
other legs 50.1m+ -- epoch-A walks stand by construction, sweep-53
precedent), epoch-C 25s-paced re-read settled 301==301 0/0/0, battery re-run
28/28 ALL PASS on epoch-B bytes (comp-bearing 21 unchanged -- the arrival is
comp-neutral {}, 38 lights), standing gate re-run ALL PASS real exit 0 at
d71ce09c. Overlap tier-1 profile: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @
0.38, SW 5/5 @ 0.37 -- all four real exit 0, banner-stripped parse. Tier-2
88th cycle per committed pointer: stable 5/5 @ 0.396 (interior-walk-stable.ts)
+ observatory circuit 5/5 @ 0.389 (struct2-walk-observatory.ts), both real
exit 0, both over the overhaul-wave bytes. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK real exit 0 (64th consecutive clean); sweep89-battery 28/28
ALL PASS exit 0 at both epochs -- the sweep-106 refreshed pins hold with zero
FAILs; interlane md5 f6254cd0 stable, read fresh. Probe self-caught
pre-verdict: core-walk parse keyed the physics-banner [physics] line as the
JSON start (banner-strip regex re-anchored on a line starting with an open
brace, sweep-48 class, no verdict impact; battery argv needed the census path
argument, first run IndexError caught pre-verdict). Ledger law EXACT -- base
re-read fresh immediately before append, 2370743. Snapshot rewritten with
pre-write assertions (arrival exactly [nx-struct-penrosepaving], tuple
ledger-exact, 0 drift on shared ids), post-rewrite drift vs live ZERO: 301
entities, 121339B, sha16 3b59ad9197e54aab. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-111): row-cottage + market (89th cycle --
LRU chain: @110 stable/observatory, @109 forge/potter, @108 market/inn, @107
garden-cottage/tower-house, @106 bunkhouse/longhouse, @104 hall/row-cottage,
@101 row-cottage/inn, @97 potter/market -- row-cottage last walked sweep-104
and market sweep-108, now the stalest standing pair; both walk tools verified
present this tick: interior-walk-row-cottage.ts, interior-walk-market.ts).


sweep-111: CLEAN SWEEP, steady-state tick. Census 301==301 (263 thing +
38 light) vs the committed sweep-110 baseline (sha16 3b59ad9197e54aab):
0 arrivals, 0 departures, 0 drift on all 301 shared ids across
id/pos/yaw/scale/lib/kind/bbox -- epoch A fully quiet, epoch B (25s-paced
re-read) settled identical, no sibling landed this window (HEAD 94e87958
= own sweep-110 close, stable all window). Snapshot byte-identical, NO
rewrite (sweep-106/108 precedent). Overlap: SAT fresh over the live set
-- 263 bbox non-light, 235 classified, 0 coverage holes, exit 3 on
exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407 --
known Sev 2 routed to artwalk b26 choreography @ sweep-43, sixty-seventh
sweep since routing, NOT new, no escalation due (law keys severity-1);
zero new contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @
0.37. Tier-2 89th cycle per committed pointer: row-cottage 6/6 @ 0.384
(interior-walk-row-cottage.ts) + market 6/6 @ 0.389
(interior-walk-market.ts), both real exit 0, both over the overhaul-wave
bytes. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(65th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census bytes (comp-bearing 21, 38 lights); interlane md5 f6254cd0
stable, read fresh. Probe self-caught pre-verdict: battery first invoked
via bun against a python script (parser error), re-run under python3,
green -- no verdict impact. Ledger law EXACT -- base re-read fresh
immediately before append, 2370743. Standing gate ALL PASS real exit 0
at tick-start 94e87958 (no interleave, no re-run needed -- HEAD stable
all window). Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-112): hall + bunkhouse (90th cycle -- LRU chain:
@111 row-cottage/market, @110 stable/observatory, @109 forge/potter,
@108 market/inn, @107 garden-cottage/tower-house, @106
bunkhouse/longhouse, @104 hall/row-cottage -- hall last walked
sweep-104, bunkhouse sweep-106, now the stalest standing pair; both walk
tools verified present this tick: interior-walk-hall.ts,
interior-walk-bunkhouse.ts).


sweep-112: CLEAN SWEEP, steady-state tick. Census 301==301 (263 thing +
38 light) vs the committed sweep-110/111 baseline (sha16
3b59ad9197e54aab): 0 arrivals, 0 departures, 0 drift on all 301 shared
ids across id/pos/yaw/scale/lib/kind/bbox -- epoch A fully quiet, epoch B
(22s-paced re-read) settled identical, no sibling landed this window
(HEAD 137d11da = survey-64 close, stable all window). Snapshot
byte-identical, NO rewrite (sweep-106/108/111 precedent). Overlap: SAT
fresh over the live set -- 263 bbox non-light, 235 classified, 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, sixty-eighth sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38 (max dist 0.3799), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37.
Tier-2 90th cycle per committed pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.380
(interior-walk-bunkhouse.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (66th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT -- base re-read fresh immediately before append, 2370743 D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 137d11da (no
interleave, no re-run needed -- HEAD stable all window). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-113):
longhouse + garden-cottage (91st cycle -- LRU chain: @112 hall/bunkhouse,
@111 row-cottage/market, @110 stable/observatory, @109 forge/potter,
@108 market/inn, @107 garden-cottage/tower-house, @106
bunkhouse/longhouse -- longhouse last walked sweep-106 and
garden-cottage sweep-107, now the stalest standing pair; both walk
tools verified present this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).


sweep-113: CLEAN SWEEP, epoch-correction tick. Census epoch A 301==301 vs the
committed sweep-112 baseline (sha16 3b59ad9197e54aab): 0 arrivals, 0
departures, 0 drift on all 301 shared ids across id/pos/yaw/scale/lib/kind/bbox
-- fully quiet first read. While tier-2 walks ran, struct-99 (R10-3 The Koch
Snowflake Garden) committed at e588466d and spawned nx-struct-kochgarden AFTER
my epoch-A census, so per the polish-270 epoch law all affected evidence was
re-taken fresh before verdicts: epoch-B census (302 final, exactly ONE arrival
= nx-struct-kochgarden @ (-6.28, 0.0016, 89.78) yaw 0 lib 92ed6b2730321832
comp {}, tuple matching the struct-99 ledger line-for-line incl. its idempotent
0-verb rerun claim; bbox 5.55x0.315x6.31 scale-sane, r90.0 S-procession
terminal seat az184; corroborated independently by survey-65's census note;
0 departures, ZERO drift on all 301 shared ids), SAT re-run at epoch B (264
bbox non-light / 235 classified / 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to
artwalk b26 choreography @ sweep-43, sixty-ninth sweep since routing, NOT new,
no escalation due -- the law keys on severity-1; ZERO new contacts at the
kochgarden seat, sweep-side corroboration of struct-99's own worst-gap claim
+4.49), walk-band check (nearest walked waypoint 32.1m NE leg, all others
59.1m+ -- epoch-A walks stand by construction, sweep-53 precedent), epoch-C
25s-paced re-read settled 302==302 0/0/0, battery re-run 28/28 ALL PASS on
epoch-B bytes (comp-bearing 21 unchanged -- the arrival is comp-neutral {},
38 lights), standing gate re-run ALL PASS real exit 0 at a3c0548c.
Overlap tier-1 profile: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW
5/5 @ 0.37 -- all four real exit 0, banner-stripped parse. Tier-2 91st cycle
per committed pointer: longhouse 6/6 @ 0.346 (interior-walk-longhouse.ts) +
garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both real
exit 0, both over the overhaul-wave bytes. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK real exit 0 (67th consecutive clean); sweep89-battery 28/28
ALL PASS exit 0 at both epochs -- the sweep-106 refreshed pins hold with zero
FAILs; interlane md5 f6254cd0 stable, read fresh. Probe self-caught
pre-verdict: walk-band parser first keyed dict-form waypoints only (17
found), re-anchored on the actual schemas (core results[].end arrays,
approach results[].x/.z -- 169 waypoints) before the band verdict (sweep-48
class, no verdict impact). Ledger law EXACT -- base re-read fresh immediately
before append. Snapshot rewritten with pre-write assertions (arrival exactly
[nx-struct-kochgarden], tuple ledger-exact, 0 drift on shared ids),
post-rewrite drift vs live ZERO: 302 entities, 121752B, sha16 c68fcbc9e3195567.
Zero world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-114):
stable + observatory circuit (92nd cycle -- LRU chain: @113
longhouse/garden-cottage, @112 hall/bunkhouse, @111 row-cottage/market, @110
stable/observatory, @109 forge/potter, @108 market/inn -- stable and
observatory both last walked sweep-110, now the stalest standing pair; both
walk tools verified present this tick: interior-walk-stable.ts,
struct2-walk-observatory.ts).


sweep-114: CLEAN SWEEP, steady-state tick. Census 302==302 (264 thing +
38 light) vs the committed sweep-113 baseline (sha16 c68fcbc9e3195567):
0 arrivals, 0 departures, 0 drift on all 302 shared ids across
id/pos/yaw/scale/lib/kind/bbox -- epoch A fully quiet, epoch B
(25s-paced re-read) settled identical; no sibling landed this window
(HEAD f5228415 = sweep-113 close, stable all window). Snapshot
byte-identical, NO rewrite (sweep-106/108/111/112 precedent). Overlap:
SAT fresh over the live set -- 264 bbox non-light, 235 classified, 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, seventieth sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38 (banner-stripped parse), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @
0.37. Tier-2 92nd cycle per committed pointer: stable 5/5 @ 0.396
(interior-walk-stable.ts) + observatory circuit 5/5 @ 0.389
(struct2-walk-observatory.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (68th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT -- base re-read fresh immediately before append, 2370744 D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start f5228415 (no
interleave, no re-run needed -- HEAD stable all window). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-115):
forge + potter (93rd cycle -- LRU chain: @114 stable/observatory, @113
longhouse/garden-cottage, @112 hall/bunkhouse, @111 row-cottage/market,
@110 stable/observatory, @109 forge/potter -- forge and potter both
last walked sweep-109, now the stalest standing pair; both walk tools
verified present this tick: interior-walk-forge.ts,
interior-walk-potter.ts).

|| sweep-115 | 2026-09-08 | 302→303 epoch-corrected (+1 domain-valid arrival nx-struct-sierpinski @ (-7.74,-0.0301,-73.59) yaw 0 lib 7f8b5fd7a3d18b22 comp {} = struct-100 @ e4031be5 MID-TICK, tuple matches its committed ledger line-for-line incl. idempotent 0-verb rerun + its own enterable two-way walk 0.375; corroborated by survey-66 census note; bbox 6.55x5.346x5.693 scale-sane, r74.1 N-meridian antipode seat az354; ZERO drift on 302 shared ids, 0 departures; epoch C 22s-paced re-read settled 303==303 0/0/0; snapshot rewritten 303/122168B/sha16 397a3f2a3bd1a1bf pre-write-asserted post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 71st sweep since routing, no escalation due — law keys Sev 1); 265 bbox non-light / 235 classified / 0 coverage holes, SAT re-run at epoch B (sierpinski in live set, ZERO new contacts at its seat — corroborates struct-100 worst-gap +2.87) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5, NE 7/7, SW 5/5 @ 0.37; walk-band 39.2m nearest — epoch-A walks stand by construction, sweep-53 precedent); tier-2 93rd cycle per committed pointer forge 6/6 @ 0.375 + potter 6/6 @ 0.366 ALL PASS | pins 15/15 ALL_PINS_OK 69th consecutive, battery 28/28 on epoch-B bytes (comp-bearing 21 unchanged — arrival comp-neutral, 38 lights), interlane f6254cd0 stable, ledger law EXACT 2370745 at append (struct-100 D+1 absorbed mid-tick, base re-read fresh), standing gate ALL PASS real exit 0 at tick-start 049d25fb + re-run b93b586e post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-116 | 2026-09-08 | 303==303 steady state (265 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 303 shared ids on id/pos/yaw/lib/scale/kind/bbox vs sweep-115 baseline sha16 397a3f2a3bd1a1bf — epochs A/B (25s-paced) settled identical, single stable epoch, no sibling landed this window, HEAD 4d75f82d = sweep-115 close stable all window; snapshot byte-identical NO rewrite, sweep-106/108/111/114 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 72nd sweep since routing, no escalation due — law keys Sev 1); 265 bbox non-light / 235 classified / 0 coverage holes, SAT fresh over live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 94th cycle per committed pointer tower-house 6/6 @ 0.3765 + inn 6/6 @ 0.364 ALL PASS | pins 15/15 ALL_PINS_OK 70th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370745 at append (base re-read fresh pre-append), standing gate ALL PASS real exit 0 at tick-start 4d75f82d, HEAD stable all window no re-run needed | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-117 | 2026-09-08 | 303==303 steady state (265 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 303 shared ids on id/pos/yaw/lib/scale/kind/bbox vs sweep-116/baseline sha16 397a3f2a3bd1a1bf — epochs A/B paced settled identical, single stable epoch, no sibling mutated the live world this window, survey-67 read-only interleave @ 113243a4 corroborates census 303 steady independently; snapshot byte-identical NO rewrite, sweep-106/108/111/114/116 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 73rd sweep since routing, no escalation due — law keys Sev 1); 265 bbox non-light / 235 classified / 0 coverage holes, SAT fresh over live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 95th cycle per committed pointer row-cottage 6/6 @ 0.384 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 71st consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370745 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start daac8fea + re-run 113243a4 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-118 | 2026-09-08 | 303==303 steady state (265 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 303 shared ids on id/pos/yaw/lib/scale/kind/bbox vs baseline sha16 397a3f2a3bd1a1bf — epochs A/B (22s-paced) settled identical, A-vs-B direct compare 0 drift 0/0, single stable epoch, no sibling mutated the live world this window (HEAD bbcc74fa = sweep-117 close, stable all window); snapshot byte-identical NO rewrite, sweep-106/108/111/114/116/117 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 74th sweep since routing, no escalation due — law keys Sev 1); 265 bbox non-light / 235 classified / 0 coverage holes, SAT fresh over live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38 — post-verdict WS-dwell kill at 110s disclosed, verdict JSON fully written first, sweep-86 class; SW 5/5 @ 0.37); tier-2 96th cycle per committed pointer hall 8/8 @ 0.360 + bunkhouse 6/6 @ 0.3803 ALL PASS over overhaul-wave bytes | pins 15/15 ALL_PINS_OK 72nd consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370745 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start bbcc74fa, HEAD stable all window no re-run needed | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-120 | 2026-09-08 | 303==303 steady state (265 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 303 shared ids on id/pos/yaw/lib/scale/kind/bbox vs baseline sha16 397a3f2a3bd1a1bf — epochs A/B (20s-paced) settled identical, single stable epoch, HEAD 96304b87 sweep-119 close stable all window; snapshot byte-identical NO rewrite, sweep-106/108/111/114/116/117/118/119 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 76th sweep since routing, no escalation due — law keys Sev 1); 265 bbox non-light / 235 classified / 0 coverage holes, SAT fresh over live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 98th cycle per committed pointer stable 5/5 @ 0.396 + observatory circuit 5/5 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 74th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370745 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 96304b87 (HEAD stable all window, no re-run needed) | CLEAN SWEEP — R-121 open, known, no escalation due |
||| sweep-119 | 2026-09-08 | 303==303 steady state (265 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 303 shared ids on id/pos/yaw/lib/scale/kind/bbox vs baseline sha16 397a3f2a3bd1a1bf — epochs A/B (20s-paced) settled identical, single stable epoch; survey-68 read-only interleave @ 2ced4c68 corroborates 303 steady independently; snapshot byte-identical NO rewrite, like-for-like 7-field projection verified — a raw census-vs-snapshot byte mismatch was investigated and classified as projection artifact (comp/compKeys fields + entity order; canonical fields ZERO drift, sweep-80 law), sweep-106/108/111/114/116/117/118 precedent) | exit 3 on ONLY known R-121 lamp-n|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 75th sweep since routing, no escalation due — law keys Sev 1); 265 bbox non-light / 235 classified / 0 coverage holes, SAT fresh over live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 97th cycle per committed pointer longhouse 6/6 @ 0.346 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 73rd consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370745 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 30003521 + re-run 2ced4c68 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |


sweep-115: CLEAN SWEEP, epoch-correction tick. Census epoch A 302==302 vs the
committed sweep-114 baseline (sha16 c68fcbc9e3195567): 0 arrivals, 0 departures,
0 drift on all 302 shared ids across id/pos/yaw/scale/lib/kind/bbox -- fully
quiet first read. While tier-2 walks ran, struct-100 (R10-4 The Sierpinski
Spire) committed at e4031be5 and spawned nx-struct-sierpinski AFTER my
epoch-A census, so per the polish-270 epoch law all affected evidence was
re-taken fresh before verdicts: epoch-B census (303 final, exactly ONE arrival
= nx-struct-sierpinski @ (-7.74, -0.0301, -73.59) yaw 0 lib 7f8b5fd7a3d18b22
comp {}, tuple matching the struct-100 ledger line-for-line incl. its
idempotent 0-verb rerun claim and its own enterable two-way MCPL walk
ALL_PASS 0.375m through the open base; corroborated independently by
survey-66's census note; bbox 6.55x5.346x5.693 scale-sane, r74.1 N-meridian
antipode seat az354 answering the S-pole Koch Garden; 0 departures, ZERO
drift on all 302 shared ids), SAT re-run at epoch B (265 bbox non-light / 235
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, seventy-first sweep since routing, NOT new, no
escalation due -- the law keys on severity-1; ZERO new contacts at the
sierpinski seat, sweep-side corroboration of struct-100's own worst-gap claim
+2.87), walk-band check (nearest walked waypoint 39.2m NE leg, all others
41.5m+ -- epoch-A walks stand by construction, sweep-53 precedent), epoch-C
22s-paced re-read settled 303==303 0/0/0, battery 28/28 ALL PASS on epoch-B
bytes (comp-bearing 21 unchanged -- the arrival is comp-neutral {}, 38
lights), standing gate re-run ALL PASS real exit 0 at b93b586e after the
struct-100 + survey-66 interleaves. Overlap tier-1 profile: core 64/64 @
0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 -- all four real exit 0,
banner-stripped parse. Tier-2 93rd cycle per committed pointer: forge 6/6 @
0.375 (interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts),
both real exit 0, both over the overhaul-wave bytes. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (69th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes; interlane
md5 f6254cd0 stable, read fresh. Ledger law EXACT -- base re-read fresh
immediately before append (struct-100's D+1 absorbed mid-tick), 2370745.
Snapshot rewritten with pre-write assertions (arrival exactly
[nx-struct-sierpinski], tuple ledger-exact, 0 drift on shared ids),
post-rewrite drift vs live ZERO: 303 entities, 122168B, sha16
397a3f2a3bd1a1bf. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-116): tower-house + inn (94th cycle -- LRU chain: @115
forge/potter, @114 stable/observatory, @113 longhouse/garden-cottage, @112
hall/bunkhouse, @111 row-cottage/market, @108 market/inn, @107
garden-cottage/tower-house -- tower-house last walked sweep-107 and inn
sweep-108, now the stalest standing pair; pointer self-caught this tick: the
first draft named market+inn off a stale chain read (sweep-59 class), the
committed sweep-107 row proves tower-house @107 staler than market @111;
both walk tools verified present this tick:
interior-walk-tower-house.ts, interior-walk-inn.ts).

sweep-116: CLEAN SWEEP, steady-state tick. Census 303==303 (265 thing + 38
light) vs the committed sweep-115 baseline (sha16 397a3f2a3bd1a1bf): 0
arrivals, 0 departures, 0 drift on all 303 shared ids across
id/pos/yaw/scale/lib/kind/bbox -- epoch A fully quiet, epoch B (25s-paced
re-read) settled identical; no sibling landed this window (HEAD 4d75f82d =
sweep-115 close, stable all window). Snapshot byte-identical, NO rewrite
(sweep-106/108/111/114 precedent). Overlap: SAT fresh over the live set --
265 bbox non-light, 235 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed
to artwalk b26 choreography @ sweep-43, seventy-second sweep since routing,
NOT new, no escalation due (law keys severity-1); zero new contacts. Tier-1
4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38 (maxArrival, banner-stripped parse), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW
5/5 @ 0.37 (approach tools emit per-leg `distance`; first parse keyed
`dist` -- re-anchored on the actual schema, sweep-48 class, no verdict
impact). Tier-2 94th cycle per committed pointer: tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts) + inn 6/6 @ 0.364 (interior-walk-inn.ts),
both real exit 0, both over the overhaul-wave bytes. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (70th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370745,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start 4d75f82d (no
interleave, no re-run needed -- HEAD stable all window). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-117):
row-cottage + market (95th cycle -- LRU chain: @116 tower-house/inn, @115
forge/potter, @114 stable/observatory, @113 longhouse/garden-cottage, @112
hall/bunkhouse, @111 row-cottage/market -- row-cottage and market both last
walked sweep-111, now the stalest standing pair; both walk tools verified
present this tick: interior-walk-row-cottage.ts, interior-walk-market.ts).

sweep-117: CLEAN SWEEP, steady-state tick. Census 303==303 (265 thing +
38 light) vs the committed sweep-115 baseline (sha16 397a3f2a3bd1a1bf,
carried unchanged through sweep-116): 0 arrivals, 0 departures, 0 drift
on all 303 shared ids across id/pos/yaw/lib/scale/kind/bbox -- epoch A
fully quiet, epoch B (paced re-read) settled identical; no sibling
mutated the live world this window. survey-67 (ZAI-debt fourth pass,
read-only observer) interleaved at 113243a4 mid-tick and independently
corroborates census 303 steady 0/0/0/0. Snapshot byte-identical, NO
rewrite (sweep-106/108/111/114/116 precedent). Overlap: SAT fresh over
the live set -- 265 bbox non-light, 235 classified, 0 coverage holes,
exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
-0.407 -- known Sev 2 routed to artwalk b26 choreography @ sweep-43,
seventy-third sweep since routing, NOT new, no escalation due (law keys
severity-1); zero new contacts. Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 (maxArrival,
banner-stripped parse), NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37.
Tier-2 95th cycle per committed pointer: row-cottage 6/6 @ 0.384
(interior-walk-row-cottage.ts) + market 6/6 @ 0.389
(interior-walk-market.ts), both real exit 0, both over the overhaul-wave
bytes. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(71st consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census bytes (comp-bearing 21, 38 lights); interlane md5 f6254cd0
stable, read fresh. Ledger law EXACT -- base re-read fresh immediately
before append, 2370745, D+0/E+0. Standing gate ALL PASS real exit 0 at
tick-start daac8fea, re-run ALL PASS real exit 0 at 113243a4 after the
survey-67 interleave. Probe self-caught pre-verdict: pins checker first
invoked as .py (tool is .ts; re-run green, sweep-111 bun-vs-python
class); walk JSON parse first folded stderr banner lines into the parse
(re-anchored banner-stripped, sweep-48 schema class, no verdict impact).
Zero world mutations, zero defect notes, zero uploads, zero verbs, zero
comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-118): hall + bunkhouse (96th cycle -- LRU chain: @117
row-cottage/market, @116 tower-house/inn, @115 forge/potter, @114
stable/observatory, @113 longhouse/garden-cottage, @112 hall/bunkhouse
-- hall and bunkhouse both last walked sweep-112, now the stalest
standing pair; both walk tools verified present this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).

sweep-118: CLEAN SWEEP, steady-state tick. Census 303==303 (265 thing +
38 light) vs the committed sweep-115 baseline (sha16 397a3f2a3bd1a1bf,
carried unchanged through sweep-116/117): 0 arrivals, 0 departures, 0
drift on all 303 shared ids across id/pos/yaw/lib/scale/kind/bbox —
epoch A fully quiet, epoch B (22s-paced re-read) settled identical,
A-vs-B direct compare 0 drift 0/0; no sibling mutated the live world
this window (HEAD bbcc74fa = sweep-117 close, stable all window).
Snapshot byte-identical, NO rewrite (sweep-106/108/111/114/116/117
precedent). Overlap: SAT fresh over the live set — 265 bbox non-light,
235 classified, 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk
b26 choreography @ sweep-43, seventy-fourth sweep since routing, NOT
new, no escalation due (law keys severity-1); zero new contacts.
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0:
core 64/64 @ 0.38 (banner-stripped parse, status+rows+ok-count
anchored), NW 5/5 @ 0.38, NE 7/7 @ 0.38 (verdict JSON fully written
and full-parsed before a post-verdict WS-disconnect dwell kill at
110s — sweep-86 bunkhouse class, disclosed, no verdict impact), SW
5/5 @ 0.37. Tier-2 96th cycle per committed pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803
(interior-walk-bunkhouse.ts), both real exit 0, both over the
overhaul-wave bytes. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (72nd consecutive clean); sweep89-battery
28/28 ALL PASS exit 0 on fresh census bytes (comp-bearing 21, 38
lights); interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT
— base re-read fresh immediately before append, 2370745, D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start bbcc74fa (no
interleave, no re-run needed — HEAD stable all window). Probe
self-caught pre-verdict: first battery invocation dropped the census
argv (IndexError, tool requires the fresh census file — re-run green
on /tmp epoch-A bytes); first NW attempt ran a nonexistent
approach1-walk.ts path from a stale plan line — the true tool names
(nw-approach1-walk.ts, ne-approach2-walk.ts, sw-approach3-walk.ts)
re-derived from the standing route list at plan line 2098-2100 and
verified present before running. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use (D+0, E+0). Next tier-2 pair (sweep-119): longhouse +
garden-cottage (97th cycle — LRU chain: @118 hall/bunkhouse, @117
row-cottage/market, @116 tower-house/inn, @115 forge/potter, @114
stable/observatory, @113 longhouse/garden-cottage — longhouse and
garden-cottage both last walked sweep-113, now the stalest standing
pair; both walk tools verified present this tick:
interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).

sweep-119: CLEAN SWEEP, steady-state tick. Census 303==303 (265 thing + 38
light) vs the committed sweep-115 baseline (sha16 397a3f2a3bd1a1bf, carried
unchanged through sweep-116/117/118): 0 arrivals, 0 departures, 0 drift on
all 303 shared ids across id/pos/yaw/lib/scale/kind/bbox -- epoch A fully
quiet, epoch B (20s-paced re-read) settled identical; no sibling mutated
the live world this window. survey-68 (ZAI-debt fifth pass, read-only
observer) interleaved at 2ced4c68 mid-tick and independently corroborates
census 303 steady 0/0/0. Snapshot byte-identical, NO rewrite
(sweep-106/108/111/114/116/117/118 precedent) -- verified via like-for-like
7-field projection: a raw census-vs-snapshot byte mismatch was investigated
and classified as a projection artifact (the live census tool emits
comp/compKeys fields and its own entity order; the committed snapshot
carries the normalized 7-field projection in baseline order -- canonical
fields ZERO drift, sweep-80 law). Overlap: SAT fresh over the live set --
265 bbox non-light, 235 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed
to artwalk b26 choreography @ sweep-43, seventy-fifth sweep since routing,
NOT new, no escalation due (law keys severity-1); zero new contacts.
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core
64/64 @ 0.38 (maxArrival, banner-stripped parse), NW 5/5 @ 0.38, NE 7/7 @
0.38, SW 5/5 @ 0.37. Tier-2 97th cycle per committed pointer: longhouse
6/6 @ 0.346 (interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (73rd consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370745,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start 30003521,
re-run ALL PASS real exit 0 at 2ced4c68 after the survey-68 interleave.
Probe self-caught pre-verdict: first snapshot byte-compare compared the RAW
census payload against the normalized committed snapshot and reported a
mismatch -- re-derived via 7-field projection + baseline entity order
(sweep-55/56 class), byte-identity confirmed, no verdict impact. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-120):
stable + observatory circuit (98th cycle -- LRU chain: @119
longhouse/garden-cottage, @118 hall/bunkhouse, @117 row-cottage/market,
@116 tower-house/inn, @115 forge/potter, @114 stable/observatory --
stable and observatory both last walked sweep-114, now the stalest
standing pair; both walk tools verified present this tick:
interior-walk-stable.ts, struct2-walk-observatory.ts).

sweep-120: CLEAN SWEEP, steady-state tick. Census 303==303 (265 thing + 38
light) vs the committed sweep-115 baseline (sha16 397a3f2a3bd1a1bf, carried
unchanged through sweep-116..119): 0 arrivals, 0 departures, 0 drift on all
303 shared ids across id/pos/yaw/lib/scale/kind/bbox -- epoch A fully
quiet, epoch B (20s-paced re-read) settled identical; no sibling mutated
the live world this window (HEAD 96304b87 = sweep-119 close, stable all
window). Snapshot byte-identical, NO rewrite (sweep-106/108/111/114/116/
117/118/119 precedent). Overlap: SAT fresh over the live set -- 265 bbox
non-light, 235 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed
to artwalk b26 choreography @ sweep-43, seventy-sixth sweep since routing,
NOT new, no escalation due (law keys severity-1); zero new contacts.
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core
64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37.
Tier-2 98th cycle per committed pointer: stable 5/5 @ 0.396
(interior-walk-stable.ts) + observatory circuit 5/5 @ 0.389
(struct2-walk-observatory.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (74th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370745,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start 96304b87; HEAD
stable all window, no re-run needed. Probe self-caught pre-verdict: my
first walk-parse keyed `dist` on the three approach tools whose schema uses
`distance` (sweep-54 class; re-anchored on each tool's actual result
fields, both spellings now verified per-tool before recording). Tool-name
derivation: core-walk and battery tool names were re-derived from the plan
and directory this tick, not memory (next-walk-core-paths.ts,
sweep89-battery.py -- first-guess names for both were wrong and never ran,
sweep-118 class). Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-121): forge + potter (99th cycle -- LRU chain: @120
stable/observatory, @119 longhouse/garden-cottage, @118 hall/bunkhouse,
@117 row-cottage/market, @116 tower-house/inn -- forge and potter both
last walked sweep-115, now the stalest standing pair; both walk tools
verified present this tick: interior-walk-forge.ts, interior-walk-potter.ts).

|| sweep-121 | 2026-09-08 | 303→304 single stable epoch (266 thing + 38 light; exactly ONE domain-valid arrival nx-struct-geodesic @ (16.54,-0.0016,57.68) yaw 0 lib 813ad295487442d2 comp {} = struct-101 @ 1d9853c6 PRE-tick at tick-start HEAD, tuple matches its committed ledger line-for-line, bbox 7.1x3.625x7.1 honest room-scale; 0 departures, 0 drift on all 303 shared ids on id/pos/yaw/lib/scale/kind/bbox; epochs A/B 20s-paced identical; snapshot rewritten like-for-like 304 ents / 122571B / sha16 0d46f915cf4ebe8f, pre-write assertions, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 77th sweep since routing, no escalation due — law keys Sev 1); 266 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over live set, geodesic SAT-clean, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.33, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 99th cycle per committed pointer forge 6/6 @ 0.375 + potter 6/6 @ 0.366 ALL PASS | pins 15/15 ALL_PINS_OK 75th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370746 D+0/E+0 base re-read fresh pre-append, standing gate ALL PASS real exit 0 at 1d9853c6 from repo ROOT (first run from agents/arthur cwd tripped tex-84 repo-relative existsSync — cwd artifact, disclosed) | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-121: CLEAN SWEEP, arrival tick. Census 303->304 single stable epoch
(266 thing + 38 light): exactly ONE domain-valid arrival nx-struct-geodesic
@ (16.54, -0.0016, 57.68) yaw 0 lib 813ad295487442d2 comp {} = struct-101
@ 1d9853c6 (R10-5 The Geodesic Pavilion), committed PRE-tick at tick-start
HEAD -- tuple matches its committed ledger line-for-line, bbox
7.1x3.625x7.1 honest room-scale (dia >7m exceeds room gates, height 3.625
> 2.2, exact trimesh per its own decode); 0 departures, 0 drift on all 303
shared ids across id/pos/yaw/lib/scale/kind/bbox; epochs A and B (20s-paced)
settled identical. Snapshot rewritten like-for-like: 304 entities, 122571B,
sha16 0d46f915cf4ebe8f, pre-write assertions (exactly one arrival, zero
drift, tuple ledger-exact), post-rewrite drift vs live ZERO. Overlap: exit 3
on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407 --
known Sev 2 routed to artwalk b26 choreography @ sweep-43, seventy-seventh
sweep since routing, NOT new, no escalation due (law keys severity-1);
266 bbox non-light, 236 classified, 0 coverage holes, geodesic SAT-clean in
the live set, zero new contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0: core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.33, NE 7/7
@ 0.38, SW 5/5 @ 0.37. Tier-2 99th cycle per committed pointer: forge 6/6 @
0.375 + potter 6/6 @ 0.366, both real exit 0. Integrity: struct18-fleet-pin-
check 15/15 ALL_PINS_OK real exit 0 (75th consecutive clean); sweep89-
battery 28/28 ALL PASS exit 0 on fresh census bytes (comp-bearing 21, 38
lights); interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT 2370746
D+0/E+0, base re-read fresh immediately before append (struct-101 D+1 +
survey-69 absorbed mid-window). Standing gate ALL PASS real exit 0 at
1d9853c6 run from repo ROOT, 98 PASS / 0 FAIL. Probe self-catches
pre-verdict, both disclosed: (a) the FIRST gate run executed from
agents/arthur cwd and tripped the tex-84 check's repo-relative existsSync
(printed 1 FAILURE(S) under a laundered tail-pipe exit 0) -- re-run from
ROOT ALL PASS, no verdict impact (wrong-cwd class, kin to sweep-118); (b)
core-walk output carries the [physics] banner line before the JSON
(sweep-35 class, stripped before parse). PLAN-EDIT self-catches, repaired
before commit: the first history-row patch fuzzy-matched, duplicated the
Next token, and flipped -- to an em-dash inside sweep-120's pointer block
(adjacent-token-bleed class, sweep-43/50 family) -- restored byte-faithful
via a second patch, verified by re-read; the first prose-append attempt
carried a polluted draft (wrong totals, garbled LRU) caught by anchor
asserts before any write (sweep-55 class). Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use (D+0, E+0). Next tier-2 pair (sweep-122): tower-house + inn (100th
cycle -- LRU chain: @121 forge/potter, @120 stable/observatory, @119
longhouse/garden-cottage, @118 hall/bunkhouse, @117 row-cottage/market,
@116 tower-house/inn -- tower-house and inn both last walked sweep-116,
now the stalest standing pair; both walk tools verified present on disk
this tick: interior-walk-tower-house.ts, interior-walk-inn.ts).

||| sweep-122 | 2026-09-08 | 304==304 (266 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 304 shared ids on id/pos/yaw/lib/scale/kind/bbox vs sweep-121 baseline sha16 0d46f915cf4ebe8f; epochs A/B 20s-paced identical, single stable epoch, HEAD 828e65c6 sweep-121 close stable all window; snapshot byte-identical NO rewrite sweep-106..121 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 78th sweep since routing, no escalation due — law keys Sev 1); 266 bbox non-light / 236 classified / 0 coverage holes, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 100th cycle per committed pointer tower-house 6/6 @ 0.3765 + inn 6/6 @ 0.364 ALL PASS | pins 15/15 ALL_PINS_OK 76th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT D+0/E+0 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start 828e65c6 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-122: CLEAN SWEEP, steady-state tick. Census 304==304 (266 thing + 38
light) vs the committed sweep-121 baseline (sha16 0d46f915cf4ebe8f): 0
arrivals, 0 departures, 0 drift on all 304 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical; no sibling mutated the live world this window
(HEAD 828e65c6 = sweep-121 close, stable all window). Snapshot
byte-identical, NO rewrite (sweep-106..121 precedent; 7-field projection
law). Overlap: SAT fresh over the live set -- 266 bbox non-light, 236
classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, seventy-eighth sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 100th
cycle per committed pointer: tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts) + inn 6/6 @ 0.364 (interior-walk-inn.ts),
both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK
real exit 0 (76th consecutive clean); sweep89-battery 28/28 ALL PASS exit
0 on fresh census bytes (comp-bearing 21, 38 lights); interlane md5
f6254cd0 stable, read fresh. Ledger law EXACT -- base re-read fresh
immediately before append, 2370746, D+0/E+0. Standing gate ALL PASS real
exit 0 at tick-start 828e65c6 run from repo ROOT. Probe self-caught
pre-verdict: the core-walk pipe stripped the [physics] banner AND laundered
the exit code through grep (polish-270 content-anchor class -- verdict
anchored on status ALL_PASS + 64/64 ok + maxArrival 0.38 from the parsed
JSON, not the pipe exit); the first result-parse keyed `legs` (an int
count) where the schema puts the array in `results` (re-keyed, sweep-48
per-tool schema class); the census diff heredoc was parser-blocked on the
`&` operator and re-run as a saved script (sanctioned retry). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-123):
row-cottage + market (101st cycle -- LRU chain: @122 tower-house/inn, @121
forge/potter, @120 stable/observatory, @119 longhouse/garden-cottage,
@118 hall/bunkhouse, @117 row-cottage/market -- row-cottage and market
both last walked sweep-117, now the stalest standing pair; both walk
tools verified present this tick: interior-walk-row-cottage.ts,
interior-walk-market.ts).
||| sweep-123 | 2026-09-08 | 304==304 (266 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 304 shared ids on id/pos/yaw/lib/scale/kind/bbox vs sweep-122 baseline sha16 0d46f915cf4ebe8f; epochs A/B 20s-paced identical, single stable epoch, HEAD cdb5654d sweep-122 close stable all window; snapshot byte-identical NO rewrite sweep-106..122 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 79th sweep since routing, no escalation due — law keys Sev 1); 266 bbox non-light / 236 classified / 0 coverage holes, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 101st cycle per committed pointer row-cottage 6/6 @ 0.384 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 77th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370746 D+0/E+0 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start cdb5654d from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-123: CLEAN SWEEP, steady-state tick. Census 304==304 (266 thing + 38 light) vs the committed sweep-122 baseline (sha16 0d46f915cf4ebe8f): 0 arrivals, 0 departures, 0 drift on all 304 shared ids across id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced re-read) settled identical; no sibling mutated the live world this window (HEAD cdb5654d = sweep-122 close, stable all window). Snapshot byte-identical, NO rewrite (sweep-106..122 precedent; 7-field projection law). Overlap: SAT fresh over the live set -- 266 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26 choreography @ sweep-43, seventy-ninth sweep since routing, NOT new, no escalation due (law keys severity-1); zero new contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 101st cycle per committed pointer: row-cottage 6/6 @ 0.384 (interior-walk-row-cottage.ts) + market 6/6 @ 0.389 (interior-walk-market.ts), both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (77th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes (comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT -- base re-read fresh immediately before append, 2370746, D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start cdb5654d run from repo ROOT. Probe disclosed: the SAT run's exit code was laundered through a tail pipe (polish-270 content-anchor class -- verdict anchored on the printed 266/236/1 lines and the single known unclassified pair, not the pipe exit). Zero world mutations, zero defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-124): hall + bunkhouse (102nd cycle -- LRU chain: @123 row-cottage/market, @122 tower-house/inn, @121 forge/potter, @120 stable/observatory, @119 longhouse/garden-cottage, @118 hall/bunkhouse -- hall and bunkhouse both last walked sweep-118, now the stalest standing pair; both walk tools verified present on disk this tick: interior-walk-hall.ts, interior-walk-bunkhouse.ts).
||| sweep-124 | 2026-09-08 | 304→305 (267 thing + 38 light; exactly ONE domain-valid arrival nx-struct-catenoid @ (26.30, -0.0518, -53.93) yaw 1.570796 lib 8ac664937f96976d comp {} — struct-102 deferred contract executed live = struct-103 in flight, placer next-place-struct103.ts pins this exact tuple+sha, ledger/commit not yet landed at tick-start HEAD 7742e835 (artwalk-65/66 work-in-flight class); 0 departures, 0 drift on all 304 shared ids vs baseline sha16 0d46f915cf4ebe8f; epochs A/B 20s-paced identical, single stable epoch; snapshot rewritten 305/123015B/sha16 264972880556e91c asserted, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 80th sweep since routing, no escalation due — law keys Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over live set, catenoid SAT-clean, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 102nd cycle per committed pointer hall 8/8 @ 0.360 + bunkhouse 6/6 @ 0.3803 ALL PASS | pins 15/15 ALL_PINS_OK 78th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370746 D+0/E+0 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start 7742e835 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-125 | 2026-09-08 | 305==305 (267 thing + 38 light; epoch A fully quiet 0/0/0 vs sweep-124 baseline sha16 264972880556e91c; epoch B exactly ONE classified drift field = nx-struct-slidingladder yaw 0→2π/9 (0.6981317007977318) same pos same lib same bytes = struct-104 @ 9cdd3b23 committed mid-tick (survey-70 identity cure, yaw-only re-seat, ledger-matched), domain-valid not drift; 0 arrivals, 0 departures; snapshot rewritten 305/120293B/sha16 124f64699e4dcd6e asserted, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 81st sweep since routing, no escalation due — law keys Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, SAT run at epoch A + re-run at epoch B over the rotated ladder bytes, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38 epoch A + 7/7 re-walk at epoch B over the struct-104 bytes — ladder 19.0m off the NE route, inside the re-verify band, sweep-58 precedent; SW 5/5 @ 0.37); tier-2 103rd cycle per committed pointer longhouse 6/6 @ 0.346 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 79th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start 02aad838 + re-run at 9cdd3b23 post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-126 | 2026-09-08 | 305==305 (267 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 305 shared ids on id/pos/yaw/lib/scale/kind/bbox vs sweep-125 baseline sha16 124f64699e4dcd6e; epochs A/B 20s-paced identical, single stable epoch, HEAD a2dae3f0 sweep-125 close stable all window; snapshot byte-identical NO rewrite sweep-106..125 precedent)
| sweep-127 | 2026-09-08 | 305==305 (267 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 305 shared ids on id/pos/yaw/lib/scale/kind/bbox vs sweep-126 baseline sha16 124f64699e4dcd6e; epochs A/B 20s-paced identical, single stable epoch, HEAD 8ffbdfa5 sweep-126 close stable all window; snapshot byte-identical NO rewrite sweep-106..126 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 83rd sweep since routing, no escalation due — law keys Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 105th cycle per committed pointer forge 6/6 @ 0.375 + potter 6/6 @ 0.366 ALL PASS | pins 15/15 ALL_PINS_OK 81st consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370749 D+0/E+0 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start 8ffbdfa5 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due | | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 82nd sweep since routing, no escalation due — law keys Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 104th cycle per committed pointer stable 5/5 @ 0.396 + observatory 5/5 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 80th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370749 D+0/E+0 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start a2dae3f0 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-128 | 2026-09-08 | 305==305 steady state (267 thing + 38 light; epoch A fully quiet 0/0/0 vs sweep-127 baseline sha16 124f64699e4dcd6e, epoch B 20s-paced identical — single stable epoch, no sibling mutated the live world this window; snapshot byte-identical NO rewrite, sweep-106..127 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 84th sweep since routing, no escalation due — law keys Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 106th cycle per committed pointer tower-house 6/6 @ 0.3765 + inn 6/6 @ 0.3640 ALL PASS (LRU chain: @127 forge/potter, @126 stable/observatory, @125 longhouse/garden-cottage, @124 hall/bunkhouse, @123 row-cottage/market, @122 tower-house/inn — stalest pair; ledger one-line prose said hall+bunkhouse, the plan's LRU chain governs, discrepancy disclosed) | pins 15/15 ALL_PINS_OK 82nd consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370749 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start d34a2a5f from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-129 | 2026-09-08 | 305==305 steady state (267 thing + 38 light; epoch A fully quiet 0/0/0 vs sweep-128 baseline sha16 124f64699e4dcd6e, epoch B 20s-paced identical raw sha16 55fd88ac029e432f both epochs — single stable epoch, no sibling mutated the live world this window (survey-73 read-only observer interleave at be911348, zero mutations); snapshot byte-identical NO rewrite, sweep-106..128 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 85th sweep since routing, no escalation due — law keys Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 107th cycle per committed pointer row-cottage 6/6 @ 0.3838 + market 6/6 @ 0.3894 ALL PASS (LRU chain: @128 tower-house/inn, @127 forge/potter, @126 stable/observatory, @125 longhouse/garden-cottage, @124 hall/bunkhouse, @123 row-cottage/market — stalest pair honored) | pins 15/15 ALL_PINS_OK 83rd consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370749 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start f3ade7f1 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-130 | 2026-09-08 | 305==305 steady state (267 thing + 38 light; epoch A fully quiet 0/0/0 vs sweep-129 baseline sha16 124f64699e4dcd6e, epoch B 20s-paced identical raw sha16 55fd88ac029e432f both epochs — single stable epoch, no sibling mutated this world window; snapshot byte-identical NO rewrite, sweep-106..129 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 86th sweep since routing, no escalation due — law keys Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 108th cycle per committed pointer hall 8/8 @ 0.360 + bunkhouse 6/6 @ 0.380 ALL PASS (LRU chain: @129 row-cottage/market, @128 tower-house/inn, @127 forge/potter, @126 stable/observatory, @125 longhouse/garden-cottage, @124 hall/bunkhouse — stalest pair honored) | pins 15/15 ALL_PINS_OK 84th consecutive, battery 28/28 exit 0 both epochs (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370749 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start eea065bd from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-131 | 2026-09-08 | 305==305 steady state (267 thing + 38 light; epoch A fully quiet 0/0/0 vs sweep-130 baseline sha16 124f64699e4dcd6e, epoch B 20s-paced identical raw sha16 55fd88ac029e432f both epochs — single stable epoch, no sibling mutated this world window (survey-75 read-only observer interleave at ea06284b, zero mutations per its own ledger line, its census 305 0/0/0 corroborates); snapshot byte-identical NO rewrite, sweep-106..130 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 87th sweep since routing, no escalation due — law keys Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 109th cycle per committed pointer longhouse 6/6 @ 0.346 + garden-cottage 6/6 @ 0.355 ALL PASS (LRU chain: @130 hall/bunkhouse, @129 row-cottage/market, @128 tower-house/inn, @127 forge/potter, @126 stable/observatory, @125 longhouse/garden-cottage — stalest pair honored) | pins 15/15 ALL_PINS_OK 85th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370749 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start 6a673c42 + re-run 98/0 at ea06284b from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-132 | 2026-09-08 | 305→306 (+1 domain-valid arrival nx-struct-hilbertlabyrinth @ (-6.98,-0.01822,99.76) yaw pi lib 38d3bb8f49a08af9 comp {} = struct-105 R10-7 @ 11ff8cba committed PRE-tick, tick-start HEAD carries it, census 305->306 per its own ledger line, tuple matches line-for-line, bbox 8.42x2.925x8.42 scale-sane, r~100 N — beyond every walked leg; 0 departures, 0 drift on 305 shared ids; epochs A/B 20s-paced identical raw sha16 4ac1f73a02f71ec4 both — single stable epoch; snapshot rewritten 306/120713B/sha16 c1514c2339552894 via sweep-125 chassis, post-rewrite drift ZERO, diff 35 ins/1 del) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 88th sweep since routing, no escalation due — law keys Sev 1); 268 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set incl. the arrival (corroborates struct-105's own +7.03m), zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — labyrinth >80m off every leg, no re-walk band, struct-105 re-proved its own 35-leg walk) + tier-2 110th cycle per committed pointer stable 5/5 @ 0.40 + observatory 5/5 @ 0.39 ALL PASS | pins 15/15 ALL_PINS_OK 86th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370752 base re-read fresh pre-append (struct-105 D+1/E+2 absorbed), gate ALL PASS real exit 0 at tick-start 11ff8cba from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-133 | 2026-09-08 | 306==306 steady state (268 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 306 shared ids across id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-132 baseline sha16 c1514c2339552894 — epochs A/B 20s-paced identical raw sha16 4ac1f73a02f71ec4 both, single stable epoch; no sibling mutated the live world this window — survey-76 read-only observer interleave at c6ccc579, zero mutations per its own ledger line, its census 306 corroborates; snapshot byte-identical NO rewrite, sweep-106..132 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 89th sweep since routing, no escalation due — law keys Sev 1); 268 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 111th cycle per committed pointer row-cottage 6/6 @ 0.3838 + market 6/6 @ 0.3894 ALL PASS | pins 15/15 ALL_PINS_OK 87th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370752 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start 76b9e71c + re-run 98/0 at c6ccc579 post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-134 | 2026-09-08 | 306==306 steady state (268 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 306 shared ids across id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-132 baseline sha16 c1514c2339552894 — epochs A/B/C identical raw sha16 4ac1f73a02f71ec4, single stable epoch; one sibling commit interleaved mid-tick: struct-106 dodecahedron BUILD-ONLY @ fc7db189, placement deferred per its own ledger line, no world mutation, epoch C post-interleave census corroborates 306 unchanged; snapshot byte-identical NO rewrite, sweep-106..133 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 90th sweep since routing, no escalation due — law keys Sev 1); 268 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 112th cycle per committed pointer forge 6/6 @ 0.375 + potter 6/6 @ 0.366 ALL PASS | pins 15/15 ALL_PINS_OK 88th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370752 base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start b156db9e + re-run 99/0 at fc7db189 post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-135 | 2026-09-08 | 306==306 steady state (268 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 306 shared ids across id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-132 baseline sha16 c1514c2339552894 — epochs A/B/C identical raw sha16 4ac1f73a02f71ec4, single stable epoch; one sibling commit interleaved mid-tick: survey-77 rotating district pass @ a90c2905, read-only observer per its own ledger line (plan files only), zero world mutations, epoch C post-interleave census corroborates 306 unchanged; snapshot byte-identical NO rewrite, sweep-106..134 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 91st sweep since routing, no escalation due — law keys Sev 1); 268 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 113th cycle per committed pointer inn 6/6 @ 0.364 + tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 ALL_PINS_OK 89th consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370752 base re-read fresh pre-append (ledger landed BEFORE the survey-77 interleave; base was quiet at append), gate ALL PASS real exit 0 at tick-start bfbbe48f + re-run 98/0 at a90c2905 post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-136 | 2026-09-08 | 306→307 (269 thing + 38 light) across epochs A→C: epoch A fully quiet 306==306 vs baseline c1514c2339552894 raw sha16 4ac1f73a02f71ec4; epochs B/C 20s-paced identical at 307 — exactly ONE arrival nx-struct-dodecahedron @ (−7.67,−0.0289,109.73) yaw π lib 671b99124ba55182 comp {} = struct-107 @ 11920ec7 committed mid-tick, tuple matches its ledger line line-for-line (pos/yaw/lib/comps, census 306→307 per its own entry; live lib 671b… is the v2c night-bead-cure rebuild its entry names, not the build-only e30b… sha), 0 departures, 0 drift on 306 shared ids across id/pos/yaw/lib/scale/kind/bbox; survey-78 @ d2e5335b read-only observer interleave absorbed; snapshot rewritten 307/121148B/sha16 0fd137c936560a28 sweep-132 chassis, post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 92nd sweep since routing, no escalation due — law keys Sev 1); 269 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the arrival-inclusive live set, dodecahedron SAT-clean, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; composite walk batch hit the 420s tool timeout AFTER all four tools completed — logs parsed per-tool schema, no re-run needed, sweep-135 disclosed class) + tier-2 114th cycle per committed pointer hall 8/8 @ 0.36 + bunkhouse 6/6 @ 0.3803 ALL PASS | pins 15/15 ALL_PINS_OK 90th consecutive, battery 28/28 exit 0 on fresh census-C bytes (comp-bearing 21, 38 lights), interlane f6254cd0 stable read fresh, ledger law EXACT 2370753 base re-read fresh pre-append (struct-107 D+1 + survey-78 D+0 absorbed mid-tick), gate ALL PASS real exit 0 at tick-start 3fb49918 + re-run at d2e5335b post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-137 | 2026-09-08 | 307==307 steady state (269 thing + 38 light; 0 arrivals, 0 departures, 0 drift on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-136 baseline sha16 0fd137c936560a28; epochs A/B 20s-paced identical raw sha16 084c22ed2a6b427d single stable epoch, no sibling mutated this window; snapshot byte-identical NO rewrite) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 93rd sweep since routing, no escalation due — law keys Sev 1); 269 bbox non-light / 236 classified / 0 coverage holes, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 115th per committed pointer longhouse 6/6 @ 0.3456 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 91st consecutive; battery 28/28 (comp-bearing checks per tool, 38 lights); interlane f6254cd0 stable read fresh; ledger law EXACT 2370753 base re-read fresh pre-append; gate ALL PASS real exit 0 at tick-start 6cea9e13 + re-run post-evidence from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-138 | 2026-09-08 | 307→308 (270 thing + 38 light) across epochs A→C: epoch A fully quiet 307==307 raw sha16 084c22ed2a6b427d identical to sweep-137's close; epochs B/C 20s-paced settled at 308 with exactly ONE domain-valid arrival nx-struct-sunflowerdial @ (2.48, 0.0189, 70.96) yaw π lib 3f271a10fff20cc1 comp {} = struct-108 @ 1147cbda committed mid-tick, tuple matches its ledger line line-for-line; 0 departures, 0 drift on 307 shared ids; snapshot rewritten 121587B / 308 ents / sha16 491682d9a5c07a09, post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 94th sweep since routing, no escalation due — law keys Sev 1); SAT re-run at epoch B over arrival-inclusive set: 270 bbox non-light / 236 classified / 0 coverage holes, zero new contacts, sunflowerdial SAT-clean (corroborates struct-108's own +1.78 needlerest) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38 — first run printed complete ALL_PASS JSON 7/7 but exited 124 = post-verdict open-handle timeout kill, one paced re-run returned real exit 0, SW 5/5 @ 0.37; arrival r71 S 51m+ off every walked leg, walks stand by construction, sweep-53/136 precedent) + tier-2 116th per committed pointer stable 5/5 @ 0.396 + observatory 5/5 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 92nd consecutive; battery 28/28 on fresh census-A bytes; interlane f6254cd0 stable read fresh; ledger law EXACT 2370754 base re-read fresh pre-append (struct-108 D+1 absorbed); gate ALL PASS real exit 0 at tick-start 49bd330c + re-run at 1147cbda post-evidence from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-139 | 2026-09-08 | 308==308 steady state (270 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 308 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-138 baseline sha16 491682d9a5c07a09; epochs A/B 20s-paced identical raw sha16 e1891c431dcf0e9c single stable epoch, no sibling mutated the live world this window — survey-79 read-only observer interleave @ 80927a5b, zero mutations per its own ledger line, epoch B corroborates; snapshot byte-identical NO rewrite, sweep-106..138 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 95th sweep since routing, no escalation due — law keys Sev 1); 270 bbox non-light / 236 classified / 0 coverage holes, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 117th per committed pointer row-cottage 6/6 @ 0.384 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 93rd consecutive; battery 28/28 on fresh census-A bytes; interlane f6254cd0 stable read fresh; ledger law EXACT 2370754 base re-read fresh pre-append; gate ALL PASS real exit 0 at tick-start 42247ab5 + re-run at 80927a5b post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-140 | 2026-09-08 | 308→309 arrival (271 thing + 38 light; exactly ONE domain-valid arrival nx-struct-rule30wall @ (−8.37,0.3872,119.71) yaw 0 lib e70161322c42c2eb comp {} = struct-109 @ c5f154af committed PRE-tick (sweep-139's window closed before the placement verbs), live tuple matches its ledger line-for-line (az184 r120, census 308→309 per its own entry); 0 departures, 0 drift on 308 shared ids on id/pos/yaw/lib/scale/kind/bbox; epochs A/B 20s-paced identical raw sha16 61dcec449edc3149 single stable epoch, no sibling mutated this window — survey-80/81 read-only observers @ b1809c59/b3ea710a interleaved, zero mutations per their own ledger lines, epoch B corroborates; snapshot rewritten 309/122015B/sha16 f9c7338a758dbe50, pre-write assertions, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 96th sweep since routing, no escalation due — law keys Sev 1); 271 bbox non-light / 236 classified / 0 coverage holes, rule30wall SAT-clean in the live set (zero new contacts, corroborates struct-109's own +6.19 dodecahedron fresh-308 gate) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; arrival r119.9 S 100m+ off every tier-1 waypoint — walks stand by construction, sweep-53/136/138 precedent); tier-2 118th per committed pointer longhouse 6/6 @ 0.3456 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 94th consecutive; battery 28/28 on fresh census-A bytes; interlane f6254cd0 stable read fresh; ledger law EXACT 2370755 base re-read fresh pre-append; gate ALL PASS real exit 0 at tick-start c5f154af + re-run at b3ea710a post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-141 | 2026-09-08 | 309→310 across epochs A→B (272 thing + 38 light at epoch B; epoch A fully quiet 309==309 0/0/0 raw sha16 61dcec449edc3149 identical to sweep-140's close; epoch B 20s-paced re-read caught exactly ONE domain-valid arrival nx-struct-tesseract @ (−9.07,0.1479,129.68) yaw 0 lib 4c14467776d58748 scale 1 comp {} = struct-110 in flight, uncommitted placer next-place-struct110.ts pins exactly this tuple line-for-line (sweep-30/91 uncommitted-placer class), bbox 9.12×5.45×9.12 scale-sane, r130.1 S az184 extending the S mathematics axis beyond rule30wall; 0 departures, 0 drift on 309 shared ids on id/pos/yaw/lib/scale/kind/bbox at both epochs; survey-82/83 read-only observers @ 0beca1a3/9a3878a2 interleaved, zero mutations per their own ledger lines, epoch B corroborates their 309==309 holds; snapshot rewritten 310/122425B/sha16 26747e696973d352, pre-write assertions, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 97th sweep since routing, no escalation due — law keys Sev 1); SAT run epoch A 271/236/0 + re-run at epoch B over the arrival-inclusive set 272/236/0, zero coverage holes, tesseract SAT-clean (zero new contacts) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; arrival r130.1 S 110m+ off every tier-1 waypoint — walks stand by construction, sweep-53/136/138/140 precedent); tier-2 119th per committed pointer hall 8/8 @ 0.360 + bunkhouse 6/6 @ 0.3803 ALL PASS | pins 15/15 ALL_PINS_OK 95th consecutive; battery 28/28 on fresh census-A bytes; interlane f6254cd0 stable read fresh; ledger law EXACT 2370755 base re-read fresh pre-append (survey-82/83 observer holds D+0/E+0); gate ALL PASS real exit 0 at tick-start 0beca1a3 + re-run 9a3878a2 post-arrival both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-142 | 2026-09-08 | 310==310 steady state both epochs (272 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 310 shared ids across id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-141 baseline sha16 26747e696973d352; live /geom now emits lib as store/<sha16>.glb + null-for-lights — same hashes, representation change, normalized like-for-like per sweep-35 discipline (server.ts/world.ts modified in-tree, sibling lane); epochs A/B 20s-paced identical — single stable epoch; survey-84 @ 9e225a1b read-only interleave absorbed, zero mutations per its own ledger line, my epoch B corroborates 310==310; NO snapshot rewrite — baseline remains current) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 98th sweep since routing, no escalation due — law keys Sev 1); 272 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37); tier-2 120th cycle per committed pointer inn 6/6 @ 0.364 + tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 ALL_PINS_OK 96th consecutive; battery 28/28 on fresh census-A bytes; interlane f6254cd0 stable read fresh; ledger law EXACT (tool-verified at append); gate ALL PASS real exit 0 at tick-start 222d5981 + re-run 9e225a1b post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-143 | 2026-09-08 | 310==310 steady state both epochs (272 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 310 shared ids across id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-142 baseline sha16 26747e696973d352 under the known store/-prefix representation epoch; raw sha16 a7660d429480d0f1 BYTE-IDENTICAL epochs A/B — single stable epoch, no sibling mutated the live world this window; snapshot byte-identical NO rewrite, sweep-106..142 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 99th sweep since routing, no escalation due — law keys Sev 1); 272 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 121st cycle per committed pointer forge 6/6 @ 0.375 + potter 6/6 @ 0.366 ALL PASS | pins 15/15 ALL_PINS_OK 97th consecutive, battery 28/28 exit 0 on fresh census-A bytes, interlane f6254cd0 stable read fresh, ledger law EXACT base re-read fresh pre-append, gate ALL PASS real exit 0 at tick-start 57428bc0 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-144 | 2026-09-08 | 310→311 arrival tick single stable epoch (273 thing + 38 light; exactly ONE domain-valid arrival nx-struct-lorenz @ (−9.77,−0.0279,139.66) yaw 0 lib 77b59dbbcb8bfb59 comp {} = struct-111 @ 178aa7ad PRE-tick at tick-start HEAD, tuple matches its committed ledger line-for-line, bbox 5.332×7.039×7.076 scale-sane r140.6 S-axis; 0 departures, 0 drift on all 310 shared ids on id/pos/yaw/lib/scale/kind/bbox; epochs A/B 20s-paced byte-identical raw sha16 56d2eb580a0844be; snapshot rewritten like-for-like 311 ents / 122844B / sha16 460774e12507efb2, pre-write assertions, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 100th sweep since routing, no escalation due — law keys Sev 1); 273 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, lorenz SAT-clean, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; arrival 100m+ off every leg, walks also run fresh per law) + tier-2 122nd cycle per committed pointer stable 5/5 @ 0.396 + observatory 5/5 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK 98th consecutive, battery 28/28 exit 0 on fresh census-A bytes, interlane f6254cd0 stable read fresh, ledger law EXACT 2370757 base re-read fresh pre-append D+0/E+0, gate ALL PASS real exit 0 at tick-start 178aa7ad from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-145 | 2026-09-08 | 311==311 steady state both epochs (273 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 311 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-144 baseline sha16 460774e12507efb2; epochs A/B 20s-paced byte-identical raw sha16 56d2eb580a0844be; no snapshot rewrite — baseline current, sweep-106..144 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 101st sweep since routing, no escalation due — law keys Sev 1); 273 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 123rd cycle per committed pointer inn 6/6 @ 0.364 + tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 ALL_PINS_OK 99th consecutive, battery 28/28 exit 0 on fresh census-A bytes, interlane f6254cd0 stable read fresh, ledger law EXACT base re-read fresh pre-append D+0/E+0, gate ALL PASS real exit 0 at tick-start 6dcbd8d9 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-146 | 2026-09-08 | 311→312 epoch-corrected (epoch A fully quiet 311==311 vs committed sweep-144 baseline sha16 460774e12507efb2: 0 arrivals, 0 departures, 0 drift on all 311 shared ids across id/pos/yaw/lib/scale/kind/bbox; epoch B post-walk-battery caught exactly ONE domain-valid arrival nx-struct-chladni @ (−10.46,−0.0351,149.63) yaw 0 lib e7fdc231dc9788d3 scale 1 comp {} = struct-112 @ d6e731f9 PRE-tick, tuple ledger-exact line-for-line (sha, az184 r150 S-axis 10m cadence behind lorenz, census 311→312 PLACED_VERIFIED corroborated sweep-side); 0 departures, 0 drift on 311 shared ids both epochs; survey-93/94 read-only interleaves absorbed; snapshot rewritten 123242B / 312 ents / sha16 cd7dd2a21cd8327d, pre-write assertions (exactly one arrival, 0 departures, 0 drift, tuple as observed), post-rewrite drift ZERO) | 274 bbox non-light / 236 classified / 0 coverage holes, SAT run epoch A 273-set + re-run epoch B 274-set, exit 3 on exactly ONE unclassified = R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 102nd sweep since routing, no escalation due — law keys Sev 1); chladni SAT-clean zero new contacts (+5.90 corroborated) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; arrival r150 S 130m+ off every leg, walks stand by construction sweep-53 precedent, also run fresh per law); tier-2 124th cycle per committed pointer: hall 8/8 @ 0.360 + bunkhouse 6/6 @ 0.3803, both real exit 0 | pins 15/15 ALL_PINS_OK (100th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-B bytes (comp-bearing 21, lights 38, R-121 tuple-stable pin green), interlane md5 f6254cd0 stable read fresh, ledger law EXACT 2370758 (struct-112 D+1 absorbed, base re-read fresh pre-append), standing gate ALL PASS real exit 0 at tick-start d35ba964 + re-run ALL PASS real exit 0 at 1c83ca7a post-arrival, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-147 | 2026-09-08 | 312==312 fully quiet BOTH epochs (274 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 312 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-146 baseline sha16 cd7dd2a21cd8327d; epochs A/B 20s-paced byte-identical raw sha16 1c1337a9025c3117 — single stable epoch; mid-tick HEAD advances survey-95/96 both read-only D+0/E+0 holds, corroborated; no snapshot rewrite — baseline current, sweep-106..146 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 103rd sweep since routing, no escalation due — law keys Sev 1); 274 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 125th cycle per committed pointer longhouse 6/6 @ 0.3456 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 101st consecutive, battery 28/28 exit 0 on fresh census-A bytes, interlane f6254cd0 stable read fresh, ledger law EXACT base re-read fresh pre-append D+0/E+0, gate ALL PASS real exit 0 at tick-start 4eca2554 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-148 | 2026-09-08 | 312==312 fully quiet BOTH epochs (274 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 312 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-147-era baseline sha16 cd7dd2a21cd8327d; epochs A/B 20s-paced byte-identical raw sha16 6e90180315a0676d — single stable epoch; REPRESENTATION EPOCH noted: live /geom now also emits comp/compKeys on every entity and omits bbox on lights (was null) — 662 all-field diffs are schema-only, comp VALUES match standing fleet pins, classified sweep-56/142 class, no snapshot rewrite, baseline current) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 104th sweep since routing, no escalation due — law keys Sev 1); 274 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — first chained run hit the 400s tool timeout on the SW leg, one paced retry per malformed-live-response discipline returned ALL_PASS) + tier-2 126th cycle per committed pointer stable 5/5 @ 0.3958 + market 6/6 @ 0.3894 ALL PASS | pins 15/15 ALL_PINS_OK 102nd consecutive, battery 28/28 exit 0 on fresh census-A bytes (comp-bearing 21 census-matched under the new comp-bearing representation), interlane f6254cd0 stable read fresh, ledger law EXACT (tool self-verifies pre/post append) D+0/E+0, gate ALL PASS real exit 0 at tick-start d8e8da99 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-149 | 2026-09-08 | 312==312 fully quiet BOTH epochs (274 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 312 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-146-era baseline sha16 cd7dd2a21cd8327d; REPRESENTATION EPOCH #3: live /geom flipped BACK to the sweep-147-era schema — tris/parent fields restored, compKeys dropped, mounts null→{} — epochs A/B 20s-paced byte-identical raw sha16 1c1337a9025c3117 which equals sweep-147's recorded raw sha (epoch-A capture BYTE-IDENTICAL to sweep-147-raw 92218B by cmp; vs sweep-148's 6e90180315a0676d capture diffs are exactly compKeys↔tris + mounts + entity order, comp VALUES and all canonical fields identical — server-side schema flip-back, sibling server lane in flight, classified like-for-like per sweep-80 law, no world change, no snapshot rewrite, baseline current) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 105th sweep since routing, no escalation due — law keys Sev 1); 274 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 127th cycle per committed pointer inn 6/6 @ 0.3640 + tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 ALL_PINS_OK 103rd consecutive, battery 28/28 exit 0 on fresh census-B bytes, interlane f6254cd0 stable read fresh, ledger law EXACT (tool self-verifies pre/post append) D+0/E+0, gate ALL PASS real exit 0 at tick-start c2f569e8 + re-run ALL PASS exit 0 at 0bb00948 post-interleave (survey-103 read-only hold), both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-150 | 2026-09-08 | 312==312 fully quiet BOTH epochs (274 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 312 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-146-era baseline sha16 cd7dd2a21cd8327d; REPRESENTATION EPOCH #4: schema flipped back to the sweep-148-era compKeys representation — raw sha16 6e90180315a0676d equals sweep-148's recorded raw, compKeys on all 312 entities, zero tris on things, canonical fields identical proven by the zero-diff — same server-lane flap class as #2/#3, no world change, no snapshot rewrite, baseline current; epochs A/B 20s-paced BYTE-IDENTICAL single stable epoch; mid-tick HEAD advance survey-106 0add15b4 read-only D+0/E+0 hold corroborates quiet) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 106th sweep since routing, no escalation due — law keys Sev 1); 274 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 128th cycle per committed pointer forge 6/6 @ 0.375 + potter 6/6 @ 0.366 ALL PASS | pins 15/15 ALL_PINS_OK 104th consecutive, battery 28/28 exit 0 on fresh census-A bytes, interlane f6254cd0 stable read fresh, ledger law EXACT (tool self-verifies pre/post append) D+0/E+0, gate ALL PASS real exit 0 at tick-start eb525201 + re-run ALL PASS exit 0 at 0add15b4 post-interleave (survey-106 read-only hold), both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-151 | 2026-09-08 | 312==312 fully quiet BOTH epochs (274 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 312 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-146-era baseline sha16 cd7dd2a21cd8327d; representation epoch #4 stable — epochs A/B 20s-paced byte-identical raw sha16 6e90180315a0676d; mid-tick HEAD advance survey-109 d830ffbc read-only D+0/E+0 hold corroborates the quiet epoch; no snapshot rewrite — baseline current, sweep-106..150 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 107th sweep since routing, no escalation due — law keys Sev 1); 274 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 129th cycle per committed pointer hall 8/8 @ 0.360 + bunkhouse 6/6 @ 0.3803 ALL PASS | pins 15/15 ALL_PINS_OK 105th consecutive, battery 28/28 exit 0 on fresh census-A bytes, interlane f6254cd0 stable read fresh, ledger law EXACT 2370758 D+0/E+0 (pointer self-catch pre-commit: first-draft next-pair named market, committed-table derivation corrected to row-cottage+observatory, disclosed in prose), gate ALL PASS real exit 0 at tick-start af4a145e + re-run ALL PASS exit 0 at d830ffbc post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-152 | 2026-09-08 | 312→313 epoch-corrected (epoch A 312==312 fully quiet vs committed sweep-146-era baseline sha16 cd7dd2a21cd8327d: 0 arrivals, 0 departures, 0 drift on all 312 shared ids across id/pos/yaw/lib/scale/kind/bbox; epochs A/B (20s-paced) byte-identical raw sha16 6e90180315a0676d, representation epoch #4 stable; struct-114 @ ecd059c6 placed nx-struct-voronoi AFTER epoch B = epoch C: exactly ONE domain-valid arrival nx-struct-voronoi @ (−11.16,−0.04643,159.61) yaw 0 scale 1 lib 00b94c926392cece comp {}, tuple matches struct-113/114 ledger lines line-for-line (sha == struct-113's pinned x3-deterministic build hash; struct-114's own PLACED_VERIFIED census 312→313 corroborated sweep-side), bbox 5.364×6.4×3.824 scale-sane, az184 r160 S-axis terminus; 0 departures, 0 drift on 312 shared ids; all affected evidence re-taken fresh per polish-270 epoch law; snapshot rewritten 123658B / 313 ents / TRUE sha16 b19424bed4405703 (prose first said 4721a94be74d7361, corrected of record, sweep-64 class), pre-write assertions, post-rewrite drift ZERO (TWO self-catches: strict-lib assert fired PRE-write fail-closed — live schema emits store/<hash>.glb vs baseline bare 16-hex, chassis re-based on norm_lib; key-order format 662-line inflation caught POST-first-commit by diff-stat probe, repaired to the committed id/pos/yaw/scale/kind/lib/bbox convention, both disclosed; first rewrite attempt's strict-lib assert fired PRE-write fail-closed, chassis re-based on norm_lib per the census-diff tool, disclosed) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 108th sweep since routing, no escalation due — law keys Sev 1); 275 bbox non-light / 236 classified / 0 coverage holes, SAT run epoch A 274-set + re-run epoch C 275-set, voronoi SAT-clean zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; voronoi r160 S 140m+ off every tier-1 waypoint — epoch-A walks stand by construction, sweep-146 chladni r150 precedent); tier-2 130th cycle per committed pointer row-cottage 6/6 @ 0.3838 + observatory circuit 5/5, both ALL_PASS real exit 0 (per-leg ok-true counts verified: 6/6, 5/5, zero ok:false) | pins 15/15 ALL_PINS_OK (106th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 07711e28 + mid-tick daef3343 (survey-111 hold, quiet corroborated) + re-run ALL PASS real exit 0 at ecd059c6 post-arrival, all three from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-153 | 2026-09-08 | 313==313 fully quiet steady state at BOTH epochs (20s-paced, byte-identical raw sha16 092abf42e7006991) vs committed baseline sha16 b19424bed4405703: 0 arrivals, 0 departures, 0 drift on all 313 shared ids across id/pos/yaw/lib/scale/kind/bbox; REPRESENTATION EPOCH #5 NEW: raw /geom shape changed compKeys→{tris,parent,top-level mounts} (deployed /geom now matches committed HEAD routes.ts:346-349 exactly; canonical 7-field projection 0/0/0 like-for-like per the sweep-80 law, comp fields intact, battery/pins green on the new shape; baseline NOT rewritten — stays current like-for-like; disclosed); mid-tick HEAD advances survey-115 (6c94c412) + survey-116 (c5457dde), both read-only D+0/E+0 holds corroborating the quiet epoch | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 109th sweep since routing, NOT new, no escalation due — law keys Sev 1); 275 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts; self-caught pre-verdict: first run keyed wrong filenames without -walk suffix, 3× exit 1 module-not-found, corrected before any verdict — disclosed); tier-2 131st cycle per committed pointer longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (107th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start a206c346 + re-run ALL PASS real exit 0 at c5457dde post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-154 | 2026-09-08 | 313→314 epoch-corrected (epoch A 313==313 fully quiet vs committed baseline sha16 b19424bed4405703: 0 arrivals, 0 departures, 0 drift on all 313 shared ids across id/pos/yaw/lib/scale/kind/bbox; raw /geom epoch-A sha16 092abf42e7006991 = representation epoch #5 STABLE, matching sweep-153's recorded raw byte-for-byte; struct-115 @ 1b86e6d3 placed nx-struct-zeno AFTER epoch A = epoch B: exactly ONE domain-valid arrival nx-struct-zeno @ (−12.556165273942469,−0.04120083928229684,179.4615290467684) yaw π lib 78a3e90e458bfb43 scale 1 comp [] = struct-115 THE ZENO GATES @ az184 r180 (stele on axis), tuple ledger-exact line-for-line (sha == struct-115's pinned x3-deterministic build hash; census 313→314 PLACED_VERIFIED corroborated sweep-side), bbox 3.2×3×8.472 scale-sane; 0 departures, 0 drift on 313 shared ids; all affected evidence re-taken fresh per polish-270 epoch law; snapshot rewritten 124097B / 314 ents / TRUE sha16 44b804c33a856b59, pre-write assertions, post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 110th sweep since routing, no escalation due — law keys Sev 1); SAT run epoch A 275-set + re-run epoch B 276-set, zeno SAT-clean zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts; zeno r180 S 160m+ off every tier-1 waypoint — epoch-A walks stand by construction, sweep-152 voronoi r160 precedent); tier-2 132nd cycle per committed pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (108th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start b2038b07 + re-run ALL PASS real exit 0 at 1b86e6d3 post-arrival, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-155 | 2026-09-08 | 314==314 fully quiet at BOTH epochs (276 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 314 shared ids across id/pos/yaw/lib/scale/kind/bbox vs committed baseline sha16 44b804c33a856b59; epochs A and B 20s-paced byte-identical raw /geom sha16 58e82babca9e87da = representation epoch #5 stable, byte-identical to sweep-154's epoch-B raw — no flap, no world change; no snapshot rewrite, baseline current | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 111th sweep since routing, no escalation due — law keys Sev 1); 276 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the 314-set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 133rd cycle per committed pointer inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (109th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 80edb60a + re-run ALL PASS real exit 0 at 80edb60a post-evidence (HEAD static through the whole tick — zero sibling commits since struct-116), both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-156 | 2026-09-08 | 314==314 fully quiet at BOTH epochs (276 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 314 shared ids across id/pos/yaw/lib/scale/kind/bbox vs committed baseline sha16 44b804c33a856b59; epochs A and B 20s-paced byte-identical raw /geom sha16 58e82babca9e87da = representation epoch #5 stable — no flap, no world change; no snapshot rewrite, baseline current | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 112th sweep since routing, no escalation due — law keys Sev 1); 276 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the 314-set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 134th cycle per committed pointer forge 6/6 (interior-walk-forge.ts) + potter 6/6 (interior-walk-potter.ts), both ALL_PASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (110th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append, 2370761) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 1d4203af | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-157 | 2026-09-08 | 314==314 fully quiet at BOTH epochs (276 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 314 shared ids across id/pos/yaw/lib/scale/kind/bbox vs committed baseline sha16 44b804c33a856b59; epochs A and B 20s-paced byte-identical raw /geom sha16 58e82babca9e87da = representation epoch #5 stable, byte-identical to sweep-155/156 raw — no flap, no world change; no snapshot rewrite, baseline current | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard \u22120.407 (Sev 2 artwalk-routed @ sweep-43, 113th sweep since routing, no escalation due \u2014 law keys Sev 1); 276 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the 314-set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 135th cycle per committed pointer longhouse 6/6 @ 0.346 (interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (111th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append, 2370761) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start bea900b9 + re-run ALL PASS real exit 0 at 8a1b1bb9 (mid-tick struct-117 build-only + survey-122 read-only interleaves absorbed, zero world mutations by either, census quiet at both epochs corroborates) | CLEAN SWEEP \u2014 R-121 open, known, no escalation due |\n
| sweep-158 | 2026-09-08 | 314→315 (+1 domain-valid arrival nx-struct-borromean @ (−13.2537,−0.0113,189.5372) yaw π lib 7e9c334883d25774 comp {} = struct-118 @ a8c8a051, tuple matches its committed ledger line-for-line incl. PLACED_VERIFIED census 314→315 and sha 7e9c3348 byte-exact; epochs A/B 315==315 raw byte-identical 57149d04bfb22ce4 — world static after the placement; 0 departures, 0 drift on all 314 shared ids id/pos/yaw/lib/scale/kind/bbox; snapshot rewritten 124565B/315 ents/sha16 37736d5053f432ef, first 314 preserved verbatim + borromean at tail, pre-write asserts, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 114th sweep since routing, no escalation due — law keys Sev 1); 277 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the 315-set, borromean SAT-clean zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts; borromean r190 S 170m+ off every tier-1 leg — walks stand by construction, sweep-152 zeno precedent); tier-2 136th cycle per committed pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (112th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start d23a3600 + re-run ALL PASS real exit 0 at a8c8a051 (struct-118's own borromean placement commit, epoch-correct absorbed — epoch-B census post-dates it, gate check-set identical 98/98) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-159 | 2026-09-08 | 315==315 fully quiet at BOTH epochs (277 thing + 38 light; 0 arrivals, 0 departures, 0 drift on all 315 shared ids across id/pos/yaw/lib/scale/kind/bbox vs committed baseline sha16 37736d5053f432ef; epochs A and B 20s-paced byte-identical raw /geom sha16 a475ae09538c3f91 = representation epoch #6 — comp payloads RESTORED in the served projection vs sweep-158's comp-null baseline capture: full-field sweep classifies comp/compKeys null->populated on all comp-bearing ids simultaneously with zero law-field drift and battery 28/28 comp pins exact — representation change, not world drift, server.ts/world.ts sibling work in flight corroborates; snapshot rewritten to the current representation with pre-write asserts, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 115th sweep since routing, no escalation due — law keys Sev 1); 277 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the 315-set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 137th cycle per committed pointer hall 8/8 @ 0.36 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALLPASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (113th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append, 2370762) D+0/E+0, standing gate ALL PASS real exit 0 at 3091c0ac (HEAD pre-advanced d635c2ef->3091c0ac survey-124 read-only before first gate run — epoch-correct by construction) + re-run ALL PASS real exit 0 at a4d036f2 (survey-125 read-only observer absorbed, check-set identical 98/98, only the HEAD-epoch line itself differs) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-160 | 2026-09-08 | 315→316 EPOCH-CORRECTED (epoch A/B 315==315 fully quiet vs committed baseline c8e56130 0/0/0 — raw sha16 57149d04 both = representation epoch #7 raw compKeys null toggle, comp payloads byte-equal all 315, never reaches the projection convention; epoch C +1 domain-valid arrival nx-struct-brachistochrone @ (−13.9513,−0.0066,195.8128) yaw −π/2 lib f678c069e84e51a2 comp {} = struct-120 @ 3fd272d7 executing struct-119's deferred placement, tuple matches its committed ledger line-for-line (PLACED_VERIFIED census 315→316 corroborated read-back); bbox 8.74×4.018×2.14 center +3.70x (pitfall-10 form-center), 0 departures, 0 drift on 315 shared ids; all affected evidence re-taken fresh per polish-270 epoch law; world static post-arrival (proj→proj2 diffs NONE); snapshot rewritten 209736B/316/sha16 e146e035726d6998 pre-write asserts post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 116th sweep since routing, no escalation due — law keys Sev 1); 278 bbox non-light / 236 classified / 0 coverage holes, SAT fresh at epoch C (brachistochrone in live set, SAT-clean zero new contacts, corroborates struct-120's own scan +3.30 worst borromean law 1.4) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts; brachistochrone r200 S 180m+ off every leg — walks stand by construction sweep-152/158 precedent); tier-2 138th cycle per committed pointer row-cottage 6/6 @ 0.384 (interior-walk-row-cottage.ts) + observatory circuit 5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (114th consecutive clean, re-run at epoch C), sweep89-battery 28/28 ALL PASS on fresh 316-set census-C bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 0e025513 (survey-127, read-only) + re-run ALL PASS exit 0 at 3fd272d7 (struct-120 placement commit absorbed, epoch-correct by construction) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-161 | 2026-09-08 | 316==316 all three epochs QUIET vs committed baseline e146e035 (0 arrivals, 0 departures, 0 drift, 0 lib flips; raw sha16 131e7d96 stable A/B/C — the flip vs sweep-160's 57149d04 classified serialization-only BEFORE verdicts: raw A vs raw C field-identical across all 316 shared ids, sweep-159 law; projection full-field drift ZERO incl comp/compKeys; snapshot rewrite reproduced the committed baseline BYTE-IDENTICAL 209736B/sha16 e146e035726d6998 — git status clean on the baseline, zero churn) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 117th sweep since routing, no escalation due — law keys Sev 1); 278 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 139th cycle per committed pointer inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house 6/6 @ 0.377 (interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (115th consecutive clean), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 0d201d15 + re-run ALL PASS 98 exit 0 at 24fbbcb3 (survey-130/131 read-only absorbed, epoch-correct by construction) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-162 | 2026-09-09 | 316==316 all three epochs QUIET vs committed baseline e146e035 (0 arrivals, 0 departures, 0 drift, 0 lib flips; raw sha16 131e7d96 stable A/B/C — byte-stable vs sweep-161, no flip to classify; projection full-field comparison vs committed baseline ZERO drift incl comp/compKeys on all 316 shared ids; baseline stays current, ZERO churn, sweep-161 comparison-only precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 118th sweep since routing, no escalation due — law keys Sev 1); 278 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 140th cycle per committed pointer forge 6/6 @ 0.375 (interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (116th consecutive clean), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start e66f218c + re-run ALL PASS 98 exit 0 at 001e06d4 (struct-121 build-source + survey-133 recovery, both read-only vs world, census byte-identity corroborates) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-163 | 2026-09-09 | 316==316 all three epochs QUIET vs committed baseline e146e035 (0 arrivals, 0 departures, 0 drift, 0 lib flips; raw sha16 131e7d96 byte-stable A/B/C — same value as sweep-161/162, no flip to classify; 9-field-projected full-field comparison vs committed baseline ZERO drift on all 316 shared ids incl comp byte-equal; baseline stays current, ZERO churn, sweep-161/162 comparison-only precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 119th sweep since routing, no escalation due — law keys Sev 1); 278 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts after ONE paced retry following a tool-layer timeout, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 141st cycle per committed pointer longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (117th consecutive clean), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append, 2370763 D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 768cee33 + re-run ALL PASS 99 exit 0 at c78ce843 (survey-135/136 read-only holds, census byte-identity corroborates) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-164 | 2026-09-09 | 316→317 (+1 domain-valid arrival nx-struct-galtonboard @ (−14.649,0.002,209.873) yaw π lib 3d9f7c9cdf81d64c comp {} = struct-122 @ 40c39c37, tuple matches its staged placer line-for-line incl full sha 3d9f7c9cdf81d64ce497b2c1aa6684b98f1330b3c1c0af56fa9512d9fd1d807b + ledger D+1; corroborated independently by survey-138 NATIVE CLEAN slice; 0 departures, 0 drift, 0 lib flips on 316 shared ids at all three epochs A/B/C (A/B 20s-paced, C post-verify), raw sha16 5d86c019 byte-stable A/B/C; snapshot REWRITTEN arrival-fold precedent sweep-124: 317 ents / 211135B / sha16 a07d6e627c9e034e, pre-write asserts (arrival exactly [nx-struct-galtonboard], 0 departures, zero full-field drift on 316 shared incl comp byte-equal), post-rewrite drift ZERO, one shape self-catch: first write dropped the top-level world key, caught by committed-vs-new shape check pre-commit, re-run with world preserved) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 120th sweep since routing, no escalation due — law keys Sev 1); 279 bbox non-light (galtonboard in the live SAT set) / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts; arrival r210 S outside every walked leg — walks stand by construction, SAT covers the collision surface, sweep-53 precedent); tier-2 142nd cycle per committed pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (118th consecutive clean), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 490fa900 + re-run ALL PASS 99 exit 0 at 84d8c722 (struct-122 placement + survey-138 slice, both absorbed mid-tick; index partition clean at commit time — foreign staged files landed their own commits first) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-165 | 2026-09-09 | 317==317 fully quiet steady state at all three epochs A/B/C (A/B 20s-paced, C post-verify) vs committed baseline 317 ents / 211135B / sha16 a07d6e627c9e034e: 0 arrivals, 0 departures, 0 drift, 0 lib flips — 279 thing + 38 light; raw /geom sha16 5d86c0190c82fbbe byte-stable across A/B/C (same value as sweep-164 — no flip to classify); committed baseline stays current, ZERO churn (comparison-only tick, sweep-161/162/163 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 121st sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live 279 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 143rd cycle per committed sweep-164 pointer inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (119th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes (first run was argv-missing and exited 1 — self-catch, rerun with census path clean), interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start ddfe3a92 + re-run ALL PASS 99 exit 0 at 80ee3b18 (survey-140/141 read-only holds absorbed mid-tick; index partition clean — only lane-owned probe untracked) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-166 | 2026-09-09 | 317==317 fully quiet steady state at all three epochs A/B/C (A/B 20s-paced, C post-verify) vs committed baseline 317 ents / 211135B / sha16 a07d6e627c9e034e: 0 arrivals, 0 departures, 0 drift, 0 lib flips — 279 thing + 38 light; raw /geom sha16 5d86c0190c82fbbe byte-stable across A/B/C (same value as sweep-164/165 — no flip to classify); committed baseline stays current, ZERO churn (comparison-only tick, sweep-161..165 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 122nd sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live 279 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts re-run individually after a tool-layer timeout on the first chained run — partial JSON discarded, sweep-12/163 precedent, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 144th cycle per committed sweep-165 pointer row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory 6-leg circuit 5/5 @ 0.389 (struct2-walk-observatory.ts chassis), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (120th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base 2370764 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 78138e53 + re-run ALL PASS 99 exit 0 at d21e4f6d (survey-142/143 read-only holds absorbed mid-tick) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-167 | 2026-09-09 | 317==317 fully quiet steady state at all three epochs A/B/C (A/B 20s-paced, C post-verify) vs committed baseline 317 ents / 211135B / sha16 a07d6e627c9e034e: 0 arrivals, 0 departures, 0 drift, 0 lib flips — 279 thing + 38 light; raw /geom sha16 5d86c0190c82fbbe byte-stable across A/B/C (same value as sweep-164/165/166 — no flip to classify); committed baseline stays current, ZERO churn (comparison-only tick, sweep-161..166 precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 123rd sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live 279 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, all run individually this tick — no timeout this wakeup); tier-2 145th cycle per committed sweep-166 pointer hall 8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (121st consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base 2370764 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 from repo ROOT at tick-start 814b78d2 (98 PASS lines; first agents/arthur-cwd run tripped the known tex-84 repo-relative existsSync cwd artifact — sweep-121 precedent, disclosed, not a gate failure; no mid-tick HEAD advance this tick, no re-gate owed) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-168 | 2026-09-09 | ARRIVAL tick, exactly ONE domain-valid arrival: epoch A 317==317 fully quiet vs committed baseline 317 ents / 211135B / sha16 a07d6e627c9e034e (0 arrivals / 0 departures / 0 drift / 0 lib flips on all 317 shared ids; raw sha16 5d86c019 same as sweep-164..167); epoch B (20s-paced) caught the arrival, epoch C settled 318 — nx-struct-clothoid @ (−13.7414, −0.0010, 219.3541) yaw π lib 4843ef8ae7093365 comp {} = struct-125 @ 76250b52 committed mid-tick, live tuple matches its ledger PLACED_VERIFIED line-for-line AND struct-124's committed deferred siting contract (az184 r220 S-axis past galton r210, yaw-π face-on family); baseline REWRITTEN arrival-fold per sweep-124/164 precedent: 318 ents / 211783B / sha16 ff11fff94bf97839, drift ZERO on 317 shared ids, world key preserved — one chassis self-catch: first rewrite used the stale sweep-138 7-field projection (dropped comp/compKeys/store-form lib, net −2304 lines), caught by the on-disk entity key-set check pre-commit, git-checkout restored zero damage, re-run clean on the sweep-164 9-field chassis | SAT run TWICE fresh-live: epoch-A set 279 bbox non-light (arrival not yet live), epoch-B/C set 280 incl. clothoid in the collision set — both runs 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (124th sweep since routing, Sev 2 artwalk-routed @ sweep-43, no escalation due — law keys Sev 1) — arrival collision-clean | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, individually run, zero timeouts); tier-2 146th cycle per committed sweep-167 pointer longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.3550 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, ok counts verified from the results list (no legs field in this walk schema — sweep-48/165 keying class) | pins 15/15 ALL_PINS_OK (122nd consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base 2370765 re-read fresh pre-append — advanced by struct-125's D+1, D+0/E+0 this tick), standing gate ALL PASS real exit 0 at tick-start 90060539 + RE-GATED ALL PASS real exit 0 at 76250b52 after two mid-tick HEAD advances (survey-147 read-only hold, struct-125 placement absorbed; index partition clean at commit time) | CLEAN SWEEP w/ one domain-valid arrival folded — R-121 open, known, no escalation due |
| sweep-169 | 2026-09-09 | 318==318 fully quiet steady state at all three epochs A/B/C (A/B 20s-paced, C post-verify) vs committed baseline 318 ents / sha16 ff11fff94bf97839: 0 arrivals, 0 departures, 0 field diffs, 0 lib flips — 280 thing + 38 light; raw /geom sha16 5ce439a1016454d0 byte-stable across A/B/C (first epoch at this new raw value — survey-149 disclosed the /geom SCHEMA EVENT compKeys→parent+tris from sibling windmill-era server work-in-flight: entity set + every compared field identical, content-diff valid, baseline stays current ZERO churn); SAT fresh-live 280 bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 125th sweep since routing, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, all run individually this wakeup, parsed per-leg from the results list — sweep-48/165 keying law); tier-2 147th cycle per committed sweep-168 pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (123rd consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-C bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base 2370765 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start ae4166c9 + RE-GATED ALL PASS real exit 0 at 3f2fef13 after TWO mid-tick HEAD advances (survey-148/149 sibling observer commits, SURVEY-PLAN.md only, zero SWEEP paths — epoch law honored); one ledger self-catch disclosed: the appended prose named interior-walk-towerhouse.ts, tool is actually interior-walk-tower-house.ts — corrected in-place this tick pre-commit by unique-anchor sed, law re-verified EXACT after, entry exactly once | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-170 | 2026-09-09 | 318==318 at all three epochs (A/B 20s-paced, C post-verify) vs committed baseline 318 ents / sha16 ff11fff94bf97839 with exactly ONE classified lib flip: nx-struct-clothoid 4843ef8ae7093365 → 120448255ce67193 at identical tuple (0 arrivals, 0 departures, 0 field diffs on all 318 shared ids — 280 thing + 38 light; raw projection sha16 12df31f3da9bf141 byte-stable A/B/C, s148 field shape 211019B per survey-150 note) = struct-126 @ 5f9fc395 domain-valid re-place (trestle material split), live lib+pos+yaw match its PLACED_VERIFIED line-for-line, sweep-28 re-place-fold class; baseline REWRITTEN fold: 318 ents / 211783B / sha16 a1fc3ef2938810a0, entity order+set+world key preserved, drift ZERO on other 317 ids, 1-line diff verified | SAT fresh-live 280 bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 126th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually this wakeup, parsed per-leg from the results list — sweep-48/165 keying law); tier-2 148th cycle per committed sweep-169 pointer inn 6/6 @ 0.3640 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts, hyphenated — sweep-169 self-catch class), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (124th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base 2370765 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 5f9fc395 + RE-GATED ALL PASS real exit 0 at a746f144 after ONE mid-tick HEAD advance (survey-150 sibling observer commit, SURVEY-PLAN.md only, zero SWEEP paths — epoch law honored; survey-150 independently judged the same lib flip CLEAN, corroborating this tick's classification) | CLEAN SWEEP w/ one domain-valid re-place folded — R-121 open, known, no escalation due |
| sweep-171 | 2026-09-09 | 318==318 fully quiet both epochs (A/B 20s-paced) vs committed baseline 318 ents / sha16 a1fc3ef2938810a0: 0 arrivals, 0 departures, 0 field diffs, 0 lib flips on all 318 shared ids (280 thing + 38 light; raw projection sha16 12df31f3da9bf141 byte-stable A/B, s148 compKeys field shape 211019B — survey-153's same-window census byte-identical corroborates); no snapshot rewrite needed (baseline current, sweep-106/108 no-churn precedent) | SAT fresh-live 280 bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 127th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed from the results list — sweep-48/165 keying law); tier-2 149th cycle per committed sweep-170 pointer row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory 5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (125th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes (argv census file — one misfire no-arg run caught by IndexError, re-run correct), interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base 2370765 re-read fresh pre-append, D+0/E+0; one ad-hoc probe self-catch: naive slice sum missed the 2336002 constant, tool's own law() run confirmed EXACT before append), standing gate ALL PASS real exit 0 at tick-start 4670c61d + RE-GATED ALL PASS real exit 0 at 46526ef6 after TWO mid-tick HEAD advances (survey-152 @ 8aec4fdc + survey-153 @ 46526ef6, sibling observer holds, SURVEY-PLAN.md only, zero SWEEP paths, both independently census-confirm the quiet 318 epoch — epoch law honored) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-172 | 2026-09-09 | 318==318 fully quiet both epochs (A/B 20s-paced) vs committed baseline 318 ents / sha16 a1fc3ef2938810a0: 0 arrivals, 0 departures, 0 field diffs, 0 lib flips on all 318 shared ids (280 thing + 38 light; raw projection sha16 12df31f3da9bf141 byte-stable A/B, s148 compKeys field shape 211019B — survey-154 same-window hold independently census-confirmed the quiet epoch); no snapshot rewrite needed (baseline current, sweep-106/108 no-churn precedent) | SAT fresh-live 280 bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 128th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed from the results list — sweep-48/165 keying law); tier-2 150th cycle per committed sweep-171 pointer hall 8/8 @ 0.3600 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (126th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base 2370765 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 4c1baa2d + RE-GATED ALL PASS real exit 0 at 03e57a7d after TWO mid-tick HEAD advances (survey-154 @ 5501db26 + survey-155 @ 03e57a7d, sibling observer holds, SURVEY-PLAN.md only, zero SWEEP paths; projection convention robust to the raw /geom schema flap those holds disclosed — next-live-census.ts normalizes fields explicitly, projection sha byte-stable both epochs) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-173 | 2026-09-09 | 318==318 fully quiet both epochs (A/B 20s-paced) vs committed baseline 318 ents / sha16 a1fc3ef2938810a0: 0 arrivals, 0 departures, 0 field diffs, 0 lib flips on all 318 shared ids (280 thing + 38 light; raw projection sha16 12df31f3da9bf141 byte-stable A/B, s148 compKeys field shape 211019B — survey-154..158 same-window holds independently census-confirmed the byte-quiet epoch, world quiet across eight consecutive survey ticks s151-s158; no snapshot rewrite needed, baseline current, sweep-106/108 no-churn precedent) | SAT fresh-live 280 bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 129th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed from the results list — sweep-48/165 keying law); tier-2 151st cycle per committed sweep-172 pointer longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (127th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base 2370765 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 51f1a985 + RE-GATED ALL PASS real exit 0 at fce97b58 after TWO mid-tick HEAD advances (survey-157 @ 3746d7fb, survey-158 @ fce97b58, sibling observer holds, SURVEY-PLAN.md only, zero SWEEP paths, both census-confirm the quiet epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-174 | 2026-09-09 | 318==318 fully quiet both epochs (A/B 20s-paced) vs committed baseline 318 ents / sha16 a1fc3ef2938810a0: 0 arrivals, 0 departures, 0 field diffs, 0 lib flips on all 318 shared ids (280 thing + 38 light; epoch-A raw capture BYTE-IDENTICAL to the survey-159 capture (md5 c6109787), 94118B parent+tris schema shape, s152/s154 precedent, raw sha16 6a789d2e4d07e766 A/B byte-stable; world byte-quiet across ten consecutive survey ticks s151-s159 + this sweep; no snapshot rewrite needed, baseline current, sweep-106/108 no-churn precedent) | SAT fresh-live 280 bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 130th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed from the results list — sweep-48/165 keying law; interior support-seam abstentions on dress/temple entities = known normalized diagnostic set, unchanged); tier-2 152nd cycle per committed sweep-173 pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (128th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base 2370765 re-read fresh pre-append → 2370767 post-append absorbing ONE mid-tick sibling struct-128 append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start ba1e530c (survey-159 absorbed, 99 PASS lines; struct-128 sibling appended mid-tick, prefix-disjoint, siting blocked fail-closed per its entry, unspawned — consistent with this tick's 0 arrivals) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-175 | 2026-09-09 | 318->319 BOTH epochs (A/B 20s-paced) vs committed baseline 318 ents / sha16 a1fc3ef2938810a0: exactly ONE arrival nx-struct-peaucellier pos [-10.4888,-0.0480,168.3133] yaw pi-exact lib f66494fa3ffb9ff8 scale 1 bbox 7.00x4.20x1.05 empty comp = struct-129 @ d6e3baf0 PLACED_VERIFIED spawn (mid-tick sibling ledger append 2370767->2370768 absorbed, IMPROVEMENTS clean at its HEAD, gate RE-RUN ALL PASS real exit 0 at d6e3baf0 per polish-270 epoch law), domain-valid committed work, tuple ledger-exact vs its entry; 0 departures, 0 field diffs, 0 lib flips on all 318 shared ids; epoch-A raw md5 8e89b3da sha16 6a54bb6d 94432B; epoch-B first fetch gateway-1033 17B body — ONE paced 20s retry clean (polish-270e class), A/B byte-identical; snapshot REWRITTEN arrival-fold variant per sweep-55/170 chassis: 319 ents 212416B sha16 b52c0538d95606df, pre-write asserts exact, post-write drift ZERO | SAT fresh-live 281 bbox non-light (peaucellier in the live set) / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 131st sweep since routing, not new, no escalation due — law keys Sev 1), peaucellier adds ZERO overlapping pairs corroborating struct-129's own live worst zeno +2.07 | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed — sweep-48/165 keying law; NW/NE/SW tools key distance not dist, sweep-54 keying class, corrected in-tick, JSON parsed from first brace behind the [physics] banner; interior support-seam abstentions on dress/temple entities = known normalized diagnostic set, unchanged); tier-2 153rd cycle per committed sweep-174 pointer inn 6/6 @ 0.3640 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (129th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base 2370768 re-read fresh pre-append, D+0/E+0 — struct-129's +1 absorbed as the mid-tick sibling append), standing gate ALL PASS real exit 0 at tick-start 7bb8b898 + RE-GATED d6e3baf0 (struct-129 absorbed mid-tick; its spawn is exactly this tick's single arrival) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-176 | 2026-09-09 | 319==319 BOTH epochs (A/B 20s-paced) BYTE-IDENTICAL vs committed baseline 319 ents / sha16 b52c0538d95606df (sweep-175 arrival-fold): zero arrivals, zero departures, zero field diffs, zero lib flips on all 319 shared ids (281 thing + 38 light); raw A/B sha16 9d6a3e8325b69027 211652B (compKeys parent+tris fetch shape, s148/s163 flap class — content compared on the 8 shared fields); no snapshot rewrite needed, baseline current (sweep-106/108/174 no-churn precedent) | SAT fresh-live 281 bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 132nd sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed — sweep-48/165 keying law; NW/NE/SW tools key distance not dist, sweep-54 keying class; JSON parsed from first brace behind the [physics] banner — in-tick self-catch on the core parse, corrected, disclosed; interior support-seam abstentions on dress/temple entities = known normalized diagnostic set, unchanged) | tier-2 154th cycle per committed sweep-175 pointer row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory 5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (130th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base 2370768 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 35847cab + RE-RUN ALL PASS real exit 0 at 5ece8e11 (TWO mid-tick sibling observer holds absorbed: survey-164 native-debt-retired + survey-165 hold, SURVEY-PLAN.md only, zero SWEEP paths, both census-confirm the quiet 319 epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-177 | 2026-09-09 | 319->320 (epoch-A fully quiet 319==319 sha16 9d6a3e8325b69027 byte-identical to sweep-176; epoch-B 20s-paced caught exactly ONE arrival): nx-struct-harmonickiss pos [-16.043989,-0.014399,229.439732] yaw pi-exact lib 8008167c97c9922f scale 1 bbox 3x6.4x3 empty comp = struct-130 @ 1be6774f PLACED_VERIFIED (r230 az184 yaw-pi lawful seat past clothoid r220 on the S math walk), domain-valid committed, live tuple ledger-exact; 0 departures / 0 field diffs / 0 lib flips on all 319 shared ids; snapshot REWRITTEN arrival-fold 320 ents 213012B sha16 5014e49ad693c10f order+set preserved post-write drift ZERO | SAT fresh-live 282 bbox non-light (harmonickiss in the collision set) / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 133rd sweep since routing, not new, no escalation due — law keys Sev 1); harmonickiss adds ZERO overlapping pairs, corroborating struct-130 worst clothoid +8.12 | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed from first brace, sweep-48/165 keying law, no banner self-catch this tick; interior support-seam abstentions on dress/temple entities = known normalized diagnostic set, unchanged) | tier-2 155th cycle per committed sweep-176 pointer hall 8/8 @ 0.3600 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (131st consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base 2370769 re-read fresh pre-append, D+0/E+0 — struct-130's D+1 was the absorbed mid-tick sibling append), standing gate ALL PASS real exit 0 at tick-start 5ff98d45 + RE-RUN ALL PASS real exit 0 at 1be6774f (FOUR mid-tick sibling advances absorbed: survey-165/166/167 observer holds SURVEY-PLAN.md only + struct-130 the arrival) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-178 | 2026-09-09 | fully quiet steady state 320==320 BOTH epochs (A/B 20s-paced BYTE-IDENTICAL raw sha16 edb782970e5c006a) vs baseline 5014e49ad693c10f: 0 arrivals / 0 departures / 0 field diffs / 0 lib flips on all 320 shared ids (282 thing + 38 light), no snapshot rewrite (baseline current, sweep-106/108/174/176 no-churn precedent) | SAT fresh-live 282/236/0 exit 3 ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 134th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed, no self-catch this tick) | tier-2 156th cycle per committed sweep-177 pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (132nd consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT base 2370769 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start ae27506f + RE-RUN ALL PASS real exit 0 at c095ae66 (ONE mid-tick sibling advance absorbed: survey-169 observer hold SURVEY-PLAN.md only, zero SWEEP paths, census-confirms quiet 320 epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-179 | 2026-09-09 | fully quiet steady state 320==320 BOTH epochs (A/B 20s-paced BYTE-IDENTICAL raw sha16 edb782970e5c006a) vs baseline 5014e49ad693c10f: 0 arrivals / 0 departures / 0 field diffs / 0 lib flips on all 320 shared ids (282 thing + 38 light), no snapshot rewrite (baseline current, sweep-106/108/174/176/178 no-churn precedent) | SAT fresh-live 282/236/0 exit 3 ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 135th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed; two parse self-catches corrected in-tick pre-claim — results[]-not-legs and distance-not-dist keying, sweep-175 class) | tier-2 157th cycle per committed sweep-178 pointer inn 6/6 @ 0.3640 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (133rd consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT base 2370769 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 2ad4b3b9 + RE-RUN ALL PASS real exit 0 at eb87e7ba (ONE mid-tick sibling advance absorbed: survey-171 observer hold SURVEY-PLAN.md only, zero SWEEP paths, census-confirms quiet 320 epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-180 | 2026-09-09 | fully quiet steady state 320==320 BOTH epochs (A/B 20s-paced BYTE-IDENTICAL raw sha16 edb782970e5c006a) vs baseline 5014e49ad693c10f: 0 arrivals / 0 departures / 0 field diffs / 0 lib flips on all 320 shared ids (282 thing + 38 light), no snapshot rewrite (baseline current, sweep-106/108/174/176/178/179 no-churn precedent) | SAT fresh-live 282/236/0 exit 3 ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 136th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed; one parse self-catch corrected in-tick pre-claim — first json.load died on the [physics] banner prefix, re-parsed brace-anchored) | tier-2 158th cycle per committed sweep-179 pointer row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory 5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (134th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT base 2370770 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 137525b2 + RE-RUN ALL PASS real exit 0 at 16d8731d (FOUR mid-tick sibling advances absorbed: struct-131 @ 77e12bca built-not-placed + survey-173/174/175 observer holds, all corroborating the quiet 320 epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-181 | 2026-09-09 | 320→321 BOTH epochs (A/B 20s-paced BYTE-IDENTICAL raw sha16 6eb17b2603a9e106): exactly ONE domain-valid arrival nx-struct-gyroid @ [-16.7416,-0.0200,239.4154] yaw pi lib da2a4b158a448caa comp {} = struct-131 built / struct-132 placed @ ef5c9849, tuple matches its committed ledger line-for-line (PLACED_VERIFIED, census 320→321, read-back exact); 0 departures, 0 field diffs, 0 lib flips on all 320 shared ids; baseline rewritten 321 ents / 213610B / sha16 99e835ed9dfba623 (arrival appended, order+set preserved, drift ZERO post-write) | SAT fresh-live 283 bbox non-light / 236 classified / 0 coverage holes exit 3 ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 137th sweep since routing, not new, no escalation due — law keys Sev 1); gyroid adds no new contacts, corroborating struct-132's own placer SAT worst-solid +6.18 | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed brace-anchored) | tier-2 159th cycle per committed sweep-180 pointer hall 8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.380 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (135th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT base 2370771 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start ef5c9849 (99 PASS lines), zero mid-tick sibling advances (epochs A/B byte-identical) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-182 | 2026-09-09 | fully quiet steady state 321==321 BOTH epochs (A/B 20s-paced BYTE-IDENTICAL raw sha16 d398ce05873ff941, 94990B parent+tris schema class) vs baseline 99e835ed9dfba623 (sweep-181 arrival-fold, 321): 0 arrivals / 0 departures / 0 field diffs / 0 lib flips on all 321 shared ids (283 thing + 38 light), no snapshot rewrite (baseline current, no-churn precedent) | SAT fresh-live 283 bbox non-light / 236 classified / 0 coverage holes exit 3 ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 138th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed brace-anchored) | tier-2 160th cycle per committed sweep-181 pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (136th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT base 2370771 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 9efcb4fd + RE-RUN ALL PASS real exit 0 at 834356b8 (TWO mid-tick sibling advances absorbed: survey-177 @ 3c48b61f + survey-178 observer holds, SURVEY-PLAN.md only, zero SWEEP paths, census-confirms quiet 321 epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-183 | 2026-09-09 | arrival-fold tick, TWO census generations: epochs A/B 321==321 byte-identical (sha16 d398ce05873ff941, 94990B) fully quiet, then TWO mid-tick sibling advances absorbed (struct-133 @ 3ae6e9f3 placed nx-struct-enneper 321->322, survey-180 @ 05241fde observer hold) — epochs C/D re-fetched 322==322 byte-identical (sha16 551d9f029269a6b4, 95267B): exactly ONE domain-valid arrival nx-struct-enneper [-17.4391,-0.0133,249.3910] yaw pi lib ba17a712cbc734bd comp {} = struct-133 ledger-exact, 0 departures / 0 field diffs / 0 lib flips on all 321 shared ids; baseline rewritten 322 ents / 214205B / sha16 ca2a1883de2def3d arrival-fold chassis order+set preserved drift ZERO | SAT fresh-live re-run at 322-set: 284 bbox non-light / 236 classified / 0 coverage holes exit 3 ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (139th, Sev 2 artwalk-routed @ sweep-43, not new, no escalation due — law keys Sev 1), enneper adds NO new contacts corroborating struct-133 placer SAT worst gyroid +4.78 | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed brace-anchored); walks stand by construction (enneper r250.0 S az184, 200m+ off every tier-1 waypoint, sweep-53 precedent) | tier-2 161st cycle per committed sweep-182 pointer inn 6/6 @ 0.3640 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (137th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes AND re-run 28/28 on census-D (322-epoch) bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT base 2370772 D+0/E+0, standing gate ALL PASS real exit 0 tick-start b3e199c9 + RE-RUN ALL PASS real exit 0 at 3ae6e9f3 after absorbing both advances | CLEAN SWEEP — R-121 open, known, no escalation due |












sweep-124: CLEAN SWEEP, arrival tick. Census 304→305 (267 thing + 38 light) vs the committed sweep-123 baseline (sha16 0d46f915cf4ebe8f): exactly ONE arrival nx-struct-catenoid @ (26.30, -0.0518, -53.93) yaw 1.570796 (exact pi/2 radians) lib 8ac664937f96976d comp {} -- the struct-102 deferred contract (R10-6 catenoid tower, BUILD-ONLY @ 1d6d855b) executed live: struct-103 in flight, its placer next-place-struct103.ts pins this exact tuple+sha (census-verified absent at authoring), ledger/commit not yet landed at tick-start HEAD 7742e835 -- artwalk-65/66 work-in-flight class, domain-valid, correctly seated, NOT drift, not routed. 0 departures, 0 drift on all 304 shared ids across id/pos/yaw/lib/scale/kind/bbox; epochs A and B (20s-paced) identical, single stable epoch. Snapshot rewritten 305/123015B/sha16 264972880556e91c with asserts, post-rewrite drift ZERO. Overlap: SAT fresh over the live set -- 267 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26 choreography @ sweep-43, eightieth sweep since routing, NOT new, no escalation due (law keys severity-1); catenoid SAT-clean, zero new contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 102nd cycle per committed pointer: hall 8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (78th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes (comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT -- base re-read fresh immediately before append, 2370746, D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start 7742e835 run from repo ROOT. Zero world mutations, zero defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-125): longhouse + garden-cottage (103rd cycle -- LRU chain: @124 hall/bunkhouse, @123 row-cottage/market, @122 tower-house/inn, @121 forge/potter, @120 stable/observatory, @119 longhouse/garden-cottage -- longhouse and garden-cottage both last walked sweep-119, now the stalest standing pair; both walk tools verified present this tick: interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).

sweep-125: CLEAN SWEEP, epoch-correction tick. Census epoch A 305==305 (267 thing +
38 light) vs the committed sweep-124 baseline (sha16 264972880556e91c): 0 arrivals,
0 departures, 0 drift on all 305 shared ids across id/pos/yaw/lib/scale/kind/bbox.
Epoch B (20s-paced re-read) caught exactly ONE drift field — nx-struct-slidingladder
yaw 0 → 0.6981317007977318 (2π/9 = 40°) at identical pos (3.5, 0.0056, 58) r58.1,
identical lib, identical scale/kind/bbox = struct-104 @ 9cdd3b23 committed mid-tick
(survey-70 slidingladder identity cure: yaw-only re-seat, same pos, same bytes, no
upload, 2 verbs, TUPLE_VERIFIED, idempotent per its own ledger) — ledger-matched
line-for-line, domain-valid, not drift, not routed. Per the polish-270 epoch law all
affected evidence was re-taken fresh before verdicts: standing gate re-run ALL PASS
real exit 0 at 9cdd3b23 from repo ROOT; SAT re-run at epoch B (267 bbox non-light,
236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n
| nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, eighty-first sweep since routing, NOT new, no escalation due — law keys
severity-1; zero new contacts at the rotated yaw); NE re-walked 7/7 ALL_PASS at
epoch B (the ladder sits 19.0m off the NE route — inside the re-verify band after
the parser self-catch, so the epoch-A NE legs were not allowed to stand; NW core and
SW legs are 40m+ away and stand by construction). Overlap epoch A identical verdict
(same single R-121). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0: core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38 (+epoch B 7/7), SW
5/5 @ 0.37. Tier-2 103rd cycle per committed pointer: longhouse 6/6 @ 0.346
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (79th consecutive clean);
sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes (comp-bearing 21, 38
lights); interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append, D+0/E+0. Standing gate ALL PASS real exit 0 at
tick-start 02aad838 from repo ROOT. Probe self-caught pre-verdict, disclosed: the
walk-band check first keyed waypoint fields the tools do not emit (results carry
flat x/z per row) — the first pass returned no waypoints at all and would have
"verified" the band vacuously; re-derived against the actual schema (sweep-48
per-tool schema class). Snapshot rewritten like-for-like 305 entities / 120293B /
sha16 124f64699e4dcd6e with pre-write assertions (diff exactly [slidingladder yaw]),
post-rewrite drift vs live ZERO. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-126): stable + observatory circuit (104th cycle — LRU chain:
@125 longhouse/garden-cottage, @124 hall/bunkhouse, @123 row-cottage/market, @122
tower-house/inn, @121 forge/potter, @120 stable/observatory — stable and
observatory both last walked sweep-120, now the stalest standing pair; both walk
tools verified present this tick: interior-walk-stable.ts,
struct2-walk-observatory.ts).

sweep-126: CLEAN SWEEP, steady-state tick. Census 305==305 (267 thing + 38
light) vs the committed sweep-125 baseline (sha16 124f64699e4dcd6e): 0
arrivals, 0 departures, 0 drift on all 305 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical; no sibling mutated the live world this window
(HEAD a2dae3f0 = sweep-125 close, stable all window). Snapshot
byte-identical, NO rewrite (sweep-106..125 precedent; 7-field projection
law). Overlap: SAT fresh over the live set -- 267 bbox non-light, 236
classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, eighty-second sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 104th
cycle per committed pointer: stable 5/5 @ 0.396 (interior-walk-stable.ts)
+ observatory circuit 5/5 @ 0.389 (struct2-walk-observatory.ts), both
real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (80th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on
fresh census bytes (comp-bearing 21, 38 lights); interlane md5 f6254cd0
stable, read fresh. Ledger law EXACT -- base re-read fresh immediately
before append, 2370749, D+0/E+0. Standing gate ALL PASS real exit 0 at
tick-start a2dae3f0 run from repo ROOT. Probe self-caught pre-verdict,
disclosed: the FIRST census diff was hand-rolled and compared raw
store/-prefixed lib strings against the baseline's bare-hex libs,
reporting 305 false drifts (sweep-80 projection-artifact class) --
re-run on the canonical sweep89-diff.py: 0/0/0; walk parsing re-anchored
on a first-{ brace-scan since banner and stderr lines precede the JSON
(sweep-48 per-tool schema class). Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-127): forge + potter (105th cycle --
LRU chain: @126 stable/observatory, @125 longhouse/garden-cottage, @124
hall/bunkhouse, @123 row-cottage/market, @122 tower-house/inn, @121
forge/potter -- forge and potter both last walked sweep-121, now the
stalest standing pair; both walk tools verified present on disk this
tick: interior-walk-forge.ts, interior-walk-potter.ts).


sweep-127: CLEAN SWEEP, steady-state tick. Census 305==305 (267 thing +
38 light) vs the committed sweep-126 baseline (sha16 124f64699e4dcd6e):
0 arrivals, 0 departures, 0 drift on all 305 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical; no sibling mutated the live world this window
(HEAD 8ffbdfa5 = sweep-126 close, stable all window). Snapshot
byte-identical, NO rewrite (sweep-106..126 precedent; 7-field projection
law). Overlap: SAT fresh over the live set -- 267 bbox non-light, 236
classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, eighty-third sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 105th
cycle per committed pointer: forge 6/6 @ 0.375 (interior-walk-forge.ts) +
potter 6/6 @ 0.366 (interior-walk-potter.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (81st consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370749,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start 8ffbdfa5 run
from repo ROOT. Probe self-caught pre-verdict, disclosed: the approach
walk parse keyed `dist` where the approach tools emit `distance` in their
per-leg rows (sweep-122 per-tool schema class) -- first parse printed
maxdist 0 for all three routes; re-derived against the actual schema,
true maxima NW 0.38 / NE 0.38 / SW 0.37. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use (D+0, E+0). Next tier-2 pair (sweep-128): tower-house + inn (106th
cycle -- LRU chain: @127 forge/potter, @126 stable/observatory, @125
longhouse/garden-cottage, @124 hall/bunkhouse, @123 row-cottage/market,
@122 tower-house/inn -- tower-house and inn both last walked sweep-122,
now the stalest standing pair; both walk tools verified present on disk
this tick: interior-walk-tower-house.ts, interior-walk-inn.ts).

sweep-128: CLEAN SWEEP, steady-state tick. Census 305==305 (267 thing + 38
light) vs the committed sweep-127 baseline (sha16 124f64699e4dcd6e): 0
arrivals, 0 departures, 0 drift on all 305 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical; no sibling mutated the live world this window.
Snapshot byte-identical, NO rewrite (sweep-106..127 precedent; 7-field
projection law). Overlap: SAT fresh over the live set -- 267 bbox non-light,
236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, eighty-fourth sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 106th
cycle per the committed pointer: tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts) + inn 6/6 @ 0.3640 (interior-walk-inn.ts),
both real exit 0. Pointer note disclosed: the sweep-127 ledger one-line
prose named hall+bunkhouse as the next pair, but the plan's committed LRU
chain (both records at sweep-127) names tower-house/inn as the stalest pair
(both last walked sweep-122); the plan chain governs, and the LRU chain
below rotates correctly. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (82nd consecutive clean); sweep89-battery 28/28 ALL
PASS exit 0 on fresh census bytes (comp-bearing 21, 38 lights); interlane
md5 f6254cd0 stable, read fresh. Ledger law EXACT -- base re-read fresh
immediately before append, 2370749, D+0/E+0. Standing gate ALL PASS real
exit 0 at tick-start d34a2a5f run from repo ROOT. Probe self-caught
pre-verdict, disclosed: battery first ran WITHOUT its census-path argument
(IndexError, pipe-masked exit -- swept-89 tool takes argv[1]); re-run with
/tmp/sweep128-census-b.json, true verdict 28/28; approach-walk parse keyed
`dist` again before re-anchoring on `distance` (sweep-127 per-tool schema
class); core-walk first parse assumed a `legs` array where the tool emits a
`results` array + `maxArrival` field (sweep-126 brace-scan class). Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-129):
row-cottage + market (107th cycle -- LRU chain: @128 tower-house/inn, @127
forge/potter, @126 stable/observatory, @125 longhouse/garden-cottage, @124
hall/bunkhouse, @123 row-cottage/market -- row-cottage and market both last
walked sweep-123, now the stalest standing pair; both walk tools verified
present on disk this tick: interior-walk-row-cottage.ts,
interior-walk-market.ts).

sweep-129: CLEAN SWEEP, steady-state tick. Census 305==305 (267 thing + 38
light) vs the committed sweep-128 baseline (sha16 124f64699e4dcd6e): 0
arrivals, 0 departures, 0 drift on all 305 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 55fd88ac029e432f both epochs); no
sibling mutated the live world this window (HEAD advanced once, survey-73
read-only observer interleave at be911348, zero mutations per its own
ledger line). Snapshot byte-identical, NO rewrite (sweep-106..128
precedent; 7-field projection law). Overlap: SAT fresh over the live set --
267 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed
to artwalk b26 choreography @ sweep-43, eighty-fifth sweep since routing,
NOT new, no escalation due (law keys severity-1); zero new contacts. Tier-1
4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 107th cycle
per the committed pointer: row-cottage 6/6 @ 0.3838
(interior-walk-row-cottage.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (83rd consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370749,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start f3ade7f1 run
from repo ROOT. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-130):
hall + bunkhouse (108th cycle -- LRU chain: @129
row-cottage/market, @128 tower-house/inn, @127 forge/potter, @126
stable/observatory, @125 longhouse/garden-cottage, @124 hall/bunkhouse --
hall and bunkhouse both last walked sweep-124, now the stalest standing
pair; both walk tools verified present on disk this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).

sweep-130: CLEAN SWEEP, steady-state tick. Census 305==305 (267 thing + 38
light) vs the committed sweep-129 baseline (sha16 124f64699e4dcd6e): 0
arrivals, 0 departures, 0 drift on all 305 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 55fd88ac029e432f both epochs); no
sibling mutated the live world this window. Snapshot byte-identical, NO
rewrite (sweep-106..129 precedent; 7-field projection law). Overlap: SAT
fresh over the live set -- 267 bbox non-light, 236 classified, 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
-0.407 -- known Sev 2 routed to artwalk b26 choreography @ sweep-43,
eighty-sixth sweep since routing, NOT new, no escalation due (law keys
severity-1); zero new contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0: core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7
@ 0.38, SW 5/5 @ 0.37. Tier-2 108th cycle per the committed pointer: hall
8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.380
(interior-walk-bunkhouse.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (84th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes at BOTH
epochs (comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read
fresh. Ledger law EXACT -- base re-read fresh immediately before append,
2370749, D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start eea065bd
run from repo ROOT (98 PASS / 0 FAIL). Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-131): longhouse + garden-cottage
(109th cycle -- LRU chain: @130 hall/bunkhouse, @129 row-cottage/market,
@128 tower-house/inn, @127 forge/potter, @126 stable/observatory, @125
longhouse/garden-cottage -- longhouse and garden-cottage both last walked
sweep-125, now the stalest standing pair; both walk tools verified present
on disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).

sweep-131: CLEAN SWEEP, steady-state tick. Census 305==305 (267 thing + 38
light) vs the committed sweep-130 baseline (sha16 124f64699e4dcd6e): 0
arrivals, 0 departures, 0 drift on all 305 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 55fd88ac029e432f both epochs); no
sibling mutated the live world this window. HEAD advanced once mid-tick:
survey-75 read-only observer interleave at ea06284b, zero world mutations
per its own ledger line; its own census read (305, 0/0/0/0) corroborates
this tick's stable epoch; gate re-run ALL PASS real exit 0 (98/0) at the
new HEAD from repo ROOT. Snapshot byte-identical, NO rewrite (sweep-106..130
precedent; 7-field projection law). Overlap: SAT fresh over the live set --
267 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed
to artwalk b26 choreography @ sweep-43, eighty-seventh sweep since routing,
NOT new, no escalation due (law keys severity-1); zero new contacts. Tier-1
4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 109th cycle
per the committed pointer: longhouse 6/6 @ 0.346 (interior-walk-longhouse.ts)
+ garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both real
exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(85th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census bytes (comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable,
read fresh. Ledger law EXACT -- base re-read fresh immediately before
append, 2370749, D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start
6a673c42 run from repo ROOT; re-run 98 PASS / 0 FAIL at ea06284b after the
survey-75 interleave. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-132): stable + observatory circuit (110th cycle --
LRU chain: @131 longhouse/garden-cottage, @130 hall/bunkhouse, @129
row-cottage/market, @128 tower-house/inn, @127 forge/potter, @126
stable/observatory -- stable and observatory both last walked sweep-126,
now the stalest standing pair; both walk tools verified present on disk
this tick: interior-walk-stable.ts, struct2-walk-observatory.ts).

sweep-132: CLEAN SWEEP, arrival tick. Census 305->306 (268 thing + 38
light) vs the committed sweep-131 baseline (sha16 124f64699e4dcd6e):
exactly ONE arrival nx-struct-hilbertlabyrinth @ (-6.98, -0.01822, 99.76)
yaw pi, lib 38d3bb8f49a08af9, scale 1, comp {} -- struct-105 (R10-7 THE
HILBERT LABYRINTH) @ 11ff8cba, committed PRE-tick: the tick-start HEAD
already carries it and its ledger line documents census 305->306 with this
exact tuple (sha 38d3bb8f x2 deterministic, PLACED_VERIFIED, idempotent),
so the arrival is ledger-matched line-for-line, domain-valid
(nx-struct-* struct lane), not drift. bbox 8.42 x 2.925 x 8.42
scale-sane; sits r~100 N, beyond every walked leg. 0 departures, 0 drift
on all 305 shared ids across id/pos/yaw/lib/scale/kind/bbox -- epochs A
and B (20s-paced re-read) identical (raw sha16 4ac1f73a02f71ec4 both),
single stable epoch; no sibling mutated the live world during this
window. Overlap: SAT fresh over the live set -- 268 bbox non-light, 236
classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, eighty-eighth sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts, the labyrinth is
SAT-clean (corroborates struct-105's own +7.03m clearance). Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 -- the labyrinth
sits >80m off every walked leg, outside the re-verify band; struct-105
re-proved its own full-path 35-leg two-way MCPL walk 0.4m at placement.
Tier-2 110th cycle per the committed pointer: stable 5/5 @ 0.40
(interior-walk-stable.ts) + observatory circuit 5/5 @ 0.39
(struct2-walk-observatory.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (86th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370752
(struct-105 D+1/E+2 absorbed mid-tick window), D+0/E+0. Standing gate ALL
PASS real exit 0 at tick-start 11ff8cba run from repo ROOT (98 PASS / 0
FAIL). Probe self-caught pre-verdict, disclosed (sweep-55 write-format
class): the first snapshot-rewrite draft used census-order keys
(kind-early, store/-prefixed lib, no trailing newline) -- the size guard
tripped (+3169B vs ~+400B expected) before any commit, the bad write was
inspected via git diff (646/612 formatting churn), and the file was
rewritten like-for-like per the committed sweep-125 chassis; final diff
35 insertions / 1 deletion, on-disk script updated to the corrected
chassis so the committed record matches the bytes that produced the
baseline. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-133): row-cottage + market (111th cycle -- LRU chain: @132
stable/observatory, @131 longhouse/garden-cottage, @130 hall/bunkhouse,
@129 row-cottage/market, @128 tower-house/inn, @127 forge/potter --
row-cottage and market both last walked sweep-129, now the stalest
standing pair; both walk tools verified present on disk this tick:
interior-walk-row-cottage.ts, interior-walk-market.ts).

sweep-133: CLEAN SWEEP, steady-state tick. Census 306==306 (268 thing +
38 light) vs the committed sweep-132 baseline (sha16 c1514c2339552894):
0 arrivals, 0 departures, 0 drift on all 306 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 4ac1f73a02f71ec4 both); no sibling
mutated the live world this window. HEAD advanced once mid-tick: survey-76
read-only observer interleave at c6ccc579, zero world mutations per its
own ledger line; its own census read (306, one struct-105 arrival already
absorbed into the sweep-132 baseline) corroborates this tick's stable
epoch; gate re-run ALL PASS real exit 0 (98/0) at the new HEAD from repo
ROOT. Snapshot byte-identical, NO rewrite (sweep-106..132 precedent;
7-field projection law). Overlap: SAT fresh over the live set -- 268 bbox
non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2
routed to artwalk b26 choreography @ sweep-43, eighty-ninth sweep since
routing, NOT new, no escalation due (law keys severity-1); zero new
contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38 maxArrival (next-walk-core-paths.ts), NW 5/5 @
0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5
@ 0.37 (sw-approach3-walk.ts). Tier-2 111th cycle per the committed
pointer: row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + market
6/6 @ 0.3894 (interior-walk-market.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (87th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370752,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start 76b9e71c run
from repo ROOT. Probe self-caught pre-verdict, disclosed (sweep-127/128
per-tool schema class): the approach-walk first parse treated the `legs`
field as an array where these tools emit a COUNT with the per-leg rows in
`results[].distance` -- three parses raised TypeError; re-anchored on the
actual tool schema and re-read all three files without re-running the
walks (the walk tools themselves exited 0 with ALL_PASS printed in their
own output; only the probe parse failed). Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-134): forge +
potter (112th cycle -- LRU chain: @133 row-cottage/market, @132
stable/observatory, @131 longhouse/garden-cottage, @130 hall/bunkhouse,
@129 row-cottage/market, @128 tower-house/inn -- forge and potter both
last walked sweep-127, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-forge.ts,
interior-walk-potter.ts).

sweep-134: CLEAN SWEEP, steady-state tick. Census 306==306 (268 thing +
38 light) vs the committed sweep-132 baseline (sha16 c1514c2339552894):
0 arrivals, 0 departures, 0 drift on all 306 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) identical, epoch C (post-interleave) identical, raw sha16
4ac1f73a02f71ec4 all three; single stable epoch, no sibling mutated the
live world this window. HEAD advanced once mid-tick: struct-106
dodecahedron @ fc7db189, BUILD-ONLY per its own ledger line (placement
deferred run-budget, contract pinned), zero world mutations, epoch C
corroborates; gate re-run ALL PASS real exit 0 (99/0) at the new HEAD
from repo ROOT. Snapshot byte-identical, NO rewrite (sweep-106..133
precedent; 7-field projection law). Overlap: SAT fresh over the live
set -- 268 bbox non-light, 236 classified, 0 coverage holes, exit 3 on
exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407 --
known Sev 2 routed to artwalk b26 choreography @ sweep-43, ninetieth
sweep since routing, NOT new, no escalation due (law keys severity-1);
zero new contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0: core 64/64 @ 0.38 maxArrival (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 112th cycle per the
committed pointer: forge 6/6 @ 0.375 (interior-walk-forge.ts) + potter
6/6 @ 0.366 (interior-walk-potter.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (88th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370752,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start b156db9e run
from repo ROOT. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-135): inn + tower-house (113th cycle -- LRU chain:
@134 forge/potter, @133 row-cottage/market, @132 stable/observatory,
@131 longhouse/garden-cottage, @130 hall/bunkhouse, @129
row-cottage/market, @128 tower-house/inn -- inn and tower-house both
last walked sweep-128, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).

sweep-135: CLEAN SWEEP, steady-state tick. Census 306==306 (268 thing +
38 light) vs the committed sweep-132 baseline (sha16 c1514c2339552894):
0 arrivals, 0 departures, 0 drift on all 306 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) identical, epoch C (post-interleave) identical, raw sha16
4ac1f73a02f71ec4 all three; single stable epoch, no sibling mutated the
live world this window. HEAD advanced once mid-tick: survey-77 rotating
district pass @ a90c2905, read-only observer per its own ledger line
(IMPROVE-PLAN/SURVEY-PLAN/IMPROVEMENTS file writes only), zero world
mutations, epoch C corroborates; gate re-run ALL PASS real exit 0 (98/0)
at the new HEAD from repo ROOT. Ledger sequencing note: the sweep-135
append landed immediately BEFORE the survey-77 interleave (base re-read
fresh at append was quiet at 2370752); survey-77's own entry then
advanced the file under this tick's commit, absorbed normally per the
artwalk-34 interleave law -- verified the pair by grep after commit.
Snapshot byte-identical, NO rewrite (sweep-106..134 precedent; 7-field
projection law). Overlap: SAT fresh over the live set -- 268 bbox
non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2
routed to artwalk b26 choreography @ sweep-43, ninety-first sweep since
routing, NOT new, no escalation due (law keys severity-1); zero new
contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38 maxArrival (next-walk-core-paths.ts), NW 5/5 @
0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW
5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 113th cycle per the committed
pointer: inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house 6/6 @
0.3765 (interior-walk-tower-house.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (89th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append,
2370752, D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start
bfbbe48f run from repo ROOT. Probe self-caught pre-verdict, disclosed
(sweep-126/133 per-tool schema class): the core-walk first parse
json.load'ed the whole file and died on the leading `[physics]` banner
line -- re-anchored on the first `{` brace-scan; the NW count-extract
grep keyed fields these tools do not emit -- re-derived from the JSON
itself (both walk tools had already exited 0 with ALL_PASS printed in
their own output; only the probes were wrong, no walk re-run needed).
Zero world mutations, zero defect notes, zero uploads, zero verbs, zero
comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-136): hall + bunkhouse (114th cycle -- LRU chain: @135
inn/tower-house, @134 forge/potter, @133 row-cottage/market, @132
stable/observatory, @131 longhouse/garden-cottage, @130 hall/bunkhouse
-- hall and bunkhouse both last walked sweep-130, now the stalest
standing pair; both walk tools verified present on disk this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).

sweep-136: CLEAN SWEEP, arrival tick. Census 306==307 (269 thing + 38
light) vs the committed sweep-132 baseline (sha16 c1514c2339552894):
epoch A fully quiet (306==306, raw sha16 4ac1f73a02f71ec4 identical),
epochs B and C (20s-paced re-reads) identical at 307 with exactly ONE
arrival -- nx-struct-dodecahedron @ (-7.67, -0.028895, 109.73) yaw pi,
lib 671b99124ba55182, scale 1, comp {}, bbox 5.99x5.739x6.298 -- and
ZERO drift on all 306 shared ids across id/pos/yaw/lib/scale/kind/bbox.
The arrival is struct-107 @ 11920ec7, committed mid-tick: its ledger
line matches the observed tuple line-for-line (same pos/yaw/lib/comps,
census 306->307 per its own entry). The live lib (671b...) differs from
struct-106's build-only sha (e30b...) exactly as its pinned
placement-tick contract allowed: v2c night-bead-cure rebuild, named in
its own entry -- not drift. survey-78 @ d2e5335b read-only observer
interleave absorbed (its own census corroborates 306 pre-arrival).
Snapshot rewritten per the sweep-132 chassis: 307 entities, 121148
bytes, sha16 0fd137c936560a28, post-rewrite drift vs live ZERO
(307/307 exact). Overlap: SAT fresh over the arrival-inclusive live
set -- 269 bbox non-light, 236 classified, 0 coverage holes, exit 3 on
exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407 --
known Sev 2 routed to artwalk b26 choreography @ sweep-43, ninety-second
sweep since routing, NOT new, no escalation due (law keys severity-1);
the dodecahedron itself is SAT-clean (corroborating struct-107's own
+2.61 film-guarded adjacency law), zero new contacts. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38 maxDist (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts). Tier-2 114th cycle per the committed
pointer: hall 8/8 @ 0.36 (interior-walk-hall.ts) + bunkhouse 6/6 @
0.3803 (interior-walk-bunkhouse.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (90th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-C bytes (comp-bearing 21, 38 lights); interlane md5 f6254cd0
stable, read fresh. Ledger law EXACT -- base re-read fresh immediately
before append, 2370753 (struct-107's D+1 and survey-78's D+0 absorbed
mid-tick), D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start
3fb49918, re-run ALL PASS exit 0 at d2e5335b post-interleave, both from
repo ROOT. Probe self-caught pre-verdict, disclosed (sweep-133/135
per-tool schema class): the walk-parse probe first keyed `distance`
where the core tool emits `dist` -- maxDist printed -1 until
re-anchored on the actual row schema and re-parsed; all four walk tools
had already exited 0 with ALL_PASS printed in their own output, no
re-run needed. Composite walk batch hit the 420s tool-layer timeout
AFTER all four tools completed (logs present, parsed) -- the 3-call
split shape remains the standing law for future ticks. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-137): longhouse + garden-cottage (115th cycle -- LRU chain:
@136 hall/bunkhouse, @135 inn/tower-house, @134 forge/potter, @133
row-cottage/market, @132 stable/observatory, @131
longhouse/garden-cottage -- longhouse and garden-cottage both last
walked sweep-131, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).

sweep-137: CLEAN SWEEP, steady-state tick. Census 307==307 (269 thing + 38
light) vs the committed sweep-136 baseline (sha16 0fd137c936560a28): 0
arrivals, 0 departures, 0 drift on all 307 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 084c22ed2a6b427d both epochs); no
sibling mutated the live world this window; HEAD stable at 6cea9e13
(sweep-136's own close) across the whole tick, gate re-run ALL PASS real
exit 0 post-evidence. Snapshot byte-identical, NO rewrite (sweep-106..136
precedent; 7-field projection law). Overlap: SAT fresh over the live set --
269 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed
to artwalk b26 choreography @ sweep-43, ninety-third sweep since routing,
NOT new, no escalation due (law keys severity-1); zero new contacts. Tier-1
4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38 maxDist (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts) --
each tool run individually per the 3-call split-shape law. Tier-2 115th
cycle per the committed pointer: longhouse 6/6 @ 0.3456
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (91st consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-B bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT -- base re-read
fresh immediately before append, 2370753, D+0/E+0. Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-138): stable +
observatory circuit (116th cycle -- LRU chain: @137 longhouse/garden-cottage,
@136 hall/bunkhouse, @135 inn/tower-house, @134 forge/potter, @133
row-cottage/market, @132 stable/observatory -- stable and observatory both
last walked sweep-132, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-stable.ts,
struct2-walk-observatory.ts).

sweep-138: CLEAN SWEEP, arrival + epoch-correction tick. Census epoch A fully
quiet (307==307 vs the committed sweep-137 baseline sha16 0fd137c936560a28,
raw sha16 084c22ed2a6b427d identical, no sibling had mutated when the tick
opened). Epoch B (20s-paced re-read) caught exactly ONE arrival —
nx-struct-sunflowerdial @ (2.48, 0.0189333, 70.96) yaw pi, lib
3f271a10fff20cc1, scale 1, comp {}, bbox 7.52x8.185x3.304 — struct-108 @
1147cbda committed mid-tick: its ledger line matches the observed tuple
line-for-line (pos/yaw/lib/comps, census 307->308 per its own entry),
domain-valid, not drift. Epoch C (further 20s-paced re-read) settled at 308,
0 departures, 0 drift on all 307 shared ids across id/pos/yaw/lib/scale/
kind/bbox. Per the polish-270 epoch law all affected evidence was re-taken
fresh before verdicts: SAT re-run at epoch B over the arrival-inclusive live
set — 270 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly
ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407, known Sev 2 routed
to artwalk b26 choreography @ sweep-43, ninety-fourth sweep since routing,
NOT new, no escalation due (law keys severity-1); the sunflowerdial itself is
SAT-clean (zero new contacts, corroborating struct-108's own +1.78 needlerest
fresh-307 gate), and the standing gate re-run ALL PASS real exit 0 at 1147cbda
post-evidence. Walk classification: the arrival sits r71 S (az178); every
tier-1 leg is r<20 and no S approach leg exists in the standing route list —
51m+ from the nearest walked waypoint, epoch-A walks stand by construction
(sweep-53/136 precedent), and struct-108's own two-way walk 6/6 @ 0.335
re-proves the site. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0: core 64/64 @ 0.38 maxDist (next-walk-core-paths.ts), NW 5/5 @
0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts). Probe disclosure (one paced retry class): the
NE walk's first run printed its COMPLETE ALL_PASS JSON (7/7 ok:true, valid
status object) but the process exited 124 — the timeout killed an open
handle AFTER the verdict, not a failed leg; per the one-paced-retry law the
tool was re-run once and returned real exit 0, 7/7 @ 0.38, identical
verdict. Tier-2 116th cycle per the committed pointer: stable 5/5 @ 0.396
(interior-walk-stable.ts) + observatory circuit 5/5 @ 0.389
(struct2-walk-observatory.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (92nd consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append, 2370754 (struct-108's D+1 absorbed
mid-tick), D+0/E+0. Snapshot rewritten per the sweep-136 chassis: 308
entities, 121587 bytes, sha16 491682d9a5c07a09, pre-write assertions (exactly
one arrival, zero departures, zero drift on shared ids, arrival tuple as
observed), post-rewrite drift vs live ZERO (308/308 exact). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-139):
row-cottage + market (117th cycle — LRU chain: @138 stable/observatory,
@137 longhouse/garden-cottage, @136 hall/bunkhouse, @135 inn/tower-house,
@134 forge/potter, @133 row-cottage/market — row-cottage and market both
last walked sweep-133, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-row-cottage.ts,
interior-walk-market.ts).

sweep-139: CLEAN SWEEP, steady-state tick. Census 308==308 (270 thing + 38
light) vs the committed sweep-138 baseline (sha16 491682d9a5c07a09): 0
arrivals, 0 departures, 0 drift on all 308 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 e1891c431dcf0e9c both epochs); no
sibling mutated the live world this window. survey-79 @ 80927a5b read-only
observer interleave absorbed (its own census corroborates 307 pre-arrival
on its side; zero mutations per its own ledger line; my epoch B corroborates
308 unchanged), gate re-run ALL PASS real exit 0 at the new HEAD from repo
ROOT. Snapshot byte-identical, NO rewrite (sweep-106..138 precedent; 7-field
projection law). Overlap: SAT fresh over the live set -- 270 bbox non-light,
236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, ninety-fifth sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts. Tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 maxDist
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
117th cycle per the committed pointer: row-cottage 6/6 @ 0.384
(interior-walk-row-cottage.ts) + market 6/6 @ 0.389 (interior-walk-market.ts),
both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (93rd consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on
fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT -- base re-read fresh immediately before append, 2370754, D+0/E+0.
Probe self-caught pre-verdict, disclosed (sweep-135 per-tool schema class):
the first core-walk parse probe assumed a flat legs array at top level and
died on the banner-interrupted JSON scan -- re-anchored on the actual schema
(recursive legs discovery under 'legs', banner-skipped first-brace scan);
the walk tool had already exited 0 with ALL_PASS printed in its own output,
no re-run needed. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-140): longhouse + garden-cottage (118th cycle -- LRU chain:
@139 row-cottage/market, @138 stable/observatory, @137 longhouse/
garden-cottage, @136 hall/bunkhouse, @135 inn/tower-house, @134
forge/potter, @133 row-cottage/market -- longhouse and garden-cottage both
last walked sweep-137, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).

sweep-140: CLEAN SWEEP, arrival tick. Census 308→309 (271 thing + 38 light)
vs the committed sweep-138 baseline (sha16 491682d9a5c07a09; sweep-139 was a
no-rewrite steady state): exactly ONE arrival — nx-struct-rule30wall @
(−8.37, 0.3872, 119.71) yaw 0, lib e70161322c42c2eb, scale 1, comp {} —
struct-109 @ c5f154af committed PRE-tick: the struct lane's ledger line
matches the observed tuple line-for-line (pos/yaw/lib, az184 r120, census
308→309 per its own entry), domain-valid, not drift. 0 departures, 0 drift
on all 308 shared ids across id/pos/yaw/lib/scale/kind/bbox. Epochs A/B
(20s-paced) identical raw sha16 61dcec449edc3149 — single stable epoch, no
sibling mutated the live world this window; survey-80/81 read-only observer
interleaves @ b1809c59/b3ea710a absorbed (zero mutations per their own
ledger lines; my epoch B corroborates 309 unchanged). Overlap: SAT fresh
over the arrival-inclusive live set — 271 bbox non-light, 236 classified,
0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26 choreography @
sweep-43, ninety-sixth sweep since routing, NOT new, no escalation due (law
keys severity-1); the rule30wall itself is SAT-clean (zero new contacts,
corroborating struct-109's own +6.19 dodecahedron fresh-308 gate). Walk
classification: the arrival sits r119.9 S (az184); every tier-1 leg is r<20
— 100m+ from the nearest walked waypoint, epoch-A walks stand by
construction (sweep-53/136/138 precedent), and struct-109's own placement
walk re-proves the site. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0: core 64/64 @ 0.38 maxDist (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 118th cycle per the committed
pointer: longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + 
garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both real
exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(94th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT -- base re-read fresh immediately before append, 2370755, D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start c5f154af, re-run ALL PASS
real exit 0 at b3ea710a after the survey interleaves, both runs from repo
ROOT. Snapshot rewritten per the sweep-138 chassis: 309 entities, 122015
bytes, sha16 f9c7338a758dbe50, pre-write assertions (exactly one arrival,
zero departures, zero drift on shared ids, arrival tuple as observed),
post-rewrite drift vs live ZERO (309/309 exact). Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-141): hall +
bunkhouse (119th cycle — LRU chain: @140 longhouse/garden-cottage, @139
row-cottage/market, @138 stable/observatory, @137 longhouse/garden-cottage,
@136 hall/bunkhouse, @135 inn/tower-house, @134 forge/potter — hall and
bunkhouse both last walked sweep-136, now the stalest standing pair; both
walk tools verified present on disk this tick: interior-walk-hall.ts,
interior-walk-bunkhouse.ts).

sweep-141: CLEAN SWEEP, arrival + epoch-correction tick. Census epoch A fully
quiet (309==309 vs the committed sweep-140 baseline sha16 f9c7338a758dbe50:
0 arrivals, 0 departures, 0 drift on all 309 shared ids across
id/pos/yaw/lib/scale/kind/bbox; raw sha16 61dcec449edc3149, byte-identical
to sweep-140's close). Epoch B (20s-paced re-read after the walk battery)
caught exactly ONE arrival — nx-struct-tesseract @ (−9.07, 0.1478621615839162,
129.68) yaw 0, lib 4c14467776d58748, scale 1, comp {}, bbox 9.12×5.45×9.12 —
struct-110 in flight: no [struct-110] ledger entry at HEAD yet, but the
uncommitted placer next-place-struct110.ts pins exactly this tuple
line-for-line (POS/YAW constants match the live read to full precision;
sweep-30/91 uncommitted-placer class), struct-lane domain prefix, r130.1 S
(az184) extending the S mathematics axis beyond rule30wall, scale/pose sane.
0 departures, 0 drift on 309 shared ids at both epochs. CORRECTION OF RECORD
(pre-commit, my own uncommitted block): struct-110's ledger entry landed in
the shared file between my epoch-B catch and my append — the arrival is now
LEDGER-MATCHED, not just placer-matched ([struct-110]: az184 r130
(−9.07,0.1479,129.68) yaw 0, sha 4c14467776d58748 x2 deterministic, SAT
+4.89 rule30wall fresh-309, PLACED_VERIFIED census 309→310 — reconciles with
my observed tuple line-for-line), and the ledger base advanced
2370755→2370756 (struct-110 D+1) between my first probe and the append;
ledger-append.py's own fresh re-read at append time closed the law EXACT at
2370756. survey-82/83
read-only observers @ 0beca1a3/9a3878a2 interleaved (both zero-mutation
holds; their own census reads corroborate 309==309 on their side of my
epoch-B arrival). Per the polish-270 epoch law all affected evidence was
re-taken fresh before verdicts: SAT re-run at epoch B over the
arrival-inclusive live set — 272 bbox non-light, 236 classified, 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407, known Sev 2 routed to artwalk b26 choreography @ sweep-43,
ninety-seventh sweep since routing, NOT new, no escalation due (law keys
severity-1); the tesseract itself is SAT-clean (zero new contacts, 9.12m
footprint at r130.1 with its nearest neighbor rule30wall 10m+ along-axis).
Walk classification: the arrival sits r130.1 S; every tier-1 leg is r<20 —
110m+ from the nearest walked waypoint, epoch-A walks stand by construction
(sweep-53/136/138/140 precedent); SAT re-run covers the collision surface.
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core
64/64 @ 0.38 maxDist (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Tier-2 119th cycle per the committed pointer: hall
8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803
(interior-walk-bunkhouse.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (95th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append, canonical slice 2336002 + D+33788 E+965 =
2370755 (survey-82/83 observer holds D+0/E+0, no absorption needed), D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 0beca1a3 (content-anchored
run) + re-run ALL PASS real exit 0 at 9a3878a2 post-arrival (unmasked exit
capture), both runs from repo ROOT. Snapshot rewritten per the sweep-140
chassis: 310 entities, 122425 bytes, sha16 26747e696973d352, pre-write
assertions (exactly one arrival, zero departures, zero drift on shared ids,
arrival tuple as observed and placer-matched), post-rewrite drift vs live
ZERO (310/310 exact). Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-142): inn + tower-house (120th cycle — LRU chain: @141
hall/bunkhouse, @140 longhouse/garden-cottage, @139 row-cottage/market,
@138 stable/observatory, @137 longhouse/garden-cottage, @136 hall/bunkhouse,
@135 inn/tower-house — inn and tower-house both last walked sweep-135, now
the stalest standing pair; both walk tools verified present on disk this
tick: interior-walk-inn.ts, interior-walk-tower-house.ts).

sweep-142: CLEAN SWEEP, fully quiet steady-state tick. Census 310==310 at
both epochs (272 thing + 38 light) vs the committed sweep-141 baseline
(sha16 26747e696973d352): 0 arrivals, 0 departures, 0 drift on all 310
shared ids across id/pos/yaw/lib/scale/kind/bbox. Representation note
(disclosed, sweep-35 like-for-like class): the live /geom payload now
emits lib values as store/<sha16>.glb and null instead of empty-string
for light companions — every hash identical under the prefix strip; the
sibling lane's in-tree server.ts/world.ts modifications carry it;
classified as payload-schema change, NOT drift. Because of it the raw
snapshot was NOT rewritten this tick (baseline id/pos/yaw/lib/scale/
kind/bbox fields remain exact under normalization); recorded here as the
known representation epoch for the next sweep's baseline comparison.
Epochs A/B (20s-paced) identical — single stable epoch, no sibling
mutated the live world this window; survey-84 (@ 9e225a1b) read-only
observer interleave absorbed, zero mutations per its own ledger line.
Overlap: SAT fresh over the live set — 272 bbox non-light, 236
classified, 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2 routed to artwalk
b26 choreography @ sweep-43, ninety-eighth sweep since routing, NOT new,
no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
maxDist (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Tier-2 120th cycle per the committed pointer:
inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both real exit 0. Probe self-catches
pre-verdict: (a) first census diff reported 310 lib "drifts" — the
store/ prefix artifact, normalized before classification; (b) approach
walk extractor keyed dist/distance schema wrong twice before reading
the actual per-leg fields (sweep-48 class); (c) walk-schema results[0]
uses distance not dist. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (96th consecutive clean); sweep89-battery 28/28
ALL PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable,
read fresh. Ledger law EXACT — canonical base 2336002 slice, tool
verifies law() before and after append. Standing gate ALL PASS real
exit 0 at tick-start 222d5981 (content-anchored) + re-run ALL PASS real
exit 0 at 9e225a1b after the survey-84 interleave, both runs from repo
ROOT. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-143): forge + potter (121st cycle — LRU chain: @142
inn/tower-house, @141 hall/bunkhouse, @140 longhouse/garden-cottage,
@139 row-cottage/market, @138 stable/observatory, @137
longhouse/garden-cottage, @136 hall/bunkhouse — forge and potter both
last walked sweep-134, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-forge.ts,
interior-walk-potter.ts).

sweep-143: CLEAN SWEEP, fully quiet steady-state tick. Census 310==310 at
both epochs (272 thing + 38 light) vs the committed sweep-142 baseline
(sha16 26747e696973d352, normalized under the known store/-prefix +
null-for-lights representation epoch): 0 arrivals, 0 departures, 0 drift
on all 310 shared ids across id/pos/yaw/lib/scale/kind/bbox; raw sha16
a7660d429480d0f1 byte-identical across the 20s-paced epochs A and B —
single stable epoch, no sibling mutated the live world this window.
Snapshot NOT rewritten (byte-identical, sweep-106..142 precedent;
baseline remains current). Overlap: SAT fresh over the live set — 272
bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2
routed to artwalk b26 choreography @ sweep-43, ninety-ninth sweep since
routing, NOT new, no escalation due (law keys severity-1). Walks:
tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 —
core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts). Tier-2 121st cycle per the committed
pointer: forge 6/6 @ 0.375 (interior-walk-forge.ts) + potter 6/6 @ 0.366
(interior-walk-potter.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (97th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base re-read fresh immediately before append (running total
2370756 at probe, tool verifies law() before and after append), D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 57428bc0, run from
repo ROOT. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-144): stable + observatory (122nd cycle — LRU chain: @143
forge/potter, @142 inn/tower-house, @141 hall/bunkhouse, @140
longhouse/garden-cottage, @139 row-cottage/market, @138
stable/observatory, @137 longhouse/garden-cottage — stable and
observatory both last walked sweep-138, now the stalest standing pair;
both walk tools verified present on disk this tick:
interior-walk-stable.ts, struct2-walk-observatory.ts).

sweep-144: CLEAN SWEEP, arrival tick. Census 310→311 (273 thing + 38
light) vs the committed sweep-143 baseline (sha16 26747e696973d352,
normalized under the known store/-prefix + null-for-lights representation
epoch): exactly ONE domain-valid arrival nx-struct-lorenz @
(−9.77, −0.0279, 139.66) yaw 0, lib 77b59dbbcb8bfb59, scale 1, comp {}
— struct-111 @ 178aa7ad (the tick's starting HEAD, committed PRE-tick),
tuple matching its committed ledger line-for-line (sha exact, S-axis az184
r140 10m cadence behind tesseract, its census 310→311 PLACED_VERIFIED
corroborated sweep-side). 0 departures, 0 drift on all 310 shared ids
across id/pos/yaw/lib/scale/kind/bbox; epochs A and B (20s-paced)
byte-identical, raw sha16 56d2eb580a0844be — single stable epoch.
Snapshot rewritten like-for-like (7-field projection, indent=1): 311
entities / 122844B / sha16 460774e12507efb2, pre-write assertions
(exactly one arrival, zero departures, zero drift), post-rewrite drift vs
live ZERO (311/311 exact). Overlap: SAT fresh over the live set — 273
bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2 routed
to artwalk b26 choreography @ sweep-43, one-hundredth sweep since routing,
NOT new, no escalation due (law keys severity-1). The lorenz arrival is
SAT-clean with zero new contacts — struct-111's +1.91 clearance claim
corroborated sweep-side. Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts); the
arrival sits r140.6 S, 100m+ off every walked leg, and the walks were run
fresh this wakeup regardless (law: never claim a route that was not
walked this wakeup). Tier-2 122nd cycle per the committed pointer: stable
5/5 @ 0.396 (interior-walk-stable.ts) + observatory 5/5 @ 0.389
(struct2-walk-observatory.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (98th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append (running total 2370757, struct-111's D+1
already absorbed; tool verifies law() before and after append), D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 178aa7ad, run from repo
ROOT. Zero world mutations, zero defect notes, zero uploads, zero verbs,
zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-145): inn + tower-house (123rd cycle — LRU chain: @144
stable/observatory, @143 forge/potter, @142 inn/tower-house — inn and
tower-house both last walked sweep-142, now the stalest standing pair;
both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).

sweep-146: CLEAN SWEEP, arrival + epoch-correction tick. Census epoch A fully
quiet (311==311 vs the committed sweep-144 baseline sha16 460774e12507efb2,
under the store/-prefix + null-for-lights representation epoch): 0 arrivals,
0 departures, 0 drift on all 311 shared ids across id/pos/yaw/lib/scale/kind/
bbox. Epoch B (20s-paced re-read after the walk battery) caught exactly ONE
arrival — nx-struct-chladni @ (−10.46, −0.0351, 149.63) yaw 0, lib
e7fdc231dc9788d3, scale 1, comp {} — struct-112 @ d6e731f9 committed
PRE-tick (the tick's starting HEAD lineage): the struct lane's ledger entry
matches the observed tuple line-for-line (sha exact, az184 r150 S-axis 10m
cadence behind lorenz, its census 311→312 PLACED_VERIFIED corroborated
sweep-side, its +5.90 SAT clearance corroborated sweep-side). 0 departures,
0 drift on 311 shared ids at both epochs. survey-93/94 read-only observer
interleaves absorbed (zero mutations per their own ledger lines). Per the
polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: SAT re-run at epoch B over the arrival-inclusive live set — 274
bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2 routed
to artwalk b26 choreography @ sweep-43, one-hundred-and-second sweep since
routing, NOT new, no escalation due (law keys severity-1); the chladni
itself is SAT-clean (zero new contacts). Walk classification: the arrival
sits r150 S; every tier-1 leg is r<20 — 130m+ from the nearest walked
waypoint, epoch-A walks stand by construction (sweep-53/136/138/140/144
precedence), and the walks were run fresh this wakeup regardless (law:
never claim a route that was not walked this wakeup). Tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 maxDist
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
124th cycle per the committed pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803
(interior-walk-bunkhouse.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (100th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-B bytes
(comp-bearing 21, lights 38, R-121 tuple-stable pin green); interlane md5
f6254cd0 stable, read fresh. Ledger law EXACT — base re-read fresh
immediately before append (2370757 at probe; struct-112's D+1 absorbed =
2370758 at append), D+0/E+0. Standing gate ALL PASS real exit 0 at
tick-start d35ba964, re-run ALL PASS real exit 0 at 1c83ca7a after the
arrival + survey interleaves, both runs from repo ROOT. Snapshot rewritten
like-for-like (committed order preserved, arrival appended): 312 entities,
123242 bytes, sha16 cd7dd2a21cd8327d, pre-write assertions (exactly one
arrival, zero departures, zero drift on shared ids, arrival tuple as
observed), post-rewrite drift vs live ZERO (312/312 exact). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-147):
longhouse + garden-cottage (125th cycle — LRU chain: @146 hall/bunkhouse,
@145 inn/tower-house, @144 stable/observatory, @143 forge/potter, @142
inn/tower-house, @141 hall/bunkhouse, @140 longhouse/garden-cottage —
longhouse and garden-cottage both last walked sweep-140, now the stalest
standing pair; both walk tools verified present on disk this tick:
interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).


sweep-145: CLEAN SWEEP, fully quiet steady-state tick. Census 311==311 at
both epochs (273 thing + 38 light) vs the committed sweep-144 baseline
(sha16 460774e12507efb2, normalized under the known store/-prefix +
null-for-lights representation epoch): 0 arrivals, 0 departures, 0 drift
on all 311 shared ids across id/pos/yaw/lib/scale/kind/bbox; epochs A
and B (20s-paced) byte-identical, raw sha16 56d2eb580a0844be — single
stable epoch, no sibling mutated the live world this window. Snapshot
NOT rewritten (baseline byte-current, sweep-106..144 precedent). Overlap:
SAT fresh over the live set — 273 bbox non-light, 236 classified, 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26 choreography
@ sweep-43, one-hundred-and-first sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 123rd cycle per the committed pointer: inn 6/6 @ 0.364
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (99th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append (tool verifies law() before and after
append), D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start
6dcbd8d9, run from repo ROOT. Zero world mutations, zero defect notes,
zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-146): hall + bunkhouse (124th cycle —
LRU chain: @145 inn/tower-house, @144 stable/observatory, @143
forge/potter, @142 inn/tower-house, @141 hall/bunkhouse — hall and
bunkhouse both last walked sweep-141, now the stalest standing pair;
both walk tools verified present on disk this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).

sweep-147: CLEAN SWEEP, fully quiet steady-state tick. Census 312==312 at
both epochs (274 thing + 38 light) vs the committed sweep-146 baseline
(sha16 cd7dd2a21cd8327d, normalized under the known store/-prefix +
null-for-lights representation epoch): 0 arrivals, 0 departures, 0 drift
on all 312 shared ids across id/pos/yaw/lib/scale/kind/bbox; epochs A
and B (20s-paced) byte-identical, raw sha16 1c1337a9025c3117 — single
stable epoch, no sibling mutated the live world this window. HEAD
advanced twice mid-tick (survey-95 @ f384deb0, survey-96 @ 5962d64e) —
both read-only observer holds, D+0/E+0 per their own messages, census
corroborated quiet at both epochs. Snapshot NOT rewritten (baseline
byte-current, sweep-106..146 precedent). Overlap: SAT fresh over the
live set — 274 bbox non-light, 236 classified, 0 coverage holes, exit 3
on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407,
known Sev 2 routed to artwalk b26 choreography @ sweep-43,
one-hundred-and-third sweep since routing, NOT new, no escalation due
(law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 125th cycle per the committed pointer: longhouse 6/6 @ 0.3456
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (101st
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base re-read fresh immediately before append (tool verifies
law() before and after append), D+0/E+0. Standing gate ALL PASS real
exit 0 at tick-start 4eca2554, run from repo ROOT. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-148): stable + market (126th cycle — LRU chain: @147
longhouse/garden-cottage, @146 hall/bunkhouse, @145 inn/tower-house,
@144 stable/observatory, @143 forge/potter — market last walked
sweep-118, stable last walked sweep-144, now the stalest standing
pair; both walk tools verified present on disk this tick:
interior-walk-stable.ts, interior-walk-market.ts).

sweep-148: CLEAN SWEEP, fully quiet steady-state tick. Census 312==312 at
both epochs (274 thing + 38 light) vs the committed baseline (sha16
cd7dd2a21cd8327d): 0 arrivals, 0 departures, 0 drift on all 312 shared
ids across id/pos/yaw/lib/scale/kind/bbox; epochs A and B (20s-paced)
byte-identical, raw sha16 6e90180315a0676d — single stable epoch, no
sibling mutated the live world this window. REPRESENTATION EPOCH (noted,
classified, no world change): live /geom now emits comp/compKeys on every
entity including empty bags, and omits bbox on light-kind entities (was
bbox:null) — the standard 5-field diff reads fully quiet while the raw
payload sha differs from sweep-147's 1c1337a9025c3117; an all-field scan
attributed all 662 field diffs to exactly these two schema changes
(sweep-56 comps-artifact class + sweep-142 lights-representation class),
and every comp VALUE matches the standing fleet pins (carousel exact 7,
hamlet embers 5-of-5, belltower ladder, potter pwheel, windmill
sails+millstone, h6/h7 motion, hearth, forge, orrery, screwwell,
reuleauxrotor, shelltower socket, tower socket, moonmoth, court smoke,
house-35_-22 structure). Baseline NOT rewritten (classified fields
byte-current, sweep-106..147 precedent). Overlap: SAT fresh over the
live set — 274 bbox non-light, 236 classified, 0 coverage holes, exit 3
on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407,
known Sev 2 routed to artwalk b26 choreography @ sweep-43,
one-hundred-and-fourth sweep since routing, NOT new, no escalation due
(law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts;
first chained run hit the 400s tool timeout on the SW leg — one paced
retry per malformed-live-response discipline returned ALL_PASS, sweep-12
class). Tier-2 126th cycle per the committed pointer: stable 5/5 @
0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (102nd
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start d8e8da99
(survey-97 read-only hold), run from repo ROOT. Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-149): inn +
tower-house (127th cycle — LRU chain: @148 stable/market, @147
longhouse/garden-cottage, @146 hall/bunkhouse, @145 inn/tower-house —
inn and tower-house both last walked sweep-145, now the stalest standing
pair; both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).

sweep-149: CLEAN SWEEP, fully quiet steady-state tick. Census 312==312 at
both epochs (274 thing + 38 light) vs the committed baseline (sha16
cd7dd2a21cd8327d): 0 arrivals, 0 departures, 0 drift on all 312 shared
ids across id/pos/yaw/lib/scale/kind/bbox. REPRESENTATION EPOCH #3
(noted, classified, no world change): live /geom flipped BACK to the
sweep-147-era schema — tris/parent fields restored on all 274 things
(93592 tris on the carousel), compKeys dropped, mounts null→{} — so the
epoch raw sha16 is again 1c1337a9025c3117 (equals sweep-147's recorded
raw sha; the epoch-A capture is BYTE-IDENTICAL to sweep-147-raw by cmp,
92218B). Against sweep-148's 6e90180315a0676d capture the full-field
diffs are exactly compKeys↔tris + mounts representation + entity order;
comp VALUES and all canonical fields are identical on every shared id.
Classified as a server-side schema flip-back (sibling server lane in
flight — server.ts/world.ts sit dirty in the worktree), compared
like-for-like on canonical fields per the sweep-80 law, no snapshot
rewrite (baseline current, sweep-106..148 precedent). Overlap: SAT fresh
over the live set — 274 bbox non-light, 236 classified, 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-
mapboard −0.407, known Sev 2 routed to artwalk b26 choreography @
sweep-43, one-hundred-and-fifth sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 127th cycle per the committed pointer: inn 6/6 @ 0.3640
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (103rd
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-B bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base re-read fresh immediately before append, D+0/E+0. Standing
gate ALL PASS real exit 0 at tick-start c2f569e8, re-run ALL PASS exit 0
at 0bb00948 post-interleave (survey-103 read-only D+0/E+0 hold), both
runs from repo ROOT. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-150): forge + potter (128th cycle — LRU chain:
@149 inn/tower-house, @148 stable/market, @147 longhouse/garden-cottage,
@146 hall/bunkhouse; forge and potter both last walked sweep-143, now
the stalest standing pair by committed-table derivation; both walk tools
verified present on disk this tick: interior-walk-forge.ts,
interior-walk-potter.ts).

sweep-150: CLEAN SWEEP, fully quiet steady-state tick. Census 312==312 at
both epochs (274 thing + 38 light) vs the committed baseline (sha16
cd7dd2a21cd8327d): 0 arrivals, 0 departures, 0 drift on all 312 shared
ids across id/pos/yaw/lib/scale/kind/bbox; epochs A and B (20s-paced)
byte-identical, raw sha16 6e90180315a0676d. REPRESENTATION EPOCH #4
(noted, classified, no world change): the /geom schema flipped back to
the sweep-148-era compKeys representation — compKeys on all 312
entities, no tris on things — so the raw sha equals sweep-148's recorded
raw while sweep-149's was 1c1337a9025c3117 (tris-era). Canonical fields
proven identical by the zero-diff against the committed baseline; same
server-lane flap class as representation epochs #2/#3, compared
like-for-like per the sweep-80 law, no snapshot rewrite (baseline
current, sweep-106..149 precedent). Mid-tick HEAD advance survey-106
(0add15b4, read-only D+0/E+0 hold) corroborates the quiet epoch. Overlap:
SAT fresh over the live set — 274 bbox non-light, 236 classified, 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26 choreography @
sweep-43, one-hundred-and-sixth sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 128th cycle per the committed pointer: forge 6/6 @ 0.375
(interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts),
both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK
real exit 0 (104th consecutive clean); sweep89-battery 28/28 ALL PASS
exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable, read
fresh. Ledger law EXACT — tool self-verifies law() before and after
append, D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start
eb525201, re-run ALL PASS exit 0 at 0add15b4 post-interleave (survey-106
read-only D+0/E+0 hold), both runs from repo ROOT. Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-151): hall +
bunkhouse (129th cycle — LRU chain: @150 forge/potter, @149
inn/tower-house, @148 stable/market, @147 longhouse/garden-cottage,
@146 hall/bunkhouse; hall and bunkhouse both last walked sweep-146, now
the stalest standing pair by committed-table derivation; both walk tools
verified present on disk this tick: interior-walk-hall.ts,
interior-walk-bunkhouse.ts).


sweep-151: CLEAN SWEEP, fully quiet steady-state tick. Census 312==312 at
both epochs (274 thing + 38 light) vs the committed baseline (sha16
cd7dd2a21cd8327d): 0 arrivals, 0 departures, 0 drift on all 312 shared
ids across id/pos/yaw/lib/scale/kind/bbox; epochs A and B (20s-paced)
byte-identical, raw sha16 6e90180315a0676d — representation epoch #4
(compKeys schema) stable, same raw as sweep-148/150; no snapshot rewrite
(baseline current, sweep-106..150 precedent). Mid-tick HEAD advance
survey-109 (d830ffbc, read-only D+0/E+0 hold) corroborates the quiet
epoch; gate re-run per epoch law. Overlap: SAT fresh over the live set —
274 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly
ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2
routed to artwalk b26 choreography @ sweep-43, one-hundred-and-seventh
sweep since routing, NOT new, no escalation due (law keys severity-1);
zero new contacts. Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts),
NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38
(ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
129th cycle per the committed pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803
(interior-walk-bunkhouse.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (105th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — tool self-verifies law() before and after append, D+0/E+0,
2370758. POINTER SELF-CATCH disclosed: this tick's first-draft next-pair
prose named row-cottage + market, but the committed-table derivation
run fresh this tick shows market was walked sweep-148 while observatory
(last walked sweep-144) is the true stalest partner — corrected in the
uncommitted ledger entry BEFORE first commit, law re-verified exact.
Standing gate ALL PASS real exit 0 at tick-start af4a145e, re-run ALL
PASS real exit 0 at d830ffbc post-interleave (survey-109 read-only
D+0/E+0 hold), both runs from repo ROOT. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-152): row-cottage
+ observatory circuit (130th cycle — LRU chain: @151 hall/bunkhouse,
@150 forge/potter, @149 inn/tower-house, @148 stable/market, @147
longhouse/garden-cottage; row-cottage last walked sweep-139 and
observatory circuit last walked sweep-144, now the stalest standing pair
by committed-table derivation; both walk tools verified present on disk
this tick: interior-walk-row-cottage.ts, struct2-walk-observatory.ts).

sweep-152: CLEAN SWEEP, epoch-corrected tick. Census epochs A and B (20s-paced)
312==312 byte-identical vs the committed baseline (sha16 cd7dd2a21cd8327d) —
0 arrivals, 0 departures, 0 drift on all 312 shared ids across
id/pos/yaw/lib/scale/kind/bbox, representation epoch #4 stable (raw sha16
6e90180315a0676d, compKeys schema). While tier-2 walks ran, struct-114 (ecd059c6)
placed THE SHATTERED MONOLITH live AFTER epoch B, so per the polish-270 epoch law
all affected evidence was re-taken fresh before verdicts: epoch-C census 313 with
exactly ONE domain-valid arrival nx-struct-voronoi @ (−11.16, −0.04643, 159.61)
yaw 0 lib 00b94c926392cece (tuple ledger-exact line-for-line vs struct-113's
pinned build hash and struct-114's PLACED_VERIFIED; 0 departures, 0 drift on 312
shared ids), SAT re-run over the 275-set (275 bbox non-light, 236 classified,
0 coverage holes, exit 3 on the same single known unclassified R-121 — voronoi
SAT-clean, zero new contacts), standing gate re-run ALL PASS real exit 0 at
ecd059c6. Voronoi sits r160 S-axis — 140m+ off every tier-1/tier-2 waypoint —
so epoch-A walks stand by construction (sweep-146 chladni r150 precedent).
Overlap: exit 3 on ONLY R-121 (lamp-n | nx-town-mapboard −0.407), known Sev 2
routed to artwalk b26 choreography @ sweep-43, 108th sweep since routing, NOT
new, no escalation due (law keys severity-1). Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 (next-walk-core-paths.ts),
NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW
5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 130th cycle per the committed pointer:
row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory circuit
5/5 (struct2-walk-observatory.ts), both ALL_PASS real exit 0, per-leg ok:true
counts verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (106th consecutive clean); sweep89-battery 28/28 ALL PASS on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT —
canonical tool self-verifies law() before and after append, D+0/E+0 (struct-114
D+1 base absorbed, re-read fresh immediately before append). Standing gate ALL
PASS real exit 0 at tick-start 07711e28 and mid-tick at daef3343 (survey-111
read-only D+0/E+0 hold corroborating the quiet epoch), re-run ALL PASS real
exit 0 at ecd059c6 post-arrival, all three runs from repo ROOT. Snapshot
rewritten to epoch C: 123658B / 313 entities / TRUE sha16 b19424bed4405703, pre-write
assertions green (exactly one arrival, 0 departures, 0 drift), post-rewrite
drift vs live ZERO. Probe self-catches pre-verdict, both disclosed: (a) the
first snapshot-rewrite attempt asserted lib strictly and fired PRE-write
fail-closed (committed baseline stores bare 16-hex while the live schema emits
store/<hash>.glb — schema drift since the sweep-97-era chassis); re-based the
rewrite on norm_lib like-for-like per the standing census-diff tool, zero
collateral (baseline untouched until the assert-clean write). (b) The core-walk
parser keyed the wrong result shape twice (leading log line + top-level counts
schema; sweep-48 class) — re-anchored on top-level status/legs/maxArrival and
per-leg ok-true greps. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-153): longhouse + garden-cottage (131st cycle — LRU chain: @152
row-cottage/observatory, @151 hall/bunkhouse, @150 forge/potter, @149
inn/tower-house, @148 stable/market; longhouse last walked sweep-147 and
garden-cottage last walked sweep-147, now the stalest standing pair by
committed-table derivation; both walk tools verified present on disk this
tick: interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).

sweep-153: CLEAN SWEEP, fully quiet steady-state tick. Census 313==313 at both
epochs (275 thing + 38 light) vs the committed baseline (sha16 b19424bed4405703):
0 arrivals, 0 departures, 0 drift on all 313 shared ids across
id/pos/yaw/lib/scale/kind/bbox — epochs A and B (20s-paced) byte-identical.
Representation epoch #5 observed and classified: the raw /geom payload changed
from the compKeys schema (raw 6e90180315a0676d, sweeps 146-152) to
{tris, parent, top-level mounts} (raw 092abf42e7006991) — the deployed endpoint
now matches committed HEAD routes.ts:346-349 exactly (parent/comp + bbox/tris +
mounts), i.e. the compKeys era was a transient deployed-server state that has
reconverged on committed code. Classified representation-only per the sweep-80
law: the canonical 7-field projection diffs 0/0/0, all comp-bearing checks
(battery 28/28, pins 15/15) pass on the new shape, bboxes byte-equal 275/275
vs sweep-152's capture. Baseline NOT rewritten — it stays current like-for-like;
future ticks comparing raw shas will see the same discontinuity and should
recognize epoch #5. Overlap: SAT fresh over the live set — 275 bbox non-light,
236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 109th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Probe self-catch pre-verdict, disclosed: the first
approach-walk run keyed the wrong filenames (nw-approach1 vs
nw-approach1-walk — three exit-1 module-not-found errors, no live contact,
corrected before any verdict was drawn). Tier-2 131st cycle per the committed
pointer: longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + garden-cottage
6/6 @ 0.355 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0,
per-leg ok:true counts verified. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (107th consecutive clean); sweep89-battery 28/28 ALL
PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable, read
fresh. Ledger law EXACT — canonical tool self-verifies law() before and after
append, D+0/E+0, base re-read fresh immediately before append. Standing gate
ALL PASS real exit 0 at tick-start a206c346, re-run ALL PASS real exit 0 at
c5457dde post-interleave (survey-115 6c94c412 + survey-116 c5457dde read-only
D+0/E+0 holds, both corroborating the quiet epoch), both runs from repo ROOT.
Zero world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-154):
stable + market (132nd cycle — LRU chain: @153 longhouse/garden-cottage, @152
row-cottage/observatory, @151 hall/bunkhouse, @150 forge/potter, @149
inn/tower-house, @148 stable/market; stable and market last walked sweep-148,
now the stalest standing pair by committed-table derivation; both walk tools
verified present on disk this tick: interior-walk-stable.ts,
interior-walk-market.ts).

sweep-154: CLEAN SWEEP, epoch-corrected tick (struct-115 zeno arrival absorbed).
Census epoch A fully quiet vs the committed sweep-153 baseline (sha16
b19424bed4405703): 313==313, 0 arrivals, 0 departures, 0 drift on all 313
shared ids across id/pos/yaw/lib/scale/kind/bbox. Raw /geom sha16
092abf42e7006991 = representation epoch #5 STABLE (byte-identical to
sweep-153's recorded raw). Probe self-catch pre-verdict, disclosed: my first
epoch-A capture used the census tool's 11-field projection rather than the
raw /geom payload, so its sha16 (37ea01928a70b988) did not match sweep-153's
recorded raw — classified as projection-tooling difference, NOT world drift,
by re-fetching the raw payload and matching 092abf42e7006991 byte-for-byte;
no verdict was drawn on the mismatched projection. Then struct-115 (THE ZENO
GATES, az184 r180 S-axis, infinite-series family debut) landed mid-tick at
1b86e6d3 AFTER epoch A: epoch B caught exactly ONE domain-valid arrival
nx-struct-zeno at (−12.556165273942469, −0.04120083928229684,
179.4615290467684) yaw π, lib 78a3e90e458bfb43, scale 1, comp [], bbox
3.2×3×8.472 — ledger-matched line-for-line to struct-115 (sha ==
its pinned x3-deterministic build hash; census 313→314 PLACED_VERIFIED
corroborated sweep-side). 0 departures, 0 drift on 313 shared ids. Per the
polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: epoch-B raw census, SAT re-run over the 314-set (276 bbox
non-light, 236 classified, 0 coverage holes), standing gate re-run ALL PASS
real exit 0 at 1b86e6d3. Snapshot rewritten with pre-write assertion
(arrivals exactly [zeno], 0 departures, 0 drift): 124097B / 314 entities /
sha16 44b804c33a856b59, post-rewrite drift ZERO. Overlap: exit 3 on ONLY the
known R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to
artwalk b26 choreography @ sweep-43, 110th sweep since routing, NOT new, no
escalation due (law keys severity-1). Zeno SAT-clean with zero new contacts.
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 —
core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Zeno sits r180 on the S axis, 160m+ off every
tier-1 waypoint — epoch-A walks stand by construction (sweep-152 voronoi
r160 precedent). Tier-2 132nd cycle per the committed pointer: stable 5/5 @
0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both ALL_PASS real exit 0, per-leg ok:true counts
verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(108th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT
— canonical tool self-verifies law() before and after append, D+0/E+0, base
re-read fresh immediately before append (struct-115 D+1 absorbed mid-tick).
Standing gate ALL PASS real exit 0 at tick-start b2038b07, re-run ALL PASS
real exit 0 at 1b86e6d3 post-arrival, both runs from repo ROOT (the single
fail-grep hit at tick-start was the word 'fail-closed' inside survey-117's
PASS commit-message line — output-only, sweep-118 count-churn class). Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-155):
inn + tower-house (133rd cycle — LRU chain: @154 stable/market, @153
longhouse/garden-cottage, @152 row-cottage/observatory, @151 hall/bunkhouse,
@150 forge/potter, @149 inn/tower-house now the stalest standing pair at 6
sweeps; both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).

sweep-155: CLEAN SWEEP, fully quiet steady-state tick. Census 314==314 at
both epochs (276 thing + 38 light) vs the committed sweep-154 baseline
(sha16 44b804c33a856b59): 0 arrivals, 0 departures, 0 drift on all 314
shared ids across id/pos/yaw/lib/scale/kind/bbox — epochs A and B (20s-paced)
byte-identical raw /geom sha16 58e82babca9e87da, which IS sweep-154's
epoch-B raw byte-for-byte: representation epoch #5 stable, the live world
unchanged since sweep-154's final read, no flap. No snapshot rewrite (baseline
current, sweep-106..154 precedent). Probe self-catch pre-verdict, disclosed:
my first raw-sha comparison keyed sweep-153's 313-entity epoch-A raw
(092abf42) as the expected epoch-#5 value and flagged 58e82bab as a mismatch;
cmp proved the new capture byte-identical to sweep-154's epoch-B raw —
projection-class confusion in MY probe, not world drift, corrected before any
verdict (sweep-154 class). Overlap: SAT fresh over the live set — 276 bbox
non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 111th sweep since routing, NOT new,
no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
133rd cycle per the committed pointer: inn 6/6 @ 0.364
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok:true
counts verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (109th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on
fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append, D+0/E+0,
base re-read fresh immediately before append (struct-116 read-only re-judge,
no placement, absorbed). Standing gate ALL PASS real exit 0 at tick-start
80edb60a, re-run ALL PASS real exit 0 at 80edb60a post-evidence — HEAD
static through the whole tick, zero sibling commits since struct-116's
refinement tick. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-156): forge + potter (134th cycle — LRU chain: @155
inn/tower-house, @154 stable/market, @153 longhouse/garden-cottage, @152
row-cottage/observatory, @151 hall/bunkhouse, @150 forge/potter now the
stalest standing pair at 5 sweeps; both walk tools verified present on disk
this tick: interior-walk-forge.ts, interior-walk-potter.ts).

sweep-156: CLEAN SWEEP, fully quiet steady-state tick. Census 314==314 at
both epochs (276 thing + 38 light) vs the committed sweep-154 baseline (sha16
44b804c33a856b59): 0 arrivals, 0 departures, 0 drift on all 314 shared ids
across id/pos/yaw/lib/scale/kind/bbox — epochs A and B (20s-paced)
byte-identical raw /geom sha16 58e82babca9e87da, representation epoch #5
stable, the live world static through the whole tick. No snapshot rewrite
(baseline current, sweep-106..155 precedent). Probe self-catch pre-verdict,
disclosed: my first epoch-B diff one-liner indexed B['entities'] AFTER
converting B to an id-dict — a KeyError that I initially misread as a
malformed fetch; reading my own script (sweep-48 class) showed the raw
capture was valid JSON with HTTP 200 both fetches, corrected diff ran clean
0/0/0. Overlap: SAT fresh over the live set — 276 bbox non-light, 236
classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26
choreography @ sweep-43, 112th sweep since routing, NOT new, no escalation
due (law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts),
NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 134th cycle per the committed
pointer: forge 6/6 (interior-walk-forge.ts) + potter 6/6
(interior-walk-potter.ts), both ALL_PASS real exit 0, per-leg ok:true counts
verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(110th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT
— canonical tool self-verifies law() before and after append, D+0/E+0, base
re-read fresh immediately before append. Standing gate ALL PASS real exit 0
at tick-start 1d4203af. Terminal-parser note, disclosed: the shell
for-loop wrapper around the approach/tier-2 walk batches tripped the
hardline inline-payload block twice (saved-script recovery path used, no
operation suppressed — every walk tool ran to real exit 0 through the
sanctioned saved-script / clean-script route). Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use (D+0, E+0). Next tier-2 pair (sweep-157): longhouse + garden-cottage
(135th cycle — LRU chain: @156 forge/potter, @155 inn/tower-house, @154
stable/market, @153 longhouse/garden-cottage now the stalest standing pair
at 3 sweeps; both walk tools verified present on disk this tick:
interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).

sweep-157: CLEAN SWEEP, fully quiet steady-state tick. Census 314==314 at
both epochs (276 thing + 38 light) vs the committed sweep-154 baseline (sha16
44b804c33a856b59): 0 arrivals, 0 departures, 0 drift on all 314 shared ids
across id/pos/yaw/lib/scale/kind/bbox — epochs A and B (20s-paced)
byte-identical raw /geom sha16 58e82babca9e87da, the same raw as sweep-155/
156: representation epoch #5 stable, the live world unchanged, no flap. No
snapshot rewrite (baseline current, sweep-106..156 precedent). Overlap: SAT
fresh over the live set — 276 bbox non-light, 236 classified, 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
\u22120.407, known Sev 2 routed to artwalk b26 choreography @ sweep-43, 113th
sweep since routing, NOT new, no escalation due (law keys severity-1). Walks:
tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core
64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 135th cycle per the committed pointer: longhouse 6/6 @ 0.346
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, per-leg ok:true
counts verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (111th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on
fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append, D+0/E+0,
base re-read fresh immediately before append. Standing gate ALL PASS real
exit 0 at tick-start bea900b9; HEAD advanced mid-tick to 8a1b1bb9 (struct-117
borromean build+decode only, placement deferred per its own commit message;
survey-122 read-only hold) — per the polish-270 epoch law the gate was re-run
fresh at 8a1b1bb9: ALL PASS real exit 0. Census quiet at both epochs
corroborates zero world mutation by either interleave; no evidence
invalidated. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-158): stable + market (136th cycle — LRU chain: @157
longhouse/garden-cottage, @156 forge/potter, @155 inn/tower-house, @154
stable/market now the stalest standing pair at 4 sweeps; both walk tools
verified present on disk this tick: interior-walk-stable.ts,
interior-walk-market.ts).
sweep-158: CLEAN SWEEP, arrival tick (single epoch event, no correction
needed). Census 314→315 vs the committed sweep-154 baseline (sha16
44b804c33a856b59): exactly ONE domain-valid arrival — nx-struct-borromean
@ (−13.253730011383807, −0.011310439512641572, 189.5371695493656)
yaw π lib 7e9c334883d25774 comp {} = struct-118 @ a8c8a051, the R10-16
deferred contract executed: tuple matches its committed ledger line-for-line
(PLACED_VERIFIED census 314→315, sha 7e9c3348 re-pinned byte-exact, S
mathematics axis r190 past the zeno gates). Epochs A and B (20s-paced) both
315 with raw /geom sha16 57149d04bfb22ce4 BYTE-IDENTICAL — world static
after the placement; 0 departures, 0 drift on all 314 shared ids across
id/pos/yaw/lib/scale/kind/bbox. HEAD advanced mid-tick d23a3600→a8c8a051
= struct-118's own commit for exactly this placement; epoch-B census
post-dates it so all evidence is epoch-correct by construction, gate re-run
ALL PASS real exit 0 at a8c8a051 with check-set identical (98 PASS lines
both runs, diff empty). Snapshot rewritten with pre-write asserts
(arrivals==[borromean] only, 0 departures, all 314 byte-equal) and
post-rewrite drift ZERO: 124565B / 315 ents / sha16 37736d5053f432ef, first
314 entities preserved verbatim + borromean appended at tail. Probe
self-catches pre-write, both repaired like-for-like with zero damage
(disclosed): (a) two snapshot-projection asserts false-fired on
representation differences — baseline convention carries lib:"" for
lib-less lights and explicit null bbox keys; the census-diff normalization
(norm_lib, 7-field) equates them, world drift was ZERO; final rewrite keeps
the committed representation verbatim and appends only the new entity.
(b) tier-2 walk parser keyed 'legs' where the interior-walk schema uses
'phase' — re-anchored on per-leg ok:true counts (sweep-48 class).
Overlap: SAT fresh over the live 315-set — 277 bbox non-light, 236
classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26
choreography @ sweep-43, 114th sweep since routing, NOT new, no escalation
due (law keys severity-1); borromean SAT-clean, zero new contacts (its own
scan worst zeno +7.59 corroborates). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts);
borromean r190 S sits 170m+ off every tier-1 leg — walks stand by
construction (sweep-152 zeno precedent). Tier-2 136th cycle per the
committed pointer: stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market
6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0, per-leg
ok:true counts verified. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (112th consecutive clean); sweep89-battery 28/28
ALL PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable,
read fresh. Ledger law EXACT — canonical tool, D+0/E+0, base re-read
fresh immediately before append. Zero world mutations, zero defect notes,
zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-159): hall + bunkhouse (137th cycle
— LRU chain: @158 stable/market, @157 longhouse/garden-cottage, @156
forge/potter, @155 inn/tower-house, @154 stable/market, @153
longhouse/garden-cottage, @152 row-cottage/observatory, @151
hall/bunkhouse now the stalest standing pair at 7 sweeps; both walk tools
verified present on disk this tick: interior-walk-hall.ts,
interior-walk-bunkhouse.ts).

sweep-159: CLEAN SWEEP, fully quiet steady-state tick with one representation
event. Census 315==315 at both epochs (277 thing + 38 light) vs the committed
sweep-158 baseline (315 ents, sha16 37736d5053f432ef): 0 arrivals, 0
departures, 0 drift on all 315 shared ids across id/pos/yaw/lib/scale/kind/
bbox. Epochs A and B (20s-paced) byte-identical raw /geom sha16
a475ae09538c3f91 — a NEW representation epoch (#6; prior epochs 58e82bab
#5 through sweep-157, 57149d04 at sweep-158). Classification (fail-closed
full-field sweep, not assumption): the committed baseline carries
comp:null/compKeys:null on every entity while the live projection serves
full comp payloads again — carousel motion bag intact, borromean {},
per-entity comp bags all present. The change is simultaneous across all
comp-bearing ids with zero drift on every law field, and the sweep89
battery re-derived all 28 comp pins EXACT from the fresh census bytes —
representation change in the served /geom projection, not world mutation;
sibling server work in flight (server/server.ts, server/world.ts dirty,
foreign lane) corroborates an evolving server surface. Snapshot rewritten
to the current representation with pre-write asserts (id set 315==315,
zero arrivals/departures, zero law-field drift vs committed) and
post-rewrite drift ZERO. Overlap: SAT fresh over the live 315-set — 277
bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 115th sweep since routing, NOT
new, no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 137th cycle per the committed pointer: hall 8/8 @ 0.36
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-
bunkhouse.ts), both ALL_PASS real exit 0, per-leg ok:true counts
verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (113th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0
on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT — canonical tool self-verifies law() before and after
append, D+0/E+0, base re-read fresh immediately before append. Standing
gate ALL PASS real exit 0 at 3091c0ac — HEAD had already advanced
d635c2ef->3091c0ac (survey-124, read-only observer) before the first
gate run this tick, so the run is epoch-correct by construction — and
re-run ALL PASS real exit 0 at a4d036f2 after survey-125 (read-only
observer) landed mid-tick; check-set identical 98/98, the only differing
line is the HEAD-epoch check itself. Census quiet at both epochs
corroborates zero world mutation by either interleave; no evidence
invalidated. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-160): row-cottage + observatory circuit (138th cycle
— LRU chain: @159 hall/bunkhouse, @158 stable/market, @157
longhouse/garden-cottage, @156 forge/potter, @155 inn/tower-house,
@153 longhouse/garden-cottage, @152 row-cottage/observatory now the
stalest standing pair at 7 sweeps; both walk tools verified present on
disk this tick: interior-walk-row-cottage.ts, struct2-walk-observatory.ts).

sweep-160: CLEAN SWEEP, epoch-corrected tick (struct-120 brachistochrone
arrival absorbed). Census epochs A and B (20s-paced) both 315==315 fully
quiet vs the committed sweep-159 baseline (315 ents, sha16
c8e561302df821c0): 0 arrivals, 0 departures, 0 drift on all 315 shared ids
across id/pos/yaw/lib/scale/kind/bbox/comp/compKeys (projection
convention). Raw /geom sha16 57149d04bfb22ce4 at both epochs —
representation epoch #7: the served raw projection toggled compKeys back
to null (all 315) vs sweep-159's epoch-#6 raw (a475ae09). Classification
fail-closed, full-field: raw comp payloads byte-equal on all 315 ids, raw
law fields byte-equal, and the committed snapshot convention (projection)
shows ZERO diff on any field including comp/compKeys — the toggle lives
only in the raw served representation and carries no world information;
sibling server work (server/server.ts, server/world.ts still dirty)
corroborates the evolving server surface. Then the epoch event: the
projection census taken for the snapshot rewrite returned 316 —
nx-struct-brachistochrone arrived LIVE mid-tick (after epoch B) =
struct-120 @ 3fd272d7 executing struct-119's committed deferred placement
(R10-17 THE BRACHISTOCHRONE, S math axis r200). Epoch C (fresh raw read)
confirms: exactly ONE arrival, tuple
(−13.9513,−0.0066,195.8128) yaw −π/2 lib f678c069e84e51a2 scale 1 comp {},
matching struct-120's ledger line-for-line including PLACED_VERIFIED
census 315→316 read-back corroboration; bbox 8.74×4.018×2.14 with
bbox-center +3.70 x-offset (the pitfall-10 form-center build), 0
departures, 0 drift on all 315 shared ids. Per the polish-270 epoch law
ALL affected evidence was re-taken fresh before verdicts: SAT re-run at
epoch C over the 316-set (278 bbox non-light, 236 classified, 0 coverage
holes — brachistochrone SAT-clean, zero new contacts, corroborating
struct-120's own center-corrected scan worst +3.30 vs borromean, well
clear of the 1.4m law), battery re-run 28/28 ALL PASS on the fresh 316-set
bytes, pins re-run 15/15 ALL_PINS_OK, standing gate re-run ALL PASS real
exit 0 at 3fd272d7 (98 PASS lines, check-set identical to tick-start's
except the HEAD-epoch line). World static post-arrival (proj → proj2
zero diffs). Walks stand by construction: brachistochrone sits r200 on
the S axis, 180m+ off every tier-1 waypoint and every tier-2 door lane
(sweep-152 voronoi r160 / sweep-158 borromean r190 precedents); the SAT
re-run covers the collision surface. Overlap: exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, 116th sweep since routing,
NOT new, no escalation due (law keys severity-1). Walks: tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @
0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Tier-2 138th cycle per the committed pointer:
row-cottage 6/6 @ 0.384 (interior-walk-row-cottage.ts) + observatory
circuit 5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real
exit 0, per-leg ok:true counts verified. Integrity: struct18-fleet-pin-
check 15/15 ALL_PINS_OK real exit 0 (114th consecutive clean); sweep89-
battery 28/28 ALL PASS exit 0 on fresh census-C bytes; interlane md5
f6254cd0 stable, read fresh. Ledger law EXACT — canonical tool
self-verifies law() before and after append, D+0/E+0, base re-read fresh
immediately before append (struct-120's D+1 absorbed pre-append). Probe
self-catches pre-verdict, disclosed: (a) the first snapshot-rewrite
attempt asserted a raw-curl payload against the projection-convention
baseline (schema mismatch, KeyError count — caught by the assert, zero
damage, re-derived via the committed projection census tool per the
sweep-158 projection-assert precedent); (b) the raw-sha flip (a475ae09 →
57149d04) was classified representation-only by full-field comparison
BEFORE any rewrite, not assumed (sweep-159 law). Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-161): inn +
tower-house (139th cycle — LRU chain: @160 row-cottage/observatory,
@159 hall/bunkhouse, @158 stable/market, @157 longhouse/garden-cottage,
@156 forge/potter; inn/tower-house last walked @155, now the stalest
standing pair at 5 sweeps; both walk tools verified present on disk this
tick: interior-walk-inn.ts, interior-walk-tower-house.ts).

sweep-161: CLEAN SWEEP, fully quiet steady-state tick. Census 316==316
at ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
sweep-160 baseline (316 ents, sha16 e146e035726d6998, projection
convention): 0 arrivals, 0 departures, 0 drift, 0 lib flips — 278 thing +
38 light. Raw /geom sha16 131e7d967d61ec66 stable across A/B/C; the flip
vs sweep-160's raw 57149d04 was classified BEFORE any verdict by
field-level comparison (raw A vs raw C: field-identical across all 316
shared ids — serialization-order only, carries no world information;
sweep-159 representation-classification law). Projection convention
full-field comparison vs committed baseline: ZERO drift on any field
including comp/compKeys. Snapshot rewrite ran with full pre-write asserts
(0 arrivals, 0 departures, zero full-field drift) and reproduced the
committed baseline BYTE-IDENTICAL (209736B, sha16 e146e035726d6998) —
git status clean on the baseline file, zero churn, nothing restaged.
HEAD advanced once mid-tick: 0d201d15 -> f418b83f -> 24fbbcb3
(survey-130 arrival-gated slice + survey-131 hold, both read-only, zero
mutations — corroborated by their own census byte-identity); per the
polish-270 epoch law the standing gate was re-run at 24fbbcb3: ALL PASS
98 PASS lines real exit 0, check-set identical to tick-start's except the
HEAD-epoch line. Overlap: SAT fresh-live 278 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk
b26 choreography @ sweep-43, 117th sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 139th cycle per the committed pointer: inn 6/6 @ 0.364
(interior-walk-inn.ts) + tower-house 6/6 @ 0.377
(interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok
counts verified. Probe self-catch pre-verdict, disclosed: the core-walk
first parse keyed on a bare json.load of the file head and tripped on the
tool's '[physics] headless body engine' preamble line (JSONDecodeError,
zero damage) — re-parsed from the first '{' per the known preamble
convention; verdicts read from status + per-leg ok + maxArrival only.
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (115th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
D+0/E+0, base re-read fresh immediately before append. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-162): forge +
potter (140th cycle — LRU chain: @161 inn/tower-house, @160
row-cottage/observatory, @159 hall/bunkhouse, @158 stable/market, @157
longhouse/garden-cottage; forge/potter last walked @156, now the stalest
standing pair at 5 sweeps; both walk tools verified present on disk this
tick: interior-walk-forge.ts, interior-walk-potter.ts).

sweep-162: CLEAN SWEEP, fully quiet steady-state tick. Census 316==316 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (316 ents, sha16 e146e035726d6998, projection convention):
0 arrivals, 0 departures, 0 drift, 0 lib flips — 278 thing + 38 light.
Raw /geom sha16 131e7d967d61ec66 byte-stable across A/B/C (same value as
sweep-161 — no flip to classify this tick). Projection convention
full-field comparison vs the committed baseline: ZERO drift on any field
including comp/compKeys; the committed baseline stays current with ZERO
churn (sweep-161 comparison-only precedent — the fresh proj's 4-byte size
delta was classified representation-order only by the full-field
comparison, pre-verdict, sweep-159 law). HEAD advanced twice mid-tick:
e66f218c -> b2eb788a (struct-121, build-source add only, no world bytes) ->
001e06d4 (survey-133 interrupted-window recovery, read-only); per the
polish-270 epoch law the standing gate was re-run at 001e06d4: ALL PASS
98 PASS lines real exit 0, check-set identical to tick-start's except the
HEAD-epoch line. Overlap: SAT fresh-live 278 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 118th sweep since routing, NOT new, no escalation
due (law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 140th cycle per the committed pointer: forge 6/6 @ 0.375
(interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts),
both ALL_PASS real exit 0, per-leg ok counts verified. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (116th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — canonical
tool self-verifies law() before and after append, D+0/E+0, base re-read
fresh immediately before append (struct-121's D+0 absorbed). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-163):
longhouse + garden-cottage (141st cycle — LRU chain: @162 forge/potter,
@161 inn/tower-house, @160 row-cottage/observatory, @159 hall/bunkhouse,
@158 stable/market; longhouse/garden-cottage last walked @157, now the
stalest standing pair at 5 sweeps; both walk tools verified present on
disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).

sweep-163: CLEAN SWEEP, fully quiet steady-state tick. Census 316==316 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (316 ents, sha16 e146e035726d6998): 0 arrivals, 0 departures, 0
drift, 0 lib flips — 278 thing + 38 light. Raw /geom sha16 131e7d967d61ec66
byte-stable across A/B/C (same value as sweep-161/162 — no flip to
classify this tick). Full-field comparison vs the committed baseline via
9-field like-for-like projection (raw capture projected onto the committed
entity key order, compKeys derived from comp): ZERO drift on any field
including comp byte-equal; the committed baseline stays current with ZERO
churn (sweep-161/162 comparison-only precedent). HEAD advanced twice
mid-tick: 768cee33 -> 212703fd -> c78ce843 (survey-135/136, read-only
holds, zero survey paths, census byte-identity corroborates); per the
polish-270 epoch law the standing gate was re-run at c78ce843: ALL PASS 99
PASS lines real exit 0. Overlap: SAT fresh-live 278 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 119th sweep since routing, NOT new, no escalation
due (law keys severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38
(one paced retry after a tool-layer timeout on the first NE run —
sweep-12 SW precedent, partial JSON discarded, fresh run ALL_PASS), SW 5/5
@ 0.37. Tier-2 141st cycle per the committed sweep-162 pointer: longhouse
6/6 @ 0.3456 + garden-cottage 6/6 @ 0.355 ALL PASS. Integrity: pins 15/15
ALL_PINS_OK (117th consecutive clean, struct18-fleet-pin-check.ts real
exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5
f6254cd0 stable read fresh, ledger law EXACT via canonical tool (base
2370763 re-read fresh pre-append, D+0/E+0). Standing gate ALL PASS real
exit 0 at tick-start 768cee33 + re-run ALL PASS 99 exit 0 at c78ce843.
Probe self-catches before verdicts (both disclosed, zero damage): (a) the
snapshot check first compared the RAW /geom capture against the committed
PROJECTION baseline — 316 compKeys-only diffs = representation epoch #7
raw toggle, classified out by projecting like-for-like (sweep-160 law),
and the raw shape carries no top-level count key (count derived
fail-closed from the entity list); (b) the first walk-parse keyed
json.load directly on the core output whose first line is the [physics]
banner (sweep-35/161 class) — re-anchored parsing from the first brace.
Zero world mutations, zero defect notes written, zero uploads, zero
verbs, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-164): stable + market (142nd cycle — LRU after 141st walked
longhouse/garden-cottage, last walked 136th).

sweep-164: CLEAN SWEEP, arrival tick. Census 316→317 across all three
epochs (A/B 20s-paced, C post-verification): exactly ONE arrival,
nx-struct-galtonboard @ (−14.649, 0.002, 209.873) yaw π, lib
3d9f7c9cdf81d64c, scale 1, comp {} — classified domain-valid line-for-line
against struct-122's staged placer (full sha
3d9f7c9cdf81d64ce497b2c1aa6684b98f1330b3c1c0af56fa9512d9fd1d807b, exact
pos tuple) and its ledger entry (line 5417, D+1, running total 2370764).
The placement landed mid-tick (HEAD 001e06d4 → 40c39c37) with its staged
index partition — observed live, never blocked on: my commit deferred
until the sibling's files landed their own commit, then the partition was
clean. survey-138 (84d8c722) independently judged the arrival NATIVE CLEAN
(gameplay/night/front, 7-glow-bead contract named-node-verified) —
corroborates my classification; its census predates the live verb by
pipeline interleaving, reconciled timeline in its own register. 0
departures, 0 drift, 0 lib flips on the 316 shared ids at every epoch;
raw /geom sha16 5d86c019 byte-stable A/B/C. Snapshot REWRITTEN per the
arrival-fold precedent (sweep-124 class): pre-write asserts passed
(arrival exactly [nx-struct-galtonboard], 0 departures, zero full-field
drift on 316 shared incl comp byte-equal and lib-normalized), new baseline
317 ents / 211135B / sha16 a07d6e627c9e034e, post-rewrite drift ZERO.
Probe self-catch before commit (disclosed, zero damage): the first rewrite
dropped the committed baseline's top-level 'world' key — caught by a
committed-vs-new top-level shape comparison before any commit, chassis
re-run with world: 'commons-next' preserved; final shape keys
[world, count, entities] exact. HEAD advanced three times mid-tick:
490fa900 (survey-137 hold) → 40c39c37 (struct-122 placement) → 84d8c722
(survey-138 arrival slice); per the polish-270 epoch law the standing gate
was re-run at 84d8c722: ALL PASS 99 PASS lines real exit 0. Overlap: SAT
fresh-live 279 bbox non-light (galtonboard included) / 236 classified / 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 120th sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); the arrival sits r210 S, outside
every walked leg — walks stand by construction, SAT covers the collision
surface (sweep-53 precedent). Tier-2 142nd cycle per the committed
sweep-163 pointer: stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market
6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit 0,
per-leg ok counts verified. Integrity: pins 15/15 ALL_PINS_OK (118th
consecutive clean, struct18-fleet-pin-check.ts real exit 0),
sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0
stable read fresh. Ledger law EXACT via canonical tool (base re-read
fresh immediately pre-append, D+0/E+0). Zero world mutations, zero
defect notes written, zero uploads, zero verbs, zero comp edits, zero
shared-budget use. Next tier-2 pair (sweep-165): inn + tower-house
(143rd cycle — LRU after 142nd walked stable/market; inn/tower-house last
walked @161, now the stalest standing pair at 3 sweeps; both walk tools
present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).

sweep-165: CLEAN SWEEP, fully quiet steady-state tick. Census 317==317 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (317 ents, 211135B, sha16 a07d6e627c9e034e): 0 arrivals, 0
departures, 0 drift, 0 lib flips — 279 thing + 38 light. Raw /geom sha16
5d86c0190c82fbbe byte-stable across A/B/C (identical to sweep-164's
5d86c019 raw value — no representation flip to classify this tick).
Committed baseline stays current with ZERO churn (comparison-only
precedent, sweep-161/162/163). HEAD advanced twice mid-tick: ddfe3a92 ->
80ee3b18 (survey-140/141, both read-only holds, zero mutations); per the
polish-270 epoch law the standing gate was re-run at 80ee3b18: ALL PASS 99
PASS lines real exit 0. Overlap: SAT fresh-live 279 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 121st sweep since routing, NOT new, no escalation
due (law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 143rd cycle per the committed sweep-164 pointer: inn 6/6 @ 0.364
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok
counts verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (119th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on
fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh. Probe
self-catches before verdicts (disclosed, zero damage): (a) the walk-parse
probe first keyed d['legs'] which in this chassis is a count int, not the
results list — 'legs' holds the numeric leg count and 'results' the
per-leg dicts; re-keyed on 'results' with per-leg ok verification; one
inspection sub-probe dropped its json import (NameError) and was re-run
clean; (b) the battery first ran argv-less (it takes the census path as
argv[1]) and exited 1 — rerun with the census path, 28/28 clean; the
initial bare run was a tool-invocation miss, not a world finding. Ledger
law EXACT via canonical tool (base 2370764 re-read fresh immediately
pre-append, D+0/E+0). Zero world mutations, zero defect notes written,
zero uploads, zero verbs, zero comp edits, zero shared-budget use. Next
tier-2 pair (sweep-166): row-cottage + observatory (144th cycle — LRU
after 143rd walked inn/tower-house; row-cottage/observatory last walked
@160, now the stalest standing pair at 4 sweeps; walk tools verified
present on disk this tick: interior-walk-row-cottage.ts +
struct2-walk-observatory.ts — the observatory leg uses the struct2 chassis,
self-corrected this tick from a wrong interior-walk-observatory.ts name in
the draft pointer).

sweep-166: CLEAN SWEEP, fully quiet steady-state tick. Census 317==317 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (317 ents, 211135B, sha16 a07d6e627c9e034e): 0 arrivals, 0
departures, 0 drift, 0 lib flips — 279 thing + 38 light. Raw /geom sha16
5d86c0190c82fbbe byte-stable across A/B/C (identical to sweep-164/165 —
no representation flip to classify this tick). Committed baseline stays
current with ZERO churn (comparison-only precedent, sweep-161..165).
HEAD advanced twice mid-tick: c08ee7a6 -> 78138e53 -> d21e4f6d
(survey-142/143, both read-only holds, zero mutations, census
byte-identity corroborates); per the polish-270 epoch law the standing
gate was re-run at d21e4f6d: ALL PASS 99 PASS lines real exit 0. Overlap:
SAT fresh-live 279 bbox non-light / 236 classified / 0 coverage holes,
exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
-0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43, 122nd
sweep since routing, NOT new, no escalation due (law keys severity-1).
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0
— core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts). The first chained walk run hit the
tool-layer timeout on NE (300s); the partial JSON log was discarded and
all remaining legs re-run individually fresh — exactly the sweep-12/163
precedent, disclosed. Tier-2 144th cycle per the committed sweep-165
pointer: row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) +
observatory 6-leg circuit 5/5 @ 0.389 (struct2-walk-observatory.ts
chassis), both ALL_PASS real exit 0, per-leg ok counts verified.
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (120th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT via canonical tool (base 2370764 re-read fresh immediately
pre-append, D+0/E+0). Zero world mutations, zero defect notes written,
zero uploads, zero verbs, zero comp edits, zero shared-budget use. Next
tier-2 pair (sweep-167): hall + bunkhouse (145th cycle — LRU after the
144th walked row-cottage/observatory; hall/bunkhouse last walked
sweep-159, now the stalest standing pair at 7 sweeps; walk tools verified
present on disk this tick: interior-walk-hall.ts +
interior-walk-bunkhouse.ts). Pointer-parser note: sweep-166's ledger
phrasing 'observatory 6-leg circuit' keeps the LRU table honest — the
144th cycle DID walk observatory (5/5 circuit legs @ 0.389); its
sweep-144 row in the LRU scan reflects only the old 'observatory 5/5'
phrasing convention, so the effective last-walked tag is sweep-166.

sweep-167: CLEAN SWEEP, fully quiet steady-state tick. Census 317==317 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (317 ents, 211135B, sha16 a07d6e627c9e034e): 0 arrivals, 0
departures, 0 drift, 0 lib flips — 279 thing + 38 light. Raw /geom sha16
5d86c0190c82fbbe byte-stable across A/B/C (identical to
sweep-164/165/166 — no representation flip to classify this tick).
Committed baseline stays current with ZERO churn (comparison-only
precedent, sweep-161..166). HEAD static through the whole tick
(tick-start 814b78d2, no sibling commits landed; no re-gate owed).
Overlap: SAT fresh-live 279 bbox non-light / 236 classified / 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 123rd sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually this
wakeup, zero tool-layer timeouts. Tier-2 145th cycle per the committed
sweep-166 pointer: hall 8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse
6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0,
per-leg ok counts verified. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (121st consecutive clean); sweep89-battery 28/28
ALL PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable,
read fresh. Ledger law EXACT — canonical tool self-verifies law() before
and after append, D+0/E+0, base 2370764 re-read fresh immediately before
append. Standing gate ALL PASS real exit 0 at tick-start 814b78d2 from
repo ROOT, 98 PASS lines. Probe self-catches disclosed pre-verdict:
(a) the first gate run executed from agents/arthur cwd and tripped the
known tex-84 repo-relative existsSync cwd artifact (verify-repairs.ts:45
— sweep-121 precedent, documented in its own ledger row); re-run from
repo ROOT ALL PASS — not a gate failure, no severity-1. (b) The fresh
walk parser keyed on the legs field, which is an int count in this
schema (results is the list — sweep-48/165 class, repaired in-tick).
(c) This very prose block's first draft carried drafting residue in the
next-pair derivation (polluted-prose class, sweep-53/55 family) — caught
by re-reading the script before running it, wholesale-rewritten clean,
zero damage to the file. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-168): longhouse + garden-cottage (146th cycle —
LRU chain: @167 hall/bunkhouse, @166 row-cottage/observatory, @165
inn/tower-house, @164 stable/market, @163 longhouse/garden-cottage —
stalest standing pair at 4 sweeps; both walk tools verified present on
disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).

sweep-168: CLEAN SWEEP w/ exactly ONE domain-valid arrival. Epoch A
317==317 fully quiet vs the committed baseline (317 ents / 211135B /
sha16 a07d6e627c9e034e): 0 arrivals, 0 departures, 0 drift, 0 lib flips
on all 317 shared ids; raw /geom sha16 5d86c019 same as sweep-164..167.
Epoch B (20s-paced) caught the arrival; epoch C settled 318:
nx-struct-clothoid @ (−13.7414, −0.0010, 219.3541) yaw π, lib
4843ef8ae7093365, comp {} — struct-125 @ 76250b52 committed mid-tick;
live tuple matches its ledger PLACED_VERIFIED line-for-line AND
struct-124's committed deferred siting contract (az184 r220 S-axis past
galton r210, yaw-π face-on family). Domain-valid struct-lane
work-in-flight, classified not-drift (sweep-124/138/164 arrival class).
Baseline REWRITTEN arrival-fold: 318 ents / 211783B / sha16
ff11fff94bf97839, drift ZERO on 317 shared ids, world key preserved.
One chassis self-catch disclosed: the first rewrite used the stale
sweep-138 7-field projection (dropped comp/compKeys and the store-form
lib, producing a plausible-but-wrong net −2304-line diff); caught by the
on-disk entity key-set check BEFORE commit, git-checkout restored, clean
re-run on the sweep-164 9-field chassis (+37/−1 insert-only). Zero
damage landed. Overlap: SAT run TWICE fresh-live — epoch-A set (279 bbox
non-light, arrival not yet live) and epoch-B/C set (280 incl. clothoid
in the collision set): both 236 classified / 0 coverage holes / exit 3
on ONLY the known R-121 lamp-n | nx-town-mapboard −0.407 (124th sweep
since routing, Sev 2 artwalk-routed @ sweep-43, no escalation due — law
keys severity-1). Arrival collision-clean at +9.13 worst-solid margin
(struct-125's own scan) + live SAT this tick. Walks: tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts), all
run individually, zero timeouts. Tier-2 146th cycle per the committed
sweep-167 pointer: longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts)
+ garden-cottage 6/6 @ 0.3550 (interior-walk-garden-cottage.ts), both
ALL_PASS real exit 0, ok counts verified from the results list (no legs
field in this walk schema — sweep-48/165 keying class). Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (122nd
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT via canonical tool — base 2370765 re-read fresh immediately
pre-append (advanced by struct-125's D+1 this window), D+0/E+0 this
tick. Standing gate ALL PASS real exit 0 at tick-start 90060539, RE-GATED
ALL PASS real exit 0 at 76250b52 after two mid-tick HEAD advances
(survey-147 read-only hold, struct-125 placement — both absorbed; index
partition clean at commit time). Zero world mutations, zero defect notes
written, zero uploads, zero verbs, zero comp edits, zero shared-budget
use. Next tier-2 pair (sweep-169): stable + market (147th cycle — stalest
standing pair after this tick's walk at 4 sweeps; both walk tools
verified present on disk this tick: interior-walk-stable.ts,
interior-walk-market.ts).

sweep-169: CLEAN SWEEP, fully quiet steady-state tick. Census 318==318 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (318 ents, sha16 ff11fff94bf97839): 0 arrivals, 0 departures, 0
field diffs (pos/yaw/scale/kind/bbox), 0 lib flips on all 318 shared ids
— 280 thing + 38 light. Raw /geom sha16 5ce439a1016454d0 byte-stable
across A/B/C — the FIRST epoch at this new raw value. The raw-byte
delta vs the baseline's committed size is NOT entity change: survey-149
disclosed the /geom SCHEMA EVENT (entity fields compKeys→parent+tris)
from sibling windmill-era server work-in-flight (server/server.ts,
server/world.ts dirty in the working tree); the entity set and every
compared field are identical, so the content-diff projection stays
valid and the committed baseline stays current with ZERO churn
(comparison-only precedent, sweep-161..168 class). Overlap: SAT
fresh-live 280 bbox non-light / 236 classified / 0 coverage holes, exit
3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 —
known Sev 2 routed to artwalk b26 choreography @ sweep-43, 125th sweep
since routing, NOT new, no escalation due (law keys severity-1).
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts); all four run individually this wakeup,
zero tool-layer timeouts, per-leg ok parsed from the results list
(sweep-48/165 keying law). Tier-2 147th cycle per the committed
sweep-168 pointer: stable 5/5 @ 0.3958 (interior-walk-stable.ts) +
market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit
0, ok counts verified from the results list. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (123rd
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-C bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
D+0/E+0, base 2370765 re-read fresh immediately before append. Standing
gate ALL PASS real exit 0 at tick-start ae4166c9; HEAD advanced TWICE
mid-tick (survey-148 @ 2b89293f, survey-149 @ 3f2fef13 — sibling
observer commits touching SURVEY-PLAN.md only, zero SWEEP paths); epoch
law honored, gate RE-RUN ALL PASS real exit 0 at 3f2fef13 before the
ledger append. One ledger self-catch disclosed pre-commit: this tick's
appended prose named the next-pair tool as interior-walk-towerhouse.ts
— the tool on disk is interior-walk-tower-house.ts (hyphenated);
corrected in-place this tick via unique-anchor sed BEFORE commit, law
re-verified EXACT after the correction, entry present exactly once.
Zero world mutations, zero defect notes, zero uploads, zero verbs,
zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-170): inn + tower-house (148th cycle — LRU chain: @169
stable/market, @168 longhouse/garden-cottage, @167 hall/bunkhouse,
@166 row-cottage/observatory, @165 inn/tower-house stalest standing
pair at 4 sweeps; both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).

sweep-170: CLEAN SWEEP with one domain-valid re-place folded. Census
318==318 at ALL THREE epochs (A/B 20s-paced, C post-verification) vs
the committed baseline (318 ents, sha16 ff11fff94bf97839): zero
arrivals, zero departures, zero field diffs (pos/yaw/scale/kind/bbox),
and exactly ONE lib flip — nx-struct-clothoid 4843ef8ae7093365 →
120448255ce67193 at identical tuple (−13.7414, −0.0010, 219.3541) yaw π
comp {}. Classification: struct-126 @ 5f9fc395 (committed pre-tick),
trestle material split re-place at the exact struct-125 pose — live lib,
pos, and yaw match its ledger PLACED_VERIFIED line-for-line; the
sweep-28 documented-re-place class, NOT drift. Projection sha16
12df31f3da9bf141 byte-stable across A/B/C (/geom s148 field shape
211019B; the survey-149 parent+tris 94118B shape was transient sibling
server WIP per survey-150's note this window). Baseline REWRITTEN
re-place-fold (sweep-168 chassis, flip variant): 318 ents / 211783B /
sha16 a1fc3ef2938810a0, entity order + set + world key preserved, ONLY
the flipped lib string changed (git numstat 1/1), drift ZERO on the
other 317 ids. Overlap: SAT fresh-live 280 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk
b26 choreography @ sweep-43, 126th sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE
7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts);
all four run individually, per-leg ok parsed from the results list
(sweep-48/165 keying law). Tier-2 148th cycle per the committed
sweep-169 pointer: inn 6/6 @ 0.3640 (interior-walk-inn.ts) +
tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts, hyphenated
tool name — sweep-169's self-catch class), both ALL_PASS real exit 0,
ok counts verified from the results list. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (124th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
base 2370765 re-read fresh immediately before append, D+0/E+0 this
tick. Standing gate ALL PASS real exit 0 at tick-start 5f9fc395; HEAD
advanced ONCE mid-tick (survey-150 @ a746f144 — sibling observer commit
touching SURVEY-PLAN.md only, zero SWEEP paths; it also independently
judged this tick's lib flip CLEAN, corroborating the classification);
epoch law honored, gate RE-RUN ALL PASS real exit 0 at a746f144 before
the ledger append. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use. Next
tier-2 pair (sweep-171): row-cottage + observatory (149th cycle — LRU
chain: @170 inn/tower-house, @169 stable/market, @168
longhouse/garden-cottage, @167 hall/bunkhouse, @166
row-cottage/observatory stalest standing pair at 5 sweeps; both walk
tools verified present on disk this tick: interior-walk-row-cottage.ts,
struct2-walk-observatory.ts).

sweep-171: CLEAN SWEEP, fully quiet steady-state tick. Census 318==318 at
BOTH epochs (A/B 20s-paced) vs the committed baseline (318 ents, sha16
a1fc3ef2938810a0): zero arrivals, zero departures, zero field diffs
(pos/yaw/scale/kind/bbox), zero lib flips — raw projection sha16
12df31f3da9bf141 byte-stable across both reads, s148 compKeys field
shape 211019B (survey-153's same-window byte-identical census
independently corroborates the quiet epoch). No snapshot rewrite needed
— baseline current, sweep-106/108 no-churn precedent. Overlap: SAT
fresh-live 280 bbox non-light / 236 classified / 0 coverage holes, exit
3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 —
known Sev 2 routed to artwalk b26 choreography @ sweep-43, 127th sweep
since routing, NOT new, no escalation due (law keys severity-1). Walks:
tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 —
core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts); all four run individually, per-leg ok
parsed from the results list (sweep-48/165 keying law). Tier-2 149th
cycle per the committed sweep-170 pointer: row-cottage 6/6 @ 0.3838
(interior-walk-row-cottage.ts) + observatory 5/5 @ 0.389
(struct2-walk-observatory.ts), both ALL_PASS real exit 0, ok counts
verified from the results list. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK real exit 0 (125th consecutive clean); sweep89-battery
28/28 ALL PASS exit 0 on fresh census-A bytes (argv census file — one
misfire no-arg run caught by its own IndexError, re-run correct);
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — canonical
tool self-verifies law() before and after append, base 2370765 re-read
fresh immediately before append, D+0/E+0 this tick; one probe self-catch
pre-verdict: a naive ad-hoc slice sum missed the 2336002 constant and
printed a wrong base — the tool's own law() was run and confirmed EXACT
before any append (sweep-36 probe class). Standing gate ALL PASS real
exit 0 at tick-start 4670c61d; HEAD advanced TWICE mid-tick (survey-152
@ 8aec4fdc, survey-153 @ 46526ef6 — sibling observer holds touching
SURVEY-PLAN.md only, zero SWEEP paths; both independently census-confirm
the quiet 318 epoch); epoch law honored, gate RE-RUN ALL PASS real exit
0 at 46526ef6 before the ledger append. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use. Next tier-2 pair (sweep-172): hall + bunkhouse
(150th cycle — LRU chain: @171 row-cottage/observatory, @170
inn/tower-house, @169 stable/market, @168 longhouse/garden-cottage,
@167 hall/bunkhouse stalest standing pair at 4 sweeps; both walk tools
verified present on disk this tick: interior-walk-hall.ts,
interior-walk-bunkhouse.ts).

sweep-172: CLEAN SWEEP, fully quiet steady-state tick. Census 318==318 at
BOTH epochs (A/B 20s-paced) vs the committed baseline (318 ents, sha16
a1fc3ef2938810a0): zero arrivals, zero departures, zero field diffs
(pos/yaw/scale/kind/bbox), zero lib flips — raw projection sha16
12df31f3da9bf141 byte-stable across both reads, s148 compKeys field
shape 211019B (survey-154's same-window hold independently census-
confirmed the quiet epoch). No snapshot rewrite needed — baseline
current, sweep-106/108 no-churn precedent. Overlap: SAT fresh-live 280
bbox non-light / 236 classified / 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, 128th sweep since routing,
NOT new, no escalation due (law keys severity-1). Walks: tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @
0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts); all four run individually, per-leg ok parsed
from the results list (sweep-48/165 keying law). Tier-2 150th cycle per
the committed sweep-171 pointer: hall 8/8 @ 0.3600 (interior-walk-hall.ts)
+ bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALL_PASS
real exit 0, ok counts verified from the results list. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (126th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append, base
2370765 re-read fresh immediately before append, D+0/E+0 this tick.
Standing gate ALL PASS real exit 0 at tick-start 4c1baa2d; HEAD advanced
TWICE mid-tick (survey-154 @ 5501db26, survey-155 @ 03e57a7d — sibling
observer holds touching SURVEY-PLAN.md only, zero SWEEP paths; both
independently census-confirm the quiet 318 epoch, and both disclose a
recurring raw /geom schema flap — parent+tris 94118B raw vs compKeys
211019B raw — which the sweep projection convention is robust to:
next-live-census.ts normalizes fields explicitly, projection sha
byte-stable both epochs); epoch law honored, gate RE-RUN ALL PASS
real exit 0 at 03e57a7d before the ledger append. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use. Next tier-2 pair (sweep-173): longhouse +
garden-cottage (151st cycle — LRU chain: @172 hall/bunkhouse, @171
row-cottage/observatory, @170 inn/tower-house, @169 stable/market, @168
longhouse/garden-cottage stalest standing pair at 4 sweeps; both walk
tools verified present on disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).

sweep-173: CLEAN SWEEP, fully quiet steady-state tick. Census 318==318 at
BOTH epochs (A/B 20s-paced) vs the committed baseline (318 ents, sha16
a1fc3ef2938810a0): zero arrivals, zero departures, zero field diffs
(pos/yaw/scale/kind/bbox), zero lib flips — raw projection sha16
12df31f3da9bf141 byte-stable across both reads, s148 compKeys field
shape 211019B (survey-154..158 same-window holds independently
census-confirmed the byte-quiet epoch — the world has been byte-quiet
across eight consecutive survey ticks s151-s158). No snapshot rewrite
needed — baseline current, sweep-106/108 no-churn precedent. Overlap:
SAT fresh-live 280 bbox non-light / 236 classified / 0 coverage holes,
exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
129th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually,
per-leg ok parsed from the results list (sweep-48/165 keying law;
core-path support-seam abstentions on labyrinth-0038/0004,
dress-nw-skeps-001, dress-ne-woodstack-001, dress-nw-logpile-001 =
known normalized diagnostic set, unchanged). Tier-2 151st cycle per
the committed sweep-172 pointer: longhouse 6/6 @ 0.3456
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, ok
counts verified from the results list. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK real exit 0 (127th consecutive clean); sweep89-battery
28/28 ALL PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0
stable, read fresh. Ledger law EXACT — canonical tool self-verifies
law() before and after append, base 2370765 re-read fresh immediately
before append, D+0/E+0 this tick. Standing gate ALL PASS real exit 0 at
tick-start 51f1a985; HEAD advanced TWICE mid-tick (survey-157 @
3746d7fb, survey-158 @ fce97b58 — sibling observer holds touching
SURVEY-PLAN.md only, zero SWEEP paths; both census-confirm the quiet
318 epoch); epoch law honored, gate RE-RUN ALL PASS real exit 0 at
fce97b58 before the ledger append. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use. Next tier-2 pair (sweep-174): stable + market (152nd cycle — LRU
chain: @173 longhouse/garden-cottage, @172 hall/bunkhouse, @171
row-cottage/observatory, @170 inn/tower-house, @169 stable/market
stalest standing pair at 4 sweeps; both walk tools verified present on
disk this tick: interior-walk-stable.ts, interior-walk-market.ts).

sweep-174: CLEAN SWEEP, fully quiet steady-state tick. Census 318==318 at
BOTH epochs (A/B 20s-paced) vs the committed baseline (318 ents, sha16
a1fc3ef2938810a0): zero arrivals, zero departures, zero field diffs
(pos/yaw/scale/kind/bbox), zero lib flips. Epoch-A raw capture is
BYTE-IDENTICAL to the survey-159 capture (md5 c6109787) — parent+tris
schema shape (s152/s154 precedent), A/B byte-identical; the world has been
byte-quiet across ten consecutive survey ticks s151-s159 plus this sweep.
No snapshot rewrite needed — baseline current, sweep-106/108 no-churn
precedent. Overlap: SAT fresh-live 280 bbox non-light / 236 classified /
0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 130th sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @
0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5
@ 0.37 (sw-approach3-walk.ts); all four run individually, per-leg ok
parsed from the results list (sweep-48/165 keying law). Tier-2 152nd cycle
per the committed sweep-173 pointer: stable 5/5 @ 0.3958
(interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (128th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — canonical
tool self-verifies law() before and after append, base 2370765 re-read
fresh immediately before append → 2370767 after (ONE mid-tick sibling
struct-128 append absorbed, prefix-disjoint; its entry records
built+accepted with siting blocked fail-closed, unspawned — consistent
with this tick's zero arrivals). Standing gate ALL PASS real exit 0 at
tick-start ba1e530c (survey-159 absorbed, 99 PASS lines); HEAD static
through this tick's verification phase; pre-commit re-gate below. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use. Next tier-2 pair (sweep-175): inn +
tower-house (153rd cycle — LRU chain: @174 stable/market, @173
longhouse/garden-cottage, @172 hall/bunkhouse, @171
row-cottage/observatory, @170 inn/tower-house stalest standing pair at 5
sweeps; both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).

sweep-175: CLEAN SWEEP, single-classified-arrival tick. Census 318->319 at
BOTH epochs (A/B 20s-paced) vs the committed baseline (318 ents, sha16
a1fc3ef2938810a0): exactly ONE arrival — nx-struct-peaucellier at
[-10.4888,-0.0480,168.3133] yaw pi-exact, lib f66494fa3ffb9ff8, scale 1,
bbox 7.00x4.20x1.05, empty comp — the struct-129 spawn @ d6e3baf0
(PLACED_VERIFIED). Its ledger append (2370767->2370768) landed mid-tick
AFTER my epoch-A census; IMPROVEMENTS.md was clean at its HEAD and the
standing gate was RE-RUN ALL PASS real exit 0 at d6e3baf0 per the
polish-270 epoch law. Domain-valid committed work (nx-struct-*), live
tuple ledger-exact against its entry, and the struct-129 siting narrative
(r169 lawful seat inside the S-walk 20m HOLE, voronoi r160 -> peaucellier
r169 -> zeno r180) is consistent with this tick's SAT: peaucellier adds
ZERO overlapping pairs in the live set, corroborating its own reported
worst solid gap zeno +2.07. Zero departures, zero field diffs, zero lib
flips on all 318 shared ids. Epoch-A raw capture md5 8e89b3da, sha16
6a54bb6d, 94432B; epoch-B's first fetch returned a gateway-1033 17-byte
error body — ONE paced 20s retry came back clean and A/B byte-identical
(polish-270e single-retry-recovery class, disclosed). Snapshot REWRITTEN
(arrival-fold variant, sweep-55/170 chassis, pre-write asserts exact,
post-write drift ZERO): 319 entities, 212416B, sha16 b52c0538d95606df,
prior-318 order+set preserved, world key preserved. Overlap: SAT
fresh-live 281 bbox non-light (peaucellier in the collision set) / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk
b26 choreography @ sweep-43, 131st sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts); all
four run individually, per-leg ok parsed from the results list
(sweep-48/165 keying law). Two in-tick probe self-catches, disclosed:
(a) the NW/NE/SW walk tools key their arrival field `distance` where the
core/interior tools use `dist` — sweep-54's exact keying class; first
parse read 0.0000 maxArrival, re-parsed on the correct per-tool key.
(b) stdout carries a `[physics]` banner line ahead of the JSON — parse
from the first brace, not the file head. Interior support-seam
abstentions on dress/temple entities remain the known normalized
diagnostic set, unchanged. Tier-2 153rd cycle per the committed
sweep-174 pointer: inn 6/6 @ 0.3640 (interior-walk-inn.ts) +
tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS
real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (129th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0
on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT — canonical tool self-verifies law() before and after
append, base 2370768 re-read fresh immediately before append, D+0/E+0
(struct-129's D+1 was the absorbed mid-tick sibling append). Standing
gate ALL PASS real exit 0 at tick-start 7bb8b898 and re-gated at
d6e3baf0 after the struct-129 advance. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use.
Next tier-2 pair (sweep-176): row-cottage + observatory (154th cycle —
LRU chain: @175 inn/tower-house, @174 stable/market, @173
longhouse/garden-cottage, @172 hall/bunkhouse, @171
row-cottage/observatory stalest standing pair at 5 sweeps; both walk
tools verified present on disk this tick: interior-walk-row-cottage.ts,
struct2-walk-observatory.ts — the observatory leg is struct-family per
the sweep-171 cycle's own naming).

sweep-176: CLEAN SWEEP, fully quiet steady-state tick. Census 319==319 at
BOTH epochs (A/B 20s-paced, byte-identical raw sha16 9d6a3e8325b69027,
211652B) vs the committed baseline (319 ents, sha16 b52c0538d95606df —
the sweep-175 arrival-fold): zero arrivals, zero departures, zero field
diffs, zero lib flips on all 319 shared ids (281 thing + 38 light). The
compKeys parent+tris fetch shape persists (s148/s163 flap class) —
content compared on the 8 shared fields, all quiet. No snapshot rewrite
needed — baseline current, sweep-106/108/174 no-churn precedent.
Overlap: SAT fresh-live 281 bbox non-light / 236 classified / 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 132nd sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually, per-leg
ok parsed from the results list (sweep-48/165 keying law; NW/NE/SW tools
key `distance`, core keys `dist`). One in-tick probe self-catch,
disclosed: the first core-parse read from the file head and hit the
`[physics]` banner (sweep-175 self-catch (b) class, repeated) — re-parsed
from the first brace, 64/64 real. Interior support-seam abstentions on
dress/temple entities remain the known normalized diagnostic set,
unchanged. Tier-2 154th cycle per the committed sweep-175 pointer:
row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory
5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real exit 0 —
the observatory leg is struct-family per the sweep-171 cycle's own
naming. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (130th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0
on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT — canonical tool self-verifies law() before and after
append, base 2370768 re-read fresh immediately before append, D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 35847cab; HEAD advanced
TWICE mid-tick (survey-164 @ bff67160 native-debt-retired, survey-165 @
5ece8e11 hold — sibling observer ticks touching SURVEY-PLAN.md only,
zero SWEEP paths, both census-confirm the quiet 319 epoch); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at 5ece8e11 before the ledger
append. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-177): hall + bunkhouse (155th cycle — LRU chain: @176
row-cottage/observatory, @175 inn/tower-house, @174 stable/market, @173
longhouse/garden-cottage, @172 hall/bunkhouse stalest standing pair at 4
sweeps; both walk tools verified present on disk this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).

sweep-177: CLEAN SWEEP, single-classified-arrival tick. Census 319->320:
epoch-A fully quiet (319==319 vs committed baseline, raw sha16
9d6a3e8325b69027 byte-identical to sweep-176, zero deltas on all shared
fields); epoch-B (20s-paced) caught exactly ONE arrival —
nx-struct-harmonickiss at [-16.043989, -0.014399, 229.439732] yaw
pi-exact, lib 8008167c97c9922f, scale 1, bbox 3x6.4x3, empty comp — the
struct-130 spawn @ 1be6774f (PLACED_VERIFIED, its own entry records
census 319->320, r230 az184 yaw-pi lawful seat past clothoid r220 on
the S math walk). Domain-valid committed work (nx-struct-*), live
tuple ledger-exact against its entry. Zero departures, zero field
diffs, zero lib flips on all 319 shared ids. Snapshot REWRITTEN
(arrival-fold variant, sweep-55/170/175 chassis, pre-write asserts
exact, post-write drift ZERO): 320 entities, 213012B, sha16
5014e49ad693c10f, prior-319 order+set preserved, world key preserved.
Overlap: SAT fresh-live 282 bbox non-light (harmonickiss in the
collision set) / 236 classified / 0 coverage holes, exit 3 on exactly
ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, 133rd sweep since
routing, NOT new, no escalation due (law keys severity-1). The SAT's
282 count (noticed before epoch-B explained it — the sweep-176 count
was 281) is itself evidence the fetch included the mid-tick arrival:
harmonickiss adds ZERO overlapping pairs, corroborating struct-130's
reported worst clothoid gap +8.12. Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE
7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts); all four run individually, per-leg ok parsed
from the results list from the first brace (sweep-48/165 keying law; no
banner self-catch this tick). Interior support-seam abstentions on
dress/temple entities remain the known normalized diagnostic set,
unchanged. Tier-2 155th cycle per the committed sweep-176 pointer:
hall 8/8 @ 0.3600 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803
(interior-walk-bunkhouse.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (131st
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
base 2370769 re-read fresh immediately before append, D+0/E+0
(struct-130's D+1 was the absorbed mid-tick sibling append). Standing
gate ALL PASS real exit 0 at tick-start 5ff98d45; HEAD advanced FOUR
times mid-tick (survey-165 @ 5ece8e11, survey-166 @ e9e2b185,
survey-167 @ 20e7ea20 observer holds touching SURVEY-PLAN.md only,
zero SWEEP paths + struct-130 @ 1be6774f the arrival); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at 1be6774f before the
snapshot rewrite and ledger append. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use. Next tier-2 pair (sweep-178): stable + market (156th cycle — LRU
chain: @177 hall/bunkhouse, @176 row-cottage/observatory, @175
inn/tower-house, @174 stable/market stalest standing pair at 3 sweeps;
both walk tools verified present on disk this tick:
interior-walk-stable.ts, interior-walk-market.ts).

sweep-178: CLEAN SWEEP, fully quiet steady state. Census 320==320 BOTH
epochs (A/B 20s-paced, raw fetches BYTE-IDENTICAL, sha16
edb782970e5c006a) vs committed baseline 5014e49ad693c10f: zero
arrivals, zero departures, zero field diffs, zero lib flips on all 320
shared ids (282 thing + 38 light). No snapshot rewrite — baseline
current per the sweep-106/108/174/176 no-churn precedent. Overlap: SAT
fresh-live 282 bbox non-light / 236 classified / 0 coverage holes,
exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
134th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually,
per-leg ok parsed (sweep-48/165 keying law; no self-catch this tick).
Interior support-seam abstentions on dress/temple entities remain the
known normalized diagnostic set, unchanged. Tier-2 156th cycle per the
committed sweep-177 pointer: stable 5/5 @ 0.3958 (interior-walk-
stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both
ALLPASS real exit 0. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (132nd consecutive clean); sweep89-battery
28/28 ALL PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0
stable, read fresh. Ledger law EXACT — canonical tool self-verifies
law() before and after append, base 2370769 re-read fresh immediately
before append, D+0/E+0. Standing gate ALL PASS real exit 0 at
tick-start ae27506f; HEAD advanced ONCE mid-tick (survey-169 @
c095ae66, observer hold touching SURVEY-PLAN.md only, zero SWEEP
paths, census-confirms the quiet 320 epoch); epoch law honored, gate
RE-RUN ALL PASS real exit 0 at c095ae66 before the ledger append.
Zero world mutations, zero defect notes, zero uploads, zero verbs,
zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-179): inn + tower-house (157th cycle — LRU chain: @178
stable/market, @177 hall/bunkhouse, @176 row-cottage/observatory,
@175 inn/tower-house stalest standing pair at 3 sweeps; both walk
tools verified present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).

sweep-179: CLEAN SWEEP, fully quiet steady state. Census 320==320 BOTH
epochs (A/B 20s-paced, raw fetches BYTE-IDENTICAL, sha16
edb782970e5c006a) vs committed baseline 5014e49ad693c10f: zero
arrivals, zero departures, zero field diffs, zero lib flips on all 320
shared ids (282 thing + 38 light). No snapshot rewrite — baseline
current per the sweep-106/108/174/176/178 no-churn precedent. Overlap:
SAT fresh-live 282 bbox non-light / 236 classified / 0 coverage holes,
exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
135th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually,
per-leg ok parsed. Two parse self-catches corrected in-tick BEFORE any
claim: first parser keyed legs (int count) instead of results[] and
 NW/NE/SW dist (distance keying) — sweep-175 keying class, re-parsed
clean. Interior support-seam abstentions on dress/temple entities
remain the known normalized diagnostic set, unchanged. Tier-2 157th
cycle per the committed sweep-178 pointer: inn 6/6 @ 0.3640
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-
tower-house.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (133rd
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
base 2370769 re-read fresh immediately before append, D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 2ad4b3b9; HEAD
advanced ONCE mid-tick (survey-171 @ eb87e7ba, observer hold touching
SURVEY-PLAN.md only, zero SWEEP paths, census-confirms the quiet 320
epoch); epoch law honored, gate RE-RUN ALL PASS real exit 0 at
eb87e7ba before the ledger append. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use. Next tier-2 pair (sweep-180): row-cottage + observatory (158th
cycle — LRU chain: @179 inn/tower-house, @178 stable/market, @177
hall/bunkhouse, @176 row-cottage/observatory stalest standing pair at
3 sweeps; both walk tools verified present on disk this tick:
interior-walk-row-cottage.ts, struct2-walk-observatory.ts).

sweep-180: CLEAN SWEEP, fully quiet steady state. Census 320==320 BOTH
epochs (A/B 20s-paced, raw fetches BYTE-IDENTICAL, sha16
edb782970e5c006a) vs committed baseline 5014e49ad693c10f: zero
arrivals, zero departures, zero field diffs, zero lib flips on all 320
shared ids (282 thing + 38 light). No snapshot rewrite — baseline
current per the sweep-106/108/174/176/178/179 no-churn precedent.
Overlap: SAT fresh-live 282 bbox non-light / 236 classified / 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 136th sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE
7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.
ts); all four run individually, per-leg ok parsed from results[]. One
parse self-catch corrected in-tick BEFORE any claim: first json.load
died on the non-JSON [physics]/[agent] banner prefix lines — re-parsed
with brace-anchored extraction (kin to sweep-48/165 keying law; stdout
is logs + JSON, not pure JSON). Interior support-seam abstentions on
dress/temple entities remain the known normalized diagnostic set,
unchanged. Tier-2 158th cycle per the committed sweep-179 pointer:
row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory
5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real exit 0.
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(134th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on
fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT — canonical tool self-verifies law() before and after
append, base 2370770 re-read fresh immediately before append (+1 vs
sweep-179's 2370769 via struct-131's committed entry absorbed upstream,
not this lane's), D+0/E+0. Standing gate ALL PASS real exit 0 at
tick-start 137525b2; HEAD advanced FOUR times mid-tick (struct-131 @
77e12bca built-not-placed, then survey-173 @ f2ae43d5, survey-174 @
4ecbe01d, survey-175 @ 16d8731d observer holds touching SURVEY-PLAN.md
only, zero SWEEP paths); epoch law honored, gate RE-RUN ALL PASS real
exit 0 at 16d8731d before the ledger append. Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use. Next tier-2 pair (sweep-181): hall + bunkhouse
(159th cycle — LRU chain: @180 row-cottage/observatory, @179 inn/
tower-house, @178 stable/market, @177 hall/bunkhouse stalest standing
pair at 3 sweeps; both walk tools verified present on disk this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).

sweep-181: CLEAN SWEEP, arrival-fold tick. Census 320→321 BOTH epochs (A/B
20s-paced, raw fetches BYTE-IDENTICAL, sha16 6eb17b2603a9e106) vs committed
baseline 5014e49ad693c10f: exactly ONE arrival — nx-struct-gyroid @
[-16.7416,-0.0200,239.4154] yaw pi lib da2a4b158a448caa comp {} — classified
domain-valid struct-lane work: struct-131 built the Gyroid (family gap
1/1/0 prose-only, one period cell, MC overscan+clip film 100,980 verts)
and struct-132 @ ef5c9849 executed the deferred placement (scan r240 az184
yaw-pi lawful direct fresh-320, worst-solid harmonickiss +6.18, terrain
9pt spread 14.8mm, hash-gated placer, PLACED_VERIFIED, census 320→321,
idempotent rerun REFUSED zero-verbs, independent read-back exact tuple +
bbox 4.6×4.19×4.6 = decode envelope). Tuple matches the committed ledger
line-for-line. Zero departures, zero field diffs, zero lib flips on all
320 shared ids. Overlap: SAT fresh-live 283 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 137th sweep since routing, NOT new, no escalation
due (law keys severity-1). The gyroid introduces NO new contacts,
corroborating struct-132's own placer SAT (worst-solid +6.18 vs
harmonickiss r230 — the S-walk cadence spacing holds: kiss r230 → gyroid
r240). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0 — core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37,
all run individually, per-leg ok parsed brace-anchored; walks stand by
construction (gyroid r240.0 S, 200m+ off every tier-1 waypoint, sweep-53
precedent). Tier-2 159th cycle per the committed sweep-180 pointer: hall
8/8 @ 0.360 + bunkhouse 6/6 @ 0.380, both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (135th consecutive clean),
sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5
f6254cd0 stable read fresh. Ledger law EXACT — base 2370771 re-read fresh
immediately before append (no sibling increment; sweep-180 base 2370770
+1 struct-132 D+1 already absorbed upstream), D+0/E+0, tool self-verifies
law() pre and post append. Standing gate ALL PASS real exit 0 at
tick-start ef5c9849 (99 PASS lines); ZERO mid-tick sibling advances —
epochs A and B byte-identical, so no gate re-run required. Baseline
rewritten per the sweep-177 arrival-fold chassis: 321 entities / 213610B /
sha16 99e835ed9dfba623, pre-write asserts (arrival set exactly
[nx-struct-gyroid], 0 departures, 0 lib flips, 0 field drift on the 320
shared ids), post-write drift ZERO, order+set of the prior 320 preserved.
Probe self-catch pre-verdict, disclosed: first snapshot-rewrite run from
agents/arthur/ cwd died FileNotFoundError on the repo-relative BASE path
(asserts already green, nothing yet written — sweep-177 chassis expects
repo root); re-run from repo root, clean. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use. Next tier-2 pair (sweep-182): stable + market (160th
cycle — LRU chain: @181 hall/bunkhouse, @180 row-cottage/observatory,
@179 inn/tower-house, @178 stable/market stalest standing pair at 3
sweeps; both walk tools verified present on disk this tick:
interior-walk-stable.ts, interior-walk-market.ts).

sweep-182: CLEAN SWEEP, fully quiet steady state at the 321-entity epoch.
Census 321==321 BOTH epochs (A/B 20s-paced, raw fetches BYTE-IDENTICAL,
sha16 d398ce05873ff941, 94990B, parent+tris schema class) vs committed
baseline 99e835ed9dfba623 (the sweep-181 arrival-fold rewrite, 321 ents):
zero arrivals, zero departures, zero field diffs, zero lib flips on all
321 shared ids (283 thing + 38 light). No snapshot rewrite — baseline
current per the sweep-106/108/174/176/178/179/180 no-churn precedent
(the raw sha matches the sweep-177/survey-176 fetch class of the same
schema shape). Overlap: SAT fresh-live 283 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 138th sweep since routing, NOT new, no escalation
due (law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.
ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-
walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually,
per-leg ok parsed brace-anchored from results[]. Tier-2 160th cycle per
the committed sweep-181 pointer: stable 5/5 @ 0.3958 (interior-walk-
stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS
real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (136th
consecutive clean), sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes, interlane md5 f6254cd0 stable read fresh. Ledger law
EXACT — base 2370771 re-read fresh immediately before append (no sibling
increment this tick; the two survey observer holds append nothing), D+0/
E+0, tool self-verifies law() pre and post append. Standing gate ALL PASS
real exit 0 at tick-start 9efcb4fd (99 PASS lines by the historical count
method); HEAD advanced TWICE mid-tick (survey-177 @ 3c48b61f, survey-178
@ 834356b8 — observer holds touching SURVEY-PLAN.md + survey diff tools
only, zero SWEEP paths, both corroborating the quiet 321 epoch, their
census sha byte-identical to this tick's epochs); epoch law honored, gate
RE-RUN ALL PASS real exit 0 at 834356b8 before the ledger append (98
^PASS-anchored lines + the ALL PASS verdict line = the historical 99 —
count-method artifact, survey-178 class, verdict anchors identical).
Probe self-catches pre-verdict, disclosed: (a) the FIRST census fetch
used a guessed /api/geom URL and returned HTTP 404 "not found" — resolved
pre-conclusion by inspecting the raw body and checking the standing
next-live-census.ts tool, which uses /geom?world= (my URL guess was
wrong, not the gateway); correct-endpoint fetch clean. (b) The 98-vs-99
PASS-line count above. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use. Next tier-2
pair (sweep-183): inn + tower-house (161st cycle — LRU chain: @182
stable/market, @181 hall/bunkhouse, @180 row-cottage/observatory, @179
inn/tower-house stalest standing pair at 3 sweeps; both walk tools
verified present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).

sweep-183: CLEAN SWEEP, arrival-fold tick with two census generations.
Generation 1 (epochs A/B, 20s-paced, byte-identical, sha16
d398ce05873ff941, 94990B): 321==321 vs committed baseline 99e835ed9dfba623
(the sweep-181 arrival-fold rewrite, 321 ents) — fully quiet, zero
arrivals/departures/field diffs/lib flips on all 321 shared ids (283
thing + 38 light). SAT + tier-1 + tier-2 + pins + battery ran clean on
that generation. Then the pre-append ledger re-read caught the running
total at 2370772 (+1 vs gate-time 2370771): TWO mid-tick sibling
advances — struct-133 @ 3ae6e9f3 (THE ENNEPER built+judged+placed one
tick, census 321->322, nx-struct-enneper [-17.4391,-0.0133,249.3910]
yaw pi lib ba17a712cbc734bd, PLACED_VERIFIED per its ledger line) and
survey-180 @ 05241fde (observer hold, SURVEY-PLAN only, corroborating
the quiet epoch). Epoch law honored: epochs C/D re-fetched fresh
(20s-paced, byte-identical, sha16 551d9f029269a6b4, 95267B): 322==322,
exactly ONE arrival — nx-struct-enneper — domain-valid struct-lane
work, tuple ledger-exact line-for-line vs struct-133's committed entry,
empty comp bag, zero departures, zero field diffs, zero lib flips on
all 321 shared ids. 10m S-band cadence holds (gyroid r240 -> enneper
r250). Baseline rewritten via the sweep-181 arrival-fold chassis
(9-field like-for-like projection): 322 ents / 214205B / sha16
ca2a1883de2def3d, pre-write asserts (arrival set exactly
[nx-struct-enneper], 0 departures, 0 lib flips, 0 field drift on the
321 shared ids), post-write drift ZERO, order+set of the prior 321
preserved. Overlap: SAT re-run fresh-live on the 322 set — 284 bbox
non-light / 236 classified / 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, 139th sweep since
routing, NOT new, no escalation due (law keys severity-1). The enneper
introduces NO new contacts, corroborating struct-133's own placer SAT
(worst-solid +4.78 vs gyroid). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts); all four run individually, per-leg ok parsed
brace-anchored from results[]; walks stand by construction (enneper
r250.0 S az184, 200m+ off every tier-1 waypoint, sweep-53 precedent).
Tier-2 161st cycle per the committed sweep-182 pointer: inn 6/6 @
0.3640 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (137th consecutive clean),
sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes AND
re-run 28/28 on census-D (322-epoch) bytes so the folded arrival is
covered, interlane md5 f6254cd0 stable read fresh. Ledger law EXACT —
base 2370772 re-read fresh immediately before append, D+0/E+0, tool
self-verifies law() pre and post append. Standing gate ALL PASS real
exit 0 at tick-start b3e199c9; HEAD advanced twice mid-tick (struct-133
@ 3ae6e9f3 world-mutating sibling, survey-180 @ 05241fde observer
hold); epoch law honored, gate RE-RUN ALL PASS real exit 0 at 3ae6e9f3
before the ledger append. Zero probe self-catches this tick. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero
comp edits, zero shared-budget use. Next tier-2 pair (sweep-184):
row-cottage + observatory (162nd cycle — LRU chain: @183 inn/
tower-house, @182 stable/market, @181 hall/bunkhouse, @180
row-cottage/observatory stalest standing pair at 3 sweeps; both walk
tools verified present on disk this tick: interior-walk-row-cottage.ts,
struct2-walk-observatory.ts).

sweep-184: CLEAN SWEEP, fully quiet steady state. Census 322==322 BOTH
epochs (A/B 20s-paced, raw fetches BYTE-IDENTICAL, sha16 551d9f029269a6b4,
95267B — byte-identical to the sweep-183 epoch-C/D bytes that generated
the committed baseline ca2a1883de2def3d, so quiet holds for ALL fields
incl comp/compKeys by byte identity, not just the diff tool's 6-field
projection): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips (284
thing + 38 light). No snapshot rewrite — baseline current per the
sweep-106/108/174/176/178/179/180/182/183 no-churn precedent. Overlap:
SAT fresh-live 284 bbox non-light / 236 classified / 0 coverage holes,
real exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43, 140th
sweep since routing, NOT new, no escalation due (law keys severity-1).
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts); all four run individually, per-leg ok +
distance parsed from results[] (these walk tools key arrival delta as
distance; core tool keys dist — both parsed clean, no self-catch this
tick). Tier-2 162nd cycle per the committed sweep-183 pointer:
row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory
5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real exit 0.
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (138th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base
2370772 re-read fresh immediately before append, D+0/E+0, tool
self-verifies law() pre and post append. Standing gate ALL PASS real
exit 0 at tick-start 6906179d (city-11 sibling accepted by prefix gate);
HEAD advanced ONCE mid-tick (survey-183 @ e3cc63a0, observer hold
touching SURVEY-PLAN.md + survey183-census-diff.py only, zero world
mutations, census-corroborates the quiet 322 epoch, its ledger law
EXACT 2370772 observed); epoch law honored, gate RE-RUN ALL PASS real
exit 0 at e3cc63a0 before the ledger append. Interrupted-predecessor
reconciliation (disclosed, struct-9 family / pre-place class):
sweep184-census-diff.py was found untracked in-tree pre-tick with NO
prior [sweep-184] ledger entry — an authored-but-never-run diff tool
left by an interrupted earlier window. Verified whole against the
committed sweep-183 chassis (same 6-field projection + arrival printer +
sha16), py_compile clean, used as this tick's diff tool, folded into
this commit. Probe self-catches pre-verdict, disclosed: (a) first SAT
invocation piped through tail captured the pipe's exit 0 instead of
bun's real exit 3 — re-run un-piped, real exit 3 recorded (polish-270
content-verdict class, corrected before any verdict); (b) approach-walk
parsers first keyed dist where these tools emit distance — re-anchored
on the actual results[] schema (sweep-48 keying law), legs re-verified
clean. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-185): hall + bunkhouse (163rd cycle — LRU chain: @184
row-cottage/observatory, @183 inn/tower-house, @182 stable/market,
@181 hall/bunkhouse stalest standing pair at 3 sweeps; both walk tools
verified present on disk this tick: interior-walk-hall.ts,
interior-walk-bunkhouse.ts).


sweep-185: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite. Census
322==322 BOTH epochs (A/B 20s-paced, raw fetches BYTE-IDENTICAL, sha16
551d9f029269a6b4, 95267B — byte-identical to the sweep-183 epoch-C/D
baseline-generating bytes, so quiet holds for ALL fields incl comp/compKeys
by byte identity, not just the diff tool's 6-field projection): 0 arrivals,
0 departures, 0 field diffs, 0 lib flips (284 thing + 38 light). Overlap:
SAT fresh-live 284 bbox non-light / 236 classified / 0 coverage holes, real
exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43, 141st
sweep since routing, NOT new, no escalation due (law keys severity-1).
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 —
core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts); all four run individually, per-leg ok + dist/distance
parsed from results[] per tool schema (approach tools key distance, core
keys dist — both parsed clean, sweep-184 class noted). Tier-2 163rd cycle
per the committed sweep-184 pointer: hall 8/8 @ 0.360 (interior-walk-hall.ts)
+ bunkhouse 6/6 @ 0.380 (interior-walk-bunkhouse.ts), both ALL_PASS real
exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (139th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A
bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base
2370772 re-read fresh immediately before append (ledger tail [sweep-184]),
D+0/E+0, tool self-verifies law() pre and post append. Standing gate ALL
PASS real exit 0, run 1 logged to file with the HEAD-check line carrying
7fbac2bd (sibling survey-184 absorbed mid-tick); HEAD advanced twice more
during walks (survey-185 @ 6be6e666, survey-186 @ 532ac2a0 — observer holds
touching SURVEY-PLAN.md + survey diff tools only, zero world mutations,
zero SWEEP paths, both census-corroborating the quiet 322 epoch with
byte-identical sha16 551d9f029269a6b4); epoch law honored, gate RE-RUN ALL
PASS real exit 0 at 532ac2a0 before the ledger append. Diff tool folded:
sweep185-census-diff.py authored fresh this tick from the committed
sweep184-census-diff.py chassis verbatim (no untracked-predecessor
reconciliation needed this tick — the sweep-184 file WAS the committed
chassis). Zero probe self-catches this tick. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use. Next tier-2 pair (sweep-186): stable + market (164th cycle — LRU
chain: @185 hall/bunkhouse, @184 row-cottage/observatory, @183 inn/
tower-house, @182 stable/market stalest standing pair at 3 sweeps; both
walk tools verified present on disk this tick: interior-walk-stable.ts,
interior-walk-market.ts).


sweep-186: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite. Census
322==322 BOTH epochs (A/B 20s-paced, chassis fetches BYTE-IDENTICAL 213441B
sha16 2f9ab679a8800d4b; curl-class fetch 95267B sha16 551d9f029269a6b4 —
byte-identical to the sweep-183 epoch-C/D baseline-generating bytes, so quiet
holds for ALL fields incl comp/compKeys by byte identity, not just the diff
tool's 6-field projection): 0 arrivals, 0 departures, 0 field diffs, 0 lib
flips, 0 compKeys drift (284 thing + 38 light). Baseline ca2a1883de2def3d
current, no rewrite (no-churn precedent). Overlap: SAT fresh-live 284 bbox
non-light / 236 classified / 0 coverage holes, real exit 3 un-piped on
exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard -0.407 — known
Sev 2 routed to artwalk b26 choreography @ sweep-43, 142nd sweep since
routing, NOT new, no escalation due (law keys severity-1). Walks: tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four
run individually, per-leg ok + dist/distance parsed from results[] per tool
schema. Tier-2 164th cycle per the committed sweep-185 pointer: stable 5/5 @
0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (140th consecutive clean);
sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes (comp-bearing
21, 38 lights); interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT —
base 2370772 re-derived fresh immediately before append, D+0/E+0, tool
self-verifies law() pre and post append. Standing gate ALL PASS real exit 0
at tick-start 5ae2d072 run 1 with the HEAD-check line carrying 9046f0a8
(struct-134 analysis-only sibling absorbed mid-grounding: IMPROVEMENTS.md +
STRUCTURES-PLAN.md + struct134-ringread-derive.py only, D+0/E+0, no world
mutation claimed or observed — census corroborates); HEAD advanced three
more times during walks (survey-187 @ 9eb1b940, survey-188 @ cfceb774,
survey-189 @ 6aba1e93 — observer holds touching SURVEY-PLAN.md + survey diff
tools only, zero world mutations, zero SWEEP paths, all census-corroborating
the quiet 322 epoch); epoch law honored, gate RE-RUN ALL PASS real exit 0 at
6aba1e93 before the ledger append. Diff tool folded: sweep186-census-diff.py
authored fresh this tick from the committed sweep185-census-diff.py chassis
verbatim (no untracked-predecessor reconciliation needed — the sweep-185
file was the committed chassis). Zero probe self-catches this tick. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use. Next tier-2 pair (sweep-187): inn +
tower-house (165th cycle — LRU chain: @186 stable/market, @185 hall/
bunkhouse, @184 row-cottage/observatory, @183 inn/tower-house stalest
standing pair at 3 sweeps; both walk tools verified present on disk this
tick: interior-walk-inn.ts, interior-walk-tower-house.ts).


sweep-187: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite.
Census 322==322 BOTH epochs (A/B 20s-paced, curl-class fetches
BYTE-IDENTICAL 95267B sha16 551d9f029269a6b4 — byte-identical to the
sweep-183 baseline-generating bytes, so quiet holds for ALL fields incl
comp/compKeys by byte identity; chassis fetch 213441B sha16
2f9ab679a8800d4b same schema class): 0 arrivals, 0 departures, 0 field
diffs, 0 lib flips, 0 compKeys drift (284 thing + 38 light). Baseline
ca2a1883de2def3d current, no rewrite (no-churn precedent). Overlap: SAT
fresh-live 284 bbox non-light / 236 classified / 0 coverage holes, real
exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 143rd sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually, per-leg
ok + dist/distance parsed from results[] per tool schema. Tier-2 165th
cycle per the committed sweep-186 pointer: inn 6/6 @ 0.3640
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (141st consecutive clean);
sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes; interlane
md5 f6254cd0 stable, read fresh. Ledger law EXACT — base 2370772
re-derived fresh immediately before append, D+0/E+0. Standing gate: FIRST
RUN from agents/arthur/ cwd exited 1 on FAIL [tex-84] — probe self-catch:
the check is existsSync(agents/arthur/verify-tex84.ts), repo-root-relative,
wrong-cwd artifact class; re-run un-piped FROM REPO ROOT, real exit 0 ALL
PASS 98/98 at 03c760f2. HEAD advanced twice mid-tick (survey-191 @
03c760f2, survey-192 @ 5fa3b49e — observer holds touching SURVEY-PLAN.md
+ survey diff tools only, zero world mutations, zero SWEEP paths, both
census-corroborating the byte-identical quiet 322 epoch); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at 5fa3b49e before the ledger
append. Interrupted-predecessor reconciliation (struct-9 class):
sweep-186's complete evidence chain found UNCOMMITTED in-tree (ledger
entry + SWEEP-PLAN block + untracked sweep186-census-diff.py), window
died post-append pre-commit; verified whole vs the committed sweep-185
chassis (adds only the disclosed compKeys law + libflip print), folded
into this commit with disclosure, no re-derivation needed. Diff tool
folded: sweep187-census-diff.py authored fresh from the sweep186 chassis
verbatim. One probe self-catch (the tex-84 wrong-cwd artifact). Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use. Next tier-2 pair (sweep-188): hall +
bunkhouse (166th cycle — LRU chain: @187 inn/tower-house, @186 stable/
market, @185 hall/bunkhouse, @184 row-cottage/observatory stalest
standing pair at 3 sweeps; both walk tools verified present on disk this
tick: interior-walk-hall.ts, interior-walk-bunkhouse.ts).

sweep-188: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite.
Census 322==322 BOTH epochs (A/B 20s-paced, chassis fetches
BYTE-IDENTICAL 213441B sha16 2f9ab679a8800d4b; curl-class fetches
BYTE-IDENTICAL 95267B sha16 551d9f029269a6b4 — byte-identical to the
sweep-183 baseline-generating bytes, so quiet holds for ALL fields incl
comp/compKeys by byte identity, not just the diff tool's 6-field
projection): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0
compKeys drift (284 thing + 38 light). Baseline ca2a1883de2def3d
current, no rewrite (no-churn precedent). Overlap: SAT fresh-live 284
bbox non-light / 236 classified / 0 coverage holes, real exit 3
un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
144th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually, per-leg
ok + dist/distance parsed from results[] per tool schema. Tier-2 166th
cycle per the committed sweep-187 pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803
(interior-walk-bunkhouse.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (142nd consecutive clean);
sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes; interlane
md5 f6254cd0 stable, read fresh. Ledger law EXACT — base 2370772
re-read fresh immediately before append, D+0/E+0, tool self-verifies
law() pre and post append. Standing gate ALL PASS real exit 0 at
tick-start e5340ebb, RE-RUN ALL PASS real exit 0 at b4dba8b8 before
this append after TWO mid-tick HEAD advances (survey-195 @ f2fea5d8
observer hold, zero world mutations, census-corroborating the
byte-identical quiet 322 epoch; struct-135 @ b4dba8b8 enneper refine
BANKED-not-placed, zero mutations per its own entry, epoch-B census
corroborates) — epoch law honored. Interrupted-predecessor
reconciliation (struct-9 class, sibling side): struct-135's ledger
entry found UNCOMMITTED in-tree post-append pre-commit; its plan/source
files ARE committed at b4dba8b8, entry rides this sweep's IMPROVEMENTS.md
commit with disclosure, no re-derivation needed. Diff tool folded:
sweep188-census-diff.py authored fresh from the committed
sweep187-census-diff.py chassis verbatim (path+docstring swap only).
Zero probe self-catches this tick. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use. Next tier-2 pair (sweep-189): stable + market (167th cycle — LRU
chain: @188 hall/bunkhouse, @187 inn/tower-house, @186 stable/market,
@185 hall/bunkhouse, @184 row-cottage/observatory stalest standing pair
at 4 sweeps; both walk tools verified present on disk this tick:
interior-walk-stable.ts, interior-walk-market.ts).

|| sweep-189 | 2026-09-09 | 322==322 (284 thing + 38 light; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift vs baseline ca2a1883de2def3d — curl-class fetches byte-identical 95267B sha16 551d9f029269a6b4 at BOTH 20s-paced epochs, so quiet holds for ALL fields incl comp/compKeys by byte identity; baseline current, no rewrite) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 145th sweep since routing, no escalation due — law keys Sev 1); 284 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 167th cycle stable 5/5 @ 0.3958 + market 6/6 @ 0.3894 ALL PASS | pins 15/15 ALL_PINS_OK (143rd consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370772 at append, standing gate ALL PASS real exit 0 at bd35f9b0 + re-run ALL PASS real exit 0 at c2b52942 after two mid-tick survey observer holds (zero world mutations, census-corroborated byte-identical epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |
|| sweep-190 | 2026-09-10 | 322==322 (284 thing + 38 light; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift vs baseline ca2a1883de2def3d — curl-class fetches byte-identical 95267B sha16 551d9f029269a6b4 at BOTH 20s-paced epochs, quiet holds for ALL fields by byte identity; baseline current, no rewrite) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 146th sweep since routing, no escalation due — law keys Sev 1); 284 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 168th cycle row-cottage 6/6 @ 0.3838 + observatory 5/5 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK (144th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370772 at append, standing gate ALL PASS real exit 0 at c7353e16 + re-run ALL PASS real exit 0 at d7bec7b6 after two mid-tick survey observer holds (zero world mutations, census-corroborated byte-identical epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-189: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite.
Census 322==322 BOTH epochs (A/B 20s-paced, curl-class fetches
BYTE-IDENTICAL 95267B sha16 551d9f029269a6b4 — byte-identical to the
sweep-183 baseline-generating bytes, so quiet holds for ALL fields incl
comp/compKeys by byte identity, not just the diff tool's 6-field
projection): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0
compKeys drift (284 thing + 38 light). Baseline ca2a1883de2def3d
current, no rewrite (no-churn precedent). Overlap: SAT fresh-live 284
bbox non-light / 236 classified / 0 coverage holes, real exit 3
un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
145th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually,
per-leg ok + dist/distance parsed from results[] per tool schema.
Tier-2 167th cycle per the committed sweep-188 pointer: stable 5/5 @
0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (143rd consecutive clean);
sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base
2370772 re-read fresh immediately before append, D+0/E+0, tool
self-verifies law() pre and post append. Standing gate ALL PASS real
exit 0 at tick-start bd35f9b0 run 1; HEAD advanced twice mid-tick
(survey-197 @ 0fb1d8dd, survey-198 @ c2b52942 — observer holds, zero
world mutations, zero SWEEP paths, census-corroborated by my own
byte-identical epoch B); epoch law honored, gate RE-RUN ALL PASS real
exit 0 at c2b52942 before the ledger append. Diff tool folded:
sweep189-census-diff.py authored fresh from the committed sweep188
chassis verbatim (path+docstring swap only). Probe self-catch PRE-COMMIT,
disclosed as correction of record (sweep-64 class): the appended
ledger prose named the observatory walk tool as
"next-walk-observatory.ts" — the true committed tool is
struct2-walk-observatory.ts (verified present on disk this tick; 41
prior plan mentions). Plan corrected before commit; the ledger entry
keeps the wrong name immutably, this block is the correction of
record. The row-cottage tool name was verified correct. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-190): row-cottage + observatory circuit (168th cycle — LRU
chain: @189 stable/market, @188 hall/bunkhouse, @187 inn/tower-house,
@185 row-cottage/observatory stalest standing pair at 4 sweeps; both
walk tools verified present on disk this tick:
interior-walk-row-cottage.ts, struct2-walk-observatory.ts).

sweep-190: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite.
Census 322==322 BOTH epochs (A/B 20s-paced, curl-class fetches
BYTE-IDENTICAL 95267B sha16 551d9f029269a6b4 — byte-identical to the
sweep-183 baseline-generating bytes, so quiet holds for ALL fields incl
comp/compKeys by byte identity): 0 arrivals, 0 departures, 0 field diffs,
0 lib flips, 0 compKeys drift (284 thing + 38 light). Baseline
ca2a1883de2def3d current, no rewrite. Overlap: SAT fresh-live 284 bbox
non-light / 236 classified / 0 coverage holes, real exit 3 un-piped on
exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known
Sev 2 routed to artwalk b26 choreography @ sweep-43, 146th sweep since
routing, NOT new, no escalation due (law keys severity-1). Walks: tier-1
4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @
0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE
7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts);
all four run individually, per-leg ok + dist/distance parsed from
results[] per tool schema. Tier-2 168th cycle per the committed sweep-189
pointer: row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) +
observatory circuit 5/5 @ 0.389 (struct2-walk-observatory.ts — the
sweep-189 correction-of-record name, verified on disk this tick), both
ALL_PASS real exit 0. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK (144th consecutive clean); sweep89-battery 28/28 ALL PASS
exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable, read
fresh twice. Ledger law EXACT — base 2370772 re-read fresh immediately
before append, D+0/E+0, tool self-verifies law() pre and post append.
Standing gate ALL PASS real exit 0 at tick-start c7353e16 run 1; HEAD
advanced twice mid-tick (survey-203 @ 598f7c33, survey-204 @ d7bec7b6 —
observer holds, zero world mutations, zero SWEEP paths, both
census-corroborating the byte-identical quiet 322 epoch); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at d7bec7b6 before the ledger
append. Diff tool folded: sweep190-census-diff.py authored fresh from the
committed sweep189 chassis verbatim (path+docstring swap only). One probe
self-catch pre-verdict: first NW leg parse keyed dist where the tool
schema uses distance, printed maxdist 0 — re-derived with the
dist/distance fallback per results[] schema (sweep-48/54 class), true NW
max 0.38. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-191): forge + potter (169th cycle — LRU chain re-derived from
ledger tier-2 fragments this tick: forge @162, potter @162, longhouse /
garden-cottage @173, row-cottage / observatory @184, inn / tower-house
@187, hall / bunkhouse @188, stable / market @189 — forge+potter the
stalest standing pair at 27 sweeps; both walk tools verified present on
disk this tick: interior-walk-forge.ts, interior-walk-potter.ts).

|| sweep-191 | 2026-09-10 | 322==322 (284 thing + 38 light; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift vs baseline ca2a1883de2def3d — curl-class fetches byte-identical 95267B sha16 551d9f029269a6b4 at BOTH 20s-paced epochs, quiet holds for ALL fields incl comp/compKeys by byte identity; baseline current, no rewrite) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 147th sweep since routing, no escalation due — law keys Sev 1); 284 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 169th cycle forge 6/6 @ 0.38 + potter 6/6 @ 0.37 ALL PASS | pins 15/15 ALL_PINS_OK (145th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370772 at append, standing gate ALL PASS real exit 0 at 1b36ddc6 run 1 (HEAD advance past own sweep-190 tip via survey-206 observer, accepted) + re-run ALL PASS real exit 0 at fbef1cab after one mid-tick survey-207 observer hold (zero world mutations, census-corroborated byte-identical epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-191: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite.
Census 322==322 BOTH epochs (A/B 20s-paced, curl-class fetches
BYTE-IDENTICAL 95267B sha16 551d9f029269a6b4 — byte-identical to the
sweep-183 baseline-generating bytes, so quiet holds for ALL fields incl
comp/compKeys by byte identity, not just the diff tool's 6-field
projection): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0
compKeys drift (284 thing + 38 light). Baseline ca2a1883de2def3d
current, no rewrite (no-churn precedent). Overlap: SAT fresh-live 284
bbox non-light / 236 classified / 0 coverage holes, real exit 3
un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
147th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 169th cycle per the
committed sweep-190 pointer: forge 6/6 @ 0.38 (interior-walk-forge.ts)
+ potter 6/6 @ 0.37 (interior-walk-potter.ts), both ALL_PASS real
exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (145th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base 2370772 re-read fresh immediately before append, D+0/E+0,
tool self-verifies law() pre and post append. Standing gate ALL PASS
real exit 0 at tick-start 1b36ddc6 run 1 (sibling survey-206 observer
hold had advanced HEAD past own sweep-190 tip, accepted per epoch law,
zero world mutations); HEAD advanced once mid-tick (survey-207 @
fbef1cab — observer hold, zero world mutations, zero SWEEP paths,
census-corroborated by my own byte-identical epoch B); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at fbef1cab before the
ledger append. Diff tool folded: sweep191-census-diff.py authored
fresh from the committed sweep190 chassis verbatim (path+docstring
swap only). Zero probe self-catches this tick. Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use. Next tier-2 pair (sweep-192): longhouse +
garden-cottage (170th cycle — LRU chain re-derived from ledger tier-2
fragments: forge @191, potter @191, longhouse / garden-cottage @173
stalest standing pair at 18 sweeps, row-cottage / observatory @190,
inn / tower-house @187, hall / bunkhouse @188, stable / market @189;
both walk tools verified present on disk this tick:
interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).

|| sweep-192 | 2026-09-10 | 322==322 (284 thing + 38 light; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift vs baseline ca2a1883de2def3d — curl-class fetches byte-identical 95267B sha16 551d9f029269a6b4 at BOTH 20s-paced epochs, quiet holds for ALL fields incl comp/compKeys by byte identity; baseline current, no rewrite) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 148th sweep since routing, no escalation due — law keys Sev 1); 284 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 170th cycle longhouse 6/6 @ 0.3456 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK (146th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370772 at append, standing gate ALL PASS real exit 0 at tick-start bdf90d9a run 1 (gate HEAD-check line disclosed struct-136 @ cef637a2 prefix-gate-accepted build+judge tick, zero mutations) + re-run ALL PASS real exit 0 at 57b10ebb after three mid-tick HEAD advances (survey-209 @ 0a1a40bb, survey-210 @ 57b10ebb observer holds; struct-136 zero mutations — all census-corroborated byte-identical epoch B) | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-192: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite.
Census 322==322 BOTH epochs (A/B 20s-paced, curl-class fetches
BYTE-IDENTICAL 95267B sha16 551d9f029269a6b4 — byte-identical to the
sweep-183 baseline-generating bytes, so quiet holds for ALL fields incl
comp/compKeys by byte identity, not just the diff tool's 6-field
projection): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0
compKeys drift (284 thing + 38 light). Baseline ca2a1883de2def3d
current, no rewrite (no-churn precedent). Overlap: SAT fresh-live 284
bbox non-light / 236 classified / 0 coverage holes, real exit 3
un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
148th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 170th cycle per the
committed sweep-191 pointer: longhouse 6/6 @ 0.3456
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0.
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (146th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base 2370772 re-read fresh immediately before append, D+0/E+0,
tool self-verifies law() pre and post append. Standing gate ALL PASS
real exit 0 at tick-start bdf90d9a run 1 (the gate's own HEAD-check
line disclosed struct-136 @ cef637a2 — prefix-gate-accepted build+judge
tick, zero mutations per its own entry); HEAD advanced three times
mid-tick (survey-209 @ 0a1a40bb, survey-210 @ 57b10ebb — observer
holds, zero world mutations, zero SWEEP paths, census-corroborated by
my own byte-identical epoch B); epoch law honored, gate RE-RUN ALL
PASS real exit 0 at 57b10ebb before the ledger append. Diff tool
folded: sweep192-census-diff.py authored fresh from the committed
sweep191 chassis verbatim (path+docstring swap only). Probe
self-catches this tick, all pre-verdict: (a) guessed battery tool
extension sweep89-battery.ts where the true tool is sweep89-battery.py
(found by ls, corrected before use — sweep-51 guessed-tool class);
(b) next-live-census.ts argv order — argv[2] is WORLD, output path is
not an argv (curl-class fetch used per committed chassis, world arg
self-caught from the 404-class error shape before any
misclassification — sweep-207 URL class); (c) NW walk first parse hit
banner-prefixed stdout — re-derived via first-brace slice (sweep-35
physics-banner class). Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use. Next
tier-2 pair (sweep-193): row-cottage + observatory circuit (171st
cycle — LRU chain re-derived from ledger tier-2 fragments this tick:
longhouse / garden-cottage @192, forge / potter @191, row-cottage /
observatory @190, inn / tower-house @187, hall / bunkhouse @188,
stable / market @189 — row-cottage/observatory stalest standing pair
at 2 sweeps; both walk tools verified present on disk this tick:
interior-walk-row-cottage.ts, struct2-walk-observatory.ts).

||| sweep-193 | 2026-09-10 | 322→323 arrival-fold (285 thing + 38 light; A/B 20s-paced curl-class fetches BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add; exactly ONE domain-valid arrival nx-struct-boy [-100,0.018685,0] yaw pi lib 8c25b66573954418 comp {} = struct-137 BOY'S SURFACE placement reconciled by struct-137v @ 76546ac3 interrupted-window struct-9 class, tuple ledger-exact line-for-line; 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift on all 322 shared ids; baseline rewritten 323 ents/214789B/sha16 fd2ff862683314c3 sweep-183 chassis verbatim, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 149th sweep since routing, no escalation due — law keys Sev 1); 285 bbox non-light / 236 classified / 0 coverage holes, boy in live SAT set adds NO new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 171st cycle row-cottage 6/6 @ 0.3838 + observatory 5/5 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK (147th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370773 at append, standing gate ALL PASS real exit 0 at tick-start b567c674 + RE-RUN ALL PASS real exit 0 at 76546ac3 after ONE mid-tick HEAD advance (struct-137v, the arrival's own owning lane, census-corroborated byte-identical epoch B) | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-193: CLEAN SWEEP, arrival-fold tick. Census 322→323 BOTH epochs
(A/B 20s-paced, curl-class fetches BYTE-IDENTICAL 95533B sha16
e7ea4e99bc2b2add — first live change after ~30 fully-quiet ticks,
settled before epoch B): exactly ONE domain-valid arrival nx-struct-boy
[-100, 0.018685, 0] yaw pi lib 8c25b66573954418 comp {} = struct-137
BOY'S SURFACE placement, reconciled by struct-137v @ 76546ac3
(interrupted-window struct-9 class: predecessor window died between
ledger-append and commit; reconciled fresh, never re-placed) — tuple
matches the committed ledger line-for-line; 0 departures, 0 field
diffs, 0 lib flips, 0 compKeys drift on all 322 shared ids. Baseline
rewritten 323 ents / 214789B / sha16 fd2ff862683314c3 via
sweep193-snapshot-rewrite.py (sweep-183 chassis verbatim, 9-field
projection, order+set preserved, pre-write asserts arrivals == exactly
[nx-struct-boy], post-rewrite drift ZERO). Overlap: SAT fresh-live 285
bbox non-light / 236 classified / 0 coverage holes, real exit 3
un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
149th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually,
per-leg ok + dist/distance parsed from results[] per tool schema.
Tier-2 171st cycle per the committed sweep-192 pointer: row-cottage
6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory circuit 5/5
@ 0.389 (struct2-walk-observatory.ts — sweep-189 correction-of-record
name), both ALL PASS real exit 0. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK (147th consecutive clean); sweep89-battery 28/28
ALL PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0
stable, read fresh twice. Ledger law EXACT — base 2370773 re-read
fresh immediately before append, D+0/E+0, tool self-verifies law()
pre and post append. Standing gate ALL PASS real exit 0 at tick-start
b567c674 run 1; HEAD advanced once mid-tick (struct-137v @ 76546ac3 —
the arrival's own owning lane closing its interrupted window, zero
further mutations per its own entry, census-corroborated by my own
byte-identical epoch B); epoch law honored, gate RE-RUN ALL PASS real
exit 0 at 76546ac3 before the ledger append. Diff tool folded:
sweep193-census-diff.py authored fresh from the committed sweep192
chassis verbatim (path+docstring swap only). Probe self-catch
pre-verdict, disclosed: first SAT count grep keyed the wrong log
phrases and returned empty (no counts printed) — re-derived from the
log's actual summary lines (entities-with-bbox 285 / exempt-classified
236 / unclassified 1) before any verdict line was written; sweep-48
schema-key class. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use. Next
tier-2 pair (sweep-194): inn + tower-house (172nd cycle — LRU chain
re-derived from ledger tier-2 fragments: row-cottage / observatory
@193, longhouse / garden-cottage @192, forge / potter @191, inn /
tower-house @187 stalest standing pair at 6 sweeps, hall / bunkhouse
@188, stable / market @189; both walk tools verified present on disk
this tick: interior-walk-inn.ts, interior-walk-tower-house.ts).

|||| sweep-194 | 2026-09-10 | 323==323 fully quiet, all THREE epochs (285 thing + 38 light; A/B/C 20s-paced curl-class fetches BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add — byte-identical to the sweep-193 baseline-generating live bytes, quiet holds for ALL fields incl comp/compKeys by byte identity; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift; baseline fd2ff862683314c3 current, no rewrite — no-churn precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 150th sweep since routing, no escalation due — law keys Sev 1); 285 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 172nd cycle inn 6/6 @ 0.364 + tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 ALL_PINS_OK (148th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370773 at append, standing gate ALL PASS real exit 0 at tick-start 8b278a6d run 1 + RE-RUN ALL PASS real exit 0 at 40d02040 after TWO mid-tick HEAD advances (survey-214 @ 12d1b6e0, survey-215 @ 40d02040 observer holds, zero world mutations, census-corroborated byte-identical epochs B and C) | CLEAN SWEEP — R-121 open, known, no escalation due |
|||| sweep-195 | 2026-09-10 | 323==323 fully quiet, all THREE epochs (285 thing + 38 light; A/B/C 20s-paced curl-class fetches BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add — byte-identical to the sweep-193 baseline-generating live bytes, quiet holds for ALL fields incl comp/compKeys by byte identity; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift; baseline fd2ff862683314c3 current, no rewrite — no-churn precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 151st sweep since routing, no escalation due — law keys Sev 1); 285 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 173rd cycle hall 8/8 @ 0.3600 + bunkhouse 6/6 @ 0.3803 ALL PASS | pins 15/15 ALL_PINS_OK (149th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370773 at append, standing gate ALL PASS real exit 0 at tick-start 0a6f0469 run 1 + RE-RUN ALL PASS real exit 0 at 4808fe77 after THREE mid-tick HEAD advances (survey-217 @ b44c94c6, survey-218 @ 71448b57 observer holds zero world mutations, struct-138 @ 4808fe77 build-deferred zero mutation — all census-corroborated by my own byte-identical epoch C) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-196 | 2026-09-10 | 323==323 fully quiet, BOTH epochs + tick-start read (285 thing + 38 light; A/B 20s-paced curl-class fetches BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add — byte-identical to the sweep-193 baseline-generating live bytes, quiet holds for ALL fields incl comp/compKeys by byte identity; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift; baseline fd2ff862683314c3 current, no rewrite — no-churn precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 152nd sweep since routing, no escalation due — law keys Sev 1); 285 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 174th cycle stable 5/5 @ 0.3958 + market 6/6 @ 0.3894 ALL PASS | pins 15/15 ALL_PINS_OK (150th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370773 at append, standing gate ALL PASS real exit 0 at tick-start d6729faa run 1 + RE-RUN ALL PASS real exit 0 at f997eea8 after TWO mid-tick HEAD advances (survey-220 @ d6729faa, survey-221/222 @ 92e1fc3f/f997eea8 observer holds, zero world mutations, census-corroborated byte-identical epoch B) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-197 | 2026-09-10 | 323==323 fully quiet, BOTH epochs (285 thing + 38 light; A/B 20s-paced curl-class fetches BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add — byte-identical to the sweep-193 baseline-generating live bytes, quiet holds for ALL fields incl comp/compKeys by byte identity; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift; baseline fd2ff862683314c3 current, no rewrite — no-churn precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 153rd sweep since routing, no escalation due — law keys Sev 1); 285 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 175th cycle forge 6/6 @ 0.3750 + potter 6/6 @ 0.3660 ALL PASS | pins 15/15 ALL_PINS_OK (151st consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370773 at append, standing gate ALL PASS real exit 0 at tick-start ffe3a620 run 1 (gate run 1 also absorbed survey-223 @ a3b01b87 pre-run) + RE-RUN ALL PASS real exit 0 at fabfd8ec after THREE mid-tick HEAD advances (survey-223 @ a3b01b87, survey-224 @ 06703762, survey-225 @ fabfd8ec observer holds, zero world mutations, census-corroborated byte-identical epoch B) | CLEAN SWEEP — R-121 open, known, no escalation due |
| sweep-198 | 2026-09-10 | 323==323 fully quiet, BOTH epochs (285 thing + 38 light; A/B 20s-paced curl-class fetches BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add — byte-identical to the sweep-193 baseline-generating live bytes, quiet holds for ALL fields incl comp/compKeys by byte identity; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift; baseline fd2ff862683314c3 current, no rewrite — no-churn precedent) | exit 3 on ONLY known R-121 lamp-n\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 154th sweep since routing, no escalation due — law keys Sev 1); 285 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 176th cycle longhouse 6/6 @ 0.3456 + garden-cottage 6/6 @ 0.3550 ALL PASS | pins 15/15 ALL_PINS_OK (152nd consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370773 at append, standing gate ALL PASS real exit 0 at tick-start 2b54af0f run 1 + RE-RUN ALL PASS real exit 0 at 90f0ec28 after TWO mid-tick HEAD advances (survey-226 @ fbf7e918 pass-through inside struct-139 window, survey-227 @ 90f0ec28 observer holds + struct-139 @ fbf7e918 enneper v3b banked-not-placed zero world mutation — all census-corroborated by my own byte-identical epoch B) | CLEAN SWEEP — R-121 open, known, no escalation due |

sweep-194: CLEAN SWEEP, fully quiet steady-state tick, no snapshot rewrite.
Census 323==323 at ALL THREE epochs (A/B/C 20s-paced, curl-class fetches
BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add — byte-identical to the
sweep-193 baseline-generating live bytes, so quiet holds for ALL fields
incl comp/compKeys by byte identity): 0 arrivals, 0 departures, 0 field
diffs, 0 lib flips, 0 compKeys drift (285 thing + 38 light). Baseline
fd2ff862683314c3 current, no rewrite (no-churn precedent). Overlap: SAT
fresh-live 285 bbox non-light / 236 classified / 0 coverage holes, real
exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 150th sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts),
NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38
(ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
172nd cycle per the committed sweep-193 pointer: inn 6/6 @ 0.364
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (148th consecutive clean);
sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes; interlane
md5 f6254cd0 stable, read fresh; ledger law EXACT — base 2370773 re-read
fresh immediately before append, D+0/E+0, tool self-verifies law() pre
and post append. Standing gate ALL PASS real exit 0 at tick-start
8b278a6d run 1; HEAD advanced twice mid-tick (survey-214 @ 12d1b6e0,
survey-215 @ 40d02040 — observer holds, zero world mutations, zero SWEEP
paths, census-corroborated by my own byte-identical epochs B and C);
epoch law honored, gate RE-RUN ALL PASS real exit 0 at 40d02040 before
the ledger append. Diff tool folded: sweep194-census-diff.py authored
fresh from the committed sweep193 chassis verbatim (path+docstring swap
only). Probe self-catches this tick, all pre-verdict or pre-commit,
disclosed: (a) ledger-law probe first returned whole-file sum 34773 vs
canonical 34771 (sweep-36 whole-file class — re-derived from
ledger-append.py's own law() before any verdict); (b) SAT count grep
initially keyed wrong phrases returning empty (sweep-193 class —
re-derived from the log's actual summary lines entities-with-bbox 285 /
exempt-classified 236 / unclassified 1); (c) the ledger entry's FIRST
append landed with corrupted prose — mangled tool names, a 0.0.37 typo,
and a mid-sentence scramble (adjacent-token-bleed, sweep-55 class) —
caught on immediate re-read, entry rewritten wholesale in-place BEFORE
commit with running total and the single (D+0, E+0) pair preserved, law
re-verified exact after rewrite, correct forms verified present.
Zero world mutations, zero defect notes, zero uploads, zero verbs, zero
comp edits, zero shared-budget use. Next tier-2 pair (sweep-195):
hall + bunkhouse (173rd cycle — LRU chain re-derived from ledger tier-2
fragments this tick: row-cottage / observatory @193, longhouse /
garden-cottage @192, forge / potter @191, inn / tower-house @194, hall /
bunkhouse @188 stalest standing pair at 6 sweeps, stable / market @189;
both walk tools verified present on disk this tick: interior-walk-hall.ts,
interior-walk-bunkhouse.ts).

sweep-195: CLEAN SWEEP fully quiet steady-state tick — census 323==323 all three epochs (A/B/C 20s-paced, curl-class fetches BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift (285 thing + 38 light). Baseline fd2ff862683314c3 current, no rewrite (no-churn precedent). Overlap: SAT fresh-live 285 bbox non-light / 236 classified / 0 coverage holes, real exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed artwalk b26 choreography @ sweep-43, 151st sweep since routing, NOT new, no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 173rd cycle per the committed sweep-194 pointer: hall 8/8 @ 0.3600 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (149th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh; ledger law EXACT — base 2370773 re-read fresh immediately before append, D+0/E+0, tool self-verifies law() pre and post append. Standing gate ALL PASS real exit 0 at tick-start 0a6f0469 run 1; HEAD advanced THREE times mid-tick (survey-217 @ b44c94c6, survey-218 @ 71448b57 — observer holds; struct-138 @ 4808fe77 — enneper refine build-deferred tick, zero world mutation; none touch SWEEP paths, all census-corroborated by my own byte-identical epoch C); epoch law honored, gate RE-RUN ALL PASS real exit 0 at 4808fe77 before the ledger append. Diff tool folded: sweep195-census-diff.py authored fresh from the committed sweep194 chassis verbatim (path+docstring swap only, swap asserted). Probe self-catches this tick, all pre-verdict, disclosed: (a) pins verdict first read through a tail pipe — exit code laundered (pipe-laundering class), re-run un-piped to file for PINS_TRUE_EXIT=0 before any verdict; (b) core walk JSON parse hit banner-prefixed stdout — physics support-seam lines precede the JSON (sweep-35 class), re-derived via first-brace slice; (c) interior-walk tier-2 tools emit results[]+maxArrival, not legs (tier-1 chassis) — first parse KeyError'd, schema read from actual output and counts verified against standing ledger history (hall 8/8 records) before claiming. Zero world mutations, zero defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use. Next tier-2 pair (sweep-196): stable + market (174th cycle — LRU chain re-derived from ledger tier-2 fragments this tick: hall / bunkhouse @195, inn / tower-house @194, row-cottage / observatory @193, longhouse / garden-cottage @192, forge / potter @191, stable / market @189 stalest standing pair at 6 sweeps; both walk tools verified present on disk this tick: interior-walk-stable.ts, interior-walk-market.ts).

sweep-196: CLEAN SWEEP fully quiet steady-state tick — census 323==323 at
BOTH epochs plus the tick-start read (A/B 20s-paced, curl-class fetches
BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add — byte-identical to the
sweep-193 baseline-generating live bytes, so quiet holds for ALL fields
incl comp/compKeys by byte identity): 0 arrivals, 0 departures, 0 field
diffs, 0 lib flips, 0 compKeys drift (285 thing + 38 light). Baseline
fd2ff862683314c3 current, no rewrite (no-churn precedent). Overlap: SAT
fresh-live 285 bbox non-light / 236 classified / 0 coverage holes, real
exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 152nd sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38
(ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
174th cycle per the committed sweep-195 pointer: stable 5/5 @ 0.3958
(interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts),
both ALL_PASS real exit 0 — both exactly match the sweep-182 records for
the same pair. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK
(150th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh; ledger law
EXACT — base 2370773 re-read fresh immediately before append, D+0/E+0,
tool self-verifies law() pre and post append; the tool's stacked pair on
this entry's prose tail was deduped pre-commit (h-1 law class, slice law
re-verified exact 34771 after dedupe). Standing gate ALL PASS real exit 0
at tick-start d6729faa run 1; HEAD advanced twice mid-tick (survey-221 @
92e1fc3f, survey-222 @ f997eea8 — observer holds, zero world mutations,
zero SWEEP paths, census-corroborated by my own byte-identical epoch B);
epoch law honored, gate RE-RUN ALL PASS real exit 0 at f997eea8 before
the ledger append. Diff tool folded: sweep196-census-diff.py authored
fresh from the committed sweep195 chassis verbatim (path+docstring swap
only, swap asserted). Probe self-catches this tick, all pre-verdict,
disclosed: (a) epoch-B diff invoked before the epoch-B fetch — tool
FileNotFoundError'd, fetch then diff re-run in the correct order; no
verdict line was written against the missing epoch (ordering-slip class,
kin to sweep-192 URL-argv); (b) history-row anchor first asserted a
5-pipe prefix where the file carries 4 (assert fired BEFORE any write —
anchor re-derived from the actual file, adjacent-token-bleed prevention
class). Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-197): forge + potter (175th cycle — LRU chain re-derived from
ledger tier-2 fragments this tick: stable / market @196, hall / bunkhouse
@195, inn / tower-house @194, row-cottage / observatory @193, longhouse /
garden-cottage @192, forge / potter @191 stalest standing pair at 5
sweeps; both walk tools verified present on disk this tick:
interior-walk-forge.ts, interior-walk-potter.ts).

sweep-197: CLEAN SWEEP fully quiet steady-state tick — census 323==323 at
BOTH epochs (A/B 20s-paced, curl-class fetches BYTE-IDENTICAL 95533B sha16
e7ea4e99bc2b2add — byte-identical to the sweep-193 baseline-generating live
bytes, so quiet holds for ALL fields incl comp/compKeys by byte identity):
0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift
(285 thing + 38 light). Baseline fd2ff862683314c3 current, no rewrite
(no-churn precedent). Overlap: SAT fresh-live 285 bbox non-light / 236
classified / 0 coverage holes, real exit 3 un-piped on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 153rd sweep since routing, NOT new,
no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
175th cycle per the committed sweep-196 pointer: forge 6/6 @ 0.3750
(interior-walk-forge.ts) + potter 6/6 @ 0.3660 (interior-walk-potter.ts),
both ALL_PASS real exit 0 — both exactly match the sweep-191 records for
the same pair. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (151st
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A
bytes; interlane md5 f6254cd0 stable, read fresh twice; ledger law EXACT —
base 2370773 re-read fresh immediately before append, D+0/E+0, tool
self-verifies law() pre and post append. Standing gate ALL PASS real exit 0
at tick-start ffe3a620 run 1 (that run also printed survey-223 @ a3b01b87
as HEAD — absorbed); HEAD advanced three times mid-tick (survey-223 @
a3b01b87, survey-224 @ 06703762, survey-225 @ fabfd8ec — observer holds,
zero world mutations, zero SWEEP paths, census-corroborated by my own
byte-identical epoch B); epoch law honored, gate RE-RUN ALL PASS real exit
0 at fabfd8ec before the ledger append. Diff tool folded:
sweep197-census-diff.py authored fresh from the committed sweep196 chassis
verbatim (path+docstring swap only, swap asserted: 3 refs forward, 0
stale). Probe self-catches this tick, all pre-verdict, disclosed: (a) the
tier-2 walk parser first keyed per-leg dist against a results[]-of-legs
shape with a nested fallback expression that errored on the second file —
schema re-read from actual output (top-level status/maxArrival/results[],
sweep-195 class), both files re-parsed cleanly before any verdict; (b) the
forge parse's first inline python errored half-way (POTTER_PENDING guard
fired as designed), potter run separately and parsed from its own output.
Zero world mutations, zero defect notes, zero uploads, zero verbs, zero
comp edits, zero shared-budget use. Next tier-2 pair (sweep-198):
longhouse + garden-cottage (176th cycle — LRU chain re-derived from ledger
tier-2 fragments this tick: forge / potter @197, stable / market @196,
hall / bunkhouse @195, inn / tower-house @194, row-cottage / observatory
@193, longhouse / garden-cottage @192 stalest standing pair at 5 sweeps;
both walk tools verified present on disk this tick:
interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).


sweep-198: CLEAN SWEEP fully quiet steady-state tick — census 323==323 at BOTH epochs (A/B 20s-paced, curl-class fetches BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add — byte-identical to the sweep-193 baseline-generating live bytes, so quiet holds for ALL fields incl comp/compKeys by byte identity): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift (285 thing + 38 light). Baseline fd2ff862683314c3 current, no rewrite (no-churn precedent). Overlap: SAT fresh-live 285 bbox non-light / 236 classified / 0 coverage holes, real exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43, 154th sweep since routing, NOT new, no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 176th cycle per the committed sweep-197 pointer: longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.3550 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0 — both match the sweep-3/sweep-192 records for the pair. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (152nd consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh twice; ledger law EXACT — base 2370773 re-read fresh immediately before append, D+0/E+0, tool self-verifies law() pre and post append. Standing gate ALL PASS real exit 0 at tick-start 2b54af0f run 1; HEAD advanced mid-tick (survey-227 @ 90f0ec28 observer hold, struct-139 @ fbf7e918 enneper v3b banked-not-placed, zero world mutation; the struct-139 tip also carried survey-226 pass-through reporting); epoch law honored, gate RE-RUN ALL PASS real exit 0 at 90f0ec28 before the ledger append. Diff tool folded: sweep198-census-diff.py authored fresh from the committed sweep197 chassis verbatim (path+docstring swap only, swap asserted: 3 refs forward, 0 stale). Probe self-catches this tick, all pre-verdict, disclosed: (a) pins verdict first parsed with an assumed ok-as-list schema — the tool reports ok as an int count; verdict re-confirmed from raw output (ALL_PINS_OK, ok 15, bad []), sweep-195 class schema re-read; (b) one diff-tool invocation lost its workdir to a parallel-call artifact (wrong-cwd FileNotFoundError, sweep-197 ordering-slip class kin) — re-run in the correct repo cwd, no verdict was written against the missing epoch. Zero world mutations, zero defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use. Next tier-2 pair (sweep-199): row-cottage + observatory (177th cycle — LRU chain re-derived from ledger tier-2 fragments this tick: longhouse / garden-cottage @198, forge / potter @197, stable / market @196, hall / bunkhouse @195, inn / tower-house @194, row-cottage / observatory @193 stalest standing pair at 5 sweeps; both walk tools verified present on disk this tick: interior-walk-row-cottage.ts, struct2-walk-observatory.ts).


sweep-199: CLEAN SWEEP, single-classified-change tick (epoch-correction
class). Census epoch A 323==323 vs baseline fd2ff862683314c3: 0 arrivals,
0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift — byte-identical
e7ea4e99bc2b2add. Sibling struct-140 (enneper v3c seam/rim vocabulary split
+ exact-site re-seat) landed mid-tick at c83f0755 AFTER my census/walks, so
per the polish-270 epoch law all affected evidence was re-taken fresh
before verdicts: epoch-B census (323==323, exactly ONE classified drift
field-set = nx-struct-enneper lib ba17a712cbc734bd->e34ba6932dd2ab86, pos
y-only -0.013339->-0.014849 = its disclosed 1.5mm terrain PY re-derivation
for the 9.7m base, bbox per new bytes; exact site, x/z/yaw unchanged —
r250, 234.6m from row-cottage / 286m from observatory / all tier-1 legs
r<20, epoch-A walks stand by construction, sweep-53 precedent), SAT re-run
at epoch B (285/236/0, exit 3 on the same single known R-121 — no new
contacts), battery 28/28 + pins 15/15 re-run on epoch-B bytes. Overlap:
exit 3 on ONLY known R-121 lamp-n|nx-town-mapboard -0.407 — Sev 2
artwalk-routed b26 choreography @ sweep-43, 155th sweep since routing, NOT
new, no escalation due (law keys severity-1). Tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38,
NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 177th cycle per committed sweep-198
pointer: row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) +
observatory 5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real
exit 0 — both match sweep-193 records for the pair. Integrity: pins 15/15
ALL_PINS_OK (153rd consecutive clean), sweep89-battery 28/28 ALL PASS
(epoch-A and epoch-B bytes), interlane md5 f6254cd0 stable read fresh
twice, ledger law EXACT base 2370773 re-read fresh immediately before
append. Standing gate ALL PASS real exit 0 at tick-start (own sweep-198
tip 9ba3d1f8, absorbed sibling survey-229 @ 34751138 mid-run); HEAD
advanced twice mid-tick (survey-230 @ d5a272ff observer hold, struct-140 @
c83f0755 the classified enneper change) — epoch law honored, gate RE-RUN
required before append. Baseline rewritten via sweep199-snapshot-rewrite.py
(sweep-183 chassis, field-change variant): 323 ents, 214799B, sha16
29f0c652df402f01, pre-write asserts (diff set exactly [enneper lib+pos+bbox],
x/z/yaw unchanged, y delta <0.01), post-rewrite drift ZERO on the 322
other ids. Diff tool sweep199-census-diff.py authored fresh from the
committed sweep198 chassis verbatim (path+docstring swap only, swap
asserted: 3 refs forward, 0 stale). Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use.
Next tier-2 pair (sweep-200): inn + tower-house (178th cycle — LRU chain
re-derived from ledger tier-2 fragments this tick: row-cottage /
observatory @199, forge / potter @197, stable / market @196, hall /
bunkhouse @195, inn / tower-house @194 stalest standing pair at 5 sweeps,
longhouse / garden-cottage @198; both walk tools verified present on disk
this tick: interior-walk-inn.ts, interior-walk-tower-house.ts).


sweep-200: CLEAN SWEEP, fully quiet steady-state tick, no snapshot rewrite.
Census 323==323 at BOTH epochs (A/B 20s-paced, curl-class fetches
BYTE-IDENTICAL 95543B sha16 d8fa3d8372b40ac7 — byte-identical to
sweep-199's epoch-B post-enneper capture, verified by direct cmp this
tick, so quiet holds for ALL fields incl comp/compKeys by byte identity;
the +10B vs the sweep-193..198 95533B representation is sweep-199's own
classified enneper flip, classified by byte-compare BEFORE any verdict —
representation-epoch sweep-159 class, resolved, not a new change):
0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift
(285 thing + 38 light). Baseline 29f0c652df402f01 current, no rewrite
(no-churn precedent — field-equal to live on every compared field).
Overlap: SAT fresh-live 285 bbox non-light / 236 classified / 0 coverage
holes, real exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 156th sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 178th cycle per the
committed sweep-199 pointer: inn 6/6 @ 0.364 (interior-walk-inn.ts) +
tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS
real exit 0 — both match sweep-194 records for the pair. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (154th consecutive clean);
sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes; interlane
md5 f6254cd0 stable, read fresh; ledger law EXACT — base 34771 re-read
fresh immediately before append, D+0/E+0, tool self-verifies law() pre
and post append. Standing gate ALL PASS real exit 0 at tick-start
ceb3a268 run 1 (own sweep-199 tip); HEAD advanced three times mid-tick
(survey-231 @ 912db233 — arrival-gated slice that natively discharged
struct-140's v3c judgment debt CLEAN; struct-141 @ 62951f35 — HERO-READY
eye-gate packet, zero world mutations; survey-232 @ d507febd — observer
hold; all zero world mutations per their own entries, all
census-corroborated by my own byte-identical epoch B); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at d507febd before the ledger
append. Probe self-catches this tick, all pre-verdict, disclosed:
(a) core-walk first parse hit the appended EXIT line — Extra data
class, re-parsed via regex brace-block slice (sweep-35 banner class);
(b) epoch-A raw-size delta +10B vs the historical representation
flagged and CLASSIFIED by direct byte-compare against sweep-199's
surviving /tmp epoch-B capture before any verdict was written; (c) first
ledger-append invocation ran from agents/arthur/ cwd — tool resolves
IMPROVEMENTS.md repo-root-relative, FileNotFoundError, re-run from repo
root (sweep-187 wrong-cwd class). Diff tool folded:
sweep200-census-diff.py authored fresh from the committed sweep199
chassis verbatim (sed swap only, asserted: 3 refs forward, 0 stale).
Zero world mutations, zero defect notes, zero uploads, zero verbs, zero
comp edits, zero shared-budget use. Next tier-2 pair (sweep-201):
forge + potter (179th cycle — LRU chain re-derived from ledger tier-2
fragments this tick: inn / tower-house @200, row-cottage / observatory
@199, longhouse / garden-cottage @198, forge / potter @197 stalest
standing pair at 3 sweeps, stable / market @196, hall / bunkhouse @195;
both walk tools verified present on disk this tick:
interior-walk-forge.ts, interior-walk-potter.ts).


sweep-201: CLEAN SWEEP fully quiet steady-state tick, no snapshot rewrite.
Census 323==323, quiet verified across BOTH representations this tick:
projection epochs A/B (20s-paced, next-live-census.ts chassis) BYTE-IDENTICAL
214035B sha16 ed5856e6ef4abd37 — byte-identical to the survey-231/232/233
certified post-enneper baseline; AND raw curl-class fetch (UA arthur-sweep201)
95543B BYTE-IDENTICAL to sweep-200's surviving epoch-B capture by direct cmp
(the +10B vs the sweep-193..198 95533B representation is sweep-199's own
classified enneper flip, sweep-159 class, resolved by byte-compare BEFORE any
verdict): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys
drift (285 thing + 38 light). Baseline 29f0c652df402f01 current, no rewrite
(no-churn precedent — field-equal to live on every compared field).
Overlap: SAT fresh-live 285 bbox non-light / 236 classified / 0 coverage
holes, real exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 157th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Tier-2 179th cycle per the committed sweep-200
pointer: forge 6/6 @ 0.3750 (interior-walk-forge.ts) + potter 6/6 @ 0.3660
(interior-walk-potter.ts), both ALL_PASS real exit 0 — both match the
sweep-197 records for the pair. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK (155th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0
on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh; ledger
law EXACT base 2370773 re-read fresh immediately before append, D+0/E+0,
tool self-verifies law() pre and post append. Standing gate ALL PASS real
exit 0 at tick-start ffa47eb0 run 1 (own survey-233 tip); HEAD advanced
twice mid-tick (survey-234 @ 54fb6103, survey-235 @ e79ace9d — observer
holds, zero world mutations per their own entries, both census-corroborated
by my own byte-identical epochs); epoch law honored, gate RE-RUN ALL PASS
real exit 0 at e79ace9d before the ledger append. Probe self-catches this
tick, all pre-verdict, disclosed: (a) first tier-1 walk batch timed out at
the 420s wrapper with all four logs complete on disk — wrapper timeout
classified, verdicts taken from per-file real exit + JSON status fields,
each tool re-verified by log-size + ALL_PASS string, forge/potter re-run
individually; (b) first walk-parse keyed per-leg 'status' — wrong field
(legs carry ok:true; suites carry status), schema re-read from actual
output before any verdict (sweep-195 class); (c) grep -c 'sweep-201' on the
ledger returned 1 pre-append — matched sweep-200's PROSE naming the next
pair, not a tag entry; re-checked with '^- [sweep-201]' anchored count = 0
(tag-race check passed on the anchored form). Diff tool folded:
sweep201-census-diff.py authored fresh from the committed sweep200 chassis
verbatim (sed swap only, asserted: 3 refs forward, 0 stale). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use. Next tier-2 pair (sweep-202): hall + bunkhouse
(180th cycle — LRU chain re-derived from ledger tier-2 fragments this
tick: inn / tower-house @200, row-cottage / observatory @199, longhouse /
garden-cottage @198, forge / potter @201, stable / market @196, hall /
bunkhouse @195 stalest standing pair at 5 sweeps; both walk tools verified
present on disk this tick: interior-walk-hall.ts, interior-walk-bunkhouse.ts).

sweep-202: CLEAN SWEEP fully quiet steady-state tick, no snapshot rewrite.
Census 323==323 at BOTH epochs (A/B 20s-paced, next-live-census.ts chassis)
BYTE-IDENTICAL 214035B sha16 ed5856e6ef4abd37 — byte-identical to the
survey-231..235 / sweep-200/201 certified post-enneper baseline
representation, so quiet holds for ALL fields the projection carries incl
comp/compKeys by byte identity: 0 arrivals, 0 departures, 0 field diffs,
0 lib flips, 0 compKeys drift (285 thing + 38 light). Projection-quiet
only this tick (no second raw-representation fetch; byte-identity to the
baseline representation carries, sweep-198 precedent). Baseline
29f0c652df402f01 current, no rewrite (no-churn precedent — field-equal to
live on every compared field). Overlap: SAT fresh-live 285 bbox non-light /
236 classified / 0 coverage holes, real exit 3 un-piped on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 158th sweep since routing, NOT new,
no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
180th cycle per the committed sweep-201 pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts),
both ALL_PASS real exit 0 — both match the sweep-195/200 records for the
pair. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (156th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A
bytes; interlane md5 f6254cd0 stable, read fresh; ledger law EXACT base
re-read fresh immediately before append, D+0/E+0, tool self-verifies law()
pre and post append. Standing gate ALL PASS real exit 0 at tick-start
88c80493 run 1 (own sweep-201 tip); HEAD advanced once mid-tick (survey-237
@ 111418f4 — observer hold, zero world mutations per its own entry,
census-corroborated by my own byte-identical epochs AND its own
ed5856e6 capture); epoch law honored, gate RE-RUN ALL PASS real exit 0 at
111418f4 before the ledger append. Diff
tool sweep202-census-diff.py authored fresh from the committed sweep201
chassis verbatim (sed swap only, asserted: 3 refs forward, 1 stale ref =
the docstring chassis-provenance line naming sweep201, accurate as
provenance, 0 functional stale refs). Probe self-catches this tick, all
pre-verdict, disclosed: (a) first core-walk field grep matched nothing —
keys quoted differently in output; re-parsed via regex brace-block slice and
read the actual schema before any verdict (sweep-195 class); (b) approach
walk per-leg dist max printed 0 — those tools report suite-level
maxArrival, not per-leg dist; re-keyed on the suite field. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use. Next tier-2 pair (sweep-203): stable + market
(181st cycle — LRU chain re-derived from ledger tier-2 fragments this
tick: hall / bunkhouse @202, forge / potter @201, inn / tower-house @200,
row-cottage / observatory @199, longhouse / garden-cottage @198, stable /
market @196 stalest standing pair at 6 sweeps; both walk tools verified
present on disk this tick: interior-walk-stable.ts,
interior-walk-market.ts).

sweep-203: CLEAN SWEEP fully quiet steady-state tick, no snapshot rewrite.
Census 323==323 at BOTH epochs (A/B 20s-paced, next-live-census.ts chassis)
BYTE-IDENTICAL 214035B sha16 ed5856e6ef4abd37 — byte-identical to the
survey-231..239 / sweep-200..202 certified post-enneper baseline
representation, so quiet holds for ALL fields the projection carries incl
comp/compKeys by byte identity: 0 arrivals, 0 departures, 0 field diffs,
0 lib flips, 0 compKeys drift (285 thing + 38 light). Projection-quiet
only this tick (no second raw-representation fetch; byte-identity to the
baseline representation carries, sweep-198 precedent). Baseline
29f0c652df402f01 current, no rewrite (no-churn precedent — field-equal to
live on every compared field). Overlap: SAT fresh-live 285 bbox non-light /
236 classified / 0 coverage holes, real exit 3 un-piped on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 159th sweep since routing, NOT new,
no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
181st cycle per the committed sweep-202 pointer: stable 5/5 @ 0.3958
(interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both ALL_PASS real exit 0 — both match the
sweep-196 records for the pair. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK bad:[] (157th consecutive clean); sweep89-battery 28/28 ALL
PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable, read
fresh; ledger law EXACT — base 2370773 re-read fresh immediately before
append, D+0/E+0, tool self-verifies law() pre and post append. Standing
gate ALL PASS real exit 0 at tick-start 48fc37e8 run 1 (own sweep-202
tip); HEAD advanced twice mid-tick (survey-238 @ 3889058a, survey-239 @
490166b0 — observer holds, zero world mutations per their own entries,
zero SWEEP paths, census-corroborated by my own byte-identical epoch B);
epoch law honored, gate RE-RUN ALL PASS real exit 0 at 490166b0 before
the ledger append. Diff tool sweep203-census-diff.py authored fresh from
the committed sweep202 chassis verbatim (sed swap only, asserted: 3 refs
forward, 1 stale ref = the docstring chassis-provenance line naming
sweep202, accurate as provenance, 0 functional stale refs). Probe
self-catches this tick, all pre-verdict, disclosed: (a) first walk-parse
keyed per-leg 'ok' on the core suite — schema carries suite-level
status/maxArrival with per-leg entries in results[]; re-keyed on the
suite fields after reading actual output (sweep-195/202 class). Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use. Next tier-2 pair (sweep-204): inn +
tower-house (182nd cycle — LRU chain re-derived from ledger tier-2
fragments this tick: stable / market @203, hall / bunkhouse @202, forge /
potter @201, inn / tower-house @200 stalest standing pair at 3 sweeps,
row-cottage / observatory @199, longhouse / garden-cottage @198; both
walk tools verified present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).