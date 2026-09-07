// dress75-decode.ts — decode village_dress_ne_anvilpad1.glb: named nodes +
// per-node world bbox (dress4-decode chassis). Node index == mesh index here
// (one mesh per merged bucket, translation all zero).
import { readFileSync } from "node:fs";
const b = readFileSync("agents/arthur/assets/village_dress_ne_anvilpad1.glb");
const jsonLen = Number(new DataView(b.buffer, b.byteOffset + 12, 4).getUint32(0, true));
const BIN = 20 + jsonLen + 8;
const j = JSON.parse(new TextDecoder().decode(b.subarray(20, 20 + jsonLen)));
const acc = (i: number) => {
    const a = j.accessors[i];
    const bv = j.bufferViews[a.bufferView];
    const off = BIN + (bv.byteOffset || 0) + (a.byteOffset || 0);
    const dv = new DataView(b.buffer, b.byteOffset + off, a.count * 12);
    const out: number[][] = [];
    for (let k = 0; k < a.count; k++) out.push([dv.getFloat32(k * 12, true), dv.getFloat32(k * 12 + 4, true), dv.getFloat32(k * 12 + 8, true)]);
    return out;
};
let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
const stack: Array<[number, number[]]> = j.scenes[0].nodes.map((n: number) => [n, [0, 0, 0]]);
const named: string[] = [];
while (stack.length) {
    const [ni, tr] = stack.pop()!;
    const n = j.nodes[ni];
    const t = n.translation ? [tr[0] + n.translation[0], tr[1] + n.translation[1], tr[2] + n.translation[2]] : tr;
    if (n.name) named.push(n.name);
    if (n.mesh !== undefined) {
        for (const prim of j.meshes[n.mesh].primitives) {
            const vs = acc(prim.attributes.POSITION);
            let nmn = [1e9, 1e9, 1e9], nmx = [-1e9, -1e9, -1e9];
            for (const v of vs) for (let a = 0; a < 3; a++) { if (v[a] + t[a] < nmn[a]) nmn[a] = v[a] + t[a]; if (v[a] + t[a] > nmx[a]) nmx[a] = v[a] + t[a]; }
            console.log(`${n.name}: n=${vs.length} min=(${nmn.map(x => x.toFixed(3)).join(",")}) max=(${nmx.map(x => x.toFixed(3)).join(",")})`);
            for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], nmn[a]); mx[a] = Math.max(mx[a], nmx[a]); }
        }
    }
    for (const c of n.children || []) stack.push([c, t]);
}
console.log("NAMED", named.join(" "));
console.log("BBOX min", mn.map(x => x.toFixed(3)).join(","), "max", mx.map(x => x.toFixed(3)).join(","));
console.log("center x", ((mn[0] + mx[0]) / 2).toFixed(3), "z", ((mn[2] + mx[2]) / 2).toFixed(3), "| half x", ((mx[0] - mn[0]) / 2).toFixed(3), "z", ((mx[2] - mn[2]) / 2).toFixed(3), "| top y", mx[1].toFixed(3));
