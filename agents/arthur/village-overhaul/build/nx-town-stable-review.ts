// Lane-owned local evidence builder. No live requests, no render-engine edits.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {mergeDocuments,unpartition} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from 'three';
import {BASE,sha} from '../build-stable.ts';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule(),'draco3d.encoder':await draco3d.createEncoderModule()});
const V=(eye:number[],target:number[],fov=75,night=false)=>({eye,target,fov,night});
for(const id of ['nx-town-stable','nx-town-woodyard']){
 const route=JSON.parse(readFileSync(`${BASE}/build/${id}-route.json`,'utf8'));
 const rig=JSON.parse(readFileSync(`${BASE}/reviews/${id}-before/camera.json`,'utf8'));
 rig.views.interior=id.endsWith('stable')?V([-1.0,1.75,1.15],[.85,1.3,-.9],95):V([.2,1.7,1.80],[.3,1.05,-.42],78);
 writeFileSync(`${BASE}/reviews/${id}-camera.json`,JSON.stringify(rig,null,2));
 const detail=structuredClone(rig);
 detail.closeupPurpose='Actual-byte local assembly; all nine views are intentionally cropped detail cameras, not exterior framing gates.';
 if(id.endsWith('stable'))detail.views={front:V([-1.35,1.75,3.3],[0,1.25,-.7],83),right:V([.1,1.75,.3],[1.9,1.1,-1.25],90),back:V([0,1.75,.8],[0,2.4,-2.16],86),left:V([.15,1.75,.65],[-2.4,1.35,-.85],87),gameplay:V([-.4,1.75,.15],[1.9,1.0,1.4],85),aerial:V([0,1.75,1.3],[0,3.8,-.65],100),top:V([0,4.28,-.12],[0,.2,-.20],86),night:V([-1.35,1.75,3.3],[0,1.25,-.7],83,true),interior:V([0,1.75,1.5],[0,1.4,-1.5],102)};
 else detail.views={front:V([.2,1.75,3.9],[.2,1.25,-.2],68),right:V([3.7,1.55,1.75],[2.56,.55,.4],72),back:V([.05,1.65,1.10],[0,1.30,-.8],82),left:V([-.7,1.55,1.7],[-1.2,.5,-.2],79),gameplay:V([.7,1.65,1.75],[.9,.72,-.2],78),aerial:V([.3,1.75,1.1],[.3,2.8,0],90),top:V([.3,3.1,.12],[.3,0,.18],104),night:V([.2,1.75,3.9],[.2,1.25,-.2],68,true),interior:V([-.5,1.7,1.8],[.7,1.2,-.6],88)};
 writeFileSync(`${BASE}/reviews/${id}-detail-camera.json`,JSON.stringify(detail,null,2));
 for(const rev of ['baseline','candidate']){
  const file=rev==='baseline'?`${BASE}/before/${id}.glb`:`${BASE}/build/${id}.glb`,doc=await io.read(file),scene=doc.getRoot().getDefaultScene()!;
  for(const ext of doc.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();
  for(const n of route.assembly){const bytes=readFileSync(n.file);if(sha(bytes)!==n.sha256)throw Error('assembly pin drift');const src=await io.readBinary(bytes),old=src.getRoot().getDefaultScene()!;for(const ext of src.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();const map=mergeDocuments(doc,src),ns=map.get(old)!;const dx=n.pos[0]-route.pos[0],dz=n.pos[2]-route.pos[2],c=Math.cos(route.yaw),s=Math.sin(route.yaw);const wrap=doc.createNode(n.id).setTranslation([(dx*c-dz*s)/route.scale,(n.pos[1]-route.pos[1])/route.scale,(dx*s+dz*c)/route.scale]).setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),n.yaw-route.yaw).toArray()).setScale([n.scale/route.scale,n.scale/route.scale,n.scale/route.scale]);for(const child of [...ns.listChildren()])wrap.addChild(child);scene.addChild(wrap);ns.dispose();}
  await doc.transform(unpartition());
  const out=`${BASE}/build/${id}-${rev}-assembly.glb`,bytes=await io.writeBinary(doc);writeFileSync(out,bytes);writeFileSync(`${BASE}/build/${id}-${rev}-assembly.json`,JSON.stringify({id,revision:rev,hostFile:file,hostSha256:sha(readFileSync(file)),file:out,sha256:sha(bytes),assembly:route.assembly,evidenceKind:'local-exact-source-byte-assembly-no-world-lights-not-upload-target'},null,2));console.log(JSON.stringify({id,rev,assemblySha256:sha(bytes)}));
 }
}
