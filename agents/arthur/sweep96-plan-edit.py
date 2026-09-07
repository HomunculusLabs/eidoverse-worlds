#!/usr/bin/env python3
"""sweep-96 plan edit: (1) repair sweep-94 truncated prose (re-attach orphaned
closer tail, lift-77 adjacent-anchor-slide class, disclosed); (2) insert sweep-96
table row after the sweep-95 row; (3) append sweep-96 prose block at tail.
All anchors asserted BEFORE any write; file verified after."""
import sys

PATH = 'agents/arthur/SWEEP-PLAN.md'
t = open(PATH).read()
orig_len = len(t)

# --- (1) repair: orphaned sweep-94 closer sits at EOF (after sweep-95 prose) ---
CUT = 'defect notes, zero uploads, zero verbs, zero comp edits, zero'
ORPHAN_START = 'shared-budget use (D+0, E+0). Next tier-2 pair (sweep-95): hall +'
assert t.count(ORPHAN_START) == 1, f'orphan count {t.count(ORPHAN_START)} != 1'
cut_positions = []
start = 0
while True:
    i = t.find(CUT, start)
    if i < 0:
        break
    cut_positions.append(i)
    start = i + 1
assert len(cut_positions) == 3, cut_positions
i_cut = cut_positions[-1]  # the sweep-94 block's truncated tail (line 3152)
assert t[i_cut + len(CUT):i_cut + len(CUT) + 40].startswith('\n\nsweep-95: CLEAN SWEEP'), \
    repr(t[i_cut + len(CUT):i_cut + 60])

i_orph = t.index(ORPHAN_START)
orphan = t[i_orph:].rstrip('\n')
assert orphan.endswith('interior-walk-forge.ts).'), repr(orphan[-60:])
assert i_orph > i_cut, 'orphan must sit after the cutpoint'

# cut tail at the truncation point, splice the orphan in, keep sweep-95 prose after
head = t[:i_cut + len(CUT)]
mid = t[i_cut + len(CUT):i_orph].rstrip('\n')  # sweep-95 prose block (starts \n\nsweep-95...)
assert mid.startswith('\n\nsweep-95: CLEAN SWEEP'), repr(mid[:60])
t = head + '\n' + orphan + mid.rstrip('\n') + '\n'
i94 = t.index('sweep-94: CLEAN SWEEP')
i95 = t.index('sweep-95: CLEAN SWEEP')
seg = t[i94:i95]
assert seg.rstrip().endswith('interior-walk-forge.ts).'), repr(seg[-60:])
assert t.count(ORPHAN_START) == 1

# --- (2) table row after the sweep-95 row (line-anchored on its unique prefix) ---
ROW95 = '| sweep-95 | 2026-09-07 | 291\u2192292 (epoch A 291==291 fully quiet'
assert t.count(ROW95) == 1, t.count(ROW95)
lines = t.split('\n')
r95 = [n for n, l in enumerate(lines) if l.startswith(ROW95)]
assert len(r95) == 1, r95
ROW = ('|| sweep-96 | 2026-09-07 | 291\u2192292 known-epoch fold-in (committed baseline stale by exactly the '
       'sweep-95 conoidfan arrival; epoch A ONE arrival nx-struct-conoidfan (25.82,-0.0154,48.56) yaw -1.0821 '
       'lib c75f8dfbbe2cf9f6 = struct-88 placement, tuple identical to sweep-95 epoch-B, 0 departures, 0 drift '
       'on 291 shared ids; epochs B/C 292==292 0/0/0 incl. post dress-125/struct-89 interleave; snapshot '
       'rewritten 292 ents/117574B/sha16 7bd3bfd2acbdaa11 pre-write-asserted, post-rewrite drift ZERO) | '
       'exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard \u22120.407 (Sev 2 artwalk-routed @ sweep-43, 52nd '
       'sweep since routing, no escalation due \u2014 law keys Sev 1); 254 bbox non-light / 232 classified / 0 '
       'coverage holes, zero new contacts at conoidfan seat | tier-1 4/4 per-leg verified 81/81 ALL_PASS real '
       'exit 0 each (core 64/64 @ 0.38 banner-stripped parse, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; '
       'stderr support-seam abstentions on foreign dress/temple entities = known class, minor composition '
       'churn +skeps/lanternhook, no lane-owned target) + tier-2 74th cycle per committed pointer bunkhouse '
       '6/6 @ 0.380 + longhouse 6/6 @ 0.346 ALL PASS | pins 15/15 ALL_PINS_OK 50th consecutive + battery '
       '28/28 ALL PASS on epoch-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT 2370727 at append '
       '(sweep-96 D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 01a81eb6 + re-run b241baa8 | '
       'CLEAN SWEEP \u2014 R-121 open, known, no escalation due; plan-repair disclosed (sweep-94 orphaned '
       'closer re-attached) |')
lines.insert(r95[0] + 1, ROW)
t = '\n'.join(lines)

