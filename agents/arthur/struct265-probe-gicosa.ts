// struct265-probe-gicosa.ts — STRUCTURES LANE struct-265, Round 11 R11-73
// THE GREAT ICOSAHEDRON {3,5/2} — the Kepler-Poinsot branch's LAST member
// (the quartet closes: SSD struct-231/232 + gdodec struct-263/264 standing).
// Twenty TRIANGLE sails — the largest triangles the icosa's vertex cage can
// carry — with FIVE meeting at every vertex (vertex figure {5/2}, the
// pentagram): impossible for a convex solid, so the sails pass THROUGH one
// another. χ = 12−30+20 = +2, GENUS ZERO — for all its weaving a
// topological sphere; the DIRECT DUAL of the standing gsd {5/2,3}, and the
// genus twin of it (both χ = +2), standing apart from the genus-4 pair
// (SSD ↔ gdodec, χ = −6). Same twelve vertices as the icosa and as the
// gdodec; same thirty edge COUNT — but the edge CLASS is the star class:
// every edge is a 2φ chord, a diagonal driven clean across an icosa face.
//
// One idea: THE STAR THAT CLIMBS. Vertex-down seat — the bottom pole
// stands at the dais center and its five tip-sails rise STEEP from the
// point to a horizontal ring at 5.45m (the star-class neighbors — the
// highest ring this cage makes), then the crown weaves to the summit pole
// at 7.41m: the tall twin of the gdodec's low canopy, same height, same
// twelve-sided vertex count. IRON carries the thirty 2φ star edges; STONE
// carries the twenty sails + the TWENTY-sided dais (the theme number: one
// per sail). Night contract: TWELVE warm brass vertex beads
// (glow_gicosa_12), the grounded one half-proud in the dais top.
//
// PARAMETRIZATION (exact, closed-form — derived, not remembered):
//   V = 12 icosahedron vertices: (0,±1,±φ), (±1,±φ,0), (±φ,0,±1);
//       R = √(φ+2) = √((5+√5)/2) ≈ 1.902113.
//   E = the 30 pairs at distance 2φ (d² = 4φ² — the STAR class; the icosa's
//       own d²=4 class is NOT this skeleton).
//   F = 20 triangles: the 3-cycles over the star class (the honest search
//       also finds and discards the d²=4 class's 20 rings — the convex
//       icosa's own faces, printed for the contrast).
//   Face plane depth h = √(R² − r_f²), r_f = 2φ/√3  ⇒  h = 1/(φ√3) exact;
//       h·r_f = 2/3 exact; the discarded icosa faces sit at √(φ+2/3).
//
// THEOREMS machine-verified below (conchoid law struct-190):
//   T0 co-sphere, distance-class census.  T1 Euler 12−30+20 = +2 (genus 0).
//   T2 degree 5 at every vertex (figure {5/2}).  T3 twenty equilateral
//   triangles over the STAR class (side 2φ·S, on-plane).  T4 manifold
//   (every edge on exactly 2 faces).  T5 five faces per vertex.  T6 golden
//   laws: face plane at EXACTLY 1/(φ√3); r_f = 2φ/√3; R = √(φ+2);
//   h·r_f = 2/3.  T7 seat: tip vertex AT the dais top, its star-ring
//   horizontal at exact 72° azimuths, summit antipodal; footprint law
//   ring+bead ≤ apothem (the 20-gon IS the true ground footprint).
//   T8 outlines on-plane, monotone (simple sails).  T9 immersion census:
//   adjacent sails meet at shared edges by design; antipodal pairs are
//   parallel and never cross; the non-adjacent crossings form the symmetric
//   interweave (constants pinned from the measured census — derived, then
//   law).  RED control: corrupt ring 0 → the laws must break and the run
//   must exit nonzero.

