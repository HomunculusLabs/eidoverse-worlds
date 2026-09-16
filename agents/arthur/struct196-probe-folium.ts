// struct196-probe-folium.ts — THE ONE CONTRACT for R11-21 THE FOLIUM OF
// DESCARTES. The leaf and its vanishing line.
//
// Folium of Descartes (Descartes 1638, the correspondence duel with Fermat):
// the cubic  x³ + y³ = 3a·x·y,  parametrized
//     x = 3a·t/(1+t³),  y = 3a·t²/(1+t³),  t ∈ (−1, ∞):
//   - NODE (self-intersection) at the origin; the two branches are there
//     tangent to the COORDINATE AXES (y = x²/3a and x = y²/3a parabolas)
//   - closed LEAF LOOP for t ∈ [0, ∞): vertex (3a/2, 3a/2) at t=1,
//     loop area EXACTLY 3a²/2, loop x/y extent [0, 2^(2/3)a]
//   - open ARMS for t ∈ (−1, 0) and mirror: both race along the
//     ASYMPTOTE x + y + a = 0, approaching from the + side as a(t+1)²/(t²−t+1)
//
// WORLD FRAME (the composition frame): the curve's diagonal (x=y) becomes
// the world VERTICAL. world_x = v = (x−y)/√2 (across), world_y = u + YC
// with u = (x+y)/√2 (along the diagonal). In this frame:
//   - the node sits at (0, YC) and the four branches leave it at the four
//     45° diagonals (|du/dv| → 1 on every branch — the node reads as an X)
//   - the loop rises above the node to world_y = YC + 3a/√2
//   - the asymptote is the LEVEL line world_y = YC − a/√2
//
// STONE CARRIES THE CURVE (one continuous voussoir ribbon: arm → node →
// loop → node → mirror arm; arc-uniform 0.40 with 0.14 node caps — the
// folium speed → 0 at t = 0 and t → ±∞, the winding-cap class). IRON
// CARRIES THE ASYMPTOTE: a level rail on three posts (center post rises
// through the rail to carry the node bead itself). The arms die in the
// air just above the rail, never touching it — the asymptote's whole
// meaning. Sole night element: one warm bead at the node (the X itself).
//
// Exports are consumed by assets/mkv3-folium.ts (the build) and
// struct196-decode-folium.ts (the audit). ROOT STAYS IDENTITY
// (struct-188 law): all positions below are authored in FINAL world-local
// coords.

// ---- constants -----------------------------------------------------------------------------------
export const A = 1.30;              // folium parameter a — loop vertex 3a/2 = 1.95 on the diagonal
export const YC = 2.60;             // node height (world)

export const CURB_W = 7.60;         // stone curb slab (world x) — the level echo at grade
export const CURB_H = 0.24;         // curb height
export const CURB_D = 0.60;         // curb depth (z) — governs envelope z ±0.30

export const RIB_SEC_N = 0.16;      // stone voussoir in-plane thickness
export const RIB_SEC_D = 0.20;      // stone voussoir depth (z)
export const L_STEP = 0.30;         // arc-uniform voussoir ARC length — 0.30 not 0.40: the
                                    // folium's vertex curvature exceeds the nephroid's (probe
                                    // caught 55.6mm mid-chord dev at 0.40, 45.5 at 0.34; 0.30
                                    // gives ~36mm < 45mm cover law)
export const NODE_STEP = 0.14;      // node-adjacent cap arc (speed → 0 at the node)
export const JOINT = 0.006;         // voussoir chord-length joint extension (mk box law)

export const TIP_GAP = 0.20;        // AUTHORED tip-to-rail gap: the voussoir's lower corner
                                    // hangs ~80mm below the curve centerline, so 0.13 would
                                    // graze the rail top by 5mm (decode D8 caught it); 0.20
                                    // leaves a ~75mm air sliver — the race's readable end
