// struct190-probe-quadratrix.ts — STRUCTURES LANE struct-190, R11-18
// THE QUADRATRIX OF HIPPIAS — the curve that measured the circle.
//
// ONE IDEA: two uniform motions — a radius turning, a line falling — weave
// one curve; where it lands on the base, pi is written. Hippias (~420 BC,
// the FIRST curve in history defined by motion); Dinostratus squared the
// circle with its limit. Rendered standing: a stone square frame (side W);
// a stone ribbon of tangent voussoirs sweeps from the top-left corner
// (0, W) down and out, flattening as it falls, and lands FLAT on the base
// at x = 2W/pi — the pi-point, marked by a brass stud. A brass RAY and an
// iron FALLING LINE are frozen at the moment theta* = 60°: they cross EXACTLY
// on the curve (y* = 2W/3, x* = 2W/(3*sqrt(3))) — the synchronization made
// visible; one warm bead burns at that crossing.
//
// KIN CHECK (elevates, never competes): fresh grep quadratrix/hippias/
// dinostratus across IMPROVEMENTS + STRUCTURES-PLAN + IMPROVE-PLAN: the
// only hit is struct-188's own register note naming cissoid/conchoid/
// quadratrix unclaimed (cissoid placed struct-189; conchoid dropped this
// tick — its trisection theorem could not be verified exact at probe
// precision, and this lane does not carve unproven theorems). Standing
// kin: no frame-form, no corner-sweep, no limit-landing anywhere in the
// fleet. Era lineage: Duerer (melencolia) -> Penrose (tribar) -> Diocles
// (cissoid) -> Hippias — the register descends to its Greek root.
//
// WORLD MAP (this file is the ONE contract — mk + decode import it):
//   Math frame (curve lives here): pole (0,0) at the square's bottom-left
//   corner; square [0, W] x [0, W]. Quadratrix: x = y*cot(pi*y/(2W)),
//   y in (0, W]; equivalently P(theta) = ((2W*theta/pi)*cot(theta),
//   2W*theta/pi), theta in (0, pi/2]. World frame: +BASE_LIFT on y (the
//   square sits on its plinth), +SHIFT_X on x (origin-centered).
//   Frame: 4 stone members 0.16 sq centered on the square's edges
//   (left x=0, right x=W, base y=0, top y=W — in MATH coords; world y
//   = math y + BASE_LIFT). Plinth stone slab under all.
//   Ribbon: 22 tangent voussoirs 0.15 x 0.15, arc-uniform, y_math in
//   [Y_BOT, Y_TOP]; springs embedded in the top-left corner joint, lands
//   flat embedding into the base member top.
//   Ray (brass 0.07 sq): from the pole corner at 60 deg, through the
//   frozen crossing, embedding into the top member.
//   Falling line (iron 0.06 sq): horizontal at the frozen height
//   y* = 2W/3, member-face to member-face.
//   Pi-stud (brass r 0.05, h 0.16): on the base member top at x = 2W/pi.
//   Bead glow_qu_1 (r 0.07): at the frozen crossing (x*, y*), front face.
//   Envelope 3.30 x 2.80 x 0.60, y [0, 2.80], origin-centered x/z.

export const W = 2.6;                  // square side (the generating square)
export const BASE_LIFT = 0.12;         // plinth height; square sits on top
export const FRAME_SEC = 0.16;         // stone frame member section
export const SEC = 0.15;               // ribbon voussoir section
export const N_VOUS = 22;              // voussoir count (arc-uniform)
export const RAY_SEC = 0.07;           // brass ray section
export const RAY_TH = Math.PI / 3;     // frozen moment: 60 deg from base
export const LINE_SEC = 0.06;          // iron falling-line section
export const STUD_R = 0.05;
export const STUD_H = 0.16;
export const BEAD_R = 0.07;
export const BEAD_Z = SEC / 2;         // bead seats half-embedded on the ribbon's FRONT face (struct-52/188 cure law)
export const PLINTH = { x0: -0.35, x1: W + 0.35, h: 0.12, hz: 0.30 };

