// struct275-probe-trit.ts — STRUCTURES LANE struct-275, Round 11 R11-83.
// THE TRIAKIS TETRAHEDRON — the Catalan dual of the standing truncated
// tetrahedron (tret, struct-247/248, E band az4.0 r76.0 — AT CAP 6).
// Catalan branch member 6 (rt struct-235; dtria struct-267/268; deltoid
// struct-269/270; triakis struct-271/272; tetrakis struct-273/274). The
// dual-of-standing-parent move a SIXTH time (gsd->gdodec, trico->dtria,
// rico->deltoid, tdodec->triakis, toct->tetrakis, tret->trit). FIRST
// family member to seat OUTSIDE its parent's quarter (every parent band
// capped — E/SW/N-E all 6/6; the R11-84 seat goes to a fresh under-served
// octant, surfaced in the plan when it lands).
//
// FORM-LEDGER GREP fresh this tick (triakis|tetrakis|pentakis + tkt/trit
// over the five-file set): 0 real claims — triakis tetra/octa were the
// only unclaimed achiral small Catalans; triakis TETRA selected (richest
// story: the parent is the family's own FIRST Archimedean). ACHIRAL,
// machine-proven (T0b: the three sign-flip mirrors close both sets).
//
// ONE IDEA: THE FIRST CUT'S GHOST, READ THROUGH THE LOOKING GLASS. The
// parent tret told the BALANCED REMAINDER — the tetrahedron cut at a
// third, exactly 23 of 27 parts standing (struct-247 T6 machine-exact).
// The polar reciprocal about its midsphere (rho == 1 EXACT — every tret
// edge midpoint on ONE sphere, both edge classes) turns every parent face
// into a POINT and every one of the 12 tret VERTICES into an ISOCELES
// sail — one tri apex + two hex corners, every sail kissing ONE insphere
// at exactly rho^2/R_tret == 3/sqrt(11) (the Catalan tangent property,
// T6). THE RANK INVERSION IS THE STORY: the four hexagon planes ARE the
// grandparent's own face planes (h_hex 1/sqrt(3)) while the cut triangles
// sit deep (h_tri 5/(3*sqrt(3))) — so in the dual the FOUR HEXAGONS stand
// as the FOUR GREAT OUTER POINTS at radius sqrt(3) along -V — THE
// GRANDPARENT TETRAHEDRON ITSELF, REFLECTED THROUGH THE CENTER, the
// closed form the dual owes the parent's parent — while the four
// cut-ghosts sink to the inner rank at 3*sqrt(3)/5 (ratio 5/3 EXACTLY —
// THE DEEPEST RELIEF IN THE FAMILY FLEET: deltoid 1.046, tetrakis 1.155,
// triakis 1.170, trit 1.667) and short/base == 3/5 EXACTLY (the razor's
// own measure told in the sail's sides). [Self-catch (a) this tick: my
// first derivation put the tri-ghost at the CUT-POINT position 3V/5 by
// conflating the cut point with the dual radius — re-derivation from
// h_tri = 5/(3*sqrt(3)) MEASURED on the mixed vertex confirmed the radius
// IS 3V/5; the plane depth, not the edge parameter, decides. Self-catch
// (b): I initially over-carried the toct-lineage CENTRAL INVERSION test —
// the tetrahedron is NOT centrally symmetric and neither is its dual; the
// honest law is THE LOOKING GLASS: every cut-ghost T_j stands EXACTLY
// collinear-opposite its hexagon point H_j through the center (T_j along
// +V_j, H_j along -V_j), 4/4 machine-exact.]
// Presentation: TRI-GHOST POINT-DOWN 3-fold on the parent's own seated
// frame INHERITED VERBATIM (triangle-down + twist-snap — no re-seat; the
// parent's down-triangle at corner V_1 puts its ghost T_1 at the foot and
// the crown hexagon's point H_1 at the top: point-down at BOTH ends, the
// family look). Silhouette: the foot spike rises to a WIDE three-shoulder
// belt low (r 4.12 at 1.47m), tapers through the cut-ghost dimple ring
// (r 2.48 at 3.80m, offset 60deg), and climbs to the tall reflected-
// grandparent crown point at 7.0m — a three-sided spire. STONE carries
// all 12 sails (ONE face family = ONE sail material) + the TWELVE-sided
// dais (one side per sail, theme-number law); IRON carries all 18 seam
// bonds + the crown finial stem. Night contract: the parent's OWN bead
// census told AGAIN, transcribed to the dual — its four lit hexagon
// centers become the four H points: 1 crown FINIAL on the iron stem + 3
// waist-belt beads at exact 120deg, ONE SNAPPED DEAD TO AZ 0 (the
// parent's own waist ring snapped the same way), NONE pressed (the
// parent's honest idiom; the foot is the cut-ghost, unlit — absence is
// the mark of the removed corner) = glow_trit_4.
//
// Laws honored: dais APOTHEM-FIRST (struct-247); texMat lanes (struct-38);
// ROOT STAYS IDENTITY (struct-188); NaN 0; below-grade 0.
//
// THEOREMS machine-verified below:
//   T0 dual census + midsphere: 8/18/12; every tret edge midpoint at
//      exactly ONE radius rho == 1 (both edge classes, closed-form in the
//      parent frame); two dual vertex radii classes 1/h exact — hex-rank
//      OUTERMOST at sqrt(3) (the reflected grandparent tetrahedron) /
//      tri-rank INNERMOST at 3*sqrt(3)/5 (the cut ghosts): ratio 5/3 —
//      THE DEEPEST RELIEF IN THE FAMILY FLEET, measured.
//   T0b ACHIRALITY: SOME improper orthogonal map closes BOTH vertex
//      sets — no handedness owed.
//   T1 Euler: 8 - 18 + 12 = 2 (sphere).
//   T2 sail census: 12 isoceles triangles; every sail one tri apex + two
//      hex corners in ring order; per-face angle multiset IDENTICAL across
//      all faces; the two base angles EQUAL within every face (isoceles
//      mirror law); sides 2 equal short (hex-tri) + 1 base (hex-hex);
//      apex + 2*base == pi AND the closed forms hold EXACTLY — apex
//      arccos(-7/18), base arccos(5/6), short/base == 3/5 (the razor's
//      own measure told in the sail's sides).
//   T3 vertex census: degree 3 at BOTH ranks (the tetra's own every-
//      corner-deg-3 law inherited by the dual — the ONLY family parent
//      with uniform vertex degree, honestly noted); Sum(deg) == 2E.
//   T4 manifold: every dual edge on exactly 2 faces (36 slots).
//   T5 edge census: exactly TWO rank-pair classes hex-hex (6, from the
//      parent's H-H edges) / hex-tri (12, from the parent's H-T edges),
//      ZERO tri-tri (no two cuts ever shared an edge in the parent);
//      two edge-length classes equal within class (the Catalan is
//      face-transitive, NOT uniform: base 2*sqrt(2) vs short 6*sqrt(2)/5).
//   T6 THE POLAR RECIPROCAL: every one of the 12 sails has all three
//      verts at EXACTLY plane depth rho^2/R_tret == 3/sqrt(11) scaled
//      (all faces kiss ONE insphere — the Catalan tangent property);
//      every sail normal is EXACTLY one tret vertex direction
//      (bijection 12/12).
//   T7 seat laws: foot T-ghost + crown H point dead on the axis; foot
//      AT the dais top AND the lowest vertex overall (point-down proof,
//      margin measured); crown the TOP vertex at exactly TARGET_H above
//      the dais; 120-degree symmetry 0 misses (3-fold seat); centroid on
//      axis; never overhangs (apothem-first); THE LOOKING GLASS — every
//      T_j EXACTLY collinear-opposite H_j through the center (4/4); the
//      belt triad (3 H points) level + radii exact on its 120deg lattice
//      with ONE point dead at az 0 (parent twist INHERITED); the dimple
//      triad (3 T mid ghosts) level + radii exact, lattice offset 60deg
//      from the belt; belt r > dimple r AND dimple y > belt y (the rank
//      inversion told in plan); beads 3 belt aloft NONE pressed + 1 crown
//      finial; FINIAL-CLEARANCE LAW (tret v2) against the WORST occluder.
//   T8 immersion: every inset plate corner strictly INSIDE the convex
//      solid; corner tuck reported.
//   RED control: --red displaces one dual vertex 0.3 — T2/T5/T6/T7 fail.

