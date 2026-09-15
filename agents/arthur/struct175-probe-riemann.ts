// struct175-probe-riemann.ts v5 — RIEMANN'S MINIMAL SURFACE math probe.
//
// *** TICK DISPOSITION (struct-175): FAIL-CLOSED, NO BUILD. 5 probe
// generations, every RED recorded. v6 continuation path (derived but not
// executed this tick — the next build tick starts HERE):
//   (1) PLANAR-ENDS LAW (the structural bug of v1-v5): Riemann's ends are
//       PLANAR (IU essay) => dh must be HOLOMORPHIC at the punctures (z
//       converges at each shelf). v1-v5 used dh = u a dw (simple pole at p)
//       => every end catenoidal => no family member exists for ANY (rho,
//       seat) — confirmed by the v5 det survey (no sign changes on the
//       diagonal) and the decoupling theorem: Phi1 = u(J/c - cL)/2 and
//       Phi2 = iu(J/c + cL)/2 both-periodless => J = L = 0 separately,
//       and J3 = -eta3 - e2 rho mixes real/imaginary => contradiction.
//   (2) PERIODS DIE BY SYMMETRY, NOT BY EIGEN-SOLVE: Karcher's
//       multiplicative normalization c(wp(w0 - p) - e2) = i at the fixed
//       point w0 of the half-turn involution sigma(w) = -w + w0 realizes
//       G.sigma = -1/G (180-deg rotation about a HORIZONTAL axis); the
//       horizontal periods then cancel in pairs for EVERY rho. v6 = direct
//       quadrature of Phi1/Phi2 periods under this normalization (no 4x4
//       system), + the sigma-identity check G(sigma(w)) * G(w) == -1 at
//       sample points, + C6 circle march. Machinery below (theta/wp/
//       quadrature/det4) is proven at costa-level exactness and carries.
//
// PROBE HISTORY (probe law — every RED recorded):
//  v1: C0 hypothesis wrong (+pi/2 vs costa's -pi); M-row sign errors; no
//      closure theory. v2 fixed C0 by delta-calibration (g2=189.072720129
//      costa-exact) — but kept UNDERIVED (a -/+ c^2) Phi forms.
//  v2 RED: algebraic conformality check: Phi1^2+Phi2^2+Phi3^2 = u^2(-4 alpha a)
//      + v^2 a^2 cannot vanish identically. Period system only solvable at
//      degenerate square. v3 derived Phi from (G, dh) properly.
//  v3/v4 RED: no exact nullspace across rho. Root causes found re-deriving:
//      (i) E1 row dropped the -Re V term (Phi1's period = 1/2 (U S1 - V), its
//      REAL part contains -Re V);
//      (ii) SEAT WRONG: Karcher's law properly read puts the POLE at a
//      HALF-PERIOD (w3), the double zero lands at the diagonally opposite
//      half-period w1 (since wp(w1 - w3) = wp(w2) = e2), and the +/-i
//      normalization points are the four QUARTER points. v1-v4 scanned the
//      pole near the quarter point — wrong seat, no family.
//
// WEIERSTRASS DATA (final):
//   lattice <1, i rho>, th1 nome q = e^{-pi rho}, delta-calibrated wp.
//   pole p = w3 = (0, rho/2);  a(w) = 1/(wp(w - p) - e2)
//   G(w) = c/a(w)  (double pole at p, double zero at w1 = p + w2)
//   dh   = u a(w) dw
//   Phi1 = 1/2 (u a^2/c - u c) dw = 1/2 (U a^2 - V) dw,   U = u/c, V = u c
//   Phi2 = (i/2)(U a^2 + V) dw ;  Phi3 = u a dw
//   Conformality: exact identity (standard representation).
//   Horizontal periods over gamma1 (u-cycle at v=rho/8) and gamma3 (v-cycle
//   at u=1/8), no pole/zero crossings, no residues:
//     E1: Re(U S1) - Re V = 0        E2: Im(U S1) + Im V = 0
//     E3: Re(U S3) + rho Im V = 0    E4: Im(U S3) + rho Re V = 0
//   with S_j = oint a^2 dw. Homogeneous 4x4 in (UR, UI, VR, VI) — the family
//   exists iff det M = 0 (expected for EVERY rho at this seat: symmetry kills
//   the horizontal periods; rho is the family parameter).
//
// CHECKS: C1 machinery; C2 convergence; C3 det(M) ~ 0 across rho survey;
// C5 |G| equal at the four quarter-points; C6 singly-periodic signature
// (Tz1/Tz3 rational) + CIRCLE FOLIATION march (closure mod z-translation,
// planarity, exact circle fit); C7 immersion; C9 negative control (off-seat
// pole det large). Gate: ALL PASS real exit 0 else NO BUILD.

