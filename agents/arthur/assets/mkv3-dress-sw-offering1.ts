// mkv3-dress-sw-offering1.ts — dress-98, SW CONTEMPLATIVE offering niche
// (round-3 item 18): nx-dress-sw-offering-001.
// Concept contract: the devotional line (gravel -> censer -> prayer -> bell
// -> seats -> labyrinth) ends at the maze threshold — the circling walker's
// FIRST touch of the boundary wall, at the ring-7 entrance-gap flank. This
// is the OFFERING place: pause, leave something, enter. A single taller jamb
// stone (0.88m, 1.33x wall height) continuing the wall's hand-set run
// (source-true ring-7 family: C.STONE 0x56503c odd-ring stones, tangent long
// axis, 0.55-length masonry), topped by a shallow PALE dish (devotional
// pale 0xe8e5de — dress-8/97 family), one rounded pale river-stone cushion
// ON the dish (the standing offering, dress-97 cushion precedent), a small
// hand-height shelf ledge on the outer face (where a thing is set down),
// spent chips at the foot. Mounted flush against the wall's outer face
// (back face embeds 0.04 INTO the wall plane — no hairline float).
// Static, unlit — SW lamp spend 0 of 3. Node budget: 3 merged (STONE/PALE/DARK).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();

const STONE = mat(0x56503c, .97, 0);  // ring-7 odd-ring wall stone (source-true)
const PALE  = mat(0xe8e5de, .6, .02); // devotional pale (dress-8/97 family)
const DARK  = mat(0x7d7a72, .75, 0);  // shadow stone / spent chips

const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;
const pjit = (x: number, y: number, z: number, s = 0) =>
    ((Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 53.3) * 43758.5453) % 1 + 1) % 1 - 0.5;

// hand-set wall stone: box with masonry irregularity (the maze family's
// ±0.04 rot-z tilt + weathered verts) — long axis TANGENT (local x), depth
// radial (local z), back face at local z = -0.12 (embeds 0.04 into the wall
// plane when the rider anchor sits 0.12 proud of the outer face at r6.94)
const wallStone = (w: number, h: number, d: number, x: number, y: number, z: number,
    ry: number, seed: number, m: THREE.Material) => {
    const geo = new THREE.BoxGeometry(w, h, d, 3, 2, 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
        const b = 1 + pjit(vx * 3 + seed, vy * 3, vz * 3, seed) * 0.035;
        pos.setXYZ(i, vx * b, vy * b, vz * b);
    }
    geo.computeVertexNormals();
    const s = new THREE.Mesh(geo, m);
    s.position.set(x, y, z);
    s.rotation.y = ry;
    s.rotation.z = jit(seed + 13) * 0.04;
    s.rotation.x = jit(seed + 23) * 0.03;
    g.add(s);
};

// rounded river stone (dress-97 rstone, mixed topology + radial bump)
const rstone = (r: number, x: number, y: number, z: number, seed: number, m: THREE.Material) => {
    const geo = (seed % 2 === 0)
        ? new THREE.DodecahedronGeometry(r, 1)
        : new THREE.IcosahedronGeometry(r, 1);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
        const b = 1 + pjit(vx * 4 + seed, vy * 4, vz * 4, seed) * 0.30;
        pos.setXYZ(i, vx * b, vy * b, vz * b);
    }
    geo.computeVertexNormals();
    const s = new THREE.Mesh(geo, m);
    s.scale.set(1 + jit(seed) * 0.2, 0.62 + jit(seed + 5) * 0.12, 0.85 + jit(seed + 9) * 0.2);
    s.rotation.set(jit(seed + 13) * 0.2, jit(seed + 17) * 3.14, jit(seed + 23) * 0.15);
    s.position.set(x, y, z);
    g.add(s);
};

// ---- THE JAMB: threshold post continuing the wall run ----
// local frame: +z = outward radial (away from maze center), origin at
// ground under the anchor; back face of masonry at z = -0.12.
// 0.55 long (tangent, same as wall stones) x 0.88 high x 0.26 deep.
wallStone(0.55, 0.88, 0.26, jit(3) * 0.02, 0.44 + jit(5) * 0.015, 0.01, jit(7) * 0.05, 11, STONE);

