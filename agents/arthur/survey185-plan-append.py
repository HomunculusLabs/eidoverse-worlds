#!/usr/bin/env python3
"""survey-185 plan-block append (insert-only-at-EOF, asserted).
Block 185 -> SURVEY-PLAN.md EOF. Asserts gate the write; post-write
verification gates the commit. No routing this tick -> no ledger append
(loop law 4), no other lane's plan touched."""
import io

PLAN = 'agents/arthur/SURVEY-PLAN.md'
MARKER = '## Tick 185 (2026-09-09 20:3x EDT) — HOLD, 89th quiet hold, 4th at 322-epoch'
BLOCK = """
## Tick 185 (2026-09-09 20:3x EDT) — HOLD, 89th quiet hold, 4th at 322-epoch
- Gate: ALL PASS real exit 0 un-piped (GATE_EXIT:0 marker) first try at
  tick-start HEAD 7fbac2bd (own survey-184 at tip; ledger law EXACT
  2370772, tail [survey-81], 99 PASS lines). Interlane md5 f6254cd0
  unchanged; IMPROVE-PLAN md5 c0f569d0 unchanged (git-untouched since
  d2e5335b 09-08).
- Census fresh (curl UA): 322 entities (284 thing + 38 light, 0 dupes),
  raw 95267B sha16 551d9f029269a6b4 — byte-identical to the s182/s184
  fetch class. Set-diff vs committed sweep-183 fold baseline (322,
  ca2a1883 lineage) via tracked survey185-census-diff.py (s184 chassis
  verbatim, projection-canonical compKeys law): 0 arrivals / 0
  departures / 0 field diffs / 0 lib flips on ALL 322 shared ids across
  the FULL 8-field law (pos/yaw/scale/lib/kind/bbox/comp/compKeys) —
  FULLY QUIET, 4th consecutive epoch. Struct-family 72. gyroid
  da2a4b15 unchanged (tick-135 refine pending, s176 Sev-2 note open
  with owner); enneper ba17a712 unchanged (s181 judged+routed, owner
  refine pending).
- Selection law fresh, RECONCILED this tick: raw grep "OPEN" inside the
  SURVEY CANDIDATES tail returns 12 hits — all historical tick-record
  prose ("worst-first OPEN improve-own row", "OPEN LEFT HALF"), zero
  structured STATE-OPEN rows; NOT-YET-RE-JUDGED grep zero; SHARD
  section = routing law not open assignment (09-06 open-split list =
  known-stale s172-classified prose); survey candidate intake pool 0
  OPEN rows (drained); never-judged pool ZERO by set algebra (arrivals
  = 0, s180 derivation carries on byte-stable inputs); native-debt
  survey-executable EMPTY (gyroid pending-owner not survey debt;
  enneper debt PAID s181).
- No slice judged (arrival-gated, s138/s148/s150/s163/s168/s182/s183/
  s184 precedent): 0 confirmed / 0 clean / 0 dropped, 0 notes routed,
  0 vision calls (native-vs-fallback N/A). Tag survey-185 from plan
  sequence; no append per loop law 4.
- Foreign working-tree dirt at read = sibling lanes in flight (client/
  server sources, debug-bower, core-paths GLB + review json, HERO-ASSET
  plan, WINDMILL-OVERHAUL, cabin-overhaul, carousel-horse-prototype,
  fleet shells, terrain probes) — zero survey paths, zero staging
  contact, observer read-only per interlane law. Index clean (0
  staged) pre-append.
- Expected next work: arrival-gated; next slice when a census arrival
  or lib flip lands. Zero ledger append (loop law 4), zero world
  mutations, zero uploads, zero verbs, zero comp edits, zero
  shared-budget use (D+0, E+0).
"""

src = io.open(PLAN, encoding='utf-8').read()
assert MARKER not in src, 'block 185 already present'
assert src.rstrip().endswith('(D+0, E+0).'), (
    'unexpected EOF anchor: ' + src.rstrip()[-80:])
new = src.rstrip() + '\n' + BLOCK.lstrip('\n')
io.open(PLAN, 'w', encoding='utf-8').write(new)

# post-write verification (gates the commit)
out = io.open(PLAN, encoding='utf-8').read()
assert out.count(MARKER) == 1, 'marker count != 1'
idx = out.rindex('## Tick 184')
assert out.rindex(MARKER) > idx, 'block 185 not after 184'
delta = len(out) - len(src)
assert 2500 < delta < 3600, 'plan growth out of band: %d' % delta
print('APPEND OK marker-count=1 after-184 delta=%dB' % delta)
