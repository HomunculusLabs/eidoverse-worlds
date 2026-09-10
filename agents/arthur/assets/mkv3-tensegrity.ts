// mkv3-tensegrity.ts — STRUCTURES LANE struct-142, Round 11 commission R11-2.
//
// THE NEEDLE (tensegrity tower): the form ledger's missing FLOATING
// COMPRESSION / TENSEGRITY family. Ledger grep fresh this tick: zero
// "tensegrity"/"snelson"/"floating compression" presence across
// STRUCTURES-PLAN.md + IMPROVEMENTS.md + IMPROVE-PLAN.md. Standing works
// are all CONTINUOUS structures (ruled surfaces, knots, lattices, films);
// no standing work has disconnected compression members. Klein bottle and
// Hopf fibration were probed and BARRED by the novelty law's 4D-descendant
// rule (struct-111 precedent). First R11 form after the Boy's Surface
// (R11-1); build+judge this tick, placement next tick (struct-136/137
// cadence precedent) on an under-served ray, 8m NN floor, district cap 6.
//
// ONE IDEA: A MAST OF TIMBERS THAT NEVER TOUCH. A three-stage Snelson-class
// needle: nine timber struts, three per stage, each stage rotated +60 deg
// over the one below; NO strut touches any other strut (the family's
// definition, asserted in-file and from bytes). Between stages the mast is
// carried only by a spiral cage of brass tendons — saddle diagonals down
// each stage, short splayed wires across the floating joints, three wires
// rising to a single brass bead held in the air above the crown. The bead
// glows after dark (glow_tn_1, struct-82 dusk lineage). Struts = timber
// (built thing, not art object), tendons = brass wire (the village's
// tension-line medium), sockets + slab = stone. Folly class, no entry
// advertised, no walk owed (zeno..boy precedent). Rotationally 3-fold:
// yaw-pi family seating for census consistency.
//
// MATH (all asserted):
//   Stage k in {0,1,2}: base angle offset alpha_k = k * pi/3.
//   Strut i in {0,1,2}: phi = alpha_k + 2*pi*i/3.
//     Bottom vertex B = (Rb_k cos phi,            yb_k, Rb_k sin phi)
//     Top vertex    T = (Rt_k cos(phi + pi/3),    yt_k, Rt_k sin(phi + pi/3))
//   STACKING LAW: stage k top angles (alpha_k + 2pii/3 + pi/3) equal
//   stage k+1 bottom angles (alpha_k+1 + 2pii/3) exactly — each upper
//   strut floats directly above a lower strut's top, radially inset,
//   touching nothing.
//   Saddles (per stage): T_i -> B_{i+1} (the twist-direction diagonal).
//   Gap wires (per joint): stage-k T_i -> stage-(k+1) B_i.
//   Crown wires: stage-2 T_i -> bead center (bead radius covers the join).
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) tn_timber /
// tn_brass / tn_stone — no plain materials (struct-38/55/56 dead-lane
// class). Glow census exactly 1 KEEP (glow_tn_1, unique token this cast).
// Deterministic: pure parametric geometry + seeded texMat only.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- parameters ------------------------------------------------------------------------------------
// v2 (struct-143, five judge fix classes):
//   (1) float gaps widened 0.25 -> 0.45 m (stage1 yb 2.35->2.55, stage2 yb 4.45->4.85),
//       bead raised 6.62 -> 6.95 (crown gap 0.50 reads at 18 m);
//   (2) "flush saddle" claim decode-FALSIFIED in 3D (min non-anchor axis approach
//       0.269 m, weave law 0.06 nowhere near violated) — the flush read is 2D projection
//       crowding; cured by (1)+(4), no reroute needed;
//   (3) timber palette warmed olive -> oak/walnut;
//   (4) TENDON_R 0.038 -> 0.055 (3-4 px at 51.7 px/m) + brighter brass lane;
//   (5) three GROUND GUYS added: stage-1 TOP T_i -> stone anchor blocks at r1.75,
//       angle theta_i - 60deg (tension-foundation vocabulary; probe-proven clear of all
//       struts by >= 0.37 m — radial guys from B1 were proven infeasible: anchor would
//       need r >= 3.0 to clear stage-0 tops, off-slab).
const SLAB = 0.14;
const STAGES = [
    { yb: 0.20, yt: 2.10, Rb: 1.55, Rt: 1.30 },   // stage 0: bottoms buried in the socket band (tops 0.47)
    { yb: 2.55, yt: 4.40, Rb: 1.10, Rt: 0.95 },   // stage 1: first float (gap 0.45)
    { yb: 4.85, yt: 6.45, Rb: 0.85, Rt: 0.72 },   // stage 2: crown float (gap 0.45)
];
const TWIST = Math.PI / 3;                          // +60 deg per stage (spiral needle)
const STRUT_R = 0.065;
const TENDON_R = 0.055;
const BEAD = new THREE.Vector3(0, 6.95, 0);
const BEAD_R = 0.13;
const SOCK_H = 0.42;                                // socket block top (stage-0 bottoms embed)
const ANCHOR_R = 1.66, ANCHOR_H = 0.36, ANCHOR_W = 0.22, ANCHOR_D = 0.52;  // ground-guy anchor blocks (tension foundation; r+half-depth 1.92 < slab 1.95)

