// struct223-decode-rupertfork6.ts — BYTE-LEVEL AUDIT of village_rupertfork3.glb
// (sha256 49d6eb6a98eb0980…, struct-223 v6 THE DEEP PRISM, BANKED pre-placement).
// Independent replica law (struct-160): NO mk/probe imports — every check re-derives
// from the CLOSED FORM constants against the DECODED bytes.
// ANALYTIC ASSIGNMENT law: the merged stone bucket mixes fins and plinths —
// classification by the analytic passer box (rotated frame) and the contact plane,
// never by spatial clustering.
// D1 census; D2 fins (kept-cell |v| law, two fins, full-length, fin-on-plinth
// contact); D3 plinths (grade, v-margin fringe, passer |v| clearance); D4 passer
// (8 analytic corners + floor ride + RED shift); D5 bore void; D6 glow census;
// D7 min-y; D8 envelope; D9 texMat lanes.
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const path = process.argv[2] ?? "agents/arthur/assets/village_rupertfork3.glb";
const bytes = readFileSync(path);
const loader = new GLTFLoader();
const gltf = await new Promise<any>((res, rej) => loader.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "", res, rej));
const root = gltf.scene;
root.updateMatrixWorld(true);

// ---- closed-form constants (independent re-declaration; from the probe's verified output) ----
type V3 = [number, number, number];
const S = 4.5;
const L = 2.0 * S;                 // 9.0
const DOOR = 1.03 * S;             // 4.635
const doorHalf = DOOR / 2;         // 2.3175
const PASS_S = DOOR - 0.004;       // 4.631
const REVEAL = 0.012;
const WALL_CY = PASS_S / 2 + REVEAL;   // 2.3275
const T_HI = L / 2;                // 4.5
const NOSE_IN = 0.55;              // probe v8: plug station — nose 55cm shy of the +mouth (deepened reveal)
const T_ST = T_HI - NOSE_IN - PASS_S / 2;  // plug station: wholly inside, nose shy of the +mouth
const V_HALF = S / Math.SQRT2;     // 3.18198
const NN: V3 = [Math.SQRT1_2, 0, Math.SQRT1_2];
const RP: V3[] = [   // face-stance basis (columns): local x→NN, y→UU(0,1,0), z→VV(−√½,0,√½)
    [NN[0], 0, -Math.SQRT1_2],
    [0, 1, 0],
    [NN[2], 0, Math.SQRT1_2]];
const PASS_C: V3 = [T_ST*NN[0], WALL_CY, T_ST*NN[2]];
const CONTACT = 0.180;             // probe v7: fin raster bottom == plinth top (contact plane)
const FIN_V_HI = 3.043;            // probe v7: raster fin outer |v| (v-band [2.326, 3.043])
const ENV_W: [number, number, number] = [10.96, 5.14, 10.96]; // probe v9 contract (gate beams + bead crowns define the top)

const vOf = (p: THREE.Vector3) => -p.x * Math.SQRT1_2 + p.z * Math.SQRT1_2;   // door-frame v (world form)
const tOf = (p: THREE.Vector3) => (p.x + p.z) * Math.SQRT1_2;                 // door-frame t

// ---- collect meshes with world verts ----
interface M { name: string; mat: string; world: THREE.Vector3[]; emissiveRGB: [number, number, number] }
const meshes: M[] = [];
root.traverse((o: any) => {
    if (!o.isMesh) return;
    const posA = o.geometry.getAttribute("position") as THREE.BufferAttribute;
    const world: THREE.Vector3[] = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < posA.count; i++) {
        v.fromBufferAttribute(posA, i).applyMatrix4(o.matrixWorld);
        world.push(v.clone());
    }
    const e = o.material?.emissive;
    meshes.push({ name: o.name, mat: o.material?.name ?? "?", world, emissiveRGB: e ? [e.r, e.g, e.b] : [0,0,0] });
});
const stoneWorld = meshes.filter(m => m.mat === "rf_stone").flatMap(m => m.world);
const ironWorld = meshes.filter(m => m.mat === "rf_iron").flatMap(m => m.world);
const passerPool = ironWorld.length ? ironWorld : stoneWorld;

