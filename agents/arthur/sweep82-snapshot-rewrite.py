#!/usr/bin/env python3
"""sweep-82 snapshot rewrite: 7-field projection like-for-like, epoch C final (284)."""
import json, hashlib, subprocess

def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents

d_new, ents_new = load('/tmp/sweep82-census-C.json')  # epoch C final (settled)

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep82-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep82-committed-baseline.json')

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert not arrivals, sorted(arrivals)
assert not departures, sorted(departures)
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
expect = {('nx-town-potter', 'pos'), ('nx-town-potter', 'yaw'),
          ('nx-sign-potter-001', 'pos'), ('nx-sign-potter-001', 'yaw'),
          ('nx-town-potter-l', 'pos'),
          ('nx-artwalk-b3-ruled-porch', 'pos'), ('nx-artwalk-b3-ruled-porch', 'yaw')}
assert set(diffs) == expect, sorted(set(diffs) ^ expect)
print('ASSERT OK: 0 arrivals, 0 departures; diff exactly the 7-field city-13 potter '
      'compression move (potter pos+yaw, sign pos+yaw, potter-l pos, b3-ruled-porch pos+yaw)')

def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o

old_order = [e['id'] for e in d_old['entities']]
assert set(old_order) == set(ents_new), 'id set changed'
out = {'world': 'commons-next', 'count': len(old_order),
       'entities': [proj(ents_new[i]) for i in old_order]}
data = json.dumps(out, indent=1)
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', len(old_order), 'bytes', len(data), 'sha16', h)

# post-rewrite: projection vs live on the 7 tracked fields
_, ents_chk = load('agents/arthur/reviews/sweep-census-baseline.json')
dr = [(i, k) for i in sorted(set(ents_chk).intersection(set(ents_new)))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if ents_chk[i].get(k) != ents_new[i].get(k)]
assert not dr, dr
print('post-rewrite drift vs live ZERO')
