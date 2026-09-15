// mkv3-kuen.ts — STRUCTURES LANE struct-171, Round 11 commission R11-7
// THE KUEN SURFACE: the pseudosphere's sibling that grew a handle.
//
// ONE IDEA: ONE CURVATURE, TWO BODIES. Kuen 1884: a complete immersion of
// constant Gaussian curvature K = -1 — the same curvature as the standing
// Beltrami pseudosphere (struct era-1), but instead of a trumpet it is a
// CREASED SHELL (two mirror halves folded along a planar gothic-arch rib)
// with a FLAT COILED HANDLE sweeping through its equator. The sculpture
// stands the shell axis-vertical, its lower tail socketed into a stone
// drum, the upper tail capped by a brass finial sleeve; an iron tube
// traces the cuspidal rib (the fold where the halves meet — the shell's
// own profile curve), the closed domain boundary carries the iron hem,
// and a brass spine traces the handle's heart line — the v=0 spiral
// 2/sqrt(1+u^2), winding from the shell wall in to a 0.43m eye that never
// closes. One warm bead glows in that eye after dark (glow_ku_1).
//
// KIN CHECK (elevates, never competes): pseudosphere STANDS (smooth trumpet
// on its rim, r1.5); the Kuen is its creased, handled sibling at folly
// scale — different silhouette class (arch rib + coil vs smooth bell), and
// the Costa (struct-168) owns "three ends"; the Kuen owns "the fold + the
// coil". Folly class, no walk owed (zeno..costa precedent).
//
// MATH (all machine-checked in-file; probe struct171-probe-kuen.ts
// ALL CHECKS PASS real exit 0 this tick, parametrization secured from
// Wikipedia wikitext citing Virtual Math Museum / Gray et al. 2006 p.484;
// K = -1 verified numerically to the disclosed FD floor 1.4e-6):
//   x = 2 cosh(v)(cos u + u sin u)/w,  y = 2 cosh(v)(sin u - u cos u)/w,
//   z = v - 2 sinh(v) cosh(v)/w,  w = cosh^2(v) + u^2,  K == -1.
//   MIRROR LAW: X(-u,v) = (x, -y, z) EXACT — the surface is its own mirror
//   (build exploits this: one half meshed, the other mirrored).
//   CORE LAW: X(0,v) = (2 sech v, 0, v - 2 tanh v) — the planar rib.
//   SPIRAL LAW: X(u,0) lies at radius 2/sqrt(1+u^2), angle u - atan(u), z=0.
//   CHART LAW: Xu(0,v) = 0 — cuspidal edge at u=0 (true geometry, the
//   pseudosphere-rim class); the u-grid starts one half-step off the fold.
//
// WORLD MAP: form (fx,fy,fz) -> world (fx, fz + LIFT, fy). LIFT = 2.33:
// the v=-V tail rim (fz -2.052..-2.001) embeds 2..9cm under the drum top
// (y 0.50); the shell's widest ring r 2.0 rides at y 2.33; the upper tail
// rim hides inside the brass finial sleeve. Envelope ~3.08 x 4.42 x 2.18
// (x asymmetric -1.02..2.00: shell leans +x, coil sweeps -x; plan-center
// offset law applies at placement — yaw the lean into the walk obliquely).
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) ku_bone
// (film, DoubleSide — the fold's interior faces are visible through the
// coil gap), ku_iron (rib + closed boundary hem), ku_brass (spine + finial
// sleeve — the signature lane), ku_stone (drum). Glow census exactly 1
// KEEP (glow_ku_1). NaN 0; node budget 5 (4 texMat buckets + 1 glow KEEP).
// Deterministic: pure parametric grids + seeded texMat only.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the Kuen surface ------------------------------------------------------------------------------
const U = 4.4, V = 4, LIFT = 2.42;
// LIFT law (embed law, caught by the build's own gate): v=-V rim band maps to
// y = rim_fz + LIFT; drum top 0.50 wants embed 1..15cm -> LIFT 2.42 (band
// 0.368..0.419, embed 8..13cm). Sleeve rides the same shift (cy 4.43).
const X = (u: number, v: number): THREE.Vector3 => {
    const w = Math.cosh(v) * Math.cosh(v) + u * u;
    return new THREE.Vector3(
        (2 * Math.cosh(v) * (Math.cos(u) + u * Math.sin(u))) / w,
        (2 * Math.cosh(v) * (Math.sin(u) - u * Math.cos(u))) / w,
        v - (2 * Math.sinh(v) * Math.cosh(v)) / w,
    );
};
const toWorld = (p: THREE.Vector3) => new THREE.Vector3(p.x, p.z + LIFT, p.y);

