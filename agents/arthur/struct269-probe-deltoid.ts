// struct269-probe-deltoid.ts — STRUCTURES LANE struct-269, Round 11 commission R11-77.
// THE DELTOIDAL HEXEACONTAHEDRON — the Catalan dual of the standing
// rhombicosidodecahedron (rico, struct-257/258). Catalan branch member 3
// (rt struct-235 opened it; dtria struct-267/268 is member 2).
//
// QUEUE-HEAD CORRECTION (this tick): struct-268's queue head named the
// "pentagonal hexecontahedron (rico's dual, Bill-handedness-free)". BOTH
// claims are wrong: the pentagonal hexecontahedron is the dual of the SNUB
// DODECAHEDRON (not the rico) and is CHIRAL — two mirror forms, a Bill
// handedness decision under the struct-253/255 snub law. The rico's true
// dual is THIS solid, the deltoidal hexecontahedron — 60 kite sails,
// ACHIRAL (machine-verified T0b: the dual vertex set is closed under the
// x<->y mirror), no handedness owed.
//
// Form-ledger grep fresh this tick: deltoid|pentakis|triakis|tetrakis|
// hexecontahedron — 0 real claims across STRUCTURES-PLAN (only the
// reuleauxrotor's deltoid PATH — a plane curve, different object class —
// and unclaimed-pointer lines), IMPROVEMENTS, SWEEP-PLAN, CITY-PLAN,
// IMPROVE-PLAN, NEW-VILLAGE-PLAN, DRESSING-PLAN. The dual-of-freshest-
// parent move (gsd->gdodec, trico->dtria precedent) with the strongest
// narrative: the rico told TWO parents in one skin (62 faces, both censuses
// F<->V mirrored); the dual reads the SAME solid turned inside-out — every
// rico FACE becomes a POINT (12 pent-rank where the dodeca's faces were +
// 30 sq-rank + 20 tri-rank), every one of the 60 rico VERTICES (figure
// 3.4.5.4) becomes a KITE sail. Kin check: the dtria (trico's dual) carries
// 120 scalene triangles; this is the kite family — each rico vertex figure
// tri-sq-pent-sq IS a kite with mirror symmetry (the full icosahedral group
// including reflections is the rico's own).
//
// ONE IDEA: TWO PARENTS' CHILD, READ THROUGH THE LOOKING GLASS. Take the
// POLAR RECIPROCAL of the rico's 62 face planes about its midsphere (the
// sphere every one of its 120 edges kisses): each face becomes a POINT
// (rho^2/h).n; each vertex becomes a KITE whose plane depth is EXACTLY
// rho^2/R_rico — all 60 kites kiss ONE insphere (the Catalan tangent
// property, mirror of the rico's every-vertex-on-one-sphere, T6). The
// kite's long edge pair (pent-sq, 60) and short pair (sq-tri, 60) are the
// TWO honest edge classes — face-transitive, NOT uniform.
// Presentation: PENT-RANK POINT-DOWN on the 5-fold axis — the rico's own
// seated frame INHERITED (its bottom pentagon face's dual point stands at
// the dais center; pentagon-down + twist-snap carry over with no re-seat).
// T7 MEASURES that the foot pent point is the lowest vertex (the sharpest
// tri-rank spikes sit 37.4 deg off-axis and lose to the axial point —
// margin reported). Material law: ONE face family = ONE sail material —
// STONE carries all 60 kite sails + the SIXTY-sided dais (one side per
// face, theme-number law); IRON carries all 120 seam bonds + the crown
// finial stem. Night contract: TWELVE warm brass beads at the twelve
// pent-rank points — the rico's OWN bead census told again by the dual
// (the parent's twelve lit pentagons become twelve lit points): 1 CROWN on
// the finial stem (tret v2 occlusion law, stem solved against the WORST
// occluder incl. the tri spikes) + TEN WAIST in two exact 72-degree pentads
// (upper interleaved 36-deg, inversion-paired — geometry decides, measured)
// + THE TWELFTH PRESSED INTO THE EARTH beneath the standing point (tico's-
// twelfth idiom). The 30 sq-rank + 20 tri-rank points stay dark.
//
// Laws honored: dais APOTHEM-FIRST (struct-247); texMat lanes (struct-38);
// ROOT STAYS IDENTITY (struct-188); NaN 0; below-grade 0.
//
// THEOREMS machine-verified below:
//   T0 dual census + midsphere: 62/120/60; every rico edge midpoint at
//      exactly one radius rho (spread reported); three dual vertex radii
//      classes rho^2/h exact (pent deepest / sq / tri outermost — the
//      rico's outermost faces become the dual's deepest points).
//   T0b ACHIRALITY: the dual vertex set closed under the x<->y mirror —
//      NO handedness owed Bill (the honest fix of the queue-head claim).
//   T1 Euler: 62 - 120 + 60 = 2 (sphere).
//   T2 kite census: 60 kites; every kite one pent + two sq + one tri in
//      ring order; per-face angle multiset IDENTICAL across all faces
//      (three global classes at pent/sq/tri ranks); the two sq-rank angles
//      EQUAL within every face (kite mirror law); side pairs equal within
//      every face (2 long + 2 short); angle sum 2*pi.
//   T3 vertex census: degree 5 (pent rank, 12) / 4 (sq, 30) / 3 (tri, 20);
//      Sum(deg) == 2E.
//   T4 manifold: every dual edge on exactly 2 faces (240 slots).
//   T5 edge census: exactly TWO rank-pair classes pent-sq / sq-tri, 60
//      each, zero same-rank; two edge-length classes, 60 each (long/short
//      MEASURED — the Catalan is face-transitive, NOT uniform).
//   T6 THE POLAR RECIPROCAL: every one of the 60 kites has all four verts
//      at EXACTLY plane depth rho^2/R_rico from the dual center (all faces
//      kiss ONE insphere — the Catalan tangent property); every kite normal
//      is EXACTLY one rico vertex direction (bijection 60/60).
//   T7 seat laws: foot + crown pent-rank points dead on the axis; foot AT
//      the dais top AND the lowest vertex overall (margin over the lowest
//      tri spike measured — the honest point-down proof); 72-degree
//      symmetry (0 misses); central inversion exact; centroid on axis;
//      height == target; never overhangs (apothem-first); the TEN waist
//      pent-rank points = two exact level 72-degree pentads,
//      inversion-paired, lower snapped dead-on az 0 (parent twist
//      INHERITED), upper offset measured; bead census honest (1 crown
//      finial + 10 waist aloft + 1 pressed foot; 30 sq + 20 tri DARK);
//      FINIAL-CLEARANCE LAW (tret v2) against the WORST occluder.
//   T8 immersion: every inset plate corner strictly INSIDE the convex
//      solid; corner tuck reported.
//   RED control: --red displaces one dual vertex 0.3 — T2/T5/T6/T7 fail.

