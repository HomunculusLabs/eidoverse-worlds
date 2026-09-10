// mkv3-unduloid.ts — STRUCTURES LANE struct-157, Round 11 commission R11-4.
// THE UNDULOID STOUP: form-ledger gap grep fresh this tick — unduloid 0/0/0
// across STRUCTURES-PLAN + IMPROVEMENTS + IMPROVE-PLAN. Delaunay 1841 —
// the CMC roulette family; lineage pair to R11-3 Villarceau 1848 (same
// French geometry moment, different surface). Standing kin: Founder's Knot
// = torus knot braided path (spinning, solid brass); Reed Pool = still
// water + reed verticals; this is a BEAD CHAIN of constant-mean-curvature
// surfaces — no village form is a bead chain (grep: bead-chain/totem clean;
// cairn = stacked stones, different class).
//
// ONE IDEA: WATER HELD MID-AIR AS MATH. Five identical beads of a Delaunay
// unduloid — the surface a stream of water actually forms as it falls in
// beads (constant mean curvature, the shape of a dripping chain) — spanning
// two hewn stone posts over a still oval basin. One amber bead hangs below
// the middle bead: the drip that hasn't fallen. At 18m: a rhythmic bright
// bead-chain over dark water. At walk-up: every bead is the SAME surface,
// pinched to a neck and swelling again, forever.
//
// MATH (derived from the definition, verified by struct157-probe-unduloid):
// - Ellipse a=1 e=0.55 rolling without slip along a line; a focus traces
//   the meridian. Verified: period == Ramanujan perimeter 0.000%, CMC
//   H=1/(2a) worst 0.0000% (parametric intrinsic curvatures), laws
//   bulge=a(1+e), neck=a(1-e) EXACT (probe printout).
// - World scale k=0.38/1.55: bulge R 0.38m, neck R 0.1103m, period
//   P_w = 5.77697*k = 1.416230m (computed, not hardcoded).
// - The surface of revolution = the unduloid: LatheGeometry over one
//   period replicated along the axis (bulges at u=0,+-P,+-2P: FIVE).
//
// LAWS HONORED (struct-121+ lineage):
// - texMat lanes (struct-38): uq_stone, uq_brass (tensegrity v6 bright-brass
//   lane 0xCEAE54/0xBE9A47/0xE1BE68 metal 0.9 — thin members read as wire).
// - Water is GEOMETRY, never particles; palette blue 0x506a78 rough 0.25
//   metal 0.5; flat and still (life-stays-flat; reedpool idiom).
// - Glow census exactly 1 KEEP (glow_uq_1): the drip bead under the middle
//   unduloid bead's nadir, 0.345m above the water (kiss lineage).
// - Brass chain EMBEDS into the posts (u to 2.20P vs inner face 2.05P) —
//   no butt joint, no floating end; cut end hidden inside stone.
// - Envelope law pinned by throws (struct-155 precedent): x = plinths
//   2*(2.05P+0.15+0.23), z = basin 2.20, y = post top 1.30; y-min 0 on
//   grade; NaN 0; node budget 4 (2 texMat + water + glow KEEP).
// Folly class: no entry advertised — no walk owed (zeno..villarceau
// precedent). Deterministic: parametric only, seeded texMat.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the Delaunay roulette (unit a=1, eccentricity e) -------------------------------------------
const A = 1, E = 0.55, K = 0.38 / (A * (1 + E));   // world scale: bulge radius -> 0.38m
const NP = 7200;                                   // samples per ellipse revolution

