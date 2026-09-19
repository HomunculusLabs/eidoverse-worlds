// struct245-probe-toct.ts — STRUCTURES LANE struct-245, Round 11 R11-58.
// THE TRUNCATED OCTAHEDRON — Kelvin's cell. Form-ledger grep fresh this
// tick: truncated octa|kelvin|toct|permutohedron|bitruncated 0/0/0/0/0
// across STRUCTURES-PLAN + IMPROVEMENTS + IMPROVE-PLAN + CITY-PLAN(-V2).
// The ARCHIMEDEAN branch's third member (struct-237 cuboctahedron,
// struct-243 truncated icosahedron) and the PARENT-ECHO of the octahedron:
// cut each of the six corners at exactly 1/3 and the parent's 6 corners
// become 6 SQUARES while its 8 faces become 8 HEXAGONS — the hexagon
// planes ARE the parent's face planes (T5: the H-H dihedral equals the
// octahedron's own arccos(−1/3) = 109.47°, the tetrahedral angle).
//
// ONE IDEA: THE SPACE FILLER. Of all the Archimedean solids exactly ONE
// tiles space by translation alone — this one (bitruncated cubic
// honeycomb; Kelvin 1887 posed it as his foam of the ether; Weaire–Phelan
// 1993 beat its surface area by 0.3% but needed TWO cell shapes — the
// single-cell crown stands). Machine-verified below, not asserted from
// prose: a seeded grid over the cell's own bounding box must lie in
// EXACTLY ONE member of the bcc lattice of copies (full coverage, zero
// double-cover) — the tiling itself is the theorem (T6). Bonus identity:
// the permutohedron of S4 — every corner is an ordering of (1,2,3,4).
//
// PRESENTATION: one cell of the infinite foam at monument scale, standing
// on one HEXAGON (3-fold seat — the ⟨111⟩ axis). STONE carries the eight
// hexagons (the pale facets) + the FOURTEEN-sided dais (one side per
// face — the theme number); IRON carries the six squares (the dark doors)
// + all 36 seam rods. Night contract: six warm brass beads at the six
// SQUARE centers — the six lattice doors — in two staggered triangles
// (three shoulders, three skirt; alternating 60°). No bead points down
// (the doors live at the waist — honest difference from the tico's
// pressed thirteenth); from any single azimuth you read the near door
// full plus its two grazing neighbors, and the six complete only as you
// circle.
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   Parent: octahedron M = (±1,0,0),(0,±1,0),(0,0,±1), edge √2, 8 faces.
//   Truncation: on each parent edge A→B the two points A+(B−A)/3 and
//   A+2(B−A)/3 — the SAME 1/3 law as the tico. Uniform edge a = √2/3:
//   the corner-cut side t√2 and the middle segment (1−2t)√2 are equal
//   exactly at t = 1/3, and the hexagon angles are exactly 120° there.
//   R_toct = (a/2)·√10 (all 24 verts equidistant from the center).
//   Square apothem 2/3, hexagon apothem 1/√3 — the SQUARES sit farther
//   out: the doors bulge past the facets, the waist is the widest ring.
//   Honeycomb lattice L = (2/3)·{(p,q,r) ∈ Z³ : p ≡ q ≡ r (mod 2)} (bcc):
//   square neighbors at (4/3)·axis, hexagon neighbors at (2/3)·(±1,±1,±1)
//   — fourteen neighbors, fourteen faces.
//
// THEOREMS machine-verified below (conchoid law):
//   T1 Euler: 24 − 36 + 14 = 2 (sphere).
//   T2 face census: 6 regular squares (90°) + 8 regular hexagons (120°).
//   T3 vertex census: degree 3 everywhere; exactly 1 square + 2 hexagons
//      at every vertex (24×).
//   T4 manifold: every edge on exactly 2 faces.
//   T5 uniformity: all 24 verts at exactly R_toct; dihedrals exactly TWO
//      classes — H-H dot == 1/3 (the PARENT's own dihedral, because the
//      hexagon planes are the parent's face planes), S-H dot == 1/√3;
//      zero square-square edges (no two doors share a wall).
//   T6 THE SPACE FILLER: normal census (6 squares == ±axes, 8 hexagons ==
//      the 8 diagonals (±1,±1,±1)/√3); all 14 face-sharing neighbor
//      offsets lie in the bcc lattice with coincident shared planes; and
//      the grid test — every point of a dense grid over the cell's bbox
//      lies in EXACTLY ONE lattice copy (coverage + exclusivity).
//   T7 seat: bottom hexagon FLAT at dais top (all 6 verts y == top),
//      top hexagon parallel, 120° symmetry about Y, centroid on axis,
//      height == target, reach+rod ≤ dais apothem (never overhangs);
//      bead ring: 6 beads at the square centers + BEAD_POKE proud, three
//      up / three down alternating, one snapped dead to az 0.
//   T8 immersion: every inset plate corner, lifted to the plate
//      mid-plane, lies strictly INSIDE the convex solid (no face-plane
//      poke-through); corner tuck into the rod cylinders reported.
//   RED control: --red displaces one vertex 0.3 — T2/T5 must fail.

