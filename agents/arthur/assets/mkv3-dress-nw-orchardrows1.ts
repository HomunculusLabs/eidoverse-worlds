// mkv3-dress-nw-orchardrows1.ts — dress-74, NW CULTIVATION espaliered fruit
// rows (round-3 item 1: nx-dress-nw-orchard-rows-001).
// v3 (dress-81, survey-23 ZAI + native 18m re-judge cure): v2's flat
// rectilinear arms read FENCE at 18m (silhouette beats color — crenellation
// tabs, zero canopy volume, fruit specks read artifacts). Cure per the
// judge Rx: canopy MASS — lumpy overlapping clump runs replace milled
// rails; trunk chunked and rising through both tiers (strongest espalier
// signpost); fruit as CLUSTERED trusses; per-plant jitter (plants, not
// millwork). Posts/caps/timber frame unchanged (correct at all ranges).
// v4 (same tick): 7 clumps/tier + x-scale 1.5 closed the bay-1 chain gap;
// trusses tightened to 0.16m spread. 18m judge: canopy mass SOLVED, but
// run still leans hedge-on-fence ~60/40.
// v5 (same tick, 18m-judge Rx): plant-run separation (1.52m clump runs
// leave ~0.24m gaps at the posts — three PLANTS, not one hedge); per-plant
// tier bias (upper +0.10 / lower -0.05 — uneven tier heights break the
// fence rhythm); one escaped shoot on plant 0 cresting the post-cap line
// (living plant, not millwork); fruit on tier FACES (z 0.24, mid-clump
// height — top-silhouette placement was the artifact-risk read), 2 trusses
// x 3 tight dots per plant + one red-orange truss value. 18m verdict: PASS
// w/ reservations 6.5/10 — fruit clusters sell the read, but 4 posts + 3
// trunks at uniform 1m spacing read as ONE picket cadence (judge counted
// "5-6 posts"; mid-bay trunks invisible in the rhythm) and uniform tier
// bias left tiers parallel.
// v6 (same tick, rhythm-keystone Rx): trunk STAGGER (+0.18/-0.15/+0.10)
// + alternating 3-deg tilt (organic vs milled — kills the picket cadence;
// clump runs re-center on the staggered trunks); per-plant tier heights
// with SIGN variation (lows 0.55/0.63/0.50, highs 1.24/1.12/1.30 — tiers
// no longer parallel); tier thickness variance (clump y-scale base
// 0.62/0.50/0.70); escaped shoot thickened + a second shoot on plant 2;
// FRUIT_WARM brightened one step (pickup affordance cue).
// Static, unlit — spends no lamp budget. Node budget: 8 material buckets.
// Envelope law: x ±3.06 posts / z back edge ~-0.17 (front-biased growth),
// y top 1.71 (one escaped shoot — post-cap line 1.51). Live SAT re-proves
// margins at TRUE decoded dims.
// Static, unlit — spends no lamp budget. Node budget: 8 material buckets.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const TIMBER = mat(0x9c8a6a, 0.9, 0);      // posts (village timber family)
const CUTWOOD = mat(0xf2eed0, 0.95, 0);    // pale post caps — district worked-wood tell
const CANOPY = mat(0x728e5a, 0.95, 0);     // palette canopy (trained green)
const CANOPY_DK = mat(0x5c7648, 0.95, 0);  // palette canopy-dk (value rhythm)
const TRUNK = mat(0x7a5f46, 0.95, 0);      // bark — v7 warmer (trunk presence)
const FRUIT = mat(0xb5493a, 0.9, 0);       // deep red fruit
const FRUIT_DK = mat(0x8f3526, 0.9, 0);    // darker red — truss depth
const FRUIT_WARM = mat(0xd0743f, 0.9, 0);  // red-orange truss value (v6: brightened)

const add = (n: string, m: THREE.Mesh) => { m.name = n; g.add(m); };
// deterministic per-plant jitter (no Math.random — byte-deterministic builds)
const jit = (seed: number, i: number) => {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x); // [0,1)
};

// 4 posts at x = -3, -1, 1, 3 (2m bays, plants centered between) — unchanged
for (const px of [-3, -1, 1, 3]) {
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.45, 0.1), TIMBER);
  p.position.set(px, 0.725, 0);
  add(`post_${px}`, p);
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.12), CUTWOOD);
  c.position.set(px, 1.48, 0);
  add(`cap_${px}`, c);
}

