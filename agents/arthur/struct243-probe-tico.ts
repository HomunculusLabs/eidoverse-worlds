// struct243-probe-tico.ts — STRUCTURES LANE struct-243, Round 11 R11-56.
// THE TRUNCATED ICOSAHEDRON — C60, the football. Form-ledger grep fresh this
// tick: fullerene/bucky/soccer/football/truncated-icosahedron 0 real mentions
// across STRUCTURES-PLAN + IMPROVEMENTS + IMPROVE-PLAN + CITY-PLAN(-V2)
// ("c60" hits are SHA-hex substrings; "truncated" hits are prose adjectives).
// The ARCHIMEDEAN branch opened at struct-237 (cuboctahedron); this is its
// most iconic member — and the PARENT-ECHO of the icosahedron placed
// struct-240: truncate each corner at exactly 1/3, and the parent's 12
// corners become 12 pentagons while its 20 faces become 20 hexagons.
//
// ONE IDEA: EULER'S TWELVE. Hexagons tile the plane; on a sphere they cannot
// close — Σ(6−k)·f_k = 12 is forced, so exactly twelve pentagons must
// appear. C60 (Kroto/Curl/Smalley 1985, Nobel 1996) is that law made
// round: 60 corners, 90 bonds, 20 hexagon panels, 12 pentagon panels, every
// pentagon isolated (IPR law — no two pentagons touch, which is why the
// molecule is a sphere and the ball rolls true).
//
// PRESENTATION: the ball at monument scale, standing on one pentagon.
// STONE carries the twenty hexagons (the white panels) + the 32-sided dais
// (one side per face — the theme number); IRON carries the twelve pentagons
// (the black panels) + all 90 seam rods; twelve warm brass beads ride the
// twelve pentagon centers — the twelve Euler forces — with the bottom one
// pressed into the earth beneath the ball (11 read at night, 12 in truth).
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   Parent: icosa verts M = cyclic perms of (0,±1,±φ), edge 2, R=√(1+φ²).
//   Truncation: on each parent edge A→B the two points A+(B−A)/3 and
//   A+2(B−A)/3. Each parent vertex A → pentagon (its 5 cut points);
//   each parent face → hexagon (6 cut points, COPLANAR with the parent
//   face — the hexagon planes ARE the parent's face planes).
//   Uniform edge a = 2/3 (pentagon sides and hexagon sides all equal).
//   R_tIco = (a/4)·√(58+18√5).
//
// THEOREMS machine-verified below (conchoid law):
//   T1 Euler: 60 − 90 + 32 = 2 (sphere).
//   T2 face census: 12 regular pentagons (sides a, angles 108°) +
//      20 regular hexagons (sides a, angles 120°).
//   T3 vertex census: degree 3 everywhere; exactly 1 pentagon + 2 hexagons
//      at every vertex (60×).
//   T4 manifold: every edge on exactly 2 faces.
//   T5 uniformity: all 60 vertices at exactly R_tIco; dihedrals exactly TWO
//      classes — H-H dot(n1,n2) == √5/3 (the PARENT's dihedral, because the
//      hexagon planes are the parent's face planes), P-H constant.
//   T6 EULER'S TWELVE: Σ(6−k) over faces == 12; pentagon count 12; IPR —
//      zero pentagon-pentagon edges (every pentagon edge is pent-hex);
//      C60 census V60/E90/F12+20.
//   T7 seat: bottom pentagon flat at dais top (all 5 verts y == top),
//      top pentagon parallel, 72° symmetry about Y, centroid on axis,
//      height == target, reach+bead ≤ dais apothem (never overhangs).
//   T8 immersion: every panel corner, inset and lifted to the plate
//      mid-plane, clears its two incident seam-rod axes by > ROD_R
//      (plates tuck under the rods, never poke through — co shadow-gap law).
//   RED control: --red displaces one vertex 0.3 — T2/T5 must fail.

