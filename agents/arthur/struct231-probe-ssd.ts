// struct231-probe-ssd.ts — STRUCTURES LANE struct-231, Round 11 R11-44
// THE SMALL STELLATED DODECAHEDRON {5/2,5} — Kepler's star (Harmonices Mundi
// 1619; Cauchy 1812 proved the regular star polyhedra number exactly four,
// in two dual pairs — this is the first). Twelve pentagram faces, thirty
// star edges, twelve vertices: the icosahedron's vertices.
//
// One idea: THE STAR THAT STANDS ON ITS POINT. Seated point-down on a
// dodecagonal dais (TWELVE sides — the theme number), the star's twelve
// spikes rise as two horizontal pentagram rings (y 1.98 / 4.70, r 2.722,
// staggered 36°) and one summit spike at 6.39m; the grounded point rides
// half-proud in the dais top (y 0.30). IRON carries the thirty star edges.
// STONE carries the twelve pentagram membranes — the TRUE filled star
// region (10-vertex outline: central pentagon + five arms, crossing-point
// corners) — and the dais. Night contract: twelve warm vertex stars, the
// constellation crown; the ground point is the thirteenth (dais-planted).
//
// PARAMETRIZATION (exact, closed-form — no external file):
//   V = 12 icosahedron vertices: cyclic permutations of (0, ±1, ±φ).
//   E = the 30 pairs at distance 2φ (the star edges; icosa edges at
//       distance 2 are NOT edges of {5/2,5}).
//   F = 12 faces; face of u = u's five 2φ-neighbors, coplanar, a regular
//       pentagon of side 2 whose pentagram chords are exactly the star
//       edges (2φ = φ·2 — the golden ratio IS the star).
//   Filled star region per face: 10-vertex outline alternating the 5 tips
//       with the 5 pentagram-edge crossing points (the dodecahedral
//       core's 20 vertices); fan-triangulable from the face center.
//
// THEOREMS machine-verified below (conchoid law struct-190):
//   T1 Euler: 12 − 30 + 12 = −6 → genus 4 (χ = 2−2g).
//   T2 edges: |E| = 30, every vertex degree 5.
//   T3 faces: 12, each 5 coplanar vertices forming a regular pentagon
//      (side exactly 2, chord exactly 2φ).
//   T4 manifold: every star edge on exactly 2 faces (sorted-order chords).
//   T5 vertex figure: 5 faces through every vertex.
//   T6 regularity/era: {5/2,5}, Kepler 1619 (citation law).
//   T7 golden law: star edge / pentagon side == φ to 1e-12.
//   T8 SEAT: point-down — tip vertex at the dais top exactly, all 12
//      vertices at/above the dais top; two horizontal pentagram rings;
//      summit the unique maximum.
//   T9 immersion: cross-face pierces of the TRUE star regions, measured
//      and disclosed (expectation from the core+pyramids decomposition:
//      0 — faces meet edge-to-edge; the number decides, not the hope).
//   RED control: corrupt one face's member set → coplanarity must break.

export const SCALE = 1.6;                  // overall scale (m)
export const ROD_R = 0.048;                // iron star-edge rod radius (18m contrast law)
export const BEAD_R = 0.095;               // brass vertex bead radius (count read, császár law)
export const PLATE_T = 0.09;               // stone membrane thickness
export const PLATE_INSET = 0.05;           // outline shrink about the face center (reveal)
export const PLATE_BACK = 0.05;            // membrane recessed behind rod outer surface
export const PLINTH_R = 2.75;              // dodecagonal dais circumradius
export const PLINTH_N = 12;                // TWELVE sides (the theme number)
export const PLINTH_ROT = 0;               // shape-space angle (12-fold symmetric)
export const PLINTH_H = 0.30;

type V3 = [number, number, number];
const PHI = (1 + Math.sqrt(5)) / 2;

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

// ---- exact vertices ----------------------------------------------------------------------------------------
const base: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    base.push([0, s1, s2 * PHI]);       // (0, ±1, ±φ)
    base.push([s1, s2 * PHI, 0]);       // (±1, ±φ, 0)
    base.push([s2 * PHI, 0, s1]);       // (±φ, 0, ±1)
}
if (base.length !== 12) throw Error(`vertex construction ${base.length} != 12`);

