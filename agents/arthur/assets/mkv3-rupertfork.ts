// mkv3-rupertfork.ts — STRUCTURES LANE struct-223, R11-37 RUPERT'S FORK v11 (THE WALLED GATE)
// The arc (struct-220..223, six judged iterations): the cube wall's fork was intrinsically
// occluded, so v6 became THE DEEP PRISM — the S×S face swept L=2S along its diagonal: the
// same 1.03×S door carves a THROUGH-PORTAL (two full-length fins 0.86m true thickness ×
// 4.5m tall × 8.94m long flanking a 4.635m-clear × 9m throat). The PASSER — a dark-iron
// cube 2.91% BIGGER than the wall's face — rides the bore as THE PLUG, wholly inside the
// throat, nose 0.55m shy of the near mouth; its crest rides 6.6cm above the wall crown
// and its floor 6.6cm below the wall base (the wall rides 7.75cm plinths): taller than
// the very mouth it fills. v8 restores each fin's raster shave with coursed caps (the
// walls read finished full-height); v9/v10 raise GATE HEADS at both mouths — shoulder
// blocks seated on the caps + beams whose UNDERSIDE IS the channel ceiling (u = doorHalf
// exactly): the plug clears the beams by the same 2mm margin it clears the door, so the
// pass stays machine-TRUE with the gate built. Four brass lamps, one per beam corner.
//
// One idea: THE BIGGER CUBE IS INSIDE THE WALL. STONE carries the wall (fins, plinths,
// caps, gates — one family); IRON carries the plug (material separation); BRASS is the
// four gate lamps (sole night element).
//
// Laws honored: texMat lanes (struct-38) — rf_stone, rf_iron; lamp emissive 0x9a7030 @
// 1.0 in-GLB (dusk lineage, struct-82); ROOT STAYS IDENTITY (struct-188) — the probe's
// seated positions are FINAL world-local; envelope vs probe; NaN 0; glow census exactly
// 1 KEEP group (glow_rf_1).
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    WALL_BOXES, PADS, CAPS, CAP_H, GATES, BEADS, BEAD_R, PASS_C, PASS_S, RP, ENVELOPE,
    PASS_RATIO, NOSE_IN, PAD_H, UU, NN, VV, FIN_ANATOMY,
} from "../struct223-probe-rupertfork6.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("rf_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 221 });
const ironTex = texMat("rf_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 76 });
const brassGlow = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): every position below is FINAL
// world-local — the probe seated the passer on its floor-ride and the fins on their plinths.

