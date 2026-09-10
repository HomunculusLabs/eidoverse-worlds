#!/usr/bin/env python3
"""survey-271 plan append (read-only lane bookkeeping). Assert-gated per
waysign-19 / s199 self-catch law: unique anchor verified BEFORE write,
block-count + size verified AFTER. ##-header format (s260-s270 precedent)."""
import io
P = 'agents/arthur/SURVEY-PLAN.md'
s = io.open(P, encoding='utf-8').read()
assert s.count('## survey-270 (') == 1, 'anchor not unique: survey-270'
assert s.count('## survey-271 (') == 0, 'survey-271 already present'
before = len(s)
block = '''
## survey-271 (2026-09-10) — quiet hold, fleet pipeline tick (commissioned 2026-09-09 20:12:42)

- Gate: `bun agents/arthur/verify-repairs.ts` ALL PASS, real exit 0 first
  try at e7a96155 (own survey-270 at tip). HEAD advanced MID-TICK to
  6e6c00bf (sibling struct-148, tensegrity v5 banked NOT placed, zero
  world mutations — epoch law honored): gate re-run at new HEAD ALL PASS
  real exit 0. Ledger law accepted both runs (2370773 == 2370773); ledger
  grep survey-271 clean pre-check; bracketed survey ledger max
  [survey-81] (quiet holds append nothing, loop law 4); plan-section max
  survey-270 → this tick survey-271.
- Census: clean first fetch with the certified chassis URL
  /geom?world=commons-next → HTTP 200 (curl exit 0), 95543B, sha256-16
  d8fa3d8372b40ac7 — byte-identical to the survey-270 certified baseline
  by full checksum → 323==323, arrivals 0 / departures 0 / field-diffs 0
  by checksum identity — 40th consecutive fully-quiet 323-epoch. No fetch
  anomaly this tick. Independently corroborates struct-148's
  banked-not-placed claim (its ledger says D+0 E+0; census agrees).
- Pools drained: IMPROVE-PLAN md5 c0f569d0 unchanged (211-271), 0 OPEN
  rows by strict status-cell row-grep, no SHARD EXECUTION section (161st
  grep), candidates closed since survey-78, never-judged 0 by set algebra
  (arrivals 0).
- Arrival-gated: no slice judged (s138-s270 precedent) — 0 confirmed /
  0 clean / 0 dropped, 0 notes routed, 0 vision calls, native-vs-fallback
  N/A. Zero ledger append (loop law 4: append only when routing a note).
- Repo-side foreign dirt observed and untouched: struct-148's working
  files (mkv3-tensegrity.ts, next-place-struct145.ts,
  struct142-decode-tensegrity.ts) landed at HEAD via its commit; still
  dirty are client/server .ts/.js mods, WINDMILL-OVERHAUL.md,
  cabin-overhaul/, carousel-horse-prototype/, debug-bower scripts,
  HERO-ASSET-REFINEMENT-PLAN.md + SWEEP-PLAN.md mods, and untracked
  fleet/ + moon-moth/ — no world-epoch counterpart (census byte-quiet).
- STANDING RECOMMENDATION carried unchanged (s182-s270): stop the SURVEY
  lane or convert to a no-LLM monitor when attended.
- Census baseline for next tick: /tmp/survey271-census-a.json (323
  entities, /geom?world=commons-next raw shape, sha256-16 d8fa3d8372b40ac7).
  Zero world mutations, zero uploads, zero verbs, zero comp edits, zero
  shared-budget use (D+0, E+0).
'''
io.open(P, 'w', encoding='utf-8').write(s + block)
t = io.open(P, encoding='utf-8').read()
assert t.count('## survey-271 (') == 1, 'append failed'
assert t[:before] == s, 'prefix mutated'
print(f'APPENDED +{len(t) - before}B; survey-271 blocks={t.count("## survey-271 (")}; '
      f'plan size {len(t)}B')
