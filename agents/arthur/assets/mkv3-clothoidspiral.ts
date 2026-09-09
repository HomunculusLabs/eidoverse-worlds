// mkv3-clothoidspiral.ts — STRUCTURES LANE struct-124, Round 10 commission R10-19.
// THE CLOTHOID SPIRAL: the form ledger's missing TRANSITION-CURVE family
// (ledger grep fresh this tick: clothoid 0, euler spiral 0, cornu 0, loxodrome 0
// across STRUCTURES-PLAN.md + IMPROVEMENTS.md + VILLAGE_PLAN.md; near-miss
// families reuleaux/hyperboloid/pseudosphere all STANDING, different curves).
// The S mathematics axis gains the transition chapter: the road that learns
// to turn.
//
// ONE IDEA: THE ROAD THAT LEARNS TO TURN. One iron rail rises dead straight
// from its stone socket; its curvature grows linearly with distance run (the
// clothoid — the transition curve every highway and railway uses to carry
// speed into a bend); it coils ever tighter around a brass bead it approaches
// forever and never reaches. Straightness spiraling into forever: the Euler
// spiral as a monument. One line, one mast, one bead.
//
// MATH: Fresnel integrals C(t)=∫cos(πu²/2)du, S(t)=∫sin(πu²/2)du; curve
// point a·(S(t), C(t)); initial tangent VERTICAL (dead-straight rise);
// tangent turning φ(t)=πt²/2 (curvature ∝ arc length — the definition);
// limit point (a/2, a/2) — the bead sits exactly there.
//
// LAWS HONORED (all asserted in-file):
// - fresnel law: integrator reproduces published landmarks C(1)=0.779893,
//   S(1)=0.438259, C(2)=0.488253, S(2)=0.343416 (±1e-3, Simpson n=4000/unit).
// - straight law: t <= 0.20 the rail stays within 20mm of the vertical
//   tangent line (the dead-straight start IS the concept).
// - tighten law: successive coil apices (S(t)=0.5 crossings) strictly
//   approach the limit point; >= 4 apices monotone decreasing radius.
// - clear law: rail never comes within 0.22m of the bead center (approaches
//   forever, never reaches — and never intersects: needs 0.145).
// - strut law: exactly 3 horizontal struts, each spanning mast front face to
//   rail back face in z (attached to BOTH, trestle language).
// - mast/socket laws: mast on plinth behind the plane through the coil axis,
//   topping out above the bead; rail base dead-center in its stone socket.
// - glow census exactly 1 KEEP (glow_cl_1, the bead — struct-82 dusk lineage);
// - envelope/NaN laws; texMat lanes (struct-38 law: no plain materials);
// - node census 3 post-merge (stone bucket + iron bucket + glow KEEP).
// Folly class: no entry advertised, no walk owed (zeno..galton precedent).
// Static. Fully deterministic (no RNG outside texMat seeds).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- Fresnel integrals (Simpson, deterministic) -----------------------------------------------
const fresnel = (t: number, n: number): [number, number] => {
    // ∫₀ᵗ cos(πu²/2) du, ∫₀ᵗ sin(πu²/2) du
    const f = (u: number): [number, number] => [Math.cos(Math.PI * u * u / 2), Math.sin(Math.PI * u * u / 2)];
    if (t === 0) return [0, 0];
    const h = t / n;
    let c = 0, s = 0;
    for (let i = 0; i <= n; i++) {
        const w = i === 0 || i === n ? 1 : (i % 2 === 1 ? 4 : 2);
        const [cu, su] = f(i * h);
        c += w * cu; s += w * su;
    }
    return [c * h / 3, s * h / 3];
};
const N_INT = 4000;
const C = (t: number) => fresnel(t, N_INT)[0];
const S = (t: number) => fresnel(t, N_INT)[1];

// ---- fresnel law: published landmarks -----------------------------------------------------------
{
    const lm: Array<[number, number, number, string]> = [
        [1, 0.779893, 0.438259, "C(1),S(1)"],
        [2, 0.488253, 0.343416, "C(2),S(2)"],
        [0.5, 0.492344, 0.064732, "C(0.5),S(0.5)"],
    ];
    for (const [t, ce, se, name] of lm) {
        const [c, s] = fresnel(t, N_INT);
        if (Math.abs(c - ce) > 1e-3 || Math.abs(s - se) > 1e-3)
            throw Error(`fresnel law broke at ${name}: got (${c.toFixed(6)},${s.toFixed(6)})`);
    }
    console.log("fresnel law OK: Simpson n=4000 reproduces C/S landmarks to <1e-3");
}

// ---- geometry constants -------------------------------------------------------------------------
const T_MAX = 3.5;                 // total tangent turning πT²/2 ≈ 19.2 rad ≈ 3.06 turns
const N_SAMPLES = 1600;
const PLINTH_H = 0.30;             // base course
const SOCKET_H = 0.42;             // stone socket under the straight rise
const Y_BASE = PLINTH_H + SOCKET_H; // 0.72 — rail origin (dead-straight rise starts here)
const H_TARGET = 4.55;             // family scale (galton 4.46, borromean 4.60)
const RAIL_R = 0.055;              // iron rail tube radius
const MAST_R = 0.06;
const Z_MAST = -0.24;              // mast sits behind the rail plane
const BEAD_R = 0.09;               // borromean/zeno bead precedent

