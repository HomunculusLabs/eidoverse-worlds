// mkv3-artwalk-b13.ts — B-13 SOUTH GATE TWIN TIDES.
// One seven-mark brass/bone cadence rides each south-gate post, mirrored by
// placement into a paired threshold readable from the outer road.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
const g=new THREE.Group(),BRASS=mat(0xa0a248,.35,.82),BONE=mat(0xdcdcba,.72,.03),IRON=texMat("iron",[0x5c5c60,0x54545a],{rough:.4,metal:.55,scale:2,stripe:2,weights:[2,1]});
const add=(n:string,m:THREE.Mesh,x:number,y:number,z:number)=>{m.name=n;m.position.set(x,y,z);g.add(m)};
add("back",new THREE.Mesh(new THREE.BoxGeometry(.40,1.62,.065),IRON),0,.81,0);
for(let i=0;i<7;i++){const y=.18+i*.21,w=.19+.12*(.5+.5*Math.sin(i*Math.PI/3));add(`tide_${i}`,new THREE.Mesh(new THREE.BoxGeometry(w,.045,.035),i%2?BONE:BRASS),(i%2?1:-1)*(.40-w)/4,y,.055)}
add("datum",new THREE.Mesh(new THREE.BoxGeometry(.32,.035,.035),BRASS),0,.08,.06);
mergeByMaterial(g,"b13");writeFileSync("agents/arthur/assets/village_artwalk_b13.glb",toGLB(g));console.log("village_artwalk_b13.glb —",g.children.length,"nodes");
