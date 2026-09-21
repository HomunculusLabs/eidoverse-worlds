// mkv3-fauna75-carp1.ts — fauna-75, common carp (FAUNA-PLAN queue row 48,
// proposed fauna-74). The fleet's first FISH and the angler's implied
// catch: the reedpool's water column is empty (six residents read ON or
// ABOVE the surface; nothing lives UNDER it), and the NE open-water
// quadrant carries no resident at all. The carp (Cyprinus carpio) is THE
// European village-pond fish — the dark shadow that cruises just under
// the surface.
//
// OPAQUE-WATER VISIBILITY LAW (fauna-29 law a) governs the whole build:
// anything below the water face is invisible by construction, so the carp
// reads as a SURFACE EVENT — the dark bronze-olive back slotted between
// wake geometry + ONE tall serrated dorsal fin cresting the waterline +
// the half-cocked tail tip breaking the surface aft — never a full fish.
// Head/pectorals/keel exist underwater for geometry-honesty only.
//
// ONE entity (nx-dress-carp-001), SINGLE large mirror carp ~65cm class,
// TRUE-SIZE authored directly (hare/stork law — no bake: the surface
// event is large). Cruising posture, head +z LOCAL (bees v5 facing law:
// part-orbit sets rotation.y = a + π/2, which points LOCAL +z along the
// velocity), so the authored rest yaw is π/2 (heading +x entity-frame).
//
// Anchors (KEEP(^carp) added to mergekit this tick — collision-proof
// prefix, verified zero carp* node tokens across mkv3 sources +
// gitignored assets; prose "carpet/carpentry" in menger/mason only):
//   carp       — the whole fish + its traveling wake (orbit target: THE
//                CRUISE, duck_b precedent scaled slower)
//   carp_dfin  — serrated dorsal fin (bob: fin waterline wash)
//   carp_tail  — half-cocked caudal (pendulum: the slow tail-slide)
// 3 comps live in the placer; phases staggered, epoch t0.
//
// Furniture: surface WAKE ONLY (ducks/swan law — the pool IS the host,
// zero ground geometry): dark calm annulus + deep contact disk + ripple
// torus, all children of the carp group so they TRAVEL with the orbiting
// fish (the cruiser's shadow moves). Waterline discipline verbatim from
// mkv3-fauna63-swan1.ts: group origin at entity-frame WL 0.02; entity
// PY = water top world 0.08093 − 0.02 (swan/fauna-31 waterline law).
//
// Seat (host-local, frame-copy class): cruise ring center (2.1, 1.15)
// r 0.5 degPerSec 8 — the NE open water. Clearances: bridge deck E edge
// x 0.95 vs worst hull tip 1.53 (0.58m); NE reed cluster (4.1,1.4) 0.90m
// (frog-reed 0.73 precedent); heron (3.20,-0.40) co-resident class
// ~0.9m; ellipse worst 0.50 < 1 (in); masts (1.25,3.8) 2.3m. Phase-0
// rest point (2.1, 1.65) = authored group pose — no pop when the orbit
// engages (duck law).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const WL = 0.02; // entity-frame waterline (carp group origin sits here)

const BACK  = mat(0x535d38, .70, 0);   // bronze-olive back, cooled slightly green (r7: the warm
                                        // olive sat in the bridge-plank family and risked a
                                        // "floating leaf" read); lum ~85, one clear step ABOVE
                                        // the disk seat and BELOW the water base
const FINM  = mat(0x7d7a52, .75, 0);   // fins — lum ~114, above the water base: dry fins cresting
                                        // the water catch sun (r8: one more notch; the r7 value
                                        // still read low-contrast against the back from the deck)
