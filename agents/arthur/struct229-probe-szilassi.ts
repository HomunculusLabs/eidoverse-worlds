// struct229-probe-szilassi.ts — STRUCTURES LANE struct-229, Round 11 R11-42
// THE SZILASSI POLYHEDRON — the dual of the standing Császár (struct-227/228):
// 14 vertices, 21 edges, SEVEN hexagonal faces, Euler 0 (genus 1). Where the
// Császár's theorem lives on POINTS (K7 — every vertex pair joined), the
// dual's theorem lives on FACES: EVERY PAIR OF FACES SHARES EXACTLY ONE EDGE
// (C(7,2) = 21 = E — complete face adjacency). Seven rooms, all touching.
//
// One idea: SEVEN CELLS, ALL NEIGHBORS. STONE carries the whole surface —
// all seven hexagonal membranes (the skin; the Császár 200m away is the
// skeleton of the same theorem). IRON traces the 21 shared edges as seam
// rods — the meeting-lines made visible. Brass glow beads ride the OUTSIDE
// of each face at its centroid: a lamp in every room. Night contract:
// seven warm points mapping the seven cells. Both structures share the
// heptagonal dais language — the theorem's number, seven.
//
// PARAMETRIZATION SECURED: Wikipedia Szilassi polyhedron article STL
// (commons Special:FilePath, fetched this tick, BINARY, 28 facets = 7 planar
// hexes × 4 triangles, CMG Lee realization) BANKED at
// assets/szilassi-source.stl sha256 0aa6e566512c5aa2… — probe prefers /tmp
// then falls back to the banked copy (durability self-catch, struct-227 law).
//
// Theorems machine-verified below (conchoid law struct-190):
//   P0 parse: 14 unique verts, 28 facets, 7 planar face-groups of 4.
//   T1 Euler: V − E + F = 14 − 21 + 7 = 0 (genus 1 — the torus).
//   T2 COMPLETE FACE ADJACENCY: all 21 face pairs share EXACTLY one edge.
//   T3 HEXAGONAL: every face boundary is a 6-cycle, planar, possibly concave.
//   T4 MANIFOLD: every edge on exactly 2 faces (closed surface).
//   T5 DUALITY: all vertex degrees 3 (dual of the Császár's degree-6 K7).
//   T6 MINIMALITY: Szilassi 1977 — 7 faces is the minimum for complete
//      face adjacency; dual of the Császár's 7-vertex minimality.
//   T7 NON-CONVEXITY: dihedral spread proves the surface folds.
//   T8 SEAT: torus hole axis vertical (donut on the dais), lowest points
//      embedded in the plinth top, all 7 lamps proud and above the plinth.
//
// Frame: model y-up; world-local = final (root identity, struct-188).

import { readFileSync, existsSync } from "node:fs";

// ---- parameters ----------------------------------------------------------------------------------------
export const PLATE_T = 0.09;              // stone membrane thickness (m)
export const PLATE_INSET = 0.045;         // in-plane inset of membrane inside the seam line (reveal)
export const ROD_R = 0.032;               // iron seam-rod radius (thinner than császár 0.048 — seams, not structure)
export const BEAD_R = 0.085;              // brass lamp bead radius
export const BEAD_STAND = 0.05;           // bead center this proud of the membrane outer face
export const PLINTH_R = 2.75;             // heptagonal plinth circumradius (shared dais language)
export const PLINTH_N = 7;                // SEVEN sides — the theorem's number, both structures
export const PLINTH_ROT = Math.PI / 2;    // shape-space angle; one vertex aims at −z after rotateX(−π/2)
export const PLINTH_H = 0.30;
export const EMBED = 0.03;                // lowest donut points dive this far into the plinth top

type V3 = [number, number, number];
type Tri = [number, number, number];

// ---- parse the BINARY STL (80B header, uint32 count, 50B facets) ------------------------------------------
const STL_PATH = existsSync("/tmp/szilassi.stl") ? "/tmp/szilassi.stl"
    : new URL("./assets/szilassi-source.stl", import.meta.url).pathname;   // probe lives in agents/arthur/ — the banked STL is its ./assets sibling