type C = { re: number; im: number };
const cc = (re: number, im = 0): C => ({ re, im });
const cadd = (a: C, b: C): C => cc(a.re + b.re, a.im + b.im);
const csub = (a: C, b: C): C => cc(a.re - b.re, a.im - b.im);
const cmul = (a: C, b: C): C => cc(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cdiv = (a: C, b: C): C => { const d = b.re * b.re + b.im * b.im; return cc((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const cscl = (a: C, s: number): C => cc(a.re * s, a.im * s);
const cabs = (a: C) => Math.hypot(a.re, a.im);
const sin = Math.sin, cos = Math.cos, PI = Math.PI;

const NTERMS = 16;
function makeSeries(rho: number) {
    const Q = Math.exp(-PI * rho);
    const AN: number[] = [], KK: number[] = [];
    for (let n = 0; n < NTERMS; n++) { AN.push(2 * (n % 2 ? -1 : 1) * Math.pow(Q, (n + 0.5) * (n + 0.5))); KK.push(2 * n + 1); }
    function sinC(z: C): C { return cc(sin(z.re) * Math.cosh(z.im), cos(z.re) * Math.sinh(z.im)); }
    function th1(z: C, d: number): C {
        let s = cc(0, 0);
        for (let n = 0; n < NTERMS; n++) { const k = KK[n]; const arg = cc(k * z.re + (d * PI) / 2, k * z.im); s = cadd(s, cscl(sinC(arg), AN[n] * Math.pow(k, d))); }
        return s;
    }
    return { Q, th1 };
}
function makeWp(rho: number) {
    const { Q, th1 } = makeSeries(rho);
    let t1p0 = 0, t1ppp0 = 0;
    for (let n = 0; n < NTERMS; n++) { const k = 2 * n + 1; const a = 2 * (n % 2 ? -1 : 1) * Math.pow(Q, (n + 0.5) * (n + 0.5)); t1p0 += a * k; t1ppp0 += -a * k * k * k; }
    const C0raw = -PI * PI * (t1ppp0 / t1p0) / 6;
    const rawWp = (w: C): C => {
        const z = cscl(w, PI);
        const t0 = th1(z, 0), t1 = th1(z, 1), t2 = th1(z, 2);
        return csub(cc(C0raw, 0), cscl(cdiv(csub(cmul(t2, t0), cmul(t1, t1)), cmul(t0, t0)), PI * PI));
    };
    const w1 = cc(0.5, 0), w3 = cc(0, rho / 2), w2 = cc(0.5, rho / 2);
    const delta = (rawWp(w1).re + rawWp(w2).re + rawWp(w3).re) / 3;
    const wp = (w: C): C => csub(rawWp(w), cc(delta, 0));
    const wpd = (w: C): C => {
        const z = cscl(w, PI);
        const t0 = th1(z, 0), t1 = th1(z, 1), t2 = th1(z, 2), t3 = th1(z, 3);
        const num = cadd(csub(cmul(t3, cmul(t0, t0)), cscl(cmul(cmul(t2, t1), t0), 3)), cscl(cmul(t1, cmul(t1, t1)), 2));
        return cscl(cdiv(num, cmul(cmul(t0, t0), t0)), -Math.pow(PI, 3));
    };
    const zeta = (w: C): C => csub(cmul(cc(PI), cdiv(th1(cscl(w, PI), 1), th1(cscl(w, PI), 0))), cscl(w, C0raw - delta));
    return { Q, wp, wpd, zeta, e1: wp(w1).re, e2: wp(w2).re, e3: wp(w3).re };
}
const GL8X = [-0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498, 0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363];
const GL8W = [0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620, 0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];
function segIntegral(a: C, b: C, f: (w: C) => C, panel: number): C {
    const L = cabs(csub(b, a));
    const n = Math.max(1, Math.ceil(L / panel));
    let s = cc(0, 0);
    for (let i = 0; i < n; i++) {
        const p0 = cc(a.re + (b.re - a.re) * (i / n), a.im + (b.im - a.im) * (i / n));
        const p1 = cc(a.re + (b.re - a.re) * ((i + 1) / n), a.im + (b.im - a.im) * ((i + 1) / n));
        const mid = cscl(cadd(p0, p1), 0.5), half = cscl(csub(p1, p0), 0.5);
        let ps = cc(0, 0);
        for (let k = 0; k < 8; k++) ps = cadd(ps, cscl(f(cadd(mid, cscl(half, GL8X[k]))), GL8W[k]));
        s = cadd(s, cmul(ps, half));
    }
    return s;
}
// direct 4x4 determinant (cofactor) — no eigenvalue floor
function det4(M: number[][]): number {
    const [a, b, c, d] = M;
    return a[0] * det3([b.slice(1), c.slice(1), d.slice(1)])
        - a[1] * det3([[b[0], b[2], b[3]], [c[0], c[2], c[3]], [d[0], d[2], d[3]]])
        + a[2] * det4h(M)
        - a[3] * det4i(M);
}
function det4h(M: number[][]): number {
    const [a, b, c, d] = M;
    return det3([[b[0], b[1], b[3]], [c[0], c[1], c[3]], [d[0], d[1], d[3]]]);
}
function det4i(M: number[][]): number {
    const [a, b, c, d] = M;
    return det3([[b[0], b[1], b[2]], [c[0], c[1], c[2]], [d[0], d[1], d[2]]]);
}
function det3(m: number[][]): number {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
        - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
        + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
}
// null vector of M (4x4) via row-reduction with column pivoting on the
// singular system: solve M x = 0 by eliminating and back-substituting with
// the smallest-pivot column used as the free variable.
function nullvec(M: number[][]): number[] {
    const n = 4; const A = M.map(r => r.slice());
    const piv: number[] = [];
    let row = 0;
    for (let col = 0; col < n && row < n; col++) {
        let best = row;
        for (let r = row + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[best][col])) best = r;
        if (Math.abs(A[best][col]) < 1e-13 * 1e3) continue;
        [A[row], A[best]] = [A[best], A[row]];
        for (let r = row + 1; r < n; r++) { const f = A[r][col] / A[row][col]; for (let k = col; k < n; k++) A[r][k] -= f * A[row][k]; }
        piv.push(col); row++;
    }
    const free = [0, 1, 2, 3].filter(c => !piv.includes(c))[0];
    const x = [0, 0, 0, 0]; x[free] = 1;
    for (let r = piv.length - 1; r >= 0; r--) {
        let s = 0;
        for (let k = 0; k < n; k++) if (k !== piv[r]) s -= A[r][k] * x[k];
        x[piv[r]] = s / A[r][piv[r]];
    }
    return x;
}

interface SolveOut {
    rho: number; S1: C; S3: C; Q1: C; Q3: C; det: number; scale: number;
    U: C; V: C; u: C; c: C; Tz1: number; Tz3: number; qSpread: number;
}
function solveSeat(rho: number, p: C, panel = 0.08): SolveOut {
    const { wp, e2 } = makeWp(rho);
    const base = cc(0.125, rho / 8);
    const aw = (w: C): C => cdiv(cc(1), csub(wp(csub(w, p)), cc(e2)));
    const S1 = segIntegral(base, cadd(base, cc(1, 0)), (w) => cmul(aw(w), aw(w)), panel);
    const S3 = segIntegral(base, cadd(base, cc(0, rho)), (w) => cmul(aw(w), aw(w)), panel);
    const Q1 = segIntegral(base, cadd(base, cc(1, 0)), aw, panel);
    const Q3 = segIntegral(base, cadd(base, cc(0, rho)), aw, panel);
    const M = [
        [S1.re, -S1.im, -1, 0],
        [S1.im, S1.re, 0, 1],
        [S3.re, -S3.im, 0, rho],
        [S3.im, S3.re, rho, 0],
    ];
    const det = det4(M);
    const scale = Math.pow(Math.hypot(...M.flat()), 4);
    const x = nullvec(M);
    const U = cc(x[0], x[1]), V = cc(x[2], x[3]);
    const UV = cmul(U, V);
    const mUV = Math.hypot(UV.re, UV.im), aUV = Math.atan2(UV.im, UV.re);
    const u = cc(Math.sqrt(mUV) * Math.cos(aUV / 2), Math.sqrt(mUV) * Math.sin(aUV / 2));
    const VU = cdiv(V, U);
    const mVU = Math.hypot(VU.re, VU.im), aVU = Math.atan2(VU.im, VU.re);
    const c = cc(Math.sqrt(mVU) * Math.cos(aVU / 2), Math.sqrt(mVU) * Math.sin(aVU / 2));
    // quarter-points |G| spread (Karcher +/- i normalization sites)
    const qp = [cc(0.25, rho / 4), cc(0.75, rho / 4), cc(0.25, 3 * rho / 4), cc(0.75, 3 * rho / 4)];
    const Gs = qp.map(pt => cabs(cmul(c, csub(wp(csub(pt, p)), cc(e2)))));
    const mx = Math.max(...Gs), mn = Math.min(...Gs);
    return { rho, S1, S3, Q1, Q3, det, scale, U, V, u, c, Tz1: cmul(u, Q1).re, Tz3: cmul(u, Q3).re, qSpread: (mx - mn) / mx };
}

// ---- run ----
let fail = 0;
const chk = (name: string, ok: boolean, detail: string) => { if (!ok) fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`); };
const LGC = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function gammaC(z: number): number {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaC(1 - z));
    z -= 1; let x = LGC[0];
    for (let i = 1; i < 9; i++) x += LGC[i] / (z + i);
    const t = z + 7.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
// C1
for (const rho of [1.0, 2.0]) {
    const { wp, wpd, zeta, e1, e2, e3 } = makeWp(rho);
    const g2 = -4 * (e1 * e2 + e2 * e3 + e3 * e1), g3 = 4 * e1 * e2 * e3;
    const w = cc(0.3, 0.2 * rho);
    const lhs = cmul(wpd(w), wpd(w));
    const rhs = csub(csub(cmul(cmul(wp(w), wp(w)), cscl(wp(w), 4)), cscl(wp(w), g2)), cc(g3));
    chk(`C1[rho=${rho}] ODE`, cabs(csub(lhs, rhs)) / Math.max(1, cabs(rhs)) < 1e-9, (cabs(csub(lhs, rhs)) / Math.max(1, cabs(rhs))).toExponential(2));
    const wv = cc(7e-4, 3e-4);
    chk(`C1[rho=${rho}] Laurent`, Math.abs(cabs(cmul(wp(wv), cmul(wv, wv))) - 1) < 1e-8, Math.abs(cabs(cmul(wp(wv), cmul(wv, wv))) - 1).toExponential(2));
    const h = 1e-6;
    chk(`C1[rho=${rho}] zeta'=-wp`, cabs(csub(cscl(csub(zeta(cadd(w, cc(h, 0))), zeta(csub(w, cc(h, 0)))), 1 / (2 * h)), cscl(wp(w), -1))) < 1e-8, "fd");
    if (rho === 1.0) {
        const G2c = Math.pow(gammaC(0.25), 8) / (16 * PI * PI);
        chk("C1[square] g2 == Gamma(1/4)^8/(16pi^2)", Math.abs(g2 - G2c) / G2c < 1e-9, `g2=${g2.toPrecision(12)}`);
    }
}
// C3 survey at the HALF-PERIOD seat
const RHOS = [0.7, 1.0, 1.3, 1.6, 2.0, 2.5, 3.0];
const results: SolveOut[] = [];
console.log("--- half-period-seat survey (v5) ---");
for (const rho of RHOS) {
    const r = solveSeat(rho, cc(0, rho / 2));
    results.push(r);
    console.log(`rho=${rho.toFixed(1)}: det/scale=${(r.det / r.scale).toExponential(2)} Tz1=${r.Tz1.toFixed(6)} Tz3=${r.Tz3.toFixed(6)} qSpread=${r.qSpread.toExponential(2)}`);
}
chk("C3 det ~ 0 for EVERY rho (the family)", results.every(r => Math.abs(r.det / r.scale) < 1e-13), results.map(r => (r.det / r.scale).toExponential(1)).join(" "));
if (results.some(r => Math.abs(r.det / r.scale) >= 1e-13)) { console.log("ALL CHECKS FAIL — no build on this"); process.exit(1); }
// pick a mid rho (aesthetics decided at build; 1.6 = balanced chunk)
const best = results.find(r => r.rho === 1.6)!;
// C2 convergence
{
    const fine = solveSeat(1.6, cc(0, 0.8), 0.04);
    const d = Math.max(cabs(csub(fine.S1, best.S1)), cabs(csub(fine.S3, best.S3)), cabs(csub(fine.Q1, best.Q1)), cabs(csub(fine.Q3, best.Q3)));
    chk("C2 quadrature converges (0.08 vs 0.04)", d < 1e-10, d.toExponential(2));
}
chk("C5 |G| equal at 4 quarter-points", best.qSpread < 1e-9, best.qSpread.toExponential(2));
// C6a rational Tz ratio
let bm = 0, bn = 0, bres = Infinity;
for (let m = -8; m <= 8; m++) for (let n = -8; n <= 8; n++) {
    if (m === 0 && n === 0) continue;
    const r = Math.abs(m * best.Tz1 + n * best.Tz3) / Math.hypot(best.Tz1, best.Tz3);
    if (r < bres) { bres = r; bm = m; bn = n; }
}
chk("C6a z-period lattice singly-generated", bres < 1e-9, `res=${bres.toExponential(2)} (m,n)=(${bm},${bn})`);
// C6b circle foliation
{
    const rho = best.rho;
    const { wp, e2 } = makeWp(rho);
    const p = cc(0, rho / 2);
    const base = cc(0.125, rho / 8);
    const aw = (w: C): C => cdiv(cc(1), csub(wp(csub(w, p)), cc(e2)));
    const f1 = (w: C): C => cscl(csub(cmul(best.U, cmul(aw(w), aw(w))), best.V), 0.5);
    const f2 = (w: C): C => cscl(cmul(cc(0, 1), cadd(cmul(best.U, cmul(aw(w), aw(w))), best.V)), 0.5);
    const f3 = (w: C): C => cmul(best.u, aw(w));
    const march = (points: C[], panel = 0.04) => {
        let i1 = segIntegral(base, points[0], f1, panel);
        let i2 = segIntegral(base, points[0], f2, panel);
        let i3 = segIntegral(base, points[0], f3, panel);
        const out = [{ x: i1.re, y: i2.re, z: i3.re }];
        for (let k = 1; k < points.length; k++) {
            i1 = cadd(i1, segIntegral(points[k - 1], points[k], f1, panel));
            i2 = cadd(i2, segIntegral(points[k - 1], points[k], f2, panel));
            i3 = cadd(i3, segIntegral(points[k - 1], points[k], f3, panel));
            out.push({ x: i1.re, y: i2.re, z: i3.re });
        }
        return out;
    };
    const dhat = (w: C): C => { const k = f3(w); const m2 = Math.hypot(k.re, k.im) || 1e-300; return cc(-k.im / m2, k.re / m2); };
    const w1pt = cc(0.5, 0), q1 = cc(0.5, rho); // zero of G at w1 (+ translation)
    let worstCircle = 0, worstPlanar = 0, worstClosureXY = 0, nLev = 0;
    for (const frac of [0.25, 0.5, 0.75]) {
        let w = cadd(p, cscl(csub(w1pt, p), frac));
        const d0 = dhat(w); w = cadd(w, cscl(d0, 0.03));
        const w0 = cc(w.re, w.im);
        const pts: C[] = [cc(w.re, w.im)];
        const h = 0.008;
        let closed = false;
        for (let i = 0; i < 20000 && !closed; i++) {
            const dmid = dhat(cadd(w, cscl(dhat(w), h / 2)));
            w = cadd(w, cscl(dmid, h));
            w = cc(w.re - Math.round(w.re), w.im - rho * Math.round(w.im / rho));
            if (Math.min(Math.hypot(w.re - p.re, w.im - p.im), Math.hypot(w.re - w1pt.re, w.im - w1pt.im)) < 0.02) break;
            pts.push(cc(w.re, w.im));
            if (i > 30 && Math.hypot(w.re - w0.re, w.im - w0.im) < h * 0.7) closed = true;
        }
        if (!closed || pts.length < 40) { console.log(`   C6b frac=${frac}: NOT CLOSED (${pts.length} pts)`); worstClosureXY = Infinity; continue; }
        nLev++;
        const X3 = march(pts);
        const last = X3[X3.length - 1], first = X3[0];
        worstClosureXY = Math.max(worstClosureXY, Math.hypot(last.x - first.x, last.y - first.y)); // z-shift allowed
        const zs = X3.map(P => P.z); const zbar = zs.reduce((a, b) => a + b, 0) / zs.length;
        worstPlanar = Math.max(worstPlanar, ...zs.map(z => Math.abs(z - zbar)));
        const n = X3.length;
        let A11 = 0, A12 = 0, A22 = 0, b1 = 0, b2 = 0, b3 = 0;
        for (const P of X3) { const X2 = P.x * P.x, Y2 = P.y * P.y, XY = P.x * P.y; A11 += 4 * X2; A12 += 4 * XY; A22 += 4 * Y2; b1 += 2 * P.x * (X2 + Y2); b2 += 2 * P.y * (X2 + Y2); b3 += X2 + Y2; }
        const M33 = [[A11, A12, n, b1], [A12, A22, 0, b2], [n, 0, n, b3]];
        for (let i = 0; i < 3; i++) {
            let piv = i; for (let j = i + 1; j < 3; j++) if (Math.abs(M33[j][i]) > Math.abs(M33[piv][i])) piv = j;
            [M33[i], M33[piv]] = [M33[piv], M33[i]];
            for (let j = i + 1; j < 3; j++) { const f = M33[j][i] / M33[i][i]; for (let k = i; k < 4; k++) M33[j][k] -= f * M33[i][k]; }
        }
        const sol = [0, 0, 0];
        for (let i = 2; i >= 0; i--) { sol[i] = M33[i][3]; for (let k = i + 1; k < 3; k++) sol[i] -= M33[i][k] * sol[k]; sol[i] /= M33[i][i]; }
        const cx = sol[0], cy = sol[1], R = Math.sqrt(Math.max(0, sol[2] + cx * cx + cy * cy));
        const res = Math.max(...X3.map(P => Math.abs(Math.hypot(P.x - cx, P.y - cy) - R)));
        worstCircle = Math.max(worstCircle, res / R);
        console.log(`   C6b frac=${frac}: ${pts.length} pts R=${R.toFixed(5)} radialRes/R=${(res / R).toExponential(2)} planarity=${(Math.max(...zs.map(z => Math.abs(z - zbar)))).toExponential(2)} xyClosure=${Math.hypot(last.x - first.x, last.y - first.y).toExponential(2)} dz=${(last.z - first.z).toExponential(2)}`);
    }
    chk("C6b loops close in xy (z-shift allowed)", nLev === 3 && worstClosureXY < 5e-4, `n=${nLev} worst=${worstClosureXY.toExponential(2)}`);
    chk("C6b planar slices", nLev === 3 && worstPlanar < 5e-4, `worst=${worstPlanar.toExponential(2)}`);
    chk("C6b CIRCLES (Riemann theorem numeric)", nLev === 3 && worstCircle < 5e-3, `worst res/R=${worstCircle.toExponential(2)}`);
}
// C7 immersion
{
    const rho = best.rho;
    const { wp, e2 } = makeWp(rho);
    const p = cc(0, rho / 2);
    const base = cc(0.125, rho / 8);
    const aw = (w: C): C => cdiv(cc(1), csub(wp(csub(w, p)), cc(e2)));
    const f1 = (w: C): C => cscl(csub(cmul(best.U, cmul(aw(w), aw(w))), best.V), 0.5);
    const f2 = (w: C): C => cscl(cmul(cc(0, 1), cadd(cmul(best.U, cmul(aw(w), aw(w))), best.V)), 0.5);
    const f3 = (w: C): C => cmul(best.u, aw(w));
    const Xat = (w: C) => {
        const I1 = cadd(segIntegral(base, cc(w.re, base.im), f1, 0.08), segIntegral(cc(w.re, base.im), w, f1, 0.08));
        const I2 = cadd(segIntegral(base, cc(w.re, base.im), f2, 0.08), segIntegral(cc(w.re, base.im), w, f2, 0.08));
        const I3 = cadd(segIntegral(base, cc(w.re, base.im), f3, 0.08), segIntegral(cc(w.re, base.im), w, f3, 0.08));
        return { x: I1.re, y: I2.re, z: I3.re };
    };
    const h = 1e-5; let minDet = Infinity;
    const sub3 = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
    const scl3 = (a: { x: number; y: number; z: number }, s: number) => ({ x: a.x * s, y: a.y * s, z: a.z * s });
    const crossN = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => Math.hypot(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
    for (const [uu, vv] of [[0.3, 0.3], [0.6, 0.2], [0.2, 0.6], [0.55, 0.55], [0.8, 0.4]]) {
        const w = cc(uu, vv * rho);
        const Xu = scl3(sub3(Xat(cadd(w, cc(h, 0))), Xat(csub(w, cc(h, 0)))), 1 / (2 * h));
        const Xv = scl3(sub3(Xat(cadd(w, cc(0, h))), Xat(csub(w, cc(0, h)))), 1 / (2 * h));
        minDet = Math.min(minDet, crossN(Xu, Xv));
    }
    chk("C7 immersion |Xu x Xv| > 0", minDet > 1e-6, `min=${minDet.toExponential(2)}`);
}
// C9 negative control
{
    const bad = solveSeat(1.6, cc(0.2, 0.3 * 1.6));
    chk("C9 NEGATIVE off-seat pole: det NOT ~ 0", Math.abs(bad.det / bad.scale) > 1e-10, `det/scale=${(bad.det / bad.scale).toExponential(2)}`);
}
console.log(fail === 0 ? "ALL CHECKS PASS — machinery build-grade" : `${fail} CHECKS FAIL — no build on this`);
process.exit(fail === 0 ? 0 : 1);
