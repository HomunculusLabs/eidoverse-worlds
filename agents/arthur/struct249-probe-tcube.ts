// struct249-probe-tcube.ts — STRUCTURES LANE struct-249, Round 11 R11-60.
// THE TRUNCATED CUBE. Form-ledger grep fresh this tick: truncated cube /
// tcube / truncated hexahedron 0 real mentions across STRUCTURES-PLAN +
// IMPROVEMENTS + IMPROVE-PLAN + CITY-PLAN(-V2). The ARCHIMEDEAN branch's
// fifth member (struct-237 cuboctahedron, struct-243 tico, struct-245
// toct, struct-247 tret) and the PARENT-ECHO of the cube — the branch's
// fourth and final Platonic parent (tetra✓tret, octa✓toct, icosa✓tico,
// cube→tcube; dodeca remains for a later tick).
//
// ONE IDEA: THE DEEPER CUT. The family law is 1/3 — but cut a CUBE's
// eight corners at exactly 1/3 and the faces become IRREGULAR octagons
// (corner sides 2√2/3 vs middle sides 2/3 — side ratio exactly √2,
// machine-proven in T6b). Regularity demands the cut go DEEPER:
// u = 1 − 1/√2 ≈ 0.2929 measured from each corner. Cut that deep and
// exactly 7(√2−1)/3 ≈ 96.65% of the parent still stands — the lightest
// touch of the whole branch (tico/toct/tret each surrendered far more).
// Machine-verified below, not asserted from prose (T6): the
// divergence-theorem volume of the BUILT faces over exact corner
// determinants.
//
// Presentation: FACE-DOWN, 4-fold — the parent's own cardinality. The
// bottom octagon lies FLAT on the dais (the square face, grown); the
// crown octagon faces dead up; four octagons face the four cardinals
// dead-on. IRON carries the eight TRIANGLES (the cuts — the taken 3.35%,
// dark: four tilted down at the diagonal az, four tilted up) + all 36
// seam bonds; STONE carries the six OCTAGONS (the parent's own face
// planes — what remains; O-O dihedral == the cube's own 90°, T5) + the
// FOURTEEN-sided dais (one side per face, 6 + 8 — the theme-number law,
// shared with the toct by honest coincidence). Night contract: six warm
// brass beads at the six OCTAGON centers — the six parent faces, lit:
// one CROWN on a finial stem (tret v2 occlusion law) + four WAIST at
// the exact cardinals (dead-horizontal normals — the cube's own
// directions) + the SIXTH PRESSED INTO THE EARTH beneath the flat foot
// (tico's-twelfth idiom, hidden by the widest face — five read at night,
// six in truth, disclosed).
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   Parent: cube (±1,±1,±1), edge 2, 8 verts, 12 edges, 6 faces.
//   Truncation fraction u = 1 − 1/√2 (NOT the family 1/3 — T6b proves
//   1/3 irregular). Cut points A + u(B−A), A + (1−u)(B−A) on each parent
//   edge → 24 verts. Uniform edge a = 2√2·u = 2(√2−1) (corner side
//   u·2·√2 == middle (1−2u)·2 exactly at this u — the regularity).
//   R_tcube = √(4−2√2) = a·√(1 + √2/2) in unit coords (all 24 verts at R).
//   Corner tet legs x = 2u = 2−√2; corner volume x³/6 = (20−14√2)/6.
//   Seat: +Z face normal (0,0,1) → −Y (OCTAGON DOWN, 4-fold); the waist
//   octagon normals land on the exact cardinals with NO twist (verified
//   T7), the up-tilted triangle cuts at exact 45° diagonals.
//
// DAIS LAW: APOTHEM-FIRST for all N (struct-247 fix, carried).
//
// THEOREMS machine-verified below (conchoid law):
//   T1 Euler: 24 − 36 + 14 = 2 (sphere).
//   T2 face census: 8 regular triangles (60°) + 6 regular octagons (135°).
//   T3 vertex census: degree 3 everywhere; exactly 1 triangle + 2 octagons
//      at every vertex (24×) — figure 3.8.8.
//   T4 manifold: every edge on exactly 2 faces.
//   T5 uniformity: all 24 verts at exactly R_tcube; dihedrals exactly TWO
//      classes — O-O dot == 0 (interior 90° — the PARENT cube's own,
//      because the octagon planes ARE the parent's face planes), T-O
//      dot == +1/√3 (interior 125.2644°); zero triangle-triangle edges
//      (24 T-O + 12 O-O == 36 — no two cuts share a wall).
//   T6 THE DEEPER CUT: each corner tet exactly (2−√2)³/6; divergence
//      volume == parent − 8·corner; remains/parent == 7(√2−1)/3 exactly.
//   T6b THE 1/3-BAR: at the family's 1/3 the octagon side ratio is
//      exactly √2 (irregular) AND u < 1/3 strictly — regularity is
//      BOUGHT by cutting deeper, and still 96.65% stands.
//   T7 seat: bottom octagon FLAT at dais top (8 verts level), top
//      octagon parallel, 90° symmetry about Y, centroid on axis, height
//      == target, reach+rod ≤ dais apothem (never overhangs,
//      apothem-first sizing); bead census honest: 1 crown dead-axis
//      finial + 4 waist at the EXACT cardinals, all aloft + 1 pressed
//      foot bead at the tico-twelfth depth (disclosed); FINIAL-CLEARANCE
//      LAW (tret v2): crown bead top clears the crown rim sight line
//      from READER_D by ≥ 1.5·BEAD_R.
//   T8 immersion: every inset plate corner, lifted to the plate mid-plane,
//      lies strictly INSIDE the convex solid (no face-plane poke-through);
//      corner tuck into the rod cylinders reported.
//   RED control: --red displaces one vertex 0.3 — T2/T5 must fail.

