// mkv3-dress-se-mossbowls1.ts — dress-93, SE WILD moss bowls (round-3 item 12).
// Concept contract: at the SE forest edge, three water-worn basin boulders
// whose hollows hold moss — the district's quiet micro-habitat, where rain
// collects and moss takes the stone. Grounds USE: the SE wild is nature left
// to itself; these bowls are the slow accumulation the wild leaves behind
// (moss spilling from bowl to ground = long occupation, no tending).
// Distinct from dress-3 se-stones (border rock clusters) and the cairn
// (waymark stack): identity = MOSS OVERFLOWING STONE RIMS. Static, unlit —
// spends no lamp budget (SE budget 8, used 0).
// Frame: local +z = forest side (tall rim crescent); approach face local -z
// (broken low lip, moss spill). No sawn faces, no flat boxes (wild law).
//
// v3 (native 18m FAIL on v2: filled-to-brim convex domes read as mossy rock
// clump — basin concavity invisible by construction; moss value melted into
// sage terrain; stone near-black): OVERFLOWING-BOWL silhouette — tall rim
// crescent on +z, broken low lip on -z with the cushion bulging OVER the lip
// + a spill lobe running to the ground; stone lightened to mid-gray; moss
// saturated darker-green for two-way value separation; large bowl off-center.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const STONE = mat(0x8b877e, .9, 0);   // bowl 1 stone (mid gray, v3 lightened)
const STONE2 = mat(0x979288, .9, 0);  // bowl 2 stone (lightest, driest)
const STONE3 = mat(0x7d786f, .9, 0);  // bowl 3 stone (darkest, wet side)
const STONE_D = mat(0x5b564e, .95, 0); // bowl inner floor (dark pocket)
const MOSS = mat(0x679a52, .95, 0);   // cushion moss (lighter rich green, v5)
const MOSS_L = mat(0x8db877, .95, 0); // crest lobe (bright value step, v5)
const MOSS_Q = mat(0x54793f, .95, 0); // quiet ground-spread patches
const SOIL = mat(0x54493b, .98, 0);   // earth ring under each bowl
const WATER = mat(0x506a78, .25, .5); // collected rain film (palette law)
// v9: faint same-hue emissive — the polish-273/274 moonlit-water idiom;
// mesh emissive is NOT a light entity (dress-79 incense precedent, no
// lamp budget charge) — makes the pool read water, not stone-grey
(WATER as any).emissive = new THREE.Color(0x3d6272);
(WATER as any).emissiveIntensity = 0.85;
const TWIG = mat(0x71644a, .95, 0);   // litter chunks (v3: two pebbles->litter)

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};

