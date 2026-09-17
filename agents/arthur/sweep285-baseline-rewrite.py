#!/usr/bin/env python3
"""sweep-285 baseline rewrite: committed 344-ent baseline (sha16 e70239d97e1db774)
-> censusA (345 ents, raw 233527B sha16 44d6808a39d4f7ff). Asserted pre-write:
the ONLY entity-level diff is ONE arrival nx-dress-ducks-001 (fauna-3 @ 38beef03
PRE-tick, ledger-matched tuple (8,-0.139,-91) yaw 0, lib c156b6a12a935495, 6x
motion:duck_{a,b}_{,head,tail} comps), 0 departures, 0 drift on 344 shared ids.
Like-for-like RAW census-tool output (no projection), sweep-283 chassis."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s285/censusA.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 344, 'committed baseline count != 344'
assert new['count'] == len(newE) == 345, 'censusA count != 345'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-dress-ducks-001'}, ('unexpected arrivals', sorted(arrivals))
assert not departures, ('unexpected departures', sorted(departures))

diffs = {}
for i in oldE:
    for k in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'lib', 'comp', 'compKeys'):
        if k == 'lib':
            if norm_lib(oldE[i].get(k)) != norm_lib(newE[i].get(k)):
                diffs.setdefault(i, []).append(k)
        elif oldE[i].get(k) != newE[i].get(k):
            diffs.setdefault(i, []).append(k)
assert not diffs, ('unexpected shared-id diffs', diffs)

d = newE['nx-dress-ducks-001']
assert norm_lib(d['lib']) == 'c156b6a12a935495', 'ducks lib'
assert d['pos'] == [8, -0.139, -91], 'ducks tuple'
assert d['yaw'] == 0 and d.get('scale') == 1, 'ducks yaw/scale'
assert len(d['comp']) == 6, 'ducks comp bag size'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 345 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival nx-dress-ducks-001] — PASS')
