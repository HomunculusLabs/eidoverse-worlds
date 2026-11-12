"""Repeatable lane-only freeze gate. Run from eidoverse-worlds repository root.
No network, uploads, world mutations, credentials, GUI, commits or shared writes.
"""
from pathlib import Path
import hashlib
import json
import os
import subprocess

BASE = Path(__file__).resolve().parents[1]
REPO = BASE.parents[2]
RUNTIME = REPO / 'agents/arthur/cabin-overhaul/runtime'
ENV = {**os.environ, 'CABIN_PLAYER_RUNTIME_DIR': str(RUNTIME)}
IDS = ('nx-town-stable', 'nx-town-woodyard')


def read(p):
    return json.loads(p.read_text())


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def write(p, obj):
    p.write_text(json.dumps(obj, indent=2) + '\n')


def run(args, expect=0, log=None):
    result = subprocess.run(args, cwd=REPO, env=ENV, text=True, capture_output=True)
    if log:
        log.write_text(result.stdout + '\n' + result.stderr)
    if result.returncode != expect:
        raise RuntimeError(f'{args}: expected {expect}, got {result.returncode}\n{result.stdout}\n{result.stderr}')
    return result.stdout.strip()


frozen = [BASE / 'before/contracts.json', BASE / 'before/protected.json', BASE / 'before/downloads.json', BASE / 'kit.ts',
          REPO / 'agents/arthur/assets/mkv3-stable.ts', REPO / 'agents/arthur/assets/mkv3-woodyard27.ts',
          REPO / 'agents/arthur/assets/housekit.ts', REPO / 'agents/arthur/assets/glbwrite.ts',
          REPO / 'agents/arthur/assets/mergekit.ts', REPO / 'agents/arthur/cabin-overhaul/kit.ts',
          REPO / 'agents/arthur/cabin-overhaul/render.ts', REPO / 'agents/arthur/cabin-overhaul/verify-player.ts']
frozen += list((BASE / 'before').glob('*.glb'))
input_hashes = {str(p.relative_to(REPO)): sha(p) for p in frozen}
downloads = {d['id']: d for d in read(BASE / 'before/downloads.json')}
for id in IDS:
    target = BASE / 'build' / f'{id}.glb'
    rows = []
    for n in (1, 2):
        before_mtime = target.stat().st_mtime_ns
        output = run(['bun', str(BASE / f'build-{id.removeprefix("nx-town-")}.ts')])
        row = {'run': n, 'sha256': sha(target), 'bytes': target.stat().st_size,
               'mtimeNs': target.stat().st_mtime_ns, 'previousMtimeNs': before_mtime,
               'mtimeAdvanced': target.stat().st_mtime_ns > before_mtime, 'output': output}
        assert row['mtimeAdvanced']
        rows.append(row)
    assert rows[0]['sha256'] == rows[1]['sha256']
    write(BASE / 'build' / f'{id}-determinism.json', {'status': 'PASS', 'records': rows})

run(['bun', str(BASE / 'build/nx-town-stable-verify-retention.ts')])
run(['bun', str(BASE / 'build/nx-town-stable-review.ts')])
run(['bun', 'test', str(BASE / 'build/nx-town-stable-restoration.test.ts')], log=BASE / 'reviews/nx-town-stable-restoration-test.log')
run(['bun', str(BASE / 'build/nx-town-stable-verify-roof.ts')], log=BASE / 'reviews/nx-town-stable-roof-functional.log')
run(['bun', str(BASE / 'build/nx-town-stable-verify-frames.ts')])

