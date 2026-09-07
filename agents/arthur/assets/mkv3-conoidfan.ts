// mkv3-conoidfan.ts — STRUCTURES LANE struct-87, Round 8 commission R8-3.
// THE CONOID FAN: the ruled-surface ledger's missing member. The village
// holds the hypar (meridianstair + hypar pavilion), the hyperboloid
// (ruledtower), the helicoid (screwwell) — no conoid stands.
// ONE IDEA: MANY STRAIGHT LINES, ONE LAW. Every timber rib of the canopy
// is a STRAIGHT HORIZONTAL beam, and all of them pass through one vertical
// mast; their far ends all land in ONE VERTICAL PLANE (x = D), tracing a
// true parabola y = A − k·z². The curved silhouette is nothing but the
// envelope of straight rulings — the conoid's theorem, walkable under.
// (All rulings parallel to a common plane — the ground — and all piercing
// one directrix line — the mast axis: the classical right conoid,
// Gaudí's Sagrada-school surface.)
//
// GEOMETRY (entity local; mast at origin; ribs sweep toward +x):
//   Ribs: 17 horizontal straight beams = 8 mirror pairs + 1 crown rib
//   (v3: v2's 25 ribs at 166.7mm pitch had 6.7mm sky gaps — sub-pixel at
//   18m, judged SOLID SHELL; chainvault rhythm law applied: gaps must
//   read. v3 = 9 levels, 250mm pitch, 130mm depth → 120mm sky ≈ 8px @18m).
//   Each level's parameter t_j = sqrt((A − y_j)/k); the pair sits at
//   ±t_j. Rib at ±t: from mast (0, y, 0) to tip (D, y, ±t) — horizontal
//   direction (D, 0, ±t)/|·|, LENGTH hypot(D, t) (varies — that is what
//   puts every tip in the plane x = D). k = 2/10.24 exact (drop 2.000).
//   Section 0.11 w × 0.16 h.
//   Mast: timber column r 0.15, plinth top 0.28 to 4.62 (ribs pierce it).
//   Post row: 5 posts at t = 0, ±1.6, ±3.2 standing at x = D under their
//   rib tips; post heights themselves step the parabola (the vertical
//   rhythm doubles the curve at walking scale). Post gaps 1.46m ≥ 1.4.
//   Iron rail: one bent rod r 0.04 threading all 17 tips in t-order —
//   the parabola drawn in iron at the canopy edge (TubeGeometry along
//   the exact tip polyline).
//   Stone: plinth disc r 0.75 under the mast + curb strip under the posts.
//   Night: ONE brass bead at the mast head (glow_cf KEEP — dusk lineage
//   chainvault crown / rotor studs). No other glow. No motion. ~4 nodes.
//
// Gates honest: footprint ≈ 5.4 × 6.6 = 36 m² ≥ 16; height 4.75 ≥ 2.2 →
// exact trimesh; lowest rib underside 2.27m clear everywhere; enterable
// from both open sides and both open ends → MCPL walk at placement.
// Determinism: fixed counts, fixed trig, assertions below.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — standing families
const timberTex = texMat("cf_timber", [0x6e5a3e, 0x77654a, 0x5c4c34], { rough: 0.85, scale: 1.5 });
const ironTex = texMat("cf_iron", [0x44402e, 0x3c3828, 0x4c4836], { rough: 0.7, scale: 2, weights: [2, 1, 1], cell: 24 });
const stoneTex = texMat("cf_stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const brassGlow = mat(0x9a6a28, 0.4, 0.8);
(brassGlow as any).emissive = new THREE.Color(0x9a6a28);
(brassGlow as any).emissiveIntensity = 0.75;

// ---- constants ----------------------------------------------------------------
const NLEV = 9;                         // height levels (8 pairs + crown = 17 ribs)
const YMIN = 2.35, YMAX = 4.35;         // foot / crown rib heights
const A = 4.35;                         // parabola crown height
const K = 2 / 10.24;                    // parabola constant (exact fraction)
const TMAX = 3.2;                       // z half-spread of the tip parabola
const D = 5.2;                          // tip plane x = D
const RIB_W = 0.11, RIB_H = 0.13;
const MAST_R = 0.15;
const POST_T = [0, 1.6, -1.6, 3.2, -3.2];

// ---- the parabola (elevation law): y = A − k t² ---------------------------------
const ribY = (t: number) => A - K * t * t;
if (Math.abs(ribY(0) - A) > 1e-9) throw Error("crown law broken");
if (Math.abs(K * TMAX * TMAX - 2) > 1e-9) throw Error("drop law broken");  // drop = 2.000 exactly
if (Math.abs(ribY(TMAX) - YMIN) > 1e-9) throw Error("foot law broken");
for (let i = 1; i <= 20; i++) {
    const a = ribY((i / 20) * TMAX), b = ribY(((i - 1) / 20) * TMAX);
    if (a - b > 1e-9) throw Error(`parabola rises away from crown at i=${i}`);
}

// ---- ribs: horizontal straight beams, mast axis -> plane x = D -------------------
const tipPts: THREE.Vector3[] = [];     // in t-order low->high for the rail
{
    // collect (t, y) pairs: 12 mirror pairs (low levels first) + crown
    const ribs: { t: number; y: number }[] = [];
    for (let j = 0; j < NLEV; j++) {
        const y = YMIN + (j * (YMAX - YMIN)) / (NLEV - 1);
        const t = Math.sqrt(Math.max(0, (A - y) / K));
        if (t < 1e-9) ribs.push({ t: 0, y });            // crown rib
        else { ribs.push({ t, y }); ribs.push({ t: -t, y }); }
    }
    if (ribs.length !== 17) throw Error(`rib count ${ribs.length} != 17`);
    // level pitch law: uniform-in-height stack, faces clear
    const levels: number[] = [];
    for (const r of ribs) if (!levels.some(l => Math.abs(l - r.y) < 1e-9)) levels.push(r.y);
    levels.sort((a, b) => a - b);
    for (let i = 1; i < levels.length; i++) {
        const pitch = levels[i] - levels[i - 1];
        if (pitch < RIB_H) throw Error(`level pitch ${pitch.toFixed(4)} < rib depth ${RIB_H} (faces merge)`);
    }
    for (const { t, y } of ribs) {
        const vlen = Math.hypot(D, t);
        const ux = D / vlen, uz = t / vlen;              // horizontal ruling unit vector
        const L = vlen;                                  // tip lands exactly at (D, y, t)
        const rib = new THREE.Mesh(new THREE.BoxGeometry(L, RIB_H, RIB_W), timberTex);
        rib.rotation.y = -Math.atan2(uz, ux);
        rib.position.set((ux * L) / 2, y, (uz * L) / 2);
        rib.name = `cf_rib${ribs.indexOf(ribs.find(r => r.t === t && r.y === y)!)}`;
        g.add(rib);
        tipPts.push(new THREE.Vector3(D, y, t));         // exact plane tip
    }
    // re-sort tip list in t-order (low t -> high t) for a clean rail sweep
    tipPts.sort((p, q) => p.z - q.z);
}

// ---- tip parabola rail (iron tube through all tips, t-order) ---------------------
{
    const curve = new THREE.CatmullRomCurve3(tipPts, false, "catmullrom", 0.0);
    const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.04, 8, false), ironTex);
    rail.name = "cf_rail";
    g.add(rail);
}

