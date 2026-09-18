// mkv3-geese28.ts — fauna loop 11: THE POND GEESE (new species, FAUNA-PLAN
// queue item 8, candidate row proposed fauna-10). Bill keeps geese; the
// reedpool has ducks on the water, a robin at the N rim — the S/SW bank
// meadow is the open grazing ground.
//
// A domestic graylag-goose pair as ONE entity (nx-dress-geese-001):
// white-and-grey bodies, LONG S-curved necks (the silhouette no village
// animal owns), orange bills with pale nail, white rear/tail-knuckle over
// grey wings, orange-pink legs. Two roles: one GRAZER (neck dipped to the
// grass, nibbling) + one SENTRY (neck tall, head-scan — the farmyard
// watchdog; the fox-den story writes itself).
//
// Species law (18m identity): white bodies on green meadow + neck-length
// silhouette — no other villager owns either. Waterfowl take species-true
// colors (tex-23 law); construction adds no furniture — the meadow is the
// furniture (ground-tie: nibbled-grass cut stems + shed white down quills).
//
// Build laws exercised: duck waterfowl chassis (hull/mantle/rump/tail/bill)
// at goose scale, broad forms (fauna-5); NECK-JOINED heads (fauna-1 floating
// head law); flat-box face pattern over nested spheres (fauna-8); ×1.25
// group-local bake AFTER construction incl. joints (fauna-8 toGLB scale
// law); proud elements extent-checked (bill 8mm proud of skull front).
//
// Anchors (KEEP(goose_) added to mergekit this tick): goose_a (grazer),
// goose_a_head (origin = neck joint at the breast shoulder),
// goose_a_tail (origin = rump base), goose_b, goose_b_head, goose_b_tail —
// 6 motion targets. Motion lives in the placer (fauna11-place-geese.ts):
// breathing bob (part bob), graze-dip head pendulum / sentry Y-axis
// head-scan pendulum (owl scan family), tail flicks; phases staggered,
// explicit epoch t0.
//
// Facing convention: breast/bills at local +z (duck chassis). Pair spread
// along local x. World seat: reedpool S/SW bank, entity yaw ≈ +0.915 so
// local +z faces NE across the water (facing = (sin yaw, cos yaw)).
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law)
const BODY = 0xf2efe6;   // domestic graylag white (the 18m read on green)
const GREY = 0x9aa0a2;   // graylag grey — mantle + wing panels + tail fan
const BILL = 0xe07826;   // orange bill
const NAIL = 0xf2efe6;   // pale nail at the bill tip (species mark)
const LEG  = 0xd9784a;   // orange-pink legs
const EYE  = 0x241c12;

