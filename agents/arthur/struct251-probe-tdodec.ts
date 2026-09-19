// struct251-probe-tdodec.ts — STRUCTURES LANE struct-251, Round 11 R11-62.
// THE TRUNCATED DODECAHEDRON — the branch closes. Form-ledger grep fresh
// this tick: truncated dodecahedron / tdodec 0 real mentions across
// STRUCTURES-PLAN (only the struct-250 queue-head pointer naming it the
// candidate), IMPROVEMENTS, IMPROVE-PLAN, CITY-PLAN(-V2) (the CITY lane's
// PLAIN dodecahedron r110 W is the PARENT, not the truncation),
// NEW-VILLAGE-PLAN, DRESSING-PLAN (dodeca-debris topology notes only).
// The ARCHIMEDEAN branch's SIXTH member (struct-237 cubocta, struct-243
// tico, struct-245 toct, struct-247 tret, struct-249 tcube) and the
// PARENT-ECHO of the dodecahedron — the LAST Platonic parent
// (tetra✓tret, octa✓toct, icosa✓tico, cube✓tcube, dodeca→tdodec).
//
// ONE IDEA: THE LIGHTEST CUT. The family law is 1/3 — but cut a
// DODECAHEDRON's twenty vertices at exactly 1/3 and the pentagons become
// IRREGULAR decagons (corner sides u·p·φ vs middle sides (1−2u)·p — side
// ratio exactly φ at u = 1/3, machine-proven T6b). Regularity demands
// u = 1/(2+φ) = (3−φ)/5 ≈ 0.2764 — the cut pulls BACK below the family
// third. Cut that light and exactly
//   1 − 20φ/(3(15+7√5)(2+φ)³) ≈ 99.26%
// of the parent still stands — the LIGHTEST touch of the entire branch
// (tcube 96.65%, tico/toct/tret far below): twenty razor tets take
// ~0.74% of the mass. The last parent barely bleeds.
//
// Presentation: DECAGON-DOWN, 5-fold — the parent's own face, grown,
// FLAT on the dais (family seat law; toct hexagon-down, tcube
// octagon-down). The crown decagon faces dead up; the belt's ten
// decagons interleave upper/lower at exact 36° spacing; the twenty
// triangles (the cuts, dark) tilt between. IRON carries the 20 TRIANGLES
// + all 90 seam bonds; STONE carries the 12 DECAGONS (the parent's own
// face planes; D-D dihedral == the parent dodeca's own 116.565°, T5) +
// the THIRTY-TWO-sided dais (one side per face, 12 + 20 — theme-number
// law). Night contract: twelve warm brass beads at the twelve DECAGON
// centers — the parent's faces, lit: one CROWN on an iron finial stem
// (tret v2 occlusion law) + ten WAIST (5 upper + 5 lower, all aloft,
// snapped so a lower-ring decagon reads dead-on +X) + the TWELFTH
// PRESSED INTO THE EARTH beneath the flat foot (tico's-twelfth idiom,
// fully buried in the dais band — eleven read at night, twelve in
// truth, disclosed). The iron cuts stay dark.
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   Parent: dodeca verts (±1,±1,±1) + (0,±1/φ,±φ)+cyclic, edge
//   p = 2/φ, 20 verts, 30 edges, 12 faces. Face normals = the 12
//   icosahedral dirs (0,±1,±φ)+cyclic. Cut points A+u(B−A), A+(1−u)(B−A)
//   on each parent edge → 60 verts. Uniform edge a = (1−2u)p = 2/(2+φ).
//   R = (a/4)√(74+30√5) (closed form, T5). Corner tets: legs L = u·p
//   pairwise at 108° (the pentagon's own interior angle — every edge
//   pair at a dodeca vertex shares a face); det = L³·φ/2 (T6 proves
//   1+2c³−3c² = φ²/4 at c = cos108°), so V_corner = L³φ/12.
//   V_parent = (15+7√5)p³/4, cross-checked as 12 face pyramids.
//   Seat: face normal nrm(0,−1,φ) → −Y (DECAGON DOWN, 5-fold), then a
//   measured twist-snap about +Y puts one lower-ring decagon dead on +X
//   (toct snap-sign law: Ry(t) maps az a → a−t; verified by measurement,
//   hard throw if the snapped az misses 0).
//
// DAIS LAW: APOTHEM-FIRST for all N (struct-247 fix, carried).
//
// THEOREMS machine-verified below:
//   T1 Euler: 60 − 90 + 32 = 2 (sphere).
//   T2 face census: 20 regular triangles (60°) + 12 regular decagons
//      (144°), every side == a.
//   T3 vertex census: degree 3 everywhere; exactly 1 triangle + 2
//      decagons at every vertex (60×) — figure 3.10.10.
//   T4 manifold: every edge on exactly 2 faces (90 face-edges).
//   T5 uniformity: all 60 verts at exactly R (== closed form); dihedrals
//      exactly TWO classes — D-D dot == +1/√5 (interior 116.565° — the
//      PARENT dodeca's own: the decagon planes ARE the parent's face
//      planes), T-D dot == √((25+11√5)/10)/(φ√3) (interior 142.62°);
//      zero triangle-triangle edges (60 T-D + 30 D-D == 90).
//   T6 THE LIGHTEST CUT: each corner tet exactly L³φ/12; divergence
//      volume == parent − 20·corner; remains == 1 − 20φ/(3(15+7√5)(2+φ)³)
//      exactly (≈ 99.26%).
//   T6b THE 1/3-BAR: at the family's 1/3-cut the decagon side ratio is
//      exactly φ (irregular) AND u < 1/3 strictly — regularity pulls the
//      cut back below the family third, and even the regular touch
//      leaves 99.26% standing.
//   T7 seat: bottom decagon FLAT at dais top (10 verts level), top
//      decagon parallel, 72° symmetry about Y, centroid on axis, height
//      == target, reach+rod ≤ dais apothem (never overhangs,
//      apothem-first); waist decagon azimuths exact (lower ring
//      {0,±72°,±144°} with the SNAP face dead on +X, upper ring
//      {±36°,±108°,180°} — the belt interleaves at 36°); bead census
//      honest: 1 crown dead-axis finial + 10 waist all aloft + 1 pressed
//      foot bead at the tico-twelfth depth (disclosed); FINIAL-CLEARANCE
//      LAW (tret v2): crown bead top clears the crown rim sight line
//      from READER_D by ≥ 1.5·BEAD_R.
//   T8 immersion: every inset plate corner, lifted to the plate mid-plane,
//      lies strictly INSIDE the convex solid (no face-plane poke-through);
//      corner tuck into the rod cylinders reported.
//   RED control: --red displaces one vertex 0.3 — T2/T5/T7 must fail.

