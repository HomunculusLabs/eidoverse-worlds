// struct230-probe-szilassi-round.ts — STRUCTURES LANE struct-230, Round 11 R11-43
// THE ROUND SZILASSI — path (a) of struct-229's banked register proof, executed:
// a SELF-AUTHORED round realization. The v1 rejection proved the sole public
// realization (CMG Lee STL) cannot present genus 1 from any angle — its hole is
// a crooked tunnel a face spans (400-direction silhouette raycast, zero holes).
// This tick re-authors the REALIZATION itself:
//
//   PARAMETERIZATION: the 7 hexagonal FACES are the parameters (unit normal
//   n_f + offset d_f). Every vertex is the intersection of its 3 incident
//   faces — planarity is EXACT BY CONSTRUCTION, and the topology (7 loops,
//   21 edges, complete face adjacency, degree-3 vertices) is inherited
//   verbatim from the banked STL.
//
//   OBJECTIVE: maximize the through-hole clearance about a VERTICAL axis —
//   min over (vertex distances to axis, triangle distances to axis) — under
//   lawful penalties (vertex separations, triad determinants, dihedral floor,
//   hexagon simplicity, face inradius, extent balance). Coordinate descent
//   + seeded restarts; deterministic (mulberry32, seed 230).
//
// The one idea is UNCHANGED from struct-229: SEVEN CELLS, ALL NEIGHBORS —
// stone membranes (the skin), iron seam rods at all 21 meeting lines, seven
// brass lamps (a lamp in every room), the shared heptagonal dais. What v2
// adds is the DONUT READ: a true vertical through-hole you can see at 18m,
// the Császár's skeleton answering with its dual's ring.
//
// Frame: model y-up; hole axis = +y by construction. World-local = final
// (root identity, struct-188).
//
// Laws (conchoid law struct-190 — all must PASS, exit 1 otherwise):
//   P0  parse: 14 verts / 28 facets / 7 planar groups of 4 (topology source).
//   T1  Euler 14−21+7 = 0 (genus 1).
//   T2  COMPLETE FACE ADJACENCY: all 21 pairs share exactly one edge.
//   T3  Hexagonal faces: 6-cycles, SIMPLE polygons (no self-crossing).
//   T4  Manifold: every edge on exactly 2 faces.
//   T5  Duality: all vertex degrees 3.
//   T6  Minimality: 7 faces (Szilassi 1977).
//   T7  Non-convexity: dihedral spread + floor (no degenerate folds).
//   T8  SEAT + HOLE: verts embedded in plinth top, lamps proud — AND the
//       HOLE-COLUMN law: a vertical ray grid over the central disc (r =
//       0.8 × clearance) intersects ZERO of the 28 triangles; disc radius
//       ≥ 0.30 m (the donut read). The judged v1 defect class, as a law.
//   T9  Geometry/census: separations, edge-edge clearances, edge lengths,
//       reach vs plinth apothem, membrane viability, triad determinants.
//   RED 1: topology corruption breaks T4/T2.
//   RED 2: the ORIGINAL CMG Lee realization, seated hole-axis-vertical by
//       the SAME pipeline, FAILS the hole-column law (the instrument
//       detects the v1 defect). If it ever passes, this probe is too weak
//       to bless a donut — refuse.

import { readFileSync, existsSync } from "node:fs";

// ---- parameters ----------------------------------------------------------------------------------------
export const PLATE_T = 0.09;
export const PLATE_INSET = 0.045;
export const ROD_R = 0.032;
export const BEAD_R = 0.085;
export const BEAD_STAND = 0.05;
export const PLINTH_R = 2.75;
export const PLINTH_N = 7;
export const PLINTH_ROT = Math.PI / 2;
export const PLINTH_H = 0.30;
export const EMBED = 0.03;

type V3 = [number, number, number];
type Tri = [number, number, number];

// ---- parse the BINARY STL (topology source; identical to struct-229) --------------------------------------
const STL_PATH = existsSync("/tmp/szilassi.stl") ? "/tmp/szilassi.stl"
    : new URL("./assets/szilassi-source.stl", import.meta.url).pathname;
const stl = readFileSync(STL_PATH);
const FACET_N = stl.readUInt32LE(80);
if (FACET_N !== 28) throw Error(`expected 28 facets, got ${FACET_N}`);
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

// ---- group triangles into the 7 planar faces; boundary loops; edges (verbatim struct-229) ------------------
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
            const dd = groups[g].n[0] * c[0] + groups[g].n[0 + 1] * c[1] + groups[g].n[2] * c[2] - groups[g].d;
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
export const EDGES: [number, number][] = (() => {
    const s = new Set<string>();
    for (const L of LOOPS) for (let i = 0; i < L.length; i++) {
        const a = L[i], b = L[(i + 1) % L.length];
        s.add(a < b ? `${a}-${b}` : `${b}-${a}`);
    }
    return [...s].map((k) => k.split("-").map(Number) as [number, number]);
})();
const facesOfEdge = (a: number, b: number): number[] =>
    LOOPS.map((L, i) => L.some((v, k) => (v === a && L[(k + 1) % L.length] === b) || (v === b && L[(k + 1) % L.length] === a)) ? i : -1)
        .filter((i) => i >= 0);

// vertex -> its 3 incident faces (T5 guarantees exactly 3)
const V2F: number[][] = oVerts.map(() => []);
for (let fi = 0; fi < LOOPS.length; fi++) for (const v of LOOPS[fi]) V2F[v].push(fi);

// fan triangulation of each face from its first loop vertex (4 tris × 7 faces)
const FAN: Tri[] = [];
for (const L of LOOPS) for (let k = 1; k <= 4; k++) FAN.push([L[0], L[k], L[k + 1]] as Tri);

// ---- the plane parameterization --------------------------------------------------------------------------
// params = 7 × [θ, φ, d]:  unit normal via spherical angles, plane n·x = d.
// Initial state: planes fit to the ORIGINAL face groups (Newell — the source
// hexes are exactly planar, so this recovers the original realization).
const newell = (L: number[]): V3 => {
    const n: V3 = [0, 0, 0];
    for (let i = 0; i < L.length; i++) {
        const a = oVerts[L[i]], b = oVerts[L[(i + 1) % L.length]];
        n[0] += (a[1] - b[1]) * (a[2] + b[2]);
        n[1] += (a[2] - b[2]) * (a[0] + b[0]);
        n[2] += (a[0] - b[0]) * (a[1] + b[1]);
    }
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0] / l, n[1] / l, n[2] / l];
};
const nOf = (p: number[]): V3 => {
    const s = Math.sin(p[1]);
    return [s * Math.cos(p[0]), Math.cos(p[1]), s * Math.sin(p[0])];
};
const initParams: number[] = [];
for (const L of LOOPS) {
    const n = newell(L);
    const d = n[0] * oVerts[L[0]][0] + n[1] * oVerts[L[0]][1] + n[2] * oVerts[L[0]][2];
    initParams.push(Math.atan2(n[2], n[0]), Math.acos(Math.max(-1, Math.min(1, n[1]))), d);
}

// verts from planes: solve [n_a;n_b;n_c] x = [d_a,d_b,d_c]
function vertsFromPlanes(params: number[]): V3[] | null {
    const out: V3[] = [];
    for (let i = 0; i < 14; i++) {
        const [fa, fb, fc] = V2F[i];
        const pa = params.slice(fa * 3, fa * 3 + 3), pb = params.slice(fb * 3, fb * 3 + 3), pc = params.slice(fc * 3, fc * 3 + 3);
        const na = nOf(pa), nb = nOf(pb), nc = nOf(pc);
        const det = na[0] * (nb[1] * nc[2] - nb[2] * nc[1]) - na[1] * (nb[0] * nc[2] - nb[2] * nc[0]) + na[2] * (nb[0] * nc[1] - nb[1] * nc[0]);
        if (Math.abs(det) < 1e-6) return null;
        const solveRow = (r: V3) =>
            (r[0] * (nb[1] * nc[2] - nb[2] * nc[1]) - r[1] * (nb[0] * nc[2] - nb[2] * nc[0]) + r[2] * (nb[0] * nc[1] - nb[1] * nc[0])) / det;
        const x = solveRow([pa[2], 0, 0] as V3) + solveRow([0, pb[2], 0] as V3) + solveRow([0, 0, pc[2]] as V3);
        // Cramer directly per component:
        const detM = (a: V3, b: V3, c: V3) =>
            a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
        const N: V3[] = [na, nb, nc], D: V3 = [pa[2], pb[2], pc[2]];
        const comps: V3 = [0, 0, 0];
        for (let ax = 0; ax < 3; ax++) {
            const M = N.map((n, r) => { const m = [...n] as V3; m[ax] = D[r]; return m; });
            comps[ax] = detM(M[0], M[1], M[2]) / det;
        }
        out.push([comps[0], comps[1], comps[2]]);
        void x;
    }
    return out;
}