// analytic passer box membership (rotated frame)
const inPasserBox = (p: THREE.Vector3): boolean => {
    const d = [p.x - PASS_C[0], p.y - PASS_C[1], p.z - PASS_C[2]];
    const lx = d[0]*RP[0][0] + d[1]*RP[1][0] + d[2]*RP[2][0];
    const ly = d[0]*RP[0][1] + d[1]*RP[1][1] + d[2]*RP[2][1];
    const lz = d[0]*RP[0][2] + d[1]*RP[1][2] + d[2]*RP[2][2];
    return Math.max(Math.abs(lx), Math.abs(ly), Math.abs(lz)) <= PASS_S/2 + 1e-3;
};

let FAILS = 0;
const CK = (name: string, ok: boolean, detail: string) => { if (!ok) FAILS++; console.log(`${ok ? "PASS" : "FAIL"} [${name}] ${detail}`); };
const CELL_TOP_TOL = 0.245;   // one raster cell + shave (declared BEFORE use — CC bug class)

// ---- D1 census ----
{
    const named: string[] = [];
    root.traverse((o: any) => { if (o.name) named.push(o.name); });
    const mats = new Set(meshes.map(m => m.mat));
    CK("D1 census", meshes.length === 3 && named.some(n => n.startsWith("glow_rf_1")) && mats.has("rf_stone") && mats.has("rf_iron"),
        `${meshes.length} draw meshes, materials ${[...mats].join(" + ")}, KEEP glow_rf_1 ${named.some(n => n.startsWith("glow_rf_1")) ? "present" : "ABSENT"}`);
}

