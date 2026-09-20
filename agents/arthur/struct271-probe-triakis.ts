// struct271-probe-triakis.ts — STRUCTURES LANE struct-271, Round 11 R11-79.
// THE TRIAKIS ICOSAHEDRON — the Catalan dual of the standing truncated
// dodecahedron (tdodec, struct-251/252, SW quarter az196.5 r80). Catalan
// branch member 4 (rt struct-235 opened it; dtria struct-267/268 member 2;
// deltoid struct-269/270 member 3). The dual-of-freshest-parent move a
// FOURTH time (gsd->gdodec, trico->dtria, rico->deltoid, tdodec->triakis).
//
// FORM-LEDGER GREP fresh this tick (triakis|tetrakis|pentakis|deltoid|
// hexecontahedron over the five-file set + SWEEP/NEW-VILLAGE/DRESSING):
// 0 real claims — all four small Catalans unclaimed. The triakis
// TETRAHEDRON's parent tret stands in the capped E band; the triakis
// OCTA's parents (toct/trcubo) and the tetrakis CUBE's parent toct stand
// N-E (5/6); the triakis ICOSA's parent tdodec stands SW at 5/6 — the
// richest unclaimed form whose parent's band holds its last slot.
// ACHIRAL, machine-proven (T0b: closing improper maps measured — the
// icosa-symmetric set exists in ONE form; no handedness owed Bill).
//
// ONE IDEA: THE LIGHTEST CUT, READ THROUGH THE LOOKING GLASS. The parent
// told the dodecahedron's twenty vertices cut at the family's LIGHTEST
// touch (99.26% standing, u = 1/(2+phi) — struct-251 T6); the polar
// reciprocal about the tdodec's midsphere (rho = phi exact in the
// parent's edge-2/phi frame, T0) turns every parent FACE into a POINT and
// every one of the 60 tdodec VERTICES into an ISOCELES sail — one dec
// head corner pair + one tri apex, every sail kissing ONE insphere at
// exact rho^2/R (the Catalan tangent property, T6). THE RANK INVERSION
// IS THE STORY: the parent's cut planes sit FAR out (h_tri 1.6101) while
// its decagon planes sit deep (h_dec 1.3764 = phi^2/sqrt(phi^2+1)) — so
// in the dual the TWENTY CUT-GHOSTS sink to the INNER rank (rho^2/h_tri
// 1.6260, degree 3 — the sharpest three-fold apexes) and the TWELVE
// PARENT-FACES stand as the TWELVE GREAT OUTER POINTS (rho^2/h_dec =
// sqrt(phi^2+1) = 1.9021 EXACTLY — the ICOSAHEDRON's own vertex radius,
// the closed form the dual owes its grandparent; degree 10 — the
// decagon's tenness told at a point). The razors' ghosts point inward;
// the faces they cut become the crown.
// Presentation: DEC-RANK POINT-DOWN 5-fold on the parent's own seated
// frame INHERITED (decagon-down + twist-snap — no re-seat; the same
// lower-belt decagon that read dead-on +X in the parent puts its dual
// point dead-on az 0 here). STONE carries all 60 isoceles sails (ONE
// face family = ONE sail material — the face-transitivity read in the
// material law) + the SIXTY-sided dais (one side per sail, theme-number
// law); IRON carries all 90 seam bonds + the crown finial stem. Night
// contract: TWELVE warm brass beads at the twelve dec-rank points — the
// parent's OWN bead census told again (its twelve lit decagons become
// twelve lit points): 1 CROWN on the finial stem (tret v2 occlusion
// law) + TEN WAIST in two exact 72-degree pentads (upper interleaved
// 36-deg, inversion-paired) + THE TWELFTH PRESSED INTO THE EARTH beneath
// the standing point (tico's-twelfth idiom). The 20 tri-rank apexes
// stay dark.
//
// Laws honored: dais APOTHEM-FIRST (struct-247); texMat lanes (struct-38);
// ROOT STAYS IDENTITY (struct-188); NaN 0; below-grade 0.
//
// THEOREMS machine-verified below:
//   T0 dual census + midsphere: 32/90/60; every tdodec edge midpoint at
//      exactly one radius rho (== phi closed-form in the parent frame);
//      two dual vertex radii classes rho^2/h exact, dec-rank OUTERMOST /
//      tri-rank INNERMOST (the rank inversion measured).
//   T0b ACHIRALITY: SOME improper orthogonal map closes BOTH vertex sets
//      (all six candidates tested, winners reported) — no handedness owed.
//   T1 Euler: 32 - 90 + 60 = 2 (sphere).
//   T2 sail census: 60 isoceles triangles; every sail one tri apex + two
//      dec corners in ring order; per-face angle multiset IDENTICAL across
//      all faces (apex class at the tri corner, base class at the dec
//      corners); the two base angles EQUAL within every face (isoceles
//      mirror law); sides 2 equal (dec-tri) + 1 base (dec-dec); sum 2*pi.
//   T3 vertex census: degree 10 at the 12 dec-rank points / 3 at the 20
//      tri-rank apexes (the parent's every-vertex-deg-3 inverted into
//      twenty apexes); Sum(deg) == 2E.
//   T4 manifold: every dual edge on exactly 2 faces (180 slots).
//   T5 edge census: exactly TWO rank-pair classes dec-tri (60) / dec-dec
//      (30), zero same-rank; two edge-length classes equal within class
//      (the Catalan is face-transitive, NOT uniform).
//   T6 THE POLAR RECIPROCAL: every one of the 60 sails has all three
//      verts at EXACTLY plane depth rho^2/R_tdodec from the dual center
//      (all faces kiss ONE insphere — the Catalan tangent property);
//      every sail normal is EXACTLY one tdodec vertex direction
//      (bijection 60/60).
//   T7 seat laws: foot + crown dec-rank points dead on the axis; foot AT
//      the dais top AND the lowest vertex overall (point-down proof,
//      margin over the lowest tri apex measured); 72-degree symmetry 0
//      misses; central inversion exact; centroid on axis; height ==
//      target; never overhangs (apothem-first); the TEN waist dec-rank
//      points = two exact level 72-degree pentads, lower snapped dead-on
//      az 0 (parent twist INHERITED), upper offset measured,
//      inversion-paired; bead census honest (1 crown finial + 10 waist
//      aloft + 1 pressed foot; 20 tri apexes DARK); FINIAL-CLEARANCE LAW
//      (tret v2) against the WORST occluder.
//   T8 immersion: every inset plate corner strictly INSIDE the convex
//      solid; corner tuck reported.
//   RED control: --red displaces one dual vertex 0.3 — T2/T5/T6/T7 fail.

