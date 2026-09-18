// mkv3-donkey1.ts — fauna loop 23: THE DONKEY (FAUNA-PLAN queue head,
// proposed fauna-22). Village logic: every flock now has its keeper
// (cat/coop, owl+horses/livery, geese+ducks+robin/pool, sheep/dyehouse,
// pig/kiln, doves/orchard, cow/dairy) — but the WORKING guardian of
// Bill's own homestead language, the one that guards the flocks, was
// missing. The donkey is the classic guardian companion of exactly the
// flocks this village pastures (real-world practice: guardians of sheep
// AND goats). It stands on the SW meadow within sight of the sheep fold.
//
// A standard-donkey pair as ONE entity (nx-dress-donkey-001):
//   donk_a = WATCH (standing, neck up, slow head-scan, ears on the
//            listening sweep — the guardian signature)
//   donk_b = GRAZER (neck dipped, muzzle in straw wisps)
// Species law (18m identity): grey-dun mass 0x9a8f82 ~1.04m shoulder ×
// 1.55 long — stockier and SHORTER than the cow, LONGER-EARED than any
// villager — THE marker: upright ears ~0.26 tall on a 0.16 skull (bigger
// relative to head than any animal yet placed) + the shoulder cross
// (dark dorsal stripe + wither bar, the breed marker) + pale muzzle band
// + dark mane serration + lion-tail with dark tuft. Lateral tail swish
// (shorse/cow law).
//
// Build laws exercised: TRUE-SIZE authored directly (fauna-13/19/21 law
// — no group scales, no ×bake, furniture at final coords); necks as ONE
// TubeGeometry per CatmullRom curve (fauna-11 law c) with heads RE-SEATED
// on the tube terminus (fauna-11 v6 law); grazer pitch composed BEFORE
// authoring the straw tie (fauna-13 v3 law): head joint (0, 0.44, 0.86)
// pitch 0.95 → nose terminus ≈ donk-local (0, 0.26, 1.28) → entity ≈
// (−0.62, 0.26, 1.28) — the straw wisps meet it there. Anchors
// (KEEP(donk_) added to mergekit this tick — collision-proof prefix,
// no other name matches): donk_a/_head/_ears/_tail, donk_b/_head/_tail
// — 7 motion targets, 7 comps. Motion lives in the placer
// (fauna23-place-donkey.ts).
//
// Seat (candidate — sweep at place tick): SW meadow E/NE of the sheep
// fold, guard point ~(−23.5, −33.5), yaw −1.11 facing the fold (the
// guardian watches its flock; lean-to shelters the ESE weather side).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law; tex-23 freed the animals)
const DUN = 0xa69c90;    // grey-dun coat (v7: lightened from 0x9a8f82 —
                         // the shade-side flank read near-black and
                         // swallowed the cross; keeps the cool grey-dun
                         // cast distinct from cow fawn 0xa9825a)
const DUN_D = 0x7e746a;  // darker dun — lower legs, muzzle shading
const CROSS = 0x3a332c;  // the shoulder cross + mane + tail tuft (v6:
                         // darkened from 0x544c43 — the v5 crest boxes
                         // sun-flattened into highlights, judge: "uniform")
const PALE = 0xd8cfc0;   // pale muzzle band + ear inner faces
const HOOF = 0x241d16;   // dark hoof line
const EYE = 0x0d0a07;
const TIMB = 0x6f6432;   // shelter rails (stile family)
const STAKE = 0x5a5128;  // shelter posts (second timber value)
const STRAW = 0xe6c35c;  // straw wisps (fauna-4 golden-straw law)
// trodden pad: TROD-family texMat (fox-den/pigsty/cowpad family, own seed)
const PAD_M = texMat("donk-pad", [0x6a5940, 0x5d4e38, 0x514430], { rough: .98, scale: 1.6, weights: [2, 2, 1], seed: 2323 });

