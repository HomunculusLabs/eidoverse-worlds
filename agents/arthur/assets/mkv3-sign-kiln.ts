// mkv3-sign-kiln.ts — waysign-3: KILN SIGN for nx-town-kiln.
// Host decode (mkv3-kiln38.ts, live lib 4d8ef8fc… = local bytes, verified
// this tick): tapered stone drum — upper frustum host y 1.6..2.9, radius
// 1.0→0.7 tapering upward (r 0.873 @ y2.15, 0.919 @ y1.95, 0.827 @ y2.35);
// FIRE MOUTH on host-local +z face; charging ring at top y 2.92. The +z
// face is the road face (host yaw −2.4785; the E-ring track meets the
// kiln at the mouth side).
// PROJECTED-ARM IDIOM (dyer precedent, adapted to a drum): the front face
// is occupied — sibling rider nx-artwalk-b12-kiln-heat-contours (thin
// 0.125m film) covers host-local x±0.775 on the drum face at z 1.145..1.27
// y 0.026..1.614, and interior-18's burn ledger board sits at x 0.95 — so
// the sign does NOT mount flush on the drum. Two iron straps CIRCLE the
// upper drum (each sized to its height's taper radius so ~3-5cm of iron
// stays proud of the stone), two arms project from the drum face out over
// the board, and the board hangs on chains in open air BEYOND and ABOVE
// the sibling film: board host y 1.675..2.075 (film top 1.614 — clear by
// 6cm, no occlusion of the sibling art), board z host 1.415..1.465 vs film
// max z 1.27 (2D z-gap +14.5cm; arm y-band 2.305..2.355 fully above film
// — nvp-134 suspended-decor class, gap-bounded exemption in the placer).
// v1 of this script (decode-rejected before any placement): arms reached
// only host z 0.38 and the board sat at z 1.10 — INSIDE the drum (face at
// ~0.88); straps were offset off the drum axis and buried. Fixed by
// decode audit, never uploaded.
// Flame glyph = two burning tongues rising from a chamber mouth bar
// (source-true proportions from the mouth fire 0.4w×0.3h), bone faces
// both sides. tex-44 METAL V law: straps/arms/chains forge iron; board
// flat wood; faces bone. Static, no comps, no lights — the kiln's own
// mouth glow + interior-18's work lantern own the night read.
// Entity: nx-sign-kiln-001 at host-local (0, 2.45, 0.86), yaw = host.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const boneTex = texMat("sign_bone", [0xefeccf, 0xe2dfba], { rough: 0.9, scale: 2, weights: [3, 1] });
const FLAME = 0xd98026, FLAME_HOT = 0xf2b035, EMBER = 0xb8501e;

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

// Host drum axis is sign-local z −0.86 (anchor host z 0.86). Straps circle
// the AXIS, each radius sized to the drum taper at its height so the tube
// hugs the stone and stays visibly proud:
//   strap 0: host y 2.35, drum r 0.827 → torus r 0.860 (outer 0.888)
//   strap 1: host y 2.55, drum r 0.781 → torus r 0.813 (outer 0.841)
for (const [si, sy, sr] of [[0, -0.10, 0.860], [1, 0.10, 0.813]] as const) {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(sr, 0.028, 5, 16), ironTex);
    strap.name = `sg_strap_${si}`;
    strap.rotation.x = Math.PI / 2;
    strap.position.set(0, sy, -0.86);
    g.add(strap);
}
// --- PROJECTED ARMS: from inside the drum face out over the board ---
// Arms in the y-z plane at x ±0.24, sign-local z −0.225..0.575 (host
// 0.635..1.435): roots buried in stone (root dist from axis 0.679 <
// drum r 0.877 → clamped look), tips over the chain plane at 0.575.
for (const [ai, ax] of [[0, -0.24], [1, 0.24]] as const) {
    texBox(`sg_arm_${ai}`, 0.05, 0.05, 0.80, ax, -0.12, 0.175, ironTex);
    // chain law (waysign-1/2 defect class): three BIG alternating links,
    // radius 0.032, centers spaced 0.085 — visible air between links.
    ring(`sg_link_${ai}_0`, 0.032, 0.010, ax, -0.245, 0.575, false);
    ring(`sg_link_${ai}_1`, 0.032, 0.010, ax, -0.330, 0.575, true);
    ring(`sg_link_${ai}_2`, 0.032, 0.010, ax, -0.415, 0.575, false);
    ring(`sg_hook_${ai}`, 0.020, 0.008, ax, -0.435, 0.575, false);
}
// --- BOARD: hangs from the corner hooks at chain plane z 0.575 ---
// Host z 1.41..1.46 — past the sibling film (max z 1.27).
box(g, "sg_board", 0.5, 0.4, 0.05, 0, -0.65, 0.575, 0x7c6832);
// bone faces both sides (nvp-14 family law: blade signs are two-way)
texBox("sg_face", 0.42, 0.32, 0.04, 0, -0.65, 0.62, boneTex);
texBox("sg_face_back", 0.42, 0.32, 0.04, 0, -0.65, 0.53, boneTex);

