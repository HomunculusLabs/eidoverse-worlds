#!/usr/bin/env python3
"""sweep-112 plan edit: append prose block after the sweep-111 block, with unique-anchor assert.
Steady-state tick: 301==301 0/0/0 both epochs, no snapshot rewrite."""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

anchor = 'tier-2 pair (sweep-112): hall + bunkhouse (90th cycle'
assert s.count(anchor) == 1, ('anchor count', s.count(anchor))

block = '''

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
'''
assert s.count('sweep-112: CLEAN SWEEP') == 0, 'block already present'
new = s.rstrip('\n') + '\n' + block
assert len(new) - len(s) < 3000 and len(new) - len(s) > 1200, ('size delta', len(new) - len(s))
open(P, 'w').write(new)
t = open(P).read()
assert t.count('sweep-112: CLEAN SWEEP') == 1
assert t.count('pair (sweep-113):') == 1  # pointer inserted once (line-wrapped after colon)
print('PLAN_EDIT_OK delta=%d' % (len(new) - len(s)))