export const TARGET_H = 5.9;              // seated solid height (hexagon axis)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.15;               // brass door bead (scales with the 2.4m doors)
export const BEAD_POKE = 0.02;            // bead center proud of the face plane (grazing-read law, disclosed)
export const PLATE_T = 0.10;              // panel thickness
export const PLATE_INSET = 0.07;          // panel corner inset (seam reveal — tico/co family look)
export const PLATE_BACK = 0.018;          // panel outer face behind rod surface
export const PLINTH_N = 14;               // FOURTEEN sides — one per face (theme number)
export const PLINTH_ROT = 0;              // corners ON the axes
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

// ---- parent octahedron: the six (±1,0,0)-type corners ----------------------------------------------------------
const M: V3[] = [];
{
    for (const a of [1, -1]) {
        M.push([a, 0, 0], [0, a, 0], [0, 0, a]);
    }
}
if (M.length !== 6) throw Error(`octahedron verts ${M.length} != 6`);
const P_EDGE = Math.SQRT2;                    // parent edge (exact for these coords)
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 12) throw Error(`parent edges ${P_EDGES.length} != 12`);

// ---- truncation at 1/3 (the SAME law as the tico): 24 verts, deduped by proximity ------------------------------
const A_UNIT = P_EDGE / 3;                    // uniform edge of the unit toct (√2/3)
const pts: V3[] = [];
const pidx = (p: V3) => {
    const k = pts.findIndex((q) => dist(q, p) < 1e-9);
    if (k >= 0) return k;
    pts.push(p); return pts.length - 1;
};
for (const [i, j] of P_EDGES) {
    pidx(add(M[i], mul(sub(M[j], M[i]), 1 / 3)));
    pidx(add(M[i], mul(sub(M[j], M[i]), 2 / 3)));
}
if (pts.length !== 24) throw Error(`truncation verts ${pts.length} != 24`);
const R_UNIT = Math.hypot(...pts[0]);         // √5/3
const R_CLOSED = (A_UNIT / 2) * Math.sqrt(10); // closed form — must equal R_UNIT

// ---- toct edges by distance -----------------------------------------------------------------------------------
const EDGES: [number, number][] = [];
for (let i = 0; i < 24; i++) for (let j = i + 1; j < 24; j++)
    if (Math.abs(dist(pts[i], pts[j]) - A_UNIT) < 1e-9) EDGES.push([i, j]);
if (EDGES.length !== 36) throw Error(`toct edges ${EDGES.length} != 36`);

