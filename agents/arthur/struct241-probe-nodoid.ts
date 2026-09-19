// struct241-probe-nodoid.ts — STRUCTURES LANE struct-241, Round 11 R11-54.
// THE NODOID — Delaunay 1841's fourth roulette, the family's last missing
// member (form-ledger grep fresh this tick: nodoid 0/0/0 across
// STRUCTURES-PLAN + IMPROVEMENTS + IMPROVE-PLAN). Standing family: cylinder/
// sphere (e=0 members), UNDULOID R11-4 Stoup (0<e<1), CATENOID struct-102
// (e=1). The nodoid is the e>1 branch — the hyperbola's roulette — and the
// family closes at its most extreme member.
//
// ECCENTRICITY PINNED BY MEASUREMENT (this tick's e-sweep, terminal record):
//   e:     1.50  1.75  2.00  2.25 | 2.50  2.75  3.00  3.50
//   D/P:   .394  .564  .731  .895 | 1.058 1.221 1.383 1.705
//   cross: 0     0     0     0    | 2 circles/period from e=2.5 up
// e=2.5 is the THRESHOLD member — the least eccentric nodoid whose meridian
// truly passes through itself; its two crossing circles per period sit at
// r* = 2.57 / 2.03 (r-/r+ = 0.429 / 0.581 of span) — clean mid-flank
// piercing (at e=3+ one circle drifts toward a near-tangent graze at r+).
//
// DERIVATION (first-integral method, self-verified — no memory-trust):
//   CMC surface of revolution about the x-axis; meridian (x(s), r(s))
//   unit-speed, theta = atan2(r', x'):
//     k_m = -theta'(s),  k_p = cos(theta)/r,  H = (k_m + k_p)/2.
//   Noether first integral:  r cos(theta) - H r^2 = c.
//   With H = 1/(2a):  unduloid c = +a(1-e^2)/2 (e<1);  NODOID c = -a(e^2-1)/2
//   (e>1);  r in [a(e-1), a(1+e)].  At r = a(e-1) the first integral forces
//   cos(theta) = -1: the meridian's tangent REVERSES, the profile folds back
//   through itself, and the surface of revolution PASSES THROUGH ITSELF —
//   a column of beads that pierce their neighbors. This is the identity.
//
// STRUCTURE NOTE: the measurement runs at MODULE level (importers — mk and
// decode — get the true exported constants without running tests); the
// guarded main re-integrates and VERIFIES the exports against every law.
//
// TESTS
//   T1 UNDULOID CONTROL: e=0.55 — period == Ramanujan perimeter (struct157
//      truth); bulge/neck laws exact. Validates the whole machinery.
//   T2 FIRST INTEGRAL: |r cos(th) - H r^2 - c| over the nodoid trace.
//   T3 GEOMETRIC CMC: circumcircle k_m + cos(th)/r k_p (independent of the
//      ODE state) == 1/(2a), unduloid control and nodoid both.
//   T4 TURNING LAW: bulges th==0 mod 2pi at r+; reversal th==+-pi mod 2pi at
//      r- with cos(th) == -1 — the fold.
//   T5 PERIOD LAW: r(s) periodic with measured arc period; x-advance const.
//   T6 OVERHANG LAW: per-period x-retreat (loop depth) > 0 and matches export.
//   T7 SELF-INTERSECTION: adjacent periods cross at 2 circles per pair,
//      radii in (r-, r+) — the piercing, measured and exported.
//   T8 REACH LAW: max r == r+, min r == r-.
//   T9 WORLD CONTRACT: k pinned by bulge 0.72m; PERIODS by height band
//      [2.5, 3.0]m; dais/seat/bead-cover/embed/envelope laws pinned;
//      exports the exact meridian + crossings for mk + decode.
//   RED (--red): wobble r by 1% incommensurate sine -> T2/T3/T5 FAIL.
export const E_ECC = 2.5;           // hyperbola eccentricity — MEASUREMENT-PINNED threshold (sweep table above)
export const A_UNIT = 1;            // unit build; world scale k below
export const BULGE_WORLD = 0.72;    // world bulge radius (m)
export const H_MEAN = 1 / (2 * A_UNIT);
export const C_NODOID = -A_UNIT * (E_ECC * E_ECC - 1) / 2;
export const R_PLUS = A_UNIT * (1 + E_ECC);   // bulge radius (unit) = 3.5
export const R_MINUS = A_UNIT * (E_ECC - 1);  // reversal radius (unit) = 1.5
export const B_HYP = A_UNIT * Math.sqrt(E_ECC * E_ECC - 1); // cos(th)=0 boundary (sqrt21/2)

