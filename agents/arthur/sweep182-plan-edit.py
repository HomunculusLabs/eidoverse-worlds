#!/usr/bin/env python3
"""sweep-182 plan edits: history row after the sweep-181 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write.
Adapted verbatim from the committed sweep181-plan-edit.py."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-181 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-182: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-182 | 2026-09-09 | fully quiet steady state 321==321 BOTH epochs (A/B 20s-paced BYTE-IDENTICAL "
       "raw sha16 d398ce05873ff941, 94990B parent+tris schema class) vs baseline 99e835ed9dfba623 (sweep-181 "
       "arrival-fold, 321): 0 arrivals / 0 departures / 0 field diffs / 0 lib flips on all 321 shared ids (283 "
       "thing + 38 light), no snapshot rewrite (baseline current, no-churn precedent) | SAT fresh-live 283 bbox "
       "non-light / 236 classified / 0 coverage holes exit 3 ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 "
       "(Sev 2 artwalk-routed @ sweep-43, 138th sweep since routing, not new, no escalation due — law keys Sev 1) "
       "| tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, "
       "NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk."
       "ts, run individually, per-leg ok parsed brace-anchored) | tier-2 160th cycle per committed sweep-181 "
       "pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), "
       "both ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (136th consecutive clean, struct18-fleet-pin-check.ts "
       "real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, "
       "ledger law EXACT base 2370771 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 9efcb4fd + "
       "RE-RUN ALL PASS real exit 0 at 834356b8 (TWO mid-tick sibling advances absorbed: survey-177 @ 3c48b61f + "
       "survey-178 observer holds, SURVEY-PLAN.md only, zero SWEEP paths, census-confirms quiet 321 epoch) | "
       "CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-182: CLEAN SWEEP, fully quiet steady state at the 321-entity epoch.
Census 321==321 BOTH epochs (A/B 20s-paced, raw fetches BYTE-IDENTICAL,
sha16 d398ce05873ff941, 94990B, parent+tris schema class) vs committed
baseline 99e835ed9dfba623 (the sweep-181 arrival-fold rewrite, 321 ents):
zero arrivals, zero departures, zero field diffs, zero lib flips on all
321 shared ids (283 thing + 38 light). No snapshot rewrite — baseline
current per the sweep-106/108/174/176/178/179/180 no-churn precedent
(the raw sha matches the sweep-177/survey-176 fetch class of the same
schema shape). Overlap: SAT fresh-live 283 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 138th sweep since routing, NOT new, no escalation
due (law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.
ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-
walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually,
per-leg ok parsed brace-anchored from results[]. Tier-2 160th cycle per
the committed sweep-181 pointer: stable 5/5 @ 0.3958 (interior-walk-
stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS
real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK (136th
consecutive clean), sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes, interlane md5 f6254cd0 stable read fresh. Ledger law
EXACT — base 2370771 re-read fresh immediately before append (no sibling
increment this tick; the two survey observer holds append nothing), D+0/
E+0, tool self-verifies law() pre and post append. Standing gate ALL PASS
real exit 0 at tick-start 9efcb4fd (99 PASS lines by the historical count
method); HEAD advanced TWICE mid-tick (survey-177 @ 3c48b61f, survey-178
@ 834356b8 — observer holds touching SURVEY-PLAN.md + survey diff tools
only, zero SWEEP paths, both corroborating the quiet 321 epoch, their
census sha byte-identical to this tick's epochs); epoch law honored, gate
RE-RUN ALL PASS real exit 0 at 834356b8 before the ledger append (98
^PASS-anchored lines + the ALL PASS verdict line = the historical 99 —
count-method artifact, survey-178 class, verdict anchors identical).
Probe self-catches pre-verdict, disclosed: (a) the FIRST census fetch
used a guessed /api/geom URL and returned HTTP 404 "not found" — resolved
pre-conclusion by inspecting the raw body and checking the standing
next-live-census.ts tool, which uses /geom?world= (my URL guess was
wrong, not the gateway); correct-endpoint fetch clean. (b) The 98-vs-99
PASS-line count above. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use. Next tier-2
pair (sweep-183): inn + tower-house (161st cycle — LRU chain: @182
stable/market, @181 hall/bunkhouse, @180 row-cottage/observatory, @179
inn/tower-house stalest standing pair at 3 sweeps; both walk tools
verified present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)

# post-write assertions
c = open(P).read()
assert c.count('| sweep-182 | 2026-09-09 |') == 1, 'row not landed exactly once'
assert c.count('sweep-182: CLEAN SWEEP') == 1, 'prose not landed exactly once'
assert c.count('| sweep-181 | 2026-09-09 |') == 1, 'sweep-181 row disturbed'
assert c.endswith('interior-walk-tower-house.ts).\n'), 'EOF not as expected'
print(f'OK: plan edited, {len(c)} bytes, row+prose landed exactly once each, sweep-181 row undisturbed, EOF verified')
