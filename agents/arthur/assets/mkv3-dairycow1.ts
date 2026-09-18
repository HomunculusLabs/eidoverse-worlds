// mkv3-dairycow1.ts — fauna loop 21: THE DAIRY COW (FAUNA-PLAN row 13,
// candidate proposed fauna-20, build owed this tick). Village logic: the
// dairy chain stands at the kiln-yard corner — milkstand (22.5,33.2) +
// churn (19.9,35.1) — with NO source animal; the cow closes the chain the
// way the fold closed the dyehouse's, the sty closed the kiln's, and the
// horses closed the livery's.
//
// A Jersey-class dairy cow pair as ONE entity (nx-dress-cow-001):
//   cow_a = WATCH (standing, neck up, slow head-scan — the field sentry)
//   cow_b = GRAZER (neck dipped, muzzle in fallen hay by the rack)
// Species law (18m identity): warm FAWN mass 0xa9825a (plan-pinned) ~1.22m
// shoulder × 1.7 long — the horizontal dairy barrel — + PALE muzzle ring
// around the dark nose leather (the Jersey marker) + pale udder in profile
// + dark hooves + big lateral ears + the hay-rack context. Tail-SWISH is
// the motion signature (lateral, shorse law).
//
// Build laws exercised: TRUE-SIZE authored directly (fauna-13/19 law — no
// group scales anywhere, no ×bake, furniture at final coords); necks as ONE
// TubeGeometry per CatmullRom curve (fauna-11 law c) with heads RE-SEATED
// on the tube terminus (fauna-11 v6 law); grazer pitch composed BEFORE
// authoring the hay tie (fauna-13 v3 law): head joint (0, 0.50, 1.05) pitch
// 0.95 → nose terminus ≈ cow-local (0, 0.24, 1.235) → entity ≈ (−0.74, 0.24,
// 1.60) — the fallen-hay wisps meet it there. Muzzle ring torus r 0.070 +
// tube 0.015 breaks the muzzle surface ~20mm (dovecote collar law: radial
// crest + band, not hairline). Anchors (KEEP(cow_) added to mergekit this
// tick — collision-proof: only "rain-cowl" in a comment, no name collides):
// cow_a/_head/_ears/_tail, cow_b/_head/_tail — 7 motion targets, 7 comps.
// Motion lives in the placer (fauna21-place-cow.ts).
//
// Seat (candidate — sweep at place tick): meadow E of the pig sty, center
// ~(24, 40.75) per fauna-20 census (6.4m clear of solids), heads NE toward
// the mosaic-row visitor line (pig law — the pannage meadow reads lived-in
// from the walk).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law; tex-23 freed the animals)
const FAWN = 0xa9825a;   // warm Jersey fawn (plan-pinned identity value —
                         // warmer than timber, distinct from chestnut 0x7a4526)
const FAWN_D = 0x8d6b48; // darker fawn — tail cascade, ear tips
const CREAM = 0xe9dfc8;  // muzzle ring + eye surrounds (sheep wool-cream
                         // family — proven 18m read on green)
const UDDER = 0xd9c6a4;  // pale udder (the dairy marker, profile contract)
const NOSE = 0x3a2c22;   // dark nose leather (the ring's dark center)
const HOOF = 0x241d16;   // dark hoof line (plan)
const EYE = 0x0d0a07;
const TIMB = 0x6f6432;   // rack rails (stile family)
const STAKE = 0x5a5128;  // rack posts (second timber value)
const STRAW = 0xe6c35c;  // hay wisps (fauna-4 golden-straw law)
const STRAWD = 0xcfa54f; // hay heap body
// trodden pad: TROD-family texMat (fox-den/pigsty family, own seed)
const PAD_M = texMat("cow-pad", [0x6a5940, 0x5d4e38, 0x514430], { rough: .98, scale: 1.6, weights: [2, 2, 1], seed: 2121 });

