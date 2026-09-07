// mkv3-echoarch.ts — STRUCTURES LANE struct-28: R3-3 THE ECHO ARCH.
// Round 3 (census-derived): the SE diagonal ends at Theater+Skene (r54);
// beyond it, nothing until the forest. One idea: a whisper crosses eight
// meters — two facing parabolic ashlar fins whose FOCI sit 6m apart.
// Stand on one focus pin, whisper; the parabola collects your voice at
// the other pin. True conic geometry: z = y²/(4f), f = 1m, vertex to
// vertex 8m, foci at z=1 and z=7. The curve is expressed as 14 straight
// tangent segments per fin (the lane's ruled language — curve by
// turning, never applied).
//
// Brass focus pins mark the standing spots; the arch reads as two fins
// against the sky from the theater walk. Real trimesh: footprint ~63m²,
// 3.32m tall — walkable between the fins. No motion, no comps.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// struct-55 (survey-20 Sev 3 intake): two coupled cures, one cause-family
// (identity invisible from approach):
// (1) MATERIAL — plain mat() exported NO glTF material (struct-38 class,
//     decode-proven: mesh 0 carried material:None → loader-default
//     near-black = the survey's #0A0806 left-third value crush). Stone now
//     rides the village texMat lane (coursed-ashlar cell texture).
// (2) ELEVATION — constant H=3.2 fins read as one solid rectangle from any
//     oblique azimuth (near fin screens the chamber; flat parallel tops
//     merge). Fin top edges now step a parabolic rake: arms 3.2m at |x|=3,
//     waist dipping to H_DIP=1.15 at the vertexes — the mouth opens over
//     the low waists, the two-fins-and-chamber gesture reads in elevation.
//     (The rake is z-independent per segment: each segment stays a
//     straight box; heights follow h(x) = DIP+(H-DIP)(x/HALF)².)
// Envelope unchanged (tallest arm top still y 3.32) → SAT-neutral reseat.
const ash = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// struct-30 refine: the focus pins now glow warm — the whisper seats read
// at dusk from the theater walk (lit-seats law, beacon lineage); no new
// light entity, the pins ARE the lamps.
const brass = new THREE.MeshStandardMaterial({ color: C.BRASS, roughness: 0.55, metalness: 0 });
(brass as any).emissive = new THREE.Color(0x8a5a20);
(brass as any).emissiveIntensity = 0.6;

const F = 1.0;          // focal length
const H = 3.2;          // fin height at the arms (|x| = HALF)
const H_DIP = 1.15;     // fin height at the vertex (x = 0) — the mouth opens
const HALF = 3.0;       // half-width in y
const SEG = 14;         // segments per fin
const SEP = 8.0;        // vertex-to-vertex separation
const D = 0.34;         // fin thickness

// struct-55 pass 2: BoxGeometry UVs span 0..1 per FACE, so on the tall
// thin fin segments the 8x8 texMat cells stretched to ~0.055m x 0.4m —
// 7:1 vertical strakes that read as timber planking (ZAI fallback judge,
// decode-verified by cell-aspect math). boxUV rescales each face's UVs by
// face-dim/tile so texture cells stay SQUARE on every surface; tile=3.0
// gives 0.375m coursed-ashlar blocks everywhere (fins + paved deck).
function boxUV(geo: THREE.BoxGeometry, w: number, h: number, d: number, tile: number) {
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    const faces: Array<[number, number]> = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
        const [fw, fh] = faces[f];
        for (let v = 0; v < 4; v++) {
            const i = f * 4 + v;
            uv.setXY(i, (uv.getX(i) * fw) / tile, (uv.getY(i) * fh) / tile);
        }
    }
    uv.needsUpdate = true;
}

// base slab
{
    const slabGeo = new THREE.BoxGeometry(8.2, 0.12, SEP + 4.2);
    boxUV(slabGeo, 8.2, 0.12, SEP + 4.2, 3.0);
    const slab = new THREE.Mesh(slabGeo, ash);
    slab.name = "slab";
    slab.position.set(0, 0.06, SEP / 2);
    g.add(slab);
}

// one fin: parabola z(x) = x²/(4F), extruded as tangent boxes turning IN
// PLAN (rotation.y) — improve-6: the original build computed the profile
// but never applied the transverse coordinate (segments all at x=0 with
// rotation.x louver tilt), so both fins collapsed into a 0.34m column of
// tilted panels. The whisper fins physically did not exist in the mesh.
function fin(name: string, mirror: boolean) {
    const sign = mirror ? -1 : 1;
    const baseZ = mirror ? SEP : 0;
    const segW = (2 * HALF) / SEG;
    for (let i = 0; i < SEG; i++) {
        const x = -HALF + (i + 0.5) * segW;
        const z = (x * x) / (4 * F);          // local profile
        const dzdx = x / (2 * F);             // plan slope
        const ang = Math.atan(dzdx);
        const len = segW / Math.cos(ang) + 0.03;
        // struct-55 rake: height follows the same parabola as the plan —
        // low at the mouth vertex, full at the arms. Each segment is a
        // straight box whose height steps toward the neighbor's (stair
        // rhythm echoes the surveyor's ranged language); stepping keeps
        // every member straight (ruled language, curve by turning).
        const xL = -HALF + i * segW, xR = -HALF + (i + 1) * segW;
        const hL = H_DIP + (H - H_DIP) * (xL * xL) / (HALF * HALF);
        const hR = H_DIP + (H - H_DIP) * (xR * xR) / (HALF * HALF);
        const h = Math.max(hL, hR);           // block top = taller bounding edge
        const segGeo = new THREE.BoxGeometry(len, h, D);
        boxUV(segGeo, len, h, D, 3.0);
        const seg = new THREE.Mesh(segGeo, ash);
        seg.name = `${name}_s${i}`;
        seg.position.set(x, h / 2 + 0.12, baseZ + sign * z);
        // local +x must align with the plan tangent (1, ±dzdx); rotation.y=θ
        // maps +x → (cosθ, −sinθ) ⇒ finA (tangent (1, +dzdx)) takes −ang,
        // mirrored finB (tangent (1, −dzdx)) takes +ang.
        seg.rotation.y = mirror ? ang : -ang;
        g.add(seg);
    }
}
fin("finA", false); // opens toward +z (vertex at z=0)
fin("finB", true);  // opens toward -z (vertex at z=8)

// focus pins: brass discs at (0, 1) and (0, 7) — the whisper spots
for (const [i, fz] of [F, SEP - F].entries()) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 12), brass);
    pin.name = `focus_${i}`;
    pin.position.set(0, 0.155, fz);
    g.add(pin);
}

const merged = mergeByMaterial(g, "echoarch");
writeFileSync("agents/arthur/assets/village_echoarch3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_echoarch3.glb");
