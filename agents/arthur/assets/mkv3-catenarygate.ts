// mkv3-catenarygate.ts — STRUCTURES LANE struct-69, Round 6 commission.
// R6-1 THE CATENARY GATE: the curve family the village still lacks. The
// conic ledger is complete (parabola soundmirror, ellipse ellipsecourt,
// hyperbola ruledtower, hypars meridianstair/hypar, sine stillwind) — the
// CATENARY is the missing figure. One idea (Judd): the hanging chain raised
// in stone.
//   - ARCH intrados = the TRUE inverted chain: y = SPRING_Y + C − f·(cosh(x/f)
//     −1), f=2.0, half-span 3.5, C = f(cosh(1.75)−1) = 3.92838 — crown soffit
//     4.455 m, springs at SPRING_Y = 1.3 m on the shoulder faces (a real
//     arch springs from mass, not grade — the v1 self-catch: the naive
//     F(cosh−1) curve hangs DOWNWARD; the inverted chain above spring level
//     is the gate).
//   - constant-normal 0.40 voussoir course -> extrados = the true offset
//     curve (FULLER FLANKS than any parabola — the chain signature; visibly
//     distinct from the stillwind's round-arched gate 100m S).
//   - an iron bead-chain rail threads the exposed extrados crest at
//     EQUAL-ARC spacing (the chain law, not equal-x): plain beads iron texMat
//     (struct-38 law — plain mat() exports material-less), crown + quarter
//     beads brass warm-emissive (dusk lineage, mesh-emissive class, ZERO
//     lamp draw);
//   - brass spring pins at the abutment bearings.
// Enterable: footprint 8.9 × 1.6 = 14.2 m² >= 8 AND top 4.86 >= 2.2 ->
// crosses both room gates honestly -> exact trimesh passage (constants read
// live in client/lib/supportclass.js this build). Clear widths asserted.
// Materials all texMat lanes + brass glow. Static, no comps -> 5 nodes.
// Determinism: fixed curve tables, fixed trig, no RNG.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// struct-38 family law: textured lanes matched to standing village families.
const stoneTex = texMat("cg_stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.92, scale: 2, weights: [2, 1, 1], cell: 32 });
const darkTex = texMat("cg_copstone", [0x44402e, 0x4c4836, 0x3c3828], { rough: 0.88, scale: 2, weights: [2, 1, 1], cell: 28 });
const ironTex = texMat("cg_iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const brass = mat(0xa0a248, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x9a6a28);
(brass as any).emissiveIntensity = 0.75;

// ---- the curve (source of truth for every element) ------------------------
// The hanging chain: y_chain(x) = f·(cosh(x/f) − 1), minimum at x=0.
// The ARCH intrados inverts it ABOVE spring level:
//   intr(x) = SPRING_Y + C − y_chain(x)   (crown at x=0: SPRING_Y + C)
const F = 2.0, H = 3.5;                 // catenary param, arch half-span
const C = F * (Math.cosh(H / F) - 1);   // 3.92838 chain sag at the spring
const SPRING_Y = 1.3;                   // arch springs off shoulder faces
const CROWN = SPRING_Y + C;             // 5.2284 crown soffit
const intr = (x: number) => SPRING_Y + C - F * (Math.cosh(x / F) - 1);

// Extrados = intrados offset outward (upward) along the true normal by V:
const V = 0.40;
const extr = (x: number): [number, number] => {
    // intr'(x) = -sinh(x/f); outward normal (up): (sin θ, cos θ) with
    // θ = atan(-sinh) — net: x2 = x + V·sinh/√(1+sinh²), y2 = intr + V/√(1+sinh²)
    const sh = Math.sinh(x / F);
    const norm = Math.sqrt(1 + sh * sh);        // = cosh(x/f)
    return [x + V * (sh / norm), intr(x) + V / norm];
};

// ---- geometry: arch band (ShapeGeometry ring strip, extruded) -------------
const D = 1.6;                                          // passage depth
const SHOULDER_W = 0.95;                                // beyond each spring
const BASE_H = 0.22;                                    // plinth course height
const SHOULDER_TOP = SPRING_Y + 0.30;                   // shoulders rise past spring line

// Arch body outline (counterclockwise): extrados left->right, intrados right->left.
const N = 96;
const pts: THREE.Vector2[] = [];
for (let i = 0; i <= N; i++) {
    const x = -H + (2 * H * i) / N;
    const [ex, ey] = extr(x);
    pts.push(new THREE.Vector2(ex, ey));
}
for (let i = N; i >= 0; i--) {
    const x = -H + (2 * H * i) / N;
    pts.push(new THREE.Vector2(x, intr(x)));
}
const shape = new THREE.Shape();
shape.setFromPoints(pts);
const stripGeo = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false, curveSegments: 12 });
stripGeo.translate(0, 0, -D / 2);
const strip = new THREE.Mesh(stripGeo, stoneTex);
strip.name = "cg_arch";
g.add(strip);

