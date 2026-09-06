// mkv3-dress-ne-bench1.ts — dress-6, NE CRAFT stone benches (workers' rest cluster).
// Concept contract: the NE approach lane ends (terminus 18.62,70.02) where the
// pavers give way to the art field. Just past that hand-off, on the plaza-ward
// side of the walker's line, a cluster of split-stone benches and a low table
// stone grounds the craft district's use: craftspeople rest here between
// tasks, set down tea and tools, before walking the field. Grounds USE:
// rest + setting-down at the lane→field threshold. Static, unlit — spends
// no lamp budget (NE budget 10, used 0).
// Palette: palette rock (0x8c887e), light stone plinth family (0xb4b0a4 —
// dress-5 accepted value), moss fleck (0x6a7a4a). Knee-height: seat top
// 0.42–0.48m, table 0.5m. Deterministic jitter, moss caps for age.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const ROCK = mat(0x8c887e, .95, 0);   // palette rock (bench slabs, table)
const PLINTH = mat(0xc6c2b6, .95, 0); // light stone supports (v3: brightened —
                                      // 0xb4b0a4 read as one dark mass at 14m)
const MOSS = mat(0x6a7a4a, .95, 0);   // moss fleck

const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;

// one irregular stone (dress-3 idiom)
const stone = (r: number, x: number, y: number, z: number, seed: number, m: THREE.Material, flat = 0) => {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), m);
    s.scale.set(1 + jit(seed) * 0.35, 0.55 + jit(seed + 5) * 0.15 - flat * 0.3, 0.8 + jit(seed + 9) * 0.3);
    s.rotation.set(jit(seed + 13) * 0.5, jit(seed + 17) * 3.14, jit(seed + 23) * 0.4);
    s.position.set(x, y, z);
    g.add(s);
};

// one bench: low stone slab seat on two blocky light-stone supports
// seat 1.8m long (x), 0.42 deep, top at ~0.45
const bench = (cx: number, cz: number, yaw: number, seed: number, len = 1.8) => {
    const b = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(len, 0.09, 0.46), ROCK);
    seat.position.y = 0.45;
    seat.rotation.z = jit(seed) * 0.01; // v2: flat seats — tilt jitter read "fallen" at 14m
    b.add(seat);
    // two supports set in 0.25 from ends; v3: 0.26 deep so the slab overhangs
    // front and back and the under-gap silhouette survives gameplay distance
    for (const sx of [-len / 2 + 0.25, len / 2 - 0.25]) {
        const sup = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.4, 0.26), PLINTH);
        sup.position.set(sx + jit(seed + sx) * 0.03, 0.2, jit(seed + 2 + sx) * 0.04);
        sup.rotation.y = jit(seed + 3 + sx) * 0.2;
        b.add(sup);
    }
    b.position.set(cx, 0, cz);
    b.rotation.y = yaw;
    g.add(b);
    // soft edges: small chinking stones at the foot, moss cap flecks
    const foot = 0.16;
    stone(foot, cx + jit(seed + 30) * 1.2, 0.07, cz + 0.45 + jit(seed + 31) * 0.15, seed * 3 + 1, MOSS);
    if (seed % 2 === 1) stone(foot * 0.8, cx - jit(seed + 32) * 1.3, 0.06, cz + 0.42, seed * 3 + 2, ROCK);
};

// cluster layout (local frame: +z faces az 79 outward; walker from plaza sees
// the cluster at their 10 o'clock as they pass the terminus):
//   bench-1 at (-1.15, +0.15), yaw +90deg — long axis local z (faces +x, plaza-side)
//   bench-2 at (+1.15, -0.15), yaw -90deg — parallel mirror (v1 review: the
//   -75deg oblique yaw hid its supports at gameplay distance, read "broken
//   slab"; parallel faces both seats to the plaza side)
//   table stone between at (0, 0), a split slab on stub feet, top 0.5m
bench(-1.15, 0.15, Math.PI / 2, 41);
bench(1.15, -0.15, -Math.PI / 2, 53);

// table stone: split slab 1.05 x 0.68, top 0.58m (v4: raised + widened — v3
// judged "reads as a third bench"; height/scale must separate the identities),
// on two stub feet
const table = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.1, 0.68), ROCK);
table.position.y = 0.56;
table.rotation.z = jit(77) * 0.015;
g.add(table);
for (const fx of [-0.32, 0.32]) {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.51, 0.3), PLINTH);
    foot.position.set(fx + jit(fx + 100) * 0.02, 0.255, jit(fx + 101) * 0.03);
    foot.rotation.y = jit(fx + 102) * 0.15;
    g.add(foot);
}
// a couple of loose set-down stones beside the table (in use, not pristine)
stone(0.13, 0.62 + jit(61) * 0.08, 0.06, 0.35 + jit(62) * 0.08, 63, MOSS);
stone(0.1, -0.68, 0.05, -0.3, 64, ROCK);
// wide flat threshold stone at the cluster's plaza-side approach (local +x)
stone(0.3, 1.7, 0.03, 0.1, 65, PLINTH, 1);

mergeByMaterial(g, "dress_ne_bench1");
writeFileSync("agents/arthur/assets/village_dress_ne_bench1.glb", toGLB(g));
console.log("village_dress_ne_bench1.glb —", g.children.length, "nodes");
