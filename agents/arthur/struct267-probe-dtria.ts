// struct267-probe-dtria.ts — STRUCTURES LANE struct-267, Round 11 commission R11-75.
// THE DISDYAKIS TRIACONTAHEDRON — the Catalan dual of the standing truncated
// icosidodecahedron (trico, struct-259/260). Catalan branch member 2 (the rt,
// struct-235, opened it).
//
// Form-ledger grep fresh this tick: disdyakis|dtria — 0 real claims across
// STRUCTURES-PLAN, IMPROVEMENTS, CITY-PLAN, IMPROVE-PLAN, NEW-VILLAGE-PLAN,
// DRESSING-PLAN (only the unclaimed-pointer lines). The CATALAN branch's
// second member; the dual-of-freshest-parent move (gsd->gdodec precedent)
// with the strongest narrative: the trico told the dodeca's F+E+V census by
// cutting; the dual reads the SAME census turned inside-out — every face of
// the knife's work becomes a point, every wedding corner becomes a face.
// Kin check: the rt (rhombic triacontahedron) stands at 3-fold point-down;
// this is the rt's own richer sibling — each of the rt's 30 rhombi divides
// into four triangles (120 faces), the vertex ranks split three ways
// (12 shallow + 30 mid + 20 deep), and the seat is the NEW 5-fold point-down
// (the rt's symmetry story at a new axis). The pentagonal hexecontahedron
// (rico's dual) and the smaller Catalans stay unclaimed for later sweeps.
//
// ONE IDEA: THE KNIFE'S WORK, TURNED INSIDE-OUT. The standing trico (18m away
// in plan lineage) cut the dodecahedron: 12 decagons + 30 squares + 20
// hexagons, 62 faces. Take the POLAR RECIPROCAL of those 62 planes about the
// trico's own midsphere — the sphere every edge kisses — and each face
// becomes a POINT: 12 shallow crown-points where the parent faces were, 30
// mid-rank, 20 deep. Each of the trico's 120 wedding corners (figure 4.6.10:
// one decagon + one square + one hexagon meeting) becomes one of 120
// scalene triangle sails — the same golden parent, read through the looking
// glass. Every dual face kisses ONE insphere (the Catalan property, T6) —
// the tangent-solid mirror of the trico's every-vertex-on-one-sphere.
//
// DERIVATION (first principles — no coordinate table trusted from memory):
//   The parent trico is rebuilt exactly as struct-259 derived it (parent
//   dodeca edge 2; the 62 face directions machine-derived; the two cut
//   depths Newton-solved for the uniform edge; the 120 verts as triple-plane
//   intersections). Then:
//     rho   = the midsphere radius (every trico edge midpoint equidistant —
//             measured, spread reported);
//     V_u   = (rho^2 / h_u) . n_u      for each of the 62 faces (the polar
//             reciprocal of the plane n.x = h_u about the sphere radius rho);
//     faces = one scalene triangle per trico vertex, from its 3 incident
//             faces (1 dec + 1 sq + 1 hex), plane normal exactly the trico
//             vertex direction m-hat, plane depth exactly rho^2 / R_trico;
//     edges = one dual edge per trico edge, joining the duals of the two
//             faces that shared it (bijection, 180 <-> 180).
//
// PARAMETRIZATION (measured, then machine-verified): V = 62, E = 180,
// F = 120 (all triangles). Vertex degrees 10 / 4 / 6 by rank. Edge classes
// exactly three (dec-sq / sq-hex / dec-hex, 60 each). Per-face angle
// multiset IDENTICAL across all 120 faces — the face-transitive Catalan
// signature (measured, not trusted from prose).
//
// DAIS LAW: APOTHEM-FIRST for all N (struct-247 fix, carried).
// Presentation: POINT-DOWN on the 5-fold axis — the bottom decagon-face's
// dual crown-point stands AT the dais center (the trico's own seated frame
// INHERITED: decagon-down + twist-snap mean the dual needs no re-seat —
// the parent's floor normal IS this point's axis). STONE carries the 120
// triangle sails + the ONE-HUNDRED-TWENTY-sided dais (one side per face —
// theme-number law); IRON carries all 180 seam bonds + the crown finial
// stem. Night contract: TWELVE warm brass beads at the twelve dec-rank
// crown-points (the icosa-vertex orbit — the parent's own bead census told
// again by the dual: 1 CROWN on the finial stem (tret v2 occlusion law) +
// TEN WAIST in two exact 72-degree pentads (upper interleaved 36-deg,
// inversion-paired with the lower — geometry decides, measured) + THE
// TWELFTH PRESSED INTO THE EARTH beneath the standing point (tico's-twelfth
// idiom — eleven read at night, twelve in truth, disclosed). The 30
// mid-rank and 20 deep points stay dark.
//
// THEOREMS machine-verified below:
//   T0 dual census + midsphere: 62/180/120; every trico edge midpoint at
//      exactly one radius rho (the reciprocation sphere exists — spread
//      reported); the three dual vertex radii classes rho^2/h exact.
//   T1 Euler: 62 - 180 + 120 = 2 (sphere).
//   T2 face census: 120 triangles; per-face angle multiset IDENTICAL across
//      all faces (three global classes, each sitting at its own rank); every
//      face carries exactly one dec + one sq + one hex vert; angle sum pi.
//   T3 vertex census: degree 10 (dec rank, 12) / 4 (sq rank, 30) / 6 (hex
//      rank, 20); Sum(deg) == 2E.
//   T4 manifold: every dual edge on exactly 2 faces (360 slots).
//   T5 edge census: exactly three type-pair classes dec-sq / sq-hex /
//      dec-hex, 60 each, zero same-rank; three edge-length classes, 60 each
//      (lengths measured; the Catalan is face-transitive, NOT uniform —
//      unequal edge classes are the honest signature).
//   T6 THE POLAR RECIPROCAL: every one of the 120 dual faces has all three
//      verts at EXACTLY plane depth rho^2/R_trico from the dual center (all
//      faces kiss ONE insphere — the Catalan tangent property); every dual
//      face normal is EXACTLY one trico vertex direction (bijection).
//   T7 seat laws: foot + crown dec-rank points dead on the axis; foot AT
//      the dais top; 72-degree symmetry about Y (0 misses); central
//      inversion exact (for every point, its antipode about the center is a
//      point); centroid on axis; height == target; never overhangs
//      (apothem-first); the TEN waist dec-rank points = two exact level
//      72-degree pentads, inversion-paired, upper offset measured (geometry
//      decides); bead census honest (1 crown finial + 10 waist aloft + 1
//      pressed foot; the 30 sq-rank + 20 hex-rank points DARK); FINIAL-
//      CLEARANCE LAW (tret v2).
//   T8 immersion: every inset plate corner strictly INSIDE the convex
//      solid; corner tuck reported.
//   RED control: --red displaces one dual vertex 0.3 — T2/T5/T6/T7 fail.

