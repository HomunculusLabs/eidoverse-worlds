// mkv3-rupertfork.ts — STRUCTURES LANE struct-221, R11-36 RUPERT'S FORK
// The wall cube bored along its horizontal diagonal with the classic 3√2/4 door:
// two full-height knife-fins remain, and through them — caught mid-pass, 58%
// emerged — the PASSER: a cube 5.97% BIGGER than the wall, riding the ground
// on a 12mm reveal while the wall sits raised on two foot pads. The bigger
// cube passes through the smaller one: Prince Rupert's 1690s miracle, frozen.
//
// One idea: THE BIGGER CUBE PASSES THROUGH THE SMALLER ONE. STONE carries all
// of it — fins, pads, and passer are ONE family (the theorem's point: they are
// equal stone); BRASS is two warm beads on the fin tops (the sole night glow).
//
// Laws honored: texMat lanes (struct-38) — rf_stone; bead emissive 0x9a7030 @
// 1.0 in-GLB (dusk lineage, struct-82); ROOT STAYS IDENTITY (struct-188) — the
// probe's seated positions are FINAL world-local; envelope vs probe; NaN 0;
// glow census exactly 1 KEEP group (glow_rf_1).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    WALL_BOXES, PADS, BEADS, BEAD_R, PASS_C, PASS_S, RP, ENVELOPE,
    PASS_RATIO, POSE_DEG, EMERGED_FRAC, PAD_H,
} from "../struct221-probe-rupertfork.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("rf_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 221 });
const brassGlow = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below is FINAL
// world-local — the probe seated the passer on its floor-ride and the fins on their pads.

// ---- stone: the two fins + the pads --------------------------------------------------------------------
{
    for (const b of WALL_BOXES) {
        // Box axes: probe s = [u-run, t-layer, v-cell] in the DOOR frame (UU vertical,
        // NN bore, VV horizontal diagonal). Build a unit box, scale, then rotate the
        // frame's basis in, then translate.
        const UU = [0, 1, 0] as const;
        const NN = [Math.SQRT1_2, 0, Math.SQRT1_2] as const;
        const VV = [-Math.SQRT1_2, 0, Math.SQRT1_2] as const;
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const m = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(b.s[0]*UU[0], b.s[0]*UU[1], b.s[0]*UU[2]),
            new THREE.Vector3(b.s[1]*NN[0], b.s[1]*NN[1], b.s[1]*NN[2]),
            new THREE.Vector3(b.s[2]*VV[0], b.s[2]*VV[1], b.s[2]*VV[2]));
        const mesh = new THREE.Mesh(geo, stoneTex);
        mesh.applyMatrix4(m);
        mesh.position.set(b.c[0], b.c[1], b.c[2]);
        g.add(mesh);
    }
    for (const p of PADS) {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(p.s[0], p.s[1], p.s[2]), stoneTex);
        pad.position.set(p.c[0], p.c[1], p.c[2]);
        g.add(pad);
    }
    console.log(`fins+pads: ${WALL_BOXES.length} fin boxes (two full-height knives at the anti-diagonal corners) + ${PADS.length} foot pads (h ${PAD_H.toFixed(3)} — the raise that lets the bigger cube clear the floor)`);
}

// ---- stone: the passer — the bigger cube, caught mid-pass ------------------------------------------------
{
    const geo = new THREE.BoxGeometry(PASS_S, PASS_S, PASS_S);
    const mesh = new THREE.Mesh(geo, stoneTex);
    const m = new THREE.Matrix4().makeBasis(
        new THREE.Vector3(RP[0][0], RP[1][0], RP[2][0]),
        new THREE.Vector3(RP[0][1], RP[1][1], RP[2][1]),
        new THREE.Vector3(RP[0][2], RP[1][2], RP[2][2]));
    mesh.applyMatrix4(m);
    mesh.position.set(PASS_C[0], PASS_C[1], PASS_C[2]);
    g.add(mesh);
    console.log(`passer: ${PASS_S.toFixed(4)} m cube = ${PASS_RATIO.toFixed(5)}x the wall (BIGGER), pose a ${POSE_DEG.a.toFixed(1)} b ${POSE_DEG.b.toFixed(1)} g ${POSE_DEG.g.toFixed(1)} deg, ${(EMERGED_FRAC*100).toFixed(0)}% emerged past the mouth, bottom riding 12mm above grade`);
}

// ---- brass: the two fin-top beads (KEEP — sole night element) ----------------------------------------------
const glowGroup = new THREE.Group();
{
    for (const b of BEADS) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 16, 12), brassGlow);
        bead.position.set(b[0], b[1], b[2]);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_rf_1";
    g.add(glowGroup);
    console.log(`beads: glow_rf_1 x${BEADS.length} (r ${BEAD_R}) on the fin tops — after dark, two warm points marking the fork the bigger cube passed through`);
}

// ---- census + envelope/NaN laws -------------------------------------------------------------------------------
g.updateMatrixWorld(true);
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const want = new THREE.Box3(
        new THREE.Vector3().fromArray(ENVELOPE.min as any),
        new THREE.Vector3().fromArray(ENVELOPE.max as any));
    const wsz = want.getSize(new THREE.Vector3());
    const dErr = Math.max(
        Math.abs(env.min.x - want.min.x), Math.abs(env.max.x - want.max.x),
        Math.abs(env.min.y - want.min.y), Math.abs(env.max.y - want.max.y),
        Math.abs(env.min.z - want.min.z), Math.abs(env.max.z - want.max.z));
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (dErr > 0.001) throw Error(`envelope drift ${dErr.toFixed(4)} vs probe contract (mk ${sz.x.toFixed(3)}x${sz.y.toFixed(3)}x${sz.z.toFixed(3)} vs probe ${wsz.x.toFixed(3)}x${wsz.y.toFixed(3)}x${wsz.z.toFixed(3)})`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const meshes = g.children.filter((o) => (o as any).isMesh).length;
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] == probe contract (ASYMMETRIC by design — the passer juts past the mouth; seat with the TRUE bbox), pre-merge meshes ${meshes} + 1 glow KEEP group`);
}
const merged = mergeByMaterial(g, "rupertfork");
writeFileSync("agents/arthur/assets/village_rupertfork3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_rupertfork3.glb`);
