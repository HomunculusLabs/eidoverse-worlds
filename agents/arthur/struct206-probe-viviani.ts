// struct206-probe-viviani.ts — THE ONE CONTRACT for R11-27 VIVIANI'S CURVE:
// THE GLOBE, THE WINDOWS, AND THE SQUARE.
//
// FORM SELECTION (fresh grep, all ledgers + census 343): viviani 0/0/0 across
// STRUCTURES-PLAN.md + IMPROVEMENTS.md + IMPROVE-PLAN.md; census carries no
// nx-struct-viviani. Register: opens the SPHERICAL-CURVE branch — a space
// curve lying ON a sphere (no standing form is that: trefoil/borromean are
// free-space knots; lemniscateseat is a flat furniture eight — proximity
// disclosed). Kin-check fresh: cassini BARRED, lissajous artwalk-chartership,
// theodorus spiral-kin (struct-202 ledger). Viviani 1692: the curve posed as
// a DOME-WINDOW problem — this build closes the dome into a globe.
//
// THE THEOREMS CARVED (verified in the laws below before any build):
// 1. THE CURVE: intersection of sphere |P| = R with the tangent cylinder
//    (x−R/2)² + y² = (R/2)² (axis through the sphere center, ruling line
//    tangent at the node). Parametrization x = R/2(1+cos t), y = R/2 sin t,
//    z = ±R sin(t/2) — t ∈ [−2π, 2π] traces the full closed figure-eight.
// 2. THE EIGHT: it passes through BOTH poles (t = ±π) and crosses itself at
//    the node (R, 0, 0) (t = 0 and t = ±2π) — a figure-eight ON the sphere
//    dividing it into three regions (upper lobe, lower lobe, back) that all
//    meet at the node.
// 3. THE WINDOW: each lobe (the spherical region inside the cylinder, one
//    per hemisphere) has area EXACTLY R²(π − 2) — closed form; the pair =
//    the classical Viviani window 4R²(π/2 − 1) = 2R²(π−2).
// 4. THE QUADRABILITY (Viviani 1692): four such windows cut from a
//    hemisphere (cylinder axes horizontal, 90° apart) leave EXACTLY 4R² —
//    the square on the diameter. THE SQUARE carries this: the iron frame
//    circumscribing the sphere (side = 2R, inscribed circle = the great
//    circle) has area exactly 4R² = the quadrable remainder.
//
// WORLD FRAME (Math Avenue convention): sphere poles VERTICAL, node rotated
// +45° about world-Y to the front-right of the approach face; the iron
// square stays in the local z=0 plane facing the approach; its top/bottom
// sides kiss the sphere exactly AT the poles (the strap welds through the
// top rod there — designed, disclosed); its bottom side is socketed flush
// in the plinth top (a circumscribed square's bottom side sits exactly at
// the sphere's lowest point — it cannot ride proud; true to the physics).
// Sole night element: one warm bead at the node (s363 sole-bead law).
//
// Exports are consumed by assets/mkv3-viviani.ts (the build) and
// struct206-decode-viviani.ts (the audit). ROOT STAYS IDENTITY (struct-188
// law): all positions below are FINAL world-local coords.

// ---- constants -----------------------------------------------------------------------------------
export const S = 1.5;                       // sphere radius, metres (math R = 1, world R = S)
export const PLINTH_W = 3.40, PLINTH_H = 0.26, PLINTH_D = 3.40;   // square plinth (echoes the theorem's square)
export const PROUD = 0.02;                  // bottom-rod top face rides this far above the plinth top (inlay, no coplanar z-fight)
export const Y_C = S + PLINTH_H + PROUD;    // sphere center height = 1.78 (S pole welds on the proud inlaid channel)
export const THETA0 = -Math.PI / 4;         // node rotation about world-Y: node lands front-right (+45°)
export const TUBE = 0.05;                   // iron strap tube radius (centered ON the sphere surface — half-embedded strap)
export const ROD_T = 0.07;                  // iron square frame rod cross-section
export const BEAD_R = 0.07;                 // sole night bead radius (at the node)
export const N_STRAP = 400;                 // strap stations (arc-uniform, closed)

