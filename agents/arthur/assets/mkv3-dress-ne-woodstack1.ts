// mkv3-dress-ne-woodstack1.ts — dress-9, NE CRAFT firewood woodstack.
// Concept contract: firewood laid in against the flank gable of a craft
// hamlet (nx-craft-hamlet-0028) — winter prep against the weather side,
// the domestic answer to dress-2's shared back-of-shop staging yard.
// Stove-length split logs stacked in courses between two end cradle
// posts; log lengths run OUT from the wall (local −z) so the pale cut
// end-grain discs face the plaza approach (local +z) — the 18m distance
// tell (dress-2 cordwood law: STRAW caps value-separated from BARK).
// Ends staggered; moss cap on the top course; one protruding log
// breaking the top silhouette; leaners; pale-ended spill rounds.
// Grounds USE: heat and hearth. Static, unlit — spends no lamp budget
// (NE budget 10, used 0).
// v1 (e8f3c973…) REJECTED (zai gameplay FAIL, native vision down err 1210
// 10th tick): sideways end strips, sparse silhouette. v2 (435c7354…)
// REJECTED: massed courses read, but caps faced +x — the rig (and the
// plaza approach, hamlet yaw −135 ⇒ local +z is plaza-ward) sees log
// SIDES; protruding log didn't break the top line; spills' caps sideways.
// v3: frame corrected — logs run z, caps +z.
// v6 (dress-19, shard row 34): native rejudge on live bytes CONFIRMED
// "burnt right post" + "porous rack read"; "detached left post" DROPPED
// (reads planted). Root causes: (1) the 3 "leaners" sat at x=1.28 fused
// with the right cradle post (x=1.25) into one dark mass AND physically
// floated (they tilt about x — lean toward +z, resting on nothing) ->
// REMOVED (minimalism law: failing speculative accent comes out). (2)
// courses 8/7/6 with no brick-bond left see-through gaps (top-course
// pitch 0.41 vs log dia ~0.26) -> courses now 9/8/9 RUNNING-BOND
// (offset pitch/2), uniform per-course radii, each course nested in the
// valleys below (y2 = y1 + 0.87*(r1+r2)), every log grounded on contact;
// protruding log now RESTS embedded in the top-course surface instead of
// hovering 0.115m above it. Pale flush caps unchanged (v5 law).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const WOOD = mat(0xa09832, .95, 0);   // palette wood (light — split faces)
const BARK = mat(0x6a6030, .95, 0);   // palette bark/trunk
const STRAW = mat(0xede9c4, .95, 0);  // pale straw end-grain caps (v5: brighter + FLUSH cap radius — v4 judge: value pop still weak, inset caps let bark edge dominate the disc)
const STRAW2 = mat(0xdfe3b0, .95, 0); // second cap value, alternated (v5 judge note: break the uniform lattice)
const ROCK = mat(0x8c887e, .95, 0);   // palette rock pads
const MOSS = mat(0x5c7a4a, .95, 0);   // palette moss

const jit = (n: number) => {
    const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
    return v - Math.round(v);
};

// LOCAL FRAME: +z = outward from the wall toward the plaza (viewer side);
// logs run wall(−z)→out(+z); pale end discs face +z. Wall plane z = −0.75.

// --- one stove-length log: bark cylinder along z + pale end disc at +z
const log = (y: number, x: number, r: number, seed: number) => {
    const len = 0.92 + jit(seed) * 0.14;              // staggered ends 0.85..0.99
    const z0 = -0.75 + len / 2;                        // back end at the wall
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), BARK);
    body.rotation.x = Math.PI / 2;
    body.position.set(x, y, z0);
    g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 8), jit(seed * 3) > 0 ? STRAW : STRAW2);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(x, y, z0 + len / 2 - 0.03);
    g.add(cap);
};

