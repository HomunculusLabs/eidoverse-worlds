// mkv3-bakery-cistern97.ts — new-era loop 97: THE BAKERY CISTERN. Water
// census: the bakery/court draws dough-water from the plaza well 25m+ away;
// nothing within 15m. Real bakeries keep a cistern by the door. A stone
// cistern at the court's E side: squat open box (4 stone slabs), water
// surface inside, a wooden lid LEANING against it, and a copper scoop
// hung on the rim peg. Rain-fed (matches the g-barrel language).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const STONE = 0x56503c, STONE_DK = 0x44402e, WATER = 0x303840;
const WOOD = 0x7c6832, COPPER = 0xb09242;

// tex-10 STONE III: the cistern's four slabs join the ashlar family —
// identical stoneMat params (cell law); alternating flat STONE/STONE_DK
// becomes a single mapped stone bucket (the two flats merge into one tile
// family — the tile's own tone variation replaces the slab alternation).
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// tex-55: the cistern's woodwork and scoop join the families — the
// leaning lid + its two battens + the rim peg take the timber (sawn
// boards, the fences/buckets law), and the copper scoop + handle take
// the forge iron (a smithed vessel — the forge's-own-bowl law; the
// tile's metalness reads it as metal). Water stays flat (the pond law).
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
// ---- CISTERN BOX: 4 stone slabs, open top ----
const W = 0.9, H = 0.62, D = 0.62, T = 0.08;
const slabs: Array<[number, number, number, number, number]> = [
    // [w, h, d, x, z] — four walls
    [W, H, T, 0, D / 2 - T / 2],
    [W, H, T, 0, -D / 2 + T / 2],
    [T, H, D - 2 * T, W / 2 - T / 2, 0],
    [T, H, D - 2 * T, -W / 2 + T / 2, 0],
];
slabs.forEach(([w, h, d, x, z], i) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stoneTex);
    s.name = `bc_slab_${i}`;
    s.position.set(x, H / 2, z);
    g.add(s);
});
// bottom slab
const bottom = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * T, 0.05, D - 2 * T), stoneTex);
bottom.name = "bc_bottom";
bottom.position.set(0, 0.03, 0);
g.add(bottom);
// water surface inside (below rim)
// polish-281: the cistern-dark water read as an empty black hole from above
// (the interior walls are near-black in shadow). Housekit water blue + faint
// same-hue emissive, matching the accepted fountain water (polish-271/274):
// the surface now reads as water, not a dry hole.
const water = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * T - 0.02, 0.02, D - 2 * T - 0.02), new THREE.MeshStandardMaterial({
    color: 0x506a78, roughness: 0.25, metalness: 0.5,
    emissive: new THREE.Color(0x2e4a58), emissiveIntensity: 0.45,
}));
water.name = "bc_water";
water.position.set(0, 0.45, 0);
g.add(water);

// ---- LID LEANING against the E side ----
const lid = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, 0.05, D + 0.06), timberTex);
lid.name = "bc_lid";
// nvp-13 visual gate: the shallow 0.35rad draft floated ~13cm above ground
// and read as two detached rails, not a lid leaning on the cistern. At 0.70rad
// the 0.96m board spans ground→rim; x/y seat binds its upper edge to the E slab.
lid.rotation.z = -0.70;
lid.position.set(W / 2 + 0.383, 0.329, 0); // lower edge ~0.7mm above grade
g.add(lid);
// two battens on the lid
for (const [bi, bz] of [[0, -0.2], [1, 0.2]] as const) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, 0.03, 0.06), timberTex);
    b.name = `bc_lidbatten_${bi}`;
    b.rotation.z = -0.70;
    b.position.set(W / 2 + 0.383, 0.349, bz);
    g.add(b);
}

// ---- COPPER SCOOP on a rim peg ----
const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 5), timberTex);
peg.rotation.x = Math.PI / 2;
peg.name = "bc_peg";
peg.position.set(0, H + 0.02, D / 2);
g.add(peg);
const scoopBowl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), ironTex);
scoopBowl.rotation.x = Math.PI;
scoopBowl.name = "bc_scoop";
scoopBowl.position.set(0, H + 0.05, D / 2 + 0.12);
g.add(scoopBowl);
const scoopHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 5), ironTex);
scoopHandle.rotation.z = 1.1;
scoopHandle.name = "bc_scoop_handle";
scoopHandle.position.set(0.07, H + 0.08, D / 2 + 0.1);
g.add(scoopHandle);

mergeByMaterial(g, "bc3");
writeFileSync("agents/arthur/assets/village_bcistern3.glb", toGLB(g));
console.log("village_bcistern3.glb —", g.children.length, "top-level");
