// mkv3-fauna34-swallows1.ts — fauna-34, barnyard barn swallows (FAUNA-PLAN
// queue row 23, proposed fauna-33). The livery's aerial species: the bird
// that sweeps the yard between the horses at the rail and the owl on the
// post. Pure-motion fauna class (fauna-32 bees precedent): ZERO ground
// geometry, zero furniture — the standing yard IS the context (stable W,
// horses under, owl post beside, pergola S, ruledtower E).
//
// Species: barn swallow (Hirundo rustica) — THE forked tail (the 18m
// marker), steel-blue back + dark wings, cream underparts, rufous face
// patch, tiny bill. True size ~0.18m body: NO marginality bake needed (a
// bird, not an insect — at 18m ≈ 10px readable; the plan row's own math).
//
// Flight: 3 birds, 3 concentric-independent CIRCLES in the yard's open air
// (orbit parts, xz-plane circles only — the plan row's RISK resolved by
// keeping every ring inside the yard's clear envelope; no path motion
// needed). degPerSec all POSITIVE (orbit face rotation.y = a+π/2 points
// local +z along velocity only for +ȧ — bees v5 facing law; a negative
// rate flies tail-first).
//
// ENTITY SEAT: (49.5, PY, 0) yaw 0 — the yard center (the horses' own
// x/z); all coords below are SEAT-LOCAL (subtract 49.5 from world x).
// Ring law (yard clear-envelope decode, census 2026-09-19 + fauna-19/8
// records): stable world x 42.08..43.92 (yaw −π/2 puts its 6m length
// along z) z −1.5..1.5 top 5.1 → local x −7.42..−5.58; horses local
// x −1.55..2.55 z −1.66..1.66 top 1.923; owl post local (−0.7, 4.2)
// r 0.33 top 2.95; wavepergola z ≥ 6.78 top 4.62; ruledtower local
// x ≥ 4.0 top 7.19. Rings (local):
//   A (−1.9, 2.40, −1.9) r 2.6 → clears horses VERTICALLY (2.40−0.055
//     flap dip − 0.02 half-body = 2.325 vs 1.923 → 0.40m); stable local
//     x-min −4.5 ✓
//   B (1.9, 2.50, 4.5) r 1.8 → tower local x-max 3.7 (0.3 clear), pergola
//     z-max 6.3 (0.48), owl dist 2.62 vs 1.8+0.39 ✓
//   C (0.4, 3.60, 1.0) r 3.0 → the high sweep OVER the yard center;
//     crosses A/B flight circles only with 1.1-1.2m vertical separation
//     (real flock crossing); owl post: ring xz-projection kisses the post
//     footprint but rides 0.59m ABOVE its 2.95 top; horses vertical ✓✓
// Speeds 44-62°/s → 2.0-2.4 m/s tangential (the sweep, not the hover).
//
// Wings flap as nested keep-groups (pendulum about the shoulder, pivot
// [0,0,0] = wing group origin at the shoulder; dihedral baked into blade
// mesh transforms so the flap axis [0,0,1] stays clean — pendulum
// composes on base pose, motion.js rotatePartAtPivot). Left wing amp
// NEGATIVE (mirrored: +θ about z lifts a +x tip and drops a −x tip —
// both tips must rise together).
//
// Anchors: swallow_1..3 + _wingL/_wingR (9 KEEP groups; `swallow_`
// added to mergekit KEEP this tick). Merge prefix `fauna34_sky` must NOT
// match ^swallow (frog merge-prefix law).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const BACK  = mat(0x2e4a5c, .75, 0);  // steel-blue back+cap (identity value)
const WINGM = mat(0x25384a, .70, 0);  // darker blue-grey wings
const CREAM = mat(0xede7d8, .85, 0);  // underparts + forehead patch
const RUMP  = mat(0x1e2c38, .80, 0);  // dark rump band
const RUF   = mat(0xb35a3a, .85, 0);  // rufous throat/face patch
const BILL  = mat(0x14100c, .80, 0);  // tiny dark bill
const EYE   = mat(0x0a0806, .50, 0);  // dark eyes

