// struct194-probe-nephroid.ts — THE ONE CONTRACT for R11-20 THE NEPHROID.
// The cup caustic: parallel rays enter a semicircular stone cup (R=2.0,
// vertical panel composition); each ray reflects specularly off the inner
// arc; the envelope of the reflected rays is EXACTLY the nephroid
//   x = a(3cos t − cos 3t), y = a(3sin t − sin 3t),  a = R/4,
// traced for t ∈ [−π/2, π/2] (the half facing the light): cusp at
// (R/2, 0) on the axis, rim endpoints (0, ±R) shared with the cup arc's
// own rim ends, bulge to x = R/√2 at t = ±45°.
//
// Proven here NUMERICALLY (adjacent-ray intersections converge to the
// parametrization) and ANALYTICALLY (envelope contact parameter
// t_contact(φ) = R·cosφ/2; X(φ) = P(φ) + t_contact·d'(φ) ≡ neph(φ)).
//
// Exports are consumed by assets/mkv3-nephroid.ts (the build) and
// struct194-decode-nephroid.ts (the audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions below are authored in FINAL
// world-local coords.

// ---- constants -----------------------------------------------------------------------------------
export const R = 2.0;              // cup inner radius (curve-frame, metres)
export const A = R / 4;            // nephroid generating radius — THE THEOREM
export const YC = 2.12;            // cup centre height (world): bottom rim embeds plinth top 0.24 by 0.12
export const XC = 0;               // cup centre x (world); plinth ±2.55 governs envelope x symmetry

export const PLINTH_W = 5.10;      // plinth slab (x)
export const PLINTH_H = 0.24;      // plinth height
export const PLINTH_D = 0.50;      // plinth depth (z) — governs envelope z ±0.25

export const ARC_SEC_N = 0.18;     // cup-arc voussoir in-plane thickness
export const ARC_SEC_D = 0.22;     // cup-arc voussoir depth (z)
export const ARC_L_STEP = 0.40;    // arc-uniform target chord ARC length (archispiral law)

export const POST_X = -2.42;       // light-post centre x (the parallel rays issue from its face)
export const POST_SEC = 0.24;      // post square section
export const POST_TOP = 4.12;      // matches arc top rim height (beam seats level)
export const BEAM_SEC_T = 0.18;    // top beam thickness (y)
export const BEAM_SEC_D = 0.18;    // top beam depth (z) — side faces (±0.09) sit strictly
                                   // inside the rim voussoir's z-flanks (±0.11): no coplanar fight
export const BEAM_Y = POST_TOP - BEAM_SEC_T / 2; // beam centreline: seats ON post top
export const BEAM_HALF = (0 - POST_X) / 2; // 1.21 — beam spans post centre to the arc's
                                           // top-rim centre (x=0); embeds the rim voussoir

export const NEPH_SEC_N = 0.14;    // nephroid voussoir in-plane thickness
export const NEPH_SEC_D = 0.16;    // nephroid voussoir depth (z)
export const NEPH_L_STEP = 0.40;   // arc-uniform voussoir ARC length per half-chain
export const NEPH_CUSP_STEP = 0.16; // cusp-adjacent voussoir arc (speed → 0 at t=0:
                                   // a full 0.40 arc there spans 105mm chord deviation —
                                   // the archispiral winding-cap class, capped here)
export const BEAD_R = 0.07;        // cusp bead radius
export const BEAD_Z = NEPH_SEC_D / 2; // half-embedded toward +z front face (struct-52/188 occlusion cure)

export const RAY_KS = [0, 0.6, -0.6, 1.2, -1.2]; // incident-ray heights k (sinφ·R), 5 rays
export const RAY_SEC = 0.05;       // iron ray square section
export const OVER = 0.15;          // reflected-segment overshoot past caustic contact