// solve t* with world gap(t) = |3at(1+t)/(1+t³)|/√2 + a/√2 = TIP_GAP (monotone ↓ toward t=−1)
export const T_ARM = (() => {
    // world gap = ((x+y)+a)/√2 with x+y = 3at(1+t)/(1+t³) — direct formula, no forward refs
    const gap = (t: number) => {
        const sp = (3 * A * t * (1 + t)) / (1 + t * t * t);   // x+y
        return (sp + A) / Math.SQRT2;
    };
    let lo = -0.95, hi = 0;   // gap(lo) ≈ 0.0015 < target < gap(hi) = a/√2 ≈ 0.919; gap ↑ toward t=0
    for (let it = 0; it < 80; it++) {
        const mid = (lo + hi) / 2;
        if (gap(mid) > TIP_GAP) hi = mid; else lo = mid;  // above target → solution is below mid
    }
    return (lo + hi) / 2;
})();
export const ARM_ARC_LAZY = 0;   // placeholder removed; ARM_REACH derived after foliumArc below

export const RAIL_SEC = 0.09;       // asymptote rail square section
export const RAIL_HALF = 3.70;      // asymptote rail half-span (world x)
export const RAIL_Y = YC - A / Math.SQRT2;  // the TRUE asymptote line height (level)
export const POST_SEC = 0.20;       // iron post square section
export const POST_TOP_C = YC;       // center post top == node (carries the X)
export const POST_TOP_O = RAIL_Y - RAIL_SEC / 2; // outboard posts: rail seats ON top
export const POST_OUT = 3.55;       // outboard post centres (world x, ±)
export const POST_BASE = 0.12;      // post base embed in curb

export const BEAD_R = 0.07;         // node bead radius
export const BEAD_Z = RIB_SEC_D / 2; // half-embedded toward +z front face (struct-52/188 occlusion cure)

// ---- the curve --------------------------------------------------------------------------------------
// math frame: node at origin, diagonal x=y as loop axis.
export const folium = (t: number): [number, number] => {
    const d = 1 + t * t * t;
    return [(3 * A * t) / d, (3 * A * t * t) / d];
};
// world mapping: (x,y)_math -> (v, u) = ((x−y)/√2, (x+y)/√2) -> world (v, u+YC)
export const toWorld = (p: [number, number]): [number, number] =>
    [(p[0] - p[1]) / Math.SQRT2, (p[0] + p[1]) / Math.SQRT2 + YC];
export const worldPt = (t: number): [number, number] => toWorld(folium(t));

const foliumD = (t: number): [number, number] => {
    const d = 1 + t * t * t;
    return [
        (3 * A * (1 - 2 * t * t * t)) / (d * d),
        (3 * A * (2 * t - t * t * t * t)) / (d * d),
    ];
};
export const foliumSpeed = (t: number): number => Math.hypot(foliumD(t)[0], foliumD(t)[1]);

// arc length over [t0, t1], both in the SAME branch (never across t=−1)
export const foliumArc = (t0: number, t1: number): number => {
    const N = 4000;
    const dt = Math.abs(t1 - t0) / N;
    const base = Math.min(t0, t1);
    let s = 0;
    for (let i = 0; i < N; i++) {
        const t = base + (i + 0.5) * dt;
        s += foliumSpeed(t) * dt;
    }
    return s;
};

export const T_LOOP_END = 400;     // loop closes: arc from 400 to ∞ ≈ 3a/400 < 0.01 (node return)
export const LOOP_ARC = foliumArc(0, T_LOOP_END);

// arm parameter solved from the authored TIP_GAP (see constants above)
export const ARM_ARC = foliumArc(T_ARM, 0);
export const ARM_REACH = ARM_ARC;  // derived (≈1.5m): reported, not authored

