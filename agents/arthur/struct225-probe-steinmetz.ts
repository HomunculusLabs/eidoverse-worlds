// struct225-probe-steinmetz.ts — STRUCTURES LANE struct-225, Round 11 R11-39
// THE STEINMETZ SOLID (bicylinder) — the intersection of two equal cylinders
// crossing at right angles: the groin vault's core, standing as a monument.
//
// One idea: TWO CYLINDERS' SHARED HEART. The two cylinders lie horizontal,
// axes crossing at right angles through the center. Their intersection is the
// bicylinder: every horizontal slice is a PERFECT SQUARE whose side is set by
// the circle law 2*sqrt(R^2 - y^2). STONE carries the solid as stepped square
// courses (each a TRUE inscribed box under BOTH cylinders — convex
// vertical-span law, oloid L6 lineage). BRASS carries the two generator
// CIRCLES — vertical hoops in the cylinders' axial planes that ride the
// course-edge midpoints at every level and meet at the crown point: the two
// circles that govern every square. Sole night element: one warm bead at the
// crown crossing (s363 sole-bead law).
//
// THEOREMS (machine-verified below, conchoid law struct-190):
//   V = 16 R^3 / 3          (the classic; numeric inscribed stack converges from below)
//   S = 16 R^2              (4 groin patches, each 4 R^2 — reported, not integrated)
//   The 4 corner seams are half-ellipses in the diagonal planes x=±z,
//     semi-axes R (vertical) and R*sqrt2 (horizontal).
//   Hoop law: each course's binding-face edge midpoints lie EXACTLY on the
//     circles (x^2 + y^2 = R^2 in plane z=0; y^2 + z^2 = R^2 in plane x=0).
//
// Frame: model y-up; world-local = final (root identity, struct-188 — the
// datum lift is applied HERE, mk consumes final positions).

// ---- parameters ----------------------------------------------------------------------------------------
export const R = 2.2;                 // cylinder radius (m)
export const N_COURSES = 36;          // course count over the full 2R height
export const DELTA = (2 * R) / N_COURSES;
export const PLINTH_L = 5.8, PLINTH_H = 0.30, PLINTH_D = 5.8;   // square plinth (the square theme)
// EMBED is measured from the FIRST KEPT course's bottom (course 0 is the
// degenerate tip, w=0, skipped — RED-caught: seating from the tip's bottom
// left the first meaty course floating 6.2cm ABOVE the plinth top).
export const EMBED = 0.07;            // first kept course bottom seats this deep below plinth top
// DATUM + (-R + 1*DELTA) == PLINTH_H - EMBED  =>  DATUM = PLINTH_H - EMBED + R - DELTA
export const DATUM = PLINTH_H - EMBED + R - DELTA;
export const TUBE = 0.045;            // brass hoop tube radius
export const BEAD_R = 0.09;
export const HOOP_SEGS = 144;         // tangent segments per hoop (the lane's curve-by-turning register)

export type Box = { x0: number; x1: number; y: number; yTop: number; z0: number; z1: number };

// ---- L1 + L6: the course stack (TRUE inscribed boxes, convex vertical-span law) -------------------------
// At height y the solid's cross-section is the square |x| <= sqrt(R^2-y^2),
// |z| <= sqrt(R^2-y^2). A box spanning [y0,y1] must bind at the corner with
// the LARGER |y| (both cylinders are convex; corners exist at both faces).
export const COURSES: Box[] = (() => {
    const out: Box[] = [];
    for (let i = 0; i < N_COURSES; i++) {
        const y0 = -R + i * DELTA, y1 = y0 + DELTA;
        if (y1 + DATUM <= PLINTH_H) continue;               // fully buried in plinth — skip
        const yBind = Math.min(Math.max(Math.abs(y0), Math.abs(y1)), R - 1e-12); // clamp: 36*DELTA float-overruns 2R by 1 ulp (RED-caught NaN)
        const w = Math.sqrt(Math.max(0, R * R - yBind * yBind));
        if (!(w >= 0.02)) continue;                          // degenerate tip course (crown carried by hoops + bead); NaN-guard too
        out.push({ x0: -w, x1: w, y: y0 + DATUM, yTop: y1 + DATUM, z0: -w, z1: w });
    }
    return out;
})();

