// struct188-probe-cissoid.ts — STRUCTURES LANE struct-188, R11-17
// THE DELIAN ALTAR — the Cissoid of Diocles.
//
// ONE IDEA: Apollo demanded a cubical altar of exactly twice the volume;
// every compass-and-straightedge attempt failed; Diocles (~180 BC) answered
// with a new curve — the CISSOID, "ivy-like", generated between a circle
// and its tangent. This folly renders that answer standing: a stone ribbon
// traces the cissoid from its ground cusp, sweeps up THROUGH the crown of
// its brass generating arch (the exact crossing y²(2a−x)=x³ ∩ circle,
// marked by one warm bead), and climbs toward the iron TANGENT POST it
// approaches forever and never reaches (the asymptote x=2a made solid).
// On the plinth's diameter line two brass studs mark the curve's delivered
// MEAN PROPORTIONALS m₁ = a·2^{1/3} and m₂ = a·2^{2/3} — the chain
// a : m₁ : m₂ : 2a in geometric progression, whose existence IS the
// doubling (m₁³ = 2a³) — and a horizontal brass bar at the first mean's
// height carries it from the curve into the post.
//
// KIN CHECK (elevates, never competes): fresh grep cissoid/diocles/delian
// across IMPROVEMENTS + STRUCTURES-PLAN + IMPROVE-PLAN: 0/0/0. Standing
// kin: astroid/tautochrone/clothoid/brachistochrone/lemniscate = curves,
// none a CIRCULAR CUBIC, none carrying its generating-circle parent; the
// Greek construction-curve register (cissoid/conchoid/quadratrix) is
// genuinely unclaimed. Era lineage: Dürer (melencolia) -> Penrose (tribar)
// -> Diocles — the register continues to its Greek root.
//
// WORLD MAP (this file is the ONE contract — mk + decode import it):
//   Curve plane (x,y): cissoid y²(2a−x)=x³, a=S=1.65. Cusp (0,0), vertical
//   asymptote x=2a=3.30. Ribbon (stone, 96 tangent voussoirs, section
//   0.34×0.34): x ∈ [X_START, X_END] where y(X_START)=0.19 (band bottom
//   embeds into plinth top) and y(X_END)=3.60.
//   Generating arch (brass tube r 0.05): upper semicircle center (S,0)
//   radius S — from (0,0) over the crown (S,S) to (2S,0); the cissoid
//   crosses it EXACTLY at the crown.
//   Tangent post (iron 0.14×0.14): x=2S, ground to y 3.95 — the asymptote.
//   Mean studs (brass r 0.045, top 0.14): ground diameter x = m₁, m₂.
//   Mean bar (brass 0.12×0.12): y* = y_cissoid(m₁), spanning [m₁, post
//   inner face 2S−0.07] — the mean carried into the tangent.
//   Crown bead glow_ci_1 r 0.075 at (S,S) — sole night element.
//   Plinth (stone): x ∈ [−0.10, 3.44], y [0,0.10], z ±0.25.
//   Whole composition shifted x −1.67 (origin-centered). Envelope
//   3.54×3.95×0.50. Folly class, no walk owed.
import * as THREE from "three";

// ---- constants (the one contract) ----------------------------------------------------------------------
export const S = 1.65;                 // cissoid parameter a (Diocles' circle radius)
export const ASYM = 2 * S;             // 3.30 — vertical asymptote x = 2a (the tangent line)
export const SEC = 0.34;               // stone ribbon voussoir section (radial × depth)
export const N_VOUS = 96;              // voussoir count (arc-uniform)
export const RING_TUBE = 0.05;         // brass arch tube radius
export const POST_SEC = 0.14;          // iron tangent post section
export const POST_TOP = 3.95;          // post top (0.35 above ribbon top 3.60)
export const STUD_R = 0.045;
export const STUD_TOP = 0.14;          // pokes 0.04 above plinth top 0.10
export const BAR_SEC = 0.12;
export const BEAD_R = 0.075;
export const BEAD_Z = SEC / 2;          // bead seats on the ribbon's FRONT face (judge-caught occlusion
                                        // cure, struct-52 law: at z=0 it is fully inside the stone — half-
                                        // embedded at the face it reads mounted; max z 0.245 < plinth 0.25)
export const PLINTH = { x0: -0.10, x1: 3.44, h: 0.10, hz: 0.25 };
// Arch spring trim: centerline stops at plinth top (springs embed 0.05 into
// the stone; end rings bottom at y 0.05 > 0 — no below-grade tube).
export const ARCH_D = Math.asin(PLINTH.h / S);
export const SHIFT_X = -1.67;          // origin-centers the composition (envelope center x)
export const ENVELOPE = {
    min: [PLINTH.x0 + SHIFT_X, 0, -PLINTH.hz],
    max: [PLINTH.x1 + SHIFT_X, POST_TOP, PLINTH.hz],
};

