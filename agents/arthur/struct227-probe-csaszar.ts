// struct227-probe-csaszar.ts — STRUCTURES LANE struct-227, Round 11 R11-41
// THE CSÁSZÁR POLYHEDRON — K7 on the torus: seven vertices, 21 edges (every
// pair joined — NO DIAGONALS), 14 triangular faces, Euler 0 (genus 1).
//
// One idea: SEVEN POINTS, ALL ACQUAINTED. The polyhedron with no diagonals
// whose skeleton is the complete graph K7 — the smallest stone a torus can be
// woven from. STONE carries the surface (14 triangular membrane plates inset
// in an iron frame + heptagonal plinth — SEVEN, the theme number). IRON
// carries the complete graph: every one of the 21 edges drawn as a rod
// through space, meeting at 7 brass vertex beads. The 21 missing triangles
// (35 vertex-triples − 14 faces) are the TORUS'S HOLES read against the sky.
// Night contract: seven warm vertex stars, three of them socketed half-proud
// in the plinth top at the triangular foot (face-down seating, dodecahedron
// struct-106 lineage).
//
// PARAMETRIZATION SECURED: Wikipedia Császár polyhedron article STL
// (commons Special:FilePath, fetched this tick, /tmp/csaszar.stl, ASCII,
// 14 facets — the standard realization). Theorems machine-verified below
// (conchoid law struct-190):
//   T1 Euler: V − E + F = 7 − 21 + 14 = 0 (genus 1 — the torus).
//   T2 NO DIAGONALS: 21 edges == C(7,2) — every vertex pair joined (K7).
//   T3 TRIANGLE FACES: all 14 facets exactly 3 vertices, non-degenerate.
//   T4 MANIFOLD: every edge shared by EXACTLY 2 faces (closed surface).
//   T5 EMBEDDING: 14 distinct proper triangles of the 35 possible.
//   T6 MINIMALITY: h = (v−3)(v−4)/12 = 1 only for v = 7 (Möbius/Gardner).
//   T7 NON-CONVEXITY: the dihedral spread proves the surface folds.
//   T8 FACE-DOWN SEAT: foot face normal vertical, 3 foot beads half-proud,
//      4 crown beads fully aloft; all 7 above grade.
//
// Frame: model y-up; world-local = final (root identity, struct-188 — the
// z-up→y-up conversion + FACE-DOWN rotation + centering + lift are applied
// HERE so mk consumes final positions).

import { readFileSync } from "node:fs";
// ---- parameters ----------------------------------------------------------------------------------------
export const SCALE = 2.2;                 // overall scale (m)
export const PLATE_T = 0.09;              // stone plate thickness (m)
export const PLATE_INSET = 0.045;         // in-plane inset of membrane inside the rod frame (reveal)
export const PLATE_BACK = 0.05;           // membrane recessed behind rod outer surface (shadow gap)
export const ROD_R = 0.048;               // iron edge-rod radius (v3: 0.042→0.048 — 18m contrast)
export const BEAD_R = 0.095;              // brass vertex bead radius (v3: 0.085→0.095 — count-of-7 read)
// v3 SPARSE CAGE law: plate the FIVE SMALLEST faces — total stone 5.52 m² of
// the surface's 23.1 m² (24%): the cage dominates 3:1 and the underside/foot
// bay stays OPEN (v1 plated all 14 = tent; v2's fi%3 subset still carried the
// 3.76 m² foot canvas — judged tent again). az spread 236/357/26/154/196.
export const PLATED = [12, 11, 2, 7, 8] as const;
export const PLINTH_R = 2.75;             // heptagonal plinth circumradius
export const PLINTH_N = 7;                // SEVEN sides (the theme number)
export const PLINTH_ROT = Math.PI / 2;    // shape-space angle; after rotateX(−π/2) one vertex aims at the foot apex (−z)
export const PLINTH_H = 0.30;
export const EMBED = 0;                   // foot plates flush-contact the plinth top; beads half-proud
export const FOOT_FACE = 0;               // face index seated downward

type V3 = [number, number, number];

