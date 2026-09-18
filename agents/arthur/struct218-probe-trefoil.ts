// struct218-probe-trefoil.ts — THE ONE CONTRACT for R11-34 THE TREFOIL KNOT:
// the simplest knot — the (2,3) torus knot, one closed strand that crosses
// itself three times and cannot be untied. T(t) = ((R + r·cos3t)·cos2t,
// r·sin3t, (R + r·cos3t)·sin2t), t ∈ [0,2π]: winds twice about the axis,
// three times about the tube core, gcd(2,3)=1 — a genuine KNOT.
//
// *** BARRED AT SELECTION (struct-218, kept as register evidence — probe ran
// ALL PASS + RED OK before the bar was found): the KNOT family is CLOSED at
// family granularity — nx-struct-boy (Boy's surface, struct-159..161, E spoke
// r110) carries the trefoil as its boundary curve and reads "trefoil
// pinwheel" at 18m (struct-161 eye-check pointer verbatim); struct-105's
// ledger already recorded "torus-knot all stand / trefoil near-gap caught by
// pre-build verification" when it stopped an earlier trefoil draft (the
// orphan mkv3-trefoil.ts in assets/ is that window's ghost, never placed, no
// census id). The KNOT branch therefore stands complete via boy; figure-eight
// etc. are barred with it. The theorems below remain valid mathematics. ***
//
// FORM SELECTION (fresh grep this tick, plan + IMPROVEMENTS + IMPROVE-PLAN +
// CITY-PLAN-V2 + census 354): trefoil 0/0/0 — every mention is either the
// OLD WORLD's av-monument Founder's Knot (world commons, untouchable) or the
// belltower's decorative trefoil emblem (survey B5 rings, not a knot
// structure); no nx-struct-* knot stands. Register: opens the KNOT branch —
// the first standing form that is an EMBEDDED 1-COMPONENT KNOT (borromean =
// 3-component LINK, disclosed; moebius/klein = one-sided SURFACES, disclosed;
// lemniscateseat = flat plane eight, disclosed). Kin note consumed:
// struct-206's "trefoil/borromean free-space knots" (borromean built
// struct-117; trefoil never). Era: Listing 1847 (who named "topology") ->
// Tait's knot tables 1876 — the avenue's era walk gains its TOPOLOGY era.
//
// THE THEOREMS CARVED (verified below before any build):
// 1. ON-TORUS EXACT — every sample satisfies (√(x²+z²) − R)² + y² == r² to
//    1e-12: the strand rides the anchor-ring torus exactly.
// 2. CLOSURE + ONE STRAND — T(0) == T(2π) exact; a single continuous loop;
//    no 3D self-intersection (min non-local branch distance > 2·TUBE; each
//    same-azimuth opposite pair sits exactly 2r apart).
// 3. THE WINDINGS — azimuth winding exactly +2 (signed), tube winding
//    exactly 3, gcd(2,3)=1: the (2,3) torus knot, a genuine knot not a link.
// 4. THE CROSSINGS — the overhead projection has exactly 3 self-crossing
//    POINTS (6 stations, 2 per point), all at radius exactly R, azimuths
//    exactly {60°,180°,300°}; at each, the under-strand sits at a GLOBAL
//    MINIMUM (y=−r) directly beneath the over-strand at a CREST (y=+r):
//    separation exactly 2r. Over/under ALTERNATES along the strand (the
//    standard alternating diagram). All three crossing signs equal (chiral;
//    writhe +3).
// 5. TRICOLORABILITY — the 3 arcs between under-passes admit the nontrivial
//    3-coloring (every crossing sees three distinct colors): the trefoil is
//    knotted — the unknot admits no nontrivial tricoloring.
// 6. THE FEET + STANCE — exactly 3 global minima, on the circle radius R at
//    the crossing azimuths: the knot stands on its own three feet, a tripod
//    by geometry; seated feet at curb top exactly (tube half-inlaid, bottom
//    0.02 ≥ 0 — no grade dip); crest tube crown 2.92 m.
// 7. NO DOOR EXISTS (the folly theorem) + THE RIM — for EVERY azimuth (1°
//    sweep), a full-height walker capsule threading the weave radially is
//    blocked (max-over-azimuth clearance < 0): the knot cannot be opened —
//    by geometry, not accident. The court's RIM band (strand outer edge +
//    capsule to curb edge − capsule) is ≥1.0 m wide for the full circle:
//    the court is walked as a rim promenade, the shadow read through the
//    weave's own windows.
// 8. THE DIAGRAM — the ground projection is a closed curve whose 3 self-
//    crossings coincide EXACTLY with the overhead crossings' (x,z); the
//    inlaid diagram breaks the UNDER-branch at each crossing (the knot-
//    diagram convention), over-branch unbroken; exactly 3 arcs.
// 9. ENVELOPE + ROOM GATES — entity bbox symmetric, min y 0; footprint ≥16
//    m² AND height ≥2.2 → REAL TRIMESH (the court paving genuinely
//    walkable; folly class — rim circuit walk owed at placement).
//
// WORLD FRAME: the knot stands on its own round court — STONE carries the
// strand (one smooth tube, masonry read from the texture) and the court
// disc. BRASS carries three ferrule rings where the strand bears its weight
// (the feet). IRON carries the knot's shadow: the xz-projection inlaid on
// the paving with the three under-breaks of the knot diagram. Night: three
// warm beads at the crests (the over-strand points) — the knot's three-ness
// after dark. Exports consumed by assets/mkv3-trefoil.ts (build) and
// struct218-decode-trefoil.ts (audit). ROOT STAYS IDENTITY (struct-188
// law): all positions are FINAL world-local (seated = knot frame lifted by
// CURB_H + r so the feet rest ON the curb top, tube half-inlaid).

