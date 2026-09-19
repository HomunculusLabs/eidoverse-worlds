// struct247-probe-tret.ts — STRUCTURES LANE struct-247, Round 11 R11-59.
// THE TRUNCATED TETRAHEDRON. Form-ledger grep fresh this tick: truncated
// tetra|ttet|tret|triakis 0 real mentions across STRUCTURES-PLAN +
// IMPROVEMENTS + IMPROVE-PLAN + CITY-PLAN(-V2) ("catalan" hits are the
// R11-8 MINIMAL SURFACE, not the Catalan solid triakis tetrahedron — the
// tret's dual stays unbuilt too). The ARCHIMEDEAN branch's fourth member
// (struct-237 cuboctahedron, struct-243 tico, struct-245 toct) and the
// PARENT-ECHO of the tetrahedron: cut each of the four corners at exactly
// 1/3 — the SAME law as tico and toct — and the parent's 4 corners become
// 4 TRIANGLES while its 4 faces become 4 HEXAGONS (the hexagon planes ARE
// the parent's face planes; T5: H-H dihedral == the tetrahedron's own
// arccos(1/3) = 70.5288°).
//
// ONE IDEA: THE BALANCED REMAINDER. Cut the four corners at a third and
// exactly 23 of 27 parts remain — every removed corner is similar to the
// parent at ratio 1/3, so each is exactly 1/27 of its volume
// (4·(1/27) taken, 23/27 standing). Machine-verified below, not asserted
// from prose (T6): the divergence-theorem volume of the BUILT faces over
// the exact corner determinants. Presentation: the parent balanced on its
// POINT — triangle-down, the vertex-end cut flat as the foot; a narrow
// foot, wide shoulders, the flat hexagon crown. IRON carries the four
// TRIANGLES (the cuts — the 4/27 taken, dark) + all 18 seam bonds; STONE
// carries the four HEXAGONS (the parent's own planes — what remains) +
// the EIGHT-sided dais (one side per face, 4+4 — the family theme law).
// Night contract: four warm brass beads at the four HEXAGON centers — the
// four that remain, lit: one CROWN dead on the axis (reads from every
// azimuth) + three at the waist in an exact 120° ring, one snapped dead
// to az 0. The iron cuts stay dark: the removed corners are marked by
// absence, not by light.
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   Parent: tetrahedron M = (1,1,1),(1,−1,−1),(−1,−1,1),(−1,1,−1) — all
//   pairwise distances 2√2, so every triple is a face (4 faces, 6 edges).
//   Truncation: on each parent edge A→B the two points A+(B−A)/3 and
//   A+2(B−A)/3 — the SAME 1/3 law as tico/toct. Uniform edge a = 2√2/3
//   (corner-cut side t·2√2 == middle (1−2t)·2√2 exactly at t = 1/3; the
//   hexagon angles are exactly 120° there — equilateral AND equiangular,
//   a genuine Archimedean, vertex figure 3.6.6).
//   R_tret = (a/4)·√22 == √11/3 in unit coords (all 12 verts at R).
//   Hexagon apothem (face-plane constant) 1/√3; triangle plane 5/(3√3).
//   Seat: parent vertex (1,1,1)/√3 → −Y (TRIANGLE DOWN, 3-fold axis);
//   top hexagon faces dead up (its normal is exactly −Â).
//
// DAIS LAW (same-tick honest fix, struct-247): the toct chassis sized the
// dais by RADIUS — fine at N=14 (cos(π/14) = 0.975, rounding hid the
// gap) but at N=8 the polygon is far from circular and radius-sizing
// UNDER-covers the apothem direction (apothem-first: R = margin/cos(π/N)).
// The law is now apothem-first for all N.
//
// THEOREMS machine-verified below (conchoid law):
//   T1 Euler: 12 − 18 + 8 = 2 (sphere).
//   T2 face census: 4 regular triangles (60°) + 4 regular hexagons (120°).
//   T3 vertex census: degree 3 everywhere; exactly 1 triangle + 2 hexagons
//      at every vertex (12×) — figure 3.6.6.
//   T4 manifold: every edge on exactly 2 faces.
//   T5 uniformity: all 12 verts at exactly R_tret; dihedrals exactly TWO
//      classes — H-H dot == −1/3 (interior 70.5288° — the PARENT
//      tetrahedron's own, because the hexagon planes are the parent's face
//      planes), T-H dot == +1/3 (interior 109.4712°); zero triangle-
//      triangle edges (no two cuts share a wall — every edge of a triangle
//      borders a hexagon: 12 T-H + 6 H-H == 18).
//   T6 THE BALANCED REMAINDER: parent volume by exact determinant; each of
//      the 4 corner tetrahedra exactly V/27 (similarity 1/3); the tret's
//      own volume by the divergence theorem over its built faces —
//      V_tret/V_parent == 23/27 exactly AND V_tret == V_parent − 4·V_corner
//      (two independent computations agreeing).
//   T7 seat: bottom triangle FLAT at dais top (3 verts level), top
//      hexagon parallel (6 verts level), 120° symmetry about Y, centroid
//      on axis, height == target, reach+rod ≤ dais apothem (never
//      overhangs — apothem-first sizing); beads: crown dead on axis + 3
//      waist at exact 120°, one snapped dead to az 0, ALL ALOFT;
//      FINIAL-CLEARANCE LAW (v2, the night-gameplay FAIL cure): the crown
//      bead rides a stem of height STEM_H above the crown bead plane and
//      must clear the crown rim's sight line from the reading distance —
//      bead_top must rise above (rim_y + (rim_y − eye)·bead_r/READER_D)
//      by ≥ 1.5·BEAD_R margin — so it reads from EVERY ground vantage.
//   T8 immersion: every inset plate corner, lifted to the plate mid-plane,
//      lies strictly INSIDE the convex solid (no face-plane poke-through);
//      corner tuck into the rod cylinders reported.
//   RED control: --red displaces one vertex 0.3 — T2/T5 must fail.

