// mkv3-goats65.ts — new-era loop 65: THE GOATS. Bill keeps goats in real
// life; the village should too. A small goat yard beside the paddock:
// post-and-rail pen (reusing the paddock language), 3 goats, a hay rack +
// water trough.
//
// fauna-1 REBUILD (the animals are not very good — Bill, 2026-09-16):
//  - PEN BUGS FIXED: the N/S post rows used spacing R (posts marched to
//    x=+9.6, three orphan posts in the grass toward mosaic-0036 — the live
//    bbox was 14.21m wide); the S gate rail scaled 0.72 at center -R*0.75
//    overshot the corner post to x=-4.56. Rows now spacing R/2 and the
//    gate carries two symmetric rails; local footprint back to 6.5x6.5.
//  - SPECIES REBUILD: every goat gains a NECK (the old heads floated),
//    drop ears, back-swept horns, a beard on the billy, an upturned tail
//    stub, and varied coats (cream / dark cream / tan — homestead honest).
//  - ARTICULATION: goat_N + goat_N_head + goat_N_tail named anchors
//    (head group origin = neck joint, rotation.y = goat yaw, so a
//    motion:goat_N_head pendulum about local X is a true nod for any
//    facing; tail group origin = tail base, local Y axis = swish).
//    Comps live in the placer (fauna1-place-goats.ts) — phases staggered
//    per individual so the pen never moves in unison.
// Pen/rack/trough stay in the village timber family (tex-41); goats stay
// flat-colored per the tex-23 law (life-stays-flat freed by fauna lane:
// flat coats read at 18m; texture is not needed for species identity).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const COAT_A = 0xd6d2ac;   // cream (goat a, at the manger)
const COAT_B = 0xb6b08a;   // dark cream (goat b, the billy on watch)
const COAT_C = 0x9c7e52;   // tan (goat c, the grazer)
const DARK = 0x8a7a56;     // muzzle/beard family
const HORN = 0xd8cf9e;     // pale bone — dark-coat contrast at 18m (fauna-1)

const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });

// ---- PEN: post-and-rail square (open on the village side) ----
// fauna-1: N/S rows spacing R/2 (was R — orphan posts bug); gate = two
// symmetric short rails (was one 0.72-scaled rail overshooting the corner).
const R = 3.2;
for (let i = 0; i < 5; i++) {
    const x = -R + i * (R / 2); // posts along S and N, spacing R/2
    for (const z of [-R, R]) {
        if (Math.abs(x) < 0.8 && z === R) continue; // gate gap S-center
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), timberTex);
        post.position.set(x, 0.5, z);
        g.add(post);
    }
}
for (const x of [-R, R]) {
    for (let zi = 0; zi < 5; zi++) {
        const z = -R + zi * (R / 2);
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), timberTex);
        post.position.set(x, 0.5, z);
        g.add(post);
    }
}
// rails: two heights. N/E/W full; S side split around the gate gap.
for (const y of [0.45, 0.85]) {
    for (const z of [-R, R]) {
        if (z === -R) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(R * 2 - 0.4, 0.07, 0.06), timberTex);
            rail.position.set(0, y, z);
            g.add(rail);
        } else {
            // gate gap spans x in [-0.8, 0.8]: two rails, corner post to gap edge
            for (const side of [-1, 1]) {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.07, 0.06), timberTex);
                rail.position.set(side * 2.0, y, z);
                g.add(rail);
            }
        }
    }
    for (const x of [-R, R]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, R * 2 - 0.4), timberTex);
        rail.position.set(x, y, 0);
        g.add(rail);
    }
}

// ---- HAY MANGER (against the N rail) + TROUGH ----
// fauna-1 judge arc: v1 rack = floating hay; v2/v3 heap above a low box
// still read as an unsupported green line at 18m (the heap's screen line
// also coincided with the near goat's raised head). v4: the box is TALL
// (rim y 1.10) and solid — hay exists only as crest wisps over the rim and
// droops over the near face, so the silhouette's top edge is TIMBER, never
// hay. A pale rim plank (shared with the trough — feed furniture) outlines
// the top against the dark box and meadow.
const RIM = 0xd9c9a3; // pale feed-rail
for (const lx of [-1.0, 1.0]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), timberTex);
    leg.position.set(lx, 0.275, -R + 0.32);
    g.add(leg);
}
const manger = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 0.46), timberTex);
manger.position.set(0, 0.825, -R + 0.32);
g.add(manger);
const mangerRim = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 0.54), mat(RIM, 0.85, 0.05));
mangerRim.position.set(0, 1.13, -R + 0.32);
g.add(mangerRim);
// hay cresting the rim (the contents read; mass stays inside the box)
for (let h = 0; h < 4; h++) {
    const hay = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.30, 0.05), mat(0xd8ea70, 0.95, 0));
    hay.position.set(-0.5 + h * 0.33, 1.16, -R + 0.32 + (h % 2 ? 0.04 : -0.04));
    hay.rotation.z = (h % 2 ? 0.25 : -0.2);
    g.add(hay);
}
// two wisps drooping over the near face (containment cue)
for (const [wx, tilt] of [[-0.55, 0.9], [0.45, -0.85]] as const) {
    const hay = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.34, 0.05), mat(0xd8ea70, 0.95, 0));
    hay.position.set(wx, 0.95, -R + 0.56);
    hay.rotation.x = tilt;
    g.add(hay);
}
// spill at the foot (ground tie)
for (let s = 0; s < 3; s++) {
    const spill = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.05), mat(0xd8ea70, 0.95, 0));
    spill.position.set(-0.5 + s * 0.5, 0.015, -R + 0.75);
    spill.rotation.y = (s % 2 ? 0.5 : -0.3);
    g.add(spill);
}
// water trough — housekit water palette law (0x506a78, rough .25, metal .5)
// + the shared pale rim plank (feed furniture reads as a family)
const trough = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.34, 0.55), timberTex);
trough.position.set(R - 0.55, 0.17, 0);
g.add(trough);
const troughRim = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.63), mat(RIM, 0.85, 0.05));
troughRim.position.set(R - 0.55, 0.37, 0);
g.add(troughRim);
const water = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.42), mat(0x506a78, 0.25, 0.5));
water.position.set(R - 0.55, 0.41, 0);
g.add(water);

