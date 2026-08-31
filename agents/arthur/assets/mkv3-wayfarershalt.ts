// mkv3-wayfarershalt.ts — STRUCTURES LANE struct-29: R3-4 THE WAYFARER'S HALT.
// Round 3 (axis census): the S road from the gate (r20) to the Bandstand
// (r40) is the longest bare stretch in the village — no rest anywhere.
// One idea: three posts and a roof — the smallest possible shelter.
// Timber posts on stone pads, a shallow gable slab, one long bench
// (timber on stone blocks) facing the road, a brass road-stud in the
// bench's center backrest post: the halt's only ornament, the marker of
// "the road rests here."
//
// Open on three sides; room gates honest? No — deliberately furniture-
// scale shelter is WRONG here (solid box would block its own bench).
// Height 2.45 >= 2.2, footprint 12.6m² < 16 → BUT the 16m² gate applies
// to ENTERABLE rooms; this is an open shelter whose underside is bench
// + posts (reed-pool flat-threshold lesson: mast/lift the mass so the
// classifier gives real trimesh). 2.45m height passes the >=2.2 gate so
// the volume is trimesh — walk-through under the roof is genuinely open.
// No motion, no comps.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const timber = mat(0x6b5a3e, 0.9, 0);
const dark = mat(C.DARK, 0.95, 0);
const ash = mat(0x56503c, 0.95, 0);
const brass = mat(C.BRASS, 0.55, 0);

// three posts (x -1.8, 0, +1.8; rear wall at z +1.1)
for (const [i, px] of [-1.8, 0, 1.8].entries()) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.1, 8), dark);
    post.name = `post_${i}`;
    post.position.set(px, 1.05 + 0.06, 1.1);
    g.add(post);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), ash);
    pad.name = `pad_${i}`;
    pad.position.set(px, 0.06, 1.1);
    g.add(pad);
}
// gable roof slab (two shallow planes meeting at the center ridge)
{
    for (const [i, s] of [-1, 1].entries()) {
        const plane = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.07, 1.5), timber);
        plane.name = `roof_${i}`;
        plane.position.set(0, 2.32, 0.35 + s * 0.72);
        plane.rotation.x = s * -0.38;
        g.add(plane);
    }
}
// bench: timber slab on two stone blocks, facing the road (open at -z)
{
    const seat = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 0.42), timber);
    seat.name = "bench";
    seat.position.set(0, 0.62, 0.82);
    g.add(seat);
    for (const [i, bx] of [-1.4, 1.4].entries()) {
        const block = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.58, 0.4), ash);
        block.name = `block_${i}`;
        block.position.set(bx, 0.29, 0.82);
        g.add(block);
    }
    // brass road-stud in the center post at eye height
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), brass);
    stud.name = "roadstud";
    stud.position.set(0, 1.55, 1.0);
    g.add(stud);
}

const merged = mergeByMaterial(g, "wayfarershalt");
writeFileSync("agents/arthur/assets/village_wayfarershalt3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_wayfarershalt3.glb");
