// mkv3-shorse1.ts — fauna loop 19: THE LIVERY'S HORSES (FAUNA-PLAN row 12,
// candidate proposed fauna-18, build owed this tick). Village logic: the
// stable is the village's LAST animal-trade building with no animal; a
// draft-horse pair at the hitch rail closes the livery's story the way the
// fold closed the dyehouse's and the sty closed the kiln's.
//
// A draft-horse pair as ONE entity (nx-dress-shorse-001):
//   shorse_a = WATCH (standing, neck up, slow head-scan — the yard sentry)
//   shorse_b = GRAZER (neck dipped into the hay manger, slow tug)
// Species law (18m identity): the LARGEST fauna yet — chestnut mass ~1.55m
// shoulder + CREAM FEATHERED legs (the draft marker) + dark mane/tail on
// chestnut + the hitch-rail context. The tail-SWISH is the motion signature.
//
// Build laws exercised: TRUE-SIZE authored directly (fauna-13 law — no group
// scales anywhere, no ×bake, furniture needs no post-bake pass); necks as ONE
// TubeGeometry per CatmullRom curve (fauna-11 law c) with heads RE-SEATED on
// the tube terminus (fauna-11 v6 law); grazer pitch composed BEFORE authoring
// the hay tie (fauna-13 v3 law): head joint (0, 0.52, 1.10) pitch 0.95 →
// muzzle terminus (0, 0.264, 1.258) — the hay lip+heap meet it there.
// Anchors (KEEP(shorse_) added to mergekit this tick; horse_\d+ is
// carousel-taken — collision-proof prefix law): shorse_a/_head/_ears/_tail,
// shorse_b/_head/_tail — 7 motion targets, 8 comps (bob ×2, watch Y-scan,
// ear-flick, graze-tug X, weight-sway, tail-swish ×2). Motion lives in the
// placer (fauna19-place-shorse.ts).
//
// Seat (candidate — sweep at place tick): east lawn (49.3, −1.5) yaw −1.75,
// heads WSW toward the road-end approach; hitch rail on the local −z side
// (between horses and stable, story-true).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law; tex-23 freed the animals)
const CHEST = 0x7a4526;  // warm chestnut (the identity mass; deeper than the
                         // fox's rufous 0xb35628 — a horse, not a fox)
const CREAM = 0xe8e0cf;  // feathered legs + blaze (sheep wool-cream family —
                         // proven 18m read on green)
const DARKM = 0x2a1c14;  // mane/tail — warm dark (dark-hole law)
const HOOF = 0x1c1712;
const EYE = 0x0a0806;
const LEATH = 0x3a2a1c;  // halter straps
const TIMB = 0x6f6432;   // rail + manger (stile family)
const STAKE = 0x5a5128;  // posts (second timber value)
const STRAW = 0xe6c35c;  // hay wisps (fauna-4 golden-straw law — the shared
                         // yellow-green read "green blob" at distance)
const STRAWD = 0xcfa54f; // hay heap body
const WATER = 0x506a78;  // bucket water (housekit palette law)
// trodden pad: TROD-family texMat (fox-den/pigsty family, own seed)
const PAD_M = texMat("shorse-pad", [0x6a5940, 0x5d4e38, 0x514430], { rough: .98, scale: 1.6, weights: [2, 2, 1], seed: 1919 });

