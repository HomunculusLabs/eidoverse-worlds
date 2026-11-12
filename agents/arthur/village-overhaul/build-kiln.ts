// Owned kiln lane. No uploads, engine writes, original builders, or world mutation.
import * as THREE from 'three';
import {M,box,beam} from './kit.ts';
import {mesh,cyl,ring,vessel,cream,blue,io,BASE,decodeEvidence,finishRepacked,validateGLB} from './build-potter.ts';
import {texMat} from '../assets/glbwrite.ts';
const brick=texMat('kiln-refractory',[0xb18367,0xa97860,0xbb8b70],{rough:.98,scale:2,cell:64});
const ash=texMat('kiln-soot',[0x3a3430,0x302d2a],{rough:.99,cell:64});
const rawLime=texMat('kiln-limestone-charge',[0xe1ddc5,0xd4d0bb],{rough:.99});
const putty=texMat('kiln-lime-putty',[0xe5e2ce,0xdedbcc],{rough:.75});
const hot=texMat('kiln-hot-coals',[0xe1862b,0xc96620],{rough:.85});hot.emissive.set(0xff5818);hot.emissiveIntensity=1.0;
const flame=texMat('kiln-flame',[0xffc45b,0xffd781],{rough:.5});flame.emissive.set(0xff9b31);flame.emissiveIntensity=1.0;
// Wedge blocks have actual radial thickness and individually modelled joints.
function wedge(g:any,n:string,ri:number,ro:number,y0:number,y1:number,a0:number,a1:number,m:any,roTop=ro,facets=0){
 const s=new THREE.Shape();s.moveTo(Math.sin(a0)*ro,Math.cos(a0)*ro);
 for(let i=1;i<=4;i++){const a=a0+(a1-a0)*i/4;s.lineTo(Math.sin(a)*ro,Math.cos(a)*ro);}
 for(let i=4;i>=0;i--){const a=a0+(a1-a0)*i/4;s.lineTo(Math.sin(a)*ri,Math.cos(a)*ri);}s.closePath();
 const geo=new THREE.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false});geo.rotateX(Math.PI/2);geo.translate(0,y1,0);
 const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const r=Math.hypot(pos.getX(i),pos.getZ(i)),t=(pos.getY(i)-y0)/(y1-y0),theta=(Math.atan2(pos.getX(i),pos.getZ(i))+Math.PI*2)%(Math.PI*2),step=facets?Math.PI*2/facets:1,facetFactor=facets?Math.cos(step/2)/Math.cos(theta%step-step/2):1,f=(r+(roTop-ro)*t)/r*facetFactor;pos.setXYZ(i,pos.getX(i)*f,pos.getY(i),pos.getZ(i)*f);}geo.computeVertexNormals();return mesh(g,n,geo,m);
}
function arch(g:any,n:string,ri:number,ro:number,spring:number,z0:number,z1:number,m:any){
 for(let k=0;k<13;k++){
  const a=k*Math.PI/13+.006,b=(k+1)*Math.PI/13-.006,s=new THREE.Shape();
  s.moveTo(Math.cos(a)*ri,spring+Math.sin(a)*ri);s.lineTo(Math.cos(a)*ro,spring+Math.sin(a)*ro);
  s.lineTo(Math.cos(b)*ro,spring+Math.sin(b)*ro);s.lineTo(Math.cos(b)*ri,spring+Math.sin(b)*ri);s.closePath();
  mesh(g,`${n}_${k}`,new THREE.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false}),m,0,0,z0);
 }
}
function shed(g:any){
 // Shelter is deliberately beside, not on top of the hot charging throat.
 // Custom single-plane roof avoids the campaign helper's gable closure defect.
 for(const x of [1.39,2.44])for(const z of [-1.08,1.28]){
  box(g,'shelter_shoe',.25,.16,.25,x,.08,z,M.stone);
  const top=2.40-.18*z;
  box(g,'shelter_post',.115,top-.16,.115,x,(top+.16)/2,z,M.timber);
  box(g,'post_iron_sock',.125,.18,.125,x,.25,z,M.iron);
 }
 for(const z of [-1.08,1.28]){
  const y=2.40-.18*z;
  beam(g,'shelter_crossbeam',[1.31,y,z],[2.53,y,z],.14,.16);
  beam(g,'knee_brace',[2.44,y-.42,z],[2.09,y-.05,z],.075,.085);
 }
 for(const x of [1.35,2.48])beam(g,'shelter_sideplate',[x,2.64,-1.15],[x,2.185,1.38],.13,.12);
 const z0=-1.24,z1=1.51,angle=Math.atan(.18),len=(z1-z0)/Math.cos(angle);
 const roof=box(g,'shelter_closed_roof',1.37,.08,len,1.925,2.47-.18*(z0+z1)/2,(z0+z1)/2,M.roof);roof.rotation.x=angle;
 for(let i=0;i<7;i++){
  const z=z0+(z1-z0)*(i+.5)/7,y=2.535-.18*z;
  for(let j=0;j<3;j++){
   const t=box(g,'individual_slate',1.36/3-.012,.035,len/7+.035,1.245+(j+.5)*1.36/3,y,z,i%3===1?M.roofAlt:M.roof);t.rotation.x=angle;
  }
 }
 // Dwarf back wall is quiet limewash in real stone end piers.
 box(g,'shed_lime_back',1.04,1.09,.13,1.91,.705,-1.04,M.lime);
 for(const x of [1.42,2.40])box(g,'shed_stone_pier',.18,.55,.23,x,.355,-1.04,M.stone);
 // Rebuilt slaking trough: a real basin, white putty visible within thick edges.
 box(g,'slake_basin_floor',1.03,.15,.70,1.95,.13,-.54,M.stone);
 for(const x of [1.435,2.465])box(g,'slake_side',.12,.43,.82,x,.345,-.54,M.stone);
 for(const z of [-.95,-.13])box(g,'slake_end',1.15,.43,.12,1.95,.345,z,M.stone);
 box(g,'lime_putty',.91,.04,.70,1.95,.43,-.54,putty);
 for(let i=0;i<4;i++){const o=mesh(g,'putty_ridge',new THREE.SphereGeometry(.15,12,6),putty,1.68+i*.18,.445,-.50);o.scale.set(1,.06,1.3);}
 beam(g,'slaking_paddle',[2.15,.44,-.58],[2.32,1.28,-.73],.034,.024,M.wood);
 box(g,'paddle_blade',.16,.28,.025,2.15,.60,-.58,M.wood);
 box(g,'tool_shelf',1.01,.06,.28,1.95,1.42,-.87,M.wood);
 vessel(g,'burner_pitcher',1.73,1.45,-.87,.12,.26,cream,'bottle');
 box(g,'folded_lime_sacks',.48,.18,.28,2.19,1.54,-.87,M.lime);
 beam(g,'long_poker',[2.49,.17,.08],[2.50,1.69,-.01],.022,.022,M.iron);
 // The baseline's useful warm lantern survives as the same identity-frame
 // glow anchor, now visibly hung under the shelter instead of buried in stone.
 const lantern=new THREE.Group();lantern.name='glow';g.add(lantern);
 beam(lantern,'lamp_bracket',[2.48,2.17,.90],[2.26,2.17,.90],.022,.022,M.iron);
 beam(lantern,'hanger',[2.26,2.17,.90],[2.26,2.045,.90],.012,.012,M.iron);
 box(lantern,'amber_panes',.12,.18,.12,2.26,1.94,.90,M.amber);
 for(const y of [1.835,2.045])box(lantern,'lantern_cap',.18,.03,.18,2.26,y,.90,M.iron);
 for(const x of [2.19,2.33])for(const z of [.83,.97])box(lantern,'lantern_bar',.013,.21,.013,x,1.94,z,M.iron);
}
export function buildKiln(){
 const g=new THREE.Group();g.name='limeburners-yard';
 // Lime kiln keeps its craft purpose: stone charge, high open throat, draw arch,
 // fuel bed, seven-mark burn ledger, and a separate sheltered slaking station.
 for(let k=0;k<20;k++)wedge(g,'foundation_ashlar',.75,1.18,.0,.18,k*Math.PI/10+.005,(k+1)*Math.PI/10-.005,M.stone);
 cyl(g,'refractory_chamber_floor',.83,.09,0,.105,0,brick);
 // Continuous refractory backing closes masonry joints in the firing chamber.
 for(let k=0;k<12;k++)wedge(g,'continuous_firebrick_liner',.68,.87,.15,1.68,Math.PI/4+k*Math.PI/8,Math.PI/4+(k+1)*Math.PI/8,brick,.82);
 // Open stone firing shell: front sector deliberately absent around the mouth.
 for(let row=0;row<7;row++){
  const y0=.18+row*.215,y1=y0+.202,ro=1.08-row*.018;
  for(let k=0;k<24;k++){
   const a0=k*Math.PI/12,a1=(k+1)*Math.PI/12,mid=(a0+a1)/2;
   if(row<=4 && Math.cos(mid)>.70)continue;
   wedge(g,'chamber_ashlar',ro-.25,ro,y0,y1,a0+.003,a1-.003,(row+k)%7===1?M.lime:M.stone);
  }
 }
 // Flat architectural front backs protected heat-contours at host z1.145..1.270.
 // Portal begins above ash sill and fits the inner art ring, not vice versa.
 const s=new THREE.Shape();s.moveTo(-.91,.03);s.lineTo(.91,.03);s.lineTo(.91,1.69);s.lineTo(-.91,1.69);s.closePath();
 const hole=new THREE.Path();hole.moveTo(-.325,.42);hole.lineTo(-.325,.82);hole.absarc(0,.82,.325,Math.PI,0,true);hole.lineTo(.325,.42);hole.closePath();s.holes.push(hole);
 mesh(g,'solid_portal_with_true_void',new THREE.ExtrudeGeometry(s,{depth:.25,bevelEnabled:false}),M.stone,0,0,.882);
 arch(g,'refractory_arch',.325,.425,.82,.77,1.133,brick);
 for(const x of [-.377,.377])box(g,'refractory_jamb',.105,.40,.363,x,.62,.9515,brick);
 box(g,'refractory_hearth',.85,.09,.83,0,.375,.717,brick);
 // Rings' four original mounting plates are backed narrowly; no broad exemption.
 for(const x of [-.72,.72])for(const y of [.22,1.42])box(g,'art_mount_backing',.11,.17,.05,x,y,1.131,M.stone);
 // Individual quoins break the plain front without covering art.
 for(const x of [-.86,.86])for(let k=0;k<7;k++)box(g,'front_quoin',.16,.207,.26,x,.15+k*.22,1.005,k%2?M.lime:M.stone);
 // Hollow upper charging throat; cone radius remains the original sign-support
 // profile r=1-(y-1.6)*.3/1.3 at both y2.35 and y2.55 iron straps.
 for(let row=0;row<7;row++){
  const y0=1.67+row*.185,y1=y0+.175,ro=1-(y0-1.6)*.3/1.3;
  for(let k=0;k<32;k++)wedge(g,'upper_drum_course',ro-.24,ro,y0,y1,k*Math.PI/16+.002,(k+1)*Math.PI/16-.002,M.stone,1-(y1-1.6)*.3/1.3,16);
 }
 for(let k=0;k<24;k++)wedge(g,'charging_crown',.43,.76,2.965,3.10,k*Math.PI/12+.003,(k+1)*Math.PI/12-.003,M.stone);
 // Deep soot liner makes the throat read as an actual shaft, not a cap.
 for(let k=0;k<32;k++)wedge(g,'dark_internal_throat',.39,.435,1.25,3.075,k*Math.PI/16,(k+1)*Math.PI/16,ash);
 // Sign-arm roots contact dedicated masonry pads only in their true attachment band.
 for(const x of [-.24,.24])box(g,'sign_arm_socket',.105,.12,.20,x,2.33,.75,M.stone);
 // Recessed coals, grate, and irregular flame tongues visible through real void.
 const fireGroup=new THREE.Group();fireGroup.name='fire_kiln';g.add(fireGroup);
 box(fireGroup,'coal_bed',.55,.075,.39,0,.445,.845,hot);
 for(let i=0;i<7;i++){
  const x=-.24+i*.08;
  const o=mesh(fireGroup,'coal_'+i,new THREE.IcosahedronGeometry(.065,0),hot,x,.495,.89+(i%2)*.06);o.scale.set(1,.60,1);
 }
 for(let i=0;i<4;i++){
  const x=-.19+i*.12,h=.18+(i%3)*.07;
  const sh=new THREE.Shape();sh.moveTo(x-.043,.51);sh.lineTo(x-.033,.51+h*.55);sh.lineTo(x+.024,.51+h);sh.lineTo(x+.025,.51+h*.4);sh.lineTo(x+.044,.51);sh.closePath();
  mesh(fireGroup,'tongue_'+i,new THREE.ExtrudeGeometry(sh,{depth:.035,bevelEnabled:false}),flame,0,0,1.01);
 }
 for(const x of [-.22,-.11,0,.11,.22])box(g,'furnace_grate',.018,.035,.50,x,.47,.83,M.iron);
 // Dry stone charge chest on left, limestone visibly stacked above its timber rails.
 box(g,'charge_foundation',.81,.095,1.35,-1.79,.0475,.78,M.stone);
 for(const z of [.16,1.40])box(g,'charge_end',.79,.36,.065,-1.79,.27,z,M.wood);
 for(const x of [-2.15,-1.43])for(const y of [.16,.39])box(g,'charge_rail',.075,.10,1.25,x,y,.78,M.timber);
 for(let i=0;i<14;i++){
  const x=-2.00+(i%3)*.22,z=.36+(Math.floor(i/3)%4)*.24,y=.19+(i>10?.21:0);
  const o=mesh(g,'raw_limestone',new THREE.IcosahedronGeometry(.15+(i%3)*.018,0),rawLime,x,y,z);o.rotation.set(i*.31,i*.73,i*.11);o.scale.set(1,.8,1);
 }
 // Seven-mark original useful ledger recast clearly beside the mouth.
 box(g,'burn_ledger_board',.27,.55,.035,1.05,1.02,.96,M.timber);
 for(let i=0;i<7;i++)box(g,'burn_ledger_tally',.11,.023,.016,1.05,1.20-i*.058,.986,i%2?M.wood:M.lime);
 // Removable charging ladder: a practical loading implement, not an invented
 // player ladder component. Feet stay in the existing left/back work envelope.
 for(const z of [-.44,.04])beam(g,'charging_ladder_rail',[-2.08,.07,z],[-.60,3.10,z],.048,.055,M.wood);
 for(let i=1;i<=10;i++){
  const t=i/11,x=-2.08+1.48*t,y=.07+3.03*t;
  beam(g,'charging_ladder_rung',[x,y,-.44],[x,y,.04],.045,.045,M.timber);
 }
 shed(g);
 return g;
}
export async function testKilnIntegrity(){
 const {root,doc,out}=await decodeEvidence('nx-town-kiln');const checks:any[]=[];
 const stoneNames=new Set(doc.getRoot().listNodes().filter(n=>n.getMesh()?.listPrimitives().some(p=>p.getMaterial()?.getName()==='cabin-stone')).map(n=>n.getName()));
 const stone=root.children.filter(n=>stoneNames.has(n.name));
 for(const z of [-.44,.04]){
  const ray=new THREE.Raycaster(new THREE.Vector3(-.60,3.26,z),new THREE.Vector3(0,-1,0));
  const hit:any=ray.intersectObjects(stone,true)[0];checks.push({name:'ladder-top-masonry-support',x:-.60,z,hitY:hit?.point.y??null,pass:!!hit&&hit.point.y>=3.00});
 }
 const fire=doc.getRoot().listNodes().filter(n=>n.getName()==='fire_kiln');
 checks.push({name:'named-fire-group-and-emissive-heat',pass:fire.length===1&&fire[0].listChildren().length===2&&doc.getRoot().listMaterials().some(m=>m.getEmissiveFactor()[0]>.8)});
 const glow=doc.getRoot().listNodes().filter(n=>n.getName()==='glow');checks.push({name:'retained-warm-lantern-anchor',pass:glow.length===1&&glow[0].listChildren().length>0});
 const result={id:'nx-town-kiln',sha256:out.sha256,status:checks.every(c=>c.pass)?'PASS':'FAIL',checks};
 const {writeFileSync}=await import('node:fs');writeFileSync(`${BASE}/build/nx-town-kiln-integrity.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));return result;
}
if(import.meta.main){if(process.argv.includes('--test')){const {functionality}=await import('./build-potter.ts');const r=await functionality('nx-town-kiln'),i=await testKilnIntegrity();process.exitCode=r.status==='PASS'&&i.status==='PASS'?0:1;}else if(process.argv.includes('--assembly')){const {assembly}=await import('./build-potter.ts');await assembly('nx-town-kiln','before');await assembly('nx-town-kiln','final');}else if(process.argv.includes('--verify'))console.log(JSON.stringify((await decodeEvidence('nx-town-kiln')).out));else if(process.argv.includes('--validate'))await validateGLB('nx-town-kiln');else await finishRepacked(buildKiln(),'nx-town-kiln');}