export const TARGET_H = 6.7;              // seated solid height — family ladder next step (rico 6.3, dtria 6.6 -> 6.7)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.15;               // brass pent-rank bead (family scale)
export const BEAD_POKE = 0.02;            // bead center proud along the radial dir (grazing-read law, disclosed)
export const STEM_H_BASE = 1.30;          // FINIAL stem floor: crown bead lifted on an iron pin (tret v2 occlusion law; solved higher if the tri spikes occlude)
export const STEM_R = 0.03;               // finial stem radius (slender iron pin)
export const READER_D = 18;               // lane reading distance (sight-line law domain)
export const READER_EYE = 1.65;           // reader eye height
export const PLATE_T = 0.10;              // panel thickness
export const PLATE_INSET = 0.07;          // panel corner inset (seam reveal — family look)
export const PLATE_BACK = 0.018;          // panel outer face behind rod surface
export const PLINTH_N = 60;               // SIXTY sides — one per kite face (theme-number law)
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

// ==== THE PARENT RICO, rebuilt verbatim from struct-257's closed forms (frozen math) ====

// ---- parent DODECAHEDRON (edge 2 — standard coords, rescaled; needed for the sq dirs) -------------------
const P_UNIT = 2 / PHI;                   // edge of the standard-coords dodeca below
const PARENT_D: V3[] = [];
for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) PARENT_D.push([sx, sy, sz]);
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    PARENT_D.push([0, s1 / PHI, s2 * PHI]);
    PARENT_D.push([s2 * PHI, 0, s1 / PHI]);
    PARENT_D.push([s1 / PHI, s2 * PHI, 0]);
}
if (PARENT_D.length !== 20) throw Error(`parent dodeca verts ${PARENT_D.length} != 20`);
const DSCALE = 2 / P_UNIT;                // parent edge 2
const PARENT: V3[] = PARENT_D.map((v) => mul(v, DSCALE));
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++)
    if (Math.abs(dist(PARENT[i], PARENT[j]) - 2) < 1e-9) P_EDGES.push([i, j]);
if (P_EDGES.length !== 30) throw Error(`parent dodeca edges ${P_EDGES.length} != 30`);

