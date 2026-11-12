// Village-overhaul-only architecture; independent of the accepted cabin/global kits.
import * as THREE from 'three';
import { texMat, toGLB } from '../assets/glbwrite.ts';
import { mergeByMaterial } from '../assets/mergekit.ts';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const M = {
  lime: texMat('cabin-lime', [0xdcdcba,0xd5d4b2,0xceceb0], {rough:.96,scale:2,weights:[5,1,1]}),
  timber: texMat('cabin-timber',[0x56503c,0x605c40,0x514b36],{rough:.9,scale:2,stripe:16,weights:[3,1,1]}),
  wood: texMat('cabin-cedar',[0x8a7957,0x827252,0x92815d],{rough:.9,scale:2,stripe:20}),
  stone: texMat('cabin-stone',[0x8c887e,0x847f74,0x77726a],{rough:.96,scale:2,cell:32,weights:[3,1,1]}),
  roof: texMat('cabin-slate',[0x50606a,0x556570,0x4a5963],{rough:.82,scale:1,cell:64,weights:[3,1,1]}),
  roofAlt: texMat('cabin-slate-alt',[0x53636c,0x4e5e67],{rough:.82,scale:1,cell:64,weights:[3,1]}),
  iron: texMat('cabin-iron',[0x404044,0x47474b],{rough:.5,metal:.55,scale:1,stripe:12}),
  glass: texMat('cabin-glass',[0x9fd0d6,0x92c1c7],{rough:.24,metal:.35,scale:1,cell:128}),
  amber: texMat('cabin-amber',[0xffc98a,0xf3bb7c],{rough:.35,scale:1,cell:128}),
};
M.glass.emissive.set(0x507278);M.glass.emissiveIntensity=.18;
M.amber.emissive.set(0xffc98a);M.amber.emissiveIntensity=.55;

