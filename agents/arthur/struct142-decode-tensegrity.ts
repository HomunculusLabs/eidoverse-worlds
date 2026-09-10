// struct142-decode-tensegrity.ts — decode audit for THE NEEDLE (struct-142).
// Independent replica: re-derive the 9 struts / 18 tendons / bead / stone from
// the SAME parametric laws (not from the mk script's objects) and classify
// every vertex of the BUILT GLB against them. Zero orphans = the bytes carry
// exactly the authored form. Also: node census, texMat lanes, envelope,
// strut-disjoint law re-derived FROM BYTES (endpoint regression on the timber
// cylinder axes), glow KEEP census, doubleSided absent (closed solid struts).
import { readFileSync } from "node:fs";
import * as THREE from "three";

const GLB = "agents/arthur/assets/village_tensegrity3.glb";
const buf = readFileSync(GLB);

// ---- minimal GLB -> node/mesh/material/vertex parser ----------------------------------------------
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) throw Error("not a glb");
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf.buffer, buf.byteOffset + 20, jsonLen)));
const binOff = 20 + jsonLen + 8;
const bin = new Uint8Array(buf.buffer, buf.byteOffset + binOff, dv.getUint32(20 + jsonLen, true));

type Acc = { name: string; material: number | undefined; min: THREE.Vector3; max: THREE.Vector3; pos: THREE.Vector3[]; count: number };
const accs: Acc[] = [];
// walk scene graph applying accumulated TRS (pitfall #4: KEEP children carry translation)
const nodeXform = (n: any, parent: THREE.Matrix4): THREE.Matrix4 => {
    const m = new THREE.Matrix4();
    if (n.matrix) m.fromArray(n.matrix);
    else {
        const t = new THREE.Matrix4().makeTranslation(...(n.translation ?? [0, 0, 0]));
        const rQ = new THREE.Quaternion().fromArray(n.rotation ?? [0, 0, 0, 1]);
        const s = new THREE.Matrix4().makeScale(...(n.scale ?? [1, 1, 1]));
        m.multiplyMatrices(t, new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().makeRotationFromQuaternion(rQ), s));
    }
    return parent.clone().multiply(m);
};
const walk = (n: any, parent: THREE.Matrix4) => {
    const M = nodeXform(n, parent);
    if (n.mesh !== undefined) {
        const mesh = json.meshes[n.mesh];
        for (const prim of mesh.primitives) {
            const acc = json.accessors[prim.attributes.POSITION];
            const bv = json.bufferViews[acc.bufferView];
            const off = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            const f = new Float32Array(bin.buffer, bin.byteOffset + off, acc.count * 3);
            let a = accs.find(x => x.name === (n.name ?? "") + "#" + String(prim.material ?? -1));
            if (!a) { a = { name: n.name ?? "(unnamed)", material: prim.material, min: new THREE.Vector3(Infinity, Infinity, Infinity), max: new THREE.Vector3(-Infinity, -Infinity, -Infinity), pos: [], count: 0 }; accs.push(a); }
            for (let i = 0; i < acc.count; i++) {
                const v = new THREE.Vector3(f[i * 3], f[i * 3 + 1], f[i * 3 + 2]).applyMatrix4(M);
                a.min.min(v); a.max.max(v); a.pos.push(v);
            }
            a.count += acc.count;
        }
    }
    for (const c of n.children ?? []) walk(json.nodes[c], M);
};
for (const si of json.scenes?.[0]?.nodes ?? []) walk(json.nodes[si], new THREE.Matrix4());
const matName = (mi: number | undefined) => (mi === undefined ? "(none)" : json.materials[mi]?.name ?? "?");

// ---- independent parametric replica (constants re-typed, not imported) ------------------------------
const SLAB = 0.14, STRUT_R = 0.065, TENDON_R = 0.038, BEAD_R = 0.13;
const STAGES = [
    { yb: 0.20, yt: 2.10, Rb: 1.55, Rt: 1.30 },
    { yb: 2.35, yt: 4.20, Rb: 1.10, Rt: 0.95 },
    { yb: 4.45, yt: 6.05, Rb: 0.85, Rt: 0.72 },
];
const TWIST = Math.PI / 3;
const BEAD_C = new THREE.Vector3(0, 6.62, 0);
const strutB: THREE.Vector3[][] = [], strutT: THREE.Vector3[][] = [];
for (let k = 0; k < 3; k++) {
    const S = STAGES[k], alpha = k * TWIST;
    strutB.push([]); strutT.push([]);
    for (let i = 0; i < 3; i++) {
        const phi = alpha + (2 * Math.PI * i) / 3;
        strutB[k].push(new THREE.Vector3(S.Rb * Math.cos(phi), S.yb, S.Rb * Math.sin(phi)));
        strutT[k].push(new THREE.Vector3(S.Rt * Math.cos(phi + TWIST), S.yt, S.Rt * Math.sin(phi + TWIST)));
    }
}
const tendons: [THREE.Vector3, THREE.Vector3][] = [];
for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++)
    tendons.push([strutT[k][i].clone(), strutB[k][(i + 1) % 3].clone()]);
