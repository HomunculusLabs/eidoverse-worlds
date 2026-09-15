// struct184-probe-tribar.ts — STRUCTURES LANE struct-184, R11-14 THE TRIBAR
// Math probe + world-map contract for the impossible-objects family debut.
//
// ONE IDEA: A TRIANGLE THAT CANNOT EXIST — closed by one vantage. Two true
// edges of an exact equilateral triangle stand in the frontoparallel plane;
// the third beam's far end is aimed EXACTLY at the design eye (Q1 on the
// ray E→Q4, t>1, hidden behind the corner cube from E), so from E — and
// only from E — the figure closes into the Penrose tribar. Step off the
// eye line and it opens into the honest open figure: the reveal IS the
// monument. Penrose & Penrose 1958; Escher's Waterfall kin.
//
// v1 (orthographic cube-edge construction, equilateral closure at 1e-16)
// was REJECTED by judgment: orthographic closure parallax-opens ~15px at
// any finite eye (judge: "terminates in mid-air short of the corner — no
// camera position will close this figure"). v2 solves the closure FOR the
// eye: E = (0, 1.65, 18) — EXACTLY the lane's standard 18m gameplay frame
// (camera [0,1.65,18]) and walker eye height. Every 18m audit reads the
// closed triangle; approach from farther = the closing gradient.
//
// WORLD MAP (this file is the ONE contract — mk + decode import it):
//   Q2=(0, 3.2213, 0) apex · Q3=(−1.6, 0.45, 0) · Q4=(+1.6, 0.45, 0) —
//   exact equilateral side 3.2 in plane z=0; beams B (Q2→Q3) and C (Q3→Q4)
//   true in-plane; beam A Q2→Q1 with Q1 = E + t·(Q4−E), t=1.06; corner
//   cubes 0.64 at Q2/Q3/Q4; pad under all; brass bead at the in-plane
//   centroid (0, 1.374, 0) — glow_tb_1 KEEP, sole night element.
//   Final frame: x/z-centered (shifts exported), y≥0, PAD at origin.
//   Folly class, no walk owed.
import * as THREE from "three";

// ---- constants (the one contract) ----------------------------------------------------------------------
export const SIDE = 3.2;                    // equilateral side
export const BEAM_W = 0.42;                 // square beam cross-section
export const CUBE_S = 0.64;                 // corner cube side (occlusion cover, ratio 1.52)
export const BEAD_R = 0.075;                // brass dusk bead (struct-82 lineage)
export const PAD_H = 0.24;                  // plinth runner height
export const T_CLOSE = 1.06;                // Q1 = E + t(Q4−E): tail 1.09m beyond the Q4 cube
export const EYE = new THREE.Vector3(0, 1.65, 18);   // design eye = 18m gameplay frame

// construction-frame points (pre-shift)
const H = SIDE * Math.sqrt(3) / 2;          // 2.7713
export const Y_BASE = 0.45;                 // cube centers: underside 0.17 sinks 0.07 into pad (seated)
export const Q2c = new THREE.Vector3(0, Y_BASE + H, 0);
export const Q3c = new THREE.Vector3(-SIDE / 2, Y_BASE, 0);
export const Q4c = new THREE.Vector3(SIDE / 2, Y_BASE, 0);
export const Q1c = EYE.clone().add(Q4c.clone().sub(EYE).multiplyScalar(T_CLOSE));  // on ray E→Q4 beyond Q4
export const CENc = new THREE.Vector3(0, Y_BASE + H / 3, 0);  // wait: centroid y = (3.2213+0.45+0.45)/3 computed below

// ---- shifts: x/z-center the full member set (pad = bbox + margin) --------------------------------------
const preBox = new THREE.Box3(new THREE.Vector3(Infinity, Infinity, Infinity), new THREE.Vector3(-Infinity, -Infinity, -Infinity));
const grow = (c: THREE.Vector3, sx: number, sy: number, sz: number) => {
    preBox.union(new THREE.Box3(
        new THREE.Vector3(c.x - sx / 2, c.y - sy / 2, c.z - sz / 2),
        new THREE.Vector3(c.x + sx / 2, c.y + sy / 2, c.z + sz / 2)));
};
grow(Q2c, CUBE_S, CUBE_S, CUBE_S); grow(Q3c, CUBE_S, CUBE_S, CUBE_S); grow(Q4c, CUBE_S, CUBE_S, CUBE_S);
grow(new THREE.Vector3(0, (Q2c.y + Q3c.y + Q4c.y) / 3, 0), BEAD_R * 2, BEAD_R * 2, BEAD_R * 2);
// beams as EXACT boxes — literal BoxGeometry built EXACTLY as mk's
// bakeBetween (same quaternion, same translate), boundingBox read back.
// Self-catch history: endpoint±hw AABBs drifted 0.38m; hand corner-math
// drifted 0.37m more — literal geometry is the only drift-proof form.
const beamGrow = (a: THREE.Vector3, b: THREE.Vector3) => {
    const dir = b.clone().sub(a);
    const geo = new THREE.BoxGeometry(BEAM_W, dir.length(), BEAM_W);
    const rot = new THREE.Matrix4().makeRotationFromQuaternion(
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()));
    geo.applyMatrix4(rot);
    geo.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    geo.computeBoundingBox();
    preBox.union(geo.boundingBox!);
};
beamGrow(Q2c, Q1c); beamGrow(Q2c, Q3c); beamGrow(Q3c, Q4c);