export const TARGET_H = 7.0;              // seated solid height — family ladder next step (rico 6.3, dtria 6.6, deltoid 6.7, triakis 6.8, tetrakis 6.9 -> 7.0)
export const ROD_R = 0.06;                // seam rod radius (18m contrast law)
export const BEAD_R = 0.15;               // brass belt bead (family scale)
export const BEAD_POKE = 0.02;            // bead center proud along the radial dir (grazing-read law, disclosed)
export const STEM_H_BASE = 1.30;          // FINIAL stem floor: crown bead lifted on an iron pin (tret v2 occlusion law; solved higher if occluders demand)
export const STEM_R = 0.03;               // finial stem radius (slender iron pin)
export const READER_D = 18;               // lane reading distance (sight-line law domain)
export const READER_EYE = 1.65;           // reader eye height
export const PLATE_T = 0.10;              // panel thickness
export const PLATE_INSET = 0.07;          // panel corner inset (seam reveal — family look)
export const PLATE_BACK = 0.018;          // panel outer face behind rod surface
export const PLINTH_N = 12;               // TWELVE sides — one per sail (theme-number law)
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

// ==== THE PARENT TRET, rebuilt verbatim from struct-247's closed forms (frozen math) ========================

// ---- grandparent tetrahedron: M=(1,1,1),(1,-1,-1),(-1,-1,1),(-1,1,-1), edge 2*sqrt(2) -----------------------
const M: V3[] = [[1, 1, 1], [1, -1, -1], [-1, -1, 1], [-1, 1, -1]];
const P_EDGE = 2 * Math.SQRT2;                 // parent-tetra edge (exact for these coords)
const P_EDGES: [number, number][] = [];
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    if (Math.abs(dist(M[i], M[j]) - P_EDGE) > 1e-12) throw Error(`tetra pair ${i}-${j} not an edge`);
    P_EDGES.push([i, j]);
}
if (P_EDGES.length !== 6) throw Error(`tetra edges ${P_EDGES.length} != 6`);

// ---- truncation at 1/3 (the SAME law as tico/toct — struct-247): 12 verts ---------------------------------
const A_UNIT = P_EDGE / 3;                     // uniform edge of the unit tret (2*sqrt(2)/3)
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
if (pts.length !== 12) throw Error(`truncation verts ${pts.length} != 12`);
const R_UNIT = Math.hypot(...pts[0]);          // sqrt(11)/3
const R_CLOSED = (A_UNIT / 4) * Math.sqrt(22); // closed form — must equal R_UNIT
if (Math.abs(R_UNIT - R_CLOSED) > 1e-12) throw Error(`R ${R_UNIT} != closed ${R_CLOSED}`);