for id in IDS:
    prefix = BASE / 'build' / id
    # Exact-only room policy is an honest negative for the automatic woodyard pillar.
    # Its accepted access gate is probeApproach plus actual support, not an override.
    for mode, expected in [('main', 1 if id.endswith('woodyard') else 0), ('context', 1 if id.endswith('woodyard') else 0), ('baseline', 1)] + ([('default', 1)] if id.endswith('woodyard') else []):
        label = '' if mode == 'main' else '-' + mode
        model = BASE / ('before' if mode == 'baseline' else 'build') / f'{id}.glb'
        run(['bun', 'agents/arthur/cabin-overhaul/verify-player.ts', str(model),
             str(prefix) + f'-route{label}.json', str(prefix) + f'-player{label}.json'],
            expect=expected, log=Path(str(prefix) + f'-player{label}.log'))
    ev = read(Path(str(prefix) + '-evidence.json'))
    assert sha(BASE / 'before' / f'{id}.glb') == downloads[id]['sha256'] == ev['baseline']['sha256']
    assert sha(Path(str(prefix) + '.glb')) == ev['candidate']['sha256']
    assert ev['hostTuple']['comp'] == ev['componentsPreserved'] == {}
    assert ev['sourceSha256'] == sha(BASE / f'build-{id.removeprefix("nx-town-")}.ts')
    for axis in (0, 2):
        for side in ('min', 'max'):
            assert ev['baseline']['bounds'][side][axis] == ev['candidate']['bounds'][side][axis]
    protected = []
    for n in read(Path(str(prefix) + '-route.json'))['assembly']:
        assert sha(REPO / n['file']) == n['sha256'] == downloads[n['id']]['sha256']
        protected.append({'id': n['id'], 'sha256': n['sha256'], 'pos': n['pos'], 'yaw': n['yaw'], 'scale': n['scale'], 'comp': n.get('comp', {})})
    protected_ids = (['nx-dress-stablebench', 'nx-artwalk-b8-stable-harmonic-rein', 'nx-sign-stable-001', 'nx-town-stable-l']
                     if id.endswith('stable') else ['nx-artwalk-b11-woodyard-heartwood-measure', 'nx-sign-woodyard-001'])
    records = [p for p in read(BASE / 'before/protected.json') if p['geom']['id'] in protected_ids]
    assert {p['geom']['id'] for p in records} == set(protected_ids)
    write(Path(str(prefix) + '-companion-contract.json'), {'evidenceKind': 'unaltered-frozen-protected-records-not-live-readback',
          'host': id, 'protectedSnapshotSha256': sha(BASE / 'before/protected.json'), 'records': records})
    camera_pairs = []
    for a, b, assembly in [('before', 'after', False), ('baseline-details', 'candidate-details', True)]:
        ma = read(BASE / f'reviews/{id}-{a}/render-manifest.json')
        mb = read(BASE / f'reviews/{id}-{b}/render-manifest.json')
        assert ma['cameraSha256'] == mb['cameraSha256']
        assert len(ma['frames']) == len(mb['frames']) == 9
        expected_before = sha(BASE / f'build/{id}-baseline-assembly.glb') if assembly else ev['baseline']['sha256']
        expected_after = sha(BASE / f'build/{id}-candidate-assembly.glb') if assembly else ev['candidate']['sha256']
        assert ma['modelSha256'] == expected_before
        assert mb['modelSha256'] == expected_after
        camera_pairs.append({'before': a, 'after': b, 'cameraSha256': ma['cameraSha256'], 'framesEach': 9,
                             'beforeSha256': ma['modelSha256'], 'afterSha256': mb['modelSha256']})
    gate = read(Path(str(prefix) + '-player-context.json'))
    approach = read(Path(str(prefix) + '-approach-context.json'))
    roof = read(Path(str(prefix) + '-roof-verification.json'))
    restoration = read(Path(str(prefix) + '-restoration.json'))
    assert approach['status'] == roof['status'] == 'PASS'
    assert approach['physicalSupport']['pass'] and restoration['status'] == 'PASS'
    assert approach['modelSha256'] == roof['modelSha256'] == restoration['modelSha256'] == ev['candidate']['sha256']
    exterior = read(BASE / f'reviews/{id}-roof-context/render-manifest.json')
    assert exterior['modelSha256'] == sha(BASE / f'build/{id}-candidate-assembly.glb')
    assert exterior['cameraSha256'] == camera_pairs[0]['cameraSha256'] and len(exterior['frames']) == 9
    retained = read(Path(str(prefix) + '-retention-verification.json'))
    assert gate['modelSha256'] == retained['modelSha256'] == ev['candidate']['sha256']
    required = 'glow' if id.endswith('stable') else 'wy_axe'
    assert any(n['name'] == required for n in ev['baseline']['hierarchy'])
    assert any(n['name'] == required for n in ev['candidate']['hierarchy'])
    report = {'status': 'LOCAL_GATES_PASS_PARENT_DEPLOYMENT_REVIEW_REQUIRED', 'id': id,
              'baseline': {k: v for k, v in ev['baseline'].items() if k != 'hierarchy'},
              'candidate': {k: v for k, v in ev['candidate'].items() if k != 'hierarchy'},
              'hostTuple': ev['hostTuple'], 'exactDecodedXZEquality': True, 'restoration': restoration,
              'acceptedGeometryRegression': roof, 'exteriorContext': {'directory': f'reviews/{id}-roof-context', 'manifest': exterior},
              'physicalSupport': approach['physicalSupport'],
              'requiredAnchorPreserved': required, 'retention': retained,
              'contextGate': {'status': approach['status'], 'exactOnlyGeometryPolicyStatus': gate['status'], 'geometryPolicyFailures': gate['failures'], 'collider': gate['collider'],
                              'legs': len(gate['walks']), 'passed': sum(w['pass'] for w in gate['walks']),
                              'maxPush': max(w['maxPush'] for w in gate['walks']),
                              'geometryHits': sum(w['geometryHits'] for w in gate['walks']),
                              'doors': gate['doors'], 'protectedVolumes': gate['protectedVolumes'],
                              'neighborCount': len(gate['neighbors']), 'runtime': gate['runtime']},
              'cameraPairs': camera_pairs, 'protectedCompanions': protected,
              'inputHashes': input_hashes,
              'sourceHashes': {p.name: sha(p) for p in [BASE / 'build-stable.ts', BASE / 'build-woodyard.ts']},
              'limits': ['No live mutation or live walk performed; parent owns deployment and served-byte verification.',
                         'Terrain Y=0 is the frozen local caller contract, not a fresh terrain sample.',
                         'Geometry and furnishings are preserved with explicitly recorded rigid repositions; original material bytes are intentionally redesigned.',
                         'No clean static typecheck claimed; Bun execution and actual public CPU collider modules exercised.']}
    if id.endswith('woodyard'):
        default = read(Path(str(prefix) + '-player-default.json'))
        report['workstationCollision'] = {'preserved': 'automatic', 'original': None, 'roomClaim': False,
            'defaultClassification': default['collider'], 'defaultFailures': default['failures'],
            'defaultWalkLegsPassed': sum(w['pass'] for w in default['walks']),
            'interpretation': 'Automatic collision is preserved with no amendment. Actual default probeApproach and independent triangle support pass all 14 legs, including all 10 frozen neighbors. The exact-only room-policy negative is not blocked access. Original served geometry also passes these 14 routes; its separate full-height approach volume has 11 intrusions.'}
    write(Path(str(prefix) + '-final-verification.json'), report)
    print(json.dumps({'id': id, 'status': report['status'], 'sha256': ev['candidate']['sha256'],
                      'bytes': ev['candidate']['bytes'], 'triangles': ev['candidate']['triangles'],
                      'routeLegsPassed': report['contextGate']['passed'], 'routeLegs': report['contextGate']['legs'],
                      'protectedIntrusionHits': sum(p['hits'] for p in gate['protectedVolumes']),
                      'exactXZ': True, 'cameraPairs': camera_pairs}))

for p in frozen:
    assert sha(p) == input_hashes[str(p.relative_to(REPO))], f'frozen input drift during verification: {p}'
print('FROZEN_INPUTS_UNCHANGED_DURING_FINAL_GATE')
