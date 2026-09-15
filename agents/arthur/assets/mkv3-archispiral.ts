// mkv3-archispiral.ts — STRUCTURES LANE struct-192, Round 11 commission R11-19
// THE ARCHIMEDEAN SPIRAL — the curve of equal steps.
//
// One idea: r = b·θ — every turn adds the SAME radial step. A stone coil of
// 48 voussoirs (arc-uniform outer zone, winding-capped inner zone — the
// block rhythm grows with the turn) springs from a hub barrel, winds 3.23
// turns to an iron landing mast, rising as fast as it widens (y = base +
// b·θ: the plan projection IS the exact curve). Brass pegs mark Proposition
// 24: the first turn's swept area is exactly 1/3 of its circle, and the
// radius where the swept area reaches its first third. One warm bead caps
// the mast. Folly class, no walk owed.
//
// Laws honored: texMat lanes (struct-38) — as_stone/as_brass/as_iron; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1 KEEP
// (glow_as_1); ROOT STAYS IDENTITY (struct-188 decode law); station walk
// owned by the probe contract; NaN 0; envelope law vs probe contract.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    BASE, SEC, N_VOUS, HUB_R, HUB_H, KERB_R0, KERB_R1, KERB_H, KERB_N,
    PLINTH_R, PLINTH_H, MAST_SEC, MAST_TOP, PEG_R, PEG_H, BEAD_R,
    TURN1_TH, THETA_STAR, R_STAR, AZ_STAR, Y_STAR, MAST_P, END_Y,
    ENVELOPE, plan, yOf, stations3, speed, L_STEP, DTH_CAP,
} from "../struct192-probe-archispiral.ts";

// ---- materials ---------------------------------------------------------------------------------------- 
const stoneTex = texMat("as_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 192 });
const brassTex = texMat("as_brass", [0xbd985c, 0xb0874a, 0xc9a76b], { rough: 0.55, metal: 0.65, scale: 1.2, weights: [3, 1, 1], cell: 24, seed: 73 });
const ironTex = texMat("as_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 63 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): all positions below
// are authored in FINAL world-local coords (polar plan + BASE rise).

// ---- stone plinth disc ----------------------------------------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(PLINTH_R, PLINTH_R, PLINTH_H, 48), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    console.log(`plinth: disc r ${PLINTH_R} x ${PLINTH_H} — the ground`);
}

// ---- hub barrel (the spring) ------------------------------------------------------------------------------
{
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(HUB_R, HUB_R, HUB_H, 24), stoneTex);
    hub.position.set(0, BASE + HUB_H / 2, 0);
    g.add(hub);
    console.log(`hub: barrel r ${HUB_R} h ${HUB_H} on plinth top — the coil springs from inside it`);
}

// ---- kerb ring (48 tangent boxes, solid) ---------------------------------------------------------------------
{
    const rMid = (KERB_R0 + KERB_R1) / 2;
    const arc = (2 * Math.PI * rMid) / KERB_N;
    const box = new THREE.BoxGeometry(arc + 0.006, KERB_H, KERB_R1 - KERB_R0);
    for (let i = 0; i < KERB_N; i++) {
        const az = (i / KERB_N) * 2 * Math.PI;
        const m = new THREE.Mesh(box, stoneTex);
        m.position.set(rMid * Math.cos(az), BASE + KERB_H / 2, rMid * Math.sin(az));
        // Ry(theta) maps +x -> (cos th, -sin th) in (x,z); the tangent at az is
        // (-sin az, cos az), so theta = -az + pi/2 maps the long axis EXACTLY
        // onto it (+az+pi/2 misrotates by 2*az — decode-caught, corner verts
        // swung to r 2.04). Cross-section corners then reach
        // sqrt((rMid+d/2)^2 + (len/2)^2) by design (chord boxes).
        m.rotation.y = -az + Math.PI / 2;
        g.add(m);
    }
    console.log(`kerb: ${KERB_N} tangent boxes r ${KERB_R0}..${KERB_R1} h ${KERB_H} — the coil's outer chart edge, solid`);
}

// ---- the spiral coil: tangent voussoirs on the station walk ------------------------------------------------
{
    const st = stations3();
    if (st.length - 1 !== N_VOUS) throw Error(`station census ${st.length - 1} != ${N_VOUS}`);
    const xAxis = new THREE.Vector3(1, 0, 0);
    let nOuter = 0, nCapped = 0;
    for (let j = 0; j < st.length - 1; j++) {
        const a = st[j].p, b = st[j + 1].p;
        const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        const len = dir.length();
        const voussoir = new THREE.Mesh(new THREE.BoxGeometry(len + 0.006, SEC, SEC), stoneTex);
        voussoir.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
        voussoir.quaternion.setFromUnitVectors(xAxis, dir.clone().normalize());
        g.add(voussoir);
        if (st[j + 1].th - st[j].th >= DTH_CAP - 1e-9) nCapped++; else nOuter++;
    }
    console.log(`coil: ${N_VOUS} tangent voussoirs ${SEC}x${SEC} (${nOuter} arc-uniform @ ${L_STEP}m + ${nCapped} capped @ ${DTH_CAP}rad) — r = b*theta, 3.23 turns, rising as it widens to y ${END_Y.toFixed(3)}`);
}

// ---- iron landing mast ----------------------------------------------------------------------------------------
{
    const mast = new THREE.Mesh(new THREE.BoxGeometry(MAST_SEC, MAST_TOP - BASE, MAST_SEC), ironTex);
    mast.position.set(MAST_P[0], (BASE + MAST_TOP) / 2, MAST_P[1]);
    g.add(mast);
    console.log(`mast: iron ${MAST_SEC} sq plinth-top->${MAST_TOP} at plan r ${Math.hypot(MAST_P[0], MAST_P[1]).toFixed(3)} — the coil ends in iron`);
}

// ---- brass theorem pegs -------------------------------------------------------------------------------------------
{
    const peg1P = plan(TURN1_TH);
    const peg1 = new THREE.Mesh(new THREE.CylinderGeometry(PEG_R, PEG_R, PEG_H, 12), brassTex);
    peg1.position.set(peg1P[0], yOf(TURN1_TH), peg1P[1]);
    g.add(peg1);
    const peg2 = new THREE.Mesh(new THREE.CylinderGeometry(PEG_R, PEG_R, PEG_H, 12), brassTex);
    peg2.position.set(R_STAR * Math.cos(AZ_STAR), Y_STAR, R_STAR * Math.sin(AZ_STAR));
    g.add(peg2);
    console.log(`pegs: brass r ${PEG_R} h ${PEG_H} — #1 at theta=2pi (first turn closes; its swept area is exactly 1/3 of its circle), #2 at theta* (first third of total area)`);
}

// ---- glow bead on the mast cap (KEEP) -------------------------------------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(MAST_P[0], MAST_TOP, MAST_P[1]);   // half-seated on the mast cap
    glowGroup.add(bead);
    glowGroup.name = "glow_as_1";
    g.add(glowGroup);
    console.log(`mast bead: glow_as_1 r ${BEAD_R} at (${MAST_P[0].toFixed(4)}, ${MAST_TOP}, ${MAST_P[1].toFixed(4)}) — the spiral's end, sole night element`);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------------------------
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

const merged = mergeByMaterial(g, "archispiral");
writeFileSync("agents/arthur/assets/village_archispiral3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_archispiral3.glb`);
