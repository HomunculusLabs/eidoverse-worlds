#!/usr/bin/env python3
"""sweep-155 plan edits: history row after the sweep-154 row (line starting
'| sweep-154 |'), prose block appended at EOF. Anchored + asserted unique."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-155 | 2026-09-08 | 314==314 fully quiet at BOTH epochs (276 thing + 38 light; 0 arrivals, "
"0 departures, 0 drift on all 314 shared ids across id/pos/yaw/lib/scale/kind/bbox vs committed baseline "
"sha16 44b804c33a856b59; epochs A and B 20s-paced byte-identical raw /geom sha16 58e82babca9e87da = "
"representation epoch #5 stable, byte-identical to sweep-154's epoch-B raw — no flap, no world change; "
"no snapshot rewrite, baseline current | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard \u22120.407 "
"(Sev 2 artwalk-routed @ sweep-43, 111th sweep since routing, no escalation due \u2014 law keys Sev 1); "
"276 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the 314-set, zero new contacts | "
"tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, "
"NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 "
"sw-approach3-walk.ts); tier-2 133rd cycle per committed pointer inn 6/6 @ 0.364 (interior-walk-inn.ts) + "
"tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok:true "
"counts verified | pins 15/15 ALL_PINS_OK (109th consecutive clean), sweep89-battery 28/28 ALL PASS on "
"fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base "
"re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 80edb60a + re-run "
"ALL PASS real exit 0 at 80edb60a post-evidence (HEAD static through the whole tick \u2014 zero sibling "
"commits since struct-116), both from repo ROOT | CLEAN SWEEP \u2014 R-121 open, known, no escalation due |\n")

PROSE = ("""
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
unclassified = R-121 lamp-n | nx-town-mapboard \u22120.407, known Sev 2 routed
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
""")

# 1) history row: after the sweep-154 row (unique anchor = its line start)
lines = s.split('\n')
idx = [i for i, l in enumerate(lines) if l.startswith('| sweep-154 |')]
assert len(idx) == 1, f'sweep-154 row anchor not unique: {idx}'
row_end = idx[0]
while row_end < len(lines) - 1 and not lines[row_end].endswith('|'):
    row_end += 1
assert lines[row_end].endswith('|'), 'row end not found'
lines.insert(row_end + 1, ROW.rstrip('\n'))
s = '\n'.join(lines)

# 2) prose block at EOF
assert s.rstrip().endswith('interior-walk-inn.ts, interior-walk-tower-house.ts).'), \
    'EOF anchor mismatch \u2014 tail changed under us'
s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)

# post-write verification
s2 = open(P).read()
assert s2.count('| sweep-155 |') == 1, 'row not unique post-write'
assert s2.count('sweep-155: CLEAN SWEEP') == 1, 'prose not unique post-write'
assert sum(1 for l in s2.split(chr(10)) if l.startswith("## Findings register")) == 1, "register header consumed"
print('PLAN EDITS OK: row + prose appended, anchors verified, register intact')
