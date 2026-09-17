// mkv3-hens25.ts — fauna loop 2: THE FLOCK LIVES. Bill's mandate: the
// animals are not very good. The standing nx-dress-hens is ONE 0.38m
// micro-hen (hen_a only) standing alone 4m from the coop, zero comps,
// frozen — its b/c siblings were never spawned in commons-next.
//
// fauna-2 rebuild: one flock entity = THREE articulated hens in the coop
// yard (open meadow W of the coop, clear of hutch/well/inn), replacing the
// lone bird same-id. goats-fauna-1 discipline applied to the hen idiom:
//  - NECK-JOINED heads (the old sphere head floated off the cylinder body);
//  - species cues scaled to survive 18m (goats' horn law): the comb is a
//    proud red flag (0.025 x 0.055 x 0.09), the tail is a DARK fan over a
//    LIGHT plump body — the two-distance hen signature;
//  - body: plump oval (sphere scaled 1.5/1.05/1.0), not a 7-seg cylinder;
//  - anchors: hen_{a,b,c} + _head (origin = neck joint) + _tail (origin =
//    tail base) — KEEP(hen_) already survives mergeByMaterial;
//  - motion lives in the placer (fauna2-place-hens.ts): peck-bobs +
//    tail flicks, quick periods, phases staggered per bird.
// Feed furniture: pale grain specks ground-tie the pecking bird (no
// floating anything — fauna-1 hay law). Coats vary (cream/buff/grey-brown),
// light bodies + dark tails for the distance read. Construction flat per
// tex-23; life flat-coat per fauna-1.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const GRAIN = 0xd9c58f;

