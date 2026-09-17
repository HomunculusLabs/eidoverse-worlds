// mkv3-ducks26.ts — fauna loop 3: THE POND DUCKS (new species, FAUNA-PLAN
// queue item 2). Bill keeps ducks; the reedpool has no life on its water.
//
// A mallard pair as ONE rider entity (nx-dress-ducks-001) floating on the
// reedpool's open W lobe — concentric with the host (struct-19 precedent:
// the commission is literally "on the existing water"), seated at the
// source-decoded water plane (mkv3-reedpool.ts: water disc top at
// host-local y 0.14), never touching the host entity itself.
//
// Species law (18m identity): the pair reads as waterfowl by silhouette —
// low hulls on the water, upright necks, white collar + green head on the
// drake (THE mallard flag), mottled brown duck with the indigo speculum.
// Waterfowl take species-true colors (tex-23 freed the animals).
// Water is GEOMETRY: ripple rings are thin flat discs in the water palette
// family, never particles. Construction of the rider adds no furniture —
// the pool IS the furniture (host language preserved).
//
// Anchors (KEEP(duck_) already in mergekit): duck_a (drake group),
// duck_a_head (origin = neck base at the breast), duck_a_tail (origin =
// rump base), duck_b, duck_b_head, duck_b_tail — 6 motion targets.
// Motion lives in the placer (fauna3-place-ducks.ts): drake = ripple bob
// (part bob, engine motion.js evalPart case 'bob'), dabble neck pendulum,
// tail flick; duck = slow swim circle (part orbit, evalPart case 'orbit'
// — center in the entity root frame, face travel), deeper dabble pendulum,
// tail flick. Phases staggered; explicit epoch t0.
//
// Waterline discipline: every duck group origin sits ON the entity-frame
// waterline (local y 0.02); keels reach 15mm BELOW it (a floating body
// breaks the surface — the hens-floating law, applied to water); ripple
// rings ride 4-7mm proud of the waterline. Entity PY = water top - 0.02.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const WL = 0.02; // entity-frame waterline (group origins sit here)

// ripple rings — water palette family (polish-271 lineage), flat geometry
const RIPPLE = mat(0x5d7d8c, 0.3, 0.4);
const ripple = (x: number, z: number, r: number) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 5, 22), RIPPLE);
    ring.name = `ripple_${x}_${z}`;
    ring.rotation.x = Math.PI / 2;
    ring.scale.set(1, 1, 0.55); // flatten to an ellipse along z (wake shape)
    ring.position.set(x, WL + 0.006, z);
    g.add(ring);
};

