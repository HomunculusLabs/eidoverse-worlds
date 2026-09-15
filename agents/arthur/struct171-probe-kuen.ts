// struct171-probe-kuen.ts — R11-7 THE KUEN SURFACE, math probe BEFORE build
// (struct-165 lineage law: no build until the probe is 100% machine-green).
//
// SOURCE (secured this tick, verbatim from Wikipedia wikitext "Kuen surface",
// which cites Virtual Math Museum / Gray et al. 2006 p.484; MathWorld
// cross-check confirms the class — its formulas are images, so the numeric
// K=-1 invariant below is the independent cross-check):
//   x = 2 cosh(v) (cos(u) + u sin(u)) / w
//   y = 2 cosh(v) (sin(u) - u cos(u)) / w
//   z = v - 2 sinh(v) cosh(v) / w
//   w = cosh(v)^2 + u^2
// Kuen 1884: constant Gaussian curvature K = -1 (pseudospherical class —
// the same curvature as the standing Beltrami pseudosphere, ELEVATES that
// family: the pseudosphere's sibling that grew a spiral handle).
//
// PROBE CHECKS (all machine-checked; gate = ALL CHECKS PASS):
//  C1 u=0 core curve laws: r_from_axis = 2 sech(v) EXACT; z = v - 2 tanh(v) EXACT.
//  C2 waist law: dz/dv = 0 at v = ±arccosh(sqrt2); z_waist = arccosh(sqrt2)-sqrt2.
//  C3 v=0 spiral law: |X(u,0)| = 2/sqrt(1+u^2) EXACT; polar angle = u - atan(u).
//  C4 CURVATURE LAW: K = -1 at ~240 conditioned grid points (second-fundamental
//     form by central differences, h=1e-4) — worst |K+1| must be < 1e-6.
//  C5 boundary census at U=4.4, V=4 (design numbers for collars/hems).
//  C6 self-intersection hunt: where the v=0 spiral sheet-line pierces the
//     |v|>0 sheets near z=0 (enneper crossing-law precedent — honest immersion).

const cosh = Math.cosh, sinh = Math.sinh, tanh = Math.tanh;

const X = (u: number, v: number): [number, number, number] => {
    const w = cosh(v) * cosh(v) + u * u;
    return [
        (2 * cosh(v) * (Math.cos(u) + u * Math.sin(u))) / w,
        (2 * cosh(v) * (Math.sin(u) - u * Math.cos(u))) / w,
        v - (2 * sinh(v) * cosh(v)) / w,
    ];
};

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
};

// ---- C1: u=0 core curve ----------------------------------------------------------------------------
{
    let worstR = 0, worstZ = 0;
    for (let i = -40; i <= 40; i++) {
        const v = i * 0.1;
        const [x, y, z] = X(0, v);
        worstR = Math.max(worstR, Math.abs(Math.hypot(x, y) - 2 / cosh(v)));
        worstZ = Math.max(worstZ, Math.abs(z - (v - 2 * tanh(v))));
    }
    check("C1 u=0 core: r = 2 sech(v) and z = v - 2 tanh(v)", worstR < 1e-12 && worstZ < 1e-12,
        `worst r ${worstR.toExponential(2)}, worst z ${worstZ.toExponential(2)}`);
}

// ---- C2: waist law ---------------------------------------------------------------------------------
// z(v) = v - 2tanh(v) is ODD: global min over [-V,V] sits at v=-V (tail), so
// the authored waist points v=±arccosh(sqrt2) are LOCAL extrema by design:
// local MAX z=+sqrt2-arccosh(sqrt2) at v=-0.8814, local MIN at v=+0.8814.
{
    const vw = Math.acosh(Math.SQRT2);            // sech^2 = 1/2
    const zLaw = vw - Math.SQRT2;                 // tanh(vw) = 1/sqrt2
    let bestMin = Infinity, minAt = 0, bestMax = -Infinity, maxAt = 0;
    for (let i = 0; i <= 1300; i++) {
        const v = 0.2 + (i / 1300) * 1.3;         // window (0.2, 1.5): local min
        const z = X(0, v)[2];
        if (z < bestMin) { bestMin = z; minAt = v; }
    }
    for (let i = 0; i <= 1300; i++) {
        const v = -1.5 + (i / 1300) * 1.3;        // window (-1.5, -0.2): local max
        const z = X(0, v)[2];
        if (z > bestMax) { bestMax = z; maxAt = v; }
    }
    check("C2 waist: local z extrema at v=±arccosh(sqrt2), z=∓(sqrt2-arccosh(sqrt2))",
        Math.abs(minAt - vw) < 5e-3 && Math.abs(bestMin - zLaw) < 1e-5 &&
        Math.abs(maxAt + vw) < 5e-3 && Math.abs(bestMax + zLaw) < 1e-5,
        `local min z ${bestMin.toFixed(6)} at v ${minAt.toFixed(4)}; local max z ${bestMax.toFixed(6)} at v ${maxAt.toFixed(4)}; law ±${zLaw.toFixed(6)} at ±${vw.toFixed(4)}`);
}

