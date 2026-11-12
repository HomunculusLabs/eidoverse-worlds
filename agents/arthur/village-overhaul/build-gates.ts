// LOCAL ONLY. Owns four gates; preserves exact host tuples and components.
// bun agents/arthur/village-overhaul/build-gates.ts [--verify|--assemblies]
// Automatic collision must FAIL; final route requires authorized spawn collide:'exact'.
import * as THREE from 'three';
import {box,beam,M,finish} from './kit.ts';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {mergeDocuments,unpartition} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
export const B=import.meta.dir;
export const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
export const readJSON=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
export const save=(p:string,v:any)=>{mkdirSync(`${B}/build`,{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
export const hosts=readJSON(`${B}/before/contracts.json`);
export const pins=readJSON(`${B}/before/downloads.json`);
export const ownIds=['nx-town-gate-n','nx-town-gate-s','nx-town-gate-e','nx-town-gate-w'];

// Extrude a completely closed X/Y profile along Z. No rotated slab bbox leak.
export function profile(g:THREE.Group,n:string,pts:number[][],z0:number,z1:number,m:THREE.Material){
 const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))s.lineTo(p[0],p[1]);s.closePath();
 const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false,curveSegments:1}),m);o.position.z=z0;o.name=n;g.add(o);return o;
}
export function roofCap(g:THREE.Group,n:string,x0:number,x1:number,z0:number,z1:number,eave:number,rise:number){
 const xc=(x0+x1)/2,half=(x1-x0)/2;
 profile(g,`${n}_closed_tympanum`,[[x0,eave-.09],[x1,eave-.09],[xc,eave+rise-.035]],z0+.04,z1-.04,M.timber);
 // Custom clipped wedge courses meet the exact same roof pitch; entire cap is closed.
 for(const side of [-1,1])for(let i=0;i<4;i++){
  const a=i/4,b=(i+1)/4,xa=xc+side*half*a,xb=xc+side*half*b,ya=eave+rise*(1-a),yb=eave+rise*(1-b);
  profile(g,`${n}_slate_${side}_${i}`,[[xa,ya-.035],[xb,yb-.035],[xb,yb+.045],[xa,ya+.045]],z0,z1,i%2?M.roofAlt:M.roof);
 }
 box(g,`${n}_ridge`,.13,.085,z1-z0,xc,eave+rise+.04,(z0+z1)/2,M.iron);
}

export function buildGates(){
 const g=new THREE.Group();g.name='village-gates-crafted-portal';
 for(const s of [-1,1]){
  const x=s*1.5;
  // Full legal +/-1.8m envelope is masonry footing, not invisible bait for classifier.
  box(g,`gate_foot_${s}`,.60,.14,.50,x,.07,0,M.stone);
  box(g,`gate_lower_plinth_${s}`,.54,.23,.46,x,.255,0,M.stone);
  box(g,`gate_plinth_cap_${s}`,.57,.085,.48,x,.4125,0,M.stone);
  // The two art faces are asymmetric: back -0.1475 (south), front +0.22 (north).
  // Flush uninterrupted support planes leave the original relief fully proud.
  box(g,`gate_pier_core_${s}`,.46,.76,.364,x,.835,.037,M.stone);
  for(let i=0;i<3;i++){
   const y=.48+i*.245;
   box(g,`gate_side_bed_${s}_${i}`,.010,.016,.33,x+s*.234,y,.035,M.iron);
  }
  box(g,`gate_oak_post_${s}`,.46,1.92,.364,x,2.16,.037,M.timber);
  box(g,`gate_capital_${s}`,.57,.16,.36,x,3.02,.035,M.wood);
  // Side-facing pegs are out of the protected art faces.
  for(const y of [1.35,2.88])box(g,`gate_tenon_${s}_${y}`,.035,.055,.11,x+s*.247,y,.035,M.wood);
 }
 // Broad header face backs unchanged dawn/dusk artwork at +0.2m exactly.
 box(g,'gate_assembled_lintel',3.50,.54,.344,0,2.885,.027,M.timber);
 box(g,'gate_upper_lintel_cap',3.60,.14,.42,0,3.225,0,M.wood);
 // Low timber corbel band: central soffit >=2.43m; pendant ears live outboard.
 // No plaque hung into the route. Golden-top relief remains separate unchanged.
 const edge=[[-1.29,2.12],[-1.02,2.16],[-.84,2.20],[-.755,2.23],[-.71,2.425],[-.48,2.45],[0,2.46],[.48,2.45],[.71,2.425],[.755,2.23],[.84,2.20],[1.02,2.16],[1.29,2.12]];
 profile(g,'gate_hewn_corbel_arch',[...edge,[1.29,2.62],[-1.29,2.62]],-.145,.209,M.timber);
 for(const s of [-1,1]){
  // Load path from corbel shoulder into post; never a floating lintel.
  beam(g,`gate_brace_${s}`,[s*1.47,2.08,-.005],[s*1.04,2.67,-.005],.15,.21,M.wood);
 }
 roofCap(g,'gate_slate_weather_cap',-1.8,1.8,-.25,.24990,3.32,.37);
 return finish(g,'gates');
}