export const TARGET_H = 5.9;              // seated solid height (4-fold face axis)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.15;               // brass remainder bead (family scale)
export const BEAD_POKE = 0.02;            // bead center proud of the face plane (grazing-read law, disclosed)
export const STEM_H = 1.30;               // FINIAL stem: crown bead lifted on an iron pin (tret v2 occlusion law)
export const STEM_R = 0.03;               // finial stem radius (slender iron pin, Observatory-gnomon idiom)
export const READER_D = 18;               // lane reading distance (sight-line law domain)
export const READER_EYE = 1.65;           // reader eye height
export const PLATE_T = 0.10;              // panel thickness
export const PLATE_INSET = 0.07;          // panel corner inset (seam reveal — family look)
export const PLATE_BACK = 0.018;          // panel outer face behind rod surface
export const PLINTH_N = 14;               // FOURTEEN sides — one per face (6 octagons + 8 triangles)
export const PLINTH_ROT = 0;              // corners ON the axes
export const PLINTH_H = 0.30;
export const FOOT_BEAD_Y = 0.15;          // pressed sixth bead center — spans exactly the dais band 0→0.30, FULLY BURIED (tico's-twelfth idiom: never reads, six in truth)
export const U_CUT = 1 - Math.SQRT2 / 2;  // 1 − 1/√2 ≈ 0.29289 — THE DEEPER CUT (T6b: 1/3 is irregular)

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

// ---- parent cube: (±1,±1,±1) — edges are the 12 adjacent pairs ------------------------------------------------------
const M: V3[] = [];
for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) M.push([sx, sy, sz]);
const P_EDGE = 2;                            // exact for these coords
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 12) throw Error(`parent edges ${P_EDGES.length} != 12`);

// ---- truncation at THE DEEPER CUT u = 1 − 1/√2: 24 verts, deduped by proximity --------------------------------------
const A_UNIT = U_CUT * 2 * Math.SQRT2;       // uniform edge of the unit tcube = 2(√2−1)
const pts: V3[] = [];
const pidx = (p: V3) => {
    const k = pts.findIndex((q) => dist(q, p) < 1e-9);
    if (k >= 0) return k;
    pts.push(p); return pts.length - 1;
};
for (const [i, j] of P_EDGES) {
    pidx(add(M[i], mul(sub(M[j], M[i]), U_CUT)));
    pidx(add(M[i], mul(sub(M[j], M[i]), 1 - U_CUT)));
}
if (pts.length !== 24) throw Error(`truncation verts ${pts.length} != 24`);
const R_UNIT = Math.hypot(...pts[0]);        // √(5−2√2) — vertex (1,1,√2−1): √(2+(√2−1)²)
const R_CLOSED = Math.sqrt(5 - 2 * Math.SQRT2); // closed form — must equal R_UNIT

