// mkv3-oloid.ts — STRUCTURES LANE struct-214, Round 11 commission R11-32
// THE OLOID — the stone that rolls: the convex hull of two linked
// perpendicular circles, frozen mid-roll on its curb.
//
// One idea: A SOLID THAT ROLLS ON ITS WHOLE SKIN. STONE carries the hull —
// 130 voussoir boxes in stepped horizontal courses, each a TRUE inscribed
// box of the exact hull slice at both its stations (probe L6). BRASS
// carries the two generator CIRCLES — proud rings riding the surface, the
// linked pair that generates every ruling. IRON carries the roll TRAIL —
// the seat line under the solid plus three worn bars at exact bitangent
// rulings marching back along the curb: the path the roll came from.
// Sole night element: one warm bead at the crown (the point farthest
// from the rolling plane; s363 law).
//
// Laws honored: texMat lanes (struct-38) — ol_stone/ol_iron/ol_brass; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1
// KEEP (glow_ol_1); ROOT STAYS IDENTITY (struct-188) — positions are
// FINAL world-local (the probe's worldPt already applies the datum lift);
// envelope vs probe; NaN 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, COURSES, RING_A, RING_B,
    SEAT_LINE_W, TRAIL_W, BEAD_W, ENVELOPE, TUBE, BEAD_R, BAR_H, BAR_W,
} from "../struct214-probe-oloid.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("ol_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 214 });
const ironTex = texMat("ol_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 74 });
const brassTex = texMat("ol_brass", [0x8a6a3a, 0x7a5c30, 0x9a7a46], { rough: 0.55, metal: 0.6, scale: 1.2, weights: [3, 1, 1], cell: 16, seed: 75 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's worldPt already applies the datum lift.

// tube from P to Q (the lane's tangent-segment register: curve by turning)
function tube(P: [number, number, number], Q: [number, number, number], r: number, mat: THREE.Material): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.sub(A).normalize());
    return m;
}

// ---- stone curb ---------------------------------------------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PLINTH_L, PLINTH_H, PLINTH_D), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${PLINTH_L.toFixed(3)}x${PLINTH_H}x${PLINTH_D} — the long curb; the hull's base course seats 8cm into its top`);
}

// ---- stone: the hull in stepped voussoir courses --------------------------------------------------------
{
    for (const v of COURSES) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(v.x1 - v.x0, v.yTop - v.y, v.z1 - v.z0), stoneTex);
        m.position.set((v.x0 + v.x1) / 2, (v.y + v.yTop) / 2, (v.z0 + v.z1) / 2);
        g.add(m);
    }
    const last = COURSES[COURSES.length - 1];
    console.log(`hull: ${COURSES.length} voussoir boxes in stepped courses — each a TRUE inscribed box of the exact hull slice at both stations (probe L6); crown course top ${(last.yTop).toFixed(3)} m at x [${last.x0.toFixed(2)},${last.x1.toFixed(2)}]`);
}

// ---- brass: the two generator rings (the linked pair) ---------------------------------------------------
{
    for (const [name, ring] of [["C1", RING_A], ["C2", RING_B]] as const) {
        for (let i = 0; i < ring.length - 1; i++) g.add(tube(ring[i], ring[i + 1], TUBE, brassTex));
        console.log(`ring ${name}: brass circle in ${ring.length - 1} tangent segments (tube ${TUBE}) riding the hull surface — one of the two linked perpendicular generators`);
    }
}

// ---- iron: the seat line + the trail bars ---------------------------------------------------------------
{
    // the seat line: the LIVE contact ruling, full length, in the curb top
    const s = SEAT_LINE_W;
    {
        const dx = Math.cos(s.yaw) * s.len / 2, dz = Math.sin(s.yaw) * s.len / 2;
        g.add(tube([s.x - dx, PLINTH_H - 0.012, s.z - dz], [s.x + dx, PLINTH_H - 0.012, s.z + dz], 0.018, ironTex));
    }
    console.log(`seat line: iron bar ${s.len.toFixed(2)} m at the live contact ruling (half-inlaid 12mm into the curb top) — where the stone stands`);
    for (const b of TRAIL_W) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(b.len, BAR_H, BAR_W), ironTex);
        m.position.set(b.x, PLINTH_H + BAR_H / 2 - 0.008, b.z);
        m.rotation.y = -b.yaw;
        g.add(m);
    }
    console.log(`trail: ${TRAIL_W.length} iron wear bars at EXACT bitangent rulings (probe L4) marching back along the curb, lengths ${TRAIL_W.map((b) => b.len.toFixed(2)).join("/")} m — the roll's history`);
}

// ---- glow bead at the crown (KEEP) — the sole night element --------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(BEAD_W[0], BEAD_W[1], BEAD_W[2]);
    glowGroup.add(bead);
    glowGroup.name = "glow_ol_1";
    g.add(glowGroup);
    console.log(`bead: glow_ol_1 r ${BEAD_R} at (${BEAD_W[0].toFixed(3)}, ${BEAD_W[1].toFixed(3)}, ${BEAD_W[2].toFixed(3)}) — the crown, farthest point from the rolling plane; socketed half-proud into the crown course; sole night element`);
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
const merged = mergeByMaterial(g, "oloid");
writeFileSync("agents/arthur/assets/village_oloid3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_oloid3.glb`);
