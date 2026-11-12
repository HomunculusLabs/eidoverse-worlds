// Hall lane only. No network, no old builder imports, no live mutations.
import * as THREE from 'three';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {mergeDocuments,prune} from '@gltf-transform/functions';
import draco from 'draco3dgltf';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {M,box,beam,wall,window,roof,finish,transfer} from './kit.ts';
const BASE=import.meta.dir,OUT=`${BASE}/build`;mkdirSync(OUT,{recursive:true});
const sha=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule(),'draco3d.encoder':await draco.createEncoderModule()});
const pins=JSON.parse(readFileSync(`${BASE}/before/downloads.json`,'utf8'));
const host=JSON.parse(readFileSync(`${BASE}/before/contracts.json`,'utf8')).find((e:any)=>e.id==='nx-town-hall');
const protectedAll=JSON.parse(readFileSync(`${BASE}/before/protected.json`,'utf8'));
async function load(id:string){const b=readFileSync(`${BASE}/before/${id}.glb`);if(sha(b)!==pins.find((p:any)=>p.id===id).sha256)throw Error(`source hash drift ${id}`);return io.readBinary(b);}
function components(doc:any){const result:any[]=[];let ni=0;const scene=doc.getRoot().getDefaultScene();scene.traverse((node:any)=>{const mesh=node.getMesh();if(!mesh)return;for(const [pi,p]of mesh.listPrimitives().entries()){
 const a=p.getAttribute('POSITION'),ix=p.getIndices(),n=ix?ix.getCount():a.getCount(),world=new THREE.Matrix4().fromArray(node.getWorldMatrix());
 const triangles:any[]=[];const parent=Array.from({length:n/3},(_,i)=>i);const keys=new Map<string,number>();
 const root=(i:number):number=>parent[i]===i?i:parent[i]=root(parent[i]);
 for(let t=0;t<n/3;t++){const verts=[];for(let k=0;k<3;k++){const i=ix?ix.getScalar(t*3+k):t*3+k;const v=new THREE.Vector3().fromArray(a.getElement(i,[])).applyMatrix4(world).toArray();verts.push(v);const key=v.map(x=>Math.round(x*10000)).join(',');if(keys.has(key))parent[root(t)]=root(keys.get(key)!);else keys.set(key,t);}triangles.push({t,verts});}
 const groups=new Map<number,any[]>();for(const t of triangles){const r=root(t.t);if(!groups.has(r))groups.set(r,[]);groups.get(r)!.push(t);}
 let ci=0;for(const ts of groups.values()){const vs=ts.flatMap(t=>t.verts);result.push({key:`${node.getName()}/${pi}/${ci++}`,node:node.getName(),pi,triangles:ts.length,min:[0,1,2].map(a=>Math.min(...vs.map(v=>v[a]))),max:[0,1,2].map(a=>Math.max(...vs.map(v=>v[a]))),indices:ts.map(t=>t.t),p,nodeRef:node});}
}ni++;});return result;}
const baseline=await load(host.id);const islands=components(baseline);
const charter=await load('nx-artwalk-b1-hall-charter');
const inspect={host,sha256:pins.find((p:any)=>p.id===host.id).sha256,islands:islands.map(({p,nodeRef,indices,...x})=>x),charter:components(charter).map(({p,nodeRef,indices,...x})=>x)};
writeFileSync(`${OUT}/hall-baseline-decode.json`,JSON.stringify(inspect,null,2));
if(process.argv.includes('--inspect')){console.log(JSON.stringify(inspect,null,2));process.exit(0);}

// Select whole decoded, position-connected islands, never old source approximations.
const retain=islands.filter(c=>
 (c.node==='hl3_1'&&c.min[1]<3&&c.max[1]<3) ||
 (c.node==='hl3_2'&&c.key.endsWith('/0')) ||
 (c.node==='hl3_4'&&Number(c.key.split('/').at(-1))<=4) ||
 ['hl3_12','hl3_13','hl3_14','hl3_16','hl3_18','firebowl','fire'].includes(c.node) ||
 (c.node==='hl3_15'&&c.min[0]>0) || c.node.startsWith('lamp'));
