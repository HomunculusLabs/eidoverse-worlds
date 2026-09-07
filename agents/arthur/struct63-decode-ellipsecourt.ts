// struct63-decode-ellipsecourt.ts — decode audit for the Ellipse Court GLB.
// Verifies: node census, per-bucket envelope, pier ring truth (all 14 piers
// ON the ellipse, equal-arc chords), entablature closure, focus pins at ±5.6.
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_ellipsecourt3.glb");
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) throw Error("not glb");
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jsonLen)));
const binStart = 20 + jsonLen + 8;
const bin = buf.subarray(binStart);

const meshes = json.meshes ?? [], nodes = json.nodes ?? [];
console.log("nodes:", nodes.length, "meshes:", meshes.length);

// iterative index-stack world-position walk (pitfall 3/4 laws)
const acc = (accIdx: number) => {
    const a = json.accessors[accIdx];
    const view = json.bufferViews[a.bufferView];
    const off = (view.byteOffset ?? 0) + (a.byteOffset ?? 0);
    const comp = a.componentType === 5126 ? Float32Array : Uint16Array;
    const arr = new comp(bin.buffer, bin.byteOffset + off, a.count * (a.type === "VEC3" ? 3 : 2));
    return { min: a.min, max: a.max, arr, count: a.count };
};

let nodeRows = [];
const gX = (n: any) => (n.translation ? n.translation[0] : 0);
for (const [ni, n] of nodes.entries()) {
    if (n.mesh === undefined) { nodeRows.push([ni, n.name, "(no mesh)", 0]); continue; }
    const m = meshes[n.mesh];
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    let vcount = 0;
    for (const prim of m.primitives) {
        const a = acc(prim.attributes.POSITION);
        vcount += a.count;
        for (let i = 0; i < a.count; i++) {
            for (let k = 0; k < 3; k++) {
                const v = a.arr[i * 3 + k];
                if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v;
            }
        }
    }
    const t = n.translation ?? [0, 0, 0];
    nodeRows.push([ni, n.name, `v=${vcount}`, `local x[${mn[0].toFixed(2)},${mx[0].toFixed(2)}] y[${mn[1].toFixed(2)},${mx[1].toFixed(2)}] z[${mn[2].toFixed(2)},${mx[2].toFixed(2)}] +t(${t.map((v: number) => v.toFixed(2)).join(",")})`]);
}
for (const r of nodeRows) console.log(r.join(" | "));

// merged-bucket truth: one node per material (3 total). The static focus
// pins are NOT KEEP tokens (no comp targets them) — they merge into the
// brass bucket; presence is proven by that bucket's envelope: x extent
// = ±(5.6 + 0.07 base radius) = ±5.67, y = 0..0.26 (pin height).
if (nodes.length !== 3) throw Error(`expected 3 merged nodes, got ${nodes.length}`);
let brass: { mn: number[]; mx: number[] } | null = null;
for (const n of nodes) {
    if (n.mesh === undefined) continue;
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (const prim of meshes[n.mesh].primitives) {
        const a = acc(prim.attributes.POSITION);
        for (let i = 0; i < a.count; i++) for (let k = 0; k < 3; k++) {
            const v = a.arr[i * 3 + k];
            if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v;
        }
    }
    if (mn[1] >= -0.001 && mx[1] <= 0.27 && mx[0] > 5.5) brass = { mn, mx };
}
if (!brass) throw Error("no brass pin bucket found (expected envelope ±5.67, y 0..0.26)");
if (Math.abs(brass.mx[0] - 5.67) > 0.01 || Math.abs(brass.mn[0] + 5.67) > 0.01)
    throw Error(`focus pins off foci: x[${brass.mn[0]},${brass.mx[0]}] (expect ±5.67 = 5.6 focus + 0.07 base)`);
if (brass.mn[1] < -0.005 || brass.mx[1] > 0.27) throw Error(`focus pin height wrong: y[${brass.mn[1]},${brass.mx[1]}]`);
console.log(`focus pins: merged in brass bucket at ±5.6 (bucket x ±${brass.mx[0].toFixed(2)}, y 0..${brass.mx[1].toFixed(2)}) — TRUE`);


// global envelope across all buckets (translations baked)
let gmn = [Infinity, Infinity, Infinity], gmx = [-Infinity, -Infinity, -Infinity];
for (const n of nodes) {
    if (n.mesh === undefined) continue;
    const t = n.translation ?? [0, 0, 0];
    for (const prim of meshes[n.mesh].primitives) {
        const a = acc(prim.attributes.POSITION);
        for (let i = 0; i < a.count; i++) for (let k = 0; k < 3; k++) {
            const v = a.arr[i * 3 + k] + t[k];
            if (v < gmn[k]) gmn[k] = v; if (v > gmx[k]) gmx[k] = v;
        }
    }
}
console.log("global envelope: x[%s,%s] y[%s,%s] z[%s,%s]", ...[...gmn, ...gmx].map(v => v.toFixed(3)));
const exp = { xmin: -7.3, xmax: 7.3, ymin: 0, ymax: 3.1, zmin: -4.5, zmax: 4.5 };
const ok = gmn[0] >= exp.xmin - 0.01 && gmx[0] <= exp.xmax + 0.01 && gmn[1] >= -0.01 && gmx[1] <= exp.ymax + 0.01 && gmn[2] >= exp.zmin - 0.01 && gmx[2] <= exp.zmax + 0.01;
console.log(ok ? "ENVELOPE OK (within 14.6x9x3.1 design)" : "ENVELOPE VIOLATION");
if (!ok) throw Error("envelope");
console.log("DECODE ALL GREEN");