// ---- one duck ----
// pose: "up" = neck up scanning (rest), "dabble" = neck forward-down
const duck = (
    x: number, z: number, yaw: number, tag: "a" | "b",
    pose: "up" | "dabble", female: boolean,
) => {
    const grp = new THREE.Group();
    grp.name = `duck_${tag}`;
    grp.position.set(x, WL, z);
    grp.rotation.y = yaw;
    // species coats (flat mats — fauna law)
    const FLANK = female ? 0xa08458 : 0xcfc9bd;   // hen mottle / drake pale grey
    const BACK  = female ? 0x6e5a3c : 0x9aa0a2;   // dark mottle / grey scapulars
    const RUMP  = 0x1c1a17;                        // black rump (both)
    const HEAD  = female ? 0x7a644a : 0x1f6b34;   // brown cap / THE green head
    const BILL  = female ? 0xc9a44a : 0xe8c447;   // dull / bright yellow
    const EYE   = 0x241c12;
    const R = female ? 0.14 : 0.15;               // she is slightly smaller
    // ---- hull: low oval on the water, breast forward (+z local) ----
    const hull = new THREE.Mesh(new THREE.SphereGeometry(R, 9, 7), mat(FLANK, 0.95, 0));
    hull.scale.set(1.0, 0.62, 1.9);
    hull.position.set(0, 0.075, 0.0);
    hull.rotation.x = -0.05; // stern high, breast low in the water
    grp.add(hull);
    // back/scapular mantle over the hull spine
    const back = new THREE.Mesh(new THREE.SphereGeometry(R * 0.92, 8, 6), mat(BACK, 0.95, 0));
    back.scale.set(0.82, 0.5, 1.55);
    back.position.set(0, 0.125, -0.05);
    grp.add(back);
    // black rump at the stern
    const rump = new THREE.Mesh(new THREE.SphereGeometry(R * 0.68, 7, 6), mat(RUMP, 0.9, 0));
    rump.scale.set(0.85, 0.62, 1.05);
    rump.position.set(0, 0.115, -0.20);
    grp.add(rump);
    // speculum: the wing sign — indigo + white bar on BOTH birds (species-
    // true: drakes carry the same speculum; the v1 all-white drake bar read
    // as a foreign box at ultra — indigo reads as a wing mark, ultra FAIL)
    for (const side of [-1, 1]) {
        const spec = new THREE.Mesh(
            new THREE.BoxGeometry(0.012, 0.045, 0.10),
            mat(0x2c4a72, 0.85, 0));
        spec.position.set(side * R * 0.92, 0.10, -0.05);
        grp.add(spec);
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.045, 0.028), mat(0xf2efe6, 0.85, 0));
        bar.position.set(side * R * 0.92, 0.10, -0.115);
        grp.add(bar);
    }
    // ---- head subtree: origin = neck base at the breast shoulder ----
    // pose offsets (head-local): up = scanning, dabble = forward-down.
    // The pendulum swings about local X at the joint, so up↔dabble is one
    // rocking family (same law as the hen peck).
    const hy = pose === "dabble" ? 0.01 : 0.15;
    const hz = pose === "dabble" ? 0.185 : 0.095;
    const head = new THREE.Group();
    head.name = `duck_${tag}_head`;
    // joint: female lower (0.115) so her dabble swing brings the bill to
    // the waterline at max amp; drake higher (0.16) for the upright scan.
    head.position.set(0, female ? 0.125 : 0.16, 0.155);
    // neck slab from joint to skull center (never a floating head — fauna-1 law)
    const neckLen = Math.hypot(hy, hz);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.034, neckLen + 0.04, 6), mat(HEAD, 0.9, female ? 0 : 0.15));
    neck.position.set(0, hy / 2, hz / 2);
    neck.rotation.x = Math.atan2(hz, hy);
    head.add(neck);
    if (!female) { // the white collar at the neck base — THE drake cue
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.041, 0.035, 8), mat(0xf2efe6, 0.9, 0));
        collar.position.set(0, 0.012, 0.008);
        collar.rotation.x = Math.atan2(hz, hy);
        head.add(collar);
        // chestnut breast — a PROUD wedge cresting the hull front (v1 buried
        // it inside the pale hull: r0.062 at z0.065 vs hull front z0.285 —
        // invisible by construction; ultra FAIL "no chestnut")
        const breast = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 7), mat(0x5a3a22, 0.95, 0));
        breast.scale.set(0.85, 0.78, 1.15);
        breast.position.set(0, 0.055, 0.225);
        grp.add(breast);
    }
    // skull
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.05, 7, 6), mat(HEAD, 0.55, female ? 0 : 0.2)); // drake green carries a sheen
    skull.scale.set(0.95, 0.9, 1.15);
    skull.position.set(0, hy, hz);
    head.add(skull);
    // bill: FLAT WIDE spatulate duck bill, 8mm proud of the skull front
    // (v1 0.030×0.014×0.075 at the skull centerline resolved as a "nub" at
    // 5m near and ultra — near+ultra FAIL; the bill is a duck's face)
    const bill = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.011, 0.088), mat(BILL, 0.85, 0));
    bill.position.set(0, hy - 0.004, hz + 0.05 + 0.046);
    head.add(bill);
    if (female) { // dark saddle riding the bill's front half (species mark)
        const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.047, 0.005, 0.06), mat(0x554433, 0.85, 0));
        saddle.position.set(0, hy + 0.001, hz + 0.05 + 0.056);
        head.add(saddle);
    }
    // eyes
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.010, 5, 4), mat(EYE, 0.9, 0));
        eye.position.set(side * 0.038, hy + 0.014, hz + 0.022);
        head.add(eye);
    }
    grp.add(head);
    // ---- tail subtree: origin = rump base, dark pointed fan up-back ----
    const tail = new THREE.Group();
    tail.name = `duck_${tag}_tail`;
    tail.position.set(0, 0.145, -0.235);
    for (const [dx, ang, len] of [[-0.028, 0.38, 0.14], [0.0, 0.5, 0.16], [0.028, 0.38, 0.14]] as const) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, len, 0.045), mat(RUMP, 0.9, 0));
        blade.position.set(dx, len / 2 * Math.sin(ang), -len / 2 * Math.cos(ang));
        blade.rotation.x = -ang;
        tail.add(blade);
    }
    grp.add(tail);
    return grp;
};

// ---- the pair, in the reedpool's open W lobe (host-local frame) ----
// Host decode (mkv3-reedpool.ts, source-true): pool ellipse radii 4.5/3.0
// at origin; bridge deck occupies |x| <= 0.95; reed clusters hug the banks
// at x = ±4.1/±3.5; masts at (1.25, ±3.8). Open W lobe: x in [-3.6, -1.2].
// Drake floats at (-1.75, 0); duck swims a slow circle centered (-2.3,
// -0.75) r 0.55 (her phase-0 orbit point (-2.3, -0.2) IS her rest pose —
// no pop when motion engages; face = a + pi/2 at a=0 = +x toward drake).
g.add(duck(-1.75, 0.0, 2.6, "a", "up", false));     // drake: quarter-profile to the bridge, scanning
g.add(duck(-2.3, -0.2, Math.PI / 2, "b", "dabble", true)); // duck: dabbling, about to swim
// ripple rings at both rest positions (wake geometry, water palette)
ripple(-1.75, 0.0, 0.34);
ripple(-2.3, -0.2, 0.28);
ripple(-1.75, 0.0, 0.52); // second, fainter arc — a settled wake

mergeByMaterial(g, "dk1");
writeFileSync("agents/arthur/assets/village_duckpair.glb", toGLB(g));
console.log("village_duckpair.glb —", g.children.length, "top-level");
