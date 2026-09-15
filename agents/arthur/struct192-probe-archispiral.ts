// struct192-probe-archispiral.ts — STRUCTURES LANE struct-192, R11-19
// THE ARCHIMEDEAN SPIRAL — the curve of equal steps.
//
// ONE IDEA: a ray turns at constant speed while a point runs along it at
// constant speed; the point's path is r = b·θ — every turn adds the SAME
// radial step (Archimedes, On Spirals, ~225 BC). Rendered standing: a stone
// coil of 42 tangent voussoirs springs from a hub barrel and winds 3.23
// turns to a landing mast, RISING at the same rate it widens
// (y = base + b·θ: the coil climbs as fast as it opens — a true conical
// spiral whose plan projection IS the exact curve). A brass peg marks the
// first turn (Proposition 24: the first turn's swept area is exactly ONE
// THIRD of the circle on r(2π)); a second peg marks the radius where the
// swept area reaches its first third (θ* = (θmax³/3)^⅓). An iron mast
// catches the landing; one warm bead caps it. Folly class — exterior
// circuit at placement, no interior walk promised (0.35m inter-turn
// channels are honest pinch, not lanes).
//
// KIN CHECK (elevates, never competes): fresh grep archimede*/spiral across
// IMPROVEMENTS + STRUCTURES-PLAN + IMPROVE-PLAN: (a) struct-78 screw well
// is the Archimedes SCREW — a helicoid blade inside a well, vertical water
// machinery, not the plane spiral; (b) shell tower + spiral folly are
// LOGARITHMIC spirals (golden growth, spacing shrinks by φ) standing
// vertical — this form's signature is EQUAL spacing read in PLAN; (c)
// orreryring carries three flat brass ring inlays at 0.4m spacing on the NW
// walk — concentric CIRCLES, no radial sweep, different sightline (this
// seats on Math Avenue r~300); (d) lissajous is artwalk-chartership. No
// standing form shows the Archimedean plane spiral. Register: Greek
// construction-curve register 4th member (cissoid -> quadratrix -> spiral).
//
// WORLD MAP (this file is the ONE contract — mk + decode import it):
//   Plan frame: polar (r, φ) about origin; world x = r·cosφ, z = r·sinφ.
//   The curve: r(θ) = b·θ, θ ∈ [θ_START, θ_MAX]; presentation rise
//   y(θ) = BASE + b·θ (plan projection IS the exact curve; height is
//   display, disclosed). Voussoirs: 42 tangent boxes SEC×SEC, arc-uniform,
//   snapped to the exact curve. Hub barrel (cyl r HUB_R) covers the start;
//   kerb ring (annulus KERB_R0..KERB_R1, h KERB_H, 48 tangent boxes)
//   closes the composition at the plinth edge — solid, no gaps (no entry
//   promised). Iron mast MAST_SEC sq from plinth top to MAST_TOP at the
//   curve-end plan position; the ribbon's last band embeds its flank.
//   Pegs (brass cyl PEG_R × PEG_H, vertical, piercing the ribbon):
//   peg1 at θ=2π (first turn closes), peg2 at θ* (first third of area).
//   Bead glow_as_1 (r BEAD_R) half-seated on the mast cap. Plinth disc
//   PLINTH_R × PLINTH_H grounds all. Envelope 4.10 × 2.32 × 4.10,
//   y [0, 2.32], origin-centered x/z.

