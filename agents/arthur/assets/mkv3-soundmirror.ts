// mkv3-soundmirror.ts — STRUCTURES LANE struct-31: R3-5 THE SOUND MIRROR.
// Round 3 (census-derived): the village speaks at the Echo Arch (SE) but
// has nowhere to LISTEN. One idea: the listening dish — a parabolic
// ashlar bowl facing the sky, its focus marked by a single brass ring on
// a slim stand: sounds of the village collect at the ring; stand close
// and the sky focuses there too.
//
// TRUE conic geometry: dish profile z = r²/(4f), f = 1.15m, rim r2.0,
// rim height 0.87m; 16 tangent step segments per ring, three rings
// (ruled language — curve by turning). Furniture-solid collider CORRECT
// (fixed instrument, walked around). No motion, no comps.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ash = mat(0x56503c, 0.95, 0);
// struct-33 refine: the focus ring and stand now glow warm — the listening
// seat reads at dusk (lit-seat law, beacon lineage); no new light entity.
const brass = mat(C.BRASS, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x8a5a20);
(brass as any).emissiveIntensity = 0.6;

const F = 1.15, RIM = 2.0, H = 0.87;

// base plinth disc
{
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, 0.16, 8), ash);
    pl.name = "plinth";
    pl.position.y = 0.08;
    g.add(pl);
}
// the dish: three stepped parabolic rings
const RINGS = [
    { r: 0.8, z: (0.8 * 0.8) / (4 * F) },
    { r: 1.4, z: (1.4 * 1.4) / (4 * F) },
    { r: 2.0, z: (2.0 * 2.0) / (4 * F) },
];
for (const [ri, ring] of RINGS.entries()) {
    const zW = H - ring.z; // dish opens upward: rim lowest curvature at top
    const segN = 16;
    for (let i = 0; i < segN; i++) {
        const a = ((i + 0.5) / segN) * Math.PI * 2;
        const step = new THREE.Mesh(
            new THREE.BoxGeometry(2 * ring.r * Math.sin(Math.PI / segN) + 0.04, 0.22, 0.26),
            ash,
        );
        step.name = `dish_${ri}_${i}`;
        step.position.set(ring.r * Math.sin(a), zW, ring.r * Math.cos(a));
        step.rotation.y = a;
        g.add(step);
    }
}
// focus ring: brass torus on a slim stand at the focal point (above center)
{
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.05, 8), brass);
    stand.name = "stand";
    stand.position.y = H - (RINGS[0].z) / 2 + 0.5;
    g.add(stand);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 28), brass);
    ring.name = "focusring";
    ring.rotation.x = Math.PI / 2;
    ring.position.y = H + 0.35;
    g.add(ring);
}

const merged = mergeByMaterial(g, "soundmirror");
writeFileSync("agents/arthur/assets/village_soundmirror3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_soundmirror3.glb");
