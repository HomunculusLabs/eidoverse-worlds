// mkv3-frog1.ts — fauna loop 29: THE POND FROG (FAUNA-PLAN queue head,
// proposed fauna-24 cadence, queued fauna-29). Village logic: the reedpool
// (fauna-3/9/11) lives from three sides — ducks W lobe, robin N rim, geese
// SW bank — but the WATER's own voice is missing. A common frog sits
// sit-and-wait on the water itself, the pool's quiet resident: an
// ENCOUNTER-reward species (robin law — a 0.09m frog reads at the 4m bank
// vantage; 18m framing-limited, disclosed).
//
// ONE entity (nx-dress-frog-001), TRUE-SIZE authored directly (fauna-13
// law — no group scales, no bake). Water-rider concentric with the host
// (struct-19 class, ducks precedent): the pad is a lily pad ON the water
// surface, NOT a bank stone — the frog occupies the one place no other
// pool animal can (the middle of the water) and completes the pool's
// fourth side: the surface itself.
//
// WATER PLANE LAW (this tick's decode): pool host lib 7d770620bb1b7bdc
// matches local reedpool3 bytes; the water disc is mesh 0 top at
// host-local y 0.140 (NOT the rim 0.261 the duck placer used — recorded
// as the ducks' own defect note in FAUNA-PLAN). Frog entity frame: pad
// top EXACTLY at local y=0 (pad slab 0.022 thick spans y −0.022..0; its
// top face is the entity's waterline) — feet at 0, body on the pad.
// Entity PY = world water top at the seat.
//
// Species sketch (plan): green-brown mottled body 0x6b7a4a, squat body
// plan, prominent gold-rimmed eye bumps, folded hind legs, ~0.09m.
// Species law (identity at the encounter read, robin framing law):
// a frog reads by (a) the squat wide-head silhouette — head width ≈ body
// width, wider than long is WRONG, (b) the two GOLD-RIMMED eye bumps on
// TOP of the head (the one marker no toad/lizard carries), (c) the
// folded Z of the hind leg pressed to the flank (the squat read), (d)
// the lily pad under it (context does the class-lifting). 18m carries
// pad-dot + ripple only, disclosed.
//
// Anchors (KEEP(frog) added to mergekit this tick — collision-proof
// prefix, no other asset names frog*): frog (breathing/throat group
// origin at body center), frog_head (blink/throat-scan pendulum Y — a
// frog's idle is the slow head turn sizing the world), frog_throat
// (NESTED in head: the throat-sac pulse pendulum Z rides the head turn,
// peacock-crest nesting law) — 3 comp targets, 3 comps (plan sketch
// "breath + rare blink/throat pulse"; the bob IS the breath).
// Motion payloads live in the placer (fauna29-place-frog.ts).
//
// Furniture: the pad IS the furniture (ducks law — the pool is the
// furniture; the rider adds no timber). ONE ripple ring under the pad
// (water palette 0x5d7d8c, ducks ripple family) + 3 water-line specks
// (duck down-quill law: tiny quiet cues that the surface is a surface).
// NO grit/straw/pebbles — debris law (turkey law f; the frog's
// stillness IS the read).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law; tex-23 freed the animals).
// v4 (judge r1): WARMER OLIVE-BROWN body against the COOL green pad —
// green-on-green merged into one blob at 4m (peahen law b: identity
// contrast is VALUE contrast; the European common frog is olive-brown).
const BODY = 0x8d7b4c;    // warm olive-tan, one step LIGHTER (judge r4: away from pad green)
const BODY_D = 0x6b5c35;  // darker olive mottle — back blotches, leg bars
const BELLY = 0xd8cfa8;   // pale cream underside (frog, not toad)
const EYE_GOLD = 0xe8bb50; // bright saturated gold (judge r5 rec 1: glint over size)
const EYE_BLK = 0x0e0c07;  // pupil — near-black
const NOSTRIL = 0x3a3220;  // dark nostril dots
const SHADOW = 0x3d5230;   // contact shadow on the pad (judge fix 4)
// pad: broad flat lily pad — mottled green (own texMat, water-plant family)
const PAD = texMat("frog-pad", [0x4e6b3d, 0x46603a, 0x57753f], { rough: .9, scale: 1.4, weights: [2, 2, 1], seed: 2929 });
const RIPPLE = mat(0x5d7d8c, 0.3, 0.4); // ducks ripple family

const UP = new THREE.Vector3(0, 1, 0);

// seeded LCG (deterministic rebuilds)
let sseed = 29;
const rnd = () => (sseed = (sseed * 16807) % 2147483647) / 2147483647;

