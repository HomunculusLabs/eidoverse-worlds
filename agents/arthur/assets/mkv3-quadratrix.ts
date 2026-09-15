// mkv3-quadratrix.ts — STRUCTURES LANE struct-190, Round 11 commission R11-18
// THE QUADRATRIX OF HIPPIAS — the curve that measured the circle.
//
// One idea: two uniform motions — a radius turning, a line falling — weave
// one curve; where it lands on the base, pi is written. Stone square frame
// (side W); stone ribbon of 22 tangent voussoirs sweeping corner-to-foot;
// brass RAY and iron FALLING LINE frozen where they cross ON the curve
// (theta* = 60°); brass pi-stud at the landing x = 2W/pi; glow bead at the
// frozen crossing. Folly class, no walk owed.
//
// Laws honored: texMat lanes (struct-38) — qu_stone/qu_brass/qu_iron; bead
// emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census exactly 1 KEEP
// (glow_qu_1); ROOT STAYS IDENTITY (struct-188 decode law — shift baked
// into every position); NaN 0; envelope law vs probe contract.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    W, BASE_LIFT, FRAME_SEC, SEC, N_VOUS, RAY_SEC, RAY_TH, LINE_SEC,
    STUD_R, STUD_H, BEAD_R, BEAD_Z, PLINTH, PI_X, Y_STAR, X_STAR,
    Y_TOP, Y_BOT, SHIFT_X, ENVELOPE, xOfY, thetaOfY, pTheta,
} from "../struct190-probe-quadratrix.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("qu_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 191 });
const brassTex = texMat("qu_brass", [0xbd985c, 0xb0874a, 0xc9a76b], { rough: 0.55, metal: 0.65, scale: 1.2, weights: [3, 1, 1], cell: 24, seed: 72 });
const ironTex = texMat("qu_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 62 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (struct-188 decode-caught law): all positions below
// are authored in FINAL world-local coords (math frame + BASE_LIFT/SHIFT_X).

// ---- stone plinth --------------------------------------------------------------------------------------
{
    const w = PLINTH.x1 - PLINTH.x0;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w, PLINTH.h, PLINTH.hz * 2), stoneTex);
    plinth.position.set((PLINTH.x0 + PLINTH.x1) / 2 + SHIFT_X, PLINTH.h / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${w.toFixed(2)}x${PLINTH.h}x${(PLINTH.hz * 2).toFixed(2)} — the ground`);
}

// ---- stone square frame: verticals own the corners, horizontals span between ------------------------------
{
    let members = 0;
    for (const mx of [0, W]) {                                  // left, right (math x)
        const m = new THREE.Mesh(new THREE.BoxGeometry(FRAME_SEC, W, FRAME_SEC), stoneTex);
        m.position.set(mx + SHIFT_X, BASE_LIFT + W / 2, 0);
        g.add(m); members++;
    }
    for (const my of [0, W]) {                                  // base, top (math y)
        const m = new THREE.Mesh(new THREE.BoxGeometry(W - FRAME_SEC, FRAME_SEC, FRAME_SEC), stoneTex);
        m.position.set(W / 2 + SHIFT_X, BASE_LIFT + my, 0);
        g.add(m); members++;
    }
    if (members !== 4) throw Error(`frame census ${members} != 4`);
    console.log(`frame: 4 members ${FRAME_SEC} sq, square side ${W} — the curve's own generating square`);
}

