// improve42-decode-garden.ts — decode audit for the improve-42 garden cure.
// Usage: bun agents/arthur/improve42-decode-garden.ts <model.glb> [label]
// Reports: true world bbox (Box3 over loaded scene), node census, per-mesh
// material names, and — via raw GLB JSON — MATERIAL-LESS primitive count
// (primitives with no material index = loader-default near-black class),
// plus vertex population below grade. Read-only.
import * as THREE from "three";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.argv[2] ?? "");
const label = process.argv[3] ?? path.split("/").pop()!;
const bytes = readFileSync(path);

// --- raw JSON pass: material-less primitives ---
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const jsonStr = Buffer.from(bytes.buffer, bytes.byteOffset + 20, jsonLen).toString("utf8");
const json = JSON.parse(jsonStr);
let primTotal = 0, primMatless = 0;
for (const m of json.meshes ?? []) for (const p of m.primitives ?? []) { primTotal++; if (p.material === undefined) primMatless++; }
const matNames: string[] = (json.materials ?? []).map((m: any) => m.name ?? "(unnamed)");

// --- three.js pass: true bbox + per-mesh materials ---
const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
const loader = new GLTFLoader();
const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const root = gltf.scene;
root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(root);
let below = 0, verts = 0;
const meshMats = new Map<string, number>();
root.traverse((o: any) => {
    if (!o.isMesh) return;
    const g = o.geometry as THREE.BufferGeometry;
    const pos = g.getAttribute("position");
    verts += pos.count;
    const arr = pos.array as Float32Array;
    o.updateMatrixWorld?.(true);
    const m = new THREE.Matrix4().copy(o.matrixWorld);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos as THREE.BufferAttribute, i).applyMatrix4(m);
        if (v.y < -0.05) below++;
    }
    const nm = (Array.isArray(o.material) ? o.material[0] : o.material)?.name ?? "(default)";
    meshMats.set(nm, (meshMats.get(nm) ?? 0) + pos.count);
});
console.log(JSON.stringify({
    label,
    bbox: { min: [rnd(box.min.x), rnd(box.min.y), rnd(box.min.z)], max: [rnd(box.max.x), rnd(box.max.y), rnd(box.max.z)] },
    nodes: (json.nodes ?? []).length,
    primitives: primTotal,
    material_less_primitives: primMatless,
    gltf_materials: matNames,
    mesh_material_vertex_counts: Object.fromEntries(meshMats),
    verts_total: verts,
    verts_below_grade: below,
}, null, 1));
function rnd(n: number) { return Math.round(n * 10000) / 10000; }
