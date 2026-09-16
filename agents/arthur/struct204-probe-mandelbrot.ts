// struct204-probe-mandelbrot.ts — THE ONE CONTRACT for R11-26 THE MANDELBROT
// SET (z → z² + c): THE HEART, THE WHEEL, AND THE REAL LINE.
//
// FORM SELECTION (fresh grep, all three ledgers): mandelbrot 0/0/0 across
// STRUCTURES-PLAN.md + IMPROVEMENTS.md + IMPROVE-PLAN.md; census carries no
// nx-struct-mandelbrot. Register: the fractal family (koch/sierpinski/menger/
// apollonian) is all GEOMETRIC recursion — this opens the ITERATION-dynamics
// branch: the boundary between convergence and divergence itself. Kin-check:
// the main cardioid is not an epicycloid carving (nephroid stands, disclosed
// proximity — different read: here a dimpled ring + wheel-on-axle + rod);
// no standing form reads as a fractal boundary or a set skeleton.
//
// THE THREE THEOREMS CARVED (verified in the laws below before any build):
// 1. THE HEART (main cardioid): boundary c(θ) = e^{iθ}/2 − e^{2iθ}/4 with
//    fixed-point multiplier λ = 1 − √(1−4c) = e^{iθ} EXACTLY (the two-angle
//    theorem: the parametrization IS the multiplier map; internal angle =
//    boundary angle). Cusp at c = 1/4 (the dimple's deepest point, ON the
//    real axis); shoulders at θ = ±π/3 reach x = 3/8.
// 2. THE WHEEL (period-2 bulb): exactly the disc |c + 1| ≤ 1/4. Its 2-cycle
//    {z1,z2} satisfies z² + z + c + 1 = 0, so the cycle multiplier is
//    μ = 4·z1·z2 = 4(1+c) — closed form. Rim = {|μ| = 1} (the circle),
//    tangent to the cardioid at c = −3/4 = cardioid(π); center c = −1 is
//    superattracting: the critical orbit 0 → −1 → 0 is itself the cycle.
// 3. THE REAL LINE: M ∩ ℝ = [−2, 1/4] exactly (the rod). The axle pierces
//    the rim at −3/4 (the tangency — a quadruple point: cardioid ∩ rim ∩
//    rod) and at −5/4, butt-welds into the cusp stone, and flies free from
//    −5/4 to −2, ending at the set's leftmost point c = −2 (z² − 2: the
//    critical orbit 0 → −2 → 2 → 2 lands on the repelling fixed point) —
//    marked by the sole night bead. Between −5/4 and −2 the rod crosses the
//    antenna region: the set continues there, invisibly, along the real axis.
//
// WORLD FRAME (Math Avenue convention): vertical construction plane XY,
// reads on the +Z face. STONE carries the cardioid boundary as one closed
// arc-uniform voussoir ribbon (the heart). IRON carries the rim torus (the
// wheel) and the real-axis rod (the axle). The ring's bottom arc seats into
// the plinth (cradle socket, post-embed class, disclosed). Sole night
// element: one warm bead at c = −2, the rod's terminus (s363 sole-bead law).
//
// Exports are consumed by assets/mkv3-mandelbrot.ts (the build) and
// struct204-decode-mandelbrot.ts (the audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions below are FINAL world-local coords.

// ---- constants -----------------------------------------------------------------------------------看完
export const S = 2.0;                       // scale, metres per math unit
export const PLINTH_W = 5.20, PLINTH_H = 0.26, PLINTH_D = 0.90;   // the stone base (the cradle lives in its top)
export const EMBED_DEPTH = 0.08;            // how deep the ring's bottom arc seats into the plinth top
export const Y_BOT = 3 * Math.sqrt(3) / 8;  // cardioid |y| extreme = 3√3/8 ≈ 0.649519 (at θ = 2π/3, 4π/3)
export const LIFT = PLINTH_H / 2 - EMBED_DEPTH / 2 + Y_BOT;  // = 0.09 + Y_BOT ≈ 0.739519: bottom curve lands EMBED_DEPTH below plinth top
export const AXIS_Y = S * LIFT;             // world height of the real axis (the rod) ≈ 1.479038
export const X_CENTER = -0.8125;            // math-x shift: composition spans math x ∈ [−2, 0.375] → world ±

