// mkv3-turkey1.ts — fauna loop 24: THE TURKEY (FAUNA-PLAN queue head,
// proposed fauna-24). Village logic: the barnyard BIRDS are complete by
// district (hens/coop, doves/orchard, owl/livery, robin+ducks+geese/pool)
// — but the loudest, most characterful barnyard bird of Bill's homestead
// language was missing. Turkeys are the coop's classic companions: a
// bronze-tom pair in the poultry yard SE of the hutch, beside the hens.
//
// ONE entity (nx-dress-turkey-001), TRUE-SIZE authored directly
// (fauna-13/19/21/23 law — no group scales, no bake, furniture at final
// coords):
//   turkey_a = TOM in full strut display (THE marker: fanned tail of 13
//              dark band-tipped plumes + dropped wing curtains dragging
//              the ground + deep puffed breast + blue-gray head with red
//              snood+wattle — facing the visitor lane)
//   turkey_b = HEN foraging head-down (TubeGeometry neck, fauna-11 law c)
//
// Species law (18m identity): the FAN is the read — a vertical arc of
// dark plumes with PALE terminal bands (0xc9b896) cresting the bird,
// ~0.95m wide × 1.05m tall: nothing else in the village carries a
// vertical fan silhouette. Bronze body 0x6e5335 (plan-pinned), wing
// curtains 0x4a3826, hen earth-brown 0x7d6248, bald head blue-gray
// 0x8fa3ac, wattle/snood red, legs pink-gray 0xc9a08a (pale reads
// against dark body — pig disk law, applied to legs).
//
// Anchors (KEEP(turkey_) added to mergekit this tick — collision-proof
// prefix, no other name matches): turkey_a/_head/_fan/_wings,
// turkey_b/_head/_tail — 7 motion targets, 7 comps. Motion lives in the
// placer (fauna24-place-turkey.ts): tom breathing bob + head-scan Y +
// fan slow sway X + wing strut-shiver, hen bob + peck X + tail flick.
//
// Seat (candidate — sweep at place tick): poultry yard ~(45.3, −6.6)
// yaw −1.15 facing WNW toward the visitor lane (the tom displays at the
// approach — the fan plane faces the lane reader by construction).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law; tex-23 freed the animals)
const BRONZE = 0x6e5335;   // tom body — plan-pinned identity value
const BRONZE_D = 0x4a3826; // plumes, wing curtains, rear coverts
const TIP = 0xe8dcc2;      // pale terminal band on every plume (v3:
                           // 0xd9c9a6 rendered at lit (120,100,70) —
                           // the A/B isolation proved the material
                           // pipeline correct but that value sits at
                           // meadow luminance, sub-threshold at 18m;
                           // wild-turkey tips are pale cream, this is
                           // the species-true value that reads)
const HEN = 0x7d6248;      // hen body (earth-brown, duller than tom)
const HEN_D = 0x5c4a38;    // hen wing seams + tail
const HEAD_BLUE = 0x8fa3ac;// the bald head (blue-gray — species marker
                           // at encounter distance)
const RED = 0xd24a38;      // wattle + snood (encounter scale)
const LEG = 0xc9a08a;      // pink-gray legs (pale-on-dark reads)
const EYE = 0x0d0a07;
const TIMB = 0x6f6432;     // roost beam (stile family)
const STAKE = 0x5a5128;    // roost posts
const STRAW = 0xe6c35c;    // straw wisps (fauna-4 golden-straw law)
const GRIT = 0xd8c97e;     // grain specks (hen peck tie)
// scratch pad: TROD-family texMat (donk/pig/cowpad family, own seed)
const PAD_M = texMat("turkey-scratch", [0x6a5940, 0x5d4e38, 0x514430], { rough: .98, scale: 1.6, weights: [2, 2, 1], seed: 2424 });

