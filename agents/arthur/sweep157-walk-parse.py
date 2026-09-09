#!/usr/bin/env python3
"""sweep-157 walk parse: strip the [physics] banner, verify per-leg ok counts
against the tool's own status/legs fields. Classes: sweep-48 (schema-key
anchoring) + sweep-35 ([physics] banner)."""
import json, sys

for tag in sys.argv[1:]:
    raw = open(f'/tmp/sweep157-{tag}.json').read()
    i = raw.find('{')
    d = json.loads(raw[i:]) if i >= 0 else {}
    legs = d.get('results', [])
    ok = sum(1 for l in legs if l.get('ok'))
    stated = d.get('legs', len(legs))
    mx = d.get('maxDist') or d.get('maxArrival')
    verdict = 'ALL_PASS' if d.get('status') == 'ALL_PASS' and ok == len(legs) and len(legs) > 0 else 'FAIL'
    print(f"{tag.upper()}: {verdict} status={d.get('status')} legs={stated} ok={ok}/{len(legs)} maxDist={mx}")
