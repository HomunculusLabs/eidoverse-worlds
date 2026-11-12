// debug4-bower.ts — decisive layer test: GLTFLoader (authoritative) vs manual
// byte-walk on the same GLB, dark bucket, eye-ring verts.
import { readFileSync } from "node:fs";
import * as THREE from "three";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const path = `${ROOT}/agents/arthur/assets/village_bower3.glb`;
const bytes = readFileSync(path);
// --- manual byte-walk (as in decode) ---
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8;
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const views = j.bufferViews ?? [];
let manualDark: number[][] = [];
let accInfo = "";
for (const n of j.nodes) {
    if (n.mesh === undefined) continue;
    for (const prim of j.meshes[n.mesh].primitives) {
        const mat = j.materials[prim.material];
        if (mat?.name !== "vw_dark") continue;
        const acc = j.accessors[prim.attributes.POSITION];
        const bv = views[acc.bufferView];
        accInfo = JSON.stringify({ accByteOff: acc.byteOffset, accCount: acc.count, bvByteOff: bv.byteOffset, bvLen: bv.byteLength, ct: acc.componentType, stride: acc.byteStride ?? bv.byteStride ?? null, buff: bv.buffer });
        const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        const t = n.translation ?? [0, 0, 0];
        for (let i = 0; i < acc.count; i++) {
            const p = BIN + off + i * 12;
            manualDark.push([bytes.readFloatLE(p) + t[0], bytes.readFloatLE(p + 4) + t[1], bytes.readFloatLE(p + 8) + t[2]]);
        }
    }
}
console.log(`manual dark verts: ${manualDark.length}; accessor: ${accInfo}`);
// --- GLTFLoader authoritative ---
const loader = new (await import("three/examples/jsm/loaders/GLTFLoader.js")).GLTFLoader();
const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
let loaderDark: number[][] = [];
gltf.scene.traverse((o: any) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    if (!mats.some((mm: any) => mm?.name === "vw_dark")) return;
    const posA = o.geometry.getAttribute("position");
    for (let i = 0; i < posA.count; i++) loaderDark.push([posA.getX(i), posA.getY(i), posA.getZ(i)]);
});
console.log(`GLTFLoader dark verts: ${loaderDark.length}`);
// compare sets
const key = (p: number[]) => `${p[0].toFixed(4)},${p[1].toFixed(4)},${p[2].toFixed(4)}`;
const mset = new Map<string, number[]>();
for (const p of manualDark) if (!mset.has(key(p))) mset.set(key(p), p);
const lset = new Map<string, number[]>();
for (const p of loaderDark) if (!lset.has(key(p))) lset.set(key(p), p);
let onlyManual = 0, onlyLoader = 0;
const om: number[][] = [], ol: number[][] = [];
for (const [k, p] of mset) if (!lset.has(k)) { onlyManual++; om.push(p); }
for (const [k, p] of lset) if (!mset.has(k)) { onlyLoader++; ol.push(p); }
console.log(`only-manual ${onlyManual}, only-loader ${onlyLoader}`);
// y=2.24 ring comparison (eye cell)
const mRing = manualDark.filter(p => Math.abs(p[1] - 2.24) < 1e-3);
const lRing = loaderDark.filter(p => Math.abs(p[1] - 2.24) < 1e-3);
console.log(`y2.24 ring: manual ${mRing.length} verts, loader ${lRing.length} verts`);
console.log("manual y2.24:", mRing.map(p => `(${p[0].toFixed(3)},${p[2].toFixed(3)})`).join(" "));
console.log("loader y2.24:", lRing.map(p => `(${p[0].toFixed(3)},${p[2].toFixed(3)})`).join(" "));
