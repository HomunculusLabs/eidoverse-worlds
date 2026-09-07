// mkv3-ruledtower.ts — STRUCTURES LANE struct-50: R4-3 THE RULED TOWER.
// Round 4 commission. One idea: STRAIGHTNESS THAT CURVES. The Meridian
// Stair ascends through hypar saddles; the Bridge of Nines walks over
// arches; the Ruled Tower RISES through a waist. First consumer of the
// housekit `hyperboloidCage` primitive (the loop charter's fourth named
// form family, after spiralRamp, hyparShell, arcColonnade).
//
// FORM (silhouette-first): a see-through lattice tower — an open iron
// crown ring on a stepped square stone plinth, tied by two families of
// straight iron struts whose ensemble weaves a waist between them. The
// hyperboloid of one sheet x²+z² = r0²cos²(Δ/2)+4r0²sin²(Δ/2)(u/h)² is
// doubly ruled: every strut is a straight generator; the curve exists
// only as the family. Reads "woven tower" at 18m before any detail.
//
// COUNTS (source-true): r0 2.5, cage y 1.5→7.1 (h 5.6), Δ 112.5° (2Δ =
// 225° = 10 grid steps on the 16-strut ring — families cross exactly at
// the waist, one X per pair, Shukhov signature), 16 struts per family →
// 32 total. Waist radius r0·cos(56.25°) = 1.388m at y 4.3 — the pinch.
//
// GEOMETRY AS ORNAMENT: no applied trim. The plinth is a 3-step square
// ashlar stereo (9.0 / 8.4 / 7.8m per side, 0.5m each) — square-to-
// circle transition, tholos lineage. Crown ring binds the families'
// shared endpoints; base ring sits at the plinth top. 8 brass crown
// beads ride the crown ring at 45° spacing (dusk lineage, no new light).
//
// GATES (honest): footprint 9.0×9.0 = 81m² ≥ 16, height 7.1m ≥ 2.2 —
// but this is a FOLLY: no door, no walls, sky through the lattice from
// every side BY DESIGN. It crosses the room gates numerically; the
// browser trimeshes it; the waist seat is NOT advertised (dropped in
// design — an untied floating ring would be the spears/ragged-margin
// defect class from struct-40's lesson).
// Node budget: 32 struts + 2 rings + 3 plinth + 8 beads = 45 raw,
// merges to ~4 buckets (iron/stone/brass) + beads KEEP name.
import * as THREE from "three";
import { toGLB, texMat, mat } from "./glbwrite.ts";
import { C, hyperboloidCage } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// struct-38 family law: textured lanes matched to standing village families.
const iron = texMat("iron", [0x44402e, 0x4c4836, 0x3c3828], { rough: 0.7, scale: 2, weights: [2, 1, 1], cell: 24 });
const ash = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.9, scale: 2, weights: [2, 1, 1], cell: 32 });
// brass beads: warm emissive dusk markers (struct-21/30/33/47/49 lineage).
const brass = mat(C.BRASS, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x9a6a28);
(brass as any).emissiveIntensity = 0.65;

// PLINTH — 3-step square ashlar stereo (9.0/8.4/7.8 per side, 0.5m each);
// square-to-circle: the cage's circle reads inside the top step's square.
{
    const steps = [9.0, 8.4, 7.8];
    steps.forEach((s, i) => rises(s, i));
    function rises(s: number, i: number) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(s, 0.5, s), ash);
        step.name = `plinth_${i}`;
        step.position.set(0, 0.25 + i * 0.5, 0);
        g.add(step);
    }
}

// THE WEAVE — 32 straight generators (16 per family, ±112.5° rotation),
// feet on the plinth top (y 1.5), crown at 7.1.
const R0 = 2.5, Y0 = 1.5, Y1 = 7.1, DELTA = (112.5 * Math.PI) / 180, STRUTS = 16;
let RIDE = 2.5; // bead ride radius — set to the widened ring radius below
const waist = hyperboloidCage(g, "tower", R0, Y0, Y1, DELTA, STRUTS, 0.14, 0.14, iron);
console.log(`waist radius analytic: ${waist.toFixed(4)}`);

// RINGS — crown and base (open 16-gon, iron): bind the two ruling
// families' shared endpoints. ZAI v1 defect fix: strut end-face corners
// reach r0+0.07·√2≈2.599 and y ±0.059 past ring mid — a zero-thickness
// shell at r0 let tips read PAST the band (judge: "strut overshoot at
// crown"). Shell widened to 2.61 / h 0.26 so every strut end lands
// fully inside the band: flush read, both rings.
{
    const RR = 2.61, RH = 0.26;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(RR, RR, RH, 16, 1, true), iron);
    crown.name = "crownring";
    crown.position.set(0, Y1, 0);
    g.add(crown);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(RR, RR, RH, 16, 1, true), iron);
    base.name = "bascring";
    base.position.set(0, Y0, 0);
    g.add(base);
    RIDE = RR;
}

// 8 brass crown beads — the dusk signature riding the widened crown band
// (45° spacing: quiet rhythm, not 16 — the weave owns the density axis).
// Seated ON the band surface (r 2.61, ring mid-height), not inside it.
{
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), brass);
        bead.name = `bead_${i}`;
        bead.position.set(RIDE * Math.sin(a), Y1, RIDE * Math.cos(a));
        g.add(bead);
    }
}

const merged = mergeByMaterial(g, "ruledtower");
writeFileSync("agents/arthur/assets/village_ruledtower3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_ruledtower3.glb");
