// mkv3-whisperhorn.ts — STRUCTURES LANE struct-82, Round 7 commission R7-2.
// THE WHISPER HORN: the pseudosphere (Beltrami's trumpet) — the surface of
// constant negative curvature, the curvature class the village lacks
// (domes/orbs positive, drums/towers zero). One idea: A TRUMPET OF STONE.
// The acoustic family's second member: the dish listens, the horn answers.
//
// GEOMETRY (entity local, yaw 0; axis vertical at origin; y UP):
//   tractrix param t (0 at rim, growing toward throat):
//     r(t) = R_LIP / cosh(t)      y(t) = R_LIP * (t - tanh(t))
//   R_LIP = 1.50. The bell is INVERTED from raw param: rim (t=0, widest)
//   sits at TOP, throat (t=T_END) at BOTTOM planted in the drum.
//   World y of a profile point = H_RIM - y(t): rim at H_RIM (top), throat
//   at H_RIM - Y_BELL (drum top). T_END = 2.55 → throat r 0.561,
//   Y_BELL = 2.344. H_RIM = 2.70 → throat bottom at y 0.356 ≈ dais top.
//   The exact constant-curvature surface is the bell section; the drum is
//   structure, not surface (a full infinite tail is neither legible nor
//   buildable — the cuspidal lip flare carries the identity).
//
//   Shell: 26 courses × 24 segments of oriented boxes following the exact
//   surface (chord + 0.025 tangential overlap kills seams — shelltower/
//   mobius lesson), each tilted by the local profile tangent so the outer
//   face follows r(t) exactly. wall thickness 0.09 radial.
//   Lip: brass torus at the rim (KEEP name wh_glow — emissive survives
//   merge; catenary/moongate amber 0x9a6a28 @ 0.75, struct-81 tips idiom).
//   Drum: stone cylinder r ~0.58 from dais top to throat + flared skirt.
//   Dais: TWO-STEP plinth (moongate class): step2 r 1.65 h 0.16 (y
//   0.10..0.26), step1 r 1.95 h 0.14 (y 0.26..0.40), base slab r 2.05 h
//   0.06 at grade. Dais top 0.40; drum spans 0.40..0.356+... — drum runs
//   0.30..H_RIM-Y_BELL+0.05 = 0.30..0.406 (slight embed, flush).
//   Folly: solid drum, nothing enterable, no door lane.
//
// MATERIALS: wh_stone texMat lane (screwwell stone family — one quarry).
// Night read: profile + one quiet brass circle at the rim. No motion, no
// comps (brass is material, not comp; SLOW/CALM by stillness).
//
// Room gates honest: dais footprint π*1.95² ≈ 11.9m² ≥ 8; height ≈ 2.76
// ≥ 2.2 → exact trimesh; steps walkable; circuit MCPL walk (folly).
// Deterministic: fixed trig, no RNG. mergeByMaterial folds courses into
// the stone bucket; wh_glow lip survives as KEEP anchor (no comp targets
// it — but its emissive material must survive merge, hence KEEP name).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

const stoneTex = texMat("wh_stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const brass = mat(0x9a6a28, 0.4, 0.8);
(brass as any).emissive = new THREE.Color(0x9a6a28);
(brass as any).emissiveIntensity = 0.75;
const boreDark = mat(0x14120e, 1.0, 0.0);

const R_LIP = 1.50, T_END = 2.55, H_RIM = 2.70;
const rOf = (t: number) => R_LIP / Math.cosh(t);
const yOf = (t: number) => R_LIP * (t - Math.tanh(t));
const R_THR = rOf(T_END);   // ≈ 0.5613
const Y_BELL = yOf(T_END);  // ≈ 2.3435
const DAIS_TOP = 0.40;

// ---- bell shell (oriented boxes on the exact surface) --------------------------
// world y of profile t: wY(t) = H_RIM - yOf(t)  (rim top, throat bottom)
// Equal-ARC courses (tractrix property ds = r dt; total arc ≈ 2.126m) —
// the raw-t parametrization would give mm-courses at the rim flare and
// coarse ones at the throat. March t(s) by arc.
const COURSES = 26, SEGS = 24;
const wY = (t: number) => H_RIM - yOf(t);
const ts: number[] = [0];
{
    // tractrix arc: ds = r dt = R_LIP sech(t) dt → ∫ = R_LIP·atan(sinh t)
    // (v1 bug: thresholds used R_LIP·ln(cosh) = 2.787 > true arc 2.119, so
    // tail thresholds never fired and duplicate T_ENDs piled up — caught by
    // the ladder assertion, now a hard error instead of a silent fill.)
    const N = 4000;
    const A_TOTAL = R_LIP * Math.atan(Math.sinh(T_END));
    let acc = 0, ti = 0;
    const nextAt = (k: number) => (k * A_TOTAL) / COURSES;
    for (let i = 1; i <= N; i++) {
        const t = (i / N) * T_END;
        acc += ((rOf(t - T_END / N) + rOf(t)) * 0.5) * (T_END / N); // ds = r dt
        while (ti < COURSES && acc >= nextAt(ti + 1)) {
            ts.push(t); ti++;
        }
    }
    // The final threshold k=COURSES coincides with total arc; the discrete
    // march lands a hair short (acc 2.1224 vs 2.1224 at fp). Close out with
    // the exact terminal value — the march itself must have reached COURSES-1.
    if (ts.length !== COURSES) throw Error(`arc march filled only ${ts.length}/${COURSES}`);
    ts.push(T_END);
}
for (let i = 0; i < COURSES; i++) {
    const t0 = ts[i], t1 = ts[i + 1];
    const r0 = rOf(t0), r1 = rOf(t1);
    const y0 = wY(t0), y1 = wY(t1); // y0 > y1 (course i=0 is at the top/rim)
    // course slant from vertical: profile rises outward toward rim
    const slope = Math.atan2(r0 - r1, y0 - y1); // >0
    const rM = (r0 + r1) / 2;
    const h = Math.hypot(r0 - r1, y0 - y1) + 0.03;
    for (let k = 0; k < SEGS; k++) {
        const azM = ((k + 0.5) / SEGS) * 2 * Math.PI;
        const chord = 2 * rM * Math.sin(Math.PI / SEGS) + 0.025;
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.09, h, chord), stoneTex);
        wall.name = "wh_shell";
        wall.rotation.y = -azM;   // cylinder orientation: local z tangential
        wall.rotateZ(-slope);     // tilt in the radial-vertical plane — top leans out
        wall.position.set(rM * Math.cos(azM), (y0 + y1) / 2, rM * Math.sin(azM));
        g.add(wall);
    }
}

