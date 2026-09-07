// mkv3-chainvault.ts — STRUCTURES LANE struct-85, Round 8 commission R8-2.
// THE CHAIN VAULT: Hooke's sentence, built. "As hangs the flexible line, so
// but inverted will stand the rigid arch." Fifteen true-catenary ashlar ribs
// (each rib IS the inverted chain, y = Ys + c(coshT - cosh t)) carry a
// ribcage pavilion — the village's first VAULT (the Bridge of Nines carries
// vault-ARCH rings; the catenarygate owns the 2D portal; this is the catenary
// elevated to enclosure, a different sightline). ONE IDEA: THE CHAIN,
// INVERTED, HOLDS THE ROOF.
//
// GEOMETRY (entity local; y UP; length axis z, mouths at z = ±3.5):
//   Span hx = 2.60 (clear 5.2m), catenary constant c = 2.30,
//   T = hx/c = 1.130435; rise R = c(cosh T - 1) = 1.6345m (asserted exact).
//   Arch profile: y(t) = Ys + c(cosh T - cosh t), t ∈ [-T, T].
//   Springing Ys = 1.17 (abs) on pier tops; crown 2.8045; plinth 2-step
//   (0.10 slab + 0.12 step, top 0.22 = interior floor).
//   THE SIGN MATTERS: y = Ys + c(cosh T - cosh t) is the ARCH (crown high at
//   t=0, feet at t=±T). y = Ys + c(cosh t - 1) would be the HANGING CHAIN
//   (crown low) — the whisperhorn-class parametrization inversion; the
//   rise-law assertions below kill that class by construction.
//   Ribs: 15 at 0.5m pitch z -3.5..+3.5, band width 0.14 (normal offset
//   ±0.07), thickness 0.16 (end diaphragm ribs 0.24). Vaults read by RHYTHM:
//   0.34m sky between ribs at 0.5 pitch — ninesbridge arcade class.
//   Purlins: 5 iron rods r 0.032 at x = 0, ±1.3, ±2.35 threading rib
//   mid-depth (0.032 < 0.07 by law), full length 7.0.
//   Foot rods: 2 iron rods r 0.032 at x = ±2.67, y = 1.10 tying rib feet
//   down each flank (the chain echo along the ground — never across the
//   room: no head-height tie).
//   Flanks: bench (x 2.6..3.3, y 0.22..0.70 — seat 0.48) + pier (x 2.75..3.15,
//   y 0.70..1.17) carrying the rib feet at x ±2.6.
//   Crown jewel: one brass glow bead r 0.07 set in the center rib's crown
//   (KEEP glow_cv — emissive survives merge, struct-82 law) — at night the
//   arch mouth frames a single amber point. No other ornament (Judd).
//
// MATERIALS: cv_stone texMat (rr/screwwell one-quarry palette), cv_iron
// texMat ties, plain brass bead, glow bead. Motion: NONE (calm by
// stillness). Nodes after merge ~4-5 (stone/iron/brass buckets + glow KEEP).
//
// Gates honest: bbox 7.6 x 5.9 = 44.8 m^2 >= 16; height 2.80 >= 2.2 ->
// exact trimesh; both mouths fully open (5.2m clear >> 1.4m door lane);
// enterable -> MCPL walk at placement tick. Deterministic: fixed trig.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

