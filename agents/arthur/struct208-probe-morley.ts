// struct208-probe-morley.ts — THE ONE CONTRACT for R11-28 MORLEY'S
// TRISECTOR THEOREM: THE SCALINE TRIANGLE AND THE PERFECT HEART.
//
// FORM SELECTION (fresh grep, all ledgers + census 344): morley/trisector
// 0/0/0 across STRUCTURES-PLAN.md + IMPROVEMENTS.md + IMPROVE-PLAN.md +
// CITY-PLAN-V2.md + artwalk plans; census carries no triangle-cevian form
// (reuleauxrotor = constant-width ROTOR, sierpinski = fractal — different
// register). Morley 1899: in ANY triangle, the three pairs of adjacent
// angle trisectors meet in an EXACT EQUILATERAL — a result Euler's era
// missed. Register: opens the CEVIAN-CONVERGENCE branch — lines from the
// vertices whose crossings carve a perfect form.
//
// THE THEOREMS CARVED (verified in the laws below before any build):
// 1. TRISECTION: at each vertex the two cevian rods divide the interior
//    angle into three EXACT thirds (1e-12).
// 2. THE HEART: the three adjacent-trisector intersections M_A, M_B, M_C
//    form an EXACT equilateral — sides equal 1e-12, angles 60° — and its
//    side equals the closed form 8R·sin(A/3)sin(B/3)sin(C/3) EXACTLY.
// 3. CONVERGENCE: each M is the crossing of exactly its two adjacent
//    trisectors (line distance 1e-9; all other rods clear by >5cm).
// 4. TERMINATIONS: every rod runs vertex → opposite edge, ending ON the
//    edge line inside the segment (the honest trisector chord).
//
// WORLD FRAME: the whole theorem stands in ONE VERTICAL PLANE (local z=0),
// face +Z to the approach — the lane's versiera/elliptic flat-monument
// register. STONE carries the scalene frame (needle-pointed 40°/60°/80°
// gable, voussoir rhythm) seated 8cm into a long curb plinth (cradle
// class, disclosed). IRON carries the six trisector chords. BRASS carries
// the heart — the exact equilateral riding the three crossings. Sole
// night element: one warm bead at the topmost heart corner (s363
// sole-bead law), attached at a real convergence joint.
//
// Exports are consumed by assets/mkv3-morley.ts (the build) and
// struct208-decode-morley.ts (the audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions are FINAL world-local coords.

// ---- constants -----------------------------------------------------------------------------------
export const ANG_A = (40 * Math.PI) / 180;     // apex angle — the needle point
export const ANG_B = (60 * Math.PI) / 180;
export const ANG_C = (80 * Math.PI) / 180;     // A+B+C = 180 exact by construction
export const R = 3;                            // circumradius, metres (math)
export const a = 2 * R * Math.sin(ANG_A);      // side BC (base)   = 3.8567
export const b = 2 * R * Math.sin(ANG_B);      // side CA (right rake)
export const c = 2 * R * Math.sin(ANG_C);      // side AB (left rake)

export const PLINTH_H = 0.26, MARGIN = 0.35, PLINTH_D = 0.90;
export const PLINTH_L = a + 2 * MARGIN;        // the long curb
export const Y0 = PLINTH_H;                    // triangle-line datum = plinth top
export const W = 0.16;                         // voussoir in-plane width
export const D = 0.12;                         // voussoir z-depth
export const GAP = 0.012;                      // voussoir joint
export const ROD_R = 0.035;                    // iron trisector chord radius
export const HEAD_R = ROD_R * 1.5;             // forged vertex head ball radius (mk builds these)
export const HEART_R = 0.05;                   // brass heart tube radius
export const CORNER_R = 0.06;                  // brass heart corner bead radius
export const BEAD_R = 0.07;                    // sole night bead radius
export const SEG_TARGET = 0.32;                // voussoir rhythm target

