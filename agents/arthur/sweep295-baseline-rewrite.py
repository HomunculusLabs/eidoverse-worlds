#!/usr/bin/env python3
"""sweep-295 baseline rewrite: committed 351-ent baseline (sha16 af904b3f565c4423)
-> census-canonical (352 ents, 242335B sha16 0220a3a9ed400960). Asserted pre-write:
the ONLY entity-level diff is ONE domain-valid arrival — nx-dress-owl-001
(fauna-8 barn owl @ ce24e656: pos (48.8,-0.0295,4.2) yaw 2.89 lib
a11e5432c329e697 scale 1 kind thing, 3x motion:barnowl{,_head,_tail} comps)
— 0 departures, 0 drift on the other 351 shared ids across ALL projection fields
(pos/yaw/scale/kind/bbox/lib/comp/compKeys + light color/intensity/range).
Census epochs A/B byte-identical (cmp-verified). Like-for-like
next-live-census.ts output (the committed projection chassis), sweep-293 class."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s295/censusB.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 351, 'committed baseline count != 351'
assert new['count'] == len(newE) == 352, 'census-canonical count != 352'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-dress-owl-001'}, ('unexpected arrivals', sorted(arrivals))
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

owl = newE['nx-dress-owl-001']
assert [round(x, 4) for x in owl['pos']] == [48.8, -0.0295, 4.2], 'owl tuple'
assert abs(owl['yaw'] - 2.89) < 1e-9, 'owl yaw'
assert norm_lib(owl.get('lib')) == 'a11e5432c329e697', 'owl lib (fauna-8 v6 pin)'
assert owl.get('scale') == 1 and owl.get('kind') == 'thing', 'owl scale/kind'
assert sorted((owl.get('comp') or {}).keys()) == ['motion:barnowl',
    'motion:barnowl_head', 'motion:barnowl_tail'], 'owl comp bag 3x barnowl'
bb = [round(v, 2) for v in owl['bbox']['size']]
assert 0.1 <= bb[0] <= 2.5 and 0.1 <= bb[1] <= 3.5 and 0.1 <= bb[2] <= 2.5, f'owl bbox scale-sane {bb}'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 352 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival nx-dress-owl-001] — PASS')