export const TARGET_H = 6.8;              // seated solid height — family ladder next step (rico 6.3, dtria 6.6, deltoid 6.7 -> 6.8)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.15;               // brass dec-rank bead (family scale)
export const BEAD_POKE = 0.02;            // bead center proud along the radial dir (grazing-read law, disclosed)
export const STEM_H_BASE = 1.30;          // FINIAL stem floor: crown bead lifted on an iron pin (tret v2 occlusion law; solved higher if occluders demand)
export const STEM_R = 0.03;               // finial stem radius (slender iron pin)
export const READER_D = 18;               // lane reading distance (sight-line law domain)
export const READER_EYE = 1.65;           // reader eye height
export const PLATE_T = 0.10;              // panel thickness
export const PLATE_INSET = 0.07;          // panel corner inset (seam reveal — family look)
export const PLATE_BACK = 0.018;          // panel outer face behind rod surface
export const PLINTH_N = 60;               // SIXTY sides — one per sail (theme-number law)
export const PLINTH_ROT = 0;              // corners ON the axes (N divisible by 4)
export const PLINTH_H = 0.30;
export const FOOT_BEAD_Y = 0.15;          // pressed twelfth bead center — spans exactly the dais band 0->0.30, FULLY BURIED

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
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uy * uz * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}

const PHI = (1 + Math.sqrt(5)) / 2;

// ==== THE PARENT TDODEC, rebuilt verbatim from struct-251's closed forms (frozen math) =====================

// ---- grandparent dodecahedron: (±1,±1,±1) + the golden ring, edge p = 2/phi ------------------------------
const M: V3[] = [];
for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) M.push([sx, sy, sz]);
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    M.push([0, s1 / PHI, s2 * PHI]);
    M.push([s1 / PHI, s2 * PHI, 0]);
    M.push([s2 * PHI, 0, s1 / PHI]);
}
if (M.length !== 20) throw Error(`grandparent verts ${M.length} != 20`);
const P_EDGE = 2 / PHI;                       // exact for these coords
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 30) throw Error(`grandparent edges ${P_EDGES.length} != 30`);

// ---- grandparent faces: the 12 normal directions ------------------------------------------------------------
// SELF-CATCH carried verbatim from struct-251 (first run threw "face plane
// not level"): with golden verts (0,±1/phi,±phi)-cyclic, the face normals
// are the (0,±phi,±1)-cyclic family — NOT (0,±1,±phi).
const FACE_DIRS: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    FACE_DIRS.push(nrm([0, s1 * PHI, s2]));
    FACE_DIRS.push(nrm([s1 * PHI, s2, 0]));
    FACE_DIRS.push(nrm([s2, 0, s1 * PHI]));
}
if (FACE_DIRS.length !== 12) throw Error(`grandparent face dirs ${FACE_DIRS.length} != 12`);
const P_FACES: number[][] = [];
for (const d of FACE_DIRS) {
    const order = M.map((v, i) => [dot(v, d), i] as [number, number]).sort((a, b) => b[0] - a[0]);
    const plane = order[4][0];
    if (Math.abs(order[0][0] - plane) > 1e-12) throw Error("face plane not level");
    if (plane - order[5][0] < 1e-9) throw Error("face plane ambiguous");
    P_FACES.push(order.slice(0, 5).map(([, i]) => i));
}
if (P_FACES.length !== 12) throw Error(`grandparent faces ${P_FACES.length} != 12`);

// ---- the truncation at THE LIGHTEST CUT u = 1/(2+phi): 60 verts --------------------------------------------
const U_CUT = 1 / (2 + PHI);                  // (3−phi)/5 — struct-251 T6b: 1/3 is irregular, side ratio exactly phi
const A_UNIT = (1 - 2 * U_CUT) * P_EDGE;      // uniform edge = 2/(2+phi)
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
if (Math.abs(R_UNIT - R_CLOSED) > 1e-12) throw Error(`R ${R_UNIT} != closed ${R_CLOSED}`);

// ---- tdodec edges by distance --------------------------------------------------------------------------------
const PEDGES: [number, number][] = [];
for (let i = 0; i < 60; i++) for (let j = i + 1; j < 60; j++)
    if (Math.abs(dist(pts[i], pts[j]) - A_UNIT) < 1e-9) PEDGES.push([i, j]);
if (PEDGES.length !== 90) throw Error(`tdodec edges ${PEDGES.length} != 90`);

