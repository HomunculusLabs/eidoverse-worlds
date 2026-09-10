#!/usr/bin/env python3
"""survey-197 plan-block append (insert-only-at-EOF, asserted).
Block 197 -> SURVEY-PLAN.md EOF. Asserts gate the write; post-write
verification gates the commit. No routing this tick -> no ledger append
(loop law 4), no other lane's plan touched."""
import io

PLAN = 'agents/arthur/SURVEY-PLAN.md'
MARKER = '## Tick 197 (2026-09-09 21:4x EDT) — HOLD, 101st quiet hold, 16th at 322-epoch'
BLOCK = """
## Tick 197 (2026-09-09 21:4x EDT) — HOLD, 101st quiet hold, 16th at 322-epoch
- Gate: ALL PASS real exit 0 un-piped (GATE_EXIT:0 marker) first try at
  tick-start HEAD bd35f9b0 (own survey-196 at tip; ledger law EXACT
  2370772). Interlane md5 f6254cd0 unchanged; IMPROVE-PLAN md5 c0f569d0
  unchanged (STATE-OPEN grep = 0, NOT-YET-RE-JUDGED = 0, SHARD EXECUTION
  heading absent; never-judged pool ZERO by set algebra, arrivals = 0).
- Census fresh (curl UA): 322 entities (284 thing + 38 light, 0 dupes), A/B
  epochs 20s-paced both 95267B, raw sha16 551d9f029269a6b4
  BYTE-IDENTICAL — the s182-s196 fetch class. ONE DNS hard-fail
  (curl exit 6, 'Could not resolve host: eidoverse.app' on a stale
  hostname guess) resolved by the skill's one-paced-retry law on the
  canonical /geom endpoint: first fetch on the correct
  eidoverse.billding.dev URL succeeded clean — classified gateway/DNS
  noise, not drift evidence. Set-diff vs committed sweep-183 fold
  baseline (322, ca2a1883 lineage) via tracked survey197-census-diff.py
  (s196 chassis verbatim, full 8-field law pos/yaw/scale/lib/kind/bbox/
  comp/compKeys, projection-canonical compKeys): 0 arrivals / 0
  departures / 0 field diffs / 0 lib flips on ALL 322 shared ids —
  FULLY QUIET, 16th consecutive epoch. Struct-family 72. gyroid
  da2a4b15 unchanged (tick-135 refine pending, s176 Sev-2 note open
  with owner); enneper ba17a712 unchanged (s181 judged+routed; owner
  v2 banked-not-placed per struct-135 — owner pending, Bill-gated
  placement).
- Selection law fresh: never-judged pool ZERO by set algebra (arrivals=0,
  s180 derivation carries on byte-stable inputs); SURVEY CANDIDATES raw
  OPEN grep class unchanged on md5-identical file so s185's prose-only
  reconciliation carries (zero structured STATE-OPEN rows); native-debt
  survey-executable EMPTY (gyroid+enneper pending-owner, not survey
  debt; enneper debt PAID s181).
- No slice judged (arrival-gated, s138/s148/s150/s163/s168/s182-196
  precedent): 0 confirmed / 0 clean / 0 dropped, 0 notes routed,
  0 vision calls (native-vs-fallback N/A). Tag survey-197 from plan
  sequence; no append per loop law 4.
- STANDING RECOMMENDATION (surface once, s182-196 carry unchanged):
  16 consecutive fully-quiet 322-epochs — every selection pool drained,
  owner-pending items are Bill-gated, and each unattended hold tick
  spends a full turn of tokens for an identical quiet verdict. Stop or
  convert to a no-LLM monitor when attended.
- Foreign working-tree dirt at read = sibling lanes in flight —
  zero pre-existing survey paths dirty, zero staging contact, observer
  read-only per interlane law. Index clean (0 staged) pre-commit; only
  own tick files staged for the survey-197 commit.
- Expected next work: arrival-gated; next slice when a census arrival or
  lib flip lands. Zero ledger append (loop law 4), zero world mutations,
  zero uploads, zero verbs, zero comp edits, zero shared-budget use
  (D+0, E+0).
"""

src = io.open(PLAN, encoding='utf-8').read()
assert MARKER not in src, 'block 197 already present'
assert src.rstrip().endswith('(D+0, E+0).'), (
    'unexpected EOF anchor: ' + src.rstrip()[-80:])
new = src.rstrip() + '\n' + BLOCK.lstrip('\n')
io.open(PLAN, 'w', encoding='utf-8').write(new)

# post-write verification (gates the commit)
out = io.open(PLAN, encoding='utf-8').read()
assert out.count(MARKER) == 1, 'marker count != 1'
idx = out.rindex('## Tick 196')
assert out.rindex(MARKER) > idx, 'block 197 not after 196'
delta = len(out) - len(src)
assert 2500 < delta < 3600, 'plan growth out of band: %d' % delta
print('APPEND OK marker-count=1 after-196 delta=%dB' % delta)
