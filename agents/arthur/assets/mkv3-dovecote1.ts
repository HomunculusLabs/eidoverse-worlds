// mkv3-dovecote1.ts — fauna loop 16: THE ORCHARD DOVECOTE (fauna-15
// candidate row, build owed this tick). Village logic: the winter orchard
// pairs with doves — they pick fallen fruit beside the bee skeps,
// completing the orchard's living edge (proposal fauna-15).
//
// ONE entity (nx-dress-dovecote-001): a potence-style timber dovecote
// (post + gantry arm + leaning ladder + 4-square nesting box with entry
// holes + pyramidal cap, the village stile/timber family) carrying the
// 18m read (robin law: structure carries distance, doves reward approach)
// + THREE collared doves:
//   dove_a = PERCHED at the entry ledge (breathing + look-scan)
//   dove_b = ON THE ROOF RIDGE near the cap peak (breathing + look-scan)
//   dove_c = GROUND-FEEDING on fallen fruit (breathing + peck)
//
// Species law (collared dove, close read): pale warm-grey coat, THE black
// hindneck collar, dark eye, pinkish breast suffusion, slim body, small
// head, long tail. Identity at 18m = the DOVECOTE (perch + box + cap
// silhouette, timber on green); the doves are the encounter reward.
//
// Build laws: TRUE-SIZE, no group scales at all (fauna-13 — avoids the
// ×bake trap); neck-jointed heads with pitch composed BEFORE authoring
// (fauna-13 v3); furniture at final coords (no bake to displace);
// anchors dove_{a,b,c} + _head (6 KEEP targets, dove_ added to mergekit
// this tick). Motion lives in the placer (fauna16-place-dovecote.ts).
//
// Seat: (-50.5, 62.75) yaw 2.577 in commons-next — orchard-edge meadow,
// 1.85m clear of the espalier row OBB (worst solid), 0.60m film gap to
// lavender-0040's bed, 2.6m+ from orchard-0033 trunks (decoded trunk map),
// facing SE toward the stile/visitor approach.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// village timber family (stile)
const TIMB = 0x6f6432;   // post / rails / box planks
const STAKE = 0x5a5128;  // ladder rails / corner posts / cap
const DARK = 0x171310;   // entry holes (warm black)
// collared dove coat
const BODY = 0xb5aa9a;   // pale warm grey
const WING = 0x9d9284;   // wing seams, darker
const HEAD = 0xbcb1a2;   // head, slightly paler
const BREAST = 0xc7b3a5; // pinkish breast suffusion
const COLLAR = 0x2a2118; // THE black hindneck collar
const EYE = 0x0f0c09;
const BEAK = 0x4a3b30;
const FEET = 0xb98a6a;
// furniture
const APPLE1 = 0xc9b458; // ripe fallen fruit
const APPLE2 = 0xa8a44e; // greener one
const SEED = 0x3d3527;   // seed specks (grain law, fauna-2)
const WASH = 0xd8d4c8;   // whitewash streaks on the post
const PATCH = texMat("dovecote-trod", [0x5d5240, 0x524836, 0x4a4030], { rough: .98, scale: 1.2, weights: [2, 2, 1], seed: 1616 });

