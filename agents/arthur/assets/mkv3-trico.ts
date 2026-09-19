// mkv3-trico.ts — STRUCTURES LANE struct-259, Round 11 commission R11-67.
// THE TRUNCATED ICOSIDODECAHEDRON (great rhombicosidodecahedron).
// The ARCHIMEDEAN branch's TENTH member (cubocta struct-237, tico 243,
// toct 245, tret 247, tcube 249, tdodec 251/252, srcubo 253/254,
// trcubo 255/256, rico 257/258).
//
// ONE IDEA: THE KNIFE MEETS THE GOLDEN PARENT. The eighth member cut the
// CUBE; the tenth turns the same knife on the DODECAHEDRON — the Conway
// CANTITRUNCATE (bevel): every parent FACE stays in its own plane, cut at
// the corners AND the edges, a DECAGON (12); every parent EDGE bevels into
// a SQUARE (30); every parent VERTEX blooms into a HEXAGON (20).
// 12+30+20 = 62 — the parent's F+E+V, the SAME census the rico told by
// GROWING. The two cut depths are NEWTON-SOLVED so all 180 edges come out
// EXACTLY equal (probe T2: 12 REGULAR decagons — the uniform solid the
// tdodec's 1/3-cut declined; bevel w = 0.2, vertex cut u = 0.428187 in
// the parent edge-2 frame; residuals < 1e-12).
// Presentation: DECAGON-DOWN, 5-fold (family seat law) — the parent's own
// face, now a decagon, FLAT on the dais; lower-ring decagon snapped
// dead-on +X. STONE carries the FORTY-TWO dodeca-census faces (12
// parent-face decagons + 30 edge-bevel squares) + the SIXTY-TWO-sided
// dais (one side per face — theme-number law); IRON carries the TWENTY
// corner HEXAGONS (the bloomed parent vertices, dark) + all 180 seam
// bonds. Night contract: TWELVE warm brass beads at the twelve
// parent-face decagon centers — the dodeca's faces, lit (srcubo/trcubo/
// rico pattern, pentagon family): one CROWN on an iron finial stem
// (tret v2 occlusion law, clearance 0.992) + TEN WAIST in two exact 72°
// rings (upper ring interleaved at 36°, geometry-decided) + the TWELFTH
// PRESSED INTO THE EARTH beneath the flat foot (tico's-twelfth idiom —
// eleven read at night, twelve in truth, disclosed). The thirty squares
// and the twenty hexagons stay dark.
//
// Laws honored: texMat lanes (struct-38) — trico_stone/trico_iron; bead
// emissive 0x9a7030 @ 1.4 in-GLB (tico v2 + toct + tret + tcube + tdodec
// + srcubo + trcubo + rico build-time law); glow census exactly 1 KEEP
// group (glow_trico_12); ROOT STAYS IDENTITY (struct-188); plate basis
// BAKED INTO GEOMETRY (applyMatrix4); NaN 0; below-grade 0; dais
// APOTHEM-FIRST (struct-247).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    V, E, FACE_V, CENTERS, NORMALS, ENVELOPE,
    ROD_R, BEAD_R, BEAD_POKE, STEM_H, STEM_R, FOOT_BEAD_Y,
    PLATE_T, PLATE_INSET, PLATE_BACK,
    PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H,
} from "../struct259-probe-trico.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("trico_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 14, seed: 259 });
const ironTex = texMat("trico_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 12, seed: 260 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.4;      // tico v2 / toct / tret / tcube / tdodec / srcubo / trcubo / rico build-time law: face-center beads sit at exposure threshold at 1.0; +40% clears oblique reads without bloom
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188): every position below is FINAL world-local.

// is this face one of the twelve parent-face decagons? (squares + hexagons are the belts/corners)
const isDecFace = (u: number) => FACE_V[u].length === 10;

// rod from P to Q (heightSegments 2: mid-ring verts exist for the decode coverage law)
function rod(P: [number, number, number], Q: [number, number, number]): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(ROD_R, ROD_R, len, 10, 2), ironTex);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    return m;
}

