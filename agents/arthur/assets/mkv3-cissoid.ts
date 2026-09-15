// mkv3-cissoid.ts — STRUCTURES LANE struct-188, Round 11 commission R11-17
// THE DELIAN ALTAR — the Cissoid of Diocles.
//
// One idea: the curve that doubled the cube, standing between its own
// generating circle (brass arch) and the tangent line it never reaches
// (iron post). Stone ribbon = the cissoid from ground cusp toward the
// asymptote; crown bead at the exact cissoid∩circle crossing (a,a); two
// mean-proportional studs + mean bar on the plinth diameter (m1 = a·2^{1/3},
// the delivered edge of the doubled altar). Folly class, no walk owed.
//
// Laws honored: texMat lanes (struct-38) — ci_stone cell 32 / ci_brass /
// ci_iron; bead emissive 0x9a7030 @ 1.0 in-GLB (dusk lineage); glow census
// exactly 1 KEEP (glow_ci_1); NaN 0; envelope law vs probe contract.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";
import {
    S, ASYM, SEC, N_VOUS, RING_TUBE, POST_SEC, POST_TOP, STUD_R, STUD_TOP,
    BAR_SEC, BEAD_R, BEAD_Z, PLINTH, ARCH_D, SHIFT_X, ENVELOPE,
    cissoidX, cissoidY, yOfX, thOfX, M1, M2, BAR_Y, POST_INNER,
    X_START, X_END,
} from "../struct188-probe-cissoid.ts";

// ---- materials ----------------------------------------------------------------------------------------
const stoneTex = texMat("ci_stone", [0x87817a, 0x8f8981, 0x7d7770], { rough: 0.95, scale: 2, weights: [3, 1, 1], cell: 32, seed: 180 });
const brassTex = texMat("ci_brass", [0xbd985c, 0xb0874a, 0xc9a76b], { rough: 0.55, metal: 0.65, scale: 1.2, weights: [3, 1, 1], cell: 24, seed: 71 });
const ironTex = texMat("ci_iron", [0x4a4a50, 0x3f3f45, 0x55555c], { rough: 0.8, metal: 0.35, scale: 1.5, weights: [3, 1, 1], cell: 20, seed: 61 });

const glowMat = (() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
    (m as any).emissive = new THREE.Color(0x9a7030);
    (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
    return m;
})();

const g = new THREE.Group();
// ROOT STAYS IDENTITY (decode-caught law): mergeByMaterial bakes the root
// transform into merged buckets but re-mounts KEEP groups WITHOUT it — a
// shifted root silently displaces every glow bead by the shift. All
// positions below are authored in FINAL world-local coords (probe frame +
// SHIFT_X on x).

// ---- stone plinth (the altar's ground) ------------------------------------------------------------------
{
    const w = PLINTH.x1 - PLINTH.x0;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w, PLINTH.h, PLINTH.hz * 2), stoneTex);
    plinth.position.set((PLINTH.x0 + PLINTH.x1) / 2 + SHIFT_X, PLINTH.h / 2, 0);
    g.add(plinth);
    console.log(`plinth: ${w.toFixed(2)}×${PLINTH.h}×${PLINTH.hz * 2} top y ${PLINTH.h} — the altar floor`);
}

