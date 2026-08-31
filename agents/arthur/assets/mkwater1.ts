// mkwater1.ts — WATER & KINETIC PACK: tiered fountain (water particles),
// birdbath, wind chimes (slow spin), weathervane (rooster-arrow, faster spin).
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { writeFileSync } from "node:fs";

// ---- fountain: basin + pedestal + upper bowl (water comp on upper) ----
const fountain = new THREE.Group();
{
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.45, 14), mat(C.STONE, 0.95, 0));
    basin.name = "ft_basin";
    basin.position.y = 0.225;
    fountain.add(basin);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.08, 8, 16), mat(C.BONE, 0.7, 0.2));
    rim.name = "ft_rim";
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.46;
    fountain.add(rim);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.1, 10), mat(C.STONE, 0.95, 0));
    ped.name = "ft_pedestal";
    ped.position.y = 0.95;
    fountain.add(ped);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.5, 0.3, 12), mat(C.STONE, 0.95, 0));
    bowl.name = "ft_bowl";
    bowl.position.y = 1.65;
    fountain.add(bowl);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), mat(C.BRASS, 0.3, 0.85));
    finial.name = "ft_finial";
    finial.position.y = 2.42;
    fountain.add(finial);
    // spout (water particles target = entity origin [0,1.95,0]) — NOTE: the
    // engine ships no water particle preset (shared/particles.js: fire/sparks/
    // embers/smoke/dust/snow/magic/stars/muzzle only), so water is GEOMETRY,
    // same law as the bakery cistern (mkv3-bakery-cistern97.ts). Water faces:
    // basin pool + upper-bowl pool + central jet; finial rides the jet crown.
    const basinWater = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.38, 0.03, 14), mat(0x506a78, 0.25, 0.5));
    basinWater.name = "ft_basin_water";
    basinWater.position.y = 0.37;
    fountain.add(basinWater);
    const bowlWater = new THREE.Mesh(new THREE.CylinderGeometry(0.63, 0.63, 0.03, 12), mat(0x506a78, 0.25, 0.5));
    bowlWater.name = "ft_bowl_water";
    bowlWater.position.y = 1.79;
    fountain.add(bowlWater);
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.075, 0.52, 6), mat(0x506a78, 0.25, 0.5));
    jet.name = "ft_jet";
    jet.position.y = 2.1;
    fountain.add(jet);
}

// ---- birdbath: low basin on foot + visiting bird ----
const birdbath = new THREE.Group();
{
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.6, 8), mat(C.STONE, 0.95, 0));
    foot.name = "bb_foot";
    foot.position.y = 0.3;
    birdbath.add(foot);
    const bath = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.14, 10), mat(C.BONE, 0.8, 0.1));
    bath.name = "bb_bath";
    bath.position.y = 0.67;
    birdbath.add(bath);
    const bird = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), mat(0x787250, 0.9, 0));
    bird.name = "bb_bird";
    bird.scale.set(1.3, 1, 1);
    bird.position.set(0.12, 0.8, 0.05);
    birdbath.add(bird);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 5), mat(0xbaae62, 0.9, 0));
    beak.name = "bb_beak";
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.2, 0.8, 0.05);
    birdbath.add(beak);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.03), mat(0x787250, 0.9, 0));
    tail.name = "bb_tail";
    tail.position.set(0.02, 0.82, 0.05);
    tail.rotation.z = 0.4;
    birdbath.add(tail);
}

// ---- wind chimes: hook + disc + 7 tubes (slow sway via spin of whole) ----
const chimes = new THREE.Group();
{
    box(chimes, "wc_hook", 0.04, 0.12, 0.04, 0, 0, 0, C.DARK);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 10), mat(C.BRASS, 0.4, 0.8));
    top.name = "wc_top";
    top.position.y = -0.15;
    chimes.add(top);
    for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const len = 0.28 + (i % 3) * 0.09;
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, len, 6), mat(C.BRASS, 0.35, 0.85));
        tube.name = `wc_tube_${i}`;
        tube.position.set(Math.cos(a) * 0.1, -0.15 - len / 2 - 0.08, Math.sin(a) * 0.1);
        chimes.add(tube);
        const cord = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.08, 0.008), mat(C.BONE, 0.9, 0));
        cord.name = `wc_cord_${i}`;
        cord.position.set(Math.cos(a) * 0.1, -0.17, Math.sin(a) * 0.1);
        chimes.add(cord);
    }
    const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), mat(C.DARK, 0.6, 0.4));
    clapper.name = "wc_clapper";
    clapper.position.y = -0.42;
    chimes.add(clapper);
    const sailD = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.16), mat(C.BONE, 0.9, 0));
    sailD.name = "wc_sail";
    sailD.position.y = -0.58;
    chimes.add(sailD);
}

// ---- weathervane: post + compass + arrow + rooster silhouette ----
const vane = new THREE.Group();
{
    box(vane, "wv_post", 0.05, 0.9, 0.05, 0, 0.45, 0, C.DARK);
    const compass = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 8), mat(C.DARK, 0.7, 0.4));
    compass.name = "wv_compass";
    compass.position.y = 0.95;
    vane.add(compass);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 5), mat(C.BRASS, 0.35, 0.85));
    rod.name = "wv_rod";
    rod.position.y = 1.2;
    vane.add(rod);
    const arrow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.06), mat(C.BRASS, 0.35, 0.85));
    arrow.name = "wv_arrow";
    arrow.position.y = 1.28;
    vane.add(arrow);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 5), mat(C.BRASS, 0.35, 0.85));
    head.name = "wv_head";
    head.rotation.z = -Math.PI / 2;
    head.position.set(0.28, 1.28, 0);
    vane.add(head);
    // rooster silhouette (stylized boxes)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.05), mat(C.DARK, 0.6, 0.4));
    body.name = "wv_rooster_body";
    body.position.set(-0.06, 1.35, 0);
    vane.add(body);
    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.03), mat(C.DARK, 0.6, 0.4));
    tail2.name = "wv_rooster_tail";
    tail2.rotation.z = -0.6;
    tail2.position.set(-0.15, 1.4, 0);
    vane.add(tail2);
    const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.04), mat(C.DARK, 0.6, 0.4));
    head2.name = "wv_rooster_head";
    head2.position.set(0.02, 1.43, 0);
    vane.add(head2);
}

const OUT: Array<[string, THREE.Group]> = [
    ["village_fountain", fountain],
    ["village_birdbath", birdbath],
    ["village_chimes", chimes],
    ["village_weathervane", vane],
];
for (const [n, g] of OUT) writeFileSync(`agents/arthur/assets/${n}.glb`, toGLB(g));
console.log(OUT.map(([n, g]) => `${n}(${g.children.length})`).join(", "));
