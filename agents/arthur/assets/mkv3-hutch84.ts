// mkv3-hutch84.ts — new-era loop 84: THE RABBIT HUTCH. Bill's homestead
// keeps goats, ducks, AND bunnies; the Commons mirrors two of three. A
// small hutch beside the garden fence: raised wooden box w/ wire-front
// gap, slanted lids (one open), ramp to the ground, straw litter, and
// 2 rabbits. Pole-free.
// fauna-4 (2026-09-17): rabbits rebuilt as CREATURES — rabbit_sit moved
// OUT of the compartment (it sat behind the solid hutch_gapR strip =
// struct-52 occlusion class, invisible from every angle) to the straw at
// the ramp foot; rabbit_hop (frozen mid-hop, sub-pixel ears) replaced by
// rabbit_alert, an upright sitter with 16cm ears (the bunny signature).
// Nested KEEP anchors for motion: rabbit_sit/_head, rabbit_alert/_head/
// _ears — 5 comp targets, phases staggered per individual (fauna law).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const OAK = 0x7c6832, OAK_DK = 0x6a6030, STRAW = 0xd8ea70;
const PINK = 0xd8aa94;

// tex-21 TIMBER V: the hutch's boards join the village timber family —
// body, divider, both lids, and the ramp take the wallSpan tile (the
// hutch is built from the same boards as the buildings; one wood through
// walls, scaffold, greeting, map, and now the rabbit's house). Legs stay
// DARK flat (structural), straw/fur/pink flat (litter and life).
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const texBox0 = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};

// ---- HUTCH: raised box on legs, 2 compartments ----
const BW = 1.2, BH = 0.55, BD = 0.7, BY = 0.45;
texBox0("hutch_body", BW, BH, BD, 0, BY + BH / 2, 0, timberTex);
// divider
texBox0("hutch_div", 0.04, BH - 0.06, BD - 0.06, 0, BY + BH / 2, 0, timberTex);
// legs
// tex-54: the legs join the family too — a sawn post is a sawn post
for (const [lx, lz] of [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]] as const) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, BY, 0.06), timberTex);
    leg.name = `hutch_leg_${lx}_${lz}`;
    leg.position.set(lx, BY / 2, lz);
    g.add(leg);
}
// slanted lids: left closed, right OPEN (propped)
const lidL = new THREE.Mesh(new THREE.BoxGeometry(BW / 2 + 0.04, 0.04, BD + 0.06), timberTex);
lidL.name = "hutch_lid_closed";
lidL.rotation.x = -0.18;
lidL.position.set(-BW / 4, BY + BH + 0.02, 0);
g.add(lidL);
const lidR = new THREE.Mesh(new THREE.BoxGeometry(BW / 2 + 0.04, 0.04, 0.46), timberTex);
lidR.name = "hutch_lid_open";
lidR.rotation.x = -0.75; // v8b: 43deg hinged at the box back-top, free edge lifted — a real opened lid (the -1.15 66deg full-depth prop towered 44cm over the ridge: side-judge "wrong direction and height")
lidR.position.set(BW / 4 + 0.12, BY + BH + 0.16, -0.18); // same center: hinge end lands (0.42, 1.003, -0.348) = box back-top edge
g.add(lidR);
// wire-front gap: dark inset strips (the open mesh reads as dark)
box0("hutch_gapL", BW / 2 - 0.08, BH - 0.16, 0.02, -BW / 4, BY + BH / 2, BD / 2, 0x363424);
box0("hutch_gapR", BW / 2 - 0.08, BH - 0.16, 0.02, BW / 4, BY + BH / 2, BD / 2, 0x363424);
// POP-HOLE (v12): the ramp bay's doorway — real hutches have an open
// pop-hole at floor level, not a mesh window. Dark veneer over the rail
// band at the ramp's width (same idiom as the gap strips): ramp ->
// doorway -> interior reads connected (judge v11: the timber band between
// ramp top edge and the wire strip read as a see-through gap)
box0("hutch_pophole", 0.42, 0.10, 0.02, BW / 4, 0.50, BD / 2 + 0.012, 0x363424);
// ramp to ground — v8: full-length (0.84) so the TOP end meets the door
// sill flush (judge side-view v7 caught the 0.75 slab dangling 23mm below
// the sill: too short for the 0.70x0.45 triangle since wakeup-84) + grip
// cleats (a rabbit ramp is cleated; also breaks the flat-slab read)
const RAMP_ROT = -0.538; // run 0.705, rise 0.421 (midplane), slab 0.822
const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.822), timberTex);
ramp.name = "hutch_ramp";
ramp.rotation.x = RAMP_ROT;
ramp.position.set(BW / 4, 0.227, 0.694); // top face flush at sill (0.3, 0.450, 0.35); foot bottom corner lands z 1.055 = old straw extent — v8's 0.84 slab dug under and poked 8mm
g.add(ramp);
// cleats across the incline (v8) — on the ramp's top surface along its normal
for (const t of [0.22, 0.5, 0.78]) {
    const cleat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.012, 0.03), timberTex);
    cleat.name = "hutch_cleat";
    cleat.rotation.x = RAMP_ROT;
    cleat.position.set(BW / 4, 0.437 - 0.421 * t + 0.018, 0.3415 + 0.705 * t + 0.0108);
    g.add(cleat);
}
// prop stick (v8b): from the front sill up to the open lid's free edge,
// passing UNDER the wire strips through the compartment opening — the
// visible stick makes the open lid deliberate (v8's 58cm stick stood in
// free air behind the box and breached the envelope)
const stick = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.9, 0.025), timberTex);
stick.name = "hutch_propstick";
stick.rotation.x = -0.3896;
stick.position.set(BW / 4 + 0.12, 0.885, 0.18); // ends: (0.42, 1.299, 0.01) at the lid edge, (0.42, 0.471, 0.35) at the sill
g.add(stick);

