// artwalk51-stable-decode.ts — decode village_stable3.glb (improve-12 rebuild,
// live 98f2d5b6) at the b8 rider band: host-local anchor (0, 2.22, -2.16),
// rider bbox 4.900 x 0.420 x 0.153. Questions: does new host geometry intrude
// into the rider band, and does the open-front lintel still exist at z ~ -2.16?
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const b = readFileSync("agents/arthur/assets/village_stable3.glb");
const sha = createHash("sha256").update(b).digest("hex");
console.log("host sha256", sha, "(live lib store/98f2d5b6e1b6c429.glb)");
const jsonLen = Number(new DataView(b.buffer, b.byteOffset + 12, 4).getUint32(0, true));
const j = JSON.parse(new TextDecoder().decode(b.subarray(20, 20 + jsonLen)));
const BIN = 20 + jsonLen + 8;
const acc = (i: number) => {
    const a = j.accessors[i]; const bv = j.bufferViews[a.bufferView];
    const off = BIN + (bv.byteOffset || 0) + (a.byteOffset || 0);
    const dv = new DataView(b.buffer, b.byteOffset + off, a.count * 12);
    const out: number[][] = [];
    for (let k = 0; k < a.count; k++) out.push([dv.getFloat32(k * 12, true), dv.getFloat32(k * 12 + 4, true), dv.getFloat32(k * 12 + 8, true)]);
    return out;
};
// rider band (host-local): anchor z -2.16, half-depth 0.0765 + margin 0.05;
// x half-span 2.45 + margin; y 2.22 +/- 0.21 + margin -> generous 2.0..2.65
const BAND = { min: [-2.55, 2.0, -2.29], max: [2.55, 2.65, -2.03] };
const inBand = (v: number[]) =>
    v[0] >= BAND.min[0] && v[0] <= BAND.max[0] && v[1] >= BAND.min[1] && v[1] <= BAND.max[1] && v[2] >= BAND.min[2] && v[2] <= BAND.max[2];
interface NodeBB { name: string; path: string; min: number[]; max: number[]; verts: number; hits: number }
const nodes: NodeBB[] = [];
const stack: Array<[number, number[], string]> = j.scenes[0].nodes.map((n: number) => [n, [0, 0, 0], ""]);
while (stack.length) {
    const [ni, tr, path] = stack.pop()!;
    const n = j.nodes[ni];
    const t = n.translation ? [tr[0] + n.translation[0], tr[1] + n.translation[1], tr[2] + n.translation[2]] : tr;
    const nm = n.name ? (path ? path + "/" + n.name : n.name) : path;
    if (n.mesh !== undefined) {
        let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], vc = 0, hits = 0;
        for (const prim of j.meshes[n.mesh].primitives) {
            const vs = acc(prim.attributes.POSITION); vc += vs.length;
            for (const v of vs) {
                const w = [v[0] + t[0], v[1] + t[1], v[2] + t[2]];
                for (let a = 0; a < 3; a++) { if (w[a] < mn[a]) mn[a] = w[a]; if (w[a] > mx[a]) mx[a] = w[a]; }
                if (inBand(w)) hits++;
            }
        }
        nodes.push({ name: n.name || `mesh${n.mesh}`, path: nm, min: mn, max: mx, verts: vc, hits });
    }
    for (const c of n.children ?? []) stack.push([c, t, nm]);
}
console.log("total mesh nodes:", nodes.length, "total verts:", nodes.reduce((s, n) => s + n.verts, 0));
let g = [1e9, 1e9, 1e9], gm = [-1e9, -1e9, -1e9];
for (const n of nodes) for (let a = 0; a < 3; a++) { if (n.min[a] < g[a]) g[a] = n.min[a]; if (n.max[a] > gm[a]) gm[a] = n.max[a]; }
console.log("host bbox min", g.map(v => +v.toFixed(3)), "max", gm.map(v => +v.toFixed(3)));
console.log("--- BAND HITS (intrusion into rider volume) ---");
let any = false;
for (const n of nodes) if (n.hits) { any = true; console.log(`HIT: ${n.path} verts-in-band=${n.hits} node bbox [${n.min.map(v => +v.toFixed(2))}] [${n.max.map(v => +v.toFixed(2))}]`); }
if (!any) console.log("NONE — rider volume clear of new host geometry");
console.log("--- open-front slab z in [-2.35, -1.95] (lintel existence) ---");
for (const n of nodes) if (n.max[2] >= -2.35 && n.min[2] <= -1.95 && n.max[1] >= 1.9)
    console.log(`${n.path} bbox [${n.min.map(v => +v.toFixed(2))}] [${n.max.map(v => +v.toFixed(2))}] verts=${n.verts}`);
