// mkv3-forge98.ts — new-era loop 98: THE SMITHY FORGE ANNEX. The smithy
// sign hangs at the court, but the era-3 rebuild archived the workshop
// (village_workshop.glb lives in _era1-2, unplaced) — the trade is signed
// but not staffed. A forge annex at the court's NE corner: stone hearth
// with glowing coals, chimney hood, anvil on an oak stump, hammer resting
// on the anvil face, tongs hung, and the quench barrel (the one loop 52
// decoded the engine could not crank — repurposed as the smith's).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const STONE = 0x56503c, STONE_DK = 0x44402e, OAK = 0x7c6832, IRON = 0x404044;
const DARKWOOD = 0x6a6030;

// tex-6 METAL: brushed-iron tile — fine horizontal grain (2px stripe =
// brush strokes), close dark tones, roughness-led. Reads as hammered iron
// up close, flat iron at distance. Applied to anvil, hammer head, tongs,
// barrel hoops; hearth stones get the village ashlar tile (identical
// params to housekit stoneMat — cell law, visual consistency by
// construction; stoneMat itself isn't exported and housekit is under
// concurrent lane edits, so the params are duplicated verbatim).
const ironMat = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// tex-56: the forge's woodwork joins the village timber — bellows,
// anvil stump, hammer handle, and the quench barrel take the family
// tile (sawn/staved wood; the quench is a stave barrel like the rain
// barrels and churn — its hoops already iron). Coals + fire stay
// emissive flat (light is light), water stays water, and the small
// flat trim (hood/flue soot-dark stone caps) keeps its flat color —
// subtlety at trim scale, the doubt law.
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });

// ---- HEARTH: stone box w/ firebox opening ----
// tex-6: hearth masonry carries the ashlar tile (box0 keeps flat color for
// the small trim pieces)
{
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 0.9), stoneTex);
    body.name = "fg_body";
    body.position.set(0, 0.42, 0);
    g.add(body);
}
box0("fg_cap", 1.2, 0.1, 1.0, 0, 0.9, 0, STONE_DK);
// firebox mouth (dark inset)
box0("fg_mouth", 0.7, 0.4, 0.06, 0, 0.45, 0.46, 0x242016);
// glowing coals inside — Wakeup-44: they ride a fire_fg_coals anchor group
// (`fire` already KEEP); the forge fire can breathe under its hood.
// tex-86 FIX (forge sticking out): coals now carry a REAL emissive like
// every other fire in the village (court basket = ring.ts:61 recipe:
// ff9040 base / ff6a1a emissive @1.0 — standing fire colors, never
// rotated; tex-85's palette pass had moved the flat ff7030→febe4a making
// the forge the village's only pale dead fire).
const coalsGrp = new THREE.Group();
coalsGrp.name = "fire_fg_coals";
const fireMat = (color: number, em: number, i = 1.0) =>
    new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(em), emissiveIntensity: i, roughness: 0.35, metalness: 0.1 });
const coals = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), fireMat(0xff9040, 0xff6a1a));
coals.name = "fg_coals";
coals.position.set(0, 0.38, 0.42);
coalsGrp.add(coals);
g.add(coalsGrp);
const coal2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), fireMat(0xffa050, 0xff7a2a, 0.85));
coal2.name = "fg_coal2";
coal2.position.set(0.18, 0.33, 0.42);
coalsGrp.add(coal2); // the second coal rides the same breathing anchor
// chimney hood (tapering box stack)
box0("fg_hood", 0.8, 0.35, 0.7, 0, 1.15, 0, STONE_DK);
box0("fg_flue", 0.35, 0.8, 0.35, 0, 1.7, 0, STONE_DK);

// ---- BELLOW (hung at the side, angled) ----
const bellows = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.22), timberTex);
bellows.name = "fg_bellows";
bellows.rotation.z = 0.4;
bellows.position.set(-0.72, 0.7, 0.2);
g.add(bellows);

// ---- ANVIL on an oak stump ----
const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.35, 8), timberTex);
stump.name = "fg_stump";
stump.position.set(0.95, 0.18, 0.35);
g.add(stump);
// anvil: body + horn + heel + base (tex-6: brushed iron)
{
    const ab = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.18), ironMat);
    ab.name = "fg_anvil_body";
    ab.position.set(0.95, 0.44, 0.35);
    g.add(ab);
}
const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 6), ironMat);
horn.rotation.z = -Math.PI / 2;
horn.name = "fg_anvil_horn";
horn.position.set(1.32, 0.44, 0.35);
g.add(horn);
box0("fg_anvil_heel", 0.12, 0.14, 0.16, 0.75, 0.42, 0.35, IRON);
box0("fg_anvil_base", 0.2, 0.16, 0.14, 0.95, 0.31, 0.35, IRON);

// ---- HAMMER resting on the anvil face ----
const hHead = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.2, 8), ironMat);
hHead.rotation.z = Math.PI / 2;
hHead.name = "fg_hammer_head";
hHead.position.set(0.95, 0.55, 0.35);
g.add(hHead);
const hHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.5, 6), timberTex);
hHandle.rotation.z = Math.PI / 2 + 0.25;
hHandle.name = "fg_hammer_handle";
hHandle.position.set(0.85, 0.53, 0.38);
g.add(hHandle);

