// mkv3-menger.ts — STRUCTURES LANE struct-178, Round 11 commission R11-11
// THE MENGER SPONGE: the solid that is mostly hole.
//
// ONE IDEA: THE CUBE THAT EATS ITSELF. Menger 1926 — the canonical set of
// dimension strictly between 2 and 3 (log20/log3 = 2.7268), sibling of
// Cantor's set and Sierpiński's carpet. Iteration 2, exact integer
// construction: subdivide into 3x3x3, keep the 20 cells with at most one
// middle coordinate, recurse — 400 stone cubes of 729 survive. Every face
// IS a Sierpiński carpet (the village's R10-4 simplex and R10-3 curve now
// have their cubic sibling — the fractal trinity named at struct-100 NEXT
// and preserved by struct-176's selection). Three square tunnels cross at
// the heart; a single brass ember floats in the central void, seen only
// through the tunnel mouths (polish-278 / clebsch Eckardt lineage).
//
// KIN CHECK (elevates, never competes): sierpinski spire owns the SIMPLEX
// fractal (tetrahedron, read as mountain); kochgarden owns the planar
// CURVE (border). The sponge owns the CUBIC VOLUME — no standing form is a
// 3D-grid fractal (ledger grep menger: only the two candidate-name lines).
// Honeycomb screen (R10-1) is a tessellation WALL; this is a solid-with-
// voids you can see straight through in three directions.
//
// MATH (all machine-checked in struct178-probe-menger.ts, ALL CHECKS PASS
// exit 0 first try — constructive arithmetic, nothing transcribed):
//   20 kept cells/level, 400 at i2; 3 axis tunnels void at both scales;
//   all 6 face projections == carpet i2 (64 squares); symmetry under the
//   octahedral generators exact; dimension 2.726833.
//
// WORLD MAP: side 5.20 m on a stone slab 5.76 x 0.14 (gyroid/clebsch mount
// class); sponge bottom kisses slab top; heart bead r 0.09 in the central
// void (0.289 m clear to every tunnel wall — probe C8). Envelope
// 5.76 x 5.34 x 5.76, symmetric, origin-centered (origin-centered SAT
// lawful). Folly class, no walk owed (catalan/clebsch precedent).
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) — mg_stone
// scale 2 (mottled coursing, the curvature/lattice cue); bead emissive
// 0x9a7030 @ 1.0 in-GLB (dusk lineage, no light entity); glow census
// exactly 1 KEEP (glow_mg_1); NaN 0; nodes 1 bucket + 1 KEEP = 2.
// Deterministic: pure integer geometry + seeded texMat only.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const SIDE = 5.20;                       // sponge side, metres
const SLAB_H = 0.14, SLAB_W = SIDE + 0.56;
const CELL = SIDE / 9;
const BASE = SLAB_H;                     // sponge bottom kisses slab top

// ---- the construction (literal recursion, probe-verified) -------------------------------------------
const keepL1 = (i: number, j: number, k: number) =>
    (i === 1 ? 1 : 0) + (j === 1 ? 1 : 0) + (k === 1 ? 1 : 0) <= 1;
const digit = (n: number, level: 0 | 1): number => Math.floor(n / 3 ** (1 - level)) % 3;

const kept: Array<[number, number, number]> = [];
for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) for (let k = 0; k < 9; k++) {
    // world axes: i -> x, k -> z (plan), j -> y (up) — the sky shaft is the
    // (·,4,4)-class vertical tunnel; all three tunnels read from approach.
    if (keepL1(digit(i, 0), digit(j, 0), digit(k, 0)) && keepL1(digit(i, 1), digit(j, 1), digit(k, 1)))
        kept.push([i, j, k]);
}
if (kept.length !== 400) throw Error(`cell census ${kept.length} != 400`);

// ---- materials --------------------------------------------------------------------------------------
// cell 32 = the sierpinski/koch stone-fractal mottle calibration (v1 judged
// "flat clay" without it: per-pixel grain averages out at 18m; cell-32 blocks
// are the readable mottle). Tones stay the warm avenue-stone family
// (clebsch cb_stone / catalan ca_stone) — this form sits beside them.
const stoneTex = texMat("mg_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 9641 });

// ---- build ------------------------------------------------------------------------------------------
const g = new THREE.Group();
{
    const box = new THREE.BoxGeometry(CELL, CELL, CELL);
    for (const [i, j, k] of kept) {
        const m = new THREE.Mesh(box, stoneTex);
        m.position.set((i + 0.5) * CELL - SIDE / 2, BASE + (j + 0.5) * CELL, (k + 0.5) * CELL - SIDE / 2);
        g.add(m);
    }
    console.log(`sponge: ${kept.length} stone cubes, cell ${(CELL * 1000).toFixed(1)}mm, side ${SIDE}m`);
}

// ---- the heart bead (glow KEEP, central void) --------------------------------------------------------
const glowMeshes: THREE.Mesh[] = [];
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, BASE + SIDE / 2, 0);        // exact center of the void
    bead.name = "glow_mg_1";
    glowMeshes.push(bead);
    g.add(bead);
    // containment assert (probe C8 re-run at build time)
    const d = SIDE / 2 - 4 * CELL;
    if (kept.some(c => c[0] === 4 && c[1] === 4 && c[2] === 4)) throw Error("heart cell (4,4,4) is solid");
    if (d < 0.09 + 0.15) throw Error(`heart bead clearance ${d} too tight`);
    console.log(`heart bead: r 0.09 at the exact center, ${d.toFixed(4)}m clear to every tunnel wall`);
}

// ---- stone slab (gyroid mount class) -----------------------------------------------------------------
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(SLAB_W, SLAB_H, SLAB_W), stoneTex);
    slab.position.set(0, SLAB_H / 2, 0);
    g.add(slab);
    console.log(`slab: stone ${SLAB_W.toFixed(2)}x${SLAB_W.toFixed(2)} h ${SLAB_H}; sponge bottom kisses slab top at y ${BASE}`);
}

// ---- census + envelope/NaN laws ---------------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(sz.x - SLAB_W) > 0.02 || Math.abs(sz.z - SLAB_W) > 0.02) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != slab ${SLAB_W.toFixed(2)}x${SLAB_W.toFixed(2)}`);
    const expectedH = SLAB_H + SIDE;
    if (Math.abs(sz.y - expectedH) > 0.05) throw Error(`height ${sz.y.toFixed(3)} != ${expectedH.toFixed(3)}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o) => (o as THREE.Mesh).isMesh).length;
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], pre-merge meshes ${meshes}, 1 glow KEEP`);
}

const merged = mergeByMaterial(g, "menger");
writeFileSync("agents/arthur/assets/village_menger3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_menger3.glb`);