// ---- faces ----------------------------------------------------------------------------------------------------
type Face = { k: number; verts: number[]; center: V3; n: V3; isSq: boolean };
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
// squares: one per parent vertex (its 4 near cut points, sorted around)
for (let i = 0; i < 6; i++) {
    const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
    if (nbrs.length !== 4) throw Error(`parent degree ${nbrs.length} != 4`);
    const ring = nbrs.map((j) => add(M[i], mul(sub(M[j], M[i]), 1 / 3)));
    const { verts, center, n } = orderRing(ring);
    faces.push({ k: 4, verts, center, n, isSq: true });
}
// hexagons: one per parent face — walk the triangle, take both cut points per directed edge
{
    const pAdj = (a: number, b: number) => P_EDGES.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
    const seen = new Set<string>();
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) for (let k = 0; k < 6; k++) {
        if (!(i < j && j < k)) continue;
        if (!pAdj(i, j) || !pAdj(j, k) || !pAdj(i, k)) continue;
        const key = [i, j, k].sort((a, b) => a - b).join("-");
        if (seen.has(key)) continue;
        seen.add(key);
        const c = mul(add(add(M[i], M[j]), M[k]), 1 / 3);
        const n = nrm(c);
        let cyc: number[] = [i, j, k];
        const e1 = sub(M[j], M[i]), e2 = sub(M[k], M[j]);
        if (dot(cross(e1, e2), n) < 0) cyc = [i, k, j];
        const ring: V3[] = [];
        for (let t = 0; t < 3; t++) {
            const A = M[cyc[t]], B = M[cyc[(t + 1) % 3]];
            ring.push(add(A, mul(sub(B, A), 1 / 3)));
            ring.push(add(A, mul(sub(B, A), 2 / 3)));
        }
        const o = orderRing(ring);
        faces.push({ k: 6, verts: o.verts, center: o.center, n: o.n, isSq: false });
    }
}
if (faces.length !== 14) throw Error(`faces ${faces.length} != 14`);
if (faces.filter((f) => f.isSq).length !== 6) throw Error("square count != 6");