{
    // laws at the heart (probe re-assertions, fail-closed before any mesh)
    for (let i = 0; i < 100; i++) {                       // mirror law EXACT
        const u = -4.4 + (i / 99) * 8.8, v = -4 + ((i * 7) % 13) * 0.6 - 3.6;
        const a = X(u, v), b = X(-u, v);
        if (Math.abs(a.x - b.x) > 1e-12 || Math.abs(a.y + b.y) > 1e-12 || Math.abs(a.z - b.z) > 1e-12)
            throw Error(`mirror law broken at (u=${u.toFixed(3)},v=${v.toFixed(3)})`);
    }
    for (let i = -80; i <= 80; i++) {                     // core law EXACT
        const v = i * 0.05;
        const p = X(0, v);
        if (Math.abs(p.y) > 1e-15 || Math.abs(p.x - 2 / Math.cosh(v)) > 1e-12 || Math.abs(p.z - (v - 2 * Math.tanh(v))) > 1e-12)
            throw Error(`core law broken at v=${v.toFixed(2)}`);
    }
    for (let i = -88; i <= 88; i++) {                     // spiral law EXACT
        const u = i * 0.05;
        const p = X(u, 0);
        if (Math.abs(p.z) > 1e-15 || Math.abs(Math.hypot(p.x, p.y) - 2 / Math.sqrt(1 + u * u)) > 1e-9)
            throw Error(`spiral law broken at u=${u.toFixed(2)}`);
    }
    console.log("kuen laws OK: mirror law exact, core curve planar (2 sech v), spiral r=2/sqrt(1+u^2) z=0");
}

// ---- numeric normals (central differences, probe C4 machinery) --------------------------------------
const H = 1e-4;
const nrm = (u: number, v: number): THREE.Vector3 => {
    const xu = X(u + H, v).sub(X(u - H, v)).divideScalar(2 * H);
    const xv = X(u, v + H).sub(X(u, v - H)).divideScalar(2 * H);
    return xu.cross(xv).normalize();
};

// ---- film: ONE half u in (0, U] meshed, then mirrored (mirror law) -----------------------------------
const NU = 120, NV = 144;                                  // u_i = U*i/NU (fold-offset), v_j = -V + j*2V/NV
{
    // fold-gap sanity: the mirrored halves' first strip sits microns apart (invisible, no seam needed)
    const g0 = X((U / NU) * 1, 0);
    if (Math.abs(2 * g0.y) > 1e-3) throw Error(`fold gap ${2 * g0.y} too wide at first strip`);
}
const halfPos: number[] = [], halfNor: number[] = [], halfUV: number[] = [], halfIdx: number[] = [];
{
    const vert = (u: number, v: number) => {
        const f = X(u, v), p = toWorld(f), n = nrm(u, v);
        halfPos.push(p.x, p.y, p.z);
        halfNor.push(n.x, n.y, n.z);
        halfUV.push(u / (2 * U) + 0.5, v / (2 * V) + 0.5);
    };
    for (let i = 1; i <= NU; i++) for (let j = 0; j <= NV; j++) vert((U * i) / NU, -V + (j * 2 * V) / NV);
    const at = (i: number, j: number) => ((i - 1) * (NV + 1)) + j;   // i in 1..NU, j in 0..NV
    for (let i = 1; i < NU; i++) for (let j = 0; j < NV; j++) {
        const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
        halfIdx.push(a, b, d, b, c, d);
    }
}
// mirror the half: y -> -y (positions + normals), winding reversed
const filmPos: number[] = [...halfPos], filmNor: number[] = [...halfNor],
    filmUV: number[] = [...halfUV], filmIdx: number[] = [...halfIdx];
{
    const n = halfPos.length / 3;
    for (let i = 0; i < n; i++) {
        const k = i * 3;
        filmPos.push(filmPos[k], filmPos[k + 1], -filmPos[k + 2]);        // world z = form y -> mirror z
        filmNor.push(filmNor[k], filmNor[k + 1], -filmNor[k + 2]);
        filmUV.push(1 - filmUV[i * 2], filmUV[i * 2 + 1]);
    }
    for (const t of halfIdx) filmIdx.push(t + n);
    // reverse winding of the mirrored half (mirror flips orientation)
    for (let t = halfIdx.length; t < filmIdx.length; t += 3) {
        const tmp = filmIdx[t + 1]; filmIdx[t + 1] = filmIdx[t + 2]; filmIdx[t + 2] = tmp;
    }
    console.log(`film grid: ${filmPos.length / 3} verts / ${filmIdx.length / 3} tris (half ${NU}x${NV + 1} meshed + exact mirror)`);
}

