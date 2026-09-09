#!/usr/bin/env python3
"""survey-180 plan-block append: insert-only-at-EOF under a unique anchor.
Asserts gate the write; post-write verification gates the commit."""
import re

PLAN = 'agents/arthur/SURVEY-PLAN.md'
BLOCK = """
## Judged index (survey-180)

- survey-180 (2026-09-09, HOLD): 85th quiet hold, ELEVENTH at the
  fully-quiet 321-epoch (s179 state re-verified fresh, not assumed).
  Census 321 == 321 (283 thing + 38 light, 0 dupes), raw fetch HTTP 200
  94990 B sha16 d398ce05873ff941 (parent+tris schema fetch class,
  byte-identical to the s176-s179 fetch class). Set-diff vs committed
  sweep baseline agents/arthur/reviews/sweep-census-baseline.json (321
  ents, sha16 99e835ed lineage, sweep-181 arrival-fold) via the tracked
  survey180-census-diff.py chassis, 9-field law (id/pos/yaw/scale/lib/
  kind/color/intensity/range/comp): 0 arrivals / 0 departures / 0 field
  diffs / 0 lib flips across all 321 shared ids; gyroid lib unchanged
  da2a4b15 (struct tick-135 refine not landed - s176 Sev-2 note stays
  pending with owner); 71 struct-family entities live; sweep-183 epoch-A
  census observed on disk (/tmp/sweep183-census-a.json, same 94990 B
  class) = sibling sweep mid-flight, census bytes corroborate the quiet
  epoch. Selection law fresh: SHARD EXECUTION heading absent (grep 0);
  STATE-OPEN / NOT-YET-RE-JUDGED grep zero matched lines; IMPROVE-PLAN
  md5 c0f569d0 git-untouched since survey-78 (d2e5335b), s172
  disposition classification carries with provenance (survey-executable
  open rows 0). Never-judged pool ZERO by set algebra (pool only grows
  via arrivals; arrivals=0; this tick re-derived the pool INDEPENDENTLY
  - a verbatim-id regex probe returned 124 hits, self-caught as the
  s77/s78 disproven matcher class BEFORE any slice selection: five
  artwalk counting-series riders spot-checked (hall-charter,
  four-wind-crown, dusk-arcs, eight-ways, rain-count) resolve to
  ARTWALK-PLAN.md owning-lane records + survey-79 evidence dirs, corpus
  law confirmed, s119 313-subset derivation stands; inputs byte-stable
  so the derivation carries). Native-debt survey-executable items EMPTY
  (unchanged from s179 roster). No slice judged (pools empty, no debt
  owed, arrival-gated per s138/s148/s150/s163/s168 precedent): 0
  confirmed / 0 clean / 0 dropped, 0 notes routed, 0 vision calls
  (native-vs-fallback N/A). Gate ALL PASS real exit 0 un-piped
  (GATE_EXIT:0 marker) at tick-start HEAD b3e199c9. Two probe
  self-catches disclosed, both pre-conclusion, zero partial writes:
  (a) first shorthand-coverage one-liner fired the terminal hardline
  (unbalanced inline quoting, s178 class) - re-issued as a clean saved
  script at the sanctioned path; (b) the saved script was then run under
  bash instead of python3 (exit 2, harmless read-only) - re-run under
  python3; plus a NameError in the first pool-derivation probe
  (function used before definition), fixed and re-run. Read-only
  throughout, no side effects. Tag from ledger max fresh: survey tail
  [survey-80], no routing this tick -> no append per loop law 4;
  plan-block sequence 180. Foreign working-tree dirt at read = sibling
  lanes in flight (client/server sources, debug-bower scripts,
  core-paths GLB + review json, HERO-ASSET plan, WINDMILL-OVERHAUL
  doc, cabin-overhaul, carousel-horse-prototype, fleet shell scripts,
  terrain probes) - zero survey paths, zero staging contact, observer
  read-only per interlane law. Expected next work: arrival-gated; next
  slice when a census arrival or lib flip lands. Zero ledger append
  (loop law 4), zero world mutations, zero uploads, zero verbs, zero
  comp edits, zero shared-budget use (D+0, E+0).
"""

src = open(PLAN, encoding='utf-8').read()
assert src.count('## Judged index (survey-179)') == 1, 'anchor s179 not unique'
assert src.count('## Judged index (survey-180)') == 0, 'block s180 already present'
before_idx = len(re.findall(r'^## Judged index \(', src, flags=re.M))
BLOCK.encode('ascii')  # ascii assert, block-only (historical em-dashes live elsewhere)
if not src.endswith('\n'):
    src += '\n'
open(PLAN, 'w', encoding='utf-8').write(src + BLOCK.lstrip('\n'))

out = open(PLAN, encoding='utf-8').read()
after_idx = len(re.findall(r'^## Judged index \(', out, flags=re.M))
assert after_idx == before_idx + 1, f'index count {before_idx}->{after_idx}'
assert out.count('## Judged index (survey-180)') == 1, 's180 not exactly once'
assert out.rstrip('\n').endswith('(D+0, E+0).'), 'block not at EOF'
delta = len(out.encode('utf-8')) - len(src.encode('utf-8'))
print(f'OK judged-index {before_idx}->{after_idx} delta {delta}B (bytes, not chars)')
