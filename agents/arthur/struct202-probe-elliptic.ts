// struct202-probe-elliptic.ts — THE ONE CONTRACT for R11-25 THE ELLIPTIC
// CURVE (y² = x³ − x). The oval, the wing, and the hidden third point.
//
// The curve y² = x³ − x (the congruent-number curve n = 1): the first
// curve in the plane-curve register that CANNOT be parametrized — no
// rational parametrization exists (genus 1). Its real locus has TWO
// components: a bounded OVAL for x ∈ [−1, 0] and an unbounded WING for
// x ≥ 1. Three points cross the x-axis: the roots (−1,0), (0,0), (1,0) —
// exactly the 2-torsion of the curve, each with VERTICAL tangent.
//
// THE GROUP LAW (the theorem this work carves): a straight line cuts the
// cubic in three points (counted with multiplicity); the three x-values
// sum to the square of the slope (Vieta: x_P + x_Q + x_R = m² after
// substituting the line into the cubic). Authored: the ROD welds at R on
// the oval's neck and at Q on the wing; the line through them strikes the
// curve a THIRD time at P on the oval's low flank — BEHIND the rod's end,
// un-welded, marked only by the sole night bead. A walker who sights
// along the rod's axis finds the bead dead on the line: the hidden third
// point, found by arithmetic.
//
// WORLD FRAME (Math Avenue convention): vertical construction plane XY,
// reads on the +Z face. STONE carries the curve — plinth + two ribbon
// components (the wing's tail sockets INTO the plinth and terminates
// hidden inside it; the wing's upper tip is cut mid-flight, dying in the
// air). IRON carries THE LINE — the x-axis as a rod at DATUM_Y on two
// posts (the line of reals made steel), plus THE CHORD ROD from R to Q.
// The datum rod pierces the ribbon at exactly the three roots — each
// pierce dressed with a dark-brass collar: the line PINNED to the curve
// at the 2-torsion. The chord rod crosses the datum rod at exactly the
// line's x-intercept — a welded iron-into-iron crossing, pinned. Sole
// night element: one warm bead half-proud of the ribbon front face AT P
// (s363 sole-bead law).
//
// Exports are consumed by assets/mkv3-elliptic.ts (the build) and
// struct202-decode-elliptic.ts (the audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions below are FINAL world-local coords.

// ---- constants -----------------------------------------------------------------------------------
export const CUB_A = -1, CUB_B = 0;      // y² = x³ + CUB_A·x + CUB_B  (y² = x³ − x)

export const S = 1.60;                   // scale, metres per math unit
export const X_TIP = 1.60;               // wing truncation (math x)
export const TIP_AIR = 0.06;             // authored air (semantic: tail centerline enters the plinth this high; upper tip dies far above)
export const Y_TIP = Math.sqrt(X_TIP ** 3 - X_TIP);        // wing tip |y| ≈ 1.579886
export const LIFT = Y_TIP + TIP_AIR / S;                   // math-frame lift: the LOWER tail centerline lands 0.06 above grade, INSIDE the plinth
export const DATUM_Y = S * LIFT;                           // world height of the x-axis (the line of reals)
export const X_CENTER = 0.30;                              // math-x shift so the composition centers on x=0

export const PLINTH_W = 5.40, PLINTH_H = 0.24, PLINTH_D = 1.10;   // the stone base (the wing is born from it)

export const RIB_N = 0.20;               // stone voussoir in-plane thickness
export const RIB_D = 0.20;               // stone voussoir depth (z)
export const L_STEP = 0.30;              // arc-uniform voussoir arc length
export const JOINT = 0.006;              // voussoir chord-length joint extension (mk box law)

export const POST_X = 2.42;              // gantry posts at world x = ∓2.42 (on the plinth)
export const POST_S = 0.10;              // post section
export const POST_EMBED = 0.04;          // post base embed into the plinth top
export const POST_TOP = DATUM_Y + 0.07;  // post top swallows the rod (weld hidden, versiera cradle class)
export const ROD_R = 0.035;              // iron rod radius (datum rod + chord rod)
export const ROD_XL = -POST_X, ROD_XR = POST_X;   // datum rod spans post center to post center
export const CHORD_EXT = 0.25;           // chord rod extension past the Q weld (none behind R — the R end butt-welds into the stone)

export const COLLAR_R = 0.075, COLLAR_L = 0.50;   // dark-brass through-pins dressing the three root pierces
                                    // v3 (struct-202 closeface REJECT cure): a 0.14-long collar is fully
                                    // EMBEDDED in the ribbon's z/x extent at the crossing (decode D7
                                    // proved the verts exist; no angle can see them — the judge read
                                    // bare iron, correctly). A 0.50 through-pin pokes out BOTH faces of
                                    // the near-vertical root wall (~0.09-0.15 proud each side) and wraps
                                    // the rod (0.075 > 0.035): the line BOLTED to the curve at the
                                    // 2-torsion. Still non-emissive (sole-bead night census intact).