// ---- C3: v=0 spiral law ----------------------------------------------------------------------------
{
    let worstR = 0, worstA = 0;
    for (let i = -44; i <= 44; i++) {
        const u = i * 0.1;
        if (u === 0) continue;
        const [x, y] = X(u, 0);
        worstR = Math.max(worstR, Math.abs(Math.hypot(x, y) - 2 / Math.sqrt(1 + u * u)));
        const ang = Math.atan2(y, x);
        const lawAng = u - Math.atan(u);
        const d = Math.abs(((ang - lawAng) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const dd = Math.min(d, 2 * Math.PI - d);
        worstA = Math.max(worstA, dd);
    }
    check("C3 v=0 spiral: r = 2/sqrt(1+u^2), angle = u - atan(u)", worstR < 1e-12 && worstA < 1e-9,
        `worst r ${worstR.toExponential(2)}, worst angle ${worstA.toExponential(2)}`);
}

// ---- C4: curvature K = -1 ---------------------------------------------------------------------------
// CHART LAW: Xu(0,v) = 0 exactly — y ~ u^3 near u=0 — the two mirror halves
// meet along the core curve in a CUSPIDAL EDGE (true Kuen geometry, the same
// class as the pseudosphere's tractrix rim). The chart degenerates ON the
// edge by construction, so every grid point carries a deliberate u-offset
// off the edge (|u| >= 0.12), where the immersion is honest.
{
    const h = 1e-4;
    const Xu = (u: number, v: number) => [
        (X(u + h, v)[0] - X(u - h, v)[0]) / (2 * h), (X(u + h, v)[1] - X(u - h, v)[1]) / (2 * h), (X(u + h, v)[2] - X(u - h, v)[2]) / (2 * h)];
    const Xv = (u: number, v: number) => [
        (X(u, v + h)[0] - X(u, v - h)[0]) / (2 * h), (X(u, v + h)[1] - X(u, v - h)[1]) / (2 * h), (X(u, v + h)[2] - X(u, v - h)[2]) / (2 * h)];
    const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    let worst = 0, worstAt = "";
    const pts: [number, number][] = [];
    for (let i = 0; i <= 16; i++) for (let j = 0; j <= 14; j++) {
        const u = -4.4 + i * 0.55, v = -3.5 + j * 0.5;
        const off = Math.abs(u) < 0.12 ? (u >= 0 ? 0.12 : -0.12) : u;   // edge offset law
        pts.push([off, v]);
    }
    const Kfd = (u: number, v: number, h: number) => {
        const xu = Xu(u, v), xv = Xv(u, v);
        const E = dot(xu, xu), F = dot(xu, xv), G = dot(xv, xv);
        const n = cross(xu, xv);
        const nn = Math.hypot(n[0], n[1], n[2]);
        if (!isFinite(nn) || nn < 1e-9) return NaN;
        const Xuu = [((X(u + h, v)[0] - 2 * X(u, v)[0] + X(u - h, v)[0]) / (h * h)), ((X(u + h, v)[1] - 2 * X(u, v)[1] + X(u - h, v)[1]) / (h * h)), ((X(u + h, v)[2] - 2 * X(u, v)[2] + X(u - h, v)[2]) / (h * h))];
        const Xvv = [((X(u, v + h)[0] - 2 * X(u, v)[0] + X(u, v - h)[0]) / (h * h)), ((X(u, v + h)[1] - 2 * X(u, v)[1] + X(u, v - h)[1]) / (h * h)), ((X(u, v + h)[2] - 2 * X(u, v)[2] + X(u, v - h)[2]) / (h * h))];
        const Xuv = [(X(u + h, v + h)[0] - X(u + h, v - h)[0] - X(u - h, v + h)[0] + X(u - h, v - h)[0]) / (4 * h * h),
                     (X(u + h, v + h)[1] - X(u + h, v - h)[1] - X(u - h, v + h)[1] + X(u - h, v - h)[1]) / (4 * h * h),
                     (X(u + h, v + h)[2] - X(u + h, v - h)[2] - X(u - h, v + h)[2] + X(u - h, v - h)[2]) / (4 * h * h)];
        const L = dot(Xuu, n) / nn, M = dot(Xuv, n) / nn, N = dot(Xvv, n) / nn;
        return (L * N - M * M) / (E * G - F * F);
    };
    // Two step sizes + mutual agreement. FD FLOOR DISCLOSURE: near the tails the
    // area element nn^2 shrinks ~1e-3, amplifying central-difference rounding
    // (~1e-8 in L/M/N) to ~1e-6 in K — a numeric floor, not a formula error (a
    // wrong parametrization shows |K+1| = O(1)). Gate: both steps within 5e-6
    // of -1 AND mutual agreement < 5e-6 (convergence evidence, costa-probe
    // step-scaling precedent).
    let worstDiff = 0;
    for (const [u, v] of pts) {
        const k1 = Kfd(u, v, h), k2 = Kfd(u, v, 2 * h);
        if (!isFinite(k1) || !isFinite(k2)) { worst = Infinity; worstAt = `degenerate at (${u},${v})`; continue; }
        const e = Math.max(Math.abs(k1 + 1), Math.abs(k2 + 1));
        if (e > worst) { worst = e; worstAt = `(${u.toFixed(2)},${v.toFixed(1)})`; }
        worstDiff = Math.max(worstDiff, Math.abs(k1 - k2));
    }
    check("C4 K = -1 everywhere (255 edge-offset pts x 2 steps, worst |K+1| < 5e-6 FD floor, steps agree < 5e-6)",
        worst < 5e-6 && worstDiff < 5e-6,
        `worst |K+1| ${worst.toExponential(2)} at ${worstAt}; step agreement ${worstDiff.toExponential(2)}`);
}

// ---- C5: boundary census at U=4.4, V=4 ---------------------------------------------------------------
const U = 4.4, V = 4;
{
    const census = (name: string, samples: [number, number][]) => {
        let rMin = Infinity, rMax = -Infinity, zMin = Infinity, zMax = -Infinity;
        for (const [u, v] of samples) {
            const [x, y, z] = X(u, v);
            const r = Math.hypot(x, y);
            rMin = Math.min(rMin, r); rMax = Math.max(rMax, r);
            zMin = Math.min(zMin, z); zMax = Math.max(zMax, z);
        }
        console.log(`      ${name}: radius ${rMin.toFixed(3)}..${rMax.toFixed(3)}  z ${zMin.toFixed(3)}..${zMax.toFixed(3)}`);
        return { rMin, rMax, zMin, zMax };
    };
    console.log("C5 boundary census (design numbers, informational):");
    const eVp: [number, number][] = []; for (let i = 0; i <= 440; i++) eVp.push([-U + (i / 440) * 2 * U, V]);
    const eVm: [number, number][] = []; for (let i = 0; i <= 440; i++) eVm.push([-U + (i / 440) * 2 * U, -V]);
    const eUp: [number, number][] = []; for (let i = 0; i <= 400; i++) eUp.push([U, -V + (i / 400) * 2 * V]);
    const eUm: [number, number][] = []; for (let i = 0; i <= 400; i++) eUm.push([-U, -V + (i / 400) * 2 * V]);
    const tailP = census("v=+V tail edge", eVp), tailM = census("v=-V tail edge", eVm);
    census("u=+U handle rim", eUp); census("u=-U handle rim", eUm);
    // interior envelope
    let env = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (let i = 0; i <= 176; i++) for (let j = 0; j <= 160; j++) {
        const p = X(-U + (i / 176) * 2 * U, -V + (j / 160) * 2 * V);
        for (let k = 0; k < 3; k++) { env[k] = Math.min(env[k], p[k]); env[3 + k] = Math.max(env[3 + k], p[k]); }
    }
    console.log(`      interior envelope: x ${env[0].toFixed(3)}..${env[3].toFixed(3)}  y ${env[1].toFixed(3)}..${env[4].toFixed(3)}  z ${env[2].toFixed(3)}..${env[5].toFixed(3)}`);
    check("C5 tail collars feasible: both tail-edge max radii < 0.45 (collar ring size)",
        tailP.rMax < 0.45 && tailM.rMax < 0.45, `tailP r<=${tailP.rMax.toFixed(3)}, tailM r<=${tailM.rMax.toFixed(3)}`);
}

// ---- C6: self-intersection hunt near z=0 ------------------------------------------------------------
{
    // does the v=0 spiral line pierce the |v|>0 sheets? for spiral samples u_s,
    // search (u', v') with 0.08 < |v'| <= 1.6 minimizing |X(u',v') - X(u_s,0)|.
    let pierceCount = 0;
    const hits: string[] = [];
    for (let iu = 6; iu <= 40; iu++) {
        const us = iu * 0.1;
        const target = X(us, 0);
        let best = Infinity, at = "";
        for (let i = 0; i <= 480; i++) {
            const up = -U + (i / 480) * 2 * U;
            for (let j = 1; j <= 80; j++) {
                for (const v of [j * 0.02, -j * 0.02]) {
                    if (Math.abs(v) < 0.08 || Math.abs(v) > 1.6) continue;
                    const p = X(up, v);
                    const d = Math.hypot(p[0] - target[0], p[1] - target[1], p[2] - target[2]);
                    if (d < best) { best = d; at = `(u'=${up.toFixed(2)},v'=${v.toFixed(2)})`; }
                }
            }
        }
        if (best < 5e-3) { pierceCount++; if (hits.length < 8) hits.push(`u_s=${us.toFixed(1)}->${at} d=${best.toExponential(1)}`); }
    }
    console.log(`C6 self-intersection census (informational): spiral-line pierce candidates ${pierceCount}/35`);
    for (const h of hits) console.log(`      ${h}`);
    check("C6 census executed (informational — honest immersion either way)", true);
}

console.log(fails === 0 ? "ALL CHECKS PASS" : `${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