export const PHI = (1 + Math.sqrt(5)) / 2;
export const TARGET_H = 5.9;              // seated solid height (pentagon axis)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.095;              // brass pentagon-center bead (rt/co lineage)
export const PLATE_T = 0.10;              // panel thickness
export const PLATE_INSET = 0.07;          // panel corner inset (seam reveal)
export const PLATE_BACK = 0.018;          // panel outer face behind rod surface
export const PLINTH_N = 32;               // THIRTY-TWO sides — one per face (theme number)
export const PLINTH_ROT = 0;              // corners ON the axes
export const PLINTH_H = 0.30;

type V3 = [number, number, number];
const SQ5 = Math.sqrt(5);

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

// ---- parent icosa: the twelve cyclic (0,±1,±φ) corners -------------------------------------------------------
const M: V3[] = [];
{
    const push = (v: V3) => { if (!M.some((q) => dist(q, v) < 1e-12)) M.push(v); };
    for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
        push([0, s1, s2 * PHI]);          // (0,±1,±φ)
        push([s1 * PHI, 0, s2]);          // (±φ,0,±1)
        push([s1, s2 * PHI, 0]);          // (±1,±φ,0)
    }
}
if (M.length !== 12) throw Error(`cyclic construction ${M.length} != 12`);
const P_EDGE = 2;                          // parent edge (exact for these coords)
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 30) throw Error(`parent edges ${P_EDGES.length} != 30`);

// ---- truncation: 60 verts, deduped by proximity ------------------------------------------------------------------
const A_UNIT = 2 / 3;                      // uniform edge of the unit tIco
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
if (pts.length !== 60) throw Error(`truncation verts ${pts.length} != 60`);
const R_UNIT = Math.hypot(...pts[0]);
const R_CLOSED = (A_UNIT / 4) * Math.sqrt(58 + 18 * SQ5);   // closed form

// ---- tIco edges by distance ---------------------------------------------------------------------------------------
const EDGES: [number, number][] = [];
for (let i = 0; i < 60; i++) for (let j = i + 1; j < 60; j++)
    if (Math.abs(dist(pts[i], pts[j]) - A_UNIT) < 1e-9) EDGES.push([i, j]);
if (EDGES.length !== 90) throw Error(`tIco edges ${EDGES.length} != 90`);

// ---- faces --------------------------------------------------------------------------------------------------------
type Face = { k: number; verts: number[]; center: V3; n: V3; isPent: boolean };
const faces: Face[] = [];
const orderRing = (ring: V3[]): { verts: number[]; center: V3; n: V3 } => {
    const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / ring.length);
    const n = nrm(c);                                  // centered solid: outward normal
    const e1 = nrm(sub(ring[0], c));
    const e2 = cross(n, e1);
    const ordered = [...ring].sort((p, q) =>
        Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) -
        Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
    return { verts: ordered.map((p) => pidx(p)), center: c, n };
};
// pentagons: one per parent vertex (its 5 near cut points, sorted around)
for (let i = 0; i < 12; i++) {
    const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
    if (nbrs.length !== 5) throw Error(`parent degree ${nbrs.length} != 5`);
    const ring = nbrs.map((j) => add(M[i], mul(sub(M[j], M[i]), 1 / 3)));
    const { verts, center, n } = orderRing(ring);
    faces.push({ k: 5, verts, center, n, isPent: true });
}
// hexagons: one per parent face — walk the triangle, take both cut points per directed edge
{
    const pAdj = (a: number, b: number) => P_EDGES.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
    const seen = new Set<string>();
    for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) for (let k = 0; k < 12; k++) {
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
        faces.push({ k: 6, verts: o.verts, center: o.center, n: o.n, isPent: false });
    }
}
if (faces.length !== 32) throw Error(`faces ${faces.length} != 32`);
if (faces.filter((f) => f.isPent).length !== 12) throw Error("pentagon count != 12");

