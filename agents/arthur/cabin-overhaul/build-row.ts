// Cabin-overhaul commission: local generation only. No live imports/verbs.
import * as THREE from 'three';
import { M,box as archBox,beam,wall,roof,window,chimney,transfer,finish } from './kit.ts';
import { mat } from '../assets/glbwrite.ts';
import { C,ACCENTS,box,furnitureBench } from '../assets/housekit.ts';
const timberTex=M.wood,stoneTex=M.stone,ironTex=M.iron;
const texBox=archBox;
const glow=(g:THREE.Group,name:string,x:number,y:number,z:number,c=0xffc98a,r=.06)=>{
 const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.9,roughness:.4}));o.name=name;o.position.set(x,y,z);g.add(o);
};
const fireMesh=(g:THREE.Group,name:string,x:number,y:number,z:number,r=.22)=>{
 const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),new THREE.MeshStandardMaterial({color:0xff9040,emissive:0xff6a1a,emissiveIntensity:1,roughness:.35,metalness:.1}));o.name=name;o.position.set(x,y,z);g.add(o);
};

// Kit roof() uses wall half-depth for the original gable triangle while the
// slabs use depth+overhang. Fill only the resulting triangular edge wedges;
// leave the parent-owned kit untouched. These are architectural closures.
function sealGableEdges(g:THREE.Group,n:string,w:number,d:number,e:number,r:number,o:number,x=0,z=0){
 const lift=r*o/(d/2+o);
 for(const end of [-1,1])for(const side of [-1,1]){
  const s=new THREE.Shape();s.moveTo(0,r);s.lineTo(side*d/2,0);s.lineTo(side*d/2,lift);s.closePath();
  const m=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.15,bevelEnabled:false}),M.lime);
  m.name=`${n}_gable_closure_${end}_${side}`;m.rotation.y=Math.PI/2;m.position.set(x+end*w/2-.075,e,z);g.add(m);
 }
}

const g=new THREE.Group();