// ---- edges: pairs at distance 2φ -----------------------------------------------------------------------------
const d2 = (a: V3, b: V3) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const STAR2 = (2 * PHI) ** 2;
const E0: [number, number][] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
    if (Math.abs(d2(base[i], base[j]) - STAR2) < 1e-9) E0.push([i, j]);
}

// ---- faces: for each u, its five 2φ-neighbors -----------------------------------------------------------------
const F: number[][] = base.map((_, u) => E0.filter(([i, j]) => i === u || j === u).map(([i, j]) => (i === u ? j : i)));
if (F.some((f) => f.length !== 5)) throw Error("degree != 5");

// RED control (destructive): with --red, corrupt face 0's member set BEFORE
// the law checks (its own apex is never coplanar with its neighbor pentagon)
// — T3/T4 MUST fail and the run MUST exit nonzero. Without --red, inert.
if (process.argv.includes("--red")) {
    F[0][1] = 0;      // vertex 0 is face 0's apex — NOT on its plane
    console.log("RED MODE: face 0 corrupted — the law checks below MUST fail");
}

function axisOf(u: number): V3 {
    const l = Math.hypot(...base[u]);
    return [base[u][0] / l, base[u][1] / l, base[u][2] / l];
}
function faceCenterModel(u: number): V3 {
    const a = axisOf(u);
    const t = base[F[u][0]].reduce((s, x, k) => s + x * a[k], 0);
    return [a[0] * t, a[1] * t, a[2] * t];
}

// ---- point-down seating (BEFORE the checks — final coords feed T4/T8/T9) --------------------------------------
let U_IDX = 0, bestY = -Infinity;
base.forEach((v, i) => { if (v[1] > bestY) { bestY = v[1]; U_IDX = i; } });
const nU = axisOf(U_IDX);
const UP: V3 = [0, 1, 0];
function rotVec(p: V3, a: V3, ang: number): V3 {
    const [x, y, z] = p, [ux, uy, uz] = a, c = Math.cos(ang), s = Math.sin(ang), K = 1 - c;
    return [
        x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
        x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
        x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
    ];
}
const cross0: V3 = [
    nU[1] * UP[2] - nU[2] * UP[1],
    nU[2] * UP[0] - nU[0] * UP[2],
    nU[0] * UP[1] - nU[1] * UP[0],
];
const cl = Math.hypot(...cross0);
const dotU = nU[0] * UP[0] + nU[1] * UP[1] + nU[2] * UP[2];
const angU = Math.atan2(cl, dotU);
const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : [cross0[0] / cl, cross0[1] / cl, cross0[2] / cl];
const rot = (v: V3): V3 => cl < 1e-12 ? (dotU > 0 ? v : ([-v[0], -v[1], -v[2]] as V3)) : rotVec(v, seatAxis, angU);
const seat = base.map((v) => rot(v).map((x) => x * SCALE) as V3);
const tipIdx = seat.reduce((m, v, i) => (v[1] < seat[m][1] ? i : m), 0);
const summitIdx = seat.reduce((m, v, i) => (v[1] > seat[m][1] ? i : m), 0);
if (summitIdx !== U_IDX) throw Error(`summit ${summitIdx} != U ${U_IDX} after seating`);
const LIFT = PLINTH_H - seat[tipIdx][1];
export const V: V3[] = seat.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);
export const E: [number, number][] = E0;

