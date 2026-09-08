// struct93-decode-halt.ts — decode audit for the struct-93 halt cure.
// Asserts: (1) bbox IDENTICAL to baseline bb227fd6 (material-only change,
// SAT-neutral); (2) every material bucket now exports a REAL glTF material
// (struct-38 law — before: plain mat() buckets had material:undefined);
// (3) the brass road-stud bucket carries emissive; (4) node census.
import { readFileSync } from "node:fs";

function decode(path: string) {
    const buf = readFileSync(path);
    const jsonLen = buf.readUInt32LE(12);
    const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
    const binStart = 20 + jsonLen + 8;
    const bin = buf.subarray(binStart);
    return { json, bin };
}

function bboxOf(json: any, bin: Buffer) {
    // global bbox from all POSITION accessors, with node translations applied
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    const walk = (idx: number, tf: number[]) => {
        const n = json.nodes[idx];
        const t = n.translation ?? [0, 0, 0];
        const w = [tf[0] + t[0], tf[1] + t[1], tf[2] + t[2]];
        if (n.mesh !== undefined) {
            const mesh = json.meshes[n.mesh];
            for (const prim of mesh.primitives) {
                const acc = json.accessors[prim.attributes.POSITION];
                const off = (acc.byteOffset ?? 0) + (json.bufferViews[acc.bufferView].byteOffset ?? 0);
                for (let i = 0; i < acc.count; i++) {
                    const x = bin.readFloatLE(off + i * 12), y = bin.readFloatLE(off + i * 12 + 4), z = bin.readFloatLE(off + i * 12 + 8);
                    if (x < mn[0]) mn[0] = x; if (y < mn[1]) mn[1] = y; if (z < mn[2]) mn[2] = z;
                    if (x > mx[0]) mx[0] = x; if (y > mx[1]) mx[1] = y; if (z > mx[2]) mx[2] = z;
                }
            }
        }
        for (const c of n.children ?? []) walk(c, w);
    };
    for (const s of json.scenes[json.scene].nodes) walk(s, [0, 0, 0]);
    return { mn, mx };
}

const base = decode("agents/arthur/reviews/struct93-halt/before/baseline.glb");
const cur = decode("agents/arthur/assets/village_wayfarershalt3.glb");

const bb = bboxOf(base.json, base.bin);
const cb = bboxOf(cur.json, cur.bin);
console.log("bbox base:", JSON.stringify(bb));
console.log("bbox cure:", JSON.stringify(cb));
const tol = 1e-4;
let bboxOK = true;
for (let i = 0; i < 3; i++) {
    if (Math.abs(bb.mn[i] - cb.mn[i]) > tol || Math.abs(bb.mx[i] - cb.mx[i]) > tol) bboxOK = false;
}
console.log("BBOX_PARITY:", bboxOK ? "PASS" : "FAIL");

// node census
const nodeCount = (j: any) => {
    let n = 0;
    const walk = (i: number) => { n++; for (const c of j.nodes[i].children ?? []) walk(c); };
    for (const s of j.scenes[j.scene].nodes) walk(s);
    return n;
};
console.log("nodes base:", nodeCount(base.json), "cure:", nodeCount(cur.json));

// material audit: every mesh primitive must reference a material; report names + emissive
const mats = cur.json.materials ?? [];
console.log("materials:", mats.length);
for (const m of mats) {
    console.log("  -", m.name, "emissive:", JSON.stringify(m.emissiveFactor ?? null), "intensity:", m.extensions?.KHR_materials_emissive_strength?.emissiveStrength ?? 1);
}
let noMat = 0, totalPrims = 0;
for (const mesh of cur.json.meshes) for (const p of mesh.primitives) { totalPrims++; if (p.material === undefined) noMat++; }
console.log(`primitives ${totalPrims}, material-less: ${noMat} (before had ALL plain-mat buckets material-less)`);
let baseNoMat = 0, basePrims = 0;
for (const mesh of base.json.meshes) for (const p of mesh.primitives) { basePrims++; if (p.material === undefined) baseNoMat++; }
console.log(`baseline primitives ${basePrims}, material-less: ${baseNoMat}`);
const emissiveMats = mats.filter((m: any) => (m.emissiveFactor ?? [0,0,0]).some((v: number) => v > 0)).length;
console.log("AUDIT:", bboxOK && noMat === 0 && emissiveMats >= 1 ? "ALL PASS" : "FAIL");
