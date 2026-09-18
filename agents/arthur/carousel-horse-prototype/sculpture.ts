import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { texMat, toGLB } from '../assets/glbwrite.ts';
import { mergeByMaterial } from '../assets/mergekit.ts';

type Point = readonly [number, number, number];
type Ellipsoid = readonly [Point, Point, number];

// +Z is forward. These are sculpted rigid poses, not animated bones.
export const LEG_JOINTS: ReadonlyArray<ReadonlyArray<Point>> = [
  [[.20,.63,.38],[.21,.42,.48],[.22,.34,.78],[.22,.14,.68]],
  [[-.19,.62,.36],[-.20,.38,.44],[-.20,.14,.55],[-.20,-.04,.62]],
  [[.20,.60,-.43],[.21,.34,-.29],[.22,.12,-.57],[.22,-.04,-.69]],
  [[-.20,.60,-.44],[-.21,.36,-.39],[-.22,.18,-.70],[-.22,.07,-.87]],
];
const MASSES: ReadonlyArray<Ellipsoid> = [
  [[0,.565,-.07],[.30,.275,.59],0], // barrel
  [[0,.575,-.44],[.285,.275,.29],0], // haunch
  [[0,.60,.33],[.265,.29,.275],0], // shoulder
  [[0,.845,.38],[.195,.345,.205],.18], // deep neck root
  [[0,1.135,.475],[.125,.28,.145],.24], // tapered crest
  [[0,1.335,.61],[.13,.135,.18],0], // poll
  [[0,1.255,.785],[.127,.135,.245],.35], // long face
  [[0,1.205,.645],[.14,.155,.16],0], // cheek and jaw
  [[0,1.165,.95],[.105,.085,.125],.15], // softly squared muzzle
  [[-.086,1.465,.54],[.038,.102,.035],-.15],
  [[.086,1.465,.54],[.038,.102,.035],-.15],
];

function ellipsoidDistance(x: number, y: number, z: number, [c, r, angle]: Ellipsoid): number {
  const dx=x-c[0], dy=y-c[1], dz=z-c[2], cs=Math.cos(angle), sn=Math.sin(angle);
  const yy=cs*dy+sn*dz, zz=-sn*dy+cs*dz;
  const q0=Math.hypot(dx/r[0],yy/r[1],zz/r[2]);
  const q1=Math.hypot(dx/(r[0]*r[0]),yy/(r[1]*r[1]),zz/(r[2]*r[2]));
  return q1 < 1e-10 ? -Math.min(...r) : q0*(q0-1)/q1;
}
function smoothUnion(a: number,b: number,k: number): number {
  const h=Math.max(k-Math.abs(a-b),0)/k;
  return Math.min(a,b)-h*h*k*.25;
}
function limbDistance(x: number,y: number,z: number,a: Point,b: Point,ra: number,rb: number): number {
  const vx=b[0]-a[0],vy=b[1]-a[1],vz=b[2]-a[2];
  const t=THREE.MathUtils.clamp(((x-a[0])*vx+(y-a[1])*vy+(z-a[2])*vz)/(vx*vx+vy*vy+vz*vz),0,1);
  return Math.hypot(x-a[0]-t*vx,y-a[1]-t*vy,z-a[2]-t*vz)-(ra+(rb-ra)*t);
}

// One continuous implicit surface: no overlapping sphere/cylinder seams.
function carvedCoat(material: THREE.Material): THREE.Mesh {
  const n=64, field=new MarchingCubes(n,material,false,false,30000);
  field.isolation=0;
  const lo=[-.52,-.23,-1.13], span=[1.04,1.96,2.39];
  for(let iz=0;iz<n;iz++)for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){
    const x=lo[0]+span[0]*ix/n,y=lo[1]+span[1]*iy/n,z=lo[2]+span[2]*iz/n;
    let d=10;
    for(const mass of MASSES)d=smoothUnion(d,ellipsoidDistance(x,y,z,mass),.075);
    for(const leg of LEG_JOINTS)for(let j=0;j<3;j++){
      const radii=[.092,.066,.045,.040];
      d=smoothUnion(d,limbDistance(x,y,z,leg[j],leg[j+1],radii[j],radii[j+1]),j===0?.07:.035);
    }
    field.field[ix+n*iy+n*n*iz]=-d;
  }
  field.update();
  const count=field.geometry.drawRange.count;
  if(!Number.isFinite(count)||count===0||count>=90000)throw new Error('carved coat triangle budget');
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute((field.geometry.getAttribute('position').array as Float32Array).slice(0,count*3),3));
  geo.setAttribute('normal',new THREE.BufferAttribute((field.geometry.getAttribute('normal').array as Float32Array).slice(0,count*3),3));
  geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...lo).add(new THREE.Vector3(...span).multiplyScalar(.5)),new THREE.Quaternion(),new THREE.Vector3(...span).multiplyScalar(.5)));
  const uv=new Float32Array(count*2),p=geo.getAttribute('position');
  for(let i=0;i<count;i++){uv[i*2]=(p.getZ(i)+1.13)/2.39;uv[i*2+1]=(p.getY(i)+.23)/1.96;}
  geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  field.geometry.dispose();
  const mesh=new THREE.Mesh(geo,material);mesh.name='carved_coat';return mesh;
}