// --- GLYPH: flame over chamber, both faces (2cm proud of each face) ---
// v4 (v3 zai-rejected: blocky upright lozenges read as posts/chimneys,
// not flames): each tongue is now a STEPPED TAPER leaning its own way —
// segments shrink and shift horizontally toward a flicked hot tip, the
// two tongues leaning OPPOSITE directions, hard flame→ember root boundary.
// v5 (R2-3, waysign-10 — improve-2 finding re-judged on exact live bytes:
// native 18m straight-on = "right at the legibility threshold", oblique 18m
// = tongue detail smears to a generic orange blotch; CONFIRMED. Root class
// = SCALE, same as R2-1/R2-2. DROPPED: "chains hairline" — iso3 shows
// individually resolvable links; the 18m dark-cap read is family far-LOD,
// identical on accepted dyer/smithy): glyph grows 46%→73% of face width,
// 72%→81% of face height — ONE DOMINANT tongue + short secondary, wide
// clear-bone notch between them (13–18% face width, the "one more pixel of
// separation" the 18m judge asked for), hot tip 0.032→0.055 wide, ember
// feet stacked (not coplanar — no z-fight). Bone lifted 0xe4e4c2→0xefeccf
// for the drum-shadow value crush (dyer v3b precedent: the 18m judge read
// the shadowed face as a "dark navy field"). Chamber deepened 0x3a352c →
// 0x26221a for glyph contrast. All edits inside the face envelope →
// x/z bbox unchanged, SAT-neutral re-place.)
const glyphZ = [0.655, 0.495];
for (const [fi, gz] of glyphZ.entries()) {
    box(g, `glyph_chamber_${fi}`, 0.34, 0.05, 0.02, 0, -0.785, gz, 0x26221a);
    // flame A — DOMINANT tongue, left of center, leaning RIGHT, flicked tip
    box(g, `glyph_a_ember_${fi}`, 0.15, 0.035, 0.02, -0.085, -0.7425, gz, EMBER);
    box(g, `glyph_a_seg1_${fi}`, 0.15, 0.075, 0.02, -0.085, -0.6875, gz, FLAME);
    box(g, `glyph_a_seg2_${fi}`, 0.115, 0.095, 0.02, -0.068, -0.6075, gz, FLAME);
    box(g, `glyph_a_tip_${fi}`, 0.055, 0.06, 0.02, -0.050, -0.53, gz, FLAME_HOT);
    // flame B — short secondary tongue, right of center, leaning LEFT
    box(g, `glyph_b_ember_${fi}`, 0.10, 0.03, 0.02, 0.095, -0.745, gz, EMBER);
    box(g, `glyph_b_seg1_${fi}`, 0.10, 0.058, 0.02, 0.095, -0.701, gz, FLAME);
    box(g, `glyph_b_tip_${fi}`, 0.048, 0.052, 0.02, 0.078, -0.646, gz, FLAME_HOT);
}

mergeByMaterial(g, "sgkiln");
writeFileSync("agents/arthur/assets/village_sign_kiln3.glb", toGLB(g));
console.log("village_sign_kiln3.glb —", g.children.length, "nodes");