// ---- one barn swallow, ~18cm body, per-individual scale s ----
// Rest pose = its phase-0 orbit point (no pop at spawn — bees law):
// pos = center + r·(sin a, 0, cos a), yaw = a + π/2 (face along velocity).
// v5 BANK LAW: circling swallows bank into the turn — all our rings fly
// a-increasing (turning left, center on the bird's left), so the BODY
// group carries +0.22 rad roll (left wing down). The orbit comp SETS the
// anchor's rotation (0, yaw, 0) — wiping any authored roll — so the bank
// lives in a nested `body` group inside the anchor (wing-survival law,
// generalized to the whole body). This also tilts the tail fan plane so
// the fork reads from rear vantages (v4 dead-rear: foreshortened blob).
function swallow(name: string, cx: number, cy: number, cz: number,
                 r: number, phase: number, s: number) {
  const a = phase;
  const grp = new THREE.Group();
  grp.name = name;
  grp.position.set(cx + r * Math.sin(a), cy, cz + r * Math.cos(a));
  grp.rotation.y = a + Math.PI / 2;
  const body = new THREE.Group();
  body.name = `${name}_body`;
  body.rotation.z = 0.22;                    // bank left — into the turn
  grp.add(body);
  const B = body;

  // hull (steel blue) — slim darting body, local +z = flight front
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.036*s, 0.020*s, 0.070*s), BACK);
  B.add(hull);
  // cream underparts (the light underside read from below — yard readers
  // look UP at 2.4-3.6m birds from 1.65m eyes); v3: WIDER than the hull
  // (0.040 vs 0.036) and dropped 1mm — v2's 0.033 box sat fully inside
  // the hull silhouette: invisible from side AND below by construction
  // (struct-52; judge: "no cream anywhere" — geometrically true)
  const under = new THREE.Mesh(new THREE.BoxGeometry(0.040*s, 0.012*s, 0.052*s), CREAM);
  under.position.set(0, -0.008*s, 0.002*s); B.add(under);
  // dark rump band at the tail base (species marker from above)
  const rump = new THREE.Mesh(new THREE.BoxGeometry(0.030*s, 0.014*s, 0.020*s), RUMP);
  rump.position.set(0, 0.002*s, -0.030*s); B.add(rump);
  // THE DEEP FORK: two streamers + the short closed web between them.
  // Total tail read ~0.105 behind the hull — the 18m/2m species marker.
  // v2: cant ±0.11 + 5.5mm streamers. v3: cant ±0.16, 6mm streamers,
  // web 0.024, streamers pitched tips-down 0.10. v4: cant ±0.28 (tips
  // x ±0.038, spread 76mm — WIDER than the hull: the V clears the body
  // silhouette from dead-rear, where v3's notch was a dark-on-dark slot
  // between web and rump — judge read "one solid mass"), web shrunk to
  // 0.014×0.018. Species-fair: these birds CIRCLE — a turning swallow
  // fans its tail; straight-flight closure is the side/below read.
  for (const side of [-1, 1]) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.006*s, 0.0035*s, 0.105*s), WINGM);
    st.position.set(side*0.009*s, -0.002*s, -0.085*s);
    st.rotation.y = -side * 0.28;            // fanned cant — the turning tail
    st.rotation.x = 0.10;                    // streamers trail slightly down
    grp.add(st);
  }
  const web = new THREE.Mesh(new THREE.BoxGeometry(0.014*s, 0.003*s, 0.018*s), WINGM);
  web.position.set(0, -0.003*s, -0.040*s); B.add(web);

  // head block at the front (cap = BACK steel blue)
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.020*s, 0.014*s, 0.024*s), BACK);
  cap.position.set(0, 0.008*s, 0.040*s); B.add(cap);
  // cream forehead patch (sits just above the bill — species-true)
  const fh = new THREE.Mesh(new THREE.BoxGeometry(0.014*s, 0.008*s, 0.006*s), CREAM);
  fh.position.set(0, 0.012*s, 0.050*s); B.add(fh);
  // rufous throat/face patch under the head front; v2: slightly bolder
  const ruf = new THREE.Mesh(new THREE.BoxGeometry(0.015*s, 0.009*s, 0.012*s), RUF);
  ruf.position.set(0, 0.002*s, 0.049*s); B.add(ruf);
  // tiny bill, proud forward
  const bill = new THREE.Mesh(new THREE.BoxGeometry(0.004*s, 0.0035*s, 0.014*s), BILL);
  bill.position.set(0, 0.006*s, 0.056*s); B.add(bill);
  // dark eyes, side-set
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.002*s, 0.0035*s, 0.0045*s), EYE);
    eye.position.set(side*0.0102*s, 0.009*s, 0.044*s); B.add(eye);
  }

  // wings — nested keep-groups at the shoulders; blades carry dihedral.
  // v2: 4mm-thick blades with z-stagger + shoulder ROOT box — the
  // profile-plane silhouette of a spread wing (judge v1: edge-on
  // paper-thin blades read as NO wings; a gun's receiver). 4mm at the
  // 0.7m contract vantage ≈ 3px, readable.
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    wing.name = `${name}_wing${side < 0 ? "L" : "R"}`;
    wing.position.set(side*0.017*s, 0.004*s, 0.005*s);
    // shoulder root: a small dark wedge tying the wing to the hull
    const root = new THREE.Mesh(new THREE.BoxGeometry(0.014*s, 0.006*s, 0.024*s), WINGM);
    root.position.set(side*0.007*s, 0.0005*s, 0.0);
    wing.add(root);
    // 3 tapering blades outward with rising dihedral (flight posture).
    // v6: blade Y-thickness 8/8/6mm (was uniform 4mm) — the dihedral
    // rise steps (1.5→6→13mm) between 4mm-thick blades left stair gaps
    // that read from exact side as a "floating detached plate" (judge,
    // swallow_3); a thicker rising wedge reads as one wing surface.
    const blades: [number, number, number, number, number, number, number][] = [
      // [center-x, length, chord, y-rise, dihedral rz, z-offset, y-thick]
      [0.022, 0.034, 0.030, 0.0015, 0.10, 0.000, 0.008],
      [0.056, 0.036, 0.024, 0.0060, 0.24, 0.006, 0.008],
      [0.088, 0.038, 0.017, 0.0130, 0.38, 0.014, 0.006],
    ];
    for (const [bx, bl, bc, by, rz, zo, yt] of blades) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bl*s, yt*s, bc*s), WINGM);
      b.position.set(side*bx*s, by*s, -0.004*s + zo*s);
      b.rotation.z = -side * rz;             // mirrored dihedral
      wing.add(b);
    }
    B.add(wing);
  }
  g.add(grp);
}

// three birds, three independent rings, phases staggered, sizes varied
swallow("swallow_1", -1.9, 2.40, -1.9, 2.6, 0.0, 1.00);  // ring A, 52°/s
swallow("swallow_2",  1.9, 2.50,  4.5, 1.8, 2.1, 1.06);  // ring B, 62°/s
swallow("swallow_3",  0.4, 3.60,  1.0, 3.0, 4.2, 0.94);  // ring C, 44°/s

mergeByMaterial(g, "fauna34_sky");
writeFileSync("agents/arthur/assets/village_fauna34_swallows.glb", toGLB(g));
console.log("village_fauna34_swallows.glb —", g.children.length, "top-level nodes");