// ---- triangle (math 2D, base on y=0, x later centered) --------------------------------------------
export const V_B: [number, number] = [0, 0];
export const V_C: [number, number] = [a, 0];
const xA = (c * c - b * b + a * a) / (2 * a);
const hA = Math.sqrt(c * c - xA * xA);
export const V_A: [number, number] = [xA, hA];
export const H_APEX = hA;

const sub = (p: [number, number], q: [number, number]): [number, number] => [p[0] - q[0], p[1] - q[1]];
const norm = (v: [number, number]): [number, number] => { const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; };
const rot = (v: [number, number], ang: number): [number, number] =>
    [v[0] * Math.cos(ang) - v[1] * Math.sin(ang), v[0] * Math.sin(ang) + v[1] * Math.cos(ang)];
const cross2 = (u: [number, number], v: [number, number]) => u[0] * v[1] - u[1] * v[0];

// unit rays vertex->vertex (interior)
const rayAB = norm(sub(V_B, V_A)), rayAC = norm(sub(V_C, V_A));
const rayBA = norm(sub(V_A, V_B)), rayBC = norm(sub(V_C, V_B));
const rayCA = norm(sub(V_A, V_C)), rayCB = norm(sub(V_B, V_C));

// trisector directions. Interior sweep at each vertex: from the FIRST ray
// by +s·θ reaches the second (θ = vertex angle). The two trisectors sit at
// k=1 and k=2 thirds: rot(first, +s·kθ/3). Expressed from the SECOND side
// ray the k=2 rod is rot(second, −s·θ/3) (sweeping BACK into the interior)
// — the naive +s there points OUTSIDE the triangle (probe-RED-caught).
const sgn = (from: [number, number], to: [number, number]) => Math.sign(cross2(from, to)) || 1;
const sA = sgn(rayAB, rayAC);   // interior sweep AB -> AC
const sB = sgn(rayBC, rayBA);   // interior sweep BC -> BA
const sC = sgn(rayCA, rayCB);   // interior sweep CA -> CB

// dir_Ab: A's trisector NEAREST side b (CA) — k=2 from AB == AC swept back A/3
export const dir_Ab = rot(rayAC, -sA * (ANG_A / 3));
// dir_Ac: A's trisector NEAREST side c (AB) — k=1 from AB
export const dir_Ac = rot(rayAB, sA * (ANG_A / 3));
// dir_Ba: B's trisector NEAREST side a (BC) — k=1 from BC
export const dir_Ba = rot(rayBC, sB * (ANG_B / 3));
// dir_Bc: B's trisector NEAREST side c (BA) — k=2 == BA swept back B/3
export const dir_Bc = rot(rayBA, -sB * (ANG_B / 3));
// dir_Ca: C's trisector NEAREST side a (CB) — k=2 == CB swept back C/3
export const dir_Ca = rot(rayCB, -sC * (ANG_C / 3));
// dir_Cb: C's trisector NEAREST side b (CA) — k=1 from CA
export const dir_Cb = rot(rayCA, sC * (ANG_C / 3));

// ---- line intersection (2D) ------------------------------------------------------------------------
function lineX(P: [number, number], d: [number, number], Q: [number, number], e: [number, number]): [number, number] {
    const den = d[0] * e[1] - d[1] * e[0];
    const t = ((Q[0] - P[0]) * e[1] - (Q[1] - P[1]) * e[0]) / den;
    return [P[0] + t * d[0], P[1] + t * d[1]];
}
const distToLine = (P: [number, number], A: [number, number], d: [number, number]) =>
    Math.abs(cross2(norm(d), sub(P, A)));

// the three Morley vertices (adjacent-trisector intersections)
export const M_A = lineX(V_B, dir_Ba, V_C, dir_Ca);   // near side a (base)
export const M_B = lineX(V_C, dir_Cb, V_A, dir_Ab);   // near side b (right rake)
export const M_C = lineX(V_A, dir_Ac, V_B, dir_Bc);   // near side c (left rake)
export const MORLEY = [M_A, M_B, M_C] as [number, number][];

