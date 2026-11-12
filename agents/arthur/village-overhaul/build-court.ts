// LOCAL ONLY: bakery + repair workshop around a genuinely traversable shared court.
import * as THREE from 'three';
import {readFileSync,writeFileSync} from 'node:fs';
import {M,box,beam,wall,window,finish} from './kit.ts';
import {texMat} from '../assets/glbwrite.ts';
import {base,source,retain,cyl,arch,water,sha} from './build-forge.ts';
const bread=texMat('court-crust',[0xc39758,0xd0a768,0xb98a4a],{rough:.95,cell:64});
const brick=texMat('court-oven-brick',[0xa18167,0xb39277,0x98785f],{rough:.97,cell:32});
const brass=texMat('court-brass',[0xa99862,0xb5a46c],{rough:.52,metal:.6,cell:128});
const g=new THREE.Group();
// Lane-specific roof: full clipped gable end follows actual outer slab slope.
// No copied-kit wedge gap. Ridge along Z; real underdeck, overlapping slate and iron caps.
function roofZ(n:string,x:number,z:number,w:number,d:number,eave:number,rise:number){
 const run=w/2,angle=Math.atan2(rise,run),len=Math.hypot(run,rise),rows=Math.ceil(len/.4);
 for(const s of [-1,1]){
  const deck=box(g,n+'_deck',len,.115,d,x+s*run/2,eave+rise/2,z,M.roof);deck.rotation.z=-s*angle;
  for(let k=0;k<rows;k++){const t=(k+.5)/rows;const tile=box(g,n+'_slate_'+k,len/rows+.04,.055,d,x+s*run*t,eave+rise*(1-t)+.085,z,k%3===1?M.roofAlt:M.roof);tile.rotation.z=-s*angle;
   for(let j=1;j<Math.floor(d/.63);j++){const zz=z-d/2+j*.63+(k%2)*.21;if(zz>z+d/2-.1)continue;const joint=box(g,n+'_lap',len/rows*.8,.012,.012,x+s*run*t,eave+rise*(1-t)+.119,zz,M.iron);joint.rotation.z=-s*angle;}
  }
  beam(g,n+'_eave',[x+s*run,eave,z-d/2],[x+s*run,eave,z+d/2],.14,.15);
 }
 for(const s of [-1,1]){const shape=new THREE.Shape();shape.moveTo(-run,0);shape.lineTo(run,0);shape.lineTo(0,rise);shape.closePath();const o=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false}),M.lime);o.position.set(x,eave,z+s*(d/2-.43)-.07);o.name=n+'_closed_gable';g.add(o);
  for(const side of [-1,1])beam(g,n+'_verge',[x+side*run,eave+.04,z+s*d/2],[x,eave+rise+.07,z+s*d/2],.13,.14);
  beam(g,n+'_kingpost',[x,eave+.72,z+s*(d/2-.15)],[x,eave+rise-.06,z+s*(d/2-.15)],.12);
 }
 box(g,n+'_ridge',.18,.13,d+.03,x,eave+rise+.09,z,M.iron);
}
function bench(n:string,x:number,z:number,w:number,d=.56,y=.91){box(g,n+'_top',w,.1,d,x,y,z,M.wood);for(const s of [-1,1]){box(g,n+'_leg',.12,y-.25,.36,x+s*(w/2-.15),(.2+y-.05)/2,z);beam(g,n+'_brace',[x+s*(w/2-.16),.3,z],[x,y-.08,z],.085);}box(g,n+'_stretcher',w-.3,.1,.1,x,.39,z);}
function loaf(n:string,x:number,y:number,z:number,rot=0){const o=new THREE.Mesh(new THREE.SphereGeometry(.18,12,8),bread);o.scale.set(1.4,.65,.8);o.rotation.y=rot;o.position.set(x,y,z);o.name=n;g.add(o);for(let i=-1;i<=1;i++){const cut=box(g,n+'_score',.028,.016,.19,x+i*.10,y+.111,z,M.lime);cut.rotation.y=-.35;}}
function barrel(n:string,x:number,z:number,r=.28,h=.65,filled=false){for(let i=0;i<16;i++){const a=i*Math.PI/8;const o=box(g,n+'_stave',r*.38,h,.044,x+Math.sin(a)*(r-.022),.2+h/2,z+Math.cos(a)*(r-.022),M.wood);o.rotation.y=a;}for(const y of [.2+h*.18,.2+h*.82]){const o=new THREE.Mesh(new THREE.TorusGeometry(r,.018,6,24),M.iron);o.rotation.x=Math.PI/2;o.position.set(x,y,z);g.add(o);}cyl(g,filled?'glow_'+n+'_water':n+'_flour',r-.052,r-.052,.02,x,.2+h-.06,z,filled?water:M.lime,24);}
const doc=await source('nx-court');
const names=doc.getRoot().listNodes().map((n:any)=>n.getName()).filter((n:string)=>/^(fire|flame|lamp|glow)/.test(n));
const kept=retain(doc,g,names);
// Exact source XZ extents are carried by useful masonry foundation and workshop table.
// Cistern alcove is deliberately NOT paved over; its body starts z=2.31.
box(g,'west_plinth',5.4,.4,4.2,-3.4,0,0,M.stone);box(g,'east_plinth',5.4,.4,4.2,3.4,0,0,M.stone);
box(g,'court_paving',2.1,.2,4.2,0,.1,0,M.stone);
for(const x of [-3.4,3.4]){box(g,'threshold_landing',2.1,.2,.9,x,.1,2.55,M.stone);box(g,'door_threshold',2.15,.04,.34,x,.18,2.05,M.stone);}
// Rear cart apron, below the frozen detached count artworks (never shifted).
box(g,'rear_cart_paving',2.7,.2,.84,-1.6,.1,-2.52,M.stone);
for(const [cx,w] of [[-2.47,3.54],[3.4,5.4]]){
 wall(g,'rear_lime',w,3.0,.24,cx,.2,-2.0,0,[{x:0,w:1.4,bottom:1.25,h:1.1}]);
 window(g,'rear_window',cx,2.0,-2.14,1.4,1.1,Math.PI,false);
 box(g,'rear_sill',w,.5,.27,cx,.45,-2.0,M.stone);
}
// West low oven wing lets the immutable smoke origin emerge above a genuine flue.
wall(g,'oven_west',4,2.4,.24,-5.98,.2,0,Math.PI/2,[]);
wall(g,'bakery_court_side',4,3.05,.22,-.81,.2,0,Math.PI/2,[{x:-.1,w:1.5,bottom:0,h:2.3}]);
wall(g,'smith_court_side',4,3.05,.22,.81,.2,0,Math.PI/2,[{x:-.1,w:1.5,bottom:0,h:2.3}]);
wall(g,'smith_east',4,3.05,.24,5.98,.2,0,Math.PI/2,[{x:.3,w:1.3,bottom:1.2,h:1.05}]);
window(g,'smith_daylight',6.115,1.925,-.3,1.3,1.05,Math.PI/2,false);
// End-sign attachment surfaces preserve the existing x=±6.1 faces.
box(g,'bakery_sign_backing',.12,.8,.52,-6.04,2.13,1.4,M.timber);
box(g,'smith_sign_backing',.12,.8,.47,6.04,2.13,-1.4,M.timber);
// Jointed masonry piers and generous arch-fronted trade openings.
for(const [cx,r,top] of [[-3.15,1.02,3.22],[3.4,1.20,3.22]]){
 const spring=2.38;for(const s of [-1,1]){box(g,'front_pier',.39,2.23,.43,cx+s*(r+.19),1.315,1.99,M.lime);box(g,'pier_base',.47,.54,.48,cx+s*(r+.19),.47,1.99,M.stone);box(g,'pier_cap',.5,.14,.51,cx+s*(r+.19),2.32,1.99,M.stone);}
 arch(g,'entrance_arch',cx,1.99,r,spring,.24,.43,M.stone);
 // Above the arch use gable rather than a solid lintel across its opening.
}
// Outside-front returns do not obstruct retained jamb lamps or entry lanes.
box(g,'bakery_west_front',1.1,2.35,.24,-5.55,1.375,2.0,M.lime);
box(g,'bakery_east_front',.35,3.03,.24,-1.0,1.715,2.0,M.lime);
box(g,'smith_west_front',.35,3.03,.24,1.0,1.715,2.0,M.lime);
box(g,'smith_east_front',1.04,3.03,.24,5.58,1.715,2.0,M.lime);
// Tall bakehouse clerestory plus broad workshop: deliberately different roof masses.
roofZ('bakehouse',-2.66,0,3.51,4.67,3.18,1.3);
// Close the raised bakehouse/low-oven lean-to seam with a roof-profiled cheek.
// Top follows the underside of the main western roof, not a rectangular plaster horn.
{const s=new THREE.Shape();s.moveTo(-4.33,2.86);s.lineTo(-4.19,2.86);s.lineTo(-4.19,3.30);s.lineTo(-4.33,3.196);s.closePath();const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:4.15,bevelEnabled:false}),M.lime);o.position.z=-2.075;o.name='oven_lean_to_closure';g.add(o);}
roofZ('workhall',3.4,0,6.0,4.67,3.18,1.44);
// Low side roof slopes towards west. Subdivide around exact smoke shaft aperture.
const x0=-6.4,x1=-4.22,z0=-2.32,z1=2.34,slope=.18;
const lowY=(x:number)=>2.58+(x-x0)*slope;
// Sloped masonry closure under the low oven roof, matching its actual plane.
{const s=new THREE.Shape();s.moveTo(-6.1,.2);s.lineTo(-4.22,.2);s.lineTo(-4.22,lowY(-4.22)-.04);s.lineTo(-6.1,lowY(-6.1)-.04);s.closePath();const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.24,bevelEnabled:false}),M.lime);o.position.z=-2.12;o.name='oven_rear_clipped_wall';g.add(o);}
const xs=[x0,-5.19,-4.61,x1],zs=[z0,-1.09,-.51,z1];
for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(i===1&&j===1)continue;const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;const o=box(g,'oven_slate',Math.hypot(xs[i+1]-xs[i],slope*(xs[i+1]-xs[i])),.1,zs[j+1]-zs[j],x,lowY(x),z,M.roof);o.rotation.z=Math.atan(slope);}
for(const z of [-2.30,2.32])beam(g,'low_roof_verge',[x0,lowY(x0),z],[x1,lowY(x1),z],.14,.14);
beam(g,'oven_eave',[x0,2.56,-2.32],[x0,2.56,2.34],.2,.2);
// Chimney: hollow, top exactly below smoke origin [-4.9,3.2,-.8].
for(const s of [-1,1]){box(g,'oven_flue_x',.085,1.55,.55,-4.9+s*.24,2.375,-.8,brick);box(g,'oven_flue_z',.395,1.55,.085,-4.9,2.375,-.8+s*.24,brick);}
for(const s of [-1,1]){box(g,'oven_flue_rim_x',.10,.06,.58,-4.9+s*.24,3.17,-.8,M.stone);box(g,'oven_flue_rim_z',.38,.06,.10,-4.9,3.17,-.8+s*.24,M.stone);}
// Stone beehive oven with a real throat/mouth and horizontal working hearth.
box(g,'oven_base',1.52,.6,1.35,-4.9,.5,-.8,brick);
const dome=new THREE.Mesh(new THREE.SphereGeometry(.72,24,12,0,Math.PI*2,0,Math.PI/2),brick);dome.position.set(-4.9,1.08,-.8);dome.name='oven_dome';g.add(dome);
box(g,'oven_opening_dark',.69,.49,.07,-4.9,1.0,-.11,M.iron);arch(g,'oven_mouth_arch',-4.9,-.045,.32,1.00,.12,.14,brick);
box(g,'oven_hearth',1.3,.09,.44,-4.9,.76,-.1,M.stone);
beam(g,'peel_handle',[-4.02,.22,-1.5],[-4.02,1.7,-1.65],.05,.04,M.wood);box(g,'peel_head',.32,.04,.45,-4.02,1.72,-1.65,M.wood);
bench('kneading_counter',-2.82,-1.56,2.35,.63,.98);
for(let i=0;i<4;i++)loaf('morning_loaf',-3.55+i*.47,1.15,-1.54);
bench('bread_display',-5.03,.73,.58,1.38,.94);for(let i=0;i<3;i++)loaf('display_loaf',-5.03,1.1,.28+i*.43,Math.PI/2);
barrel('flour',-5.65,1.16,.27,.62);
for(const y of [1.35,1.8]){box(g,'proofing_shelf',.38,.07,1.25,-5.73,y,-.3,M.wood);for(const z of [-.68,-.05])cyl(g,'proofing_bowl',.14,.1,.1,-5.7,y+.085,z,M.lime);}
// Repair trade: bench -> heating -> anvil -> visible quench -> completed ironware.
bench('repair_bench',3.05,-1.58,2.45,.63,.99);
box(g,'tool_rack',2.15,.13,.13,3.15,1.97,-1.79,M.timber);
for(let i=0;i<5;i++){const x=2.28+i*.42;beam(g,'tool_handle',[x,1.45,-1.72],[x,1.98,-1.72],.06,.045,M.wood);box(g,'tool_head',.21,.1,.11,x,1.54,-1.72,M.iron);box(g,'hinge',.2,.04,.19,x,1.085,-1.57,M.iron);}
box(g,'smith_hearth',1.04,.7,1.05,4.92,.55,-1.0,brick);box(g,'smith_coalbed',.78,.05,.8,4.92,.92,-1.0,M.iron);
for(const s of [-1,1])box(g,'smith_fire_cheek',.12,.38,.84,4.92+s*.45,1.11,-1.0,brick);
box(g,'smith_flue',.34,2.9,.36,5.12,2.1,-1.48,M.iron);
cyl(g,'anvil_stump',.27,.31,.48,5,.44,.6);box(g,'anvil_waist',.25,.18,.23,5,.79,.6,M.iron);box(g,'anvil_face',.65,.13,.29,5,.95,.6,M.iron);
const horn=new THREE.Mesh(new THREE.ConeGeometry(.10,.32,12),M.iron);horn.rotation.z=-Math.PI/2;horn.position.set(5.43,.95,.6);g.add(horn);
barrel('quench',4.9,-.13,.3,.69,true);barrel('charcoal',5.55,-.89,.24,.48);
for(let i=0;i<4;i++)box(g,'iron_stock',.88,.045,.055,4.7,1.72+i*.16,-1.81,M.iron);
// Shared court is a real 1.4m passage, with rear civic bench instead of pinching side benches.
bench('council_bench',0,-1.51,1.5,.40,.53);box(g,'council_backrest',1.55,.35,.07,0,.79,-1.71,M.wood);
box(g,'justice_crossbeam',2.1,.2,.24,0,2.85,1.8,M.timber);
beam(g,'court_balance',[-.43,2.81,1.81],[.43,2.81,1.81],.033,.033,brass);
for(const s of [-1,1]){beam(g,'balance_hanger',[s*.43,2.8,1.81],[s*.43,2.54,1.81],.018,.018,brass);cyl(g,'balance_pan',.14,.1,.03,s*.43,2.52,1.81,brass);}
// Back delivery handcart and front outdoor vice bench remain useful and outside entries.
// Served Draco baseline extends to z=3.000267505645752. Match the useful tabletop edge exactly.
bench('yard_vice_table',-5.2,2.75,1.3,.500535011291504,.92);box(g,'yard_vice',.17,.14,.2,-4.65,1.04,2.75,M.iron);
box(g,'cart_bed',1.05,.1,.75,-1.61,.65,-2.45,M.wood);for(const s of [-1,1]){const o=cyl(g,'cart_wheel',.27,.27,.07,-1.61+s*.55,.47,-2.45,M.timber);o.rotation.z=Math.PI/2;}
for(const x of [-1.85,-1.4]){const o=new THREE.Mesh(new THREE.SphereGeometry(.2,12,8),M.lime);o.position.set(x,.87,-2.45);o.scale.y=1.2;g.add(o);}
// Exact outer X bound, as real roof/verge ends rather than invisible collision pads.
for(const s of [-1,1])box(g,'outer_verge_cap',.1,.14,.23,s*6.45,2.57,s<0?2.32:-2.3,M.iron);
// The east cap needs a real return into the eave, not a disconnected bounds witness.
beam(g,'east_verge_return',[6.08,2.66,-2.11],[6.45,2.58,-2.3],.1,.1,M.iron);
const stat=finish(g,'court');
writeFileSync(`${base}/build/court-preservation.json`,JSON.stringify({host:JSON.parse(readFileSync(`${base}/before/contracts.json`,'utf8')).find((x:any)=>x.id==='nx-court'),kept,originalSha256:sha(readFileSync(`${base}/before/nx-court.glb`)),detachedRiderIssue:'B28 and B29 are already double-offset beyond original rear envelope. Their exact tuples/faces remain unchanged and unobstructed; backing requires parent-authorized companion correction.'},null,2));
