// LOCAL read-only forensic gate; no builder import, network, or host/companion mutation.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import {THREE} from '../../cabin-overhaul/verify-player.ts';
import {ExtendedTriangle} from '../../../../client/node_modules/three-mesh-bvh/src/index.js';
export const base=resolve(import.meta.dir,'..');
export const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
export const hash=(file:string)=>sha(readFileSync(file));
export const read=(file:string)=>JSON.parse(readFileSync(file,'utf8'));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
export async function decode(file:string){
 const bytes=readFileSync(file),doc=await io.readBinary(bytes),scene=doc.getRoot().getDefaultScene();if(!scene)throw Error('default scene required '+file);
 const ts:any[]=[];scene.traverse(node=>{const mesh=node.getMesh();if(!mesh)return;const m=new THREE.Matrix4().fromArray(node.getWorldMatrix());let owner=node;while(owner.getParentNode())owner=owner.getParentNode()!;
 mesh.listPrimitives().forEach((p,primitive)=>{if(p.getMode()!==4)throw Error('non triangles');const pos=p.getAttribute('POSITION')!,ix=p.getIndices();for(let i=0;i<(ix?.getCount()??pos.getCount());i+=3){const v=[0,1,2].map(k=>{const a=[0,0,0];pos.getElement(ix?ix.getScalar(i+k):i+k,a);return new THREE.Vector3().fromArray(a).applyMatrix4(m).toArray();});ts.push({node:node.getName(),owner:owner.getName(),primitive,triangleIndex:i/3,v});}});});
 return {doc,triangles:ts,sha256:sha(bytes),file};
}
export function bounds(ts:any[]){return {min:[0,1,2].map(a=>Math.min(...ts.flatMap(t=>t.v.map((v:any)=>v[a])))),max:[0,1,2].map(a=>Math.max(...ts.flatMap(t=>t.v.map((v:any)=>v[a]))))};}
export const inBox=(t:any,b:any,tol=1e-6)=>t.v.every((v:any)=>[0,1,2].every(a=>v[a]>=b.min[a]-tol&&v[a]<=b.max[a]+tol));
export const triangleHash=(ts:any[])=>sha(JSON.stringify(ts.map(t=>t.v.map((v:any)=>v.map((x:number)=>Number(x.toFixed(6))).join(',')).sort().join(';')).sort()));
export function nearest(a:any[],b:any[]){let d=Infinity,found:any=null;const p=new THREE.Vector3(),q=new THREE.Vector3();for(const x of a){const tx=new ExtendedTriangle(...x.v.map((v:any)=>new THREE.Vector3(...v)));for(const y of b){const bx=bounds([x]),by=bounds([y]),lower=Math.hypot(...[0,1,2].map(k=>Math.max(0,bx.min[k]-by.max[k],by.min[k]-bx.max[k])));if(lower>=d)continue;const ty=new ExtendedTriangle(...y.v.map((v:any)=>new THREE.Vector3(...v)));const gap=tx.distanceToTriangle(ty,p,q);if(gap<d){d=gap;found={gap,node:y.node,triangleIndex:y.triangleIndex,from:p.toArray(),to:q.toArray()};}}}return found;}
export async function diagnose(){
 const c=await decode(`${base}/build/court.glb`),old=await decode(`${base}/before/nx-court.glb`),f=await decode(`${base}/build/forge.glb`);
 const part=read(`${base}/build/court.json`).parts[576];if(part.name!=='outer_verge_cap')throw Error('part index drift');
 const cap=c.triangles.filter(t=>inBox(t,part)),rest=c.triangles.filter(t=>!cap.includes(t));if(cap.length!==12)throw Error('cap selection must be exact 12 box triangles');
 const peer=nearest(cap,rest),bb=bounds(cap),courtSource=readFileSync(`${base}/build-court.ts`,'utf8');
 const neighbors=read(`${base}/neighbors/nx-forge.json`),court=neighbors.neighbors.find((e:any)=>e.id==='nx-court'),board=neighbors.neighbors.find((e:any)=>e.id==='nx-artwalk-b29-strike-count'),sign=neighbors.neighbors.find((e:any)=>e.id==='nx-sign-smithy');
 const boardDoc=await decode(board.file),a=await decode(`${base}/build/forge-assembly-after.glb`),b=await decode(`${base}/build/forge-assembly-before.glb`);
 const offset=(h:any,e:any)=>{const dx=e.pos[0]-h.pos[0],dz=e.pos[2]-h.pos[2],c=Math.cos(h.yaw),s=Math.sin(h.yaw);return [(dx*c-dz*s)/h.scale,(e.pos[1]-h.pos[1])/h.scale,(dx*s+dz*c)/h.scale];};
 const rawBoard=boardDoc.triangles.filter(t=>t.node==='b29_0');if(rawBoard.length!==12)throw Error('B29 back selection changed');
 const expectedWrapper=new THREE.Matrix4().compose(new THREE.Vector3(...offset(neighbors.host,board)),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),board.yaw-neighbors.host.yaw),new THREE.Vector3().setScalar(board.scale/neighbors.host.scale));
 const expectedBoard=boardDoc.triangles.map(t=>({...t,v:t.v.map((v:any)=>new THREE.Vector3(...v).applyMatrix4(expectedWrapper).toArray())}));
 const frozenRecord=read(`${base}/before/protected.json`).find((x:any)=>x.geom.id===board.id);
 const boardTupleExact=['lib','pos','yaw','scale'].every(k=>JSON.stringify(board[k])===JSON.stringify(frozenRecord.folded[k]));
 const boardAfter=a.triangles.filter(t=>t.owner===board.id),boardBefore=b.triangles.filter(t=>t.owner===board.id),capAssembly=a.triangles.filter(t=>t.owner===court.id&&t.node===cap[0].node&&cap.some(x=>x.triangleIndex===t.triangleIndex));
 const boardLocal=await (async()=>{const {loadPlayerMesh,placeNeighborInHostFrame}=await import('../../cabin-overhaul/verify-player.ts');const l=await loadPlayerMesh(board.file);placeNeighborInHostFrame(l.root,court,board);const box=new THREE.Box3().setFromObject(l.root);return {min:box.min.toArray(),max:box.max.toArray()};})();
 const contractPins=read(`${base}/build/court-forge-input-integrity.json`),frozen=Object.entries(contractPins.sourcePins).map(([name,expected])=>({file:`before/${name}`,sha256:hash(`${base}/before/${name}`),pass:hash(`${base}/before/${name}`)===expected}));
 const items=read(`${base}/build/forge-assembly-after.json`).inputs;const selection=items.map((pin:any)=>{const e=pin.id===neighbors.host.id?neighbors.host:neighbors.neighbors.find((x:any)=>x.id===pin.id);return {id:pin.id,file:pin.file,sha256:hash(pin.file),manifestShaMatches:hash(pin.file)===pin.sha256,pos:e.pos,yaw:e.yaw,scale:e.scale,selection:['nx-forge','nx-court'].includes(e.id)?'candidate-host':'frozen-companion'};});
 const actualVertices=cap.map(t=>({node:t.node,primitive:t.primitive,triangleIndex:t.triangleIndex,v:t.v}));
 return {kind:'forensic-default-scene-triangles-not-a-repair',decision:'HOLD',sourceHashes:{court:hash(`${base}/build-court.ts`),forge:hash(`${base}/build-forge.ts`),kit:hash(`${base}/kit.ts`),self:hash(import.meta.path)},hostHashes:{court:c.sha256,forge:f.sha256,baselineCourt:old.sha256},frozenPins:frozen,assemblySelection:selection,
 upper:{imagePixel:[628,281],owner:'nx-court',origin:'new-host-part-not-baseline-or-sign',sourceFile:'build-court.ts',sourceLine:courtSource.split('\n').findIndex(l=>l.includes("box(g,'outer_verge_cap'"))+1,partIndex:576,partName:part.name,sourcePart:part,decodedBoundsCourtLocal:bb,triangles:actualVertices,assemblyBoundsForgeLocal:bounds(capAssembly),nearestOtherCourtTriangle:peer,remainingCourtBoundsIfCapRemoved:bounds(rest),baselineTrianglesEntirelyInCapBox:old.triangles.filter(t=>inBox(t,bb)).length,connected:peer.gap<=.001,authority:'OUTSIDE FORGE-ONLY OWNERSHIP. Parent must repair court, not forge.'},
 lower:{imagePixel:[740,544],owner:board.id,node:'b29_0',struckFaceTriangleIndex:4,origin:'unchanged-frozen-artwork-not-sign-or-host',originalPart:{name:'back',file:'../assets/mkv3-artwalk-b29.ts',line:26,sourceSha256:hash(`${base}/../assets/mkv3-artwalk-b29.ts`),rawDecodedBounds:bounds(rawBoard),rawTriangles:rawBoard,interpretation:'12-triangle forged backing box; source used only to recover semantic name, never rebuilt'},relativePlacementInCourt:offset(court,board),tupleMatchesCapturedFolded:boardTupleExact,capturedComponentBag:frozenRecord.geom.comp,assemblyMatchesExactFrozenTuple:triangleHash(expectedBoard)===triangleHash(boardAfter),file:board.file,sha256:boardDoc.sha256,downloadPinMatches:boardDoc.sha256===board.sha256,tuple:{lib:board.lib,pos:board.pos,yaw:board.yaw,scale:board.scale},sourceDefaultSceneNodes:boardDoc.doc.getRoot().listNodes().map(n=>n.getName()),sourceTriangles:boardDoc.triangles.length,assemblyBeforeTriangles:boardBefore.length,assemblyAfterTriangles:boardAfter.length,beforeTriangleHash:triangleHash(boardBefore),afterTriangleHash:triangleHash(boardAfter),geometryUnchanged:triangleHash(boardBefore)===triangleHash(boardAfter)&&boardBefore.length===boardAfter.length,courtLocalBounds:boardLocal,courtBaselineBounds:bounds(old.triangles),gapBeyondCourtRear:bounds(old.triangles).min[2]-boardLocal.max[2],forgeLocalBounds:bounds(boardAfter),signSeparate:{id:sign.id,sha256:hash(sign.file)},authority:'FROZEN COMPANION; no relocation/rebuild/removal or out-of-envelope backing authorized.'},limits:['Triangle-hash comparison rounds transformed coordinates to 1e-6 m, preserves multiplicity, ignores winding. Full frozen source SHA checks are exact.','Nearest separation uses default-scene actual triangles and ExtendedTriangle.distanceToTriangle in decoded court local metres.','Default static assembly, not live component evaluation. No world connection, upload, credentials, or commits.']};
}
if(import.meta.main){const r=await diagnose();writeFileSync(`${base}/build/forge-followup-geometry.json`,JSON.stringify(r,null,2));console.log(JSON.stringify({...r,upper:{...r.upper,triangles:r.upper.triangles.length}},null,2));}
