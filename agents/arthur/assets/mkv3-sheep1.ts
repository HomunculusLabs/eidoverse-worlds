// mkv3-sheep1.ts — fauna loop 13: THE SHEPHERD'S FOLD (new species, FAUNA-PLAN
// fauna-12 candidate row, build owed this tick). Village logic: the dyehouse's
// raw material is wool and its source animal was absent — a fold in sight of
// the dye yard closes the economy loop the way the owl closes the livery.
//
// A wool-cream ewe pair as ONE entity (nx-dress-sheep-001):
//   sheep_a = GRAZER (neck dipped, muzzle at the grass — the graze-tug swing)
//   sheep_b = WATCH (head high, the fold's sentry — head-scan, owl/goose family)
// Species law (18m identity): a WHITE WOOL BULK on green meadow with DARK
// THIN LEGS and a SMALL grey head — no neck silhouette (that's the geese 60m
// east), no box-body (that was the old goats). Bulk is the read.
//
// Furniture (village language): a shepherd's timber hurdle windbreak on the
// SW side (stile family 0x6f6432/0x5a5128, glazier/timberyard values) + a
// trodden-earth fold pad (0x71624c, the fox-den TROD family) derived from
// true extents + grazed-grass tufts at the grazer's muzzle (goose grain law)
// + two wool snags caught on stake feet.
//
// Build laws exercised: NECK-JOINED heads (fauna-1); broad forms (fauna-5);
// no group scales (builds true-size — the ×bake displacement trap avoided);
// furniture placed AFTER construction at final coords. Anchors (KEEP(sheep_)
// added to mergekit this tick): sheep_a/_head/_tail, sheep_b/_head/_tail —
// 6 motion targets. Motion lives in the placer (fauna13-place-sheep.ts):
// 2 breathing bobs (part bob), grazer graze-tug X-pendulum, watch Y-axis
// head-scan, 2 tail-stub flicks; phases staggered, explicit epoch t0.
//
// Facing: heads at local +z. World seat (−27.5, −31.5) yaw +0.65 → local +z
// faces NE (toward plaza + dye yard); hurdles shelter SW. Both ewe bodies
// carry small opposing yaws so the pair never reads as one cloned mesh.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law; tex-23 freed the animals); furniture
// pads take a texMat mottle where they must read as earth, not decal
const WOOL  = 0xe8e2d2;  // wool-cream (the 18m read on green)
const CAP   = 0x8d8578;  // grey-brown wool-cap head + ears
const LEG   = 0x57503f;  // dark thin legs (the counter-read to the white bulk)
const MUZZ  = 0x3f3a33;  // dark muzzle/nose
const EYE   = 0x241c12;
const TIMB  = 0x6f6432;  // hurdle rails (stile family)
const STAKE = 0x5a5128;  // hurdle stakes (second timber value)
const TUFT  = 0x8a9a55;  // grazed grass
// v5: trodden pad as a MOTTLED texMat (v2-v4's flat disc read "clean decal
// ellipse" in EVERY judged angle — flat material cannot read as earth).
// v6: mottle STRENGTHENED (v5's fox-den-close tones 7%/steps at scale 3
// still read uniform from 5m) — wider value range, ~0.7m patches.
const TROD_M = texMat("sheepfold-trod", [0x7a6a52, 0x66584a, 0x544838], { rough: .98, scale: 1.5, weights: [2, 2, 1], seed: 1337 });

