#!/usr/bin/env python3
"""sweep-125 plan edit: history row after the sweep-124 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
"""
import io

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-125 | 2026-09-08 | 305==305 (267 thing + 38 light; epoch A fully quiet "
"0/0/0 vs sweep-124 baseline sha16 264972880556e91c; epoch B exactly ONE classified "
"drift field = nx-struct-slidingladder yaw 0→2π/9 (0.6981317007977318) same pos same "
"lib same bytes = struct-104 @ 9cdd3b23 committed mid-tick (survey-70 identity cure, "
"yaw-only re-seat, ledger-matched), domain-valid not drift; 0 arrivals, 0 departures; "
"snapshot rewritten 305/120293B/sha16 124f64699e4dcd6e asserted, post-rewrite drift "
"ZERO) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 "
"artwalk-routed @ sweep-43, 81st sweep since routing, no escalation due — law keys "
"Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, SAT run at epoch A "
"+ re-run at epoch B over the rotated ladder bytes, zero new contacts | tier-1 4/4 "
"per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW "
"5/5 @ 0.38, NE 7/7 @ 0.38 epoch A + 7/7 re-walk at epoch B over the struct-104 "
"bytes — ladder 19.0m off the NE route, inside the re-verify band, sweep-58 "
"precedent; SW 5/5 @ 0.37); tier-2 103rd cycle per committed pointer longhouse 6/6 @ "
"0.346 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 79th "
"consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 "
"stable read fresh, ledger law EXACT base re-read fresh pre-append, gate ALL PASS "
"real exit 0 at tick-start 02aad838 + re-run at 9cdd3b23 post-interleave, both from "
"repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

PROSE = ("""
sweep-125: CLEAN SWEEP, epoch-correction tick. Census epoch A 305==305 (267 thing +
38 light) vs the committed sweep-124 baseline (sha16 264972880556e91c): 0 arrivals,
0 departures, 0 drift on all 305 shared ids across id/pos/yaw/lib/scale/kind/bbox.
Epoch B (20s-paced re-read) caught exactly ONE drift field — nx-struct-slidingladder
yaw 0 → 0.6981317007977318 (2π/9 = 40°) at identical pos (3.5, 0.0056, 58) r58.1,
identical lib, identical scale/kind/bbox = struct-104 @ 9cdd3b23 committed mid-tick
(survey-70 slidingladder identity cure: yaw-only re-seat, same pos, same bytes, no
upload, 2 verbs, TUPLE_VERIFIED, idempotent per its own ledger) — ledger-matched
line-for-line, domain-valid, not drift, not routed. Per the polish-270 epoch law all
affected evidence was re-taken fresh before verdicts: standing gate re-run ALL PASS
real exit 0 at 9cdd3b23 from repo ROOT; SAT re-run at epoch B (267 bbox non-light,
236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n
| nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, eighty-first sweep since routing, NOT new, no escalation due — law keys
severity-1; zero new contacts at the rotated yaw); NE re-walked 7/7 ALL_PASS at
epoch B (the ladder sits 19.0m off the NE route — inside the re-verify band after
the parser self-catch, so the epoch-A NE legs were not allowed to stand; NW core and
SW legs are 40m+ away and stand by construction). Overlap epoch A identical verdict
(same single R-121). Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0: core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38 (+epoch B 7/7), SW
5/5 @ 0.37. Tier-2 103rd cycle per committed pointer: longhouse 6/6 @ 0.346
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (79th consecutive clean);
sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes (comp-bearing 21, 38
lights); interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append, D+0/E+0. Standing gate ALL PASS real exit 0 at
tick-start 02aad838 from repo ROOT. Probe self-caught pre-verdict, disclosed: the
walk-band check first keyed waypoint fields the tools do not emit (results carry
flat x/z per row) — the first pass returned no waypoints at all and would have
"verified" the band vacuously; re-derived against the actual schema (sweep-48
per-tool schema class). Snapshot rewritten like-for-like 305 entities / 120293B /
sha16 124f64699e4dcd6e with pre-write assertions (diff exactly [slidingladder yaw]),
post-rewrite drift vs live ZERO. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-126): stable + observatory circuit (104th cycle — LRU chain:
@125 longhouse/garden-cottage, @124 hall/bunkhouse, @123 row-cottage/market, @122
tower-house/inn, @121 forge/potter, @120 stable/observatory — stable and
observatory both last walked sweep-120, now the stalest standing pair; both walk
tools verified present this tick: interior-walk-stable.ts,
struct2-walk-observatory.ts).
""")

# Anchor 1: the sweep-124 history row (unique)
a1 = '| sweep-124 | 2026-09-08 | 304→305'
assert s.count(a1) == 1, ('row anchor', s.count(a1))
i = s.index(a1)
j = s.index('\n', i) + 1  # end of sweep-124 row line
# safety: next line must not already be the sweep-125 row
assert 'sweep-125 |' not in s, 'sweep-125 row already present'
s2 = s[:j] + ROW + s[j:]

# Anchor 2: append prose at EOF
assert s2.rstrip().endswith('interior-walk-garden-cottage.ts).'), s2[-120:]
s2 = s2.rstrip() + '\n' + PROSE

with open(P, 'w', encoding='utf-8') as f:
    f.write(s2)

chk = open(P, encoding='utf-8').read()
assert chk.count('| sweep-125 | 2026-09-08 | 305==305') == 1
assert chk.count('sweep-125: CLEAN SWEEP, epoch-correction tick') == 1
assert chk.count('Next tier-2 pair (sweep-126): stable + observatory') == 1
print('plan edit OK; blocks:', chk.count('sweep-125'), 'mentions;', len(chk), 'bytes')
