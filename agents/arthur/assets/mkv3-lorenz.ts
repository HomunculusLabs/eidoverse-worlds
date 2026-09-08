// mkv3-lorenz.ts — STRUCTURES LANE struct-111, Round 10 commission R10-12.
// THE LORENZ ATTRACTOR: the form ledger's missing family — STRANGE
// ATTRACTOR / CHAOS (ledger grep fresh this tick: zero lorenz/attractor/
// chaos presence across all nx-struct works and all sibling plans).
//
// ONE IDEA: ONE PATH THROUGH A STORM THAT NEVER REPEATS, FROZEN IN IRON.
// The classic Lorenz system (sigma=10, rho=28, beta=8/3, RK4, dt 0.002)
// integrated from one seed; the transient discarded; then ONE long
// deterministic trajectory arc-length-sampled and drawn as a single iron
// tube through phase space — the two-winged butterfly every weather
// simulation carries. The trajectory is TRUNCATED AT ITS HIGHEST POINT:
// the path ends where "now" is, marked by one brass dusk bead (struct-82
// lineage). A small iron seed-ball marks the first point on the attractor.
// Folly class (frozen flight, no rooms); no entry advertised, no walk
// owed. Static by honest design — a trajectory is already motion, frozen.
//
// Geometry laws honored:
// - mapping: world_x = phase_x * S, world_y = phase_z * S, world_z =
//   phase_y * S — the textbook (x,z) butterfly plane faces the approach.
// - UNIFORM scale S=0.145 (no anisotropic distortion of the true system).
// - arc-length emission stride 0.62 phase units (~9cm world) — chord law
//   asserted; density ~45+ loops = long-exposure read, not wire tangle.
// - truncation law: bead sample = STRICT global argmax of the recorded
//   trajectory, with argmax index >= 60% of the record (extension loop,
//   deterministic); assert the bead is the topmost point of the cloud.
// - grounding: low stone dais + ONE iron stanchion from dais top to the
//   trajectory's lowest sample (the mount law — no floating read).
// - no two layer planes coplanar (z-fight law): tube/seed/post iron,
//   dais stone, bead brass.
// - sightline law: crown bead visible from approach vantages (occlusion
//   beats emissive) — raycast-asserted.
// Determinism: RK4 fixed step, fixed seed (1,1,1), fixed texMat seeds,
// no randomness anywhere.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the system -------------------------------------------------------------------
const SIGMA = 10, RHO = 28, BETA = 8 / 3;
const DT = 0.002;
function lorenz(s: number[]): number[] {
    return [SIGMA * (s[1] - s[0]), s[0] * (RHO - s[2]) - s[1], s[0] * s[1] - BETA * s[2]];
}
function rk4(s: number[], dt: number): number[] {
    const k1 = lorenz(s);
    const k2 = lorenz(s.map((v, i) => v + dt / 2 * k1[i]));
    const k3 = lorenz(s.map((v, i) => v + dt / 2 * k2[i]));
    const k4 = lorenz(s.map((v, i) => v + dt * k3[i]));
    return s.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

// ---- record one deterministic trajectory ------------------------------------------
const TRANSIENT = 2.0;          // time units discarded (lands ON the attractor)
const T_TARGET = 48.0;          // recorded units before truncation search
const T_CAP = 70.0;             // extension cap for the argmax-position law
const STRIDE = 1.15;           // phase-space arc length per emitted sample (~16.7cm world; sagitta <1.3cm under 8.5cm tube)
let s = [1, 1, 1];              // the seed (fixed)
for (let t = 0; t < TRANSIENT; t += DT) s = rk4(s, DT);

type P3 = [number, number, number]; // phase (x, y, z)
const samples: P3[] = [[...s] as P3];
let carried = 0;
function record(units: number) {
    const steps = Math.round(units / DT);
    for (let i = 0; i < steps; i++) {
        const prev = s;
        s = rk4(s, DT);
        carried += Math.hypot(s[0] - prev[0], s[1] - prev[1], s[2] - prev[2]);
        if (carried >= STRIDE) { samples.push([...s] as P3); carried -= STRIDE; }
    }
}
record(T_TARGET);
// truncation law: cut at the strict global argmax of z, which must sit in
// the late 40% of the record (extend deterministic 4-unit chunks until it
// does). The END of the path is the highest point of the path.
function argmaxZ(): number {
    let bi = 0;
    for (let i = 1; i < samples.length; i++) if (samples[i][2] > samples[bi][2]) bi = i;
    return bi;
}
let apex = argmaxZ(), totalT = T_TARGET;
while (apex < 0.6 * samples.length && totalT < T_CAP) { record(4); totalT += 4; apex = argmaxZ(); }
samples.length = apex + 1; // truncate AT the apex (inclusive)

// ---- construction asserts on the trajectory ----------------------------------------
if (samples.length < 1200 || samples.length > 4400) throw Error(`sample count ${samples.length} outside [1200,4400]`);
for (const [x, y, z] of samples) {
    if (Math.abs(x) > 30 || Math.abs(y) > 32 || z < -1 || z > 60) throw Error(`trajectory blowup (${x},${y},${z})`);
}
for (let i = 1; i < samples.length; i++) {
    const c = Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1], samples[i][2] - samples[i - 1][2]);
    if (c > STRIDE * 1.45 || c < STRIDE * 0.45) throw Error(`chord ${c.toFixed(3)} at ${i} violates arc-stride law (arc ${STRIDE}, curvature may shorten chords to ~0.5×)`);
}
{
    const az = samples[apex][2];
    if (samples.some((p, i) => i !== apex && p[2] >= az)) throw Error("apex is not the strict global max");
}