export const SCALE = 1.87;                 // overall scale (m) — summit 7.41m (the gdodec's twin height)
export const ROD_R = 0.048;                // iron edge rod radius (18m contrast law)
export const BEAD_R = 0.095;               // brass vertex bead radius (count read, csaszár law)
export const PLATE_T = 0.09;               // stone sail thickness
export const PLATE_INSET = 0.05;           // outline shrink about the face center (reveal)
export const PLATE_BACK = 0.05;            // sail recessed behind the ring plane (shadow gap)
export const PLINTH_APO = 3.70;            // dais APOTHEM (flats — extent law ring+bead 3.589 ≤ 3.70, probe-measured)
export const PLINTH_N = 20;                // TWENTY sides (the theme number: the sails)
export const PLINTH_ROT = 0;               // corners ON the axes (ROT=0 class, gsd convention)
export const PLINTH_R = PLINTH_APO / Math.cos(Math.PI / PLINTH_N);   // circumradius (corners at k·18°)
export const PLINTH_H = 0.30;

// T9 pinned constants — measured by the census run on the exact derived
// geometry, then made law (derive-then-pin; RED re-proven after pinning).
// The {3,5/2} immersion: all 150 non-adjacent non-antipodal pairs cross,
// 15 per face (a fuller weave than the gdodec's 30/5 — the sails are
// larger relative to the cage); adjacent pairs meet only AT their shared
// edges (no interior fan overlap — the census counts 0 adjacent contacts).
export const EXPECT_CROSS_TOTAL = 150;
export const EXPECT_CROSS_PER_FACE = 15;

type V3 = [number, number, number];
const PHI = (1 + Math.sqrt(5)) / 2;

const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

// ---- exact vertices: the icosahedron's 12 ---------------------------------------------------------------
const base: V3[] = [];
for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
    base.push([0, s1, s2 * PHI]);          // (0, ±1, ±φ)
    base.push([s1, s2 * PHI, 0]);          // (±1, ±φ, 0)
    base.push([s2 * PHI, 0, s1]);          // (±φ, 0, ±1)
}
if (base.length !== 12) throw Error(`vertex construction ${base.length} != 12`);
{
    const rs = base.map((v) => Math.hypot(...v));
    const spread = Math.max(...rs) - Math.min(...rs);
    const closed = Math.sqrt((5 + Math.sqrt(5)) / 2);
    check("T0a uniform sphere: all 12 vertices at one radius R = √((5+√5)/2)",
        spread < 1e-12 && Math.abs(rs[0] - closed) < 1e-12,
        `|v| spread ${spread.toExponential(1)}, R ${rs[0].toFixed(9)} (closed ${closed.toFixed(9)})`);
}

const d2 = (a: V3, b: V3) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

// ---- distance-class census (printed — the derivation is honest about its options) ------------------------
{
    const classes = new Map<string, number>();
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
        const k = d2(base[i], base[j]).toFixed(9);
        classes.set(k, (classes.get(k) ?? 0) + 1);
    }
    console.log(`distance classes (d² → count): ${[...classes.entries()].map(([k, c]) => `${k}×${c}`).join(", ")}`);
}

// ---- E: pairs at distance 2φ (the STAR class — this skeleton's own edges) --------------------------------
const EDGE2 = 4 * PHI * PHI;               // (2φ)² = 4φ² ≈ 10.472136
const E0: [number, number][] = [];
for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
    if (Math.abs(d2(base[i], base[j]) - EDGE2) < 1e-9) E0.push([i, j]);
}

const adjAt = (dist2v: number) => {
    const adj: number[][] = Array.from({ length: 12 }, () => []);
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
        if (Math.abs(d2(base[i], base[j]) - dist2v) < 1e-9) { adj[i].push(j); adj[j].push(i); }
    }
    return adj;
};
const adjEdge = adjAt(EDGE2);