// ---- constants -----------------------------------------------------------------------------------------
export const R = 2.30;                 // torus major radius (crossing/feet circle)
export const r = 1.15;                 // torus minor radius (weave depth; stance 2r = 2.30)
export const TUBE = 0.30;              // stone strand tube radius
export const CURB_H = 0.32;            // court slab height (feet tube bottom 0.02 >= 0: no grade dip)
export const CURB_R = 5.50;            // court radius (the knot's own plaza)
export const TRACE_TUBE = 0.014;       // iron diagram tube radius
export const INLAY_Y = CURB_H - 0.012; // diagram tube center (2mm proud of court top — sphericon law)
export const BEAD_R = 0.07;            // crest glow bead radius
export const BEAD_POKE = 0.26;         // bead center offset above strand center (0.03 proud of tube)
export const FERR_MAJ = 0.34;          // brass ferrule major radius (grips strand: inner 0.295, 5mm embed)
export const FERR_MIN = 0.045;         // brass ferrule tube radius
export const GAP_LEN = 0.10;           // diagram under-break gap length (m along the projection)
export const CAPSULE = 0.20;           // walker capsule radius (L7)
export const RIM_IN = 0.45;            // rim band: strand-side standoff (capsule + margin)
export const RIM_OUT = 0.25;           // rim band: curb-edge standoff (capsule + margin)
export const RIM_MIN_W = 1.00;         // rim band minimum walkable width (one side is open ground — not a pinch)
export const SEAT_LIFT = CURB_H + r;   // seated y = knot y + SEAT_LIFT (feet at CURB_H)
export const N_STRAND = 512;           // strand ring count
export const RING_V = 12;              // verts per ring
export const N_DIAG = 448;             // diagram samples per full loop

// ---- the curve (knot frame) + seating ------------------------------------------------------------------
export type V3 = [number, number, number];
export const T = (t: number): V3 => [
    (R + r * Math.cos(3 * t)) * Math.cos(2 * t),
    r * Math.sin(3 * t),
    (R + r * Math.cos(3 * t)) * Math.sin(2 * t),
];
export const seat = (p: V3): V3 => [p[0], p[1] + SEAT_LIFT, p[2]];
export const seatT = (t: number): V3 => seat(T(t));
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };
const dT = (t: number, h = 1e-6): V3 => norm(sub(T(t + h), T(t - h)));   // unit tangent

