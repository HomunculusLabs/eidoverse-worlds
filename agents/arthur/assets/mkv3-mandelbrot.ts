// mkv3-mandelbrot.ts — STRUCTURES LANE struct-204, Round 11 commission R11-26
// THE MANDELBROT SET — the heart, the wheel, and the real line.
//
// One idea: the boundary between convergence and divergence, carved as its
// own coarse skeleton. STONE carries THE HEART — the main cardioid boundary
// c(θ) = e^{iθ}/2 − e^{2iθ}/4 as one closed arc-uniform voussoir ribbon (28
// chords, joints at cusp/shoulders/top/tangency/bottom), its bottom arc
// seated 8cm into the plinth top (cradle socket, post-embed class). IRON
// carries THE WHEEL — the period-2 bulb's rim, the exact circle |c+1| = 1/4
// (torus), tangent to the heart at c = −3/4 — and THE REAL LINE — the axle
// rod on y = 0 spanning M ∩ ℝ = [−2, 1/4] exactly: butt-welded into the
// cusp stone (collinear + 6cm socketed), threaded through the wheel's rim
// at −3/4 (the tangency — a quadruple point) and −5/4, then flying free
// through the invisible antenna region to c = −2, the set's leftmost point,
// where the sole night bead terminates the rod. Folly class — no walk owed.
//
// Laws honored: texMat lanes (struct-38) — ps_stone/ps_iron; bead emissive
// 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1 KEEP
// (glow_ps_1); ROOT STAYS IDENTITY (struct-188 decode law) — all positions
// authored in FINAL world-local coords (the probe's worldPt); station walk
// owned by the probe contract; NaN 0; envelope vs probe.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    PLINTH_W, PLINTH_H, PLINTH_D,
    RIB_N, RIB_D, JOINT,
    ROD_R, RIM_TUBE, BEAD_R, CUSP_POKE,
    RIM_C, RIM_R, ROD_XL_M, ROD_XR_M, AXIS_Y, S,
    ARCS, arcWorldPts, worldPt, worldX, ENVELOPE,
} from "../struct204-probe-mandelbrot.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("ps_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 204 });
const ironTex = texMat("ps_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 66 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's worldPt already applies the datum lift.

// world-frame voussoir helper: chord box in the world XY plane, thickness
// local-y, depth local-z (the versiera/elliptic chassis helper)
function voussoir(
    a: [number, number], b: [number, number],
    secN: number, secD: number, mat: THREE.Material,
): THREE.Mesh {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len + JOINT, secN, secD), mat);
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0);
    m.rotation.z = Math.atan2(dy, dx);
    return m;
}

// ---- stone plinth (the cradle lives in its top) -------------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PLINTH_W, PLINTH_H, PLINTH_D), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${PLINTH_W}x${PLINTH_H}x${PLINTH_D} — the datum mass; the heart's bottom arc seats ${0.08 * 100}cm into its top`);
}

// ---- the heart in stone: the cardioid boundary as one closed ribbon -----------------------------------
{
    let ribs = 0;
    for (const a of ARCS) {
        const pts = arcWorldPts(a);
        for (let i = 0; i < pts.length - 1; i++) {
            g.add(voussoir(pts[i], pts[i + 1], RIB_N, RIB_D, stoneTex));
            ribs++;
        }
    }
    console.log(`heart: ${ribs} tangent voussoirs ${RIB_N}x${RIB_D} — the main cardioid λ(θ)=e^{iθ} (two-angle theorem), closed loop, joints at cusp/shoulders/top/tangency/bottom`);
}

// ---- iron: the wheel (period-2 rim torus, tangent at −3/4) -------------------------------------------
{
    const rim = new THREE.Mesh(new THREE.TorusGeometry(S * RIM_R, RIM_TUBE, 12, 48), ironTex);
    rim.position.set(worldX(RIM_C[0]), AXIS_Y, 0);
    g.add(rim);
    console.log(`wheel: rim torus R=${(S * RIM_R).toFixed(3)} tube=${RIM_TUBE} at (${worldX(RIM_C[0]).toFixed(3)}, ${AXIS_Y.toFixed(3)}) — the exact circle |c+1| = 1/4 (μ = 4(1+c) closed form), tangent to the heart at c = −3/4`);
}

// ---- iron: the real line (the axle rod spanning M ∩ ℝ = [−2, 1/4]) -----------------------------------
{
    const xl = worldX(ROD_XL_M);
    const xr = worldX(ROD_XR_M) + CUSP_POKE;   // cusp butt socketed (probe L5: covered)
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(ROD_R, ROD_R, xr - xl, 16), ironTex);
    rod.rotation.z = Math.PI / 2;
    rod.position.set((xl + xr) / 2, AXIS_Y, 0);
    g.add(rod);
    console.log(`axle: rod r=${ROD_R} from x=${xl.toFixed(3)} (c=−2, the set's leftmost point) to x=${xr.toFixed(3)} (cusp butt +${CUSP_POKE * 100}cm socket) at y=${AXIS_Y.toFixed(4)} — M ∩ ℝ made steel; rim pierces at −3/4 (the tangency weld) and −5/4`);
}

// ---- glow bead at c = −2 (KEEP) — the set's leftmost point, the rod's terminus ------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(worldX(ROD_XL_M), AXIS_Y, 0);
    glowGroup.add(bead);
    glowGroup.name = "glow_ps_1";
    g.add(glowGroup);
    console.log(`bead: glow_ps_1 r ${BEAD_R} at (${worldX(ROD_XL_M).toFixed(3)}, ${AXIS_Y.toFixed(3)}, 0) — c = −2, where the orbit lands on the repelling fixed point; sole night element`);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------------------
g.updateMatrixWorld(true);
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
const merged = mergeByMaterial(g, "mandelbrot");
writeFileSync("agents/arthur/assets/village_mandelbrot3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_mandelbrot3.glb`);
