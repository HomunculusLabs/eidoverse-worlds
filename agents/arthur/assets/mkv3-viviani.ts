// mkv3-viviani.ts — STRUCTURES LANE struct-206, Round 11 commission R11-27
// VIVIANI'S CURVE — the globe, the windows, and the square.
//
// One idea: the window problem closed into a globe. STONE carries the plinth
// (a square, echoing the theorem). IRON carries THE EIGHT — the strap, a tube
// running exactly on the sphere along Viviani's curve (sphere ∩ tangent
// cylinder), a figure-eight through both poles crossing itself at the node —
// and THE SQUARE — the circumscribed frame, side = the diameter, whose area
// is exactly the quadrable remainder 4R² of Viviani 1692 (hemisphere minus
// four windows). The strap welds through the top rod at the N pole; the S
// pole welds onto the proud inlaid bottom channel. Sole night element: one
// warm bead at the node (s363 sole-bead law).
//
// Laws honored: texMat lanes (struct-38) — ps_stone/ps_iron; bead emissive
// 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1 KEEP
// (glow_vv_1); ROOT STAYS IDENTITY (struct-188) — positions are FINAL
// world-local (the probe's worldPt); envelope vs probe; NaN 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    PLINTH_W, PLINTH_H, PLINTH_D, PROUD, Y_C, TUBE, ROD_T, BEAD_R,
    N_STRAP, curveWorld, NODE_W, RODS, ENVELOPE,
} from "../struct206-probe-viviani.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("ps_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 206 });
const ironTex = texMat("ps_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 67 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's worldPt already applies the lift+rot.

// ---- stone plinth (the square, at the seat datum) -----------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PLINTH_W, PLINTH_H, PLINTH_D), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${PLINTH_W}x${PLINTH_H}x${PLINTH_D} — the square, ${PLINTH_W * PLINTH_D} m²; the bottom channel rides ${PROUD * 100}cm proud in its top`);
}

// ---- the eight: the strap tube exactly on the sphere (Viviani's curve) --------------------------------
{
    class Viviani extends THREE.Curve<THREE.Vector3> {
        getPoint(t: number, target = new THREE.Vector3()) {
            const p = curveWorld(-2 * Math.PI + 4 * Math.PI * t);
            return target.set(p[0], p[1], p[2]);
        }
    }
    const strap = new THREE.Mesh(
        new THREE.TubeGeometry(new Viviani(), N_STRAP, TUBE, 10, true),
        ironTex);
    g.add(strap);
    console.log(`strap: tube r=${TUBE} ${N_STRAP} segments CLOSED on Viviani's curve — sphere ∩ tangent cylinder, the figure-eight through both poles, self-crossed at the node`);
}

// ---- the square: circumscribed iron frame (side = the diameter) ---------------------------------------
for (const r of RODS) {
    const w = r.max[0] - r.min[0], h = r.max[1] - r.min[1], d = r.max[2] - r.min[2];
    const rod = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ironTex);
    rod.position.set((r.min[0] + r.max[0]) / 2, (r.min[1] + r.max[1]) / 2, (r.min[2] + r.max[2]) / 2);
    g.add(rod);
}
console.log(`square: 4 rods ${ROD_T}x${ROD_T}, side ${(2 * 1.5).toFixed(2)} m == the diameter; area ${(2 * 1.5) ** 2} m² == the quadrable remainder 4R²; kisses the sphere at the poles (welds) and both equator sides`);

// ---- glow bead at the node (KEEP) — the eight's crossing, the sole night element -----------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(NODE_W[0], NODE_W[1], NODE_W[2]);
    glowGroup.add(bead);
    glowGroup.name = "glow_vv_1";
    g.add(glowGroup);
    console.log(`bead: glow_vv_1 r ${BEAD_R} at (${NODE_W[0].toFixed(3)}, ${NODE_W[1].toFixed(3)}, ${NODE_W[2].toFixed(3)}) — the node, where the eight crosses itself; sole night element`);
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
const merged = mergeByMaterial(g, "viviani");
writeFileSync("agents/arthur/assets/village_viviani3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_viviani3.glb`);