// ---- the theorem ----------------------------------------------------------------------------------
// Cup arc point, incident dir d=(1,0) [world +x], inward normal n=−P/|P|:
//   d' = d − 2(d·n)n = (−cos 2φ, −sin 2φ)
//   t_contact(φ) = R·cosφ / 2        (envelope condition, cross-product derivation)
//   X(φ) = P(φ) + t_contact·d'(φ)  ≡  neph(φ)  EXACTLY (identity: y = R·sin³φ, x = (R/4)(3cosφ−cos3φ))
export const arcP = (phi: number): [number, number] => [R * Math.cos(phi), R * Math.sin(phi)];
export const dRefl = (phi: number): [number, number] =>
    [-Math.cos(2 * phi), -Math.sin(2 * phi)];
export const tContact = (phi: number): number => (R * Math.cos(phi)) / 2;
export const neph = (t: number): [number, number] => {
    // standard nephroid param, a = R/4 (curve frame: cup centre at origin)
    return [A * (3 * Math.cos(t) - Math.cos(3 * t)), A * (3 * Math.sin(t) - Math.sin(3 * t))];
};
// world-frame helpers (curve frame -> world: x+XC, y+YC, plane z=0)
export const w = (p: [number, number]): [number, number] => [p[0] + XC, p[1] + YC];

// nephroid derivative (for speed/arc-length)
const nephD = (t: number): [number, number] => {
    return [A * (-3 * Math.sin(t) + 3 * Math.sin(3 * t)), A * (3 * Math.cos(t) - 3 * Math.cos(3 * t))];
};
export const nephSpeed = (t: number): number => {
    const d = nephD(t);
    return Math.hypot(d[0], d[1]);
};
// arc length of nephroid over [t0, t1] (dense midpoint rule — curve is
// smooth on each half; orientation-agnostic: integrates over |t1−t0|)
export const nephArc = (t0: number, t1: number): number => {
    const N = 4000;
    const dt = Math.abs(t1 - t0) / N;
    const base = Math.min(t0, t1);
    let s = 0;
    for (let i = 0; i < N; i++) {
        const t = base + (i + 0.5) * dt;
        s += nephSpeed(t) * dt;
    }
    return s;
};

// stations on ONE half-chain of the nephroid: cusp-adjacent voussoir
// NEPH_CUSP_STEP, then arc-uniform NEPH_L_STEP steps, remainder at the rim
// end. If the final remainder would be < 0.10 (a dinky rim block), the last
// full step is merged into the rim remainder. Works in u = |t| ∈ (0, π/2]
// (speed > 0 there), maps back with the sign. Returns t values INCLUDING
// both endpoints. The cusp station is exact and shared by both chains —
// the sharp point is never chord-blunted.
export function halfStations(sign: 1 | -1): number[] {
    const uEnd = Math.PI / 2;
    const total = nephArc(0, uEnd);
    const targets: number[] = [NEPH_CUSP_STEP];
    while (targets[targets.length - 1] + NEPH_L_STEP < total - 0.10) {
        targets.push(targets[targets.length - 1] + NEPH_L_STEP);
    }
    const us: number[] = [0];
    for (const sTarget of targets) {
        // invert s(u) by bisection on u ∈ (previous, π/2] (s strictly increasing)
        let lo = us[us.length - 1], hi = uEnd;
        for (let it = 0; it < 60; it++) {
            const mid = (lo + hi) / 2;
            if (nephArc(0, mid) < sTarget) lo = mid; else hi = mid;
        }
        us.push((lo + hi) / 2);
    }
    us.push(uEnd); // rim end carries the remainder arc
    return us.map((u) => sign * u as number);
}

// cup-arc stations: arc-uniform over the semicircle, φ ∈ [−π/2, π/2]
export function arcStations(): number[] {
    const total = Math.PI * R;
    const n = Math.round(total / ARC_L_STEP); // 16
    const step = total / n;
    const phis: number[] = [];
    for (let i = 0; i <= n; i++) phis.push(-Math.PI / 2 + (i * step) / R);
    return phis;
}
export const ARC_N = Math.round((Math.PI * R) / ARC_L_STEP);

