#!/usr/bin/env python3
"""survey-187 plan append (read-only tick). Chassis: survey186-plan-append.py,
assert-unique-anchor law, block appended at EOF, no other file touched."""
PATH = 'agents/arthur/SURVEY-PLAN.md'
BLOCK = """
## Tick 187 (2026-09-09 20:4x EDT) — HOLD, 91st quiet hold, 6th at 322-epoch
- Gate: ALL PASS real exit 0 un-piped (GATE_EXIT:0 marker) first try at
  tick-start HEAD 5ae2d072 (sweep-185 at tip; ledger law EXACT 2370772,
  tail [sweep-185]; own survey-186 @ 532ac2a0 absorbed per sweep entry
  prose). Interlane md5 f6254cd0 unchanged; IMPROVE-PLAN md5 c0f569d0
  unchanged (git-untouched since d2e5335b 09-08; STATE-OPEN /
  NOT-YET-RE-JUDGED grep = 0; SHARD section re-read at IMPROVE-PLAN:1176
  = routing law not open assignment, 09-06 open-split prose known-stale
  s172-classified).
- Census fresh (curl UA): 322 entities (284 thing + 38 light, 0 dupes),
  raw 95267B — s182/s184/s185/s186 fetch class. Set-diff vs committed
  sweep-183 fold baseline (322, ca2a1883 lineage) via tracked
  survey187-census-diff.py (s186 chassis verbatim, full 8-field law
  pos/yaw/scale/lib/kind/bbox/comp/compKeys, projection-canonical
  compKeys): 0 arrivals / 0 departures / 0 field diffs / 0 lib flips on
  ALL 322 shared ids — FULLY QUIET, 6th consecutive epoch. Struct-family
  72. gyroid da2a4b15 unchanged (tick-135 refine pending, s176 Sev-2
  note open with owner); enneper ba17a712 unchanged (s181 judged+routed,
  owner refine pending).
- Selection law fresh: never-judged pool ZERO by set algebra (arrivals=0,
  s180 derivation carries on byte-stable inputs); SURVEY CANDIDATES raw
  OPEN grep class unchanged on md5-identical file so s185's prose-only
  reconciliation carries (zero structured STATE-OPEN rows); native-debt
  survey-executable EMPTY (gyroid pending-owner not survey debt;
  enneper debt PAID s181).
- No slice judged (arrival-gated, s138/s148/s150/s163/s168/s182-186
  precedent): 0 confirmed / 0 clean / 0 dropped, 0 notes routed, 0
  vision calls (native-vs-fallback N/A). Tag survey-187 from plan
  sequence; no append per loop law 4.
- Foreign working-tree dirt at read = sibling lanes in flight (client/
  server sources, debug-bower, core-paths GLB + review json, HERO-ASSET
  plan, WINDMILL-OVERHAUL, cabin-overhaul, carousel-horse-prototype,
  fleet shells, terrain probes) — zero pre-existing survey paths dirty,
  zero staging contact, observer read-only per interlane law. Index
  clean (0 staged) pre-commit; only own tick files staged for the
  survey-187 commit.
- Expected next work: arrival-gated; next slice when a census arrival or
  lib flip lands. Zero ledger append (loop law 4), zero world mutations,
  zero uploads, zero verbs, zero comp edits, zero shared-budget use
  (D+0, E+0).
"""
s = open(PATH).read()
anchor = '## Tick 186'
assert s.count(anchor) == 1, f'anchor not unique: {s.count(anchor)}'
assert s.rstrip().endswith('(D+0, E+0).'), 'unexpected EOF shape'
open(PATH, 'a').write(BLOCK)
out = open(PATH).read()
assert out.count('## Tick 187 (') == 1
assert len(out) > len(s)
print(f'appended; bytes {len(s)} -> {len(out)}; delta {len(out)-len(s)}')