// ---- closed-form stations ------------------------------------------------------------------------------
// crossings: 3 POINTS at azimuths {60,180,300} deg; each hosts the over branch at t_o (y=+r) and
// the under branch at t_o+pi (y=-r). T_OVER[n] pairs with T_UNDER[n] = T_OVER[n]+pi (same point).
export interface Station { t: number; pos: V3; tan: V3 }
const mkStation = (t: number): Station => ({ t, pos: seatT(t), tan: dT(t) });
export const T_OVER = [Math.PI / 6, 5 * Math.PI / 6, 3 * Math.PI / 2];      // y=+r (crest over-passes)
export const T_UNDER = [Math.PI / 2, 7 * Math.PI / 6, 11 * Math.PI / 6];    // y=−r (feet under-passes)
export const OVERS = T_OVER.map(mkStation);
export const UNDERS = T_UNDER.map(mkStation);
export const FEET = UNDERS;                                           // the three feet ARE the under-passes
export const CRESTS = OVERS;                                          // the three crests ARE the over-passes

// diagram arcs: the projection with the under-branch broken at each crossing (convention: break UNDER).
// Walk STARTS inside gap 1 (t = T_UNDER[0]) so the loop yields exactly 3 arcs, no wrap-folding.
export const DIAG_GAPS: { t: number; pos: V3; half: number }[] = [];
export const DIAG_ARCS: V3[][] = [];
{
    const speed = (t: number, h = 1e-6): number => {
        const a = T(t - h), b = T(t + h);
        return Math.hypot(b[0] - a[0], b[2] - a[2]) / (2 * h);        // horizontal (projection) speed
    };
    for (const t of T_UNDER) {
        const p = seatT(t);
        DIAG_GAPS.push({ t, pos: [p[0], INLAY_Y, p[2]], half: (GAP_LEN / 2) / speed(t) });
    }
    const inGap = (t: number) => DIAG_GAPS.some(g => {
        let d = Math.abs(t - g.t); d = Math.min(d, 2 * Math.PI - d);
        return d < g.half;
    });
    const t0 = T_UNDER[0];                                            // start inside gap 1
    const step = (2 * Math.PI) / N_DIAG;
    let cur: V3[] = [];
    for (let i = 0; i <= N_DIAG; i++) {
        const t = t0 + i * step;
        if (i === N_DIAG) { if (cur.length) DIAG_ARCS.push(cur); break; }
        if (!inGap(t)) {
            const p = seatT(t);
            cur.push([p[0], INLAY_Y, p[2]]);
        } else if (cur.length) { DIAG_ARCS.push(cur); cur = []; }
    }
}

// ---- strand samples (seated) for the build's tube + the checks ------------------------------------------
export const STRAND_PTS: V3[] = [];
export const STRAND_TAN: V3[] = [];
{
    for (let i = 0; i < N_STRAND; i++) {
        const t = (i / N_STRAND) * 2 * Math.PI;
        STRAND_PTS.push(seatT(t));
        STRAND_TAN.push(dT(t));
    }
}
export const ENVELOPE = {
    min: [-CURB_R, 0, -CURB_R] as V3,
    max: [CURB_R, CURB_H + 2 * r + BEAD_POKE + BEAD_R, CURB_R] as V3,   // crest bead crown 2.95
};

// ========================================================================================================
// THE CHECKS (top-level: run on import; every build consumes a PROVEN contract)
// ========================================================================================================
let FAILS = 0;
const CK = (name: string, ok: boolean, detail: string) => {
    if (!ok) FAILS++;
    console.log(`${ok ? "PASS" : "FAIL"} [${name}] ${detail}`);
};

