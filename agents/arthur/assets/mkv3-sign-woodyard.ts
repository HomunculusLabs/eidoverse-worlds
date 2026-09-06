// mkv3-sign-woodyard.ts — waysign-5: WOOD YARD SIGN for nx-town-woodyard.
// Heritage HANGING idiom (refine-276 iron; dyer chassis waysign-2): the
// woodyard is a 3-sided open shed (posts at host-local z ±0.9, slanted
// lean-to roof high at back, open front), so the bracket hangs under the
// FRONT EAVE. ANCHOR TRUTH = LIVE bbox (lib 1f2c6f592095b204, an
// intentional old-gen tex-85 freeze — local rebuild does NOT reproduce
// live bytes; live bbox y-max 2.526 = roof back corner, x-max 2.876 =
// stump, z-max 1.508 = kindling, roof front edge ≈ z1.29 y2.14 top /
// ~2.10 underside per source tilt law). Anchor host-local [0, 2.05, 1.25]:
// plate top flush under the eave just inside its edge; board hangs in
// open air past the front posts, glyph facing down the plaza approach
// (host-local +z world dir −0.457,−0.889).
// Glyph: SAW-BUCK — two X trestles + a lying log, in the woodyard's own
// colors (split face 0xa09832 / bark 0x6a6030, source-law from
// mkv3-woodyard27.ts). Single-silhouette heritage law: the X+log must
// read as one shape at 8m.
// tex-44 METAL V law: bracket/arms/chains in the forge iron; board flat
// wood; faces bone. Static, no comps, no lights (longhouse/potter
// lanterns own the night read). Entity: nx-sign-woodyard-001.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
// waysign-11 R2-4: bone lifted 0xe4e4c2 -> 0xefeccf (kiln waysign-10
// precedent — eave-shadow value crush); plate slimmed 0.26 -> 0.09 tall
// (native 18m re-judge: fat plate + gap read as a black content-free
// header band occupying the top quarter of the board); glyph scaled to
// face-filling (R2 root class: was ~60% width lower half per oblique
// judge, decode 76% w discs — now 85% width incl. discs / 62% height,
// kiln 73% / dyer 71-82% family).
const boneTex = texMat("sign_bone", [0xefeccf, 0xdfdcbf], { rough: 0.9, scale: 2, weights: [3, 1] });
const SPLIT = 0xa09832, BARK = 0x6a6030;

const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material, rz = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    if (rz) mesh.rotation.z = rz;
    g.add(mesh);
};
const ring = (name: string, r: number, t: number, x: number, y: number, z: number, rotY: boolean) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 5, 12), ironTex);
    m.name = name;
    m.position.set(x, y, z);
    if (rotY) m.rotation.y = Math.PI / 2;
    g.add(m);
};

// bracket strap under the eave (waysign-11 R2-4: slim strap 0.24x0.09,
// center y -0.045 → plate spans -0.09..0, board top now -0.27 — clear
// 0.18m lit gap; a FAT plate at board-top reads as a black header void)
texBox("sg_plate", 0.24, 0.09, 0.06, 0, -0.045, 0, ironTex);
// arms reach out over the board CORNERS (board corners at x ±0.22)
for (const [ai, ax] of [[0, -0.22], [1, 0.22]] as const) {
    texBox(`sg_arm_${ai}`, 0.24, 0.05, 0.05, ax * 0.55, -0.025, 0.085, ironTex);
    // chain: three BIG alternating links (waysign-2 v2 law: ~2cm visible
    // air between links), first off the arm tip, last hooks the board
    ring(`sg_link_${ai}_0`, 0.032, 0.010, ax, -0.085, 0.19, false);
    ring(`sg_link_${ai}_1`, 0.032, 0.010, ax, -0.168, 0.19, true);
    ring(`sg_link_${ai}_2`, 0.032, 0.010, ax, -0.251, 0.19, false);
    ring(`sg_hook_${ai}`, 0.020, 0.008, ax, -0.271, 0.19, false);
}
// board hangs from the corner hooks, 0.15m proud of the eave plane
// (waysign-11: dropped 0.45 -> 0.52 for lit separation from the strap)
box(g, "sg_board", 0.5, 0.4, 0.05, 0, -0.52, 0.19, 0x7c6832);
// bone faces both sides (nvp-14 family law: blade signs are two-way)
texBox("sg_face", 0.42, 0.32, 0.04, 0, -0.52, 0.235, boneTex);
texBox("sg_face_back", 0.42, 0.32, 0.04, 0, -0.52, 0.145, boneTex);