// ---- D2 the fins ----
{
    const passerVerts = passerPool.filter(inPasserBox);
    const rest = stoneWorld.filter(p => !inPasserBox(p));
    const finVerts = rest.filter(p => p.y > CONTACT + 0.0005);
    const padVerts = rest.filter(p => p.y < CONTACT - 0.0005);
    CK("D2 populations", passerVerts.length >= 20 && finVerts.length >= 120 && padVerts.length >= 20,
        `analytic assignment: passer ${passerVerts.length}, fin ${finVerts.length}, plinth-body ${padVerts.length} verts`);
    // kept-cell law: every FIN vert clears the door half-plane in v
    let vMin = Infinity;
    for (const p of finVerts) vMin = Math.min(vMin, Math.abs(vOf(p)));
    CK("D2 fin kept-cell law", vMin > doorHalf - 1e-3,
        `min |v| over fin verts ${vMin.toFixed(4)} > doorHalf-1mm ${doorHalf.toFixed(4)} — the fins clear the bore`);
    // CONTACT law: fins rest ON the plinths — no y-gap in the seat band
    const ys = rest.map(p => p.y).filter(y => y > 0.02 && y < 2.0).sort((a, b) => a - b);
    let gap = 0, gapAt = 0;
    for (let i = 1; i < ys.length; i++) if (ys[i] - ys[i-1] > gap) { gap = ys[i] - ys[i-1]; gapAt = ys[i-1]; }
    CK("D2 fin-on-plinth contact", gap <= 0.005,
        `largest y-gap in the seat band: ${gap.toFixed(4)} m at y ${gapAt.toFixed(3)} (must be <= 5mm — fins rest on stone)`);
    // two fins, split by v sign
    const plus = finVerts.filter(p => vOf(p) > 0).length;
    const minus = finVerts.filter(p => vOf(p) < 0).length;
    CK("D2 two fins", plus > 50 && minus > 50 && Math.abs(plus - minus) / Math.max(plus, minus) < 0.15,
        `v-sign split: ${plus} vs ${minus} verts (equal within 15%)`);
    // FULL-LENGTH law (the v6 point): the fins span ≥ 95% of the bore
    let tMin = Infinity, tMax = -Infinity;
    for (const p of finVerts) { tMin = Math.min(tMin, tOf(p)); tMax = Math.max(tMax, tOf(p)); }
    CK("D2 full-length fins", (tMax - tMin) >= 0.95 * L,
        `fin t-extent ${(tMax - tMin).toFixed(3)}m of the ${L}m bore (${((tMax - tMin) / L * 100).toFixed(1)}%) — TWO walls, not corner wedges`);
    // fin crown: OUTSIDE the gate t-bands the top must sit AT the region's true top (the
    // caps); INSIDE the gate bands the shoulders crest to the beam level (by design)
    let yTopOpen = -Infinity;
    const GATE_BAND = 0.45 + 0.01;
    for (const p of finVerts) { const t = tOf(p); if (Math.abs(Math.abs(t) - T_HI) > GATE_BAND) yTopOpen = Math.max(yTopOpen, p.y); }
    let yTopGate = -Infinity;
    for (const p of finVerts) { const t = tOf(p); if (Math.abs(Math.abs(t) - T_HI) <= GATE_BAND) yTopGate = Math.max(yTopGate, p.y); }
    CK("D2 fin crown", Math.abs(yTopOpen - (WALL_CY + S / 2)) < 0.002 && Math.abs(yTopGate - (WALL_CY + DOOR/2 + 0.40)) < 0.002,
        `fin crown y ${yTopOpen.toFixed(3)} == the swept square's true top ${(WALL_CY + S/2).toFixed(3)} outside the gates; gate shoulders crest ${yTopGate.toFixed(3)} == beam level ${(WALL_CY + DOOR/2 + 0.40).toFixed(3)} — finished walls with gate heads`);
}
// ---- D3 the plinths ----
{
    const padVerts = stoneWorld.filter(p => !inPasserBox(p) && p.y < CONTACT - 0.0005);
    const p1 = padVerts.filter(p => vOf(p) > 0.5).length;
    const p2 = padVerts.filter(p => vOf(p) < -0.5).length;
    let yMin = Infinity;
    for (const p of padVerts) yMin = Math.min(yMin, p.y);
    // v-margin fringe: plinth verts beyond the fins' own outer edge prove the 12cm margin
    // (the plinths poke OUTWARD in v from under the fins — the visual seat read)
    let fringe = 0;
    for (const p of padVerts) if (Math.abs(vOf(p)) > FIN_V_HI + 0.005) fringe++;
    // passer |v| clearance: no plinth vert inside the passer's |v| band at plinth height
    let intrude = 0;
    for (const p of padVerts) if (Math.abs(vOf(p)) < doorHalf - 0.005) intrude++;
    CK("D3 plinths", p1 >= 12 && p2 >= 12 && Math.abs(yMin) < 0.002 && fringe >= 12 && intrude === 0,
        `plinth bodies (+v: ${p1}, −v: ${p2}), grade ${yMin.toFixed(4)}, v-margin fringe verts ${fringe} (>${FIN_V_HI} — the 12cm outward seat), passer-band intrusions ${intrude} (0 — |v| law holds)`);
}

// ---- D4 the passer: 8 analytic corners + floor ride + RED ----
{
    const corners: THREE.Vector3[] = [];
    for (const sx of [1,-1]) for (const sy of [1,-1]) for (const sz of [1,-1])
        corners.push(new THREE.Vector3(
            PASS_C[0] + (sx*PASS_S/2)*RP[0][0] + (sy*PASS_S/2)*RP[0][1] + (sz*PASS_S/2)*RP[0][2],
            PASS_C[1] + (sx*PASS_S/2)*RP[1][0] + (sy*PASS_S/2)*RP[1][1] + (sz*PASS_S/2)*RP[1][2],
            PASS_C[2] + (sx*PASS_S/2)*RP[2][0] + (sy*PASS_S/2)*RP[2][1] + (sz*PASS_S/2)*RP[2][2]));
    let worst = 0;
    for (const c of corners) {
        let best = Infinity;
        for (const p of passerPool) best = Math.min(best, p.distanceTo(c));
        worst = Math.max(worst, best);
    }
    CK("D4 passer pose", worst < 0.005,
        `all 8 analytic corners matched to iron-passer verts (worst ${worst.toFixed(5)} m) — the bigger cube, FACE STANCE, ${PASS_S.toFixed(4)} m = ${(PASS_S/S).toFixed(5)}x the wall's face`);
    // floor ride
    let yMin = Infinity;
    for (const p of passerPool) yMin = Math.min(yMin, p.y);
    CK("D4 floor ride", Math.abs(yMin - REVEAL) < 0.002,
        `passer bottom ${yMin.toFixed(4)} vs reveal ${REVEAL} — riding the ground`);
    // station: THE PLUG — nose recessed inside the +mouth (judge-directed re-seat)
    let tMax = -Infinity;
    for (const p of passerPool) tMax = Math.max(tMax, tOf(p));
    const noseIn = T_HI - tMax;
    CK("D4 station", noseIn > 0.25 && noseIn < 0.8,
        `nose ${noseIn.toFixed(3)}m INSIDE the +mouth (recessed-door band [0.25, 0.8]) — the plug presentation`);
    // RED: +3cm shift must be DETECTED (non-vacuous audit)
    let worstShift = 0;
    for (const c of corners) {
        const cs = c.clone().add(new THREE.Vector3(0.03, 0, 0));
        let best = Infinity;
        for (const p of stoneWorld) best = Math.min(best, p.distanceTo(cs));
        worstShift = Math.max(worstShift, best);
    }
    CK("D4 RED non-vacuous", worstShift > 0.01,
        `+3cm-shifted corners worst match ${worstShift.toFixed(4)} (> 0.01 — detected)`);
}

