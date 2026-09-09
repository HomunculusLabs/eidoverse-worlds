#!/usr/bin/env python3
"""sweep-183 plan edits: history row after the sweep-182 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write.
Adapted verbatim from the committed sweep182-plan-edit.py."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-182 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-183: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-183 | 2026-09-09 | arrival-fold tick, TWO census generations: epochs A/B 321==321 byte-identical (sha16 "
       "d398ce05873ff941, 94990B) fully quiet, then TWO mid-tick sibling advances absorbed (struct-133 @ 3ae6e9f3 placed "
       "nx-struct-enneper 321->322, survey-180 @ 05241fde observer hold) — epochs C/D re-fetched 322==322 byte-identical "
       "(sha16 551d9f029269a6b4, 95267B): exactly ONE domain-valid arrival nx-struct-enneper [-17.4391,-0.0133,249.3910] "
       "yaw pi lib ba17a712cbc734bd comp {} = struct-133 ledger-exact, 0 departures / 0 field diffs / 0 lib flips on all "
       "321 shared ids; baseline rewritten 322 ents / 214205B / sha16 ca2a1883de2def3d arrival-fold chassis order+set "
       "preserved drift ZERO | SAT fresh-live re-run at 322-set: 284 bbox non-light / 236 classified / 0 coverage holes "
       "exit 3 ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (139th, Sev 2 artwalk-routed @ sweep-43, not new, no "
       "escalation due — law keys Sev 1), enneper adds NO new contacts corroborating struct-133 placer SAT worst gyroid "
       "+4.78 | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, "
       "NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run "
       "individually, per-leg ok parsed brace-anchored); walks stand by construction (enneper r250.0 S az184, 200m+ off "
       "every tier-1 waypoint, sweep-53 precedent) | tier-2 161st cycle per committed sweep-182 pointer inn 6/6 @ 0.3640 "
       "(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real exit 0 | "
       "pins 15/15 ALL_PINS_OK (137th consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 "
       "on fresh census-A bytes AND re-run 28/28 on census-D (322-epoch) bytes, interlane md5 f6254cd0 stable read fresh, "
       "ledger law EXACT base 2370772 D+0/E+0, standing gate ALL PASS real exit 0 tick-start b3e199c9 + RE-RUN ALL PASS "
       "real exit 0 at 3ae6e9f3 after absorbing both advances | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-183: CLEAN SWEEP, arrival-fold tick with two census generations.
Generation 1 (epochs A/B, 20s-paced, byte-identical, sha16
d398ce05873ff941, 94990B): 321==321 vs committed baseline 99e835ed9dfba623
(the sweep-181 arrival-fold rewrite, 321 ents) — fully quiet, zero
arrivals/departures/field diffs/lib flips on all 321 shared ids (283
thing + 38 light). SAT + tier-1 + tier-2 + pins + battery ran clean on
that generation. Then the pre-append ledger re-read caught the running
total at 2370772 (+1 vs gate-time 2370771): TWO mid-tick sibling
advances — struct-133 @ 3ae6e9f3 (THE ENNEPER built+judged+placed one
tick, census 321->322, nx-struct-enneper [-17.4391,-0.0133,249.3910]
yaw pi lib ba17a712cbc734bd, PLACED_VERIFIED per its ledger line) and
survey-180 @ 05241fde (observer hold, SURVEY-PLAN only, corroborating
the quiet epoch). Epoch law honored: epochs C/D re-fetched fresh
(20s-paced, byte-identical, sha16 551d9f029269a6b4, 95267B): 322==322,
exactly ONE arrival — nx-struct-enneper — domain-valid struct-lane
work, tuple ledger-exact line-for-line vs struct-133's committed entry,
empty comp bag, zero departures, zero field diffs, zero lib flips on
all 321 shared ids. 10m S-band cadence holds (gyroid r240 -> enneper
r250). Baseline rewritten via the sweep-181 arrival-fold chassis
(9-field like-for-like projection): 322 ents / 214205B / sha16
ca2a1883de2def3d, pre-write asserts (arrival set exactly
[nx-struct-enneper], 0 departures, 0 lib flips, 0 field drift on the
321 shared ids), post-write drift ZERO, order+set of the prior 321
preserved. Overlap: SAT re-run fresh-live on the 322 set — 284 bbox
non-light / 236 classified / 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, 139th sweep since
routing, NOT new, no escalation due (law keys severity-1). The enneper
introduces NO new contacts, corroborating struct-133's own placer SAT
(worst-solid +4.78 vs gyroid). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts); all four run individually, per-leg ok parsed
brace-anchored from results[]; walks stand by construction (enneper
r250.0 S az184, 200m+ off every tier-1 waypoint, sweep-53 precedent).
Tier-2 161st cycle per the committed sweep-182 pointer: inn 6/6 @
0.3640 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (137th consecutive clean),
sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes AND
re-run 28/28 on census-D (322-epoch) bytes so the folded arrival is
covered, interlane md5 f6254cd0 stable read fresh. Ledger law EXACT —
base 2370772 re-read fresh immediately before append, D+0/E+0, tool
self-verifies law() pre and post append. Standing gate ALL PASS real
exit 0 at tick-start b3e199c9; HEAD advanced twice mid-tick (struct-133
@ 3ae6e9f3 world-mutating sibling, survey-180 @ 05241fde observer
hold); epoch law honored, gate RE-RUN ALL PASS real exit 0 at 3ae6e9f3
before the ledger append. Zero probe self-catches this tick. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero
comp edits, zero shared-budget use. Next tier-2 pair (sweep-184):
row-cottage + observatory (162nd cycle — LRU chain: @183 inn/
tower-house, @182 stable/market, @181 hall/bunkhouse, @180
row-cottage/observatory stalest standing pair at 3 sweeps; both walk
tools verified present on disk this tick: interior-walk-row-cottage.ts,
struct2-walk-observatory.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)

# post-write assertions
c = open(P).read()
assert c.count('| sweep-183 | 2026-09-09 |') == 1, 'row not landed exactly once'
assert c.count('sweep-183: CLEAN SWEEP') == 1, 'prose not landed exactly once'
assert c.count('| sweep-182 | 2026-09-09 |') == 1, 'sweep-182 row disturbed'
assert c.endswith('struct2-walk-observatory.ts).\n'), 'EOF not as expected'
print(f'OK: plan edited, {len(c)} bytes, row+prose landed exactly once each, sweep-182 row undisturbed, EOF verified')
