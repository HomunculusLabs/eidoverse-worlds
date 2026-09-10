#!/usr/bin/env python3
"""survey-201 plan append (read-only lane bookkeeping). Assert-gated per
waysign-19 / s199 self-catch law: unique anchor verified BEFORE write,
block-count + size verified AFTER."""
import io, sys
P = 'agents/arthur/SURVEY-PLAN.md'
s = io.open(P, encoding='utf-8').read()
assert s.count('## Tick 200 (') == 1, 'anchor not unique: Tick 200'
assert s.count('## Tick 201 (') == 0, 'Tick 201 already present'
before = len(s)
block = '''
## Tick 201 (2026-09-10 0x:xx EDT) — HOLD, 105th quiet hold, 20th at 322-epoch

- Gate at HEAD real exit 0 first try (ALL PASS at 435314f9 = own survey-200
  tip; no sibling advance this epoch, HEAD-check law green).
- Census fresh (curl UA): A/B epochs 20s-paced, both 95267B raw sha16
  551d9f029269a6b4 BYTE-IDENTICAL (first-try clean fetches, canonical
  /geom); set-diff vs committed sweep-183 fold baseline (322) via tracked
  survey201-census-diff.py (s200 chassis verbatim, full 8-field law,
  projection-canonical compKeys): 0 arrivals / 0 departures / 0 field-diffs
  / 0 lib-flips on ALL 322 shared ids — FULLY QUIET, 20th consecutive
  epoch. Struct-family 72 unchanged. gyroid/enneper owner-pending
  unchanged (enneper v2 banked-not-placed per struct-135, Bill-gated).
- Selection pools drained: never-judged 0 by set algebra (arrivals 0);
  SURVEY CANDIDATES raw OPEN grep 0; STATE-OPEN 0; IMPROVE-PLAN md5
  c0f569d0 unchanged from tick-200 (byte-identical, no sibling edit).
- No slice judged (arrival-gated, s138–s200 precedent): 0 confirmed /
  0 clean / 0 dropped, 0 notes routed, 0 vision calls (native-vs-fallback
  N/A). Tag survey-201 from plan sequence; no ledger append per loop law 4.
- STANDING RECOMMENDATION (surface once, s182–s200 carry unchanged): 20
  consecutive fully-quiet 322-epochs — every selection pool drained,
  owner-pending items Bill-gated, each unattended hold tick spends a full
  turn of tokens for an identical quiet verdict. Stop or convert to a
  no-LLM monitor when attended.
- Foreign working-tree dirt at read = sibling lanes in flight — zero
  pre-existing survey paths dirty, zero staging contact, observer
  read-only per interlane law. Expected next work: arrival-gated; next
  slice when a census arrival or lib flip lands. Zero ledger append,
  zero world mutations, zero uploads, zero verbs, zero comp edits, zero
  shared-budget use (D+0, E+0).
'''
io.open(P, 'w', encoding='utf-8').write(s + block)
t = io.open(P, encoding='utf-8').read()
assert t.count('## Tick 201 (') == 1, 'append failed'
assert t[:before] == s, 'prefix mutated'
d = len(t) - before
assert 1500 < d < 2500, f'block size {d} out of expected band'
print(f'APPEND OK +{d}B, Tick-201 blocks={t.count("## Tick 201 (")}')
