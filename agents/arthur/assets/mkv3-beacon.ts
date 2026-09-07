// mkv3-beacon.ts — STRUCTURES LANE struct-11: U-2 THE EAST BEACON.
// The night landmark: a slim stone tower (2.6m square, 7.6m) on the E
// approach — harmonic slit windows up the shaft, an open lantern room at
// the top with emissive amber glass on all four sides (the windowFrame
// pane law), brass cap + finial. The lantern glass is one KEEP group
// `lamp` (emissive anchor; a companion light entity delivers the real
// night read via the placer's light verb — Night Table pattern).
// One idea: a lit tower marking the village's east door.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// struct-52: slit windows were proud C.DARK boxes — near-pure-black fill
// with zero inner-face gradient read as void holes on the solid column
// (survey-17 Sev 2 fallback; native re-judge CONFIRMED the fill class,
// dropped the severity at 18m). Fix = the struct-12 lit-window law: warm
// emissive panes echoing the Observatory's drum slits across the village.

const g = new THREE.Group();
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const brass = mat(C.BRASS, 0.55, 0);
const dark = mat(C.DARK, 0.95, 0);

const W = 2.6, H = 6.4, LANTERN_Y = H, LH = 1.2;

// shaft: four corner piers + infill panels with slit windows
{
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(0.5, H, 0.5), stoneTex);
        pier.name = `pier_${sx}${sz}`;
        pier.position.set(sx * (W / 2 - 0.25), H / 2, sz * (W / 2 - 0.25));
        g.add(pier);
    }
    // four walls, thin, with harmonic slits (3 per wall at heights 1.6/3.2/4.8)
    for (const axis of ["z", "x"] as const) {
        for (const side of [-1, 1] as const) {
            const wall = new THREE.Mesh(
                axis === "z" ? new THREE.BoxGeometry(W - 0.5, H, 0.22) : new THREE.BoxGeometry(0.22, H, W - 0.5),
                stoneTex,
            );
            wall.name = `wall_${axis}${side < 0 ? "n" : "p"}`;
            wall.position.set(axis === "z" ? 0 : side * (W / 2 - 0.11), H / 2, axis === "z" ? side * (W / 2 - 0.11) : 0);
            g.add(wall);
        }
    }
    // struct-52 v2: the original 12 dark slit boxes are DELETED — a solid
    // dark slab fully occludes any pane behind it (v1 FAIL: 0 warm px at
    // night, 3528 in the lantern control), and 2cm reveal borders cannot
    // read at 18m anyway. The stone wall is the frame; the lit panes sit
    // seated IN the wall face (inner -0.02 embedded, outer +0.04 proud).
    const slitGlass = new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xfeec78, emissiveIntensity: 0.9, roughness: 0.4 });
    for (const hgt of [1.6, 3.2, 4.8]) {
        for (const axis of ["z", "x"] as const) {
            for (const side of [-1, 1] as const) {
                const pane = new THREE.Mesh(
                    axis === "z" ? new THREE.BoxGeometry(0.26, 0.78, 0.06) : new THREE.BoxGeometry(0.06, 0.78, 0.26),
                    slitGlass,
                );
                pane.name = `slitpane_${axis}${side < 0 ? "n" : "p"}_${hgt}`;
                pane.position.set(axis === "z" ? 0 : side * (W / 2 + 0.01), hgt, axis === "z" ? side * (W / 2 + 0.01) : 0);
                g.add(pane);
            }
        }
    }
}

// LANTERN ROOM: open posts + emissive glass + brass cap + finial.
// The glass is one KEEP group `lamp` so the name survives merge.
const lamp = new THREE.Group();
lamp.name = "lamp";
{
    const GR = 0.85; // glass half-width
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb35a, emissiveIntensity: 1.35, roughness: 0.35 });
    for (const axis of ["z", "x"] as const) {
        for (const side of [-1, 1] as const) {
            const pane = new THREE.Mesh(
                axis === "z" ? new THREE.BoxGeometry(2 * GR - 0.1, LH - 0.2, 0.06) : new THREE.BoxGeometry(0.06, LH - 0.2, 2 * GR - 0.1),
                glassMat,
            );
            pane.name = `lpane_${axis}${side < 0 ? "n" : "p"}`;
            pane.position.set(axis === "z" ? 0 : side * GR, LANTERN_Y + LH / 2, axis === "z" ? side * GR : 0);
            lamp.add(pane);
        }
    }
    // corner posts of the lantern room (dark)
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, LH + 0.25, 0.14), dark);
        post.name = `lpost_${sx}${sz}`;
        post.position.set(sx * GR, LANTERN_Y + (LH + 0.25) / 2, sz * GR);
        lamp.add(post);
    }
    g.add(lamp);
}
// brass cap: pyramid roof + finial bead
{
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.85, 4), brass);
    cap.name = "cap";
    cap.rotation.y = Math.PI / 4;
    cap.position.set(0, LANTERN_Y + LH + 0.45, 0);
    g.add(cap);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), brass);
    bead.name = "finial";
    bead.position.set(0, LANTERN_Y + LH + 1.0, 0);
    g.add(bead);
}
// base plinth
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(W + 0.5, 0.3, W + 0.5), stoneTex);
    plinth.name = "plinth";
    plinth.position.y = 0.15;
    g.add(plinth);
}

const merged = mergeByMaterial(g, "beacon");
writeFileSync("agents/arthur/assets/village_beacon3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_beacon3.glb");
