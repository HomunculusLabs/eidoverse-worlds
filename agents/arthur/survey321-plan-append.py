#!/usr/bin/env python3
"""survey-321 plan append (read-only quiet hold). Pure EOF append with
unique-anchor asserts (s310 self-catch class avoided by construction).
Asserts GATE the commit: any failure exits nonzero and nothing is written
or committed."""
import sys

PLAN = '/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/SURVEY-PLAN.md'

with open(PLAN) as f:
    s = f.read()

# Unique-anchor asserts: exactly one prior quiet-hold section head for 320,
# no 321 section already present (stacked-wakeup race guard), plan ends with
# the s320 recommendation tail.
assert s.count('## Judged index (survey-320)') == 1, 'anchor survey-320 not unique'
assert s.count('## Judged index (survey-321)') == 0, 'survey-321 already present'
assert s.rstrip().endswith('when attended.'), 'unexpected plan tail'

section = '''

## Judged index (survey-321)

- survey-321 (2026-09-10, quiet hold): gate ALL PASS real exit 0 first
  try at c951696f (struct-160 boy v2 build+judge banked-not-placed at
  tip — zero-mutation tick; sweep-227 + survey-320 behind; ledger max
  [survey-312] -> this tick survey-321; plan-section max survey-320 ->
  survey-321). Census via committed next-live-census.ts exit 0, 215224B
  sha256-16 f78fdcb6b2407ef0 BYTE-IDENTICAL to the s320 baseline
  (cmp-verified against /tmp/survey320-census-a.json, not sha-alone):
  325==325 ids, 0 arrivals / 0 departures / 0 substantive field diffs
  (8-field law pos/yaw/scale/lib/kind/bbox/comp/compKeys) on all 325
  shared ids — NINTH consecutive fully-quiet tick of the 325-entity
  epoch. Pools: IMPROVE-PLAN md5 c0f569d0 verified unchanged (209th
  check; 0 SHARD EXECUTION rows, 209th grep; 0 live-queue OPEN rows —
  19 raw 'OPEN' hits grep-classified as prose/heading text), candidates
  closed since survey-78, never-judged pool 0 by set algebra (unchanged
  md5 carries the prior derivation), interlane md5 f6254cd0 stable.
  Arrival-gated no slice (s138-s320 precedent — no new bytes to read,
  not manufactured). 0 notes routed, 0 vision calls, ZERO ledger
  append (loop law 4: append only when routing). Repo-side foreign dirt
  observed and untouched (same family as s285-s320: client/server
  .ts/.js mods, WINDMILL-OVERHAUL.md, cabin-overhaul/,
  carousel-horse-prototype/, debug-bower scripts, fleet scripts;
  moon-moth/, next-terrain-city4, next-terrain-struct-millrace/orrery,
  place-windmill-overhaul, review-improve19-pixels — all foreign-lane
  work-in-flight, left alone). Census baseline for next tick:
  /tmp/survey321-census-a.json (325, sha256-16 f78fdcb6b2407ef0).
  STANDING RECOMMENDATION carried unchanged (s182-s320): stop the
  SURVEY lane or convert to a no-LLM monitor when attended.
'''

with open(PLAN, 'a') as f:
    f.write(section)

with open(PLAN) as f:
    check = f.read()
assert check.count('## Judged index (survey-321)') == 1, 'post-write uniqueness'
assert check.rstrip().endswith('when attended.'), 'post-write tail'
print('APPEND_OK survey-321 block written; sections=',
      check.count('## Judged index (survey-'))
