// mkv3-catalan.ts — STRUCTURES LANE struct-173, Round 11 commission R11-8
// THE CATALAN SURFACE: the vault swept by falling parabolas.
//
// ONE IDEA: EVERY PARABOLA IN THE WALL IS FALLING. Catalan 1855: the unique
// minimal surface swept by a family of true parabolas — every fixed-u curve
// is an EXACT parabola whose vertex rides the surface's own geodesic, and
// that geodesic IS THE CYCLOID (u - sin u, 1 - cos u) — the brachistochrone
// curve the village already owns as a rail (struct-119), here elevated to
// the heart-line of a roof. The build presents the FULL strip: two wings
// springing from a low cusp, grounded at the single mast foot in a stone
// drum, rim corners rising free to 2.6m — a saddle vault whose every
// cross-section is a parabola and whose spine is the fastest-fall curve.
//
// KIN CHECK (elevates, never competes): the brachistochrone rail owns the
// cycloid as PATH; this owns the cycloid as GEODESIC SPINE of a surface —
// different family (surface vs rail), and the minimal-surface lineage
// (catenoid screwwell-helicos... helicoid class, costa, kuen, enneper, boy,
// gyroid, unduloid, hypar) gains its PARABOLA-SWEPT member. NOT ruled
// (Catalan 1855: only plane + helicoid are ruled minimal surfaces — probe
// C10 negative control) — the honest claim is "swept by parabolas".
// Folly class, no walk owed (zeno..kuen precedent).
//
// MATH (all machine-checked in struct173-probe-catalan.ts, ALL CHECKS PASS
// 14/14 real exit 0 this tick; parametrization secured from Wikipedia
// wikitext citing Gray 1997 pp. 692-693 / Catalan C.R. Acad. Sci. 1855):
//   x = u - sin(u) cosh(v),  y = 1 - cos(u) cosh(v),  z = 4 sin(u/2) sinh(v/2)
//   CYCLOID LAW  X(u,0) = (u - sin u, 1 - cos u, 0) EXACT — the spine.
//   PARABOLA LAW x,y affine in z^2 with coefficient 1/(8 sin^2(u/2)) EXACT.
//   MINIMAL LAW  H = 0 (FD 3.68e-8 floor).
//   MIRRORS      X(-u,v) = (-x, y, -z) — a PROPER rotation (det +1, no
//                winding flip on the mirrored half); X(u,-v) = (x, y, -z).
//   MAST LINE    X(0,v) = (0, 1-cosh v, 0) — regular chart (no cuspidal
//                edge, unlike kuen); the wings join smoothly at u=0.
//   BOUNDARY     u=pi: x == pi, y = 2 + z^2/8 — a TRUE parabola, congruent
//                class to the sweep's own members (the rim is one of them).
//   SEE-SAW      cusp-to-mast drop == crown-to-corner rise == cosh V - 1.
//
// WORLD MAP (probe C11, FULL strip u in [-pi,pi], v in [-1,1], S 0.75,
// LIFT 0.7073): film envelope x[-2.356..2.356] y[0.300..2.615]
// z[-1.563..1.563]; mast bottom (0,0.300,0) embeds 10cm under the drum top
// (0.40); rim corners (±2.356, 2.615, ±1.563) hang free (iron hem covers
// the whole boundary loop); crowns (±2.356, 2.207, 0) carry the two ember
// beads (glow_ca_1/2, polish-278 summit-ember lineage); the brass cycloid
// spine rides the surface from crown to crown through the cusp.
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) ca_bone
// (film, DoubleSide — the vault's under-face is visible from below),
// ca_iron (closed boundary hem), ca_brass (cycloid spine — the signature
// lane; beads use the glow material), ca_stone (drum). Glow census exactly
// 2 KEEPs. NaN 0; node budget 6 (4 texMat buckets + 2 glow KEEPs).
// Deterministic: pure parametric grids + seeded texMat only.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the Catalan surface ---------------------------------------------------------------------------
const V = 1.0, S = 0.75, LIFT = 0.30 + S * (Math.cosh(1.0) - 1);
const X = (u: number, v: number): THREE.Vector3 => new THREE.Vector3(
    (u - Math.sin(u) * Math.cosh(v)) * S,
    (1 - Math.cos(u) * Math.cosh(v)) * S + LIFT,
    (4 * Math.sin(u / 2) * Math.sinh(v / 2)) * S,
);
{
    // laws re-asserted fail-closed before any mesh (probe C2/C5/C7 mirrors)
    for (let i = 0; i < 100; i++) {                       // rotation-mirror law EXACT
        const u = (i / 99) * Math.PI, v = -1 + ((i * 7) % 13) * 0.15;
        const a = X(-u, v), b = X(u, v);
        if (Math.abs(a.x + b.x) > 1e-12 || Math.abs(a.y - b.y) > 1e-12 || Math.abs(a.z + b.z) > 1e-12)
            throw Error(`mirror law broken at (u=${u.toFixed(3)},v=${v.toFixed(3)})`);
    }
    for (let i = 0; i <= 200; i++) {                      // cycloid law EXACT (the spine)
        const u = (i / 200) * Math.PI - Math.PI / 2, p = X(u, 0);
        if (Math.abs(p.z) > 1e-12 || Math.abs(p.y - ((1 - Math.cos(u)) * S + LIFT)) > 1e-12)
            throw Error(`cycloid law broken at u=${u.toFixed(3)}`);
    }
    for (let i = -40; i <= 40; i++) {                     // boundary parabola law EXACT
        const v = i * 0.025, p = X(Math.PI, v);
        if (Math.abs(p.x - Math.PI * S) > 1e-12 || Math.abs(p.y - ((2 + (p.z * p.z) / (8 * S * S)) * S + LIFT)) > 1e-9)
            throw Error(`boundary law broken at v=${v.toFixed(3)}`);
    }
    console.log("catalan laws OK: cycloid spine exact, boundary parabola exact, rotation-mirror exact");
}

