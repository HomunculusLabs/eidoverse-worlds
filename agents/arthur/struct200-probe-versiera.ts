// struct200-probe-versiera.ts — THE ONE CONTRACT for R11-24 THE VERSIERA
// (the Witch of Agnesi, 1748). The bell and its hoop.
//
// Versiera (Maria Gaetana Agnesi, Instituzioni Analitiche 1748): the curve
//   (y − datum) · (x² + 4a²) = 8a³,  rational parametrization (t ∈ ℝ)
//   P(t) = (2a·t, 2a/(1+t²))  [math frame, asymptote y=0],
// built by the classical construction: lines through O meet the tangent
// line at V and the circle; P takes the x of one, the y of the other.
//   - THE CONSTRUCTION CIRCLE: x² + (y−a)² = a² (center (0,a), radius a),
//     tangent to the asymptote line at the origin — in world frame the
//     circle RESTS ON THE CURB TOP and the asymptote IS the curb top.
//   - THE OSCULATION THEOREM: the versiera meets its circle ONLY at the
//     vertex (0,2a) = the circle's north pole, with SECOND-ORDER contact —
//     the circle of curvature at the vertex IS the construction circle
//     (κ(0) = 1/a exact), separation growing quartically (radial − a ≈ 4a·t⁴).
//   - THE AREA THEOREM: total area between curve and asymptote over ℝ is
//     EXACTLY 4πa² — four generating circles (Agnesi's own proof, 1748).
//   - vertex (0,2a); equator crossings (±2a, a) — twice the circle's
//     radius wide; the bell's skirt sweeps far around its hoop.
//
// WORLD FRAME: vertical construction plane = XY (Math Avenue convention;
// reads on the +Z face). DATUM = curb top CURB_H; everything reads from
// it: the hoop stands tangent on the curb top, the bell's crown osculates
// the hoop's north pole, the arms descend forever toward the curb surface
// and die in the air at an authored TIP_X (the asymptote never lands).
// STONE carries the curve — one continuous arc-uniform voussoir ribbon
// (keystone at the crown, marks at the equator crossings). IRON carries
// THE HOOP — the construction circle itself (torus r=a, in-plane, tangent
// to the curb top at its bottom pole). Sole night element: one warm bead
// at the crown (the kiss), half-proud of the keystone's front face.
//
// Exports are consumed by assets/mkv3-versiera.ts (the build) and
// struct200-decode-versiera.ts (the audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions below are FINAL world-local coords.

// ---- constants -----------------------------------------------------------------------------------
export const A = 1.40;              // versiera parameter a — hoop radius; skirt half-width at equator is 2a
export const CURB_H = 0.24;         // curb height = DATUM (the asymptote line is the curb top)
export const Y_RING = CURB_H + A;   // hoop center — the circle rests tangent on the curb top
export const VERTEX_Y = CURB_H + 2 * A; // the bell's crown = the hoop's north pole (the osculation)

export const CURB_W = 10.60;        // stone curb slab (world x) — the ground echo
export const CURB_D = 0.60;         // curb depth (z) — governs envelope z ±0.30

export const RIB_SEC_N = 0.20;      // stone voussoir in-plane thickness — 0.20 (not 0.16): the
                                    // crown voussoirs must SWALLOW the hoop's top arc (curve edge
                                    // slope −x/2a² vs circle-top slope −x/a ⇒ the tube dives into
                                    // the ribbon going outward and exits only through the flank
                                    // UNDERSIDE — no sky wedge at the shoulder; struct-200 front-
                                    // judge self-catch, falsified by slope analysis before rebuild)
export const RIB_SEC_D = 0.20;      // stone voussoir depth (z)
export const L_STEP = 0.30;         // arc-uniform voussoir ARC length (max dev at κ=1/a ≈ 8mm — no zones needed)
export const JOINT = 0.006;         // voussoir chord-length joint extension (mk box law)

export const TIP_X = 5.00;          // arms truncate at |x| = 5.0 → tip y = CURB_H + 2a/(1+(5/2.8)²) ≈ 0.443
export const TIP_AIR = 0.06;        // authored minimum air gap (tip box bottom above curb top) — the asymptote never lands

export const RING_T = 0.05;         // iron hoop tube radius
export const BEAD_R = 0.07;         // crown bead radius
export const BEAD_Z = RIB_SEC_D / 2; // half-proud of the keystone front face (struct-52/188 law)

export const T_END = TIP_X / (2 * A); // t at the arm tips = 5/2.8 ≈ 1.7857