// ---- one goose ----
// role: "graze" = neck dipped forward-down to the grass (bill near ground)
//        "sentry" = neck tall in an S-curve, head high (the watch posture)
const goose = (
    x: number, z: number, yaw: number, tag: "a" | "b",
    role: "graze" | "sentry",
) => {
    const grp = new THREE.Group();
    grp.name = `goose_${tag}`;
    grp.position.set(x, 0, z);
    grp.rotation.y = yaw;
    const R = role === "sentry" ? 0.215 : 0.205; // gander slightly bigger
    // ---- hull: deep oval body, keel at ~0.17 (legs 0.20 carry it) ----
    const hull = new THREE.Mesh(new THREE.SphereGeometry(R, 10, 8), mat(BODY, 0.95, 0));
    hull.scale.set(0.95, 0.74, 1.5);
    hull.position.set(0, 0.325, 0);
    grp.add(hull);
    // grey mantle saddle over the spine (the "graylag" read)
    const mantle = new THREE.Mesh(new THREE.SphereGeometry(R * 0.92, 9, 7), mat(GREY, 0.95, 0));
    mantle.scale.set(0.86, 0.52, 1.32);
    mantle.position.set(0, 0.385, -0.04);
    grp.add(mantle);
    // wings: grey flattened ellipsoids SEATED into the flanks (v5's box
    // panels read as "grey boxes stuck on the sides" twice — rounded
    // plumage, no hard edges; only the outer curve shows)
    for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 7), mat(GREY, 0.95, 0));
        wing.scale.set(0.075, 0.10, 0.24);
        wing.position.set(side * 0.155, 0.305, -0.06);
        wing.rotation.z = side * 0.16;
        grp.add(wing);
    }
    // white breast (proud, carries the front silhouette)
    const breast = new THREE.Mesh(new THREE.SphereGeometry(R * 0.72, 9, 7), mat(BODY, 0.95, 0));
    breast.scale.set(0.9, 0.86, 0.85);
    breast.position.set(0, 0.30, 0.22);
    grp.add(breast);
    // white rump + rear knuckle over grey wings (species order: grey wings,
    // white rear — the tail-knuckle read)
    const rump = new THREE.Mesh(new THREE.SphereGeometry(R * 0.70, 8, 7), mat(BODY, 0.95, 0));
    rump.scale.set(0.9, 0.70, 1.0);
    rump.position.set(0, 0.345, -0.245);
    grp.add(rump);
    // ---- legs + feet: orange-pink, standing broad (brightened + slightly
    // thicker than v4 — under the hull shadow they read dark/mismatched)
    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.20, 6), mat(0xe08850, 0.9, 0));
        leg.position.set(side * 0.075, 0.10, 0.02);
        grp.add(leg);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.012, 0.095), mat(0xe08850, 0.9, 0));
        foot.position.set(side * 0.075, 0.006, 0.045);
        grp.add(foot);
    }
    // ---- head subtree: origin = neck joint at the breast shoulder ----
    const head = new THREE.Group();
    head.name = `goose_${tag}_head`;
    head.position.set(0, 0.375, 0.26); // the joint (pendulum swings here)
    // neck: ONE smooth tube along a curve (v5's two butted cylinders left
    // a silhouette kink + shading step at the joint that a blend sphere
    // could not cure — closeface judge twice). Tangent-continuous.
    let hx: number, hy: number, hz: number;
    const curvePts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
    if (role === "graze") {
        // bill to the grass: near-vertical dip (real geese graze with the
        // neck ~20-30° from vertical), gentle bow. Joint y 0.469 post-bake
        // − 0.394 drop puts the bill among the stem tops.
        curvePts.push(new THREE.Vector3(0, -0.17, 0.055), new THREE.Vector3(0, -0.30, 0.115));
        hx = 0; hy = -0.327; hz = 0.13;
    } else {
        // S-curve: up-forward, then up-back to a high head; compact — the
        // z-reach stays behind the rump line (v1 reached z 0.20 past it).
        // v7: curve terminus raised to 0.30 and the skull re-seated ON it
        // (hy 0.40 was the old two-segment endpoint — the tube ended 0.09
        // below the skull and the head floated with sky through the gap).
        curvePts.push(new THREE.Vector3(0, 0.13, 0.07), new THREE.Vector3(0, 0.30, 0.048));
        hx = 0; hy = 0.335; hz = 0.052;
    }
    const neck = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 12, role === "graze" ? 0.036 : 0.033, 8),
        mat(BODY, 0.95, 0));
    head.add(neck);
    // skull
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.050, 8, 7), mat(BODY, 0.9, 0));
    skull.scale.set(0.92, 0.88, 1.12);
    skull.position.set(hx, hy + 0.012, hz + 0.012);
    head.add(skull);
    // pale grey cap (the graylag head mark, subtle)
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.045, 7, 5), mat(GREY, 0.9, 0));
    cap.scale.set(0.9, 0.55, 1.02);
    cap.position.set(hx, hy + 0.036, hz + 0.006);
    head.add(cap);
    // bill: FLAT spatulate slab, 8mm proud of the skull front (fauna-3 law)
    const bill = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.013, 0.082), mat(BILL, 0.85, 0));
    bill.position.set(hx, hy + 0.004, hz + 0.05 + 0.045);
    head.add(bill);
    // pale nail at the tip (species mark)
    const nail = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.012, 0.012), mat(NAIL, 0.85, 0));
    nail.position.set(hx, hy + 0.004, hz + 0.05 + 0.088);
    head.add(nail);
    // eyes (dark, side-set — profile readers, fauna-7 law)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.009, 5, 4), mat(EYE, 0.9, 0));
        eye.position.set(hx + side * 0.040, hy + 0.020, hz + 0.016);
        head.add(eye);
    }
    grp.add(head);
    // ---- tail subtree: origin = rump base, grey fan + white edge ----
    const tail = new THREE.Group();
    tail.name = `goose_${tag}_tail`;
    tail.position.set(0, 0.375, -0.335);
    for (const [dx, ang, len, white] of [[-0.026, 0.30, 0.15, false], [0.0, 0.38, 0.17, true], [0.026, 0.30, 0.15, false]] as const) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.022, len, 0.038), mat(white ? BODY : GREY, 0.9, 0));
        blade.position.set(dx, len / 2 * Math.sin(ang), -len / 2 * Math.cos(ang));
        blade.rotation.x = -ang;
        tail.add(blade);
    }
    grp.add(tail);
    return grp;
};

