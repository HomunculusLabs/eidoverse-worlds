// struct273-probe-tetrakis.ts — STRUCTURES LANE struct-273, Round 11 R11-81.
// THE TETRAKIS HEXAHEDRON — the Catalan dual of the standing truncated
// octahedron (toct, struct-245/246, N-E quarter az348.5 r66). Catalan
// branch member 5 (rt struct-235; dtria struct-267/268; deltoid
// struct-269/270; triakis struct-271/272). The dual-of-standing-parent
// move a FIFTH time (gsd->gdodec, trico->dtria, rico->deltoid,
// tdodec->triakis, toct->tetrakis).
//
// FORM-LEDGER GREP fresh this tick (triakis|tetrakis|pentakis|deltoid|
// hexecontahedron over the five-file set): 0 real claims — the three
// remaining small Catalans unclaimed. Band audit: triakis tetra's parent
// tret stands E (AT CAP 6); tcube's S-SW band AT CAP 6; tetrakis cube's
// parent toct + triakis octa's parents toct/trcubo stand N-E (5/6) — the
// ONLY remaining Catalan whose parent's band holds its last slot.
// ACHIRAL, machine-proven (T0b: the closing mirror maps measured — no
// handedness owed Bill).
//
// ONE IDEA: SIX DOORS, READ THROUGH THE LOOKING GLASS. The parent told
// the SPACE FILLER — the one cell that tiles the universe by translation
// alone, its six squares the six doors to the six neighboring cells
// (struct-245 T6: 0 uncovered, 0 double-covered over 17,576 lattice
// points). The polar reciprocal about its midsphere (rho = 1/sqrt(2)
// EXACT) turns every parent face into a POINT and every one of the 24
// toct VERTICES into a SHALLOW ISOCELES sail — one sq apex + two hex
// wings, every sail kissing ONE insphere at exactly rho^2/R (the Catalan
// tangent property, T6). THE RANK INVERSION IS THE STORY: the parent's
// hexagon planes ARE its own octahedron faces (h_hex = 1/sqrt(3)) while
// its square doors cut DEEP (h_sq = 2/3 — the t=1/3 razor) — so in the
// dual the EIGHT HEXAGON-FACES stand as the EIGHT GREAT OUTER POINTS at
// sqrt(3)/2 along <111> — which is (±1/2,±1/2,±1/2) EXACTLY: THE CUBE
// ITSELF, the closed form the dual owes its grandparent octahedron, the
// door-framed cube surfacing through the cut — and the SIX DOOR-ghosts
// sink to the inner rank (rho^2/h_sq = 3/4 along the axes, degree 4 —
// the sharpest apexes). THE SHALLOWEST RELIEF IN THE FAMILY: closed
// forms apex arccos(1/9) = 83.6206deg / base arccos(2/3) = 48.1897deg,
// and the two long sides are EXACTLY 3/4 of the base (the door-ghost
// radius class told in the sail's own sides) — the cube's faces barely
// broken, the parent's t=1/3 razor (the SAME cut as the tico) deciding
// the rise. [Self-catch (a) this tick: my first T2 draft claimed
// apex-supplement == the tetrahedral angle — a wrong mental shortcut,
// red-honestly falsified by the MEASURED 83.6206deg on the first run;
// the LAW was wrong, not the geometry (struct-271's own self-catch
// class). The corrected law asserts the exact closed forms.]
// Presentation: HEX-RANK POINT-DOWN 3-fold on the parent's own seated
// frame INHERITED (hexagon-down <111> + up-door twist-snap — no re-seat;
// the same upper door that read dead-on az 0 in the parent puts its
// ghost apex dead-on az 0 here). STONE carries all 24 sails (ONE face
// family = ONE sail material) + the TWENTY-FOUR-sided dais (one side
// per sail, theme-number law); IRON carries all 36 seam bonds + the
// crown finial stem. Night contract: the parent's OWN bead census told
// again — SIX warm brass beads at the six door-ghost apexes in two
// staggered triangles (3 upper + 3 lower, 60deg apart, one dead at az
// 0), NONE pressed into the earth (the parent's honest difference: the
// doors live at the waist) + the tret v2 crown finial the point-crown
// owes = glow_tetrakis_7. Each hemisphere's ring BRAIDS two triads at
// 60deg — hex points far (perp 1/sqrt(2)) and sq ghosts near (perp
// 0.4787) — the octahedron's own 3-fold vertex figure, a hexagon, told
// in two ranks.
//
// Laws honored: dais APOTHEM-FIRST (struct-247); texMat lanes (struct-38);
// ROOT STAYS IDENTITY (struct-188); NaN 0; below-grade 0.
//
// THEOREMS machine-verified below:
//   T0 dual census + midsphere: 14/36/24; every toct edge midpoint at
//      exactly one radius rho (== 1/sqrt(2) closed-form in the parent
//      frame); two dual vertex radii classes rho^2/h exact, hex-rank
//      OUTERMOST (sqrt(3)/2, the cube) / sq-rank INNERMOST (3/4, the
//      door ghosts) — the rank inversion measured.
//   T0b ACHIRALITY: SOME improper orthogonal map closes BOTH vertex
//      sets — no handedness owed.
//   T1 Euler: 14 - 36 + 24 = 2 (sphere).
//   T2 sail census: 24 isoceles triangles; every sail one sq apex + two
//      hex wings in ring order; per-face angle multiset IDENTICAL across
//      all faces; the two base angles EQUAL within every face (isoceles
//      mirror law); sides 2 equal long (hex-sq) + 1 base (hex-hex);
//      apex + 2*base == pi AND the closed forms hold EXACTLY — apex
//      arccos(1/9), base arccos(2/3), long/base == 3/4 (the door-ghost
//      radius class told in the sail's own sides).
//   T3 vertex census: degree 4 at the 6 sq-rank apexes / 6 at the 8
//      hex-rank points (the parent's every-vertex-deg-3 inverted);
//      Sum(deg) == 2E.
//   T4 manifold: every dual edge on exactly 2 faces (48 slots).
//   T5 edge census: exactly TWO rank-pair classes hex-sq (24) /
//      hex-hex (12), zero sq-sq (no two doors ever shared a wall in the
//      parent — struct-245 T5); two edge-length classes equal within
//      class (the Catalan is face-transitive, NOT uniform).
//   T6 THE POLAR RECIPROCAL: every one of the 24 sails has all three
//      verts at EXACTLY plane depth rho^2/R_toct from the dual center
//      (all faces kiss ONE insphere — the Catalan tangent property);
//      every sail normal is EXACTLY one toct vertex direction
//      (bijection 24/24).
//   T7 seat laws: foot + crown hex-rank points dead on the axis; foot
//      AT the dais top AND the lowest vertex overall (point-down
//      proof, margin measured); 120-degree symmetry 0 misses (3-fold
//      seat); central inversion exact; centroid on axis; height ==
//      target; never overhangs (apothem-first); the six door-ghost
//      apexes = two exact staggered triangles (3 upper level + 3 lower
//      level, sq triad offset 60deg from the hex triad in each
//      hemisphere, one upper sq apex dead at az 0 — parent twist
//      INHERITED), lower ring the exact central-inversion mirror of
//      the upper; bead census honest (6 aloft door ghosts, NONE
//      pressed — the parent's own idiom; + crown finial); FINIAL-
//      CLEARANCE LAW (tret v2) against the WORST occluder.
//   T8 immersion: every inset plate corner strictly INSIDE the convex
//      solid; corner tuck reported.
//   RED control: --red displaces one dual vertex 0.3 — T2/T5/T6/T7 fail.