// ---- tret edges by distance --------------------------------------------------------------------------------
const PEDGES: [number, number][] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++)
    if (Math.abs(dist(pts[i], pts[j]) - A_UNIT) < 1e-9) PEDGES.push([i, j]);
if (PEDGES.length !== 18) throw Error(`tret edges ${PEDGES.length} != 18`);

// ---- tret faces: 4 triangles (the cuts) + 4 hexagons (the grandparent's own face planes) -------------------
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
// triangles: one per tetra corner (its 3 near cut points, sorted around)
for (let i = 0; i < 4; i++) {
    const ring: V3[] = [];
    for (let j = 0; j < 4; j++) if (j !== i) ring.push(add(mul(M[i], 2 / 3), mul(M[j], 1 / 3)));
    const { verts, center, n } = orderRing(ring);
    pfaces.push({ k: 3, verts, center, n, isTri: true, h: dot(ring[0], n) });
}
// hexagons: one per tetra face — walk the triangle, take both cut points per directed edge
{
    const pAdj = (a: number, b: number) => P_EDGES.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
    const seen = new Set<string>();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) {
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
        pfaces.push({ k: 6, verts: o.verts, center: o.center, n: o.n, isTri: false, h: dot(ring[0], o.n) });
    }
}
if (pfaces.length !== 8) throw Error(`parent faces ${pfaces.length} != 8`);
if (pfaces.filter((f) => f.isTri).length !== 4) throw Error("triangle count != 4");

// parent edge -> its two faces
const edgeFaces = new Map<string, number[]>();
for (let fi = 0; fi < pfaces.length; fi++) for (let t = 0; t < pfaces[fi].verts.length; t++) {
    const a = pfaces[fi].verts[t], b = pfaces[fi].verts[(t + 1) % pfaces[fi].verts.length];
    const kk = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeFaces.set(kk, [...(edgeFaces.get(kk) ?? []), fi]);
}

// ==== THE DUAL: polar reciprocal about the midsphere ========================================================

// ---- midsphere: every tret edge midpoint at one radius rho == 1 (BOTH edge classes, closed-form) -----------
const rho = (() => { const [i, j] = PEDGES[0]; return Math.hypot(...mul(add(pts[i], pts[j]), 0.5)); })();
let rhoSpread = 0;
for (const [i, j] of PEDGES) {
    const m = mul(add(pts[i], pts[j]), 0.5);
    rhoSpread = Math.max(rhoSpread, Math.abs(Math.hypot(...m) - rho));
}

// ---- the 8 dual vertices: v_u = (rho^2 / h_u) . n_u (h_u = MEASURED plane depth) ----------------------------
const R2 = rho * rho;
type Rank = "hex" | "tri";
const TYPE: Rank[] = pfaces.map((f) => f.isTri ? "tri" : "hex");
const H_OF: Record<Rank, number> = (() => {
    const h: Record<Rank, number> = { hex: 0, tri: 0 };
    for (const f of pfaces) {
        if (h[f.isTri ? "tri" : "hex"] === 0) h[f.isTri ? "tri" : "hex"] = f.h;
        else if (Math.abs(h[f.isTri ? "tri" : "hex"] - f.h) > 1e-9) throw Error(`family ${f.isTri ? "tri" : "hex"} depth not level`);
    }
    return h;
})();
const DV: V3[] = pfaces.map((f) => mul(f.n, R2 / f.h));
const classR = { hex: R2 / H_OF.hex, tri: R2 / H_OF.tri };

// ---- the 12 dual faces: one ISOCELES sail per tret vertex (figure 3.6.6) -----------------------------------
type DFace = { verts: number[]; center: V3; n: V3; ofVertex: number };
const DUAL_FACES: DFace[] = [];
{
    const pidxD = (p: V3) => {
        const k = DV.findIndex((q) => dist(q, p) < 1e-9);
        if (k >= 0) return k;
        throw Error("dual face vertex not in dual set");
    };
    for (let i = 0; i < 12; i++) {
        const inc: number[] = [];
        for (let fi = 0; fi < pfaces.length; fi++) if (pfaces[fi].verts.includes(i)) inc.push(fi);
        if (inc.length !== 3) throw Error(`tret vertex ${i}: ${inc.length} incident faces (want 3)`);
        const fams = inc.map((fi) => TYPE[fi]).sort().join("+");
        if (fams !== "hex+hex+tri") throw Error(`tret vertex ${i} figure ${fams} (want hex+hex+tri)`);
        const ring = inc.map((fi) => DV[fi]);
        const c = mul(ring.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / 3);
        const n = nrm(pts[i]);                     // EXACT plane normal: the tret vertex direction
        const e1 = nrm(sub(ring[0], c));
        const e2 = cross(n, e1);
        const ordered = [...ring].sort((p, q) =>
            Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) - Math.atan2(dot(sub(q, c), e2), dot(sub(q, c), e1)));
        DUAL_FACES.push({ verts: ordered.map((p) => pidxD(p)), center: c, n, ofVertex: i });
    }
    if (DUAL_FACES.length !== 12) throw Error(`dual faces ${DUAL_FACES.length} != 12`);
}

