#!/usr/bin/env python3
"""sweep-157 tier-2 parse: longhouse + garden-cottage, per-leg ok counts."""
import json

for tag, f in (('LONGHOUSE', '/tmp/sweep157-longhouse.json'),
               ('GARDEN-COTTAGE', '/tmp/sweep157-gardenc.json')):
    raw = open(f).read()
    i = raw.find('{')
    d = json.loads(raw[i:]) if i >= 0 else {}
    legs = d.get('results', [])
    ok = sum(1 for l in legs if l.get('ok'))
    mx = d.get('maxDist') or d.get('maxArrival')
    verdict = 'ALL_PASS' if d.get('status') == 'ALL_PASS' and ok == len(legs) and len(legs) > 0 else 'FAIL'
    print(f"{tag}: {verdict} status={d.get('status')} legs={d.get('legs',len(legs))} ok={ok}/{len(legs)} maxDist={mx}")