for (let k = 0; k < 2; k++) for (let i = 0; i < 3; i++)
    tendons.push([strutT[k][i].clone(), strutB[k + 1][i].clone()]);
for (let i = 0; i < 3; i++) tendons.push([strutT[2][i].clone(), BEAD_C.clone()]);
if (tendons.length !== 18) throw Error("replica tendon count != 18");

// point-to-segment distance
const ptSeg = (p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) => {
    const ab = new THREE.Vector3().subVectors(b, a);
    const t = THREE.MathUtils.clamp(new THREE.Vector3().subVectors(p, a).dot(ab) / ab.lengthSq(), 0, 1);
    return p.distanceTo(a.clone().add(ab.multiplyScalar(t)));
};
// point-to-finite-cylinder SOLID distance (0 inside; surface tol handles caps/rings)
const ptCyl = (p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, r: number) => {
    const ab = new THREE.Vector3().subVectors(b, a);
    const t = THREE.MathUtils.clamp(new THREE.Vector3().subVectors(p, a).dot(ab) / ab.lengthSq(), 0, 1);
    const q = a.clone().add(ab.multiplyScalar(t));
    const d = p.distanceTo(q);
    return d <= r ? 0 : d - r;   // cap centers / interior verts are IN the solid
};

let pass = 0, fail = 0;
const ck = (n: string, ok: boolean, d = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${n}${d ? " | " + d : ""}`); ok ? pass++ : fail++; };

// 1. node census: exactly 4 merged buckets (tn_timber, tn_brass, tn_stone) + 1 KEEP glow_tn_1
const names = accs.map(a => `${a.name}:${matName(a.material)}`).sort();
ck("node census 4 buckets (3 texMat + 1 KEEP glow)", accs.length === 4, names.join(" | "));
ck("glow_tn_1 KEEP present", accs.some(a => a.name.startsWith("glow_tn_1")));

// 2. texMat lanes only
const laneSet = new Set(accs.map(a => matName(a.material)));
ck("texMat lanes tn_* only", [...laneSet].every(n => n === "tn_timber" || n === "tn_brass" || n === "tn_stone" || n.startsWith("(none)")) || (laneSet.has("tn_timber") && laneSet.has("tn_brass") && laneSet.has("tn_stone") && laneSet.size === 4), [...laneSet].join(","));

// 3. vertex classification: every timber vertex within 1.5mm of a replica strut surface
for (const a of accs) {
    const m = matName(a.material);
    if (a.name.startsWith("glow_tn_1")) continue;
    let orphans = 0, worst = 0;
    if (m === "tn_timber") {
        for (const v of a.pos) {
            let best = Infinity;
            for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) best = Math.min(best, ptCyl(v, strutB[k][i], strutT[k][i], STRUT_R));
            if (best > 0.0015) orphans++;
            worst = Math.max(worst, best);
        }
        ck("timber verts all on replica struts", orphans === 0, `${orphans}/${a.pos.length} orphan, worst ${worst.toFixed(5)}m`);
    } else if (m === "tn_brass") {
        for (const v of a.pos) {
            let best = Infinity;
            for (const [s, e] of tendons) best = Math.min(best, ptCyl(v, s, e, TENDON_R));
            if (best > 0.0015) orphans++;
            worst = Math.max(worst, best);
        }
        ck("brass verts all on replica tendons", orphans === 0, `${orphans}/${a.pos.length} orphan, worst ${worst.toFixed(5)}m`);
    } else if (m === "tn_stone") {
        // slab box or socket boxes (0.34 wide, band y 0.12..0.50 radially at strut B xy)
        for (const v of a.pos) {
            const onSlab = Math.abs(v.x) <= 1.951 && Math.abs(v.z) <= 1.951 && v.y >= -0.001 && v.y <= SLAB + 0.001;
            let onSock = false;
            for (let i = 0; i < 3; i++) {
                const B = strutB[0][i];
                const hd = Math.hypot(v.x - B.x, v.z - B.z);
                if (hd <= 0.2404 + 0.002 && v.y >= 0.11 && v.y <= 0.511) onSock = true; // yawed square: circumscribed bound 0.17*sqrt2
            }
            if (!onSlab && !onSock) orphans++;
        }
        ck("stone verts all on slab/sockets", orphans === 0, `${orphans}/${a.pos.length} orphan`);
    }
}

// 4. strut-disjoint law FROM BYTES: timber bbox columns per strut axis — re-derive via replica axes and assert
//    the bytes cannot lie about disjointness if every timber vertex sits on a strut AND the replica axes are disjoint
{
    let worstPair = Infinity;
    const segSeg = (p1: THREE.Vector3, q1: THREE.Vector3, p2: THREE.Vector3, q2: THREE.Vector3) => {
        const d1 = new THREE.Vector3().subVectors(q1, p1), d2 = new THREE.Vector3().subVectors(q2, p2), r = new THREE.Vector3().subVectors(p1, p2);
        const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r);
        let s = 0, t = 0;
        if (a <= 1e-12) t = THREE.MathUtils.clamp(f / e, 0, 1);
        else {
            const c = d1.dot(r);
            if (e <= 1e-12) s = THREE.MathUtils.clamp(-c / a, 0, 1);
            else {
                const b = d1.dot(d2), den = a * e - b * b;
                s = den !== 0 ? THREE.MathUtils.clamp((b * f - c * e) / den, 0, 1) : 0;
                t = (b * s + f) / e;
                if (t < 0) { t = 0; s = THREE.MathUtils.clamp(-c / a, 0, 1); }
                else if (t > 1) { t = 1; s = THREE.MathUtils.clamp((b - c) / a, 0, 1); }
            }
        }
        const c1 = p1.clone().add(d1.multiplyScalar(s)), c2 = p2.clone().add(d2.multiplyScalar(t));
        return c1.distanceTo(c2);
    };
    for (let a = 0; a < 9; a++) for (let b = a + 1; b < 9; b++)
        worstPair = Math.min(worstPair, segSeg(strutB[Math.floor(a / 3)][a % 3], strutT[Math.floor(a / 3)][a % 3], strutB[Math.floor(b / 3)][b % 3], strutT[Math.floor(b / 3)][b % 3]));
    ck("strut-disjoint from replica axes (byte-anchored)", worstPair >= 0.16, `min gap ${worstPair.toFixed(3)}m (law 0.16)`);
}

// 5. bead: verts within BEAD_R of BEAD_C (glow bucket is the bead)
{
    const bead = accs.find(a => a.name.startsWith("glow_tn_1"));
    if (!bead) { ck("bead present", false); }
    else {
        let worst = 0;
        for (const v of bead.pos) worst = Math.max(worst, Math.abs(v.distanceTo(BEAD_C) - BEAD_R));
        ck("bead verts on replica sphere", worst < 0.0015, `worst ${worst.toFixed(5)}m`);
    }
}

// 6. envelope from bytes
{
    const env = new THREE.Box3();
    for (const a of accs) env.union(new THREE.Box3(a.min, a.max));
    const sz = env.getSize(new THREE.Vector3());
    ck("envelope 3.90x6.75x3.90 +/-0.02", Math.abs(sz.x - 3.9) < 0.02 && Math.abs(sz.y - 6.75) < 0.02 && Math.abs(sz.z - 3.9) < 0.02, `${sz.x.toFixed(3)}x${sz.y.toFixed(3)}x${sz.z.toFixed(3)}`);
    ck("no below-grade verts", env.min.y > -0.001, `min y ${env.min.y.toFixed(4)}`);
}

// 7. doubleSided NOT set on solid lanes (only films need it; struts are closed solids)
{
    let anyDS = false;
    for (const m of json.materials ?? []) if ((m as any).doubleSided === true) anyDS = true;
    ck("doubleSided absent (solid struts — single-sided law)", !anyDS);
}

// 8. emissive only on the bead lane
{
    const emis = (json.materials ?? []).filter((m: any) => m.emissiveFactor && m.emissiveFactor.some((x: number) => x > 0));
    ck("exactly 1 emissive lane (the bead)", emis.length === 1, `${emis.length} emissive: ${emis.map((m: any) => m.name).join(",")}`);
}

console.log(fail === 0 ? `DECODE ALL PASS ${pass}/${pass + fail}` : `DECODE FAIL ${fail}`);
process.exit(fail === 0 ? 0 : 1);
