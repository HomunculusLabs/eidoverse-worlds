// mkv3-sunflowerdial.ts — STRUCTURES LANE struct-108, Round 10 commission R10-9.
// THE SUNFLOWER DIAL: the form ledger's missing family — PHYLLOTAXIS (the
// Vogel / golden-angle spiral; ledger check fresh this tick: curves,
// compositions, ruled, pseudosphere, tessellation, aperiodic, fractal,
// geodesic, minimal surface, space-filling, torus-knot, Platonic solid all
// stand — zero phyllotaxis/Vogel presence in the 56 nx-struct works).
//
// ONE IDEA: THE SEEDHEAD'S OWN ORDER, AT MONUMENT SCALE. A giant flower
// head on a stone stem: 89 achenes (Fibonacci) seated at the EXACT Vogel
// positions r_k = c·√k, θ_k = k·γ (γ = 137.5077640° = 360°·(2−φ)); this
// head's TRUE contact families 13/21 mid-disc and 21/34 rim (contact-family
// law k* ≈ d/(2·wrap(dγ)): d=34 contacts at k≈206 — the 34/55 read belongs
// to a ~500-seed head; asserting it here was a hand-me-down the census
// assert caught) — the parastichies ARE the ornament, no applied trim.
// Dark receptacle bed behind the seeds makes the packing gaps read as
// shadowed crevices. 11-bract stone calyx swept back along the face normal
// (a real calyx, not a skirt); the crown bract is a long steep reflex that
// carries one brass dusk bead — the sun the flower faces (struct-107
// crest-seat lineage: stone socket + bead, mass makes it read intentional;
// Raycaster sightline asserted from five 18m vantages + 6m rim-read).
// Pollinator triad on the W shoulder: lavender fields → honeycomb screen
// (R10-1) → the dial that counts them both (89 = F11).
//
// CHASSIS LAW (learned this tick): mergeByMaterial + the decode chassis are
// FLAT-GROUP tools — a nested head group exported 115 unmerged meshes.
// Head tilt is baked per-mesh here (QTILT·q composition), everything added
// flat to g.
//
// Determinism: no randomness; fixed seeds on texMat lanes.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// ---- constants ----------------------------------------------------------------
const PHI = (1 + Math.sqrt(5)) / 2;
const GAMMA = 2 * Math.PI * (2 - PHI);      // golden angle, radians (137.5077640°)
const N = 89;                                // F11 seeds
const C = 0.30;                              // Vogel c
const TILT = -15 * Math.PI / 180;            // head tips back at the crown
const HEAD_Y = 4.05;
const BR = 0.11;                             // brass bead radius (dusk lineage)
const QTILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(TILT, 0, 0));
const HEAD_OFF = new THREE.Vector3(0, HEAD_Y, 0);