// ---- ring search: all 3-cycles over every distance class -------------------------------------------------
function findRings(dist2v: number): number[][] {
    const adj = adjAt(dist2v);
    const seen = new Set<string>();
    const rings: number[][] = [];
    const dfs = (path: number[]) => {
        if (path.length === 3) {
            if (!adj[path[2]].includes(path[0])) return;
            const key = [...path].sort((a, b) => a - b).join(",");
            if (!seen.has(key)) { seen.add(key); rings.push([...path]); }
            return;
        }
        for (const w of adj[path[path.length - 1]]) {
            if (path.includes(w)) continue;
            if (path.length === 1 && w < path[0]) continue;   // canonical direction
            dfs([...path, w]);
        }
    };
    for (let i = 0; i < 12; i++) dfs([i]);
    return rings;
}

// honest class enumeration: the FACES are the 3-cycles whose SIDES are the
// STAR edges (side² == 4φ²). The d²=4 class's 20 rings are the convex
// icosa's own faces — printed and discarded (the contrast IS the concept).
const RINGS_RAW: number[][] = [];
{
    const classSet = new Set<number>();
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) classSet.add(Math.round(d2(base[i], base[j]) * 1e9) / 1e9);
    for (const c of classSet) {
        const rings = findRings(c);
        if (!rings.length) continue;
        if (Math.abs(c - EDGE2) < 1e-9) {
            RINGS_RAW.push(...rings);
            console.log(`ring class d²=${c.toPrecision(10)}: ${rings.length} equilateral triangles with STAR sides — THE FACES (2φ chords across the icosa's own faces)`);
        } else {
            console.log(`ring class d²=${c.toPrecision(10)}: ${rings.length} rings, sides NOT the star class (discarded — the convex icosa's own faces, plane depth √(φ+2/3) ≈ 1.512 vs ours 1/(φ√3) ≈ 0.357)`);
        }
    }
}
const RING_SIDE = 2 * PHI;                 // model star-edge length (exact)

// RED control (destructive): with --red, corrupt ring 0's member set BEFORE
// the law checks (a swapped member breaks the 3-cycle's plane depth law).
if (process.argv.includes("--red")) {
    const r0 = RINGS_RAW[0];
    const outside = base.findIndex((_, i) => !r0.includes(i));
    r0[r0.length - 1] = outside;
    console.log("RED MODE: ring 0 corrupted — the law checks below MUST fail");
}

// ---- seat: a POLE vertex down (BEFORE the checks — final coords feed the laws) ----------------------------
let U_IDX = 0, bestY = -Infinity;
base.forEach((v, i) => { if (v[1] > bestY) { bestY = v[1]; U_IDX = i; } });
const lens = (v: V3) => Math.hypot(...v);
const nU: V3 = [base[U_IDX][0] / lens(base[U_IDX]), base[U_IDX][1] / lens(base[U_IDX]), base[U_IDX][2] / lens(base[U_IDX])];
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