// closed form (Connes' proof's constant): heart side = 8R·sin(A/3)sin(B/3)sin(C/3)
export const HEART_SIDE_CLOSED = 8 * R * Math.sin(ANG_A / 3) * Math.sin(ANG_B / 3) * Math.sin(ANG_C / 3);

// ---- rods: vertex -> opposite-edge intersection ----------------------------------------------------
export interface Rod { name: string; from: "A" | "B" | "C"; P0: [number, number]; P1: [number, number]; dir: [number, number] }
function edgeEnd(V: [number, number], d: [number, number], E0: [number, number], E1: [number, number]): [number, number] {
    return lineX(V, d, E0, norm(sub(E1, E0)));
}
export const RODS: Rod[] = [
    { name: "Ab", from: "A", P0: V_A, dir: dir_Ab, P1: edgeEnd(V_A, dir_Ab, V_B, V_C) },
    { name: "Ac", from: "A", P0: V_A, dir: dir_Ac, P1: edgeEnd(V_A, dir_Ac, V_B, V_C) },
    { name: "Ba", from: "B", P0: V_B, dir: dir_Ba, P1: edgeEnd(V_B, dir_Ba, V_C, V_A) },
    { name: "Bc", from: "B", P0: V_B, dir: dir_Bc, P1: edgeEnd(V_B, dir_Bc, V_C, V_A) },
    { name: "Ca", from: "C", P0: V_C, dir: dir_Ca, P1: edgeEnd(V_C, dir_Ca, V_A, V_B) },
    { name: "Cb", from: "C", P0: V_C, dir: dir_Cb, P1: edgeEnd(V_C, dir_Cb, V_A, V_B) },
];

// ---- world frame (root identity): x centered on base, y lifted to plinth top, z = 0 ----------------
export const worldPt = (m: [number, number]): [number, number, number] => [m[0] - a / 2, m[1] + Y0, 0];
export const A_W = worldPt(V_A), B_W = worldPt(V_B), C_W = worldPt(V_C);
export const M_W = MORLEY.map(worldPt) as [number, number, number][];
export const RODS_W = RODS.map((r) => ({
    name: r.name, from: r.from,
    P0: worldPt(r.P0), P1: worldPt(r.P1),
}));

// topmost heart corner carries the sole night bead
export const BEAD_IDX = M_W.reduce((best, p, i) => (p[1] > M_W[best][1] ? i : best), 0);
export const BEAD_AT_W = M_W[BEAD_IDX];

// ---- voussoir table ---------------------------------------------------------------------------------
export interface Edge { name: string; P: [number, number]; Q: [number, number]; n: number; segLen: number }
export const EDGES: Edge[] = [
    { name: "base", P: V_B, Q: V_C, n: Math.max(3, Math.round(a / SEG_TARGET)), segLen: 0 },
    { name: "left", P: V_B, Q: V_A, n: Math.max(3, Math.round(c / SEG_TARGET)), segLen: 0 },
    { name: "right", P: V_C, Q: V_A, n: Math.max(3, Math.round(b / SEG_TARGET)), segLen: 0 },
];
for (const e of EDGES) {
    const L = Math.hypot(e.Q[0] - e.P[0], e.Q[1] - e.P[1]);
    e.segLen = (L - (e.n - 1) * GAP) / e.n;
}
export interface Seg { edge: string; mid: [number, number]; ang: number; len: number }
export const SEGS: Seg[] = [];
for (const e of EDGES) {
    const d = norm(sub(e.Q, e.P));
    const ang = Math.atan2(d[1], d[0]);
    for (let i = 0; i < e.n; i++) {
        const s0 = i * (e.segLen + GAP), sMid = s0 + e.segLen / 2;
        SEGS.push({ edge: e.name, mid: [e.P[0] + d[0] * sMid, e.P[1] + d[1] * sMid], ang, len: e.segLen });
    }
}
export const SEGS_W = SEGS.map((s) => ({ ...s, mid: worldPt(s.mid) }));