export interface Sample { s: number; x: number; r: number; th: number }

// RK4 integration of the CMC meridian ODE from a bulge (theta=0, r=r+).
// dtheta/ds = cos(th)/r - 1/a  (from k_m + k_p = 2H with k_m = -theta').
export function integrate(a: number, e: number, sTotal: number, ds = 0.002): Sample[] {
    const rPlus = a * (1 + e);
    let x = 0, r = rPlus, th = 0, s = 0;
    const out: Sample[] = [{ s, x, r, th }];
    const f = (xx: number, rr: number, tt: number): [number, number, number] =>
        [Math.cos(tt), Math.sin(tt), Math.cos(tt) / rr - 1 / a];
    while (s < sTotal) {
        const k1 = f(x, r, th);
        const k2 = f(x + k1[0] * ds / 2, r + k1[1] * ds / 2, th + k1[2] * ds / 2);
        const k3 = f(x + k2[0] * ds / 2, r + k2[1] * ds / 2, th + k2[2] * ds / 2);
        const k4 = f(x + k3[0] * ds, r + k3[1] * ds, th + k3[2] * ds);
        x += ds / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
        r += ds / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
        th += ds / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
        s += ds;
        out.push({ s, x, r, th });
    }
    return out;
}

// r-maxima (bulges) — parabolic refinement; only near-global maxima count.
export function bulgePositions(samples: Sample[], rRef = 0): { s: number; x: number; r: number }[] {
    const big = rRef || Math.max(...samples.map(p => p.r));
    const out: { s: number; x: number; r: number }[] = [];
    for (let i = 2; i < samples.length - 2; i++) {
        const a = samples[i - 1], b = samples[i], c = samples[i + 1];
        if (b.r > a.r && b.r >= c.r && b.r > 0.9 * big) {
            const denom = (a.r - 2 * b.r + c.r);
            if (denom < -1e-12) {
                const dsp = 0.5 * (a.r - c.r) / denom;      // offset in steps of ds
                out.push({ s: b.s + dsp * (b.s - a.s), x: b.x + dsp * (c.x - b.x), r: b.r });
            }
        }
    }
    return out;
}

// r-minima (reversals) — parabolic refinement; only near-global minima count.
export function reversalPositions(samples: Sample[]): { s: number; x: number; r: number }[] {
    const small = Math.min(...samples.map(p => p.r));
    const out: { s: number; x: number; r: number }[] = [];
    for (let i = 2; i < samples.length - 2; i++) {
        const a = samples[i - 1], b = samples[i], c = samples[i + 1];
        if (b.r < a.r && b.r <= c.r && b.r < 1.1 * small) {
            const denom = (a.r - 2 * b.r + c.r);
            if (denom > 1e-12) {
                const dsp = 0.5 * (a.r - c.r) / denom;
                out.push({ s: b.s + dsp * (b.s - a.s), x: b.x + dsp * (c.x - b.x), r: b.r });
            }
        }
    }
    return out;
}

// signed meridian curvature via circumcircle (independent of ODE state)
function circumCurvature(p0: Sample, p1: Sample, p2: Sample): number {
    const ax = p1.x - p0.x, ar = p1.r - p0.r;
    const bx = p2.x - p1.x, br = p2.r - p1.r;
    const cross = ax * br - ar * bx;
    const lab = Math.hypot(ax, ar), lbc = Math.hypot(bx, br), lac = Math.hypot(p2.x - p0.x, p2.r - p0.r);
    if (lab * lbc * lac < 1e-12) return 0;
    const kappaAbs = 2 * Math.abs(cross) / (lab * lbc * lac);
    return (cross < 0 ? 1 : -1) * kappaAbs;   // clockwise turning (theta decreasing) => k_m > 0
}