// ---- tcube edges by distance ----------------------------------------------------------------------------------------
const EDGES: [number, number][] = [];
for (let i = 0; i < 24; i++) for (let j = i + 1; j < 24; j++)
    if (Math.abs(dist(pts[i], pts[j]) - A_UNIT) < 1e-9) EDGES.push([i, j]);
if (EDGES.length !== 36) throw Error(`tcube edges ${EDGES.length} != 36`);

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
for (let i = 0; i < 8; i++) {
    const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
    if (nbrs.length !== 3) throw Error(`parent degree ${nbrs.length} != 3`);
    const ring = nbrs.map((j) => add(M[i], mul(sub(M[j], M[i]), U_CUT)));
    const { verts, center, n } = orderRing(ring);
    faces.push({ k: 3, verts, center, n, isTri: true });
}
// octagons: one per parent face — the 8 cut points carrying that face's sign on its axis
for (let k = 0; k < 3; k++) for (const s of [1, -1]) {
    const ring = pts.filter((p) => Math.abs(p[k] - s) < 1e-9);
    if (ring.length !== 8) throw Error(`face ring ${ring.length} != 8`);
    const { verts, center, n } = orderRing(ring);
    faces.push({ k: 8, verts, center, n, isTri: false });
}
if (faces.length !== 14) throw Error(`faces ${faces.length} != 14`);
if (faces.filter((f) => f.isTri).length !== 8) throw Error("triangle count != 8");

