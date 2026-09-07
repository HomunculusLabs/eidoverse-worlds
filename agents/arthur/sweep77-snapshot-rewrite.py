#!/usr/bin/env python3
"""sweep-77 snapshot rewrite: 7-field projection like-for-like, epoch B final."""
import json, hashlib, subprocess

def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents

d_new, ents_new = load('/tmp/sweep77-census-B.json')  # epoch B final

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep77-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep77-committed-baseline.json')

assert set(ents_new) == set(ents_old), (
    sorted(set(ents_new) - set(ents_old)), sorted(set(ents_old) - set(ents_new)))
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
expect = {('nx-struct-beacon', 'pos'), ('nx-struct-beacon', 'yaw'),
          ('nx-struct-beacon-l', 'pos'),
          ('nx-struct-observatory', 'pos'), ('nx-struct-observatory', 'yaw'),
          ('nx-struct-observatory-l', 'pos')}
assert set(diffs) == expect, sorted(set(diffs) ^ expect)
print('ASSERT OK: diff exactly the 6-field city-7 + city-8 relocation set')

def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o

old_order = [e['id'] for e in d_old['entities']]
assert sorted(old_order) == sorted(ents_new)
out = {'world': 'commons-next', 'count': len(ents_new),
       'entities': [proj(ents_new[i]) for i in old_order]}
data = json.dumps(out, indent=1)
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', len(ents_new), 'bytes', len(data), 'sha16', h)

# post-rewrite: projection vs live on the 7 tracked fields
_, ents_chk = load('agents/arthur/reviews/sweep-census-baseline.json')
dr = [(i, k) for i in sorted(set(ents_chk).intersection(set(ents_new)))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if ents_chk[i].get(k) != ents_new[i].get(k)]
assert not dr, dr
print('post-rewrite drift vs live ZERO (7-field projection)')
