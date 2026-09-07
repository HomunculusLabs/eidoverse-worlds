// mkv3-dress-ne-bellows1.ts — dress-103, NE CRAFT great bellows on a cradle
// (round-3 item 9: nx-dress-ne-bellows-001) at the CORE forge's firebox.
// Concept contract: the forge's AIR MACHINE — the third element of the
// smithy (anvil = strike, billet = heat, bellows = breath). A workshop-scale
// double-board bellows on a timber trestle cradle, nozzle aimed at the
// firebox mouth, depicted MID-STROKE: SOLID leather chamber swelling tall
// toward the nose, thick top board riding it, steel gathering band at the
// nose, pump bar framed between two grounded posts (the smith's lever).
// Local frame: −x = nose (toward the fire), +x = butt/handle, y up.
// Idiom: anvil-pad kit family (timber/iron/leather; bright steel 0xc8ccd0
// metal 0.1 — the kit's proven 18m value carrier, pitfall-11 law).
// Static, no comps. ONE mesh-ember bead at the nozzle drop point (emissive
// MATERIAL, not a light entity) — NE lamp budget untouched (0 of 10).
// Node budget after mergeByMaterial: 9 buckets + ember KEEP anchor.
//
// v1 (152e83b9): decode-caught shallow plan-wedge (taper 0.706 > 0.7 law).
// v2 (9c8afac5): native 18m FAIL — thin rod lever read as a CANNON BARREL;
//   mid-grey iron merged into wood. Factual probe confirmed the judge.
// v3 (8efd31fa): steel promotions, lever shortened — still floating past
//   the body; elevation silhouette still flat. FAIL, correctly.
// v4/v5 (0dd00530): reversed anatomy (tall nose, raised board, low pole
//   lever) — decode ALL PASS, but native 18m FAIL again: the lever's span
//   [−0.47,+0.17] flew 0.72m past the body edge (center/length math error),
//   and the open chamber under a 0.06 board reads as a low slab + line,
//   not a mass. LESSON (village idiom law, dress-14 ne-yard precedent):
//   a horizontal element protruding past a mass must END ON A GROUNDED
//   POST (ne-yard rails passed exactly so); an open gap under a thin board
//   does not read at 18m — mass does (dress-97 silhouette law).
// v6: SOLID chamber (leather frustum fills lower board to top board line),
//   thick (0.10) top board riding the leather, lever = pump bar spanning
//   hinge-post to a SECOND GROUNDED POST (bar never free-ends), steel
//   band widened to 0.14 x full nose height.
// v7 (decode-before-edit caught two v6 source fictions): (a) frustum()
//   COLLAPSES yb==yt to a zero-thickness plane — v6's "thick 0.10 top
//   board" was a tilted SHEET; (b) frustum() x0/x1 set a unit-length box's
//   CENTER, not its extent — the v6 band floated a 0.07m air gap ahead of
//   the board nose. v7: real tilted slab via yb<yt faces (0.90..1.00 nose,
//   0.62..0.72 butt); band 0.14->0.24 long so its back face EMBEDS 0.03
//   into the boards, raised to y 0.38..1.04 (proud of the board nose top
//   1.00 — steel carries the leading silhouette edge); tip fitting
//   IRON_LT->STEEL (bright value at the fire-aim point); coal: three
//   scattered lumps -> ONE mound with the ember bead on its flank (the
//   18m judge read the scatter as a hairline streak — single mass law).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const BOARDS = mat(0x86683e, 0.9, 0);   // rich oak wedge boards
const LEATHER = mat(0x4a3527, 0.95, 0); // chamber gusset, inset dark
const IRON_LT = mat(0x8e9298, 0.4, 0.15); // wrought fittings (hinge post, nozzle tip)
const STEEL = mat(0xc8ccd0, 0.45, 0.1); // bright worked steel — value carrier
const IRON_DK = mat(0x3c3c42, 0.55, 0.3); // cast nozzle, fire-blackened
const TIMBER = mat(0x9c8a6a, 0.9, 0);   // cradle legs/rails/skids + lever frame
const CUTWOOD = mat(0xa09832, 0.95, 0); // pale stop pin
const SCORCH = mat(0x34322d, 0.98, 0);  // coal lumps
const EMBER = mat(0xd9844a, 0.6, 0.1);
(EMBER as any).emissive = new THREE.Color(0x8a3a10);
(EMBER as any).emissiveIntensity = 0.55;

const add = (n: string, m: THREE.Mesh) => { m.name = n; g.add(m); };

// frustum: box spanning x0..x1 whose zHalf/yBottom/yTop differ between the
// x0-face and x1-face. v8 FIX (probe-caught, broken since v1): (a) vx is
// scaled by (x1-x0) — the old unit-box ±0.5 made every frustum 1.0m long
// regardless of x0/x1; (b) local y subtracts the GLOBAL average, not the
// per-vertex (yb+yt)/2 — the old form cancelled face-height variation, so
// constant-thickness "tilted" slabs built FLAT and the leather's nose face
// sat 0.09m low. Face heights are now literal at both ends.
function frustum(x0: number, x1: number, z0: number, z1: number, yb0: number, yt0: number, yb1: number, yt1: number, material: THREE.Material, name: string) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    const AVG = (yb0 + yt0 + yb1 + yt1) / 4;
    const pos = b.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i); // ±0.5
        const t = vx + 0.5;              // 0 at x0-face, 1 at x1-face
        const zh = z0 + (z1 - z0) * t;
        const yb = yb0 + (yb1 - yb0) * t, yt = yt0 + (yt1 - yt0) * t;
        pos.setXYZ(i, vx * (x1 - x0), (vy < 0 ? yb : yt) - AVG, vz * 2 * zh);
    }
    b.geometry.computeVertexNormals();
    b.position.set((x0 + x1) / 2, AVG, 0);
    add(name, b);
    return b;
}

