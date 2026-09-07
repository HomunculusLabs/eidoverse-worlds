// improve43-decode-cairn.ts — surface-true floater quantification for the
// wild-cairn family (improve-43). mergeByMaterial collapses the cairnfield to
// ~2 material buckets, so stone identity must be recovered from vertex data.
// Method: per 0.25m XY cell, collect world-Y values; a FLOATER = a hit
// cluster (surface-true) whose column has a vertical AIR GAP >= 0.04m
// directly beneath the cluster's bottom, with the cluster bottom above
// 0.15m (the surveyed sky-isolated pebble class). Cluster walk groups sorted
// Y values with break <= 0.04 (vertex rings on icosahedra can space > 0.04
// WITHIN one stone — grouping threshold matches the gap law so a single
// stone's own vertex spacing never splits it into two groups).
// Also reports: true bbox, node census, material census (raw JSON),
// below-grade verts, worst gap, and per-column worst offenders.
// Read-only. Usage: bun agents/arthur/improve43-decode-cairn.ts <model.glb> [label]
import * as THREE from "three";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.argv[2] ?? "");
const label = process.argv[3] ?? path.split("/").pop()!;
const bytes = readFileSync(path);

// --- raw JSON pass: material census ---
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const jsonStr = Buffer.from(bytes.buffer, bytes.byteOffset + 20, jsonLen).toString("utf8");
const json = JSON.parse(jsonStr);
let primTotal = 0, primMatless = 0;
for (const m of json.meshes ?? []) for (const p of m.primitives ?? []) { primTotal++; if (p.material === undefined) primMatless++; }
const matNames: string[] = (json.materials ?? []).map((m: any) => m.name ?? "(unnamed)");

// --- three.js pass: world-space vertex columns ---
const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
const loader = new GLTFLoader();
const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const root = gltf.scene;
root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(root);

const CELL = 0.25, GAP = 0.04, MIN_H = 0.15;
const cols = new Map<string, number[]>();
let below = 0, vertsTotal = 0;
const meshMats = new Map<string, number>();
root.traverse((o: any) => {
    if (!o.isMesh) return;
    const g = o.geometry as THREE.BufferGeometry;
    const pos = g.getAttribute("position");
    vertsTotal += pos.count;
    o.updateMatrixWorld?.(true);
    const m = new THREE.Matrix4().copy(o.matrixWorld);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos as THREE.BufferAttribute, i).applyMatrix4(m);
        if (v.y < -0.05) below++;
        const key = `${Math.round(v.x / CELL)}:${Math.round(v.z / CELL)}`;
        const arr = cols.get(key); if (arr) arr.push(v.y); else cols.set(key, [v.y]);
    }
    const nm = (Array.isArray(o.material) ? o.material[0] : o.material)?.name ?? "(default)";
    meshMats.set(nm, (meshMats.get(nm) ?? 0) + pos.count);
});

// per-column cluster walk: a floater group has an air gap below it
let floatVerts = 0, worstGap = 0;
const offenders: any[] = [];
for (const [key, ys] of cols) {
    ys.sort((a, b) => a - b);
    let i = 0;
    while (i < ys.length) {
        let j = i;
        while (j + 1 < ys.length && ys[j + 1] - ys[j] <= GAP) j++;
        const gMin = ys[i], gMax = ys[j], gN = j - i + 1;
        if (i > 0 && gMin > MIN_H && gMin - ys[i - 1] > GAP) {
            floatVerts += gN;
            const gap = gMin - ys[i - 1];
            if (gap > worstGap) worstGap = gap;
            const [cx, cz] = key.split(":").map(Number);
            offenders.push({ x: +(cx * CELL).toFixed(2), z: +(cz * CELL).toFixed(2), group_min_y: +gMin.toFixed(3), group_max_y: +gMax.toFixed(3), verts: gN, gap_m: +gap.toFixed(3) });
        }
        i = j + 1;
    }
}
offenders.sort((a, b) => b.gap_m - a.gap_m);
const topOffenders = offenders.slice(0, 10);
const maxColumnTop = Math.max(...[...cols.values()].map(a => a[a.length - 1]));
console.log(JSON.stringify({
    label,
    bbox: { min: [rnd(box.min.x), rnd(box.min.y), rnd(box.min.z)], max: [rnd(box.max.x), rnd(box.max.y), rnd(box.max.z)] },
    nodes: (json.nodes ?? []).length,
    columns: cols.size,
    max_top_y: +maxColumnTop.toFixed(3),
    floater_verts: floatVerts,
    floater_groups: offenders.length,
    worst_gap_m: +worstGap.toFixed(3),
    worst_offenders: topOffenders,
    material_less_primitives: primMatless,
    gltf_materials: matNames,
    mesh_material_vertex_counts: Object.fromEntries(meshMats),
    verts_total: vertsTotal,
    verts_below_grade: below,
}, null, 1));
function rnd(n: number) { return Math.round(n * 10000) / 10000; }