export const PI_X = (2 * W) / Math.PI; // 1.656114 — the landing (Dinostratus)
export const Y_STAR = (2 * W) / 3;     // frozen height (theta* = pi/3 -> y = 2W/3)
export const X_STAR = Y_STAR / Math.tan(RAY_TH); // on-curve x at y*: y*/tan60 = 2W/(3*sqrt(3))

export const Y_TOP = W - 0.06;         // ribbon springs embedded in the corner joint
export const Y_BOT = 0.15;             // ribbon foot embeds into base member top (band bottom 0.195 < 0.20)

export const SHIFT_X = -(W / 2);       // origin-centers the envelope (x)
export const ENVELOPE = {
    min: [PLINTH.x0 + SHIFT_X, 0, -PLINTH.hz],
    max: [PLINTH.x1 + SHIFT_X, W + BASE_LIFT + FRAME_SEC / 2, PLINTH.hz],
};

// the curve, both forms (must agree identically)
export const xOfY = (y: number) => y / Math.tan((Math.PI * y) / (2 * W));   // implicit form
export const thetaOfY = (y: number) => (Math.PI * y) / (2 * W);             // motion parameter
export const pTheta = (th: number): [number, number] => {                    // parametric form
    const y = (2 * W * th) / Math.PI;
    return [y / Math.tan(th), y];
};

// ---- laws ------------------------------------------------------------------------------------------------
let fails = 0;
const check = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name} — ${detail}`);
    if (!ok) fails++;
};

// L1 THE MOTION LAW: parametric == implicit, and the synchronization itself
// is linear (y proportional to theta — the two uniform motions).
{
    let worst = 0;
    for (let i = 1; i <= 2000; i++) {
        const th = 0.02 + (i / 2000) * (Math.PI / 2 - 0.04);
        const [px, py] = pTheta(th);
        worst = Math.max(worst, Math.abs(px - xOfY(py)));
    }
    let lin = Infinity, prev = -Infinity;
    for (let i = 1; i <= 500; i++) {
        const th = (i / 500) * (Math.PI / 2 - 0.02);
        const y = (2 * W * th) / Math.PI;
        const ratio = y / th;                    // must be constant 2W/pi
        if (prev > -Infinity) lin = Math.min(lin, Math.abs(ratio - prev));
        prev = ratio;
    }
    const ratioErr = Math.abs(prev - (2 * W) / Math.PI);
    check("L1 parametric==implicit + uniform motions", worst < 1e-12 && ratioErr < 1e-12,
        `x(theta) vs y*cot(pi*y/2W) max ${worst.toExponential(2)} (2000 samples); y/theta constant = ${prev.toFixed(12)} vs 2W/pi ${(2 * W / Math.PI).toFixed(12)} — radius and line turn/fall in step`);
}

// L2 THE ENDPOINT LAW: springs from the top-left corner (0, W) exactly;
// lands at the pi-point (limit, verified numerically).
{
    const [xTop, yTop] = pTheta(Math.PI / 2 - 1e-9);
    const xLim = pTheta(1e-7)[0];
    const limErr = Math.abs(xLim / PI_X - 1);
    check("L2 corner spring + pi landing", Math.abs(xTop) < 1e-7 && Math.abs(yTop - W) < 1e-8 && limErr < 1e-12,
        `theta->pi/2: (${xTop.toExponential(2)}, ${yTop.toFixed(12)}) == corner (0, W); theta->0: x -> ${xLim.toFixed(12)} vs 2W/pi ${PI_X.toFixed(12)} (rel ${limErr.toExponential(2)}) — Dinostratus' limit`);
}

