#!/usr/bin/env python3
"""sweep-316 baseline rewrite: committed sweep-315 baseline (364 ents, 264146B,
sha16 ccb1eab3a05b38c0) -> census-canonical (364 ents, 264146B, sha16
447f9601d3e7ae92). Asserted pre-write: the ONLY entity-level diff is ONE
classified lib flip — nx-carousel e16a1bc002cb1650->429cde23a16d1c17 at
identical tuple/comp (polish-289 structural material truth re-place, committed
PRE-tick @ 0a1a4313, tick-start HEAD; PLACED_VERIFIED + idempotent 0/0 per its
own ledger; comp bag 7 keys verbatim both epochs) — 0 arrivals, 0 departures,
0 drift on the other 363 shared ids across ALL projection fields. Like-for-like
next-live-census.ts output (the committed projection chassis), sweep-299 class."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s316/censusB.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 364, 'committed baseline count != 364'
assert new['count'] == len(newE) == 364, 'census-canonical count != 364'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert not arrivals, ('unexpected arrivals', sorted(arrivals))
assert not departures, ('unexpected departures', sorted(departures))

diffs = {}
for i in oldE:
    for k in ('pos', 'yaw', 'scale', 'kind', 'bbox', 'comp', 'compKeys',
              'color', 'intensity', 'range'):
        if oldE[i].get(k) != newE[i].get(k):
            diffs.setdefault(i, []).append(k)
    if norm_lib(oldE[i].get('lib')) != norm_lib(newE[i].get('lib')):
        diffs.setdefault(i, []).append('lib')
assert diffs == {'nx-carousel': ['lib']}, ('unexpected drift set', sorted(diffs.items()))

car_old, car_new = oldE['nx-carousel'], newE['nx-carousel']
assert car_old['pos'] == car_new['pos'] and car_old['yaw'] == car_new['yaw'], 'carousel tuple drift'
assert norm_lib(car_new.get('lib')) == '429cde23a16d1c17', 'carousel new lib (polish-289 pin)'
assert sorted((car_new.get('comp') or {}).keys()) == sorted([
    'motion:carousel', 'motion:horse_0', 'motion:horse_2', 'motion:horse_4',
    'motion:horse_6', 'particles:smoke', 'sockets']), 'carousel comp bag exact 7'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 364 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [nx-carousel lib] — PASS')
