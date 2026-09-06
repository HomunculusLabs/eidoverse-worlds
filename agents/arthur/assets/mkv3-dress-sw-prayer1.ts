// mkv3-dress-sw-prayer1.ts — dress-8, SW CONTEMPLATIVE prayer stones.
// Concept contract: on the SW approach corridor (az 232.725) past the raked
// gravel path (dress-4, ends r78.5), a devotional prayer-stone pile at the
// path's edge (r83, off -2.5 local z, the CW side away from terrace-0049).
// Walkers each add one water-smoothed stone before entering the labyrinth
// grounds: a broad LOW DOME of many rounded stones (accumulation of many
// hands), crowned by 2-3 pale "recently added" stones, with kicked strays
// and one flat BOWING stone at the foot facing the path. Distinct from
// dress-7's SE cairn (one tall deliberate column + quartz token = waymark):
// this is broad, low, accumulative, river-smooth — the contemplative
// district's tended idiom. Grounds USE: devotion/pause before the labyrinth.
// Static, unlit — spends no lamp budget (SW budget 3, used 0).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
// river-smoothed stone: lighter, glossier than the wild cairn's craggy rock
const RIVER = mat(0x9a968c, .7, 0);  // water-worn grey
const DARK  = mat(0x7d7a72, .75, 0); // base-course shadow stone
const PALE  = mat(0xe8e5de, .6, .02); // recent additions — pale, near-smooth
// (dress-8 v2: PALE 0xe0ddd6 -> 0xe8e5de, same value as the accepted cairn
// quartz which read clearly; second crown stone enlarged to match)

const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;

// rounded river stone: SUBDIVIDED dodecahedron (detail 1) reads water-smooth;
// gently squashed, LOW jitter (v1 judge: detail-0 facets read angular rock)
const rstone = (r: number, x: number, y: number, z: number, seed: number, m: THREE.Material) => {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), m);
    s.scale.set(1 + jit(seed) * 0.18, 0.72 + jit(seed + 5) * 0.1, 0.9 + jit(seed + 9) * 0.15);
    s.rotation.set(jit(seed + 13) * 0.25, jit(seed + 17) * 3.14, jit(seed + 23) * 0.2);
    s.position.set(x, y, z);
    g.add(s);
};

// broad dome pile: 3 shrinking rings + crown. Dome base r~0.9, height ~1.1.
// ring of 7 dark base stones (half-set)
for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + jit(31 + i) * 0.3;
    const rr = 0.78 + jit(37 + i) * 0.14;
    rstone(0.34 + jit(41 + i) * 0.07, Math.cos(a) * rr, 0.2, Math.sin(a) * rr, 11 + i * 7, DARK);
}
// ring of 6 river-grey stones
for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5 + jit(61 + i) * 0.3;
    const rr = 0.52 + jit(67 + i) * 0.1;
    rstone(0.3 + jit(71 + i) * 0.06, Math.cos(a) * rr, 0.52, Math.sin(a) * rr, 23 + i * 9, RIVER);
}
// ring of 4
for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.25 + jit(83 + i) * 0.3;
    rstone(0.25 + jit(89 + i) * 0.05, Math.cos(a) * 0.3, 0.8, Math.sin(a) * 0.3, 37 + i * 11, RIVER);
}
// crown: 2 pale recent additions + 1 grey — the "each walker adds one" read
// (v2: second pale stone enlarged 0.16 -> 0.19, sits clear of the first)
rstone(0.2, jit(97) * 0.08, 1.0, jit(99) * 0.08, 53, PALE);
rstone(0.19, 0.17 + jit(101) * 0.06, 1.12, jit(103) * 0.06, 59, PALE);
rstone(0.13, jit(105) * 0.06, 1.02, -0.17 + jit(107) * 0.06, 61, RIVER);

// kicked strays at the foot (chosen-but-not-yet-added stones)
// (v2: kicked further out — v1's second stray buried inside the dome
// silhouette; both now clear of the base ring r~0.85)
// (v3: second stray moved behind->right-front flank — at local z -0.78 it was
// occluded by the dome from every path-side view; now balanced L/R of the
// walking line, both visible from gameplay)
rstone(0.15, -1.28, 0.07, 0.52 + jit(111) * 0.12, 67, RIVER);
rstone(0.13, 1.06, 0.06, 0.6 + jit(113) * 0.12, 71, PALE);

// bowing stone: flat worn slab at the foot, facing the path (local +z side)
// (v3: nudged forward 1.18 -> 1.34, widened 0.72 -> 0.82 — gameplay judge's
// marginal-legibility note)
{
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.13, 0.46), RIVER);
    b.position.set(0.18, 0.065, 1.34);
    b.rotation.y = 0.12 + jit(121) * 0.1;
    b.rotation.z = jit(123) * 0.04;
    g.add(b);
}

mergeByMaterial(g, "dress_sw_prayer1");
writeFileSync("agents/arthur/assets/village_dress_sw_prayer1.glb", toGLB(g));
console.log("village_dress_sw_prayer1.glb —", g.children.length, "top-level nodes");