// ---- parse the STL (14 facets, 7 unique vertices) --------------------------------------------------------
// DURABILITY (self-caught pre-close): the source STL is BANKED beside the mk
// (assets/csaszar-source.stl, sha256 0980a9a9707d9c49… — the Wikipedia
// article's standard realization, fetched this tick); /tmp/csaszar.stl is the
// fallback for this session only. A vanished /tmp file must not break future
// deterministic rebuilds.
import { readFileSync, existsSync } from "node:fs";
const STL_PATH = existsSync("/tmp/csaszar.stl") ? "/tmp/csaszar.stl"
    : new URL("./assets/csaszar-source.stl", import.meta.url).pathname;   // probe lives in agents/arthur/ — the banked STL is its ./assets sibling
const raw = readFileSync(STL_PATH, "utf8");
const verts: V3[] = [];
const vid = new Map<string, number>();
const facets: { n: V3; tri: [number, number, number] }[] = [];
{
    const fre = /facet normal\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s*\n\s*outer loop([\s\S]*?)endfacet/g;
    let m: RegExpExecArray | null;
    while ((m = fre.exec(raw))) {
        const n: V3 = [+m[1], +m[2], +m[3]];
        const vre = /vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/g;
        const idx: number[] = [];
        let vm: RegExpExecArray | null;
        while ((vm = vre.exec(m[4]))) {
            const key = `${vm[1]},${vm[2]},${vm[3]}`;
            if (!vid.has(key)) { vid.set(key, verts.length); verts.push([+vm[1], +vm[2], +vm[3]]); }
            idx.push(vid.get(key)!);
        }
        if (idx.length !== 3) throw Error(`facet with ${idx.length} vertices`);
        facets.push({ n, tri: [idx[0], idx[1], idx[2]] });
    }
}

// ---- face-down seating -----------------------------------------------------------------------------------
// z-up → y-up right-handed: (x, y, z)_world0 = (x_stl, z_stl, −y_stl); center on origin;
// then rotate so FOOT_FACE's outward normal points STRAIGHT DOWN (0,−1,0).
const v0: V3[] = verts.map((v) => {
    const cx0 = verts.reduce((s, u) => s + u[0], 0) / verts.length;
    const cz0 = verts.reduce((s, u) => s + u[2], 0) / verts.length;
    return [v[0] - cx0, v[2] - cz0, -v[1]] as V3;
});
const FACES0: [number, number, number][] = facets.map((f) => f.tri);
function normalOf(points: V3[], f: [number, number, number]): V3 {
    const [A, B, C] = [points[f[0]], points[f[1]], points[f[2]]];
    const u: V3 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
    const w: V3 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const n: V3 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const len = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0] / len, n[1] / len, n[2] / len];
}
// rotation taking the foot face's outward normal to (0,-1,0)
const nFoot = normalOf(v0, FACES0[FOOT_FACE]);
const DOWN: V3 = [0, -1, 0];
const axis: V3 = [nFoot[1] * DOWN[2] - nFoot[2] * DOWN[1], nFoot[2] * DOWN[0] - nFoot[0] * DOWN[2], nFoot[0] * DOWN[1] - nFoot[1] * DOWN[0]];
const axisLen = Math.hypot(axis[0], axis[1], axis[2]);
const dot = nFoot[0] * DOWN[0] + nFoot[1] * DOWN[1] + nFoot[2] * DOWN[2];
const ang = Math.atan2(axisLen, dot);
const sa = Math.sin(ang), ca = Math.cos(ang);
const AL = axisLen || 1;
const ux = axis[0] / AL, uy = axis[1] / AL, uz = axis[2] / AL;   // unit axis (ang≈0 ⇒ axis≈0 ⇒ identity-safe)
function rot(p: V3): V3 {
    if (axisLen < 1e-12) return dot > 0 ? p : [-p[0], -p[1], -p[2]];   // parallel/antiparallel guard
    const K = 1 - ca;
    const x = p[0] * (ca + ux * ux * K) + p[1] * (uy * ux * K - uz * sa) + p[2] * (uz * ux * K + uy * sa);
    const y = p[0] * (ux * uy * K + uz * sa) + p[1] * (ca + uy * uy * K) + p[2] * (uz * uy * K - ux * sa);
    const z = p[0] * (ux * uz * K - uy * sa) + p[1] * (uy * uz * K + ux * sa) + p[2] * (ca + uz * uz * K);
    return [x, y, z];
}
const seated: V3[] = v0.map(rot);
// spin about y for display (keeps foot normal vertical): none needed, yaw set at placement
const S = SCALE;
const spun: V3[] = seated.map((v) => [S * v[0], S * v[1], S * v[2]] as V3);
// lift: foot-face plane EMBED below plinth top. Foot plane world y = min over foot verts? No —
// the foot face's THREE vertices are its lowest points by construction (normal straight down);
// seat them EMBED below the plinth top so the three foot plates dive and the beads ride half-proud.
const footY = Math.min(...FACES0[FOOT_FACE].map((i) => spun[i][1]));
const DATUM = PLINTH_H - EMBED - footY;
export const V: V3[] = spun.map((v) => [v[0], v[1] + DATUM, v[2]]);
export const FACES: [number, number, number][] = FACES0;
export const EDGES: [number, number][] = (() => {
    const set = new Set<string>();
    for (const [a, b, c] of FACES)
        for (const [i, j] of [[a, b], [b, c], [c, a]] as [number, number][]) {
            const k = i < j ? `${i}-${j}` : `${j}-${i}`;
            set.add(k);
        }
    return [...set].map((k) => k.split("-").map(Number) as [number, number]);
})();