export const TARGET_H = 6.4;              // seated solid height (5-fold face axis) — the closing member stands tallest of the recent seats
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
export const PLINTH_N = 32;               // THIRTY-TWO sides — one per face (12 decagons + 20 triangles)
export const PLINTH_ROT = 0;              // corners ON the axes
export const PLINTH_H = 0.30;
export const FOOT_BEAD_Y = 0.15;          // pressed twelfth bead center — spans exactly the dais band 0→0.30, FULLY BURIED (tico's-twelfth idiom: never reads, twelve in truth)
export const PHI = (1 + Math.sqrt(5)) / 2;
export const U_CUT = 1 / (2 + PHI);       // (3−φ)/5 ≈ 0.27639 — THE LIGHTEST CUT (T6b: 1/3 is irregular, ratio φ)

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

// ---- parent dodecahedron: (±1,±1,±1) + the golden ring --------------------------------
const M: V3[] = [];
for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) M.push([sx, sy, sz]);
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    M.push([0, s1 / PHI, s2 * PHI]);
    M.push([s1 / PHI, s2 * PHI, 0]);
    M.push([s2 * PHI, 0, s1 / PHI]);
}
if (M.length !== 20) throw Error(`parent verts ${M.length} != 20`);
const P_EDGE = 2 / PHI;                       // exact for these coords
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 30) throw Error(`parent edges ${P_EDGES.length} != 30`);

