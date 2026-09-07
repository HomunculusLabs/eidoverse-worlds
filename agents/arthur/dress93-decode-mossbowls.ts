// dress90-decode-mossbowls1.ts — true-bbox decode of village_dress_se_mossbowls1.glb (v11)
// Derives the placement contract dims (HALF/CLOCAL) from the ACTUAL accessor
// data, not planned dims (dress-80 law). Node census + global bbox + per-bucket.
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_dress_se_mossbowls1.glb");
const jsonLen = buf.readUInt32LE(12);
const jsonChunk = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
const bin = buf.subarray(20 + jsonLen + 8);

const meshes = jsonChunk.meshes ?? [];
const nodes = jsonChunk.nodes ?? [];
console.log("top-level nodes:", nodes.length);
if ((jsonChunk.extensionsUsed ?? []).includes("KHR_draco_mesh_compression")) {
    console.error("FAIL: draco — local build must be plain");
    process.exit(1);
}

type Prim = { node: string; n: number; verts: number[][] };
const prims: Prim[] = [];
// iterative index-stack walk (children are INDICES, pitfall 3); mesh===undefined test (0 is falsy, pitfall 3b)
const stack = [...nodes.keys()];
const seen = new Set<number>();
while (stack.length) {
    const i = stack.pop()!;
    if (seen.has(i)) continue;
    seen.add(i);
    const n = nodes[i];
    for (const c of n.children ?? []) stack.push(c);
    if (n.mesh === undefined) continue;
    const mesh = meshes[n.mesh];
    for (const p of mesh.primitives) {
        const posAcc = jsonChunk.accessors[p.attributes.POSITION];
        const bv = jsonChunk.bufferViews[posAcc.bufferView];
        const off = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
        const dv = new DataView(bin.buffer, bin.byteOffset + off, posAcc.count * 12);
        const verts: number[][] = [];
        for (let k = 0; k < posAcc.count; k++) {
            verts.push([dv.getFloat32(k * 12, true), dv.getFloat32(k * 12 + 4, true), dv.getFloat32(k * 12 + 8, true)]);
        }
        prims.push({ node: nodes[i].name ?? `node${i}`, n: posAcc.count, verts });
    }
}
console.log("mesh prims:", prims.length);

// global bbox with node translations applied (merged buckets bake them, pitfall 4)
let gx: [number, number] = [Infinity, -Infinity], gy: [number, number] = [Infinity, -Infinity], gz: [number, number] = [Infinity, -Infinity];
for (const p of prims) {
    // find owning node translation by name
    const tr = nodes.find((n: any) => n.name === p.node)?.translation ?? [0, 0, 0];
    for (const v of p.verts) {
        const x = v[0] + (tr[0] ?? 0), y = v[1] + (tr[1] ?? 0), z = v[2] + (tr[2] ?? 0);
        if (x < gx[0]) gx[0] = x; if (x > gx[1]) gx[1] = x;
        if (y < gy[0]) gy[0] = y; if (y > gy[1]) gy[1] = y;
        if (z < gz[0]) gz[0] = z; if (z > gz[1]) gz[1] = z;
    }
    console.log(`bucket ${p.node} n=${p.n} x ${Math.min(...p.verts.map(v => v[0] + tr[0])).toFixed(3)}..${Math.max(...p.verts.map(v => v[0] + tr[0])).toFixed(3)} z ${Math.min(...p.verts.map(v => v[2] + tr[2])).toFixed(3)}..${Math.max(...p.verts.map(v => v[2] + tr[2])).toFixed(3)} y ${Math.min(...p.verts.map(v => v[1] + tr[1])).toFixed(3)}..${Math.max(...p.verts.map(v => v[1] + tr[1])).toFixed(3)}`);
}

const halfX = (gx[1] - gx[0]) / 2, halfZ = (gz[1] - gz[0]) / 2;
const cx = (gx[0] + gx[1]) / 2, cz = (gz[0] + gz[1]) / 2;
console.log(`GLOBAL bbox: x ${gx[0].toFixed(3)}..${gx[1].toFixed(3)} z ${gz[0].toFixed(3)}..${gz[1].toFixed(3)} y ${gy[0].toFixed(3)}..${gy[1].toFixed(3)}`);
console.log(`HALF = { x: ${halfX.toFixed(3)}, z: ${halfZ.toFixed(3)} }, CLOCAL = { x: ${cx.toFixed(3)}, z: ${cz.toFixed(3)} }`);
console.log(`footprint ${((gx[1] - gx[0]) * (gz[1] - gz[0])).toFixed(2)} m2, height ${(gy[1] - gy[0]).toFixed(3)} m`);
// sanity: y base must be ~0 (grounded build, not floating)
if (Math.abs(gy[0]) > 0.05) { console.error("FAIL: y base not ~0 — floating or buried build"); process.exit(1); }
console.log("PASS y base grounded");
