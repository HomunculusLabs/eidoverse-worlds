// mkv3-newtonspheres.ts — STRUCTURES LANE struct-218, Round 11 commission R11-34
// NEWTON'S THIRTEEN SPHERES — the kissing-number shrine: twelve stone
// spheres at the exact icosahedral directions, each exactly kissing a
// glowing thirteenth at the heart; none of the twelve touch each other
// (Gregory's 0.103·s loophole); the heart visible — never reachable —
// through the twenty face windows; the planar truth (six around one,
// seventh impossible by pigeonhole) inlaid in iron on the dais rim.
//
// One idea: TWELVE CAN TOUCH ONE, NONE CAN TOUCH EACH OTHER. Newton's
// 1694 claim vs Gregory's thirteen question — the dispute that outlived
// both men by 260 years (settled Schütte–van der Waerden 1953 / Leech
// 1956). STONE carries the twelve + the dais. IRON carries the planar
// prophet. The HEART is the sole glow (warm, at the exact center, seen
// through every window).
//
// Laws honored: texMat lanes (struct-38) — ns_stone/ns_iron; heart
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1
// KEEP group (glow_ns_1); ROOT STAYS IDENTITY (struct-188) — the probe's
// seated positions are FINAL world-local; envelope vs probe; NaN 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    s, DAIS_R, DAIS_H, DISC_R, DISC_H, CENTERS, HEART, DISCS, ENVELOPE,
} from "../struct218-probe-newtonspheres.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("ns_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 218 });
const ironTex = texMat("ns_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 76 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's seated frame already puts the three
// lowest sphere bottoms exactly on the dais top.

// ---- stone dais ----------------------------------------------------------------------------------------
{
    const dais = new THREE.Mesh(new THREE.CylinderGeometry(DAIS_R, DAIS_R, DAIS_H, 64), stoneTex);
    dais.position.set(0, DAIS_H / 2, 0);
    g.add(dais);
    console.log(`dais: cylinder r ${DAIS_R} x h ${DAIS_H} — the shrine's own plaza; folly class (probe L4: no door exists), rim circuit walk owed at placement`);
}

// ---- stone: the twelve ---------------------------------------------------------------------------------
{
    for (const c of CENTERS) {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(s, 28, 20), stoneTex);
        orb.position.set(c[0], c[1], c[2]);
        g.add(orb);
    }
    console.log(`twelve: stone spheres r ${s} at the 12 exact icosahedral directions, centers at D = ${2 * s} from the heart — every kiss EXACT, min pairwise ${2.102924} (probe L3: none touch, the 0.1029·s loophole); the three golden-face spheres seat the cluster on the dais top`);
}

// ---- iron: the planar prophet (inlaid at the rim) -------------------------------------------------------
{
    for (const d of DISCS) {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(DISC_R, DISC_R, DISC_H, 24), ironTex);
        disc.position.set(d[0], d[1], d[2]);
        g.add(disc);
    }
    console.log(`planar prophet: 7 iron discs (r ${DISC_R}, 2mm proud) — one at the ring center + six at exact 60° spacing, all tangent EXACT; the seventh impossible by pigeonhole (chord 0.451 < 0.52 at best 360/7 spacing): in the plane six is the whole truth — in space the answer took 260 years more`);
}

// ---- glow: the heart (KEEP) — the sole night element ----------------------------------------------------
const glowGroup = new THREE.Group();
{
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), glowMat);
    heart.position.set(HEART[0], HEART[1], HEART[2]);
    glowGroup.add(heart);
    glowGroup.name = "glow_ns_1";
    g.add(glowGroup);
    console.log(`heart: glow_ns_1 r 0.62 at the exact center (${HEART[0]}, ${HEART[1].toFixed(3)}, ${HEART[2]}) — kissed by all twelve, visible through every window, reachable through none; the sole night element`);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------------------
g.updateMatrixWorld(true);
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const want = new THREE.Box3(
        new THREE.Vector3().fromArray(ENVELOPE.min as any),
        new THREE.Vector3().fromArray(ENVELOPE.max as any));
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
    const meshes = g.children.filter((o) => (o as any).isMesh).length;
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] == probe contract, pre-merge meshes ${meshes} + 1 glow KEEP group`);
}
const merged = mergeByMaterial(g, "newtonspheres");
writeFileSync("agents/arthur/assets/village_newtonspheres3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_newtonspheres3.glb`);
