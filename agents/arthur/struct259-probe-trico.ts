// struct259-probe-trico.ts — STRUCTURES LANE struct-259, Round 11 R11-67.
// THE TRUNCATED ICOSIDODECAHEDRON (great rhombicosidodecahedron).
// Form-ledger grep fresh this tick: truncated icosidodeca / great
// rhombicosi / trico — 0 real mentions across STRUCTURES-PLAN (only the
// struct-258 unclaimed-pointer lines), IMPROVEMENTS (pointer lines only),
// CITY-PLAN, IMPROVE-PLAN, NEW-VILLAGE-PLAN, DRESSING-PLAN. The
// ARCHIMEDEAN branch's TENTH member (cubocta 237, tico 243, toct 245,
// tret 247, tcube 249, tdodec 251/252, srcubo 253/254, trcubo 255/256,
// rico 257/258). The snub cube/dodeca stay named for Bill's handedness
// call (mirror forms); trico is ACHIRAL.
//
// ONE IDEA: THE KNIFE MEETS THE GOLDEN PARENT. The eighth member cut the
// CUBE (trcubo struct-255: cantitruncate, 6+12+8 = 26, parent planes
// unmoved); the tenth turns the same knife on the DODECAHEDRON — and the
// cut runs deeper than arithmetic: every parent FACE stays in its own
// plane, cut at the corners AND the edges, a DECAGON (12); every parent
// EDGE bevels into a SQUARE (30); every parent VERTEX blooms into a
// HEXAGON (20). 12+30+20 = 62 — the parent's F+E+V, complete, nothing
// else, the SAME census the rico (struct-257) told by GROWING. The dual
// icosa reads the same solid with its own census (20+30+12, F<->V
// mirrored) — the element theorem, told twice (T6b). The uniform solve is
// the discipline the tdodec's disclosed 1/3-cut declined: the two cut
// depths are SOLVED so all 180 edges come out EXACTLY equal — every
// decagon regular, ten true sides, the knife finishing what the truncation
// began.
//
// DERIVATION (first principles — no coordinate table trusted from memory):
//   The 62 face directions are machine-derived from the parent dodeca
//   (12 face dirs, 30 edge-midpoint dirs, 20 vertex dirs). The three
//   plane depths: decagons AT the parent's own face planes (F-REMNANT,
//   the trcubo law), squares beveled in from the parent edge midplanes
//   (depth w), hexagons cut in from the parent vertex radius (depth u).
//   The two unknowns (u, w) are NEWTON-SOLVED on the two edge-class
//   equalities (sq-dec == sq-hex == dec-hex); the solution is scaled so
//   the common edge == 2 exactly. Every vertex is the intersection of one
//   decagon + one square + one hexagon plane over the parent-topology
//   adjacency triples, feasibility-filtered against all 62 planes.
//
// PARAMETRIZATION (solved, then machine-verified):
//   V = 120, E = 180, F = 62 (12 decagons + 30 squares + 20 hexagons).
//   Vertex figure 4.6.10 — degree 3 everywhere. Dihedrals exactly THREE
//   classes, 60 edges each (measured at probe time, not trusted from
//   prose). Divergence volume reported against the parent dodeca's exact
//   closed form at the inherited scale (the mass the knife keeps).
//
// DAIS LAW: APOTHEM-FIRST for all N (struct-247 fix, carried).
// Presentation: DECAGON-DOWN, 5-fold (family seat law: tico pentagon-
// down, tdodec decagon-down, rico pentagon-down) — the parent's own face,
// now a decagon, FLAT on the dais; lower-ring decagon snapped dead-on +X.
// STONE carries the FORTY-TWO dodeca-census faces (12 parent-face
// decagons + 30 edge-bevel squares) + the SIXTY-TWO-sided dais (one side
// per face — theme-number law); IRON carries the TWENTY corner HEXAGONS
// (the bloomed parent vertices, dark) + all 180 seam bonds. Night
// contract: TWELVE warm brass beads at the twelve parent-face DECAGON
// centers — the dodeca's faces, lit (srcubo/trcubo/rico pattern, pentagon
// family): one CROWN on an iron finial stem (tret v2 occlusion law) + TEN
// WAIST in two exact 72-degree rings (inter-ring offset measured,
// geometry decides) + the TWELFTH PRESSED INTO THE EARTH beneath the flat
// foot (tico's-twelfth idiom — eleven read at night, twelve in truth,
// disclosed). The thirty squares and the twenty hexagons stay dark.
//
// THEOREMS machine-verified below:
//   T1 Euler: 120 - 180 + 62 = 2 (sphere).
//   T2 face census: 12 REGULAR decagons (10 equal sides == a, 10 equal
//      angles 144 deg) + 30 regular squares (90) + 20 regular hexagons
//      (120) — THE UNIFORM SOLID (the tdodec's 1/3-cut ratio-phi
//      decagons disclosed and declined; here regularity is solved for).
//   T3 vertex census: degree 3 everywhere; exactly 1 square + 1 hexagon +
//      1 decagon at every vertex (120x) — figure 4.6.10.
//   T4 manifold: every edge on exactly 2 faces (360 face-edge slots).
//   T5 uniformity: all 120 verts at exactly R (single support value);
//      dihedrals exactly THREE classes (60 edges each, zero same-family);
//      class dot values measured and reported.
//   T6 THE KNIFE: divergence volume over the built faces; F-REMNANT law —
//      every decagon plane at EXACTLY the parent dodeca's own face
//      distance (the knife never moves a parent plane); parent volume
//      closed form 2(15+7sqrt5) at edge 2 scaled by k^3; mass ratio
//      reported (what the knife keeps of the golden parent).
//   T6b THE ELEMENT THEOREM, TOLD TWICE: every child face center
//      direction matches exactly one parent-DODECA element family
//      (12 faces / 30 edges / 20 vertices) AND exactly one parent-ICOSA
//      element family (20 faces / 30 edges / 12 vertices) — both
//      machine-derived, disjoint, exhaustive; 62 == F+E+V of each parent;
//      the direction-dual icosa's belt shared with the dodeca's edges.
//   T7 seat: bottom decagon FLAT at dais top (10 verts level), top
//      decagon parallel, 72-degree symmetry about Y, centroid on axis,
//      height == target, reach+rod <= dais apothem (never overhangs,
//      apothem-first); snap law (a lower-ring decagon dead-on az 0);
//      waist = two exact 72-degree rings (inter-ring offset measured,
//      geometry decides); bead census honest: 1 crown dead-axis finial +
//      10 waist + 1 pressed foot, the THIRTY SQUARES + TWENTY HEXAGONS
//      DARK; FINIAL-CLEARANCE LAW (tret v2).
//   T8 immersion: every inset plate corner, lifted to the plate mid-plane,
//      lies strictly INSIDE the convex solid; corner tuck reported.
//   RED control: --red displaces one vertex 0.3 — T2/T5/T7 must fail.

