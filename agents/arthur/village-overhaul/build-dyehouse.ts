// Owned dyehouse/market lane. No original-builder imports, network, placement or credentials.
// Build: bun agents/arthur/village-overhaul/build-dyehouse.ts
// Audit/ensemble: CABIN_PLAYER_RUNTIME_DIR=.../cabin-overhaul/runtime bun .../build-dyehouse.ts --audit [id]
import * as THREE from 'three';
import { M, box, beam, finish } from './kit.ts';
import { texMat } from '../assets/glbwrite.ts';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
export const BASE=import.meta.dir;
export const hash=(x:Buffer|Uint8Array|string)=>createHash('sha256').update(x).digest('hex');
export const T={
 indigo:texMat('dyer-indigo',[0x334e83,0x3a5b94,0x42609a],{rough:.87,scale:2,stripe:5}),
 pale:texMat('dyer-linen',[0xe1d8b9,0xd6ceb0],{rough:.94,scale:2,stripe:7}),
 madder:texMat('dyer-madder',[0x994f41,0xa95f4c],{rough:.9,scale:2,stripe:5}),
 weld:texMat('dyer-weld',[0xc49a45,0xaf8439],{rough:.9,scale:2,stripe:7}),
 blueWater:texMat('indigo-liquor',[0x42648b,0x4a709a],{rough:.24,metal:.28,cell:128}),
 redWater:texMat('madder-liquor',[0x985548,0xa66652],{rough:.25,metal:.24,cell:128}),
 yellowWater:texMat('weld-liquor',[0xb59a49,0xc4ad58],{rough:.25,metal:.24,cell:128}),
 brass:texMat('merchant-brass',[0xb9a16a,0xc3ad79],{rough:.42,metal:.65,cell:64}),
};
for(const [m,c] of [[T.blueWater,0x42648b],[T.redWater,0x985548],[T.yellowWater,0xb59a49]] as const){m.emissive.set(c);m.emissiveIntensity=.24;}
export function mesh(g:THREE.Group,n:string,geo:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.name=n;o.position.set(x,y,z);g.add(o);return o;}
export function cyl(g:THREE.Group,n:string,rt:number,rb:number,h:number,x:number,y:number,z:number,m:THREE.Material=M.wood,seg=16){return mesh(g,n,new THREE.CylinderGeometry(rt,rb,h,seg),m,x,y,z);}
export function torus(g:THREE.Group,n:string,r:number,t:number,x:number,y:number,z:number,m:THREE.Material=M.iron){const o=mesh(g,n,new THREE.TorusGeometry(r,t,5,20),m,x,y,z);o.rotation.x=Math.PI/2;return o;}
// Closed vertical-thickness roof wedge. Explicit X/Z clip avoids rotated-slab envelope creep.
export function slab(g:THREE.Group,n:string,x0:number,x1:number,z0:number,z1:number,y0:number,y1:number,t:number,m:THREE.Material){
 const v=[x0,y0,z0,x1,y0,z0,x1,y1,z1,x0,y1,z1,x0,y0-t,z0,x1,y0-t,z0,x1,y1-t,z1,x0,y1-t,z1];
 const idx=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5];
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,n,geo,m);
}
export function openRoof(g:THREE.Group,n:string,x0:number,x1:number,z0:number,z1:number,eave:number,rise:number){
 const mid=(z0+z1)/2;
 for(const [a,b,ya,yb] of [[z0,mid,eave,eave+rise],[mid,z1,eave+rise,eave]]){
  slab(g,n+'_deck',x0,x1,a,b,ya,yb,.10,M.wood);
  for(let i=0;i<5;i++){const u=i/5,v=(i+1)/5;slab(g,n+'_slate_'+i,x0,x1,a+(b-a)*u,a+(b-a)*v,ya+(yb-ya)*u+.068,ya+(yb-ya)*v+.068,.046,i%3===1?M.roofAlt:M.roof);}
 }
 box(g,n+'_ridge',x1-x0,.105,.14,(x0+x1)/2,eave+rise+.098,mid,M.iron);
 for(const z of [z0+.065,z1-.065])box(g,n+'_fascia',x1-x0,.18,.13,(x0+x1)/2,eave-.042,z);
 // Open gables: all framing terminates at actual roof undersides; no filled mismatched wedges.
 for(const x of [x0+.10,x1-.10])for(const z of [z0+.09,z1-.09])beam(g,n+'_rafter',[x,eave-.05,z],[x,eave+rise-.04,mid],.105,.105);
}
export function lamp(g:THREE.Group,x:number,y:number,z:number,hangY:number){
 box(g,'lantern_stem',.026,hangY-y-.12,.026,x,(hangY+y+.12)/2,z,M.iron);
 box(g,'lantern_cap',.22,.05,.20,x,y+.12,z,M.iron);box(g,'lantern_foot',.20,.04,.18,x,y-.12,z,M.iron);
 const glow=new THREE.Group();glow.name='glow';mesh(glow,'lantern_core',new THREE.IcosahedronGeometry(.085,1),M.amber,x,y,z);g.add(glow);
 for(const dx of [-.08,.08])for(const dz of [-.065,.065])box(g,'lantern_cage',.014,.22,.014,x+dx,y,z+dz,M.iron);
}
function vat(g:THREE.Group,x:number,z:number,m:THREE.Material,i:number){
 cyl(g,'vat_stone_base_'+i,.375,.395,.08,x,.04,z,M.stone);
 // Open ring of twelve coopered staves, liquid visibly below its rim; not a solid cylinder lid.
 for(let j=0;j<16;j++){const a=j*Math.PI/8;const o=box(g,'vat_stave_'+i+'_'+j,.13,.34,.045,x+Math.sin(a)*.325,.25,z+Math.cos(a)*.325,M.wood);o.rotation.y=a;}
 for(const y of [.15,.35])torus(g,'vat_hoop_'+i,.335,.013,x,y,z);
 cyl(g,'vat_liquid_'+i,.30,.30,.018,x,.385,z,m,24);
 torus(g,'vat_lip_'+i,.323,.027,x,.425,z,M.wood);
 // Paddle rests on the rim below the protected loom artwork's lowest Y=.48.
 beam(g,'vat_paddle_'+i,[x+.09,.38,z],[x+.29,.465,z-.10],.027,.025,M.wood);
}
function cloth(g:THREE.Group,name:string,x:number,m:THREE.Material){
 const a=new THREE.Group();a.name=name;const w=.56,h=.77,verts:number[]=[],idx:number[]=[];
 for(let j=0;j<=12;j++)for(let i=0;i<=12;i++){const u=i/12,v=j/12;verts.push(x+(u-.5)*w,2.29-v*h,.02+Math.sin(u*Math.PI*6)*.027*v);}
 for(let j=0;j<12;j++)for(let i=0;i<12;i++){const q=j*13+i;idx.push(q,q+13,q+1,q+1,q+13,q+14);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();
 const front=mesh(a,name+'_cloth',geo,m);const back=mesh(a,name+'_reverse',geo.clone(),m);back.geometry.setIndex(idx.flatMap((_,i)=>i%3===0?[idx[i],idx[i+2],idx[i+1]]:[]));back.geometry.computeVertexNormals();g.add(a);
 box(g,name+'_hem',w,.045,.03,x,1.54,.025,T.pale);
 for(const px of [x-.20,x+.20])box(g,'drying_peg',.03,.09,.07,px,2.29,.018,M.wood);
}
export function buildDyehouse(){
 const g=new THREE.Group();
 // Same inherited X/Z envelope: slab is the actual workshop paving, never collider padding.
 box(g,'washcourt_paving',3.275035858154297,.065,2.1913533210754395,.13751792907714844,.0325,.0499957799911499,M.stone);
 for(const x of [-1.31,1.31])for(const z of [-.87,.88]){
  box(g,'pier_foot',.30,.17,.30,x,.15,z,M.stone);box(g,'octave_post',.17,2.19,.17,x,1.33,z);
  box(g,'post_collar',.21,.065,.21,x,.27,z,M.iron);
 }
 // Lime windbreak genuinely backs the exact pinned crossing-loom artwork, with 2mm stand-off.
 box(g,'loom_windbreak',2.44,1.35,.16,0,.765,-.887,M.lime);
 box(g,'windbreak_stone',2.55,.20,.21,0,.18,-.887,M.stone);
 box(g,'windbreak_coping',2.52,.075,.20,0,1.4775,-.887,M.stone);
 for(const z of [-.87,.88]){
  box(g,'tie_beam',2.79,.19,.18,0,2.34,z);
  for(const x of [-1.31,1.31])beam(g,'knee_brace',[x,1.88,z],[x-Math.sign(x)*.43,2.30,z],.10,.11);
 }
 for(const x of [-1.31,1.31])box(g,'side_plate',.18,.18,1.94,x,2.34,.01);
 openRoof(g,'indigo_pavilion',-1.5,1.50,-1.0456808805465698,1.1456724405288696,2.47,.49);
 // Existing hanging sign stays at y2.05,z1.13. Short supported drop contacts the plate BACK, not its face.
 box(g,'fixed_sign_drop',.18,.60,.10,0,2.10,1.048);
 beam(g,'sign_tail_arm',[0,2.35,.87],[0,2.35,1.07],.12,.12);
 for(const [i,x] of [-.90,0,.90].entries())vat(g,x,.29,[T.blueWater,T.redWater,T.yellowWater][i],i);
 box(g,'drying_rail',2.42,.055,.055,0,2.31,.02,M.wood);
 for(const x of [-1.15,1.15])beam(g,'rail_hanger',[x,2.31,.02],[x,2.71,.02],.035,.035,M.iron);
 cloth(g,'dh_strip_blue',-.61,T.indigo);cloth(g,'dh_strip_bone',.61,T.pale);
 // Right-hand cutting/packing wing creates a recognizable cloth trade, not merely vats under a roof.
 box(g,'folding_bench',.28,.095,1.22,1.61,.82,.08,M.wood);
 for(const z of [-.43,.59])box(g,'bench_trestle',.19,.69,.14,1.61,.4275,z);
 for(let i=0;i<4;i++)box(g,'folded_dyed_cloth',.24,.043,.29,1.61,.89+i*.044,-.23,[T.indigo,T.indigo,T.madder,T.weld][i]);
 const bolt=cyl(g,'finished_indigo_bolt',.095,.095,.46,1.61,.96,.31,T.indigo,16);bolt.rotation.x=Math.PI/2;
 lamp(g,-1.199696369211924,1.62,.10096841931874645,2.34);
 const stats=finish(g,'nx-town-dyehouse');return stats;
}

// Offline audit of exact exported triangle soup and exact archived companion bytes.
export async function audit(id:string){
 const {loadPlayerMesh,loadPlayerAssembly,placeNeighborInHostFrame,clipTriangle,runtimeEvidence}=await import('../cabin-overhaul/verify-player.ts');
 const {probeApproach}=await import('./verify-approach.ts');
 const runtime=process.env.CABIN_PLAYER_RUNTIME_DIR;if(!runtime)throw Error('CABIN_PLAYER_RUNTIME_DIR must pin served runtime');
 const C=await import(runtime+'/colliders.js');const {decideSupportClass}=await import(runtime+'/supportclass.js');
 const all=JSON.parse(readFileSync(BASE+'/before/contracts.json','utf8'));const host=all.find((h:any)=>h.id===id);if(!host)throw Error(id);
 const pins=JSON.parse(readFileSync(BASE+'/before/downloads.json','utf8'));
 const before=await loadPlayerMesh(BASE+'/before/'+id+'.glb');if(before.sha256!==pins.find((p:any)=>p.id===id).sha256)throw Error('baseline pin drift');
 const loaded=await loadPlayerMesh(BASE+'/build/'+id+'.glb');
 const bb=new THREE.Box3().setFromObject(loaded.root),old=new THREE.Box3().setFromObject(before.root),size=bb.getSize(new THREE.Vector3());
 const failures:string[]=[];for(const a of ['x','z'] as const)if(Math.abs(bb.min[a]-old.min[a])>.001||Math.abs(bb.max[a]-old.max[a])>.001)failures.push('envelope drift '+a);
 const soup=(root:any)=>{root.updateMatrixWorld(true);const out:any[]=[];root.traverse((o:any)=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=3)out.push({name:o.name,v:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,i+k).applyMatrix4(o.matrixWorld).toArray())});});return out;};
 const tris=soup(loaded.root);
 function hits(min:number[],max:number[],exclude:(n:string)=>boolean=()=>false){let n=0;const names=new Set<string>();const lo=min.map(x=>x+.001),hi=max.map(x=>x-.001);for(const t of tris){if(exclude(t.name)||[0,1,2].some(a=>Math.max(...t.v.map((v:any)=>v[a]))<lo[a]||Math.min(...t.v.map((v:any)=>v[a]))>hi[a]))continue;const poly=clipTriangle(t.v,lo,hi);if(poly.length<3)continue;let area=0;const p=new THREE.Vector3(...poly[0]);for(let i=1;i+1<poly.length;i++)area+=new THREE.Vector3(...poly[i]).sub(p).cross(new THREE.Vector3(...poly[i+1]).sub(p)).length()/2;if(area>1e-12){n++;names.add(t.name);}}return {triangles:n,nodes:[...names]};}
 const ps=JSON.parse(readFileSync(BASE+'/before/protected.json','utf8'));
 const nearby=ps.filter((p:any)=>{const e=p.geom;return Math.hypot(e.pos[0]-host.pos[0],e.pos[2]-host.pos[2])<7;});
 const protection:any[]=[],companions:any[]=[];
 for(const p of nearby){const e=p.geom;if(!e.lib)continue;const pin=pins.find((q:any)=>q.id===e.id);if(!pin)continue;const a=await loadPlayerMesh(BASE+'/before/'+e.id+'.glb');if(a.sha256!==pin.sha256)throw Error('companion pin drift '+e.id);placeNeighborInHostFrame(a.root,host,e);companions.push({id:e.id,root:a.root,sha256:a.sha256});
  const volumes=a.root.children.map((o:any)=>{const b=new THREE.Box3().setFromObject(o);return {part:o.name,min:b.min.toArray(),max:b.max.toArray(),...hits(b.min.toArray(),b.max.toArray())};});
  const count=volumes.reduce((n:any,v:any)=>n+v.triangles,0);if(count)failures.push('protected volume intrusion '+e.id+': '+count);protection.push({id:e.id,sha256:a.sha256,pose:e,trianglesIntruding:count,volumes});
 }
 const isDye=id.includes('dyehouse');
 // Advertise the real OUTSIDE frontage, beyond the solid fitted host box and the dyer's low sign.
 const z=isDye?1.90:1.68;
 const serviceVolume={min:[isDye?-1.1:-1.72,.00,z-.32],max:[isDye?1.1:1.72,2.20,z+.32]};
 const service=hits(serviceVolume.min,serviceVolume.max);if(service.triangles)failures.push('public service strip geometry');
 C.clearColliders();C.fitCollider(id,before.root,{scale:host.scale,localFrame:true});
 const beforeFit=C.colliders.get(id);const baselineCollider={exact:!!beforeFit?.exact,pillar:!!beforeFit?.pillar};
 C.clearColliders();C.fitCollider(id,loaded.root,{scale:host.scale,localFrame:true});
 const autoFit=C.colliders.get(id);const defaultCandidateCollider={exact:!!autoFit?.exact,pillar:!!autoFit?.pillar};
 // Parent-authorized per-object null -> exact correction; NOT an engine or component change.
 C.clearColliders();C.fitCollider(id,loaded.root,{scale:host.scale,collide:'exact',localFrame:true});
 const fitted=C.colliders.get(id);const collider={exact:!!fitted?.exact,pillar:!!fitted?.pillar,classification:decideSupportClass({w:size.x,d:size.z,h:size.y}),bounds:{min:bb.min.toArray(),max:bb.max.toArray()}};
 const walks:any[]=[];
 for(const direction of [1,-1]){const a=isDye?1.1:1.65;let pos=new THREE.Vector3(-direction*a,0,z);let maxPush=0,maxFloor=0;const N=100;for(let i=0;i<=N;i++){const want=new THREE.Vector3(direction*(-a+2*a*i/N),0,z);pos.copy(want);const ground=C.resolveColliders(pos,()=>0);maxPush=Math.max(maxPush,pos.clone().sub(want).length());maxFloor=Math.max(maxFloor,Math.abs(ground));}const pass=maxPush<.001&&maxFloor<.001;walks.push({direction,samples:N+1,pass,maxPush,maxFloor,z,assumption:'flat local terrain=0; outside frontage only'});if(!pass)failures.push('outside collider service route');}
 C.clearColliders();
 // Physical backing witnesses, cast FROM the preserved board back toward the host.
 const backingInputs=isDye?[{id:'loom',xs:[-.95,0,.95],ys:[.58,.91,1.25],z:-.8051},{id:'dyer-sign-plate',xs:[-.06,0,.06],ys:[1.85,1.94,2.02],z:1.0999}]:[{id:'left-lissa',xs:[-1.55,-1,-.45],ys:[.44,.63,.81],z:.4024},{id:'right-lissa',xs:[.45,1,1.55],ys:[.44,.63,.81],z:.4024},{id:'market-tally',xs:[.40,1,1.60],ys:[.53,.62,.71],z:.3799}];
 const backing:any[]=[];for(const k of backingInputs)for(const x of k.xs)for(const y of k.ys){const ray=new THREE.Raycaster(new THREE.Vector3(x,y,k.z),new THREE.Vector3(0,0,-1),0,.07);const hit=ray.intersectObject(loaded.root,true)[0];backing.push({id:k.id,at:[x,y,k.z],pass:!!hit,distance:hit?.distance??null});if(!hit)failures.push('backing absent '+k.id);}
 const faceVolumes=isDye?[{id:'crossing-loom-exposed-field',min:[-1.10,.50,-.666],max:[1.10,1.33,1.145]},{id:'dyer-sign-face',min:[-.21,1.44,1.4201],max:[.21,1.76,2.0]}]:[{id:'left-lissa-face',min:[-1.70,.40,.516],max:[-.30,.86,1.1]},{id:'right-lissa-face',min:[.30,.40,.516],max:[1.70,.86,1.1]},{id:'tally-host-exclusion',min:[.30,.50,.439],max:[1.70,.74,1.1]}];
 const hostFaceClearance=faceVolumes.map(p=>({...p,...hits(p.min,p.max)}));for(const p of hostFaceClearance)if(p.triangles)failures.push('new host occludes artwork '+p.id);
 const inheritedTallyOcclusion:any[]=[];if(!isDye){const right=companions.find(n=>n.id==='nx-artwalk-b6-market-lissa-right');for(const x of [.48,.74,1,1.26,1.52]){const ray=new THREE.Raycaster(new THREE.Vector3(x,.60,.80),new THREE.Vector3(0,0,-1),0,.40);const h=ray.intersectObject(right.root,true)[0];inheritedTallyOcclusion.push({coinX:x,rightPlaqueFrontZ:h?.point.z??null,tallyFrontZ:.4380367398262024,obscured:!!h&&h.point.z>.43804});}}
 const expected=isDye?['dh_strip_blue','dh_strip_bone','glow']:['mk_awn_0','mk_awn_1','glow'];
 const raw=readFileSync(BASE+'/build/'+id+'.glb');const gltf=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)).toString());const names=gltf.nodes.map((n:any)=>n.name);for(const n of expected)if(!names.includes(n))failures.push('missing retained anchor '+n);
 const neighborsFile=BASE+'/neighbors/'+id+'.json';const neighborManifest=JSON.parse(readFileSync(neighborsFile,'utf8'));
 const fullAssembly=await loadPlayerAssembly(host,neighborManifest.neighbors);
 const routeContract={...host,terrainY:0,collide:'exact',sha256:loaded.sha256,waypoints:isDye?
  [{name:'plaza-left',pos:[-1.1,0,1.90]},{name:'indigo-front',pos:[-.85,0,1.49]},{name:'front-clearance',pos:[-.85,0,1.90]},{name:'right-clearance',pos:[.85,0,1.90]},{name:'weld-front',pos:[.85,0,1.49]},{name:'plaza-right',pos:[1.1,0,1.90]}]:
  [{name:'plaza-left',pos:[-1.65,0,1.68]},{name:'bread-approach',pos:[-1,0,1.68]},{name:'bread-counter',pos:[-1,0,.92]},{name:'bread-exit',pos:[-1,0,1.68]},{name:'produce-approach',pos:[1,0,1.68]},{name:'produce-counter',pos:[1,0,.92]},{name:'produce-exit',pos:[1,0,1.68]},{name:'plaza-right',pos:[1.65,0,1.68]}],assembly:neighborManifest.neighbors};
 const approach=probeApproach(loaded.root,routeContract,fullAssembly);
 // Preserve the ACTUAL full-assembly failure; never silently exempt the broad path collider.
 const pathColliderDiagnostic=!isDye?probeApproach(loaded.root,routeContract,fullAssembly.map((n:any)=>n.id==='nx-core-paths'?{...n,collide:'exact'}:n)):null;
 const existingPathBlocker=!isDye&&approach.status==='FAIL'&&pathColliderDiagnostic?.status==='PASS';
 if(approach.status!=='PASS'&&!existingPathBlocker)failures.push('whole-body exact assembled approach');
 const pathSupportWitness:any[]=[];if(!isDye){const n=fullAssembly.find((n:any)=>n.id==='nx-core-paths');for(const w of routeContract.waypoints){C.clearColliders();C.fitCollider(n.id,n.root,{scale:1,localFrame:true});const p=new THREE.Vector3(...w.pos);const actualGround=C.resolveColliders(p,()=>0);const ray=new THREE.Raycaster(new THREE.Vector3(w.pos[0],1,w.pos[2]),new THREE.Vector3(0,-1,0),0,2);const h=ray.intersectObject(n.root,true)[0];pathSupportWitness.push({station:w.name,browserGround:actualGround,geometryGround:h?.point.y??null,exact:!!C.colliders.get(n.id)?.exact});}C.clearColliders();}
 writeFileSync(BASE+'/build/'+id+'-approach-contract.json',JSON.stringify(routeContract,null,2));writeFileSync(BASE+'/build/'+id+'-approach.json',JSON.stringify({...approach,modelSha256:loaded.sha256,neighborManifestSha256:hash(readFileSync(neighborsFile)),helperSha256:hash(readFileSync(BASE+'/verify-approach.ts')),pathSupportWitness,diagnosticOnlyUnapprovedExactCorePaths:pathColliderDiagnostic,existingPathBlocker},null,2));
 const light=nearby.find((p:any)=>p.geom.id===id+'-l');const lightTransform=new THREE.Group();placeNeighborInHostFrame(lightTransform,host,light.geom);const lp=lightTransform.position.toArray();const lightVolume={min:lp.map((v:number)=>v-.035),max:lp.map((v:number)=>v+.035)};const lightObstruction=hits(lightVolume.min,lightVolume.max,n=>n.startsWith('glow'));if(lightObstruction.triangles)failures.push('fixed light emitter obstructed');
 const report={status:failures.length?'FAIL':existingPathBlocker?'HOLD_EXISTING_COMPANION_COLLIDER':'PASS_NON_ROOM',existingPathBlocker,id,approach:{status:approach.status,walks:approach.walks.length,neighborIds:approach.neighbors},fixedLight:{contract:light,hostLocal:lp,...lightVolume,...lightObstruction},modelSha256:loaded.sha256,baselineSha256:before.sha256,bytes:loaded.bytes,nodes:gltf.nodes.length,meshes:loaded.meshes,triangles:tris.length,sourceSha256:hash(readFileSync(BASE+(isDye?'/build-dyehouse.ts':'/build-market.ts'))),hostContract:host,componentsPreserved:host.comp,baselineCollider,defaultCandidateCollider,requiredPlacementOverride:{collide:'exact',previous:null,authority:'parent explicit scoped user-facing collision approval'},runtime:runtimeEvidence,collider,baselineBounds:{min:old.min.toArray(),max:old.max.toArray()},sameXZEnvelope:!failures.some(x=>x.includes('envelope')),protected:protection,hostFaceClearance,inheritedTallyOcclusion,service:{volume:serviceVolume,...service,walks},backing,retainedAnchorNames:expected,failures,limits:['Small non-room outdoor workstation. No internal doorway or walk-in PASS is asserted; verify-player.ts room CLI intentionally not applied.','Public-runtime colliders exercised on flat assumed local ground, not live terrain or placement.','Protected triangle-to-volume test uses decoded per-mesh boxes, no broad intrusion allowances.','Market tally is already obscured by the protected right lissa plaque; frozen companion transforms prevent repairing that inherited overlap.']};
 writeFileSync(BASE+'/build/'+id+'-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,id,sha:loaded.sha256,nodes:report.nodes,meshes:loaded.meshes,triangles:tris.length,collider,protection:protection.map(p=>[p.id,p.trianglesIntruding]),backing:backing.every(b=>b.pass),failures}));if(failures.length)process.exitCode=1;return report;
}

