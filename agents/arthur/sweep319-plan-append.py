#!/usr/bin/env python3
# sweep319-plan-append.py — append this tick's prose block to SWEEP-PLAN.md tail.
import re, sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()
# unique anchor = end of the sweep-318 block (file tail)
anchor = "walk tools interior-walk-longhouse.ts + interior-walk-garden-\ncottage.ts, ls-verified present on disk BEFORE this prose — 1559B Aug 30\n+ 1567B Aug 30)."
assert s.count(anchor) == 1, f'anchor count {s.count(anchor)}'
assert not re.search(r'\bsweep-319:', s), 'sweep-319 prose already present'

block = """

sweep-319: FINDING tick (arrival + R-125 routed; 88th consecutive
quiet-or-classified). Tick-start HEAD 7dbef664; gate ALL PASS real exit 0
FIRST TRY (ledger law 2370942). Census A 366->367: +1 domain-valid arrival
nx-dress-peacock-001 @ (-47.5,0.04167,60) yaw 2.58 lib c9425f51b43a71a1,
6x motion:peacock{,_crest,_head,_tail,_train,_wings} = fauna-25 @ ea1bbb50
ledger-matched line-for-line; ONE classified drift nx-carousel
08ce1189b2d4b42b->a35f40f1925ce93b identical tuple+comp (polish-291 night
valance ember, bbox byte-identical); 0 departures, 0 unexplained drift.
dress-161 (33333add) zero-mutation interleave corroborated both; epoch B
== A byte-identical; gate re-run ALL PASS exit 0 at 33333add. SAT
329/243/0 exit 3 on TWO: known R-121 (275th, no escalation due) + NEW
peacock|lavender-0040 -3.149 → decoded + routed R-125 Sev 2 fauna (TRUE
plant-through-solid: plant vs plinth 0.004m, vs bird 0.001m; peacock
seated INSIDE the lavender-0040 planted area — see register + FAUNA-PLAN
defect note; NOT walk-blocking, NW END 10.2m re-walked 5/5). Tier-1 81/81
ALL_PASS real exit 0 each (core 64/64 @ 0.380; NW 5/5 @ 0.38 re-walked
peacock-inclusive per sweep-308 band; NE 7/7 @ 0.38; SW 5/5 @ 0.37).
Tier-2 297th longhouse 6/6 @ 0.346 + garden-cottage 6/6 @ 0.355 ALL PASS.
Pins 15/15 (273rd); battery RED->GREEN two lawful bumps (comp-bearing
37->38 = peacock; carousel-lib a35f40f1), final 28/28; lights 38. Pools:
IMPROVE 7fa8a224 (295th), CITY-V2 cae6b928 — unchanged. Baseline
rewritten with pre-write assertion (diff exactly [arrival peacock,
carousel.lib]): 367 ents / 270179B / sha16 9b24d4f71bd67b29, post-rewrite
drift ZERO. Probe self-catches disclosed: raw-accessor decode chassis
(pitfall-4 rewrite, verdict unchanged); 241^2-cell grid timeout
(bbox-prefilter cure); sibling-cron modify warning on battery first patch
investigated (single edit, 28 checks verified). Zero world mutations, one
file-write defect note routed. Next tier-2 pair (sweep-320): inn +
tower-house (298th cycle — LRU chain: longhouse/garden-cottage @319,
hall/bunkhouse @318, forge/potter @317, inn/tower-house @316 stalest at 3;
tools interior-walk-inn.ts + interior-walk-tower-house.ts, verify present
on disk pre-run).
"""
s = s + block
open(P, 'w').write(s)
s2 = open(P).read()
assert s2.count('sweep-319:') == 1
print('PLAN BLOCK LANDED; file bytes:', len(s2.encode()))
