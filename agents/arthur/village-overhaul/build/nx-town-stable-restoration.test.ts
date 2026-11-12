// Parent withdrew the invented +1m constraint. Preserve the exact already accepted architecture.
import {test,expect} from 'bun:test';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {THREE,loadPlayerMesh} from '../../cabin-overhaul/verify-player.ts';
const base=resolve(import.meta.dir,'..');
const accepted:any={'nx-town-stable':'0658345cf7e876a456e43c4c3647655849d5ec5cfa2fa3334d27874cee34d202','nx-town-woodyard':'333e85a41a745d394da953d387ef6a24bb898982ec9d70223876e029a28221bb'};
for(const id of Object.keys(accepted))test(`${id}: restored exact accepted bytes and frozen XZ`,async()=>{
 const original=await loadPlayerMesh(`${base}/before/${id}.glb`),current=await loadPlayerMesh(`${base}/build/${id}.glb`);
 const a=new THREE.Box3().setFromObject(original.root),b=new THREE.Box3().setFromObject(current.root);
 expect(current.sha256).toBe(accepted[id]);expect(readFileSync(`${base}/build/${id}.glb`).equals(readFileSync(`${base}/build/${id}-pre-roof.glb`))).toBe(true);
 for(const axis of ['x','z'] as const)for(const side of ['min','max'] as const)expect(b[side][axis]).toBe(a[side][axis]);
 const report={id,status:'PASS',modelSha256:current.sha256,acceptedSha256:accepted[id],bounds:{min:b.min.toArray(),max:b.max.toArray()},heightPolicy:'BRIEF: height may grow with review. No +1m rule in validatePlan; parent withdrew that invented constraint.'};
 writeFileSync(`${base}/build/${id}-restoration.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
},30000);