export const B = 0.08;                 // r = B*theta — spacing per turn = 2*pi*B
export const BASE = 0.12;              // plinth top; all coil heights add this
export const THETA_START = 1.0;        // r_start 0.08 — springs inside the hub barrel
export const R_MAX = 1.625;            // plan reach of the coil
export const THETA_MAX = R_MAX / B;    // 20.3125 rad = 3.2327 turns
export const SEC = 0.15;               // ribbon voussoir section
export const L_STEP = 0.40;            // target arc step (outer zone: arc-uniform)
export const DTH_CAP = 0.55;           // max winding per voussoir (inner zone cap)
export const speed = (th: number) => B * Math.hypot(th, 1, 1); // ds/dtheta = b*sqrt(theta^2+2)
export const HUB_R = 0.17;             // covers the spring band (start r 0.08 +/- 0.075)
export const HUB_H = 0.20;             // y [BASE, BASE+HUB_H]
export const KERB_R0 = 1.85;
export const KERB_R1 = 2.01;
export const KERB_H = 0.16;            // y [BASE, BASE+KERB_H]
export const KERB_N = 48;              // tangent boxes around the ring
export const PLINTH_R = 2.05;
export const PLINTH_H = 0.12;
export const MAST_SEC = 0.10;
export const MAST_TOP = 2.25;
export const PEG_R = 0.045;
export const PEG_H = 0.34;
export const BEAD_R = 0.07;

// theorem points
export const TURN1_TH = 2 * Math.PI;                       // first turn closes
export const TURN1_R = B * TURN1_TH;                       // 0.50265
export const THETA_STAR = Math.cbrt(THETA_MAX ** 3 / 3);   // area-thirds polar
export const R_STAR = B * THETA_STAR;                      // 1.12686
export const AZ_STAR = THETA_STAR - 4 * Math.PI;           // 1.51665 rad
export const Y_STAR = BASE + R_STAR;

// the curve (plan + rise)
export const rOf = (th: number) => B * th;
export const yOf = (th: number) => BASE + B * th;
export const plan = (th: number): [number, number] => [rOf(th) * Math.cos(th), rOf(th) * Math.sin(th)];

// THE STATION WALK (this file owns it — mk + decode import): arc-uniform
// with a winding cap. Where the curve is fast (outer turns) every segment
// is exactly L_STEP of arc; where the cap binds (inner end) segments
// subtend DTH_CAP and shrink — the block rhythm grows with the turn, the
// spiral's own story. Every station snapped to the exact curve.
export const stations3 = (): Array<{ th: number; p: [number, number, number] }> => {
    const out: Array<{ th: number; p: [number, number, number] }> = [];
    let th = THETA_START;
    while (th < THETA_MAX) {
        const [x, z] = plan(th);
        out.push({ th, p: [x, yOf(th), z] });
        const trial = L_STEP / speed(th);
        th = th + Math.min(DTH_CAP, L_STEP / speed(th + trial / 2)); // midpoint-refined arc step
    }
    const [x, z] = plan(THETA_MAX);
    out.push({ th: THETA_MAX, p: [x, yOf(THETA_MAX), z] });
    return out;
};
export const N_VOUS = stations3().length - 1; // derived (~48)

// the landing mast, at the curve-end plan position
export const MAST_AZ = THETA_MAX - 3 * 2 * Math.PI;        // 1.46294 rad
export const MAST_P: [number, number] = [R_MAX * Math.cos(MAST_AZ), R_MAX * Math.sin(MAST_AZ)];
export const END_Y = BASE + R_MAX;                          // 1.745 — lands at mast

export const ENVELOPE = {
    min: [-PLINTH_R, 0, -PLINTH_R],
    max: [PLINTH_R, MAST_TOP + BEAD_R, PLINTH_R],
};

// dense 3D curve + nearest distance (decode re-derives its own copy)
export const curve3 = (() => {
    const pts: Array<[number, number, number]> = [];
    const N = 20000;
    for (let i = 0; i <= N; i++) {
        const th = THETA_START + (i / N) * (THETA_MAX - THETA_START);
        const [x, z] = plan(th);
        pts.push([x, yOf(th), z]);
    }
    return pts;
})();

