// mkv3-versiera.ts — STRUCTURES LANE struct-200, Round 11 commission R11-24
// THE VERSIERA — the Witch of Agnesi and her hoop.
//
// One idea: (y−d)(x²+4a²) = 8a³, split by material. STONE carries the
// curve — one continuous arc-uniform voussoir ribbon (keystone at the
// crown) tracing the bell from arm tip through the crown to the mirror
// arm tip. IRON carries THE HOOP — the construction circle itself (r=a,
// in-plane), standing tangent on the curb top at its bottom pole (Agnesi's
// own construction: the circle is tangent to the asymptote line at O —
// here the asymptote IS the curb top). The bell's crown OSCULATES the
// hoop's north pole — second-order contact, the circle of curvature at
// the vertex is the construction circle itself (proven: κ(0)=1/a, zero
// crossings, quartic separation). The arms sweep past the hoop's equator
// (skirt half-width 2a = hoop diameter) and die in the air, never landing
// on their asymptote. Sole night element: one warm bead half-proud of the
// keystone's front face — the kiss. Folly class — no walk owed.
//
// Laws honored: texMat lanes (struct-38) — vs_stone/vs_iron; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1
// KEEP (glow_vs_1); ROOT STAYS IDENTITY (struct-188 decode law) — all
// positions authored in FINAL world-local coords (probe's worldPt);
// station walk owned by the probe contract; NaN 0; envelope vs probe.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    CURB_W, CURB_H, CURB_D,
    RIB_SEC_N, RIB_SEC_D, JOINT,
    RING_T, A, Y_RING, VERTEX_Y,
    BEAD_R, BEAD_Z,
    worldPt, stationsTheta, TIP_X,
    ENVELOPE,
} from "../struct200-probe-versiera.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("vs_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 200 });
const ironTex = texMat("vs_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 65 });

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
// local-y, depth local-z
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

// ---- stone curb slab (the ground echo — the asymptote made pavement) ------------------------------------
{
    const curb = new THREE.Mesh(new THREE.BoxGeometry(CURB_W, CURB_H, CURB_D), stoneTex);
    curb.position.set(0, CURB_H / 2, 0);
    g.add(curb);
    console.log(`curb: ${CURB_W}x${CURB_H}x${CURB_D} — the asymptote made pavement (the datum)`);
}

// ---- the curve in stone: the bell, one continuous ribbon ------------------------------------------------
{
    const ts = stationsTheta();
    for (let i = 0; i < ts.length - 1; i++) {
        g.add(voussoir(worldPt(ts[i]), worldPt(ts[i + 1]), RIB_SEC_N, RIB_SEC_D, stoneTex));
    }
    console.log(`curve: ${ts.length - 1} tangent voussoirs ${RIB_SEC_N}x${RIB_SEC_D} — one trace, keystone at the crown osculation, equator crossings jointed, arms dying in the air at |x|=${TIP_X}`);
}

// ---- iron: the construction hoop -------------------------------------------------------------------------
{
    // TorusGeometry lies in the XY plane (axis = local z) — exactly the
    // construction plane; centered (0, Y_RING), tangent to the curb top.
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(A, RING_T, 12, 96), ironTex);
    hoop.position.set(0, Y_RING, 0);
    g.add(hoop);
    console.log(`hoop: r=${A} tube ${RING_T} at (0, ${Y_RING}) — the construction circle, tangent to the curb top, kissed once at its north pole (${VERTEX_Y})`);
}

// ---- glow bead at the crown (KEEP) --------------------------------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(0, VERTEX_Y, BEAD_Z);   // half-proud of the keystone front face, at the kiss
    glowGroup.add(bead);
    glowGroup.name = "glow_vs_1";
    g.add(glowGroup);
    console.log(`crown bead: glow_vs_1 r ${BEAD_R} at (0, ${VERTEX_Y}, ${BEAD_Z}) — the osculation, sole night element`);
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
    // osculation diagnostic: skirt radial distance at equator (should read 2a−a = a... no —
    // equator point (±2a, d+a): radial from hoop center = 2a = 2.8 vs a 1.4 → clear by 1.4)
    const [qx, qy] = worldPt(1);
    console.log(`equator crossing: (${qx.toFixed(3)}, ${qy.toFixed(3)}) — skirt passes hoop-center height at |x| = 2a = ${2 * A}, radial clear ${(Math.hypot(qx, qy - Y_RING) - A).toFixed(3)}m outside the hoop`);
}
const merged = mergeByMaterial(g, "versiera");
writeFileSync("agents/arthur/assets/village_versiera3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_versiera3.glb`);
