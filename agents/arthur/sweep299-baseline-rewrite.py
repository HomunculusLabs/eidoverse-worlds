#!/usr/bin/env python3
"""sweep-298 baseline rewrite: committed 353-ent baseline (sha16 0220a3a9ed400960)
-> census-canonical (354 ents, 244459B sha16 6ead1ab0f91827f3). Asserted pre-write:
the ONLY entity-level diff is ONE domain-valid arrival — nx-struct-sphericon
(struct-217 sphericon @ e8dffa7f: pos (-29.297719,-0.040422,418.976901) yaw 3.735 lib
e8dffa7fc40892e9 scale 1 kind thing, comp bag empty)
— 0 departures, 0 drift on the other 353 shared ids across ALL projection fields
(pos/yaw/scale/kind/bbox/lib/comp/compKeys + light color/intensity/range).
Arrival ledger-matched to struct-217 @ e2142d9c (tick-start HEAD, committed PRE-tick).
Like-for-like next-live-census.ts output (the committed projection chassis),
sweep-298 class."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s299/censusB.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 353, 'committed baseline count != 353'
assert new['count'] == len(newE) == 354, 'census-canonical count != 354'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-struct-sphericon'}, ('unexpected arrivals', sorted(arrivals))
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

rb = newE['nx-struct-sphericon']
assert [round(x, 4) for x in rb['pos']] == [-29.2977, -0.0404, 418.9769], 'sphericon tuple'
assert abs(rb['yaw'] - 3.735004599267865) < 1e-9, 'sphericon yaw'
assert norm_lib(rb.get('lib')) == 'e8dffa7fc40892e9', 'sphericon lib (struct-217 bank pin)'
assert rb.get('scale') == 1 and rb.get('kind') == 'thing', 'sphericon scale/kind'
assert sorted((rb.get('comp') or {}).keys()) == [], 'sphericon comp bag empty'
bb = [round(v, 2) for v in rb['bbox']['size']]
assert 3.0 <= bb[0] <= 4.5 and 2.0 <= bb[1] <= 3.5 and 3.0 <= bb[2] <= 4.5, f'sphericon bbox scale-sane {bb}'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 353 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival nx-struct-sphericon] — PASS')
