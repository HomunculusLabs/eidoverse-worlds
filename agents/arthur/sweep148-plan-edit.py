#!/usr/bin/env python3
"""sweep-148 plan edit: one history table row after the sweep-147 row
(line-anchored on its unique prefix) + one prose block appended at the
file tail. Asserts unique anchors before writing (plan-edit chassis law)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-148 | 2026-09-08 | 312==312 fully quiet BOTH epochs (274 thing + 38 light; 0 arrivals, "
"0 departures, 0 drift on all 312 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed "
"sweep-147-era baseline sha16 cd7dd2a21cd8327d; epochs A/B 20s-paced byte-identical raw sha16 "
"6e90180315a0676d — single stable epoch; REPRESENTATION EPOCH noted: live /geom now also emits "
"comp/compKeys on every entity and omits bbox on lights (was null) — 662 all-field diffs are "
"schema-only, comp VALUES match standing fleet pins, classified sweep-56/142 class, no snapshot "
"rewrite, baseline current) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 "
"artwalk-routed @ sweep-43, 104th sweep since routing, no escalation due — law keys Sev 1); 274 "
"bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new "
"contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW "
"5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — first chained run hit the 400s tool timeout on the "
"SW leg, one paced retry per malformed-live-response discipline returned ALL_PASS) + tier-2 "
"126th cycle per committed pointer stable 5/5 @ 0.3958 + market 6/6 @ 0.3894 ALL PASS | pins "
"15/15 ALL_PINS_OK 102nd consecutive, battery 28/28 exit 0 on fresh census-A bytes (comp-bearing "
"21 census-matched under the new comp-bearing representation), interlane f6254cd0 stable read "
"fresh, ledger law EXACT (tool self-verifies pre/post append) D+0/E+0, gate ALL PASS real exit 0 "
"at tick-start d8e8da99 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

anchor = '| sweep-147 | 2026-09-08 | 312==312 fully quiet BOTH epochs'
assert s.count(anchor) == 1, f'table anchor count {s.count(anchor)}'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + ROW + s[j:]

PROSE = """
sweep-148: CLEAN SWEEP, fully quiet steady-state tick. Census 312==312 at
both epochs (274 thing + 38 light) vs the committed baseline (sha16
cd7dd2a21cd8327d): 0 arrivals, 0 departures, 0 drift on all 312 shared
ids across id/pos/yaw/lib/scale/kind/bbox; epochs A and B (20s-paced)
byte-identical, raw sha16 6e90180315a0676d — single stable epoch, no
sibling mutated the live world this window. REPRESENTATION EPOCH (noted,
classified, no world change): live /geom now emits comp/compKeys on every
entity including empty bags, and omits bbox on light-kind entities (was
bbox:null) — the standard 5-field diff reads fully quiet while the raw
payload sha differs from sweep-147's 1c1337a9025c3117; an all-field scan
attributed all 662 field diffs to exactly these two schema changes
(sweep-56 comps-artifact class + sweep-142 lights-representation class),
and every comp VALUE matches the standing fleet pins (carousel exact 7,
hamlet embers 5-of-5, belltower ladder, potter pwheel, windmill
sails+millstone, h6/h7 motion, hearth, forge, orrery, screwwell,
reuleauxrotor, shelltower socket, tower socket, moonmoth, court smoke,
house-35_-22 structure). Baseline NOT rewritten (classified fields
byte-current, sweep-106..147 precedent). Overlap: SAT fresh over the
live set — 274 bbox non-light, 236 classified, 0 coverage holes, exit 3
on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407,
known Sev 2 routed to artwalk b26 choreography @ sweep-43,
one-hundred-and-fourth sweep since routing, NOT new, no escalation due
(law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts;
first chained run hit the 400s tool timeout on the SW leg — one paced
retry per malformed-live-response discipline returned ALL_PASS, sweep-12
class). Tier-2 126th cycle per the committed pointer: stable 5/5 @
0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (102nd
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start d8e8da99
(survey-97 read-only hold), run from repo ROOT. Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-149): inn +
tower-house (127th cycle — LRU chain: @148 stable/market, @147
longhouse/garden-cottage, @146 hall/bunkhouse, @145 inn/tower-house —
inn and tower-house both last walked sweep-145, now the stalest standing
pair; both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).
"""

assert s.count('sweep-148: CLEAN SWEEP') == 0, 'prose already present'
s = s.rstrip('\n') + '\n' + PROSE
open(P, 'w').write(s)

# post-write verify
s2 = open(P).read()
assert s2.count('| sweep-148 | 2026-09-08 |') == 1
assert s2.count('sweep-148: CLEAN SWEEP') == 1
row_line = [l for l in s2.split('\n') if l.startswith('| sweep-148 |')]
assert len(row_line) == 1 and row_line[0].endswith('|'), 'table row must be one line'
print('PLAN EDIT OK: 1 table row + 1 prose block; anchors unique; verified post-write')
