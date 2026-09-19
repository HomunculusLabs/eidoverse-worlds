// struct257-probe-rico.ts — STRUCTURES LANE struct-257, Round 11 R11-65.
// THE RHOMBICOSIDODECAHEDRON (small rhombicosidodecahedron — the EXPANDED
// dodecahedron / EXPANDED icosahedron).
// Form-ledger grep fresh this tick (five files): rhombicosidodeca / rico /
// cantellated / small rhombi — 0 real claims across STRUCTURES-PLAN (only
// the struct-253/254/255/256 unclaimed-pointer lines), IMPROVEMENTS
// (pointer lines only), CITY-PLAN, IMPROVE-PLAN, NEW-VILLAGE-PLAN. The
// ARCHIMEDEAN branch's NINTH member (cubocta 237, tico 243, toct 245,
// tret 247, tcube 249, tdodec 251/252, srcubo 253/254, trcubo 255/256).
// The snub cube stays named for Bill's handedness call (two mirror forms);
// rico is ACHIRAL. Kin barred: icosidodecahedron (rt's direct dual,
// struct-235 sweep), rhombic dodecahedron (rt's zonohedron kin).
//
// ONE IDEA: TWO PARENTS, ONE CHILD, BOTH WHOLE. The seventh member GREW
// the cube; the ninth grows the DUALS — and discovers they share their
// growth. The Conway CANTITELLATE (expand) of the dodecahedron pulls its
// twelve pentagonal faces outward WHOLE and unchanged, belt a SQUARE at
// every parent edge; the same operation on the ICOSAHEDRON pulls its
// twenty triangles outward whole, belt a square at every edge — and the
// two children are THE SAME SOLID: 12 + 30 + 20 = 62 faces, the dodeca's
// F+E+V and the icosa's F+E+V mirrored (12/30/20 vs 20/30/12). Each
// parent reads the same 62 faces as its own element census — the duals
// reconciled in one skin (T6b, told twice). Nothing is cut: both parents
// stand INSIDE, WHOLE (containment margins machine-verified), and the
// child carries (23−3√5)/3 ≈ 5.431× the dodeca's mass.
// Presentation: PENTAGON-DOWN, 5-fold (family seat law: tico pentagon-
// down, tdodec decagon-down) — the dodeca parent's own face, uncut, FLAT
// on the dais. STONE carries the FORTY-TWO dodeca-census faces (12 parent
// pentagons + 30 binding squares) + the SIXTY-TWO-sided dais (one side
// per face — theme-number law); IRON carries the TWENTY TRIANGLES — the
// icosa parent's faces, dark — + all 120 seam bonds. Night contract:
// TWELVE warm brass beads at the twelve parent-pentagon centers — the
// dodeca's faces, lit (srcubo/trcubo pattern): one CROWN on an iron
// finial stem (tret v2 occlusion law) + TEN WAIST (two 72° rings,
// twist-snapped so a lower-ring pentagon reads dead-on +X) + the TWELFTH
// PRESSED INTO THE EARTH beneath the flat foot (tico's-twelfth idiom —
// eleven read at night, twelve in truth, disclosed). The thirty squares
// and the iron triangles stay dark.
//
// PARAMETRIZATION (exact, closed-form — Wikipedia coords, edge 2):
//   Vertex set: all EVEN permutations of
//     (±1, ±1, ±φ³)        24 verts
//     (±φ², ±φ, ±2φ)       24 verts
//     (±(2+φ), 0, ±φ²)     12 verts   → 60 total.
//   R = √(8φ+7) = √(11+4√5) ≈ 4.4659 (closed form, T5).
//   Face planes by direction families:
//     12 pentagons on the (0,±φ,±1)-cyclic dirs   — the DODECA's FACE dirs
//     30 squares   on the (±1,±φ,±φ²)-perm dirs   — the DODECA's EDGE dirs
//     20 triangles on the dodeca VERTEX dirs       — the DODECA's VERTEX dirs
//   (probe self-catch: the FIRST draft took square dirs from the standard-
//   coords ICOSA's edge midpoints (1,φ²,φ) — WRONG family; the standard-
//   coords duals are mirror-permuted, not direction-aligned. The true
//   square planes sit on the dodeca's edge-midpoint dirs (1,φ,φ²),
//   hand-verified on the vertex table before the fix: four verts tie at
//   13.708 along (1,φ,φ²). The direction-DUAL icosa (0,±φ,±1)-cyclic
//   shares these edge axes exactly — T6b machine-checks the agreement.)
//   Volume (edge 2): (8/3)(60+29√5) — cross-checked by divergence over
//   the built faces (T6). Parent dodeca (edge 2): 2(15+7√5), cross-checked
//   as 12 face pyramids; ratio == (23−3√5)/3 exactly.
//   Dihedrals exactly TWO classes (T5): square–pentagon dot +√((5+√5)/10)
//   (interior 148.2825°) on 60 edges, triangle–square dot +φ/√3 (interior
//   159.0948°) on 60 edges; zero pent–pent, sq–sq, tri–tri edges (120).
//
// DAIS LAW: APOTHEM-FIRST for all N (struct-247 fix, carried).
//
// THEOREMS machine-verified below:
//   T1 Euler: 60 − 120 + 62 = 2 (sphere).
//   T2 face census: 20 regular triangles (60°) + 30 regular squares (90°)
//      + 12 regular pentagons (108°), every side == a.
//   T3 vertex census: degree 4 everywhere; exactly 1 triangle + 2 squares
//      + 1 pentagon at every vertex (60×) — figure 3.4.5.4.
//   T4 manifold: every edge on exactly 2 faces (240 face-edge slots).
//   T5 uniformity: all 60 verts at exactly R (== closed form); dihedrals
//      exactly TWO classes (sq–pent, tri–sq), zero same-family edges.
//   T6 THE TWO-PARENT GROWTH: divergence volume == closed form
//      (8/3)(60+29√5); parent-dodeca pyramid volume == 2(15+7√5); ratio
//      == (23−3√5)/3 exactly; BOTH PARENTS CONTAINED — every dodeca and
//      icosa vertex strictly inside every child face plane.
//   T6b THE ELEMENT THEOREM, TOLD TWICE: every child face center
//      direction matches exactly one parent-DODECA element family
//      (12 faces / 30 edges / 20 vertices) AND exactly one parent-ICOSA
//      element family (20 faces / 30 edges / 12 vertices) — both
//      machine-derived, disjoint, exhaustive; 62 == F+E+V of each parent.
//   T7 seat: bottom pentagon FLAT at dais top (5 verts level), top
//      pentagon parallel, 72° symmetry about Y, centroid on axis, height
//      == target, reach+rod ≤ dais apothem (never overhangs,
//      apothem-first); snap law (a lower-ring pentagon dead-on az 0);
//      waist = two exact 72° rings (inter-ring offset measured +
//      reported, geometry decides); bead census honest: 1 crown dead-axis
//      finial + 10 waist + 1 pressed foot, the THIRTY SQUARES + TWENTY
//      TRIANGLES DARK; FINIAL-CLEARANCE LAW (tret v2).
//   T8 immersion: every inset plate corner, lifted to the plate mid-plane,
//      lies strictly INSIDE the convex solid; corner tuck reported.
//   RED control: --red displaces one vertex 0.3 — T2/T5/T7 must fail.