export const TARGET_H = 6.6;              // seated solid height — the family ladder's next step (trico 6.5 -> 6.6)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.15;               // brass crown-point bead (family scale)
export const BEAD_POKE = 0.02;            // bead center proud along the radial dir (grazing-read law, disclosed)
export const STEM_H = 1.30;               // FINIAL stem: crown bead lifted on an iron pin (tret v2 occlusion law)
export const STEM_R = 0.03;               // finial stem radius (slender iron pin)
export const READER_D = 18;               // lane reading distance (sight-line law domain)
export const READER_EYE = 1.65;           // reader eye height
export const PLATE_T = 0.10;              // panel thickness
export const PLATE_INSET = 0.07;          // panel corner inset (seam reveal — family look)
export const PLATE_BACK = 0.018;          // panel outer face behind rod surface
export const PLINTH_N = 120;              // ONE HUNDRED TWENTY sides — one per dual face (theme-number law)
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

// ==== THE PARENT TRICO, rebuilt exactly as struct-259 derived it (frozen source, verbatim math) ====

// ---- parent DODECAHEDRON (edge 2 — standard coords, rescaled) -----------------------------------------
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

// ---- the 62 face directions, machine-derived from the parent (trico chassis) ---------------------------
const DEC_DIRS: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    DEC_DIRS.push(nrm([0, s1 * PHI, s2]));
    DEC_DIRS.push(nrm([s2, 0, s1 * PHI]));
    DEC_DIRS.push(nrm([s1 * PHI, s2, 0]));
}
if (DEC_DIRS.length !== 12) throw Error(`dec dirs ${DEC_DIRS.length} != 12`);
const HEX_DIRS: V3[] = PARENT_D.map((v) => nrm(v));
if (HEX_DIRS.length !== 20) throw Error(`hex dirs ${HEX_DIRS.length} != 20`);
const SQ_DIRS: V3[] = [];
for (const [i, j] of P_EDGES) {
    const d = nrm(mul(add(PARENT_D[i], PARENT_D[j]), 0.5));
    if (!SQ_DIRS.some((q) => dist(q, d) < 1e-9)) SQ_DIRS.push(d);
}
if (SQ_DIRS.length !== 30) throw Error(`sq dirs ${SQ_DIRS.length} != 30`);

// ---- parent topology -----------------------------------------------------------------------------------
const parentFaceVerts: number[][] = DEC_DIRS.map((d) => {
    const order = PARENT.map((v, i) => [dot(v, d), i] as [number, number]).sort((a, b) => b[0] - a[0]);
    return order.slice(0, 5).map(([, i]) => i);
});
const edgeFaces: [number, number][] = P_EDGES.map(([i, j]) => {
    const fs = parentFaceVerts.map((vs, fi) => vs.includes(i) && vs.includes(j) ? fi : -1).filter((x) => x >= 0);
    if (fs.length !== 2) throw Error(`parent edge faces ${fs.length} != 2`);
    return [fs[0], fs[1]];
});