// materials — R10 mathematical-stone lineage with the seedhead's warm tones.
const faceStone = texMat("sd_face", [0x8f8879, 0x979180, 0x837c6d], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 6201 });
const bedStone  = texMat("sd_bed",  [0x55534b, 0x5d5b53, 0x4c4a42], { rough: 0.97, scale: 2, weights: [3, 1, 1], seed: 6202 });
const bractStone = texMat("sd_bract", [0x6e7a68, 0x77836f, 0x636f5b], { rough: 0.96, scale: 2, weights: [3, 1, 1], seed: 6203 });
const stemStone = texMat("sd_stem", [0x5c6656, 0x64705a, 0x525c4e], { rough: 0.96, scale: 2, weights: [3, 1, 1], seed: 6204 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

// add a head-local mesh to the FLAT group with the tilt baked in
function addHead(mesh: THREE.Mesh, localPos: THREE.Vector3, localQuat?: THREE.Quaternion) {
    mesh.position.copy(localPos.clone().applyQuaternion(QTILT).add(HEAD_OFF));
    mesh.quaternion.copy(QTILT).multiply(localQuat ?? new THREE.Quaternion());
    g.add(mesh);
}

// ---- Vogel lattice ---------------------------------------------------------------
type Seed = { k: number; r: number; th: number; LA: number };
const seeds: Seed[] = [];
for (let k = 1; k <= N; k++) {
    const r = C * Math.sqrt(k);
    const th = k * GAMMA;
    const LA = 0.15 + 0.15 * (k - 1) / (N - 1);   // radial half-length 0.15→0.30
    seeds.push({ k, r, th, LA });
}
const R_MAX = seeds[N - 1].r + 2 * seeds[N - 1].LA;   // outer seed tip radius

// parastichy check (computed): neighbors among centers
// contact-family law (derived, not assumed): family d contacts at
// k* ≈ d/(2·wrap(d·γ)) — for THIS head (N=89, c=0.3): d=8→k≈11,
// d=13→k≈30, d=21→k≈78 (rim), d=34→k≈206 (beyond the head), d=55→k≈538.
{
    const P = seeds.map(s => ({ x: (s.r + s.LA) * Math.cos(s.th), y: (s.r + s.LA) * Math.sin(s.th) }));
    const FAMS = [8, 13, 21, 34, 55];
    const fam = Object.fromEntries(FAMS.map(d => [d, 0]));
    let rimOK = 0, rimTot = 0, midOK = 0, midTot = 0, anyOK = 0, tot = 0;
    for (let i = 0; i < N; i++) {
        const k = seeds[i].k;
        if (k < 12 || k > 78) continue;
        tot++;
        const dists = P.map((p, j) => ({ j, d: Math.hypot(p.x - P[i].x, p.y - P[i].y) }))
            .filter(o => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 6);
        const near = new Set(dists.map(o => seeds[o.j].k));
        for (const d of FAMS) fam[d] += [...near].filter(x => Math.abs(x - k) === d).length;
        const u21 = [...near].filter(x => Math.abs(x - k) === 21).length;
        const u34 = [...near].filter(x => Math.abs(x - k) === 34).length;
        const u13 = [...near].filter(x => Math.abs(x - k) === 13).length;
        const u8 = [...near].filter(x => Math.abs(x - k) === 8).length;
        if (u21 + u34 + u13 + u8 >= 2) anyOK++;
        if (k >= 50) { rimTot++; if (u21 + u34 >= 2) rimOK++; }
        if (k >= 20 && k <= 45) { midTot++; if (u13 + u21 >= 2) midOK++; }
    }
    console.log(`parastichy census (k 12..78, 6-NN): families ${FAMS.map(d => `${d}:${fam[d]}`).join(" ")} | ladder>=2 ${anyOK}/${tot} | rim 21/34 ${rimOK}/${rimTot} | mid 13/21 ${midOK}/${midTot}`);
    if (anyOK / tot < 0.70) throw Error(`parastichy ladder fail: ${anyOK}/${tot} seeds carry >=2 {8,13,21}-family neighbors in 6-NN`);
    if (rimTot >= 10 && rimOK / rimTot < 0.60) throw Error(`rim parastichy fail: 21/34 only ${rimOK}/${rimTot}`);
    if (midTot >= 10 && midOK / midTot < 0.60) throw Error(`mid parastichy fail: 13/21 only ${midOK}/${midTot}`);
    // Vogel law exact
    for (let i = 1; i < N; i++) {
        const dth = seeds[i].th - seeds[i - 1].th;
        if (Math.abs(dth - GAMMA) > 1e-9) throw Error(`angle law fail at k=${seeds[i].k}`);
        if (Math.abs(seeds[i].r - C * Math.sqrt(seeds[i].k)) > 1e-9) throw Error(`radius law fail at k=${seeds[i].k}`);
    }
}

// ---- head members (head-local frame: face plane = XY, +Z = face normal) -----------
// receptacle bed: dark disc behind the seeds (gaps read as crevice shadow)
{
    const bed = new THREE.Mesh(new THREE.CylinderGeometry(R_MAX - 0.05, R_MAX - 0.12, 0.12, 48), bedStone);
    addHead(bed, new THREE.Vector3(0, 0, -0.10),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)));
}
// 89 achenes: ellipsoids elongated radially, inner tip exactly at r_k.
// SphereGeometry(1, 16, 12): 12 theta segments put a vertex row EXACTLY at
// θ=π/2 → the inner tip vertex lands at precisely (r_k·cosθ_k, r_k·sinθ_k)
// on the radial line (odd segment counts leave the tip 1.5% short — the
// decode Vogel check caught it; geometry, not tolerance).
for (const s of seeds) {
    const LA = s.LA, LB = 0.58 * LA, LC = 0.60 * LA;
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), faceStone);
    m.scale.set(LA, LB, LC);
    const rc = s.r + LA;
    addHead(m, new THREE.Vector3(rc * Math.cos(s.th), rc * Math.sin(s.th), 0),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, s.th)));
}

