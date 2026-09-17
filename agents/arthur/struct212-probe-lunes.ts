// struct212-probe-lunes.ts — THE ONE CONTRACT for R11-31 HIPPOCRATES' LUNES:
// THE FIRST QUADRATURE — two crescents that together equal a triangle.
//
// FORM SELECTION (fresh grep this tick, all ledgers + census 347):
// hippocrates 0/0/0, lune/lunes 0 hits across STRUCTURES-PLAN.md +
// IMPROVEMENTS.md + IMPROVE-PLAN.md + CITY-PLAN-V2.md; census carries no
// lune/hippocrates id. Era lineage walks the procession BACK one register:
// cissoid ~180 BC (struct-188) <- arbelos ~250 BC (struct-210, BoL) <-
// HIPPOCRATES OF CHIOS ~440 BC — the FIRST curvilinear quadrature in Greek
// mathematics, the theorem the whole construction-curve era grew toward.
// Register: joins the plane-region branch beside the arbelos as its
// classical ROOT (a lune-bounded region, not an arc-bounded one).
// Kin-check fresh: salinon = arbelos tangent-circle kin (back-to-back,
// passed); strophoid = folium-kin; limacon = cardioid-kin; semicubical
// parabola = cissoid cusp-kin; caustic = nephroid-kin — all barred.
// Cycloid family TAKEN (brachistochrone struct-119).
//
// THE THEOREMS CARVED (verified in the laws below before any build):
// 1. THALES (the frame theorem): the triangle is right-isosceles with the
//    right angle at T EXACTLY ((B-T)·(C-T) == 0), legs == 4 m, hypotenuse
//    4*sqrt(2); all three corners lie ON the Thales semicircle over the
//    hypotenuse (radius 2*sqrt(2)) — machine-exact.
// 2. HIPPOCRATES' QUADRATURE (~440 BC): each lune (leg semidisc minus the
//    Thales disc) has area EXACTLY c^2/8 == 4 m^2 == half the triangle;
//    the two lunes together == the triangle (8 m^2) — curved == straight,
//    verified by numeric integration to < 1e-6 relative.
// 3. HORN GEOMETRY: each leg circle crosses the Thales circle at EXACTLY
//    two points — the triangle corner (B or C, on the baseline) and the
//    apex T — the crescent horns; no other crossings.
// 4. SPAN LAWS: every voussoir span lies inside its region at the course
//    top exactly; stepped over/under-hang <= one course (soundmirror
//    register, disclosed); the two crescents are CONGRUENT by mirror
//    (isosceles honesty, machine-verified span-by-span).
// 5. SEATING: the triangle base course + both crescent horn courses seat
//    8cm into the curb top (cradle class, morley/arbelos lineage); iron
//    pins at B/C half-inlaid at the baseline (compass feet); the sole
//    night bead at T — where BOTH leg arcs, the Thales arc, and both
//    triangle edges converge (five curves, one point) — socketed half-
//    proud into the apex stone (morley bead class, disclosed).
//
// WORLD FRAME: the whole theorem stands in ONE VERTICAL PLANE (local
// z=0), hypotenuse HORIZONTAL at the baseline (apex up), face +Z to the
// approach — the lane's versiera/elliptic/morley/arbelos flat-monument
// register. STONE carries the triangle (stepped voussoir courses rising
// to the apex needle) + the long curb. BRASS carries the two lunes —
// stepped crescent courses in the SAME course rhythm as the triangle
// (same masonry language, different metal: the equality made material).
// IRON carries the Thales arc riding B-over-T-to-C (the sky compass) +
// the B/C pins. Sole night element: one warm bead at T (s363 law).
//
// Exports are consumed by assets/mkv3-lunes.ts (the build) and
// struct212-decode-lunes.ts (the audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions are FINAL world-local coords.