const WAKE  = mat(0x5d7d8c, 0.3, 0.4);  // bow strokes — mid-bright water lines
const DISK  = mat(0x48626e, 0.35, 0.4); // the shadow — one step darker than the water base
const STREAK= mat(0x5a7480, 0.3, 0.4);  // THE TRAIL — LIGHTER than the fish, near-water value
                                        // (judge r9's decisive fix: "real subsurface wake reads
                                        // lighter than the object making it"; the dark streak
                                        // read as an elongated shadow / long-tailed fish)
const RIPPLE= mat(0x6f93a4, 0.3, 0.4);  // bright water family — bow stroke accents

// ---- the carp (one group: fish + traveling wake) ----
const grp = new THREE.Group();
grp.name = "carp";
// phase-0 orbit point == authored rest pose (no-pop law); heading +x
// v8: ring center (1.95, 1.05) — the ORBIT-SWEPT-WORST law (pitfall-10
// class): a group-local offset of length L sweeps to |c|+r+L at the worst
// ring phase; center pulled in + wake offsets capped <=0.52 so the worst
// swept radius stays 2.95 < the rim's 3.05 z-semi-axis (r7's 0.80 trail
// swept to 3.48 — OUT)
grp.position.set(1.95, WL, 1.55);
grp.rotation.y = Math.PI / 2;

// hull — deep-bodied mirror carp: body depth ~1/3 length. Long axis z
// (fore-aft); the back crests ~25mm above the waterline, keel drafts deep
// (invisible by construction — opaque-water law).
const hull = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 9), BACK);
hull.scale.set(0.95, 1.05, 2.9);   // r3: width 0.19 — a carp's back is ~1/3 its length in
hull.position.set(0, -0.08, 0);    // plan view (r2's 0.144 read "sliver/leaf")
grp.add(hull);
// shoulder hump — the deep-bodied girth aft of the head (below hull crest)
const hump = new THREE.Mesh(new THREE.SphereGeometry(0.088, 10, 8), BACK);
hump.scale.set(0.95, 1.0, 1.3);
hump.position.set(0, -0.07, 0.03);
grp.add(hump);
// head — blunt cone to the snout, fully underwater (geometry-honest only)
const head = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.10, 9), BACK);
head.rotation.x = Math.PI / 2;
head.position.set(0, -0.085, 0.30);
grp.add(head);
// pectoral fins — small side blades, underwater
for (const s of [-1, 1]) {
    const pect = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.024, 0.05), FINM);
    pect.position.set(s * 0.062, -0.10, 0.16);
    pect.rotation.y = s * 0.5;
    pect.rotation.z = -s * 0.4;
    grp.add(pect);
}

// ---- THE SERRATED DORSAL FIN (the surface marker) ----
// One tall plate raked slightly aft + two ray nubs proud of the top edge
// = the serrated crest. Base embeds 18mm into the back (struct-52 law:
// attached, never floating); v3: crest ~98mm above the waterline, plate
// 18mm wide — the fin must crest BOTH the back mass (top-down vantage)
// and the waterline (oblique vantages); r2's 75mm flush fin did not read
// from the bridge-deck reader (judge: "the aft crest sells it, the
// dorsal does not").
const dfin = new THREE.Group();
dfin.name = "carp_dfin";
dfin.position.set(0, 0, 0.04);
const plate = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.080, 0.17), FINM);
plate.position.set(0, 0.047, 0);
plate.rotation.x = -0.12;
dfin.add(plate);
// r6/r7 TRUE SERRATION — bulges ACROSS the spine line (x-width), spread
// along it and VARIED small–large–small (r6: clustered same-size nubs
// read "three specks", not a crest)
{
    const SERR: Array<[number, number, number]> = [
        [-0.052, 0.040, 0.070],
        [0.004, 0.056, 0.096],
        [0.058, 0.040, 0.070],
    ];
    for (const [nz, wx, h] of SERR) {
        const nub = new THREE.Mesh(new THREE.BoxGeometry(wx, h, 0.026), FINM);
        nub.position.set(0, 0.087 + h / 2 - 0.006, nz);
        nub.rotation.x = -0.12;
        dfin.add(nub);
    }
}
grp.add(dfin);

