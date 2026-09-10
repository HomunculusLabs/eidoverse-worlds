#!/usr/bin/env python3
"""sweep-192 plan edit: append history-table row + prose block, asserted anchors."""
import re

PLAN = 'agents/arthur/SWEEP-PLAN.md'
ROW = ('|| sweep-192 | 2026-09-10 | 322==322 (284 thing + 38 light; 0 arrivals, '
       '0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift vs baseline '
       'ca2a1883de2def3d — curl-class fetches byte-identical 95267B sha16 '
       '551d9f029269a6b4 at BOTH 20s-paced epochs, quiet holds for ALL fields '
       'incl comp/compKeys by byte identity; baseline current, no rewrite) | '
       'exit 3 on ONLY known R-121 lamp-n\\\\|nx-town-mapboard −0.407 (Sev 2 '
       'artwalk-routed @ sweep-43, 148th sweep since routing, no escalation due '
       '— law keys Sev 1); 284 bbox non-light / 236 classified / 0 coverage holes '
       '| tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 '
       '@ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 170th cycle '
       'longhouse 6/6 @ 0.3456 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 '
       'ALL_PINS_OK (146th consecutive clean), sweep89-battery 28/28 ALL PASS on '
       'fresh census-A bytes, interlane md5 f6254cd0 stable, ledger law EXACT '
       '2370772 at append, standing gate ALL PASS real exit 0 at tick-start '
       'bdf90d9a run 1 (gate HEAD-check line disclosed struct-136 @ '
       'cef637a2 prefix-gate-accepted build+judge tick, zero mutations) + '
       're-run ALL PASS real exit 0 at 57b10ebb after three mid-tick HEAD '
       'advances (survey-209 @ 0a1a40bb, survey-210 @ 57b10ebb observer holds; '
       'struct-136 zero mutations — all census-corroborated byte-identical '
       'epoch B) | CLEAN SWEEP — R-121 open, known, no escalation due |')

PROSE = '''
sweep-192: CLEAN SWEEP, fully quiet steady state, no snapshot rewrite.
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
148th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 170th cycle per the
committed sweep-191 pointer: longhouse 6/6 @ 0.3456
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0.
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (146th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base 2370772 re-read fresh immediately before append, D+0/E+0,
tool self-verifies law() pre and post append. Standing gate ALL PASS
real exit 0 at tick-start bdf90d9a run 1 (the gate's own HEAD-check
line disclosed struct-136 @ cef637a2 — prefix-gate-accepted build+judge
tick, zero mutations per its own entry); HEAD advanced three times
mid-tick (survey-209 @ 0a1a40bb, survey-210 @ 57b10ebb — observer
holds, zero world mutations, zero SWEEP paths, census-corroborated by
my own byte-identical epoch B); epoch law honored, gate RE-RUN ALL
PASS real exit 0 at 57b10ebb before the ledger append. Diff tool
folded: sweep192-census-diff.py authored fresh from the committed
sweep191 chassis verbatim (path+docstring swap only). Probe
self-catches this tick, all pre-verdict: (a) guessed battery tool
extension sweep89-battery.ts where the true tool is sweep89-battery.py
(found by ls, corrected before use — sweep-51 guessed-tool class);
(b) next-live-census.ts argv order — argv[2] is WORLD, output path is
not an argv (curl-class fetch used per committed chassis, world arg
self-caught from the 404-class error shape before any
misclassification — sweep-207 URL class); (c) NW walk first parse hit
banner-prefixed stdout — re-derived via first-brace slice (sweep-35
physics-banner class). Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use. Next
tier-2 pair (sweep-193): row-cottage + observatory circuit (171st
cycle — LRU chain re-derived from ledger tier-2 fragments this tick:
longhouse / garden-cottage @192, forge / potter @191, row-cottage /
observatory @190, inn / tower-house @187, hall / bunkhouse @188,
stable / market @189 — row-cottage/observatory stalest standing pair
at 2 sweeps; both walk tools verified present on disk this tick:
interior-walk-row-cottage.ts, struct2-walk-observatory.ts).
'''

src = open(PLAN).read()
assert src.count('\nsweep-191: CLEAN SWEEP') == 1, 'anchor 1 not unique'
anchor1 = '\nsweep-191: CLEAN SWEEP'
i = src.index(anchor1)
tail = src[i:]
assert 'Next tier-2 pair' in tail and tail.rstrip().endswith(
    'interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).'), \
    'sweep-191 block is not the file tail'

out = src.rstrip('\n') + '\n\n' + ROW + '\n' + PROSE
open(PLAN, 'w').write(out)
new = open(PLAN).read()
assert new.count('sweep-192 | 2026-09-10') == 1
assert new.count('\nsweep-192: CLEAN SWEEP') == 1
assert new.count('\nsweep-191: CLEAN SWEEP') == 1
print('plan edit ok:', len(src), '->', len(new), 'bytes')