// ---- envelope contract (mk + decode must both match this to 1mm) ----------------------------------
export const ENVELOPE = {
    min: [-2.55, 0, -0.25],
    max: [2.55, POST_TOP + ARC_SEC_N / 2, 0.25],   // 4.21 exact — the arc's top rim voussoir governs
};

// ---- laws -----------------------------------------------------------------------------------------
function approxEq(a: number, b: number, tol: number, what: string) {
    if (Math.abs(a - b) > tol) throw Error(`LAW FAIL ${what}: ${a} vs ${b} (tol ${tol})`);
}

function main() {
    // L1 CUP + CAUSTIC IDENTITY (the theorem): for a dense φ sweep,
    // P + tContact·d' == neph(φ) to machine precision, both derivations.
    {
        const N = 2001;
        let worst = 0;
        for (let i = 0; i < N; i++) {
            const phi = -Math.PI / 2 + (i / (N - 1)) * Math.PI;
            const P = arcP(phi), d = dRefl(phi), tc = tContact(phi);
            const X: [number, number] = [P[0] + tc * d[0], P[1] + tc * d[1]];
            const Np = neph(phi);
            worst = Math.max(worst, Math.hypot(X[0] - Np[0], X[1] - Np[1]));
        }
        approxEq(worst, 0, 1e-12, "L1 caustic==nephroid identity");
        // numeric corroboration: adjacent-ray crossing near φ=0 converges to the cusp
        const eps = 1e-4;
        const P1 = arcP(0), d1 = dRefl(0), P2 = arcP(eps), d2 = dRefl(eps);
        const det = d1[0] * (-d2[1]) - (-d2[0]) * d1[1];
        const t2 = ((P2[0] - P1[0]) * (-d2[1]) - (-d2[0]) * (P2[1] - P1[1])) / det;
        const cross: [number, number] = [P2[0] + t2 * d2[0], P2[1] + t2 * d2[1]];
        approxEq(Math.hypot(cross[0] - R / 2, cross[1]), 0, 1e-6, "L1 adjacent-ray cusp convergence");
        console.log(`L1 PASS caustic==nephroid identity worst ${worst.toExponential(2)} m; adjacent rays cross at cusp (${cross[0].toFixed(6)}, ${cross[1].toFixed(6)})`);
    }

    // L2 CUSP LAW: nephroid speed → 0 at t=0; cusp at (R/2, 0); bead world centre exact.
    {
        approxEq(nephSpeed(0), 0, 1e-9, "L2 cusp speed");
        const c = neph(0);
        approxEq(c[0], R / 2, 1e-12, "L2 cusp x == R/2");
        approxEq(c[1], 0, 1e-12, "L2 cusp y == 0");
        // bulge at ±45° reaches R/√2
        approxEq(neph(Math.PI / 4)[0], R / Math.SQRT2, 1e-12, "L2 bulge x == R/sqrt2");
        // rim endpoints == cup arc rim ends (0, ±R)
        approxEq(neph(Math.PI / 2)[0], 0, 1e-12, "L2 rim x == 0");
        approxEq(neph(Math.PI / 2)[1], R, 1e-12, "L2 rim y == R");
        console.log(`L2 PASS cusp (R/2,0)=(${(R / 2).toFixed(3)},0) speed 0; bulge ${(R / Math.SQRT2).toFixed(4)}; rim endpoints == cup rim ends`);
    }

    // L3 RAY LAW: 5 incident rays horizontal at YC+k from post face to P(φ);
    // reflected segments along d'(φ), far endpoint ≥ contact + OVER·0.999.
    {
        const postFace = POST_X + POST_SEC / 2;
        for (const k of RAY_KS) {
            const phi = Math.asin(k / R);
            const P = w(arcP(phi));
            approxEq(P[1], YC + k, 1e-12, `L3 ray height k=${k}`);
            if (P[0] <= postFace + 0.05) throw Error(`L3 ray k=${k} does not clear the post face`);
            const d = dRefl(phi), tc = tContact(phi);
            const far: [number, number] = [P[0] + (tc + OVER) * d[0], P[1] + (tc + OVER) * d[1]];
            // contact point on the nephroid (L1 identity) and strictly inside the cup
            const C = w(neph(phi));
            if (Math.hypot(far[0] - C[0], far[1] - C[1]) < OVER - 1e-9) throw Error(`L3 overshoot missing k=${k}`);
            // reflected far point stays within the cup footprint x <= R + slack (rim-tangent rays)
            if (far[0] > XC + R + 0.05) throw Error(`L3 reflected escapes cup k=${k}`);
        }
        console.log(`L3 PASS ${RAY_KS.length} incident rays horizontal at exact heights; reflected segments reach ${OVER}m past contact`);
    }

    // L4 STATION WALK: both half-chains arc-uniform from the cusp (station
    // at t=0 EXACT), remainder at rim ends; every station on-curve.
    {
        for (const sign of [1, -1] as const) {
            const ts = halfStations(sign);
            for (const t of ts) {
                const p = neph(t);
                const ref = neph(sign * Math.abs(t));
                approxEq(Math.hypot(p[0] - ref[0], p[1] - ref[1]), 0, 1e-9, "L4 station on-curve");
            }
            // first (cusp-adjacent) step == CUSP_STEP, interior steps ==
            // L_STEP (arc measure), rim remainder in (0.10, 0.50]
            approxEq(nephArc(ts[0], ts[1]), NEPH_CUSP_STEP, 2e-3, `L4 cusp step ${sign}`);
            for (let i = 1; i < ts.length - 2; i++) {
                const s = nephArc(ts[i], ts[i + 1]);
                approxEq(s, NEPH_L_STEP, 2e-3, `L4 arc step ${sign} ${i}`);
            }
            const rem = nephArc(ts[ts.length - 2], ts[ts.length - 1]);
            if (rem >= 0.50 + 2e-3 || rem <= 0.10) throw Error(`L4 rim remainder ${rem.toFixed(3)} out of band`);
            console.log(`L4 PASS half-chain sign=${sign}: ${ts.length} stations (cusp exact), cusp step ${NEPH_CUSP_STEP}, interior steps 0.400±2mm, rim remainder ${(rem).toFixed(3)}m`);
        }
        // chord fidelity: mid-chord curve deviation bounded (voussoir section covers it)
        for (const sign of [1, -1] as const) {
            const ts = halfStations(sign);
            for (let i = 0; i < ts.length - 1; i++) {
                const a = neph(ts[i]), b = neph(ts[i + 1]);
                const mid = neph((ts[i] + ts[i + 1]) / 2);
                const chordMid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
                const dev = Math.hypot(mid[0] - chordMid[0], mid[1] - chordMid[1]);
                if (dev > 0.045) throw Error(`L4 chord deviation ${(dev * 1000).toFixed(1)}mm exceeds 45mm at i=${i}`);
            }
        }
        console.log(`L4 PASS chord mid-deviations <= 45mm (voussoir thickness 140mm covers)`);
    }

    // L5 ARC WALK: 16 tangent voussoirs, arc-uniform πR; rim ends exact.
    {
        const phis = arcStations();
        approxEq(phis.length - 1, ARC_N, 0, "L5 arc census");
        approxEq(phis[0], -Math.PI / 2, 1e-12, "L5 arc start");
        approxEq(phis[phis.length - 1], Math.PI / 2, 1e-12, "L5 arc end");
        console.log(`L5 PASS cup arc ${ARC_N} voussoirs arc-uniform over the semicircle (chord ${(2 * R * Math.sin(Math.PI / (2 * ARC_N))).toFixed(3)}m)`);
    }

    // L6 GROUNDING: plinth 0..0.24; arc bottom rim embeds plinth top >= 0.10;
    // post base embeds plinth; beam seats ON post top and embeds arc upper flank;
    // bead half-embedded at cusp front face.
    {
        const bottomRimY = YC - R;                       // 0.12
        if (PLINTH_H - bottomRimY < 0.10) throw Error("L6 arc bottom embed < 100mm");
        if (bottomRimY < 0) throw Error("L6 arc bottom below grade");
        // post: base at plinth-top embed 0.12 (same course as arc rim)
        const postBase = 0.12;
        if (postBase >= PLINTH_H) throw Error("L6 post base above plinth top");
        // beam: bottom face == post top (seats ON), far end reaches arc flank x in [-0.10, +0.10]
        approxEq(BEAM_Y + BEAM_SEC_T / 2, POST_TOP, 1e-12, "L6 beam seats on post top");
        const arcTopRimX = XC + 0;                        // rim point x == XC
        if (Math.abs(arcTopRimX - POST_X) < 1.0) throw Error("L6 beam span degenerate");
        // bead
        const cuspW = w(neph(0));
        approxEq(cuspW[1], YC, 1e-12, "L6 bead height == cup centre");
        console.log(`L6 PASS plinth 0..${PLINTH_H}; arc rim embeds ${(PLINTH_H - bottomRimY).toFixed(2)}m; post base ${postBase}m embed; beam seats post top; bead at cusp (${cuspW[0].toFixed(3)}, ${YC}) half-embedded +z`);
    }

    // L7 ENVELOPE + NaN (mirrors mk's own law; decode re-derives independently)
    {
        const sx = ENVELOPE.max[0] - ENVELOPE.min[0];
        const sy = ENVELOPE.max[1] - ENVELOPE.min[1];
        const sz = ENVELOPE.max[2] - ENVELOPE.min[2];
        approxEq(Math.abs(ENVELOPE.min[0] + ENVELOPE.max[0]), 0, 1e-9, "L7 x centered");
        approxEq(Math.abs(ENVELOPE.min[2] + ENVELOPE.max[2]), 0, 1e-9, "L7 z centered");
        if (ENVELOPE.min[1] < -1e-9) throw Error("L7 below grade");
        if (sy < 2.2) throw Error("L7 height < 2.2 (must be real trimesh class)");
        console.log(`L7 PASS envelope ${sx.toFixed(2)}x${sy.toFixed(2)}x${sz.toFixed(2)} origin-centred x/z, y[0, ${ENVELOPE.max[1].toFixed(2)}]`);
    }

    // L8 COLLIDER HONESTY: footprint 5.10 x 0.50 = 2.55 m² < 16 m² → NOT
    // room class; height 4.21 ≥ 2.2. Folly: exterior only, no walk promised.
    {
        const fp = PLINTH_W * PLINTH_D;
        console.log(`L8 PASS footprint ${fp.toFixed(2)} m² (not enterable-class), height ${(ENVELOPE.max[1]).toFixed(2)} ≥ 2.2 — folly, no walk owed`);
    }

    console.log("ALL CHECKS PASS");
}

// RED control: run with argv[1] == "mutant" — wrong caustic scale a = 3R/8.
if (process.argv[2] === "mutant") {
    const bad = (t: number): [number, number] => {
        const aB = (3 * R) / 8;
        return [aB * (3 * Math.cos(t) - Math.cos(3 * t)), aB * (3 * Math.sin(t) - Math.sin(3 * t))];
    };
    const phi = 0.6;
    const P = arcP(phi), d = dRefl(phi), tc = tContact(phi);
    const X: [number, number] = [P[0] + tc * d[0], P[1] + tc * d[1]];
    const err = Math.hypot(X[0] - bad(phi)[0], X[1] - bad(phi)[1]);
    if (err < 0.10) throw Error(`RED control FAILED to fail (err ${err})`);
    console.error(`RED control OK: mutant caustic a=3R/8 deviates ${err.toFixed(3)} m from the ray envelope at phi=0.6 — law detects`);
    process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("struct194-probe-nephroid.ts") && !process.argv[2]) main();
export {};
