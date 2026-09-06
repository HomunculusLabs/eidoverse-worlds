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
const boneTex = texMat("sign_bone", [0xe4e4c2, 0xd8d8b8], { rough: 0.9, scale: 2, weights: [3, 1] });
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

// bracket plate under the eave (plate top = anchor y 2.05, flush contact
// with the tilted roof underside ~2.08-2.10 at z 1.25)
texBox("sg_plate", 0.24, 0.26, 0.06, 0, -0.13, 0, ironTex);
// arms reach out over the board CORNERS (board corners at x ±0.22)
for (const [ai, ax] of [[0, -0.22], [1, 0.22]] as const) {
    texBox(`sg_arm_${ai}`, 0.24, 0.05, 0.05, ax * 0.55, 0.0, 0.085, ironTex);
    // chain: three BIG alternating links (waysign-2 v2 law: ~2cm visible
    // air between links), first off the arm tip, last hooks the board
    ring(`sg_link_${ai}_0`, 0.032, 0.010, ax, -0.065, 0.19, false);
    ring(`sg_link_${ai}_1`, 0.032, 0.010, ax, -0.150, 0.19, true);
    ring(`sg_link_${ai}_2`, 0.032, 0.010, ax, -0.235, 0.19, false);
    ring(`sg_hook_${ai}`, 0.020, 0.008, ax, -0.255, 0.19, false);
}
// board hangs from the corner hooks, 0.15m proud of the eave plane
box(g, "sg_board", 0.5, 0.4, 0.05, 0, -0.45, 0.19, 0x7c6832);
// bone faces both sides (nvp-14 family law: blade signs are two-way)
texBox("sg_face", 0.42, 0.32, 0.04, 0, -0.45, 0.235, boneTex);
texBox("sg_face_back", 0.42, 0.32, 0.04, 0, -0.45, 0.145, boneTex);

// ---- GLYPH: SAW-BUCK (both faces) ----
// Two X trestles (bark-dark legs, hard crossing) + one lying log
// (split-face light, proud of the trestles) resting in the crotches.
// Board-filling scale per waysign-2 v2 law.
for (const [gi, gz] of [[0, 0.28], [1, 0.10]] as const) {
    for (const [ti, tx] of [[0, -0.09], [1, 0.09]] as const) {
        // X trestle: two crossed legs ±0.62 rad, leg 0.19 long
        texBox(`glyph_leg_${gi}_${ti}a`, 0.028, 0.19, 0.02, tx, -0.415, gz, new THREE.MeshStandardMaterial({ color: BARK, roughness: 0.95 }), 0.62);
        texBox(`glyph_leg_${gi}_${ti}b`, 0.028, 0.19, 0.02, tx, -0.415, gz, new THREE.MeshStandardMaterial({ color: BARK, roughness: 0.95 }), -0.62);
        // crotch cap: short horizontal tie at the top of each X
        texBox(`glyph_tie_${gi}_${ti}`, 0.055, 0.020, 0.02, tx, -0.345, gz, new THREE.MeshStandardMaterial({ color: BARK, roughness: 0.95 }));
    }
    // lying log spanning both trestles, split-face light w/ BIG cut-face
    // end discs (v2: vision said end-grain invisible at size — discs now
    // 2.4x taller, brighter, log shortened for frame margin)
    texBox(`glyph_log_${gi}`, 0.30, 0.052, 0.024, 0, -0.375, gz, new THREE.MeshStandardMaterial({ color: 0xc0a04e, roughness: 0.9 }));
    texBox(`glyph_logend_l_${gi}`, 0.014, 0.064, 0.028, -0.152, -0.375, gz, new THREE.MeshStandardMaterial({ color: 0xead9a2, roughness: 0.9 }));
    texBox(`glyph_logend_r_${gi}`, 0.014, 0.064, 0.028, 0.152, -0.375, gz, new THREE.MeshStandardMaterial({ color: 0xead9a2, roughness: 0.9 }));
    // bark stripe under the log (one dark underscore = round read)
    texBox(`glyph_bark_${gi}`, 0.30, 0.018, 0.020, 0, -0.405, gz, new THREE.MeshStandardMaterial({ color: BARK, roughness: 0.95 }));
}

mergeByMaterial(g, "sgwod");
writeFileSync("agents/arthur/assets/village_sign_woodyard3.glb", toGLB(g));
console.log("village_sign_woodyard3.glb —", g.children.length, "nodes");
