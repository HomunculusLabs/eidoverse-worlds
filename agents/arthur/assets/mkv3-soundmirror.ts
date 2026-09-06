// mkv3-soundmirror.ts — STRUCTURES LANE struct-31: R3-5 THE SOUND MIRROR.
// Round 3 (census-derived): the village speaks at the Echo Arch (SE) but
// has nowhere to LISTEN. One idea: the listening dish — a parabolic
// ashlar bowl facing the sky, its focus marked by a single brass ring on
// a slim stand: sounds of the village collect at the ring; stand close
// and the sky focuses there too.
//
// struct-45 (shard row 26) ROOT CAUSE FIX: the original zW = H − r²/(4F)
// INVERTED the parabola — center plateau HIGH, rim LOW — so the dish
// rendered as a three-step ziggurat mound (survey-3/4/5 unanimous:
// "wedding-cake", flat near-black top, gold cross reading gizmo over a
// mound). TRUE form restored: ring centers AT z = r²/(4F) (center ring
// sunk to the plinth surface = the bowl floor, rim course top 0.98m),
// five stepped rings (truer conic read at 18m), stand rising from the
// bowl floor to the true focus (vertex 0.11 + f 1.15 = 1.26m) with the
// brass focus ring AT the focus, framed by the rim. Ashlar moved to the
// family stone texMat lane (struct-38 law — the mottled coursing is the
// curvature cue the plain mat() interior lacked). Furniture-solid
// collider CORRECT (fixed instrument, walked around). No motion, no
// comps. Brass warm emissive unchanged (struct-33 lineage).
import * as THREE from "three";
import { toGLB, texMat, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// struct-38 family law: stone via texMat lane (same family params as
// mkv3-amphi stone — coursed mottled tones, the bowl's curvature cue).
const ash = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// struct-33 refine: the focus ring and stand glow warm — the listening
// seat reads at dusk (lit-seat law, beacon lineage); no new light entity.
const brass = mat(C.BRASS, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x8a5a20);
(brass as any).emissiveIntensity = 0.6;

const F = 1.15, RIM = 2.0;

// base plinth disc
{
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, 0.16, 8), ash);
    pl.name = "plinth";
    pl.position.y = 0.08;
    g.add(pl);
}
// the dish: five stepped parabolic rings, centers ON the true conic
// z = r²/(4F) — center ring sinks to the plinth surface (the bowl
// floor), rim course rises to 0.87 + half-course. The bowl opens UP.
const RINGS = [0.6, 1.0, 1.4, 1.7, 2.0].map((r) => ({ r, z: (r * r) / (4 * F) }));
for (const [ri, ring] of RINGS.entries()) {
    const zW = ring.z;
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
// focus ring: brass torus held in a three-prong crown at the stand head —
// the prongs are the "receiver geometry" survey-3 asked for (a bare rod
// read gizmo/cross; a crown holding a ring reads instrument from any
// angle, including edge-on where the torus alone reads as a bar).
// Ring enlarged to r0.36/tube0.05 so the aperture resolves at 18m.
const FOCUS = 0.11 + F;
{
    const standBot = 0.15, crownY = FOCUS - 0.07; // crown grips ring underside
    const standH = crownY - standBot;
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, standH, 8), brass);
    stand.name = "stand";
    stand.position.y = standBot + standH / 2; // rises from the bowl floor
    g.add(stand);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 10, 32), brass);
    ring.name = "focusring";
    ring.rotation.x = Math.PI / 2;
    ring.position.y = FOCUS;
    g.add(ring);
    // three prongs at 120°, leaning from the stand axis out past the ring —
    // tips pierce ABOVE the ring plane with bead caps: from any azimuth the
    // silhouette reads three separated gold lobes + band (crown), never a
    // single stem+bar (T). ZAI's discriminating fix for the 18m read.
    for (let p = 0; p < 3; p++) {
        const az = (p / 3) * Math.PI * 2 + Math.PI / 6;
        const rTop = 0.33, yTop = FOCUS + 0.055, rBot = 0.045, yBot = crownY;
        const len = Math.hypot(rTop - rBot, yTop - yBot);
        const prong = new THREE.Mesh(new THREE.BoxGeometry(0.035, len, 0.035), brass);
        prong.name = `prong_${p}`;
        prong.position.set(((rTop + rBot) / 2) * Math.sin(az), (yTop + yBot) / 2, ((rTop + rBot) / 2) * Math.cos(az));
        prong.rotation.y = az;
        prong.rotateX(Math.atan2(rTop - rBot, yTop - yBot));
        g.add(prong);
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), brass);
        bead.name = `prongbead_${p}`;
        bead.position.set(rTop * Math.sin(az), yTop, rTop * Math.cos(az));
        g.add(bead);
    }
}

const merged = mergeByMaterial(g, "soundmirror");
writeFileSync("agents/arthur/assets/village_soundmirror3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_soundmirror3.glb");