const keepByPrim=new Map<any,Set<number>>();for(const c of retain){if(!keepByPrim.has(c.p))keepByPrim.set(c.p,new Set());for(const t of c.indices)keepByPrim.get(c.p)!.add(t);}
for(const node of [...baseline.getRoot().listNodes()]){const m=node.getMesh();if(!m)continue;for(const p of [...m.listPrimitives()]){const keep=keepByPrim.get(p);if(!keep){m.removePrimitive(p);continue;}const old=p.getIndices(),ids:number[]=[];for(let t=0;t<(old?.getCount()??p.getAttribute('POSITION')!.getCount())/3;t++)if(keep.has(t))for(let k=0;k<3;k++)ids.push(old?old.getScalar(t*3+k):t*3+k);p.setIndices(baseline.createAccessor().setType('SCALAR').setArray(new Uint32Array(ids)).setBuffer(baseline.getRoot().listBuffers()[0]));}if(!m.listPrimitives().length)node.dispose();}
// Rehouse the malformed founding banner high above the west charter, now facing into
// the hall. Exact decoded vertices/materials survive; only this internal display pose changes.
const bannerSource=await load(host.id),bannerIslands=components(bannerSource);
for(const node of [...bannerSource.getRoot().listNodes()]){const m=node.getMesh();if(!m){node.dispose();continue;}if(!['hl3_15','hl3_17'].includes(node.getName())){node.dispose();continue;}for(const p of m.listPrimitives()){const cs=bannerIslands.filter(c=>c.p===p&&c.min[0]<0),ids=cs.flatMap(c=>c.indices.flatMap((t:number)=>[0,1,2].map(k=>p.getIndices()!.getScalar(t*3+k))));p.setIndices(bannerSource.createAccessor().setType('SCALAR').setArray(new Uint32Array(ids)).setBuffer(bannerSource.getRoot().listBuffers()[0]));}node.setRotation([0,Math.SQRT1_2,0,Math.SQRT1_2]);node.setTranslation([node.getName()==='hl3_17'?-4.17:-4.24,1.9,-4.35]);node.setName(`hall_rehoused_${node.getName()}`);}
for(const doc of [baseline,bannerSource]){for(const ext of doc.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();await doc.transform(prune());}

const g=new THREE.Group();
// Unchanged 9x6 occupied hall, FY=.2; flush thresholds with stone porch at .2.
box(g,'hall_foundation',9,.39,6,0,-.005,0,M.stone);
// 10mm joints stop at continuous support below. Boards finish exactly at original FY.
for(let j=0;j<26;j++)box(g,`hall_floor_board_${j}`,8.5,.025,5.54/26-.008,0,.1875,-2.77+(j+.5)*5.54/26,M.wood);
box(g,'hall_front_porch_floor',4.10,.4,1.84,0,0,3.92,M.stone);
box(g,'hall_rear_threshold',2.10,.4,.45,0,0,-3.18,M.stone);
// Wall openings: matching opposing entrances, generously cased rather than false trim.
const door={x:0,w:2.10,bottom:0,h:2.6};
for(const s of [-1,1]){
 const wins=[-3,3].map(x=>({x,w:1.2,bottom:1.15,h:1.40}));
 wall(g,`hall_wall_${s}`,9,3.25,.22,0,.2,s*2.89,0,[door,...wins]);
 wall(g,`hall_plinth_${s}`,9,.46,.30,0,.2,s*2.89,0,[{...door,h:.46}],M.stone);
 for(const x of [-3,3])window(g,`hall_frontwindow_${s}_${x}`,x,2.05,s*3.03,1.16,1.32,s<0?Math.PI:0,false);
 for(const x of [-4.36,-1.85,1.85,4.36]){box(g,`hall_facade_post_${s}_${x}`,.18,3.25,.26,x,1.825,s*2.90);box(g,`hall_post_plinth_${s}_${x}`,.28,.48,.34,x,.44,s*2.90,M.stone);}
 box(g,`hall_plate_${s}`,9,.21,.28,0,3.38,s*2.89);
 // Timber jambs leave 1.90m clear; lintels bottom 2.66m => 2.46m over floor.
 for(const x of [-1.0,1.0])box(g,`hall_door_jamb_${s}_${x}`,.2,2.6,.40,x,1.5,s*2.89);
 box(g,`hall_door_lintel_${s}`,2.38,.24,.40,0,2.78,s*2.89);
 for(const x of [-3,3]){beam(g,`hall_brace_${s}_${x}`,[x-Math.sign(x)*.66,2.83,s*3.04],[x+Math.sign(x)*.66,3.30,s*3.04],.09,.085);}
}
// End-wall inner planes stay x±4.28; west charter mounts on a precise recessed panel.
for(const s of [-1,1]){
 box(g,`hall_endwall_${s}`,.22,3.25,5.56,s*4.39,1.825,0,M.lime);
 // stone plinth is deliberately below the protected artwork and ledger shelves.
 box(g,`hall_endplinth_${s}`,.28,.46,5.7,s*4.40,.43,0,M.stone);
 for(const z of [-2.72,2.72])box(g,`hall_endpost_${s}_${z}`,.28,3.25,.18,s*4.38,1.825,z);
}
// Charter backing replaces plaster only in a bounded recess; front plane x=-4.321.
box(g,'hall_charter_backing',.021,1.91,2.94,-4.3315,2.0,0,M.wood);
// Custom roof solids: roof pitch evaluated at ACTUAL wall planes, no copied kit wedges.
function polygonPrism(name:string,pts:number[][],x:number,depth:number,material:THREE.Material){
 const shape=new THREE.Shape();shape.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))shape.lineTo(p[0],p[1]);shape.closePath();if(name==='hall_closed_end_1'){const hole=new THREE.Path();hole.absellipse(0,4.62,.46,.46,0,Math.PI*2,true,0);shape.holes.push(hole);}const o=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),material);o.name=name;o.rotation.y=Math.PI/2;o.position.x=x-depth/2;g.add(o);return o;
}
function slope(name:string,x:number,width:number,z1:number,y1:number,z2:number,y2:number){
 const len=Math.hypot(z2-z1,y2-y1),angle=-Math.atan2(y2-y1,z2-z1);
 const under=box(g,`${name}_deck`,width,.13,len,x,(y1+y2)/2,(z1+z2)/2,M.timber);under.rotation.x=angle;
 const count=Math.ceil(len/.36);
 for(let j=0;j<count;j++){const t=(j+.5)/count,z=z1+(z2-z1)*t,y=y1+(y2-y1)*t;const o=box(g,`${name}_course_${j}`,width,.060,len/count+.045,x,y+.10,z,j%3===1?M.roofAlt:M.roof);o.rotation.x=angle;
 for(let k=1;k<14;k++){const xx=x-width/2+k*width/14+(j%2)*.16;if(xx>x+width/2-.05)continue;const q=box(g,`${name}_joint_${j}_${k}`,.009,.009,len/count*.85,xx,y+.135,z,M.iron);q.rotation.x=angle;}}
}
for(const s of [-1,1]){
 slope(`hall_aisle_roof_${s}`,0,9.76,s*1.57,4.18,s*3.40,3.38);
 slope(`hall_nave_roof_${s}`,0,9.76,0,6.35,s*1.91,4.99);
 beam(g,`hall_low_eave_${s}`,[-4.92,3.38,s*3.4],[4.92,3.38,s*3.4],.17,.14);
 beam(g,`hall_high_eave_${s}`,[-4.92,4.99,s*1.91],[4.92,4.99,s*1.91],.15,.15);
 wall(g,`hall_clerestory_${s}`,9, .97,.15,0,4.12,s*1.63,0,[-3,-1.5,0,1.5,3].map(x=>({x,w:.98,bottom:.18,h:.60})));
 for(const x of [-3,-1.5,0,1.5,3])window(g,`hall_highlight_${s}_${x}`,x,4.60,s*1.725,.95,.58,s<0?Math.PI:0,false);
 box(g,`hall_clerestory_sill_${s}`,9.1,.13,.22,0,4.15,s*1.63);
 box(g,`hall_clerestory_plate_${s}`,9.2,.15,.24,0,5.04,s*1.63);
}
box(g,'hall_nave_ridge',10,.13,.22,0,6.46,0,M.iron);
for(const s of [-1,1]){
 const innerEave=4.99+(6.35-4.99)*(1-1.63/1.91);
 polygonPrism(`hall_closed_end_${s}`,[[-2.99,3.34],[2.99,3.34],[2.99,3.38+(3.40-2.99)*(4.18-3.38)/(3.40-1.57)],[1.63,4.18],[1.63,innerEave],[0,6.35],[-1.63,innerEave],[-1.63,4.18],[-2.99,3.38+(3.40-2.99)*(4.18-3.38)/(3.40-1.57)]],s*4.39,.22,M.lime);
 for(const zsign of [-1,1]){beam(g,`hall_nave_verge_${s}_${zsign}`,[s*4.89,4.99,zsign*1.91],[s*4.89,6.39,0],.13,.13);beam(g,`hall_aisle_verge_${s}_${zsign}`,[s*4.89,3.38,zsign*3.4],[s*4.89,4.18,zsign*1.57],.13,.13);}
 if(s<0)box(g,`hall_gable_king_${s}`,.26,2.95,.18,s*4.40,4.825,0);
 else {box(g,'hall_east_king_top',.26,1.18,.18,4.40,5.71,0);box(g,'hall_east_king_bottom',.26,.70,.18,4.40,3.68,0);}
}
// East record-wall face: actual round opening, leaded glass and deliberate tripartite framing.
for(const x of [4.525,4.265]){
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.49,.065,8,32),M.wood);rim.name='hall_east_oculus_rim';rim.rotation.y=Math.PI/2;rim.position.set(x,4.62,0);g.add(rim);
}
const pane=new THREE.Mesh(new THREE.CylinderGeometry(.459,.459,.036,32),M.glass);pane.name='hall_east_oculus_glass';pane.rotation.z=Math.PI/2;pane.position.set(4.39,4.62,0);g.add(pane);
for(const x of [4.53,4.25]){box(g,'hall_oculus_lead_v',.045,.89,.035,x,4.62,0,M.iron);box(g,'hall_oculus_lead_h',.045,.035,.89,x,4.62,0,M.iron);}
for(const z of [-1.60,1.60]){box(g,`hall_east_record_bay_${z}`,.17,2.73,.16,4.53,2.015,z);beam(g,`hall_east_fanbrace_${z}`,[4.53,3.45,z],[4.53,4.08,Math.sign(z)*.25],.10,.10);}
box(g,'hall_east_record_rail',.17,.14,5.50,4.53,3.35,0);
// Hammerbeam bents and braced roof structure, all circulation-visible members >3.1m.
for(const x of [-3.25,0,3.25]){
 for(const s of [-1,1]){beam(g,`hall_hammer_${x}_${s}`,[x,3.46,s*2.8],[x,3.46,s*1.56],.21,.21);beam(g,`hall_bent_knee_${x}_${s}`,[x,2.87,s*2.76],[x,3.46,s*1.84],.15,.15);beam(g,`hall_rise_post_${x}_${s}`,[x,3.46,s*1.63],[x,5.02,s*1.63],.16,.17);beam(g,`hall_principal_${x}_${s}`,[x,4.98,s*1.75],[x,6.23,0],.18,.19);beam(g,`hall_arch_brace_${x}_${s}`,[x,3.5,s*1.63],[x,4.5,s*.47],.14,.16);}
 beam(g,`hall_collar_${x}`,[x,4.50,-1.63],[x,4.50,1.63],.18,.18);
}
// Proper gabled porch in original apron, clear central approach under two masonry piers.
const porch=new THREE.Group();
for(const x of [-1.8,1.8]){box(porch,`hall_porch_pier_${x}`,.38,.58,.38,x,.49,4.58,M.stone);box(porch,`hall_porch_oak_${x}`,.23,2.54,.23,x,1.95,4.58);beam(porch,`hall_porch_brace_${x}`,[x,2.61,4.58],[x-Math.sign(x)*.55,3.15,4.58],.14,.14);beam(porch,`hall_porch_tie_${x}`,[x,3.22,3.0],[x,3.22,4.68],.18,.18);}
// Rotate a small gable roof 90deg; build its solids locally to avoid gable-gap helper.
const pg=new THREE.Group();
for(const s of [-1,1]){const len=Math.hypot(2.17,1.03),angle=s*Math.atan2(1.03,2.17);for(let k=0;k<7;k++){const t=(k+.5)/7;const o=box(pg,`hall_porch_slate_${s}_${k}`,1.70,.075,len/7+.04,0,4.38-1.03*t,s*2.17*t,k%3===1?M.roofAlt:M.roof);o.rotation.x=angle;}const o=box(pg,`hall_porch_soffit_${s}`,1.70,.12,len,0,3.765,s*1.085,M.wood);o.rotation.x=angle;}
transfer(pg,porch,0,0,3.94,Math.PI/2);
beam(porch,'hall_porch_front_tie',[-2.17,3.22,4.76],[2.17,3.22,4.76],.18,.18);
for(const s of [-1,1])beam(porch,`hall_porch_verge_${s}`,[s*2.17,3.28,4.77],[0,4.31,4.77],.15,.15);
beam(porch,'hall_porch_king',[0,3.25,4.77],[0,4.26,4.77],.13,.13);
for(const c of [...porch.children])g.add(c);
const porchClosureShape=new THREE.Shape();porchClosureShape.moveTo(-2.17,3.25);porchClosureShape.lineTo(2.17,3.25);porchClosureShape.lineTo(0,4.28);porchClosureShape.closePath();const porchClosure=new THREE.Mesh(new THREE.ExtrudeGeometry(porchClosureShape,{depth:.12,bevelEnabled:false}),M.wood);porchClosure.name='hall_porch_rear_closed_gable';porchClosure.position.z=3.04;g.add(porchClosure);
box(g,'hall_porch_closed_ridge',.16,.12,1.74,0,4.43,3.94,M.iron);
for(const x of [3.06,3.74])for(const z of [-1.16,1.16])box(g,`hall_table_leg_tenon_${x}_${z}`,.10,.09,.10,x,.982,z,M.wood);
// Hearth smoke hood follows the retained actual firebowl, with a substantial stone stack.
box(g,'hall_hearth_hood',1.34,.24,1.30,-2.2,3.02,0,M.iron);
for(const s of [-1,1])beam(g,`hall_hood_chain_${s}`,[-2.2,3.14,s*.48],[-2.2,4.55,s*.48],.025,.025,M.iron);
box(g,'hall_hearth_flue',.65,3.3,.66,-2.2,4.74,0,M.stone);
box(g,'hall_chimney_upper',.69,.71,.69,-2.2,6.645,0,M.stone);
box(g,'hall_chimney_cap',.93,.15,.91,-2.2,7.075,0,M.stone);
box(g,'hall_chimney_soot',.53,.015,.51,-2.2,7.1575,0,M.iron);
// Display joinery and useful interior craftsmanship; nothing is placed in the aisle.
for(const z of [-1.4,1.4]){box(g,`hall_bench_stretcher_${z}`,2.4,.08,.08,1.5,.43,z,M.wood);}
box(g,'hall_table_stretcher',.08,.11,2.2,3.4,.53,0,M.wood);
for(const y of [1.35,2.05])box(g,`hall_ledger_lip_${y}`,.045,.075,1.9,4.13,y,0,M.wood);
// Mount the exact low porch glows on restrained stone/oak sconces, not floating beads.
for(const x of [-1.15,1.15]){box(g,`hall_lantern_mount_${x}`,.14,.36,.14,x,1.11,3.17,M.timber);beam(g,`hall_lantern_arm_${x}`,[x,1.12,3.17],[x,1.12,3.35],.05,.05,M.iron);}
// Final wall carve: preserve charter artwork volume and its +X viewing face, no broad exemption.
// The left shell currently ends at -4.28; cut only charter rectangle to backing x=-4.321.
const west=g.children.find(o=>o.name==='hall_endwall_-1')!;g.remove(west);
wall(g,'hall_west_carved',5.56,3.25,.22,-4.39,.2,0,Math.PI/2,[{x:0,w:2.94,bottom:.85,h:2.01}]);
box(g,'hall_charter_recess_back',.169,2.01,2.94,-4.4155,2.055,0,M.lime);
const archStats=finish(g,'hall-architecture');
const finalDoc=await io.read(`${OUT}/hall-architecture.glb`),scene=finalDoc.getRoot().getDefaultScene()!;
for(const add of [baseline,bannerSource]){const map=mergeDocuments(finalDoc,add);for(const sourceScene of add.getRoot().listScenes()){const other=map.get(sourceScene) as any;for(const node of [...other.listChildren()])scene.addChild(node);other.dispose();}}
await finalDoc.transform(prune());
// Compact by referenced vertex indices. Merely replacing indices leaves stale POSITION
// bounds in GLTFLoader (notably the relocated banner's discarded east frieze).
for(const m of finalDoc.getRoot().listMeshes())for(const p of m.listPrimitives()){
 const old=p.getIndices();if(!old)continue;const remap=new Map<number,number>(),order:number[]=[],ix:number[]=[];
 for(let i=0;i<old.getCount();i++){const v=old.getScalar(i);if(!remap.has(v)){remap.set(v,order.length);order.push(v);}ix.push(remap.get(v)!);}
 for(const semantic of p.listSemantics()){const a=p.getAttribute(semantic)!,src=a.getArray()!,stride=a.getElementSize(),dst=new (src.constructor as any)(order.length*stride);for(let j=0;j<order.length;j++)for(let k=0;k<stride;k++)dst[j*stride+k]=src[order[j]*stride+k];p.setAttribute(semantic,finalDoc.createAccessor().setType(a.getType()).setNormalized(a.getNormalized()).setArray(dst).setBuffer(finalDoc.getRoot().listBuffers()[0]));}
 p.setIndices(finalDoc.createAccessor().setType('SCALAR').setArray(new Uint32Array(ix)).setBuffer(finalDoc.getRoot().listBuffers()[0]));
}
await finalDoc.transform(prune());
const targetBuffer=finalDoc.getRoot().listBuffers()[0];for(const a of finalDoc.getRoot().listAccessors())a.setBuffer(targetBuffer);for(const b of finalDoc.getRoot().listBuffers().slice(1))b.dispose();
const bytes=await io.writeBinary(finalDoc);writeFileSync(`${OUT}/nx-town-hall.glb`,bytes);
const finalIslands=components(finalDoc);const bounds={min:[0,1,2].map(a=>Math.min(...finalIslands.map(c=>c.min[a]))),max:[0,1,2].map(a=>Math.max(...finalIslands.map(c=>c.max[a])))};
if(bounds.min[0]<-5.001||bounds.max[0]>5.001||bounds.min[2]<-3.474||bounds.max[2]>4.855)throw Error('original XZ envelope exceeded');
const stats={id:host.id,sha256:sha(bytes),bytes:bytes.length,bounds,nodes:finalDoc.getRoot().listNodes().length,meshes:finalDoc.getRoot().listMeshes().length,triangles:finalIslands.reduce((n,c)=>n+c.triangles,0),pose:host,retainedIslands:retain.map(({p,nodeRef,indices,...x})=>x),retainedTriangles:retain.reduce((n,c)=>n+c.triangles,0),rehousedFoundingBanner:{oldAnchor:[-4.35,0,0],newAnchor:[-4.24,1.9,0],yaw:Math.PI/2,ornamentFaceX:-4.17},architectureSha256:archStats.sha256};
writeFileSync(`${OUT}/hall-final-stats.json`,JSON.stringify(stats,null,2));
const charterEntity=protectedAll.find((p:any)=>p.geom.id==='nx-artwalk-b1-hall-charter').geom;
const neighborSpec=JSON.parse(readFileSync(`${BASE}/neighbors/nx-town-hall.json`,'utf8'));
// Use absolute repository paths, exact frozen tuples and SHA pins, including network roads.
const assembly=neighborSpec.neighbors.map((e:any)=>({...e,file:new URL(`../../../${e.file}`,import.meta.url).pathname}));
const waypoints=[['front-ground',0,0,5.4],['front-porch',0,.2,4.3],['front-threshold',0,.2,2.9],['assembly-aisle',-.5,.2,2.05],['council-centre',-.5,.2,0],['council-table-station',1.7,.2,0],['council-return',-.5,.2,0],['hearth-view',-1.15,.2,0],['hearth-approach',-1.15,.2,-1.8],['speaker-approach',-3.75,.2,-1.8],['speaker-dais',-3.75,.45,-.75],['speaker-north-return',-3.75,.2,-1.8],['hearth-north-return',-1.15,.2,-1.8],['hearth-circuit',-1.15,.2,1.8],['charter-approach',-3.75,.2,1.8],['charter-reading',-3.75,.45,.65],['speaker-return',-3.75,.2,1.8],['hearth-south-return',-1.15,.2,1.8],['assembly-return',-.5,.2,1.8],['rear-aisle',-.5,.2,-2.0],['rear-threshold',0,.2,-2.9],['rear-ground',0,0,-4.1]].map(([name,x,y,z])=>({name,pos:[x,y,z]}));
const contract={id:host.id,sha256:stats.sha256,pos:host.pos,yaw:host.yaw,scale:host.scale,terrainY:0,doors:[{name:'plaza-front',x:0,z:[2.65,3.16],floorY:.2,width:1.8,headroom:2.4},{name:'rear-egress',x:0,z:[-3.16,-2.65],floorY:.2,width:1.8,headroom:2.4},{name:'porch-approach',x:0,z:[3.20,4.80],floorY:.2,width:1.4,headroom:2.2}],waypoints,protectedVolumes:[{id:charterEntity.id,min:[-4.321,1.114,-1.401],max:[-4.124,2.886,1.401]},{id:'charter-inward-view-face',min:[-4.124,1.115,-1.401],max:[-3.95,2.886,1.401]},{id:'hall-light-origin',min:[-.07,2.43,-.07],max:[.07,2.57,.07]}],assembly};
writeFileSync(`${OUT}/nx-town-hall-route-contract.json`,JSON.stringify(contract,null,2));
console.log(JSON.stringify({...stats,retainedIslands:stats.retainedIslands.length}));
// Read the emitted artifact independently. Compare every retained indexed attribute,
// material scalar, texture image and world matrix; no semantic-name-only preservation claim.
function fingerprint(node:any,p:any){const ix=p.getIndices(),n=ix?ix.getCount():p.getAttribute('POSITION').getCount();const attrs:any={};for(const key of p.listSemantics().sort()){const a=p.getAttribute(key),src=a.getArray(),d=a.getElementSize(),arr=[];for(let i=0;i<n;i++){const vi=ix?ix.getScalar(i):i;for(let k=0;k<d;k++)arr.push(src[vi*d+k]);}attrs[key]={type:a.getType(),normalized:a.getNormalized(),values:arr};}const m=p.getMaterial();return sha(Buffer.from(JSON.stringify({matrix:node.getWorldMatrix(),attrs,material:m?{base:m.getBaseColorFactor(),rough:m.getRoughnessFactor(),metal:m.getMetallicFactor(),emissive:m.getEmissiveFactor(),image:m.getBaseColorTexture()?sha(m.getBaseColorTexture().getImage()):null}:null})));}
const emitted=await io.readBinary(bytes);const preserved:any[]=[];
for(const source of [baseline,bannerSource])for(const n of source.getRoot().listNodes()){if(!n.getMesh())continue;const matched=emitted.getRoot().listNodes().find(x=>x.getName()===n.getName());if(!matched)throw Error(`retained node lost ${n.getName()}`);for(const [i,p]of n.getMesh()!.listPrimitives().entries()){const before=fingerprint(n,p),after=fingerprint(matched,matched.getMesh()!.listPrimitives()[i]);if(before!==after)throw Error(`retained attributes drift ${n.getName()}`);preserved.push({name:n.getName(),primitive:i,sha256:before,pass:true});}}
writeFileSync(`${OUT}/hall-preservation-report.json`,JSON.stringify({status:'PASS',modelSha256:sha(bytes),sourceSha256:inspect.sha256,checked:preserved,limitations:['Founding banner is deliberately reoriented/raised as documented; source comparison for it uses that declared internal transform.','Architecture and thresholds are new; furniture selection consists of complete served-byte islands.']},null,2));
// Companion assembly evidence only: these files are not deployment artifacts.
if(process.argv.includes('--review-assembly')){
 for(const [stage,hostBytes]of [['before',readFileSync(`${BASE}/before/nx-town-hall.glb`)],['after',bytes]] as const){
  const doc=await io.readBinary(hostBytes),sc=doc.getRoot().getDefaultScene()!;for(const ext of doc.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();
  for(const e of assembly){const nb=readFileSync(e.file);if(sha(nb)!==e.sha256)throw Error(`neighbor bytes drift ${e.id}`);const nd=await io.readBinary(nb);for(const ext of nd.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();const map=mergeDocuments(doc,nd),group=doc.createNode(`hall_review_neighbor_${e.id}`);const dx=e.pos[0]-host.pos[0],dz=e.pos[2]-host.pos[2],c=Math.cos(host.yaw),s=Math.sin(host.yaw);group.setTranslation([dx*c-dz*s,e.pos[1]-host.pos[1],dx*s+dz*c]);const a=e.yaw-host.yaw;group.setRotation([0,Math.sin(a/2),0,Math.cos(a/2)]).setScale([e.scale,e.scale,e.scale]);sc.addChild(group);for(const ss of nd.getRoot().listScenes()){const other=map.get(ss) as any;for(const n of [...other.listChildren()])group.addChild(n);other.dispose();}}
  await doc.transform(prune());const bf=doc.getRoot().listBuffers()[0];for(const a of doc.getRoot().listAccessors())a.setBuffer(bf);for(const b of doc.getRoot().listBuffers().slice(1))b.dispose();writeFileSync(`${OUT}/hall-review-assembly-${stage}.glb`,await io.writeBinary(doc));
 }
}