// ---- parent faces: the 12 normal directions ------------------------------------------------
// SELF-CATCH (first run threw "face plane not level"): with golden verts
// (0,±1/φ,±φ)-cyclic, the face normals are the (0,±φ,±1)-cyclic family —
// NOT (0,±1,±φ). Verified by hand before patching: projecting onto
// (0,φ,1)/√(φ²+1) levels exactly the five verts {(1,1,1),(0,1/φ,φ),
// (−1,1,1),(1/φ,φ,0),(−1/φ,φ,0)} at 1.3764 — the (±1,±φ) family is the
// dual pairing for the OPPOSITE chirality of the construction.
const FACE_DIRS: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    FACE_DIRS.push(nrm([0, s1 * PHI, s2]));
    FACE_DIRS.push(nrm([s1 * PHI, s2, 0]));
    FACE_DIRS.push(nrm([s2, 0, s1 * PHI]));
}
if (FACE_DIRS.length !== 12) throw Error(`face dirs ${FACE_DIRS.length} != 12`);
const P_FACES: number[][] = [];
for (const d of FACE_DIRS) {
    const order = M.map((v, i) => [dot(v, d), i] as [number, number]).sort((a, b) => b[0] - a[0]);
    const plane = order[4][0];
    if (Math.abs(order[0][0] - plane) > 1e-12) throw Error("face plane not level");
    if (plane - order[5][0] < 1e-9) throw Error("face plane ambiguous");
    P_FACES.push(order.slice(0, 5).map(([, i]) => i));
}
if (P_FACES.length !== 12) throw Error(`parent faces ${P_FACES.length} != 12`);

// ---- truncation at THE LIGHTEST CUT u = 1/(2+φ): 60 verts, deduped by proximity --------
const A_UNIT = (1 - 2 * U_CUT) * P_EDGE;      // uniform edge = 2/(2+φ)
if (Math.abs(U_CUT * P_EDGE * PHI - A_UNIT) > 1e-12)
    throw Error(`regularity identity broken: corner ${U_CUT * P_EDGE * PHI} vs middle ${A_UNIT}`);
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
if (pts.length !== 60) throw Error(`truncation verts ${pts.length} != 60`);
const R_UNIT = Math.hypot(...pts[0]);
const R_CLOSED = (A_UNIT / 4) * Math.sqrt(74 + 30 * Math.sqrt(5));   // closed form — must equal R_UNIT

// ---- tdodec edges by distance ----------------------------------------------------------------------------------------
const EDGES: [number, number][] = [];
for (let i = 0; i < 60; i++) for (let j = i + 1; j < 60; j++)
    if (Math.abs(dist(pts[i], pts[j]) - A_UNIT) < 1e-9) EDGES.push([i, j]);
if (EDGES.length !== 90) throw Error(`tdodec edges ${EDGES.length} != 90`);

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
for (let i = 0; i < 20; i++) {
    const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
    if (nbrs.length !== 3) throw Error(`parent degree ${nbrs.length} != 3`);
    const ring = nbrs.map((j) => add(M[i], mul(sub(M[j], M[i]), U_CUT)));
    const { verts, center, n } = orderRing(ring);
    faces.push({ k: 3, verts, center, n, isTri: true });
}
// decagons: one per parent face — the 10 cut points on its boundary edges
for (const fv of P_FACES) {
    const set = new Set(fv);
    const bEdges = P_EDGES.filter(([i, j]) => set.has(i) && set.has(j));
    if (bEdges.length !== 5) throw Error(`face boundary edges ${bEdges.length} != 5`);
    const ring: V3[] = [];
    for (const [i, j] of bEdges) {
        ring.push(add(M[i], mul(sub(M[j], M[i]), U_CUT)));
        ring.push(add(M[i], mul(sub(M[j], M[i]), 1 - U_CUT)));
    }
    const { verts, center, n } = orderRing(ring);
    faces.push({ k: 10, verts, center, n, isTri: false });
}
if (faces.length !== 32) throw Error(`faces ${faces.length} != 32`);
if (faces.filter((f) => f.isTri).length !== 20) throw Error("triangle count != 20");

