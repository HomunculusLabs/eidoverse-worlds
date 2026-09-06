// mkv3-signs11.ts — new-era loop 11: TRADE SIGNS. Hanging pictogram signs
// for the bakery, smithy, weaver, livery: iron bracket + bone board + a
// raised glyph so trades read at a glance (as they did in era-2).
// Static geometry (no comps — nothing to wipe on re-place).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const BONE = 0xe4e4c2;
const IRON = 0x404044;

// tex-44 METAL V: the original four trade signs join the families —
// bracket plates, arms, and hanger chains take the forge iron (signs
// hang on smithed iron — the tex-43 law, now applied to the whole sign
// family: all five trades read on the same iron). The boards stay flat
// wood, the bone faces stay bone, the glyphs stay painted — material
// truth: signs speak in bone and paint; the glyph is the message, not
// the construction. (The livery horseshoe glyph is a drawn horseshoe,
// not a hung one — it stays flat too.)
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const boneTex = texMat("sign_bone", [BONE, 0xd8d8b8], { rough: 0.9, scale: 2, weights: [3, 1] });
const loafTex = texMat("sign_loaf", [0xdada70, 0xc4b85a], { rough: 0.8, scale: 2, weights: [3, 1] });
const handleTex = texMat("sign_handle", [0xa09832, 0x887c2a], { rough: 0.9, scale: 2, weights: [3, 1] });

const texBox = (g: THREE.Group, name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};

// signKit: bracket arm + hangers + board + glyph group builder
const signKit = (glyph: (g: THREE.Group) => void) => {
    const g = new THREE.Group();
    // bracket: plate on wall + arm out
    texBox(g, "sg_plate", 0.06, 0.3, 0.24, 0, 2.3, 0, ironTex);
    texBox(g, "sg_arm", 0.5, 0.05, 0.05, 0.26, 2.42, 0, ironTex);
    // hangers from arm
    for (const [hi, hx] of [[0, 0.36], [1, 0.52]] as const) {
        texBox(g, `sg_hang_${hi}`, 0.02, 0.16, 0.02, hx, 2.32, 0, ironTex);
    }
    // board hangs from the arm at y 2.1
    box(g, "sg_board", 0.5, 0.4, 0.05, 0.45, 2.05, 0, 0x7c6832);
    texBox(g, "sg_face", 0.42, 0.32, 0.04, 0.45, 2.05, 0.045, boneTex);
    glyph(g);
    return g;
};

