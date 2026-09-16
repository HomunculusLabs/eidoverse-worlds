// mkv3-folium.ts — STRUCTURES LANE struct-196, Round 11 commission R11-21
// THE FOLIUM OF DESCARTES — the leaf and its vanishing line.
//
// One idea: x³ + y³ = 3axy, split by material. STONE carries the curve —
// one continuous voussoir ribbon from the arm tip, through the node X,
// around the closed leaf loop, back through the node, out to the mirror
// arm tip (arc-uniform 0.30, node caps 0.14; the winding-cap class). IRON
// carries the ASYMPTOTE x+y+a=0 — a level rail on three posts; the arms
// die in the air 130mm above it, never touching: the asymptote's whole
// meaning. The curve's diagonal is the world vertical: the node X sits at
// eye height, the leaf rides above it, the arms fall away below. Sole
// night element: one warm bead at the node (the X itself). Folly class.
//
// Laws honored: texMat lanes (struct-38) — fs_stone/fs_iron; bead emissive
// 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1 KEEP
// (glow_fs_1); ROOT STAYS IDENTITY (struct-188 decode law) — all
// positions authored in FINAL world-local coords (probe's worldPt);
// station walk owned by the probe contract; NaN 0; envelope vs probe.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    CURB_W, CURB_H, CURB_D,
    RIB_SEC_N, RIB_SEC_D, JOINT,
    RAIL_SEC, RAIL_HALF, RAIL_Y,
    POST_SEC, POST_TOP_C, POST_TOP_O, POST_OUT, POST_BASE,
    BEAD_R, BEAD_Z, YC,
    worldPt, loopStations, armStations, TIP, TIP_MIR,
    ENVELOPE,
} from "../struct196-probe-folium.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("fs_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 196 });
const ironTex = texMat("fs_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 64 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's worldPt already applies the diagonal
// rotation and the YC lift.

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

// ---- stone curb slab (the level echo at grade) ----------------------------------------------------------
{
    const curb = new THREE.Mesh(new THREE.BoxGeometry(CURB_W, CURB_H, CURB_D), stoneTex);
    curb.position.set(0, CURB_H / 2, 0);
    g.add(curb);
    console.log(`curb: ${CURB_W}x${CURB_H}x${CURB_D} — the level echo of the asymptote at grade`);
}

// ---- the curve in stone: loop + both arms (one continuous ribbon idea) ----------------------------------
{
    let n = 0;
    // leaf loop: node → around → node
    const lts = loopStations();
    for (let i = 0; i < lts.length - 1; i++) {
        g.add(voussoir(worldPt(lts[i]), worldPt(lts[i + 1]), RIB_SEC_N, RIB_SEC_D, stoneTex));
        n++;
    }
    // arms: node → tip, and mirror
    const ats = armStations();
    for (let i = 0; i < ats.length - 1; i++) {
        const p1 = worldPt(ats[i]), p2 = worldPt(ats[i + 1]);
        g.add(voussoir(p1, p2, RIB_SEC_N, RIB_SEC_D, stoneTex));
        g.add(voussoir([-p1[0], p1[1]], [-p2[0], p2[1]], RIB_SEC_N, RIB_SEC_D, stoneTex));
        n += 2;
    }
    console.log(`curve: ${n} tangent voussoirs ${RIB_SEC_N}x${RIB_SEC_D} — loop (t 0→${lts[lts.length - 1]}), arms to t=${ats[ats.length - 1].toFixed(4)} + mirror; the leaf and its two escapes`);
}

// ---- iron: the asymptote rail on three posts ------------------------------------------------------------
{
    // rail: the level line y = RAIL_Y (= YC − a/√2 — x+y+a=0 exactly)
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2 * RAIL_HALF, RAIL_SEC, RAIL_SEC), ironTex);
    rail.position.set(0, RAIL_Y, 0);
    g.add(rail);
    // center post: rises through the rail to the node itself
    const postC = new THREE.Mesh(new THREE.BoxGeometry(POST_SEC, POST_TOP_C - POST_BASE, POST_SEC), ironTex);
    postC.position.set(0, (POST_BASE + POST_TOP_C) / 2, 0);
    g.add(postC);
    // outboard posts: rail seats ON their tops
    for (const s of [1, -1] as const) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(POST_SEC, POST_TOP_O - POST_BASE, POST_SEC), ironTex);
        post.position.set(s * POST_OUT, (POST_BASE + POST_TOP_O) / 2, 0);
        g.add(post);
    }
    console.log(`asymptote: level rail y=${RAIL_Y.toFixed(4)} (x+y+a=0), ±${RAIL_HALF} on three posts (center rises to the node ${YC}); arm tips stop ${''}above the line — approach without contact`);
}

// ---- glow bead at the node (KEEP) -------------------------------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(0, YC, BEAD_Z);   // half-embedded front face, at the X
    glowGroup.add(bead);
    glowGroup.name = "glow_fs_1";
    g.add(glowGroup);
    console.log(`node bead: glow_fs_1 r ${BEAD_R} at (0, ${YC}, ${BEAD_Z}) — the crossing itself, sole night element`);
}

// ---- census + envelope/NaN laws ----------------------------------------------------------------------------
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
    // grounding echo: tip positions (diagnostic)
    console.log(`tips: (${TIP[0].toFixed(3)}, ${TIP[1].toFixed(3)}) / (${TIP_MIR[0].toFixed(3)}, ${TIP_MIR[1].toFixed(3)}) — both above the rail ${RAIL_Y.toFixed(3)}`);
}

const merged = mergeByMaterial(g, "folium");
writeFileSync("agents/arthur/assets/village_folium3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_folium3.glb`);