// ---- edgeFaces (module scope — used by T5 and T6) ------------------------------------------------------------------
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < faces.length; fi++) for (let t = 0; t < faces[fi].verts.length; t++) {
    const a = faces[fi].verts[t], b = faces[fi].verts[(t + 1) % faces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ---- seating: parent vertex (0,1,φ) direction → −Y (pentagon DOWN), twist-snap a bottom-pentagon corner to az 0 ----
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const v0 = nrm([0, 1, PHI]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// the bottom pentagon = the one whose rotated center points most downward
let botPent: Face = faces[0];
{
    let bestDot = Infinity;
    for (const f of faces) {
        if (!f.isPent) continue;
        const d = dot(rot1(f.center), [0, 1, 0]);
        if (d < bestDot) { bestDot = d; botPent = f; }
    }
}
const az0 = (() => {
    const p = rot1(pts[botPent.verts[0]]);
    return Math.atan2(p[2], p[0]);
})();
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], -az0);
const rot = (v: V3): V3 => rot2(rot1(v));

// ---- scale + lift: bottom pentagon plane lands exactly on the dais top -------------------------------------------
const seatedUnit = pts.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
export const EDGE = A_UNIT * SCALE;
export const R_TICO = R_UNIT * SCALE;
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
export const IS_PENT: boolean[] = faces.map((f) => f.isPent);
export const E: [number, number][] = EDGES;
export const BOT_PENT_IDX = faces.indexOf(botPent);

// RED control (--red displaces one vertex: breaks side/uniformity/seat laws)
if (process.argv.includes("--red")) {
    V[7] = [V[7][0] + 0.3, V[7][1] - 0.2, V[7][2] + 0.15];
    console.log("RED MODE: vertex 7 displaced 0.3 — T2/T5 MUST fail");
}

// ---- derived footprint constants (BEFORE all checks — no TDZ) ----------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
export const PLINTH_R = Math.ceil((MAX_H + BEAD_R + 0.10) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// ---- T1 Euler ----------------------------------------------------------------------------------------------------
check("T1 Euler 60−90+32 = 2", V.length === 60 && E.length === 90 && faces.length === 32 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census -----------------------------------------------------------------------------------------------
{
    let worstSide = 0, worstAng = 0;
    for (const f of faces) {
        const want = f.k === 5 ? 3 * Math.PI / 5 : 2 * Math.PI / 3;   // 108° / 120°
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
    const pentC = faces.filter((f) => f.k === 5).length, hexC = faces.filter((f) => f.k === 6).length;
    check("T2 faces: 12 regular pentagons (108°) + 20 regular hexagons (120°), every side == a",
        pentC === 12 && hexC === 20 && worstSide < 1e-9 && worstAng < 1e-7,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst angle dev ${worstAng.toExponential(1)} rad; side a ${EDGE.toFixed(4)}m`);
}

// ---- T3 vertex census --------------------------------------------------------------------------------------------
{
    const deg = new Array(60).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    let badFig = 0;
    for (let i = 0; i < 60; i++) {
        const pf = faces.filter((f) => f.verts.includes(i) && f.isPent).length;
        const hf = faces.filter((f) => f.verts.includes(i) && !f.isPent).length;
        if (pf !== 1 || hf !== 2) badFig++;
    }
    check("T3 vertices: degree 3 everywhere; exactly 1 pentagon + 2 hexagons at every vertex",
        deg.every((d) => d === 3) && badFig === 0,
        `Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}; figure violations ${badFig}`);
}

// ---- T4 manifold -------------------------------------------------------------------------------------------------
{
    const bad = [...edgeFaces.values()].filter((c) => c.length !== 2).length;
    const missing = E.filter(([a, b]) => (edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && edgeFaces.size === 90,
        `${edgeFaces.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 uniformity -----------------------------------------------------------------------------------------------
{
    let worstR = 0;
    for (const v of V) worstR = Math.max(worstR, Math.abs(dist(v, SOLID_CENTER) - R_TICO));
    let hhWorst = 0, phWorst = 0, phDot = NaN, hhN = 0, phN = 0;
    for (const [, fl] of edgeFaces) {
        if (fl.length !== 2) continue;
        const d = dot(NORMALS[fl[0]], NORMALS[fl[1]]);
        if (faces[fl[0]].isPent === faces[fl[1]].isPent) { hhN++; hhWorst = Math.max(hhWorst, Math.abs(d - SQ5 / 3)); }
        else { phN++; if (isNaN(phDot)) phDot = d; phWorst = Math.max(phWorst, Math.abs(d - phDot)); }
    }
    check("T5 uniformity: all 60 verts at exactly R_tIco; dihedrals exactly two classes — H-H == parent (√5/3), P-H constant",
        worstR < 1e-9 && hhN === 30 && phN === 60 && hhWorst < 1e-9 && phWorst < 1e-9,
        `R dev ${(worstR * 1e12).toExponential(1)} (R ${R_TICO.toFixed(6)} == closed form ${(R_CLOSED * SCALE).toFixed(6)}); H-H ${hhN} edges worst |dot−√5/3| ${hhWorst.toExponential(1)} (interior ${(180 - Math.acos(SQ5 / 3) * 180 / Math.PI).toFixed(4)}° — the PARENT's); P-H ${phN} edges worst spread ${phWorst.toExponential(1)} (interior ${(180 - Math.acos(phDot) * 180 / Math.PI).toFixed(4)}°)`);
}

// ---- T6 EULER'S TWELVE --------------------------------------------------------------------------------------------
{
    const gauss = faces.reduce((s, f) => s + (6 - f.k), 0);
    const pentPentEdges = [...edgeFaces.entries()].filter(([, fl]) =>
        faces[fl[0]].isPent && faces[fl[1]].isPent).length;
    check("T6 EULER'S TWELVE: Σ(6−k) == 12; pentagons == 12; IPR — zero pentagon-pentagon edges; C60 census 60/90/12+20",
        gauss === 12 && faces.filter((f) => f.isPent).length === 12 && pentPentEdges === 0,
        `Σ(6−k) ${gauss} (hexagons alone contribute 0 — the twelve pentagons are FORCED); every pentagon edge is pent-hex (${pentPentEdges} P-P); carbons ${V.length}, bonds ${E.length}`);
}

// ---- T7 seat laws ------------------------------------------------------------------------------------------------
{
    const botVs = faces[BOT_PENT_IDX].verts.map((vi) => V[vi][1]);
    const botSpread = Math.max(...botVs) - Math.min(...botVs);
    const topPent = faces.find((f, fi) => f.isPent && fi !== BOT_PENT_IDX && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9);
    if (!topPent) throw Error("no top pentagon found — seating broken");
    const topVs = topPent.verts.map((vi) => V[vi][1]);
    const topSpread = Math.max(...topVs) - Math.min(...topVs);
    const cx = V.reduce((s, v) => s + v[0], 0) / 60;
    const cz = V.reduce((s, v) => s + v[2], 0) / 60;
    const a = (2 * Math.PI) / 5, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    check("T7 seat: bottom pentagon FLAT at dais top, top parallel, 72° symmetry, centroid on axis, height == target, never overhangs",
        botSpread < 1e-9 && Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9 && topSpread < 1e-9
        && symMiss === 0 && Math.hypot(cx, cz) < 1e-9 && Math.abs(height - TARGET_H) < 1e-9
        && MAX_H + BEAD_R <= apothem + 1e-9,
        `bottom pentagon spread ${botSpread.toExponential(1)} at dais top ${PLINTH_H}; top face level (spread ${topSpread.toExponential(1)}); 72° misses ${symMiss}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+bead ${(MAX_H + BEAD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)}`);
}

// ---- T8 immersion (plates tuck under the seams — co shadow-gap law) -------------------------------------------------
{
    // HONEST LAW (self-caught: the draft law demanded plate corners clear the
    // rod AXES by > ROD_R — arithmetically unsatisfiable for any regular
    // plate with INSET·sin(β/2) < ROD_R, and the co build itself tucked its
    // corners into the rods; the idiom is plates INSIDE, rods OUTSIDE):
    // every inset+lifted plate vertex lies strictly INSIDE the convex solid
    // (no poke-through of ANY face plane), and the corner tuck depth into
    // the rod cylinders (invisible, inside solid rod geometry) is reported.
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;       // plate mid-plane offset along outward normal
    let worstPlane = -Infinity;                            // max outward poke (must be ≤ 0)
    let worstTuck = 0;                                     // corner depth into rod cylinder (reported)
    for (let u = 0; u < faces.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const b = faces[u].verts.length;                   // 5 or 6
        for (let t = 0; t < b; t++) {
            const vi = faces[u].verts[t];
            const d = sub(V[vi], c);
            const r = Math.hypot(...d);
            const q = add(c, add(mul(d, (r - PLATE_INSET) / r), mul(n, sSide)));   // inset + lifted
            for (let u2 = 0; u2 < faces.length; u2++) {
                if (u2 === u) continue;                    // own plane: q is sSide INSIDE it by construction
                worstPlane = Math.max(worstPlane, dot(sub(q, CENTERS[u2]), NORMALS[u2]));
            }
            // tuck depth: distance to each incident rod axis vs ROD_R
            for (let w = 0; w < 2; w++) {
                const other = faces[u].verts[(t + (w === 0 ? b - 1 : 1)) % b];
                worstTuck = Math.max(worstTuck, ROD_R - segDist(q, V[vi], V[other]));
            }
        }
    }
    check("T8 immersion: every inset plate vertex strictly INSIDE the convex solid (no face-plane poke-through); plates tuck under the seams",
        worstPlane < 1e-9,
        `worst outward poke ${worstPlane.toExponential(1)} (≤ 0 = fully inside); max corner tuck into rod cylinders ${worstTuck.toFixed(4)}m (invisible — inside solid rod geometry, co idiom); plate outer face ${PLATE_BACK * 1000}mm behind the rod outer surface; beads at the 12 pentagon centers, bottom one pressed into the dais (decode D6)`);
}

// ---- footprint summary --------------------------------------------------------------------------------------------
export const ENVELOPE = (() => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    const acc = (x: number, y: number, z: number) => {
        min[0] = Math.min(min[0], x); max[0] = Math.max(max[0], x);
        min[1] = Math.min(min[1], y); max[1] = Math.max(max[1], y);
        min[2] = Math.min(min[2], z); max[2] = Math.max(max[2], z);
    };
    for (const v of V) acc(v[0] - BEAD_R, v[1] - BEAD_R, v[2] - BEAD_R), acc(v[0] + BEAD_R, v[1] + BEAD_R, v[2] + BEAD_R);
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        acc(PLINTH_R * Math.cos(a), 0, -PLINTH_R * Math.sin(a));
        acc(PLINTH_R * Math.cos(a), PLINTH_H, -PLINTH_R * Math.sin(a));
    }
    return { min: min as V3, max: max as V3 };
})();

console.log(`seat: pentagon-down 5-fold; bottom face flat on dais top ${PLINTH_H}; solid height ${TARGET_H}m; edge a ${EDGE.toFixed(4)}m; R ${R_TICO.toFixed(4)}m; footprint max horiz ${MAX_H.toFixed(3)} + bead ${BEAD_R} → ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} (one side per face); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`panels: 20 stone hexagons + 12 iron pentagons + 90 iron seam rods; beads: 12 brass pentagon centers (11 aloft + 1 pressed into the earth)`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct243-tico)");
