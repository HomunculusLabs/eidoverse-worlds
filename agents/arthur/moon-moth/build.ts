// Moon Moth: an ivory membrane, brass veins, and a quiet lantern heart.
// Model-local +Z is forward. Seat top y=1.97; wing hinges y=1.72.
// Separate merges keep both named wing assemblies without touching shared KEEP law.
import * as THREE from 'three';
import { toGLB, texMat } from '../assets/glbwrite';
import { mergeByMaterial } from '../assets/mergekit';
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new THREE.Group();
const ivory = texMat('moon_silk', [0xede4ca, 0xeae0c6, 0xe8dec4], {rough:.64, metal:.08, seed:31});
const gold = texMat('moon_brass', [0xb79a58, 0xb69a58], {rough:.3, metal:.73, seed:32});
const dark = texMat('moon_midnight', [0x25454b, 0x26464c], {rough:.43, metal:.42, seed:33});
const leather = texMat('moon_saddle', [0x35525a, 0x36535b], {rough:.87, metal:0, seed:34});
const pearl = texMat('moon_light', [0xf7e7b6,0xf7e7b6], {rough:.27, metal:.13, seed:35});
pearl.emissive.set(0xffdd91); pearl.emissiveIntensity=.55;
function mesh(g: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, x=0,y=0,z=0) {
  const m = new THREE.Mesh(geometry, material); m.position.set(x,y,z); g.add(m); return m;
}
function ellipsoid(g: THREE.Group, xyz:number[], scale:number[], material:THREE.Material) {
  return mesh(g,new THREE.SphereGeometry(1,24,12).scale(scale[0],scale[1],scale[2]),material,...xyz as [number,number,number]);
}
function tube(g:THREE.Group, points:number[][], radius:number, material:THREE.Material, segments=32) {
  return mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p as [number,number,number]))),segments,radius,6,false),material);
}
function ring(g:THREE.Group,x:number,y:number,z:number,r:number,t:number,material:THREE.Material) {
  const m=mesh(g,new THREE.TorusGeometry(r,t,8,48).rotateX(Math.PI/2),material,x,y,z); return m;
}
const body = new THREE.Group();
ellipsoid(body,[0,1.32,-.58],[.16,.18,1.9],dark);
ellipsoid(body,[0,1.57,.85],[.69,.51,.84],gold);
ellipsoid(body,[0,1.69,1.75],[.49,.43,.54],ivory);
// Lantern belly segments are visible through open brass ribs, not behind solid frames.
for(let i=0;i<7;i++) {
  const z=-2.13+i*.36, r=.18+.31*Math.sin((i+1)*Math.PI/9);
  ellipsoid(body,[0,1.35,z],[r,.31+r*.2,.13],pearl);
  const hoop=mesh(body,new THREE.TorusGeometry(r+.045,.038,6,32),gold,0,1.35,z);
  hoop.geometry.scale(1,1.08,1);
}
for(const s of [-1,1]) {
  ellipsoid(body,[s*.355,1.77,2.08],[.16,.17,.15],dark);
  ellipsoid(body,[s*.37,1.81,2.18],[.055,.06,.06],pearl);
  const antenna=[[s*.2,2.02,1.98],[s*.43,2.58,2.26],[s*.85,2.78,2.62],[s*1.2,2.53,2.72]];
  tube(body,antenna,.027,gold,24);
  for(let j=0;j<7;j++) {
    const t=j/7, x=s*(.44+.6*t), y=2.6+.12*Math.sin(t*Math.PI), z=2.27+.39*t;
    tube(body,[[x,y,z],[x+s*.12,y+.16,z+.12],[x+s*.27,y+.16,z+.18]],.012,ivory,8);
  }
  // Six landing feet: simple insect joints, roomy open boarding sides.
  for(const z of [-1.2,.15,1.35]) tube(body,[[s*.42,1.28,z],[s*.96,.73,z-.3],[s*1.3,.08,z+.22],[s*1.51,.07,z+.43]],.049,gold,16);
  // Foot stirrups and forward handles make the passenger position legible.
  tube(body,[[s*.44,1.93,.36],[s*.75,1.75,.48],[s*.79,1.04,.57],[s*.58,1.0,.67]],.035,gold,16);
  tube(body,[[s*.35,1.96,.82],[s*.46,2.19,1.02],[s*.25,2.22,1.2]],.034,gold,12);
}
mesh(body,new THREE.BoxGeometry(.88,.19,.96),gold,0,1.81,.18);
mesh(body,new THREE.BoxGeometry(.86,.53,.12),leather,0,2.14,-.35);
mesh(body,new THREE.BoxGeometry(.94,.065,.17),gold,0,2.41,-.35);
mergeByMaterial(body,'moon_body'); root.add(body);
const seat = new THREE.Group();
mesh(seat,new THREE.BoxGeometry(.8,.13,.82),leather,0,1.905,.18);
mergeByMaterial(seat,'moon_seat_cushion'); seat.name='moon_seat'; root.add(seat);
// Forewing: a swept organic sail. Hindwing ends in a long luna-moth tail.
function foreShape() {
  const sh=new THREE.Shape(); sh.moveTo(0,0);
  sh.bezierCurveTo(1.0,1.23,3.9,2.05,5.47,2.39);
  sh.bezierCurveTo(5.78,2.28,5.61,1.19,5.24,.52);
  sh.bezierCurveTo(4.65,-.58,2.31,-1.4,.24,-.4);
  sh.quadraticCurveTo(0,-.22,0,0); return sh;
}
function hindShape() {
  const sh=new THREE.Shape(); sh.moveTo(.15,-.4);
  sh.bezierCurveTo(1.31,-.91,3.19,-.57,4.48,-.77);
  sh.bezierCurveTo(4.27,-1.95,3.65,-2.31,3.17,-2.49);
  sh.bezierCurveTo(3.03,-3.28,2.67,-4.29,2.28,-4.49);
  sh.bezierCurveTo(2.12,-4.47,2.35,-3.16,1.99,-2.57);
  sh.bezierCurveTo(1.16,-2.18,.65,-1.54,.15,-.4); return sh;
}
for(const s of [-1,1]) {
  const wing=new THREE.Group();
  for(const shape of [foreShape(),hindShape()]) {
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false,curveSegments:24});
    // Shape XY maps into XZ. Bake mirrored coordinates before merger.
    geometry.rotateX(Math.PI/2); geometry.scale(s,1,1);
    if(s<0) { // Reflecting geometry flips triangle winding.
      const p=geometry.attributes.position, n=geometry.attributes.normal;
      for(let i=0;i<p.count;i+=3) for(const a of [p,n]) for(let k=0;k<3;k++) {
        const first=a.array[(i+1)*3+k]; a.array[(i+1)*3+k]=a.array[(i+2)*3+k]; a.array[(i+2)*3+k]=first;
      }
      geometry.computeVertexNormals();
    }
    mesh(wing,geometry,ivory);
    const outline=shape.getPoints(70).map(p=>[s*p.x,.045,p.y]);
    tube(wing,outline,.033,gold,120);
  }
  // Six clear radial veins rather than a field of ornament.
  for(const end of [[5.4,2.25],[5.35,1.35],[4.9,.33],[3.65,-.65],[3.27,-2.21],[2.34,-4.17]]) {
    const ex=s*end[0], ez=end[1];
    tube(wing,[[s*.16,.057,-.23],[ex*.4,.057,ez*.42],[ex*.72,.057,ez*.8],[ex,.057,ez]],.022,gold,24);
  }
  // The lunar eyes are large quiet discs, not decorative point noise.
  for(const [x,z,r] of [[3.38,.66,.58],[2.61,-1.54,.39]]) {
    mesh(wing,new THREE.CylinderGeometry(r,r,.027,48),dark,s*x,.052,z);
    ring(wing,s*x,.083,z,r,.032,gold);
    mesh(wing,new THREE.CylinderGeometry(r*.56,r*.56,.032,48),pearl,s*x,.084,z);
    // Crescent shadow, deliberately offset within a luminous moon.
    mesh(wing,new THREE.CylinderGeometry(r*.49,r*.49,.025,40),dark,s*(x+.15),.109,z+.025);
    // Mirrored underside eye ensures underside flight identity.
    mesh(wing,new THREE.CylinderGeometry(r,r,.026,48),dark,s*x,-.069,z);
    ring(wing,s*x,-.093,z,r,.027,gold);
    mesh(wing,new THREE.CylinderGeometry(r*.53,r*.53,.03,40),pearl,s*x,-.098,z);
  }
  mergeByMaterial(wing,'moon_wing'); wing.name=s<0?'moon_wing_left':'moon_wing_right';
  wing.position.set(s*.46,1.72,.15); wing.rotation.set(.26,0,s*.45);
  root.add(wing);
}
const bytes=toGLB(root);
const destination=new URL('./moon-moth.glb',import.meta.url);
writeFileSync(destination,bytes);
const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
const bb=new THREE.Box3().setFromObject(root);
const manifest={name:'Moon Moth',entityId:'nx-moonmoth-001',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,bounds:{min:bb.min.toArray(),max:bb.max.toArray()},wingNames:['moon_wing_left','moon_wing_right'],seat:{top:1.97,center:[0,1.97,.18],socket:[0,2.47,.18],pose:'sitchair'},nodes:doc.nodes.length,meshes:doc.meshes.length};
writeFileSync(new URL('./model-contract.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
