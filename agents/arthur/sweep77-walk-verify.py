#!/usr/bin/env python3
"""sweep-77 tier-1 walk verification: per-leg ok counts + maxArrival from captured outputs."""
import json

def load_json_after_banner(path):
    lines = open(path).read().splitlines()
    for i, ln in enumerate(lines):
        if ln.startswith('{'):
            return json.loads('\n'.join(lines[i:]))
    raise ValueError(f'no JSON found in {path}')

def verify(name, path, expected_legs):
    d = load_json_after_banner(path)
    results = d.get('results', [])
    if not results:
        print(f'{name}: NO RESULTS — RAW KEYS: {list(d.keys())}')
        return False
    total_ok = sum(1 for r in results if r.get('ok'))
    max_arr = max((r.get('arrived', [None, None])[1] if isinstance(r.get('arrived'), list) else r.get('maxArrival', -999)) for r in results)
    ok = total_ok == expected_legs and all(r.get('ok') for r in results)
    print(f'{name}: {total_ok}/{expected_legs} ok, maxArrival {max_arr} -> {"ALL_PASS" if ok else "FAIL"}')
    for r in results:
        if not r.get('ok'):
            print(f'  FAILING LEG: {json.dumps(r)[:200]}')
    return ok

c = verify('core', '/tmp/sweep77-walk-core.json', 64)
n = verify('NW', '/tmp/sweep77-walk-nw.json', 5)
e = verify('NE', '/tmp/sweep77-walk-ne.json', 7)
s = verify('SW', '/tmp/sweep77-walk-sw.json', 5)
print('TIER-1 VERDICT:', '81/81 ALL_PASS' if (c and n and e and s) else 'FAIL')