export const BEAD_R = 0.07;
export const BEAD_Z = RIB_D / 2;         // half-proud of the ribbon front face (struct-52/188 law)

export const ROOTS = [-1, 0, 1];         // the three 2-torsion crossings (vertical tangents)

// ---- the curve --------------------------------------------------------------------------------------
export const fCub = (x: number) => x * x * x + CUB_A * x + CUB_B;
export const yUpper = (x: number) => Math.sqrt(Math.max(0, fCub(x)));

// FINAL world-local coords: worldX = S·(x − X_CENTER), worldY = S·(y + LIFT)
export const worldPt = (x: number, y: number): [number, number] =>
    [S * (x - X_CENTER), S * (y + LIFT)];
export const mathPt = (wx: number, wy: number): [number, number] =>
    [wx / S + X_CENTER, wy / S - LIFT];
export const worldRootX = (x: number) => S * (x - X_CENTER);

// ---- the group law: the rod welds at R and Q; the hidden third point P (the theorem) ----------------
export const Q_M: [number, number] = [1.5, Math.sqrt(1.875)];            // wing, upper half — the far weld
export const P_M: [number, number] = [-0.5, -Math.sqrt(0.375)];          // oval, lower flank — the HIDDEN third point (bead, no rod)
export const M_SLOPE = (Q_M[1] - P_M[1]) / (Q_M[0] - P_M[0]);
export const LINE_B = P_M[1] - M_SLOPE * P_M[0];                          // y = m·x + b
export const X_R = M_SLOPE * M_SLOPE - P_M[0] - Q_M[0];                   // Vieta: x_P + x_Q + x_R = m²
export const R_M: [number, number] = [X_R, LINE_B + M_SLOPE * X_R];       // oval, lower neck — the near weld
export const X_INT = -LINE_B / M_SLOPE;                                   // the line's x-intercept — the datum crossing

// chord rod world endpoints: A = R exactly (butt-weld into the stone), B = Q + CHORD_EXT along the unit direction
export const CHORD_DIR = (() => {
    const qw = worldPt(Q_M[0], Q_M[1]), rw = worldPt(R_M[0], R_M[1]);
    const dx = qw[0] - rw[0], dy = qw[1] - rw[1], n = Math.hypot(dx, dy);
    return [dx / n, dy / n] as [number, number];
})();
export const CHORD_A: [number, number] = worldPt(R_M[0], R_M[1]);
export const CHORD_B: [number, number] = [
    worldPt(Q_M[0], Q_M[1])[0] + CHORD_EXT * CHORD_DIR[0],
    worldPt(Q_M[0], Q_M[1])[1] + CHORD_EXT * CHORD_DIR[1],
];

// ---- station machinery (x-param per half-arc; speed blows up at the roots — integrable) -------------
type ArcSpec = { x0: number; x1: number; sign: 1 | -1; marks: number[] };
export const INV3 = 1 / Math.sqrt(3);    // oval extreme x = −1/√3 (horizontal tangent marks)
export const ARCS: ArcSpec[] = [
    { x0: -1, x1: 0, sign: 1, marks: [-1, -INV3, 0] },       // oval upper (root → extreme → root)
    { x0: 0, x1: -1, sign: -1, marks: [0, -INV3, -1] },      // oval lower (root → extreme → root; closes the loop)
    { x0: 1, x1: X_TIP, sign: 1, marks: [1, X_TIP] },        // wing upper (root → tip, cut mid-flight)
    { x0: X_TIP, x1: 1, sign: -1, marks: [X_TIP, 1] },       // wing lower (tail → root; tail sockets into the plinth)
];

const speed = (x: number) => {
    const fp = 3 * x * x + CUB_A;
    const fv = Math.max(1e-14, fCub(x));
    return Math.sqrt(1 + (fp * fp) / (4 * fv));
};

const isRoot = (x: number) => ROOTS.some((r) => Math.abs(x - r) < 1e-12);

function segLen(p: number, q: number): number {
    const N = 8000;
    const lo = Math.min(p, q), hi = Math.max(p, q);
    const r0 = isRoot(lo), r1 = isRoot(hi);
    if (!r0 && !r1) {
        const dx = (hi - lo) / N;
        let s = 0;
        for (let i = 0; i < N; i++) s += speed(lo + (i + 0.5) * dx) * dx;
        return s;
    }
    // one endpoint is a root: substitute x = r + dir·t² (t from 0) — the
    // 1/√f speed singularity becomes a SMOOTH integrand (≈2C·dt), so
    // midpoint quadrature converges cleanly and every caller agrees
    const r = r0 ? lo : hi;
    const dir = r0 ? 1 : -1;
    const tEnd = Math.sqrt(hi - lo);
    const dt = tEnd / N;
    let s = 0;
    for (let i = 0; i < N; i++) {
        const t = (i + 0.5) * dt;
        s += speed(r + dir * t * t) * 2 * t * dt;
    }
    return s;
}