// ---- one draft horse ----
// role: "watch"  = standing alert, neck up ~42°, slow head-scan
//       "graze"  = neck dipped, muzzle in the manger hay
const horse = (
    x: number, z: number, yaw: number, tag: "a" | "b",
    role: "watch" | "graze",
) => {
    const grp = new THREE.Group();
    grp.name = `shorse_${tag}`;
    grp.position.set(x, 0, z);
    grp.rotation.y = yaw;

    // ---- barrel: deep draft body, belly 0.45, back 1.55 ----
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 11), mat(CHEST, 0.92, 0));
    hull.scale.set(0.34, 0.55, 0.80);
    hull.position.set(0, 1.00, -0.02);
    grp.add(hull);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(CHEST, 0.92, 0));
    shoulder.scale.set(0.33, 0.53, 0.28);
    shoulder.position.set(0, 0.98, 0.50);
    grp.add(shoulder);
    const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(CHEST, 0.92, 0));
    rump.scale.set(0.34, 0.54, 0.36);
    rump.position.set(0, 1.02, -0.55);
    grp.add(rump);

    // ---- legs: chestnut upper, CREAM feathered canon (the draft marker),
    // dark hoof. Feet exact on ground (cyl bottom 0.0; hoof center +1mm). ----
    for (const [sx, sz] of [[-0.21, 0.48], [0.21, 0.48], [-0.23, -0.58], [0.23, -0.58]] as const) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.050, 1.02, 7), mat(CHEST, 0.92, 0));
        leg.position.set(sx, 0.51, sz);
        grp.add(leg);
        const feather = new THREE.Mesh(new THREE.CylinderGeometry(0.080, 0.086, 0.50, 7), mat(CREAM, 0.92, 0));
        feather.position.set(sx, 0.32, sz);
        grp.add(feather);
        const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.05, 0.12), mat(HOOF, 0.9, 0));
        hoof.position.set(sx, 0.026, sz + 0.008);
        grp.add(hoof);
    }

    // ---- neck: ONE TubeGeometry along a CatmullRom curve (fauna-11 law c).
    // Base point buried inside the shoulder; head group re-seated ON the
    // terminus (fauna-11 v6 law — never keep an old endpoint). Grazer curve
    // RAISED (v2: v1's dip put the nose at entity (−0.65, 0.25, 1.57) —
    // BESIDE the trough's west end and below rim height, frame mix caught by
    // decode): pts dip to (0,0.68,1.05), head pitch 0.85 → nose terminus
    // horse-local (0, 0.407, 1.309) → entity ≈ (−0.66, 0.41, 1.65) — over
    // the south rim (0.40) INTO the heap crest (0.45). ----
    const pts: THREE.Vector3[] = role === "watch"
        ? [[0, 1.28, 0.44], [0, 1.48, 0.72], [0, 1.66, 0.92]].map(p => new THREE.Vector3(...p))
        : [[0, 1.28, 0.44], [0, 0.95, 0.78], [0, 0.68, 1.05]].map(p => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(pts);
    const neck = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, role === "watch" ? 0.135 : 0.125, 10), mat(CHEST, 0.92, 0));
    grp.add(neck);
    // mane: dark serrated boxes along the crest, proud of the tube surface
    for (const t of [0.25, 0.45, 0.65, 0.85]) {
        const p = curve.getPoint(t);
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.11, 0.10), mat(DARKM, 0.92, 0));
        m.position.set(p.x, p.y + (role === "watch" ? 0.115 : 0.105), p.z);
        m.rotation.x = role === "watch" ? -0.42 : 0.50;
        grp.add(m);
    }

    // ---- head subtree: origin = the neck terminus (pendulums swing here) ----
    const terminus = pts[pts.length - 1];
    const head = new THREE.Group();
    head.name = `shorse_${tag}_head`;
    head.position.copy(terminus).add(new THREE.Vector3(0, role === "watch" ? 0.02 : -0.04, role === "watch" ? 0.03 : 0.12));
    head.rotation.x = role === "watch" ? 0.25 : 0.85; // +α pitches muzzle down
    // skull + jaw
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(CHEST, 0.92, 0));
    skull.scale.set(0.105, 0.13, 0.19);
    skull.position.set(0, 0.01, 0.06);
    head.add(skull);
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mat(CHEST, 0.92, 0));
    jaw.scale.set(0.085, 0.09, 0.10);
    jaw.position.set(0, -0.05, 0.02);
    head.add(jaw);
    // muzzle: tapered cylinder, nose-down 0.26 from the skull axis
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.20, 8), mat(CHEST, 0.92, 0));
    muzzle.rotation.x = Math.PI / 2 + 0.26;
    muzzle.position.set(0, -0.025, 0.20);
    head.add(muzzle);
    // nose leather
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 6), mat(DARKM, 0.9, 0));
    nose.scale.set(1, 0.85, 0.7);
    nose.position.set(0, -0.048, 0.295);
    head.add(nose);
    // BLAZE: proud plaque at the skull front pole (struct-52 containment law:
    // skull front z-max = 0.25; plaque z 0.15..0.275 BREAKS the surface) +
    // a stripe riding the muzzle top (muzzle r 0.055-0.075 top face)
    const blaze = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.014, 0.13), mat(CREAM, 0.92, 0));
    blaze.position.set(0, 0.055, 0.20);
    blaze.rotation.x = -0.20;
    head.add(blaze);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.012, 0.16), mat(CREAM, 0.92, 0));
    stripe.position.set(0, 0.012, 0.17);
    stripe.rotation.x = -0.26;
    head.add(stripe);
    // eyes (dark, side-set, above the cheek line)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 5), mat(EYE, 0.9, 0));
        eye.position.set(side * 0.092, 0.052, 0.10);
        head.add(eye);
    }
    // ears: the WATCH pair rides its own keep-group (ear-flick comp; bcat
    // pattern); the grazer's merge into the head.
    const earGrp = new THREE.Group();
    if (role === "watch") {
        earGrp.name = `shorse_${tag}_ears`;
        earGrp.position.set(0, 0.12, 0.02);
        head.add(earGrp);
    }
    for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.13, 0.020), mat(CHEST, 0.92, 0));
        ear.position.set(side * 0.058, 0.06, 0.0);
        ear.rotation.z = side * -0.24;
        (role === "watch" ? earGrp : head).add(ear);
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.045, 0.018), mat(DARKM, 0.92, 0));
        tip.position.set(side * 0.070, 0.145, 0.0);
        tip.rotation.z = side * -0.24;
        (role === "watch" ? earGrp : head).add(tip);
    }
    // forelock: dark tuft between the ears, over the blaze root
    const forelock = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.10, 0.045), mat(DARKM, 0.92, 0));
    forelock.position.set(0, 0.10, 0.145);
    forelock.rotation.x = 0.35;
    head.add(forelock);
    // halter (leather, rides the head — moves with every swing): noseband +
    // cheek straps + poll band
    const noseband = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.020, 0.022), mat(LEATH, 0.85, 0));
    noseband.position.set(0, -0.012, 0.185);
    noseband.rotation.x = -0.26;
    head.add(noseband);
    for (const side of [-1, 1]) {
        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.20, 0.018), mat(LEATH, 0.85, 0));
        strap.position.set(side * 0.086, 0.045, 0.115);
        strap.rotation.x = 0.45;
        strap.rotation.z = side * 0.10;
        head.add(strap);
    }
    const poll = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.020, 0.020), mat(LEATH, 0.85, 0));
    poll.position.set(0, 0.115, 0.015);
    head.add(poll);
    grp.add(head);

    // ---- tail subtree: dock + tapering cascade hanging to hock height.
    // v2: cascade pushed BACK of the rail plane (v1's tail hung THROUGH the
    // hitch rail — same x-band as posts at z −1.42, y-bands overlapping;
    // caught by decode). Dock proud 0.02; cascade swung 5° more aft. ----
    const tail = new THREE.Group();
    tail.name = `shorse_${tag}_tail`;
    tail.position.set(0, 1.30, -0.88);
    const dock = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), mat(CHEST, 0.92, 0));
    dock.scale.set(1, 0.8, 1);
    tail.add(dock);
    const cascade = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.072, 0.85, 8), mat(DARKM, 0.92, 0));
    // direction (0, -0.905, -0.425): rotation.x = -(pi - 0.44) = -2.70;
    // v2 swings aft to −0.375 rad off −z: rotation.x = −2.767
    cascade.rotation.x = -2.767;
    cascade.position.set(0, -0.393, -0.161);
    tail.add(cascade);
    grp.add(tail);

    return grp;
};

