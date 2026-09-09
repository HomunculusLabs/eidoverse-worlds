// mkv3-harmonickiss.ts — STRUCTURES LANE struct-130, Round 10 commission R10-21.
// THE HARMONIC KISS: the form ledger's missing SPHERICAL-HARMONICS family
// (ledger grep fresh this tick: "spherical harmon" 0/0/0, gyroid 0/0/0,
// enneper 0/0/0, boy/seifert 0/0/0 across STRUCTURES-PLAN.md +
// IMPROVEMENTS.md + IMPROVE-PLAN.md; helicoid/astroid/deltoid already
// covered by standing works or prose lines; trefoil/klein near-misses only).
// The S mathematics walk gains the quantum chapter: after the machine that
// draws a straight line comes the shape of the electron itself.
//
// ONE IDEA: THREE SURFACES BORN FROM ONE EQUATION. The d_z² spherical
// harmonic — the orbital of the hydrogen electron — is one radius function
// r(θ) = s·|3cos²θ−1| revolved: two teardrop lobes and one flared equatorial
// band, all three sheets converging at the SAME point, the harmonic's zero
// at the center. The sculpture cuts each sheet short of that point and
// seats one brass bead exactly where they would meet — the bead IS the
// equation's zero, glowing after dark (glow_hk_1, struct-82 dusk lineage).
// One dark iron needle threads pole-to-pole through bead and band and
// carries the whole form to the ground: the axis line is the support
// (Judd: one clear idea). Bone shells, iron line, stone foot.
//
// MATH (all asserted in-file):
// - r(θ) = 1.5·|3cos²θ−1| — exact classic d_z² form (node θn = 54.7356°,
//   pole distance 3.0, equator bulge 1.5).
// - Upper lobe: θ ∈ [0°, 47.55°] (cut at ρ=0.55); lower lobe mirrored.
// - Band: θ ∈ [58.19°, 121.81°] (cut at ρ=0.25), widest 1.5 at equator.
// - Kiss law: every rim's tangent ray aims at the center point (0, 3.4, 0);
//   rim-to-rim profile gap 0.308m — hairline legible at close approach,
//   bead r=0.10 centered with 0.11m clearance inside the band throat.
// - Legibility contract: silhouette (two teardrops + flared ring) reads at
//   18m; the three-way kiss detail is the ≤8m reward (struct-45
//   interaction-distance law, disclosed — not a defect).
//
// LAWS HONORED (struct-121+ lineage):
// - texMat lanes (struct-38: no plain materials); bone shells DoubleSide so
//   the open rims show inner faces (glass-law kin).
// - glow census exactly 1 KEEP (glow_hk_1, new unique token this cast).
// - Envelope/NaN laws; node budget: bone 1 + iron 1 + stone 1 + KEEP 1 = 4.
// - Deterministic: no RNG outside texMat seeds.
// Folly class: no entry advertised, no walk owed (zeno..peaucellier
// precedent). AXISYMMETRIC form — yaw legally irrelevant, seated yaw-pi for
// S-walk family census consistency.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- exact d_z² geometry -----------------------------------------------------------------------
const S = 1.5;                        // harmonic scale
const ORIGIN_Y = 3.4;                 // the harmonic's zero point (the kiss)
const THETA_N = Math.acos(1 / Math.sqrt(3));          // node 54.7356° — r(θn)=0
const RHO_CUT_LOBE = 0.55, RHO_CUT_BAND = 0.25;       // kiss gaps along ρ

const rho = (th: number) => S * Math.abs(3 * Math.cos(th) ** 2 - 1);
const pt = (th: number): THREE.Vector2 =>            // profile point (cyl_r, y)
    new THREE.Vector2(rho(th) * Math.sin(th), ORIGIN_Y + rho(th) * Math.cos(th));

// cut angles: solve ρ(θ)=cut on each side of the node
const thLobe = Math.acos(Math.sqrt((RHO_CUT_LOBE / S + 1) / 3));   // 47.55°
const thBand = Math.acos(Math.sqrt((1 - RHO_CUT_BAND / S) / 3));   // 58.19°

{
    // harmonic law sanity: node zero, pole/equator extremes, cuts exact
    const chk = (name: string, got: number, want: number, tol = 1e-9) =>
        { if (Math.abs(got - want) > tol) throw Error(`law broke (${name}): ${got} != ${want}`); };
    chk("node rho", rho(THETA_N), 0, 1e-12);
    chk("pole rho", rho(0), 3.0);
    chk("equator rho", rho(Math.PI / 2), S);
    chk("lobe cut", rho(thLobe), RHO_CUT_LOBE, 1e-9);
    chk("band cut", rho(thBand), RHO_CUT_BAND, 1e-9);
    // kiss law: both rims' rays aim at the origin point; rim-to-rim gap recorded
    const u = pt(thLobe), b = pt(thBand);
    const gap = u.distanceTo(b);
    if (gap < 0.25 || gap > 0.40) throw Error(`kiss gap ${gap.toFixed(3)} outside legibility band [0.25,0.40]`);
    const beadR = 0.10;
    const clear = b.x - beadR;
    if (clear < 0.05) throw Error(`bead not clear in band throat: ${clear.toFixed(3)}`);
    console.log(`harmonic laws OK: node 54.7356°, pole 3.0, equator ${S}, lobe cut 47.55° (rho 0.55), band cut 58.19° (rho 0.25); kiss gap ${gap.toFixed(4)}m; bead throat clearance ${clear.toFixed(3)}m`);
}