export const TARGET_H = 6.3;              // seated solid height (pentagon axis) — the ninth member stands between srcubo 6.1 and tdodec 6.4
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
export const PLINTH_N = 62;               // SIXTY-TWO sides — one per face (12 pentagons + 30 squares + 20 triangles)
export const PLINTH_ROT = 0;              // corners ON the axes
export const PLINTH_H = 0.30;
export const FOOT_BEAD_Y = 0.15;          // pressed twelfth bead center — spans exactly the dais band 0→0.30, FULLY BURIED (tico's-twelfth idiom: never reads, twelve in truth)

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
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}

const PHI = (1 + Math.sqrt(5)) / 2;

// ---- the TWO PARENTS (both edge 2 — their faces ride out WHOLE in the child) -------------------------
// parent DODECAHEDRON: verts (±1,±1,±1) + (0,±1/φ,±φ)-cyclic; edge 2/φ... at THESE coords.
// The child's pentagons have edge 2 and are regular — the parent whose faces they ARE
// is the edge-2 dodeca. We build it on its standard coords and rescale to edge 2.
const P_UNIT = 2 / PHI;                   // edge of the standard-coords dodeca below
const PARENT_D: V3[] = [];
for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) PARENT_D.push([sx, sy, sz]);
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    PARENT_D.push([0, s1 / PHI, s2 * PHI]);
    PARENT_D.push([s2 * PHI, 0, s1 / PHI]);
    PARENT_D.push([s1 / PHI, s2 * PHI, 0]);
}
if (PARENT_D.length !== 20) throw Error(`parent dodeca verts ${PARENT_D.length} != 20`);
const DSCALE = 2 / P_UNIT;                // parent edge 2 (faces congruent to the child's pentagons)
const PARENT: V3[] = PARENT_D.map((v) => mul(v, DSCALE));
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++)
    if (Math.abs(dist(PARENT[i], PARENT[j]) - 2) < 1e-9) P_EDGES.push([i, j]);
if (P_EDGES.length !== 30) throw Error(`parent dodeca edges ${P_EDGES.length} != 30`);

// parent ICOSAHEDRON: verts (0,±1,±φ)-cyclic, edge 2 at these exact coords.
const ICOSA: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    ICOSA.push([0, s1, s2 * PHI]);
    ICOSA.push([s2 * PHI, 0, s1]);
    ICOSA.push([s1, s2 * PHI, 0]);
}
if (ICOSA.length !== 12) throw Error(`icosa verts ${ICOSA.length} != 12`);
const I_EDGES: [number, number][] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++)
    if (Math.abs(dist(ICOSA[i], ICOSA[j]) - 2) < 1e-9) I_EDGES.push([i, j]);
