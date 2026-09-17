// mkv3-morley.ts — STRUCTURES LANE struct-208, Round 11 commission R11-28
// MORLEY'S TRISECTOR THEOREM — the scalene triangle and the perfect heart.
//
// One idea: any triangle hides a perfect one. STONE carries the scalene
// frame — a needle-pointed 40/60/80 gable in voussoir rhythm seated 8cm
// into a long curb. IRON carries the six trisector chords (vertex ->
// opposite edge, exact thirds). BRASS carries the heart — the exact
// equilateral the adjacent trisectors carve, riding the three crossings.
// Sole night element: one warm bead at the topmost heart corner (s363
// sole-bead law).
//
// Laws honored: texMat lanes (struct-38) — mo_stone/mo_iron/mo_brass; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1
// KEEP (glow_mo_1); ROOT STAYS IDENTITY (struct-188) — positions are
// FINAL world-local (the probe's worldPt); envelope vs probe; NaN 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, W, D, ROD_R, HEART_R, CORNER_R, BEAD_R,
    SEGS_W, RODS_W, M_W, BEAD_AT_W, ENVELOPE,
} from "../struct208-probe-morley.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("mo_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 208 });
const ironTex = texMat("mo_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 68 });
const brassTex = texMat("mo_brass", [0x8a6a3a, 0x7a5c30, 0x9a7a46], { rough: 0.55, metal: 0.6, scale: 1.2, weights: [3, 1, 1], cell: 16, seed: 69 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's worldPt already applies the datum lift.

// cylinder-in-plane helper: tube from P to Q in the z=0 plane
function tube(P: [number, number, number], Q: [number, number, number], r: number, mat: THREE.Material): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.sub(A).normalize());
    return m;
}

// ---- stone curb plinth ------------------------------------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PLINTH_L, PLINTH_H, PLINTH_D), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${PLINTH_L.toFixed(3)}x${PLINTH_H}x${PLINTH_D} — the long curb; the gable's base course seats 8cm into its top`);
}

// ---- the scalene gable: voussoir rhythm on all three edges -------------------------------------------
{
    for (const s of SEGS_W) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(s.len, W, D), stoneTex);
        m.position.set(s.mid[0], s.mid[1], 0);
        m.rotation.z = s.ang;
        g.add(m);
    }
    const n = SEGS_W.length;
    console.log(`gable: ${n} voussoirs ${W}x${D} on the 40/60/80 scalene — the needle apex, two rakes, the seated base`);
}

// ---- iron: the six trisector chords -------------------------------------------------------------------
for (const r of RODS_W) {
    g.add(tube(r.P0, r.P1, ROD_R, ironTex));
    // vertex ball: the rod's forging head at the triangle corner
    const head = new THREE.Mesh(new THREE.SphereGeometry(ROD_R * 1.5, 10, 8), ironTex);
    head.position.set(...r.P0);
    g.add(head);
}
console.log(`rods: 6 iron trisector chords r=${ROD_R}, vertex -> opposite edge — each interior angle cut into exact thirds; forged heads at the corners`);

// ---- brass: the heart ------------------------------------------------------------------------------
{
    const pairs: [number, number][] = [[0, 1], [1, 2], [2, 0]];
    for (const [i, j] of pairs) g.add(tube(M_W[i], M_W[j], HEART_R, brassTex));
    for (const M of M_W) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(CORNER_R, 12, 10), brassTex);
        bead.position.set(...M);
        g.add(bead);
    }
    console.log(`heart: 3 brass sides r=${HEART_R} + 3 corner beads r=${CORNER_R} — the exact equilateral riding the trisector crossings (Morley 1899)`);
}

// ---- glow bead at the topmost heart corner (KEEP) — the sole night element ---------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(BEAD_AT_W[0], BEAD_AT_W[1], BEAD_AT_W[2]);
    glowGroup.add(bead);
    glowGroup.name = "glow_mo_1";
    g.add(glowGroup);
    console.log(`bead: glow_mo_1 r ${BEAD_R} at (${BEAD_AT_W[0].toFixed(3)}, ${BEAD_AT_W[1].toFixed(3)}, ${BEAD_AT_W[2].toFixed(3)}) — the heart's top corner, where two trisectors cross; sole night element`);
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
const merged = mergeByMaterial(g, "morley");
writeFileSync("agents/arthur/assets/village_morley3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_morley3.glb`);