// ---- world contract -------------------------------------------------------------------------------------
export const K_WORLD = BULGE_WORLD / R_PLUS;
export const DAIS_H_LOWER = 0.10, DAIS_R_LOWER = 1.14;      // lower tier (footprint: bulge + 0.42)
export const DAIS_H_UPPER = 0.30, DAIS_R_UPPER = 0.92;      // upper tier (bulge + 0.20 — the bottom bead rises from it)
export const DAIS_TOP = DAIS_H_LOWER + DAIS_H_UPPER;        // 0.40
export const BULGE0_Y = DAIS_TOP;                            // bottom bulge EQUATOR flush with the rim: a hemisphere rising out of stone (v2 base-seat fix)
export const BRASS_MIN = 2.5, BRASS_MAX = 3.0;              // height band for the bead column (m)
export const BEAD_R = 0.36;                                 // crown bead (cover law: >= top ring r + 0.02)
export const STRIDE = 40;                                   // profile stride for the lathe (ds 0.002 * 40 = 16mm world; loop curvature radius 0.123m resolves to 0.26mm sagitta)

export let PERIOD_X_UNIT = 0;       // x-advance per period (unit)
export let ARC_PERIOD_UNIT = 0;     // arc length per period (unit)
export let RETREAT_UNIT = 0;        // per-period x-retreat (the loop depth, unit)
export let SELF_CROSS_UNIT: { x: number; r: number }[] = [];   // crossing circles (unit, first 4 adjacent pairs)
export let PERIODS = 0;             // bead count - 1
export let TOP_RING_Y = 0;          // world y of the top reversal ring (crown bead seat)
export let BOTTOM_RING_Y = 0;       // world y of the bottom reversal ring (dais embed)
export const ENVELOPE = { min: [-DAIS_R_LOWER, 0, -DAIS_R_LOWER], max: [DAIS_R_LOWER, 0, DAIS_R_LOWER] };

// ---- module-level measurement (importers get true values; `main` verifies) -------------------------------
{
    const nod = integrate(A_UNIT, E_ECC, 80);
    const nb = bulgePositions(nod, R_PLUS);
    if (nb.length < 4) throw Error(`measurement: too few bulges (${nb.length})`);
    PERIOD_X_UNIT = nb[1].x - nb[0].x;
    ARC_PERIOD_UNIT = nb[1].s - nb[0].s;
    let best = 0, runMax = -Infinity;
    for (const p of nod) { runMax = Math.max(runMax, p.x); if (Math.cos(p.th) < 0) best = Math.max(best, runMax - p.x); }
    RETREAT_UNIT = best;
    const P_W = PERIOD_X_UNIT * K_WORLD;
    PERIODS = Math.max(3, Math.min(12, Math.round(((BRASS_MIN + BRASS_MAX) / 2) / P_W)));
    const revs = reversalPositions(nod);
    const s0 = nb[0].s, sN = nb[PERIODS].s;
    const before = revs.filter(q => q.s < s0), after = revs.filter(q => q.s > sN);
    if (!before.length || !after.length) throw Error("measurement: reversal cuts missing");
    BOTTOM_RING_Y = BULGE0_Y - (nb[0].x - before[before.length - 1].x) * K_WORLD;
    TOP_RING_Y = BULGE0_Y + PERIODS * P_W + (after[0].x - nb[PERIODS].x) * K_WORLD;
    ENVELOPE.max[1] = TOP_RING_Y + BEAD_R;
    // crossing circles (first 4 adjacent period pairs)
    const perPoly = (k: number) => nod.filter(p => p.s >= nb[k].s && p.s <= nb[k + 1].s);
    const cr: { x: number; r: number }[] = [];
    for (let k = 0; k + 1 < nb.length - 1 && k < 4; k++) {
        const A = perPoly(k), Bp = perPoly(k + 1);
        for (let i = 0; i + 10 < A.length; i += 10) {
            for (let j = 0; j + 10 < Bp.length; j += 10) {
                const p1 = A[i], p2 = A[i + 10], q1 = Bp[j], q2 = Bp[j + 10];
                const d1 = { x: p2.x - p1.x, r: p2.r - p1.r }, d2 = { x: q2.x - q1.x, r: q2.r - q1.r };
                const den = d1.x * d2.r - d1.r * d2.x;
                if (Math.abs(den) < 1e-12) continue;
                const t = ((q1.x - p1.x) * d2.r - (q1.r - p1.r) * d2.x) / den;
                const u = ((q1.x - p1.x) * d1.r - (q1.r - p1.r) * d1.x) / den;
                if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                    const cx = p1.x + t * d1.x, crr = p1.r + t * d1.r;
                    if (!cr.some(c => Math.hypot(c.x - cx, c.r - crr) < 0.2)) cr.push({ x: cx, r: crr });
                }
            }
        }
    }
    SELF_CROSS_UNIT = cr;
}

