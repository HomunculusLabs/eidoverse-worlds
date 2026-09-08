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
// v8 (dress-142, survey-57 Sev-3 cure): the v5 sawbuck fix traded one
// defect for the confirmed one — the x-axis workpiece spanned post-to-
// post (reads GANTRY lintel) and the X-trestles sat in front of the
// crib's pale cap wall (reads diagonal debris tangle; zero end-grain
// rhythm survived). Cure mirrors the accepted woodstack's end-on
// anatomy: trestles+workpiece DELETED, crib grown two courses into the
// silhouette (top 0.80 -> 1.14), posts shortened to stack end-boards
// (top 1.54, clears crib 0.40m, nothing spans them), three ordered
// squared GROUND RUNS staged toward the +z approach with pale milled
// caps at their far ends. Footprint unchanged x ±1.5 z -0.9..1.78.
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

// --- squared beam: timber body along z + pale milled end PROUD at +z.
// v9: deep squared cants 0.36x0.30 (v8's 0.34x0.17 planks read "sparse
// heap" — end faces half as tall as the woodstack control's 0.3 discs;
// squarish beam-ends approach disc scale and tighten the course rhythm).
const beam = (y: number, x: number, seed: number, len = 0.92 + jit(seed) * 0.14) => {
    const z0 = -0.75 + len / 2;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.30, len), TIMBER);
    b.position.set(x, y, z0); g.add(b);
    // cap proud: front face 0.015 beyond the beam face — no coplanar fight,
    // end-grain catches light as a distinct pale plane
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.30, 0.05), jit(seed * 1.7) > 0 ? CUT : CUT2);
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

// course 1: 6 deep beams on sticker tops (0.12 + 0.15)
course(0.27, 11, 6);
// course 2: 5 beams, brick-bond offset half-pitch
course(0.57, 27, 5, 0.195);
// course 3: 4 beams aligned with course 1 (proper bond)
course(0.87, 43, 4);
// course 4: 3 beams aligned with course 2. v9: FOUR deep courses 6/5/4/3
// (replacing v8's six plank courses — deep cants carry the same top
// height 1.38 in a tighter rhythm, and the end faces read squarish
// milled grain near the woodstack control's disc scale)
course(1.17, 59, 3, 0.195);

// --- cradle posts at both ends (x ±1.25), rock pads (dress-9 family).
// v8: posts shortened to STACK END-BOARDS — top 1.54 clears the grown
// crib (1.14) by 0.40m and NOTHING spans between them, so no gantry/
// lintel read is possible; they read as the stack's end restraint.
for (const px of [-1.25, 1.25]) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), ROCK);
    pad.position.set(px, 0.09, -0.3); g.add(pad);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.17, 1.54, 0.34), TIMBER);
    post.position.set(px, 0.77, -0.3); g.add(post);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.09, 8), CUT);
    cap.position.set(px, 1.585, -0.3); g.add(cap);
}

// v8: sawbuck trestles + post-spanning workpiece DELETED (dress-82 v5's
// "X X with beam" read was survey-57's CONFIRMED defect: lintel over the
// post gap + diagonal tangle occluding the cap wall). Working-verb
// identity moves to ordered squared GROUND RUNS below — the judge's
// literal prescription ("2-3 ordered horizontal log runs with end-grain
// faces toward the read lane"), squared-stock variant.

// --- three ordered squared ground runs staged toward the approach
// (replaces the sawbuck station). v9 AXIS: runs lie ALONG x (across the
// frame) — the woodstack control's loose logs read FULLY as long
// horizontal silhouettes with long axis in-plane, while v8's z-runs
// foreshortened to end-on dots that read "stray blocks". Long beam
// lines on the ground in front of the posts also echo the control's
// base-rail containment line. Caps at ±x ends (side grains), z-band
// 0.55..1.7 clear of the leaned slab (x -0.67..-0.43, z <= 0.6) and the
// offcut pile (x >= 0.6, z >= 1.35). Footprint unchanged.
for (const [rx_z, len, seed] of [[0.75, 2.1, 101], [1.25, 1.9, 113], [1.65, 1.6, 127]] as const) {
    const run = new THREE.Mesh(new THREE.BoxGeometry(len, 0.24, 0.28), TIMBER);
    run.position.set(-0.25 + jit(seed) * 0.1, 0.18, rx_z); g.add(run);
    for (const ex of [-1, 1]) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.28), jit(seed * 1.7 + ex) > 0 ? CUT : CUT2);
        cap.position.set(-0.25 + jit(seed) * 0.1 + ex * (len / 2 - 0.01), 0.18, rx_z); g.add(cap);
    }
    // stickers under each run (air under the stock = handled timber)
    for (const sx of [-len / 2 + 0.3 + (-0.25), len / 2 - 0.3 + (-0.25)]) {
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.06, 0.20), BARK);
        st.position.set(-0.25 + (sx - (-0.25)), 0.03, rx_z); g.add(st);
    }
}

// --- cant hooks leaning on the cradle posts' outer faces (v8 contact
// fix: v5's handle top x ±1.375 sat 0.08m clear of the ±1.325 post face
// — floating at close view, the judge's "cant-hook identity marginal"
// note; now the top touches the new deeper post (face ±1.335) and the
// foot plants 0.20m out: top x ±1.335, foot x ±1.535, tilt atan(0.20/
// 1.02) ≈ 0.193 rad, length hypot(1.02, 0.20) ≈ 1.04).
for (const sgn of [-1, 1] as const) {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.04, 0.06), BARK);
    handle.position.set(sgn * 1.435, 0.5, -0.05);
    handle.rotation.z = -sgn * 0.193; // top leans toward the post
    g.add(handle);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.06), BARK);
    plate.position.set(sgn * 1.345, 0.97, -0.05);
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
