// struct277-probe-trioct.ts — STRUCTURES LANE struct-277, Round 11 R11-85.
// THE TRIAKIS OCTAHEDRON — the Catalan dual of the standing truncated cube
// (tcube, struct-249/250, S-SW band az228.5 r83.0 — AT CAP 6). Catalan
// branch member 7 (rt struct-235; dtria struct-267/268; deltoid
// struct-269/270; triakis struct-271/272; tetrakis struct-273/274; trit
// struct-275/276). Dual-of-standing-parent move a SEVENTH time
// (gsd->gdodec, trico->dtria, rico->deltoid, tdodec->triakis,
// toct->tetrakis, tret->trit, tcube->trioct).
//
// FORM-LEDGER GREP fresh this tick (triakis octa|trioct|katasyon over the
// five-file set): 0 real claims — the LAST unclaimed achiral small
// Catalan (struct-276 closing directive). Parents toct/trcubo N-E AT
// CAP 6 — this is the SECOND family member to seat OUTSIDE its parent's
// quarter (trit struct-276 was first); the R11-86 seat goes to a fresh
// under-served octant, surfaced in the plan when it lands.
// ACHIRAL, machine-proven (T0b: mirror planes close both vertex sets —
// no handedness owed Bill).
//
// ONE IDEA: THE DEEPER CUT'S GHOST, READ THROUGH THE LOOKING GLASS. The
// parent tcube told THE DEEPER CUT — regularity of its octagons demands
// cutting past the family's 1/3 law to u = 1−1/√2 (at 1/3 the side ratio
// is exactly √2 — irregular), and even then 96.65% of the cube stands.
// The polar reciprocal about its midsphere (rho = √2 EXACT, both edge
// classes) turns every parent face into a POINT and every one of the 24
// tcube vertices into an ISOCELES sail — one ghost apex + two oct wings,
// every sail kissing ONE insphere at rho^2/R (the Catalan tangent
// property, T6). THE RANK INVERSION IS THE STORY: the cut planes ride
// FAR out (h_tri = (1+√2)/√3) while the face planes sit deep (h_oct = 1
// — the cube's own skin) — so in the dual the SIX FACES stand as the SIX
// GREAT OUTER POINTS at exactly 2 along the axes: THE OCTAHEDRON ITSELF,
// the cube's own dual surfacing through the cut, the closed form this
// dual owes its grandparent — while the EIGHT RAZOR-GHOSTS sink to
// 2√3(√2−1) ≈ 1.435 (ratio (1+√2)/√3 EXACTLY, the depth ratio told in
// the radii), tenting the octahedron's eight faces with the flattest
// apexes in the family fleet. Closed forms: apex arccos((1−2√2)/4) ≈
// 117.21deg (obtuse — vs the trit's 112.89deg, the flattest tent yet
// banked) / base arccos((2+√2)/4) ≈ 31.40deg / wings-to-base 2−√2
// EXACTLY — the parent's own corner-tet leg constant returning in the
// dual's sail. Presentation: OCT-POINT-DOWN 4-fold on the parent's own
// seated frame INHERITED (face-down Rx(90°) + cardinals dead-on, NO
// twist-snap — verbatim struct-249 math; the bottom face's dual point is
// the foot, the four waist oct-points land on the exact cardinals, the
// ghost squares on the exact 45deg diagonals). STONE carries all 24
// sails (ONE face family = ONE sail material — the face-transitivity
// read in the material law) + the TWENTY-FOUR-sided dais (one side per
// sail, theme-number law); IRON carries all 36 seam bonds + the crown
// finial stem. Night contract: the parent's OWN bead census transcribed
// to the dual — its six lit octagon centers become the six OCT-POINTS:
// 1 crown FINIAL on the iron stem (tret v2 occlusion law) + 4 WAIST at
// the exact cardinals + the SIXTH PRESSED into the earth beneath the
// foot point, fully buried in the dais band (tico's-twelfth idiom —
// five read at night, six in truth, disclosed); the eight razor-ghosts
// stay dark — absence is the mark of the removed corners = glow_trioct_6.
//
// Laws honored: dais APOTHEM-FIRST (struct-247); texMat lanes (struct-38);
// ROOT STAYS IDENTITY (struct-188); NaN 0; below-grade 0.
//
// THEOREMS machine-verified below:
//   T0 dual census + midsphere: 14/36/24; every tcube edge midpoint at
//      exactly one radius rho (== √2 closed-form in the parent frame);
//      two dual vertex radii classes rho^2/h exact, oct-rank OUTERMOST
//      (2, the axes — THE OCTAHEDRON) / ghost-rank INNERMOST
//      (2√3(√2−1), the diagonals) — the rank inversion measured, ratio
//      (1+√2)/√3 == the depth-ratio exactly.
//   T0b ACHIRALITY: SOME improper orthogonal map closes BOTH vertex
//      sets — no handedness owed.
//   T1 Euler: 14 - 36 + 24 = 2 (sphere).
//   T2 sail census: 24 isoceles triangles; every sail one ghost apex +
//      two oct wings in ring order; per-face angle multiset IDENTICAL
//      across all faces; the two base angles EQUAL within every face
//      (isoceles mirror law); sides 2 equal wings (oct-ghost) + 1 base
//      (oct-oct); apex + 2*base == pi AND the closed forms hold EXACTLY
//      — apex arccos((1−2√2)/4), base arccos((2+√2)/4), wings/base ==
//      2−√2 (the parent's own corner-tet leg constant).
//   T3 vertex census: degree 8 at the 6 oct-points (the octagon's
//      eightness told at a point) / 3 at the 8 ghost apexes (the razors'
//      threeness — the parent's every-vertex-deg-3 inverted); Sum(deg)
//      == 2E.
//   T4 manifold: every dual edge on exactly 2 faces (48 slots).
//   T5 edge census: exactly TWO rank-pair classes oct-ghost (24, from
//      the parent's T-O edges) / oct-oct (12, from the parent's O-O
//      edges), ZERO ghost-ghost (no two corner cuts ever met — struct-249
//      T5, the deeper cut still not deep enough for triangles to touch);
//      two edge-length classes equal within class (the Catalan is
//      face-transitive, NOT uniform).
//   T6 THE POLAR RECIPROCAL: every one of the 24 sails has all three
//      verts at EXACTLY plane depth rho^2/R_tcube from the dual center
//      (all faces kiss ONE insphere — the Catalan tangent property);
//      every sail normal is EXACTLY one tcube vertex direction
//      (bijection 24/24).
//   T7 seat laws: foot + crown oct-points dead on the axis; foot AT the
//      dais top AND the lowest vertex overall (point-down proof, margin
//      measured); 90-degree symmetry 0 misses (4-fold seat); central
//      inversion exact; centroid on axis; height == target; never
//      overhangs (apothem-first); the four waist oct-points at the EXACT
//      cardinals, level, equal radii (parent twist-snap law INHERITED —
//      no snap needed); the eight ghost apexes = two exact squares on
//      the SAME diagonal lattice az 45deg+90k (3 upper + ... 4 upper +
//      4 lower), each upper ghost DIRECTLY ABOVE a lower ghost (vertical
//      stacking exact — the cuts aligned through the center), set
//      inversion-closed; bead census honest (4 aloft waist + crown
//      finial + 1 pressed foot buried — the parent's own idiom);
//      FINIAL-CLEARANCE LAW (tret v2) against the WORST occluder.
//   T8 immersion: every inset plate corner strictly INSIDE the convex
//      solid; corner tuck reported.
//   RED control: --red displaces one dual vertex 0.3 — T2/T5/T6/T7 fail.