// the world meridian: (y, rho, lane) pairs from the BOTTOM cut to the TOP cut.
// y = BULGE0_Y + (x - x0)*k where x0 = the FIRST BULGE's x — y FOLDS BACK during
// the retreat strokes (x decreases): that fold is the form. NEVER use s for y.
// lane = PERIOD PARITY (v3): each bead is one period, cut at its NECK-RING
// boundaries (s = s0 + (k+1/2)T — the reversal rings); even beads bright brass,
// odd beads dark iron. Crossing-stroke audit (this tick, terminal record):
// BOTH crossing circles are within-stroke-class — r*=2.57 ADVANCE x ADVANCE
// (bead through bead), r*=2.03 RETREAT x RETREAT (loop through loop) — so a
// stroke-class material split can NEVER own a crossing (v2's falsification);
// a PERIOD split puts a brass/iron material boundary at every crossing.
// Cut law: bottom cut at the y-minimum of the bottom period, top cut at the
// top reversal ring (crown bead seat).
export function buildWorldMeridian(): { y: number; rho: number; lane: number }[] {
    const samples = integrate(A_UNIT, E_ECC, ARC_PERIOD_UNIT * (PERIODS + 2.2));
    const bulges = bulgePositions(samples, R_PLUS);
    const x0 = bulges[0].x;
    const revs = reversalPositions(samples);
    const s0 = bulges[0].s, sN = bulges[PERIODS].s;
    const revBefore = Math.max(...revs.filter(q => q.s < s0).map(q => q.s));
    let sBot = revBefore, xBot = Infinity;
    for (const p of samples) if (p.s >= revBefore && p.s <= s0 && p.x < xBot) { xBot = p.x; sBot = p.s; }
    const sTop = Math.min(...revs.filter(q => q.s > sN).map(q => q.s));
    const T = ARC_PERIOD_UNIT;
    const out: { y: number; rho: number; lane: number }[] = [];
    for (const p of samples) {
        if (p.s < sBot || p.s > sTop) continue;
        const k = Math.floor((p.s - s0) / T + 0.5);      // bead index (nearest bulge)
        out.push({ y: BULGE0_Y + (p.x - x0) * K_WORLD, rho: p.r * K_WORLD, lane: ((k % 2) + 2) % 2 });
    }
    return out;
}

// ---- main (guarded: importable by the mk/decode without running tests) -----------------------------------
const RED = process.argv.includes("--red");
const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails.push(name);
};