export async function makeIO(){return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule(),'draco3d.encoder':await draco3d.createEncoderModule()});}
export async function assembly(id:string,model:string,label:string){
 const io=await makeIO(),host=hosts.find((x:any)=>x.id===id),doc=await io.read(model),scene=doc.getRoot().getDefaultScene()!;
 const decoded=readJSON(`${B}/build/shrine-gates-baseline-decode.json`).find((x:any)=>x.id===id);
 const entities=readJSON(`${B}/before/protected.json`).map((x:any)=>x.geom).filter((x:any)=>decoded.art.some((a:any)=>a.id===x.id));
 for(const e of entities){
  const file=`${B}/before/${e.id}.glb`,pin=pins.find((x:any)=>x.id===e.id);if(sha(readFileSync(file))!==pin.sha256)throw Error(`art bytes drift ${e.id}`);
  const part=await io.read(file),source=part.getRoot().getDefaultScene()!,map=mergeDocuments(doc,part),group=doc.createNode(`UNCHANGED_COMPANION_${e.id}`);
  const dx=e.pos[0]-host.pos[0],dz=e.pos[2]-host.pos[2],c=Math.cos(host.yaw),s=Math.sin(host.yaw);
  group.setTranslation([(dx*c-dz*s)/host.scale,(e.pos[1]-host.pos[1])/host.scale,(dx*s+dz*c)/host.scale]);
  const yaw=e.yaw-host.yaw;group.setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]);group.setScale([e.scale/host.scale,e.scale/host.scale,e.scale/host.scale]);
  for(const node of source.listChildren())group.addChild(map.get(node));scene.addChild(group);
  const copied=map.get(source);if(copied)copied.dispose();
 }
 for(const ext of doc.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();
 await doc.transform(unpartition());
 const out=`${B}/build/${id}-${label}-assembly.glb`,bytes=Buffer.from(await io.writeBinary(doc));writeFileSync(out,bytes);
 const manifest={kind:'local-review-composite-only-not-deployable',hostId:id,hostSource:model,hostSha256:sha(readFileSync(model)),assemblySha256:sha(bytes),hostTuple:host,companions:entities.map((e:any)=>({...e,file:`${B}/before/${e.id}.glb`,sha256:pins.find((x:any)=>x.id===e.id).sha256})),transforms:'exact world tuple composed into unchanged host-local frame; original texture/materials copied, no geometry edits'};
 save(out.replace('.glb','.json'),manifest);return out;
}

// Default-scene bounds, full triangle counts, hash checks and immutable envelope proof.
export async function decodeCandidate(id:string,file:string){
 const {loadPlayerMesh,THREE:T}=await import('../cabin-overhaul/verify-player.ts');
 const c=hosts.find((x:any)=>x.id===id),pin=pins.find((x:any)=>x.id===id),before=await loadPlayerMesh(`${B}/before/${id}.glb`),after=await loadPlayerMesh(file);
 if(before.sha256!==pin.sha256)throw Error(`baseline pin mismatch ${id}`);
 const a=new T.Box3().setFromObject(after.root),b=new T.Box3().setFromObject(before.root);
 const axes=[0,2],amin=a.min.toArray(),amax=a.max.toArray(),bmin=b.min.toArray(),bmax=b.max.toArray();
 const envelope=axes.map(axis=>({axis,minDelta:amin[axis]-bmin[axis],maxDelta:amax[axis]-bmax[axis],within:amin[axis]>=bmin[axis]-.001&&amax[axis]<=bmax[axis]+.001,exactWithin1mm:Math.abs(amin[axis]-bmin[axis])<.001&&Math.abs(amax[axis]-bmax[axis])<.001}));
 if(envelope.some(x=>!x.within||!x.exactWithin1mm))throw Error(`envelope breach ${id}`);
 const stats={id,file,sha256:after.sha256,bytes:after.bytes,defaultSceneOnly:true,bounds:{min:amin,max:amax},baseline:{sha256:before.sha256,bounds:{min:bmin,max:bmax}},envelope,meshes:after.meshes,triangles:after.root.children.reduce((n:any,m:any)=>n+m.geometry.attributes.position.count/3,0),nodes:after.root.children.map((m:any)=>m.name),hostContract:c,compValuesUnchanged:c.comp};
 save(`${B}/build/${id}-decode.json`,stats);return {after,before,stats};
}

export async function surfaceAt(roots:any[],x:number,z:number,terrain=0){
 const {THREE:T}=await import('../cabin-overhaul/verify-player.ts');
 for(const r of roots){r.updateMatrixWorld(true);r.traverse((m:any)=>{if(m.isMesh)m.material.side=T.DoubleSide;});}
 const ray=new T.Raycaster(new T.Vector3(x,terrain+.54,z),new T.Vector3(0,-1,0),0,.55);
 const hits=ray.intersectObjects(roots,true);return hits.length?Math.max(terrain,hits[0].point.y):terrain;
}

