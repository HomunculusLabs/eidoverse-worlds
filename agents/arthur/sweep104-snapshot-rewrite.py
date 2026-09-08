#!/usr/bin/env python3
"""sweep-104 snapshot rewrite: 7-field projection like-for-like, epoch B settled (298).
Arrivals exactly [nx-moonmoth-001, beb4c791, house-35_-22] (moonmoth-1 committed
ledger; two foreign-domain entities routed to sweep register by city-98 — off-spoke
band r33-55, no owning lane claims them). Drift field-sets classified:
- cabin-1 (committed): row-cottage, garden-cottage, longhouse, bunkhouse,
  tower-house (lib+bbox at identical tuples) + b17 pos (+0.54m Y remount).
- village-overhaul DELIVERY.json (Bill-commissioned parent wave, uncommitted
  in-tree): hall, inn, stable, woodyard, forge, dyehouse, potter, kiln, tower,
  shrine, gate-n/s/e/w (lib+bbox at identical tuples).
- windmill overhaul (untracked WINDMILL-OVERHAUL.md): windmill lib+bbox,
  comp GAIN motion:well_millstone alongside motion:sails.
- polish-283 (committed): nx-carousel lib ce3633992d07055e->1c0128b61b510a5d,
  comp bag exact 7 preserved, motion:horse_* keys unchanged.
Zero departures; zero other drift on 292 shared ids."""
import json, hashlib, subprocess


def load(path):
    d = json.load(open(path))
    ents = {e['id']: e for e in d['entities']}
    return d, ents


d_new, ents_new = load('/tmp/sweep104-census-b.json')  # epoch B settled (298)

committed = subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout
d_old, ents_old = load_json = (None, None)
import json as _j
d_old = _j.loads(committed)
ents_old = {e['id']: e for e in d_old['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-moonmoth-001', 'beb4c791', 'house-35_-22'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 295 and len(ents_new) == 298, (len(ents_old), len(ents_new))
diffs = [(i, k) for i in sorted(set(ents_new).intersection(set(ents_old)))
         for k in ('pos', 'yaw', 'scale', 'kind')
         if ents_old[i].get(k) != ents_new[i].get(k)]
expected_pos = {('nx-artwalk-b17-garden-seed-lattice', 'pos')}
assert set(diffs) == expected_pos, diffs
lib_flips = [i for i in sorted(set(ents_new).intersection(set(ents_old)))
             if (ents_old[i].get('lib') or '').replace('store/', '').replace('.glb', '')
             != (ents_new[i].get('lib') or '').replace('store/', '').replace('.glb', '')]
assert set(lib_flips) == {
    'nx-town-row-cottage', 'nx-town-garden-cottage', 'nx-town-longhouse',
    'nx-town-bunkhouse', 'nx-town-tower-house', 'nx-town-hall', 'nx-town-inn',
    'nx-town-stable', 'nx-town-woodyard', 'nx-forge', 'nx-town-dyehouse',
    'nx-town-potter', 'nx-town-kiln', 'nx-tower', 'nx-town-shrine',
    'nx-town-gate-n', 'nx-town-gate-s', 'nx-town-gate-e', 'nx-town-gate-w',
    'nx-town-windmill', 'nx-carousel'}, lib_flips
print('ASSERT OK: arrivals exactly [moonmoth, beb4c791, house-35_-22]; '
      'drift = 21 lib flips + b17 pos (all classified); 0 departures; 0 other drift')


def proj(e):
    o = {}
    for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib', 'bbox'):
        o[k] = e.get(k)
    return o


old_order = [e['id'] for e in d_old['entities']]
out_ids = set(old_order) | arrivals
assert set(ents_new) == out_ids, 'id set mismatch'
out = {'world': 'commons-next', 'count': len(old_order) + len(arrivals),
       'entities': [proj(ents_new[i]) for i in old_order]
       + [proj(ents_new[i]) for i in sorted(arrivals)]}
data = json.dumps(out, indent=1)
open('agents/arthur/reviews/sweep-census-baseline.json', 'w').write(data)
h = hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16]
print('WRITTEN count', out['count'], 'bytes', len(data), 'sha16', h)

# post-rewrite: projection vs live on the 6 tracked fields (+bbox)
_, ents_chk = load('agents/arthur/reviews/sweep-census-baseline.json')
dr = [(i, k) for i in sorted(set(ents_chk).intersection(set(ents_new)))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if ents_chk[i].get(k) != ents_new[i].get(k)]
assert not dr, dr
print('POST-REWRITE DRIFT ZERO vs live epoch B')
