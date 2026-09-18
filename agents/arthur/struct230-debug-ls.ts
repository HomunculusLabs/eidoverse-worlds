// struct230-debug-ls.ts — why did the LS-ring templates die? Standalone (probes
// execute on import). Re-parses the STL, rebuilds LOOPS/V2F, runs ONE ring
// config through solveLS + altProject with a drift trajectory print.
import { readFileSync, existsSync } from "node:fs";

type V3 = [number, number, number];
type Tri = [number, number, number];

const STL_PATH = existsSync("/tmp/szilassi.stl") ? "/tmp/szilassi.stl"
    : new URL("./assets/szilassi-source.stl", import.meta.url).pathname;
const stl = readFileSync(STL_PATH);
const FACET_N = stl.readUInt32LE(80);
const oVerts: V3[] = [];
const vid = new Map<string, number>();
const facets: { tri: Tri }[] = [];
{
    let off = 84;
    for (let f = 0; f < FACET_N; f++) {
        const idx: number[] = [];
        for (let v = 0; v < 3; v++) {
            const base = off + 12 + v * 12;
            const pt: V3 = [stl.readFloatLE(base), stl.readFloatLE(base + 8), -stl.readFloatLE(base + 4)];
            const key = pt.map((c) => c.toFixed(5)).join(",");
            if (!vid.has(key)) { vid.set(key, oVerts.length); oVerts.push(pt); }
            idx.push(vid.get(key)!);
        }
        facets.push({ tri: [idx[0], idx[1], idx[2]] });
        off += 50;
    }
}
function triNormal(tri: Tri): V3 {
    const A = oVerts[tri[0]], B = oVerts[tri[1]], C = oVerts[tri[2]];
    const u: V3 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w: V3 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const n: V3 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0] / l, n[1] / l, n[2] / l];
}
function triCentroid(tri: Tri): V3 {
    const A = oVerts[tri[0]], B = oVerts[tri[1]], C = oVerts[tri[2]];
    return [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3];
}
const groups: { tris: number[]; n: V3; d: number }[] = [];
{
    const ANG = Math.cos((0.5 * Math.PI) / 180);
    for (let fi = 0; fi < facets.length; fi++) {
        const n = triNormal(facets[fi].tri), c = triCentroid(facets[fi].tri);
        const d = n[0] * c[0] + n[1] * c[1] + n[2] * c[2];
        let hit = -1;
        for (let g = 0; g < groups.length; g++) {
            const dot = n[0] * groups[g].n[0] + n[1] * groups[g].n[1] + n[2] * groups[g].n[2];
            const dd = groups[g].n[0] * c[0] + groups[g].n[1] * c[1] + groups[g].n[2] * c[2] - groups[g].d;
            if (Math.abs(dot) > ANG && Math.abs(dd) < 1e-3) { hit = g; break; }
        }
        if (hit < 0) groups.push({ tris: [fi], n, d });
        else groups[hit].tris.push(fi);
    }
}
function boundaryLoop(tris: number[]): number[] {
    const cnt = new Map<string, [number, number]>();
    for (const fi of tris) {
        const t = facets[fi].tri;
        for (const [i, j] of [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]] as [number, number][]) {
            const k = i < j ? `${i}-${j}` : `${j}-${i}`;
            if (cnt.has(k)) cnt.delete(k); else cnt.set(k, [i, j]);
        }
    }
    const adjOf = new Map<number, number[]>();
    for (const [a, b] of [...cnt.values()]) {
        if (!adjOf.has(a)) adjOf.set(a, []);
        if (!adjOf.has(b)) adjOf.set(b, []);
        adjOf.get(a)!.push(b);
        adjOf.get(b)!.push(a);
    }
    const edges = [...cnt.values()];
    const start = edges[0][0];
    const loop: number[] = [];
    let prev = -1, cur = start;
    do {
        loop.push(cur);
        const nbrs = adjOf.get(cur)!;
        const nxt = nbrs.length === 1 ? nbrs[0] : (nbrs[0] !== prev ? nbrs[0] : nbrs[1]);
        prev = cur; cur = nxt;
    } while (cur !== start && loop.length <= 8);
    return loop;
}
const LOOPS: number[][] = groups.map((g) => boundaryLoop(g.tris));
const V2F: number[][] = oVerts.map(() => []);
for (let fi = 0; fi < LOOPS.length; fi++) for (const v of LOOPS[fi]) V2F[v].push(fi);

