// mkv3-ogeegate.ts — STRUCTURES LANE struct-74/75/76, Round 6 commission R6-3.
// THE OGEE GATE: the mason's master curve. Round 6 gate family: catenary
// (N threshold, struct-72, the hanging chain), closed ring (SW threshold,
// struct-73, the arch that never lands); R6-3 raises the OGEE at the NE
// craft threshold.
//
// v3 (struct-76) — CONSTRUCTION REPLACED after v2.1 failed its 18m contract
// twice (gameplay + night, native): "no inflection anywhere", "caps a dome",
// "vertical piers". Root cause proven in TANGENT SPACE, not by tuning:
//   (a) A tangent-continuous cyma reversa whose crown arc is concave
//       narrows only by turning its tangent back toward vertical — it can
//       never arrive at a sharp keel; a blunt crest is forced (v1/v2's
//       horseshoe/dome read). The "matched curvature" law (|k1|:|k2| ~ 1)
//       was the wrong invariant and is DELETED.
//   (b) The constructible sharp-keel ogee is the ACCOLADE sweep (flamboyant
//       family): an all-convex two-arc turn — tight belly arc that owns the
//       widest WAIST, then a gentle shoulder arc converging over a long
//       reach to a true keel point. Monotone left turns spring->keel.
// v3 curve, right flank, tangent angle a (deg from +x, up = +y):
//   spring S=(H,SY), a rises 50deg (up-outboard) -> 115deg at junction J
//   (belly arc r1, center up-inboard) -> 145deg at keel K on the axis
//   (shoulder arc r2 from J.x/(sin aJ - sin aK), center far outboard-low).
//   Waist = C1x + r1 at a=90deg (ON the belly arc — the flare is owned by
//   the tight arc, sag = r1*(1 - sin aS) ~ 0.28m ~ 11px at 18m).
//   Keel wedge = 2*(180 - 145) = 70deg — a real point.
//   The two flanks' extrados converge to +-0.24m at the crown, leaving an
//   open notch that the KEYSTONE fills — the keystone is geometrically
//   forced by the pointed keel (a true wedge locking near-horizontal
//   courses), stone material, flush law (moongate v3).
//   Brass = ONE small diamond finial on the keystone crest (night judge:
//   "shrink to a small subtle warm accent" — v2.1's lit slab was a plaque).
//   Piers: honest battered frusta (outer face 2.86 -> 2.58 over ~0.8m,
//   ~18deg) whose TOP EDGE is the tilted springing plane through S and
//   extr(0) (40deg tilt) — the battered impost the judges could not see.
// Voussoirs at EQUAL-ARC stations (chain law), stone:mortar 9.2:1 rhythm
// (moongate v3 law: full contact AND countable rhythm).
// Room gates honest: footprint >= 8, height >= 2.2 -> exact trimesh;
// clear opening 4.4m at grade. Materials: standing texMat families
// (struct-38 law). Static, no comps -> 3 buckets after merge.
// Deterministic: fixed trig, no RNG.
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

// ---- the v3 curve (right half; left mirrored) -------------------------------
const D2R = Math.PI / 180;
const H = 2.2;                          // spring half-span (opening 4.4m)
const SY = 1.3;                         // springing height off the piers
const aS = 50 * D2R;                    // spring tangent (up-outboard)
const aJ = 115 * D2R;                   // junction tangent (past vertical)
const aK = 145 * D2R;                   // keel tangent (35deg off horizontal)
const r1 = 1.2;                         // belly radius (sag = r1(1-sin aS))
const V = 0.42;                         // voussoir band (constant-radial)
const TH = 1.5;                         // passage depth (room gate)
const SW_B = 0.66;                      // pier base outer offset (batter)
const SW_T = 0.38;                      // pier top outer offset (batter)

// left normal of tangent direction (cos a, sin a) is (-sin a, cos a).
const C1 = { x: H - r1 * Math.sin(aS), y: SY + r1 * Math.cos(aS) };   // up-inboard
const J = { x: C1.x + r1 * Math.sin(aJ), y: C1.y - r1 * Math.cos(aJ) };
const r2 = -J.x / (Math.sin(aK) - Math.sin(aJ));                     // K on axis
const C2 = { x: J.x - r2 * Math.sin(aJ), y: J.y + r2 * Math.cos(aJ) }; // far outboard-low
const K = { x: 0, y: C2.y - r2 * Math.cos(aK) };                     // keel intrados

