// dress4-decode.ts — decode village_dress_sw_gravel1.glb: named nodes + world bbox
import { readFileSync } from "node:fs";
const b = readFileSync("agents/arthur/assets/village_dress_sw_gravel1.glb");
const dv12 = new DataView(b.buffer, b.byteOffset + 12, 4);
const jsonLen = Number(dv12.getUint32(0, true));
const binLen = Number(new DataView(b.buffer, b.byteOffset + 20 + jsonLen, 4).getUint32(0, true));
const BIN = 20 + jsonLen + 8; // byte offset of BIN data within the GLB
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
            for (const v of vs) for (let a = 0; a < 3; a++) { if (v[a] + t[a] < mn[a]) mn[a] = v[a] + t[a]; if (v[a] + t[a] > mx[a]) mx[a] = v[a] + t[a]; }
        }
    }
    for (const c of n.children ?? []) stack.push([c, t]);
}
console.log("bin chunk len", binLen, "named nodes:", JSON.stringify(named), "count", named.length);
console.log("world bbox min", mn.map(v => +v.toFixed(3)), "max", mx.map(v => +v.toFixed(3)));
console.log("y-extent", (mx[1] - mn[1]).toFixed(3), "— ground film (<=0.5):", (mx[1] - mn[1]) <= 0.5);