export const RIB_N = 0.20;                  // stone voussoir in-plane thickness
export const RIB_D = 0.20;                  // stone voussoir depth (z)
export const L_STEP = 0.30;                 // arc-uniform voussoir arc length (world)
export const JOINT = 0.006;                 // voussoir chord-length joint extension (mk box law)

export const ROD_R = 0.035;                 // iron rod radius (the real axis)
export const CUSP_POKE = 0.06;              // rod terminus pokes this far INTO the cusp socket (world)
export const RIM_TUBE = 0.05;               // iron torus tube radius (the wheel's rim)
export const BEAD_R = 0.07;                 // sole night bead radius

export const CUSP: [number, number] = [0.25, 0];        // cardioid(0) — the dimple's deepest point
export const TANGENT: [number, number] = [-0.75, 0];    // cardioid(π) = rim right point — the tangency
export const RIM_C: [number, number] = [-1, 0];         // rim center (superattracting heart of the bulb)
export const RIM_R = 0.25;                              // rim radius (math)
export const ROD_XL_M = -2, ROD_XR_M = 0.25;            // the rod spans M ∩ ℝ = [−2, 1/4] (math)

export const MARKS = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3, 2 * Math.PI];
export const CRADLE_HALF = 0.40;           // |θ − 4π/3| ≤ this = the cradle zone (ring seated in plinth top)

// ---- the cardioid ---------------------------------------------------------------------------------
export const cardioid = (t: number): [number, number] =>
    [Math.cos(t) / 2 - Math.cos(2 * t) / 4, Math.sin(t) / 2 - Math.sin(2 * t) / 4];

// FINAL world-local coords
export const worldPt = (x: number, y: number): [number, number] =>
    [S * (x - X_CENTER), S * (y + LIFT)];
export const mathPt = (wx: number, wy: number): [number, number] =>
    [wx / S + X_CENTER, wy / S - LIFT];
export const worldX = (x: number) => S * (x - X_CENTER);

// ---- complex helpers ------------------------------------------------------------------------------
type C = [number, number];
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cAbs = (a: C) => Math.hypot(a[0], a[1]);
function cSqrt(a: C): C {
    const r = Math.sqrt(cAbs(a));
    const phi = Math.atan2(a[1], a[0]) / 2;
    return [r * Math.cos(phi), r * Math.sin(phi)];
}
// fixed-point multiplier λ = 1 − √(1−4c), attracting branch (min |λ|)
export function lamOf(c: C): C {
    const s = cSqrt([1 - 4 * c[0], -4 * c[1]]);
    const a: C = [1 - s[0], -s[1]], b: C = [1 + s[0], s[1]];
    return cAbs(a) <= cAbs(b) ? a : b;
}
// critical-orbit escape test (|z| > 2 ⇒ escape, classic theorem)
export function escapes(c: C, maxIter: number): boolean {
    let z: C = [0, 0];
    for (let i = 0; i < maxIter; i++) {
        z = [z[0] * z[0] - z[1] * z[1] + c[0], 2 * z[0] * z[1] + c[1]];
        if (z[0] * z[0] + z[1] * z[1] > 4) return true;
    }
    return false;
}

// ---- arc machinery (|c'(θ)| = sin(θ/2) on [0,2π]; arc closed form EXACT) ---------------------------
export const arcLenClosed = (t1: number, t2: number) =>
    2 * (Math.cos(t1 / 2) - Math.cos(t2 / 2));          // math units; total circumference = 4 exactly

type ArcSpec = { t0: number; t1: number };
export const ARCS: ArcSpec[] = MARKS.slice(0, 6).map((m, i) => ({ t0: m, t1: MARKS[i + 1] }));