// ---- GOATS (fauna-1: neck-joined, eared, horned, anchored) ----
// Each goat: a goat_${tag} group (body+legs merge into buckets inside it),
// a goat_${tag}_head group whose ORIGIN is the neck joint (rotation.y =
// goat yaw; children in head-local frame: x=right, y=up, z=forward), and a
// goat_${tag}_tail group at the tail base. Motion comps target the head and
// tail nodes; their node-local origins are the hinges.
const goat = (x: number, z: number, yaw: number, pose: "browse" | "alert" | "graze", tag: string, coat: number, bearded: boolean) => {
    const g = new THREE.Group();
    g.name = `goat_${tag}`;
    const dark = tag === "b" ? 0x9a8c68 : DARK;
    const fwd = [Math.sin(yaw), Math.cos(yaw)];
    // body + legs (static — merge into goat group buckets)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.30), mat(coat, 0.95, 0));
    body.position.set(x, 0.55, z);
    body.rotation.y = yaw;
    g.add(body);
    for (const [dx, dz] of [[0.18, 0.10], [0.18, -0.10], [-0.18, 0.10], [-0.18, -0.10]] as const) {
        const rx = dx * Math.cos(yaw) - dz * Math.sin(yaw);
        const rz = dx * Math.sin(yaw) + dz * Math.cos(yaw);
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.08), mat(coat, 0.95, 0));
        leg.position.set(x + rx, 0.19, z + rz);
        g.add(leg);
    }
    // ---- head subtree (origin = neck joint at the shoulder) ----
    const hy = pose === "browse" ? 0.16 : pose === "graze" ? -0.36 : 0.30;
    const hz = pose === "browse" ? 0.34 : pose === "graze" ? 0.38 : 0.30;
    const head = new THREE.Group();
    head.name = `goat_${tag}_head`;
    head.position.set(x + fwd[0] * 0.28, 0.72, z + fwd[1] * 0.28);
    head.rotation.y = yaw;
    // neck slab: from the joint to the head center
    const neckLen = Math.hypot(hy, hz);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.13, neckLen + 0.08, 0.15), mat(coat, 0.95, 0));
    neck.position.set(0, hy / 2, hz / 2);
    neck.rotation.x = Math.atan2(hz, hy);
    head.add(neck);
    // skull + muzzle
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.20, 0.26), mat(coat, 0.95, 0));
    skull.position.set(0, hy, hz);
    head.add(skull);
    const muz = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.13), mat(dark, 0.95, 0));
    muz.position.set(0, hy - 0.03, hz + 0.17);
    head.add(muz);
    // drop ears (the species read at distance)
    for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.05, 0.10), mat(coat, 0.95, 0));
        ear.position.set(side * 0.145, hy + 0.05, hz - 0.03);
        ear.rotation.z = -side * 0.75;
        ear.rotation.x = -0.2;
        head.add(ear);
    }
    // back-swept horns (fauna-1: thickened to 0.036/0.05 base — the judge's
    // 18m cue; thin 0.016 spikes did not survive the distance)
    for (const side of [-1, 1]) {
        const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.05, 0.30, 5), mat(HORN, 0.9, 0.1));
        horn.position.set(side * 0.055, hy + 0.15, hz - 0.08);
        horn.rotation.x = -0.85;
        head.add(horn);
    }
    // beard (the billy only)
    if (bearded) {
        const beard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.11, 0.06), mat(dark, 0.95, 0));
        beard.position.set(0, hy - 0.15, hz + 0.09);
        head.add(beard);
    }
    g.add(head);
    // ---- tail subtree (origin = tail base at the rump) ----
    const tail = new THREE.Group();
    tail.name = `goat_${tag}_tail`;
    tail.position.set(x - fwd[0] * 0.29, 0.70, z - fwd[1] * 0.29);
    tail.rotation.y = yaw;
    const stub = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.17, 0.05), mat(coat, 0.95, 0));
    stub.position.set(0, 0.05, -0.01);
    stub.rotation.x = -0.35;
    tail.add(stub);
    g.add(tail);
    return g;
};
// goat a browses the manger at the N rail (facing it, head at rim height)
g.add(goat(-0.9, -2.15, Math.PI, "browse", "a", COAT_A, false));
// goat b is the billy on watch at the NEAR-WEST corner, facing the gate —
// fauna-1 screen law: b's alert head previously coincided with the far hay
// line and merged with c; the near-left corner gives b its own screen band
g.add(goat(-2.0, 1.0, 0.55, "alert", "b", COAT_B, true));
// goat c grazes by the trough (E side), one full body clear of b's band
g.add(goat(1.7, 1.2, 2.7, "graze", "c", COAT_C, false));

mergeByMaterial(g, "gt3");
writeFileSync("agents/arthur/assets/village_goats3.glb", toGLB(g));
console.log("village_goats3.glb —", g.children.length, "top-level");