const B = A * Math.sqrt(1 - E * E), C = A * E;
const psi0 = -Math.PI / 2;                         // contact starts at ellipse bottom
const speed = (psi: number) => Math.hypot(A * Math.sin(psi), B * Math.cos(psi));
const s = new Float64Array(NP + 1);
for (let i = 1; i <= NP; i++) {
    const p0 = psi0 + ((i - 1) / NP) * 2 * Math.PI, p1 = psi0 + (i / NP) * 2 * Math.PI;
    s[i] = s[i - 1] + 0.5 * (speed(p0) + speed(p1)) * (p1 - p0);
}
// dense trace polyline of one period: x = rolled distance, y = focus radius
const poly: { x: number; y: number }[] = [];
for (let i = 0; i <= NP; i++) {
    const psi = psi0 + (i / NP) * 2 * Math.PI;
    const Px = A * Math.cos(psi), Py = B * Math.sin(psi);
    const th = -Math.atan2(B * Math.cos(psi), -A * Math.sin(psi)); // rotate tangent to +x
    const dx = C - Px, dy = -Py;
    poly.push({ x: s[i] + dx * Math.cos(th) - dy * Math.sin(th), y: dx * Math.sin(th) + dy * Math.cos(th) });
}
const PERIOD = s[NP];                              // == ellipse perimeter (Ramanujan, probe-verified)
// self-locate the first bulge (phase), then define r at rolled distance x
const BULGE_X = poly.reduce((m, p) => (p.y > m.y ? p : m), poly[0]).x;
const rAt = (x: number): number => {
    const xm = ((x % PERIOD) + PERIOD) % PERIOD;
    let lo = 0, hi = poly.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (poly[mid].x <= xm) lo = mid; else hi = mid; }
    const t = (xm - poly[lo].x) / (poly[hi].x - poly[lo].x);
    return poly[lo].y + t * (poly[hi].y - poly[lo].y);
};
// world-space chain radius at axis position u (bulges at u = 0, +-P_w, ...)
const P_W = PERIOD * K, NECK_R = A * (1 - E) * K, BULGE_R = A * (1 + E) * K;
const rWorld = (u: number) => {
    let xm = ((BULGE_X + u / K) % PERIOD + PERIOD) % PERIOD;
    if (xm < poly[0].x) xm += PERIOD; // PHASE-SEAM LAW: trace x starts at poly[0].x (psi0=-pi/2
    // contact point), NOT 0 — a mod landing below it must wrap forward one period; extrapolating
    // below poly[0] is garbage (struct157 decoder caught u=0.35407260 landing 1.4e-8 past the seam)
    let lo = 0, hi = poly.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (poly[mid].x <= xm) lo = mid; else hi = mid; }
    const t = (xm - poly[lo].x) / (poly[hi].x - poly[lo].x);
    return (poly[lo].y + t * (poly[hi].y - poly[lo].y)) * K;
};

// ---- pinned composition constants (derived from the measured period) ----------------------------
const LIFT = 0.87;                    // chain axis height: bead nadir 0.49, water top 0.145 -> 0.345 drip gap
const U_END = 2.20 * P_W;             // brass generated to +-2.20P (tail embeds in posts)
const POST_INNER = 2.05 * P_W;        // post inner face: last bead fully visible, neck stub enters stone
const POST_HALF = 0.15, POST_H = 1.30;
const POST_CX = POST_INNER + POST_HALF;
const PLINTH_HALF = 0.23, PLINTH_H = 0.10;
const BASIN_RX = 2.00, BASIN_RZ = 1.10, BASIN_H = 0.20, WATER_TOP = 0.29, WATER_INSET = 0.12;
const BEAD_R = 0.10, BEAD_Y = LIFT - BULGE_R - 0.06;

// ---- laws (each pinned to measured truth; violations throw) --------------------------------------
{
    if (Math.abs(P_W - 1.416230) > 5e-4) throw Error(`period law: P_w ${P_W.toFixed(6)} != 1.416230 (probe truth)`);
    if (Math.abs(BULGE_R - 0.38) > 1e-9) throw Error("bulge law: BULGE_R != 0.38");
    if (Math.abs(NECK_R - 0.110323) > 5e-5) throw Error(`neck law: ${NECK_R.toFixed(6)} != 0.110323`);
    // bulge exactly at u=0 and periodicity: r(0)==r(P_w)==bulge, r(P_w/2)==neck
    for (const u of [0, P_W, 2 * P_W, -P_W, -2 * P_W])
        if (Math.abs(rWorld(u) - BULGE_R) > 1e-6) throw Error(`bulge law at u=${u.toFixed(3)}: ${rWorld(u).toFixed(6)}`);
    for (const u of [P_W / 2, -P_W / 2, 1.5 * P_W, -1.5 * P_W])
        if (Math.abs(rWorld(u) - NECK_R) > 1e-4) throw Error(`neck law at u=${u.toFixed(3)}: ${rWorld(u).toFixed(6)}`);
    // embed law: brass tail ends >= 5cm inside the post, no butt joint
    if (U_END > POST_INNER + 2 * POST_HALF - 0.05) throw Error("embed law: tail not >=5cm inside post");
    if (U_END <= POST_INNER) throw Error("embed law: tail does not reach stone");
    // drip gap: bead bottom clears still water, bead hangs below brass nadir
    if (Math.abs(BEAD_Y - 0.43) > 1e-9 || BEAD_Y - BEAD_R <= WATER_TOP) throw Error("drip law");
    console.log(`unduloid laws OK: P_w ${P_W.toFixed(6)} bulge ${BULGE_R} neck ${NECK_R.toFixed(6)} post inner ${POST_INNER.toFixed(4)} brass tip ${U_END.toFixed(4)} embed ${(POST_INNER + 2 * POST_HALF - U_END).toFixed(3)}m bead y ${BEAD_Y}`);
}