// ---- numeric normals (central differences) ---------------------------------------------------------
const H = 1e-4;
const nrm = (u: number, v: number): THREE.Vector3 => {
    const xu = X(u + H, v).sub(X(u - H, v)).divideScalar(2 * H);
    const xv = X(u, v + H).sub(X(u, v - H)).divideScalar(2 * H);
    return xu.cross(xv).normalize();
};

// ---- film: ONE wing u in (0, pi] meshed, then rotation-mirrored (det +1, winding preserved) ---------
const NU = 140, NV = 100;                                  // u_i = pi*i/NU (fold-offset at 0), v_j = -V + j*2V/NV
const wingPos: number[] = [], wingNor: number[] = [], wingUV: number[] = [], wingIdx: number[] = [];
{
    const vert = (u: number, v: number) => {
        const p = X(u, v), n = nrm(u, v);
        wingPos.push(p.x, p.y, p.z);
        wingNor.push(n.x, n.y, n.z);
        wingUV.push(u / (2 * Math.PI) + 0.5, v / (2 * V) + 0.5);
    };
    for (let i = 1; i <= NU; i++) for (let j = 0; j <= NV; j++) vert((Math.PI * i) / NU, -V + (j * 2 * V) / NV);
    const at = (i: number, j: number) => ((i - 1) * (NV + 1)) + j;   // i in 1..NU, j in 0..NV
    for (let i = 1; i < NU; i++) for (let j = 0; j < NV; j++) {
        const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
        wingIdx.push(a, b, d, b, c, d);
    }
}
// mirror the wing: (x,y,z) -> (-x, y, -z) — a PROPER rotation about the y-axis
// (det +1), so winding is PRESERVED (no flip — unlike the kuen reflection)
const filmPos: number[] = [...wingPos], filmNor: number[] = [...wingNor],
    filmUV: number[] = [...wingUV], filmIdx: number[] = [...wingIdx];
{
    const n = wingPos.length / 3;
    for (let i = 0; i < n; i++) {
        const k = i * 3;
        filmPos.push(-filmPos[k], filmPos[k + 1], -filmPos[k + 2]);
        filmNor.push(-filmNor[k], filmNor[k + 1], -filmNor[k + 2]);
        filmUV.push(1 - filmUV[i * 2], filmUV[i * 2 + 1]);
    }
    for (const t of wingIdx) filmIdx.push(t + n);          // same winding (rotation)
    // fold-gap sanity: the wings' first strips sit microns apart at u=0
    const g = X((Math.PI / NU) * 1, 0);
    if (Math.hypot(g.x, g.z) > 0.02) throw Error(`fold gap too wide at first strip: ${Math.hypot(g.x, g.z)}`);
    console.log(`film grid: ${filmPos.length / 3} verts / ${filmIdx.length / 3} tris (wing ${NU}x${NV + 1} meshed + rotation-mirror)`);
}

