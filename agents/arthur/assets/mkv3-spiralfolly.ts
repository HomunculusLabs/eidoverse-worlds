// mkv3-spiralfolly.ts — STRUCTURES LANE struct-20 → struct-27 → struct-39.
// R2-2 SPIRAL STAIR FOLLY, rebuilt honestly.
//
// One idea (unchanged): a stair that ends in the sky. A logarithmic
// ribbon — radii in exact golden ratio (r0=3.1 -> r1=3.1/φ) — winds 3
// turns to h=10 (φ × the base width), where the stair arrives at a real
// landing platform, and a glowing brass ring rises from it on three slim
// struts: the last step, going nowhere, facing the sky.
//
// struct-39 shard row 14 fix (survey-1 NATIVE-CONFIRMED findings, all
// source-true): detached treads w/ see-through gaps; upper turns drifting
// off a 0.18m spine; gold ring floating unconnected; no top landing;
// ragged chord wobble. Root causes and fixes:
//   1. DETACHED TREADS -> solid stepped stair: 52 chunky bone steps, each
//      spanning radially FROM the core face TO the ribbon radius — socketed
//      by construction, no floating caps (the 0.06 treads on a 0.14 rail
//      are gone; the rail+tread pair was the see-through form itself).
//   2. DRIFT OFF CORE -> tapering masonry core (14 corbelled courses,
//      radius 0.72 × the spiral envelope) replaces the 0.18m stick.
//   3. FLOATING RING -> landing platform at the stair's head; three struts
//      from platform to ring underside (exact contact: strut top y ==
//      ring center y − tube).
//   4. NO LANDING -> the platform IS the landing (last steps run into
//      its rim: platform r 2.25 > final step r 1.92).
//   5. RAGGED WOBBLE -> outer lip rail re-segmented 104 -> 156 with 1.45
//      overlap, riding the QUANTIZED step tops (a cut-string stair edge).
//   6. MATERIAL LAW (struct-38 glbwrite root cause): plain mat() exports
//      NO glTF material -> COLOR_0 × loader-default metal-1 renders
//      engine-dependent. All static materials now texMat (deterministic
//      tile + real glTF material chain); crown stays on the emissive lane
//      (struct-27 night identity, verified).
//
// Honest limits (unchanged): stair NOT standable (engine non-standable
// trimesh class, struct-3/struct-20) — crowned, not climbed. The folly is
// circled, not entered: the core fills the center (plinth r3.05 vs base
// disc r3.3 leaves only a 0.25m setting joint — un-enterable by design,
// no pinch possible). Footprint 43.6m², height ~10.7m -> real trimesh.
// No motion, no comps. Nodes after merge: 4 (bone stair / dark core /
// stone base / brass crown).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const PHI = (1 + Math.sqrt(5)) / 2;
const R0 = 3.1, R1 = R0 / PHI, TURNS = 3, TOP = 10.0;
const TOTAL = TURNS * Math.PI * 2;
const STEPS = 52;                       // 2 chord-segments per step
const RISE = TOP / STEPS;               // 0.1923 — a real stair riser

// materials (texMat lane — real glTF materials, deterministic tiles)
const bone = texMat("folly_bone", [0xdcdcba, 0xd2d0b0, 0xe4e2c4], { rough: 0.9, scale: 2, weights: [2, 1, 1] });
const dark = texMat("folly_core", [0x44402e, 0x3c3828, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const stoneTex = texMat("folly_base", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// crown: emissive lane (struct-27 lit-crown law — the ring IS the lamp)
const brass = new THREE.MeshStandardMaterial({ color: C.BRASS, roughness: 0.55, metalness: 0.0 });
(brass as any).emissive = new THREE.Color(0x8a5a20);
(brass as any).emissiveIntensity = 0.6;

const rEnv = (t: number) => R0 * Math.pow(R1 / R0, t);   // spiral envelope
const coreR = (t: number) => rEnv(t) * 0.72;             // tapering core face

// stone base disc (thin, r3.3 — under the first sweep) + setting plinth
{
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.14, 32), stoneTex);
    base.name = "base";
    base.position.y = 0.07;
    g.add(base);
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.15, 0.26, 32), stoneTex);
    plinth.name = "plinth";
    plinth.position.y = 0.13;
    g.add(plinth);
}

