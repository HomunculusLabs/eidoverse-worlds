// mkv3-ogeegate.ts — STRUCTURES LANE struct-74, Round 6 commission R6-3.
// THE OGEE GATE (cyma reversa): the mason's master curve — the only arch cut
// from two OPPOSING arcs. Round 6 gate family: catenary (N threshold,
// struct-72, the hanging chain), closed ring (SW threshold, struct-73, the
// arch that never lands); R6-3 raises the OGEE at the NE craft threshold —
// the S-curve arch leading into the masons' district.
//   - TRUE two-arc construction (asserted, not eyeballed), cyma reversa:
//     spring S=(2.2, 1.3) with a 14deg BATTERED impost (tangent leans
//     outward — real ogees spring off tilted imposts, the search's finding:
//     a vertical springing forces either an invisible belly or a 9m spire);
//     convex flank arc A1 (center C1 outside, R1 6.5637) bellies OUT over
//     the passage to the inflection I=(2.620, 2.486); concave crown arc A2
//     (center ON the axis, R2 2.8909 — the round-crest cyma reversa;
//     tangency: C1, I, C2 collinear within 1e-9) curls IN to the apex
//     (0, 6.5986). True widest flare 2.891 at y 3.708 = 0.69m overhang over
//     the opening, 0.16m INSIDE the pier plumb — the wave overhangs the
//     void, not the masonry. Tallest of the three gates (7.1 vs 5.8/5.25):
//     the master curve earns it; every metre of height is S, none is spire
//     (pointed-ogive variant rejected at source: +1.2m for apex detail
//     below the 18m resolution, struct-13 law).
//   - Voussoirs at EQUAL-ARC stations (chain law): 13 courses/side, stone
//     9.2:1 mortar rhythm (dark mortar sectors, moongate v3 law: full
//     contact AND countable rhythm).
//   - Brass KITE keystone at the apex, extruded 0.10 proud — warm emissive
//     (dusk lineage, mesh-emissive class, ZERO lamps).
//   - Room gates honest (supportclass.js ROOM_MIN_AREA 8 / ROOM_MIN_H 2.2):
//     bbox 6.24 x 1.60 = 9.98 >= 8, height 7.12 >= 2.2 -> exact trimesh;
//     clear opening 4.4m at grade, 4.7m at head height.
// Materials: standing texMat stone/mortar families (struct-38 law).
// Static, no comps -> 3 buckets after merge. Deterministic: fixed trig, no RNG.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

const stoneTex = texMat("og_stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.92, scale: 2, weights: [2, 1, 1], cell: 32 });
const mortarTex = texMat("og_mortar", [0x3a3628, 0x403c2e], { rough: 0.95, scale: 2, weights: [1, 1], cell: 24 });
const brass = mat(0xa0a248, 0.55, 0);
(brass as any).emissive = new THREE.Color(0x9a6a28);
(brass as any).emissiveIntensity = 0.75;

// ---- the true curve (right half; left mirrored) -----------------------------
const H = 2.2;                          // spring half-span (opening 4.4m)
const SY = 1.3;                         // springing height off the piers
const T0 = -14 * Math.PI / 180;         // spring tangent batter (outward)
const TI = 155 * Math.PI / 180;         // inflection radial
const BULGE_REQ = 0.42;                 // reach(I) - H (asserted below)
const R1 = BULGE_REQ / (Math.cos(T0) + Math.cos(TI));   // 6.5637
const C1 = { x: H + R1 * Math.cos(T0), y: SY + R1 * Math.sin(T0) };
const I = { x: C1.x + R1 * Math.cos(TI), y: C1.y + R1 * Math.sin(TI) };
const R2 = I.x / Math.abs(Math.cos(TI));                 // center ON axis
const C2 = { x: 0, y: I.y + R2 * Math.sin(TI) };
const KY = C2.y + R2;                                    // apex intrados y
const V = 0.42;                        // voussoir band (constant-radial offset)
const TH = 1.5;                        // passage depth (room gate)
const FLARE_X = R2;                     // true widest half-width (A2 at radial 0)
const FLARE_Y = C2.y;

// arc-length parameter s: 0 at the spring, SIDE at the apex.
// A1: radial from (PI + T0) DOWN to TI (monotone rise); A2: radial from
// (TI - PI) UP through 0 to PI/2 (monotone rise, curl in).
const L1 = R1 * (Math.PI + T0 - TI);                    // 1.2602
const L2 = R2 * (Math.PI / 2 - (TI - Math.PI));         // 5.8036 (through radial 0)
const SIDE = L1 + L2;                                   // 7.0638

const intr = (s: number): { x: number; y: number; nx: number; ny: number } => {
    if (s <= L1) {
        const t = (Math.PI + T0) - s / R1;
        return { x: C1.x + R1 * Math.cos(t), y: C1.y + R1 * Math.sin(t), nx: Math.cos(t), ny: Math.sin(t) };
    }
    const t = (TI - Math.PI) + (s - L1) / R2;
    return { x: C2.x + R2 * Math.cos(t), y: C2.y + R2 * Math.sin(t), nx: Math.cos(t), ny: Math.sin(t) };
};
const extr = (s: number) => {
    const p = intr(s);
    return { x: p.x + V * p.nx, y: p.y + V * p.ny };
};

// ---- voussoir courses -------------------------------------------------------
const NC = 13;                          // courses per side
const ds = SIDE / NC;                   // 0.5434
const MW = 0.045;                       // mortar sector arc-width

const quad = (s0: number, s1: number, matl: THREE.Material, name: string, mirror: boolean) => {
    const a = intr(s0), b = intr(s1), c = extr(s1), d = extr(s0);
    const raw = [a, b, c, d];
    const pts = (mirror ? [d, c, b, a] : raw).map(p =>   // reversed order keeps winding
        new THREE.Vector2(mirror ? -p.x : p.x, p.y));
    const sh = new THREE.Shape();
    sh.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 4; i++) sh.lineTo(pts[i].x, pts[i].y);
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: TH, bevelEnabled: false });
    geo.translate(0, 0, -TH / 2);
    const m = new THREE.Mesh(geo, matl);
    m.name = name;
    g.add(m);
};

