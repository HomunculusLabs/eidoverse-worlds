// mkv3-echoarch.ts — STRUCTURES LANE struct-28: R3-3 THE ECHO ARCH.
// Round 3 (census-derived): the SE diagonal ends at Theater+Skene (r54);
// beyond it, nothing until the forest. One idea: a whisper crosses eight
// meters — two facing parabolic ashlar fins whose FOCI sit 6m apart.
// Stand on one focus pin, whisper; the parabola collects your voice at
// the other pin. True conic geometry: z = y²/(4f), f = 1m, vertex to
// vertex 8m, foci at z=1 and z=7. The curve is expressed as 14 straight
// tangent segments per fin (the lane's ruled language — curve by
// turning, never applied).
//
// Brass focus pins mark the standing spots; the arch reads as two fins
// against the sky from the theater walk. Real trimesh: footprint ~63m²,
// 3.32m tall — walkable between the fins. No motion, no comps.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ash = mat(0x56503c, 0.95, 0);
// struct-30 refine: the focus pins now glow warm — the whisper seats read
// at dusk from the theater walk (lit-seats law, beacon lineage); no new
// light entity, the pins ARE the lamps.
const brass = mat(C.BRASS, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x8a5a20);
(brass as any).emissiveIntensity = 0.6;

const F = 1.0;          // focal length
const H = 3.2;          // fin height
const HALF = 3.0;       // half-width in y
const SEG = 14;         // segments per fin
const SEP = 8.0;        // vertex-to-vertex separation
const D = 0.34;         // fin thickness

// base slab
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.12, SEP + 4.2), ash);
    slab.name = "slab";
    slab.position.set(0, 0.06, SEP / 2);
    g.add(slab);
}

// one fin: parabola z(x) = x²/(4F), extruded as tangent boxes turning IN
// PLAN (rotation.y) — improve-6: the original build computed the profile
// but never applied the transverse coordinate (segments all at x=0 with
// rotation.x louver tilt), so both fins collapsed into a 0.34m column of
// tilted panels. The whisper fins physically did not exist in the mesh.
function fin(name: string, mirror: boolean) {
    const sign = mirror ? -1 : 1;
    const baseZ = mirror ? SEP : 0;
    const segW = (2 * HALF) / SEG;
    for (let i = 0; i < SEG; i++) {
        const x = -HALF + (i + 0.5) * segW;
        const z = (x * x) / (4 * F);          // local profile
        const dzdx = x / (2 * F);             // plan slope
        const ang = Math.atan(dzdx);
        const len = segW / Math.cos(ang) + 0.03;
        const seg = new THREE.Mesh(new THREE.BoxGeometry(len, H, D), ash);
        seg.name = `${name}_s${i}`;
        seg.position.set(x, H / 2 + 0.12, baseZ + sign * z);
        // local +x must align with the plan tangent (1, ±dzdx); rotation.y=θ
        // maps +x → (cosθ, −sinθ) ⇒ finA (tangent (1, +dzdx)) takes −ang,
        // mirrored finB (tangent (1, −dzdx)) takes +ang.
        seg.rotation.y = mirror ? ang : -ang;
        g.add(seg);
    }
}
fin("finA", false); // opens toward +z (vertex at z=0)
fin("finB", true);  // opens toward -z (vertex at z=8)

// focus pins: brass discs at (0, 1) and (0, 7) — the whisper spots
for (const [i, fz] of [F, SEP - F].entries()) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 12), brass);
    pin.name = `focus_${i}`;
    pin.position.set(0, 0.155, fz);
    g.add(pin);
}

const merged = mergeByMaterial(g, "echoarch");
writeFileSync("agents/arthur/assets/village_echoarch3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_echoarch3.glb");