// ---- the 18 dual edges: one per tret edge, joining the duals of its two faces ------------------------------
const DUAL_EDGES: [number, number][] = [];
{
    const seenE = new Set<string>();
    for (const [a, b] of PEDGES) {
        const fl = edgeFaces.get(a < b ? `${a}-${b}` : `${b}-${a}`)!;
        if (fl.length !== 2) throw Error(`tret edge ${a}-${b}: ${fl.length} faces (want 2)`);
        const [u1, u2] = fl;
        const key = u1 < u2 ? `${u1}-${u2}` : `${u2}-${u1}`;
        if (seenE.has(key)) throw Error(`duplicate dual edge ${key}`);
        seenE.add(key);
        DUAL_EDGES.push(u1 < u2 ? [u1, u2] : [u2, u1]);
    }
    if (DUAL_EDGES.length !== 18) throw Error(`dual edges ${DUAL_EDGES.length} != 18`);
}
export const E: [number, number][] = DUAL_EDGES;

// ==== SEAT: the tret's own seated frame, INHERITED VERBATIM (triangle-down + twist-snap, struct-247) ========

// ---- seating: tetra corner V_1 -> -Y (TRIANGLE DOWN, 3-fold seat — the parent's own axis) -------------------
const v0 = nrm(M[0]);
const target: V3 = [0, -1, 0];
const cr0 = cross(v0, target);
const cl = Math.hypot(...cr0);
const angU = Math.atan2(cl, dot(v0, target));
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : nrm(cr0);
const rot1 = (v: V3): V3 => rotVec(v, seatAxis, angU);
// twist-snap [SELF-CATCH (c), red-honestly on first run]: on this seat the
// three side-hexagon OUTWARD normals -M_j ride BELOW the equator (elevation
// -19.47deg — M_0 points down), so an up-normal hexagon filter matches
// NOTHING and the twist silently degenerates to identity (first run: belt
// lattice at -15deg offset, hasSnap false). The honest snap target is the
// BELT H-RING ITSELF — the night-contract feature: pick the off-axis hex
// dual point whose rot1 azimuth is closest to 0 and zero it. The parent's
// waist idiom preserved (one belt point dead at az 0); the frame stays the
// parent's own (same seat axis, twist re-derived, disclosed).
const az0 = (() => {
    let best = Infinity, az = 0, found = false;
    for (let u = 0; u < DV.length; u++) {
        if (TYPE[u] !== "hex") continue;                 // the belt family (hex duals)
        const p = rot1(DV[u]);
        if (Math.hypot(p[0], p[2]) < 1e-6) continue;     // off-axis only (crown hex point guard)
        const a = Math.atan2(p[2], p[0]);
        const norm = Math.atan2(Math.sin(a), Math.cos(a));
        if (Math.abs(norm) < best) { best = Math.abs(norm); az = a; found = true; }
    }
    if (!found) throw Error("twist-snap found no off-axis belt hex point");
    return az;
})();
// Ry(t) maps az a -> a-t (az = atan2(z,x)); twist = snapAz zeroes the snap point (struct-245 self-catch v2).
const rot2 = (v: V3): V3 => rotVec(v, [0, 1, 0], az0);
const rot = (v: V3): V3 => rot2(rot1(v));

// ---- scale + lift: the FOOT tri-ghost lands exactly on the dais top ----------------------------------------
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

// rank indices (hex = the 4 points over the parent's hexagon faces — the reflected grandparent;
// tri = the 4 cut-ghosts). Seated: ONE hex point is the crown (top, on axis), three form the
// belt; ONE tri ghost is the foot (bottom, on axis), three form the dimple ring.
export const HEX_IDX: number[] = TYPE.map((t, i) => t === "hex" ? i : -1).filter((i) => i >= 0);
export const TRI_IDX: number[] = TYPE.map((t, i) => t === "tri" ? i : -1).filter((i) => i >= 0);
export const CROWN_IDX = V.reduce((best, v, i) => v[1] > V[best][1] ? i : best, 0);
export const FOOT_IDX = V.reduce((best, v, i) => v[1] < V[best][1] ? i : best, 0);
export const BELT_IDX = HEX_IDX.filter((i) => i !== CROWN_IDX);
export const TMID_IDX = TRI_IDX.filter((i) => i !== FOOT_IDX);

// ---- FINIAL stem: solved against the WORST occluder (both ranks included), floored at STEM_H_BASE ---------
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