export const TARGET_H = 7.0;              // seated solid height — family ladder next step (rico 6.3, dtria 6.6, deltoid 6.7, triakis 6.8, tetrakis 6.9 -> 7.0)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.15;               // brass oct-point bead (family scale)
export const BEAD_POKE = 0.02;            // bead center proud along the radial dir (grazing-read law, disclosed)
export const STEM_H_BASE = 1.30;          // FINIAL stem floor: crown bead lifted on an iron pin (tret v2 occlusion law; solved higher if occluders demand)
export const STEM_R = 0.03;               // finial stem radius (slender iron pin)
export const READER_D = 18;               // lane reading distance (sight-line law domain)
export const READER_EYE = 1.65;           // reader eye height
export const PLATE_T = 0.10;              // panel thickness
export const PLATE_INSET = 0.07;          // panel corner inset (seam reveal — family look)
export const PLATE_BACK = 0.018;          // panel outer face behind rod surface
export const PLINTH_N = 24;               // TWENTY-FOUR sides — one per sail (theme-number law)
export const PLINTH_ROT = 0;              // corners ON the axes (N divisible by 4)
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
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uy * uz * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}

// ==== THE PARENT TCUBE, rebuilt verbatim from struct-249's closed forms (frozen math) =========

// ---- grandparent cube: the eight (±1,±1,±1) corners, edge 2 ------------------------------------------------
const M: V3[] = [];
for (const a of [1, -1]) for (const b of [1, -1]) for (const c of [1, -1]) M.push([a, b, c]);
if (M.length !== 8) throw Error(`cube verts ${M.length} != 8`);
const P_EDGE = 2;                             // parent edge (exact for these coords)
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 12) throw Error(`parent edges ${P_EDGES.length} != 12`);

// ---- THE DEEPER CUT: u = 1 − 1/√2 (regularity of the octagons demands it — the 1/3 bar leaves side ratio √2) ----
const U_CUT = 1 - 1 / Math.SQRT2;
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
const A_UNIT = 2 * (Math.SQRT2 - 1);           // uniform edge of the unit tcube — the deeper cut makes ALL sides equal
const R_UNIT = Math.hypot(...pts[0]);
const R_CLOSED = Math.sqrt(5 - 2 * Math.SQRT2); // vertex (1,1,√2−1) — struct-249 self-catch (a) carried
if (Math.abs(R_UNIT - R_CLOSED) > 1e-12) throw Error(`R ${R_UNIT} != closed ${R_CLOSED}`);

// ---- tcube edges by distance --------------------------------------------------------------------------------
const PEDGES: [number, number][] = [];
for (let i = 0; i < 24; i++) for (let j = i + 1; j < 24; j++)
    if (Math.abs(dist(pts[i], pts[j]) - A_UNIT) < 1e-9) PEDGES.push([i, j]);
if (PEDGES.length !== 36) throw Error(`tcube edges ${PEDGES.length} != 36`);

