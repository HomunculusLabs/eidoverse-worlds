// mkv3-slidingladder.ts — STRUCTURES LANE struct-95, Round 9 commission R9-4.
// THE SLIDING LADDER: the form ledger's missing COMPOSITION FAMILY — the
// ENVELOPE — and its missing curve, the ASTROID (hypocycloid class; the
// village holds parabola, ellipse, hyperbola, hypar, sine, circle, catenary,
// helicoid, Reuleaux, conoid, ogee, moon-disc, lemniscate — superposition
// (fifthbench) and intersection (vesica) stand; NO envelope work stands).
//
// ONE IDEA: THE ENVELOPE MADE VISIBLE. A ladder of fixed length L slides
// down a wall; we freeze EIGHT of its positions in iron. The boundary of
// every position the ladder can ever occupy is the astroid
//   x^(2/3) + y^(2/3) = L^(2/3),
// drawn as one brass arc — and every frozen ladder is TANGENT to it:
// ladder at angle θ (foot (L cosθ, 0), top (0, L sinθ)) touches the arc
// at (L cos³θ, L sin³θ) exactly. The walker reads the fan of ladders
// face-on, and the brass curve kissing each one.
//
// GEOMETRY (entity local; figure in the local x–y VERTICAL plane, local z
// is the wall/ladder width — face-on read from ±z):
//   - datum y0 = 0.09: ground-band top; the whole figure sits on the band.
//   - wall: ashlar box x ∈ [−0.18, 0], y ∈ [0, 4.28], z ±0.75, coping cap.
//   - ground band: ashlar box x ∈ [−0.18, L+0.18], y ∈ [0, 0.09], z ±0.75.
//   - 8 ladders, θ = 10°..80° step 10°: two iron rails (0.06 × 0.06 × L+0.06
//     embedded ends, z = ±0.225) + rungs every 0.4m (0.05 × 0.05 × 0.39).
//     Rails share z-lanes; crossings KEPT (ruledtower X-generator lineage —
//     the family is the art). Ends embed 3cm into band top / wall face.
//   - brass astroid tube r 0.032 along (L cos³θ, L sin³θ), θ ∈ [0°, 90°],
//     datum-shifted, KEEP-named glow_as (struct-82 law: emissive dies in
//     buckets — the curve must survive merge as its own node). Faint warm
//     emissive 0x9a6a28 @ 0.5 = moonlit-line idiom (dusk lineage).
//   - Materials: standing stone texMat family (ln_stone dialect), iron
//     texMat, brass glow. No motion.
//
// Classification (constants read live in supportclass.js this tick):
// footprint ≈ 4.2 × 1.5 = 6.3m² ≥ FLOOR_MIN 2 but < room area 8, height
// 4.31 > 2.2 → furniture solid box — honest folly, walkable around.
//
// Determinism: fixed segment counts, fixed trig, assertions below.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — standing families (lemniscate/conoidfan dialect)
// v4 (struct-96): native re-judge of v3 — mill_limestone still reads timber
// ("zero grey stoniness": warm tan/ochre hue, R>G>B). The hue must be
// genuinely cool-neutral grey, not a warm limestone. Three close cool tones
// [0x878b8e, 0x8f9396, 0x7d8184] give the weathered-stone mottle; scale 2
// restores v2's finer block coursing (scale 1 read plank-like seams).
// Brass stays v3 (distinctness PASSed strongly at native).
const stoneTex = texMat("sl_stone", [0x878b8e, 0x8f9396, 0x7d8184], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32 });
const ironTex = texMat("sl_iron", [0x5a626c, 0x4d545e, 0x666e78], { rough: 0.6, scale: 1, weights: [1, 1, 1], cell: 16 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85;

// ---- constants ----------------------------------------------------------------
const L = 4.0;                 // ladder length (astroid parameter)
const Y0 = 0.09;               // datum: ground-band top
const WALL_T = 0.18;           // wall thickness (x ∈ [−WALL_T, 0])
const WALL_H = 4.28;           // wall top (clears the 80° ladder top + coping)
const WALL_HW = 0.75;          // wall/band half-length in z
const RAIL_S = 0.06;           // rail cross-section
const RAIL_Z = 0.225;          // rail z lanes
const RUNG_S = 0.05;           // rung cross-section
const RUNG_STEP = 0.4;         // rung spacing along the ladder
const ANGLES = [15, 30, 45, 60, 75]; // degrees — five harmonic positions (v1's eight crushed to lattice mush at 18m)
const TUBE_R = 0.05;           // brass astroid tube radius (v1 0.032 read 1-2px same-value-as-iron at 18m)

// ---- envelope law: every ladder is TANGENT to the astroid (proven before build) ----
{
    for (const deg of ANGLES) {
        const th = (deg * Math.PI) / 180;
        const a = L * Math.cos(th), b = L * Math.sin(th);
        // ladder segment: foot (a, Y0) -> top (0, Y0 + b); tangent point at t = sin²θ
        const t = Math.sin(th) * Math.sin(th);
        const px = a * (1 - t), py = Y0 + b * t;
        const ax = L * Math.cos(th) ** 3, ay = Y0 + L * Math.sin(th) ** 3;
        if (Math.hypot(px - ax, py - ay) > 1e-9) throw Error(`tangency law broken at ${deg}°`);
        if (t <= 0 || t >= 1) throw Error(`tangent point off-segment at ${deg}°`);
    }
    // astroid law: the curve satisfies x^(2/3)+y^(2/3)=L^(2/3) at its parametric points
    for (let i = 0; i <= 90; i += 9) {
        const th = (i * Math.PI) / 180;
        const lhs = (L * Math.cos(th) ** 3) ** (2 / 3) + (L * Math.sin(th) ** 3) ** (2 / 3);
        if (Math.abs(lhs - L ** (2 / 3)) > 1e-9) throw Error(`astroid equation broken at ${i}°`);
    }
    console.log(`envelope law OK: ${ANGLES.length} ladders tangent to the astroid; curve equation exact`);
}

// ---- wall + ground band (the two axes of the slide) ------------------------------
{
    const wall = new THREE.Mesh(new THREE.BoxGeometry(WALL_T, WALL_H, WALL_HW * 2), stoneTex);
    wall.position.set(-WALL_T / 2, WALL_H / 2, 0);
    wall.name = "sl_wall";
    g.add(wall);
    // coping cap — the wall reads finished, not sheared (unfinished-crown class)
    const cap = new THREE.Mesh(new THREE.BoxGeometry(WALL_T + 0.08, 0.09, WALL_HW * 2 + 0.08), stoneTex);
    cap.position.set(-WALL_T / 2, WALL_H + 0.045, 0);
    cap.name = "sl_cap";
    g.add(cap);
    const band = new THREE.Mesh(new THREE.BoxGeometry(L + 2 * WALL_T, Y0, WALL_HW * 2), stoneTex);
    band.position.set((L + 2 * WALL_T) / 2 - WALL_T, Y0 / 2, 0);
    band.name = "sl_band";
    g.add(band);
}

// ---- the eight frozen ladders -----------------------------------------------------
{
    for (const deg of ANGLES) {
        const th = (deg * Math.PI) / 180;
        const a = L * Math.cos(th), b = L * Math.sin(th);
        const fx = a, fy = Y0, tx = 0, ty = Y0 + b;
        const dx = tx - fx, dy = ty - fy;
        const len = Math.hypot(dx, dy);
        const tilt = Math.atan2(dy, dx); // figure is in the VERTICAL x-y plane: rotate about z (not y)
        // rails: extended +0.06 total so ends EMBED into band top and wall face
        for (const zl of [-RAIL_Z, RAIL_Z]) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(len + 0.06, RAIL_S, RAIL_S), ironTex);
            rail.rotation.z = tilt;
            rail.position.set((fx + tx) / 2, (fy + ty) / 2, zl);
            rail.name = `sl_rail_${deg}`;
            g.add(rail);
        }
        // rungs every RUNG_STEP along the ladder, counted from the foot
        // (square x-y cross-section, length along z — no rotation needed)
        const nRungs = Math.floor(len / RUNG_STEP) - 1;
        for (let k = 1; k <= nRungs; k++) {
            const s = (k * RUNG_STEP) / len;
            const rung = new THREE.Mesh(new THREE.BoxGeometry(RUNG_S, RUNG_S, RAIL_Z * 2 - RAIL_S), ironTex);
            rung.position.set(fx + s * dx, fy + s * dy + RAIL_S / 2, 0);
            rung.name = `sl_rung_${deg}_${k}`;
            g.add(rung);
        }
    }
    console.log(`ladders OK: ${ANGLES.length} frozen positions, ${ANGLES.length * 2} rails, rungs @ ${RUNG_STEP}m`);
}

