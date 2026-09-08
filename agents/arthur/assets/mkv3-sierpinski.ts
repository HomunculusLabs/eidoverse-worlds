// mkv3-sierpinski.ts — STRUCTURES LANE struct-100, Round 10 commission R10-4.
// THE SIERPINSKI SPIRE: the form ledger's fractal family opened planar
// (koch R10-3 — a border of self-similar EDGES). Nothing carries self-
// similarity in the VOLUME: a solid whose mass is made of smaller copies
// of itself, see-through at every level you walk toward — and INTO.
//
// ONE IDEA: A MOUNTAIN MADE OF MOUNTAINS. The spire IS the Sierpinski
// tetrahedron at iteration 3: one standing tetra carved by exact recursion
// into 4^3 = 64 half-scale-again solid tetra blocks, every gap real air.
// Walk under it: the base's central triangle is open — you stand INSIDE
// the mountain, stone floor plinth underfoot, four apex beads overhead.
//
// METHOD (exact, all assertions in-code):
//   - Seed tetra: equilateral base edge E=6.4 CCW (one vertex due +z,
//     koch lineage), apex up at H = E*sqrt(2/3).
//   - Subdivision by recursion on lattice units of E/8; each block is a
//     solid tetra with all six edges exactly E/8.
//   - DIGIT LAW asserted: in lattice coords (i,j,k) with i+j+k<=8, a block
//     origin exists iff the base-2 digits of (i,j,k) never share a bit
//     position — exactly 4^3 = 64 blocks, the closed-form tetrix census.
//   - All four seed apices survive as block vertices (bead seats).
//   - No two blocks overlap in volume (bounding-box SAT over all pairs,
//     point-touch excluded by strict gap tolerance).
//   - Plinth: full seed-base triangle, h 0.12 — grounds the corner blocks
//     and floors the walk-in void.
//   - 4 brass glow beads at the 4 seed apices (glow_ss_1..4 KEEP,
//     emissive 0x9a7030@0.85 dusk lineage).
//
// Classification: bbox h ~5.34, footprint 17.8 m^2 — vertical entity,
// enterable through the open base (central void lanes >= 1.4m by
// construction: the base gap triangle has side E/2 = 3.2m); two-way MCPL
// walk owed through the real lane. Node budget: stone bucket + plinth +
// 4 beads = 6 nodes.
//
// Determinism: fixed lattice, fixed seed trig, assertions below.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — fractal-family cool grey lineage (penrose struct-98, koch
// struct-99); plinth one tone deeper so the carving floats above its base.
const blockStone = texMat("ss_stone", [0x878b8e, 0x8f9396, 0x7d8184], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32 });
const plinthStone = texMat("ss_plinth", [0x767a7d, 0x7e8285, 0x6d7174], { rough: 0.96, scale: 2, weights: [3, 1, 1], seed: 4001 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

const E = 6.4;                     // seed tetra edge
const ITER = 3;                    // 64 blocks of edge E/8
const H = E * Math.sqrt(2 / 3);    // apex height
const R0 = E / Math.sqrt(3);       // base circumradius

// seed tetra: base CCW with one vertex due +z, apex up
const A: [number, number, number] = [R0 * Math.sin(0), 0, R0 * Math.cos(0)];
const B: [number, number, number] = [R0 * Math.sin(2 * Math.PI / 3), 0, R0 * Math.cos(2 * Math.PI / 3)];
const C: [number, number, number] = [R0 * Math.sin(4 * Math.PI / 3), 0, R0 * Math.cos(4 * Math.PI / 3)];
const D: [number, number, number] = [0, H, 0];
const seeds = [A, B, C, D];

const mid = (p: [number, number, number], q: [number, number, number]): [number, number, number] =>
    [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];

type Tet = [number, number, number][];
const blocks: Tet[] = [];
function carve(t: Tet, depth: number) {
    if (depth === ITER) { blocks.push(t); return; }
    const [v0, v1, v2, v3] = t;
    const v01 = mid(v0, v1), v02 = mid(v0, v2), v03 = mid(v0, v3);
    const v12 = mid(v1, v2), v13 = mid(v1, v3), v23 = mid(v2, v3);
    carve([v0, v01, v02, v03], depth + 1);
    carve([v01, v1, v12, v13], depth + 1);
    carve([v02, v12, v2, v23], depth + 1);
    carve([v03, v13, v23, v3], depth + 1);
}
carve([A, B, C, D], 0);

// ---- construction assertions ------------------------------------------------
{
    if (blocks.length !== Math.pow(4, ITER)) throw Error(`block count ${blocks.length} != ${Math.pow(4, ITER)}`);
    // every block: all six edges exactly E/8 (1e-9)
    const want = E / Math.pow(2, ITER);
    for (const t of blocks) {
        const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]] as Array<[number, number]>;
        for (const [i, j] of pairs) {
            const len = Math.hypot(t[i][0] - t[j][0], t[i][1] - t[j][1], t[i][2] - t[j][2]);
            if (Math.abs(len - want) > 1e-9) throw Error(`block edge ${len} != ${want}`);
        }
    }
    // DIGIT LAW closed-form census: lattice origin (i,j,k)/8 in basis (A->B, A->C, A->D),
    // block exists iff base-2 digits of (i,j,k) never share a bit position.
    const u: [number, number, number] = [(B[0] - A[0]) / 8, (B[1] - A[1]) / 8, (B[2] - A[2]) / 8];
    const v: [number, number, number] = [(C[0] - A[0]) / 8, (C[1] - A[1]) / 8, (C[2] - A[2]) / 8];
    const w: [number, number, number] = [(D[0] - A[0]) / 8, (D[1] - A[1]) / 8, (D[2] - A[2]) / 8];
    // lattice-min vertex of each block in (i,j,k), via barycentric solve
    const latticeIndexOf = (p: [number, number, number]) => {
        // solve p = A + (i/8)(B-A) + (j/8)(C-A) + (k/8)(D-A) exactly via barycentric
        const px = p[0] - A[0], py = p[1] - A[1], pz = p[2] - A[2];
        const det = (a: number[], b: number[], c: number[]) =>
            a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
        const i = det([px, py, pz], v, w) / det(u, v, w);
        const j = det(u, [px, py, pz], w) / det(u, v, w);
        const k = det(u, v, [px, py, pz]) / det(u, v, w);
        return [i, j, k].map(n => Math.round(n)); // lattice units: integers 0..8
    };
    const bitDisjoint = (i: number, j: number, k: number) => (i | j | k) === (i + j + k);
    let lawCount = 0;
    const lawSet = new Set<string>();
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) for (let k = 0; k < 8; k++)
        if (i + j + k <= 7 && bitDisjoint(i, j, k)) { lawCount++; lawSet.add(`${i},${j},${k}`); }
    if (lawCount !== 64) throw Error(`digit-law census ${lawCount} != 64`);
    let matched = 0;
    for (const t of blocks) {
        // lattice-min vertex = the block vertex with smallest (i+j+k)
        const idxs = t.map(latticeIndexOf);
        const sums = idxs.map(x => x[0] + x[1] + x[2]);
        const minI = idxs[sums.indexOf(Math.min(...sums))];
        const kk = `${minI[0]},${minI[1]},${minI[2]}`;
        if (lawSet.has(kk)) { matched++; lawSet.delete(kk); }
    }
    if (matched !== 64) throw Error(`blocks matching digit law ${matched} != 64 (remaining ${[...lawSet].slice(0, 4)})`);
    // seed apices survive
    for (const s of seeds) {
        const hit = blocks.some(t => t.some(p =>
            Math.hypot(p[0] - s[0], p[1] - s[1], p[2] - s[2]) < 1e-9));
        if (!hit) throw Error(`seed apex ${s} not preserved`);
    }
    // pairwise volume overlap: 3D bbox SAT with strict tolerance (point-touch OK)
    const box = (t: Tet) => {
        const xs = t.map(p => p[0]), ys = t.map(p => p[1]), zs = t.map(p => p[2]);
        return { mn: [Math.min(...xs), Math.min(...ys), Math.min(...zs)], mx: [Math.max(...xs), Math.max(...ys), Math.max(...zs)] };
    };
    const boxes = blocks.map(box);
    const overlap3 = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) => {
        for (let d = 0; d < 3; d++) {
            const lo = Math.max(a.mn[d], b.mn[d]), hi = Math.min(a.mx[d], b.mx[d]);
            if (hi - lo < -1e-9) return false; // separated on axis d
        }
        // true volumetric overlap requires positive extent on ALL axes beyond point/edge touch
        let vol = 1;
        for (let d = 0; d < 3; d++) {
            const lo = Math.max(a.mn[d], b.mn[d]), hi = Math.min(a.mx[d], b.mx[d]);
            vol *= Math.max(0, hi - lo);
        }
        return vol > 1e-9;
    };
    let bad = 0;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++)
        if (overlap3(boxes[i], boxes[j])) bad++;
    if (bad) throw Error(`${bad} block bbox pairs volumetrically overlap`);
    console.log(`tetrix OK: ${blocks.length} blocks, edge ${want.toFixed(4)}m exact, digit-law census 64/64 matched, 4 seed apices preserved, zero volumetric overlaps`);
}

