// mkv3-dress-se-cairn1.ts — dress-7, SE WILD cairn marker (wild-threshold waymark).
// Concept contract: on the az-315 visitor corridor, PAST the dress-3 border
// stones, a single deliberately-stacked dry-stone cairn at the threshold where
// the tended edge gives way to the forest belt — the walker-built trail marker
// that says "the path continues here". Distinct from dress-3's field-clearing
// piles (low, plural, messy): ONE tall tapered column, 5 stones + a 6th pale
// quartz token cap (the "added by the last walker" human mark that reads at
// distance), seated on a wide rough base slab, one moss-flecked course, a
// couple of kicked stray stones at the foot (the ground's own stone cleared
// aside). Grounds USE: wayfinding at the wild margin. Static, unlit — spends
// no lamp budget (SE budget 8, used 0).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const ROCK = mat(0x8c887e, .95, 0);   // palette rock
const MOSS = mat(0x6a7a4a, .95, 0);   // palette moss/lichen fleck
const QUARTZ = mat(0xe8e5de, .55, .05); // pale quartz token — smooth, slightly glossy

const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;

// irregular stone: dodecahedron squashed + jittered (dress-3 idiom)
const stone = (r: number, x: number, y: number, z: number, seed: number, m: THREE.Material) => {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), m);
    s.scale.set(1 + jit(seed) * 0.35, 0.55 + jit(seed + 5) * 0.15, 0.8 + jit(seed + 9) * 0.3);
    s.rotation.set(jit(seed + 13) * 0.5, jit(seed + 17) * 3.14, jit(seed + 23) * 0.4);
    s.position.set(x, y, z);
    g.add(s);
};

// base slab: wide, rough, half-set — the prepared footing
stone(0.62, jit(3) * 0.06, 0.26, jit(7) * 0.06, 11, ROCK);

// five stacked courses, tapering. Each stone's center sits so it VISIBLY
// overhangs the course below on one side (dry-stacked read): course radius
// shrinks 0.52 -> 0.20; offset each course a deterministic ~0.07m drift.
const radii = [0.52, 0.44, 0.36, 0.28, 0.20];
const cy = [0.62, 1.02, 1.37, 1.67, 1.93];
for (let i = 0; i < 5; i++) {
    const drift = jit(101 + i * 31) * 0.14; // deliberate cant/offset per course
    stone(radii[i], drift * (1 - i * 0.12), cy[i], jit(103 + i * 17) * 0.1,
        17 + i * 13, i === 2 ? MOSS : ROCK); // course 3 moss-flecked for age
}
// 6th pale quartz token cap — the human "I was here" mark
// (r bumped 0.14->0.17, one value whiter: both judges' margin note, waysign-6 v5 precedent)
stone(0.17, jit(107) * 0.1, 2.24, jit(109) * 0.1, 91, QUARTZ);

// two kicked stray stones at the foot (walked-past read, asymmetric side)
stone(0.17, 0.85, 0.08, -0.42 + jit(113) * 0.15, 57, ROCK);
stone(0.13, 0.66, 0.06, 0.55 + jit(117) * 0.15, 59, ROCK);

mergeByMaterial(g, "dress_se_cairn1");
writeFileSync("agents/arthur/assets/village_dress_se_cairn1.glb", toGLB(g));
console.log("village_dress_se_cairn1.glb —", g.children.length, "nodes");
