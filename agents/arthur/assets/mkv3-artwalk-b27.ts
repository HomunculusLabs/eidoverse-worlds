// mkv3-artwalk-b27.ts — B-27 THE WATERLINE.
// The field well's stone drum (tapered r 1.05->0.95, h 0.75) carries two
// encircling marks: one bone ring low, one brass ring high — the dry-year
// line and the wet-year line. The plaza well measures depth (B-24); this
// well, out on the working edge, carries the memory of seasons. No ticks,
// no rays — the quietest member of the family: two rings wrapping stone.
// Drum radius at height y: r = 1.05 - 0.10*(y/0.75); each ring embeds its
// tube 0.02m into the stone so it reads carved, not floating.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const B = mat(0xa0a248, .35, .82);            // brass (art media — flat)
const N = mat(0xdcdcba, .72, .03);            // bone  (art media — flat)

const drumR = (y: number) => 1.05 - 0.10 * (y / 0.75);
const ringAt = (y: number, m: THREE.Material, name: string) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(drumR(y) + 0.01, .03, 8, 48), m);
  ring.rotation.x = Math.PI / 2;
  ring.name = name;
  ring.position.y = y;
  g.add(ring);
};
ringAt(.44, N, "dry_line");  // bone — the dry-year waterline
ringAt(.58, B, "wet_line");  // brass — the wet-year waterline

mergeByMaterial(g, "b27");
writeFileSync("agents/arthur/assets/village_artwalk_b27.glb", toGLB(g));
console.log("village_artwalk_b27.glb —", g.children.length, "nodes");
