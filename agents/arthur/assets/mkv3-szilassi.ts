// mkv3-szilassi.ts — STRUCTURES LANE struct-229, Round 11 commission R11-42
// THE SZILASSI POLYHEDRON — the Császár's dual: 14 vertices, 21 edges, SEVEN
// hexagonal faces, Euler 0. Every pair of faces shares exactly one edge
// (C(7,2)=21=E — complete face adjacency): seven cells, all neighbors.
//
// One idea: SEVEN CELLS, ALL NEIGHBORS. STONE carries the whole surface —
// all seven hexagonal membranes (the SKIN; the standing Császár 200m away
// is the theorem's SKELETON). IRON traces the 21 shared edges as seam rods
// — every place two cells touch, made visible. Brass glow lamps ride the
// outside of each face: a lamp in every room. Night contract: seven warm
// points mapping the seven cells. Shared dais language: the heptagonal
// plinth, the theorem's number, on both structures.
//
// Laws honored: texMat lanes (struct-38) — sz_stone/sz_iron; bead emissive
// 0x9a7030 @ 1.0 in-GLB (dusk lineage, struct-82); glow census exactly 1
// KEEP group (glow_sz_7); ROOT STAYS IDENTITY (struct-188) — positions are
// FINAL world-local (the probe's donut seating is the lift); envelope vs
// probe; NaN 0; geometry bases BAKED vertex-true (Box3 corner law,
// struct-227 self-catch — dodecahedron struct-106 chassis).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    V, LOOPS_EXPORT as LOOPS, EDGES, FACE_NORMALS, ENVELOPE, BEADS,
    PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H, PLATE_T, PLATE_INSET, ROD_R, BEAD_R,
} from "../struct229-probe-szilassi.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("sz_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 229 });
const ironTex = texMat("sz_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 24, seed: 43 });   // császár v3 bright lane — seams must survive 18m dark-ground contrast

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's donut seating already applied lift.

// rod from P to Q (heightSegments 2: a genuine mid ring rides every segment
// midpoint — the decode D3 coverage law is non-vacuous, struct-227 law).
// BAKE the transform INTO THE GEOMETRY (Box3 corner law, struct-227
// self-catch): a node-matrix-rotated cylinder's cached bounding-BOX corners
// overshoot an inclined rod's true verts by ~8mm — census must be vertex-true.
function rod(P: [number, number, number], Q: [number, number, number]): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const geo = new THREE.CylinderGeometry(ROD_R, ROD_R, len, 10, 2);
    const dir = B.clone().sub(A).normalize();
    const m4 = new THREE.Matrix4().makeRotationFromQuaternion(
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
    m4.setPosition(A.clone().add(B).multiplyScalar(0.5));
    geo.applyMatrix4(m4);
    return new THREE.Mesh(geo, ironTex);
}

// ---- iron: the 21 shared edges — the meeting-lines made visible ------------------------------------------
{
    for (const [i, j] of EDGES) g.add(rod(V[i], V[j]));
    console.log(`seams: ${EDGES.length} iron rods r${ROD_R} — every shared edge drawn: all 21 face pairs touching (probe T2)`);
}

// ---- stone: the seven hexagonal membranes ----------------------------------------------------------------
// Plate outer face flush with the face plane; seams (r${ROD_R}) ride proud.
// Bases BAKED into the geometry (Box3 corner law): thin steeply-oriented
// plates make cached-bounding-BOX corners fly ~2m below the true triangle.
{
    const RECESS = PLATE_T / 2;             // plate center this far INSIDE the face plane → outer face flush
    let plateCount = 0, skipped = 0;
    for (let fi = 0; fi < LOOPS.length; fi++) {
        const L = LOOPS[fi];
        const n = new THREE.Vector3(...FACE_NORMALS[fi]);
        // in-plane orthonormal basis: pick the world axis least aligned with n
        const ref = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const u = new THREE.Vector3().crossVectors(ref, n).normalize();
        const v = new THREE.Vector3().crossVectors(n, u);
        // centroid + inset vertices (shrink about the centroid by PLATE_INSET)
        const pts = L.map((i) => new THREE.Vector3(...V[i]));
        const ctr = new THREE.Vector3();
        for (const p of pts) ctr.add(p);
        ctr.multiplyScalar(1 / pts.length);
        const shrink = (p: THREE.Vector3) => {
            const d = p.clone().sub(ctr), l = d.length();
            return l <= PLATE_INSET ? null : p.clone().sub(d.multiplyScalar(PLATE_INSET / l));
        };
        const inset = pts.map(shrink);
        if (inset.some((p) => !p)) { skipped++; continue; }   // hex too small to plate at this inset — honest skip
        const shape = new THREE.Shape(inset.map((p) => {
            const d = p!.sub(ctr);
            return new THREE.Vector2(d.dot(u), d.dot(v));
        }));
        const geo = new THREE.ExtrudeGeometry(shape, { depth: PLATE_T, bevelEnabled: false });
        geo.translate(0, 0, -PLATE_T / 2);    // center on local z = 0
        // bake: local (x,y,z) → world ctr + u·x + v·y + n·z  (matrix = [u v n | ctr])
        const m4 = new THREE.Matrix4().makeBasis(u, v, n);
        m4.setPosition(ctr.clone().addScaledVector(n, -RECESS));
        geo.applyMatrix4(m4);
        g.add(new THREE.Mesh(geo, stoneTex));
        plateCount++;
    }
    if (skipped) throw Error(`${skipped} hexes skipped at inset ${PLATE_INSET} — probe T9 promised viability`);
    console.log(`membranes: ${plateCount} hexagonal stone plates inset ${PLATE_INSET}m, outer faces flush with the face planes, seams proud — the skin of the theorem`);
}

// ---- brass glow lamps: one per face, outside (KEEP) — the night stars ------------------------------------
const glowGroup = new THREE.Group();
{
    for (const b of BEADS) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 10), glowMat);
        bead.position.set(b[0], b[1], b[2]);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_sz_7";
    g.add(glowGroup);
    console.log(`lamps: glow_sz_7 — 7 brass stars r${BEAD_R} on the faces' outsides (a lamp in every cell); sole night element`);
}

// ---- stone: the heptagonal plinth (the shared dais language) ----------------------------------------------
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
    console.log(`plinth: heptagon R${PLINTH_R} (${PLINTH_N} sides — the theorem's number, shared with the Császár), h${PLINTH_H}; donut embedded 0.03m into its top`);
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
const merged = mergeByMaterial(g, "szilassi");
writeFileSync("agents/arthur/assets/village_szilassi3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_szilassi3.glb`);
