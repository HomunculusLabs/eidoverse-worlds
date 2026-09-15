// struct186-probe-fourier.ts — STRUCTURES LANE struct-186, R11-15
// THE FOURIER LADDER: the wave that learns to be square.
//
// ONE IDEA: FOURIER 1822 — a square wave is an infinite sum of sines. Four
// stone ribbons stack as the partial sums S1, S3, S7, S15 of the series
// S(x) = (4A/π)·Σ sin((2k−1)ωx)/(2k−1) — each rung closer to the square —
// and a thin brass rail above carries the LIMIT itself: the square wave the
// ribbons are learning to become. Two stone piers frame the stack: a ladder
// whose rungs are waves. One brass bead floats on the centerline above the
// central jump — the midpoint value the series converges to exactly at the
// discontinuity (the honest average, Fourier's own answer).
//
// KIN CHECK (elevates, never competes): fresh grep fourier/square-wave/
// partial-sum across IMPROVEMENTS + STRUCTURES-PLAN + IMPROVE-PLAN +
// CITY-PLAN-V2 + artwalk plans: 0/0/0. Standing kin: harmonickiss =
// spherical-harmonic ORBITALS (surfaces), lemniscate/clothoid/brachistochrone
// = single curves, tesseract/tribar = projection illusions. NOTHING in the
// 70+ works shows a SEQUENCE OF CURVES CONVERGING — the series-as-ladder
// register is clean, and it elevates the lane's oldest motif ("harmonic
// rhythms", STRUCTURES-LOOP design law) into the whole form.
//
// WORLD MAP (this file is the ONE contract — mk + decode import it):
//   span x ∈ [−3.2, 3.2] (2.5 periods, λ 2.56); ribbons S1/S3/S7/S15 at
//   y-centers 1.02/2.32/3.62/4.92 (pitch 1.30), band height 0.38, amplitude
//   A 0.26, extrude depth 0.36; brass square-wave rail at y 6.05 (band 0.26,
//   amplitude 0.26); piers at |x| 3.35 (0.50×6.53×0.60), ribbon ends embed
//   0.10 into them; bead glow_fl_1 r 0.075 at (0, 5.40, 0). Envelope
//   7.20×6.53×0.60, y[0,6.53], origin-centered. Folly class, no walk owed.
import * as THREE from "three";

// ---- constants (the one contract) ----------------------------------------------------------------------
export const LAM = 2.56;              // wavelength (2.5 periods across the span)
export const SPAN = 6.4;              // ribbon x-span
export const X0 = -SPAN / 2;
export const A_AMP = 0.26;            // series amplitude target (square half-height)
export const BAND_H = 0.38;           // stone ribbon band height
export const RAIL_BAND = 0.26;        // brass rail band height
export const RAIL_A = 0.26;           // rail amplitude (== A: the limit IS the target)
export const DEPTH = 0.36;            // ribbon/rail extrude depth (z)
export const HARMONICS = [1, 3, 7, 15]; // partial sums S_N, N odd
export const PITCH = 1.30;            // ribbon center-to-center
export const Y_BASE = 1.02;           // S1 center height
export const RAIL_Y = 6.05;           // limit rail center height
export const PIER_HW = 0.25;          // pier half-width (x)
export const PIER_HD = 0.30;          // pier half-depth (z)
export const PIER_X = 3.35;           // pier center |x| (inner face 3.10, ribbon ends embed 0.10)
export const PIER_TOP = 6.53;         // rail top 6.44 + 0.09 cap
export const N_SAMP = 128;            // samples per ribbon edge (deterministic)
export const BEAD_R = 0.075;
export const BEAD_C = new THREE.Vector3(0, 5.40, 0);

// ---- the mathematics (generated, never transcribed) ----------------------------------------------------
export const sN = (n: number, x: number): number => {
    // S_N(x) = (4A/π)·Σ_{odd m ≤ n} sin(m·2πx/λ)/m — the square-wave series
    const w = (2 * Math.PI) / LAM;
    let s = 0;
    for (let m = 1; m <= n; m += 2) s += Math.sin(m * w * x) / m;
    return ((4 * A_AMP) / Math.PI) * s;
};
export const square = (x: number): number =>
    A_AMP * Math.sign(Math.sin((2 * Math.PI * x) / LAM));  // the limit (0 at jumps by convention here)

export const ribbonY = (i: number) => Y_BASE + i * PITCH;  // i = 0..3 for S1/S3/S7/S15