// ---- per-face sorted cycles + centers + normals + TRUE outlines (FINAL coords) -----------------------------
// ring → canonical angular order about the outward normal. The outline is
// the plain CONVEX triangle (ring order; consecutive members are star edges).
export const FACES: number[][] = [];
export const CENTERS: V3[] = [];
export const NORMALS: V3[] = [];
export const OUTLINES: V3[][] = [];
{
    for (const ring of RINGS_RAW) {
        const cModel: V3 = [0, 0, 0];
        for (const vi of ring) { cModel[0] += base[vi][0] / 3; cModel[1] += base[vi][1] / 3; cModel[2] += base[vi][2] / 3; }
        const e1: V3 = [base[ring[1]][0] - base[ring[0]][0], base[ring[1]][1] - base[ring[0]][1], base[ring[1]][2] - base[ring[0]][2]];
        const e2: V3 = [base[ring[2]][0] - base[ring[0]][0], base[ring[2]][1] - base[ring[0]][1], base[ring[2]][2] - base[ring[0]][2]];
        let n: V3 = [
            e1[1] * e2[2] - e1[2] * e2[1],
            e1[2] * e2[0] - e1[0] * e2[2],
            e1[0] * e2[1] - e1[1] * e2[0],
        ];
        const nl = Math.hypot(...n);
        n = [n[0] / nl, n[1] / nl, n[2] / nl];
        if (n[0] * cModel[0] + n[1] * cModel[1] + n[2] * cModel[2] < 0) n = [-n[0], -n[1], -n[2]];   // outward
        const c: V3 = (() => { const r = rot(cModel); return [r[0] * SCALE, r[1] * SCALE + LIFT, r[2] * SCALE]; })();
        const nrm: V3 = rot(n);
        const d0: V3 = [V[ring[0]][0] - c[0], V[ring[0]][1] - c[1], V[ring[0]][2] - c[2]];
        const l0 = Math.hypot(...d0);
        const a1: V3 = [d0[0] / l0, d0[1] / l0, d0[2] / l0];
        const a2: V3 = [
            nrm[1] * a1[2] - nrm[2] * a1[1],
            nrm[2] * a1[0] - nrm[0] * a1[2],
            nrm[0] * a1[1] - nrm[1] * a1[0],
        ];
        const polar = (vi: number) => {
            const d: V3 = [V[vi][0] - c[0], V[vi][1] - c[1], V[vi][2] - c[2]];
            return { vi, ang: Math.atan2(d.reduce((s, x, k) => s + x * a2[k], 0), d.reduce((s, x, k) => s + x * a1[k], 0)) };
        };
        const sorted = ring.map(polar).sort((p, q) => p.ang - q.ang).map((p) => p.vi);
        FACES.push(sorted); CENTERS.push(c); NORMALS.push(nrm);
        OUTLINES.push(sorted.map((vi) => V[vi]));   // convex triangle, ring order
    }
}
const F = FACES;

// ---- theorem checks (fail-closed) ---------------------------------------------------------------------------
// T1 Euler + genus
check("T1 Euler 12−30+20 = +2 (GENUS ZERO — the woven sphere)",
    12 - E.length + F.length === 2 && E.length === 30,
    `V 12, E ${E.length}, F ${F.length}, χ ${12 - E.length + F.length}`);

// T2 degree 5 at every vertex (vertex figure {5/2})
{
    const deg = new Array(12).fill(0);
    for (const [i, j] of E) { deg[i]++; deg[j]++; }
    check("T2 every vertex degree 5 (vertex figure {5/2})", deg.every((d) => d === 5),
        `degrees all 5: ${deg.every((d) => d === 5)}`);
}

// T3 faces: equilateral triangles over the STAR class (side 2φ·S; on-plane)
{
    let worstPlane = 0, worstSide = 0;
    for (let u = 0; u < F.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        for (const vi of F[u]) {
            worstPlane = Math.max(worstPlane, Math.abs((V[vi][0] - c[0]) * n[0] + (V[vi][1] - c[1]) * n[1] + (V[vi][2] - c[2]) * n[2]));
        }
        for (let k = 0; k < 3; k++) {
            const p = V[F[u][k]], q = V[F[u][(k + 1) % 3]];
            worstSide = Math.max(worstSide, Math.abs(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) - RING_SIDE * SCALE));
        }
    }
    check("T3 20 equilateral triangles over the STAR class (side 2φ·S; on-plane)",
        F.length === 20 && worstPlane < 1e-9 && worstSide < 1e-9,
        `faces ${F.length}, plane ${worstPlane.toExponential(1)}, side ${worstSide.toExponential(1)} (side ${(RING_SIDE * SCALE).toFixed(9)})`);
}

