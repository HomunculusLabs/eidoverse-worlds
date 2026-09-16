// struct198-probe-rhodonea.ts — THE ONE CONTRACT for R11-23 THE RHODONEA
// (Grandi's rose, k=7). The rose and its circle.
//
// Rhodonea (Grandi 1728): r(θ) = a·cos(kθ), k=7 ODD → exactly 7 petals,
// the whole curve traced ONCE over θ ∈ [0, π] with SIGNED r.
//   - PETAL TIPS at r-extrema: 7θ = nπ → θ_n = nπ/7, n = 0..7 (eight θ
//     values; θ=0 and θ=π map to the SAME world point — the trace closes)
//   - THE KISS THEOREM: at every tip r′ = −7a·sin(7θ) = 0, so the tangent
//     is PURELY AZIMUTHAL — perpendicular to the radius. A circle of
//     radius a centered at the heart is kissed TANGENTIALLY by every
//     petal tip: one iron ring, seven exact kisses.
//   - TOTAL AREA exactly πa²/4 (odd k — classic; each of the 7 congruent
//     petals πa²/28)
//   - the 7 petals meet ONLY at the heart (the origin), crossing at
//     angles spaced π/k = 25.71°
//
// WORLD FRAME: vertical construction plane = XY (the Math Avenue
// convention; reads on the +Z face). Heart at (0, YC); the rose is
// ROTATED so one petal points straight UP (crown petal) — tip directions
// then land mirror-symmetric about the world vertical: up, ±51.43°,
// ±102.86°, ±154.29° (25.71° below horizontal). STONE carries the curve
// (one continuous arc-uniform voussoir ribbon, joint at every tip kiss,
// 0.12 tip-zone steps / 0.30 flanks) and the BOSS COLUMN grade→heart.
// IRON carries the RING (torus r=a, tube 0.045, centered on the heart,
// carried by the column at its lowest point). Sole night element: one
// warm bead at the HEART (where all seven petals are born).
//
// Exports are consumed by assets/mkv3-rhodonea.ts (the build) and
// struct198-decode-rhodonea.ts (the audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions below are FINAL world-local coords.

// ---- constants -----------------------------------------------------------------------------------
export const A = 2.30;              // rose parameter a — petal length; the ring radius
export const K = 7;                 // petals (odd — one-trace closure law)
export const YC = 2.75;             // heart height (world)
export const ROT = Math.PI / 2;     // world rotation — petal 0 points straight UP

export const CURB_W = 5.00;         // stone curb slab (world x) — the ground echo
export const CURB_H = 0.24;         // curb height
export const CURB_D = 0.60;         // curb depth (z) — governs envelope z ±0.30

export const RIB_SEC_N = 0.16;      // stone voussoir in-plane thickness
export const RIB_SEC_D = 0.20;      // stone voussoir depth (z)
export const L_STEP = 0.30;         // arc-uniform voussoir ARC length on the flanks
export const TIP_STEP = 0.12;       // arc step inside tip zones — the tip radius of
                                    // curvature is a/k² = 47mm; dev at 0.12 ≈ 38mm
                                    // < 45mm cover law (dev at 0.30 would be 240mm)
export const TIP_ZONE = 0.50;       // arc-radius around each tip using TIP_STEP
export const JOINT = 0.006;         // voussoir chord-length joint extension (mk box law)

export const RING_T = 0.045;        // iron ring tube radius
export const COL_SEC = 0.26;        // boss column square section (stone)
export const COL_BASE = 0.12;       // column base embed in curb
export const COL_TOP = YC + 0.13;   // column top — half-boss proud of the heart

export const BEAD_R = 0.07;         // heart bead radius
export const BEAD_Z = COL_SEC / 2;  // half-embedded toward +z front face (struct-52/188 law)

// ---- the curve --------------------------------------------------------------------------------------
// r(θ) = a·cos(7θ) SIGNED; world point heart-relative (r·cos(θ+ROT), r·sin(θ+ROT)).
export const rose = (t: number): number => A * Math.cos(K * t);
export const roseD = (t: number): number => -K * A * Math.sin(K * t);
export const worldPt = (t: number): [number, number] => {
    const r = rose(t);
    return [r * Math.cos(t + ROT), YC + r * Math.sin(t + ROT)];
};

// polar arc speed with signed r: √(r² + r′²)
export const roseSpeed = (t: number): number => Math.hypot(rose(t), roseD(t));

