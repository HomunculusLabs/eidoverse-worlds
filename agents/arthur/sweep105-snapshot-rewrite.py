#!/usr/bin/env python3
"""sweep-105 snapshot rewrite: 7-field projection like-for-like, epoch C settled (298).
Zero arrivals, zero departures. Exactly TWO classified lib flips at identical
tuples (bbox parity EXACT per both ledgers — material-only swaps):
- nx-struct-halt bb227fd6 -> cdaf7c1f = struct-93 @ a4f51752 (committed pre-tick;
  sweep-104's census reads predated its re-place verbs — known-epoch class).
- nx-struct-needlerest bb227fd6 -> cdaf7c1f = struct-94 @ f5e6883d (committed
  mid-tick; zero-upload shared-bytes swap at pinned tuple, corroborated by
  city-103 + dress-150).
"""
import json, hashlib, subprocess


def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')


d_new = json.load(open('/tmp/sweep105-census-c.json'))  # epoch C settled (298)
ents_new = {e['id']: e for e in d_new['entities']}

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
d_old = json.loads(committed)
ents_old = {e['id']: e for e in d_old['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert not arrivals, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 298 and len(ents_new) == 298, (len(ents_old), len(ents_new))

FIELDS = ('pos', 'yaw', 'scale', 'kind')
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in FIELDS
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
lib_flips = sorted(i for i in (set(ents_new) & set(ents_old))
                   if norm_lib(ents_old[i].get('lib')) != norm_lib(ents_new[i].get('lib')))
assert lib_flips == ['nx-struct-halt', 'nx-struct-needlerest'], lib_flips
bbox_drift = [i for i in lib_flips
              if ents_old[i].get('bbox') != ents_new[i].get('bbox')]
assert not bbox_drift, bbox_drift
print('ASSERT OK: 0 arrivals, 0 departures; drift = exactly [halt lib, needlerest lib], bbox parity EXACT')


def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o


out = {'world': 'commons-next', 'count': len(ents_new),
       'entities': [proj(ents_new[e['id']]) for e in d_old['entities']]}
assert len(out['entities']) == 298
data = json.dumps(out, indent=1)
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', out['count'], 'bytes', len(data), 'sha16', h)

# post-rewrite: projection vs live on tracked fields
_, ents_chk = None, {e['id']: e for e in json.load(open('agents/arthur/reviews/sweep-census-baseline.json'))['entities']}
dr = [(i, k) for i in sorted(set(ents_chk) & set(ents_new))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if (norm_lib(ents_chk[i].get('lib')) if k == 'lib' else ents_chk[i].get(k))
      != (norm_lib(ents_new[i].get('lib')) if k == 'lib' else ents_new[i].get(k))]
assert not dr, dr
print('POST-REWRITE DRIFT ZERO vs live epoch C')
