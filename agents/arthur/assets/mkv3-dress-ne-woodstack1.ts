// mkv3-dress-ne-woodstack1.ts — dress-9, NE CRAFT firewood woodstack.
// Concept contract: firewood laid in against the flank gable of a craft
// hamlet (nx-craft-hamlet-0028) — winter prep against the weather side,
// the domestic answer to dress-2's shared back-of-shop staging yard.
// Stove-length split logs stacked in courses between two end cradle
// posts; log lengths run OUT from the wall (local −z) so the pale cut
// end-grain discs face the plaza approach (local +z) — the 18m distance
// tell (dress-2 cordwood law: STRAW caps value-separated from BARK).
// Ends staggered; moss cap on the top course; one protruding log
// breaking the top silhouette; leaners; pale-ended spill rounds.
// Grounds USE: heat and hearth. Static, unlit — spends no lamp budget
// (NE budget 10, used 0).
// v1 (e8f3c973…) REJECTED (zai gameplay FAIL, native vision down err 1210
// 10th tick): sideways end strips, sparse silhouette. v2 (435c7354…)
// REJECTED: massed courses read, but caps faced +x — the rig (and the
// plaza approach, hamlet yaw −135 ⇒ local +z is plaza-ward) sees log
// SIDES; protruding log didn't break the top line; spills' caps sideways.
// v3: frame corrected — logs run z, caps +z.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const WOOD = mat(0xa09832, .95, 0);   // palette wood (light — split faces)
const BARK = mat(0x6a6030, .95, 0);   // palette bark/trunk
const STRAW = mat(0xede9c4, .95, 0);  // pale straw end-grain caps (v5: brighter + FLUSH cap radius — v4 judge: value pop still weak, inset caps let bark edge dominate the disc)
const STRAW2 = mat(0xdfe3b0, .95, 0); // second cap value, alternated (v5 judge note: break the uniform lattice)
const ROCK = mat(0x8c887e, .95, 0);   // palette rock pads
const MOSS = mat(0x5c7a4a, .95, 0);   // palette moss

const jit = (n: number) => {
    const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
    return v - Math.round(v);
};

// LOCAL FRAME: +z = outward from the wall toward the plaza (viewer side);
// logs run wall(−z)→out(+z); pale end discs face +z. Wall plane z = −0.75.

// --- one stove-length log: bark cylinder along z + pale end disc at +z
const log = (y: number, x: number, r: number, seed: number) => {
    const len = 0.92 + jit(seed) * 0.14;              // staggered ends 0.85..0.99
    const z0 = -0.75 + len / 2;                        // back end at the wall
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), BARK);
    body.rotation.x = Math.PI / 2;
    body.position.set(x, y, z0);
    g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 8), jit(seed * 3) > 0 ? STRAW : STRAW2);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(x, y, z0 + len / 2 - 0.03);
    g.add(cap);
};

// --- courses: 3 high, packed along x between cradle posts (x ±1.25)
const course = (y: number, seed: number, count: number) => {
    for (let i = 0; i < count; i++) {
        const r = 0.11 + Math.abs(jit(seed + i * 5)) * 0.03;
        const x = -1.02 + i * (2.04 / Math.max(count - 1, 1)) + jit(seed + i * 3) * 0.04;
        log(y, x, r, seed + i);
    }
};
course(0.13, 11, 8);   // ground course
course(0.38, 27, 7);   // second course
course(0.62, 43, 6);   // top course
// one protruding log on the top course — sticks further +z AND +y, breaks the line (v4: raised y 0.86→0.92, pushed +z — v3 judge: read as rail/bump)
{
    const len = 1.12;
    const z0 = -0.75 + len / 2;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, len, 8), BARK);
    body.rotation.x = Math.PI / 2; body.position.set(0.55, 0.92, z0); g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.108, 0.05, 8), STRAW);
    cap.rotation.x = Math.PI / 2; cap.position.set(0.55, 0.92, z0 + len / 2 - 0.025); g.add(cap);
}
// moss on the top course — SMALL patches only (v5: shrank — v4 judged the
// top moss read as a fence rail spanning the stack)
const moss1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.3), MOSS);
moss1.position.set(-0.35, 0.755, -0.35); moss1.rotation.y = 0.12; g.add(moss1);
const moss2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.045, 0.22), MOSS);
moss2.position.set(0.3, 0.77, -0.3); g.add(moss2);

// --- cradle posts at both ends (x ±1.25), on rock pads
for (const px of [-1.25, 1.25]) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), ROCK);
    pad.position.set(px, 0.09, -0.3); g.add(pad);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.05, 0.15), BARK);
    post.position.set(px, 0.62, -0.3); g.add(post);
}

// --- leaners: 3 logs leaning against the right flank (x +1.05), caps +z
for (let i = 0; i < 3; i++) {
    const z = -0.45 + i * 0.42 + jit(70 + i) * 0.05;
    const len = 0.85;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, len, 8), BARK);
    body.rotation.set(-0.40, 0, 0);            // top rests on the stack flank
    body.position.set(1.28, 0.34, z);
    g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.05, 8), STRAW);
    cap.rotation.set(-0.40, 0, 0);
    cap.position.set(1.28, 0.34 + Math.sin(0.40) * (len / 2), z + Math.cos(0.40) * (len / 2) - 0.02);
    g.add(cap);
}

// --- pale-ended spill rounds near the base (caps facing +z)
for (const [sx, sz, r] of [[0.62, 1.05, 0.13], [-0.55, 1.15, 0.10]] as const) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.3, 8), BARK);
    body.rotation.x = Math.PI / 2; body.position.set(sx, r, sz); g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.012, r - 0.012, 0.34, 8), STRAW);
    cap.rotation.x = Math.PI / 2; cap.position.set(sx, r, sz); g.add(cap);
}
const wedge1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.2), BARK);
wedge1.position.set(0.35, 0.035, 0.55); wedge1.rotation.y = 0.4; g.add(wedge1);
const wedge2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.16), BARK);
wedge2.position.set(-0.7, 0.03, 0.45); wedge2.rotation.y = -0.3; g.add(wedge2);

mergeByMaterial(g, "dress_ne_woodstack1");
writeFileSync("agents/arthur/assets/village_dress_ne_woodstack1.glb", toGLB(g));
console.log("village_dress_ne_woodstack1.glb —", g.children.length, "nodes");
