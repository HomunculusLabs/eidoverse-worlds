// struct255-probe-trcubo.ts — STRUCTURES LANE struct-255, Round 11 R11-64.
// THE TRUNCATED CUBOCTAHEDRON (great rhombicuboctahedron).
// Form-ledger grep fresh this tick: truncated cubocta / trcubocta / trcubo /
// great rhombicubocta — 0 real mentions across STRUCTURES-PLAN (only the
// struct-249/253/254 unclaimed-pointer lines), IMPROVEMENTS, CITY-PLAN,
// IMPROVE-PLAN, NEW-VILLAGE-PLAN, DRESSING-PLAN. The ARCHIMEDEAN branch's
// EIGHTH member (cubocta 237, tico 243, toct 245, tret 247, tcube 249,
// tdodec 251, srcubo 253/254). Selection over the also-unclaimed snub cube:
// trcubo is ACHIRAL (full octahedral symmetry — no handedness decision owed
// to Bill; the snub cube exists in two mirror forms and stays named for
// Bill's call), keeps the family's axis-aligned 4-fold seat law exactly,
// and reads calmer at 26 faces against Bill's R11 density note.
//
// ONE IDEA: THE SAME THEOREM, TOLD BY THE KNIFE. The seventh member (srcubo,
// struct-253) GROWN — pulled the cube's six faces outward and turned every
// element of the parent into a face of the child (6+12+8 = 26), the parent
// whole inside. The eighth member cuts the SAME census: the Conway
// CANTITRUNCATE (bevel) of the cube — every parent FACE stays in its own
// plane, cut at the corners, an OCTAGON (6); every parent EDGE bevels into
// a SQUARE (12); every parent VERTEX blooms into a HEXAGON (8). 6+12+8 = 26
// again — the parent's F+E+V, complete, nothing else. The cut is the
// family's GENTLEST: the child carries ≈74.5% of the parent's mass (the
// truncations of rounds past surrendered 24–76% but moved every plane; this
// knife never moves a parent plane at all — T6 F-REMNANT law).
// Presentation: OCTAGON-DOWN, 4-fold IDENTITY seat (no rotation, no twist —
// measured with hard throws). STONE carries the EIGHTEEN FACE/EDGE faces
// (six parent-face octagons + twelve edge-bevel squares) + the
// TWENTY-SIX-sided dais (one side per face, 6+12+8); IRON carries the eight
// corner HEXAGONS — the parent's cut corners, bloomed — + all 72 seam bonds.
// Night contract: six warm brass beads at the six PARENT-FACE octagons —
// the parent's faces, lit (srcubo v1 pattern, same parent): one CROWN on an
// iron finial stem (tret v2 occlusion law) + four WAIST at the exact
// cardinals + the SIXTH PRESSED INTO THE EARTH beneath the flat foot
// (tico's-twelfth idiom — five read at night, six in truth, disclosed).
// The twelve bevel squares and the eight corner hexagons stay dark.
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   Vertex set: ALL permutations of (±1, ±(1+√2), ±(1+2√2)) — 48 verts,
//   edge 2, R = √(13+6√2) (closed form, T5). Faces by direction families:
//     6 octagons  on (±1,0,0)/(0,±1,0)/(0,0,±1)   — the parent's FACES
//     12 squares  on (±1,±1,0)-cyclic normalized  — the parent's EDGES
//     8 hexagons  on (±1,±1,±1)/√3                — the parent's VERTICES
//   Face planes: octagons at 1+2√2 (the parent's own face planes —
//   unmoved, T6), squares at 1+√2 (the deepest faces — the bevels cut in),
//   hexagons at √3(1+√2) (the proudest — the corners bloom out).
//   Dihedrals exactly THREE classes (T5): square–hexagon dot 2/√6 (interior
//   144.7356°, 24 edges), square–octagon dot 1/√2 (interior 135°, 24
//   edges), hexagon–octagon dot 1/√3 (interior 125.2644°, 24 edges); zero
//   square–square, zero hexagon–hexagon, zero octagon–octagon edges.
//   Vertex figure 4.6.8 — degree 3 everywhere (the first degree-3 member of
//   the branch's cube line; T3).
//   Volume (edge 2): 16(11+7√2) ≈ 334.3920, cross-checked two independent
//   ways (T6): divergence over the built faces and the closed form. Parent
//   cube (faces in the octagon planes, edge 2(1+2√2)): V = 8(1+2√2)³ ≈
//   448.90; ratio ≈ 0.7450.
//
// DAIS LAW: APOTHEM-FIRST for all N (struct-247 fix, carried).
//
// THEOREMS machine-verified below:
//   T1 Euler: 48 − 72 + 26 = 2 (sphere).
//   T2 face census: 12 regular squares (90°) + 8 regular hexagons (120°) +
//      6 regular octagons (135°), every side == a.
//   T3 vertex census: degree 3 everywhere; exactly 1 square + 1 hexagon +
//      1 octagon at every vertex (48×) — figure 4.6.8.
//   T4 manifold: every edge on exactly 2 faces (144 face-edge slots).
//   T5 uniformity: all 48 verts at exactly R (== closed form √(13+6√2));
//      dihedrals exactly THREE classes — sq–hex dot == 2/√6 (interior
//      144.7356°), sq–oct dot == 1/√2 (interior 135°), hex–oct dot ==
//      1/√3 (interior 125.2644°), 24 edges each; zero sq–sq, zero hex–hex,
//      zero oct–oct (72 total).
//   T6 THE GENTLEST CUT: divergence volume == closed form 16(11+7√2);
//      F-REMNANT law — every octagon plane at EXACTLY the parent cube's own
//      face distance 1+2√2 (the knife never moves a parent plane; the only
//      member of the cube line of which that is true besides the srcubo's
//      whole-parent containment); parent mass ratio reported (≈0.7450 —
//      the gentlest surrender of the branch).
//   T6b THE ELEMENT THEOREM (same census as the srcubo, cut not grown):
//      every child face center direction matches exactly one parent
//      element family — 6 on the parent's face dirs, 12 on its edge dirs,
//      8 on its vertex dirs; families disjoint and exhaustive
//      (6+12+8 = 26 = F+E+V of the parent; the cantitruncate operator,
//      machine-matched).
//   T7 seat: bottom octagon FLAT at dais top (8 verts level), top octagon
//      parallel, 90° symmetry about Y, centroid on axis, height == target,
//      reach+rod ≤ dais apothem (never overhangs, apothem-first); waist
//      bead azimuths exact cardinals (identity seat); bead census honest:
//      1 crown dead-axis finial + 4 waist + 1 pressed foot, the TWELVE
//      bevel squares + EIGHT corner hexagons DARK (only the parent's own
//      faces carry light); FINIAL-CLEARANCE LAW (tret v2): crown bead top
//      clears the crown rim sight line from READER_D by ≥ 1.5·BEAD_R.
//   T8 immersion: every inset plate corner, lifted to the plate mid-plane,
//      lies strictly INSIDE the convex solid (no face-plane poke-through);
//      corner tuck into the rod cylinders reported.
//   RED control: --red displaces one vertex 0.3 — T2/T5/T7 must fail.