// point-to-triangle distance (Ericson)
function ptTri(p: V3, a: V3, b: V3, c: V3): number {
    const ab: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac: V3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], ap: V3 = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const d1 = ab[0] * ap[0] + ab[1] * ap[1] + ab[2] * ap[2], d2 = ac[0] * ap[0] + ac[1] * ap[1] + ac[2] * ap[2];
    if (d1 <= 0 && d2 <= 0) return Math.hypot(ap[0], ap[1], ap[2]);
    const bp: V3 = [p[0] - b[0], p[1] - b[1], p[2] - b[2]];
    const d3 = ab[0] * bp[0] + ab[1] * bp[1] + ab[2] * bp[2], d4 = ac[0] * bp[0] + ac[1] * bp[1] + ac[2] * bp[2];
    if (d3 >= 0 && d4 <= d3) return Math.hypot(bp[0], bp[1], bp[2]);
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) { const t = d1 / (d1 - d3); return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1], ap[2] - t * ab[2]); }
    const cp: V3 = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
    const d5 = ab[0] * cp[0] + ab[1] * cp[1] + ab[2] * cp[2], d6 = ac[0] * cp[0] + ac[1] * cp[1] + ac[2] * cp[2];
    if (d6 >= 0 && d5 <= d6) return Math.hypot(cp[0], cp[1], cp[2]);
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) { const t = d2 / (d2 - d6); return Math.hypot(ap[0] - t * ac[0], ap[1] - t * ac[1], ap[2] - t * ac[2]); }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) { const t = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return Math.hypot(bp[0] + t * (cp[0] - bp[0]), bp[1] + t * (cp[1] - bp[1]), bp[2] + t * (cp[2] - bp[2])); }
    const denom = 1 / (va + vb + vc);
    const v = vb * denom, w = vc * denom;
    return Math.hypot(ap[0] - ab[0] * v - ac[0] * w, ap[1] - ab[1] * v - ac[1] * w, ap[2] - ab[2] * v - ac[2] * w);
}

// simplicity audit: count proper crossings between non-adjacent hex edges,
// tested in each face's own plane (2D orientation signs). Used both as an
// optimizer penalty (bow-ties forbidden) and by law T3.
function crossCount(N: V3[]): number {
    let bad = 0;
    for (const L of LOOPS) {
        const nw: V3 = [0, 0, 0];
        for (let i = 0; i < 6; i++) {
            const a = N[L[i]], b = N[L[(i + 1) % 6]];
            nw[0] += (a[1] - b[1]) * (a[2] + b[2]);
            nw[1] += (a[2] - b[2]) * (a[0] + b[0]);
            nw[2] += (a[0] - b[0]) * (a[1] + b[1]);
        }
        const l = Math.hypot(nw[0], nw[1], nw[2]) || 1;
        const nrm: V3 = [nw[0] / l, nw[1] / l, nw[2] / l];
        const ref: V3 = Math.abs(nrm[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const u: V3 = [ref[1] * nrm[2] - ref[2] * nrm[1], ref[2] * nrm[0] - ref[0] * nrm[2], ref[0] * nrm[1] - ref[1] * nrm[0]];
        const ul = Math.hypot(...u) || 1;
        const un: V3 = [u[0] / ul, u[1] / ul, u[2] / ul];
        const vn: V3 = [nrm[1] * un[2] - nrm[2] * un[1], nrm[2] * un[0] - nrm[0] * un[2], nrm[0] * un[1] - nrm[1] * un[0]];
        const P2 = L.map((i) => [N[i][0] * un[0] + N[i][1] * un[1] + N[i][2] * un[2], N[i][0] * vn[0] + N[i][1] * vn[1] + N[i][2] * vn[2]] as [number, number]);
        const orient = (a: [number, number], b: [number, number], c: [number, number]) =>
            (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        for (let e1 = 0; e1 < 6; e1++) for (let e2 = e1 + 2; e2 < 6; e2++) {
            if (e1 === 0 && e2 === 5) continue;
            const p1 = P2[e1], p2 = P2[(e1 + 1) % 6], p3 = P2[e2], p4 = P2[(e2 + 1) % 6];
            const o1 = orient(p1, p2, p3), o2 = orient(p1, p2, p4), o3 = orient(p3, p4, p1), o4 = orient(p3, p4, p2);
            if (o1 * o2 < -1e-12 && o3 * o4 < -1e-12) bad++;
        }
    }
    return bad;
}

// normalized evaluation: center x/z on vertex mean, scale so max radius = 1.
// returns { score, clear, ...diagnostics } in NORMALIZED units.
// CLEARANCE IS EXACT PER-FACE: distance from the y-axis to a face = distance
// from the origin to the face's projection onto the xz-plane (projection of
// a convex hexagon along y is a convex polygon; the plane's own minimizer is
// the axis-parallel line at q0 = d/(nx²+nz²)·(nx,nz) when it pierces the
// face, else the nearest projected edge). No sampling, no blind spots.
function faceDistToAxis(L: number[], N: V3[], n: V3, d: number): number {
    const P2 = L.map((i) => [N[i][0], N[i][2]] as [number, number]);
    const den = n[0] * n[0] + n[2] * n[2];
    const q0: [number, number] = den < 1e-12 ? [0, 0] : [(d / den) * n[0], (d / den) * n[2]];
    // point-in-convex-polygon (winding signs; polygon is convex and ordered)
    let inside = true, sign = 0;
    for (let k = 0; k < P2.length; k++) {
        const a = P2[k], b = P2[(k + 1) % P2.length];
        const cr = (b[0] - a[0]) * (q0[1] - a[1]) - (b[1] - a[1]) * (q0[0] - a[0]);
        if (Math.abs(cr) < 1e-12) continue;
        const s = cr > 0 ? 1 : -1;
        if (sign === 0) sign = s; else if (s !== sign) { inside = false; break; }
    }
    if (inside) return Math.hypot(q0[0], q0[1]);
    let best = Infinity;
    for (let k = 0; k < P2.length; k++) {
        const a = P2[k], b = P2[(k + 1) % P2.length];
        const ab = [b[0] - a[0], b[1] - a[1]], ap = [-a[0], -a[1]];
        const t = Math.max(0, Math.min(1, (ab[0] * ap[0] + ab[1] * ap[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1)));
        best = Math.min(best, Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1]));
    }
    return best;
}
function evaluate(params: number[], hinge: number) {
    const V = vertsFromPlanes(params);
    if (!V) return { score: -1e9, clear: 0, pen: 0 };
    let cx = 0, cz = 0;
    for (const v of V) { cx += v[0] / 14; cz += v[2] / 14; }
    const C = V.map((v) => [v[0] - cx, v[1], v[2] - cz] as V3);
    let R = 0;
    for (const v of C) R = Math.max(R, Math.hypot(v[0], v[2]));
    if (!(R > 1e-6)) return { score: -1e9, clear: 0, pen: 0 };
    const N = C.map((v) => [v[0] / R, v[1] / R, v[2] / R] as V3);
    // exact per-face axis clearance (plane transformed into the SAME centered
    // + normalized frame as N: n·x = d → n·N = (d − n·c)/R)
    let clear = Infinity;
    const perFace: number[] = [];
    for (let fi = 0; fi < LOOPS.length; fi++) {
        const p = params.slice(fi * 3, fi * 3 + 3);
        const n = nOf(p);
        const dN = (p[2] - (n[0] * cx + n[2] * cz)) / R;
        const fd = faceDistToAxis(LOOPS[fi], N, n, dN);
        perFace.push(fd);
        clear = Math.min(clear, fd);
    }
    // penalties (normalized units)
    let pen = 0;
    // HINGE: every face must clear the growing hole target
    for (const fd of perFace) pen += 800 * Math.max(0, hinge - fd) ** 2;
    // extent balance: donut squatter than wide (y-extent <= 1.05 R)
    let y0 = Infinity, y1 = -Infinity;
    for (const v of N) { y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); }
    const yExt = y1 - y0;
    pen += 3 * Math.max(0, yExt - 1.05) ** 2;
    // vertex separations >= 0.075 (final R≈2.2 → 0.165 m)
    let minSep = Infinity;
    for (let i = 0; i < 14; i++) for (let j = i + 1; j < 14; j++)
        minSep = Math.min(minSep, Math.hypot(N[i][0] - N[j][0], N[i][1] - N[j][1], N[i][2] - N[j][2]));
    pen += 400 * Math.max(0, 0.075 - minSep) ** 2;
    // triad determinants >= 0.08 (vertex solve stays well-conditioned)
    for (let i = 0; i < 14; i++) {
        const [fa, fb, fc] = V2F[i];
        const na = nOf(params.slice(fa * 3, fa * 3 + 3)), nb = nOf(params.slice(fb * 3, fb * 3 + 3)), nc = nOf(params.slice(fc * 3, fc * 3 + 3));
        const det = Math.abs(na[0] * (nb[1] * nc[2] - nb[2] * nc[1]) - na[1] * (nb[0] * nc[2] - nb[2] * nc[0]) + na[2] * (nb[0] * nc[1] - nb[1] * nc[0]));
        pen += 50 * Math.max(0, 0.08 - det) ** 2;
    }
    // dihedral floor 26° between adjacent faces (weight 0.6 — the fold guard)
    const normals = LOOPS.map((_, fi) => nOf(params.slice(fi * 3, fi * 3 + 3)));
    for (const [a, b] of EDGES) {
        const adj = facesOfEdge(a, b);
        if (adj.length !== 2) continue;
        const n1 = normals[adj[0]], n2 = normals[adj[1]];
        const d = Math.min(1, Math.max(-1, n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]));
        const deg = Math.acos(d) * 180 / Math.PI;
        pen += 0.6 * Math.max(0, 26 - deg) ** 2;
    }
    // hexagon interior angles in a lawful band [55°, 248°] (reflex corners are
    // LEGAL on the Szilassi — concave hexes are its nature; spikes and
    // near-straight degenerate corners are not)
    for (const L of LOOPS) for (let k = 0; k < 6; k++) {
        const P = N[L[(k + 5) % 6]], Q = N[L[k]], Rr = N[L[(k + 1) % 6]];
        const u: V3 = [P[0] - Q[0], P[1] - Q[1], P[2] - Q[2]], w: V3 = [Rr[0] - Q[0], Rr[1] - Q[1], Rr[2] - Q[2]];
        const dot = u[0] * w[0] + u[1] * w[1] + u[2] * w[2];
        const ang = Math.acos(Math.max(-1, Math.min(1, dot / (Math.hypot(...u) * Math.hypot(...w) || 1)))) * 180 / Math.PI;
        pen += 0.05 * Math.max(0, ang - 248) ** 2 + 0.05 * Math.max(0, 55 - ang) ** 2;
    }
    // SIMPLICITY: bow-tie hexagons are forbidden (their fans cross the hole)
    pen += 500 * crossCount(N);
    // max edge length (normalized cap 1.1 — no runaway struts)
    for (const [i, j] of EDGES) {
        const len = Math.hypot(N[i][0] - N[j][0], N[i][1] - N[j][1], N[i][2] - N[j][2]);
        pen += 15 * Math.max(0, len - 1.1) ** 2;
    }
    // non-incident edge-edge clearance (normalized target 0.028 — embedding)
    {
        const segSegApprox = (a1: V3, b1: V3, a2: V3, b2: V3): number => {
            let best = Infinity;
            for (const [p, q, r] of [[a1, a2, b2], [b1, a2, b2], [a2, a1, b1], [b2, a1, b1]] as [V3, V3, V3][])
                best = Math.min(best, pointSegDistLocal(p, q, r));
            return best;
        };
        for (let e1 = 0; e1 < EDGES.length; e1++) for (let e2 = e1 + 1; e2 < EDGES.length; e2++) {
            const [a, b] = EDGES[e1], [c, d] = EDGES[e2];
            if (new Set([a, b, c, d]).size < 4) continue;
            pen += 2000 * Math.max(0, 0.028 - segSegApprox(N[a], N[b], N[c], N[d])) ** 2;
        }
    }
    // membrane viability: every hexagon's centroid inradius >= 0.05 (hosts a bead)
    for (let fi = 0; fi < LOOPS.length; fi++) {
        const L = LOOPS[fi];
        const c: V3 = [0, 0, 0];
        for (const i of L) { c[0] += N[i][0] / 6; c[1] += N[i][1] / 6; c[2] += N[i][2] / 6; }
        let r = Infinity;
        for (let k = 0; k < 6; k++) r = Math.min(r, pointSegDistLocal(c, N[L[k]], N[L[(k + 1) % 6]]));
        pen += 300 * Math.max(0, 0.05 - r) ** 2;
    }
    // roundness: vertex radius spread (max-min)/max <= 0.55
    let rMin = Infinity, rMax = 0;
    for (const v of N) { const r = Math.hypot(v[0], v[2]); rMin = Math.min(rMin, r); rMax = Math.max(rMax, r); }
    pen += 0.8 * Math.max(0, (rMax - rMin) - 0.55) ** 2;
    // HARD REJECTS (the lawful manifold — the hinge ladder cannot trade these away)
    const crossings = crossCount(N);
    if (crossings > 0 || minSep < 0.065 || yExt > 1.6 || rMax > 1.001)
        return { score: -1e6, clear, pen: 1e6, minSep, yExt, perFace };
    for (const [i, j] of EDGES) {
        const len = Math.hypot(N[i][0] - N[j][0], N[i][1] - N[j][1], N[i][2] - N[j][2]);
        if (len > 1.35) return { score: -1e6, clear, pen: 1e6, minSep, yExt, perFace };
    }
    for (const [a, b] of EDGES) {
        const adj = facesOfEdge(a, b);
        if (adj.length !== 2) continue;
        const n1 = normals[adj[0]], n2 = normals[adj[1]];
        const d = Math.min(1, Math.max(-1, n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]));
        if (Math.acos(d) * 180 / Math.PI < 20) return { score: -1e6, clear, pen: 1e6, minSep, yExt, perFace };
    }
    return { score: clear - pen, clear, pen, minSep, yExt, perFace };
}
function pointSegDistLocal(p: V3, a: V3, b: V3): number {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const t = Math.max(0, Math.min(1, (ab[0] * ap[0] + ab[1] * ap[1] + ab[2] * ap[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2)));
    return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1], ap[2] - t * ab[2]);
}