// calyx: 11 bracts behind the rim; alternating long/short; crown bract (φ=90°)
// is a LONG STEEP REFLEX carrying the brass bead socket (the sun).
{
    const NB = 11, baseR = R_MAX - 0.08;
    for (let b = 0; b < NB; b++) {
        const phi = b * 2 * Math.PI / NB + 0.13;
        const isCrown = Math.abs(((phi - Math.PI / 2 + Math.PI) % (2 * Math.PI)) - Math.PI) < (Math.PI / NB);
        const long = (b % 2 === 0) !== isCrown ? true : isCrown;  // crown is always long
        const L1 = long ? 0.58 : 0.40, L2 = isCrown ? 0.68 : (long ? 0.38 : 0.26);
        const rad = new THREE.Vector3(Math.cos(phi), Math.sin(phi), 0);
        const base = rad.clone().multiplyScalar(baseR).add(new THREE.Vector3(0, 0, -0.10));
        // segment 1: swept BACK along the face normal (a real calyx, not a
        // skirt): d1 = rad·flare + (−ẑ)·back. A radial-outward droop is wrong
        // twice — for the bottom bract, outward IS world-down (disc nearly
        // upright), stacking with any world-down term to reach below grade
        // (grade assert caught it at −0.16).
        const d1 = rad.clone().multiplyScalar(0.35).add(new THREE.Vector3(0, 0, -0.94)).normalize();
        const seg1 = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), bractStone);
        seg1.scale.set(0.24, 0.08, L1 / 2);
        addHead(seg1, base.clone().add(d1.clone().multiplyScalar(L1 / 2)),
            new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d1));
        // segment 2: tip flicked UP in world space (crown bract strongly — the
        // reflex that carries the sun). Built from scratch (radial + explicit
        // +y lift), NOT axis-relative rotation (handedness flips per bract).
        // Crown bract: steeper (62°), less back-lean, longer — the bead must
        // clear the neighboring raised tips from EVERY 18m arc (sightline law).
        const up2 = isCrown ? 62 : 25;
        const back2 = isCrown ? 0.04 : 0.10;
        const d2 = rad.clone().multiplyScalar(Math.cos(up2 * Math.PI / 180) * 0.92)
            .add(new THREE.Vector3(0, Math.sin(up2 * Math.PI / 180), 0))
            .add(new THREE.Vector3(0, 0, -back2)).normalize();
        // world-y floor: bottom-hemisphere bracts must not reach the plinth
        // (top 0.42) — clamp chain length so the final tip clears 0.55.
        let l1 = L1, l2 = L2;
        {
            const toW = (v: THREE.Vector3) => v.clone().applyQuaternion(QTILT).add(HEAD_OFF);
            const bpw = toW(base);
            const t2w = toW(base.clone().add(d1.clone().multiplyScalar(L1)).add(d2.clone().multiplyScalar(L2)));
            if (t2w.y < 0.55 && bpw.y > 0.55) {
                const s = (bpw.y - 0.55) / (bpw.y - t2w.y);
                l1 = L1 * s; l2 = L2 * s;
            }
        }
        const seg2 = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), bractStone);
        seg2.scale.set(0.19, 0.06, l2 / 2);
        const mid = base.clone().add(d1.clone().multiplyScalar(l1));
        addHead(seg2, mid.clone().add(d2.clone().multiplyScalar(l2 / 2)),
            new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d2));
        if (isCrown) {
            // stone socket at the crown tip (mass/transition make the finial read
            // intentional — struct-107 v2c law), brass bead proud at its terminal.
            // Socket tapers to a cap NARROWER than the bead (0.09 < BR) so the
            // bead reads as a full point from the walk; from dead-ahead close
            // range the socket honestly occludes the bead's center (physical
            // geometry, struct-107 tested 18m only) — the rim still reads.
            const tip = mid.clone().add(d2.clone().multiplyScalar(l2));
            const sockDir = d2.clone();
            const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 0.12, 8), stemStone);
            socket.name = "glow_sd_socket";
            addHead(socket, tip.clone().add(sockDir.clone().multiplyScalar(0.06)),
                new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), sockDir));
            const bead = new THREE.Mesh(new THREE.SphereGeometry(BR, 12, 10), brassGlow);
            bead.name = "glow_sd_1";
            addHead(bead, tip.clone().add(sockDir.clone().multiplyScalar(0.12 + 0.02 + BR)));
        }
    }
}

// ---- stem + collar + plinth -------------------------------------------------------
{
    const stemTop = 4.42;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.21, stemTop, 12), stemStone);
    stem.position.set(0, stemTop / 2, 0);
    g.add(stem);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.34, 0.22, 14), stemStone);
    collar.position.set(0, stemTop - 0.02, 0);
    g.add(collar);
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.42, 0.22, 20), stemStone);
    p1.position.set(0, 0.11, 0);
    g.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.08, 0.20, 20), stemStone);
    p2.position.set(0, 0.32, 0);
    g.add(p2);
}

