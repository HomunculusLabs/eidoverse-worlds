// mkv3-rhodonea.ts — STRUCTURES LANE struct-198, Round 11 commission R11-23
// THE RHODONEA — Grandi's rose and its circle.
//
// One idea: r = a·cos(7θ), split by material. STONE carries the curve —
// one continuous arc-uniform voussoir ribbon tracing all seven petals in
// a single pass (every petal tip a voussoir joint — the kiss) — plus the
// BOSS COLUMN that carries the rose from grade to its heart. IRON carries
// THE CIRCLE: a ring of radius a centered on the heart, kissed
// TANGENTIALLY by all seven petal tips (r′=0 at every extremum ⟹ tangent
// ⊥ radius — the kiss theorem, proven in the probe). Sole night element:
// one warm bead at the heart, where all seven petals are born. Folly
// class — no walk owed.
//
// Laws honored: texMat lanes (struct-38) — rh_stone/rh_iron; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1
// KEEP (glow_rh_1); ROOT STAYS IDENTITY (struct-188 decode law) — all
// positions authored in FINAL world-local coords (probe's worldPt);
// station walk owned by the probe contract; NaN 0; envelope vs probe.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    CURB_W, CURB_H, CURB_D,
    RIB_SEC_N, RIB_SEC_D, JOINT,
    RING_T, A, YC,
    COL_SEC, COL_TOP, COL_BASE,
    BEAD_R, BEAD_Z,
    worldPt, stationsTheta, TIP_PTS,
    ENVELOPE,
} from "../struct198-probe-rhodonea.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("rh_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 198 });
const ironTex = texMat("rh_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 64 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's worldPt already applies the crown
// rotation and the YC heart lift.

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

// ---- stone curb slab (the ground echo) ------------------------------------------------------------------
{
    const curb = new THREE.Mesh(new THREE.BoxGeometry(CURB_W, CURB_H, CURB_D), stoneTex);
    curb.position.set(0, CURB_H / 2, 0);
    g.add(curb);
    console.log(`curb: ${CURB_W}x${CURB_H}x${CURB_D} — the ground echo of the rose's reach`);
}

// ---- stone boss column (grade → heart) --------------------------------------------------------------------
{
    const col = new THREE.Mesh(new THREE.BoxGeometry(COL_SEC, COL_TOP - COL_BASE, COL_SEC), stoneTex);
    col.position.set(0, (COL_BASE + COL_TOP) / 2, 0);
    g.add(col);
    console.log(`boss column: ${COL_SEC}² × ${(COL_TOP - COL_BASE).toFixed(2)} from ${COL_BASE} to ${COL_TOP.toFixed(2)} — half-boss proud of the heart ${YC}`);
}

// ---- the curve in stone: all seven petals, one continuous ribbon ------------------------------------------
{
    const ts = stationsTheta();
    for (let i = 0; i < ts.length - 1; i++) {
        g.add(voussoir(worldPt(ts[i]), worldPt(ts[i + 1]), RIB_SEC_N, RIB_SEC_D, stoneTex));
    }
    console.log(`curve: ${ts.length - 1} tangent voussoirs ${RIB_SEC_N}x${RIB_SEC_D} — one trace, seven petals, every tip a joint (the kiss)`);
}

// ---- iron: the ring the petals kiss -----------------------------------------------------------------------
{
    // TorusGeometry lies in the XY plane (axis = local z) — exactly the
    // construction plane; centered on the heart.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(A, RING_T, 12, 96), ironTex);
    ring.position.set(0, YC, 0);
    g.add(ring);
    console.log(`ring: r=${A} tube ${RING_T} on the heart (0, ${YC}) — seven tangential kisses, one circle`);
}

// ---- glow bead at the heart (KEEP) --------------------------------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(0, YC, BEAD_Z);   // half-embedded front face, at the heart
    glowGroup.add(bead);
    glowGroup.name = "glow_rh_1";
    g.add(glowGroup);
    console.log(`heart bead: glow_rh_1 r ${BEAD_R} at (0, ${YC}, ${BEAD_Z}) — where all seven petals are born, sole night element`);
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
    // kiss diagnostic: tip ring distances (should all read A)
    const kd = TIP_PTS.map((p) => Math.hypot(p[0], p[1] - YC).toFixed(3)).join("/");
    console.log(`tips on the ring: ${kd} == a ${A}`);
}

const merged = mergeByMaterial(g, "rhodonea");
writeFileSync("agents/arthur/assets/village_rhodonea3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_rhodonea3.glb`);