export const TARGET_H = 5.9;              // seated solid height (triangle axis)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.15;               // brass remainder bead (family scale)
export const BEAD_POKE = 0.02;            // bead center proud of the face plane (grazing-read law, disclosed)
export const STEM_H = 1.30;               // FINIAL stem: crown bead lifted on an iron pin (v2 — see occlusion law below)
export const STEM_R = 0.03;               // finial stem radius (slender iron pin, Observatory-gnomon idiom)
export const READER_D = 18;               // lane reading distance (sight-line law domain)
export const READER_EYE = 1.65;           // reader eye height
export const PLATE_T = 0.10;              // panel thickness
export const PLATE_INSET = 0.07;          // panel corner inset (seam reveal — tico/toct family look)
export const PLATE_BACK = 0.018;          // panel outer face behind rod surface
export const PLINTH_N = 8;                // EIGHT sides — one per face (4 triangles + 4 hexagons)
export const PLINTH_ROT = 0;              // corners ON the axes
export const PLINTH_H = 0.30;

type V3 = [number, number, number];

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const nrm = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];
const dist = (a: V3, b: V3) => Math.hypot(...sub(a, b));
const segDist = (p: V3, a: V3, b: V3) => {
    const ab = sub(b, a), ap = sub(p, a);
    const ab2 = dot(ab, ab);
    const t = Math.max(0, Math.min(1, dot(ap, ab) / ab2));
    return Math.hypot(...sub(ap, mul(ab, t)));
};

// ---- parent tetrahedron: (1,1,1),(1,−1,−1),(−1,−1,1),(−1,1,−1) — every pair an edge ---------------------------------
const M: V3[] = [[1, 1, 1], [1, -1, -1], [-1, -1, 1], [-1, 1, -1]];
const P_EDGE = 2 * Math.SQRT2;                // exact for these coords
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 6) throw Error(`parent edges ${P_EDGES.length} != 6`);