// ---- one collared dove ----
// role "perch"  = sitting on the entry ledge, horizontal, facing +z
//       "ridge"  = sitting on the cap ridge, horizontal, slight yaw
//       "ground" = pecking pose, neck extended down-forward at the fruit
const dove = (
    x: number, y: number, z: number, yaw: number, tag: "a" | "b" | "c",
    role: "perch" | "ridge" | "ground",
) => {
    const grp = new THREE.Group();
    grp.name = `dove_${tag}`;
    grp.position.set(x, y, z);
    grp.rotation.y = yaw;

    const peck = role === "ground";
    // body: slim, small-headed, long-tailed (species proportions)
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(peck ? BODY : BODY, 0.9, 0));
    body.scale.set(0.050, 0.052, 0.105);
    if (peck) body.rotation.x = 0.18; // slight forward pitch into the peck
    grp.add(body);
    // breast suffusion (front lower — the pinkish read at close range)
    const breast = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mat(BREAST, 0.9, 0));
    breast.scale.set(0.9, 0.85, 0.9);
    breast.position.set(0, -0.012, 0.062);
    grp.add(breast);
    // wing seams: two darker side patches over the body
    for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mat(WING, 0.9, 0));
        wing.scale.set(0.028, 0.038, 0.085);
        wing.position.set(side * 0.036, 0.008, -0.012);
        grp.add(wing);
    }
    // tail: long, slim, tapered — angled down behind (perched) or level (peck)
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.009, 0.115), mat(WING, 0.9, 0));
    tail.position.set(0, peck ? 0.012 : 0.004, -0.145);
    tail.rotation.x = peck ? 0.22 : 0.38; // tail rides up slightly relative to the pitch
    grp.add(tail);
    // feet (perch/ridge only — the ground dove's legs fold into the peck)
    if (!peck) {
        for (const side of [-1, 1]) {
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.030, 0.026), mat(FEET, 0.9, 0));
            foot.position.set(side * 0.016, -0.058, 0.012);
            grp.add(foot);
        }
    }

    // ---- head subtree: origin = neck joint (pendulum swings here) ----
    // pitch composed BEFORE authoring (fauna-13 v3 law):
    //   perch/ridge: joint at body front-top (+0.033y, +0.088z), head level
    //   ground:      joint at (+0.020y, +0.098z), pitched 0.85 rad down so
    //                the beak terminus lands at the fruit tops
    const head = new THREE.Group();
    head.name = `dove_${tag}_head`;
    const joint = peck ? [0, 0.020, 0.098] : [0, 0.033, 0.088];
    head.position.set(joint[0], joint[1], joint[2]);
    const pitch = peck ? 0.85 : 0.06;
    // skull
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.031, 9, 7), mat(HEAD, 0.9, 0));
    skull.scale.set(0.95, 0.95, 1.05);
    skull.position.set(0, 0.004, 0.018);
    head.add(skull);
    // THE COLLAR: black band on the HINDNECK at the skull-body seam (the
    // species marker). v3's torus was misrotated into a fin AND swallowed
    // by the seam (struct-52, owl facial-disc class). v4: proud seam-ring
    // — still read as a hairline GROOVE (collarprobe judge). v5: band
    // LENGTH 0.018 along the neck axis + radius 0.033 (crest ~8mm over
    // both cross-sections) + color warmed to dark plumage-brown (a black
    // void reads as a gap/shadow; brown reads as a marking).
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.018, 14, 1, true), mat(0x4a3d30, 0.9, 0));
    collar.rotation.x = Math.PI / 2; // band plane across the neck (axis = z)
    collar.position.set(0, 0.002, -0.001);
    head.add(collar);
    // beak
    const beak = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.008, 0.020), mat(BEAK, 0.9, 0));
    beak.position.set(0, -0.001, 0.046);
    head.add(beak);
    // eyes (dark, side-set)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 5, 4), mat(EYE, 0.9, 0));
        eye.position.set(side * 0.024, 0.008, 0.022);
        head.add(eye);
    }
    head.rotation.x = pitch;
    grp.add(head);
    // peck arithmetic (composed): ground joint (0,0.020,0.098) + pitch 0.85:
    //   beak terminus head-local (0,-0.001,0.056):
    //   y' = -0.001·cos.85 - 0.056·sin.85 = -0.0007-0.0421 = -0.0428
    //   z' = -0.001·sin.85 + 0.056·cos.85 = -0.0008+0.0370 = +0.0362
    //   → beak dove-local (0, -0.023, +0.134) — fruit tops must sit there.

    return grp;
};

