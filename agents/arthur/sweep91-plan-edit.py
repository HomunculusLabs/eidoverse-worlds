#!/usr/bin/env python3
"""sweep-91 plan edits: history table row after the sweep-90 table row + narrative block at EOF."""
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

row = ("| sweep-91 | 2026-09-07 | 289→290→291 epoch-corrected (epoch A fully quiet 0/0/0 vs committed sweep-89 baseline sha16 78f5317f2a47cf22; epoch B caught dress-108 live = ONE arrival nx-dress-sw-lanternhook-001 @ (-57,-0.0306,-70) yaw 4.927732 (282.34deg exact) lib 639c54800d2e5856, tuple matches in-tree uncommitted placer sw-dress108-lanternhook-place.ts line-for-line, r90.3 SW; epoch C caught struct-85 live = second arrival nx-struct-chainvault @ (52.6,-0.0478,-19.2) yaw -1.2217 lib 8fecf67df7d33970, tuple matches in-tree uncommitted placer next-place-struct85.ts line-for-line, r56.5 SE; both domain-valid uncommitted-placer class (sweep-30 precedent), 0 departures, 0 drift on 289 shared ids; snapshot rewritten 117161B/291 ents/sha16 ba9884a8e1e91683, pre-write assertion exact, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\\\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 47th sweep since routing, no escalation due — law keys Sev-1); 251→253 bbox non-light / 231 classified / 0 coverage holes, SAT run epoch A + re-run epoch C over both new seats, ZERO new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — both arrivals >33m off every walked leg, walks stand by construction, sweep-53 precedent) + tier-2 69th cycle per committed pointer hall 8/8 @ 0.360 + forge 6/6 @ 0.375 ALL PASS both real exit 0 | pins 15/15 ALL_PINS_OK 45th consecutive (struct18 real exit 0) + battery 28/28 re-run at epoch C (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, belltower 2419fbc5 + ladder live, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + welcome-l, cistern 156b4fc8, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing); interlane f6254cd0 stable; ledger law canonical EXACT 2370715 at append (audit-balance line-1795 slice — probe self-catch: first slice keyed on a prose mention of the marker, sweep-36 class, re-derived before verdict); gate ALL PASS real exit 0 at tick-start 09416e77 + re-run 4aed8bdc post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

anchor = "| sweep-90 | 2026-09-07 | 289==289 fully steady"
assert s.count(anchor) == 1, 'row anchor not unique'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + row + s[j:]

narr = """
sweep-91: CLEAN SWEEP, epoch-corrected tick (two sibling arrivals
absorbed). Census epoch A fully quiet vs the committed sweep-89
baseline (sha16 78f5317f2a47cf22): 289==289, 0 arrivals, 0
departures, 0 drift on the canonical 7-field diff. Epoch B caught
dress-108 landing live: exactly ONE arrival, nx-dress-sw-lanternhook-001
at (-57, -0.030565, -70) yaw 4.927732 (282.34deg exact per its placer),
lib 639c54800d2e5856 — the tuple matches the in-tree uncommitted placer
sw-dress108-lanternhook-place.ts line-for-line (v5 per-post course
profiles, commit pending), r90.3 SW on the devotional corridor's W
flank. Epoch C caught struct-85 landing live: second arrival
nx-struct-chainvault at (52.6, -0.0478, -19.2) yaw -1.2217, lib
8fecf67df7d33970 — the tuple matches the in-tree uncommitted placer
next-place-struct85.ts line-for-line (full-256 sha pinned), r56.5 SE.
Both domain-valid uncommitted-placer class (sweep-30 precedent); 0
departures, 0 drift on the 289 shared ids at every epoch. Snapshot
rewritten with pre-write assertion and post-rewrite drift ZERO:
117161B / 291 entities / sha16 ba9884a8e1e91683. Overlap: SAT run at
epoch A (251 bbox non-light) and re-run at epoch C over both new seats
(253 bbox non-light), 231 classified, 0 coverage holes both runs, exit
3 on ONLY the known R-121 lamp-n | nx-town-mapboard -0.407 —
forty-seventh sweep since routing, not new, no escalation due (the law
keys on severity-1); ZERO new contacts at either new seat. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — both arrivals sit
>33m off every walked leg, so walks stand by construction (sweep-53
precedent); the SAT re-run covers the collision surface. Tier-2 69th
cycle per the committed pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + forge 6/6 @ 0.375 (interior-walk-forge.ts),
both real exit 0. Integrity: pins 15/15 ALL_PINS_OK (45th consecutive
clean, struct18-fleet-pin-check real exit 0) + battery 28/28 ALL PASS
re-run at epoch C. Interlane md5 f6254cd0 stable. Ledger law canonical
EXACT 2370715 at append (audit-balance line-1795 slice — probe
self-catch: the first probe sliced from a PROSE MENTION of the marker
in sweep-79's row rather than the canonical line-1795 entry, sweep-36
class, re-derived before any verdict). Standing gate ALL PASS real
exit 0 at tick-start 09416e77, re-run ALL PASS real exit 0 at 4aed8bdc
after the city-46..49 zero-mutation holds interleaved. Foreign-lane
dirt (dress-108 lanternhook placer + decode/render/scan hooks, struct-85
placer + terrain probe, modified village_next_core_paths.glb + review
json, fleet helpers) left untouched per interlane law. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-92):
garden-cottage + tower-house (70th cycle — corrected LRU chain: @91
hall/forge, @90 bunkhouse/longhouse, @89 potter/market, @88 inn/stable,
@87 hall/forge, @86 row-cottage/observatory, @85 bunkhouse/longhouse —
garden-cottage + tower-house last walked sweep-82, now the stalest
standing pair; both walk tools verified present).
"""
assert s.count('sweep-90: CLEAN SWEEP, fully steady tick') == 1, 'narrative anchor not unique'
s = s.rstrip('\n') + '\n' + narr
open(P, 'w').write(s)
print('PLAN EDIT OK: row inserted after sweep-90 table row, narrative appended at EOF')
print('bytes now', len(s))