export const TARGET_H = 6.9;              // seated solid height — family ladder next step (rico 6.3, dtria 6.6, deltoid 6.7, triakis 6.8 -> 6.9)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.15;               // brass door-ghost bead (family scale)
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

// ==== THE PARENT TOCT, rebuilt verbatim from struct-245's closed forms (frozen math) ========================

// ---- grandparent octahedron: the six (±1,0,0)-type corners, edge √2 ---------------------------------------
const M: V3[] = [];
for (const a of [1, -1]) {
    M.push([a, 0, 0], [0, a, 0], [0, 0, a]);
}
if (M.length !== 6) throw Error(`octahedron verts ${M.length} != 6`);
const P_EDGE = Math.SQRT2;                    // parent edge (exact for these coords)
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++)
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) < 1e-12) P_EDGES.push([i, j]);
if (P_EDGES.length !== 12) throw Error(`parent edges ${P_EDGES.length} != 12`);

// ---- truncation at 1/3 (the SAME law as the tico): 24 verts, deduped by proximity --------------------------
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
if (Math.abs(R_UNIT - R_CLOSED) > 1e-12) throw Error(`R ${R_UNIT} != closed ${R_CLOSED}`);

// ---- toct edges by distance --------------------------------------------------------------------------------
const PEDGES: [number, number][] = [];
for (let i = 0; i < 24; i++) for (let j = i + 1; j < 24; j++)
    if (Math.abs(dist(pts[i], pts[j]) - A_UNIT) < 1e-9) PEDGES.push([i, j]);
