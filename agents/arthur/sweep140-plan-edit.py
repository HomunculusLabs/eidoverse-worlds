#!/usr/bin/env python3
"""sweep-140 plan edit: history row after the sweep-139 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
Arrival tick: 308->309, exactly one domain-valid arrival nx-struct-rule30wall,
epochs A/B identical raw sha16 61dcec449edc3149, snapshot rewritten
122015B / 309 ents / sha16 f9c7338a758dbe50, post-rewrite drift ZERO.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-140 | 2026-09-08 | 308→309 arrival (271 thing + 38 light; exactly ONE domain-valid arrival "
"nx-struct-rule30wall @ (−8.37,0.3872,119.71) yaw 0 lib e70161322c42c2eb comp {} = struct-109 @ c5f154af "
"committed PRE-tick (sweep-139's window closed before the placement verbs), live tuple matches its ledger "
"line-for-line (az184 r120, census 308→309 per its own entry); 0 departures, 0 drift on 308 shared ids on "
"id/pos/yaw/lib/scale/kind/bbox; epochs A/B 20s-paced identical raw sha16 61dcec449edc3149 single stable "
"epoch, no sibling mutated this window — survey-80/81 read-only observers @ b1809c59/b3ea710a interleaved, "
"zero mutations per their own ledger lines, epoch B corroborates; snapshot rewritten 309/122015B/sha16 "
"f9c7338a758dbe50, pre-write assertions, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\\|"
"nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 96th sweep since routing, no escalation due — "
"law keys Sev 1); 271 bbox non-light / 236 classified / 0 coverage holes, rule30wall SAT-clean in the live "
"set (zero new contacts, corroborates struct-109's own +6.19 dodecahedron fresh-308 gate) | tier-1 4/4 "
"per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ "
"0.38, SW 5/5 @ 0.37; arrival r119.9 S 100m+ off every tier-1 waypoint — walks stand by construction, "
"sweep-53/136/138 precedent); tier-2 118th per committed pointer longhouse 6/6 @ 0.3456 + garden-cottage "
"6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 94th consecutive; battery 28/28 on fresh census-A bytes; "
"interlane f6254cd0 stable read fresh; ledger law EXACT 2370755 base re-read fresh pre-append; gate ALL "
"PASS real exit 0 at tick-start c5f154af + re-run at b3ea710a post-interleave, both from repo ROOT | "
"CLEAN SWEEP — R-121 open, known, no escalation due |\n")

PROSE = """
sweep-140: CLEAN SWEEP, arrival tick. Census 308→309 (271 thing + 38 light)
vs the committed sweep-138 baseline (sha16 491682d9a5c07a09; sweep-139 was a
no-rewrite steady state): exactly ONE arrival — nx-struct-rule30wall @
(−8.37, 0.3872, 119.71) yaw 0, lib e70161322c42c2eb, scale 1, comp {} —
struct-109 @ c5f154af committed PRE-tick: the struct lane's ledger line
matches the observed tuple line-for-line (pos/yaw/lib, az184 r120, census
308→309 per its own entry), domain-valid, not drift. 0 departures, 0 drift
on all 308 shared ids across id/pos/yaw/lib/scale/kind/bbox. Epochs A/B
(20s-paced) identical raw sha16 61dcec449edc3149 — single stable epoch, no
sibling mutated the live world this window; survey-80/81 read-only observer
interleaves @ b1809c59/b3ea710a absorbed (zero mutations per their own
ledger lines; my epoch B corroborates 309 unchanged). Overlap: SAT fresh
over the arrival-inclusive live set — 271 bbox non-light, 236 classified,
0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26 choreography @
sweep-43, ninety-sixth sweep since routing, NOT new, no escalation due (law
keys severity-1); the rule30wall itself is SAT-clean (zero new contacts,
corroborating struct-109's own +6.19 dodecahedron fresh-308 gate). Walk
classification: the arrival sits r119.9 S (az184); every tier-1 leg is r<20
— 100m+ from the nearest walked waypoint, epoch-A walks stand by
construction (sweep-53/136/138 precedent), and struct-109's own placement
walk re-proves the site. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0: core 64/64 @ 0.38 maxDist (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 118th cycle per the committed
pointer: longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + 
garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both real
exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(94th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT -- base re-read fresh immediately before append, 2370755, D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start c5f154af, re-run ALL PASS
real exit 0 at b3ea710a after the survey interleaves, both runs from repo
ROOT. Snapshot rewritten per the sweep-138 chassis: 309 entities, 122015
bytes, sha16 f9c7338a758dbe50, pre-write assertions (exactly one arrival,
zero departures, zero drift on shared ids, arrival tuple as observed),
post-rewrite drift vs live ZERO (309/309 exact). Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-141): hall +
bunkhouse (119th cycle — LRU chain: @140 longhouse/garden-cottage, @139
row-cottage/market, @138 stable/observatory, @137 longhouse/garden-cottage,
@136 hall/bunkhouse, @135 inn/tower-house, @134 forge/potter — hall and
bunkhouse both last walked sweep-136, now the stalest standing pair; both
walk tools verified present on disk this tick: interior-walk-hall.ts,
interior-walk-bunkhouse.ts).
"""

anchor = '| sweep-139 | 2026-09-08 |'
assert s.count(anchor) == 1, 'sweep-139 row anchor not unique'
i = s.find(anchor)
j = s.find('\n', i)
assert j > 0
s2 = s[:j+1] + ROW + s[j+1:]

# prose at EOF
assert 'sweep-140: CLEAN SWEEP' not in s2, 'prose already present'
s2 = s2.rstrip('\n') + '\n' + PROSE

open(P, 'w', encoding='utf-8').write(s2)

chk = open(P, encoding='utf-8').read()
assert chk.count('| sweep-140 | 2026-09-08 |') == 1
assert chk.count('sweep-140: CLEAN SWEEP') == 1
assert chk.count('| sweep-139 | 2026-09-08 |') == 1
assert '## Findings register' in chk
print('plan edit OK: row inserted after sweep-139 row, prose at EOF, headers intact')
print('bytes:', len(chk.encode()))
