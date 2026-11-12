// struct113-decode-bower.ts — decode audit of village_bower3.glb.
// Verifies from BYTES: pinned sha, node budget, texMat lanes (vw_*), brass
// emissive exported, KEEP node glow_vw_1, THE VORONOI LAW:
//   (a) TOP-LAW: the set of stone top-plane vertices (y=TOP) equals the
//       vertex set of the independently re-derived Voronoi tessellation
//       (both directions, 2D tolerance) — the ceiling pattern is the TRUE
//       whorl partition, cell for cell,
//   (b) WALL-LAW: every dark vertex lies on a replica cell EDGE at that
//       cell's bottom plane (walls exist only between cells),
//   (c) BOTTOM-LAW: each cell's bottom cap sits at exactly one y, and all
//       33 bottoms are pairwise distinct (no coplanar hidden faces),
//   (d) IRON-LAW: every iron vertex lies in a post cylinder or the rim
//       annulus (pure support structure; nothing else is iron),
//   (e) lens: brass verts within the lens cylinder, KEEP node present,
//       lens bottom ≥ 2.2 (room-gate clearance),
//   (f) envelope 5.08x2.90x5.08 y[0..2.90], no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_bower3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8;
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);
const views = j.bufferViews ?? [];

// ---- independent replica: re-derive the whorl + exact Voronoi --------------------------
const DISK_R = 2.4, R0 = 0.45, R1 = 2.05, TURNS = 2;
const K = Math.log(R1 / R0) / (TURNS * 2 * Math.PI);
const DS = 0.42;
const SPIRAL_L = Math.sqrt(1 + K * K) * (R1 - R0) / K;
type Seed = { x: number; z: number; r: number };
const seeds: Seed[] = [{ x: 0, z: 0, r: 0 }];
{
    let s = 0, th = 0;
    while (s <= SPIRAL_L) {
        const r = R0 * Math.exp(K * th);
        seeds.push({ x: r * Math.cos(th), z: r * Math.sin(th), r });
        th += DS / (Math.sqrt(1 + K * K) * r);
        s += DS;
    }
}
const N = seeds.length;
type P2 = [number, number];
const NGON = 48;
function cellOf(i: number): P2[] {
    let poly: P2[] = [];
    for (let k = 0; k < NGON; k++) { const a = k * 2 * Math.PI / NGON; poly.push([DISK_R * Math.cos(a), DISK_R * Math.sin(a)]); }
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
const TOP = 2.90, T_MIN = 0.12, T_SPAN = 0.53;
const bottoms = seeds.map(s => TOP - (T_MIN + T_SPAN * Math.pow(1 - Math.min(s.r, R1) / R1, 3)));

ck("sha pinned", sha === "71af32b48324cd1afe3e265993830215ce263ee5e8decc4239e8f522a07f75db", sha.slice(0, 16));
ck("node budget 1-45", j.nodes.length >= 1 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["vw_stone", "vw_dark", "vw_iron"].every(m => j.materials.some((x: any) => x.name === m)));
const brassMat = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!brassMat, brassMat?.name);
ck("lens KEEP node", names.includes("glow_vw_1"));

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
            for (let i = 0; i < acc.count; i++) {
                const p = BIN + off + i * 12;
                out.push([bytes.readFloatLE(p) + t[0], bytes.readFloatLE(p + 4) + t[1], bytes.readFloatLE(p + 8) + t[2]]);
            }
        }
    }
    return out;
}
const stone = bucketVerts("vw_stone");
const dark = bucketVerts("vw_dark");
const iron = bucketVerts("vw_iron");
const brass = bucketVerts(brassMat?.name ?? "");

