// mkv3-peacock1.ts — fauna loop 25: THE PEACOCK (FAUNA-PLAN queue head,
// proposed fauna-24). Village logic: the barnyard is complete and the
// one SHOW bird of the traditional village menagerie was missing — the
// peacock. Show birds belong where visitors stroll: the inn front lawn
// (classic English peacock lawn) or the orchard-edge meadow by the
// dovecote — census-backed sweep at the place tick.
//
// ONE entity (nx-dress-peacock-001), TRUE-SIZE authored directly
// (fauna-13/19/21/23/24 law — no group scales, no bake, furniture at
// final coords): a single cock in full display.
//
// Species law (18m identity): the marker is NOT a vertical banded fan
// (the turkey owns that read) — the TRAIN trails BEHIND and ABOVE in a
// sweeping TILTED DOME of 21 plumes (~1.6m wide, cresting ~1.5m), dark
// green-bronze mass with a gold-and-teal eyespot fringe, behind the
// ROYAL-BLUE body 0x2a5d8c. On a low stone plinth (the show-bird
// pedestal — silhouette lifted above the grass line).
//
// Anchors (KEEP(peacock_) added to mergekit this tick — collision-proof
// prefix): peacock (bob), peacock_head (Y-scan), peacock_crest (nod,
// nested in head so it rides the scan), peacock_train (slow Y sway —
// the display breathes, turkey fan law), peacock_wings (strut-shiver),
// peacock_tail (the true-tail props flick) — 6 comp targets, 6 comps.
// Motion payloads live in the placer (fauna25-place-peacock.ts).
//
// Furniture: mottled stone plinth (r 0.42 + foot ring), step stone, two
// molted eyespot feathers on the grass (the iconic lawn detail — gold +
// teal carries where turkey's dark molted specks read as shards).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law; tex-23 freed the animals)
const BLUE = 0x2f659e;     // royal blue body+neck (v5: lifted from 0x2a5d8c —
                           // 18m judge read it "dark/navy"; brighter keeps
                           // the royal hue and the read)
const BLUE_D = 0x255582;   // crest stems, wing seams (the shade tone)
const TRAIN = 0x3d6b4f;    // train plumes, mantle (plan-pinned green-bronze)
const GOLD = 0xc9a24a;     // eyespot ring (the fringe that dapples at 18m)
const EYE = 0x1f8fa8;      // eyespot disk + crest dots (plan-pinned teal)
// v6 glint law (polish-274 moonlit-read kin): an eyespot's iridescence
// reads in shade — faint same-hue emissive on the train's gold/teal so
// the dapple survives the train's own shadow (pixel probe: right-half
// gold 4px vs left 705px under the single rig sun; in-world the dome
// self-shades exactly so). Day reads as glint, not glow. v7: lenses
// enlarged + glint lifted to 0.75 — the shadow-side arc (world −x,
// screen right from the rear vantage) still read "bare sticks" at 0.5.
const GOLD_E = new THREE.MeshStandardMaterial({ color: GOLD, emissive: new THREE.Color(0x6a5218), emissiveIntensity: 0.75, roughness: 0.85 });
const EYE_E = new THREE.MeshStandardMaterial({ color: EYE, emissive: new THREE.Color(0x0e4a56), emissiveIntensity: 0.75, roughness: 0.85 });
const WHITE = 0xe8e4d8;    // face patches (peafowl white surrounds)
const DARK = 0x0d0a07;     // beak + eyes
const LEG = 0x9a8a72;      // gray-brown legs
const PROP = 0x6a5644;     // true-tail props (stiff brown)
const SHAFT = 0x4a6b52;    // (retired v5 — molted-feather shafts deleted)
// plinth + step stone: mottled stone texMat (own seed)
const STONE_M = texMat("peacock-plinth", [0x8f8a7c, 0x7c776a, 0x6b665a], { rough: .95, scale: 1.2, weights: [2, 2, 1], seed: 2525 });

const UP = new THREE.Vector3(0, 1, 0);

// seeded LCG (deterministic rebuilds)
let sseed = 97;
const rnd = () => (sseed = (sseed * 16807) % 2147483647) / 2147483647;