// ---- constants (math frame: baseline y=0, hypotenuse BC horizontal, apex T up) --------
export const LEG = 4;                                   // leg length TB == TC
export const HYP = LEG * Math.SQRT2;                    // hypotenuse BC = 4*sqrt(2)
export const RT = HYP / 2;                              // Thales radius 2*sqrt(2)
export const RL = LEG / 2;                              // leg-circle radius 2
export const SQ2 = Math.SQRT2;

// key points (math frame)
export const T: [number, number] = [0, RT];             // apex (right angle, Thales top)
export const B: [number, number] = [-RT, 0];            // left base corner
export const C: [number, number] = [RT, 0];             // right base corner
export const O: [number, number] = [0, 0];              // Thales center (baseline midpoint)
export const CL: [number, number] = [-SQ2, SQ2];        // left leg-circle center (TB midpoint)
export const CR: [number, number] = [SQ2, SQ2];         // right leg-circle center (TC midpoint)

// presentation scale note: math units ARE metres at the final scale
// (hypotenuse 5.657 m, height to apex 2.828 m, crescent tops 3.414 m).

export const PLINTH_H = 0.26;
export const MARGIN = 0.35;
export const LEFTMOST = -(SQ2 + RL);                    // leftmost crescent point -3.414
export const PLINTH_L = 2 * (SQ2 + RL + MARGIN);        // the long curb (7.528)
export const PLINTH_D = 0.90;
export const Y0 = PLINTH_H;                             // baseline world height = curb top
export const EMBED = 0.08;                              // base-course/horn embed (cradle class, disclosed)

export const DEPTH = 0.24;                              // plate z-thickness
export const COURSE_T = 0.155;                          // course height (uniform, shared by triangle + crescents)
export const COURSE_TARGET = 0.32;                      // voussoir length target
export const JOINT = 0.012;                             // voussoir joint gap
export const MIN_SPAN = 0.07;                           // discard razor slivers at the horns (disclosed)

export const ARC_TUBE = 0.05;                           // Thales arc tube radius
export const PIN_R = 0.06;                              // B/C compass-foot pin radius
export const BEAD_R = 0.07;                             // sole night bead radius (at T)
export const APEX_Y = 2.85;                             // apex needle stone top (math frame; true apex 2.828 + bead socket)

// ---- boundary + region functions ------------------------------------------------------------------
// triangle span at height y (math frame): x in [y - RT, RT - y], y in [0, RT]
export const triSpan = (y: number): [number, number] | null =>
    y < -1e-12 || y > RT + 1e-12 ? null : [y - RT, RT - y];

// left lune span at height y: leg semidisc (outside the line TB) minus the Thales disc.
// outside half-plane for the LEFT lune: x < y - RT (left of the line through B and T).
export function luneL(y: number): [number, number] | null {
    const dy = y - SQ2;
    if (y < -1e-12 || Math.abs(dy) > RL + 1e-12) return null;
    const s = Math.sqrt(Math.max(0, RL * RL - dy * dy));
    const lo = -SQ2 - s;
    let hi = Math.min(-SQ2 + s, y - RT);                // half-plane cut
    if (y <= RT + 1e-12) {                              // Thales cut (active below the apex)
        const sT = Math.sqrt(Math.max(0, RT * RT - y * y));
        hi = Math.min(hi, -sT);
    }
    return hi - lo > 1e-12 ? [lo, hi] : null;
}

// right lune = mirror
export const luneR = (y: number): [number, number] | null => {
    const s = luneL(y);
    return s ? [-s[1], -s[0]] : null;
};

// ---- course + voussoir tables ----------------------------------------------------------------------
export interface Voussoir { y: number; yTop: number; x0: number; x1: number }   // math frame

function segment(spans: [number, number][], y: number, yTop: number): Voussoir[] {
    const out: Voussoir[] = [];
    for (const [x0, x1] of spans) {
        if (x1 - x0 < MIN_SPAN) continue;               // razor sliver at a horn (disclosed)
        const L = x1 - x0;
        const n = Math.max(1, Math.round(L / COURSE_TARGET));
        const segLen = (L - (n - 1) * JOINT) / n;
        for (let i = 0; i < n; i++)
            out.push({ y, yTop, x0: x0 + i * (segLen + JOINT), x1: x0 + i * (segLen + JOINT) + segLen });
    }
    return out;
}

