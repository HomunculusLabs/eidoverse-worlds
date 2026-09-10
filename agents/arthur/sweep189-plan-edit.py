#!/usr/bin/env python3
"""sweep-189 plan edit: append history-table row + prose block, asserted anchors."""
import re

PLAN = 'agents/arthur/SWEEP-PLAN.md'
ROW = ('|| sweep-189 | 2026-09-09 | 322==322 (284 thing + 38 light; 0 arrivals, '
       '0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift vs baseline '
       'ca2a1883de2def3d — curl-class fetches byte-identical 95267B sha16 '
       '551d9f029269a6b4 at BOTH 20s-paced epochs, so quiet holds for ALL fields '
       'incl comp/compKeys by byte identity; baseline current, no rewrite) | '
       'exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 '
       'artwalk-routed @ sweep-43, 145th sweep since routing, no escalation due '
       '— law keys Sev 1); 284 bbox non-light / 236 classified / 0 coverage holes '
       '| tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 '
       '@ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 167th cycle '
       'stable 5/5 @ 0.3958 + market 6/6 @ 0.3894 ALL PASS | pins 15/15 '
       'ALL_PINS_OK (143rd consecutive clean), sweep89-battery 28/28 ALL PASS on '
       'fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT '
       '2370772 at append, standing gate ALL PASS real exit 0 at bd35f9b0 + '
       're-run ALL PASS real exit 0 at c2b52942 after two mid-tick survey observer '
       'holds (zero world mutations, census-corroborated byte-identical epoch) | '
       'CLEAN SWEEP — R-121 open, known, no escalation due |')

PROSE = '''
sweep-189: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite.
Census 322==322 BOTH epochs (A/B 20s-paced, curl-class fetches
BYTE-IDENTICAL 95267B sha16 551d9f029269a6b4 — byte-identical to the
sweep-183 baseline-generating bytes, so quiet holds for ALL fields incl
comp/compKeys by byte identity, not just the diff tool's 6-field
projection): 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0
compKeys drift (284 thing + 38 light). Baseline ca2a1883de2def3d
current, no rewrite (no-churn precedent). Overlap: SAT fresh-live 284
bbox non-light / 236 classified / 0 coverage holes, real exit 3
un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
145th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually,
per-leg ok + dist/distance parsed from results[] per tool schema.
Tier-2 167th cycle per the committed sweep-188 pointer: stable 5/5 @
0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (143rd consecutive clean);
sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base
2370772 re-read fresh immediately before append, D+0/E+0, tool
self-verifies law() pre and post append. Standing gate ALL PASS real
exit 0 at tick-start bd35f9b0 run 1; HEAD advanced twice mid-tick
(survey-197 @ 0fb1d8dd, survey-198 @ c2b52942 — observer holds, zero
world mutations, zero SWEEP paths, census-corroborated by my own
byte-identical epoch B); epoch law honored, gate RE-RUN ALL PASS real
exit 0 at c2b52942 before the ledger append. Diff tool folded:
sweep189-census-diff.py authored fresh from the committed sweep188
chassis verbatim (path+docstring swap only). Zero probe self-catches
this tick. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-190): row-cottage + observatory circuit (168th cycle — LRU
chain: @189 stable/market, @188 hall/bunkhouse, @187 inn/tower-house,
@185 row-cottage/observatory stalest standing pair at 4 sweeps; both
walk tools verified present on disk this tick:
interior-walk-row-cottage.ts, next-walk-observatory.ts).
'''

src = open(PLAN).read()
assert src.count('\nsweep-188: CLEAN SWEEP') == 1, 'anchor 1 not unique'
anchor1 = '\nsweep-188: CLEAN SWEEP'
# find end of sweep-188 prose block: next blank-line-terminated paragraph after it
i = src.index(anchor1)
# prose block runs to the end of file (it is the last block) — verify
tail = src[i:]
assert 'Next tier-2 pair' in tail and tail.rstrip().endswith(
    'interior-walk-stable.ts, interior-walk-market.ts).'), \
    'sweep-188 block is not the file tail'

out = src.rstrip('\n') + '\n\n' + ROW + '\n' + PROSE
open(PLAN, 'w').write(out)
new = open(PLAN).read()
assert new.count('sweep-189 | 2026-09-09') == 1
assert new.count('\nsweep-189: CLEAN SWEEP') == 1
assert new.count('\nsweep-188: CLEAN SWEEP') == 1
print('plan edit ok:', len(src), '->', len(new), 'bytes')