// ---- THE PAD (top face at y=0; slab below) ----
{
    // a lily pad with one classic notch: a flat cylinder with a wedge cut
    // read — built as a squashed sphere-disc (no boolean needed; the notch
    // is suggested by an overlapping darker wedge sliver at the rim)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.105, 0.022, 18), PAD);
    pad.name = "pad";
    pad.position.y = -0.011; // top face exactly at 0
    g.add(pad);
    // slight rim lip: a torus at the pad edge, same material family tone
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.006, 5, 20), mat(0x46603a, 0.9, 0));
    lip.rotation.x = Math.PI / 2;
    lip.position.y = -0.002;
    g.add(lip);
    // the notch wedge: DELETED at judge r2 (read as a detached dark
    // fragment at the pad's left edge — turkey law f: decoration that
    // reads as defect is defect)
    // vein hint: DELETED at judge r5 (its aft end poked past the body
    // rear and read as a TAIL SPIKE from the bridge vantage — frogs are
    // tailless; the pad mottle carries the leaf read alone)
    // ripple ring around the pad (wake geometry, water palette — ducks law).
    // VISIBILITY LAW: the pool water disc is OPAQUE (mat, no transmission)
    // — anything below the surface face is hidden. The ring center rides
    // +0.004 ABOVE local 0 so it crests the water as a wake (its lower
    // cheek submerges — the floating read).
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.007, 5, 24), RIPPLE);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.004;
    g.add(ring);
    // water-line specks: DELETED at judge r2 (the left-edge one read as a
    // floating/detached fragment — debris law; the wake ring alone carries
    // the surface read)
    // contact shadow (judge fixes r1/r2): flat dark ellipse on the pad top,
    // BIGGER + DARKER — the body's footprint must separate from the pad
    // value; at TOP LEVEL (never inside the bobbing frog group — a shadow
    // does not breathe)
    const cshadow = new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.050, 0.002, 16), mat(0x2e3d24, 0.95, 0));
    cshadow.scale.set(1, 1, 1.6);
    cshadow.position.set(0, 0.0012, -0.004);
    g.add(cshadow);
}

// ---- THE FROG (feet on the pad top: y0 = 0) ----
const frog = new THREE.Group();
frog.name = "frog";

// body: SQUAT oval (judge r5: from above, width ≈ length — the top-read
// amphibian proportion; a long narrow oval reads slug). Widened x, foreshortened z.
const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 11), mat(BODY, 0.92, 0));
hull.scale.set(0.036, 0.021, 0.044);
hull.position.set(0, 0.024, -0.004);
frog.add(hull);
// raised HAUNCH MASSES at the flanks (judge r5: the folded-leg read from
// above comes from bilateral cresting humps, not buried struts) — seated
// spheres at the hips, proud of the widened hull (x ±0.041 vs hull 0.036)
for (const side of [-1, 1]) {
    const haunch = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(BODY, 0.92, 0));
    haunch.scale.set(0.011, 0.013, 0.020);
    haunch.position.set(side * 0.033, 0.024, -0.020);
    frog.add(haunch);
}
// dorsal mottle: darker blotch masses on the back (geometry, not texture —
// sheep-pad law: flat reads fake; small seated masses read as mottle)
for (let k = 0; k < 5; k++) {
    const blotch = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 5), mat(BODY_D, 0.92, 0));
    const a = rnd() * Math.PI * 2, r = 0.010 + rnd() * 0.014;
    blotch.scale.set(0.008 + rnd() * 0.006, 0.004, 0.010 + rnd() * 0.008);
    blotch.position.set(Math.cos(a) * r * 0.7, 0.038 - rnd() * 0.006, -0.004 + Math.sin(a) * r * 1.6);
    frog.add(blotch);
}
// pale belly strip low on the flanks (frog-not-toad cue, encounter scale)
const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(BELLY, 0.92, 0));
belly.scale.set(0.027, 0.013, 0.040);
belly.position.set(0, 0.013, -0.002);
frog.add(belly);

// ---- head subtree (origin = neck seam, behind the eyes) ----
const head = new THREE.Group();
head.name = "frog_head";
head.position.set(0, 0.030, 0.030); // joint at the body's shoulder
// skull: WIDE and blunt — head width ≈ 0.066, nearly the body width (the
// squat read: a narrow head reads lizard). Wider still at r6.
const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), mat(BODY, 0.92, 0));
skull.scale.set(0.033, 0.017, 0.024);
skull.position.set(0, 0.002, 0.010);
head.add(skull);
// snout: blunt rounded muzzle, nostrils on top near the tip
const snout = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 7), mat(BODY, 0.92, 0));
snout.scale.set(0.024, 0.010, 0.013);
snout.position.set(0, 0.000, 0.028);
head.add(snout);
for (const side of [-1, 1]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.0016, 5, 4), mat(NOSTRIL, 0.9, 0));
    nostril.position.set(side * 0.006, 0.008, 0.038);
    head.add(nostril);
}
// THE GOLD-RIMMED EYE BUMPS (judge r3: 2–3× larger — legibility over
// realism; the eyes are THE identity at every vantage): wide-spaced
// turrets ±0.024, big gold iris 0.012 + black pupil 0.0065 (pre-bake
// authored sizes; ×1.4 bake → ~17mm gold on a 12.6cm frog — bold, the
// stylized-village idiom the hens' combs set)
for (const side of [-1, 1]) {
    const turret = new THREE.Mesh(new THREE.SphereGeometry(0.0130, 9, 7), mat(BODY_D, 0.92, 0));
    turret.position.set(side * 0.024, 0.0125, 0.006);
    head.add(turret);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.0100, 9, 7), mat(EYE_GOLD, 0.4, 0.5));
    iris.position.set(side * 0.024, 0.0165, 0.006); // r5: rough 0.4 + metal 0.5 — the GLINT law
    head.add(iris);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0058, 8, 6), mat(EYE_BLK, 0.8, 0.15));
    pupil.position.set(side * 0.024, 0.0195, 0.006);
    pupil.scale.set(1, 0.85, 1);
    head.add(pupil);
}
// mouth line: a thin dark seam where skull meets snout, side to side
const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.0025, 0.006), mat(NOSTRIL, 0.9, 0));
mouth.position.set(0, -0.006, 0.024);
head.add(mouth);

