// mkv3-dress-nw-skeps1.ts — dress-5, NW CULTIVATION bee skeps.
// Concept contract: a skep row on the sunny SE-facing edge of the district's
// orchard plot — woven-straw hives (skeps) set on small stone plinths in a
// line where the bees work the orchard blossom. Grounds USE: skeps live AT
// the crop they serve; orchard-0033's orchard-facing (SE, plaza-ward) edge
// is the district's bee-ground. Idiom honesty: bell-corrugated straw body
// (stacked rings shrinking with height), dark flight hole, one stone
// plinth per skep, a wind-break boulder behind the row, a straw spill and
// a fallen spare ring beside the end plinth. Static, unlit — spends no
// lamp budget.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const STRAW = mat(0xc9a35c, .9, 0);       // woven straw
const STRAW_DK = mat(0xa8834a, .9, 0);    // straw shadow rings / spill
const ROCK = mat(0x8c887e, .95, 0);       // palette rock
const ROCK_LT = mat(0xb4b0a4, .95, 0);    // v3: plinths clearly light stone
const STRAW_LT = mat(0xd9bd7f, .9, 0);    // v3: pale straw scatter (lightest value)

// one skep = plinth + bell body of 5 shrinking corrugated rings + hole
function skep(x: number, z: number, s: number) {
  const parts: [number, number][] = [ // [top radius, y (ring top, rel body base)]
    [0.28, 0.08], [0.25, 0.22], [0.22, 0.35], [0.18, 0.47], [0.13, 0.56],
  ];
  const [r0] = parts[0];
  // plinth (v2: wider + lighter so it reads STONE at gameplay distance, not shadow mass)
  const pl = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.14, 0.64), ROCK_LT);
  pl.name = `plinth_${x.toFixed(2)}`; pl.position.set(x, 0.07, z); g.add(pl);
  // base disc
  const b = new THREE.Mesh(new THREE.CylinderGeometry(r0 + 0.03, r0 + 0.05, 0.09, 10), STRAW);
  b.name = `skep_${x.toFixed(2)}_base`; b.position.set(x, 0.16 + 0.045, z); g.add(b);
  // corrugated rings
  for (let i = 0; i < parts.length; i++) {
    const [tr, y] = parts[i];
    const r = i === 0 ? r0 : parts[i - 1][0];
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(tr, r, 0.14, 10),
      i % 2 ? STRAW_DK : STRAW
    );
    m.name = `skep_${x.toFixed(2)}_r${i}`;
    m.position.set(x, 0.16 + 0.09 + y - 0.07, z);
    g.add(m);
  }
  // flight hole: small dark cylinder, half-embedded in the SE (+z) face of ring 1-2
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 8), STRAW_DK);
  h.name = `skep_${x.toFixed(2)}_hole`;
  h.rotation.x = Math.PI / 2;
  h.position.set(x, 0.16 + 0.09 + 0.16, z + r0 + 0.04);
  g.add(h);
  // scale passthrough unused at s=1 reserved for variants
  void s;
}
skep(-1.9, 0, 1);
skep(-0.6, 0.15, 1);
skep(0.7, -0.1, 1);
skep(2.0, 0.05, 1);

// wind-break boulder behind the row (v3: deeper back at z -1.7 and r 0.66 so
// it separates from every skep silhouette at gameplay distance)
const wb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.66, 0), ROCK);
wb.name = "windbreak_rock";
wb.position.set(-1.3, 0.4, -1.7);
wb.rotation.set(0.3, 0.7, 0.1);
g.add(wb);

// v3: spilled worked-straw beside the end plinth — a low irregular scatter
// of pale clumps (broken silhouette, no circular shapes, lightest value),
// replacing v2's mallet-read shaft+ring
const clumps: [number, number, number, number, number, number][] = [
  // [w, h, d, x, z, yaw]
  [0.55, 0.07, 0.4, 2.75, 0.5, 0.5],
  [0.4, 0.06, 0.3, 3.1, 0.75, -0.3],
  [0.3, 0.05, 0.25, 3.35, 0.55, 0.9],
  [0.35, 0.05, 0.28, 2.9, 0.95, 0.2],
];
clumps.forEach(([w, h, d, x, z, yaw], i) => {
  const c = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), STRAW_LT);
  c.name = `straw_clump${i}`; c.position.set(x, 0.035 + i * 0.002, z); c.rotation.y = yaw; g.add(c);
});

mergeByMaterial(g, "dress_nw_skeps1");
writeFileSync("agents/arthur/assets/village_dress_nw_skeps1.glb", toGLB(g));
console.log("village_dress_nw_skeps1.glb —", g.children.length, "nodes");
