// mkv3-dress-ne-timberyard1.ts — dress-82, NE CRAFT round-3 item 7.
// Concept contract: squared timber yard — WORKING stock, distinct from
// dress-9's firewood woodstack (domestic heat). Distinction tells:
// (1) SQUARED milled beams in long low courses (industry vs cordwood
//     cylinders in running-bond);
// (2) a sawbuck PAIR holding one squared workpiece mid-yard (the working
//     verb — stock being cut, not stored);
// (3) pale milled end-grain facing the plaza approach (+z, the
//     dress-2/dress-9 distance law) — stack caps + workpiece end square;
// (4) cant hooks leaning on the cradle posts (craft tool accent).
// Grounds USE: a craft district stages structural timber between jobs —
// squared stock, sawbuck, tools = active yard, not winter prep.
// v1 (105fdf8a) native 18m: squared-vs-round PASS decisive; three
// defects — workpiece spanning the posts read GATE; sawbuck X-splay
// 0.19m too narrow to read; flush caps coplanar with beam faces didn't
// read pale; flat ground slab read stray dark line. v2: sawbuck rotated
// 90° (workpiece along z toward approach at working height 0.71, X-frames
// splay in x so the X reads dead-on), caps PROUD +0.015, X legs 0.72
// long tilt 0.62 (0.42m spread), slab LEANED on the stack front.
// Static, unlit — spends no lamp budget (NE budget 10, used 0).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const TIMBER = mat(0x94866c, .95, 0);  // post-adjacent timber (dress-80 accepted value)
const BARK   = mat(0x6a6030, .95, 0);  // palette bark/trunk (tools + stickers)
const CUT    = mat(0xf2eed0, .95, 0);  // pale milled end-grain (dress-11 family tell)
const CUT2   = mat(0xdfe3b0, .95, 0);  // second cap value, alternated
const ROCK   = mat(0x8c887e, .95, 0);  // palette rock pads

const jit = (n: number) => {
    const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
    return v - Math.round(v);
};

// LOCAL FRAME: +z = plaza approach side; stack beams run back(−z)→out(+z),
// pale milled ends face +z. Stack back edge z = −0.75; sawbuck yard along
// +z from the stack face (workpiece end square faces the approach).

// --- squared beam: timber body along z + pale milled end PROUD at +z
const beam = (y: number, x: number, seed: number, len = 0.92 + jit(seed) * 0.14) => {
    const z0 = -0.75 + len / 2;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.17, len), TIMBER);
    b.position.set(x, y, z0); g.add(b);
    // cap proud: front face 0.015 beyond the beam face — no coplanar fight,
    // end-grain catches light as a distinct pale plane
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.17, 0.05), jit(seed * 1.7) > 0 ? CUT : CUT2);
    cap.position.set(x, y, z0 + len / 2 - 0.01); g.add(cap);
};

// --- courses: DENSE brick-bond squared beams on slab stickers (v2: v1's
// 3 beams at full-span pitch read "assorted block pile" — a timber stack
// is dense; beams near-touching at pitch 0.39, every other course aligned)
const course = (y: number, seed: number, count: number, offset = 0) => {
    const pitch = 0.39;
    const span = pitch * (count - 1);
    for (let i = 0; i < count; i++) {
        const x = -span / 2 + i * pitch + offset + jit(seed + i * 3) * 0.02;
        beam(y, x, seed + i);
    }
};

// slab stickers: three spacers under course 1 (air under the stack)
for (const sx of [-1.0, 0, 1.0]) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 1.7), BARK);
    st.position.set(sx, 0.06, -0.05);
    g.add(st);
}

// course 1: 6 beams on sticker tops (0.12 + 0.085)
course(0.205, 11, 6);
// course 2: 5 beams, brick-bond offset half-pitch
course(0.375, 27, 5, 0.195);
// course 3: 4 beams aligned with course 1 (proper bond)
course(0.545, 43, 4);
// course 4: 3 beams aligned with course 2 (v3: taller crib — v2's single
// visible course read "fence rank"; 4 courses ≈ 1.0m reads STACKED CRIB)
course(0.715, 59, 3, 0.195);

// --- cradle posts at both ends (x ±1.25), rock pads (dress-9 family)
for (const px of [-1.25, 1.25]) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), ROCK);
    pad.position.set(px, 0.09, -0.3); g.add(pad);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.05, 0.15), TIMBER);
    post.position.set(px, 0.62, -0.3); g.add(post);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.09, 8), CUT);
    cap.position.set(px, 1.196, -0.3); g.add(cap);
}