// ---- iron: the one-hundred-eighty seam bonds ------------------------------------------------------------
{
    for (const [i, j] of E) g.add(rod(V[i], V[j]));
    console.log(`seams: ${E.length} iron rods r${ROD_R} — every bond joins two families (probe T5: zero dec–dec, zero sq–sq, zero hex–hex edges)`);
}

// ---- panels: 20 iron hexagons (the bloomed corners) + 42 stone FACE/EDGE faces (baked basis) ------------
{
    // plate mid-plane sits ROD_R − PLATE_BACK − PLATE_T/2 along the OUTWARD
    // normal: outer face PLATE_BACK behind the rods' outer surface (shadow gap).
    const sSide = ROD_R - PLATE_BACK - PLATE_T / 2;
    let hexCount = 0, decSqCount = 0;
    for (let u = 0; u < FACE_V.length; u++) {
        const c = new THREE.Vector3(...CENTERS[u]);
        const n = new THREE.Vector3(...NORMALS[u]);       // outward
        const mat = isDecFace(u) ? stoneTex : (FACE_V[u].length === 4 ? stoneTex : ironTex);   // decagons+squares stone; hexagons iron
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
        if (FACE_V[u].length === 6) hexCount++; else decSqCount++;
    }
    console.log(`panels: ${hexCount} iron hexagons (the bloomed parent vertices, dark) + ${decSqCount} stone FACE/EDGE faces (12 parent-face decagons UNMOVED in their own planes + 30 edge-bevel squares, on the cantitruncate's own solved planes; inset ${PLATE_INSET}m, reveal ${PLATE_BACK}m behind the rods) — probe T8: every plate vertex strictly inside the solid; the FOOT decagon plate rides the dais band`);
}

// ---- brass glow beads at the twelve parent-face decagons (KEEP) — the dodeca's faces, lit ---------------
// Crown bead rides the finial stem (tret v2 occlusion law); the FOOT bead
// is pressed into the earth — fully buried in the dais band, never reads.
// The THIRTY squares + TWENTY hexagons stay dark: only the dodeca's own
// faces carry light.
const glowGroup = new THREE.Group();
{
    let crownDone = false;
    let beadCount = 0;
    for (let u = 0; u < FACE_V.length; u++) {
        if (!isDecFace(u)) continue;                     // squares + hexagons stay dark
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
            // foot: the twelfth bead pressed into the earth — buried in the dais band
            bead.position.set(0, FOOT_BEAD_Y, 0);
        } else {
            bead.position.set(
                CENTERS[u][0] + NORMALS[u][0] * BEAD_POKE,
                CENTERS[u][1] + NORMALS[u][1] * BEAD_POKE,
                CENTERS[u][2] + NORMALS[u][2] * BEAD_POKE);
        }
        glowGroup.add(bead);
        beadCount++;
    }
    if (beadCount !== 12) throw Error(`beads ${beadCount} != 12`);
    glowGroup.name = "glow_trico_12";
    g.add(glowGroup);
    console.log(`beads: glow_trico_12 — 12 brass parent-decagon centers r${BEAD_R} (crown FINIAL on a ${STEM_R}m iron stem +${STEM_H}m; 10 waist poked +${BEAD_POKE}m in two exact 72° rings, upper interleaved 36°; 1 pressed foot buried y ${FOOT_BEAD_Y} in the dais band); sole night element — the dodeca's twelve faces, lit; the 30 squares + 20 hexagons stay dark`);
}

// ---- stone: the 62-sided dais --------------------------------------------------------------------------
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
    console.log(`dais: ${PLINTH_N}-gon R${PLINTH_R} APOTHEM-FIRST (apothem ${(PLINTH_R * Math.cos(Math.PI / PLINTH_N)).toFixed(3)} ≥ reach+rod), h${PLINTH_H} — one side per face, 12 decagons + 30 squares + 20 hexagons`);
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
const merged = mergeByMaterial(g, "trico");
writeFileSync("agents/arthur/assets/village_trico3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_trico3.glb`);