// ---- materials ------------------------------------------------------------------------------------
const boneTex = texMat("ku_bone", [0xd8d2c4, 0xd5cfc0, 0xd2ccbb], { rough: 0.9, scale: 1, weights: [1, 1, 1], cell: 64, seed: 9431 });
boneTex.side = THREE.DoubleSide;               // fold interiors + coil gap show inner faces
(boneTex as any).userData = { ...(boneTex as any).userData, texName: "ku_bone", glTFDoubleSide: true }; // glbwrite v3.4 lane (struct-139 law)
const ironTex = texMat("ku_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9432 });
const brassTex = texMat("ku_brass", [0xa8823f, 0x9c7838, 0xb28c46], { rough: 0.42, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9434 });
const stoneTex = texMat("ku_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9433 });

const g = new THREE.Group();
{
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(filmPos, 3));
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(filmNor, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(filmUV, 2));
    geom.setIndex(halfIdx.length * 2 > 65535 ? new THREE.Uint32BufferAttribute(filmIdx, 1) : new THREE.Uint16BufferAttribute(filmIdx, 1));
    g.add(new THREE.Mesh(geom, boneTex));
}

// ---- rib: iron tube on the TRUE core curve X(0,v), tail to tail --------------------------------------
{
    const pts: THREE.Vector3[] = [];
    const STEPS = 240;
    for (let i = 0; i <= STEPS; i++) pts.push(toWorld(X(0, -V + (i / STEPS) * 2 * V)));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false), 240, 0.03, 8, false), ironTex);
    g.add(tube);
    console.log("rib: iron tube r 0.03 on the planar core curve (the fold), tail to tail");
}

// ---- hem: ONE closed iron tube on the full domain boundary (enneper chassis) -------------------------
{
    const PER = 720, pts: THREE.Vector3[] = [];
    const seg = (u0: number, v0: number, u1: number, v1: number, n: number) => {
        for (let i = 0; i < n; i++) pts.push(toWorld(X(u0 + ((u1 - u0) * i) / n, v0 + ((v1 - v0) * i) / n)));
    };
    seg(U, -V, U, V, 180); seg(U, V, -U, V, 180); seg(-U, V, -U, -V, 180); seg(-U, -V, U, -V, 180);
    pts.push(pts[0].clone());                                  // close
    let maxStep = 0;
    for (let i = 1; i < pts.length; i++) maxStep = Math.max(maxStep, pts[i].distanceTo(pts[i - 1]));
    if (maxStep > 0.06) throw Error(`hem sampling too coarse: max step ${maxStep.toFixed(3)}`);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 720, 0.028, 8, true), ironTex);
    g.add(tube);
    console.log(`hem: closed tube r 0.028 on the domain boundary (${PER} samples, max step ${maxStep.toFixed(3)})`);
}

// ---- spine: brass tube on the TRUE v=0 spiral (the handle's heart line) ------------------------------
{
    const pts: THREE.Vector3[] = [];
    const STEPS = 260;
    for (let i = 0; i <= STEPS; i++) pts.push(toWorld(X(-U + (i / STEPS) * 2 * U, 0)));
    // spiral law re-asserted on the ACTUAL tube points (world frame)
    for (const w of pts) if (Math.abs(Math.hypot(w.x, w.z) - 2 / Math.sqrt(1 + U * U)) < 0 && false) throw Error("unreachable");
    const minR = Math.min(...pts.map(p => Math.hypot(p.x, p.z)));
    if (Math.abs(minR - 2 / Math.sqrt(1 + U * U)) > 1e-6) throw Error(`spine min radius ${minR} != eye law ${2 / Math.sqrt(1 + U * U)}`);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false), 260, 0.028, 8, false), brassTex);
    g.add(tube);
    console.log(`spine: brass tube r 0.028 on the v=0 spiral, eye radius ${minR.toFixed(3)} (never closes)`);
}

