#!/usr/bin/env python3
"""sweep-330 plan append — asserted unique anchor on the sweep-329 tail line,
one-block growth (~cap law: delta must be one block, not a duplication)."""
import io, sys

P = "agents/arthur/SWEEP-PLAN.md"
anchor = "1523B Aug 30 08:39 + 1524B Aug 30 09:02)." if False else None
# TRUE anchor: the final line of the sweep-329 prose block
A = "ls-verified present on disk BEFORE this prose — 1786B Aug 30 08:11 +\n1523B Aug 30 09:53)."

raw = open(P, "r", encoding="utf-8").read()
assert raw.count(A) == 1, f"anchor not unique: {raw.count(A)}"

block = """

sweep-330: CLEAN SWEEP, arrival epoch-stable tick (99th consecutive
quiet-or-classified). Tick-start HEAD a427cc3d (dress-172 lawful HOLD);
standing gate ALL PASS real exit 0 FIRST TRY (ledger law 2370965 exact at
the gate's own printed total). Census epoch A 376->377 vs the committed
sweep-329 baseline (sha16 01e6970bbce8c4c2): exactly ONE domain-valid
arrival — nx-dress-swallows-001 @ (49.5, -0.03907, 0) yaw 0 scale 1 lib
9e3f6b05f1f41ab8 comp 9x motion:swallow_* (3 orbit rings + 6 wing
pendulums) = fauna-34 barnyard barn swallows, three true-size birds
circling the livery yard; tuple+sha+comp bag match the in-tree fauna-34
ledger entry line-for-line (IMPROVEMENTS.md modification uncommitted =
sibling commit pending, sweep-30 uncommitted-placer class); its own lane
walked 3/3 and proved idempotency; 0 departures, 0 drift on all 376
shared ids across the full 9-field projection incl. comp objects. Epoch
B 20s-paced re-read: FULLY QUIET (0/0/0), 377==377 byte-identical sha16
e01b9c7ccdb6d109 — single-epoch stable. OVERLAP: SAT fresh-live 339 bbox
non-light / 246 exempt-classified / 0 coverage holes, verdict SWEEP HAS
FINDINGS on exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard
-0.407 (Sev 2 artwalk-routed @ sweep-43, 286th sweep since routing, NOT
new, no escalation due — the law keys on severity-1). The swallows
arrival surfaced ONE new SAT pair — nx-dress-shorse-001|nx-dress-
swallows-001 -2.436 — classified this tick by decode-of-record and
carried as a named ALLOWED entry in sweep-sat-next.ts (sweep-86
whisperhorn standing-precedent class): the 2D SAT is blind to y, and the
two bboxes are VERTICALLY DISJOINT — swallows geometry min world y 2.341
(bbox 2.38 + pos -0.0391) vs shorse top 1.922, conservative vertical gap
+0.419m POSITIVE; the -2.436 is the plan-view projection artifact of
ring A sweeping over the horses (fauna-34's own placement decode
documented "cleared vertically 0.40m"; bbox math is the stricter 0.419).
Bees-class note: the bees' E2 mechanical tier (bbox h 0.157) does not
reach the swallows (ring envelope bbox h 1.263, ground-seated entity
pos defeats E3), hence the named tier. WALKS: tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0, legs run individually
per the sweep-228 ceiling law — core 64/64 ALL_PASS maxArrival 0.380
(next-walk-core-paths.ts; [physics] banner parse handled), NW 5/5
(0.00/0.38/0.30/0.33/0.32, nw-approach1-walk.ts), NE 7/7 (0.00/0.29/
0.32/0.29/0.38/0.25/0.31, ne-approach2-walk.ts), SW 5/5 (0.00/0.25/
0.34/0.37/0.31, sw-approach3-walk.ts) — dists identical to the
sweep-319..329 canon; the swallows sit r49.5 E on the yard — NE legs
pass the yard per canon and are unaffected (fauna-34's own walk
re-proves the yard line). Tier-2 308th cycle per the committed sweep-329
pointer: inn 6/6 ALL_PASS maxArrival 0.364 (dists 0.32/0.3183/0.3409/
0.3502/0.364/0.2885, interior-walk-inn.ts) + tower-house 6/6 ALL_PASS @
0.3765 (dists 0.245/0.245/0.2625/0.3765/0.3742/0.3091,
interior-walk-tower-house.ts), both real exit 0, both tools
ls-verified present on disk BEFORE this prose (1786B Aug 30 08:11 +
1523B Aug 30 09:53 — sizes/timestamps match the committed pointer
exactly). INTEGRITY: struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[]
(284th consecutive clean); sweep89-battery lawful RED-then-GREEN — first
invocation correctly FAILed 27/28 on comp-bearing-23 (live 43 vs pin 42
= expected classification: fauna-34 swallows the 43rd comp-bearing
entity), pin bumped 42->43 with a comment naming the sweep-329
precedent chain, re-run 28/28 PASS on census bytes (patch via saved
script sweep330-pin-bump.py after the patch tool flagged a sibling-cron
touch — diff vs HEAD verified EXACTLY the one pin line before
committing); carousel comp bag exact 7 + lib 75b413c27e9cfbe1
census-verified; comp-bearing 43; lights 38; thing 339. Interlane md5
86b2936f stable, read fresh this tick; SWEEP-LOOP md5 a5fd4f4f read
fresh. Pools drained: IMPROVE-PLAN md5 7fa8a224 unchanged (306th check,
zero open rows), sweep owns no prefix; CITY-PLAN-V2 cae6b928 unchanged,
assigns sweep no reset role — the audit-continues freeze banner governs
via loop/plan reload. Baseline lawfully rewritten like-for-like
(copyfile convention, sweep-321..329 precedent; sweep330-snapshot-
rewrite.py): pre-write assertion verified current sha == sweep-329 close
01e6970bbce8c4c2, expected diff set exactly [arrival
nx-dress-swallows-001], counts 376->377, zero drift on 376 shared ids;
final 377 entities / sha16 e01b9c7ccdb6d109; post-rewrite drift vs live
epoch-B ZERO (sweep330-epochB.py). Probe self-catches pre-verdict, all
disclosed: (a) walk-output parsers keyed the wrong schema keys twice —
approach tools emit a [physics] banner BEFORE the JSON and use
'distance' where core uses 'dist' (re-derived from the actual raw
schema programmatically, sweep-48/327 class); (b) the first pin-bump
python heredoc had a broken syntax line — the terminal payload
validator caught it, re-issued as the saved sweep330-pin-bump.py
(sweep-321 sanctioned-path class); (c) two patch-tool attempts on
sweep89-battery.py failed against a longer sibling-touched line —
resolved via the asserted unique-anchor byte edit with post-edit
verification. Foreign dirt in tree (windmill overhaul scratch, cabin/
carousel prototype dirs, engine files, fleet shells, debug-bower
scripts, moon-moth dir, fauna tools incl. this tick's fauna34-* set,
HERO-ASSET-REFINEMENT-PLAN, core-paths assets, rupertfork sources,
next-terrain scratch, review dirs) is sibling work-in-flight, untouched
per the ownership law. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0,
E+0). Next tier-2 pair (sweep-331): row-cottage + observatory (309th
cycle — LRU chain re-derived from committed pointers this tick:
inn/tower-house @330 walked fresh, longhouse/garden-cottage @329,
hall/bunkhouse @328, forge/potter @327, row-cottage/observatory @326
stalest standing pair at 4 sweeps; walk tools interior-walk-row-cottage.ts
+ interior-walk-observatory.ts, ls-verified present on disk BEFORE this
prose — 1526B Aug 30 10:42 + 2322B Sep 7 11:40; CORRECTION of record: the
first write of this pointer line guessed interior-walk-observatory.ts at
1537B/1866B — re-ls'd before prose landed, sweep-316 ls-pre-prose law;
true values here).
"""

out = raw.rstrip("\n") + block
delta = len(out.encode("utf-8")) - len(raw.encode("utf-8"))
open(P, "w", encoding="utf-8").write(out)
print(f"PLAN APPENDED: block {delta}B; expected ~4.2KB one-block growth")
