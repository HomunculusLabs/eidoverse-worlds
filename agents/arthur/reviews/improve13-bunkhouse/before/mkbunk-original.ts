// mkbunk.ts — GUEST BUNKHOUSE at (26,3): long low building, 4 bunk beds
// inside, wide door, lantern hooks. For the agents and friends coming.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C, box, gableRoof, windowFrame, doorFrame } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const W = 7.0, D = 4.0, H = 2.35, T = 0.2, DW = 1.3, DH = 2.05;

box(g, "bunk_floor", W, 0.26, D, 0, 0.13, 0, C.DARK);
const FY = 0.26;

// door on +Z center; windows flanking on +Z and one each side wall
const sZ = D / 2 - T / 2;
box(g, "bunk_wall_sw", (W - DW) / 2, H, T, -(DW / 2 + (W - DW) / 4), FY + H / 2, sZ, C.STONE);
box(g, "bunk_wall_se", (W - DW) / 2, H, T, (DW / 2 + (W - DW) / 4), FY + H / 2, sZ, C.STONE);
box(g, "bunk_lintel", DW, H - DH, T, 0, FY + DH + (H - DH) / 2, sZ, C.BONE);
doorFrame(g, "bunk_door", 0, FY + DH / 2, sZ, DW, DH, "z");
box(g, "bunk_wall_n", W, H, T, 0, FY + H / 2, -sZ, C.STONE);
windowFrame(g, "bunk_win_n1", -2.0, FY + 1.35, -sZ, 0.7, 0.8, "z");
windowFrame(g, "bunk_win_n2", 2.0, FY + 1.35, -sZ, 0.7, 0.8, "z");
box(g, "bunk_wall_w", T, H, D, -(W / 2 - T / 2), FY + H / 2, 0, C.STONE);
box(g, "bunk_wall_e", T, H, D, W / 2 - T / 2, FY + H / 2, 0, C.STONE);

// wide gable roof, deep eaves (sheltered entry)
gableRoof(g, "bunk_roof", W, D, 1.35, FY + H, 0.6);

// 4 bunks along the west wall (two stacked pairs)
for (let i = 0; i < 2; i++) {
    const z = -1.1 + i * 2.2;
    for (const y of [FY + 0.42, FY + 1.25]) {
        const tier = y === FY + 0.42 ? "lo" : "hi";
        box(g, `bunk_bed_${i}_${tier}`, 0.95, 0.09, 1.9, -(W / 2 - 0.62), y, z, C.MID);
        box(g, `bunk_mat_${i}_${tier}`, 0.85, 0.08, 1.8, -(W / 2 - 0.62), y + 0.08, z, C.DARK);
        box(g, `bunk_pillow_${i}_${tier}`, 0.72, 0.1, 0.36, -(W / 2 - 0.62), y + 0.17, z + 0.65, C.BONE);
        box(g, `bunk_blanket_${i}_${tier}`, 0.8, 0.06, 0.72, -(W / 2 - 0.62), y + 0.16, z - 0.42, (i + (tier === "hi" ? 1 : 0)) % 2 ? 0x5e6c7a : 0x8a7448);
    }
    // posts
    for (const dz of [-0.9, 0.9]) box(g, `bunk_post_${i}_${dz}`, 0.08, 1.35, 0.08, -(W / 2 - 0.18), FY + 0.67, z + dz, C.DARK);
}

// interior-9 / built-in art: four serial wall cubbies, one per sleeper.
// Judd-like repetition is functional: folded kits + brass rule-tags, high on
// the east wall and outside the centered entry lane.
box(g, "cubby_back", 0.06, 0.72, 3.2, W / 2 - 0.12, FY + 1.48, 0, C.MID);
box(g, "cubby_top", 0.24, 0.08, 3.2, W / 2 - 0.18, FY + 1.88, 0, C.DARK);
box(g, "cubby_bottom", 0.24, 0.08, 3.2, W / 2 - 0.18, FY + 1.08, 0, C.DARK);
for (const [di, dz] of [[0, -1.6], [1, -0.8], [2, 0], [3, 0.8], [4, 1.6]] as const)
    box(g, `cubby_div_${di}`, 0.24, 0.72, 0.06, W / 2 - 0.18, FY + 1.48, dz, C.DARK);
for (const [ci, cz] of [[0, -1.2], [1, -0.4], [2, 0.4], [3, 1.2]] as const) {
    box(g, `cubby_kit_${ci}`, 0.18, 0.22, 0.48, W / 2 - 0.34, FY + 1.25, cz, ci % 2 ? 0x5e6c7a : 0x8a7448);
    box(g, `cubby_tag_${ci}`, 0.03, 0.12, 0.28, W / 2 - 0.39, FY + 1.68, cz, C.BRASS);
}

// entry lantern hook
box(g, "bunk_hook", 0.08, 0.08, 0.3, 0.8, FY + 2.0, sZ - 0.1, C.DARK);
const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: 0xffc98a, emissiveIntensity: 0.9, roughness: 0.4 }));
lamp.name = "lamp";
lamp.position.set(0.8, FY + 1.88, sZ - 0.1);
g.add(lamp);

mergeByMaterial(g, "bhi3");
writeFileSync("agents/arthur/assets/village_bunkhouse.glb", toGLB(g));
console.log("village_bunkhouse.glb —", g.children.length, "nodes");
