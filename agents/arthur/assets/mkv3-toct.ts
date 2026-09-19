// mkv3-toct.ts — STRUCTURES LANE struct-245, Round 11 commission R11-58.
// THE TRUNCATED OCTAHEDRON — Kelvin's cell (bitruncated cubic honeycomb;
// Kelvin 1887; Weaire–Phelan 1993 needed TWO cell shapes to beat its area
// by 0.3%). The ARCHIMEDEAN branch's third member (struct-237 cubocta,
// struct-243 tico) and the PARENT-ECHO of the octahedron: cut each of the
// six corners at exactly 1/3 — the SAME law as the tico — and the parent's
// 6 corners become 6 SQUARES while its 8 faces become 8 HEXAGONS (the
// hexagon planes ARE the parent's face planes; probe T5: H-H dihedral ==
// the octahedron's own 109.47°, the tetrahedral angle).
//
// ONE IDEA: THE SPACE FILLER. Of all the Archimedean solids exactly ONE
// tiles space by translation alone — this one. Probe T6 machine-verifies
// the tiling itself: 17,576 grid points over the cell's bbox, 0 uncovered,
// 0 double-covered by the bcc lattice of copies. IRON carries the six
// squares (the six lattice doors — the dark panels) + all 36 seam bonds;
// STONE carries the eight hexagons (the pale facets) + the FOURTEEN-sided
// dais (one side per face — the theme number). Night contract: six warm
// brass beads at the six square centers — the six doors — in two staggered
// triangles (three shoulders ~5.22m, three skirt ~1.28m; 60° spacing, one
// dead at az 0). No bead points down: the doors live at the waist, honest
// difference from the tico's pressed twelfth.
//
// Laws honored: texMat lanes (struct-38) — toct_stone/toct_iron; bead
// emissive 0x9a7030 @ 1.4 in-GLB (dusk lineage struct-82 + tico v2 law —
// the margin fix carried forward at build time, not after a night FAIL);
// glow census exactly 1 KEEP group (glow_toct_6); ROOT STAYS IDENTITY
// (struct-188); plate basis BAKED INTO GEOMETRY (applyMatrix4); NaN 0;
// below-grade 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    V, E, FACE_V, CENTERS, NORMALS, IS_SQ, ENVELOPE,
    ROD_R, BEAD_R, BEAD_POKE, PLATE_T, PLATE_INSET, PLATE_BACK,
    PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
} from "../struct245-probe-toct.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("toct_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 14, seed: 245 });
const ironTex = texMat("toct_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 12, seed: 246 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.4;      // tico v2 law carried at build: face-center beads sit at exposure threshold at 1.0; +40% clears oblique reads without bloom
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

// ---- iron: the thirty-six seam bonds -----------------------------------------------------------------------------------
{
    for (const [i, j] of E) g.add(rod(V[i], V[j]));
    console.log(`seams: ${E.length} iron rods r${ROD_R} — every bond shared by exactly one square + one hexagon (probe T5: zero S-S edges)`);
}

// ---- panels: 6 iron squares + 8 stone hexagons (baked basis) -----------------------------------------------------------
{
    // plate mid-plane sits ROD_R − PLATE_BACK − PLATE_T/2 along the OUTWARD
    // normal: outer face PLATE_BACK behind the rods' outer surface (shadow gap).
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    let sqCount = 0, hexCount = 0;
    for (let u = 0; u < FACE_V.length; u++) {
        const c = new THREE.Vector3(...CENTERS[u]);
        const n = new THREE.Vector3(...NORMALS[u]);       // outward
        const mat = IS_SQ[u] ? ironTex : stoneTex;
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
        if (IS_SQ[u]) sqCount++; else hexCount++;
    }
    console.log(`panels: ${sqCount} iron squares + ${hexCount} stone hexagons (inset ${PLATE_INSET}m, reveal ${PLATE_BACK}m behind the rods) — the cell's checkerboard; probe T8: every plate vertex strictly inside the solid`);
}

// ---- brass glow beads at the 6 square centers (KEEP) — the six lattice doors -------------------------------------------
const glowGroup = new THREE.Group();
{
    for (let u = 0; u < FACE_V.length; u++) {
        if (!IS_SQ[u]) continue;
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 10), glowMat);
        bead.position.set(
            CENTERS[u][0] + NORMALS[u][0] * BEAD_POKE,
            CENTERS[u][1] + NORMALS[u][1] * BEAD_POKE,
            CENTERS[u][2] + NORMALS[u][2] * BEAD_POKE);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_toct_6";
    g.add(glowGroup);
    console.log(`beads: glow_toct_6 — 6 brass square centers r${BEAD_R} poked +${BEAD_POKE}m (3 shoulders + 3 skirt in staggered triangles, 60° spacing, one dead at az 0); sole night element`);
}

// ---- stone: the 14-sided dais -----------------------------------------------------------------------------------------
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
    console.log(`dais: ${PLINTH_N}-gon R${PLINTH_R} (one side per face — the theme number), h${PLINTH_H} — FOURTEEN below fourteen`);
}

// ---- census + envelope/NaN laws ----------------------------------------------------------------------------------------
g.updateMatrixWorld(true);
{
    // TRUE vertex extents (SELF-CATCH v3: Box3.setFromObject measures each
    // rod's CONSERVATIVE rotated bbox — up to R·√2 overshoot; the probe
    // contract models the true rim circles. Read actual vertex positions.)
    const tmin = [Infinity, Infinity, Infinity], tmax = [-Infinity, -Infinity, -Infinity];
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.updateMatrixWorld(true);
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        const v = new THREE.Vector3();
        for (let i = 0; i < posA.count; i++) {
            v.fromBufferAttribute(posA, i).applyMatrix4(mesh.matrixWorld);
            for (let k = 0; k < 3; k++) {
                const c = k === 0 ? v.x : k === 1 ? v.y : v.z;
                tmin[k] = Math.min(tmin[k], c);
                tmax[k] = Math.max(tmax[k], c);
            }
        }
    });
    const sz = [tmax[0] - tmin[0], tmax[1] - tmin[1], tmax[2] - tmin[2]];
    const dErr = Math.max(
        Math.abs(tmin[0] - ENVELOPE.min[0]), Math.abs(tmax[0] - ENVELOPE.max[0]),
        Math.abs(tmin[1] - ENVELOPE.min[1]), Math.abs(tmax[1] - ENVELOPE.max[1]),
        Math.abs(tmin[2] - ENVELOPE.min[2]), Math.abs(tmax[2] - ENVELOPE.max[2]));
    if (tmin[1] < -1e-6) throw Error(`below grade ${tmin[1]}`);
    if (dErr > 0.001) throw Error(`envelope drift ${dErr.toFixed(4)} vs probe contract (mk ${sz.map((x) => x.toFixed(3)).join("x")} vs probe ${ENVELOPE.max.map((m, k) => m - ENVELOPE.min[k]).map((x) => x.toFixed(3)).join("x")})`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o: any) => (o as THREE.Mesh).isMesh).length;
    console.log(`envelope OK: ${sz.map((x) => x.toFixed(2)).join("x")} y[${tmin[1].toFixed(3)}..${tmax[1].toFixed(3)}] == probe contract (TRUE vertex extents), pre-merge meshes ${meshes} + 1 glow KEEP group`);
}
const merged = mergeByMaterial(g, "toct");
writeFileSync("agents/arthur/assets/village_toct3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_toct3.glb`);
