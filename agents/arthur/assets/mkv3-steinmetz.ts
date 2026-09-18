// mkv3-steinmetz.ts — STRUCTURES LANE struct-225, Round 11 commission R11-39
// THE STEINMETZ SOLID (bicylinder) — two cylinders crossing at right angles,
// their shared heart carved in stepped square courses.
//
// One idea: TWO CYLINDERS' SHARED HEART. STONE carries the intersection
// solid — square courses whose sides follow the circle law 2*sqrt(R^2-y^2),
// each a TRUE inscribed box under both cylinders (probe L1/L6). BRASS
// carries the two generator hoops riding the binding-face edge midpoints,
// meeting at the crown (probe L4). Sole night element: one warm bead at the
// crown crossing (s363 law).
//
// Laws honored: texMat lanes (struct-38) — sm_stone/sm_brass; bead emissive
// 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1 KEEP
// (glow_sm_1); ROOT STAYS IDENTITY (struct-188) — positions are FINAL
// world-local (the probe's DATUM is the lift); envelope vs probe; NaN 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, COURSES, HOOP_A, HOOP_B,
    BEAD_W, ENVELOPE, TUBE, BEAD_R,
} from "../struct225-probe-steinmetz.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("sm_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 225 });
const brassTex = texMat("sm_brass", [0x8a6a3a, 0x7a5c30, 0x9a7a46], { rough: 0.55, metal: 0.6, scale: 1.2, weights: [3, 1, 1], cell: 16, seed: 76 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's DATUM already applied the lift.

// tube from P to Q (the lane's tangent-segment register: curve by turning)
function tube(P: [number, number, number], Q: [number, number, number], r: number, mat: THREE.Material): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.sub(A).normalize());
    return m;
}

// ---- stone plinth ---------------------------------------------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PLINTH_L, PLINTH_H, PLINTH_D), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${PLINTH_L}x${PLINTH_H}x${PLINTH_D} — the square curb; the first course seats 7cm into its top`);
}

// ---- stone: the intersection solid in stepped square courses --------------------------------------------
{
    for (const c of COURSES) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(c.x1 - c.x0, c.yTop - c.y, c.z1 - c.z0), stoneTex);
        m.position.set((c.x0 + c.x1) / 2, (c.y + c.yTop) / 2, (c.z0 + c.z1) / 2);
        g.add(m);
    }
    const last = COURSES[COURSES.length - 1];
    const widest = COURSES.reduce((b, c) => (c.x1 - c.x0 > b.x1 - b.x0 ? c : b), COURSES[0]);
    console.log(`solid: ${COURSES.length} square courses — every horizontal slice a perfect square, side by the circle law 2*sqrt(R^2-y^2) (probe L1); widest ${(widest.x1 - widest.x0).toFixed(2)}m, crown course top ${(last.yTop).toFixed(3)}m at half-width ${((last.x1 - last.x0) / 2).toFixed(3)}m`);
}

// ---- brass: the two generator hoops (the crossing pair) ---------------------------------------------------
{
    for (const [name, hoop] of [["A (x^2+y^2=R^2, plane z=0)", HOOP_A], ["B (y^2+z^2=R^2, plane x=0)", HOOP_B]] as const) {
        for (let i = 0; i < hoop.length - 1; i++) g.add(tube(hoop[i], hoop[i + 1], TUBE, brassTex));
        console.log(`hoop ${name}: brass circle in ${hoop.length - 1} tangent segments (tube ${TUBE}) riding the course edge midpoints — one of the two crossing generators`);
    }
}

// ---- glow bead at the crown (KEEP) — the sole night element --------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(BEAD_W[0], BEAD_W[1], BEAD_W[2]);
    glowGroup.add(bead);
    glowGroup.name = "glow_sm_1";
    g.add(glowGroup);
    console.log(`bead: glow_sm_1 r ${BEAD_R} at (${BEAD_W[0].toFixed(3)}, ${BEAD_W[1].toFixed(3)}, ${BEAD_W[2].toFixed(3)}) — the crown crossing where both hoops meet; socketed half-proud; sole night element`);
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
const merged = mergeByMaterial(g, "steinmetz");
writeFileSync("agents/arthur/assets/village_steinmetz3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_steinmetz3.glb`);
