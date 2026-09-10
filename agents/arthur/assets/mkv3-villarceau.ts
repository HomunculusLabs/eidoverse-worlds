// mkv3-villarceau.ts — STRUCTURES LANE struct-155, Round 11 commission R11-3.
// THE VILLARCEAU RINGS: form-ledger gap grep fresh this tick — villarceau
// 0/0/0 across STRUCTURES-PLAN + IMPROVEMENTS + IMPROVE-PLAN. Circle
// family standing: Founder's Knot (p=2,q=5 torus KNOT, solid brass,
// spinning, SW plaza r9) — different secret: that one is a braided path,
// this one is a hidden section. Elevates, never competes: stone-vs-brass
// split, no knot, no spin.
//
// ONE IDEA: TWO PERFECT CIRCLES HIDDEN INSIDE ONE STONE HOOP. A stone
// torus standing on edge carries its Villarceau circles as brass hoops
// inlaid half-proud on the surface — curves that look like crossing
// ellipses but are BOTH true perfect circles (the bitangent-plane
// section of a torus, Villarceau 1848). At 18m: a stone ring traced by
// bright woven lines. At walk-up: follow one brass line and it closes
// as a perfect circle.
//
// MATH (derived exactly, asserted in-file):
// - Torus R0=1, r0=1/√2 (the R0=√2·r0 regime: bitangent planes pass
//   through the center). Torus eq: (√(x²+y²) − R0)² + z² = r0².
// - Villarceau circle (verified analytically, identity in t):
//     p(t) = (1/√2 + sin t, cos t/√2, cos t/√2)
//   = center C1=(1/√2,0,0) + cos t·(0,1/√2,1/√2) + sin t·(1,0,0)
//   — a TRUE circle of radius R0=1 in the plane y=z, lying ON the torus.
// - Twin: C2=(−1/√2,0,0), same plane. The pair CROSSES at exactly
//   (0, ±1/2, ±1/2) — inside the hole, on the surface.
// - Family: rotate the pair about the torus axis (z) by φ; φ and φ+π
//   give the same pair (rotate-π maps C1 onto C2). Five pairs at
//   φ ∈ {0°,36°,72°,108°,144°} = ten distinct brass hoops.
//
// LAWS HONORED (struct-121+ lineage):
// - texMat lanes (struct-38): vc_stone (torus), vc_brass (hoops — the
//   tensegrity v6 bright-brass lane 0xCEAE54/0xBE9A47/0xE1BE68, metal
//   0.9: thin members read as wire, not painted dowel), vc_slab (foot).
// - glow census exactly 1 KEEP (glow_vc_1): a bead at the φ=0 pair's
//   upper crossing (0, 1/2, 1/2) — where two hidden circles kiss
//   (kiss/peaucellier/gyroid lineage).
// - Torus native frame (axis along z, ring plane x–y): stands on edge
//   facing ±z; no rotation. Bottom embedded 0.30 into the slab.
// - Envelope 3.48 x 3.41 x 1.48 (brass proud 0.035 in z); NaN 0; node
//   budget 4 (3 texMat buckets + 1 KEEP). Deterministic: parametric
//   only, seeded texMat.
// Folly class: no entry advertised — no walk owed (zeno..gyroid precedent).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the torus and its hidden circles -----------------------------------------------------------
const R0 = 1, r0 = 1 / Math.SQRT2;      // R0 = √2·r0 exactly
const HOOP_R = 0.035;                   // brass tube radius (half-proud inlay on the surface)
const SLAB_H = 0.36, EMBED = 0.30;      // ring bottom 0.30 below slab top
const LIFT = R0 + r0 + SLAB_H - EMBED;  // torus center world y

// circle k of the pair, rotation φ about z (torus axis). Circle radius R0.
const U = new THREE.Vector3(0, 1 / Math.SQRT2, 1 / Math.SQRT2); // in-plane basis 1
const W = new THREE.Vector3(1, 0, 0);                            // in-plane basis 2
const hoopPt = (sign: number, phi: number, t: number): THREE.Vector3 =>
    rotZ(new THREE.Vector3(sign * r0, 0, 0)
        .addScaledVector(W, R0 * Math.sin(t))
        .addScaledVector(U, R0 * Math.cos(t)), phi);
const rotZ = (p: THREE.Vector3, phi: number): THREE.Vector3 =>
    new THREE.Vector3(p.x * Math.cos(phi) - p.y * Math.sin(phi), p.x * Math.sin(phi) + p.y * Math.cos(phi), p.z);