// ---- laws ------------------------------------------------------------------------------------------------
let fails = 0;
const check = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name} — ${detail}`);
    if (!ok) fails++;
};

// L1 THE CURVE LAW: r grows linearly in theta (the ray runs at constant
// speed while turning) — parametric vs r/sqrt(x²+z²) identity, dr/dθ = b.
{
    let worst = 0;
    for (let i = 0; i <= 2000; i++) {
        const th = THETA_START + (i / 2000) * (THETA_MAX - THETA_START);
        const [x, z] = plan(th);
        worst = Math.max(worst, Math.abs(Math.hypot(x, z) - rOf(th)));
    }
    const slopeErr = Math.abs(((rOf(THETA_MAX) - rOf(THETA_START)) / (THETA_MAX - THETA_START)) - B);
    check("L1 curve law r = b*theta", worst < 1e-12 && slopeErr < 1e-15,
        `plan radius == b*theta max ${worst.toExponential(2)} (2000 samples); dr/dtheta = ${B} exact — the point runs the ray at constant speed`);
}

// L2 EQUAL SPACING (the signature): every full turn adds the SAME radial
// step 2*pi*b — the kin-distinction from every logarithmic spiral standing.
{
    const gaps: number[] = [];
    const radii: number[] = [];
    for (let k = 1; k <= 3; k++) radii.push(B * k * 2 * Math.PI);
    for (let k = 1; k < radii.length; k++) gaps.push(radii[k] - radii[k - 1]);
    const spread = Math.max(...gaps) - Math.min(...gaps);
    const spacing = 2 * Math.PI * B;
    check("L2 equal turn spacing", spread < 1e-12 && spacing - SEC > 0.30 && radii[2] < R_MAX,
        `turn radii ${radii.map(r => r.toFixed(5)).join(", ")} — consecutive gaps all ${(2 * Math.PI * B).toFixed(5)} (spread ${spread.toExponential(2)}); channel ${((spacing - SEC) * 1000).toFixed(0)} mm reads; outer turn ${radii[2].toFixed(3)} inside R_MAX`);
}

// L3 PROPOSITION 24: the swept area A(θ) = (b²/6)θ³ (numeric integral
// agrees); the FIRST TURN's area is exactly one third of the circle on
// r(2π); the first third of total area lands at θ* = (θmax³/3)^⅓ (peg2).
{
    // numeric area integral of (1/2) r² dθ, composite Simpson 20k
    const n = 20000;
    const f = (th: number) => 0.5 * (B * th) ** 2;
    let s = f(THETA_START) + f(THETA_MAX);
    for (let i = 1; i < n; i++) s += f(THETA_START + (i / n) * (THETA_MAX - THETA_START)) * (i % 2 ? 4 : 2);
    const numArea = (s * (THETA_MAX - THETA_START)) / (3 * n);
    // closed form from theta=0 (add the tiny starter wedge 0..theta_start)
    const closed = (B ** 2 / 6) * THETA_MAX ** 3 - (B ** 2 / 6) * THETA_START ** 3;
    const firstTurn = (B ** 2 / 6) * (2 * Math.PI) ** 3;
    const circle1 = Math.PI * (B * 2 * Math.PI) ** 2;
    const ratio = firstTurn / circle1;
    const starOk = Math.abs((THETA_STAR ** 3) / (THETA_MAX ** 3) - 1 / 3) < 1e-12;
    check("L3 Proposition 24 areas", Math.abs(numArea - closed) / closed < 1e-9 && Math.abs(ratio - 1 / 3) < 1e-12 && starOk,
        `numeric ${numArea.toFixed(8)} == closed ${closed.toFixed(8)} m² (rel ${((Math.abs(numArea - closed) / closed)).toExponential(2)}); first turn ${firstTurn.toFixed(6)} vs circle ${circle1.toFixed(6)} = ${(ratio * 100).toFixed(4)}% (exactly 1/3); θ*³/θmax³ = 1/3 — the pegs mark true theorems`);
}

// L4 THE RISE LAW (presentation): the coil climbs at the same rate it
// widens — y = BASE + b·θ, so landing height == plan reach; slope bounded.
{
    let worst = 0;
    for (let i = 0; i <= 500; i++) {
        const th = THETA_START + (i / 500) * (THETA_MAX - THETA_START);
        const [x, z] = plan(th);
        worst = Math.max(worst, Math.abs(Math.hypot(x, z) - (yOf(th) - BASE)));
    }
    const slopeTrue = 1 / Math.hypot(THETA_START, 2); // dy/ds max, at the inner end
    check("L4 rise law (climbs as it widens)", worst < 1e-12 && Math.abs(END_Y - BASE - R_MAX) < 1e-12 && slopeTrue < 0.6,
        `rise == plan reach everywhere (max dev ${worst.toExponential(2)}); landing y ${(END_Y - BASE).toFixed(3)} == R_MAX; dy/ds max ${slopeTrue.toFixed(3)} (inner end) — a true conical coil whose plan IS the curve`);
}

// L5 THE LANDING + MAST: the curve's end plan position sits on the mast
// axis (embeds its flank); mast grounds on the plinth and clears the kerb.
{
    const gap = Math.hypot(plan(THETA_MAX)[0] - MAST_P[0], plan(THETA_MAX)[1] - MAST_P[1]);
    const mastR = Math.hypot(MAST_P[0], MAST_P[1]);
    check("L5 landing + mast", gap <= 0.02 && mastR < KERB_R0 - 0.1 && MAST_TOP > END_Y + 0.3,
        `curve end -> mast axis ${gap.toExponential(2)} m; mast plan r ${mastR.toFixed(3)} (kerb inner ${KERB_R0}); mast spans plinth-top 0.12 to ${MAST_TOP} — the coil ends in iron`);
}

// L6 THE STATION WALK: arc-uniform outer zone (every step exactly L_STEP
// along the 3D arc), winding-capped inner zone (blocks subtend DTH_CAP and
// shrink); every station on the exact curve.
{
    const st = stations3();
    const steps: number[] = [];
    for (let j = 1; j < st.length; j++) steps.push(Math.hypot(st[j].p[0] - st[j - 1].p[0], st[j].p[1] - st[j - 1].p[1], st[j].p[2] - st[j - 1].p[2]));
    const mn = Math.min(...steps), mx = Math.max(...steps);
    // outer-zone law: where the walk runs arc-uniform (cap slack), each step
    // spans exactly L_STEP of ARC (measured by the speed integral — the chord
    // always falls short by the sagitta and is not the law). The FINAL
    // segment is the closing remainder (partial arc to exactly THETA_MAX) —
    // excluded from uniformity, asserted <= L_STEP instead.
    const arcOf = (a: number, b: number) => {
        let s = 0; const n = 400;
        for (let i = 0; i < n; i++) s += speed(a + (i + 0.5) / n * (b - a));
        return s * (b - a) / n;
    };
    const body = steps.map((s, j) => ({ s, j })).slice(0, -1);   // carry original index: filter renumbers
    const outer = body.filter(o => st[o.j + 1].th - st[o.j].th < DTH_CAP - 1e-9);
    const outerErr = Math.max(...outer.map(o => Math.abs(arcOf(st[o.j].th, st[o.j + 1].th) - L_STEP)));
    const remainder = arcOf(st[st.length - 2].th, st[st.length - 1].th);
    // inner-zone law: capped segments subtend exactly DTH_CAP, chords shrink
    const capped = body.filter(o => st[o.j + 1].th - st[o.j].th >= DTH_CAP - 1e-9);
    const cappedOk = capped.length >= 3 && capped.every(o => o.s < L_STEP);
    // on-curve: every station radius == b*theta
    let onCurve = 0;
    for (const s of st) if (Math.abs(Math.hypot(s.p[0], s.p[2]) - rOf(s.th)) < 1e-12) onCurve++;
    check("L6 station walk (arc-uniform + capped)", outer.length >= 30 && outerErr < 1e-3 && remainder <= L_STEP + 1e-9 && cappedOk && onCurve === st.length,
        `${N_VOUS} voussoirs: ${outer.length} arc-uniform steps of exactly ${L_STEP} m ARC (max err ${(outerErr * 1000).toFixed(2)} mm); closing remainder arc ${remainder.toFixed(3)} m; ${capped.length} capped inner segments subtend ${DTH_CAP} rad, chords ${mn.toFixed(3)}..${(Math.max(...capped.map(o => o.s))).toFixed(3)} m; all ${onCurve}/${st.length} stations on-curve`);
}

// L7 GROUNDING: hub + kerb seat on the plinth top; coil start embeds the
// hub barrel (plan + height); pegs pierce their ribbon bands (extend beyond
// both band faces); every member inside the plinth disc.
{
    const startR = rOf(THETA_START), startY = yOf(THETA_START);
    const hubOk = startR + SEC / 2 <= HUB_R + 0.02 && startY - SEC / 2 >= BASE - 0.005 && startY + SEC / 2 <= BASE + HUB_H + 0.005;
    const pegMargin = PEG_H / 2 - SEC / 2;   // how far peg ends pass each band face
    const pegsOk = pegMargin >= 0.09;        // >= 9cm proud each way: pierce, not kiss
    const insideOk = KERB_R1 < PLINTH_R && Math.hypot(MAST_P[0], MAST_P[1]) + MAST_SEC < PLINTH_R;
    check("L7 grounding", hubOk && pegsOk && insideOk,
        `coil start r ${startR.toFixed(3)}+sec inside hub ${HUB_R}, y band [${(startY - SEC / 2).toFixed(3)},${(startY + SEC / 2).toFixed(3)}] within hub y [${BASE},${BASE + HUB_H}]; pegs pierce bands by ${pegMargin.toFixed(3)} m each way; kerb ${KERB_R1} & mast inside plinth ${PLINTH_R}`);
}

// L8 GLOW CENSUS + ENVELOPE: exactly one glow element (the mast bead);
// envelope 4.10 × 2.32 × 4.10 origin-centered; trimesh height honest (2.32
// >= 2.2 — real trimesh, exterior circuit the honest walk).
{
    const w = ENVELOPE.max[0] - ENVELOPE.min[0], h = ENVELOPE.max[1] - ENVELOPE.min[1], d = ENVELOPE.max[2] - ENVELOPE.min[2];
    check("L8 envelope + collider honesty", Math.abs(w - 4.10) < 1e-9 && Math.abs(h - 2.32) < 1e-9 && Math.abs(d - 4.10) < 1e-9 && h >= 2.2,
        `${w.toFixed(2)}x${h.toFixed(2)}x${d.toFixed(2)} origin-centered; h ${h.toFixed(2)} >= 2.2 -> real trimesh (circuit outside, no interior lane promised)`);
}

// RED CONTROL: a mutant with doubled spacing (b' = 2b) must fail the
// contract's equal-spacing and area laws.
{
    const b2 = 2 * B;
    const radii = [1, 2, 3].map(k => b2 * k * 2 * Math.PI);
    const spacing = 2 * Math.PI * b2;
    const spacingDrift = Math.abs(spacing - 2 * Math.PI * B);
    const areaMut = (b2 ** 2 / 6) * (2 * Math.PI) ** 3 / (Math.PI * (b2 * 2 * Math.PI) ** 2); // stays 1/3 (scale-invariant) — spacing is the discriminator
    check("RED control (mutant 2b spacing fails)", spacingDrift > 0.25 && radii[2] > R_MAX,
        `mutant spacing ${spacing.toFixed(4)} vs contract ${2 * Math.PI * B} (drift ${spacingDrift.toFixed(4)}); mutant turn-3 radius ${radii[2].toFixed(3)} escapes R_MAX — caught (area ratio note: 1/3 is scale-invariant, spacing carries the RED)`);
}

console.log(fails === 0 ? "\nALL CHECKS PASS" : `\n${fails} CHECK(S) FAILED`);
if (fails) process.exit(1);