export async function verifyGates(){
 const {loadPlayerAssembly,verifyPlayerMesh,clipTriangle,THREE:T}=await import('../cabin-overhaul/verify-player.ts');
 const all=[];
 for(const id of ownIds){
  const c=hosts.find((x:any)=>x.id===id),{after,stats}=await decodeCandidate(id,`${B}/build/gates.glb`);
  const neighborFile=`${B}/neighbors/${id}.json`,neighborContract=readJSON(neighborFile),art=readJSON(`${B}/build/shrine-gates-baseline-decode.json`).find((x:any)=>x.id===id).art;
  const ns=await loadPlayerAssembly(c,neighborContract.neighbors);
  const supportRoots=[after.root,...ns.map((n:any)=>n.root)];
  const supportSamples=[];for(let ix=0;ix<=14;ix++)for(let iz=0;iz<=8;iz++){const x=-.7+ix*.1,z=-.4+iz*.1;supportSamples.push({x,z,y:await surfaceAt(supportRoots,x,z)});}
  const floor=Math.max(...supportSamples.map(p=>p.y));
  const route=[];for(const [name,z] of [['outside',.63],['threshold',0],['inside',-.63]] as [string,number][]){route.push({name,pos:[0,await surfaceAt(supportRoots,0,z),z]});}
  // Door floor is actual decoded road top, which covers the older golden threshold.
  // Never lift a datum to conceal an obstruction: keep the measured support rays.
  save(`${B}/build/${id}-floor-samples.json`,{source:'downward rays through exact transformed host + every neighbor, capped below step-height',samples:supportSamples,maximum:floor,waypoints:route,goldenThresholdTop:id.endsWith('-n')?.051974911242723465:null});
  const k={...c,collide:'exact',sha256:after.sha256,terrainY:0,doors:[{name:'central-traversal',x:0,z:[-.40,.40],floorY:floor,width:1.4,headroom:2.2}],waypoints:route,protectedVolumes:art.map((a:any)=>({id:a.id,min:a.min,max:a.max})),assembly:neighborContract.neighbors};
  save(`${B}/build/${id}-route-contract.json`,k);
  const automatic=verifyPlayerMesh(after.root,{...k,collide:undefined},ns);
  save(`${B}/build/${id}-automatic-player.json`,automatic);
  const report={...verifyPlayerMesh(after.root,k,ns),approvedSpawnDelta:{collide:{before:null,after:'exact'},authority:'Parent mid-turn direction: user-facing bounded per-object gate4 correction authorized; no engine/comp delta'},modelSha256:after.sha256,sourceSha256:sha(readFileSync(import.meta.path)),neighborContractSha256:sha(readFileSync(neighborFile)),hostTuple:c,contractSha256:sha(Buffer.from(JSON.stringify(k,null,2)+'\n'))};
  save(`${B}/build/${id}-player.json`,report);
  // Distinguish the real protected overhead bbox pinch from the central triangle lane.
  const top=ns.find((n:any)=>n.id==='nx-artwalk-b4-golden-top');let northOverhead:any=null;
  if(top){const ys:number[]=[];top.root.updateMatrixWorld(true);top.root.traverse((m:any)=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,i+j).applyMatrix4(m.matrixWorld).toArray());ys.push(...clipTriangle(v,[-.7,-100,-.4],[.7,100,.4]).map((p:any)=>p[1]));}});northOverhead={fullArtMinY:art.find((a:any)=>a.id===top.id).min[1],trueThresholdTop:.051974911242723465,actualRoadSupportTop:floor,bboxGapAboveGoldenThreshold:art.find((a:any)=>a.id===top.id).min[1]-.051974911242723465,bboxGapAboveRoad:art.find((a:any)=>a.id===top.id).min[1]-floor,central14mTriangleMinY:Math.min(...ys),central14mTriangleHeadroom:Math.min(...ys)-floor,claim:'bbox-extents pinch exists outboard; transformed central triangles decide the specified 1.4m lane'};}
  const summary={id,sha256:after.sha256,geometryDoorHits:report.doors[0].hits,collider:report.collider,protected:report.protectedVolumes.map((x:any)=>({id:x.id,hits:x.hits})),status:report.status,failures:report.failures,northOverhead,stats,escalation:'Captured automatic classification is blocking center-pillar. Parent-authorized gate-only spawn collide:null→exact is REQUIRED for this PASS; all host comps/poses/envelopes unchanged. Route certifies full body beyond both gate faces at z=+/-0.63, not an extended road approach over the separate existing curb at |z|≈0.969.'};
  save(`${B}/build/${id}-verdict.json`,summary);all.push(summary);console.log(JSON.stringify({...summary,stats:undefined}));
 }
 save(`${B}/build/gates-verification.json`,all);
 if(all.some((x:any)=>x.status!=='PASS'))process.exitCode=1;
}

if(import.meta.main){
 if(process.argv.includes('--verify'))await verifyGates();
 else if(process.argv.includes('--assemblies'))for(const id of ownIds){await assembly(id,`${B}/before/${id}.glb`,'before');await assembly(id,`${B}/build/gates.glb`,'after');}
 else buildGates();
}