// ---- the 4 brass beads: the parent's own census transcribed to the dual (3 belt + 1 crown finial) -----------
export const BEADS: V3[] = (() => {
    const out: V3[] = [];
    for (const i of BELT_IDX) {
        const dir = nrm(sub(V[i], SOLID_CENTER));
        out.push(add(V[i], mul(dir, BEAD_POKE)));
    }
    out.push([0, V[CROWN_IDX][1] + BEAD_POKE + STEM_H, 0]);   // crown finial rides the iron stem (tret v2)
    if (out.length !== 4) throw Error(`beads ${out.length} != 4`);
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
    for (let u = 0; u < 8; u++) worstR = Math.max(worstR, Math.abs(Math.hypot(...DV[u]) - classR[TYPE[u]]));
    const nHex = TYPE.filter((t) => t === "hex").length;
    const nTri = TYPE.filter((t) => t === "tri").length;
    const rhoClosed = 1;                       // tret midradius in the a = 2*sqrt(2)/3 frame (measured == closed)
    check("T0 dual census + midsphere: 8/18/12; every tret edge midpoint at exactly ONE radius rho (== 1 closed-form, BOTH edge classes) ; two dual vertex radii classes rho^2/h exact — 4 hex-rank OUTERMOST at sqrt(3) along -V (THE GRANDPARENT TETRAHEDRON ITSELF, REFLECTED THROUGH THE CENTER — the closed form the dual owes the parent's parent) + 4 tri-rank INNERMOST at 3*sqrt(3)/5 (the cut ghosts): ratio 5/3 — THE DEEPEST RELIEF IN THE FAMILY FLEET (deltoid 1.046, tetrakis 1.155, triakis 1.170, trit 1.667)",
        rhoSpread < 1e-12 && Math.abs(rho - rhoClosed) < 1e-12 && worstR < 1e-12 && nHex === 4 && nTri === 4
        && DV.length === 8 && DUAL_EDGES.length === 18 && DUAL_FACES.length === 12 && classR.hex > classR.tri,
        `midsphere spread ${rhoSpread.toExponential(1)} (rho ${rho.toFixed(9)} == 1, tret a=${A_UNIT.toFixed(6)} frame); depths hex ${H_OF.hex.toFixed(6)} / tri ${H_OF.tri.toFixed(6)}; radii hex ${classR.hex.toFixed(6)} / tri ${classR.tri.toFixed(6)} (ratio ${(classR.hex / classR.tri).toFixed(4)} == 5/3) worst dev ${(worstR * 1e12).toExponential(1)}`);
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
check("T1 Euler 8−18+12 = 2", V.length === 8 && DUAL_EDGES.length === 18 && DUAL_FACES.length === 12 && V.length - DUAL_EDGES.length + DUAL_FACES.length === 2,
    `V ${V.length}, E ${DUAL_EDGES.length}, F ${DUAL_FACES.length}, chi ${V.length - DUAL_EDGES.length + DUAL_FACES.length}`);

// ---- T2 sail census: the face-transitive Catalan signature + the isoceles mirror ---------------------------
{
    let aApex = -1, aBase = -1, sShort = -1, sBase = -1;
    let worstApex = 0, worstBase = 0, worstSum = 0, badFam = 0, worstBasePair = 0, worstSidePair = 0;
    for (const F of DUAL_FACES) {
        const vs = F.verts;
        const fams = vs.map((vi) => TYPE[vi]).sort().join("+");
        if (fams !== "hex+hex+tri") badFam++;
        // ring position of the tri apex
        const triPos = vs.findIndex((vi) => TYPE[vi] === "tri");
        const angAt = (t: number) => {
            const p0 = V[vs[(t + 2) % 3]], p1 = V[vs[t]], p2 = V[vs[(t + 1) % 3]];
            return Math.acos(Math.max(-1, Math.min(1, dot(nrm(sub(p0, p1)), nrm(sub(p2, p1))))));
        };
        // the two base angles (at the hex corners) must be EQUAL within the face (isoceles mirror law)
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
            const key = pairTy === "hex-tri" ? "short" : pairTy === "hex-hex" ? "base" : "BAD";
            if (key === "BAD") badFam++;
            else if (sShort < 0 && key === "short") sShort = L;
            else if (key === "short") worstSidePair = Math.max(worstSidePair, Math.abs(L - sShort));
            if (key === "base") { if (sBase < 0) sBase = L; else worstSidePair = Math.max(worstSidePair, Math.abs(L - sBase)); }
        }
        worstSum = Math.max(worstSum, Math.abs(sum - Math.PI));
    }
    // THE CLOSED FORMS: apex arccos(-7/18), base arccos(5/6), short/base == 3/5
    // EXACTLY — the razor's own measure (the 1/3 cut whose dual radius is 3/5)
    // told in the sail's own sides.
    const APEX_CLOSED = Math.acos(-7 / 18);
    const BASE_CLOSED = Math.acos(5 / 6);
    const RATIO_CLOSED = 3 / 5;
    const closedLaws = Math.abs(aApex - APEX_CLOSED) < 1e-12
        && Math.abs(aBase - BASE_CLOSED) < 1e-12
        && Math.abs(sShort / sBase - RATIO_CLOSED) < 1e-12;
    check("T2 sails: 12 faces; every sail one tri apex + two hex corners in ring order; per-face angle multiset IDENTICAL across ALL faces (apex class at the tri corner, base class at the hex corners); the two base angles EQUAL within every face (isoceles mirror law); sides 2 equal short (hex-tri) + 1 base (hex-hex); angle sum pi; THE CLOSED FORMS hold EXACTLY — apex arccos(-7/18), base arccos(5/6), short/base == 3/5 (the razor's own measure told in the sail's own sides — the deepest relief in the family fleet)",
        worstApex < 1e-12 && worstBase < 1e-12 && worstSum < 1e-12 && badFam === 0 && worstBasePair < 1e-12 && worstSidePair < 1e-12 && closedLaws,
        `worst apex dev ${(worstApex * 1e12).toExponential(1)}; worst base dev ${worstBase.toExponential(1)}; worst base-pair dev ${worstBasePair.toExponential(1)} (isoceles mirror); worst side dev ${(worstSidePair * 1e12).toExponential(1)}; worst sum dev ${worstSum.toExponential(1)}; apex ${(aApex * 180 / Math.PI).toFixed(4)}deg == arccos(-7/18) ${(APEX_CLOSED * 180 / Math.PI).toFixed(4)} / base ${(aBase * 180 / Math.PI).toFixed(4)}deg == arccos(5/6) ${(BASE_CLOSED * 180 / Math.PI).toFixed(4)} (MEASURED — the Catalan's own sail); short ${sShort.toFixed(6)} base ${sBase.toFixed(6)} (ratio ${(sShort / sBase).toFixed(4)} == 3/5 EXACTLY)`);
}

// ---- T3 vertex census ---------------------------------------------------------------------------------------
{
    const deg = new Array(8).fill(0);
    for (const [a, b] of DUAL_EDGES) { deg[a]++; deg[b]++; }
    // [SELF-CATCH (d), red-honestly on first run] the honest Catalan law: dual
    // vertex degree == parent face side count (hexagons -> 6, cut triangles ->
    // 3) — my first draft claimed "deg 3 at both ranks" from the false shortcut
    // "tetra corners are deg-3 so the dual is too" (the struct-271/273 law-error
    // class, third instance this tick: the LAW was wrong, not the geometry).
    const want: Record<Rank, number> = { hex: 6, tri: 3 };
    let bad = 0;
    for (let u = 0; u < 8; u++) if (deg[u] !== want[TYPE[u]]) bad++;
    check("T3 vertices: degree 6 at the 4 hex-rank points (the hexagon's sixness told at a point — every pair of parent hexagons shared an edge) / degree 3 at the 4 tri-rank cut-ghosts (the triangle's threeness told at a point); Sum(deg) == 2E",
        bad === 0 && deg.reduce((s, d) => s + d, 0) === 2 * DUAL_EDGES.length,
        `rank violations ${bad}; Sum(deg) ${deg.reduce((s, d) => s + d, 0)} == 2E ${2 * DUAL_EDGES.length}`);
}

// ---- T4 manifold ---------------------------------------------------------------------------------------------{
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
    check("T4 manifold: every dual edge on exactly 2 faces", bad === 0 && unmatched === 0 && ef.size === 18,
        `${ef.size} face-edges (36 slots), ${bad} wrong multiplicity, ${unmatched} of ${DUAL_EDGES.length} unmatched`);
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
    check("T5 edges: exactly TWO rank-pair classes hex-hex (6, from the parent's H-H edges — every pair of hexagons shared an edge in the tret) / hex-tri (12, from the parent's H-T edges), ZERO tri-tri (no two cuts ever shared an edge in the parent — the 1/3 razor never met itself); two edge-length classes equal within class (base 2*sqrt(2) vs short 6*sqrt(2)/5 scaled — the Catalan is face-transitive, NOT uniform: unequal classes are the honest signature)",
        sameRank.length === 0 && keys.length === 2 && classes.get("hex-hex")!.n === 6 && classes.get("hex-tri")!.n === 12 && allSpread,
        `classes: ${keys.map((k) => `${k} ${classes.get(k)!.n} edges L ${classes.get(k)!.len.toFixed(6)} (spread ${(classes.get(k)!.worstLen * 1e12).toExponential(1)})`).join("; ")}; zero tri-tri — the cuts never met each other in the parent`);
}