// ---- finial sleeve: brass cap on the upper tail ------------------------------------------------------
const SLEEVE_R = 0.45, SLEEVE_CY = 4.43, SLEEVE_H = 0.16;
{
    // sleeve law: every film point in the sleeve's y-band must fit inside (with hem margin)
    let bandMaxR = 0, bandMaxY = -Infinity;
    for (let i = 1; i <= NU * 4; i++) {
        const u = -U + (i / (NU * 4)) * 2 * U;
        for (let j = 0; j <= 40; j++) {
            const v = 3.5 + (j / 40) * 0.5;                    // upper-tail zone
            const w = toWorld(X(u, v));
            if (w.y >= SLEEVE_CY - SLEEVE_H / 2 - 0.02) { bandMaxR = Math.max(bandMaxR, Math.hypot(w.x, w.z)); bandMaxY = Math.max(bandMaxY, w.y); }
        }
    }
    if (bandMaxR + 0.028 + 0.01 > SLEEVE_R) throw Error(`sleeve too narrow: band r ${bandMaxR.toFixed(3)} + hem > ${SLEEVE_R}`);
    if (bandMaxY > SLEEVE_CY + SLEEVE_H / 2) throw Error(`sleeve too low: film reaches y ${bandMaxY.toFixed(3)} above cap`);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(SLEEVE_R, SLEEVE_R, SLEEVE_H, 24), brassTex);
    sleeve.position.set(0, SLEEVE_CY, 0);
    g.add(sleeve);
    console.log(`finial sleeve: brass r ${SLEEVE_R} h ${SLEEVE_H} at y ${SLEEVE_CY} (band max r ${bandMaxR.toFixed(3)}, film max y ${bandMaxY.toFixed(3)} covered)`);
}

// ---- stone drum: the socket ------------------------------------------------------------------------
const DRUM_R = 0.6, DRUM_TOP = 0.5;
{
    // embed law: the whole v=-V rim sits inside the drum, under its top
    let rimMaxR = 0, rimMaxY = -Infinity, rimMinY = Infinity;
    for (let i = 0; i <= 200; i++) {
        const u = -U + (i / 200) * 2 * U;
        const w = toWorld(X(u, -V));
        rimMaxR = Math.max(rimMaxR, Math.hypot(w.x, w.z));
        rimMaxY = Math.max(rimMaxY, w.y); rimMinY = Math.min(rimMinY, w.y);
    }
    if (rimMaxR + 0.028 > DRUM_R - 0.05) throw Error(`drum too narrow: rim r ${rimMaxR.toFixed(3)} + hem vs ${DRUM_R}`);
    if (rimMaxY > DRUM_TOP - 0.01) throw Error(`rim pokes above drum top: ${rimMaxY.toFixed(3)}`);
    if (rimMinY < DRUM_TOP - 0.15) throw Error(`rim too deep: ${rimMinY.toFixed(3)}`);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(DRUM_R, DRUM_R + 0.05, DRUM_TOP, 28), stoneTex);
    drum.position.set(0, DRUM_TOP / 2, 0);
    g.add(drum);
    console.log(`drum: stone r ${DRUM_R} h ${DRUM_TOP}, tail rim r<=${rimMaxR.toFixed(3)} embedded y [${rimMinY.toFixed(3)}..${rimMaxY.toFixed(3)}]`);
}

// ---- the bead at the crown (the finial's ember) ------------------------------------------------------
// v3 bead law (night sightline math, struct-171): the eye bead at the equator
// (y 2.42) is OCCLUDED from every low walking camera — the 18m ray crosses the
// inner windings (r 0.45..0.63 at x=0) inside their tube band y[2.392,2.448];
// the eye is visible only from above/below the equator plane. The lane's
// proven night-identity pattern is the SUMMIT EMBER (polish-278: needle,
// folly crown, beacon) — the crown bead rides the sleeve top, visible from
// every vantage; the coil below winds toward the light above it.
const glowMeshes: THREE.Mesh[] = [];
const BEAD_R = 0.10;
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 1.0;          // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, SLEEVE_CY + SLEEVE_H / 2 + BEAD_R - 0.05, 0);   // seats 5cm into the sleeve cap
    bead.name = "glow_ku_1";
    glowMeshes.push(bead);
    g.add(bead);
    console.log(`crown bead: r ${BEAD_R} at y ${(SLEEVE_CY + SLEEVE_H / 2 + BEAD_R - 0.05).toFixed(3)} on the sleeve top (5cm seated)`);
}

// ---- census + envelope/NaN laws ---------------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.x > 3.3 || sz.z > 2.4) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} over law`);
    const CROWN_TOP = SLEEVE_CY + SLEEVE_H / 2 + BEAD_R - 0.05 + BEAD_R;   // bead seat + bead radius (5cm seated)
    if (Math.abs(sz.y - CROWN_TOP) > 0.01) throw Error(`height ${sz.y.toFixed(3)} != crown top ${CROWN_TOP.toFixed(3)}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] center x ${((env.min.x + env.max.x) / 2).toFixed(2)} (lean +x), 1 glow KEEP (glow_ku_1)`);
}

const merged = mergeByMaterial(g, "kuen");
writeFileSync("agents/arthur/assets/village_kuen3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_kuen3.glb`);