if (import.meta.main) {
    // ---- T1 unduloid control (e=0.55): validate machinery on struct157 truth ----
    const und = integrate(1, 0.55, 30);
    const bul = bulgePositions(und);
    const per = bul[1].x - bul[0].x;
    const bU = Math.sqrt(1 - 0.55 * 0.55);
    const ram = Math.PI * (3 * (1 + bU) - Math.sqrt((3 + bU) * (1 + 3 * bU)));
    let uBulge = 0, uNeck = Infinity;
    for (const p of und) { uBulge = Math.max(uBulge, p.r); uNeck = Math.min(uNeck, p.r); }
    check("T1 unduloid control e=0.55", Math.abs(per - ram) / ram < 1e-4 && Math.abs(uBulge - 1.55) < 1e-6 && Math.abs(uNeck - 0.45) < 1e-4,
        `period ${per.toFixed(6)} vs Ramanujan ${ram.toFixed(6)} (${(100 * (per - ram) / ram).toFixed(4)}%); bulge ${uBulge.toFixed(6)} (law 1.55); neck ${uNeck.toFixed(6)} (law 0.45)`);

    // ---- nodoid integration (fresh, independent of the module measurement) ----
    const nod = integrate(A_UNIT, E_ECC, 80);
    let wob = nod;
    if (RED) wob = nod.map(p => ({ ...p, r: p.r * (1 + 0.01 * Math.sin(1.7 * p.s)) }));

    // T2 first integral
    let worstFI = 0;
    for (const p of wob) worstFI = Math.max(worstFI, Math.abs(p.r * Math.cos(p.th) - H_MEAN * p.r * p.r - C_NODOID));
    check("T2 first integral r cos(th) - H r^2 == c", worstFI < 1e-9, `worst ${worstFI.toExponential(2)} (c = ${C_NODOID})`);

    // T3 geometric CMC (circumcircle k_m + cos(th)/r k_p, stride 5) — nodoid AND control
    const cmcWorst = (smp: Sample[]) => {
        let w = 0;
        for (let i = 5; i < smp.length - 5; i += 5) {
            const km = circumCurvature(smp[i - 5], smp[i], smp[i + 5]);
            const kp = Math.cos(smp[i].th) / Math.max(smp[i].r, 1e-9);
            w = Math.max(w, Math.abs((km + kp) / 2 - 1 / 2) * 2);
        }
        return w;
    };
    const wNod = cmcWorst(wob), wUnd = cmcWorst(und);
    check("T3 geometric CMC H == 1/(2a)", wNod < 5e-4 && wUnd < 5e-4, `nodoid worst ${(wNod * 100).toFixed(4)}%; unduloid control worst ${(wUnd * 100).toFixed(4)}% (circumcircle, independent of ODE state)`);

    // T4 turning law: bulges th==0 mod 2pi at r+; reversal th==+-pi mod 2pi at r-
    const nb = bulgePositions(nod, R_PLUS);
    let worstBulge = 0;
    for (const b of nb) worstBulge = Math.max(worstBulge, Math.abs(b.r - R_PLUS));
    const revs = reversalPositions(nod);
    let worstRevR = 0, worstRevCos = 0;
    for (const q of revs) {
        worstRevR = Math.max(worstRevR, Math.abs(q.r - R_MINUS));
        const i = Math.round(q.s / 0.002);
        const p = nod[Math.min(nod.length - 1, i)];
        worstRevCos = Math.max(worstRevCos, Math.abs(Math.cos(p.th) + 1));
    }
    check("T4 turning law", worstBulge < 1e-6 && worstRevR < 1e-3 && worstRevCos < 0.02 && nb.length >= 8,
        `${nb.length} bulges worst dR ${(worstBulge * 1e6).toFixed(2)}e-6 (law ${R_PLUS}); ${revs.length} reversals worst dR ${(worstRevR * 1e6).toFixed(2)}e-6 (law ${R_MINUS}), worst |cos(th)+1| ${worstRevCos.toFixed(4)} — THE TANGENT REVERSES, THE PROFILE FOLDS`);

    // T5 period law (against the exported constants): r(s) periodic; x-advance const
    const perLocal = nb[1].x - nb[0].x, arcLocal = nb[1].s - nb[0].s;
    let worstPer = 0;
    for (let i = 1; i < nb.length; i++) worstPer = Math.max(worstPer, Math.abs((nb[i].x - nb[i - 1].x) - perLocal));
    const rAt = (s: number) => { const i = Math.min(wob.length - 2, Math.max(1, Math.round(s / 0.002))); const t = s / 0.002 - i; return wob[i].r + t * (wob[i + 1].r - wob[i].r); };
    let worstOv = 0;
    for (let s = nb[0].s; s + arcLocal < wob[wob.length - 1].s - 0.01; s += 0.01) worstOv = Math.max(worstOv, Math.abs(rAt(s) - rAt(s + ARC_PERIOD_UNIT)));
    check("T5 period law", worstPer < 1e-6 && worstOv < 2e-5 && Math.abs(perLocal - PERIOD_X_UNIT) < 1e-9,
        `x-advance spread ${worstPer.toExponential(2)}; r(s+T) overlay worst ${worstOv.toExponential(2)} (RK4 ds=2e-3 bound 2e-5); export match exact`);

    // T6 overhang law (measured fresh == export)
    let best = 0, runMax = -Infinity;
    for (const p of nod) { runMax = Math.max(runMax, p.x); if (Math.cos(p.th) < 0) best = Math.max(best, runMax - p.x); }
    check("T6 overhang law (the loop)", best > 0.05 && Math.abs(best - RETREAT_UNIT) < 1e-9,
        `x-retreat per loop ${best.toFixed(4)} unit vs period ${PERIOD_X_UNIT.toFixed(4)} unit; D/P = ${(best / PERIOD_X_UNIT).toFixed(3)} (>1 since e=2.5 — the sweep threshold)`);

    // T7 self-intersection (exported crossing circles)
    const rStars = new Set(SELF_CROSS_UNIT.map(c => Math.round(c.r * 100) / 100));
    check("T7 self-intersection", SELF_CROSS_UNIT.length >= 2 && SELF_CROSS_UNIT.every(c => c.r > R_MINUS && c.r < R_PLUS) && rStars.size === 2,
        `${SELF_CROSS_UNIT.length} crossing circles over 4 adjacent pairs, radii ${[...rStars].join(" / ")} (law: in (${R_MINUS}, ${R_PLUS}), exactly 2 clusters per pair — mid-flank piercing) — THE SURFACE PASSES THROUGH ITSELF`);

    // T8 reach
    let mx = 0, mn = Infinity;
    for (const p of nod) { mx = Math.max(mx, p.r); mn = Math.min(mn, p.r); }
    check("T8 reach law", Math.abs(mx - R_PLUS) < 1e-9 && Math.abs(mn - R_MINUS) < 1e-4, `max r ${mx.toFixed(6)} (law ${R_PLUS}); min r ${mn.toFixed(6)} (law ${R_MINUS})`);

    // T9 world contract (verify the exported composition numbers)
    const P_W = PERIOD_X_UNIT * K_WORLD;
    const brassH = PERIODS * P_W;
    const topRingR = R_MINUS * K_WORLD;
    const coverOK = BEAD_R >= topRingR + 0.02;
    const embedBottom = DAIS_TOP - BOTTOM_RING_Y;
    const embedOK = embedBottom >= 0.05 && BOTTOM_RING_Y > DAIS_H_LOWER;
    const bandOK = brassH >= BRASS_MIN && brassH <= BRASS_MAX;
    const daisOK = DAIS_R_UPPER >= BULGE_WORLD + 0.15 && DAIS_R_LOWER >= DAIS_R_UPPER + 0.2;
    const crossWorld = SELF_CROSS_UNIT.map(c => ({ r: c.r * K_WORLD, y: BULGE0_Y + c.x * K_WORLD }));
    check("T9 world contract", coverOK && embedOK && bandOK && daisOK,
        `k ${K_WORLD.toFixed(6)}; P_w ${P_W.toFixed(4)}m; PERIODS ${PERIODS} (${PERIODS + 1} beads, brass ${brassH.toFixed(3)}m); bulge0 y ${BULGE0_Y}; bottom ring y ${BOTTOM_RING_Y.toFixed(3)} (embed ${embedBottom.toFixed(3)}m in upper tier); top ring y ${TOP_RING_Y.toFixed(3)} r ${topRingR.toFixed(3)}; bead r ${BEAD_R} top ${(TOP_RING_Y + BEAD_R).toFixed(3)}; crossings world r/y ${crossWorld.slice(0, 2).map(c => `${c.r.toFixed(3)}@${c.y.toFixed(3)}`).join(" ")}; envelope ±${DAIS_R_LOWER} y[0..${(TOP_RING_Y + BEAD_R).toFixed(3)}]`);

    if (fails.length) { console.error(`${fails.length} PROBE FAILS: ${fails.join(", ")}`); process.exit(1); }
    console.log("ALL PASS (probe struct241-nodoid)");
}
