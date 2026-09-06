// mkv3-sign-mill.ts — waysign-6: MILL SIGN for nx-town-windmill.
// TRUE HANGING idiom (dyer waysign-2 / woodyard waysign-5 chassis): bracket
// plate flush under the front edge of the mill-room ceiling slab (`rceil`,
// source mkv3-landmarks.ts:570 — slab spans full RW 5.2, front edge z 2.6,
// underside y = FY+RH = 2.8), arms over the board corners, three big
// alternating chain links each side, board hanging proud of the front wall
// face (doorGapWall rfront face z 2.6, mkv3-landmarks.ts:568).
// Siting (host-local): x −1.6 — sibling artwalk b10 `four-wind-crown` owns
// the wall center (live bbox local x ±1.125, y 2.22..2.87); door lane
// |x|<0.7 stays clear; local −x maps to world +z (north), away from the
// struct-lane millrace on the south side. Board y 2.13..2.53, no contact
// with the crown (0.225m clear).
// Glyph: FOUR-SAIL CROSS — brass hub ring + four timber shafts on the
// diagonals, each with a pale reefed-cloth tip panel (source-true: the
// mill's own sails are timber shafts + bone cloth + brass hub,
// mkv3-landmarks.ts:662-697). Single-silhouette heritage law: must read as
// one mill-buoy cross at 8m.
// tex-44 METAL V law: bracket/arms/chains forge iron; board flat wood;
// faces bone. Static, no comps, no lights (windmill lamp + windows own the
// night read). Entity: nx-sign-mill-001.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const boneTex = texMat("sign_bone", [0xe4e4c2, 0xd8d8b8], { rough: 0.9, scale: 2, weights: [3, 1] });
const TIMBER = 0x605c40, CLOTH = 0xd8d8b8, TIPCLOTH = 0xead9a2, BRASS = 0xa0a248;

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

// bracket plate under the ceiling-slab edge (plate top = anchor y 2.78,
// flush contact with rceil underside y 2.8 at z 2.5, just inside its edge)
texBox("sg_plate", 0.24, 0.26, 0.06, 0, -0.13, 0, ironTex);
// arms start OUTSIDE the plate span (v2: plate+arms read as one solid
// column in v1 — a 0.24-wide air gap now separates them); arm tips reach
// over the board corners (x ±0.22)
for (const [ai, ax] of [[0, -0.19], [1, 0.19]] as const) {
    texBox(`sg_arm_${ai}`, 0.14, 0.05, 0.05, ax, 0.0, 0.085, ironTex);
    // chain: three BIG alternating links (v2: r 0.040/t 0.012 — v1 links
    // read as rivet dots), hook at board
    ring(`sg_link_${ai}_0`, 0.040, 0.012, ax * 1.158, -0.072, 0.19, false);
    ring(`sg_link_${ai}_1`, 0.040, 0.012, ax * 1.158, -0.170, 0.19, true);
    ring(`sg_link_${ai}_2`, 0.040, 0.012, ax * 1.158, -0.268, 0.19, false);
    ring(`sg_hook_${ai}`, 0.022, 0.009, ax * 1.158, -0.292, 0.19, false);
}
// board hangs from the corner hooks, 0.15m proud of the wall face plane
box(g, "sg_board", 0.5, 0.4, 0.05, 0, -0.45, 0.19, 0x7c6832);
// bone faces both sides (nvp-14 family law: blade signs are two-way)
texBox("sg_face", 0.42, 0.32, 0.04, 0, -0.45, 0.235, boneTex);
texBox("sg_face_back", 0.42, 0.32, 0.04, 0, -0.45, 0.145, boneTex);

// ---- GLYPH: FOUR-SAIL CROSS (both faces) ----
// Brass hub at the board center; four timber shafts on the diagonals
// (±45°), each with a pale cloth tip panel on the outer half (the mill's
// reefed sails). Board-filling scale per waysign-2 v2 law.
const M = new THREE.MeshStandardMaterial({ color: TIMBER, roughness: 0.9 });
const C = new THREE.MeshStandardMaterial({ color: TIPCLOTH, roughness: 0.85 });
const B = new THREE.MeshStandardMaterial({ color: 0xd0aa50, roughness: 0.3, metalness: 0.6 });
const S = new THREE.MeshStandardMaterial({ color: 0xeae6c8, roughness: 0.85 });
for (const [gi, gz] of [[0, 0.28], [1, 0.10]] as const) {
    for (let di = 0; di < 4; di++) {
        const ang = Math.PI / 4 + (di / 4) * Math.PI * 2; // diagonals
        const dx = Math.cos(ang), dy = Math.sin(ang);
        // v4: DARK blade silhouette (family law — every accepted waysign
        // glyph is dark-on-pale; v1..v3's pale cloth dissolved into the
        // bone field). Blade = dark trapezoid approximated by inner narrow
        // + outer wide segments, tapering outward like a mill sail.
        texBox(`glyph_in_${gi}_${di}`, 0.075, 0.034, 0.020, dx * 0.048, -0.45 + dy * 0.048, gz, M, ang);
        texBox(`glyph_out_${gi}_${di}`, 0.115, 0.058, 0.020, dx * 0.145, -0.45 + dy * 0.145, gz, M, ang);
        // pale lattice slits inside each blade (the reefed-lattice sail
        // cue — small bone squares proud of the dark blade)
        for (let li = 0; li < 2; li++) {
            const t = 0.115 + li * 0.075;
            texBox(`glyph_slit_${gi}_${di}_${li}`, 0.030, 0.032, 0.023, dx * t, -0.45 + dy * t, gz, S, ang);
        }
    }
    // hub: bright saturated brass disc over the blade root (v5: judge
    // ACCEPT with a margin note — hub near minimum size, bumped 0.09→0.115
    // to secure the mill read at adverse angles/low light)
    texBox(`glyph_hub_${gi}`, 0.115, 0.115, 0.024, 0, -0.45, gz, B);
}

mergeByMaterial(g, "sgmil");
writeFileSync("agents/arthur/assets/village_sign_mill3.glb", toGLB(g));
console.log("village_sign_mill3.glb —", g.children.length, "nodes");