// ---- the depths: decagons AT the parent's own planes; squares beveled w; hexagons cut u ----------------
const hParentFace = (() => {
    let r = -Infinity;
    for (const v of PARENT) r = Math.max(r, ...DEC_DIRS.map((d) => dot(v, d)));
    return r;
})();
const mParentEdge = (() => {
    const [i, j] = P_EDGES[0];
    return dot(PARENT[i], SQ_DIRS[0]);
})();
const RParentVert = Math.hypot(...PARENT[0]);
const depths = (u: number, w: number) => ({
    dec: hParentFace,
    sq: mParentEdge - w,
    hex: RParentVert - u,
});

// ---- Newton solve for the uniform edge (trico chassis, verbatim math) ----------------------------------
function lineCutLen(nA: V3, hA: number, nB: V3, hB: number, nC1: V3, hC1: number, nC2: V3, hC2: number): number {
    const d = cross(nA, nB);
    const dl = Math.hypot(...d);
    if (dl < 1e-12) throw Error("parallel planes — adjacency broken");
    const dh: V3 = [d[0] / dl, d[1] / dl, d[2] / dl];
    const g11 = dot(nA, nA), g12 = dot(nA, nB), g22 = dot(nB, nB);
    const det = g11 * g22 - g12 * g12;
    const a = (hA * g22 - hB * g12) / det, b = (hB * g11 - hA * g12) / det;
    const x0 = add(mul(nA, a), mul(nB, b));
    const t1 = (hC1 - dot(x0, nC1)) / dot(dh, nC1);
    const t2 = (hC2 - dot(x0, nC2)) / dot(dh, nC2);
    return Math.abs(t2 - t1);
}
const S0 = 0;
const P_OF_S0 = edgeFaces[S0][0];
const [T1A, T1B] = P_EDGES[S0];
const LsqDec = (u: number, w: number) => {
    const h = depths(u, w);
    return lineCutLen(SQ_DIRS[S0], h.sq, DEC_DIRS[P_OF_S0], h.dec, HEX_DIRS[T1A], h.hex, HEX_DIRS[T1B], h.hex);
};
const LsqHex = (u: number, w: number) => {
    const h = depths(u, w);
    const [pA, pB] = edgeFaces[S0];
    return lineCutLen(SQ_DIRS[S0], h.sq, HEX_DIRS[T1A], h.hex, DEC_DIRS[pA], h.dec, DEC_DIRS[pB], h.dec);
};
const LdecHex = (u: number, w: number) => {
    const h = depths(u, w);
    const vertEdgesT1A = P_EDGES.map(([i, j], ei) => (i === T1A || j === T1A) ? ei : -1).filter((x) => x >= 0);
    const ses = vertEdgesT1A.filter((ei) => edgeFaces[ei].includes(P_OF_S0));
    if (ses.length !== 2) throw Error(`dec-hex adjacency: ${ses.length} squares (want 2)`);
    return lineCutLen(DEC_DIRS[P_OF_S0], h.dec, HEX_DIRS[T1A], h.hex, SQ_DIRS[ses[0]], h.sq, SQ_DIRS[ses[1]], h.sq);
};
const solveUW = (() => {
    let u = 0.42, w = 0.26;
    const H = 1e-7;
    for (let it = 0; it < 80; it++) {
        const lsd = LsqDec(u, w), lsh = LsqHex(u, w), ldh = LdecHex(u, w);
        const f1 = lsd - lsh, f2 = lsd - ldh;
        if (Math.abs(f1) < 1e-13 && Math.abs(f2) < 1e-13) break;
        const j11 = ((LsqDec(u + H, w) - LsqHex(u + H, w)) - f1) / H;
        const j12 = ((LsqDec(u, w + H) - LsqHex(u, w + H)) - f1) / H;
        const j21 = ((LsqDec(u + H, w) - LdecHex(u + H, w)) - f2) / H;
        const j22 = ((LsqDec(u, w + H) - LdecHex(u, w + H)) - f2) / H;
        const det = j11 * j22 - j12 * j21;
        if (Math.abs(det) < 1e-18) throw Error(`Newton singular at u=${u.toFixed(6)} w=${w.toFixed(6)}`);
        u -= (f1 * j22 - f2 * j12) / det;
        w -= (f2 * j11 - f1 * j21) / det;
        if (u <= 0 || w <= 0) throw Error(`Newton left the positive quadrant: u=${u.toFixed(6)} w=${w.toFixed(6)}`);
    }
    const lsd = LsqDec(u, w), lsh = LsqHex(u, w), ldh = LdecHex(u, w);
    if (Math.abs(lsd - lsh) > 1e-12 || Math.abs(lsd - ldh) > 1e-12)
        throw Error(`Newton failed: |sd-sh| ${Math.abs(lsd - lsh).toExponential(2)}, |sd-dh| ${Math.abs(lsd - ldh).toExponential(2)}`);
    return { u, w, L: lsd };
})();
const { u: CUT_U, w: BEVEL_W, L: L_COMMON } = solveUW;
const K_SCALE = 2 / L_COMMON;             // scale so the common parent edge == 2 EXACTLY