// ---- mast -----------------------------------------------------------------------
{
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(MAST_R, MAST_R * 1.18, 4.62 - 0.28, 12), timberTex);
    mast.name = "cf_mast";
    mast.position.set(0, (4.62 + 0.28) / 2, 0);
    g.add(mast);
}

// ---- post row under the rib tips (x = D) ------------------------------------------
for (const t of POST_T) {
    const y = ribY(t);
    const px = D, pz = t;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, y, 0.14), timberTex);
    post.name = `cf_post_${Math.abs(t).toFixed(1).replace('.', '_')}${t < 0 ? 'm' : ''}`;
    post.position.set(px, y / 2, pz);                   // runs 0..y, top embedded to rib centerline
    g.add(post);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.34), stoneTex);
    foot.name = "cf_postfoot";
    foot.position.set(px, 0.06, pz);
    g.add(foot);
}

// ---- plinth disc + curb -----------------------------------------------------------
{
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.28, 20), stoneTex);
    disc.name = "cf_plinth";
    disc.position.set(0, 0.14, 0);
    g.add(disc);
    // curb strip on the ground under the post row: straight, along z at x = D
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 2 * TMAX), stoneTex);
    curb.name = "cf_curb";
    curb.position.set(D, 0.05, 0);
    g.add(curb);
}

// ---- mast-head brass bead (KEEP glow_cf — night read) ------------------------------
{
    // struct-52 law check: the bead sits at the mast head, PROUD of everything —
    // the highest point of the structure; no member occludes it from any angle.
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), brassGlow);
    bead.name = "glow_cf";
    bead.position.set(0, 4.62 + 0.04, 0);
    g.add(bead);
}

// ---- assertions --------------------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    if (sz.y < 2.2) throw Error(`height ${sz.y.toFixed(2)} below trimesh line`);
    if (sz.x * sz.z < 16) throw Error(`footprint ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} below room gate`);
    // walk-under law: LOWEST rib underside must clear 2.2m
    const lowUnderside = ribY(TMAX) - RIB_H / 2;
    if (lowUnderside < 2.2) throw Error(`lowest rib underside ${lowUnderside} below 2.2`);
    // tip plane law: every tip in the vertical plane x = D, ON the parabola
    for (const p of tipPts) {
        if (Math.abs(p.x - D) > 1e-6) throw Error(`tip off plane x=D: ${p.x}`);
        if (Math.abs(p.y - ribY(p.z)) > 1e-6) throw Error(`tip off parabola at z=${p.z}`);
    }
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | drop ${K * TMAX * TMAX} | low underside ${lowUnderside.toFixed(3)} | tips ${tipPts.length}`);
}
const merged = mergeByMaterial(g, "conoidfan");
writeFileSync("agents/arthur/assets/village_conoidfan3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_conoidfan3.glb");