// ---- overflowing basin bowl ----
// +z (forest) side: TALL rim crescent — the readable crater wall.
// -z (approach) side: broken LOW lip; the moss cushion bulges over it and a
// spill lobe runs down to the ground (the overflowing read = the identity).
const bowl = (
  cx: number, cz: number, rimR: number, stone: THREE.Material,
  seed: number, water: boolean,
) => {
  // earth contact ring (grounds the bowl; reads as soil stain)
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(rimR * 1.10, rimR * 1.24, 0.07, 9),
    SOIL,
  );
  ring.position.set(cx, 0.025, cz);
  ring.name = `soil_${seed}`;
  g.add(ring);

  // rim crescent: 6 tall chunks across the +z semicircle (100..260 deg)
  // v5: RAISED — y 0.30->0.34 rimR, yscale 0.75->0.95: tops ≈0.66 rimR,
  // silhouetting ABOVE the green mass (stone frames moss = the bowl read)
  for (let i = 0; i < 6; i++) {
    const a = (100 + (i / 5) * 160) * Math.PI / 180 + jit(seed + i) * 0.16;
    const rr = rimR * (0.92 + jit(seed + i + 20) * 0.16);
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(rimR * (0.30 + jit(seed + i + 40) * 0.09), 0),
      stone,
    );
    c.scale.set(1 + jit(seed + i + 60) * 0.25, 0.95 + jit(seed + i + 80) * 0.25, 0.85 + jit(seed + i + 100) * 0.25);
    c.rotation.set(jit(seed + i) * 0.25, a, 0.20 + jit(seed + i + 120) * 0.15); // lean out
    c.position.set(cx + Math.cos(a) * rr, rimR * 0.34, cz + Math.sin(a) * rr);
    c.name = `rim_${seed}_${i}`;
    g.add(c);
  }
  // broken low lip on -z: 3 squat stones with wide gaps between
  // v6: seated lower (0.16->0.12 rimR) — close judge read v5's lip chunks
  // as hovering; bottoms now visibly touch ground
  const lipA = [-50, -15, 20];
  for (let i = 0; i < 3; i++) {
    const a = lipA[i] * Math.PI / 180 + jit(seed + i + 150) * 0.2;
    const rr = rimR * (0.90 + jit(seed + i + 160) * 0.10);
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(rimR * (0.22 + jit(seed + i + 170) * 0.06), 0),
      stone,
    );
    c.scale.set(1 + jit(seed + i + 180) * 0.3, 0.35 + jit(seed + i + 190) * 0.15, 0.8 + jit(seed + i + 200) * 0.3);
    c.rotation.set(jit(seed + i + 210) * 0.3, a, 0.15);
    c.position.set(cx + Math.cos(a) * rr, rimR * 0.12, cz + Math.sin(a) * rr);
    c.name = `lip_${seed}_${i}`;
    g.add(c);
  }
  // rim crest reference: crescent tops ~ rimR*(0.30 + 0.87*0.33) ≈ 0.59*rimR

  // bowl floor: dark squat sphere — the pocket interior; v8: r 0.74->0.68
  // (stays behind the new interior front wall at 0.70)
  const floor = new THREE.Mesh(new THREE.SphereGeometry(rimR * 0.68, 9, 6), STONE_D);
  floor.scale.set(1, 0.20, 1);
  floor.position.set(cx, rimR * 0.13, cz);
  floor.name = `floor_${seed}`;
  g.add(floor);

  // interior front wall — v8: open-arc cylinder (the bowl's INSIDE face on
  // the approach side), r 0.70 rimR, h 0.34 rimR, spanning ±60° about −z.
  // This is the concave vessel cue every prior version lacked: dark inner
  // wall visible through the lip gaps, moss rising behind it.
  const innerWall = new THREE.Mesh(
    new THREE.CylinderGeometry(rimR * 0.70, rimR * 0.70, rimR * 0.34, 9, 1, true, Math.PI - 1.05, 2.1),
    STONE_D,
  );
  innerWall.position.set(cx, rimR * 0.22, cz);
  innerWall.name = `iwall_${seed}`;
  g.add(innerWall);

  // rainwater (large bowl only) — v6: GROUND POOL beside the lip, clear of
  // the spill tongue's footprint (+x of the lip gap, spill runs −x); the
  // overflow story: rain runs out the broken lip and pools on the ground.
  // v5's pool sat under the spill's z-shadow (spill top 0.107 > sightline
  // 0.098 — struct-52 dead-by-occlusion, third instance this tick)
  // rainwater (large bowl only) — v10: pool DOUBLED (r 0.30->0.55 rimR,
  // 0.32m) with decisive teal emissive: reads water at a glance, not a
  // grey pebble disc; ground pool on the −x side, clear of all geometry
  if (water) {
    // v11: pool nudged −x/−z onto FULLY open ground — v10's offset
    // (cx−1.05·rimR, cz−1.00·rimR) = (−0.909, −0.38) put its right half
    // behind the bowl's left rim from the front view (judge: half-occluded,
    // water PASS on material alone). New seat clears the bowl shell incl.
    // soil ring (0.72m) by ~0.14m, peb62 by ~0.17m, peb64 by ~0.34m, patch52
    // by ~0.4m — still reads as lip-runoff pooled forward-left of the lip.
    const w = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.55, rimR * 0.55, 0.024, 9), WATER);
    w.position.set(cx - 0.88, 0.012, cz - 0.75);
    w.name = `water_${seed}`;
    g.add(w);
  }

  // moss cushion — v8: THE CRADLE FIX. Shrunk (r 0.82->0.55) and seated in
  // the bowl's BACK half (z +0.10 rimR): front face −0.45 rimR, well inside
  // the lip (−0.90) — every prior version's cushion (z-extent −0.93) physically
  // swallowed the lip and pocket, which no nudge could fix. Top 0.54 rimR,
  // cradled below the tall back rim (0.66) behind the interior wall (0.39).
  const cush = new THREE.Mesh(new THREE.SphereGeometry(rimR * 0.55, 10, 7), MOSS);
  cush.scale.set(1.05, 0.38, 1);
  cush.rotation.y = jit(seed) * 1.2;
  cush.position.set(cx + jit(seed + 3) * 0.04, rimR * 0.33, cz + rimR * 0.10);
  cush.name = `cush_${seed}`;
  g.add(cush);

  // bright crest lobe — v8: re-seated on the new cushion's front-top
  // (the lit face of the cradled moss)
  const cap = new THREE.Mesh(new THREE.SphereGeometry(rimR * 0.34, 9, 6), MOSS_L);
  cap.scale.set(1.15, 0.5, 1.05);
  cap.rotation.y = jit(seed + 11) * 1.5;
  cap.position.set(cx + jit(seed + 13) * 0.06, rimR * 0.42, cz - rimR * 0.18);
  cap.name = `cap_${seed}`;
  g.add(cap);

  // spill tongue — v11 (water bowl only): axis RE-DERIVED + lengthened so
  // the apex lands INSIDE the landing patch ellipsoid (buried in its flank,
  // no bare-terrain gap). v10's apex (0.395, 0.011, −0.961) kissed patch
  // 56's rim — the 10–15px bare-terrain gap the judge read. True math:
  // base0 = (−0.1202, 0.2378, −0.0958) (cx+0.31·rimR etc.), target apex
  // T(0.50, 0.010, −0.96) → Δ(0.620, −0.228, −0.864), |Δ| = 1.0878, unit
  // (0.570, −0.209, −0.794); length 1.88·rimR = 1.090, center offset h/2
  // = 0.94·rimR — apex = base0 + h·unit = (0.5015, 0.0094, −0.9621), 0.047
  // below the patch's local crown y. First v11 attempt failed decode with
  // axis (0.500,−0.181,−0.847)+offset 0.525 (apex 0.527 short at
  // (0.184,0.128,−0.612)) — decode-caught, constants corrected.
  // Non-water bowls keep the accepted v10 geometry (minimal delta law).
  const v11 = water;
  const axis = v11
    ? new THREE.Vector3(0.570, -0.209, -0.794).normalize()
    : new THREE.Vector3(0.5, -0.22, -0.84).normalize();
  const spill = new THREE.Mesh(
    new THREE.ConeGeometry(rimR * 0.29, rimR * (v11 ? 1.88 : 1.78), 7),
    MOSS_L,
  );
  spill.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
  const base0 = new THREE.Vector3(cx + rimR * 0.31, rimR * 0.41, cz - rimR * 0.51);
  spill.position.copy(base0.clone().add(axis.clone().multiplyScalar(rimR * (v11 ? 0.94 : 0.89))));
  spill.name = `spill_${seed}`;
  g.add(spill);
};