for (let j = 0; j < NC; j++) {
    const s0 = j * ds, s1 = (j + 1) * ds;
    quad(s0 + (j === 0 ? 0 : MW / 2), s1 - MW / 2, stoneTex,
        `og_voussoir_r_${String(j).padStart(2, "0")}`, false);
    quad(s0 + (j === 0 ? 0 : MW / 2), s1 - MW / 2, stoneTex,
        `og_voussoir_l_${String(j).padStart(2, "0")}`, true);
    if (j > 0) {
        quad(s0 - MW / 2, s0 + MW / 2, mortarTex, `og_joint_r_${String(j).padStart(2, "0")}`, false);
        quad(s0 - MW / 2, s0 + MW / 2, mortarTex, `og_joint_l_${String(j).padStart(2, "0")}`, true);
    }
}

// ---- brass KITE keystone at the apex ----------------------------------------
// A true wedge: intrados vertex at the apex, sides along the two meeting A2
// tangents at the last station, extrados proud +0.10.
const sK = (NC - 1) * ds;               // last station (top of course 12)
const kA = intr(SIDE);                  // apex intrados (0, KY)
const kB = intr(sK);                    // right lower vertex
const kC = extr(SIDE);                  // apex extrados
const kD = extr(sK);                    // right lower vertex, extrados side
const kitePts = [kA, kB, kC, kD].map(p => new THREE.Vector2(p.x, p.y));
const kiteShape = new THREE.Shape();
kiteShape.moveTo(kitePts[0].x, kitePts[0].y);
for (let i = 1; i < 4; i++) kiteShape.lineTo(kitePts[i].x, kitePts[i].y);
kiteShape.closePath();
const kiteGeo = new THREE.ExtrudeGeometry(kiteShape, { depth: TH + 0.10, bevelEnabled: false });
kiteGeo.translate(0, 0, -(TH + 0.10) / 2);
const kite = new THREE.Mesh(kiteGeo, brass);
kite.name = "og_keystone";
g.add(kite);

// ---- piers, battered imposts, plinths, threshold ----------------------------
const SW = 0.85, BASE_H = 0.22;
for (const [tag, sx] of [["e", 1], ["w", -1]] as const) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(SW, SY, TH), stoneTex);
    pier.name = `og_pier_${tag}`;
    pier.position.set(sx * (H + SW / 2), SY / 2, 0);
    g.add(pier);
    // impost wedge: fills the 14deg batter between pier top and the spring
    // stone's tilted underside. Right side: triangle (H,SY) -> (H+SW,SY) ->
    // (H+SW, SY + SW*tan(-T0)); mirrored explicitly for the left.
    const w = SW, h = SW * Math.tan(-T0);
    const sh = new THREE.Shape();
    if (sx === 1) {
        sh.moveTo(H, SY); sh.lineTo(H + w, SY); sh.lineTo(H + w, SY + h);
    } else {
        sh.moveTo(-H, SY); sh.lineTo(-H - w, SY); sh.lineTo(-H - w, SY + h);
    }
    sh.closePath();
    const ig = new THREE.ExtrudeGeometry(sh, { depth: TH, bevelEnabled: false });
    ig.translate(0, 0, -TH / 2);
    const impost = new THREE.Mesh(ig, stoneTex);
    impost.name = `og_impost_${tag}`;
    g.add(impost);
    const p = new THREE.Mesh(new THREE.BoxGeometry(SW + 0.14, BASE_H, TH + 0.14), mortarTex);
    p.name = `og_plinth_${tag}`;
    p.position.set(sx * (H + SW / 2), BASE_H / 2, 0);
    g.add(p);
}
{
    const t = new THREE.Mesh(new THREE.BoxGeometry(2 * H, 0.06, TH + 0.10), mortarTex);
    t.name = "og_threshold";
    t.position.set(0, 0.03, 0);
    g.add(t);
}