export const SHIFT_X = -(preBox.min.x + preBox.max.x) / 2;
export const SHIFT_Z = -(preBox.min.z + preBox.max.z) / 2;
export const SEAT_Y = 0;                    // y already seated by construction (Y_BASE chosen so cubes sink into pad)
export const shift = (p: THREE.Vector3) => new THREE.Vector3(p.x + SHIFT_X, p.y + SEAT_Y, p.z + SHIFT_Z);

// FINAL frame anchors (what mk builds and decode must find)
export const Q1 = shift(Q1c), Q2 = shift(Q2c), Q3 = shift(Q3c), Q4 = shift(Q4c);
export const BEAD_C = shift(new THREE.Vector3(0, (Q2c.y + Q3c.y + Q4c.y) / 3, 0));
export const EYE_F = new THREE.Vector3(EYE.x + SHIFT_X, EYE.y, EYE.z + SHIFT_Z);  // eye shifts with the model
export const PAD_SX = (preBox.max.x - preBox.min.x) + 0.30;
export const PAD_SZ = (preBox.max.z - preBox.min.z) + 0.30;

// envelope (final): members + pad (pad centered at origin footprint)
const ENV = preBox.clone();
ENV.min.x += SHIFT_X; ENV.max.x += SHIFT_X; ENV.min.z += SHIFT_Z; ENV.max.z += SHIFT_Z;
ENV.union(new THREE.Box3(new THREE.Vector3(-PAD_SX / 2, 0, -PAD_SZ / 2), new THREE.Vector3(PAD_SX / 2, PAD_H, PAD_SZ / 2)));
export const ENVELOPE = { min: ENV.min.toArray(), max: ENV.max.toArray() };