// --- sawbuck pair (v5: AXIS FIX — the v2-v4 workpiece ran along z, so at
// the 18m approach view it foreshortened to an ~8px dot; a workpiece
// reads from the approach ONLY along x. Two X-trestles side-by-side at
// x ±0.60, legs 1.15 long tilt ±0.58 splaying in x (corner drop
// 0.575·sin0.58+0.0275·cos0.58 = 0.338 → feet ON ground, spread ±0.48,
// top corners y 0.667); saddle bars along z on each X top (0.69 center,
// top 0.715); ONE squared workpiece along x (2.1 long, x −1.05..1.05 —
// inside the post span ±1.25, CANNOT read gate/lintel) center y 0.795
// (top 0.875, +0.075 above crib top 0.80) at z 0.75 — from the approach
// it reads: X X with a horizontal beam riding above the crib line.
for (const tx of [-0.6, 0.6]) {
    for (const tilt of [0.58, -0.58]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.055, 0.055), BARK);
        leg.rotation.z = tilt;
        leg.position.set(tx, 0.338, 0.75);
        g.add(leg);
    }
    // second X plane offset in z for a 3D trestle read (strut ties pair)
    for (const tilt of [0.58, -0.58]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.055, 0.055), BARK);
        leg.rotation.z = tilt;
        leg.position.set(tx, 0.338, 0.95);
        g.add(leg);
    }
    // saddle bar along z spanning both X planes (top y 0.69+0.025)
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.05, 0.45), BARK);
    bar.position.set(tx, 0.69, 0.85); g.add(bar);
}
// workpiece: squared beam along x through both saddles — the readable
// axis from the approach; pale milled end squares at ±x ends
{
    const wp = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 0.16), TIMBER);
    wp.position.set(0, 0.795, 0.85); g.add(wp);
    for (const ex of [-1.0, 1.0]) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.16), ex > 0 ? CUT : CUT2);
        cap.position.set(ex + (ex > 0 ? 0.025 : -0.025), 0.795, 0.85); g.add(cap);
    }
}

// --- cant hooks leaning on the cradle posts' outer faces (contact exact:
// handle top x reaches the post face ±1.325). Hook plate at the top.
for (const sgn of [-1, 1] as const) {
    const hx = sgn * 1.375;
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 0.06), BARK);
    handle.position.set(hx, 0.525, -0.05);
    handle.rotation.z = -sgn * 0.095; // top leans toward the post
    g.add(handle);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.06), BARK);
    plate.position.set(sgn * 1.33, 1.02, -0.05);
    g.add(plate);
}

// --- offcut spills (v3: clustered at ONE side of the sawbuck line —
// v2's two scattered offcuts read "mess" at the post feet; clustered
// reads a cut station's offcut pile)
for (const [sx, sz, rot] of [[0.95, 1.35, 0.4], [0.72, 1.55, -0.15]] as const) {
    const off = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.17, 0.42), TIMBER);
    off.position.set(sx, 0.085, sz); off.rotation.y = rot; g.add(off);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.17, 0.42), CUT);
    cap.position.set(sx, 0.085, sz); cap.rotation.y = rot; g.add(cap);
}
// second small offcut stacked on the first (pile reads deliberate)
{
    const off = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.34), TIMBER);
    off.position.set(0.83, 0.245, 1.44); off.rotation.y = 0.7; g.add(off);
}
// one bark slab LEANED on the stack front face (v1's flat slab read a
// stray ground line; leaned reads deliberate). Slab long in z (0.55),
// tilt about x +1.05: foot end (+z) bottom corner AT ground y=0, top
// end (−z) resting on the course-2/3 front (z ≈ 0.24, y ≈ 0.50).
// Contact math: half-len 0.275 → vertical 0.2385, horizontal 0.1368;
// center y = 0.249 puts the foot corner at 0, top corner at 0.50/z 0.24.
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.55), BARK);
    slab.position.set(-0.55, 0.249, 0.327);
    slab.rotation.x = 1.05;
    g.add(slab);
}

mergeByMaterial(g, "dress_ne_timberyard1");
writeFileSync("agents/arthur/assets/village_dress_ne_timberyard1.glb", toGLB(g));
console.log("village_dress_ne_timberyard1.glb —", g.children.length, "nodes");
