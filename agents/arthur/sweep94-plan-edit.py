#!/usr/bin/env python3
"""sweep-94 plan edits: history table row after the sweep-93 table row + narrative at EOF.
Anchor verified fresh from the file (pitfall 6 law): the sweep-93 row prefix read
from disk at tick time, not from memory or the sweep-93 edit script."""
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

row = ("| sweep-94 | 2026-09-07 | 291==291 fully steady (epochs A+B+C byte-identical raw sha16 db46c2d661910cc7, A-B 21s-paced, C post-interleave; 0 arrivals, 0 departures, 0 drift on canonical 7-field diff vs committed sweep-91 baseline ba9884a8e1e91683; mid-tick HEAD advances city-59/62 + dress-118 all zero-mutation holds, census-confirmed quiet; no snapshot rewrite needed, sweep-92/93 precedent) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 50th sweep since routing, no escalation due — law keys Sev-1); 253 bbox non-light / 231 classified / 0 coverage holes, SAT own fresh live fetch | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; SW support-seam abstentions on foreign temple-labyrinth/skeps/dress entities = known normalized set, unchanged) + tier-2 72nd cycle per committed pointer stable 5/5 @ 0.396 + observatory circuit 5/5 both real exit 0 | pins 15/15 ALL_PINS_OK (48th consecutive, struct18-fleet-pin-check real exit 0) + battery 28/28 on epoch-A bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be + -l, angler 6ee5b4b0, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing); interlane md5 f6254cd0 stable; ledger law 2370723 EXACT (gate canonical check, all runs); standing gate ALL PASS real exit 0 at tick-start 30d5c4c7 + re-run aff92396 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

anchor = "| sweep-93 | 2026-09-07 | 291==291 fully steady (epochs A+B byte-identical raw sha16 db46c2d661910cc7, 21s-paced"
assert s.count(anchor) == 1, 'row anchor not unique: %d' % s.count(anchor)
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + row + s[j:]

narr = """
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
"""
s = s.rstrip('\n') + '\n' + narr

open(P, 'w').write(s)
# verify
s2 = open(P).read()
assert s2.count('| sweep-94 |') == 1, 'row not unique after write'
assert 'sweep-94: CLEAN SWEEP, fully steady tick' in s2
print('PLAN EDIT OK; bytes', len(s2))