// ---- the mathematics (generated, never transcribed) ----------------------------------------------------
// Construction-derived (probe caught my from-memory "textbook" form RED:
// x=2a sin²θ/cosθ, y=2a sin³θ/cos²θ does NOT satisfy the cubic). The true
// construction: line through O at slope t meets circle at P1, tangent x=2a
// at P2; P sits on the line with OP = P1P2. Slope form: x = 2a·t²/(1+t²),
// y = 2a·t³/(1+t²). In line-angle θ (t = tanθ): x = 2a·sin²θ,
// y = 2a·sin³θ/cosθ. Verified against the implicit cubic by L1.
export const cissoidX = (th: number) => 2 * S * Math.sin(th) ** 2;
export const cissoidY = (th: number) => (2 * S * Math.sin(th) ** 3) / Math.cos(th);
// Closed form (monotone on (0, 2a)): y(x) = sqrt(x³/(2a−x)) — independent derivation for cross-checks
export const yOfX = (x: number) => Math.sqrt((x * x * x) / (ASYM - x));
// θ for a given x (monotone): bisect
export const thOfX = (x: number): number => {
    let lo = 1e-4, hi = Math.PI / 2 - 1e-4;
    for (let k = 0; k < 90; k++) { const mid = (lo + hi) / 2; if (cissoidX(mid) < x) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
};
// The mean proportionals: a : m1 : m2 : 2a geometric (ratio 2^{1/3}) — the doubling
export const M1 = S * Math.cbrt(2);
export const M2 = S * Math.cbrt(4);
export const CROWN = new THREE.Vector2(S, S);          // (a,a): cissoid ∩ circle, exact
export const BAR_Y = yOfX(M1);                          // bar height = curve height at the first mean
export const POST_INNER = ASYM - POST_SEC / 2;          // 3.23 — bar lands on the post face
// Ribbon domain: X_START where y=0.19 (band bottom embeds in plinth), X_END where y=3.60.
export const X_START = (() => { let lo = 0.01, hi = ASYM - 0.01; for (let k = 0; k < 90; k++) { const mid = (lo + hi) / 2; if (yOfX(mid) < 0.19) lo = mid; else hi = mid; } return (lo + hi) / 2; })();
export const X_END = (() => { let lo = 0.01, hi = ASYM - 0.01; for (let k = 0; k < 90; k++) { const mid = (lo + hi) / 2; if (yOfX(mid) < 3.60) lo = mid; else hi = mid; } return (lo + hi) / 2; })();

// ---- laws ------------------------------------------------------------------------------------------------
let fails = 0;
const check = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name} — ${detail}`);
    if (!ok) fails++;
};

// L1 THE CUBIC LAW: parametric samples satisfy the implicit curve y²(2a−x)=x³.
{
    let worst = 0;
    const th0 = thOfX(X_START + 0.02), th1 = thOfX(X_END - 0.02);
    for (let i = 0; i <= 2000; i++) {
        const th = th0 + (i / 2000) * (th1 - th0);
        const x = cissoidX(th), y = cissoidY(th);
        if (x <= 0.02) continue;
        const err = Math.abs(y * y * (ASYM - x) - x * x * x) / (x * x * x);
        worst = Math.max(worst, err);
    }
    // cross-derivation agreement: closed form == parametric on the domain
    let worst2 = 0;
    for (let i = 0; i <= 500; i++) {
        const x = X_START + (i / 500) * (X_END - X_START);
        const th = thOfX(x);
        worst2 = Math.max(worst2, Math.abs(yOfX(x) - cissoidY(th)));
    }
    check("L1 implicit cubic + dual derivation", worst < 1e-9 && worst2 < 1e-9,
        `y²(2a−x)=x³ max rel err ${worst.toExponential(2)} (2001 parametric samples); closed-form vs parametric max ${worst2.toExponential(2)}`);
}

// L2 THE CROWN LAW: the cissoid crosses the generating circle EXACTLY at
// the crown (a,a) and exactly once.
{
    const yArc = (x: number) => Math.sqrt(Math.max(0, S * S - (x - S) * (x - S)));
    let crossings = 0, prev = 0, crownErr = Infinity;
    for (let i = 0; i <= 4000; i++) {
        const x = 0.02 + (i / 4000) * (ASYM - 0.04);
        const f = yOfX(x) - yArc(x);
        if (i > 0 && ((prev < 0 && f >= 0) || (prev > 0 && f <= 0))) crossings++;
        prev = f;
    }
    crownErr = Math.abs(yOfX(S) - S);
    check("L2 single crown crossing", crossings === 1 && crownErr < 1e-9,
        `sign changes ${crossings} (law 1); at x=a: cissoid y ${yOfX(S).toFixed(9)} vs circle crown ${S} (err ${crownErr.toExponential(2)}) — the curve passes through the arch's crown exactly`);
}