// ---- bead sightline assertion (Raycaster; occlusion-beats-emissive law) ------------
// Law: from every 18m walk vantage the bead center ray is UNBLOCKED; from
// 6m the bead RIM must read (≥2 of 7 sampled rays clear — dead-ahead-close
// the socket honestly occludes the bead center; physical geometry, and the
// socket cap (0.09) is narrower than the bead so the rim reads as a point).
{
    g.updateMatrixWorld(true);
    const bead = g.getObjectByName("glow_sd_1") as THREE.Mesh;
    const target = new THREE.Vector3();
    bead.getWorldPosition(target);
    const targets: THREE.Object3D[] = [];
    g.traverse(o => { if ((o as any).isMesh && o !== bead) targets.push(o); });
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true as any;
    let worst = "none";
    for (const [deg, dist] of [[0, 18], [30, 18], [-30, 18], [60, 18], [-60, 18]] as Array<[number, number]>) {
        const a = deg * Math.PI / 180;
        const eye = new THREE.Vector3(Math.sin(a) * dist, 1.65, Math.cos(a) * dist);
        const dir = target.clone().sub(eye).normalize();
        ray.set(eye, dir);
        const hits = ray.intersectObjects(targets, false);
        const beadDist = eye.distanceTo(target);
        if (hits.length && hits[0].distance < beadDist - BR - 0.02) {
            worst = `blocked from ${deg}°@${dist}m by ${hits[0].object.name || hits[0].object.type} at ${hits[0].distance.toFixed(2)} (bead ${beadDist.toFixed(2)})`;
            break;
        }
    }
    if (worst !== "none") throw Error(`bead sightline fail: ${worst}`);
    // 6m rim-read test: ≥2 of 7 rays to bead-surface sample points must clear
    let clear6 = 0;
    const bd = target.clone();
    for (let i = 0; i < 7; i++) {
        const a = (i - 3) * 12 * Math.PI / 180;      // -36°..+36° arc around the head
        const eye = new THREE.Vector3(Math.sin(a) * 6, 1.65, Math.cos(a) * 6);
        const toC = bd.clone().sub(eye);
        const off = new THREE.Vector3().crossVectors(toC, new THREE.Vector3(0, 1, 0)).normalize()
            .multiplyScalar((i % 2 === 0 ? 1 : -1) * BR * 0.55);
        const dir = bd.clone().add(off).sub(eye).normalize();
        ray.set(eye, dir);
        const hits = ray.intersectObjects(targets, false);
        const tDist = eye.distanceTo(bd.clone().add(off));
        if (!hits.length || hits[0].distance >= tDist - 0.02) clear6++;
    }
    if (clear6 < 2) throw Error(`bead 6m rim-read fail: only ${clear6}/7 rays clear`);
    console.log(`bead sightline OK: 18m center-ray clear ×5; 6m rim-read ${clear6}/7 clear (bead world y ${target.y.toFixed(3)}, r ${Math.hypot(target.x, target.z).toFixed(3)})`);
}

// ---- envelope + composition assertions ---------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y}`);
    // face bottom edge: lowest face member must ride above 0.40 (near-touch scale)
    const bed = g.children.find(c => (c as any).isMesh && (c as THREE.Mesh).material === bedStone) as THREE.Mesh;
    if (!bed) throw Error("bed mesh not found flat");
    const bw = new THREE.Box3().setFromObject(bed);
    if (bw.min.y < 0.40) throw Error(`face bottom edge ${bw.min.y.toFixed(3)} < 0.40`);
    const expectReach = R_MAX + 1.0;   // bracts reach outward past the rim
    const reach = Math.max(Math.abs(env.max.x), Math.abs(env.min.x), Math.abs(env.max.z), Math.abs(env.min.z));
    if (reach > expectReach + 0.15) throw Error(`x/z reach ${reach.toFixed(3)} > ${expectReach + 0.15}`);
    const foot = sz.x * sz.z;
    if (foot < 8) throw Error(`footprint ${foot.toFixed(1)} < 8`);
    if (sz.y < 2.2) throw Error(`height ${sz.y.toFixed(2)} < 2.2`);
    let nan = 0;
    g.traverse(o => {
        const mesh = o as THREE.Mesh;
        if (!(mesh as any).isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[0..${env.max.y.toFixed(3)}] | R_max ${R_MAX.toFixed(3)} | reach ${reach.toFixed(3)} | face bottom ${bw.min.y.toFixed(3)}`);
}

const merged = mergeByMaterial(g, "sunflowerdial");
writeFileSync("agents/arthur/assets/village_sunflowerdial3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_sunflowerdial3.glb`);