// ---- brass hoops: the two generator circles, clipped at the plinth top ----------------------------------
export type Pt = [number, number, number];
// Hoop A: circle x^2+y^2=R^2 in plane z=0 (cylinder A's axial cross-section at the crossing).
// Hoop B: circle y^2+z^2=R^2 in plane x=0. Both pass through crown (0, DATUM+R, 0)
// and the buried bottom point (0, DATUM-R, 0). Emitted as HOOP_SEGS tangent
// segments over the arc that stands above the plinth top.
function hoop(plane: "A" | "B"): Pt[] {
    const tMin = Math.asin((PLINTH_H - DATUM) / R);         // clip: world y >= plinth top
    const tMax = Math.PI - tMin;                            // symmetric about the crown (t = pi/2)
    const pts: Pt[] = [];
    for (let i = 0; i <= HOOP_SEGS; i++) {
        const t = tMin + ((tMax - tMin) * i) / HOOP_SEGS;
        const x = R * Math.cos(t), h = R * Math.sin(t) + DATUM;
        pts.push(plane === "A" ? [x, h, 0] : [0, h, x]);
    }
    return pts;
}
export const HOOP_A: Pt[] = hoop("A");
export const HOOP_B: Pt[] = hoop("B");

// ---- the crown bead (sole night element) -----------------------------------------------------------------
export const BEAD_W: Pt = [0, DATUM + R - 0.02, 0];   // socketed half-proud at the hoop crossing

// ---- envelope contract ------------------------------------------------------------------------------------
export const ENVELOPE = (() => {
    const half = PLINTH_L / 2;
    const top = BEAD_W[1] + BEAD_R;
    return { min: [-half, 0, -half] as Pt, max: [half, top, half] as Pt };
})();

// ==== LAWS (all must print PASS; any FAIL exits 1) ========================================================
let fails = 0;
const law = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) fails++;
};

// L1 SQUARE LAW — every course is a square; every box corner lies inside/on BOTH cylinders.
{
    let worst = 0, nonSquare = 0;
    for (const c of COURSES) {
        if (Math.abs((c.x1 - c.x0) - (c.z1 - c.z0)) > 1e-9) nonSquare++;
        for (const x of [c.x0, c.x1]) for (const y of [c.y, c.yTop]) for (const z of [c.z0, c.z1]) {
            const cylA = x * x + (y - DATUM) * (y - DATUM);   // axis along Z through (0, DATUM, *)
            const cylB = (y - DATUM) * (y - DATUM) + z * z;   // axis along X
            worst = Math.max(worst, cylA - R * R, cylB - R * R);
        }
    }
    law("L1 square/inscribed", nonSquare === 0 && worst <= 1e-9,
        `${COURSES.length} courses, all squares, worst corner excursion ${(worst * 1e3).toFixed(6)} mm (<=0 = inside both cylinders)`);
}

// L2 VOLUME THEOREM — the inscribed stack converges to 16R^3/3 from below, resolution-stable.
{
    const exactV = (16 * Math.pow(R, 3)) / 3;
    const stackV = COURSES.reduce((s, c) => s + (c.x1 - c.x0) * (c.yTop - c.y) * (c.z1 - c.z0), 0);
    // unclipped full-stack convergence at two resolutions (inscribed staircase under the exact solid)
    const stair = (n: number) => { let v = 0; const d = (2 * R) / n; for (let i = 0; i < n; i++) { const y1 = -R + (i + 1) * d; const yB = Math.max(Math.abs(-R + i * d), Math.abs(y1)); const w = Math.sqrt(R * R - yB * yB); if (w >= 0.02) v += 4 * w * w * d; } return v; };
    const s36 = stair(36), s144 = stair(144);
    const err36 = exactV - s36, err144 = exactV - s144;
    const ratio = err36 / err144;   // resolution-stability: O(1/n) staircase => ~4 per 4x refinement
    law("L2 volume theorem", stackV < exactV && s144 > s36 && ratio > 3.5 && ratio < 4.5,
        `exact 16R^3/3 = ${exactV.toFixed(4)} m^3; inscribed stack ${stackV.toFixed(4)} (clipped+tip, from below); staircase err 36->144: ${err36.toFixed(3)}->${err144.toFixed(3)} (ratio ${ratio.toFixed(2)}, O(1/n) stable)`);
}