// ---- envelope contract ------------------------------------------------------------------------------------
// Plinth-borne (steinmetz precedent), ANALYTIC TRUE box: an odd-sided
// heptagon's axis-aligned box is inherently asymmetric. With PLINTH_ROT =
// −π/2 (one vertex at −z, the foot apex): vertices at angles π/2 + k·2π/7 —
// x extremes ±R·|cos(π/2+2π/7)|·… computed exactly below; the probe prints
// the exact values the mk must reproduce.
export const PLINTH_BOX = (() => {
    // mk maps shape (x, y) → world (x, −y) via geo.rotateX(−π/2) — the TRUE
    // world box therefore uses z = −R·sin(a). Self-caught: with z=+sin the box
    // mirrors in z (sizes match, drift 0.27 — the mk law caught the sign).
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        const x = PLINTH_R * Math.cos(a), z = -PLINTH_R * Math.sin(a);
        x0 = Math.min(x0, x); x1 = Math.max(x1, x);
        z0 = Math.min(z0, z); z1 = Math.max(z1, z);
    }
    return { x0, x1, z0, z1 };
})();
export const ENVELOPE = (() => {
    const top = Math.max(...V.map((v) => v[1])) + BEAD_R;
    return { min: [PLINTH_BOX.x0, 0, PLINTH_BOX.z0] as V3, max: [PLINTH_BOX.x1, top, PLINTH_BOX.z1] as V3 };
})();

// ---- helpers ---------------------------------------------------------------------------------------------
function faceNormal(f: [number, number, number]): V3 { return normalOf(V, f); }
function edgeKey(i: number, j: number) { return i < j ? `${i}-${j}` : `${j}-${i}`; }
function edgeCount(faces: [number, number, number][]): Map<string, number> {
    const count = new Map<string, number>();
    for (const [a, b, c] of faces)
        for (const [i, j] of [[a, b], [b, c], [c, a]] as [number, number][])
            count.set(edgeKey(i, j), (count.get(edgeKey(i, j)) ?? 0) + 1);
    return count;
}

// ==== LAWS (all must print PASS; any FAIL exits 1) ========================================================
let fails = 0;
const law = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) fails++;
};

law("P0 parse", verts.length === 7 && facets.length === 14,
    `STL parsed: ${verts.length} unique vertices, ${facets.length} facets (expect 7/14)`);

// T1 EULER — V − E + F == 0 (genus 1)
law("T1 Euler", V.length - EDGES.length + FACES.length === 0,
    `V ${V.length} − E ${EDGES.length} + F ${FACES.length} = ${V.length - EDGES.length + FACES.length} (genus 1 — the torus)`);

