// mkv3-monument.ts — THE FOUNDER'S KNOT: brass torus knot (era-1's beloved
// monument, reborn for the radial village) on a stepped stone plinth at the
// SW plaza diagonal (r=9, 225°). Named group "knot" = slow spin comp.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
// plaza-palette HARD LAW GUARD: the knot rebuilds byte-identical to live 9520e61f.
// Shadow the rotated canon with the frozen original constants (knot is signature work; the
// golden-hour rotation does NOT touch it — live/disk stay at 9520e61f).
const C_OLD = { STONE: 0x4a4038, DARK: 0x3a322b, BRASS: 0x8f7a4d, BONE: 0xcfc4ae, MID: 0x6b5d4f };


const g = new THREE.Group();
// tex-18 STONE V: the Founder's Knot's plinth joins the ashlar family —
// all three stepped tiers take the village stone tile (cell law — a
// monument's base is laid stone, the same coursed blocks as every plinth
// in the village); approach pavers join the soil family (walked surface,
// the soil law); knot, beads, bowls, plaque, and lamp stay flat (brass,
// bone, emissive — material truth).
const stoneTex = texMat("stone", [0x4a4038, 0x524a41, 0x423a32], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const soilTex = texMat("soil-0", [0x6b5d4f, 0x746656, 0x5f5344], { rough: 0.97, scale: 3, weights: [2, 1, 1], seed: 1000 });
const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};
// stepped plinth: 3 stone tiers (footprint under 2m² per tier → no room
// collider; the plinth is a small-object pillar)
texBox("tier_0", 2.2, 0.3, 2.2, 0, 0.15, 0, stoneTex);
texBox("tier_1", 1.7, 0.3, 1.7, 0, 0.45, 0, stoneTex);
texBox("tier_2", 1.25, 0.3, 1.25, 0, 0.75, 0, stoneTex);
// dedication band (darker ring on the top tier edge)
// tex-59: the band joins the family — a carved ring is still the
// plinth's stone (the tile's own tone shift replaces the flat dark)
texBox("band", 1.35, 0.08, 1.35, 0, 0.92, 0, stoneTex);
// DEDICATION PLAQUE: bone tablet on the NE plinth face (faces the plaza
// center at 225°+180) with 3 engraved line bars — the founding words
box(g, "plaque", 0.72, 0.44, 0.05, 0, 0.45, 0.9, C_OLD.BONE);
for (const [li, ly] of [[0, 0.55], [1, 0.45], [2, 0.35]] as const) {
    box(g, `pline_${li}`, 0.5, 0.045, 0.06, 0, ly, 0.91, C_OLD.DARK);
}
// offering bowls at the two front corners (small brass dishes on stubs)
// tex-59: the stubs are little stone pedestals — the ashlar family
// (the pond-lip law at miniature scale); the brass bowls stay flat
// (material truth — brass is brass, the monument-bowl precedent)
for (const [oi, ox, oz] of [[0, 0.85, 0.85], [1, -0.85, 0.85]] as const) {
    const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.24, 6), stoneTex);
    stub.name = `ostub_${oi}`;
    stub.position.set(ox, 0.12, oz);
    g.add(stub);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 0.1, 8), mat(0x8f7a4d, 0.4, 0.6));
    bowl.name = `obowl_${oi}`;
    bowl.position.set(ox, 0.29, oz);
    g.add(bowl);
}
// paved approach: 4 stones from the plaza ring toward the plaque face (+Z)
for (let ap = 0; ap < 4; ap++) {
    texBox(`apave_${ap}`, 0.8, 0.05, 0.55, 0, 0.025, 1.6 + ap * 0.9, soilTex);
}
// THE KNOT: named group (motion:knot — slow spin); brass torus knot centered
// at group origin so the spin axis passes through its heart
const knot = new THREE.Group();
knot.name = "knot";
knot.position.y = 2.05;
// polish-319: the knot — the monument's namesake — read as a dark mass at
// night (judge, live-light rig: "the focal object is the darkest interesting
// thing in frame; the brass never catches the lamps"). mat() exported
// COLOR_0-only (polish-307 class). Same-hue warm self-lit treatment
// (polish-287/290 lineage). THREE measured rounds:
//   v1 @ 0.35 REJECTED: emissiveFactor is LINEAR — 0.35 -> ~160 sRGB added
//   to the tube in ALL lighting; day knotclose p10 0->131 milky wash
//   (polish-287 day-invisibility law).
//   v2 @ 0.025 + rough .28/metal .9 REJECTED at the live-light probe: the
//   smooth-metal conversion killed the broad diffuse response the live
//   warm pools gave the baseline's engine-default rough-1 surface — live
//   night tube net delta ~0 (polish-289 diffuse/metal trade, live variant).
//   v3 @ 0.025 + polish-307 bell-gold recipe (rough .45 / METAL .15):
//   keeps the broad pool sheen (diffuse survives), hue-truthful brass,
//   + ~47 sRGB emissive floor only in dead/dark zones. Below the under-glow
//   bead (0.58 lum) and every plaza beacon. Sole user of this signature —
//   no mergekit collision by construction.
const knotMat = new THREE.MeshStandardMaterial({ color: 0xc9a86a, roughness: 0.45, metalness: 0.15, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.025 });
const core = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.85, 0.16, 140, 18, 2, 5),
    knotMat,
);
core.name = "knot_core";
knot.add(core);
// small satellite beads riding the knot's path (visual richness, merged)
// polish-266: the old placement (cos(3t), sin(3t)) with t = k·π/3 collapsed
// ALL six beads onto a single line at (±0.77, 0, 0) — the "stray dark dots"
// seen at the knot's edge in renders. Parametrize on the knot's real path:
// p=2 vertical wave, q=5 around the ring, so beads ride the tube (r 0.85).
for (let s = 0; s < 6; s++) {
    const t = (s / 6) * Math.PI * 2;
    const bead = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), mat(0xe8caa0, 0.3, 0.8));
    bead.name = `bead_${s}`;
    bead.position.set(Math.cos(5 * t) * 0.85, Math.sin(2 * t) * 0.35, Math.sin(5 * t) * 0.85);
    knot.add(bead);
}
g.add(knot);
// under-glow lamp beneath the knot (warm, small)
const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
lamp.name = "lamp";
lamp.position.set(0, 1.15, 0);
g.add(lamp);

mergeByMaterial(g, "mn3");
writeFileSync("agents/arthur/assets/village_monument3.glb", toGLB(g));
console.log("village_monument3.glb —", g.children.length, "nodes");