// ---- the pair (entity-local: both face +z; entity yaw turns the group WSW).
// v2: A forward to z −0.10 — v1's z −0.35 put the tail tip at z −1.545,
// crossing the rail plane (−1.42) below beam height; now the tip sits at
// ≈−1.30, 10cm clear of the rail's north face. ----
g.add(horse(0.68, -0.10, 0.10, "a", "watch"));   // watch NE-of-center, alert
g.add(horse(-0.50, 0.35, -0.12, "b", "graze")); // grazer SW, muzzle in the manger

// ---- furniture (true-size build — no bake, final coords direct) ----
{
    // hitch rail between the horses and the stable (local -z side)
    for (const px of [-0.80, 0.80]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.038, 1.05, 7), mat(STAKE, 0.9, 0));
        post.position.set(px, 0.525, -1.42);
        g.add(post);
    }
    for (const ry of [0.88]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.06, 0.05), mat(TIMB, 0.9, 0));
        rail.position.set(0, ry, -1.42);
        g.add(rail);
    }
    // coiled rope hanging on the rail (the tie story, no animal link —
    // a rope pinned to a moving head would detach at scan extremes)
    const rope = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.014, 6, 12), mat(LEATH, 0.9, 0));
    rope.rotation.x = Math.PI / 2;
    rope.position.set(0.55, 0.80, -1.42);
    g.add(rope);
    // water bucket by the rail (timber + palette-water disc — water is
    // geometry law; housekit blue 0x506a78)
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.115, 0.24, 10), mat(TIMB, 0.9, 0));
    bucket.position.set(-0.98, 0.12, -1.12);
    g.add(bucket);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.132, 0.012, 10), mat(WATER, 0.25, 0.5));
    water.position.set(-0.98, 0.232, -1.12);
    g.add(water);
    // hay manger under the grazer's muzzle: solid timber box + heaped hay.
    // v3 (v1/v2 frame-misses caught by decode+probe: nose terminus entity
    // ≈ (−0.66, 0.33..0.44, ≤1.74) — the trough was centered at x 0, WEST
    // miss of ~0.6m; furniture must sit UNDER the composed muzzle): trough
    // (−0.60, 0.27, 1.60) interior x −0.875..−0.325 z 1.39..1.81, heap
    // (−0.62, 0.36, 1.62) cresting 0.45 — nose bottom 0.33 buries 10cm
    // into the heap surface, crest 5cm proud of the rim toward the horse.
    const legs = [[-0.82, 1.48], [-0.38, 1.48], [-0.82, 1.72], [-0.38, 1.72]] as const;
    for (const [lx, lz] of legs) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.05), mat(STAKE, 0.9, 0));
        leg.position.set(lx, 0.12, lz);
        g.add(leg);
    }
    const trough = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.26, 0.42), mat(TIMB, 0.9, 0));
    trough.position.set(-0.60, 0.27, 1.60);
    g.add(trough);
    const heap = new THREE.Mesh(new THREE.SphereGeometry(0.30, 10, 8), mat(STRAWD, 0.95, 0));
    heap.scale.set(0.85, 0.30, 0.62);
    heap.position.set(-0.62, 0.36, 1.62);
    g.add(heap);
    // trodden pad (TROD-family texMat, ellipse under the pair + rail)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.014, 24), PAD_M);
    pad.scale.set(1.55, 1.0, 1.15);
    pad.position.set(0.05, 0.006, -0.05);
    g.add(pad);
    // straw scatter: wisps at the manger + spill below the grazer muzzle +
    // a few at the rail (golden 0xe6c35c — fauna-4 law)
    let s = 29;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 9; k++) {
        const wisp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.005, 0.022), mat(STRAW, 0.95, 0));
        const nearManger = k < 5;
        wisp.position.set(
            nearManger ? -0.82 + rnd() * 0.44 : -0.70 + rnd() * 0.45,
            0.012,
            nearManger ? 1.15 + rnd() * 0.30 : 0.65 + rnd() * 0.55,
        );
        wisp.rotation.y = rnd() * Math.PI;
        g.add(wisp);
    }
}

mergeByMaterial(g, "shorse1");
writeFileSync("agents/arthur/assets/village_dress_stablehorses.glb", toGLB(g));
console.log("village_dress_stablehorses.glb —", g.children.length, "top-level");
