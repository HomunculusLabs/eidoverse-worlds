#!/usr/bin/env python3
"""survey-211 plan append (read-only lane bookkeeping). Assert-gated per
waysign-19 / s199 self-catch law: unique anchor verified BEFORE write,
block-count + size verified AFTER."""
import io
P = 'agents/arthur/SURVEY-PLAN.md'
s = io.open(P, encoding='utf-8').read()
assert s.count('## Tick 210 (') == 1, 'anchor not unique: Tick 210'
assert s.count('## Tick 211 (') == 0, 'Tick 211 already present'
before = len(s)
block = '''

## Tick 211 (2026-09-09 22:53 EDT) — HOLD, 115th quiet hold, 30th at 322-epoch

- Gate at HEAD real exit 0 first try (ALL PASS at 57b10ebb = own survey-210
  tip; no sibling advance this epoch, HEAD-check law green; ledger law EXACT
  2370772 in gate output).
- Census fresh (curl UA, canonical https://eidoverse.billding.dev/geom?world=commons-next):
  A/B epochs 20s-paced, both 95267B raw sha16 551d9f029269a6b4
  BYTE-IDENTICAL (first-try clean fetches, HTTP 200 both; byte-identical to
  the sweep-183 baseline-generating bytes); set-diff vs committed sweep-183
  fold baseline (322) via tracked survey211-census-diff.py: 0 arrivals /
  0 departures / 0 field-diffs / 0 lib-flips on ALL 322 shared ids —
  FULLY QUIET, 30th consecutive epoch. Struct-family 72 unchanged.
- One in-tick self-catch (chassis transcription, not world state): the new
  survey211-census-diff.py first printed "departures 322" — contradicted
  in the SAME output by "field-diffs 0 on 322 shared ids" (all 322 shared
  ⇒ no departures possible); diff vs survey210 chassis found line 29
  `sorted(aids)` where the s210 original has `sorted(aids - bids)`.
  Fixed, re-run: 0/0/0/0 exit 0. Zero classifications or world-affecting
  outputs consumed the buggy print (self-caught at first read, raw-output
  inspection law). The buggy copy never left this tick and is committed
  fixed.
- Selection pools drained: never-judged 0 by set algebra (arrivals 0);
  IMPROVE-PLAN md5 c0f569d0 byte-identical to tick-210 record (no sibling
  edit; STATE-OPEN 0 global, SURVEY CANDIDATES OPEN classes carry);
  native-debt survey-executable empty. Shard check (fleet-tick law):
  EXECUTION SHARDING section routes by entity prefix; survey owns no
  prefix and no candidate rows (observer) — no survey-executable shard
  work (100th consecutive per-tick check).
- No slice judged (arrival-gated, s138–s210 precedent): 0 confirmed /
  0 clean / 0 dropped, 0 notes routed, 0 vision calls (native-vs-fallback
  N/A). Tag survey-211 from plan sequence (ledger max re-checked:
  bracketed [survey-81] is max in IMPROVEMENTS.md, no survey-211 string
  anywhere in ledger; no ledger append per loop law 4).
- STANDING RECOMMENDATION (surface once, s182–s210 carry unchanged): 30
  consecutive fully-quiet 322-epochs — every selection pool drained,
  owner-pending items Bill-gated, each unattended hold tick spends a full
  turn of tokens for an identical quiet verdict. Stop or convert to a
  no-LLM monitor when attended.
- Foreign working-tree dirt at read = sibling lanes in flight (windmill
  overhaul + WINDMILL-OVERHAUL.md, cabin/carousel/moon-moth dirs,
  client/server trees) — zero pre-existing survey paths dirty, zero
  staging contact, observer read-only per interlane law. Expected next
  work: arrival-gated; next slice when a census arrival or lib flip
  lands. Zero ledger append, zero world mutations, zero uploads, zero
  verbs, zero comp edits, zero shared-budget use (D+0, E+0).
'''
io.open(P, 'w', encoding='utf-8').write(s + block)
t = io.open(P, encoding='utf-8').read()
assert t.count('## Tick 211 (') == 1, 'append failed'
assert t[:before] == s, 'prefix mutated'
print(f'APPENDED +{len(t) - before}B; Tick 211 blocks={t.count("## Tick 211 (")}; '
      f'plan size {len(t)}B')
