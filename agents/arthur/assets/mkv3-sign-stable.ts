// mkv3-sign-stable.ts — waysign-1: LIVERY SIGN for nx-town-stable.
// Heritage idiom (refine-276 / tex-44): iron bracket plate, arms, hangers
// and chain links in the forge iron; board flat wood; faces bone; glyph
// painted iron. FLAT-MOUNT variant of the blade kit: the E road meets the
// stable's back (west) wall head-on (the road ends here), so the board
// hangs PARALLEL to the wall with its face normal on the road axis —
// readable straight down the road from the inn, not edge-on.
// Wall plane = local z 0 (plate flush-touches the wall face at world
// x 40.90 when the entity sits at yaw -pi/2 with plate back at 40.91);
// board hangs 0.15m proud; glyph = drawn horseshoe (heritage livery).
// Static geometry, no comps, no lights (stable lantern + road lamps own
// the night read). Entity: nx-sign-stable-001.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// tex-44 METAL V family law: signs hang on smithed iron — same iron
// texture bytes as every standing trade sign and the forge itself.
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const boneTex = texMat("sign_bone", [0xe4e4c2, 0xd8d8b8], { rough: 0.9, scale: 2, weights: [3, 1] });

const texBox = (gr: THREE.Group, name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    gr.add(mesh);
};

// bracket plate flush on the wall at the eave line (wall top = 2.7)
texBox(g, "sg_plate", 0.24, 0.3, 0.06, 0, 2.55, 0.03, ironTex);
// review fix (waysign-1 v2): arms reach out over the board CORNERS and the
// chain drop is visible — hanger rods span arm-to-board with two links each,
// so the sign reads as arm-and-chain suspension, not a stacked slab.
for (const [ai, ax] of [[0, -0.22], [1, 0.22]] as const) {
    texBox(g, `sg_arm_${ai}`, 0.24, 0.05, 0.05, ax * 0.55, 2.65, 0.115, ironTex);
    texBox(g, `sg_hang_${ai}`, 0.022, 0.24, 0.022, ax, 2.53, 0.22, ironTex);
    for (const [li, ly] of [[0, 2.585], [1, 2.50]] as const) {
        const link = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 5, 10), ironTex);
        link.name = `sg_link_${ai}_${li}`;
        link.position.set(ax, ly, 0.22);
        link.rotation.y = Math.PI / 2;
        g.add(link);
    }
}
// board hangs flat, 0.15m proud of the wall, top corners on the hangers
box(g, "sg_board", 0.5, 0.4, 0.05, 0, 2.22, 0.22, 0x7c6832);
// bone faces both sides (nvp-14 family law: blade signs read from every
// approach a visitor actually walks — here the road face and the yard face)
texBox(g, "sg_face", 0.42, 0.32, 0.04, 0, 2.22, 0.265, boneTex);
texBox(g, "sg_face_back", 0.42, 0.32, 0.04, 0, 2.22, 0.175, boneTex);
// glyph: drawn horseshoe (heritage livery glyph), raised on both faces
for (const [gi, gz, mirrored] of [[0, 0.3, false], [1, 0.14, true]] as const) {
    const shoe = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 5, 10, Math.PI * 1.5), ironTex);
    shoe.name = `glyph_shoe_${gi}`;
    shoe.position.set(0, 2.22, gz);
    shoe.rotation.z = Math.PI * 0.75;
    if (mirrored) shoe.rotation.y = Math.PI;
    g.add(shoe);
}

mergeByMaterial(g, "sgstab");
writeFileSync("agents/arthur/assets/village_sign_stable3.glb", toGLB(g));
console.log("village_sign_stable3.glb —", g.children.length, "nodes");