// ---- THE CAPSTONE-DISH (v3): wide pale lintel-cap, judge-prescribed ----
// v2 18m FAIL: overhang 3-5px asymmetric, cap value reads tan against pale
// sky, crest merges with cap line. v3: cap 0.88 x 0.38 (~0.165/side = 30%
// of jamb width per side unmistakable step), FLAT crown rim band 0.07 wide
// (the lit surface that carries the read — v2's concave top gave the light
// nothing flat to catch), dish shallower (0.035), crest stone offset +
// larger (r 0.105, ≥4px proud), foot chips clustered into a 2-stack
// mini-cairn (second silhouette cue).
const capPts: THREE.Vector2[] = [];
capPts.push(new THREE.Vector2(0.005, 0.0));            // underside center
capPts.push(new THREE.Vector2(0.44, 0.0));             // underside lip
capPts.push(new THREE.Vector2(0.445, 0.05));           // edge lower chamfer
capPts.push(new THREE.Vector2(0.43, 0.10));            // lip crown outer
capPts.push(new THREE.Vector2(0.36, 0.10));            // FLAT crown band (lit)
capPts.push(new THREE.Vector2(0.34, 0.09));            // inner rim drop
for (let i = 1; i <= 6; i++) {                          // shallow dish floor
    const t = 1 - i / 6;                                // 1 at rim -> 0 center
    capPts.push(new THREE.Vector2(0.34 * t * 0.96, 0.09 - 0.035 * (1 - t * t)));
}
const capGeo = new THREE.LatheGeometry(capPts, 22);
const cap = new THREE.Mesh(capGeo, PALE);
cap.scale.z = 0.43;                                     // oval: 0.88 x 0.38
cap.position.set(jit(9) * 0.015, 0.885, jit(11) * 0.015);
cap.rotation.z = jit(13) * 0.03;
g.add(cap);

// ---- THE OFFERING (v3 CANDIDATE — deferred placement) ----
// 6-version native arc: v1 FAIL (dish 2-4px band), v2 FAIL (cap unbroken),
// v3 PASS-marginal (wide stepped cap + pale crest + bright cairn cap),
// v4 FAIL-marginal (crest pale-on-pale merges), v5 FAIL (dark-on-pale
// collapses — cap band flattens mid-grey), v6 FAIL (crest dark-against-sky
// inversion). v3 is the peak and the placement candidate; confirm-or-drop
// native re-judge owed on these exact bytes at the next wakeup before any
// placement (restored-vision law). Crest: pale river-stone, offset,
// cresting the rim (dress-79 crest law).
rstone(0.105, 0.06 + jit(15) * 0.02, 1.015, -0.03 + jit(17) * 0.02, 19, PALE);

// ---- THE SHELF: hand-height rest ledge on the outer face ----
// worn mini-slab (dress-97 idiom, scaled): reads as a set-down stone, not
// a stuck-on box. Proud of the masonry face at 0.72m reach height.
{
    const geo = new THREE.BoxGeometry(0.30, 0.05, 0.17, 3, 1, 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
        const top = vy > 0.024, sx = Math.abs(vx) / 0.15, sz = Math.abs(vz) / 0.085;
        let dy = 0;
        if (top && (sx >= 0.99 || sz >= 0.99)) dy -= 0.008 + (sx >= 0.99 && sz >= 0.99 ? 0.005 : 0);
        else if (top) dy += 0.007 * (1 - sz * sz);
        dy += pjit(vx * 5, vy * 5, vz * 5, 29) * 0.006;
        pos.setXYZ(i, vx, vy + dy, vz);
    }
    geo.computeVertexNormals();
    const shelf = new THREE.Mesh(geo, STONE);
    shelf.position.set(0.14 + jit(21) * 0.01, 0.72, 0.215);
    shelf.rotation.y = jit(23) * 0.04;
    shelf.rotation.z = jit(27) * 0.02;
    g.add(shelf);
}

// ---- SPENT CHIPS at the foot: clustered 2-stack mini-cairn (v3) ----
// v2 judge: scattered lumps; a small stacked cairn is the cheapest second
// silhouette cue. One PALE cap stone = the most recent spent offering.
rstone(0.085, 0.30 + jit(31) * 0.04, 0.05, 0.32 + jit(33) * 0.05, 37, DARK);
rstone(0.075, 0.33 + jit(35) * 0.04, 0.14, 0.30 + jit(37) * 0.05, 41, DARK);
rstone(0.06, 0.31 + jit(39) * 0.03, 0.235, 0.33 + jit(41) * 0.05, 43, PALE);
rstone(0.07, -0.29 + jit(45) * 0.04, 0.04, 0.28 + jit(47) * 0.05, 49, DARK);

mergeByMaterial(g, "dress_sw_offering1");
writeFileSync("agents/arthur/assets/village_dress_sw_offering1.glb", toGLB(g));
console.log("village_dress_sw_offering1.glb —", g.children.length, "top-level nodes");
