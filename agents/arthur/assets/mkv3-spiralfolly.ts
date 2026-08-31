// mkv3-spiralfolly.ts — STRUCTURES LANE struct-20: R2-2 SPIRAL STAIR FOLLY.
// Round-2 commission: "freestanding golden-ratio stair-to-sky at the NE
// spoke terminus (near the pendulum), bone balustrade."
//
// One idea: a stair that ends in the sky. A single logarithmic ribbon —
// radii in exact golden ratio (r0=3.1 -> r1=3.1/φ=1.92) — winds 3 turns
// up a dark spine to a height that is φ × the base width (h=10.0 vs
// footprint 6.2m across), where the ribbon's final step meets a brass
// ring floating open to the air: the last stair, going nowhere, facing
// the sky. Silhouette: a white spiral climbing to a ring. Reads before
// any detail, Judd-clear.
//
// Honest limits: ramp NOT standable (engine non-standable-trimesh class,
// same as Shell Tower struct-3) — it is a folly by commission, crowned
// not climbed. The interior under the spiral IS walkable (footprint
// 38.5m² ≥16, height 10.2 ≥2.2 → real trimesh).
// No motion, no comps. Node budget: bone ribbon / timber treads / dark
// spine+pads / brass crown ring / stone base = 5 buckets.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C, spiralRamp } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const PHI = (1 + Math.sqrt(5)) / 2;
const R0 = 3.1, R1 = R0 / PHI, TURNS = 3, TOP = 10.0;
const bone = mat(C.BONE, 0.9, 0);
const timber = mat(C.DARK, 0.95, 0); // treads: dark timber family
const dark = mat(C.DARK, 0.95, 0);
const brass = mat(C.BRASS, 0.55, 0);
const stoneTex = mat(0x56503c, 0.95, 0);

// stone base disc (thin, r3.3 — under the first sweep)
{
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.14, 32), stoneTex);
    base.name = "base";
    base.position.y = 0.07;
    g.add(base);
}

// the golden ribbon: bone balustrade + dark timber treads
spiralRamp(g, "ribbon", R0, R1, TURNS, 0.14, TOP, 104, 0.34, 0.5, 0, bone, timber);

// dark spine (the climb's axis)
{
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, TOP + 0.2, 12), dark);
    spine.name = "spine";
    spine.position.y = (TOP + 0.2) / 2;
    g.add(spine);
    // footing pads: plant the spine and first sweep to the ground
    for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const rr = R0 * Math.pow(R1 / R0, (a % (Math.PI * 2)) / (Math.PI * 2));
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.7), dark);
        pad.name = `pad_${k}`;
        pad.position.set(rr * Math.sin(a), 0.07, rr * Math.cos(a));
        pad.rotation.y = a;
        g.add(pad);
    }
}

// the crown: a brass ring floating open at the top — the stair's last
// word. Radius = the ribbon's top radius; the ribbon's final step runs
// into it. Nothing beyond it but sky.
{
    const crown = new THREE.Mesh(new THREE.TorusGeometry(R1, 0.055, 8, 48), brass);
    crown.name = "crown";
    crown.rotation.x = Math.PI / 2;
    crown.position.y = TOP + 0.5;
    g.add(crown);
}

const merged = mergeByMaterial(g, "spiralfolly");
writeFileSync("agents/arthur/assets/village_spiralfolly3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_spiralfolly3.glb");
