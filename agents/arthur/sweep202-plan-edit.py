#!/usr/bin/env python3
"""sweep-202 plan edit: append narrative block after the sweep-201 block (EOF,
narrative-only convention since sweep-199). Unique-anchor asserts gate the
write (plan-ledger chassis law); post-write verification gates the commit."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

# sweep-201's narrative block terminates the file (verified this tick by
# read_file: lines 7727-7776). Append-to-EOF chassis: no mid-file insert, so
# the anchor law here = unique sweep-201 block + EOF-shape proof.
BLOCK = 'sweep-201: CLEAN SWEEP'
EOF_LINE = 'interior-walk-hall.ts, interior-walk-bunkhouse.ts).'
assert s.count(BLOCK) == 1, f'sweep-201 block not unique: {s.count(BLOCK)}'
assert s.rstrip('\n').endswith(EOF_LINE), 'file does not end on sweep-201 pointer — re-derive'
assert 'sweep-202:' not in s, 'sweep-202 already recorded'

narr = '''

sweep-202: CLEAN SWEEP fully quiet steady-state tick, no snapshot rewrite.
Census 323==323 at BOTH epochs (A/B 20s-paced, next-live-census.ts chassis)
BYTE-IDENTICAL 214035B sha16 ed5856e6ef4abd37 — byte-identical to the
survey-231..235 / sweep-200/201 certified post-enneper baseline
representation, so quiet holds for ALL fields the projection carries incl
comp/compKeys by byte identity: 0 arrivals, 0 departures, 0 field diffs,
0 lib flips, 0 compKeys drift (285 thing + 38 light). Projection-quiet
only this tick (no second raw-representation fetch; byte-identity to the
baseline representation carries, sweep-198 precedent). Baseline
29f0c652df402f01 current, no rewrite (no-churn precedent — field-equal to
live on every compared field). Overlap: SAT fresh-live 285 bbox non-light /
236 classified / 0 coverage holes, real exit 3 un-piped on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 158th sweep since routing, NOT new,
no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
180th cycle per the committed sweep-201 pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts),
both ALL_PASS real exit 0 — both match the sweep-195/200 records for the
pair. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (156th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A
bytes; interlane md5 f6254cd0 stable, read fresh; ledger law EXACT base
re-read fresh immediately before append, D+0/E+0, tool self-verifies law()
pre and post append. Standing gate ALL PASS real exit 0 at tick-start
88c80493 run 1 (own sweep-201 tip); HEAD advanced once mid-tick (survey-237
@ 111418f4 — observer hold, zero world mutations per its own entry,
census-corroborated by my own byte-identical epochs AND its own
ed5856e6 capture); epoch law honored, gate RE-RUN ALL PASS real exit 0 at
111418f4 before the ledger append. Diff
tool sweep202-census-diff.py authored fresh from the committed sweep201
chassis verbatim (sed swap only, asserted: 3 refs forward, 1 stale ref =
the docstring chassis-provenance line naming sweep201, accurate as
provenance, 0 functional stale refs). Probe self-catches this tick, all
pre-verdict, disclosed: (a) first core-walk field grep matched nothing —
keys quoted differently in output; re-parsed via regex brace-block slice and
read the actual schema before any verdict (sweep-195 class); (b) approach
walk per-leg dist max printed 0 — those tools report suite-level
maxArrival, not per-leg dist; re-keyed on the suite field. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use. Next tier-2 pair (sweep-203): stable + market
(181st cycle — LRU chain re-derived from ledger tier-2 fragments this
tick: hall / bunkhouse @202, forge / potter @201, inn / tower-house @200,
row-cottage / observatory @199, longhouse / garden-cottage @198, stable /
market @196 stalest standing pair at 6 sweeps; both walk tools verified
present on disk this tick: interior-walk-stable.ts,
interior-walk-market.ts).'''

open(P, 'a').write(narr)

v = open(P).read()
assert v.count('sweep-202: CLEAN SWEEP') == 1
assert v.rstrip('\n').endswith('interior-walk-market.ts).')
delta = len(v) - len(s)
assert 0 < delta < 8000, f'plan grew {delta}B — per-tick cap law'
assert v.count(BLOCK) == 1, 'sweep-201 block duplicated by append'
print(f'plan edit OK: +{delta}B, sweep-202 narrative present at EOF')