// ---- the cissoid ribbon: 96 arc-uniform tangent voussoirs ----------------------------------------------
{
    // stations: exact curve points, arc-uniform (probe L6 law — same snap)
    const M = 8000;
    const th0 = thOfX(X_START), th1 = thOfX(X_END);
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= M; i++) {
        const th = th1 + (i / M) * (th0 - th1);
        pts.push([cissoidX(th), cissoidY(th)]);
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
        const xa = pts[idx][0] + t * (pts[idx + 1][0] - pts[idx][0]);
        const th = thOfX(xa);
        stations.push([cissoidX(th), cissoidY(th)]);
    }
    // voussoirs: tangent-oriented boxes between consecutive stations
    let count = 0;
    for (let j = 0; j < N_VOUS; j++) {
        const [xa, ya] = stations[j], [xb, yb] = stations[j + 1];
        const dx = xb - xa, dy = yb - ya;
        const len = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);
        const box = new THREE.Mesh(new THREE.BoxGeometry(len + 0.006, SEC, SEC), stoneTex);
        box.position.set((xa + xb) / 2 + SHIFT_X, (ya + yb) / 2, 0);
        box.rotation.z = ang;
        g.add(box);
        count++;
    }
    if (count !== N_VOUS) throw Error(`voussoir census ${count} != ${N_VOUS}`);
    console.log(`ribbon: ${N_VOUS} tangent voussoirs ${SEC}×${SEC}, arc ${total.toFixed(3)} m, x ∈ [${X_START.toFixed(3)}, ${X_END.toFixed(3)}] — the cissoid y²(2a−x)=x³, a=${S}`);
}

// ---- generating arch: brass tube on the trimmed upper arc -----------------------------------------------
{
    const N = 128;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
        const t = ARCH_D + (i / N) * (Math.PI - 2 * ARCH_D);
        pts.push(new THREE.Vector3(S + S * Math.cos(t) + SHIFT_X, S * Math.sin(t), 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const arch = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, RING_TUBE, 10, false), brassTex);
    g.add(arch);
    console.log(`generating arch: brass tube r ${RING_TUBE}, arc center (${S},0) r ${S} — springs at plinth top (y ${PLINTH.h}), crown (a,a) — the curve's parent`);
}

// ---- tangent post: the asymptote made solid ---------------------------------------------------------------
{
    const post = new THREE.Mesh(new THREE.BoxGeometry(POST_SEC, POST_TOP, POST_SEC), ironTex);
    post.position.set(ASYM + SHIFT_X, POST_TOP / 2, 0);
    g.add(post);
    console.log(`tangent post: iron ${POST_SEC}×${POST_TOP}×${POST_SEC} at x=${ASYM} — the line x=2a the curve approaches forever`);
}

// ---- mean-proportional studs + mean bar ------------------------------------------------------------------
{
    let studs = 0;
    for (const [name, x] of [["m1", M1], ["m2", M2]] as const) {
        const stud = new THREE.Mesh(new THREE.CylinderGeometry(STUD_R, STUD_R, STUD_TOP, 12), brassTex);
        stud.position.set(x + SHIFT_X, STUD_TOP / 2, 0);
        g.add(stud);
        studs++;
    }
    if (studs !== 2) throw Error(`stud census ${studs} != 2`);
    const barLen = POST_INNER - M1;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barLen, BAR_SEC, BAR_SEC), brassTex);
    bar.position.set((M1 + POST_INNER) / 2 + SHIFT_X, BAR_Y, 0);
    g.add(bar);
    console.log(`mean studs: brass r ${STUD_R} at x m1=${M1.toFixed(4)}, m2=${M2.toFixed(4)}; mean bar y ${BAR_Y.toFixed(4)} spanning [${M1.toFixed(3)}, ${POST_INNER.toFixed(3)}] — a:m1:m2:2a geometric, m1³=2a³`);
}

// ---- crown bead (glow KEEP) -------------------------------------------------------------------------------
const glowGroup = new THREE.Group();
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 20, 14), glowMat);
    bead.position.set(S + SHIFT_X, S, BEAD_Z); // the exact crossing (a,a), seated on the front face
    glowGroup.add(bead);
    glowGroup.name = "glow_ci_1";
    g.add(glowGroup);
    console.log(`crown bead: glow_ci_1 r ${BEAD_R} at (${S}, ${S}) — the exact crossing, sole night element`);
}

// ---- shift + census + envelope/NaN laws --------------------------------------------------------------------
// (root identity — shift already baked into every position above)
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

const merged = mergeByMaterial(g, "cissoid");
writeFileSync("agents/arthur/assets/village_cissoid3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_cissoid3.glb`);
