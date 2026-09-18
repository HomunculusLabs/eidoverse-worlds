#!/usr/bin/env python3
"""sweep-301 baseline rewrite: committed 354-ent baseline (sha16 6ead1ab0f91827f3)
-> census-canonical epoch B (355 ents). Asserted pre-write: the ONLY entity-level
diff is ONE domain-valid arrival — nx-dress-geese-001 (fauna-11 graylag goose
pair @ 67a8406dd63612ea: pos (7.9,-0.0408,-96.6) yaw 0.45 scale 1 kind thing,
comp bag exactly 6x motion:goose_{a,b}_{,head,tail})
— 0 departures, 0 drift on the other 354 shared ids across ALL projection fields
(pos/yaw/scale/kind/bbox/lib/comp/compKeys + light color/intensity/range).
Arrival ledger-matched to fauna-11 @ 6dceca9b (committed mid-tick, HEAD at
epoch-B gate re-run ALL PASS). Like-for-like next-live-census.ts output,
sweep-298/299 class."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s301/censusB.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 354, 'committed baseline count != 354'
assert new['count'] == len(newE) == 355, 'census-canonical count != 355'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-dress-geese-001'}, ('unexpected arrivals', sorted(arrivals))
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

g = newE['nx-dress-geese-001']
assert [round(x, 4) for x in g['pos']] == [7.9, -0.0408, -96.6], 'geese tuple'
assert abs(g['yaw'] - 0.45) < 1e-9, 'geese yaw'
assert norm_lib(g.get('lib')) == '67a8406dd63612ea', 'geese lib (fauna-11 v7 pin)'
assert g.get('scale') == 1 and g.get('kind') == 'thing', 'geese scale/kind'
assert sorted((g.get('comp') or {}).keys()) == [
    'motion:goose_a', 'motion:goose_a_head', 'motion:goose_a_tail',
    'motion:goose_b', 'motion:goose_b_head', 'motion:goose_b_tail'], 'geese comp bag'
bb = [round(v, 2) for v in g['bbox']['size']]
assert 1.0 <= bb[0] <= 2.5 and 0.5 <= bb[1] <= 1.8 and 1.0 <= bb[2] <= 2.5, f'geese bbox scale-sane {bb}'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 354 ents -> {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival nx-dress-geese-001] — PASS')
