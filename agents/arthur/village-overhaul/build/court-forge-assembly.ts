// Local comparison assemblies from exact decoded served geometry; not deployment outputs.
import {NodeIO,Document} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {mergeDocuments,unpartition} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const base=resolve(import.meta.dir,'..'),hash=(x:any)=>createHash('sha256').update(x).digest('hex');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
for(const id of ['court','forge'])for(const phase of ['before','after']){
 const n=JSON.parse(readFileSync(`${base}/neighbors/nx-${id}.json`,'utf8')),h=n.host,target=new Document(),scene=target.createScene('local-companion-assembly');target.getRoot().setDefaultScene(scene);
 const hostPath=phase==='after'?`${base}/build/${id}.glb`:`${base}/before/nx-${id}.glb`;
 // Close companions only; no enormous networks reframe the comparison rig.
 const items=[{...h,file:hostPath},...n.neighbors.filter((x:any)=>/sign-|cistern|b16|b23|b28|b29/.test(x.id))];
 // B16 belongs to the forge. Include its real host for court-framed views too.
 if(id==='court'){const forge=n.neighbors.find((x:any)=>x.id==='nx-forge');items.push({...forge,file:phase==='after'?`${base}/build/forge.glb`:forge.file});}
 // The smithy hanging sign belongs to the COURT, not the forge. Include its real host
 // so a valid wall bracket is not falsely judged as floating in a partial assembly.
 if(id==='forge'){const court=n.neighbors.find((x:any)=>x.id==='nx-court');items.push({...court,file:phase==='after'?`${base}/build/court.glb`:court.file});}
 const pins=[];
 for(const e of items){const bytes=readFileSync(e.file),doc=await io.readBinary(bytes);pins.push({id:e.id,sha256:hash(bytes),file:e.file});
  for(const ext of doc.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();
  const sourceScene=doc.getRoot().getDefaultScene()!,map=mergeDocuments(target,doc),wrapper=target.createNode(e.id);
  const dx=e.pos[0]-h.pos[0],dz=e.pos[2]-h.pos[2],c=Math.cos(h.yaw),s=Math.sin(h.yaw),a=(e.yaw-h.yaw)/2;
  wrapper.setTranslation([(dx*c-dz*s)/h.scale,(e.pos[1]-h.pos[1])/h.scale,(dx*s+dz*c)/h.scale]);wrapper.setRotation([0,Math.sin(a),0,Math.cos(a)]);wrapper.setScale([e.scale/h.scale,e.scale/h.scale,e.scale/h.scale]);
  for(const child of sourceScene.listChildren())wrapper.addChild(map.get(child) as any);scene.addChild(wrapper);
  for(const old of target.getRoot().listScenes())if(old!==scene)old.dispose();
 }
 await target.transform(unpartition());
 const out=`${base}/build/${id}-assembly-${phase}.glb`,bytes=await io.writeBinary(target);writeFileSync(out,bytes);writeFileSync(out.replace('.glb','.json'),JSON.stringify({id,phase,sha256:hash(bytes),inputs:pins,limitations:['Assembly model bytes are new containers of exact input decoded geometry. Not a host deployment asset.','No terrain/network/light entities in visual assembly; route assembly includes all frozen neighbors.']},null,2));console.log(out,bytes.length,hash(bytes));
}
