// mkv3-dtria.ts — STRUCTURES LANE struct-267, Round 11 commission R11-75.
// THE DISDYAKIS TRIACONTAHEDRON — the Catalan dual of the standing truncated
// icosidodecahedron (trico, struct-259/260). Catalan branch member 2 (the rt,
// struct-235, opened it).
//
// ONE IDEA: THE KNIFE'S WORK, TURNED INSIDE-OUT. The trico cut the golden
// parent into 62 faces (12 decagons + 30 squares + 20 hexagons); the polar
// reciprocal about the midsphere turns every face into a POINT (12 shallow
// crown-points + 30 mid + 20 deep) and every one of the 120 wedding corners
// into a scalene triangle sail — the same census, read through the looking
// glass. Every sail kisses ONE insphere (the Catalan tangent property) —
// mirror of the parent's every-vertex-on-one-sphere.
// Presentation: POINT-DOWN on the 5-fold axis, the parent's own seated frame
// INHERITED (decagon-down + twist-snap — no re-seat). Material law: ONE face
// family = ONE sail material (the face-transitivity read in the material
// itself) — STONE carries all 120 triangle sails + the ONE-HUNDRED-TWENTY-
// sided dais (one side per face, theme-number law); IRON carries all 180
// seam bonds + the crown finial stem. Night contract: TWELVE warm brass
// beads at the twelve dec-rank crown-points (the icosa-vertex orbit, the
// parent's own bead census told again): 1 CROWN on the finial stem (tret v2
// occlusion law) + TEN WAIST in two exact 72-degree pentads (upper
// interleaved 36-deg, inversion-paired) + THE TWELFTH PRESSED INTO THE
// EARTH beneath the standing point (tico's-twelfth idiom). The 30 sq-rank +
// 20 hex-rank points stay dark.
//
// Laws honored: texMat lanes (struct-38) — dtria_stone/dtria_iron; bead
// emissive 0x9a7030 @ 1.4 in-GLB (family build-time law); glow census
// exactly 1 KEEP group (glow_dtria_12); ROOT STAYS IDENTITY (struct-188);
// plate basis BAKED INTO GEOMETRY (applyMatrix4); NaN 0; below-grade 0;
// dais APOTHEM-FIRST (struct-247).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    V, E, FACE_V, CENTERS, NORMALS, BEADS,
    CROWN_IDX, SOLID_CENTER,
    ROD_R, BEAD_R, BEAD_POKE, STEM_H, STEM_R,
    PLATE_T, PLATE_INSET, PLATE_BACK,
    PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
    ENVELOPE,
} from "../struct267-probe-dtria.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("dtria_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 14, seed: 267 });
const ironTex = texMat("dtria_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 12, seed: 268 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.4;      // family build-time law: face-center beads sit at exposure threshold at 1.0; +40% clears oblique reads without bloom
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

// ---- iron: the one-hundred-eighty seam bonds (one per parent edge — the dual edge census) ---------------
{
    for (const [i, j] of E) g.add(rod(V[i], V[j]));
    console.log(`seams: ${E.length} iron rods r${ROD_R} — one dual edge per parent edge (bijection 180<->180; three length classes 60 each, the honest non-uniform Catalan signature)`);
}

// ---- panels: 120 stone triangle sails (baked basis) ----------------------------------------------------
{
    // plate mid-plane sits ROD_R − PLATE_BACK − PLATE_T/2 along the OUTWARD
    // normal: outer face PLATE_BACK behind the rods' outer surface (shadow gap).
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    let triCount = 0;
    for (let u = 0; u < FACE_V.length; u++) {
        const c = new THREE.Vector3(...CENTERS[u]);
        const n = new THREE.Vector3(...NORMALS[u]);       // outward
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
        g.add(new THREE.Mesh(geo, stoneTex));
        triCount++;
    }
    console.log(`panels: ${triCount} stone triangle sails (ONE face family = ONE sail material — the face-transitivity read in the material law; each sail a parent wedding corner: one dec + one sq + one hex point; inset ${PLATE_INSET}m, reveal ${PLATE_BACK}m behind the rods) — probe T8: every plate vertex strictly inside the solid`);
}

// ---- brass glow beads at the twelve dec-rank crown-points (KEEP) — the icosa-vertex orbit ---------------
// Crown bead rides the finial stem (tret v2 occlusion law); the FOOT bead is
// pressed into the earth — fully buried in the dais band, never reads.
// The THIRTY sq-rank + TWENTY hex-rank points stay dark.
const glowGroup = new THREE.Group();
{
    const crownY = V[CROWN_IDX][1] + BEAD_POKE;
    // iron finial stem: crown plane → lifted bead center, on the axis
    const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(STEM_R, STEM_R, STEM_H, 8, 1), ironTex);
    stem.position.set(0, crownY + STEM_H / 2, 0);
    g.add(stem);
    for (const p of BEADS) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 10), glowMat);
        bead.position.set(p[0], p[1], p[2]);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_dtria_12";
    g.add(glowGroup);
    const footBeadY = (BEADS.find((b) => b[1] < PLINTH_H) ?? [0, 0, 0])[1];
    console.log(`beads: glow_dtria_12 — 12 brass dec-rank crown-points r${BEAD_R} (crown FINIAL on a ${STEM_R}m iron stem +${STEM_H}m; 10 waist poked +${BEAD_POKE}m radial in two exact 72° pentads, upper interleaved 36°; 1 pressed foot buried y ${footBeadY.toFixed(2)} in the dais band); sole night element — the parent's twelve decagon faces, lit as points; the 30 sq-rank + 20 hex-rank points stay dark`);
}

// ---- stone: the 120-sided dais -------------------------------------------------------------------------
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
    console.log(`dais: ${PLINTH_N}-gon R${PLINTH_R} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod), h${PLINTH_H} — one side per dual face, the theme number`);
}

// ---- census + envelope/NaN laws ------------------------------------------------------------------------
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
const merged = mergeByMaterial(g, "dtria");
writeFileSync("agents/arthur/assets/village_dtria3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_dtria3.glb`);