// ---- brass lip (KEEP anchor — emissive survives merge; regex is ^-anchored,
// so the name must START with a KEEP token: glow_*) ------------------------------
{
    const lip = new THREE.Mesh(new THREE.TorusGeometry(R_LIP, 0.055, 8, 44), brass);
    lip.name = "glow_whlip";                 // KEEP: /^(...|glow|...)/
    lip.rotation.x = Math.PI / 2;
    lip.position.y = H_RIM;
    g.add(lip);
}

// ---- drum + skirt ---------------------------------------------------------------
{
    const drumTop = H_RIM - Y_BELL;          // ≈ 0.3565
    const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(R_THR + 0.02, R_THR + 0.06, drumTop - 0.30 + 0.10, 28),
        stoneTex,
    );
    drum.name = "wh_drum";
    drum.position.y = (0.30 + drumTop + 0.10) / 2;
    g.add(drum);
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(R_THR + 0.22, R_THR + 0.30, 0.14, 28), stoneTex);
    skirt.name = "wh_skirt";
    skirt.position.y = DAIS_TOP + 0.07;
    g.add(skirt);
}

// ---- dais (two-step plinth + base slab) ----------------------------------------
{
    const slab = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 0.06, 40), stoneTex);
    slab.name = "wh_slab";
    slab.position.y = 0.03;
    g.add(slab);
    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.16, 40), stoneTex);
    step2.name = "wh_step2";
    step2.position.y = 0.10 + 0.08;
    g.add(step2);
    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 0.14, 40), stoneTex);
    step1.name = "wh_step1";
    step1.position.y = 0.26 + 0.07;
    g.add(step1);
}

// ---- bore shadow (v3: reads as open mouth from above/slope vantages;
// hidden from level sightlines by the near wall — physically honest) ---------
{
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.38, 0.02, 40), boreDark);
    bore.name = "wh_bore";
    bore.position.y = H_RIM - 0.10;
    g.add(bore);
}

// ---- assertions ------------------------------------------------------------------
{
    // radius strictly decreasing bell-UP (i from throat side: monotonic)
    for (let i = 1; i <= COURSES; i++) {
        const tA = (T_END * (i - 1)) / COURSES, tB = (T_END * i) / COURSES;
        // going DOWN from rim (t 0→T_END), r must strictly decrease
        if (rOf(tB) >= rOf(tA)) throw Error(`bulge at course ${i}`);
    }
    // COURSE-LADDER CONTINUITY (v1 bug: loop bound `ti < T_END` compared an
    // index to a t-value — 23/26 courses piled at the drum and only the top 3
    // stood at the rim; the render read "open lattice". Assert the ladder):
    // course mid-y strictly decreasing and the full bell span covered.
    for (let i = 0; i < COURSES; i++) {
        const ym = (wY(ts[i]) + wY(ts[i + 1])) / 2;
        const ymNext = i + 1 < COURSES ? (wY(ts[i + 1]) + wY(ts[i + 2])) / 2 : -Infinity;
        if (!(ym > ymNext)) throw Error(`course ladder not monotonic at ${i}: ${ym.toFixed(3)} <= ${ymNext.toFixed(3)}`);
        if (ts[i] >= ts[i + 1]) throw Error(`ladder t not increasing at ${i}`);
    }
    const spanTop = wY(ts[0]), spanBot = wY(ts[COURSES]);
    if (spanTop - spanBot < Y_BELL * 0.9) throw Error(`bell span ${spanTop - spanBot} < 90% of Y_BELL ${Y_BELL}`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.02) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    if (sz.y < 2.2) throw Error(`height ${sz.y.toFixed(2)}`);
    if (sz.x * sz.z < 8) throw Error(`footprint ${sz.x * sz.z}`);
    // rim ring sits at the top of the envelope
    if (Math.abs(sz.y - H_RIM - 0.055) > 0.05) throw Error(`rim not crown ${sz.y.toFixed(3)}`);
    console.log(
        `assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | rim r ${R_LIP} @ y ${H_RIM} | throat r ${R_THR.toFixed(4)} | Y_BELL ${Y_BELL.toFixed(4)}`,
    );
}
const merged = mergeByMaterial(g, "whisperhorn");
writeFileSync("agents/arthur/assets/village_whisperhorn3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_whisperhorn3.glb");