// ---- truncation at 1/3 (the SAME law as tico/toct): 12 verts, deduped by proximity ----------------------------------
const A_UNIT = P_EDGE / 3;                    // uniform edge of the unit tret (2√2/3)
const pts: V3[] = [];
const pidx = (p: V3) => {
    const k = pts.findIndex((q) => dist(q, p) < 1e-9);
    if (k >= 0) return k;
    pts.push(p); return pts.length - 1;
};
for (const [i, j] of P_EDGES) {
    pidx(add(M[i], mul(sub(M[j], M[i]), 1 / 3)));
    pidx(add(M[i], mul(sub(M[j], M[i]), 2 / 3)));
}
if (pts.length !== 12) throw Error(`truncation verts ${pts.length} != 12`);
const R_UNIT = Math.hypot(...pts[0]);         // √11/3
const R_CLOSED = (A_UNIT / 4) * Math.sqrt(22); // closed form — must equal R_UNIT

// ---- tret edges by distance ----------------------------------------------------------------------------------------
const EDGES: [number, number][] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++)
    if (Math.abs(dist(pts[i], pts[j]) - A_UNIT) < 1e-9) EDGES.push([i, j]);
if (EDGES.length !== 18) throw Error(`tret edges ${EDGES.length} != 18`);

// ---- faces ---------------------------------------------------------------------------------------------------------
type Face = { k: number; verts: number[]; center: V3; n: V3; isTri: boolean };
const faces: Face[] = [];
const orderRing = (ring: V3[]): { verts: number[]; center: V3; n: V3 } => {
    const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / ring.length);
    const n = nrm(c);                                  // centered solid: outward normal
    const e1 = nrm(sub(ring[0], c));
    const e2 = cross(n, e1);
    const ordered = [...ring].sort((p, q) =>
        Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
    return { verts: ordered.map((p) => pidx(p)), center: c, n };
};
// triangles: one per parent vertex (its 3 near cut points)
for (let i = 0; i < 4; i++) {
    const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
    if (nbrs.length !== 3) throw Error(`parent degree ${nbrs.length} != 3`);
    const ring = nbrs.map((j) => add(M[i], mul(sub(M[j], M[i]), 1 / 3)));
    const { verts, center, n } = orderRing(ring);
    faces.push({ k: 3, verts, center, n, isTri: true });
}
// hexagons: one per parent face — walk the triangle, take both cut points per directed edge
{
    const pAdj = (a: number, b: number) => P_EDGES.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
    const seen = new Set<string>();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) {
        if (!(i < j && j < k)) continue;
        if (!pAdj(i, j) || !pAdj(j, k) || !pAdj(i, k)) continue;
        const key = [i, j, k].sort((a, b) => a - b).join("-");
        if (seen.has(key)) continue;
        seen.add(key);
        const c = mul(add(add(M[i], M[j]), M[k]), 1 / 3);
        const n = nrm(c);
        let cyc: number[] = [i, j, k];
        const e1 = sub(M[j], M[i]), e2 = sub(M[k], M[j]);
        if (dot(cross(e1, e2), n) < 0) cyc = [i, k, j];
        const ring: V3[] = [];
        for (let t = 0; t < 3; t++) {
            const A = M[cyc[t]], B = M[cyc[(t + 1) % 3]];
            ring.push(add(A, mul(sub(B, A), 1 / 3)));
            ring.push(add(A, mul(sub(B, A), 2 / 3)));
        }
        const o = orderRing(ring);
        faces.push({ k: 6, verts: o.verts, center: o.center, n: o.n, isTri: false });
    }
}
if (faces.length !== 8) throw Error(`faces ${faces.length} != 8`);
if (faces.filter((f) => f.isTri).length !== 4) throw Error("triangle count != 4");

