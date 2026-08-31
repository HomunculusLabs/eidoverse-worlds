// mkv3-waystone.ts — STRUCTURES LANE struct-26: R3-2 THE FOUR WAYSTONES.
// Round 3 commission (census-derived + named core-candidate): a tapered
// ashlar milestone on each road verge outside the four gates. One idea:
// the road home, pointed — each stone carries one brass band at the head
// and a single bone tick on the band that aims along the road toward the
// village. All four stones share ONE GLB (SW-terrace degenerate-family
// precedent); the tick direction comes from the per-gate yaw.
//
// Furniture-solid collider CORRECT: 1.15m tall, ~0.14m² — walked around,
// verge-sited clear of the road corridor. No motion, no comps.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ash = mat(0x56503c, 0.95, 0);
const brass = mat(C.BRASS, 0.55, 0);
const bone = mat(C.BONE, 0.9, 0);

// tapered monolith: 0.34 base -> 0.24 top, 1.15m, square-ish section
{
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.21, 1.15, 4), ash);
    stone.name = "stone";
    stone.position.y = 0.575 + 0.06;
    stone.rotation.y = Math.PI / 4; // face flats to the road
    g.add(stone);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.12, 4), ash);
    foot.name = "foot";
    foot.position.y = 0.06;
    foot.rotation.y = Math.PI / 4;
    g.add(foot);
}
// brass head band
{
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.022, 6, 4), brass);
    band.name = "band";
    band.rotation.x = Math.PI / 2;
    band.rotation.z = Math.PI / 4;
    band.position.y = 1.06;
    g.add(band);
}
// the tick: one bone pointer on the band, +X local — per-gate yaw aims it home
{
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.045, 0.05), bone);
    tick.name = "tick";
    tick.position.set(0.14, 1.06, 0);
    g.add(tick);
}

const merged = mergeByMaterial(g, "waystone");
writeFileSync("agents/arthur/assets/village_waystone3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_waystone3.glb");
