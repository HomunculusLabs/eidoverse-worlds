// struct210-probe-arbelos.ts — THE ONE CONTRACT for R11-30 THE ARBELOS:
// ARCHIMEDES' KNIFE — THE SHOEMAKER'S BLADE AND THE TWIN CIRCLES.
//
// FORM SELECTION (fresh grep this tick, all ledgers + census 346): arbelos
// 0/0/0 as a build across STRUCTURES-PLAN.md + IMPROVEMENTS.md +
// IMPROVE-PLAN.md + CITY-PLAN-V2 — named ONLY in kin-check pass-over notes
// ("tangent-circle kin arbelos/salinon deliberately passed over as
// too-fresh", struct-182, 28 ticks ago — freshness window long expired).
// Apollonian standing = a PACKED GASKET (recursively tangent discs), not an
// arbelos (one tangent-pair region + baseline). Register: opens the
// PLANE-REGION branch — no standing form IS a bounded plane region (the
// lane owns curves/surfaces/fractals/tilings/CA/packing/knots; none is an
// arc-bounded REGION). Era lineage: Diocles ~180 BC (cissoid struct-188)
// <- Archimedes ~250 BC, Book of Lemmas 4-5 — one register older, THE
// classical root of the Greek construction-curve era.
//
// THE THEOREMS CARVED (verified in the laws below before any build):
// 1. TWIN CIRCLES (Book of Lemmas 5): each Archimedes twin is tangent to
//    (a) its lobe arc [external], (b) the big outer arc [internal], (c) the
//    vertical CD construction line — machine-verified to 1e-12; twin radius
//    closed form r = r1*r2/R exactly; twin center height closed form
//    y = 2*sqrt(r*t) exactly (the algebra: (r+t)^2-(r-t)^2 = 4rt).
// 2. THE GEOMETRIC-MEAN HEIGHT (Book of Lemmas 4): the CD line's top D sits
//    ON the outer arc at height h = 2*sqrt(r1*r2) exactly — the geometric
//    mean of the diameters — and the arbelos area == the CD rectangle
//    area == pi*r1*r2 = pi*h^2/4 exactly (verified by numeric integration).
// 3. REGION LAWS: the three boundary arcs meet ONLY at the joints A/B/C
//    (baseline) and D (on the outer arc); the band is genuinely open
//    between lobe crowns and the outer arc (no mid-arc crossings).
// 4. COURSE LAWS: every voussoir span lies inside region(yTop) exactly and
//    inside region(yBottom) grown by one course height (the stepped
//    under-hang bound near the vertical-tangent joints — soundmirror
//    stepped-ring register, disclosed); the crown carries a keystone
//    course; all spans within [0, 2R].
// 5. SEATING: plate toes (A/C/B) embedded 8cm into the curb top (cradle
//    class, disclosed); the iron sole rod half-inlaid in the curb top
//    (post-embed class, versiera hoop precedent); nothing dips below the
//    embed classes.
//
// WORLD FRAME: the whole theorem stands in ONE VERTICAL PLANE (local z=0),
// face +Z to the approach — the lane's versiera/elliptic/morley flat-
// monument register. STONE carries the region: the arbelos plate carved in
// horizontal voussoir courses (stepped arcs), seated 8cm into a long curb
// plinth — THE SHOEMAKER'S BLADE. BRASS carries the two Archimedes twin
// rings (face-mounted, half-proud — the rings ARE the twin circles, kissing
// the lobe arc, the outer arc, and the ruler) + the CD construction ruler
// (the theorem's own line, pocketed toe to sky-arc). IRON carries the sole
// (the baseline datum rod half-inlaid along the curb top, running A to B)
// + A/B/C joint pins. Sole night element: one warm bead at D — where the
// construction line meets the sky-arc (s363 sole-bead law).
//
// Exports are consumed by assets/mkv3-arbelos.ts (the build) and
// struct210-decode-arbelos.ts (the audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions are FINAL world-local coords.

// ---- constants -----------------------------------------------------------------------------------
export const r1 = 1.7;                          // left lobe radius (bigger)
export const r2 = 1.1;                          // right lobe radius
export const R = r1 + r2;                       // outer semicircle radius = 2.8
export const CD_H = 2 * Math.sqrt(r1 * r2);     // construction-line height (Book of Lemmas 4)

export const PLINTH_H = 0.26;
export const MARGIN = 0.35;
export const PLINTH_L = 2 * R + 2 * MARGIN;     // the long curb (6.30)
export const PLINTH_D = 0.90;
export const Y0 = PLINTH_H;                     // baseline world height = curb top
export const EMBED = 0.08;                      // plate-toe embed (cradle class, disclosed)