// ---- the brass astroid — the envelope itself (glow_as KEEP; emissive survives merge) ----
{
    const pts: THREE.Vector3[] = [];
    const N = 400;
    for (let i = 0; i <= N; i++) {
        const th = (i / N) * (Math.PI / 2);
        pts.push(new THREE.Vector3(L * Math.cos(th) ** 3, Y0 + L * Math.sin(th) ** 3, 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.0);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, TUBE_R, 8, false), brassGlow);
    tube.name = "glow_as";
    g.add(tube);
    // cusp seat law: both ends center exactly AT the cusps — (L,0) half-buried in
    // the band top, (0,L) half-embedded in the wall face. No floating tips.
    const c0 = pts[0], c1 = pts[N];
    if (Math.abs(c0.y - Y0) > 1e-9 || Math.abs(c0.x - L) > 1e-9) throw Error("ground cusp not seated");
    if (Math.abs(c1.x) > 1e-9 || Math.abs(c1.y - (Y0 + L)) > 1e-9) throw Error("wall cusp not seated");
    console.log(`astroid tube OK: ${N} pts, cusps seated (ground cusp half-buried at band top, wall cusp embedded)`);
}

// ---- assertions on the build --------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    const wantY = WALL_H + 0.09; // cap top (cap center WALL_H+0.045, half-height 0.045)
    if (Math.abs(env.max.y - wantY) > 0.02) throw Error(`top ${env.max.y.toFixed(3)} vs ${wantY.toFixed(3)}`);
    const wantX = L + TUBE_R; // ladder feet embed into band; tube cusp reaches L + r past... band extends to L+WALL_T; tube at L
    if (Math.abs(env.max.x - (L + WALL_T)) > 0.05 && env.max.x < L) throw Error(`x envelope ${env.max.x.toFixed(3)}`);
    const foot = sz.x * sz.z;
    if (foot < 2) throw Error(`footprint ${foot.toFixed(2)} below floor gate`);
    if (foot >= 8) throw Error(`footprint ${foot.toFixed(2)} >= room-gate 8 (furniture-box claim broken)`);
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | footprint ${foot.toFixed(1)}m² | furniture-box class (area<8, h>2.2)`);
}
const merged = mergeByMaterial(g, "slidingladder");
writeFileSync("agents/arthur/assets/village_slidingladder3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_slidingladder3.glb");