if (PEDGES.length !== 36) throw Error(`toct edges ${PEDGES.length} != 36`);

// ---- toct faces: 6 squares (the doors) + 8 hexagons (the parent's own face planes) -------------------------
type Face = { k: number; verts: number[]; center: V3; n: V3; isSq: boolean; h: number };
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
// squares: one per parent vertex (its 4 near cut points, sorted around)
for (let i = 0; i < 6; i++) {
    const nbrs = P_EDGES.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));
    if (nbrs.length !== 4) throw Error(`parent degree ${nbrs.length} != 4`);
    const ring = nbrs.map((j) => add(M[i], mul(sub(M[j], M[i]), 1 / 3)));
    const { verts, center, n } = orderRing(ring);
    pfaces.push({ k: 4, verts, center, n, isSq: true, h: dot(ring[0], n) });
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
        pfaces.push({ k: 6, verts: o.verts, center: o.center, n: o.n, isSq: false, h: dot(ring[0], o.n) });
    }
}
if (pfaces.length !== 14) throw Error(`parent faces ${pfaces.length} != 14`);
if (pfaces.filter((f) => f.isSq).length !== 6) throw Error("square count != 6");

// parent edge -> its two faces
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < pfaces.length; fi++) for (let t = 0; t < pfaces[fi].verts.length; t++) {
    const a = pfaces[fi].verts[t], b = pfaces[fi].verts[(t + 1) % pfaces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ==== THE DUAL: polar reciprocal about the midsphere ========================================================

// ---- midsphere: every toct edge midpoint at one radius rho = 1/√2 -------------------------------------------
const rho = (() => { const [i, j] = PEDGES[0]; return Math.hypot(...mul(add(pts[i], pts[j]), 0.5)); })();
let rhoSpread = 0;
for (const [i, j] of PEDGES) {
    const m = mul(add(pts[i], pts[j]), 0.5);
    rhoSpread = Math.max(rhoSpread, Math.abs(Math.hypot(...m) - rho));
}

// ---- the 14 dual vertices: v_u = (rho^2 / h_u) . n_u (h_u = MEASURED plane depth) ----------------------------
const R2 = rho * rho;
type Rank = "hex" | "sq";
const TYPE: Rank[] = pfaces.map((f) => f.isSq ? "sq" : "hex");
const H_OF: Record<Rank, number> = (() => {
    const h: Record<Rank, number> = { hex: 0, sq: 0 };
    for (const f of pfaces) {
        if (h[f.isSq ? "sq" : "hex"] === 0) h[f.isSq ? "sq" : "hex"] = f.h;
        else if (Math.abs(h[f.isSq ? "sq" : "hex"] - f.h) > 1e-9) throw Error(`family ${f.isSq ? "sq" : "hex"} depth not level`);
    }
    return h;
})();
const DV: V3[] = pfaces.map((f) => mul(f.n, R2 / f.h));
const classR = { hex: R2 / H_OF.hex, sq: R2 / H_OF.sq };

// ---- the 24 dual faces: one ISOCELES sail per toct vertex (figure hex-sq-hex) -------------------------------
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
        if (inc.length !== 3) throw Error(`toct vertex ${i}: ${inc.length} incident faces (want 3)`);
        const fams = inc.map((fi) => TYPE[fi]).sort().join("+");
        if (fams !== "hex+hex+sq") throw Error(`toct vertex ${i} figure ${fams} (want hex+hex+sq)`);
        const ring = inc.map((fi) => DV[fi]);
        const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / 3);
        const n = nrm(pts[i]);                     // EXACT plane normal: the toct vertex direction
        const e1 = nrm(sub(ring[0], c));
        const e2 = cross(n, e1);
        const ordered = [...ring].sort((p, q) =>
            Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
        DUAL_FACES.push({ verts: ordered.map((p) => pidxD(p)), center: c, n, ofVertex: i });
    }
    if (DUAL_FACES.length !== 24) throw Error(`dual faces ${DUAL_FACES.length} != 24`);
}

