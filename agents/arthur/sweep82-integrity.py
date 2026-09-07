#!/usr/bin/env python3
"""sweep-82 integrity battery vs FRESH census (epoch A). Pins unchanged from sweep-81 (0 drift)."""
import json, sys

d = json.load(open('/tmp/sweep82-census-A.json'))
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
check('gate lamps 4/4 full-lib bbox PRESENT', gl_ok, f'{len(gl)} lamps, libs/bbox ok={gl_ok}')

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
check('16 comp-bearing census-matched', len(bearers) == 16, f'{len(bearers)}: {sorted(bearers)[:20]}')

# sweep-81's classified-set checks (still pinned: zero drift this epoch)
og = ents.get('nx-struct-ogeegate')
check('ogeegate live at struct-77 tuple', og and og.get('pos') == [22.71, -0.0025, 65.75] and og.get('yaw') == -32.68 and og.get('lib') == 'store/32039b5a7fb9da30.glb', f"{og.get('pos') if og else 'MISSING'} yaw {og.get('yaw') if og else '-'}")
an = ents.get('nx-struct-angler')
check('angler city-11 lib exact', an and an.get('lib') == 'store/6ee5b4b06bc07d5e.glb', an.get('lib') if an else 'MISSING')

print()
print('BATTERY VERDICT:', 'ALL_PASS' if not fails else f'{len(fails)} FAIL: {fails}')
sys.exit(0 if not fails else 1)
