// mkv3-dress-sw-bellpost1.ts — dress-85, SW CONTEMPLATIVE silent bell post
// (round-3 item 16). Concept contract: marks the bend where the SW
// devotional line turns from the raked gravel corridor (az 233) toward the
// labyrinth (az 255) — past the gravel's far end, OUTSIDE the turn: the
// walker rounds the bend and the bronze bell hangs at their right shoulder.
// SILENT by design: no chime comp, no motion (Bill owns sound).
// One aged hardwood post (sawn pale top = the lane's worked-pale distance
// tell, stile/prayer family), hand-forged iron bracket + knee brace, cast
// bronze chapel bell hung BELOW the arm with clear air gap (the negative
// space is what reads "hanging" at 18m), wooden striker mallet leaning on a
// front peg (ends on the post face, not the ground — kills the guy-wire
// read), pale pull-rope to a cleat with a knotted tail, worn dust tread at
// the foot. Static, unlit, no comps, no lamp spend (SW budget 3, used 0).
// Site: (−44.6, −68.8) yaw −24.7° (local +z faces the bend apex/walker).
// v2 arc: v1 587e6b59 native 18m FAIL (0.19m bell = 11px sub-perceptual,
// zero warm pixels, guy-wire read) → v2: chapel-scale bell (mouth r 0.21,
// ~21px), bright gold-bronze albedo, long thick arm with hang gap, brighter
// sawn cap, paler tread.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();

// material families (standing values; v2 accents per judge prescription)
const TIMBER = mat(0x5a452f, 0.85, 0);      // aged hardwood post / mallet head
const SAWN = mat(0xd6d2c2, 0.9, 0);         // pale sawn top (v3 desaturated — the bell owns the warm vote)
const IRON = mat(0x4a4a50, 0.5, 0.15);      // bracket / knee / hook / nails (incense precedent)
const BRONZE = mat(0xd9a441, 0.32, 0.65);   // cast bell — v3 bright gold, wins the 18m warm vote
const ROPE = mat(0xcfc3a3, 0.95, 0);        // pull-cord + pale hang thong (v3)
const SOIL = mat(0x6b6353, 0.98, 0);        // worn dust tread
// v3: faint same-hue emissive on the bell — polish-273 "must-stay-readable"
// law; MESH emissive only, no light anchor, no comp, zero lamp-spend draw
// (dress-79 censer precedent). Day: wins the warm contest; night: one
// quiet warm point, never a lamp.
(BRONZE as any).emissive = new THREE.Color(0x8a5a1a);
(BRONZE as any).emissiveIntensity = 0.22;

// deterministic jitter (splitmix-style trig hash, no Math.random)
const jit = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;

// ---- the post: 0.15 square aged hardwood, 2.05 tall, slight hand-set lean ----
{
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.05, 0.15), TIMBER);
    post.position.set(0, 1.025, 0);
    post.rotation.z = 0.026; // ~1.5deg lean — hand-set, not machined
    post.rotation.x = jit(7) * 0.02;
    g.add(post);
    // base flare plinth (foot stability at silhouette level)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.24), TIMBER);
    plinth.position.set(0, 0.08, 0);
    plinth.rotation.y = jit(9) * 0.2;
    g.add(plinth);
    // pale sawn top cap — the worked-tell (v2 bright)
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.152, 0.024, 0.152), SAWN);
    cap.position.set(0 - 0.026 * 2.05, 2.062, 0 + jit(7) * 0.02 * 2.05 * 0.4);
    cap.rotation.z = 0.026;
    g.add(cap);
    // two forged nail studs on the bracket face
    for (let i = 0; i < 2; i++) {
        const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 6), IRON);
        nail.rotation.x = Math.PI / 2;
        nail.position.set(0, 1.68 + i * 0.26, 0.082);
        g.add(nail);
    }
}

// ---- hand-forged bracket: long thick arm + knee brace + hook ring ----
{
    // v2: LONGER (0.66 out), THICKER cantilever — the air gap between arm
    // underside and bell crown is the "hanging" read at 18m
    // v3: FLAT arm (zero down-angle) — the bell hangs in open contrast,
    // clear of the post's shadow mass (judge prescription)
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.075, 0.66), IRON);
    arm.position.set(0, 1.86, 0.34);
    arm.rotation.x = 0.0;
    g.add(arm);
    // diagonal knee from post to arm mid
    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 0.38), IRON);
    knee.position.set(0, 1.70, 0.22);
    knee.rotation.x = Math.PI / 4 + 0.08;
    g.add(knee);
    // hanging hook ring at the arm end
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.014, 8, 14), IRON);
    hook.position.set(0, 1.80, 0.65);
    g.add(hook);
    // cleat on the post face (rope belays here)
    const cleat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.05), IRON);
    cleat.position.set(0.045, 1.12, 0.082);
    g.add(cleat);
}