// ---- envelope (analytic AABB of plinth + voussoir corners + iron vertex/end balls) ------------------
let _mnx = -PLINTH_L / 2, _mxx = PLINTH_L / 2, _mxy = Y0 + hA, _mnz = -PLINTH_D / 2, _mxz = PLINTH_D / 2;
for (const s of SEGS) {
    const d: [number, number] = [Math.cos(s.ang), Math.sin(s.ang)];
    const p: [number, number] = [-d[1], d[0]];   // in-plane perpendicular
    for (const [tm, tp] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
        const x = s.mid[0] + tm * (s.len / 2) * d[0] + tp * (W / 2) * p[0];
        const y = s.mid[1] + tm * (s.len / 2) * d[1] + tp * (W / 2) * p[1];
        _mnx = Math.min(_mnx, x - a / 2); _mxx = Math.max(_mxx, x - a / 2);
        _mxy = Math.max(_mxy, y + Y0);
    }
}
for (const P of [V_A, V_B, V_C]) {           // forged vertex heads (r = HEAD_R — mk-built)
    _mnx = Math.min(_mnx, P[0] - HEAD_R - a / 2); _mxx = Math.max(_mxx, P[0] + HEAD_R - a / 2);
    _mxy = Math.max(_mxy, P[1] + HEAD_R + Y0);
}
for (const r of RODS) {                        // rod end caps (r = ROD_R)
    _mnx = Math.min(_mnx, r.P1[0] - ROD_R - a / 2); _mxx = Math.max(_mxx, r.P1[0] + ROD_R - a / 2);
    _mxy = Math.max(_mxy, r.P1[1] + ROD_R + Y0);
}
export const ENVELOPE = { min: [_mnx, 0, _mnz] as [number, number, number], max: [_mxx, _mxy, _mxz] as [number, number, number] };