// ---- tdodec faces: 20 triangles (the cuts) + 12 decagons (the parent's own face planes) ----------------------
type Face = { k: number; verts: number[]; center: V3; n: V3; isTri: boolean; h: number };
const orderRing = (ring: V3[]): { verts: number[]; center: V3; n: V3 } => {
    const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / ring.length);
    const n = nrm(c);                                  // centered solid: outward normal
    const e1 = nrm(sub(ring[0], c));
    const e2 = cross(n, e1);
    const ordered = [...ring].sort((p, q) =>
        Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
    return { verts: ordered.map((p) => pidx(p)), center: c, n };
};
const pfaces: Face[] = [];
// triangles: one per grandparent vertex (its 3 near cut points)
for (let i = 0; i < 20; i++) {
    const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
    if (nbrs.length !== 3) throw Error(`grandparent degree ${nbrs.length} != 3`);
    const ring = nbrs.map((j) => add(M[i], mul(sub(M[j], M[i]), U_CUT)));
    const { verts, center, n } = orderRing(ring);
    pfaces.push({ k: 3, verts, center, n, isTri: true, h: dot(ring[0], n) });
}
// decagons: one per grandparent face — the 10 cut points on its boundary edges
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
    pfaces.push({ k: 10, verts, center, n, isTri: false, h: dot(ring[0], n) });
}
if (pfaces.length !== 32) throw Error(`parent faces ${pfaces.length} != 32`);
if (pfaces.filter((f) => f.isTri).length !== 20) throw Error("triangle count != 20");

