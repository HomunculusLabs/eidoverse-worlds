#!/usr/bin/env python3
"""sweep-75 snapshot rewrite v2: 7-field projection (drop comp/compKeys), like-for-like."""
import json, hashlib

def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents

d_new, ents_new = load('/tmp/sweep75-census3.json')  # epoch C final

import subprocess
committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep75-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep75-committed-baseline.json')

assert set(ents_new) == set(ents_old)
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
expect = {('nx-struct-reedpool', 'pos'), ('nx-struct-reedpool', 'yaw'),
          ('nx-struct-angler', 'pos'), ('nx-struct-angler', 'yaw')}
assert set(diffs) == expect, sorted(set(diffs) ^ expect)
print('ASSERT OK: diff exactly the 4-field city-5 companion move')

def proj(e):
    """7-field like-for-like projection, committed key order, keys ALWAYS present."""
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o

# order: committed entity order with the two moved ids re-projected in place
old_order = [e['id'] for e in d_old['entities']]
assert sorted(old_order) == sorted(ents_new)
out = {'world': 'commons-next', 'count': len(ents_new),
       'entities': [proj(ents_new[i]) for i in old_order]}
data = json.dumps(out, indent=1)
open('reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', len(ents_new), 'bytes', len(data), 'sha16', h)

# post-rewrite: projection vs live on the 7 tracked fields
_, ents_chk = load('reviews/sweep-census-baseline.json')
dr = [(i, k) for i in set(ents_chk) & set(ents_new)
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if ents_chk[i].get(k) != ents_new[i].get(k)]
assert not dr, dr
print('post-rewrite drift vs live ZERO (7-field projection)')