// deterministic PRNG
function mulberry32(a: number) {
    return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// coordinate descent with adaptive steps
function descend(start: number[], hinge: number, steps: number[]): number[] {
    let best = [...start], bestScore = evaluate(best, hinge).score;
    for (const step of steps) {
        let improved = true;
        let guard = 0;
        while (improved && guard++ < 80) {
            improved = false;
            for (let p = 0; p < best.length; p++) for (const dir of [1, -1]) {
                const cand = [...best];
                cand[p] += dir * step;
                const sc = evaluate(cand, hinge).score;
                if (sc > bestScore + 1e-9) { best = cand; bestScore = sc; improved = true; }
            }
        }
    }
    return best;
}

// ---- template initialization: wavy-torus primal → dual centroids → alternating projection ----
// The crooked original STARTS the search with faces straddling the axis (its
// min face clearance ≈ 0). Instead: build the C7-combinatorial Császár on a
// wavy torus (well-shaped triangles), take the 14 dual centroids as template
// Szilassi verts, and alternate-project (fit planes → intersect → repeat)
// onto the nearby exactly-planar realization. Landing inside the round basin.
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
        const k = idx;
        for (let phi = 0; phi < 14; phi++) {
            if (used[phi]) continue;
            let ok = true;
            for (let j = 0; j < idx && ok; j++)
                if (stlLabel(k, j) !== tmplLabel(phi, assign[j])) ok = false;
            if (!ok) continue;
            assign[k] = phi; used[phi] = true;
            const r = go(idx + 1);
            if (r) return r;
            assign[k] = -1; used[phi] = false;
        }
        return null;
    };
    return go(0);
})();
if (!ISO) throw Error("no STL↔template isomorphism — topology mismatch (both are Szilassi; cannot happen)");
console.log(`template: STL↔wavy-torus isomorphism found (STL vertex k ↔ dual vertex ${ISO.join(",")})`);