const W=5,D=4.5,H=2.6,FY=.2;
// Existing 5 x 4.5 room plate and exact finished floor level, never enlarged.
archBox(g,'floor',W,.4,D,0,0,0,M.wood);
// B18 hangs at y2.22 on the center panel: a new west-side door avoids a
// false 2.2m headroom claim underneath it. Clear x[-2.29,-.84], y[.2,2.55].
const doorX=-1.565,opening={x:doorX,w:1.63,bottom:0,h:2.35};
wall(g,'front',W,2.85,.2,0,FY,2.15,0,[opening,{x:1.5,w:1.05,bottom:1.64,h:.8}]);
wall(g,'north',W,2.85,.2,0,FY,-2.15,0,[{x:-1.65,w:.7,bottom:1.12,h:1.05},{x:1.65,w:.7,bottom:1.12,h:1.05}]);
wall(g,'west',4.1,2.85,.2,-2.4,FY,0,Math.PI/2,[{x:-.75,w:1,bottom:1.05,h:1.25}]);
wall(g,'east',4.1,2.85,.2,2.4,FY,0,Math.PI/2,[{x:1,w:.95,bottom:1.05,h:1.25}]);
// Lime panels have real apertures and deep timber reveals, not fake pasted panes.
window(g,'front_workroom',1.5,2.24,2.23,1.05,.8);
window(g,'north_left',-1.65,1.845,-2.25,.7,1.05,Math.PI);
window(g,'north_right',1.65,1.845,-2.25,.7,1.05,Math.PI);
window(g,'west_daylight',-2.5,1.875,.75,1,1.25,-Math.PI/2,false);
window(g,'east_daylight',2.5,1.875,-1,.95,1.25,Math.PI/2,false);
wall(g,'front_footing',5.12,.28,.27,0,.2,2.125,0,[{...opening,h:.28}],M.stone);
archBox(g,'north_footing',5.12,.28,.27,0,.34,-2.125,M.stone);
for(const s of [-1,1])archBox(g,`side_footing_${s}`,.27,.28,4.18,s*2.435,.34,0,M.stone);
for(const x of [-2.4,-.745,.85,2.4])archBox(g,`front_post_${x}`,.15,2.85,.17,x,1.625,2.165);
for(const x of [-2.4,0,2.4])archBox(g,`north_post_${x}`,.16,2.85,.18,x,1.625,-2.22);
for(const s of [-1,1])for(const z of [-2.12,-.15,2.12])archBox(g,`side_post_${s}_${z}`,.17,2.85,.15,s*2.445,1.625,z);
for(const z of [-2.18,2.16])archBox(g,`wallplate_${z}`,5.04,.20,.20,0,2.99,z);
for(const s of [-1,1])archBox(g,`flank_plate_${s}`,.20,.20,4.3,s*2.43,2.99,0);
// Tall framed portal; the frame lives behind the existing plaque front face.
for(const x of [-2.335,-.795])archBox(g,`portal_jamb_${x}`,.09,2.35,.22,x,1.375,2.14,M.wood);
archBox(g,'portal_lintel',1.63,.20,.22,doorX,2.65,2.14,M.wood);
archBox(g,'threshold',1.45,.20,.35,doorX,.10,2.40,M.stone);
// Exact flush mounting surface for unchanged b18 at [0,2.22,2.2825].
archBox(g,'b18_mount_backing',1.68,.52,.16,0,2.45,2.17,M.wood);
// Main slate roof stays within old X/Z bounds. Front west cross-gable is a
// full steep roof volume reaching the front wall, not the old tiny flat dormer.
roof(g,'main',5,4.5,3.05,1.65,0,0,.30);
const cross=new THREE.Group();
roof(cross,'cross',2.10,2.36,3.10,1.60,0,0,.20);
// Local +X end becomes front +Z after -PI/2 rotation. Replace its filled
// gable with a true window aperture; back gable is buried in the main roof.
for(const o of [...cross.children])if(o.name.includes('_gable_'))cross.remove(o);
transfer(cross,g,-1.26,0,1.25,-Math.PI/2);
const frontGable=new THREE.Shape();frontGable.moveTo(-1.18,3.10);frontGable.lineTo(1.18,3.10);frontGable.lineTo(1.18,3.10+1.60*.2/1.38);frontGable.lineTo(0,4.70);frontGable.lineTo(-1.18,3.10+1.60*.2/1.38);frontGable.closePath();
const hole=new THREE.Path();hole.moveTo(-.27,3.37);hole.lineTo(-.27,4.03);hole.lineTo(.27,4.03);hole.lineTo(.27,3.37);hole.closePath();frontGable.holes.push(hole);
const gf=new THREE.Mesh(new THREE.ExtrudeGeometry(frontGable,{depth:.14,bevelEnabled:false}),M.lime);gf.name='cross_front_aperture';gf.position.set(-1.26,0,2.10);g.add(gf);
window(g,'cross_attic',-1.26,3.70,2.25,.54,.66);
archBox(g,'cross_tie',2.40,.16,.18,-1.26,3.13,2.20);
beam(g,'cross_king',[-1.26,4.10,2.23],[-1.26,4.70,2.23],.10,.10);
for(const side of [-1,1]){
 const endX=-1.26+side*1.38,endZ=(1.6/1.38)/(1.65/2.55)*1.38;
 beam(g,`cross_valley_${side}`,[-1.26,4.82,.03],[endX,3.22,endZ],.075,.035,M.iron);
}
// Shoulder bracing avoids all real panes and the reserved rider footprint.
beam(g,'front_right_brace',[.91,2.81,2.24],[1.32,2.98,2.24],.10,.10);
for(const side of [-1,1])for(const z of [-1.85,1.75])beam(g,`flank_brace_${side}_${z}`,[side*2.49,2.72,z],[side*2.49,2.98,z+.25],.09,.09);
chimney(g,'hearth_stack',-1.95,-.55,2.2,5.20);
// Existing lamp role re-mounted to the central pier, away from the new door.
archBox(g,'lantern_mount',.14,.22,.08,.63,2.00,2.26,M.iron);
beam(g,'lantern_arm',[.63,2.10,2.28],[.63,2.10,2.52],.045,.045,M.iron);
archBox(g,'lantern_hood',.24,.08,.24,.63,2.04,2.52,M.iron);
glow(g,'lamp',.63,1.90,2.52);

sealGableEdges(g,'main',5,4.5,3.05,1.65,.30);

