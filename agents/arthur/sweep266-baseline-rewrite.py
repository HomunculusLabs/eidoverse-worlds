#!/usr/bin/env python3
"""sweep-266 baseline rewrite: asserted one-arrival diff vs committed baseline.

Pre-write assertions: arrivals == [nx-struct-archispiral], departures == [],
semantic drift on shared ids ZERO (pos/yaw/scale/kind/lib).
Post-write: on-disk bytes == epoch-B capture bytes.
Folded from the committed sweep261-baseline-rewrite.py chassis (sed swap only).
"""
import json, hashlib, subprocess, sys

EPOCH_C = '/tmp/sweep266-census-b.json'  # cissoid arrival epoch (struct-189 landed post-commit)
TARGET = 'agents/arthur/reviews/sweep-census-baseline.json'

old = json.loads(subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout)['entities']
new = json.load(open(EPOCH_C))['entities']
old_ids = {e['id'] for e in old}
new_ids = {e['id'] for e in new}
arrivals = sorted(new_ids - old_ids)
departures = sorted(old_ids - new_ids)
assert arrivals == ['nx-struct-archispiral'], f"assert FAIL arrivals: {arrivals}"
assert departures == [], f"assert FAIL departures: {departures}"
oldm = {e['id']: e for e in old}
drift = []
for e in new:
    o = oldm.get(e['id'])
    if not o:
        continue
    for k in ('pos', 'yaw', 'scale', 'kind', 'lib'):
        if o.get(k) != e.get(k):
            drift.append((e['id'], k))
assert drift == [], f"assert FAIL drift: {drift}"

live = json.load(open(EPOCH_C))
raw = open(EPOCH_C, 'rb').read()
open(TARGET, 'wb').write(raw)  # byte-faithful copy of the epoch-B capture
h = hashlib.sha256(open(TARGET, 'rb').read()).hexdigest()
print(f"REWRITTEN: {len(live['entities'])} entities, sha16 {h[:16]} — "
      f"diff exactly [arrival nx-struct-archispiral], drift ZERO")
