// mkv3-tetrahelix.ts — STRUCTURES LANE struct-233, Round 11 commission R11-46
// THE BOERDIJK–COXETER TETRAHELIX — twelve regular tetrahedra face-bonded
// into one chiral column (Boerdijk 1952; Coxeter 1970). Every edge exactly
// equal; every vertex on one cylinder of r = 3√3/10·S; each index step turns
// arccos(−2/3) and climbs 1/√10·S — the torsion IS the ornament.
//
// One idea: THE COLUMN THAT CLIMBS BY TWISTING. STONE carries the twelve
// tetrahedra (one merged bucket — the cells read through their strong
// face-normal contrast: dihedrals 70.5°/109.5°, no shared plane anywhere)
// and the SIX-sided dais (the tetrahedron's six edges made stone — the
// ssd/császár shared dais language). Night contract: fifteen warm beads at
// the vertex lattice (glow_thx_15) — a steep helix of lights, v0 set flush
// into the dais top, the summit bead cresting at 7.49m. Folly class.
//
// Laws honored: texMat lanes (struct-38); bead emissive 0x9a7030 @ 1.0
// in-GLB (dusk lineage, struct-82); glow census exactly 1 KEEP group;
// ROOT STAYS IDENTITY (struct-188) — probe V are FINAL world-local;
// flat facets via non-indexed geometry (per-face normals); NaN 0;
// below-grade 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import { V, ENVELOPE, BEAD_R, PLINTH_R, PLINTH_N, PLINTH_ROT, PLINTH_H, BOSS_R, BOSS_H, LIFT2, CELLS, SCALE } from "../struct233-probe-tetrahelix.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("thx_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 233 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188): every position below is FINAL world-local.

// ---- stone: the twelve tetrahedra (flat-faceted, one bucket) ------------------------------------------------
{
    const tris: number[] = [];
    // cell k = (V[k], V[k+1], V[k+2], V[k+3]); each face wound OUTWARD by
    // construction against the cell centroid (robust to the recurrence's
    // orientation flips — no parity guess).
    for (let k = 0; k < CELLS; k++) {
        const vs = [V[k], V[k + 1], V[k + 2], V[k + 3]];
        const cen: [number, number, number] = [0, 0, 0];
        for (const p of vs) for (let m = 0; m < 3; m++) cen[m] += p[m] / 4;
        const faces: [number[], number[], number[], number[]] = [
            [vs[0], vs[1], vs[2]], [vs[0], vs[1], vs[3]], [vs[0], vs[2], vs[3]], [vs[1], vs[2], vs[3]],
        ];
        for (const [p, q, r] of faces) {
            const u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
            const w = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
            const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
            const fc = [(p[0] + q[0] + r[0]) / 3, (p[1] + q[1] + r[1]) / 3, (p[2] + q[2] + r[2]) / 3];
            const outward = (fc[0] - cen[0]) * n[0] + (fc[1] - cen[1]) * n[1] + (fc[2] - cen[2]) * n[2];
            const tri = outward >= 0 ? [p, q, r] : [p, r, q];
            for (const t of tri) tris.push(t[0], t[1], t[2]);
        }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(tris, 3));
    geo.computeVertexNormals();             // non-indexed → per-face flat normals
    g.add(new THREE.Mesh(geo, stoneTex));
    console.log(`column: ${CELLS} stone tetrahedra (${tris.length / 9} flat triangles), edge ${(SCALE).toFixed(2)}m — cells read through face-normal contrast, dihedrals 70.5°/109.5°`);
}

// ---- brass glow beads at the 15 lattice vertices (KEEP) — the helix of lights --------------------------------
const glowGroup = new THREE.Group();
{
    for (let i = 0; i < V.length; i++) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 10), glowMat);
        bead.position.set(V[i][0], V[i][1], V[i][2]);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_thx_15";
    g.add(glowGroup);
    console.log(`beads: glow_thx_15 — 15 brass lattice points r${BEAD_R} (v0 set flush in the dais top, summit cresting ${(V[V.length - 1][1] + BEAD_R).toFixed(2)}m); sole night element`);
}

// ---- stone: the hexagonal dais -------------------------------------------------------------------------------
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
    console.log(`dais: hexagon R${PLINTH_R} (${PLINTH_N} sides — the tetrahedron's six edges), h${PLINTH_H}`);
}

// ---- stone: the hexagonal boss socket (v2 grounding fix — judge-directed) --------------------------------------
// Same stone bucket, same PLINTH_ROT phase as the dais (aligned hexagons).
// The column's v0 rides LIFT2 = 0.35m inside the boss: the three v0-edges
// emerge from the stone like the orrery's cradle. BOSS_R 1.15 > max bead
// reach 0.92 → no column part clips the boss walls from outside.
{
    const shape = new THREE.Shape();
    for (let i = 0; i < PLINTH_N; i++) {
        const a = PLINTH_ROT + (i / PLINTH_N) * Math.PI * 2;
        const x = BOSS_R * Math.cos(a), y = BOSS_R * Math.sin(a);
        if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: BOSS_H, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, PLINTH_H, 0);            // sits on the dais top
    const boss = new THREE.Mesh(geo, stoneTex);
    g.add(boss);
    console.log(`boss: hexagon R${BOSS_R} socket h${BOSS_H} on the dais top — v0 buried ${LIFT2}m, the three first edges grow out of the stone (orrery-cradle lineage)`);
}

// ---- census + envelope/NaN laws ---------------------------------------------------------------------------------
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
const merged = mergeByMaterial(g, "thx");
writeFileSync("agents/arthur/assets/village_tetrahelix3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_tetrahelix3.glb`);