function wavyTorus(Rm: number, rm: number, H: number, ph: number): V3[] {
    const P: V3[] = [];
    for (let i = 0; i < 7; i++) {
        const th = THETA(i), w = Math.cos(3 * th + ph);
        P.push([(Rm + rm * w) * Math.cos(th), H * Math.sin(3 * th + ph), (Rm + rm * w) * Math.sin(th)]);
    }
    return P;
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
function altProject(start: V3[], iters: number): { planes: number[]; drift: number; ok: boolean } {
    let R = 0;
    for (const v of start) R = Math.max(R, Math.hypot(v[0], v[2]));
    if (!(R > 1e-9)) return { planes: [], drift: Infinity, ok: false };
    let cur = start.map((v) => [v[0] / R, v[1] / R, v[2] / R] as V3);
    let drift = Infinity;
    for (let it = 0; it < iters; it++) {
        const planes = fitPlanes(cur);
        if (planes.length !== 21) return { planes: [], drift: Infinity, ok: false };
        const V = vertsFromPlanes(planes);
        if (!V) return { planes: [], drift: Infinity, ok: false };
        let mx = 0;
        for (let k = 0; k < 14; k++) mx = Math.max(mx, Math.hypot(V[k][0] - cur[k][0], V[k][1] - cur[k][1], V[k][2] - cur[k][2]));
        drift = mx;
        cur = V;
        if (mx < 1e-6) break;
    }
    return { planes: fitPlanes(cur), drift, ok: drift < 0.03 };
}

const cands: { planes: number[]; tag: string }[] = [];
{
    const pr = altProject(oVerts, 80);
    if (pr.ok) cands.push({ planes: pr.planes, tag: `original projected (drift ${pr.drift.toFixed(4)})` });
    // affine squash of the original (y×0.5, xz×1.2) then re-planarize — cheap extra basin
    const squashed = oVerts.map((v) => [v[0] * 1.2, v[1] * 0.5, v[2] * 1.2] as V3);
    const pr2 = altProject(squashed, 80);
    if (pr2.ok) cands.push({ planes: pr2.planes, tag: `original squashed (drift ${pr2.drift.toFixed(4)})` });
}
// ROUND-PLANE ANSATZ (direct: planes ARE the parameters — no projection step).
// The 7 Szilassi faces ordered by their ORIGINAL normals' azimuth get normals
// from two tilted fans (up-fan +τ, down-fan −τ, the seam carried by the odd
// count) with offsets proportional to the tilt — planes tangent to an anchor
// torus. Grid over tilt, fan split, twist, offset ratio; keep lawful survivers.
{
    // azimuthal order of the original faces
    const origN = LOOPS.map((L) => {
        const nw: V3 = [0, 0, 0];
        for (let i = 0; i < 6; i++) {
            const a = oVerts[L[i]], b = oVerts[L[(i + 1) % 6]];
            nw[0] += (a[1] - b[1]) * (a[2] + b[2]);
            nw[1] += (a[2] - b[2]) * (a[0] + b[0]);
            nw[2] += (a[0] - b[0]) * (a[1] + b[1]);
        }
        const l = Math.hypot(nw[0], nw[1], nw[2]) || 1;
        return [nw[0] / l, nw[1] / l, nw[2] / l] as V3;
    });
    const order = origN.map((n, fi) => ({ fi, az: Math.atan2(n[2], n[0]) })).sort((a, b) => a.az - b.az);
    console.log(`ansatz: face azimuthal order [${order.map((o) => o.fi).join(",")}]`);
    let made = 0, lawful = 0;
    const killTally = new Map<string, number>();
    const rejectReason = (params: number[]): string | null => {
        const Vt = vertsFromPlanes(params);
        if (!Vt) return "degenerate-triad";
        let cx = 0, cz = 0;
        for (const v of Vt) { cx += v[0] / 14; cz += v[2] / 14; }
        const Cn = Vt.map((v) => [v[0] - cx, v[1], v[2] - cz] as V3);
        let R = 0;
        for (const v of Cn) R = Math.max(R, Math.hypot(v[0], v[2]));
        const N = Cn.map((v) => [v[0] / R, v[1] / R, v[2] / R] as V3);
        if (crossCount(N) > 0) return "crossings";
        let y0 = Infinity, y1 = -Infinity, minS = Infinity;
        for (const v of N) { y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); }
        for (let i = 0; i < 14; i++) for (let j = i + 1; j < 14; j++) minS = Math.min(minS, Math.hypot(N[i][0] - N[j][0], N[i][1] - N[j][1], N[i][2] - N[j][2]));
        if (minS < 0.065) return "minSep";
        if (y1 - y0 > 1.6) return "yExt";
        for (const [i, j] of EDGES) {
            const len = Math.hypot(N[i][0] - N[j][0], N[i][1] - N[j][1], N[i][2] - N[j][2]);
            if (len > 1.35) return "edgeLen";
        }
        for (const [a, b] of EDGES) {
            const adj = facesOfEdge(a, b);
            if (adj.length !== 2) continue;
            const n1 = nOf(params.slice(adj[0] * 3, adj[0] * 3 + 3)), n2 = nOf(params.slice(adj[1] * 3, adj[1] * 3 + 3));
            const d = Math.min(1, Math.max(-1, n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]));
            if (Math.acos(d) * 180 / Math.PI < 20) return "dihedral";
        }
        return null;
    };
    for (const tau of [0.35, 0.5, 0.65, 0.8, 1.0, 1.2]) {
        for (const split of [3, 4]) {          // faces 0..split-1 up-fan, rest down-fan (azimuthal)
            for (const twist of [0, Math.PI / 7]) {
                for (const rr of [1.0, 0.85]) {   // inner/outer offset ratio
                    for (const phi0 of [0, Math.PI / 7]) {
                        const planes: number[] = [];
                        for (let kk = 0; kk < 7; kk++) {
                            const fi = order[kk].fi;
                            const up = kk < split;
                            const t = up ? tau : -tau;
                            const az = (kk / 7) * Math.PI * 2 + phi0 + (up ? 0 : twist);
                            const n: V3 = [Math.sin(t) * Math.cos(az), Math.cos(t), Math.sin(t) * Math.sin(az)];
                            const d = (up ? 1.0 : rr) * Math.abs(Math.sin(t)) * 1.0;
                            planes.push(Math.atan2(n[2], n[0]), Math.acos(Math.max(-1, Math.min(1, n[1]))), d);
                        }
                        made++;
                        const why = rejectReason(planes);
                        if (why) { killTally.set(why, (killTally.get(why) ?? 0) + 1); continue; }
                        const ev = evaluate(planes, 0);
                        if (ev.score <= -1e5) { killTally.set("soft-pen", (killTally.get("soft-pen") ?? 0) + 1); continue; }
                        lawful++;
                        cands.push({ planes, tag: `ansatz τ${tau} split${split} tw${twist.toFixed(2)} rr${rr} φ0${phi0.toFixed(2)} → clear ${ev.clear.toFixed(3)}` });
                    }
                }
            }
        }
    }
    console.log(`ansatz: ${made} grid points, ${lawful} lawful survivors (pre-sort); kills: ${[...killTally.entries()].map(([k, v]) => `${k}×${v}`).join(" ") || "none"}`);
}
if (!cands.length) throw Error("no candidate lawful — round-realization attempt fails honestly HERE");
// LS-CENTROID TEMPLATES: pick 14 round target centroids (a proper donut), project
// onto the image of the centroid map C = M·P (least-squares primal), take the
// EXACT dual centroids of that primal, then alternate-project to planarity.
// The wavy-torus direct dual failed because its triangles are too central —
// this inverts the construction: the RING is chosen, the primal is solved.
{
    // centroid map rows: triangle t (template index) → 1/3 at each primal vertex
    // (template vertex phi ↔ primal triangle PFACES[phi]; ISO maps STL↔template)
    const solveLS = (Ct: V3[]): V3[] | null => {
        // unknowns: 7 primal vertices × 3 coords → NORMAL EQUATIONS ARE 7×7
        // (the earlier 21×21 build zeroed rows 7..20 and every solve died at
        // a null pivot — the LS-ring templates never existed until this fix)
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
        // exact dual centroids of the LS primal
        return PFACES.map((t) => [
            (P[t[0]][0] + P[t[1]][0] + P[t[2]][0]) / 3,
            (P[t[0]][1] + P[t[1]][1] + P[t[2]][1]) / 3,
            (P[t[0]][2] + P[t[1]][2] + P[t[2]][2]) / 3] as V3);
    };
    for (const rOut of [0.95, 1.0]) for (const rIn of [0.45, 0.55]) for (const h of [0.30, 0.42]) for (const ph of [0, Math.PI / 7]) {
        const Ct: V3[] = [];
        for (let i = 0; i < 7; i++) {
            const th = THETA(i) + ph;
            Ct.push([rOut * Math.cos(th), h, rOut * Math.sin(th)]);
            Ct.push([rIn * Math.cos(th + Math.PI / 7), -h, rIn * Math.sin(th + Math.PI / 7)]);
        }
        const dual = solveLS(Ct);
        if (!dual) continue;
        const st = ISO.map((phi) => dual[phi]);
        const pr = altProject(st, 120);
        if (pr.ok) cands.push({ planes: pr.planes, tag: `LS ring rO${rOut} rI${rIn} h${h} ph${ph.toFixed(2)} (drift ${pr.drift.toFixed(4)})` });
    }
}
if (!cands.length) throw Error("no template survived alternating projection — round-realization attempt fails honestly HERE");
cands.sort((a, b) => evaluate(b.planes, 0).score - evaluate(a.planes, 0).score);
for (const c of cands.slice(0, 4)) {
    const ev = evaluate(c.planes, 0);
    console.log(`template candidate: ${c.tag} → clear ${ev.clear.toFixed(4)}, pen ${ev.pen.toFixed(4)}, minSep ${ev.minSep.toFixed(3)}, yExt ${ev.yExt.toFixed(2)}`);
}
// THE INTERPOLATION EXPERIMENT (the deciding instrument): a continuous family
// from the original planes toward round two-fan planes (normals slerped,
// offsets lerped). If NO t is both lawful and hole-clearing, the lawful region
// is disconnected from roundness — the strongest statement available without
// a global solver, and the honest end of path (a).
{
    const origPl = initParams;
    // round targets: two-fan normals in the original faces' azimuthal order
    const origN = LOOPS.map((L) => {
        const nw: V3 = [0, 0, 0];
        for (let i = 0; i < 6; i++) {
            const a = oVerts[L[i]], b = oVerts[L[(i + 1) % 6]];
            nw[0] += (a[1] - b[1]) * (a[2] + b[2]);
            nw[1] += (a[2] - b[2]) * (a[0] + b[0]);
            nw[2] += (a[0] - b[0]) * (a[1] + b[1]);
        }
        const l = Math.hypot(nw[0], nw[1], nw[2]) || 1;
        return [nw[0] / l, nw[1] / l, nw[2] / l] as V3;
    });
    const order = origN.map((n, fi) => ({ fi, az: Math.atan2(n[2], n[0]) })).sort((a, b) => a.az - b.az);
    const TAU = 0.65, SPLIT = 3;
    const target: number[] = [];
    for (let kk = 0; kk < 7; kk++) {
        const up = kk < SPLIT;
        const t = up ? TAU : -TAU;
        const az = (kk / 7) * Math.PI * 2 + (up ? 0 : Math.PI / 7);
        const n: V3 = [Math.sin(t) * Math.cos(az), Math.cos(t), Math.sin(t) * Math.sin(az)];
        target.push(Math.atan2(n[2], n[0]), Math.acos(Math.max(-1, Math.min(1, n[1]))), Math.abs(Math.sin(t)));
    }
    // reorder target to FACE index
    const tgtByFace = new Array(21).fill(0);
    for (let kk = 0; kk < 7; kk++) {
        const fi = order[kk].fi;
        for (let c = 0; c < 3; c++) tgtByFace[fi * 3 + c] = target[kk * 3 + c];
    }
    const slerpN = (a: V3, b: V3, t: number): V3 => {
        const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
        const om = Math.acos(dot);
        if (om < 1e-9) return a;
        const sA = Math.sin((1 - t) * om) / Math.sin(om), sB = Math.sin(t * om) / Math.sin(om);
        return [a[0] * sA + b[0] * sB, a[1] * sA + b[1] * sB, a[2] * sA + b[2] * sB];
    };
    const unwrap = (from: number, to: number): number => {
        let d = (to - from) % (Math.PI * 2);
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        return from + d;
    };
    let bestT = -1, bestClear = 0;
    const traj: string[] = [];
    for (let step = 0; step <= 20; step++) {
        const t = step / 20;
        const planes: number[] = [];
        for (let fi = 0; fi < 7; fi++) {
            const n0 = nOf(origPl.slice(fi * 3, fi * 3 + 3));
            const n1 = nOf(tgtByFace.slice(fi * 3, fi * 3 + 3));
            const n = slerpN(n0, n1, t);
            const d = origPl[fi * 3 + 2] * (1 - t) + tgtByFace[fi * 3 + 2] * t;
            planes.push(unwrap(origPl[fi * 3], Math.atan2(n[2], n[0])), Math.acos(Math.max(-1, Math.min(1, n[1]))), d);
        }
        const Vt = vertsFromPlanes(planes);
        if (!Vt) { traj.push(`t${t.toFixed(2)}:degenerate`); continue; }
        const ev = evaluate(planes, 0);
        const lawful = ev.score > -1e5;
        if (lawful && ev.clear > bestClear) { bestClear = ev.clear; bestT = t; }
        traj.push(`t${t.toFixed(2)}:${lawful ? `clear ${ev.clear.toFixed(3)}` : "LAWLESS"}`);
    }
    console.log(`interpolation (original → round fans, 21 steps): ${traj.join(" | ")}`);
    if (bestT < 0) {
        console.log("INTERPOLATION VERDICT: NO lawful+clearing step exists — the lawful region is disconnected from roundness (path (a) closed on evidence)");
    } else {
        console.log(`INTERPOLATION VERDICT: lawful+clearing at t=${bestT.toFixed(2)} (clear ${bestClear.toFixed(3)}) — seeding the hinge optimizer from there`);
    }
}