// COPIED ROOM PROGRAM from assets/mkv3-ring.ts (geometry/positions retained).
    // interior: hearth W, table E, bed N wall
    // Equivalent open hearth within the original solid-block envelope. The
    // copied fire core is no longer completely occluded by a wooden box.
    archBox(g,'hearth_back',.12,1.05,1.3,-2.29,FY+.52,-.5,M.stone);
    archBox(g,'hearth_base',.5,.10,1.3,-2.1,.245,-.5,M.stone);
    archBox(g,'hearth_header',.5,.15,1.3,-2.1,1.17,-.5,M.stone);
    for(const z of [-1.08,.08])archBox(g,`hearth_jamb_${z}`,.5,.80,.14,-2.1,.695,z,M.stone);
    fireMesh(g, "fire", -(W / 2 - 0.45), FY + 0.6, -0.5, 0.2);
    texBox(g, "table", 1.0, 0.08, 0.7, W / 2 - 0.75, FY + 0.8, 0.8, timberTex);
    texBox(g, "tleg", 0.08, 0.66, 0.08, W / 2 - 0.75, FY + 0.4, 0.8, timberTex);
    texBox(g, "bed", 1.9, 0.24, 0.95, 0.2, FY + 0.12, -(D / 2 - 0.65), timberTex);
    // interior-8: the weaver's bed gains a mattress, pillow, and one folded
    // blanket whose three brass rule-lines carry Two Histories into cloth.
    // The whole ensemble stays on the north wall, outside the door lane.
    box(g, "wbed_mat", 1.75, 0.1, 0.84, 0.2, FY + 0.29, -(D / 2 - 0.65), ACCENTS.MATTRESS);
    box(g, "wbed_pillow", 0.42, 0.12, 0.5, -0.42, FY + 0.4, -(D / 2 - 0.65), C.BONE);
    box(g, "wbed_blanket", 0.78, 0.06, 0.78, 0.55, FY + 0.38, -(D / 2 - 0.65), ACCENTS.PLUM);
    for (const [ri, rz] of [[0, -1.84], [1, -1.6], [2, -1.36]] as const)
        box(g, `wbed_rule_${ri}`, 0.68, 0.018, 0.028, 0.55, FY + 0.42, rz, C.BRASS);
    // ---- the weaver's corner (S wall, W of the door lane |x|>0.8) ----
    // LOOM: two uprights + warp beam + heddle bar + cloth on the beam
    texBox(g, "loomA", 0.08, 1.5, 0.08, 1.3, FY + 0.75, D / 2 - 0.45, timberTex);
    texBox(g, "loomB", 0.08, 1.5, 0.08, 2.15, FY + 0.75, D / 2 - 0.45, timberTex);
    texBox(g, "warpbeam", 0.95, 0.09, 0.09, 1.72, FY + 1.42, D / 2 - 0.45, timberTex);
    box(g, "heddle", 0.85, 0.06, 0.06, 1.72, FY + 0.85, D / 2 - 0.45, C.BONE);
    box(g, "cloth", 0.8, 0.5, 0.04, 1.72, FY + 0.55, D / 2 - 0.52, 0xdcdcba);
    // thread basket beside the loom
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.2, 8), mat(0xa09832, 0.9, 0));
    basket.name = "tbasket";
    basket.position.set(0.95, FY + 0.1, D / 2 - 0.5);
    g.add(basket);
    for (const [ti2, tz2] of [[0, -0.05], [1, 0.04]] as const) {
        const thread = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.018, 5, 10), mat(ti2 ? 0xa06c32 : 0x4e5c6a, 0.8, 0));
        thread.name = `thread_${ti2}`;
        thread.rotation.x = Math.PI / 2;
        thread.position.set(0.95, FY + 0.22, D / 2 - 0.5 + tz2);
        g.add(thread);
    }
    // linen chest at the bed's foot
    texBox(g, "lchest", 0.55, 0.38, 0.8, 1.35, FY + 0.19, -(D / 2 - 0.65), timberTex);
    // dye-jar shelf on the E wall (3 colored jars)
    texBox(g, "dshelf", 0.05, 0.06, 0.9, W / 2 - 0.08, FY + 1.3, 0, timberTex);
    for (const [di, dz] of [[0, -0.28], [1, 0], [2, 0.28]] as const) {
        const dye = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.16, 7), mat(di === 0 ? 0xa06c32 : di === 1 ? 0x4c7266 : 0x7c6088, 0.6, 0));
        dye.name = `dye_${di}`;
        dye.position.set(W / 2 - 0.14, FY + 1.41, dz);
        g.add(dye);
    }
    // herb bundles hanging from the rafters (2, over the hearth end)
    for (const [hi2, hx2] of [[0, -1.4], [1, -0.8]] as const) {
        const bundle = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 6), mat(0x64844a, 0.95, 0));
        bundle.name = `herb_${hi2}`;
        bundle.rotation.x = Math.PI;
        bundle.position.set(hx2, FY + H - 0.16, -1.3);
        g.add(bundle);
    }
    glow(g, "flame", W / 2 - 0.75, FY + 0.94, 0.8, 0xffc98a, 0.045);
        // ---- TIE BEAMS (loop #94): the beam language reaches the cottages ----
    for (const [bi, bz] of [[0, -1.4], [1, 1.4]] as const) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.13, 0.15), timberTex);
        beam.name = `tiebeam_${bi}`;
        beam.position.set(0, FY + H + 0.05, bz);
        g.add(beam);
    }

finish(g,'nx-town-row-cottage');
