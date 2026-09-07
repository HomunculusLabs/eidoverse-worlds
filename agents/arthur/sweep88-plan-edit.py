#!/usr/bin/env python3
"""sweep-88 plan edits: history table row after sweep-87 row + narrative block at EOF + LRU pointer."""
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

row = ("| sweep-88 | 2026-09-07 | 287→288 epoch-corrected (epoch A fully quiet vs committed sweep-87 baseline sha16 96d232cbedbe6742: 287==287, 0 arrivals, 0 departures, 0 drift; epoch B caught sibling dress-107 live: exactly ONE arrival nx-dress-se-foxden-001 (73,-0.0532,-10.5) yaw 4.712389 lib 856deec51857c60a, tuple ledger-matched line-for-line @ a93d4929; epoch C settled 288==288 — same-epoch foxden triple-observation sweep/city/dress; 0 departures, 0 unexplained drift; snapshot rewritten 115902B/288 ents/sha16 1fd915521b41d059 with pre-write assertion diff exactly the 1 arrival, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 44th sweep since routing, no escalation due — law keys Sev-1); epoch-B SAT re-run 250 bbox non-light / 231 classified / 0 coverage holes, ZERO new contacts at the fox den seat (corroborates dress-107's own minSAT +7.79) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; epoch-A walks stand by construction — fox den r73.8 sits 55m+ beyond the SW route end; SAT re-run covers the collision surface) + tier-2 66th cycle per committed pointer inn 6/6 @ 0.364 + stable 5/5 @ 0.396 ALL PASS | pins 15/15 ALL_PINS_OK 42nd consecutive (struct18 real exit 0) + battery 23/23 ALL PASS on freshest epoch-B bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, angler 6ee5b4b06bc07d5e, hamlet embers 5-of-5, court smoke, 38 lights, 17 comp-bearing); interlane f6254cd0 stable; ledger law canonical EXACT 2370711 at append; gate ALL PASS real exit 0 at tick-start 10a0150c + re-run 87545f55 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

anchor = "| sweep-87 | 2026-09-07 | 287==287 triple-quiet steady"
assert s.count(anchor) == 1, 'row anchor not unique'
# find end of the sweep-87 row line
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + row + s[j:]

narr = """
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
"""

s = s.rstrip('\n') + '\n' + narr
open(P, 'w').write(s)
print('plan edits applied; rows now:', len(re.findall(r'^\| sweep-\d+ \|', s, re.M)))
print('narrative blocks:', len(re.findall(r'^sweep-\d+: ', s, re.M)))