// ---- throat sac (NESTED in head — rides the turn): the pale chin pouch
// that pulses. A slightly proud pale sphere under the chin between the
// jaw hinges; the Z-pendulum micro-amp is the pulse. ----
const throat = new THREE.Group();
throat.name = "frog_throat";
throat.position.set(0, -0.008, 0.016);
const sac = new THREE.Mesh(new THREE.SphereGeometry(0.0095, 9, 7), mat(BELLY, 0.9, 0));
sac.scale.set(1.25, 0.7, 1.0);
throat.add(sac);
head.add(throat);
frog.add(head);

// strut: a cylinder from A to B, exactly (quaternion-aligned — the folded
// leg's segments must MEET at their joints: a gap reads as a broken leg,
// fauna-11 neck-weld law applied at limb scale)
const strut = (A: [number, number, number], B: [number, number, number], r0: number, r1: number, m: THREE.Material) => {
    const a = new THREE.Vector3(...A), b = new THREE.Vector3(...B);
    const len = a.distanceTo(b);
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 7), m);
    seg.position.copy(a.clone().add(b).multiplyScalar(0.5));
    seg.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
    return seg;
};

// ---- forelimbs: propped in front, toes forward (the crouch's front) ----
for (const side of [-1, 1]) {
    // elbow at the shoulder, hand planted forward on the pad
    frog.add(strut([side * 0.020, 0.019, 0.030], [side * 0.017, 0.002, 0.052], 0.0050, 0.0042, mat(BODY, 0.92, 0)));
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.004, 0.014), mat(BODY, 0.92, 0));
    hand.position.set(side * 0.017, 0.002, 0.058);
    frog.add(hand);
}

// ---- hind legs (judge r1 fix 3: pushed OUT past the torso silhouette —
// legs visible beyond the body are the strongest small-scale frog cue):
// THE FOLDED Z pressed to the flank — thigh back-down from the hip to the
// knee BEHIND the rump, shank folded FORWARD to the ankle under the flank,
// webbed foot running BACK alongside the body (the true Z; every joint
// MEETS by the strut law). Darker bars on the shank/foot. ----
for (const side of [-1, 1]) {
    // hip → knee (judge r5 rec 3: the haunch humps — thigh nearly
    // HORIZONTAL and thick, knee pushed OUT so the femur reads as a
    // bilateral crest beside the spine, the from-above amphibian read)
    frog.add(strut([side * 0.022, 0.020, -0.010], [side * 0.047, 0.018, -0.036], 0.0090, 0.0074, mat(BODY, 0.92, 0)));
    // knee → ankle (forward, hugging the flank)
    frog.add(strut([side * 0.047, 0.018, -0.036], [side * 0.038, 0.010, -0.004], 0.0074, 0.0050, mat(BODY_D, 0.92, 0)));
    // ankle → toes (back along the flank at pad level, paddle proud)
    frog.add(strut([side * 0.038, 0.010, -0.004], [side * 0.038, 0.003, -0.042], 0.0050, 0.0038, mat(BODY_D, 0.92, 0)));
    // webbed foot paddle at the toes (broad flat box, aft, PROUD of flank)
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.0050, 0.022), mat(BODY_D, 0.92, 0));
    foot.position.set(side * 0.039, 0.0030, -0.032);
    frog.add(foot);
}

g.add(frog);

// ---- THE ×1.4 MARGINALITY BAKE (robin/owl law, judge r3 verdict) ----
// A true-9cm frog at the 4m bank vantage is ~30px tall with ~2px eyes —
// framing physics, not geometry (struct-45; three rounds proved it). The
// robin solved exactly this with a ×1.4 bake: a 12.6cm big-female common
// frog, honest at the top of the species band, and a 32cm water-lily pad
// that reads as a PAD at distance. Bake is group-local AFTER construction
// (fauna-8 law b: toGLB drops group scales — multiply positions ×1.4 and
// mesh scales ×1.4, joints included; y=0 ground plane invariant).
{
    const B = 1.4;
    g.traverse((o: any) => {
        o.position.multiplyScalar(B);
        if (o.isMesh) o.scale.multiplyScalar(B);
    });
}

mergeByMaterial(g, "lilypad");
writeFileSync("agents/arthur/assets/village_dress_frog.glb", toGLB(g));
console.log("village_dress_frog.glb —", g.children.length, "top-level");