// ---- one dairy cow ----
// role: "watch"  = standing alert, neck up ~38°, slow head-scan
//       "graze"  = neck dipped, muzzle in fallen hay
const cow = (
    x: number, z: number, yaw: number, tag: "a" | "b",
    role: "watch" | "graze",
) => {
    const grp = new THREE.Group();
    grp.name = `cow_${tag}`;
    grp.position.set(x, 0, z);
    grp.rotation.y = yaw;

    // ---- barrel: deep dairy body, belly 0.42, back 1.22 ----
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 11), mat(FAWN, 0.92, 0));
    hull.scale.set(0.33, 0.40, 0.82);
    hull.position.set(0, 0.82, -0.02);
    grp.add(hull);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(FAWN, 0.92, 0));
    shoulder.scale.set(0.31, 0.38, 0.26);
    shoulder.position.set(0, 0.84, 0.48);
    grp.add(shoulder);
    const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(FAWN, 0.92, 0));
    rump.scale.set(0.32, 0.39, 0.34);
    rump.position.set(0, 0.84, -0.56);
    grp.add(rump);

    // ---- udder: pale, DROPPED BELOW the belly silhouette line at near-white
    // value (v5 18m judge: "udder does not read — silhouette break beats
    /// value break"). Hangs between the hind legs, dome visible under the
    // belly from both sides — the dairy lock. ----
    const udder = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(CREAM, 0.92, 0));
    udder.scale.set(0.19, 0.16, 0.27);
    udder.position.set(0, 0.36, -0.48);
    grp.add(udder);

    // ---- legs: fawn, dark hoof (the plan's dark hoof line). Feet exact on
    // ground (cyl bottom 0.0; hoof center +1mm). Dairy legs are fine, not
    // feathered (that was the draft horse). ----
    for (const [sx, sz] of [[-0.20, 0.50], [0.20, 0.50], [-0.22, -0.62], [0.22, -0.62]] as const) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.042, 0.76, 7), mat(FAWN, 0.92, 0));
        leg.position.set(sx, 0.38, sz);
        grp.add(leg);
        const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.05, 0.11), mat(HOOF, 0.9, 0));
        hoof.position.set(sx, 0.026, sz + 0.008);
        grp.add(hoof);
    }

    // ---- neck: ONE TubeGeometry along a CatmullRom curve (fauna-11 law c).
    // Head group re-seated ON the terminus (fauna-11 v6 law). Grazer curve
    // dips to (0,0.50,1.05), head pitch 0.95 → nose terminus cow-local
    // ≈ (0, 0.24, 1.235) — the fallen-hay wisps + rack heap meet it there. ----
    const pts: THREE.Vector3[] = role === "watch"
        ? [[0, 1.02, 0.42], [0, 1.28, 0.72], [0, 1.42, 0.94]].map(p => new THREE.Vector3(...p))
        : [[0, 1.00, 0.42], [0, 0.72, 0.78], [0, 0.50, 1.05]].map(p => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(pts);
    const neck = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, role === "watch" ? 0.145 : 0.135, 10), mat(FAWN, 0.92, 0));
    grp.add(neck);
    // dairy crest: a soft fawn ridge along the neck top (no dark mane — that
    // was the horse; the cow's topline stays fawn)
    for (const t of [0.3, 0.55, 0.8]) {
        const p = curve.getPoint(t);
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.055, 0.12), mat(FAWN, 0.92, 0));
        c.position.set(p.x, p.y + (role === "watch" ? 0.135 : 0.125), p.z);
        c.rotation.x = role === "watch" ? -0.40 : 0.55;
        grp.add(c);
    }

    // ---- head subtree: origin = the neck terminus (pendulums swing here).
    // v2 throat weld (profile judge v1 FAIL: through-gap under the watch
    // jaw — fauna-11 neck-weld class): head buried deeper (offset +0.00y
    // +0.01z, was +0.02/+0.03), jaw extended back over the tube terminus
    // (z-span −0.13..0.13, was −0.08..0.12), and a fawn blend sphere AT
    // the junction riding the head group (pivot-close: Y-scan swings it
    // negligibly). ----
    const terminus = pts[pts.length - 1];
    const head = new THREE.Group();
    head.name = `cow_${tag}_head`;
    head.position.copy(terminus).add(new THREE.Vector3(0, role === "watch" ? 0.00 : -0.03, role === "watch" ? 0.01 : 0.11));
    head.rotation.x = role === "watch" ? 0.30 : 0.95; // +α pitches muzzle down
    // junction blend (v2): fawn sphere bridging jaw-rear to neck-top
    const blend = new THREE.Mesh(new THREE.SphereGeometry(0.10, 9, 7), mat(FAWN, 0.92, 0));
    blend.scale.set(0.75, 0.75, 1.1);
    blend.position.set(0, -0.02, -0.04);
    head.add(blend);
    // skull + jaw (longer, finer than the horse's — dairy refinement)
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(FAWN, 0.92, 0));
    skull.scale.set(0.100, 0.110, 0.19);
    skull.position.set(0, 0.015, 0.06);
    head.add(skull);
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mat(FAWN, 0.92, 0));
    jaw.scale.set(0.086, 0.100, 0.13);
    jaw.position.set(0, -0.055, 0.0);
    head.add(jaw);
    // muzzle: tapered cylinder, nose-down 0.26 from the skull axis
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.20, 8), mat(FAWN, 0.92, 0));
    muzzle.rotation.x = Math.PI / 2 + 0.26;
    muzzle.position.set(0, -0.025, 0.20);
    head.add(muzzle);
    // v4 species lock (18m judge: "no value break at the head"): WIDE pale
    // muzzle PATCH — a cream plate on the muzzle front face (proud 6mm,
    // 2.2× the ring's band width — a distance-visible pale block), with the
    // ring keeping the encounter read. struct-52: face z 0.30 vs muzzle
    // front z 0.30 → patch z 0.268..0.312 breaks the surface.
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.075, 0.030), mat(CREAM, 0.92, 0));
    patch.position.set(0, -0.030, 0.272);
    patch.rotation.x = 0.26;
    head.add(patch);
    // THE JERSEY RING: pale torus around the muzzle, crest ~20mm proud
    // (dovecote collar law: radial crest + band length, never a hairline).
    // Dark nose leather inside it = the "dark muzzle band" of the plan.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.015, 8, 14), mat(CREAM, 0.92, 0));
    ring.rotation.x = Math.PI / 2 + 0.26;
    ring.position.set(0, -0.032, 0.252);
    head.add(ring);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 6), mat(NOSE, 0.9, 0));
    nose.scale.set(1, 0.85, 0.6);
    nose.position.set(0, -0.048, 0.298);
    head.add(nose);
    // eyes: big dark, side-set, with the PALE JERSEY SURROUND (the breed's
    // spectacled look at encounter distance)
    for (const side of [-1, 1]) {
        const surround = new THREE.Mesh(new THREE.SphereGeometry(0.030, 8, 6), mat(CREAM, 0.92, 0));
        surround.scale.set(0.45, 1, 1);
        surround.position.set(side * 0.088, 0.048, 0.075);
        head.add(surround);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), mat(EYE, 0.9, 0));
        eye.position.set(side * 0.096, 0.048, 0.090);
        head.add(eye);
    }
    // ears: BIG lateral Jersey paddles (v3 — v1/v2 read as horns: boxes on
    // the skull crown drooped by z-rotation). v3 law: cow ears sit at EYE
    // level, lateral, level paddles with only a slight droop — root INSIDE
    // the skull, paddle plane horizontal (wide in z, thin in y), outer 35%
    // in the darker fawn with faces proud of the paddle (dovecote crest
    // law). The WATCH pair rides its own keep-group (ear-flick comp);
    // the grazer's merge into the head.
    const earGrp = new THREE.Group();
    if (role === "watch") {
        earGrp.name = `cow_${tag}_ears`;
        earGrp.position.set(0, 0.030, -0.020); // eye level, behind the eyes
        head.add(earGrp);
    }
    for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.030, 0.085), mat(FAWN, 0.92, 0));
        ear.position.set(side * 0.145, 0, 0.005);
        ear.rotation.z = side * -0.30; // slight droop only — a lateral paddle
        ear.rotation.y = side * -0.12; // canted slightly back (cow-true)
        (role === "watch" ? earGrp : head).add(ear);
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.033, 0.090), mat(FAWN_D, 0.92, 0));
        tip.position.set(side * 0.195, -0.004, 0.005);
        tip.rotation.z = side * -0.30;
        tip.rotation.y = side * -0.12;
        (role === "watch" ? earGrp : head).add(tip);
    }
    grp.add(head);

    // ---- tail subtree: dock + fine cascade hanging to hock height with the
    // dark switch tip. Lateral swish comp axis [0,0,1] — the sweep swings x
    // only; z-band stays fixed (shorse law). ----
    const tail = new THREE.Group();
    tail.name = `cow_${tag}_tail`;
    tail.position.set(0, 1.06, -0.90);
    const dock = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), mat(FAWN, 0.92, 0));
    dock.scale.set(1, 0.85, 1);
    tail.add(dock);
    const cascade = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.042, 0.78, 8), mat(FAWN_D, 0.92, 0));
    // direction (0, -0.94, -0.34): rotation.x = -(pi - 0.35) = -2.79
    cascade.rotation.x = -2.79;
    cascade.position.set(0, -0.36, -0.13);
    tail.add(cascade);
    const switchTip = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 6), mat(NOSE, 0.92, 0));
    switchTip.scale.set(1, 1.35, 1);
    switchTip.position.set(0, -0.72, -0.26);
    tail.add(switchTip);
    grp.add(tail);

    return grp;
};