// ---- THE TOM (strut display) ----
// body: deep-breasted ballast; neck S-retracted, head high and slightly
// BACK (strut posture — not the forward walking neck); fan carried on
// the raised rear; wing curtains dropped to the ground at the sides.
const tom = () => {
    const grp = new THREE.Group();
    grp.name = "turkey_a";
    grp.position.set(0.40, 0, 0.10);

    // deep body + puffed breast + raised rear (three masses, not one egg)
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 11), mat(BRONZE, 0.92, 0));
    hull.scale.set(0.30, 0.34, 0.46);
    hull.position.set(0, 0.48, 0.02);
    grp.add(hull);
    const breast = new THREE.Mesh(new THREE.SphereGeometry(1, 11, 9), mat(BRONZE, 0.92, 0));
    breast.scale.set(0.26, 0.30, 0.24);
    breast.position.set(0, 0.40, 0.34);
    grp.add(breast);
    const rear = new THREE.Mesh(new THREE.SphereGeometry(1, 11, 9), mat(BRONZE_D, 0.92, 0));
    rear.scale.set(0.24, 0.20, 0.16);
    rear.position.set(0, 0.55, -0.28);
    grp.add(rear);

    // beard: the dark chest tuft (encounter detail, hangs off the breast)
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.09, 0.025), mat(EYE, 0.9, 0));
    beard.position.set(0, 0.30, 0.455);
    grp.add(beard);

    // legs: thick pink-gray, in the front gap between wing curtains
    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.016, 0.26, 7), mat(LEG, 0.9, 0));
        leg.position.set(side * 0.10, 0.13, 0.10);
        grp.add(leg);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.020, 0.09), mat(LEG, 0.9, 0));
        foot.position.set(side * 0.10, 0.010, 0.11);
        grp.add(foot);
    }

    // ---- neck + head subtree: origin at the head (pendulum scans here).
    // Strut neck = short S, retracted: body-top forward, then up+back.
    // v10: head raised 0.72 → 0.78 — the breast crest at the head's z is
    // y 0.623 and the v9 wattle bottom sat at 0.617, dead ON the breast
    // silhouette line (occluded from the front, judge r4's "no second
    // red shape" is arithmetic-true); +0.06 clears the wattle 50mm above
    // the bodyline with visible blue gap.
    const npts: THREE.Vector3[] = [[0, 0.50, 0.32], [0, 0.67, 0.27], [0, 0.78, 0.20]].map(p => new THREE.Vector3(...p));
    const ncurve = new THREE.CatmullRomCurve3(npts);
    const neck = new THREE.Mesh(new THREE.TubeGeometry(ncurve, 8, 0.058, 9), mat(HEAD_BLUE, 0.92, 0));
    grp.add(neck);
    const head = new THREE.Group();
    head.name = "turkey_a_head";
    head.position.set(0, 0.78, 0.20);
    // skull: blue-gray, rounder+stockier than a chicken's. v7: scaled up
    // ~1.2× (judge tomface: "tiny dome, 1/7 the body width" — against
    // the puffed strut breast the head needs mass)
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(HEAD_BLUE, 0.92, 0));
    skull.scale.set(0.075, 0.080, 0.092);
    skull.position.set(0, 0.012, 0.010);
    head.add(skull);
    // junction blend (bigger, still blue — turkey neck skin runs blue
    // to the feather line)
    const blend2 = new THREE.Mesh(new THREE.SphereGeometry(0.085, 9, 7), mat(HEAD_BLUE, 0.92, 0));
    blend2.scale.set(0.8, 0.8, 1.15);
    blend2.position.set(0, -0.025, -0.045);
    head.add(blend2);
    // wattle: red, hanging under the chin. v9: slimmed + lowered (0.038 ×
    // 0.050, center −0.082) — the chin band between beak-bottom and
    // wattle-top reads BLUE with the snood now ending above the beak
    const wattle = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mat(RED, 0.9, 0));
    wattle.scale.set(0.038, 0.050, 0.030);
    wattle.position.set(0, -0.082, 0.046);
    head.add(wattle);
    // snood: the frontal appendage. v9: SHORTENED 0.10 → 0.062 and
    // re-hung so it drapes from the forehead over the beak TOP and ends
    // at mid-beak height (y 0.012) — v8's full-length tip reached the
    // beak bottom and the two red shapes stacked into one column with
    // only a dark beak between (judge r3: "no visible blue gap")
    const snood = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.016, 0.062, 7), mat(RED, 0.9, 0));
    snood.rotation.x = Math.PI / 2 + 0.55;
    snood.position.set(0, 0.028, 0.129);
    head.add(snood);
    // beak: dark horn, proud of the face. v8: nudged up (y 0.004) so the
    // beak band separates the two red shapes
    const beak = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.028, 0.065), mat(EYE, 0.9, 0));
    beak.position.set(0, 0.004, 0.118);
    head.add(beak);
    // eyes: v8 FORWARD on the front-side curve and enlarged 0.013 → 0.016
    // (species-true: turkey eyes sit side-forward-top; v7's rear-side-set
    // placement was invisible straight-on — judge r2: "cannot discern").
    // Ellipsoid test at (±0.062, 0.030, 0.062) = 1.28 → proud ~5mm.
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 5), mat(EYE, 0.9, 0));
        eye.position.set(side * 0.062, 0.030, 0.062);
        head.add(eye);
    }
    grp.add(head);

    // ---- THE FAN (species marker): a keep-group at the raised rear,
    // 13 plumes radiating in the vertical XY plane (z fixed at the
    // root), each a dark box with a PALE terminal band box. v2 (judge
    // fanprobe FAIL + pixel probe zero-tan): band lengthened 0.095 →
    // 0.13, thickened 0.012 → 0.018, brightened TIP — the band now owns
    // the outer 28% of every plume and reads from the lit face AND the
    // silhouette edge. Plumes get per-ray length variation (±0.03) and
    // a small random tilt (±0.09 rad about the ray) — organic arc, not
    // fence pickets (judge: "hard-edged slats"). Alternate z-offsets
    // ±8mm so root overlap never z-fights. Fan radius ~0.46 — top
    // crests ~1.05, width ±0.44: the 18m read.
    const fan = new THREE.Group();
    fan.name = "turkey_a_fan";
    fan.position.set(0, 0.60, -0.36);
    let fseed = 7;
    const frnd = () => (fseed = (fseed * 16807) % 2147483647) / 2147483647;
    for (let i = -6; i <= 6; i++) {
        const th = i * (Math.PI / 15); // 12° steps, ±72°
        const zo = (i % 2 === 0 ? 1 : -1) * 0.008;
        const lv = 0.46 + (frnd() - 0.5) * 0.06 + (Math.abs(i) >= 4 ? 0.03 : 0); // per-ray length; v6: outer rays +0.03 — their caps break against sky, not the body mass (judge rev-3)
        const tilt = (frnd() - 0.5) * 0.14; // v8: ±0.07 rad (was ±0.09 — judge r2 read one ray as an off-angle outlier)
        const dir = { x: Math.sin(th), y: Math.cos(th) };
        const plume = new THREE.Mesh(new THREE.BoxGeometry(0.078, lv, 0.010), mat(BRONZE_D, 0.92, 0));
        plume.position.set((lv / 2) * dir.x, (lv / 2) * dir.y, zo);
        plume.rotation.z = -th + tilt;
        fan.add(plume);
        // v4: band lengthened 0.13 → 0.155, widened to 0.086, and set to
        // CREST ~45mm PAST the plume end (center (lv−0.03)·dir) — a
        // proud pale tip reads from BOTH light sides (rev-2 judge: the
        // shaded-side rays read bandless; a cresting cap cannot hide,
        // shorse blaze law: breaking the silhouette beats sitting in it)
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.155, 0.020), mat(TIP, 0.92, 0));
        tip.position.set((lv - 0.03) * dir.x, (lv - 0.03) * dir.y, zo);
        tip.rotation.z = -th + tilt;
        fan.add(tip);
    }
    grp.add(fan);

    // ---- dropped wing curtains (keep-group, both wings — the strut
    // shiver is symmetric, one comp drives the pair): ellipsoids hanging
    // outside the body, tips dragging the ground, trailing aft. v6: the
    // v4/v5 stick primaries DELETED — thin detached sticks below the
    // curtain read as debris, not feathers (fauna-5 law c; judge rev-2/3:
    // "floating plume fragments", "barring does not read"). In their
    // place: a broad PALE under-curtain ellipsoid per side, aft-biased
    // and peeking along the trailing/bottom edge — the two-tone drape
    // of a strutting tom's dragged wings (goose saddle law: connected
    // masses carry; sticks do not).
    const wings = new THREE.Group();
    wings.name = "turkey_a_wings";
    wings.position.set(0, 0.32, -0.12);
    for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(BRONZE_D, 0.92, 0));
        wing.scale.set(0.045, 0.30, 0.38);
        wing.position.set(side * 0.295, 0, 0);
        wing.rotation.x = -0.14; // tip trails aft, kiss the ground
        wings.add(wing);
        const under = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(TIP, 0.92, 0));
        under.scale.set(0.036, 0.25, 0.30);
        under.position.set(side * 0.295, -0.075, -0.115);
        under.rotation.x = -0.24;
        wings.add(under);
    }
    grp.add(wings);

    return grp;
};