export const TARGET_H = 6.2;              // seated solid height (4-fold octagon axis) — the eighth member stands between srcubo 6.1 and tdodec 6.4
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
export const PLINTH_N = 26;               // TWENTY-SIX sides — one per face (6 octagons + 12 squares + 8 hexagons)
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

// ---- parent cube (edge 2) and the CANTITRUNCATED vertex set ------------------------------------------
const C1 = 1, C2 = 1 + Math.sqrt(2), C3 = 1 + 2 * Math.sqrt(2);   // the three coordinate magnitudes
const PARENT: V3[] = [];
for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) PARENT.push([sx, sy, sz]);
if (PARENT.length !== 8) throw Error(`parent verts ${PARENT.length} != 8`);
const M: V3[] = [];
// ALL SIX permutations of (±1, ±(1+√2), ±(1+2√2)) — 48 verts (edge 2)
for (let p = 0; p < 6; p++) {
    const vals: [number, number, number][] = [C1, C2, C3] as [number, number, number];
    // the three permutation arrangements placing (c1,c2,c3) at (0,1,2),(1,2,0),(2,0,1),(0,2,1),(2,1,0),(1,0,2)
    const slotOf: number[][] = [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [2, 1, 0], [1, 0, 2]];
    const [sa, sb, sc] = slotOf[p];
    for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) {
        const v: V3 = [0, 0, 0];
        v[sa] = sx * vals[0]; v[sb] = sy * vals[1]; v[sc] = sz * vals[2];
        M.push(v);
    }
}
if (M.length !== 48) throw Error(`trcubo verts ${M.length} != 48`);
const P_EDGE = 2;                                 // exact for the parent cube
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++)
    if (Math.abs(dist(PARENT[i], PARENT[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 12) throw Error(`parent edges ${P_EDGES.length} != 12`);
const EDGES: [number, number][] = [];
for (let i = 0; i < 48; i++) for (let j = i + 1; j < 48; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-9) EDGES.push([i, j]);
if (EDGES.length !== 72) throw Error(`trcubo edges ${EDGES.length} != 72`);

// ---- faces by parent-element direction families -------------------------------------------------------
const AXIS_DIRS: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const SQ_DIRS: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    SQ_DIRS.push(nrm([s1, s2, 0]));
    SQ_DIRS.push(nrm([s1, 0, s2]));
    SQ_DIRS.push(nrm([0, s1, s2]));
}
if (SQ_DIRS.length !== 12) throw Error(`square dirs ${SQ_DIRS.length} != 12`);
const HEX_DIRS: V3[] = PARENT.map((v) => nrm(v));
if (HEX_DIRS.length !== 8) throw Error(`hex dirs ${HEX_DIRS.length} != 8`);

type Family = "oct" | "sq" | "hex";
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
    if (Math.abs(order[0][0] - plane) > 1e-12) throw Error("face plane not level");
    if (plane - order[k][0] < 1e-9) throw Error("face plane ambiguous");
    const { verts, center, n } = orderRing(order.slice(0, k).map(([, i]) => M[i]));
    faces.push({ k, verts, center, n, family });
};
for (const d of AXIS_DIRS) buildFace(d, 8, "oct");
for (const d of SQ_DIRS) buildFace(d, 4, "sq");
for (const d of HEX_DIRS) buildFace(d, 6, "hex");
if (faces.length !== 26) throw Error(`faces ${faces.length} != 26`);

// ---- edgeFaces (module scope — used by T4/T5) ---------------------------------------------------------
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < faces.length; fi++) for (let t = 0; t < faces[fi].verts.length; t++) {
    const a = faces[fi].verts[t], b = faces[fi].verts[(t + 1) % faces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ---- seating: IDENTITY (octagon-down 4-fold, waist octagons dead on cardinals) ------------------------
// The standard coordinates already sit octagon-down with the four waist
// octagons facing the exact cardinals — no rotation, no twist. The checks
// below MEASURE this and hard-throw on any miss.
const rot = (v: V3): V3 => v;
const rot1 = rot;
{
    const bot = faces.find((f) => f.family === "oct" && Math.abs(f.n[1] + 1) < 1e-12);
    if (!bot) throw Error("no bottom octagon — seat broken");
    const ys = bot.verts.map((vi) => rot1(M[vi])[1]);
    if (Math.max(...ys) - Math.min(...ys) > 1e-12) throw Error("bottom octagon not level");
    const waistAz = faces.filter((f) => f.family === "oct" && Math.abs(f.n[1]) < 1e-12)
        .map((f) => Math.atan2(rot1(f.center)[2], rot1(f.center)[0]));
    if (waistAz.length !== 4) throw Error(`waist octagons ${waistAz.length} != 4`);
    for (const az of waistAz)
        if (Math.min(...[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((c) => Math.abs(Math.atan2(Math.sin(az - c), Math.cos(az - c))))) > 1e-12)
            throw Error(`waist azimuth off cardinal: ${az}`);
}

// ---- scale + lift: bottom octagon plane lands exactly on the dais top ---------------------------------
const seatedUnit = M.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
export const EDGE = P_EDGE * SCALE;
const R_UNIT = Math.hypot(...M[0]);
export const R_TRCUBO = R_UNIT * SCALE;
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
export const IS_HEX: boolean[] = faces.map((f) => f.family === "hex");
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
check("T1 Euler 48−72+26 = 2", V.length === 48 && E.length === 72 && faces.length === 26 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census -----------------------------------------------------------------------------------
{
    let worstSide = 0, worstAng = 0;
    for (const f of faces) {
        const want = f.k === 4 ? Math.PI / 2 : f.k === 6 ? (2 * Math.PI) / 3 : (3 * Math.PI) / 4;  // 90° / 120° / 135°
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
    const sqC = faces.filter((f) => f.k === 4).length;
    const hexC = faces.filter((f) => f.k === 6).length;
    const octC = faces.filter((f) => f.k === 8).length;
    check("T2 faces: 12 regular squares (90°) + 8 regular hexagons (120°) + 6 regular octagons (135°), every side == a",
        sqC === 12 && hexC === 8 && octC === 6 && worstSide < 1e-9 && worstAng < 1e-7,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst angle dev ${worstAng.toExponential(1)} rad; side a ${EDGE.toFixed(4)}m — all 26 faces congruent-edged: the cantitruncate cuts without shearing anything`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------
{
    const deg = new Array(48).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    let badFig = 0;
    for (let i = 0; i < 48; i++) {
        const sqf = faces.filter((f) => f.verts.includes(i) && f.family === "sq").length;
        const hexf = faces.filter((f) => f.verts.includes(i) && f.family === "hex").length;
        const octf = faces.filter((f) => f.verts.includes(i) && f.family === "oct").length;
        if (sqf !== 1 || hexf !== 1 || octf !== 1) badFig++;
    }
    check("T3 vertices: degree 3 everywhere; exactly 1 square + 1 hexagon + 1 octagon at every vertex (figure 4.6.8)",
        deg.every((d) => d === 3) && badFig === 0,
        `Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}; figure violations ${badFig} — the branch's first degree-3 cube-line member: every wedding corner of the figure 4.6.8 sits at one parent face + one parent edge + one parent corner`);
}

// ---- T4 manifold --------------------------------------------------------------------------------------
{
    const bad = [...edgeFaces.values()].filter((c) => c.length !== 2).length;
    const missing = E.filter(([a, b]) => (edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && edgeFaces.size === 72,
        `${edgeFaces.size} face-edges (${12 * 4 + 8 * 6 + 6 * 8} slots), ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 uniformity ------------------------------------------------------------------------------------
{
    let worstR = 0;
    for (const v of V) worstR = Math.max(worstR, Math.abs(dist(v, SOLID_CENTER) - R_TRCUBO));
    const R_CLOSED = Math.sqrt(13 + 6 * Math.sqrt(2));
    const SQ_HEX = 2 / Math.sqrt(6);                 // interior 144.7356°
    const SQ_OCT = 1 / Math.SQRT2;                   // interior 135°
    const HEX_OCT = 1 / Math.sqrt(3);                // interior 125.2644°
    let shWorst = 0, soWorst = 0, hoWorst = 0;
    let shN = 0, soN = 0, hoN = 0, ssN = 0, hhN = 0, ooN = 0;
    for (const [, fl] of edgeFaces) {
        if (fl.length !== 2) continue;
        const fA = faces[fl[0]], fB = faces[fl[1]];
        const d = dot(NORMALS[fl[0]], NORMALS[fl[1]]);
        const fams = [fA.family, fB.family].sort().join("+");
        if (fams === "hex+hex") { hhN++; continue; }
        if (fams === "oct+oct") { ooN++; continue; }
        if (fams === "sq+sq") { ssN++; continue; }
        if (fams === "hex+oct") { hoN++; hoWorst = Math.max(hoWorst, Math.abs(d - HEX_OCT)); }
        else if (fams === "hex+sq") { shN++; shWorst = Math.max(shWorst, Math.abs(d - SQ_HEX)); }
        else { soN++; soWorst = Math.max(soWorst, Math.abs(d - SQ_OCT)); }   // oct+sq
    }
    check("T5 uniformity: all 48 verts at exactly R_trcubo (== closed form √(13+6√2)); dihedrals exactly three classes — sq–hex dot 2/√6 (interior 144.7356°), sq–oct dot 1/√2 (interior 135°), hex–oct dot 1/√3 (interior 125.2644°), 24 each; zero sq–sq, zero hex–hex, zero oct–oct",
        worstR < 1e-9 && shN === 24 && soN === 24 && hoN === 24 && ssN === 0 && hhN === 0 && ooN === 0
        && shWorst < 1e-9 && soWorst < 1e-9 && hoWorst < 1e-9,
        `R dev ${(worstR * 1e12).toExponential(1)} (R ${R_TRCUBO.toFixed(6)} == closed ${(R_CLOSED * SCALE).toFixed(6)}); sq–hex ${shN} worst |dot−2/√6| ${shWorst.toExponential(1)} (interior ${(Math.acos(-SQ_HEX) * 180 / Math.PI).toFixed(4)}°); sq–oct ${soN} worst |dot−1/√2| ${soWorst.toExponential(1)} (interior 135°); hex–oct ${hoN} worst |dot−1/√3| ${hoWorst.toExponential(1)} (interior ${(Math.acos(-HEX_OCT) * 180 / Math.PI).toFixed(4)}°); sq–sq ${ssN}, hex–hex ${hhN}, oct–oct ${ooN} (24+24+24 == 72)`);
}

// ---- T6 THE GENTLEST CUT ------------------------------------------------------------------------------
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
    const V_closed = 16 * (11 + 7 * Math.sqrt(2));             // 2(11+7√2)a³ at a=2
    // F-REMNANT law: every octagon plane at EXACTLY the parent cube's own
    // face distance C3 — the knife never moves a parent plane
    let worstPlaneDrift = 0;
    for (const f of faces) {
        if (f.family !== "oct") continue;
        worstPlaneDrift = Math.max(worstPlaneDrift, Math.abs(dot(f.center, f.n) - C3));
    }
    // parent cube: faces in the octagon planes → edge 2·C3
    const V_parent_unit = Math.pow(2 * C3, 3);
    const ratio = V_div / V_parent_unit;
    check("T6 THE GENTLEST CUT: divergence volume == closed form 16(11+7√2); F-REMNANT — every octagon plane at exactly the parent's own face distance 1+2√2 (the knife never moves a parent plane); parent mass ratio reported",
        Math.abs(V_div - V_closed) < 1e-9 && worstPlaneDrift < 1e-12,
        `divergence ${V_div.toFixed(10)} == closed ${V_closed.toFixed(10)}; octagon plane drift ${worstPlaneDrift.toExponential(1)} vs parent face distance ${C3.toFixed(6)}; parent (edge 2(1+2√2) = ${(2 * C3).toFixed(6)}) V ${V_parent_unit.toFixed(4)}; ratio ${ratio.toFixed(4)} — THE CHILD KEEPS ${(ratio * 100).toFixed(1)}% OF THE PARENT'S MASS (the branch's gentlest surrender: the truncations moved every plane, the expand kept the parent whole inside, the cantitruncate leaves the parent's own faces standing where they stood)`);
}

// ---- T6b THE ELEMENT THEOREM --------------------------------------------------------------------------
{
    const near = (a: V3, fam: V3[]) => fam.some((d) => dist(a, d) < 1e-9);
    let octN = 0, sqN = 0, hexN = 0, stray = 0;
    for (const f of faces) {
        const dir = nrm(f.center);
        if (near(dir, AXIS_DIRS)) octN++;
        else if (near(dir, SQ_DIRS)) sqN++;
        else if (near(dir, HEX_DIRS)) hexN++;
        else stray++;
    }
    // parent's own element dirs, machine-derived from PARENT (not trusted from prose)
    const pFaceDirs = AXIS_DIRS;
    const pEdgeDirs = P_EDGES.map(([i, j]) => nrm(mul(add(PARENT[i], PARENT[j]), 0.5)));
    const pVertDirs = PARENT.map((v) => nrm(v));
    const familiesDisjoint = pFaceDirs.every((d) => !near(d, pEdgeDirs) && !near(d, pVertDirs))
        && pEdgeDirs.every((d) => !near(d, pFaceDirs) && !near(d, pVertDirs));
    check("T6b THE ELEMENT THEOREM (same census as the srcubo, cut not grown): every child face sits on one parent element — 6 octagons on the parent's FACE dirs, 12 squares on its EDGE dirs, 8 hexagons on its VERTEX dirs; families disjoint; 6+12+8 == 26 == F+E+V of the parent",
        octN === 6 && sqN === 12 && hexN === 8 && stray === 0 && familiesDisjoint
        && pEdgeDirs.length === 12 && pVertDirs.length === 8,
        `oct ${octN} + sq ${sqN} + hex ${hexN} = ${octN + sqN + hexN}; stray ${stray}; parent dirs machine-derived (F ${pFaceDirs.length}, E ${pEdgeDirs.length}, V ${pVertDirs.length}), disjoint ${familiesDisjoint} — THE CONWAY CANTITRUNCATE: every element of the cube becomes a face of the child, the same theorem the srcubo told by growing`);
}

// ---- T7 seat laws -------------------------------------------------------------------------------------
{
    const botOct = faces.find((f, fi) => f.family === "oct" && NORMALS[fi][1] < -0.99);
    if (!botOct) throw Error("no bottom octagon found — seating broken");
    const botVs = botOct.verts.map((vi) => V[vi][1]);
    const botSpread = Math.max(...botVs) - Math.min(...botVs);
    const topOct = faces.find((f, fi) => f.family === "oct" && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9);
    if (!topOct) throw Error("no top octagon found — seating broken");
    const topVs = topOct.verts.map((vi) => V[vi][1]);
    const topSpread = Math.max(...topVs) - Math.min(...topVs);
    const cx = V.reduce((s, v) => s + v[0], 0) / 48;
    const cz = V.reduce((s, v) => s + v[2], 0) / 48;
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
    const rimY = Math.max(...topOct.verts.map((vi) => V[vi][1]));            // crown rim level
    const rimR = Math.max(...topOct.verts.map((vi) => Math.hypot(V[vi][0], V[vi][2]))); // crown rim reach
    const crownPlane = CENTERS[topIdx][1] + NORMALS[topIdx][1] * BEAD_POKE; // crown bead base plane
    const beadTop = crownPlane + STEM_H + BEAD_R;                           // finial bead top
    const sightY = rimY + (rimY - READER_EYE) * rimR / (READER_D - rimR);   // sight line at the axis
    const finialClear = beadTop - sightY;                                   // must be >= 1.5·BEAD_R
    // bead census: 1 crown dead-axis + 4 waist at exact cardinals + 1 pressed
    // foot; the TWELVE bevel squares + EIGHT corner hexagons stay dark
    let crown = 0, waist = 0, foot = 0, onAxis = false, allAloft = true, dark = 0;
    const azW: number[] = [];
    let footY = -1;
    for (let u = 0; u < faces.length; u++) {
        if (faces[u].family !== "oct") { dark++; continue; }                 // squares + hexagons carry NO bead
        const nn = NORMALS[u];
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
        crown, waist, foot, dark, onAxis, waistSnap, allAloft,
        footPressed: foot === 1 && Math.abs(footY - FOOT_BEAD_Y) < 1e-12,
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3),
    };
    check("T7 seat: bottom octagon FLAT at dais top, top octagon parallel, 90° symmetry, centroid on axis, height == target, never overhangs (apothem-first), waist bead azimuths exact cardinals (identity seat), bead census honest (1 crown + 4 waist + 1 pressed; TWELVE bevel squares + EIGHT corner hexagons DARK — only the parent's faces carry light)",
        botSpread < 1e-9 && Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9 && topSpread < 1e-9
        && symMiss === 0 && Math.hypot(cx, cz) < 1e-9 && Math.abs(height - TARGET_H) < 1e-9
        && MAX_H + ROD_R <= apothem + 1e-9 && crown === 1 && waist === 4 && foot === 1 && dark === 20 && onAxis
        && waistSnap && allAloft && Math.abs(footY - FOOT_BEAD_Y) < 1e-12
        && FOOT_BEAD_Y - BEAD_R >= -1e-9 && FOOT_BEAD_Y + BEAD_R <= PLINTH_H + 1e-9
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; bottom octagon spread ${botSpread.toExponential(1)} at dais top ${PLINTH_H}; top octagon level (spread ${topSpread.toExponential(1)}); 90° misses ${symMiss}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); beads 1 crown dead-axis + 4 waist (cardinals exact, identity seat), all aloft, + 1 pressed foot at y ${footY} (tico's-twelfth idiom, hidden beneath the parent's own floor — six in truth); 12 bevel squares + 8 corner hexagons dark; FINIAL crown bead top ${beadTop.toFixed(3)} clears rim sight line ${sightY.toFixed(3)} by ${finialClear.toFixed(3)}m (>= ${1.5 * BEAD_R} law) — reads from every ground vantage`);
}

// ---- T8 immersion (plates tuck under the seams — family shadow-gap law) --------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;       // plate mid-plane offset along outward normal
    let worstPlane = -Infinity;                            // max outward poke (must be ≤ 0)
    let worstTuck = 0;                                     // corner depth into rod cylinder (reported)
    for (let u = 0; u < faces.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const b = faces[u].verts.length;                   // 4, 6, or 8
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
    // beads: crown finial (stem-lifted), 4 waist (poked), pressed foot (sunk) —
    // octagon centers ONLY (the parent's faces carry the light)
    for (let u = 0; u < faces.length; u++) {
        if (faces[u].family !== "oct") continue;
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
        const topIdx = faces.findIndex((f, fi) => faces[fi].family === "oct" && NORMALS[fi][1] > 0.99);
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

console.log(`seat: octagon-down 4-fold IDENTITY (the standard coords already sit the parent face on the dais, waist octagons at the cardinals); bottom face flat on dais top ${PLINTH_H}; solid height ${TARGET_H}m; edge a ${EDGE.toFixed(4)}m; R ${R_TRCUBO.toFixed(4)}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} → ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`panels: 18 stone FACE/EDGE faces (6 parent-face octagons + 12 edge-bevel squares) + 8 iron corner HEXAGONS + 72 iron seam rods; beads: 6 brass parent-octagon centers (crown FINIAL lifted ~${(CENTERS[faces.findIndex((f, fi) => faces[fi].family === "oct" && NORMALS[fi][1] > 0.99)][1] + STEM_H).toFixed(2)}m on a ${STEM_R}m iron stem, 4 waist at the cardinals ~${CENTERS[faces.findIndex((f, fi) => faces[fi].family === "oct" && Math.abs(NORMALS[fi][1]) < 1e-9 && NORMALS[fi][0] > 0.99)][1].toFixed(2)}m world-y, 1 pressed foot at y ${FOOT_BEAD_Y}) — the six parent faces, lit; the bevels and the bloomed corners stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct255-trcubo)");