// ---- materials ------------------------------------------------------------------------------------
const boneTex = texMat("ca_bone", [0xd8d2c4, 0xd5cfc0, 0xd2ccbb], { rough: 0.9, scale: 1, weights: [1, 1, 1], cell: 64, seed: 9531 });
boneTex.side = THREE.DoubleSide;               // the vault's under-face reads from below
(boneTex as any).userData = { ...(boneTex as any).userData, texName: "ca_bone", glTFDoubleSide: true };
const ironTex = texMat("ca_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9532 });
const brassTex = texMat("ca_brass", [0xa8823f, 0x9c7838, 0xb28c46], { rough: 0.42, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9534 });
const stoneTex = texMat("ca_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9533 });

const g = new THREE.Group();
{
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(filmPos, 3));
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(filmNor, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(filmUV, 2));
    geom.setIndex(filmIdx.length > 65535 ? new THREE.Uint32BufferAttribute(filmIdx, 1) : new THREE.Uint16BufferAttribute(filmIdx, 1));
    g.add(new THREE.Mesh(geom, boneTex));
}

// ---- hem: ONE closed iron tube on the FULL strip boundary (probe C12 loop law) -----------------------
{
    const pts: THREE.Vector3[] = [];
    const seg = (u0: number, v0: number, u1: number, v1: number, n: number) => {
        for (let i = 0; i < n; i++) pts.push(X(u0 + ((u1 - u0) * i) / n, v0 + ((v1 - v0) * i) / n));
    };
    seg(-Math.PI, V, Math.PI, V, 360); seg(Math.PI, V, Math.PI, -V, 120); seg(Math.PI, -V, -Math.PI, -V, 360); seg(-Math.PI, -V, -Math.PI, V, 120);
    pts.push(pts[0].clone());                                  // close
    let maxStep = 0;
    for (let i = 1; i < pts.length; i++) maxStep = Math.max(maxStep, pts[i].distanceTo(pts[i - 1]));
    if (maxStep > 0.06) throw Error(`hem sampling too coarse: max step ${maxStep.toFixed(3)}`);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 960, 0.028, 8, true), ironTex);
    g.add(tube);
    console.log(`hem: closed tube r 0.028 on the full boundary (${pts.length} samples, max step ${maxStep.toFixed(3)})`);
}

