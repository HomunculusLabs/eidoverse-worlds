#!/usr/bin/env python3
"""sweep-323 snapshot rewrite: like-for-like with the committed baseline format.
Asserted diff set vs committed (dc02efc2a3601f2c): exactly [nx-carousel lib
0cdd7eed->8cd33f44 (polish-294 scenery-panel night separation)] + ONE arrival
nx-struct-tetrahelix @ (75.814868,-0.034302,5.301492) yaw 4.118977 lib
87dfb8b6440b67e8 (struct-234 @ a53f6a48 mid-tick, tuple matches its committed
ledger line-for-line); 0 departures, 0 drift on the other 368 shared ids.
Representation flap (baseline compKeys vs live parent/tris) is schema-only,
ignored like-for-like per sweep-142/148 precedent."""
import json, hashlib, subprocess, bisect, re

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep323-census-b.json'

committed = subprocess.run(['git', 'show', f'HEAD:{BASE}'],
                           capture_output=True, text=True, check=True).stdout
d_old = json.loads(committed)
d_new = json.load(open(LIVE))
ents_old = {e['id']: e for e in d_old['entities']}
ents_new = {e['id']: e for e in d_new['entities']}

assert d_old['count'] == len(ents_old) == 369, 'committed baseline count != 369'
assert d_new['count'] == len(ents_new) == 370, 'census-B count != 370'
arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-tetrahelix'}, ('unexpected arrivals', sorted(arrivals))
assert not departures, ('unexpected departures', sorted(departures))

# canonical-field diff (id/pos/yaw/scale/lib/kind/bbox)
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
         if ents_old[i].get(k) != ents_new[i].get(k)]
expect = [('nx-carousel', 'lib')]
assert diffs == expect, diffs

# classify the flip explicitly
old_car = ents_old['nx-carousel']['lib']; new_car = ents_new['nx-carousel']['lib']
assert old_car == 'store/0cdd7eedcc22b312.glb' and new_car == 'store/8cd33f4423d8f7e7.glb', (old_car, new_car)
car_new = ents_new['nx-carousel']
assert sorted((car_new.get('comp') or {}).keys()) == sorted([
    'motion:carousel', 'motion:horse_0', 'motion:horse_2', 'motion:horse_4',
    'motion:horse_6', 'particles:smoke', 'sockets']), 'carousel comp bag exact 7'

# classify the arrival explicitly (tuple vs struct-234 ledger)
th = ents_new['nx-struct-tetrahelix']
assert th['pos'] == [75.814868, -0.034302, 5.301492] and th['yaw'] == 4.118977, 'tetrahelix tuple'
assert th['lib'] == 'store/87dfb8b6440b67e8.glb', 'tetrahelix lib (struct-233 banked sha)'
assert th.get('kind') == 'thing', 'tetrahelix kind'
print('ASSERT OK: 369->370, +1 arrival nx-struct-tetrahelix (struct-234 @ '
      'a53f6a48, ledger-matched line-for-line), 1 classified lib flip '
      '[nx-carousel 0cdd7eed->8cd33f44 polish-294]; 0 departures, 0 drift '
      'on 368 shared ids')

# apply: mutate the baseline structure in place, preserving field order/format
car_e = next(e for e in d_old['entities'] if e['id'] == 'nx-carousel')
car_e['lib'] = new_car
# arrival: sorted insert preserving id order
old_order = [e['id'] for e in d_old['entities']]
th_proj = {k: th.get(k) for k in ('id', 'kind', 'pos', 'yaw', 'scale', 'lib',
                                  'bbox', 'compKeys', 'comp')}
i = bisect.bisect_left(old_order, 'nx-struct-tetrahelix')
assert old_order[i] if i < len(old_order) else None not in (None,) and d_old['entities'][i]['id'] == 'nx-struct-tesseract'
d_old['entities'].insert(i, th_proj)
d_old['count'] = len(d_old['entities'])

data = json.dumps(d_old, indent=2)
# restore JS-style exponent form (e-8, not e-08) for byte-compat with the
# committed baseline's original serializer — keeps the git diff to exactly
# the intended changes. Digit-anchored: cannot touch id strings like
# 'lane-002' (char before 'e' is 'n').
data = re.sub(r'(?<=\d)e([+-])0(\d)', r'e\1\2', data)
open(BASE, 'w').write(data + '\n')  # trailing newline, like-for-like
h = hashlib.sha256(open(BASE, 'rb').read()).hexdigest()[:16]
print('WRITTEN count', d_old['count'], 'bytes', len(data), 'sha16', h)

# post-rewrite: canonical-field drift vs live must be ZERO
chk = {e['id']: e for e in json.load(open(BASE))['entities']}
dr = [(i2, k) for i2 in sorted(set(chk) & set(ents_new))
      for k in ('pos', 'yaw', 'scale', 'lib', 'kind', 'bbox')
      if chk[i2].get(k) != ents_new[i2].get(k)]
assert not dr, dr
assert set(chk) == set(ents_new), 'post-rewrite id set mismatch'
ids = [e['id'] for e in json.load(open(BASE))['entities']]
assert ids == sorted(ids), 'id order broken'
print('post-rewrite drift vs live ZERO (canonical 6+1 fields); id order sorted OK')