const nOf = (p: number[]): V3 => {
    const s = Math.sin(p[1]);
    return [s * Math.cos(p[0]), Math.cos(p[1]), s * Math.sin(p[0])];
};
function vertsFromPlanes(params: number[]): V3[] | null {
    const out: V3[] = [];
    for (let i = 0; i < 14; i++) {
        const [fa, fb, fc] = V2F[i];
        const pa = params.slice(fa * 3, fa * 3 + 3), pb = params.slice(fb * 3, fb * 3 + 3), pc = params.slice(fc * 3, fc * 3 + 3);
        const na = nOf(pa), nb = nOf(pb), nc = nOf(pc);
        const detM = (a: V3, b: V3, c: V3) =>
            a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
        const det = detM(na, nb, nc);
        if (Math.abs(det) < 1e-6) return null;
        const D: V3 = [pa[2], pb[2], pc[2]];
        const N: V3[] = [na, nb, nc];
        const comps: V3 = [0, 0, 0];
        for (let ax = 0; ax < 3; ax++) {
            const M = N.map((n, r) => { const m = [...n] as V3; m[ax] = D[r]; return m; });
            comps[ax] = detM(M[0], M[1], M[2]) / det;
        }
        out.push([comps[0], comps[1], comps[2]]);
    }
    return out;
}
function fitPlanes(verts: V3[]): number[] {
    const params: number[] = [];
    for (const L of LOOPS) {
        const c: V3 = [0, 0, 0];
        for (const i of L) { c[0] += verts[i][0] / 6; c[1] += verts[i][1] / 6; c[2] += verts[i][2] / 6; }
        const nw: V3 = [0, 0, 0];
        for (let i = 0; i < 6; i++) {
            const a = verts[L[i]], b = verts[L[(i + 1) % 6]];
            nw[0] += (a[1] - b[1]) * (a[2] + b[2]);
            nw[1] += (a[2] - b[2]) * (a[0] + b[0]);
            nw[2] += (a[0] - b[0]) * (a[1] + b[1]);
        }
        const l = Math.hypot(nw[0], nw[1], nw[2]);
        if (l < 1e-9) return [];
        const n: V3 = [nw[0] / l, nw[1] / l, nw[2] / l];
        params.push(Math.atan2(n[2], n[0]), Math.acos(Math.max(-1, Math.min(1, n[1]))), n[0] * c[0] + n[1] * c[1] + n[2] * c[2]);
    }
    return params;
}

// template + isomorphism (verbatim)
const THETA = (i: number) => (2 * Math.PI * i) / 7;
const PFACES: number[][] = [];
for (let i = 0; i < 7; i++) {
    PFACES.push([i, (i + 1) % 7, (i + 3) % 7]);
    PFACES.push([i, (i + 2) % 7, (i + 3) % 7]);
}
const TMPL_V2F: number[][] = PFACES.map((t) => [...t]);
const stlLabel = (a: number, b: number): number => V2F[a].filter((f) => V2F[b].includes(f)).length;
const tmplLabel = (a: number, b: number): number => TMPL_V2F[a].filter((f) => TMPL_V2F[b].includes(f)).length;
const ISO: number[] | null = (() => {
    const assign = new Array(14).fill(-1);
    const used = new Array(14).fill(false);
    const go = (idx: number): number[] | null => {
        if (idx === 14) return [...assign];
        for (let phi = 0; phi < 14; phi++) {
            if (used[phi]) continue;
            let ok = true;
            for (let j = 0; j < idx && ok; j++)
                if (stlLabel(idx, j) !== tmplLabel(phi, assign[j])) ok = false;
            if (!ok) continue;
            assign[idx] = phi; used[phi] = true;
            const r = go(idx + 1);
            if (r) return r;
            assign[idx] = -1; used[phi] = false;
        }
        return null;
    };
    return go(0);
})();
if (!ISO) throw Error("no isomorphism");

