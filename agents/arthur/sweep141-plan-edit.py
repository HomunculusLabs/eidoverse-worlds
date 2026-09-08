#!/usr/bin/env python3
"""sweep-141 plan edit: history row after the sweep-140 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
Arrival tick: 309->310, exactly one domain-valid arrival nx-struct-tesseract
(struct-110 in flight, uncommitted placer next-place-struct110.ts), epoch A
fully quiet (309==309, raw sha16 61dcec449edc3149), epoch B arrival raw
sha16 a7660d429480d0f1, SAT re-run at epoch B clean-of-new-contacts,
snapshot rewritten 122425B / 310 ents / sha16 26747e696973d352,
post-rewrite drift ZERO.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-141 | 2026-09-08 | 309→310 across epochs A→B (272 thing + 38 light at epoch B; epoch A fully quiet "
"309==309 0/0/0 raw sha16 61dcec449edc3149 identical to sweep-140's close; epoch B 20s-paced re-read caught exactly "
"ONE domain-valid arrival nx-struct-tesseract @ (−9.07,0.1479,129.68) yaw 0 lib 4c14467776d58748 scale 1 comp {} = "
"struct-110 in flight, uncommitted placer next-place-struct110.ts pins exactly this tuple line-for-line (sweep-30/91 "
"uncommitted-placer class), bbox 9.12×5.45×9.12 scale-sane, r130.1 S az184 extending the S mathematics axis beyond "
"rule30wall; 0 departures, 0 drift on 309 shared ids on id/pos/yaw/lib/scale/kind/bbox at both epochs; survey-82/83 "
"read-only observers @ 0beca1a3/9a3878a2 interleaved, zero mutations per their own ledger lines, epoch B corroborates "
"their 309==309 holds; snapshot rewritten 310/122425B/sha16 26747e696973d352, pre-write assertions, post-rewrite drift "
"ZERO) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 97th sweep since "
"routing, no escalation due — law keys Sev 1); SAT run epoch A 271/236/0 + re-run at epoch B over the arrival-inclusive "
"set 272/236/0, zero coverage holes, tesseract SAT-clean (zero new contacts) | tier-1 4/4 per-leg verified 81/81 "
"ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; arrival r130.1 S "
"110m+ off every tier-1 waypoint — walks stand by construction, sweep-53/136/138/140 precedent); tier-2 119th per "
"committed pointer hall 8/8 @ 0.360 + bunkhouse 6/6 @ 0.3803 ALL PASS | pins 15/15 ALL_PINS_OK 95th consecutive; "
"battery 28/28 on fresh census-A bytes; interlane f6254cd0 stable read fresh; ledger law EXACT 2370755 base re-read "
"fresh pre-append (survey-82/83 observer holds D+0/E+0); gate ALL PASS real exit 0 at tick-start 0beca1a3 + re-run "
"9a3878a2 post-arrival both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

PROSE = """
sweep-141: CLEAN SWEEP, arrival + epoch-correction tick. Census epoch A fully
quiet (309==309 vs the committed sweep-140 baseline sha16 f9c7338a758dbe50:
0 arrivals, 0 departures, 0 drift on all 309 shared ids across
id/pos/yaw/lib/scale/kind/bbox; raw sha16 61dcec449edc3149, byte-identical
to sweep-140's close). Epoch B (20s-paced re-read after the walk battery)
caught exactly ONE arrival — nx-struct-tesseract @ (−9.07, 0.1478621615839162,
129.68) yaw 0, lib 4c14467776d58748, scale 1, comp {}, bbox 9.12×5.45×9.12 —
struct-110 in flight: no [struct-110] ledger entry at HEAD yet, but the
uncommitted placer next-place-struct110.ts pins exactly this tuple
line-for-line (POS/YAW constants match the live read to full precision;
sweep-30/91 uncommitted-placer class), struct-lane domain prefix, r130.1 S
(az184) extending the S mathematics axis beyond rule30wall, scale/pose sane.
0 departures, 0 drift on 309 shared ids at both epochs. survey-82/83
read-only observers @ 0beca1a3/9a3878a2 interleaved (both zero-mutation
holds; their own census reads corroborate 309==309 on their side of my
epoch-B arrival). Per the polish-270 epoch law all affected evidence was
re-taken fresh before verdicts: SAT re-run at epoch B over the
arrival-inclusive live set — 272 bbox non-light, 236 classified, 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407, known Sev 2 routed to artwalk b26 choreography @ sweep-43,
ninety-seventh sweep since routing, NOT new, no escalation due (law keys
severity-1); the tesseract itself is SAT-clean (zero new contacts, 9.12m
footprint at r130.1 with its nearest neighbor rule30wall 10m+ along-axis).
Walk classification: the arrival sits r130.1 S; every tier-1 leg is r<20 —
110m+ from the nearest walked waypoint, epoch-A walks stand by construction
(sweep-53/136/138/140 precedent); SAT re-run covers the collision surface.
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core
64/64 @ 0.38 maxDist (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Tier-2 119th cycle per the committed pointer: hall
8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803
(interior-walk-bunkhouse.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (95th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append, canonical slice 2336002 + D+33788 E+965 =
2370755 (survey-82/83 observer holds D+0/E+0, no absorption needed), D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 0beca1a3 (content-anchored
run) + re-run ALL PASS real exit 0 at 9a3878a2 post-arrival (unmasked exit
capture), both runs from repo ROOT. Snapshot rewritten per the sweep-140
chassis: 310 entities, 122425 bytes, sha16 26747e696973d352, pre-write
assertions (exactly one arrival, zero departures, zero drift on shared ids,
arrival tuple as observed and placer-matched), post-rewrite drift vs live
ZERO (310/310 exact). Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-142): inn + tower-house (120th cycle — LRU chain: @141
hall/bunkhouse, @140 longhouse/garden-cottage, @139 row-cottage/market,
@138 stable/observatory, @137 longhouse/garden-cottage, @136 hall/bunkhouse,
@135 inn/tower-house — inn and tower-house both last walked sweep-135, now
the stalest standing pair; both walk tools verified present on disk this
tick: interior-walk-inn.ts, interior-walk-tower-house.ts).
"""

anchor = '| sweep-140 | 2026-09-08 |'
assert s.count(anchor) == 1, 'sweep-140 row anchor not unique'
i = s.find(anchor)
j = s.find('\n', i)
assert j > 0
s2 = s[:j+1] + ROW + s[j+1:]

# prose at EOF
assert 'sweep-141: CLEAN SWEEP' not in s2, 'prose already present'
s2 = s2.rstrip('\n') + '\n' + PROSE

open(P, 'w', encoding='utf-8').write(s2)

chk = open(P, encoding='utf-8').read()
assert chk.count('| sweep-141 | 2026-09-08 |') == 1
assert chk.count('sweep-141: CLEAN SWEEP') == 1
assert chk.count('| sweep-140 | 2026-09-08 |') == 1
assert '## Findings register' in chk
print('plan edit OK: row inserted after sweep-140 row, prose at EOF, headers intact')
print('bytes:', len(chk.encode()))
