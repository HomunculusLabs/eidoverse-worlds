// mkv3-nodoid.ts — STRUCTURES LANE struct-241, Round 11 commission R11-54.
// THE NODOID — Delaunay 1841's fourth and last roulette. Form-ledger grep
// fresh this tick: nodoid 0/0/0 across STRUCTURES-PLAN + IMPROVEMENTS +
// IMPROVE-PLAN. The CMC-of-revolution family closes: sphere/cylinder (e=0),
// UNDULOID (0<e<1, R11-4 Stoup), CATENOID (e=1, struct-102) stand; the
// e>1 branch was absent.
//
// ONE IDEA: THE BEADS THAT PASS THROUGH EACH OTHER. The unduloid Stoup is a
// chain of beads that never touch; its hyperbolic sibling — same ODE, c<0 —
// does the impossible thing: at each neck the meridian's tangent REVERSES,
// the profile folds back THROUGH ITSELF, and every bead pierces its two
// neighbors (2 crossing circles per pair, mid-flank). e=2.5 is the
// measurement-pinned THRESHOLD — the least eccentric nodoid that truly
// self-penetrates (sweep table in struct241-probe-nodoid.ts).
//
// V2 (closeface falsification, same tick — struct-239 v1->v2 class): v1
// carried ONE brass lane; the piercing read as pinched necks between
// separate beads (an opaque same-material surface of revolution hides its
// own interior crossings — the tangent-circle contact sits exactly at the
// crossing y, so silhouette shows contact, not passage), and the base read
// as a butt joint. Cures, both MATERIAL/SEAT truth not re-modeling:
//   (a) STROKE-SPLIT MATERIALIZATION: the nodoid meridian is two kinds of
//       stroke — ADVANCE strokes (the beads, cos(th) >= 0) and RETREAT
//       strokes (the loops that pass through the beads, cos(th) < 0). v2
//       lathes them as separate meshes in two lanes: bright brass beads,
//       dark iron loops. Every crossing is now a crisp occlusion boundary
//       between MATERIALS — the eye reads the loop disappearing INTO the
//       bead and re-emerging below it: THE PASSAGE MADE VISIBLE.
//   (b) FLUSH SEAT: the bottom bulge's EQUATOR sits exactly at the upper
//       dais rim (BULGE0_Y = DAIS_TOP): a hemisphere rising out of stone
//       with a visible intersection circle — stone cuts bead, no joint.
//
// PRESENTATION: a vertical column of 11 bright-brass beads rising 2.64m from
// a two-tier stone dais, each passing through its neighbors on dark iron
// loops, crown bead swallowing the open top ring. Night: one warm bead at
// the crown (dusk lineage, sole night element).
//
// LAWS HONORED (struct-121+ lineage):
// - ROOT STAYS IDENTITY (struct-188): positions are FINAL world-local.
// - texMat lanes (struct-38): nd_stone, nd_brass (tensegrity v6 bright-brass
//   lane 0xCEAE54/0xBE9A47/0xE1BE68 metal 0.9), nd_iron (screwwell dark
//   iron family 0x6a6a74 metal 0.5).
// - Bead emissive 0x9a7030 @ 0.85 in-GLB, glow census exactly 1 KEEP
//   (glow_nd_1) — struct-82 dusk lineage.
// - Embed laws: bottom strokes embed 0.132m into the upper dais tier; the
//   crown bead (r 0.36) swallows the top reversal ring (r 0.309) whole.
// - Envelope pinned to the probe contract by throws; y-min 0 on grade;
//   NaN 0; node budget 4 (stone + brass beads + iron loops + glow KEEP).
// Folly class — no entry advertised, no walk owed (zeno..ico precedent).
// Deterministic: RK4-fixed integration + seeded texMat only.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    ENVELOPE, buildWorldMeridian,
    DAIS_H_LOWER, DAIS_R_LOWER, DAIS_H_UPPER, DAIS_R_UPPER, DAIS_TOP,
    BEAD_R, TOP_RING_Y, PERIODS,
} from "../struct241-probe-nodoid.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("nd_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9641 });
const brassTex = texMat("nd_brass", [0xceae54, 0xbe9a47, 0xe1be68], { rough: 0.38, metal: 0.9, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9642 });
// v2: the loops' own lane — dark iron (screwwell's family), so every bead-loop crossing
// is a material boundary: the eye reads the loop disappearing INTO the bead.
const ironTex = texMat("nd_iron", [0x6a6a74, 0x747480, 0x5e5e68], { rough: 0.55, metal: 0.5, scale: 1.6, weights: [1, 1, 1], cell: 24, seed: 9643 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 0.85;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188): every position below is FINAL world-local.

// ---- the pierced bead column — per-BEAD lathes, alternating materials (v3 period-parity split) -----------
{
    const mer = buildWorldMeridian();
    const STROKE_STRIDE = 40;   // per-bead sample stride (ds 0.002*40 = 8mm world; chord error 0.045mm)
    const mkLathes = (lane: number, mat: THREE.Material, label: string) => {
        // runs of consecutive samples in this lane (each run = one bead, cut at its neck rings)
        const runs: { y: number; rho: number }[][] = [];
        let cur: { y: number; rho: number }[] = [];
        for (const p of mer) {
            if (p.lane === lane) cur.push({ y: p.y, rho: p.rho });
            else if (cur.length) { runs.push(cur); cur = []; }
        }
        if (cur.length) runs.push(cur);
        const meshes: THREE.Mesh[] = [];
        for (const run of runs) {
            const pts: THREE.Vector2[] = [];
            for (let i = 0; i < run.length; i += STROKE_STRIDE) pts.push(new THREE.Vector2(Math.max(run[i].rho, 0.01), run[i].y));
            const lastP = run[run.length - 1];
            if ((run.length - 1) % STROKE_STRIDE !== 0) pts.push(new THREE.Vector2(Math.max(lastP.rho, 0.01), lastP.y));
            if (pts.length < 4) throw Error(`${label}: bead run with only ${pts.length} pts`);
            meshes.push(new THREE.Mesh(new THREE.LatheGeometry(pts, 48), mat));
        }
        if (!runs.length) throw Error(`${label}: no runs`);
        return meshes;
    };
    const brassBeads = mkLathes(0, brassTex, "brass beads");
    const ironBeads = mkLathes(1, ironTex, "iron beads");
    for (const m of brassBeads) g.add(m);
    for (const m of ironBeads) g.add(m);
    console.log(`column: ${brassBeads.length} bright-brass + ${ironBeads.length} dark-iron beads, each lathed neck-ring to neck-ring (stride ${STROKE_STRIDE}) — every crossing a brass/iron boundary at the bead flank: THE PASSAGE MADE VISIBLE (v3 period-parity; v2 stroke-split falsified: both crossing circles are within-stroke-class)`);
}

// ---- the two-tier stone dais (round; 48-gon prism, SAT-exact at placement) ------------------------------
{
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(DAIS_R_LOWER, DAIS_R_LOWER, DAIS_H_LOWER, 48), stoneTex);
    lower.position.y = DAIS_H_LOWER / 2;
    g.add(lower);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(DAIS_R_UPPER, DAIS_R_UPPER, DAIS_H_UPPER, 48), stoneTex);
    upper.position.y = DAIS_H_LOWER + DAIS_H_UPPER / 2;
    g.add(upper);
    console.log(`dais: two tiers ${DAIS_R_LOWER}/${DAIS_R_UPPER} r, h ${DAIS_TOP} — the bottom bead's EQUATOR sits flush at the rim: a hemisphere rising out of stone`);
}

