// mkv3-dress-sw-seats1.ts — dress-97, SW CONTEMPLATIVE seats (round-3 item 17).
// Concept contract: the devotional line (gravel r74.7 -> censer r82.4 -> prayer
// mound r83 -> bell post r88.2 -> labyrinth r98) serves the walking ritual;
// the seats are the WATCHING place — rest after the bell, face the maze
// before entering. Two rough water-worn SLAB benches (staggered, not a
// matched pair — dress-6's NE benches own the matched-pedestal read) in the
// prayer-stone river idiom: worn slab tops on fragment footings, one rounded
// river-stone cushion on the primary seat (the in-use tell, pail/ember
// precedent), kicked fragments at the foot. Sitting height 0.43 (polish-276
// working-height law; stone bench std). Static, unlit — SW lamp spend 0 of 3.
// Materials: RIVER 0x9a968c / DARK 0x7d7a72 / PALE 0xe8e5de — the accepted
// dress-8 prayer family (water-worn grey, base shadow stone, pale recent).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();

const RIVER = mat(0x9a968c, .7, 0);   // worn slab tops / cushion stone
const DARK  = mat(0x7d7a72, .75, 0);  // footing fragments
const PALE  = mat(0xe8e5de, .6, .02); // pale cushion (devotional pale)

const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;
// position-hash noise: identical for duplicated verts at the same location
// (keeps welded seams watertight — index-jitter would tear shared faces)
const pjit = (x: number, y: number, z: number, s = 0) =>
    ((Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 53.3) * 43758.5453) % 1 + 1) % 1 - 0.5;

// river-smoothed stone: MIXED topology (dodeca/icosa by seed parity) +
// strong position-hash radial bumping (±15%) + wide per-axis variance —
// v3 close judge still read the family as "instanced clones of one
// displaced mesh"; topology mixing + amplitude kills the stamp read
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
    s.scale.set(1 + jit(seed) * 0.3, 0.62 + jit(seed + 5) * 0.15, 0.85 + jit(seed + 9) * 0.25);
    s.rotation.set(jit(seed + 13) * 0.25, jit(seed + 17) * 3.14, jit(seed + 23) * 0.2);
    s.position.set(x, y, z);
    g.add(s);
};

// WORN SLAB v4 — the full water-worn treatment (v2/v3 judges: "perfect
// rectangular prism, razor-straight edges, cut masonry"). Three mechanisms:
//  (a) RIM RING DROP: every top/bottom-face rim vert (|z| or |x| at the
//      boundary) pulls toward the slab center by 3.6cm (+2cm more at
//      corners) — reads as rolled edges from every silhouette;
//  (b) CROWN: top-face centerline domes +3cm above its rim (barrel convex —
//      water wears slab tops convex), mirrored under the bottom;
//  (c) LENGTH UNDULATION: a sin term along x varies thickness end-to-end —
//      no straight parallel edges survive.
const wornSlab = (w: number, h: number, d: number, x: number, y: number, z: number,
    ry: number, seed: number, m: THREE.Material) => {
    const geo = new THREE.BoxGeometry(w, h, d, 4, 1, 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
        const top = vy > h * 0.49, bot = vy < -h * 0.49;
        const sx = Math.abs(vx) / (w / 2), sz = Math.abs(vz) / (d / 2);
        const onRim = sz >= 0.99 || sx >= 0.99;
        const corner = sz >= 0.99 && sx >= 0.99;
        let dy = 0;
        const sgn = top ? -1 : 1; // rim pulls toward center on both faces
        if (top || bot) {
            if (onRim) dy += sgn * (0.036 + (corner ? 0.020 : 0) + pjit(vx, vz, vy, seed) * 0.014);
            else dy -= sgn * 0.030 * (1 - sz * sz) * (1 - 0.35 * sx * sx); // crown
            dy -= sgn * 0.018 * Math.sin((vx / (w / 2)) * Math.PI * 1.7 + seed); // undulation
        }
        dy += pjit(vx * 3, vy * 3, vz * 3, seed + 5) * 0.012; // weathering
        pos.setXYZ(i, vx, vy + dy, vz);
    }
    geo.computeVertexNormals();
    const slab = new THREE.Mesh(geo, m);
    slab.position.set(x, y, z);
    slab.rotation.y = ry;
    slab.rotation.z = jit(seed + 200) * 0.025;
    g.add(slab);
};

// ---- primary seat (local frame: +z faces the labyrinth / approach) ----
const SEAT_H = 0.43;
// footing fragments under slab A: 3 clusters — tops EMBED ~0.02-0.04 into the
// slab underside (v1 decode: footings topped 0.288 vs slab bottom 0.355 =
// 0.07m floating gap — contact-shadow class, fixed by construction)
rstone(0.20, -0.62, 0.24, 0.05 + jit(7) * 0.06, 3, DARK);
rstone(0.22, 0.64, 0.25, -0.04 + jit(9) * 0.06, 5, DARK);
rstone(0.18, 0.02, 0.23, 0.10 + jit(11) * 0.06, 13, DARK);
// slab A: 1.5 x 0.15 x 0.55 at seat height
wornSlab(1.50, 0.15, 0.55, jit(15) * 0.03, SEAT_H, 0.0, 0.05 + jit(17) * 0.06, 21, RIVER);

// ---- companion seat B: staggered right-forward, shorter, turned ~20deg ----
rstone(0.19, 1.32, 0.19, 0.88 + jit(19) * 0.06, 23, DARK);
rstone(0.17, 2.02, 0.18, 0.78 + jit(25) * 0.06, 29, DARK);
wornSlab(1.10, 0.14, 0.50, 1.67 + jit(27) * 0.03, 0.38, 0.86, 0.36 + jit(31) * 0.08, 33, RIVER);

// ---- in-use tell: rounded river-stone cushion ON slab A near its end ----
rstone(0.155, -0.48 + jit(35) * 0.04, SEAT_H + 0.16, 0.02 + jit(37) * 0.05, 39, PALE);

// ---- kicked fragments at the foot (chosen-but-unused, sparse) ----
rstone(0.13, -1.02, 0.06, 0.62 + jit(41) * 0.10, 43, RIVER);
rstone(0.11, 0.34, 0.05, 0.78 + jit(43) * 0.10, 47, DARK);

mergeByMaterial(g, "dress_sw_seats1");
writeFileSync("agents/arthur/assets/village_dress_sw_seats1.glb", toGLB(g));
console.log("village_dress_sw_seats1.glb —", g.children.length, "top-level nodes");
