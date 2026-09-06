// mkv3-skymirror.ts — STRUCTURES LANE struct-24: R2-5 SKY MIRROR PLINTH.
// Round-2 commission: "still-water reflecting plinth at the observatory
// forecourt." One idea: the sky, caught in a stone cup — a low ashlar
// plinth carrying a still canon-WATER mirror; whatever is above it is
// below it too. The observatory's dome reads doubled in the mirror on
// the plaza approach.
//
// COMPOSITION: hexagonal ashlar plinth (r1.3, three diminishing courses
// 0.36/0.30/0.24 — a halving rhythm toward the water), water film inside
// the top course rim (life-stays-flat), brass gnomon bead at the center
// (the one point the mirror holds still). Furniture-solid collider
// CORRECT: 0.90m tall, 6.1m² — a fixed feature (Skene Wall class).
// No motion, no comps.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ash = mat(0x56503c, 0.95, 0);
// struct-37 iter 4: brass desaturated gray-olive without envmap (improve-8/
// struct-36 law) — the bead takes the waysign textured-gold family instead.
const goldTex = texMat("mirror_gold", [0xa09832, 0x887c2a], { rough: 0.9, scale: 2, weights: [3, 1] });

// three hexagonal courses, shrinking — top course is an OPEN CUP, not a
// solid. struct-37 root cause (row 12): the original solid top course
// (y 0.66..0.90, r1.06) entirely buried the water disc (top face 0.835),
// so zero water was ever visible and the plinth read as a stacked-stone
// "tire-stack" (survey-1 native-confirmed identity failure). Fix follows
// the polish-281 open-tank law: water sits DOWN inside the rim and carries
// a faint same-hue emissive so the shadowed basin never reads as a hole.
const RS = [1.3, 1.18, 1.06];
const HS = [0.36, 0.30, 0.24];
let y = 0;
for (let i = 0; i < 2; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(RS[i], RS[i] + 0.04, HS[i], 6), ash);
    c.name = `course_${i}`;
    c.position.y = y + HS[i] / 2;
    c.rotation.y = i * Math.PI / 6; // alternating facet alignment
    g.add(c);
    y += HS[i];
}
// course 2: open hex cup — six wall slabs (inner apothem 0.93, outer 1.06)
// plus a floor plate; cavity holds the water.
{
    const inner = 0.93, outer = 1.06;
    const t = outer - inner;
    const aMid = (inner + outer) / 2;
    const sLen = 2 * aMid * Math.tan(Math.PI / 6) + t; // side length + corner close
    for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3 + Math.PI / 6; // facets aligned like course_2 was
        const slab = new THREE.Mesh(new THREE.BoxGeometry(sLen, HS[2], t * 1.4), ash);
        slab.name = `cup_${k}`;
        slab.position.set(Math.cos(a) * aMid, y + HS[2] / 2, Math.sin(a) * aMid);
        slab.rotation.y = Math.PI / 2 - a; // local depth axis points radially
        g.add(slab);
    }
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.05, 6), ash);
    floor.name = "cup_floor";
    floor.position.y = y + 0.025;
    floor.rotation.y = 2 * Math.PI / 6;
    g.add(floor);
}
// the mirror: still water set DOWN inside the cup — top face at 0.86,
// 4cm under the 0.90 rim (protected from glancing views, visible from
// every standing angle). Faint same-hue emissive per polish-281.
{
    const wmat = mat(0x8fb6c8, 0.15, 0.3);
    (wmat as any).emissive = new THREE.Color(0x2e4a58);
    // struct-37 iteration 2: recessed water reads only ~3px at 18m grazing
    // (single key light cannot reach into the cup) — emissive carries the
    // read at range. 0.45 -> 0.7 lifted water ~55% but the 2.6-degree
    // grazing projection caps the disc at ~2px; 1.0 is the final push —
    // still same-hue dark tone (max channel 88/255), no bulb read.
    (wmat as any).emissiveIntensity = 1.0;
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.93, 0.05, 24), wmat);
    w.name = "mirror";
    w.position.y = y + HS[2] - 0.07;
    g.add(w);
}
// brass gnomon bead — the still point, half-submerged at the water's center
{
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), goldTex);
    b.name = "gnomon";
    b.position.y = y + HS[2] - 0.02;
    g.add(b);
}

const merged = mergeByMaterial(g, "skymirror");
writeFileSync("agents/arthur/assets/village_skymirror3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_skymirror3.glb");