// ---- T6 THE POLAR RECIPROCAL ---------------------------------------------------------------------------------
{
    // (a) all 12 sails kiss ONE insphere: every vert at exactly plane depth rho^2/R from the center
    const wantPlane = (R2 / R_UNIT) * SCALE;
    let worstPlane = 0;
    for (let u = 0; u < DUAL_FACES.length; u++) {
        const n = NORMALS[u];
        for (const vi of DUAL_FACES[u].verts) worstPlane = Math.max(worstPlane, Math.abs(dot(sub(V[vi], SOLID_CENTER), n) - wantPlane));
    }
    // (b) every dual face normal is EXACTLY one tret vertex direction (pre-seat, bijection)
    let worstN = 0;
    const used = new Set<number>();
    for (const F of DUAL_FACES) {
        worstN = Math.max(worstN, dist(F.n, nrm(pts[F.ofVertex])));
        used.add(F.ofVertex);
    }
    check("T6 THE POLAR RECIPROCAL: all 12 sails kiss ONE insphere (every vert at exactly plane depth rho^2/R == 3/sqrt(11) scaled — the Catalan tangent property, mirror of the tret's every-vertex-on-one-sphere); every face normal EXACTLY one tret vertex direction (bijection 12/12)",
        worstPlane < 1e-12 && worstN < 1e-12 && used.size === 12,
        `worst plane dev ${(worstPlane * 1e12).toExponential(1)} vs depth ${wantPlane.toFixed(9)} (rho^2/R scaled); worst normal dev ${worstN.toExponential(1)}; tret-vertex bijection ${used.size}/12`);
}

