// mkv3-artwalk-b30.ts — B-30 THE MARKET TALLY.
// The cloth stall's trestle-counter front (source-true mkv3-market.ts:
// counter top 1.7 x 0.07 x 0.75 at stall-local x=+1.0, top y 0.82; four
// splayed legs; its plaza-facing +Z face below the top is bare) carries
// the day's record: one brass datum and five alternating brass/bone coin
// marks — the day's takings, five quiet circles at the reading line.
// Bread and iron count sevens across the court yard (B-28/29); the cloth
// trade counts fives — a handful of coins. Flat art media on a forged
// backing; circles, not bars: this is coin, not strike.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const B = mat(0xa0a248, .35, .82);            // brass (art media — flat)
const N = mat(0xdcdcba, .72, .03);            // bone  (art media — flat)
const I = texMat("iron", [0x5c5c60, 0x54545a], { rough: .4, metal: .55, scale: 2, stripe: 2, weights: [2, 1] }); // forged field

// forged backing on the counter front's upper rail (between the splayed
// legs, clear of the leaning shutters behind the counter line)
const back = new THREE.Mesh(new THREE.BoxGeometry(1.42, .26, .04), I);
back.name = "back";
back.position.set(1.0, 0.62, 0.40);
g.add(back);
// brass datum along the backing's base
const datum = new THREE.Mesh(new THREE.BoxGeometry(1.24, .026, .026), B);
datum.name = "datum";
datum.position.set(1.0, 0.515, 0.425);
g.add(datum);
// five coin marks (short cylinders facing the reader) along the line
for (let i = 0; i < 5; i++) {
  const x = 0.48 + i * 0.26;
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(.043, .043, .026, 12), i % 2 ? N : B);
  coin.rotation.x = Math.PI / 2;
  coin.name = `coin_${i}`;
  coin.position.set(x, 0.60, 0.425);
  g.add(coin);
}

mergeByMaterial(g, "b30");
writeFileSync("agents/arthur/assets/village_artwalk_b30.glb", toGLB(g));
console.log("village_artwalk_b30.glb —", g.children.length, "nodes");
