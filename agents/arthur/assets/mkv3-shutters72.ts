// mkv3-shutters72.ts — new-era loop 72: THE STUDY SHUTTERS. Decoded from
// mkv3-ring.ts: the tower's lit drum window "twin" sits at (0, 4.3, 2.79),
// 0.6w x 0.75h, facing +Z. This artifact shares the tower-house's origin
// (same r/ang in the plan => same yaw) and mounts a half-drawn pair:
// LEFT panel folded open against the wall, RIGHT panel drawn shut.
// The study window now reads lived-in — half-lit evening look.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const OAK = 0x7c6832, OAK_DK = 0x6a6030, IRON = 0x5c5c60;

// tex-36 TIMBER XV: the study shutters join the timber family — all six
// slats and rails take the village timber tile (the tower-house's window
// dressed in the same wood as its walls), while the hinge straps and
// pull-ring take the forge iron (hardware is smithed).
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });

// window plane (tower-local): z = 2.82 (just proud of the drum at 2.79)
const WY = 4.3, WZ = 2.84;
const PW = 0.27, PH = 0.66; // panel size (half the 0.6-wide window + frame)

// ---- LEFT panel: folded OPEN flat against the round wall (to the side) ----
// nvp-18 visual gate: the inherited panel used 0.66m-deep blades, projecting
// radially like a fence. Seat the leaf tangent to the drum instead, just left
// of the window, so its broad face reads as an open shutter.
const LX = -0.48, LZ = 2.79, LYAW = Math.asin(LX / 2.79);
for (let sl = 0; sl < 3; sl++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.17, 0.035), timberTex);
    slat.name = `shL_slat_${sl}`;
    slat.position.set(LX, WY - 0.21 + sl * 0.21, LZ);
    slat.rotation.y = LYAW;
    g.add(slat);
}
const railL = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.06, 0.04), timberTex);
railL.name = "shL_rail";
railL.position.set(LX, WY, LZ + 0.012);
railL.rotation.y = LYAW;
g.add(railL);
const railL2 = railL.clone();
railL2.name = "shL_rail2";
railL2.position.y = WY - 0.27;
g.add(railL2);
// hinge strap (left edge, at the fold)
const hingeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.58, 0.012), ironTex);
hingeL.name = "shL_hinge";
hingeL.position.set(-0.315, WY, WZ + 0.005);
g.add(hingeL);

// ---- RIGHT panel: drawn SHUT across the window ----
for (let sl = 0; sl < 3; sl++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.17, 0.035), timberTex);
    slat.name = `shR_slat_${sl}`;
    slat.position.set(0.155, WY - 0.21 + sl * 0.21, WZ + 0.03);
    g.add(slat);
}
const railR = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.06, 0.04), timberTex);
railR.name = "shR_rail";
railR.position.set(0.155, WY, WZ + 0.03);
g.add(railR);
const railR2 = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.06, 0.04), timberTex);
railR2.name = "shR_rail2";
railR2.position.set(0.155, WY - 0.27, WZ + 0.03);
g.add(railR2);
// hinge straps (right side, at the wall edge)
const hingeR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.58, 0.012), ironTex);
hingeR.name = "shR_hinge";
hingeR.position.set(0.305, WY, WZ + 0.005);
g.add(hingeR);
// the pull-ring on the shut panel
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 4, 8), ironTex);
ring.name = "shR_ring";
ring.rotation.y = Math.PI / 2;
ring.position.set(0.045, WY - 0.05, WZ + 0.05);
g.add(ring);

mergeByMaterial(g, "sh3");
writeFileSync("agents/arthur/assets/village_shutters3.glb", toGLB(g));
console.log("village_shutters3.glb —", g.children.length, "top-level");
