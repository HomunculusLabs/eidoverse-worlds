// mkv3-rooster1.ts — fauna loop 26: THE ROOSTER (FAUNA-PLAN queue head,
// proposed fauna-24, plan §17). Village logic: the hen flock (fauna-2) is
// THREE hens with no cock — the one bird every village flock has that
// ours still lacks. A single cock stands proud in the coop yard beside
// his flock, facing the yard's visitor lane.
//
// ONE entity (nx-dress-rooster-001), TRUE-SIZE authored directly
// (fauna-13/19/21/23/24 law — no group scales, no bake, furniture at
// final coords):
//   roost_a      = the cock: upright carriage (chest proud, neck
//                  vertical), gold-hackled neck, red-shouldered body
//   roost_a_head = skull + face + beak + wattles (the Y-scan sentry)
//   roost_a_comb = THE tall serrated comb, nested in the head so it
//                  rides the scan AND nods (peacock crest law)
//   roost_a_tail = THE SICKLES — 5 arching green-bronze feathers
//                  cresting above the back line (the 18m silhouette
//                  marker; horsemane law: silhouette break beats value)
//   roost_a_wing = both wing panels (symmetric slow ruffle)
//
// Species law (18m identity): the UPRIGHT stance + the arching sickle
// arc against the sky + the tall red comb = rooster. Nothing else in
// the village carries an arching sickle silhouette. Saddle red
// 0x8a3b28 (warm hue alien to meadow green — fox-law read), hackle
// gold 0xd9963a, sickles green-bronze 0x2f4a35 with a metallic sheen,
// comb/wattle red 0xd2402e (turkey-RED proven value), legs gray with
// spurs (the cock's badge).
//
// Sickle law (fox tail + turkey fan, combined): each sickle is a chain
// of three BROAD overlapping boxes with progressive cant — connected
// masses carry, thin sticks read as debris. Slight per-sickle yaw fan
// + length variation: an organic arc, not fence pickets.
//
// Anchors (KEEP(roost$|roost_) added to mergekit this tick — no other
// name matches; the old-commons weathervane is wv_rooster_*, another
// world/script). 5 motion comps live in the placer
// (fauna26-place-rooster.ts): bob + head-scan Y + comb nod + tail sway
// Y + wing slow ruffle Z.
//
// Furniture: a low dunging-board roost (2 stubs + beam, stile family)
// placed SIDE-ON (x −0.55) clear of the sickle sweep (fauna-19 law a —
// the sweep probe must prove it), grain specks + 2 straw wisps at the
// feet. Seat (candidate — sweep at place tick): coop yard near the
// flock (34, −8), facing the yard's visitor lane.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law; tex-23 freed the animals)
const SADDLE = 0x8a3b28;   // hull — rich chestnut-red (plan: red shoulders)
const SADDLE_D = 0x6b2417; // breast + saddle hackle mass (darker maroon)
const HACKLE = 0xd9963a;   // the gold neck (species gold, reads vs body+meadow)
const SICKLE = 0x3d6b4f;   // green-bronze sickles (v6: peacock-TRAIN
                            // proven value — v4's 0x2f4a35 rendered
                            // near-black (24,38,23) and the judge read
                            // "dark planks, no sheen")
const SICKLE_L = 0x5a7d52; // v11: the lesser sickles — a lighter
                            // bronze-green layer inside the fountain
                            // (judge: "no tonal break... reads as dark
                            // lumber"; layering reads as plumage)
const WING_D = 0x5a2015;   // wing panels
const COMB = 0xd2402e;     // comb + wattles + face (turkey-RED proven)
const BEAK = 0x8a6224;     // horn-amber beak (v10: the v5 amber
                            // 0xd9a441 was 7/14/7 per-channel from the
                            // gold hackle 0xd9963a — monochrome-blended,
                            // judge: "no beak breaks the silhouette";
                            // darker horn contrasts the gold head)
const LEG = 0x8a8578;      // gray legs (the cock's long gray legs)
const EYE = 0x38190a;      // dark amber eyes
const TIMB = 0x6f6432;     // roost beam (stile family)
const STAKE = 0x5a5128;    // roost stubs
const STRAW = 0xe6c35c;    // straw wisps (fauna-4 golden-straw law)
const GRIT = 0xd8c97e;     // grain specks