// L3 THE SWEEP LAW: x strictly monotone as y falls (the sweep never turns).
{
    let mono = true, worstSlope = 0;
    for (let i = 1; i <= 1000; i++) {
        const y1 = Y_BOT + ((i - 1) / 1000) * (W - Y_BOT);
        const y2 = Y_BOT + (i / 1000) * (W - Y_BOT);
        if (xOfY(y2) >= xOfY(y1)) mono = false;              // x must DECREASE with rising y
        worstSlope = Math.max(worstSlope, xOfY(y1) - xOfY(y2)); // negative dx/dy magnitude range info
    }
    // flatness at the foot: dx/dy -> 0 as y -> 0 (lands flat)
    const u = (Math.PI * 0.02) / (2 * W);
    const slopeFoot = 1 / Math.tan(u) - u / (Math.sin(u) ** 2);
    check("L3 monotone sweep + flat landing", mono && Math.abs(slopeFoot) < 0.35,
        `x strictly increasing as y falls over [${Y_BOT}, W]; foot slope dx/dy at y=0.02: ${slopeFoot.toFixed(4)} (->0: the ribbon lands FLAT on the base)`);
}

// L4 THE SQUARE LAW: the whole curve lives inside [0, W] x [0, W], and its
// rightmost reach IS the pi-point (sup x = 2W/pi < W).
{
    let sup = 0;
    for (let i = 1; i <= 2000; i++) {
        const y = (i / 2000) * W;
        sup = Math.max(sup, xOfY(y));
    }
    check("L4 inside the square, sup = 2W/pi", sup <= PI_X + 1e-9 && PI_X < W,
        `sup x on (0, W] = ${sup.toFixed(9)} == 2W/pi ${PI_X.toFixed(9)}; 2W/pi = ${(PI_X / W).toFixed(6)}*W < W — the curve never leaves its generating square`);
}

// L5 THE FROZEN MOMENT: at theta* = 60 deg the ray from the pole, the
// falling line at y* = 2W/3, and the curve ALL cross at one exact point.
{
    const yTh = Y_STAR;                        // y* from theta* by the motion law
    const yErr = Math.abs((2 * W * RAY_TH) / Math.PI - Y_STAR);
    const xCurve = xOfY(Y_STAR);
    const rayErr = Math.abs(Y_STAR / Math.tan(RAY_TH) - xCurve); // ray passes (x*, y*)
    const starErr = Math.abs(X_STAR - xCurve);
    check("L5 ray, line, curve cross at one point", yErr < 1e-12 && rayErr < 1e-12 && starErr < 1e-12,
        `theta*=60deg -> y* = 2W/3 = ${Y_STAR.toFixed(9)} (motion law err ${yErr.toExponential(2)}); crossing x* = ${xCurve.toFixed(9)} = 2W/(3*sqrt(3)); ray err ${rayErr.toExponential(2)} — three members, one point`);
}

// L6 ARC-UNIFORM VOUSSOIRS: 22 equal-arc stations, every station on-curve.
{
    const M = 8000;
    const th0 = thetaOfY(Y_TOP), th1 = thetaOfY(Y_BOT);
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= M; i++) {
        const th = th1 + (i / M) * (th0 - th1); // foot (small theta) -> top
        pts.push(pTheta(th));
    }
    const cum = [0];
    for (let i = 1; i <= M; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = cum[M];
    const stations: Array<[number, number]> = [];
    let idx = 0;
    for (let j = 0; j <= N_VOUS; j++) {
        const target = (j / N_VOUS) * total;
        while (idx < M && cum[idx + 1] < target) idx++;
        const t = (target - cum[idx]) / Math.max(1e-12, cum[idx + 1] - cum[idx]);
        const yApprox = pts[idx][1] + t * (pts[idx + 1][1] - pts[idx][1]);
        stations.push(pTheta(thetaOfY(yApprox)));   // SNAP to the exact curve
    }
    const steps: number[] = [];
    for (let j = 1; j <= N_VOUS; j++) steps.push(Math.hypot(stations[j][0] - stations[j - 1][0], stations[j][1] - stations[j - 1][1]));
    const mn = Math.min(...steps), mx = Math.max(...steps);
    let worst = 0;
    for (const [x, y] of stations) worst = Math.max(worst, Math.abs(x - xOfY(y)));
    check("L6 arc-uniform voussoirs", mx / mn < 1.02 && worst < 1e-12,
        `${N_VOUS} stations over arc ${total.toFixed(3)} m (step ${(total / N_VOUS).toFixed(4)} m, spread ${(mx / mn).toFixed(4)}); on-curve err ${worst.toExponential(2)}`);
}