// strut vertices (entity local, slab top at y=0.14; stage-0 bottoms y=0.05 sit inside sockets)
type V3 = THREE.Vector3;
const strutB: V3[][] = [], strutT: V3[][] = [];     // [stage][i]
for (let k = 0; k < 3; k++) {
    const S = STAGES[k], alpha = k * TWIST;
    strutB.push([]); strutT.push([]);
    for (let i = 0; i < 3; i++) {
        const phi = alpha + (2 * Math.PI * i) / 3;
        strutB[k].push(new THREE.Vector3(S.Rb * Math.cos(phi), S.yb, S.Rb * Math.sin(phi)));
        strutT[k].push(new THREE.Vector3(S.Rt * Math.cos(phi + TWIST), S.yt, S.Rt * Math.sin(phi + TWIST)));
    }
}

// ---- segment-segment distance (for the disjoint laws) ----------------------------------------------
function segSegDist(p1: V3, q1: V3, p2: V3, q2: V3): number {
    const d1 = new THREE.Vector3().subVectors(q1, p1), d2 = new THREE.Vector3().subVectors(q2, p2), r = new THREE.Vector3().subVectors(p1, p2);
    const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r);
    let s = 0, t = 0;
    if (a <= 1e-12 && e <= 1e-12) return r.length();
    if (a <= 1e-12) { t = THREE.MathUtils.clamp(f / e, 0, 1); }
    else {
        const c = d1.dot(r);
        if (e <= 1e-12) { s = THREE.MathUtils.clamp(-c / a, 0, 1); }
        else {
            const b = d1.dot(d2), den = a * e - b * b;
            s = den !== 0 ? THREE.MathUtils.clamp((b * f - c * e) / den, 0, 1) : 0;
            t = (b * s + f) / e;
            if (t < 0) { t = 0; s = THREE.MathUtils.clamp(-c / a, 0, 1); }
            else if (t > 1) { t = 1; s = THREE.MathUtils.clamp((b - c) / a, 0, 1); }
        }
    }
    const c1 = new THREE.Vector3().addVectors(p1, d1.multiplyScalar(s)), c2 = new THREE.Vector3().addVectors(p2, d2.multiplyScalar(t));
    return c1.distanceTo(c2);
}

