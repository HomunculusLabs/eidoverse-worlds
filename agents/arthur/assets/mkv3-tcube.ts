// mkv3-tcube.ts — STRUCTURES LANE struct-249, Round 11 commission R11-60.
// THE TRUNCATED CUBE — the deeper cut. The ARCHIMEDEAN branch's fifth
// member (struct-237 cubocta, struct-243 tico, struct-245 toct, struct-247
// tret) and the PARENT-ECHO of the cube — the branch's fourth Platonic
// parent (tetra✓tret, octa✓toct, icosa✓tico, cube→tcube).
//
// ONE IDEA: THE DEEPER CUT. The family law is 1/3 — but cut a CUBE's
// eight corners at 1/3 and the faces become IRREGULAR octagons (side
// ratio exactly √2, probe T6b). Regularity demands the cut go DEEPER:
// u = 1 − 1/√2. Cut that deep and exactly 7(√2−1)/3 ≈ 96.65% of the
// parent still stands — the lightest touch of the whole branch (probe T6,
// divergence-theorem volume, dual-computation agreement 2.7e-15).
// Presentation: FACE-DOWN, 4-fold — the cube's own cardinality. IRON
// carries the eight TRIANGLES (the cuts, dark) + all 36 seam bonds;
// STONE carries the six OCTAGONS (the parent's own face planes; O-O
// dihedral == the cube's own 90°, probe T5) + the FOURTEEN-sided dais
// (one side per face, 6+8). Night contract: six warm brass beads at the
// six octagon centers — the six parent faces, lit: one crown FINIAL on
// an iron stem (tret v2 occlusion law) + four waist at the exact
// cardinals + the sixth PRESSED INTO THE EARTH beneath the flat foot
// (tico's-twelfth idiom, fully buried in the dais band — five read at
// night, six in truth). The iron cuts stay dark: absence is the mark of
// the removed corners.
//
// Laws honored: texMat lanes (struct-38) — tcube_stone/tcube_iron; bead
// emissive 0x9a7030 @ 1.4 in-GLB (dusk lineage struct-82 + tico v2 +
// toct/tret build-time law); glow census exactly 1 KEEP group
// (glow_tcube_6); ROOT STAYS IDENTITY (struct-188); plate basis BAKED
// INTO GEOMETRY (applyMatrix4); NaN 0; below-grade 0; dais APOTHEM-FIRST
// (struct-247 fix, carried).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    V, E, FACE_V, CENTERS, NORMALS, IS_TRI, ENVELOPE,
    ROD_R, BEAD_R, BEAD_POKE, STEM_H, STEM_R, FOOT_BEAD_Y,
    PLATE_T, PLATE_INSET, PLATE_BACK,
    PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
} from "../struct249-probe-tcube.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("tcube_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 14, seed: 249 });
const ironTex = texMat("tcube_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 12, seed: 250 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.4;      // tico v2 / toct / tret build-time law: face-center beads sit at exposure threshold at 1.0; +40% clears oblique reads without bloom
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
    console.log(`seams: ${E.length} iron rods r${ROD_R} — every bond shared by exactly one triangle + one octagon (probe T5: zero T-T edges)`);
}

// ---- panels: 8 iron triangles + 6 stone octagons (baked basis) -------------------------------------------------------
{
    // plate mid-plane sits ROD_R − PLATE_BACK − PLATE_T/2 along the OUTWARD
    // normal: outer face PLATE_BACK behind the rods' outer surface (shadow gap).
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    let triCount = 0, octCount = 0;
    for (let u = 0; u < FACE_V.length; u++) {
        const c = new THREE.Vector3(...CENTERS[u]);
        const n = new THREE.Vector3(...NORMALS[u]);       // outward
        const mat = IS_TRI[u] ? ironTex : stoneTex;
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
        if (IS_TRI[u]) triCount++; else octCount++;
    }
    console.log(`panels: ${triCount} iron triangles (the cuts) + ${octCount} stone octagons (the remainder, on the parent's own planes; inset ${PLATE_INSET}m, reveal ${PLATE_BACK}m behind the rods) — probe T8: every plate vertex strictly inside the solid; the FOOT plate rides the dais band`);
}

// ---- brass glow beads at the octagon centers (KEEP) — the six parent faces ------------------------------------------
// Crown bead rides the finial stem (tret v2 occlusion law); the FOOT bead
// is pressed into the earth — fully buried in the dais band, never reads.
const glowGroup = new THREE.Group();
{
    let crownDone = false;
    for (let u = 0; u < FACE_V.length; u++) {
        if (IS_TRI[u]) continue;                          // the cuts stay dark
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 10), glowMat);
        if (NORMALS[u][1] > 0.99 && !crownDone) {
            // crown: finial — stem (iron) + lifted bead
            const p0 = new THREE.Vector3(
                CENTERS[u][0] + NORMALS[u][0] * BEAD_POKE,
                CENTERS[u][1] + NORMALS[u][1] * BEAD_POKE,
                CENTERS[u][2] + NORMALS[u][2] * BEAD_POKE);
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(STEM_R, STEM_R, STEM_H, 8, 1), ironTex);
            stem.position.set(p0.x, p0.y + STEM_H / 2, p0.z);
            g.add(stem);
            bead.position.set(p0.x, p0.y + STEM_H, p0.z);
            crownDone = true;
        } else if (NORMALS[u][1] < -0.99) {
            // foot: the sixth bead pressed into the earth — buried in the dais band
            bead.position.set(0, FOOT_BEAD_Y, 0);
        } else {
            bead.position.set(
                CENTERS[u][0] + NORMALS[u][0] * BEAD_POKE,
                CENTERS[u][1] + NORMALS[u][1] * BEAD_POKE,
                CENTERS[u][2] + NORMALS[u][2] * BEAD_POKE);
        }
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_tcube_6";
    g.add(glowGroup);
    console.log(`beads: glow_tcube_6 — 6 brass octagon centers r${BEAD_R} (crown FINIAL on a ${STEM_R}m iron stem +${STEM_H}m; 4 waist cardinals poked +${BEAD_POKE}m; 1 pressed foot buried y ${FOOT_BEAD_Y} in the dais band); sole night element — the six parent faces, lit; the cuts stay dark`);
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
    console.log(`dais: ${PLINTH_N}-gon R${PLINTH_R} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod), h${PLINTH_H} — one side per face, 6 octagons + 8 triangles`);
}

// ---- census + envelope/NaN laws ----------------------------------------------------------------------------------------
g.updateMatrixWorld(true);
{
    // TRUE vertex extents (struct-245 law: Box3.setFromObject measures each
    // rod's CONSERVATIVE rotated bbox — the probe contract models true rims.)
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
const merged = mergeByMaterial(g, "tcube");
writeFileSync("agents/arthur/assets/village_tcube3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_tcube3.glb`);