export const ENVELOPE = {
    min: [-PLINTH_W / 2, 0, -PLINTH_D / 2],
    max: [PLINTH_W / 2, Y_C + S + ROD_T, PLINTH_D / 2],
};

// ---- frames ---------------------------------------------------------------------------------------
// math: sphere at origin R=1, cylinder axis = math z (vertical), node (1,0,0), poles (0,0,±1).
// world: (mx,my,mz) -> (S·mx, S·mz, S·my) [math z -> world up], then RotY(THETA0), then +Y_C.
export function worldPt(mx: number, my: number, mz: number): [number, number, number] {
    const x = S * mx, y = S * mz, z = S * my;
    const c = Math.cos(THETA0), s = Math.sin(THETA0);
    return [x * c + z * s + 0, y + Y_C, -x * s + z * c + 0];
}
export function mathOf(wx: number, wy: number, wz: number): [number, number, number] {
    const c = Math.cos(-THETA0), s = Math.sin(-THETA0);
    const x = wx * c + wz * s, z = -wx * s + wz * c, y = wy - Y_C;
    return [x / S, z / S, y / S];
}

// ---- the curve ------------------------------------------------------------------------------------
export function curve(t: number): [number, number, number] {
    return [Math.cos(t) / 2 + 0.5, Math.sin(t) / 2, Math.sin(t / 2)];
}
export const curveWorld = (t: number): [number, number, number] => {
    const p = curve(t); return worldPt(p[0], p[1], p[2]);
};
// cylinder membership in MATH frame (unit): inside the tangent cylinder
export const insideCyl = (mx: number, my: number) =>
    (mx - 0.5) ** 2 + my * my <= 0.25 + 1e-9;

// named points (world)
export const NODE_W = worldPt(1, 0, 0);            // the eight's crossing (double point)
export const NPOLE_W = worldPt(0, 0, 1);           // apex — the strap welds through the top rod here
export const SPOLE_W = worldPt(0, 0, -1);          // seated 8cm into the plinth

// the four frame kiss points (world; frame in local z=0 plane, inner faces at in-plane distance S)
export const KISS_W: [number, number, number][] = [
    [S, Y_C, 0], [-S, Y_C, 0],        // side kisses — on bare stone (only the node crosses the equator)
    [0, Y_C + S, 0], [0, Y_C - S, 0], // top/bottom kisses == the poles (strap weld crossings, designed)
];
// frame rod volumes (world AABBs; rods overlap at corners to close the square)
export const HALF = S + ROD_T / 2;
export const RODS: { name: string; min: [number, number, number]; max: [number, number, number] }[] = [
    { name: "top", min: [-HALF, Y_C + S, -ROD_T / 2], max: [HALF, Y_C + S + ROD_T, ROD_T / 2] },
    { name: "bottom", min: [-HALF, Y_C - S - ROD_T, -ROD_T / 2], max: [HALF, Y_C - S, ROD_T / 2] },
    { name: "left", min: [-HALF, Y_C - S - ROD_T / 2, -ROD_T / 2], max: [-S, Y_C + S + ROD_T / 2, ROD_T / 2] },
    { name: "right", min: [S, Y_C - S - ROD_T / 2, -ROD_T / 2], max: [HALF, Y_C + S + ROD_T / 2, ROD_T / 2] },
];

// the spherical window domain (math frame): |λ| ≤ π/2, φ ∈ [0, φB(λ)] = upper lobe; φ ∈ [π−φB, π] = lower
export const phiB = (lam: number) => Math.asin(Math.cos(lam));
export const sphPt = (phi: number, lam: number): [number, number, number] =>
    [Math.sin(phi) * Math.cos(lam), Math.sin(phi) * Math.sin(lam), Math.cos(phi)];

// ---- closed forms ---------------------------------------------------------------------------------
export const LOBE_AREA = S * S * (Math.PI - 2);        // per lobe, world m² (exact)
export const WINDOW_AREA = 2 * LOBE_AREA;              // the classical window 4R²(π/2 − 1)
export const SQUARE_AREA = (2 * S) ** 2;               // 4R² — the circumscribing square AND the quadrable remainder