// ---- tcube faces: 6 octagons (the cube's own face planes) + 8 triangles (the corner cuts) --------------------
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
// octagons: one per cube face — its 8 surrounding cut points, sorted around
{
    const AXES: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    for (const ax of AXES) {
        // cut points with maximal projection on this axis: the face plane is at depth 1
        const ring = pts.filter((p) => Math.abs(dot(p, ax) - 1) < 1e-9);
        if (ring.length !== 8) throw Error(`octagon ring ${ring.length} != 8`);
        const o = orderRing(ring);
        pfaces.push({ k: 8, verts: o.verts, center: o.center, n: o.n, isTri: false, h: dot(ring[0], o.n) });
    }
}
// triangles: one per cube corner — its 3 nearest cut points
{
    for (let i = 0; i < 8; i++) {
        const ring = [...pts]
            .map((p, k) => ({ k, d: dist(p, M[i]) }))
            .sort((a, b) => a.d - b.d)
            .slice(0, 3);
        if (ring[2].d - ring[0].d > 1e-9) throw Error("corner triangle not equidistant");
        const o = orderRing(ring.map((r) => pts[r.k]));
        pfaces.push({ k: 3, verts: o.verts, center: o.center, n: o.n, isTri: true, h: dot(pts[ring[0].k], o.n) });
    }
}
if (pfaces.length !== 14) throw Error(`parent faces ${pfaces.length} != 14`);
if (pfaces.filter((f) => f.isTri).length !== 8) throw Error("triangle count != 8");
if (pfaces.filter((f) => !f.isTri).length !== 6) throw Error("octagon count != 6");

