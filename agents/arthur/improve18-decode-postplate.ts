// improve18-decode-postplate.ts — quantify post-vs-slab/plate geometry in
// the LIVE composite (baseline mapboard + b22 rider at L=[0,0,-0.03]).
// Question: do the mpost tops (y 0..2, z ±0.06) emerge through the tilted
// slab (and the b22 backing plate) on the plaza (+z) face?
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

async function load(p: string) {
    const bytes = readFileSync(p);
    const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
    gltf.scene.updateMatrixWorld(true);
    return gltf.scene;
}
const board = await load("agents/arthur/reviews/improve18-mapboard/before/village_mapboard3.baseline.glb");
const rider = await load("agents/arthur/assets/village_artwalk_b22.glb");
rider.position.set(0, 0, -0.03); // b22 anchor L
const scene = new THREE.Group(); scene.add(board); scene.add(rider);
scene.updateMatrixWorld(true);

const collect = (root: THREE.Object3D, pred: (o: any) => boolean) => {
    const out: number[][] = [];
    root.traverse((o: any) => {
        if (!o.isMesh || !pred(o)) return;
        const pos = o.geometry.getAttribute("position") as THREE.BufferAttribute;
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            out.push([v.x, v.y, v.z]);
        }
    });
    return out;
};
// posts: the tall vertical columns at x ±0.85 — select board verts with
// |x| in [0.78, 0.92], z |.| <= 0.07, y in [0.1, 2.0]
const boardV = collect(scene, () => true);
const posts = boardV.filter(v => Math.abs(Math.abs(v[0]) - 0.85) <= 0.07 && Math.abs(v[2]) <= 0.075 && v[1] > 0.1 && v[1] < 2.05);
// slab plaza surface: verts of the slab — |x| <= 1.16, y in [0.82, 2.28], the
// slab is the big timber box; its plaza face z' = -0.208*(y-1.55) - 0.0258
const slabFront = (y: number) => -0.208 * (y - 1.55) - 0.0258;
// rider plate plaza surface: z' = -0.208*(y-1.55) + 0.0319 - 0.03 (L offset)
const plateFront = (y: number) => -0.208 * (y - 1.55) + 0.0319 - 0.03;
const q = (n: number) => Math.round(n * 1000) / 1000;
let maxThrough = 0, maxAt = 0;
for (const p of posts) {
    const t1 = p[2] - slabFront(p[1]);
    const t2 = p[2] - plateFront(p[1]);
    const t = Math.min(t1, t2); // deepest poke through the nearer surface
    if (t > maxThrough) { maxThrough = t; maxAt = p[1]; }
}
console.log(`post verts sampled: ${posts.length}`);
console.log(`max post poke past slab/plate front surface: ${q(maxThrough)} m at y ${q(maxAt)}`);
// rider plate verts for a true min-distance cross-check
const plateV = collect(rider, () => true);
let minD = Infinity, at: number[] = [0, 0, 0], atp: number[] = [0, 0, 0];
for (const p of posts) {
    for (const r of plateV) {
        if (Math.abs(r[1] - p[1]) > 0.1) continue; // nearby in height only
        const d = Math.hypot(r[0] - p[0], r[1] - p[1], r[2] - p[2]);
        if (d < minD) { minD = d; at = r; atp = p; }
    }
}
console.log(`min post-to-rider-geometry distance (|dy|<=0.1): ${q(minD)} at rider ${at.map(q)} post ${atp.map(q)}`);
// y-band where posts are plaza-ward of the plate front surface
const y0 = 1.55 - (0.06 - 0.0019) / 0.208;
console.log(`plate front surface crosses z=+0.06 at y ~ ${q(y0)}; posts top at y 2.0`);