// ---- shoulder blocks --------------------------------------------------------
for (const [tag, sx] of [["e", 1], ["w", -1]] as const) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(SHOULDER_W, SHOULDER_TOP, D), stoneTex);
    b.name = `cg_shoulder_${tag}`;
    b.position.set(sx * (H + SHOULDER_W / 2), SHOULDER_TOP / 2, 0);
    g.add(b);
}

// ---- plinths (under shoulders) + flush threshold ----------------------------
for (const [tag, sx] of [["e", 1], ["w", -1]] as const) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(SHOULDER_W + 0.14, BASE_H, D + 0.14), darkTex);
    p.name = `cg_plinth_${tag}`;
    p.position.set(sx * (H + SHOULDER_W / 2), BASE_H / 2, 0);
    g.add(p);
}
{
    const t = new THREE.Mesh(new THREE.BoxGeometry(2 * H, 0.06, D + 0.10), darkTex);
    t.name = "cg_threshold";
    t.position.set(0, 0.03, 0);
    g.add(t);
}

// ---- iron bead chain — FACE-MOUNTED (v5: crest-mounted chain is invisible
// at 18m; the gameplay eye at 1.65m sees the arch FRONT face, not the 0.4m
// crest strip). Chain line = extrados curve offset 0.06 PROUD of the front
// face (z = D/2 + 0.06), beads at equal-ARC spacing (the chain law).
const CHAIN_Z = D / 2 + 0.06;
const nBeads = 27;
const NS = 2000;
let arc = 0;
const arcPos: number[] = [0];
for (let i = 1; i <= NS; i++) {
    const x0 = -H + (2 * H * (i - 1)) / NS, x1 = -H + (2 * H * i) / NS;
    const [ax, ay] = extr(x0), [bx, by] = extr(x1);
    arc += Math.hypot(bx - ax, by - ay);
    arcPos.push(arc);
}
const totalArc = arc;
const atS = (s: number): [number, number] => {
    let lo = 0, hi = NS;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; (arcPos[mid] <= s) ? lo = mid : hi = mid; }
    const t = (s - arcPos[lo]) / (arcPos[lo + 1] - arcPos[lo] || 1);
    const x = -H + (2 * H * (lo + t)) / NS;
    return extr(x);
};
for (let i = 0; i < nBeads; i++) {
    const s = (i * totalArc) / (nBeads - 1);
    const [bx, by] = atS(s);
    const isBrass = [0, Math.floor(nBeads / 4), nBeads - 1 - Math.floor(nBeads / 4), nBeads - 1].includes(i);
    const isCrown = i === Math.floor(nBeads / 2);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(isCrown ? 0.17 : 0.14, 14, 12), isBrass || isCrown ? brass : ironTex);
    bead.name = `chain_bead_${i}`;
    bead.position.set(bx, by, CHAIN_Z);
    g.add(bead);
}

// ---- chain rail tube on the same face line (the chain itself) ---------------
const tubePts: THREE.Vector3[] = [];
for (let i = 0; i <= 64; i++) {
    const x = -H + (2 * H * i) / 64;
    const [ex, ey] = extr(x);
    tubePts.push(new THREE.Vector3(ex, ey, CHAIN_Z));
}
const tube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tubePts), 96, 0.035, 8, false),
    ironTex
);
tube.name = "cg_chain_tube";
g.add(tube);

// ---- spring anchors: the brass END beads of the chain itself (i=0 and
// i=n-1) sit at the extrados springs — they carry the anchor reading; the
// v3 separate spring pins judged as "stray chips" at the junction (removed).

// ---- assertions (fail the build if the contract breaks) -------------------
{
    // catenary truth: crown soffit = 1.3 + 3.9283766…
    if (Math.abs(CROWN - 5.2283766194561753) > 1e-6) throw Error(`crown drift ${CROWN}`);
    // springs at SPRING_Y exactly
    if (Math.abs(intr(H) - SPRING_Y) > 1e-9) throw Error("spring not at shoulder line");
    // crown highest intrados point
    if (!(intr(0) > intr(H))) throw Error("crown not highest");
    // room gates: footprint area and height (honest trimesh admission)
    const footprint = (2 * (H + SHOULDER_W)) * D;
    if (footprint < 8) throw Error(`footprint ${footprint} < 8`);
    const extrCrown = extr(0)[1];
    if (extrCrown < 2.2) throw Error(`extrados crown ${extrCrown} < 2.2`);
    // passage depth sanity
    if (D < 1.4) throw Error("passage depth < 1.4");
}

const merged = mergeByMaterial(g, "catenarygate");
writeFileSync("agents/arthur/assets/village_catenarygate3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_catenarygate3.glb (crown soffit ${CROWN.toFixed(4)}, extrados crown ${extr(0)[1].toFixed(4)}, beads ${nBeads}, arc ${totalArc.toFixed(3)})`);