// ---- THE HALF-COCKED TAIL (the aft surface break) ----
// Peduncle narrows the stern; upper lobe cocked up-aft so its tip breaks
// the surface ~45mm (the cruiser's second small crest); lower lobe under.
const tail = new THREE.Group();
tail.name = "carp_tail";
tail.position.set(0, -0.01, -0.26);
const ped = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.09), BACK);
ped.position.set(0, 0, 0);
tail.add(ped);
// r4: the upper lobe rides the LIGHT fin family — a dark lobe on the fin's
// axis completed a straight "twig" gestalt (judge r4); light fins bracket
// the dark body instead
const upper = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.065, 0.080), FINM);
upper.position.set(0, 0.026, -0.048);
upper.rotation.x = -0.48;
tail.add(upper);
// r9 tail-tip FLARE (judge r8: "the filament reads as a whisker; give it
// a fin-like flare at the tip") — a wider flat blade at the lobe's end
const flare = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.026, 0.055), FINM);
flare.position.set(0, 0.056, -0.092);
flare.rotation.x = -0.48;
tail.add(flare);
const lower = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.06, 0.055), FINM);
lower.position.set(0, -0.035, -0.035);
lower.rotation.x = 0.5;
tail.add(lower);
grp.add(tail);

// ---- the traveling wake (children of the fish — they orbit with it) ----
// r9 SOLID-SHAPE wake (judge r8's decisive finding: every ring fragment,
// fore and aft, was being summed by the eye into ONE broken donut —
// "still a large roughly symmetric circular ring system"). No ring
// geometry survives: (1) THE TRAIL — ONE tapering teardrop STREAK
// (ShapeGeometry, quadratic taper to a point) attached at the tail,
// widening slightly then fading aft to 0.85 (streak class: oblique
// rectangle; rim: nearest-normal 1.60 from center (1.95,1.05), r 0.5 +
// 0.85 = 1.35 < 1.60); (2) THE SHADOW — a slim scaled-x ellipse hugging
// UNDER the hull footprint (mostly hidden by the body above); (3) THE
// BOW-V — two SOLID short strokes swept aft from the snout's sides.
const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.15, 18), DISK);
shadow.rotation.x = -Math.PI / 2;
shadow.scale.set(1, 1, 2.2);
shadow.position.set(0, WL - 0.02 + 0.003, -0.03);
grp.add(shadow);
// THE TRAIL: solid tapering streak — wide at the tail (0.30), quadratic
// taper to a point 0.85 aft. Shape in fish XY, rotated flat.
{
    const shape = new THREE.Shape();
    shape.moveTo(-0.15, 0);
    shape.quadraticCurveTo(-0.05, -0.46, 0, -0.85);
    shape.quadraticCurveTo(0.05, -0.46, 0.15, 0);
    shape.closePath();
    const streak = new THREE.Mesh(new THREE.ShapeGeometry(shape, 12), STREAK);
    streak.rotation.x = -Math.PI / 2;
    streak.position.set(0, WL - 0.02 + 0.004, -0.22);
    grp.add(streak);
}
// THE BOW-V: two solid strokes from the head's shoulder, angled aft,
// KISSING the silhouette (judge r9: "a visible gap reads as floating
// debris; nudge them to kiss the head") — r10: pulled in 0.04 + aft 0.02
for (const s of [-1, 1]) {
    const stroke = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.26), RIPPLE);
    stroke.rotation.x = -Math.PI / 2;
    stroke.rotation.z = s * 0.35;
    stroke.position.set(s * 0.075, WL - 0.02 + 0.005, 0.27);
    grp.add(stroke);
}

g.add(grp);

mergeByMaterial(g, "fauna75_carp");
writeFileSync("agents/arthur/assets/village_fauna75_carp.glb", toGLB(g));
console.log("village_fauna75_carp.glb —", g.children.length, "top-level nodes");