// ---- the pair (entity-local: both face +z; entity yaw turns the group NE).
// Watch NE-of-center alert; grazer SW, muzzle in the fallen hay. ----
g.add(cow(0.62, 0.10, 0.10, "a", "watch"));   // watch, head up scanning
g.add(cow(-0.52, 0.38, -0.18, "b", "graze")); // grazer, muzzle down

// ---- furniture (true-size build — no bake, final coords direct) ----
{
    // hay rack SW of the grazer (the feed store, timber stile family):
    // 2 posts + 2 rails spanning x at z 1.62 + a diagonal brace each end.
    // v4 (18m judge v3: "bays empty, hay = ground lump"): the bays now
    // carry a FILLED hay volume between the rails, cresting over the top
    // rail — the ground heap is gone (a small trampled spill remains).
    // The rack reads as held feed at gameplay distance.
    for (const px of [-1.45, -1.02]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.038, 1.15, 7), mat(STAKE, 0.9, 0));
        post.position.set(px, 0.575, 1.62);
        g.add(post);
    }
    for (const ry of [0.58, 1.02]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.055, 0.05), mat(TIMB, 0.9, 0));
        rail.position.set(-1.235, ry, 1.62);
        g.add(rail);
    }
    for (const [bx, flip] of [[-1.42, 1], [-1.05, -1]] as const) {
        const brace = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.62, 0.045), mat(TIMB, 0.9, 0));
        brace.position.set(bx, 0.50, 1.56);
        brace.rotation.x = flip * 0.55;
        g.add(brace);
    }
    // v5: hay BETWEEN the rails only (v4's fill swallowed both — fill front
    // z 1.71 vs rail front 1.645: no rail line, "solid golden box" at 18m).
    // Fill pulled to z-center 1.535, depth 0.17 → front face 1.62 == rail
    // plane: rails read end-on as the frame, bright STRAW lumps crest OVER
    // the top rail (silhouette break), spill clumps at the base.
    const bayfill = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.50, 0.17), mat(STRAWD, 0.95, 0));
    bayfill.position.set(-1.235, 0.86, 1.535);
    g.add(bayfill);
    for (const [lx, ly] of [[-1.35, 1.13], [-1.235, 1.17], [-1.12, 1.12]] as const) {
        const lump = new THREE.Mesh(new THREE.SphereGeometry(0.10, 9, 7), mat(STRAW, 0.95, 0));
        lump.scale.set(1.3, 0.7, 0.8);
        lump.position.set(lx, ly, 1.56);
        g.add(lump);
    }
    for (const sx of [-1.44, -1.34, -1.12, -1.03]) {
        const clump = new THREE.Mesh(new THREE.SphereGeometry(0.045, 7, 5), mat(STRAW, 0.95, 0));
        clump.scale.set(1.2, 0.45, 0.9);
        clump.position.set(sx, 0.022, 1.38);
        g.add(clump);
    }
    // trodden pad (TROD-family texMat, ellipse under the pair + rack)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.014, 24), PAD_M);
    pad.scale.set(1.55, 1.0, 1.45);
    pad.position.set(-0.15, 0.006, 0.30);
    g.add(pad);
    // straw scatter: fallen-hay wisps AT the grazer's composed muzzle
    // (entity ≈ (−0.74, 0.24, 1.60) — the tie), at the rack, and mid-pad
    // (golden 0xe6c35c — fauna-4 law)
    let s = 31;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 11; k++) {
        const wisp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.005, 0.022), mat(STRAW, 0.95, 0));
        const atMuzzle = k < 4, atRack = k >= 4 && k < 8;
        wisp.position.set(
            atMuzzle ? -0.86 + rnd() * 0.26 : atRack ? -1.42 + rnd() * 0.38 : -0.75 + rnd() * 1.2,
            0.012,
            atMuzzle ? 1.44 + rnd() * 0.34 : atRack ? 1.30 + rnd() * 0.34 : -0.10 + rnd() * 0.80,
        );
        wisp.rotation.y = rnd() * Math.PI;
        g.add(wisp);
    }
}

mergeByMaterial(g, "dairycow1");
writeFileSync("agents/arthur/assets/village_dress_dairycows.glb", toGLB(g));
console.log("village_dress_dairycows.glb —", g.children.length, "top-level");
