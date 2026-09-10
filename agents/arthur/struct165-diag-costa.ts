// struct165-diag-costa.ts — step-size sensitivity diagnostic for the wp ODE integrator.
// Question: is the P2/P4 failure truncation error (converges with smaller step)
// or a structural bug (insensitive to step)?
import { execSync } from "node:child_process";
// reuse the probe's machinery by import-free re-declaration (self-contained diag)
type C = { re: number; im: number };
const c = (re: number, im = 0): C => ({ re, im });
const add = (a: C, b: C): C => c(a.re + b.re, a.im + b.im);
const sub = (a: C, b: C): C => c(a.re - b.re, a.im - b.im);
const mul = (a: C, b: C): C => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a: C, b: C): C => { const d = b.re * b.re + b.im * b.im; return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const scl = (a: C, s: number): C => c(a.re * s, a.im * s);
const absC = (a: C) => Math.hypot(a.re, a.im);
const LGC = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function gammaC(z: number): number {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaC(1 - z));
    z -= 1; let x = LGC[0];
    for (let i = 1; i < 9; i++) x += LGC[i] / (z + i);
    const t = z + 7.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
const G2 = Math.pow(gammaC(0.25), 8) / (16 * Math.PI * Math.PI);
const SEED_R = 0.03;
function seedW(w0: C): { wp: C; wpd: C; zeta: C } {
    const w2 = mul(w0, w0), w3 = mul(w2, w0), wi = div(c(1), w0), wi2 = mul(wi, wi), wi3 = mul(wi2, wi);
    return { wp: add(wi2, scl(w2, G2 / 20)), wpd: add(scl(wi3, -2), scl(w0, G2 / 10)), zeta: add(wi, scl(w3, -G2 / 60)) };
}
type S = { wp: C; wpd: C; zeta: C };
const deriv = (s: S): S => ({ wp: s.wpd, wpd: sub(scl(mul(s.wp, s.wp), 6), c(G2 / 2)), zeta: scl(s.wp, -1) });
function integrate(from: C, to: C, s0: S, step: number, residualLog?: { at: number; res: number }[]): S {
    const n = Math.max(1, Math.ceil(absC(sub(to, from)) / step));
    const h = 1 / n;
    const dTot = sub(to, from);
    let s = s0;
    for (let i = 0; i < n; i++) {
        const heff = scl(dTot, h);
        const dS = (st: S): S => { const d = deriv(st); return { wp: mul(d.wp, heff), wpd: mul(d.wpd, heff), zeta: mul(d.zeta, heff) }; };
        const a1 = dS(s);
        const a2 = dS({ wp: add(s.wp, scl(a1.wp, 0.5)), wpd: add(s.wpd, scl(a1.wpd, 0.5)), zeta: add(s.zeta, scl(a1.zeta, 0.5)) });
        const a3 = dS({ wp: add(s.wp, scl(a2.wp, 0.5)), wpd: add(s.wpd, scl(a2.wpd, 0.5)), zeta: add(s.zeta, scl(a2.zeta, 0.5)) });
        const a4 = dS({ wp: add(s.wp, a3.wp), wpd: add(s.wpd, a3.wpd), zeta: add(s.zeta, a3.zeta) });
        s = {
            wp: add(s.wp, scl(add(add(a1.wp, scl(a2.wp, 2)), add(a3.wp, a4.wp)), 1 / 6)),
            wpd: add(s.wpd, scl(add(add(a1.wpd, scl(a2.wpd, 2)), add(a3.wpd, a4.wpd)), 1 / 6)),
            zeta: add(s.zeta, scl(add(add(a1.zeta, scl(a2.zeta, 2)), add(a3.zeta, a4.zeta)), 1 / 6)),
        };
        if (residualLog && i % Math.max(1, Math.floor(n / 20)) === 0) {
            const lhs = mul(s.wpd, s.wpd), rhs = sub(scl(mul(s.wp, mul(s.wp, s.wp)), 4), scl(s.wp, G2));
            residualLog.push({ at: (i + 1) / n, res: absC(sub(lhs, rhs)) });
        }
    }
    return s;
}
function residual(s: S): number {
    const lhs = mul(s.wpd, s.wpd), rhs = sub(scl(mul(s.wp, mul(s.wp, s.wp)), 4), scl(s.wp, G2));
    return absC(sub(lhs, rhs));
}
const seed = seedW(c(SEED_R * Math.SQRT1_2, SEED_R * Math.SQRT1_2));
console.log(`seed residual (should be ~1e-3 rel): ${residual(seed).toExponential(3)} (|rhs| at seed ~ ${absC(sub(scl(mul(seed.wp, mul(seed.wp, seed.wp)), 4), scl(seed.wp, G2))).toExponential(2)})`);
for (const step of [1e-3, 3e-4, 1e-4, 3e-5, 1e-5, 3e-6]) {
    const t0 = Date.now();
    const wp1 = integrate(c(SEED_R * Math.SQRT1_2, SEED_R * Math.SQRT1_2), c(0.125, 0.25), seed, step);
    const r1 = residual(wp1);
    const s2 = integrate(c(0.125, 0.25), c(0.5, 0.25), wp1, step);
    const s3 = integrate(c(0.5, 0.25), c(0.5, 0), s2, step);
    console.log(`step ${step.toExponential(0)}: waypoint res ${r1.toExponential(2)}, wp(w1)=${s3.wp.re.toFixed(6)}+${s3.wp.im.toFixed(6)}i (want 6.875186+0i), final res ${residual(s3).toExponential(2)}, ${Date.now() - t0}ms`);
}
// residual growth along the first leg at coarse step
const log: { at: number; res: number }[] = [];
integrate(c(SEED_R * Math.SQRT1_2, SEED_R * Math.SQRT1_2), c(0.125, 0.25), seed, 3e-4, log);
console.log("residual along leg1 (step 3e-4):");
for (const e of log) console.log(`   at ${(e.at * 100).toFixed(0)}%: ${e.res.toExponential(3)}`);
void execSync;