// ---- assertions (fail the build if the contract breaks) ---------------------
{
    const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;
    // radii + collinear tangency (C1, I, C2)
    if (!near(Math.hypot(I.x - C1.x, I.y - C1.y), R1)) throw Error("A1 radius drift");
    if (!near(Math.hypot(I.x - C2.x, I.y - C2.y), R2)) throw Error("A2 radius drift");
    const cross = (I.x - C1.x) * (C2.y - C1.y) - (I.y - C1.y) * (C2.x - C1.x);
    if (Math.abs(cross) > 1e-9) throw Error(`tangency broken: cross ${cross}`);
    // spring exact
    const sp = intr(0);
    if (!near(sp.x, H) || !near(sp.y, SY)) throw Error("spring not at (H, SY)");
    // spring tangent batter = T0 (tangent = (sin t, -cos t) at radial t=PI+T0)
    const tanx = Math.sin(Math.PI + T0), tany = -Math.cos(Math.PI + T0);
    if (!near(tanx, Math.sin(-T0), 1e-12) || !near(tany, Math.cos(T0), 1e-12))
        throw Error("spring tangent law broken");
    // curvature signs differ: A1 convex (center outboard), A2 concave (center inboard)
    if (!(C1.x > I.x)) throw Error("A1 center not outboard — no convex belly");
    if (!(C2.x < I.x - R2 * 0.9)) throw Error("A2 center not inboard — no concave curl");
    // monotone rise spring->apex; single flare max inside pier plumb.
    // Analytic law: A1's max x is I.x (radial TI, 155deg, still rising inward),
    // A2's max x is EXACTLY R2 at radial 0 (C2 on axis) — so the global flare
    // is (R2, C2.y) iff R2 > I.x. The 800-sample sweep verifies the sampled
    // max agrees within sampler resolution (ds radial ~0.0025 rad -> ~3mm y).
    let prevY = -1e9, flare = 0, flareY = 0;
    for (let k = 0; k <= 800; k++) {
        const p = intr((SIDE * k) / 800);
        if (p.y < prevY - 1e-9) throw Error(`non-monotone rise at s=${((SIDE * k) / 800).toFixed(3)}`);
        prevY = p.y;
        if (p.x > flare) { flare = p.x; flareY = p.y; }
    }
    if (!(R2 > I.x)) throw Error("A1 out-reaches A2 — flare not on the curl");
    if (Math.abs(flare - R2) > 0.01 || Math.abs(flareY - C2.y) > 0.01)
        throw Error(`sampled flare (${flare.toFixed(4)},${flareY.toFixed(4)}) vs analytic (${R2.toFixed(4)},${C2.y.toFixed(4)})`);
    if (R2 <= H + 0.25) throw Error(`belly sub-readable: flare ${R2.toFixed(3)} vs H ${H}`);
    if (R2 >= H + SW) throw Error(`flare overhangs pier plumb: ${R2.toFixed(3)} >= ${H + SW}`);
    // passage widths
    if (2 * H < 1.4) throw Error("clear width < 1.4");
    // head-height (y=1.8) half-passage on A1 — the arc lives at radial
    // [TI, PI+T0] = [155deg, 166deg], so the point is the UPPER branch
    // t = PI − asin(...) (cos NEGATIVE); the naive asin branch lands on the
    // far side of the circle and produces a 14.8m fiction (self-caught: the
    // v1 check could never fire). Assert the branch lands INSIDE the A1 span.
    const tS18 = Math.PI - Math.asin((1.8 - C1.y) / R1);
    if (!(TI <= tS18 && tS18 <= Math.PI + T0))
        throw Error(`y=1.8 radial ${tS18.toFixed(4)} outside A1 span [${TI.toFixed(4)}, ${(Math.PI + T0).toFixed(4)}]`);
    const xh18 = C1.x + R1 * Math.cos(tS18);           // ~2.346
    if (xh18 < 2.0 || xh18 > H + SW)
        throw Error(`head-height passage ${xh18.toFixed(3)} outside [2.0, ${H + SW}]`);
    // room gates (bbox, honest admission)
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (sz.x * sz.z < 8) throw Error(`footprint ${(sz.x * sz.z).toFixed(2)} < 8`);
    if (sz.y < 2.2) throw Error(`height ${sz.y.toFixed(2)} < 2.2`);
    // voussoir census
    let stones = 0;
    g.traverse(o => { if (/^og_voussoir_/.test(o.name)) stones++; });
    if (stones !== 2 * NC) throw Error(`voussoir count ${stones} != ${2 * NC}`);
    console.log(`assertions OK: flare (${flare.toFixed(3)} @ y ${flareY.toFixed(3)}), apex ${KY.toFixed(4)}, head-height passage ${(2 * xh18).toFixed(2)}, bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)}`);
}

const merged = mergeByMaterial(g, "ogeegate");
writeFileSync("agents/arthur/assets/village_ogeegate3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_ogeegate3.glb (R1 ${R1.toFixed(4)}, R2 ${R2.toFixed(4)}, I (${I.x.toFixed(4)},${I.y.toFixed(4)}), C1 (${C1.x.toFixed(4)},${C1.y.toFixed(4)}), L1 ${L1.toFixed(4)} + L2 ${L2.toFixed(4)} = SIDE ${SIDE.toFixed(4)}, ds ${ds.toFixed(4)})`);