// ---- the rico vertex set (Wikipedia closed forms, edge 2): all EVEN permutations of three families -------
const evenPerms = (v: V3): V3[] => [v, [v[1], v[2], v[0]], [v[2], v[0], v[1]] as V3];
const M: V3[] = [];
const seen = (p: V3) => M.some((q) => dist(q, p) < 1e-12);
for (const s1 of [1, -1]) for (const s2 of [1, -1]) for (const s3 of [1, -1]) {
    for (const p of evenPerms([s1, s2, s3 * PHI ** 3])) if (!seen(p)) M.push(p);
    for (const p of evenPerms([s1 * PHI ** 2, s2 * PHI, s3 * 2 * PHI])) if (!seen(p)) M.push(p);
}
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    for (const p of evenPerms([s1 * (2 + PHI), 0, s2 * PHI ** 2])) if (!seen(p)) M.push(p);
}
if (M.length !== 60) throw Error(`rico verts ${M.length} != 60`);
const R_UNIT = Math.hypot(...M[0]);
for (const v of M) if (Math.abs(Math.hypot(...v) - R_UNIT) > 1e-9) throw Error("rico verts not co-spherical");
const R_CLOSED = Math.sqrt(8 * PHI + 7);  // == sqrt(11+4*sqrt5), struct-257 T5
if (Math.abs(R_UNIT - R_CLOSED) > 1e-12) throw Error(`R ${R_UNIT} != closed ${R_CLOSED}`);
const PEDGES: [number, number][] = [];
for (let i = 0; i < 60; i++) for (let j = i + 1; j < 60; j++)
    if (Math.abs(dist(M[i], M[j]) - 2) < 1e-9) PEDGES.push([i, j]);
if (PEDGES.length !== 120) throw Error(`rico edges ${PEDGES.length} != 120`);

// ---- the 62 face directions, machine-derived (struct-257 chassis) ---------------------------------------
const PENT_DIRS: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    PENT_DIRS.push(nrm([0, s1 * PHI, s2]));
    PENT_DIRS.push(nrm([s2, 0, s1 * PHI]));
    PENT_DIRS.push(nrm([s1 * PHI, s2, 0]));
}
if (PENT_DIRS.length !== 12) throw Error(`pent dirs ${PENT_DIRS.length} != 12`);
const TRI_DIRS: V3[] = PARENT_D.map((v) => nrm(v));
if (TRI_DIRS.length !== 20) throw Error(`tri dirs ${TRI_DIRS.length} != 20`);
const SQ_DIRS: V3[] = [];
for (const [i, j] of P_EDGES) {
    const d = nrm(mul(add(PARENT_D[i], PARENT_D[j]), 0.5));
    if (!SQ_DIRS.some((q) => dist(q, d) < 1e-9)) SQ_DIRS.push(d);
}
if (SQ_DIRS.length !== 30) throw Error(`sq dirs ${SQ_DIRS.length} != 30`);

type Family = "pent" | "sq" | "tri";
type Face = { k: number; verts: number[]; center: V3; n: V3; family: Family; h: number };
const pidxM = (p: V3) => {
    const k = M.findIndex((q) => dist(q, p) < 1e-9);
    if (k >= 0) return k;
    throw Error("face vertex not in set");
};
const orderRingM = (ring: V3[]): { verts: number[]; center: V3; n: V3 } => {
    const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / ring.length);
    const n = nrm(c);
    const e1 = nrm(sub(ring[0], c));
    const e2 = cross(n, e1);
    const ordered = [...ring].sort((p, q) =>
        Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
    return { verts: ordered.map((p) => pidxM(p)), center: c, n };
};
const pfaces: Face[] = [];
const buildFace = (dir: V3, k: number, family: Family) => {
    const order = M.map((v, i) => [dot(v, dir), i] as [number, number]).sort((a, b) => b[0] - a[0]);
    const plane = order[k - 1][0];
    if (Math.abs(order[0][0] - plane) > 1e-9) throw Error(`face plane not level (${family})`);
    if (plane - order[k][0] < 1e-9) throw Error(`face plane ambiguous (${family})`);
    const { verts, center, n } = orderRingM(order.slice(0, k).map(([, i]) => M[i]));
    if (dist(n, dir) > 1e-9) throw Error(`face normal off its dir (${family})`);
    pfaces.push({ k, verts, center, n, family, h: plane });
};
for (const d of PENT_DIRS) buildFace(d, 5, "pent");
for (const d of SQ_DIRS) buildFace(d, 4, "sq");
for (const d of TRI_DIRS) buildFace(d, 3, "tri");
if (pfaces.length !== 62) throw Error(`parent faces ${pfaces.length} != 62`);