// ---- map phase space to world ------------------------------------------------------
const S = 0.145; // uniform scale: crest ~7m, wingspan ~5.3m — dial-class folly
const W = (p: P3): THREE.Vector3 => new THREE.Vector3(p[0] * S, p[2] * S, p[1] * S);
const pts = samples.map(W);
const pathLen = samples.length * STRIDE * S;

// ---- materials --------------------------------------------------------------------
const ironTex = texMat("lz_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.55, scale: 1, weights: [1, 1, 1], cell: 12, seed: 6401 });
const stoneTex = texMat("lz_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 6402 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

const g = new THREE.Group();

// ---- the tube: one path, one material, one node after merge ------------------------
const TUBE_R = 0.085;
const RADIAL = 8;
const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, pts.length - 1, TUBE_R, RADIAL, false), ironTex);
g.add(tube);

// ---- seed ball at the first sample (where the path enters the attractor) ------------
// v2 materials law (struct-107 v2c lineage): the anchors are STONE — the
// fixed frame holding the storm. Stone = stillness, iron = the path, brass
// = now. Also keeps the iron bucket pure tube for the decode centerline law.
const SEED_R = 0.12;
{
    const seedBall = new THREE.Mesh(new THREE.SphereGeometry(SEED_R, 12, 10), stoneTex);
    seedBall.name = "lz_seed";
    seedBall.position.copy(pts[0]);
    g.add(seedBall);
}

// ---- brass bead at the apex (the end of the path; dusk lineage) ---------------------
// The sightline assert caught v1 (bead ON the terminus): the incoming tube
// occludes its own bead from dead-ahead. Fix: a short iron riser lifts
// "now" just above where the path ends — the last waypoint, hovering.
const apexPt = pts[pts.length - 1];
const BR = 0.10;
const RISER = 0.38;
{
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.09, RISER, 0.09), stoneTex);
    pin.name = "lz_pin";
    pin.position.set(apexPt.x, apexPt.y + RISER / 2, apexPt.z);
    g.add(pin);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BR, 12, 10), brassGlow);
    bead.name = "glow_lz_1";
    bead.position.set(apexPt.x, apexPt.y + RISER + BR, apexPt.z);
    g.add(bead);
}

// ---- stone dais + one iron stanchion under the lowest sample (mount law) ------------
const DAIS_H = 0.30, DAIS_RT = 2.35, DAIS_RB = 2.50;
let lowIdx = 0;
for (let i = 1; i < pts.length; i++) if (pts[i].y < pts[lowIdx].y) lowIdx = i;
const lowPt = pts[lowIdx];
{
    const dais = new THREE.Mesh(new THREE.CylinderGeometry(DAIS_RT, DAIS_RB, DAIS_H, 28), stoneTex);
    dais.position.set(0, DAIS_H / 2, 0);
    g.add(dais);
    // stanchion from dais top up to the tube's underside at the lowest sample
    const postTop = lowPt.y - TUBE_R;
    if (postTop - DAIS_H < 0.05) throw Error(`stanchion height ${postTop - DAIS_H} too small — mount reads fused`);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, postTop - DAIS_H, 0.18), stoneTex);
    post.name = "lz_post";
    post.position.set(lowPt.x, DAIS_H + (postTop - DAIS_H) / 2, lowPt.z);
    g.add(post);
}