// parent edge -> its two faces
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < pfaces.length; fi++) for (let t = 0; t < pfaces[fi].verts.length; t++) {
    const a = pfaces[fi].verts[t], b = pfaces[fi].verts[(t + 1) % pfaces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ==== THE DUAL: polar reciprocal about the midsphere ========================================================

// ---- midsphere: every tcube edge midpoint at one radius rho = √2 ----------------------------------------------
const rho = (() => { const [i, j] = PEDGES[0]; return Math.hypot(...mul(add(pts[i], pts[j]), 0.5)); })();
let rhoSpread = 0;
for (const [i, j] of PEDGES) {
    const m = mul(add(pts[i], pts[j]), 0.5);
    rhoSpread = Math.max(rhoSpread, Math.abs(Math.hypot(...m) - rho));
}

// ---- the 14 dual vertices: v_u = (rho^2 / h_u) . n_u (h_u = MEASURED plane depth) ----------------------------
const R2 = rho * rho;
type Rank = "oct" | "ghost";
const TYPE: Rank[] = pfaces.map((f) => f.isTri ? "ghost" : "oct");
const H_OF: Record<Rank, number> = (() => {
    const h: Record<Rank, number> = { oct: 0, ghost: 0 };
    for (const f of pfaces) {
        const key = f.isTri ? "ghost" : "oct";
        if (h[key] === 0) h[key] = f.h;
        else if (Math.abs(h[key] - f.h) > 1e-9) throw Error(`family ${key} depth not level`);
    }
    return h;
})();
const DV: V3[] = pfaces.map((f) => mul(f.n, R2 / f.h));
const classR = { oct: R2 / H_OF.oct, ghost: R2 / H_OF.ghost };

// ---- the 24 dual faces: one ISOCELES sail per tcube vertex (figure 3.8.8) -------------------------------------
type DFace = { verts: number[]; center: V3; n: V3; ofVertex: number };
const DUAL_FACES: DFace[] = [];
{
    const pidxD = (p: V3) => {
        const k = DV.findIndex((q) => dist(q, p) < 1e-9);
        if (k >= 0) return k;
        throw Error("dual face vertex not in dual set");
    };
    for (let i = 0; i < 24; i++) {
        const inc: number[] = [];
        for (let fi = 0; fi < pfaces.length; fi++) if (pfaces[fi].verts.includes(i)) inc.push(fi);
        if (inc.length !== 3) throw Error(`tcube vertex ${i}: ${inc.length} incident faces (want 3)`);
        const fams = inc.map((fi) => TYPE[fi]).sort().join("+");
        if (fams !== "ghost+oct+oct") throw Error(`tcube vertex ${i} figure ${fams} (want ghost+oct+oct)`);
        const ring = inc.map((fi) => DV[fi]);
        const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / 3);
        const n = nrm(pts[i]);                     // EXACT plane normal: the tcube vertex direction
        const e1 = nrm(sub(ring[0], c));
        const e2 = cross(n, e1);
        const ordered = [...ring].sort((p, q) =>
            Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
        DUAL_FACES.push({ verts: ordered.map((p) => pidxD(p)), center: c, n, ofVertex: i });
    }
    if (DUAL_FACES.length !== 24) throw Error(`dual faces ${DUAL_FACES.length} != 24`);
}

// ---- the 36 dual edges: one per tcube edge, joining the duals of its two faces -------------------------------
const DUAL_EDGES: [number, number][] = [];
{
    const seenE = new Set<string>();
    for (const [a, b] of PEDGES) {
        const fl = edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`)!;
        if (fl.length !== 2) throw Error(`tcube edge ${a}-${b}: ${fl.length} faces (want 2)`);
        const [u1, u2] = fl;
        const key = u1 < u2 ? `${u1}-${u2}` : `${u2}-${u1}`;
        if (seenE.has(key)) throw Error(`duplicate dual edge ${key}`);
        seenE.add(key);
        DUAL_EDGES.push(u1 < u2 ? [u1, u2] : [u2, u1]);
    }
    if (DUAL_EDGES.length !== 36) throw Error(`dual edges ${DUAL_EDGES.length} != 36`);
}
export const E: [number, number][] = DUAL_EDGES;

// ==== SEAT: the tcube's own seated frame, INHERITED (face-down Rx(90°) + cardinals dead-on, NO twist-snap) ===

// ---- seating: face normal (0,0,1) → −Y (the bottom face's dual POINT lands dead-down; 4-fold seat) ------------
const v0 = nrm([0, 0, 1]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// NO twist-snap (struct-249 parent law, INHERITED): Rx(90°) lands the four
// waist octagon normals on the exact cardinals and the ghost squares on the
// exact 45° diagonals — T7 verifies both. The bottom face's dual point is
// the FOOT; the four waist oct-points stand at the cardinals.
const az0 = 0;
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], az0);
const rot = (v: V3): V3 => rot2(rot1(v));

// ---- scale + lift: the FOOT oct-point lands exactly on the dais top ------------------------------------------
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
export const SOLID_CENTER: V3 = [0, LIFT, 0];            // seatedUnit was origin-centered
export const FACE_V: number[][] = DUAL_FACES.map((f) => f.verts);
export const CENTERS: V3[] = DUAL_FACES.map((f) => {
    const c = rot(f.center);
    return [c[0] * SCALE, c[1] * SCALE + LIFT, c[2] * SCALE] as V3;
});
export const NORMALS: V3[] = DUAL_FACES.map((f) => rot(f.n));

// rank indices (oct = the 6 points over the parent's face planes — THE OCTAHEDRON; ghost = the 8 corner razors)
export const OCT_IDX: number[] = TYPE.map((t, i) => t === "oct" ? i : -1).filter((i) => i >= 0);
export const GHOST_IDX: number[] = TYPE.map((t, i) => t === "ghost" ? i : -1).filter((i) => i >= 0);
export const CROWN_IDX = OCT_IDX.reduce((best, i) => V[i][1] > V[best][1] ? i : best, OCT_IDX[0]);
export const FOOT_IDX = OCT_IDX.reduce((best, i) => V[i][1] < V[best][1] ? i : best, OCT_IDX[0]);

// ---- FINIAL stem: solved against the WORST occluder (oct points + ghost apexes included), floored at STEM_H_BASE
export const STEM_H = (() => {
    // sight line from the reader's eye at READER_D over the worst silhouette vertex
    let sightY = -Infinity;
    for (const p of V) {
        const y = p[1], r = Math.hypot(p[0], p[2]);
        if (y <= READER_EYE || r <= 1e-9) continue;                 // vertex behind/at the reader — not an occluder
        if (READER_D - r <= 0.5) continue;
        sightY = Math.max(sightY, y + (y - READER_EYE) * r / (READER_D - r));
    }
    const crownY = V[CROWN_IDX][1];
    const need = sightY + 1.5 * BEAD_R - BEAD_R - BEAD_POKE - crownY;
    return Math.max(STEM_H_BASE, Math.ceil(need / 0.05) * 0.05);
})();

// ---- the 6 brass beads: 4 waist oct-points poked radial + 1 pressed foot buried + 1 crown finial ----------------
// The parent's own bead census transcribed to the dual: its six lit octagon
// centers become the six OCT-POINTS. The pressed sixth sits beneath the foot
// point, fully buried in the dais band (y 0.15, spans 0..0.30 — tico's-twelfth
// idiom: five read at night, six in truth, disclosed). The ghosts stay dark.
export const BEADS: V3[] = (() => {
    const out: V3[] = [];
    for (const i of OCT_IDX) {
        if (i === FOOT_IDX || i === CROWN_IDX) continue;           // foot = pressed (below), crown = finial (stem)
        const dir = nrm(sub(V[i], SOLID_CENTER));
        out.push(add(V[i], mul(dir, BEAD_POKE)));
    }
    if (out.length !== 4) throw Error(`waist beads ${out.length} != 4`);
    out.push([0, PLINTH_H / 2, 0]);                                 // the pressed sixth, buried in the dais band
    out.push([0, V[CROWN_IDX][1] + BEAD_POKE + STEM_H, 0]);         // crown finial rides the iron stem (tret v2)
    if (out.length !== 6) throw Error(`beads ${out.length} != 6`);
    return out;
})();
export const PRESSED_IDX = 4;      // BEADS[4] = the buried sixth
export const CROWN_BEAD_IDX = 5;   // BEADS[5] = the crown finial

// ---- derived footprint constants (BEFORE all checks — no TDZ) ------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
// APOTHEM-FIRST dais law (struct-247 fix, carried for all N)
export const PLINTH_R = Math.ceil(((MAX_H + ROD_R + 0.10) / Math.cos(Math.PI / PLINTH_N)) * 20) / 20;

// RED control (--red displaces one dual vertex: breaks face/edge/symmetry laws)
if (process.argv.includes("--red")) {
    V[3] = [V[3][0] + 0.3, V[3][1] - 0.2, V[3][2] + 0.15];
    console.log("RED MODE: dual vertex 3 displaced 0.3 — T2/T5/T6/T7 MUST fail");
}

// ==== T0 dual census + midsphere + radius classes ===========================================================
{
    let worstR = 0;
    for (let u = 0; u < 14; u++) worstR = Math.max(worstR, Math.abs(Math.hypot(...DV[u]) - classR[TYPE[u]]));
    const nOct = TYPE.filter((t) => t === "oct").length;
    const nGhost = TYPE.filter((t) => t === "ghost").length;
    const rhoClosed = Math.SQRT2;             // tcube midradius in the a = 2(√2−1) frame (measured == closed)
    const octClosed = 2;                      // rho^2 / h_face, h_face = 1 (the cube's own skin)
    const ghostClosed = 2 * Math.sqrt(3) * (Math.SQRT2 - 1);   // rho^2 / ((1+√2)/√3), rationalized
    const ratioClosed = (1 + Math.SQRT2) / Math.sqrt(3);       // oct/ghost == h_tri/h_oct EXACTLY
    check("T0 dual census + midsphere: 14/36/24; every tcube edge midpoint at exactly ONE radius rho (== sqrt(2) closed-form in the parent frame); two dual vertex radii classes rho^2/h exact — 6 oct-rank OUTERMOST at exactly 2 on the axes (the parent's own face planes, h=1: THE OCTAHEDRON, the cube's own dual surfacing through the cut, the closed form this dual owes its grandparent) + 8 ghost-rank INNERMOST at 2*sqrt(3)*(sqrt(2)-1) on the diagonals (the deep-cut planes h=(1+sqrt2)/sqrt3 riding FAR out — the razors' ghosts sink INWARD): THE RANK INVERSION — the cuts sink, the untouched faces stand as the crown; oct/ghost ratio (1+sqrt2)/sqrt3 == the depth ratio EXACTLY",
        rhoSpread < 1e-12 && Math.abs(rho - rhoClosed) < 1e-12 && worstR < 1e-12 && nOct === 6 && nGhost === 8
        && Math.abs(classR.oct - octClosed) < 1e-12 && Math.abs(classR.ghost - ghostClosed) < 1e-12
        && DV.length === 14 && DUAL_EDGES.length === 36 && DUAL_FACES.length === 24 && classR.oct > classR.ghost
        && Math.abs(classR.oct / classR.ghost - ratioClosed) < 1e-12,
        `midsphere spread ${rhoSpread.toExponential(1)} (rho ${rho.toFixed(9)} == sqrt2 ${rhoClosed.toFixed(9)}); depths oct ${H_OF.oct.toFixed(6)} / ghost ${H_OF.ghost.toFixed(6)} (== (1+sqrt2)/sqrt3 ${( (1 + Math.SQRT2) / Math.sqrt(3) ).toFixed(6)}); radii oct ${classR.oct.toFixed(6)} / ghost ${classR.ghost.toFixed(6)} (ratio ${(classR.oct / classR.ghost).toFixed(6)} == ${(ratioClosed).toFixed(6)} EXACTLY) worst dev ${(worstR * 1e12).toExponential(1)}`);
}

// ---- T0b ACHIRALITY: some improper orthogonal map closes the vertex set -----------------------------------
{
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
check("T1 Euler 14−36+24 = 2", V.length === 14 && DUAL_EDGES.length === 36 && DUAL_FACES.length === 24 && V.length - DUAL_EDGES.length + DUAL_FACES.length === 2,
    `V ${V.length}, E ${DUAL_EDGES.length}, F ${DUAL_FACES.length}, chi ${V.length - DUAL_EDGES.length + DUAL_FACES.length}`);

// ---- T2 sail census: the face-transitive Catalan signature + the isoceles mirror ---------------------------
{
    let aApex = -1, aBase = -1, sWing = -1, sBase = -1;
    let worstApex = 0, worstBase = 0, worstSum = 0, badFam = 0, worstBasePair = 0, worstSidePair = 0;
    for (const F of DUAL_FACES) {
        const vs = F.verts;
        const fams = vs.map((vi) => TYPE[vi]).sort().join("+");
        if (fams !== "ghost+oct+oct") badFam++;
        // ring position of the ghost apex
        const gPos = vs.findIndex((vi) => TYPE[vi] === "ghost");
        const angAt = (t: number) => {
            const p0 = V[vs[(t + 2) % 3]], p1 = V[vs[t]], p2 = V[vs[(t + 1) % 3]];
            return Math.acos(Math.max(-1, Math.min(1, dot(nrm(sub(p0, p1)), nrm(sub(p2, p1))))));
        };
        // the two base angles (at the oct corners) must be EQUAL within the face (isoceles mirror law)
        const d0 = (gPos + 1) % 3, d1 = (gPos + 2) % 3;
        worstBasePair = Math.max(worstBasePair, Math.abs(angAt(d0) - angAt(d1)));
        const apex = angAt(gPos), base = angAt(d0);
        if (aApex < 0) aApex = apex; else worstApex = Math.max(worstApex, Math.abs(apex - aApex));
        if (aBase < 0) aBase = base; else worstBase = Math.max(worstBase, Math.abs(base - aBase));
        let sum = 0;
        for (let t = 0; t < 3; t++) {
            sum += angAt(t);
            const L = dist(V[vs[t]], V[vs[(t + 1) % 3]]);
            const pairTy = [TYPE[vs[t]], TYPE[vs[(t + 1) % 3]]].sort().join("-");
            const key = pairTy === "ghost-oct" ? "wing" : pairTy === "oct-oct" ? "base" : "BAD";
            if (key === "BAD") badFam++;
            else if (sWing < 0 && key === "wing") sWing = L;
            else if (key === "wing") worstSidePair = Math.max(worstSidePair, Math.abs(L - sWing));
            if (key === "base") { if (sBase < 0) sBase = L; else worstSidePair = Math.max(worstSidePair, Math.abs(L - sBase)); }
        }
        worstSum = Math.max(worstSum, Math.abs(sum - Math.PI));
    }
    // THE CLOSED FORMS: apex arccos((1−2√2)/4) — OBTUSE, the flattest tent in
    // the family fleet; base arccos((2+√2)/4); wings/base == 2−√2 EXACTLY —
    // the parent tcube's own corner-tet leg constant (struct-249) returning
    // in the dual's sail. [Probe-law discipline: these were derived red-honestly
    // twice this tick — a first draft mislabeled the parent's triangle verts
    // and produced h 0.9529/0.3573 (contradicting rank order); the corrected
    // centroid law h_tri = (1+√2)/√3 restored the inversion. The law asserts
    // the exact closed forms, not my first arithmetic.]
    const APEX_CLOSED = Math.acos((1 - 2 * Math.SQRT2) / 4);
    const BASE_CLOSED = Math.acos((2 + Math.SQRT2) / 4);
    const RATIO_CLOSED = 2 - Math.SQRT2;
    const closedLaws = Math.abs(aApex - APEX_CLOSED) < 1e-12
        && Math.abs(aBase - BASE_CLOSED) < 1e-12
        && Math.abs(sWing / sBase - RATIO_CLOSED) < 1e-12;
    check("T2 sails: 24 faces; every sail one ghost apex + two oct wings in ring order; per-face angle multiset IDENTICAL across ALL faces (apex class at the ghost corner, base class at the oct corners); the two base angles EQUAL within every face (isoceles mirror law); sides 2 equal wings (oct-ghost) + 1 base (oct-oct); angle sum pi; THE CLOSED FORMS hold EXACTLY — apex arccos((1-2sqrt2)/4) OBTUSE (the flattest tent in the family fleet), base arccos((2+sqrt2)/4), wings/base == 2-sqrt2 (the parent tcube's own corner-tet leg constant returning in the dual's sail)",
        worstApex < 1e-12 && worstBase < 1e-12 && worstSum < 1e-12 && badFam === 0 && worstBasePair < 1e-12 && worstSidePair < 1e-12 && closedLaws,
        `worst apex dev ${(worstApex * 1e12).toExponential(1)}; worst base dev ${worstBase.toExponential(1)}; worst base-pair dev ${worstBasePair.toExponential(1)} (isoceles mirror); worst side dev ${(worstSidePair * 1e12).toExponential(1)}; worst sum dev ${worstSum.toExponential(1)}; apex ${(aApex * 180 / Math.PI).toFixed(4)}deg == arccos((1-2sqrt2)/4) ${(APEX_CLOSED * 180 / Math.PI).toFixed(4)} (OBTUSE — vs the trit's 112.8859, the flattest yet banked) / base ${(aBase * 180 / Math.PI).toFixed(4)}deg == arccos((2+sqrt2)/4) ${(BASE_CLOSED * 180 / Math.PI).toFixed(4)} (MEASURED — the Catalan's own sail); wing ${sWing.toFixed(6)} base ${sBase.toFixed(6)} (wings/base ${(sWing / sBase).toFixed(6)} == 2-sqrt2 ${RATIO_CLOSED.toFixed(6)} EXACTLY — the parent's corner-tet leg constant)`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------------
{
    const deg = new Array(14).fill(0);
    for (const [a, b] of DUAL_EDGES) { deg[a]++; deg[b]++; }
    const want: Record<Rank, number> = { ghost: 3, oct: 8 };
    let bad = 0;
    for (let u = 0; u < 14; u++) if (deg[u] !== want[TYPE[u]]) bad++;
    check("T3 vertices: degree 8 at the 6 oct-points (the octagon's eightness told at a point) / 3 at the 8 ghost apexes (the razors' threeness — the parent's every-vertex-deg-3 inverted); Sum(deg) == 2E",
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
    check("T4 manifold: every dual edge on exactly 2 faces", bad === 0 && unmatched === 0 && ef.size === 36,
        `${ef.size} face-edges (48 slots), ${bad} wrong multiplicity, ${unmatched} of ${DUAL_EDGES.length} unmatched`);
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
    const sameRank = keys.filter((k) => k === "ghost-ghost");
    const allSpread = [...classes.values()].every((c) => c.worstLen < 1e-12);
    check("T5 edges: exactly TWO rank-pair classes oct-ghost (24, from the parent's O-T edges) / oct-oct (12, from the parent's O-O edges), ZERO ghost-ghost (no two corner cuts ever met — the deeper cut still not deep enough for triangles to touch: struct-249 T5, the parent's own law); two edge-length classes equal within class (wing/base MEASURED — the Catalan is face-transitive, NOT uniform: unequal classes are the honest signature)",
        sameRank.length === 0 && keys.length === 2 && classes.get("ghost-oct")!.n === 24 && classes.get("oct-oct")!.n === 12 && allSpread,
        `classes: ${keys.map((k) => `${k} ${classes.get(k)!.n} edges L ${classes.get(k)!.len.toFixed(6)} (spread ${(classes.get(k)!.worstLen * 1e12).toExponential(1)})`).join("; ")}; zero ghost-ghost — the razors never met each other in the parent`);
}

// ---- T6 THE POLAR RECIPROCAL ---------------------------------------------------------------------------------
{
    // (a) all 24 sails kiss ONE insphere: every vert at exactly plane depth rho^2/R from the center
    const wantPlane = (R2 / R_UNIT) * SCALE;
    let worstPlane = 0;
    for (let u = 0; u < DUAL_FACES.length; u++) {
        const n = NORMALS[u];
        for (const vi of DUAL_FACES[u].verts) worstPlane = Math.max(worstPlane, Math.abs(dot(sub(V[vi], SOLID_CENTER), n) - wantPlane));
    }
    // (b) every dual face normal is EXACTLY one tcube vertex direction (pre-seat, bijection)
    let worstN = 0;
    const used = new Set<number>();
    for (const F of DUAL_FACES) {
        worstN = Math.max(worstN, dist(F.n, nrm(pts[F.ofVertex])));
        used.add(F.ofVertex);
    }
    check("T6 THE POLAR RECIPROCAL: all 24 sails kiss ONE insphere (every vert at exactly plane depth rho^2/R — the Catalan tangent property, mirror of the tcube's every-vertex-on-one-sphere); every face normal EXACTLY one tcube vertex direction (bijection 24/24)",
        worstPlane < 1e-12 && worstN < 1e-12 && used.size === 24,
        `worst plane dev ${(worstPlane * 1e12).toExponential(1)} vs depth ${wantPlane.toFixed(9)} (rho^2/R scaled); worst normal dev ${worstN.toExponential(1)}; tcube-vertex bijection ${used.size}/24`);
}

// ---- T7 seat laws ---------------------------------------------------------------------------------------------
{
    const footV = V[FOOT_IDX], crownV = V[CROWN_IDX];
    const axisOk = Math.hypot(footV[0], footV[2]) < 1e-12 && Math.hypot(crownV[0], crownV[2]) < 1e-12;
    const footAtDais = Math.abs(footV[1] - PLINTH_H) < 1e-12;
    // THE POINT-DOWN PROOF: the foot oct-point is the LOWEST vertex overall (margin over the lowest other)
    let lowestOther = Infinity, lowestOtherIs = "";
    for (let u = 0; u < V.length; u++) {
        if (u === FOOT_IDX) continue;
        if (V[u][1] < lowestOther) { lowestOther = V[u][1]; lowestOtherIs = `${TYPE[u]}-rank`; }
    }
    const footLowest = footV[1] < lowestOther - 1e-9;
    const footMargin = lowestOther - footV[1];
    // 90-degree symmetry about Y (the 4-fold seat)
    const a = Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    // central inversion (the tcube is centrally symmetric; the dual inherits exactly)
    let invMiss = 0;
    for (const v of V) { const r = sub(SOLID_CENTER, sub(v, SOLID_CENTER)); if (!V.some((q) => dist(q, r) < 1e-6)) invMiss++; }
    const cx = V.reduce((s2, v) => s2 + v[0], 0) / 14;
    const cz = V.reduce((s2, v) => s2 + v[2], 0) / 14;
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    // the four WAIST oct-points: EXACT cardinals, level, equal radii (parent law INHERITED — no snap needed)
    const midY = LIFT;
    // honest waist set: the 4 oct-points that are neither foot nor crown (the two on-axis points)
    const waistPts = OCT_IDX.map((i) => V[i]).filter((p) =>
        !(Math.hypot(p[0], p[2]) < 1e-12));
    const waistLevel = Math.max(...waistPts.map((p) => p[1])) - Math.min(...waistPts.map((p) => p[1]));
    const waistRadius = Math.max(...waistPts.map((p) => Math.hypot(p[0], p[2]))) - Math.min(...waistPts.map((p) => Math.hypot(p[0], p[2])));
    const azOf = (p: V3) => Math.atan2(p[2], p[0]);
    const cardinals = waistPts.length === 4 && waistPts.every((p) =>
        Math.min(Math.abs(azOf(p)), Math.abs(Math.abs(azOf(p)) - Math.PI / 2), Math.abs(Math.abs(azOf(p)) - Math.PI), Math.abs(Math.abs(azOf(p)) - 3 * Math.PI / 2)) < 1e-9);
    // the eight ghost apexes: two exact squares on the SAME diagonal lattice az 45°+90k (4 upper + 4 lower),
    // each upper DIRECTLY ABOVE a lower (vertical stacking — the cuts aligned through the center)
    const upGh = GHOST_IDX.map((i) => V[i]).filter((p) => p[1] > midY);
    const dnGh = GHOST_IDX.map((i) => V[i]).filter((p) => p[1] < midY);
    const levelSpread = (ring: V3[]) => Math.max(...ring.map((p) => p[1])) - Math.min(...ring.map((p) => p[1]));
    const radiusSpread = (ring: V3[]) => {
        const rs = ring.map((p) => Math.hypot(p[0], p[2]));
        return Math.max(...rs) - Math.min(...rs);
    };
    // [probe self-catch: first draft used (az-45deg)*2 — but the 4-fold
    // residues {0,90,180,270}deg doubled land on 180/540deg, which atan2
    // wraps to PI not 0 (the tetrakis 3-fold *3 trick works because its
    // residues triple to 0 mod 360). The 4-fold-correct multiplier is 4.
    // The GEOMETRY was exact all along — stacked/level/radius all green.]
    const onDiagLattice = (ring: V3[]) => ring.length === 4 && ring.every((p) =>
        Math.abs(Math.atan2(Math.sin((azOf(p) - Math.PI / 4) * 4), Math.cos((azOf(p) - Math.PI / 4) * 4))) < 1e-6);
    // vertical stacking: every upper ghost has a lower ghost at the same (x,z)
    const stacked = upGh.every((p) => dnGh.some((q) => Math.hypot(q[0] - p[0], q[2] - p[2]) < 1e-9));
    // set inversion-closed (upper ring's inversion partners all present)
    const invSetOk = upGh.every((p) => {
        const r = sub(SOLID_CENTER, sub(p, SOLID_CENTER));
        return V.some((q) => dist(q, r) < 1e-9);
    });
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
    // bead census: 4 waist oct beads ALOFT + 1 crown finial + 1 PRESSED foot buried in the dais band
    const waistBeads = BEADS.slice(0, 4);
    const allAloft = waistBeads.every((p) => p[1] - BEAD_R > PLINTH_H + 1e-9);
    const pressed = BEADS[PRESSED_IDX];
    const pressedBuried = pressed[1] + BEAD_R <= PLINTH_H + 1e-9 && Math.hypot(pressed[0], pressed[2]) < 1e-12;
    const crownBead = BEADS[CROWN_BEAD_IDX];
    const t7parts = {
        axisOk, footAtDais, footLowest, footMargin: footMargin.toFixed(4), lowestOtherIs,
        symMiss, invMiss, ctr: Math.hypot(cx, cz),
        hgt: height.toFixed(6), reach: (MAX_H + ROD_R).toFixed(3), apothem: apothem.toFixed(3),
        waist: waistPts.length, waistLevel: waistLevel.toExponential(1), waistRadius: waistRadius.toExponential(1), cardinals,
        ghosts: `up ${upGh.length} / dn ${dnGh.length}`,
        upLevel: levelSpread(upGh).toExponential(1), upRadius: radiusSpread(upGh).toExponential(1),
        diagLattice: onDiagLattice(upGh) && onDiagLattice(dnGh), stacked, invSetOk,
        sightY: sightY.toFixed(3), stemH: STEM_H.toFixed(2),
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3), allAloft, pressedBuried,
    };
    check("T7 seat: foot + crown oct-points dead on the axis, foot AT dais top AND the LOWEST VERTEX OVERALL (point-down proof, margin measured); 90-degree symmetry 0 misses (4-fold seat); central inversion exact; centroid on axis; height == target; never overhangs (apothem-first); FOUR waist oct-points at the EXACT cardinals, level, equal radii (parent twist law INHERITED — no snap needed); EIGHT ghost apexes = two exact squares on the SAME diagonal lattice az 45deg+90k (4 upper + 4 lower), each upper DIRECTLY ABOVE a lower (vertical stacking — the cuts aligned through the center), set inversion-closed; beads 4 aloft waist + 1 crown finial + 1 pressed foot buried in the dais band (the parent's own idiom — five read at night, six in truth); FINIAL clears the WORST occluder sight line",
        axisOk && footAtDais && footLowest && symMiss === 0 && invMiss === 0 && Math.hypot(cx, cz) < 1e-12
        && Math.abs(height - TARGET_H) < 1e-9 && MAX_H + ROD_R <= apothem + 1e-9
        && waistPts.length === 4 && waistLevel < 1e-12 && waistRadius < 1e-12 && cardinals
        && upGh.length === 4 && dnGh.length === 4
        && levelSpread(upGh) < 1e-12 && radiusSpread(upGh) < 1e-12
        && onDiagLattice(upGh) && onDiagLattice(dnGh) && stacked && invSetOk
        && allAloft && pressedBuried && Math.hypot(crownBead[0], crownBead[2]) < 1e-12
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; foot oct-point ${footV[1].toFixed(6)} == dais top ${PLINTH_H}, lowest other vertex (${lowestOtherIs}) ${lowestOther.toFixed(6)} — margin ${(lowestOther - footV[1]).toFixed(4)}m; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); waist 4 at cardinals level/radii exact; ghost squares diagonal-lattice, vertically stacked, inversion-closed; stem ${STEM_H.toFixed(2)}m solved against worst occluder sight ${sightY.toFixed(3)}; FINIAL crown bead top ${beadTop.toFixed(3)} clears by ${finialClear.toFixed(3)}m (>= ${(1.5 * BEAD_R).toFixed(3)} law); pressed sixth buried y [${(pressed[1] - BEAD_R).toFixed(2)},${(pressed[1] + BEAD_R).toFixed(2)}] inside dais band [0,${PLINTH_H}]`);
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
    // beads: 4 waist (poked) + 1 pressed foot (buried) + 1 crown finial (stem-lifted)
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

console.log(`solve: tcube rebuilt from closed forms (R ${R_UNIT.toFixed(9)} == sqrt(5-2sqrt2), the deeper cut u ${U_CUT.toFixed(9)} = 1-1/sqrt2); midsphere rho ${rho.toFixed(9)} == sqrt2; dual radii oct ${classR.oct.toFixed(6)} / ghost ${classR.ghost.toFixed(6)}; depths oct ${H_OF.oct.toFixed(6)} / ghost ${H_OF.ghost.toFixed(6)}; scale ${SCALE.toFixed(9)} (height ${TARGET_H})`);
console.log(`seat: OCT-POINT-DOWN 4-fold on the parent's own frame INHERITED (face-down Rx(90°) + cardinals dead-on, NO twist-snap); foot oct-point at dais top ${PLINTH_H} AND the lowest vertex; solid height ${TARGET_H}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} -> ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} >= reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`build: 36 iron seam rods + 24 stone isoceles sails + ${PLINTH_N}-gon stone dais + glow_trioct_6 (4 waist oct beads at cardinals + 1 pressed foot buried + 1 crown finial stem ${STEM_H.toFixed(2)}m)`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct277-trioct)");