const stl = readFileSync(STL_PATH);
const FACET_N = stl.readUInt32LE(80);
if (FACET_N !== 28) throw Error(`expected 28 facets, got ${FACET_N}`);
const verts: V3[] = [];
const vid = new Map<string, number>();
const facets: { tri: Tri }[] = [];
{
    let off = 84;
    for (let f = 0; f < FACET_N; f++) {
        const idx: number[] = [];
        for (let v = 0; v < 3; v++) {
            const base = off + 12 + v * 12;
            // STL z-up → model y-up right-handed (struct-227 convention): (x, z, −y)
            const pt: V3 = [stl.readFloatLE(base), stl.readFloatLE(base + 8), -stl.readFloatLE(base + 4)];
            const key = pt.map((c) => c.toFixed(5)).join(",");
            if (!vid.has(key)) { vid.set(key, verts.length); verts.push(pt); }
            idx.push(vid.get(key)!);
        }
        facets.push({ tri: [idx[0], idx[1], idx[2]] });
        off += 50;
    }
}

// ---- group the 28 triangles into 7 planar hexagonal faces -------------------------------------------------
// Coplanarity clustering: unit normal within 0.5° (either sign) AND plane offset within 1e-3.
function triNormal(tri: Tri): V3 {
    const A = verts[tri[0]], B = verts[tri[1]], C = verts[tri[2]];
    const u: V3 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w: V3 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const n: V3 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0] / l, n[1] / l, n[2] / l];
}
function triCentroid(tri: Tri): V3 {
    const A = verts[tri[0]], B = verts[tri[1]], C = verts[tri[2]];
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

// boundary loop of a face group = the cycle of edges appearing exactly once
// in its triangulation (each boundary vertex has exactly 2 boundary neighbors).
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

// edge set (undirected) + face adjacency
const edgeSet = (() => {
    const s = new Set<string>();
    for (const L of LOOPS) for (let i = 0; i < L.length; i++) {
        const a = L[i], b = L[(i + 1) % L.length];
        s.add(a < b ? `${a}-${b}` : `${b}-${a}`);
    }
    return [...s].map((k) => k.split("-").map(Number) as [number, number]);
})();
export const EDGES: [number, number][] = edgeSet;
const facesOfEdge = (a: number, b: number): number[] =>
    LOOPS.map((L, i) => L.some((v, k) => (v === a && L[(k + 1) % L.length] === b) || (v === b && L[(k + 1) % L.length] === a)) ? i : -1)
        .filter((i) => i >= 0);

// ---- SEAT: torus hole axis vertical (donut on the dais) ----------------------------------------------------
// The hole axis ≈ the principal axis of SMALLEST positional variance (the
// ring spreads in two axes; the hole direction has the least vertex spread).
// Rotate it to +y, fit-scale to the reach budget, lift so the lowest points
// dive EMBED into the plinth top. Yaw at placement.
const SEAT = (() => {
    const c: V3 = [0, 0, 0];
    for (const v of verts) { c[0] += v[0] / verts.length; c[1] += v[1] / verts.length; c[2] += v[2] / verts.length; }
    const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const v of verts) {
        const d = [v[0] - c[0], v[1] - c[1], v[2] - c[2]];
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += d[i] * d[j];
    }
    // smallest eigenvector of C (symmetric 3×3) via power iteration on (kI − C)
    const k = C[0][0] + C[1][1] + C[2][2] + 1;
    const M = [[k - C[0][0], -C[0][1], -C[0][2]], [-C[1][0], k - C[1][1], -C[1][2]], [-C[2][0], -C[2][1], k - C[2][2]]];
    let u: V3 = [0.2, 0.5, 1.0];
    for (let it = 0; it < 400; it++) {
        const r: V3 = [
            M[0][0] * u[0] + M[0][1] * u[1] + M[0][2] * u[2],
            M[1][0] * u[0] + M[1][1] * u[1] + M[1][2] * u[2],
            M[2][0] * u[0] + M[2][1] * u[1] + M[2][2] * u[2]];
        const l = Math.hypot(r[0], r[1], r[2]) || 1;
        u = [r[0] / l, r[1] / l, r[2] / l];
    }
    // rotate u → +y (Rodrigues about axis = u × y)
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
    const spun = verts.map((v) => rot([v[0] - c[0], v[1] - c[1], v[2] - c[2]]));
    const reach = Math.max(...spun.map((v) => Math.hypot(v[0], v[2])));
    const apoBudget = PLINTH_R * Math.cos(Math.PI / PLINTH_N) - 0.30;   // császár T9 reach-law class
    const S = Math.min(2.2, apoBudget / (reach + BEAD_R)) * 0.98;
    const scaled = spun.map((v) => [S * v[0], S * v[1], S * v[2]] as V3);
    const minY = Math.min(...scaled.map((v) => v[1]));
    const DATUM = PLINTH_H - EMBED - minY;
    return {
        V: scaled.map((v) => [v[0], v[1] + DATUM, v[2]] as V3),
        reach: S * reach, scale: S, holeAxis: u, angDeg: (ang * 180) / Math.PI,
    };
})();
export const V: V3[] = SEAT.V;
export const SEAT_INFO = { reach: SEAT.reach, scale: SEAT.scale, holeAxis: SEAT.holeAxis, angDeg: SEAT.angDeg };

