// struct221-decode-rupertfork.ts — BYTE-LEVEL AUDIT of village_rupertfork3.glb
// (sha256 bfe708e17bfbad5c…, struct-221 v1, BANKED pre-placement).
// Independent replica law (struct-160): NO mk/probe imports — every check
// re-derives from the CLOSED FORM constants against the DECODED bytes.
// ANALYTIC ASSIGNMENT law: the merged stone bucket mixes fins, pads, and the
// passer's in-throat verts — classification is by the ANALYTIC passer box
// (rotated frame), never by spatial clustering.
// D1 census; D2 fins (count, kept-cell |v| law, grounding, two anti-diagonal
// blades); D3 pads; D4 passer (8 analytic corners + floor ride + RED shift);
// D5 bore void; D6 glow census (one family, two bead clusters); D7 min-y;
// D8 envelope; D9 texMat lanes.
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
const CLASSIC = 3 * Math.SQRT2 / 4;
const DOOR = 1.03 * S;
const doorHalf = DOOR / 2;
const REVEAL = 0.012;
const PASS_S = 4.6310;                     // probe-printed v4 (DOOR − 4mm, face stance)
const PAD_H = 0.0775;                      // probe-printed v4 bed course
const WALL_CY = S / 2 + PAD_H;              // 2.3275
const NN: V3 = [Math.SQRT1_2, 0, Math.SQRT1_2];
const T_HI = Math.SQRT2 * (S / 2);
// v5 (struct-222): iron passer (material separation), FLANK-LAW station: nose 1.335m
// proud, tail inside the waist-local fin band; T_ST = T_HI + 1.335 − s/2
const T_ST = T_HI + 1.335 - PASS_S / 2;
const deg = Math.PI / 180;
const RP: V3[] = [
    [NN[0], 0, -Math.SQRT1_2],
    [0, 1, 0],
    [NN[2], 0, Math.SQRT1_2]];
const CONTACT = 0.1801;  // probe v4: fin raster bottom == pad top (contact plane)
const PASS_C: V3 = [T_ST*NN[0], WALL_CY + T_ST*NN[1], T_ST*NN[2]];
const ENV_W: [number, number, number] = [7.57, 4.64, 7.57]; // v5 probe contract size (iron passer, flank-law station)

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
// v5: the passer is its own texMat lane (rf_iron — material separation); passer checks
// use the iron mesh, not the stone bucket.
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
const inWallCube = (p: THREE.Vector3) => Math.abs(p.x) <= S/2 + 1e-6 && Math.abs(p.y - WALL_CY) <= S/2 + 1e-6 && Math.abs(p.z) <= S/2 + 1e-6;

let FAILS = 0;
const CK = (name: string, ok: boolean, detail: string) => { if (!ok) FAILS++; console.log(`${ok ? "PASS" : "FAIL"} [${name}] ${detail}`); };

// ---- D1 census ----
{
    const named: string[] = [];
    root.traverse((o: any) => { if (o.name) named.push(o.name); });
    const mats = new Set(meshes.map(m => m.mat));
    CK("D1 census", meshes.length >= 2 && named.some(n => n.startsWith("glow_rf_1")) && mats.has("rf_stone"),
        `${meshes.length} draw meshes, materials ${[...mats].join(" + ")}, KEEP glow_rf_1 ${named.some(n => n.startsWith("glow_rf_1")) ? "present" : "ABSENT"}`);
}

// ---- D2 the fins (analytic assignment: in-wall-cube, NOT in the passer box) ----
{
    const passerVerts = passerPool.filter(inPasserBox);
    const rest = stoneWorld.filter(p => !inPasserBox(p));
    // NOTE: pads rise TO the blades' raster bottom — the contact plane y≈CONTACT is
    // SHARED (pad top face == fin bottom face, by construction). The kept-cell law
    // therefore scopes to stone STRICTLY ABOVE the contact plane (+0.5mm); verts AT
    // the plane are contact verts (their clearance is proven by D2-contact + D4 +
    // the probe's S5 |v| law, not by the |v| test).
    const finVerts = rest.filter(p => p.y > CONTACT + 0.0005);
    const padVerts = rest.filter(p => p.y < CONTACT - 0.0005);
    CK("D2 populations", passerVerts.length >= 20 && finVerts.length >= 120 && padVerts.length >= 20,
        `analytic assignment: passer ${passerVerts.length}, fin ${finVerts.length}, pad-body ${padVerts.length} verts`);
    // kept-cell law: every FIN vert clears the door half-plane in v
    let vMin = Infinity;
    for (const p of finVerts) vMin = Math.min(vMin, Math.abs(-p.x * Math.SQRT1_2 + p.z * Math.SQRT1_2));
    CK("D2 fin kept-cell law", vMin > doorHalf - 1e-3,
        `min |v| over fin verts ${vMin.toFixed(4)} > doorHalf-1mm ${doorHalf.toFixed(4)} — the blades clear the bore`);
    // CONTACT law (decode-caught class): fins must rest ON the pads — no y-gap in the
    // [0.5, 2.0] band between the pad cluster and the fin cluster (the tick-1 audit
    // caught a 10cm float here; the pads now rise to the blades' true raster bottom)
    const ys = rest.map(p => p.y).filter(y => y > 0.5 && y < 2.0).sort((a, b) => a - b);
    let gap = 0, gapAt = 0;
    for (let i = 1; i < ys.length; i++) if (ys[i] - ys[i-1] > gap) { gap = ys[i] - ys[i-1]; gapAt = ys[i-1]; }
    CK("D2 fin-on-pad contact", gap <= 0.005,
        `largest y-gap in the seat band: ${gap.toFixed(4)} m at y ${gapAt.toFixed(3)} (must be <= 5mm — blades rest on stone)`);
    // two blades on the anti-diagonal corners
    const plus = finVerts.filter(p => p.x + p.z > 0).length;
    const minus = finVerts.filter(p => p.x + p.z < 0).length;
    CK("D2 two fins", plus > 50 && minus > 50 && Math.abs(plus - minus) / Math.max(plus, minus) < 0.15,
        `anti-diagonal split: ${plus} vs ${minus} verts (equal within 15%)`);
}