// ---- TONGS hung on the hearth side ----
for (const t of [0, 1]) {
    const tong = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.45, 0.02), ironMat);
    tong.rotation.z = t ? 0.12 : -0.12;
    tong.name = `fg_tong_${t}`;
    tong.position.set(-0.58, 0.75 + t * 0.06, -0.25);
    g.add(tong);
}

// ---- TOOL RACK (interior-2): the open forge bay gains an explicit home
// for files, chisels, and the spare hammer. It sits behind the hanging tongs,
// inside the inherited bbox; the entire +Z work apron remains untouched.
{
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.82, 0.08), timberTex);
    back.name = "fg_toolrack";
    back.position.set(-0.7, 0.82, -0.55);
    g.add(back);
    for (const [ri, ry] of [[0, 0.58], [1, 0.9], [2, 1.18]] as const)
        box0(`fg_rackbar_${ri}`, 0.34, 0.05, 0.12, -0.7, ry, -0.49, IRON);
    for (const [ti, tx, len] of [[0, -0.81, 0.48], [1, -0.7, 0.56], [2, -0.59, 0.42]] as const) {
        const tool = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, len, 6), ironMat);
        tool.name = `fg_racktool_${ti}`;
        tool.position.set(tx, 0.88, -0.42);
        tool.rotation.z = ti === 1 ? 0.08 : -0.04;
        g.add(tool);
    }
}

// ---- QUENCH BARREL (stave barrel, dark-stained from use) ----
const qbarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 0.55, 10), timberTex);
qbarrel.name = "fg_quench";
qbarrel.position.set(1.0, 0.28, -0.55);
g.add(qbarrel);
// water surface ring
const qwater = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.02, 10), mat(0x303840, 0.3, 0.5));
qwater.name = "fg_quench_water";
qwater.position.set(1.0, 0.55, -0.55);
g.add(qwater);
// 2 iron hoops
for (const [hi, hy] of [[0, 0.15], [1, 0.45]] as const) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.012, 4, 12), ironMat);
    hoop.rotation.x = Math.PI / 2;
    hoop.name = `fg_qhoop_${hi}`;
    hoop.position.set(1.0, hy, -0.55);
    g.add(hoop);
}

// ---- THE SMITH'S LIVING CORNER (interior-12 / P2-3): stool, blade rack,
// apron hook. The bay already shows the WORK; these three show the WORKER.
// Everything stays inside the inherited AABB (x∈[-0.87,1.46], z≤0.49) so the
// furniture-scale collider does not drift, and the entire +Z work apron
// remains untouched.
// SMITH'S STOOL: three-legged oak stool beside the anvil (seat 0.44, the
// working height), tucked behind the horn line so the anvil face stays open.
{
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.05, 8), timberTex);
    seat.name = "fg_stool_seat";
    seat.position.set(1.26, 0.44, -0.02);
    g.add(seat);
    for (const [li, la] of [[0, 0], [1, (2 * Math.PI) / 3], [2, (4 * Math.PI) / 3]] as const) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.42, 6), timberTex);
        leg.name = `fg_stool_leg_${li}`;
        leg.position.set(1.26 + Math.cos(la) * 0.11, 0.21, -0.02 + Math.sin(la) * 0.11);
        leg.rotation.z = Math.cos(la) * 0.08;
        leg.rotation.x = -Math.sin(la) * 0.08;
        g.add(leg);
    }
}
// QUENCHED BLADE RACK: a low timber rack in the gap between the toolrack and
// the quench barrel — three finished blades (dark quenched iron) resting on
// two brass-lined bars, points out. The smith's finished work waits here.
{
    for (const [ui, uz] of [[0, -0.66], [1, -0.44]] as const) {
        const up = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.06), timberTex);
        up.name = `fg_brack_up_${ui}`;
        up.position.set(0.1, 0.15, uz);
        g.add(up);
    }
    for (const [bi2, by] of [[0, 0.16], [1, 0.26]] as const)
        box0(`fg_brack_bar_${bi2}`, 0.52, 0.04, 0.05, 0.1, by, -0.55, 0xa0a248);
    for (const [ki, kx, kl] of [[0, -0.04, 0.5], [1, 0.1, 0.44], [2, 0.24, 0.38]] as const) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.012, kl), mat(0x3c3e46, 0.5, 0.6));
        blade.name = `fg_blade_${ki}`;
        blade.position.set(kx, 0.29 + ki * 0.045, -0.5);
        blade.rotation.x = -0.12 + ki * 0.03;
        g.add(blade);
    }
}
// APRON HOOK: iron hook on the hearth's east face with the leather apron
// hanging — the smith's own story mark.
{
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 5, 10), ironMat);
    hook.name = "fg_apronhook";
    hook.position.set(0.58, 0.82, -0.1);
    g.add(hook);
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5, 0.34), mat(0x4c3820, 0.95, 0));
    apron.name = "fg_apron";
    apron.position.set(0.585, 0.55, -0.1);
    g.add(apron);
}

function box0(name: string, w: number, h: number, d: number, x: number, y: number, z: number, c: number) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, 0.92, 0));
    m.name = name;
    m.position.set(x, y, z);
    g.add(m);
}

mergeByMaterial(g, "fg3");
writeFileSync("agents/arthur/assets/village_forge3.glb", toGLB(g));
console.log("village_forge3.glb —", g.children.length, "top-level");