// the stair: 52 solid bone steps, each socketed into the core face
{
    const dphi = TOTAL / STEPS;
    for (let j = 0; j < STEPS; j++) {
        const tm = (j + 0.5) / STEPS;
        const phi = tm * TOTAL;
        const r = rEnv(tm);
        const cr = coreR(tm);
        const yTop = (j + 1) * RISE;
        const h = RISE + 0.03;                       // hairline overlap up
        const len = r * dphi * 1.18;                 // chord + overlap
        const thick = r - cr;                        // radial: core face -> rim
        const step = new THREE.Mesh(new THREE.BoxGeometry(len, h, thick), bone);
        step.name = `step_${j}`;
        step.position.set(((cr + r) / 2) * Math.sin(phi), yTop - h / 2, ((cr + r) / 2) * Math.cos(phi));
        step.rotation.y = phi;                       // x-axis -> tangent
        g.add(step);
    }
}

// the outer curb: continuous stringer-seating wall. v3 (struct-39): v2's
// rail at r-0.08 hid BEHIND the step corners, which kept the sawtooth
// outer silhouette and its sky notches at 18m. The curb now owns the
// outer edge (center r, thickness 0.16 — flush past the tread corners)
// and spans DOWN 0.14 past the tread top to cover the crossing zone
// between consecutive step bodies: the silhouette becomes the curb's
// continuous climbing band, the stair reads as ONE ribbon.
{
    const SEGS = 156;
    const dphi = TOTAL / SEGS;
    for (let i = 0; i < SEGS; i++) {
        const t = (i + 0.5) / SEGS;
        const phi = t * TOTAL;
        const r = rEnv(t);
        const yStep = (Math.floor(t * STEPS) + 1) * RISE;  // this box's step top
        const len = r * dphi * 1.5;                  // heavy overlap: no chord gaps
        const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.34, 0.16), bone);
        rail.name = `lip_${i}`;
        rail.position.set(r * Math.sin(phi), yStep + 0.03, r * Math.cos(phi));
        rail.rotation.y = phi;
        g.add(rail);
    }
}

// the core: 14 corbelled dark courses following the spiral envelope
{
    const N = 14, y0 = 0.26, y1 = TOP + 0.18;        // plinth top -> platform underside
    const h = (y1 - y0) / N;
    for (let k = 0; k < N; k++) {
        const yTop = y0 + (k + 1) * h;
        const t = Math.min(1, yTop / TOP);
        const core = new THREE.Mesh(new THREE.CylinderGeometry(coreR(t), coreR(t) + 0.035, h + 0.02, 20), dark);
        core.name = `core_${k}`;
        core.position.y = yTop - h / 2;
        g.add(core);
    }
}

// the landing platform: the stair's arrival (last steps run into its rim)
const PLAT_R = R1 + 0.33;                            // 2.25 > final step r 1.92
{
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(PLAT_R, PLAT_R, 0.18, 28), bone);
    plat.name = "landing";
    plat.position.y = TOP + 0.09;
    g.add(plat);
}

// the crown: brass ring carried just above the platform on three short
// slim struts (struct-39 v2: v1 raised it 0.62 with dark 0.045 struts —
// sub-pixel at 18m, read as an unattached sliver; now compact and integral)
const RING_R = 1.45, RING_Y = TOP + 0.30, TUBE = 0.055;
{
    for (let k = 0; k < 3; k++) {
        const a = (Math.PI / 2) + (k * 2 * Math.PI) / 3;
        const top = RING_Y - TUBE;                   // ring underside at strut radius
        const bot = TOP + 0.18;                      // platform top
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, top - bot, 8), brass);
        strut.name = `crownstrut_${k}`;
        strut.position.set(RING_R * Math.cos(a), (top + bot) / 2, RING_R * Math.sin(a));
        g.add(strut);
    }
    const crown = new THREE.Mesh(new THREE.TorusGeometry(RING_R, TUBE, 8, 48), brass);
    crown.name = "crown";
    crown.rotation.x = Math.PI / 2;
    crown.position.y = RING_Y;
    g.add(crown);
}

const merged = mergeByMaterial(g, "spiralfolly");
writeFileSync("agents/arthur/assets/village_spiralfolly3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_spiralfolly3.glb");