// ---- arc-length machinery (strap; no closed form — elliptic) ---------------------------------------
export function arcTable(n: number): { t: number[]; cum: number[]; total: number } {
    const t: number[] = [], cum: number[] = [];
    const speed = (u: number) => 0.5 * Math.sqrt(1 + Math.cos(u / 2) ** 2);   // |P'| on unit sphere
    let acc = 0;
    for (let i = 0; i <= n; i++) {
        t.push(-2 * Math.PI + (4 * Math.PI * i) / n);
        cum.push(acc);
        if (i < n) acc += speed(t[i]) * (4 * Math.PI / n);
    }
    return { t, cum, total: acc };
}

// ---- THE LAWS (run when executed directly) ---------------------------------------------------------
if (import.meta.main) {
    const fails: string[] = [];
    const check = (name: string, ok: boolean, detail = "") => {
        console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) fails.push(name);
    };

    // L1 ON BOTH SURFACES — 4001 stations, sphere residual + cylinder residual
    {
        let worstS = 0, worstC = 0;
        for (let i = 0; i <= 4000; i++) {
            const t = -2 * Math.PI + (4 * Math.PI * i) / 4000;
            const [x, y, z] = curve(t);
            worstS = Math.max(worstS, Math.abs(Math.hypot(x, y, z) - 1));
            worstC = Math.max(worstC, Math.abs((x - 0.5) ** 2 + y * y - 0.25));
        }
        check("L1 on-both-surfaces", worstS < 1e-12 && worstC < 1e-12,
            `sphere residual ${worstS.toExponential(2)}, cylinder residual ${worstC.toExponential(2)} over 4001 stations — the definition, machine-exact`);
    }

    // L2 THE EIGHT — node double point, both poles, loop separation, closure
    {
        const n0 = curve(0), n2 = curve(2 * Math.PI), nM = curve(-2 * Math.PI);
        const node = Math.max(Math.hypot(n0[0] - n2[0], n0[1] - n2[1], n0[2] - n2[2]),
            Math.hypot(n0[0] - nM[0], n0[1] - nM[1], n0[2] - nM[2]));
        const pn = curve(Math.PI), ps = curve(-Math.PI);
        const poles = Math.max(Math.abs(pn[0]), Math.abs(pn[1]), Math.hypot(pn[0], pn[1], pn[2] - 1),
            Math.abs(ps[0]), Math.abs(ps[1]), Math.hypot(ps[0], ps[1], ps[2] + 1));
        let upperOK = true, lowerOK = true, minSep = Infinity;
        const U: [number, number, number][] = [], L: [number, number, number][] = [];
        for (let i = 0; i <= 600; i++) {
            const tu = (2 * Math.PI * i) / 600, tl = -(2 * Math.PI * i) / 600;
            const pu = curve(tu), pl = curve(tl);
            if (pu[2] < -1e-12) upperOK = false;      // upper loop z ≥ 0
            if (pl[2] > 1e-12) lowerOK = false;       // lower loop z ≤ 0
            U.push(pu); L.push(pl);
        }
        for (const u of U) for (const l of L) {
            if (Math.hypot(u[0] - 1, u[1], u[2]) < 0.2) continue;      // node neighborhood excluded
            if (Math.hypot(l[0] - 1, l[1], l[2]) < 0.2) continue;
            minSep = Math.min(minSep, Math.hypot(u[0] - l[0], u[1] - l[1], u[2] - l[2]));
        }
        check("L2 the-eight", node < 1e-12 && poles < 1e-12 && upperOK && lowerOK && minSep > 0.1,
            `node double-point ${node.toExponential(2)}; poles on the axis ${poles.toExponential(2)}; upper z≥0 & lower z≤0; loops separate ${minSep.toFixed(3)} outside the 0.2 node ball — three regions meet only at the node`);
    }

    // L3 THE WINDOW — 2D quadrature over the exact lobe domain == closed form R²(π−2)
    // (self-caught: v1 used a conflated slab rule — dA=(1−cos b)/NP multiplied a
    // SUM of sinφ instead of the integral; correct midpoint Δφ = b/NP per λ slab)
    {
        const NL = 4000, NP = 400;                    // midpoint rule over (λ, φ)
        let area = 0;
        for (let i = 0; i < NL; i++) {
            const lam = -Math.PI / 2 + Math.PI * (i + 0.5) / NL;
            const b = phiB(lam), dPhi = b / NP, dLam = Math.PI / NL;
            for (let j = 0; j < NP; j++) {
                const phi = (j + 0.5) * dPhi;
                area += Math.sin(phi) * dPhi * dLam;
            }
        }
        area *= S * S;
        const rel = Math.abs(area - LOBE_AREA) / LOBE_AREA;
        check("L3 the-window", rel < 5e-5,
            `numeric lobe ${area.toFixed(6)} m² == closed form S²(π−2) ${LOBE_AREA.toFixed(6)} m², rel ${rel.toExponential(2)}; the pair = the classical window ${WINDOW_AREA.toFixed(4)} m² = 4R²(π/2−1)`);
    }

    // L4 THE QUADRABILITY — the honest antipodal form (self-caught twice).
    // A horizontal-axis cylinder's window ∩ hemisphere is the HALF-BOWTIE, area
    // (π−2)R² (z-symmetry of the full 2(π−2) bowtie — numeric confirms). TWO
    // ANTIPODAL cylinders (α, α+π) intersect only at the two perpendicular
    // equator points (measure zero — both require u²+z² ≤ u and ≤ −u), so the
    // union is EXACTLY 2(π−2)R² and the remainder 2πR² − 2(π−2)R² = 4R² —
    // THE SQUARE ON THE DIAMETER. The classical "four windows" = the four
    // teardrops of these two antipodal bowties, each (π−2)R²/2. Disclosed:
    // the naive 90°-spaced reading (α = 0/90/180/270°) OVERLAPS adjacently —
    // union 2.659R², remainder 3.624R², NOT quadrable — rejected.
    {
        const NL = 8000, NP = 1000;
        let unionUnit = 0, perWindow = 0;
        const inWin = (x: number, y: number, z: number, alpha: number) => {
            const u = x * Math.cos(alpha) + y * Math.sin(alpha);
            return u * u + z * z <= u + 1e-12;
        };
        for (let i = 0; i < NL; i++) {
            const lam = -Math.PI + 2 * Math.PI * (i + 0.5) / NL;
            for (let j = 0; j < NP; j++) {
                const phi = Math.PI * (j + 0.5) / NP;
                if (phi > Math.PI / 2) break;          // upper hemisphere only
                const dA = Math.sin(phi) * (Math.PI / NP) * (2 * Math.PI / NL);
                const x = Math.sin(phi) * Math.cos(lam), y = Math.sin(phi) * Math.sin(lam), z = Math.cos(phi);
                const a = inWin(x, y, z, 0), b = inWin(x, y, z, Math.PI);
                if (a) perWindow += dA;
                if (a || b) unionUnit += dA;
            }
        }
        const wRel = Math.abs(perWindow - (Math.PI - 2)) / (Math.PI - 2);
        const remainder = 2 * Math.PI - unionUnit;
        const relR = Math.abs(remainder - 4) / 4;      // claim: square on the diameter, unit sphere
        check("L4 the-quadrability", wRel < 5e-4 && relR < 5e-4,
            `half-bowtie ${perWindow.toFixed(5)} == (π−2) ${(Math.PI - 2).toFixed(5)} rel ${wRel.toExponential(2)}; union of two antipodal windows ${unionUnit.toFixed(5)}; hemisphere − union = ${remainder.toFixed(5)} == 4R² (the square on the diameter) rel ${relR.toExponential(2)} — four teardrops, quadrable, exact`);
    }

    // L5 THE STRAP TABLE — arc-uniform closed stations, no closed form needed (elliptic)
    {
        const { t, cum, total } = arcTable(N_STRAP);
        let maxStep = 0, mono = true;
        for (let i = 1; i < cum.length; i++) {
            if (cum[i] < cum[i - 1] - 1e-12) mono = false;
            maxStep = Math.max(maxStep, cum[i] - cum[i - 1]);
        }
        const first = curveWorld(t[0]), last = curveWorld(t[t.length - 1]);
        const closure = Math.hypot(first[0] - last[0], first[1] - last[1], first[2] - last[2]);
        const worldLen = total * S;
        check("L5 the-strap-table", mono && closure < 1e-9 && maxStep * S < 0.05,
            `arc table monotone, closure ${closure.toExponential(2)}, ${N_STRAP} stations max step ${(maxStep * S).toFixed(4)} m (world strap length ${worldLen.toFixed(3)} m — elliptic, numeric)`);
    }

    // L6 THE SQUARE — side 2S exact, kiss points ON the sphere, top kiss == N pole,
    // bottom side = proud inlaid channel (top face PROUD above the plinth top; the
    // S pole welds onto it), side rods' feet socketed into the plinth top
    {
        const sideOK = Math.abs(2 * S - 3.0) < 1e-12;
        let kissOK = true;
        for (const k of KISS_W) {
            if (Math.abs(Math.hypot(k[0], k[1] - Y_C, k[2]) - S) > 1e-9) kissOK = false;
        }
        const topIsPole = Math.hypot(KISS_W[2][0] - NPOLE_W[0], KISS_W[2][1] - NPOLE_W[1], KISS_W[2][2] - NPOLE_W[2]) < 1e-12;
        const chanTop = RODS[1].max[1];               // bottom rod top face
        const chanOK = Math.abs(chanTop - (PLINTH_H + PROUD)) < 1e-9 && chanTop > PLINTH_H;
        const spoleSeat = SPOLE_W[1];                  // == chanTop exactly (weld-on)
        const seatOK = Math.abs(spoleSeat - chanTop) < 1e-9;
        const sideFeet = Math.min(RODS[2].min[1], RODS[3].min[1]);   // side rod feet
        const feetOK = sideFeet >= PLINTH_H - 0.055 && sideFeet <= PLINTH_H + 1e-9;
        check("L6 the-square", sideOK && kissOK && topIsPole && chanOK && seatOK && feetOK,
            `side ${2 * S} m == the diameter; four kisses ON the sphere (±1e-9); top kiss IS the N pole (strap welds through the top rod — designed); bottom channel top face ${chanTop.toFixed(3)} m = plinth top + ${PROUD * 100}cm (proud inlay, no coplanar face); S pole welds on the channel (${spoleSeat.toFixed(3)}); side feet socketed at ${sideFeet.toFixed(3)} (≤5cm into the plinth); area ${(2 * S) ** 2} m² == the quadrable remainder 4R²`);
    }

    // L7 SEAT + ENVELOPE + FOLLY CLASS
    {
        const seatOK = Math.abs(SPOLE_W[1] - (PLINTH_H + PROUD)) < 1e-9 && SPOLE_W[1] > 0;
        const height = ENVELOPE.max[1];
        const footprint = PLINTH_W * PLINTH_D;
        check("L7 seat-envelope-folly", seatOK && height >= 2.2 && footprint < 16,
            `south pole ${SPOLE_W[1].toFixed(3)} m welds onto the proud channel (plinth top + ${PROUD * 100}cm); envelope ${ENVELOPE.max[0] * 2}x${height.toFixed(3)}x${ENVELOPE.max[2] * 2}; plinth footprint ${footprint.toFixed(2)} m² < 16 — FOLLY CLASS, no walk owed`);
    }

    // RED CONTROL — mutant cylinder on the wrong side: the law must DETECT (fail to pass L1 against it)
    {
        const mutantInside = (p: [number, number, number]) => (p[0] + 0.5) ** 2 + p[1] * p[1] <= 0.25;
        let onMutant = 0;
        for (let i = 0; i <= 4000; i++) {
            const t = -2 * Math.PI + (4 * Math.PI * i) / 4000;
            const p = curve(t);
            if (Math.abs((p[0] + 0.5) ** 2 + p[1] * p[1] - 0.25) < 1e-6) onMutant++;
        }
        check("RED mutant-cylinder-detects", onMutant < 100,
            `sign-flipped cylinder: only ${onMutant}/4001 stations on it (isolated crossings) — the on-both-surfaces law FAILS against the mutant, as it must`);
    }

    if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
    console.log("ALL PASS");
}
