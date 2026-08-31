// mkv3-hypararch.ts — STRUCTURES LANE struct-22: R2-3 HYPAR GATE ARBOR.
// Round-2 commission: "twin hypar panels forming a W-gate approach arch,
// echoing the reed pool." One idea: the road passes under two ruled
// saddles — the W approach framed by the same straight-line language as
// the Hypar Pavilion, in miniature.
//
// Two hypar panels (housekit hyparShell, a=2.3, crest rise 1.4m) on four
// slender dark posts each, flanking the W road at local z=±6, each panel
// yawed 45° so a high corner addresses the road. Brass crest pins at the
// road-facing corners. Stone footing blocks plant each post.
//
// COLLIDER HONESTY: the entity straddles the road (bbox 6.6×18.6), so it
// MUST be real trimesh — footprint 123m² ≥16, height 4.15 ≥2.2 — keeping
// the road corridor as a genuine walkable gap. A sub-2.2 build here would
// furniture-box the W gate road.
// No motion, no comps. Static, slow-village discipline.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C, hyparShell } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const timber = mat(0x6b5a3e, 0.9, 0);   // panel slats: warm timber
const dark = mat(C.DARK, 0.95, 0);      // posts
const stoneTex = mat(0x56503c, 0.95, 0); // footings
const brass = mat(C.BRASS, 0.55, 0);    // crest pins

const A = 2.1, K = 0.9 / (A * A), BASE = 2.55, SLATS = 26, OVER = 0.08;
const ZS = [6.0, -6.0];

for (const [i, zc] of ZS.entries()) {
    const side = new THREE.Group();
    side.position.set(0, 0, zc);
    side.rotation.y = 0; // edge-on to the road: the walker reads ONE concave wave-arc per panel
    hyparShell(side, `hyp${i}`, A, BASE, K, SLATS, OVER, timber);
    // posts at the panel's plan corners (square [-a,a]² rotated with side)
    for (const [sx, sz] of [[-A, -A], [A, -A], [-A, A], [A, A]] as const) {
        const c = Math.cos(Math.PI / 4), s = Math.sin(Math.PI / 4);
        const wx = sx * c + sz * s, wz = -sx * s + sz * c;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, BASE, 8), dark);
        post.name = `post_${i}_${sx}_${sz}`;
        post.position.set(wx, BASE / 2, wz);
        side.add(post);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.55), stoneTex);
        foot.name = `foot_${i}_${sx}_${sz}`;
        foot.position.set(wx, 0.08, wz);
        side.add(foot);
    }
    // brass crest pins at BOTH high edge midpoints — the hypar's crests are
    // the edge midpoints, NOT the center (struct-4 pre-build lesson; the
    // first draft's center pin floated 0.9m above the surface, caught in
    // review before upload). Pins sit ON the surface at (±a, 0).
    for (const ex of [A, -A]) {
        const pin = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), brass);
        pin.name = `pin_${i}_${ex > 0 ? "p" : "n"}`;
        pin.position.set(ex, BASE + K * A * A, 0);
        side.add(pin);
    }
    side.updateMatrixWorld(true);
    // bake the group transform into each child (merge needs flat children)
    for (const child of [...side.children]) {
        child.updateMatrixWorld(true);
        child.position.setFromMatrixPosition(child.matrixWorld);
        child.quaternion.setFromRotationMatrix(child.matrixWorld);
        child.scale.setFromMatrixScale(child.matrixWorld);
        g.add(child);
    }
}

const merged = mergeByMaterial(g, "hypararch");
writeFileSync("agents/arthur/assets/village_hypararch3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_hypararch3.glb");