// T4 manifold: every edge on exactly 2 faces (ring consecutive pairs == E)
{
    const count = new Map<string, number>();
    for (let u = 0; u < F.length; u++) for (let k = 0; k < 3; k++) {
        const a = F[u][k], b = F[u][(k + 1) % 3];
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        count.set(key, (count.get(key) ?? 0) + 1);
    }
    const bad = [...count.values()].filter((c) => c !== 2).length;
    const missing = E.filter(([i, j]) => (count.get(i < j ? `${i}-${j}` : `${j}-${i}`) ?? 0) !== 2).length;
    check("T4 manifold: every edge on exactly 2 faces (ring consecutive pairs == E)", bad === 0 && missing === 0 && count.size === 30,
        `${count.size} face-edges, ${bad} wrong multiplicity, ${missing} of ${E.length} edges unmatched`);
}

// T5 five faces at every vertex
{
    const per = new Array(12).fill(0);
    for (let u = 0; u < F.length; u++) for (const vi of F[u]) per[vi]++;
    check("T5 vertex figure: 5 faces at every vertex", per.every((p) => p === 5), `faces/vertex all 5: ${per.every((p) => p === 5)}`);
}

// T6 golden laws — the great icosa's fingerprint: the face plane cuts at
// EXACTLY 1/(φ√3) (four times deeper than the convex icosa's own faces);
// face circumradius 2φ/√3; R = √(φ+2); h·r_f = 2/3 exactly.
{
    const centerOfSphere: V3 = [0, LIFT, 0];                   // seat origin lifted (rotation about origin, sphere center at 0 pre-lift)
    let worstH = 0;
    for (let u = 0; u < F.length; u++) {
        const c = CENTERS[u], n = NORMALS[u];
        const dist = Math.abs((c[0] - centerOfSphere[0]) * n[0] + (c[1] - centerOfSphere[1]) * n[1] + (c[2] - centerOfSphere[2]) * n[2]);
        worstH = Math.max(worstH, Math.abs(dist / SCALE - 1 / (PHI * Math.sqrt(3))));
    }
    const Rmodel = Math.sqrt((5 + Math.sqrt(5)) / 2);
    const rf = (2 * PHI) / Math.sqrt(3);
    check("T6 golden laws: every face plane at EXACTLY 1/(φ√3); r_f = 2φ/√3; R = √(φ+2); h·r_f = 2/3",
        worstH < 1e-12 && Math.abs(Rmodel - Math.sqrt(PHI + 2)) < 1e-12 && Math.abs((1 / (PHI * Math.sqrt(3))) * rf - 2 / 3) < 1e-12,
        `worst |h − 1/(φ√3)| ${worstH.toExponential(1)}; h ${(1 / (PHI * Math.sqrt(3))).toFixed(12)}; r_f ${rf.toFixed(12)}; h·r_f ${((1 / (PHI * Math.sqrt(3))) * rf).toFixed(12)} == 2/3; icosa class sits at ${Math.sqrt(PHI + 2 - 4 / 3).toFixed(6)} (the discarded 4×-shallower twin)`);
    console.log("INFO T6 regularity: Schläfli {3,5/2}; Kepler, Harmonices Mundi (1619); dual of the great stellated dodecahedron {5/2,3} (standing: struct-261/262) — the quartet's closer");
}

