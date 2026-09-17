#!/usr/bin/env python3
"""sweep-289 baseline rewrite: committed 347-ent baseline (sha16 ee03e64a276879be)
-> censusB (348 ents, raw 237763B sha16 62e15a427cbedfdc). Asserted pre-write:
the ONLY entity-level diff is ONE domain-valid arrival nx-dress-se-fox-001
(fauna-5 @ 88ccdd58 mid-tick NEW entity: pos (72.62,-0.041,-9.66) yaw 5.052389
lib bc7376b3d17f1fad scale 1 kind thing, comp bag 3x
motion:fox_{,head,tail}), 0 departures, 0 drift on the other 347 shared ids
across all five semantic classes. Like-for-like RAW census-tool output (no
projection), sweep-283/286/287 chassis."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s289/censusB.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 347, 'committed baseline count != 347'
assert new['count'] == len(newE) == 348, 'censusB count != 348'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-dress-se-fox-001'}, ('unexpected arrivals', sorted(arrivals))
assert not departures, ('unexpected departures', sorted(departures))

diffs = {}
for i in oldE:
    for k in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys'):
        if k == 'lib':
            if norm_lib(oldE[i].get(k)) != norm_lib(newE[i].get(k)):
                diffs.setdefault(i, []).append(k)
        elif oldE[i].get(k) != newE[i].get(k):
            diffs.setdefault(i, []).append(k)
assert not diffs, ('unexpected drift on shared ids', sorted(diffs))

fox = newE['nx-dress-se-fox-001']
assert fox['pos'] == [72.62, -0.041, -9.66], 'fox tuple'
assert abs(fox['yaw'] - 5.052389) < 1e-6, 'fox yaw'
assert norm_lib(fox.get('lib')) == 'bc7376b3d17f1fad', 'fox lib'
assert fox.get('scale') == 1 and fox.get('kind') == 'thing', 'fox scale/kind'
got = sorted((fox.get('comp') or {}).keys())
want = sorted(['motion:fox', 'motion:fox_head', 'motion:fox_tail'])
assert got == want, ('fox comp keys', got)

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 348 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival nx-dress-se-fox-001] — PASS')
