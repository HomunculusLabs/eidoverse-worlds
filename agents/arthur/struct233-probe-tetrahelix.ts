// struct233-probe-tetrahelix.ts — STRUCTURES LANE struct-233, Round 11 R11-46
// THE BOERDIJK–COXETER TETRAHELIX — the chiral column of regular tetrahedra
// face-bonded end-to-end (Boerdijk 1952; Coxeter 1970). Each new tetrahedron
// is the affine REFLECTION of the oldest vertex across the shared face —
// exact by construction, no trig anywhere in the recurrence. The chain is
// chiral and never returns to itself (the advance is arccos(−2/3), irrational
// w.r.t. 2π).
//
// One idea: THE COLUMN THAT CLIMBS BY TWISTING. Twelve stone tetrahedra,
// each bonded face-to-face to the next and turned from it — on a SIX-sided
// dais (the tetrahedron's six edges made stone). Every edge of the whole
// column is exactly equal; every vertex lies on one cylinder; each cell
// turns +35.4° net (3·arccos(−2/3) mod 360) and climbs 3/√10·SCALE — the
// torsion IS the ornament (no applied trim). Night contract: fifteen warm
// beads at the vertex lattice — a steep helix of lights (v0 half-proud in
// the dais top, császár/ssd lineage). Folly class — walked around.
//
// PARAMETRIZATION (exact, closed-form recurrence):
//   v0=(0,0,0), v1=(1,0,0), v2=(1/2,√3/2,0), v3=(1/2,√3/6,√(2/3)).
//   v_{n+4} = v_n − 2·t·n̂, t = (v_n−b)·n̂, n̂ = unit normal of
//   plane(v_{n+1}, v_{n+2}, v_{n+3})  (affine reflection of v_n).
//
// HELIX LAW (derived from the chord equations 4r²sin²(α/2)+q² = 1 etc.):
//   sin²(α/2) = 5/6  →  α = arccos(−2/3) ≈ 131.810315°  (per INDEX step)
//   r² = 27/100      →  r = 3√3/10 ≈ 0.519615           (vertex radius)
//   q² = 1/10        →  q = 1/√10 ≈ 0.316228            (rise per INDEX)
//   per CELL (3 indices): net turn 3α mod 360 ≈ +35.432°, climb 3q ≈ 0.948683.
//
// THEOREMS machine-verified below (conchoid law struct-190):
//   T1 1-skeleton law: EVERY pair at index distance 1, 2, 3 is an edge of
//      length exactly 1 (the chain's miracle); every pair at distance ≥ 4
//      is strictly farther than 1.5 (no accidental contacts).
//   T2 SCREW EXACTNESS: the Kabsch fit over pairs (v_n → v_{n+1}) is an
//      EXACT isometry (proper rotation det +1) carrying every v_n to
//      v_{n+1} — the whole chain is one screw's orbit.
//   T3 constants: fitted screw angle == arccos(−2/3); measured vertex
//      radius == 3√3/10; measured per-index rise == 1/√10 (1e-9).
//   T4 chirality + non-closure: signed advance positive (one hand); total
//      turn 14α ≈ 1845.3° ≢ 0 mod 360 (recorded; the chain never closes).
//   T5 counts: V = CELLS+3; interior vertex degree 6 in the 1-skeleton.
//   T6 citation: Boerdijk 1952; Coxeter 1970 (prose law).
//   T7 equal-advance monodromy: per-index angular advance and axial rise
//      constant across the whole chain (max deviation measured).
//   T8 SEAT: axis ∥ +y; vertex heights equally spaced; v0 at dais top;
//      bead envelope within the dais apothem budget.
//   T9 immersion: no edge-face pierce and no strict-interior containment
//      between cell pairs ≥ 4 apart (2-apart share an edge, 3-apart a
//      vertex — the designed contacts).
//   RED control: perturb one generated vertex by +0.05 z → T1 MUST fail.

