#!/usr/bin/env python3
"""sweep-293 baseline rewrite: committed 349-ent baseline (sha16 39cb812dad59cf72)
-> census-canonical (351 ents, 240828B sha16 af904b3f565c4423). Asserted pre-write:
the ONLY entity-level diffs are TWO domain-valid arrivals — nx-dress-cat-001
(fauna-7 barn cat @ 1e3e2052: pos (40.7,-0.038,-7.5) yaw 3.216 lib
0030ce54d92e6785 scale 1 kind thing, 4x motion:bcat{,_ears,_head,_tail} comps,
bbox 0.55x0.42x0.34) and nx-struct-oloid (struct-215 carry of the struct-214
banked v1: pos (-28.600154,-0.038535,409.001261) yaw 3.735004599267865 lib
f76b1e8fe568b3b1 scale 1 kind thing, comp bag empty, bbox 4.46x3.18x3.4) —
0 departures, 0 drift on the other 349 shared ids across ALL projection fields
(pos/yaw/scale/kind/bbox/lib/comp/compKeys + light color/intensity/range).
Census epochs A/B byte-identical (cmp-verified). Like-for-like
next-live-census.ts output (the committed projection chassis), sweep-290 class."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s293/censusB.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 349, 'committed baseline count != 349'
assert new['count'] == len(newE) == 351, 'census-canonical count != 351'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-dress-cat-001', 'nx-struct-oloid'}, ('unexpected arrivals', sorted(arrivals))
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

cat = newE['nx-dress-cat-001']
assert [round(x, 4) for x in cat['pos']] == [40.7, -0.038, -7.5], 'cat tuple'
assert abs(cat['yaw'] - 3.216) < 1e-9, 'cat yaw'
assert norm_lib(cat.get('lib')) == '0030ce54d92e6785', 'cat lib (fauna-7 v12b pin)'
assert cat.get('scale') == 1 and cat.get('kind') == 'thing', 'cat scale/kind'
assert sorted((cat.get('comp') or {}).keys()) == ['motion:bcat', 'motion:bcat_ears',
    'motion:bcat_head', 'motion:bcat_tail'], 'cat comp bag 4x bcat'
assert [round(v, 2) for v in cat['bbox']['size']] == [0.55, 0.42, 0.34], 'cat bbox'

ol = newE['nx-struct-oloid']
assert [round(x, 6) for x in ol['pos']] == [-28.600154, -0.038535, 409.001261], 'oloid tuple'
assert abs(ol['yaw'] - 3.735004599267865) < 1e-9, 'oloid yaw'
assert norm_lib(ol.get('lib')) == 'f76b1e8fe568b3b1', 'oloid lib (struct-214 bank pin)'
assert ol.get('scale') == 1 and ol.get('kind') == 'thing', 'oloid scale/kind'
assert (ol.get('comp') or {}) == {} and ol.get('compKeys') == [], 'oloid comp bag empty'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 351 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival nx-dress-cat-001, arrival nx-struct-oloid] — PASS')