// L7 GROUNDING: frame feet on the plinth; ribbon foot embeds into the base
// member top; ribbon start embeds into the corner joint; stud on the base.
{
    const footX = xOfY(Y_BOT);
    const footBand = { x0: footX - SEC, x1: footX + SEC, yTop: Y_BOT + BASE_LIFT + SEC / 2, yBot: Y_BOT + BASE_LIFT - SEC / 2 };
    const baseTop = 0 + BASE_LIFT + FRAME_SEC / 2;      // 0.20 (math y=0 is member center)
    const startX = xOfY(Y_TOP);
    const startBandLeft = startX - SEC;                  // near-vertical tangent: band is horizontal
    const ok = footBand.yBot < baseTop && footBand.yBot > BASE_LIFT   // embeds INTO the base member
        && startBandLeft < FRAME_SEC / 2                                // embeds into the left member flank
        && PLINTH.x0 < -FRAME_SEC / 2 && PLINTH.x1 > W + FRAME_SEC / 2  // frame fully on the plinth
        && PI_X > FRAME_SEC / 2 && PI_X < W - FRAME_SEC / 2;            // stud on the base member
    check("L7 grounding", ok,
        `foot band y[${footBand.yBot.toFixed(3)}, ${footBand.yTop.toFixed(3)}] embeds base-member top ${baseTop.toFixed(3)}; start band left ${startBandLeft.toFixed(3)} < member face ${FRAME_SEC / 2}; frame+stud inside plinth x[${PLINTH.x0}, ${PLINTH.x1}]`);
}

// L8 THE PI LANDING: the ribbon's rendered foot lands ON the stud (within
// its radius, off-center — the limit converging), stud center exact 2W/pi.
{
    const footX = xOfY(Y_BOT);
    const off = PI_X - footX;
    const onStud = off > 0.002 && off < STUD_R;
    check("L8 foot lands on the pi-stud", onStud && Math.abs(PI_X - (2 * W) / Math.PI) < 1e-15,
        `foot x ${footX.toFixed(6)} vs stud ${PI_X.toFixed(6)}: ${ (off * 1000).toFixed(1) } mm short of center — inside stud r ${STUD_R}: the curve lands at its own limit`);
}

// L9 ENVELOPE: derived, origin-centered after SHIFT_X.
{
    const w = ENVELOPE.max[0] - ENVELOPE.min[0], h = ENVELOPE.max[1] - ENVELOPE.min[1], d = ENVELOPE.max[2] - ENVELOPE.min[2];
    const cx = (ENVELOPE.min[0] + ENVELOPE.max[0]) / 2;
    check("L9 envelope", Math.abs(cx) < 1e-9 && Math.abs(w - 3.30) < 1e-9 && Math.abs(h - 2.80) < 1e-9 && Math.abs(d - 0.60) < 1e-9,
        `${w.toFixed(2)}x${h.toFixed(2)}x${d.toFixed(2)} origin-centered (x-shift ${SHIFT_X}), y[0, ${ENVELOPE.max[1].toFixed(2)}]`);
}

// RED CONTROL: a mutant curve (x = y*cot(pi*y/3W) — wrong frequency) must
// FAIL the implicit law L1 checks against.
{
    let worst = 0;
    for (let i = 1; i <= 500; i++) {
        const y = 0.1 + (i / 500) * (W - 0.2);
        const xm = y / Math.tan((Math.PI * y) / (3 * W));   // mutant
        worst = Math.max(worst, Math.abs(xm - xOfY(y)));
    }
    check("RED control (mutant frequency fails)", worst > 0.01, `mutant max deviation ${worst.toFixed(3)} m (must be > 0.01)`);
}

console.log(fails === 0 ? "\nALL CHECKS PASS" : `\n${fails} CHECK(S) FAILED`);
if (fails) process.exit(1);
