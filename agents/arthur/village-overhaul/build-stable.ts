// Stable/woodyard lane only. Frozen baselines + originals read-only. Run from repo root.
import * as THREE from 'three';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {M,box,beam,wall,window,finish} from './kit.ts';
import {texMat} from '../assets/glbwrite.ts';
export const BASE=import.meta.dir;
export const sha=(bytes:any)=>createHash('sha256').update(bytes).digest('hex');
export async function decode(file:string){
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
 const bytes=readFileSync(file),doc=await io.readBinary(bytes),scene=doc.getRoot().getDefaultScene();if(!scene)throw Error('missing default scene');
 const root=new THREE.Group(),nodes:any[]=[];let triangles=0;
 scene.traverse(node=>{const wm=node.getWorldMatrix(),mesh=node.getMesh();nodes.push({name:node.getName(),parent:node.getParentNode()?.getName()??null,worldMatrix:wm,translation:node.getTranslation(),rotation:node.getRotation(),scale:node.getScale(),mesh:mesh?.getName()??null});if(!mesh)return;
 for(const [pi,p] of mesh.listPrimitives().entries()){
  if(p.getMode()!==4)throw Error('non-triangle');const pa=p.getAttribute('POSITION')!,na=p.getAttribute('NORMAL'),uv=p.getAttribute('TEXCOORD_0'),idx=p.getIndices(),n=idx?.getCount()??pa.getCount();const vs:number[]=[],ns:number[]=[],us:number[]=[],raw=[0,0,0],r2=[0,0];const matrix=new THREE.Matrix4().fromArray(wm),nm=new THREE.Matrix3().getNormalMatrix(matrix),v=new THREE.Vector3();
  for(let i=0;i<n;i++){let j=idx?idx.getScalar(i):i;pa.getElement(j,raw);v.fromArray(raw).applyMatrix4(matrix);vs.push(...v.toArray());if(na){na.getElement(j,raw);v.fromArray(raw).applyMatrix3(nm).normalize();ns.push(...v.toArray());}if(uv){uv.getElement(j,r2);us.push(...r2);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));if(ns.length)geo.setAttribute('normal',new THREE.Float32BufferAttribute(ns,3));else geo.computeVertexNormals();if(us.length)geo.setAttribute('uv',new THREE.Float32BufferAttribute(us,2));
  const pm=p.getMaterial(),color=pm?.getBaseColorFactor()??[.5,.5,.5,1];const mat=new THREE.MeshStandardMaterial({color:new THREE.Color(color[0],color[1],color[2]),roughness:pm?.getRoughnessFactor()??.9,metalness:pm?.getMetallicFactor()??0});mat.name=pm?.getName()??'unnamed';const out=new THREE.Mesh(geo,mat);out.name=node.getName()+':'+pi;root.add(out);triangles+=n/3;
 }});root.updateMatrixWorld(true);return {root,nodes,sha256:sha(bytes),bytes:bytes.length,triangles,bounds:new THREE.Box3().setFromObject(root)};
}
export function components(root:THREE.Group){
 const result:any[]=[];
 root.traverse((m:any)=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;const seen=new Map<string,number>(),parent=Array.from({length:a.count/3},(_,i)=>i),find=(i:number):number=>parent[i]===i?i:parent[i]=find(parent[i]);
  for(let i=0;i<a.count;i++){const k=[a.getX(i),a.getY(i),a.getZ(i)].map(v=>v.toFixed(4)).join(',');const old=seen.get(k);if(old!==undefined)parent[find(i/3|0)]=find(old);else seen.set(k,i/3|0);}
  const groups=new Map<number,number[]>();for(let t=0;t<parent.length;t++){const r=find(t);if(!groups.has(r))groups.set(r,[]);groups.get(r)!.push(t);}
  for(const ts of groups.values()){const b=new THREE.Box3();for(const t of ts)for(let j=0;j<3;j++)b.expandByPoint(new THREE.Vector3().fromBufferAttribute(a,t*3+j));result.push({mesh:m.name,material:m.material.name,triangles:ts.length,min:b.min.toArray(),max:b.max.toArray(),indices:ts});}
 });return result;
}
// Reuse the exact frozen furniture triangles; all repositioning is explicit in the retention manifest.
export function retainComponent(g:THREE.Group,source:THREE.Group,c:any,n:string,mat:THREE.Material,delta=[0,0,0],yaw=0,pivot=[0,0,0]){
 const m=source.children.find(o=>o.name===c.mesh) as THREE.Mesh;if(!m)throw Error('retention mesh missing');const geo=new THREE.BufferGeometry();
 for(const name of ['position','normal','uv']){const a=m.geometry.getAttribute(name);if(!a)continue;const out:number[]=[];for(const t of c.indices)for(let k=0;k<3;k++)for(let j=0;j<a.itemSize;j++)out.push(a.array[(t*3+k)*a.itemSize+j]);geo.setAttribute(name,new THREE.Float32BufferAttribute(out,a.itemSize));}
 geo.translate(-pivot[0],-pivot[1],-pivot[2]);geo.rotateY(yaw);geo.translate(pivot[0]+delta[0],pivot[1]+delta[1],pivot[2]+delta[2]);if(!geo.getAttribute('uv')){const a=geo.getAttribute('position'),uv=[];for(let i=0;i<a.count;i++)uv.push(a.getX(i)+a.getZ(i)*.3,a.getY(i)+a.getZ(i)*.2);geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));}const o=new THREE.Mesh(geo,mat);o.name=n;g.add(o);return {name:n,sourceMesh:c.mesh,sourceTriangles:c.indices,sourceBounds:{min:c.min,max:c.max},delta,yaw,pivot,triangleCount:c.indices.length};
}
// Explicit polygon slab: its XZ boundary is exact, thickness projects vertically, never beyond an eave.
export function prism(g:THREE.Group,n:string,top:number[][],depth:number,m:THREE.Material){
 const normal=new THREE.Vector3(...top[1]).sub(new THREE.Vector3(...top[0])).cross(new THREE.Vector3(...top[2]).sub(new THREE.Vector3(...top[0])));if(normal.y<0)top=[...top].reverse();
 const vs:number[]=[];const add=(a:number[],b:number[],c:number[])=>vs.push(...a,...b,...c);const bot=top.map(p=>[p[0],p[1]-depth,p[2]]);
 for(let i=1;i+1<top.length;i++){add(top[0],top[i],top[i+1]);add(bot[0],bot[i+1],bot[i]);}
 for(let i=0;i<top.length;i++){const j=(i+1)%top.length;add(top[i],bot[i],top[j]);add(top[j],bot[i],bot[j]);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m);mesh.name=n;g.add(mesh);return mesh;
}
// Ridge along Z. Unlike kit.roof, the inner gable profile is evaluated on the actual overhang slope.
export function barnRoof(g:THREE.Group,n:string,x0:number,x1:number,z0:number,z1:number,eave:number,rise:number,axis='z'){
 const convert=(u:number,v:number,y:number)=>axis==='z'?[u,y,v]:[v,y,u];const mid=(x0+x1)/2,run=(x1-x0)/2,height=(u:number)=>eave+rise*(1-Math.abs(u-mid)/run);
 for(const side of [-1,1]){
  const edge=mid+side*run;prism(g,`${n}_solid_${side}`,[convert(mid,z0,height(mid)),convert(mid,z1,height(mid)),convert(edge,z1,height(edge)),convert(edge,z0,height(edge))],.16,M.roof);
  const rows=7,tiles=Math.ceil((z1-z0)/.65);
  for(let r=0;r<rows;r++){const ua=mid+side*run*r/rows,ub=mid+side*Math.min(run,run*(r+1)/rows+.025),lift=.052+(rows-r)*.004;for(let j=-1;j<tiles;j++){const va=Math.max(z0+.006,z0+(z1-z0)*(j+(r%2)*.5)/tiles+.006),vb=Math.min(z1-.006,z0+(z1-z0)*(j+1+(r%2)*.5)/tiles-.006);if(vb<=va)continue;prism(g,`${n}_slate_${side}_${r}_${j}`,[convert(ua,va,height(ua)+lift),convert(ua,vb,height(ua)+lift),convert(ub,vb,height(ub)+lift),convert(ub,va,height(ub)+lift)],.048,(r+j)%4===1?M.roofAlt:M.roof);}}
  beam(g,`${n}_fascia_${side}`,convert(edge-side*.07,z0+.07,eave-.10),convert(edge-side*.07,z1-.07,eave-.10),.14,.14);
  for(const end of [z0+.09,z1-.09])beam(g,`${n}_verge_${side}_${end}`,convert(mid,end,eave+rise-.02),convert(edge-side*.1,end,eave-.02),.13,.13);
 }
 const rc=convert(mid,(z0+z1)/2,eave+rise+.085);box(g,`${n}_ridge`,axis==='z'?.18:z1-z0-.02,.13,axis==='z'?z1-z0-.02:.18,...rc as [number,number,number],M.iron);
 return {height,convert};
}
export function gable(g:THREE.Group,n:string,xa:number,xb:number,z:number,bottom:number,height:(x:number)=>number,m= M.lime){
 const sh=new THREE.Shape();sh.moveTo(xa,bottom);sh.lineTo(xb,bottom);sh.lineTo(xb,height(xb)-.15);sh.lineTo((xa+xb)/2,height((xa+xb)/2)-.15);sh.lineTo(xa,height(xa)-.15);sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:false});const o=new THREE.Mesh(geo,m);o.position.z=z;o.name=n;g.add(o);
}
export function cylinder(g:THREE.Group,n:string,r:number,h:number,x:number,y:number,z:number,m:THREE.Material=M.wood){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),m);o.name=n;o.position.set(x,y,z);g.add(o);return o;}
export function lantern(g:THREE.Group,n:string,x:number,y:number,z:number){
 box(g,n+'_globe',.12,.19,.12,x,y,z,M.amber);for(const s of [-1,1])box(g,n+'_cap'+s,.22,.055,.22,x,y+s*.12,z,M.iron);for(const a of [-1,1])for(const b of [-1,1])box(g,n+'_bar'+a+b,.024,.24,.024,x+a*.075,y,z+b*.075,M.iron);beam(g,n+'_hanger',[x,y+.14,z],[x,y+.4,z],.03,.03,M.iron);
}
export async function publish(g:THREE.Group,id:string,retained:any[],route:any){
 const before=await decode(`${BASE}/before/${id}.glb`);const downloads=JSON.parse(readFileSync(`${BASE}/before/downloads.json`,'utf8'));if(before.sha256!==downloads.find((d:any)=>d.id===id).sha256)throw Error('baseline SHA drift');
 const b=new THREE.Box3().setFromObject(g);for(const a of ['x','z'] as const)for(const k of ['min','max'] as const)if(Math.abs(b[k][a]-before.bounds[k][a])>1e-6)throw Error(`envelope changed ${a}/${k}: ${b[k][a]} vs ${before.bounds[k][a]}`);
 const stats=finish(g,id),after=await decode(`${BASE}/build/${id}.glb`);for(const a of ['x','z'] as const)for(const k of ['min','max'] as const)if(Math.abs(after.bounds[k][a]-before.bounds[k][a])>1e-6)throw Error('serialized envelope drift');
 const host=JSON.parse(readFileSync(`${BASE}/before/contracts.json`,'utf8')).find((c:any)=>c.id===id);const near=JSON.parse(readFileSync(`${BASE}/neighbors/${id}.json`,'utf8'));
 const assembly=near.neighbors.filter((n:any)=>n.id.includes('artwalk-b8')||n.id.includes('artwalk-b11')||n.id.includes('sign-stable')||n.id.includes('sign-woodyard')).map(({hostLocalBounds,protected:p,...n}:any)=>n);
 const protectedVolumes=near.neighbors.filter((n:any)=>assembly.some((a:any)=>a.id===n.id)).map((n:any)=>({id:n.id,...n.hostLocalBounds}));
 const contract={...host,terrainY:0,sha256:after.sha256,assembly,protectedVolumes,...route};writeFileSync(`${BASE}/build/${id}-route.json`,JSON.stringify(contract,null,2));
 writeFileSync(`${BASE}/build/${id}-evidence.json`,JSON.stringify({id,baseline:{sha256:before.sha256,bytes:before.bytes,triangles:before.triangles,bounds:{min:before.bounds.min.toArray(),max:before.bounds.max.toArray()},hierarchy:before.nodes},candidate:{sha256:after.sha256,bytes:after.bytes,triangles:after.triangles,bounds:{min:after.bounds.min.toArray(),max:after.bounds.max.toArray()},hierarchy:after.nodes},retained,hostTuple:host,componentsPreserved:host.comp,exactXZEnvelope:true,sourceSha256:sha(readFileSync(id==='nx-town-stable'?import.meta.path:`${BASE}/build-woodyard.ts`))},null,2));return {stats,contract};
}
export async function buildStable(){
 const id='nx-town-stable',d=await decode(`${BASE}/before/${id}.glb`),cs=components(d.root),g=new THREE.Group(),retained:any[]=[];
 // Explicit textured PBR avoids the shared writer's omitted-material glTF defaults (metallic=1) turning untextured hay/tack black.
 const leather=texMat('stable-saddle-leather',[0x795032,0x885c3b,0x6d4329],{rough:.92,cell:48});const hay=texMat('stable-dry-hay',[0xc7b374,0xbda66c,0xd2bd83],{rough:1,stripe:3,scale:3});const water=texMat('stable-trough-water',[0x506a78,0x587582],{rough:.25,metal:.5,cell:128});water.emissive.set(0x2e4a58);water.emissiveIntensity=.35;
 const keep=(i:number,n:string,m:THREE.Material,delta=[0,0,0],yaw=0,pivot=[0,0,0])=>retained.push(retainComponent(g,d.root,cs[i],n,m,delta,yaw,pivot));
 keep(0,'original_floor_fixed_FY_0p2',M.stone);keep(33,'original_road_stoop',M.stone);keep(32,'original_threshold',M.stone);
 keep(2,'saddle_stand_top',M.wood);keep(3,'saddle_stand',M.timber);keep(43,'original_saddle',leather);
 for(const i of [5,6,7])keep(i,'original_tack_peg_'+i,M.wood);keep(40,'original_harness',leather);keep(41,'original_bridle',leather);
 keep(35,'original_haypile',hay,[-.15,0,-.28]);keep(4,'original_pitchfork_handle',M.wood,[1,0,.15]);keep(42,'original_pitchfork_tines',M.iron,[1,0,.15]);
 keep(8,'original_yard_trough',M.wood);keep(38,'original_yard_water',water);
 for(const [i,hayidx,side] of [[9,36,-1],[10,37,1]]){const pivot=[0,0,side===-1?.35:-.35],delta=[side*2.24,0,-1.3-pivot[2]];keep(i,'original_manger_'+side,M.wood,delta,side*Math.PI/2,pivot);keep(hayidx,'original_manger_hay_'+side,hay,delta,side*Math.PI/2,pivot);}
 for(const i of [1,39,44])keep(i,'original_grooming_'+i,i===44?M.iron:i===39?leather:M.wood,[1.05,0,.35]);
 const glow=new THREE.Group();glow.name='glow';for(const i of [45,46])retained.push(retainComponent(glow,d.root,cs[i],`retained_light_${i}`,M.amber,i===45?[.19,.27,.09]:[0,0,0]));g.add(glow);
 // The lower floor remains exactly the original .2m. The quiet stone apron completes the threshold, without lifting its .21996m lip.
 box(g,'floor_rear_extension',5.4,.4,.2,0,0,-2.2,M.stone);
 box(g,'entrance_stone_approach',1.75,.2,.64,-1.35,.1,2.254972629547119,M.stone);
 // Road face: widened left entrance and right tack-room window. Fixed sign remains on the untouched +z=2.1 plane.
 wall(g,'front_lime',5.4,2.95,.2,0,.2,2,0,[{x:-1.35,w:1.75,bottom:0,h:2.52},{x:1.65,w:.95,bottom:1.15,h:1.10}]);
 window(g,'front_work_window',1.65,1.9,2.115,.95,1.1,0,true);
 // Side walls are real openings, not overlaid glass. Oak-sill plinths and coherent framing.
 for(const side of [-1,1]){
  wall(g,'side_'+side,4.2,3.05,.2,side*2.6,.2,-.1,Math.PI/2,[{x:.8,w:1.05,bottom:1.55,h:.83}]);
  window(g,'side_air_'+side,side*2.705,2.165,-.9,1.05,.83,side*Math.PI/2,false);
  box(g,'side_plinth_'+side,.26,.35,4.3,side*2.6,.375,-.1,M.stone);
  for(const z of [-2.15,.36,1.97]){box(g,'oak_post_'+side+'_'+z,.22,2.92,.22,side*2.58,1.66,z);box(g,'post_foot_'+side+'_'+z,.29,.24,.29,side*2.58,.32,z,M.stone);}
  box(g,'side_eaves_'+side,.22,.24,4.38,side*2.58,3.02,-.1);
  // Front divisions define two stalls, but their aisle-facing openings remain 1.55m clear.
  box(g,'stall_cross_wall_'+side,1.62,.78,.10,side*1.72,.59,.35,M.wood);
  for(const yy of [1.10,1.40])box(g,'stall_cross_rail_'+side+'_'+yy,1.72,.11,.12,side*1.76,yy,.35);
  for(const x of [side*.9,side*2.52])box(g,'stall_post_'+side+'_'+x,.12,1.35,.14,x,.875,.35);
  box(g,'stall_rear_post_'+side,.12,1.35,.14,side*.9,.875,-1.7);
  // The half-gate is parked flush into the rear of its stall, never across the aisle.
  box(g,'parked_stall_gate_'+side,1.42,.63,.08,side*1.7,.67,-1.80,M.wood);
  beam(g,'stall_gate_brace_'+side,[side*1.06,.39,-1.75],[side*2.30,.96,-1.75],.08,.08);
  for(const yy of [.4,.94])box(g,'stall_gate_iron_'+side+'_'+yy,.24,.035,.025,side*1.04,yy,-1.747,M.iron);
 }
 // Rear weather wall sits entirely behind the fixed harmonic-rein face. No broad intrusion allowance.
 box(g,'rear_wall_art_backing',5.4,2.95,.095,0,1.675,-2.25,M.lime);
 box(g,'rear_plinth',5.4,.34,.10,0,.37,-2.255,M.stone);
 for(const x of [-2.58,2.58])box(g,'rear_corner_'+x,.22,2.96,.18,x,1.68,-2.25);
 box(g,'rear_art_header',5.4,.18,.09,0,2.82,-2.25);
 for(const x of [-2.255,-.445])box(g,'entrance_jamb_'+x,.13,2.52,.29,x,1.46,2.0);
 box(g,'entrance_lintel',2.08,.22,.32,-1.35,2.83,2.0);
 // Slatted door is parked into the left return, visible as a real barn door.
 for(let j=0;j<7;j++)box(g,'open_barn_door_board_'+j,.065,2.30,.18,-2.31,1.35,.69+j*.19,M.wood);
 for(const yy of [.61,2.11])box(g,'open_door_strap_'+yy,.09,.08,1.31,-2.27,yy,1.26,M.iron);
 const rp=barnRoof(g,'barn',-3,3,-2.5,2.5,3.20,1.55);
 gable(g,'front_closed_gable',-2.7,2.7,1.99,3.1,rp.height);gable(g,'rear_closed_gable',-2.7,2.7,-2.29,3.1,rp.height);
 // Three tied trusses and pegged knee braces convey a built timber frame, with generous standing headroom.
 for(const z of [-1.9,.30,2.03]){box(g,'truss_tie_'+z,5.35,.22,.20,0,3.03,z);beam(g,'kingpost_'+z,[0,3.14,z],[0,4.58,z],.16,.16);for(const side of [-1,1]){beam(g,'truss_rafter_'+side+'_'+z,[side*2.59,3.24,z],[0,4.6,z],.16,.16);beam(g,'knee_'+side+'_'+z,[side*2.56,2.55,z],[side*1.96,2.94,z],.14,.14);cylinder(g,'joinery_peg_'+side+'_'+z,.038,.04,side*2.36,2.74,z,M.wood).rotation.x=Math.PI/2;}}
 // Loft loading shutter is centered on the gable, distinct from the ground circulation contract.
 for(let i=0;i<7;i++)box(g,'loft_shutter_'+i,.145,.76,.07,-.435+i*.145,3.73,2.14,M.wood);
 for(const x of [-.59,.59])box(g,'loft_jamb_'+x,.12,.95,.13,x,3.73,2.14);
 for(const y of [3.24,4.22])box(g,'loft_rail_'+y,1.3,.12,.13,0,y,2.14);
 beam(g,'loft_diagonal',[-.44,3.38,2.19],[.44,4.08,2.19],.075,.075);
 lantern(g,'lamp_entry',-.36,2.77,2.14);lantern(g,'lamp_groom',1.8,2.20,0);lantern(g,'lamp_rear',0,2.10,-1.8);beam(g,'rear_lantern_suspension',[0,2.48,-1.8],[0,2.99,-1.8],.026,.026,M.iron);
 // Grain barrel + tiered grooming rack in the non-route front-right pocket.
 cylinder(g,'feed_barrel',.22,.65,2.19,.525,.95,M.wood);for(const yy of [.28,.71])cylinder(g,'barrel_band_'+yy,.228,.045,2.19,yy,.95,M.iron);
 const routes={doors:[{name:'road_entry_fixed_sign_left',x:-1.35,z:[1.60,2.575],floorY:.22,width:1.65,headroom:2.2},{name:'central_aisle',x:0,z:[-.95,1.15],floorY:.2,width:1.65,headroom:2.2}],waypoints:[{name:'road_approach',pos:[-1.35,0,3.05]},{name:'stoop',pos:[-1.35,.21,2.50]},{name:'threshold',pos:[-1.35,.22,2]},{name:'vestibule',pos:[-1.35,.2,.95]},{name:'central_grooming_aisle',pos:[0,.2,.95]},{name:'saddle_station',pos:[1.30,.2,.95]},{name:'aisle_return',pos:[0,.2,.95]},{name:'feed_aisle',pos:[0,.2,-.63]},{name:'left_stall_care',pos:[-1.42,.2,-.63]},{name:'cross_aisle',pos:[0,.2,-.63]},{name:'right_stall_care',pos:[1.44,.2,-.48]}],purpose:'Two compact care stalls, central feed aisle and preserved grooming furniture; road entry offset solely to preserve the exact fixed sign. Rear art wall is not an advertised doorway.'};
 await publish(g,id,retained,routes);
}
if(import.meta.main&&!process.argv[2])await buildStable();
export async function inspect(id:string){const d=await decode(`${BASE}/before/${id}.glb`);const out={id,sha256:d.sha256,bytes:d.bytes,triangles:d.triangles,bounds:{min:d.bounds.min.toArray(),max:d.bounds.max.toArray()},hierarchy:d.nodes,components:components(d.root).map(({indices,...c})=>c)};mkdirSync(`${BASE}/build`,{recursive:true});writeFileSync(`${BASE}/build/${id}-baseline-decode.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));}
if(import.meta.main&&process.argv[2]==='--inspect'){for(const id of ['nx-town-stable','nx-town-woodyard','nx-artwalk-b8-stable-harmonic-rein','nx-artwalk-b11-woodyard-heartwood-measure','nx-sign-stable-001','nx-sign-woodyard-001']){if(id.startsWith('nx-town'))await inspect(id);else{const d=await decode(`${BASE}/before/${id}.glb`);console.log(JSON.stringify({id,sha256:d.sha256,bounds:{min:d.bounds.min.toArray(),max:d.bounds.max.toArray()},hierarchy:d.nodes}));}}}
