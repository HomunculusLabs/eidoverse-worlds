import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco from 'draco3dgltf';
import * as THREE from 'three';
import {readFileSync,writeFileSync} from 'node:fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()});
const out:any=[];
for(const id of ['nx-town-hall','nx-town-inn']){
 const d=await io.readBinary(readFileSync(`${import.meta.dir}/${id}-served.glb`));const rows:any=[];
 for(const n of d.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()??[]){
 const b=new THREE.Box3(),a=p.getAttribute('POSITION')!,ix=p.getIndices(),mat=new THREE.Matrix4().fromArray(n.getWorldMatrix());
 for(let i=0;i<(ix?.getCount()??a.getCount());i++)b.expandByPoint(new THREE.Vector3(...a.getElement(ix?ix.getScalar(i):i,[])).applyMatrix4(mat));
 const m=p.getMaterial();rows.push({node:n.getName(),min:b.min.toArray(),max:b.max.toArray(),material:m?.getName(),emissive:m?.getEmissiveFactor()});
 }
 out.push({id,primitives:rows});
}
writeFileSync(`${import.meta.dir}/served-decode.json`,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out.map(x=>({id:x.id,emissive:x.primitives.filter((p:any)=>p.emissive?.some((v:number)=>v>0)||/lamp|fire|sign/.test(p.node))})),null,2));