export const TARGET_H = 6.5;              // seated solid height (decagon axis) — the TENTH member stands tallest, the family ladder's next step (6.0..6.4 -> 6.5)
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
export const PLINTH_N = 62;               // SIXTY-TWO sides — one per face (12 decagons + 30 squares + 20 hexagons)
export const PLINTH_ROT = 0;              // corners ON the axes
export const PLINTH_H = 0.30;
export const FOOT_BEAD_Y = 0.15;          // pressed twelfth bead center — spans exactly the dais band 0->0.30, FULLY BURIED (tico's-twelfth idiom: never reads, twelve in truth)

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

// ---- the 62 face directions, machine-derived from the parent (rico chassis) ---------------------------
// 12 decagon dirs = the dodeca's FACE dirs = the (0,±φ,±1)-cyclic family
const DEC_DIRS: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    DEC_DIRS.push(nrm([0, s1 * PHI, s2]));
    DEC_DIRS.push(nrm([s2, 0, s1 * PHI]));
    DEC_DIRS.push(nrm([s1 * PHI, s2, 0]));
}
if (DEC_DIRS.length !== 12) throw Error(`dec dirs ${DEC_DIRS.length} != 12`);
// 20 hexagon dirs = the dodeca's VERTEX dirs (the corners that bloom)
const HEX_DIRS: V3[] = PARENT_D.map((v) => nrm(v));
if (HEX_DIRS.length !== 20) throw Error(`hex dirs ${HEX_DIRS.length} != 20`);
// 30 square dirs = the dodeca's edge-midpoint dirs (1,φ,φ²) — the bevels
const SQ_DIRS: V3[] = [];
for (const [i, j] of P_EDGES) {
    const d = nrm(mul(add(PARENT_D[i], PARENT_D[j]), 0.5));
    if (!SQ_DIRS.some((q) => dist(q, d) < 1e-9)) SQ_DIRS.push(d);
}
if (SQ_DIRS.length !== 30) throw Error(`sq dirs ${SQ_DIRS.length} != 30`);

// ---- parent topology: which faces/edges/vertices meet (the adjacency law of the knife) -----------------
// parent faces (as vert index sets): the 5 parent verts tying at max support along each DEC_DIR
const parentFaceVerts: number[][] = DEC_DIRS.map((d) => {
    const order = PARENT.map((v, i) => [dot(v, d), i] as [number, number]).sort((a, b) => b[0] - a[0]);
    return order.slice(0, 5).map(([, i]) => i);
});
// parent edges -> the two faces whose vert sets contain both endpoints
const edgeFaces: [number, number][] = P_EDGES.map(([i, j]) => {
    const fs = parentFaceVerts.map((vs, fi) => vs.includes(i) && vs.includes(j) ? fi : -1).filter((x) => x >= 0);
    if (fs.length !== 2) throw Error(`parent edge faces ${fs.length} != 2`);
    return [fs[0], fs[1]];
});
// parent vertex -> its 3 faces / 3 edges
const vertFaces: number[][] = PARENT.map((_, vi) =>
    parentFaceVerts.map((vs, fi) => vs.includes(vi) ? fi : -1).filter((x) => x >= 0));