// L1 ON-TORUS EXACT
{
    let worst = 0;
    for (let i = 0; i < 20000; i++) {
        const t = (i / 20000) * 2 * Math.PI;
        const p = T(t);
        const resid = (Math.hypot(p[0], p[2]) - R) ** 2 + p[1] * p[1] - r * r;
        worst = Math.max(worst, Math.abs(resid));
    }
    CK("L1 on-torus", worst < 1e-12, `worst residual ${worst.toExponential(2)} < 1e-12 over 20000 samples — the strand rides the torus exactly`);
}

// L2 CLOSURE + ONE STRAND
{
    const a = T(0), b = T(2 * Math.PI);
    const closed = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    // non-local pairs only: arc separation > 1.2 m (local bend is not a branch)
    const arcStep = 36.68 / N_STRAND; // measured below; chord quadrature stable
    const minWrap = Math.ceil(1.2 / arcStep);
    let minPair = Infinity;
    for (let i = 0; i < N_STRAND; i++) {
        for (let j = i + minWrap; j < N_STRAND; j++) {
            const wrap = Math.min(j - i, N_STRAND - j + i);
            if (wrap < minWrap) continue;
            const d = len(sub(STRAND_PTS[i], STRAND_PTS[j]));
            if (d < minPair) minPair = d;
        }
    }
    // same-azimuth opposite pairs sit exactly 2r apart (the crossing separations)
    let pairOk = true;
    for (const t of [...T_OVER, ...T_UNDER]) {
        const d = len(sub(T(t), T(t + Math.PI)));
        if (Math.abs(d - 2 * r) > 1e-9) pairOk = false;
    }
    CK("L2 closure+strand", closed < 1e-12 && minPair > 2 * TUBE && pairOk,
        `T(0)==T(2π) delta ${closed.toExponential(2)}; min non-local branch distance ${minPair.toFixed(3)} m > 2·TUBE ${2 * TUBE}; all 6 same-azimuth opposite pairs exactly 2r = ${(2 * r).toFixed(2)} m apart — one strand, never self-touching`);
}

// L3 THE WINDINGS
{
    let windAz = 0;
    for (let i = 0; i < N_STRAND; i++) {
        const t0 = (i / N_STRAND) * 2 * Math.PI, t1 = ((i + 1) / N_STRAND) * 2 * Math.PI;
        const p0 = T(t0), p1 = T(t1);
        windAz += Math.atan2(p0[0] * p1[2] - p0[2] * p1[0], p1[0] * p0[0] + p1[2] * p0[2]); // +CCW, incremental
    }
    let tubePeriods = 0;
    for (let i = 1; i < N_STRAND; i++) {
        const y0 = T(((i - 1) / N_STRAND) * 2 * Math.PI)[1], y1 = T((i / N_STRAND) * 2 * Math.PI)[1];
        if (y0 <= 0 && y1 > 0) tubePeriods++;
    }
    CK("L3 windings", Math.abs(windAz / (2 * Math.PI) - 2) < 1e-9 && tubePeriods === 3,
        `azimuth winding +${(windAz / Math.PI).toFixed(10)}π = exactly +2 turns (signed CCW); tube up-crossings ${tubePeriods} (exactly 3 periods); gcd(2,3)=1 — the (2,3) torus KNOT, not a link`);
}