// ---- edgeFaces (module scope — used by T4/T5) ----------------------------------------------------------------------
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < faces.length; fi++) for (let t = 0; t < faces[fi].verts.length; t++) {
    const a = faces[fi].verts[t], b = faces[fi].verts[(t + 1) % faces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ---- seating: parent vertex (1,1,1)/√3 → −Y (TRIANGLE DOWN, 3-fold seat), twist-snap a WAIST bead to az 0 ------------
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const v0 = nrm(M[0]);                          // (1,1,1)/√3 — the bottom triangle's parent vertex
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// the bottom face = the TRIANGLE whose rotated center points most downward
let botTri: Face = faces[0];
{
    let bestDot = Infinity;
    for (const f of faces) {
        if (!f.isTri) continue;
        const d = dot(rot1(f.center), [0, 1, 0]);
        if (d < bestDot) { bestDot = d; botTri = f; }
    }
}
// twist-snap: a WAIST hexagon bead (outward normal NOT the dead-up crown —
// waist normals sit at n·up == −1/3) dead to az 0
const az0 = (() => {
    let best = Infinity, az = 0;
    for (const f of faces) {
        if (f.isTri) continue;
        const nr = rot1(f.n);
        if (nr[1] > 0.9) continue;                     // the crown faces dead up — az undefined
        const c = rot1(f.center);
        const a = Math.atan2(c[2], c[0]);
        const norm = Math.atan2(Math.sin(a), Math.cos(a));
        if (Math.abs(norm) < best) { best = Math.abs(norm); az = a; }
    }
    return az;
})();
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], az0);   // +Y rotation maps az a → a−φ, so snapping az0→0 needs φ=+az0 (struct-245 law)
const rot = (v: V3): V3 => rot2(rot1(v));

// ---- scale + lift: bottom triangle plane lands exactly on the dais top ----------------------------------------------
const seatedUnit = pts.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
export const EDGE = A_UNIT * SCALE;
export const R_TRET = R_UNIT * SCALE;
const seated = seatedUnit.map((v) => mul(v, SCALE));
const yMinUnit = Math.min(...seatedUnit.map((v) => v[1]));
const LIFT = PLINTH_H - yMinUnit * SCALE;
export const V: V3[] = seated.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);
export const SOLID_CENTER: V3 = [0, LIFT, 0];            // seatedUnit was origin-centered
export const FACE_V: number[][] = faces.map((f) => f.verts);
export const CENTERS: V3[] = faces.map((f) => {
    const c = rot(f.center);
    return [c[0] * SCALE, c[1] * SCALE + LIFT, c[2] * SCALE] as V3;
});
export const NORMALS: V3[] = faces.map((f) => rot(f.n));
export const IS_TRI: boolean[] = faces.map((f) => f.isTri);
export const E: [number, number][] = EDGES;
export const BOT_TRI_IDX = faces.indexOf(botTri);

// RED control (--red displaces one vertex: breaks side/uniformity/seat laws)
if (process.argv.includes("--red")) {
    V[7] = [V[7][0] + 0.3, V[7][1] - 0.2, V[7][2] + 0.15];
    console.log("RED MODE: vertex 7 displaced 0.3 — T2/T5 MUST fail");
}