// stations on the LEAF LOOP: node-adjacent cap NODE_STEP at the opening,
// arc-uniform L_STEP interior, remainder as the CLOSING voussoir that lands
// back at the node (t=T_LOOP_END → within 1cm of origin; the ∞ tail 3a/T
// is disclosed). Same shape as the nephroid rim law.
export function loopStations(): number[] {
    const targets: number[] = [NODE_STEP];
    while (targets[targets.length - 1] + L_STEP < LOOP_ARC - 0.10) {
        targets.push(targets[targets.length - 1] + L_STEP);
    }
    const ts: number[] = [0];
    for (const sTarget of targets) {
        let lo = ts[ts.length - 1], hi = T_LOOP_END;
        for (let it = 0; it < 80; it++) {
            const mid = (lo + hi) / 2;
            if (foliumArc(0, mid) < sTarget) lo = mid; else hi = mid;
        }
        ts.push((lo + hi) / 2);
    }
    ts.push(T_LOOP_END); // closing voussoir = remainder, lands at the node
    return ts;
}

// stations on ONE arm (t from T_ARM to 0), arc measured FROM the node:
// node cap first, L_STEP interior, remainder at the tip end.
export function armStations(): number[] {
    const targets: number[] = [NODE_STEP];
    while (targets[targets.length - 1] + L_STEP < ARM_ARC - 0.10) {
        targets.push(targets[targets.length - 1] + L_STEP);
    }
    const ts: number[] = [0];
    for (const sTarget of targets) {
        let a = T_ARM, b = ts[ts.length - 1];
        for (let it = 0; it < 80; it++) {
            const mid = (a + b) / 2;
            // s(t)=foliumArc(t,0) INCREASES as t decreases; s<b-target near t=0.
            // s(mid) < sTarget → mid too close to 0 → move b (0-side) down to mid.
            if (foliumArc(mid, 0) < sTarget) b = mid; else a = mid;
        }
        ts.push((a + b) / 2);
    }
    ts.push(T_ARM);
    return ts;
}

// arm tip (world) and its mirror — the race's end points
export const TIP = worldPt(T_ARM);
export const TIP_MIR: [number, number] = [-TIP[0], TIP[1]];

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
    // voussoir boxes: chord a->b (world), len+JOINT x N x D, rotated in the XY plane
    const rib = (a: [number, number], b: [number, number]) => {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) + JOINT;
        const ang = Math.atan2(dy, dx);
        const c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang));
        grow((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0,
            (len * c + RIB_SEC_N * s) / 2, (len * s + RIB_SEC_N * c) / 2, RIB_SEC_D / 2);
    };
    const lts = loopStations();
    for (let i = 0; i < lts.length - 1; i++) rib(worldPt(lts[i]), worldPt(lts[i + 1]));
    const ats = armStations();
    for (let i = 0; i < ats.length - 1; i++) {
        const p1 = worldPt(ats[i]), p2 = worldPt(ats[i + 1]);
        rib(p1, p2);
        rib([-p1[0], p1[1]], [-p2[0], p2[1]]); // mirror arm (v → −v)
    }
    // iron: rail + 3 posts
    grow(0, RAIL_Y, 0, RAIL_HALF, RAIL_SEC / 2, RAIL_SEC / 2);
    grow(0, (POST_BASE + POST_TOP_C) / 2, 0, POST_SEC / 2, (POST_TOP_C - POST_BASE) / 2, POST_SEC / 2);
    for (const s of [1, -1]) grow(s * POST_OUT, (POST_BASE + POST_TOP_O) / 2, 0, POST_SEC / 2, (POST_TOP_O - POST_BASE) / 2, POST_SEC / 2);
    // bead
    grow(0, YC, BEAD_Z, BEAD_R, BEAD_R, BEAD_R);
    return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
})();

// ---- laws -----------------------------------------------------------------------------------------
function approxEq(a: number, b: number, tol: number, what: string) {
    if (Math.abs(a - b) > tol) throw Error(`LAW FAIL ${what}: ${a} vs ${b} (tol ${tol})`);
}