// ---- one ewe ----
// role: "graze" = neck out-down, muzzle among the grass
//       "watch"  = neck raised, head high (alert sentry)
const ewe = (
    x: number, z: number, yaw: number, tag: "a" | "b",
    role: "graze" | "watch",
) => {
    const grp = new THREE.Group();
    grp.name = `sheep_${tag}`;
    grp.position.set(x, 0, z);
    grp.rotation.y = yaw;
    // ---- wool hull: the species bulk. Broad ellipsoid, back at ~0.68 ----
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), mat(WOOL, 0.95, 0));
    hull.scale.set(0.28, 0.235, 0.46);
    hull.position.set(0, 0.475, 0);
    grp.add(hull);
    // wool rolls: shoulder + rump bumps (a fleece is lumpy, not an egg)
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(WOOL, 0.95, 0));
    shoulder.scale.set(0.255, 0.21, 0.30);
    shoulder.position.set(0, 0.55, 0.16);
    grp.add(shoulder);
    const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(WOOL, 0.95, 0));
    rump.scale.set(0.26, 0.215, 0.28);
    rump.position.set(0, 0.535, -0.22);
    grp.add(rump);
    // chest wool bib filling the front under-line (no gap under the neck)
    const bib = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 7), mat(WOOL, 0.95, 0));
    bib.scale.set(0.21, 0.18, 0.17);
    bib.position.set(0, 0.42, 0.38);
    grp.add(bib);
    // ---- dark thin legs (the white-bulk counter-read) ----
    for (const [sx, sz] of [[-0.14, 0.26], [0.14, 0.26], [-0.15, -0.26], [0.15, -0.26]] as const) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.025, 0.30, 6), mat(LEG, 0.9, 0));
        leg.position.set(sx, 0.15, sz);
        grp.add(leg);
        const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.028, 0.062), mat(MUZZ, 0.9, 0));
        hoof.position.set(sx, 0.014, sz + 0.008);
        grp.add(hoof);
    }
    // ---- head subtree: origin = neck joint at the wool shoulder ----
    const head = new THREE.Group();
    head.name = `sheep_${tag}_head`;
    head.position.set(0, 0.56, 0.40); // the joint (pendulum swings here)
    // neck: ONE smooth tube along a curve (goose v6 law: butted cylinders
    // kink; tangent-continuous tube is the cure)
    const curvePts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
    let hy: number, hz: number, headPitch: number;
    if (role === "graze") {
        // v3: neck OUT at sheep-true ~39° below horizontal (v1/v2's steep
        // 62° drop hugged the chest — profile judge read a tilted egg with
        // a grey nub; the head must clear the body front to read in
        // profile). Head lands ewe-local (0, 0.20, 0.78) — 0.32m proud of
        // the hull front, muzzle among the stem tops.
        curvePts.push(new THREE.Vector3(0, -0.14, 0.16), new THREE.Vector3(0, -0.36, 0.38));
        hy = -0.36; hz = 0.38; headPitch = 0.15;
        // v4 pitch arithmetic (v3 bug: pitch rotates about the PIVOT, so
        // 0.42 pulled the terminus down z·sinθ=0.155 more than planned —
        // the muzzle sphere bottomed at −0.032, DIGGING; lowProbe named
        // sheep_a_head_1). At 0.15: head center ewe-local (0, 0.147, 0.72),
        // muzzle bottom +0.076 — grazing at stem-top height.
    } else {
        // raised: v8 taller sentry stretch (0.24→0.30 terminus, head total
        // ~0.98) — the v7 side-angle judge read the head tangling with the
        // hurdle rail line; clearing it decisively is species-true besides
        // (a watching ewe stretches). Total height stays ≤ the 1.05 cap.
        curvePts.push(new THREE.Vector3(0, 0.15, 0.05), new THREE.Vector3(0, 0.30, 0.068));
        hy = 0.33; hz = 0.072; headPitch = -0.10; // level gaze, tall
    }
    const neck = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 10, 0.062, 8),
        mat(WOOL, 0.95, 0));
    head.add(neck);
    // skull: grey-brown cap head (the species counter-tone to the wool)
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.085, 9, 7), mat(CAP, 0.9, 0));
    skull.scale.set(0.82, 0.85, 1.05);
    skull.position.set(0, hy, hz);
    head.add(skull);
    // wool crown cap: v5 TAMED (v4's full-width 0.080 crown swallowed the
    // grey face whole — profile judge read a "low-contrast bump": the wool
    // came down to eye level all around). The fleece creeps over the POLL
    // (back-top) ONLY — 0.058 wide vs skull 0.070, so the grey brow+face
    // band reads clear on the sides and front.
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.082, 8, 6), mat(WOOL, 0.95, 0));
    crown.scale.set(0.58, 0.55, 0.85);
    crown.position.set(0, hy + 0.026, hz - 0.048);
    head.add(crown);
    // muzzle: pale grey + dark nose leather, proud of the skull front
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.058, 8, 6), mat(CAP, 0.9, 0));
    muzzle.scale.set(0.78, 0.72, 1.25);
    muzzle.position.set(0, hy - 0.008, hz + 0.075);
    head.add(muzzle);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.020, 0.016), mat(MUZZ, 0.85, 0));
    nose.position.set(0, hy - 0.006, hz + 0.145);
    head.add(nose);
    // ears: SIDWAYS drops (the ewe marker — not up prick, not lop); v3
    // bumped (1.5/0.5) — profile judge read v2's as unresolved nubs
    for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 7, 5), mat(CAP, 0.9, 0));
        ear.scale.set(1.5, 0.5, 0.62);
        ear.position.set(side * 0.100, hy + 0.022, hz - 0.012);
        ear.rotation.z = side * -0.45;
        head.add(ear);
    }
    // eyes (dark, side-set — profile readers, fauna-7 law)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.011, 5, 4), mat(EYE, 0.9, 0));
        eye.position.set(side * 0.064, hy + 0.016, hz + 0.042);
        head.add(eye);
    }
    head.rotation.x = headPitch;
    grp.add(head);
    // ---- tail subtree: origin = rump base — docked stub, wool + dark Underside ----
    const tail = new THREE.Group();
    tail.name = `sheep_${tag}_tail`;
    tail.position.set(0, 0.50, -0.44);
    const stub = new THREE.Mesh(new THREE.SphereGeometry(0.055, 7, 6), mat(WOOL, 0.95, 0));
    stub.scale.set(0.8, 0.85, 1.05);
    tail.add(stub);
    grp.add(tail);
    return grp;
};