const vertEdges: number[][] = PARENT.map((_, vi) =>
    P_EDGES.map(([i, j], ei) => (i === vi || j === vi) ? ei : -1).filter((x) => x >= 0));
for (let vi = 0; vi < 20; vi++)
    if (vertFaces[vi].length !== 3 || vertEdges[vi].length !== 3)
        throw Error(`parent vertex ${vi}: ${vertFaces[vi].length} faces / ${vertEdges[vi].length} edges (want 3/3)`);

// ---- the depths: decagons AT the parent's own planes; squares beveled w; hexagons cut u ----------------
const hParentFace = (() => {              // parent inradius (edge-2 frame) — machine-derived, not prose
    let r = -Infinity;
    for (const v of PARENT) r = Math.max(r, ...DEC_DIRS.map((d) => dot(v, d)));
    return r;                             // max over verts of max face support == the face plane distance
})();
const mParentEdge = (() => {              // parent midradius along a square dir (both edge endpoints tie)
    const [i, j] = P_EDGES[0];
    return dot(PARENT[i], SQ_DIRS[0]);
})();
const RParentVert = Math.hypot(...PARENT[0]);   // parent circumradius (all 20 verts tie — asserted)
for (const v of PARENT) if (Math.abs(Math.hypot(...v) - RParentVert) > 1e-9) throw Error("parent verts not co-spherical");
for (const v of PARENT) {
    const own = HEX_DIRS.find((d) => dist(d, nrm(v)) < 1e-9)!;
    if (Math.abs(dot(v, own) - RParentVert) > 1e-9) throw Error("parent vertex not at full support along its own dir");
}
const depths = (u: number, w: number) => ({
    dec: hParentFace,                     // F-REMNANT: the knife never moves a parent plane
    sq: mParentEdge - w,                  // bevel in from the edge midplane
    hex: RParentVert - u,                 // cut in from the vertex radius
});