// --- LOWER board: flat base of the chamber, plan-wedge (nose narrow,
// butt wide), y 0.44..0.50 constant (the board does not move)
frustum(-1.85, -0.55, 0.20, 0.36, 0.44, 0.50, 0.44, 0.50, BOARDS, "board_lower");

// --- SOLID leather chamber: fills from the lower board top up to the top
// board underside — thin at the hinge, swelling to full height at the
// nose (mid-stroke). v6 law: the chamber is a MASS, not a gap.
frustum(-1.80, -0.58, 0.17, 0.31, 0.50, 0.90, 0.50, 0.53, LEATHER, "gusset");

// --- TOP board: thick (0.10) oak slab riding the leather, lifted 0.28 at
// the nose by the open chamber (mid-stroke). v7: a REAL tilted slab (two
// y-faces, constant thickness) — v6's rotated zero-thickness sheet was a
// silhouette fiction; the frustum taper carries the tilt honestly.
frustum(-1.80, -0.55, 0.20, 0.34, 0.90, 1.00, 0.62, 0.72, BOARDS, "board_upper");

// --- steel gathering band at the nose (the 18m value band): where the
// boards + leather converge into the iron nozzle fitting. v7: 0.24 long so
// the back face EMBEDS into the boards (v6 floated a 0.07 air gap ahead of
// the nose), raised to span the full nose height and sit PROUD of the top
// board's nose tip (steel carries the leading silhouette edge), and the
// tip fitting promoted IRON_LT->STEEL (bright value at the fire-aim point).
{
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.66, 0.50), STEEL);
    cap.position.set(-1.84, 0.71, 0); // x -1.96..-1.72 (embeds boards -1.80)
    add("nose_cap", cap);
    // nozzle: cast-iron pipe from the band toward the fire, tip drooping
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.062, 0.30, 8), IRON_DK);
    noz.rotation.z = Math.PI / 2 - 0.18; // axis along −x, drooping tip
    noz.position.set(-2.03, 0.56, 0);
    add("nozzle", noz);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.035, 8), STEEL);
    tip.rotation.z = Math.PI / 2 - 0.18;
    tip.position.set(-2.175, 0.534, 0);
    add("nozzle_tip", tip);
}

// --- wooden stop pin through the boards near the hinge (true anatomy)
{
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.34, 6), CUTWOOD);
    pin.position.set(-0.72, 0.68, 0);
    add("stop_pin", pin);
}

// --- trestle cradle on ground skids: 2 trestles (4 splayed legs + rail each)
for (const tx of [-1.55, -0.95]) {
    for (const sz of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.40, 0.07), TIMBER);
        leg.position.set(tx, 0.27, sz * 0.22);
        leg.rotation.x = sz * 0.28; // splay outward toward the ground
        add(`leg_${tx}_${sz}`, leg);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.66), TIMBER);
    rail.position.set(tx, 0.405, 0);
    add(`rail_${tx}`, rail);
}
for (const sz of [-1, 1]) {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.07, 0.08), TIMBER);
    skid.position.set(-1.25, 0.035, sz * 0.38);
    add(`skid_${sz}`, skid);
}

// --- PUMP LEVER as a two-post frame (v6 law, dress-14 ne-yard precedent:
// a horizontal member past a mass ENDS ON A GROUNDED POST): hinge post at
// the butt + far post, thick timber bar spanning them, steel T-grip on
// the bar. Nothing free-ends in air.
{
    const postA = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.34, 0.12), TIMBER);
    postA.position.set(-0.50, 0.55, 0); // base 0.38 (onto rail) top 0.72
    add("hinge_post", postA);
    const postB = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.62, 0.12), TIMBER);
    postB.position.set(0.02, 0.38, 0);  // base 0.07 (ground) top 0.69
    add("lever_post", postB);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.07), TIMBER);
    bar.position.set(-0.24, 0.705, 0);  // spans -0.55..+0.07 post-to-post
    bar.rotation.z = 0.04;
    add("lever", bar);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.36), STEEL);
    t.position.set(-0.02, 0.715, 0);
    add("lever_t", t);
}

// --- ONE coal mound at the nozzle drop point + ember bead on its flank
// (v7: the 18m judge read three scattered lumps as a hairline debris
// streak — single mass law, the ember already marks the drop point)
{
    const mound = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), SCORCH);
    mound.scale.set(1.15, 0.5, 1.0);
    mound.position.set(-2.05, 0.045, 0.02);
    add("coal_mound", mound);
    const e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), EMBER);
    e.scale.y = 0.7;
    e.position.set(-2.02, 0.085, 0.10);
    add("ember_bead", e);
}

mergeByMaterial(g, "dress_ne_bellows1");
writeFileSync("agents/arthur/assets/village_dress_ne_bellows1.glb", toGLB(g));
console.log("village_dress_ne_bellows1.glb —", g.children.length, "top-level groups");