let best = cands[0].planes;
let bestEval = evaluate(best, 0.14);
const rng = mulberry32(230);
for (const H of [0.10, 0.13, 0.16, 0.19, 0.21, 0.23]) {
    best = descend(best, H, [0.06, 0.02, 0.008, 0.003]);
    for (let r = 0; r < 3; r++) {
        const cand = best.map((v, i) => v + (i % 3 === 2 ? 0.04 : 0.08) * (rng() * 2 - 1));
        const res = descend(cand, H, [0.06, 0.02, 0.008, 0.003]);
        if (evaluate(res, H).score > evaluate(best, H).score) best = res;
    }
    const ev = evaluate(best, H);
    console.log(`optimizer: hinge H=${H.toFixed(2)} → min face clearance ${ev.clear.toFixed(4)}, penalties ${ev.pen.toFixed(5)} (per-face: ${ev.perFace.map((f) => f.toFixed(2)).join(" ")})`);
}
bestEval = evaluate(best, 0.23);
console.log(`optimizer: final normalized min face clearance ${bestEval.clear.toFixed(4)}, penalties ${bestEval.pen.toFixed(5)}, minSep ${bestEval.minSep.toFixed(4)}, yExt ${bestEval.yExt.toFixed(3)}`);

// ---- seat the optimized shape (hole axis +y by construction) ------------------------------------------------
const OPT = vertsFromPlanes(best)!;
{
    let cx = 0, cz = 0;
    for (const v of OPT) { cx += v[0] / 14; cz += v[2] / 14; }
    for (const v of OPT) { v[0] -= cx; v[2] -= cz; }
}
{
    let R = 0;
    for (const v of OPT) R = Math.max(R, Math.hypot(v[0], v[2]));
    const apoBudget = PLINTH_R * Math.cos(Math.PI / PLINTH_N) - 0.30;
    const S = Math.min(2.2, apoBudget / (R + BEAD_R)) * 0.98;
    for (const v of OPT) { v[0] *= S; v[1] *= S; v[2] *= S; }
    const minY = Math.min(...OPT.map((v) => v[1]));
    const DATUM = PLINTH_H - EMBED - minY;
    for (const v of OPT) v[1] += DATUM;
    console.log(`seat: scale ${S.toFixed(4)} (max radius ${(R * S).toFixed(3)} m), lift ${DATUM.toFixed(3)} — verts embedded ${EMBED} m into the plinth top, hole axis vertical`);
}
export const V: V3[] = OPT;

// outward-oriented face normals + centroids from the OPTIMIZED planes (exact)
const PLANE_NORMALS: V3[] = LOOPS.map((_, fi) => nOf(best.slice(fi * 3, fi * 3 + 3)));
const modelCtr: V3 = [0, PLINTH_H + 0.5, 0];
export const FACE_NORMALS: V3[] = LOOPS.map((L, fi) => {
    let n = PLANE_NORMALS[fi];
    const c: V3 = [(V[L[0]][0] + V[L[1]][0] + V[L[2]][0]) / 3, (V[L[0]][1] + V[L[1]][1] + V[L[2]][1]) / 3, (V[L[0]][2] + V[L[1]][2] + V[L[2]][2]) / 3];
    const out = (c[0] - modelCtr[0]) * n[0] + (c[1] - modelCtr[1]) * n[1] + (c[2] - modelCtr[2]) * n[2];
    return out < 0 ? [-n[0], -n[1], -n[2]] as V3 : n;
});
export const FACE_CENTROIDS: V3[] = LOOPS.map((L) => {
    const c: V3 = [0, 0, 0];
    for (const i of L) { c[0] += V[i][0] / L.length; c[1] += V[i][1] / L.length; c[2] += V[i][2] / L.length; }
    return c;
});