// T7 seat law: pole vertex down
{
    const tipErr = Math.abs(V[tipIdx][1] - PLINTH_H);
    const minAbove = V.every((v) => v[1] >= PLINTH_H - 1e-9);
    const nbrs = adjEdge[tipIdx];
    const nbrY = nbrs.map((i) => V[i][1]);
    const spread = Math.max(...nbrY) - Math.min(...nbrY);
    const az = nbrs.map((i) => Math.atan2(V[i][2], V[i][0])).sort((p, q) => p - q);
    let azMiss = 0;
    for (let k = 0; k < az.length; k++) {
        const d = Math.abs((az[(k + 1) % az.length] - az[k] + Math.PI * 3) % (Math.PI * 2) - Math.PI);
        if (Math.abs(d - (2 * Math.PI / 5)) > 1e-6) azMiss++;
    }
    // antipodal in SEAT (pre-lift) coords — the LIFT translation would
    // contaminate the naive |V[summit]+V[tip]| test (struct-261 self-catch)
    const antiSeat = Math.hypot(seat[summitIdx][0] + seat[tipIdx][0], seat[summitIdx][1] + seat[tipIdx][1], seat[summitIdx][2] + seat[tipIdx][2]);
    // footprint law: star extent + bead radius <= dais apothem at EVERY azimuth
    const Rfs = (RING_SIDE / Math.sqrt(3)) * SCALE;            // face circumradius == the star-ring radius (tip's neighbors)
    const extent = Rfs + BEAD_R;
    const footOk = extent <= PLINTH_APO + 1e-6;
    check("T7 pole-down seat: tip vertex AT dais top, its star-ring horizontal at exact 72°, summit antipodal; footprint law ring+bead ≤ apothem",
        tipErr < 1e-9 && minAbove && spread < 1e-9 && azMiss === 0 && antiSeat < 1e-9 && footOk,
        `tip y ${V[tipIdx][1].toFixed(9)}, min y ${Math.min(...V.map((v) => v[1])).toFixed(6)}, star-ring y ${nbrY[0].toFixed(3)} r ${Rfs.toFixed(3)} (spread ${spread.toExponential(1)}, ${azMiss} azimuth misses), summit ${V[summitIdx][1].toFixed(3)} antipodal-in-seat ${antiSeat.toExponential(1)}; extent ${extent.toFixed(4)} ≤ apothem ${PLINTH_APO}`);
}

// T8 outline laws: on-plane, monotone angular order (simple sails)
{
    let worstPlane = 0, badSign = 0;
    for (let u = 0; u < F.length; u++) {
        const c = CENTERS[u], n = NORMALS[u], ol = OUTLINES[u];
        for (const p of ol) worstPlane = Math.max(worstPlane, Math.abs((p[0] - c[0]) * n[0] + (p[1] - c[1]) * n[1] + (p[2] - c[2]) * n[2]));
        const d0: V3 = [ol[0][0] - c[0], ol[0][1] - c[1], ol[0][2] - c[2]];
        const l0 = Math.hypot(...d0);
        const e1n: V3 = [d0[0] / l0, d0[1] / l0, d0[2] / l0];
        const e2n: V3 = [
            n[1] * e1n[2] - n[2] * e1n[1],
            n[2] * e1n[0] - n[0] * e1n[2],
            n[0] * e1n[1] - n[1] * e1n[0],
        ];
        const xy = ol.map((p) => {
            const d: V3 = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
            return [d.reduce((s, x, k) => s + x * e1n[k], 0), d.reduce((s, x, k) => s + x * e2n[k], 0)] as [number, number];
        });
        const angs = xy.map(([x, y]) => Math.atan2(y, x)).sort((p, q) => p - q);
        // TRIANGLE law: three outline points → all three angular gaps equal
        // 2π/3 exactly (the pentagon's 0.6π gap threshold was the wrong
        // shape for a 3-ring — 60 false violations, probe-measured)
        for (let i = 0; i < angs.length; i++) {
            const gap = (angs[(i + 1) % angs.length] - angs[i] + Math.PI * 2) % (Math.PI * 2);
            if (Math.abs(gap - (Math.PI * 2 / 3)) > 1e-9) badSign++;
        }
    }
    check("T8 outlines: on-plane, monotone angular order (simple sails)", worstPlane < 1e-9 && badSign === 0,
        `worst plane dist ${(worstPlane * 1e3).toFixed(3)} mm; ${badSign} ordering violations`);
}

