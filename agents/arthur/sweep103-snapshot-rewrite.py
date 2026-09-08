#!/usr/bin/env python3
"""sweep-103 snapshot rewrite: 7-field projection like-for-like, epoch B settled (295).
Arrivals exactly [nx-struct-fifthbench] (struct-92 placement @ c28d8b26, tuple
(-23.5,-0.04,-51) yaw -0.4328 lib 62f33173ccdae107 matches the struct-92 ledger
line-for-line); exactly ONE drift field-set = nx-dress-ne-timberyard-001 lib+bbox
at identical tuple (dress-142 v9 cure re-place @ 5e461c1e, lib 10b449fa->dfafb8c8,
bbox top 1.241->1.63 = the v9 cants, ledger-exact); zero departures, zero other drift."""
import json, hashlib, subprocess


def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents


d_new, ents_new = load('/tmp/sweep103-census-b.json')  # epoch B settled (295)

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
open('/tmp/sweep103-committed-baseline.json', 'w').write(committed)
d_old, ents_old = load('/tmp/sweep103-committed-baseline.json')

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-fifthbench'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 294 and len(ents_new) == 295, (len(ents_old), len(ents_new))
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'kind')
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
lib_flips = [i for i in sorted(set(ents_new).intersection(set(ents_old)))
             if (ents_old[i].get('lib') or '').replace('store/', '').replace('.glb', '')
             != (ents_new[i].get('lib') or '').replace('store/', '').replace('.glb', '')]
assert lib_flips == ['nx-dress-ne-timberyard-001'], lib_flips
print('ASSERT OK: arrivals exactly [fifthbench (struct-92)]; drift exactly '
      '[timberyard lib+bbox (dress-142)]; 0 departures; 0 other drift on 294 shared ids')


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
print('POST-REWRITE DRIFT ZERO vs live epoch B')