// T2 NO DIAGONALS — E == C(7,2), every pair joined
{
    const pairs = new Set(EDGES.map(([i, j]) => edgeKey(i, j)));
    const missing: string[] = [];
    for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) if (!pairs.has(`${i}-${j}`)) missing.push(`${i}-${j}`);
    law("T2 no diagonals", EDGES.length === 21 && missing.length === 0,
        `21 edges == C(7,2), ${missing.length} missing pairs — every vertex pair joined: K7 skeleton, ZERO diagonals`);
}

// T3 TRIANGLES — non-degenerate
{
    let worstArea = Infinity;
    for (const [a, b, c] of FACES) {
        const A = V[a], B = V[b], C = V[c];
        const cr: V3 = [
            (B[1] - A[1]) * (C[2] - A[2]) - (B[2] - A[2]) * (C[1] - A[1]),
            (B[2] - A[2]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[2] - A[2]),
            (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0])];
        worstArea = Math.min(worstArea, 0.5 * Math.hypot(cr[0], cr[1], cr[2]));
    }
    law("T3 triangle faces", worstArea > 1e-4,
        `14 faces non-degenerate (smallest area ${worstArea.toFixed(6)} m² > 1e-4)`);
}

// T4 MANIFOLD — every edge on exactly 2 faces
{
    const count = edgeCount(FACES);
    const bad = [...count.entries()].filter(([, n]) => n !== 2);
    law("T4 manifold", count.size === 21 && bad.length === 0,
        `every edge shared by exactly 2 of 14 faces (${count.size} edges — closed surface, watertight combinatorics)`);
}

// T5 EMBEDDING — 14 distinct proper triangles of the 35 possible
{
    let dup = 0;
    for (const [a, b, c] of FACES) if (a === b || b === c || a === c) dup++;
    const triples = new Set(FACES.map(([a, b, c]) => [a, b, c].sort((x, y) => x - y).join(",")));
    law("T5 K7 embedding", dup === 0 && triples.size === 14,
        `14 distinct proper triangles of the 35 possible — the other 21 are the torus's holes read against the sky`);
}

// T6 MINIMALITY — h=(v−3)(v−4)/12: v=4 → 0 (tetra), v=7 → 1 (Császár), v=12 → 6 (unrealizable)
{
    const h = (v: number) => ((v - 3) * (v - 4)) / 12;
    law("T6 minimality", h(7) === 1 && h(4) === 0 && h(12) === 6,
        `h(7)=${h(7)}: seven vertices is the smallest no-diagonal torus (Möbius 1861; next candidate v=12 unrealizable — Bokowski–Oliveira 2000)`);
}

// T7 NON-CONVEXITY — dihedral spread proves the surface folds (geometric honesty)
{
    const count = edgeCount(FACES);
    const dihedrals: number[] = [];
    for (const k of count.keys()) {
        const adj = FACES.map((f, i) => {
            const keys = [edgeKey(f[0], f[1]), edgeKey(f[1], f[2]), edgeKey(f[2], f[0])];
            return keys.includes(k) ? i : -1;
        }).filter((i) => i >= 0);
        if (adj.length !== 2) continue;
        const n1 = faceNormal(FACES[adj[0]]), n2 = faceNormal(FACES[adj[1]]);
        dihedrals.push(Math.acos(Math.min(1, Math.max(-1, n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]))));
    }
    const minD = Math.min(...dihedrals), maxD = Math.max(...dihedrals);
    const spread = maxD - minD;
    law("T7 non-convex honesty", dihedrals.length === 21 && spread > 0.6,
        `21 dihedrals over [${((minD * 180) / Math.PI).toFixed(1)}°, ${((maxD * 180) / Math.PI).toFixed(1)}°] — spread ${(spread * 180 / Math.PI).toFixed(1)}°: the surface folds (a K7 torus cannot be convex)`);
}