// ---- the bell: cast bronze chapel bell, hung with air gap below the arm ----
{
    // v4 SELF-CATCH (ZAI pixel read, confirmed by geometry): the v2/v3
    // lathe profile ran crown->mouth with INCREASING local y, so the mouth
    // (r 0.21) landed ABOVE the post top — an inverted "shade cone" reading
    // as a lamp head. Correct orientation: MOUTH at local y 0 (bottom),
    // CROWN at local y 0.42 (top); position.y = 1.29 puts the mouth at
    // 1.29 and crown at 1.71 — hanging BELOW the arm (1.86) with the pale
    // thong bridging the gap. Lathe points ordered bottom->top = outward
    // normals (canonical vase ordering).
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0.210, 0.000));  // mouth rim (bottom, wide)
    pts.push(new THREE.Vector2(0.180, 0.070));  // flare
    pts.push(new THREE.Vector2(0.135, 0.190));  // lower bowl
    pts.push(new THREE.Vector2(0.098, 0.320));  // waist
    pts.push(new THREE.Vector2(0.075, 0.390));  // shoulder
    pts.push(new THREE.Vector2(0.035, 0.420));  // crown top (narrow)
    const bell = new THREE.Mesh(new THREE.LatheGeometry(pts, 20), BRONZE);
    bell.position.set(0, 1.29, 0.65);
    g.add(bell);
    // mouth rim band (at the mouth plane)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.210, 0.014, 8, 22), BRONZE);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 1.30, 0.65);
    g.add(rim);
    // crown loop through the hook
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.011, 8, 12), IRON);
    crown.position.set(0, 1.735, 0.65);
    g.add(crown);
    // v3: pale ROPE thong — the bright vertical hang-line articulates the
    // air gap between arm and bell crown
    const thong = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 8), ROPE);
    thong.position.set(0, 1.785, 0.65);
    g.add(thong);
    // clapper ball, hanging just inside the mouth
    const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), IRON);
    clapper.position.set(0, 1.26, 0.65);
    g.add(clapper);
}

// ---- striker mallet: front peg + head, handle leaning ONTO the post face ----
{
    // v2: peg on the front (+z) face; the handle ends at the post, never the
    // ground — no guy-wire diagonal
    const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.18, 8), IRON);
    peg.rotation.x = Math.PI / 2;
    peg.position.set(-0.12, 0.92, 0.11);
    g.add(peg);
    // mallet head lying across the peg (axis along x)
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.20, 10), TIMBER);
    head.rotation.z = Math.PI / 2 + 0.05;
    head.position.set(-0.15, 0.99, 0.10);
    g.add(head);
    // handle from the head up to the post face at chest height
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.92, 8), TIMBER);
    handle.position.set(-0.23, 1.42, 0.12);
    handle.rotation.z = -0.38;
    handle.rotation.x = -0.10;
    g.add(handle);
}

// ---- pull-rope: pale cord from bell height down the post to the cleat ----
{
    // v2: thicker + straighter along the post face; slack tail at the cleat
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.42, 6), ROPE);
    cord.position.set(0.062, 1.46, 0.095);
    cord.rotation.z = 0.06;
    cord.rotation.x = -0.16;
    g.add(cord);
    // rope tail hanging off the cleat with a small knot
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.013, 0.15, 6), ROPE);
    tail.position.set(0.072, 0.98, 0.10);
    tail.rotation.z = 0.18;
    g.add(tail);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), ROPE);
    knot.position.set(0.078, 0.90, 0.103);
    g.add(knot);
}

// ---- ground: worn dust tread + a few pale gravel scatter chips ----
{
    const tread = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.55, 0.012, 20), SOIL);
    tread.position.set(jit(51) * 0.05, 0.006, 0.06 + jit(53) * 0.05);
    g.add(tread);
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + jit(61 + i * 3) * 0.9;
        const rr = 0.42 + jit(67 + i * 3) * 0.22;
        const chip = new THREE.Mesh(new THREE.DodecahedronGeometry(0.030 + jit(71 + i) * 0.018, 1), ROPE);
        chip.scale.y = 0.45;
        chip.position.set(Math.cos(a) * rr + jit(51) * 0.05, 0.016, Math.sin(a) * rr + 0.06);
        chip.rotation.set(jit(73 + i) * 0.5, jit(77 + i) * 3.1, jit(79 + i) * 0.4);
        g.add(chip);
    }
}

mergeByMaterial(g, "dress_sw_bellpost1");
writeFileSync("agents/arthur/assets/village_dress_sw_bellpost1.glb", toGLB(g));
console.log("village_dress_sw_bellpost1.glb —", g.children.length, "top-level nodes");
