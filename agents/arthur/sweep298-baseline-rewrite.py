#!/usr/bin/env python3
"""sweep-298 baseline rewrite: committed 352-ent baseline (sha16 0220a3a9ed400960)
-> census-canonical (353 ents, 243852B sha16 3d7307b61482ca56). Asserted pre-write:
the ONLY entity-level diff is ONE domain-valid arrival — nx-dress-robin-001
(fauna-9 European robin @ 5ba5598f: pos (6.3,-0.029115,-86.35) yaw 3pi/2 lib
5ba5598fbca0ff46 scale 1 kind thing, 3x motion:robin{,_head,_tail} comps)
— 0 departures, 0 drift on the other 352 shared ids across ALL projection fields
(pos/yaw/scale/kind/bbox/lib/comp/compKeys + light color/intensity/range).
Arrival ledger-matched to fauna-9 @ 7754b1d (committed mid-tick, after epoch A).
Like-for-like next-live-census.ts output (the committed projection chassis),
sweep-295 class."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s298/censusB.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 352, 'committed baseline count != 352'
assert new['count'] == len(newE) == 353, 'census-canonical count != 353'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-dress-robin-001'}, ('unexpected arrivals', sorted(arrivals))
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

rb = newE['nx-dress-robin-001']
assert [round(x, 4) for x in rb['pos']] == [6.3, -0.0291, -86.35], 'robin tuple'
assert abs(rb['yaw'] - 4.71238898038469) < 1e-9, 'robin yaw 3pi/2'
assert norm_lib(rb.get('lib')) == '5ba5598fbca0ff46', 'robin lib (fauna-9 v5 pin)'
assert rb.get('scale') == 1 and rb.get('kind') == 'thing', 'robin scale/kind'
assert sorted((rb.get('comp') or {}).keys()) == ['motion:robin',
    'motion:robin_head', 'motion:robin_tail'], 'robin comp bag 3x robin'
bb = [round(v, 2) for v in rb['bbox']['size']]
assert 0.1 <= bb[0] <= 2.5 and 0.1 <= bb[1] <= 3.5 and 0.1 <= bb[2] <= 2.5, f'robin bbox scale-sane {bb}'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 353 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival nx-dress-robin-001] — PASS')