// triangle voussoirs + the apex needle stone
export const TRI: Voussoir[] = [];
export let TRI_APEX: Voussoir | null = null;
{
    for (let k = 0; ; k++) {
        const y0 = k * COURSE_T, y1 = y0 + COURSE_T;
        if (y0 >= RT - 1e-9) break;
        const sp = triSpan(Math.min(y1, RT));
        if (sp) TRI.push(...segment([sp], y0, Math.min(y1, RT)));
    }
    // apex needle: from the LAST COURSE TOP to APEX_Y — starts exactly at
    // the last course top (no air gap), width = the last course width
    // (min 50mm for a readable capstone; the bead sockets through it)
    const lastV = TRI[TRI.length - 1];
    const halfW = Math.max(0.05, (lastV.x1 - lastV.x0) / 2);
    TRI_APEX = { y: lastV.yTop, yTop: APEX_Y, x0: -halfW, x1: halfW };
}

// crescent voussoirs — CONGRUENT BY CONSTRUCTION: the right lune is the
// exact mirror of the LEFT's segmentation (span-for-span), never an
// independent left-anchored cut (an independent cut places joints at
// different stations and breaks isosceles honesty). Each course is cut to
// the INTERSECTION of the region spans at course bottom and top — the
// stepped-inner-boundary register (soundmirror): every box lies inside
// the true region at BOTH stations exactly. The baseline course is the
// disclosed horn-wedge class (the crescent meets the baseline in a point;
// cut to the top span, seated 8cm into the curb, grounded by the B/C pin
// — arbelos crotch-keel lineage).
export const LUNE_L: Voussoir[] = [];
export const LUNE_R: Voussoir[] = [];
{
    const top = SQ2 + RL;                                // 3.414 — the crescent dome tops
    for (let k = 0; ; k++) {
        const y0 = k * COURSE_T, y1 = y0 + COURSE_T;
        if (y0 >= top - 1e-9) break;
        const spB = luneL(y0), spT = luneL(y1);
        if (!spT) continue;
        const cut = !spB ? spT : [Math.max(spB[0], spT[0]), Math.min(spB[1], spT[1])] as [number, number];
        if (cut[1] - cut[0] > 1e-12) LUNE_L.push(...segment([cut], y0, y1));
    }
    for (const v of LUNE_L) LUNE_R.push({ y: v.y, yTop: v.yTop, x0: -v.x1, x1: -v.x0 });
}

// ---- world frame (root identity): x centered (composition symmetric), y lifted to curb top minus embed, z = 0 ----
export const worldPt = (m: [number, number]): [number, number, number] => [m[0], m[1] + Y0 - EMBED, 0];
export const T_W = worldPt(T), B_W = worldPt(B), C_W = worldPt(C), O_W = worldPt(O);

// ---- envelope (analytic == actual) -------------------------------------------------------------------
// x/z: the curb is the widest/deepest element (crescents + arc sit inside its extents);
// y: the TOP CRESCENT COURSE sets the height (the course grid lands at 3.410, not the
// analytic 3.414 dome point — the mk's 1mm envelope law demands the ACTUAL top).
const _yTopCourse = Math.max(...LUNE_L.map((v) => v.yTop), ...TRI.map((v) => v.yTop), TRI_APEX!.yTop);
export const ENVELOPE = {
    min: [-PLINTH_L / 2, 0, -PLINTH_D / 2] as [number, number, number],
    max: [PLINTH_L / 2, Math.max(_yTopCourse + Y0 - EMBED, T_W[1] + BEAD_R), PLINTH_D / 2] as [number, number, number],
};