// ---- the 36 dual edges: one per toct edge, joining the duals of its two faces -------------------------------
const DUAL_EDGES: [number, number][] = [];
{
    const seenE = new Set<string>();
    for (const [a, b] of PEDGES) {
        const fl = edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`)!;
        if (fl.length !== 2) throw Error(`toct edge ${a}-${b}: ${fl.length} faces (want 2)`);
        const [u1, u2] = fl;
        const key = u1 < u2 ? `${u1}-${u2}` : `${u2}-${u1}`;
        if (seenE.has(key)) throw Error(`duplicate dual edge ${key}`);
        seenE.add(key);
        DUAL_EDGES.push(u1 < u2 ? [u1, u2] : [u2, u1]);
    }
    if (DUAL_EDGES.length !== 36) throw Error(`dual edges ${DUAL_EDGES.length} != 36`);
}
export const E: [number, number][] = DUAL_EDGES;

// ==== SEAT: the toct's own seated frame, INHERITED (hexagon-down <111> + up-door twist-snap, verbatim math) =

// ---- seating: hexagon normal (1,1,1)/√3 → −Y (HEXAGON DOWN, 3-fold seat — the parent's own axis) ------------
const v0 = nrm([1, 1, 1]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// twist-snap (parent selector verbatim, struct-245): an UP square door (outward
// normal with positive vertical — the shoulders, not the skirt) dead to az 0.
// In the dual, that door's ghost apex (same direction) inherits the snap.
const az0 = (() => {
    let best = Infinity, az = 0;
    for (const f of pfaces) {
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
// Ry(t) maps az a → a−t (az = atan2(z,x)); twist = snapAz zeroes the snap point (struct-245 self-catch v2).
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], az0);
const rot = (v: V3): V3 => rot2(rot1(v));

// ---- scale + lift: the FOOT hex-rank point lands exactly on the dais top ------------------------------------
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

// rank indices (hex = the 8 points over the parent's hexagon faces — the cube corners)
export const HEX_IDX: number[] = TYPE.map((t, i) => t === "hex" ? i : -1).filter((i) => i >= 0);
export const SQ_IDX: number[] = TYPE.map((t, i) => t === "sq" ? i : -1).filter((i) => i >= 0);
export const CROWN_IDX = HEX_IDX.reduce((best, i) => V[i][1] > V[best][1] ? i : best, HEX_IDX[0]);
export const FOOT_IDX = HEX_IDX.reduce((best, i) => V[i][1] < V[best][1] ? i : best, HEX_IDX[0]);

// ---- FINIAL stem: solved against the WORST occluder (hex points + sq apexes included), floored at STEM_H_BASE -
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

// ---- the 7 brass beads: 6 door-ghost apexes poked radial + 1 crown finial ------------------------------------
export const BEADS: V3[] = (() => {
    const out: V3[] = [];
    for (const i of SQ_IDX) {
        const dir = nrm(sub(V[i], SOLID_CENTER));
        out.push(add(V[i], mul(dir, BEAD_POKE)));
    }
    out.push([0, V[CROWN_IDX][1] + BEAD_POKE + STEM_H, 0]);   // crown finial rides the iron stem (tret v2)
    if (out.length !== 7) throw Error(`beads ${out.length} != 7`);
    return out;
})();

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
    const nHex = TYPE.filter((t) => t === "hex").length;
    const nSq = TYPE.filter((t) => t === "sq").length;
    const rhoClosed = 1 / Math.SQRT2;         // toct midradius in the a = √2/3 frame (measured == closed)
    check("T0 dual census + midsphere: 14/36/24; every toct edge midpoint at exactly ONE radius rho (== 1/sqrt(2) closed-form in the parent frame); two dual vertex radii classes rho^2/h exact — 8 hex-rank OUTERMOST at sqrt(3)/2 (the parent's own hexagon planes, shallowest h — the CUBE corners, the closed form the dual owes the grandparent octahedron) + 6 sq-rank INNERMOST at 3/4 (the deep t=1/3 door cuts — the door GHOSTS): THE RANK INVERSION — the doors sink, the faces they never were stand as the crown",
        rhoSpread < 1e-12 && Math.abs(rho - rhoClosed) < 1e-12 && worstR < 1e-12 && nHex === 8 && nSq === 6
        && DV.length === 14 && DUAL_EDGES.length === 36 && DUAL_FACES.length === 24 && classR.hex > classR.sq,
        `midsphere spread ${rhoSpread.toExponential(1)} (rho ${rho.toFixed(9)} == 1/sqrt2 ${rhoClosed.toFixed(9)}, toct a=${A_UNIT.toFixed(6)} frame); depths hex ${H_OF.hex.toFixed(6)} / sq ${H_OF.sq.toFixed(6)}; radii hex ${classR.hex.toFixed(6)} / sq ${classR.sq.toFixed(6)} (ratio ${(classR.hex / classR.sq).toFixed(4)} == 2/sqrt3) worst dev ${(worstR * 1e12).toExponential(1)}`);
}

// ---- T0b ACHIRALITY: some improper orthogonal map closes the vertex set -----------------------------------
{
    // triakis self-catch carried: achirality means SOME improper map closes
    // the set — test all six candidates and report which.
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
    let aApex = -1, aBase = -1, sLong = -1, sBase = -1;
    let worstApex = 0, worstBase = 0, worstSum = 0, badFam = 0, worstBasePair = 0, worstSidePair = 0;
    for (const F of DUAL_FACES) {
        const vs = F.verts;
        const fams = vs.map((vi) => TYPE[vi]).sort().join("+");
        if (fams !== "hex+hex+sq") badFam++;
        // ring position of the sq apex
        const sqPos = vs.findIndex((vi) => TYPE[vi] === "sq");
        const angAt = (t: number) => {
            const p0 = V[vs[(t + 2) % 3]], p1 = V[vs[t]], p2 = V[vs[(t + 1) % 3]];
            return Math.acos(Math.max(-1, Math.min(1, dot(nrm(sub(p0, p1)), nrm(sub(p2, p1))))));
        };
        // the two base angles (at the hex corners) must be EQUAL within the face (isoceles mirror law)
        const d0 = (sqPos + 1) % 3, d1 = (sqPos + 2) % 3;
        worstBasePair = Math.max(worstBasePair, Math.abs(angAt(d0) - angAt(d1)));
        const apex = angAt(sqPos), base = angAt(d0);
        if (aApex < 0) aApex = apex; else worstApex = Math.max(worstApex, Math.abs(apex - aApex));
        if (aBase < 0) aBase = base; else worstBase = Math.max(worstBase, Math.abs(base - aBase));
        let sum = 0;
        for (let t = 0; t < 3; t++) {
            sum += angAt(t);
            const L = dist(V[vs[t]], V[vs[(t + 1) % 3]]);
            const pairTy = [TYPE[vs[t]], TYPE[vs[(t + 1) % 3]]].sort().join("-");
            const key = pairTy === "hex-sq" ? "long" : pairTy === "hex-hex" ? "base" : "BAD";
            if (key === "BAD") badFam++;
            else if (sLong < 0 && key === "long") sLong = L;
            else if (key === "long") worstSidePair = Math.max(worstSidePair, Math.abs(L - sLong));
            if (key === "base") { if (sBase < 0) sBase = L; else worstSidePair = Math.max(worstSidePair, Math.abs(L - sBase)); }
        }
        worstSum = Math.max(worstSum, Math.abs(sum - Math.PI));
    }
    // THE CLOSED FORMS (self-catch (a) corrected law): apex arccos(1/9),
    // base arccos(2/3), long/base == 3/4 EXACTLY — the door-ghost radius
    // class (3/4) told in the sail's own sides.
    const APEX_CLOSED = Math.acos(1 / 9);
    const BASE_CLOSED = Math.acos(2 / 3);
    const RATIO_CLOSED = 3 / 4;
    const closedLaws = Math.abs(aApex - APEX_CLOSED) < 1e-12
        && Math.abs(aBase - BASE_CLOSED) < 1e-12
        && Math.abs(sLong / sBase - RATIO_CLOSED) < 1e-12;
    check("T2 sails: 24 faces; every sail one sq apex + two hex wings in ring order; per-face angle multiset IDENTICAL across ALL faces (apex class at the sq corner, base class at the hex corners); the two base angles EQUAL within every face (isoceles mirror law); sides 2 equal long (hex-sq) + 1 base (hex-hex); angle sum pi; THE CLOSED FORMS hold EXACTLY — apex arccos(1/9), base arccos(2/3), long/base == 3/4 (the door-ghost radius class told in the sail's own sides — the cube's faces barely broken, the parent's t=1/3 razor deciding the rise)",
        worstApex < 1e-12 && worstBase < 1e-12 && worstSum < 1e-12 && badFam === 0 && worstBasePair < 1e-12 && worstSidePair < 1e-12 && closedLaws,
        `worst apex dev ${(worstApex * 1e12).toExponential(1)}; worst base dev ${worstBase.toExponential(1)}; worst base-pair dev ${worstBasePair.toExponential(1)} (isoceles mirror); worst side dev ${(worstSidePair * 1e12).toExponential(1)}; worst sum dev ${worstSum.toExponential(1)}; apex ${(aApex * 180 / Math.PI).toFixed(4)}deg == arccos(1/9) ${(APEX_CLOSED * 180 / Math.PI).toFixed(4)} / base ${(aBase * 180 / Math.PI).toFixed(4)}deg == arccos(2/3) ${(BASE_CLOSED * 180 / Math.PI).toFixed(4)} (MEASURED — the Catalan's own sail); long ${sLong.toFixed(6)} base ${sBase.toFixed(6)} (ratio ${(sLong / sBase).toFixed(4)} == 3/4 EXACTLY — the shallowest relief, nearly equilateral)`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------------
{
    const deg = new Array(14).fill(0);
    for (const [a, b] of DUAL_EDGES) { deg[a]++; deg[b]++; }
    const want: Record<Rank, number> = { sq: 4, hex: 6 };
    let bad = 0;
    for (let u = 0; u < 14; u++) if (deg[u] !== want[TYPE[u]]) bad++;
    check("T3 vertices: degree 4 at the 6 sq-rank door-ghost apexes (the square's fourness told at a point) / 6 at the 8 hex-rank points (the hexagon's sixness told at a point — the parent's every-vertex-deg-3 inverted); Sum(deg) == 2E",
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
    const sameRank = keys.filter((k) => k === "sq-sq");
    const allSpread = [...classes.values()].every((c) => c.worstLen < 1e-12);
    check("T5 edges: exactly TWO rank-pair classes hex-sq (24, from the parent's H-S edges) / hex-hex (12, from the parent's H-H edges), ZERO sq-sq (no two doors ever shared a wall in the parent — struct-245 T5, the space filler's own law); two edge-length classes equal within class (long/base MEASURED — the Catalan is face-transitive, NOT uniform: unequal classes are the honest signature)",
        sameRank.length === 0 && keys.length === 2 && classes.get("hex-sq")!.n === 24 && classes.get("hex-hex")!.n === 12 && allSpread,
        `classes: ${keys.map((k) => `${k} ${classes.get(k)!.n} edges L ${classes.get(k)!.len.toFixed(6)} (spread ${(classes.get(k)!.worstLen * 1e12).toExponential(1)})`).join("; ")}; zero sq-sq — the doors never met each other in the parent`);
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
    // (b) every dual face normal is EXACTLY one toct vertex direction (pre-seat, bijection)
    let worstN = 0;
    const used = new Set<number>();
    for (const F of DUAL_FACES) {
        worstN = Math.max(worstN, dist(F.n, nrm(pts[F.ofVertex])));
        used.add(F.ofVertex);
    }
    check("T6 THE POLAR RECIPROCAL: all 24 sails kiss ONE insphere (every vert at exactly plane depth rho^2/R — the Catalan tangent property, mirror of the toct's every-vertex-on-one-sphere); every face normal EXACTLY one toct vertex direction (bijection 24/24)",
        worstPlane < 1e-12 && worstN < 1e-12 && used.size === 24,
        `worst plane dev ${(worstPlane * 1e12).toExponential(1)} vs depth ${wantPlane.toFixed(9)} (rho^2/R scaled); worst normal dev ${worstN.toExponential(1)}; toct-vertex bijection ${used.size}/24`);
}

// ---- T7 seat laws ---------------------------------------------------------------------------------------------
{
    const footV = V[FOOT_IDX], crownV = V[CROWN_IDX];
    const axisOk = Math.hypot(footV[0], footV[2]) < 1e-12 && Math.hypot(crownV[0], crownV[2]) < 1e-12;
    const footAtDais = Math.abs(footV[1] - PLINTH_H) < 1e-12;
    // THE POINT-DOWN PROOF: the foot hex point is the LOWEST vertex overall (margin over the lowest other)
    let lowestOther = Infinity, lowestOtherIs = "";
    for (let u = 0; u < V.length; u++) {
        if (u === FOOT_IDX) continue;
        if (V[u][1] < lowestOther) { lowestOther = V[u][1]; lowestOtherIs = `${TYPE[u]}-rank`; }
    }
    const footLowest = footV[1] < lowestOther - 1e-9;
    const footMargin = lowestOther - footV[1];
    // 120-degree symmetry about Y (the 3-fold <111> seat)
    const a = Math.PI * 2 / 3, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    // central inversion (the toct is centrally symmetric; the dual inherits exactly)
    let invMiss = 0;
    for (const v of V) { const r = sub(SOLID_CENTER, sub(v, SOLID_CENTER)); if (!V.some((q) => dist(q, r) < 1e-6)) invMiss++; }
    const cx = V.reduce((s2, v) => s2 + v[0], 0) / 14;
    const cz = V.reduce((s2, v) => s2 + v[2], 0) / 14;
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    // the 6 door-ghost apexes: two staggered triangles (3 upper + 3 lower), each sq triad
    // offset 60deg from the hex triad of its hemisphere; lower = exact inversion mirror
    const midY = LIFT;
    const upSq = SQ_IDX.map((i) => V[i]).filter((p) => p[1] > midY);
    const dnSq = SQ_IDX.map((i) => V[i]).filter((p) => p[1] < midY);
    const upHex = HEX_IDX.map((i) => V[i]).filter((p) => p[1] > midY && Math.hypot(p[0], p[2]) > 1e-9);
    const levelSpread = (ring: V3[]) => Math.max(...ring.map((p) => p[1])) - Math.min(...ring.map((p) => p[1]));
    const radiusSpread = (ring: V3[]) => {
        const rs = ring.map((p) => Math.hypot(p[0], p[2]));
        return Math.max(...rs) - Math.min(...rs);
    };
    const azOf = (p: V3) => Math.atan2(p[2], p[0]);
    const onLattice = (ring: V3[], offsetRad: number) => ring.length === 3 && ring.every((p) =>
        Math.abs(Math.atan2(Math.sin((azOf(p) - offsetRad) * 3), Math.cos((azOf(p) - offsetRad) * 3))) < 1e-6);
    // hex triad lattice offset (upper hex ring) — NOT snapped (only the DOOR snaps, parent law)
    const hexOff = azOf(upHex[0]);
    const hexLattice = onLattice(upHex, hexOff);
    const sqOff = azOf(upSq[0]);
    const sqLattice = onLattice(upSq, sqOff);
    // the parent's twist INHERITED: one upper door-ghost apex dead at az 0
    const hasSnap = upSq.some((p) => Math.abs(azOf(p)) < 1e-9);
    // 60deg interleave: the sq triad sits exactly between the hex triad
    let interleave = Infinity;
    for (const sp of upSq) {
        let best = Infinity;
        for (const hp of upHex) {
            const d = azOf(sp) - azOf(hp);
            best = Math.min(best, Math.abs(Math.atan2(Math.sin(d), Math.cos(d))));
        }
        interleave = Math.min(interleave, best);
    }
    const interleaveOk = Math.abs(interleave - Math.PI / 3) < 1e-6;
    // lower ring = exact inversion mirror of the upper (per rank)
    const invMirror = upSq.every((p) =>
        dnSq.some((q) => dist(q, sub(SOLID_CENTER, sub(p, SOLID_CENTER))) < 1e-9));
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
    // bead census: 6 door ghosts ALL ALOFT (none pressed — the parent's own idiom: the doors live at the waist)
    const apexBeads = BEADS.slice(0, 6);
    const allAloft = apexBeads.every((p) => p[1] - BEAD_R > PLINTH_H + 1e-9);
    const crownBead = BEADS[6];
    const t7parts = {
        axisOk, footAtDais, footLowest, footMargin: footMargin.toFixed(4), lowestOtherIs,
        symMiss, invMiss, ctr: Math.hypot(cx, cz),
        hgt: height.toFixed(6), reach: (MAX_H + ROD_R).toFixed(3), apothem: apothem.toFixed(3),
        rings: `sq ${upSq.length}up+${dnSq.length}dn / hexTriad ${upHex.length}up`,
        upSqLevel: levelSpread(upSq).toExponential(1), upSqRadius: radiusSpread(upSq).toExponential(1),
        sqLattice, hexLattice, hasSnap,
        interleaveDeg: (interleave * 180 / Math.PI).toFixed(2), invMirror,
        sightY: sightY.toFixed(3), stemH: STEM_H.toFixed(2),
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3), allAloft,
    };
    check("T7 seat: foot + crown hex-rank points dead on the axis, foot AT dais top AND the LOWEST VERTEX OVERALL (point-down proof, margin measured); 120-degree symmetry 0 misses (3-fold seat); central inversion exact; centroid on axis; height == target; never overhangs (apothem-first); SIX door-ghost apexes = two exact staggered triangles (3 upper + 3 lower), each sq triad on its own 120-degree lattice offset 60deg from the hemisphere's hex triad (the octahedron's own vertex figure braided in two ranks), one upper sq apex dead at az 0 (parent twist INHERITED), lower ring the exact inversion mirror; beads 6 aloft door ghosts NONE pressed (the parent's own honest idiom) + 1 crown finial; FINIAL clears the WORST occluder sight line",
        axisOk && footAtDais && footLowest && symMiss === 0 && invMiss === 0 && Math.hypot(cx, cz) < 1e-12
        && Math.abs(height - TARGET_H) < 1e-9 && MAX_H + ROD_R <= apothem + 1e-9
        && upSq.length === 3 && dnSq.length === 3 && upHex.length === 3
        && levelSpread(upSq) < 1e-12 && radiusSpread(upSq) < 1e-12
        && sqLattice && hexLattice && hasSnap && interleaveOk && invMirror
        && allAloft && Math.hypot(crownBead[0], crownBead[2]) < 1e-12
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; foot hex point ${footV[1].toFixed(6)} == dais top ${PLINTH_H}, lowest other vertex (${lowestOtherIs}) ${lowestOther.toFixed(6)} — margin ${(lowestOther - footV[1]).toFixed(4)}m; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); sq triads level/radii exact, 60deg interleave measured, snap az0 INHERITED; stem ${STEM_H.toFixed(2)}m solved against worst occluder sight ${sightY.toFixed(3)}; FINIAL crown bead top ${beadTop.toFixed(3)} clears by ${finialClear.toFixed(3)}m (>= ${(1.5 * BEAD_R).toFixed(3)} law)`);
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
    // beads: 6 door ghosts (poked) + crown finial (stem-lifted)
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

console.log(`solve: toct rebuilt from closed forms (R ${R_UNIT.toFixed(9)} == (a/2)sqrt(10)); midsphere rho ${rho.toFixed(9)} == 1/sqrt2; dual radii hex ${classR.hex.toFixed(6)} / sq ${classR.sq.toFixed(6)}; depths hex ${H_OF.hex.toFixed(6)} / sq ${H_OF.sq.toFixed(6)}; scale ${SCALE.toFixed(9)} (height ${TARGET_H})`);
console.log(`seat: HEX-RANK POINT-DOWN 3-fold on the parent's own frame (hexagon-down <111> + up-door twist-snap INHERITED — no re-seat); foot hex point at dais top ${PLINTH_H} AND the lowest vertex; solid height ${TARGET_H}m; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} -> ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} >= reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`build: 36 iron seam rods + 24 stone isoceles sails + ${PLINTH_N}-gon stone dais + glow_tetrakis_7 (6 door-ghost apexes in two staggered triangles NONE pressed + 1 crown finial stem ${STEM_H.toFixed(2)}m)`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct273-tetrakis)");
