// mkv3-stable.ts — THE LIVERY (era-3): two-stall open-front stable behind
// the inn (r=40, 0°, facing the village). Same shed pattern as the court:
// 5.4 x 4.2 (22.7m² > 20 gate → trimesh, walkable), lean-to roof, stall
// partition, hay mangers, water trough, tack pegs + harness, hay pile.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box, wallSpan, windowFrame, assertRoomScale } from "./housekit.ts";
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

// floor + end walls; OPEN FRONT (west, faces village)
box(g, "floor", W, 0.4, D, 0, 0, 0, C.DARK);
// improve-11 ROAD-SIDE (local +z) BACK WALL → REAL LIVERY ENTRANCE. The
// open front faces EAST under the standing yaw (world); the inn road
// dead-ends at this +z wall — it is the walker's arrival face and was a
// 5.4m blank run (survey-1 native: no entrance, chest/monument read).
// Door is OFF-CENTER x∈[−2.05,−0.65] because the livery-sign rider
// nx-sign-stable-001 occupies wall-center (local x±0.25, y 2.02..2.7,
// z 1.94..2.26) — keep-out honored, rider untouched.
{
    // flank E x∈[−0.65,2.7] (len 3.35): wallSpan keeps plinth + timber,
    // carries the sign + a lit window
    wallSpan(g, "wall_back_e", 3.35, H, T, 1.025, FY, D / 2 - T / 2, "x", C.STONE);
    // improve-12: pane seated PROUD of the wall's outer face (wall spans
    // z 1.9..2.1; kit default z puts the emissive pane 0.1m BEHIND the face
    // where it can never render — the buried-pane class, decode-caught).
    // z = wall center + 0.09 → pane front 2.105 clears face 2.1, bone frame
    // proud 0.06, shutters flare from 2.21.
    windowFrame(g, "stable_win_e", 1.8, FY + 1.45, D / 2 - T / 2 + 0.09, 0.7, 0.75, "z");
    // flank W x∈[−2.7,−2.05] (len 0.65)
    wallSpan(g, "wall_back_w", 0.65, H, T, -2.375, FY, D / 2 - T / 2, "x", C.STONE);
    // timber lintel beam over the opening (y 2.4..2.56, spans x −2.15..−0.62,
    // 0.37 clear of the sign rider's west edge at census x −0.25)
    texBox("doorhead", 1.53, 0.16, T * 1.7, -1.385, FY + 2.48, D / 2 - T / 2, timberTex);
    // proud timber door posts OUTSIDE the gap edges (kit jamb law: the 1.4m
    // clear span stays clear; h 1.8 keeps them below the sign rider's
    // y 2.02 — above them the flank walls + head carry the case)
    texBox("doorpost_w", 0.14, 1.8, 0.34, -2.12, FY + 0.9, D / 2 - T / 2, timberTex);
    texBox("doorpost_e", 0.14, 1.8, 0.34, -0.58, FY + 0.9, D / 2 - T / 2, timberTex);
    // threshold + stoop at grade (kit doorGapWall semantics)
    box(g, "doorstep", 1.4, 0.22, T * 1.6, -1.35, 0.11, D / 2 - T / 2, C.MID);
    box(g, "stoop", 1.55, 0.21, 0.65, -1.35, 0.105, D / 2 + 0.15, C.STONE);
    // door leaf parked OPEN: hinged at the W gap edge, swung inward flat
    // against flank W's inner face (x −2.05..−2.0, swing pocket z 1.36..2.0;
    // touches the aisle boundary at a single plane, zero width intrusion)
    texBox("doorleaf", 0.05, 2.05, 0.64, -2.025, FY + 1.025, 1.68, timberTex);
}
wallSpan(g, "wall_n", D - 2 * T, H, T, -(W / 2 - T / 2), FY, 0, "z", C.STONE);
wallSpan(g, "wall_s", D - 2 * T, H, T, W / 2 - T / 2, FY, 0, "z", C.STONE);
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
// STALL PARTITION (parallel to back wall) — improve-11: cut to x∈[−0.65,1.9]
// (2.55 long, center 0.625) so the road-side door aisle x∈[−2.0,−0.7] runs
// from the stoop straight through to the open front with no obstruction.
texBox("partition", 2.55, 1.15, 0.1, 0.625, FY + 0.575, 0, timberTex);
// half-doors on each stall front (top rail only — open for entry).
// improve-11: the W rail (x∈[−2.3,−0.4] at y 1.01..1.11) crossed the new
// road-side door aisle at chest height — REMOVED (this is the door's bay
// now; the parked doorleaf + stoop own the entrance furniture). The E rail
// moves to the open-front edge z −1.85 (its semantic home as the E stall's
// half-door, out of the through-aisle entirely).
texBox(`stallrail_e`, 1.9, 0.09, 0.07, 1.35, FY + 1.05, -1.85, timberTex);
// HAY MANGER in each stall (a slanted rack against the partition, both sides)
for (const [si, sz] of [[0, -0.35], [1, 0.35]] as const) {
    texBox(`manger_${si}`, 1.1, 0.3, 0.12, 0, FY + 0.85, sz, timberTex);
    const hay = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 0.14), mat(0xd4da82, 0.95, 0));
    hay.name = `hay_${si}`;
    hay.position.set(0, FY + 1.02, sz);
    g.add(hay);
}
// WATER TROUGH at the front edge (between the stalls, outside the lane)
// improve-11: shifted z −2.45 → −2.55 (clears the new front curb by 0.145
// and the b8 reins z-band by 0.09)
texBox("trough", 1.4, 0.32, 0.45, 0, 0.16, -(D / 2) - 0.45, timberTex);
box(g, "twater", 1.25, 0.04, 0.34, 0, 0.31, -(D / 2) - 0.45, 0x506a78);
// improve-11 D2 fix: stone curb at the open front — the C.DARK floor slab's
// bare 0.4m edge read as a black void band (survey-1); the walled sides
// carry wallSpan plinths, the open front carried nothing. Curb runs the
// full open-front edge at grade (x −2.7..2.7), same texMat stone recipe as
// the kit plinths (merges into the stone bucket). Sides run z −2.1..−1.4
// only (clear of trough z −2.775..−2.325; wall N/S plinths cover the rest).
{
    const curbMat = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
    const curb = (name: string, w: number, h: number, d: number, x: number, y: number, z: number) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), curbMat);
        m.name = name; m.position.set(x, y, z); g.add(m);
    };
    // full open-front edge EXCEPT the center yard gap x∈[−1,1] (the lawn-side
    // entry between stall fronts stays curb-free); same stone recipe as the
    // kit plinths (merges). Sides run z −2.1..−1.4 only (clear of trough).
    curb("curb_front_w", 1.7, 0.24, 0.14, -1.85, 0.12, -(D / 2) - 0.05);
    curb("curb_front_e", 1.7, 0.24, 0.14, 1.85, 0.12, -(D / 2) - 0.05);
    curb("curb_n", 0.14, 0.24, 0.7, -(W / 2) - 0.05, 0.12, -1.75);
    curb("curb_s", 0.14, 0.24, 0.7, W / 2 + 0.05, 0.12, -1.75);
}
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
    // improve-12: entrance lantern on the door head — the road-side arrival
    // face was emissive-dead at night (night.png max R 42) because the only
    // glow sat at the far open-front. Same bead recipe as the yard lantern
    // (polish-278 ember-marker law), seated under the lintel at the door's
    // E edge — clears the sign rider keep-out (x -0.43 vs rider x≥-0.25...-0.32
    // band is at y≥1.96; bead at y 2.3 x -0.43 sits between rider and gap).
    const dlant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
    dlant.name = "door_lantern";
    dlant.position.set(-0.55, FY + 2.3, D / 2 - T / 2 + 0.05);
    glowGrp.add(dlant);
    g.add(glowGrp);
}

mergeByMaterial(g, "st3");
writeFileSync("agents/arthur/assets/village_stable3.glb", toGLB(g));
console.log("village_stable3.glb —", g.children.length, "nodes");