function thetaAtArc(a: ArcSpec, sWant: number): number {
    let lo = a.t0, hi = a.t1;
    for (let it = 0; it < 80; it++) {
        const mid = (lo + hi) / 2;
        if (arcLenClosed(a.t0, mid) < sWant) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
}
export function arcStations(a: ArcSpec): number[] {
    const total = arcLenClosed(a.t0, a.t1);
    const n = Math.max(1, Math.round((total * S) / L_STEP));
    const out: number[] = [];
    for (let j = 0; j <= n; j++) out.push(thetaAtArc(a, (total * j) / n));
    return out;
}
export const arcWorldPts = (a: ArcSpec): [number, number][] =>
    arcStations(a).map((t) => { const p = cardioid(t); return worldPt(p[0], p[1]); });

// ---- envelope contract (probe models the mk boxes EXACTLY; decode re-derives from verts) ----------
export const ENVELOPE = (() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    const grow = (px: number, py: number, pz: number, hx: number, hy: number, hz: number) => {
        minX = Math.min(minX, px - hx); maxX = Math.max(maxX, px + hx);
        minY = Math.min(minY, py - hy); maxY = Math.max(maxY, py + hy);
        minZ = Math.min(minZ, pz - hz); maxZ = Math.max(maxZ, pz + hz);
    };
    grow(0, PLINTH_H / 2, 0, PLINTH_W / 2, PLINTH_H / 2, PLINTH_D / 2);   // plinth
    const rib = (a: [number, number], b: [number, number]) => {           // voussoir AABBs
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) + JOINT;
        const ang = Math.atan2(dy, dx);
        const c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang));
        grow((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0,
            (len * c + RIB_N * s) / 2, (len * s + RIB_N * c) / 2, RIB_D / 2);
    };
    for (const a of ARCS) {
        const pts = arcWorldPts(a);
        for (let i = 0; i < pts.length - 1; i++) rib(pts[i], pts[i + 1]);
    }
    const rOut = S * RIM_R + RIM_TUBE;                                   // torus outer half-extent (x/y)
    grow(worldX(RIM_C[0]), AXIS_Y, 0, rOut, rOut, RIM_TUBE);             // rim torus AABB
    grow((worldX(ROD_XL_M) + worldX(ROD_XR_M) + CUSP_POKE) / 2, AXIS_Y, 0,
        (worldX(ROD_XR_M) + CUSP_POKE - worldX(ROD_XL_M)) / 2, ROD_R, ROD_R);               // rod
    grow(worldX(ROD_XL_M), AXIS_Y, 0, BEAD_R, BEAD_R, BEAD_R);                              // bead
    return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
})();

// ---- distance fields (dense) ----------------------------------------------------------------------
const CARD_W: Array<[number, number]> = (() => {
    const out: Array<[number, number]> = [];
    for (let i = 0; i <= 30000; i++) {
        const p = cardioid((i / 30000) * 2 * Math.PI);
        out.push(worldPt(p[0], p[1]));
    }
    return out;
})();
export const distToCardioid = (wx: number, wy: number): number => {
    let best = Infinity;
    for (const [cx, cy] of CARD_W) { const d = Math.hypot(cx - wx, cy - wy); if (d < best) best = d; }
    return best;
};
export const distToRim = (wx: number, wy: number): number => {
    const cx = worldX(RIM_C[0]), cy = AXIS_Y, R = S * RIM_R;
    return Math.abs(Math.hypot(wx - cx, wy - cy) - R);
};

// ---- laws -----------------------------------------------------------------------------------------
function approxEq(a: number, b: number, tol: number, what: string) {
    if (Math.abs(a - b) > tol) throw Error(`LAW FAIL ${what}: ${a} vs ${b} (tol ${tol})`);
}

