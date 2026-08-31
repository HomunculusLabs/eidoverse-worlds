// mkv3-stable.ts — THE LIVERY (era-3): two-stall open-front stable behind
// the inn (r=40, 0°, facing the village). Same shed pattern as the court:
// 5.4 x 4.2 (22.7m² > 20 gate → trimesh, walkable), lean-to roof, stall
// partition, hay mangers, water trough, tack pegs + harness, hay pile.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box, wallSpan, assertRoomScale } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const W = 5.4, D = 4.2, H = 2.5, T = 0.2, FY = 0.2;
assertRoomScale(W, D, H, "livery-v3");

// tex-49 TIMBER XXI: the livery's fittings join the village families —
// stall partition + rails + hay mangers + water trough + tack pegs +
// pitchfork handle take the timber (built wood, the same boards as the
// fences and racks; byte-identical to wallSpan's), and the pitchfork
// tines take the forge iron (tines are smithed). Hay stays flat (feed),
// trough water stays water, harness + bridle stay flat (leather goods).
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};

// floor + back wall (east) + end walls; OPEN FRONT (west, faces village)
box(g, "floor", W, 0.4, D, 0, 0, 0, C.DARK);
wallSpan(g, "wall_back", W, H, T, 0, FY, D / 2 - T / 2, "x");
wallSpan(g, "wall_n", D - 2 * T, H, T, -(W / 2 - T / 2), FY, 0, "z");
wallSpan(g, "wall_s", D - 2 * T, H, T, W / 2 - T / 2, FY, 0, "z");
// lean-to roof: single slope high at back (D/2) to low at front — raised
// +0.09 so the front edge (2.73) overshoots the wall top (2.70) instead of
// underhanging it (loop #73 fix: was 0.25 offset, front edge dipped to 2.64)
// tex-1: roof slab now carries a thatch tile — 3 muted tones anchored on the
// old flat MID color (continuity: reads as the same material, just real);
// scale 5 ≈ 1m tile → ~0.2m bundle width at world scale
{
    const slopeLen = Math.hypot(D + 0.6, 0.7) + 0.1;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.09, slopeLen), texMat("thatch", [0x787250, 0x888256, 0x6a6644], { rough: 0.92, scale: 5, weights: [2, 1, 1] }));
    slab.name = "roof";
    slab.rotation.x = -Math.atan2(0.7, D + 0.6);
    slab.position.set(0, FY + H + 0.34, 0);
    g.add(slab);
}
// STALL PARTITION down the middle (parallel to back wall)
texBox("partition", D - 2 * T, 1.15, 0.1, 0, FY + 0.575, 0, timberTex);
// half-doors on each stall front (top rail only — open for entry)
for (const sx of [-W / 4, W / 4]) {
    texBox(`stallrail_${sx}`, D / 2 - T, 0.09, 0.07, sx, FY + 1.05, -(D / 2 - T / 2) + (D - 2 * T) / 4, timberTex);
}
// HAY MANGER in each stall (a slanted rack against the partition, both sides)
for (const [si, sz] of [[0, -0.35], [1, 0.35]] as const) {
    texBox(`manger_${si}`, 1.1, 0.3, 0.12, 0, FY + 0.85, sz, timberTex);
    const hay = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 0.14), mat(0xd4da82, 0.95, 0));
    hay.name = `hay_${si}`;
    hay.position.set(0, FY + 1.02, sz);
    g.add(hay);
}
// WATER TROUGH at the front edge (between the stalls, outside the lane)
texBox("trough", 1.4, 0.32, 0.45, 0, 0.16, -(D / 2) - 0.35, timberTex);
box(g, "twater", 1.25, 0.04, 0.34, 0, 0.31, -(D / 2) - 0.35, 0x506a78);
// TACK PEGS + hanging harness on the N wall inside
for (const [ti, tz] of [[0, -0.9], [1, -0.4], [2, 0.5]] as const) {
    texBox(`peg_${ti}`, 0.06, 0.06, 0.22, -W / 2 + 0.18, FY + 1.5, tz, timberTex);
}
box(g, "harness", 0.1, 0.5, 0.42, -W / 2 + 0.2, FY + 1.22, -0.9, 0x7c6832);
box(g, "bridle", 0.08, 0.3, 0.3, -W / 2 + 0.2, FY + 1.3, 0.5, 0x6c5426);
// HAY PILE + pitchfork in the S stall corner
const pile = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), mat(0xd4da82, 0.95, 0));
pile.name = "haypile";
pile.scale.set(1.3, 0.55, 1);
pile.position.set(W / 2 - 0.8, FY + 0.3, -1.2);
g.add(pile);
texBox("fork_handle", 0.04, 1.3, 0.04, W / 2 - 1.4, FY + 0.65, -1.5, timberTex);
texBox("fork_tines", 0.16, 0.18, 0.03, W / 2 - 1.4, FY + 1.34, -1.5, ironTex);

// interior-16 (P2 next-wave): THE GROOM'S CORNER — the stable-life layer.
// Saddle on a timber stand in the back (+z) stall, a small grooming shelf
// (brush + comb) on the partition end, and a hanging lantern by the open
// front so the yard side reads warm at night. Everything inside the
// inherited AABB, off the stall entry lanes and the partition.
{
    // saddle stand + saddle in the back stall corner
    texBox("sad_stand", 0.5, 0.9, 0.28, W / 2 - 0.75, FY + 0.45, 1.5, timberTex);
    texBox("sad_top", 0.55, 0.06, 0.34, W / 2 - 0.75, FY + 0.92, 1.5, timberTex);
    const saddle = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), mat(0x6c4a24, 0.9, 0));
    saddle.name = "saddle";
    saddle.scale.set(1.15, 0.6, 1.3);
    saddle.position.set(W / 2 - 0.75, FY + 1.08, 1.5);
    g.add(saddle);
    // grooming shelf on the partition's open end (brush + comb)
    texBox("groom_shelf", 0.34, 0.04, 0.2, W / 2 - 1.9, FY + 1.0, 0.28, timberTex);
    box(g, "groom_brush", 0.12, 0.05, 0.08, W / 2 - 1.98, FY + 1.05, 0.24, 0x7c6832);
    box(g, "groom_comb", 0.14, 0.03, 0.04, W / 2 - 1.94, FY + 1.04, 0.34, ironTex);
    // lantern by the open front (KEEP glow anchor — the yard reads warm)
    const glowGrp = new THREE.Group();
    glowGrp.name = "glow";
    const lant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.95, roughness: 0.4 }));
    lant.name = "lantern_core";
    lant.position.set(0, FY + 1.9, -(D / 2 - 0.3));
    glowGrp.add(lant);
    g.add(glowGrp);
}

mergeByMaterial(g, "st3");
writeFileSync("agents/arthur/assets/village_stable3.glb", toGLB(g));
console.log("village_stable3.glb —", g.children.length, "nodes");