// 3 plants — v6 staggered/tilted trunks, per-plant tier heights
const T_STAG = [0.18, -0.15, 0.10];   // trunk x stagger off bay centers
const T_TILT = [3, -3, 3];            // trunk tilt, degrees
const T_LOW = [0.55, 0.63, 0.50];     // per-plant LOW tier height
const T_HIGH = [1.24, 1.12, 1.30];    // per-plant HIGH tier height
const T_THICK = [0.62, 0.50, 0.70];   // per-plant clump y-scale base
for (let i = 0; i < 3; i++) {
  const cx = -2 + i * 2;
  const s0 = jit(3 + i, 1), s1 = jit(7 + i, 2), s2 = jit(17 + i, 4);
  // trunk — v7 presence pass: 1.5x post thickness + root-collar flare +
  // stagger/tilt — trunks must WIN the vertical contest, not hide in it
  const tx = cx + T_STAG[i];
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.20, 1.42, 0.20), TRUNK);
  t.position.set(tx, 0.71, 0);
  t.rotation.z = (T_TILT[i] * Math.PI) / 180;
  add(`trunk_${cx}`, t);
  const fl = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.10, 0.30), TRUNK);
  fl.position.set(tx, 0.05, 0);
  add(`flare_${cx}`, fl);
  // per-plant tier heights with SIGN variation (tiers never parallel)
  const tiers: [number, THREE.Material][] = [
    [T_LOW[i] + (s0 - 0.5) * 0.06, CANOPY],
    [T_HIGH[i] + (s1 - 0.5) * 0.06, CANOPY_DK],
  ];
  for (let j = 0; j < tiers.length; j++) {
    const [ty, m] = tiers[j];
    const alt = j ? CANOPY : CANOPY_DK; // opposite green for clump alternation
    // canopy run: 7 overlapping squashed-sphere clumps — LUMPY organic top
    // edge replaces the milled-rail silhouette; v5 run span 1.52m leaves a
    // ~0.24m gap at each post (three plants, not one continuous hedge)
    for (let k = 0; k < 7; k++) {
      const u = k / 6; // 0..1 across the run
      const r = 0.15 + jit(i * 10 + j * 6 + k, 5) * 0.07; // r 0.15..0.22
      const cl = new THREE.Mesh(new THREE.SphereGeometry(r, 9, 7), (k % 2 ? alt : m));
      cl.scale.set(1.5, T_THICK[i] + jit(i * 10 + j * 6 + k, 6) * 0.2, 1.0);
      cl.position.set(
        tx - 0.76 + u * 1.52 + (jit(i * 10 + j * 6 + k, 7) - 0.5) * 0.10,
        ty + (jit(i * 10 + j * 6 + k, 8) - 0.5) * 0.07,
        // z front-biased + bounded: extent -0.18..+0.37 max (back edge only
        // ~0.09 proud — dress-74 garden-0058 margin stays >=1.4m, live SAT
        // re-proves at TRUE dims)
        0.10 + (jit(i * 10 + j * 6 + k, 9) - 0.4) * 0.14,
      );
      add(`clump_${cx}_t${j}_${k}`, cl);
    }
  }
  // v6 escaped shoots — thickened primary on plant 0, second on plant 2
  if (i === 0) {
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), CANOPY);
    sh.scale.set(0.9, 1.6, 0.9);
    sh.position.set(tx + 0.4, 1.58, 0.05);
    add(`shoot_${cx}`, sh);
  }
  if (i === 2) {
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 6), CANOPY_DK);
    sh.scale.set(0.8, 1.5, 0.8);
    sh.position.set(tx - 0.45, 1.52, -0.04);
    add(`shoot2_${cx}`, sh);
  }
  // fruit TRUSSES — 2 clusters x 3 tight dots per plant, staggered tiers,
  // one red-orange truss value; v7: the LOWER truss hangs UNDER the arm
  // (trained-fruit dangle cue, judge Rx)
  const trussY = (up: boolean) => (up ? tiers[1][0] : tiers[0][0]);
  const mkTruss = (up: boolean, xoff: number, fm: THREE.Material) => {
    const fy = trussY(up) + (up ? 0.02 : -0.14); // upper on-face, lower hanging
    const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.105, 10, 8), fm);
    f1.position.set(cx + xoff, fy, 0.24);
    add(`fruit_${cx}_${up ? "u" : "l"}1`, f1);
    const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), fm);
    f2.position.set(cx + xoff - 0.12, fy - (up ? 0.07 : 0.08), 0.26);
    add(`fruit_${cx}_${up ? "u" : "l"}2`, f2);
    const f3 = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), FRUIT_DK);
    f3.position.set(cx + xoff + 0.10, fy - 0.05, 0.22);
    add(`fruit_${cx}_${up ? "u" : "l"}3`, f3);
  };
  const dir = i % 2 === 0 ? 1 : -1;
  mkTruss(true, dir * (0.30 + s2 * 0.15), FRUIT);
  mkTruss(false, -dir * (0.30 + s2 * 0.15), i === 1 ? FRUIT_WARM : FRUIT);
}

mergeByMaterial(g, "dress_nw_orchardrows1");
writeFileSync("agents/arthur/assets/village_dress_nw_orchardrows1.glb", toGLB(g));
console.log("village_dress_nw_orchardrows1.glb —", g.children.length, "meshes");