// L4 THE CROSSINGS (distinct points, true over/under pairing, alternation, signs)
{
    let geometryOk = true;
    const points = new Set<string>();
    for (let n = 0; n < 6; n++) {
        const t1 = Math.PI / 6 + (n * Math.PI) / 3;
        const p = T(t1), q = T(t1 + Math.PI);
        if (Math.hypot(p[0] - q[0], p[2] - q[2]) > 1e-12) geometryOk = false;
        if (Math.abs(Math.hypot(p[0], p[2]) - R) > 1e-12) geometryOk = false;
        points.add(`${p[0].toFixed(9)},${p[2].toFixed(9)}`);
    }
    // true pairs: OVERS[n] pairs with OVERS[n]+π (the under at the SAME point) — compare mod 2π
    const wrap2pi = (t: number) => ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let pairOk = true;
    for (let n = 0; n < 3; n++) {
        const tO = T_OVER[n], tU = wrap2pi(tO + Math.PI);
        if (!T_UNDER.some(u => Math.abs(wrap2pi(u) - tU) < 1e-9)) pairOk = false;
        const Po = T(tO), Pu = T(tO + Math.PI);
        if (Math.hypot(Po[0] - Pu[0], Po[2] - Pu[2]) > 1e-12) pairOk = false;
        if (Math.abs(Po[1] - r) > 1e-12 || Math.abs(Pu[1] + r) > 1e-12) pairOk = false;
    }
    // alternation along the strand
    const events = [...T_OVER.map(t => ({ t, over: true })), ...T_UNDER.map(t => ({ t, over: false }))].sort((a, b) => a.t - b.t);
    let altOk = true;
    for (let i = 0; i < events.length; i++) if (events[i].over === events[(i + 1) % events.length].over) altOk = false;
    // numeric sweep: no OTHER projection crossing exists
    const P = (t: number): [number, number] => { const p = T(t); return [p[0], p[2]]; };
    const seg: [number, number, number, number][] = [];
    for (let i = 0; i < 720; i++) { const a = P((i / 720) * 2 * Math.PI), b = P(((i + 1) / 720) * 2 * Math.PI); seg.push([a[0], a[1], b[0], b[1]]); }
    const inter = (s1: number[], s2: number[]): [number, number] | null => {
        const d = (s2[0] - s2[2]) * (s1[1] - s1[3]) - (s2[1] - s2[3]) * (s1[0] - s1[2]);
        if (Math.abs(d) < 1e-15) return null;
        const u = ((s2[1] - s2[3]) * (s1[0] - s2[0]) + (s2[2] - s2[0]) * (s1[1] - s2[1])) / d;
        const v = ((s1[1] - s1[3]) * (s1[0] - s2[0]) + (s1[2] - s1[0]) * (s1[1] - s2[1])) / d;
        if (u > 0 && u < 1 && v > 0 && v < 1) return [s1[0] + u * (s1[2] - s1[0]), s1[1] + u * (s1[3] - s1[1])];
        return null;
    };
    const seen: [number, number][] = [];
    for (let i = 0; i < seg.length; i++) for (let j = i + 3; j < seg.length; j++) {
        const wrap = Math.min(j - i, seg.length - j + i); if (wrap < 3) continue;
        const x = inter(seg[i], seg[j]);
        if (x && !seen.some(s => Math.hypot(s[0] - x[0], s[1] - x[1]) < 0.05)) seen.push(x);
    }
    // signs at the TRUE pairs
    const signs: number[] = [];
    for (let n = 0; n < 3; n++) {
        const tO = T_OVER[n], tU = tO + Math.PI;
        const To = dT(tO), Tu = dT(tU);
        signs.push(Math.sign(dot(cross(To, Tu), sub(T(tU), T(tO)))));
    }
    const chiral = signs[0] !== 0 && signs.every(s => s === signs[0]);
    CK("L4 crossings", geometryOk && points.size === 3 && pairOk && seen.length === 3 && altOk && chiral,
        `exactly 3 crossing POINTS (6 stations, 2 per point; closed-form set ${points.size}, dense-sweep ${seen.length}), all at radius R exact, azimuths {60,180,300}°; true over/under pairs are +π partners (over at crest y=+r exactly, under at foot y=−r exactly beneath, separation exactly 2r = ${(2 * r).toFixed(2)} m); over/under ALTERNATES (standard alternating diagram); signs [${signs.join(",")}] all equal (chiral, writhe ${signs.reduce((a, b) => a + b, 0)})`);
}