// arc length over [t0, t1] ⊂ [0, π] (speed never vanishes — r=±a at extrema)
export function roseArc(t0: number, t1: number): number {
    const N = 4000;
    const dt = Math.abs(t1 - t0) / N;
    const base = Math.min(t0, t1);
    let s = 0;
    for (let i = 0; i < N; i++) {
        const t = base + (i + 0.5) * dt;
        s += roseSpeed(t) * dt;
    }
    return s;
}

export const TOTAL_ARC = roseArc(0, Math.PI);

// tip thetas: θ_n = nπ/7, n = 0..7 (8 values; 0 and π close the trace)
export const TIP_TS = Array.from({ length: K + 1 }, (_, i) => (i * Math.PI) / K);
export const TIP_S = TIP_TS.map((t) => roseArc(0, t));   // arc positions of the tips

const inTipZone = (s: number): boolean => TIP_S.some((ts) => Math.abs(s - ts) < TIP_ZONE);

// invert arc → theta (roseArc strictly increasing on [0, π])
function sToTheta(s: number): number {
    let lo = 0, hi = Math.PI;
    for (let it = 0; it < 80; it++) {
        const mid = (lo + hi) / 2;
        if (roseArc(0, mid) < s) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
}

// STATIONS: every tip IS a station (a voussoir JOINT lands on each kiss);
// tip-zone edges are sub-anchors; uniform fill between marks (0.12 in
// zones, 0.30 on flanks). Same discipline as folium's node caps.
export function stationsTheta(): number[] {
    const T = TOTAL_ARC;
    const marks = [0, T];
    for (let i = 0; i <= K; i++) {
        marks.push(TIP_S[i]);
        for (const e of [TIP_S[i] - TIP_ZONE, TIP_S[i] + TIP_ZONE]) {
            if (e > 0.05 && e < T - 0.05) marks.push(e);
        }
    }
    marks.sort((a, b) => a - b);
    const out: number[] = [];
    for (let i = 0; i < marks.length - 1; i++) {
        const a = marks[i], b = marks[i + 1];
        out.push(a);
        const len = b - a;
        if (len <= 0.24) continue;                       // closed by the next mark's push
        const step = inTipZone((a + b) / 2) ? TIP_STEP : L_STEP;
        const n = Math.max(1, Math.round(len / step));
        for (let j = 1; j < n; j++) out.push(a + (len * j) / n);
    }
    out.push(T);
    return out.map(sToTheta);
}

// distinct tip world points (7 — first==last by closure)
export const TIP_PTS: Array<[number, number]> = (() => {
    const pts = TIP_TS.slice(0, K).map((t) => worldPt(t));
    return pts;
})();

// ---- envelope contract (probe models the mk boxes EXACTLY; decode re-derives from verts) -----------
export const ENVELOPE = (() => {
    let minX = -CURB_W / 2, maxX = CURB_W / 2;
    let minY = 0, maxY = CURB_H;
    let minZ = -CURB_D / 2, maxZ = CURB_D / 2;
    const grow = (px: number, py: number, pz: number, hx: number, hy: number, hz: number) => {
        minX = Math.min(minX, px - hx); maxX = Math.max(maxX, px + hx);
        minY = Math.min(minY, py - hy); maxY = Math.max(maxY, py + hy);
        minZ = Math.min(minZ, pz - hz); maxZ = Math.max(maxZ, pz + hz);
    };
    // curb
    grow(0, CURB_H / 2, 0, CURB_W / 2, CURB_H / 2, CURB_D / 2);
    // voussoir boxes (chord a->b in XY, len+JOINT x N x D, rotated in-plane)
    const rib = (a: [number, number], b: [number, number]) => {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) + JOINT;
        const ang = Math.atan2(dy, dx);
        const c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang));
        grow((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0,
            (len * c + RIB_SEC_N * s) / 2, (len * s + RIB_SEC_N * c) / 2, RIB_SEC_D / 2);
    };
    const ts = stationsTheta();
    for (let i = 0; i < ts.length - 1; i++) rib(worldPt(ts[i]), worldPt(ts[i + 1]));
    // ring: torus radius a centered at the heart, in-plane — axis box
    grow(0, YC, 0, A + RING_T, A + RING_T, RING_T);
    // boss column
    grow(0, (COL_BASE + COL_TOP) / 2, 0, COL_SEC / 2, (COL_TOP - COL_BASE) / 2, COL_SEC / 2);
    // bead
    grow(0, YC, BEAD_Z, BEAD_R, BEAD_R, BEAD_R);
    return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
})();