# --- (3) prose block at tail ---
PROSE = '''

sweep-96: CLEAN SWEEP, known-epoch fold-in tick. The committed baseline
was stale by exactly the pre-recorded sweep-95 epoch (conoidfan arrival,
dress-121/city-66 independently observed), so this tick folded it in:
census epoch A 291\u2192292 with exactly ONE arrival nx-struct-conoidfan
(25.82, \u22120.0154, 48.56) yaw \u22121.0821 lib c75f8dfbbe2cf9f6 \u2014
tuple identical to sweep-95's epoch-B record line-for-line (struct-87
authored, struct-88 placed @ f34f8168); 0 departures, 0 drift on all 291
shared ids across the canonical 7-field diff. Paced epoch B (21s) and
epoch C (after the dress-125/struct-89 mid-tick interleaves, both
zero-mutation ticks by their own ledgers) both 292==292 0/0/0. Snapshot
rewritten like-for-like (7-field projection, census order, indent=1):
292 entities / 117574B / sha16 7bd3bfd2acbdaa11, pre-write assertion
(arrivals exactly [conoidfan], 0 departures, 0 drift, count
291\u2192292), post-rewrite drift vs live ZERO. Overlap: SAT on its own
fresh live fetch \u2014 254 bbox non-light / 232 classified / 0 coverage
holes, exit 3 on ONLY the known R-121 lamp-n|nx-town-mapboard \u22120.407
(Sev 2 routed artwalk @ sweep-43, fifty-second sweep since routing, not
new, no escalation due \u2014 the law keys on severity-1); ZERO new
contacts at the conoidfan seat. Walk evidence: conoidfan sits 5.3m from
the NE approach2 polyline and sweep-95's own re-walk stands against
live bytes at identical tuple (0 drift this tick) \u2014 route unaffected
by construction. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0: core 64/64 @ 0.38 (banner-stripped JSON parse, [physics]
prefix self-caught, sweep-93/94 class), NW 5/5 @ 0.38, NE 7/7 @ 0.38,
SW 5/5 @ 0.37; stderr support-seam abstentions = known foreign
diagnostics class with minor composition churn vs the sweep-95
normalized set (+skeps, +lanternhook \u2014 both dress-domain; no
lane-owned target implicated, disclosed per the normalized-set law).
Tier-2 74th cycle per the committed pointer: bunkhouse 6/6 @ 0.380 +
longhouse 6/6 @ 0.346, both real exit 0. Integrity: pins 15/15
ALL_PINS_OK (50th consecutive clean) + battery 28/28 ALL PASS on
epoch-A bytes; interlane md5 f6254cd0 stable; ledger law EXACT 2370727
at append (sweep-96 D+0/E+0). PLAN REPAIR (disclosed): sweep-94's prose
block had been truncated mid-sentence with its closer tail orphaned
after sweep-95's block (adjacent-anchor slide at sweep-95's insertion,
lift-77 class) \u2014 re-attached by asserted unique anchors; sweep-94
and sweep-95 blocks verified whole after repair. Probe self-catches
repaired pre-verdict, disclosed: (a) first core-walk parse keyed raw
JSON without stripping the [physics] banner; (b) two census id probes
used guessed entity names (seats/streamstones ids) \u2014 the canonical
diff is authoritative; (c) one inline command composite hit the parser
blocklist \u2014 executed via its saved script per the sanctioned retry
law, no re-inline; (d) the first draft of this edit script asserted a
non-unique anchor and a later draft introduced row typos (25.92 / long
xhouse) \u2014 both caught by fresh re-reads and corrected before any
write landed. Standing gate ALL PASS real exit 0 at tick-start
01a81eb6 (city-68 hold), re-run ALL PASS real exit 0 at b241baa8
(dress-125 hold) after interleaves. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use (D+0, E+0). Next tier-2 pair (sweep-97): potter + market (75th
cycle \u2014 LRU chain: @96 bunkhouse/longhouse, @95 hall/forge, @94
stable/observatory, @93 row-cottage/inn, @92 garden-cottage/
tower-house, @90 bunkhouse/longhouse, @89 potter/market \u2014 potter
and market last walked sweep-89, now the stalest standing pair; both
walk tools verified present: interior-walk-potter.ts,
interior-walk-market.ts).
'''
t = t.rstrip('\n') + PROSE

open(PATH, 'w').write(t)
new_t = open(PATH).read()
assert new_t.count('sweep-96: CLEAN SWEEP') == 1
assert new_t.count('sweep-95: CLEAN SWEEP') == 1
assert new_t.count('sweep-94: CLEAN SWEEP') == 1
assert new_t.count('shared-budget use (D+0, E+0). Next tier-2 pair (sweep-95): hall +') == 1
assert new_t.count('Next tier-2 pair (sweep-97): potter + market') == 1
i94 = new_t.index('sweep-94: CLEAN SWEEP')
i95 = new_t.index('sweep-95: CLEAN SWEEP')
assert new_t[i94:i95].rstrip().endswith('interior-walk-forge.ts).'), repr(new_t[i94:i95][-60:])
assert '|| sweep-96 | 2026-09-07 |' in new_t
assert 'long xhouse' not in new_t and '25.92,-0.0154' not in new_t
print('PLAN EDIT OK: repair + row + prose; bytes', orig_len, '->', len(new_t))