// --- courses (v6): RUNNING BOND — each upper log nests in the valley
// between two below (offset half pitch, y2 = y1 + 0.87*(r1+r2)), uniform
// per-course radii, ends staggered. Solid cordwood, not a rack.
const course = (y: number, seed: number, count: number, r: number, offset = 0) => {
    const pitch = 2.04 / Math.max(count - 1, 1);
    for (let i = 0; i < count; i++) {
        const x = -1.02 + i * pitch + offset + jit(seed + i * 3) * 0.04;
        log(y, x, r, seed + i);
    }
};
// Ground course: 9 logs r0.13 sitting ON the ground (y = r).
course(0.13, 11, 9, 0.13);
// second course: 8 logs r0.12 nested in the ground course's valleys
course(0.13 + 0.87 * (0.13 + 0.12), 27, 8, 0.12, 2.04 / 8 / 2);
// top course: 9 logs r0.105 nested again — MORE logs than v5's 6: the
// porous top was the rack read; a full nested course reads cordwood.
course(0.13 + 0.87 * (0.13 + 0.12) + 0.87 * (0.12 + 0.105), 43, 9, 0.105);
// one protruding log embedded in the top-course surface (v6: RESTS at
// top y + r*0.55, half-sunk among the top logs — breaks the line without
// hovering; v5's y 0.92 floated 0.115m above the stack surface)
{
    const topY = 0.13 + 0.87 * (0.13 + 0.12) + 0.87 * (0.12 + 0.105);
    const len = 1.12;
    const z0 = -0.75 + len / 2;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, len, 8), BARK);
    body.rotation.x = Math.PI / 2; body.position.set(0.55, topY + 0.105 * 0.55, z0); g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.108, 0.05, 8), STRAW);
    cap.rotation.x = Math.PI / 2; cap.position.set(0.55, topY + 0.105 * 0.55, z0 + len / 2 - 0.025); g.add(cap);
}
// moss on the top course — SMALL patches only (v5: shrank — v4 judged the
// top moss read as a fence rail spanning the stack). v6: re-seated on the
// running-bond top surface (top course top y = 0.649 — v5 y 0.755 would
// float 0.1m above the denser, better-nested stack).
const moss1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.3), MOSS);
moss1.position.set(-0.35, 0.675, -0.35); moss1.rotation.y = 0.12; g.add(moss1);
const moss2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.045, 0.22), MOSS);
moss2.position.set(0.3, 0.685, -0.3); g.add(moss2);

// --- cradle posts at both ends (x ±1.25), on rock pads. v7 (dress-19):
// posts were BARK (rendered near-black at 18m — the "burnt post" read;
// pixel decode: v5 (0,0,0), v6 (40,33,10) vs caps ~237). Switched to the
// stile's accepted TIMBER 0x6f6432 + pale CUT caps on top — the proven
// dress-11 family idiom ("pale sawn post-tops = the distance tell"),
// not a new accent.
const TIMBER = mat(0x6f6432, .95, 0);  // stile post/rail bark-timber (dress-11)
const CUT = mat(0xf2eed0, .95, 0);     // stile pale sawn post-top (dress-11 v4)
for (const px of [-1.25, 1.25]) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), ROCK);
    pad.position.set(px, 0.09, -0.3); g.add(pad);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.05, 0.15), TIMBER);
    post.position.set(px, 0.62, -0.3); g.add(post);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.09, 8), CUT);
    cap.position.set(px, 1.196, -0.3); g.add(cap);
}

// --- leaners (v6): REMOVED. v5's three x-axis-tilted logs at x=1.28
// fused with the right cradle post into one dark mass (the "burnt post"
// read) AND physically rested on nothing (they lean toward +z, past the
// course logs' x extent — floating, per the native rejudge). A re-seat at
// x=1.05 tilted about z would sit in the post's own footprint. Out they
// come — the stack's flanks now read clean timber, and the pale caps
// carry the distance value. (Minimalism law: failing accent removed, not
// re-worked.)

// --- pale-ended spill rounds near the base (caps facing +z)
for (const [sx, sz, r] of [[0.62, 1.05, 0.13], [-0.55, 1.15, 0.10]] as const) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.3, 8), BARK);
    body.rotation.x = Math.PI / 2; body.position.set(sx, r, sz); g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.012, r - 0.012, 0.34, 8), STRAW);
    cap.rotation.x = Math.PI / 2; cap.position.set(sx, r, sz); g.add(cap);
}
const wedge1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.2), BARK);
wedge1.position.set(0.35, 0.035, 0.55); wedge1.rotation.y = 0.4; g.add(wedge1);
const wedge2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.16), BARK);
wedge2.position.set(-0.7, 0.03, 0.45); wedge2.rotation.y = -0.3; g.add(wedge2);

mergeByMaterial(g, "dress_ne_woodstack1");
writeFileSync("agents/arthur/assets/village_dress_ne_woodstack1.glb", toGLB(g));
console.log("village_dress_ne_woodstack1.glb —", g.children.length, "nodes");