// ---- derived footprint constants (BEFORE all checks — no TDZ) --------------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
// APOTHEM-FIRST dais law (struct-247 fix): size by the margin over cos(π/N) so the
// APOTHEM — not the circumradius — covers reach+rod. The toct radius-first formula
// under-covers at N=8 by (1/cos(π/8) − 1)·R ≈ 8.2% (0.31m here).
export const PLINTH_R = Math.ceil(((MAX_H + ROD_R + 0.10) / Math.cos(Math.PI / PLINTH_N)) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// ---- T1 Euler --------------------------------------------------------------------------------------------------------
check("T1 Euler 12−18+8 = 2", V.length === 12 && E.length === 18 && faces.length === 8 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census ---------------------------------------------------------------------------------------------------
{
    let worstSide = 0, worstAng = 0;
    for (const f of faces) {
        const want = f.k === 3 ? Math.PI / 3 : 2 * Math.PI / 3;   // 60° / 120°
        for (let t = 0; t < f.verts.length; t++) {
            const p0 = V[f.verts[(t + f.verts.length - 1) % f.verts.length]];
            const p1 = V[f.verts[t]];
            const p2 = V[f.verts[(t + 1) % f.verts.length]];
            worstSide = Math.max(worstSide, Math.abs(dist(p0, p1) - EDGE));
            const a1 = sub(p0, p1), a2 = sub(p2, p1);
            const ang = Math.acos(Math.max(-1, Math.min(1, dot(nrm(a1), nrm(a2)))));
            worstAng = Math.max(worstAng, Math.abs(ang - want));
        }
    }
    const triC = faces.filter((f) => f.k === 3).length, hexC = faces.filter((f) => f.k === 6).length;
    check("T2 faces: 4 regular triangles (60°) + 4 regular hexagons (120°), every side == a",
        triC === 4 && hexC === 4 && worstSide < 1e-9 && worstAng < 1e-7,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst angle dev ${worstAng.toExponential(1)} rad; side a ${EDGE.toFixed(4)}m`);
}

// ---- T3 vertex census -------------------------------------------------------------------------------------------------
{
    const deg = new Array(12).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    let badFig = 0;
    for (let i = 0; i < 12; i++) {
        const tf = faces.filter((f) => f.verts.includes(i) && f.isTri).length;
        const hf = faces.filter((f) => f.verts.includes(i) && !f.isTri).length;
        if (tf !== 1 || hf !== 2) badFig++;
    }
    check("T3 vertices: degree 3 everywhere; exactly 1 triangle + 2 hexagons at every vertex (figure 3.6.6)",
        deg.every((d) => d === 3) && badFig === 0,
        `Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}; figure violations ${badFig}`);
}

// ---- T4 manifold ------------------------------------------------------------------------------------------------------
{
    const bad = [...edgeFaces.values()].filter((c) => c.length !== 2).length;
    const missing = E.filter(([a, b]) => (edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && edgeFaces.size === 18,
        `${edgeFaces.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 uniformity ----------------------------------------------------------------------------------------------------
{
    let worstR = 0;
    for (const v of V) worstR = Math.max(worstR, Math.abs(dist(v, SOLID_CENTER) - R_TRET));
    let hhWorst = 0, thWorst = 0, hhN = 0, thN = 0, ttN = 0;
    for (const [, fl] of edgeFaces) {
        if (fl.length !== 2) continue;
        const tA = faces[fl[0]].isTri, tB = faces[fl[1]].isTri;
        const d = dot(NORMALS[fl[0]], NORMALS[fl[1]]);
        if (tA && tB) ttN++;
        else if (tA !== tB) { thN++; thWorst = Math.max(thWorst, Math.abs(d - 1 / 3)); }
        else { hhN++; hhWorst = Math.max(hhWorst, Math.abs(d + 1 / 3)); }
    }
    check("T5 uniformity: all 12 verts at exactly R_tret; dihedrals exactly two classes — H-H == parent (dot −1/3), T-H == 1/3; zero triangle-triangle edges",
        worstR < 1e-9 && hhN === 6 && thN === 12 && ttN === 0 && hhWorst < 1e-9 && thWorst < 1e-9,
        `R dev ${(worstR * 1e12).toExponential(1)} (R ${R_TRET.toFixed(6)} == closed form ${(R_CLOSED * SCALE).toFixed(6)}); H-H ${hhN} edges worst |dot+1/3| ${hhWorst.toExponential(1)} (interior ${(180 - Math.acos(-1 / 3) * 180 / Math.PI).toFixed(4)}° — the PARENT tetrahedron's own); T-H ${thN} edges worst |dot−1/3| ${thWorst.toExponential(1)} (interior ${(180 - Math.acos(1 / 3) * 180 / Math.PI).toFixed(4)}°); T-T ${ttN} (no two cuts share a wall)`);
}

// ---- T6 THE BALANCED REMAINDER ----------------------------------------------------------------------------------------
{
    const det3 = (a: V3, b: V3, c: V3) => dot(a, cross(b, c));
    // parent volume by exact determinant (base at M[0])
    const V_parent = Math.abs(det3(sub(M[1], M[0]), sub(M[2], M[0]), sub(M[3], M[0]))) / 6;
    // corner volumes: each corner tet (M[i], cut_ij, cut_ik, cut_il) similar at 1/3 → exactly V/27
    let cornerWorst = 0;
    const corners: number[] = [];
    for (let i = 0; i < 4; i++) {
        const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
        const c1 = add(M[i], mul(sub(M[nbrs[0]], M[i]), 1 / 3));
        const c2 = add(M[i], mul(sub(M[nbrs[1]], M[i]), 1 / 3));
        const c3 = add(M[i], mul(sub(M[nbrs[2]], M[i]), 1 / 3));
        const vc = Math.abs(det3(sub(c1, M[i]), sub(c2, M[i]), sub(c3, M[i]))) / 6;
        corners.push(vc);
        cornerWorst = Math.max(cornerWorst, Math.abs(vc - V_parent / 27));
    }
    // tret volume by the divergence theorem over its OWN faces (unit frame — rotation-invariant)
    const faceArea = (f: Face) => {
        let s: V3 = [0, 0, 0];
        for (let t = 0; t < f.verts.length; t++) {
            const p1 = pts[f.verts[t]], p2 = pts[f.verts[(t + 1) % f.verts.length]];
            s = add(s, cross(sub(p1, f.center), sub(p2, f.center)));
        }
        return Math.hypot(...s) / 2;
    };
    let V_div = 0;
    for (const f of faces) V_div += dot(f.center, f.n) * faceArea(f);
    V_div /= 3;
    const ratio = V_div / V_parent;
    const agree = Math.abs(V_div - (V_parent - 4 * corners[0]));
    check("T6 THE BALANCED REMAINDER: each corner exactly V/27; divergence volume == parent − 4·corner; ratio == 23/27",
        cornerWorst < 1e-12 && Math.abs(ratio - 23 / 27) < 1e-12 && agree < 1e-12,
        `parent ${(V_parent).toFixed(10)}; corner worst |v−V/27| ${cornerWorst.toExponential(1)} (4 × ${(corners[0]).toFixed(10)} = ${(4 * corners[0]).toFixed(10)} taken); divergence tret ${V_div.toFixed(10)}; ratio ${ratio.toFixed(12)} vs 23/27 = ${(23 / 27).toFixed(12)}; independent agreement ${agree.toExponential(1)} — CUT THE CORNERS AT A THIRD AND 23 OF 27 PARTS REMAIN`);
}

// ---- T7 seat laws -----------------------------------------------------------------------------------------------------
{
    const botVs = faces[BOT_TRI_IDX].verts.map((vi) => V[vi][1]);
    const botSpread = Math.max(...botVs) - Math.min(...botVs);
    const topHex = faces.find((f, fi) => !f.isTri && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9);
    if (!topHex) throw Error("no top hexagon found — seating broken");
    const topVs = topHex.verts.map((vi) => V[vi][1]);
    const topSpread = Math.max(...topVs) - Math.min(...topVs);
    const cx = V.reduce((s, v) => s + v[0], 0) / 12;
    const cz = V.reduce((s, v) => s + v[2], 0) / 12;
    const a = (2 * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    // FINIAL-CLEARANCE LAW (v2): crown bead top must clear the crown rim's
    // sight line from READER_D by >= 1.5·BEAD_R — else it renders zero px
    // from every ground vantage (the v1 night-gameplay FAIL, decoded at
    // source: geometry, not emissive intensity).
    const topHex2 = faces.find((f, fi) => !f.isTri && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9)!;
    const topIdx = faces.indexOf(topHex2);
    const rimY = Math.max(...topHex2.verts.map((vi) => V[vi][1]));          // crown rim level
    const rimR = Math.max(...topHex2.verts.map((vi) => Math.hypot(V[vi][0], V[vi][2]))); // crown rim reach
    const crownPlane = CENTERS[topIdx][1] + NORMALS[topIdx][1] * BEAD_POKE; // crown bead plane (v1 seat)
    const beadTop = crownPlane + STEM_H + BEAD_R;                           // v2 finial bead top
    const sightY = rimY + (rimY - READER_EYE) * rimR / (READER_D - rimR);   // sight line at the axis
    const finialClear = beadTop - sightY;                                   // must be >= 1.5·BEAD_R
    // bead census: crown on axis + 3 waist at exact 120°, one dead at az 0, all aloft
    let crown = 0, waist = 0, onAxis = false, az0snap = false, allAloft = true, alt = true;
    const azs: number[] = [];
    for (let u = 0; u < faces.length; u++) {
        if (IS_TRI[u]) continue;                            // beads at the four HEXAGON centers — what remains
        const cc = CENTERS[u], nn = NORMALS[u];
        const by = cc[1] + nn[1] * BEAD_POKE;
        if (by <= PLINTH_H + 1e-6) allAloft = false;
        if (nn[1] > 0.99) { crown++; if (Math.hypot(cc[0], cc[2]) < 1e-9) onAxis = true; }
        else { waist++; azs.push(Math.atan2(cc[2], cc[0])); }
    }
    azs.sort((x, y) => x - y);
    for (let i = 0; i < azs.length; i++) {
        const d = azs[(i + 1) % azs.length] - azs[i] + (i === azs.length - 1 ? 2 * Math.PI : 0);
        if (Math.abs(d - (2 * Math.PI) / 3) > 1e-6) alt = false;
    }
    az0snap = azs.some((a2) => Math.abs(Math.atan2(Math.sin(a2), Math.cos(a2))) < 1e-9);
    const t7parts = {
        botFlat: botSpread < 1e-9, botAtDais: Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9,
        topFlat: topSpread < 1e-9, sym: symMiss === 0, ctr: Math.hypot(cx, cz) < 1e-9,
        hgt: Math.abs(height - TARGET_H) < 1e-9, noOver: MAX_H + ROD_R <= apothem + 1e-9,
        crown, waist, onAxis, az0: az0snap, alt, allAloft,
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3),
    };
    check("T7 seat: bottom triangle FLAT at dais top, top hexagon parallel, 120° symmetry, centroid on axis, height == target, never overhangs (apothem-first), bead census honest",
        botSpread < 1e-9 && Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9 && topSpread < 1e-9
        && symMiss === 0 && Math.hypot(cx, cz) < 1e-9 && Math.abs(height - TARGET_H) < 1e-9
        && MAX_H + ROD_R <= apothem + 1e-9 && crown === 1 && waist === 3 && onAxis && az0snap && alt && allAloft
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; bottom triangle spread ${botSpread.toExponential(1)} at dais top ${PLINTH_H}; top hexagon level (spread ${topSpread.toExponential(1)}); 120° misses ${symMiss}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); beads 1 crown dead-axis + 3 waist at exact 120° (one az 0), all aloft (+${BEAD_POKE}m proud — grazing-read law); FINIAL crown bead top ${beadTop.toFixed(3)} clears rim sight line ${sightY.toFixed(3)} by ${finialClear.toFixed(3)}m (>= ${1.5 * BEAD_R} law) — reads from every ground vantage`);
}

// ---- T8 immersion (plates tuck under the seams — tico/toct shadow-gap law) ---------------------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;       // plate mid-plane offset along outward normal
    let worstPlane = -Infinity;                            // max outward poke (must be ≤ 0)
    let worstTuck = 0;                                     // corner depth into rod cylinder (reported)
    for (let u = 0; u < faces.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const b = faces[u].verts.length;                   // 3 or 6
        for (let t = 0; t < b; t++) {
            const vi = faces[u].verts[t];
            const d = sub(V[vi], c);
            const r = Math.hypot(...d);
            const q = add(c, add(mul(d, (r - PLATE_INSET) / r), mul(n, sSide)));   // inset + lifted
            for (let u2 = 0; u2 < faces.length; u2++) {
                if (u2 === u) continue;                    // own plane: q is sSide INSIDE it by construction
                worstPlane = Math.max(worstPlane, dot(sub(q, CENTERS[u2]), NORMALS[u2]));
            }
            for (let w = 0; w < 2; w++) {
                const other = faces[u].verts[(t + (w === 0 ? b - 1 : 1)) % b];
                worstTuck = Math.max(worstTuck, ROD_R - segDist(q, V[vi], V[other]));
            }
        }
    }
    check("T8 immersion: every inset plate vertex strictly INSIDE the convex solid (no face-plane poke-through); plates tuck under the seams",
        worstPlane < 1e-9,
        `worst outward poke ${worstPlane.toExponential(1)} (≤ 0 = fully inside); max corner tuck into rod cylinders ${worstTuck.toFixed(4)}m (invisible — inside solid rod geometry, co idiom); plate outer face ${PLATE_BACK * 1000}mm behind the rod outer surface; beads at the 4 hexagon centers +${BEAD_POKE}m proud (decode D5)`);
}

// ---- footprint summary -------------------------------------------------------------------------------------------------
export const ENVELOPE = (() => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    const acc = (x: number, y: number, z: number) => {
        min[0] = Math.min(min[0], x); max[0] = Math.max(max[0], x);
        min[1] = Math.min(min[1], y); max[1] = Math.max(max[1], y);
        min[2] = Math.min(min[2], z); max[2] = Math.max(max[2], z);
    };
    // TRUE analytic envelope (struct-245 law): a tilted rod's END RIM circle
    // extends R·√(1−d̂k²) along axis k — carried exactly, not vertex±R spheres.
    for (const [i, j] of E) {
        const d = nrm(sub(V[j], V[i]));                  // unit edge direction
        for (const end of [V[i], V[j]]) {
            for (let k = 0; k < 3; k++) {
                const r = ROD_R * Math.sqrt(1 - d[k] * d[k]);
                min[k] = Math.min(min[k], end[k] - r);
                max[k] = Math.max(max[k], end[k] + r);
            }
        }
    }
    for (const f of faces) if (!f.isTri) {
        const u = faces.indexOf(f);
        const p: V3 = [
            CENTERS[u][0] + NORMALS[u][0] * BEAD_POKE,
            CENTERS[u][1] + NORMALS[u][1] * BEAD_POKE,
            CENTERS[u][2] + NORMALS[u][2] * BEAD_POKE,
        ];                                   // beads poke proud — the envelope carries the poked center
        acc(p[0] - BEAD_R, p[1] - BEAD_R, p[2] - BEAD_R);
        acc(p[0] + BEAD_R, p[1] + BEAD_R, p[2] + BEAD_R);
    }
    // finial stem + crown bead (v2): stem from the crown plane to the lifted
    // bead center; bead sphere at plane + STEM_H + BEAD_R top.
    {
        const topIdx = faces.findIndex((f, fi) => !f.isTri && NORMALS[fi][1] > 0.99);
        const p0: V3 = [CENTERS[topIdx][0], CENTERS[topIdx][1] + BEAD_POKE, CENTERS[topIdx][2]];
        const pTop: V3 = [p0[0], p0[1] + STEM_H, p0[2]];
        acc(pTop[0] - BEAD_R, pTop[1] - BEAD_R, pTop[2] - BEAD_R);
        acc(pTop[0] + BEAD_R, pTop[1] + BEAD_R, pTop[2] + BEAD_R);
        acc(p0[0] - STEM_R, p0[1], p0[2] - STEM_R);
        acc(p0[0] + STEM_R, pTop[1], p0[2] + STEM_R);
    }
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        acc(PLINTH_R * Math.cos(a), 0, -PLINTH_R * Math.sin(a));
        acc(PLINTH_R * Math.cos(a), PLINTH_H, -PLINTH_R * Math.sin(a));
    }
    return { min: min as V3, max: max as V3 };
})();

console.log(`seat: triangle-down 3-fold (parent vertex axis); bottom face flat on dais top ${PLINTH_H}; solid height ${TARGET_H}m; edge a ${EDGE.toFixed(4)}m; R ${R_TRET.toFixed(4)}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} → ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`panels: 4 stone hexagons + 4 iron triangles + 18 iron seam rods; beads: 4 brass hexagon centers (crown FINIAL lifted ~${(CENTERS[faces.findIndex((f) => !f.isTri && NORMALS[faces.indexOf(f)][1] > 0.99)][1] + STEM_H).toFixed(2)}m on a ${STEM_R}m iron stem, 3 waist ~${CENTERS[faces.findIndex((f, fi) => !f.isTri && NORMALS[fi][1] < 0)][1].toFixed(2)}m world-y) — the four that REMAIN, lit; the cuts stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct247-tret)");
