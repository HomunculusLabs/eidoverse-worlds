// mkv3-sign-potter.ts — waysign-4: POTTER SIGN for nx-town-potter.
// Host decode (mkv3-potter41.ts; live lib dad7c82e… = local sha this tick,
// verified): THE POTTER'S STAND is an OPEN WORK STAND, not a walled
// building — kick-wheel (flywheel r0.45 y0.28 + head r0.16 y0.85 + pot
// mid-throw), water bucket, clay wedge, drying rack, glaze bench. Max
// height 1.015m; NO wall, NO eave → the hanging-bracket idiom (stable/
// dyer) has nothing to hang from. Honest adaptation: PLANTED-POST idiom
// (open-yard law) — a forge-iron post beside the stand's +z work apron,
// bracket arm projecting plaza-ward, board hanging on chains.
// Road face: host-local +z is the plaza-facing front (host yaw −2.5835 →
// local +z world dir (−0.530,−0.848), straight at the plaza). Post sits
// at host-local [1.5, 0, 3.1] — RESITED from [1.9,0,0.55]: sibling
// nx-artwalk-b3-ruled-porch is a pavilion over the stand (envelope z ≤
// 2.424); the sign stands between its two +z posts, outside the pavilion
// on the plaza-approach side, clear of every host solid by 2.4m, on the
// OPPOSITE side from the kiln sign (host-local x ≈ −4.9).
// Glyph = the host's OWN wheel, face-on (source-true): pot on the head,
// head disc, stem, big flywheel disc — readable as "potter's wheel" at
// 8m where a generic cartwheel is not. Both faces (nvp-14 two-way law).
// tex-44 METAL V law: post/arm/tip/chains forge iron; board flat wood;
// faces bone. Static, no comps, no lights — nx-town-potter-l (y 1.4,
// ~0.7m from the post) owns the night read.
// Entity: nx-sign-potter-001 at host-local (1.9, 0, 0.55), yaw = host.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
// v7 (waysign-13 R2-6): bone LIFTED 0xe4e4c2 -> 0xefeccf — pixel decode of
// the 18m render showed the face shadow-crushed to mid-tone under the b3
// pavilion (kiln ecbad903 precedent, drum/eave value crush).
const boneTex = texMat("sign_bone", [0xefeccf, 0xe0e0c0], { rough: 0.9, scale: 2, weights: [3, 1] });
const TIMBER_DARK = 0x4a4632, CLAY = 0xbaae60, WARE = 0xdada70;

const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
};
const ring = (name: string, r: number, t: number, x: number, y: number, z: number, rotY: boolean) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 5, 12), ironTex);
    m.name = name;
    m.position.set(x, y, z);
    if (rotY) m.rotation.y = Math.PI / 2;
    g.add(m);
};
// flat disc whose face points ±z (glyph circles), 2cm thick (or override)
const disc = (name: string, r: number, x: number, y: number, z: number, color: number, thick = 0.02) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, thick, 16), mat(color, 0.9, 0));
    m.name = name;
    m.rotation.x = Math.PI / 2;
    m.position.set(x, y, z);
    g.add(m);
};

// --- POST: planted, forge iron, footed ---
texBox("sp_post", 0.08, 2.42, 0.08, 0, 1.21, 0, ironTex);
// foot plate (visible planting, reads as set-in-ground)
texBox("sp_foot", 0.26, 0.06, 0.26, 0, 0.03, 0, ironTex);
// --- BRACKET ARM: projects plaza-ward (+z) from post head ---
texBox("sp_arm", 0.06, 0.06, 0.58, 0, 2.42, 0.29, ironTex);
// T-tip crossbar the chains hang from
texBox("sp_tip", 0.52, 0.05, 0.05, 0, 2.42, 0.555, ironTex);
// small diagonal brace (post→arm, reads as smith work)
texBox("sp_brace", 0.05, 0.05, 0.42, 0, 2.24, 0.16, ironTex).rotation.x = -0.75;

// --- CHAINS: three BIG alternating links per side (waysign-1/2 law),
// drop from tip ends (x ±0.215) to board corners — v2 lengthened drop
// (0.33m tip→board) so the hang reads (v1 zai: board sat under bracket) ---
for (const [ci, cx] of [[0, 0.215], [1, -0.215]] as const) {
    ring(`sp_link_${ci}_0`, 0.032, 0.010, cx, 2.375, 0.555, false);
    ring(`sp_link_${ci}_1`, 0.032, 0.010, cx, 2.285, 0.555, true);
    ring(`sp_link_${ci}_2`, 0.032, 0.010, cx, 2.195, 0.555, false);
    ring(`sp_hook_${ci}`, 0.020, 0.008, cx, 2.140, 0.555, false);
}

// --- BOARD: hangs from the hooks, plane normal +z (faces the plaza) ---
box(g, "sp_board", 0.5, 0.4, 0.05, 0, 1.89, 0.555, 0x7c6832);
// bone faces both sides (two-way law)
texBox("sp_face", 0.42, 0.32, 0.04, 0, 1.89, 0.600, boneTex);
texBox("sp_face_back", 0.42, 0.32, 0.04, 0, 1.89, 0.510, boneTex);

// --- GLYPH v7 (waysign-13, R2-6 emblem-collapse fix; R2 family root
// class = SCALE, kiln/dyer precedent): v5/v6 two-glyph layout merged to
// one dark cluster at 18m (pixel decode: pot 4px, wheel 6px, gap 6px,
// terracotta unresolvable). ONE DOMINANT GLYPH law (kiln v5): the pot,
// BOLD and board-filling — lathe amphora with exaggerated wide belly /
// narrow neck / flared hollow rim (0.26 tall, 0.20 wide terracotta), its
// foot standing ON the potter's wheel: a wide dark timber bar (0.30 x
// 0.045, the wheel head in profile) directly beneath. Stacked + touching,
// two colors, orthogonal extents — cannot merge into one ambiguous mark;
// reads "vessel on a wheel" = POTTER at 8m and holds a silhouette at 18m.
// Terracotta 0xb96a45 on lifted bone = measured ΔL≈-80 family contrast.
// Face spans y 1.73..2.05, x -0.21..0.21 — glyph fills ~71% width, ~98%
// height.
const TERRA = 0xb96a45;
for (const [fi, gz] of [[0, 0.635], [1, 0.475]] as const) {
    // potter's wheel head — wide dark bar in profile, glyph base
    texBox(`glyph_wheel_${fi}`, 0.30, 0.045, 0.05, 0, 1.7675, gz, mat(TIMBER_DARK, 0.9, 0));
    // pot in profile — bold lathe amphora, foot standing on the wheel bar
    const prof = [
        [0.040, 0.000], [0.055, 0.012], [0.100, 0.070], [0.100, 0.125],
        [0.060, 0.180], [0.042, 0.210], [0.048, 0.232], [0.062, 0.246], [0.062, 0.262],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const pot = new THREE.Mesh(new THREE.LatheGeometry(prof, 14), mat(TERRA, 0.95, 0));
    pot.name = `glyph_pot_${fi}`;
    pot.position.set(0, 1.79, gz);
    g.add(pot);
}

mergeByMaterial(g, "sgpot");
writeFileSync("agents/arthur/assets/village_sign_potter3.glb", toGLB(g));
console.log("village_sign_potter3.glb —", g.children.length, "nodes");
