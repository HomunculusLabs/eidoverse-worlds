#!/usr/bin/env python3
"""sweep-181 plan edits: history row after the sweep-180 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write.
Adapted verbatim from the committed sweep180-plan-edit.py."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-180 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-181: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-181 | 2026-09-09 | 320→321 BOTH epochs (A/B 20s-paced BYTE-IDENTICAL raw sha16 "
       "6eb17b2603a9e106): exactly ONE domain-valid arrival nx-struct-gyroid @ [-16.7416,-0.0200,239.4154] "
       "yaw pi lib da2a4b158a448caa comp {} = struct-131 built / struct-132 placed @ ef5c9849, tuple "
       "matches its committed ledger line-for-line (PLACED_VERIFIED, census 320→321, read-back exact); "
       "0 departures, 0 field diffs, 0 lib flips on all 320 shared ids; baseline rewritten 321 ents / "
       "213610B / sha16 99e835ed9dfba623 (arrival appended, order+set preserved, drift ZERO post-write) "
       "| SAT fresh-live 283 bbox non-light / 236 classified / 0 coverage holes exit 3 ONLY known R-121 "
       "lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 137th sweep since routing, not "
       "new, no escalation due — law keys Sev 1); gyroid adds no new contacts, corroborating struct-132's "
       "own placer SAT worst-solid +6.18 | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each "
       "(core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 "
       "ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed "
       "brace-anchored) | tier-2 159th cycle per committed sweep-180 pointer hall 8/8 @ 0.360 "
       "(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.380 (interior-walk-bunkhouse.ts), both ALL_PASS real "
       "exit 0 | pins 15/15 ALL_PINS_OK (135th consecutive clean, struct18-fleet-pin-check.ts real exit "
       "0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, "
       "ledger law EXACT base 2370771 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start "
       "ef5c9849 (99 PASS lines), zero mid-tick sibling advances (epochs A/B byte-identical) | CLEAN "
       "SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-181: CLEAN SWEEP, arrival-fold tick. Census 320→321 BOTH epochs (A/B
20s-paced, raw fetches BYTE-IDENTICAL, sha16 6eb17b2603a9e106) vs committed
baseline 5014e49ad693c10f: exactly ONE arrival — nx-struct-gyroid @
[-16.7416,-0.0200,239.4154] yaw pi lib da2a4b158a448caa comp {} — classified
domain-valid struct-lane work: struct-131 built the Gyroid (family gap
1/1/0 prose-only, one period cell, MC overscan+clip film 100,980 verts)
and struct-132 @ ef5c9849 executed the deferred placement (scan r240 az184
yaw-pi lawful direct fresh-320, worst-solid harmonickiss +6.18, terrain
9pt spread 14.8mm, hash-gated placer, PLACED_VERIFIED, census 320→321,
idempotent rerun REFUSED zero-verbs, independent read-back exact tuple +
bbox 4.6×4.19×4.6 = decode envelope). Tuple matches the committed ledger
line-for-line. Zero departures, zero field diffs, zero lib flips on all
320 shared ids. Overlap: SAT fresh-live 283 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 137th sweep since routing, NOT new, no escalation
due (law keys severity-1). The gyroid introduces NO new contacts,
corroborating struct-132's own placer SAT (worst-solid +6.18 vs
harmonickiss r230 — the S-walk cadence spacing holds: kiss r230 → gyroid
r240). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0 — core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37,
all run individually, per-leg ok parsed brace-anchored; walks stand by
construction (gyroid r240.0 S, 200m+ off every tier-1 waypoint, sweep-53
precedent). Tier-2 159th cycle per the committed sweep-180 pointer: hall
8/8 @ 0.360 + bunkhouse 6/6 @ 0.380, both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK (135th consecutive clean),
sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5
f6254cd0 stable read fresh. Ledger law EXACT — base 2370771 re-read fresh
immediately before append (no sibling increment; sweep-180 base 2370770
+1 struct-132 D+1 already absorbed upstream), D+0/E+0, tool self-verifies
law() pre and post append. Standing gate ALL PASS real exit 0 at
tick-start ef5c9849 (99 PASS lines); ZERO mid-tick sibling advances —
epochs A and B byte-identical, so no gate re-run required. Baseline
rewritten per the sweep-177 arrival-fold chassis: 321 entities / 213610B /
sha16 99e835ed9dfba623, pre-write asserts (arrival set exactly
[nx-struct-gyroid], 0 departures, 0 lib flips, 0 field drift on the 320
shared ids), post-write drift ZERO, order+set of the prior 320 preserved.
Probe self-catch pre-verdict, disclosed: first snapshot-rewrite run from
agents/arthur/ cwd died FileNotFoundError on the repo-relative BASE path
(asserts already green, nothing yet written — sweep-177 chassis expects
repo root); re-run from repo root, clean. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use. Next tier-2 pair (sweep-182): stable + market (160th
cycle — LRU chain: @181 hall/bunkhouse, @180 row-cottage/observatory,
@179 inn/tower-house, @178 stable/market stalest standing pair at 3
sweeps; both walk tools verified present on disk this tick:
interior-walk-stable.ts, interior-walk-market.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)

# post-write assertions
c = open(P).read()
assert c.count('| sweep-181 | 2026-09-09 |') == 1, 'row not landed exactly once'
assert c.count('sweep-181: CLEAN SWEEP') == 1, 'prose not landed exactly once'
assert c.count('| sweep-180 | 2026-09-09 |') == 1, 'sweep-180 row disturbed'
assert c.endswith('interior-walk-stable.ts, interior-walk-market.ts).\n'), 'EOF not as expected'
print(f'OK: plan edited, {len(c)} bytes, row+prose landed exactly once each, sweep-180 row undisturbed, EOF verified')