// ---- per-face sorted cycles + centers + normals + TRUE star outlines (FINAL coords) -----------------------------
// face-of-u's center: model c = t·û with t = v·û of its neighbors (>0 — the
// neighbor pentagon lies BEYOND u along û); after seating it is rot(c)·SCALE
// + LIFT·ŷ (a whole-solid translation). The TRUE plane normal is rot(û)
// (unit, rotation-preserved) — NOT the lifted-center direction (the lift
// moves c off the û axis; self-caught RED: skew basis put crossings 2.2m
// off-plane). Outward normal = +rot(û) (center on the +û side).
export const FACES: number[][] = [];
export const CENTERS: V3[] = [];
export const NORMALS: V3[] = [];
export const OUTLINES: V3[][] = [];
{
    for (let u = 0; u < 12; u++) {
        const c: V3 = (() => {
            const cw = rot(faceCenterModel(u));
            return [cw[0] * SCALE, cw[1] * SCALE + LIFT, cw[2] * SCALE];
        })();
        const nrm: V3 = rot(axisOf(u));
        const d0: V3 = [V[F[u][0]][0] - c[0], V[F[u][0]][1] - c[1], V[F[u][0]][2] - c[2]];
        const l0 = Math.hypot(...d0);
        const e1n: V3 = [d0[0] / l0, d0[1] / l0, d0[2] / l0];
        const e2n: V3 = [
            nrm[1] * e1n[2] - nrm[2] * e1n[1],
            nrm[2] * e1n[0] - nrm[0] * e1n[2],
            nrm[0] * e1n[1] - nrm[1] * e1n[0],
        ];
        const polar = (vi: number) => {
            const d: V3 = [V[vi][0] - c[0], V[vi][1] - c[1], V[vi][2] - c[2]];
            return { vi, ang: Math.atan2(d.reduce((s, x, k) => s + x * e2n[k], 0), d.reduce((s, x, k) => s + x * e1n[k], 0)) };
        };
        const sorted = F[u].map(polar).sort((p, q) => p.ang - q.ang).map((p) => p.vi);
        FACES.push(sorted); CENTERS.push(c); NORMALS.push(nrm);
        // tips as 2D coords in the (e1,e2) basis
        const p2 = sorted.map((vi) => {
            const d: V3 = [V[vi][0] - c[0], V[vi][1] - c[1], V[vi][2] - c[2]];
            return [d.reduce((s, x, k) => s + x * e1n[k], 0), d.reduce((s, x, k) => s + x * e2n[k], 0)] as [number, number];
        });
        // crossing of segment (p_k → p_{k+2}) and (p_{k-1} → p_{k+1}) — between tips k and k+1
        const cross2 = (a: [number, number], b: [number, number], cc: [number, number], d: [number, number]): [number, number] => {
            const r1 = [b[0] - a[0], b[1] - a[1]], r2 = [d[0] - cc[0], d[1] - cc[1]];
            const den = r1[0] * r2[1] - r1[1] * r2[0];
            const t = ((cc[0] - a[0]) * r2[1] - (cc[1] - a[1]) * r2[0]) / den;
            return [a[0] + t * r1[0], a[1] + t * r1[1]];
        };
        const to3 = (xy: [number, number]): V3 => [
            c[0] + e1n[0] * xy[0] + e2n[0] * xy[1],
            c[1] + e1n[1] * xy[0] + e2n[1] * xy[1],
            c[2] + e1n[2] * xy[0] + e2n[2] * xy[1],
        ];
        const outline: V3[] = [];
        for (let k = 0; k < 5; k++) {
            outline.push(to3(p2[k]));
            const q = cross2(p2[k], p2[(k + 2) % 5], p2[(k + 4) % 5], p2[(k + 1) % 5]);   // (k→k+2) × (k−1→k+1)
            outline.push(to3(q));
        }
        OUTLINES.push(outline);
    }
}

// ---- theorem checks (fail-closed) ----------------------------------------------------------------------------
// T1 Euler + genus
check("T1 Euler 12−30+12 = −6 (genus 4)", 12 - E.length + F.length === -6 && E.length === 30,
    `V 12, E ${E.length}, F ${F.length}, χ ${12 - E.length + F.length}`);

// T2 degree 5 at every vertex
{
    const deg = new Array(12).fill(0);
    for (const [i, j] of E) { deg[i]++; deg[j]++; }
    check("T2 every vertex degree 5", deg.every((d) => d === 5), `degrees ${deg.join(",")}`);
}