// three bowls, BROKEN layout: large bowl pushed left-forward, medium right-
// back, small mid-back — no centered triad (v3: judge read v2 as composed)
// v5: bowl-2 staggered deeper (+z 0.78->1.02) — breaks the paired baseline
bowl(-0.30, 0.20, 0.58, STONE, 101, true);   // large, rain-fed (off-center)
bowl(1.10, 1.02, 0.44, STONE2, 201, false);  // medium, right-back (deeper)
bowl(-0.95, 0.88, 0.32, STONE3, 301, false); // small, mid-back

// ---- ground-spread: moss escaping the bowls (long-occupation read) ----
const patch = (x: number, z: number, r: number, seed: number) => {
  const p = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), MOSS_Q);
  p.scale.set(1 + jit(seed) * 0.5, 0.14, 0.8 + jit(seed + 5) * 0.5);
  p.rotation.y = jit(seed + 9) * 3.1;
  p.position.set(x, r * 0.10, z);
  p.name = `patch_${seed}`;
  g.add(p);
};
// v7: patch set reduced + tongue-landing continuity — one patch seats AT
// the tongue tip (overflow lands and spreads), the rest trail bowl-to-bowl
patch(0.45, 0.18, 0.30, 51);    // trailing the large bowl, +x
patch(-0.85, 0.30, 0.24, 52);   // large bowl toward small
patch(0.25, 1.15, 0.19, 53);    // behind, forest side
patch(0.52, -1.00, 0.24, 56);  // landing moss — v10 tongue apex plants INTO it

// ---- scattered wash debris: pebbles + litter chunks ----
const peb = (x: number, z: number, r: number, seed: number, litter: boolean) => {
  const c = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), litter ? TWIG : STONE2);
  c.scale.set(1 + jit(seed) * 0.4, 0.45 + jit(seed + 5) * 0.2, 0.85 + jit(seed + 9) * 0.3);
  c.rotation.set(jit(seed + 13) * 0.5, jit(seed + 17) * 3.14, jit(seed + 23) * 0.4);
  c.position.set(x, r * 0.38, z);
  c.name = `peb_${seed}`;
  g.add(c);
};
peb(0.72, -0.42, 0.09, 61, false);
peb(-0.62, -0.55, 0.07, 62, true);   // litter
peb(1.60, 0.42, 0.11, 63, false);
peb(-1.48, 0.10, 0.08, 64, true);    // litter
peb(0.10, 1.42, 0.07, 65, false);    // v5: -1.80 stray chunk removed (judge:
                                     // detached specks trailing left)

// mergekit law: flatten wrapper transforms, then merge per material (~10 nodes)
const flat = new THREE.Group();
g.updateMatrixWorld(true);
g.traverse((o: THREE.Object3D) => {
  if ((o as THREE.Mesh).isMesh && o !== g) {
    const c = new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), o.material);
    flat.add(c);
  }
});
mergeByMaterial(flat, "dress_se_mossbowls1");
writeFileSync("agents/arthur/assets/village_dress_se_mossbowls1.glb", toGLB(flat));
console.log("village_dress_se_mossbowls1.glb —", flat.children.length, "nodes");