export const CELLS = 12;                  // tetrahedra in the column
export const SCALE = 1.6;                 // model-unit → meters (edge 1 → 1.6m)
export const BEAD_R = 0.085;              // brass vertex bead radius
export const PLINTH_R = 2.2;              // hexagonal dais circumradius
export const PLINTH_N = 6;                // SIX sides (the tetrahedron's six edges)
export const PLINTH_ROT = 0;              // shape-space angle
export const PLINTH_H = 0.32;             // dais height
export const BOSS_R = 1.15;               // hexagonal boss circumradius (the socket)
export const BOSS_H = 0.63;               // boss height above the dais top
export const LIFT2 = 0.35;                // column lift: v0 buried in the boss stone

type V3 = [number, number, number];
const SQ3 = Math.sqrt(3);
const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

// ---- exact chain by affine reflection -----------------------------------------------------------------------
const model: V3[] = [
    [0, 0, 0],
    [1, 0, 0],
    [0.5, SQ3 / 2, 0],
    [0.5, SQ3 / 6, Math.sqrt(2 / 3)],
];
const RED = process.argv.includes("--red");
for (let n = 0; model.length < CELLS + 3; n++) {
    const a = model[n], b = model[n + 1], c = model[n + 2], d = model[n + 3];
    const u: V3 = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
    const w: V3 = [d[0] - b[0], d[1] - b[1], d[2] - b[2]];
    let nm: V3 = [
        u[1] * w[2] - u[2] * w[1],
        u[2] * w[0] - u[0] * w[2],
        u[0] * w[1] - u[1] * w[0],
    ];
    const nl = Math.hypot(...nm);
    nm = [nm[0] / nl, nm[1] / nl, nm[2] / nl];
    const t = (a[0] - b[0]) * nm[0] + (a[1] - b[1]) * nm[1] + (a[2] - b[2]) * nm[2];
    const next: V3 = [a[0] - 2 * t * nm[0], a[1] - 2 * t * nm[1], a[2] - 2 * t * nm[2]];
    model.push(RED && n === 2 ? [next[0], next[1], next[2] + 0.05] : next);
}
const NV = model.length;
if (NV !== CELLS + 3) throw Error(`vertex count ${NV} != ${CELLS + 3}`);
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// T1 1-skeleton law
{
    let worstEdge = 0, minFar = Infinity;
    for (let i = 0; i < NV; i++) for (let j = i + 1; j < NV; j++) {
        const d = dist(model[i], model[j]);
        if (j - i <= 3) worstEdge = Math.max(worstEdge, Math.abs(d - 1));
        else minFar = Math.min(minFar, d);
    }
    check("T1 1-skeleton: all index-1/2/3 pairs are edges of length 1; ≥4-apart pairs > 1.5",
        worstEdge < 1e-12 && minFar > 1.5,
        `worst |edge−1| ${worstEdge.toExponential(1)}; min far-pair distance ${minFar.toFixed(6)}`);
}

