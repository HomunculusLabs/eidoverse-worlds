#!/usr/bin/env python3
"""sweep-93 plan edits: history table row after the sweep-91 table row (last verified table row) + narrative at EOF."""
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

row = ("| sweep-93 | 2026-09-07 | 291==291 fully steady (epochs A+B byte-identical raw sha16 db46c2d661910cc7, 21s-paced; 0 arrivals, 0 departures, 0 drift on the canonical 7-field diff vs committed sweep-91 baseline ba9884a8e1e91683; mid-tick HEAD advances city-55/58, dress-112/114/115 all zero-mutation holds, census-confirmed quiet; no snapshot rewrite needed, sweep-92 precedent) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 49th sweep since routing, no escalation due — law keys Sev-1); 253 bbox non-light / 231 classified / 0 coverage holes, SAT own fresh live fetch | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; SW support-seam abstentions on foreign temple-labyrinth/dress entities = known normalized set, unchanged) + tier-2 71st cycle per committed pointer row-cottage 6/6 @ 0.384 + inn 6/6 @ 0.364 both real exit 0 | pins 15/15 ALL_PINS_OK (47th consecutive, struct18-fleet-pin-check real exit 0) + battery 28/28 on epoch-A bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, beacon 03d278be + -l, angler 6ee5b4b0, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing); interlane md5 f6254cd0 stable; ledger law 2370723 EXACT (gate canonical check, all runs); standing gate ALL PASS real exit 0 at 2881cfef tick-start + re-run 86d7f27c + re-run 7ab87a97 | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

anchor = "| sweep-91 | 2026-09-07 | 289→290→291 epoch-corrected (epoch A fully quiet 0/0/0 vs committed sweep-89 baseline"
assert s.count(anchor) == 1, 'row anchor not unique: %d' % s.count(anchor)
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + row + s[j:]

narr = """
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
"""
s = s.rstrip('\n') + '\n' + narr

open(P, 'w').write(s)
# verify
s2 = open(P).read()
assert s2.count('| sweep-93 |') == 1, 'row not unique after write'
assert 'sweep-93: CLEAN SWEEP, fully steady tick' in s2
print('PLAN EDIT OK; bytes', len(s2))
