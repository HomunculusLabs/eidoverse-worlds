// mkv3-kiln38.ts — new-era loop 38: THE LIME KILN. The quarry's companion,
// beside it on the track: a tapered stone kiln with a fire mouth (emissive
// glow), a charging ring at top, stacked limestone cobbles waiting, and a
// slaking pit (a trough of white lime putty). Where mortar comes from.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// tex-9 STONE II: the kiln joins the ashlar family — kiln body + slaking
// trough carry the village stone tile (identical params to housekit
// stoneMat, cell 32 — coursed blocks on a masonry drum read as courses).
// Fire mouth + ring + putty stay flat (small trim + emissive-adjacent).
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// tex-66: the kiln's last flats join — the charging ring takes the
// ashlar (the band/cap chain, tex-58→63: a masonry ring on a stone
// drum is laid stone; the tile's own tone shift replaces the flat
// dark), and the shovel handle takes the timber (the tool-handle
// chain: pitchfork tex-37, hammer tex-56). The pale limestone cobbles
// stay flat — raw charge is not construction (the grain law); putty,
// fire, and the dark mouth stay flat by their own laws.
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};
// ---- KILN BODY: tapered drum (2 stacked frusta) ----
const lower = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 1.6, 10), stoneTex);
lower.name = "kiln_lower";
lower.position.set(0, 0.8, 0);
g.add(lower);
const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.0, 1.3, 10), stoneTex);
upper.name = "kiln_upper";
upper.position.set(0, 2.25, 0);
g.add(upper);
// charging ring at the mouth
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.09, 5, 12), stoneTex);
ring.name = "kiln_ring";
ring.rotation.x = Math.PI / 2;
ring.position.set(0, 2.92, 0);
g.add(ring);
// ---- FIRE MOUTH: dark inset + emissive fire glow (the burn never stops) ----
box(g, "kiln_mouth", 0.6, 0.55, 0.35, 0, 0.5, 1.15, 0x302c24);
// Wakeup-45: the fire rides a fire_kiln anchor group (`fire` already KEEP) —
// a lime burn that never stops should never sit still.
const fireGrp = new THREE.Group();
fireGrp.name = "fire_kiln";
const fire = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.15), new THREE.MeshStandardMaterial({ color: 0xfec844, emissive: new THREE.Color(0xff5a1a), emissiveIntensity: 1.1, roughness: 0.5 }));
fire.name = "kiln_fire";
fire.position.set(0, 0.45, 1.2);
fireGrp.add(fire);
g.add(fireGrp);
// ---- LIMESTONE CHARGE: stacked cobbles waiting on the track side ----
let ci = 0;
for (const [cx, cz, cr] of [[-1.9, 0.9, 0.18], [-1.6, 1.2, 0.15], [-2.1, 1.4, 0.14], [-1.8, 1.6, 0.12]] as const) {
    const cob = new THREE.Mesh(new THREE.IcosahedronGeometry(cr, 0), mat(0xe4e4cc, 0.98, 0));
    cob.name = `lime_cob_${ci++}`;
    cob.position.set(cx, cr * 0.75, cz);
    cob.rotation.set(ci * 2, ci, 0);
    g.add(cob);
}
// ---- SLAKING PIT: stone trough w/ white lime putty ----
{
    const trough = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 0.8), stoneTex);
    trough.name = "slake_trough";
    trough.position.set(2.0, 0.2, -0.6);
    g.add(trough);
}
box(g, "slake_putty", 1.15, 0.08, 0.65, 2.0, 0.42, -0.6, 0xf2f2e6);
// a shovel stuck in the putty
const shv = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.0, 5), timberTex);
shv.name = "slake_shovel";
shv.rotation.z = -0.3;
shv.position.set(2.35, 0.65, -0.6);
g.add(shv);

// interior-18 (P2 next-wave): THE BURN LEDGER — the kiln's life layer. A
// tally board on the kiln's front face beside the mouth (the burner's
// charge-and-draw ledger: one brass datum + seven alternating brass/bone
// burn marks, the lime-burn count of the current firing) and a warm
// lantern hung on a post-bracket over the mouth so the night burn reads
// from the track. Everything within the inherited AABB; the fire anchor
// and all existing pieces stay untouched.
{
    texBox("burn_board", 0.55, 0.62, 0.03, 0.95, 0.95, 0.92, timberTex);
    box(g, "burn_datum", 0.4, 0.022, 0.012, 0.95, 1.16, 0.942, C.BRASS);
    for (let bi = 0; bi < 4; bi++)
        box(g, `burn_mark_${bi}`, 0.026, bi % 2 ? 0.11 : 0.15, 0.012, 0.79 + bi * 0.107, 1.06, 0.942, bi % 2 ? C.BONE : C.BRASS);
    for (let bi = 0; bi < 3; bi++)
        box(g, `burn_mark2_${bi}`, 0.026, bi % 2 ? 0.11 : 0.15, 0.012, 0.855 + bi * 0.107, 0.855, 0.942, bi % 2 ? C.BONE : C.BRASS);
    // lantern bracket + warm lamp over the mouth (KEEP glow anchor)
    const glowGrp = new THREE.Group();
    glowGrp.name = "glow";
    const lant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
    lant.name = "lantern_core";
    lant.position.set(-0.55, 1.05, 0.85);
    glowGrp.add(lant);
    g.add(glowGrp);
}

mergeByMaterial(g, "lk3");
writeFileSync("agents/arthur/assets/village_kiln3.glb", toGLB(g));
console.log("village_kiln3.glb —", g.children.length, "nodes");