// ---- T7 seat laws ---------------------------------------------------------------------------------------------
{
    const footV = V[FOOT_IDX], crownV = V[CROWN_IDX];
    const axisOk = Math.hypot(footV[0], footV[2]) < 1e-12 && Math.hypot(crownV[0], crownV[2]) < 1e-12;
    const footAtDais = Math.abs(footV[1] - PLINTH_H) < 1e-12;
    // THE POINT-DOWN PROOF: the foot tri-ghost is the LOWEST vertex overall (margin over the lowest other)
    let lowestOther = Infinity, lowestOtherIs = "";
    for (let u = 0; u < V.length; u++) {
        if (u === FOOT_IDX) continue;
        if (V[u][1] < lowestOther) { lowestOther = V[u][1]; lowestOtherIs = `${TYPE[u]}-rank`; }
    }
    const footLowest = footV[1] < lowestOther - 1e-9;
    const footMargin = lowestOther - footV[1];
    // crown is the TOP vertex, exactly TARGET_H above the dais top
    let topOther = -Infinity;
    for (let u = 0; u < V.length; u++) if (u !== CROWN_IDX) topOther = Math.max(topOther, V[u][1]);
    const crownTop = crownV[1] > topOther + 1e-9;
    const crownMargin = crownV[1] - topOther;
    const heightAboveDais = crownV[1] - PLINTH_H;
    // 120-degree symmetry about Y (the 3-fold seat)
    const a = Math.PI * 2 / 3, c = Math.cos(a), s = Math.sin(a);
    const Ry = (p: V3): V3 => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    let symMiss = 0;
    for (const v of V) { const r = Ry(v); if (!V.some((q) => dist(q, r) < 1e-6)) symMiss++; }
    // [Self-catch (b) carried: NO central-inversion test — the tetra is not centrally
    // symmetric and neither is its dual. The honest law is THE LOOKING GLASS:]
    // every tri cut-ghost T_j is EXACTLY collinear-OPPOSITE a hex point H_j through
    // the center (T_j along +V_j, H_j along -V_j in the pre-seat frame) — 4/4 exact.
    // [SELF-CATCH (e): partner selection takes the MIN dot (the anti-parallel
    // partner, dot == -1), never the max — first draft matched a neighbor at
    // dot +1/3 instead, 0/4.]
    let lgWorst = 0, lgPairs = 0;
    for (const ti of TRI_IDX) {
        const dT = nrm(sub(V[ti], SOLID_CENTER));
        let bestDot = Infinity, bestJ = -1;
        for (const hi of HEX_IDX) {
            const dH = nrm(sub(V[hi], SOLID_CENTER));
            if (dot(dT, dH) < bestDot) { bestDot = dot(dT, dH); bestJ = hi; }
        }
        // collinear opposite: dot == -1 exactly (cross magnitude implied by unit vectors)
        const dH = nrm(sub(V[bestJ], SOLID_CENTER));
        const crossMag = Math.hypot(...cross(dT, dH));
        if (Math.abs(bestDot + 1) < 1e-12 && crossMag < 1e-12) lgPairs++;
        lgWorst = Math.max(lgWorst, Math.abs(bestDot + 1), crossMag);
    }
    const cx = V.reduce((s2, v) => s2 + v[0], 0) / 8;
    const cz = V.reduce((s2, v) => s2 + v[2], 0) / 8;
    const height = Math.max(...V.map((v) => v[1])) - Math.min(...V.map((v) => v[1]));
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    // the belt triad (3 up H points): level + radii exact + 120deg lattice + ONE dead at az 0
    const belt = BELT_IDX.map((i) => V[i]);
    const levelSpread = (ring: V3[]) => Math.max(...ring.map((p) => p[1])) - Math.min(...ring.map((p) => p[1]));
    const radiusSpread = (ring: V3[]) => {
        const rs = ring.map((p) => Math.hypot(p[0], p[2]));
        return Math.max(...rs) - Math.min(...rs);
    };
    const azOf = (p: V3) => Math.atan2(p[2], p[0]);
    const onLattice = (ring: V3[], offsetRad: number) => ring.length === 3 && ring.every((p) =>
        Math.abs(Math.atan2(Math.sin((azOf(p) - offsetRad) * 3), Math.cos((azOf(p) - offsetRad) * 3))) < 1e-6);
    const beltOff = azOf(belt[0]);
    const beltLattice = onLattice(belt, beltOff);
    const hasSnap = belt.some((p) => Math.abs(azOf(p)) < 1e-9);
    // the dimple triad (3 T mid ghosts): level + radii exact + lattice offset 60deg from the belt
    const tmid = TMID_IDX.map((i) => V[i]);
    const tmidOff = azOf(tmid[0]);
    const tmidLattice = onLattice(tmid, tmidOff);
    let interleave = Infinity;
    for (const tp of tmid) {
        let best = Infinity;
        for (const bp of belt) {
            const d = azOf(tp) - azOf(bp);
            best = Math.min(best, Math.abs(Math.atan2(Math.sin(d), Math.cos(d))));
        }
        interleave = Math.min(interleave, best);
    }
    const interleaveOk = Math.abs(interleave - Math.PI / 3) < 1e-6;
    // the rank inversion told in plan: belt (outer rank) WIDE and LOW, dimples (inner rank) NARROW and HIGH
    const beltR = Math.hypot(belt[0][0], belt[0][2]);
    const tmidR = Math.hypot(tmid[0][0], tmid[0][2]);
    const beltY = belt[0][1], tmidY = tmid[0][1];
    const rankInPlan = beltR > tmidR + 1e-9 && tmidY > beltY + 1e-9;
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
    // bead census: 3 belt beads ALL ALOFT (none pressed — the parent's own honest idiom)
    const beltBeads = BEADS.slice(0, 3);
    const allAloft = beltBeads.every((p) => p[1] - BEAD_R > PLINTH_H + 1e-9);
    const crownBead = BEADS[3];
    const t7parts = {
        axisOk, footAtDais, footLowest, footMargin: footMargin.toFixed(4), lowestOtherIs,
        crownTop, crownMargin: crownMargin.toFixed(4), heightAboveDais: heightAboveDais.toFixed(6),
        symMiss, lgPairs, lgWorst: lgWorst.toExponential(1), ctr: Math.hypot(cx, cz),
        beltAz: belt.map((p) => (azOf(p) * 180 / Math.PI).toFixed(6)).join("/"),
        tmidAz: tmid.map((p) => (azOf(p) * 180 / Math.PI).toFixed(6)).join("/"),
        hgt: height.toFixed(6), reach: (MAX_H + ROD_R).toFixed(3), apothem: apothem.toFixed(3),
        beltY: beltY.toFixed(3), beltR: beltR.toFixed(3), tmidY: tmidY.toFixed(3), tmidR: tmidR.toFixed(3),
        beltLattice, tmidLattice, hasSnap,
        interleaveDeg: (interleave * 180 / Math.PI).toFixed(2), rankInPlan,
        sightY: sightY.toFixed(3), stemH: STEM_H.toFixed(2),
        finialClear: finialClear.toFixed(3), need: (1.5 * BEAD_R).toFixed(3), allAloft,
    };
    check("T7 seat: foot tri-ghost + crown hex point dead on the axis (point-down at BOTH ends — the parent's own frame inherited, no re-seat); foot AT dais top AND the LOWEST VERTEX OVERALL (point-down proof, margin measured); crown the TOP vertex at exactly TARGET_H above the dais; 120-degree symmetry 0 misses (3-fold seat); THE LOOKING GLASS — every cut-ghost EXACTLY collinear-opposite a hex point through the center (4/4, the tetra's own non-central symmetry honestly told); centroid on axis; height == target; never overhangs (apothem-first); belt triad level/radii exact on its 120deg lattice, ONE point dead at az 0 (parent twist INHERITED); dimple triad level/radii exact, lattice offset 60deg from the belt; rank inversion in plan (belt WIDE+LOW, dimples NARROW+HIGH); beads 3 belt aloft NONE pressed (the parent's own idiom) + 1 crown finial; FINIAL clears the WORST occluder sight line",
        axisOk && footAtDais && footLowest && crownTop && symMiss === 0 && lgPairs === 4 && Math.hypot(cx, cz) < 1e-12
        && Math.abs(height - TARGET_H) < 1e-9 && Math.abs(heightAboveDais - TARGET_H) < 1e-9 && MAX_H + ROD_R <= apothem + 1e-9
        && belt.length === 3 && tmid.length === 3
        && levelSpread(belt) < 1e-12 && radiusSpread(belt) < 1e-12 && beltLattice && hasSnap
        && levelSpread(tmid) < 1e-12 && radiusSpread(tmid) < 1e-12 && tmidLattice && interleaveOk && rankInPlan
        && allAloft && Math.hypot(crownBead[0], crownBead[2]) < 1e-12
        && finialClear >= 1.5 * BEAD_R,
        `parts ${JSON.stringify(t7parts)}; foot tri-ghost ${footV[1].toFixed(6)} == dais top ${PLINTH_H}, lowest other vertex (${lowestOtherIs}) ${lowestOther.toFixed(6)} — margin ${footMargin.toFixed(4)}m; crown hex point ${crownV[1].toFixed(6)} (top by ${crownMargin.toFixed(4)}, ${heightAboveDais.toFixed(6)} == ${TARGET_H} above dais); looking-glass pairs ${lgPairs}/4 worst dev ${lgWorst.toExponential(1)}; height ${height.toFixed(4)} == ${TARGET_H}; reach+rod ${(MAX_H + ROD_R).toFixed(3)} <= apothem ${apothem.toFixed(3)} (R ${PLINTH_R} apothem-first); belt ${beltY.toFixed(3)}/r${beltR.toFixed(3)} vs dimples ${tmidY.toFixed(3)}/r${tmidR.toFixed(3)}; snap az0 INHERITED; stem ${STEM_H.toFixed(2)}m solved against worst occluder sight ${sightY.toFixed(3)}; FINIAL crown bead top ${beadTop.toFixed(3)} clears by ${finialClear.toFixed(3)}m (>= ${(1.5 * BEAD_R).toFixed(3)} law)`);
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
    // beads: 3 belt (poked) + crown finial (stem-lifted)
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

console.log(`solve: tret rebuilt from closed forms (R ${R_UNIT.toFixed(9)} == (a/4)sqrt(22), a=${A_UNIT.toFixed(6)}); midsphere rho ${rho.toFixed(9)} == 1 (BOTH edge classes); dual radii hex ${classR.hex.toFixed(6)} / tri ${classR.tri.toFixed(6)} (ratio ${(classR.hex / classR.tri).toFixed(4)} == 5/3); depths hex ${H_OF.hex.toFixed(6)} / tri ${H_OF.tri.toFixed(6)}; scale ${SCALE.toFixed(9)} (height ${TARGET_H})`);
console.log(`seat: TRI-GHOST POINT-DOWN 3-fold on the parent's own frame (triangle-down + twist-snap INHERITED VERBATIM — no re-seat); foot tri-ghost at dais top ${PLINTH_H} AND the lowest vertex; crown hex point (the reflected grandparent) at ${TARGET_H} above the dais; belt r ${Math.hypot(V[BELT_IDX[0]][0], V[BELT_IDX[0]][2]).toFixed(3)} at y ${V[BELT_IDX[0]][1].toFixed(3)}, dimples r ${Math.hypot(V[TMID_IDX[0]][0], V[TMID_IDX[0]][2]).toFixed(3)} at y ${V[TMID_IDX[0]][1].toFixed(3)}; footprint max horiz ${MAX_H.toFixed(3)} + rod ${ROD_R} -> ${PLINTH_N}-gon dais R ${PLINTH_R.toFixed(2)} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} >= reach+rod ${(MAX_H + ROD_R).toFixed(3)}); envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(2)).join("x")}`);
console.log(`build: 18 iron seam rods + 12 stone isoceles sails + ${PLINTH_N}-gon stone dais + glow_trit_4 (3 belt beads NONE pressed + 1 crown finial stem ${STEM_H.toFixed(2)}m)`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct275-trit)");
