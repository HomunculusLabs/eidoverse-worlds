#!/usr/bin/env python3
"""sweep-90 plan edits: history table row after sweep-89 row + narrative block at EOF + LRU pointer."""
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

row = ("| sweep-90 | 2026-09-07 | 289==289 fully steady (epoch A 0 arrivals 0 departures 0 drift vs committed sweep-89 baseline sha16 78f5317f2a47cf22; epoch B 20s-paced re-read also 0/0/0 — no sibling mutation landed live between epochs; HEAD advanced d03267d9→a33ca44d mid-tick = city-43/44/45 zero-mutation holds, consistent; no snapshot rewrite needed, sweep-87 byte-equivalent precedent, baseline stays 116306B/289/78f5317f2a47cf22) | exit 3 on ONLY known R-121 lamp-n\\\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 46th sweep since routing, no escalation due — law keys Sev-1); 251 bbox non-light / 231 classified / 0 coverage holes, SAT run on epoch-A bytes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 68th cycle per committed pointer bunkhouse 6/6 @ 0.380 (interior-walk-bunkhouse.ts, known foreign support-seam abstentions normalized set unchanged) + longhouse 6/6 @ 0.346 (interior-walk-longhouse.ts), both real exit 0 | pins 15/15 ALL_PINS_OK 44th consecutive (struct18 real exit 0) + battery 28/28 ALL PASS on epoch-A bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, angler 6ee5b4b06bc07d5e, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing, rotor pins exact); interlane f6254cd0 stable; ledger law canonical EXACT at append; gate ALL PASS real exit 0 at tick-start d03267d9 + re-run a33ca44d post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

anchor = "| sweep-89 | 2026-09-07 | 288→289 epoch-corrected"
assert s.count(anchor) == 1, 'row anchor not unique'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + row + s[j:]

narr = """
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
"""

s = s.rstrip('\n') + '\n' + narr
open(P, 'w').write(s)
print('plan edits applied; rows now:', len(re.findall(r'^\| sweep-\d+ \|', s, re.M)))
print('narrative blocks:', len(re.findall(r'^sweep-\d+: ', s, re.M)))
