// struct253-probe-srcubo.ts — STRUCTURES LANE struct-253, Round 11 R11-63.
// THE RHOMBICUBOCTAHEDRON (small rhombicuboctahedron — the EXPANDED cube).
// Form-ledger grep fresh this tick: rhombicubocta / srcubo / small rhombi —
// 0 real mentions across STRUCTURES-PLAN (only the struct-249/250/252
// unclaimed-pointer lines naming the sweep), IMPROVEMENTS, CITY-PLAN,
// IMPROVE-PLAN, NEW-VILLAGE-PLAN, DRESSING-PLAN. The ARCHIMEDEAN branch's
// SEVENTH member (cubocta struct-237, tico 243, toct 245, tret 247, tcube
// 249, tdodec 251/252). Selection over the also-unclaimed snub cube: srcubo
// is ACHIRAL (no handedness decision owed to Bill), keeps the family's
// axis-aligned 4-fold seat law exactly, and reads calmer at 26 faces
// against Bill's R11 density note (the snub's 32 triangles read busier);
// truncated cubocta + snub stay named for later sweeps.
//
// ONE IDEA: NOTHING CUT — EVERYTHING GROWN. Five members took from their
// parents (tret/toct/tico/tcube/tdodec surrendered 24–76%); the seventh
// GIVES. The Conway EXPAND of the cube: pull the six faces outward, WHOLE
// and unchanged, and grow a belt — at every parent EDGE a new square, at
// every parent VERTEX a new triangle. Every element of the parent becomes
// a face of the child: 6 faces + 12 edges + 8 vertices = 26 (T6b). The
// parent cube stands INSIDE, WHOLE — its eight corners clear of even the
// nearest grown face by 0.817 units (T6) — and the child carries exactly
// 4 + 10√2/3 ≈ 8.714× the parent's mass: the branch's first growth.
// Presentation: SQUARE-DOWN, 4-fold — the parent's own face, uncut, FLAT
// on the dais. IDENTITY SEAT: the standard coordinates are already
// square-down with the four axis squares dead on the cardinals — verified
// by measurement with hard throws, no rotation and no twist applied.
// STONE carries the eighteen SQUARES (the six parent faces, whole + the
// twelve edge belts) + the TWENTY-SIX-sided dais (one side per face,
// 18+8 — theme-number law); IRON carries the eight TRIANGLES — the grown
// ghosts of the parent's corners, dark: the family's dark triangles now
// mean GROWTH, not loss — + all 48 seam bonds. Night contract: six warm
// brass beads at the six PARENT squares — the parent's faces, lit (tcube
// v1 pattern, same 6-face parent): one CROWN on an iron finial stem (tret
// v2 occlusion law) + four WAIST at the exact cardinals + the SIXTH
// PRESSED INTO THE EARTH beneath the flat foot (tico's-twelfth idiom —
// five read at night, six in truth, disclosed). The twelve belt squares
// and the iron corners stay dark.
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   Vertex set: all permutations of (±1, ±1, ±(1+√2)) — 24 verts, edge 2.
//   R = √(5+2√2) (closed form, T5). Faces by direction families:
//     6 axis squares   on (±1,0,0)/(0,±1,0)/(0,0,±1)   — the parent's FACES
//     12 belt squares  on (±1,±1,0)-cyclic normalized  — the parent's EDGES
//     8 triangles      on (±1,±1,±1)/√3                — the parent's VERTICES
//   All face planes at their own distances (axis/belt squares at 1+√2,
//   triangles at (3+√2)/√3 — the triangles stand proudest).
//   Dihedrals exactly TWO classes (T5): square–square dot 1/√2 (interior
//   135°, 24 edges) and square–triangle dot 2/√6 (interior 144.7356°, 24
//   edges); zero triangle–triangle, zero axis–axis edges.
//   Volume (edge 2): (16/3)(6+5√2) = 32 + (80/3)√2 ≈ 69.7124, cross-checked
//   two independent ways (T6): divergence over the built faces and the
//   closed form; parent cube V = 8; ratio 4 + 10√2/3.
//
// DAIS LAW: APOTHEM-FIRST for all N (struct-247 fix, carried).
//
// THEOREMS machine-verified below:
//   T1 Euler: 24 − 48 + 26 = 2 (sphere).
//   T2 face census: 8 regular triangles (60°) + 18 regular squares (90°),
//      every side == a.
//   T3 vertex census: degree 4 everywhere; exactly 1 triangle + 3 squares
//      at every vertex (24×) — figure 3.4.4.4.
//   T4 manifold: every edge on exactly 2 faces (96 face-edge slots).
//   T5 uniformity: all 24 verts at exactly R (== closed form); dihedrals
//      exactly TWO classes — sq–sq dot == 1/√2 (interior 135°) on 24
//      edges, sq–tri dot == 2/√6 (interior 144.7356°) on 24 edges; zero
//      tri–tri, zero axis–axis edges (48 total).
//   T6 THE FIRST GROWTH: divergence volume == closed form == parent +
//      belts; ratio == 4 + 10√2/3 exactly; PARENT CONTAINMENT — all eight
//      parent verts strictly inside every face plane (worst margin
//      reported; the cube stands whole inside its own expansion).
//   T6b THE ELEMENT THEOREM: every child face center direction matches
//      exactly one parent element family — 6 on the parent's face dirs,
//      12 on its edge dirs, 8 on its vertex dirs; families disjoint and
//      exhaustive (6+12+8 = 26 = F+E+V of the parent; the expand
//      operator, machine-matched).
//   T7 seat: bottom square FLAT at dais top (4 verts level), top square
//      parallel, 90° symmetry about Y, centroid on axis, height ==
//      target, reach+rod ≤ dais apothem (never overhangs, apothem-first);
//      waist bead azimuths exact cardinals (identity seat); bead census
//      honest: 1 crown dead-axis finial + 4 waist + 1 pressed foot, the
//      TWELVE BELT SQUARES DARK (only the parent's own faces carry
//      light); FINIAL-CLEARANCE LAW (tret v2): crown bead top clears the
//      crown rim sight line from READER_D by ≥ 1.5·BEAD_R.
//   T8 immersion: every inset plate corner, lifted to the plate mid-plane,
//      lies strictly INSIDE the convex solid (no face-plane poke-through);
//      corner tuck into the rod cylinders reported.
//   RED control: --red displaces one vertex 0.3 — T2/T5/T7 must fail.

