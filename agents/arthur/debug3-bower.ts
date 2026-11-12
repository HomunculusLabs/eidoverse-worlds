// debug3-bower.ts — identify the 210 off-edge dark verts: are they replica
// cell vertices? mispaired coordinates? dump cells[0] + offender matches.
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
console.log("cells[0] (eye) replica verts:");
for (const v of cells[0]) console.log(`  (${v[0].toFixed(4)}, ${v[1].toFixed(4)})`);
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
const dark = bucketVerts("vw_dark");
const edges: Array<{ ax: number; az: number; bx: number; bz: number }> = [];
for (const c of cells) for (let k = 0; k < c.length; k++) edges.push({ ax: c[k][0], az: c[k][1], bx: c[(k + 1) % c.length][0], bz: c[(k + 1) % c.length][1] });
const planD = (x: number, z: number) => {
    let best = Infinity;
    for (const e of edges) {
        const vx = e.bx - e.ax, vz = e.bz - e.az;
        let t = ((x - e.ax) * vx + (z - e.az) * vz) / (vx * vx + vz * vz);
        t = Math.max(0, Math.min(1, t));
        const d = Math.hypot(x - (e.ax + t * vx), z - (e.az + t * vz));
        if (d < best) best = d;
    }
    return best;
};
const allCellVerts = cells.flat();
const offenders = dark.filter(p => planD(p[0], p[2]) > 2e-3);
console.log(`\noffenders ${offenders.length}; sample analysis:`);
for (const p of offenders.slice(0, 5)) {
    // nearest replica CELL VERTEX (not edge)
    let bestV = Infinity, bv: P2 | null = null;
    for (const v of allCellVerts) { const d = Math.hypot(v[0] - p[0], v[1] - p[2]); if (d < bestV) { bestV = d; bv = v; } }
    // is offender = (some vert .x, other vert .z)?
    let swap = "";
    for (const u of allCellVerts) {
        if (Math.abs(u[0] - p[0]) < 1e-4) {
            for (const w of allCellVerts) if (Math.abs(w[1] - p[2]) < 1e-4) { swap = `(x from (${u[0].toFixed(3)},${u[1].toFixed(3)}), z from (${w[0].toFixed(3)},${w[1].toFixed(3)}))`; break; }
        }
        if (swap) break;
    }
    console.log(`  dark (${p[0].toFixed(4)}, ${p[1].toFixed(3)}, ${p[2].toFixed(4)}) | nearest cell vert ${bestV.toFixed(4)} (${bv![0].toFixed(3)},${bv![1].toFixed(3)}) | xz-swap ${swap || "no match"}`);
}
// count offenders by y-plane
const byY = new Map<number, number>();
for (const p of offenders) { const k = +p[1].toFixed(3); byY.set(k, (byY.get(k) ?? 0) + 1); }
console.log(`offenders by y: ${[...byY.entries()].map(([y, n]) => `${y}:${n}`).join(", ")}`);
// offender count per cell bottom: offenders at y == bottoms[i]?
const bottoms = seeds.map(s => 2.90 - (0.24 + 0.42 * (1 - Math.min(s.r, R1) / R1)));
for (const [y, n] of byY) {
    const ci = bottoms.findIndex(b => Math.abs(b - y) < 1e-3);
    console.log(`  y=${y} n=${n} → cell ${ci}${ci >= 0 ? ` seed r=${seeds[ci].r.toFixed(3)} cellverts=${cells[ci].length}` : " (no cell bottom)"}`);
}