// ---- edgeFaces (module scope — used by T4/T5/T6) ----------------------------------------------------------------
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < faces.length; fi++) for (let t = 0; t < faces[fi].verts.length; t++) {
    const a = faces[fi].verts[t], b = faces[fi].verts[(t + 1) % faces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ---- seating: hexagon normal (1,1,1)/√3 → −Y (HEXAGON DOWN, 3-fold seat), twist-snap an UP-door bead to az 0 ------
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const v0 = nrm([1, 1, 1]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// the bottom hexagon = the one whose rotated center points most downward
let botHex: Face = faces[0];
{
    let bestDot = Infinity;
    for (const f of faces) {
        if (f.isSq) continue;
        const d = dot(rot1(f.center), [0, 1, 0]);
        if (d < bestDot) { bestDot = d; botHex = f; }
    }
}
// twist-snap: an UP square door (outward NORMAL with positive vertical — the shoulders,
// not the skirt) dead to az 0 (v1 self-catch: center-y selector matched all 6 doors)
const az0 = (() => {
    let best = Infinity, az = 0;
    for (const f of faces) {
        if (!f.isSq) continue;
        const nr = rot1(f.n);
        if (nr[1] <= 1e-9) continue;                    // up-normal doors only
        const c = rot1(f.center);
        const a = Math.atan2(c[2], c[0]);
        const norm = Math.atan2(Math.sin(a), Math.cos(a));
        if (Math.abs(norm) < best) { best = Math.abs(norm); az = a; }
    }
    return az;
})();
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], az0);   // SELF-CATCH v2: +Y rotation maps az a → a−φ, so snapping az0→0 needs φ=+az0 (tico chassis carried −az0 but never asserted the snap)
const rot = (v: V3): V3 => rot2(rot1(v));

// ---- scale + lift: bottom hexagon plane lands exactly on the dais top -------------------------------------------
const seatedUnit = pts.map((p) => rot(p));
const H_UNIT = (() => {
    const ys = seatedUnit.map((p) => p[1]);
    return Math.max(...ys) - Math.min(...ys);
})();
export const SCALE = TARGET_H / H_UNIT;
export const EDGE = A_UNIT * SCALE;
export const R_TOCT = R_UNIT * SCALE;
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
export const IS_SQ: boolean[] = faces.map((f) => f.isSq);
export const E: [number, number][] = EDGES;
export const BOT_HEX_IDX = faces.indexOf(botHex);

// RED control (--red displaces one vertex: breaks side/uniformity/seat laws)
if (process.argv.includes("--red")) {
    V[7] = [V[7][0] + 0.3, V[7][1] - 0.2, V[7][2] + 0.15];
    console.log("RED MODE: vertex 7 displaced 0.3 — T2/T5 MUST fail");
}

// ---- derived footprint constants (BEFORE all checks — no TDZ) ----------------------------------------------------
export const MAX_H = Math.max(...V.map((v) => Math.hypot(v[0], v[2])));
export const PLINTH_R = Math.ceil((MAX_H + ROD_R + 0.10) * 20) / 20;
export const SUMMIT_Y = Math.max(...V.map((v) => v[1]));

// unit-parent plane data for T6 (lattice test runs in UNIT frame — the tiling is scale-free;
// SELF-CATCH v1: rot(f.n) here seated-rotated the constraint set while the lattice stayed unit — 2620 uncovered)
const uFaces = faces.map((f) => ({ n: f.n, isSq: f.isSq, ap: f.isSq ? 2 / 3 : 1 / Math.sqrt(3) }));

// ---- T1 Euler ----------------------------------------------------------------------------------------------------
check("T1 Euler 24−36+14 = 2", V.length === 24 && E.length === 36 && faces.length === 14 && V.length - E.length + faces.length === 2,
    `V ${V.length}, E ${E.length}, F ${faces.length}, χ ${V.length - E.length + faces.length}`);

// ---- T2 face census -----------------------------------------------------------------------------------------------
{
    let worstSide = 0, worstAng = 0;
    for (const f of faces) {
        const want = f.k === 4 ? Math.PI / 2 : 2 * Math.PI / 3;   // 90° / 120°
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
    const sqC = faces.filter((f) => f.k === 4).length, hexC = faces.filter((f) => f.k === 6).length;
    check("T2 faces: 6 regular squares (90°) + 8 regular hexagons (120°), every side == a",
        sqC === 6 && hexC === 8 && worstSide < 1e-9 && worstAng < 1e-7,
        `worst side dev ${(worstSide * 1e12).toExponential(1)}; worst angle dev ${worstAng.toExponential(1)} rad; side a ${EDGE.toFixed(4)}m`);
}

// ---- T3 vertex census --------------------------------------------------------------------------------------------
{
    const deg = new Array(24).fill(0);
    for (const [a, b] of E) { deg[a]++; deg[b]++; }
    let badFig = 0;
    for (let i = 0; i < 24; i++) {
        const sf = faces.filter((f) => f.verts.includes(i) && f.isSq).length;
        const hf = faces.filter((f) => f.verts.includes(i) && !f.isSq).length;
        if (sf !== 1 || hf !== 2) badFig++;
    }
    check("T3 vertices: degree 3 everywhere; exactly 1 square + 2 hexagons at every vertex",
        deg.every((d) => d === 3) && badFig === 0,
        `Σdeg ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * E.length}; figure violations ${badFig}`);
}

// ---- T4 manifold -------------------------------------------------------------------------------------------------
{
    const bad = [...edgeFaces.values()].filter((c) => c.length !== 2).length;
    const missing = E.filter(([a, b]) => (edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []).length !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces", bad === 0 && missing === 0 && edgeFaces.size === 36,
        `${edgeFaces.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} unmatched`);
}

// ---- T5 uniformity -----------------------------------------------------------------------------------------------
{
    let worstR = 0;
    for (const v of V) worstR = Math.max(worstR, Math.abs(dist(v, SOLID_CENTER) - R_TOCT));
    let hhWorst = 0, shWorst = 0, hhN = 0, shN = 0, ssN = 0;
    for (const [, fl] of edgeFaces) {
        if (fl.length !== 2) continue;
        const sqA = faces[fl[0]].isSq, sqB = faces[fl[1]].isSq;
        const d = dot(NORMALS[fl[0]], NORMALS[fl[1]]);
        if (sqA && sqB) ssN++;
        else if (sqA !== sqB) { shN++; shWorst = Math.max(shWorst, Math.abs(d - 1 / Math.sqrt(3))); }
        else { hhN++; hhWorst = Math.max(hhWorst, Math.abs(d - 1 / 3)); }
    }
    check("T5 uniformity: all 24 verts at exactly R_toct; dihedrals exactly two classes — H-H == parent (dot 1/3), S-H == 1/√3; zero square-square edges",
        worstR < 1e-9 && hhN === 12 && shN === 24 && ssN === 0 && hhWorst < 1e-9 && shWorst < 1e-9,
        `R dev ${(worstR * 1e12).toExponential(1)} (R ${R_TOCT.toFixed(6)} == closed form ${(R_CLOSED * SCALE).toFixed(6)}); H-H ${hhN} edges worst |dot−1/3| ${hhWorst.toExponential(1)} (interior ${(180 - Math.acos(1 / 3) * 180 / Math.PI).toFixed(4)}° — the PARENT octahedron's own); S-H ${shN} edges worst |dot−1/√3| ${shWorst.toExponential(1)} (interior ${(180 - Math.acos(1 / Math.sqrt(3)) * 180 / Math.PI).toFixed(4)}°); S-S ${ssN} (no two doors share a wall)`);
}

// ---- T6 THE SPACE FILLER -----------------------------------------------------------------------------------------
{
    // (a) normal census in the SEATED frame rotated back? — census is rotation-invariant; use unit-frame normals
    const sqN = faces.filter((f) => f.isSq).map((f) => f.n);
    const hexN = faces.filter((f) => !f.isSq).map((f) => f.n);
    const axes: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    const diags: V3[] = [];
    for (const a of [1, -1]) for (const b of [1, -1]) for (const c of [1, -1]) diags.push(nrm([a, b, c]));
    const matchSet = (set: V3[], want: V3[]) => {
        const used = new Set<number>();
        for (const n of set) {
            const k = want.findIndex((w, i) => !used.has(i) && dot(n, w) > 1 - 1e-9);
            if (k < 0) return false;
            used.add(k);
        }
        return used.size === want.length;
    };
    // (b) neighbor offsets in L, shared planes coincident
    const inL = (o: V3) => {
        const t = mul(o, 3 / 2);
        const r = t.map((x) => Math.round(x)) as V3;
        const frac = t.map((x, i) => Math.abs(x - r[i])) as V3;
        if (Math.max(...frac) > 1e-9) return false;
        const par = new Set(r.map((x) => Math.abs(x) % 2));
        return par.size === 1;                      // p ≡ q ≡ r (mod 2)
    };
    let nbOk = 0, nbTot = 0;
    for (const f of faces) {
        const off = mul(f.n, 2 * (f.isSq ? 2 / 3 : 1 / Math.sqrt(3)));   // center of the face-sharing neighbor
        nbTot++;
        // shared plane coincidence: our face plane {p : dot(p,n) = ap} equals the neighbor's −n face plane
        const ap = f.isSq ? 2 / 3 : 1 / Math.sqrt(3);
        const lhs = ap;                                  // our plane constant
        const rhs = dot(off, f.n) - ap;                  // neighbor's plane constant projected on n
        if (inL(off) && Math.abs(lhs - rhs) < 1e-12) nbOk++;
    }
    // (c) the grid test — every point of a dense grid over the cell's bbox lies in EXACTLY ONE lattice copy
    const inLattice = (p: V3, c: V3) => {
        const q = sub(p, c);
        for (const f of uFaces) if (dot(q, f.n) > f.ap + 1e-9) return false;
        return true;
    };
    const strictIn = (p: V3, c: V3) => {
        const q = sub(p, c);
        for (const f of uFaces) if (dot(q, f.n) > f.ap - 1e-9) return false;
        return true;
    };
    const copies: V3[] = [];
    for (let p = -2; p <= 2; p++) for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
        const par = ((Math.abs(p) % 2) === (Math.abs(q) % 2)) && ((Math.abs(q) % 2) === (Math.abs(r) % 2));
        if (par) copies.push(mul([p, q, r], 2 / 3));
    }
    const G = 26, lo = -0.75, hi = 0.75;
    let uncovered = 0, doubleCover = 0, total = 0;
    for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) for (let k = 0; k < G; k++) {
        const p: V3 = [lo + (hi - lo) * (i + 0.5) / G, lo + (hi - lo) * (j + 0.5) / G, lo + (hi - lo) * (k + 0.5) / G];
        total++;
        let cov = 0, strict = 0;
        for (const c of copies) {
            if (inLattice(p, c)) cov++;
            if (strictIn(p, c)) strict++;
        }
        if (cov === 0) uncovered++;
        if (strict > 1) doubleCover++;
    }
    const euler = V.length - E.length + faces.length;
    check("T6 THE SPACE FILLER: 6 squares at the 6 axes + 8 hexagons at the 8 diagonals; all 14 neighbor offsets in the bcc lattice with coincident shared planes; grid coverage exact",
        matchSet(sqN, axes) && matchSet(hexN, diags) && nbOk === nbTot && uncovered === 0 && doubleCover === 0 && euler === 2,
        `normals: squares==±axes ${matchSet(sqN, axes)}, hexagons==diagonals ${matchSet(hexN, diags)}; 14/14 face-sharing neighbors in L=(2/3)·{p≡q≡r mod 2} (6 axis doors + 8 diagonal facets — fourteen neighbors, fourteen faces); ${copies.length} copies, ${total} grid points: ${uncovered} uncovered, ${doubleCover} double-covered — ONE SHAPE CLAIMS ALL OF SPACE (Kelvin 1887; Weaire–Phelan 1993 needed two shapes to beat it by 0.3%)`);
}

