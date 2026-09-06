// mkv3-sign-dyer.ts — waysign-2: DYER SIGN for nx-town-dyehouse.
// Heritage HANGING idiom (signKit, mkv3-signs11) adapted to an open shed:
// the dyehouse has NO front wall (posts + tilted roof, drying line inside),
// so the bracket hangs under the HIGH FRONT EAVE (roof edge host-local
// z~1.146, rafter underside y~2.04 at the shed plane), arms reach out over
// the board corners, and the board hangs in open air 0.15m proud of the
// shed plane — readable from the NE/plaza approach along the host's front
// normal (world dir 0.808, 0.589). Plate top at anchor y touches the
// rafter underside: flush bolted-to-the-rafter-tail mount.
// v2 (waysign-2 vision review rejected v1: filled-neck slab read, glyph
// bar too heavy, drip bead read as orphan stub): suspension is now three
// big alternating chain links per side with AIR between them plus a hook
// torus at each board corner; glyph is TWO dipped strips (flax-blue +
// madder-red — the real vat colors) on a thin line-bar with hard dip
// boundaries, wide cloth, board-filling scale.
// tex-44 METAL V law: bracket/arms/chains in the forge iron; board flat
// wood; faces bone; the dipped cloth is the message, not the construction.
// Static, no comps, no lights (the dyehouse work lantern owns the night
// read). Entity: nx-sign-dyer-001 at host-local (0, 2.05, 1.13), yaw=host.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const boneTex = texMat("sign_bone", [0xe4e4c2, 0xd8d8b8], { rough: 0.9, scale: 2, weights: [3, 1] });
const FLAX = 0x526a96, MADDER = 0x7e4426, BONE = 0xe4e4c2;

const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};
const ring = (name: string, r: number, t: number, x: number, y: number, z: number, rotY: boolean) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 5, 12), ironTex);
    m.name = name;
    m.position.set(x, y, z);
    if (rotY) m.rotation.y = Math.PI / 2;
    g.add(m);
};

// bracket plate under the rafter tail (plate top = anchor y 2.05, flush
// contact with the tilted roof underside ~2.04 at the shed plane)
texBox("sg_plate", 0.24, 0.26, 0.06, 0, -0.13, 0, ironTex);
// arms reach out over the board CORNERS (board corners at x ±0.22)
for (const [ai, ax] of [[0, -0.22], [1, 0.22]] as const) {
    texBox(`sg_arm_${ai}`, 0.24, 0.05, 0.05, ax * 0.55, 0.0, 0.085, ironTex);
    // v2 chain: three BIG alternating links, radius 0.032, centers spaced
    // 0.085 — ~2cm of visible air between consecutive links; first link
    // hangs off the arm tip, last hooks the board's top corner.
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
// v2 glyph: thin line-bar + TWO dipped strips (flax-blue, madder-red —
// the real vat colors), wide cloth, hard dip boundaries, filling the face.
for (const [gi, gz] of [[0, 0.28], [1, 0.10]] as const) {
    box(g, `glyph_line_${gi}`, 0.30, 0.015, 0.02, 0, -0.335, gz, 0xa09832);
    // strip A — flax-blue dip, folded over the bar (flap above, body below)
    box(g, `glyph_a_flap_${gi}`, 0.11, 0.03, 0.02, -0.075, -0.312, gz, BONE);
    box(g, `glyph_a_top_${gi}`, 0.11, 0.07, 0.02, -0.075, -0.415, gz, BONE);
    box(g, `glyph_a_dip_${gi}`, 0.11, 0.11, 0.02, -0.075, -0.505, gz, FLAX);
    // strip B — madder-red dip, slightly shorter, right of center
    box(g, `glyph_b_flap_${gi}`, 0.11, 0.03, 0.02, 0.075, -0.312, gz, BONE);
    box(g, `glyph_b_top_${gi}`, 0.11, 0.06, 0.02, 0.075, -0.405, gz, BONE);
    box(g, `glyph_b_dip_${gi}`, 0.11, 0.09, 0.02, 0.075, -0.480, gz, MADDER);
}

mergeByMaterial(g, "sgdyr");
writeFileSync("agents/arthur/assets/village_sign_dyer3.glb", toGLB(g));
console.log("village_sign_dyer3.glb —", g.children.length, "nodes");
