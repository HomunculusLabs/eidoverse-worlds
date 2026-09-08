// mkv3-fifthbench.ts — STRUCTURES LANE struct-92, Round 9 commission R9-3.
// THE FIFTH BENCH: the form ledger holds every curve and one intersection
// composition (vesica); no work composes two frequencies in one silhouette.
// ONE IDEA: THE 3:2 SUPERPOSITION. One stone ribbon 12m long whose ELEVATION
// profile is the sum of two sine waves in the ratio 3:2 — the perfect fifth,
// Bill's approved Interference class. crest(x) = 0.42 + 0.28·(sin πx/3 +
// sin πx/2)/2: slow wave 6m period, fast wave 4m, common period 12m. The two
// waves cancel EXACTLY at x = 0, ±6 — crest = 0.42 sitting height there:
// the TRUE NULLS ARE THE SEATS (center + both ends). The sum is ODD, so the
// halves are complementary: crest(x) + crest(−x) = 0.84 exact — every crest
// on one side mirrors a trough on the other (v1 assertions caught my
// symmetric-half error; the honest odd profile is KEPT: it is the stronger
// fifth read). True envelope: peak 0.688 at x≈+1.15 (waves in phase), deep
// trough 0.152 at x≈−1.15 (antiphase), secondary trough 0.25 at +3.4 and
// crest 0.59 at −3.4. ONE brass bead at the central null marks the point of
// agreement (glow_fb KEEP, dusk lineage). Pairs with the lemniscate seat
// as the orthogonal composition: ∞ in plan, 3:2 in elevation.
//
// GEOMETRY (entity local; profile along x, ribbon on grade):
//   crest(x) = SIT + AMP·0.5·(sin(2πx/6) + sin(2πx/4)); SIT 0.42, AMP 0.28.
//     Nulls: crest = SIT exactly at x = 0, ±6 (asserted).
// Max ≈ 0.688 at x ≈ +1.15; min ≈ 0.152 at x ≈ −1.15; odd-symmetric
// complementary halves: crest(x)+crest(−x) = 2·SIT = 0.84 (asserted).
//   Sweep: 64 column segments, each BoxGeometry(len+0.02, crest_i, 0.5)
//     seated on grade — axis-aligned (no plan curvature), 2cm joint overlap.
//   Bead: brass r 0.09 at (0, SIT+0.07, 0) — seated ON the null surface,
//     top 0.58 proud of every local stone by construction (local crest 0.42).
//   Ends: vertical cuts at x = ±6.05 (nulls at ±6 + 5cm flat) — clean faces.
//   Materials: standing stone texMat (lemniscate dialect) + brass glow.
//   Nodes after merge: 2 (stone bucket + glow_fb).
//
// Classification (supportclass.js read live this tick): footprint
// 12.1 × 0.5 = 6.05m² ≥ FLOOR_MIN_AREA 2, height ≤ 2.2 → floorShaped;
// lie = bbox-top − median crest ≈ 0.68 − 0.4 ≈ 0.27 > UNEVEN_MIN_LIE 0.10
// → UNEVEN class → exact trimesh, truthful per-cell tops: steppable and
// sittable anywhere on the real surface (asserted numerically below).
//
// Determinism: fixed 64 segments, fixed trig, assertions below.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — standing families (lemniscate dialect)
const stoneTex = texMat("fb_stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const brassGlow = mat(0x9a6a28, 0.4, 0.8);
(brassGlow as any).emissive = new THREE.Color(0x9a6a28);
(brassGlow as any).emissiveIntensity = 0.75;

// ---- constants ----------------------------------------------------------------
const SIT = 0.42;               // sitting height = the null crest
const AMP = 0.28;               // superposition swing (SUM ∈ [−1, 1])
const P1 = 6, P2 = 4;           // slow wave 6m, fast wave 4m — ratio 3:2
const L = 12.1;                 // ribbon length (±6.05; common period 12 + 5cm flat ends)
const W = 0.5;                  // bench width
const SEG = 128;                // column segments — v2: ZAI judged the 4m ripple
// illegible at 18m as staircase noise (64 cols = 0.189m ≈ 7px steps, same
// spatial scale as the ripple); 128 cols ≈ 3.4px steps, below legibility.
// Profile math, nulls, odd law unchanged — quantization fix only.
const HALF = L / 2;

const SUM = (x: number) => 0.5 * (Math.sin((2 * Math.PI * x) / P1) + Math.sin((2 * Math.PI * x) / P2));
const crest = (x: number) => SIT + AMP * SUM(x);

// ---- assertions on the profile (before building) --------------------------------
{
    // null law: both waves vanish at x = 0, ±6 → crest = sitting height EXACTLY
    for (const x of [0, 6, -6]) {
        if (Math.abs(SUM(x)) > 1e-12) throw Error(`null law broken at x=${x}: SUM=${SUM(x)}`);
        if (Math.abs(crest(x) - SIT) > 1e-12) throw Error(`crest at x=${x} != SIT`);
    }
    // ratio law: P1/P2 = 3/2 exact
    if (P1 / P2 !== 1.5) throw Error("not the fifth");
    // common period 12: crest(x+12) = crest(x)
    for (const x of [0.3, 2.7, 5.9]) {
        if (Math.abs(crest(x) - crest(x + 12)) > 1e-12) throw Error(`period law broken at ${x}`);
    }
    // envelope scan: max in [0.66, 0.72], min in [0.13, 0.18] (odd profile)
    let mx = 0, mn = 1e9;
    for (let i = 0; i <= 2400; i++) { const c = crest(-6 + (i / 2400) * 12); mx = Math.max(mx, c); mn = Math.min(mn, c); }
    if (mx < 0.66 || mx > 0.72) throw Error(`max crest ${mx.toFixed(3)} outside band`);
    if (mn < 0.13 || mn > 0.18) throw Error(`min crest ${mn.toFixed(3)} outside band`);
    // odd-symmetry law: crest(x) + crest(−x) = 2·SIT exact — complementary halves
    for (const x of [0.7, 1.15, 2.9, 3.4, 5.2]) {
        if (Math.abs(crest(x) + crest(-x) - 2 * SIT) > 1e-12) throw Error(`odd law broken at ${x}`);
    }
    // lie law: bbox top − median crest > 0.15 (comfortably into the uneven band)
    const cs: number[] = [];
    for (let i = 0; i <= 512; i++) cs.push(crest(-HALF + (i / 512) * L));
    cs.sort((a, b) => a - b);
    const median = cs[cs.length >> 1];
    if (mx - median < 0.15) throw Error(`lie ${ (mx - median).toFixed(3) } not comfortably uneven`);
    // seating law
    if (SIT < 0.42 || SIT > 0.5) throw Error("not a sitting height");
    console.log(`profile OK: nulls at 0,±6 crest ${SIT} | max ${mx.toFixed(3)} | min ${mn.toFixed(3)} | median ${median.toFixed(3)} | lie ${(mx - median).toFixed(3)}`);
}

// ---- sweep: 64 seated column segments -------------------------------------------
{
    let maxStep = 0;
    for (let i = 0; i < SEG; i++) {
        const x0 = -HALF + (i / SEG) * L, x1 = -HALF + ((i + 1) / SEG) * L;
        const cm = crest((x0 + x1) / 2);
        maxStep = Math.max(maxStep, Math.abs(crest(x1) - crest(x0)));
        const len = (x1 - x0) + 0.02;                  // 2cm joint overlap closes facets
        const seg = new THREE.Mesh(new THREE.BoxGeometry(len, cm, W), stoneTex);
        seg.position.set((x0 + x1) / 2, cm / 2, 0);    // seated on grade: y 0..crest
        seg.name = `fb_col${i}`;
        g.add(seg);
    }
    if (maxStep > 0.09) throw Error(`stepping ${maxStep.toFixed(3)} too coarse`);
    console.log(`sweep OK: ${SEG} columns, worst adjacent step ${maxStep.toFixed(3)}m`);
}

// ---- brass bead at the central null (glow_fb KEEP) -------------------------------
{
    // struct-52 law: seated ON the null surface — center SIT + r − 0.02,
    // top SIT + 0.16 proud of every local stone (null crest is SIT exact).
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), brassGlow);
    bead.name = "glow_fb";
    bead.position.set(0, SIT + 0.07, 0);
    g.add(bead);
}

// ---- assertions on the build --------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    if (Math.abs(sz.x - L - 0.02) > 0.02) throw Error(`x envelope ${sz.x.toFixed(3)} vs ${L + 0.02}`);
    if (Math.abs(sz.z - W) > 1e-6) throw Error(`width ${sz.z.toFixed(3)} != ${W}`);
    if (env.max.y > 0.72 || env.max.y < 0.65) throw Error(`top ${env.max.y.toFixed(3)} outside crest band`);
    if (sz.x * sz.z < 2) throw Error(`footprint ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} below floor gate`);
    if (env.max.y > 2.2) throw Error("left the floorShaped band");
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | uneven floorShaped | top ${env.max.y.toFixed(3)}`);
}
const merged = mergeByMaterial(g, "fifthbench");
writeFileSync("agents/arthur/assets/village_fifthbench3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_fifthbench3.glb");
