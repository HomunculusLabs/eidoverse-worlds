#!/usr/bin/env python3
"""survey-263 plan append (read-only lane bookkeeping). Assert-gated per
waysign-19 / s199 self-catch law: unique anchor verified BEFORE write,
block-count + size verified AFTER. ##-header format (s260-s262 precedent)."""
import io
P = 'agents/arthur/SURVEY-PLAN.md'
s = io.open(P, encoding='utf-8').read()
assert s.count('## survey-262 (') == 1, 'anchor not unique: survey-262'
assert s.count('## survey-263 (') == 0, 'survey-263 already present'
before = len(s)
block = '''

## survey-263 (2026-09-10) — quiet hold, fleet pipeline tick (commissioned 2026-09-09 20:12:42)

- Gate: `bun agents/arthur/verify-repairs.ts` ALL PASS, real exit 0 first
  try at 2eb2b1d8 (own survey-262 at tip — epoch stable). Ledger law EXACT
  2370773 fresh (run 2370773, deltas 34771, closes True); ledger grep for
  survey-263 clean pre-append; quiet holds s261/s262 appended nothing
  (loop law 4), bracketed survey ledger max survey-260 by sort -V.
- Census: clean first fetch with the certified chassis URL
  /geom?world=commons-next → HTTP 200, 1.7s, 95543B, sha256-16
  d8fa3d8372b40ac7 — byte-identical to the survey-262 certified baseline
  by full checksum → 323==323, arrivals 0 / departures 0 / field-diffs 0
  by checksum identity — 32nd consecutive fully-quiet 323-epoch. No fetch
  anomaly this tick.
- Pools drained: IMPROVE-PLAN md5 c0f569d0 unchanged (211-263), 0 OPEN rows
  by row-grep, no SHARD EXECUTION section (153rd grep), candidates closed
  since survey-78, never-judged 0 by set algebra (arrivals 0).
- Arrival-gated: no slice judged (s138-s262 precedent) — 0 confirmed /
  0 clean / 0 dropped, 0 notes routed, 0 vision calls, native-vs-fallback
  N/A. Zero ledger append (loop law 4: append only when routing a note).
- Repo-side foreign dirt observed and untouched, unchanged set from
  survey-262 (client/server .ts/.js mods, WINDMILL-OVERHAUL.md,
  cabin-overhaul/, carousel-horse-prototype/, debug-bower scripts) — no
  world-epoch counterpart (census byte-quiet).
- STANDING RECOMMENDATION carried unchanged (s182-s262): stop the SURVEY
  lane or convert to a no-LLM monitor when attended.
- Census baseline for next tick: /tmp/survey263-census-a.json (323
  entities, /geom?world=commons-next raw shape, sha256-16 d8fa3d8372b40ac7).
  Zero world mutations, zero uploads, zero verbs, zero comp edits, zero
  shared-budget use (D+0, E+0).
'''
io.open(P, 'w', encoding='utf-8').write(s + block)
t = io.open(P, encoding='utf-8').read()
assert t.count('## survey-263 (') == 1, 'append failed'
assert t[:before] == s, 'prefix mutated'
print(f'APPENDED +{len(t) - before}B; survey-263 blocks={t.count("## survey-263 (")}; '
      f'plan size {len(t)}B')
