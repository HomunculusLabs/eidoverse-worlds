// mkv3-tribar.ts — STRUCTURES LANE struct-184, Round 11 commission R11-14
// THE TRIBAR: Penrose's impossible triangle, closed by one vantage.
//
// ONE IDEA: A TRIANGLE THAT CANNOT EXIST — and does, from exactly one eye.
// Two true edges of an exact equilateral triangle (side 3.2) stand in the
// frontoparallel plane; the third beam's far end is aimed EXACTLY at the
// design eye E=(0,1.65,18) — the lane's standard 18m gameplay frame — so
// from E (and only E) the figure closes into the Penrose tribar. Step off
// the eye line and it opens: the reveal IS the monument.
//
// v1 (honest cube-edge construction, orthographic closure at 1e-16) was
// REJECTED by judgment — parallax opens any orthographic closure ~15px at
// finite distance ("no camera position will close this figure"). v2 solves
// the closure FOR the eye: Q1 = E + 1.06·(Q4−E), hidden behind the Q4
// corner cube (angular cover margin +14.2%, probe L3). Penrose & Penrose
// 1958; Escher Waterfall kin; Dürer→Penrose lineage after melencolia.
//
// WORLD MAP (probe contract — ONE contract, imported): Q2/Q3/Q4 exact
// equilateral in plane z=0; beams B (Q2→Q3), C (Q3→Q4) true in-plane; beam
// A Q2→Q1 on the eye-line; cubes 0.64 at Q2/Q3/Q4; pad at origin under all
// (cubes sink 0.11 into its top); bead at the in-plane centroid. Envelope
// 4.22×3.54×2.01 y[0,3.54] origin-centered. Folly class — no walk owed.
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) — tribar_
// stone cell 32; bead emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage, no
// light entity); glow census exactly 1 KEEP (glow_tb_1); NaN 0; nodes 2.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    BEAM_W, CUBE_S, BEAD_R, PAD_H, PAD_SX, PAD_SZ,
    Q1c, Q2c, Q3c, Q4c, BEAD_C, SHIFT_X, SHIFT_Z, ENVELOPE,
} from "../struct184-probe-tribar.ts";

// ---- materials ---------------------------------------------------------------------------------------
const stoneTex = texMat("tribar_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 1958 });
const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();

// oriented square beam between p and q (final-frame points), end faces
// EXACTLY at p and q (length |pq| — the corner cubes cover the joints;
// self-catch: a +w cap length drifted the envelope 0.40m off-contract,
// caught by the mk's own envelope law before any write).
const bakeBetween = (p: THREE.Vector3, q: THREE.Vector3, w: number) => {
    const dir = q.clone().sub(p);
    const geo = new THREE.BoxGeometry(w, dir.length(), w);
    const rot = new THREE.Matrix4().makeRotationFromQuaternion(
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
    geo.applyMatrix4(rot);
    geo.translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2);
    geo.translate(SHIFT_X, 0, SHIFT_Z);
    return geo;
};

let stoneMeshes = 0;
{
    // the three beams — A carries the eye-line secret (Q2→Q1); bake applies
    // the centering shifts ONCE (construction points in, final frame out —
    // self-catch: feeding final-frame points double-shifted, envelope +0.37m)
    g.add(new THREE.Mesh(bakeBetween(Q2c, Q1c, BEAM_W), stoneTex)); stoneMeshes++;
    g.add(new THREE.Mesh(bakeBetween(Q2c, Q3c, BEAM_W), stoneTex)); stoneMeshes++;
    g.add(new THREE.Mesh(bakeBetween(Q3c, Q4c, BEAM_W), stoneTex)); stoneMeshes++;
    // corner cubes at the joints (the Q4 cube hides beam A's aimed end)
    for (const p of [Q2c, Q3c, Q4c]) {
        const geo = new THREE.BoxGeometry(CUBE_S, CUBE_S, CUBE_S);
        geo.translate(p.x + SHIFT_X, p.y, p.z + SHIFT_Z);
        g.add(new THREE.Mesh(geo, stoneTex)); stoneMeshes++;
    }
    // runner pad (final frame: origin-centered, top at PAD_H)
    const pad = new THREE.Mesh(new THREE.BoxGeometry(PAD_SX, PAD_H, PAD_SZ), stoneTex);
    pad.position.set(0, PAD_H / 2, 0);
    g.add(pad); stoneMeshes++;
    if (stoneMeshes !== 7) throw Error(`stone census ${stoneMeshes} != 7`);
    console.log(`members: 3 beams (A eye-line, B, C) + 3 cubes + pad (${stoneMeshes} stone meshes)`);
}

// ---- the centroid bead — sole glow, KEEP ------------------------------------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.copy(BEAD_C);
    glowGroup.add(bead);
    glowGroup.name = "glow_tb_1";
    g.add(glowGroup);
}
console.log(`bead: glow_tb_1 at in-plane centroid (${BEAD_C.x.toFixed(3)}, ${BEAD_C.y.toFixed(3)}, ${BEAD_C.z.toFixed(3)})`);

// ---- census + envelope/NaN laws -------------------------------------------------------------------------
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

const merged = mergeByMaterial(g, "tribar");
writeFileSync("agents/arthur/assets/village_tribar3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_tribar3.glb`);
