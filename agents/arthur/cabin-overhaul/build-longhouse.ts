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

const W=8.5,D=5,H=2.6,FY=.2;
archBox(g,'floor',W,.4,D,0,0,0,M.wood);
const door={x:0,w:1.92,bottom:0,h:2.4};
wall(g,'front',W,2.85,.2,0,FY,2.4,0,[door,{x:-2.9,w:1.18,bottom:1.15,h:1.25},{x:2.9,w:1.18,bottom:1.15,h:1.25}]);
wall(g,'north',W,2.85,.2,0,FY,-2.4,0,[{x:-2.4,w:1.2,bottom:1.15,h:1.25},{x:2.4,w:1.2,bottom:1.15,h:1.25}]);
wall(g,'west',4.6,2.85,.2,-4.15,FY,0,Math.PI/2,[{x:1.45,w:.82,bottom:1.1,h:1.22},{x:-1.45,w:.82,bottom:1.1,h:1.22}]);
wall(g,'east',4.6,2.85,.2,4.15,FY,0,Math.PI/2,[{x:0,w:1.05,bottom:1.3,h:1.05}]);
for(const x of [-2.9,2.9])window(g,`front_window_${x}`,x,1.975,2.49,1.18,1.25);
for(const x of [-2.4,2.4])window(g,`north_window_${x}`,x,1.975,-2.5,1.2,1.25,Math.PI,false);
for(const z of [-1.45,1.45])window(g,`west_window_${z}`,-4.25,1.91,z,.82,1.22,-Math.PI/2);
window(g,'east_window',4.25,2.025,0,1.05,1.05,Math.PI/2,false);
wall(g,'front_footing',8.62,.30,.29,0,.2,2.37,0,[{...door,h:.3}],M.stone);
archBox(g,'north_footing',8.62,.30,.29,0,.35,-2.37,M.stone);
for(const s of [-1,1])archBox(g,`side_footing_${s}`,.29,.30,4.65,s*4.12,.35,0,M.stone);
for(const z of [-2.41,2.41]){
 for(const x of [-4.15,-3.75,-1.72,1.72,3.75,4.15])archBox(g,`post_${x}_${z}`,.17,2.85,.18,x,1.625,z);
 archBox(g,`wallplate_${z}`,8.5,.2,.2,0,2.98,z);
}
for(const s of [-1,1])for(const z of [-2.3,-.65,.65,2.3])archBox(g,`endpost_${s}_${z}`,.18,2.85,.16,s*4.20,1.625,z);
for(const x of [-.9,.9])archBox(g,`door_jamb_${x}`,.12,2.4,.26,x,1.4,2.41,M.wood);
archBox(g,'door_lintel',2.12,.20,.28,0,2.7,2.42,M.wood);
// One room step only; grade-level porch is intentional so b19's y2.22
// underside remains above the required 2.2m clear approach volume.
archBox(g,'porch_deck',5.85,.20,1.76,0,-.10,3.38,M.stone);
archBox(g,'room_threshold',1.68,.20,.24,0,.10,2.55,M.stone);
for(const x of [-2.73,-1.78,1.78,2.73]){
 archBox(g,`porch_pier_${x}`,.29,.34,.29,x,.02,4.12,M.stone);
 archBox(g,`porch_post_${x}`,.19,2.71,.19,x,1.455,4.12);
 beam(g,`porch_knee_${x}`,[x,2.31,4.12],[x+(x<0?.35:-.35),2.76,4.12],.11,.11);
}
// Full breadth lower pitched slate roof: an inhabited gallery, not a token
// 1.4m flat awning. Its outermost member stops short of old z=4.301.
roof(g,'porch_roof',5.68,1.55,2.80,.65,0,3.34,.08);
archBox(g,'porch_front_plate',5.72,.20,.16,0,2.80,4.16);
archBox(g,'b19_mount_fascia',3.34,.545,.15,0,2.4775,4.2125,M.wood);
// Exactly z=4.2875 exposed front; art behind face must remain untouched.
for(const x of [-2.30,2.30]){
 archBox(g,`porch_bench_${x}`, .72,.10,.50,x,.51,3.28,M.wood);
 for(const z of [3.12,3.44])archBox(g,`porch_bench_leg_${x}_${z}`,.54,.47,.10,x,.235,z,M.wood);
}
roof(g,'main',8.5,5,3.05,2.05,0,0,.32);
// End gable trusses and a tall hearth-aligned masonry stack give the hall
// a readable civic domestic silhouette from both flanks.
for(const s of [-1,1]){
 beam(g,`gable_tie_${s}`,[s*4.30,3.11,-2.46],[s*4.30,3.11,2.46],.15,.15);
 beam(g,`kingpost_${s}`,[s*4.30,3.14,0],[s*4.30,5.10,0],.13,.13);
 for(const z of [-1,1])beam(g,`gable_fan_${s}_${z}`,[s*4.30,3.17,z*1.85],[s*4.30,4.35,0],.12,.12);
}
chimney(g,'hearth_stack',-3.72,0,1.15,5.70);
// Long horizontal bays use corner knees instead of ornamental cross-hatching.
for(const x of [-3.75,-1.72,1.72,3.75])for(const z of [-2.48,2.48])beam(g,`wall_knee_${x}_${z}`,[x,2.66,z],[x+(x<0?.24:-.24),2.97,z],.10,.10);