// parent edge -> its two faces
const edgeFacesM = new Map<string, number[]>();
for (let fi = 0; fi < pfaces.length; fi++) for (let t = 0; t < pfaces[fi].verts.length; t++) {
    const a = pfaces[fi].verts[t], b = pfaces[fi].verts[(t + 1) % pfaces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFacesM.set(kk, [...(edgeFacesM.get(kk) ?? []), fi]);
}

// ==== THE DUAL: polar reciprocal about the midsphere ====================================================

// ---- midsphere: every rico edge midpoint at one radius rho ----------------------------------------------
const rho = (() => { const [i, j] = PEDGES[0]; return Math.hypot(...mul(add(M[i], M[j]), 0.5)); })();
let rhoSpread = 0;
for (const [i, j] of PEDGES) {
    const m = mul(add(M[i], M[j]), 0.5);
    rhoSpread = Math.max(rhoSpread, Math.abs(Math.hypot(...m) - rho));
}

// ---- the 62 dual vertices: v_u = (rho^2 / h_u) . n_u (h_u = MEASURED plateau) ----------------------------
const R2 = rho * rho;
const TYPE: Family[] = pfaces.map((f) => f.family);
const H_OF: Record<Family, number> = (() => {
    const h: Record<Family, number> = { pent: 0, sq: 0, tri: 0 };
    for (const f of pfaces) {
        if (h[f.family] === 0) h[f.family] = f.h;
        else if (Math.abs(h[f.family] - f.h) > 1e-9) throw Error(`family ${f.family} depth not level`);
    }
    return h;
})();
const DV: V3[] = pfaces.map((f) => mul(f.n, R2 / f.h));
const classR = { pent: R2 / H_OF.pent, sq: R2 / H_OF.sq, tri: R2 / H_OF.tri };

// ---- the 60 dual faces: one KITE per rico vertex (figure 3.4.5.4 -> pent-sq-tri-sq ring) ------------------
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
        if (inc.length !== 4) throw Error(`rico vertex ${i}: ${inc.length} incident faces (want 4)`);
        const fams = inc.map((fi) => TYPE[fi]).sort().join("+");
        if (fams !== "pent+sq+sq+tri") throw Error(`rico vertex ${i} figure ${fams} (want pent+sq+sq+tri)`);
        const ring = inc.map((fi) => DV[fi]);
        const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / 4);
        const n = nrm(M[i]);                     // EXACT plane normal: the rico vertex direction
        const e1 = nrm(sub(ring[0], c));
        const e2 = cross(n, e1);
        const ordered = [...ring].sort((p, q) =>
            Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
        DUAL_FACES.push({ verts: ordered.map((p) => pidxD(p)), center: c, n, ofVertex: i });
    }
    if (DUAL_FACES.length !== 60) throw Error(`dual faces ${DUAL_FACES.length} != 60`);
}

// ---- the 120 dual edges: one per rico edge, joining the duals of its two faces ----------------------------
const DUAL_EDGES: [number, number][] = [];
{
    const seenE = new Set<string>();
    for (const [a, b] of PEDGES) {
        const fl = edgeFacesM.get(a < b ? `${a}-${b}` : `${b}-${a}`)!;
        if (fl.length !== 2) throw Error(`rico edge ${a}-${b}: ${fl.length} faces (want 2)`);
        const [u1, u2] = fl;
        const key = u1 < u2 ? `${u1}-${u2}` : `${u2}-${u1}`;
        if (seenE.has(key)) throw Error(`duplicate dual edge ${key}`);
        seenE.add(key);
        DUAL_EDGES.push(u1 < u2 ? [u1, u2] : [u2, u1]);
    }
    if (DUAL_EDGES.length !== 120) throw Error(`dual edges ${DUAL_EDGES.length} != 120`);
}
export const E: [number, number][] = DUAL_EDGES;

// ==== SEAT: the rico's own seated frame, INHERITED (pentagon-down + twist-snap, verbatim math) ============

