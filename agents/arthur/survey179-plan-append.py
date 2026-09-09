#!/usr/bin/env python3
"""survey-179 plan-block append: insert-only-at-EOF under a unique anchor.
Asserts gate the write; post-write verification gates the commit."""
import re, sys

PLAN = 'agents/arthur/SURVEY-PLAN.md'
BLOCK = """
## Judged index (survey-179)

- survey-179 (2026-09-09, HOLD): 84th quiet hold, TENTH at the fully-quiet
  321-epoch (s178 state re-verified fresh, not assumed). Census 321 == 321
  (283 thing + 38 light, 0 dupes), raw fetch HTTP 200 94990 B, sha16
  d398ce05873ff941 (parent+tris schema fetch class, byte-identical to the
  s176/s177 fetch class). Set-diff vs committed sweep baseline
  agents/arthur/reviews/sweep-census-baseline.json (321 ents, sha16
  99e835ed lineage, sweep-181 arrival-fold): 0 arrivals / 0 departures
  / 0 field diffs / 0 lib flips across all 321 shared ids; gyroid lib
  unchanged da2a4b15 (struct tick-135 refine not landed - s176 Sev-2 note
  stays pending with owner); 71 struct-family entities live, three named
  recent markers (gyroid / harmonickiss / peaucellier) re-verified
  tuple-exact live in THIS census. Selection law fresh: SHARD EXECUTION
  heading absent (grep 0); STATE-OPEN / NOT-YET-RE-JUDGED grep zero matched
  lines; IMPROVE-PLAN md5 c0f569d0, git log last touch survey-78 (d2e5335b),
  clean in working tree - byte-identical to the file s172 regex-audited, so
  s172's disposition classification CARRIES with provenance (residual 30 =
  17 terminal survey-60/61 rows on Bill's overhaul bytes + 5 off-limits
  probe-only Bill's-call rows + 8 survey-63 routed dissent/corroborate
  probes; survey-executable open rows 0). Never-judged pool ZERO by set
  algebra (pool only grows via arrivals; arrivals=0). Native-debt
  survey-executable items EMPTY (peaucellier RETIRED s164; gyroid judged
  s176 with note routed, pending owner - not survey debt; fifthbench
  struct-owned decode debt; wayside-0030 family-closure dissent; survey-62
  hall/inn owner-dispositioned - owning lanes' to pay). No slice judged
  (pools empty, no debt owed, arrival-gated per s138/s148/s150/s163/s168
  precedent): 0 confirmed / 0 clean / 0 dropped, 0 notes routed, 0 vision
  calls (native-vs-fallback N/A). Gate ALL PASS real exit 0 first-try
  un-piped (GATE_EXIT:0 marker) at tick-start HEAD 834356b8 (ledger law
  EXACT 2370771). One probe self-catch disclosed: first census fetch used
  an unverified endpoint guess (HTTP 404, JSONDecodeError) - re-issued at
  the proven chassis URL /geom?world=commons-next, HTTP 200; read-only,
  no side effects, diff tool pinned to the proven survey178 chassis
  (tracked as survey179-census-diff.py). Tag from ledger max fresh: survey
  tail [survey-80], s151-s178 no-append per loop law 4; no routing this
  tick -> no append, plan-block sequence 179. Foreign working-tree dirt at
  read = sibling lanes in flight (client/server sources, debug-bower
  scripts, core-paths GLB + review json, HERO-ASSET plan, WINDMILL-
  OVERHAUL doc, cabin-overhaul, carousel-horse-prototype) - zero survey
  paths, zero staging contact, observer read-only per interlane law.
  Expected next work: arrival-gated; next slice when a census arrival or
  lib flip lands. Zero ledger append (loop law 4), zero world mutations,
  zero uploads, zero verbs, zero comp edits, zero shared-budget use
  (D+0, E+0).
"""

src = open(PLAN, encoding='utf-8').read()
assert src.count('## Judged index (survey-178)') == 1, 'anchor s178 not unique'
assert src.count('## Judged index (survey-179)') == 0, 'block s179 already present'
before_idx = len(re.findall(r'^## Judged index \(', src, flags=re.M))
BLOCK.encode('ascii')  # ascii assert, block-only (historical em-dashes live elsewhere)
if not src.endswith('\n'):
    src += '\n'
open(PLAN, 'w', encoding='utf-8').write(src + BLOCK.lstrip('\n'))

out = open(PLAN, encoding='utf-8').read()
after_idx = len(re.findall(r'^## Judged index \(', out, flags=re.M))
assert after_idx == before_idx + 1, f'index count {before_idx}->{after_idx}'
assert out.count('## Judged index (survey-179)') == 1, 's179 not exactly once'
assert out.rstrip('\n').endswith('(D+0, E+0).'), 'block not at EOF'
delta = len(out.encode('utf-8')) - len(src.encode('utf-8'))
print(f'OK judged-index {before_idx}->{after_idx} delta {delta}B (bytes, not chars)')
