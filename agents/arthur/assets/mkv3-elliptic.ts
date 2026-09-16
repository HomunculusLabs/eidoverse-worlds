// mkv3-elliptic.ts — STRUCTURES LANE struct-202, Round 11 commission R11-25
// THE ELLIPTIC CURVE — the oval, the wing, and the hidden third point.
//
// One idea: y² = x³ − x, split by material. STONE carries the curve — the
// plinth plus both real components: a bounded OVAL (x ∈ [−1,0]) and an
// unbounded WING (x ≥ 1), truncated mid-flight at the top and socketed
// into the plinth at the tail. IRON carries THE LINE — the x-axis as a
// rod on two posts, piercing the ribbon at exactly the three roots
// (−1,0),(0,0),(1,0) — the 2-torsion, each pierce dressed with a
// dark-brass collar — plus THE CHORD ROD, welded at R (oval neck) and Q
// (wing), crossing the datum rod exactly at the line's x-intercept. The
// line through R and Q strikes the curve a THIRD time at P on the oval's
// low flank — BEHIND the rod's end, un-welded, marked only by the sole
// night bead. Sighting along the rod finds the bead dead on its axis:
// the hidden third point, found by arithmetic (Vieta: x_P+x_Q+x_R = m²).
// Folly class — no walk owed.
//
// Laws honored: texMat lanes (struct-38) — el_stone/el_iron/el_brass;
// bead emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census
// exactly 1 KEEP (glow_el_1); ROOT STAYS IDENTITY (struct-188 decode
// law) — all positions authored in FINAL world-local coords (the probe's
// worldPt); station walk owned by the probe contract; NaN 0; envelope
// vs probe.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    PLINTH_W, PLINTH_H, PLINTH_D,
    RIB_N, RIB_D, JOINT,
    POST_X, POST_S, POST_EMBED, POST_TOP, ROD_R, ROD_XL, ROD_XR,
    COLLAR_R, COLLAR_L, BEAD_R, BEAD_Z,
    ARCS, arcWorldPts, worldPt, worldRootX, ROOTS,
    P_M, CHORD_A, CHORD_B, ENVELOPE,
} from "../struct202-probe-elliptic.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("el_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 202 });
const ironTex = texMat("el_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 66 });
const brassTex = texMat("el_brass", [0x8a6a3a, 0x7a5c30, 0x9a7a46], { rough: 0.55, metal: 0.6, scale: 1.2, weights: [3, 1, 1], cell: 16, seed: 67 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's worldPt already applies the datum lift.

// world-frame voussoir helper: chord box in the world XY plane, thickness
// local-y, depth local-z
function voussoir(
    a: [number, number], b: [number, number],
    secN: number, secD: number, mat: THREE.Material,
): THREE.Mesh {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len + JOINT, secN, secD), mat);
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0);
    m.rotation.z = Math.atan2(dy, dx);
    return m;
}

// ---- stone plinth (the wing is born from it) ----------------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PLINTH_W, PLINTH_H, PLINTH_D), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${PLINTH_W}x${PLINTH_H}x${PLINTH_D} — the datum mass; the wing's tail sockets into it`);
}

// ---- the curve in stone: oval + wing, one continuous ribbon each --------------------------------------
{
    let ribs = 0;
    for (const a of ARCS) {
        const pts = arcWorldPts(a);
        for (let i = 0; i < pts.length - 1; i++) {
            g.add(voussoir(pts[i], pts[i + 1], RIB_N, RIB_D, stoneTex));
            ribs++;
        }
    }
    console.log(`curve: ${ribs} tangent voussoirs ${RIB_N}x${RIB_D} — the oval (closed loop, floats at the datum) + the wing (tail socketed, tip cut mid-flight)`);
}

// ---- iron: the gantry, the line of reals, the chord rod ----------------------------------------------
{
    const DATUM_Y = worldPt(0, 0)[1];       // the x-axis' world height (probe-derived, no drift possible)
    // posts
    const base = PLINTH_H - POST_EMBED;
    for (const sx of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(POST_S, POST_TOP - base, POST_S), ironTex);
        post.position.set(sx * POST_X, (base + POST_TOP) / 2, 0);
        g.add(post);
    }
    // datum rod (the x-axis): cylinder along world x, centered x=0 at DATUM_Y
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(ROD_R, ROD_R, ROD_XR - ROD_XL, 16), ironTex);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, DATUM_Y, 0);
    g.add(rod);
    console.log(`gantry: posts ∓${POST_X} (embed ${POST_EMBED}, top ${POST_TOP.toFixed(3)} swallows the rod); datum rod r=${ROD_R} at y=${DATUM_Y.toFixed(4)} — the line of reals made steel`);
}

// ---- iron: the chord rod (R → Q + extension) ------------------------------------------------------------
{
    const dx = CHORD_B[0] - CHORD_A[0], dy = CHORD_B[1] - CHORD_A[1];
    const len = Math.hypot(dx, dy);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(ROD_R, ROD_R, len, 16), ironTex);
    rod.position.set((CHORD_A[0] + CHORD_B[0]) / 2, (CHORD_A[1] + CHORD_B[1]) / 2, 0);
    rod.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
    g.add(rod);
    console.log(`chord rod: r=${ROD_R} len ${len.toFixed(3)} from R to Q+${0.25} — the straight line that does arithmetic; crosses the datum rod at the x-intercept (welded)`);
}

// ---- brass: the three root collars ----------------------------------------------------------------------
{
    for (const r of ROOTS) {
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(COLLAR_R, COLLAR_R, COLLAR_L, 14), brassTex);
        collar.rotation.z = Math.PI / 2;
        collar.position.set(worldRootX(r), worldPt(0, 0)[1], 0);
        g.add(collar);
    }
    console.log(`collars: 3 dark-brass at the root pierces (world x ${ROOTS.map(r => worldRootX(r).toFixed(3)).join(", ")}) — the 2-torsion, pinned`);
}

// ---- glow bead at P (KEEP) — the hidden third point -----------------------------------------------------
const glowGroup = new THREE.Group();
{
    const pw = worldPt(P_M[0], P_M[1]);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(pw[0], pw[1], BEAD_Z);   // half-proud of the ribbon front face, ON THE ROD'S LINE
    glowGroup.add(bead);
    glowGroup.name = "glow_el_1";
    g.add(glowGroup);
    console.log(`bead: glow_el_1 r ${BEAD_R} at (${pw[0].toFixed(3)}, ${pw[1].toFixed(3)}, ${BEAD_Z}) — P, the hidden third point, sole night element`);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------------------
g.updateMatrixWorld(true);
{
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
    if (dErr > 0.001) throw Error(`envelope drift ${dErr.toFixed(4)} vs probe contract (mk ${sz.x.toFixed(3)}x${sz.y.toFixed(3)}x${sz.z.toFixed(3)} vs probe ${wsz.x.toFixed(3)}x${wsz.y.toFixed(3)}x${wsz.z.toFixed(3)})`);
    if (Math.abs(env.min.x + env.max.x) > 0.01 || Math.abs(env.min.z + env.max.z) > 0.01)
        throw Error(`envelope not origin-centered: x[${env.min.x.toFixed(3)},${env.max.x.toFixed(3)}] z[${env.min.z.toFixed(3)},${env.max.z.toFixed(3)}]`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o) => (o as THREE.Mesh).isMesh).length;
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] == probe contract, pre-merge meshes ${meshes} + 1 glow KEEP group`);
}
const merged = mergeByMaterial(g, "elliptic");
writeFileSync("agents/arthur/assets/village_elliptic3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_elliptic3.glb`);
