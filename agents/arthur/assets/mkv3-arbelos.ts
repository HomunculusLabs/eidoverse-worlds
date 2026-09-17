// mkv3-arbelos.ts — STRUCTURES LANE struct-210, Round 11 commission R11-30
// THE ARBELOS — Archimedes' knife: the shoemaker's blade and the twin circles.
//
// One idea: three tangent semicircles on one baseline carve a blade-shaped
// region — and inside that blade hide two perfect twin circles. STONE
// carries the blade (the arbelos plate in horizontal voussoir courses,
// seated 8cm into a long curb). BRASS carries the twins — two rings riding
// the plate face, each kissing its lobe arc, the outer arc, and the CD
// construction ruler that rises pocket-to-sky through the composition.
// IRON carries the sole (the baseline datum rod half-inlaid along the curb
// top) + A/B/C joint pins. Sole night element: one warm bead at D, where
// the construction line meets the sky-arc (s363 sole-bead law).
//
// Laws honored: texMat lanes (struct-38) — ab_stone/ab_iron/ab_brass; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1
// KEEP (glow_ab_1); ROOT STAYS IDENTITY (struct-188) — positions are
// FINAL world-local (the probe's worldPt); envelope vs probe; NaN 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, DEPTH, RING_T, RULER_T, ROD_R, PIN_R, BEAD_R,
    VOUSSOIRS_W, TWIN_L_W, TWIN_R_W, TWIN_R, D_W, A_W, B_W, C_W, ENVELOPE, KEEL_W,
} from "../struct210-probe-arbelos.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("ab_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 210 });
const ironTex = texMat("ab_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 70 });
const brassTex = texMat("ab_brass", [0x8a6a3a, 0x7a5c30, 0x9a7a46], { rough: 0.55, metal: 0.6, scale: 1.2, weights: [3, 1, 1], cell: 16, seed: 71 });

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
    console.log(`plinth: ${PLINTH_L.toFixed(3)}x${PLINTH_H}x${PLINTH_D} — the long curb; the blade's toes seat 8cm into its top`);
}

// ---- the blade: horizontal voussoir courses between the arcs -----------------------------------------
{
    for (const v of VOUSSOIRS_W) {
        const len = v.x1w - v.x0w;
        const m = new THREE.Mesh(new THREE.BoxGeometry(len, v.yTopw - v.yw, DEPTH), stoneTex);
        m.position.set((v.x0w + v.x1w) / 2, (v.yw + v.yTopw) / 2, 0);
        g.add(m);
    }
    // the crotch keel: the blade's stand — the wedge itself, five stepped
    // stone boxes from a curb-embedded toe (8cm, morley base-course class)
    // rising to the k=1 wedge voussoir bottom; A/B knife-edges die in air
    // BY DESIGN (versiera arm class — probe L6 discloses the margins)
    for (const b of KEEL_W) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.y1w - b.y0w, DEPTH), stoneTex);
        m.position.set(C_W[0], (b.y0w + b.y1w) / 2, 0);
        g.add(m);
    }
    console.log(`blade: ${VOUSSOIRS_W.length} voussoirs in horizontal courses + the crotch keel (5 steps from an 8cm curb-embedded toe, top width ${KEEL_W[KEEL_W.length - 1].w.toFixed(3)} m — the blade standing on its edge) — the arbelos region stepped between the outer arc and the two lobe arcs`);
}

// ---- brass: the twin rings + the CD ruler -------------------------------------------------------------
{
    for (const [name, C] of [["left", TWIN_L_W], ["right", TWIN_R_W]] as const) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(TWIN_R, RING_T, 10, 48), brassTex);
        ring.position.set(C[0], C[1], 0);
        g.add(ring);
    }
    // the CD construction ruler: pocketed toe to sky-arc, through the weld
    g.add(tube(C_W, D_W, RULER_T, brassTex));
    console.log(`twins: two brass rings r=${TWIN_R.toFixed(6)} (each kissing lobe arc + outer arc + the ruler) + the CD construction line r=${RULER_T} — Book of Lemmas 5 machine-exact (congruent, not mutually tangent: the honest asymmetric knife)`);
}

// ---- iron: the sole datum rod + A/B/C joint pins ------------------------------------------------------
{
    g.add(tube(A_W, B_W, ROD_R, ironTex));
    console.log(`sole: iron datum rod r=${ROD_R} half-inlaid along the curb top, A to B — the shoemaker's baseline`);
    for (const [name, P] of [["A", A_W], ["B", B_W], ["C", C_W]] as const) {
        const pin = new THREE.Mesh(new THREE.SphereGeometry(PIN_R, 10, 8), ironTex);
        pin.position.set(P[0], P[1], P[0] * 0 + P[2]);
        g.add(pin);
    }
    console.log(`pins: A/B/C joint spheres r=${PIN_R} at the three arc joints on the baseline`);
}

// ---- glow bead at D (KEEP) — the sole night element ----------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(D_W[0], D_W[1], D_W[2]);
    glowGroup.add(bead);
    glowGroup.name = "glow_ab_1";
    g.add(glowGroup);
    console.log(`bead: glow_ab_1 r ${BEAD_R} at (${D_W[0].toFixed(3)}, ${D_W[1].toFixed(3)}, ${D_W[2].toFixed(3)}) — D, where the construction line meets the sky-arc; sole night element`);
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
const merged = mergeByMaterial(g, "arbelos");
writeFileSync("agents/arthur/assets/village_arbelos3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_arbelos3.glb`);