function main() {
    console.log(`R11-26 THE MANDELBROT SET — the heart, the wheel, and the real line`);
    console.log(`scale S=${S}, LIFT=${LIFT.toFixed(6)}, AXIS_Y=${AXIS_Y.toFixed(6)}, world x span ±${(PLINTH_W / 2).toFixed(2)} (plinth)`);

    // L1 THE HEART: λ(θ) = e^{iθ} machine-exact (two-angle theorem); every
    // boundary point indifferent (|λ|=1); on-curve critical orbits bounded;
    // just-outside (multiplier-outward) points repelling and escaping.
    {
        const N = 2401;
        let worstLam = 0;
        for (let i = 0; i < N; i++) {
            const t = (i / (N - 1)) * 2 * Math.PI;
            const p = cardioid(t);
            const lam = lamOf([p[0], p[1]]);
            worstLam = Math.max(worstLam, Math.hypot(lam[0] - Math.cos(t), lam[1] - Math.sin(t)));
        }
        approxEq(worstLam, 0, 1e-12, "L1 λ(θ) == e^{iθ} (the parametrization IS the multiplier map)");
        // bounded on-curve orbits (indifferent fixed point; slow parabolic convergence stays ≤ 2)
        let bounded = 0;
        for (let i = 0; i < 240; i++) {
            const t = (i / 240) * 2 * Math.PI;
            const p = cardioid(t);
            if (!escapes([p[0], p[1]], 4000)) bounded++;
        }
        if (bounded !== 240) throw Error(`L1 on-curve bounded orbits ${bounded}/240 — the boundary belongs to the set`);
        // just-outside: the frontier test is GEOMETRIC — step δ along the
        // boundary NORMAL (either side); one side must leave the component
        // (|λ|>1: the point is a true frontier point of the cardioid) and
        // that outside point must escape (θ away from attachment points ±0.25).
        // (λ-radial stepping fails near the cusp: dc/dλ = (1−λ)/2 = 0 there —
        // self-caught this tick; the normal is exact everywhere.)
        const samples = [0.75, 0.55, 1.45, 1.75, 2.55, 2.85, 3.55, 3.85, 4.65, 4.95, 5.55, 5.75];
        // (samples held ≥0.5 rad from the cusp: nearer than that, the branch
        // bends faster than a 0.02 step and both normals land inside the thin
        // wedge — the cusp's own frontier is certified exactly by L3:
        // c = 1/4 bounded, c = 0.2501 escapes. Self-caught this tick.)
        let esc = 0, rep = 0;
        for (const t of samples) {
            const p = cardioid(t);
            // unit tangent c'(θ) = (−sinθ/2 + sin2θ/2·… ) → differentiate exactly:
            const tx = -Math.sin(t) / 2 + Math.sin(2 * t) / 2;
            const ty = Math.cos(t) / 2 - Math.cos(2 * t) / 2;
            const tn = Math.hypot(tx, ty);
            const normals: C[] = [[-ty / tn, tx / tn], [ty / tn, -tx / tn]];
            let found: C | null = null;
            for (const nn of normals) {
                const cp: C = [p[0] + 0.02 * nn[0], p[1] + 0.02 * nn[1]];
                if (cAbs(lamOf(cp)) > 1.0005) { found = cp; break; }
            }
            if (found) { rep++; if (escapes(found, 30000)) esc++; }
        }
        if (rep !== 12) throw Error(`L1 normal-step frontier ${rep}/12 (expect 12 — every sampled boundary point has an outward side)`);
        if (esc < 10) throw Error(`L1 outward perturbation escaping ${esc}/12 (expect ≥10)`);
        console.log(`L1 PASS λ(θ)=e^{iθ} exact to ${worstLam.toExponential(2)} (two-angle theorem); 240/240 on-curve orbits bounded (the boundary is IN the set); 12/12 outward-δ points repelling, ${esc}/12 escaping — the cardioid boundary is the true frontier`);
    }

    // L2 THE WHEEL: period-2 bulb = disc(center −1, r 1/4) EXACTLY. Closed
    // form μ(c) = 4(1+c); rim = {|μ|=1}; center superattracting (0 → −1 → 0);
    // tangent to the cardioid at −3/4 = cardioid(π); outside the rim repelling + escaping.
    {
        approxEq(Math.abs(TANGENT[0] - RIM_C[0]) - RIM_R, 0, 1e-15, "L2 tangency: |cardioid(π) − rim center| == r");
        approxEq(TANGENT[0], -0.75, 1e-15, "L2 cardioid(π) x == −3/4");
        approxEq(TANGENT[1], 0, 1e-15, "L2 cardioid(π) y == 0");
        // superattracting center: the critical orbit IS the 2-cycle
        {
            let z: C = [0, 0];
            const orb: C[] = [z];
            for (let i = 0; i < 4; i++) { z = [z[0] * z[0] - z[1] * z[1] - 1, 2 * z[0] * z[1]]; orb.push([...z]); }
            approxEq(orb[1][0], -1, 1e-15, "L2 center orbit 0 → −1");
            approxEq(orb[2][0], 0, 1e-15, "L2 center orbit −1 → 0 (the critical point itself cycles)");
            approxEq(Math.abs(4 * (1 + RIM_C[0])), 0, 1e-15, "L2 μ(center) == 0 (superattracting)");
        }
        // rim = {|μ| = 1} exact; outside repelling; outside escaping (φ away from the antenna pole π)
        let worstRim = 0;
        for (let i = 0; i < 720; i++) {
            const phi = (i / 720) * 2 * Math.PI;
            const c: C = [RIM_C[0] + RIM_R * Math.cos(phi), RIM_R * Math.sin(phi)];
            worstRim = Math.max(worstRim, Math.abs(cAbs([4 * (1 + c[0]), 4 * c[1]]) - 1));
        }
        approxEq(worstRim, 0, 1e-14, "L2 rim = {|4(1+c)| = 1} (cycle multiplier indifferent — closed form)");
        let esc = 0;
        for (const phi of [0.3, 0.9, 1.5, 2.1, 2.7, 3.9, 4.5, 5.1, 5.7]) {
            const c: C = [RIM_C[0] + 0.27 * Math.cos(phi), 0.27 * Math.sin(phi)];
            if (cAbs([4 * (1 + c[0]), 4 * c[1]]) <= 1.05) throw Error(`L2 outside-rim point not repelling at φ=${phi}`);
            if (escapes(c, 20000)) esc++;
        }
        if (esc < 7) throw Error(`L2 outside-rim escaping ${esc}/9 (expect ≥7)`);
        console.log(`L2 PASS bulb = disc(−1, 1/4) exact: μ(c) = 4(1+c) closed form, rim |μ|=1 to ${worstRim.toExponential(2)} over 720 stations; center superattracting (orbit 0→−1→0 exact, μ=0); tangent at −3/4 = cardioid(π) exact; ${esc}/9 outside-rim points escape — the wheel is the true period-2 component`);
    }

    // L3 THE REAL LINE: M ∩ ℝ = [−2, 1/4]. Endpoints bounded; just-outside
    // escapes (both ends); dense interior sweep bounded; the rod spans exactly this interval.
    {
        if (escapes([0.25, 0], 20000)) throw Error("L3 c=1/4 escaped — the cusp is in the set");
        if (escapes([-2, 0], 20000)) throw Error("L3 c=−2 escaped — the antenna tip is in the set");
        {
            let z: C = [0, 0];
            const seq: number[] = [];
            for (let i = 0; i < 4; i++) { z = [z[0] * z[0] - z[1] * z[1] - 2, 0]; seq.push(z[0]); }
            approxEq(seq[0], -2, 1e-15, "L3 c=−2 orbit 0 → −2");
            approxEq(seq[1], 2, 1e-15, "L3 c=−2 orbit −2 → 2");
            approxEq(seq[2], 2, 1e-15, "L3 c=−2 orbit 2 → 2 (lands on the repelling fixed point)");
        }
        if (!escapes([0.2501, 0], 200000)) throw Error("L3 c=0.2501 failed to escape (parabolic-slow budget 200k)");
        if (!escapes([0.251, 0], 20000)) throw Error("L3 c=0.251 failed to escape");
        if (!escapes([-2.0001, 0], 20000)) throw Error("L3 c=−2.0001 failed to escape");
        if (!escapes([-2.001, 0], 20000)) throw Error("L3 c=−2.001 failed to escape");
        let bounded = 0;
        for (let i = 0; i < 200; i++) {
            const c = -2 + (i / 199) * 2.25;
            if (!escapes([c, 0], 5000)) bounded++;
        }
        if (bounded !== 200) throw Error(`L3 interior sweep bounded ${bounded}/200 — every real c in [−2, 1/4] must stay bounded`);
        console.log(`L3 PASS M ∩ ℝ = [−2, 1/4]: cusp 1/4 bounded (parabolic), tip −2 bounded (orbit 0→−2→2→2 exact), 200/200 interior bounded; 0.2501/0.251/−2.0001/−2.001 all escape — the rod spans the set's real slice exactly, nothing more`);
    }

    // L4 STATION WALK: closed-form arc length (|c'| = sin(θ/2), ∫ = 4 exact);
    // stations arc-uniform ≤ 0.30 world; marks are joints; chord dev ≤ 45mm.
    {
        // closed form vs Simpson
        let worst = 0;
        for (const a of ARCS) {
            const n = 2000, h = (a.t1 - a.t0) / n;
            let s = 0;
            for (let i = 0; i <= n; i++) {
                const t = a.t0 + i * h;
                const w = i === 0 || i === n ? 1 : (i % 2 ? 4 : 2);
                s += w * Math.sin(t / 2);
            }
            s *= h / 3;
            worst = Math.max(worst, Math.abs(s - arcLenClosed(a.t0, a.t1)));
        }
        approxEq(worst, 0, 1e-12, "L4 Simpson arc == closed form");
        approxEq(arcLenClosed(0, 2 * Math.PI), 4, 1e-15, "L4 circumference == 4 exactly");
        let totalV = 0, maxStep = 0, worstDev = 0;
        for (const a of ARCS) {
            const ts = arcStations(a);
            totalV += ts.length - 1;
            approxEq(ts[0], a.t0, 2e-3, "L4 first station == arc start (param, tol 2e-3 — speed vanishes at the cusp)");
            approxEq(ts[ts.length - 1], a.t1, 2e-3, "L4 last station == arc end (param, tol 2e-3)");
            // POSITIONAL closure (the law's intent): the walk ends AT the mark
            // world point to machine precision — param precision degenerates
            // where |c'| = sin(θ/2) → 0, position does not.
            for (const [idx, tend] of [[0, a.t0], [ts.length - 1, a.t1]] as Array<[number, number]>) {
                const p = cardioid(tend), wp = worldPt(p[0], p[1]);
                const q = cardioid(ts[idx]), wq = worldPt(q[0], q[1]);
                approxEq(Math.hypot(wq[0] - wp[0], wq[1] - wp[1]), 0, 1e-9, "L4 mark endpoints land on the mark world point exactly");
            }
            for (let i = 0; i < ts.length - 1; i++) {
                const p = cardioid(ts[i]), q = cardioid(ts[i + 1]);
                const wp = worldPt(p[0], p[1]), wq = worldPt(q[0], q[1]);
                maxStep = Math.max(maxStep, Math.hypot(wq[0] - wp[0], wq[1] - wp[1]));
                const sMid = arcLenClosed(ts[i], ts[i + 1]) / 2;
                let lo = ts[i], hi = ts[i + 1];
                for (let it = 0; it < 60; it++) {
                    const m = (lo + hi) / 2;
                    if (arcLenClosed(ts[i], m) < sMid) lo = m; else hi = m;
                }
                const m = cardioid((lo + hi) / 2), wm = worldPt(m[0], m[1]);
                const dev = Math.hypot(wm[0] - (wp[0] + wq[0]) / 2, wm[1] - (wp[1] + wq[1]) / 2);
                worstDev = Math.max(worstDev, dev);
                if (dev > 0.045) throw Error(`L4 chord deviation ${(dev * 1000).toFixed(1)}mm — shorten the step`);
            }
        }
        if (maxStep > 0.31) throw Error(`L4 max step ${maxStep.toFixed(3)} > 0.31`);
        console.log(`L4 PASS ${totalV} voussoirs over 6 arcs (cusp/shoulder/top/tangency/bottom/shoulder = joints); Simpson==closed-form ${worst.toExponential(2)}, circumference 4 exact; max step ${maxStep.toFixed(3)}m; worst chord dev ${(worstDev * 1000).toFixed(1)}mm ≤ 45mm`);
    }

    // L5 THE AXLE AND THE WHEEL: rod on the real axis spanning [−2, 1/4];
    // rim crossings at −3/4 and −5/4 exact (welds); cusp butt socketed;
    // bead at the terminus; clearances ≥ 0.14 outside the declared sockets.
    {
        // crossings: |x − (−1)| == 1/4 at x ∈ {−3/4, −5/4}, y == 0
        for (const x of [-0.75, -1.25]) approxEq(Math.abs(x - RIM_C[0]), RIM_R, 1e-15, `L5 rim crossing at x=${x}`);
        // cusp butt: rod terminus pokes CUSP_POKE past the cusp into the stone socket
        const cuspW = worldPt(CUSP[0], CUSP[1]);
        approxEq(cuspW[1], AXIS_Y, 1e-12, "L5 the cusp sits ON the rod's axis (the butt is collinear)");
        // clearances: rod vs cardioid, rim vs cardioid, outside sockets
        const tangW = worldPt(TANGENT[0], TANGENT[1]);
        const SOCKET = 0.35;
        let worstRod = Infinity, worstRim = Infinity;
        for (let i = 0; i <= 2000; i++) {
            const x = ROD_XL_M + (i / 2000) * (ROD_XR_M - ROD_XL_M);
            const w = worldPt(x, 0);
            const nearCusp = Math.hypot(w[0] - cuspW[0], w[1] - cuspW[1]) <= SOCKET;
            const nearTang = Math.hypot(w[0] - tangW[0], w[1] - tangW[1]) <= SOCKET;
            if (nearCusp || nearTang) continue;
            worstRod = Math.min(worstRod, distToCardioid(w[0], w[1]));
        }
        for (let i = 0; i < 720; i++) {
            const phi = (i / 720) * 2 * Math.PI;
            const p: [number, number] = [RIM_C[0] + RIM_R * Math.cos(phi), RIM_R * Math.sin(phi)];
            const w = worldPt(p[0], p[1]);
            if (Math.hypot(w[0] - tangW[0], w[1] - tangW[1]) <= SOCKET) continue;
            worstRim = Math.min(worstRim, distToCardioid(w[0], w[1]));
        }
        if (worstRod < 0.14) throw Error(`L5 rod clips the cardioid (${worstRod.toFixed(3)} < 0.14) outside the cusp/tangency sockets`);
        if (worstRim < 0.14) throw Error(`L5 rim clips the cardioid (${worstRim.toFixed(3)} < 0.14) outside the tangency socket`);
        // the rod's poke is buried: the terminal segment lies inside the cusp-adjacent voussoir AABBs
        {
            const pokeW = [cuspW[0] + CUSP_POKE, cuspW[1]] as [number, number];
            const covered = ARCS.some((a) => {
                const pts = arcWorldPts(a);
                for (let i = 0; i < pts.length - 1; i++) {
                    const p = pts[i], q = pts[i + 1];
                    const dx = q[0] - p[0], dy = q[1] - p[1];
                    const len = Math.hypot(dx, dy) + JOINT;
                    const ang = Math.atan2(dy, dx);
                    const c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang));
                    const hx = (len * c + RIB_N * s) / 2, hy = (len * s + RIB_N * c) / 2;
                    if (Math.abs(pokeW[0] - (p[0] + q[0]) / 2) <= hx && Math.abs(pokeW[1] - (p[1] + q[1]) / 2) <= hy) return true;
                }
                return false;
            });
            if (!covered) throw Error("L5 rod's cusp poke is not buried in the cusp voussoir socket");
        }
        console.log(`L5 PASS rod on y=0 spanning [−2, 1/4] (the real slice); rim crossings at −3/4 (the tangency weld — cardioid ∩ rim ∩ rod) and −5/4 exact; cusp butt collinear + ${CUSP_POKE * 100}cm socketed (covered, decode-verifiable); rod clears the cardioid ≥ ${worstRod.toFixed(3)}m and rim ≥ ${worstRim.toFixed(3)}m outside the ±${SOCKET}m sockets; bead rides the terminus at −2`);
    }

    // L6 GROUNDING: plinth sole mass; the ring's bottom arc seats into the
    // plinth (cradle, post-embed class, disclosed); disc/rod/bead all fly.
    {
        const botW = worldPt(cardioid(4 * Math.PI / 3)[0], cardioid(4 * Math.PI / 3)[1]);
        approxEq(botW[1], PLINTH_H - EMBED_DEPTH, 1e-9, "L6 bottom station seats EMBED_DEPTH below the plinth top");
        let cradle = 0, flyBad = 0, minBottom = Infinity;
        for (const a of ARCS) {
            const ts = arcStations(a);
            for (const t of ts) {
                const p = cardioid(t), w = worldPt(p[0], p[1]);
                const inCradle = Math.abs(t - 4 * Math.PI / 3) <= CRADLE_HALF || Math.abs(t - 4 * Math.PI / 3 - 2 * Math.PI) <= CRADLE_HALF;
                if (inCradle) {
                    cradle++;
                    if (w[1] > PLINTH_H + 0.14) throw Error(`L6 cradle station at θ=${t.toFixed(3)} rides high (${w[1].toFixed(3)})`);
                    minBottom = Math.min(minBottom, w[1]);
                } else {
                    if (w[1] - 0.115 < PLINTH_H + 0.03) flyBad++;
                }
            }
        }
        if (flyBad) throw Error(`L6 ${flyBad} non-cradle stations dip to the plinth top — only the cradle may touch`);
        if (minBottom < PLINTH_H - EMBED_DEPTH - 0.001) throw Error("L6 cradle deeper than the declared embed");
        const rimBottom = AXIS_Y - (S * RIM_R + RIM_TUBE);
        if (rimBottom < PLINTH_H + 0.05) throw Error(`L6 wheel dips toward the plinth (${rimBottom.toFixed(3)})`);
        if (AXIS_Y - BEAD_R < PLINTH_H + 0.05) throw Error("L6 bead too low");
        console.log(`L6 PASS plinth 0..${PLINTH_H} sole grounded mass; cradle = ${cradle} stations within |θ−4π/3| ≤ ${CRADLE_HALF} seating ${EMBED_DEPTH * 100}cm into the top (post-embed class, disclosed); every other station clears by ≥ 3cm + box; wheel bottom ${rimBottom.toFixed(3)}m and bead ${AXIS_Y.toFixed(3)}m fly — the heart stands in the stone, the wheel and axle never touch it`);
    }

    // L7 ENVELOPE + collider honesty: origin-centered x/z, y ≥ 0, height ≥ 2.2,
    // footprint < 16 m² (folly — no walk owed).
    {
        const sx = ENVELOPE.max[0] - ENVELOPE.min[0], sy = ENVELOPE.max[1] - ENVELOPE.min[1], sz = ENVELOPE.max[2] - ENVELOPE.min[2];
        approxEq(Math.abs(ENVELOPE.min[0] + ENVELOPE.max[0]), 0, 1e-9, "L7 x centered");
        approxEq(Math.abs(ENVELOPE.min[2] + ENVELOPE.max[2]), 0, 1e-9, "L7 z centered");
        if (ENVELOPE.min[1] < -1e-9) throw Error("L7 below grade");
        if (sy < 2.2) throw Error(`L7 height ${sy.toFixed(3)} < 2.2`);
        const fp = PLINTH_W * PLINTH_D;
        if (fp >= 16) throw Error("L7 footprint enters room class");
        console.log(`L7 PASS envelope ${sx.toFixed(3)}x${sy.toFixed(3)}x${sz.toFixed(3)} origin-centred x/z, y[0, ${ENVELOPE.max[1].toFixed(3)}]; footprint ${fp.toFixed(2)} m² < 16 — folly, no walk owed`);
    }

    console.log("ALL CHECKS PASS");
}

// RED control: run with argv[1] == "mutant" — sign-flipped parametrization
// c̃ = e^{2iθ}/4 − e^{iθ}/2: the multiplier law must detect it.
if (process.argv[2] === "mutant") {
    let worst = 0;
    for (let i = 0; i <= 2000; i++) {
        const t = (i / 2000) * 2 * Math.PI;
        const c: C = [Math.cos(2 * t) / 4 - Math.cos(t) / 2, Math.sin(2 * t) / 4 - Math.sin(t) / 2];
        const lam = lamOf(c);
        worst = Math.max(worst, Math.hypot(lam[0] - Math.cos(t), lam[1] - Math.sin(t)));
    }
    if (worst < 0.10) throw Error(`RED control FAILED to fail (worst ${worst})`);
    console.error(`RED control OK: mutant parametrization violates λ==e^{iθ} by ${worst.toFixed(3)} — law detects`);
    process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("struct204-probe-mandelbrot.ts") && !process.argv[2]) main();
export {};