// ---- laws ---------------------------------------------------------------------------------------------
let fails = 0;
const check = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name} — ${detail}`);
    if (!ok) fails++;
};

// L1 EQUILATERAL: Q2,Q3,Q4 exact, in plane z=0 (final frame z equal)
{
    const s = [Q2.distanceTo(Q3), Q3.distanceTo(Q4), Q4.distanceTo(Q2)];
    const spread = Math.max(...s) - Math.min(...s);
    const zPlane = Math.max(Math.abs(Q2.z - Q3.z), Math.abs(Q3.z - Q4.z));
    check("L1 equilateral in plane", spread < 1e-12 && Math.abs(s[0] - SIDE) < 1e-12 && zPlane < 1e-12,
        `sides ${s.map(x => x.toFixed(9)).join("/")} (want ${SIDE}), z-plane dev ${zPlane.toExponential(1)}`);
}

// L2 CLOSURE: Q1 exactly on ray E_F→Q4 with t = T_CLOSE (beyond Q4)
{
    const d4 = Q4.clone().sub(EYE_F);
    const d1 = Q1.clone().sub(EYE_F);
    const cross = new THREE.Vector3().crossVectors(d4, d1).length();
    const t = d1.length() / d4.length();
    check("L2 eye-line closure", cross < 1e-12 && Math.abs(t - T_CLOSE) < 1e-12,
        `|d4×d1| ${cross.toExponential(2)}, t ${t.toFixed(12)} (want ${T_CLOSE})`);
}

// L3 OCCLUSION COVER: the Q4 cube's angular radius from E strictly covers beam A's
// end-face half-diagonal at Q1 (the hidden end cannot peek)
{
    const cubeAng = (CUBE_S / 2) / EYE_F.distanceTo(Q4);
    const faceAng = (BEAM_W * Math.SQRT2 / 2) / EYE_F.distanceTo(Q1);
    check("L3 cube occludes beam end (corner-safe)", cubeAng > faceAng * 1.05,
        `cube ${cubeAng.toFixed(5)} vs face-corner ${faceAng.toFixed(5)} rad (margin ${((cubeAng / faceAng - 1) * 100).toFixed(1)}%)`);
}

// L4 JOINTS PHYSICAL: beams B and C END at the cube centers (their end faces tuck
// into the cubes by half a cube — visible joints, no floating ends)
{
    const jB = Q2.distanceTo(Q3), jC = Q3.distanceTo(Q4);
    const bLen = Q2.distanceTo(Q1);
    check("L4 members true-length", Math.abs(jB - SIDE) < 1e-9 && Math.abs(jC - SIDE) < 1e-9 && bLen > SIDE * 0.9 && bLen < SIDE * 1.3,
        `B ${jB.toFixed(4)}, C ${jC.toFixed(4)}, A ${bLen.toFixed(4)} (near-equal family)`);
}

// L5 GROUNDED: base cubes' undersides at/below pad top; bead inside the triangle band
{
    const cubeBottom = Q3.y - CUBE_S / 2, cubeTop = Q2.y + CUBE_S / 2;
    const beadInside = BEAD_C.y > Q3.y && BEAD_C.y < Q2.y && Math.abs(BEAD_C.x - (Q2.x + Q3.x + Q4.x) / 3) < 1e-9;
    check("L5 grounded + bead in-figure", cubeBottom <= PAD_H + 1e-9 && cubeBottom >= PAD_H - 0.15 && beadInside,
        `cube bottom ${cubeBottom.toFixed(3)} vs pad top ${PAD_H} (sinks ${(PAD_H - cubeBottom).toFixed(3)}), bead y ${BEAD_C.y.toFixed(3)} in [${Q3.y.toFixed(2)},${Q2.y.toFixed(2)}]`);
}

// L6 APPROACH GRADIENT: the figure is OPEN at 30m and at 12m (the reveal), gap
// grows with distance from the design eye; all gaps ≤ ~1 beam width (reads closing)
{
    const gapAt = (dist: number) => {
        // checker self-catch: the eye shifts WITH the model in x (SHIFT_X) —
        // first draft pinned e.x=0 and read a false 2.5mm gap at the design eye.
        const e = new THREE.Vector3(EYE_F.x, EYE_F.y, Q4.z + dist);
        const d4 = Q4.clone().sub(e), d1 = Q1.clone().sub(e);
        return new THREE.Vector3().crossVectors(d4, d1).length() / d4.length(); // perpendicular offset at Q4 depth
    };
    const g12 = gapAt(12), g18 = gapAt(18), g30 = gapAt(30);
    check("L6 reveal gradient", g18 < 1e-9 && g12 > 0.005 && g30 > 0.005 && g12 < BEAM_W && g30 < BEAM_W * 1.5,
        `gap@12 ${g12.toFixed(4)}m, @18 ${g18.toExponential(1)}m (closed), @30 ${g30.toFixed(4)}m — opens away from the eye`);
}

// L7 BEAM A CLEAR OF THE BASE CUBE physically (passes behind, no intersection)
{
    // distance from Q4 cube center to beam A's centerline segment Q2→Q1
    const ab = Q1.clone().sub(Q2), aq = Q4.clone().sub(Q2);
    const t = THREE.MathUtils.clamp(aq.dot(ab) / ab.lengthSq(), 0, 1);
    const closest = Q2.clone().add(ab.multiplyScalar(t));
    const clear = closest.distanceTo(Q4) - CUBE_S / 2 - (BEAM_W * Math.SQRT2 / 2);
    check("L7 beam A clears base cube", clear > 0.02,
        `segment clearance ${clear.toFixed(3)}m (>0.02) — passes behind, hidden from E by L3`);
}

// L8 ENVELOPE: y ≥ 0, x/z origin-centered
{
    const offX = Math.abs(ENV.min.x + ENV.max.x), offZ = Math.abs(ENV.min.z + ENV.max.z);
    check("L8 envelope", ENV.min.y >= -0.001 && offX < 0.001 && offZ < 0.001,
        `env ${(ENV.max.x - ENV.min.x).toFixed(3)}x${(ENV.max.y - ENV.min.y).toFixed(3)}x${(ENV.max.z - ENV.min.z).toFixed(3)} y[${ENV.min.y.toFixed(3)},${ENV.max.y.toFixed(3)}] cx/cz off ${offX.toExponential(1)}/${offZ.toExponential(1)}`);
}

// LRED RED CONTROL: a perturbed Q1 (off the eye-line) must fail L2 loudly
{
    const bad = Q1c.clone().add(new THREE.Vector3(0.05, 0, 0));
    const d4 = Q4c.clone().sub(EYE), d1 = bad.clone().sub(EYE);
    const cross = new THREE.Vector3().crossVectors(d4, d1).length();
    check("LRED mutant caught", cross > 1e-3, `mutant |d4×d1| ${cross.toFixed(4)} (>1e-3 ⇒ RED)`);
}

console.log(fails === 0 ? "ALL CHECKS PASS" : `${fails} CHECK(S) FAILED`);
if (fails) process.exit(1);
