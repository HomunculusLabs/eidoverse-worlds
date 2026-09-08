#!/usr/bin/env python3
"""sweep-124 snapshot rewrite: 7-field projection like-for-like, single stable epoch (305).
Zero departures. Exactly ONE arrival:
- nx-struct-catenoid @ (26.30, -0.05184172647526143, -53.93) yaw 1.5707963267948966 (pi/2)
  lib 8ac664937f96976d comp {} — the struct-102 deferred contract executed live
  (struct-103 in flight: placer next-place-struct103.ts pins this exact tuple+sha,
  census-verified absent at its authoring; ledger/commit not yet landed at this
  tick's HEAD 7742e835 — artwalk-65/66 work-in-flight class, domain-valid).
Zero drift on all 304 shared ids (epochs A and B identical, 20s-paced).
"""
import json, hashlib, subprocess


def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')


d_new = json.load(open('/tmp/sweep124-census-b.json'))  # epoch B settled (305)
ents_new = {e['id']: e for e in d_new['entities']}

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
d_old = json.loads(committed)
ents_old = {e['id']: e for e in d_old['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-catenoid'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 304 and len(ents_new) == 305, (len(ents_old), len(ents_new))

FIELDS = ('pos', 'yaw', 'scale', 'kind')
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in FIELDS
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
lib_flips = sorted(i for i in (set(ents_new) & set(ents_old))
                   if norm_lib(ents_old[i].get('lib')) != norm_lib(ents_new[i].get('lib')))
assert not lib_flips, lib_flips
bbox_drift = [i for i in (set(ents_new) & set(ents_old))
              if ents_old[i].get('bbox') != ents_new[i].get('bbox')]
assert not bbox_drift, bbox_drift
new = ents_new['nx-struct-catenoid']
assert [round(v, 4) for v in new.get('pos') or []] == [26.30, -0.0518, -53.93], new.get('pos')
assert round(new.get('yaw') or 0, 6) == 1.570796
assert norm_lib(new.get('lib')) == '8ac664937f96976d'
assert (new.get('comp') in (None, {}, '')), new.get('comp')
print('ASSERT OK: 0 departures; drift = ZERO on 304 shared ids; arrival = exactly [nx-struct-catenoid], tuple placer-exact (struct-103 in flight), comp {}')


def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o


order_old = [e['id'] for e in d_old['entities']]
out = {'world': 'commons-next', 'count': len(ents_new),
       'entities': [proj(ents_new[i]) for i in order_old] + [proj(new)]}
assert len(out['entities']) == 305
data = json.dumps(out, indent=1)
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', out['count'], 'bytes', len(data), 'sha16', h)

# post-rewrite drift vs live: ZERO
chk = json.load(open('agents/arthur/reviews/sweep-census-baseline.json'))
C = {e['id']: e for e in chk['entities']}
assert len(C) == 305
resid = [(i, k) for i in ents_new for k in ('pos', 'yaw', 'scale', 'kind', 'bbox')
         if C[i].get(k) != ents_new[i].get(k)]
resid += [(i, 'lib') for i in ents_new
          if norm_lib(C[i].get('lib')) != norm_lib(ents_new[i].get('lib'))]
assert not resid, resid[:5]
print('POST-REWRITE drift vs live: ZERO')