// ---- the parent's 120 verts + 180 edges + 62 faces (trico chassis, verbatim math) ----------------------
const H0 = depths(CUT_U, BEVEL_W);
const H_scaled = { dec: H0.dec * K_SCALE, sq: H0.sq * K_SCALE, hex: H0.hex * K_SCALE };
const hOf = (fam: "dec" | "sq" | "hex") => H_scaled[fam];
const ALL_DIRS: { d: V3; h: number }[] = [
    ...DEC_DIRS.map((d) => ({ d, h: H_scaled.dec })),
    ...SQ_DIRS.map((d) => ({ d, h: H_scaled.sq })),
    ...HEX_DIRS.map((d) => ({ d, h: H_scaled.hex })),
];
const solve3 = (n1: V3, h1: number, n2: V3, h2: number, n3: V3, h3: number): V3 => {
    const r1 = cross(n2, n3), r2 = cross(n3, n1), r3 = cross(n1, n2);
    const det = dot(n1, r1);
    if (Math.abs(det) < 1e-12) throw Error("degenerate triple");
    return add(add(mul(r1, h1 / det), mul(r2, h2 / det)), mul(r3, h3 / det));
};
const M: V3[] = [];
{
    const vertEdgesOf = (vi: number) => P_EDGES.map(([i, j], ei) => (i === vi || j === vi) ? ei : -1).filter((x) => x >= 0);
    const seen = (p: V3) => M.some((q) => dist(q, p) < 1e-9);
    for (let p = 0; p < 12; p++) {
        for (let ei = 0; ei < 30; ei++) {
            const [fa, fb] = edgeFaces[ei];
            if (fa !== p && fb !== p) continue;
            const ends = P_EDGES[ei];
            for (const t of ends) {
                if (!parentFaceVerts[p].includes(t)) continue;
                const x = solve3(DEC_DIRS[p], H_scaled.dec, SQ_DIRS[ei], H_scaled.sq, HEX_DIRS[t], H_scaled.hex);
                let ok = true;
                for (const { d, h } of ALL_DIRS) if (dot(x, d) > h + 1e-9) { ok = false; break; }
                if (ok && !seen(x)) M.push(x);
            }
        }
    }
}
if (M.length !== 120) throw Error(`trico verts ${M.length} != 120`);
const P_EDGE = 2;
const PEDGES: [number, number][] = [];
for (let i = 0; i < 120; i++) for (let j = i + 1; j < 120; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-9) PEDGES.push([i, j]);
if (PEDGES.length !== 180) throw Error(`trico edges ${PEDGES.length} != 180`);
const R_UNIT = Math.max(...M.map((v) => Math.hypot(...v)));
for (const v of M) if (Math.abs(Math.hypot(...v) - R_UNIT) > 1e-9) throw Error("trico verts not co-spherical");

type Family = "dec" | "sq" | "hex";
type Face = { k: number; verts: number[]; center: V3; n: V3; family: Family };
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
    const h = hOf(family);
    const order = M.map((v, i) => [dot(v, dir), i] as [number, number]).sort((a, b) => b[0] - a[0]);
    const plane = order[k - 1][0];
    if (Math.abs(order[0][0] - plane) > 1e-9) throw Error(`face plane not level (${family})`);
    if (plane - order[k][0] < 1e-9) throw Error(`face plane ambiguous (${family})`);
    if (Math.abs(plane - h) > 1e-9) throw Error(`face plane off its solved depth (${family})`);
    const { verts, center, n } = orderRingM(order.slice(0, k).map(([, i]) => M[i]));
    if (dist(n, dir) > 1e-9) throw Error(`face normal off its dir (${family})`);
    pfaces.push({ k, verts, center, n, family });
};
for (const d of DEC_DIRS) buildFace(d, 10, "dec");
for (const d of SQ_DIRS) buildFace(d, 4, "sq");
for (const d of HEX_DIRS) buildFace(d, 6, "hex");
if (pfaces.length !== 62) throw Error(`parent faces ${pfaces.length} != 62`);