// ---- THE HEN (foraging) ----
const hen = () => {
    const grp = new THREE.Group();
    grp.name = "turkey_b";
    grp.position.set(-0.50, 0, 0.44);

    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), mat(HEN, 0.92, 0));
    hull.scale.set(0.20, 0.22, 0.30);
    hull.position.set(0, 0.32, 0);
    grp.add(hull);
    for (const side of [-1, 1]) {
        const seam = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 7), mat(HEN_D, 0.92, 0));
        seam.scale.set(0.028, 0.155, 0.215);
        seam.position.set(side * 0.175, 0.32, -0.02);
        grp.add(seam);
    }

    // tail subtree: small dark fan-box tilted up
    const tail = new THREE.Group();
    tail.name = "turkey_b_tail";
    tail.position.set(0, 0.42, -0.26);
    const tf = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.16, 0.020), mat(HEN_D, 0.92, 0));
    tf.position.set(0, 0.05, -0.01);
    tf.rotation.x = -0.55;
    tail.add(tf);
    grp.add(tail);

    // neck + head subtree: ONE TubeGeometry dipped down-forward
    // (fauna-11 law c), head pitched to the peck — grain meets it there.
    // v2: dip deepened (18m judge: the hen read as a neutral standing
    // blob — the forage cue needs the neck to visibly dive): pitch
    // 0.65 → 0.85, terminus y set by the pitch-arithmetic (fauna-13 v3
    // law): wattle bottom at head-local −0.106 rotates to −0.082 below
    // the joint → joint 0.075 keeps the deepest member at +6mm.
    const pts: THREE.Vector3[] = [[0, 0.36, 0.18], [0, 0.22, 0.29], [0, 0.075, 0.33]].map(p => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(pts);
    const neck = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.032, 8), mat(HEN, 0.92, 0));
    grp.add(neck);
    const head = new THREE.Group();
    head.name = "turkey_b_head";
    head.position.set(0, 0.075, 0.33);
    head.rotation.x = 0.85; // beak to the grit
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 7), mat(HEAD_BLUE, 0.92, 0));
    skull.scale.set(0.040, 0.044, 0.055);
    head.add(skull);
    const beak = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.016, 0.045), mat(EYE, 0.9, 0));
    beak.position.set(0, -0.004, 0.052);
    head.add(beak);
    const wattle = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 5), mat(RED, 0.9, 0));
    wattle.scale.set(0.016, 0.032, 0.013);
    wattle.position.set(0, -0.042, 0.016);
    head.add(wattle);
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 5), mat(EYE, 0.9, 0));
        eye.position.set(side * 0.039, 0.012, 0.022);
        head.add(eye);
    }
    grp.add(head);

    // legs: thin pink-gray. v9: thickened (0.013/0.010 — the judge's
    // non-blocking "extremely thin sticks" note on the hen)
    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.010, 0.20, 6), mat(LEG, 0.9, 0));
        leg.position.set(side * 0.055, 0.10, 0.02);
        grp.add(leg);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.014, 0.060), mat(LEG, 0.9, 0));
        foot.position.set(side * 0.055, 0.007, 0.025);
        grp.add(foot);
    }

    return grp;
};