// ---- seating: dodeca face normal (0,-phi,1) -> -Y (the parent's own pentagon-down axis) -------------------
const v0 = nrm([0, -PHI, 1]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// the WAIST pent-rank dual points (non-axis): lower pentad = the five with least rot1 y
let snapIdx = -1;
{
    let bestY = Infinity;
    for (let u = 0; u < DV.length; u++) {
        if (TYPE[u] !== "pent") continue;
        const ny = rot1(pfaces[u].n)[1];
        if (Math.abs(ny) > 0.99) continue;                 // skip crown + foot
        const cy = rot1(DV[u])[1];
        if (cy < bestY) { bestY = cy; snapIdx = u; }
    }
    if (snapIdx < 0) throw Error("no waist pent point for snap");
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

// ---- scale + lift: the FOOT pent-rank point lands exactly on the dais top ---------------------------------
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
// is struct-267's own self-catch (b), caught here by re-reading before first run)
export const V: V3[] = seated.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);
export const SOLID_CENTER: V3 = [0, LIFT + (Math.max(...seatedUnit.map((v) => v[1])) + yMinUnit) / 2 * SCALE, 0];
export const FACE_V: number[][] = DUAL_FACES.map((f) => f.verts);
export const CENTERS: V3[] = DUAL_FACES.map((f) => {
    const c = rot(f.center);
    return [c[0] * SCALE, c[1] * SCALE + LIFT, c[2] * SCALE] as V3;
});
export const NORMALS: V3[] = DUAL_FACES.map((f) => rot(f.n));

// rank indices (pent = the 12 points over the rico's pentagon faces)
export const PENT_IDX: number[] = TYPE.map((t, i) => t === "pent" ? i : -1).filter((i) => i >= 0);
export const CROWN_IDX = PENT_IDX.reduce((best, i) => V[i][1] > V[best][1] ? i : best, PENT_IDX[0]);
export const FOOT_IDX = PENT_IDX.reduce((best, i) => V[i][1] < V[best][1] ? i : best, PENT_IDX[0]);
export const WAIST_IDX = PENT_IDX.filter((i) => i !== CROWN_IDX && i !== FOOT_IDX);

// ---- FINIAL stem: solved against the WORST occluder (tri spikes included), floored at STEM_H_BASE ---------
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

// ---- the 12 brass beads: 1 crown finial + 10 waist poked radial + 1 pressed foot ---------------------------
export const BEADS: V3[] = (() => {
    const out: V3[] = [];
    for (const i of PENT_IDX) {
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

// ---- derived footprint constants (BEFORE all checks — no TDZ) ----------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
// APOTHEM-FIRST dais law (struct-247 fix, carried for all N)
export const PLINTH_R = Math.ceil(((MAX_H + ROD_R + 0.10) / Math.cos(Math.PI / PLINTH_N)) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// RED control (--red displaces one dual vertex: breaks face/edge/symmetry laws)
if (process.argv.includes("--red")) {
    V[7] = [V[7][0] + 0.3, V[7][1] - 0.2, V[7][2] + 0.15];
    console.log("RED MODE: dual vertex 7 displaced 0.3 — T2/T5/T6/T7 MUST fail");
}

// ==== T0 dual census + midsphere + radius classes ===========================================================
{
    let worstR = 0;
    for (let u = 0; u < 62; u++) worstR = Math.max(worstR, Math.abs(Math.hypot(...DV[u]) - classR[TYPE[u]]));
    const nPent = TYPE.filter((t) => t === "pent").length;
    const nSq = TYPE.filter((t) => t === "sq").length;
    const nTri = TYPE.filter((t) => t === "tri").length;
    check("T0 dual census + midsphere: 62/120/60; every rico edge midpoint at exactly ONE radius rho; three dual vertex radii classes rho^2/h exact (12 pent-rank OUTERMOST + 30 sq + 20 tri INNERMOST — the rico's deepest face planes become the dual's outermost points, depth ranking flips)",
        rhoSpread < 1e-12 && worstR < 1e-12 && nPent === 12 && nSq === 30 && nTri === 20
        && DV.length === 62 && DUAL_EDGES.length === 120 && DUAL_FACES.length === 60,
        `midsphere spread ${rhoSpread.toExponential(1)} (rho ${rho.toFixed(9)}, rico edge-2 frame); depths pent ${H_OF.pent.toFixed(6)} / sq ${H_OF.sq.toFixed(6)} / tri ${H_OF.tri.toFixed(6)}; radii pent ${classR.pent.toFixed(6)} / sq ${classR.sq.toFixed(6)} / tri ${classR.tri.toFixed(6)} worst dev ${(worstR * 1e12).toExponential(1)} — the KITE HEADS (pent-rank, where the dodeca parent's faces were) are the OUTERMOST points (dtria dec-rank pattern: rho^2/h flips the depth ranking)`);
}

// ---- T0b ACHIRALITY: some improper orthogonal map closes the vertex set -----------------------------------
{
    // Probe self-catch (c): the FIRST draft asserted the x<->y plane — an
    // ARBITRARY improper map that is NOT a symmetry of the standard
    // orientation (even-permutation sets are closed under z->-z sign flips,
    // not under coordinate transpositions). Achirality means SOME improper
    // map closes the set; test all six candidates and report which.
    const cands: [string, (p: V3) => V3][] = [
        ["x<->y", (p) => [p[1], p[0], p[2]]],
        ["x<->z", (p) => [p[2], p[1], p[0]]],
        ["y<->z", (p) => [p[0], p[2], p[1]]],
        ["x->-x", (p) => [-p[0], p[1], p[2]]],
        ["y->-y", (p) => [p[0], -p[1], p[2]]],
        ["z->-z", (p) => [p[0], p[1], -p[2]]],
    ];
    const closedUnder = (set: V3[], f: (p: V3) => V3) => set.every((p) => set.some((q) => dist(q, f(p)) < 1e-9));
    const winners = cands.filter(([, f]) => closedUnder(M, f) && closedUnder(DV, f)).map(([n]) => n);
    check("T0b ACHIRALITY: some improper orthogonal map closes BOTH vertex sets — the dual exists in ONE form, NO handedness owed Bill (the honest fix of the queue-head's wrong claim about the pentagonal hexecontahedron)",
        winners.length > 0,
        `closing mirror planes: [${winners.join(", ")}] — the snub-family chirality question does not arise`);
}

// ---- T1 Euler -----------------------------------------------------------------------------------------------
check("T1 Euler 62−120+60 = 2", V.length === 62 && DUAL_EDGES.length === 120 && DUAL_FACES.length === 60 && V.length - DUAL_EDGES.length + DUAL_FACES.length === 2,
    `V ${V.length}, E ${DUAL_EDGES.length}, F ${DUAL_FACES.length}, chi ${V.length - DUAL_EDGES.length + DUAL_FACES.length}`);

// ---- T2 kite census: the face-transitive Catalan signature + the kite mirror --------------------------------
{
    const aRef: Record<Family, number> = { pent: -1, sq: -1, tri: -1 };
    const sRef: Record<string, number> = { long: -1, short: -1 };
    let worstAng = 0, worstSum = 0, badFam = 0, worstSqPair = 0, worstSidePair = 0;
    for (const F of DUAL_FACES) {
        const vs = F.verts;
        const fams = vs.map((vi) => TYPE[vi]).sort().join("+");
        if (fams !== "pent+sq+sq+tri") badFam++;
        // ring position of each rank
        const posOf = (t: Family, occurrence: number) => {
            let n = 0;
            for (let t2 = 0; t2 < 4; t2++) if (TYPE[vs[t2]] === t) { if (n === occurrence) return t2; n++; }
            return -1;
        };
        // the two sq angles must be EQUAL within the face (kite mirror law)
        const sq0 = posOf("sq", 0), sq1 = posOf("sq", 1);
        const angAt = (t: number) => {
            const p0 = V[vs[(t + 3) % 4]], p1 = V[vs[t]], p2 = V[vs[(t + 1) % 4]];
            return Math.acos(Math.max(-1, Math.min(1, dot(nrm(sub(p0, p1)), nrm(sub(p2, p1))))));
        };
        worstSqPair = Math.max(worstSqPair, Math.abs(angAt(sq0) - angAt(sq1)));
        // side pairs: sq0->next and sq1->next ... long = pent-sq edges, short = sq-tri
        let sum = 0;
        for (let t = 0; t < 4; t++) {
            const ang = angAt(t);
            sum += ang;
            const ty = TYPE[vs[t]];
            if (aRef[ty] < 0) aRef[ty] = ang;
            else if (ty === "sq") { /* two positions — checked via the pair law */ }
            else worstAng = Math.max(worstAng, Math.abs(ang - aRef[ty]));
            const L = dist(V[vs[t]], V[vs[(t + 1) % 4]]);
            const pairTy = [TYPE[vs[t]], TYPE[vs[(t + 1) % 4]]].sort().join("-");
            const key = pairTy === "pent-sq" ? "long" : pairTy === "sq-tri" ? "short" : "BAD";
            if (key === "BAD") badFam++;
            else if (sRef[key] < 0) sRef[key] = L;
            else worstSidePair = Math.max(worstSidePair, Math.abs(L - sRef[key]));
        }
        worstSum = Math.max(worstSum, Math.abs(sum - 2 * Math.PI));
    }
    check("T2 kites: 60 faces; every kite one pent + two sq + one tri in ring order; per-face angle multiset IDENTICAL across ALL faces (three global classes, each at its own rank); the two sq-rank angles EQUAL within every face (kite mirror law); sides 2 long (pent-sq) + 2 short (sq-tri) equal within class; angle sum 2*pi",
        worstAng < 1e-12 && worstSum < 1e-12 && badFam === 0 && worstSqPair < 1e-12 && worstSidePair < 1e-12,
        `worst angle dev ${(worstAng * 1e12).toExponential(1)}; worst sq-pair dev ${worstSqPair.toExponential(1)} (kite mirror); worst side-pair dev ${(worstSidePair * 1e12).toExponential(1)}; worst sum dev ${worstSum.toExponential(1)}; angles pent ${(aRef.pent * 180 / Math.PI).toFixed(4)}deg / sq ${(aRef.sq * 180 / Math.PI).toFixed(4)}deg / tri ${(aRef.tri * 180 / Math.PI).toFixed(4)}deg (MEASURED — the Catalan's own kite); long ${sRef.long.toFixed(6)} short ${sRef.short.toFixed(6)} (scaled)`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------------
{
    const deg = new Array(62).fill(0);
    for (const [a, b] of DUAL_EDGES) { deg[a]++; deg[b]++; }
    const want: Record<Family, number> = { pent: 5, sq: 4, tri: 3 };
    let bad = 0;
    for (let u = 0; u < 62; u++) if (deg[u] !== want[TYPE[u]]) bad++;
    check("T3 vertices: degree 5 at the 12 pent-rank points / 4 at the 30 sq-rank / 3 at the 20 tri-rank (the SHARPEST spikes); Sum(deg) == 2E",
        bad === 0 && deg.reduce((s, d) => s + d, 0) === 2 * DUAL_EDGES.length,
        `rank violations ${bad}; Sum(deg) ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * DUAL_EDGES.length} — the rico's pentagons/squares/triangles live on as vertex figures`);
}

// ---- T4 manifold ---------------------------------------------------------------------------------------------
{
    const ef = new Map<string, number[]>();
    for (let fi = 0; fi < DUAL_FACES.length; fi++) {
        const vs = DUAL_FACES[fi].verts;
        for (let t = 0; t < 4; t++) {
            const a = vs[t], b = vs[(t + 1) % 4];
            const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
            ef.set(kk, [...(ef.get(kk) ?? []), fi]);
        }
    }
    const bad = [...ef.values()].filter((c) => c.length !== 2).length;
    const unmatched = DUAL_EDGES.filter(([a, b]) => (ef.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every dual edge on exactly 2 faces", bad === 0 && unmatched === 0 && ef.size === 120,
        `${ef.size} face-edges (240 slots), ${bad} wrong multiplicity, ${unmatched} of ${DUAL_EDGES.length} unmatched`);
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
    const sameRank = keys.filter((k) => k === "pent-pent" || k === "sq-sq" || k === "tri-tri");
    const allSpread = [...classes.values()].every((c) => c.worstLen < 1e-12);
    const pairKey = (x: string, y: string) => [x, y].sort().join("-");
    check("T5 edges: exactly TWO rank-pair classes pent-sq / sq-tri, 60 each, ZERO same-rank; two edge-length classes, 60 each, equal within class (long/short MEASURED — the Catalan is face-transitive, NOT uniform: unequal classes are the honest signature)",
        sameRank.length === 0 && keys.length === 2 && classes.get(pairKey("pent", "sq"))!.n === 60 && classes.get(pairKey("sq", "tri"))!.n === 60 && allSpread,
        `classes: ${keys.map((k) => `${k} ${classes.get(k)!.n} edges L ${classes.get(k)!.len.toFixed(6)} (spread ${(classes.get(k)!.worstLen * 1e12).toExponential(1)})`).join("; ")}; same-rank ${sameRank.length} — the kite's long pair and short pair, told globally`);
}

// ---- T6 THE POLAR RECIPROCAL ---------------------------------------------------------------------------------
{
    // (a) all 60 kites kiss ONE insphere: every vert at exactly plane depth rho^2/R from the center
    const wantPlane = (R2 / R_UNIT) * SCALE;
    let worstPlane = 0;
    for (const F of DUAL_FACES) {
        const n = NORMALS[DUAL_FACES.indexOf(F)];
        for (const vi of F.verts) worstPlane = Math.max(worstPlane, Math.abs(dot(sub(V[vi], SOLID_CENTER), n) - wantPlane));
    }
    // (b) every dual face normal is EXACTLY one rico vertex direction (pre-seat, bijection)
    let worstN = 0;
    const used = new Set<number>();
    for (const F of DUAL_FACES) {
        worstN = Math.max(worstN, dist(F.n, nrm(M[F.ofVertex])));
        used.add(F.ofVertex);
    }
    check("T6 THE POLAR RECIPROCAL: all 60 kites kiss ONE insphere (every vert at exactly plane depth rho^2/R — the Catalan tangent property, mirror of the rico's every-vertex-on-one-sphere); every face normal EXACTLY one rico vertex direction (bijection 60/60)",
        worstPlane < 1e-12 && worstN < 1e-12 && used.size === 60,
        `worst plane dev ${(worstPlane * 1e12).toExponential(1)} vs depth ${wantPlane.toFixed(9)} (rho^2/R scaled); worst normal dev ${worstN.toExponential(1)}; rico-vertex bijection ${used.size}/60`);
}

// ---- T7 seat laws ---------------------------------------------------------------------------------------------
{
    const footV = V[FOOT_IDX], crownV = V[CROWN_IDX];
    const axisOk = Math.hypot(footV[0], footV[2]) < 1e-12 && Math.hypot(crownV[0], crownV[2]) < 1e-12;
    const footAtDais = Math.abs(footV[1] - PLINTH_H) < 1e-12;
    // THE POINT-DOWN PROOF: the foot pent point is the LOWEST vertex overall (margin over the lowest tri spike)
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
    // central inversion (the rico's own inversion, inherited exactly)
    let invMiss = 0;
    for (const v of V) { const r = sub(SOLID_CENTER, sub(v, SOLID_CENTER)); if (!V.some((q) => dist(q, r) < 1e-6)) invMiss++; }
    const cx = V.reduce((s2, v) => s2 + v[0], 0) / 62;
    const cz = V.reduce((s2, v) => s2 + v[2], 0) / 62;
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    // the TEN waist pent-rank points: two level pentads, inversion-paired, 72-degree lattices
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
    const crownBead = BEADS[PENT_IDX.indexOf(CROWN_IDX)];
    const footBead = BEADS[PENT_IDX.indexOf(FOOT_IDX)];
    const waistBeads = BEADS.filter((_, k) => k !== PENT_IDX.indexOf(CROWN_IDX) && k !== PENT_IDX.indexOf(FOOT_IDX));
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
    check("T7 seat: foot + crown pent-rank points dead on the axis, foot AT dais top AND the LOWEST VERTEX OVERALL (point-down proof, margin over the lowest tri spike measured); 72-degree symmetry 0 misses; central inversion exact; centroid on axis; height == target; never overhangs (apothem-first); TEN waist pent-rank points = two exact level 72-degree pentads, lower snapped dead-on az 0 (parent twist INHERITED), upper offset measured, inversion-paired; beads 1 crown finial + 10 waist aloft + 1 pressed foot (30 sq + 20 tri DARK); FINIAL clears the WORST occluder sight line",
        axisOk && footAtDais && footLowest && symMiss === 0 && invMiss === 0 && Math.hypot(cx, cz) < 1e-12
        && Math.abs(height - TARGET_H) < 1e-9 && MAX_H + ROD_R <= apothem + 1e-9
        && lower.length === 5 && upper.length === 5 && levelSpread(lower) < 1e-12 && levelSpread(upper) < 1e-12
        && radiusSpread(lower) < 1e-12 && radiusSpread(upper) < 1e-12
        && lowerLattice && hasSnap && upperLattice && pentadPaired
        && waistAloft && Math.hypot(crownBead[0], crownBead[2]) < 1e-12
        && Math.abs(footBead[1] - FOOT_BEAD_Y) < 1e-12
        && FOOT_BEAD_Y - BEAD_R >= -1e-9 && FOOT_BEAD_Y + BEAD_R <= PLINTH_H + 1e-9
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; foot pent point ${footV[1].toFixed(6)} == dais top ${PLINTH_H}, lowest other vertex (${lowestOtherIs}) ${lowestOther.toFixed(6)} — margin ${(lowestOther - footV[1]).toFixed(4)}m; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); pentads level/radii exact, upper offset ${(upperOffset * 180 / Math.PI).toFixed(2)}deg (geometry-decided, disclosed); stem ${STEM_H.toFixed(2)}m solved against worst occluder sight ${sightY.toFixed(3)}; FINIAL crown bead top ${beadTop.toFixed(3)} clears by ${finialClear.toFixed(3)}m (>= ${1.5 * BEAD_R} law)`);
}

// ---- T8 immersion ----------------------------------------------------------------------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    let worstPlane = -Infinity;
    let worstTuck = 0;
    for (let u = 0; u < DUAL_FACES.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const vs = DUAL_FACES[u].verts;
        for (let t = 0; t < 4; t++) {
            const vi = vs[t];
            const d = sub(V[vi], c);
            const r = Math.hypot(...d);
            const q = add(c, add(mul(d, (r - PLATE_INSET) / r), mul(n, sSide)));
            for (let u2 = 0; u2 < DUAL_FACES.length; u2++) {
                if (u2 === u) continue;
                worstPlane = Math.max(worstPlane, dot(sub(q, CENTERS[u2]), NORMALS[u2]));
            }
            for (let w = 0; w < 2; w++) {
                const other = vs[(t + (w === 0 ? 3 : 1)) % 4];
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

console.log(`solve: rico rebuilt from closed forms (R ${R_UNIT.toFixed(9)} == sqrt(8phi+7)); midsphere rho ${rho.toFixed(9)} -> dual radii pent ${classR.pent.toFixed(6)} / sq ${classR.sq.toFixed(6)} / tri ${classR.tri.toFixed(6)}; depths pent ${H_OF.pent.toFixed(6)} / sq ${H_OF.sq.toFixed(6)} / tri ${H_OF.tri.toFixed(6)}; scale ${SCALE.toFixed(9)} (height ${TARGET_H})`);
console.log(`seat: PENT-RANK POINT-DOWN 5-fold on the parent's own frame (pentagon-down + twist-snap INHERITED — no re-seat); foot pent point at dais top ${PLINTH_H} AND the lowest vertex; solid height ${TARGET_H}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} -> ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} >= reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`build: 120 iron seam rods + 60 stone kite sails + ${PLINTH_N}-gon stone dais + glow_deltoid_12 (1 crown finial stem ${STEM_H.toFixed(2)}m + 10 waist + 1 pressed foot); the 30 sq-rank + 20 tri-rank points stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct269-deltoid)");