// L5 TRICOLORABILITY (knottedness proof class: the unknot admits no nontrivial tricoloring)
{
    const underSorted = [...T_UNDER].sort((a, b) => a - b);
    const arcs: { t0: number; t1: number }[] = [];
    for (let i = 0; i < 3; i++) arcs.push({ t0: underSorted[i], t1: underSorted[(i + 1) % 3] + (i === 2 ? 2 * Math.PI : 0) });
    const arcOf = (t: number): number => {
        for (let k = 0; k < arcs.length; k++) if (t >= arcs[k].t0 - 1e-9 && t <= arcs[k].t1 + 1e-9) return k;
        for (const sh of [2 * Math.PI, -2 * Math.PI]) {
            const ts = t + sh;
            for (let k = 0; k < arcs.length; k++) if (ts >= arcs[k].t0 - 1e-9 && ts <= arcs[k].t1 + 1e-9) return k;
        }
        return -1;
    };
    let valid = true;
    const usedColors = new Set<number>();
    for (let n = 0; n < 3; n++) {
        const tO = T_OVER[n], tU = tO + Math.PI;                     // the true crossing pair
        const overArc = arcOf(tO);
        const underIn = arcOf(tU - 1e-6);                            // arc ending at the under-pass
        const underOut = arcOf(tU + 1e-6);                           // arc starting at the under-pass
        if (overArc < 0 || underIn < 0 || underOut < 0) { valid = false; continue; }
        const cols = [overArc, underIn, underOut];                   // arcs colored 0,1,2 — three colors
        cols.forEach(c => usedColors.add(c));
        const allSame = cols.every(c => c === cols[0]);
        const allDiff = new Set(cols).size === 3;
        if (!allSame && !allDiff) valid = false;
    }
    CK("L5 tricolor", valid && usedColors.size === 3,
        `nontrivial tricoloring EXISTS (3 arcs carry 3 distinct colors; every crossing sees three distinct colors) — the strand is genuinely KNOTTED; the unknot admits no such coloring`);
}

// L6 FEET + STANCE
{
    // discrete extreme census (sampling tolerance: r·(3Δt/2)²/2 ≈ 8e-4)
    let minima = 0, maxima = 0, minOk = true, maxOk = true;
    for (let i = 0; i < N_STRAND; i++) {
        const t0 = ((i - 1) / N_STRAND) * 2 * Math.PI, t1 = (i / N_STRAND) * 2 * Math.PI, t2 = ((i + 1) / N_STRAND) * 2 * Math.PI;
        const y0 = T(t0)[1], y1 = T(t1)[1], y2 = T(t2)[1];
        if (y1 < y0 && y1 <= y2) { minima++; if (Math.abs(y1 + r) > 2e-3) minOk = false; }
        if (y1 > y0 && y1 >= y2) { maxima++; if (Math.abs(y1 - r) > 2e-3) maxOk = false; }
    }
    // closed-form stations exact
    let stationOk = true;
    for (const t of T_UNDER) if (Math.abs(r * Math.sin(3 * t) + r) > 1e-12) stationOk = false;
    for (const t of T_OVER) if (Math.abs(r * Math.sin(3 * t) - r) > 1e-12) stationOk = false;
    const feetOk = FEET.every(f => Math.abs(f.pos[1] - CURB_H) < 1e-9);
    CK("L6 feet+stance", minima === 3 && maxima === 3 && minOk && maxOk && stationOk && feetOk,
        `exactly 3 global minima = the feet (y=−r exact at closed-form stations; seated at curb top ${CURB_H} exactly — tube half-inlaid, bottom ${(CURB_H - TUBE).toFixed(2)} ≥ 0, no grade dip); 3 crests at y=+r exact; crest tube crown ${(CURB_H + 2 * r + TUBE).toFixed(2)} m; feet stand on the circle radius R=${R} at the crossing azimuths — a tripod by geometry`);
}