function solveLS(Ct: V3[]): V3[] | null {
    const ATA: number[][] = Array.from({ length: 7 }, () => Array(7).fill(0));
    const ATC: number[][] = Array.from({ length: 7 }, () => [0, 0, 0]);
    for (let phi = 0; phi < 14; phi++) {
        const t = PFACES[phi];
        for (const a of t) for (const b of t) { ATA[a][b] += 1 / 9; ATC[a][0] += Ct[phi][0] / 3; ATC[a][1] += Ct[phi][1] / 3; ATC[a][2] += Ct[phi][2] / 3; }
    }
    const P: V3[] = Array.from({ length: 7 }, () => [0, 0, 0]);
    for (let ax = 0; ax < 3; ax++) {
        const M = ATA.map((r, i) => [...r, ATC[i][ax]]);
        for (let col = 0; col < 7; col++) {
            let piv = col;
            for (let r = col + 1; r < 7; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
            [M[col], M[piv]] = [M[piv], M[col]];
            if (Math.abs(M[col][col]) < 1e-12) return null;
            for (let r = col + 1; r < 7; r++) {
                const f = M[r][col] / M[col][col];
                for (let c = col; c <= 7; c++) M[r][c] -= f * M[col][c];
            }
        }
        for (let r = 6; r >= 0; r--) {
            let s = M[r][7];
            for (let c = r + 1; c < 7; c++) s -= M[r][c] * P[c][ax];
            P[r][ax] = s / M[r][r];
        }
    }
    return PFACES.map((t) => [
        (P[t[0]][0] + P[t[1]][0] + P[t[2]][0]) / 3,
        (P[t[0]][1] + P[t[1]][1] + P[t[2]][1]) / 3,
        (P[t[0]][2] + P[t[1]][2] + P[t[2]][2]) / 3] as V3);
}

// one ring config, full trajectory
const rOut = 1.0, rIn = 0.55, h = 0.42, ph = 0;
const Ct: V3[] = [];
for (let i = 0; i < 7; i++) {
    const th = THETA(i) + ph;
    Ct.push([rOut * Math.cos(th), h, rOut * Math.sin(th)]);
    Ct.push([rIn * Math.cos(th + Math.PI / 7), -h, rIn * Math.sin(th + Math.PI / 7)]);
}
const dual = solveLS(Ct)!;
// dual is in TEMPLATE indexing (phi); map to STL indexing via ISO inverse
const invISO = new Array(14).fill(-1);
ISO.forEach((phi, k) => { invISO[phi] = k; });
// LS fit quality (template frame): dual centroids vs targets
let err = 0;
for (let phi = 0; phi < 14; phi++) err = Math.max(err, Math.hypot(dual[phi][0] - Ct[phi][0], dual[phi][1] - Ct[phi][1], dual[phi][2] - Ct[phi][2]));
console.log(`LS fit: worst target-vs-dual-centroid distance ${err.toFixed(4)} (normalized)`);

// altProject trajectory from the LS start (STL-indexed start verts)
const start = invISO.map((k) => dual[k] as V3);
{
    let R = 0;
    for (const v of start) R = Math.max(R, Math.hypot(v[0], v[2]));
    let cur = start.map((v) => [v[0] / R, v[1] / R, v[2] / R] as V3);
    for (let it = 0; it < 15; it++) {
        const planes = fitPlanes(cur);
        const V = vertsFromPlanes(planes);
        if (!V) { console.log(`iter ${it}: vertsFromPlanes NULL (degenerate triad)`); break; }
        let mx = 0;
        for (let k = 0; k < 14; k++) mx = Math.max(mx, Math.hypot(V[k][0] - cur[k][0], V[k][1] - cur[k][1], V[k][2] - cur[k][2]));
        // diagnostics: hole proxy = min vertex radius; crossings would need the full fn
        let minR = Infinity, maxR = 0;
        for (const v of V) { const r = Math.hypot(v[0], v[2]); minR = Math.min(minR, r); maxR = Math.max(maxR, r); }
        console.log(`iter ${it}: drift ${mx.toFixed(5)}, min vertex radius ${minR.toFixed(4)}, max ${maxR.toFixed(4)}`);
        cur = V;
        if (mx < 1e-6) break;
    }
}
