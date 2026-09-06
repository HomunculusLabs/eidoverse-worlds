// mkv3-dress-se-cairn1.ts — dress-7, SE WILD cairn marker (wild-threshold waymark).
// Concept contract: on the az-315 visitor corridor, PAST the dress-3 border
// stones, a single deliberately-stacked dry-stone cairn at the threshold where
// the tended edge gives way to the forest belt — the walker-built trail marker
// that says "the path continues here". Distinct from dress-3's field-clearing
// piles (low, plural, messy): ONE squat stacked column reading wider-than-
// tall mass (dress-15: row-32 native re-judgment corrected the original
// "tall tapered" intent — a 2:1 tall:thin read is a totem, not a cairn),
// 5 stones + a 6th pale quartz token cap (the "added by the last walker" human mark that reads at
// distance), seated on a wide rough base slab, one moss-flecked course, a
// couple of kicked stray stones at the foot (the ground's own stone cleared
// aside). Grounds USE: wayfinding at the wild margin. Static, unlit — spends
// no lamp budget (SE budget 8, used 0).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
// dress-15 (improve shard row 32): per-stone value banding — the fallback
// judge's "uniform near-black" was REAL (pixel histogram: subject 90%+ below
// lum 72 at 18m; 5 of 7 stones shared one material). Per-course materials:
const ROCK = mat(0x8c887e, .95, 0);   // palette rock (base + courses 1,5)
const ROCK2 = mat(0x6f6a60, .95, 0);  // mid-dark course 2 — the value step
const ROCK3 = mat(0xa39f93, .95, 0);  // warm lighter course 4 — second step
const QUARTZ = mat(0xf4f1e8, .55, .05); // pale quartz token — brighter, reads against sky
const MOSS = mat(0x6a7a4a, .95, 0);   // palette moss/lichen fleck (course 3)

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
// dress-15: squat rebalance — mass along the height, not top-heavy-thin.
// Old: radii 0.52->0.20 at y 0.62->1.93 (aggressive taper; native re-judgment:
// upper 2/3 read 3-4x taller than wide at 18m = totem, not cairn). New:
// wider upper courses + tighter y stacking; total height ~2.32 unchanged so
// the placed pose/tuple contract needs no re-siting on re-place.
const radii = [0.62, 0.56, 0.50, 0.42, 0.36];
const cy = [0.52, 0.90, 1.28, 1.64, 2.02];
const courseMat = [ROCK, ROCK2, MOSS, ROCK3, ROCK];
// dress-15 v3: SQUAT law — v2's 5-stone column still read 2:1 tall:wide at
// 18m (native re-judgment: "spindly totem, thin upper stack dominates").
// Real cairn proportions: mass near the ground, upper courses STEP IN
// HORIZONTALLY less aggressively so the silhouette carries width
// height-long, taper only at the cap. Width growth ~+0.06m per course
// keeps the seam reads intact while the whole becomes wider feeling.
for (let i = 0; i < 5; i++) {
    const drift = jit(101 + i * 31) * 0.14; // deliberate cant/offset per course
    stone(radii[i], drift * (1 - i * 0.12), cy[i], jit(103 + i * 17) * 0.1,
        17 + i * 13, courseMat[i]); // per-course value banding; course 3 moss
}
// 6th pale quartz token cap — the human "I was here" mark.
// dress-15 v4: cap r 0.26 seated tight ON the crown. The v3 strap stones
// were REMOVED — invisible at 18m, ambiguous sunlit-facet read at close
// range (native judgment both distances); the moss + warm-light courses
// already carry mid-height tonal interest. Quiet cairn, one pale mark.
stone(0.26, jit(107) * 0.1, 2.18, jit(109) * 0.1, 91, QUARTZ);
// dress-15 v3: base skirt — three flat half-set ground stones ringing the
// foot. Reads "stacked on prepared ground" at distance, adds squat mass
// low, and makes the two walked-past strays read as part of the same act.
stone(0.30, 0.62, 0.10, 0.30, 41, ROCK);
stone(0.26, -0.66, 0.08, 0.24, 43, ROCK);
stone(0.24, 0.05, 0.07, -0.64, 46, ROCK);

// two kicked stray stones at the foot (walked-past read, asymmetric side)
stone(0.17, 0.85, 0.08, -0.42 + jit(113) * 0.15, 57, ROCK);
stone(0.13, 0.66, 0.06, 0.55 + jit(117) * 0.15, 59, ROCK);

mergeByMaterial(g, "dress_se_cairn1");
writeFileSync("agents/arthur/assets/village_dress_se_cairn1.glb", toGLB(g));
console.log("village_dress_se_cairn1.glb —", g.children.length, "nodes");
