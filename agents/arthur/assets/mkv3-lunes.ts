// mkv3-lunes.ts — STRUCTURES LANE struct-212, Round 11 commission R11-31
// HIPPOCRATES' LUNES — the first quadrature: two crescents that together
// equal a triangle.
//
// One idea: CURVED EQUALS STRAIGHT. STONE carries the right-isosceles
// triangle — stepped voussoir courses rising from a long curb to an apex
// needle where five curves converge. BRASS carries the two lunes — stepped
// crescent courses in the SAME masonry rhythm as the triangle (same
// courses, different metal: the 440 BC equality made material). IRON
// carries the Thales arc riding B-over-T-to-C — the sky compass that
// inscribes the triangle — and the B/C compass-foot pins. Sole night
// element: one warm bead at T, where both leg arcs, the Thales arc, and
// both triangle edges meet (s363 sole-bead law).
//
// Laws honored: texMat lanes (struct-38) — lu_stone/lu_iron/lu_brass; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1
// KEEP (glow_lu_1); ROOT STAYS IDENTITY (struct-188) — positions are
// FINAL world-local (the probe's worldPt); envelope vs probe; NaN 0.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    PLINTH_L, PLINTH_H, PLINTH_D, DEPTH, ARC_TUBE, PIN_R, BEAD_R, RT,
    TRI, TRI_APEX, LUNE_L, LUNE_R, T_W, B_W, C_W, ENVELOPE, Y0, EMBED,
} from "../struct212-probe-lunes.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("lu_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 212 });
const ironTex = texMat("lu_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 72 });
const brassTex = texMat("lu_brass", [0x8a6a3a, 0x7a5c30, 0x9a7a46], { rough: 0.55, metal: 0.6, scale: 1.2, weights: [3, 1, 1], cell: 16, seed: 73 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below
// is FINAL world-local — the probe's worldPt already applies the datum lift.

// tube from P to Q (the lane's tangent-segment register: curve by turning)
function tube(P: [number, number, number], Q: [number, number, number], r: number, mat: THREE.Material): THREE.Mesh {
    const A = new THREE.Vector3(...P), B = new THREE.Vector3(...Q);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.sub(A).normalize());
    return m;
}

// ---- stone curb plinth ------------------------------------------------------------------------------
{
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PLINTH_L, PLINTH_H, PLINTH_D), stoneTex);
    plinth.position.set(0, PLINTH_H / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${PLINTH_L.toFixed(3)}x${PLINTH_H}x${PLINTH_D} — the long curb; the triangle base + crescent horns seat 8cm into its top`);
}

// ---- stone: the right-isosceles triangle (stepped courses + apex needle) ----------------------------
{
    for (const v of TRI) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(v.x1 - v.x0, v.yTop - v.y, DEPTH), stoneTex);
        m.position.set((v.x0 + v.x1) / 2, (v.y + v.yTop) / 2 + Y0 - EMBED, 0);
        g.add(m);
    }
    const a = TRI_APEX!;
    const apex = new THREE.Mesh(new THREE.BoxGeometry(a.x1 - a.x0, a.yTop - a.y, DEPTH), stoneTex);
    apex.position.set(0, (a.y + a.yTop) / 2 + Y0 - EMBED, 0);
    g.add(apex);
    console.log(`triangle: ${TRI.length} voussoirs in stepped courses + the apex needle (top ${(a.yTop + Y0 - EMBED).toFixed(3)} m, width ${(a.x1 - a.x0).toFixed(3)} — the right angle at T where five curves converge)`);
}

// ---- brass: the two lunes (same course rhythm as the triangle) ---------------------------------------
{
    for (const [name, L] of [["left", LUNE_L], ["right", LUNE_R]] as const) {
        for (const v of L) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(v.x1 - v.x0, v.yTop - v.y, DEPTH), brassTex);
            m.position.set((v.x0 + v.x1) / 2, (v.y + v.yTop) / 2 + Y0 - EMBED, 0);
            g.add(m);
        }
        console.log(`lune ${name}: ${L.length} voussoirs in stepped crescent courses — the region between the leg arc and the Thales arc, brass where the triangle is stone`);
    }
}

// ---- iron: the Thales arc (the sky compass) + B/C pins ------------------------------------------------
{
    // the true Thales semicircle r=RT: B over T to C, sampled in the math
    // frame, lifted by worldPt — chain of 64 tangent segments
    const N = 64;
    const pts: Array<[number, number, number]> = [];
    for (let i = 0; i <= N; i++) {
        const t = Math.PI - (i / N) * Math.PI;
        pts.push([RT * Math.cos(t), RT * Math.sin(t) + Y0 - EMBED, 0]);
    }
    for (let i = 0; i < N; i++) g.add(tube(pts[i], pts[i + 1], ARC_TUBE, ironTex));
    console.log(`arc: iron Thales semicircle r=${RT.toFixed(6)} in ${N} tangent segments, feet exactly at B/C on the baseline — the sky compass that inscribes the triangle`);
    for (const [name, P] of [["B", B_W], ["C", C_W]] as const) {
        const pin = new THREE.Mesh(new THREE.SphereGeometry(PIN_R, 12, 10), ironTex);
        pin.position.set(P[0], P[1] + PIN_R, 0);
        g.add(pin);
    }
    console.log(`pins: B/C compass-foot spheres r=${PIN_R} — bottoms at the baseline, half-proud of the curb top`);
}

// ---- glow bead at T (KEEP) — the sole night element ----------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(T_W[0], T_W[1], T_W[2]);
    glowGroup.add(bead);
    glowGroup.name = "glow_lu_1";
    g.add(glowGroup);
    console.log(`bead: glow_lu_1 r ${BEAD_R} at (${T_W[0].toFixed(3)}, ${T_W[1].toFixed(3)}, 0) — T, the five-curve convergence; socketed half-proud into the apex needle; sole night element`);
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
const merged = mergeByMaterial(g, "lunes");
writeFileSync("agents/arthur/assets/village_lunes3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_lunes3.glb`);