// ---- envelope (piers bound x/z; pier top bounds y) -----------------------------------------------------
export const ENVELOPE = {
    min: [-PIER_X - PIER_HW, 0, -PIER_HD],
    max: [PIER_X + PIER_HW, PIER_TOP, PIER_HD],
};

// ---- laws ----------------------------------------------------------------------------------------------
let fails = 0;
const check = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name} — ${detail}`);
    if (!ok) fails++;
};

// dense sample helper
const peaksOf = (n: number) => {
    let mx = -Infinity;
    for (let i = 0; i <= 4096; i++) {
        const x = X0 + (i / 4096) * SPAN;
        mx = Math.max(mx, Math.abs(sN(n, x)));
    }
    return mx;
};

// P1 HARMONIC CENSUS (orthogonality projection): project each ribbon's
// sampled curve onto every basis function; coefficient ≈ 4A/(πm) for odd
// m ≤ N, ≈ 0 for even m and odd m > N. Self-catch: the first draft compared
// a single sample point and proved nothing — a projection is the honest law.
{
    const w = (2 * Math.PI) / LAM;
    // Self-catch 2: the 2.5-period span SPECTRALLY LEAKS (basis not
    // orthogonal on a non-integer window). Integrate over the centered
    // integer-period sub-window [−λ, +λ] = exactly 2 periods — the honest
    // projection domain; the ribbons themselves still span the full 6.4 m.
    const WIN = 2 * LAM;
    const N = 4096;
    const xs = Array.from({ length: N }, (_, i) => -WIN / 2 + ((i + 0.5) / N) * WIN);
    let ok = true;
    const details: string[] = [];
    for (const n of HARMONICS) {
        const ys = xs.map(x => sN(n, x));
        // coefficient of harmonic m in S_n: c_m = (2/WIN)·∫ S_n(x)·sin(mωx) dx
        for (let m = 1; m <= 6; m++) {
            let acc = 0;
            for (let i = 0; i < N; i++) acc += ys[i] * Math.sin(m * w * xs[i]);
            const c = (2 / WIN) * acc * (WIN / N);
            const want = m % 2 === 1 && m <= n ? (4 * A_AMP) / (Math.PI * m) : 0;
            if (Math.abs(c - want) > 0.01) { ok = false; details.push(`S${n} m${m}: ${c.toFixed(4)} want ${want.toFixed(4)}`); }
        }
    }
    check("P1 harmonic census by projection", ok && HARMONICS.length === 4,
        `harmonics per ribbon ${HARMONICS.map(n => (n + 1) / 2).join("/")} (S1..S15); projections ${details.length === 0 ? "all exact" : "DRIFT: " + details.slice(0, 3).join("; ")}`);
}

// P2 CONVERGENCE LADDER (L2): RMS error to the square DECREASES monotonically S1 > S3 > S7 > S15
{
    const rms = HARMONICS.map(n => {
        let acc = 0;
        const N = 2048;
        for (let i = 0; i < N; i++) {
            const x = X0 + (i / N) * SPAN;
            const d = sN(n, x) - square(x);
            acc += d * d;
        }
        return Math.sqrt(acc / N);
    });
    const mono = rms[0] > rms[1] && rms[1] > rms[2] && rms[2] > rms[3];
    check("P2 L2 convergence monotone", mono,
        `RMS ${rms.map(r => r.toFixed(4)).join(" > ")} — each rung closer to the square`);
}

// P3 GIBBS OVERSHOOT: S15 peak ≈ A·1.179 (8.95% of the jump) — the honest math visible in stone
{
    const p15 = peaksOf(15);
    const overshoot = (p15 - A_AMP) / (2 * A_AMP);   // fraction of the jump 2A
    check("P3 Gibbs overshoot present", overshoot > 0.07 && overshoot < 0.10,
        `S15 peak ${p15.toFixed(4)} = A·${(p15 / A_AMP).toFixed(3)}, overshoot ${(overshoot * 100).toFixed(1)}% of jump (theory 8.95%)`);
}

// P4 UNDULATION: every ribbon genuinely waves (peak ≥ 0.9 × S1 peak) and reads as a curve, not a block
{
    const peaks = HARMONICS.map(peaksOf);
    const ok = peaks.every(p => p > 0.9 * peaks[0]) && peaks[0] > 4 * A_AMP / Math.PI - 1e-9;
    check("P4 undulation family", ok, `peaks ${peaks.map(p => p.toFixed(3)).join("/")} (S1 = 4A/π = ${(4 * A_AMP / Math.PI).toFixed(3)})`);
}

// P5 STACK GAPS: min vertical air between adjacent ribbon AABBs ≥ 0.20; bead clearances ≥ 0.15
{
    const ext = HARMONICS.map(n => peaksOf(n) + BAND_H / 2);       // half-extents
    const gaps: number[] = [];
    for (let i = 0; i < 3; i++) gaps.push(PITCH - (ext[i] + ext[i + 1]));
    const railExt = RAIL_A + RAIL_BAND / 2;
    const topGap = RAIL_Y - ribbonY(3) - (ext[3] + railExt);
    // bead: S15 upper edge at the centerline x=0 region (S15(0)=0 → edge = yc + h/2)
    const beadLow = BEAD_C.y - BEAD_R - (ribbonY(3) + BAND_H / 2);
    // rail jump face at x=0 spans [RAIL_Y − A − band/2, RAIL_Y + A + band/2]
    const beadHigh = (RAIL_Y - RAIL_A - RAIL_BAND / 2) - (BEAD_C.y + BEAD_R);
    const minGap = Math.min(...gaps, topGap);
    check("P5 stack air gaps", minGap >= 0.20 && beadLow >= 0.15 && beadHigh >= 0.15,
        `ribbon gaps ${gaps.map(g => g.toFixed(2)).join("/")} rail gap ${topGap.toFixed(2)} bead ${beadLow.toFixed(2)}/${beadHigh.toFixed(2)}`);
}

// P6 LADDER FRAME: piers embed every ribbon end and the rail; piers ground at y=0 and carry the rail
{
    const inner = PIER_X - PIER_HW;                       // 3.10
    const embed = SPAN / 2 - inner;                       // ribbon end beyond inner face
    const railTop = RAIL_Y + RAIL_A + RAIL_BAND / 2;
    const carries = PIER_TOP >= railTop && PIER_TOP - railTop <= 0.15;
    check("P6 ladder frame", embed >= 0.08 && carries,
        `ends embed ${embed.toFixed(2)}m into piers (inner face ${inner}); rail top ${railTop.toFixed(2)} capped by pier top ${PIER_TOP}`);
}

// P7 POINT SYMMETRY: S_N(−x) = −S_N(x) (odd series) — each ribbon maps to itself under 180°
// rotation about its center; the square limit likewise
{
    let worst = 0;
    for (const n of HARMONICS) {
        for (let i = 1; i <= 256; i++) {
            const x = (i / 256) * (SPAN / 2);
            worst = Math.max(worst, Math.abs(sN(n, -x) + sN(n, x)));
        }
    }
    check("P7 point symmetry (odd series)", worst < 1e-12, `max |S(−x)+S(x)| ${worst.toExponential(1)} across all four ribbons`);
}

// P8 ENVELOPE: y ≥ 0, x/z origin-centered, literal size
{
    const [mn, mx] = [ENVELOPE.min, ENVELOPE.max];
    const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
    const railX = Math.max(...HARMONICS.map((_, i) => ribbonY(i) * 0)) + SPAN / 2; // ribbons bound |x| ≤ 3.2 < piers
    check("P8 envelope", mn[1] >= -1e-9 && Math.abs(cx) < 1e-9 && Math.abs(cz) < 1e-9 && railX < PIER_X + PIER_HW,
        `${(mx[0] - mn[0]).toFixed(2)}×${(mx[1] - mn[1]).toFixed(2)}×${(mx[2] - mn[2]).toFixed(2)} y[${mn[1]},${mx[1]}] cx/cz ${cx}/${cz}`);
}

// PRED RED CONTROL: an even-harmonic mutant (k=2 added to S15) must break P2's monotone ladder
{
    const w = (2 * Math.PI) / LAM;
    const mutant = (x: number) => {
        let s = 0;
        for (let m = 1; m <= 15; m += 2) s += Math.sin(m * w * x) / m;
        return ((4 * A_AMP) / Math.PI) * (s + Math.sin(2 * w * x) / 2);
    };
    let accM = 0, accS = 0;
    const N = 512;
    for (let i = 0; i < N; i++) {
        const x = X0 + (i / N) * SPAN;
        const dM = mutant(x) - square(x), dS = sN(15, x) - square(x);
        accM += dM * dM; accS += dS * dS;
    }
    const rmsM = Math.sqrt(accM / N), rmsS = Math.sqrt(accS / N);
    check("PRED mutant caught", rmsM > rmsS * 1.05,
        `even-term mutant RMS ${rmsM.toFixed(4)} > honest S15 ${rmsS.toFixed(4)} (the ladder law discriminates)`);
}

console.log(fails === 0 ? "ALL CHECKS PASS" : `${fails} CHECK(S) FAILED`);
if (fails) process.exit(1);