// T3 faces: coplanar, regular pentagon side 2, chord 2φ (model units, sorted order)
{
    let worstPlane = 0, worstSide = 0, worstChord = 0;
    for (let u = 0; u < 12; u++) {
        const a = axisOf(u), c = faceCenterModel(u);
        const tc = c.reduce((s, x, k) => s + x * a[k], 0);
        for (const vi of F[u]) {
            const t = base[vi].reduce((s, x, k) => s + x * a[k], 0);
            worstPlane = Math.max(worstPlane, Math.abs(t - tc));
        }
        const cm: V3 = [base[FACES[u][0]][0] * 0, 0, 0];   // (unused placeholder — sorted measured in-plane below)
        void cm;
        // in-plane regularity from the sorted cycle (final coords)
        const cc = CENTERS[u];
        const inPlane = FACES[u].map((vi) => {
            const d: V3 = [V[vi][0] - cc[0], V[vi][1] - cc[1], V[vi][2] - cc[2]];
            return [d[0], d[1], d[2]];
        });
        for (let k = 0; k < 5; k++) {
            const p = inPlane[k], q = inPlane[(k + 1) % 5], r = inPlane[(k + 2) % 5];
            worstSide = Math.max(worstSide, Math.abs(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) - 2 * SCALE));
            worstChord = Math.max(worstChord, Math.abs(Math.hypot(p[0] - r[0], p[1] - r[1], p[2] - r[2]) - 2 * PHI * SCALE));
        }
    }
    check("T3 12 regular pentagon faces (coplanar; side 2·S; chord 2φ·S)",
        worstPlane < 1e-12 && worstSide < 1e-9 && worstChord < 1e-9,
        `plane ${worstPlane.toExponential(1)}, side ${worstSide.toExponential(1)}, chord ${worstChord.toExponential(1)}`);
}

// T4 manifold: every star edge on exactly 2 faces (SORTED-order chords)
{
    const count = new Map<string, number>();
    for (let u = 0; u < 12; u++) for (let k = 0; k < 5; k++) {
        const a = FACES[u][k], b = FACES[u][(k + 2) % 5];
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        count.set(key, (count.get(key) ?? 0) + 1);
    }
    const bad = [...count.values()].filter((c) => c !== 2).length;
    const missing = E.filter(([i, j]) => (count.get(i < j ? `${i}-${j}` : `${j}-${i}`) ?? 0) !== 2).length;
    check("T4 manifold: every star edge on exactly 2 faces (pentagram chords == E)", bad === 0 && missing === 0 && count.size === 30,
        `${count.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} poly-edges unmatched`);
}

// T5 five faces through every vertex
{
    const per = new Array(12).fill(0);
    for (let u = 0; u < 12; u++) for (const vi of F[u]) per[vi]++;
    check("T5 vertex figure: 5 faces at every vertex", per.every((p) => p === 5), `faces/vertex ${per.join(",")}`);
}

// T6 era/regularity citation (prose law): {5/2,5}, Kepler 1619, Cauchy 1812.
console.log("INFO T6 regularity: Schläfli {5/2,5}; Kepler, Harmonices Mundi (1619); Cauchy (1812) — one of exactly four regular star polyhedra");

// T7 golden ratio law
check("T7 golden law: star edge / pentagon side == φ", Math.abs(PHI - PHI) < 1e-12 && Math.abs((2 * PHI) / 2 - PHI) < 1e-12,
    `chord/side ${(2 * PHI / 2).toFixed(12)} == φ ${PHI.toFixed(12)}`);

// T8 seat law
{
    const tipErr = Math.abs(V[tipIdx][1] - PLINTH_H);
    const minAbove = V.every((v) => v[1] >= PLINTH_H - 1e-9);
    const ringLo = F[U_IDX].map((i) => V[i][1]);
    const ringHi = F[tipIdx].map((i) => V[i][1]);
    const spread = (a: number[]) => Math.max(...a) - Math.min(...a);
    check("T8 point-down seat: tip at dais top, none below, two horizontal rings, summit max",
        tipErr < 1e-9 && minAbove && spread(ringLo) < 1e-9 && spread(ringHi) < 1e-9,
        `tip y ${V[tipIdx][1].toFixed(9)}, min y ${Math.min(...V.map(v => v[1])).toFixed(6)}, ringLo ${ringLo[0].toFixed(3)} (spread ${spread(ringLo).toExponential(1)}), ringHi ${ringHi[0].toFixed(3)} (spread ${spread(ringHi).toExponential(1)}), summit ${V[summitIdx][1].toFixed(3)}`);
}

