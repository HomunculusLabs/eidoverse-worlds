// mkv3-dress-nw-orchardrows1.ts — dress-74, NW CULTIVATION espaliered fruit
// rows (round-3 item 1: nx-dress-nw-orchard-rows-001).
// Concept contract: kitchen-garden espalier — fruit cordons trained on a
// post-and-wire frame along the SUNNY plaza-facing (+z, SW) boundary of the
// district's mid garden (garden-0058), 1.5m off the plot edge, facing the
// az-45 walking corridor 13.8m away. Grounds USE: intensive fruit training
// lives at garden edges (warmth, tidy harvest); distinct from orchards
// (free-standing trees) and lavender (field crop). This is garden
// infrastructure: trained cordons, NOT trees — open between tiers, so
// sightlines stay clear (round-3 commission language).
// Idiom honesty: 4 timber posts with pale worked caps (district tell:
// stile tops, hedge cut ends), 3 plants as double-tier horizontal cordons
// (the espalier signature — a fence is a solid plane, an espalier is green
// BANDS with air between), trunk rhythm, sparse deep-red fruit dots ON the
// green (attached accent, not debris — dress-20 lesson). Wires implied by
// the trained arms themselves (literal wire = invisible / floating speck).
// Static, unlit — spends no lamp budget. Node budget: 6 material buckets.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const TIMBER = mat(0x9c8a6a, 0.9, 0);      // posts (village timber family)
const CUTWOOD = mat(0xf2eed0, 0.95, 0);    // pale post caps — district worked-wood tell
const CANOPY = mat(0x728e5a, 0.95, 0);     // palette canopy (trained green)
const CANOPY_DK = mat(0x5c7648, 0.95, 0);  // palette canopy-dk (value rhythm)
const TRUNK = mat(0x6f5a42, 0.95, 0);      // bark (trunk verticals)
const FRUIT = mat(0xb5493a, 0.9, 0);       // deep red fruit — sparse, attached

const add = (n: string, m: THREE.Mesh) => { m.name = n; g.add(m); };

// 4 posts at x = -3, -1, 1, 3 (2m bays, plants centered between)
for (const px of [-3, -1, 1, 3]) {
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.45, 0.1), TIMBER);
  p.position.set(px, 0.725, 0);
  add(`post_${px}`, p);
  // pale worked cap, seated flush on the post top (post proud above top
  // cordon — true of real espalier frames)
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.12), CUTWOOD);
  c.position.set(px, 1.48, 0);
  add(`cap_${px}`, c);
}

// 3 plants at x = -2, 0, 2 — double-tier horizontal cordons
// tiers at y 0.60 and 1.15; arms 1.7m span the full bay (trunk to posts)
// v2 (dress-74 judge pass): spurs hug the cordon (0.09 proud — young
// shoots, not stubs; kills the rickety flirt), arms slightly taller for
// band read, fruit dots r0.10 seated mid-band ON the green (x near the
// spurs, y inside the band, z centered) so every dot silhouettes against
// green — never against ground or sky.
const tiers: [number, THREE.Material][] = [[0.60, CANOPY], [1.15, CANOPY_DK]];
for (let i = 0; i < 3; i++) {
  const cx = -2 + i * 2;
  // trunk
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.3, 0.09), TRUNK);
  t.position.set(cx, 0.65, 0);
  add(`trunk_${cx}`, t);
  for (let j = 0; j < tiers.length; j++) {
    const [ty, m] = tiers[j];
    // horizontal cordon arm — the espalier mass
    const a = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.2, 0.15), m);
    a.position.set(cx, ty, 0);
    add(`arm_${cx}_t${j}`, a);
    // fruiting spurs hugging the arm top (short, clearly arising from it)
    for (const sx of [-0.55, 0.55]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.18, 0.13), j ? CANOPY : CANOPY_DK);
      s.position.set(cx + sx, ty + 0.10 + 0.09, 0);
      add(`spur_${cx}_t${j}_${sx}`, s);
    }
  }
  // fruit dot — one per plant, alternating tier, seated mid-band on green
  const fy = i % 2 === 0 ? 0.60 : 1.15;
  const fx = i % 2 === 0 ? 0.55 : -0.55;
  const f = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), FRUIT);
  f.position.set(cx + fx, fy + 0.06, 0.02);
  add(`fruit_${cx}`, f);
}

mergeByMaterial(g, "dress_nw_orchardrows1");
writeFileSync("agents/arthur/assets/village_dress_nw_orchardrows1.glb", toGLB(g));
console.log("village_dress_nw_orchardrows1.glb —", g.children.length, "meshes");