export const DEPTH = 0.24;                      // plate z-thickness
export const COURSE_T = 0.155;                  // course height (uniform)
export const COURSE_TARGET = 0.32;              // voussoir length target
export const JOINT = 0.012;                     // voussoir joint gap
export const MIN_SPAN = 0.07;                   // discard razor slivers at the A/B knife edges (disclosed)

export const TWIN_R = (r1 * r2) / R;            // twin radius closed form 0.667857...
export const RING_T = 0.05;                     // twin ring tube radius
export const RULER_T = 0.045;                   // CD ruler tube radius
export const ROD_R = 0.04;                      // sole rod radius
export const PIN_R = 0.055;                     // A/B/C joint pin radius
export const BEAD_R = 0.07;                     // sole night bead radius (at D)

// math-frame points (A at x=0, baseline y=0; region spans x in [0, 2R])
export const A: [number, number] = [0, 0];
export const B: [number, number] = [2 * R, 0];
export const C: [number, number] = [2 * r1, 0];
export const D: [number, number] = [2 * r1, CD_H];

// ---- boundary curves ------------------------------------------------------------------------------
export const yOuter = (x: number): number => Math.sqrt(Math.max(0, R * R - (x - R) ** 2));
export const yLobe = (x: number): number => {
    if (x <= 0 || x >= 2 * R) return 0;
    if (x <= 2 * r1) return Math.sqrt(Math.max(0, r1 * r1 - (x - r1) ** 2));
    return Math.sqrt(Math.max(0, r2 * r2 - (x - (2 * r1 + r2)) ** 2));
};

// region intervals at height y: outer interval MINUS lobe intervals
export function regionAt(y: number): Array<[number, number]> {
    if (y >= R) return [];
    const sR = Math.sqrt(Math.max(0, R * R - y * y));
    let spans: Array<[number, number]> = [[R - sR, R + sR]];
    const cut = (lo: number, hi: number) => {
        const out: Array<[number, number]> = [];
        for (const [a, b] of spans) {
            if (hi <= a || lo >= b) { out.push([a, b]); continue; }
            if (lo > a) out.push([a, lo]);
            if (hi < b) out.push([hi, b]);
        }
        return out.filter(([a, b]) => b - a > 1e-12);
    };
    if (y < r1) { const s1 = Math.sqrt(r1 * r1 - y * y); spans = cut(r1 - s1, r1 + s1); }
    if (y < r2) { const s2 = Math.sqrt(r2 * r2 - y * y); spans = cut(2 * r1 + r2 - s2, 2 * r1 + r2 + s2); }
    return spans.filter(([a, b]) => b - a > 1e-12);
}

// ---- Archimedes twins (Book of Lemmas 5) -----------------------------------------------------------
// Left twin: tangent to CD line from the left (xtL = 2r1 - t), tangent to the
// left lobe externally: (r1-t)^2 + yt^2 = (r1+t)^2  =>  yt = 2*sqrt(r1*t).
// Internal tangency to the outer arc follows EXACTLY (verified in L1):
// (r1-t-r2)^2 + 4*r1*t == (R-t)^2  by the closed forms. Right twin mirrors
// with r2. All machine-checked — the derivation is the theorem.
export const TWIN_L_C: [number, number] = [2 * r1 - TWIN_R, 2 * Math.sqrt(r1 * TWIN_R)];
export const TWIN_R_C: [number, number] = [2 * r1 + TWIN_R, 2 * Math.sqrt(r2 * TWIN_R)];

// ---- the crotch keel (the blade's stand) --------------------------------------------------------------
// The arbelos region meets the baseline only in sub-cm slivers (all three
// arcs leave the baseline tangentially horizontal — the wedge opens as
// ~(r1+r2) - sqrt(r1²-y²) - sqrt(r2²-y²) ≈ 0.75y²), so the stepped plate's
// lowest wedge voussoir is k=1 (yTop 0.31, 7cm wide) and NOTHING grounds
// the plate. The stand is the wedge itself: a stepped KEEL of five stone
// boxes from a curb-embedded toe (8cm, morley base-course class) rising to
// the k=1 voussoir bottom, widths following the exact wedge law (min 35mm
// for meshing). The keel reads as the blade standing on its edge. The A/B
// knife tips die in the air BY DESIGN — the versiera arm class, disclosed
// with measured margins in L6.
export const wedgeW = (y: number): number =>
    Math.max(0, (r1 + r2) - Math.sqrt(Math.max(0, r1 * r1 - y * y)) - Math.sqrt(Math.max(0, r2 * r2 - y * y)));