export const TARGET_H = 6.1;              // seated solid height (4-fold square axis) — the seventh member stands between tcube 5.9 and tdodec 6.4
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
export const PLINTH_N = 26;               // TWENTY-SIX sides — one per face (18 squares + 8 triangles)
export const PLINTH_ROT = 0;              // corners ON the axes
export const PLINTH_H = 0.30;
export const FOOT_BEAD_Y = 0.15;          // pressed sixth bead center — spans exactly the dais band 0→0.30, FULLY BURIED (tico's-twelfth idiom: never reads, six in truth)

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

// ---- parent cube (edge 2) and the EXPANDED vertex set ------------------------------------------------
const B = 1 + Math.sqrt(2);                       // the big coordinate
const PARENT: V3[] = [];
for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) PARENT.push([sx, sy, sz]);
if (PARENT.length !== 8) throw Error(`parent verts ${PARENT.length} != 8`);
const M: V3[] = [];
for (let slot = 0; slot < 3; slot++)
    for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) {
        const v: V3 = [sx, sy, sz];
        v[slot] = (slot === 0 ? sx : slot === 1 ? sy : sz) * B;
        M.push(v);
    }
if (M.length !== 24) throw Error(`srcubo verts ${M.length} != 24`);
const P_EDGE = 2;                                 // exact for these coords
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++)
    if (Math.abs(dist(PARENT[i], PARENT[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 12) throw Error(`parent edges ${P_EDGES.length} != 12`);
const EDGES: [number, number][] = [];
for (let i = 0; i < 24; i++) for (let j = i + 1; j < 24; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-9) EDGES.push([i, j]);
if (EDGES.length !== 48) throw Error(`srcubo edges ${EDGES.length} != 48`);

// ---- faces by parent-element direction families -------------------------------------------------------
const AXIS_DIRS: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const BELT_DIRS: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    BELT_DIRS.push(nrm([s1, s2, 0]));
    BELT_DIRS.push(nrm([s1, 0, s2]));
    BELT_DIRS.push(nrm([0, s1, s2]));
}
if (BELT_DIRS.length !== 12) throw Error(`belt dirs ${BELT_DIRS.length} != 12`);
const TRI_DIRS: V3[] = PARENT.map((v) => nrm(v));
if (TRI_DIRS.length !== 8) throw Error(`tri dirs ${TRI_DIRS.length} != 8`);

type Family = "axis" | "belt" | "tri";
type Face = { k: number; verts: number[]; center: V3; n: V3; isTri: boolean; family: Family };
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
    if (Math.abs(order[0][0] - plane) > 1e-12) throw Error("face plane not level");
    if (plane - order[k][0] < 1e-9) throw Error("face plane ambiguous");
    const { verts, center, n } = orderRing(order.slice(0, k).map(([, i]) => M[i]));
    faces.push({ k, verts, center, n, isTri: k === 3, family });
};
for (const d of AXIS_DIRS) buildFace(d, 4, "axis");
for (const d of BELT_DIRS) buildFace(d, 4, "belt");
for (const d of TRI_DIRS) buildFace(d, 3, "tri");
if (faces.length !== 26) throw Error(`faces ${faces.length} != 26`);

// ---- edgeFaces (module scope — used by T4/T5) ---------------------------------------------------------
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < faces.length; fi++) for (let t = 0; t < faces[fi].verts.length; t++) {
    const a = faces[fi].verts[t], b = faces[fi].verts[(t + 1) % faces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ---- seating: IDENTITY (square-down 4-fold, belt squares dead on cardinals) --------------------------
// The standard coordinates already sit square-down with the four axis
// squares facing the exact cardinals — no rotation, no twist. The checks
// below MEASURE this and hard-throw on any miss (no convention trusted
// bare; the same discipline as the toct twist-snap, one gesture simpler).
const rot = (v: V3): V3 => v;
const rot1 = rot;
{
    const bot = faces.find((f) => f.family === "axis" && Math.abs(f.n[1] + 1) < 1e-12);
    if (!bot) throw Error("no bottom axis square — seat broken");
    const ys = bot.verts.map((vi) => rot1(M[vi])[1]);
    if (Math.max(...ys) - Math.min(...ys) > 1e-12) throw Error("bottom square not level");
    const waistAz = faces.filter((f) => f.family === "axis" && Math.abs(f.n[1]) < 1e-12)
        .map((f) => Math.atan2(rot1(f.center)[2], rot1(f.center)[0]));
    if (waistAz.length !== 4) throw Error(`waist axis squares ${waistAz.length} != 4`);
    for (const az of waistAz)
        if (Math.min(...[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((c) => Math.abs(Math.atan2(Math.sin(az - c), Math.cos(az - c))))) > 1e-12)
            throw Error(`waist azimuth off cardinal: ${az}`);
}

// ---- scale + lift: bottom square plane lands exactly on the dais top ----------------------------------
const seatedUnit = M.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
export const EDGE = P_EDGE * SCALE;
const R_UNIT = Math.hypot(...M[0]);
export const R_SRCO = R_UNIT * SCALE;
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

// ---- derived footprint constants (BEFORE all checks — no TDZ) ----------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
// APOTHEM-FIRST dais law (struct-247 fix, carried for all N)
export const PLINTH_R = Math.ceil(((MAX_H + ROD_R + 0.10) / Math.cos(Math.PI / PLINTH_N)) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// ---- T1 Euler ----------------------------------------------------------------------------------------
check("T1 Euler 24−48+26 = 2", V.length === 24 && E.length === 48 && faces.length === 26 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census -----------------------------------------------------------------------------------
{
    let worstSide = 0, worstAng = 0;
    for (const f of faces) {
        const want = f.k === 3 ? Math.PI / 3 : Math.PI / 2;       // 60° / 90°
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
    const triC = faces.filter((f) => f.k === 3).length, sqC = faces.filter((f) => f.k === 4).length;
    check("T2 faces: 8 regular triangles (60°) + 18 regular squares (90°), every side == a",
        triC === 8 && sqC === 18 && worstSide < 1e-9 && worstAng < 1e-7,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst angle dev ${worstAng.toExponential(1)} rad; side a ${EDGE.toFixed(4)}m — all 26 faces congruent-edged: the EXPANSION adds faces without shearing any`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------
{
    const deg = new Array(24).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    let badFig = 0;
    for (let i = 0; i < 24; i++) {
        const tf = faces.filter((f) => f.verts.includes(i) && f.isTri).length;
        const sf = faces.filter((f) => f.verts.includes(i) && !f.isTri).length;
        if (tf !== 1 || sf !== 3) badFig++;
    }
    check("T3 vertices: degree 4 everywhere; exactly 1 triangle + 3 squares at every vertex (figure 3.4.4.4)",
        deg.every((d) => d === 4) && badFig === 0,
        `Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}; figure violations ${badFig}`);
}

// ---- T4 manifold --------------------------------------------------------------------------------------
{
    const bad = [...edgeFaces.values()].filter((c) => c.length !== 2).length;
    const missing = E.filter(([a, b]) => (edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && edgeFaces.size === 48,
        `${edgeFaces.size} face-edges (${18 * 4 + 8 * 3} slots), ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 uniformity ------------------------------------------------------------------------------------
{
    let worstR = 0;
    for (const v of V) worstR = Math.max(worstR, Math.abs(dist(v, SOLID_CENTER) - R_SRCO));
    const R_CLOSED = Math.sqrt(5 + 2 * Math.sqrt(2));
    const SQ_SQ = 1 / Math.SQRT2;                    // interior 135°
    const SQ_TRI = 2 / Math.sqrt(6);                 // interior 144.7356°
    let ssWorst = 0, stWorst = 0, ssN = 0, stN = 0, ttN = 0, aaN = 0;
    for (const [, fl] of edgeFaces) {
        if (fl.length !== 2) continue;
        const fA = faces[fl[0]], fB = faces[fl[1]];
        const d = dot(NORMALS[fl[0]], NORMALS[fl[1]]);
        if (fA.family === "tri" && fB.family === "tri") ttN++;
        else if (fA.family === "tri" || fB.family === "tri") {
            stN++; stWorst = Math.max(stWorst, Math.abs(d - SQ_TRI));
            if (fA.family === "axis" && fB.family === "axis") aaN++;
        } else {
            ssN++; ssWorst = Math.max(ssWorst, Math.abs(d - SQ_SQ));
            if (fA.family === "axis" && fB.family === "axis") aaN++;
        }
    }
    check("T5 uniformity: all 24 verts at exactly R_srcubo (== closed form √(5+2√2)); dihedrals exactly two classes — square–square dot 1/√2 (interior 135°) and square–triangle dot 2/√6 (interior 144.7356°); zero triangle–triangle, zero axis–axis edges",
        worstR < 1e-9 && ssN === 24 && stN === 24 && ttN === 0 && aaN === 0 && ssWorst < 1e-9 && stWorst < 1e-9,
        `R dev ${(worstR * 1e12).toExponential(1)} (R ${R_SRCO.toFixed(6)} == closed ${(R_CLOSED * SCALE).toFixed(6)}); sq–sq ${ssN} edges worst |dot−1/√2| ${ssWorst.toExponential(1)} (interior 135°); sq–tri ${stN} edges worst |dot−2/√6| ${stWorst.toExponential(1)} (interior ${(Math.acos(-SQ_TRI) * 180 / Math.PI).toFixed(4)}°); tri–tri ${ttN}, axis–axis ${aaN} (no two grown corners share a wall; 24 + 24 == 48)`);
}

// ---- T6 THE FIRST GROWTH ------------------------------------------------------------------------------
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
    const V_closed = (16 / 3) * (6 + 5 * Math.sqrt(2));       // (2/3)(6+5√2)a³ at a=2
    const V_parent = 8;                                        // the parent cube, edge 2
    const ratio = V_div / V_parent;
    const ratioClosed = 4 + (10 / 3) * Math.sqrt(2);
    // PARENT CONTAINMENT: every parent vertex strictly inside every face plane
    let worstMargin = Infinity;
    for (const pv of PARENT)
        for (const f of faces)
            worstMargin = Math.min(worstMargin, dot(f.center, f.n) - dot(pv, f.n));
    check("T6 THE FIRST GROWTH: divergence volume == closed form (16/3)(6+5√2); ratio == 4 + 10√2/3 exactly; the PARENT CUBE STANDS INSIDE, WHOLE (all 8 verts strictly inside all 26 face planes)",
        Math.abs(V_div - V_closed) < 1e-12 && Math.abs(ratio - ratioClosed) < 1e-12 && worstMargin > 0,
        `divergence ${V_div.toFixed(10)} == closed ${V_closed.toFixed(10)}; parent ${V_parent}; ratio ${ratio.toFixed(12)} == ${ratioClosed.toFixed(12)} — THE CHILD STANDS ${(ratio).toFixed(4)}× THE PARENT'S MASS (the five truncations surrendered 24–76%; the expansion GIVES ~7.7× over); parent containment worst margin ${worstMargin.toFixed(6)} units (${(worstMargin * SCALE).toFixed(4)}m scaled — the cube whole inside its own expansion, corners ${(worstMargin * SCALE).toFixed(2)}m clear of the nearest grown face)`);
}

// ---- T6b THE ELEMENT THEOREM --------------------------------------------------------------------------
{
    const near = (a: V3, fam: V3[]) => fam.some((d) => dist(a, d) < 1e-9);
    let axisN = 0, beltN = 0, triN = 0, stray = 0;
    for (const f of faces) {
        const dir = nrm(f.center);
        if (near(dir, AXIS_DIRS)) axisN++;
        else if (near(dir, BELT_DIRS)) beltN++;
        else if (near(dir, TRI_DIRS)) triN++;
        else stray++;
    }
    // parent's own element dirs, machine-derived from PARENT (not trusted from prose)
    const pFaceDirs = AXIS_DIRS;
    const pEdgeDirs = P_EDGES.map(([i, j]) => nrm(mul(add(PARENT[i], PARENT[j]), 0.5)));
    const pVertDirs = PARENT.map((v) => nrm(v));
    const familiesDisjoint = pFaceDirs.every((d) => !near(d, pEdgeDirs) && !near(d, pVertDirs))
        && pEdgeDirs.every((d) => !near(d, pFaceDirs) && !near(d, pVertDirs));
    check("T6b THE ELEMENT THEOREM: every child face sits on one parent element — 6 faces on the parent's FACE dirs, 12 on its EDGE dirs, 8 on its VERTEX dirs; families disjoint; 6+12+8 == 26 == F+E+V of the parent",
        axisN === 6 && beltN === 12 && triN === 8 && stray === 0 && familiesDisjoint
        && pEdgeDirs.length === 12 && pVertDirs.length === 8,
        `axis ${axisN} + belt ${beltN} + tri ${triN} = ${axisN + beltN + triN}; stray ${stray}; parent dirs machine-derived (F ${pFaceDirs.length}, E ${pEdgeDirs.length}, V ${pVertDirs.length}), disjoint ${familiesDisjoint} — THE CONWAY EXPAND: every element of the cube becomes a face of the child, nothing removed`);
}

// ---- T7 seat laws -------------------------------------------------------------------------------------
{
    const botSq = faces.find((f, fi) => f.family === "axis" && NORMALS[fi][1] < -0.99);
    if (!botSq) throw Error("no bottom square found — seating broken");
    const botVs = botSq.verts.map((vi) => V[vi][1]);
    const botSpread = Math.max(...botVs) - Math.min(...botVs);
    const topSq = faces.find((f, fi) => f.family === "axis" && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9);
    if (!topSq) throw Error("no top square found — seating broken");
    const topVs = topSq.verts.map((vi) => V[vi][1]);
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
    const topIdx = faces.indexOf(topSq);
    const rimY = Math.max(...topSq.verts.map((vi) => V[vi][1]));            // crown rim level
    const rimR = Math.max(...topSq.verts.map((vi) => Math.hypot(V[vi][0], V[vi][2]))); // crown rim reach
    const crownPlane = CENTERS[topIdx][1] + NORMALS[topIdx][1] * BEAD_POKE; // crown bead base plane
    const beadTop = crownPlane + STEM_H + BEAD_R;                           // finial bead top
    const sightY = rimY + (rimY - READER_EYE) * rimR / (READER_D - rimR);   // sight line at the axis
    const finialClear = beadTop - sightY;                                   // must be >= 1.5·BEAD_R
    // bead census: 1 crown dead-axis + 4 waist at exact cardinals + 1 pressed
    // foot; the TWELVE BELT SQUARES stay dark (only parent faces carry light)
    let crown = 0, waist = 0, foot = 0, onAxis = false, allAloft = true, belts = 0;
    const azW: number[] = [];
    let footY = -1;
    for (let u = 0; u < faces.length; u++) {
        if (IS_TRI[u]) continue;                            // the grown corners stay dark
        const nn = NORMALS[u];
        const isAxis = Math.max(Math.abs(nn[0]), Math.abs(nn[1]), Math.abs(nn[2])) > 0.99;
        if (!isAxis) { belts++; continue; }                 // belt squares carry NO bead
        const cc = CENTERS[u];
        if (nn[1] > 0.99) { crown++; if (Math.hypot(cc[0], cc[2]) < 1e-9) onAxis = true; }
        else if (nn[1] < -0.99) { foot++; footY = FOOT_BEAD_Y; }
        else {
            waist++;
            azW.push(Math.atan2(cc[2], cc[0]));
            if (cc[1] + nn[1] * BEAD_POKE <= PLINTH_H + 1e-6) allAloft = false;
        }
        if (nn[1] > 0.99 && cc[1] + nn[1] * BEAD_POKE <= PLINTH_H + 1e-6) allAloft = false;
    }
    const azNear = (x: number, card: number) => Math.abs(Math.atan2(Math.sin(x - card), Math.cos(x - card)));
    const waistSnap = azW.length === 4 && azW.every((x) =>
        [0, Math.PI / 2, Math.PI, -Math.PI / 2].some((card) => azNear(x, card) < 1e-9));
    const t7parts = {
        botFlat: botSpread < 1e-9, botAtDais: Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9,
        topFlat: topSpread < 1e-9, sym: symMiss === 0, ctr: Math.hypot(cx, cz) < 1e-9,
        hgt: Math.abs(height - TARGET_H) < 1e-9, noOver: MAX_H + ROD_R <= apothem + 1e-9,
        crown, waist, foot, belts, onAxis, waistSnap, allAloft,
        footPressed: foot === 1 && Math.abs(footY - FOOT_BEAD_Y) < 1e-12,
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3),
    };
    check("T7 seat: bottom square FLAT at dais top, top square parallel, 90° symmetry, centroid on axis, height == target, never overhangs (apothem-first), waist bead azimuths exact cardinals (identity seat), bead census honest (1 crown + 4 waist + 1 pressed; TWELVE BELT SQUARES DARK — only the parent's faces carry light)",
        botSpread < 1e-9 && Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9 && topSpread < 1e-9
        && symMiss === 0 && Math.hypot(cx, cz) < 1e-9 && Math.abs(height - TARGET_H) < 1e-9
        && MAX_H + ROD_R <= apothem + 1e-9 && crown === 1 && waist === 4 && foot === 1 && belts === 12 && onAxis
        && waistSnap && allAloft && Math.abs(footY - FOOT_BEAD_Y) < 1e-12
        && FOOT_BEAD_Y - BEAD_R >= -1e-9 && FOOT_BEAD_Y + BEAD_R <= PLINTH_H + 1e-9
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; bottom square spread ${botSpread.toExponential(1)} at dais top ${PLINTH_H}; top square level (spread ${topSpread.toExponential(1)}); 90° misses ${symMiss}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); beads 1 crown dead-axis + 4 waist (cardinals exact, identity seat), all aloft, + 1 pressed foot at y ${footY} (tico's-twelfth idiom, hidden beneath the parent's own floor — six in truth); 12 belt squares dark; FINIAL crown bead top ${beadTop.toFixed(3)} clears rim sight line ${sightY.toFixed(3)} by ${finialClear.toFixed(3)}m (>= ${1.5 * BEAD_R} law) — reads from every ground vantage`);
}

// ---- T8 immersion (plates tuck under the seams — family shadow-gap law) --------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;       // plate mid-plane offset along outward normal
    let worstPlane = -Infinity;                            // max outward poke (must be ≤ 0)
    let worstTuck = 0;                                     // corner depth into rod cylinder (reported)
    for (let u = 0; u < faces.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const b = faces[u].verts.length;                   // 3 or 4
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
        `worst outward poke ${worstPlane.toExponential(1)} (≤ 0 = fully inside); max corner tuck into rod cylinders ${worstTuck.toFixed(4)}m (invisible — inside solid rod geometry, co idiom); plate outer face ${PLATE_BACK * 1000}mm behind the rod outer surface; the FOOT square plate rides the dais band (buried flush — the rods carry the silhouette, tret bottom-triangle precedent)`);
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
    // beads: crown finial (stem-lifted), 4 waist (poked), pressed foot (sunk)
    for (let u = 0; u < faces.length; u++) {
        if (IS_TRI[u]) continue;
        const nn = NORMALS[u];
        const isAxis = Math.max(Math.abs(nn[0]), Math.abs(nn[1]), Math.abs(nn[2])) > 0.99;
        if (!isAxis) continue;                           // belt squares carry no bead
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
        const topIdx = faces.findIndex((f, fi) => !IS_TRI[fi] && NORMALS[fi][1] > 0.99);
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

console.log(`seat: square-down 4-fold IDENTITY (the standard coords already sit the parent face on the dais, belt squares at the diagonals); bottom face flat on dais top ${PLINTH_H}; solid height ${TARGET_H}m; edge a ${EDGE.toFixed(4)}m; R ${R_SRCO.toFixed(4)}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} → ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`panels: 18 stone squares (6 parent faces WHOLE + 12 grown belts) + 8 iron triangles (the grown corners) + 48 iron seam rods; beads: 6 brass parent-square centers (crown FINIAL lifted ~${(CENTERS[faces.findIndex((f, fi) => !IS_TRI[fi] && NORMALS[fi][1] > 0.99)][1] + STEM_H).toFixed(2)}m on a ${STEM_R}m iron stem, 4 waist at the cardinals ~${CENTERS[faces.findIndex((f, fi) => !IS_TRI[fi] && Math.abs(NORMALS[fi][1]) < 1e-9 && NORMALS[fi][0] > 0.99)][1].toFixed(2)}m world-y, 1 pressed foot at y ${FOOT_BEAD_Y}) — the six parent faces, lit; the belts and the grown corners stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct253-srcubo)");
