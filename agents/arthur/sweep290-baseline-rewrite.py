#!/usr/bin/env python3
"""sweep-290 baseline rewrite: committed 348-ent baseline (sha16 62e15a427cbedfdc)
-> census-canonical (349 ents, 238367B sha16 39cb812dad59cf72). Asserted pre-write:
the ONLY entity-level diff is ONE domain-valid arrival nx-struct-lunes (struct-213
carry of the struct-212 banked v1: pos (-27.902589,-0.031168,399.02562) yaw
3.735004599267865 lib 41af82ec0c20af4c scale 1 kind thing comp bag empty), 0
departures, 0 drift on the other 348 shared ids across ALL projection fields
(pos/yaw/scale/kind/bbox/lib/comp/compKeys + light color/intensity/range).
Like-for-like next-live-census.ts output (the committed projection chassis),
sweep-287/288/289 class."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s290/census-canonical.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 348, 'committed baseline count != 348'
assert new['count'] == len(newE) == 349, 'census-canonical count != 349'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-struct-lunes'}, ('unexpected arrivals', sorted(arrivals))
assert not departures, ('unexpected departures', sorted(departures))

diffs = {}
for i in oldE:
    for k in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys',
              'color', 'intensity', 'range'):
        if k == 'lib':
            if norm_lib(oldE[i].get(k)) != norm_lib(newE[i].get(k)):
                diffs.setdefault(i, []).append(k)
        elif oldE[i].get(k) != newE[i].get(k):
            diffs.setdefault(i, []).append(k)
assert not diffs, ('unexpected drift on shared ids', sorted(diffs))

lu = newE['nx-struct-lunes']
assert [round(x, 6) for x in lu['pos']] == [-27.902589, -0.031168, 399.025622][:3] or \
       lu['pos'] == [-27.902589, -0.031168, 399.02562], 'lunes tuple'
assert abs(lu['yaw'] - 3.735004599267865) < 1e-9, 'lunes yaw'
assert norm_lib(lu.get('lib')) == '41af82ec0c20af4c', 'lunes lib (struct-212 bank pin)'
assert lu.get('scale') == 1 and lu.get('kind') == 'thing', 'lunes scale/kind'
assert (lu.get('comp') or {}) == {} and lu.get('compKeys') == [], 'lunes comp bag empty'
assert lu['bbox']['min'] == [-3.764, 0, -0.45] and lu['bbox']['max'] == [3.764, 3.59, 0.45], \
    'lunes bbox == struct-212 decoded envelope'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 349 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival nx-struct-lunes] — PASS')