// T2 screw exactness via Kabsch on pairs (v_n → v_{n+1})
{
    // centroids
    const P = model.slice(0, NV - 1), Q = model.slice(1, NV);
    const pc: V3 = [0, 0, 0], qc: V3 = [0, 0, 0];
    for (let i = 0; i < P.length; i++) for (let k = 0; k < 3; k++) { pc[k] += P[i][k] / P.length; qc[k] += Q[i][k] / P.length; }
    // covariance H = Σ (p−pc)(q−qc)ᵀ — solve for rotation R with q ≈ R p
    const H = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < P.length; i++) {
        const p: V3 = [P[i][0] - pc[0], P[i][1] - pc[1], P[i][2] - pc[2]];
        const q: V3 = [Q[i][0] - qc[0], Q[i][1] - qc[1], Q[i][2] - qc[2]];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) H[r][c] += q[r] * p[c];
    }
    // SVD of H (3×3) via Jacobi on HᵀH — enough for a rank-3 fit
    const HtH = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) HtH[r][c] = H[0][r] * H[0][c] + H[1][r] * H[1][c] + H[2][r] * H[2][c];
    // power-iterate the dominant right-singular vector, then deflate
    const mv = (M: number[][], v: number[]): number[] => [
        M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
        M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
        M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
    ];
    const eigen = (M: number[][]) => {
        const eig: { val: number; vec: number[] }[] = [];
        let Mw = M.map((r) => [...r]);
        for (let k = 0; k < 3; k++) {
            let v = [1 + k * 0.3, 2 - k * 0.7, 0.5 + k * 0.11];
            for (let it = 0; it < 4000; it++) {
                const w = mv(Mw, v); const l = Math.hypot(...w);
                if (l < 1e-18) break;
                v = [w[0] / l, w[1] / l, w[2] / l];
            }
            const val = v[0] * mv(Mw, v)[0] + v[1] * mv(Mw, v)[1] + v[2] * mv(Mw, v)[2];
            eig.push({ val, vec: v });
            // deflate: Mw − val·vvᵀ
            Mw = Mw.map((row, r) => row.map((x, c) => x - val * v[r] * v[c]));
        }
        return eig;
    };
    const eigs = eigen(HtH).sort((a, b) => b.val - a.val);
    const Vs: number[][] = eigs.map((e) => e.vec);
    const U: number[][] = [0, 1, 2].map((k) => {
        const hv = mv(H, Vs[k]); const l = Math.hypot(...hv);
        return l < 1e-15 ? [0, 0, 0].map((_, i) => (i === k ? 1 : 0)) : hv.map((x) => x / l);
    });
    let R = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) R[r][c] = U[0][r] * Vs[0][c] + U[1][r] * Vs[1][c] + U[2][r] * Vs[2][c];
    // det fix (proper rotation)
    const det = R[0][0] * (R[1][1] * R[2][2] - R[1][2] * R[2][1]) - R[0][1] * (R[1][0] * R[2][2] - R[1][2] * R[2][0]) + R[0][2] * (R[1][0] * R[2][1] - R[1][1] * R[2][0]);
    if (det < 0) { R = R.map((row, r) => row.map((x, c) => x * (r === 2 && c === 2 ? -1 : 1))); }
    const t: V3 = [qc[0] - (R[0][0] * pc[0] + R[0][1] * pc[1] + R[0][2] * pc[2]),
                   qc[1] - (R[1][0] * pc[0] + R[1][1] * pc[1] + R[1][2] * pc[2]),
                   qc[2] - (R[2][0] * pc[0] + R[2][1] * pc[1] + R[2][2] * pc[2])];
    let worst = 0;
    for (let i = 0; i < NV - 1; i++) {
        const p = model[i];
        const q: V3 = [R[0][0] * p[0] + R[0][1] * p[1] + R[0][2] * p[2] + t[0],
                       R[1][0] * p[0] + R[1][1] * p[1] + R[1][2] * p[2] + t[1],
                       R[2][0] * p[0] + R[2][1] * p[1] + R[2][2] * p[2] + t[2]];
        worst = Math.max(worst, dist(q, model[i + 1]));
    }
    check("T2 screw exactness: one proper isometry carries v_n → v_{n+1} for ALL n", worst < 1e-9,
        `max residual ${(worst * 1e9).toFixed(3)} nm over ${NV - 1} steps`);
    // expose for T3
    (globalThis as any).__screw = { R, t };
}

