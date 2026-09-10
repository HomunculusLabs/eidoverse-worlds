#!/usr/bin/env python3
"""survey-235 plan append (read-only lane bookkeeping). Assert-gated per
waysign-19 / s199 self-catch law: unique anchor verified BEFORE write,
block-count + size verified AFTER. Bullet format (s233/s234 precedent)."""
import io
P = 'agents/arthur/SURVEY-PLAN.md'
s = io.open(P, encoding='utf-8').read()
assert s.count('- survey-234 (') == 1, 'anchor not unique: survey-234'
assert s.count('- survey-235 (') == 0, 'survey-235 already present'
before = len(s)
block = '''

- survey-235 (2026-09-10 01:5x, quiet hold — 4th consecutive fully-quiet
  323-epoch on the post-enneper baseline: census A/B 20s-paced, both
  214035B sha16 ed5856e6, byte-identical to the survey-234 certified
  baseline by shasum; set-diff 0 arrivals / 0 departures / 0 field-diffs
  / 0 lib-flips on 323 shared ids. Gate ALL PASS real exit 0 first try
  at 54fb6103 own survey-234 tip (ledger law EXACT 2370773). Pools
  drained: IMPROVE-PLAN md5 c0f569d0 unchanged ticks 211-235,
  never-judged 0 by set algebra (arrivals 0), SURVEY CANDIDATES 0 OPEN;
  shard 124th: no SHARD EXECUTION section, survey owns no prefix. No
  slice judged (arrival-gated, s138-s234 precedent): 0 confirmed /
  0 clean / 0 dropped, 0 notes routed, 0 vision calls, zero ledger
  append (loop law 4). STANDING RECOMMENDATION carried unchanged
  (s182-s234): stop or convert to a no-LLM monitor when attended.
  Foreign dirt at read = sibling lanes in flight (windmill overhaul
  WINDMILL-OVERHAUL.md + core-paths GLB/review + carousel placer +
  cabin-overhaul + carousel-horse-prototype + moon-moth + debug-bower
  scripts + fleet shell scripts + client/server trees dirty; windmill
  remains the likeliest next arrival/flip trigger — expect the census
  flip when it seats) — zero tracked survey paths dirty pre-append,
  observer read-only per interlane law. Census baseline for next tick:
  /tmp/survey235-census-B.json (323, sha16 ed5856e6). Expected next
  work: arrival-gated; next slice when a census arrival or lib flip
  lands. Zero ledger append, zero world mutations, zero uploads, zero
  verbs, zero comp edits, zero shared-budget use (D+0, E+0).
'''
io.open(P, 'w', encoding='utf-8').write(s + block)
t = io.open(P, encoding='utf-8').read()
assert t.count('- survey-235 (') == 1, 'append failed'
assert t[:before] == s, 'prefix mutated'
print(f'APPENDED +{len(t) - before}B; survey-235 blocks={t.count("- survey-235 (")}; '
      f'plan size {len(t)}B')
