#!/usr/bin/env python3
"""sweep-322 snapshot rewrite: like-for-like with the committed baseline format.
Asserted diff set vs committed (ed095bc9390fb81b): exactly [nx-carousel lib
c62a8bbd->0cdd7eed (polish-293), nx-dress-peacock-001 pos/yaw (fauna-27
re-seat, R-125 cure) + its comp t0 refresh]; 0 arrivals, 0 departures,
0 drift on the other 367 shared ids. Representation flap (baseline compKeys
vs live parent/tris) is schema-only, ignored like-for-like per sweep-142/148
precedent."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep322-census-b.json'

committed = subprocess.run(['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
                           capture_output=True, text=True, check=True).stdout
d_old = json.loads(committed)
d_new = json.load(open(LIVE))
ents_old = {e['id']: e for e in d_old['entities']}
ents_new = {e['id']: e for e in d_new['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert not arrivals, sorted(arrivals)
assert not departures, sorted(departures)

# canonical-field diff (id/pos/yaw/scale/lib/kind/bbox)
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
expect = [('nx-carousel', 'lib'), ('nx-dress-peacock-001', 'pos'), ('nx-dress-peacock-001', 'yaw')]
assert diffs == expect, diffs

# classify the two drifts explicitly
old_car = ents_old['nx-carousel']['lib']; new_car = ents_new['nx-carousel']['lib']
assert old_car == 'store/c62a8bbd8e794a9d.glb' and new_car == 'store/0cdd7eedcc22b312.glb', (old_car, new_car)
pk_old = ents_old['nx-dress-peacock-001']; pk_new = ents_new['nx-dress-peacock-001']
assert pk_old['pos'] == [-47.5, 0.04167, 60] and pk_new['pos'] == [-43.3, 0.03399, 69.7]
assert pk_old['yaw'] == 2.58 and pk_new['yaw'] == -2.318
assert pk_old['lib'] == pk_new['lib']  # same v8 bytes (fauna-27 re-seat)
# comp drift on peacock must be t0-only (keys + params verbatim)
def strip_t0(c):
    if not isinstance(c, dict): return c
    return {k: strip_t0(v) if isinstance(v, dict) else v for k, v in c.items() if k != 't0'}
assert strip_t0(pk_old.get('comp')) == strip_t0(pk_new.get('comp')), 'peacock comp changed beyond t0'
print('ASSERT OK: 369==369, 0 arrivals, 0 departures; diff set exactly '
      '[carousel.lib polish-293 0cdd7eed, peacock.pos/.yaw fauna-27 re-seat '
      '(-43.3,0.03399,69.7) yaw -2.318, R-125 cure] + peacock comp t0 refresh; '
      '0 drift on 367 shared ids')

# apply: mutate the baseline structure in place, preserving field order/format
car_e = next(e for e in d_old['entities'] if e['id'] == 'nx-carousel')
car_e['lib'] = new_car
pk_e = next(e for e in d_old['entities'] if e['id'] == 'nx-dress-peacock-001')
pk_e['pos'] = pk_new['pos']
pk_e['yaw'] = pk_new['yaw']
if 'comp' in pk_e:
    pk_e['comp'] = pk_new['comp']
# bbox untouched (both classified as envelope-identical: same-geometry re-place)

data = json.dumps(d_old, indent=2)
# restore JS-style exponent form (e-8, not e-08) for byte-compat with the
# committed baseline's original serializer (proven by the -1.5946487083102603e-8
# rows in HEAD's blob) — keeps the git diff to exactly the intended changes
import re
data = re.sub(r'(?<=\d)e([+-])0(\d)', r'e\1\2', data)  # digit-anchored: cannot touch id strings like 'lane-002' (char before 'e' is 'n')
open(BASE, 'w').write(data + '\n')  # trailing newline, like-for-like with the committed blob (ends '}\n')
h = hashlib.sha256(open(BASE, 'rb').read()).hexdigest()[:16]
print('WRITTEN count', d_old['count'], 'bytes', len(data), 'sha16', h)

# post-rewrite: canonical-field drift vs live must be ZERO
chk = {e['id']: e for e in json.load(open(BASE))['entities']}
dr = [(i, k) for i in sorted(set(chk) & set(ents_new))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if chk[i].get(k) != ents_new[i].get(k)]
assert not dr, dr
assert set(chk) == set(ents_new)
print('post-rewrite drift vs live ZERO (canonical 6+1 fields)')
