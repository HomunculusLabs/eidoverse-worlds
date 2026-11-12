import {createHash} from 'node:crypto';
import {THREE as ThreeRuntime,loadPlayerMesh,placeNeighborInHostFrame,verifyPlayerMesh,runtimeEvidence} from '../cabin-overhaul/verify-player.ts';
import {probeApproach,normalizeRootYaw} from './verify-approach.ts';
import {validatePlan} from '../cabin-overhaul/contracts.ts';
import {boundsGate} from '../cabin-overhaul/rollout.ts';
import {readFileSync,writeFileSync,mkdirSync,realpathSync} from 'node:fs';
import {resolve,relative,isAbsolute,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {MeshBVH} from '../../../client/node_modules/three-mesh-bvh/src/index.js';
const THREE:any=ThreeRuntime;
export const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
const hash=(s:any)=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const assert=(ok:any,msg:string)=>{if(!ok)throw Error(msg);};
export function verifyBinding(input:any){
 assert(input?.schema==='village-preflight-input-v1'&&input.world==='commons-next','wrong preflight scope');
 assert(['local','served'].includes(input.stage)&&hash(input.contextSha256),'invalid preflight context');
 assert(Buffer.isBuffer(input.sourceBytes)&&sha(input.sourceBytes)===input.slot?.sha256,'source bytes drift');
 assert(Buffer.isBuffer(input.modelBytes)&&sha(input.modelBytes)===input.modelSha256,'decoded model bytes drift');
 assert(input.stage!=='local'||input.modelSha256===input.slot.sha256,'local source/model mismatch');
 assert(Array.isArray(input.slot.routes)&&input.slot.routes.length>0&&input.slot.routes.every((r:any)=>typeof r.file==='string'&&hash(r.sha256)&&['room','workstation'].includes(r.mode)),'missing pinned functional routes');
 assert(Array.isArray(input.neighbors)&&new Set(input.neighbors.map((n:any)=>n.id)).size===input.neighbors.length,'duplicate/invalid neighbors');
 for(const n of input.neighbors)assert(n.lib?Buffer.isBuffer(n.bytes)&&sha(n.bytes)===n.sha256:n.kind==='light'&&n.bytes===null&&n.sha256===null,`invalid neighbor bytes ${n.id}`);
 return true;
}
function surface(root:any){
 const coordinates:number[]=[],samples:any[]=[];root.updateMatrixWorld(true);
 root.traverse((m:any)=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,index=m.geometry.index,count=index?.count??p.count;
  for(let i=0;i<count;i+=3){const t=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+k):i+k).applyMatrix4(m.matrixWorld));
   for(const v of t){assert(v.toArray().every(Number.isFinite),'nonfinite surface vertex');coordinates.push(...v.toArray());samples.push(v);}
   samples.push(t[0].clone().add(t[1]).add(t[2]).multiplyScalar(1/3));
   for(let k=0;k<3;k++)samples.push(t[k].clone().add(t[(k+1)%3]).multiplyScalar(.5));
  }});
 assert(coordinates.length>0,'empty surface');const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(coordinates,3));
 return {geometry,bvh:new MeshBVH(geometry),samples,triangles:coordinates.length/9};
}
export function compareSurfaces(a:any,b:any){
 const s=surface(a),d=surface(b);
 try{const direction=(from:any,to:any)=>{let maxDistance=0;for(const p of from.samples){const hit=to.bvh.closestPointToPoint(p);assert(hit&&Number.isFinite(hit.distance),'surface distance unavailable');maxDistance=Math.max(maxDistance,hit.distance);}return {samples:from.samples.length,maxDistance};};
 const forward=direction(s,d),reverse=direction(d,s);return {pass:forward.maxDistance<=.003&&reverse.maxDistance<=.003,forward,reverse,toleranceMetres:.003,sourceTriangles:s.triangles,servedTriangles:d.triangles,method:'bidirectional all-vertex/edge-midpoint/triangle-centroid nearest-surface probes',limitation:'Sampled surface equivalence, not a mathematical Hausdorff certificate; actual served-route proof separately required.'};
 }finally{s.geometry.dispose();d.geometry.dispose();}
}
const ROOT=dirname(fileURLToPath(import.meta.url));
export function terrainMatches(y:number,slot:any){return Number.isFinite(y)&&Number.isFinite(slot?.pos?.[1])&&Number.isFinite(slot?.scale)&&slot.scale>0&&Math.abs(y*slot.scale+slot.pos[1])<=1e-6;}
export function bindTerrain(y:number,slot:any){
 if(terrainMatches(y,slot))return y;
 assert(y===0&&Number.isFinite(slot?.pos?.[1])&&Number.isFinite(slot?.scale)&&slot.scale>0,'route terrain is neither world zero nor equivalent host-local datum');
 return -slot.pos[1]/slot.scale;
}
export function applyProofFrame(root:any,neighbors:any[],input:any){
 const contract=structuredClone(input),model=root.clone(true),ns=neighbors.map(n=>({...n,root:n.root.clone(true)})),angle=contract.proofFrameY??0;
 if(angle!==0){
  assert(Number.isFinite(angle)&&Math.abs(angle/(Math.PI/2)-Math.round(angle/(Math.PI/2)))<1e-10,'unsupported non-quarter-turn proof frame');
  const f=contract.coordinateFrames;assert(f?.doors==='proof-frame'&&f?.waypoints==='host-local'&&f?.protectedVolumes==='host-local'&&f?.assembly==='world-tuples','ambiguous proof frame metadata');
  const A=new THREE.Matrix4().makeRotationY(angle);model.applyMatrix4(A);ns.forEach(n=>n.root.applyMatrix4(A));
  contract.waypoints=contract.waypoints.map((w:any)=>({...w,pos:new THREE.Vector3(...w.pos).applyMatrix4(A).toArray()}));
  contract.protectedVolumes=(contract.protectedVolumes??[]).map((p:any)=>{const b=new THREE.Box3(new THREE.Vector3(...p.min),new THREE.Vector3(...p.max)).applyMatrix4(A);return {...p,min:b.min.toArray(),max:b.max.toArray()};});
 }
 normalizeRootYaw(model);ns.forEach(n=>normalizeRootYaw(n.root));
 return {root:model,neighbors:ns,contract,proofFrameY:angle};
}
export function prepareNeighbor(loaded:any,host:any,n:any){
 placeNeighborInHostFrame(loaded.root,host,n);
 return {...loaded,id:n.id,collide:n.folded?.collide??undefined,sourceTuple:{pos:n.pos,yaw:n.yaw,scale:n.scale,lib:n.lib??null}};
}
function readPin(p:any){
 assert(p&&typeof p.file==='string'&&hash(p.sha256)&&!isAbsolute(p.file),'invalid preflight evidence pin');
 const path=realpathSync(resolve(ROOT,p.file)),rel=relative(realpathSync(ROOT),path);assert(rel&&!rel.startsWith('../')&&!isAbsolute(rel),'preflight evidence path escape');
 const bytes=readFileSync(path);assert(sha(bytes)===p.sha256,`preflight evidence drift: ${p.file}`);return bytes;
}
export async function inspect(input:any){
 verifyBinding(input);const {slot}=input;
 assert(/^nx-(town-)?[a-z-]+$/.test(slot.id),'invalid host identifier');
 assert(runtimeEvidence.mode==='served-override','preflight must use pinned public runtime, not repo-local modules');
 const publicRuntime=[];for(const [name,pin] of Object.entries(runtimeEvidence.files) as any[]){
  const url=new URL(pin.publicPath,'https://eidoverse.billding.dev');assert(url.origin==='https://eidoverse.billding.dev'&&url.pathname===`/lib/${name}`,'runtime URL outside public client');
  const r=await fetch(url,{signal:AbortSignal.timeout(30000)});assert(r.ok,`runtime ${name} HTTP ${r.status}`);const bytes=Buffer.from(await r.arrayBuffer());assert(sha(bytes)===pin.sha256,`public runtime drift ${name}`);publicRuntime.push({name,url:url.href,sha256:sha(bytes)});
 }
 const folder=`verification/${slot.id}/${input.stage}-${input.modelSha256.slice(0,16)}-${input.contextSha256.slice(0,16)}`;
 mkdirSync(resolve(ROOT,folder),{recursive:true});const modelPath=resolve(ROOT,folder,'model.glb'),sourcePath=resolve(ROOT,folder,'source.glb');writeFileSync(modelPath,input.modelBytes);writeFileSync(sourcePath,input.sourceBytes);
 const actual=await loadPlayerMesh(modelPath),source=await loadPlayerMesh(sourcePath);
 const box=new THREE.Box3().setFromObject(actual.root),actualBounds={min:box.min.toArray(),max:box.max.toArray()};
 validatePlan(input.before,{...slot,bounds:actualBounds});boundsGate(actualBounds,slot.bounds);
 const sourceEquivalence=compareSurfaces(source.root,actual.root);assert(sourceEquivalence.pass,'served/source surface probe mismatch');
 const neighbors=[];
 for(const n of input.neighbors){
  if(!n.lib)continue;const file=resolve(ROOT,folder,`${n.id}.glb`);assert(/^[-a-zA-Z0-9_]+$/.test(n.id),'unsafe neighbor ID');writeFileSync(file,n.bytes);
  const loaded=await loadPlayerMesh(file);neighbors.push(prepareNeighbor(loaded,slot,n));
 }
 const routes=[];for(const pin of slot.routes){
  const contract=JSON.parse(readPin(pin).toString());assert(contract.id===slot.id&&contract.sha256===slot.sha256,`route bound to wrong model: ${pin.file}`);
  const collide=slot.collisionAmendment?.to??input.capturedHost.collide??undefined;
  const k={...contract,pos:slot.pos,yaw:slot.yaw,scale:slot.scale,collide};
  const declaredTerrainY=k.terrainY;k.terrainY=bindTerrain(k.terrainY,slot);
  const framed=applyProofFrame(actual.root,neighbors,k);
  const report:any=pin.mode==='room'?verifyPlayerMesh(framed.root,framed.contract,framed.neighbors):probeApproach(framed.root,framed.contract,framed.neighbors);
  report.proofFrameY=k.proofFrameY??0;report.terrainBinding={declaredTerrainY,effectiveHostLocalY:k.terrainY,hostElevation:slot.pos[1],worldHeight:0};
  if(pin.mode==='room'){
   const supportFrame=applyProofFrame(actual.root,neighbors,k);
   const supportReplay=probeApproach(supportFrame.root,supportFrame.contract,supportFrame.neighbors);
   report.physicalSupport=supportReplay.physicalSupport;
   if(!report.physicalSupport.pass){report.status='FAIL';report.failures.push('Independent triangle support rejects unsupported browser-collider floor samples');}
  }
  routes.push({file:pin.file,sha256:pin.sha256,mode:pin.mode,report});
 }
 const review=JSON.parse(readPin(slot.review).toString());assert(review.modelSha256===slot.sha256&&review.visual?.verdict==='accepted'&&review.geometry?.verdict==='passed','missing pinned parent geometry/visual review');
 for(const pin of review.visual.files)readPin(pin);readPin(review.geometry.evidence);
 assert(!Object.values(input.state.mounts??{}).some((m:any)=>m.to===slot.id),'host has mounted occupant');
 assert(!Object.values(input.state.entities??{}).some((e:any)=>e.parent?.to===slot.id),'host has mounted child');
 const details={id:slot.id,stage:input.stage,sourceSha256:slot.sha256,modelSha256:input.modelSha256,contextSha256:input.contextSha256,publicRuntime,sourceEquivalence,actualBounds,routes,geometryReview:review.geometry,visualReview:review.visual,neighbors:input.neighbors.map((n:any)=>({id:n.id,sha256:n.sha256,lib:n.lib,decoded:!!n.lib}))};
 const reportFile=`${folder}/details.json`,bytes=Buffer.from(JSON.stringify(details,null,2));writeFileSync(resolve(ROOT,reportFile),bytes);
 assert(routes.every(r=>r.report.status==='PASS'),`functional route failed — ${reportFile}`);
 const checks=Object.fromEntries(['decodedGeometry','assemblyCoverage','routeSweeps','attachmentBacking','functional','publicRuntime','occupancy','sourceEquivalence','contextVisuals','envelope'].map(k=>[k,'passed']));
 const evidence=[{file:reportFile,sha256:sha(bytes)}];
 return {schema:'village-preflight-v1',id:slot.id,kind:slot.kind,stage:input.stage,sourceSha256:slot.sha256,modelSha256:input.modelSha256,contextSha256:input.contextSha256,verdict:'passed',checks,geometryScope:'Decoded candidate envelope, all supplied live-neighbor route sweeps, dense bidirectional source/served surface probes, source-bound parent visual/backing review.',neighbors:input.neighbors.map((n:any)=>({id:n.id,sha256:n.sha256,verdict:'passed',disposition:n.lib?'route-tested':'point-light',evidence})),evidence,limitations:['Full-byte decode, constrained original envelope, supplied-neighbor route sweeps, pinned parent visual/backing review; no universal whole-world solid-intersection certificate.','Source/served equivalence is bidirectional dense surface probing; actual served routes are rerun independently.','Mounted occupants checked; CPU player proof is not live interactive walking.']};
}
