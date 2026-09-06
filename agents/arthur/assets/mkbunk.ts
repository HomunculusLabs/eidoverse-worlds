// mkbunk.ts — GUEST BUNKHOUSE at (26,3): long low building, 4 bunk beds
// inside, wide door, lantern hooks. For the agents and friends coming.
// improve-13 (facade value-crush fix): texture-era opt-in — walls carry the
// village timber texMat (wallSpan recipe, tile-dedupes to the same tile),
// 0.22h ashlar stone plinths (kit loop-#97 canon height) under all four
// walls, both back windows seated PROUD of the wall face (improve-12 buried
// -pane class: kit-default z=sZ puts frame+pane at wall-center behind the
// 0.2 wall — only the flared shutters escaped, which read as the survey-2
// "diagonal streak"; family idiom, not a defect), door gets threshold +
// proud timber posts; roof opts into solidRidge + trueGableHalf=(d+2·o)/2.
// Rider keep-out honored: b20 band x∈[−3.11,−1.29] y 0.82..1.28 z 1.97..2.09
// — plinths top out at y 0.48, door furniture x≥−0.77, nothing enters it.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box, gableRoof, windowFrame, doorFrame } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const W = 7.0, D = 4.0, H = 2.35, T = 0.2, DW = 1.3, DH = 2.05;

// texture-era wall material (same params as housekit wallSpan — glbwrite
// tile dedup collapses both to ONE tile across the village)
const wallTimber = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const ashlar = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const wbox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallTimber);
    m.name = name; m.position.set(x, y, z); g.add(m);
};
const plinth = (name: string, w: number, d: number, x: number, z: number) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.22, d + 0.08), ashlar);
    p.name = name; p.position.set(x, 0.26 + 0.11, z); g.add(p);
};

box(g, "bunk_floor", W, 0.26, D, 0, 0.13, 0, C.DARK);
const FY = 0.26;

// door on +Z center; windows on -Z (the source's old "windows flanking on
// +Z" comment lied — decode: only n1/n2 exist, back wall)
const sZ = D / 2 - T / 2;
wbox("bunk_wall_sw", (W - DW) / 2, H, T, -(DW / 2 + (W - DW) / 4), FY + H / 2, sZ);
wbox("bunk_wall_se", (W - DW) / 2, H, T, (DW / 2 + (W - DW) / 4), FY + H / 2, sZ);
box(g, "bunk_lintel", DW, H - DH, T, 0, FY + DH + (H - DH) / 2, sZ, C.BONE);
doorFrame(g, "bunk_door", 0, FY + DH / 2, sZ, DW, DH, "z");
// door dignity (improve-13): threshold stone + proud timber posts — the
// entry reads DOOR at 18m, not a black void
box(g, "bunk_thresh", DW + 0.3, 0.07, 0.5, 0, FY + 0.035, sZ + 0.15, C.MID);
box(g, "bunk_dpost_w", 0.12, 2.25, 0.3, -(DW / 2 + 0.06), FY + 1.125, sZ + 0.05, C.DARK);
box(g, "bunk_dpost_e", 0.12, 2.25, 0.3, (DW / 2 + 0.06), FY + 1.125, sZ + 0.05, C.DARK);
wbox("bunk_wall_n", W, H, T, 0, FY + H / 2, -sZ);
plinth("bunk_plinth_sw", (W - DW) / 2, T, -(DW / 2 + (W - DW) / 4), sZ);
plinth("bunk_plinth_se", (W - DW) / 2, T, (DW / 2 + (W - DW) / 4), sZ);
plinth("bunk_plinth_n", W, T, 0, -sZ);
plinth("bunk_plinth_w", T, D, -(W / 2 - T / 2), 0);
plinth("bunk_plinth_e", T, D, (W / 2 - T / 2), 0);
// windows seated PROUD of the outer face (improve-12 law): outer face at
// -2.0; frame depth 0.14 centered at -2.075 spans -2.145..-2.005 — frame,
// emissive pane, and shutters all outside the wall plane, readable at 18m
windowFrame(g, "bunk_win_n1", -2.0, FY + 1.35, -sZ - 0.175, 0.7, 0.8, "z");
windowFrame(g, "bunk_win_n2", 2.0, FY + 1.35, -sZ - 0.175, 0.7, 0.8, "z");
wbox("bunk_wall_w", T, H, D, -(W / 2 - T / 2), FY + H / 2, 0);
wbox("bunk_wall_e", T, H, D, W / 2 - T / 2, FY + H / 2, 0);

// wide gable roof, deep eaves (sheltered entry); improve-13: solid ridge +
// true gable extent (d+2·over)/2 — kills the staggered-cap ridge dashes and
// the 1.5m plaster horn class (hall D2/inn D1 cure)
gableRoof(g, "bunk_roof", W, D, 1.35, FY + H, 0.6, C.MID, true, (D + 1.2) / 2);

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
// improve-13 night clause: the interior bead above is OCCLUDED from every
// outside vantage by the east door-flank wall (x 0.65..3.5) — improve-12's
// exact buried-lantern class. Entrance bead on the door lintel, centered,
// proud of the wall face (z 2.05, spans 1.97..2.13): y 2.44..2.60 sits above
// the 2.31 door-opening head and the walking band — no collision, b20 keep-out
// (x −3.11..−1.29) untouched, no new light entity (emissive bead, Bill-only
// law honored).
const doorBead = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), lamp.material);
doorBead.name = "lamp";
doorBead.position.set(0, FY + DH + 0.21, sZ + 0.15);
g.add(doorBead);

mergeByMaterial(g, "bhi3");
writeFileSync("agents/arthur/assets/village_bunkhouse.glb", toGLB(g));
console.log("village_bunkhouse.glb —", g.children.length, "nodes");