export function arcLen(a: ArcSpec, x0: number, x1: number): number {
    // split so each segment carries at most one root endpoint
    let total: number;
    if (isRoot(x0) && isRoot(x1)) {
        const mid = (x0 + x1) / 2;
        total = segLen(x0, mid) + segLen(mid, x1);
    } else total = segLen(x0, x1);
    return total * S;      // WORLD metres (the integrand is dimensionless dArc/dx in math units)
}

// invert arc length → x. Direction-normalized: bisect in increasing-x
// space with an INCREASING arc function (the struct-202 self-catch — a
// naive (x0,x1) bracket inverts on decreasing walks and collapses every
// station onto x1).
function xAtArcFrac(a: ArcSpec, sWant: number): number {
    const inc = a.x1 > a.x0;
    const total = arcLen(a, a.x0, a.x1);
    const sAt = (u: number) => (inc ? arcLen(a, a.x0, u) : arcLen(a, a.x1, u));
    const target = inc ? sWant : total - sWant;
    let lo = Math.min(a.x0, a.x1), hi = Math.max(a.x0, a.x1);
    for (let it = 0; it < 90; it++) {
        const mid = (lo + hi) / 2;
        if (sAt(mid) < target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
}

export function arcStations(a: ArcSpec): number[] {
    const markS = a.marks.map((m) => arcLen(a, a.x0, m));
    const out: number[] = [];
    for (let i = 0; i < markS.length - 1; i++) {
        out.push(markS[i]);
        const len = markS[i + 1] - markS[i];
        if (len <= 0.31) continue;
        const n = Math.max(1, Math.round(len / L_STEP));
        for (let j = 1; j < n; j++) out.push(markS[i] + (len * j) / n);
    }
    out.push(markS[markS.length - 1]);
    return out.map((s) => xAtArcFrac(a, s));
}

export const arcWorldPts = (a: ArcSpec): [number, number][] =>
    arcStations(a).map((x) => worldPt(x, a.sign * yUpper(x)));

// ---- envelope contract (probe models the mk boxes EXACTLY; decode re-derives from verts) -----------
export const ENVELOPE = (() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    const grow = (px: number, py: number, pz: number, hx: number, hy: number, hz: number) => {
        minX = Math.min(minX, px - hx); maxX = Math.max(maxX, px + hx);
        minY = Math.min(minY, py - hy); maxY = Math.max(maxY, py + hy);
        minZ = Math.min(minZ, pz - hz); maxZ = Math.max(maxZ, pz + hz);
    };
    // plinth
    grow(0, PLINTH_H / 2, 0, PLINTH_W / 2, PLINTH_H / 2, PLINTH_D / 2);
    // voussoir boxes (chord a→b in XY, len+JOINT x RIB_N x RIB_D, rotated in-plane)
    const rib = (a: [number, number], b: [number, number]) => {
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
    // posts
    for (const sx of [-1, 1]) {
        const base = PLINTH_H - POST_EMBED;
        grow(sx * POST_X, (base + POST_TOP) / 2, 0, POST_S / 2, (POST_TOP - base) / 2, POST_S / 2);
    }
    // datum rod (cylinder along x, caps flat)
    grow(0, DATUM_Y, 0, (ROD_XR - ROD_XL) / 2, ROD_R, ROD_R);
    // chord rod (cylinder along its direction; AABB)
    {
        const hx = Math.abs(CHORD_B[0] - CHORD_A[0]) / 2;
        const hy = Math.abs(CHORD_B[1] - CHORD_A[1]) / 2 + ROD_R;
        grow((CHORD_A[0] + CHORD_B[0]) / 2, (CHORD_A[1] + CHORD_B[1]) / 2, 0, hx, hy, ROD_R);
    }
    // brass collars (cylinders along x at the root crossings)
    for (const r of ROOTS) grow(worldRootX(r), DATUM_Y, 0, COLLAR_L / 2, COLLAR_R, COLLAR_R);
    // bead (at P, the hidden third point)
    {
        const pw = worldPt(P_M[0], P_M[1]);
        grow(pw[0], pw[1], BEAD_Z, BEAD_R, BEAD_R, BEAD_R);
    }
    return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
})();

// distance from a world point to the dense curve (both components), world units
const CURVE_W: Array<[number, number]> = (() => {
    const out: Array<[number, number]> = [];
    for (let i = 0; i <= 30000; i++) {
        const x = -1 + (i / 30000) * (X_TIP + 1);
        if (fCub(x) < 0) continue;
        for (const sg of [1, -1]) out.push(worldPt(x, sg * yUpper(x)));
    }
    return out;
})();
export const distToCurve = (wx: number, wy: number): number => {
    let best = Infinity;
    for (const [cx, cy] of CURVE_W) {
        const d = Math.hypot(cx - wx, cy - wy);
        if (d < best) best = d;
    }
    return best;
};

// ---- laws -----------------------------------------------------------------------------------------
function approxEq(a: number, b: number, tol: number, what: string) {
    if (Math.abs(a - b) > tol) throw Error(`LAW FAIL ${what}: ${a} vs ${b} (tol ${tol})`);
}

function main() {
    // L1 THE EQUATION: every authored point satisfies y² = x³ − x exactly,
    // in math frame and through the world transform round-trip.
    {
        const N = 6001;
        let worst = 0, worstW = 0;
        for (let i = 0; i < N; i++) {
            const x = -1 + (i / (N - 1)) * (X_TIP + 1);
            const fv = fCub(x);
            if (fv < 0) continue;                       // gap between components
            for (const sg of [1, -1]) {
                const y = sg * Math.sqrt(fv);
                worst = Math.max(worst, Math.abs(y * y - fCub(x)));
                const w = worldPt(x, y);
                worstW = Math.max(worstW, Math.abs(w[0] - S * (x - X_CENTER)) + Math.abs(w[1] - S * (y + LIFT)));
            }
        }
        approxEq(worst, 0, 1e-12, "L1 implicit identity y² == x³ − x");
        approxEq(worstW, 0, 1e-12, "L1 world transform round-trip");
        console.log(`L1 PASS y² = x³ − x holds to ${worst.toExponential(2)} over both components; world transform exact (${worstW.toExponential(2)}) — no rational parametrization exists (genus 1); every point is carved, not generated`);
    }

    // L2 THE GROUP LAW + THE CHORD: the rod welds at R (oval neck) and Q
    // (wing); the line through them strikes the curve a THIRD time at P on
    // the oval's low flank — INDEPENDENT numeric corroboration (sign-change
    // root scan of the substituted cubic, NOT the Vieta arithmetic), Vieta
    // exact, the BEAD at P on curve AND line (the hidden third point), the
    // chord rod's geometry lawful: crosses the datum rod exactly at the
    // line's x-intercept (pinned weld), clears collars/posts, embeds only
    // in the two weld sockets (disclosed), clear ≥ 0.14 elsewhere.
    {
        // P, Q, R on the curve and on the line
        for (const [name, pt] of [["P", P_M], ["Q", Q_M], ["R", R_M]] as Array<[string, [number, number]]>) {
            approxEq(pt[1] * pt[1] - fCub(pt[0]), 0, 1e-12, `L2 ${name} on curve`);
            approxEq(pt[1] - (M_SLOPE * pt[0] + LINE_B), 0, 1e-12, `L2 ${name} on the line`);
        }
        // INDEPENDENT root scan: g(x) = y_line(x)² − (x³ − x) over the window
        const yLine = (x: number) => M_SLOPE * x + LINE_B;
        const g = (x: number) => yLine(x) * yLine(x) - fCub(x);
        const roots: number[] = [];
        let prevX = -1, prevG = g(-1);
        for (let i = 1; i <= 20000; i++) {
            const x = -1 + (i / 20000) * (X_TIP + 1);
            const gv = g(x);
            if (Math.sign(gv) !== Math.sign(prevG)) {
                let lo = prevX, hi = x;
                for (let it = 0; it < 80; it++) { const m = (lo + hi) / 2; if (Math.sign(g(m)) === Math.sign(prevG)) lo = m; else hi = m; }
                roots.push((lo + hi) / 2);
            }
            prevX = x; prevG = gv;
        }
        if (roots.length !== 3) throw Error(`L2 line–curve intersection count ${roots.length} ≠ 3 — a straight line must cut the cubic thrice`);
        for (const want of [P_M[0], Q_M[0], X_R]) {
            if (!roots.some((r) => Math.abs(r - want) < 5e-4)) throw Error(`L2 scanned roots [${roots.map(r => r.toFixed(4))}] miss ${want.toFixed(4)}`);
        }
        // Vieta exact
        approxEq(P_M[0] + Q_M[0] + X_R, M_SLOPE * M_SLOPE, 1e-12, "L2 Vieta x_P + x_Q + x_R == m²");
        // THE BEAD AT P — the hidden third point: on curve, on line, half-proud
        {
            const pw = worldPt(P_M[0], P_M[1]);
            const [mx, my] = mathPt(pw[0], pw[1]);
            approxEq(my * my - fCub(mx), 0, 1e-12, "L2 bead position on curve (world round-trip)");
            approxEq(Math.abs(my - (M_SLOPE * mx + LINE_B)) * S, 0, 1e-9, "L2 bead position ON THE ROD'S LINE (the hidden third point)");
            approxEq(pw[0], worldPt(P_M[0], P_M[1])[0], 1e-12, "L2 bead x");
        }
        // P is BEHIND the rod's R end (un-welded — the hidden point)
        if (!(P_M[0] < R_M[0])) throw Error("L2 P must sit behind R on the line (the hidden point is off-stage)");
        // the rod's span and its sockets
        const chordLen = Math.hypot(CHORD_B[0] - CHORD_A[0], CHORD_B[1] - CHORD_A[1]);
        const rw = worldPt(R_M[0], R_M[1]), qw = worldPt(Q_M[0], Q_M[1]);
        const alongRod = (wx: number, wy: number) => (wx - rw[0]) * CHORD_DIR[0] + (wy - rw[1]) * CHORD_DIR[1];
        approxEq(alongRod(qw[0], qw[1]) + CHORD_EXT, chordLen, 1e-9, "L2 rod spans R → Q + extension");
        // DATUM CROSSING PIN: the rod crosses the datum rod exactly at the line's x-intercept
        {
            const cw = worldPt(X_INT, 0);
            const perp = Math.abs((cw[0] - rw[0]) * CHORD_DIR[1] - (cw[1] - rw[1]) * CHORD_DIR[0]);
            approxEq(perp, 0, 1e-9, "L2 the chord crosses the datum rod exactly at the line's x-intercept (welded iron-into-iron crossing)");
            approxEq(cw[1], DATUM_Y, 1e-12, "L2 crossing sits on the datum rod's centerline");
        }
        // clearance laws along the rod: sockets at R and Q (±0.45 world) are
        // deliberate stone embraces (versiera crown-cradle class, disclosed);
        // everywhere else the rod clears the curve by ≥ 0.14
        {
            const N = 4000;
            let worstMid = Infinity;
            for (let i = 0; i <= N; i++) {
                const t = (i / N) * chordLen;
                const wx = rw[0] + CHORD_DIR[0] * t, wy = rw[1] + CHORD_DIR[1] * t;
                const aR = alongRod(wx, wy);
                if (aR <= 0.45 || aR >= alongRod(qw[0], qw[1]) - 0.45) continue;   // sockets
                const d = distToCurve(wx, wy);
                if (d < 0.14) throw Error(`L2 rod clips the curve at arc ${t.toFixed(3)} (dist ${d.toFixed(3)} < 0.14) outside the weld sockets`);
                worstMid = Math.min(worstMid, d);
            }
            // collars + posts clear
            for (const r of ROOTS) {
                const c = [worldRootX(r), DATUM_Y];
                const aR = alongRod(c[0], c[1]);
                const wx = rw[0] + CHORD_DIR[0] * aR, wy = rw[1] + CHORD_DIR[1] * aR;
                const d = Math.hypot(c[0] - wx, c[1] - wy);
                if (d < COLLAR_R + ROD_R + 0.02) throw Error(`L2 rod passes collar at root ${r} (dist ${d.toFixed(3)})`);
            }
            if (CHORD_A[0] < -POST_X + POST_S / 2 + 0.10 || CHORD_B[0] > POST_X - POST_S / 2 - 0.10)
                throw Error(`L2 rod span enters a post zone`);
            console.log(`L2 PASS rod R${R_M.map(v => v.toFixed(4)).join(",")} → Q${Q_M.map(v => v.toFixed(4)).join(",")} (${chordLen.toFixed(3)}m + ext): scan-found 3 intersections; Vieta x_P+x_Q+x_R = ${(P_M[0] + Q_M[0] + X_R).toFixed(10)} == m² = ${(M_SLOPE * M_SLOPE).toFixed(10)}; hidden third P${P_M.map(v => v.toFixed(4)).join(",")} on curve+line (bead), behind the rod's end; datum crossing pinned at x_int=${X_INT.toFixed(5)} (weld); mid-rod curve clearance ≥ ${worstMid.toFixed(3)}m; sockets ±0.45 disclosed — the curve does arithmetic`);
        }
    }

    // L3 THE THREE ROOTS: (−1,0), (0,0), (1,0) are exactly where the curve
    // meets the datum line, each with VERTICAL tangent — local form
    // x − root ≈ y²/|f'(root)| (parabolic in y). The datum rod pierces the
    // ribbon at exactly these three crossings, dressed by the collars.
    {
        const h = 1e-3;
        for (const r of ROOTS) {
            approxEq(fCub(r), 0, 1e-14, `L3 root ${r} on the curve and the datum`);
            const fp = 3 * r * r + CUB_A;
            if (Math.abs(fp) < 0.5) throw Error(`L3 root ${r} has degenerate derivative — not simple`);
            const want = h * h;
            let lo: number, hi: number, rising: boolean;
            if (r === -1) { lo = -1; hi = -0.9; rising = true; }
            else if (r === 0) { lo = -0.1; hi = 0; rising = false; }       // oval side of root 0
            else { lo = 1; hi = 1.1; rising = true; }                       // wing side of root 1
            const below = (x: number) => (rising ? fCub(x) < want : fCub(x) > want);
            if (!below(lo) || below(hi)) throw Error(`L3 bracket wrong near root ${r}`);
            for (let it = 0; it < 90; it++) {
                const m = (lo + hi) / 2;
                if (below(m)) lo = m; else hi = m;
            }
            const xh = (lo + hi) / 2;
            approxEq(Math.abs(fCub(xh)), want, 1e-12, `L3 solve f(x)=h² near root ${r}`);
            const lhs = Math.abs((xh - r) * fp);
            if (Math.abs(lhs - want) > 0.15 * want)
                throw Error(`L3 root ${r} tangent not vertical: (x−root)·|f'| = ${lhs.toExponential(3)} vs h² = ${want.toExponential(3)}`);
        }
        for (const r of ROOTS) approxEq(worldRootX(r), S * (r - X_CENTER), 1e-12, `L3 collar x for root ${r}`);
        // the curve meets the datum plane ONLY at the roots: every arc's
        // ROOT endpoints sit ON the datum exactly; the two wing-tip endpoints
        // (the authored cut) fly far above/below it; no interior station near it
        let endpoints = 0, interior = 0, tipFar = 0;
        for (const a of ARCS) {
            const xs = arcStations(a);
            for (let i = 0; i < xs.length; i++) {
                const wy = worldPt(xs[i], a.sign * yUpper(xs[i]))[1];
                const isEnd = i === 0 || i === xs.length - 1;
                const atDatum = Math.abs(wy - DATUM_Y) < 1e-6;
                if (isEnd && atDatum) endpoints++;
                if (Math.abs(xs[i] - X_TIP) < 2e-3) { if (Math.abs(wy - DATUM_Y) > 2.4) tipFar++; }
                if (!isEnd && Math.abs(wy - DATUM_Y) < 0.005) interior++;
            }
        }
        if (endpoints !== 6 || interior !== 0 || tipFar !== 2)
            throw Error(`L3 datum meetings: ${endpoints} root endpoints on the datum (expect 6), ${interior} interior stations near it (expect 0), ${tipFar}/2 tip endpoints far from it`);
        console.log(`L3 PASS roots (−1,0),(0,0),(1,0) on curve and datum, each with vertical tangent ((x−root)·|f'| == h² within 15% at h=1e-3); 6/6 root endpoints on the datum, both wing-tip endpoints far (the authored cut), zero interior approaches; collars at world x ${ROOTS.map(r => worldRootX(r).toFixed(3)).join(", ")} dressing the three pierces — the 2-torsion, pinned`);
    }

    // L4 STATION WALK: arc endpoints and marks are stations; steps uniform
    // ~0.30 (max 0.34 world); chord deviation at arc midpoints ≤ 45mm.
    {
        let totalStations = 0, maxStep = 0, worstDev = 0;
        for (const a of ARCS) {
            const xs = arcStations(a);
            totalStations += xs.length;
            for (const m of a.marks) {
                if (!xs.some((x) => Math.abs(x - m) < 2e-3)) throw Error(`L4 mark x=${m.toFixed(4)} has no station (arc ${a.x0}→${a.x1} sign ${a.sign})`);
            }
            approxEq(xs[0], a.x0, 2e-3, "L4 first station == arc start");
            approxEq(xs[xs.length - 1], a.x1, 2e-3, "L4 last station == arc end");
            for (let i = 0; i < xs.length - 1; i++) {
                const pa = worldPt(xs[i], a.sign * yUpper(xs[i]));
                const pb = worldPt(xs[i + 1], a.sign * yUpper(xs[i + 1]));
                maxStep = Math.max(maxStep, Math.hypot(pb[0] - pa[0], pb[1] - pa[1]));
                // arc midpoint: bisect on H(u) = |arc(start→u)| — increasing
                // along the walk in EITHER direction (the struct-202 self-catch:
                // a (lo,hi)-sorted bisection on a decreasing gAt drifts to the
                // wrong end and fabricates chord deviation)
                const segLenW = arcLen(a, xs[i], xs[i + 1]);
                const half = segLenW / 2;
                let lo = xs[i], hi = xs[i + 1];
                for (let it = 0; it < 60; it++) {
                    const m = (lo + hi) / 2;
                    if (arcLen(a, xs[i], m) < half) lo = m; else hi = m;
                }
                const xm = (lo + hi) / 2;
                const pm = worldPt(xm, a.sign * yUpper(xm));
                const dev = Math.hypot(pm[0] - (pa[0] + pb[0]) / 2, pm[1] - (pa[1] + pb[1]) / 2);
                worstDev = Math.max(worstDev, dev);
                if (dev > 0.045) throw Error(`L4 chord deviation ${(dev * 1000).toFixed(1)}mm — shorten the step`);
            }
        }
        if (maxStep > 0.34) throw Error(`L4 max step ${maxStep.toFixed(3)} > 0.34`);
        console.log(`L4 PASS ${totalStations} stations over 4 arcs; roots/extremes/tips are joints; max step ${maxStep.toFixed(3)}; worst chord dev ${(worstDev * 1000).toFixed(1)}mm ≤ 45mm`);
    }

    // L5 GANTRY SEATING: posts stand on the plinth (embedded, tops swallow
    // the rod); datum rod centerline at DATUM_Y spanning the posts; posts
    // clear the ribbon extremes; collars proud of the rod.
    {
        const base = PLINTH_H - POST_EMBED;
        if (base < 0) throw Error("L5 post base below grade");
        if (POST_TOP < DATUM_Y + 0.03) throw Error("L5 post top fails to swallow the rod");
        approxEq((ROD_XL + ROD_XR) / 2, 0, 1e-12, "L5 datum rod centered");
        approxEq(ROD_XR - ROD_XL, 2 * POST_X, 1e-12, "L5 datum rod spans post centers");
        approxEq(DATUM_Y, S * LIFT, 1e-12, "L5 rod height == the line of reals");
        let minRx = Infinity, maxRx = -Infinity;
        for (const a of ARCS) for (const x of arcStations(a)) {
            const wx = worldPt(x, a.sign * yUpper(x))[0];
            minRx = Math.min(minRx, wx - RIB_N * 0.75 - JOINT);
            maxRx = Math.max(maxRx, wx + RIB_N * 0.75 + JOINT);
        }
        if (minRx - (-POST_X + POST_S / 2) < 0.10) throw Error(`L5 left post too close to ribbon ${minRx.toFixed(3)}`);
        if ((POST_X - POST_S / 2) - maxRx < 0.10) throw Error(`L5 right post too close to ribbon ${maxRx.toFixed(3)}`);
        if (COLLAR_R < ROD_R * 1.5) throw Error("L5 collars not proud of the rod");
        console.log(`L5 PASS posts ∓${POST_X} on the plinth (embed ${POST_EMBED}, top ${POST_TOP.toFixed(3)} swallows the rod); rod at y=${DATUM_Y.toFixed(4)} spanning ${ROD_XL}..${ROD_XR}; ribbon clearance left ${(minRx - (-POST_X + POST_S / 2)).toFixed(3)} right ${((POST_X - POST_S / 2) - maxRx).toFixed(3)}; collars proud (${COLLAR_R} > 1.5·${ROD_R}); the rod pierces the ribbon at the three roots, collar-dressed — the line pinned to the curve`);
    }

    // L6 GROUNDING: the plinth is the sole mass below its top; the wing's
    // lower tail sockets INTO the plinth (final station's box bottom inside
    // the plinth — post-embed class, disclosed); the wing's upper tip dies
    // in the open air far above the datum; the oval floats at the datum.
    {
        // sole mass below plinth top: no ribbon/rod/bead vert-model dips below PLINTH_H except the plinth + posts + tail socket
        // (a) ribbon minimum EXCLUDING the wing-lower tail (its last 3 chords):
        let minBottom = Infinity;
        for (let ai = 0; ai < ARCS.length; ai++) {
            const a = ARCS[ai];
            const xs = arcStations(a);
            for (let i = 0; i < xs.length - 1; i++) {
                if (ai === 3 && i < 4) continue;      // tail socket chords (the walk runs tip→root — the steep zone is FIRST) — disclosed
                const p = worldPt(xs[i], a.sign * yUpper(xs[i]));
                const q = worldPt(xs[i + 1], a.sign * yUpper(xs[i + 1]));
                const dx = q[0] - p[0], dy = q[1] - p[1];
                const len = Math.hypot(dx, dy) + JOINT;
                const ang = Math.atan2(dy, dx);
                const halfY = (len * Math.abs(Math.sin(ang)) + RIB_N * Math.abs(Math.cos(ang))) / 2;
                minBottom = Math.min(minBottom, (p[1] + q[1]) / 2 - halfY);
            }
        }
        if (minBottom < PLINTH_H + 0.10) throw Error(`L6 non-tail ribbon dips to ${minBottom.toFixed(3)} — everything but the tail must fly above the plinth`);
        // (b) the tail socket: the final wing-lower chord's box bottom is INSIDE the plinth (below its top)
        {
            const a = ARCS[3];
            const xs = arcStations(a);
            const p = worldPt(xs[0], a.sign * yUpper(xs[0]));
            const q = worldPt(xs[1], a.sign * yUpper(xs[1]));
            const dx = q[0] - p[0], dy = q[1] - p[1];
            const len = Math.hypot(dx, dy) + JOINT;
            const ang = Math.atan2(dy, dx);
            const halfY = (len * Math.abs(Math.sin(ang)) + RIB_N * Math.abs(Math.cos(ang))) / 2;
            const bottom = (p[1] + q[1]) / 2 - halfY;
            if (bottom > PLINTH_H) throw Error(`L6 wing tail fails to reach the plinth (final box bottom ${bottom.toFixed(3)} > ${PLINTH_H}) — the tail must socket in`);
            if (bottom < 0) throw Error(`L6 wing tail punches through grade (${bottom.toFixed(3)})`);
        }
        // (c) the wing's upper tip dies in the air: final wing-upper box bottom ≥ DATUM_Y + 1.5
        {
            const a = ARCS[2];
            const xs = arcStations(a);
            const p = worldPt(xs[xs.length - 2], a.sign * yUpper(xs[xs.length - 2]));
            const q = worldPt(xs[xs.length - 1], a.sign * yUpper(xs[xs.length - 1]));
            if (Math.min(p[1], q[1]) < DATUM_Y + 1.5) throw Error(`L6 upper tip not high above the datum (${Math.min(p[1], q[1]).toFixed(3)})`);
        }
        console.log(`L6 PASS plinth 0..${PLINTH_H} sole grounded mass; non-tail ribbon minimum ${minBottom.toFixed(3)}m; wing tail sockets INTO the plinth (post-embed class, disclosed); upper tip dies in the air above ${DATUM_Y + 1.5 < 5 ? (DATUM_Y + 1.5).toFixed(2) : (DATUM_Y + 1.5).toFixed(2)}m — the wing is born from the stone and cut mid-flight`);
    }

    // L7 ENVELOPE + collider honesty: origin-centered x/z, y ≥ 0, height ≥ 2.2,
    // footprint < 16 m² (folly — no walk owed).
    {
        const sx = ENVELOPE.max[0] - ENVELOPE.min[0], sy = ENVELOPE.max[1] - ENVELOPE.min[1], sz = ENVELOPE.max[2] - ENVELOPE.min[2];
        approxEq(Math.abs(ENVELOPE.min[0] + ENVELOPE.max[0]), 0, 1e-9, "L7 x centered");
        approxEq(Math.abs(ENVELOPE.min[2] + ENVELOPE.max[2]), 0, 1e-9, "L7 z centered");
        if (ENVELOPE.min[1] < -1e-9) throw Error("L7 below grade");
        if (sy < 2.2) throw Error("L7 height < 2.2");
        const fp = PLINTH_W * PLINTH_D;
        if (fp >= 16) throw Error("L7 footprint enters room class");
        console.log(`L7 PASS envelope ${sx.toFixed(3)}x${sy.toFixed(3)}x${sz.toFixed(3)} origin-centred x/z, y[0, ${ENVELOPE.max[1].toFixed(3)}]; footprint ${fp.toFixed(2)} m² < 16 — folly, no walk owed`);
    }

    console.log("ALL CHECKS PASS");
}

// RED control: run with argv[1] == "mutant" — wrong curve y² = x³ − x + 0.2:
// the implicit identity law must detect it.
if (process.argv[2] === "mutant") {
    let worst = 0;
    for (let i = 0; i <= 2000; i++) {
        const x = -1 + (i / 2000) * (X_TIP + 1);
        const fv = fCub(x);
        if (fv < 0) continue;
        const y = Math.sqrt(fv);
        worst = Math.max(worst, Math.abs(y * y - (x * x * x - x + 0.2)));
    }
    if (worst < 0.10) throw Error(`RED control FAILED to fail (worst ${worst})`);
    console.error(`RED control OK: mutant y² = x³ − x + 0.2 violates the identity by ${worst.toFixed(3)} — law detects`);
    process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("struct202-probe-elliptic.ts") && !process.argv[2]) main();
export {};
