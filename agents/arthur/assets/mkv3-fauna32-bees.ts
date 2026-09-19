// mkv3-fauna32-bees.ts — fauna-32, skep bees (FAUNA-PLAN queue row 21).
// Concept contract (fauna-30 proposal): the orchard-edge field carries bee
// skeps surrounded by lavender — flowers and hive, but the pollinator is
// missing. THIS entity is the pollinating CLOUD: four bees flying tight
// rings around the STANDING hive row (nx-dress-nw-skeps-001, dress lane's
// — untouched), three more working the lavender blossoms beside it. The
// read is the cloud's MOTION (presence species — encounter-class like the
// robin; individual anatomy is encounter reward).
// ZERO furniture, ZERO ground geometry: the standing row IS the furniture
// (duplicating hives beside hives reads as a second row — zoo-dump smell).
// The village's first pure-motion fauna.
// Marginality: honest honeybee workers upsized ×2.8 (9.5cm read class) —
// the plan's own fallback provision (row 21 RISK note: true 12mm is
// sub-3px at any vantage).
// FRAME COPY (frog-on-pool class): the entity seats at the standing row's
// exact origin+yaw+py, so entity-local == row-local VERBATIM and the
// orbits center on the real hives at row-local (-1.9,0), (-0.6,0.15),
// (0.7,-0.1), (2.0,0.05) (authored in mkv3-dress-nw-skeps1.ts).
// Ring law: r 0.8 clears each skep OBB (half-diag 0.538) by 0.26m and
// clears adjacent skeps' near faces (~0.1m+) — ring-vs-OBB, not disc.
// Workers hover y 0.58-0.66, above bed plant tops 0.538 in this frame
// (bed py 0.026 vs row py 0.038; decoded a9076cee maxY 0.550).
// Anchors: bee_1..bee_4 (orbit flyers) + bee_5..bee_7 (flower workers)
// — `bee_` prefix added to mergekit KEEP this tick.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const BEE_BODY = mat(0x6b5424, .85, 0);    // gold-brown abdomen (v3: lifted from 0x5a451e — judged near-black at 0.8m)
const BEE_BAND = mat(0xe8dcc2, .85, 0);    // pale cream bands (turkey terminal-band proven distance read)
const BEE_HEAD = mat(0x2a2018, .85, 0);    // near-black head
// v3 wing law: 0xcfd8dc was SKY-COLORED (rig sky 0xcbd6df — pixel-probe
// found zero distinguishable wing px; pale-on-pale). Mid-value 0xaebac2
// reads against sky (dark enough) AND foliage/straw (light enough).
const WING = mat(0xaebac2, .35, 0);        // translucent smoke-grey wing blur

// ---- bee (honest worker anatomy, upsized ×2.8; true worker ~12mm) ----
// v5 FACING LAW (engine-true): orbit face sets rotation.y = a+π/2, which
// points LOCAL +Z along the velocity at every ring angle — the visual
// front (head) MUST live at local +z (v4's head at −z flew tail-first;
// judge caught "faces right-to-left" while orbiting left-to-right).
// body ~34mm: abdomen −z, thorax 0, head +z (front).
function bee(name: string, x: number, y: number, z: number, yaw: number) {
  const grp = new THREE.Group();
  grp.name = name;
  grp.position.set(x, y, z);
  grp.rotation.y = yaw;
  // abdomen: ellipsoid toward local −z (rear)
  const ab = new THREE.Mesh(new THREE.SphereGeometry(0.0155, 10, 8), BEE_BODY);
  ab.scale.set(1, 0.92, 1.55); ab.position.z = -0.013; grp.add(ab);
  // two pale bands CRESTING the abdomen — 2mm proud (v4 law). Local
  // radius 15.3mm @ z −0.007, 15.2mm @ z −0.018 → band radii 17.3/17.2mm.
  const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0173, 0.0173, 0.006, 10), BEE_BAND);
  b1.rotation.x = Math.PI / 2; b1.position.z = -0.007; grp.add(b1);
  const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.0172, 0.0172, 0.006, 10), BEE_BAND);
  b2.rotation.x = Math.PI / 2; b2.position.z = -0.018; grp.add(b2);
  // thorax fuzzy dome at center
  const th = new THREE.Mesh(new THREE.SphereGeometry(0.0115, 10, 8), BEE_BODY);
  th.scale.set(1, 1.05, 1.0); th.position.z = 0.006; grp.add(th);
  // head proud-FORWARD at local +z (v5 law; front +0.029)
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 8, 6), BEE_HEAD);
  hd.position.z = 0.0205; grp.add(hd);
  // wing pair v5: 24mm ovals, dihedral 0.38, thickness 0.18; rearward
  // sweep (flight drag trails the thorax)
  const wg1 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), WING);
  wg1.scale.set(1, 0.18, 0.45);
  wg1.rotation.set(-0.12, 0.3, 0.38);
  wg1.position.set(0.016, 0.011, 0.004); grp.add(wg1);
  const wg2 = wg1.clone(); wg2.position.x = -0.016; wg2.rotation.set(-0.12, -0.3, -0.38); grp.add(wg2);
  g.add(grp);
}

// 4 flyers — one ring per STANDING hive. Rings fly ABOVE lavender plant
// tops (0.538 this frame): y 0.62-0.72, body bottom >= 0.59, clear >= 0.05.
// (Rings clear the skeps horizontally by 0.26m, so any height is safe
// vs straw; the plants were the constraint.)
bee("bee_1", -1.9, 0.62, 0.80, 0);          // orbit A: center (-1.9, 0.62, 0), r 0.80
bee("bee_2", -0.6, 0.68, 0.95, 2.1);        // orbit B: center (-0.6, 0.68, 0.15), r 0.80
bee("bee_3", 0.7, 0.64, 0.70, 4.0);         // orbit C: center (0.7, 0.64, -0.1), r 0.80
bee("bee_4", 2.0, 0.72, 0.85, 5.2);         // orbit D: center (2.0, 0.72, 0.05), r 0.80
// 3 flower workers — over the lavender SE/E of the row (bed interior),
// at blossom-crown level: bob dips touch the crowns (0.538) = working
// the flowers, species-true
bee("bee_5", 1.20, 0.60, 1.35, 1.2);
bee("bee_6", 2.10, 0.64, 0.90, 5.1);
bee("bee_7", 0.10, 0.60, 1.90, 2.8);

mergeByMaterial(g, "fauna32_cloud");
writeFileSync("agents/arthur/assets/village_fauna32_bees.glb", toGLB(g));
console.log("village_fauna32_bees.glb —", g.children.length, "top-level nodes");
