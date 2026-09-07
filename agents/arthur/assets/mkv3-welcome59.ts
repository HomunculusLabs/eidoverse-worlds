// mkv3-welcome59.ts — THE WELCOME BOARD. At the plaza's S rim (visible
// from the spawn hearth, facing it): a modest signboard — THE COMMONS,
// carved like the name board, with 4 small pointer arms (N road+E gate,
// E well, SW monument, SE market). The village greets its visitors.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// tex-15 TIMBER III: the welcome board joins the timber family — post and
// all five pointer arms take the village timber tile (identical wallSpan
// params — one wood through every standing timber); board face and name
// bar stay flat BONE (painted/caved sign faces read flat at distance);
// foot stone joins the ashlar family (cell law — it's laid stone).
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// ---- POST + BOARD ----
const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.5, 6), timberTex);
post.name = "wb_post";
post.position.set(0, 0.75, 0);
g.add(post);
const board = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.42, 0.06), mat(0xe4e4c2, 0.92, 0));
board.name = "wb_board";
board.position.set(0, 1.35, 0);
g.add(board);
// nvp-4: the old "name bar" was literally one blank dark rectangle — the
// model's central promise (THE COMMONS) existed only in comments and vanished
// at gameplay distance. Draw a real raised 3×5 COMMONS inscription on the bone
// face. The pixels merge into one flat painted-letter bucket, so readability
// improves without spending a draw node per letter.
const GLYPH: Record<string, string[]> = {
    C: ["111", "100", "100", "100", "111"],
    O: ["111", "101", "101", "101", "111"],
    M: ["101", "111", "111", "101", "101"],
    N: ["101", "111", "111", "111", "101"],
    S: ["111", "100", "111", "001", "111"],
};
const word = "COMMONS", cw = 0.036, ch = 0.042, letterGap = 0.02;
// improve-29: name-bar idiom (monument plaque / mapboard ink lineage) —
// dark band + pale carved glyphs. Dark-on-bone at 3x5-pixel scale smears
// at 18m (survey-7 native Sev 3); a contrast BAR makes the inscription
// read as language even sub-legible. Glyph fill 0.82->0.92 (solid ink);
// band sized to cover the full 5-row glyph run with margin.
const wordW = word.length * (3 * cw + letterGap) - letterGap;
const bar = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.25, 0.02), mat(0x4a432e, 0.95, 0));
bar.name = "wb_name_bar";
bar.position.set(0, 1.368, 0.038);
g.add(bar);
let cursor = -wordW / 2 + cw / 2;
for (const [li, letter] of [...word].entries()) {
    for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) {
        if (GLYPH[letter][row][col] !== "1") continue;
        const px = new THREE.Mesh(new THREE.BoxGeometry(cw * 0.92, ch * 0.92, 0.014), mat(0xd8d2ae, 0.85, 0));
        px.name = `wb_name_${li}_${row}_${col}`;
        px.position.set(cursor + col * cw, 1.447 - row * ch, 0.052);
        g.add(px);
    }
    cursor += 3 * cw + letterGap;
}
// ---- POINTER ARMS: 5 small angled slats fanning below the board ----
// N (road+gate), E (well), SW (monument), SE (market corner), and —
// loop #91 — the CAROUSEL arm: the wonder piece finally gets its signpost
// (the SE landmark at r32/126°, plainly visible from the spawn view).
const arms: Array<[number, number, number]> = [
    [0.35, 1.16, 0.55],   // arm angle: NE-ish → N road
    [-0.35, 1.16, -0.55], // SW → monument
    [0.55, 1.05, -0.2],   // E → well
    [-0.5, 1.05, 0.35],   // SE-ish → market
    [0.45, 0.94, 0.95],   // ESE → the carousel (loop 91): ride it
];
// improve-29 v2: decode audit proved v1's local-x embedding insufficient —
// rotation.y (pointing yaw, up to 0.95 rad) swings the inner end 0.07-0.15m
// off the post sideways; the true gap is the yaw swing, not the x shortfall.
// v2 pivots each arm AT the post: geometry translated so the inner end is
// the mesh origin, mesh seated 0.04 along its own rotated direction (inside
// the r0.062 post cylinder) — the tip stays attached under ANY rotation by
// construction. w 0.34->0.46 (reach 0.50 vs baseline 0.61 along-arm,
// disclosed); rotations (pointing semantics) untouched.
arms.forEach(([ax, ay, rot], i) => {
    // improve-29 v4 (decode-driven): each arm RADIATES FROM THE POST toward
    // its original far tip — tip coords preserved exactly (envelope
    // identical by construction), inner end seated 0.04 from the post axis
    // (inside r0.062 post), gap closed under any rotation. v1 embedded in
    // local x but rotation.y swung the inner end off-post (decode FAIL);
    // v2 pivoted correctly but uniform w0.46 changed reaches; v3 had a
    // left-side sign error. v4: direction = normalize(original far tip).
    const ux = Math.cos(rot), uz = -Math.sin(rot); // box axis under rotation.y=rot
    const cx = ax * 0.8, cz = 0.03;
    const far = Math.sign(ax) > 0 ? 1 : -1; // which end was farther from post
    const tipX = cx + far * 0.17 * ux, tipZ = cz + far * 0.17 * uz;
    const len = Math.hypot(tipX, tipZ);
    const w = len - 0.04;
    const dx = tipX / len, dz = tipZ / len;
    const geo = new THREE.BoxGeometry(w, 0.055, 0.025);
    geo.translate(w / 2, 0, 0); // inner end at mesh origin
    const arm = new THREE.Mesh(geo, timberTex);
    arm.name = `wb_arm_${i}`;
    arm.position.set(0.04 * dx, ay, 0.04 * dz);
    arm.rotation.y = Math.atan2(-dz, dx);
    arm.rotation.z = ax > 0 ? -0.08 : 0.08;
    g.add(arm);
});
// foot stone — tex-15 ashlar
{
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.3), stoneTex);
    foot.name = "wb_foot";
    foot.position.set(0, 0.06, 0);
    g.add(foot);
}
// polish-29 NIGHT LAMP: polish-28's gate proved the board unreadable at 5m
// night (charitable case) — the S rim sits dark under the lightrig 8-slot
// budget. The mapboard's medicine (polish-5/16): a small warm emissive marks
// the sign and gives the eye a landing point. A brass arm over the board +
// one emissive globe (same warm tone as the carousel lanterns / map hearth);
// named wb_lamp so mergeByMaterial's KEEP regex (`lamp`) preserves it as a
// light anchor. One new material; no other geometry touched.
{
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 6), timberTex);
    arm.name = "wb_lamp_arm";
    arm.position.set(0, 1.62, 0.1);
    arm.rotation.x = Math.PI / 2.4;
    g.add(arm);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xffb066, emissive: new THREE.Color(0xff9a4a), emissiveIntensity: 1.5, roughness: 0.5 }));
    globe.name = "wb_lamp";
    globe.position.set(0, 1.55, 0.19);
    g.add(globe);
}

mergeByMaterial(g, "wb3");
writeFileSync("agents/arthur/assets/village_welcome3.glb", toGLB(g));
console.log("village_welcome3.glb —", g.children.length, "nodes");