// ---- the curve --------------------------------------------------------------------------------------
// P(t) = (2a·t, CURB_H + 2a/(1+t²)) — FINAL world-local coords.
export const worldPt = (t: number): [number, number] => [2 * A * t, CURB_H + (2 * A) / (1 + t * t)];

// implicit versiera residual: |(y−CURB_H)(x²+4a²) − 8a³|
export const implicitResidual = (x: number, y: number): number =>
    Math.abs((y - CURB_H) * (x * x + 4 * A * A) - 8 * A * A * A);

// arc speed: |P'(t)| = 2a·√(1 + 4t²/(1+t²)⁴)
export const versSpeed = (t: number): number =>
    2 * A * Math.sqrt(1 + (4 * t * t) / Math.pow(1 + t * t, 4));

export function versArc(t0: number, t1: number): number {
    const N = 4000;
    const dt = Math.abs(t1 - t0) / N;
    const base = Math.min(t0, t1);
    let s = 0;
    for (let i = 0; i < N; i++) {
        const t = base + (i + 0.5) * dt;
        s += versSpeed(t) * dt;
    }
    return s;
}

export const TOTAL_ARC = versArc(-T_END, T_END);

// invert arc → theta over [−T_END, T_END] (versArc strictly increasing)
function sToTheta(s: number): number {
    let lo = -T_END, hi = T_END;
    for (let it = 0; it < 80; it++) {
        const mid = (lo + hi) / 2;
        if (versArc(-T_END, mid) < s) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
}
export { sToTheta };

// STATIONS: keystone at t=0 (the osculation is a JOINT), equator crossings
// t=±1 (where the skirt passes hoop-center height — the A-points), tips
// t=±T_END; uniform 0.30 fill between marks (curvature is gentlest at the
// tips and worst at the crown, where κ=1/a gives 8mm dev at 0.30 — no
// special zones needed, unlike the rhodonea's 47mm tip curvature).
export function stationsTheta(): number[] {
    const marks = [-T_END, -1, 0, 1, T_END].map((t) => versArc(-T_END, t));
    marks.sort((a, b) => a - b);
    const out: number[] = [];
    for (let i = 0; i < marks.length - 1; i++) {
        const a = marks[i], b = marks[i + 1];
        out.push(a);
        const len = b - a;
        if (len <= 0.31) continue;                       // closed by the next mark's push
        const n = Math.max(1, Math.round(len / L_STEP));
        for (let j = 1; j < n; j++) out.push(a + (len * j) / n);
    }
    out.push(marks[marks.length - 1]);
    return out.map(sToTheta);
}

// ---- envelope contract (probe models the mk boxes EXACTLY; decode re-derives from verts) -----------
export const ENVELOPE = (() => {
    let minX = -CURB_W / 2, maxX = CURB_W / 2;
    let minY = 0, maxY = CURB_H;
    let minZ = -CURB_D / 2, maxZ = CURB_D / 2;
    const grow = (px: number, py: number, pz: number, hx: number, hy: number, hz: number) => {
        minX = Math.min(minX, px - hx); maxX = Math.max(maxX, px + hx);
        minY = Math.min(minY, py - hy); maxY = Math.max(maxY, py + hy);
        minZ = Math.min(minZ, pz - hz); maxZ = Math.max(maxZ, pz + hz);
    };
    // curb
    grow(0, CURB_H / 2, 0, CURB_W / 2, CURB_H / 2, CURB_D / 2);
    // voussoir boxes (chord a->b in XY, len+JOINT x N x D, rotated in-plane)
    const rib = (a: [number, number], b: [number, number]) => {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) + JOINT;
        const ang = Math.atan2(dy, dx);
        const c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang));
        grow((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0,
            (len * c + RIB_SEC_N * s) / 2, (len * s + RIB_SEC_N * c) / 2, RIB_SEC_D / 2);
    };
    const ts = stationsTheta();
    for (let i = 0; i < ts.length - 1; i++) rib(worldPt(ts[i]), worldPt(ts[i + 1]));
    // hoop: torus radius a centered (0, Y_RING), in-plane — axis box
    grow(0, Y_RING, 0, A + RING_T, A + RING_T, RING_T);
    // bead
    grow(0, VERTEX_Y, BEAD_Z, BEAD_R, BEAD_R, BEAD_R);
    return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
})();

// ---- laws -----------------------------------------------------------------------------------------
function approxEq(a: number, b: number, tol: number, what: string) {
    if (Math.abs(a - b) > tol) throw Error(`LAW FAIL ${what}: ${a} vs ${b} (tol ${tol})`);
}