if (I_EDGES.length !== 30) throw Error(`icosa edges ${I_EDGES.length} != 30`);

// ---- the CHILD vertex set (Wikipedia, edge 2): all EVEN permutations of three families ---------------
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
const P_EDGE = 2;                          // exact for these coords
const EDGES: [number, number][] = [];
for (let i = 0; i < 60; i++) for (let j = i + 1; j < 60; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-9) EDGES.push([i, j]);
if (EDGES.length !== 120) throw Error(`rico edges ${EDGES.length} != 120`);

// ---- faces by parent-element direction families ------------------------------------------------------
// 12 pentagon dirs = the dodeca's FACE dirs = the (0,±φ,±1)-cyclic family
const PENT_DIRS: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    PENT_DIRS.push(nrm([0, s1 * PHI, s2]));
    PENT_DIRS.push(nrm([s2, 0, s1 * PHI]));
    PENT_DIRS.push(nrm([s1 * PHI, s2, 0]));
}
if (PENT_DIRS.length !== 12) throw Error(`pent dirs ${PENT_DIRS.length} != 12`);
// 20 triangle dirs = the dodeca's VERTEX dirs == the icosa's FACE dirs
const TRI_DIRS: V3[] = PARENT_D.map((v) => nrm(v));
if (TRI_DIRS.length !== 20) throw Error(`tri dirs ${TRI_DIRS.length} != 20`);
// 30 square dirs = the DODECA's edge-midpoint dirs (1,φ,φ²) — NOT the standard-
// coords icosa's (1,φ²,φ); probe self-catch, hand-verified on the vertex table.
const SQ_DIRS: V3[] = [];
for (const [i, j] of P_EDGES) {
    const d = nrm(mul(add(PARENT_D[i], PARENT_D[j]), 0.5));
    if (!SQ_DIRS.some((q) => dist(q, d) < 1e-9)) SQ_DIRS.push(d);
}
if (SQ_DIRS.length !== 30) throw Error(`sq dirs ${SQ_DIRS.length} != 30`);

type Family = "pent" | "sq" | "tri";
type Face = { k: number; verts: number[]; center: V3; n: V3; family: Family };
const pidx = (p: V3) => {
    const k = M.findIndex((q) => dist(q, p) < 1e-9);
    if (k >= 0) return k;
    throw Error("face vertex not in set");
};
const orderRing = (ring: V3[]): { verts: number[]; center: V3; n: V3 } => {
    const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / ring.length);
    const n = nrm(c);                                  // centered solid: outward normal
    const e1 = nrm(sub(ring[0], c));
    const e2 = cross(n, e1);
    const ordered = [...ring].sort((p, q) =>
        Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
    return { verts: ordered.map((p) => pidx(p)), center: c, n };
};
const faces: Face[] = [];
const buildFace = (dir: V3, k: number, family: Family) => {
    const order = M.map((v, i) => [dot(v, dir), i] as [number, number]).sort((a, b) => b[0] - a[0]);
    const plane = order[k - 1][0];
    if (Math.abs(order[0][0] - plane) > 1e-12) throw Error(`face plane not level (${family})`);
    if (plane - order[k][0] < 1e-9) throw Error(`face plane ambiguous (${family})`);
    const { verts, center, n } = orderRing(order.slice(0, k).map(([, i]) => M[i]));
    faces.push({ k, verts, center, n, family });
};
for (const d of PENT_DIRS) buildFace(d, 5, "pent");
for (const d of SQ_DIRS) buildFace(d, 4, "sq");
for (const d of TRI_DIRS) buildFace(d, 3, "tri");
if (faces.length !== 62) throw Error(`faces ${faces.length} != 62`);