// arc-length s: 0 at the spring, SIDE at the keel.
const L1 = r1 * (aJ - aS);
const L2 = r2 * (aK - aJ);
const SIDE = L1 + L2;
const FLARE_X = C1.x + r1;              // intrados widest (ON the belly arc)
const KY = K.y;

const intr = (s: number): { x: number; y: number; a: number } => {
    if (s <= L1) {
        const a = aS + s / r1;
        return { x: C1.x + r1 * Math.sin(a), y: C1.y - r1 * Math.cos(a), a };
    }
    const a = aJ + (s - L1) / r2;
    return { x: C2.x + r2 * Math.sin(a), y: C2.y - r2 * Math.cos(a), a };
};
// extrados = intrados + V * radial-outward (away from the arc center);
// radial-outward at tangent angle a is (sin a, -cos a).
const extr = (s: number) => {
    const p = intr(s);
    return { x: p.x + V * Math.sin(p.a), y: p.y - V * Math.cos(p.a) };
};

// ---- voussoir courses (equal-arc stations, chain law) ------------------------
const NC = 14;                          // courses per side (13 voussoirs + keystone span)
const S_TOP = SIDE - 0.35;              // arc where the keystone polygon takes over
const ds = S_TOP / (NC - 1);
const MW = 0.045;                       // mortar sector arc-width

const quad = (s0: number, s1: number, matl: THREE.Material, name: string, mirror: boolean, depth = TH) => {
    const a = intr(s0), b = intr(s1), c = extr(s1), d = extr(s0);
    const pts = (mirror ? [d, c, b, a] : [a, b, c, d]).map(p =>
        new THREE.Vector2(mirror ? -p.x : p.x, p.y));
    const sh = new THREE.Shape();
    sh.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 4; i++) sh.lineTo(pts[i].x, pts[i].y);
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
    geo.translate(0, 0, -depth / 2);
    const m = new THREE.Mesh(geo, matl);
    m.name = name;
    g.add(m);
};

for (let j = 0; j < NC - 1; j++) {
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

// ---- keystone: single symmetric polygon filling the keel notch ----------------
// The pointed keel leaves an open crown notch between the mirrored flank
// extrados (they converge to +-extr(SIDE).x ~= +-0.24m, not 0). The keystone
// is one 7-point wedge spanning both sides from S_TOP to the apex — no seam
// by construction, stone material, flush law (moongate v3: identical family,
// not an applied tab).
{
    const ke = extr(SIDE);              // keel extrados corner (right)
    const eT = extr(S_TOP);             // S_TOP extrados (right)
    const iT = intr(S_TOP);             // S_TOP intrados (right)
    const pts = [
        new THREE.Vector2(0, KY),                    // keel intrados apex
        new THREE.Vector2(ke.x, ke.y),               // right keel corner
        new THREE.Vector2(eT.x, eT.y),
        new THREE.Vector2(iT.x, iT.y),
        new THREE.Vector2(-iT.x, iT.y),
        new THREE.Vector2(-eT.x, eT.y),
        new THREE.Vector2(-ke.x, ke.y),
    ];
    const sh = new THREE.Shape();
    sh.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i].x, pts[i].y);
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: TH + 0.06, bevelEnabled: false });
    geo.translate(0, 0, -(TH + 0.06) / 2);
    const m = new THREE.Mesh(geo, stoneTex);
    m.name = "og_keystone";
    g.add(m);
    // brass diamond finial — the ONE quiet warm point at night (night judge:
    // shrink/desaturate; v2.1's lit slab was a plaque). Sits ON the keystone
    // crest; nothing overhangs it (keel is the apex — crown law polish-272).
    const dHalf = 0.17;
    const yb = ke.y;                    // keystone crest
    const dsh = new THREE.Shape();
    dsh.moveTo(0, yb + 2 * dHalf);
    dsh.lineTo(dHalf, yb + dHalf);
    dsh.lineTo(0, yb);
    dsh.lineTo(-dHalf, yb + dHalf);
    dsh.closePath();
    const dgeo = new THREE.ExtrudeGeometry(dsh, { depth: 0.12, bevelEnabled: false });
    dgeo.translate(0, 0, -0.06);
    const fin = new THREE.Mesh(dgeo, brass);
    fin.name = "og_finial";
    g.add(fin);
}

