// mkv3-ninesbridge.ts — STRUCTURES LANE struct-49: R4-2 THE BRIDGE OF NINES.
// Round 4 commission. One idea: NINE. The pendulum wave (NE path) freezes
// nine swings; the Meridian Stair carries nine slats per panel; this
// structure WALKS over nine. First consumer of the housekit
// `arcColonnade` primitive (the loop charter's third named form family,
// after spiralRamp and hyparShell).
//
// FORM (silhouette-first): a low vaulted crossing — a long ashlar band
// punctuated by NINE dark semicircular arch openings, flat deck on top,
// nine-tread stair flights at both ends, nine brass beads per parapet
// marking the arch crowns at dusk (beacon lineage, no new light entity).
//
// GEOMETRY AS ORNAMENT: the arc rhythm IS the structure — no applied
// trim. Arch rings are true half-tori in the wall faces (spring 0.78,
// R 0.62, crown 1.40); spandrel band fills crown→deck; parapet caps the
// edges. Materials all texMat lanes (struct-38 law).
//
// GATES (honest): footprint ≈ 23.2×2.8 ≈ 62m² ≥ 16; height 2.41 (bead
// tops) ≥ 2.2 → real trimesh, walkable deck. Stair rises 0.2056 ≤ 0.25
// threshold law. Deck walk lane ≈ 1.5m clear between parapets ≥ 1.4.
import * as THREE from "three";
import { toGLB, texMat, mat } from "./glbwrite.ts";
import { C, arcColonnade } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// struct-38 family law: textured lanes matched to standing village families.
const ash = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const pier = texMat("stone", [0x4a4638, 0x504a3c, 0x423e30], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const iron = texMat("iron", [0x44402e, 0x4c4836, 0x3c3828], { rough: 0.7, scale: 2, weights: [2, 1, 1], cell: 24 });
const timber = texMat("timber", [0x6a5a3e, 0x74624a, 0x5c4e34], { rough: 0.9, scale: 2, weights: [2, 1, 1], cell: 24 });
// brass beads: warm emissive dusk markers (struct-21/30/33/47 lineage).
const brass = mat(C.BRASS, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x9a6a28);
(brass as any).emissiveIntensity = 0.65;

// SECTION — nine arches over the span, local +X, openings facing ±Z.
const SPAN = 14.0, ARCHES = 9, R = 0.62, DECKY = 1.85, BANDH = 0.45, PARAPH = 0.5, DECKW = 2.8;

const crowns = arcColonnade(g, {
    span: SPAN, arches: ARCHES, radius: R,
    deckW: DECKW, deckY: DECKY, bandH: BANDH, parapetH: PARAPH,
    archMat: iron, pierMat: pier, bandMat: ash,
    name: "nines",
});

// foot pads under every pier line (10 pads, 9 arcs — honest count)
for (let i = 0; i <= ARCHES; i++) {
    const px = -SPAN / 2 + (SPAN / ARCHES) * i;
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.24, DECKW + 0.3), pier);
    pad.name = `pad_${i}`;
    pad.position.set(px, 0.12, 0);
    g.add(pad);
}

// THE DARK SPINE — full-span core wall at mid-depth (iron lane). Kills
// the see-through: aligned openings on both faces would read sky-through-
// both (skene void lesson); with the spine each arch opens into a 0.7m
// dark recess — honest masonry mass carrying the deck over the voids.
{
    const core = new THREE.Mesh(new THREE.BoxGeometry(SPAN, DECKY, 0.5), iron);
    core.name = "core";
    core.position.set(0, DECKY / 2, 0);
    g.add(core);
}

// DECK — flat timber treads the whole span (flat by design: the arc rhythm
// below is the silhouette; a camber would fight it — Judd, one idea).
for (let i = 0; i < 29; i++) {
    const t = (i + 0.5) / 29;
    const x = -SPAN / 2 + SPAN * t;
    const tread = new THREE.Mesh(new THREE.BoxGeometry(SPAN / 29 - 0.012, 0.07, 2.3), timber);
    tread.name = `tread_${i}`;
    tread.position.set(x, DECKY + 0.035, 0);
    g.add(tread);
}

// NINE brass crown beads per parapet — the dusk signature; one bead over
// each arch crown, seated directly on the parapet cap (no posts — quiet).
const PARAPET_TOP = DECKY + PARAPH;
for (const [ci, cx] of crowns.entries()) {
    for (const sz of [-1, 1]) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), brass);
        bead.name = `bead_${ci}_${sz > 0 ? "n" : "s"}`;
        bead.position.set(cx, PARAPET_TOP + 0.06, sz * (DECKW / 2 - 0.11));
        g.add(bead);
    }
}

// NINE-TREAD STAIR FLIGHTS at both ends — 9 × 0.2133 rise (≤0.25 law)
// tops the treads exactly at the deck tread surface (native-judge lip fix:
// stair tops at 1.85 vs deck surface 1.92 left a 7cm step), 0.45 deep,
// solid blocks; the number carries through the whole piece.
const RISE = (DECKY + 0.07) / 9;
for (const s of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
        const h = RISE * (i + 1);
        const step = new THREE.Mesh(new THREE.BoxGeometry(0.45, h, 2.2), pier);
        step.name = `stair_${s > 0 ? "e" : "w"}_${i}`;
        step.position.set(s * (SPAN / 2 + 0.225 + 0.45 * i), h / 2, 0);
        g.add(step);
    }
    // landing pad at each stair foot
    const pad = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 2.6), pier);
    pad.name = `foot_${s > 0 ? "e" : "w"}`;
    pad.position.set(s * (SPAN / 2 + 0.45 * 9 + 0.55), 0.05, 0);
    g.add(pad);
}

const merged = mergeByMaterial(g, "ninesbridge");
writeFileSync("agents/arthur/assets/village_ninesbridge3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_ninesbridge3.glb");