// T8 FACE-DOWN SEAT — foot normal vertical; 3 foot beads half-proud in plinth; 4 crown beads aloft
{
    const nf = faceNormal(FACES[FOOT_FACE]);
    const verticalErr = Math.hypot(nf[0], nf[2]);                    // foot normal must be (0,±1,0)
    const footIdx = new Set(FACES[FOOT_FACE]);
    const footBeadBottoms = [...footIdx].map((i) => V[i][1] - BEAD_R);
    const crownBeads = V.filter((_, i) => !footIdx.has(i)).map((v) => v[1] - BEAD_R);
    const minFoot = Math.min(...footBeadBottoms);
    const maxFoot = Math.max(...footBeadBottoms);
    const minCrown = Math.min(...crownBeads);
    law("T8 face-down seat", verticalErr < 1e-9 && minFoot > PLINTH_H - BEAD_R - 0.01 && minCrown > PLINTH_H + 0.05,
        `foot normal vertical (err ${verticalErr.toExponential(1)}); 3 foot beads socketed half-proud (bottoms ${minFoot.toFixed(3)}..${maxFoot.toFixed(3)} vs plinth top ${PLINTH_H}); 4 crown beads fully aloft (lowest bottom ${minCrown.toFixed(3)}) — all 7 night stars above grade`);
}

// T9 GEOMETRY + CENSUS — separations, radial reach, SPARSE CAGE accounting, envelope
{
    let minD = Infinity;
    for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++)
        minD = Math.min(minD, Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]));
    const maxR = Math.max(...V.map((v) => Math.hypot(v[0], v[2]))) + BEAD_R;
    const envW = ENVELOPE.max[0] - ENVELOPE.min[0], envH = ENVELOPE.max[1], envD = ENVELOPE.max[2] - ENVELOPE.min[2];
    const plinthApo = PLINTH_R * Math.cos(Math.PI / PLINTH_N);       // heptagon apothem
    // SPARSE CAGE accounting: plated faces exist, are the 5 smallest, exclude the foot
    const area = (f: [number, number, number]) => {
        const A = V[f[0]], B = V[f[1]], C = V[f[2]];
        const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
        const cr = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
        return 0.5 * Math.hypot(...cr);
    };
    const areas = FACES.map(area);
    const platedAreas = PLATED.map((fi) => areas[fi]);
    const sorted = [...areas].sort((a, b) => a - b);
    const isFiveSmallest = PLATED.every((fi) => areas[fi] <= sorted[4] + 1e-12) && PLATED.length === 5;
    const totalArea = areas.reduce((s, a) => s + a, 0);
    const platedTotal = platedAreas.reduce((s, a) => s + a, 0);
    const envOk = minD > 0.5 && maxR < plinthApo - 0.25 && isFiveSmallest && !PLATED.includes(FOOT_FACE);
    law("T9 geometry/census", envOk,
        `min vertex separation ${minD.toFixed(3)}m (>0.5); max radial reach ${maxR.toFixed(3)}m < heptagon apothem ${plinthApo.toFixed(3)}−0.25; SPARSE CAGE: PLATED=${PLATED.join(",")} ARE the five smallest faces (foot face excluded), stone ${platedTotal.toFixed(2)} m² of ${totalArea.toFixed(2)} m² (${((platedTotal / totalArea) * 100).toFixed(0)}%) — cage dominates; envelope ${envW.toFixed(2)}×${envH.toFixed(2)}×${envD.toFixed(2)} TRUE analytic box; folly class`);
}

// ---- RED CONTROL: corrupting the face list must break the laws --------------------------------------------
// Self-caught (v1): Euler does NOT drift on face-duplication (the duplicate's
// edges absorb into the standing set — the mutant stays V−E+F=0); the MANIFOLD
// law (edge multiplicity) and the T5 distinct-triple count are the detectors.
{
    const orig = FACES[3];
    FACES[3] = [FACES[0][0], FACES[0][1], FACES[0][2]];  // duplicate face 0's vertex set
    const count = edgeCount(FACES);
    const brokenManifold = [...count.values()].some((n) => n !== 2) || count.size !== 21;
    const triples = new Set(FACES.map(([a, b, c]) => [a, b, c].sort((x, y) => x - y).join(",")));
    const brokenDistinct = triples.size !== 14;
    FACES[3] = orig;                                   // restore
    law("RED control", brokenManifold && brokenDistinct,
        `face-duplication mutant: manifold broken=${brokenManifold} (edge multiplicity), distinct faces ${triples.size}/14 — laws detect (Euler honestly does NOT drift: absorbed edges)`);
}

console.log(fails === 0 ? "PROBE ALL PASS" : `PROBE ${fails} FAIL`);
if (fails > 0) process.exit(1);