// GLYPHS (raised on the face, z ~0.08):
// bakery v2 (waysign-14, R2-7 emblem-collapse fix): improve-2's finding
// CONFIRMED under native vision on exact live bytes 599194ee — gold loaf
// 0xdada70 on bone is a value collapse (ΔL≈3: hue differs, value barely),
// a ~10×6px yellow smudge at 18m; signKit's 0.02 hanger rods invisible,
// arm hairline. Dropped at source: bottom-left curved fragment + ridge
// tabs = HOST court geometry (west arch, roof cresting — polish-282);
// missing sign shadow = rig lighting (west wall faces away from sun).
// Fix = smithy v2 chassis EXACTLY (same court end wall, mirror placement,
// one visual family across the court's two signs): brace + alternating
// chain links + one dominant dark-on-pale glyph. The loaf stays the
// identity (heritage scored loaf) but goes DARK CRUST 0x5e4526 — a
// flattened lathe boule 0.30 wide (71% of the 0.42 face) with three BONE
// score slashes (inverse contrast: the scoring IS the bread signature).
// Self-contained build — signKit stays untouched so weaver/livery stay
// byte-identical.
{
    const g = new THREE.Group();
    // bracket: wall plate + arm + DIAGONAL BRACE (smithy v2 chassis)
    texBox(g, "sg_plate", 0.06, 0.3, 0.24, 0, 2.3, 0, ironTex);
    texBox(g, "sg_arm", 0.5, 0.06, 0.06, 0.26, 2.42, 0, ironTex);
    {
        // v6 (iso3 native catch, math-verified at decode): the v2 brace was
        // rotated ~85 deg off intent — long axis up-LEFT, BOTH ends in air
        // (top tip (0.16,2.55) 0.10m above the plate, bottom tip (0.38,2.07)
        // stabbing the board's top edge; it never touched plate or arm).
        // Correct forged triangle: rooted on the plate face (0.03,2.20),
        // rising under the arm mid-span (0.30,2.41) — clear of the link
        // stack (endpoint-to-link_0-center 0.094 > 0.065 reach). Envelope
        // y-max SHRINKS 2.561->2.45 (SAT-safe). NOTE: live smithy 62a8c7fc
        // carries the same v2 brace — own-domain re-open queued next tick.
        const brace = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.05), ironTex);
        brace.name = "sg_brace";
        brace.position.set(0.165, 2.305, 0);
        brace.rotation.z = Math.atan2(0.21, 0.27);
        g.add(brace);
    }
    // hangers: two alternating chain links per side (dyer idiom, waysign-2)
    for (const [hi, hx] of [[0, 0.34], [1, 0.5]] as const) {
        const l0 = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 5, 10), ironTex);
        l0.name = `sg_link_${hi}_0`; l0.position.set(hx, 2.325, 0);
        const l1 = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 5, 10), ironTex);
        l1.name = `sg_link_${hi}_1`; l1.position.set(hx, 2.258, 0); l1.rotation.y = Math.PI / 2;
        g.add(l0, l1);
    }
    // board hangs from the links, two-way bone faces (nvp-14/15 family law)
    box(g, "sg_board", 0.5, 0.4, 0.05, 0.45, 2.05, 0, 0x7c6832);
    texBox(g, "sg_face", 0.42, 0.32, 0.04, 0.45, 2.05, 0.045, boneTex);
    texBox(g, "sg_face_back", 0.42, 0.32, 0.04, 0.45, 2.05, -0.045, boneTex);
    // v2 glyph — DARK boule + bone scores, mirrored on both faces.
    // Lathe profile = single-silhouette law (potter amphora precedent):
    // flat base, round belly, domed crown; flattened in z to a relief.
    // v3 (ZAI iso catch): crust warmed 0x5e4526 -> 0x7d5024 (v2 read
    // "near-black rock/coal" at 3m — a loaf must be BROWN, not merely
    // dark); lathe 14 -> 20 segments + symmetric dome profile (kills the
    // lumpy amoeba silhouette); slashes spread wider and set mid-crown
    // (v2's top-centered cluster read turtle-back).
    const CRUST = 0x7d5024;
    const loafGeo = () => {
        // v4 (native 10m gate): emblem +20% (0.30 -> 0.36 wide = 86% of
        // face, potter v7 board-filling precedent) — the dome-with-flat-
        // base silhouette needs the pixels; margins stay clear 0.03/0.05.
        const prof = [
            // v5 (native sign-off notes): flat bottom chord lengthened
            // (0.075->0.150 nearly level = longer, straighter base) —
            // the dome-with-flat-base silhouette the 10m judge asked for.
            [0.075, 0.000], [0.150, 0.006], [0.180, 0.048], [0.178, 0.098],
            [0.142, 0.152], [0.074, 0.192], [0.000, 0.206],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), mat(CRUST, 0.95, 0));
        m.scale.set(1, 1, 0.34);
        return m;
    };
    for (const [fi, fz] of [[0, 0.098], [1, -0.098]] as const) {
        const loaf = loafGeo();
        loaf.name = `glyph_loaf_${fi}`;
        loaf.position.set(0.45, 1.955, fz);
        g.add(loaf);
        // proud diagonal slashes, fixed z just clear of the belly front
        // (belly front 0.149; slash back plane 0.150 — 5mm proud at center,
        // corners clear 3-9mm: frontal sign convention, invisible at 8m).
        // DIAGONAL: bread scoring is slashed "///" — also kills the
        // horizontal "≡ text dashes" 18m misread the baseline had.
        // v3: spread wider (±0.058 -> ±0.068) and dropped to mid-crown
        // (y 2.045 -> 2.020) per the ZAI turtle-back note.
        // v4 (native 10m gate): slashes bold — 0.016 -> 0.022 thick,
        // 0.11 -> 0.12 long ("boldness beats realism on a trade sign"),
        // re-centered on the v4 loaf's mid-crown y 2.035.
        // v5: bolder still — 0.022 -> 0.028 thick (= 7.8% of the 0.36
        // loaf width, inside the judge's 8-10% band), length 0.13.
        for (const sx of [-0.060, 0, 0.060]) {
            const slash = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.028, 0.014), boneTex);
            slash.name = `glyph_score_${fi}_${sx}`;
            slash.position.set(0.45 + sx, 2.035, fz + (fi === 0 ? 0.070 : -0.070));
            slash.rotation.z = Math.PI / 5;
            g.add(slash);
        }
    }
    mergeByMaterial(g, "sgb");
    writeFileSync("agents/arthur/assets/village_sign_bakery.glb", toGLB(g));
    console.log("village_sign_bakery.glb —", g.children.length, "nodes");
}
// smithy v2 (waysign-8, R2-1 emblem-collapse fix): improve-2's 18m finding
// CONFIRMED under native vision on exact live bytes d8df9400 — glyph ~20% of
// face read as a dark smudge, hanger rods hairline. Two sub-findings dropped
// at source: the "horseshoe" was the smudge talking (glyph is a HAMMER —
// heritage identity kept; the horseshoe belongs to livery), and the "stray
// detached fragment" was sg_plate, the wall plate, flush-mounted on the
// court's end wall in situ (polish-282 isolated-render artifact).
// Fix class per the accepted fleet (nx-sign-stable-001 = CLEAN at 18m):
// emblem ≥ ~2/3 of face + substantial iron silhouette. Self-contained build
// — signKit stays untouched so bakery/weaver/livery stay byte-identical.
{
    const g = new THREE.Group();
    // bracket: wall plate + arm + DIAGONAL BRACE — a triangle reads as a
    // forged bracket at distance; sticks read as hairlines
    texBox(g, "sg_plate", 0.06, 0.3, 0.24, 0, 2.3, 0, ironTex);
    texBox(g, "sg_arm", 0.5, 0.06, 0.06, 0.26, 2.42, 0, ironTex);
    {
        // v3 (waysign-16, bakery v6 fix applied to the same chassis): the
        // v2 brace was rotated ~85 deg off intent — long axis up-LEFT, BOTH
        // ends in air (top tip (0.16,2.55) floating 0.10m above the arm,
        // bottom tip (0.38,2.07) stabbing the board's top edge; never
        // touched plate or arm). Caught on bakery's iso3 native view
        // (waysign-15), math-verified at decode — the smithy v2 chassis
        // was the clone source, so it carries the identical defect.
        // Correct forged triangle: rooted on the plate face (0.03,2.20),
        // rising under the arm mid-span (0.30,2.41) — clear of the link
        // stack. Envelope y-max SHRINKS 2.561->2.45 (SAT-safe).
        const brace = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.05), ironTex);
        brace.name = "sg_brace";
        brace.position.set(0.165, 2.305, 0);
        brace.rotation.z = Math.atan2(0.21, 0.27);
        g.add(brace);
    }
    // hangers: two alternating chain links per side (dyer idiom, waysign-2)
    // replacing the 0.02 hairline rods; the lower link hooks the board's
    // top edge like the dyer corner hooks
    for (const [hi, hx] of [[0, 0.34], [1, 0.5]] as const) {
        const l0 = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 5, 10), ironTex);
        l0.name = `sg_link_${hi}_0`; l0.position.set(hx, 2.325, 0);
        const l1 = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 5, 10), ironTex);
        l1.name = `sg_link_${hi}_1`; l1.position.set(hx, 2.258, 0); l1.rotation.y = Math.PI / 2;
        g.add(l0, l1);
    }
    // board hangs from the links, two-way bone faces (nvp-14/15 family law)
    box(g, "sg_board", 0.5, 0.4, 0.05, 0.45, 2.05, 0, 0x7c6832);
    texBox(g, "sg_face", 0.42, 0.32, 0.04, 0.45, 2.05, 0.045, boneTex);
    texBox(g, "sg_face_back", 0.42, 0.32, 0.04, 0.45, 2.05, -0.045, boneTex);
    // v2 glyph — BIG hammer, dark-on-pale family law: iron head 0.30 wide
    // (71% of the 0.42 face), brass-wood handle; mirrored on both faces
    texBox(g, "glyph_hhead", 0.3, 0.11, 0.045, 0.45, 2.14, 0.08, ironTex);
    texBox(g, "glyph_hhandle", 0.055, 0.17, 0.045, 0.45, 2.0, 0.08, handleTex);
    texBox(g, "glyph_hhead_back", 0.3, 0.11, 0.045, 0.45, 2.14, -0.08, ironTex);
    texBox(g, "glyph_hhandle_back", 0.055, 0.17, 0.045, 0.45, 2.0, -0.08, handleTex);
    mergeByMaterial(g, "sgs");
    writeFileSync("agents/arthur/assets/village_sign_smithy.glb", toGLB(g));
    console.log("village_sign_smithy.glb —", g.children.length, "nodes");
}
// weaver: spool (thread cylinder + flanges)
{
    const g = signKit((g2) => {
        const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.13, 8), mat(0xa09832, 0.85, 0));
        spool.name = "glyph_spool";
        spool.rotation.x = Math.PI / 2;
        spool.position.set(0.45, 2.05, 0.08);
        g2.add(spool);
        for (const fy of [2.0, 2.1]) {
            const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), mat(0x7c6832, 0.9, 0));
            fl.name = `glyph_flange_${fy}`;
            fl.rotation.x = Math.PI / 2;
            fl.position.set(0.45, fy, 0.08);
            g2.add(fl);
        }
    });
    mergeByMaterial(g, "sgw");
    writeFileSync("agents/arthur/assets/village_sign_weaver.glb", toGLB(g));
    console.log("village_sign_weaver.glb —", g.children.length, "nodes");
}
// livery: horseshoe (open torus)
{
    const g = signKit((g2) => {
        const shoe = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 5, 10, Math.PI * 1.5), mat(IRON, 0.4, 0.5));
        shoe.name = "glyph_shoe";
        shoe.position.set(0.45, 2.06, 0.08);
        shoe.rotation.z = Math.PI * 0.75;
        g2.add(shoe);
    });
    mergeByMaterial(g, "sgl");
    writeFileSync("agents/arthur/assets/village_sign_livery.glb", toGLB(g));
    console.log("village_sign_livery.glb —", g.children.length, "nodes");
}