// ---- asserted laws (pre-build) ----------------------------------------------------------------------
{
    // STACKING LAW: stage-k top angles == stage-(k+1) bottom angles
    for (let k = 0; k < 2; k++) for (let i = 0; i < 3; i++) {
        const T = strutT[k][i], B = strutT.length > k + 1 ? strutB[k + 1][i] : null;
        if (!B) continue;
        const aT = Math.atan2(T.z, T.x), aB = Math.atan2(B.z, B.x);
        const d = Math.abs(((aT - aB) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
        if (d > 1e-9) throw Error(`stacking law: stage ${k} top angle != stage ${k + 1} bottom angle (i=${i}, ${d})`);
    }
    // FLOATING JOINT LAW: upper-stage strut bottoms clear the lower stage's tops by >= 0.20 m
    for (let k = 0; k < 2; k++) for (let i = 0; i < 3; i++) {
        const g = strutB[k + 1][i].y - strutT[k][i].y;
        if (g < 0.20) throw Error(`floating joint law: joint ${k}->${k + 1} gap ${g.toFixed(3)} < 0.20`);
    }
    // STRUT-DISJOINT LAW: no strut touches any other (the family definition). >= 0.10 m.
    let worst = Infinity;
    for (let a = 0; a < 9; a++) for (let b = a + 1; b < 9; b++) {
        const ka = Math.floor(a / 3), ia = a % 3, kb = Math.floor(b / 3), ib = b % 3;
        const d = segSegDist(strutB[ka][ia], strutT[ka][ia], strutB[kb][ib], strutT[kb][ib]);
        worst = Math.min(worst, d);
        if (d < 0.16) throw Error(`strut-disjoint law: struts ${a},${b} gap ${d.toFixed(3)} < 0.16 — surfaces could touch (2*STRUT_R=0.13) — NOT tensegrity`);
    }
    // GROUND LAW: only stage-0 struts descend below y 0.5
    for (let k = 1; k < 3; k++) for (const v of [...strutB[k], ...strutT[k]])
        if (v.y < 0.5) throw Error(`ground law: stage ${k} vertex at y ${v.y} — only stage 0 grounds`);
    console.log(`tensegrity laws OK: min strut gap ${worst.toFixed(3)} m (law >= 0.10), stacking + floating joints verified`);
}

// ---- tendon table (anchors exact) -------------------------------------------------------------------
// saddles T_i -> B_{i+1} per stage; gap wires stage-k T_i -> stage-(k+1) B_i; crown wires stage-2 T_i -> bead
type Tendon = { a: V3; b: V3; anchors: [number, number][] };  // anchors: strut ids [stage,i] the ends touch
const tendons: Tendon[] = [];
for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    tendons.push({ a: strutT[k][i].clone(), b: strutB[k][j].clone(), anchors: [[k, i], [k, j]] });
}
for (let k = 0; k < 2; k++) for (let i = 0; i < 3; i++)
    tendons.push({ a: strutT[k][i].clone(), b: strutB[k + 1][i].clone(), anchors: [[k, i], [k + 1, i]] });
for (let i = 0; i < 3; i++)
    tendons.push({ a: strutT[2][i].clone(), b: BEAD.clone(), anchors: [[2, i], [-1, -1]] }); // bead end: anchor -1 = bead
// ground guys (v2 fix class 5): stage-1 top T_i -> anchor-block eye at theta_i - 60deg, block top (r1.66, y0.36)
for (let i = 0; i < 3; i++) {
    const th = Math.atan2(strutT[1][i].z, strutT[1][i].x) - Math.PI / 3;
    tendons.push({ a: strutT[1][i].clone(), b: new THREE.Vector3(ANCHOR_R * Math.cos(th), ANCHOR_H, ANCHOR_R * Math.sin(th)), anchors: [[1, i], [-2, -2]] }); // -2 = ground anchor block top
}
if (tendons.length !== 21) throw Error(`tendon census ${tendons.length} != 21`);

// WEAVE LAW: every tendon passes within 0.06 m ONLY of its two anchor struts
{
    for (let t = 0; t < tendons.length; t++) {
        const tn = tendons[t];
        for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) {
            const isAnchor = tn.anchors.some(([ak, ai]) => ak === k && ai === i);
            const d = segSegDist(tn.a, tn.b, strutB[k][i], strutT[k][i]);
            if (!isAnchor && d < 0.06) throw Error(`weave law: tendon ${t} clears strut ${k},${i} by ${d.toFixed(3)} < 0.06 (should only touch its anchors)`);
        }
    }
    console.log(`weave law OK: all ${tendons.length} tendons touch only their anchor struts`);
}