// ---- STRAW litter spilling at the ramp foot ----
for (let si = 0; si < 4; si++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.16), mat(0xe6c35c, 0.95, 0)); // v9: golden, matches the nest (yellow-green read as green straw)
    s.name = `straw_${si}`;
    s.rotation.y = si * 1.3;
    s.position.set(0.3 + (si % 2) * 0.1, 0.02, 0.75 + si * 0.08);
    g.add(s);
}

// ---- RABBITS (fauna-4 rebuild) ----
// Wakeup-20 gave each rabbit a rabbit_${tag} anchor (KEEP rabbit_); fauna-4
// gives each a HEAD sub-anchor and the sitter EAR anchors, sizes both for
// the 18m read, and seats the loafer in the OPEN (straw at the ramp foot),
// not inside the compartment behind the wire strips.
const FUR_C = 0xecead8, FUR_D = 0x9c966c; // near-white (v4: cream-on-straw failed separation — white domestic rabbit, hutch-true) / agouti-grey coats
const EYE = 0x1c1a16, NOSE = 0xd8aa94, TAILW = 0xe4e4c2;

// A: the loafer — sitting in the straw nest at the ramp foot (visible!),
// body canted to face the yard (+z), lopped ears, white tail puff. Group
// origin at the pose base; head group hinged at the neck (y .155).
// fauna-4 v2: coat brightened for distance contrast + a real straw NEST
// under her (the warm patch that reads at 18m; rabbits nest in straw).
const rabA = new THREE.Group();
rabA.name = "rabbit_sit";
rabA.rotation.y = 0.15; // v11: near-front (judge composite: 0.35 read as 3/4-rear from the encounter camera)
const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), mat(FUR_C, 0.95, 0));
loaf.scale.set(1.25, 0.85, 1.05);
loaf.position.set(0, 0.085, 0);
rabA.add(loaf);
// haunch bulge (the sitting-rabbit read: pear, not egg)
const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.062, 8, 6), mat(FUR_C, 0.95, 0));
haunch.scale.set(1, 1.05, 0.8);
haunch.position.set(-0.055, 0.08, -0.07);
rabA.add(haunch);
// front paws (small pale mounds at the front base)
for (const px of [-0.028, 0.028]) {
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 4), mat(FUR_C, 0.95, 0));
    paw.scale.set(1, 0.55, 1.4);
    paw.position.set(px, 0.012, 0.082);
    rabA.add(paw);
}
// tail puff
const tailA = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 4), mat(TAILW, 0.95, 0));
tailA.position.set(-0.075, 0.085, -0.115);
rabA.add(tailA);
// head group — NIBBLE anchor (nose-bob pendulum about the neck)
const headA = new THREE.Group();
headA.name = "rabbit_sit_head";
headA.position.set(0.03, 0.155, 0.085); // neck joint
const skullA = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat(FUR_C, 0.95, 0));
skullA.scale.set(0.9, 0.9, 1.0);
headA.add(skullA);
const muzzleA = new THREE.Mesh(new THREE.SphereGeometry(0.026, 7, 5), mat(FUR_C, 0.95, 0));
muzzleA.scale.set(0.9, 0.75, 1.25);
muzzleA.position.set(0, -0.008, 0.04);
headA.add(muzzleA);
const noseA = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), mat(NOSE, 0.95, 0));
noseA.position.set(0, -0.005, 0.068);
headA.add(noseA);
for (const ex of [-0.032, 0.032]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), mat(EYE, 0.4, 0));
    eye.position.set(ex, 0.012, 0.033);
    headA.add(eye);
}
// lopped ears (v9: ENGLISH-LOP drop ears — long, wide, hanging OUTSIDE the
// head silhouette with tips below the chin; v7's short swing stayed inside
// the body outline = white-on-white, invisible)
for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), mat(FUR_D, 0.95, 0));
    ear.scale.set(0.8, 2.6, 0.45);
    ear.position.set(side * 0.055, -0.052, 0.018); // z held: drop-ear tips stay <= old straw extent 1.055 (envelope gate)
    ear.rotation.x = -0.25;
    ear.rotation.z = side * 0.38;
    headA.add(ear);
}
rabA.add(headA);
// straw heap AT the ramp foot (v11): the away-descending incline reads
// foreshortened from any front angle (struct-104 class — the side view
// proves the plank); a golden heap at the landing plants it visually
for (let fi = 0; fi < 4; fi++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.012, 0.13), mat(0xe6c35c, 0.95, 0));
    f.rotation.y = fi * 1.4;
    f.position.set(0.30 + Math.cos(fi * 1.9) * 0.08, 0.026, 0.965 + Math.sin(fi * 2.3) * 0.035);
    g.add(f);
}

