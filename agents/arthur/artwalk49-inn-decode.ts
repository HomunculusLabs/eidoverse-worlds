// artwalk49-inn-decode.ts — decode village_inn3.glb (improve-7 rebuild, live 6e6ff2d0)
// at the b2 rider bands: lintel (0,2.78,3.03)+bbox, threshold (0,0.198,2.95)+bbox.
// Question: does new host geometry intrude into either rider band, and does the
// mounting wall/threshold plane still exist at the same z?
import { readFileSync } from "node:fs";
const b = readFileSync("agents/arthur/assets/village_inn3.glb");
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
// rider bands (host-local)
const LINT = { min: [-1.175, 2.5, 2.945], max: [1.175, 3.06, 3.15] };      // lintel + small margin
const THR  = { min: [-0.83, 0.198, 2.77], max: [0.83, 0.25, 3.13] };       // threshold plate
const inBand = (v: number[], bd: { min: number[]; max: number[] }) =>
    v[0] >= bd.min[0] && v[0] <= bd.max[0] && v[1] >= bd.min[1] && v[1] <= bd.max[1] && v[2] >= bd.min[2] && v[2] <= bd.max[2];
interface NodeBB { name: string; path: string; min: number[]; max: number[]; verts: number }
const nodes: NodeBB[] = [];
const stack: Array<[number, number[], string]> = j.scenes[0].nodes.map((n: number) => [n, [0, 0, 0], ""]);
while (stack.length) {
    const [ni, tr, path] = stack.pop()!;
    const n = j.nodes[ni];
    const t = n.translation ? [tr[0] + n.translation[0], tr[1] + n.translation[1], tr[2] + n.translation[2]] : tr;
    const nm = n.name ? (path ? path + "/" + n.name : n.name) : path;
    if (n.mesh !== undefined) {
        let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], vc = 0;
        let lintHits = 0, thrHits = 0;
        for (const prim of j.meshes[n.mesh].primitives) {
            const vs = acc(prim.attributes.POSITION); vc += vs.length;
            for (const v of vs) {
                const w = [v[0] + t[0], v[1] + t[1], v[2] + t[2]];
                for (let a = 0; a < 3; a++) { if (w[a] < mn[a]) mn[a] = w[a]; if (w[a] > mx[a]) mx[a] = w[a]; }
                if (inBand(w, LINT)) lintHits++;
                if (inBand(w, THR)) thrHits++;
            }
        }
        nodes.push({ name: n.name || `mesh${n.mesh}`, path: nm, min: mn, max: mx, verts: vc });
        if (lintHits || thrHits) console.log(`BAND HIT: ${nm} lintel=${lintHits} threshold=${thrHits} verts`);
    }
    for (const c of n.children ?? []) stack.push([c, t, nm]);
}
console.log("total mesh nodes:", nodes.length, "total verts:", nodes.reduce((s, n) => s + n.verts, 0));
let g = [1e9, 1e9, 1e9], gm = [-1e9, -1e9, -1e9];
for (const n of nodes) for (let a = 0; a < 3; a++) { if (n.min[a] < g[a]) g[a] = n.min[a]; if (n.max[a] > gm[a]) gm[a] = n.max[a]; }
console.log("world bbox min", g.map(v => +v.toFixed(3)), "max", gm.map(v => +v.toFixed(3)));
// front-wall geometry near z +2.8..3.2: list nodes whose bbox intersects that slab
console.log("--- nodes intersecting front slab z in [2.8, 3.2] ---");
for (const n of nodes) if (n.max[2] >= 2.8 && n.min[2] <= 3.2)
    console.log(`${n.path} bbox [${n.min.map(v => +v.toFixed(2))}] [${n.max.map(v => +v.toFixed(2))}] verts=${n.verts}`);
// named KEEP/light anchors
console.log("--- named nodes ---");
for (const n of nodes) if (/[a-zA-Z]/.test(n.name) && /lamp|flame|fire|glow|light|ember/i.test(n.name))
    console.log(`${n.path} bbox [${n.min.map(v => +v.toFixed(2))}] [${n.max.map(v => +v.toFixed(2))}]`);