// ---- edgeFaces (module scope — used by T4/T5) ----------------------------------------------------------------------
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < faces.length; fi++) for (let t = 0; t < faces[fi].verts.length; t++) {
    const a = faces[fi].verts[t], b = faces[fi].verts[(t + 1) % faces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ---- seating: parent face normal (0,0,1) → −Y (OCTAGON DOWN, 4-fold seat); waist normals land on the exact cardinals --
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const v0: V3 = [0, 0, 1];                     // the +Z parent face — the foot
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// the bottom face = the OCTAGON whose rotated center points most downward
let botOct: Face = faces[8];
{
    let bestDot = Infinity;
    for (const f of faces) {
        if (f.isTri) continue;
        const d = dot(rot1(f.center), [0, 1, 0]);
        if (d < bestDot) { bestDot = d; botOct = f; }
    }
}
// NO twist-snap: Rx(90°) puts the four waist octagon normals on the exact
// cardinals and the up-tilted triangle cuts at exact 45° diagonals (T7
// verifies both to 1e-9). The tret chassis needed a snap; this seat does not.
const rot = rot1;

// ---- scale + lift: bottom octagon plane lands exactly on the dais top ----------------------------------------------
const seatedUnit = pts.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
export const EDGE = A_UNIT * SCALE;
export const R_TCUBE = R_UNIT * SCALE;
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
export const BOT_OCT_IDX = faces.indexOf(botOct);

// RED control (--red displaces one vertex: breaks side/uniformity/seat laws)
if (process.argv.includes("--red")) {
    V[7] = [V[7][0] + 0.3, V[7][1] - 0.2, V[7][2] + 0.15];
    console.log("RED MODE: vertex 7 displaced 0.3 — T2/T5 MUST fail");
}

// ---- derived footprint constants (BEFORE all checks — no TDZ) --------------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
// APOTHEM-FIRST dais law (struct-247 fix, carried for all N)
export const PLINTH_R = Math.ceil(((MAX_H + ROD_R + 0.10) / Math.cos(Math.PI / PLINTH_N)) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// ---- T1 Euler --------------------------------------------------------------------------------------------------------
check("T1 Euler 24−36+14 = 2", V.length === 24 && E.length === 36 && faces.length === 14 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census ---------------------------------------------------------------------------------------------------
{
    let worstSide = 0, worstAng = 0;
    for (const f of faces) {
        const want = f.k === 3 ? Math.PI / 3 : 3 * Math.PI / 4;   // 60° / 135°
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
    const triC = faces.filter((f) => f.k === 3).length, octC = faces.filter((f) => f.k === 8).length;
    check("T2 faces: 8 regular triangles (60°) + 6 regular octagons (135°), every side == a",
        triC === 8 && octC === 6 && worstSide < 1e-9 && worstAng < 1e-7,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst angle dev ${worstAng.toExponential(1)} rad; side a ${EDGE.toFixed(4)}m — REGULAR octagons need the deeper cut u = 1−1/√2 = ${U_CUT.toFixed(10)} (T6b)`);
}

// ---- T3 vertex census -------------------------------------------------------------------------------------------------
{
    const deg = new Array(24).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    let badFig = 0;
    for (let i = 0; i < 24; i++) {
        const tf = faces.filter((f) => f.verts.includes(i) && f.isTri).length;
        const of_ = faces.filter((f) => f.verts.includes(i) && !f.isTri).length;
        if (tf !== 1 || of_ !== 2) badFig++;
    }
    check("T3 vertices: degree 3 everywhere; exactly 1 triangle + 2 octagons at every vertex (figure 3.8.8)",
        deg.every((d) => d === 3) && badFig === 0,
        `Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}; figure violations ${badFig}`);
}

// ---- T4 manifold ------------------------------------------------------------------------------------------------------
{
    const bad = [...edgeFaces.values()].filter((c) => c.length !== 2).length;
    const missing = E.filter(([a, b]) => (edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && edgeFaces.size === 36,
        `${edgeFaces.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 uniformity ----------------------------------------------------------------------------------------------------
{
    let worstR = 0;
    for (const v of V) worstR = Math.max(worstR, Math.abs(dist(v, SOLID_CENTER) - R_TCUBE));
    let ooWorst = 0, toWorst = 0, ooN = 0, toN = 0, ttN = 0;
    for (const [, fl] of edgeFaces) {
        if (fl.length !== 2) continue;
        const tA = faces[fl[0]].isTri, tB = faces[fl[1]].isTri;
        const d = dot(NORMALS[fl[0]], NORMALS[fl[1]]);
        if (tA && tB) ttN++;
        else if (tA !== tB) { toN++; toWorst = Math.max(toWorst, Math.abs(d - 1 / Math.sqrt(3))); }
        else { ooN++; ooWorst = Math.max(ooWorst, Math.abs(d - 0)); }
    }
    check("T5 uniformity: all 24 verts at exactly R_tcube; dihedrals exactly two classes — O-O == parent (dot 0, interior 90°), T-O == 1/√3 (interior 125.2644°); zero triangle-triangle edges",
        worstR < 1e-9 && ooN === 12 && toN === 24 && ttN === 0 && ooWorst < 1e-9 && toWorst < 1e-9,
        `R dev ${(worstR * 1e12).toExponential(1)} (R ${R_TCUBE.toFixed(6)} == closed form ${(R_CLOSED * SCALE).toFixed(6)}); O-O ${ooN} edges worst |dot−0| ${ooWorst.toExponential(1)} (interior 90° — the PARENT cube's own: the octagon planes ARE the parent's face planes); T-O ${toN} edges worst |dot−1/√3| ${toWorst.toExponential(1)} (interior 125.2644°); T-T ${ttN} (no two cuts share a wall; 24 T-O + 12 O-O == 36)`);
}

// ---- T6 THE DEEPER CUT ------------------------------------------------------------------------------------------------
{
    const det3 = (a: V3, b: V3, c: V3) => dot(a, cross(b, c));
    // parent volume: cube edge 2 → 8, cross-checked as 6 center-pyramids
    const V_parent = P_EDGE ** 3;
    const V_pyramids = 6 * (1 / 3) * (P_EDGE * P_EDGE) * 1;   // face area 4, apex distance 1
    // corner tets: legs x = 2u along the three perpendicular parent edges
    const x = 2 * U_CUT;                                       // 2 − √2
    const cornerAnalytic = x ** 3 / 6;                         // (20−14√2)/6
    let cornerWorst = 0;
    const corners: number[] = [];
    for (let i = 0; i < 8; i++) {
        const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
        const c1 = add(M[i], mul(sub(M[nbrs[0]], M[i]), U_CUT));
        const c2 = add(M[i], mul(sub(M[nbrs[1]], M[i]), U_CUT));
        const c3 = add(M[i], mul(sub(M[nbrs[2]], M[i]), U_CUT));
        const vc = Math.abs(det3(sub(c1, M[i]), sub(c2, M[i]), sub(c3, M[i]))) / 6;
        corners.push(vc);
        cornerWorst = Math.max(cornerWorst, Math.abs(vc - cornerAnalytic));
    }
    // tcube volume by the divergence theorem over its OWN faces (unit frame — rotation-invariant)
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
    const agree = Math.abs(V_div - (V_parent - 8 * corners[0]));
    const remainsClosed = 7 * (Math.SQRT2 - 1) / 3;
    check("T6 THE DEEPER CUT: each corner exactly (2−√2)³/6; divergence volume == parent − 8·corner; remains == 7(√2−1)/3",
        Math.abs(V_parent - V_pyramids) < 1e-12 && cornerWorst < 1e-12 && Math.abs(ratio - remainsClosed) < 1e-12 && agree < 1e-12,
        `parent ${V_parent} == 6-pyramid ${V_pyramids}; corner worst |v−(2−√2)³/6| ${cornerWorst.toExponential(1)} (8 × ${corners[0].toFixed(10)} = ${(8 * corners[0]).toFixed(10)} taken); divergence tcube ${V_div.toFixed(10)}; ratio ${ratio.toFixed(12)} vs 7(√2−1)/3 = ${remainsClosed.toFixed(12)}; independent agreement ${agree.toExponential(1)} — CUT THE EIGHT CORNERS DEEPER THAN THE FAMILY AND 96.65% OF THE CUBE STILL STANDS`);
}

// ---- T6b THE 1/3-BAR (why the cut must be deeper) ---------------------------------------------------------------------
{
    const u13 = 1 / 3;
    const cornerSide13 = u13 * 2 * Math.SQRT2;      // 2√2/3
    const middle13 = (1 - 2 * u13) * 2;             // 2/3
    const ratio13 = cornerSide13 / middle13;
    check("T6b THE 1/3-BAR: at the family's 1/3-cut the octagon side ratio is exactly √2 (IRREGULAR); regularity cut u is STRICTLY deeper",
        Math.abs(ratio13 - Math.SQRT2) < 1e-12 && U_CUT < 1 / 3,
        `1/3-cut sides ${cornerSide13.toFixed(10)} vs ${middle13.toFixed(10)} — ratio ${ratio13.toFixed(12)} == √2 exactly (irregular); our u = ${U_CUT.toFixed(10)} < 1/3 by ${(1 / 3 - U_CUT).toFixed(10)} — regularity is BOUGHT by cutting deeper`);
}

// ---- T7 seat laws -----------------------------------------------------------------------------------------------------
{
    const botVs = faces[BOT_OCT_IDX].verts.map((vi) => V[vi][1]);
    const botSpread = Math.max(...botVs) - Math.min(...botVs);
    const topOct = faces.find((f, fi) => !f.isTri && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9);
    if (!topOct) throw Error("no top octagon found — seating broken");
    const topVs = topOct.verts.map((vi) => V[vi][1]);
    const topSpread = Math.max(...topVs) - Math.min(...topVs);
    const cx = V.reduce((s, v) => s + v[0], 0) / 24;
    const cz = V.reduce((s, v) => s + v[2], 0) / 24;
    const a = Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    // FINIAL-CLEARANCE LAW (tret v2): crown bead top must clear the crown rim's
    // sight line from READER_D by >= 1.5·BEAD_R — else it renders zero px
    // from every ground vantage.
    const topIdx = faces.indexOf(topOct);
    const rimY = Math.max(...topOct.verts.map((vi) => V[vi][1]));           // crown rim level
    const rimR = Math.max(...topOct.verts.map((vi) => Math.hypot(V[vi][0], V[vi][2]))); // crown rim reach
    const crownPlane = CENTERS[topIdx][1] + NORMALS[topIdx][1] * BEAD_POKE; // crown bead base plane
    const beadTop = crownPlane + STEM_H + BEAD_R;                           // finial bead top
    const sightY = rimY + (rimY - READER_EYE) * rimR / (READER_D - rimR);   // sight line at the axis
    const finialClear = beadTop - sightY;                                   // must be >= 1.5·BEAD_R
    // bead census: 1 crown dead-axis + 4 waist at the EXACT cardinals (all
    // aloft) + 1 pressed foot bead at the tico-twelfth depth (disclosed)
    let crown = 0, waist = 0, foot = 0, onAxis = false, allAloft = true;
    const azs: number[] = [];
    let footY = -1;
    for (let u = 0; u < faces.length; u++) {
        if (IS_TRI[u]) continue;                            // beads at the six OCTAGON centers — what remains
        const cc = CENTERS[u], nn = NORMALS[u];
        if (nn[1] > 0.99) { crown++; if (Math.hypot(cc[0], cc[2]) < 1e-9) onAxis = true; }
        else if (nn[1] < -0.99) { foot++; footY = FOOT_BEAD_Y; }
        else {
            waist++;
            azs.push(Math.atan2(cc[2], cc[0]));
            if (cc[1] + nn[1] * BEAD_POKE <= PLINTH_H + 1e-6) allAloft = false;
        }
        if (nn[1] > 0.99 && cc[1] + nn[1] * BEAD_POKE <= PLINTH_H + 1e-6) allAloft = false;
    }
    // waist az set must be the exact cardinals {0, ±π/2, π}
    const cardinalSnap = azs.every((a2) =>
        [0, Math.PI / 2, Math.PI, -Math.PI / 2].some((card) => Math.abs(Math.atan2(Math.sin(a2 - card), Math.cos(a2 - card))) < 1e-9))
        && azs.length === 4;
    // up-tilted triangle cuts at exact 45° diagonals (the 4-fold read)
    const triAzs = faces.filter((f, fi) => IS_TRI[fi] && NORMALS[fi][1] > 0.3).map((f, fi) => {
        void fi;
        const c2 = rot(f.center);
        return Math.atan2(c2[2], c2[0]);
    }).sort((p, q) => p - q);
    const diagSnap = triAzs.length === 4 && triAzs.every((a2) =>
        [Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4, -Math.PI / 4].some((d) => Math.abs(Math.atan2(Math.sin(a2 - d), Math.cos(a2 - d))) < 1e-9));
    const t7parts = {
        botFlat: botSpread < 1e-9, botAtDais: Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9,
        topFlat: topSpread < 1e-9, sym: symMiss === 0, ctr: Math.hypot(cx, cz) < 1e-9,
        hgt: Math.abs(height - TARGET_H) < 1e-9, noOver: MAX_H + ROD_R <= apothem + 1e-9,
        crown, waist, foot, onAxis, cardinalSnap, diagSnap, allAloft, footPressed: foot === 1 && Math.abs(footY - FOOT_BEAD_Y) < 1e-12,
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3),
    };
    check("T7 seat: bottom octagon FLAT at dais top, top octagon parallel, 90° symmetry, centroid on axis, height == target, never overhangs (apothem-first), bead census honest (5 aloft + 1 pressed, disclosed)",
        botSpread < 1e-9 && Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9 && topSpread < 1e-9
        && symMiss === 0 && Math.hypot(cx, cz) < 1e-9 && Math.abs(height - TARGET_H) < 1e-9
        && MAX_H + ROD_R <= apothem + 1e-9 && crown === 1 && waist === 4 && foot === 1 && onAxis
        && cardinalSnap && diagSnap && allAloft && Math.abs(footY - FOOT_BEAD_Y) < 1e-12
        && FOOT_BEAD_Y - BEAD_R >= -1e-9 && FOOT_BEAD_Y + BEAD_R <= PLINTH_H + 1e-9
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; bottom octagon spread ${botSpread.toExponential(1)} at dais top ${PLINTH_H}; top octagon level (spread ${topSpread.toExponential(1)}); 90° misses ${symMiss}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); beads 1 crown dead-axis + 4 waist at the EXACT cardinals (NO twist needed — Rx90 lands them), all aloft, + 1 pressed foot bead at y ${footY} (tico's-twelfth idiom, hidden beneath the widest face — six in truth); up-tilted cuts at exact 45° diagonals; FINIAL crown bead top ${beadTop.toFixed(3)} clears rim sight line ${sightY.toFixed(3)} by ${finialClear.toFixed(3)}m (>= ${1.5 * BEAD_R} law) — reads from every ground vantage`);
}

// ---- T8 immersion (plates tuck under the seams — family shadow-gap law) ----------------------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;       // plate mid-plane offset along outward normal
    let worstPlane = -Infinity;                            // max outward poke (must be ≤ 0)
    let worstTuck = 0;                                     // corner depth into rod cylinder (reported)
    for (let u = 0; u < faces.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const b = faces[u].verts.length;                   // 3 or 8
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
        `worst outward poke ${worstPlane.toExponential(1)} (≤ 0 = fully inside); max corner tuck into rod cylinders ${worstTuck.toFixed(4)}m (invisible — inside solid rod geometry, co idiom); plate outer face ${PLATE_BACK * 1000}mm behind the rod outer surface; the FOOT octagon plate rides the dais band (buried flush — the rods carry the silhouette, tret bottom-triangle precedent)`);
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
    // beads: crown finial (stem-lifted), 4 waist cardinals (poked), pressed foot (sunk)
    for (let u = 0; u < faces.length; u++) {
        if (IS_TRI[u]) continue;
        const nn = NORMALS[u];
        let p: V3;
        if (nn[1] > 0.99) {
            const topIdx = u;
            p = [CENTERS[topIdx][0], CENTERS[topIdx][1] + BEAD_POKE + STEM_H, CENTERS[topIdx][2]];
        } else if (nn[1] < -0.99) {
            p = [0, FOOT_BEAD_Y, 0];
        } else {
            p = [
                CENTERS[u][0] + NORMALS[u][0] * BEAD_POKE,
                CENTERS[u][1] + NORMALS[u][1] * BEAD_POKE,
                CENTERS[u][2] + NORMALS[u][2] * BEAD_POKE,
            ];
        }
        acc(p[0] - BEAD_R, p[1] - BEAD_R, p[2] - BEAD_R);
        acc(p[0] + BEAD_R, p[1] + BEAD_R, p[2] + BEAD_R);
    }
    // finial stem: crown plane → lifted bead center, on the axis
    {
        const topIdx = faces.findIndex((f, fi) => !f.isTri && NORMALS[fi][1] > 0.99);
        const p0: V3 = [CENTERS[topIdx][0], CENTERS[topIdx][1] + BEAD_POKE, CENTERS[topIdx][2]];
        const pTop: V3 = [p0[0], p0[1] + STEM_H, p0[2]];
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

console.log(`seat: octagon-down 4-fold (parent face axis); bottom face flat on dais top ${PLINTH_H}; solid height ${TARGET_H}m; edge a ${EDGE.toFixed(4)}m; R ${R_TCUBE.toFixed(4)}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} → ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`panels: 6 stone octagons + 8 iron triangles + 36 iron seam rods; beads: 6 brass octagon centers (crown FINIAL lifted ~${(CENTERS[faces.findIndex((f, fi) => !f.isTri && NORMALS[fi][1] > 0.99)][1] + STEM_H).toFixed(2)}m on a ${STEM_R}m iron stem, 4 waist cardinals ~${CENTERS[faces.findIndex((f, fi) => !f.isTri && Math.abs(NORMALS[fi][1]) < 0.01)][1].toFixed(2)}m world-y, 1 pressed foot at y ${FOOT_BEAD_Y}) — the six parent faces, lit; the cuts stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct249-tcube)");