// L3 THE ARCH LAW: generating circle exact, upper arc trimmed at the
// plinth-top springs (ARCH_D); crown untouched.
{
    let worst = 0;
    for (let i = 0; i <= 500; i++) {
        const t = ARCH_D + (i / 500) * (Math.PI - 2 * ARCH_D);
        const x = S + S * Math.cos(t), y = S * Math.sin(t);
        worst = Math.max(worst, Math.abs((x - S) * (x - S) + y * y - S * S));
    }
    const yEnd = S * Math.sin(ARCH_D);
    check("L3 generating arch exact", worst < 1e-9 && Math.abs(yEnd - PLINTH.h) < 1e-9,
        `(x−a)²+y²=a² max err ${worst.toExponential(2)}; arc springs at y=${yEnd.toFixed(3)} (plinth top), t ∈ [${ARCH_D.toFixed(4)}, π−${ARCH_D.toFixed(4)}]`);
}

// L4 THE DOUBLING LAW: the mean chain a : m1 : m2 : 2a is geometric and
// m1³ = 2a³ — the cube IS doubled by the mean.
{
    const r1 = M1 / S, r2 = M2 / M1, r3 = (2 * S) / M2;
    const ok = Math.abs(r1 - r2) < 1e-12 && Math.abs(r2 - r3) < 1e-12
        && Math.abs(M1 * M2 - 2 * S * S) < 1e-12
        && Math.abs(M1 * M1 * M1 - 2 * S * S * S) < 1e-9
        && M1 > 2.07 && M1 < 2.09 && M2 > 2.61 && M2 < 2.63;
    check("L4 mean-proportional chain", ok,
        `a:m1:m2:2a = ${S}:${M1.toFixed(6)}:${M2.toFixed(6)}:${ASYM}; ratios ${r1.toFixed(12)}/${r2.toFixed(12)}/${r3.toFixed(12)} (2^{1/3}=1.259921); m1³ = ${(M1 ** 3).toFixed(6)} = 2a³ = ${2 * S ** 3}`);
}

// L5 THE BAR LAW: bar height derived from the curve at the first mean;
// bar's left end lands ON the curve centerline at that height.
{
    const ok = Math.abs(BAR_Y - yOfX(M1)) < 1e-12 && BAR_Y > 2.6 && BAR_Y < 2.9
        && Math.abs(yOfX(M1) - Math.sqrt(M1 ** 3 / (ASYM - M1))) < 1e-12;
    check("L5 mean bar at curve height", ok,
        `bar y* = ${BAR_Y.toFixed(6)} = y_cissoid(m1=${M1.toFixed(6)}); spans [${M1.toFixed(4)}, ${POST_INNER.toFixed(4)}] — the mean carried to the tangent`);
}

// L6 ARC-UNIFORM VOUSSOIRS: 96 equal-arc stations, every station on-curve.
{
    const M = 8000;
    const th0 = thOfX(X_START), th1 = thOfX(X_END);
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= M; i++) {
        const th = th1 + (i / M) * (th0 - th1); // tail (low) to cusp-side... th0 is small-x side
        pts.push([cissoidX(th), cissoidY(th)]);
    }
    // (pts ordered low-x → high-x since thOfX(X_START) < thOfX(X_END))
    const cum = [0];
    for (let i = 1; i <= M; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = cum[M];
    const stations: Array<[number, number]> = [];
    let idx = 0;
    for (let j = 0; j <= N_VOUS; j++) {
        const target = (j / N_VOUS) * total;
        while (idx < M && cum[idx + 1] < target) idx++;
        const t = (target - cum[idx]) / Math.max(1e-12, cum[idx + 1] - cum[idx]);
        const xa = pts[idx][0] + t * (pts[idx + 1][0] - pts[idx][0]);
        // SNAP to the exact curve (chord interpolation is only the arc-length
        // inverter; the station itself must be an exact curve point — the mk
        // builds voussoirs the same way)
        const th = thOfX(xa);
        stations.push([cissoidX(th), cissoidY(th)]);
    }
    const steps: number[] = [];
    for (let j = 1; j <= N_VOUS; j++) steps.push(Math.hypot(stations[j][0] - stations[j - 1][0], stations[j][1] - stations[j - 1][1]));
    const mn = Math.min(...steps), mx = Math.max(...steps);
    let worst = 0;
    for (const [x, y] of stations) worst = Math.max(worst, Math.abs(y * y * (ASYM - x) - x * x * x) / (x * x * x));
    check("L6 arc-uniform voussoirs", mx / mn < 1.02 && worst < 1e-9,
        `${N_VOUS} stations over arc ${total.toFixed(3)} m (step ${(total / N_VOUS).toFixed(4)} m, spread ratio ${(mx / mn).toFixed(4)}); on-curve rel err ${worst.toExponential(2)}`);
}