// ---- one standard donkey ----
// role: "watch"  = standing alert, neck up ~40°, slow head-scan + ear sweep
//       "graze"  = neck dipped, muzzle in straw wisps
const donk = (
    x: number, z: number, yaw: number, tag: "a" | "b",
    role: "watch" | "graze",
) => {
    const grp = new THREE.Group();
    grp.name = `donk_${tag}`;
    grp.position.set(x, 0, z);
    grp.rotation.y = yaw;

    // ---- barrel: v4 LONGER + FLATTER (judge v3: "egg-shaped silhouette
    // reads sheep — donkeys need a flatter topline and length"): belly
    // 0.39, back 1.01, length half 0.76 — the horizontal donkey read ----
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 11), mat(DUN, 0.92, 0));
    hull.scale.set(0.28, 0.31, 0.76);
    hull.position.set(0, 0.70, -0.02);
    grp.add(hull);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(DUN, 0.92, 0));
    shoulder.scale.set(0.26, 0.30, 0.26);
    shoulder.position.set(0, 0.71, 0.52);
    grp.add(shoulder);
    const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(DUN, 0.92, 0));
    rump.scale.set(0.27, 0.30, 0.30);
    rump.position.set(0, 0.71, -0.54);
    grp.add(rump);

    // ---- THE SHOULDER CROSS (breed marker): dark dorsal stripe running
    // the topline + a wither bar across the shoulders. v6: FLANK-STEPPED
    // (judge v5: "uniform mid-brown capsules" — top-mounted crest boxes
    // sun-flatten into highlights; the SIDE faces carry the read in
    // profile): 3 pairs of side plates at the hull flank y 0.83, each
    // 0.030 proud of the surface, + the dorsal bar at the withers. ----
    for (const [cz, cy] of [[0.30, 0.995], [0.00, 1.022], [-0.32, 0.998]] as const) {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(0.100, 0.030, 0.34), mat(CROSS, 0.92, 0));
        seg.position.set(0, cy, cz);
        grp.add(seg);
        // flank plates: one per side at hull half-width − 0.015 embed.
        // v7: TALLER (0.050 → 0.11, riding the flank curve y 0.78..0.89)
        // and prouder — the plate EDGES catch light on the shade side
        // where a top crest cannot (fauna-7 fill law, applied as geometry)
        for (const side of [-1, 1]) {
            const yr = (cy - 0.70) / 0.31;
            const hw = 0.28 * Math.sqrt(Math.max(0, 1 - yr * yr)) - 0.015;
            const plate = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.11, 0.34), mat(CROSS, 0.92, 0));
            plate.position.set(side * hw, cy - 0.10, cz);
            grp.add(plate);
        }
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.030, 0.070), mat(CROSS, 0.92, 0));
    bar.position.set(0, 0.992, 0.36);
    grp.add(bar);

    // ---- legs: slender grey-dun with dark hooves (donkey legs are fine
    // for their barrel). Feet exact on ground. v4 stance tracks the
    // longer barrel (front 0.46, back −0.58). ----
    for (const [sx, sz] of [[-0.16, 0.46], [0.16, 0.46], [-0.18, -0.58], [0.18, -0.58]] as const) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.032, 0.36, 7), mat(DUN, 0.92, 0));
        leg.position.set(sx, 0.18, sz);
        grp.add(leg);
        const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.070, 0.045, 0.085), mat(HOOF, 0.9, 0));
        hoof.position.set(sx, 0.023, sz + 0.006);
        grp.add(hoof);
    }

    // ---- neck: ONE TubeGeometry along a CatmullRom curve (fauna-11 law c).
    // Head group re-seated ON the terminus (fauna-11 v6 law). v3: watch neck
    // raised steeper (terminus 1.26 — the head must clear the back line to
    // read at 18m, judge v2: "head merged into body silhouette"); grazer
    // dip deepened (terminus 0.40, head pitch 0.95 → nose beds ~9cm into
    // the heap crest — shorse muzzle law). ----
    const pts: THREE.Vector3[] = role === "watch"
        ? [[0, 0.92, 0.40], [0, 1.22, 0.62], [0, 1.34, 0.56]].map(p => new THREE.Vector3(...p))
        : [[0, 0.90, 0.40], [0, 0.58, 0.68], [0, 0.36, 0.90]].map(p => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(pts);
    const neck = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, role === "watch" ? 0.098 : 0.092, 10), mat(DUN, 0.92, 0));
    grp.add(neck);
    // dark mane serration along the crest (the upright row — species-true;
    // 4 boxes following the curve, proud on top)
    for (const t of [0.15, 0.38, 0.61, 0.84]) {
        const p = curve.getPoint(t);
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.075, 0.085), mat(CROSS, 0.92, 0));
        c.position.set(p.x, p.y + (role === "watch" ? 0.105 : 0.098), p.z);
        c.rotation.x = role === "watch" ? -0.42 : 0.50;
        grp.add(c);
    }
    // wither mane continuation onto the back (2 segments behind the neck
    // base) — v5 y re-derived for the flatter v4 back (z 0.30 → 1.007,
    // z 0.18 → 1.019; the old 1.075/1.085 floated 9cm clear)
    for (const [wz, wy] of [[0.30, 1.007], [0.18, 1.019]] as const) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.055, 0.10), mat(CROSS, 0.92, 0));
        w.position.set(0, wy, wz);
        w.rotation.x = -0.85; // lying close along the back
        grp.add(w);
    }

    // ---- head subtree: origin = the neck terminus (pendulums swing here).
    // Throat weld law (fauna-21 v2): head buried to overlap the terminus,
    // jaw extended rearward, dun blend sphere AT the junction. v5: grazer
    // head offset −0.03y +0.06z (was +0.10 — pulls the skull back to bury
    // into the tube end, killing the profile seam the judge saw). ----
    const terminus = pts[pts.length - 1];
    const head = new THREE.Group();
    head.name = `donk_${tag}_head`;
    // v4: watch head pushed FORWARD (+0.04z — the muzzle must project
    // PAST the chest line, judge v3: "head merged into body"); grazer
    // unchanged (beds into the heap).
    head.position.copy(terminus).add(new THREE.Vector3(0, role === "watch" ? 0.00 : -0.03, role === "watch" ? 0.04 : 0.06));
    head.rotation.x = role === "watch" ? 0.30 : 0.95; // +α pitches muzzle down
    // junction blend (dun sphere bridging jaw-rear to neck-top)
    const blend = new THREE.Mesh(new THREE.SphereGeometry(0.075, 9, 7), mat(DUN, 0.92, 0));
    blend.scale.set(0.75, 0.75, 1.1);
    blend.position.set(0, -0.02, -0.04);
    head.add(blend);
    // skull + jaw (slender, straight bridge — the donkey's roman profile)
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(DUN, 0.92, 0));
    skull.scale.set(0.078, 0.088, 0.16);
    skull.position.set(0, 0.015, 0.06);
    head.add(skull);
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mat(DUN, 0.92, 0));
    jaw.scale.set(0.066, 0.078, 0.11);
    jaw.position.set(0, -0.045, 0.0);
    head.add(jaw);
    // muzzle: tapered cylinder, nose-down 0.22 from the skull axis
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.058, 0.17, 8), mat(DUN, 0.92, 0));
    muzzle.rotation.x = Math.PI / 2 + 0.22;
    muzzle.position.set(0, -0.02, 0.18);
    head.add(muzzle);
    // pale muzzle band (the mealy mouth — donkey marker at encounter
    // distance): box cresting the muzzle front ~6mm, 2.2× band law
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.062, 0.030), mat(PALE, 0.92, 0));
    band.position.set(0, -0.028, 0.252);
    band.rotation.x = 0.22;
    head.add(band);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), mat(CROSS, 0.9, 0));
    nose.scale.set(1, 0.85, 0.6);
    nose.position.set(0, -0.040, 0.282);
    head.add(nose);
    // eyes: big dark, side-set (the kind donkey eye at encounter distance)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 5), mat(EYE, 0.9, 0));
        eye.position.set(side * 0.074, 0.042, 0.068);
        head.add(eye);
    }
    // ---- THE EARS (species marker): upright, tall — v3: 0.34 tall × 0.058
    // wide BOLD slabs (judge v2: "ears barely registering... ambiguous
    // nubs" — the 18m silhouette needs mass, not lines), on a 0.16 skull —
    // bigger relative to head than any animal yet placed. Root INSIDE the
    // skull, tips slightly canted outward, pale inner face angled to catch
    // light (fauna-7 fill law). The WATCH pair rides its own keep-group
    // (the listening-sweep comp); the grazer's merge into the head. ----
    const earGrp = new THREE.Group();
    if (role === "watch") {
        earGrp.name = `donk_${tag}_ears`;
        earGrp.position.set(0, 0.060, 0.010); // skull crown
        head.add(earGrp);
    }
    for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.34, 0.030), mat(DUN, 0.92, 0));
        ear.position.set(side * 0.052, 0.195, 0.006);
        ear.rotation.z = side * -0.05; // v6: cant halved (judge v5: "crossed
                                       // sticks forming an X" — ears stay
                                       // near-parallel uprights)
        ear.rotation.x = -0.06;        // tips a touch forward
        (role === "watch" ? earGrp : head).add(ear);
        const inner = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.28, 0.034), mat(PALE, 0.92, 0));
        inner.position.set(side * 0.052, 0.195, 0.014);
        inner.rotation.z = side * -0.05;
        inner.rotation.x = -0.6;       // inner face angled to catch light
        (role === "watch" ? earGrp : head).add(inner);
    }
    grp.add(head);

    // ---- tail subtree: the LION TAIL — short dock + thin rope cascade +
    // dark tuft (distinct from every horse/cow tail in the village).
    // v5: rope THICKER (0.020 mid, was 0.012 — a 1.2cm line fused into
    // the rump silhouette) + tuft BIGGER (0.052 sphere) + tail root moved
    // AFT (−0.84 z, was −0.78 — the rope must hang BEHIND the rump plane
    // in profile, not beside it). Lateral swish comp axis [0,0,1] —
    // z-band fixed (shorse/cow law). ----
    const tail = new THREE.Group();
    tail.name = `donk_${tag}_tail`;
    tail.position.set(0, 0.94, -0.84);
    const dock = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), mat(DUN, 0.92, 0));
    dock.scale.set(1, 0.85, 1);
    tail.add(dock);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.026, 0.44, 8), mat(DUN_D, 0.92, 0));
    // direction (0, -0.95, -0.31): rotation.x = -(pi - 0.32) = -2.82
    rope.rotation.x = -2.82;
    rope.position.set(0, -0.20, -0.065);
    tail.add(rope);
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 6), mat(CROSS, 0.92, 0));
    tuft.scale.set(1, 1.5, 1);
    tuft.position.set(0, -0.41, -0.135);
    tail.add(tuft);
    grp.add(tail);

    return grp;
};