// T9 immersion: non-adjacent face pairs. Adjacent = share an edge; antipodal
// = opposite faces (parallel planes, never cross). The GENUS-ZERO law: the
// sails pass through one another in the symmetric interweave — constants
// pinned from the measured census (derive-then-pin), symmetry required.
{
    const tris: { f: number; p: V3[] }[] = [];
    for (let u = 0; u < F.length; u++) for (let k = 0; k < 3; k++) {
        tris.push({ f: u, p: [CENTERS[u], OUTLINES[u][k], OUTLINES[u][(k + 1) % 3]] });
    }
    const adjacent = (a: number, b: number): boolean => {
        const fa = F[a], fb = F[b];
        for (let k = 0; k < 3; k++) {
            const p1 = fa[k], q1 = fa[(k + 1) % 3];
            for (let m = 0; m < 3; m++) {
                const p2 = fb[m], q2 = fb[(m + 1) % 3];
                if ((p1 === p2 && q1 === q2) || (p1 === q2 && q1 === p2)) return true;
            }
        }
        return false;
    };
    const antipodal = (a: number, b: number): boolean =>
        NORMALS[a][0] * NORMALS[b][0] + NORMALS[a][1] * NORMALS[b][1] + NORMALS[a][2] * NORMALS[b][2] < -1 + 1e-9;
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
    let adj = 0, nonAdj = 0, anti = 0;
    const perFace = new Map<number, number>();
    for (const key of pairSet) {
        const [a, b] = key.split("-").map(Number);
        if (adjacent(a, b)) adj++;
        else if (antipodal(a, b)) anti++;
        else {
            nonAdj++;
            perFace.set(a, (perFace.get(a) ?? 0) + 1);
            perFace.set(b, (perFace.get(b) ?? 0) + 1);
        }
    }
    const perVals = [...perFace.values()];
    const symmetric = F.length === 0 || (perVals.length === F.length && perVals.every((c) => c === perVals[0]));
    const pinned = EXPECT_CROSS_TOTAL >= 0 && EXPECT_CROSS_PER_FACE >= 0;
    const weaveOk = symmetric && anti === 0 && (!pinned || (nonAdj === EXPECT_CROSS_TOTAL && perVals[0] === EXPECT_CROSS_PER_FACE));
    check(`T9 immersion: the symmetric interweave${pinned ? ` — exactly ${EXPECT_CROSS_TOTAL} non-adjacent crossings, ${EXPECT_CROSS_PER_FACE} per face` : " (CENSUS MODE — constants unpinned, symmetry only)"}; antipodal sails never cross`,
        weaveOk,
        `${pairSet.size} contacting face-pairs = ${adj} adjacent (designed edge meetings) + ${nonAdj} non-adjacent (the woven sails, ${symmetric ? `${perVals[0] ?? 0}-per-face symmetric` : "ASYMMETRIC"}) + ${anti} antipodal (MUST be 0 — parallel planes)`);
}

// (RED corruption is applied at the top, before the law checks — see the ring block.)

// ---- envelope + dais TRUE box ------------------------------------------------------------------------------
// Vertex extents carry BEAD_R (the r0.095 glow beads ride the vertices —
// struct-231 SSD envelope law). Dais: corners ON the axes → TRUE box ±R on
// both x and z (corners at k·18°, N=20 divisible by 4 → axis corners).
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
export const TIP_INDEX = tipIdx, SUMMIT_INDEX = summitIdx, U_INDEX = U_IDX;

console.log(`star edge (model) ${RING_SIDE.toFixed(9)} == 2φ — every edge a diagonal across an icosa face; the icosa's own d=2 class is NOT this skeleton`);
console.log(`seat: tip vertex ${TIP_INDEX} at dais top (single point); star-ring y ${V[adjEdge[TIP_INDEX][0]][1].toFixed(3)} r ${((RING_SIDE / Math.sqrt(3)) * SCALE).toFixed(3)} — the CLIMB; summit ${V[SUMMIT_INDEX][1].toFixed(3)}`);
console.log(`envelope ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).join("x")} min ${ENVELOPE.min.map((n) => n.toFixed(3)).join(",")} max ${ENVELOPE.max.map((n) => n.toFixed(3)).join(",")}`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct265-gicosa)");