// ---- the quadratrix ribbon: 22 arc-uniform tangent voussoirs ----------------------------------------------
{
    const M = 8000;
    const th0 = thetaOfY(Y_TOP), th1 = thetaOfY(Y_BOT);
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= M; i++) {
        const th = th1 + (i / M) * (th0 - th1);                  // foot -> top
        pts.push(pTheta(th));
    }
    const cum = [0];
    for (let i = 1; i <= M; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = cum[M];
    const stations: Array<[number, number]> = [];
    let idx = 0;
    for (let j = 0; j <= N_VOUS; j++) {
        const target = (j / N_VOUS) * total;
        while (idx < M && cum[idx + 1] < target) idx++;
        const t = (target - cum[idx]) / Math.max(1e-12, cum[idx + 1] - cum[idx]);
        const yApprox = pts[idx][1] + t * (pts[idx + 1][1] - pts[idx][1]);
        const th = thetaOfY(yApprox);
        stations.push(pTheta(th));                               // SNAP to the exact curve (probe L6 law)
    }
    let count = 0;
    for (let j = 0; j < N_VOUS; j++) {
        const [xa, ya] = stations[j], [xb, yb] = stations[j + 1];
        const dx = xb - xa, dy = yb - ya;
        const len = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);
        const box = new THREE.Mesh(new THREE.BoxGeometry(len + 0.006, SEC, SEC), stoneTex);
        box.position.set((xa + xb) / 2 + SHIFT_X, BASE_LIFT + (ya + yb) / 2, 0);
        box.rotation.z = ang;
        g.add(box);
        count++;
    }
    if (count !== N_VOUS) throw Error(`voussoir census ${count} != ${N_VOUS}`);
    console.log(`ribbon: ${N_VOUS} tangent voussoirs ${SEC}x${SEC}, arc ${total.toFixed(3)} m, math y in [${Y_BOT}, ${Y_TOP}] — the quadratrix x = y*cot(pi*y/2W), W=${W}`);
}

// ---- the frozen moment: brass ray from the pole corner at 60 deg -----------------------------------------
{
    // endpoints in MATH frame: start embedded in the base member, end
    // embedded in the top member (inside its span)
    const s0 = -0.05 / Math.sin(RAY_TH), s1 = (W + FRAME_SEC / 2 - 0.03) / Math.sin(RAY_TH);
    const x0 = s0 * Math.cos(RAY_TH), y0 = s0 * Math.sin(RAY_TH);
    const x1 = s1 * Math.cos(RAY_TH), y1 = s1 * Math.sin(RAY_TH);
    const len = s1 - s0;
    const ray = new THREE.Mesh(new THREE.BoxGeometry(len, RAY_SEC, RAY_SEC), brassTex);
    ray.position.set((x0 + x1) / 2 + SHIFT_X, BASE_LIFT + (y0 + y1) / 2, 0);
    ray.rotation.z = RAY_TH;
    g.add(ray);
    console.log(`ray: brass ${RAY_SEC} sq at 60deg, math (${x0.toFixed(3)},${y0.toFixed(3)})->(${x1.toFixed(3)},${y1.toFixed(3)}) — the radius frozen mid-turn, passing the crossing (${X_STAR.toFixed(4)}, ${Y_STAR.toFixed(4)})`);
}

// ---- the frozen moment: iron falling line at y* ------------------------------------------------------------
{
    const x0 = 0.05, x1 = W - 0.05;                              // embedded into both vertical members
    const line = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, LINE_SEC, LINE_SEC), ironTex);
    line.position.set((x0 + x1) / 2 + SHIFT_X, BASE_LIFT + Y_STAR, 0);
    g.add(line);
    console.log(`falling line: iron ${LINE_SEC} sq at y* ${Y_STAR.toFixed(4)} (= 2W/3), member-face to member-face — the line frozen mid-fall`);
}

// ---- the pi-stud: the landing -----------------------------------------------------------------------------
{
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(STUD_R, STUD_R, STUD_H, 12), brassTex);
    stud.position.set(PI_X + SHIFT_X, BASE_LIFT + FRAME_SEC / 2 + STUD_H / 2, 0);
    g.add(stud);
    console.log(`pi-stud: brass r ${STUD_R} h ${STUD_H} at x = 2W/pi = ${PI_X.toFixed(6)} — where the curve lands, pi is written`);
}

// ---- glow bead at the frozen crossing (KEEP) ----------------------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(X_STAR + SHIFT_X, BASE_LIFT + Y_STAR, BEAD_Z);  // half-embedded on the ribbon's front face
    glowGroup.add(bead);
    glowGroup.name = "glow_qu_1";
    g.add(glowGroup);
    console.log(`crossing bead: glow_qu_1 r ${BEAD_R} at (${X_STAR.toFixed(4)}, ${(BASE_LIFT + Y_STAR).toFixed(4)}) — the frozen moment, sole night element`);
}

// ---- census + envelope/NaN laws --------------------------------------------------------------------------------
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

const merged = mergeByMaterial(g, "quadratrix");
writeFileSync("agents/arthur/assets/village_quadratrix3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_quadratrix3.glb`);