function paddedSurface(sample:(u:number,t:number)=>[number,number,number,number]):THREE.BufferGeometry {
  const nx=16,nz=24,stride=nx+1,layer=stride*(nz+1),p:number[]=[],uv:number[]=[],ix:number[]=[];
  for(const bottom of [false,true])for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
    const [x,top,low,z]=sample(i/nx*2-1,j/nz);p.push(x,bottom?low:top,z);uv.push(i/nx,j/nz);
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
    const a=j*stride+i,b=a+1,c=a+stride,d=c+1;
    ix.push(a,c,b,b,c,d,a+layer,b+layer,c+layer,b+layer,d+layer,c+layer);
  }
  const edge:number[]=[];
  for(let i=0;i<nx;i++)edge.push(i);
  for(let j=0;j<nz;j++)edge.push(j*stride+nx);
  for(let i=nx;i>0;i--)edge.push(nz*stride+i);
  for(let j=nz;j>0;j--)edge.push(j*stride);
  for(let k=0;k<edge.length;k++){const a=edge[k],b=edge[(k+1)%edge.length];ix.push(a,b,a+layer,b,b+layer,a+layer);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();return geo;
}
function tack(horse: THREE.Group): void {
  const cloth=texMat('prototype_teal_blanket',[0x476771,0x496a73],{rough:.89,scale:1,weights:[4,1]});
  const leather=texMat('prototype_saddle_leather',[0x76513e,0x785440],{rough:.70,scale:1,weights:[4,1]});
  const blanket=new THREE.Mesh(paddedSurface((u,t)=>{
    const end=Math.pow(t*2-1,4),width=.30-.065*end;
    const top=.895-.215*u*u+.065*end*u*u;
    return [width*u,top,top-.035,-.35+.62*t];
  }),cloth);
  blanket.name='draped_blanket';horse.add(blanket);
  const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
  const seat=new THREE.Mesh(paddedSurface((u,t)=>{
    const width=.215-.048*Math.pow(t*2-1,4),side=smooth((Math.abs(u)-.60)/.4);
    const top=1.015+.075*smooth(1-t/.23)+.045*smooth((t-.80)/.20)-.215*side;
    return [width*u,top,top-THREE.MathUtils.lerp(.145,.035,side),-.285+.49*t];
  }),leather);
  seat.name='level_saddle_seat';horse.add(seat);
  const girth=new THREE.Mesh(new THREE.TorusGeometry(.322,.010,6,40).scale(1,.905,3),leather);
  girth.position.set(0,.565,-.04);girth.name='girth';horse.add(girth);
}