// ---- the crown bead — the drop that crowns the column (KEEP glow) --------------------------------------
const glowMeshes: THREE.Mesh[] = [];
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(0, TOP_RING_Y, 0);
    bead.name = "glow_nd_1";
    glowMeshes.push(bead);
    g.add(bead);
    console.log(`crown bead: glow_nd_1 r${BEAD_R} at y ${TOP_RING_Y.toFixed(3)} — swallows the open top ring (r 0.309) whole; sole night element`);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const want = new THREE.Box3(
        new THREE.Vector3().fromArray(ENVELOPE.min),
        new THREE.Vector3().fromArray(ENVELOPE.max));
    const wsz = want.getSize(new THREE.Vector3());
    const dErr = Math.max(
        Math.abs(env.min.x - want.min.x), Math.abs(env.max.x - want.max.x),
        Math.abs(env.min.y - want.min.y), Math.abs(env.max.y - want.max.y),
        Math.abs(env.min.z - want.min.z), Math.abs(env.max.z - want.max.z));
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (dErr > 0.002) throw Error(`envelope drift ${dErr.toFixed(4)} vs probe contract (mk ${sz.x.toFixed(3)}x${sz.y.toFixed(3)}x${sz.z.toFixed(3)} vs probe ${wsz.x.toFixed(3)}x${wsz.y.toFixed(3)}x${wsz.z.toFixed(3)})`);
    if (Math.abs(env.min.x + env.max.x) > 0.01 || Math.abs(env.min.z + env.max.z) > 0.01) throw Error("not x/z centered");
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o: any) => (o as THREE.Mesh).isMesh).length;
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] == probe contract; pre-merge meshes ${meshes} + 1 glow KEEP`);
}

const merged = mergeByMaterial(g, "nodoid");
writeFileSync("agents/arthur/assets/village_nodoid3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_nodoid3.glb`);
