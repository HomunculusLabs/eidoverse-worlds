#!/usr/bin/env python3
"""sweep-111 plan edit: append prose block after the sweep-110 block, with unique-anchor assert.
Steady-state tick: 301==301 0/0/0 both epochs, no snapshot rewrite."""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

anchor = 'Next tier-2 pair (sweep-111): row-cottage + market (89th cycle'
assert s.count(anchor) == 1, ('anchor count', s.count(anchor))

block = '''

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
'''
assert s.count('sweep-111: CLEAN SWEEP') == 0, 'block already present'
new = s.rstrip('\n') + '\n' + block
# guard: insert exactly once, size grows by ~block only
assert len(new) - len(s) < 3000 and len(new) - len(s) > 1200, ('size delta', len(new)-len(s))
open(P, 'w').write(new)
t = open(P).read()
assert t.count('sweep-111: CLEAN SWEEP') == 1
assert t.count('Next tier-2 pair (sweep-112): hall + bunkhouse') == 1
print('PLAN EDIT OK: sweep-111 block appended, delta', len(new)-len(s), 'bytes; sweep-112 pointer set')