// ---- battered piers: frusta with the tilted springing plane as top edge ------
// The pier top edge runs through S (intrados spring) and extr(0) (band
// underside at the spring) — the 40deg tilted impost plane, flush under the
// first voussoir. Outer face battered (SW_B -> SW_T over its rise).
const polyMesh = (pts: THREE.Vector2[], matl: THREE.Material, name: string, depth: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i].x, pts[i].y);
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
    geo.translate(0, 0, -depth / 2);
    const m = new THREE.Mesh(geo, matl);
    m.name = name;
    g.add(m);
};

const e0 = extr(0);                     // spring extrados (lands over the pier)
const SHOULDER_PTS = 8;
const SHOULDER_S = 1.15;                // extrados until it tucks inboard of the pier
for (const [tag, sx] of [["e", 1], ["w", -1]] as const) {
    // pier frustum: base (H..H+SW_B), top edge S -> outer corner on the
    // tilted plane; outer corner x = H + SW_T
    const topOut = { x: H + SW_T, y: SY + (e0.y - SY) * (SW_T / (e0.x - H)) };
    const pier = [
        new THREE.Vector2(sx * H, 0),
        new THREE.Vector2(sx * (H + SW_B), 0),
        new THREE.Vector2(sx * topOut.x, topOut.y),
        new THREE.Vector2(sx * H, SY),
    ];
    polyMesh(pier, stoneTex, `og_pier_${tag}`, TH);
    // shoulder fan: from S along the extrados curve (s 0..SHOULDER_S) down to
    // the pier's outer top corner — the haunch lands on masonry.
    const fan = [new THREE.Vector2(sx * H, SY)];
    for (let k = 0; k <= SHOULDER_PTS; k++) {
        const s = (SHOULDER_S * k) / SHOULDER_PTS;
        const p = extr(s);
        fan.push(new THREE.Vector2(sx * p.x, p.y));
    }
    fan.push(new THREE.Vector2(sx * topOut.x, topOut.y));
    polyMesh(fan, stoneTex, `og_shoulder_${tag}`, TH);
    // impost mark: thin mortar band along the tilted top edge, projecting
    // 0.05 — makes the battered springing plane READ from dead-front.
    const t = 0.08, proj = 0.05;
    const ux = (e0.x - H), uy = (e0.y - SY);          // along-edge vector
    const ul = Math.hypot(ux, uy);
    const nx = uy / ul, ny = -ux / ul;                 // outward normal (down-out)
    const band = [
        new THREE.Vector2(sx * (H - proj * -nx), SY - proj * -ny),
        new THREE.Vector2(sx * (H + ux * 1.12 - proj * -nx), SY + uy * 1.12 - proj * -ny),
        new THREE.Vector2(sx * (H + ux * 1.12 + (t) * -nx), SY + uy * 1.12 + (t) * -ny),
        new THREE.Vector2(sx * (H + (t) * -nx), SY + (t) * -ny),
    ];
    polyMesh(band, mortarTex, `og_impost_${tag}`, TH + 0.02);
    // plinth
    const p = new THREE.Mesh(new THREE.BoxGeometry(SW_B + 0.14, 0.22, TH + 0.14), mortarTex);
    p.name = `og_plinth_${tag}`;
    p.position.set(sx * (H + SW_B / 2), 0.11, 0);
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
    // keel on axis + arc radii exact
    if (!near(K.x, 0)) throw Error(`keel off axis: ${K.x}`);
    if (!(r2 > 0) || !isFinite(r2)) throw Error(`shoulder radius bad: ${r2}`);
    if (!near(Math.hypot(J.x - C2.x, J.y - C2.y), r2)) throw Error("A2 radius drift");
    if (!near(Math.hypot(H - C1.x, SY - C1.y), r1)) throw Error("A1 radius drift");
    // tangency at the junction: C2 = J + r2 * leftNormal(aJ)
    if (!near(C2.x, J.x - r2 * Math.sin(aJ)) || !near(C2.y, J.y + r2 * Math.cos(aJ)))
        throw Error("junction tangency broken");
    // belly owns the widest point (junction past vertical)
    if (!(aJ > Math.PI / 2)) throw Error("junction before vertical — waist not on the belly arc");
    // visible belly + waist law (v3 S-legibility core)
    const sag = r1 * (1 - Math.sin(aS));
    if (sag < 0.20) throw Error(`belly sag sub-readable: ${sag.toFixed(3)}`);
    if (FLARE_X < H + 0.25) throw Error(`waist sub-readable: flare ${FLARE_X.toFixed(3)} vs H ${H}`);
    // haunch must clear the pier base so the waist reads (silhouette bump)
    if (FLARE_X + V < H + SW_B) throw Error("haunch inside pier base — waist muted");
    // keel wedge readable (a real point, not a needle)
    const wedge = 2 * (180 - aK / D2R);
    if (wedge < 55 || wedge > 85) throw Error(`keel wedge ${wedge.toFixed(1)}deg outside [55,85]`);
    // monotone rise; single widest point on the intrados
    let prevY = -1e9, prevX = -1e9, maxSeen = false;
    for (let k = 0; k <= 800; k++) {
        const p = intr((SIDE * k) / 800);
        if (p.y < prevY - 1e-9) throw Error(`non-monotone rise at s=${((SIDE * k) / 800).toFixed(3)}`);
        if (p.x > prevX + 1e-9 && maxSeen) throw Error(`second outward run at s=${((SIDE * k) / 800).toFixed(3)}`);
        if (p.x < prevX - 1e-9) maxSeen = true;
        prevY = p.y; prevX = p.x;
    }
    // spring band lands over the pier (tilted impost plane is real support)
    if (e0.x < H + 0.15 || e0.x > H + SW_T + 0.25) throw Error(`spring extrados x ${e0.x.toFixed(3)} off pier`);
    if (e0.y > SY) throw Error("spring extrados above springing — impost not tilted");
    // passage widths
    if (2 * H < 1.4) throw Error("clear width < 1.4");
    // head-height passage: intrados at y=1.8 (on the belly arc it flares — ok)
    // keystone notch is real (the keystone is load-bearing fill, not applied)
    if (extr(SIDE).x < 0.12) throw Error("crown notch sub-real — keystone not forced");
    // voussoir census
    let stones = 0;
    g.traverse((o: THREE.Object3D) => { if (/^og_voussoir_/.test(o.name)) stones++; });
    if (stones !== 2 * (NC - 1)) throw Error(`voussoir count ${stones} != ${2 * (NC - 1)}`);
    // room gates (bbox, honest admission)
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (sz.x * sz.z < 8) throw Error(`footprint ${(sz.x * sz.z).toFixed(2)} < 8`);
    if (sz.y < 2.2) throw Error(`height ${sz.y.toFixed(2)} < 2.2`);
    console.log(`assertions OK: r1 ${r1.toFixed(4)} r2 ${r2.toFixed(4)}, sag ${sag.toFixed(3)}, flare ${FLARE_X.toFixed(3)} (extrados ${(FLARE_X + V).toFixed(3)} vs pier ${H + SW_B}), wedge ${wedge.toFixed(1)}deg, keel y ${KY.toFixed(3)}, bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)}`);
}
const merged = mergeByMaterial(g, "ogeegate");
writeFileSync("agents/arthur/assets/village_ogeegate3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_ogeegate3.glb (r1 ${r1.toFixed(4)}, r2 ${r2.toFixed(4)}, C1 (${C1.x.toFixed(4)},${C1.y.toFixed(4)}), C2 (${C2.x.toFixed(4)},${C2.y.toFixed(4)}), L1 ${L1.toFixed(4)} + L2 ${L2.toFixed(4)} = SIDE ${SIDE.toFixed(4)}, ds ${ds.toFixed(4)}, S_TOP ${S_TOP.toFixed(4)})`);