// ---- spine: brass tube on the TRUE cycloid geodesic, crown to crown through the cusp ----------------
{
    const pts: THREE.Vector3[] = [];
    const STEPS = 420;
    for (let i = 0; i <= STEPS; i++) pts.push(X(-Math.PI + (i / STEPS) * 2 * Math.PI, 0));
    // spine endpoints EXACT at the crowns (cycloid meets rim vertex)
    const crownR = X(Math.PI, 0), crownL = X(-Math.PI, 0);
    if (pts[0].distanceTo(crownL) > 1e-9 || pts[pts.length - 1].distanceTo(crownR) > 1e-9)
        throw Error("spine endpoints not at the crowns");
    // the spine rides the film: every point satisfies the cycloid law (z==0)
    for (const p of pts) if (Math.abs(p.z) > 1e-12) throw Error("spine left the z=0 plane");
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false), 420, 0.028, 8, false), brassTex);
    g.add(tube);
    console.log(`spine: brass tube r 0.028 on the cycloid geodesic, crown to crown (y ${(LIFT + S).toFixed(3)} cusp, ${(LIFT + 2 * S).toFixed(3)} crowns)`);
}

// ---- stone drum: the mast-foot socket ----------------------------------------------------------------
const DRUM_R = 0.55, DRUM_TOP = 0.40;
{
    // embed laws: mast bottom 8..13cm under top; ALL film below drum-top sits inside the drum
    const mastBottom = X(0, V);
    const embed = DRUM_TOP - mastBottom.y;
    if (embed < 0.08 || embed > 0.13) throw Error(`mast embed ${embed.toFixed(3)} outside 8..13cm`);
    let worstRho = 0;
    for (let i = 0; i <= 400; i++) for (let j = 0; j <= 200; j++) {
        const u = -Math.PI + (i / 400) * 2 * Math.PI, v = -V + (j / 200) * 2 * V;
        const p = X(u, v);
        if (p.y < DRUM_TOP) worstRho = Math.max(worstRho, Math.hypot(p.x, p.z));
    }
    if (worstRho + 0.028 > DRUM_R - 0.05) throw Error(`film pokes the drum wall: worst rho ${worstRho.toFixed(3)} vs ${DRUM_R}`);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(DRUM_R, DRUM_R + 0.05, DRUM_TOP, 28), stoneTex);
    drum.position.set(0, DRUM_TOP / 2, 0);
    g.add(drum);
    console.log(`drum: stone r ${DRUM_R} h ${DRUM_TOP}; mast bottom embed ${(embed * 100).toFixed(0)}cm; film-below-top worst rho ${worstRho.toFixed(3)} inside`);
}

// ---- the two crown beads (the vault's embers, polish-278 lineage) ------------------------------------
const glowMeshes: THREE.Mesh[] = [];
const BEAD_R = 0.09;
{
    const mk = (name: string, u: number) => {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 14, 12),
            (() => {
                const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
                (m as any).emissive = new THREE.Color(0x9a7030);
                (m as any).emissiveIntensity = 1.0;          // dusk lineage (struct-82 law)
                return m;
            })());
        const p = X(u, 0);
        bead.position.set(p.x, p.y, p.z);                    // seated ON the film at the crown
        bead.name = name;
        glowMeshes.push(bead);
        g.add(bead);
    };
    mk("glow_ca_1", Math.PI);
    mk("glow_ca_2", -Math.PI);
    console.log(`crown beads: r ${BEAD_R} x2 at y ${X(Math.PI, 0).y.toFixed(3)} (cycloid meets the rim vertex)`);
}

// ---- census + envelope/NaN laws ----------------------------------------------------------------------
{
    if (glowMeshes.length !== 2) throw Error(`glow census ${glowMeshes.length} != 2`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.x > 4.9 || sz.z > 3.3) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} over law`);
    const CORNER_TOP = X(Math.PI, 1).y + 0.028;              // rim corner + hem radius
    if (Math.abs(sz.y - CORNER_TOP) > 0.02) throw Error(`height ${sz.y.toFixed(3)} != corner+hem top ${CORNER_TOP.toFixed(3)}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] center x ${((env.min.x + env.max.x) / 2).toFixed(2)} (symmetric), 2 glow KEEPs`);
}

const merged = mergeByMaterial(g, "catalan");
writeFileSync("agents/arthur/assets/village_catalan3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_catalan3.glb`);