export function box(g:THREE.Group,n:string,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=M.timber){
  if(Math.min(w,h,d)<=0)throw Error(`invalid box ${n}`);
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.name=n;o.position.set(x,y,z);g.add(o);return o;
}
export function beam(g:THREE.Group,n:string,a:number[],b:number[],w=.12,d=w,m:THREE.Material=M.timber){
  const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);
  const o=box(g,n,w,v.length(),d,0,0,0,m);o.position.copy(p.add(q).multiplyScalar(.5));
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;
}
export type Opening={x:number,w:number,bottom:number,h:number};
// Wall lies along local X, outward normal +Z. Rotate the finished mesh positions.
export function wall(g:THREE.Group,n:string,w:number,h:number,t:number,cx:number,fy:number,cz:number,yaw=0,openings:Opening[]=[],m:THREE.Material=M.lime){
  const xs=[-w/2,w/2,...openings.flatMap(o=>[o.x-o.w/2,o.x+o.w/2])].sort((a,b)=>a-b);
  const ys=[0,h,...openings.flatMap(o=>[o.bottom,o.bottom+o.h])].sort((a,b)=>a-b);
  const ux=[...new Set(xs)],uy=[...new Set(ys)];let count=0;
  for(let i=0;i<ux.length-1;i++)for(let j=0;j<uy.length-1;j++){
    const x=(ux[i]+ux[i+1])/2,y=(uy[j]+uy[j+1])/2;
    if(x<-w/2||x>w/2||y<0||y>h||openings.some(o=>x>o.x-o.w/2&&x<o.x+o.w/2&&y>o.bottom&&y<o.bottom+o.h))continue;
    const o=box(g,`${n}_${count++}`,ux[i+1]-ux[i],uy[j+1]-uy[j],t,cx+x*Math.cos(yaw),fy+y,cz-x*Math.sin(yaw),m);o.rotation.y=yaw;
  }
}
// Sloped slab pair, properly closed gable ends, discrete overlapping slate courses.
// Ridge along X, center at x/z. Every course edge follows the actual roof slope.
export function roof(g:THREE.Group,n:string,w:number,d:number,eave:number,rise:number,x=0,z=0,over=.3,m:THREE.Material=M.roof){
  const W=w+2*over,D=d+2*over,run=D/2,angle=Math.atan2(rise,run),len=Math.hypot(run,rise);
  const courses=Math.max(5,Math.ceil(len/.43));
  for(const side of [-1,1]){
    const o=box(g,`${n}_under_${side}`,W,.12,len,x,eave+rise/2,z+side*run/2,m);o.rotation.x=side*angle;
    for(let k=0;k<courses;k++){
      const t=(k+.5)/courses;
      const o=box(g,`${n}_course_${side}_${k}`,W,.055,len/courses+.05,x,eave+rise*(1-t)+.073,z+side*run*t,k%3===1?M.roofAlt:m);o.rotation.x=side*angle;
      // Quiet vertical joints on alternating courses: physical slate seams, not a grid painted over the roof.
      const count=Math.ceil(W/.72);
      for(let j=1;j<count;j++){
        const xx=x-W/2+W*j/count+(k%2)*W/count*.5;
        if(xx>=x+W/2-.07)continue;
        const s=box(g,`${n}_seam_${side}_${k}_${j}`,.012,.008,len/courses*.85,xx,eave+rise*(1-t)+.108,z+side*run*t,M.iron);s.rotation.x=side*angle;
      }
    }
    beam(g,`${n}_eave_${side}`,[x-W/2,eave-.015,z+side*run],[x+W/2,eave-.015,z+side*run],.16,.18);
  }
  for(const side of [-1,1]){
    const shape=new THREE.Shape();shape.moveTo(-d/2,0);shape.lineTo(d/2,0);shape.lineTo(0,rise);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:.15,bevelEnabled:false});
    // Shape x is local Z, extrusion local X. Front-face placement differs only by sign.
    const end=new THREE.Mesh(geo,M.lime);end.name=`${n}_gable_${side}`;end.rotation.y=Math.PI/2;end.position.set(x+side*w/2-.075,eave,z);g.add(end);
    for(const s of [-1,1])beam(g,`${n}_verge_${side}_${s}`,[x+side*(W/2-.03),eave+.03,z+s*run],[x+side*(W/2-.03),eave+rise+.09,z],.14,.14);
  }
  box(g,`${n}_ridge`,W+.04,.13,.20,x,eave+rise+.105,z,M.iron);
}
// Real frame bars, no solid frame box hiding the pane. Normal points out +Z.
export function window(g:THREE.Group,n:string,x:number,y:number,z:number,w:number,h:number,yaw=0,warm=true){
  const temp=new THREE.Group();
  box(temp,`${n}_pane`,w-.14,h-.14,.045,0,0,.01,warm?M.amber:M.glass);
  for(const s of [-1,1]){
    box(temp,`${n}_jamb_${s}`,.09,h+.12,.14,s*w/2,0,.025);
    box(temp,`${n}_rail_${s}`,w+.13,.09,.14,0,s*h/2,.025);
  }
  box(temp,`${n}_mullion`,.045,h,.15,0,0,.04);
  box(temp,`${n}_transom`,w,.045,.15,0,h*.08,.04);
  box(temp,`${n}_sill`,w+.3,.12,.26,0,-h/2-.08,.065,M.stone);
  transfer(temp,g,x,y,z,yaw);
}
export function transfer(temp:THREE.Group,g:THREE.Group,x:number,y:number,z:number,yaw=0){
  const mat=new THREE.Matrix4().makeRotationY(yaw);mat.setPosition(x,y,z);temp.updateMatrixWorld(true);
  for(const c of [...temp.children]){c.applyMatrix4(mat);g.add(c);}
}
export function chimney(g:THREE.Group,n:string,x:number,z:number,base:number,top:number){
  box(g,`${n}_shaft`,.72,top-base,.72,x,(base+top)/2,z,M.stone);
  const rows=Math.ceil((top-base)/.28);
  for(let i=1;i<rows;i++)box(g,`${n}_course_${i}`,.745,.028,.745,x,base+i*(top-base)/rows,z,M.timber);
  box(g,`${n}_crown`,.92,.16,.92,x,top+.08,z,M.stone);
  box(g,`${n}_soot`,.55,.014,.55,x,top+.167,z,M.iron);
}
export function finish(g:THREE.Group,id:string){
  g.updateMatrixWorld(true);
  const before=new THREE.Box3().setFromObject(g);
  const parts:any[]=[];g.traverse(o=>{if((o as THREE.Mesh).isMesh){const b=new THREE.Box3().setFromObject(o);parts.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});}});
  mergeByMaterial(g,`village_${id}`);
  const bytes=toGLB(g);const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  const out=`${import.meta.dir}/build`;mkdirSync(out,{recursive:true});
  writeFileSync(`${out}/${id}.glb`,bytes);
  const stats={id,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,nodes:json.nodes.length,meshes:json.meshes.length,bounds:{min:before.min.toArray(),max:before.max.toArray()},parts};
  writeFileSync(`${out}/${id}.json`,JSON.stringify(stats,null,2));
  console.log(JSON.stringify({...stats,parts:parts.length}));return stats;
}
