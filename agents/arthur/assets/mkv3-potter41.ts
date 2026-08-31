// mkv3-potter41.ts — new-era loop 41: THE POTTER'S STAND. Beside the kiln
// (shared fire): a kick-wheel (flywheel + low table head), a water bucket,
// a clay stock (wedge under damp cloth), a drying rack w/ 3 green pots,
// and finished ware stacked. Where the village's jars, bowls, and bottles
// come from.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, ACCENTS, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const CLAY = 0xbaae60;
const WARE = 0xdada70;

// tex-29 TIMBER X: the potter's stand joins the timber family — the
// kick-wheel flywheel, the drying-rack bar, and the water bucket take the
// village timber tile (the wheel the potter kicks and the rack her ware
// dries on are the village's wood). Clay, thrown pots, fired ware, and
// the damp cloth stay flat — clay is clay, ware is fired, cloth is cloth
// (material truth; the potter works BETWEEN wood and clay).
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });

// ---- KICK WHEEL: heavy flywheel + head on a post ----
// Wakeup-46: flywheel + head + the pot mid-throw ride a `pwheel` anchor
// group (KEEP pwheel — tight, so post/bucket/clay statics still merge) —
// the wheel turns, slow, mid-throw.
const pwGrp = new THREE.Group();
pwGrp.name = "pwheel";
const fly = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.09, 12), timberTex);
fly.name = "pw_flywheel";
fly.position.set(0, 0.28, 0);
pwGrp.add(fly);
g.add(pwGrp);
// tex-65: the stand's remaining woodwork joins — kick-wheel post, the
// wheel head, and both drying-rack posts take the timber (sawn posts
// and a wooden wheel head; the rack bar already carries it). Clay,
// thrown pots, ware, and cloth stay flat (the potter works BETWEEN
// wood and clay — tex-29's law).
const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
};
texBox("pw_post", 0.09, 0.55, 0.09, 0, 0.55, 0, timberTex);
const head = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), timberTex);
head.name = "pw_head";
head.position.set(0, 0.85, 0);
pwGrp.add(head);
// a pot mid-throw on the head
const throwing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.12, 8), mat(CLAY, 0.95, 0));
throwing.name = "pw_throwing";
throwing.position.set(0, 0.93, 0);
pwGrp.add(throwing);
// ---- WATER BUCKET ----
const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.26, 8), timberTex);
bucket.name = "pw_bucket";
bucket.position.set(-0.75, 0.13, 0.35);
g.add(bucket);
// ---- CLAY STOCK: wedge under a damp cloth ----
const wedge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.35), mat(CLAY, 0.95, 0));
wedge.name = "pw_clay";
wedge.rotation.y = 0.4;
wedge.position.set(0.95, 0.15, 0.4);
g.add(wedge);
const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 0.42), mat(0xe4e4c2, 0.9, 0));
cloth.name = "pw_cloth";
cloth.rotation.y = 0.4;
cloth.position.set(0.95, 0.33, 0.4);
g.add(cloth);
// ---- DRYING RACK: 2 bars on posts, 3 green pots ----
for (const rx of [-0.9, 0.6]) {
    texBox(`pw_rpost_${rx}`, 0.06, 0.9, 0.06, rx, 0.45, -0.9, timberTex);
}
// rackbar on village timber (tex-29)
{
    const rb = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 0.05), timberTex);
    rb.name = "pw_rackbar";
    rb.position.set(-0.15, 0.88, -0.9);
    g.add(rb);
}
for (const [pi2, px2] of [[0, -0.5], [1, -0.1], [2, 0.35]] as const) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.11, 8), mat(CLAY, 0.95, 0));
    pot.name = `pw_greenpot_${pi2}`;
    pot.position.set(px2, 0.96, -0.9);
    g.add(pot);
}
// ---- FINISHED WARE: stack of fired pots ----
const stack1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.24, 8), mat(WARE, 0.9, 0));
stack1.name = "pw_ware1";
stack1.position.set(-1.1, 0.12, -0.3);
g.add(stack1);
const stack2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.2, 8), mat(WARE, 0.9, 0));
stack2.name = "pw_ware2";
stack2.position.set(-1.1, 0.36, -0.3);
g.add(stack2);
const jug = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat(WARE, 0.9, 0));
jug.name = "pw_jug";
jug.scale.set(1, 1.2, 1);
jug.position.set(1.6, 0.13, -0.7);
g.add(jug);
// jug neck
const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 6), mat(WARE, 0.9, 0));
neck.name = "pw_jugneck";
neck.position.set(1.6, 0.28, -0.7);
g.add(neck);

// interior-5: a compact two-tier finished-ware shelf occupies the back-right
// edge, inside the inherited bbox; the entire +Z work apron stays untouched.
for (const [si, sy] of [[0, 0.45], [1, 0.75]] as const)
    texBox(`pw_wareshelf_${si}`, 0.8, 0.06, 0.18, 1.25, sy, -0.86, timberTex);
for (const sx of [0.88, 1.62])
    texBox(`pw_wareshelf_post_${sx}`, 0.05, 0.72, 0.08, sx, 0.36, -0.86, timberTex);
for (const [wi, wx, wy] of [[0, 1.05, 0.54], [1, 1.42, 0.54], [2, 1.22, 0.84]] as const) {
    const ware = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.065, 0.16, 8), mat(WARE, 0.9, 0));
    ware.name = `pw_shelfware_${wi}`;
    ware.position.set(wx, wy, -0.86);
    g.add(ware);
}

// interior-15 (P2-6): THE GLAZE BENCH — the potter's color work. A low bench
// in the back-left edge gap (between the ware stack and the drying rack):
// three glaze cups in the proven palette rhythm (plum / sage / water-blue,
// the village's accepted accent colors) on the top, an unfired row of two
// bare-clay bowls waiting below, and a stirring stick. Bench top 0.5 —
// seated-work height; everything behind the wheel line, +Z apron untouched.
{
    texBox("gz_top", 0.75, 0.04, 0.3, -1.35, 0.5, -0.85, timberTex);
    for (const lx of [-1.68, -1.02])
        texBox("gz_leg", 0.05, 0.48, 0.26, lx, 0.24, -0.85, timberTex);
    // glaze cups: small open bowls of the three palette colors
    const glazeColors = [ACCENTS.PLUM, ACCENTS.SAGE, 0x506a78] as const;
    for (const [ci, cx] of [[0, -1.52], [1, -1.35, ], [2, -1.18] as const] as const) {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.05, 8), mat(glazeColors[ci], 0.85, 0));
        cup.name = `gz_cup_${ci}`;
        cup.position.set(cx, 0.55, -0.85);
        g.add(cup);
    }
    // unfired row: two bare-clay bowls on the lower shelf line
    for (const [ui, ux] of [[0, -1.5], [1, -1.24]] as const) {
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.06, 8), mat(CLAY, 0.95, 0));
        bowl.name = `gz_unfired_${ui}`;
        bowl.position.set(ux, 0.29, -0.85);
        g.add(bowl);
    }
    // stirring stick across the top edge
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), timberTex);
    stick.name = "gz_stick";
    stick.rotation.z = Math.PI / 2;
    stick.position.set(-1.35, 0.545, -0.74);
    g.add(stick);
}

mergeByMaterial(g, "pt3");
writeFileSync("agents/arthur/assets/village_potter3.glb", toGLB(g));
console.log("village_potter3.glb —", g.children.length, "nodes");