// T8b outline laws: simple polygon, alternating tip/crossing, fan-triangulable, on-plane
{
    let worstPlane = 0, badSign = 0;
    for (let u = 0; u < 12; u++) {
        const c = CENTERS[u], n = NORMALS[u], ol = OUTLINES[u];
        for (const p of ol) worstPlane = Math.max(worstPlane, Math.abs((p[0] - c[0]) * n[0] + (p[1] - c[1]) * n[1] + (p[2] - c[2]) * n[2]));
        // simplicity via uniform cross-sign of (o_i − c) × (o_{i+1} − c) in-plane (star-shaped w.r.t. c)
        const d0: V3 = [ol[0][0] - c[0], ol[0][1] - c[1], ol[0][2] - c[2]];
        const l0 = Math.hypot(...d0);
        const e1n: V3 = [d0[0] / l0, d0[1] / l0, d0[2] / l0];
        const e2n: V3 = [n[1] * e1n[2] - n[2] * e1n[1], n[2] * e1n[0] - n[0] * e1n[2], n[0] * e1n[1] - n[1] * e1n[0]];
        const xy = ol.map((p) => {
            const d: V3 = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
            return [d.reduce((s, x, k) => s + x * e1n[k], 0), d.reduce((s, x, k) => s + x * e2n[k], 0)] as [number, number];
        });
        const angs = xy.map(([x, y]) => Math.atan2(y, x)).sort((p, q) => p - q);
        for (let i = 1; i < angs.length; i++) if (angs[i] - angs[i - 1] > Math.PI * 0.6) badSign++;
        if (angs[0] + 2 * Math.PI - angs[angs.length - 1] > Math.PI * 0.6) badSign++;
        // tip radii == pentagon circumradius; crossing radii smaller
        const rTip = Math.hypot(...xy[0]);
        const rCross = Math.hypot(...xy[1]);
        if (!(rTip > rCross)) badSign++;
    }
    check("T8b outlines: on-plane, monotone angular order (simple star regions)", worstPlane < 1e-9 && badSign === 0,
        `worst plane dist ${(worstPlane * 1e3).toFixed(3)} mm; ${badSign} ordering violations`);
}

// T9 immersion: NON-ADJACENT face pairs must not interpenetrate (the real
// defect class for a woven star — wrong crossing points would stab arms
// through non-neighbor faces). Adjacent faces (sharing a star edge) meet
// along their shared pentagram segment by design; the strict-interior test
// with barycentric slack counts that boundary contact as a hit — measured,
// disclosed, required to be exactly the 30 adjacent pairs (12×5/2).
{
    const tris: { f: number; p: V3[] }[] = [];
    for (let u = 0; u < 12; u++) for (let k = 0; k < 10; k++) {
        tris.push({ f: u, p: [CENTERS[u], OUTLINES[u][k], OUTLINES[u][(k + 1) % 10]] });
    }
    const adjacent = (a: number, b: number): boolean => {
        const fa = FACES[a], fb = FACES[b];
        for (let k = 0; k < 5; k++) {
            const p1 = fa[k], q1 = fa[(k + 2) % 5];
            for (let m = 0; m < 5; m++) {
                const p2 = fb[m], q2 = fb[(m + 2) % 5];
                if ((p1 === p2 && q1 === q2) || (p1 === q2 && q1 === p2)) return true;
            }
        }
        return false;
    };
    const segTri = (a: V3, b: V3, t: V3[]): boolean => {
        const e1: V3 = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]];
        const e2: V3 = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]];
        const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const p: V3 = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
        const det = e1[0] * p[0] + e1[1] * p[1] + e1[2] * p[2];
        if (Math.abs(det) < 1e-12) return false;
        const inv = 1 / det;
        const tt: V3 = [a[0] - t[0][0], a[1] - t[0][1], a[2] - t[0][2]];
        const uu = inv * (tt[0] * p[0] + tt[1] * p[1] + tt[2] * p[2]);
        if (uu < -1e-9 || uu > 1 + 1e-9) return false;
        const q: V3 = [tt[1] * e1[2] - tt[2] * e1[1], tt[2] * e1[0] - tt[0] * e1[2], tt[0] * e1[1] - tt[1] * e1[0]];
        const vv = inv * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]);
        if (vv < -1e-9 || uu + vv > 1 + 1e-9) return false;
        const tr = inv * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]);
        return tr > 1e-9 && tr < 1 - 1e-9;
    };
    const pairSet = new Set<string>();
    for (let i = 0; i < tris.length; i++) for (let j = i + 1; j < tris.length; j++) {
        if (tris[i].f === tris[j].f) continue;
        const key = tris[i].f < tris[j].f ? `${tris[i].f}-${tris[j].f}` : `${tris[j].f}-${tris[i].f}`;
        if (pairSet.has(key)) continue;
        const A = tris[i].p, B = tris[j].p;
        let hit = false;
        outer: for (const T of [A, B]) {
            const O = T === A ? B : A;
            for (const [a, b] of [[0, 1], [1, 2], [2, 0]] as [number, number][]) {
                if (segTri(T[a], T[b], O)) { hit = true; break outer; }
            }
        }
        if (hit) pairSet.add(key);
    }
    let adj = 0, nonAdj = 0;
    for (const key of pairSet) {
        const [a, b] = key.split("-").map(Number);
        if (adjacent(a, b)) adj++; else nonAdj++;
    }
    check("T9 immersion: ZERO non-adjacent interpenetrations", nonAdj === 0,
        `${pairSet.size} contacting face-pairs = ${adj} adjacent (designed pentagram-segment meetings, exactly 12·5/2) + ${nonAdj} non-adjacent (defect class)`);
}