// ---- GLYPH: SAW-BUCK (both faces) ----
// Two X trestles (bark-dark legs, hard crossing) + one lying log
// (split-face light, proud of the trestles) resting in the crotches.
// waysign-11 R2-4: scaled to face-filling about the new face center
// (y -0.52): height 48% -> 62% of face, width 76% -> 85% (the saw-buck
// is intrinsically wide; margins 0.031 each side), strokes thickened
// for distance (legs 0.028 -> 0.034, log h 0.052 -> 0.062).
// v2 (judge fix): 18m FAIL — thin dark diagonals anti-alias to ~1px and
// the two X's merge; family's dark-on-pale law says widen the DARK
// strokes. Legs 0.034 -> 0.052 wide, trestles spread tx 0.102 -> 0.125
// for a clear inter-X bone gap (>= 2px at 18m), ties dropped (the X's
// own crossing reads the trestle; a cap bar adds a third dark stroke
// that re-merges), leg length trimmed 0.24 -> 0.21 to keep the X inside
// the board after widening.
for (const [gi, gz] of [[0, 0.28], [1, 0.10]] as const) {
    for (const [ti, tx] of [[0, -0.125], [1, 0.125]] as const) {
        // X trestle: two crossed legs ±0.72 rad (steeper crossing = wider
        // X spread at the same height), leg 0.21 long, FAT 0.052 stroke
        texBox(`glyph_leg_${gi}_${ti}a`, 0.052, 0.21, 0.02, tx, -0.525, gz, new THREE.MeshStandardMaterial({ color: BARK, roughness: 0.95 }), 0.72);
        texBox(`glyph_leg_${gi}_${ti}b`, 0.052, 0.21, 0.02, tx, -0.525, gz, new THREE.MeshStandardMaterial({ color: BARK, roughness: 0.95 }), -0.72);
    }
    // lying log spanning both trestles, split-face light w/ BIG cut-face
    // end discs (v2: vision said end-grain invisible at size; waysign-11
    // grows them again for the 18m read). Log RAISED into the X crotches
    // (y -0.452) so the X's stay visible below it; discs brightened.
    texBox(`glyph_log_${gi}`, 0.34, 0.062, 0.024, 0, -0.452, gz, new THREE.MeshStandardMaterial({ color: 0xc0a04e, roughness: 0.9 }));
    texBox(`glyph_logend_l_${gi}`, 0.020, 0.086, 0.028, -0.170, -0.452, gz, new THREE.MeshStandardMaterial({ color: 0xf2e3b0, roughness: 0.9 }));
    texBox(`glyph_logend_r_${gi}`, 0.020, 0.086, 0.028, 0.170, -0.452, gz, new THREE.MeshStandardMaterial({ color: 0xf2e3b0, roughness: 0.9 }));
    // bark stripe under the log (one dark underscore = round read)
    texBox(`glyph_bark_${gi}`, 0.34, 0.022, 0.020, 0, -0.492, gz, new THREE.MeshStandardMaterial({ color: BARK, roughness: 0.95 }));
}

mergeByMaterial(g, "sgwod");
writeFileSync("agents/arthur/assets/village_sign_woodyard3.glb", toGLB(g));
console.log("village_sign_woodyard3.glb —", g.children.length, "nodes");