// parent edge -> its two faces
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < pfaces.length; fi++) for (let t = 0; t < pfaces[fi].verts.length; t++) {
    const a = pfaces[fi].verts[t], b = pfaces[fi].verts[(t + 1) % pfaces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ==== THE DUAL: polar reciprocal about the midsphere ========================================================

// ---- midsphere: every tdodec edge midpoint at one radius rho ------------------------------------------------
const rho = (() => { const [i, j] = PEDGES[0]; return Math.hypot(...mul(add(pts[i], pts[j]), 0.5)); })();
let rhoSpread = 0;
for (const [i, j] of PEDGES) {
    const m = mul(add(pts[i], pts[j]), 0.5);
    rhoSpread = Math.max(rhoSpread, Math.abs(Math.hypot(...m) - rho));
}

// ---- the 32 dual vertices: v_u = (rho^2 / h_u) . n_u (h_u = MEASURED plane depth) ----------------------------
const R2 = rho * rho;
type Rank = "dec" | "tri";
const TYPE: Rank[] = pfaces.map((f) => f.isTri ? "tri" : "dec");
const H_OF: Record<Rank, number> = (() => {
    const h: Record<Rank, number> = { dec: 0, tri: 0 };
    for (const f of pfaces) {
        if (h[f.isTri ? "tri" : "dec"] === 0) h[f.isTri ? "tri" : "dec"] = f.h;
        else if (Math.abs(h[f.isTri ? "tri" : "dec"] - f.h) > 1e-9) throw Error(`family ${f.isTri ? "tri" : "dec"} depth not level`);
    }
    return h;
})();
const DV: V3[] = pfaces.map((f) => mul(f.n, R2 / f.h));
const classR = { dec: R2 / H_OF.dec, tri: R2 / H_OF.tri };

// ---- the 60 dual faces: one ISOCELES sail per tdodec vertex (figure dec-tri-dec) -----------------------------
type DFace = { verts: number[]; center: V3; n: V3; ofVertex: number };
const DUAL_FACES: DFace[] = [];
{
    const pidxD = (p: V3) => {
        const k = DV.findIndex((q) => dist(q, p) < 1e-9);
        if (k >= 0) return k;
        throw Error("dual face vertex not in dual set");
    };
    for (let i = 0; i < 60; i++) {
        const inc: number[] = [];
        for (let fi = 0; fi < pfaces.length; fi++) if (pfaces[fi].verts.includes(i)) inc.push(fi);
        if (inc.length !== 3) throw Error(`tdodec vertex ${i}: ${inc.length} incident faces (want 3)`);
        const fams = inc.map((fi) => TYPE[fi]).sort().join("+");
        if (fams !== "dec+dec+tri") throw Error(`tdodec vertex ${i} figure ${fams} (want dec+dec+tri)`);
        const ring = inc.map((fi) => DV[fi]);
        const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / 3);
        const n = nrm(pts[i]);                     // EXACT plane normal: the tdodec vertex direction
        const e1 = nrm(sub(ring[0], c));
        const e2 = cross(n, e1);
        const ordered = [...ring].sort((p, q) =>
            Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
        DUAL_FACES.push({ verts: ordered.map((p) => pidxD(p)), center: c, n, ofVertex: i });
    }
    if (DUAL_FACES.length !== 60) throw Error(`dual faces ${DUAL_FACES.length} != 60`);
}

// ---- the 90 dual edges: one per tdodec edge, joining the duals of its two faces -------------------------------
const DUAL_EDGES: [number, number][] = [];
{
    const seenE = new Set<string>();
    for (const [a, b] of PEDGES) {
        const fl = edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`)!;
        if (fl.length !== 2) throw Error(`tdodec edge ${a}-${b}: ${fl.length} faces (want 2)`);
        const [u1, u2] = fl;
        const key = u1 < u2 ? `${u1}-${u2}` : `${u2}-${u1}`;
        if (seenE.has(key)) throw Error(`duplicate dual edge ${key}`);
        seenE.add(key);
        DUAL_EDGES.push(u1 < u2 ? [u1, u2] : [u2, u1]);
    }
    if (DUAL_EDGES.length !== 90) throw Error(`dual edges ${DUAL_EDGES.length} != 90`);
}
export const E: [number, number][] = DUAL_EDGES;

// ==== SEAT: the tdodec's own seated frame, INHERITED (decagon-down + twist-snap, verbatim math) =============

// ---- seating: grandparent face normal nrm(0,-phi,1) -> -Y (the parent's own decagon-down axis) ---------------
const v0: V3 = nrm([0, -PHI, 1]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// the WAIST dec-rank dual points (non-axis): lower pentad = the five with least rot1 y
let snapIdx = -1;
{
    let bestY = Infinity;
    for (let u = 0; u < DV.length; u++) {
        if (TYPE[u] !== "dec") continue;
        const ny = rot1(pfaces[u].n)[1];
        if (Math.abs(ny) > 0.99) continue;                 // skip crown + foot (dead-vertical normals)
        const cy = rot1(DV[u])[1];
        if (cy < bestY) { bestY = cy; snapIdx = u; }
    }
    if (snapIdx < 0) throw Error("no waist dec point for snap");
}
const az0 = (() => {
    const p = rot1(DV[snapIdx]);
    return Math.atan2(p[2], p[0]);
})();
// Ry(t) maps az a -> a-t (az = atan2(z,x)); twist = snapAz zeroes the snap point.
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], az0);
const rot = (v: V3): V3 => rot2(rot1(v));
{
    const sn = rot(DV[snapIdx]);
    if (Math.abs(Math.atan2(sn[2], sn[0])) > 1e-9) throw Error(`twist-snap missed: az ${Math.atan2(sn[2], sn[0])}`);
}

// ---- scale + lift: the FOOT dec-rank point lands exactly on the dais top -------------------------------------
const seatedUnit = DV.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
const seated = seatedUnit.map((v) => mul(v, SCALE));
const yMinUnit = Math.min(...seatedUnit.map((v) => v[1]));
const LIFT = PLINTH_H - yMinUnit * SCALE;
// (seated is ALREADY scaled — V = seated + LIFT only; the double-scale bug
// is struct-267's own self-catch (b), caught there by re-reading before first run)
export const V: V3[] = seated.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);
export const SOLID_CENTER: V3 = [0, LIFT + (Math.max(...seatedUnit.map((v) => v[1])) + yMinUnit) / 2 * SCALE, 0];
export const FACE_V: number[][] = DUAL_FACES.map((f) => f.verts);
export const CENTERS: V3[] = DUAL_FACES.map((f) => {
    const c = rot(f.center);
    return [c[0] * SCALE, c[1] * SCALE + LIFT, c[2] * SCALE] as V3;
});
export const NORMALS: V3[] = DUAL_FACES.map((f) => rot(f.n));

// rank indices (dec = the 12 points over the parent's decagon faces)
export const DEC_IDX: number[] = TYPE.map((t, i) => t === "dec" ? i : -1).filter((i) => i >= 0);
export const CROWN_IDX = DEC_IDX.reduce((best, i) => V[i][1] > V[best][1] ? i : best, DEC_IDX[0]);
export const FOOT_IDX = DEC_IDX.reduce((best, i) => V[i][1] < V[best][1] ? i : best, DEC_IDX[0]);
export const WAIST_IDX = DEC_IDX.filter((i) => i !== CROWN_IDX && i !== FOOT_IDX);

// ---- FINIAL stem: solved against the WORST occluder (dec points + tri apexes included), floored at STEM_H_BASE -
export const STEM_H = (() => {
    // sight line from the reader's eye at READER_D over the worst silhouette vertex
    let sightY = -Infinity;
    for (const p of V) {
        const y = p[1], r = Math.hypot(p[0], p[2]);
        if (y <= READER_EYE || r <= 1e-9) continue;
        if (READER_D - r <= 0.5) continue;                 // vertex behind/at the reader — not an occluder
        sightY = Math.max(sightY, y + (y - READER_EYE) * r / (READER_D - r));
    }
    const crownY = V[CROWN_IDX][1];
    const need = sightY + 1.5 * BEAD_R - BEAD_R - BEAD_POKE - crownY;
    return Math.max(STEM_H_BASE, Math.ceil(need / 0.05) * 0.05);
})();

// ---- the 12 brass beads: 1 crown finial + 10 waist poked radial + 1 pressed foot -------------------------------
export const BEADS: V3[] = (() => {
    const out: V3[] = [];
    for (const i of DEC_IDX) {
        if (i === CROWN_IDX) {
            out.push([0, V[i][1] + BEAD_POKE + STEM_H, 0]);
        } else if (i === FOOT_IDX) {
            out.push([0, FOOT_BEAD_Y, 0]);
        } else {
            const dir = nrm(sub(V[i], SOLID_CENTER));
            out.push(add(V[i], mul(dir, BEAD_POKE)));
        }
    }
    if (out.length !== 12) throw Error(`beads ${out.length} != 12`);
    return out;
})();

// ---- derived footprint constants (BEFORE all checks — no TDZ) ------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
// APOTHEM-FIRST dais law (struct-247 fix, carried for all N)
export const PLINTH_R = Math.ceil(((MAX_H + ROD_R + 0.10) / Math.cos(Math.PI / PLINTH_N)) * 20) / 20;

// RED control (--red displaces one dual vertex: breaks face/edge/symmetry laws)
if (process.argv.includes("--red")) {
    V[7] = [V[7][0] + 0.3, V[7][1] - 0.2, V[7][2] + 0.15];
    console.log("RED MODE: dual vertex 7 displaced 0.3 — T2/T5/T6/T7 MUST fail");
}

// ==== T0 dual census + midsphere + radius classes ===========================================================
{
    let worstR = 0;
    for (let u = 0; u < 32; u++) worstR = Math.max(worstR, Math.abs(Math.hypot(...DV[u]) - classR[TYPE[u]]));
    const nDec = TYPE.filter((t) => t === "dec").length;
    const nTri = TYPE.filter((t) => t === "tri").length;
    const rhoClosed = PHI;                     // dodeca midradius in the p = 2/phi frame (measured == closed)
    check("T0 dual census + midsphere: 32/90/60; every tdodec edge midpoint at exactly ONE radius rho (== phi closed-form in the parent frame); two dual vertex radii classes rho^2/h exact — 12 dec-rank OUTERMOST (the parent's face planes, deepest h) + 20 tri-rank INNERMOST (the cut planes, farthest h): THE RANK INVERSION — the razors' ghosts sink, the faces they cut become the crown",
        rhoSpread < 1e-12 && Math.abs(rho - rhoClosed) < 1e-12 && worstR < 1e-12 && nDec === 12 && nTri === 20
        && DV.length === 32 && DUAL_EDGES.length === 90 && DUAL_FACES.length === 60 && classR.dec > classR.tri,
        `midsphere spread ${rhoSpread.toExponential(1)} (rho ${rho.toFixed(9)} == phi ${rhoClosed.toFixed(9)}, tdodec a=${A_UNIT.toFixed(6)} frame); depths dec ${H_OF.dec.toFixed(6)} / tri ${H_OF.tri.toFixed(6)}; radii dec ${classR.dec.toFixed(6)} / tri ${classR.tri.toFixed(6)} (ratio ${(classR.dec / classR.tri).toFixed(4)}) worst dev ${(worstR * 1e12).toExponential(1)}`);
}

// ---- T0b ACHIRALITY: some improper orthogonal map closes the vertex set -----------------------------------
{
    // deltoid self-catch (c) carried: achirality means SOME improper map
    // closes the set — test all six candidates and report which.
    const cands: [string, (p: V3) => V3][] = [
        ["x<->y", (p) => [p[1], p[0], p[2]]],
        ["x<->z", (p) => [p[2], p[1], p[0]]],
        ["y<->z", (p) => [p[0], p[2], p[1]]],
        ["x->-x", (p) => [-p[0], p[1], p[2]]],
        ["y->-y", (p) => [p[0], -p[1], p[2]]],
        ["z->-z", (p) => [p[0], p[1], -p[2]]],
    ];
    const closedUnder = (set: V3[], f: (p: V3) => V3) => set.every((p) => set.some((q) => dist(q, f(p)) < 1e-9));
    const winners = cands.filter(([, f]) => closedUnder(pts, f) && closedUnder(DV, f)).map(([n]) => n);
    check("T0b ACHIRALITY: some improper orthogonal map closes BOTH vertex sets — the dual exists in ONE form, NO handedness owed Bill",
        winners.length > 0,
        `closing mirror planes: [${winners.join(", ")}] — the snub-family chirality question does not arise`);
}

// ---- T1 Euler -----------------------------------------------------------------------------------------------
check("T1 Euler 32−90+60 = 2", V.length === 32 && DUAL_EDGES.length === 90 && DUAL_FACES.length === 60 && V.length - DUAL_EDGES.length + DUAL_FACES.length === 2,
    `V ${V.length}, E ${DUAL_EDGES.length}, F ${DUAL_FACES.length}, chi ${V.length - DUAL_EDGES.length + DUAL_FACES.length}`);

// ---- T2 sail census: the face-transitive Catalan signature + the isoceles mirror ---------------------------
{
    let aApex = -1, aBase = -1, sLong = -1, sBase = -1;
    let worstApex = 0, worstBase = 0, worstSum = 0, badFam = 0, worstBasePair = 0, worstSidePair = 0;
    for (const F of DUAL_FACES) {
        const vs = F.verts;
        const fams = vs.map((vi) => TYPE[vi]).sort().join("+");
        if (fams !== "dec+dec+tri") badFam++;
        // ring position of the tri apex
        const triPos = vs.findIndex((vi) => TYPE[vi] === "tri");
        const angAt = (t: number) => {
            const p0 = V[vs[(t + 2) % 3]], p1 = V[vs[t]], p2 = V[vs[(t + 1) % 3]];
            return Math.acos(Math.max(-1, Math.min(1, dot(nrm(sub(p0, p1)), nrm(sub(p2, p1))))));
        };
        // the two base angles (at the dec corners) must be EQUAL within the face (isoceles mirror law)
        const d0 = (triPos + 1) % 3, d1 = (triPos + 2) % 3;
        worstBasePair = Math.max(worstBasePair, Math.abs(angAt(d0) - angAt(d1)));
        const apex = angAt(triPos), base = angAt(d0);
        if (aApex < 0) aApex = apex; else worstApex = Math.max(worstApex, Math.abs(apex - aApex));
        if (aBase < 0) aBase = base; else worstBase = Math.max(worstBase, Math.abs(base - aBase));
        let sum = 0;
        for (let t = 0; t < 3; t++) {
            sum += angAt(t);
            const L = dist(V[vs[t]], V[vs[(t + 1) % 3]]);
            const pairTy = [TYPE[vs[t]], TYPE[vs[(t + 1) % 3]]].sort().join("-");
            const key = pairTy === "dec-tri" ? "long" : pairTy === "dec-dec" ? "base" : "BAD";
            if (key === "BAD") badFam++;
            else if (sLong < 0 && key === "long") sLong = L;
            else if (key === "long") worstSidePair = Math.max(worstSidePair, Math.abs(L - sLong));
            if (key === "base") { if (sBase < 0) sBase = L; else worstSidePair = Math.max(worstSidePair, Math.abs(L - sBase)); }
        }
        worstSum = Math.max(worstSum, Math.abs(sum - Math.PI));
    }
    check("T2 sails: 60 faces; every sail one tri apex + two dec corners in ring order; per-face angle multiset IDENTICAL across ALL faces (apex class at the tri corner, base class at the dec corners); the two base angles EQUAL within every face (isoceles mirror law); sides 2 equal long (dec-tri) + 1 base (dec-dec); angle sum pi",
        worstApex < 1e-12 && worstBase < 1e-12 && worstSum < 1e-12 && badFam === 0 && worstBasePair < 1e-12 && worstSidePair < 1e-12,
        `worst apex dev ${(worstApex * 1e12).toExponential(1)}; worst base dev ${worstBase.toExponential(1)}; worst base-pair dev ${worstBasePair.toExponential(1)} (isoceles mirror); worst side dev ${(worstSidePair * 1e12).toExponential(1)}; worst sum dev ${worstSum.toExponential(1)}; apex ${(aApex * 180 / Math.PI).toFixed(4)}deg / base ${(aBase * 180 / Math.PI).toFixed(4)}deg (MEASURED — the Catalan's own sail); long ${sLong.toFixed(6)} base ${sBase.toFixed(6)} (scaled)`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------------
{
    const deg = new Array(32).fill(0);
    for (const [a, b] of DUAL_EDGES) { deg[a]++; deg[b]++; }
    const want: Record<Rank, number> = { dec: 10, tri: 3 };
    let bad = 0;
    for (let u = 0; u < 32; u++) if (deg[u] !== want[TYPE[u]]) bad++;
    check("T3 vertices: degree 10 at the 12 dec-rank points / 3 at the 20 tri-rank apexes (the parent's every-vertex-deg-3 INVERTED into twenty three-fold apexes; the decagon's tenness told at a point); Sum(deg) == 2E",
        bad === 0 && deg.reduce((s, d) => s + d, 0) === 2 * DUAL_EDGES.length,
        `rank violations ${bad}; Sum(deg) ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * DUAL_EDGES.length}`);
}

// ---- T4 manifold ---------------------------------------------------------------------------------------------
{
    const ef = new Map<string, number[]>();
    for (let fi = 0; fi < DUAL_FACES.length; fi++) {
        const vs = DUAL_FACES[fi].verts;
        for (let t = 0; t < 3; t++) {
            const a = vs[t], b = vs[(t + 1) % 3];
            const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
            ef.set(kk, [...(ef.get(kk) ?? []), fi]);
        }
    }
    const bad = [...ef.values()].filter((c) => c.length !== 2).length;
    const unmatched = DUAL_EDGES.filter(([a, b]) => (ef.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every dual edge on exactly 2 faces", bad === 0 && unmatched === 0 && ef.size === 90,
        `${ef.size} face-edges (180 slots), ${bad} wrong multiplicity, ${unmatched} of ${DUAL_EDGES.length} unmatched`);
}

// ---- T5 edge census ------------------------------------------------------------------------------------------
{
    const pairOf = (a: number, b: number) => [TYPE[a], TYPE[b]].sort().join("-");
    const classes = new Map<string, { n: number; worstLen: number; len: number }>();
    for (const [a, b] of DUAL_EDGES) {
        const key = pairOf(a, b);
        const L = dist(V[a], V[b]);
        const c = classes.get(key) ?? { n: 0, worstLen: 0, len: L };
        c.worstLen = Math.max(c.worstLen, Math.abs(L - c.len));
        c.n++;
        classes.set(key, c);
    }
    const keys = [...classes.keys()];
    const sameRank = keys.filter((k) => k === "tri-tri");
    const allSpread = [...classes.values()].every((c) => c.worstLen < 1e-12);
    check("T5 edges: exactly TWO rank-pair classes dec-tri (60, from the parent's T-D edges) / dec-dec (30, from the parent's D-D edges), ZERO tri-tri (the parent had zero T-T edges); two edge-length classes equal within class (long/base MEASURED — the Catalan is face-transitive, NOT uniform: unequal classes are the honest signature)",
        sameRank.length === 0 && keys.length === 2 && classes.get("dec-tri")!.n === 60 && classes.get("dec-dec")!.n === 30 && allSpread,
        `classes: ${keys.map((k) => `${k} ${classes.get(k)!.n} edges L ${classes.get(k)!.len.toFixed(6)} (spread ${(classes.get(k)!.worstLen * 1e12).toExponential(1)})`).join("; ")}; zero tri-tri — the cuts never met each other in the parent`);
}

// ---- T6 THE POLAR RECIPROCAL ---------------------------------------------------------------------------------
{
    // (a) all 60 sails kiss ONE insphere: every vert at exactly plane depth rho^2/R from the center
    const wantPlane = (R2 / R_UNIT) * SCALE;
    let worstPlane = 0;
    for (let u = 0; u < DUAL_FACES.length; u++) {
        const n = NORMALS[u];
        for (const vi of DUAL_FACES[u].verts) worstPlane = Math.max(worstPlane, Math.abs(dot(sub(V[vi], SOLID_CENTER), n) - wantPlane));
    }
    // (b) every dual face normal is EXACTLY one tdodec vertex direction (pre-seat, bijection)
    let worstN = 0;
    const used = new Set<number>();
    for (const F of DUAL_FACES) {
        worstN = Math.max(worstN, dist(F.n, nrm(pts[F.ofVertex])));
        used.add(F.ofVertex);
    }
    check("T6 THE POLAR RECIPROCAL: all 60 sails kiss ONE insphere (every vert at exactly plane depth rho^2/R — the Catalan tangent property, mirror of the tdodec's every-vertex-on-one-sphere); every face normal EXACTLY one tdodec vertex direction (bijection 60/60)",
        worstPlane < 1e-12 && worstN < 1e-12 && used.size === 60,
        `worst plane dev ${(worstPlane * 1e12).toExponential(1)} vs depth ${wantPlane.toFixed(9)} (rho^2/R scaled); worst normal dev ${worstN.toExponential(1)}; tdodec-vertex bijection ${used.size}/60`);
}

// ---- T7 seat laws ---------------------------------------------------------------------------------------------
{
    const footV = V[FOOT_IDX], crownV = V[CROWN_IDX];
    const axisOk = Math.hypot(footV[0], footV[2]) < 1e-12 && Math.hypot(crownV[0], crownV[2]) < 1e-12;
    const footAtDais = Math.abs(footV[1] - PLINTH_H) < 1e-12;
    // THE POINT-DOWN PROOF: the foot dec point is the LOWEST vertex overall (margin over the lowest tri apex)
    let lowestOther = Infinity, lowestOtherIs = "";
    for (let u = 0; u < V.length; u++) {
        if (u === FOOT_IDX) continue;
        if (V[u][1] < lowestOther) { lowestOther = V[u][1]; lowestOtherIs = `${TYPE[u]}-rank`; }
    }
    const footLowest = footV[1] < lowestOther - 1e-9;
    const footMargin = lowestOther - footV[1];
    // 72-degree symmetry about Y
    const a = Math.PI * 2 / 5, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    // central inversion (the parent's own inversion, inherited exactly)
    let invMiss = 0;
    for (const v of V) { const r = sub(SOLID_CENTER, sub(v, SOLID_CENTER)); if (!V.some((q) => dist(q, r) < 1e-6)) invMiss++; }
    const cx = V.reduce((s2, v) => s2 + v[0], 0) / 32;
    const cz = V.reduce((s2, v) => s2 + v[2], 0) / 32;
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    // the TEN waist dec-rank points: two level pentads, inversion-paired, 72-degree lattices
    const waist = WAIST_IDX.map((i) => V[i]);
    const midY = waist.reduce((s2, p) => s2 + p[1], 0) / waist.length;
    const lower = waist.filter((p) => p[1] < midY);
    const upper = waist.filter((p) => p[1] >= midY);
    const levelSpread = (ring: V3[]) => Math.max(...ring.map((p) => p[1])) - Math.min(...ring.map((p) => p[1]));
    const radiusSpread = (ring: V3[]) => {
        const rs = ring.map((p) => Math.hypot(p[0], p[2]));
        return Math.max(...rs) - Math.min(...rs);
    };
    const azOf = (p: V3) => Math.atan2(p[2], p[0]);
    const onLattice = (ring: V3[], offsetRad: number) => ring.length === 5 && ring.every((p) =>
        Math.abs(Math.atan2(Math.sin((azOf(p) - offsetRad) * 5), Math.cos((azOf(p) - offsetRad) * 5))) < 1e-6);
    const lowerLattice = onLattice(lower, 0);
    const hasSnap = lower.some((p) => Math.abs(azOf(p)) < 1e-9);
    const upperOffset = (() => {
        const d = azOf(upper[0]) - azOf(lower[0]);
        return Math.atan2(Math.sin(d), Math.cos(d));
    })();
    const upperLattice = onLattice(upper, upperOffset);
    // inversion pairing of the pentads: for each lower point, -(p-C)+C is an upper point
    const pentadPaired = lower.every((p) =>
        upper.some((q) => dist(q, sub(SOLID_CENTER, sub(p, SOLID_CENTER))) < 1e-9));
    // FINIAL-CLEARANCE LAW (tret v2): crown bead top must clear the WORST occluder's sight line
    let sightY = -Infinity;
    for (const p of V) {
        const y = p[1], r = Math.hypot(p[0], p[2]);
        if (y <= READER_EYE || r <= 1e-9) continue;
        if (READER_D - r <= 0.5) continue;
        sightY = Math.max(sightY, y + (y - READER_EYE) * r / (READER_D - r));
    }
    const beadTop = crownV[1] + BEAD_POKE + STEM_H + BEAD_R;
    const finialClear = beadTop - sightY;
    // bead census
    const crownBead = BEADS[DEC_IDX.indexOf(CROWN_IDX)];
    const footBead = BEADS[DEC_IDX.indexOf(FOOT_IDX)];
    const waistBeads = BEADS.filter((_, k) => k !== DEC_IDX.indexOf(CROWN_IDX) && k !== DEC_IDX.indexOf(FOOT_IDX));
    const waistAloft = waistBeads.every((p) => p[1] - BEAD_R > PLINTH_H);
    const t7parts = {
        axisOk, footAtDais, footLowest, footMargin: footMargin.toFixed(4), lowestOtherIs,
        symMiss, invMiss, ctr: Math.hypot(cx, cz),
        hgt: height.toFixed(6), reach: (MAX_H + ROD_R).toFixed(3), apothem: apothem.toFixed(3),
        rings: `${lower.length}+${upper.length}`, lowerLevel: levelSpread(lower).toExponential(1),
        upperLevel: levelSpread(upper).toExponential(1), radiusSpread: radiusSpread(lower).toExponential(1),
        lowerLattice, hasSnap, upperLattice, upperOffsetDeg: (upperOffset * 180 / Math.PI).toFixed(2),
        pentadPaired, sightY: sightY.toFixed(3), stemH: STEM_H.toFixed(2),
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3), waistAloft,
    };
    check("T7 seat: foot + crown dec-rank points dead on the axis, foot AT dais top AND the LOWEST VERTEX OVERALL (point-down proof, margin over the lowest tri apex measured); 72-degree symmetry 0 misses; central inversion exact; centroid on axis; height == target; never overhangs (apothem-first); TEN waist dec-rank points = two exact level 72-degree pentads, lower snapped dead-on az 0 (parent twist INHERITED), upper offset measured, inversion-paired; beads 1 crown finial + 10 waist aloft + 1 pressed foot (20 tri apexes DARK); FINIAL clears the WORST occluder sight line",
        axisOk && footAtDais && footLowest && symMiss === 0 && invMiss === 0 && Math.hypot(cx, cz) < 1e-12
        && Math.abs(height - TARGET_H) < 1e-9 && MAX_H + ROD_R <= apothem + 1e-9
        && lower.length === 5 && upper.length === 5 && levelSpread(lower) < 1e-12 && levelSpread(upper) < 1e-12
        && radiusSpread(lower) < 1e-12 && radiusSpread(upper) < 1e-12
        && lowerLattice && hasSnap && upperLattice && pentadPaired
        && waistAloft && Math.hypot(crownBead[0], crownBead[2]) < 1e-12
        && Math.abs(footBead[1] - FOOT_BEAD_Y) < 1e-12
        && FOOT_BEAD_Y - BEAD_R >= -1e-9 && FOOT_BEAD_Y + BEAD_R <= PLINTH_H + 1e-9
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; foot dec point ${footV[1].toFixed(6)} == dais top ${PLINTH_H}, lowest other vertex (${lowestOtherIs}) ${lowestOther.toFixed(6)} — margin ${(lowestOther - footV[1]).toFixed(4)}m; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); pentads level/radii exact, upper offset ${(upperOffset * 180 / Math.PI).toFixed(2)}deg (geometry-decided, disclosed); stem ${STEM_H.toFixed(2)}m solved against worst occluder sight ${sightY.toFixed(3)}; FINIAL crown bead top ${beadTop.toFixed(3)} clears by ${finialClear.toFixed(3)}m (>= ${(1.5 * BEAD_R).toFixed(3)} law)`);
}

// ---- T8 immersion ----------------------------------------------------------------------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    let worstPlane = -Infinity;
    let worstTuck = 0;
    for (let u = 0; u < DUAL_FACES.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const vs = DUAL_FACES[u].verts;
        for (let t = 0; t < 3; t++) {
            const vi = vs[t];
            const d = sub(V[vi], c);
            const r = Math.hypot(...d);
            const q = add(c, add(mul(d, (r - PLATE_INSET) / r), mul(n, sSide)));
            for (let u2 = 0; u2 < DUAL_FACES.length; u2++) {
                if (u2 === u) continue;
                worstPlane = Math.max(worstPlane, dot(sub(q, CENTERS[u2]), NORMALS[u2]));
            }
            for (let w = 0; w < 2; w++) {
                const other = vs[(t + (w === 0 ? 2 : 1)) % 3];
                worstTuck = Math.max(worstTuck, ROD_R - segDist(q, V[vi], V[other]));
            }
        }
    }
    check("T8 immersion: every inset plate vertex strictly INSIDE the convex solid (no face-plane poke-through); plates tuck under the seams",
        worstPlane < 1e-9,
        `worst outward poke ${worstPlane.toExponential(1)} (<= 0 = fully inside); max corner tuck into rod cylinders ${worstTuck.toFixed(4)}m (invisible — inside solid rod geometry); plate outer face ${PLATE_BACK * 1000}mm behind the rod outer surface; the foot point is pure rod geometry — plates inset short of the point (family look)`);
}

// ---- footprint summary ------------------------------------------------------------------------------------------
export const ENVELOPE = (() => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    const acc = (x: number, y: number, z: number) => {
        min[0] = Math.min(min[0], x); max[0] = Math.max(max[0], x);
        min[1] = Math.min(min[1], y); max[1] = Math.max(max[1], y);
        min[2] = Math.min(min[2], z); max[2] = Math.max(max[2], z);
    };
    // TRUE analytic envelope (struct-245 law): a tilted rod's END RIM circle
    // extends R*sqrt(1-dk^2) along axis k — carried exactly.
    for (const [i, j] of DUAL_EDGES) {
        const d = nrm(sub(V[j], V[i]));
        for (const end of [V[i], V[j]]) {
            for (let k = 0; k < 3; k++) {
                const r = ROD_R * Math.sqrt(1 - d[k] * d[k]);
                min[k] = Math.min(min[k], end[k] - r);
                max[k] = Math.max(max[k], end[k] + r);
            }
        }
    }
    // beads: crown finial (stem-lifted), 10 waist (poked), pressed foot (sunk)
    for (const p of BEADS) {
        acc(p[0] - BEAD_R, p[1] - BEAD_R, p[2] - BEAD_R);
        acc(p[0] + BEAD_R, p[1] + BEAD_R, p[2] + BEAD_R);
    }
    // finial stem: crown plane -> lifted bead center, on the axis
    {
        const p0: V3 = [0, V[CROWN_IDX][1] + BEAD_POKE, 0];
        const pTop: V3 = [0, p0[1] + STEM_H, 0];
        acc(p0[0] - STEM_R, p0[1], p0[2] - STEM_R);
        acc(p0[0] + STEM_R, pTop[1], p0[2] + STEM_R);
    }
    for (let i = 0; i < PLINTH_N; i++) {
        const ang = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        acc(PLINTH_R * Math.cos(ang), 0, -PLINTH_R * Math.sin(ang));
        acc(PLINTH_R * Math.cos(ang), PLINTH_H, -PLINTH_R * Math.sin(ang));
    }
    return { min: min as V3, max: max as V3 };
})();

console.log(`solve: tdodec rebuilt from closed forms (R ${R_UNIT.toFixed(9)} == (a/4)sqrt(74+30sqrt5)); midsphere rho ${rho.toFixed(9)} == phi; dual radii dec ${classR.dec.toFixed(6)} / tri ${classR.tri.toFixed(6)}; depths dec ${H_OF.dec.toFixed(6)} / tri ${H_OF.tri.toFixed(6)}; scale ${SCALE.toFixed(9)} (height ${TARGET_H})`);
console.log(`seat: DEC-RANK POINT-DOWN 5-fold on the parent's own frame (decagon-down + twist-snap INHERITED — no re-seat); foot dec point at dais top ${PLINTH_H} AND the lowest vertex; solid height ${TARGET_H}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} -> ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} >= reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`build: 90 iron seam rods + 60 stone isoceles sails + ${PLINTH_N}-gon stone dais + glow_triakis_12 (1 crown finial stem ${STEM_H.toFixed(2)}m + 10 waist + 1 pressed foot); the 20 tri-rank apexes stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct271-triakis)");