// parent edge -> its two faces
const edgeFacesM = new Map<string, number[]>();
for (let fi = 0; fi < pfaces.length; fi++) for (let t = 0; t < pfaces[fi].verts.length; t++) {
    const a = pfaces[fi].verts[t], b = pfaces[fi].verts[(t + 1) % pfaces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFacesM.set(kk, [...(edgeFacesM.get(kk) ?? []), fi]);
}

// ==== THE DUAL: polar reciprocal about the midsphere ====================================================

// ---- midsphere: every parent edge midpoint at one radius rho -------------------------------------------
const rho = (() => { const [i, j] = PEDGES[0]; return Math.hypot(...mul(add(M[i], M[j]), 0.5)); })();
let rhoSpread = 0;
for (const [i, j] of PEDGES) {
    const m = mul(add(M[i], M[j]), 0.5);
    rhoSpread = Math.max(rhoSpread, Math.abs(Math.hypot(...m) - rho));
}

// ---- the 62 dual vertices: v_u = (rho^2 / h_u) . n_u ---------------------------------------------------
const R2 = rho * rho;
const TYPE: Family[] = pfaces.map((f) => f.family);
const DV: V3[] = pfaces.map((f) => mul(f.n, R2 / hOf(f.family)));
const classR = { dec: R2 / H_scaled.dec, sq: R2 / H_scaled.sq, hex: R2 / H_scaled.hex };

// ---- the 120 dual faces: one scalene triangle per parent vertex ----------------------------------------
type DFace = { verts: number[]; center: V3; n: V3; ofVertex: number };
const DUAL_FACES: DFace[] = [];
{
    const pidxD = (p: V3) => {
        const k = DV.findIndex((q) => dist(q, p) < 1e-9);
        if (k >= 0) return k;
        throw Error("dual face vertex not in dual set");
    };
    for (let i = 0; i < 120; i++) {
        const inc: number[] = [];
        for (let fi = 0; fi < pfaces.length; fi++) if (pfaces[fi].verts.includes(i)) inc.push(fi);
        if (inc.length !== 3) throw Error(`parent vertex ${i}: ${inc.length} incident faces (want 3)`);
        const fams = inc.map((fi) => TYPE[fi]).sort().join("+");
        if (fams !== "dec+hex+sq") throw Error(`parent vertex ${i} figure ${fams} (want dec+hex+sq)`);
        const ring = inc.map((fi) => DV[fi]);
        const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / 3);
        const n = nrm(M[i]);                     // EXACT plane normal: the parent vertex direction
        const e1 = nrm(sub(ring[0], c));
        const e2 = cross(n, e1);
        const ordered = [...ring].sort((p, q) =>
            Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
        DUAL_FACES.push({ verts: ordered.map((p) => pidxD(p)), center: c, n, ofVertex: i });
    }
    if (DUAL_FACES.length !== 120) throw Error(`dual faces ${DUAL_FACES.length} != 120`);
}

// ---- the 180 dual edges: one per parent edge, joining the duals of its two faces ------------------------
const DUAL_EDGES: [number, number][] = [];
{
    const seen = new Set<string>();
    for (const [a, b] of PEDGES) {
        const fl = edgeFacesM.get(a < b ? `${a}-${b}` : `${b}-${a}`)!;
        if (fl.length !== 2) throw Error(`parent edge ${a}-${b}: ${fl.length} faces (want 2)`);
        const [u1, u2] = fl;
        const key = u1 < u2 ? `${u1}-${u2}` : `${u2}-${u1}`;
        if (seen.has(key)) throw Error(`duplicate dual edge ${key}`);
        seen.add(key);
        DUAL_EDGES.push(u1 < u2 ? [u1, u2] : [u2, u1]);
    }
    if (DUAL_EDGES.length !== 180) throw Error(`dual edges ${DUAL_EDGES.length} != 180`);
}
export const E: [number, number][] = DUAL_EDGES;

// ==== SEAT: the trico's own seated frame, INHERITED (decagon-down + twist-snap, verbatim math) ===========

// ---- seating: dodeca face normal (0,-phi,1) -> -Y (DECAGON DOWN = the dual's 5-fold point DOWN) ---------
const v0 = nrm([0, -PHI, 1]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// the WAIST decagons (non-axis): lower ring = the five with the least rot1 center y
let snapFace: Face = pfaces[0];
{
    let bestY = Infinity;
    for (const f of pfaces) {
        if (f.family !== "dec") continue;
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
// Ry(t) maps az a -> a-t (az = atan2(z,x)); twist = snapAz zeroes the snap face.
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], az0);
const rot = (v: V3): V3 => rot2(rot1(v));
{
    const sn = rot(snapFace.center);
    if (Math.abs(Math.atan2(sn[2], sn[0])) > 1e-9) throw Error(`twist-snap missed: az ${Math.atan2(sn[2], sn[0])}`);
}

// ---- scale + lift: the FOOT dec-rank point (the snap-frame's -Y axis) lands exactly on the dais top ----
const seatedUnit = DV.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
const seated = seatedUnit.map((v) => mul(v, SCALE));
const yMinUnit = Math.min(...seatedUnit.map((v) => v[1]));
const LIFT = PLINTH_H - yMinUnit * SCALE;
export const V: V3[] = seated.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);
export const SOLID_CENTER: V3 = [0, LIFT + (Math.max(...seatedUnit.map(v => v[1])) + yMinUnit) / 2 * SCALE, 0];
export const FACE_V: number[][] = DUAL_FACES.map((f) => f.verts);
export const CENTERS: V3[] = DUAL_FACES.map((f) => {
    const c = rot(f.center);
    return [c[0] * SCALE, c[1] * SCALE + LIFT, c[2] * SCALE] as V3;
});
export const NORMALS: V3[] = DUAL_FACES.map((f) => rot(f.n));

// rank indices (dec = the 12 shallow crown-points)
export const DEC_IDX: number[] = TYPE.map((t, i) => t === "dec" ? i : -1).filter((i) => i >= 0);
export const CROWN_IDX = DEC_IDX.reduce((best, i) => V[i][1] > V[best][1] ? i : best, DEC_IDX[0]);
export const FOOT_IDX = DEC_IDX.reduce((best, i) => V[i][1] < V[best][1] ? i : best, DEC_IDX[0]);
export const WAIST_IDX = DEC_IDX.filter((i) => i !== CROWN_IDX && i !== FOOT_IDX);

// ---- the 12 brass beads: 1 crown finial + 10 waist poked radial + 1 pressed foot ------------------------
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

// ---- derived footprint constants (BEFORE all checks — no TDZ) ------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
// APOTHEM-FIRST dais law (struct-247 fix, carried for all N)
export const PLINTH_R = Math.ceil(((MAX_H + ROD_R + 0.10) / Math.cos(Math.PI / PLINTH_N)) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// RED control (--red displaces one dual vertex: breaks face/edge/symmetry laws)
if (process.argv.includes("--red")) {
    V[7] = [V[7][0] + 0.3, V[7][1] - 0.2, V[7][2] + 0.15];
    console.log("RED MODE: dual vertex 7 displaced 0.3 — T2/T5/T6/T7 MUST fail");
}

// ==== T0 dual census + midsphere + radius classes =======================================================
{
    let worstR = 0;
    for (let u = 0; u < 62; u++) worstR = Math.max(worstR, Math.abs(Math.hypot(...DV[u]) - classR[TYPE[u]]));
    const nDec = TYPE.filter((t) => t === "dec").length;
    const nSq = TYPE.filter((t) => t === "sq").length;
    const nHex = TYPE.filter((t) => t === "hex").length;
    check("T0 dual census + midsphere: 62/180/120; every parent edge midpoint at exactly ONE radius rho (the reciprocation sphere exists); the three dual vertex radii classes rho^2/h exact (12 shallow + 30 mid + 20 deep)",
        rhoSpread < 1e-12 && worstR < 1e-12 && nDec === 12 && nSq === 30 && nHex === 20
        && DV.length === 62 && DUAL_EDGES.length === 180 && DUAL_FACES.length === 120,
        `midsphere spread ${rhoSpread.toExponential(1)} (rho ${rho.toFixed(9)}, parent edge 2 frame); radii dec ${classR.dec.toFixed(6)} / sq ${classR.sq.toFixed(6)} / hex ${classR.hex.toFixed(6)} worst dev ${(worstR * 1e12).toExponential(1)} — the shallowest planes (the parent's own faces) become the OUTERMOST points: the gem's crown-points`);
}

// ---- T1 Euler -----------------------------------------------------------------------------------------
check("T1 Euler 62−180+120 = 2", V.length === 62 && DUAL_EDGES.length === 180 && DUAL_FACES.length === 120 && V.length - DUAL_EDGES.length + DUAL_FACES.length === 2,
    `V ${V.length}, E ${DUAL_EDGES.length}, F ${DUAL_FACES.length}, chi ${V.length - DUAL_EDGES.length + DUAL_FACES.length}`);

// ---- T2 face census: the face-transitive Catalan signature --------------------------------------------
{
    const aRef: Record<Family, number> = { dec: -1, sq: -1, hex: -1 };
    let worstAng = 0, worstSum = 0, badFam = 0;
    for (const F of DUAL_FACES) {
        const vs = F.verts;
        const fams = vs.map((vi) => TYPE[vi]).sort().join("+");
        if (fams !== "dec+hex+sq") badFam++;
        let sum = 0;
        for (let t = 0; t < 3; t++) {
            const p0 = V[vs[(t + 2) % 3]], p1 = V[vs[t]], p2 = V[vs[(t + 1) % 3]];
            const ang = Math.acos(Math.max(-1, Math.min(1, dot(nrm(sub(p0, p1)), nrm(sub(p2, p1))))));
            sum += ang;
            const ty = TYPE[vs[t]];
            if (aRef[ty] < 0) aRef[ty] = ang;
            else worstAng = Math.max(worstAng, Math.abs(ang - aRef[ty]));
        }
        worstSum = Math.max(worstSum, Math.abs(sum - Math.PI));
    }
    check("T2 faces: 120 triangles; per-face angle multiset IDENTICAL across ALL faces (three global classes, each at its own rank) — the face-transitive Catalan signature; every face one dec + one sq + one hex; angle sum pi",
        worstAng < 1e-12 && worstSum < 1e-12 && badFam === 0,
        `worst angle dev ${(worstAng * 1e12).toExponential(1)}; worst sum dev ${worstSum.toExponential(1)}; angles dec ${(aRef.dec * 180 / Math.PI).toFixed(4)}deg / sq ${(aRef.sq * 180 / Math.PI).toFixed(4)}deg / hex ${(aRef.hex * 180 / Math.PI).toFixed(4)}deg (MEASURED — the Catalan's own scalene triangle)`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------
{
    const deg = new Array(62).fill(0);
    for (const [a, b] of DUAL_EDGES) { deg[a]++; deg[b]++; }
    const want: Record<Family, number> = { dec: 10, sq: 4, hex: 6 };
    let bad = 0;
    for (let u = 0; u < 62; u++) if (deg[u] !== want[TYPE[u]]) bad++;
    check("T3 vertices: degree 10 at the 12 dec-rank crown-points / 4 at the 30 sq-rank / 6 at the 20 hex-rank; Sum(deg) == 2E",
        bad === 0 && deg.reduce((s, d) => s + d, 0) === 2 * DUAL_EDGES.length,
        `rank violations ${bad}; Sum(deg) ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * DUAL_EDGES.length} — the parent's decagons/squares/hexagons live on as vertex figures`);
}

// ---- T4 manifold --------------------------------------------------------------------------------------
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
    check("T4 manifold: every dual edge on exactly 2 faces", bad === 0 && unmatched === 0 && ef.size === 180,
        `${ef.size} face-edges (360 slots), ${bad} wrong multiplicity, ${unmatched} of ${DUAL_EDGES.length} unmatched`);
}

// ---- T5 edge census -----------------------------------------------------------------------------------
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
    const sameRank = keys.filter((k) => k === "dec-dec" || k === "sq-sq" || k === "hex-hex");
    const allSpread = [...classes.values()].every((c) => c.worstLen < 1e-12);
    const pairKey = (x: string, y: string) => [x, y].sort().join("-");
    check("T5 edges: exactly THREE rank-pair classes dec-sq / sq-hex / dec-hex, 60 each, ZERO same-rank; three edge-length classes, 60 each, equal within class (lengths MEASURED — the Catalan is face-transitive, NOT uniform: unequal classes are the honest signature)",
        sameRank.length === 0 && keys.length === 3 && classes.get(pairKey("dec", "hex"))!.n === 60 && classes.get(pairKey("sq", "hex"))!.n === 60 && classes.get(pairKey("dec", "sq"))!.n === 60 && allSpread,
        `classes: ${keys.map((k) => `${k} ${classes.get(k)!.n} edges L ${classes.get(k)!.len.toFixed(6)} (spread ${(classes.get(k)!.worstLen * 1e12).toExponential(1)})`).join("; ")}; same-rank ${sameRank.length}`);
}

// ---- T6 THE POLAR RECIPROCAL --------------------------------------------------------------------------
{
    // (a) all 120 faces kiss ONE insphere: every vert at exactly plane depth rho^2/R from the center
    const wantPlane = (R2 / R_UNIT) * SCALE;
    let worstPlane = 0;
    for (const F of DUAL_FACES) {
        const n = NORMALS[DUAL_FACES.indexOf(F)];
        for (const vi of F.verts) worstPlane = Math.max(worstPlane, Math.abs(dot(sub(V[vi], SOLID_CENTER), n) - wantPlane));
    }
    // (b) every dual face normal is EXACTLY one parent vertex direction (pre-seat, bijection)
    let worstN = 0;
    const used = new Set<number>();
    for (const F of DUAL_FACES) {
        worstN = Math.max(worstN, dist(F.n, nrm(M[F.ofVertex])));
        used.add(F.ofVertex);
    }
    check("T6 THE POLAR RECIPROCAL: all 120 faces kiss ONE insphere (every vert at exactly plane depth rho^2/R — the Catalan tangent property, mirror of the parent's every-vertex-on-one-sphere); every face normal EXACTLY one parent vertex direction (bijection)",
        worstPlane < 1e-12 && worstN < 1e-12 && used.size === 120,
        `worst plane dev ${(worstPlane * 1e12).toExponential(1)} vs depth ${wantPlane.toFixed(9)} (rho^2/R scaled); worst normal dev ${worstN.toExponential(1)}; parent-vertex bijection ${used.size}/120`);
}

// ---- T7 seat laws -------------------------------------------------------------------------------------
{
    const footV = V[FOOT_IDX], crownV = V[CROWN_IDX];
    const axisOk = Math.hypot(footV[0], footV[2]) < 1e-12 && Math.hypot(crownV[0], crownV[2]) < 1e-12;
    const footAtDais = Math.abs(footV[1] - PLINTH_H) < 1e-12;
    // 72-degree symmetry about Y
    const a = Math.PI * 2 / 5, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    // central inversion (the parent's own inversion, inherited exactly)
    let invMiss = 0;
    for (const v of V) { const r = sub(SOLID_CENTER, sub(v, SOLID_CENTER)); if (!V.some((q) => dist(q, r) < 1e-6)) invMiss++; }
    const cx = V.reduce((s2, v) => s2 + v[0], 0) / 62;
    const cz = V.reduce((s2, v) => s2 + v[2], 0) / 62;
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
    // FINIAL-CLEARANCE LAW (tret v2): crown bead top must clear the upper pentad rim's sight line
    const rimY = Math.max(...upper.map((p) => p[1]));
    const rimR = Math.max(...upper.map((p) => Math.hypot(p[0], p[2])));
    const crownPlane = crownV[1] + BEAD_POKE;
    const beadTop = crownPlane + STEM_H + BEAD_R;
    const sightY = rimY + (rimY - READER_EYE) * rimR / (READER_D - rimR);
    const finialClear = beadTop - sightY;
    // bead census
    const crownBead = BEADS[DEC_IDX.indexOf(CROWN_IDX)];
    const footBead = BEADS[DEC_IDX.indexOf(FOOT_IDX)];
    const waistBeads = BEADS.filter((_, k) => k !== DEC_IDX.indexOf(CROWN_IDX) && k !== DEC_IDX.indexOf(FOOT_IDX));
    const waistAloft = waistBeads.every((p) => p[1] - BEAD_R > PLINTH_H);
    const t7parts = {
        axisOk, footAtDais, symMiss, invMiss, ctr: Math.hypot(cx, cz),
        hgt: height.toFixed(6), reach: (MAX_H + ROD_R).toFixed(3), apothem: apothem.toFixed(3),
        rings: `${lower.length}+${upper.length}`, lowerLevel: levelSpread(lower).toExponential(1),
        upperLevel: levelSpread(upper).toExponential(1), radiusSpread: radiusSpread(lower).toExponential(1),
        lowerLattice, hasSnap, upperLattice, upperOffsetDeg: (upperOffset * 180 / Math.PI).toFixed(2),
        pentadPaired, finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3),
        waistAloft,
    };
    check("T7 seat: foot + crown dec-rank points dead on the axis, foot AT dais top (POINT-DOWN 5-fold, the parent's own frame inherited); 72-degree symmetry 0 misses; central inversion exact; centroid on axis; height == target; never overhangs (apothem-first); TEN waist dec-rank points = two exact level 72-degree pentads, lower snapped dead-on az 0 (parent twist INHERITED), upper offset measured, inversion-paired; beads 1 crown finial + 10 waist aloft + 1 pressed foot (the 30 sq-rank + 20 hex-rank points DARK)",
        axisOk && footAtDais && symMiss === 0 && invMiss === 0 && Math.hypot(cx, cz) < 1e-12
        && Math.abs(height - TARGET_H) < 1e-9 && MAX_H + ROD_R <= apothem + 1e-9
        && lower.length === 5 && upper.length === 5 && levelSpread(lower) < 1e-12 && levelSpread(upper) < 1e-12
        && radiusSpread(lower) < 1e-12 && radiusSpread(upper) < 1e-12
        && lowerLattice && hasSnap && upperLattice && pentadPaired
        && waistAloft && Math.hypot(crownBead[0], crownBead[2]) < 1e-12
        && Math.abs(footBead[1] - FOOT_BEAD_Y) < 1e-12
        && FOOT_BEAD_Y - BEAD_R >= -1e-9 && FOOT_BEAD_Y + BEAD_R <= PLINTH_H + 1e-9
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; bottom point ${footV[1].toFixed(6)} == dais top ${PLINTH_H}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); pentads level/radii exact, upper offset ${(upperOffset * 180 / Math.PI).toFixed(2)}deg (geometry-decided, disclosed); FINIAL crown bead top ${beadTop.toFixed(3)} clears rim sight line ${sightY.toFixed(3)} by ${finialClear.toFixed(3)}m (>= ${1.5 * BEAD_R} law)`);
}

// ---- T8 immersion -------------------------------------------------------------------------------------
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
        `worst outward poke ${worstPlane.toExponential(1)} (<= 0 = fully inside); max corner tuck into rod cylinders ${worstTuck.toFixed(4)}m (invisible — inside solid rod geometry); plate outer face ${PLATE_BACK * 1000}mm behind the rod outer surface; the foot spike is pure rod geometry — plates inset short of the point (family look)`);
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

console.log(`solve: parent Newton u ${CUT_U.toFixed(9)} w ${BEVEL_W.toFixed(9)} (parent edge-2 frame); midsphere rho ${rho.toFixed(9)} -> dual radii dec ${classR.dec.toFixed(6)} / sq ${classR.sq.toFixed(6)} / hex ${classR.hex.toFixed(6)}; scale ${SCALE.toFixed(9)} (height ${TARGET_H})`);
console.log(`seat: POINT-DOWN 5-fold on the parent's own frame (decagon-down + twist-snap INHERITED — no re-seat); foot dec-rank point at dais top ${PLINTH_H}; solid height ${TARGET_H}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} -> ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} >= reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`build: 180 iron seam rods + 120 stone triangle sails + ${PLINTH_N}-gon stone dais + glow_dtria_12 (1 crown finial + 10 waist + 1 pressed foot); the 30 sq-rank + 20 hex-rank points stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct267-dtria)");
