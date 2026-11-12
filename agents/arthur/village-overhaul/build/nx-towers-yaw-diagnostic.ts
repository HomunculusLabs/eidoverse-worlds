// Read-only reproduction of parent clone/Euler aliasing; no engine edits or mocks.
import {THREE as T,loadPlayerMesh,loadPlayerAssembly,runtimeEvidence} from '../../cabin-overhaul/verify-player.ts';
import {BASE,json,save,sha} from '../build-belltower.ts';
import {readFileSync} from 'node:fs';
const k=json(`${BASE}/build/nx-tower.route.json`),C=await import(`${runtimeEvidence.root}/colliders.js`),results=[];
for(const mode of ['original','clone','clone-with-same-matrix-pure-yaw']){
 const m=await loadPlayerMesh(`${BASE}/build/nx-tower.glb`),ns=await loadPlayerAssembly(k,k.assembly);C.clearColliders();C.fitCollider(k.id,m.root,{scale:1,localFrame:true});let maxMatrixError=0;const rotations=[];
 for(const n of ns){const original=n.root,root=mode==='original'?original:original.clone(true);original.updateMatrixWorld(true);
 if(mode==='clone-with-same-matrix-pure-yaw'){root.updateMatrix();root.rotation.set(0,Math.atan2(root.matrix.elements[8],root.matrix.elements[0]),0);}
 root.updateMatrixWorld(true);maxMatrixError=Math.max(maxMatrixError,...root.matrixWorld.elements.map((v,i)=>Math.abs(v-original.matrixWorld.elements[i])));
 C.fitCollider(n.id,root,{scale:root.scale.x,collide:n.collide,localFrame:true});rotations.push({id:n.id,rotation:root.rotation.toArray(),quaternion:root.quaternion.toArray()});}
 const p=new T.Vector3(.4,0,3.95),support=C.resolveColliders(p,()=>0);results.push({mode,support,pos:p.toArray(),maxMatrixError,rotations});C.clearColliders();
}
const report={evidenceKind:'read-only-actual-runtime-clone-reproduction-not-fixed-parent-inspector',modelSha256:sha(readFileSync(`${BASE}/build/nx-tower.glb`)),routeSha256:sha(readFileSync(`${BASE}/build/nx-tower.route.json`)),runtime:runtimeEvidence,results,conclusion:'Clone preserves the quaternion but may introduce X/Z Euler PI aliases. Public colliders read rotation.y only. Normalize the same matrix to pure-Y after every clone and rigid frame transform. This changes representation, not geometry, road data, neighbor coverage or placement.'};save(`${BASE}/build/nx-tower.parent-yaw-clone-diagnostic.json`,report);console.log(JSON.stringify(results.map(r=>({mode:r.mode,support:r.support,maxMatrixError:r.maxMatrixError,road:r.rotations.find(n=>n.id==='nx-core-paths')}))));
if(results[0].support!==0||results[1].support<=.035||results[2].support!==0||results.some(r=>r.maxMatrixError>1e-12))throw Error('clone diagnosis not reproduced');