// lamp beads: centroid + outward normal × stand; in-plane pairwise relaxation (struct-229 law)
function pointSegDist(p: V3, a: V3, b: V3): number {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const t = Math.max(0, Math.min(1, (ab[0] * ap[0] + ab[1] * ap[1] + ab[2] * ap[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2)));
    return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1], ap[2] - t * ab[2]);
}
const faceInradius = LOOPS.map((L, fi) => {
    const c = FACE_CENTROIDS[fi];
    let r = Infinity;
    for (let k = 0; k < L.length; k++) r = Math.min(r, pointSegDist(c, V[L[k]], V[L[(k + 1) % L.length]]));
    return r;
});
export const BEADS: V3[] = FACE_NORMALS.map((n, i) => [
    FACE_CENTROIDS[i][0] + n[0] * (PLATE_T / 2 + BEAD_STAND),
    FACE_CENTROIDS[i][1] + n[1] * (PLATE_T / 2 + BEAD_STAND),
    FACE_CENTROIDS[i][2] + n[2] * (PLATE_T / 2 + BEAD_STAND),
] as V3);
export const BEAD_INPLANAR_OFF: V3[] = BEADS.map(() => [0, 0, 0] as V3);
{
    const LAW = 2 * BEAD_R + 0.05;
    for (let iter = 0; iter < 50; iter++) {
        let moved = false;
        for (let i = 0; i < BEADS.length; i++) for (let j = i + 1; j < BEADS.length; j++) {
            const d = Math.hypot(BEADS[i][0] - BEADS[j][0], BEADS[i][1] - BEADS[j][1], BEADS[i][2] - BEADS[j][2]);
            if (d >= LAW) continue;
            const deficit = LAW - d + 0.004;
            for (const [me, other] of [[i, j], [j, i]] as [number, number][]) {
                const u = [BEADS[me][0] - BEADS[other][0], BEADS[me][1] - BEADS[other][1], BEADS[me][2] - BEADS[other][2]];
                const ul = Math.hypot(...u) || 1;
                const n = FACE_NORMALS[me];
                const dot = (u[0] / ul) * n[0] + (u[1] / ul) * n[1] + (u[2] / ul) * n[2];
                let px = (u[0] / ul) - dot * n[0], py = (u[1] / ul) - dot * n[1], pz = (u[2] / ul) - dot * n[2];
                let pl = Math.hypot(px, py, pz);
                if (pl < 1e-6) { px = n[1]; py = -n[0]; pz = 0; pl = Math.hypot(px, py, pz); }
                px /= pl; py /= pl; pz /= pl;
                const cap = faceInradius[me] - BEAD_R - 0.02;
                const used = Math.min(deficit / 2, Math.max(0, cap - Math.hypot(BEAD_INPLANAR_OFF[me][0], BEAD_INPLANAR_OFF[me][1], BEAD_INPLANAR_OFF[me][2])));
                if (used <= 1e-9) continue;
                BEADS[me][0] += px * used; BEADS[me][1] += py * used; BEADS[me][2] += pz * used;
                BEAD_INPLANAR_OFF[me][0] += px * used; BEAD_INPLANAR_OFF[me][1] += py * used; BEAD_INPLANAR_OFF[me][2] += pz * used;
                moved = true;
            }
        }
        if (!moved) break;
    }
    for (let i = 0; i < BEADS.length; i++) {
        const off = Math.hypot(BEAD_INPLANAR_OFF[i][0], BEAD_INPLANAR_OFF[i][1], BEAD_INPLANAR_OFF[i][2]);
        if (off > faceInradius[i] - BEAD_R - 0.02 + 1e-9) throw Error(`bead ${i} escaped its membrane (off ${off.toFixed(3)} > cap ${(faceInradius[i] - BEAD_R - 0.02).toFixed(3)})`);
    }
}

export const LOOPS_EXPORT = LOOPS;

// ---- envelope contract ------------------------------------------------------------------------------------
export const PLINTH_BOX = (() => {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        const x = PLINTH_R * Math.cos(a), z = -PLINTH_R * Math.sin(a);
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
    }
    return { x0, x1, z0, z1 };
})();
export const ENVELOPE = (() => {
    let top = -Infinity;
    for (const b of BEADS) top = Math.max(top, b[1] + BEAD_R);
    for (const [i, j] of EDGES) {
        const a = V[i], b = V[j];
        const hi = Math.max(a[1], b[1]);
        const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) || 1;
        const axisY = (b[1] - a[1]) / len;
        top = Math.max(top, hi + ROD_R * Math.sqrt(Math.max(0, 1 - axisY * axisY)));
    }
    return { min: [PLINTH_BOX.x0, 0, PLINTH_BOX.z0] as V3, max: [PLINTH_BOX.x1, top, PLINTH_BOX.z1] as V3 };
})();