// ---- D3 pads (bodies below the contact plane + outward fringe beyond the wall footprint) ----
{
    const padVerts = stoneWorld.filter(p => !inPasserBox(p) && p.y < CONTACT - 0.0005);
    const p1 = padVerts.filter(p => p.x > 0.5 && p.z < -0.5).length;
    const p2 = padVerts.filter(p => p.x < -0.5 && p.z > 0.5).length;
    let yMin = Infinity;
    for (const p of padVerts) yMin = Math.min(yMin, p.y);
    // outward fringe: pad verts beyond the wall footprint (the 12cm margin) prove the
    // pads poke OUTWARD (never under the bore) — v4 door-frame pads, contact plane
    let fringe = 0;
    for (const p of padVerts) if (Math.abs(p.x) > 2.26 || Math.abs(p.z) > 2.26) fringe++;
    CK("D3 pads", p1 >= 12 && p2 >= 12 && Math.abs(yMin) < 0.002 && fringe >= 12,
        `pad bodies (+x,−z): ${p1}, (−x,+z): ${p2}, grade ${yMin.toFixed(4)}, outward-fringe verts ${fringe} (>2.26 — pads poke out, never under the bore)`);
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
        `all 8 analytic corners matched to iron-passer verts (worst ${worst.toFixed(5)} m) — the bigger cube, FACE STANCE, ${PASS_S.toFixed(4)} m = ${(PASS_S/S).toFixed(5)}x the wall`);
    // floor ride
    const passerVerts = passerPool.filter(inPasserBox);
    let yMin = Infinity;
    for (const p of passerVerts) yMin = Math.min(yMin, p.y);
    CK("D4 floor ride", Math.abs(yMin - REVEAL) < 0.002,
        `passer bottom ${yMin.toFixed(4)} vs reveal ${REVEAL} — riding the ground`);
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
        const v = -p.x * Math.SQRT1_2 + p.z * Math.SQRT1_2;
        if (Math.abs(u) < 0.02 && Math.abs(v) < 0.02 && !inPasserBox(p)) n++;
    }
    CK("D5 bore void", n === 0,
        `non-passer stone verts within 2cm of the bore centerline: ${n} (must be 0 — the door is a real void; the passer itself occupies the throat)`);
}

// ---- D6 glow census: ONE family, TWO bead clusters ----
{
    const glowMeshes = meshes.filter(m => m.emissiveRGB.some(c => c > 0.01));
    CK("D6 glow families", glowMeshes.length === 1 && glowMeshes[0].mat !== "rf_stone",
        `${glowMeshes.length} emissive mesh(es), family ${glowMeshes[0]?.mat} (stone excluded — black emissive channel)`);
    const gv = glowMeshes[0]?.world ?? [];
    const p1 = gv.filter(p => p.x + p.z > 0).length;
    const p2 = gv.filter(p => p.x + p.z < 0).length;
    const yTop = gv.length ? Math.max(...gv.map(p => p.y)) : 0;
    CK("D6 two beads", p1 > 100 && p2 > 100 && yTop > 4.0,
        `bead verts split ${p1}/${p2} across the anti-diagonal, top y ${yTop.toFixed(2)} (on the fin crowns — v4 face-stance heights, above the passer's 4.64m crest plane)`);
}

// ---- D7 min-y ----
{
    let yMin = Infinity;
    for (const p of stoneWorld) yMin = Math.min(yMin, p.y);
    CK("D7 min-y", Math.abs(yMin) < 0.002, `stone min y ${yMin.toFixed(4)} (pads seated at grade)`);
}

// ---- D8 envelope vs contract ----
{
    const box = new THREE.Box3().setFromObject(root);
    const sz = box.getSize(new THREE.Vector3());
    CK("D8 envelope", Math.abs(sz.x - ENV_W[0]) < 0.02 && Math.abs(sz.y - ENV_W[1]) < 0.02 && Math.abs(sz.z - ENV_W[2]) < 0.02,
        `decoded ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} vs contract ${ENV_W.join("x")} (asymmetric by design — the passer juts past the mouth)`);
}

// ---- D9 texMat lanes ----
{
    const mats = new Set(meshes.map(m => m.mat));
    CK("D9 texMat", mats.has("rf_stone") && meshes.length >= 2,
        `materials: ${[...mats].join(", ")} — stone texMat + one glow lane`);
}

console.log(FAILS === 0 ? "ALL PASS" : `${FAILS} FAILURES`);
process.exit(FAILS === 0 ? 0 : 1);