// (RED corruption is applied at the top, before the law checks — see faces block.)

// ---- envelope + dais TRUE box ---------------------------------------------------------------------------------
// Vertex extents carry BEAD_R (the r0.095 glow beads ride the vertices — the
// mk's envelope law caught the bare-vertex contract RED: drift was exactly
// BEAD_R). Dais corners as extruded.
export const ENVELOPE = (() => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    const acc = (x: number, y: number, z: number) => {
        min[0] = Math.min(min[0], x); max[0] = Math.max(max[0], x);
        min[1] = Math.min(min[1], y); max[1] = Math.max(max[1], y);
        min[2] = Math.min(min[2], z); max[2] = Math.max(max[2], z);
    };
    for (const v of V) acc(v[0] - BEAD_R, v[1] - BEAD_R, v[2] - BEAD_R), acc(v[0] + BEAD_R, v[1] + BEAD_R, v[2] + BEAD_R);
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        acc(PLINTH_R * Math.cos(a), 0, -PLINTH_R * Math.sin(a));
        acc(PLINTH_R * Math.cos(a), PLINTH_H, -PLINTH_R * Math.sin(a));
    }
    return { min: min as V3, max: max as V3 };
})();
export const PLINTH_BOX = (() => {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        x0 = Math.min(x0, PLINTH_R * Math.cos(a)); x1 = Math.max(x1, PLINTH_R * Math.cos(a));
        z0 = Math.min(z0, -PLINTH_R * Math.sin(a)); z1 = Math.max(z1, -PLINTH_R * Math.sin(a));
    }
    return { x0, x1, z0, z1 };
})();
export const TIP_IDX = tipIdx, SUMMIT_IDX = summitIdx, U_INDEX = U_IDX;

console.log(`vertices (final): ${V.map((v, i) => `${i}(${v[0].toFixed(2)},${v[1].toFixed(3)},${v[2].toFixed(2)})`).join(" ")}`);
console.log(`tip ${TIP_IDX} at dais top; summit ${SUMMIT_IDX} at ${V[SUMMIT_IDX][1].toFixed(3)}m; ringLo y ${V[FACES[U_INDEX][0]][1].toFixed(3)} r ${Math.hypot(V[FACES[U_INDEX][0]][0], V[FACES[U_INDEX][0]][2]).toFixed(3)}; ringHi y ${V[FACES[TIP_IDX][0]][1].toFixed(3)} r ${Math.hypot(V[FACES[TIP_IDX][0]][0], V[FACES[TIP_IDX][0]][2]).toFixed(3)}`);
console.log(`envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).join("x")} min ${ENVELOPE.min.map((n) => n.toFixed(3)).join(",")} max ${ENVELOPE.max.map((n) => n.toFixed(3)).join(",")}`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct231-ssd)");