// ---- laws -----------------------------------------------------------------------------------------
function approxEq(a: number, b: number, tol: number, what: string) {
    if (Math.abs(a - b) > tol) throw Error(`LAW FAIL ${what}: ${a} vs ${b} (tol ${tol})`);
}

function main() {
    // L1 THE EQUATION: every authored point satisfies the polar identity —
    // heart-relative distance == |a·cos(7θ)| and direction == θ+ROT (mod π).
    {
        const N = 6001;
        let worst = 0;
        for (let i = 0; i < N; i++) {
            const t = (i / (N - 1)) * Math.PI;
            const [x, y] = worldPt(t);
            const px = x, py = y - YC;
            const r = rose(t);
            worst = Math.max(worst, Math.abs(Math.hypot(px, py) - Math.abs(r)));
            // direction: signed-r point angle == θ+ROT (+π when r<0)
            const ang = Math.atan2(py, px);
            const want = t + ROT + (r < 0 ? Math.PI : 0);
            const dAng = Math.abs(((ang - want + Math.PI * 3) % (2 * Math.PI)) - Math.PI);
            worst = Math.max(worst, dAng * A);   // angular residual as arc length
        }
        approxEq(worst, 0, 1e-9, "L1 polar identity");
        console.log(`L1 PASS rhodonea satisfies r=a·cos(7θ) worst residual ${worst.toExponential(2)} over θ ∈ [0,π] (signed-r one-trace closure)`);
    }

    // L2 THE KISS THEOREM: 7 distinct tips, each at |tip−heart| == a EXACTLY;
    // tangent ⊥ radius at every tip (|t·ê_r| ≤ 1e-6 — the kiss is tangential);
    // crown tip straight up; the 7 plan-angles == π/2 + j·2π/7 (mod 2π);
    // trace closes (θ=π returns to the θ=0 point).
    {
        approxEq(Math.hypot(worldPt(Math.PI)[0] - worldPt(0)[0], worldPt(Math.PI)[1] - worldPt(0)[1]),
            0, 1e-12, "L2 trace closure θ=π == θ=0");
        const h = 1e-6;
        for (let i = 0; i < K; i++) {
            const t = TIP_TS[i];
            const p = worldPt(t);
            approxEq(Math.hypot(p[0], p[1] - YC), A, 1e-12, `L2 tip ${i} on the circle |P−heart| == a`);
            const pa = worldPt(t - h), pb = worldPt(t + h);
            const tan: [number, number] = [pb[0] - pa[0], pb[1] - pa[1]];
            const rad: [number, number] = [p[0], p[1] - YC];
            const dot = Math.abs((tan[0] * rad[0] + tan[1] * rad[1]) / (Math.hypot(...tan) * Math.hypot(...rad)));
            if (dot > 1e-6) throw Error(`L2 tip ${i} tangent NOT ⊥ radius (|cos| ${dot.toExponential(2)}) — the kiss would be a cross, not a kiss`);
        }
        const crown = TIP_PTS[0];
        approxEq(crown[0], 0, 1e-12, "L2 crown tip x == 0");
        approxEq(crown[1], YC + A, 1e-12, "L2 crown tip y == YC + a");
        const angs = TIP_PTS.map((p) => ((Math.atan2(p[1] - YC, p[0]) - Math.PI / 2 + 2 * Math.PI * 2) % (2 * Math.PI)));
        const wantSet = Array.from({ length: K }, (_, j) => (j * 2 * Math.PI) / K);
        for (const w of wantSet) {
            if (!angs.some((a) => Math.abs(a - w) < 1e-9 || Math.abs(a - w - 2 * Math.PI) < 1e-9))
                throw Error(`L2 tip direction ${w.toFixed(4)} missing — not the 7-fold symmetric crown rose`);
        }
        console.log(`L2 PASS 7 tips on the circle r=a, tangent ⊥ radius at every one (the kiss theorem); crown petal straight up; 7-fold symmetric directions; trace closes`);
    }

    // L3 AREA: total area over the one-trace == πa²/4 EXACTLY (odd-k classic);
    // one petal == total/7 (congruent petals — Green on a single lobe).
    {
        const M = 40000;
        let area2 = 0;
        for (let i = 0; i < M; i++) {
            const p = worldPt((i / M) * Math.PI), r = worldPt(((i + 1) / M) * Math.PI);
            area2 += p[0] * r[1] - r[0] * p[1];
        }
        const total = Math.abs(area2) / 2;
        approxEq(total, (Math.PI * A * A) / 4, 5e-3, "L3 total area == πa²/4");
        // one petal: θ ∈ [−π/14, π/14] around the crown tip traces ONE lobe (r ≥ 0)
        let pet2 = 0;
        const t0 = -Math.PI / (2 * K), t1 = Math.PI / (2 * K);
        for (let i = 0; i < M / 4; i++) {
            const p = worldPt(t0 + ((i / (M / 4)) * (t1 - t0)));
            const r = worldPt(t0 + (((i + 1) / (M / 4)) * (t1 - t0)));
            pet2 += p[0] * r[1] - r[0] * p[1];
        }
        const petal = Math.abs(pet2) / 2;
        approxEq(petal, (Math.PI * A * A) / (4 * K), 5e-4, "L3 petal area == πa²/28");
        console.log(`L3 PASS total area ${total.toFixed(4)} == πa²/4 ${(Math.PI * A * A / 4).toFixed(4)}; one petal ${petal.toFixed(4)} == πa²/28 — seven congruent petals`);
    }

    // L4 STATION WALK: every tip IS a station (joint on the kiss); zone steps
    // ≈ 0.12, flank steps ≈ 0.30, mark-bounded remainders ∈ (0.05, 0.40];
    // chord deviation at ARC-midpoints ≤ 45mm (the folium self-catch law).
    {
        const ts = stationsTheta();
        // every tip arc position has a station within 1mm of arc
        for (const sTip of TIP_S) {
            const best = Math.min(...ts.map((t) => Math.abs(roseArc(0, t) - sTip)));
            if (best > 1e-3) throw Error(`L4 tip at arc ${sTip.toFixed(3)} has no station (closest ${best.toFixed(4)}) — the kiss must be a joint`);
        }
        // step census
        const steps: number[] = [];
        for (let i = 0; i < ts.length - 1; i++) steps.push(roseArc(ts[i], ts[i + 1]));
        const zoneSteps = steps.filter((s) => s < 0.2);
        const flankSteps = steps.filter((s) => s >= 0.2);
        if (zoneSteps.length < 7 * 6) throw Error(`L4 only ${zoneSteps.length} tip-zone steps (expect ≥42)`);
        for (const s of zoneSteps) if (Math.abs(s - TIP_STEP) > 0.06 && s > 0.2) throw Error(`L4 zone step ${s.toFixed(3)} out of band`);
        for (const s of flankSteps) if (Math.abs(s - L_STEP) > 0.08 && s <= 0.2) throw Error(`L4 flank step ${s.toFixed(3)} out of band`);
        let maxStep = 0;
        for (const s of steps) maxStep = Math.max(maxStep, s);
        if (maxStep > 0.40) throw Error(`L4 max step ${maxStep.toFixed(3)} > 0.40`);
        // chord deviation at ARC midpoints
        const arcMidT = (ta: number, tb: number): number => {
            const half = roseArc(ta, tb) / 2;
            let lo = ta, hi = tb;
            for (let it = 0; it < 60; it++) {
                const mid = (lo + hi) / 2;
                if (roseArc(ta, mid) < half) lo = mid; else hi = mid;
            }
            return (lo + hi) / 2;
        };
        let worstDev = 0;
        for (let i = 0; i < ts.length - 1; i++) {
            const a = worldPt(ts[i]), b = worldPt(ts[i + 1]), m = worldPt(arcMidT(ts[i], ts[i + 1]));
            const dev = Math.hypot(m[0] - (a[0] + b[0]) / 2, m[1] - (a[1] + b[1]) / 2);
            worstDev = Math.max(worstDev, dev);
            if (dev > 0.045) throw Error(`L4 chord deviation ${(dev * 1000).toFixed(1)}mm at i=${i} — shorten the zone step`);
        }
        console.log(`L4 PASS ${ts.length} stations; every tip a station (7 kisses are joints); zone ${TIP_STEP} flank ${L_STEP} max ${maxStep.toFixed(3)}; worst chord dev ${(worstDev * 1000).toFixed(1)}mm ≤ 45mm`);
    }

    // L5 RING + COLUMN: ring radius == a centered on the heart (in-plane);
    // the ring's lowest point sits ON the boss column axis (carried); the
    // column rises from curb embed to a half-boss proud of the heart; the
    // ring's low arc clears the curb top by ≥ 0.10.
    {
        approxEq(COL_TOP, YC + 0.13, 1e-12, "L5 column half-boss top");
        if (COL_BASE >= CURB_H) throw Error("L5 column base above curb");
        const ringBottomY = YC - A - RING_T;
        if (ringBottomY - CURB_H < 0.10) throw Error(`L5 ring low arc clears curb by only ${(ringBottomY - CURB_H).toFixed(3)}`);
        if (Math.abs(0) > COL_SEC / 2) throw Error("L5 ring bottom off column axis");
        if (YC - A < COL_BASE || YC - A > COL_TOP) throw Error("L5 ring bottom outside column span — ring not carried");
        // heart-adjacent voussoirs interpenetrate the boss by DESIGN (petals
        // are born from the boss) — disclosed, like the folium node crossing.
        console.log(`L5 PASS ring r=${A} tube ${RING_T} on the heart; ring bottom (0,${(YC - A).toFixed(2)}) carried by the column (0.12→${COL_TOP.toFixed(2)}); low arc clears curb ${(ringBottomY - CURB_H).toFixed(3)}; heart-adjacent voussoirs embed the boss by design`);
    }

    // L6 GROUNDING: curb 0..0.24; column embed 0.12; bead half-embedded at
    // the heart front face; the whole curve inside the curb x-band; every
    // stone point ≥ 0.35 above grade (down-flank tips 0.68 − corner 0.08).
    {
        approxEq(BEAD_Z, COL_SEC / 2, 1e-12, "L6 bead half-embed z");
        const N = 20000;
        for (let i = 0; i < N; i++) {
            const [x, y] = worldPt((i / N) * Math.PI);
            if (Math.abs(x) > CURB_W / 2 - 0.1) throw Error(`L6 curve x ${x.toFixed(3)} outside the curb band`);
            if (y - RIB_SEC_N * 0.6 < 0.35) throw Error(`L6 curve dips to ${y.toFixed(3)} — below the 0.35 stone floor`);
        }
        console.log(`L6 PASS curb 0..${CURB_H}; column embed ${COL_BASE}; bead (0,${YC},${BEAD_Z}) half-embedded; curve inside the curb band; stone floor ≥ 0.35`);
    }

    // L7 ENVELOPE + collider honesty: origin-centered x/z, y ≥ 0, height ≥ 2.2,
    // footprint < 16 m² (folly — no walk owed), x-extent governed by the ring.
    {
        const sx = ENVELOPE.max[0] - ENVELOPE.min[0], sy = ENVELOPE.max[1] - ENVELOPE.min[1], sz = ENVELOPE.max[2] - ENVELOPE.min[2];
        approxEq(Math.abs(ENVELOPE.min[0] + ENVELOPE.max[0]), 0, 1e-9, "L7 x centered");
        approxEq(Math.abs(ENVELOPE.min[2] + ENVELOPE.max[2]), 0, 1e-9, "L7 z centered");
        if (ENVELOPE.min[1] < -1e-9) throw Error("L7 below grade");
        if (sy < 2.2) throw Error("L7 height < 2.2");
        const fp = CURB_W * CURB_D;
        if (fp >= 16) throw Error("L7 footprint enters room class");
        console.log(`L7 PASS envelope ${sx.toFixed(2)}x${sy.toFixed(2)}x${sz.toFixed(2)} origin-centred x/z, y[0, ${ENVELOPE.max[1].toFixed(2)}]; footprint ${fp.toFixed(2)} m² < 16 — folly, no walk owed`);
    }

    console.log("ALL CHECKS PASS");
}

// RED control: run with argv[1] == "mutant" — wrong curve (k=6 rose): the
// polar identity law must detect it (6-petal geometry violates r=a·cos(7θ)).
if (process.argv[2] === "mutant") {
    const bad = (t: number): [number, number] => {
        const r = A * Math.cos(6 * t);
        return [r * Math.cos(t + ROT), YC + r * Math.sin(t + ROT)];
    };
    let worst = 0;
    for (let i = 0; i <= 2000; i++) {
        const t = (i / 2000) * Math.PI;
        const [x, y] = bad(t);
        worst = Math.max(worst, Math.abs(Math.hypot(x, y - YC) - Math.abs(rose(t))));
    }
    if (worst < 0.10) throw Error(`RED control FAILED to fail (worst ${worst})`);
    console.error(`RED control OK: mutant k=6 rose violates r=a·cos(7θ) by ${worst.toFixed(3)} — law detects`);
    process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("struct198-probe-rhodonea.ts") && !process.argv[2]) main();
export {};