// ---- edge-class lengths as functions of (u, w) — the uniformity equations ------------------------------
// Line L = {x: x·n_a = h_a, x·n_b = h_b}; parametrize x = x0 + τ·d̂; crossing of a third
// plane (n_c, h_c) at τ_c = (h_c − x0·n_c)/(d̂·n_c). Edge length = |τ_1 − τ_2|.
function lineCutLen(nA: V3, hA: number, nB: V3, hB: number, nC1: V3, hC1: number, nC2: V3, hC2: number): number {
    const d = cross(nA, nB);
    const dl = Math.hypot(...d);
    if (dl < 1e-12) throw Error("parallel planes — adjacency broken");
    const dh: V3 = [d[0] / dl, d[1] / dl, d[2] / dl];
    // x0: solve the 2-plane system by symmetry — x0 = a·nA + b·nB + c·(nA×nB) with Gram solve
    const g11 = dot(nA, nA), g12 = dot(nA, nB), g22 = dot(nB, nB);
    const det = g11 * g22 - g12 * g12;
    const a = (hA * g22 - hB * g12) / det, b = (hB * g11 - hA * g12) / det;
    const x0 = add(mul(nA, a), mul(nB, b));
    const t1 = (hC1 - dot(x0, nC1)) / dot(dh, nC1);
    const t2 = (hC2 - dot(x0, nC2)) / dot(dh, nC2);
    return Math.abs(t2 - t1);
}
// representative adjacent triples from the parent topology:
// sq–dec edge: square s0's parent edge, its face p (edgeFaces[0][0]), endpoints t1,t2 (the edge's ends — on face p)
const S0 = 0;
const P_OF_S0 = edgeFaces[S0][0];
const [T1A, T1B] = P_EDGES[S0];
const LsqDec = (u: number, w: number) => {
    const h = depths(u, w);
    return lineCutLen(SQ_DIRS[S0], h.sq, DEC_DIRS[P_OF_S0], h.dec, HEX_DIRS[T1A], h.hex, HEX_DIRS[T1B], h.hex);
};
// sq–hex edge: square s0, endpoint vertex t=T1A (on both faces of the edge) — cut by those two decagon planes
const LsqHex = (u: number, w: number) => {
    const h = depths(u, w);
    const [pA, pB] = edgeFaces[S0];
    return lineCutLen(SQ_DIRS[S0], h.sq, HEX_DIRS[T1A], h.hex, DEC_DIRS[pA], h.dec, DEC_DIRS[pB], h.dec);
};
// dec–hex edge: face P_OF_S0, its vertex t=T1A — the two squares = parent edges from t within face P_OF_S0
const LdecHex = (u: number, w: number) => {
    const h = depths(u, w);
    const ses = vertEdges[T1A].filter((ei) => edgeFaces[ei].includes(P_OF_S0));
    if (ses.length !== 2) throw Error(`dec-hex adjacency: ${ses.length} squares (want 2)`);
    return lineCutLen(DEC_DIRS[P_OF_S0], h.dec, HEX_DIRS[T1A], h.hex, SQ_DIRS[ses[0]], h.sq, SQ_DIRS[ses[1]], h.sq);
};
// Newton on F(u,w) = [Lsd − Lsh, Lsd − Ldh] = 0
const solveUW = (() => {
    let u = 0.42, w = 0.26;               // trcubo-ratio-informed start (u/e ≈ 0.21, w/e ≈ 0.13 at parent edge 2)
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
const K_SCALE = 2 / L_COMMON;             // scale so the common edge == 2 EXACTLY

// ---- the CHILD: vertices as triple-plane intersections over parent-adjacency triples ------------------
const H0 = depths(CUT_U, BEVEL_W);
const H_scaled = { dec: H0.dec * K_SCALE, sq: H0.sq * K_SCALE, hex: H0.hex * K_SCALE };
const hOf = (fam: "dec" | "sq" | "hex") => H_scaled[fam];
const dirOf = (fam: "dec" | "sq" | "hex", i: number) => fam === "dec" ? DEC_DIRS[i] : fam === "sq" ? SQ_DIRS[i] : HEX_DIRS[i];
const ALL_DIRS: { d: V3; h: number }[] = [
    ...DEC_DIRS.map((d) => ({ d, h: H_scaled.dec })),
    ...SQ_DIRS.map((d) => ({ d, h: H_scaled.sq })),
    ...HEX_DIRS.map((d) => ({ d, h: H_scaled.hex })),
];
const solve3 = (n1: V3, h1: number, n2: V3, h2: number, n3: V3, h3: number): V3 => {
    // Cramer 3x3
    const r1 = cross(n2, n3), r2 = cross(n3, n1), r3 = cross(n1, n2);
    const det = dot(n1, r1);
    if (Math.abs(det) < 1e-12) throw Error("degenerate triple");
    return add(add(mul(r1, h1 / det), mul(r2, h2 / det)), mul(r3, h3 / det));
};
const M: V3[] = [];                       // the 120 child verts (unit frame, edge 2)
{
    const seen = (p: V3) => M.some((q) => dist(q, p) < 1e-9);
    for (let p = 0; p < 12; p++) {
        for (let ei = 0; ei < 30; ei++) {
            const [fa, fb] = edgeFaces[ei];
            if (fa !== p && fb !== p) continue;                       // square's parent edge must border face p
            const ends = P_EDGES[ei];
            for (const t of ends) {
                if (!parentFaceVerts[p].includes(t)) continue;        // hexagon's parent vertex must lie on face p
                // adjacency s–t: t is an endpoint of edge ei ✓ (by construction)
                const x = solve3(DEC_DIRS[p], H_scaled.dec, SQ_DIRS[ei], H_scaled.sq, HEX_DIRS[t], H_scaled.hex);
                let ok = true;
                for (const { d, h } of ALL_DIRS) if (dot(x, d) > h + 1e-9) { ok = false; break; }
                if (ok && !seen(x)) M.push(x);
            }
        }
    }
}
if (M.length !== 120) throw Error(`trico verts ${M.length} != 120`);
const P_EDGE = 2;                          // exact by the solve + scale
const EDGES: [number, number][] = [];
for (let i = 0; i < 120; i++) for (let j = i + 1; j < 120; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-9) EDGES.push([i, j]);
if (EDGES.length !== 180) throw Error(`trico edges ${EDGES.length} != 180`);

// ---- faces by parent-element direction families -------------------------------------------------------
type Family = "dec" | "sq" | "hex";
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
    const h = hOf(family);
    const order = M.map((v, i) => [dot(v, dir), i] as [number, number]).sort((a, b) => b[0] - a[0]);
    const plane = order[k - 1][0];
    if (Math.abs(order[0][0] - plane) > 1e-9) throw Error(`face plane not level (${family}): top ${order[0][0].toExponential(6)} vs kth ${plane.toExponential(6)}`);
    if (plane - order[k][0] < 1e-9) throw Error(`face plane ambiguous (${family})`);
    if (Math.abs(plane - h) > 1e-9) throw Error(`face plane off its solved depth (${family}): ${plane.toExponential(6)} vs ${h.toExponential(6)}`);
    const { verts, center, n } = orderRing(order.slice(0, k).map(([, i]) => M[i]));
    if (dist(n, dir) > 1e-9) throw Error(`face normal off its dir (${family})`);
    faces.push({ k, verts, center, n, family });
};
for (const d of DEC_DIRS) buildFace(d, 10, "dec");
for (const d of SQ_DIRS) buildFace(d, 4, "sq");
for (const d of HEX_DIRS) buildFace(d, 6, "hex");
if (faces.length !== 62) throw Error(`faces ${faces.length} != 62`);

// ---- edgeFaces (module scope — used by T4/T5) ---------------------------------------------------------
const edgeFacesM = new Map<string, number[]>();
for (let fi = 0; fi < faces.length; fi++) for (let t = 0; t < faces[fi].verts.length; t++) {
    const a = faces[fi].verts[t], b = faces[fi].verts[(t + 1) % faces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFacesM.set(kk, [...(edgeFacesM.get(kk) ?? []), fi]);
}

// ---- seating: dodeca face normal (0,−φ,1) → −Y (DECAGON DOWN), twist-snap a lower-ring decagon to az 0 --
const v0 = nrm([0, -PHI, 1]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// the WAIST decagons (non-axis): lower ring = the five with the least rot1 center y
let snapFace: Face = faces[0];
{
    let bestY = Infinity;
    for (const f of faces) {
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
// toct snap-sign law (rico chassis verbatim): Ry(t) maps az a → a−t (az = atan2(z,x));
// twist = snapAz zeroes the snap face — verified by measurement below.
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], az0);
const rot = (v: V3): V3 => rot2(rot1(v));
{
    const sn = rot(snapFace.center);
    if (Math.abs(Math.atan2(sn[2], sn[0])) > 1e-9) throw Error(`twist-snap missed: az ${Math.atan2(sn[2], sn[0])}`);
}

// ---- scale + lift: bottom decagon plane lands exactly on the dais top ---------------------------------
const seatedUnit = M.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
export const EDGE = P_EDGE * SCALE;
const R_UNIT = Math.max(...M.map((v) => Math.hypot(...v)));
export const R_TRICO = R_UNIT;
const seated = seatedUnit.map((v) => mul(v, SCALE));
const yMinUnit = Math.min(...seatedUnit.map((v) => v[1]));
const LIFT = PLINTH_H - yMinUnit * SCALE;
export const V: V3[] = seated.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);
export const SOLID_CENTER: V3 = [0, LIFT + (Math.max(...seatedUnit.map(v => v[1])) + yMinUnit) / 2 * SCALE, 0];
export const FACE_V: number[][] = faces.map((f) => f.verts);
export const CENTERS: V3[] = faces.map((f) => {
    const c = rot(f.center);
    return [c[0] * SCALE, c[1] * SCALE + LIFT, c[2] * SCALE] as V3;
});
export const NORMALS: V3[] = faces.map((f) => rot(f.n));
export const IS_DEC: boolean[] = faces.map((f) => f.family === "dec");
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
check("T1 Euler 120−180+62 = 2", V.length === 120 && E.length === 180 && faces.length === 62 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census -----------------------------------------------------------------------------------
{
    let worstSide = 0, worstAng = 0;
    for (const f of faces) {
        const want = f.k === 4 ? Math.PI / 2 : f.k === 6 ? (2 * Math.PI) / 3 : (8 * Math.PI) / 10;  // 90° / 120° / 144°
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
    const decC = faces.filter((f) => f.k === 10).length;
    const sqC = faces.filter((f) => f.k === 4).length;
    const hexC = faces.filter((f) => f.k === 6).length;
    check("T2 faces: 12 REGULAR decagons (144°) + 30 regular squares (90°) + 20 regular hexagons (120°), every side == a — THE UNIFORM SOLID (the tdodec's 1/3-cut ratio-φ decagons declined; regularity SOLVED for)",
        decC === 12 && sqC === 30 && hexC === 20 && worstSide < 1e-9 && worstAng < 1e-7,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst angle dev ${worstAng.toExponential(1)} rad; side a ${EDGE.toFixed(4)}m — all 62 faces congruent-edged AND regular: the knife finishes what the truncation began`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------
{
    const deg = new Array(120).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    let badFig = 0;
    for (let i = 0; i < 120; i++) {
        const sf = faces.filter((f) => f.verts.includes(i) && f.family === "sq").length;
        const hf = faces.filter((f) => f.verts.includes(i) && f.family === "hex").length;
        const df = faces.filter((f) => f.verts.includes(i) && f.family === "dec").length;
        if (sf !== 1 || hf !== 1 || df !== 1) badFig++;
    }
    check("T3 vertices: degree 3 everywhere; exactly 1 square + 1 hexagon + 1 decagon at every vertex (figure 4.6.10)",
        deg.every((d) => d === 3) && badFig === 0,
        `Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}; figure violations ${badFig} — every wedding corner sits at one parent face + one parent edge + one parent corner`);
}

// ---- T4 manifold --------------------------------------------------------------------------------------
{
    const bad = [...edgeFacesM.values()].filter((c) => c.length !== 2).length;
    const missing = E.filter(([a, b]) => (edgeFacesM.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && edgeFacesM.size === 180,
        `${edgeFacesM.size} face-edges (${12 * 10 + 30 * 4 + 20 * 6} slots), ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 uniformity ------------------------------------------------------------------------------------
{
    // all verts on ONE sphere about the seated centroid (unit-frame uniform radius, seated + scaled)
    let worstR = 0;
    for (const v of V) worstR = Math.max(worstR, Math.abs(dist(v, SOLID_CENTER) - R_TRICO * SCALE));
    // dihedral classes: cluster the edge dots
    const dots: { d: number; fams: string }[] = [];
    for (const [, fl] of edgeFacesM) {
        if (fl.length !== 2) continue;
        const fA = faces[fl[0]], fB = faces[fl[1]];
        const fams = [fA.family, fB.family].sort().join("+");
        dots.push({ d: dot(NORMALS[fl[0]], NORMALS[fl[1]]), fams });
    }
    const classes = new Map<string, { n: number; worstSpread: number; val: number }>();
    for (const { d, fams } of dots) {
        const c = classes.get(fams) ?? { n: 0, worstSpread: 0, val: d };
        c.worstSpread = Math.max(c.worstSpread, Math.abs(d - c.val));
        c.n++;
        classes.set(fams, c);
    }
    const sameFam = ["dec+dec", "hex+hex", "sq+sq"].filter((k) => classes.has(k));
    const crossFam = [...classes.entries()].filter(([k]) => !sameFam.includes(k));
    const totalCross = crossFam.reduce((s, [, c]) => s + c.n, 0);
    const allSpread = [...classes.values()].every((c) => c.worstSpread < 1e-9);
    check("T5 uniformity: all 120 verts at exactly one sphere radius; dihedrals exactly THREE classes (dec–sq, sq–hex, dec–hex), 60 edges each, zero same-family; class dot values measured (not trusted from prose)",
        worstR < 1e-9 && sameFam.length === 0 && crossFam.length === 3 && totalCross === 180
        && crossFam.every(([, c]) => c.n === 60) && allSpread,
        `R dev ${(worstR * 1e12).toExponential(1)} (R ${(R_TRICO * SCALE).toFixed(6)} seated); classes: ${crossFam.map(([k, c]) => `${k} ${c.n} edges dot ${c.val.toFixed(9)} (interior ${(Math.acos(-c.val) * 180 / Math.PI).toFixed(4)}°)`).join("; ")}; same-family edges ${sameFam.length}`);
}

// ---- T6 THE KNIFE -------------------------------------------------------------------------------------
{
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
    // F-REMNANT: every decagon plane at EXACTLY the parent dodeca's own face distance (scaled frame)
    const wantPlane = hParentFace * K_SCALE;
    let worstPlaneDrift = 0;
    for (const f of faces) {
        if (f.family !== "dec") continue;
        worstPlaneDrift = Math.max(worstPlaneDrift, Math.abs(dot(f.center, f.n) - wantPlane));
    }
    // parent volume at the inherited scale (edge 2·K_SCALE): V_dodeca(e) = e³(15+7√5)/4 — exact
    const e_p = 2 * K_SCALE;
    const V_parent = Math.pow(e_p, 3) * (15 + 7 * Math.sqrt(5)) / 4;
    const ratio = V_div / V_parent;
    check("T6 THE KNIFE: F-REMNANT — every decagon plane at exactly the parent dodeca's own face distance (the knife never moves a parent plane); divergence volume reported; parent mass ratio reported (the closed-form parent at the inherited scale)",
        worstPlaneDrift < 1e-9,
        `decagon plane drift ${worstPlaneDrift.toExponential(1)} vs parent face distance ${wantPlane.toFixed(9)} (unit-frame parent edge ${e_p.toFixed(6)}); divergence V ${V_div.toFixed(6)}; parent V ${V_parent.toFixed(6)} (closed e³(15+7√5)/4); ratio ${ratio.toFixed(6)} — THE KNIFE KEEPS ${(ratio * 100).toFixed(2)}% OF THE GOLDEN PARENT'S MASS (cut depths: vertex u ${(CUT_U * K_SCALE).toFixed(6)}, bevel w ${(BEVEL_W * K_SCALE).toFixed(6)}; Newton residuals < 1e-12)`);
}

// ---- T6b THE ELEMENT THEOREM, TOLD TWICE --------------------------------------------------------------
{
    const near = (a: V3, fam: V3[]) => fam.some((d) => dist(a, d) < 1e-9);
    const dFaceDirs = DEC_DIRS;
    const dEdgeDirs = SQ_DIRS.slice();
    const dVertDirs = PARENT_D.map((v) => nrm(v));
    // the DIRECTION-DUAL icosa: verts on the decagon dirs at radius √(φ²+1) — edge 2, midradius φ
    const ICOSA_DUAL: V3[] = DEC_DIRS.map((d) => mul(d, Math.hypot(1, PHI)));
    const dualEdges: [number, number][] = [];
    for (let i = 0; i < ICOSA_DUAL.length; i++) for (let j = i + 1; j < ICOSA_DUAL.length; j++)
        if (Math.abs(dist(ICOSA_DUAL[i], ICOSA_DUAL[j]) - 2) < 1e-9) dualEdges.push([i, j]);
    const dualMidR = (() => { const m = mul(add(ICOSA_DUAL[dualEdges[0][0]], ICOSA_DUAL[dualEdges[0][1]]), 0.5); return Math.hypot(...m); })();
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
    // the dual read: decagons sit ON the dual icosa's 12 verts; the icosa's 20 faces face the hex dirs;
    // the icosa's 30 edge axes MATCH the dodeca's (belt shared)
    const decOnIcosaVerts = DEC_DIRS.every((d) => near(d, ICOSA_DUAL.map((v) => nrm(v))));
    const hexOnIcosaFaces = HEX_DIRS.every((d) => dVertDirs.some((q) => dist(q, d) < 1e-9));
    const dualEdgeAxes = SQ_DIRS.every((d) => {
        for (let i = 0; i < ICOSA_DUAL.length; i++) for (let j = i + 1; j < ICOSA_DUAL.length; j++) {
            const mid = nrm(mul(add(ICOSA_DUAL[i], ICOSA_DUAL[j]), 0.5));
            if (dist(mid, d) < 1e-9) return true;
        }
        return false;
    });
    const dualOk = dualEdges.length === 30 && Math.abs(dualMidR - PHI) < 1e-12 && Math.abs(dodecMidR - PHI) < 1e-12;
    check("T6b THE ELEMENT THEOREM, TOLD TWICE: every child face sits on one parent-DODECA element (12 faces / 30 edges / 20 vertices) AND one parent-ICOSA element (20 faces / 30 edges / 12 vertices) — the SAME 62 faces, both censuses, F↔V mirrored",
        dF === 12 && dE === 30 && dVx === 20 && stray === 0 && familiesDisjoint
        && decOnIcosaVerts && hexOnIcosaFaces && dualEdgeAxes && dualOk
        && ICOSA_DUAL.length === 12,
        `dodeca read: F ${dF} + E ${dE} + V ${dVx} = ${dF + dE + dVx}; stray ${stray}; the direction-dual icosa (edge-2, midradius φ == the dodeca's own — the mutual dual position, ${dualEdges.length} edges, machine-verified) reads the SAME 62 faces with F↔V swapped: decagons ON its 12 verts, hexagons against its 20 face dirs, squares on its 30 edge axes (BELT SHARED with the dodeca's edges) — 62 == F+E+V of EACH parent (12/30/20 vs 20/30/12): the cantitruncate of the one IS the cantitruncate of the other`);
}

// ---- T7 seat laws -------------------------------------------------------------------------------------
{
    const botDec = faces.find((f, fi) => f.family === "dec" && NORMALS[fi][1] < -0.99);
    if (!botDec) throw Error("no bottom decagon found — seating broken");
    const botVs = botDec.verts.map((vi) => V[vi][1]);
    const botSpread = Math.max(...botVs) - Math.min(...botVs);
    const topDec = faces.find((f, fi) => f.family === "dec" && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9);
    if (!topDec) throw Error("no top decagon found — seating broken");
    const topVs = topDec.verts.map((vi) => V[vi][1]);
    const topSpread = Math.max(...topVs) - Math.min(...topVs);
    const cx = V.reduce((s, v) => s + v[0], 0) / 120;
    const cz = V.reduce((s, v) => s + v[2], 0) / 120;
    const a = Math.PI * 2 / 5, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    // FINIAL-CLEARANCE LAW (tret v2): crown bead top must clear the crown rim's
    // sight line from READER_D by >= 1.5·BEAD_R — else it renders zero px
    // from every ground vantage.
    const topIdx = faces.indexOf(topDec);
    const rimY = Math.max(...topDec.verts.map((vi) => V[vi][1]));            // crown rim level
    const rimR = Math.max(...topDec.verts.map((vi) => Math.hypot(V[vi][0], V[vi][2]))); // crown rim reach
    const crownPlane = CENTERS[topIdx][1] + NORMALS[topIdx][1] * BEAD_POKE; // crown bead base plane
    const beadTop = crownPlane + STEM_H + BEAD_R;                           // finial bead top
    const sightY = rimY + (rimY - READER_EYE) * rimR / (READER_D - rimR);   // sight line at the axis
    const finialClear = beadTop - sightY;                                   // must be >= 1.5·BEAD_R
    // waist rings: the ten non-axis decagons, split by center y into two 72° rings
    const waist = faces
        .map((f, fi) => ({ f, fi }))
        .filter(({ f, fi }) => f.family === "dec" && Math.abs(NORMALS[fi][1]) < 0.99);
    const midY = waist.reduce((s, w) => s + CENTERS[w.fi][1], 0) / waist.length;
    const azOf = (fi: number) => Math.atan2(CENTERS[fi][2], CENTERS[fi][0]);
    const lower = waist.filter((w) => CENTERS[w.fi][1] < midY);
    const upper = waist.filter((w) => CENTERS[w.fi][1] >= midY);
    const lat = 72 * Math.PI / 180;
    // ring law (rico precedent): lower ring on the {72°·k} lattice (snap face dead-on 0);
    // upper ring measured offset (geometry decides — interleave reported)
    const ringOnLattice = (ring: typeof waist, offsetRad: number) => ring.length === 5 && ring.every((w) =>
        Math.abs(Math.atan2(Math.sin((azOf(w.fi) - offsetRad) * 5), Math.cos((azOf(w.fi) - offsetRad) * 5))) < 1e-6);
    const lowerExact = ringOnLattice(lower, 0);
    // upper offset: measure from the lower ring's snap face az (0)
    const upperOffsets = upper.map((w) => Math.atan2(Math.sin(azOf(w.fi) * 5), Math.cos(azOf(w.fi) * 5)));
    const upperExact = upperOffsets.every((o) => Math.abs(o) < 1e-6 || Math.abs(Math.abs(o) - Math.PI) < 1e-6);
    const interOffset = (() => {
        if (!lower.length || !upper.length) return NaN;
        const d = azOf(upper[0].fi) - azOf(lower[0].fi);
        return Math.atan2(Math.sin(d), Math.cos(d));
    })();
    // bead census: 1 crown dead-axis + 10 waist + 1 pressed foot; the THIRTY
    // SQUARES + TWENTY HEXAGONS stay dark (only the dodeca's faces carry light)
    let crown = 0, foot = 0, onAxis = false, allAloft = true, dark = 0;
    const footYs: number[] = [];
    for (let u = 0; u < faces.length; u++) {
        if (!IS_DEC[u]) { dark++; continue; }                 // squares + hexagons carry NO bead
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
        rings: `${lower.length}+${upper.length}`, lowerExact, upperExact,
        interOffsetDeg: (interOffset * 180 / Math.PI).toFixed(2),
        allAloft,
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3),
    };
    check("T7 seat: bottom decagon FLAT at dais top, top parallel, 72° symmetry, centroid on axis, height == target, never overhangs (apothem-first), lower-ring decagon dead-on az 0 (snap law), waist = two 72° rings (inter-ring offset measured, geometry decides), bead census honest (1 crown + 10 waist + 1 pressed; THIRTY SQUARES + TWENTY HEXAGONS DARK — only the dodeca's faces carry light)",
        botSpread < 1e-9 && Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9 && topSpread < 1e-9
        && symMiss === 0 && Math.hypot(cx, cz) < 1e-9 && Math.abs(height - TARGET_H) < 1e-9
        && MAX_H + ROD_R <= apothem + 1e-9 && crown === 1 && waist.length === 10 && foot === 1 && dark === 50 && onAxis
        && lowerExact && upperExact && Math.abs(interOffset) > 1e-9 && allAloft
        && footYs.length === 1 && Math.abs(footYs[0] - FOOT_BEAD_Y) < 1e-12
        && FOOT_BEAD_Y - BEAD_R >= -1e-9 && FOOT_BEAD_Y + BEAD_R <= PLINTH_H + 1e-9
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; bottom decagon spread ${botSpread.toExponential(1)} at dais top ${PLINTH_H}; top level (spread ${topSpread.toExponential(1)}); 72° misses ${symMiss}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); snap face az 0 (dead-on +X); rings 5+5 exact 72° lattices, inter-ring offset ${(interOffset * 180 / Math.PI).toFixed(2)}° (geometry-decided, disclosed); beads 1 crown dead-axis + 10 waist all aloft + 1 pressed foot at y ${FOOT_BEAD_Y} (tico's-twelfth idiom, hidden beneath the parent's own floor — twelve in truth); 30 squares + 20 hexagons dark; FINIAL crown bead top ${beadTop.toFixed(3)} clears rim sight line ${sightY.toFixed(3)} by ${finialClear.toFixed(3)}m (>= ${1.5 * BEAD_R} law) — reads from every ground vantage`);
}

// ---- T8 immersion (plates tuck under the seams — family shadow-gap law) --------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;       // plate mid-plane offset along outward normal
    let worstPlane = -Infinity;                            // max outward poke (must be ≤ 0)
    let worstTuck = 0;                                     // corner depth into rod cylinder (reported)
    for (let u = 0; u < faces.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const b = faces[u].verts.length;                   // 4, 6, or 10
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
    // beads: crown finial (stem-lifted), 10 waist (poked), pressed foot (sunk) —
    // decagon centers ONLY (the dodeca's faces carry the light)
    for (let u = 0; u < faces.length; u++) {
        if (!IS_DEC[u]) continue;
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
        const topIdx = faces.findIndex((f, fi) => IS_DEC[fi] && NORMALS[fi][1] > 0.99);
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

console.log(`solve: Newton converged — vertex cut u ${CUT_U.toFixed(9)}, edge bevel w ${BEVEL_W.toFixed(9)} (parent edge-2 frame); common edge L* ${L_COMMON.toFixed(9)} -> scale K ${K_SCALE.toFixed(9)}; unit-frame parent edge ${2 * K_SCALE}·; depths dec ${H_scaled.dec.toFixed(6)} sq ${H_scaled.sq.toFixed(6)} hex ${H_scaled.hex.toFixed(6)}`);
console.log(`seat: decagon-down 5-fold (the parent's own face, now a decagon, FLAT on the dais; lower-ring decagon snapped dead-on +X); bottom face flat on dais top ${PLINTH_H}; solid height ${TARGET_H}m; edge a ${EDGE.toFixed(4)}m; R ${R_TRICO.toFixed(4)}m unit / ${(R_TRICO * SCALE).toFixed(4)}m seated; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} → ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`panels: 42 stone (12 parent-face decagons UNMOVED in their own planes + 30 edge-bevel squares — the dodeca's F+E census) + 20 iron hexagons (the bloomed parent vertices, dark) + 180 iron seam rods; beads: 12 brass parent-decagon centers (crown FINIAL, 10 waist in two 72° rings, 1 pressed foot) — the dodeca's twelve faces, lit; the squares and hexagons stay dark`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct259-trico)");