// ---- the pair (entity-local frame: both face +z, spread along x) ----
// grazer E (+x, nearer the lane), watch W (−x, inland sentry). Opposing
// small yaws so the pair never reads as one cloned mesh.
g.add(ewe(1.15, -1.0, 0.30, "a", "graze"));
g.add(ewe(-1.15, -0.95, -0.55, "b", "watch"));

// ---- fold furniture (placed at FINAL entity coords; no bake to displace) ----
// trodden pad: v3 = two-tone irregular (v2's single smooth disc read as a
// clean decal ellipse): outer TROD disc + inner darker worn core offset NW +
// hoof-scuff pocks + rim tufts breaking the edge + two survivors inside.
{
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.65, 0.016, 24), TROD_M);
    pad.scale.set(1.0, 1.0, 1.25);
    pad.position.set(0, 0.008, -0.55);
    pad.name = "fold_pad";
    g.add(pad);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.014, 20), mat(0x665845, 0.98, 0));
    core.scale.set(1.0, 1.0, 1.2);
    core.position.set(-0.12, 0.016, -0.50);
    core.name = "fold_core";
    g.add(core);
    // hoof-scuff pocks (dark, small, scattered on the worn core)
    let s = 7;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 6; k++) {
        const a = rnd() * Math.PI * 2, rr = 0.25 + rnd() * 0.75;
        const pock = new THREE.Mesh(new THREE.CylinderGeometry(0.035 + rnd() * 0.03, 0.045 + rnd() * 0.03, 0.010, 8), mat(0x5c503e, 0.98, 0));
        pock.position.set(-0.12 + Math.cos(a) * rr, 0.022, -0.50 + Math.sin(a) * rr * 1.1);
        pock.name = `scuff_${k}`;
        g.add(pock);
    }
    // v7 geometric mottle (v6's texMat alone read "one flat tan + single
    // dark zone" — low-frequency texture from 5m): scattered trodden BLOTCH
    // discs in stepped earth tones across the pad + dark pebble specks.
    // Heights staggered 0.019-0.024 to sit clear of the pad/core tops.
    let bs = 31;
    const brnd = () => (bs = (bs * 48271) % 2147483647) / 2147483647;
    const BLOTCH = [0x6f604a, 0x645642, 0x76664e];
    for (let k = 0; k < 9; k++) {
        const a = brnd() * Math.PI * 2, rr = 0.35 + brnd() * 1.05;
        const r = 0.14 + brnd() * 0.17;
        const blotch = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, 0.006, 10), mat(BLOTCH[k % 3], 0.98, 0));
        blotch.position.set(Math.cos(a) * rr, 0.019 + (k % 3) * 0.0025, -0.55 + Math.sin(a) * rr * 1.15);
        blotch.name = `blotch_${k}`;
        g.add(blotch);
    }
    for (let k = 0; k < 6; k++) {
        const a = brnd() * Math.PI * 2, rr = 0.3 + brnd() * 1.2;
        const pebble = new THREE.Mesh(new THREE.BoxGeometry(0.030 + brnd() * 0.02, 0.016, 0.024 + brnd() * 0.02), mat(0x4e4436, 0.95, 0));
        pebble.position.set(Math.cos(a) * rr, 0.012, -0.55 + Math.sin(a) * rr * 1.1);
        pebble.rotation.y = brnd() * Math.PI;
        pebble.name = `pebble_${k}`;
        g.add(pebble);
    }
    // rim tufts (7) breaking the pad edge + 2 survivors inside
    for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + 0.35;
        const rx = 1.52, rz = 1.90;
        const h = 0.06 + 0.035 * ((k * 37) % 10) / 10;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.011, h, 0.011), mat(TUFT, 0.9, 0));
        blade.position.set(Math.cos(a) * rx, h / 2, -0.55 + Math.sin(a) * rz);
        blade.rotation.z = Math.cos(a) * 0.3;
        blade.name = `rimtuft_${k}`;
        g.add(blade);
    }
    for (const [ix, iz] of [[0.55, -0.10], [-0.80, -1.05]] as const) {
        const h = 0.07;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.011, h, 0.011), mat(TUFT, 0.9, 0));
        blade.position.set(ix, h / 2, iz);
        blade.name = `intuft_${Math.round(ix * 100)}`;
        g.add(blade);
    }
}
// hurdles: the shepherd's windbreak — 3 segments on the SW arc + 1 on the S
// end. Stile-family rails (0x6f6432) on stakes (0x5a5128), each segment
// slightly yawed/stepped (hand-set pen, not a fence line). Members emitted
// as DIRECT meshes with baked segment transforms — non-KEEP top-level
// groups survive mergekit with unmerged children (node-budget law), so the
// rails/stakes must merge into the timber buckets like every other static.
{
    const seg = (cx: number, cz: number, yaw: number, len = 1.15) => {
        const co = Math.cos(yaw), si = Math.sin(yaw);
        const put = (w: number, h: number, d: number, m: THREE.Material, lx: number, ly: number, lz: number) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
            mesh.position.set(cx + lx * co + lz * si, ly, cz - lx * si + lz * co);
            mesh.rotation.y = yaw;
            g.add(mesh);
        };
        for (const h of [0.40, 0.26]) put(len, 0.055, 0.035, mat(TIMB, 0.9, 0), 0, h, 0.045);
        for (let i = 0; i < 4; i++) {
            const sx = -len / 2 + (len / 3) * i;
            const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.026, 0.50, 6), mat(STAKE, 0.9, 0));
            stake.position.set(cx + sx * co + 0.055 * si, 0.25, cz - sx * si + 0.055 * co);
            g.add(stake);
        }
    };
    seg(-1.38, -1.88, 0.42);          // W segment — v6 moved 0.26 out (v5's
                                      // z −1.62 line still fused with
                                      // sheep_b's rump silhouette from the
                                      // side camera; −1.88 clears the body
                                      // extreme −1.28 by 0.36)
    seg(-0.35, -1.95, 0.10);          // S-W segment
    seg(0.72, -1.78, -0.28);          // S-E segment (the gate-side wing)
    seg(2.05, -1.05, -0.85, 0.95);    // E wing — v3 moved out (v2 at 1.62
                                      // put its west rail end INSIDE
                                      // sheep_a's hull — profile judge saw
                                      // rails clip into the body)
    // gap-closer between the W arc's E end (−0.86,−1.65) and the S-W
    // segment's W end (−0.91,−1.90): one short hurdle bridges the mouth.
    seg(-0.88, -1.77, 0.26, 0.55);
}
// grazed-grass tufts at the grazer's muzzle (grain law): v4 muzzle lands
// ewe-local (0, ~0.10, 0.72) → entity ≈ (1.36, −0.31); ring that point.
{
    for (let k = 0; k < 9; k++) {
        const a = k * 2.399;
        const sx = 1.36 + Math.cos(a) * 0.11, sz = -0.31 + Math.sin(a) * 0.10;
        const h = 0.055 + 0.03 * Math.abs(Math.sin(a * 3));
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.010, h, 0.010), mat(TUFT, 0.9, 0));
        blade.name = `tuft_${k}`;
        blade.position.set(sx, h / 2, sz);
        blade.rotation.z = Math.cos(a) * 0.28;
        g.add(blade);
    }
    // two wool snags caught at stake feet (flock lived here a while) —
    // placed AT the decoded outer-stake positions of the W and S-E hurdles
    for (const [wx, wz] of [[-1.88, -1.32], [0.24, -1.94]] as const) {
        const snag = new THREE.Mesh(new THREE.SphereGeometry(0.045, 7, 5), mat(WOOL, 0.95, 0));
        snag.scale.set(1.2, 0.55, 0.9);
        snag.position.set(wx, 0.026, wz); // v2: lifted — v1 y 0.018 dipped 7mm under ground
        snag.name = `woolsnag_${Math.round(wx * 100)}`;
        g.add(snag);
    }
}

mergeByMaterial(g, "sheepfold1");
writeFileSync("agents/arthur/assets/village_dress_sheepfold.glb", toGLB(g));
console.log("village_dress_sheepfold.glb —", g.children.length, "top-level");