{
    // laws at the heart
    if (Math.abs(R0 - Math.SQRT2 * r0) > 1e-12) throw Error("regime law: R0 != √2·r0");
    // every hoop point on the torus surface — the identity check, 720 samples × 10 hoops
    const onTorus = (p: THREE.Vector3) => {
        const v = Math.sqrt(p.x * p.x + p.y * p.y);
        return (v - R0) * (v - R0) + p.z * p.z - r0 * r0;
    };
    let worst = 0;
    for (const phi of [0, 1, 2, 3, 4].map((k) => (k * 36 * Math.PI) / 180)) {
        for (const sign of [1, -1]) {
            for (let i = 0; i < 720; i++) {
                const p = hoopPt(sign, phi, (i / 720) * 2 * Math.PI);
                worst = Math.max(worst, Math.abs(onTorus(p)));
                const dC = p.distanceTo(rotZ(new THREE.Vector3(sign * r0, 0, 0), phi));
                if (Math.abs(dC - R0) > 1e-9) throw Error(`hoop ${sign}/${phi}: not a radius-R0 circle (${dC})`);
            }
        }
    }
    if (worst > 1e-9) throw Error(`hoop-on-torus identity violated: ${worst}`);
    // pair crossing: both φ=0 circles pass through (0, 1/2, 1/2)
    const X1 = new THREE.Vector3(0, 0.5, 0.5);
    let best = Infinity;
    for (let i = 0; i < 7200; i++) {
        const t = (i / 7200) * 2 * Math.PI;
        best = Math.min(best, hoopPt(1, 0, t).distanceTo(X1), hoopPt(-1, 0, t).distanceTo(X1));
    }
    if (best > 1e-6) throw Error(`crossing law: circles miss (0,.5,.5) by ${best}`);
    console.log(`villarceau laws OK: 10 hoops of radius ${R0} on-torus (worst resid ${worst.toExponential(1)}), pair crosses at (0,.5,.5) within ${best.toExponential(1)}`);
}

// ---- build --------------------------------------------------------------------------------------
const stoneTex = texMat("vc_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9531 });
const brassTex = texMat("vc_brass", [0xceae54, 0xbe9a47, 0xe1be68], { rough: 0.38, metal: 0.9, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9532 });
const slabTex = texMat("vc_slab", [0x6b665d, 0x736e64, 0x635e56], { rough: 0.95, scale: 2, weights: [1, 1, 1], cell: 7, seed: 9533 });

const g = new THREE.Group();

// stone torus — native frame (ring plane x–y, axis z), lifted to stand on edge in its slab
{
    const torus = new THREE.Mesh(new THREE.TorusGeometry(R0, r0, 48, 96), stoneTex);
    torus.position.y = LIFT;
    g.add(torus);
}

// the ten brass hoops — half-proud inlay: tube centered ON the surface
{
    for (const k of [0, 1, 2, 3, 4]) {
        const phi = (k * 36 * Math.PI) / 180;
        for (const sign of [1, -1]) {
            const pts: THREE.Vector3[] = [];
            for (let i = 0; i <= 96; i++) {
                const p = hoopPt(sign, phi, (i / 96) * 2 * Math.PI);
                p.y += LIFT;
                pts.push(p);
            }
            const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 128, HOOP_R, 8, true), brassTex);
            g.add(tube);
        }
    }
}

// the slab
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(2.6, SLAB_H, 2.2), slabTex);
    slab.position.y = SLAB_H / 2;
    g.add(slab);
}

// the bead — where the first pair of hidden circles cross inside the hole
const glowMeshes: THREE.Mesh[] = [];
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 0.85;         // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, 0.5 + LIFT, 0.5);
    bead.name = "glow_vc_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- census + envelope/NaN laws -----------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const wantW = 2 * (R0 + r0 + HOOP_R), wantD = 2.2; // brass rides proud in x/y too; slab is widest in z
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(sz.x - wantW) > 0.01 || Math.abs(sz.z - wantD) > 0.01) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != ${wantW.toFixed(2)}x${wantD.toFixed(2)}`);
    const wantTop = LIFT + R0 + r0;      // envelope top = STONE crest: no hoop passes the top meridian (max brass 1.683 < 1.707), and in x the hoops at φ=0±36° ride the side crests +HOOP_R
    if (Math.abs(sz.y - (wantTop - 0)) > 0.02) throw Error(`height ${sz.y.toFixed(2)} != ${(wantTop).toFixed(2)}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 1 glow KEEP (glow_vc_1)`);
}

const merged = mergeByMaterial(g, "villarceau");
writeFileSync("agents/arthur/assets/village_villarceau3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_villarceau3.glb`);