// ---- build blocks (solid tetra, outward winding, flat normals) ----------------
{
    const centroid = (t: Tet): [number, number, number] => [
        (t[0][0] + t[1][0] + t[2][0] + t[3][0]) / 4,
        (t[0][1] + t[1][1] + t[2][1] + t[3][1]) / 4,
        (t[0][2] + t[1][2] + t[2][2] + t[3][2]) / 4,
    ];
    const faces = [[0, 2, 1], [0, 1, 3], [0, 3, 2], [1, 2, 3]]; // candidate winding, fixed below
    for (const t of blocks) {
        const c = centroid(t);
        const pos: number[] = [];
        for (const f of faces) {
            const [a, b, dd] = [t[f[0]], t[f[1]], t[f[2]]];
            // normal of a->b->d
            const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            const e2 = [dd[0] - a[0], dd[1] - a[1], dd[2] - a[2]];
            let nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
            // face must point AWAY from centroid; flip if needed
            const fx = (a[0] + b[0] + dd[0]) / 3 - c[0], fy = (a[1] + b[1] + dd[1]) / 3 - c[1], fz = (a[2] + b[2] + dd[2]) / 3 - c[2];
            const orient = nx * fx + ny * fy + nz * fz;
            const flip = orient < 0;
            const tri = flip ? [t[f[0]], t[f[2]], t[f[1]]] : [t[f[0]], t[f[1]], t[f[2]]];
            for (const p of tri) pos.push(p[0], p[1], p[2]);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.computeVertexNormals();
        g.add(new THREE.Mesh(geo, blockStone));
    }
}

// ---- plinth: full seed-base triangle, h 0.12 ---------------------------------
{
    const shape = new THREE.Shape();
    [A, B, C].forEach((p, i) => (i === 0 ? shape.moveTo(p[0], p[2]) : shape.lineTo(p[0], p[2])));
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0.12, 0);
    g.add(new THREE.Mesh(geo, plinthStone));
}

