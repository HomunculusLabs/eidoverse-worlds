#!/usr/bin/env python3
"""sweep-91 snapshot rewrite: 7-field projection like-for-like, epoch C final (291).
Arrivals exactly [nx-dress-sw-lanternhook-001] (dress-108 v5, in-tree placer
sw-dress108-lanternhook-place.ts pins sha 639c5480 @ (-57,PY,-70) yaw 282.34deg,
live yaw 4.927732 rad == 282.34deg exact, commit pending) + [nx-struct-chainvault]
(struct-85, in-tree placer next-place-struct85.ts pins POS/YAW/sha full-256
8fecf67d..., commit pending); zero departures, zero drift on 289 shared ids."""
import json, hashlib, subprocess


def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents


d_new, ents_new = load('/tmp/sweep91-c.json')  # epoch C final (291)

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep91-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep91-committed-baseline.json')

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-dress-sw-lanternhook-001', 'nx-struct-chainvault'}, sorted(arrivals)
assert not departures, sorted(departures)
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
print('ASSERT OK: arrivals exactly [lanternhook (dress-108, uncommitted-placer class), '
      'chainvault (struct-85, uncommitted-placer class)]; 0 departures; 0 drift on 289 shared ids')


def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o


old_order = [e['id'] for e in d_old['entities']]
out_ids = set(old_order) | arrivals
assert set(ents_new) == out_ids, 'id set mismatch'
out = {'world': 'commons-next', 'count': len(old_order) + len(arrivals),
       'entities': [proj(ents_new[i]) for i in old_order]
       + [proj(ents_new[i]) for i in sorted(arrivals)]}
data = json.dumps(out, indent=1)
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', out['count'], 'bytes', len(data), 'sha16', h)

# post-rewrite: projection vs live on the 6 tracked fields (+bbox)
_, ents_chk = load('agents/arthur/reviews/sweep-census-baseline.json')
dr = [(i, k) for i in sorted(set(ents_chk).intersection(set(ents_new)))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if ents_chk[i].get(k) != ents_new[i].get(k)]
assert not dr, dr
assert set(ents_chk) == set(ents_new), 'post-rewrite id set mismatch'
print('post-rewrite drift vs live ZERO')
