// mkv3-dyehouse70.ts — new-era loop 70: THE DYE HOUSE. Behind the weaver's
// row cottage: a small open shelter (posts + slanted roof) with 3 dye vats
// (blue from flax flowers, red madder, yellow weld — each tinted liquid),
// a stirring pole, and 2 hung cloth strips drying (one dyed blue, one
// still bone-white waiting). Cloth chain final step.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const WOOD = 0x7c6832, WOOD_DK = 0x6a6030;

// tex-51 TIMBER XXII: the dye house's woodwork joins the village
// families — posts, roof slab, wind boards, stirring pole, and vat
// tubs take the timber (built wood — the shed and its vats read on
// the same boards as the fences and racks; byte-identical to
// wallSpan's), and the vat bands take the forge iron (hoops are
// smithed — the barrel law). The dyed liquids stay flat (liquids are
// liquids — the pond law), and the rope stays rope. The cloth strips
// already carry their weave tiles (tex-8).
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};

// ---- SHELTER: 4 posts + slanted roof (open work shed) ----
for (const [px, pz] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]] as const) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.9, 0.09), timberTex);
    post.name = `dh_post_${px}_${pz}`;
    post.position.set(px, 0.95, pz);
    g.add(post);
}
// slanted roof: one slab tilted
const roof = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 2.2), timberTex);
roof.rotation.x = -0.12;
roof.position.set(0, 1.98, 0.05);
g.add(roof);
// low back wall boards (wind break behind the vats)
for (let wb = 0; wb < 4; wb++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.0, 0.05), timberTex);
    board.name = `dh_wall_${wb}`;
    board.position.set(-0.85 + wb * 0.57, 0.5, -0.82);
    g.add(board);
}

// ---- 3 DYE VATS (in a row) + fire sockets under each ----
const vatColor = (i: number) => i === 0 ? 0x324a68 : i === 1 ? 0x7e4426 : 0x6c7e22; // blue/red/yellow
for (let i = 0; i < 3; i++) {
    const x = -0.9 + i * 0.9;
    // vat: wide low tub
    const vat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.4, 10), timberTex);
    vat.position.set(x, 0.2, 0);
    g.add(vat);
    // dyed liquid surface (tinted! stays flat — liquids are liquids)
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 10), mat(vatColor(i), 0.35, 0.5));
    liq.position.set(x, 0.41, 0);
    g.add(liq);
    // iron band
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.012, 4, 12), ironTex);
    band.rotation.x = Math.PI / 2;
    band.position.set(x, 0.3, 0);
    g.add(band);
}

// ---- STIRRING POLE leaning on a post ----
const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 5), timberTex);
pole.rotation.z = 0.3;
pole.position.set(1.55, 0.7, 0.5);
g.add(pole);

// ---- DRYING LINE: rope between 2 posts + cloth strips ----
const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.4, 4), mat(0xa09832, 0.9, 0));
rope.rotation.z = Math.PI / 2;
rope.position.set(0, 1.7, 0.75);
g.add(rope);
// hung strips: one dyed blue (done), one bone (waiting), each folded over the line
// tex-8: dye-trade weaves (same family as the laundry line's flax-blue)
// Wakeup-23: each strip wraps in a dh_strip_${tag} anchor group (KEEP
// dh_strip) so wind comps have real targets — the dye house joins the
// laundry and the market in one wind.
const stripGrpB = new THREE.Group();
stripGrpB.name = "dh_strip_blue";
const stripBlue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.02), texMat("weave-blue", [0x526a96, 0x4a628c], { rough: 0.8, scale: 3, stripe: 24, weights: [2, 1], seed: 4400 }));
stripBlue.position.set(-0.45, 1.42, 0.75);
stripBlue.rotation.y = 0.08;
stripGrpB.add(stripBlue);
g.add(stripGrpB);
const stripGrpW = new THREE.Group();
stripGrpW.name = "dh_strip_bone";
const stripWhite = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.02), texMat("weave-bone2", [0xe4e4c2, 0xdadab4], { rough: 0.85, scale: 3, stripe: 24, weights: [2, 1], seed: 4800 }));
stripWhite.position.set(0.55, 1.42, 0.75);
stripWhite.rotation.y = -0.06;
stripGrpW.add(stripWhite);
g.add(stripGrpW);

// interior-17 (P2 next-wave): THE DYER'S BATCH BOARD + WORK LAMP — the
// dye-house life layer. A tally board mounted on the wind-break boards
// (dyer's batch ledger: one brass datum + five alternating brass/bone
// batch marks, the trade counting convention) and a warm lantern hung
// from the roof beside the drying line so evening dye work reads lit.
// Everything within the inherited AABB; the drying line and both
// dh_strip_* wind anchors stay untouched.
{
    texBox("dy_board", 0.7, 0.4, 0.03, 0.35, 0.85, -0.79, timberTex);
    box(g, "dy_board_datum", 0.5, 0.022, 0.012, 0.35, 0.98, -0.772, C.BRASS);
    for (const [bi, bx] of [[0, 0.17], [1, 0.29], [2, 0.41], [3, 0.53]] as const)
        box(g, `dy_board_mark_${bi}`, 0.028, bi % 2 ? 0.1 : 0.14, 0.012, bx, 0.9, -0.772, bi % 2 ? C.BONE : C.BRASS);
    // warm lantern hung from the roof over the vat row
    const glowGrp = new THREE.Group();
    glowGrp.name = "glow";
    const lant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.085, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
    lant.name = "lantern_core";
    lant.position.set(-1.2, 1.62, 0.1);
    glowGrp.add(lant);
    g.add(glowGrp);
}

mergeByMaterial(g, "dy3");
writeFileSync("agents/arthur/assets/village_dyehouse3.glb", toGLB(g));
console.log("village_dyehouse3.glb —", g.children.length, "top-level");