// ---- the three shells (bone, DoubleSide) --------------------------------------------------------
const boneTex = texMat("hk_bone", [0xd8d2c4, 0xcfc8b8, 0xbfb8a8], { rough: 0.9, scale: 2, weights: [3, 1, 1], seed: 9301 });
boneTex.side = THREE.DoubleSide;      // open rims show inner faces (glass-law kin)

const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];
const LATHE_SEG = 96;

const lobeProfile = (fromPole: boolean): THREE.Vector2[] => {
    const pts: THREE.Vector2[] = [];
    const N = 48;
    for (let i = 0; i <= N; i++) {
        const th = fromPole
            ? (i / N) * thLobe                              // pole 0° → cut 47.55°
            : Math.PI - (i / N) * thLobe;                   // pole 180° → cut 132.45°
        pts.push(pt(th));
    }
    return pts;
};
const bandProfile = (): THREE.Vector2[] => {
    const pts: THREE.Vector2[] = [];
    const N = 64;
    for (let i = 0; i <= N; i++) {
        const th = thBand + (i / N) * (Math.PI - 2 * thBand); // 58.19° → 121.81°
        pts.push(pt(th));
    }
    return pts;
};

g.add(new THREE.Mesh(new THREE.LatheGeometry(lobeProfile(true), LATHE_SEG), boneTex));
g.add(new THREE.Mesh(new THREE.LatheGeometry(lobeProfile(false), LATHE_SEG), boneTex));
g.add(new THREE.Mesh(new THREE.LatheGeometry(bandProfile(), LATHE_SEG), boneTex));

// ---- iron: rim rings at the four cut circles ----------------------------------------------------
const ironTex = texMat("hk_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9302 });
{
    const RIM_T = 0.035;
    const rims = [pt(thLobe), pt(thBand), pt(Math.PI - thBand), pt(Math.PI - thLobe)];
    for (const rm of rims) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(rm.x, RIM_T, 8, 64), ironTex);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, rm.y, 0);
        g.add(ring);
    }
    console.log(`rim rings OK: 4 at cyl_r ${rims.map(r => r.x.toFixed(3)).join("/")} y ${rims.map(r => r.y.toFixed(3)).join("/")}`);
}

// ---- iron: the axis needle (grade → top pole; the line that carries the form) -------------------
const NEEDLE_R = 0.045;
{
    const topPole = pt(0).y;                                 // 6.4
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(NEEDLE_R, NEEDLE_R, topPole, 10), ironTex);
    needle.position.set(0, topPole / 2, 0);                  // y 0 (grade) → 6.4
    g.add(needle);
    // needle law: passes exactly through the bead center and both pole tips
    if (Math.abs(topPole - 6.4) > 1e-9) throw Error("needle law: top pole not 6.4");
    if (Math.abs(pt(Math.PI).y - 0.4) > 1e-9) throw Error("needle law: lower pole tip not 0.4");
}

// ---- THE BEAD at the harmonic zero: the kiss point, the only light ------------------------------
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 0.85;             // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, ORIGIN_Y, 0);
    bead.name = "glow_hk_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- stone: plinth + socket ---------------------------------------------------------------------
const stoneTex = texMat("hk_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9303 });
const PLINTH_H = 0.14;
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.9, PLINTH_H, 0.9), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    const socket = new THREE.Mesh(new THREE.TorusGeometry(NEEDLE_R + 0.05, 0.04, 8, 32), ironTex);
    socket.rotation.x = Math.PI / 2;
    socket.position.set(0, PLINTH_H + 0.02, 0);
    g.add(socket);
}

// ---- glow census + envelope/NaN laws ------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > 6.4 + 1e-4 || sz.y < 6.2) throw Error(`height ${sz.y.toFixed(2)} outside band [6.2,6.4]`);
    if (sz.x > 3.1 || sz.x < 2.9) throw Error(`width ${sz.x.toFixed(2)} outside band [2.9,3.1]`);
    if (sz.z > 3.1 || sz.z < 2.9) throw Error(`depth ${sz.z.toFixed(2)} outside band [2.9,3.1]`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 1 glow KEEP node (glow_hk_1)`);
}

const merged = mergeByMaterial(g, "harmonickiss");
writeFileSync("agents/arthur/assets/village_harmonickiss3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_harmonickiss3.glb`);