// Elliptical swept hair masses: broad carved shapes, not strand particles.
function sweep(points: ReadonlyArray<Point>, widths: number[], depths: number[], material: THREE.Material): THREE.Mesh {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),rings=28,sides=10;
  const pos:number[]=[],uv:number[]=[],indices:number[]=[];
  for(let i=0;i<=rings;i++){
    const t=i/rings,c=curve.getPoint(t),tangent=curve.getTangent(t).normalize();
    const side=new THREE.Vector3(1,0,0),normal=new THREE.Vector3().crossVectors(tangent,side).normalize();
    const slot=t*(widths.length-1),k=Math.min(Math.floor(slot),widths.length-2),f=slot-k;
    const w=THREE.MathUtils.lerp(widths[k],widths[k+1],f),d=THREE.MathUtils.lerp(depths[k],depths[k+1],f);
    for(let j=0;j<=sides;j++){
      const a=j/sides*Math.PI*2;
      const p=c.clone().addScaledVector(side,Math.cos(a)*w).addScaledVector(normal,Math.sin(a)*d);
      pos.push(p.x,p.y,p.z);uv.push(t,j/sides);
      if(i<rings&&j<sides){const q=i*(sides+1)+j;indices.push(q,q+1,q+sides+1,q+1,q+sides+2,q+sides+1);}
    }
  }
  // Close both swept ends; no open fins from rear views.
  for(const end of [0,rings]){
    const c=curve.getPoint(end/rings),center=pos.length/3;pos.push(c.x,c.y,c.z);uv.push(end/rings,.5);
    for(let j=0;j<sides;j++){const a=end*(sides+1)+j,b=a+1;indices.push(...(end===0?[center,b,a]:[center,a,b]));}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  return new THREE.Mesh(geo,material);
}
function details(horse: THREE.Group): void {
  const dark=texMat('prototype_hair_hoof',[0x403128,0x42332a],{rough:.73,scale:1,weights:[4,1]});
  const brass=texMat('prototype_brass',[0xb3955e],{rough:.43,metal:.6});
  const mane=sweep([[0,1.40,.525],[0,1.29,.345],[0,1.10,.235],[0,.91,.16],[0,.83,.13]],[.027,.05,.05,.027,.008],[.03,.085,.10,.07,.01],dark);
  mane.name='carved_mane';horse.add(mane);
  const tail=sweep([[0,.65,-.685],[.015,.55,-.82],[.03,.34,-.98],[.025,.14,-1.025],[.01,.07,-1.04]],[.065,.085,.075,.045,.006],[.06,.085,.08,.055,.006],dark);
  tail.name='carved_tail';horse.add(tail);
  const forelock=sweep([[0,1.409,.625],[0,1.36,.725],[0,1.29,.80]],[.035,.067,.009],[.02,.033,.005],dark);
  forelock.name='forelock';horse.add(forelock);
  for(let i=0;i<LEG_JOINTS.length;i++){
    const foot=LEG_JOINTS[i][3];
    const shape=new THREE.Shape();shape.moveTo(-.047,-.025);shape.lineTo(.047,-.025);shape.lineTo(.047,.025);shape.lineTo(-.047,.025);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelThickness:.012,bevelSize:.01,bevelSegments:2,steps:1}).translate(0,0,-.04);
    const hoof=new THREE.Mesh(geo,dark);hoof.position.set(foot[0],foot[1]-.03,foot[2]);hoof.name=`hoof_${i}`;horse.add(hoof);
  }
  for(const side of [-1,1]){
    const coat=horse.getObjectByName('carved_coat')!;
    const surface=(y:number,z:number)=>{
      const ray=new THREE.Raycaster(new THREE.Vector3(side,y,z),new THREE.Vector3(-side,0,0));
      const hit=ray.intersectObject(coat,false)[0];
      if(!hit)throw new Error('Facial marking has no coat surface');
      return hit.point.x+side*.002;
    };
    const eye=new THREE.Mesh(new THREE.SphereGeometry(1,12,8).scale(.005,.020,.027),dark);
    eye.position.set(surface(1.286,.699),1.286,.699);eye.name=`eye_${side}`;horse.add(eye);
    const nostril=new THREE.Mesh(new THREE.SphereGeometry(1,10,6).scale(.008,.013,.022),dark);
    nostril.position.set(surface(1.177,1.026),1.177,1.026);nostril.name=`nostril_${side}`;horse.add(nostril);
  }
  // Preserve the original moving suspension hardware's envelope.
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.52,8),brass);
  pole.name='underbody_pole';horse.add(pole);
  const clamp=new THREE.Mesh(new THREE.TorusGeometry(.16,.035,6,10),brass);
  clamp.rotation.x=Math.PI/2;clamp.position.y=.27;clamp.name='underbody_clamp';horse.add(clamp);
}

export function buildHorse(): THREE.Group {
  const horse = new THREE.Group();
  horse.name = 'horse_2';
  const cream=texMat('prototype_cream_paint',[0xe1d3b7,0xdfd0b2,0xe4d7bd],{rough:.66,scale:1,weights:[4,1,1]});
  horse.add(carvedCoat(cream));
  tack(horse);
  details(horse);
  return horse;
}

export function buildHorseGLB(): Uint8Array {
  const root=new THREE.Group();root.add(buildHorse());
  mergeByMaterial(root,"cream_prototype");
  return toGLB(root);
}
