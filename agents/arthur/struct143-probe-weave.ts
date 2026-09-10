// struct143-probe-weave.ts — diagnostic for the v2 refine of the tensegrity
// needle (struct-142 fix class 2: "saddle tendons run parallel-flush to
// non-anchor struts"). Re-derives the v1 parametric tables verbatim from
// mkv3-tensegrity.ts and prints every non-anchor tendon-vs-strut distance
// under 0.25 m, sorted, plus per-tendon minima. Read-only; writes nothing.
import * as THREE from "three";

const STAGES = [
    { yb: 0.20, yt: 2.10, Rb: 1.55, Rt: 1.30 },
    { yb: 2.35, yt: 4.20, Rb: 1.10, Rt: 0.95 },
    { yb: 4.45, yt: 6.05, Rb: 0.85, Rt: 0.72 },
];
const TWIST = Math.PI / 3;
type V3 = THREE.Vector3;
const strutB: V3[][] = [], strutT: V3[][] = [];
for (let k = 0; k < 3; k++) {
    const S = STAGES[k], alpha = k * TWIST;
    strutB.push([]); strutT.push([]);
    for (let i = 0; i < 3; i++) {
        const phi = alpha + (2 * Math.PI * i) / 3;
        strutB[k].push(new THREE.Vector3(S.Rb * Math.cos(phi), S.yb, S.Rb * Math.sin(phi)));
        strutT[k].push(new THREE.Vector3(S.Rt * Math.cos(phi + TWIST), S.yt, S.Rt * Math.sin(phi + TWIST)));
    }
}
function segSegDist(p1: V3, q1: V3, p2: V3, q2: V3): number {
    const d1 = new THREE.Vector3().subVectors(q1, p1), d2 = new THREE.Vector3().subVectors(q2, p2), r = new THREE.Vector3().subVectors(p1, p2);
    const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r);
    let s = 0, t = 0;
    if (a <= 1e-12 && e <= 1e-12) return r.length();
    if (a <= 1e-12) { t = THREE.MathUtils.clamp(f / e, 0, 1); }
    else {
        const c = d1.dot(r);
        if (e <= 1e-12) { s = THREE.MathUtils.clamp(-c / a, 0, 1); }
        else {
            const b = d1.dot(d2), den = a * e - b * b;
            s = den !== 0 ? THREE.MathUtils.clamp((b * f - c * e) / den, 0, 1) : 0;
            t = (b * s + f) / e;
            if (t < 0) { t = 0; s = THREE.MathUtils.clamp(-c / a, 0, 1); }
            else if (t > 1) { t = 1; s = THREE.MathUtils.clamp((b - c) / a, 0, 1); }
        }
    }
    const c1 = new THREE.Vector3().addVectors(p1, d1.multiplyScalar(s)), c2 = new THREE.Vector3().addVectors(p2, d2.multiplyScalar(t));
    return c1.distanceTo(c2);
}
type Tendon = { name: string; a: V3; b: V3; anchors: [number, number][] };
const tendons: Tendon[] = [];
for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    tendons.push({ name: `saddle s${k} T${i}->B${j}`, a: strutT[k][i].clone(), b: strutB[k][j].clone(), anchors: [[k, i], [k, j]] });
}
for (let k = 0; k < 2; k++) for (let i = 0; i < 3; i++)
    tendons.push({ name: `gapwire j${k} T${i}->B'${i}`, a: strutT[k][i].clone(), b: strutB[k + 1][i].clone(), anchors: [[k, i], [k + 1, i]] });
for (let i = 0; i < 3; i++)
    tendons.push({ name: `crown T${i}->bead`, a: strutT[2][i].clone(), b: new THREE.Vector3(0, 6.62, 0), anchors: [[2, i], [-1, -1]] });

const rows: { d: number; tn: string; st: string }[] = [];
for (const tn of tendons) {
    let minD = Infinity, minSt = "";
    for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) {
        if (tn.anchors.some(([ak, ai]) => ak === k && ai === i)) continue;
        const d = segSegDist(tn.a, tn.b, strutB[k][i], strutT[k][i]);
        if (d < minD) { minD = d; minSt = `strut ${k},${i}`; }
        if (d < 0.25) rows.push({ d, tn: tn.name, st: `strut ${k},${i}` });
    }
    console.log(`${tn.name.padEnd(24)} min non-anchor ${minD.toFixed(3)} m  (${minSt})`);
}
rows.sort((x, y) => x.d - y.d);
console.log(`\n-- all non-anchor approaches under 0.25 m (flush-risk ranking) --`);
for (const r of rows) console.log(`${r.d.toFixed(3)}  ${r.tn}  vs  ${r.st}`);