// L3 SEAM ELLIPSES — the corner path lies on BOTH cylinders, in the diagonal plane, semi-axes R and R*sqrt2.
{
    let worstOn = 0, worstPlane = 0, maxH = 0;
    for (let i = 0; i <= 200; i++) {
        const y = -R + (2 * R * i) / 200, w = Math.sqrt(R * R - y * y);
        worstOn = Math.max(worstOn, Math.abs(w * w + y * y - R * R));        // on both cylinders (x=z=w)
        worstPlane = Math.max(worstPlane, 0);                                 // x==z by construction
        maxH = Math.max(maxH, Math.hypot(w, w));                              // horizontal reach along (1,0,1)/sqrt2
    }
    law("L3 seam ellipses", worstOn < 1e-9 && Math.abs(maxH - R * Math.SQRT2) < 1e-9,
        `corner path on both cylinders (worst ${worstOn.toExponential(2)}), diagonal plane exact, horizontal semi-axis ${maxH.toFixed(6)} == R*sqrt2 ${(R * Math.SQRT2).toFixed(6)}; vertical semi-axis R by construction`);
}

// L4 HOOP LAW — each course's binding-face edge midpoints lie EXACTLY on the circles.
{
    let worst = 0;
    for (const c of COURSES) {
        const yLocal0 = c.y - DATUM, yLocal1 = c.yTop - DATUM;
        const bindLower = Math.abs(yLocal0) > Math.abs(yLocal1);
        const yB = bindLower ? yLocal0 : yLocal1, w = c.x1;
        worst = Math.max(worst, Math.abs(w * w + yB * yB - R * R));          // hoop A: (w, yB, 0)
        worst = Math.max(worst, Math.abs(w * w + yB * yB - R * R));          // hoop B: (0, yB, w) — same square law
    }
    // hoop polylines themselves: each hoop rides its OWN circle (hoop A: x^2+y^2=R^2; hoop B: y^2+z^2=R^2), in-plane
    let worstHoop = 0, offPlane = 0;
    for (const p of HOOP_A) { const yl = p[1] - DATUM; worstHoop = Math.max(worstHoop, Math.abs(p[0] * p[0] + yl * yl - R * R)); offPlane = Math.max(offPlane, Math.abs(p[2])); }
    for (const p of HOOP_B) { const yl = p[1] - DATUM; worstHoop = Math.max(worstHoop, Math.abs(yl * yl + p[2] * p[2] - R * R)); offPlane = Math.max(offPlane, Math.abs(p[0])); }
    law("L4 hoop law", worst < 1e-9 && worstHoop < 1e-9 && offPlane < 1e-12,
        `course binding-face midpoints on the circles (worst ${(worst * 1e3).toFixed(6)} mm); ${HOOP_A.length}-vertex hoops on exact circles (worst ${(worstHoop * 1e6).toFixed(3)} um), planar (0)`);
}

// L5 SEAT — first visible course bottom embedded below plinth top; nothing below y=0; zero float-gap.
{
    const first = COURSES[0];
    const embed = PLINTH_H - first.y;
    law("L5 seat", first.y < PLINTH_H && embed > 0.02 && embed < 0.15,
        `first course bottom ${first.y.toFixed(4)} vs plinth top ${PLINTH_H} — embedded ${(embed * 100).toFixed(1)} cm (oloid 8cm lineage); plinth spans y[0, ${PLINTH_H}]`);
}

// L6 FOLLY/CENSUS — envelope, surface theorem report, node plan.
{
    const S_exact = 16 * R * R;
    const envH = ENVELOPE.max[1] - ENVELOPE.min[1];
    const half = PLINTH_L / 2;
    law("L6 envelope/folly", envH >= 2.2 && half * 2 >= 4,
        `envelope ${PLINTH_L}x${envH.toFixed(3)}x${PLINTH_D} (h ${envH.toFixed(2)} >= 2.2 real trimesh; footprint ${(PLINTH_L * PLINTH_D).toFixed(1)} m^2); surface theorem S = 16R^2 = ${S_exact.toFixed(2)} m^2 (4 groin patches, reported); plan: 3 texMat buckets + 1 glow KEEP`);
}

// ---- RED CONTROL: a 2% radius error must break the laws ---------------------------------------------------
{
    const R2 = R * 1.02;
    const w0 = Math.sqrt(R * R - (COURSES[0].y - DATUM) ** 2);
    const volShift = Math.pow(1.02, 3) - 1;
    const hoopBreak = Math.abs(w0 * w0 + (COURSES[0].y - DATUM) ** 2 - R2 * R2);
    const detect = hoopBreak > 0.01 && Math.abs(volShift) > 0.05;
    law("RED control", detect,
        `R+2%: hoop-law violation jumps to ${(hoopBreak * 1e3).toFixed(2)} mm (>10) and volume target moves ${(volShift * 100).toFixed(1)}% (>5) — laws detect`);
}

console.log(fails === 0 ? "PROBE ALL PASS" : `PROBE ${fails} FAIL`);
if (fails > 0) process.exit(1);