// ---- the pair (entity-local frame: both face +z, spread along x) ----
// SIDE-BY-SIDE on a near-common z line (v2's z-split stretched the pair
// depth to 1.68): grazer E (+x, at the water's edge), sentry W (−x,
// inland watch). Sentry yaw −0.18: her scan sweeps the water AND approach.
g.add(goose(0.36, -0.06, 0.12, "a", "graze"));
g.add(goose(-0.42, -0.04, -0.18, "b", "sentry"));

// ---- ×1.25 group-local bake (fauna-8 toGLB scale law: group scales are
// DROPPED at export — bake positions AND mesh scales AFTER construction,
// joints included: head/tail group positions scale with the body) ----
const BAKE = 1.25;
g.traverse((o) => {
    if ((o as any).isMesh) {
        o.position.multiplyScalar(BAKE);
        o.scale.multiplyScalar(BAKE);
    } else if ((o as any).isGroup && o !== g) {
        o.position.multiplyScalar(BAKE);
    }
});

// ---- ground-tie furniture, placed AFTER the bake at FINAL entity coords:
// nibbled-grass cut stems + shed white down quills at the grazer's bill
// point (grain law, fauna-2). Grazer bill lands at ≈ (0.51, 0.10, 0.82).
{
    for (let k = 0; k < 8; k++) {
        const a = k * 2.399;
        const sx = 0.50 + Math.cos(a) * 0.06, sz = 0.80 + Math.sin(a) * 0.05;
        const h = 0.05 + 0.025 * Math.abs(Math.sin(a * 3));
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.009, h, 0.009), mat(0x8a9a55, 0.9, 0));
        blade.name = `stem_${k}`;
        blade.position.set(sx, h / 2, sz);
        blade.rotation.z = Math.cos(a) * 0.22;
        g.add(blade);
    }
    for (const [qx, qz, ry] of [[0.30, 0.55, 0.7], [0.05, 0.35, -0.3], [0.62, 0.60, 1.9], [-0.15, 0.28, 0.2]] as const) {
        const quill = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.004, 0.013), mat(BODY, 0.9, 0));
        quill.name = `down_${Math.round(qx * 100)}_${Math.round(qz * 100)}`;
        quill.position.set(qx, 0.004, qz);
        quill.rotation.y = ry;
        g.add(quill);
    }
}

mergeByMaterial(g, "geese1");
writeFileSync("agents/arthur/assets/village_goosepair.glb", toGLB(g));
console.log("village_goosepair.glb —", g.children.length, "top-level");
