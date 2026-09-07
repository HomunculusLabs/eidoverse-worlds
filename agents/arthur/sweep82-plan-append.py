#!/usr/bin/env python3
"""sweep-82 plan row + prose block append with unique-anchor assertion."""
import io

PATH = 'agents/arthur/SWEEP-PLAN.md'
s = open(PATH).read()

# unique anchor: sweep-81's LRU erratum block ends the file
anchor = 'garden-cottage + tower-house (60th cycle — true stalest by corrected chain).'
assert s.count(anchor) == 1, ('anchor not unique', s.count(anchor))
assert s.rstrip().endswith('corrected chain).'), 'file does not end with the sweep-81 erratum block'

row = ("\\n| sweep-82 | 2026-09-07 | 284==284 epoch-corrected across epochs A/B/C vs committed sweep-81 baseline sha16 "
"b55bd10c9ecdbe5c: epoch A fully quiet 0/0/0; epoch B caught sibling city-13 in-flight = exactly the 7-field "
"potter compression move (register row 50 'compress inward') — nx-town-potter (26,0,40.5) yaw -2.583 -> "
"(23.776,-0.004,7.725) yaw -1.898 [r25 az18], nx-sign-potter-001 + nx-town-potter-l + artwalk rider "
"b3-ruled-porch follow hosts, all same-lib content-addressed, motion:pwheel comp SURVIVED (city lane "
"re-applied, wipe law honored), rider host-local anchor preserved <1mm; epoch C 20s-paced 0/0/0 settled; "
"0 arrivals, 0 departures, 0 unexplained drift; vacated-tool class POSITIVE: interior-walk-potter.ts still "
"pinned to the old seat (26,40.5), city-13 commit pending — sweep-77 class watch item for the owning lane's "
"same-commit re-pin; snapshot rewritten 114076B/284/sha16 c8d3817982a7a9bb, pre-write assertion diff exactly "
"the 7-field move, post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 "
"artwalk-routed @ sweep-43, 38th sweep since routing, no escalation due — law keys Sev-1); SAT epoch A 246 "
"bbox/230 classified/0 holes + epoch B re-run 246/230/0, ZERO new contacts at the new potter seat (sweep-side "
"corroboration of the city-13 compression: potter+sign+companion+rider moved as one family) | tier-1 4/4 "
"per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 epoch A + epoch B RE-WALKED 64/64 @ 0.38 "
"— new seat 13.8m from nearest core waypoint, inside re-verify band, re-walked not argued; NW 5/5 @ 0.38; NE "
"7/7 @ 0.38 epoch A + epoch B RE-WALKED 7/7 @ 0.38 — new seat 7.7m from NE waypoint 1, inside band; SW 5/5 @ "
"0.37; garden-cottage 51m + tower-house 37.5m stand by construction) + tier-2 60th cycle per committed pointer "
"garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 ALL_PINS_OK 37th consecutive "
"(struct18 real exit 0) + battery 17/17 ALL_PASS on epoch-C bytes (38 lights, 16 comp-bearing census-matched, "
"carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6b bbox PRESENT + companions, belltower "
"2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, "
"beacon 03d278be + beacon-l, hamlet embers 5-of-5, court smoke live, ogeegate tuple+lib exact, angler re-aim "
"lib exact); interlane md5 f6254cd0 stable; ledger law EXACT 2370704 at append; standing gate ALL PASS real "
"exit 0 at tick-start 345f4770 + re-run 4a8258ea post-interleave; zero mutations/uploads/verbs/comp edits/"
"defect notes (D+0, E+0) |\\n")

prose = ("\\nsweep-82: CLEAN SWEEP, epoch-correction tick (city-13 potter compression absorbed). Census "
"epoch A 284==284 fully quiet vs the committed sweep-81 baseline (sha16 b55bd10c9ecdbe5c): 0/0/0 on the "
"canonical 6-field diff. The paced epoch-B re-read caught sibling city-13 in flight executing CITY-PLAN "
"register row 50 (potter 'compress inward'): nx-town-potter moved (26,0,40.5) yaw -2.583 -> (23.776,-0.004,"
"7.725) yaw -1.898 [r25 az18] — 32.85m — with nx-sign-potter-001, nx-town-potter-l, and artwalk rider "
"b3-ruled-porch following their host as one family, all same-lib content-addressed, zero uploads. Two "
"cross-lane laws verified clean sweep-side: (a) motion:pwheel (improve-37's comp) SURVIVED the move — the "
"city lane re-applied it, comp-wipe law honored; (b) the rider's host-local anchor is preserved to <1mm "
"(old local (1.5495,0.3525) -> new (1.5501,0.3509)). Epoch C 20s-paced settled 0/0/0. Per the polish-270 "
"epoch law all affected evidence was re-taken fresh before verdicts: distances RE-DERIVED FROM TOOL FILES "
"(sweep-51 no-guessed-pins law): new seat 7.7m from NE waypoint 1 and 13.8m from the nearest core route "
"end — both inside the re-verify band — so core 64/64 and NE 7/7 were RE-WALKED at epoch B (both ALL_PASS "
"@ 0.38, real exit 0), SAT re-run (246/230/0, same single unclassified R-121), battery re-run on epoch-C "
"bytes 17/17 ALL_PASS. Garden-cottage (51m) and tower-house (37.5m) tier-2 walks stand by construction. "
"Vacated-tool class POSITIVE: interior-walk-potter.ts remains pinned to the old seat (26,40.5) with city-13's "
"commit still pending at this tick — sweep-77 class, a watch item expecting the owning lane's same-commit "
"re-pin (city-10 precedent); NOT a finding while the arc is in flight. Overlap: exit 3 on ONLY R-121 lamp-n|"
"nx-town-mapboard -0.407, known Sev 2 routed artwalk b26 @ sweep-43, 38th sweep since routing, no escalation "
"due (law keys severity-1); ZERO new contacts at the new seat — the moved family's SAT surface is clean "
"(sweep-side corroboration of city-13's own preflight). Tier-1 81/81 ALL_PASS every leg real exit 0. Tier-2 "
"60th cycle per the committed corrected-chain pointer: garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.3765. "
"Integrity: pins 15/15 ALL_PINS_OK (37th consecutive, struct18 real exit 0) + battery 17/17. Interlane md5 "
"f6254cd0 stable. Ledger law EXACT 2370704 at append. Snapshot rewritten like-for-like with pre-write "
"assertion: 114076B / 284 entities / sha16 c8d3817982a7a9bb, post-rewrite drift ZERO. Standing gate ALL PASS "
"real exit 0 at tick-start 345f4770, re-run at 4a8258ea post-interleave. Zero world mutations, zero defect "
"notes, zero uploads, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-83): "
"stable + observatory circuit (61st cycle — LRU by corrected chain: @82 garden-cottage/tower-house, @81 "
"hall/forge, @80 bunkhouse/longhouse, @79 row-cottage/observatory-at-old-seat + re-pinned skene, @78 "
"potter-vacated/market; stable last walked sweep-69, observatory at its city-9 SW seat sweep-79 — stable is "
"the stalest standing target, observatory rides along as its circuit partner per the sweep-79 re-pin).\\n")

out = s.rstrip('\\n') + '\n' + row.strip('\\n') + '\n' + prose
open(PATH, 'w').write(out)

# verify
v = open(PATH).read()
assert v.count('| sweep-82 |') == 1
assert v.count('sweep-82: CLEAN SWEEP') == 1
assert 'Next tier-2 pair (sweep-83): stable + observatory' in v
print('plan updated: +row +prose, byte', len(out))
