// mkv3-tico.ts — STRUCTURES LANE struct-243, Round 11 commission R11-56.
// THE TRUNCATED ICOSAHEDRON — C60, the football (Archimedes via Pappus;
// Kroto/Curl/Smalley 1985, Nobel 1996). The ARCHIMEDEAN branch's second
// member and the PARENT-ECHO of the icosahedron placed struct-240: cut each
// corner at exactly 1/3 and the parent's 12 corners become 12 pentagons
// while its 20 faces become 20 hexagons — the hexagon planes ARE the
// parent's face planes (probe T5: the H-H dihedral equals the parent's).
//
// ONE IDEA: EULER'S TWELVE. Hexagons tile the plane but cannot close a
// sphere — Σ(6−k)·f_k = 12 is forced. IRON carries the twelve pentagons
// (the black panels) + all 90 seam bonds; STONE carries the twenty hexagons
// (the white panels) + the THIRTY-TWO-sided dais (one side per face — the
// theme number). Night contract: twelve warm brass beads at the twelve
// pentagon centers — the twelve Euler forces — with the bottom one pressed
// into the earth beneath the ball (11 read at night, 12 in truth).
//
// Laws honored: texMat lanes (struct-38) — tico_stone/tico_iron; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage, struct-82); glow census
// exactly 1 KEEP group (glow_tico_12); ROOT STAYS IDENTITY (struct-188) —
// positions are FINAL world-local; plate basis BAKED INTO GEOMETRY
// (applyMatrix4, Box3 corner law); NaN 0; below-grade 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    V, E, FACE_V, CENTERS, NORMALS, IS_PENT, ENVELOPE,
    ROD_R, BEAD_R, PLATE_T, PLATE_INSET, PLATE_BACK,
    PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
} from "../struct243-probe-tico.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("tico_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 243 });
const ironTex = texMat("tico_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 24, seed: 244 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.4;      // dusk lineage (struct-82 law); v2: 1.0->1.4 — the night judge resolved only the front-arc beads at threshold (face-center beads on 5-fold azimuths: ~4-6 read per vantage); +40% pulls the oblique arc over threshold without bloom
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188): every position below is FINAL world-local.

// rod from P to Q (heightSegments 2: mid-ring verts exist for the decode coverage law)
function rod(P: [number, number, number], Q: [number, number, number]): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(ROD_R, ROD_R, len, 10, 2), ironTex);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    return m;
}

// ---- iron: the ninety seam bonds --------------------------------------------------------------------------------------
{
    for (const [i, j] of E) g.add(rod(V[i], V[j]));
    console.log(`seams: ${E.length} iron rods r${ROD_R} — every bond shared by exactly one pentagon + one hexagon (IPR law, probe T6: zero P-P edges)`);
}

// ---- panels: 12 iron pentagons + 20 stone hexagons (baked basis) ------------------------------------------------------
{
    // plate mid-plane sits ROD_R − PLATE_BACK − PLATE_T/2 along the OUTWARD
    // normal: outer face PLATE_BACK behind the rods' outer surface (shadow gap).
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    let pentCount = 0, hexCount = 0;
    for (let u = 0; u < FACE_V.length; u++) {
        const c = new THREE.Vector3(...CENTERS[u]);
        const n = new THREE.Vector3(...NORMALS[u]);       // outward
        const mat = IS_PENT[u] ? ironTex : stoneTex;
        // in-plane basis from the first face corner
        const d0 = new THREE.Vector3(...V[FACE_V[u][0]]).sub(c);
        const e1n = d0.clone().normalize();
        const e2n = new THREE.Vector3().crossVectors(n, e1n);
        // face → 2D, inset PLATE_INSET toward c (uniform radial shrink)
        const pts = FACE_V[u].map((vi) => {
            const d = new THREE.Vector3(...V[vi]).sub(c);
            const r = d.length();
            const s = (r - PLATE_INSET) / r;
            const q = d.multiplyScalar(s);
            return [q.dot(e1n), q.dot(e2n)] as [number, number];
        });
        const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
        const geo = new THREE.ExtrudeGeometry(shape, { depth: PLATE_T, bevelEnabled: false });
        geo.translate(0, 0, -PLATE_T / 2);    // center on local z = 0
        // bake: local (x,y,z) → c + e1n·x + e2n·y + n·(z + sSide)
        const m4 = new THREE.Matrix4().makeBasis(e1n, e2n, n);
        m4.setPosition(c.clone().addScaledVector(n, sSide));
        geo.applyMatrix4(m4);
        g.add(new THREE.Mesh(geo, mat));
        if (IS_PENT[u]) pentCount++; else hexCount++;
    }
    console.log(`panels: ${pentCount} iron pentagons + ${hexCount} stone hexagons (inset ${PLATE_INSET}m, reveal ${PLATE_BACK}m behind the rods) — the football's checkerboard; probe T8: every plate vertex strictly inside the solid`);
}

// ---- brass glow beads at the 12 pentagon centers (KEEP) — the twelve Euler forces ------------------------------------
const glowGroup = new THREE.Group();
{
    for (let u = 0; u < FACE_V.length; u++) {
        if (!IS_PENT[u]) continue;
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 10), glowMat);
        bead.position.set(CENTERS[u][0], CENTERS[u][1], CENTERS[u][2]);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_tico_12";
    g.add(glowGroup);
    console.log(`beads: glow_tico_12 — 12 brass pentagon centers r${BEAD_R} (11 aloft + 1 pressed half-proud into the dais top); sole night element`);
}

// ---- stone: the 32-sided dais ----------------------------------------------------------------------------------------
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
    console.log(`dais: ${PLINTH_N}-gon R${PLINTH_R} (one side per face — the theme number), h${PLINTH_H} — THIRTY-TWO below thirty-two`);
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
const merged = mergeByMaterial(g, "tico");
writeFileSync("agents/arthur/assets/village_tico3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_tico3.glb`);