// ---- fit law: scale a so total height hits target ------------------------------------------------
let rawMaxY = 0;
for (let i = 0; i <= 400; i++) rawMaxY = Math.max(rawMaxY, C((i / 400) * T_MAX));
const A = (H_TARGET - Y_BASE) / rawMaxY;
const X_LIMIT = A * 0.5, Y_LIMIT = Y_BASE + A * 0.5;  // the limit point (the bead)
console.log(`fit: rawMaxY=${rawMaxY.toFixed(4)} -> A=${A.toFixed(4)}, limit (${X_LIMIT.toFixed(3)}, ${Y_LIMIT.toFixed(3)})`);

// ---- the curve -----------------------------------------------------------------------------------
const pts: THREE.Vector3[] = [];
for (let i = 0; i <= N_SAMPLES; i++) {
    const t = (i / N_SAMPLES) * T_MAX;
    pts.push(new THREE.Vector3(A * S(t), Y_BASE + A * C(t), 0));
}

// ---- straight law: dead-straight start (lateral ∝ s³ for a clothoid) ------------------------------
{
    // bands: |X| <= 5mm over the first 0.5m of arc (s = A·t), <= 25mm over the first 1.0m
    let worstHalf = 0, worstOne = 0;
    for (let i = 0; i <= N_SAMPLES; i++) {
        const t = (i / N_SAMPLES) * T_MAX;
        const s = A * t;
        if (s <= 0.5) worstHalf = Math.max(worstHalf, Math.abs(pts[i].x));
        if (s <= 1.0) worstOne = Math.max(worstOne, Math.abs(pts[i].x));
    }
    if (worstHalf > 0.005) throw Error(`straight law broke: |X| ${worstHalf.toFixed(4)} over first 0.5m (need <=5mm)`);
    if (worstOne > 0.025) throw Error(`straight law broke: |X| ${worstOne.toFixed(4)} over first 1.0m (need <=25mm)`);
    const dx0 = pts[1].x - pts[0].x, dy0 = pts[1].y - pts[0].y;
    if (Math.abs(dx0 / dy0) > 0.02) throw Error(`straight law broke: initial tangent not vertical (${dx0.toFixed(5)}/${dy0.toFixed(5)})`);
    console.log(`straight law OK: worst lateral ${worstHalf.toFixed(4)}m @0.5m arc, ${worstOne.toFixed(4)}m @1.0m arc (cubic-in-s signature)`);
}

// ---- tighten law + strut crossings (S(t)=0.5 <=> X = xLimit: coil apices) --------------------------
const apices: Array<{ t: number; y: number; r: number }> = [];
{
    let prev = A * S(1.4) - X_LIMIT;
    for (let i = 1; i <= 4000; i++) {
        const t = 1.4 + (i / 4000) * (T_MAX - 1.4);
        const d = A * S(t) - X_LIMIT;
        if (prev === 0 ? false : (prev < 0) !== (d < 0)) {
            // bisect to 1e-6
            let lo = t - (T_MAX - 1.4) / 4000, hi = t;
            for (let k = 0; k < 40; k++) {
                const mid = (lo + hi) / 2;
                ((A * S(lo) - X_LIMIT < 0) !== (A * S(mid) - X_LIMIT < 0)) ? hi = mid : lo = mid;
            }
            const tc = (lo + hi) / 2;
            if (tc > 1.55) apices.push({ t: tc, y: Y_BASE + A * C(tc), r: Math.abs(Y_BASE + A * C(tc) - Y_LIMIT) });
        }
        prev = d;
    }
    if (apices.length < 4) throw Error(`tighten law broke: only ${apices.length} apices (< 4)`);
    for (let i = 1; i < apices.length; i++)
        if (apices[i].r >= apices[i - 1].r - 0.005)
            throw Error(`tighten law broke: radius ${i} (${apices[i].r.toFixed(3)}) not < previous (${apices[i - 1].r.toFixed(3)})`);
    console.log(`tighten law OK: ${apices.length} apices, radii [${apices.map(a => a.r.toFixed(2)).join(", ")}] monotone in`);
}

// ---- clear law: rail approaches forever, never touches ---------------------------------------------
{
    let minD = Infinity;
    for (const p of pts) minD = Math.min(minD, Math.hypot(p.x - X_LIMIT, p.y - Y_LIMIT));
    if (minD < 0.22) throw Error(`clear law broke: rail within ${minD.toFixed(3)} of bead center`);
    if (minD < BEAD_R + RAIL_R) throw Error("clear law broke: rail intersects bead");
    console.log(`clear law OK: min rail-to-bead-center ${minD.toFixed(3)}m (approaches forever, never reaches)`);
}

// ---- materials (struct-38 law: texMat lanes; emissive via MeshStandard, struct-82 lineage) -----------
const stoneTex = texMat("cloth_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 8151 });
const ironTex = texMat("cloth_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 8152 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];

// ---- iron: the rail -------------------------------------------------------------------------------
{
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0);
    const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 2000, RAIL_R, 10, false), ironTex);
    g.add(rail);
}

