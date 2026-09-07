// mkv3-waterstair.ts — STRUCTURES LANE struct-16: U-5 THE WATER STAIR.
// The N-gate's water edge: a stone stair of five broad treads descending
// from the walk grade into a small reflecting shelf (canon WATER), the
// treads' risers stepping down 0.18 each (0.9m total to the shelf),
// flanked by two low stone cheek walls with brass finials. One idea:
// the village steps down to touch its water. Solid furniture collider
// (sit on a tread, don't walk through the cheeks); local +Z = downhill
// toward the water shelf.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// struct-53 (survey-17/18 Sev 3 intake cure, struct-38 law): plain mat()
// exports NO glTF material (toGLB emits only texMat/emissive lanes) -> the
// water surface rendered loader-default near-black (the survey's "dark band
// reads shadow/void, zero blue/gloss"). Cure: canon water material carried
// by the EMISSIVE lane — base 0x506a78 rough 0.25 metal 0.5 (polish-271
// palette) + faint same-hue 0x2e4a58 @0.45 (polish-281 shadowed-water law).
const water = mat(0x506a78, 0.25, 0.5);
(water as any).emissive = new THREE.Color(0x2e4a58);
(water as any).emissiveIntensity = 0.45;
// finials: textured gold (plain brass mat() reads gray at 18m — waysign
// handleTex law / improve-8 no-envmap root cause).
const goldTex = texMat("ws_gold", [0xa09832, 0x887c2a], { rough: 0.85, scale: 2, weights: [3, 1] });

const W = 2.6, TREADS = 5, RISE = 0.18, TREAD_D = 0.42;

// stair: treads descend from z=0 (top, grade) toward +Z
{
    for (let i = 0; i < TREADS; i++) {
        const y = -i * RISE;
        const z = i * TREAD_D + TREAD_D / 2;
        const tread = new THREE.Mesh(new THREE.BoxGeometry(W, RISE, TREAD_D + 0.02), stoneTex);
        tread.name = `tread_${i}`;
        tread.position.set(0, y - RISE / 2, z);
        g.add(tread);
    }
}

// reflecting shelf at the base: stone tray + water surface
{
    const shelfZ = TREADS * TREAD_D + 0.75;
    const tray = new THREE.Mesh(new THREE.BoxGeometry(W + 0.7, 0.5, 1.5), stoneTex);
    tray.name = "shelf";
    tray.position.set(0, TREADS * RISE - 0.9 + 0.25, shelfZ);
    g.add(tray);
    const surf = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, 0.06, 1.3), water);
    surf.name = "shelf_water";
    surf.position.set(0, TREADS * RISE - 0.9 + 0.53, shelfZ);
    g.add(surf);
}

// cheek walls with brass finials
for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, TREADS * TREAD_D + 1.5), stoneTex);
    cheek.name = `cheek_${sx < 0 ? "w" : "e"}`;
    cheek.position.set(sx * (W / 2 + 0.35), 0.15, (TREADS * TREAD_D + 1.5) / 2 - 0.2);
    g.add(cheek);
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), goldTex);
    fin.name = `fin_${sx < 0 ? "w" : "e"}`;
    fin.position.set(sx * (W / 2 + 0.35), 0.15 + 0.95 / 2 + 0.1, 0.1);
    g.add(fin);
}

const merged = mergeByMaterial(g, "waterstair");
writeFileSync("agents/arthur/assets/village_waterstair3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_waterstair3.glb");
