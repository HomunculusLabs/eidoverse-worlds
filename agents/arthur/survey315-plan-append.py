#!/usr/bin/env python3
"""survey-315 plan append (read-only quiet hold). Pure EOF append with
unique-anchor asserts (s310 self-catch class avoided by construction).
Asserts GATE the commit: any failure exits nonzero and nothing is written
or committed."""
import sys

PLAN = '/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/SURVEY-PLAN.md'

with open(PLAN) as f:
    s = f.read()

# Unique-anchor asserts: exactly one prior quiet-hold section head for 314,
# no 315 section already present (stacked-wakeup race guard), plan ends with
# the s314 recommendation tail.
assert s.count('## Judged index (survey-314)') == 1, 'anchor survey-314 not unique'
assert s.count('## Judged index (survey-315)') == 0, 'survey-315 already present'
assert s.rstrip().endswith('when attended.'), 'unexpected plan tail'

section = '''

## Judged index (survey-315)

- survey-315 (2026-09-10, quiet hold): gate ALL PASS real exit 0 first
  try at 12021733 (sweep-226 + survey-314 at HEAD; ledger max
  [survey-312] -> this tick survey-315; plan-section max survey-314 ->
  survey-315). Census via committed next-live-census.ts exit 0, 215224B
  sha256-16 f78fdcb6b2407ef0 BYTE-IDENTICAL to the s314 baseline
  (325-entity post-struct-158 epoch): 325==325 ids, 0 arrivals /
  0 departures / 0 substantive field diffs (8-field law
  pos/yaw/scale/lib/kind/bbox/comp/compKeys, projection-canonical
  compKeys) on all 325 shared ids — THIRD consecutive fully-quiet tick
  of the 325-entity epoch. Diff tool survey315-census-diff.py folded
  from committed survey298-census-diff.py chassis (BASE/LIVE swap,
  py_compile clean, clean exit 0). Pools: IMPROVE-PLAN md5 c0f569d0
  verified unchanged (203rd check; 0 SHARD EXECUTION rows, 203rd grep;
  0 live-queue OPEN rows), candidates closed since survey-78,
  never-judged pool 0 by set algebra (unchanged md5 carries the prior
  derivation), interlane md5 f6254cd0 stable. Arrival-gated no slice
  (s138-s314 precedent — no new bytes to read, not manufactured).
  0 notes routed, 0 vision calls, ZERO ledger append (loop law 4:
  append only when routing). Repo-side foreign dirt observed and
  untouched (same family as s285-s314: client/server .ts/.js mods,
  WINDMILL-OVERHAUL.md, cabin-overhaul/, carousel-horse-prototype/,
  debug-bower scripts, fleet scripts). Census baseline for next tick:
  /tmp/survey315-census-a.json (325, sha256-16 f78fdcb6b2407ef0).
  STANDING RECOMMENDATION carried unchanged (s182-s314): stop the
  SURVEY lane or convert to a no-LLM monitor when attended.
'''

with open(PLAN, 'a') as f:
    f.write(section)

with open(PLAN) as f:
    s2 = f.read()
assert s2.count('## Judged index (survey-315)') == 1, 'post-append presence'
assert len(s2) == len(s) + len(section), 'post-append size'
print('APPENDED survey-315 section,', len(section), 'bytes')
