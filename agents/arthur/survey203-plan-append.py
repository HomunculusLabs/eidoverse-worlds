#!/usr/bin/env python3
"""survey-203 plan append (read-only lane bookkeeping). Assert-gated per
waysign-19 / s199 self-catch law: unique anchor verified BEFORE write,
block-count + size verified AFTER."""
import io
P = 'agents/arthur/SURVEY-PLAN.md'
s = io.open(P, encoding='utf-8').read()
assert s.count('## Tick 202 (') == 1, 'anchor not unique: Tick 202'
assert s.count('## Tick 203 (') == 0, 'Tick 203 already present'
before = len(s)
block = '''
## Tick 203 (2026-09-09 22:07 EDT) — HOLD, 107th quiet hold, 22nd at 322-epoch

- Gate at HEAD real exit 0 first try (ALL PASS at c7353e16 = own survey-202
  tip; no sibling advance this epoch, HEAD-check law green).
- Census fresh (curl UA): A/B epochs 20s-paced, both 95267B raw sha16
  551d9f029269a6b4 BYTE-IDENTICAL (first-try clean fetches, canonical
  /geom); set-diff vs committed sweep-183 fold baseline (322) via tracked
  survey203-census-diff.py (s202 chassis verbatim, full 8-field law,
  projection-canonical compKeys): 0 arrivals / 0 departures / 0 field-diffs
  / 0 lib-flips on ALL 322 shared ids — FULLY QUIET, 22nd consecutive
  epoch. Struct-family 72 unchanged. gyroid/enneper owner-pending unchanged
  (enneper v2 banked-not-placed per struct-135, Bill-gated; struct NEXT
  136/138 still uncommitted — in-flight sibling work, not arrivals).
- Selection pools drained: never-judged 0 by set algebra (arrivals 0);
  IMPROVE-PLAN md5 c0f569d0 byte-identical to tick-202 record (no sibling
  edit; STATE-OPEN 0 global, SURVEY CANDIDATES OPEN classes carry);
  native-debt survey-executable empty.
- No slice judged (arrival-gated, s138–s202 precedent): 0 confirmed /
  0 clean / 0 dropped, 0 notes routed, 0 vision calls (native-vs-fallback
  N/A). Tag survey-203 from plan sequence; no ledger append per loop law 4.
- STANDING RECOMMENDATION (surface once, s182–s202 carry unchanged): 22
  consecutive fully-quiet 322-epochs — every selection pool drained,
  owner-pending items Bill-gated, each unattended hold tick spends a full
  turn of tokens for an identical quiet verdict. Stop or convert to a
  no-LLM monitor when attended.
- Foreign working-tree dirt at read = sibling lanes in flight (windmill/
  cabin overhaul dirs, client/server trees) — zero pre-existing survey
  paths dirty, zero staging contact, observer read-only per interlane
  law. Expected next work: arrival-gated; next slice when a census
  arrival or lib flip lands. Zero ledger append, zero world mutations,
  zero uploads, zero verbs, zero comp edits, zero shared-budget use
  (D+0, E+0).
'''
io.open(P, 'w', encoding='utf-8').write(s + block)
t = io.open(P, encoding='utf-8').read()
assert t.count('## Tick 203 (') == 1, 'append failed'
assert t[:before] == s, 'prefix mutated'
print(f'APPENDED +{len(t) - before}B; Tick 203 blocks={t.count("## Tick 203 (")}; '
      f'plan size {len(t)}B')