const sickleMat = mat(SICKLE, 0.45, 0.45);  // metallic green-bronze (v6:
                                             // rough 0.5→0.45, metal
                                             // 0.35→0.45 — the specular
                                             // path the judge asked for)
const sickleLMat = mat(SICKLE_L, 0.5, 0.35); // lighter layer (v11)

// ---- THE COCK ----
const cock = () => {
    const grp = new THREE.Group();
    grp.name = "roost_a";

    // legs: LONG gray legs (taller carriage than the hens) + spurs
    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.011, 0.26, 7), mat(LEG, 0.9, 0));
        leg.position.set(side * 0.052, 0.13, 0.00);
        grp.add(leg);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.012, 0.062), mat(LEG, 0.9, 0));
        foot.position.set(side * 0.052, 0.006, 0.012);
        grp.add(foot);
        // spur: the cock's badge, pointing back-up off each shank
        const spur = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.030, 6), mat(BEAK, 0.85, 0.1));
        spur.position.set(side * 0.052, 0.16, -0.028);
        spur.rotation.x = 1.95;
        grp.add(spur);
    }

    // body: upright carriage — hull tilted chest-up, deep breast
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 13, 10), mat(SADDLE, 0.92, 0));
    hull.scale.set(0.19, 0.25, 0.30);
    hull.position.set(0, 0.40, -0.02);
    hull.rotation.x = -0.18;
    grp.add(hull);
    const breast = new THREE.Mesh(new THREE.SphereGeometry(1, 11, 9), mat(SADDLE_D, 0.92, 0));
    breast.scale.set(0.15, 0.20, 0.13);
    breast.position.set(0, 0.38, 0.16);
    grp.add(breast);
    // saddle hackle mass over the back (the maroon cape line)
    const cape = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(SADDLE_D, 0.92, 0));
    cape.scale.set(0.13, 0.10, 0.20);
    cape.position.set(0, 0.55, -0.08);
    grp.add(cape);

    // neck: ONE TubeGeometry (fauna-11 law c), vertical with a slight
    // S — gold hackle to the nape. v3: thickened 0.042 → 0.050 (18m
    // judge read the 2px neck as hairline). v7: terminus raised
    // 0.80 → 0.86 + radius 0.055 (the v6 18m judge saw NO head — the
    // arc crested over a too-low head column; a proud cock carries
    // his head HIGH, near the arc's root line)
    const npts: THREE.Vector3[] = [[0, 0.50, 0.15], [0, 0.70, 0.115], [0, 0.86, 0.15]].map(p => new THREE.Vector3(...p));
    const ncurve = new THREE.CatmullRomCurve3(npts);
    const neck = new THREE.Mesh(new THREE.TubeGeometry(ncurve, 8, 0.055, 8), mat(HACKLE, 0.92, 0));
    grp.add(neck);
    // v9: the HACKLE MANTLE — a flaring gold cape cone around the
    // neck's lower half (dead-front 18m judges read the bare tube as
    // a "hairline stem"; a cock's hackle is his broadest gold mass).
    // Top r 0.046 at y 0.80, base r 0.080 at y 0.50, riding the neck
    // curve's lower two-thirds, tilted with it.
    const mantle = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.080, 0.30, 9, 1), mat(HACKLE, 0.92, 0));
    mantle.position.set(0, 0.645, 0.135);
    mantle.rotation.x = 0.10;
    grp.add(mantle);

    // ---- head subtree (origin at the head — the Y-scan pivots here)
    const head = new THREE.Group();
    head.name = "roost_a_head";
    head.position.set(0, 0.86, 0.15);
    // skull: gold-brown, compact and proud
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(HACKLE, 0.92, 0));
    skull.scale.set(0.038, 0.044, 0.048);
    skull.position.set(0, 0.010, 0.006);
    head.add(skull);
    // red face plates at the cheeks (rooster facial skin is red)
    for (const side of [-1, 1]) {
        const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.032, 0.040), mat(COMB, 0.9, 0));
        cheek.position.set(side * 0.037, 0.000, 0.020);
        head.add(cheek);
    }
    // beak: horn-amber, proud of the face. v10: lengthened 0.055 →
    // 0.062 + widened 0.023 → 0.026 + darkened (the v5 amber shared the
    // hackle's exact tone — monochrome-blended, no silhouette break)
    const beak = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.019, 0.062), mat(BEAK, 0.85, 0.1));
    beak.position.set(0, -0.002, 0.058);
    head.add(beak);
    // wattles: the red pair under the beak (hen wattle law: below the
    // beak line, separated by height from any comb shape). v10: grown
    // (0.011×0.026 → 0.013×0.036) — the v9 encounter judge saw none
    for (const side of [-1, 1]) {
        const wattle = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 6), mat(COMB, 0.9, 0));
        wattle.scale.set(0.013, 0.036, 0.011);
        wattle.position.set(side * 0.017, -0.040, 0.028);
        head.add(wattle);
    }
    // eyes: near-black (v5: the dark-amber 0x38190a read as red dots
    // alongside the wattles — darken so eye/wattle classes separate)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0095, 6, 5), mat(0x1a0d05, 0.9, 0));
        eye.position.set(side * 0.034, 0.012, 0.028);
        head.add(eye);
    }

    // ---- THE COMB (nested keep-group — rides the scan AND nods):
    // tall, serrated, front-set. v5 (roostface FAIL: v4's 4 teeth
    // cresting 0.934 read subordinate to the sickle fountain behind
    // the head): 5 teeth, tallest 0.098 → crest ≈ 0.95, broader
    // 0.011 slabs — the comb must OWN the crown at encounter
    // distance. Serrated, not a smooth blade (that reads "dinosaur
    // fin"); five distinct teeth.
    const comb = new THREE.Group();
    comb.name = "roost_a_comb";
    comb.position.set(0, 0.046, 0.002);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.016, 0.078), mat(COMB, 0.9, 0));
    bar.position.set(0, 0.008, 0.0);
    comb.add(bar);
    const teeth = [
        { z: -0.030, h: 0.056 },
        { z: -0.015, h: 0.078 },
        { z: 0.000, h: 0.098 },
        { z: 0.015, h: 0.084 },
        { z: 0.030, h: 0.060 },
    ];
    for (const t of teeth) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.011, t.h, 0.014), mat(COMB, 0.9, 0));
        tooth.position.set(0, 0.016 + t.h / 2, t.z);
        comb.add(tooth);
    }
    head.add(comb);
    grp.add(head);

    // ---- THE SICKLES (keep-group at the rump): THE silhouette marker.
    // v3 (18m FAIL + pixel probe: the v2 arc spanned only ±0.10, ~7px
    // of crest above the backline — "tiny spike", the profile collapsed
    // to "small generic bird"): a display cock carries a BROAD FOUNTAIN
    // of arching sickles wrapping the flanks. 7 main sickles fanned
    // ±0.26 rad, longer chains (3 segments, root 0.30 steep, cresting
    // ~0.26 above the rump = arc top ~1.02) — the arc now breaks the
    // backline silhouette by ≥ 0.20m of dark green across ≥ 0.50m of
    // width, which at 18m is ~5×7px of solid marker, not a spike.
    // Each main sickle is a 3-segment chain with progressive cant
    // (fox-tail band law: connected masses carry; thin sticks read as
    // debris). Per-sickle length variation ±0.02 + tiny yaw: organic
    // arc, not fence pickets (turkey fan law). Alternate x-offsets
    // ±6mm so root overlap never z-fights.
    const tail = new THREE.Group();
    tail.name = "roost_a_tail";
    tail.position.set(0, 0.55, -0.28);
    // rump covert mass (the dark root all sickles rise from)
    const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 7), mat(WING_D, 0.92, 0));
    rump.scale.set(0.10, 0.085, 0.10);
    rump.position.set(0, 0.025, -0.030);
    tail.add(rump);
    const segChain = (phi: number, lens: number[], angs: number[], xoff: number, m: THREE.Material) => {
        // chained boxes in a VERTICAL PLANE rotated by phi about Y
        // through the tail root — the fountain fan. v2/v3 bug (decode
        // arithmetic caught it): the yaw entered only as a tiny roll
        // (rotation.y = yaw*0.15) and the span stayed ±0.10 — a spike,
        // not a fountain. Segment i rises at angle a_i from vertical,
        // in the plane whose "back" direction is back(phi) = (−sin phi,
        // 0, −cos phi); box orientation = qY(phi) · qX(−a) so the box's
        // long axis EXACTLY follows the chain advance direction
        // (−sin a·sin phi, cos a, −sin a·cos phi) — the v1 mismatch
        // class, now composed through quaternions.
        // v11 (tailprobe FAIL "angular elbow, square-cut tips"): the
        // angle sequence is now SMOOTH (5 steps of ~+14°, ending PAST
        // vertical so the tips droop) and the width taper is 0.72× —
        // a continuous accelerate-then-fall curve, not rise+flat.
        const qy = new THREE.Quaternion();
        const qx = new THREE.Quaternion();
        let cy = 0.0, cx = xoff, cz = -0.03, w = 0.028;
        for (let s = 0; s < lens.length; s++) {
            const L = lens[s], a = angs[s];
            qy.setFromAxisAngle(new THREE.Vector3(0, 1, 0), phi);
            qx.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -a);
            const seg = new THREE.Mesh(new THREE.BoxGeometry(w, L, 0.012), m);
            const d = { x: -Math.sin(a) * Math.sin(phi), y: Math.cos(a), z: -Math.sin(a) * Math.cos(phi) };
            seg.position.set(cx + (L / 2) * d.x, cy + (L / 2) * d.y, cz + (L / 2) * d.z);
            seg.quaternion.copy(qy).multiply(qx);
            tail.add(seg);
            cx += L * d.x; cy += L * d.y; cz += L * d.z; w *= 0.68;
        }
    };
    let tseed = 11;
    const trnd = () => (tseed = (tseed * 16807) % 2147483647) / 2147483647;
    for (let i = -3; i <= 3; i++) {
        const phi = i * 0.17;
        const dv = (trnd() - 0.5) * 0.02;
        segChain(phi, [0.135 + dv, 0.13, 0.12, 0.105, 0.085, 0.07], [0.36, 0.58, 0.80, 1.02, 1.24, 1.42], 0, sickleMat);
    }
    // lesser sickles (v12: LIGHTER bronze-green, half-step OFFSET phis —
    // seated BETWEEN the dark mains where they occlude the fan's see-
    // through gaps; v11's co-planar tier was invisible by construction)
    for (const i of [-5, -3, -1, 1, 3, 5]) {
        segChain(i * 0.17 / 2, [0.10, 0.095, 0.085, 0.075, 0.06], [0.40, 0.62, 0.84, 1.06, 1.28], 0.012, sickleLMat);
    }
    grp.add(tail);

    // ---- wing panels (keep-group, both sides — one comp ruffles the
    // pair symmetrically): dark chestnut only. v6: the sheen edge
    // riders DELETED (tailprobe judge: read as a stray detached blade
    // below the fan — decoration that reads as defect is defect,
    // turkey law f)
    const wings = new THREE.Group();
    wings.name = "roost_a_wing";
    wings.position.set(0, 0.36, -0.04);
    for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(WING_D, 0.92, 0));
        wing.scale.set(0.034, 0.155, 0.235);
        wing.position.set(side * 0.165, 0, 0);
        wing.rotation.x = -0.06;
        wings.add(wing);
    }
    grp.add(wings);

    return grp;
};

g.add(cock());

// ---- furniture (true-size build — final coords direct) ----
{
    // v8: the dunging-board roost DELETED — three judge rounds read the
    // low board as furniture competition ("bench" at 18m v6, "detached
    // ground line" at 25m v7-left); plan §17's own sketch: "a low
    // dunging-board roost or NOTHING (the yard exists)". The yard's
    // lived-in read rides the grain + straw (fauna-2 grain law).
    // grain specks at the feet
    let s = 29;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 6; k++) {
        const grit = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.005, 0.013), mat(GRIT, 0.9, 0));
        grit.position.set(-0.12 + rnd() * 0.34, 0.008, 0.16 + rnd() * 0.30);
        grit.rotation.y = rnd() * Math.PI;
        g.add(grit);
    }
    // v12: the straw wisps DELETED — flagged as "orange ground sliver /
    // stray plank" debris by three judge rounds (turkey law f: decor
    // that reads as defect is defect; the grain carries the lived-in)
}

mergeByMaterial(g, "rooster1");
writeFileSync("agents/arthur/assets/village_dress_rooster.glb", toGLB(g));
console.log("village_dress_rooster.glb —", g.children.length, "top-level");