function main() {
    // L1 THE EQUATION: every authored point satisfies the implicit versiera
    // identity exactly, and the rational parametrization is self-consistent
    // (t recovered from x matches t recovered from y).
    {
        const N = 6001;
        let worst = 0;
        for (let i = 0; i < N; i++) {
            const t = -T_END + (i / (N - 1)) * 2 * T_END;
            const [x, y] = worldPt(t);
            worst = Math.max(worst, implicitResidual(x, y));
            const tFromX = x / (2 * A);
            const tFromY = Math.sqrt(Math.max(0, (2 * A) / (y - CURB_H) - 1));
            worst = Math.max(worst, Math.abs(tFromX - t) * 2 * A, Math.abs(Math.abs(tFromY) - Math.abs(t)) * 2 * A);
        }
        approxEq(worst, 0, 1e-9, "L1 implicit + rational param identity");
        console.log(`L1 PASS versiera satisfies (y−d)(x²+4a²)=8a³ and P(t)=(2at, d+2a/(1+t²)) worst residual ${worst.toExponential(2)} over t ∈ [−${T_END.toFixed(4)}, ${T_END.toFixed(4)}]`);
    }

    // L2 THE OSCULATION THEOREM: the curve meets its construction circle
    // ONLY at the vertex — which is the hoop's north pole — with SECOND-
    // ORDER contact: the vertex circle of curvature IS the circle (κ(0)=1/a,
    // curvature center == hoop center); separation quartic (radial − a ≈ 4a·t⁴);
    // the hoop stands tangent on the curb top at its bottom pole.
    {
        const [vx, vy] = worldPt(0);
        approxEq(vx, 0, 1e-12, "L2 vertex x == 0");
        approxEq(vy, VERTEX_Y, 1e-12, "L2 vertex == hoop north pole");
        approxEq(Y_RING - A, CURB_H, 1e-12, "L2 hoop bottom pole tangent to curb top");
        // numeric curvature at t=0 via symmetric finite differences on the param
        const h = 1e-4;
        const p0 = worldPt(0), pm = worldPt(-h), pp = worldPt(h);
        const d1: [number, number] = [(pp[0] - pm[0]) / (2 * h), (pp[1] - pm[1]) / (2 * h)];
        const d2: [number, number] = [(pp[0] - 2 * p0[0] + pm[0]) / (h * h), (pp[1] - 2 * p0[1] + pm[1]) / (h * h)];
        const kappa = Math.abs(d1[0] * d2[1] - d2[0] * d1[1]) / Math.pow(d1[0] * d1[0] + d1[1] * d1[1], 1.5);
        approxEq(kappa, 1 / A, 1e-5, "L2 κ(0) == 1/a (osculating circle == construction circle)");
        // curvature center at vertex == hoop center (0, Y_RING)
        const cx = p0[0] + d1[1] * (d1[0] * d1[0] + d1[1] * d1[1]) / Math.abs(d1[0] * d2[1] - d2[0] * d1[1]) * (d1[0] >= 0 ? 1 : 1);
        // center = P + (κ⁻¹)·n̂ where n̂ = (d1_y, −d1_x)/|d1| for the turning side
        const kk = (d1[0] * d2[1] - d2[0] * d1[1]) / Math.pow(d1[0] * d1[0] + d1[1] * d1[1], 1.5);
        const nrm = Math.hypot(d1[0], d1[1]);
        const ctr: [number, number] = [p0[0] - (kk / Math.abs(kk)) * d1[1] / nrm / Math.abs(kk), p0[1] + (kk / Math.abs(kk)) * d1[0] / nrm / Math.abs(kk)];
        approxEq(Math.hypot(ctr[0] - 0, ctr[1] - Y_RING), 0, 5e-4, "L2 vertex curvature center == hoop center");
        // quartic separation: radial² − a² = 4a²t⁴(2+t²)/(1+t²)² exact, so
        // sep(t) ≈ 4a·t⁴ as t→0 (second-order contact). Exact ratio
        // a(2+t²)/[(1+t²)²(radial+a)] is 1 at t=0 and DECAYS (hand-checked:
        // t=0.02→1.000, t=0.1→0.985, t=1→0.25, t=T_END→0.064) — the lower
        // bound holds only in the CONTACT ZONE. Law: quartic UPPER bound
        // everywhere (sep ≤ 4a·t⁴·1.001 + 1e-14); ratio ≥ 0.985 for
        // 0.004 ≤ |t| ≤ 0.1 (signal ≥ 1.4e-9 vs 1e-16 noise at the floor).
        let worstQ = Infinity;
        for (let i = 0; i <= 4000; i++) {
            const t = -T_END + (i / 4000) * 2 * T_END;
            const [x, y] = worldPt(t);
            const radial = Math.hypot(x, y - Y_RING);
            const quartic = 4 * A * Math.pow(Math.abs(t), 4);
            if (radial - A > quartic * 1.001 + 1e-14) throw Error(`L2 separation ${(radial - A).toExponential(2)} exceeds quartic bound ${quartic.toExponential(2)} at t=${t.toFixed(5)} — not the osculation`);
            const at = Math.abs(t);
            if (at >= 0.004 && at <= 0.1) worstQ = Math.min(worstQ, (radial - A) / quartic);
        }
        if (worstQ < 0.985) throw Error(`L2 contact-zone ratio ${worstQ.toFixed(4)} < 0.985 — not second-order contact`);
        // the ONLY circle meeting: solve intersection numerically — count sign changes of (radial − a) t-samples: tangent at t=0 only
        let crossings = 0;
        let prev = Math.sign(Math.hypot(worldPt(-T_END)[0], worldPt(-T_END)[1] - Y_RING) - A);
        for (let i = 1; i <= 8000; i++) {
            const t = -T_END + (i / 8000) * 2 * T_END;
            const [x, y] = worldPt(t);
            const s = Math.sign(Math.hypot(x, y - Y_RING) - A);
            if (s !== prev && prev !== 0) crossings++;
            prev = s;
        }
        if (crossings !== 0) throw Error(`L2 curve crosses its circle ${crossings} times — the versiera touches ONLY at the vertex`);
        // cradle zone disclosure: crown voussoirs clasp the hoop's top arc by design
        const tStar = Math.pow(0.142 / (4 * A), 0.25);
        console.log(`L2 PASS vertex == hoop north pole; κ(0)=${kappa.toFixed(6)} == 1/a=${(1 / A).toFixed(6)}; curvature center == hoop center; separation quartic (worst ratio ${worstQ.toFixed(4)}); ZERO crossings — one kiss. Crown voussoirs clasp the hoop top arc for |t| < ${tStar.toFixed(3)} (osculating cradle, folium/rhodonea boss precedent — disclosed)`);
    }

    // L3 THE AREA THEOREM: strip area between curve and the datum over the
    // authored truncation, by the DIRECT parametric integral (x(t)=2at is
    // strictly monotone, so area = ∫(y−d)·x′(t)dt = 8a²·atan(T_END) exactly);
    // the infinite limit == 4πa² — four generating circles (Agnesi 1748).
    // (Self-catch: a shoelace without the datum closing leg sums an OPEN
    // polyline — wrong by the chord area. The direct integral is the law.)
    {
        const M = 40000;
        let area = 0;
        for (let i = 0; i < M; i++) {
            const tm = -T_END + ((i + 0.5) / M) * 2 * T_END;   // midpoint rule
            area += (worldPt(tm)[1] - CURB_H) * (2 * A) * (2 * T_END / M);
        }
        const closed = 8 * A * A * Math.atan(T_END);            // == 8a²·atan(TIP_X/2a)
        approxEq(area, closed, 5e-5, "L3 truncated strip area == 8a²·atan(T_END)");
        approxEq(8 * A * A * (Math.PI / 2), 4 * Math.PI * A * A, 1e-12, "L3 infinite limit == 4πa²");
        console.log(`L3 PASS truncated strip ${area.toFixed(4)} == closed form ${closed.toFixed(4)} (direct integral); infinite limit 8a²·π/2 == 4πa² = ${(4 * Math.PI * A * A).toFixed(4)} — four generating circles; truncation captures ${(closed / (4 * Math.PI * A * A) * 100).toFixed(1)}%`);
    }

    // L4 STATION WALK: keystone t=0 IS a station (the osculation is a
    // joint); equator crossings t=±1 are stations; tips t=±T_END are
    // stations; steps uniform ~0.30 (max 0.34); chord deviation at
    // ARC-midpoints ≤ 45mm (the folium self-catch law).
    {
        const ts = stationsTheta();
        for (const mark of [-1, 0, 1, -T_END, T_END]) {
            const best = Math.min(...ts.map((t) => Math.abs(t - mark)));
            if (best > 1e-3) throw Error(`L4 mark t=${mark.toFixed(4)} has no station (closest ${best.toFixed(4)}) — keystone/equator/tip must be joints`);
        }
        const steps: number[] = [];
        for (let i = 0; i < ts.length - 1; i++) steps.push(versArc(ts[i], ts[i + 1]));
        let maxStep = 0;
        for (const s of steps) maxStep = Math.max(maxStep, s);
        if (maxStep > 0.34) throw Error(`L4 max step ${maxStep.toFixed(3)} > 0.34`);
        // chord deviation at ARC midpoints
        const arcMidT = (ta: number, tb: number): number => {
            const half = versArc(ta, tb) / 2;
            let lo = ta, hi = tb;
            for (let it = 0; it < 60; it++) {
                const mid = (lo + hi) / 2;
                if (versArc(ta, mid) < half) lo = mid; else hi = mid;
            }
            return (lo + hi) / 2;
        };
        let worstDev = 0;
        for (let i = 0; i < ts.length - 1; i++) {
            const a = worldPt(ts[i]), b = worldPt(ts[i + 1]), m = worldPt(arcMidT(ts[i], ts[i + 1]));
            const dev = Math.hypot(m[0] - (a[0] + b[0]) / 2, m[1] - (a[1] + b[1]) / 2);
            worstDev = Math.max(worstDev, dev);
            if (dev > 0.045) throw Error(`L4 chord deviation ${(dev * 1000).toFixed(1)}mm at i=${i} — shorten the step`);
        }
        console.log(`L4 PASS ${ts.length} stations; keystone t=0 + equators t=±1 + tips are joints; max step ${maxStep.toFixed(3)}; worst chord dev ${(worstDev * 1000).toFixed(1)}mm ≤ 45mm`);
    }

    // L5 HOOP SEATING: hoop radius == a centered (0, Y_RING) in-plane; hoop
    // bottom pole ON the curb top (resting tangent — no embed); skirt clears
    // the hoop everywhere outside the osculating cradle (radial − a > tube +
    // rib half-diag for |t| > t*); bead half-proud of the keystone front face.
    {
        approxEq(BEAD_Z, RIB_SEC_D / 2, 1e-12, "L5 bead half-proud z");
        // THE CONSTRUCTION: the hoop CENTERLINE circle is tangent to the
        // asymptote line at O — in world frame, tangent to the curb TOP
        // exactly. The physical tube (material thickness) seats RING_T into
        // the curb — grounding, post-embed class, disclosed.
        approxEq(Y_RING - A, CURB_H, 1e-12, "L5 hoop centerline tangent to the curb top (circle tangent to asymptote at O — the construction)");
        approxEq(CURB_H - (Y_RING - A - RING_T), RING_T, 1e-12, "L5 hoop tube seats in the curb by exactly the tube radius");
        const tStarExact = (() => {
            // bisect the TRUE clearance boundary: sep(t) == RING_T + rib half-diag
            // (the quartic 4a·t⁴ is only an upper bound — the exact radial is the law)
            const sep = (t: number) => {
                const [x, y] = worldPt(t);
                return Math.hypot(x, y - Y_RING) - A;
            };
            let lo = 0.1, hi = T_END;
            for (let it = 0; it < 60; it++) {
                const mid = (lo + hi) / 2;
                if (sep(mid) < RING_T + 0.092) lo = mid; else hi = mid;
            }
            return lo;
        })();
        for (let i = 0; i <= 8000; i++) {
            const t = -T_END + (i / 8000) * 2 * T_END;
            if (Math.abs(t) <= tStarExact) continue; // the cradle — clasped by design
            const [x, y] = worldPt(t);
            const radial = Math.hypot(x, y - Y_RING);
            if (radial - A <= RING_T + 0.092) throw Error(`L5 skirt grazes the hoop at t=${t.toFixed(3)} (radial−a ${(radial - A).toFixed(4)} ≤ ${RING_T + 0.092}) outside the cradle`);
        }
        console.log(`L5 PASS hoop r=${A} tube ${RING_T} centerline tangent to the curb top (the construction); skirt clears the hoop outside the cradle |t| < ${tStarExact.toFixed(3)}; crown voussoirs clasp the hoop top (disclosed); bead half-proud at (0, ${VERTEX_Y}, ${BEAD_Z})`);
    }

    // L6 GROUNDING: curb 0..CURB_H; the whole curve inside the curb x-band;
    // ARMS DIE IN THE AIR — tip box bottom ≥ CURB_H + TIP_AIR (the asymptote
    // never lands); equator skirt height above curb top == a exactly.
    {
        const N = 20000;
        for (let i = 0; i < N; i++) {
            const t = -T_END + (i / N) * 2 * T_END;
            const [x, y] = worldPt(t);
            if (Math.abs(x) > CURB_W / 2 - 0.1) throw Error(`L6 curve x ${x.toFixed(3)} outside the curb band`);
        }
        // equator crossings: y == CURB_H + A exact
        const [ex] = [worldPt(1)];
        approxEq(ex[1], CURB_H + A, 1e-12, "L6 equator crossing height == curb + a");
        approxEq(Math.abs(ex[0]), 2 * A, 1e-12, "L6 equator crossing |x| == 2a");
        // tip box bottoms: model the last two chords on each side exactly
        const ts = stationsTheta();
        const boxBottom = (ta: number, tb: number): number => {
            const a = worldPt(ta), b = worldPt(tb);
            const dx = b[0] - a[0], dy = b[1] - a[1];
            const len = Math.hypot(dx, dy) + JOINT;
            const ang = Math.atan2(dy, dx);
            const halfY = (len * Math.abs(Math.sin(ang)) + RIB_SEC_N * Math.abs(Math.cos(ang))) / 2;
            return (a[1] + b[1]) / 2 - halfY;
        };
        let worst = Infinity;
        for (let i = 0; i < ts.length - 1; i++) {
            // only tip-region chords (outermost 2 per side)
            if (Math.abs(ts[i]) < T_END - 0.35 || Math.abs(ts[i + 1]) < T_END - 0.35) continue;
            worst = Math.min(worst, boxBottom(ts[i], ts[i + 1]));
        }
        if (worst < CURB_H + TIP_AIR) throw Error(`L6 tip box bottom ${(worst - CURB_H).toFixed(3)} above curb top < authored air ${TIP_AIR}`);
        console.log(`L6 PASS curb 0..${CURB_H}; equator crossings (±${2 * A}, ${CURB_H + A}) exact; tip boxes die in the air ≥ ${(worst - CURB_H).toFixed(3)}m above the curb top (authored ≥ ${TIP_AIR}) — the asymptote never lands`);
    }

    // L7 ENVELOPE + collider honesty: origin-centered x/z, y ≥ 0, height ≥ 2.2,
    // footprint < 16 m² (folly — no walk owed), x-extent governed by the curb.
    {
        const sx = ENVELOPE.max[0] - ENVELOPE.min[0], sy = ENVELOPE.max[1] - ENVELOPE.min[1], sz = ENVELOPE.max[2] - ENVELOPE.min[2];
        approxEq(Math.abs(ENVELOPE.min[0] + ENVELOPE.max[0]), 0, 1e-9, "L7 x centered");
        approxEq(Math.abs(ENVELOPE.min[2] + ENVELOPE.max[2]), 0, 1e-9, "L7 z centered");
        if (ENVELOPE.min[1] < -1e-9) throw Error("L7 below grade");
        if (sy < 2.2) throw Error("L7 height < 2.2");
        const fp = CURB_W * CURB_D;
        if (fp >= 16) throw Error("L7 footprint enters room class");
        console.log(`L7 PASS envelope ${sx.toFixed(2)}x${sy.toFixed(2)}x${sz.toFixed(2)} origin-centred x/z, y[0, ${ENVELOPE.max[1].toFixed(2)}]; footprint ${fp.toFixed(2)} m² < 16 — folly, no walk owed`);
    }

    console.log("ALL CHECKS PASS");
}

// RED control: run with argv[1] == "mutant" — wrong curve (cosine bell of
// the same vertex and half-width): the implicit identity law must detect it.
if (process.argv[2] === "mutant") {
    const bad = (t: number): [number, number] => {
        const x = 2 * A * t;
        const y = CURB_H + 2 * A * Math.cos((Math.PI * x) / (4 * A));
        return [x, y];
    };
    let worst = 0;
    for (let i = 0; i <= 2000; i++) {
        const t = -T_END + (i / 2000) * 2 * T_END;
        const [x, y] = bad(t);
        worst = Math.max(worst, implicitResidual(x, y));
    }
    if (worst < 0.10) throw Error(`RED control FAILED to fail (worst ${worst})`);
    console.error(`RED control OK: mutant cosine bell violates (y−d)(x²+4a²)=8a³ by ${worst.toFixed(3)} — law detects`);
    process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("struct200-probe-versiera.ts") && !process.argv[2]) main();
export {};
