// mkv3-cellardoor.ts — STRUCTURES LANE struct-23: R2-4 WAVE CELLAR DOOR.
// Round-2 commission: "wave-motif cellar entry beside the inn, interior-
// scale Two Histories echo." One idea: a cellar whose door is a wave —
// an ashlar surround carrying one calm sine course across its lintel,
// the ripple language of the Reed Pool at the scale of a doorway.
//
// COMPOSITION (fixed after the siting scan): the S face strip is the only
// legal seat (0.27–0.35m clearance class — cellar doors BELONG pressed to
// a host wall; 1.4m law is for walk-through gaps, this is a lean-to nook).
// Locked seat (36, 6.02), door face toward the field, wall-side recessed.
//
// Parts: ashlar frame (two jambs + lintel course), the wave — one sine
// course of 11 ashlar voussoirs across the lintel face (y = mid + 0.09·
// sin(2π·x/2.2)), a dark timber door slab recessed 0.25m with bone hinges
// and a brass ring handle, stone threshold, and a lone brass 'high-water'
// pin at the sill's flood mark. Furniture-solid collider CORRECT here:
// 1.95m tall, 3.08m² footprint — a fixed feature, walked around not
// through (same class as the Skene Wall, struct-14).
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ash = mat(0x56503c, 0.95, 0);
const dark = mat(C.DARK, 0.95, 0);
const bone = mat(C.BONE, 0.9, 0);
const brass = mat(C.BRASS, 0.55, 0);

const W = 2.2, H = 1.95, D = 1.4, J = 0.28; // span, height, depth, jamb width

// jambs
for (const sx of [-1, 1]) {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(J, H, D), ash);
    jamb.name = `jamb_${sx < 0 ? "w" : "e"}`;
    jamb.position.set(sx * (W / 2 + J / 2), H / 2, 0);
    g.add(jamb);
}
// the wave: 11 voussoirs across the lintel face, one calm sine
for (let i = 0; i < 11; i++) {
    const t = (i + 0.5) / 11;
    const x = -W / 2 + t * W;
    const y = H - 0.12 + 0.09 * Math.sin(2 * Math.PI * t);
    const v = new THREE.Mesh(new THREE.BoxGeometry(W / 11 + 0.015, 0.24, D * 0.6), ash);
    v.name = `wave_${i}`;
    v.position.set(x, y, 0);
    v.rotation.z = 0.257 * Math.cos(2 * Math.PI * t); // tangent to the sine
    g.add(v);
}
// lintel slab above the wave course
{
    const lin = new THREE.Mesh(new THREE.BoxGeometry(W + 2 * J, 0.14, D), ash);
    lin.name = "lintel";
    lin.position.set(0, H + 0.14, 0); // seats onto the wave course (bottom H+0.07 < wave top H+0.09)
    g.add(lin);
}
// recessed door slab + hinges + brass ring
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W - 0.14, H - 0.1, 0.08), dark);
    slab.name = "door";
    slab.position.set(0, (H - 0.1) / 2, -0.22);
    g.add(slab);
    for (const hy of [0.45, 1.35]) {
        const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.03), bone);
        h.name = `hinge_${hy}`;
        h.position.set(-W / 2 + 0.28, hy, -0.17);
        g.add(h);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 6, 20), brass);
    ring.name = "ring";
    ring.position.set(W / 2 - 0.32, 1.0, -0.17);
    g.add(ring);
}
// threshold + high-water pin
{
    const th = new THREE.Mesh(new THREE.BoxGeometry(W + 2 * J, 0.09, D + 0.3), ash);
    th.name = "threshold";
    th.position.set(0, 0.045, 0.1);
    g.add(th);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), brass);
    pin.name = "highwater_pin";
    pin.position.set(W / 2 + J / 2, 0.15, D / 2 + 0.06);
    g.add(pin);
}

const merged = mergeByMaterial(g, "cellardoor");
writeFileSync("agents/arthur/assets/village_cellardoor3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_cellardoor3.glb");
