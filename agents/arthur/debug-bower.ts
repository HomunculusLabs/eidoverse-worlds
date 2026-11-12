// debug-bower.ts — diagnose decode failures (a1)/(b): print worst offenders.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_bower3.glb`);
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8;
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const views = j.bufferViews ?? [];
// replica derivation (same as decode)
const DISK_R = 2.4, R0 = 0.45, R1 = 2.05, TURNS = 2;
const K = Math.log(R1 / R0) / (TURNS * 2 * Math.PI);
const DS = 0.42;
const SPIRAL_L = Math.sqrt(1 + K * K) * (R1 - R0) / K;
type Seed = { x: number; z: number; r: number };
const seeds: Seed[] = [{ x: 0, z: 0, r: 0 }];
{ let s = 0, th = 0; while (s <= SPIRAL_L) { const r = R0 * Math.exp(K * th); seeds.push({ x: r * Math.cos(th), z: r * Math.sin(th), r }); th += DS / (Math.sqrt(1 + K * K) * r); s += DS; } }
const N = seeds.length;
type P2 = [number, number];
function cellOf(i: number): P2[] {
    let poly: P2[] = [];
    for (let k = 0; k < 48; k++) { const a = k * 2 * Math.PI / 48; poly.push([DISK_R * Math.cos(a), DISK_R * Math.sin(a)]); }
    const si = seeds[i];
    for (let jj = 0; jj < N; jj++) {
        if (jj === i) continue;
        const sj = seeds[jj];
        const mx = (si.x + sj.x) / 2, mz = (si.z + sj.z) / 2;
        const dx = si.x - sj.x, dz = si.z - sj.z;
        const out: P2[] = [];
        for (let e = 0; e < poly.length; e++) {
            const cur = poly[e], nxt = poly[(e + 1) % poly.length];
            const dc = (cur[0] - mx) * dx + (cur[1] - mz) * dz;
            const dn = (nxt[0] - mx) * dx + (nxt[1] - mz) * dz;
            if (dc >= 0) out.push(cur);
            if ((dc >= 0) !== (dn >= 0)) { const t = dc / (dc - dn); out.push([cur[0] + (nxt[0] - cur[0]) * t, cur[1] + (nxt[1] - cur[1]) * t]); }
        }
        poly = out;
        if (poly.length < 3) break;
    }
    return poly;
}
const cells: P2[][] = [];
for (let i = 0; i < N; i++) cells.push(cellOf(i));
console.log(`replica N=${N} cells, total verts ${cells.reduce((n, c) => n + c.length, 0)}`);
function bucketVerts(matName: string): number[][] {
    const out: number[][] = [];
    for (const n of j.nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of j.meshes[n.mesh].primitives) {
            if (j.materials[prim.material]?.name !== matName) continue;
            const acc = j.accessors[prim.attributes.POSITION];
            const bv = views[acc.bufferView];
            const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            const t = n.translation ?? [0, 0, 0];
            for (let i = 0; i < acc.count; i++) { const p = BIN + off + i * 12; out.push([bytes.readFloatLE(p) + t[0], bytes.readFloatLE(p + 4) + t[1], bytes.readFloatLE(p + 8) + t[2]]); }
        }
    }
    return out;
}
const stone = bucketVerts("vw_stone");
const dark = bucketVerts("vw_dark");
const TOP = 2.90;
const topVerts = [...new Map(stone.filter(p => Math.abs(p[1] - TOP) < 1e-4).map(p => [`${p[0].toFixed(4)},${p[1].toFixed(4)}`, p])).values()];
console.log(`stone ${stone.length} verts, ${topVerts.length} unique top`);
// worst replica verts
const cand: Array<{ v: P2; cell: number; d: number; near: number[] }> = [];
for (let ci = 0; ci < cells.length; ci++) for (const v of cells[ci]) {
    let best = Infinity, bq: number[] | null = null;
    for (const q of topVerts) { const d = Math.hypot(q[0] - v[0], q[2] - v[1]); if (d < best) { best = d; bq = q; } }
    cand.push({ v, cell: ci, d: best, near: bq! });
}
cand.sort((a, b) => b.d - a.d);
console.log("worst replica→stone (cell, vert, dist, nearest stone):");
for (const c of cand.slice(0, 8)) console.log(`  cell ${c.cell} v(${c.v[0].toFixed(3)},${c.v[1].toFixed(3)}) d=${c.d.toFixed(4)} near stone (${c.near[0].toFixed(3)},${c.near[2].toFixed(3)})`);
// worst dark verts vs edges (any y)
const edges: Array<{ ax: number; az: number; bx: number; bz: number }> = [];
for (const c of cells) for (let k = 0; k < c.length; k++) edges.push({ ax: c[k][0], az: c[k][1], bx: c[(k + 1) % c.length][0], bz: c[(k + 1) % c.length][1] });
const dcand: Array<{ p: number[]; d: number }> = [];
for (const p of dark) {
    let best = Infinity;
    for (const e of edges) {
        const vx = e.bx - e.ax, vz = e.bz - e.az;
        let t = ((p[0] - e.ax) * vx + (p[2] - e.az) * vz) / (vx * vx + vz * vz);
        t = Math.max(0, Math.min(1, t));
        const d = Math.hypot(p[0] - (e.ax + t * vx), p[2] - (e.az + t * vz));
        if (d < best) best = d;
    }
    dcand.push({ p, d: best });
}
dcand.sort((a, b) => b.d - a.d);
console.log("worst dark→edge (plan distance):");
for (const c of dcand.slice(0, 8)) console.log(`  (${c.p[0].toFixed(3)},${c.p[1].toFixed(3)},${c.p[2].toFixed(3)}) d=${c.d.toFixed(4)}`);
// dark y histogram
const ys = [...new Set(dark.map(p => +p[1].toFixed(3)))].sort((a, b) => a - b);
console.log(`dark distinct y values (${ys.length}): ${ys.map(y => y.toFixed(3)).join(", ")}`);