// ---- the dovecote structure (village timber family) ----
{
    // main post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.066, 2.25, 8), mat(TIMB, 0.9, 0));
    post.position.set(0, 1.125, 0);
    g.add(post);
    // gantry arm (potence read) + diagonal brace
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.055, 0.055), mat(TIMB, 0.9, 0));
    arm.position.set(0.10, 2.06, 0);
    g.add(arm);
    const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 6), mat(STAKE, 0.9, 0));
    brace.position.set(0.175, 1.945, 0);
    brace.rotation.z = -0.51; // ends EMBED in post and arm underside (judge v1:
                              // a brace that only kisses its joints reads detached)
    g.add(brace);
    // leaning ladder (west side): foot (-0.95, 0, 0.10) → top (-0.18, 2.20, 0.06)
    // (rails inset 8mm each end — a square-cut rail corner at the exact foot
    // digs 8mm below ground under tilt: extent = (h/2)·cos + (w/2)·sin, the
    // tilted-cylinder law, pig law c kin)
    {
        const fx = -0.95, fy = 0, fz = 0.10, tx = -0.18, ty = 2.20, tz = 0.06;
        const dx = tx - fx, dy = ty - fy, dz = tz - fz;
        const len = Math.hypot(dx, dy, dz) - 0.016;
        const tilt = Math.atan2(dx, dy); // lean angle from vertical
        for (const side of [-1, 1]) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.048, len, 0.048), mat(STAKE, 0.9, 0));
            rail.position.set(fx + dx / 2, fy + dy / 2 + 0.004, fz + dz / 2 + side * 0.085);
            rail.rotation.z = -tilt;
            g.add(rail);
        }
        for (let k = 1; k <= 6; k++) {
            const t = k / 7;
            const rung = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.042, 0.185), mat(TIMB, 0.9, 0));
            rung.position.set(fx + dx * t, fy + dy * t, fz + dz * t);
            g.add(rung);
        }
    }
    // nesting box: 4-square, timber planks + corner posts + pyramidal cap
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.40, 0.46), mat(TIMB, 0.9, 0));
    box.position.set(0, 2.45, 0);
    g.add(box);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
        const corner = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.46, 0.062), mat(STAKE, 0.9, 0));
        corner.position.set(sx * 0.245, 2.45, sz * 0.215);
        g.add(corner);
    }
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.40, 0.26, 4), mat(STAKE, 0.9, 0));
    cap.rotation.y = Math.PI / 4;
    cap.position.set(0, 2.78, 0);
    g.add(cap);
    // entry holes: two on the front (+z) face, one on the east face — dark
    // discs proud 6mm (they must READ as holes at approach distance)
    for (const [hx, hy, hz, ry] of [[-0.12, 2.50, 0.235, 0], [0.12, 2.50, 0.235, 0], [0.265, 2.50, 0, Math.PI / 2]] as const) {
        const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.012, 10), mat(DARK, 0.95, 0));
        hole.rotation.x = Math.PI / 2;
        hole.rotation.y = ry;
        hole.position.set(hx, hy, hz);
        if (ry) { hole.position.set(0.265, 2.50, 0); hole.rotation.z = Math.PI / 2; }
        g.add(hole);
    }
    // entry LEDGE under the front-left hole (the perch shelf)
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.030, 0.13), mat(TIMB, 0.9, 0));
    ledge.position.set(-0.12, 2.255, 0.285);
    g.add(ledge);
    // whitewash: long drips on the box front face, falling from under the
    // entry ledge where dove_a perches (v2 judge: free-floating specks on
    // the pole face read as artifacts; streaks that START at the perch
    // read as drips — physically true, the dove sits right above them)
    for (const [wx, wy, rot] of [[-0.165, 2.16, 0.06], [-0.075, 2.14, -0.09]] as const) {
        const streak = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.13, 0.006), mat(WASH, 0.95, 0));
        streak.position.set(wx, wy, 0.232);
        streak.rotation.x = rot;
        g.add(streak);
    }
}

// ---- the doves (true-size; positions per the arithmetic above) ----
g.add(dove(-0.12, 2.335, 0.305, 0.10, "a", "perch"));   // on the entry ledge
g.add(dove(0.045, 2.905, -0.030, -0.14, "b", "ridge")); // on the cap ridge
g.add(dove(0.46, 0.085, 0.88, 0.42, "c", "ground"));    // ground-feeding

// ---- furniture (final coords; no bake ran) ----
{
    // fallen fruit: 6 windfall apples around the ground dove's peck arc —
    // the winter-orchard signal (doves pick fallen fruit)
    const fruit: Array<[number, number, number, number]> = [
        [0.50, 0.034, 1.010, 0.038], [0.585, 0.030, 0.905, 0.032],
        [0.375, 0.032, 0.985, 0.034], [0.60, 0.036, 1.06, 0.040],
        [0.30, 0.028, 0.86, 0.030], [0.52, 0.026, 1.13, 0.032],
    ];
    fruit.forEach(([fx, fy, fz, r], i) => {
        const apple = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat(i === 4 || i === 5 ? APPLE2 : APPLE1, 0.85, 0));
        apple.scale.set(1, 0.92, 1);
        apple.position.set(fx, fy, fz);
        g.add(apple);
    });
    // seed specks at the peck point (grain law)
    let s = 61;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 8; k++) {
        const speck = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.005, 0.007), mat(SEED, 0.95, 0));
        speck.position.set(0.44 + rnd() * 0.16, 0.004, 0.94 + rnd() * 0.18);
        speck.rotation.y = rnd() * Math.PI;
        g.add(speck);
    }
    // worn patch under the feeding zone (small trodden disc)
    const patch = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.34, 0.012, 18), PATCH);
    patch.position.set(0.48, 0.005, 0.95);
    g.add(patch);
}

mergeByMaterial(g, "dovecote1");
writeFileSync("agents/arthur/assets/village_dress_dovecote.glb", toGLB(g));
console.log("village_dress_dovecote.glb —", g.children.length, "top-level");