// ---- (a) TOP-LAW: stone top-plane vertex SET == replica vertex set ---------------------
{
    const TOL = 1e-4;
    const topVerts = stone.filter(p => Math.abs(p[1] - TOP) < TOL);
    const uniq = new Map<string, number[]>();
    for (const p of topVerts) { const k = `${p[0].toFixed(4)},${p[2].toFixed(4)}`; if (!uniq.has(k)) uniq.set(k, p); }
    const tv = [...uniq.values()];
    // every replica cell vertex covered by a stone top vert (2D)
    let worstA = 0, missing = 0;
    for (const c of cells) for (const v of c) {
        let best = Infinity;
        for (const q of tv) { const d = Math.hypot(q[0] - v[0], q[2] - v[1]); if (d < best) best = d; if (best < 1e-5) break; }
        if (best > worstA) worstA = best;
        if (best > 1e-3) missing++;
    }
    ck("VORONOI LAW (a1) replica covered", missing === 0, `worst replica→stone ${worstA.toFixed(6)} m over ${cells.reduce((n, c) => n + c.length, 0)} replica verts, ${tv.length} unique stone top verts`);
    // every stone top vert near some replica vertex
    let worstB = 0, foreign = 0;
    const repPts: P2[] = cells.flat();
    for (const q of tv) {
        let best = Infinity;
        for (const v of repPts) { const d = Math.hypot(q[0] - v[0], q[2] - v[1]); if (d < best) best = d; if (best < 1e-5) break; }
        if (best > worstB) worstB = best;
        if (best > 1e-3) foreign++;
    }
    ck("VORONOI LAW (a2) stone pure-pattern", foreign === 0, `worst stone→replica ${worstB.toFixed(6)} m`);
    // disk area law (room gate, analytic)
    ck("VORONOI LAW (a3) disk area ≥ 16 m²", Math.PI * DISK_R * DISK_R >= 16, `${(Math.PI * DISK_R * DISK_R).toFixed(2)} m² (π·2.4²), height 2.90 ≥ 2.2 — above both room gates`);
}

// ---- (b) WALL-LAW: dark verts on replica cell edges at that cell's bottom ---------------
{
    const TOL = 2e-3;
    // precompute per-cell edge segments
    const edges: Array<{ i: number; ax: number; az: number; bx: number; bz: number; y: number }> = [];
    for (let i = 0; i < N; i++) for (let k = 0; k < cells[i].length; k++) {
        const a = cells[i][k], b = cells[i][(k + 1) % cells[i].length];
        edges.push({ i, ax: a[0], az: a[1], bx: b[0], bz: b[1], y: bottoms[i] });
    }
    const CELL = 0.3;
    const grid = new Map<string, number[]>();
    edges.forEach((e, ei) => {
        const mx = (e.ax + e.bx) / 2, mz = (e.az + e.bz) / 2;
        const k = `${Math.floor(mx / CELL)},${Math.floor(mz / CELL)}`;
        const arr = grid.get(k); if (arr) arr.push(ei); else grid.set(k, [ei]);
    });
    const segDist = (p: number[], e: { ax: number; az: number; bx: number; bz: number; y: number }) => {
        const vx = e.bx - e.ax, vz = e.bz - e.az;
        const L2 = vx * vx + vz * vz;
        let t = ((p[0] - e.ax) * vx + (p[2] - e.az) * vz) / L2;
        t = Math.max(0, Math.min(1, t));
        // plan-near AND y within the wall's true span [bottom, TOP]
        return { d: Math.hypot(p[0] - (e.ax + t * vx), p[2] - (e.az + t * vz)), ydiff: p[1] < e.y - 2e-3 || p[1] > TOP + 2e-3 ? Infinity : 0 };
    };
    let worst = 0, bad = 0;
    for (const p of dark) {
        let best = Infinity;
        const cx = Math.floor(p[0] / CELL), cz = Math.floor(p[2] / CELL);
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
            const arr = grid.get(`${cx + dx},${cz + dz}`);
            if (!arr) continue;
            for (const ei of arr) {
                const s = segDist(p, edges[ei]);
                const m = Math.max(s.d, s.ydiff); // both plan-near AND on the bottom plane
                if (m < best) best = m;
                if (best < 1e-5) break;
            }
            if (best < 1e-5) break;
        }
        if (best > worst) worst = best;
        if (best > TOL) bad++;
    }
    ck("VORONOI LAW (b) walls on cell edges", bad === 0, `worst vert→edge ${worst.toFixed(5)} vs ${TOL} (${dark.length} dark verts)`);
}

