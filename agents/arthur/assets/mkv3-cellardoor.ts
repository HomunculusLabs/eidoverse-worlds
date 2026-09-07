// mkv3-cellardoor.ts — STRUCTURES LANE struct-23: R2-4 WAVE CELLAR DOOR.
// Round-2 commission: "wave-motif cellar entry beside the inn, interior-
// scale Two Histories echo." One idea: a cellar whose door is a wave —
// an ashlar surround carrying one calm sine course across its lintel,
// the ripple language of the Reed Pool at the scale of a doorway.
//
// COMPOSITION (fixed after the siting scan): the S face strip is the only
// legal seat (0.27–0.35m clearance class — cellar doors BELONG pressed to
// a host wall; 1.4m law is for walk-through gaps, this is a lean-to nook).
// Locked seat (36, 6.02), door face toward the field, wall-side recessed.
//
// struct-56 (survey-17/18 Sev 3 intake EXECUTED): decode proved ALL FOUR
// meshes carried material:None — plain mat() exports NO glTF material
// (toGLB emits only texMat/emissive lanes; struct-38 loader-default
// class), so the entire model rendered near-black: the door read as a
// pitch void, hinges/ring invisible black-on-black, ashlar read flat.
// Fix lanes (echoarch/waterstair/millrace precedents):
//   1. stone → village texMat + boxUV (coursed cells, tile 3.0);
//   2. real double door: two timber leaves ajar 28° (planks + iron
//      battens + bone hinge straps + gold ring) — the survey-18 fix class
//      "visible leaf split";
//   3. interior depth (the survey-18 half of the fix class): two
//      descending stone steps, timber back board, warm emissive lamp pane
//      glowing through the ajar slit;
//   4. sky-leak header (survey-17 "thin lintel-edge slivers" finding,
//      arithmetic-confirmed: wave troughs top ~1.86 vs lintel bottom
//      2.02 → a 0.16m sky band at trough azimuths): solid stone header
//      1.74..2.02 backing the wave course, tucked behind its face.
// Envelope: x/z footprint byte-stable vs the standing GLB (SAT-neutral,
// same 2D box); y-min extends -0.24 (below-grade cellar steps, intended).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// struct-56 material lanes — every bucket must export (texMat or emissive).
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const timberTex = texMat("cellar_timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const ironTex = texMat("cellar_iron", [0x44402e, 0x3c3828, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1] });
const boneTex = texMat("cellar_bone", [0xdcdcba, 0xd0ceac], { rough: 0.85, scale: 2, weights: [2, 1] });
const goldTex = texMat("cellar_gold", [0xa09832, 0x887c2a], { rough: 0.85, scale: 2, weights: [3, 1] });
// warm interior lamp pane — EMISSIVE lane (the only plain mat that exports)
const lampMat = mat(0x51391e, 0.6, 0);
(lampMat as any).emissive = new THREE.Color(0xff9a4a);
(lampMat as any).emissiveIntensity = 0.5;

const W = 2.2, H = 1.95, D = 1.4, J = 0.28; // span, height, depth, jamb width
const DOOR_Z = -0.22;      // hinge plane of the leaves
const LEAF_W = 1.07;       // half-opening (jambs' inner faces ±1.10)
const LEAF_H = 1.69, LEAF_Y0 = 0.02;
const ANG = THREE.MathUtils.degToRad(28); // ajar: free edges swing out under the wave hood

// boxUV (echoarch law): per-face UV rescale so texture cells stay SQUARE.
function boxUV(geo: THREE.BoxGeometry, w: number, h: number, d: number, tile: number) {
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    const faces: Array<[number, number]> = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
        const [fw, fh] = faces[f];
        for (let v = 0; v < 4; v++) {
            const i = f * 4 + v;
            uv.setXY(i, (uv.getX(i) * fw) / tile, (uv.getY(i) * fh) / tile);
        }
    }
    uv.needsUpdate = true;
}
const stoneBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    boxUV(geo, w, h, d, 3.0);
    const m = new THREE.Mesh(geo, stoneTex);
    m.name = name;
    m.position.set(x, y, z);
    g.add(m);
};

