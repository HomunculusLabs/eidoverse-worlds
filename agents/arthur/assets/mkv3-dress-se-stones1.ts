// mkv3-dress-se-stones1.ts — dress-3, SE WILD border stones (field-clearing piles).
// Concept contract: the SE visitor corridor (az 315, the h2→h3→h6 artwalk axis)
// runs out past the last art work into the forest belt. Where the tended edge
// gives way to deep wild, the walker finds stones cleared from the path and
// stacked in small piles at its edge — the district is tended at its margins,
// wild at its core. Grounds USE: path maintenance, boundary marking.
// Five piles at 1.9m spacing along local +x (run follows the corridor dir),
// each pile 2 base stones + 1 capstone, deterministic jitter, moss-fleck
// second material for age. Static, unlit — spends no lamp budget (SE budget 0).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const ROCK = mat(0x8c887e, .95, 0);   // palette rock
const MOSS = mat(0x6a7a4a, .95, 0);   // palette moss/lichen fleck

const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;

// one stone: irregular dodecahedron squashed + jittered
const stone = (r: number, x: number, y: number, z: number, seed: number, m: THREE.Material) => {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), m);
    s.scale.set(1 + jit(seed) * 0.35, 0.55 + jit(seed + 5) * 0.15, 0.8 + jit(seed + 9) * 0.3);
    s.rotation.set(jit(seed + 13) * 0.5, jit(seed + 17) * 3.14, jit(seed + 23) * 0.4);
    s.position.set(x, y, z);
    g.add(s);
};

// five piles along local +x, base spacing 1.9m with ±0.22m jitter (v2:
// monotony fix — reviewer flagged uniform rhythm); every 3rd pile + the
// tall pile get the moss cap; pile 4 carries a second capstone (one tall
// landmark); center pile's base widened (compact-lump fix)
for (let i = 0; i < 5; i++) {
    const px = (i - 2) * 1.9 + jit(97 + i * 13) * 0.44;
    const seed = 31 + i * 7;
    const jx = jit(seed) * 0.22, jz = jit(seed + 3) * 0.3; // pile-center jitter
    const wide = i === 2 ? 1.25 : 1.0; // center pile: wider base silhouette
    // base pair: two stones side by side, long axis across the run
    const r1 = 0.34 + jit(seed + 1) * 0.10 + (i === 4 ? 0.06 : 0);
    const r2 = 0.30 + jit(seed + 2) * 0.10;
    stone(r1, px + jx - 0.28 * wide + jit(seed + 4) * 0.08, r1 * 0.5, jz + jit(seed + 6) * 0.12, seed * 2, ROCK);
    stone(r2, px + jx + 0.30 * wide + jit(seed + 5) * 0.08, r2 * 0.5, jz + 0.22 + jit(seed + 7) * 0.12, seed * 2 + 1, ROCK);
    // capstone (moss on piles 0, 3, 4)
    const rc = 0.26 + jit(seed + 8) * 0.06;
    const moss = i % 3 === 0 || i === 4;
    stone(rc, px + jx + jit(seed + 9) * 0.14, r1 * 0.5 + rc * 0.42, jz + 0.08, seed * 2 + 2, moss ? MOSS : ROCK);
    // tall pile 4: second capstone (the run's landmark)
    if (i === 4) stone(rc * 0.8, px + jx + jit(seed + 15) * 0.1, r1 * 0.5 + rc * 0.42 + rc * 0.62, jz + 0.02, seed * 2 + 3, MOSS);
    // one loose half-buried kicked stone at the pile foot (reads walked-past)
    if (i % 2 === 1) stone(0.16, px + 0.75 + jit(seed + 11) * 0.2, 0.07, jz - 0.45 + jit(seed + 12) * 0.2, seed * 3, ROCK);
}

mergeByMaterial(g, "dress_se_stones1");
writeFileSync("agents/arthur/assets/village_dress_se_stones1.glb", toGLB(g));
console.log("village_dress_se_stones1.glb —", g.children.length, "nodes");
