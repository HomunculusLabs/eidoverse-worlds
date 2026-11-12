"""Bind actual rendered files, native review and forensic evidence; never grants acceptance."""
from pathlib import Path
import hashlib,json
from PIL import Image,ImageChops
B=Path(__file__).resolve().parent.parent
R=B.parents[2]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text())
pairs={}
for phase in ['before','after']:
    folder=B/f'reviews/forge-followup-{phase}'
    m=read(folder/'render-manifest.json')
    assert m['status']=='RENDERED' and not m['errors']
    assert sha(Path(m['modelPath']))==m['modelSha256']
    assert sha(B/'../cabin-overhaul/render.ts')==m['rendererSha256']
    assert sha(folder/'camera.json')==m['cameraSha256']
    assert len(m['frames'])==9
    for f in m['frames']:
        assert sha(folder/f['file'])==f['sha256']
        assert (folder/f['file']).stat().st_size==f['bytes']
    pairs[phase]=m
assert pairs['before']['cameraSha256']==pairs['after']['cameraSha256']
assert [f['camera']|{'drawCalls':None,'triangles':None} for f in pairs['before']['frames']]==[f['camera']|{'drawCalls':None,'triangles':None} for f in pairs['after']['frames']]
# Identical-byte repeat is a pixel control, not a repaired image.
prior=B/'reviews/forge-smithy-sign-mount.png';fresh=B/'reviews/forge-followup-after/back.png'
a=Image.open(prior).convert('RGB');b=Image.open(fresh).convert('RGB')
d=ImageChops.difference(a,b)
changed=sum(rgb != (0,0,0) for rgb in d.getdata())
assert sha(prior)==sha(B/'reviews/forge-assembly-detail-after/back.png')
freeze=read(B/'build/forge-followup-determinism.json')
drift=[p for p,h in freeze['unchangedProtectedInputs'].items() if sha(R/p)!=h]
assert not drift,drift
native=B/'reviews/forge-followup-native.md'
assert 'HOLD' in native.read_text()
geometry=read(B/'build/forge-followup-geometry.json')
assert sha(B/'build/forge-followup-geometry.ts')==geometry['sourceHashes']['self']
assert geometry['lower']['assemblyMatchesExactFrozenTuple'] and geometry['lower']['geometryUnchanged']
assert geometry['lower']['tupleMatchesCapturedFolded']
assert geometry['decision']=='HOLD' and not geometry['upper']['connected']
out={'status':'EVIDENCE_VERIFIED_ENSEMBLE_HOLD','renders':{p:{k:m[k] for k in ['modelPath','modelSha256','rendererSha256','cameraSha256','frames','warnings','errors']} for p,m in pairs.items()},'repeatedCandidateImage':{'prior':str(prior),'priorSha256':sha(prior),'fresh':str(fresh),'freshSha256':sha(fresh),'changedPixels':changed,'differenceBounds':d.getbbox()},'nativeReview':{'path':str(native),'sha256':sha(native),'mode':'independent-native-Codex-CLI-not-parent-or-subagent-native-sight','cli':'reviews/live-recapture-native-cli/node_modules/.bin/codex','version':'0.153.4','model':'gpt-6-astra','reasoning':'low','result':'HOLD','promptSha256':sha(B/'reviews/forge-followup-native-prompt.txt'),'logSha256':sha(B/'reviews/forge-followup-native.log')},'forensicEvidence':{p:sha(B/p) for p in ['build/forge-followup-geometry.json','build/forge-followup-pixel-trace.json','build/forge-followup-determinism.json','build/forge-followup-gates.json','build/forge-followup.test.ts','reviews/forge-followup-red.log']},'protectedInputs':len(freeze['unchangedProtectedInputs']),'protectedInputDrift':drift}
(B/'build/forge-followup-review-proof.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({'status':out['status'],'frames':sum(len(m['frames']) for m in pairs.values()),'changedPixels':changed,'nativeReviewSha256':sha(native),'protectedInputDrift':drift},indent=2))
