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
const boneTex = texMat("sign_bone", [0xe4e4c2, 0xd8d8b8], { rough: 0.9, scale: 2, weights: [3, 1] });
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

// --- GLYPH v5 (v1 merged; v2 hierarchy; v3 "!" mark; v4 zai-rejected:
// composed face-on pot parts illegible at distance — "magnifying glass"):
// HORIZONTAL layout on the board's strong axis, single-silhouette pot.
// LEFT: pot IN PROFILE — one LatheGeometry amphora (foot, round belly,
// shoulder, narrow neck, flared rim) — the heritage bakery-loaf idiom:
// a profile outline survives distance where composed parts merge.
// RIGHT: WHEEL RING (torus, hole reads as wheel) + small proud hub
// (hub ≤ 40% of ring outer dia so the hole stays open at mip range).
// Pot CLAY terracotta vs dark wheel — color splits the two symbols.
// Pot 0.16 tall / 0.11 wide at x −0.095; wheel outer dia 0.158 at
// x +0.105; horizontal gap 66mm. Face spans y 1.73..2.05, x −0.21..0.21.
// --- GLYPH v6 = ACCEPTED v5 + ZAI polish: scale +15% (distance
// legibility) and terracotta hue (the olive CLAY reads khaki on bone;
// 0xb96a45 is family-adjacent but unmistakably fired clay against cream).
// Pot half-width 0.063 at x −0.11 → left edge −0.173; wheel outer
// 0.181 at x +0.115 → right edge 0.206; 70mm glyph gap. Face x ±0.21.
const TERRA = 0xb96a45;
for (const [fi, gz] of [[0, 0.635], [1, 0.475]] as const) {
    // pot in profile — lathe amphora silhouette, one piece (×1.15)
    const prof = [
        [0.020, 0.000], [0.032, 0.010], [0.055, 0.055], [0.050, 0.100],
        [0.021, 0.135], [0.031, 0.152], [0.026, 0.160], [0.000, 0.160],
    ].map(([x, y]) => new THREE.Vector2(x * 1.15, y * 1.15));
    const pot = new THREE.Mesh(new THREE.LatheGeometry(prof, 12), mat(TERRA, 0.95, 0));
    pot.name = `glyph_pot_${fi}`;
    pot.position.set(-0.11, 1.795, gz);
    g.add(pot);
    // wheel — TORUS RING in xy plane (hole along z, reads face-on)
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 6, 18), mat(TIMBER_DARK, 0.9, 0));
    wheel.name = `glyph_wheel_${fi}`;
    wheel.position.set(0.115, 1.890, gz);
    g.add(wheel);
    // small proud hub — the axle
    disc(`glyph_hub_${fi}`, 0.014, 0.115, 1.890, gz, 0x3a352c, 0.030);
}

mergeByMaterial(g, "sgpot");
writeFileSync("agents/arthur/assets/village_sign_potter3.glb", toGLB(g));
console.log("village_sign_potter3.glb —", g.children.length, "nodes");
