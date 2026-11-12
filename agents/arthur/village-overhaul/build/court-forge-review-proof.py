"""Local exact-image provenance and readable review sheets; no world connections."""
from pathlib import Path
import hashlib
import json
import shutil
from PIL import Image, ImageDraw

BASE = Path(__file__).resolve().parents[1]
REV = BASE / 'reviews'
def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def load(path):
    return json.loads(Path(path).read_text())
pairs = []
for pair in ['court', 'forge', 'court-detail', 'court-assembly', 'court-assembly-detail', 'forge-assembly-detail']:
    ms = [load(REV / f'{pair}-{phase}/render-manifest.json') for phase in ['before', 'after']]
    assert ms[0]['cameraSha256'] == ms[1]['cameraSha256']
    assert len(ms[0]['frames']) == len(ms[1]['frames']) == 9
    assert [f['view'] for f in ms[0]['frames']] == [f['view'] for f in ms[1]['frames']]
    for a, b in zip(ms[0]['frames'], ms[1]['frames']):
        # Renderer nests draw-call/triangle statistics inside camera; those MUST change.
        for key in ['eye', 'quaternion', 'projectionMatrix']:
            assert a['camera'][key] == b['camera'][key], (pair, a['view'], key, 'camera drift')
    sheets = []
    for phase, m in zip(['before', 'after'], ms):
        folder = REV / f'{pair}-{phase}'
        assert m['status'] == 'RENDERED' and not m['errors']
        assert sha(m['modelPath']) == m['modelSha256'], (pair, phase, 'stale model')
        assert sha(folder / 'camera.json') == m['cameraSha256']
        assert sha(BASE.parent / 'cabin-overhaul/render.ts') == m['rendererSha256']
        sheet = Image.new('RGB', (1920, 1512), '#15202a')
        draw = ImageDraw.Draw(sheet)
        for i, frame in enumerate(m['frames']):
            p = folder / frame['file']
            assert sha(p) == frame['sha256']
            assert p.stat().st_size == frame['bytes']
            image = Image.open(p).convert('RGB').resize((640, 480), Image.Resampling.LANCZOS)
            x, y = (i % 3) * 640, (i // 3) * 504
            draw.text((x + 8, y + 5), f'{pair}-{phase}: {frame["view"]}', fill='white')
            sheet.paste(image, (x, y + 24))
        out = REV / f'{pair}-{phase}-sheet.jpg'
        sheet.save(out, quality=94)
        sheets.append({'file': str(out.relative_to(BASE)), 'sha256': sha(out)})
    pairs.append({'pair': pair, 'beforeSha256': ms[0]['modelSha256'], 'afterSha256': ms[1]['modelSha256'], 'cameraSha256': ms[0]['cameraSha256'], 'pngHashesVerified': True, 'cameraPoseProjectionIdentical': True, 'frames': sum(len(m['frames']) for m in ms), 'sheets': sheets})

# Byte-identical aliases: target semantics, not the generic renderer slot labels.
aliases = {}
for alias, source in {
    'court-bakery-interior': 'court-assembly-detail-after/front.png',
    'court-repair-station': 'court-assembly-detail-after/interior.png',
    'court-open-courtyard': 'court-assembly-detail-after/gameplay.png',
    'court-roof-separation': 'court-assembly-detail-after/aerial.png',
    'forge-smithy-sign-mount': 'forge-assembly-detail-after/back.png',
    'forge-hearth-art': 'forge-assembly-detail-after/front.png',
    'forge-open-hearth-detail': 'forge-assembly-detail-after/interior.png',
}.items():
    src, dst = REV / source, REV / f'{alias}.png'
    shutil.copyfile(src, dst)
    manifest = load(src.parent / 'render-manifest.json')
    aliases[alias] = {'file': str(dst.relative_to(BASE)), 'source': source, 'sha256': sha(dst), 'modelSha256': manifest['modelSha256']}
    assert sha(dst) == sha(src)
proof = {'pairs': pairs, 'frames': sum(x['frames'] for x in pairs), 'semanticAliases': aliases, 'pass': True, 'limitations': ['Hash checks establish provenance, not visual acceptance.', 'Local renders; no live component evaluation, terrain or authored world lights.']}
(BASE / 'build/court-forge-render-proof.json').write_text(json.dumps(proof, indent=2) + '\n')
print(json.dumps({'pass': True, 'pairs': len(pairs), 'frames': proof['frames'], 'aliases': list(aliases)}))