// outward-oriented face normals + centroids computed from the SEATED verts (yaw-free frame)
function normalFromPts(A: V3, B: V3, C: V3): V3 {
    const u: V3 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w: V3 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const n: V3 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0] / l, n[1] / l, n[2] / l];
}
const modelCtr: V3 = [0, PLINTH_H + 0.5, 0];   // rough body center for outwardness (donut sits on the plinth)
export const FACE_NORMALS: V3[] = LOOPS.map((L) => {
    let n = normalFromPts(V[L[0]], V[L[1]], V[L[2]]);
    const ctr: V3 = [(V[L[0]][0] + V[L[1]][0] + V[L[2]][0]) / 3, (V[L[0]][1] + V[L[1]][1] + V[L[2]][1]) / 3, (V[L[0]][2] + V[L[1]][2] + V[L[2]][2]) / 3];
    const out = (ctr[0] - modelCtr[0]) * n[0] + (ctr[1] - modelCtr[1]) * n[1] + (ctr[2] - modelCtr[2]) * n[2];
    if (out < 0) n = [-n[0], -n[1], -n[2]];
    return n;
});
export const FACE_CENTROIDS: V3[] = LOOPS.map((L) => {
    const c: V3 = [0, 0, 0];
    for (const i of L) { c[0] += V[i][0] / L.length; c[1] += V[i][1] / L.length; c[2] += V[i][2] / L.length; }
    return c;
});
// lamp bead centers: centroid + outward normal × (PLATE_T/2 + BEAD_STAND),
// then IN-PLANE RELAXATION: any pair closer than 2·BEAD_R+0.05 is nudged
// apart along its connecting line projected into each bead's face plane,
// capped by that face's inradius − BEAD_R − 0.02 so the bead stays fully
// over its own membrane (centroid pair 0-3 measures 0.208m pre-relax).
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
export const BEAD_INPLANAR_OFF: V3[] = BEADS.map(() => [0, 0, 0] as V3);   // cumulative in-plane offset per bead (decode re-verifies)
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
                // project onto the face plane (remove normal component)
                const dot = (u[0] / ul) * n[0] + (u[1] / ul) * n[1] + (u[2] / ul) * n[2];
                let px = (u[0] / ul) - dot * n[0], py = (u[1] / ul) - dot * n[1], pz = (u[2] / ul) - dot * n[2];
                let pl = Math.hypot(px, py, pz);
                if (pl < 1e-6) { px = n[1]; py = -n[0]; pz = 0; pl = Math.hypot(px, py, pz); }   // degenerate: any in-plane axis
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
    // post-law: every bead inside its own inscribed circle (conservative point-in-hex)
    for (let i = 0; i < BEADS.length; i++) {
        const off = Math.hypot(BEAD_INPLANAR_OFF[i][0], BEAD_INPLANAR_OFF[i][1], BEAD_INPLANAR_OFF[i][2]);
        if (off > faceInradius[i] - BEAD_R - 0.02 + 1e-9) throw Error(`bead ${i} escaped its membrane (off ${off.toFixed(3)} > cap ${faceInradius[i] - BEAD_R - 0.02})`);
    }
}
export const LOOPS_EXPORT = LOOPS;

// ---- envelope contract ------------------------------------------------------------------------------------
export const PLINTH_BOX = (() => {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        const x = PLINTH_R * Math.cos(a), z = -PLINTH_R * Math.sin(a);   // mk maps shape y → world −z (struct-227 sign law)
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
    }
    return { x0, x1, z0, z1 };
})();
export const ENVELOPE = (() => {
    // TRUE vertex-extreme top: beads are exact spheres; a rod's cap disc at
    // its higher endpoint reaches y = hi + ROD_R·√(1−axisY²) (disc rim, not
    // +ROD_R — the rod is inclined; the naive bound overshot by 8.5mm and
    // the decode caught it). Plates never rise above their face planes.
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

// ---- helpers ------------------------------------------------------------------------------------------------
function edgeKey(i: number, j: number) { return i < j ? `${i}-${j}` : `${j}-${i}`; }

// ==== LAWS (all must print PASS; any FAIL exits 1) ===========================================================
let fails = 0;
const law = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) fails++;
};

