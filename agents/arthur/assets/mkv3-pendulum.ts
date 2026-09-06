// mkv3-pendulum.ts — STRUCTURES LANE struct-9: T-3 PENDULUM WAVE.
// The calibration piece, honestly: a pendulum wave FROZEN at its moment of
// maximum coherence — 9 pendulums caught mid-swing at phases phi_n = n·(2pi/9)
// displaced along +X, their bobs tracing one clean sine curve across the
// frame. A real pendulum wave cycles through this shape; the sculpture
// holds it. Frame: two dark A-posts + a timber crossbeam (static, merged);
// rods + bobs static. One idea: nine periods passing through one moment.
// Furniture scale (no walk-through): solid collider, correct for a
// kinetic-frame sculpture.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const brass = mat(C.BRASS, 0.55, 0);
const dark = mat(C.DARK, 0.95, 0);

const N = 9;
const SPAN = 5.8;          // x-extent (struct-15 REFINE: 6.4 -> 5.8, end bobs clear the A-post legs)
const BEAM_Y = 3.5;        // crossbeam height (struct-15 REFINE: 3.1 -> 3.5, bob band lifts off the horizon)
const ROD_L = 2.2;         // rod length (pivot to bob center)

// frame: two A-posts + crossbeam
for (const sx of [-1, 1] as const) {
    const px = sx * (SPAN / 2 + 0.95);
    for (const s of [-1, 1] as const) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, Math.hypot(1.1, BEAM_Y) , 0.1), timberTex);
        leg.name = `post_${sx < 0 ? "w" : "e"}${s < 0 ? "a" : "b"}`;
        // A-frame legs lean inward to the apex (px→center at top)
        leg.position.set(px - sx * 0.3, BEAM_Y / 2, s * 0.55);
        leg.rotation.z = sx * Math.atan2(1.1, BEAM_Y);
        g.add(leg);
    }
    // cross-brace
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.4, 0.07), timberTex);
    brace.name = `brace_${sx < 0 ? "w" : "e"}`;
    brace.position.set(px - sx * 0.5, BEAM_Y * 0.45, 0);
    brace.rotation.x = Math.PI / 4;
    g.add(brace);
}
{
    const beam = new THREE.Mesh(new THREE.BoxGeometry(SPAN + 1.6, 0.14, 0.16), timberTex);
    beam.name = "beam";
    beam.position.y = BEAM_Y;
    g.add(beam);
}

// THE WAVE: pendulum n at phase phi_n = n·2pi/N, swing amplitude 0.62 rad.
// Bob position: pivot (x_n, BEAM_Y) + rod vector (sin·amp·? ...) — classic
// pendulum displaced along +Z (swing plane perpendicular to the row).
const AMP = 0.62;
for (let n = 0; n < N; n++) {
    const x = -SPAN / 2 + (SPAN * n) / (N - 1);
    const phi = (n / N) * Math.PI * 2;
    const ang = AMP * Math.sin(phi);           // frozen displacement angle
    const rz = ROD_L * Math.sin(ang);          // bob offset along Z
    const ry = ROD_L * Math.cos(ang);          // vertical drop
    // rod from pivot to bob (thin box oriented along the rod)
    // struct-41 SHARD ROW 35: 0.028 -> 0.065 cross-section. Native survey-6
    // confirmed BOTH Sev-4 findings from this one number: 0.028m at 18m
    // gameplay (~70px/m) renders ~1px hairline strings, and as shadow
    // casters the rods fragment into the confirmed dashed acne band
    // (~12-15 gaps); the 0.10 A-frame legs cast the only solid shadows.
    // 0.065 = clearly legible strings + solid-order shadow lines. Bobs,
    // frame, materials untouched (judged clean).
    const rod = new THREE.Mesh(new THREE.BoxGeometry(0.065, ROD_L, 0.065), dark);
    rod.name = `rod_${n}`;
    rod.position.set(x, BEAM_Y - ry / 2, rz / 2);
    rod.rotation.x = ang;
    g.add(rod);
    // bob: brass sphere
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), brass);
    bob.name = `bob_${n}`;
    bob.position.set(x, BEAM_Y - ry, rz);
    g.add(bob);
}

const merged = mergeByMaterial(g, "pendulum");
writeFileSync("agents/arthur/assets/village_pendulum3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_pendulum3.glb");
