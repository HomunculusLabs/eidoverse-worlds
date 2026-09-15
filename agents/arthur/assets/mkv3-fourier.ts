// mkv3-fourier.ts — STRUCTURES LANE struct-186, Round 11 commission R11-15
// THE FOURIER LADDER: the wave that learns to be square.
//
// ONE IDEA: Fourier 1822 — the square wave as an infinite sum of sines.
// Four stone ribbons stack as the partial sums S1/S3/S7/S15 of
// S(x) = (4A/π)·Σ sin((2k−1)ωx)/(2k−1); each rung is closer to the square
// than the one below (RMS 0.1130 > 0.0818 > 0.0581 > 0.0410, probe P2); the
// S15 rung's crests carry the honest Gibbs overshoot (A·1.180, probe P3).
// A thin brass rail above the stack carries the LIMIT — the square wave
// itself. Two stone piers frame the stack: a ladder whose rungs are waves.
// One brass bead floats on the centerline above the central jump: the
// midpoint value the series converges to exactly at the discontinuity —
// Fourier's own answer, the honest average.
//
// KIN CHECK: fourier/square-wave/partial-sum grep 0/0/0 across all ledgers
// and plans; harmonickiss owns orbitals, nothing shows converging curves.
// Elevates the lane's oldest motif ("harmonic rhythms") into the whole form.
//
// WORLD MAP (probe contract — ONE contract, imported): span 6.4 (2.5 λ),
// ribbons at y 1.02/2.32/3.62/4.92 (pitch 1.30), band 0.38, A 0.26, depth
// 0.36; brass square rail y 6.05 (band 0.26); piers |x| 3.35 (0.50×6.53×
// 0.60), ends embed 0.10; bead glow_fl_1 r 0.075 at (0, 5.40, 0). Envelope
// 7.20×6.53×0.60 y[0,6.53] origin-centered. Folly class — no walk owed.
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) — four_
// stone cell 32; brass rail in the melencolia brass lane (0xbd985c); bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1
// KEEP (glow_fl_1); NaN 0; nodes 3 (stone bucket + brass bucket + glow).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    LAM, SPAN, X0, A_AMP, BAND_H, RAIL_BAND, RAIL_A, DEPTH, HARMONICS,
    PITCH, Y_BASE, RAIL_Y, PIER_HW, PIER_HD, PIER_X, PIER_TOP, N_SAMP,
    BEAD_R, BEAD_C, ENVELOPE, sN, ribbonY,
} from "../struct186-probe-fourier.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("four_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 1822 });
const brassTex = texMat("four_brass", [0xbd985c, 0xb0874a, 0xc9a76b], { rough: 0.55, metal: 0.65, scale: 1.2, weights: [3, 1, 1], cell: 24, seed: 71 });
const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();

// ---- ribbons: S_N extruded as bands between upper/lower sampled edges ---------------------------------
// Curve plane = world (x, y); extrude along +z centered (z ∈ [−d/2, +d/2]).
// Band height measured VERTICALLY (y-extent 0.38 everywhere — the honest
// "cut from a slab" ribbon); the wave reads in the top/bottom silhouette.
let ribbonMeshes = 0;
for (let i = 0; i < HARMONICS.length; i++) {
    const n = HARMONICS[i];
    const yc = ribbonY(i);
    const shape = new THREE.Shape();
    const top: THREE.Vector2[] = [], bot: THREE.Vector2[] = [];
    for (let s = 0; s <= N_SAMP; s++) {
        const x = X0 + (s / N_SAMP) * SPAN;
        const y = yc + sN(n, x);
        top.push(new THREE.Vector2(x, y + BAND_H / 2));
        bot.push(new THREE.Vector2(x, y - BAND_H / 2));
    }
    shape.moveTo(top[0].x, top[0].y);
    for (let s = 1; s <= N_SAMP; s++) shape.lineTo(top[s].x, top[s].y);
    for (let s = N_SAMP; s >= 0; s--) shape.lineTo(bot[s].x, bot[s].y);
    shape.closePath();
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {
        depth: DEPTH, bevelEnabled: false, steps: 1,
    }), stoneTex);
    mesh.geometry.translate(0, 0, -DEPTH / 2);
    g.add(mesh); ribbonMeshes++;
}
if (ribbonMeshes !== 4) throw Error(`ribbon census ${ribbonMeshes} != 4`);
console.log(`ribbons: 4 (S${HARMONICS.join("/S")}), ${N_SAMP} segments each, band ${BAND_H}, A ${A_AMP}, λ ${LAM}`);