// jambs
stoneBox("jamb_w", J, H, D, -(W / 2 + J / 2), H / 2, 0);
stoneBox("jamb_e", J, H, D, W / 2 + J / 2, H / 2, 0);
// the wave: 11 voussoirs across the lintel face, one calm sine
for (let i = 0; i < 11; i++) {
    const t = (i + 0.5) / 11;
    const x = -W / 2 + t * W;
    const y = H - 0.12 + 0.09 * Math.sin(2 * Math.PI * t);
    const geo = new THREE.BoxGeometry(W / 11 + 0.015, 0.24, D * 0.6);
    boxUV(geo, W / 11 + 0.015, 0.24, D * 0.6, 3.0);
    const v = new THREE.Mesh(geo, stoneTex);
    v.name = `wave_${i}`;
    v.position.set(x, y, 0);
    v.rotation.z = 0.257 * Math.cos(2 * Math.PI * t); // tangent to the sine
    g.add(v);
}
// solid stone header backing the wave course (struct-56 sky-leak seal):
// spans 1.74..2.02, tucked behind the wave face (front z +0.40 < wave +0.42)
stoneBox("header", W + 0.1, 0.28, 0.85, 0, 1.88, -0.025);
// lintel slab above the wave course
stoneBox("lintel", W + 2 * J, 0.14, D, 0, H + 0.14, 0);
// threshold
stoneBox("threshold", W + 2 * J, 0.09, D + 0.3, 0, 0.045, 0.1);

// leaf part placer: static mesh in world frame, rotated about its hinge
// pivot (no group needed — mergeByMaterial world-bakes static transforms).
// dir −1 = left leaf (parts extend +x from pivot), +1 = right leaf.
const leafPart = (pivotX: number, dir: number, dist: number, ly: number, lz: number, geo: THREE.BufferGeometry, m: THREE.Material, name: string) => {
    const lx = -dir * dist;
    const th = dir * ANG;
    const mesh = new THREE.Mesh(geo, m);
    mesh.name = name;
    mesh.position.set(pivotX + lx * Math.cos(th) + lz * Math.sin(th), ly, DOOR_Z + (-lx * Math.sin(th) + lz * Math.cos(th)));
    mesh.rotation.y = th;
    g.add(mesh);
};
for (const dir of [-1, 1] as const) {
    const pivotX = dir * LEAF_W; // hinge edge at own jamb (dir=-1→x=-1.07), leaf extends inward
    const side = dir < 0 ? "w" : "e";
    // 3 horizontal planks with shadow gaps
    const plankH = (LEAF_H - 0.05) / 3;
    for (let i = 0; i < 3; i++) {
        leafPart(pivotX, dir, (LEAF_W - 0.01) / 2, LEAF_Y0 + 0.025 + plankH * (i + 0.5), 0,
            new THREE.BoxGeometry(LEAF_W - 0.01, plankH, 0.05), timberTex, `plank_${side}${i}`);
    }
    // 2 iron battens (front face)
    for (const bx of [0.30, 0.73]) {
        leafPart(pivotX, dir, bx, LEAF_Y0 + LEAF_H / 2, 0.036,
            new THREE.BoxGeometry(0.07, LEAF_H - 0.06, 0.02), ironTex, `batten_${side}_${bx}`);
    }
    // bone hinge straps (between the battens)
    for (const hy of [0.4, 1.45]) {
        leafPart(pivotX, dir, 0.515, hy, 0.045,
            new THREE.BoxGeometry(0.34, 0.055, 0.022), boneTex, `strap_${side}_${hy}`);
    }
}
// gold ring pull on the right leaf, near its free edge
{
    const geo = new THREE.TorusGeometry(0.07, 0.016, 6, 20);
    const ring = new THREE.Mesh(geo, goldTex);
    ring.name = "ring";
    const lx = -0.86, th = ANG; // right leaf: dir=+1 → local x negative
    ring.position.set(LEAF_W + lx * Math.cos(th), 0.98, DOOR_Z + (-lx * Math.sin(th) + 0.045 * Math.cos(th)));
    ring.rotation.y = th;
    g.add(ring);
}

// interior depth: descending stone steps + timber back + warm lamp pane
stoneBox("step_0", W + 0.05, 0.12, 0.26, 0, -0.06, -0.26);
stoneBox("step_1", W + 0.05, 0.12, 0.26, 0, -0.18, -0.52);
{
    const geo = new THREE.BoxGeometry(W + 0.1, 1.85, 0.04);
    boxUV(geo, W + 0.1, 1.85, 0.04, 3.0);
    const back = new THREE.Mesh(geo, timberTex);
    back.name = "interior_back";
    back.position.set(0, 0.925, -0.68);
    g.add(back);
}
{
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.02), lampMat);
    pane.name = "lamp_cellar"; // KEEP anchor (lamp*)
    pane.position.set(0, 0.85, -0.645);
    g.add(pane);
}
// brass high-water pin at the sill's flood mark (textured gold lane)
{
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), goldTex);
    pin.name = "highwater_pin";
    pin.position.set(W / 2 + J / 2, 0.15, D / 2 + 0.06);
    g.add(pin);
}

const merged = mergeByMaterial(g, "cellardoor");
writeFileSync("agents/arthur/assets/village_cellardoor3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_cellardoor3.glb");
