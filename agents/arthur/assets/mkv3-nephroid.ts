// mkv3-nephroid.ts — STRUCTURES LANE struct-194, Round 11 commission R11-20
// THE NEPHROID — the cup caustic.
//
// One idea: light enters a semicircular cup and the nephroid appears.
// A stone cup (16 arc-uniform voussoirs, R=2.0, vertical panel) faces an
// iron light-post west of it; five iron rays (frozen incident + reflected
// segments, true specular algebra) enter the cup; and their envelope —
// THE NEPHROID x = a(3cos t − cos 3t), y = a(3sin t − sin 3t), a = R/4 —
// stands inside as a stone ribbon of 16 voussoirs (two half-chains sharing
// the exact cusp, arc-uniform 0.40 with a 0.16 cusp cap and 0.44 rim
// remainder). Cusp at (R/2, 0) carries the sole warm bead (half-embedded
// front face, struct-52/188 occlusion-cure law): at night the caustic's
// sharp point burns. Folly class, no walk owed.
//
// Laws honored: texMat lanes (struct-38) — ns_stone/ns_iron; bead emissive
// 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1 KEEP
// (glow_ns_1); ROOT STAYS IDENTITY (struct-188 decode law) — all positions
// authored in FINAL world-local coords (curve frame x, y+YC, z depth);
// station walk owned by the probe contract; NaN 0; envelope vs probe.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    R, YC, XC, PLINTH_W, PLINTH_H, PLINTH_D,
    ARC_SEC_N, ARC_SEC_D, POST_X, POST_SEC, POST_TOP,
    BEAM_SEC_T, BEAM_SEC_D, BEAM_Y, BEAM_HALF,
    NEPH_SEC_N, NEPH_SEC_D, BEAD_R, BEAD_Z,
    RAY_KS, RAY_SEC, OVER, ENVELOPE,
    arcP, dRefl, tContact, neph, halfStations, arcStations,
} from "../struct194-probe-nephroid.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("ns_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 194 });
const ironTex = texMat("ns_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 64 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): the panel is the
// world XY plane; curve frame (x, y) -> world (x, y + YC, 0).

// planar voussoir helper: chord box in the XY plane, thickness local-y,
// depth local-z (extruded toward the viewer)
function voussoir(
    a: [number, number], b: [number, number],
    secN: number, secD: number, mat: THREE.Material,
): THREE.Mesh {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len + 0.006, secN, secD), mat);
    m.position.set((a[0] + b[0]) / 2, YC + (a[1] + b[1]) / 2, 0);
    m.rotation.z = Math.atan2(dy, dx);
    return m;
}
const lift = (p: [number, number]): [number, number] => [p[0], p[1] + YC];

// ---- stone plinth slab ---------------------------------------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PLINTH_W, PLINTH_H, PLINTH_D), stoneTex);
    plinth.position.set(XC, PLINTH_H / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${PLINTH_W}x${PLINTH_H}x${PLINTH_D} — the ground`);
}

// ---- the cup: 16 arc-uniform tangent voussoirs over the semicircle --------------------------------------
{
    const phis = arcStations();
    for (let i = 0; i < phis.length - 1; i++) {
        g.add(voussoir(arcP(phis[i]), arcP(phis[i + 1]), ARC_SEC_N, ARC_SEC_D, stoneTex));
    }
    console.log(`cup arc: ${phis.length - 1} tangent voussoirs ${ARC_SEC_N}x${ARC_SEC_D} over the semicircle R=${R} — the vessel that catches the light`);
}

// ---- iron light-post + top beam (the lintel course) ------------------------------------------------------
{
    const post = new THREE.Mesh(new THREE.BoxGeometry(POST_SEC, POST_TOP - 0.12, POST_SEC), ironTex);
    post.position.set(POST_X, (POST_TOP + 0.12) / 2, 0);
    g.add(post);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2 * BEAM_HALF, BEAM_SEC_T, BEAM_SEC_D), ironTex);
    beam.position.set(POST_X + BEAM_HALF, BEAM_Y, 0);
    g.add(beam);
    console.log(`post: iron ${POST_SEC} sq 0.12->${POST_TOP} at x ${POST_X}; beam ${2 * BEAM_HALF}m seats on post top, east end embeds the arc's rim voussoir — the lintel course`);
}

// ---- the nephroid: 16 voussoirs, two half-chains sharing the exact cusp ----------------------------------
{
    let n = 0;
    for (const sign of [1, -1] as const) {
        const ts = halfStations(sign);
        for (let i = 0; i < ts.length - 1; i++) {
            g.add(voussoir(neph(ts[i]), neph(ts[i + 1]), NEPH_SEC_N, NEPH_SEC_D, stoneTex));
            n++;
        }
    }
    console.log(`nephroid: ${n} tangent voussoirs ${NEPH_SEC_N}x${NEPH_SEC_D} — a = R/4 = ${R / 4}, cusp at (R/2, 0), rim endpoints shared with the cup — the caustic, standing`);
}

// ---- five iron rays: incident + reflected segments (true specular algebra) --------------------------------
{
    const postFace = POST_X + POST_SEC / 2;
    for (const k of RAY_KS) {
        const phi = Math.asin(k / R);
        const P = arcP(phi);
        // incident: horizontal from post face to arc hit
        const inc = new THREE.Mesh(new THREE.BoxGeometry(P[0] - postFace + 0.01, RAY_SEC, RAY_SEC), ironTex);
        inc.position.set((postFace + P[0]) / 2, YC + k, 0);
        g.add(inc);
        // reflected: along d'(phi), from P to contact + OVER
        const d = dRefl(phi), tc = tContact(phi);
        const far: [number, number] = [P[0] + (tc + OVER) * d[0], P[1] + (tc + OVER) * d[1]];
        g.add(voussoir(P, far, RAY_SEC, RAY_SEC, ironTex));
    }
    console.log(`rays: ${RAY_KS.length} iron incident+reflected pairs (k = ${RAY_KS.join(", ")}) — each reflection obeys the arc's true normal; the envelope of the reflected family IS the ribbon`);
}

// ---- glow bead at the cusp (KEEP) -------------------------------------------------------------------------
const glowGroup = new THREE.Group();
{
    const cusp = neph(0);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(cusp[0], YC + cusp[1], BEAD_Z);   // half-embedded front face
    glowGroup.add(bead);
    glowGroup.name = "glow_ns_1";
    g.add(glowGroup);
    console.log(`cusp bead: glow_ns_1 r ${BEAD_R} at (${cusp[0].toFixed(4)}, ${(YC + cusp[1]).toFixed(4)}, ${BEAD_Z}) — the caustic's sharp point, sole night element`);
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
}

const merged = mergeByMaterial(g, "nephroid");
writeFileSync("agents/arthur/assets/village_nephroid3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_nephroid3.glb`);