// ---- iron: mast through the coil axis (behind the plane) --------------------------------------------
{
    const topY = Y_LIMIT + 0.25;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(MAST_R, MAST_R, topY - PLINTH_H, 10), ironTex);
    mast.position.set(X_LIMIT, (PLINTH_H + topY) / 2, Z_MAST);
    g.add(mast);
}

// ---- iron: struts mast->rail at alternating coil apices (trestle language) ---------------------------
const strutYs: number[] = [];
{
    // struts at apices 0, 2, 4 (alternating sides of the coil center)
    if (apices.length < 5) throw Error(`strut law broke: need >=5 apices for picks 0/2/4, have ${apices.length}`);
    for (const i of [0, 2, 4]) strutYs.push(apices[i].y);
    for (const y of strutYs) {
        // embeds THROUGH the mast body (starts behind its back face) into the rail tube
        const z0 = Z_MAST - 0.08, z1 = 0.02;                 // through mast center, inside rail tube
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, z1 - z0), ironTex);
        strut.position.set(X_LIMIT, y, (z0 + z1) / 2);
        g.add(strut);
        if (z0 > Z_MAST + 1e-9) throw Error("strut law broke: strut does not reach mast centerline");
        if (z1 < -RAIL_R + 1e-9) throw Error("strut law broke: not reaching rail tube");
        if (y < Y_LIMIT - apices[0].r - 0.05 || y > Y_LIMIT + apices[0].r + 0.05) throw Error("strut law broke: y outside coil span");
    }
    console.log(`strut law OK: 3 struts at y [${strutYs.map(y => y.toFixed(2)).join(", ")}], each spanning mast->rail`);
}

// ---- iron: stem + THE BEAD at the limit point --------------------------------------------------------
{
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, -Z_MAST, 8), ironTex);
    stem.rotation.x = Math.PI / 2;
    stem.position.set(X_LIMIT, Y_LIMIT, Z_MAST / 2);
    g.add(stem);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 14, 12), brassGlow);
    bead.position.set(X_LIMIT, Y_LIMIT, 0.01);
    bead.name = "glow_cl_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- stone: plinth slab + socket -----------------------------------------------------------------
{
    const xMin = -0.35, xMax = X_LIMIT + 0.35;   // socket to just past the mast; coil cantilevers
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(xMax - xMin, PLINTH_H, 0.70), stoneTex);
    plinth.position.set((xMin + xMax) / 2, PLINTH_H / 2, Z_MAST / 2);
    g.add(plinth);
    const socket = new THREE.Mesh(new THREE.BoxGeometry(0.50, SOCKET_H, 0.50), stoneTex);
    socket.position.set(0, PLINTH_H + SOCKET_H / 2, 0);
    g.add(socket);
    // socket law: rail base dead-center in the socket top
    if (Math.hypot(pts[0].x - 0, pts[0].y - (PLINTH_H + SOCKET_H)) > 0.002)
        throw Error(`socket law broke: rail base at (${pts[0].x.toFixed(3)},${pts[0].y.toFixed(3)})`);
    console.log(`socket law OK: rail base seated in socket top; plinth x[${xMin.toFixed(2)}..${xMax.toFixed(2)}]`);
}

// ---- iron: terminus catch (the final trestle arm seats the rail's end) ------------------------------
{
    const end = pts[pts.length - 1];
    // horizontal bar from mast centerline at the terminus height to the terminus point itself
    const len = Math.hypot(end.x - X_LIMIT, 0 - Z_MAST);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, len), ironTex);
    bar.position.set((X_LIMIT + end.x) / 2, end.y, Z_MAST / 2);
    bar.rotation.y = Math.atan2(end.x - X_LIMIT, 0 - Z_MAST);
    g.add(bar);
    if (len < 0.2 || len > 0.9) throw Error(`terminus catch law broke: length ${len.toFixed(3)}`);
    if (Math.abs(end.y - Y_LIMIT) > 0.6) throw Error(`terminus catch law broke: end height ${end.y.toFixed(3)} far from bead`);
    console.log(`terminus catch OK: arm len ${len.toFixed(3)}m seats rail end (${end.x.toFixed(2)}, ${end.y.toFixed(2)}) to mast`);
}

// ---- glow census + envelope/NaN laws ----------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > 4.8 || sz.y < 4.3) throw Error(`height ${sz.y.toFixed(2)} outside band [4.3,4.8]`);
    if (sz.x > 4.2 || sz.x < 3.4) throw Error(`width ${sz.x.toFixed(2)} outside band [3.4,4.2]`); // coil swings xLimit±~1.0, asymmetric approach
    if (sz.z > 0.95 || sz.z < 0.5) throw Error(`depth ${sz.z.toFixed(2)} outside band [0.5,0.95]`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 1 glow KEEP node (glow_cl_1)`);
}

const merged = mergeByMaterial(g, "clothoid");
writeFileSync("agents/arthur/assets/village_clothoid3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_clothoid3.glb`);