// ---- scene --------------------------------------------------------------------------------------------
const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];
const timberTex = texMat("tn_timber", [0x5a4030, 0x6a4d39, 0x453024], { rough: 0.88, scale: 3, weights: [3, 1, 1], seed: 9421 });   // v3 WALNUT two-value (struct-144): dark compression / bright tension. struct-143 native judge: v2 straw 0x96683c L=0.167 collided with mid-brass 0xb08f42 L=0.293 (delta 0.126) — tendons read as second timber. New lightest timber 0x6a4d39 L=0.087 clears mid-brass by 0.206 (3.4x) and bright 0xd0b060 by 0.366 (5.2x).
const brassTex = texMat("tn_brass", [0xbfa14e, 0xb08f42, 0xd0b060], { rough: 0.38, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9422 }); // v2 brighter brass (enneper ep_brass lineage)
const stoneTex = texMat("tn_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9423 });       // boy bs_stone lane

const strutMesh = (B: V3, T: V3) => {
    const dir = new THREE.Vector3().subVectors(T, B), L = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(STRUT_R, STRUT_R, L, 8), timberTex); // exact B->T (stage-0 bottoms sit inside the socket band by parameter)
    m.position.copy(B).add(T).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    g.add(m);
};
for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) strutMesh(strutB[k][i], strutT[k][i]);

const tendonMesh = (a: V3, b: V3) => {
    const dir = new THREE.Vector3().subVectors(b, a), L = dir.length();
    if (L < 1e-6) throw Error("degenerate tendon");
    const m = new THREE.Mesh(new THREE.CylinderGeometry(TENDON_R, TENDON_R, L, 6), brassTex);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    g.add(m);
};
for (const tn of tendons) tendonMesh(tn.a, tn.b);

// sockets: stone block around each stage-0 strut bottom (strut end y 0.05 inside block top 0.42)
for (let i = 0; i < 3; i++) {
    const B = strutB[0][i];
    const sock = new THREE.Mesh(new THREE.BoxGeometry(0.34, SOCK_H - SLAB + 0.08, 0.34), stoneTex);
    sock.position.set(B.x, (0.14 + SOCK_H + 0.06) / 2 - 0.02, B.z); // spans slab top into the socket band
    sock.lookAt(new THREE.Vector3(B.x * 2, sock.position.y, B.z * 2));          // yawed to face outward radially
    g.add(sock);
}

// ground-guy anchor blocks (v2 class 5): stone, r1.75, low and yawed radially
for (let i = 0; i < 3; i++) {
    const th = Math.atan2(strutT[1][i].z, strutT[1][i].x) - Math.PI / 3;
    const ax = ANCHOR_R * Math.cos(th), az = ANCHOR_R * Math.sin(th);
    const blk = new THREE.Mesh(new THREE.BoxGeometry(ANCHOR_W, ANCHOR_H - SLAB, ANCHOR_D), stoneTex);
    blk.position.set(ax, (SLAB + ANCHOR_H) / 2, az);   // spans slab top 0.14 to eye height 0.36 (top face center = guy eye)
    blk.lookAt(new THREE.Vector3(ax * 2, blk.position.y, az * 2));
    g.add(blk);
}

// slab
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(3.9, SLAB, 3.9), stoneTex);
    slab.position.set(0, SLAB / 2, 0);
    g.add(slab);
}

// THE BEAD at the crown: the only light
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 0.85;               // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.copy(BEAD);
    bead.name = "glow_tn_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- census + envelope laws ----------------------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y < 6.9 || sz.y > 7.35) throw Error(`height ${sz.y.toFixed(3)} outside [6.9, 7.35]`);
    if (Math.abs(sz.x - 3.9) > 0.02 || Math.abs(sz.z - 3.9) > 0.02) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != 3.90 sq (+/-0.02)`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = (function count(x: any): number { let n = 0; x.children?.forEach((c: any) => { n += c.isMesh ? 1 : count(c); }); return n; })(g);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], ${meshes} meshes pre-merge, 1 glow KEEP (glow_tn_1), 21 tendons + 9 struts + 3 sockets + 3 anchors + slab`);
}

const merged = mergeByMaterial(g, "tensegrity");
writeFileSync("agents/arthur/assets/village_tensegrity3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_tensegrity3.glb`);