// L7 GROUNDING: cusp-side ribbon end embeds into the plinth (band bottom in
// [0, plinth top]); post base and arch feet at grade; studs inside plinth.
{
    const thS = thOfX(X_START);
    const x0 = cissoidX(thS), y0 = cissoidY(thS);
    // tangent slope at start: dy/dx from implicit: 2y·y'·(2a−x) − y² = 3x² → y' = (3x² + y²)/(2y(2a−x))
    const slope = (3 * x0 * x0 + y0 * y0) / (2 * y0 * (ASYM - x0));
    const ang = Math.atan(slope);
    // band bottom = start point − SEC/2 along the (up-left) normal
    const botY = y0 - (SEC / 2) * Math.cos(ang);
    const ok = botY >= 0 && botY <= PLINTH.h && X_START > PLINTH.x0 && X_START < PLINTH.x1
        && M1 > PLINTH.x0 && M1 < PLINTH.x1 && M2 > PLINTH.x0 && M2 < PLINTH.x1
        && ASYM > PLINTH.x0 && ASYM + POST_SEC / 2 < PLINTH.x1;
    check("L7 grounding", ok,
        `ribbon start (${x0.toFixed(3)}, ${y0.toFixed(3)}) slope ${slope.toFixed(2)}, band bottom ${botY.toFixed(3)} ∈ [0, plinth ${PLINTH.h}]; post/arch feet/studs all inside plinth x[${PLINTH.x0}, ${PLINTH.x1}]`);
}

// L8 THE ASYMPTOTE READ: ribbon (incl. band) never comes within 0.30 of
// the post's inner face — approaching forever, never arriving.
{
    let mingap = Infinity, atX = 0;
    for (let i = 0; i <= 4000; i++) {
        const x = X_START + (i / 4000) * (X_END - X_START);
        const y = yOfX(x);
        const slope = (3 * x * x + y * y) / (2 * y * (ASYM - x));
        const ang = Math.atan(slope);
        const nx = Math.sin(ang); // normal x-component (unit normal (sin, −cos) points down-right)
        const rightEdge = x + (SEC / 2) * Math.abs(nx);
        const gap = POST_INNER - rightEdge;
        if (gap < mingap) { mingap = gap; atX = x; }
    }
    check("L8 asymptote never-arrives", mingap >= 0.30,
        `min gap ribbon-right-edge to post inner face ${mingap.toFixed(3)} m at x=${atX.toFixed(3)} (law ≥ 0.30) — the climb reads asymptotic`);
}

// L9 ENVELOPE: derived, origin-centered after SHIFT_X.
{
    const w = ENVELOPE.max[0] - ENVELOPE.min[0], h = ENVELOPE.max[1] - ENVELOPE.min[1], d = ENVELOPE.max[2] - ENVELOPE.min[2];
    const cx = (ENVELOPE.min[0] + ENVELOPE.max[0]) / 2;
    check("L9 envelope", Math.abs(cx) < 1e-9 && Math.abs(w - 3.54) < 1e-9 && Math.abs(h - POST_TOP) < 1e-9 && Math.abs(d - 0.50) < 1e-9,
        `${w.toFixed(2)}×${h.toFixed(2)}×${d.toFixed(2)} origin-centered (x-shift ${SHIFT_X}), y[0, ${POST_TOP}]`);
}

// RED CONTROL: a mutant curve (a' = 2a in the parametric form, checked
// against the S-identity) must FAIL L1's law.
{
    let worst = 0;
    const S2 = 2 * S;
    for (let i = 0; i <= 500; i++) {
        const th = 0.2 + (i / 500) * 0.7;
        const x = (2 * S2 * Math.sin(th) ** 2) / Math.cos(th);
        const y = (2 * S2 * Math.sin(th) ** 3) / Math.cos(th) ** 2;
        if (x <= 0.02) continue;
        worst = Math.max(worst, Math.abs(y * y * (ASYM - x) - x * x * x) / (x * x * x));
    }
    check("RED control (mutant a'=2a fails the cubic)", worst > 0.01, `mutant max rel err ${worst.toFixed(3)} (must be > 0.01)`);
}

console.log(fails === 0 ? "\nALL CHECKS PASS" : `\n${fails} CHECK(S) FAILED`);
if (fails) process.exit(1);
