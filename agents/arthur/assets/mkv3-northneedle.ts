// mkv3-northneedle.ts — STRUCTURES LANE struct-25: R3-1 THE NORTH NEEDLE.
// Round 3 commission (census-derived): the NW diagonal carries the village's
// richest walk — hall, water stair, shell tower, orrery+ring, observatory,
// sky mirror — and then stops. The forest begins at r76. The diagonal
// terminus (theta ~326, r57) is empty. One idea: the village's needle —
// a single leaning dark mast, 12.4m tall (the lane's tallest), rising
// from a stone pad with brass grading bands at harmonic 4.1/8.2m, and
// ONE warm ember lamp in a brass cage at the summit: by day a surveyor's
// needle against the sky, by night the farthest-visible point of the
// village, seen before any roofline.
//
// Silhouette-first: one line, one lean, one light. The lean (3.4deg)
// makes it read as drawn, not extruded. Collider: solid mast (correct).
// Light verb companion at the summit (beacon precedent, struct-11).
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const dark = mat(C.DARK, 0.95, 0);
const ash = mat(0x56503c, 0.95, 0);
const brass = mat(C.BRASS, 0.55, 0);
const LEAN = 0.0593; // 3.4 deg

// stone pad: two hex courses
{
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.0, 0.22, 6), ash);
    p1.name = "pad_0"; p1.position.y = 0.11; g.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, 0.18, 6), ash);
    p2.name = "pad_1"; p2.position.y = 0.31; g.add(p2);
}
// the mast: tapered, leaning — center-pivot rotation; axis x(y) = (y−6.6)·tan(LEAN)
const MAST_C = 12.4 / 2 + 0.4; // center y
const ax = (y: number) => (y - MAST_C) * Math.tan(LEAN); // mast centerline x at world y
{
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.24, 12.4, 10), dark);
    mast.name = "mast";
    mast.position.y = MAST_C;
    mast.rotation.z = -LEAN;
    g.add(mast);
}
// brass grading bands at harmonic heights 4.1 / 8.2 — radius follows the taper
for (const [i, hy] of [4.1, 8.2].entries()) {
    const yW = 0.4 + hy;
    const rMast = 0.24 - (0.24 - 0.07) * (hy / 12.4);
    const band = new THREE.Mesh(new THREE.TorusGeometry(rMast + 0.02, 0.028, 6, 24), brass);
    band.name = `band_${i}`;
    band.rotation.x = Math.PI / 2;
    band.position.set(ax(yW), yW, 0);
    g.add(band);
}
// summit cage + ember lamp (emissive glass in a brass cage) — on the axis
{
    const tipY = 0.4 + 12.4;
    const tipX = ax(tipY);
    const cage = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.024, 6, 20), brass);
    cage.name = "cage";
    cage.rotation.x = Math.PI / 2;
    cage.position.set(tipX, tipY + 0.1, 0);
    g.add(cage);
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), mat(0xffc98a, 0.4, 0));
    (ember as any).emissive = new THREE.Color(0xff9a3c);
    (ember as any).emissiveIntensity = 0.9;
    ember.name = "ember";
    ember.position.set(tipX, tipY + 0.1, 0);
    g.add(ember);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.3, 8), brass);
    cap.name = "cap";
    cap.position.set(tipX, tipY + 0.42, 0);
    g.add(cap);
}

const merged = mergeByMaterial(g, "northneedle");
writeFileSync("agents/arthur/assets/village_northneedle3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_northneedle3.glb");