// ---- THE LAWS (run when executed directly) -----------------------------------------------------------
if (import.meta.main) {
    const fails: string[] = [];
    const check = (name: string, ok: boolean, detail = "") => {
        console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) fails.push(name);
    };
    const angBetween = (u: [number, number], v: [number, number]) =>
        Math.atan2(Math.abs(cross2(u, v)), u[0] * v[0] + u[1] * v[1]);

    // L1 TRISECTION EXACT — three equal sub-angles at every vertex
    {
        let worst = 0;
        const cases: [string, [number, number], [number, number], [number, number], [number, number]][] = [
            ["A", rayAB, dir_Ac, dir_Ab, rayAC],
            ["B", rayBC, dir_Ba, dir_Bc, rayBA],
            ["C", rayCA, dir_Cb, dir_Ca, rayCB],
        ];
        for (const [nm, s1, r1, r2, s2] of cases) {
            const t1 = angBetween(s1, r1), t2 = angBetween(r1, r2), t3 = angBetween(r2, s2);
            worst = Math.max(worst, Math.abs(t1 - t2), Math.abs(t2 - t3), Math.abs(t1 - t3));
        }
        check("L1 trisection-exact", worst < 1e-12,
            `worst sub-angle delta ${worst.toExponential(2)} rad over all 3 vertices — the six rods are exact trisectors`);
    }

    // L2 THE HEART — exact equilateral + closed form
    {
        const sAB = Math.hypot(M_A[0] - M_B[0], M_A[1] - M_B[1]);
        const sBC = Math.hypot(M_B[0] - M_C[0], M_B[1] - M_C[1]);
        const sCA = Math.hypot(M_C[0] - M_A[0], M_C[1] - M_A[1]);
        const spread = Math.max(sAB, sBC, sCA) - Math.min(sAB, sBC, sCA);
        const angAt = (P: [number, number], Q: [number, number], R: [number, number]) =>
            angBetween(sub(Q, P), sub(R, P));
        const aA = angAt(M_A, M_B, M_C), aB = angAt(M_B, M_C, M_A), aC = angAt(M_C, M_A, M_B);
        const aSpread = Math.max(aA, aB, aC) - Math.min(aA, aB, aC);
        const mean = (sAB + sBC + sCA) / 3;
        const rel = Math.abs(mean - HEART_SIDE_CLOSED) / HEART_SIDE_CLOSED;
        check("L2 the-heart-equilateral", spread < 1e-12 && aSpread < 1e-12 && rel < 1e-12,
            `sides ${sAB.toFixed(12)}/${sBC.toFixed(12)}/${sCA.toFixed(12)} spread ${spread.toExponential(2)}; angles 60° spread ${aSpread.toExponential(2)}; side ${mean.toFixed(12)} == closed form 8R·sin(A/3)sin(B/3)sin(C/3) ${HEART_SIDE_CLOSED.toFixed(12)} rel ${rel.toExponential(2)} — Morley 1899 machine-exact`);
    }

    // L3 CONVERGENCE — each M is exactly its two adjacent rods' crossing; others clear
    {
        const rodsOf: Record<string, string[]> = { A: ["Ba", "Ca"], B: ["Cb", "Ab"], C: ["Ac", "Bc"] };
        let own = Infinity, foreign = Infinity;
        for (const [mName, pair] of Object.entries(rodsOf)) {
            const M = MORLEY[["A", "B", "C"].indexOf(mName)];
            for (const r of RODS) {
                const dd = distToLine(M, r.P0, r.dir);
                if (pair.includes(r.name)) own = Math.min(own, dd);
                else foreign = Math.min(foreign, dd);
            }
        }
        check("L3 convergence", own < 1e-9 && foreign > 0.05,
            `each heart corner on its two adjacent rod LINES ${own.toExponential(2)}; all other rods clear by ${foreign.toFixed(4)} m — the crossing is unambiguous`);
    }

    // L4 TERMINATIONS + RHYTHM — rods end on the opposite edges; voussoirs uniform
    {
        let worstEnd = 0, sMin = 1, sMax = 0;
        const oppEdge = (from: string): [[number, number], [number, number]] =>
            from === "A" ? [V_B, V_C] : from === "B" ? [V_C, V_A] : [V_A, V_B];
        for (const r of RODS) {
            const [E0, E1] = oppEdge(r.from);
            const e = norm(sub(E1, E0));
            const off = distToLine(r.P1, E0, e);
            worstEnd = Math.max(worstEnd, off);
            const t = (r.P1[0] - E0[0]) * e[0] + (r.P1[1] - E0[1]) * e[1];
            const L = Math.hypot(E1[0] - E0[0], E1[1] - E0[1]);
            sMin = Math.min(sMin, t); sMax = Math.max(sMax, L - t);
            const home = Math.hypot(r.P0[0] - (r.from === "A" ? V_A[0] : r.from === "B" ? V_B[0] : V_C[0]),
                r.P0[1] - (r.from === "A" ? V_A[1] : r.from === "B" ? V_B[1] : V_C[1]));
            worstEnd = Math.max(worstEnd, home);
        }
        let rhythmOK = true, firstJoint = Infinity;
        for (const e of EDGES) {
            const L = Math.hypot(e.Q[0] - e.P[0], e.Q[1] - e.P[1]);
            if (Math.abs(e.n * e.segLen + (e.n - 1) * GAP - L) > 1e-9) rhythmOK = false;
            firstJoint = Math.min(firstJoint, e.segLen);
        }
        check("L4 terminations-rhythm", worstEnd < 1e-9 && sMin > 0.02 && sMax > 0.02 && rhythmOK && firstJoint > 0.05,
            `all 6 rod ends ON their opposite edge lines ${worstEnd.toExponential(2)}, landing ≥${sMin.toFixed(3)} m inside the segment; voussoir tables exact (first joint ${firstJoint.toFixed(3)} m off each vertex)`);
    }

    // L5 THE HEART ROD — brass segments connect the M's exactly
    {
        const dAB = Math.hypot(M_A[0] - M_B[0], M_A[1] - M_B[1]);
        const dBC = Math.hypot(M_B[0] - M_C[0], M_B[1] - M_C[1]);
        const dCA = Math.hypot(M_C[0] - M_A[0], M_C[1] - M_A[1]);
        check("L5 heart-rod", Math.abs(dAB - HEART_SIDE_CLOSED) < 1e-9 && Math.abs(dBC - HEART_SIDE_CLOSED) < 1e-9 && Math.abs(dCA - HEART_SIDE_CLOSED) < 1e-9,
            `three brass segments ${dAB.toFixed(6)} m == the Morley side; corners at the crossings`);
    }

    // L6 SEATING + GRADING — base course 8cm into the curb; nothing dips below embed class
    {
        const baseBottom = Y0 - W / 2;                       // base voussoir course underside
        let minIron = Infinity, minBrass = Infinity;
        for (const r of RODS) { minIron = Math.min(minIron, r.P0[1] + Y0 - ROD_R, r.P1[1] + Y0 - ROD_R); }
        for (const M of MORLEY) minBrass = Math.min(minBrass, M[1] + Y0 - CORNER_R);
        const beadOK = Math.hypot(BEAD_AT_W[0] - M_W[BEAD_IDX][0], BEAD_AT_W[1] - M_W[BEAD_IDX][1]) < 1e-12;
        check("L6 seating-grading", Math.abs(baseBottom - (PLINTH_H - 0.08)) < 1e-9 && minIron >= Y0 - 0.08 && minBrass >= Y0 - 0.08 && beadOK,
            `base course underside ${baseBottom.toFixed(3)} m = plinth top − 8cm (cradle embed, disclosed); lowest iron ${minIron.toFixed(3)} / brass ${minBrass.toFixed(3)} ≥ plinth top − 8cm (socket class); bead attached at heart corner ${BEAD_IDX === 0 ? "M_A" : BEAD_IDX === 1 ? "M_B" : "M_C"}`);
    }

    // L7 ENVELOPE + FOLLY CLASS
    {
        const height = ENVELOPE.max[1];
        const footprint = PLINTH_L * PLINTH_D;
        check("L7 envelope-folly", height >= 2.2 && footprint < 16,
            `envelope ${(ENVELOPE.max[0] - ENVELOPE.min[0]).toFixed(3)}x${height.toFixed(3)}x${(ENVELOPE.max[2] - ENVELOPE.min[2]).toFixed(3)}; curb footprint ${footprint.toFixed(2)} m² < 16 — FOLLY CLASS, no walk owed`);
    }

    // RED CONTROL — one trisector rotated 0.02 rad: the equilateral law must DETECT
    {
        const dBad = rot(rayAC, sA * (ANG_A / 3 + 0.02));
        const M_A2 = lineX(V_B, dir_Ba, V_C, dir_Ca);
        const M_B2 = lineX(V_C, dir_Cb, V_A, dBad);
        const M_C2 = lineX(V_A, dir_Ac, V_B, dir_Bc);
        const s1 = Math.hypot(M_A2[0] - M_B2[0], M_A2[1] - M_B2[1]);
        const s2 = Math.hypot(M_B2[0] - M_C2[0], M_B2[1] - M_C2[1]);
        const s3 = Math.hypot(M_C2[0] - M_A2[0], M_C2[1] - M_A2[1]);
        const spread = Math.max(s1, s2, s3) - Math.min(s1, s2, s3);
        check("RED mutant-trisector-detects", spread > 1e-6,
            `0.02 rad off one trisector: heart sides ${s1.toFixed(6)}/${s2.toFixed(6)}/${s3.toFixed(6)} spread ${spread.toFixed(6)} — equilateral law FAILS against the mutant, as it must`);
    }

    if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
    console.log("ALL PASS");
}