// ---- stone: the two full-length fins + the two plinth strips ------------------------------------------
{
    for (const b of WALL_BOXES) {
        // Box axes: probe s = [u-run, t-layer, v-cell] in the DOOR frame (UU vertical,
        // NN bore, VV horizontal diagonal). Build a unit box, scale, rotate the frame's
        // basis in, then translate.
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
        // plinths are DOOR-FRAME boxes (axes UU/NN/VV, same as the fin cells) —
        // s = [u: height, t: along NN, v: along VV]; inner v edge == the fin's own
        // inner edge, so the plinth clears the passer at every station (|v| law).
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const m = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(p.s[0]*UU[0], p.s[0]*UU[1], p.s[0]*UU[2]),
            new THREE.Vector3(p.s[1]*NN[0], p.s[1]*NN[1], p.s[1]*NN[2]),
            new THREE.Vector3(p.s[2]*VV[0], p.s[2]*VV[1], p.s[2]*VV[2]));
        const pad = new THREE.Mesh(geo, stoneTex);
        pad.applyMatrix4(m);
        pad.position.set(p.c[0], p.c[1], p.c[2]);
        g.add(pad);
    }
    for (const cap of CAPS) {
        // crown-restoration caps (v8): one course per fin restoring the swept square's
        // own top face — the walls read as finished full-height; 9cm outward cornice.
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const m = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(cap.s[0]*UU[0], cap.s[0]*UU[1], cap.s[0]*UU[2]),
            new THREE.Vector3(cap.s[1]*NN[0], cap.s[1]*NN[1], cap.s[1]*NN[2]),
            new THREE.Vector3(cap.s[2]*VV[0], cap.s[2]*VV[1], cap.s[2]*VV[2]));
        const c = new THREE.Mesh(geo, stoneTex);
        c.applyMatrix4(m);
        c.position.set(cap.c[0], cap.c[1], cap.c[2]);
        g.add(c);
    }
    for (const gate of GATES) for (const b of [...gate.side, gate.beam]) {
        // gate heads (v9): one per mouth — shoulders seated on the caps + a beam whose
        // underside IS the channel ceiling (the plug clears it by the door-fit margin).
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const m = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(b.s[0]*UU[0], b.s[0]*UU[1], b.s[0]*UU[2]),
            new THREE.Vector3(b.s[1]*NN[0], b.s[1]*NN[1], b.s[1]*NN[2]),
            new THREE.Vector3(b.s[2]*VV[0], b.s[2]*VV[1], b.s[2]*VV[2]));
        const gb = new THREE.Mesh(geo, stoneTex);
        gb.applyMatrix4(m);
        gb.position.set(b.c[0], b.c[1], b.c[2]);
        g.add(gb);
    }
    console.log(`fins+plinths+caps+gates: ${WALL_BOXES.length} fin boxes (TWO full-length walls — t-extent ${(FIN_ANATOMY.tBand[1]-FIN_ANATOMY.tBand[0]).toFixed(2)}m of the 9m bore, v-band |v| ∈ [${FIN_ANATOMY.vBand[0].toFixed(3)}, ${FIN_ANATOMY.vBand[1].toFixed(3)}]) + ${PADS.length} plinth strips (h ${FIN_ANATOMY.finBot.toFixed(3)}) + ${CAPS.length} crown caps (h ${CAP_H.toFixed(4)}) + ${GATES.length} gate heads (shoulders+beam; beam underside = channel ceiling — the plug clears by the door-fit margin)`);
}

// ---- iron: the passer — the bigger cube, caught mid-pass in the throat's outer third ------------------
{
    const geo = new THREE.BoxGeometry(PASS_S, PASS_S, PASS_S);
    const mesh = new THREE.Mesh(geo, ironTex);
    const m = new THREE.Matrix4().makeBasis(
        new THREE.Vector3(RP[0][0], RP[1][0], RP[2][0]),
        new THREE.Vector3(RP[0][1], RP[1][1], RP[2][1]),
        new THREE.Vector3(RP[0][2], RP[1][2], RP[2][2]));
    mesh.applyMatrix4(m);
    mesh.position.set(PASS_C[0], PASS_C[1], PASS_C[2]);
    g.add(mesh);
    console.log(`passer: ${PASS_S.toFixed(4)} m cube = ${PASS_RATIO.toFixed(5)}x the wall's face (BIGGER), FACE STANCE, DARK IRON (rf_iron — material separation), THE PLUG wholly inside the throat (nose ${NOSE_IN}m shy of the +mouth), bottom riding 12mm above grade`);
}

// ---- brass: the two fin-top beads at the nose mouth (KEEP — sole night element) ------------------------
const glowGroup = new THREE.Group();
{
    for (const b of BEADS) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 16, 12), brassGlow);
        bead.position.set(b[0], b[1], b[2]);
        glowGroup.add(bead);
    }
    glowGroup.name = "glow_rf_1";
    g.add(glowGroup);
    console.log(`beads: glow_rf_1 x${BEADS.length} (r ${BEAD_R}) on the fin crowns at the nose mouth — after dark, two warm points framing the portal the bigger cube is passing through`);
}

// ---- census + envelope/NaN laws -----------------------------------------------------------------------
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
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}] == probe contract (ASYMMETRIC by design — the passer juts past the +mouth; seat with the TRUE bbox), pre-merge meshes ${meshes} + 1 glow KEEP group`);
}
const merged = mergeByMaterial(g, "rupertfork");
writeFileSync("agents/arthur/assets/village_rupertfork3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_rupertfork3.glb`);