// ---- the pair (entity-local: both face +z; entity yaw turns the group
// toward the fold). v3: pair SEPARATED (judge v2: "bodies appear to
// touch") — watch NE-of-center alert; grazer SW, muzzle in straw. ----
g.add(donk(0.62, 0.06, 0.12, "a", "watch"));   // v6: watch +x (judge v5:
                                               // "one body, two heads" —
                                               // the pair separates)
g.add(donk(-0.55, 0.34, -0.20, "b", "graze")); // grazer, muzzle down

// ---- furniture (true-size build — no bake, final coords direct) ----
{
    // ---- lean-to field shelter BEHIND the pair (local −z; with the seat
    // yaw it stands on the weather side): 2 front posts 1.30 + 2 back
    // posts 1.70 + a pitched roof slab + 2 back rails (the closed side).
    // Roof: slab (1.9 × 0.045 × 0.78) at (0, 1.51, −1.50) rotation.x
    // 0.588 — front edge lands on the front post tops, back edge on the
    // back post tops (arithmetic composed, fauna-19 law b). ----
    for (const [px, pz, ph] of [[-0.75, -1.20, 1.30], [0.75, -1.20, 1.30], [-0.75, -1.80, 1.70], [0.75, -1.80, 1.70]] as const) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.036, ph, 7), mat(STAKE, 0.9, 0));
        post.position.set(px, ph / 2, pz);
        g.add(post);
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.045, 0.78), mat(TIMB, 0.9, 0));
    roof.position.set(0, 1.51, -1.50);
    roof.rotation.x = 0.588;
    g.add(roof);
    for (const ry of [0.55, 1.00]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.07, 0.04), mat(TIMB, 0.9, 0));
        rail.position.set(0, ry, -1.78);
        g.add(rail);
    }
    // trodden pad (TROD-family texMat, ellipse under the pair + approach)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.014, 24), PAD_M);
    pad.scale.set(1.45, 1.0, 1.30);
    pad.position.set(0.05, 0.006, -0.25);
    g.add(pad);
    // graze-heap: a compact straw line meeting the grazer muzzle (fauna-19
    // law b — the composed nose hovers 15cm over flat wisps otherwise).
    // v5 re-centered under the v5 composed nose (grazer head offset +0.06z
    // → nose entity ≈ (−0.80, 0.10, 1.42)) and REBALANCED (judge v4: the
    // big lump SWALLOWED the nose — pig spoil law inverted): big lump
    // moved −0.10 x AFT of the nose line, small forward lumps crest 0.075
    // to kiss the muzzle band bottom; nothing buries the pale marker.
    for (const [hx, hz, hr, hy] of [[-0.90, 1.34, 0.13, 0.085], [-0.70, 1.44, 0.15, 0.10], [-0.58, 1.36, 0.11, 0.075]] as const) {
        const lump = new THREE.Mesh(new THREE.SphereGeometry(hr, 9, 7), mat(STRAW, 0.95, 0));
        lump.scale.set(1.3, 0.65, 0.9);
        lump.position.set(hx, hy, hz);
        g.add(lump);
    }
    // straw scatter: wisps AT the grazer's composed muzzle (entity ≈
    // (−0.62, 0.26, 1.28) — the tie), inside the shelter, and mid-pad
    // (golden 0xe6c35c — fauna-4 law)
    let s = 37;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 11; k++) {
        const wisp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.005, 0.022), mat(STRAW, 0.95, 0));
        const atMuzzle = k < 4, inShelter = k >= 4 && k < 7;
        wisp.position.set(
            atMuzzle ? -0.74 + rnd() * 0.26 : inShelter ? -0.55 + rnd() * 1.1 : -0.55 + rnd() * 1.2,
            0.012,
            atMuzzle ? 1.14 + rnd() * 0.34 : inShelter ? -1.32 + rnd() * 0.40 : -0.35 + rnd() * 0.85,
        );
        wisp.rotation.y = rnd() * Math.PI;
        g.add(wisp);
    }
}

mergeByMaterial(g, "donkey1");
writeFileSync("agents/arthur/assets/village_dress_donkeys.glb", toGLB(g));
console.log("village_dress_donkeys.glb —", g.children.length, "top-level");