// ---- T7 seat laws ------------------------------------------------------------------------------------------------
{
    const botVs = faces[BOT_HEX_IDX].verts.map((vi) => V[vi][1]);
    const botSpread = Math.max(...botVs) - Math.min(...botVs);
    const topHex = faces.find((f, fi) => !f.isSq && fi !== BOT_HEX_IDX && Math.abs(dot(NORMALS[fi], [0, 1, 0]) - 1) < 1e-9);
    if (!topHex) throw Error("no top hexagon found — seating broken");
    const topVs = topHex.verts.map((vi) => V[vi][1]);
    const topSpread = Math.max(...topVs) - Math.min(...topVs);
    const cx = V.reduce((s, v) => s + v[0], 0) / 24;
    const cz = V.reduce((s, v) => s + v[2], 0) / 24;
    const a = (2 * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    // bead ring: 6 at square centers + poke, 3 up / 3 down alternating, one dead at az 0
    let beadAz0 = false, upC = 0, downC = 0, azPrev = Infinity, alternating = true;
    const beadAz: number[] = [];
    for (let u = 0; u < faces.length; u++) {
        if (!IS_SQ[u]) continue;
        const cSq = CENTERS[u];
        if (NORMALS[u][1] > 0) upC++; else downC++;
        const az = Math.atan2(cSq[2], cSq[0]);
        beadAz.push(az);
        if (Math.abs(Math.atan2(Math.sin(az), Math.cos(az))) < 1e-9 && NORMALS[u][1] > 0) beadAz0 = true;
    }
    beadAz.sort((x, y) => x - y);
    for (let i = 0; i < beadAz.length; i++) {
        const d = beadAz[(i + 1) % beadAz.length] - beadAz[i] + (i === beadAz.length - 1 ? 2 * Math.PI : 0);
        if (Math.abs(d - Math.PI / 3) > 1e-6) alternating = false;
    }
    const t7parts = {
        botFlat: botSpread < 1e-9, botAtDais: Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9,
        topFlat: topSpread < 1e-9, sym: symMiss === 0, ctr: Math.hypot(cx, cz) < 1e-9,
        hgt: Math.abs(height - TARGET_H) < 1e-9, noOver: MAX_H + ROD_R <= apothem + 1e-9,
        up: upC, down: downC, az0: beadAz0, alt: alternating,
    };
    check("T7 seat: bottom hexagon FLAT at dais top, top parallel, 120° symmetry, centroid on axis, height == target, never overhangs, bead ring honest",
        botSpread < 1e-9 && Math.abs(Math.min(...botVs) - PLINTH_H) < 1e-9 && topSpread < 1e-9
        && symMiss === 0 && Math.hypot(cx, cz) < 1e-9 && Math.abs(height - TARGET_H) < 1e-9
        && MAX_H + ROD_R <= apothem + 1e-9 && upC === 3 && downC === 3 && beadAz0 && alternating,
        `parts ${JSON.stringify(t7parts)}; bottom hexagon spread ${botSpread.toExponential(1)} at dais top ${PLINTH_H}; top face level (spread ${topSpread.toExponential(1)}); 120° misses ${symMiss}; centroid off-axis ${Math.hypot(cx, cz).toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)}; beads ${upC} up + ${downC} down, gaps-exact ${alternating}, az0-snap ${beadAz0} (+${BEAD_POKE}m proud — grazing-read law)`);
}

// ---- T8 immersion (plates tuck under the seams — co/tico shadow-gap law) -------------------------------------------
{
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;       // plate mid-plane offset along outward normal
    let worstPlane = -Infinity;                            // max outward poke (must be ≤ 0)
    let worstTuck = 0;                                     // corner depth into rod cylinder (reported)
    for (let u = 0; u < faces.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const b = faces[u].verts.length;                   // 4 or 6
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
        `worst outward poke ${worstPlane.toExponential(1)} (≤ 0 = fully inside); max corner tuck into rod cylinders ${worstTuck.toFixed(4)}m (invisible — inside solid rod geometry, co idiom); plate outer face ${PLATE_BACK * 1000}mm behind the rod outer surface; beads at the 6 square centers +${BEAD_POKE}m proud (decode D5)`);
}

// ---- footprint summary --------------------------------------------------------------------------------------------
export const ENVELOPE = (() => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    const acc = (x: number, y: number, z: number) => {
        min[0] = Math.min(min[0], x); max[0] = Math.max(max[0], x);
        min[1] = Math.min(min[1], y); max[1] = Math.max(max[1], y);
        min[2] = Math.min(min[2], z); max[2] = Math.max(max[2], z);
    };
// TRUE analytic envelope (SELF-CATCH v3: v1 used vertex±ROD_R spheres, but a
// tilted rod's END RIM circle extends R·√(1−d̂ₖ²) along axis k — the tico's
// orientations hid this class; the toct's tilted top edges exposed it at
// 19mm. The contract now carries the exact rim extents; the mk check reads
// TRUE vertex extents to match.)
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
    for (const f of faces) if (f.isSq) {
        const u = faces.indexOf(f);
        const p: V3 = [
            CENTERS[u][0] + NORMALS[u][0] * BEAD_POKE,
            CENTERS[u][1] + NORMALS[u][1] * BEAD_POKE,
            CENTERS[u][2] + NORMALS[u][2] * BEAD_POKE,
        ];                                   // beads poke proud — the envelope must carry the poked center (tico beads sat flush)
        acc(p[0] - BEAD_R, p[1] - BEAD_R, p[2] - BEAD_R);
        acc(p[0] + BEAD_R, p[1] + BEAD_R, p[2] + BEAD_R);
    }
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        acc(PLINTH_R * Math.cos(a), 0, -PLINTH_R * Math.sin(a));
        acc(PLINTH_R * Math.cos(a), PLINTH_H, -PLINTH_R * Math.sin(a));
    }
    return { min: min as V3, max: max as V3 };
})();

console.log(`seat: hexagon-down 3-fold (⟨111⟩ axis); bottom face flat on dais top ${PLINTH_H}; solid height ${TARGET_H}m; edge a ${EDGE.toFixed(4)}m; R ${R_TOCT.toFixed(4)}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} → ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} (one side per face); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`panels: 8 stone hexagons + 6 iron squares + 36 iron seam rods; beads: 6 brass square centers in two staggered triangles (3 shoulders ~${(LIFT + (2 / (3 * Math.sqrt(3))) * SCALE).toFixed(2)}m, 3 skirt ~${(LIFT - (2 / (3 * Math.sqrt(3))) * SCALE).toFixed(2)}m world-y)`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct245-toct)");