// ---- THE BIRD (on the plinth: bird-local y0 = plinth top) ----
const bird = () => {
    const grp = new THREE.Group();
    grp.name = "peacock";
    grp.position.set(0, 0.135, 0.05); // plinth top 0.1325 — feet embed 2.5mm

    // body: deep-blue hull + proud breast (two masses)
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 11), mat(BLUE, 0.9, 0));
    hull.scale.set(0.13, 0.15, 0.22);
    hull.position.set(0, 0.36, 0.06);
    grp.add(hull);
    const breast = new THREE.Mesh(new THREE.SphereGeometry(1, 11, 9), mat(BLUE, 0.9, 0));
    breast.scale.set(0.11, 0.14, 0.10);
    breast.position.set(0, 0.33, 0.22);
    grp.add(breast);

    // legs + feet (gray-brown; feet spread wide — the steady strut stance)
    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.012, 0.24, 7), mat(LEG, 0.9, 0));
        leg.position.set(side * 0.06, 0.12, 0.10);
        grp.add(leg);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.014, 0.11), mat(LEG, 0.9, 0));
        foot.position.set(side * 0.06, 0.007, 0.13);
        grp.add(foot);
    }

    // neck: ONE smooth TubeGeometry up-and-slightly-forward (fauna-11 law c)
    const npts: THREE.Vector3[] = [[0, 0.42, 0.20], [0, 0.55, 0.27], [0, 0.66, 0.30]].map(p => new THREE.Vector3(...p));
    const ncurve = new THREE.CatmullRomCurve3(npts);
    const neck = new THREE.Mesh(new THREE.TubeGeometry(ncurve, 8, 0.030, 9), mat(BLUE, 0.9, 0));
    grp.add(neck);

    // ---- head subtree (scans here): crest nested INSIDE so it rides ----
    const head = new THREE.Group();
    head.name = "peacock_head";
    head.position.set(0, 0.67, 0.30);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(BLUE, 0.9, 0));
    skull.scale.set(0.042, 0.042, 0.048);
    skull.position.set(0, 0.005, 0.005);
    head.add(skull);
    // beak: dark, proud of the skull front (0.039..0.085 vs face 0.053)
    const beak = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.013, 0.046), mat(DARK, 0.9, 0));
    beak.position.set(0, 0.000, 0.062);
    head.add(beak);
    // eyes + white patches: ellipsoid-test proud placement (struct-52 law —
    // eye (±0.032,0.014,0.032) → 1.135 proud ~4mm; patch lower-front → 1.04)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.010, 6, 5), mat(DARK, 0.9, 0));
        eye.position.set(side * 0.032, 0.014, 0.032);
        head.add(eye);
        const patch = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 5), mat(WHITE, 0.92, 0));
        patch.scale.set(0.007, 0.013, 0.017);
        patch.position.set(side * 0.029, -0.002, 0.036);
        head.add(patch);
    }
    // crest: 7 fan-stems fanned LATERALLY over the crown (v8 — v1's
    // fore-aft fan projected to a single stem column from the front,
    // judge: "lone antenna"; peafowl crests spread side-to-side), each
    // tipped with a teal dot — THE peacock head marker at encounter
    // distance. Nested keep-group.
    const crest = new THREE.Group();
    crest.name = "peacock_crest";
    crest.position.set(0, 0.045, 0);
    for (let k = -3; k <= 3; k++) {
        const a = k * 0.28; // ±0.84 rad = ±48° lateral fan
        // lateral spread + slight forward lean (all stems visible fore AND side)
        const dir = new THREE.Vector3(Math.sin(a) * 0.98, Math.cos(a) * 0.90, Math.cos(a) * 0.32).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.055, 5), mat(BLUE_D, 0.9, 0));
        stem.quaternion.copy(q);
        stem.position.copy(dir.clone().multiplyScalar(0.0275));
        crest.add(stem);
        const dot = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 5), mat(EYE, 0.85, 0));
        dot.scale.set(0.009, 0.006, 0.009);
        dot.position.copy(dir.clone().multiplyScalar(0.056));
        crest.add(dot);
    }
    head.add(crest);
    grp.add(head);

    // ---- wings (folded, strut-shiver): blue panels + bronze-green mantle
    const wings = new THREE.Group();
    wings.name = "peacock_wings";
    wings.position.set(0, 0.36, 0.02);
    for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(BLUE, 0.9, 0));
        wing.scale.set(0.035, 0.13, 0.19);
        wing.position.set(side * 0.125, 0, 0);
        wings.add(wing);
        const mantle = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 7), mat(TRAIN, 0.9, 0));
        mantle.scale.set(0.038, 0.07, 0.10);
        mantle.position.set(side * 0.128, 0.03, -0.07);
        wings.add(mantle);
    }
    grp.add(wings);

    // ---- true tail: the stiff brown props that hold the train (visible
    // at the train base — species-true, and the flick comp's target)
    const tail = new THREE.Group();
    tail.name = "peacock_tail";
    tail.position.set(0, 0.40, -0.12);
    for (let k = -2; k <= 2; k++) {
        const a = k * 0.16;
        const dir = new THREE.Vector3(0, Math.sin(0.62), -Math.cos(0.62) * Math.cos(a));
        dir.x = Math.sin(a) * Math.cos(0.62);
        dir.normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
        const prop = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.30, 0.020), mat(PROP, 0.92, 0));
        prop.quaternion.copy(q);
        prop.position.copy(dir.clone().multiplyScalar(0.15));
        tail.add(prop);
    }
    grp.add(tail);

    // ---- THE TRAIN (species marker): a TILTED DOME of 21 plumes rooted
    // at the rear, sweeping BEHIND and ABOVE. NOT a vertical arc fan
    // (turkey's read) — center plumes rise at 60°, edge plumes spread to
    // ±95° azimuth at 24° elevation: a 1.6m-wide halo over the bird.
    // Each plume: dark-green shaft + gold-ringed teal EYESPOT cresting
    // the tip (plate stack proud along the shaft — reads from both sides,
    // shorse blaze law). Per-plume length variation + roll (organic arc,
    // not fence pickets — turkey v1 law).
    const train = new THREE.Group();
    train.name = "peacock_train";
    train.position.set(0, 0.50, -0.16);
    const PHI_MAX = 95 * Math.PI / 180;
    for (let i = -10; i <= 10; i++) {
        const phi = i * (PHI_MAX / 10);
        const th = (24 + 36 * Math.cos(Math.abs(phi) / PHI_MAX * Math.PI / 2)) * Math.PI / 180;
        const dir = new THREE.Vector3(
            Math.sin(phi) * Math.cos(th),
            Math.sin(th),
            -Math.cos(phi) * Math.cos(th));
        const lv = 0.95 + 0.22 * Math.cos(Math.abs(phi) / PHI_MAX * Math.PI / 2) + (rnd() - 0.5) * 0.06;
        const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
        const roll = new THREE.Quaternion().setFromAxisAngle(UP, (rnd() - 0.5) * 0.3);
        const fq = q.clone().multiply(roll); // roll about local Y (= shaft dir)
        const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.024, lv, 0.016), mat(TRAIN, 0.9, 0));
        shaft.quaternion.copy(fq);
        shaft.position.copy(dir.clone().multiplyScalar(lv / 2));
        train.add(shaft);
        // eyespot v5: nested SPHERE-LENSES stacked outward along the shaft
        // (fq maps local +Y → shaft dir). A flat plate reads only from its
        // face side — the trainprobe camera saw dark backs across the whole
        // right side (turkey band law); spheres have no back. Dark fringe
        // lens backs the gold ring, teal disk crests it — all-angle read.
        const eye = new THREE.Group();
        eye.quaternion.copy(fq);
        eye.position.copy(dir.clone().multiplyScalar(lv));
        const fringe = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mat(TRAIN, 0.9, 0));
        fringe.scale.set(0.070, 0.013, 0.056);
        fringe.position.set(0, 0.004, 0);
        eye.add(fringe);
        const ring = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), GOLD_E);
        ring.scale.set(0.062, 0.016, 0.050);
        ring.position.set(0, 0.013, 0);
        eye.add(ring);
        const disk = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), EYE_E);
        disk.scale.set(0.036, 0.013, 0.030);
        disk.position.set(0, 0.023, 0);
        eye.add(disk);
        train.add(eye);
    }
    grp.add(train);

    return grp;
};

g.add(bird());

// ---- furniture (true-size build — final coords) ----
{
    // plinth: foot ring + drum (mottled stone), bird stands on top
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.035, 20), STONE_M);
    foot.position.set(0, 0.0175, 0);
    g.add(foot);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.095, 20), STONE_M);
    drum.position.set(0, 0.085, 0);
    g.add(drum);
    // step stone (the hop-down, E-front of the plinth toward the lawn)
    const step = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.175, 0.05, 12), STONE_M);
    step.position.set(0.58, 0.025, 0.32);
    g.add(step);
    // v6: the ground eyespot-lens ring is DELETED — the judge read the
    // molted-plume dressing as "detached eyespot discs littering the
    // grass/plinth" (turkey law f: decoration that reads as defect is
    // defect). The show bird's lawn read carries from the train alone.
}

mergeByMaterial(g, "peacock1");
writeFileSync("agents/arthur/assets/village_dress_peacock.glb", toGLB(g));
console.log("village_dress_peacock.glb —", g.children.length, "top-level");
