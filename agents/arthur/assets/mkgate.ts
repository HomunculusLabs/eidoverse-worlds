// mkgate.ts — village gate on the hearth path: two carved stone posts +
// bone lintel + hanging sign. Marks the village boundary coming from the
// founder's courtyard.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// lift-3 families: ashlar for the cut-stone posts/caps/carve-rings (the
// quarry tile, standing params — byte-family law); forge iron for the
// hanging chains (tex-83 keyhook law).
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
};
// posts (tapered via two boxes)
for (const s of [-1, 1]) {
    texBox(`gate_post_${s < 0 ? "w" : "e"}_a`, 0.42, 1.7, 0.42, s * 1.5, 0.85, 0, stoneTex);
    texBox(`gate_post_${s < 0 ? "w" : "e"}_b`, 0.34, 0.9, 0.34, s * 1.5, 2.15, 0, stoneTex);
    texBox(`gate_cap_${s < 0 ? "w" : "e"}`, 0.5, 0.16, 0.5, s * 1.5, 2.68, 0, stoneTex);
    // polish-272: finish the crown — the cap slab alone read clipped at
    // gameplay distance (same unfinished-crown class as the carousel and
    // tower before their accepted spires). Brass collar + tapered gold
    // spire, the accepted crown language at gate scale. First placement
    // (on the post cap, y 2.76..3.31) was falsified by the render rig:
    // the lintel (top y 3.09) occludes the cap zone at x ±1.5 — only
    // sub-threshold tips survived. Crown re-based on the lintel top where
    // it crosses each post, fully in the open.
    box(g, `gate_collar_${s < 0 ? "w" : "e"}`, 0.36, 0.1, 0.36, s * 1.5, 3.14, 0, C.BRASS);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.45, 8), mat(0xdada70, 0.35, 0.6));
    spire.name = `gate_spire_${s < 0 ? "w" : "e"}`;
    spire.position.set(s * 1.5, 3.415, 0);
    g.add(spire);
    // carve rings (coursed stone bands, the coursed-ashlar read)
    for (const y of [0.6, 1.1, 1.6]) texBox(`gate_carve_${s < 0 ? "w" : "e"}_${y}`, 0.46, 0.06, 0.46, s * 1.5, y, 0, stoneTex);
}
// lintel
box(g, "gate_lintel", 3.6, 0.28, 0.4, 0, 2.95, 0, C.BONE);
// hanging sign (dark board, bone glyph dots)
box(g, "gate_sign", 1.1, 0.55, 0.07, 0, 2.35, 0.12, C.DARK);
for (let i = 0; i < 5; i++) box(g, `gate_glyph_${i}`, 0.09, 0.09, 0.03, -0.3 + i * 0.15, 2.35 + (i % 2 ? 0.12 : -0.12), 0.17, C.BONE);
texBox("gate_chain_l", 0.04, 0.28, 0.04, -0.4, 2.78, 0.12, ironTex);
texBox("gate_chain_r", 0.04, 0.28, 0.04, 0.4, 2.78, 0.12, ironTex);

// lift-3: THE VILLAGE GATE JOINS THE FAMILIES — the gate stood vertex-color-
// only at the village's main threshold while every lane that carried stone
// or metal was converted around it (the quarry, the walls, even the keyhook
// in the inn). Material truth: the posts and carved ring-courses are CUT
// STONE → ashlar (the quarry law: cut stone wears the quarry's tile, and
// these posts are the first stone a friend meets); the lintel is a worked
// BONE beam → stays flat (bone is bone, the glyph dots' own law); the
// hanging chains are smithed links → forge iron (the tex-83 keyhook law at
// gate scale); the sign board stays flat DARK (painted lettering, the sign
// law) and the glyph dots stay flat BONE (lettering, not structure).
mergeByMaterial(g, "gate3");
writeFileSync("agents/arthur/assets/village_gate.glb", toGLB(g));
console.log("village_gate.glb —", g.children.length, "nodes (merged)");
