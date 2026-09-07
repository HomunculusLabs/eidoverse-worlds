#!/usr/bin/env python3
"""sweep-84 integrity battery vs FRESH census (epoch B, 286 ents).
Pins updated for this tick: ogeegate yaw repair (struct-80), screwwell
arrival + motion comp (struct-80), streamstones arrival (dress-105),
comp-bearing 16->17 (screwwell is the 17th bearer).
Reedpool local-build mismatch is NOT pinned here: live d3a81b79 == city-5's
pinned lib (world correct); local 7d770620 = struct-81 in-flight draft,
sweep-30 quarantined-draft class, classified in the pin-check step."""
import json, sys

d = json.load(open('/tmp/sweep84-census-B.json'))
ents = {e['id']: e for e in d['entities']}
fails = []

def check(label, cond, detail=''):
    print(('PASS ' if cond else 'FAIL ') + label + (' | ' + detail if detail else ''))
    if not cond:
        fails.append(label)

lights = [e for e in ents.values() if e.get('kind') == 'light']
check('38 lights standing', len(lights) == 38, f'{len(lights)} live')

car = ents.get('nx-carousel')
car_comp = (car.get('comp') or {}) if car else {}
car_keys = sorted(car_comp.keys())
want_car = ['motion:carousel', 'motion:horse_0', 'motion:horse_2', 'motion:horse_4', 'motion:horse_6', 'particles:smoke', 'sockets']
check('carousel compKeys exact 7', sorted(car_keys) == sorted(want_car), str(car_keys))
check('carousel lib exact', car and car.get('lib') == 'store/ce3633992d07055e.glb', car.get('lib', 'MISSING') if car else 'MISSING')

gl = [ents[i] for i in ents if i.startswith('nx-approach-lamp-') and not i.endswith('-l')]
gl_ok = all(g.get('lib') == 'store/18b69a6bb2f5862f.glb' and g.get('bbox') for g in gl) and len(gl) == 4
check('gate lamps 4/4 full-lib bbox PRESENT', gl_ok, f'{len(gl)} lamps')

pins = {
    'nx-town-belltower': ('2419fbc53a1d65e1', 'ladder' in (ents['nx-town-belltower'].get('comp') or {})),
    'nx-town-windmill': ('369c572480b0e786', None),
    'nx-town-woodyard': ('01b78fdd00f090a7', None),
    'nx-welcome': ('7d1bd0c9545c44fb', None),
    'nx-cistern': ('156b4fc8c7287a9d', None),
}
for i, (sha, extra) in pins.items():
    e = ents.get(i)
    lib_ok = e and e.get('lib', '').endswith(sha + '.glb')
    extra_ok = (extra is None) or extra
    check(f'pin {i} {sha[:8]}', bool(lib_ok and extra_ok), (e.get('lib') if e else 'MISSING'))

check('welcome-l companion live', 'nx-welcome-l' in ents)
check('beacon lib exact', ents['nx-struct-beacon'].get('lib') == 'store/03d278be72677877.glb', ents['nx-struct-beacon'].get('lib'))
check('beacon-l companion live', 'nx-struct-beacon-l' in ents and ents['nx-struct-beacon-l'].get('kind') == 'light')

hamlets = sorted(i for i in ents if i.startswith('nx-craft-hamlet-'))
ember_ok = 0
for h in hamlets:
    comp = ents[h].get('comp', {})
    for k, v in comp.items():
        if k == 'particles' and isinstance(v, dict) and v.get('preset') == 'embers' and v.get('count', 0) >= 1 and 'origin' in v:
            ember_ok += 1
check('hamlet embers 5-of-5', ember_ok == 5, f'{ember_ok}/5 of {len(hamlets)} hamlets')

court = ents.get('nx-court')
check('court smoke live', court is not None and any('smoke' in k for k in (court.get('comp') or {})), str(sorted((court.get('comp') or {}).keys()) if court else 'MISSING'))

bearers = [i for i, e in ents.items() if e.get('comp')]
check('17 comp-bearing census-matched', len(bearers) == 17, f'{len(bearers)}: {sorted(bearers)}')

# this tick's classification pins
og = ents.get('nx-struct-ogeegate')
check('ogeegate at struct-80 REPAIRED tuple', og and og.get('pos') == [22.71, -0.0025, 65.75]
      and abs((og.get('yaw') or 0) - (-0.5703736)) < 1e-5 and og.get('lib') == 'store/32039b5a7fb9da30.glb',
      f"yaw {og.get('yaw') if og else '-'}")
an = ents.get('nx-struct-angler')
check('angler city-11 lib exact', an and an.get('lib') == 'store/6ee5b4b06bc07d5e.glb', an.get('lib') if an else 'MISSING')

sw = ents.get('nx-struct-screwwell')
sw_comp = (sw.get('comp') or {}) if sw else {}
check('screwwell struct-80 tuple + motion comp', sw
      and sw.get('pos') == [-88, 0.017, 0] and abs((sw.get('yaw') or 0) - 3.141592653589793) < 1e-6
      and sw.get('lib') == 'store/6fbaede8dbe95f0d.glb'
      and 'motion:well_screw' in sw_comp,
      f"comp keys {sorted(sw_comp.keys()) if sw else 'MISSING'}")

st = ents.get('nx-dress-se-streamstones-001')
check('streamstones dress-105 tuple', st
      and st.get('pos') == [75.05, -0.0249, -46.9] and abs((st.get('yaw') or 0) - (-0.7853981633974483)) < 1e-9
      and st.get('lib') == 'store/aabbc23d5552b01c.glb',
      f"pos {st.get('pos') if st else 'MISSING'} yaw {st.get('yaw') if st else '-'}")

print()
print('BATTERY VERDICT:', 'ALL_PASS' if not fails else f'{len(fails)} FAIL: {fails}')
sys.exit(0 if not fails else 1)