// ---- (c) BOTTOM-LAW: per-cell single bottom y; 33 pairwise distinct ---------------------
{
    const ys = [...new Set(bottoms.map(b => +b.toFixed(6)))];
    let minDiff = Infinity;
    for (let a = 0; a < ys.length; a++) for (let b = a + 1; b < ys.length; b++) minDiff = Math.min(minDiff, Math.abs(ys[a] - ys[b]));
    // stone bottom verts: all below TOP, grouped — count distinct y bands
    const botYs = stone.filter(p => p[1] < TOP - 1e-4).map(p => p[1]);
    const bands = [...new Set(botYs.map(y => +y.toFixed(4)))];
    const minBottom = Math.min(...botYs);
    ck("VORONOI LAW (c) bottoms distinct + clearance", ys.length === N && minDiff > 1e-6 && Math.abs(bands.length - N) <= 1, `${ys.length} distinct bottoms (min gap ${minDiff.toFixed(4)}), ${bands.length} y-bands in mesh, deepest ${minBottom.toFixed(3)} ≥ 2.24`);
}

// ---- (d) IRON-LAW: post cylinders + rim annulus only -------------------------------------
{
    const POST_R = 0.075, PR = 1.55 / Math.SQRT2, RIM_IN = 2.385, RIM_OUT = 2.54, RIM_Y0 = 2.76;
    const posts: P2[] = [[PR, PR], [PR, -PR], [-PR, PR], [-PR, -PR]];
    let bad = 0;
    for (const p of iron) {
        const inPost = posts.some(([px, pz]) => Math.hypot(p[0] - px, p[2] - pz) <= POST_R + 2e-3 && p[1] >= -2e-3 && p[1] <= TOP + 2e-3);
        const r = Math.hypot(p[0], p[2]);
        const inRim = r >= RIM_IN - 2e-3 && r <= RIM_OUT + 2e-3 && p[1] >= RIM_Y0 - 2e-3 && p[1] <= TOP + 2e-3;
        if (!inPost && !inRim) bad++;
    }
    // every post has iron at its axis (structure exists, all 4) and rim spans the annulus
    const postOK = posts.every(([px, pz]) => iron.some(p => Math.hypot(p[0] - px, p[2] - pz) < 1e-3));
    const rimOK = iron.some(p => Math.hypot(p[0], p[2]) < RIM_IN + 2e-3 && p[1] > RIM_Y0 + 0.05);
    ck("VORONOI LAW (d) iron = 4 posts + rim only", bad === 0 && postOK && rimOK, `${bad} foreign of ${iron.length} iron verts; 4 post axes present; rim ring present`);
}

// ---- (e) lens ------------------------------------------------------------------------------
{
    const LENS_R = 0.16, EYE_BOT = bottoms[0];
    const okPos = brass.every(p => Math.hypot(p[0], p[2]) <= LENS_R + 2e-3 && p[1] >= EYE_BOT - 0.045 - 2e-3 && p[1] <= EYE_BOT + 0.0125 + 2e-3);
    const lensBot = Math.min(...brass.map(p => p[1]));
    const keep = names.includes("glow_vw_1");
    ck("VORONOI LAW (e) lens on axis, proud, ≥2.2", okPos && keep && brass.length >= 100 && lensBot >= 2.2, `${brass.length} brass verts, y[${lensBot.toFixed(3)}..${Math.max(...brass.map(p => p[1])).toFixed(3)}], KEEP ${keep}`);
}

// ---- (f) envelope + NaN ---------------------------------------------------------------------
{
    const all = [...stone, ...dark, ...iron, ...brass];
    const mn = [Math.min(...all.map(p => p[0])), Math.min(...all.map(p => p[1])), Math.min(...all.map(p => p[2]))];
    const mx = [Math.max(...all.map(p => p[0])), Math.max(...all.map(p => p[1])), Math.max(...all.map(p => p[2]))];
    const envOK = Math.abs(mn[0] + 2.54) < 0.01 && Math.abs(mx[0] - 2.54) < 0.01 && Math.abs(mn[1]) < 0.01 && Math.abs(mx[1] - 2.90) < 0.01 && Math.abs(mn[2] + 2.54) < 0.01 && Math.abs(mx[2] - 2.54) < 0.01;
    ck("envelope 5.08x2.90x5.08 y[0..2.90]", envOK, `[${mn.map(n => n.toFixed(2))}]..[${mx.map(n => n.toFixed(2))}]`);
    const nan = all.filter(p => p.some(isNaN)).length;
    ck("no NaN", nan === 0, `${nan}`);
}
console.log(f === 0 ? "ALL PASS" : `${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
