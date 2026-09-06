// mkv3-dress-ne-yard1.ts — dress-2, NE CRAFT shared work yard (staging yard).
// v2 after vision-review rejection of v1 (both gameplay+close views agreed):
// cordwood read as crates (no end-grain, no stagger), sawbench top a
// hairline, sawhorse legs invisible from front, mid-stack cantilever, rail
// overhang past post. v2 laws: pyramid stack with light end-grain caps and
// staggered protruding logs + y-rotation jitter; bench slab thickened and
// separated 1.2m from the stack; sawhorses get A-frame legs splayed in
// local x (visible from the front approach); posts seated on rock pads,
// rail exactly post-to-post.
// Concept contract: the NE craft workshops back onto a shared staging yard
// where timber arrives and sawn stock leaves. Grounds USE: craft districts
// keep their messy, useful back-of-shop strip; the yard sits in the seam
// behind cloister-0029 / cloister-0042, backs to the cloisters, faces the
// district interior. Palette canon only; shavings = straw. Static, unlit.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const WOOD = mat(0xa09832, .95, 0);   // palette wood (light — plank + end grain)
const BARK = mat(0x6a6030, .95, 0);   // palette bark/trunk (bearers, logs, posts)
const IRON = mat(0x404044, .95, 0);   // palette iron/hardware
const ROCK = mat(0x8c887e, .95, 0);   // palette rock (feet/pads)
const STRAW = mat(0xd4da82, .95, 0);  // palette straw/hay (shavings)

const box = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material, ry = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z); mesh.rotation.y = ry; g.add(mesh);
};
// deterministic jitter
const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;

// --- SAWBENCH at local z = -1.0 (front half, faces the district interior)
const BZ = -1.0;
box(2.4, 0.22, 0.55, 0, 0.50, BZ, WOOD);            // thick plank top (working slab)
box(2.2, 0.26, 0.20, 0, 0.26, BZ - 0.16, BARK);     // bearer A
box(2.2, 0.26, 0.20, 0, 0.26, BZ + 0.16, BARK);     // bearer B
box(0.55, 0.28, 0.55, -1.0, 0.11, BZ, ROCK);        // rock pads, bearer ends
box(0.5, 0.24, 0.5, 1.0, 0.09, BZ, ROCK);
box(1.7, 0.1, 0.3, 0.25, 0.66, BZ, WOOD, 0.05);     // freshly sawn plank, slight askew

// --- SAWHORSES flanking the bench ends (x ±1.9), A-frame legs in local x
for (const sx of [-1.9, 1.9]) {
    box(1.0, 0.12, 0.14, sx, 0.45, BZ, WOOD);               // top beam
    box(0.09, 0.48, 0.09, sx - 0.42, 0.24, BZ, BARK);       // leg L front
    box(0.09, 0.48, 0.09, sx + 0.42, 0.24, BZ, BARK);       // leg R front
    box(0.09, 0.48, 0.09, sx - 0.30, 0.24, BZ + 0.22, BARK);// leg L back (inset)
    box(0.09, 0.48, 0.09, sx + 0.30, 0.24, BZ + 0.22, BARK);
}

// --- CORDWOOD stack at local z = +1.0 (back half, against posts)
// pyramid 3-2-1, staggered lengths, light end caps, y-jitter
const logRow = (count: number, y: number, seed: number) => {
    for (let i = 0; i < count; i++) {
        const len = 0.5 + jit(seed + i) * 0.3;          // 0.35..0.65 stagger
        const x = -0.95 + i * (1.9 / Math.max(count - 1, 1)) + jit(seed + i * 3) * 0.12;
        const ry = jit(seed + i * 7) * 0.14;            // ±4 deg
        box(len, 0.3, 0.3, x, y, 1.05, BARK, ry);       // bark body
        for (const sgn of [1, -1]) {
            const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, len, 8), STRAW);
            cap.rotation.z = Math.PI / 2; cap.rotation.y = ry;
            cap.position.set(x + Math.cos(ry) * sgn * len / 2, y, 1.05 - Math.sin(ry) * sgn * len / 2);
            g.add(cap);
        }
    }
};
logRow(3, 0.15, 11);
logRow(2, 0.49, 23);
logRow(1, 0.83, 37);

// --- posts + rail (exactly post-to-post, no overhang; posts on rock pads)
box(0.55, 0.22, 0.55, -1.15, 0.09, 1.0, ROCK);
box(0.55, 0.22, 0.55, 1.15, 0.09, 1.0, ROCK);
box(0.13, 1.2, 0.13, -1.15, 0.69, 1.0, BARK);
box(0.13, 1.2, 0.13, 1.15, 0.69, 1.0, BARK);
box(2.17, 0.09, 0.12, 0, 1.14, 1.0, IRON);            // strap rail, post-to-post

// --- full-length round log laid across the rail, overhanging BOTH posts
const rackLog = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.45, 8), BARK);
rackLog.rotation.z = Math.PI / 2; rackLog.position.set(0, 0.96, 1.0); g.add(rackLog);
const rackCapL = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 8), STRAW);
rackCapL.rotation.z = Math.PI / 2; rackCapL.position.set(-1.16, 0.96, 1.0); g.add(rackCapL);
const rackCapR = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 8), STRAW);
rackCapR.rotation.z = Math.PI / 2; rackCapR.position.set(1.16, 0.96, 1.0); g.add(rackCapR);

// --- yard-floor life: shavings + two loose rounds (reads walked-on)
box(0.7, 0.12, 0.5, -0.55, 0.06, -1.9, STRAW, 0.2);
box(0.5, 0.08, 0.35, 0.05, 0.04, -2.0, STRAW, -0.15);
for (const [cx, cz, r, ry, seed] of [[-0.25, -0.1, 0.15, 0.3, 71], [0.35, 0.35, 0.14, -0.25, 89]] as const) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.3, 8), BARK);
    body.rotation.set(0, ry, Math.PI / 2); body.position.set(cx, r, cz); g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.015, r - 0.015, 0.34, 8), STRAW);
    cap.rotation.set(0, ry, Math.PI / 2); cap.position.set(cx, r, cz); g.add(cap);
}

// --- one log laid across each sawhorse top (yard reads in use)
for (const sx of [-1.9, 1.9]) {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.9, 8), BARK);
    hl.rotation.set(0, 0.35, Math.PI / 2); hl.position.set(sx, 0.56, BZ); g.add(hl);
    const hc = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.03, 8), STRAW);
    hc.rotation.set(0, 0.35, Math.PI / 2); hc.position.set(sx + 0.42, 0.56, BZ - 0.14); g.add(hc);
}

mergeByMaterial(g, "dress_ne_yard1");
writeFileSync("agents/arthur/assets/village_dress_ne_yard1.glb", toGLB(g));
console.log("village_dress_ne_yard1.glb —", g.children.length, "nodes");