export async function ensemble(id:string,which:string){
 const {NodeIO,Document}=await import('@gltf-transform/core');const {ALL_EXTENSIONS}=await import('@gltf-transform/extensions');const {mergeDocuments}=await import('@gltf-transform/functions');const draco=(await import('draco3dgltf')).default;
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule(),'draco3d.encoder':await draco.createEncoderModule()});
 const doc=new Document();const scene=doc.createScene('exact-archived-companion-ensemble');doc.getRoot().setDefaultScene(scene);
 const host=JSON.parse(readFileSync(BASE+'/before/contracts.json','utf8')).find((h:any)=>h.id===id);
 const ps=JSON.parse(readFileSync(BASE+'/before/protected.json','utf8')).filter((p:any)=>p.geom.lib&&Math.hypot(p.geom.pos[0]-host.pos[0],p.geom.pos[2]-host.pos[2])<(id.includes('market')?4.1:2));
 const inputs=[{...host,file:BASE+(which==='before'?'/before/':'/build/')+id+'.glb'},...ps.map((p:any)=>({...p.geom,file:BASE+'/before/'+p.geom.id+'.glb'}))];const records:any[]=[];
 for(const e of inputs){const bytes=readFileSync(e.file),src=await io.readBinary(bytes);const roots=src.getRoot().getDefaultScene()!.listChildren();const map=mergeDocuments(doc,src);const group=doc.createNode(e.id);const dx=e.pos[0]-host.pos[0],dz=e.pos[2]-host.pos[2],c=Math.cos(host.yaw),s=Math.sin(host.yaw);group.setTranslation([(dx*c-dz*s)/host.scale,(e.pos[1]-host.pos[1])/host.scale,(dx*s+dz*c)/host.scale]);const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),e.yaw-host.yaw);group.setRotation(q.toArray());group.setScale([e.scale/host.scale,e.scale/host.scale,e.scale/host.scale]);for(const root of roots)group.addChild(map.get(root));scene.addChild(group);records.push({id:e.id,sha256:hash(bytes),pos:e.pos,yaw:e.yaw,scale:e.scale});}
 for(const e of doc.getRoot().listExtensionsUsed())if(e.extensionName==='KHR_draco_mesh_compression')e.dispose();
 const buffers=doc.getRoot().listBuffers();for(const a of doc.getRoot().listAccessors())a.setBuffer(buffers[0]);for(const b of buffers.slice(1))b.dispose();
 for(const s of doc.getRoot().listScenes())if(s!==scene)s.dispose();
 const out=BASE+'/build/'+id+'-ensemble-'+which+'.glb';const bytes=await io.writeBinary(doc);writeFileSync(out,bytes);writeFileSync(out.replace('.glb','.json'),JSON.stringify({status:'LOCAL_COMPOSITE_NOT_WORLD',sha256:hash(bytes),inputs:records},null,2));console.log(JSON.stringify({out,sha256:hash(bytes),inputs:records.length}));
}
if(import.meta.main){mkdirSync(BASE+'/build',{recursive:true});if(process.argv[2]==='--audit')await audit(process.argv[3]??'nx-town-dyehouse');else if(process.argv[2]==='--ensemble')await ensemble(process.argv[3]??'nx-town-dyehouse',process.argv[4]??'after');else buildDyehouse();}
