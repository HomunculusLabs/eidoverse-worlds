#!/usr/bin/env python3
"""survey-283 plan append — quiet hold block, assert-gated (lane law)."""
import sys, pathlib

PLAN = pathlib.Path("agents/arthur/SURVEY-PLAN.md")
text = PLAN.read_text()

# --- asserts BEFORE write (gate the commit, not just the write) ---
assert text.count("## survey-282 (2026-09-10) — quiet hold") == 1, "anchor survey-282 not unique"
assert text.count("## survey-283") == 0, "survey-283 block already exists"
assert text.rstrip().endswith("(D+0, E+0)."), "unexpected tail — re-read plan before append"

block = """
## survey-283 (2026-09-10) — quiet hold, fleet pipeline tick (commissioned 2026-09-09 20:12:42)

- Gate: `bun agents/arthur/verify-repairs.ts` ALL PASS, real exit 0 first
  try, observed HEAD 3619d643 (survey-282 tip, own lane). Ledger law
  accepted by gate (2370773 == 2370773); ledger grep survey-283 clean
  pre-check (0 matches in SURVEY-PLAN.md and IMPROVEMENTS.md); bracketed
  survey ledger max [survey-81] (quiet holds append nothing, loop law 4);
  plan-section max survey-282 → this tick survey-283.
- Census: clean first fetch with the certified chassis URL
  /geom?world=commons-next → HTTP 200, 1.78s, 95543B, sha256-16
  d8fa3d8372b40ac7 — byte-identical to the survey-282 certified baseline
  by full-file checksum (cmp exit 0) → 323==323, arrivals 0 /
  departures 0 — 52nd consecutive fully-quiet 323-epoch. No fetch
  anomaly this tick.
- Pools drained: IMPROVE-PLAN md5 c0f569d0 unchanged (211-283), 0 OPEN
  rows, no SHARD EXECUTION section (173rd grep), candidates closed since
  survey-78, never-judged 0 by set algebra (arrivals 0). Interlane
  f6254cd0 stable.
- Arrival-gated: no slice judged (s138-s282 precedent) — 0 confirmed /
  0 clean / 0 dropped, 0 notes routed, 0 vision calls, native-vs-fallback
  N/A. Zero ledger append (loop law 4: append only when routing a note).
- Repo-side foreign dirt observed and untouched (client/server .ts/.js
  mods, WINDMILL-OVERHAUL.md, cabin-overhaul/, carousel-horse-prototype/,
  debug-bower scripts, HERO-ASSET-REFINEMENT-PLAN.md mod, village_next_
  core_paths + gyroid assets, next-place-carousel, untracked fleet/ +
  moon-moth/, terrain scripts, approach4/5 review dirs) — no world-epoch
  counterpart (census byte-quiet).
- STANDING RECOMMENDATION carried unchanged (s182-s282): stop the SURVEY
  lane or convert to a no-LLM monitor when attended.
- Census baseline for next tick: /tmp/survey283-census-a.json (323
  entities, /geom?world=commons-next raw shape, sha256-16 d8fa3d8372b40ac7).
  Zero world mutations, zero uploads, zero verbs, zero comp edits, zero
  shared-budget use (D+0, E+0).
"""

before = len(text)
PLAN.write_text(text.rstrip() + "\n" + block.lstrip("\n"))
after_text = PLAN.read_text()
delta = len(after_text) - before

# --- verify written file ---
assert after_text.count("## survey-283 (2026-09-10) — quiet hold") == 1, "block not appended exactly once"
assert 800 < delta < 2500, f"delta {delta}B outside expected quiet-block growth"
print(f"APPENDED survey-283 block OK | delta {delta}B | blocks survey-282:1 survey-283:1")
sys.exit(0)
