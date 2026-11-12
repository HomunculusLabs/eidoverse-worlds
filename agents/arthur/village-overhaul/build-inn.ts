// OFFLINE ONLY. Inn lane: frozen served baseline -> campaign architecture + exact retained furnishings.
import * as THREE from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { copyToDocument, unpartition } from '@gltf-transform/functions';
import draco from 'draco3dgltf';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { M, box, beam, wall, window, chimney, finish } from './kit.ts';
const BASE=import.meta.dir, OUT=resolve(BASE,'build');mkdirSync(OUT,{recursive:true});
const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
const read=(p:string)=>JSON.parse(readFileSync(resolve(BASE,p),'utf8'));
const host=read('before/contracts.json').find((x:any)=>x.id==='nx-town-inn');
const pins=read('before/downloads.json');
const io=new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()});
const baseline=readFileSync(resolve(BASE,'before/nx-town-inn.glb'));
if(sha(baseline)!==pins.find((p:any)=>p.id===host.id).sha256)throw Error('baseline bytes drift');
const doc=await io.readBinary(baseline);
// Weld position-equivalent UV/normal seam vertices, never assume material buckets are semantic parts.
const components:any[]=[];
for(const node of doc.getRoot().listNodes())for(const p of node.getMesh()?.listPrimitives()??[]){
 const pos=p.getAttribute('POSITION')!,ix=p.getIndices(),count=ix?.getCount()??pos.getCount();const parent=Array.from({length:count/3},(_,i)=>i),seen=new Map<string,number>();
 const root=(i:number):number=>parent[i]===i?i:(parent[i]=root(parent[i]));
 for(let i=0;i<count;i++){const v=pos.getElement(ix?ix.getScalar(i):i,[]);const k=v.map(v=>v.toFixed(6)).join(',');if(seen.has(k))parent[root(i/3|0)]=root(seen.get(k)!);else seen.set(k,i/3|0);}
 const sets=new Map<number,number[]>();for(let t=0;t<count/3;t++){const r=root(t);if(!sets.has(r))sets.set(r,[]);sets.get(r)!.push(t);}
 for(const ts of sets.values()){
  const bounds=new THREE.Box3();for(const t of ts)for(let k=0;k<3;k++){const i=t*3+k;bounds.expandByPoint(new THREE.Vector3(...pos.getElement(ix?ix.getScalar(i):i,[])).applyMatrix4(new THREE.Matrix4().fromArray(node.getWorldMatrix())));}
  components.push({index:components.length,node:node.getName(),material:p.getMaterial()?.getName()??null,min:bounds.min.toArray(),max:bounds.max.toArray(),triangles:ts.length,_p:p,_node:node,_ts:ts});
 }
}
writeFileSync(resolve(OUT,'inn-baseline-decoded.json'),JSON.stringify({modelSha256:sha(baseline),extensions:doc.getRoot().listExtensionsUsed().map(e=>e.extensionName),host,components:components.map(({_p,_node,_ts,...c})=>c)},null,2));
if(process.argv.includes('--inspect')){console.log(JSON.stringify(components.map(({_p,_node,_ts,...c})=>c)));process.exit(0);}
const g=new THREE.Group();g.name='inn-architecture';
const FY=.198, UY=3.08, rear=3.382568988800049;
// Closed polygon prism: vertical thickness preserves exact X/Z roof envelopes.
function plate(n:string,poly:number[][],thick:number,m:THREE.Material){
 poly=poly.filter((v,i)=>i===0||new THREE.Vector3(...v).distanceTo(new THREE.Vector3(...poly[i-1]))>1e-7);if(poly.length>2&&new THREE.Vector3(...poly[0]).distanceTo(new THREE.Vector3(...poly.at(-1)!))<1e-7)poly.pop();if(poly.length<3)return;const vs:number[]=[],uv:number[]=[];const emit=(a:number[],b:number[],c:number[])=>{for(const v of [a,b,c]){vs.push(...v);uv.push(v[0],v[2]);}};
 const down=(p:number[])=>[p[0],p[1]-thick,p[2]];
 // Ensure top winding has positive Y.
 let normal=new THREE.Vector3(...poly[1]).sub(new THREE.Vector3(...poly[0])).cross(new THREE.Vector3(...poly[2]).sub(new THREE.Vector3(...poly[0])));
 if(normal.y<0)poly=[...poly].reverse();
 for(let i=1;i+1<poly.length;i++){emit(poly[0],poly[i],poly[i+1]);emit(down(poly[0]),down(poly[i+1]),down(poly[i]));}
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];emit(a,down(a),b);emit(b,down(a),down(b));}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();const o:any=new THREE.Mesh(geo,m);o.name=n;g.add(o);
}
function clip(poly:number[][],f:(p:number[])=>number){const out:number[][]=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],fa=f(a),fb=f(b);if(fa>=-1e-9)out.push(a);if((fa>=0)!==(fb>=0)){const t=fa/(fa-fb);out.push(a.map((v,k)=>v+t*(b[k]-v)));}}return out;}
function infill(n:string,pts:number[][],axis:'x'|'z',at:number,depth=.2){
 const shape=new THREE.Shape();pts.forEach((p,i)=>i?shape.lineTo(p[0],p[1]):shape.moveTo(p[0],p[1]));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false});const o:any=new THREE.Mesh(geo,M.lime);o.name=n;
 if(axis==='x'){o.rotation.y=Math.PI/2;o.position.set(at-depth/2,0,0);}else o.position.z=at-depth/2;g.add(o);
}
// Existing room/plinth and a genuinely supported, deeper inhabited porch.
box(g,'inn-main-foundation',8,.398,6,0,-.001,0,M.stone);
box(g,'inn-porch-foundation',7.7,.398,1.900000095367432,0,-.001,3.950000047683716,M.stone);
// Floor stays below protected threshold inlay's .198 bottom, not over it.
for(const x of [-3.65,-3.15,-2.65,-2.15,-1.65,-1.15,-.65,-.15,.35,.85,1.35,1.85,2.35,2.85,3.35,3.65]){
 if(Math.abs(x)<.9)continue;box(g,'porch-deck-board',.018,.006,1.86,x,FY-.003,3.95,M.wood);
}
wall(g,'inn-front-lime',8,4.55-FY,.24,0,FY,2.82,0,[{x:0,w:1.82,bottom:0,h:2.302},{x:-3.2,w:1.3,bottom:0,h:4.352},{x:-1.72,w:.8,bottom:1.05,h:1.05},{x:2.1,w:1.18,bottom:1.05,h:1.05},{x:0,w:1.25,bottom:3.352,h:1.0}]);
wall(g,'inn-back-lime',8,4.60-FY,.24,0,FY,-2.88,0,[{x:-1.1,w:1.15,bottom:1.45,h:1.0},{x:2.4,w:1.05,bottom:3.2,h:.9}]);
for(const side of [-1,1])wall(g,'inn-side-lime',5.76,4.55-FY,.24,side*3.88,FY,0,Math.PI/2,[{x:side===1?-1:1.8,w:1.0,bottom:1.05,h:1.05},{x:-.2,w:1.1,bottom:3.2,h:.9}]);
window(g,'front-casement-left',-1.72,1.773,2.955,.8,1.05);window(g,'front-casement-right',2.1,1.773,2.955,1.18,1.05);
window(g,'gable-paired-window',0,4.05,2.955,1.25,1.0);
window(g,'back-tavern-window',-1.1,2.148,-3.015,1.15,1,Math.PI);window(g,'back-guest-window',2.4,3.848,-3.015,1.05,.9,Math.PI);
for(const side of [-1,1]){window(g,'side-tavern-window',side*4.015,1.773,side===1?1:-1.8,1,1.05,side*Math.PI/2);window(g,'side-guest-window',side*4.015,3.848,.2,1.1,.9,side*Math.PI/2);}
// Sockets and external art keep their precise world tuples. Backing ends before the lintel's z=2.945 face.
for(const x of [-.98,.98])box(g,'door-stone-jamb',.14,2.30,.3,x,FY+1.15,2.79,M.stone);
box(g,'lintel-art-backing',2.38,.56,.14,0,2.78,2.87,M.stone);
// Joinery reads as structural bays, not a slapped-on diagonal grid.
for(const x of [-3.88,-2.48,1.25,3.88]){box(g,'front-story-post',.15,4.5-FY,.15,x,(4.5+FY)/2,2.925);}
for(const side of [-1,1])for(const z of [-2.88,0,2.82])box(g,'side-frame-post',.15,4.5-FY,.16,side*3.99,(4.5+FY)/2,z);
for(const z of [-2.88,2.82]){if(z<0)box(g,'story-bressummer',8.05,.18,.18,0,3.03,z);else box(g,'story-bressummer-front',6.4,.18,.18,.65,3.03,z);box(g,'eaves-wall-plate',8.05,.15,.18,0,4.57,z);}
// Genuine stair opening, not the baseline's reverse-end hole. Guest furnishings remain at exact decoded coordinates.
// Floor edge x=-2.55 leaves a continuous 1.30m stair well.
box(g,'guest-floor-east',6.4,.18,5.64,.65,2.99,0,M.wood);
box(g,'guest-floor-west-north',1.30,.18,3.47,-3.2,2.99,-1.085,M.wood); // z -2.82..0.65
for(let i=0;i<7;i++){
 const top=(i+1)*.44,z=4.39-i*.65;box(g,'inn-stair-tread',1.12,.16,.65,-3.2,top-.08,z,M.wood);
}
// Last broad tread overlaps the gallery slab; no raised nosing in its approach.
beam(g,'stair-stringer-left',[-3.72,.27,4.70],[-3.72,2.98,.74],.15,.18);beam(g,'stair-stringer-right',[-2.68,.27,4.70],[-2.68,2.98,.74],.15,.18);
for(const x of [-3.72,-2.68]){beam(g,'stair-handrail',[x,1.30,4.39],x===-2.68?[x,3.65,.92]:[x,3.94,.49],.065,.065);for(let i=0;i<(x===-2.68?6:7);i++)box(g,'stair-baluster',.065,.86,.065,x,(i+1)*.44+.43,4.39-i*.65);}
box(g,'landing-guard',.07,.9,1.55,-2.58,3.53,1.85);box(g,'landing-guard-cap',.11,.08,1.65,-2.58,4.01,1.85);
// Seam-free intersecting cross-gable roof: two planes clipped at their exact valley, no hidden underlying slabs.
const peak=6.55, run=3.38, rise=1.98, slope=rise/run, crossSlope=1.28;
for(const side of [-1,1])for(let k=0;k<10;k++){
 const r0=k*run/10,r1=(k+1)*run/10;
 for(const sx of [-1,1]){
 let p=[[0,peak-slope*r0,side*r0],[sx*4.40,peak-slope*r0,side*r0],[sx*4.40,peak-slope*r1,side*r1],[0,peak-slope*r1,side*r1]];
 if(side===1)p=clip(p,v=>crossSlope*sx*v[0]-slope*v[2]);
 plate(`slate-main-${side}-${sx}-${k}`,p,.13,k%3===1?M.roofAlt:M.roof);
 }
}
for(const side of [-1,1])for(let k=0;k<5;k++){
 const a=k*1.57/5,b=(k+1)*1.57/5;let p=[[side*a,peak-crossSlope*a,0],[side*b,peak-crossSlope*b,0],[side*b,peak-crossSlope*b,3.38],[side*a,peak-crossSlope*a,3.38]];
 p=clip(p,v=>slope*v[2]-crossSlope*side*v[0]);plate(`slate-cross-${side}-${k}`,p,.13,k%3===1?M.roofAlt:M.roof);
}
for(const x of [-4,4])infill('closed-true-side-gable',[[-2.88,4.5],[-2.88,peak-slope*2.88-.20],[0,peak-.20],[2.82,peak-slope*2.82-.20],[2.82,4.5]],'x',x);
// Front: main eave wedge plus the tall central gable, clipped to the actual roof surface.
const fyroof=peak-slope*2.82-.20;infill('closed-front-eave',[[-4,4.5],[4,4.5],[4,fyroof],[-4,fyroof]],'z',2.82);
infill('closed-inn-cross-gable',[[-(peak-.20-fyroof)/crossSlope,fyroof],[0,peak-.20],[(peak-.20-fyroof)/crossSlope,fyroof]],'z',2.82);
infill('closed-back-eave',[[-4,4.55],[4,4.55],[4,peak-slope*2.88-.20],[-4,peak-slope*2.88-.20]],'z',-2.88);
for(const x of [-4.43,4.43])for(const s of [-1,1])beam(g,'slate-verge',[x,peak+.025,0],[x,peak-rise+.025,s*run],.14,.14);
box(g,'inn-main-ridge',9,.12,.19,0,peak+.075,0,M.iron);
box(g,'inn-rear-drip',8.92,.16,.18,0,peak-rise-.01,-rear,M.iron);
box(g,'inn-front-eave-right',2.96,.15,.14,2.92,peak-rise-.01,3.40);box(g,'inn-front-eave-left',2.96,.15,.14,-2.92,peak-rise-.01,3.40);
for(const s of [-1,1])beam(g,'cross-gable-carved-verge',[0,peak+.04,3.41],[s*1.54,peak-crossSlope*1.54+.04,3.41],.13,.13);
box(g,'cross-gable-ridge',.17,.12,3.52,0,peak+.07,1.69,M.iron);
// Stone chimney is seated in the tall roof, not floating above it.
chimney(g,'inn-chimney',-2.40,-1.2,4.4,7.02);
// Stepped porch roof: raised left stair bay provides honest standing headroom.
for(let k=0;k<5;k++){
 const z0=2.86+k*.386,z1=z0+.386,y=(z:number)=>3.63-(z-2.86)*.255;
 plate(`porch-slate-${k}`,[[-2.55,y(z0),z0],[3.84,y(z0),z0],[3.84,y(z1),z1],[-2.55,y(z1),z1]],.12,k%2?M.roofAlt:M.roof);
 const sy=(z:number)=>4.58-(z-2.86)*.746;plate(`stair-bay-slate-${k}`,[[-3.84,sy(z0),z0],[-2.55,sy(z0),z0],[-2.55,sy(z1),z1],[-3.84,sy(z1),z1]],.12,k%2?M.roofAlt:M.roof);
}
for(const x of [-3.72,-2.5,2.5,3.72]){
 // Front posts behind inherited double-sided tankard and lamp faces.
 box(g,'porch-stone-foot',.31,.22,.31,x,FY+.11,4.42,M.stone);box(g,'porch-oak-column',.18,2.70,.18,x,FY+1.57,4.42);
 if(x!==-3.72)beam(g,'porch-knee-brace',[x,2.5,4.42],[x+(x>0?-.45:.45),3.02,4.42],.10,.10);
}
box(g,'porch-fascia',7.78,.20,.14,0,3.06,4.79);box(g,'porch-rear-plate',6.35,.13,.16,.665,3.46,2.93);
infill('stair-bay-closed-cheek',[[-4.79,3.13],[-2.86,3.54],[-2.86,4.45],[-4.79,3.13]],'x',-2.55,.08);
for(const x of [-3.72,3.72])beam(g,'porch-side-rafter',[x,3.55,2.86],[x,3.06,4.79],.11,.13);
// Inhabited right-hand porch: settle, trestle table, bread board and a travel bundle. Main lane stays empty.
box(g,'porch-settle-seat',1.72,.12,.47,2.72,.68,3.38,M.wood);box(g,'porch-settle-back',1.76,.62,.10,2.72,1.04,3.17,M.wood);
for(const x of [1.98,3.46]){box(g,'porch-settle-leg',.12,.44,.37,x,.42,3.38);box(g,'porch-settle-arm',.13,.10,.49,x,.90,3.38);}
box(g,'porch-table',1.1,.09,.53,2.88,1.0,4.20,M.wood);for(const x of [2.47,3.29])box(g,'porch-table-trestle',.14,.74,.38,x,.585,4.20);
box(g,'porch-bread-board',.37,.035,.23,2.75,1.062,4.2,M.wood);box(g,'porch-folded-rug',.50,.055,.36,3.05,.767,3.38,M.amber);
box(g,'porch-travel-chest',.45,.40,.42,1.99,.398,3.37,M.wood);box(g,'porch-chest-strap',.07,.02,.44,1.99,.608,3.37,M.iron);
for(const x of [-2.5,2.5])beam(g,'preserved-lamp-bracket',[x,2.35,4.43],[x,2.35,4.55],.05,.05,M.iron);
// Two narrow raised braces frame, but never cover, the original sign's exact double-sided face.
beam(g,'sign-hanger',[2.50,1.92,4.60],[2.50,2.18,4.45],.035,.035,M.iron);
// Decoded source island IDs are safe only under the full SHA pin above.
const ranges=[[8,23],[41,67],[87,94],[121,171],[172,192]];
const kept=components.filter(c=>ranges.some(([a,b])=>c.index>=a&&c.index<=b));
const primitiveTriangles=new Map<any,number[]>();for(const c of kept){if(!primitiveTriangles.has(c._p))primitiveTriangles.set(c._p,[]);primitiveTriangles.get(c._p)!.push(...c._ts);}
for(const n of doc.getRoot().listNodes())for(const p of [...(n.getMesh()?.listPrimitives()??[])]){
 const ts=primitiveTriangles.get(p);if(!ts){n.getMesh()!.removePrimitive(p);continue;}
 const old=p.getIndices(),chosen=ts.flatMap(t=>[0,1,2].map(k=>old?old.getScalar(t*3+k):t*3+k));const unique=[...new Set(chosen)],remap=new Map(unique.map((v,i)=>[v,i]));
 for(const sem of p.listSemantics()){
  const a=p.getAttribute(sem)!,array=a.getArray()!,size=a.getElementSize(),ctor=array.constructor as any;
  const next=new ctor(unique.length*size);unique.forEach((v,i)=>next.set(array.subarray(v*size,(v+1)*size),i*size));p.setAttribute(sem,a.clone().setArray(next));
 }
 p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(chosen.map(i=>remap.get(i)!))).setBuffer(doc.getRoot().listBuffers()[0]));
}
for(const e of doc.getRoot().listExtensionsUsed())if(e.extensionName==='KHR_draco_mesh_compression')e.dispose();
const stats=finish(g,'nx-town-inn');
const target=await io.read(resolve(OUT,'nx-town-inn.glb'));
for(const ext of doc.getRoot().listExtensionsUsed()){const ctor=ALL_EXTENSIONS.find((x:any)=>x.EXTENSION_NAME===ext.extensionName);if(ctor)target.createExtension(ctor as any).setRequired(ext.isRequired());}
const roots=doc.getRoot().getDefaultScene()!.listChildren().filter(n=>n.listChildren().length||n.getMesh()?.listPrimitives().length);
const copied=copyToDocument(target,doc,roots);for(const n of roots)target.getRoot().getDefaultScene()!.addChild(copied.get(n) as any);
await target.transform(unpartition());
const finalBytes=await io.writeBinary(target);writeFileSync(resolve(OUT,'nx-town-inn.glb'),finalBytes);
const finalSHA=sha(finalBytes);
// Read the actual final bytes: preservation is not inferred from a successful copy call.
const verified=await io.readBinary(finalBytes);
const nodeSignature=(n:any)=>({name:n.getName(),matrix:n.getWorldMatrix(),children:n.listChildren().map((x:any)=>x.getName()),primitives:(n.getMesh()?.listPrimitives()??[]).map((p:any)=>{
 const m=p.getMaterial();return {mode:p.getMode(),indices:sha(p.getIndices().getArray()),attributes:p.listSemantics().sort().map((s:string)=>{const a=p.getAttribute(s);return {s,type:a.getType(),component:a.getComponentType(),normalized:a.getNormalized(),sha256:sha(a.getArray())};}),material:m?{name:m.getName(),base:m.getBaseColorFactor(),rough:m.getRoughnessFactor(),metal:m.getMetallicFactor(),emissive:m.getEmissiveFactor(),alpha:m.getAlphaMode(),doubleSided:m.getDoubleSided(),image:m.getBaseColorTexture()?sha(m.getBaseColorTexture().getImage()):null}:null};
})});
const retainedNodes:any[]=[];for(const r of roots)r.traverse(n=>retainedNodes.push(n));
const preserved=retainedNodes.map(n=>{const matches=verified.getRoot().listNodes().filter(v=>v.getName()===n.getName());const before=nodeSignature(n),after=matches.length===1?nodeSignature(matches[0]):null;const pass=JSON.stringify(before)===JSON.stringify(after);if(!pass)throw Error('retained accessor/material/transform drift '+n.getName());return {name:n.getName(),pass,fingerprint:sha(JSON.stringify(before))};});
const actualBounds=new THREE.Box3();let actualTriangles=0;
verified.getRoot().getDefaultScene()!.traverse(n=>{for(const p of n.getMesh()?.listPrimitives()??[]){const a=p.getAttribute('POSITION')!,ix=p.getIndices(),cnt=ix?.getCount()??a.getCount();actualTriangles+=cnt/3;for(let i=0;i<cnt;i++)actualBounds.expandByPoint(new THREE.Vector3(...a.getElement(ix?ix.getScalar(i):i,[])).applyMatrix4(new THREE.Matrix4().fromArray(n.getWorldMatrix())));}});
const bmin=actualBounds.min.toArray(),bmax=actualBounds.max.toArray(),baseBounds=read('reviews/inn-before/render-manifest.json').stats.bounds;
for(const a of [0,2])if(Math.abs(bmin[a]-baseBounds.min[a])>1e-6||Math.abs(bmax[a]-baseBounds.max[a])>1e-6)throw Error('exact X/Z envelope drift');
const builtStats={...stats,sha256:finalSHA,bytes:finalBytes.length,nodes:verified.getRoot().listNodes().length,meshes:verified.getRoot().listMeshes().length,triangles:actualTriangles,bounds:{min:bmin,max:bmax},architectureOnlySha256:stats.sha256,host};
writeFileSync(resolve(OUT,'nx-town-inn.json'),JSON.stringify(builtStats,null,2));
writeFileSync(resolve(OUT,'inn-preservation.json'),JSON.stringify({status:'PASS',modelPath:resolve(OUT,'nx-town-inn.glb'),modelSha256:finalSHA,baselineSha256:sha(baseline),sourceSha256:sha(readFileSync(resolve(BASE,'build-inn.ts'))),exactEnvelope:true,baselineBounds:baseBounds,finalBounds:{min:bmin,max:bmax},hostTuple:host,preserved,note:'Sign/fire/flame/lamp/lamp2 plus all retained furnished nodes preserve exact world matrices, indexed attribute bytes, material values and embedded base-color image bytes; selection is explicit under the frozen baseline hash.'},null,2));
writeFileSync(resolve(OUT,'inn-retention.json'),JSON.stringify({baselineSha256:sha(baseline),finalSha256:finalSHA,source:'agents/arthur/assets/mkv3-landmarks.ts:353-630 (read only)',method:'decoded connected islands, compact indexed accessors; original material/image bytes and node world transforms',retained:kept.map(({_p,_node,_ts,...c})=>c),removed:'old shell, roof, floors, impossible stair and ceiling beams; all guest and tavern furnishings retained',exactNamedRoots:roots.map(n=>n.getName())},null,2));
const neighbors=read('neighbors/nx-town-inn.json').neighbors;
const thresholds=neighbors.find((n:any)=>n.id==='nx-artwalk-b2-inn-threshold').hostLocalBounds;
const waypoints=[
 ['street',[0,0,5.45]],['porch-entry',[0,FY,4.50]],['porch-settle-service',[1.25,FY,4.0]],['porch-central',[0,FY,3.65]],['threshold',[0,thresholds.max[1],2.95]],['tavern-arrival',[0,FY,2.35]],['tavern-center',[0,FY,0]],['table-aisle',[3.2,FY,0]],['south-table-service',[3.2,FY,1.3]],['table-aisle-return',[3.2,FY,0]],['north-table-service',[3.2,FY,-1.3]],['table-aisle-back',[3.2,FY,0]],['common-room',[0,FY,0]],['bar-and-cask-service',[.15,FY,-1.60]],['hearth-turn',[-2.30,FY,-1.6]],['hearth-service',[-2.30,FY,-.1]],['room-return',[0,FY,0]],['exit-foyer',[0,FY,2.35]]
].map(([name,pos])=>({name,pos}));
const contract={id:host.id,sha256:finalSHA,pos:host.pos,yaw:host.yaw,scale:host.scale,parent:host.parent,comp:host.comp,terrainY:0,doors:[{name:'protected-inlay-main-door',x:0,z:[2.63,3.25],floorY:thresholds.max[1],width:1.4,headroom:2.2},{name:'porch-open-arrival',x:0,z:[4.35,4.80],floorY:FY,width:1.4,headroom:2.2}],waypoints,protectedVolumes:neighbors.filter((n:any)=>n.protected).map((n:any)=>({id:n.id,...n.hostLocalBounds})),assembly:neighbors};
writeFileSync(resolve(OUT,'nx-town-inn-route-contract.json'),JSON.stringify(contract,null,2));
const upstairs=[{name:'stair-street',pos:[-3.1,0,5.45]},...Array.from({length:7},(_,i)=>({name:`tread-${i+1}`,pos:[-3.1,(i+1)*.44,4.39-i*.65]})),{name:'guest-landing',pos:[-3.1,UY,.32]},{name:'guest-gallery',pos:[-1,UY,.32]},{name:'guest-east-seat',pos:[2.5,UY,.32]},{name:'guest-washstand',pos:[0,UY,1.8]}];
writeFileSync(resolve(OUT,'inn-upper-route-contract.json'),JSON.stringify({...contract,waypoints:upstairs},null,2));
// Preserve exact external neighbors in composite evidence only; never merge them into the deployable host.
async function assembly(file:string,out:string){
 const d=await io.read(file);for(const e of d.getRoot().listExtensionsUsed())if(e.extensionName==='KHR_draco_mesh_compression')e.dispose();
 for(const e of neighbors){const bytes=readFileSync(resolve(e.file));if(sha(bytes)!==e.sha256)throw Error('neighbor bytes drift '+e.id);const n=await io.readBinary(bytes);for(const ext of n.getRoot().listExtensionsUsed())if(ext.extensionName==='KHR_draco_mesh_compression')ext.dispose();
  for(const ext of n.getRoot().listExtensionsUsed()){const ctor=ALL_EXTENSIONS.find((x:any)=>x.EXTENSION_NAME===ext.extensionName);if(ctor)d.createExtension(ctor as any).setRequired(ext.isRequired());}
  const ns=n.getRoot().getDefaultScene()!.listChildren(),map=copyToDocument(d,n,ns),wrap=d.createNode(e.id);const dx=e.pos[0]-host.pos[0],dz=e.pos[2]-host.pos[2],c=Math.cos(host.yaw),s=Math.sin(host.yaw);wrap.setTranslation([(dx*c-dz*s)/host.scale,(e.pos[1]-host.pos[1])/host.scale,(dx*s+dz*c)/host.scale]).setRotation([0,Math.sin((e.yaw-host.yaw)/2),0,Math.cos((e.yaw-host.yaw)/2)]).setScale([e.scale/host.scale,e.scale/host.scale,e.scale/host.scale]);for(const r of ns)wrap.addChild(map.get(r) as any);d.getRoot().getDefaultScene()!.addChild(wrap);
 }
 await d.transform(unpartition());writeFileSync(out,await io.writeBinary(d));
}
await assembly(resolve(BASE,'before/nx-town-inn.glb'),resolve(OUT,'inn-before-assembly.glb'));
await assembly(resolve(OUT,'nx-town-inn.glb'),resolve(OUT,'inn-final-assembly.glb'));
console.log(JSON.stringify({id:host.id,sha256:finalSHA,bytes:finalBytes.length,retainedIslands:kept.length,retainedTriangles:kept.reduce((n,c)=>n+c.triangles,0),neighbors:neighbors.map((n:any)=>n.id)}));
