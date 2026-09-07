#!/usr/bin/env python3
"""sweep-83 plan row + prose block append with unique-anchor assertion."""
import io

PATH = 'agents/arthur/SWEEP-PLAN.md'
s = open(PATH).read()

# unique anchor: sweep-82's committed next-pointer ends the file
anchor = 'stable is the stalest standing target, observatory rides along as its circuit partner per the sweep-79 re-pin).'
assert s.count(anchor) == 1, ('anchor not unique', s.count(anchor))
assert s.rstrip().endswith('sweep-79 re-pin).\\n'), 'file does not end with the sweep-82 pointer block'

row = ("\\n| sweep-83 | 2026-09-07 | 284==284 epoch-corrected across epochs A/B/C vs committed sweep-82 baseline "
"sha16 c8d3817982a7a9bb: epoch A fully quiet 0/0/0 (0 arrivals, 0 departures, 0 drift on canonical 6-field diff); "
"epoch B caught sibling city-14 in-flight = exactly the 7-field kiln compression move (register row 51) — nx-town-kiln "
"(31,0,39) yaw -2.478 -> az49.5 r29.5 (19.159,-0.021,22.432) yaw -2.443, 20.36m, nx-sign-kiln-001 + nx-town-kiln-l + "
"artwalk rider b12-kiln-heat-contours follow hosts, all same-lib 4d8ef8fc content-addressed zero uploads; epoch C "
"20s-paced settled 0/0/0; 0 arrivals, 0 departures, 0 unexplained drift; vacated-tool class NEGATIVE — city-14 "
"same-tick re-pinned artwalk-walk-b12 + interior-place-kiln + interior-walk-potter (grep-verified in files, city-10 "
"precedent), city-15 closed the sweep-82 potter watch item; snapshot rewritten 114164B/284/sha16 c82675cbe5a45d84, "
"pre-write assertion diff exactly the 7-field move, post-rewrite drift ZERO | exit 3 on ONLY known R-121 "
"lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 39th sweep since routing, no escalation due — law "
"keys Sev-1); SAT epoch A 246 bbox/229 classified/0 holes + epoch C re-run 246/230/0, ZERO new contacts at the kiln's "
"new seat (sweep-side corroboration of city-14 rect-SAT worst 2.531 vs nx-tower) | tier-1 4/4 per-leg verified 81/81 "
"ALL_PASS real exit 0 each (core 64/64 @ 0.38 epoch A + epoch C RE-WALKED 64/64 @ 0.38 — kiln seat 11.9m from nearest "
"core waypoint, inside re-verify band, re-walked not argued; NE 7/7 @ 0.38 epoch A + epoch C RE-WALKED 7/7 @ 0.38 — "
"kiln seat 8.3m from NE waypoint 1, inside band; NW 5/5 @ 0.38, SW 5/5 @ 0.37 — nearest NW waypoint 49.1m / SW 53.5m, "
"stand by construction; distances derived from tool files not memory) + tier-2 61st cycle per committed pointer stable "
"6/6 @ 0.325 (verdict printed, then killed at 60s on post-verdict disconnect dwell — known WS-hang class, disclosed) + "
"observatory circuit 5/5 @ 0.389 real exit 0 at city-9 SW seat | pins 15/15 ALL_PINS_OK 38th consecutive (struct18 real "
"exit 0) + battery 17/17 ALL_PASS on epoch-C bytes (38 lights, 16 comp-bearing, carousel exact 7 + ce3633992d07055e, "
"gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc5 + ladder, windmill 369c5724, "
"woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be + beacon-l, hamlet embers 5-of-5, "
"court smoke, ogeegate + angler exact); interlane f6254cd0 stable; ledger law EXACT at append; standing gate ALL PASS "
"real exit 0 at tick-start bf3c2785 + re-run 258617b0 | CLEAN SWEEP — R-121 open, known, no escalation due |")