// ---- the limit rail: the square wave itself, in brass -----------------------------------------------
{
    // Build-law self-catch: square-wave jumps sit at ABSOLUTE multiples of
    // λ/2 (x = 1.28·k → −2.56/−1.28/0/1.28/2.56), NOT at X0+kλ/2 — the first
    // draft offset them and would have drawn the jumps 0.64 m off the
    // ribbons' crests. Runs alternate −A/+A (sign(sin)), endplates land at
    // +A (x=3.2 = 1.25λ, sin(2.5π)=+1).
    const jumps: number[] = [];
    for (let k = -3; k <= 3; k++) {
        const j = k * (LAM / 2);
        if (j > X0 + 1e-9 && j < SPAN / 2 - 1e-9) jumps.push(j);
    }
    const pts = [X0, ...jumps, SPAN / 2];
    const sq = (x: number) => RAIL_A * Math.sign(Math.sin((2 * Math.PI * x) / LAM));
    const TOP: THREE.Vector2[] = [], BOT: THREE.Vector2[] = [];
    for (let s = 0; s < pts.length - 1; s++) {
        const a = pts[s], b = pts[s + 1];
        const v = sq((a + b) / 2 + 1e-6 * (a + b === 0 ? 1 : Math.sign(a + b) || 1));
        TOP.push(new THREE.Vector2(a, RAIL_Y + v + RAIL_BAND / 2));
        TOP.push(new THREE.Vector2(b, RAIL_Y + v + RAIL_BAND / 2));
        BOT.push(new THREE.Vector2(a, RAIL_Y + v - RAIL_BAND / 2));
        BOT.push(new THREE.Vector2(b, RAIL_Y + v - RAIL_BAND / 2));
    }
    const shape = new THREE.Shape();
    shape.moveTo(TOP[0].x, TOP[0].y);
    for (const p of TOP.slice(1)) shape.lineTo(p.x, p.y);      // vertical jump edges appear at shared x
    for (let s = BOT.length - 1; s >= 0; s--) shape.lineTo(BOT[s].x, BOT[s].y);
    shape.closePath();                                          // end faces at x = ±3.2
    const rail = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {
        depth: 0.14, bevelEnabled: false, steps: 1,
    }), brassTex);
    rail.geometry.translate(0, 0, -0.07);
    g.add(rail);
    console.log(`limit rail: square wave λ ${LAM}, ${jumps.length} jumps, band ${RAIL_BAND}, y ${RAIL_Y} — the sum's target`);
}

// ---- piers --------------------------------------------------------------------------------------------
{
    let pierMeshes = 0;
    for (const s of [-1, 1]) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(PIER_HW * 2, PIER_TOP, PIER_HD * 2), stoneTex);
        pier.position.set(s * PIER_X, PIER_TOP / 2, 0);
        g.add(pier); pierMeshes++;
    }
    if (pierMeshes !== 2) throw Error(`pier census ${pierMeshes} != 2`);
    console.log(`piers: 2 at |x| ${PIER_X} (${PIER_HW * 2}×${PIER_TOP}×${PIER_HD * 2}), ends embed 0.10`);
}

// ---- the midpoint bead (glow KEEP) ---------------------------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.copy(BEAD_C);
    glowGroup.add(bead);
    glowGroup.name = "glow_fl_1";
    g.add(glowGroup);
    console.log(`bead: glow_fl_1 at (${BEAD_C.x}, ${BEAD_C.y}, ${BEAD_C.z}) — the midpoint value at the jump`);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const want = new THREE.Box3(
        new THREE.Vector3().fromArray(ENVELOPE.min),
        new THREE.Vector3().fromArray(ENVELOPE.max));
    const wsz = want.getSize(new THREE.Vector3());
    const dErr = Math.max(
        Math.abs(env.min.x - want.min.x), Math.abs(env.max.x - want.max.x),
        Math.abs(env.min.y - want.min.y), Math.abs(env.max.y - want.max.y),
        Math.abs(env.min.z - want.min.z), Math.abs(env.max.z - want.max.z));
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (dErr > 0.001) throw Error(`envelope drift ${dErr.toFixed(4)} vs probe contract (mk ${sz.x.toFixed(3)}x${sz.y.toFixed(3)}x${sz.z.toFixed(3)} vs probe ${wsz.x.toFixed(3)}x${wsz.y.toFixed(3)}x${wsz.z.toFixed(3)})`);
    if (Math.abs(env.min.x + env.max.x) > 0.01 || Math.abs(env.min.z + env.max.z) > 0.01)
        throw Error(`envelope not origin-centered: x[${env.min.x.toFixed(3)},${env.max.x.toFixed(3)}] z[${env.min.z.toFixed(3)},${env.max.z.toFixed(3)}]`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o) => (o as THREE.Mesh).isMesh).length;
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] == probe contract, pre-merge meshes ${meshes} + 1 glow KEEP group`);
}

const merged = mergeByMaterial(g, "fourier");
writeFileSync("agents/arthur/assets/village_fourier3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_fourier3.glb`);