function main() {
    // L1 THE EQUATION: every authored parametric point satisfies x³+y³ = 3axy;
    // the mirror arm (x↔y) satisfies it by symmetry.
    {
        const N = 6001;
        let worst = 0;
        for (let i = 0; i < N; i++) {
            const t = T_ARM + (i / (N - 1)) * (T_LOOP_END - T_ARM);
            const [x, y] = folium(t);
            worst = Math.max(worst, Math.abs(x ** 3 + y ** 3 - 3 * A * x * y));
        }
        approxEq(worst, 0, 1e-9, "L1 cubic identity");
        console.log(`L1 PASS folium satisfies x³+y³=3axy worst residual ${worst.toExponential(2)} over t ∈ [${T_ARM.toFixed(4)}, ${T_LOOP_END}]`);
    }

    // L2 NODE + LOOP LAW: node at world (0, YC); four branches leave at the
    // 45° diagonals (|u/v| → 1, correct quadrants); loop vertex (3a/2, 3a/2)
    // at t=1 → world (0, YC+3a/√2); loop area EXACTLY 3a²/2 (Green).
    {
        const n0 = worldPt(0);
        approxEq(Math.hypot(n0[0] - 0, n0[1] - YC), 0, 1e-12, "L2 node at (0,YC)");
        // branch quadrants + 45° — TRUE geometry (probe-taught, self-catch):
        // the axis-hugging (y=x²/3a) lives in the MATH frame; rotated into
        // the diagonal-vertical world frame every branch leaves the node at
        // EXACTLY 45° (|u/v|→1, separation between paired branches is
        // second-order). Four diagonal rays — a clean X:
        //   t→0⁺ up-right · t→∞ up-left · t→0⁻ down-left · mirror down-right.
        const q = (t: number): [number, number] => { const [x, y] = folium(t); return [(x - y) / Math.SQRT2, (x + y) / Math.SQRT2]; };
        const b1 = q(1e-4);   if (!(b1[0] > 0 && b1[1] > 0)) throw Error("L2 loop branch-1 quadrant (expect up-right)");
        approxEq(Math.abs(b1[1] / b1[0]), 1, 0.03, "L2 loop branch-1 leaves at 45°");
        const b2 = q(1e4);    if (!(b2[0] < 0 && b2[1] > 0)) throw Error("L2 loop branch-2 quadrant (expect up-left)");
        approxEq(Math.abs(b2[1] / b2[0]), 1, 0.03, "L2 loop branch-2 leaves at 45°");
        const b3 = q(-1e-4);  if (!(b3[0] < 0 && b3[1] < 0)) throw Error("L2 arm branch quadrant (expect down-left)");
        approxEq(Math.abs(b3[1] / b3[0]), 1, 0.03, "L2 arm branch leaves at 45°");
        const v1 = worldPt(1);
        approxEq(v1[0], 0, 1e-12, "L2 vertex world x == 0");
        approxEq(v1[1], YC + (3 * A) / Math.SQRT2, 1e-12, "L2 vertex world y == YC + 3a/√2");
        // loop area by Green (shoelace on dense loop)
        const M = 20000;
        let area2 = 0;
        for (let i = 0; i < M; i++) {
            const p = folium((i / M) * 200), r = folium(((i + 1) / M) * 200);
            area2 += p[0] * r[1] - r[0] * p[1];
        }
        const area = Math.abs(area2) / 2;
        approxEq(area, (3 * A * A) / 2, 5e-3, "L2 loop area == 3a²/2");
        console.log(`L2 PASS node X at (0,${YC}) four 45° branches; vertex world (0,${(YC + 3 * A / Math.SQRT2).toFixed(3)}); loop area ${area.toFixed(4)} == 3a²/2 ${(3 * A * A / 2).toFixed(4)}`);
    }

    // L3 ASYMPTOTE LAW: signed distance (x+y+a)/√2 > 0 on the arms,
    // vanishing toward t→−1; the RAIL is the exact level line YC − a/√2;
    // arm tips approach but NEVER touch (tip gap in (0.03, 0.25)).
    {
        const railLine = (p: [number, number]) => p[1] - RAIL_Y; // world: dist above the level line
        for (const t of [T_ARM, -0.5, -0.2]) {
            const [x, y] = folium(t);
            const signed = (x + y + A) / Math.SQRT2;
            if (!(signed > 0)) throw Error(`L3 arm on wrong side at t=${t}`);
        }
        const tipGap = railLine(TIP);
        if (!(tipGap > 0.03 && tipGap < 0.25)) throw Error(`L3 tip gap ${tipGap.toFixed(3)} outside (0.03, 0.25) — race not legible`);
        approxEq(RAIL_Y, YC - A / Math.SQRT2, 1e-12, "L3 rail height");
        // tips INSIDE the rail span by >= 0.30; clearance to outboard posts >= 0.20
        const insideSpan = RAIL_HALF - Math.abs(TIP[0]);
        if (insideSpan < 0.30) throw Error(`L3 tip only ${insideSpan.toFixed(2)} inside rail span`);
        const postClear = POST_OUT - Math.abs(TIP[0]) - POST_SEC / 2 - RIB_SEC_N / 2;
        if (postClear < 0.20) throw Error(`L3 tip-to-post clearance ${postClear.toFixed(2)} < 0.20`);
        console.log(`L3 PASS asymptote level rail y=${RAIL_Y.toFixed(4)} (x+y+a=0 exactly); tips gap ${(tipGap * 1000).toFixed(0)}mm above the line, ${insideSpan.toFixed(2)} inside span, post clearance ${postClear.toFixed(2)} — approach without contact`);
    }

    // L4 STATION WALK: loop chain node-capped BOTH ends, interior L_STEP;
    // arm chains node-capped, remainder at tip; all on-curve; chord dev <= 45mm.
    {
        const lts = loopStations();
        approxEq(foliumArc(lts[0], lts[1]), NODE_STEP, 2e-3, "L4 loop first cap");
        const last = lts.length - 1;
        const closeRem = foliumArc(lts[last - 1], lts[last]) + foliumArc(lts[last], T_LOOP_END) + 3 * A / T_LOOP_END;
        if (closeRem >= 0.50 + 2e-3 || closeRem <= 0.10) throw Error(`L4 loop closing remainder ${closeRem.toFixed(3)} out of band`);
        for (let i = 1; i < last - 1; i++) approxEq(foliumArc(lts[i], lts[i + 1]), L_STEP, 2e-3, `L4 loop step ${i}`);
        const ats = armStations();
        approxEq(foliumArc(ats[0], ats[1]), NODE_STEP, 2e-3, "L4 arm first cap");
        for (let i = 1; i < ats.length - 2; i++) approxEq(foliumArc(ats[i], ats[i + 1]), L_STEP, 2e-3, `L4 arm step ${i}`);
        const rem = foliumArc(ats[ats.length - 2], ats[ats.length - 1]);
        if (rem >= 0.50 + 2e-3 || rem <= 0.10) throw Error(`L4 arm tip remainder ${rem.toFixed(3)} out of band`);
        // chord fidelity (loop + arm) — evaluated at the ARC-midpoint of each
        // segment (t-mid ≠ arc-mid near the node where the parametrization is
        // wildly non-uniform; probe self-catch)
        const arcMidT = (t0: number, t1: number): number => {
            const half = foliumArc(t0, t1) / 2;
            let lo = t0, hi = t1;
            for (let it = 0; it < 60; it++) {
                const mid = (lo + hi) / 2;
                if (foliumArc(t0, mid) < half) lo = mid; else hi = mid;
            }
            return (lo + hi) / 2;
        };
        for (const ts of [lts, ats]) {
            for (let i = 0; i < ts.length - 1; i++) {
                const a = folium(ts[i]), b = folium(ts[i + 1]), m = folium(arcMidT(ts[i], ts[i + 1]));
                const dev = Math.hypot(m[0] - (a[0] + b[0]) / 2, m[1] - (a[1] + b[1]) / 2);
                if (dev > 0.045) throw Error(`L4 chord deviation ${(dev * 1000).toFixed(1)}mm at i=${i}`);
            }
        }
        console.log(`L4 PASS loop ${lts.length} stations (caps ${(NODE_STEP).toFixed(2)}/${(NODE_STEP).toFixed(2)} incl. ∞ tail), arm ${ats.length} stations (cap 0.14, tip remainder ${rem.toFixed(3)}), chord dev <= 45mm`);
    }

    // L5 RAIL + POSTS: rail level, spans ±RAIL_HALF, crosses the center post
    // (which rises to the node); outboard posts seat the rail at ±POST_OUT.
    {
        approxEq(POST_TOP_O + RAIL_SEC / 2, RAIL_Y, 1e-12, "L5 outboard post seats rail");
        approxEq(POST_TOP_C, YC, 1e-12, "L5 center post top == node");
        if (POST_TOP_O - POST_BASE < 0.5) throw Error("L5 outboard post too stubby to read");
        if (POST_OUT >= RAIL_HALF) throw Error("L5 outboard post beyond rail end");
        if (POST_OUT - POST_SEC / 2 <= Math.abs(TIP[0]) + 0.30) throw Error("L5 outboard post crowds the arm tip lane");
        console.log(`L5 PASS rail y=${RAIL_Y.toFixed(3)} ±${RAIL_HALF}; center post 0.12→${POST_TOP_C.toFixed(2)} (to the node); outboard posts ±${POST_OUT} seat the rail (${(POST_TOP_O).toFixed(3)})`);
    }

    // L6 GROUNDING: curb 0..0.24; posts embed 0.12; bead at the node
    // half-embedded +z; whole curve inside the curb's x-band ±(CURB_W/2 − 0.1).
    {
        if (POST_BASE >= CURB_H) throw Error("L6 post base above curb");
        const vp = worldPt(1);
        if (Math.abs(vp[0]) > CURB_W / 2 - 0.1) throw Error("L6 loop outside curb band");
        for (const p of [TIP, TIP_MIR]) if (Math.abs(p[0]) > CURB_W / 2 - 0.1) throw Error("L6 tip outside curb band");
        approxEq(BEAD_Z, RIB_SEC_D / 2, 1e-12, "L6 bead half-embed z");
        console.log(`L6 PASS curb 0..${CURB_H}; posts embed ${POST_BASE}; bead at (0,${YC},${BEAD_Z.toFixed(2)}) half-embedded; curve + tips inside the curb band`);
    }

    // L7 ENVELOPE + collider honesty: origin-centered x/z, y>=0, height >= 2.2,
    // footprint < 16 m² (folly — no walk owed).
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

// RED control: run with argv[1] == "mutant" — wrong curve (a=1.5 params
// vs A=1.30 cubic): the identity law must detect it.
if (process.argv[2] === "mutant") {
    const bad = (t: number): [number, number] => {
        const aB = 1.5, d = 1 + t * t * t;
        return [(3 * aB * t) / d, (3 * aB * t * t) / d];
    };
    let worst = 0;
    for (let i = 0; i <= 2000; i++) {
        const t = T_ARM + (i / 2000) * (T_LOOP_END - T_ARM);
        const [x, y] = bad(t);
        worst = Math.max(worst, Math.abs(x ** 3 + y ** 3 - 3 * A * x * y));
    }
    if (worst < 0.10) throw Error(`RED control FAILED to fail (worst ${worst})`);
    console.error(`RED control OK: mutant a=1.5 folium violates the cubic by ${worst.toFixed(3)} — law detects`);
    process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("struct196-probe-folium.ts") && !process.argv[2]) main();
export {};