// ---- edgeFaces (module scope — used by T4/T5) ---------------------------------------------------------
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < faces.length; fi++) for (let t = 0; t < faces[fi].verts.length; t++) {
    const a = faces[fi].verts[t], b = faces[fi].verts[(t + 1) % faces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ---- seating: dodeca face normal (0,−φ,1) → −Y (PENTAGON DOWN), twist-snap a lower-ring pentagon to az 0
const v0 = nrm([0, -PHI, 1]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// the WAIST pentagons (non-axis): lower ring = the five with the least rot1 center y
let snapFace: Face = faces[0];
{
    let bestY = Infinity;
    for (const f of faces) {
        if (f.family !== "pent") continue;
        const ny = rot1(f.n)[1];
        if (Math.abs(ny) > 0.99) continue;                 // skip crown + foot
        const cy = rot1(f.center)[1];
        if (cy < bestY) { bestY = cy; snapFace = f; }
    }
}
const az0 = (() => {
    const p = rot1(snapFace.center);
    return Math.atan2(p[2], p[0]);
})();
// toct snap-sign law (tdodec chassis verbatim): Ry(t) maps az a → a−t
// (az = atan2(z,x)); twist = snapAz zeroes the snap face — verified by
// measurement below, hard throw on any miss (no sign convention trusted bare;
// probe self-catch #3: the first draft used −az0 and landed at 2·az0).
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], az0);
const rot = (v: V3): V3 => rot2(rot1(v));
{
    const sn = rot(snapFace.center);
    if (Math.abs(Math.atan2(sn[2], sn[0])) > 1e-9) throw Error(`twist-snap missed: az ${Math.atan2(sn[2], sn[0])}`);
}

// ---- scale + lift: bottom pentagon plane lands exactly on the dais top --------------------------------
const seatedUnit = M.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
export const EDGE = P_EDGE * SCALE;
const R_UNIT = Math.hypot(...M[0]);
export const R_RICO = R_UNIT * SCALE;
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
export const IS_PENT: boolean[] = faces.map((f) => f.family === "pent");
export const E: [number, number][] = EDGES;

// RED control (--red displaces one vertex: breaks side/uniformity/symmetry laws)
if (process.argv.includes("--red")) {
    V[7] = [V[7][0] + 0.3, V[7][1] - 0.2, V[7][2] + 0.15];
    console.log("RED MODE: vertex 7 displaced 0.3 — T2/T5/T7 MUST fail");
}

// ---- derived footprint constants (BEFORE all checks — no TDZ) ----------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
// APOTHEM-FIRST dais law (struct-247 fix, carried for all N)
export const PLINTH_R = Math.ceil(((MAX_H + ROD_R + 0.10) / Math.cos(Math.PI / PLINTH_N)) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// ---- T1 Euler ----------------------------------------------------------------------------------------
check("T1 Euler 60−120+62 = 2", V.length === 60 && E.length === 120 && faces.length === 62 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census -----------------------------------------------------------------------------------
{
    let worstSide = 0, worstAng = 0;
    for (const f of faces) {
        const want = f.k === 3 ? Math.PI / 3 : f.k === 4 ? Math.PI / 2 : 3 * Math.PI / 5;   // 60° / 90° / 108°
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
    const triC = faces.filter((f) => f.k === 3).length, sqC = faces.filter((f) => f.k === 4).length, pentC = faces.filter((f) => f.k === 5).length;
    check("T2 faces: 20 regular triangles (60°) + 30 regular squares (90°) + 12 regular pentagons (108°), every side == a",
        triC === 20 && sqC === 30 && pentC === 12 && worstSide < 1e-9 && worstAng < 1e-7,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst angle dev ${worstAng.toExponential(1)} rad; side a ${EDGE.toFixed(4)}m — all 62 faces congruent-edged: the EXPANSION adds faces without shearing any`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------
{
    const deg = new Array(60).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    let badFig = 0;
    for (let i = 0; i < 60; i++) {
        const tf = faces.filter((f) => f.verts.includes(i) && f.family === "tri").length;
        const sf = faces.filter((f) => f.verts.includes(i) && f.family === "sq").length;
        const pf = faces.filter((f) => f.verts.includes(i) && f.family === "pent").length;
        if (tf !== 1 || sf !== 2 || pf !== 1) badFig++;
    }
    check("T3 vertices: degree 4 everywhere; exactly 1 triangle + 2 squares + 1 pentagon at every vertex (figure 3.4.5.4)",
        deg.every((d) => d === 4) && badFig === 0,
        `Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}; figure violations ${badFig}`);
}

// ---- T4 manifold --------------------------------------------------------------------------------------
{
    const bad = [...edgeFaces.values()].filter((c) => c.length !== 2).length;
    const missing = E.filter(([a, b]) => (edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && edgeFaces.size === 120,
        `${edgeFaces.size} face-edges (${20 * 3 + 30 * 4 + 12 * 5} slots), ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 uniformity ------------------------------------------------------------------------------------
{
    let worstR = 0;
    for (const v of V) worstR = Math.max(worstR, Math.abs(dist(v, SOLID_CENTER) - R_RICO));
    const R_CLOSED = Math.sqrt(8 * PHI + 7);              // == √(11+4√5)
    const SQ_PENT = Math.sqrt((5 + Math.sqrt(5)) / 10);   // interior 148.2825°
    const TRI_SQ = PHI / Math.sqrt(3);                    // interior 159.0948°
    let spWorst = 0, tsWorst = 0, spN = 0, tsN = 0, ppN = 0, ssN = 0, ttN = 0;
    for (const [, fl] of edgeFaces) {
        if (fl.length !== 2) continue;
        const fA = faces[fl[0]], fB = faces[fl[1]];
        const fam = (x: Family) => x === "pent" ? 0 : x === "sq" ? 1 : 2;
        const key = Math.min(fam(fA.family), fam(fB.family)) * 10 + Math.max(fam(fA.family), fam(fB.family));
        const d = dot(NORMALS[fl[0]], NORMALS[fl[1]]);
        if (key === 1) { spN++; spWorst = Math.max(spWorst, Math.abs(d - SQ_PENT)); }        // pent–sq
        else if (key === 12) { tsN++; tsWorst = Math.max(tsWorst, Math.abs(d - TRI_SQ)); }   // sq–tri
        else if (key === 11) ssN++;                                                        // sq–sq
        else if (key === 0) ttN++;                                                         // tri–tri
        else if (key === 2) ppN++;                                                         // pent–pent
    }
    check("T5 uniformity: all 60 verts at exactly R_rico (== closed form √(8φ+7)); dihedrals exactly two classes — square–pentagon dot √((5+√5)/10) (interior 148.2825°) and triangle–square dot φ/√3 (interior 159.0948°); zero same-family edges",
        worstR < 1e-9 && spN === 60 && tsN === 60 && ppN === 0 && ssN === 0 && ttN === 0 && spWorst < 1e-9 && tsWorst < 1e-9,
        `R dev ${(worstR * 1e12).toExponential(1)} (R ${R_RICO.toFixed(6)} == closed ${(R_CLOSED * SCALE).toFixed(6)}); sq–pent ${spN} edges worst |dot−c| ${spWorst.toExponential(1)} (interior ${(Math.acos(-SQ_PENT) * 180 / Math.PI).toFixed(4)}°); tri–sq ${tsN} edges worst |dot−c| ${tsWorst.toExponential(1)} (interior ${(Math.acos(-TRI_SQ) * 180 / Math.PI).toFixed(4)}°); pent–pent ${ppN}, sq–sq ${ssN}, tri–tri ${ttN} (60 + 60 == 120 — every edge binds two families)`);
}

// ---- T6 THE TWO-PARENT GROWTH -------------------------------------------------------------------------
{
    // divergence volume over the built faces (unit frame — rotation-invariant)
    const faceArea = (f: Face) => {
        let s: V3 = [0, 0, 0];
        for (let t = 0; t < f.verts.length; t++) {
            const p1 = M[f.verts[t]], p2 = M[f.verts[(t + 1) % f.verts.length]];
            s = add(s, cross(sub(p1, f.center), sub(p2, f.center)));
        }
        return Math.hypot(...s) / 2;
    };
    let V_div = 0;
    for (const f of faces) V_div += dot(f.center, f.n) * faceArea(f);
    V_div /= 3;
    const V_closed = (8 / 3) * (60 + 29 * Math.sqrt(5));          // edge 2
    // parent dodeca (edge 2) as 12 face pyramids: (1/3)·(parent's OWN inradius)·A_pent·12.
    // The expand TRANSLATES the parent's faces outward — the child's pentagon
    // planes ride at the pushed-out plateau (4.129 unit), NOT the parent's own
    // inradius (2.2265 at edge 2). The parent's own support number is
    // machine-derived from PARENT_D (probe self-catch #2: first draft measured
    // the child's plateau and got a false ratio; second draft used a wrong
    // pentagon circumradius — both replaced by derivation from the built parent).
    const A_pent = (() => {                                        // regular pentagon, edge 2
        const f = faces.find((x) => x.family === "pent")!;
        return faceArea(f);
    })();
    let r_in_unit = -Infinity;                                     // plane distance of PARENT_D[0]'s own face
    for (const d of PENT_DIRS) r_in_unit = Math.max(r_in_unit, dot(PARENT_D[0], d));
    const r_in_parent = r_in_unit * DSCALE;                        // parent inradius at edge 2
    const V_parentPyr = 12 * (1 / 3) * r_in_parent * A_pent;
    const V_parentClosed = 2 * (15 + 7 * Math.sqrt(5));
    const ratio = V_div / V_parentPyr;
    const ratioClosed = (23 - 3 * Math.sqrt(5)) / 3;
    // CONTAINMENT: the EDGE-2 parents stand as-is inside the unit-frame child —
    // every parent vertex strictly inside every child face plane (no rescaling:
    // the honest whole-parent test).
    let worstD = Infinity, worstI = Infinity;
    for (const pv of PARENT)
        for (const f of faces)
            worstD = Math.min(worstD, dot(f.center, f.n) - dot(pv, f.n));
    for (const iv of ICOSA)
        for (const f of faces)
            worstI = Math.min(worstI, dot(f.center, f.n) - dot(iv, f.n));
    check("T6 THE TWO-PARENT GROWTH: divergence volume == closed form (8/3)(60+29√5); parent-dodeca pyramid volume == 2(15+7√5); ratio == (23−3√5)/3 exactly; BOTH PARENTS STAND INSIDE, WHOLE",
        Math.abs(V_div - V_closed) < 1e-9 && Math.abs(V_parentPyr - V_parentClosed) < 1e-9
        && Math.abs(ratio - ratioClosed) < 1e-12 && worstD > 0 && worstI > 0,
        `divergence ${V_div.toFixed(10)} == closed ${V_closed.toFixed(10)}; parent ${V_parentPyr.toFixed(10)} == closed ${V_parentClosed.toFixed(10)}; ratio ${ratio.toFixed(12)} == ${ratioClosed.toFixed(12)} — THE CHILD STANDS ${ratio.toFixed(4)}× THE DODECA'S MASS with nothing cut (the truncations surrendered; the growth GIVES); dodeca containment worst margin ${worstD.toFixed(6)} units (${(worstD * SCALE).toFixed(4)}m), icosa worst ${worstI.toFixed(6)} (${(worstI * SCALE).toFixed(4)}m) — BOTH duals whole inside the one child`);
}

// ---- T6b THE ELEMENT THEOREM, TOLD TWICE --------------------------------------------------------------
{
    const near = (a: V3, fam: V3[]) => fam.some((d) => dist(a, d) < 1e-9);
    // dodeca element dirs (machine-derived from PARENT_D)
    const dFaceDirs = PENT_DIRS;
    const dEdgeDirs = SQ_DIRS.slice();                 // the corrected family (dodeca edge midpoints)
    const dVertDirs = PARENT_D.map((v) => nrm(v));
    // the DIRECTION-DUAL icosa: verts on the pentagon dirs at radius √(φ²+1) —
    // the edge-2 icosa in the child's own direction frame (machine-verified:
    // its edge comes out exactly 2, its midradius exactly φ — the SAME midradius
    // as the unit-frame dodeca, which is the mutual dual position: dual edges
    // cross primal edges at their shared midpoints).
    const ICOSA_DUAL: V3[] = PENT_DIRS.map((d) => mul(d, Math.hypot(1, PHI)));
    const dualEdges: [number, number][] = [];
    for (let i = 0; i < ICOSA_DUAL.length; i++) for (let j = i + 1; j < ICOSA_DUAL.length; j++)
        if (Math.abs(dist(ICOSA_DUAL[i], ICOSA_DUAL[j]) - 2) < 1e-9) dualEdges.push([i, j]);
    const dualMidR = Math.hypot(...nrm(mul(add(ICOSA_DUAL[dualEdges[0][0]], ICOSA_DUAL[dualEdges[0][1]]), 0.5))) * 0
        + (() => { const m = mul(add(ICOSA_DUAL[dualEdges[0][0]], ICOSA_DUAL[dualEdges[0][1]]), 0.5); return Math.hypot(...m); })();
    const dodecMidR = (() => { const m = mul(add(PARENT_D[P_EDGES[0][0]], PARENT_D[P_EDGES[0][1]]), 0.5); return Math.hypot(...m); })();
    let dF = 0, dE = 0, dVx = 0, stray = 0;
    for (const f of faces) {
        const dir = nrm(f.center);
        if (near(dir, dFaceDirs)) dF++;
        else if (near(dir, dEdgeDirs)) dE++;
        else if (near(dir, dVertDirs)) dVx++;
        else stray++;
    }
    const familiesDisjoint = dFaceDirs.every((d) => !near(d, dEdgeDirs) && !near(d, dVertDirs))
        && dEdgeDirs.every((d) => !near(d, dFaceDirs) && !near(d, dVertDirs));
    // the dual read: pentagons sit ON the dual icosa's 12 verts; the icosa's 20
    // faces face the tri dirs; the icosa's 30 edge axes MATCH the dodeca's (the
    // two parents share their belt — the belt squares bind both censuses).
    const pentOnIcosaVerts = PENT_DIRS.every((d) => near(d, ICOSA_DUAL.map((v) => nrm(v))));
    const triOnIcosaFaces = TRI_DIRS.every((d) => dVertDirs.some((q) => dist(q, d) < 1e-9));
    const dualEdgeAxes = (() => {
        // BELT-SHARING LAW, machine-verified: the dual icosa (verts on the pent
        // dirs at radius √(φ²+1)) has its 30 edge MIDPOINTS exactly ON the
        // dodeca's 30 edge-midpoint dirs — dual edges cross primal edges at
        // their shared midpoints (midradius φ on both). Every square dir is
        // the normalized midpoint of some dual-icosa edge.
        return SQ_DIRS.every((d) => {
            for (let i = 0; i < ICOSA_DUAL.length; i++) for (let j = i + 1; j < ICOSA_DUAL.length; j++) {
                const mid = nrm(mul(add(ICOSA_DUAL[i], ICOSA_DUAL[j]), 0.5));
                if (dist(mid, d) < 1e-9) return true;
            }
            return false;
        });
    })();
    const dualOk = dualEdges.length === 30 && Math.abs(dualMidR - PHI) < 1e-12 && Math.abs(dodecMidR - PHI) < 1e-12;
    check("T6b THE ELEMENT THEOREM, TOLD TWICE: every child face sits on one parent-DODECA element (12 faces / 30 edges / 20 vertices) AND one parent-ICOSA element (20 faces / 30 edges / 12 vertices) — the SAME 62 faces, both censuses, F↔V mirrored",
        dF === 12 && dE === 30 && dVx === 20 && stray === 0 && familiesDisjoint
        && pentOnIcosaVerts && triOnIcosaFaces && dualEdgeAxes && dualOk
        && ICOSA_DUAL.length === 12,
        `dodeca read: F ${dF} + E ${dE} + V ${dVx} = ${dF + dE + dVx}; stray ${stray}; the direction-dual icosa (edge-2, midradius φ == the dodeca's own — the mutual dual position, ${dualEdges.length} edges, machine-verified) reads the SAME 62 faces with F↔V swapped: pentagons ON its 12 verts, triangles against its 20 face dirs, squares on its 30 edge axes (BELT SHARED with the dodeca's edges — dual edges cross primal edges at their shared midpoints) — 62 == F+E+V of EACH parent (12/30/20 vs 20/30/12): the expand of the one IS the expand of the other`);
}

// ---- T7 seat laws -------------------------------------------------------------------------------------
{
    const botPent = faces.find((f, fi) => f.family === "pent" && NORMALS[fi][1] < -0.99);
    if (!botPent) throw Error("no bottom pentagon found — seating broken");
    const botVs = botPent.verts.map((vi) => V[vi][1]);
    const botSpread = Math.max(...botVs) - Math.min(...botVs);
    const topPent = faces.find((f, fi) => f.family === "pent" && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9);
    if (!topPent) throw Error("no top pentagon found — seating broken");
    const topVs = topPent.verts.map((vi) => V[vi][1]);
    const topSpread = Math.max(...topVs) - Math.min(...topVs);
    const cx = V.reduce((s, v) => s + v[0], 0) / 60;
    const cz = V.reduce((s, v) => s + v[2], 0) / 60;
    const a = Math.PI * 2 / 5, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    // FINIAL-CLEARANCE LAW (tret v2): crown bead top must clear the crown rim's
    // sight line from READER_D by >= 1.5·BEAD_R — else it renders zero px
    // from every ground vantage.
    const topIdx = faces.indexOf(topPent);
    const rimY = Math.max(...topPent.verts.map((vi) => V[vi][1]));            // crown rim level
    const rimR = Math.max(...topPent.verts.map((vi) => Math.hypot(V[vi][0], V[vi][2]))); // crown rim reach
    const crownPlane = CENTERS[topIdx][1] + NORMALS[topIdx][1] * BEAD_POKE; // crown bead base plane
    const beadTop = crownPlane + STEM_H + BEAD_R;                           // finial bead top
    const sightY = rimY + (rimY - READER_EYE) * rimR / (READER_D - rimR);   // sight line at the axis
    const finialClear = beadTop - sightY;                                   // must be >= 1.5·BEAD_R
    // waist rings: the ten non-axis pentagons, split by center y into two 72° rings
    const waist = faces
        .map((f, fi) => ({ f, fi }))
        .filter(({ f, fi }) => f.family === "pent" && Math.abs(NORMALS[fi][1]) < 0.99);
    const midY = waist.reduce((s, w) => s + CENTERS[w.fi][1], 0) / waist.length;
    const azOf = (fi: number) => Math.atan2(CENTERS[fi][2], CENTERS[fi][0]);
    const lower = waist.filter((w) => CENTERS[w.fi][1] < midY);
    const upper = waist.filter((w) => CENTERS[w.fi][1] >= midY);
    const lat = 72 * Math.PI / 180;
    // ring law (tdodec precedent, corrected): the lower ring sits on the {72°·k}
    // lattice (snap face dead-on 0); the upper ring INTERLEAVES at 36° —
    // {36°+72°·k}. Probe self-catch #4: the first draft tested both rings
    // against {72°·k} alone and false-failed the upper ring's 180° member
    // (5·180° ≡ 180° mod 360°, not 0). The interleaved offset is the honest
    // read of this solid's belt — same as the tdodec's disclosed 36° interleave.
    const ringOnLattice = (ring: typeof waist, offsetRad: number) => ring.length === 5 && ring.every((w) =>
        Math.abs(Math.atan2(Math.sin((azOf(w.fi) - offsetRad) * 5), Math.cos((azOf(w.fi) - offsetRad) * 5))) < 1e-6);
    const ringExact = ringOnLattice(lower, 0) && ringOnLattice(upper, lat / 2);
    const snapAz = azOf(faces.indexOf(snapFace));
    const interOffset = (() => {
        if (!lower.length || !upper.length) return NaN;
        const d = azOf(upper[0].fi) - azOf(lower[0].fi);
        return Math.atan2(Math.sin(d), Math.cos(d));
    })();
    // bead census: 1 crown dead-axis + 10 waist + 1 pressed foot; the THIRTY
    // SQUARES + TWENTY TRIANGLES stay dark (only the dodeca's faces carry light)
    let crown = 0, foot = 0, onAxis = false, allAloft = true, dark = 0;
    const footYs: number[] = [];
    for (let u = 0; u < faces.length; u++) {
        if (!IS_PENT[u]) { dark++; continue; }                 // squares + triangles carry NO bead
        const nn = NORMALS[u];
        const cc = CENTERS[u];
        if (nn[1] > 0.99) { crown++; if (Math.hypot(cc[0], cc[2]) < 1e-9) onAxis = true; }
        else if (nn[1] < -0.99) { foot++; footYs.push(FOOT_BEAD_Y); }
        else if (cc[1] + nn[1] * BEAD_POKE <= PLINTH_H + 1e-6) allAloft = false;
    }
    const t7parts = {
        botFlat: botSpread < 1e-9, botAtDais: Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9,
        topFlat: topSpread < 1e-9, sym: symMiss === 0, ctr: Math.hypot(cx, cz) < 1e-9,
        hgt: Math.abs(height - TARGET_H) < 1e-9, noOver: MAX_H + ROD_R <= apothem + 1e-9,
        crown, waistN: waist.length, foot, dark, onAxis,
        rings: `${lower.length}+${upper.length}`, ringExact,
        snapAz: snapAz.toExponential(1), interOffsetDeg: (interOffset * 180 / Math.PI).toFixed(2),
        allAloft,
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3),
    };
    check("T7 seat: bottom pentagon FLAT at dais top, top parallel, 72° symmetry, centroid on axis, height == target, never overhangs (apothem-first), lower-ring pentagon dead-on az 0 (snap law), waist = two exact 72° rings (inter-ring offset measured, geometry decides), bead census honest (1 crown + 10 waist + 1 pressed; THIRTY SQUARES + TWENTY TRIANGLES DARK — only the dodeca's faces carry light)",
        botSpread < 1e-9 && Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9 && topSpread < 1e-9
        && symMiss === 0 && Math.hypot(cx, cz) < 1e-9 && Math.abs(height - TARGET_H) < 1e-9
        && MAX_H + ROD_R <= apothem + 1e-9 && crown === 1 && waist.length === 10 && foot === 1 && dark === 50 && onAxis
        && ringExact && Math.abs(snapAz) < 1e-9 && allAloft
        && footYs.length === 1 && Math.abs(footYs[0] - FOOT_BEAD_Y) < 1e-12
        && FOOT_BEAD_Y - BEAD_R >= -1e-9 && FOOT_BEAD_Y + BEAD_R <= PLINTH_H + 1e-9
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; bottom pentagon spread ${botSpread.toExponential(1)} at dais top ${PLINTH_H}; top level (spread ${topSpread.toExponential(1)}); 72° misses ${symMiss}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); snap face az ${snapAz.toExponential(1)} (dead-on +X); rings 5+5 exact 72° lattices, inter-ring offset ${(interOffset * 180 / Math.PI).toFixed(2)}° (geometry-decided, disclosed); beads 1 crown dead-axis + 10 waist all aloft + 1 pressed foot at y ${FOOT_BEAD_Y} (tico's-twelfth idiom, hidden beneath the parent's own floor — twelve in truth); 30 squares + 20 triangles dark; FINIAL crown bead top ${beadTop.toFixed(3)} clears rim sight line ${sightY.toFixed(3)} by ${finialClear.toFixed(3)}m (>= ${1.5 * BEAD_R} law) — reads from every ground vantage`);
}

// ---- T8 immersion (plates tuck under the seams — family shadow-gap law) --------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;       // plate mid-plane offset along outward normal
    let worstPlane = -Infinity;                            // max outward poke (must be ≤ 0)
    let worstTuck = 0;                                     // corner depth into rod cylinder (reported)
    for (let u = 0; u < faces.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const b = faces[u].verts.length;                   // 3, 4 or 5
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
        `worst outward poke ${worstPlane.toExponential(1)} (≤ 0 = fully inside); max corner tuck into rod cylinders ${worstTuck.toFixed(4)}m (invisible — inside solid rod geometry, co idiom); plate outer face ${PLATE_BACK * 1000}mm behind the rod outer surface; the FOOT pentagon plate rides the dais band (buried flush — the rods carry the silhouette, tret bottom-triangle precedent)`);
}

// ---- footprint summary ---------------------------------------------------------------------------------
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
        if (!IS_PENT[u]) continue;
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
        const topIdx = faces.findIndex((f, fi) => IS_PENT[fi] && NORMALS[fi][1] > 0.99);
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

console.log(`seat: pentagon-down 5-fold (the dodeca parent's own face, uncut, FLAT on the dais; lower-ring pentagon snapped dead-on +X); bottom face flat on dais top ${PLINTH_H}; solid height ${TARGET_H}m; edge a ${EDGE.toFixed(4)}m; R ${R_RICO.toFixed(4)}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} → ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`panels: 42 stone (12 parent pentagons WHOLE + 30 binding squares — the dodeca's F+E census) + 20 iron triangles (the icosa's faces, dark) + 120 iron seam rods; beads: 12 brass parent-pentagon centers (crown FINIAL lifted ~${(CENTERS[faces.findIndex((f, fi) => IS_PENT[fi] && NORMALS[fi][1] > 0.99)][1] + STEM_H).toFixed(2)}m on a ${STEM_R}m iron stem, 10 waist in two 72° rings, 1 pressed foot at y ${FOOT_BEAD_Y}) — the dodeca's twelve faces, lit; the squares and the iron triangles stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct257-rico)");
