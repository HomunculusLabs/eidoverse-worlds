// Owned civic tower lane. Offline only. Shared exports below do not build when imported.
import * as T from 'three';
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { copyToDocument, unpartition } from '@gltf-transform/functions';
import draco from 'draco3dgltf';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { M, box, beam, wall, finish } from './kit.ts';
export const BASE=import.meta.dir;
export const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
export const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
export const save=(p:string,x:any)=>writeFileSync(p,JSON.stringify(x,null,2)+'\n');
export async function io(){return new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()});}
export const host=(id:string)=>json(`${BASE}/before/contracts.json`).find((x:any)=>x.id===id);
export function slabPoly(g:T.Group,n:string,pts:number[][],bottom:number,top:number,m:T.Material){
 const shape=new T.Shape();pts.forEach((p,i)=>i?shape.lineTo(p[0],p[1]):shape.moveTo(p[0],p[1]));shape.closePath();
 const geo=new T.ExtrudeGeometry(shape,{depth:top-bottom,bevelEnabled:false});geo.rotateX(Math.PI/2);geo.translate(0,top,0);const o=new T.Mesh(geo,m);o.name=n;g.add(o);return o;
}
// Closed truncated hip shells: both inner and outer faces follow the same pitch.
export function crown(g:T.Group,n:string,sides:number,r:number,eave:number,rise:number,rotation:number){
 function band(name:string,r0:number,r1:number,y0:number,y1:number,thick:number,m:T.Material){
  const p:number[]=[];const tri=(a:number[],b:number[],c:number[])=>p.push(...a,...b,...c);
  for(let i=0;i<sides;i++){
   const a=rotation+i*2*Math.PI/sides,b=rotation+(i+1)*2*Math.PI/sides;
   const A=[r0*Math.cos(a),y0,r0*Math.sin(a)],B=[r0*Math.cos(b),y0,r0*Math.sin(b)],C=[r1*Math.cos(b),y1,r1*Math.sin(b)],D=[r1*Math.cos(a),y1,r1*Math.sin(a)];
   const E=A.map((x,k)=>x-(k===1?thick:0)),F=B.map((x,k)=>x-(k===1?thick:0)),G=C.map((x,k)=>x-(k===1?thick:0)),H=D.map((x,k)=>x-(k===1?thick:0));
   for(const q of [[A,D,C,B],[E,F,G,H],[A,B,F,E],[D,H,G,C],[A,E,H,D],[B,C,G,F]]){tri(q[0],q[1],q[2]);tri(q[0],q[2],q[3]);}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.computeVertexNormals();const o=new T.Mesh(geo,m);o.name=name;g.add(o);
 }
 band(`${n}_sealed_underroof`,r,.012,eave,eave+rise,.12,M.timber);
 const N=8;for(let i=0;i<N;i++){const t0=Math.max(0,(i-.12)/N),t1=(i+1)/N;band(`${n}_slate_course_${i}`,r*(1-t0),Math.max(.012,r*(1-t1)),eave+rise*t0+.04,eave+rise*t1+.04,.055,i%3===1?M.roofAlt:M.roof);}
 for(let i=0;i<sides;i++){const a=rotation+i*2*Math.PI/sides;beam(g,`${n}_hip_${i}`,[(r-.06)*Math.cos(a),eave+rise*.06/r+.025,(r-.06)*Math.sin(a)],[0,eave+rise+.05,0],.065,.065,M.iron);}
}
export function arch(g:T.Group,n:string,x:number,z:number,yaw:number,r:number,spring:number,thick=.25,verticalScale=1){
 const temp=new T.Group();const shape=new T.Shape(),R=r+.23;shape.moveTo(-R,0);shape.absarc(0,0,R,Math.PI,0,true);shape.lineTo(r,0);shape.absarc(0,0,r,0,Math.PI,false);shape.closePath();
 const geo=new T.ExtrudeGeometry(shape,{depth:thick,bevelEnabled:false,curveSegments:14});geo.scale(1,verticalScale,1);const o=new T.Mesh(geo,M.stone);o.name=n;o.position.set(0,spring,-thick/2);temp.add(o);temp.updateMatrixWorld(true);
 const mat=new T.Matrix4().makeRotationY(yaw);mat.setPosition(x,0,z);for(const c of [...temp.children]){c.applyMatrix4(mat);g.add(c);}
}
export async function finalize(g:T.Group,id:string,retain:string[],partial?:{name:string,boxes:{name:string,min:number[],max:number[]}[]}[]){
 const srcBytes=readFileSync(`${BASE}/before/${id}.glb`),downloads=json(`${BASE}/before/downloads.json`),pin=downloads.find((x:any)=>x.id===id);if(sha(srcBytes)!==pin.sha256)throw Error('served baseline drift');
 const IO=await io(),src=await IO.readBinary(srcBytes);const scene=src.getRoot().getDefaultScene();if(!scene)throw Error('no default scene');
 const active=new Set<any>();scene.traverse(n=>active.add(n));const kept=src.getRoot().listNodes().filter(n=>active.has(n)&&retain.includes(n.getName()));if(kept.length!==retain.length)throw Error('retained node coverage');
 const records:any[]=kept.map(n=>({name:n.getName(),world:n.getWorldMatrix(),primitiveHashes:n.getMesh()?.listPrimitives().map(p=>Object.fromEntries(p.listSemantics().map(s=>[s,sha(p.getAttribute(s)!.getArray())])))}));
 for(const spec of partial??[]){
  const original=src.getRoot().listNodes().find(n=>active.has(n)&&n.getName()===spec.name);if(!original?.getMesh())throw Error('partial source missing');const output=src.createMesh(`${spec.name}_retained_hardware`);let total=0;
  for(const p of original.getMesh()!.listPrimitives()){
   const a=p.getAttribute('POSITION')!,idx=p.getIndices()!,keep:number[]=[];const points=[0,0,0];const counts:any={};
   for(let i=0;i<idx.getCount();i+=3){const ids=[0,1,2].map(k=>idx.getScalar(i+k));const vs=ids.map(i=>{a.getElement(i,points);return [...points];});const hit=spec.boxes.find(b=>vs.every(v=>v.every((x,k)=>x>=b.min[k]-.0006&&x<=b.max[k]+.0006)));if(hit){keep.push(...ids);counts[hit.name]=(counts[hit.name]??0)+1;}}
   if(!keep.length)throw Error('zero retained hardware');const unique=[...new Set(keep)],remap=new Map(unique.map((n,i)=>[n,i]));const q=src.createPrimitive().setMaterial(p.getMaterial());
   for(const s of p.listSemantics()){const old=p.getAttribute(s)!,array=old.getArray()!,size=old.getElementSize(),data:any=new (array.constructor as any)(unique.length*size);unique.forEach((n,i)=>data.set(array.slice(n*size,(n+1)*size),i*size));q.setAttribute(s,src.createAccessor().setType(old.getType()).setArray(data).setNormalized(old.getNormalized()).setBuffer(old.getBuffer()));}
   q.setIndices(src.createAccessor().setType('SCALAR').setArray(new Uint32Array(keep.map(i=>remap.get(i)!))).setBuffer(a.getBuffer()));output.addPrimitive(q);total+=keep.length/3;records.push({name:output.getName(),sourceNode:spec.name,triangleCounts:counts,triangles:total});
  }
  const node=src.createNode(output.getName()).setMesh(output).setMatrix(original.getWorldMatrix());kept.push(node);
 }
 // Export campaign architecture, then append exact decoded retained resources without texture re-encoding.
 finish(g,id);const dst=await IO.read(`${BASE}/build/${id}.glb`);for(const e of src.getRoot().listExtensionsUsed())if(e.extensionName!=='KHR_draco_mesh_compression')dst.createExtension((e as any).constructor).setRequired(e.isRequired());
 const map=copyToDocument(dst,src,kept);for(const n of kept)dst.getRoot().getDefaultScene()!.addChild(map.get(n) as any);for(const e of dst.getRoot().listExtensionsUsed())if(e.extensionName==='KHR_draco_mesh_compression')e.dispose();await dst.transform(unpartition());
 const bytes=Buffer.from(await IO.writeBinary(dst));writeFileSync(`${BASE}/build/${id}.glb`,bytes);const decoded=await IO.readBinary(bytes),s=decoded.getRoot().getDefaultScene()!;const bounds=new T.Box3();let tris=0;const nodes:any[]=[];
 s.traverse(n=>{const m=n.getMesh(),b=new T.Box3(),matrix=new T.Matrix4().fromArray(n.getWorldMatrix());if(m)for(const p of m.listPrimitives()){const a=p.getAttribute('POSITION')!,v=[0,0,0];tris+=(p.getIndices()?.getCount()??a.getCount())/3;for(let i=0;i<a.getCount();i++){a.getElement(i,v);b.expandByPoint(new T.Vector3(...v).applyMatrix4(matrix));}}if(!b.isEmpty())bounds.union(b);nodes.push({name:n.getName(),world:n.getWorldMatrix(),bounds:b.isEmpty()?null:{min:b.min.toArray(),max:b.max.toArray()}});});
 const h=host(id);for(const axis of [0,2])if(bounds.min.getComponent(axis)<h.bbox.min[axis]-.001||bounds.max.getComponent(axis)>h.bbox.max[axis]+.001)throw Error('XZ envelope exceeded');
 // Byte-level attribute and TRS equality for all fully retained nodes, including bell descendants.
 const materialSig=(m:any)=>m?JSON.stringify({name:m.getName(),base:m.getBaseColorFactor(),emissive:m.getEmissiveFactor(),rough:m.getRoughnessFactor(),metal:m.getMetallicFactor(),alpha:m.getAlphaMode(),double:m.getDoubleSided(),images:[m.getBaseColorTexture(),m.getEmissiveTexture(),m.getNormalTexture(),m.getMetallicRoughnessTexture(),m.getOcclusionTexture()].map(t=>t?sha(t.getImage()):null)}):null;
 const checks:any[]=[];for(const root of kept){root.traverse(n=>{const out=decoded.getRoot().listNodes().filter(x=>x.getName()===n.getName());if(out.length!==1)throw Error(`retained duplicate/missing ${n.getName()}`);const q=out[0];if(JSON.stringify(q.getWorldMatrix())!==JSON.stringify(n.getWorldMatrix()))throw Error(`retained pose ${n.getName()}`);n.getMesh()?.listPrimitives().forEach((p,i)=>{const b=q.getMesh()!.listPrimitives()[i];if(sha(p.getIndices()?.getArray())!==sha(b.getIndices()?.getArray())||materialSig(p.getMaterial())!==materialSig(b.getMaterial()))throw Error('retained indices/material/image drift');for(const sem of p.listSemantics())if(sha(p.getAttribute(sem)!.getArray())!==sha(b.getAttribute(sem)!.getArray()))throw Error('retained accessor drift');});checks.push(n.getName());});}
 const stats={id,sha256:sha(bytes),bytes:bytes.length,baselineSha256:pin.sha256,triangles:tris,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},nodes,retained:records,retainedNodeAttributePoseChecks:checks,contract:{...h,...(id==='nx-town-belltower'?{collide:'exact'}:{}),lib:`store/${sha(bytes).slice(0,16)}.glb`},originalContract:h,limits:['Local artifact; no world mutations. Full retained attributes and node world matrices compared to served decode.','Partial hardware selection keeps served attribute values, compacts indices, and preserves coordinates; no re-quantization.']};
 save(`${BASE}/build/${id}.spawn-contract.json`,{id:h.id,lib:stats.contract.lib,kind:h.kind,pos:h.pos,yaw:h.yaw,scale:h.scale,parent:h.parent,comp:h.comp,collide:id==='nx-town-belltower'?'exact':h.collide??null});
 save(`${BASE}/build/${id}.json`,{...json(`${BASE}/build/${id}.json`),...stats});save(`${BASE}/build/${id}.decoded.json`,stats);save(`${BASE}/build/${id}.contract.json`,stats.contract);console.log(JSON.stringify({id,sha256:stats.sha256,bytes:stats.bytes,triangles:tris,bounds:stats.bounds,retained:checks}));return stats;
}
export async function build(){
 const g=new T.Group();const id='nx-town-belltower';
 box(g,'civic_foundation',3.4,.30,3.4,0,.15,0,M.stone);
 // Open rear arcade; front pier is the literal backing for protected b5 art.
 for(const x of [-1.15,1.15])box(g,`rear_pier_${x}`,.5,4.35,.52,x,2.475,-.94,M.stone);
 box(g,'art_pier',.76,4.35,.65,.75,2.475,.627,M.stone); // face .952, artwork back .9525
 box(g,'ladder_inner_pier',.52,4.35,.55,-.75,2.475,.065,M.stone);
 for(const x of [-1.15,1.15]){box(g,`rear_base_${x}`,.62,.36,.65,x,.48,-.94,M.stone);box(g,`rear_capital_${x}`,.59,.18,.62,x,3.01,-.94,M.stone);}
 arch(g,'civic_rear_arch',0,-.94,0,.90,2.66,.4);
 wall(g,'rear_lime_spandrel',2.8,1.0,.32,0,3.65,-.94,0,[],M.lime);
 // Side shaft panels above the open ground loggia, held between masonry supports.
 for(const x of [-1.25,1.25])wall(g,`side_upper_${x}`,1.52,1.8,.22,x,2.85,-.30,Math.PI/2,[{x:0,w:.45,bottom:.24,h:1.05}],M.lime);
 box(g,'front_high_spandrel',2.5,1.2,.24,0,4.05,.40,M.lime);
 // Solid, connected upper deck; preserved ladder top-out slot and a bell/clapper well.
 const y=4.76;box(g,'deck_rear',2.9,.12,.85,0,y,-1.025,M.wood);
 box(g,'deck_west',.85,.12,1.2,-1.025,y,0,M.wood);box(g,'deck_east',.85,.12,2.05,1.025,y,.425,M.wood);
 box(g,'deck_front_center',1.0,.12,.9,.10,y,1.0,M.wood);
 box(g,'deck_ladder_landing',.7,.12,.92,-.75,y,.29,M.wood);
 box(g,'deck_west_bridge',.35,.12,1.05,-1.275,y,.925,M.wood);
 for(const z of [-1.25,.42])box(g,`deck_bearer_${z}`,2.84,.22,.18,0,4.59,z,M.timber);
 // Four upper arcade piers: clear the exact ladder column, landing and lamp.
 for(const x of [-1.34,1.34])for(const z of [-1.20,1.24]){box(g,`belfry_post_${x}_${z}`,.17,2.46,.17,x,6.05,z,M.timber);box(g,`post_shoe_${x}_${z}`,.23,.20,.23,x,4.92,z,M.iron);}
 for(const z of [-1.24,1.24]){box(g,`belfry_plate_${z}`,2.87,.2,.2,0,7.22,z,M.timber);arch(g,`belfry_arc_${z}`,0,z,0,1.13,7.0,.16,.23);}
 // Arch crown is above usable side galleries; small guard rails avoid front ladder slot.
 for(const x of [-1.43,1.43]){beam(g,`side_rail_${x}`,[x,5.80,-1.25],[x,5.80,1.24],.075,.075);box(g,`side_plate_${x}`,.15,.2,2.68,x,7.22,0,M.timber);}
 beam(g,'rear_guard',[-1.35,5.80,-1.43],[1.35,5.80,-1.43],.075,.075);
 beam(g,'bell_hanger',[0,5.67,0],[0,7.25,0],.055,.055,M.iron);box(g,'bell_headstock',.60,.13,.14,0,5.70,0,M.timber);
 beam(g,'lantern_support_arm',[1.26,5.62,1.17],[.89,5.62,.89],.035,.035,M.iron);
 box(g,'shaft_cap_rear',2.84,.15,.22,0,4.645,-.96,M.stone);
 box(g,'shaft_cap_front',2.84,.15,.14,0,4.645,.35,M.stone);
 for(const x of [-1.25,1.25])box(g,`shaft_cap_side_${x}`,.34,.15,1.4,x,4.645,-.30,M.stone);
 box(g,'rope_anchor_block',.16,.25,.16,.12,.425,.58,M.timber);
 for(const yy of [1.5,3.5])box(g,`ladder_anchor_extension_${yy}`,.04,.04,.61,-.75,yy,.645,M.iron);
 // Preserve the eave, all belfry supports, and every served bell/lamp/ladder part.
 // Lower only authored roof pitch and connected crown/finial: decoded top <8.5m.
 crown(g,'slate_civic_hip',4,2.20,7.32,.68,Math.PI/4);
 box(g,'crown_seat',.20,.14,.20,0,8.0,0,M.iron);const fin=new T.Mesh(new T.ConeGeometry(.11,.46,8),M.iron);fin.position.y=8.26;fin.name='civic_spire';g.add(fin);
 const boxes=[...[-.87,-.63].map((x,i)=>({name:`ladder_rail_${i}`,min:[x-.03,.30,1.07],max:[x+.03,5,1.13]})),...Array.from({length:11},(_,i)=>({name:`rung_${i}`,min:[-.90,.725+i*.42,1.075],max:[-.60,.775+i*.42,1.125]})),...[1.5,3.5].map(y=>({name:`standoff_${y}`,min:[-.77,y-.02,.95],max:[-.73,y+.02,1.11]}))];
 const stats=await finalize(g,id,['bt3_2','bt3_3','bt3_4','bt3_5','bell','lamp'],[{name:'bt3_1',boxes}]);
 const protectedData=json(`${BASE}/before/protected.json`).find((x:any)=>x.geom.id==='nx-artwalk-b5-belltower-rings').geom;
 const pin=json(`${BASE}/before/downloads.json`).find((x:any)=>x.id===protectedData.id);
 stats.contract.collide='exact';save(`${BASE}/build/${id}.contract.json`,stats.contract);
 const common={...host(id),collide:'exact',sha256:stats.sha256,terrainY:0,protectedVolumes:[{id:protectedData.id,min:[.4325435757637024,.650000021457673,.952499998509884],max:[1.0774564445018768,2.0699999570846558,1.0920780503749847]}],assembly:json(`${BASE}/neighbors/${id}.json`).neighbors};
 save(`${BASE}/build/${id}.route.json`,{...common,doors:[{name:'rear-public-arcade',x:0,z:[-1.63,-.6],floorY:.3,width:1.4,headroom:2.2}],waypoints:[{name:'rear-approach',pos:[0,0,-2.2]},{name:'rear-threshold',pos:[0,.3,-.65]},{name:'bell-rope-station',pos:[0,.3,-.05]}]});
 save(`${BASE}/build/${id}.landing-route.json`,{...common,doors:[{name:'upper-rear-gallery',x:0,z:[-1.37,-.70],floorY:4.82,width:1.4,headroom:2.2}],waypoints:[{name:'ladder-topout',pos:[-.75,4.82,.18]},{name:'west-gallery',pos:[-.88,4.82,-.15]},{name:'rear-gallery',pos:[-.88,4.82,-.94]},{name:'rear-lookout',pos:[0,4.82,-.94]}]});
 save(`${BASE}/build/${id}.ladder-approach.json`,{...common,doors:[{name:'clear-ladder-apron',x:-.75,z:[1.40,1.66],floorY:.3,width:1.4,headroom:2.2}],waypoints:[{name:'front-approach',pos:[-.75,0,2.20]},{name:'ladder-grab-station',pos:[-.75,.3,1.55]}]});
 return stats;
}
export function applyProofFrame(root:any,k:any,neighbors:any[]){
 if(k.proofFrameY===undefined)return 'host-local';
 // Door prisms are pretransformed; no placement tuple/scale/terrain/component edits.
 if(!Number.isFinite(k.proofFrameY))throw Error('invalid proofFrameY');
 const A=new T.Matrix4().makeRotationY(k.proofFrameY);
 for(const r of [root,...neighbors.map(n=>n.root)]){
  r.applyMatrix4(A);r.updateMatrix();
  // Three's quaternion decomposition can encode a yaw as [PI, PI-yaw, PI].
  // The pinned public collider reads scalar rotation.y, so retain the SAME matrix
  // with a pure-Y representation. Parent must do this after its clones, too.
  r.rotation.set(0,Math.atan2(r.matrix.elements[8],r.matrix.elements[0]),0);r.updateMatrixWorld(true);
 }
 const rotate=(p:number[])=>new T.Vector3(...p).applyMatrix4(A).toArray();
 const volume=(p:any):any=>{const bb=new T.Box3(new T.Vector3(...p.min),new T.Vector3(...p.max)).applyMatrix4(A);return {...p,min:bb.min.toArray(),max:bb.max.toArray(),...(p.allowance?{allowance:volume(p.allowance)}:{})};};
 k.waypoints=k.waypoints.map((w:any)=>({...w,pos:rotate(w.pos)}));k.protectedVolumes=k.protectedVolumes.map(volume);
 return `host-local rotated ${k.proofFrameY} radians around Y; door prisms already proof-frame`;
}
export async function verify(id:string){
 const V=await import('../cabin-overhaul/verify-player.ts');
 const files=id==='nx-town-belltower'?['route','landing-route','ladder-approach']:['route','upper-route'];const reports:any[]=[];
 for(const suffix of files){const k=json(`${BASE}/build/${id}.${suffix}.json`);const loaded=await V.loadPlayerMesh(`${BASE}/build/${id}.glb`);if(k.sha256!==loaded.sha256)throw Error('route pin drift');const neighbors=await V.loadPlayerAssembly(k,k.assembly);
  const frame=applyProofFrame(loaded.root,k,neighbors);
  const report={...V.verifyPlayerMesh(loaded.root,k,neighbors),modelSha256:loaded.sha256,modelFile:`${BASE}/build/${id}.glb`,proofFrame:frame,placementContract:host(id),routeContractSha256:sha(readFileSync(`${BASE}/build/${id}.${suffix}.json`)),verifierSha256:sha(readFileSync(`${BASE}/../cabin-overhaul/verify-player.ts`))};save(`${BASE}/build/${id}.${suffix}.report.json`,report);reports.push(report);console.log(JSON.stringify({id,suffix,status:report.status,collider:report.collider,failures:report.failures}));
 }
 // Real inherited-byte negative control, original collision preferences; no changes to baseline.
 const k=json(`${BASE}/build/${id}.route.json`);delete k.sha256;delete k.collide;const old=await V.loadPlayerMesh(`${BASE}/before/${id}.glb`);const baseline={...V.verifyPlayerMesh(old.root,k,await V.loadPlayerAssembly(k,k.assembly)),modelSha256:old.sha256,evidence:'actual frozen before GLB, unchanged automatic collision preference; final route as comparison probe'};save(`${BASE}/build/${id}.before-route.report.json`,baseline);
 if(id==='nx-town-belltower'){
  const loaded=await V.loadPlayerMesh(`${BASE}/build/${id}.glb`);const min=[-1.07,.3,.78],max=[-.43,7.05,1.42],hardware:any[]=[];let hits=0;const examples:any[]=[];
  loaded.root.traverse((m:any)=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i+=3){const vs=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,i+j).toArray());const poly=V.clipTriangle(vs,min.map(x=>x+.001),max.map(x=>x-.001));if(poly.length<3)continue;const A=new T.Vector3(...poly[0]);let area=0;for(let j=1;j+1<poly.length;j++)area+=new T.Vector3(...poly[j]).sub(A).cross(new T.Vector3(...poly[j+1]).sub(A)).length()/2;if(area<1e-10)continue;
   const original=m.name==='bt3_1_retained_hardware';const anchor=[1.5,3.5].some(y=>vs.every(v=>Math.abs(v[0]+.75)<.0206&&Math.abs(v[1]-y)<.0206&&v[2]>=.3394&&v[2]<=.9506));if(original||anchor){hardware.push({node:m.name,triangle:i/3,reason:original?'exact served ladder rail/rung/standoff triangles':'narrow new standoff continuation to relocated loadbearing pier'});continue;}
   hits++;if(examples.length<10)examples.push({node:m.name,triangle:i/3,vs});
  }});
  const C:any=await import(`${process.env.CABIN_PLAYER_RUNTIME_DIR}/colliders.js`);C.clearColliders();C.fitCollider(id,loaded.root,{scale:1,collide:'exact',localFrame:true});const topout=new T.Vector3(-.75,5.15,.55),ground=C.resolveColliders(topout,()=>0);C.clearColliders();
  const special={status:hits===0&&Math.abs(ground-4.82)<.001?'PASS':'FAIL',modelSha256:loaded.sha256,comp:host(id).comp.ladder,clearedStandingColumn:{min,max},unexpectedTriangles:hits,examples,intentionalHardwareTriangles:hardware,topout:{localClimbCenter:[-.75,5.15,1.1],facingLocalYaw:Math.PI,controllerSource:'client/lib/controller.js lines 324-330 (repo source, not claimed served controller parity)',forwardDistance:.55,resultXZ:topout.toArray(),actualBrowserSupportY:ground,deckY:4.82},limits:['Tests static full standing column and real browser downward support after source-defined top-out displacement. Not a full live input-controller climb.','Named hardware contacts only; no whole-model, material or broad ladder-space exemption.']};save(`${BASE}/build/${id}.ladder.report.json`,special);console.log(JSON.stringify({id,special:special.status,hits,ground}));if(special.status!=='PASS')process.exitCode=1;
 }else{
  const loaded=await V.loadPlayerMesh(`${BASE}/build/${id}.glb`),C:any=await import(`${process.env.CABIN_PLAYER_RUNTIME_DIR}/colliders.js`);C.clearColliders();C.fitCollider(id,loaded.root,{scale:1,localFrame:true});const pos=new T.Vector3(...host(id).comp.sockets.study.pos),before=pos.clone(),support=C.resolveColliders(pos,()=>0);C.clearColliders();const result={status:Math.abs(support-3)<.001&&pos.distanceTo(before)<.001?'PASS':'FAIL',modelSha256:loaded.sha256,socket:host(id).comp.sockets.study,actualBrowserSupportY:support,push:pos.distanceTo(before),retainedLadder:'Exact served ladder geometry and hatch retained; NO ladder comp exists and none was invented. Upper route is a separate socket/landing proof, not ground-to-upper walking.'};save(`${BASE}/build/${id}.socket.report.json`,result);console.log(JSON.stringify(result));if(result.status!=='PASS')process.exitCode=1;
 }
 if(reports.some(r=>r.status!=='PASS'))process.exitCode=1;
}
export async function ensemble(id:string,before=false){
 const IO=await io(),path=`${BASE}/${before?'before':'build'}/${id}.glb`,doc=await IO.read(path);for(const e of doc.getRoot().listExtensionsUsed())if(e.extensionName==='KHR_draco_mesh_compression')e.dispose();
 const h=host(id),neighbors=json(`${BASE}/neighbors/${id}.json`).neighbors.filter((n:any)=>n.id===(id==='nx-town-belltower'?'nx-artwalk-b5-belltower-rings':'nx-shutters'));
 for(const n of neighbors){const bytes=readFileSync(n.file);if(sha(bytes)!==n.sha256)throw Error('rider bytes');const src=await IO.readBinary(bytes);for(const e of src.getRoot().listExtensionsUsed())if(e.extensionName!=='KHR_draco_mesh_compression')doc.createExtension((e as any).constructor).setRequired(e.isRequired());const roots=src.getRoot().getDefaultScene()!.listChildren(),map=copyToDocument(doc,src,roots);const wrap=doc.createNode(`REVIEW_ONLY_${n.id}`),dx=n.pos[0]-h.pos[0],dz=n.pos[2]-h.pos[2],c=Math.cos(h.yaw),s=Math.sin(h.yaw);wrap.setTranslation([dx*c-dz*s,n.pos[1]-h.pos[1],dx*s+dz*c]);wrap.setRotation(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),n.yaw-h.yaw).toArray());for(const r of roots)wrap.addChild(map.get(r) as any);doc.getRoot().getDefaultScene()!.addChild(wrap);}
 await doc.transform(unpartition());const bytes=await IO.writeBinary(doc);writeFileSync(`${BASE}/build/${id}${before?'-before':''}-ensemble.glb`,bytes);save(`${BASE}/build/${id}${before?'-before':''}-ensemble.json`,{purpose:'offline review-only composition; not deployment bytes',hostSha256:sha(readFileSync(path)),sha256:sha(bytes),neighbors});
}
if(import.meta.main){if(process.argv.includes('--verify'))await verify('nx-town-belltower');else if(process.argv.includes('--ensemble')){await ensemble('nx-town-belltower');await ensemble('nx-town-belltower',true);}else await build();}