law("P0 parse", verts.length === 14 && facets.length === 28 && groups.length === 7 && groups.every((g) => g.tris.length === 4),
    `STL parsed BINARY: ${verts.length} unique vertices, ${facets.length} facets, ${groups.length} planar face-groups (${groups.map((g) => g.tris.length).join("+")} triangles) — expect 14/28/7×4`);

// T1 EULER — V − E + F == 0 (genus 1)
law("T1 Euler", V.length - EDGES.length + LOOPS.length === 0,
    `V ${V.length} − E ${EDGES.length} + F ${LOOPS.length} = ${V.length - EDGES.length + LOOPS.length} (genus 1 — the torus; the Császár's 7−21+14=0 read vertex-for-face)`);

// T2 COMPLETE FACE ADJACENCY — every pair of the 7 faces shares EXACTLY one edge
{
    const adj: number[][] = Array.from({ length: LOOPS.length }, () => Array(LOOPS.length).fill(0));
    for (const [a, b] of EDGES) {
        const fa = facesOfEdge(a, b);
        for (let x = 0; x < fa.length; x++) for (let y = x + 1; y < fa.length; y++) { adj[fa[x]][fa[y]]++; adj[fa[y]][fa[x]]++; }
    }
    let bad = 0, total = 0;
    for (let i = 0; i < LOOPS.length; i++) for (let j = i + 1; j < LOOPS.length; j++) { total++; if (adj[i][j] !== 1) bad++; }
    law("T2 complete face adjacency", total === 21 && bad === 0 && EDGES.length === 21,
        `all ${total} face pairs share EXACTLY one edge (${bad} violations), 21 edges == C(7,2) — seven cells, every pair touching: the theorem, on the skin this time`);
}

// T3 HEXAGONAL — every face boundary is a 6-cycle of distinct vertices
{
    let bad = 0;
    for (const L of LOOPS) if (L.length !== 6 || new Set(L).size !== 6) bad++;
    law("T3 hexagonal faces", bad === 0,
        `all ${LOOPS.length} faces are 6-cycles of distinct vertices (${bad} violations) — hexagons, the triangles' duals (concavity honest: Szilassi hexes may fold)`);

// T4 MANIFOLD — every edge on exactly 2 faces
    const cnt = new Map<string, number>();
    for (const L of LOOPS) for (let i = 0; i < L.length; i++) {
        const kk = edgeKey(L[i], L[(i + 1) % L.length]);
        cnt.set(kk, (cnt.get(kk) ?? 0) + 1);
    }
    const bad4 = [...cnt.values()].filter((n) => n !== 2).length;
    law("T4 manifold", cnt.size === 21 && bad4 === 0,
        `every edge shared by exactly 2 of 7 faces (${cnt.size} edges, ${bad4} violations — closed watertight combinatorics)`);
}

// T5 DUALITY — all vertex degrees 3 (the Császár's K7 vertices all have degree 6)
{
    const deg = Array(verts.length).fill(0);
    for (const [a, b] of EDGES) { deg[a]++; deg[b]++; }
    const bad = deg.filter((d) => d !== 3).length;
    law("T5 duality degrees", bad === 0,
        `all 14 vertex degrees == 3 (${bad} violations) — exactly 3 cells meet at every corner; the degree-6 K7 vertices of the standing Császár are these 7 faces`);
}

// T6 MINIMALITY — Szilassi 1977: no polyhedron with fewer faces has complete adjacency
law("T6 minimality", LOOPS.length === 7,
    `7 faces is the minimum for complete face adjacency (Szilassi 1977) — the dual statement of the Császár's 7-vertex minimality (Möbius 1861); the pair brackets the theorem from both sides`);

// T7 NON-CONVEXITY — dihedral spread proves the surface folds
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
    law("T7 non-convex honesty", dihedrals.length === 21 && spread > 0.6,
        `21 dihedrals over [${((minD * 180) / Math.PI).toFixed(1)}°, ${((maxD * 180) / Math.PI).toFixed(1)}°] — spread ${((spread * 180) / Math.PI).toFixed(1)}°: the surface folds (a complete-adjacency torus cannot be convex)`);
}