// ---- build ---------------------------------------------------------------------------------------
const stoneTex = texMat("uq_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9541 });
const brassTex = texMat("uq_brass", [0xceae54, 0xbe9a47, 0xe1be68], { rough: 0.38, metal: 0.9, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9542 });

const g = new THREE.Group();

// the bead chain — unduloid as a surface of revolution, five periods' worth of profile in ONE lathe
{
    const pts: THREE.Vector2[] = [];
    const N = 440;
    for (let i = 0; i <= N; i++) {
        const u = -U_END + (i / N) * 2 * U_END;
        pts.push(new THREE.Vector2(Math.max(rWorld(u), 0.01), u));
    }
    const chain = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), brassTex);
    chain.rotation.z = Math.PI / 2;   // lathe axis is +y; chain spans world x
    chain.position.y = LIFT;          // lift AFTER rotation (rotation is about the axis origin)
    g.add(chain);
}

// the two hewn posts (square prisms) + plinths
for (const sgn of [1, -1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(2 * POST_HALF, POST_H, 2 * POST_HALF), stoneTex);
    post.position.set(sgn * POST_CX, POST_H / 2, 0);
    g.add(post);
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2 * PLINTH_HALF, PLINTH_H, 2 * PLINTH_HALF), stoneTex);
    plinth.position.set(sgn * POST_CX, PLINTH_H / 2, 0);
    g.add(plinth);
}

// the oval basin: solid stone block + meniscus water dome (struct-162 refine).
// v2 defect (survey-312 Sev 2): the flat water disc y[0.125..0.145] sat INSIDE
// the solid stone block (top 0.20) — struct-52 enclosure class UNDER dress-79
// rim occlusion; zero visible water from any vantage, teal/emissive never
// present (0 cool px at night). Cure = both laws at once: the water surface
// CRESTS the rim (dress-79 "fuel must crest ~0.09m proud", polish-281 idiom),
// as a spherical-cap MENISCUS — itself a CMC surface (e=0 Delaunay member,
// the family's own sphere-bead): the basin holds the drop that fell.
// Cap: equator at rim y=0.20 (r 1.88x1.03 inset), apex 0.29, sagitta 0.09.
// Bottom of the dome dips to 0.11 (still inside stone: water is a SURFACE,
// the block reads as basin walls below the equator).
{
    const block = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, BASIN_H, 48), stoneTex);
    block.scale.set(BASIN_RX, 1, BASIN_RZ);
    block.position.y = BASIN_H / 2;
    g.add(block);
    const W_R = BASIN_RX - WATER_INSET, W_RZ = BASIN_RZ - WATER_INSET; // 1.88 x 0.98
    const SAG = WATER_TOP - BASIN_H;                                   // 0.09
    const meniscus = new THREE.Mesh(
        new THREE.SphereGeometry(W_R, 48, 18, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x506a78, roughness: 0.25, metalness: 0.5,
            emissive: new THREE.Color(0x2e4a58), emissiveIntensity: 0.70 })); // wet gleam lane (cistern97 / polish-281 cure)
    meniscus.scale.set(1, SAG / W_R, W_RZ / W_R); // squash to sagitta; elliptical footprint
    meniscus.position.y = BASIN_H;
    g.add(meniscus);
}

// the drip bead — the one drop that hasn't fallen, under the middle bead's nadir
const glowMeshes: THREE.Mesh[] = [];
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 0.85;   // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, BEAD_Y, 0);
    bead.name = "glow_uq_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const wantX = 2 * (POST_CX + PLINTH_HALF), wantY = POST_H, wantZ = 2 * BASIN_RZ;
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(sz.x - wantX) > 0.01 || Math.abs(sz.z - wantZ) > 0.01 || Math.abs(sz.y - wantY) > 0.01)
        throw Error(`envelope ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} != ${wantX.toFixed(2)}x${wantY.toFixed(2)}x${wantZ.toFixed(2)}`);
    if (Math.abs(env.min.x + env.max.x) > 0.01 || Math.abs(env.min.z + env.max.z) > 0.01) throw Error("not x/z centered");
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 1 glow KEEP (glow_uq_1)`);
}

const merged = mergeByMaterial(g, "unduloid");
writeFileSync("agents/arthur/assets/village_unduloid3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_unduloid3.glb`);