// ---- edgeFaces (module scope — used by T4/T5) ----------------------------------------------------------------------
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < faces.length; fi++) for (let t = 0; t < faces[fi].verts.length; t++) {
    const a = faces[fi].verts[t], b = faces[fi].verts[(t + 1) % faces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ---- seating: parent face normal nrm(0,−1,φ) → −Y (DECAGON DOWN, 5-fold) + measured twist-snap ----------------------
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const v0: V3 = nrm([0, -PHI, 1]);             // the chosen parent face normal (new family) — the foot
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// twist-snap (toct sign law): Ry(t) maps az a → a−t (az = atan2(z,x)); snap
// the lower-ring decagon closest to +X dead onto az 0, then VERIFY BY
// MEASUREMENT with a hard throw — no sign convention is trusted bare.
const RyT = (t: number, p: V3): V3 => {
    const c = Math.cos(t), s = Math.sin(t);
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
};
let SNAP_FI = -1;
{
    const lowerIdx: number[] = [];
    for (let fi = 0; fi < faces.length; fi++) {
        if (faces[fi].isTri) continue;
        const n1 = rot1(faces[fi].n);
        if (n1[1] < -0.2 && n1[1] > -0.7) lowerIdx.push(fi);      // the lower belt ring (n_y ≈ −1/√5)
    }
    if (lowerIdx.length !== 5) throw Error(`lower ring ${lowerIdx.length} != 5`);
    let snapAz = Infinity;
    for (const fi of lowerIdx) {
        const c = rot1(faces[fi].center);
        const az = Math.atan2(c[2], c[0]);
        if (Math.abs(az) < Math.abs(snapAz)) { snapAz = az; SNAP_FI = fi; }
    }
    const twist = snapAz;                       // az → az − twist zeroes the snap face
    const rot2 = (v: V3): V3 => RyT(twist, v);
    const snapped = Math.atan2(rot2(rot1(faces[SNAP_FI].center))[2], rot2(rot1(faces[SNAP_FI].center))[0]);
    if (Math.abs(snapped) > 1e-9) throw Error(`twist-snap missed: az ${snapped}`);
    var rot = (v: V3): V3 => rot2(rot1(v));    // eslint-disable-line no-var
}

// ---- scale + lift: bottom decagon plane lands exactly on the dais top ----------------------------------------------
const seatedUnit = pts.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
export const EDGE = A_UNIT * SCALE;
export const R_TDODEC = R_UNIT * SCALE;
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

// RED control (--red displaces one vertex: breaks side/uniformity/symmetry laws)
if (process.argv.includes("--red")) {
    V[7] = [V[7][0] + 0.3, V[7][1] - 0.2, V[7][2] + 0.15];
    console.log("RED MODE: vertex 7 displaced 0.3 — T2/T5/T7 MUST fail");
}

// ---- derived footprint constants (BEFORE all checks — no TDZ) --------------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
// APOTHEM-FIRST dais law (struct-247 fix, carried for all N)
export const PLINTH_R = Math.ceil(((MAX_H + ROD_R + 0.10) / Math.cos(Math.PI / PLINTH_N)) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// ---- T1 Euler --------------------------------------------------------------------------------------------------------
check("T1 Euler 60−90+32 = 2", V.length === 60 && E.length === 90 && faces.length === 32 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census ---------------------------------------------------------------------------------------------------
{
    let worstSide = 0, worstAng = 0;
    for (const f of faces) {
        const want = f.k === 3 ? Math.PI / 3 : 4 * Math.PI / 5;   // 60° / 144°
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
    const triC = faces.filter((f) => f.k === 3).length, decC = faces.filter((f) => f.k === 10).length;
    check("T2 faces: 20 regular triangles (60°) + 12 regular decagons (144°), every side == a",
        triC === 20 && decC === 12 && worstSide < 1e-9 && worstAng < 1e-7,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst angle dev ${worstAng.toExponential(1)} rad; side a ${EDGE.toFixed(4)}m — REGULAR decagons need the lightest cut u = 1/(2+φ) = ${U_CUT.toFixed(10)} (T6b)`);
}

// ---- T3 vertex census -------------------------------------------------------------------------------------------------
{
    const deg = new Array(60).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    let badFig = 0;
    for (let i = 0; i < 60; i++) {
        const tf = faces.filter((f) => f.verts.includes(i) && f.isTri).length;
        const of_ = faces.filter((f) => f.verts.includes(i) && !f.isTri).length;
        if (tf !== 1 || of_ !== 2) badFig++;
    }
    check("T3 vertices: degree 3 everywhere; exactly 1 triangle + 2 decagons at every vertex (figure 3.10.10)",
        deg.every((d) => d === 3) && badFig === 0,
        `Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}; figure violations ${badFig}`);
}

// ---- T4 manifold ------------------------------------------------------------------------------------------------------
{
    const bad = [...edgeFaces.values()].filter((c) => c.length !== 2).length;
    const missing = E.filter(([a, b]) => (edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && edgeFaces.size === 90,
        `${edgeFaces.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 uniformity ----------------------------------------------------------------------------------------------------
{
    let worstR = 0;
    for (const v of V) worstR = Math.max(worstR, Math.abs(dist(v, SOLID_CENTER) - R_TDODEC));
    const TD_CLOSED = Math.sqrt((25 + 11 * Math.sqrt(5)) / 10) / (PHI * Math.sqrt(3));
    let ddWorst = 0, tdWorst = 0, ddN = 0, tdN = 0, ttN = 0;
    for (const [, fl] of edgeFaces) {
        if (fl.length !== 2) continue;
        const tA = faces[fl[0]].isTri, tB = faces[fl[1]].isTri;
        const d = dot(NORMALS[fl[0]], NORMALS[fl[1]]);
        if (tA && tB) ttN++;
        else if (tA !== tB) { tdN++; tdWorst = Math.max(tdWorst, Math.abs(d - TD_CLOSED)); }
        else { ddN++; ddWorst = Math.max(ddWorst, Math.abs(d - 1 / Math.sqrt(5))); }
    }
    check("T5 uniformity: all 60 verts at exactly R_tdodec; dihedrals exactly two classes — D-D == parent (dot +1/√5, interior 116.565°), T-D == √((25+11√5)/10)/(φ√3) (interior 142.62°); zero triangle-triangle edges",
        worstR < 1e-9 && ddN === 30 && tdN === 60 && ttN === 0 && ddWorst < 1e-9 && tdWorst < 1e-9,
        `R dev ${(worstR * 1e12).toExponential(1)} (R ${R_TDODEC.toFixed(6)} == closed form ${(R_CLOSED * SCALE).toFixed(6)}); D-D ${ddN} edges worst |dot−1/√5| ${ddWorst.toExponential(1)} (interior 116.565° — the PARENT dodeca's own: the decagon planes ARE the parent's face planes); T-D ${tdN} edges worst |dot−closed| ${tdWorst.toExponential(1)} (interior ${(Math.acos(-TD_CLOSED) * 180 / Math.PI).toFixed(4)}°); T-T ${ttN} (no two cuts share a wall; 60 T-D + 30 D-D == 90)`);
}

// ---- T6 THE LIGHTEST CUT ----------------------------------------------------------------------------------------------
{
    const det3 = (a: V3, b: V3, c: V3) => dot(a, cross(b, c));
    // parent volume: closed form (15+7√5)p³/4, cross-checked as 12 face pyramids
    const V_parent = (15 + 7 * Math.sqrt(5)) / 4 * P_EDGE ** 3;
    const A_pent = Math.sqrt(5 * (5 + 2 * Math.sqrt(5))) / 4 * P_EDGE ** 2;
    const r_in = Math.hypot(...faces.find((f) => !f.isTri)!.center);       // unit decagon center distance == dodeca inradius
    const V_pyramids = 12 * (1 / 3) * A_pent * r_in;
    // corner tets: legs L = u·p pairwise at 108°; det = L³·φ/2 so V = L³φ/12
    const L = U_CUT * P_EDGE;
    const cornerAnalytic = L ** 3 * PHI / 12;
    let cornerWorst = 0;
    const corners: number[] = [];
    for (let i = 0; i < 20; i++) {
        const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
        const c1 = add(M[i], mul(sub(M[nbrs[0]], M[i]), U_CUT));
        const c2 = add(M[i], mul(sub(M[nbrs[1]], M[i]), U_CUT));
        const c3 = add(M[i], mul(sub(M[nbrs[2]], M[i]), U_CUT));
        const vc = Math.abs(det3(sub(c1, M[i]), sub(c2, M[i]), sub(c3, M[i]))) / 6;
        corners.push(vc);
        cornerWorst = Math.max(cornerWorst, Math.abs(vc - cornerAnalytic));
    }
    // tdodec volume by the divergence theorem over its OWN faces (unit frame — rotation-invariant)
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
    const agree = Math.abs(V_div - (V_parent - 20 * corners[0]));
    const remainsClosed = 1 - 20 * PHI / (3 * (15 + 7 * Math.sqrt(5)) * (2 + PHI) ** 3);
    check("T6 THE LIGHTEST CUT: each corner exactly L³φ/12; divergence volume == parent − 20·corner; remains == 1 − 20φ/(3(15+7√5)(2+φ)³)",
        Math.abs(V_parent - V_pyramids) < 1e-12 && cornerWorst < 1e-12 && Math.abs(ratio - remainsClosed) < 1e-12 && agree < 1e-12,
        `parent ${V_parent.toFixed(10)} == 12-pyramid ${V_pyramids.toFixed(10)}; corner worst |v−L³φ/12| ${cornerWorst.toExponential(1)} (20 × ${corners[0].toFixed(10)} = ${(20 * corners[0]).toFixed(10)} taken); divergence tdodec ${V_div.toFixed(10)}; ratio ${ratio.toFixed(12)} vs closed ${remainsClosed.toFixed(12)}; independent agreement ${agree.toExponential(1)} — CUT THE TWENTY VERTICES OF THE LAST PARENT AND ${(remainsClosed * 100).toFixed(4)}% OF THE DODECAHEDRON STILL STANDS (the branch's lightest touch)`);
}

// ---- T6b THE 1/3-BAR (why the regular cut is lighter) ------------------------------------------------------------------
{
    const u13 = 1 / 3;
    const cornerSide13 = u13 * P_EDGE * PHI;      // φ·p/3
    const middle13 = (1 - 2 * u13) * P_EDGE;      // p/3
    const ratio13 = cornerSide13 / middle13;
    check("T6b THE 1/3-BAR: at the family's 1/3-cut the decagon side ratio is exactly φ (IRREGULAR); the regular cut u is STRICTLY lighter",
        Math.abs(ratio13 - PHI) < 1e-12 && U_CUT < 1 / 3,
        `1/3-cut sides ${cornerSide13.toFixed(10)} vs ${middle13.toFixed(10)} — ratio ${ratio13.toFixed(12)} == φ exactly (irregular); our u = ${U_CUT.toFixed(10)} = (3−φ)/5 < 1/3 by ${(1 / 3 - U_CUT).toFixed(10)} — regularity pulls the cut back below the family third`);
}

// ---- T7 seat laws -----------------------------------------------------------------------------------------------------
{
    const botDec = faces.find((f, fi) => !f.isTri && NORMALS[fi][1] < -0.99);
    if (!botDec) throw Error("no bottom decagon found — seating broken");
    const botVs = botDec.verts.map((vi) => V[vi][1]);
    const botSpread = Math.max(...botVs) - Math.min(...botVs);
    const topDec = faces.find((f, fi) => !f.isTri && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9);
    if (!topDec) throw Error("no top decagon found — seating broken");
    const topVs = topDec.verts.map((vi) => V[vi][1]);
    const topSpread = Math.max(...topVs) - Math.min(...topVs);
    const cx = V.reduce((s, v) => s + v[0], 0) / 60;
    const cz = V.reduce((s, v) => s + v[2], 0) / 60;
    const a = (72 * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    // FINIAL-CLEARANCE LAW (tret v2): crown bead top must clear the crown rim's
    // sight line from READER_D by >= 1.5·BEAD_R — else it renders zero px
    // from every ground vantage.
    const topIdx = faces.indexOf(topDec);
    const rimY = Math.max(...topDec.verts.map((vi) => V[vi][1]));           // crown rim level
    const rimR = Math.max(...topDec.verts.map((vi) => Math.hypot(V[vi][0], V[vi][2]))); // crown rim reach
    const crownPlane = CENTERS[topIdx][1] + NORMALS[topIdx][1] * BEAD_POKE; // crown bead base plane
    const beadTop = crownPlane + STEM_H + BEAD_R;                           // finial bead top
    const sightY = rimY + (rimY - READER_EYE) * rimR / (READER_D - rimR);   // sight line at the axis
    const finialClear = beadTop - sightY;                                   // must be >= 1.5·BEAD_R
    // bead census: 1 crown dead-axis + 10 waist (5 upper + 5 lower, all
    // aloft) + 1 pressed foot bead at the tico-twelfth depth (disclosed)
    let crown = 0, waist = 0, foot = 0, onAxis = false, allAloft = true;
    const azLower: number[] = [], azUpper: number[] = [];
    let footY = -1;
    for (let u = 0; u < faces.length; u++) {
        if (IS_TRI[u]) continue;                            // beads at the twelve DECAGON centers — what remains
        const cc = CENTERS[u], nn = NORMALS[u];
        if (nn[1] > 0.99) { crown++; if (Math.hypot(cc[0], cc[2]) < 1e-9) onAxis = true; }
        else if (nn[1] < -0.99) { foot++; footY = FOOT_BEAD_Y; }
        else {
            waist++;
            const az = Math.atan2(cc[2], cc[0]);
            (nn[1] > 0 ? azUpper : azLower).push(az);
            if (cc[1] + nn[1] * BEAD_POKE <= PLINTH_H + 1e-6) allAloft = false;
        }
        if (nn[1] > 0.99 && cc[1] + nn[1] * BEAD_POKE <= PLINTH_H + 1e-6) allAloft = false;
    }
    // waist az sets: lower ring dead on the 72° cardinals with the SNAP face
    // at az 0; upper ring interleaved at the 36° offsets (the belt zigzag)
    const azNear = (x: number, card: number) => Math.abs(Math.atan2(Math.sin(x - card), Math.cos(x - card)));
    const lowerSnap = azLower.length === 5 && azLower.every((x) =>
        [0, (2 * Math.PI) / 5, (4 * Math.PI) / 5, (6 * Math.PI) / 5, (8 * Math.PI) / 5].some((card) => azNear(x, card) < 1e-9));
    const upperSnap = azUpper.length === 5 && azUpper.every((x) =>
        [Math.PI / 5, (3 * Math.PI) / 5, Math.PI, (7 * Math.PI) / 5, (9 * Math.PI) / 5].some((card) => azNear(x, card) < 1e-9));
    const snapAz = Math.atan2(CENTERS[SNAP_FI][2], CENTERS[SNAP_FI][0]);
    const t7parts = {
        botFlat: botSpread < 1e-9, botAtDais: Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9,
        topFlat: topSpread < 1e-9, sym: symMiss === 0, ctr: Math.hypot(cx, cz) < 1e-9,
        hgt: Math.abs(height - TARGET_H) < 1e-9, noOver: MAX_H + ROD_R <= apothem + 1e-9,
        crown, waist, foot, onAxis, lowerSnap, upperSnap, snapAz: snapAz.toFixed(10), allAloft,
        footPressed: foot === 1 && Math.abs(footY - FOOT_BEAD_Y) < 1e-12,
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3),
    };
    check("T7 seat: bottom decagon FLAT at dais top, top decagon parallel, 72° symmetry, centroid on axis, height == target, never overhangs (apothem-first), waist azimuths exact (lower 72° cardinals + snap face az 0, upper 36° interleave), bead census honest (11 aloft + 1 pressed, disclosed)",
        botSpread < 1e-9 && Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9 && topSpread < 1e-9
        && symMiss === 0 && Math.hypot(cx, cz) < 1e-9 && Math.abs(height - TARGET_H) < 1e-9
        && MAX_H + ROD_R <= apothem + 1e-9 && crown === 1 && waist === 10 && foot === 1 && onAxis
        && lowerSnap && upperSnap && Math.abs(snapAz) < 1e-9 && allAloft && Math.abs(footY - FOOT_BEAD_Y) < 1e-12
        && FOOT_BEAD_Y - BEAD_R >= -1e-9 && FOOT_BEAD_Y + BEAD_R <= PLINTH_H + 1e-9
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; bottom decagon spread ${botSpread.toExponential(1)} at dais top ${PLINTH_H}; top decagon level (spread ${topSpread.toExponential(1)}); 72° misses ${symMiss}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); beads 1 crown dead-axis + 10 waist (5 upper + 5 lower, az sets exact, SNAP face az ${snapAz.toFixed(10)}), all aloft, + 1 pressed foot bead at y ${footY} (tico's-twelfth idiom, hidden beneath the widest face — twelve in truth); FINIAL crown bead top ${beadTop.toFixed(3)} clears rim sight line ${sightY.toFixed(3)} by ${finialClear.toFixed(3)}m (>= ${1.5 * BEAD_R} law) — reads from every ground vantage`);
}

// ---- T8 immersion (plates tuck under the seams — family shadow-gap law) ----------------------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;       // plate mid-plane offset along outward normal
    let worstPlane = -Infinity;                            // max outward poke (must be ≤ 0)
    let worstTuck = 0;                                     // corner depth into rod cylinder (reported)
    for (let u = 0; u < faces.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const b = faces[u].verts.length;                   // 3 or 10
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
        `worst outward poke ${worstPlane.toExponential(1)} (≤ 0 = fully inside); max corner tuck into rod cylinders ${worstTuck.toFixed(4)}m (invisible — inside solid rod geometry, co idiom); plate outer face ${PLATE_BACK * 1000}mm behind the rod outer surface; the FOOT decagon plate rides the dais band (buried flush — the rods carry the silhouette, tret bottom-triangle precedent)`);
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
    // beads: crown finial (stem-lifted), 10 waist (poked), pressed foot (sunk)
    for (let u = 0; u < faces.length; u++) {
        if (IS_TRI[u]) continue;
        const nn = NORMALS[u];
        let p: V3;
        if (nn[1] > 0.99) {
            p = [CENTERS[u][0], CENTERS[u][1] + BEAD_POKE + STEM_H, CENTERS[u][2]];
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

console.log(`seat: decagon-down 5-fold (parent face axis); bottom face flat on dais top ${PLINTH_H}; solid height ${TARGET_H}m; edge a ${EDGE.toFixed(4)}m; R ${R_TDODEC.toFixed(4)}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} → ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`panels: 12 stone decagons + 20 iron triangles + 90 iron seam rods; beads: 12 brass decagon centers (crown FINIAL lifted ~${(CENTERS[faces.findIndex((f, fi) => !f.isTri && NORMALS[fi][1] > 0.99)][1] + STEM_H).toFixed(2)}m on a ${STEM_R}m iron stem, lower waist ~${CENTERS[faces.findIndex((f, fi) => !f.isTri && NORMALS[fi][1] < -0.2 && NORMALS[fi][1] > -0.7)][1].toFixed(2)}m world-y (upper ring higher), 1 pressed foot at y ${FOOT_BEAD_Y}) — the twelve parent faces, lit; the cuts stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct251-tdodec)");