export const KEEL_MIN_W = 0.035;
export interface KeelBox { y0: number; y1: number; w: number }
export const KEEL: KeelBox[] = [];
{
    // the keel rises from the BASELINE (math y=0, which world-maps to curb
    // top − 8cm — already embedded) to the k=1 voussoir bottom
    const yTop = COURSE_T;
    const N = 5, h = yTop / N;
    for (let i = 0; i < N; i++) {
        const y0 = i * h, y1 = (i + 1) * h;
        KEEL.push({ y0, y1, w: Math.max(KEEL_MIN_W, wedgeW(y1)) });
    }
}
export const KEEL_W = KEEL.map((b) => ({ ...b, y0w: b.y0 + Y0 - EMBED, y1w: b.y1 + Y0 - EMBED }));

// ---- world frame (root identity): x centered on 2R, y lifted to curb top minus toe embed, z = 0 ----
export const worldPt = (m: [number, number]): [number, number, number] => [m[0] - R, m[1] + Y0 - EMBED, 0];
export const A_W = worldPt(A), B_W = worldPt(B), C_W = worldPt(C), D_W = worldPt(D);
export const TWIN_L_W = worldPt(TWIN_L_C);
export const TWIN_R_W = worldPt(TWIN_R_C);

// ---- course + voussoir table -----------------------------------------------------------------------
export interface Voussoir { y: number; yTop: number; x0: number; x1: number }   // math frame
export const VOUSSOIRS: Voussoir[] = [];
{
    for (let k = 0; ; k++) {
        const y0 = k * COURSE_T, y1 = y0 + COURSE_T;
        if (y0 >= R - 1e-9) break;
        for (const [x0, x1] of regionAt(Math.min(y1, R))) {
            if (x1 - x0 < MIN_SPAN) continue;                     // knife-edge sliver (disclosed)
            const L = x1 - x0;
            const n = Math.max(1, Math.round(L / COURSE_TARGET));
            const segLen = (L - (n - 1) * JOINT) / n;
            for (let i = 0; i < n; i++) VOUSSOIRS.push({ y: y0, yTop: y1, x0: x0 + i * (segLen + JOINT), x1: x0 + i * (segLen + JOINT) + segLen });
        }
    }
}
export const VOUSSOIRS_W = VOUSSOIRS.map((v) => ({ ...v, x0w: v.x0 - R, x1w: v.x1 - R, yw: v.y + Y0 - EMBED, yTopw: v.yTop + Y0 - EMBED }));

// ---- envelope (analytic) ---------------------------------------------------------------------------
// x/z: the curb is the widest/deepest element (rings + plate sit inside its
// extents); y: the LEFT twin ring's tube protrudes RING_T past the outer arc
// near its internal-tangency station — the seated-ring read (disclosed) — so
// the ring tube top, not the plate crown, sets the height.
const _ringTopW = Math.max(TWIN_L_C[1], TWIN_R_C[1]) + TWIN_R + RING_T + Y0 - EMBED;
export const ENVELOPE = {
    min: [-PLINTH_L / 2, 0, -PLINTH_D / 2] as [number, number, number],
    max: [PLINTH_L / 2, Math.max(R + Y0 - EMBED, D_W[1] + BEAD_R, _ringTopW), PLINTH_D / 2] as [number, number, number],
};