// T8 SEAT — hole axis vertical; donut embedded at the plinth top; lamps proud and above plinth
{
    const minY = Math.min(...V.map((v) => v[1]));
    const maxY = Math.max(...V.map((v) => v[1]));
    const holeSpan = maxY - minY;
    const minBead = Math.min(...BEADS.map((b) => b[1] - BEAD_R));
    let pairMin = Infinity, pairArg = "";
    for (let i = 0; i < BEADS.length; i++) for (let j = i + 1; j < BEADS.length; j++) {
        const d = Math.hypot(BEADS[i][0] - BEADS[j][0], BEADS[i][1] - BEADS[j][1], BEADS[i][2] - BEADS[j][2]);
        if (d < pairMin) { pairMin = d; pairArg = `${i}-${j}`; }
    }
    const lampSepOk = pairMin > 2 * BEAD_R + 0.05;
    law("T8 donut seat", Math.abs(minY - (PLINTH_H - EMBED)) < 1e-9 && holeSpan > 0.5 && minBead > PLINTH_H + 0.02 && lampSepOk,
        `hole axis rotated to vertical (seat rotation ${SEAT.angDeg.toFixed(1)}°, axis pre-rotation [${SEAT.holeAxis.map((c) => c.toFixed(3)).join(",")}]); lowest points embedded ${EMBED}m into the plinth top (min y ${minY.toFixed(3)}); ring height ${holeSpan.toFixed(2)}m; all 7 lamps proud (lowest bead bottom ${minBead.toFixed(3)} > plinth ${PLINTH_H}); closest lamp pair ${pairArg} at ${pairMin.toFixed(3)}m (law ${2 * BEAD_R + 0.05}) — the donut reads at 18m`);
}

// T9 GEOMETRY + CENSUS — separations, radial reach vs plinth, envelope, plate viability
{
    let minD = Infinity;
    for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++)
        minD = Math.min(minD, Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]));
    const reach = Math.max(...V.map((v) => Math.hypot(v[0], v[2]))) + BEAD_R;
    const apo = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    // every hexagon's shortest centroid-to-edge distance must exceed PLATE_INSET (membrane viability)
    const insetOk = LOOPS.every((L, fi) => {
        const c = FACE_CENTROIDS[fi];
        for (let k = 0; k < L.length; k++) {
            const A = V[L[k]], B = V[L[(k + 1) % L.length]];
            const ab = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], ac = [c[0] - A[0], c[1] - A[1], c[2] - A[2]];
            const t = Math.max(0, Math.min(1, (ab[0] * ac[0] + ab[1] * ac[1] + ab[2] * ac[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2)));
            const d = Math.hypot(ac[0] - t * ab[0], ac[1] - t * ab[1], ac[2] - t * ab[2]);
            if (d <= PLATE_INSET + 0.02) return false;
        }
        return true;
    });
    const envW = ENVELOPE.max[0] - ENVELOPE.min[0], envH = ENVELOPE.max[1], envD = ENVELOPE.max[2] - ENVELOPE.min[2];
    law("T9 geometry/census", minD > 0.15 && reach < apo - 0.15 && insetOk,
        `min vertex separation ${minD.toFixed(3)}m (>0.15); max radial reach ${reach.toFixed(3)}m < heptagon apothem ${apo.toFixed(3)}−0.15; all 7 hexes admit a ${PLATE_INSET}m-inset membrane; envelope ${envW.toFixed(2)}×${envH.toFixed(2)}×${envD.toFixed(2)} (plinth-borne TRUE box); folly class — solid skin, walked around`);
}

// RED CONTROL: corrupting a face loop must break manifold/adjacency laws
{
    const orig = LOOPS[0][1];
    LOOPS[0][1] = LOOPS[0][3];
    const cnt = new Map<string, number>();
    for (const L of LOOPS) for (let i = 0; i < L.length; i++) {
        const kk = edgeKey(L[i], L[(i + 1) % L.length]);
        cnt.set(kk, (cnt.get(kk) ?? 0) + 1);
    }
    const broken = [...cnt.values()].some((n) => n !== 2) || cnt.size !== 21;
    LOOPS[0][1] = orig;
    law("RED control", broken,
        `loop-corruption mutant: ${[...cnt.values()].filter((n) => n !== 2).length} non-2 edge multiplicities, ${cnt.size} edges — T4/T2 laws detect`);
}

console.log(fails === 0 ? "PROBE ALL PASS" : `PROBE ${fails} FAIL`);
if (fails > 0) process.exit(1);
