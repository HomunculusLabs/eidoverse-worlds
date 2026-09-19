// mkv3-ico.ts — STRUCTURES LANE struct-239, Round 11 commission R11-52
// THE ICOSAHEDRON — the last Platonic solid (Euclid XIII.16; Timaeus 55d:
// water). DUAL of the standing dodecahedron (struct-106) — that solid's
// 12 faces are this solid's 12 corners.
//
// One idea: PLATO'S WATER, RENDERED OPEN. The dodecahedron stands closed;
// its dual stands OPEN — 30 iron edges as a cage you see through, the 20
// triangle faces left to the eye. THE SECRET INSIDE: the 12 corners are
// exactly three mutually perpendicular GOLDEN RECTANGLES (2 × 2φ, pairwise
// disjoint, interlocked without touching) — drawn as 12 thinner interior
// frame rods. Tip-down on a TWENTY-sided dais (one side per face — the
// theme number); night: 12 warm brass beads at the corners — the twelve
// faces of the dodecahedron across the village.
//
// Laws honored: texMat lanes (struct-38) — ico_stone/ico_iron; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage, struct-82); glow census
// exactly 1 KEEP group (glow_ico_12); ROOT STAYS IDENTITY (struct-188) —
// positions are FINAL world-local; NaN 0; below-grade 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    V, E, RF, ENVELOPE,
    ROD_R, FRAME_R, BEAD_R,
    PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
} from "../struct239-probe-ico.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("ico_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 239 });
const ironTex = texMat("ico_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 24, seed: 51 });
// v2 (struct-239 closeface falsification): the golden rectangles were ico_iron — visually
// indistinguishable from the cage (judge 0/4, "cannot trace a single thin rectangular loop").
// THE GOLDEN RECTANGLES ARE NOW GOLD: their own warm brass texMat lane, non-emissive
// (the corner beads remain the sole night element — night contract unchanged).
const brassFrameTex = texMat("ico_brassframe", [0xa8823f, 0xb8924f, 0x98722f], { rough: 0.45, metal: 0.75, scale: 1.4, weights: [1, 1, 1], cell: 20, seed: 77 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188): every position below is FINAL world-local.

// rod from P to Q (heightSegments 2: mid-ring verts exist for the decode coverage law)
function rod(P: [number, number, number], Q: [number, number, number], r: number, mat: THREE.Material): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10, 2), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    return m;
}

// ---- iron cage + GOLDEN interior frames -----------------------------------------------------------------
{
    for (const [i, j] of E) g.add(rod(V[i], V[j], ROD_R, ironTex));
    for (const [i, j] of RF) g.add(rod(V[i], V[j], FRAME_R, brassFrameTex));
    console.log(`cage: ${E.length} iron rods r${ROD_R} — the thirty edges, faces left open (probe T2/T4)`);
    console.log(`frames: ${RF.length} GOLDEN interior rods r${FRAME_R} — three 2×2φ rectangles, brass lane, interlocked, never touching (probe T5; v2 closeface fix)`);
}

// ---- brass glow beads at ALL 12 corners (KEEP) — the dodecahedron's twelve faces ------------------------
const glowGroup = new THREE.Group();
{
    for (let i = 0; i < V.length; i++) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 10), glowMat);
        bead.position.set(V[i][0], V[i][1], V[i][2]);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_ico_12";
    g.add(glowGroup);
    console.log(`beads: glow_ico_12 — 12 brass corners r${BEAD_R} (the dodecahedron's 12 faces, its dual across the village); tip bead half-proud in the dais top; sole night element`);
}

// ---- stone: the icosagonal dais -------------------------------------------------------------------------------
{
    const shape = new THREE.Shape();
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        const x = PLINTH_R * Math.cos(a), y = PLINTH_R * Math.sin(a);
        if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: PLINTH_H, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);                // extrusion +z → +y; spans y [0, PLINTH_H]
    const plinth = new THREE.Mesh(geo, stoneTex);
    g.add(plinth);
    console.log(`dais: icosagon R${PLINTH_R} (${PLINTH_N} sides — one per face, the theme number), h${PLINTH_H} — TWENTY below twenty`);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------------------------
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
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o: any) => (o as THREE.Mesh).isMesh).length;
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] == probe contract, pre-merge meshes ${meshes} + 1 glow KEEP group`);
}
const merged = mergeByMaterial(g, "ico");
writeFileSync("agents/arthur/assets/village_ico3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_ico3.glb`);