prose = ("\\n\\nsweep-83: CLEAN SWEEP, epoch-correction tick (city-14 kiln compression absorbed; three sibling arcs "
"landed in-window: dress-104 bellows v8 BUILD-ONLY, city-15 hold + sweep-77 closure annotation, struct-79 screw well "
"v3 judge — none touched the live world). Census epoch A 284==284 fully quiet vs the committed sweep-82 baseline "
"(sha16 c8d3817982a7a9bb): 0/0/0 on the canonical 6-field diff. The paced epoch-B re-read caught sibling city-14 in "
"flight executing CITY-PLAN register row 51 (kiln compress inward, on-axis with charcoal completing the production arc "
"woodyard->kiln->charcoal): nx-town-kiln moved (31,0,39) yaw -2.478 -> (19.159,-0.021,22.432) yaw -2.443 — 20.36m — "
"with nx-sign-kiln-001, nx-town-kiln-l, and artwalk rider b12-kiln-heat-contours following their host as one family, "
"all same-lib 4d8ef8fc content-addressed, zero uploads. Per the polish-270 epoch law all affected evidence was "
"re-taken fresh before verdicts: distances RE-DERIVED FROM TOOL FILES (sweep-51 no-guessed-pins law — NW/SW waypoint "
"constants parsed from each tool's pol() definitions, not memory): kiln seat 8.3m from NE waypoint 1 and 11.9m from "
"the nearest core waypoint — both inside the re-verify band — so NE 7/7 and core 64/64 were RE-WALKED at epoch C "
"(both ALL_PASS @ 0.38, real exit 0), SAT re-run at epoch C (246/230/0, same single unclassified R-121), battery "
"re-run on epoch-C bytes 17/17 ALL_PASS. NW (49.1m) and SW (53.5m) stand by construction. Vacated-tool class "
"NEGATIVE: city-14 re-pinned artwalk-walk-b12 (exact live tuple 19.15872/22.43198 grep-verified), interior-place-kiln "
"(polar-law derived seat, verified), and interior-walk-potter (city-13 seat 23.776/7.725 grep-verified) all same-tick "
"— city-10 precedent honored; city-15's annotation additionally closes the sweep-82 potter watch item "
"(interior-walk-potter 6/6 @ 0.366). Overlap: exit 3 on ONLY R-121 lamp-n|nx-town-mapboard -0.407, known Sev 2 "
"routed artwalk b26 @ sweep-43, 39th sweep since routing, no escalation due (law keys severity-1); ZERO new contacts "
"at the kiln's new seat — the moved family's SAT surface is clean (sweep-side corroboration of city-14's own "
"preflight rect-SAT 2.531). Tier-1 81/81 ALL_PASS every leg real exit 0. Tier-2 61st cycle per the committed pointer: "
"stable 6/6 @ 0.325 + observatory circuit 5/5 @ 0.389. Tooling self-catches disclosed: (a) the sweep79 walk parser is "
"keyed to results[]-shape tier-1 tools and mis-parses status-shape tier-2 tools — each tier-2 tool's own ALL_PASS "
"verdict line was read directly instead; (b) improve12-walk-stable.ts hung in post-verdict disconnect() (known "
"circuit dwell class) and was killed at 60s AFTER its verdict printed, EXIT 143 — verdict intact, process residue "
"disclosed; (c) one foreground walk batch hit the terminal 420s ceiling — re-run with per-tool logs + explicit EXIT "
"capture so no timeout could launder a verdict (content-verdict anchoring law). LRU ERRATUM #2 (disclosed, same "
"class as sweep-81): the sweep-82 pointer claimed 'stable last walked sweep-69' but the sweep-76 row+prose BOTH "
"record stable 5/5 @ 0.396 — @76 wins; the walk was lawful under either reading (14 sweeps stale). Corrected chain: "
"@83 stable/observatory, @82 garden-cottage/tower-house, @81 hall/forge, @80 bunkhouse/longhouse, @79 "
"row-cottage/observatory-at-old-seat, @78 potter-vacated/market, @76 inn/stable. Next tier-2 pair (sweep-84): inn + "
"market (62nd cycle — inn last walked sweep-76, now the stalest standing target; market last walked sweep-78).\\n")

out = s.rstrip('\n') + row + prose
# verify written file: block count grew by exactly the two new blocks
assert out.count('| sweep-83 |') == 1 and out.count('sweep-83: CLEAN SWEEP') == 1
open(PATH, 'w').write(out)
chk = open(PATH, 'rb').read()
print('APPENDED bytes', len(chk), 'sweep-83 blocks', chk.count(b'sweep-83'))