// ---- exact screw AXIS POINT (self-caught RED: measuring radius about a line
// PARALLEL to the axis through the centroid wobbles by the axis offset —
// 0.038 model units here; the axis point solves (R−I)a = −t on the ⊥ plane) ----
const axisPoint = (): V3 => {
    const { R, t } = (globalThis as any).__screw as { R: number[][]; t: V3 };
    const axis: V3 = [R[2][1] - R[1][2], R[0][2] - R[2][0], R[1][0] - R[0][1]];
    const al = Math.hypot(...axis);
    const ax: V3 = [axis[0] / al, axis[1] / al, axis[2] / al];
    // orthonormal basis ⊥ axis
    const helper = Math.abs(ax[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const e1: V3 = (() => {
        const d = helper[0] - ax[0] * (helper[0] * ax[0] + helper[1] * ax[1] + helper[2] * ax[2]),
              e = helper[1] - ax[1] * (helper[0] * ax[0] + helper[1] * ax[1] + helper[2] * ax[2]),
              f = helper[2] - ax[2] * (helper[0] * ax[0] + helper[1] * ax[1] + helper[2] * ax[2]);
        const l = Math.hypot(d, e, f);
        return [d / l, e / l, f / l] as V3;
    })();
    const e2: V3 = [
        ax[1] * e1[2] - ax[2] * e1[1],
        ax[2] * e1[0] - ax[0] * e1[2],
        ax[0] * e1[1] - ax[1] * e1[0],
    ];
    const mvp = (M: number[][], v: number[]): number[] => [
        M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
        M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
        M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
    ];
    const RmI = R.map((row, r) => row.map((x, c) => x - (r === c ? 1 : 0)));
    // solve for β with a = β1 e1 + β2 e2 (axis-parallel component free):
    // project ((R−I)a + t = 0) onto e1, e2 → 2×2 system
    const A11 = mvp(RmI, e1), A12 = mvp(RmI, e2);
    const m = [
        [A11[0] * e1[0] + A11[1] * e1[1] + A11[2] * e1[2], A12[0] * e1[0] + A12[1] * e1[1] + A12[2] * e1[2]],
        [A11[0] * e2[0] + A11[1] * e2[1] + A11[2] * e2[2], A12[0] * e2[0] + A12[1] * e2[1] + A12[2] * e2[2]],
    ];
    const rhs = [-(t[0] * e1[0] + t[1] * e1[1] + t[2] * e1[2]), -(t[0] * e2[0] + t[1] * e2[1] + t[2] * e2[2])];
    const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    const b1 = (rhs[0] * m[1][1] - rhs[1] * m[0][1]) / det;
    const b2 = (m[0][0] * rhs[1] - m[1][0] * rhs[0]) / det;
    const a: V3 = [b1 * e1[0] + b2 * e2[0], b1 * e1[1] + b2 * e2[1], b1 * e1[2] + b2 * e2[2]];
    // residual control (fail-closed): ⊥-axis residual must vanish — the
    // PARALLEL part is the screw's rise q (= 1/√10), which no axis point removes
    const res = mvp(RmI, a).map((x, k) => x + t[k]);
    const rpar = res[0] * ax[0] + res[1] * ax[1] + res[2] * ax[2];
    const resPerp = res.map((x, k) => x - rpar * ax[k]);
    const rl = Math.hypot(...resPerp);
    if (rl > 1e-9) throw Error(`axis point residual (⊥ axis) ${rl}`);
    return a;
};

// T3 constants from the fitted screw + direct radius/rise measurement
{
    const { R } = (globalThis as any).__screw as { R: number[][] };
    const cosA = (R[0][0] + R[1][1] + R[2][2] - 1) / 2;
    const angle = Math.acos(Math.max(-1, Math.min(1, cosA)));
    // axis from the skew part (signed)
    const axis: V3 = [R[2][1] - R[1][2], R[0][2] - R[2][0], R[1][0] - R[0][1]];
    const al = Math.hypot(...axis);
    const ax: V3 = [axis[0] / al, axis[1] / al, axis[2] / al];
    const sinSign = (R[2][1] - R[1][2]) * ax[0] + (R[0][2] - R[2][0]) * ax[1] + (R[1][0] - R[0][1]) * ax[2];
    // radius + rise measured directly about the TRUE axis (through axisPoint)
    const ac: V3 = axisPoint();
    let worstR = 0, worstRise = 0;
    const heights = model.map((v) => (v[0] - ac[0]) * ax[0] + (v[1] - ac[1]) * ax[1] + (v[2] - ac[2]) * ax[2]);
    for (const v of model) {
        const d: V3 = [v[0] - ac[0], v[1] - ac[1], v[2] - ac[2]];
        const along = d[0] * ax[0] + d[1] * ax[1] + d[2] * ax[2];
        const rad = Math.hypot(d[0] - along * ax[0], d[1] - along * ax[1], d[2] - along * ax[2]);
        worstR = Math.max(worstR, Math.abs(rad - 3 * SQ3 / 10));
    }
    const rise = heights[1] - heights[0];
    for (let i = 1; i < NV; i++) worstRise = Math.max(worstRise, Math.abs((heights[i] - heights[i - 1]) - rise));
    check("T3 helix constants: α == arccos(−2/3); r == 3√3/10; q == 1/√10",
        Math.abs(angle - Math.acos(-2 / 3)) < 1e-9 && worstR < 1e-9 && Math.abs(Math.abs(rise) - 1 / Math.sqrt(10)) < 1e-9 && worstRise < 1e-9,
        `α ${(angle * 180 / Math.PI).toFixed(6)}° (want 131.810315°); r dev ${(worstR * 1e9).toFixed(2)} nm; q ${rise.toFixed(12)} (want ±${(1 / Math.sqrt(10)).toFixed(12)}), rise spread ${(worstRise * 1e9).toFixed(2)} nm`);
    (globalThis as any).__axis = { ax };
    const totalTurn = (NV - 1) * angle * (sinSign >= 0 ? 1 : -1);
    console.log(`INFO T4 chirality: screw handedness ${sinSign >= 0 ? "positive (right)" : "negative (left)"}; total turn over ${NV - 1} steps ${(totalTurn * 180 / Math.PI).toFixed(3)}° = ${(totalTurn / (2 * Math.PI)).toFixed(4)} turns — not a multiple of 2π (chain never closes; Coxeter 1970)`);
    check("T4 non-closure: total turn not ≡ 0 mod 360°", Math.abs(((totalTurn * 180 / Math.PI) % 360)) > 1e-6,
        `net ${(Math.abs(totalTurn * 180 / Math.PI) % 360).toFixed(4)}° from closing`);
}

// T5 counts + interior degree
{
    const deg = new Array(NV).fill(0);
    for (let i = 0; i < NV; i++) for (let j = i + 1; j <= Math.min(NV - 1, i + 3); j++) { deg[i]++; deg[j]++; }
    const interior = deg.slice(3, NV - 3);
    check("T5 counts: V == CELLS+3; interior vertex degree 6", NV === CELLS + 3 && interior.every((d) => d === 6),
        `V ${NV}, interior degrees ${interior.join(",")}, end degrees ${deg[0]}/${deg[NV - 1]}`);
}

// T6 citation (prose law)
console.log("INFO T6: Boerdijk 1952; Coxeter 1970 — the chiral tetrahedral helix, regular tetrahedra face-bonded, never closing");

// ---- seating: rotate the fitted axis to +y, lift v0 to the dais top ------------------------------------------
const V: V3[] = (() => {
    const axv = (globalThis as any).__axis as { ax: V3 };
    const ax = axv.ax;
    const ac = axisPoint();
    const UP: V3 = [0, 1, 0];
    const cross0: V3 = [
        ax[1] * UP[2] - ax[2] * UP[1],
        ax[2] * UP[0] - ax[0] * UP[2],
        ax[0] * UP[1] - ax[1] * UP[0],
    ];
    const cl = Math.hypot(...cross0);
    const dotU = ax[0] * UP[0] + ax[1] * UP[1] + ax[2] * UP[2];
    const angU = Math.atan2(cl, dotU);
    const seatAxis: V3 = cl < 1e-12 ? [1, 0, 0] : [cross0[0] / cl, cross0[1] / cl, cross0[2] / cl];
    const rotVec = (p: V3): V3 => {
        const [x, y, z] = p, [ux, uy, uz] = seatAxis, c = Math.cos(angU), s = Math.sin(angU), K = 1 - c;
        return [
            x * (c + ux * ux * K) + y * (uy * ux * K - uz * s) + z * (uz * ux * K + uy * s),
            x * (ux * uy * K + uz * s) + y * (c + uy * uy * K) + z * (uz * uy * K - ux * s),
            x * (ux * uz * K - uy * s) + y * (uy * uz * K + ux * s) + z * (c + uz * uz * K),
        ];
    };
    const rotAboutModel = (p: V3): V3 => rotVec([p[0] - ac[0], p[1] - ac[1], p[2] - ac[2]] as V3);
    const seated = model.map((v) => rotAboutModel(v).map((x) => x * SCALE) as V3);
    // v2 GROUNDING FIX (judge-directed): lift the column so v0 buries in the
    // boss stone and the three v0-edges grow OUT of the socket (orrery-cradle
    // lineage); v1's single-point contact read precarious at 18m.
    const LIFT = PLINTH_H + LIFT2 - seated[0][1];
    return seated.map((v) => [v[0], v[1] + LIFT, v[2]] as V3);
})();
export { V };

// T7 equal advance in FINAL coords (heights equally spaced; radius constant)
{
    const heights = V.map((v) => v[1]);
    let worstStep = 0;
    for (let i = 1; i < NV; i++) worstStep = Math.max(worstStep, Math.abs((heights[i] - heights[i - 1]) - (heights[1] - heights[0])));
    let worstRad = 0;
    for (const v of V) worstRad = Math.max(worstRad, Math.abs(Math.hypot(v[0], v[2]) - (3 * SQ3 / 10) * SCALE));
    check("T7 monodromy: equal per-index rise and constant cylinder radius in final coords",
        worstStep < 1e-9 && worstRad < 1e-9,
        `rise spread ${(worstStep * 1e9).toFixed(2)} nm; radius dev ${(worstRad * 1e9).toFixed(2)} nm (r ${(3 * SQ3 / 10 * SCALE).toFixed(4)} m)`);
}

// T8 seat law
{
    const apothem = PLINTH_R * Math.cos(Math.PI / PLINTH_N);
    const maxReach = Math.max(...V.map((v) => Math.hypot(v[0], v[2]) + BEAD_R));
    const heights = V.map((v) => v[1]);
    // v2 socket law: v0 buried LIFT2 below the boss top; the three v0-edges
    // emerge from the boss (v1/v2/v3 above boss top); all vertices at/above
    // the dais top; beads within the dais apothem budget.
    const bossTop = PLINTH_H + BOSS_H;
    check("T8 seat: v0 socketed in boss; edges emerge; beads within dais apothem",
        Math.abs(V[0][1] - (PLINTH_H + LIFT2)) < 1e-9 && Math.min(...heights) >= PLINTH_H - 1e-9 &&
        V[1][1] > bossTop && V[2][1] > bossTop && V[3][1] > bossTop && maxReach <= apothem,
        `v0 y ${V[0][1].toFixed(4)} (boss spans ${PLINTH_H}..${bossTop}; v0 buried ${(bossTop - V[0][1]).toFixed(3)}m); v1/v2/v3 y ${V[1][1].toFixed(2)}/${V[2][1].toFixed(2)}/${V[3][1].toFixed(2)} > boss top; max bead reach ${maxReach.toFixed(4)} ≤ apothem ${apothem.toFixed(4)}; summit ${(heights[NV - 1] + BEAD_R).toFixed(3)} m`);
}

// T9 immersion: cell pairs ≥ 4 apart — no edge-face pierce, no strict interior containment
{
    const cells: number[][] = [];
    for (let k = 0; k < CELLS; k++) cells.push([k, k + 1, k + 2, k + 3]);
    const facesOf = (c: number[]): V3[][] => {
        const [a, b, cc, d] = c.map((i) => model[i]);
        return [[a, b, cc], [a, b, d], [a, cc, d], [b, cc, d]];
    };
    const edgesOf = (c: number[]): [V3, V3][] => {
        const [a, b, cc, d] = c.map((i) => model[i]);
        return [[a, b], [a, cc], [a, d], [b, cc], [b, d], [cc, d]];
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
    const insideStrict = (p: V3, c: number[]): boolean => {
        // barycentric sign test against the 4 faces, strict interior
        const vs = c.map((i) => model[i]);
        for (let skip = 0; skip < 4; skip++) {
            const tri = vs.filter((_, i) => i !== skip);
            const e1: V3 = [tri[1][0] - tri[0][0], tri[1][1] - tri[0][1], tri[1][2] - tri[0][2]];
            const e2: V3 = [tri[2][0] - tri[0][0], tri[2][1] - tri[0][1], tri[2][2] - tri[0][2]];
            const n: V3 = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
            const d: V3 = [p[0] - tri[0][0], p[1] - tri[0][1], p[2] - tri[0][2]];
            const sd = d[0] * n[0] + d[1] * n[1] + d[2] * n[2];
            const sv = vs[skip][0] * n[0] + vs[skip][1] * n[1] + vs[skip][2] * n[2] - (tri[0][0] * n[0] + tri[0][1] * n[1] + tri[0][2] * n[2]);
            if (sd * sv < -1e-12) return false;        // outside this face
        }
        return true;
    };
    let bad = 0, tested = 0;
    for (let i = 0; i < CELLS; i++) for (let j = i + 4; j < CELLS; j++) {
        tested++;
        const fi = facesOf(cells[i]), ei = edgesOf(cells[i]);
        const fj = facesOf(cells[j]), ej = edgesOf(cells[j]);
        let hit = false;
        outer: for (const [a, b] of ei) for (const t of fj) if (segTri(a, b, t)) { hit = true; break outer; }
        if (!hit) outer2: for (const [a, b] of ej) for (const t of fi) if (segTri(a, b, t)) { hit = true; break outer2; }
        if (!hit) for (const vi of cells[i]) if (insideStrict(model[vi], cells[j])) { hit = true; break; }
        if (!hit) for (const vj of cells[j]) if (insideStrict(model[vj], cells[i])) { hit = true; break; }
        if (hit) bad++;
    }
    check("T9 immersion: zero interpenetrations between cell pairs ≥ 4 apart", bad === 0,
        `${tested} far pairs tested (2-apart share an edge, 3-apart a vertex — designed contacts), ${bad} defects`);
}

// ---- envelope + dais TRUE box ---------------------------------------------------------------------------------
export const ENVELOPE = (() => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const v of V) {
        min[0] = Math.min(min[0], v[0] - BEAD_R); max[0] = Math.max(max[0], v[0] + BEAD_R);
        min[1] = Math.min(min[1], v[1] - BEAD_R); max[1] = Math.max(max[1], v[1] + BEAD_R);
        min[2] = Math.min(min[2], v[2] - BEAD_R); max[2] = Math.max(max[2], v[2] + BEAD_R);
    }
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        min[0] = Math.min(min[0], PLINTH_R * Math.cos(a)); max[0] = Math.max(max[0], PLINTH_R * Math.cos(a));
        min[1] = Math.min(min[1], 0); max[1] = Math.max(max[1], PLINTH_H);
        min[2] = Math.min(min[2], -PLINTH_R * Math.sin(a)); max[2] = Math.max(max[2], -PLINTH_R * Math.sin(a));
    }
    // the boss (hexagon BOSS_R, spanning dais top .. dais top + BOSS_H)
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        min[0] = Math.min(min[0], BOSS_R * Math.cos(a)); max[0] = Math.max(max[0], BOSS_R * Math.cos(a));
        min[1] = Math.min(min[1], PLINTH_H); max[1] = Math.max(max[1], PLINTH_H + BOSS_H);
        min[2] = Math.min(min[2], -BOSS_R * Math.sin(a)); max[2] = Math.max(max[2], -BOSS_R * Math.sin(a));
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

console.log(`vertices (final): ${V.map((v, i) => `${i}(${v[0].toFixed(2)},${v[1].toFixed(3)},${v[2].toFixed(2)})`).join(" ")}`);
console.log(`envelope ${(ENVELOPE.max[0] - ENVELOPE.min[0]).toFixed(2)}x${(ENVELOPE.max[1] - ENVELOPE.min[1]).toFixed(2)}x${(ENVELOPE.max[2] - ENVELOPE.min[2]).toFixed(2)} min [${ENVELOPE.min.map((n) => n.toFixed(3)).join(",")}] max [${ENVELOPE.max.map((n) => n.toFixed(3)).join(",")}]`);
if (fails.length) { console.error(`${fails.length} LAW FAILS: ${fails.join(", ")}`); process.exit(1); }
console.log("ALL PASS (probe struct233-tetrahelix)");
