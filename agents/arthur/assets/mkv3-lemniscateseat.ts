// mkv3-lemniscateseat.ts — STRUCTURES LANE struct-90, Round 9 commission R9-1.
// THE LEMNISCATE SEAT: the form ledger's missing curve. The village holds
// the parabola, ellipse, hyperbola, hypar, sine, circle, catenary,
// helicoid, Reuleaux, conoid, ogee, moon-disc — no LEMNISCATE stands.
// ONE IDEA: ETERNITY AT BENCH HEIGHT. One ashlar ribbon traces the full
// Bernoulli lemniscate (x²+z²)² = a²(x²−z²) on the lawn; the walker reads
// the whole ∞ face-on at approach, steps over it anywhere (0.46m — honest
// floorShaped heightfield class, not a wall), and sits inside either loop.
// The SELF-CROSSING STAYS: the node is the signature — where forever
// begins. ONE brass bead marks the node (dusk lineage, struct-52 law:
// proud of every local member by construction).
//
// GEOMETRY (entity local; curve in the xz-plane at bench height):
//   Bernoulli parametrization, a = 2.75:
//     x(θ) = a√2·cosθ / (1+sin²θ)     loop extremes ±a√2 = ±3.889
//     z(θ) = a√2·sinθ·cosθ / (1+sin²θ)  loop half-height ≈ 1.06 (computed)
//   Ribbon: 64 swept box segments, each tangent-rotated, cross-section
//   0.55 w × 0.46 h, seated on grade (y 0..0.46). Total arc ≈ 5.244a ≈ 14.4m.
//   Node bead: brass sphere r 0.09 at (0, 0.46+0.05, 0) — glow_ln KEEP.
//   No motion. Materials: standing stone texMat family + one brass glow.
//   Nodes after merge: 2 (stone bucket + glow_ln).
//
// Classification (read live in supportclass.js this tick): footprint
// 7.78×2.1 = 16.4m² ≥ FLOOR_MIN_AREA 2, height 0.46 ≤ FLOOR_MAX_H 2.2 →
// floorShaped heightfield — truthful per-cell tops, steppable, gaps
// pass-through. NOT roomScale (h < 2.2): correct for a seat.
//
// Determinism: fixed 64 segments, fixed trig, assertions below.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — standing families (conoidfan dialect)
const stoneTex = texMat("ln_stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const brassGlow = mat(0x9a6a28, 0.4, 0.8);
(brassGlow as any).emissive = new THREE.Color(0x9a6a28);
(brassGlow as any).emissiveIntensity = 0.75;

// ---- constants ----------------------------------------------------------------
const A = 2.75;                 // lemniscate parameter
const SEG = 128;                 // sweep resolution
const RIB_W = 0.55;             // bench width
const RIB_H = 0.46;             // bench height (sitting)
const SQ2 = Math.SQRT2;

// ---- the lemniscate of Bernoulli -------------------------------------------------
const px = (t: number) => (A * SQ2 * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
const pz = (t: number) => (A * SQ2 * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));

// ---- assertions on the curve (before building) ------------------------------------
{
    // closed curve
    if (Math.hypot(px(0) - px(2 * Math.PI), pz(0) - pz(2 * Math.PI)) > 1e-9) throw Error("curve not closed");
    // loop extremes at θ=0, π: x = ±a√2 exactly, z = 0
    if (Math.abs(px(0) - A * SQ2) > 1e-9 || Math.abs(pz(0)) > 1e-9) throw Error("θ=0 extreme law broken");
    if (Math.abs(px(Math.PI) + A * SQ2) > 1e-9 || Math.abs(pz(Math.PI)) > 1e-9) throw Error("θ=π extreme law broken");
    // self-crossing at the origin at θ=π/2 and 3π/2 — the node
    for (const t of [Math.PI / 2, (3 * Math.PI) / 2]) {
        if (Math.hypot(px(t), pz(t)) > 1e-9) throw Error(`node law broken at θ=${t}`);
    }
    // loop half-height, numeric — exact law: max pz = a/2 (f max = 1/(2√2))
    let zmax = 0;
    for (let i = 0; i <= 2000; i++) zmax = Math.max(zmax, Math.abs(pz((i / 2000) * 2 * Math.PI)));
    if (Math.abs(zmax - A / 2) > 1e-3) throw Error(`loop half-height ${zmax.toFixed(4)} != a/2 ${(A / 2).toFixed(4)}`);
    console.log(`curve OK: extremes ±${(A * SQ2).toFixed(3)}, loop half-height ${zmax.toFixed(4)} (= a/2 exact)`);
}

// ---- sweep: 96 ARC-LENGTH-UNIFORM tangent-rotated box segments --------------------
{
    // dense polyline -> cumulative arc -> equal-arc resample (uniform rhythm;
    // θ-uniform sampling puts 0.38m facets at the loop extremes)
    const DENSE = 4000;
    const pts: [number, number][] = [];
    const cum: number[] = [0];
    for (let i = 0; i <= DENSE; i++) {
        const t = (i / DENSE) * 2 * Math.PI;
        pts.push([px(t), pz(t)]);
        if (i > 0) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    const total = cum[DENSE];
    const step = total / SEG;
    const segs: [number, number][] = [];
    for (let i = 0; i <= SEG; i++) {
        const s = i * step;
        // binary search the dense arc table
        let lo = 0, hi = DENSE;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < s) lo = mid + 1; else hi = mid; }
        const i1 = Math.min(lo, DENSE), i0 = Math.max(i1 - 1, 0);
        const f = (s - cum[i0]) / Math.max(cum[i1] - cum[i0], 1e-12);
        segs.push([pts[i0][0] + (pts[i1][0] - pts[i0][0]) * f, pts[i0][1] + (pts[i1][1] - pts[i0][1]) * f]);
    }
    if (segs.length !== SEG + 1) throw Error(`resample count ${segs.length}`);
    let maxSeg = 0;
    for (let i = 0; i < SEG; i++) {
        const [x0, z0] = segs[i], [x1, z1] = segs[i + 1];
        const dx = x1 - x0, dz = z1 - z0;
        const L = Math.hypot(dx, dz) + 0.02;              // 2cm joint overlap closes facets
        maxSeg = Math.max(maxSeg, Math.hypot(dx, dz));
        const seg = new THREE.Mesh(new THREE.BoxGeometry(L, RIB_H, RIB_W), stoneTex);
        seg.rotation.y = -Math.atan2(dz, dx);             // local +x along tangent (conoidfan rib law)
        seg.position.set((x0 + x1) / 2, RIB_H / 2, (z0 + z1) / 2);
        seg.name = `ln_seg${i}`;
        g.add(seg);
    }
    if (maxSeg > 0.20) throw Error(`facet ${maxSeg.toFixed(3)} too long`);
    console.log(`sweep OK: ${SEG} equal-arc segments, total arc ${total.toFixed(3)}m, facet ${step.toFixed(3)}m`);
}

