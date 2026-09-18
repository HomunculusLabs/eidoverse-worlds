// mkv3-sphericon.ts — STRUCTURES LANE struct-216, Round 11 commission R11-33
// THE SPHERICON — the oloid's square cousin: a bicone with a 90-degree apex,
// cut through its axis into two half-bicones, one rotated a quarter-turn about
// the cut-plane normal and reglued at the common square face. Frozen mid-roll
// on its curb, its ground-fan drawn behind it.
//
// One idea: A SOLID THAT ROLLS ON ITS WHOLE SKIN — LINE, THEN POINT, THEN
// LINE. STONE carries the solid — 75 voussoir boxes in stepped courses, every
// box corner-exact inside the hull (probe L7). BRASS carries the two
// semicircular EDGES — proud arcs riding the surface, the interlocked pair
// that IS the sphericon (both ground out exactly at the contact ruling's
// ends). IRON carries the roll TRACE inlaid in the curb top — the seat line
// (the live contact generator, apex end to rim end) + two wake spokes at
// exact unroll azimuths + the rim's wake arc, the exact circle the rolling
// rim swept about the pivot apex. Sole night element: one warm bead socketed
// at the crown (s363 law).
//
// Laws honored: texMat lanes (struct-38) — sp_stone/sp_iron/sp_brass; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1 KEEP
// (glow_sp_1); ROOT STAYS IDENTITY (struct-188) — positions are FINAL
// world-local (the probe's worldPt already applies the datum lift);
// envelope vs probe; NaN 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, COURSES, ARC_A, ARC_B,
    SEAT_LINE_W, BARS_W, ARC_W, BEAD_W, ENVELOPE, TUBE, BEAD_R, SEAT_TUBE, TRACE_TUBE, INLAY_Y,
} from "../struct216-probe-sphericon.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("sp_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 216 });
const ironTex = texMat("sp_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 76 });
const brassTex = texMat("sp_brass", [0x8a6a3a, 0x7a5c30, 0x9a7a46], { rough: 0.55, metal: 0.6, scale: 1.2, weights: [3, 1, 1], cell: 16, seed: 77 });

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
    console.log(`plinth: ${PLINTH_L.toFixed(3)}x${PLINTH_H}x${PLINTH_D} — the long curb; the solid's first boxed course seats 8cm into its top (the seat-line strip itself is the degenerate contact line, left to the cradle)`);
}

// ---- stone: the solid in stepped voussoir courses ------------------------------------------------------
{
    for (const v of COURSES) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(v.x1 - v.x0, v.yTop - v.y, v.z1 - v.z0), stoneTex);
        m.position.set((v.x0 + v.x1) / 2, (v.y + v.yTop) / 2, (v.z0 + v.z1) / 2);
        g.add(m);
    }
    const last = COURSES[COURSES.length - 1];
    console.log(`solid: ${COURSES.length} voussoir boxes in stepped courses — every box's 8 corners inside the exact hull by closed-form membership (probe L7); crown course top ${(last.yTop).toFixed(3)} m`);
}

// ---- brass: the two semicircular edges (the interlocked pair) -------------------------------------------
{
    for (const [name, ring] of [["E1", ARC_A], ["E2", ARC_B]] as const) {
        for (let i = 0; i < ring.length - 1; i++) g.add(tube(ring[i], ring[i + 1], TUBE, brassTex));
        console.log(`edge ${name}: brass semicircle in ${ring.length - 1} tangent segments (tube ${TUBE}) riding the surface — one of the two perpendicular interlocked edges (E1's midpoint and E2's +z endpoint are the contact ruling's two ground ends)`);
    }
}

// ---- iron: the seat line + the trace fan (inlaid in the curb top) ----------------------------------------
{
    // the seat line: the LIVE contact generator, apex end to rim end, full length
    const s = SEAT_LINE_W;
    g.add(tube([s.x0, s.y, s.z0], [s.x1, s.y, s.z1], SEAT_TUBE, ironTex));
    console.log(`seat line: iron tube ${s.len.toFixed(3)} m at the live contact generator (half-inlaid 12mm into the curb top) — where the solid stands, its whole line of contact`);
    for (const b of BARS_W) {
        g.add(tube([b.x0, b.y, b.z0], [b.x1, b.y, b.z1], TRACE_TUBE, ironTex));
    }
    console.log(`wake spokes: ${BARS_W.length} iron bars at exact unroll azimuths [${BARS_W.map((b) => b.deg.toFixed(2)).join(", ")}] deg (probe L6: dpsi = dtheta/sqrt2; bar2 stands at the EDGE-TRANSITION azimuth 90/sqrt2 — the roll's last line-contact before the point wobble), visible portions ${BARS_W.map((b) => b.visibleLen.toFixed(2)).join("/")} m`);
    for (let i = 0; i < ARC_W.length - 1; i++) g.add(tube(ARC_W[i], ARC_W[i + 1], TRACE_TUBE, ironTex));
    console.log(`wake arc: iron arc in ${ARC_W.length - 1} segments, exact radius sqrt2*R about the pivot apex point — the circle the rolling rim swept (unbroken, all on open ground)`);
}

// ---- glow bead at the crown (KEEP) — the sole night element --------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(BEAD_W[0], BEAD_W[1], BEAD_W[2]);
    glowGroup.add(bead);
    glowGroup.name = "glow_sp_1";
    g.add(glowGroup);
    console.log(`bead: glow_sp_1 r ${BEAD_R} at (${BEAD_W[0].toFixed(3)}, ${BEAD_W[1].toFixed(3)}, ${BEAD_W[2].toFixed(3)}) — socketed half-proud into the highest seatable course (crown delta 0.373 m disclosed); sole night element`);
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
const merged = mergeByMaterial(g, "sphericon");
writeFileSync("agents/arthur/assets/village_sphericon3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_sphericon3.glb`);