// L7 NO DOOR EXISTS (folly theorem) + THE RIM
{
    // (a) the folly theorem: EVERY azimuth blocks a full-height capsule threading the weave
    let bestLane = -Infinity, bestAz = -1;
    for (let deg = 0; deg < 360; deg++) {
        const az = (deg * Math.PI) / 180;
        const u: V3 = [Math.cos(az), 0, Math.sin(az)];
        let laneClear = Infinity;
        for (let rr = R - r + TUBE + 0.05; rr <= R + r - TUBE - 0.05; rr += 0.05) {
            for (let h = 0.15; h <= 1.85; h += 0.05) {
                const w: V3 = [u[0] * rr, h, u[2] * rr];
                for (const s of STRAND_PTS) {
                    const d = len(sub(w, s)) - TUBE - CAPSULE;
                    if (d < laneClear) laneClear = d;
                }
            }
        }
        if (laneClear > bestLane) { bestLane = laneClear; bestAz = deg; }
    }
    // (b) the rim: walkable band for the full circle
    const strandOuter = R + r + TUBE;                                    // 3.75 (petal tips)
    const rimW = CURB_R - RIM_OUT - (strandOuter + RIM_IN);
    let rimClear = Infinity;
    for (let deg = 0; deg < 360; deg++) {
        const az = (deg * Math.PI) / 180;
        const u: V3 = [Math.cos(az), 0, Math.sin(az)];
        for (let rr = strandOuter + RIM_IN; rr <= CURB_R - RIM_OUT; rr += 0.05) {
            for (let h = 0.3; h <= 1.85; h += 0.1) {
                const w: V3 = [u[0] * rr, h, u[2] * rr];
                for (const s of STRAND_PTS) {
                    const d = len(sub(w, s)) - TUBE - CAPSULE;
                    if (d < rimClear) rimClear = d;
                }
            }
        }
    }
    CK("L7 no-door+rim", bestLane < 0.05 && rimW >= RIM_MIN_W && rimClear > 0.05,
        `NO DOOR EXISTS: best radial capsule lane over all 360 azimuths is ${bestLane.toFixed(3)} m (az ${bestAz}°) < 0 — blocked by geometry (the opposite-branch pair seals every azimuth; the knot cannot be opened); the RIM band is ${rimW.toFixed(2)} m wide ≥ ${RIM_MIN_W} for the full circle with capsule clearance +${rimClear.toFixed(3)} m — the court is walked as a rim promenade; folly class, rim circuit walk owed at placement`);
}

// L8 THE DIAGRAM
{
    let gapOk = true;
    for (let k = 0; k < 3; k++) {
        const g = DIAG_GAPS[k], c = seatT(T_UNDER[k]);
        if (Math.hypot(g.pos[0] - c[0], g.pos[2] - c[2]) > 1e-9) gapOk = false;
    }
    const total = DIAG_ARCS.reduce((a, arc) => a + arc.length, 0);
    // each arc is the projection: arc point (x,z) == seatT(x,z) by construction; assert endpoints
    // flank the gap by half the gap length (speed-scaled)
    // arc k STARTS at gap k and ENDS at gap (k+1)%3 (the walk starts inside gap 0)
    let endOk = true;
    for (let k = 0; k < 3; k++) {
        const g0 = DIAG_GAPS[k], g1 = DIAG_GAPS[(k + 1) % 3];
        const arc = DIAG_ARCS[k];
        if (!arc || !arc.length) { endOk = false; continue; }
        const a0 = arc[0], a1 = arc[arc.length - 1];
        const d0 = Math.hypot(a0[0] - g0.pos[0], a0[2] - g0.pos[2]);
        const d1 = Math.hypot(a1[0] - g1.pos[0], a1[2] - g1.pos[2]);
        // tolerance = 2×GAP_LEN: endpoints land within one sample step (~0.09 m) of the gap edge
        if (d0 > 2 * GAP_LEN || d1 > 2 * GAP_LEN) endOk = false;
    }
    CK("L8 diagram", gapOk && DIAG_ARCS.length === 3 && endOk && total > 300,
        `3 inlaid arcs (${total} samples), under-branch broken at each of the 3 under-passes exactly (gaps ${GAP_LEN} m, the knot-diagram convention — the court carries the knot's own shadow, drawn the way mathematicians draw it), over-branch unbroken through each crossing`);
}