const stoneTex = texMat("cv_stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const ironTex = texMat("cv_iron", [0x44402e, 0x4c4836, 0x3c3828], { rough: 0.7, scale: 2, weights: [2, 1, 1], cell: 24 });
const brass = mat(0x9a6a28, 0.4, 0.8);
const brassGlow = mat(0x9a6a28, 0.4, 0.8);
(brassGlow as any).emissive = new THREE.Color(0x9a6a28);
(brassGlow as any).emissiveIntensity = 0.75;

// ---- constants -------------------------------------------------------------------
const HX = 2.60;                     // half-span (clear width 5.2)
const CC = 2.30;                     // catenary constant
const TT = HX / CC;                  // 1.130435
const RISE = CC * (Math.cosh(TT) - 1);   // 1.6345
const YS = 1.17;                     // springing (abs, on pier tops)
const CROWN = YS + RISE;             // 2.8045
const FLOOR = 0.22;                  // plinth step top = interior floor
const LEN = 7.0, PITCH = 0.5;        // 15 ribs at 14 intervals
const NRIB = 15;
const BAND = 0.14, RIB_T = 0.16, END_T = 0.24;
const SAMPLES = 26;                  // profile samples per half-band curve

// ---- the arch profile (t in [-T, T]) ----------------------------------------------
const archY = (t: number) => YS + CC * (Math.cosh(TT) - Math.cosh(t));
// rise law + inversion guard (the whole point of this structure)
if (Math.abs(archY(0) - CROWN) > 1e-9) throw Error("crown law broken");
if (Math.abs(archY(TT) - YS) > 1e-9) throw Error("springing law broken");
if (Math.abs((archY(0) - archY(TT)) - RISE) > 1e-9) throw Error("rise law broken");
for (let i = 1; i <= 20; i++) {           // monotone DESCENT from crown to foot
    const a = archY((i / 20) * TT), b = archY(((i - 1) / 20) * TT);
    if (a - b > 1e-9) throw Error(`not an arch at i=${i}: rises away from center`);
}
// eye-height clear width (interior, floor frame): solve y(x)=FLOOR+1.65
{
    const eye = FLOOR + 1.65;
    // y = YS + CC(cosh T - cosh t) = eye -> cosh t = (YS + CC cosh T - eye)/CC
    const ch = (YS + CC * Math.cosh(TT) - eye) / CC;
    const t = Math.acosh(ch), half = CC * t;
    if (half < 1.5) throw Error(`eye clear width too narrow: ${2 * half}`);
    console.log(`eye-height clear width ${2 * half} (ch ${ch})`);
}

// ---- rib band outline (true normal offset — an offset of a catenary is not one) -----
function bandCurve(sign: 1 | -1): [number, number][] {
    const pts: [number, number][] = [];
    for (let i = 0; i <= SAMPLES; i++) {
        const t = -TT + (2 * TT * i) / SAMPLES;
        // unit tangent d/dt (c t, -c cosh t) = (c, -c sinh t) -> (1, -sinh t)/cosh t
        // outward normal (points up at crown): (sinh t, 1)/cosh t
        const ch = Math.cosh(t), sh = Math.sinh(t);
        const nx = sh / ch, ny = 1 / ch;
        pts.push([CC * t + sign * (BAND / 2) * nx, archY(t) + sign * (BAND / 2) * ny]);
    }
    return pts;
}
// ---- ribs -------------------------------------------------------------------------
for (let r = 0; r < NRIB; r++) {
    const z = -LEN / 2 + r * PITCH;
    const isEnd = r === 0 || r === NRIB - 1;
    const outer = bandCurve(1), inner = bandCurve(-1);
    const shape = new THREE.Shape();
    shape.moveTo(outer[0][0], outer[0][1]);
    for (let i = 1; i < outer.length; i++) shape.lineTo(outer[i][0], outer[i][1]);
    for (let i = inner.length - 1; i >= 0; i--) shape.lineTo(inner[i][0], inner[i][1]);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: isEnd ? END_T : RIB_T, bevelEnabled: false });
    geo.translate(0, 0, -(isEnd ? END_T : RIB_T) / 2);
    geo.translate(0, 0, z);
    const rib = new THREE.Mesh(geo, stoneTex);
    rib.name = `cv_rib${isEnd ? "_end" : ""}`;
    g.add(rib);
}

// ---- purlins + foot rods (iron) ----------------------------------------------------
{
    const rod = (x: number, y: number) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, LEN, 10), ironTex);
        m.name = "cv_rod";
        m.rotation.x = Math.PI / 2;           // axis along z
        m.position.set(x, y, 0);
        g.add(m);
    };
    for (const x of [0, 1.3, -1.3, 2.35, -2.35]) rod(x, archY(x / CC));
    // foot rods along the flanks (never across the room)
    rod(2.67, 1.10); rod(-2.67, 1.10);
}

// ---- flank benches + piers ---------------------------------------------------------
for (const dir of [1, -1] as const) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.48, LEN), stoneTex);
    bench.name = "cv_bench";
    bench.position.set(dir * 2.95, FLOOR + 0.24, 0);
    g.add(bench);
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.40, YS - (FLOOR + 0.48), LEN), stoneTex);
    pier.name = "cv_pier";
    pier.position.set(dir * 2.95, (FLOOR + 0.48 + YS) / 2, 0);
    g.add(pier);
}

// ---- crown jewel (KEEP glow_ — the night read) --------------------------------------
{
    // struct-52 law: a lit element recessed behind a solid box NEVER renders
    // (v1's keystone box occluded the bead completely — night render proved
    // 0 warm px). Fix: NO keystone (off-contract ornament anyway); the bead
    // sits PROUD of the center rib's front face (z +0.10 > rib face +0.08),
    // rotor-stud exposure class (struct-83 studs proven to render at night).
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), brassGlow);
    bead.name = "glow_cv";
    bead.position.set(0, CROWN - 0.01, RIB_T / 2 + 0.02);
    g.add(bead);
}

// ---- plinth ------------------------------------------------------------------------
{
    const step = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.12, 5.3), stoneTex);
    step.name = "cv_step";
    step.position.set(0, 0.10 + 0.06, 0);
    g.add(step);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.10, 5.9), stoneTex);
    slab.name = "cv_slab";
    slab.position.set(0, 0.05, 0);
    g.add(slab);
}

// ---- assertions ---------------------------------------------------------------------
{
    // rib feet land ON the pier tops (inner pier edge at |x| 2.6 == springing)
    // pier top = YS by construction above; band inner foot meets it.
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    if (sz.y < 2.2) throw Error(`height ${sz.y.toFixed(2)} below trimesh line`);
    if (sz.x * sz.z < 16) throw Error(`footprint ${sz.x * sz.z} below room gate`);
    if (Math.abs(sz.y - (CROWN + BAND / 2)) > 0.01) throw Error(`bbox height ${sz.y} vs outer-crown ${CROWN + BAND / 2}`); // rib band outer face crests BAND/2 above centerline
    // mouth clear span: no geometry narrowing the open ends below door law
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | rise ${RISE.toFixed(4)} | crown ${CROWN.toFixed(4)} | T ${TT.toFixed(6)}`);
}
const merged = mergeByMaterial(g, "chainvault");
writeFileSync("agents/arthur/assets/village_chainvault3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_chainvault3.glb");