// ---- four brass beads at the seed apices --------------------------------------
const BR = 0.075;
const beadY = (s: [number, number, number]) => (s[1] === 0 ? 0.12 + BR - 0.03 : s[1] + BR - 0.03); // seated on plinth top / apex
seeds.forEach((s, i) => {
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BR, 12, 10), brassGlow);
    bead.position.set(s[0], beadY(s), s[2]);
    bead.name = `glow_ss_${i + 1}`;
    g.add(bead);
});

// ---- envelope assertions -------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y}`);
    // exact axis-aligned bounds of the seed base triangle (one vertex due +z):
    // vertices at az 0/120/240 -> x ±R0·(√3/2), z ∈ [−R0/2, +R0]; beads add BR
    const XS = R0 * Math.sqrt(3) / 2, ZMIN = -R0 / 2;
    const TOL = 0.02;
    if (Math.abs(env.max.x) > XS + BR + TOL || Math.abs(env.min.x) > XS + BR + TOL)
        throw Error(`x reach ${env.min.x.toFixed(2)}..${env.max.x.toFixed(2)} vs triangle ${XS.toFixed(3)}+bead`);
    if (env.max.z > R0 + BR + TOL || env.min.z < ZMIN - BR - TOL)
        throw Error(`z reach ${env.min.z.toFixed(2)}..${env.max.z.toFixed(2)} vs triangle [${ZMIN.toFixed(3)},${R0.toFixed(3)}]+bead`);
    if (Math.abs(env.max.y - (H + BR - 0.03 + BR)) > 0.02)
        throw Error(`apex crest ${env.max.y.toFixed(3)} vs expected ${(H + 2 * BR - 0.03).toFixed(3)}`);
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[0..${env.max.y.toFixed(3)}] | base circumradius ${R0.toFixed(3)} | 6 nodes expected after merge`);
}
const merged = mergeByMaterial(g, "sierpinski");
writeFileSync("agents/arthur/assets/village_sierpinski3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_sierpinski3.glb`);