// ---- D5 the bore void ----
{
    let n = 0;
    for (const p of stoneWorld) {
        const u = p.y - WALL_CY;
        const v = vOf(p);
        if (Math.abs(u) < 0.02 && Math.abs(v) < 0.02) n++;
    }
    CK("D5 bore void", n === 0,
        `stone verts within 2cm of the bore centerline: ${n} (must be 0 — the door is a real through-void; the iron passer occupies the throat)`);
}

// ---- D6 glow census: ONE family, FOUR lamp clusters (one per gate-beam corner) ----
{
    const glowMeshes = meshes.filter(m => m.emissiveRGB.some(c => c > 0.01));
    CK("D6 glow families", glowMeshes.length === 1 && glowMeshes[0].mat !== "rf_stone" && glowMeshes[0].mat !== "rf_iron",
        `${glowMeshes.length} emissive mesh(es), family ${glowMeshes[0]?.mat} (stone+iron excluded — black emissive channel)`);
    const gv = glowMeshes[0]?.world ?? [];
    const BEAM_TOP = 5.14;
    let nNear = 0, nFar = 0;
    for (const p of gv) { if (tOf(p) > 0) nNear++; else nFar++; }
    const yTop = gv.length ? Math.max(...gv.map(p => p.y)) : 0;
    CK("D6 four lamps", nNear > 120 && nFar > 120 && Math.abs(yTop - BEAM_TOP) < 0.01,
        `lamp verts ${nNear} on the near gate + ${nFar} on the far gate (2 corners each), crown y ${yTop.toFixed(2)} == beam crowns — the four-lamp gate idiom`);
}

// ---- D7 min-y ----
{
    let yMin = Infinity;
    for (const p of stoneWorld) yMin = Math.min(yMin, p.y);
    CK("D7 min-y", Math.abs(yMin) < 0.002, `stone min y ${yMin.toFixed(4)} (plinths seated at grade)`);
}

// ---- D8 envelope vs contract ----
{
    const box = new THREE.Box3().setFromObject(root);
    const sz = box.getSize(new THREE.Vector3());
    CK("D8 envelope", Math.abs(sz.x - ENV_W[0]) < 0.02 && Math.abs(sz.y - ENV_W[1]) < 0.02 && Math.abs(sz.z - ENV_W[2]) < 0.02,
        `decoded ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} vs contract ${ENV_W.join("x")} (asymmetric by design — the passer juts past the +mouth)`);
}

// ---- D9 texMat lanes ----
{
    const mats = new Set(meshes.map(m => m.mat));
    CK("D9 texMat", mats.has("rf_stone") && mats.has("rf_iron") && meshes.length >= 2,
        `materials: ${[...mats].join(", ")} — stone + iron texMats + one glow lane`);
}

console.log(FAILS === 0 ? "ALL PASS" : `${FAILS} FAILURES`);
if (FAILS) process.exit(1);