// STRAW NEST under the loafer (v2): a bright warm patch that carries the
// 18m read — flattened disc + wisps at the ramp foot. Rabbits nest in
// straw; the patch reads as bedding from across the yard.
const nest = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), mat(0xe6c35c, 0.95, 0)); // v7: golden straw — the shared STRAW 0xd8ea70 read "green blob" at 5m
nest.scale.set(1.25, 0.14, 1.0);
nest.position.set(0.64, 0.0245, 0.88); // v11: centered under the sitter (judge: perched at right edge); left lobe tucks against the ramp side = straw at the ramp base
g.add(nest);
for (let ni = 0; ni < 5; ni++) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.012, 0.14), mat(STRAW, 0.95, 0));
    w.rotation.y = ni * 1.1;
    w.position.set(0.66 + Math.cos(ni * 2.1) * 0.1, 0.035, 0.88 + Math.sin(ni * 1.7) * 0.07);
    g.add(w);
}
rabA.position.set(0.68, 0.02, 0.88); // v8: right lobe of the nest, clear of the ramp lane (x<=0.51) — v7 sat her through the ramp foot
g.add(rabA);

// B: the sentinel — upright alert sitter on the grass (was rabbit_hop:
// frozen mid-hop stretch + 1cm-wide ears, sub-pixel at 18m). Now: proper
// bunny sit — pear body, chest up, THE tall ears (18.5cm). Group origin at
// pose base; head hinged at the neck (y .185); ears hinged at the crown.
// v4: pale chest + belly (wild-rabbit cream underside showing in the
// upright pose) — the value break the dark silhouette needed at 18m.
const rabB = new THREE.Group();
rabB.name = "rabbit_alert";
rabB.rotation.y = 0.45; // v5: chest toward the +z camera (was -0.75, turned away — judge v4: cream chest unresolvable)
const body = new THREE.Mesh(new THREE.SphereGeometry(0.088, 10, 8), mat(FUR_D, 0.95, 0));
body.scale.set(0.9, 1.15, 0.85);
body.position.set(0, 0.105, -0.01);
rabB.add(body);
const chest = new THREE.Mesh(new THREE.SphereGeometry(0.058, 8, 6), mat(FUR_C, 0.95, 0));
chest.scale.set(0.95, 1.25, 0.75); // v8: bigger — chin-to-belly cream column (judge v7: faint)
chest.position.set(0, 0.115, 0.05);
rabB.add(chest);
// pale belly (v4): the wild-rabbit cream underside, wrapping low under the
// body — the light mass low on the silhouette at distance
const belly = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 6), mat(FUR_C, 0.95, 0));
belly.scale.set(0.78, 0.85, 0.68); // v8: bigger
belly.position.set(0, 0.055, 0.0);
rabB.add(belly);
// haunches
for (const side of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.038, 7, 5), mat(FUR_D, 0.95, 0));
    h.scale.set(0.8, 1.1, 1.15);
    h.position.set(side * 0.058, 0.075, -0.055);
    rabB.add(h);
}
// front paws planted (v10: taller + overlapping the chest column — at
// v9 the low paw mounds read as detached ovals in shadow from close range)
for (const px of [-0.022, 0.022]) {
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 4), mat(FUR_D, 0.95, 0));
    paw.scale.set(1, 1.6, 1.5);
    paw.position.set(px, 0.028, 0.1);
    rabB.add(paw);
}
// tail puff
const tailB = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 4), mat(TAILW, 0.95, 0));
tailB.position.set(0, 0.1, -0.095);
rabB.add(tailB);
// head group — NOD anchor (head-nod pendulum about the neck)
const headB = new THREE.Group();
headB.name = "rabbit_alert_head";
headB.position.set(0, 0.185, 0.045); // neck joint
const skullB = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), mat(FUR_D, 0.95, 0));
headB.add(skullB);
const muzzleB = new THREE.Mesh(new THREE.SphereGeometry(0.021, 7, 5), mat(FUR_D, 0.95, 0));
muzzleB.scale.set(0.9, 0.7, 1.3);
muzzleB.position.set(0, -0.008, 0.034);
headB.add(muzzleB);
const noseB = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 4), mat(NOSE, 0.95, 0));
noseB.position.set(0, -0.005, 0.057);
headB.add(noseB);
for (const ex of [-0.027, 0.027]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 6, 4), mat(EYE, 0.4, 0));
    eye.position.set(ex, 0.01, 0.028);
    headB.add(eye);
}
// ears group — FLICK anchor (swivel pendulum about the crown), the tall
// upright pair. fauna-4 v2: 18.5cm tall AND pale-furred with cream inner
// faces — the ear tips are the palest thing on the silhouette's top edge
// (judge v1: grey ears on a dark subject at 18m collapsed to one blob;
// real proportions, honest contrast: many agouti rabbits carry pale ears).
// v7: inner faces pushed 8mm proud of the outer shells (v6's 2mm sat
// behind the silhouette edge — judge: invisible at 5m).
const earsB = new THREE.Group();
earsB.name = "rabbit_alert_ears";
const earGeoB = new THREE.SphereGeometry(0.016, 7, 5);
for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(earGeoB, mat(FUR_D, 0.95, 0));
    ear.scale.set(1.9, 5.8, 0.55);
    ear.position.set(side * 0.032, 0.088, -0.004);
    ear.rotation.z = side * 0.26;
    earsB.add(ear);
    // pale inner face (near-white) — the species-true two-tone that survives
    // distance as one pale marker per ear
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 4), mat(FUR_C, 0.95, 0));
    inner.scale.set(1.6, 5.0, 0.4); // v8: wider pale face
    inner.position.set(side * 0.032, 0.085, 0.012); // 8mm proud of the outer face (z .004→.012)
    inner.rotation.z = side * 0.26;
    earsB.add(inner);
}
headB.add(earsB);
rabB.add(headB);
rabB.position.set(0.95, 0.02, 0.52);
g.add(rabB);

function box0(name: string, w: number, h: number, d: number, x: number, y: number, z: number, c: number) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, 0.9, 0));
    m.name = name;
    m.position.set(x, y, z);
    g.add(m);
}

mergeByMaterial(g, "rh3");
writeFileSync("agents/arthur/assets/village_hutch3.glb", toGLB(g));
console.log("village_hutch3.glb —", g.children.length, "top-level");