// ---- the hole-column instrument (the v1 executioner, as a reusable law) --------------------------------------
// EXACT plate-volume test, independent of triangulation (matches what the GLB
// actually builds): a vertical ray at (px, pz) hits face f iff the line
// (px,pz)+t·y pierces the plane inside the hexagon — ray∩plane point
// (x=px, z=pz, y=(d − nx·px − nz·pz)/ny) followed by even-odd containment
// of (px,pz) in the hexagon's xz-projection. A face counts as covering the
// hole only at heights above the plinth.
function holeColumn(verts: V3[]): { open: boolean; discR: number; maxHits: number } {
    let clear = Infinity;
    for (const v of verts) clear = Math.min(clear, Math.hypot(v[0], v[2]));
    for (let fi = 0; fi < LOOPS.length; fi++) {
        const L = LOOPS[fi];
        // face's own plane from its (exactly planar) verts
        const nw: V3 = [0, 0, 0];
        for (let i = 0; i < 6; i++) {
            const a = verts[L[i]], b = verts[L[(i + 1) % 6]];
            nw[0] += (a[1] - b[1]) * (a[2] + b[2]);
            nw[1] += (a[2] - b[2]) * (a[0] + b[0]);
            nw[2] += (a[0] - b[0]) * (a[1] + b[1]);
        }
        const l = Math.hypot(nw[0], nw[1], nw[2]) || 1;
        const n: V3 = [nw[0] / l, nw[1] / l, nw[2] / l];
        const d = n[0] * verts[L[0]][0] + n[1] * verts[L[0]][1] + n[2] * verts[L[0]][2];
        // axis-parallel minimizer pierces the face → the face blocks the hole
        const den = n[0] * n[0] + n[2] * n[2];
        if (den < 1e-12) continue;   // horizontal face — never blocks the vertical column
        const qx = (d / den) * n[0], qz = (d / den) * n[2];
        const P2 = L.map((i) => [verts[i][0], verts[i][2]] as [number, number]);
        let inside = true, sign = 0, crossing = 0;
        for (let k = 0; k < P2.length; k++) {
            const a = P2[k], b = P2[(k + 1) % P2.length];
            // even-odd crossing count for the +x ray from q
            if (((a[1] > qz) !== (b[1] > qz))) {
                const xx = a[0] + ((qz - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
                if (xx > qx) crossing++;
            }
            const cr = (b[0] - a[0]) * (qz - a[1]) - (b[1] - a[1]) * (qx - a[0]);
            if (Math.abs(cr) < 1e-12) continue;
            const s = cr > 0 ? 1 : -1;
            if (sign === 0) sign = s; else if (s !== sign) { inside = false; }
        }
        if (crossing % 2 === 1 && inside) clear = Math.min(clear, Math.hypot(qx, qz));
        // else: nearest projected edge to the AXIS FOOT (the origin)
        else {
            for (let k = 0; k < P2.length; k++) {
                const a = P2[k], b = P2[(k + 1) % P2.length];
                const ab = [b[0] - a[0], b[1] - a[1]], ap = [-a[0], -a[1]];
                const t = Math.max(0, Math.min(1, (ab[0] * ap[0] + ab[1] * ap[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1)));
                clear = Math.min(clear, Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1]));
            }
        }
    }
    const discR = 0.8 * clear;
    const hits = (px: number, pz: number): number => {
        let n = 0;
        for (let fi = 0; fi < LOOPS.length; fi++) {
            const L = LOOPS[fi];
            const nw: V3 = [0, 0, 0];
            for (let i = 0; i < 6; i++) {
                const a = verts[L[i]], b = verts[L[(i + 1) % 6]];
                nw[0] += (a[1] - b[1]) * (a[2] + b[2]);
                nw[1] += (a[2] - b[2]) * (a[0] + b[0]);
                nw[2] += (a[0] - b[0]) * (a[1] + b[1]);
            }
            const l = Math.hypot(nw[0], nw[1], nw[2]) || 1;
            const nn: V3 = [nw[0] / l, nw[1] / l, nw[2] / l];
            if (Math.abs(nn[1]) < 1e-9) continue;   // vertical plane — parallel to the ray, never covers
            const d = nn[0] * verts[L[0]][0] + nn[1] * verts[L[0]][1] + nn[2] * verts[L[0]][2];
            const y = (d - nn[0] * px - nn[2] * pz) / nn[1];
            if (y <= PLINTH_H) continue;            // contact face at the plinth, not a cover
            const P2 = L.map((i) => [verts[i][0], verts[i][2]] as [number, number]);
            let crossing = 0;
            for (let k = 0; k < P2.length; k++) {
                const a = P2[k], b = P2[(k + 1) % P2.length];
                if ((a[1] > pz) !== (b[1] > pz)) {
                    const xx = a[0] + ((pz - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
                    if (xx > px) crossing++;
                }
            }
            if (crossing % 2 === 1) n++;
        }
        return n;
    };
    let maxHits = 0;
    for (let ri = 1; ri <= 8; ri++) for (let ai = 0; ai < 24; ai++) {
        const r = discR * ri / 8, th = (ai / 24) * Math.PI * 2;
        maxHits = Math.max(maxHits, hits(r * Math.cos(th), r * Math.sin(th)));
    }
    return { open: maxHits === 0, discR, maxHits };
}

// ==== LAWS ==================================================================================================
let fails = 0;
const law = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) fails++;
};

law("P0 parse", oVerts.length === 14 && facets.length === 28 && groups.length === 7 && groups.every((g) => g.tris.length === 4),
    `STL topology: ${oVerts.length} unique vertices, ${facets.length} facets, ${groups.length} planar face-groups (${groups.map((g) => g.tris.length).join("+")}) — expect 14/28/7×4`);

law("T1 Euler", V.length - EDGES.length + LOOPS.length === 0,
    `V ${V.length} − E ${EDGES.length} + F ${LOOPS.length} = ${V.length - EDGES.length + LOOPS.length} (genus 1)`);

{
    const adj: number[][] = Array.from({ length: LOOPS.length }, () => Array(LOOPS.length).fill(0));
    for (const [a, b] of EDGES) {
        const fa = facesOfEdge(a, b);
        for (let x = 0; x < fa.length; x++) for (let y = x + 1; y < fa.length; y++) { adj[fa[x]][fa[y]]++; adj[fa[y]][fa[x]]++; }
    }
    let bad = 0, total = 0;
    for (let i = 0; i < LOOPS.length; i++) for (let j = i + 1; j < LOOPS.length; j++) { total++; if (adj[i][j] !== 1) bad++; }
    law("T2 complete face adjacency", total === 21 && bad === 0 && EDGES.length === 21,
        `all ${total} face pairs share EXACTLY one edge (${bad} violations), 21 edges == C(7,2) — seven cells, all neighbors: the theorem, on the skin`);
}

{
    // 6-cycles + SIMPLE polygons (no two non-adjacent hex edges properly cross) + planarity exact.
    // Simplicity test in 2D: project each hex onto its own face plane via an
    // in-plane orthonormal basis, then standard orientation-sign crossing test.
    let bad6 = 0, badSimple = 0, badPlanar = 0;
    for (const L of LOOPS) {
        const fi = LOOPS.indexOf(L);
        if (L.length !== 6 || new Set(L).size !== 6) bad6++;
        const n = FACE_NORMALS[fi];
        for (const i of L) {
            const sd = (V[i][0] - FACE_CENTROIDS[fi][0]) * n[0] + (V[i][1] - FACE_CENTROIDS[fi][1]) * n[1] + (V[i][2] - FACE_CENTROIDS[fi][2]) * n[2];
            if (Math.abs(sd) > 1e-9) badPlanar++;
        }
        const ref: V3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const u: V3 = [ref[1] * n[2] - ref[2] * n[1], ref[2] * n[0] - ref[0] * n[2], ref[0] * n[1] - ref[1] * n[0]];
        const ul = Math.hypot(...u) || 1;
        const un: V3 = [u[0] / ul, u[1] / ul, u[2] / ul];
        const vn: V3 = [n[1] * un[2] - n[2] * un[1], n[2] * un[0] - n[0] * un[2], n[0] * un[1] - n[1] * un[0]];
        const P2 = L.map((i) => [V[i][0] * un[0] + V[i][1] * un[1] + V[i][2] * un[2], V[i][0] * vn[0] + V[i][1] * vn[1] + V[i][2] * vn[2]] as [number, number]);
        const orient = (a: [number, number], b: [number, number], c: [number, number]) =>
            (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        for (let e1 = 0; e1 < 6; e1++) for (let e2 = e1 + 2; e2 < 6; e2++) {
            if (e1 === 0 && e2 === 5) continue;   // adjacent wrap pair
            const p1 = P2[e1], p2 = P2[(e1 + 1) % 6], p3 = P2[e2], p4 = P2[(e2 + 1) % 6];
            const o1 = orient(p1, p2, p3), o2 = orient(p1, p2, p4), o3 = orient(p3, p4, p1), o4 = orient(p3, p4, p2);
            if (o1 * o2 < -1e-12 && o3 * o4 < -1e-12) badSimple++;
        }
    }
    law("T3 hexagonal simple faces", bad6 === 0 && badSimple === 0 && badPlanar === 0,
        `all 7 faces are simple 6-cycles (${bad6} length violations, ${badSimple} self-crossings, ${badPlanar} planarity violations — planes are exact by construction)`);
}

{
    const cnt = new Map<string, number>();
    const ek = (i: number, j: number) => i < j ? `${i}-${j}` : `${j}-${i}`;
    for (const L of LOOPS) for (let i = 0; i < L.length; i++) cnt.set(ek(L[i], L[(i + 1) % L.length]), (cnt.get(ek(L[i], L[(i + 1) % L.length])) ?? 0) + 1);
    const bad4 = [...cnt.values()].filter((n) => n !== 2).length;
    law("T4 manifold", cnt.size === 21 && bad4 === 0, `every edge shared by exactly 2 of 7 faces (${cnt.size} edges, ${bad4} violations — closed watertight combinatorics)`);
}

{
    const deg = Array(14).fill(0);
    for (const [a, b] of EDGES) { deg[a]++; deg[b]++; }
    const bad = deg.filter((d) => d !== 3).length;
    law("T5 duality degrees", bad === 0, `all 14 vertex degrees == 3 (${bad} violations) — exactly 3 cells meet at every corner; the degree-6 K7 vertices of the standing Császár are these 7 faces`);
}

law("T6 minimality", LOOPS.length === 7, `7 faces is the minimum for complete face adjacency (Szilassi 1977) — the dual statement of the Császár's 7-vertex minimality (Möbius 1861)`);

{
    const dihedrals: number[] = [];
    for (const [a, b] of EDGES) {
        const adj = facesOfEdge(a, b);
        if (adj.length !== 2) continue;
        const n1 = FACE_NORMALS[adj[0]], n2 = FACE_NORMALS[adj[1]];
        const d = Math.min(1, Math.max(-1, n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]));
        dihedrals.push(Math.acos(d));
    }
    const minD = Math.min(...dihedrals), maxD = Math.max(...dihedrals), spread = maxD - minD;
    law("T7 non-convex honesty + fold floor", dihedrals.length === 21 && spread > 0.6 && minD > 26 * Math.PI / 180,
        `21 dihedrals over [${(minD * 180 / Math.PI).toFixed(1)}°, ${(maxD * 180 / Math.PI).toFixed(1)}°] — spread ${(spread * 180 / Math.PI).toFixed(1)}°: the surface folds lawfully without spiky near-zero creases (floor 26°, the v1 jack-read guard)`);
}

{
    const hc = holeColumn(V);
    const minY = Math.min(...V.map((v) => v[1]));
    const maxY = Math.max(...V.map((v) => v[1]));
    const minBead = Math.min(...BEADS.map((b) => b[1] - BEAD_R));
    let pairMin = Infinity, pairArg = "";
    for (let i = 0; i < BEADS.length; i++) for (let j = i + 1; j < BEADS.length; j++) {
        const d = Math.hypot(BEADS[i][0] - BEADS[j][0], BEADS[i][1] - BEADS[j][1], BEADS[i][2] - BEADS[j][2]);
        if (d < pairMin) { pairMin = d; pairArg = `${i}-${j}`; }
    }
    const lampSepOk = pairMin > 2 * BEAD_R + 0.05;
    law("T8 donut seat + HOLE-COLUMN law",
        Math.abs(minY - (PLINTH_H - EMBED)) < 1e-9 && (maxY - minY) > 0.5 && minBead > PLINTH_H + 0.02 && lampSepOk && hc.open && hc.discR >= 0.30,
        `verts embedded ${EMBED} m into the plinth top (min y ${minY.toFixed(3)}); ring height ${(maxY - minY).toFixed(2)} m; all 7 lamps proud (lowest bead bottom ${minBead.toFixed(3)}); closest lamp pair ${pairArg} at ${pairMin.toFixed(3)} m; HOLE: vertical ray grid over central disc r=${hc.discR.toFixed(3)} m (≥0.30) — ${hc.maxHits} covering triangles, the through-hole reads from the top (the v1 executioner, now a law)`);
}

{
    let minD = Infinity;
    for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++)
        minD = Math.min(minD, Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]));
    const reach = Math.max(...V.map((v) => Math.hypot(v[0], v[2]))) + BEAD_R;
    const apo = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    // edge-edge clearance between non-incident edges (embedding guard)
    let minEE = Infinity;
    const segSeg = (a1: V3, b1: V3, a2: V3, b2: V3): number => {
        let best = Infinity;
        for (const [p, q, r] of [[a1, a2, b2], [b1, a2, b2], [a2, a1, b1], [b2, a1, b1]] as [V3, V3, V3][])
            best = Math.min(best, pointSegDist(p, q, r));
        return best;
    };
    for (let e1 = 0; e1 < EDGES.length; e1++) for (let e2 = e1 + 1; e2 < EDGES.length; e2++) {
        const [a, b] = EDGES[e1], [c, d] = EDGES[e2];
        if (new Set([a, b, c, d]).size < 4) continue;   // share a vertex
        minEE = Math.min(minEE, segSeg(V[a], V[b], V[c], V[d]));
    }
    let minLen = Infinity, maxLen = 0;
    for (const [i, j] of EDGES) { const L = Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]); minLen = Math.min(minLen, L); maxLen = Math.max(maxLen, L); }
    const insetOk = LOOPS.every((L, fi) => {
        const c = FACE_CENTROIDS[fi];
        for (let k = 0; k < L.length; k++) {
            const d = pointSegDist(c, V[L[k]], V[L[(k + 1) % L.length]]);
            if (d <= PLATE_INSET + 0.02) return false;
        }
        return true;
    });
    let minDet = Infinity;
    for (let i = 0; i < 14; i++) {
        const [fa, fb, fc] = V2F[i];
        const na = nOf(best.slice(fa * 3, fa * 3 + 3)), nb = nOf(best.slice(fb * 3, fb * 3 + 3)), nc = nOf(best.slice(fc * 3, fc * 3 + 3));
        minDet = Math.min(minDet, Math.abs(na[0] * (nb[1] * nc[2] - nb[2] * nc[1]) - na[1] * (nb[0] * nc[2] - nb[2] * nc[0]) + na[2] * (nb[0] * nc[1] - nb[1] * nc[0])));
    }
    const envW = ENVELOPE.max[0] - ENVELOPE.min[0], envH = ENVELOPE.max[1], envD = ENVELOPE.max[2] - ENVELOPE.min[2];
    law("T9 geometry/census",
        minD > 0.15 && reach < apo - 0.15 && insetOk && minEE > 0.06 && minLen > 0.25 && maxLen < 2.5 && minDet > 0.05,
        `min vertex separation ${minD.toFixed(3)} m (>0.15); non-incident edge-edge clearance ${minEE.toFixed(3)} m (>0.06); edge lengths [${minLen.toFixed(2)}, ${maxLen.toFixed(2)}] m; reach ${reach.toFixed(3)} < heptagon apothem ${apo.toFixed(3)}−0.15; all 7 hexes admit a ${PLATE_INSET} m-inset membrane; triad determinants ≥ ${minDet.toFixed(3)} (>0.05, the vertex solve stays honest); envelope ${envW.toFixed(2)}×${envH.toFixed(2)}×${envD.toFixed(2)} (plinth-borne TRUE box); folly class`);
}

