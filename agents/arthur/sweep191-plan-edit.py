#!/usr/bin/env python3
"""sweep-191 plan edit: append history-table row + prose block, asserted anchors."""
import re

PLAN = 'agents/arthur/SWEEP-PLAN.md'
ROW = ('|| sweep-191 | 2026-09-10 | 322==322 (284 thing + 38 light; 0 arrivals, '
       '0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift vs baseline '
       'ca2a1883de2def3d — curl-class fetches byte-identical 95267B sha16 '
       '551d9f029269a6b4 at BOTH 20s-paced epochs, quiet holds for ALL fields '
       'incl comp/compKeys by byte identity; baseline current, no rewrite) | '
       'exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 '
       'artwalk-routed @ sweep-43, 147th sweep since routing, no escalation due '
       '— law keys Sev 1); 284 bbox non-light / 236 classified / 0 coverage holes '
       '| tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 '
       '@ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 169th cycle '
       'forge 6/6 @ 0.38 + potter 6/6 @ 0.37 ALL PASS | pins 15/15 '
       'ALL_PINS_OK (145th consecutive clean), sweep89-battery 28/28 ALL PASS on '
       'fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT '
       '2370772 at append, standing gate ALL PASS real exit 0 at 1b36ddc6 run 1 '
       '(HEAD advance past own sweep-190 tip via survey-206 observer, accepted) + '
       're-run ALL PASS real exit 0 at fbef1cab after one mid-tick survey-207 '
       'observer hold (zero world mutations, census-corroborated byte-identical '
       'epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |')

PROSE = '''
sweep-191: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite.
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
147th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 169th cycle per the
committed sweep-190 pointer: forge 6/6 @ 0.38 (interior-walk-forge.ts)
+ potter 6/6 @ 0.37 (interior-walk-potter.ts), both ALL_PASS real
exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (145th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base 2370772 re-read fresh immediately before append, D+0/E+0,
tool self-verifies law() pre and post append. Standing gate ALL PASS
real exit 0 at tick-start 1b36ddc6 run 1 (sibling survey-206 observer
hold had advanced HEAD past own sweep-190 tip, accepted per epoch law,
zero world mutations); HEAD advanced once mid-tick (survey-207 @
fbef1cab — observer hold, zero world mutations, zero SWEEP paths,
census-corroborated by my own byte-identical epoch B); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at fbef1cab before the
ledger append. Diff tool folded: sweep191-census-diff.py authored
fresh from the committed sweep190 chassis verbatim (path+docstring
swap only). Zero probe self-catches this tick. Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use. Next tier-2 pair (sweep-192): longhouse +
garden-cottage (170th cycle — LRU chain re-derived from ledger tier-2
fragments: forge @191, potter @191, longhouse / garden-cottage @173
stalest standing pair at 18 sweeps, row-cottage / observatory @190,
inn / tower-house @187, hall / bunkhouse @188, stable / market @189;
both walk tools verified present on disk this tick:
interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).
'''

src = open(PLAN).read()
assert src.count('\nsweep-190: CLEAN SWEEP') == 1, 'anchor 1 not unique'
anchor1 = '\nsweep-190: CLEAN SWEEP'
i = src.index(anchor1)
tail = src[i:]
assert 'Next tier-2 pair' in tail and tail.rstrip().endswith(
    'interior-walk-forge.ts, interior-walk-potter.ts).'), \
    'sweep-190 block is not the file tail'

out = src.rstrip('\n') + '\n\n' + ROW + '\n' + PROSE
open(PLAN, 'w').write(out)
new = open(PLAN).read()
assert new.count('sweep-191 | 2026-09-10') == 1
assert new.count('\nsweep-191: CLEAN SWEEP') == 1
assert new.count('\nsweep-190: CLEAN SWEEP') == 1
print('plan edit ok:', len(src), '->', len(new), 'bytes')