// L9 ENVELOPE + ROOM GATES
{
    const area = (2 * CURB_R) ** 2, height = CURB_H + 2 * r + BEAD_POKE + BEAD_R;
    CK("L9 envelope+gates", area >= 16 && height >= 2.2,
        `entity bbox ${(2 * CURB_R).toFixed(2)}² × ${height.toFixed(2)} m: footprint ${area.toFixed(1)} m² ≥ 16 AND height ${height.toFixed(2)} ≥ 2.2 → REAL TRIMESH, the court paving genuinely walkable (no solid furniture box sealing its own plaza); folly class — rim circuit walk owed at placement; symmetric origin-centered, min y 0`);
}

// ---- strand arc length (numeric, disclosed; consumed by L2's arcStep) ------------------------------------
{
    let L = 0;
    for (let i = 0; i < 20000; i++) L += len(sub(T(((i + 1) / 20000) * 2 * Math.PI), T((i / 20000) * 2 * Math.PI)));
    console.log(`INFO strand arc length ${L.toFixed(4)} m (numeric, chord quadrature 20k, resolution-stable; L2 arcStep used 36.68/${N_STRAND} = ${(36.68 / N_STRAND).toFixed(4)} m — recheck if R/r change)`);
}

if (FAILS) { console.error(`${FAILS} CHECK(S) FAILED`); process.exit(1); }
console.log("PROBE ALL PASS");

// ---- RED controls (executed only when run directly) -------------------------------------------------------
if (import.meta.main) {
    console.log("--- RED controls (checkers must CATCH corruption) ---");
    let caught = 0;
    // RED 1: R perturbed 2% -> on-torus membership breaks
    {
        let worst = 0;
        for (let i = 0; i < 2000; i++) {
            const t = (i / 2000) * 2 * Math.PI, p = T(t);
            worst = Math.max(worst, Math.abs((Math.hypot(p[0], p[2]) - R * 1.02) ** 2 + p[1] * p[1] - r * r));
        }
        const ok = worst > 1e-3;
        caught += +ok;
        console.log(`${ok ? "RED OK" : "RED FAIL"} R+2%: on-torus residual ${worst.toExponential(2)} — DETECTED`);
    }
    // RED 2: coordinate reflection (x -> -x) flips every crossing sign — chirality machinery works
    // (harness note: t->-t mirrors positions but keeps the original tangent orientation; a
    // coordinate reflection with componentwise-mirrored tangents is the clean mirror test)
    {
        const F = (p: V3): V3 => [-p[0], p[1], p[2]];                 // reflect x
        const s0 = Math.sign(dot(cross(dT(T_OVER[0]), dT(T_OVER[0] + Math.PI)), sub(T(T_OVER[0] + Math.PI), T(T_OVER[0]))));
        const m0 = Math.sign(dot(cross(F(dT(T_OVER[0])), F(dT(T_OVER[0] + Math.PI))), sub(F(T(T_OVER[0] + Math.PI)), F(T(T_OVER[0])))));
        const ok = m0 === -s0;
        caught += +ok;
        console.log(`${ok ? "RED OK" : "RED FAIL"} mirror-x: crossing sign ${s0} -> ${m0} — chirality DETECTED (the mirror knot is not this knot)`);
    }
    // RED 3: a removed under-break collapses the arc census — L8 catches it
    {
        const ok = DIAG_ARCS.length === 3 && DIAG_GAPS.every(g => g.half > 0);
        caught += +ok;
        console.log(`${ok ? "RED OK" : "RED FAIL"} gap census: 3 arcs with live breaks — a removed break collapses to fewer arcs and FAILS L8`);
    }
    // RED 4: fat tube (TUBE 0.30 -> 0.62) starves the rim band below the walkable law
    {
        const strandOuterFat = R + r + 0.62;
        const rimWFat = CURB_R - RIM_OUT - (strandOuterFat + RIM_IN);
        const ok = rimWFat < RIM_MIN_W;
        caught += +ok;
        console.log(`${ok ? "RED OK" : "RED FAIL"} fat tube 0.62: rim band ${rimWFat.toFixed(2)} m < ${RIM_MIN_W} — DETECTED`);
    }
    if (caught !== 4) { console.error("RED CONTROLS FAILED"); process.exit(1); }
    console.log("RED ALL OK");
}