// RED 1: topology corruption
{
    const orig = LOOPS[0][1];
    LOOPS[0][1] = LOOPS[0][3];
    const cnt = new Map<string, number>();
    const ek = (i: number, j: number) => i < j ? `${i}-${j}` : `${j}-${i}`;
    for (const L of LOOPS) for (let i = 0; i < L.length; i++) cnt.set(ek(L[i], L[(i + 1) % L.length]), (cnt.get(ek(L[i], L[(i + 1) % L.length])) ?? 0) + 1);
    const broken = [...cnt.values()].some((n) => n !== 2) || cnt.size !== 21;
    LOOPS[0][1] = orig;
    law("RED control (topology)", broken, `loop-corruption mutant: ${[...cnt.values()].filter((n) => n !== 2).length} non-2 edge multiplicities, ${cnt.size} edges — T4/T2 detect`);
}

// RED 2: the ORIGINAL realization, seated hole-axis-vertical, must FAIL the hole-column law
{
    // reproduce struct-229's covariance-min seating of the original verts
    const c: V3 = [0, 0, 0];
    for (const v of oVerts) { c[0] += v[0] / oVerts.length; c[1] += v[1] / oVerts.length; c[2] += v[2] / oVerts.length; }
    const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const v of oVerts) {
        const d = [v[0] - c[0], v[1] - c[1], v[2] - c[2]];
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += d[i] * d[j];
    }
    const k = C[0][0] + C[1][1] + C[2][2] + 1;
    const M = [[k - C[0][0], -C[0][1], -C[0][2]], [-C[1][0], k - C[1][1], -C[1][2]], [-C[2][0], -C[2][1], k - C[2][2]]];
    let u: V3 = [0.2, 0.5, 1.0];
    for (let it = 0; it < 400; it++) {
        const r: V3 = [M[0][0] * u[0] + M[0][1] * u[1] + M[0][2] * u[2], M[1][0] * u[0] + M[1][1] * u[1] + M[1][2] * u[2], M[2][0] * u[0] + M[2][1] * u[1] + M[2][2] * u[2]];
        const l = Math.hypot(r[0], r[1], r[2]) || 1;
        u = [r[0] / l, r[1] / l, r[2] / l];
    }
    const Y: V3 = [0, 1, 0];
    const axis: V3 = [u[1] * Y[2] - u[2] * Y[1], u[2] * Y[0] - u[0] * Y[2], u[0] * Y[1] - u[1] * Y[0]];
    const al = Math.hypot(axis[0], axis[1], axis[2]);
    const dot = u[0] * Y[0] + u[1] * Y[1] + u[2] * Y[2];
    const ang = Math.atan2(al, dot), sa = Math.sin(ang), ca = Math.cos(ang);
    const K = 1 - ca, AL = al || 1;
    const ux = axis[0] / AL, uy = axis[1] / AL, uz = axis[2] / AL;
    const rot = (p: V3): V3 => al < 1e-12
        ? (dot > 0 ? p : [-p[0], -p[1], -p[2]] as V3)
        : [p[0] * (ca + ux * ux * K) + p[1] * (uy * ux * K - uz * sa) + p[2] * (uz * ux * K + uy * sa),
           p[0] * (ux * uy * K + uz * sa) + p[1] * (ca + uy * uy * K) + p[2] * (uz * uy * K - ux * sa),
           p[0] * (ux * uz * K - uy * sa) + p[1] * (uy * uz * K + ux * sa) + p[2] * (ca + uz * uz * K)];
    const spun = oVerts.map((v) => rot([v[0] - c[0], v[1] - c[1], v[2] - c[2]]));
    let R = 0;
    for (const v of spun) R = Math.max(R, Math.hypot(v[0], v[2]));
    const S = 2.0 / R;
    const seated = spun.map((v) => [S * v[0], S * v[1], S * v[2]] as V3);
    const minY = Math.min(...seated.map((v) => v[1]));
    for (const v of seated) v[1] += PLINTH_H - EMBED - minY;
    const hcO = holeColumn(seated);
    law("RED control (v1 instrument)", !hcO.open,
        `the ORIGINAL CMG Lee realization, seated hole-axis-vertical by the same pipeline: disc r=${hcO.discR.toFixed(3)} m, ${hcO.maxHits} covering triangles — the hole-column law DETECTS the proven v1 defect (if this ever passes, the probe is too weak to bless a donut)`);
}

console.log(fails === 0 ? "PROBE ALL PASS" : `PROBE ${fails} FAIL`);
if (fails > 0) process.exit(1);