g.add(tom());
g.add(hen());

// ---- furniture (true-size build — final coords direct) ----
{
    // roost beam: 2 posts + a low beam the birds could hop. v2: assembly
    // shifted west (−0.35 x) and back (z −0.85 → −1.02) — the west post
    // left the hen's screen column at 18m (judge: "hen merges with the
    // beam's left leg"); the east post now hides behind the tom's east
    // wing curtain from the front vantage (arithmetic: curtain x
    // 0.25..0.34 spans y 0.02..0.62, post top 0.55).
    for (const px of [-1.15, 0.35]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.034, 0.55, 7), mat(STAKE, 0.9, 0));
        post.position.set(px, 0.275, -1.02);
        g.add(post);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.070, 0.090), mat(TIMB, 0.9, 0));
    beam.position.set(-0.40, 0.56, -1.02);
    g.add(beam);
    // scratch pad (TROD-family texMat, ellipse under the pair)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.014, 24), PAD_M);
    pad.scale.set(1.25, 1.0, 1.05);
    pad.position.set(0.05, 0.006, 0.10);
    g.add(pad);
    // grain specks at the hen's composed peck point (hen at (−0.50, 0.44),
    // head terminus hen-local (0, 0.12, 0.34) → entity ≈ (−0.50, 0.78))
    let s = 41;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 6; k++) {
        const grit = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.006, 0.014), mat(GRIT, 0.9, 0));
        grit.position.set(-0.58 + rnd() * 0.20, 0.011, 0.66 + rnd() * 0.22);
        grit.rotation.y = rnd() * Math.PI;
        g.add(grit);
    }
    // molted plume specks + straw wisps (lived-in read, grain law).
    // v4: grounded at y 0.014 — v2's y 0.011 left an 8.5mm hover over
    // grass the judge read as "detached floating plume segments" (and
    // buried them under the pad's 0.013 top besides); now every speck
    // kisses the pad crest / embeds 1mm in the grass
    // v9: molted-feather specks DELETED — flagged as stray geometry by
    // three consecutive judge rounds (the straw wisps + grit carry the
    // lived-in read); straw wisps stay, grounded
    for (const [wx, wz, wr] of [[-0.80, 0.55, 0.2], [0.55, 0.60, 1.1], [0.15, -0.60, 2.4]] as const) {
        const wisp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.005, 0.022), mat(STRAW, 0.95, 0));
        wisp.position.set(wx, 0.0145, wz);
        wisp.rotation.y = wr;
        g.add(wisp);
    }
}

mergeByMaterial(g, "turkey1");
writeFileSync("agents/arthur/assets/village_dress_turkeys.glb", toGLB(g));
console.log("village_dress_turkeys.glb —", g.children.length, "top-level");