sealGableEdges(g,'main',8.5,5,3.05,2.05,.32);
sealGableEdges(g,'porch',5.68,1.55,2.80,.65,.08,0,3.34);

// COPIED ROOM PROGRAM from assets/mkv3-ring.ts (geometry/positions retained).
    // interior: hearth W end, two trestle tables along the walls (lane center clear)
    // Same hearth footprint and fire anchor, but a real open stone surround
    // replaces the opaque timber block that previously hid the entire core.
    archBox(g,'hearth_back',.12,1.1,1.6,-3.99,.75,0,M.stone);
    archBox(g,'hearth_base',.6,.10,1.6,-3.75,.25,0,M.stone);
    archBox(g,'hearth_header',.6,.15,1.6,-3.75,1.225,0,M.stone);
    for(const z of [-.73,.73])archBox(g,`hearth_jamb_${z}`,.6,.85,.14,-3.75,.725,z,M.stone);
    fireMesh(g, "fire", -(W / 2 - 0.55), FY + 0.62, 0);
    texBox(g, "mantel", 0.8, 0.12, 1.9, -(W / 2 - 0.3), FY + 1.3, 0, timberTex);
    for (const tx of [-1.4, 1.4]) {
        texBox(g, `table_${tx}`, 2.0, 0.09, 0.7, tx, FY + 0.84, -(D / 2 - 0.6), timberTex);
        texBox(g, `tlegs_${tx}`, 1.7, 0.7, 0.1, tx, FY + 0.42, -(D / 2 - 0.6), timberTex);
    }
    texBox(g, "bench_n", 2.4, 0.07, 0.3, 0, FY + 0.5, -(D / 2 - 1.05), timberTex);
    // bed alcove E end + THE HIGH SEAT: carved chair on a dais (the hall's
    // place of honor, where the village elder sits at feasts)
    texBox(g, "bed", 1.0, 0.24, 1.9, W / 2 - 0.8, FY + 0.12, -1.2, timberTex);
    texBox(g, "dais", 1.5, 0.18, 1.6, W / 2 - 0.95, FY + 0.09, 1.3, stoneTex);
    texBox(g, "hseat", 0.55, 0.5, 0.5, W / 2 - 0.75, FY + 0.43, 1.3, timberTex);
    texBox(g, "hseat_back", 0.55, 0.9, 0.08, W / 2 - 0.75, FY + 0.9, 1.05, timberTex);
    texBox(g, "hseat_arm_l", 0.08, 0.22, 0.45, W / 2 - 1.0, FY + 0.56, 1.3, timberTex);
    texBox(g, "hseat_arm_r", 0.08, 0.22, 0.45, W / 2 - 0.5, FY + 0.56, 1.3, timberTex);
    // interior-13 (P2-4): THE FEAST KIT on the high seat — the elder's place
    // set for a feast night: a carved serving board with a round of cheese,
    // an ale horn row (three horns, alternating brass/bone mounts) rising
    // from one table line along the seat back rail, and one brass-feet
    // platter. Counts live exactly on/above the existing seat volume
    // (x∈[3.35,3.95], z∈[1.05,1.55]) — the dais, chair, and door lane
    // stay untouched; nothing new reaches the floor.
    {
        // serving board across the seat front edge w/ cheese round
        texBox(g, "feastboard", 0.5, 0.03, 0.3, W / 2 - 0.75, FY + 0.69, 1.42, timberTex);
        const cheese = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 9), mat(0xd8c278, 0.9, 0));
        cheese.name = "feastcheese";
        cheese.position.set(W / 2 - 0.82, FY + 0.73, 1.44);
        g.add(cheese);
        // platter w/ brass feet on the seat, beside the board
        const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.03, 9), mat(0xa0a248, 0.4, 0.55));
        platter.name = "feastplatter";
        platter.position.set(W / 2 - 0.6, FY + 0.7, 1.2);
        g.add(platter);
        // ale horn row: three horns on the back-rail line, alternating mounts
        for (const [ki, kx, mount] of [[0, W / 2 - 0.95, 0xa0a248], [1, W / 2 - 0.75, C.BONE], [2, W / 2 - 0.55, 0xa0a248]] as const) {
            const horn = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.26, 7), mat(0x8a6a3a, 0.75, 0.1));
            horn.name = `alehorn_${ki}`;
            horn.rotation.z = Math.PI;
            horn.position.set(kx, FY + 1.06, 1.09);
            g.add(horn);
            box(g, `hornmount_${ki}`, 0.05, 0.05, 0.05, kx, FY + 0.94, 1.09, mount);
        }
    }
    // interior-3: two communal sleeping benches flank the front door and face
    // the hearth. Their inner edges stop at local x ±1.2, leaving the full
    // 1.4m door lane and its turn toward the fire untouched.
    for (const [si, sx] of [[0, -2.1], [1, 2.1]] as const) {
        furnitureBench(g, `sleepbench_${si}`, sx, FY, 1.82, 1.8, timberTex);
        box(g, `sleepmat_${si}`, 1.65, 0.1, 0.52, sx, FY + 0.79, 1.82, ACCENTS.MATTRESS);
        box(g, `sleeppillow_${si}`, 0.38, 0.12, 0.42, sx + (si ? 0.48 : -0.48), FY + 0.9, 1.82, C.BONE);
        box(g, `sleepblanket_${si}`, 0.62, 0.06, 0.48, sx + (si ? -0.34 : 0.34), FY + 0.87, 1.82, si ? ACCENTS.PLUM : ACCENTS.SAGE);
    }
    // firewood stacked by the hearth (6 split logs, ends facing in)
    for (let fw = 0; fw < 6; fw++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 6), mat(0x6c5426, 0.95, 0));
        log.name = `fwood_${fw}`;
        log.rotation.z = Math.PI / 2;
        log.position.set(-(W / 2 - 0.35), FY + 0.07 + Math.floor(fw / 3) * 0.14, -1.5 + (fw % 3) * 0.16);
        g.add(log);
    }
    // herbs hanging from the rafters (3 bundles over the hearth end)
    // ---- TIE BEAMS (loop #91): oak beams crossing wall-to-wall under the
    // ridge — the visible roof structure a real longhouse reads from
    // inside, and what the herb bundles actually hang from ----
    for (const [bi2, bz2] of [[0, -2.3], [1, 0], [2, 2.3]] as const) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.14, 0.16), timberTex);
        beam.name = `tiebeam_${bi2}`;
        beam.position.set(0, FY + H + 0.05, bz2);
        g.add(beam);
    }
    for (const [hi, hz] of [[0, -2.3], [1, 0], [2, 2.3]] as const) {
        const bundle = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.34, 6), mat(0x64844a, 0.95, 0));
        bundle.name = `herb_${hi}`;
        bundle.rotation.x = Math.PI;
        // hang directly under the tie beams (loop #91 re-anchor)
        bundle.position.set(-(W / 2 - 1.3), FY + H - 0.12, hz);
        g.add(bundle);
    }
    glow(g, "flame", W / 2 - 0.5, FY + 1.0, 1.5);
    texBox(g, "cstand", 0.3, 0.05, 0.3, W / 2 - 0.5, FY + 0.6, 1.5, timberTex);
    archBox(g,'porch_lantern_plate',.14,.25,.08,1.8,2.46,2.51,M.iron);
    beam(g,'porch_lantern_arm',[1.8,2.54,2.54],[1.8,2.54,2.85],.04,.04,M.iron);
    archBox(g,'porch_lantern_hood',.23,.07,.23,1.8,2.47,2.85,M.iron);
    glow(g, "lamp", 1.8, FY + 2.15, D / 2 + 0.35);
    // ---- PROVISIONS CHESTS (new-era loop 22): the communal hall's shared
    // storage — a row of 3 iron-banded chests along the back (N) wall,
    // clear of the center aisle
    for (const [ci, cx] of [[0, -1.6], [1, -0.4], [2, 0.8]] as const) {
        texBox(g, `pchest_${ci}`, 0.95, 0.5, 0.55, cx, FY + 0.25, -(D / 2 - 0.42), timberTex);
        texBox(g, `pchestlid_${ci}`, 1.0, 0.1, 0.6, cx, FY + 0.55, -(D / 2 - 0.42), timberTex);
        texBox(g, `pchestband_${ci}`, 0.97, 0.52, 0.06, cx, FY + 0.26, -(D / 2 - 0.42), ironTex);
    }

finish(g,'nx-town-longhouse');