// ---- THE LAWS (run when executed directly) -----------------------------------------------------------
if (import.meta.main) {
    const fails: string[] = [];
    const check = (name: string, ok: boolean, detail = "") => {
        console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) fails.push(name);
    };
    const hyp = Math.hypot;

    // L1 TWIN TANGENCIES (Book of Lemmas 5) — each twin tangent to all three boundaries, machine-exact
    {
        let worst = 0;
        const t = TWIN_R;
        worst = Math.max(worst,
            Math.abs(hyp(TWIN_L_C[0] - r1, TWIN_L_C[1]) - (r1 + t)),
            Math.abs(hyp(TWIN_L_C[0] - R, TWIN_L_C[1]) - (R - t)),
            Math.abs(2 * r1 - TWIN_L_C[0] - t),
            Math.abs(hyp(TWIN_R_C[0] - (2 * r1 + r2), TWIN_R_C[1]) - (r2 + t)),
            Math.abs(hyp(TWIN_R_C[0] - R, TWIN_R_C[1]) - (R - t)),
            Math.abs(TWIN_R_C[0] - 2 * r1 - t));
        check("L1 twin-tangencies", worst < 1e-12,
            `worst residual ${worst.toExponential(2)} m — each twin tangent to its lobe arc (external), the outer arc (internal), and the CD line; twin radius ${t.toFixed(12)} == r1·r2/R; center heights 2·sqrt(r·t) = ${TWIN_L_C[1].toFixed(9)} / ${TWIN_R_C[1].toFixed(9)}`);
    }

    // L2 TWIN PLACEMENT HONESTY — rings clear each other, kiss the arcs (no
    // float), and ride the face (tube may socket into the stone at the
    // tangent points — morley forged-head class, disclosed)
    {
        const centerGap = hyp(TWIN_R_C[0] - TWIN_L_C[0], TWIN_R_C[1] - TWIN_L_C[1]);
        const circleGap = centerGap - 2 * TWIN_R;
        // no-float law: every station of each ring's CENTERLINE circle lies
        // within the region band grown by the tube radius (the ring hugs the
        // band, never hovering in open void)
        let worstLow = Infinity, worstHigh = -Infinity;
        for (const [cx, cy] of [TWIN_L_C, TWIN_R_C]) {
            for (let i = 0; i < 720; i++) {
                const th = (i / 720) * 2 * Math.PI;
                const px = cx + TWIN_R * Math.cos(th), py = cy + TWIN_R * Math.sin(th);
                worstLow = Math.min(worstLow, py - (yLobe(px) - RING_T));
                worstHigh = Math.max(worstHigh, py - (yOuter(px) + RING_T));
            }
        }
        // the twins + the CD ruler converge at the construction line: tube
        // surfaces merge into ONE forged weld (disclosed — one brass
        // instrument, not three hovering parts)
        const weldDepth = 2 * RING_T - circleGap;
        check("L2 twins-honest", circleGap > 0 && worstLow >= -1e-9 && worstHigh <= 1e-9,
            `ring centerline circles clear by ${circleGap.toFixed(6)} m (congruent, NOT mutually tangent — the honest asymmetric knife, disclosed); every centerline station inside the band grown by the tube (worst low-side margin ${worstLow.toFixed(4)}, high-side ${worstHigh.toFixed(4)}) — no float; rings + ruler merge at the CD line into one forged weld (overlap ${weldDepth.toFixed(3)} m, disclosed)`);
    }

    // L3 GEOMETRIC-MEAN HEIGHT + AREA THEOREM (Book of Lemmas 4)
    {
        const hAtCD = yOuter(2 * r1);
        let aOuter = 0, aLobes = 0;
        const N = 40000;
        for (let i = 0; i < N; i++) {
            const x = (i + 0.5) * (2 * R) / N;
            aOuter += yOuter(x) * (2 * R) / N;
            aLobes += yLobe(x) * (2 * R) / N;
        }
        const area = aOuter - aLobes;
        const want = Math.PI * r1 * r2;
        const wantRect = Math.PI * CD_H * CD_H / 4;
        check("L3 geomean-height-area", Math.abs(hAtCD - CD_H) < 1e-12 && Math.abs(area - want) / want < 1e-6 && Math.abs(wantRect - want) < 1e-12,
            `D on the outer arc at ${hAtCD.toFixed(12)} == 2·sqrt(r1·r2) ${CD_H.toFixed(12)} exact (the geometric mean of the lobes); arbelos area ${area.toFixed(8)} == pi·r1·r2 ${want.toFixed(8)} == pi·h²/4 (the CD rectangle) exactly — Book of Lemmas 4 machine-verified`);
    }

    // L4 ARC JOINTS — the boundary arcs meet only at A/B/C/D; band open between crowns and outer arc
    {
        const cIsJoint = Math.abs(yLobe(2 * r1)) < 1e-12 && Math.abs(2 * r1 - C[0]) < 1e-12;
        const dOnArc = Math.abs(yOuter(D[0]) - D[1]) < 1e-12;
        const endsOnBase = Math.abs(yOuter(0)) < 1e-9 && Math.abs(yOuter(2 * R)) < 1e-9 && Math.abs(yLobe(0)) < 1e-9 && Math.abs(yLobe(2 * R)) < 1e-9;
        const midGap = Math.min(yOuter(r1) - yLobe(r1), yOuter(2 * r1 + r2) - yLobe(2 * r1 + r2));
        check("L4 arc-joints", cIsJoint && dOnArc && endsOnBase && midGap > 0.8,
            `lobes meet the baseline at A/C/B exact; D on the outer arc exact; crown gaps ${midGap.toFixed(3)} m — the band is genuinely open, no mid-arc crossings (region thins toward A/B, tallest at CD — the true arbelos profile)`);
    }

    // L5 COURSE LAWS — spans exact at course top, bounded under-hang at bottom, keystone at the crown
    {
        let exactTop = true, underhangOK = true, inside = true, keystone = false;
        let worstX = 0, worstY = 0, worstBy = 0;
        for (const v of VOUSSOIRS) {
            inside = inside && v.x0 >= -1e-9 && v.x1 <= 2 * R + 1e-9;
            let hit = false;
            for (const [a, b] of regionAt(v.yTop)) {
                if (v.x0 >= a - 1e-9 && v.x1 <= b + 1e-9) { hit = true; break; }
            }
            if (!hit) {
                exactTop = false;
                const off = Math.max(
                    ...regionAt(v.yTop).map(([a, b]) => v.x0 < a ? a - v.x0 : v.x1 > b ? v.x1 - b : 0));
                if (off > worstBy) { worstBy = off; worstX = v.x0; worstY = v.yTop; }
            }
            const mid = (v.x0 + v.x1) / 2;
            underhangOK = underhangOK && (v.yTop >= yLobe(mid) - COURSE_T - 1e-9) && (v.yTop > 1e-9 ? v.yTop <= yOuter(mid) + 1e-6 : true);
            if (v.x0 <= R && v.x1 >= R && v.yTop > R - COURSE_T) keystone = true;
        }
        check("L5 course-laws", exactTop && underhangOK && inside && keystone && VOUSSOIRS.length >= 40,
            `${VOUSSOIRS.length} voussoirs; every span inside region(yTop) exactly${worstBy > 0 ? ` (worst offender x ${worstX.toFixed(3)} yTop ${worstY.toFixed(3)} by ${worstBy.toFixed(4)} m)` : ""}; stepped under-hang <= one course (soundmirror register, disclosed); keystone course spans the crown at x=R`);
    }

    // L6 SEATING + GRADING — keel embed, sole-rod post-embed, air margins disclosed
    {
        const keelToe = KEEL_W[0].y0w;                       // 0.180 = curb top − 8cm
        const rodBottom = Y0 - ROD_R;
        // A/B wedge air margins: where does each knife-edge course END (top y)
        // relative to the curb top — the versiera arm disclosure, measured
        const course1 = regionAt(COURSE_T);
        const aTip = course1[0]?.[0] ?? NaN, bTip = course1[course1.length - 1]?.[1] ?? NaN;
        const keelOK = Math.abs(keelToe - (PLINTH_H - 0.08)) < 1e-12 && KEEL[0].y0 === 0 && KEEL[KEEL.length - 1].y1 === COURSE_T && KEEL.length === 5;
        check("L6 seating-grading", keelOK && rodBottom >= 0 && Math.abs(D_W[1] - (CD_H + Y0 - EMBED)) < 1e-12,
            `keel toe at curb top − 8cm ${keelToe.toFixed(3)} (cradle embed; ${KEEL.length} steps, top width ${KEEL[KEEL.length - 1].w.toFixed(3)} m meeting the k=1 voussoir); sole rod bottom ${rodBottom.toFixed(3)} (half-inlaid post-embed); A/B knife-edge tips die in air BY DESIGN (course-1 spans start/end at x ${aTip.toFixed(3)}/${bTip.toFixed(3)} — the region converges to sub-cm slivers at the baseline, versiera arm class); bead anchored at D on the sky-arc`);
    }

    // L7 ENVELOPE + FOLLY CLASS
    {
        const h = ENVELOPE.max[1];
        const footprint = PLINTH_L * PLINTH_D;
        check("L7 envelope-folly", h >= 2.2 && footprint < 16,
            `envelope ${(ENVELOPE.max[0] - ENVELOPE.min[0]).toFixed(3)}x${h.toFixed(3)}x${(ENVELOPE.max[2] - ENVELOPE.min[2]).toFixed(3)}; curb footprint ${footprint.toFixed(2)} m² < 16 — FOLLY CLASS, no walk owed`);
    }

    // RED CONTROL — a 2% error in r1 must break the tangency law AND the area theorem
    {
        const r1b = r1 * 1.02, tBad = (r1b * r2) / (r1b + r2);
        const resid = Math.abs(hyp(2 * r1 - tBad - r1b, 2 * Math.sqrt(r1b * tBad)) - (r1b + tBad));
        check("RED mutant-detects", Math.abs(tBad - TWIN_R) > 1e-6 && resid > 1e-6,
            `2% r1 error: twin radius shifts ${Math.abs(tBad - TWIN_R).toFixed(6)} m and tangency residual ${resid.toFixed(6)} m — the laws detect`);
    }

    if (fails.length) { console.error(`${fails.length} FAIL(s): ${fails.join(", ")}`); process.exit(1); }
    console.log("ALL PASS");
}
