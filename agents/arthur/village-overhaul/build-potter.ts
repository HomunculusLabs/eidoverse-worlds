// Owned potter lane. Offline only. bun .../build-potter.ts [--verify]
import * as THREE from 'three';
import { M,box,beam,finish } from './kit.ts';
import { texMat } from '../assets/glbwrite.ts';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco from 'draco3dgltf';
import assert from 'node:assert/strict';
declare const Bun:any;
export const BASE=import.meta.dir;
export const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
export const clay=texMat('potter-raw-clay',[0xb98260,0xb27b59,0xc08c68],{rough:.96,scale:2});
export const cream=texMat('potter-slipware',[0xdccba3,0xd2c19a],{rough:.44,scale:1});
export const blue=texMat('potter-blue-glaze',[0x506a78,0x587787],{rough:.27,metal:.15,scale:1});
export const green=texMat('potter-sage-glaze',[0x77866b,0x819174],{rough:.35,scale:1});
const plum=texMat('potter-plum-glaze',[0x7c6274,0x876a7b],{rough:.35});
export function mesh(g:any,n:string,geo:THREE.BufferGeometry,m:any,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.name=n;o.position.set(x,y,z);g.add(o);return o;}
export function cyl(g:any,n:string,r:number,h:number,x:number,y:number,z:number,m:any,rBottom=r){return mesh(g,n,new THREE.CylinderGeometry(r,rBottom,h,32),m,x,y,z);}
export function ring(g:any,n:string,r:number,t:number,x:number,y:number,z:number,m:any){const o=mesh(g,n,new THREE.TorusGeometry(r,t,8,48),m,x,y,z);o.rotation.x=Math.PI/2;return o;}
// Hollow turned vessels: continuous outer lip -> inner wall -> solid floor.
export function vessel(g:any,n:string,x:number,y:number,z:number,r:number,h:number,m:any,kind='jar'){
 const profile=kind==='bowl'?[[0,0],[.5,0],[.8,.2],[1,1],[.87,1],[.68,.3],[0,.22]]:kind==='bottle'?[[0,0],[.60,0],[.86,.12],[1,.48],[.88,.72],[.42,.82],[.40,1],[.27,1],[.29,.82],[.70,.67],[.79,.46],[.64,.18],[0,.15]]:[[0,0],[.61,0],[.87,.13],[1,.42],[.94,.73],[.76,.89],[.81,1],[.68,1],[.65,.89],[.79,.71],[.84,.43],[.72,.2],[0,.16]];
 return mesh(g,n,new THREE.LatheGeometry(profile.map(([a,b])=>new THREE.Vector2(a*r,b*h)),32),m,x,y,z);
}
export async function io(){return new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule(),'draco3d.encoder':await draco.createEncoderModule()});}
export function buildPotter(){
 const g=new THREE.Group();g.name='pottery-workshop';
 // Three grounded work islands, not a cosmetic room bounding slab. Fine limewash panels
 // and braced joinery support drying ware, the wedging surface, and the glaze table.
 for(const [x,z,w,d] of [[-1.21,-.22,.94,1.06],[1.13,-.22,1.04,1.06],[0,-.805,1.20,.36]])box(g,'stone_shoe',w,.075,d,x,.0375,z,M.stone);
 box(g,'left_workbench_panel',.82,.66,.12,-1.21,.405,-.63,M.lime);
 box(g,'right_workbench_panel',.91,.64,.12,1.13,.39,-.63,M.lime);
 for(const x of [-1.61,-.81,.68,1.57])for(const z of [-.64,.22]){
  box(g,'bench_leg',.10,.80,.11,x,.45,z,M.timber);
  box(g,'leg_iron_foot',.12,.12,.13,x,.135,z,M.iron);
 }
 // Lime-plaster wedging slab, clay stock beneath, drying bats on open lower rails.
 box(g,'wedging_table_frame',.99,.13,1.03,-1.21,.83,-.22,M.timber);
 box(g,'wedging_absorbent_plaster',.95,.065,.99,-1.21,.9275,-.22,M.lime);
 for(const x of [-1.60,-.82])box(g,'left_lower_rail',.075,.09,.94,x,.28,-.22,M.wood);
 for(let i=0;i<5;i++)box(g,'bat_stack',.51,.021,.35,-1.23,.30+i*.024,-.25,M.wood);
 // A clay block visibly rests on the slab, with a folded damp cloth on one end.
 box(g,'wedging_clay',.34,.10,.24,-1.27,1.01,-.18,clay);
 for(let i=0;i<5;i++)box(g,'folded_damp_cloth',.29,.015,.032,-1.29,1.068+i*.001,-.28+i*.03,M.lime);
 beam(g,'wire_cutter',[-1.48,.971,-.49],[-1.05,.971,-.49],.008,.008,M.iron);
 // Right slip/glaze counter, individual pots with visible hollow mouths.
 box(g,'glaze_counter_frame',1.08,.13,.99,1.13,.83,-.22,M.timber);
 box(g,'glaze_counter_cedar',1.07,.055,.98,1.13,.9225,-.22,M.wood);
 for(const [i,x] of [.83,1.11,1.39].entries())vessel(g,'glaze_cup_'+i,x,.95,.09,.105,.115,[plum,green,blue][i],'bowl');
 vessel(g,'slip_crock',1.37,.95,-.32,.17,.27,cream);
 beam(g,'brush_in_slip',[1.37,1.03,-.33],[1.43,1.35,-.34],.014,.014,M.wood);
 for(let i=0;i<3;i++)beam(g,'throwing_tool',[.75+i*.085,.954,-.25],[.75+i*.085,.954,-.52],.023,.014,M.wood);
 box(g,'clay_bin',.75,.25,.58,1.12,.215,-.22,clay);
 box(g,'bin_cloth',.80,.035,.60,1.12,.36,-.22,M.lime);
 // Full-width back rack, visible joinery and three staggered drying shelves.
 for(const x of [-1.60,.55,1.60])box(g,'rack_upright',.09,1.70,.10,x,.93,-.91,M.timber);
 for(const y of [.74,1.29,1.79]){
  box(g,'drying_shelf',3.30,.055,.37,0,y,-.785,M.wood);
  box(g,'shelf_front_lip',3.30,.04,.035,0,y+.035,-.59,M.timber);
  for(const x of [-1.53,.55,1.53])beam(g,'shelf_corbel',[x,y-.20,-.91],[x,y-.03,-.64],.045,.05);
 }
 beam(g,'rack_diagonal',[-1.55,.14,-.96],[.5,1.74,-.96],.045,.045);
 beam(g,'rack_diagonal',[.60,.14,-.96],[1.55,1.74,-.96],.045,.045);
 for(const [i,x] of [-1.37,-.88,-.36,.20,.84,1.38].entries())vessel(g,'greenware_'+i,x,1.32,-.79,.125,.25+(i%3)*.065,clay,i%3===0?'bottle':'jar');
 for(const [i,x] of [-1.34,-.72,-.12,.53,1.28].entries())vessel(g,'finished_ware_'+i,x,1.82,-.79,.145,i%2?.22:.29,[cream,blue,green][i%3],i%2?'bowl':'bottle');
 for(const [i,x] of [-.4,.12].entries())vessel(g,'spare_bowl_'+i,x,.77,-.79,.16,.10,cream,'bowl');
 // Exact live anchor is identity: origin [0,0,0], Y spin, origin pivot; all
 // rotating descendants are authored relative to that same baseline frame.
 const wheel=new THREE.Group();wheel.name='pwheel';g.add(wheel);
 ring(wheel,'iron_flywheel',.46,.03,0,.28,0,M.iron);
 cyl(wheel,'hub',.075,.10,0,.28,0,M.iron);
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3;
  const o=box(wheel,'cedar_spoke',.385,.065,.059,Math.cos(a)*.255,.28,Math.sin(a)*.255,M.wood);o.rotation.y=-a;
 }
 cyl(wheel,'rotating_spindle',.042,.73,0,.445,0,M.iron);
 cyl(wheel,'throwing_head',.21,.065,0,.82,0,M.wood,.14);
 ring(wheel,'head_edge',.198,.012,0,.85,0,M.iron);
 vessel(wheel,'wet_throw',0,.8525,0,.139,.22,clay);
 // Axis bearing has a genuine bore; no solid collar slices through moving wheel.
 ring(g,'lower_bearing',.077,.027,0,.145,0,M.iron);
 ring(g,'upper_bearing',.077,.027,0,.715,0,M.iron);
 box(g,'bearing_base',.30,.065,.30,0,.0325,0,M.stone);
 box(g,'bearing_rear_upright',.14,.76,.10,0,.445,-.545,M.timber);
 for(const y of [.145,.715])box(g,'bearing_arm',.10,.06,.46,0,y,-.29,M.iron);
 // Water vessel on its own low stone pad to the front-left, outside wheel sweep.
 cyl(g,'water_pad',.175,.05,-.69,.025,.41,M.stone);
 vessel(g,'water_pail',-.69,.05,.41,.16,.28,M.wood);
 cyl(g,'water_surface',.125,.008,-.69,.255,.41,blue);
 ring(g,'pail_hoop',.15,.012,-.69,.26,.41,M.iron);
 return g;
}
// The campaign writer emits packed U8 VEC3 color attributes with a 3-byte
// stride. Repack through NodeIO to valid four-byte vertex alignment without
// touching kit.ts/glbwrite.ts or recompressing/recoloring the authored model.
export async function finishRepacked(g:THREE.Group,id:string){
 const stats=finish(g,id),I=await io(),file=`${BASE}/build/${id}.glb`,d=await I.read(file);
 const accessor=(a:any)=>a?{type:a.getType(),normalized:a.getNormalized(),component:a.getComponentType(),data:sha(Buffer.from(a.getArray().buffer,a.getArray().byteOffset,a.getArray().byteLength))}:null;
 const fingerprint=(doc:any)=>({nodes:doc.getRoot().listNodes().map((n:any)=>[n.getName(),n.getWorldMatrix(),n.listChildren().map((c:any)=>c.getName())]),meshes:doc.getRoot().listMeshes().map((m:any)=>[m.getName(),m.listPrimitives().map((p:any)=>({indices:accessor(p.getIndices()),attributes:Object.fromEntries(p.listSemantics().sort().map((s:string)=>[s,accessor(p.getAttribute(s))])),material:p.getMaterial()?.getName()}))]),images:doc.getRoot().listTextures().map((t:any)=>sha(t.getImage()))});
 const prior=fingerprint(d),b=await I.writeBinary(d),after=await I.readBinary(b);assert.deepEqual(fingerprint(after),prior);
 writeFileSync(file,b);stats.sha256=sha(b);stats.bytes=b.length;
 writeFileSync(`${BASE}/build/${id}.json`,JSON.stringify({...stats,exportPacking:'campaign finish then lossless NodeIO aligned repack'},null,2));
 console.log(JSON.stringify({id,stage:'FINAL_ALIGNED',sha256:stats.sha256,bytes:b.length}));return stats;
}
export async function validateGLB(id:string){
 const validator=await import(process.env.GLTF_VALIDATOR_MODULE??'/tmp/nx-town-potter-kiln-validator/node_modules/gltf-validator/index.js');
 const b=readFileSync(`${BASE}/build/${id}.glb`),r=await validator.default.validateBytes(new Uint8Array(b),{uri:id+'.glb'});
 writeFileSync(`${BASE}/build/${id}-validation.json`,JSON.stringify({sha256:sha(b),...r},null,2));
 console.log(JSON.stringify({id,sha256:sha(b),issues:r.issues}));assert.equal(r.issues.numErrors,0);assert.equal(r.issues.numWarnings,0);
}
export async function decodeEvidence(id:string){
 const I=await io();const file=`${BASE}/build/${id}.glb`, bytes=readFileSync(file),d=await I.readBinary(bytes);
 const {loadPlayerMesh}=await import('../cabin-overhaul/verify-player.ts');const loaded=await loadPlayerMesh(file);
 const b=new THREE.Box3().setFromObject(loaded.root,true),contracts=JSON.parse(readFileSync(`${BASE}/before/contracts.json`,'utf8'));
 const c=contracts.find((e:any)=>e.id===id),folded=JSON.parse(readFileSync(`${BASE}/before/folded-hosts.json`,'utf8'))[id];
 for(const k of ['pos','yaw','scale'])assert.deepEqual(c[k],folded[k]);assert.deepEqual(c.comp,folded.comp??{});
 const before=await loadPlayerMesh(`${BASE}/before/${id}.glb`),bb=new THREE.Box3().setFromObject(before.root,true);
 const pin=JSON.parse(readFileSync(`${BASE}/before/downloads.json`,'utf8')).find((p:any)=>p.id===id);assert(pin);assert.equal(before.sha256,pin.sha256,'served baseline pin drift');
 if(id==='nx-town-potter'){const bd=await I.read(`${BASE}/before/${id}.glb`),old=bd.getRoot().listNodes().filter(n=>n.getName()==='pwheel'),next=d.getRoot().listNodes().filter(n=>n.getName()==='pwheel');assert.equal(old.length,1);assert.equal(next.length,1);assert.deepEqual(next[0].getWorldMatrix(),old[0].getWorldMatrix(),'actual baseline pivot/frame changed');}
 for(const a of ['x','z'] as const){assert(b.min[a]>=bb.min[a]-.001,`${a} min envelope`);assert(b.max[a]<=bb.max[a]+.001,`${a} max envelope`);}
 const scene=d.getRoot().getDefaultScene()!;let triangleCount=0;const nodes:any[]=[];
 scene.traverse(n=>{nodes.push({name:n.getName(),translation:n.getTranslation(),rotation:n.getRotation(),scale:n.getScale(),world:n.getWorldMatrix()});for(const p of n.getMesh()?.listPrimitives()??[])triangleCount+=(p.getIndices()?.getCount()??p.getAttribute('POSITION')!.getCount())/3;});
 const out={id,sha256:sha(bytes),bytes:bytes.length,bounds:{min:b.min.toArray(),max:b.max.toArray()},baselineSha256:before.sha256,baselineBounds:{min:bb.min.toArray(),max:bb.max.toArray()},triangleCount,nodes,hostTuple:{pos:c.pos,yaw:c.yaw,scale:c.scale},comp:c.comp};
 writeFileSync(`${BASE}/build/${id}-decoded.json`,JSON.stringify(out,null,2));return {out,root:loaded.root,doc:d,contract:c};
}
export function soup(root:any){
 const ts:any[]=[];root.updateMatrixWorld(true);root.traverse((m:any)=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld).toArray());ts.push({name:m.name,v,min:[0,1,2].map(a=>Math.min(...v.map(x=>x[a]))),max:[0,1,2].map(a=>Math.max(...v.map(x=>x[a])))});}});return ts;
}
export async function functionality(id:string){
 const {out,root,doc,contract}=await decodeEvidence(id);
 const {loadPlayerAssembly,clipTriangle}=await import('../cabin-overhaul/verify-player.ts');
 const {probeApproach}=await import('./verify-approach.ts');
 const pins=JSON.parse(readFileSync(`${BASE}/neighbors/${id}.json`,'utf8')).neighbors;
 const neighbors=await loadPlayerAssembly(contract,pins),ts=soup(root),box0=new THREE.Box3().setFromObject(root,true);
 const {ExtendedTriangle}=await import('../../../client/node_modules/three-mesh-bvh/build/index.module.js');
 const isP=id==='nx-town-potter';
 const k={id,scale:1,terrainY:0,waypoints:isP?[
  {name:'public-approach',pos:[.55,0,2.80]},{name:'clear-of-porch-foot',pos:[.55,0,1.20]},{name:'wheel-operator',pos:[0,0,1.07]},
  {name:'wedging-counter',pos:[-1.20,0,1.04]},{name:'wheel-return',pos:[0,0,1.07]},
  {name:'glaze-counter',pos:[1.15,0,1.04]}
 ]:[{name:'public-approach',pos:[0,0,3.40]},{name:'furnace-view-and-stoking',pos:[0,0,1.98]},
 {name:'limestone-charge',pos:[-1.8,0,1.98]},{name:'furnace-return',pos:[0,0,1.98]},
 {name:'slaking-front',pos:[1.95,0,1.98]}]};
 const access=probeApproach(root,k,neighbors);
 writeFileSync(`${BASE}/build/${id}-approach-contract.json`,JSON.stringify({...k,sha256:out.sha256,assembly:pins},null,2));
 writeFileSync(`${BASE}/build/${id}-approach.json`,JSON.stringify({...access,modelSha256:out.sha256},null,2));
 const protectedChecks:any[]=[];
 const overlap=(a:any,b:any)=>[0,1,2].every(i=>a.min[i]<=b.max[i]&&a.max[i]>=b.min[i]);
 const allowed=(poly:number[][],n:any)=>{
  if(['nx-town-roads','nx-approach-ne-lane-002'].includes(n.id)&&poly.every(p=>p[1]>=-.031&&p[1]<=.035))return 'ground-film-contact-only';
  if(n.id==='nx-artwalk-b12-kiln-heat-contours'&&[-.72,.72].some(x=>[.22,1.42].some(y=>poly.every(p=>Math.abs(p[0]-x)<=.056&&Math.abs(p[1]-y)<=.086&&p[2]>=1.130&&p[2]<=1.158))))return 'four-exact-mount-pad-volumes';
  if(n.id==='nx-sign-kiln-001'&&[-.24,.24].some(x=>poly.every(p=>Math.abs(p[0]-x)<=.054&&p[1]>=2.269&&p[1]<=2.391&&p[2]>=.634&&p[2]<=.852)))return 'two-sign-arm-socket-volumes';
  return null;
 };
 for(const n of neighbors){
  const nt=soup(n.root);let pairs=0,contacts=0;const bad:any[]=[],reasons:any={};
  for(const t of nt){
   const volume={min:t.min.map(x=>x-.0003),max:t.max.map(x=>x+.0003)};
   if(!overlap(volume,{min:box0.min.toArray(),max:box0.max.toArray()}))continue;
   for(const s of ts){if(!overlap(s,volume))continue;const poly=clipTriangle(s.v,volume.min,volume.max);if(poly.length<3)continue;
    const a=new THREE.Vector3(...poly[0]);let area=0;for(let i=1;i+1<poly.length;i++)area+=new THREE.Vector3(...poly[i]).sub(a).cross(new THREE.Vector3(...poly[i+1]).sub(a)).length()/2;if(area<1e-10)continue;
    const aTri=new ExtendedTriangle(...s.v.map(v=>new THREE.Vector3(...v))),bTri=new ExtendedTriangle(...t.v.map(v=>new THREE.Vector3(...v))),line=new THREE.Line3();
    if(!aTri.intersectsTriangle(bTri,line))continue;
    const intersection=[line.start.toArray(),line.end.toArray()];pairs++;const why=allowed(intersection,n);if(why){contacts++;reasons[why]=(reasons[why]??0)+1;}else if(bad.length<10)bad.push({host:s.name,neighbor:t.name,poly});
   }
  }
  protectedChecks.push({id:n.id,sha256:n.sha256,triangles:nt.length,method:'tight per-neighbor-triangle volume broadphase then exact ExtendedTriangle intersection; permitted contact measured on actual intersection segments',pairs,contacts,allowed:reasons,unauthorizedExamples:bad,pass:bad.length===0});
 }
 // A triangle crossing a volume while all vertices are outside must be detected.
 assert(clipTriangle([[-2,.5,0],[2,.5,0],[0,.5,2]],[-.1,0,-.1],[.1,1,.1]).length>=3);
 const rays:any[]=[];
 const ray=(name:string,origin:number[],direction:number[],minDist:number,maxDist:number)=>{
  const r=new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,4);
  root.traverse((m:any)=>{if(m.isMesh)m.material.side=THREE.DoubleSide;});
  const hit=r.intersectObject(root,true)[0];const ok=!!hit&&hit.distance>=minDist&&hit.distance<=maxDist;rays.push({name,origin,direction,nearest:hit?.distance??null,pass:ok});
 };
 if(!isP){
  for(const x of [-.72,.72])for(const y of [.22,1.42])ray('heat-ring-mount-backing',[x,y,1.22],[0,0,-1],.05,.09);
  for(const x of [-.24,.24])ray('sign-arm-backing',[x,2.33,.95],[0,0,-1],.09,.115);
  ray('open-furnace-not-a-flat-plaque',[0,.77,1.35],[0,0,-1],.30,2.5);
  ray('throat-depth',[0,3.25,0],[0,-1,0],2.8,3.3);
 }
 const result={id,sha256:out.sha256,status:access.status==='PASS'&&protectedChecks.every(x=>x.pass)&&rays.every(x=>x.pass)?'PASS':'FAIL',access,protectedChecks,rays,
  limitations:['Offline fixture assembly, not live terrain/world verification.','Both footprints stay below the served 16 m² automatic-room gate: potter box, kiln central pillar. Neither is certified walk-in.','Kiln ladder is a loading implement mesh; no climb component was invented.','No physical contact/visibility claim for unprovided objects.']};
 writeFileSync(`${BASE}/build/${id}-functionality.json`,JSON.stringify(result,null,2));
 console.log(JSON.stringify({id,status:result.status,collider:access.collider,walks:access.walks.map(w=>({from:w.from,to:w.to,pass:w.pass,maxPush:w.maxPush,geometryHits:w.geometryHits})),protected:protectedChecks.map(x=>({id:x.id,pass:x.pass,pairs:x.pairs,allowed:x.allowed,bad:x.unauthorizedExamples})),rays}));
 return result;
}
export async function assembly(id:string,version:'before'|'final'){
 const {mergeDocuments,unpartition}=await import('@gltf-transform/functions');const I=await io();
 const pins=JSON.parse(readFileSync(`${BASE}/neighbors/${id}.json`,'utf8')),h=pins.host;
 const d=await I.read(`${BASE}/${version==='before'?'before':'build'}/${id}.glb`),scene=d.getRoot().getDefaultScene()!;
 const members=pins.neighbors.filter((n:any)=>n.id.startsWith('nx-artwalk-')||n.id.startsWith('nx-sign-'));
 for(const n of members){
  const b=readFileSync(n.file);assert.equal(sha(b),n.sha256);const nd=await I.readBinary(b);
  for(const ext of nd.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();
  const map=mergeDocuments(d,nd),src=nd.getRoot().getDefaultScene()!,copied=map.get(src),group=d.createNode(n.id);
  const dx=n.pos[0]-h.pos[0],dz=n.pos[2]-h.pos[2],c=Math.cos(h.yaw),s=Math.sin(h.yaw);
  group.setTranslation([dx*c-dz*s,n.pos[1]-h.pos[1],dx*s+dz*c]);group.setRotation([0,Math.sin((n.yaw-h.yaw)/2),0,Math.cos((n.yaw-h.yaw)/2)]);group.setScale([n.scale/h.scale,n.scale/h.scale,n.scale/h.scale]);
  for(const child of copied.listChildren())group.addChild(child);scene.addChild(group);copied.dispose();
 }
 for(const ext of d.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();
 await d.transform(unpartition());const out=`${BASE}/build/${id}-assembly-${version}.glb`;await I.write(out,d);console.log(JSON.stringify({assembly:out,members:members.map(n=>n.id)}));
}
export async function testWheel(){
 const {out,root,doc}=await decodeEvidence('nx-town-potter');
 const motionPath=`${BASE}/../../../client/lib/motion.js`,world=readFileSync(`${BASE}/../../../client/lib/world.js`,'utf8');
 const lookup=world.slice(world.indexOf('const _partCache = new WeakMap();'),world.indexOf('// ---- mounting'));
 assert(lookup.includes('export function findPart(root, name)'));
 const state:any={entities:new Map(),comps:new Map(),now:1000};
 const evaluator=await import(`${BASE}/../../../client/lib/motioneval.js`),motionSource=readFileSync(motionPath,'utf8');
 const imports=motionSource.match(/^import \{.*\} from '.*';$/gm)!;assert.equal(imports.length,5);
 const body=lookup.replace('export function findPart','function findPart')+'\n'+motionSource.replace(/^import \{.*\} from '.*';$/gm,'').replace('export function tickMotion','function tickMotion')+'\nreturn tickMotion;';
 const tickMotion=new Function('THREE','camera','entities','comps','reindexCollider','serverNow',...Object.keys(evaluator),body)(THREE,{position:new THREE.Vector3()},state.entities,state.comps,()=>{},()=>state.now,...Object.values(evaluator));
 const wheel=new THREE.Group();wheel.name='pwheel';for(const child of [...root.children])if(child.name.startsWith('pwheel_'))wheel.add(child);root.add(wheel);
 const expected=doc.getRoot().listNodes().find(n=>n.getName()==='pwheel')!;assert.deepEqual(expected.getWorldMatrix(),[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
 const comp=JSON.parse(readFileSync(`${BASE}/before/contracts.json`,'utf8')).find((e:any)=>e.id==='nx-town-potter').comp;
 state.entities.set('nx-town-potter',root);state.comps.set('nx-town-potter',comp);
 const statics=root.children.filter(n=>n!==wheel),rest=statics.map(n=>n.matrixWorld.toArray());
 const poses:any[]=[];for(const t of [0,2.5,10,20,40]){state.now=1000+t*1000;tickMotion();root.updateMatrixWorld(true);const wanted=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),9*Math.PI/180*t);assert(wheel.quaternion.angleTo(wanted)<1e-6);assert.deepEqual(root.position.toArray(),[0,0,0]);assert.deepEqual(statics.map(n=>n.matrixWorld.toArray()),rest);poses.push({seconds:t,quaternion:wheel.quaternion.toArray(),pivot:wheel.position.toArray()});
  if(t===2.5){const I=await io(),pose=await I.read(`${BASE}/build/nx-town-potter.glb`);pose.getRoot().listNodes().find(n=>n.getName()==='pwheel')!.setRotation(wheel.quaternion.toArray());await I.write(`${BASE}/build/nx-town-potter-wheel-22-5deg.glb`,pose);}
 }
 state.comps.clear();tickMotion();assert(wheel.quaternion.angleTo(new THREE.Quaternion())<1e-8);
 const moving=soup(wheel),still=statics.flatMap(n=>soup(n));
 function radialDistance(v:number[][]){
  const q=v.map(x=>[x[0],x[2]]),cross=(a:number[],b:number[])=>a[0]*b[1]-a[1]*b[0];
  const signs=q.map((a,i)=>cross([q[(i+1)%3][0]-a[0],q[(i+1)%3][1]-a[1]],[-a[0],-a[1]]));
  const area=Math.abs(cross([q[1][0]-q[0][0],q[1][1]-q[0][1]],[q[2][0]-q[0][0],q[2][1]-q[0][1]]));
  if(area>1e-12&&(signs.every(x=>x>=0)||signs.every(x=>x<=0)))return 0;
  return Math.min(...q.map((a,i)=>{const b=q[(i+1)%3],dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,-(a[0]*dx+a[1]*dy)/l)):0;return Math.hypot(a[0]+t*dx,a[1]+t*dy)}));
 }
 const sweeps=moving.map(t=>({y0:t.min[1],y1:t.max[1],r:Math.max(...t.v.map(v=>Math.hypot(v[0],v[2])))}));
 let clearance=Infinity,pair:any=null;for(const s of still){const r=radialDistance(s.v);for(const m of sweeps){const dy=Math.max(0,s.min[1]-m.y1,m.y0-s.max[1]),dr=Math.max(0,r-m.r),distance=Math.hypot(dy,dr);if(distance<clearance){clearance=distance;pair={static:s.name,staticMin:s.min,staticMax:s.max,sweep:m};}}}
 const negatives={missingPartRejected:false,frozenPartRejected:false,crossingTriangleRejected:false};
 assert.throws(()=>assert.equal(doc.getRoot().listNodes().filter(n=>n.getName()==='MISSING').length,1));negatives.missingPartRejected=true;
 assert.throws(()=>assert(new THREE.Quaternion().angleTo(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2))<1e-6));negatives.frozenPartRejected=true;
 assert.equal(radialDistance([[-1,0,-1],[1,0,-1],[0,0,1]]),0);negatives.crossingTriangleRejected=true;
 const result={status:clearance>1e-4?'PASS':'FAIL',sha256:out.sha256,comp,frame:expected.getWorldMatrix(),poses,restRestored:true,staticsUnchanged:true,continuousSweep:{method:'union of per-moving-triangle Y intervals and filled swept discs; stationary filled-XZ-triangle radial distance plus Y separation gives a conservative continuous full-turn lower bound',movingTriangles:moving.length,stationaryTriangles:still.length,minimumClearance:clearance,closestPair:pair},negatives,engineHashes:{motion:sha(readFileSync(motionPath)),evaluator:sha(readFileSync(`${BASE}/../../../client/lib/motioneval.js`)),findPartSlice:sha(lookup)},limitations:['Verbatim repo tickMotion/evalPart bodies evaluated with imports replaced by explicit ambient bindings; unmodified motioneval module imported. Not full browser/live evaluator parity.','Unchanged component lacks t0, so existing per-client epoch fallback remains. No new t0 invented.']};
 writeFileSync(`${BASE}/build/nx-town-potter-motion.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));return result;
}
// Full-browser counterpart: actual GLTFLoader hierarchy and unmodified engine
// motion.js, with only ambient world/network/collider dependencies isolated.
export async function browserMotion(){
 const {chromium}=await import('playwright');const repo=`${BASE}/../../..`,enginePath=`${repo}/client/lib/motion.js`;
 const {resolve,dirname}=await import('node:path');const ep=resolve(enginePath),ev=resolve(repo,'client/lib/motioneval.js');
 const source=readFileSync(ep,'utf8'),evalSource=readFileSync(ev,'utf8'),world=readFileSync(resolve(repo,'client/lib/world.js'),'utf8');
 const start=world.indexOf('const _partCache = new WeakMap();'),end=world.indexOf('// ---- mounting',start);assert(start>=0&&end>start);const lookup=world.slice(start,end);
 const file=`${BASE}/build/nx-town-potter.glb`,bytes=readFileSync(file),hash=sha(bytes),comp=JSON.parse(readFileSync(`${BASE}/before/contracts.json`,'utf8')).find((e:any)=>e.id==='nx-town-potter').comp;
 const entry=`import * as THREE from 'three';import{GLTFLoader}from'three/addons/loaders/GLTFLoader.js';import{tickMotion}from'/engine/motion.js';import{entities,comps,setNow}from'review:environment';import{findPart}from'review:world';
 const assert=(p,m)=>{if(!p)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((x,i)=>Math.abs(x-b[i])<1e-8);
 const data=Uint8Array.from(atob(document.getElementById('model').textContent),c=>c.charCodeAt(0));
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');assert(hash===${JSON.stringify(hash)},'exact browser model hash');
 const gltf=await new GLTFLoader().parseAsync(data.buffer,''),root=gltf.scene;root.updateMatrixWorld(true);const wheel=findPart(root,'pwheel');assert(wheel,'exact pwheel missing');
 assert(same(wheel.matrixWorld.toArray(),[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),'live pivot frame');
 const moving=new Set();wheel.traverse(o=>moving.add(o));const statics=[];root.traverse(o=>{if(o.isMesh&&!moving.has(o))statics.push(o)});assert(statics.length>0&&wheel.children.length>0,'nonvacuous coverage');
 const rest=statics.map(o=>o.matrixWorld.toArray()),rootRest=root.matrixWorld.toArray();const isStatic=()=>same(root.matrixWorld.toArray(),rootRest)&&statics.every((o,i)=>same(o.matrixWorld.toArray(),rest[i]));
 entities.set('nx-town-potter',root);comps.set('nx-town-potter',${JSON.stringify(comp)});
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xcbd6df);scene.add(root,new THREE.HemisphereLight(0xffffff,0x48505a,2),new THREE.AmbientLight(0xffffff,.45));const sun=new THREE.DirectionalLight(0xfff1d4,3.2);sun.position.set(8,12,6);scene.add(sun);
 const camera=new THREE.PerspectiveCamera(48,960/720,.05,200);camera.position.set(1.9,1.65,2.65);camera.lookAt(0,.70,-.18);const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(960,720);renderer.setPixelRatio(1);document.body.appendChild(renderer.domElement);
 const poses=[];window.pose=t=>{setNow(1000+t*1000);tickMotion();root.updateMatrixWorld(true);const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),9*Math.PI/180*t);assert(wheel.quaternion.angleTo(q)<1e-6,'actual engine spin');assert(isStatic(),'root/static drift');assert(same(wheel.position.toArray(),[0,0,0]),'pivot drift');document.getElementById('label').textContent='LOCAL ONLY / REAL ENGINE / '+t+' seconds';renderer.render(scene,camera);const p={seconds:t,quaternion:wheel.quaternion.toArray(),pivot:wheel.position.toArray()};poses.push(p);return p;};
 window.finish=()=>{comps.clear();tickMotion();root.updateMatrixWorld(true);assert(wheel.quaternion.angleTo(new THREE.Quaternion())<1e-8,'rest restore');assert(isStatic(),'static restore');const missing=findPart(root,'missing-pwheel')===null;const frozen=new THREE.Quaternion().angleTo(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2))>1;statics[0].position.x+=1;root.updateMatrixWorld(true);const moved=!isStatic();statics[0].position.x-=1;root.updateMatrixWorld(true);assert(missing&&frozen&&moved,'negative controls');return{status:'PASS',sha256:hash,poses,staticMeshes:statics.length,movingMeshes:[...moving].filter(o=>o.isMesh).length,restRestored:true,staticTransformsUnchanged:true,negativeControls:{missingPartRejected:missing,frozenPartRejected:frozen,movingStaticRejected:moved}}};window.bearingDetail=()=>{camera.position.set(.85,.19,1.45);camera.lookAt(0,.19,0);document.getElementById('label').textContent='LOCAL ONLY / REAL ENGINE / lower bearing detail';renderer.render(scene,camera);return{camera:camera.position.toArray(),target:[0,.19,0]};};window.pose(0);window.ready=true;`;
 const virtual:any={entry,environment:`import * as THREE from 'three';export{THREE};export const camera=new THREE.PerspectiveCamera();export const entities=new Map(),comps=new Map();let now=1000;export const setNow=t=>{now=t};export const serverNow=()=>now;export const reindexCollider=()=>{};`,world:`export{entities,comps}from'review:environment';\n${lookup}`};
 const built=await Bun.build({entrypoints:['review:entry'],target:'browser',format:'esm',minify:true,plugins:[{name:'potter-real-engine',setup(b:any){
  b.onResolve({filter:/^review:/},(a:any)=>({path:a.path.slice(7),namespace:'review'}));b.onResolve({filter:/^\/engine\/motion\.js$/},()=>({path:ep}));
  b.onResolve({filter:/^\.\/(core|world|colliders|remotes)\.js$/},(a:any)=>{if(a.importer!==ep)return;return{path:a.path==='./world.js'?'world':'environment',namespace:'review'};});
  b.onLoad({filter:/.*/,namespace:'review'},(a:any)=>({contents:virtual[a.path],loader:'js',resolveDir:resolve(repo)}));
  b.onLoad({filter:/client\/lib\/motion\.js$/},()=>({contents:source,loader:'js',resolveDir:dirname(ep)}));
  b.onLoad({filter:/client\/lib\/motioneval\.js$/},()=>({contents:evalSource,loader:'js',resolveDir:dirname(ev)}));
 }}]});assert(built.success,built.logs.map(String).join('\n'));assert.equal(built.outputs.length,1);
 const bundle=await built.outputs[0].text(),out=`${BASE}/reviews/nx-town-potter-browser-motion`;mkdirSync(out,{recursive:true});
 const html=`<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src blob: data:;"><style>body{margin:0}#label{position:absolute;background:#111b;color:#fff;font:14px monospace;padding:6px}</style><div id="label"></div><script id="model" type="application/octet-stream">${bytes.toString('base64')}</script><script type="module">${bundle.replaceAll('</script','<\\/script')}</script>`;
 writeFileSync(`${out}/viewer.html`,html);const browser=await chromium.launch({headless:true});const errors:string[]=[],network:string[]=[],frames:any[]=[];
 try{const page=await browser.newPage({viewport:{width:960,height:720}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.route('**/*',r=>{if(/^https?:/.test(r.request().url())){network.push(r.request().url());return r.abort()}return r.continue()});
  await page.goto('file://'+out+'/viewer.html');await page.waitForFunction(()=>(window as any).ready,undefined,{timeout:30000});
  for(const t of [0,2.5,10,20,40]){const pose=await page.evaluate(t=>(window as any).pose(t),t),png=await page.screenshot({path:`${out}/t-${t}.png`});frames.push({file:`t-${t}.png`,sha256:sha(png),pose});}
  const bearingCamera=await page.evaluate(()=>(window as any).bearingDetail());const bearingPNG=await page.screenshot({path:`${out}/bearing-detail.png`});
  const r=await page.evaluate(()=>(window as any).finish());assert.equal(r.status,'PASS');assert.equal(r.sha256,hash);assert.equal(r.staticMeshes,10);assert.equal(r.movingMeshes,3);assert.deepEqual(errors,[]);assert.deepEqual(network,[]);assert.equal(sha(readFileSync(file)),hash);assert.equal(sha(readFileSync(ep)),sha(source));assert.equal(sha(readFileSync(ev)),sha(evalSource));
  const result={...r,frames,bearingDetail:{file:'bearing-detail.png',sha256:sha(bearingPNG),...bearingCamera},errors,externalRequests:network,provenance:{engineSha256:sha(source),evaluatorSha256:sha(evalSource),lookupSha256:sha(lookup),htmlSha256:sha(html),actualGLTFLoader:true,unmodifiedEngineModules:true},limitations:['Standalone file:// Chromium run; not live world or public served-runtime motion parity.','Ambient entities/comps/time/camera isolated; collider reindex no-op. Unchanged component retains local epoch fallback.']};
  writeFileSync(`${BASE}/build/nx-town-potter-browser-motion.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({...result,frames:frames.length}));return result;
 }finally{await browser.close()}
}
if(import.meta.main){
 if(process.argv.includes('--browser-motion'))await browserMotion();
 else if(process.argv.includes('--test')){const r=await functionality('nx-town-potter'),m=await testWheel();process.exitCode=r.status==='PASS'&&m.status==='PASS'?0:1;}
 else if(process.argv.includes('--assembly')){await assembly('nx-town-potter','before');await assembly('nx-town-potter','final');}
 else if(process.argv.includes('--verify')){const {out,doc}=await decodeEvidence('nx-town-potter');const n=doc.getRoot().listNodes().filter(n=>n.getName()==='pwheel');assert.equal(n.length,1);assert.deepEqual(n[0].getWorldMatrix(),[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);console.log(JSON.stringify(out));}
 else if(process.argv.includes('--validate'))await validateGLB('nx-town-potter');
 else await finishRepacked(buildPotter(),'nx-town-potter');
}
