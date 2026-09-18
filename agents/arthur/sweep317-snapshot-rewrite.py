#!/usr/bin/env python3
"""sweep-317 baseline rewrite: committed sweep-316 baseline (364 ents, 264146B,
sha16 447f9601d3e7ae92) -> census-C canonical (366 ents, 267570B, sha16
f680267771d41609). Asserted pre-write: the ONLY entity-level diffs are TWO
classified arrivals + ONE classified lib flip —
  + nx-struct-csaszar @ (-63.116114,-0.02747,19.296533) yaw 1.343904 lib
    299e6d7d0c0d9c15 comp {} (struct-228 Császár @ 28507e3a PRE-tick,
    ledger-matched tuple incl. az163 r66 W-shoulder seat, walk 6/6 0.31m
    re-proven by its own lane);
  + nx-dress-turkey-001 @ (45.25,-0.03869,-6.5) yaw -1.15 lib 5a3c1cf516f8921c
    7x motion:turkey_* (fauna-24 turkey @ 75cb29bc PRE-tick, ledger-matched
    tuple, walk ALL_PASS per its own entry);
  ~ nx-carousel lib 429cde23a16d1c17->08ce1189b2d4b42b at identical
    tuple/comp (polish-290 crown beacon @ 64a0ecc8, landed mid-tick epoch B;
    PLACED_VERIFIED + idempotent 0/0 per its ledger; comp bag 7 keys verbatim;
    material-only cure — zero geometry/node/texture change, bbox
    byte-identical) — 0 departures, 0 drift on the other 363 shared ids
    across ALL projection fields. Like-for-like next-live-census.ts output
    (the committed projection chassis), sweep-299 class."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = '/tmp/s317/censusC.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.loads(subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                                text=True, check=True).stdout)
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

assert old['count'] == len(oldE) == 364, 'committed baseline count != 364'
assert new['count'] == len(newE) == 366, 'census-C count != 366'
arrivals = set(newE) - set(oldE)
departures = set(oldE) - set(newE)
assert arrivals == {'nx-struct-csaszar', 'nx-dress-turkey-001'}, ('unexpected arrivals', sorted(arrivals))
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
assert norm_lib(car_new.get('lib')) == '08ce1189b2d4b42b', 'carousel new lib (polish-290 pin)'
assert sorted((car_new.get('comp') or {}).keys()) == sorted([
    'motion:carousel', 'motion:horse_0', 'motion:horse_2', 'motion:horse_4',
    'motion:horse_6', 'particles:smoke', 'sockets']), 'carousel comp bag exact 7'

cs = newE['nx-struct-csaszar']
assert cs['pos'] == [-63.116114, -0.02747, 19.296533] and cs['yaw'] == 1.343904, 'csaszar tuple'
assert norm_lib(cs.get('lib')) == '299e6d7d0c0d9c15' and cs.get('compKeys') == [], 'csaszar lib/comp'
tk = newE['nx-dress-turkey-001']
assert tk['pos'] == [45.25, -0.03869, -6.5] and tk['yaw'] == -1.15, 'turkey tuple'
assert norm_lib(tk.get('lib')) == '5a3c1cf516f8921c', 'turkey lib'
assert len(tk.get('compKeys') or []) == 7, 'turkey 7 motion comps'

raw = open(NEW, 'rb').read()
sha16 = hashlib.sha256(raw).hexdigest()[:16]
with open(BASE, 'wb') as f:
    f.write(raw)
print(f'BASELINE_REWRITTEN 366 ents / {len(raw)}B / sha16 {sha16}')
print('pre-write assertions: exactly [arrival csaszar, arrival turkey, carousel lib] — PASS')
