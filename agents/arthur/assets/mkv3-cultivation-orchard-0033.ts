// mkv3-cultivation-orchard-0033.ts — NW Cultivation landmark orchard.
// Repairs one inherited defect only: opens a human-scale central aisle and
// constructs a simple inward-facing orchard threshold. No motion/components.
import * as THREE from "three";
import {writeFileSync} from "node:fs";
import {toGLB,mat,texMat} from "./glbwrite.ts";
import {mergeByMaterial} from "./mergekit.ts";

const out="agents/arthur/assets/village_cultivation_orchard_0033.glb";
function rng(seed:number){let s=(seed>>>0)||1;return()=>{s=(s*16607)%2147483647;return s/2147483647}}
const r=rng(1653),g=new THREE.Group();
const timber=texMat("timber",[0x59462f,0x6c5538,0x443524],{rough:.95,scale:2.8,weights:[3,2,1],cell:32});
const soil=texMat("soil",[0x66563c,0x78664a,0x55472f],{rough:.98,scale:3.2,weights:[3,2,1],cell:32});
// improve-44 cure (materials class): leaf/fruit were plain mat() -> exported
// material-less -> loader-default near-black crowns (2-of-4 primitives, 5460
// verts). Swapped to real texMats in the same families as the rotation cure;
// crowns now value-banded (lit leaf + dark under-crown). rng draw order
// UNCHANGED (extra fruit dots are deterministic, no r()) so the aisle/gate
// geometry downstream stays byte-identical.
const leaf=texMat("oc_leaf",[0x6e8a4a,0x5f7c40,0x7d9756],{rough:.95,scale:2.2,weights:[2,1,1]});
const leafDk=texMat("oc_leaf_dk",[0x50693c,0x47613a,0x5a7644],{rough:.95,scale:2.2,weights:[2,1,1]});
const fruit=texMat("oc_fruit",[0xd2a43c,0xc2902e,0xe0b44e],{rough:.7,scale:1.2,weights:[2,1,1]});

// 6 columns × 5 rows. The missing center columns form a real 2.2m+ canopy-
// clear aisle from local +Z (core-facing approach) through the whole orchard.
const xs=[-6.35,-4.25,-2.15,2.15,4.25,6.35],zs=[-6.1,-3.05,0,3.05,6.1];
let ti=0;
for(const bx of xs)for(const bz of zs){
 const x=bx+(r()-.5)*.18,z=bz+(r()-.5)*.18,h=2.0+r()*.45;
 const tr=new THREE.Mesh(new THREE.CylinderGeometry(.10,.16,h,6),timber);tr.name=`orch_${ti}_trunk`;tr.position.set(x,h/2,z);g.add(tr);
 // Two low-poly crown masses retain the inherited orchard idiom but stay
 // narrow enough that the central aisle reads from 18m.
 for(let c=0;c<2;c++){
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.72+r()*.16,0),leaf);crown.name=`orch_${ti}_crown_${c}`;crown.position.set(x+(r()-.5)*.32,h+.14+c*.64,z+(r()-.5)*.32);crown.scale.set(1.05,.88,1.05);g.add(crown);
 }
 // improve-44: dark under-crown (value band, kills the flat-dark read) +
 // 3 deterministic fruit dots on the lower crown's surface — visible at
 // 18m; no r() here (rng draw order unchanged downstream).
 const uc=new THREE.Mesh(new THREE.IcosahedronGeometry(.52,0),leafDk);uc.name=`orch_${ti}_under`;uc.position.set(x,h+.34,z);uc.scale.set(1.05,.88,1.05);g.add(uc);
 for(let k=0;k<3;k++){
  const a=ti*1.7+k*2.4,e=.5+.2*((ti+k)%3);
  const fd=new THREE.Mesh(new THREE.IcosahedronGeometry(.095,0),fruit);fd.name=`orch_${ti}_fruitdot_${k}`;
  fd.position.set(x+Math.cos(a)*.74*Math.cos(e),h+.14+.74*Math.sin(e)*.88,z+Math.sin(a)*.74*Math.cos(e));g.add(fd);
 }
 // One restrained fruit cue per tree; this is identity, not a new feature lane.
 const fr=new THREE.Mesh(new THREE.IcosahedronGeometry(.075,0),fruit);fr.name=`orch_${ti}_fruit`;fr.position.set(x+(r()-.5)*.45,h+.2,z+(r()-.5)*.45);g.add(fr);ti++;
}

// Continuous 1.65m trodden-soil aisle, grade-low and clearly bounded.
const path=new THREE.Mesh(new THREE.BoxGeometry(1.65,.055,14.5),soil);path.name="orchard_arrival_aisle";path.position.set(0,.0275,0);g.add(path);
for(let i=0;i<9;i++){
 const stone=new THREE.Mesh(new THREE.BoxGeometry(.58,.075,.42),soil);stone.name=`orchard_aisle_step_${i}`;stone.position.set((r()-.5)*.16,.065,6.1-i*1.52);stone.rotation.y=(r()-.5)*.16;g.add(stone);
}

// Simple threshold at local +Z: two rooted posts and one lintel. It frames the
// aisle without becoming a third building or blocking the 1.4m walking law.
for(const x of[-1.25,1.25]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.11,.16,2.45,6),timber);post.name=`orchard_gate_post_${x<0?'w':'e'}`;post.position.set(x,1.225,7.02);g.add(post)}
const lintel=new THREE.Mesh(new THREE.BoxGeometry(2.75,.16,.18),timber);lintel.name="orchard_gate_lintel";lintel.position.set(0,2.38,7.02);g.add(lintel);
const mark=new THREE.Mesh(new THREE.IcosahedronGeometry(.18,0),fruit);mark.name="orchard_gate_fruit_mark";mark.position.set(.96,2.08,7.0);g.add(mark);

mergeByMaterial(g,"cult_orchard_0033");
writeFileSync(out,toGLB(g));
console.log(JSON.stringify({out,trees:ti,nodes:g.children.length,aisle:{width:1.65,length:14.5,gateClear:2.18}}));
