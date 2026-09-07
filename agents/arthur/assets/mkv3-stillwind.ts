// mkv3-stillwind.ts — STRUCTURES LANE struct-59: R4-4 THE STILLWIND WALL.
// Round 4 commission, W mid-ring spoke site (completes the cardinal set:
// NW meridianstair, S ninesbridge, E ruledtower, W stillwind). One idea:
// STILL WIND — the windmill turns with wind; this wall is wind caught in
// ashlar. Folly wall, not enterable (but gated for passage).
//
// FORM (silhouette-first): a serpentine folly wall running N-S along the
// west spoke. Plan: ONE full sine period x = A·sin(2πz/λ) (A 1.65m, λ = L
// 15.4m, lean ±33.9°) — east face rides the curve, facing the village.
// Elevation: a single swell crest = 1.75 + 1.1·(1−cos(2πz/λ))/2 — low at
// the pier-terminated ends (1.75), cresting 2.85 at center where the gate
// pierces it. Dark coping traces the double curve; buttress piers project
// 0.22/side full-height at the four quarter midpoints + both ends (v1
// judge: 0.05 projection read as coping tabs — real buttresses need real
// projection). Gate at center: passage runs perpendicular to the local
// tangent (58.5° heading — the gate turns you slightly as you cross);
// ring of 15 voussoirs + true keystone (R 0.95, ring 0.24 → clear 1.66m
// ≥ 1.4 lane law; v1's 1.34 clear was a self-caught violation), spring
// 1.50, crown 2.45, impost shelf 1.41..1.50 (bottom ≥ 1.4 law), spandrel
// to crest. Ring projects 5cm past each wall face (v1 flush ring read as
// "dark slot" — an arch announces itself by projection); keystone 3cm
// deeper still. Two brass beads r 0.09 ride the impost shelf east edge at
// the springs (dusk lineage, KEEP anchors, no new light entity; v1's
// r 0.075 pair read as a singleton at night).
//
// GEOMETRY AS ORNAMENT: no applied trim — the curves ARE the wall.
// Judd discipline: one idea, the stillwind.
//
// GATES (honest): footprint ~4.2×15.9 ≈ 67m² ≥16, height 2.94 ≥2.2 →
// trimesh collider (thin wall is the collider; gate clear 1.5m at the
// wall ends / 1.66m at the ring, head 2.33). Folly: no roof, no interior.
// Node budget: merges to 4 nodes (2 texMat buckets + 2 glow KEEP).
import * as THREE from "three";
import { toGLB, texMat, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// struct-38 family law: textured lanes matched to standing village families.
const stone = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.9, scale: 2, weights: [2, 1, 1], cell: 32 });
const dark = texMat("copstone", [0x44402e, 0x4c4836, 0x3c3828], { rough: 0.85, scale: 2, weights: [2, 1, 1], cell: 28 });
// brass beads: warm emissive dusk markers (struct-21/30/33/47/49/50 lineage).
const brass = mat(C.BRASS, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x9a6a28);
(brass as any).emissiveIntensity = 0.75;

// ---- the curve (source of truth for every element) ----
const L = 15.4, A = 1.65, LAM = 15.4;            // one full period over the length
const K = (2 * Math.PI) / LAM;                    // wave number
const xc = (z: number) => A * Math.sin(K * (z + 7.7));           // plan centerline (east face rides this)
const slope = (z: number) => A * K * Math.cos(K * (z + 7.7));    // dx/dz
const theta = (z: number) => Math.atan(slope(z));                // segment yaw
const crest = (z: number) => 1.75 + 1.1 * (1 - Math.cos(K * (z + 7.7))) / 2; // swell elevation
const wOf = (z: number) => 0.34 + 0.12 * Math.abs(Math.cos(K * (z + 7.7)));  // thicker at steep lean
// east-ish unit normal of the run segment (n_x > 0 everywhere: |lean| ≤ 33.9°)
const nrm = (z: number): [number, number] => [Math.cos(theta(z)), -Math.sin(theta(z))];

const EMBED = 0.12;      // wall base below grade
const GATE_Z = 0;        // gate at the swell crest
const GATE_HALF = 0.75;  // ribbon gap |z| < 0.75 (wall ends = passage flanks below spring)

// ---- ribbon: 70 segments over z −7.7..+7.7 ----
{
    const N = 70, dz = L / N;
    for (let i = 0; i < N; i++) {
        const z = -L / 2 + (i + 0.5) * dz;
        if (Math.abs(z - GATE_Z) < GATE_HALF) continue; // gate gap
        const w = wOf(z), h = crest(z) + EMBED;
        const [nx, nz] = nrm(z);
        const seg = new THREE.Mesh(new THREE.BoxGeometry(w, h, dz * 1.08), stone);
        seg.position.set(xc(z) - (w / 2) * nx, -EMBED + h / 2, z - (w / 2) * nz);
        seg.rotation.y = theta(z);
        g.add(seg);
    }
}

