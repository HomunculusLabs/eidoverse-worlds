#!/usr/bin/env python3
"""sweep-195 plan edit: insert history table row + append narrative block.
Unique-anchor asserts gate the write (plan-ledger chassis law)."""
import re, sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = 'epochs B and C) | CLEAN SWEEP — R-121 open, known, no escalation due |'
NARR_START = 'Next tier-2 pair (sweep-195):'
NARR_END = 'interior-walk-bunkhouse.ts).'

assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count(NARR_START) == 1, f'narrative start not unique: {s.count(NARR_START)}'
assert 'sweep-195:' not in s, 'sweep-195 already recorded'

row = ('\n|||| sweep-195 | 2026-09-10 | 323==323 fully quiet, all THREE epochs '
'(285 thing + 38 light; A/B/C 20s-paced curl-class fetches BYTE-IDENTICAL 95533B '
'sha16 e7ea4e99bc2b2add — byte-identical to the sweep-193 baseline-generating '
'live bytes, quiet holds for ALL fields incl comp/compKeys by byte identity; '
'0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift; '
'baseline fd2ff862683314c3 current, no rewrite — no-churn precedent) | exit 3 '
'on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed '
'@ sweep-43, 151st sweep since routing, no escalation due — law keys Sev 1); '
'285 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg '
'verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, '
'NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 173rd cycle hall 8/8 @ 0.3600 + '
'bunkhouse 6/6 @ 0.3803 ALL PASS | pins 15/15 ALL_PINS_OK (149th consecutive '
'clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 '
'f6254cd0 stable, ledger law EXACT 2370773 at append, standing gate ALL PASS '
'real exit 0 at tick-start 0a6f0469 run 1 + RE-RUN ALL PASS real exit 0 at '
'4808fe77 after THREE mid-tick HEAD advances (survey-217 @ b44c94c6, '
'survey-218 @ 71448b57 observer holds zero world mutations, struct-138 @ '
'4808fe77 build-deferred zero mutation — all census-corroborated by my own '
'byte-identical epoch C) | CLEAN SWEEP — R-121 open, known, no escalation due |')

narr = ('\n\nsweep-195: CLEAN SWEEP fully quiet steady-state tick — census '
'323==323 all three epochs (A/B/C 20s-paced, curl-class fetches '
'BYTE-IDENTICAL 95533B sha16 e7ea4e99bc2b2add): 0 arrivals, 0 departures, '
'0 field diffs, 0 lib flips, 0 compKeys drift (285 thing + 38 light). '
'Baseline fd2ff862683314c3 current, no rewrite (no-churn precedent). '
'Overlap: SAT fresh-live 285 bbox non-light / 236 classified / 0 coverage '
'holes, real exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n | '
'nx-town-mapboard −0.407 — known Sev 2 routed artwalk b26 choreography '
'@ sweep-43, 151st sweep since routing, NOT new, no escalation due (law '
'keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, '
'every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), '
'NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 '
'(ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 '
'173rd cycle per the committed sweep-194 pointer: hall 8/8 @ 0.3600 '
'(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 '
'(interior-walk-bunkhouse.ts), both ALL_PASS real exit 0. Integrity: '
'struct18-fleet-pin-check 15/15 ALL_PINS_OK (149th consecutive clean); '
'sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes; interlane '
'md5 f6254cd0 stable, read fresh; ledger law EXACT — base 2370773 re-read '
'fresh immediately before append, D+0/E+0, tool self-verifies law() pre '
'and post append. Standing gate ALL PASS real exit 0 at tick-start '
'0a6f0469 run 1; HEAD advanced THREE times mid-tick (survey-217 @ '
'b44c94c6, survey-218 @ 71448b57 — observer holds; struct-138 @ 4808fe77 '
'— enneper refine build-deferred tick, zero world mutation; none touch '
'SWEEP paths, all census-corroborated by my own byte-identical epoch C); '
'epoch law honored, gate RE-RUN ALL PASS real exit 0 at 4808fe77 before '
'the ledger append. Diff tool folded: sweep195-census-diff.py authored '
'fresh from the committed sweep194 chassis verbatim (path+docstring swap '
'only, swap asserted). Probe self-catches this tick, all pre-verdict, '
'disclosed: (a) pins verdict first read through a tail pipe — exit code '
'laundered (pipe-laundering class), re-run un-piped to file for '
'PINS_TRUE_EXIT=0 before any verdict; (b) core walk JSON parse hit '
'banner-prefixed stdout — physics support-seam lines precede the JSON '
'(sweep-35 class), re-derived via first-brace slice; (c) interior-walk '
'tier-2 tools emit results[]+maxArrival, not legs (tier-1 chassis) — '
'first parse KeyError\'d, schema read from actual output and counts '
'verified against standing ledger history (hall 8/8 records) before '
'claiming. Zero world mutations, zero defect notes, zero uploads, zero '
'verbs, zero comp edits, zero shared-budget use. Next tier-2 pair '
'(sweep-196): stable + market (174th cycle — LRU chain re-derived from '
'ledger tier-2 fragments this tick: hall / bunkhouse @195, inn / '
'tower-house @194, row-cottage / observatory @193, longhouse / '
'garden-cottage @192, forge / potter @191, stable / market @189 stalest '
'standing pair at 6 sweeps; both walk tools verified present on disk '
'this tick: interior-walk-stable.ts, interior-walk-market.ts).')

i = s.index(ROW_ANCHOR) + len(ROW_ANCHOR)
s2 = s[:i] + row + s[i:]
j = s2.index(NARR_END, s2.index(NARR_START)) + len(NARR_END)
s2 = s2[:j] + narr + s2[j:]

open(P, 'w').write(s2)
# post-write verification
v = open(P).read()
assert v.count('|||| sweep-195 |') == 1
assert v.count('sweep-195: CLEAN SWEEP') == 1
delta = len(v) - len(s)
assert 0 < delta < 8000, f'plan grew {delta}B — per-tick cap law'
print(f'plan edit OK: +{delta}B, sweep-195 row+narrative present')
