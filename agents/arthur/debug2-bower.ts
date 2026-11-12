// debug2-bower.ts — corrected diagnosis: proper (x,z) dedup; region dump.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_bower3.glb`);
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8;
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const views = j.bufferViews ?? [];
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
const TOP = 2.90;
// PROPER dedup on (x,z)
const uniq = new Map<string, number[]>();
for (const p of stone.filter(p => Math.abs(p[1] - TOP) < 1e-4)) { const k = `${p[0].toFixed(4)},${p[2].toFixed(4)}`; if (!uniq.has(k)) uniq.set(k, p); }
const tv = [...uniq.values()];
console.log(`stone top verts: ${tv.length} unique on (x,z)`);
// replica coverage, both directions
let worstA = 0, missA = 0;
for (const c of cells) for (const v of c) {
    let best = Infinity;
    for (const q of tv) { const d = Math.hypot(q[0] - v[0], q[2] - v[1]); if (d < best) best = d; }
    if (best > worstA) worstA = best;
    if (best > 1e-3) missA++;
}
let worstB = 0, missB = 0;
for (const q of tv) {
    let best = Infinity;
    for (const c of cells) for (const v of c) { const d = Math.hypot(q[0] - v[0], q[2] - v[1]); if (d < best) best = d; }
    if (best > worstB) worstB = best;
    if (best > 1e-3) missB++;
}
console.log(`replica->stone: worst ${worstA.toFixed(5)} missing ${missA} | stone->replica: worst ${worstB.toFixed(5)} foreign ${missB}`);
// dark vs edges: pure plan distance
const dark = bucketVerts("vw_dark");
const edges: Array<{ ax: number; az: number; bx: number; bz: number }> = [];
for (const c of cells) for (let k = 0; k < c.length; k++) edges.push({ ax: c[k][0], az: c[k][1], bx: c[(k + 1) % c.length][0], bz: c[(k + 1) % c.length][1] });
let worstD = 0, badD = 0;
const offenders: number[][] = [];
for (const p of dark) {
    let best = Infinity;
    for (const e of edges) {
        const vx = e.bx - e.ax, vz = e.bz - e.az;
        let t = ((p[0] - e.ax) * vx + (p[2] - e.az) * vz) / (vx * vx + vz * vz);
        t = Math.max(0, Math.min(1, t));
        const d = Math.hypot(p[0] - (e.ax + t * vx), p[2] - (e.az + t * vz));
        if (d < best) best = d;
    }
    if (best > worstD) worstD = best;
    if (best > 2e-3) { badD++; offenders.push(p); }
}
console.log(`dark->edge plan: worst ${worstD.toFixed(5)} bad ${badD} of ${dark.length}`);
for (const p of offenders.slice(0, 10)) console.log(`  bad dark (${p[0].toFixed(3)},${p[1].toFixed(3)},${p[2].toFixed(3)})`);
// which replica seeds are near the offenders?
for (const p of offenders.slice(0, 3)) {
    const near = seeds.map((s, i) => ({ i, d: Math.hypot(s.x - p[0], s.z - p[2]) })).sort((a, b) => a.d - b.d).slice(0, 3);
    console.log(`  offender (${p[0].toFixed(3)},${p[2].toFixed(3)}) nearest seeds: ${near.map(n => `#${n.i}(${seeds[n.i].x.toFixed(3)},${seeds[n.i].z.toFixed(3)}) d=${n.d.toFixed(3)}`).join(" ")}`);
}
