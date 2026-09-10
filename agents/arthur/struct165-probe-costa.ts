// struct165-probe-costa.ts v2 — R11-5 THE COSTA SURFACE: math probe BEFORE build.
// v1 (RK4 on wp'' = 6wp^2 - g2/2 from Laurent seeds) FAILED P2/P3/P4: residual
// scales LINEARLY with step (3.9e6 -> 3.9e4 over 100x refinement) — structural
// drift, not truncation. v2 replaces ODE integration with the standard
// numerical method for a KNOWN lattice: theta-function series.
//
//   zeta(w) = pi*w + pi * th1'(z~)/th1(z~)          z~ = pi*w   (2*w1 = 1)
//   wp(w)   = -pi - pi^2 * [th1''th1 - th1'^2]/th1^2
//   wp'(w)  = pi^3 * [T'' terms]  (quotient-rule composition, see code)
// with th1(z,q) = 2*sum_{n>=0} (-1)^n q^{(n+1/2)^2} sin((2n+1)z), q = e^{-pi}
// (tau = i, lattice Z + iZ, half-periods 1/2, i/2), and eta1 = pi/2 derived
// exactly: square lattice => zeta(iw) = -i*zeta(w) => eta3 = -i*eta1;
// Legendre eta1*w3 - eta3*w1 = pi*i/2 => i*eta1 = pi*i/2 => eta1 = pi/2.
// (The same cancellation logic makes the Laurent constants work out; the
// checks below verify at machine precision rather than trusting derivation.)
//
// Source of Gray's parametrization: tpfto (J. M.), 2012, simplification of
// Gray (1997); constants cross-checked against MathWorld's Costa page.
//
// CHECKS (all must PASS before any build):
//  C1 Laurent near 0: wp*w^2 -> 1, zeta*w -> 1 (|w| = 1e-3).
//  C2 half-periods: wp(1/2) = +sqrt(g2)/2, wp(i/2) = -sqrt(g2)/2,
//     wp((1+i)/2) = 0 (<= 1e-9); zeta(1/2) = pi/2, zeta(i/2) = -i*pi/2.
//  C3 double periodicity: wp(w+1) = wp(w), wp(w+i) = wp(w) at samples.
//  C4 ODE: wp'^2 = 4wp^3 - g2*wp at interior samples (rel err).
//  C5 zeta' = -wp: central difference on the zeta FORMULA vs wp FORMULA.
//  C6 quasi-periods: zeta(w+1) = zeta(w) + pi, zeta(w+i) = zeta(w) - i*pi.
//  C7 X survey: ends (|X| explodes at 0, 1/2, i/2 punctures; bounded at
//     center (1+i)/2), extents at image-space cut radii, symmetry pairs.
// ---- theta machinery --------------------------------------------------------------------------------
const Q = Math.exp(-Math.PI);            // tau = i
const NTERMS = 14;                        // q^{(13.5)^2} = e^{-pi*182} ~ 1e-248: machine-exact
// series coefficient a_n = 2*(-1)^n*q^{(n+1/2)^2}, harmonic k = 2n+1
const AN: number[] = [], KK: number[] = [];
for (let n = 0; n < NTERMS; n++) {
    AN.push(2 * (n % 2 ? -1 : 1) * Math.pow(Q, (n + 0.5) * (n + 0.5)));
    KK.push(2 * n + 1);
}
const sin = Math.sin, cos = Math.cos;
// th1 and derivatives up to 3rd at real angle z (z~ complex: pass z~ = x+iy,
// sin(x+iy) = sin x cosh y + i cos x sinh y, cos(x+iy) = cos x cosh y - i sin x sinh y)
type C = { re: number; im: number };
const cc = (re: number, im = 0): C => ({ re, im });
const cadd = (a: C, b: C): C => cc(a.re + b.re, a.im + b.im);
const csub = (a: C, b: C): C => cc(a.re - b.re, a.im - b.im);
const cmul = (a: C, b: C): C => cc(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cdiv = (a: C, b: C): C => { const d = b.re * b.re + b.im * b.im; return cc((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const cscl = (a: C, s: number): C => cc(a.re * s, a.im * s);
const cabs = (a: C) => Math.hypot(a.re, a.im);

function sinC(z: C): C { return cc(sin(z.re) * Math.cosh(z.im), cos(z.re) * Math.sinh(z.im)); }
function cosC(z: C): C { return cc(cos(z.re) * Math.cosh(z.im), -sin(z.re) * Math.sinh(z.im)); }

// derivative order d: d^d/dz^d sin(kz) = k^d * sin(kz + d*pi/2)
function th1(z: C, d: number): C {
    let s = cc(0, 0);
    for (let n = 0; n < NTERMS; n++) {
        const k = KK[n];
        // d^d/dz^d sin(kz) = k^d sin(kz + d*pi/2): the shift is REAL (real part of the argument)
        const arg = cc(k * z.re + (d * Math.PI) / 2, k * z.im);
        s = cadd(s, cscl(sinC(arg), AN[n] * Math.pow(k, d)));
    }
    return s;
}

const PI = Math.PI;
// ---- Weierstrass functions ---------------------------------------------------------------------------
function zeta(w: C): C {
    const zt = cscl(w, PI);
    return cadd(cscl(w, PI), cscl(cdiv(th1(zt, 1), th1(zt, 0)), PI));
}
function wp(w: C): C {
    const zt = cscl(w, PI);
    const t0 = th1(zt, 0), t1 = th1(zt, 1), t2 = th1(zt, 2);
    return csub(cscl(cc(1, 0), -PI), cscl(cdiv(csub(cmul(t2, t0), cmul(t1, t1)), cmul(t0, t0)), PI * PI));
}
function wpd(w: C): C {
    // wp' = -d/dw wp = -pi * d/dz~ [ -pi - pi^2*(t2*t0 - t1^2)/t0^2 ] = pi^3 * D[(t2 t0 - t1^2)/t0^2]
    // D[f/g] with f = t2*t0 - t1^2, g = t0^2: (f' g - f g')/g^2
    // f' = t3*t0 + t2*t1 - 2*t1*t2 = t3*t0 - t1*t2 ; g' = 2*t0*t1
    const zt = cscl(w, PI);
    const t0 = th1(zt, 0), t1 = th1(zt, 1), t2 = th1(zt, 2), t3 = th1(zt, 3);
    const f = csub(cmul(t2, t0), cmul(t1, t1));
    const fp = csub(cmul(t3, t0), cmul(t1, t2));
    const g = cmul(t0, t0);
    const gp = cscl(cmul(t0, t1), 2);
    // wp = -pi - pi^2 F with F = f/g  =>  wp' = -pi^3 * F'  (Laurent check: -> -2/w^3)
    return cscl(cdiv(csub(cmul(fp, g), cmul(f, gp)), cmul(g, g)), -Math.pow(PI, 3));
}

// ---- constants ----------------------------------------------------------------------------------------
const LGC = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function gammaC(z: number): number {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaC(1 - z));
    z -= 1; let x = LGC[0];
    for (let i = 1; i < 9; i++) x += LGC[i] / (z + i);
    const t = z + 7.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
const G2 = Math.pow(gammaC(0.25), 8) / (16 * PI * PI);
const SQG2 = Math.sqrt(G2);

// ---- Gray's parametrization --------------------------------------------------------------------------
function Xuvw(w: C): { x: number; y: number; z: number } {
    const p = wp(w), pd = wpd(w), zt = zeta(w);
    const qterm = cmul(cc(PI), cdiv(p, pd));
    const A = csub(cscl(zt, 0.5), qterm);
    const B = cadd(cscl(zt, 0.5), qterm);
    const denom = cadd(cc(0.5), cdiv(p, cc(SQG2)));
    const dm = cabs(denom);
    const cosArg = denom.re / dm;
    const modDiff = Math.sqrt(1 / (dm * dm) - 2 * cosArg / dm + 1);
    return { x: (PI * w.re) / 2 - A.re, y: (PI * w.im) / 2 + B.im, z: Math.sqrt(PI / 8) * Math.log(modDiff) };
}

// ---- checks ------------------------------------------------------------------------------------------
let fail = 0;
const chk = (name: string, err: number, tol: number) => {
    const ok = err < tol;
    if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: err ${err.toExponential(2)} (tol ${tol.toExponential(0)})`);
};
console.log(`g2 = ${G2.toPrecision(12)}  sqrt(g2)/2 = ${(SQG2 / 2).toPrecision(12)}  q = ${Q.toPrecision(6)}`);
// C1 Laurent
{
    const w = cc(7e-4, 3e-4);
    chk("C1 wp*w^2 -> 1", Math.abs(cabs(cmul(wp(w), cmul(w, w))) - 1), 1e-6);
    chk("C1 zeta*w -> 1", Math.abs(cabs(cmul(zeta(w), w)) - 1), 1e-6);
}
// C2 half-periods
{
    const e1 = wp(cc(0.5, 0)), e3 = wp(cc(0, 0.5)), e2 = wp(cc(0.5, 0.5));
    chk("C2 wp(w1) = +sqrt(g2)/2", cabs(csub(e1, cc(SQG2 / 2))), 1e-9);
    chk("C2 wp(w3) = -sqrt(g2)/2", cabs(csub(e3, cc(-SQG2 / 2))), 1e-9);
    chk("C2 wp(w2) = 0", cabs(e2), 1e-9);
    chk("C2 zeta(w1) = pi/2", cabs(csub(zeta(cc(0.5, 0)), cc(PI / 2))), 1e-9);
    chk("C2 zeta(w3) = -i*pi/2", cabs(csub(zeta(cc(0, 0.5)), cc(0, -PI / 2))), 1e-9);
}
// C3 periodicity + C4 ODE + C5 zeta' + C6 quasi-periods
{
    let worstPer = 0, worstODE = 0, worstQP = 0;
    for (const [u, v] of [[0.3, 0.4], [0.7, 0.6], [0.2, 0.8], [0.9, 0.1], [0.42, 0.31], [0.65, 0.85]]) {
        const w = cc(u, v);
        worstPer = Math.max(worstPer, cabs(csub(wp(w), wp(cadd(w, cc(1, 0))))), cabs(csub(wp(w), wp(cadd(w, cc(0, 1))))));
        const lhs = cmul(wpd(w), wpd(w));
        const rhs = csub(cscl(cmul(wp(w), cmul(wp(w), wp(w))), 4), cscl(wp(w), G2));
        worstODE = Math.max(worstODE, cabs(csub(lhs, rhs)) / Math.max(1, cabs(rhs)));
        const h = 1e-6;
        const zpm = zeta(cadd(w, cc(h, 0))), zmm = zeta(csub(w, cc(h, 0)));
        worstQP = Math.max(worstQP, cabs(csub(cdiv(csub(zpm, zmm), 2 * h), cscl(wp(w), -1))));
    }
    chk("C3 periodicity wp(w+1)=wp(w+i)=wp(w)", worstPer, 1e-9);
    chk("C4 ODE wp'^2 = 4wp^3 - g2 wp (rel)", worstODE, 1e-9);
    chk("C5 zeta'(w) = -wp(w)", worstQP, 1e-6);
    const w = cc(0.3, 0.4);
    const q1 = csub(zeta(cadd(w, cc(1, 0))), zeta(w));
    const qi = csub(zeta(cadd(w, cc(0, 1))), zeta(w));
    chk("C6 zeta(w+1) = zeta(w)+pi", cabs(csub(q1, cc(PI))), 1e-9);
    chk("C6 zeta(w+i) = zeta(w)-i*pi", cabs(csub(qi, cc(0, -PI))), 1e-9);
}
// C7 X survey
{
    console.log("C7 ends survey (|X| at puncture-adjacent points):");
    for (const [u, v, tag] of [[0.001, 0.001, "near 0 (skirt)"], [0.4985, 0.0015, "near w1 (trumpet)"], [0.0015, 0.4985, "near w3 (trumpet)"], [0.5, 0.5, "center w2 (saddle)"], [0.25, 0.25, "interior"], [0.75, 0.75, "interior"], [0.25, 0.75, "interior"]] as Array<[number, number, string]>) {
        const X = Xuvw(cc(u, v));
        console.log(`   w=(${u},${v}) ${tag}: X = (${X.x.toFixed(3)}, ${X.y.toFixed(3)}, ${X.z.toFixed(3)}) |X_xy| ${Math.hypot(X.x, X.y).toFixed(3)}`);
    }
    console.log("C7 trumpet approach (w = (1/2 - d, d/2 diag toward puncture)) — z growth:");
    for (const d of [0.30, 0.20, 0.13, 0.09, 0.06, 0.04]) {
        const X = Xuvw(cc(0.5 - d * 0.9, 0.5 - d * 0.9)); // toward center? no — toward w1 means v->0
        void X;
        const Xt = Xuvw(cc(0.5, d)); // straight down from center to (0.5,0) puncture
        console.log(`   v=d=${d.toFixed(2)} at u=1/2: z ${Xt.z.toFixed(4)} r_xy ${Math.hypot(Xt.x, Xt.y).toFixed(4)}`);
    }
    console.log("C7 skirt approach (diagonal from center toward corner 0):");
    for (const d of [0.30, 0.20, 0.13, 0.09, 0.06, 0.04]) {
        const X = Xuvw(cc(d, d));
        console.log(`   (d,d) d=${d.toFixed(2)}: r_xy ${Math.hypot(X.x, X.y).toFixed(3)} z ${X.z.toFixed(4)}`);
    }
    console.log("C7 symmetry pairs (u,v) vs (1-u,1-v) [central symmetry through w2]:");
    for (const [u, v] of [[0.3, 0.3], [0.25, 0.6], [0.4, 0.2]]) {
        const A = Xuvw(cc(u, v)), B = Xuvw(cc(1 - u, 1 - v));
        console.log(`   A(${u},${v}) (${A.x.toFixed(3)},${A.y.toFixed(3)},${A.z.toFixed(3)})  B(${1 - u},${1 - v}) (${B.x.toFixed(3)},${B.y.toFixed(3)},${B.z.toFixed(3)})  A+B=(${(A.x + B.x).toFixed(4)},${(A.y + B.y).toFixed(4)},${(A.z + B.z).toFixed(4)})`);
    }
    console.log("C7 reflection pair (u,v) vs (v,u) [reflection across diagonal]:");
    for (const [u, v] of [[0.3, 0.6], [0.2, 0.45]]) {
        const A = Xuvw(cc(u, v)), B = Xuvw(cc(v, u));
        console.log(`   A(${u},${v}) (${A.x.toFixed(3)},${A.y.toFixed(3)},${A.z.toFixed(3)})  B(${v},${u}) (${B.x.toFixed(3)},${B.y.toFixed(3)},${B.z.toFixed(3)})`);
    }
}
console.log(fail === 0 ? "ALL CHECKS PASS — machinery build-grade" : `${fail} CHECKS FAIL — no build on this`);
process.exit(fail === 0 ? 0 : 1);