// ---- coping: dark second line of the same curve, dying INTO the pier
// bodies (v1 end segments cantilevered past the termini — judge float read)
{
    const N = 60, dz = 15.1 / N;                    // stop at ±7.55 (inside end piers)
    for (let i = 0; i < N; i++) {
        const z = -7.55 + (i + 0.5) * dz;
        const w = wOf(z);
        const [nx, nz] = nrm(z);
        const cop = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, dz * 1.10), dark);
        cop.position.set(xc(z) + 0.03 * nx, crest(z) + 0.045, z + 0.03 * nz);
        cop.rotation.y = theta(z);
        g.add(cop);
    }
}

// ---- gate: ring of 15 voussoirs + keystone, impost shelf, spandrel ----
{
    const TH = theta(GATE_Z);                  // −33.9°: local X → passage direction
    const tlen = Math.hypot(slope(GATE_Z), 1);
    const Tt: [number, number] = [slope(GATE_Z) / tlen, 1 / tlen];       // run tangent (unit)
    const w = wOf(GATE_Z);
    const [nx, nz] = nrm(GATE_Z);
    const cx = xc(GATE_Z) - (w / 2) * nx, cz = GATE_Z - (w / 2) * nz;    // wall centerline at gate
    const SPRING = 1.50, R = 0.95, RING = 0.24;                          // clear 2·(R−RING/2)=1.66 ≥ 1.4
    // voussoirs: 15 cells, radial box Y = RING, arc length Z, through-wall
    // X = w+0.10 (5cm proud of each wall face); keystone X = w+0.16.
    const NVO = 15, ARC = (Math.PI * R) / NVO;
    for (let i = 0; i < NVO; i++) {
        const gam = (i + 0.5) * Math.PI / NVO;  // 0..π
        const key = i === 7;
        const v = new THREE.Mesh(
            new THREE.BoxGeometry(key ? w + 0.16 : w + 0.10, key ? RING + 0.04 : RING, ARC * (key ? 1.02 : 0.92)),
            stone,
        );
        v.position.set(cx + R * Math.cos(gam) * Tt[0], SPRING + R * Math.sin(gam), cz + R * Math.cos(gam) * Tt[1]);
        v.rotation.order = "YXZ";
        v.rotation.y = TH;
        v.rotation.x = Math.PI / 2 - gam;      // local Y → radial (envelope-audited)
        g.add(v);
    }
    // impost shelf: continuous course under the springs, bottom ≥ 1.4 law
    const imp = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.09, 1.92), stone);
    imp.position.set(cx, 1.455, cz);
    imp.rotation.y = TH;
    g.add(imp);
    // spandrel fills crown→crest over the gap, running with the ribbon
    const span = 2 * GATE_HALF * tlen;         // ribbon-arc length of the gap
    const sp = new THREE.Mesh(new THREE.BoxGeometry(w, crest(GATE_Z) - (SPRING + R), span * 1.10), stone);
    sp.position.set(cx, (SPRING + R + crest(GATE_Z)) / 2, cz);
    sp.rotation.y = TH;
    g.add(sp);
    // brass beads (dusk lineage) cresting the impost's east edge at the springs
    for (const s of [-1, 1] as const) {
        const nOff = (w + 0.18) / 2 + 0.02;    // just past the impost east face
        const bx = cx + 0.85 * s * Tt[0] + nOff * nx;
        const bz = cz + 0.85 * s * Tt[1] + nOff * nz;
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), brass);
        bead.name = s < 0 ? "glow_pinS" : "glow_pinN";
        bead.position.set(bx, 1.55, bz);
        g.add(bead);
    }
}

// ---- piers: full-height buttresses, 0.22/side projection, caps flush
// with the coping line (cap top = crest+0.09 exactly — v1's cap sat 5cm
// proud of coping and read as a notch at the tabs) ----
{
    const tList = [0, 1.925, 5.775, 9.625, 13.475, 15.4];
    for (const t of tList) {
        const z = t - 7.7;
        const w = wOf(z), wp = w + 0.44;       // 0.22 projection per side
        const [nx, nz] = nrm(z);
        const pier = new THREE.Mesh(new THREE.BoxGeometry(wp, crest(z) + EMBED, 0.26), stone);
        pier.position.set(xc(z) - ((w + wp) / 2) * nx, (crest(z) - EMBED) / 2, z - ((w + wp) / 2) * nz);
        pier.rotation.y = theta(z);
        g.add(pier);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(wp + 0.14, 0.09, 0.54), dark);
        cap.position.set(xc(z) - ((w + wp) / 2) * nx, crest(z) + 0.045, z - ((w + wp) / 2) * nz);
        cap.rotation.y = theta(z);
        g.add(cap);
    }
}

const merged = mergeByMaterial(g, "stillwind");
writeFileSync("agents/arthur/assets/village_stillwind3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_stillwind3.glb");