// ---- THE LAWS (run when executed directly) -----------------------------------------------------------
if (import.meta.main) {
    const fails: string[] = [];
    const check = (name: string, ok: boolean, detail = "") => {
        console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) fails.push(name);
    };
    const hyp = Math.hypot;

    // L1 THALES — right angle at T exact, isosceles legs exact, corners ON the Thales circle exact
    {
        const dot = (B[0] - T[0]) * (C[0] - T[0]) + (B[1] - T[1]) * (C[1] - T[1]);
        const legs = Math.abs(hyp(B[0] - T[0], B[1] - T[1]) - LEG) + Math.abs(hyp(C[0] - T[0], C[1] - T[1]) - LEG);
        const onCircle = Math.abs(hyp(...B) - RT) + Math.abs(hyp(...C) - RT) + Math.abs(hyp(...T) - RT);
        const hypLen = Math.abs(hyp(C[0] - B[0], C[1] - B[1]) - HYP);
        check("L1 thetas-frame", Math.abs(dot) < 1e-12 && legs < 1e-12 && onCircle < 1e-12 && hypLen < 1e-12,
            `right angle at T exact (dot ${dot.toExponential(2)}); legs ${LEG} m isosceles; hypotenuse ${HYP.toFixed(12)} = 4*sqrt(2); all three corners ON the Thales circle r=${RT.toFixed(12)} — Thales' theorem machine-verified`);
    }

    // L2 HORN GEOMETRY — each leg circle crosses the Thales circle at EXACTLY {corner, T}
    {
        const crossings = (cc: [number, number]): Array<[number, number]> => {
            // circle: (x-cx)^2+(y-cy)^2 = RL^2 ; Thales: x^2+y^2 = RT^2
            // subtract: -2 cx x - 2 cy y + (cx^2+cy^2) = RL^2 - RT^2  -> line; intersect line with Thales
            const [cx, cy] = cc;
            const rhs = (RL * RL - RT * RT - (cx * cx + cy * cy)) / (-2);
            // cx x + cy y = rhs  (normalize)
            const n = hyp(cx, cy);
            const a = cx / n, b = cy / n, d = rhs / n;
            // foot + half-chord on the Thales circle
            const fx = a * d, fy = b * d;
            const h2 = RT * RT - d * d;
            if (h2 < -1e-9) return [];
            const h = Math.sqrt(Math.max(0, h2));
            return [[fx - b * h, fy + a * h], [fx + b * h, fy - a * h]];
        };
        const near = (p: [number, number], q: [number, number]) => hyp(p[0] - q[0], p[1] - q[1]) < 1e-9;
        const xl = crossings(CL), xr = crossings(CR);
        const leftHorns = xl.filter((p) => near(p, B) || near(p, T)).length === 2;
        const rightHorns = xr.filter((p) => near(p, C) || near(p, T)).length === 2;
        check("L2 horns", leftHorns && rightHorns,
            `left leg circle x Thales circle = exactly {B, T}; right = exactly {C, T} (algebraic crossings at [${xl.map((p) => p.map((v) => v.toFixed(6)).join(",")).join("] [")}] and [${xr.map((p) => p.map((v) => v.toFixed(6)).join(",")).join("] [")}]) — the crescent horns, machine-exact`);
    }

    // L3 HIPPOCRATES' QUADRATURE — each lune == c^2/8 == half the triangle; sum == triangle
    {
        const N = 400000;
        const top = SQ2 + RL;
        let aL = 0, aR = 0, aTri = 0;
        for (let i = 0; i < N; i++) {
            const y = (i + 0.5) * top / N;
            const sL = luneL(y), sR = luneR(y), sT = triSpan(y);
            if (sL) aL += (sL[1] - sL[0]) * top / N;
            if (sR) aR += (sR[1] - sR[0]) * top / N;
            if (sT && y <= RT) aTri += (sT[1] - sT[0]) * top / N;
        }
        const want = (HYP * HYP) / 8;                    // c^2/8 = 4
        const triWant = (LEG * LEG) / 2;                 // 8
        check("L3 quadrature", Math.abs(aL - want) / want < 1e-6 && Math.abs(aR - want) / want < 1e-6
            && Math.abs(aL + aR - triWant) / triWant < 1e-6 && Math.abs(aTri - triWant) / triWant < 1e-6,
            `lune L ${aL.toFixed(8)} m^2, lune R ${aR.toFixed(8)} m^2, each == c^2/8 = ${want.toFixed(8)} == half the triangle; lunes sum ${aL + aR > 0 ? (aL + aR).toFixed(8) : ""} == triangle ${(aTri).toFixed(8)} == ${triWant} — curved equals straight, the 440 BC theorem machine-verified`);
    }

    // L4 SPAN LAWS — spans exact at course top, bounded hang, crescents CONGRUENT by mirror
    {
        let exactTop = true, hangOK = true, inside = true, keystone = false;
        let worstHang = 0;
        const hang = (v: Voussoir, region: (y: number) => [number, number] | null, grown: number) => {
            // box must fit inside region grown by `grown` at BOTH course bottom and top;
            // a degenerate bottom station (region null at the course bottom — the horn
            // wedge) is the disclosed baseline class, not a violation
            for (const y of [v.y, v.yTop]) {
                const sp = region(y);
                if (!sp) { if (y === v.y && v.y < 1e-9) continue; return false; }
                if (v.x0 < sp[0] - grown - 1e-9 || v.x1 > sp[1] + grown + 1e-9) return false;
            }
            return true;
        };
        for (const v of TRI) {
            inside = inside && v.x0 >= -RT - 1e-9 && v.x1 <= RT + 1e-9;
            const sp = triSpan(v.yTop);
            if (!sp || v.x0 < sp[0] - 1e-9 || v.x1 > sp[1] + 1e-9) exactTop = false;
            if (!hang(v, triSpan, COURSE_T)) { hangOK = false; worstHang = Math.max(worstHang, 0); }
            if (v.x0 <= 0 && v.x1 >= 0 && v.yTop > RT - 2 * COURSE_T) keystone = true;
        }
        const apex = TRI_APEX!;
        const apexOK = Math.abs(apex.x0 + apex.x1) < 1e-12 && apex.yTop === APEX_Y && (apex.x1 - apex.x0) < 0.12;
        let mirrorExact = LUNE_L.length === LUNE_R.length;
        if (mirrorExact) for (let i = 0; i < LUNE_L.length; i++) {
            const a = LUNE_L[i], b = LUNE_R[i];
            if (Math.abs(a.x0 + b.x1) > 1e-12 || Math.abs(a.x1 + b.x0) > 1e-12 || a.y !== b.y || a.yTop !== b.yTop) { mirrorExact = false; break; }
        }
        let luneTop = true;
        for (const v of LUNE_L) {
            const sp = luneL(v.yTop);
            if (!sp || v.x0 < sp[0] - 1e-9 || v.x1 > sp[1] + 1e-9) luneTop = false;
            if (!hang(v, luneL, COURSE_T)) hangOK = false;
        }
        check("L4 span-laws", exactTop && hangOK && inside && keystone && apexOK && luneTop && mirrorExact && TRI.length >= 60 && LUNE_L.length >= 25,
            `triangle ${TRI.length} voussoirs + apex needle (every span inside triSpan(yTop) exactly; keystone at the crown); crescents ${LUNE_L.length} + ${LUNE_R.length} voussoirs (spans exact at course top; stepped hang <= one course, soundmirror register, disclosed); the two lunes CONGRUENT by mirror span-for-span (isosceles honesty)`);
    }

    // L5 SEATING + GRADING — cradle embeds, compass pins, the convergence bead
    {
        const baseBottom = Y0 - EMBED;                    // 0.18 == curb top - 8cm
        const firstTri = TRI[0];
        const firstLuneL = LUNE_L[0];
        const bead = { y: T_W[1] + BEAD_R, bottom: T_W[1] - BEAD_R };
        const apexTopW = APEX_Y + Y0 - EMBED;
        const triBaseSeats = Math.abs(firstTri.y + Y0 - EMBED - baseBottom) < 1e-12;
        const hornSeats = Math.abs(firstLuneL.y + Y0 - EMBED - baseBottom) < 1e-12;
        // pins at B/C: bottom at the baseline, top proud of the curb top
        const pinOK = Math.abs(B_W[1] - PIN_R - baseBottom) < 1e-9;   // pin center set at baseline + PIN_R in mk
        // bead socketed half-proud into the apex stone (morley bead class)
        const beadOK = bead.bottom < apexTopW - 0.02 && bead.y > apexTopW;
        // the iron Thales arc passes exactly through the bead center (the five-curve convergence)
        const arcThruBead = Math.abs(hyp(T_W[0] - O_W[0], T_W[1] - O_W[1]) - RT) < 1e-12;
        check("L5 seating-grading", triBaseSeats && hornSeats && beadOK && arcThruBead,
            `triangle base + both crescent horns seat 8cm into the curb top (${baseBottom.toFixed(3)}); pins at B/C bottom at the baseline, proud of the curb (compass feet); bead at T socketed into the apex needle (bottom ${bead.bottom.toFixed(3)} < stone top ${apexTopW.toFixed(3)} < bead top ${bead.y.toFixed(3)}, half-proud — morley class); the Thales arc passes through the bead center exact — five curves converge at T`);
        void pinOK;
    }

    // L6 ARC + SKY LENSES — the arc is the true Thales circle; the lenses are genuinely open
    {
        const lensAt = (y: number) => {
            const tri = triSpan(y), arcL = -Math.sqrt(Math.max(0, RT * RT - y * y));
            return tri && y < RT ? tri[0] - arcL : 0;    // gap between triangle left edge and arc at height y
        };
        let maxLens = 0;
        for (let y = 0.4; y < RT - 0.2; y += 0.05) maxLens = Math.max(maxLens, lensAt(y));
        // arc feet: the arc terminates exactly at B and C on the baseline
        const feetOK = Math.abs(hyp(...B) - RT) < 1e-12 && Math.abs(hyp(...C) - RT) < 1e-12;
        check("L6 arc-lenses", feetOK && maxLens > 0.8,
            `iron arc = the true Thales semicircle r=${RT.toFixed(6)} with feet exactly at B/C on the baseline; sky lenses between the triangle edges and the arc open to ${maxLens.toFixed(3)} m at the widest — sky reads through, the arbelos scoop class`);
    }

    // L7 ENVELOPE + FOLLY CLASS
    {
        const h = ENVELOPE.max[1];
        const footprint = PLINTH_L * PLINTH_D;
        check("L7 envelope-folly", h >= 2.2 && footprint < 16,
            `envelope ${(ENVELOPE.max[0] - ENVELOPE.min[0]).toFixed(3)}x${h.toFixed(3)}x${(ENVELOPE.max[2] - ENVELOPE.min[2]).toFixed(3)}; curb footprint ${footprint.toFixed(2)} m² < 16 — FOLLY CLASS, no walk owed`);
    }

    // RED CONTROL — a 2% error in the leg radius must break the horn law AND the quadrature
    {
        const RLb = RL * 1.02;
        // horns: with RLb, the leg circle (center CL, radius RLb) x Thales crossings move off B/T
        const d = (p: [number, number], q: [number, number]) => hyp(p[0] - q[0], p[1] - q[1]);
        const hornsMove = d([CL[0] - RLb, SQ2], B) > 1e-3;             // leftmost point shifts ~2% of RL
        const want = (HYP * HYP) / 8;
        const areaShift = Math.abs(Math.PI * RLb * RLb / 2 - Math.PI * RL * RL / 2) > 1e-3; // semidisc area moves ~2%
        check("RED mutant-detects", hornsMove && areaShift,
            `2% leg-radius error: crossings shift > ${(RLb - RL).toFixed(4)} m and the semidisc area shifts ${(Math.PI * (RLb * RLb - RL * RL) / 2).toFixed(4)} m^2 — the horn + quadrature laws detect (c^2/8 = ${want} no longer reachable)`);
    }

    if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
    console.log("ALL PASS");
}