const hen = (x: number, z: number, yaw: number, pose: "peck" | "alert" | "browse", tag: string, coat: number) => {
    const HENDK = 0x8a8062; // dark wing/tail family over every light coat
    const COMB = 0xd2402e;  // red — THE hen flag
    const BEAK = 0xf0a032;
    const LEG = 0xd9a066;
    const grp = new THREE.Group();
    grp.name = `hen_${tag}`;
    const dir = [Math.sin(yaw), Math.cos(yaw)]; // forward in local xz
    // ---- body: plump oval, breast forward-low ----
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 9, 7), mat(coat, 0.95, 0));
    body.scale.set(1.5, 1.05, 1.0);
    body.position.set(x, 0.22, z);
    grp.add(body);
    // wing hint: two flattened dark ovals on the flanks (species mass read)
    // flank axis = perp of forward: (-cos yaw, sin yaw) — same as the legs
    for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(0.105, 8, 6), mat(HENDK, 0.95, 0));
        wing.scale.set(1.15, 0.62, 0.5);
        wing.position.set(x + dir[0] * -0.02 - dir[1] * side * 0.105, 0.235, z + dir[1] * -0.02 + dir[0] * side * 0.105);
        wing.rotation.y = yaw;
        grp.add(wing);
    }
    // legs: thin, honest at close range
    for (const side of [-1, 1]) {
        const lx = x + dir[0] * 0.04 - dir[1] * side * 0.045;
        const lz = z + dir[1] * 0.04 + dir[0] * side * 0.045;
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.1, 0.022), mat(LEG, 0.9, 0));
        leg.position.set(lx, 0.05, lz);
        grp.add(leg);
    }
    // ---- head subtree: origin = neck joint at the shoulder ----
    // pose offsets (head-local): peck = head down at the ground, alert =
    // upright scanning, browse = mid. The motion comp pendulates about the
    // joint on local X, so peck↔browse↔alert is one rocking family.
    const hy = pose === "peck" ? -0.17 : pose === "alert" ? 0.14 : -0.02;
    const hz = pose === "peck" ? 0.19 : pose === "alert" ? 0.10 : 0.17;
    const head = new THREE.Group();
    head.name = `hen_${tag}_head`;
    head.position.set(x + dir[0] * 0.12, 0.30, z + dir[1] * 0.12);
    head.rotation.y = yaw;
    // neck slab from joint to head center (never a floating head — fauna-1 law)
    const neckLen = Math.hypot(hy, hz);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.045, neckLen + 0.05, 6), mat(coat, 0.95, 0));
    neck.position.set(0, hy / 2, hz / 2);
    neck.rotation.x = Math.atan2(hz, hy);
    head.add(neck);
    // skull
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.055, 7, 6), mat(coat, 0.95, 0));
    skull.position.set(0, hy, hz);
    head.add(skull);
    // eyes (judge v1: "highest-value single tweak"; v2: 0.013 reads ≤1px at
    // 5m — enlarged to 0.020 so the dot survives near-range resolution)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.020, 5, 4), mat(0x241c12, 0.9, 0));
        eye.position.set(side * 0.045, hy + 0.012, hz + 0.026);
        head.add(eye);
    }
    // comb — proud red flag (18m law: 2cm cues vanish; v4: 0.075×0.11 —
    // judge: "combs read better than real-world scale would suggest")
    const comb = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.075, 0.11), mat(COMB, 0.9, 0));
    comb.position.set(0, hy + 0.07, hz - 0.01);
    head.add(comb);
    // beak + wattle
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.07, 5), mat(BEAK, 0.9, 0));
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, hy - 0.005, hz + 0.08);
    head.add(beak);
    const wattle = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.045, 0.025), mat(COMB, 0.9, 0));
    wattle.position.set(0, hy - 0.05, hz + 0.03);
    head.add(wattle);
    grp.add(head);
    // ---- tail subtree: origin = tail base at the rear ----
    const tail = new THREE.Group();
    tail.name = `hen_${tag}_tail`;
    tail.position.set(x - dir[0] * 0.17, 0.26, z - dir[1] * 0.17);
    tail.rotation.y = yaw;
    // dark fan: three blades up-back — the dark-over-light distance cue
    for (const [dz, ang, len] of [[-0.035, 0.55, 0.16], [0.0, 0.75, 0.18], [0.035, 0.55, 0.16]] as const) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.022, len, 0.05), mat(HENDK, 0.95, 0));
        blade.position.set(0, len / 2 * Math.sin(ang), -len / 2 * Math.cos(ang) + dz * 0.2);
        blade.rotation.x = -ang;
        tail.add(blade);
    }
    grp.add(tail);
    return grp;
};

// ---- the flock: loose scatter, no grid, mixed facing ----
// a pecks at scattered grain (head down at ground), b is the alert sentry
// by the coop side (judge v2: yaw -1.0 — quarter-profile to the yard's
// primary approach so the beak reads; watches the open meadow), c browses
// mid-yard. Coats: cream / buff / grey-brown.
g.add(hen(-0.45, 0.35, 0.6, "peck", "a", 0xe8e4cc));
g.add(hen(0.50, -0.30, -1.0, "alert", "b", 0xd9c9a8));
g.add(hen(-0.95, -0.55, 2.9, "browse", "c", 0xb4b096));

// grain specks ground-tie the pecker (feed exists because the peck is real)
for (let i = 0; i < 7; i++) {
    const speck = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.02), mat(GRAIN, 0.9, 0));
    const a = 0.65 + i * 0.55;
    const r = 0.16 + (i % 3) * 0.05;
    speck.position.set(-0.45 + Math.cos(a) * r, 0.006, 0.35 + Math.sin(a) * r);
    speck.rotation.y = a;
    g.add(speck);
}
// one dust-bath shallow — the yard is lived-in (flat disc, ground layer)
const dust = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.035, 10), mat(0x9a8a68, 1, 0));
dust.position.set(0.62, 0.017, 0.42);
g.add(dust);

mergeByMaterial(g, "hn3");
writeFileSync("agents/arthur/assets/village_hens_flock.glb", toGLB(g));
console.log("village_hens_flock.glb —", g.children.length, "top-level");