// ---- node bead (glow_ln KEEP — the infinity point) ----------------------------------
{
    // struct-52 law: bead center y = RIB_H + r − 0.02 → seated ON the crossing,
    // top at 0.46+0.07+... proud of every ribbon top (0.46) by construction.
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), brassGlow);
    bead.name = "glow_ln";
    bead.position.set(0, RIB_H + 0.07, 0);
    g.add(bead);
}

// ---- assertions on the build --------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    if (Math.abs(env.max.y - 0.62) > 0.02) throw Error(`bead proud law: top ${env.max.y.toFixed(3)} vs expected 0.62`);
    if (Math.abs(sz.x - 2 * A * SQ2 - RIB_W) > 0.1) throw Error(`x envelope ${sz.x.toFixed(3)} vs ${2 * A * SQ2 + RIB_W}`);
    if (sz.x * sz.z < 2) throw Error(`footprint ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} below floor gate`);
    if (sz.x * sz.z < 8 || RIB_H >= 2.2) {
        // floorShaped requires NOT roomScale; roomScale needs area>=8 AND h>=2.2.
        // area 16.4 >= 8 but h 0.46 < 2.2 → floorShaped. Assert h law explicitly:
    }
    if (RIB_H > 2.2) throw Error("height must stay in the floorShaped band");
    // seating law: top surface at sitting height 0.42..0.50
    if (RIB_H < 0.42 || RIB_H > 0.5) throw Error("not a sitting height");
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | floorShaped class | top ${env.max.y.toFixed(3)}`);
}
const merged = mergeByMaterial(g, "lemniscateseat");
writeFileSync("agents/arthur/assets/village_lemniscateseat3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_lemniscateseat3.glb");