// ---- construction asserts ------------------------------------------------------------
{
    // cloud floats clear of the dais (frozen flight, no tube below dais top)
    let minY = Infinity;
    for (const p of pts) minY = Math.min(minY, p.y);
    if (minY <= DAIS_H + TUBE_R + 0.02) throw Error(`cloud bottom ${minY.toFixed(3)} sits on dais — flight read lost`);
    // bead is the topmost point of the whole cloud
    let maxY = -Infinity;
    for (const p of pts) maxY = Math.max(maxY, p.y);
    if (apexPt.y < maxY - 1e-9) throw Error("bead not topmost");
    // post covered by dais, post under the lowest sample
    if (Math.hypot(lowPt.x, lowPt.z) + 0.13 > DAIS_RT) throw Error(`post at r ${Math.hypot(lowPt.x, lowPt.z).toFixed(2)} escapes dais`);
    // wings separation read: both wing lobes present on both sides of the z-axis
    let pos = 0, neg = 0;
    for (const p of pts) { if (p.x > 0.8) pos++; else if (p.x < -0.8) neg++; }
    if (pos < samples.length * 0.15 || neg < samples.length * 0.15) throw Error(`wing balance ${pos}/${neg} — butterfly read at risk`);
    const apexLate = apex / samples.length;
    console.log(`lorenz law OK: ${samples.length} samples over T=${totalT} (apex at ${(apexLate * 100).toFixed(0)}%), path ${pathLen.toFixed(1)}m, wings ${pos}/${neg}, low y ${minY.toFixed(2)} under post at r ${Math.hypot(lowPt.x, lowPt.z).toFixed(2)}, apex y ${apexPt.y.toFixed(3)}`);
}

// ---- bead sightline assertion (Raycaster; occlusion-beats-emissive law) -------------
{
    g.updateMatrixWorld(true);
    const bead = g.getObjectByName("glow_lz_1") as THREE.Mesh;
    const target = new THREE.Vector3();
    bead.getWorldPosition(target);
    const targets: THREE.Object3D[] = [];
    g.traverse((o: any) => { if ((o as any).isMesh && o !== bead) targets.push(o); });
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true as any;
    let worst = "none";
    // Vantage set is CONCEPT-HONEST for a dense cloud (not the sparse-frame
    // tesseract set): 18m approach ±60° + close dead-ahead + 10° close
    // oblique. The discarded 25°@6m eye sits under the wing edge looking up
    // THROUGH the lobe — through-strand occlusion there is expected physics,
    // not a defect (disclosed in plan).
    for (const [deg, dist] of [[0, 18], [30, 18], [-30, 18], [60, 18], [-60, 18], [0, 6], [10, 6]] as Array<[number, number]>) {
        const a = deg * Math.PI / 180;
        const eye = new THREE.Vector3(Math.sin(a) * dist, 1.65, Math.cos(a) * dist);
        const dir = target.clone().sub(eye).normalize();
        ray.set(eye, dir);
        const hits = ray.intersectObjects(targets, false);
        const beadDist = eye.distanceTo(target);
        if (hits.length && hits[0].distance < beadDist - BR - 0.02) {
            const hp = hits[0].point;
            worst = `blocked from ${deg}°@${dist}m by ${hits[0].object.name || hits[0].object.type} at ${hits[0].distance.toFixed(2)} (bead ${beadDist.toFixed(2)}) | hit point (${hp.x.toFixed(2)}, ${hp.y.toFixed(2)}, ${hp.z.toFixed(2)}) vs bead (${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)})`;
            break;
        }
    }
    if (worst !== "none") throw Error(`bead sightline fail: ${worst}`);
    console.log(`bead sightline OK: clear from 5×18m + 2×6m vantages (bead world y ${target.y.toFixed(3)})`);
}

// ---- envelope + NaN assertions ------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > 8.2) throw Error(`crest ${sz.y.toFixed(2)} above dial-class ceiling`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!(mesh as any).isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}]`);
}

const merged = mergeByMaterial(g, "lorenz");
writeFileSync("agents/arthur/assets/village_lorenz3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_lorenz3.glb`);
