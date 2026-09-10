// struct-147 probe (probe law 11): falsify the native gameplay-18m IDENTITY-FAIL rationale
// ("strut ends converge and touch at shared nodes — pin-jointed truss read") against the
// replica's 3D geometry projected through the EXACT review-model.ts gameplay camera:
//   camera pos [0, 1.65, 18], target (0, max(0.7, 7.08*0.38=2.69), 0), fov 42, 960x720.
// Question: in the projected frame, how many px separate strut-ENDS from the nodes they
// allegedly touch? Byte-anchored 3D fact: min strut-strut AXIS gap = 0.461 m; strut radius 0.065.
// If projected end-to-node gaps are >> strut width (>=13 px), the "touching" claim is 2D
// projection crowding (struct-143 class), and identity arbitration rests on the honest
// residuals: tendon width/material (fixed in v4), not geometry.
import * as THREE from "three";

// v4 replica constants (struct142-decode-tensegrity.ts, updated this tick)
const STRUT_R = 0.065;
const STAGES = [
    { yb: 0.20, yt: 2.10, Rb: 1.55, Rt: 1.30 },
    { yb: 2.55, yt: 4.40, Rb: 1.10, Rt: 0.95 },
    { yb: 4.85, yt: 6.45, Rb: 0.85, Rt: 0.72 },
];
const TWIST = Math.PI / 3;

type V3 = THREE.Vector3;
const strutB: V3[][] = [], strutT: V3[][] = [];
for (let k = 0; k < 3; k++) {
    const S = STAGES[k], alpha = k * TWIST;
    strutB.push([]); strutT.push([]);
    for (let i = 0; i < 3; i++) {
        const th = alpha + (i * 2 * Math.PI) / 3;
        strutB[k].push(new THREE.Vector3(S.Rb * Math.cos(th), S.yb, S.Rb * Math.sin(th)));
        strutT[k].push(new THREE.Vector3(S.Rt * Math.cos(th), S.yt, S.Rt * Math.sin(th)));
    }
}

// review-model.ts camera, exact
const camera = new THREE.PerspectiveCamera(42, 960 / 720, 0.05, 100);
const target = new THREE.Vector3(0, Math.max(0.7, 7.08 * 0.38), 0);
camera.position.set(0, 1.65, 18);
camera.lookAt(target);
camera.updateMatrixWorld();
camera.updateProjectionMatrix();
const px = (p: V3): { x: number; y: number } => {
    const v = p.clone().project(camera);
    return { x: (v.x + 1) * 480, y: (1 - (v.y + 1) / 2) * 720 };
};

// scale check: strut width in px (diameter at gameplay distance) + tendon px
const strutPx = 2 * STRUT_R * (720 / (2 * 18 * Math.tan((42 * Math.PI / 180) / 2))) * (720 / 720);
console.log(`px/m at 18m: ${(720 / (2 * 18 * Math.tan((42 * Math.PI / 180) / 2))).toFixed(2)}; strut diameter px ≈ ${(2 * STRUT_R * 720 / (2 * 18 * Math.tan((42 * Math.PI / 180) / 2))).toFixed(2)}; tendon 0.080 px ≈ ${(0.080 * 720 / (2 * 18 * Math.tan((42 * Math.PI / 180) / 2))).toFixed(2)}`);

// minimum projected distance between any strut-END (B or T) and any OTHER strut's segment axis
// pure scalar math — no THREE.Vector3 inside (a prior Vector3-arg version threw undefined.x
// despite shape asserts; scalar arithmetic has no such failure mode)
type P3 = { x: number; y: number; z: number };
const sub3 = (a: P3, b: P3): P3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot3 = (a: P3, b: P3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const len3 = (a: P3): number => Math.sqrt(dot3(a, a));
function ssd(a: P3, b: P3, c: P3, d: P3): number {
    const u = sub3(b, a), v = sub3(d, c), w = sub3(a, c);
    const A = dot3(u, u), B = dot3(u, v), C = dot3(v, v), D = dot3(u, w), E = dot3(v, w);
    const den = A * C - B * B;
    let s = den > 1e-12 ? (B * E - C * D) / den : 0;
    let t = den > 1e-12 ? (A * E - B * D) / den : 0;
    s = Math.max(0, Math.min(1, s)); t = Math.max(0, Math.min(1, t));
    const p1: P3 = { x: a.x + u.x * s, y: a.y + u.y * s, z: a.z + u.z * s };
    const p2: P3 = { x: c.x + v.x * t, y: c.y + v.y * t, z: c.z + v.z * t };
    return len3(sub3(p1, p2));
}

// 3D world min strut-strut end-to-segment gap (exclude same-stage i==i same strut)
if (strutB.length !== 3 || strutT.length !== 3 || strutB.some(s => s.length !== 3) || strutT.some(s => s.length !== 3)) throw Error(`shape ${strutB.length}/${strutT.length}`);
let min3d = Infinity, where3d = "";
for (let a = 0; a < 9; a++) for (let b = 0; b < 9; b++) {
    if (a === b) continue;
    const ka = Math.floor(a / 3), ia = a % 3, kb = Math.floor(b / 3), ib = b % 3;
    const ends = [strutB[ka][ia], strutT[ka][ia]];
    for (let e = 0; e < 2; e++) {
        const end = ends[e], endName = e === 0 ? "B" : "T";
        const d = ssd(end, end, strutB[kb][ib], strutT[kb][ib]); // point(end) vs segment(B->T): degenerate first segment
        if (d < min3d) { min3d = d; where3d = `strut${ka}.${ia}${endName} vs strut${kb}.${ib}`; }
    }
}
console.log(`3D min strut-END to other-strut-axis gap: ${min3d.toFixed(3)} m (${where3d}) — byte-anchored law print says 0.461 strut-strut`);

// PROJECTED gap in px: min screen distance from any strut end to any other strut's projected axis
let minPx = Infinity, wherePx = "";
for (let a = 0; a < 9; a++) for (let b = 0; b < 9; b++) {
    if (a === b) continue;
    const ka = Math.floor(a / 3), ia = a % 3, kb = Math.floor(b / 3), ib = b % 3;
    const PB = px(strutB[kb][ib]), PT = px(strutT[kb][ib]);
    const ends = [strutB[ka][ia], strutT[ka][ia]];
    for (let e = 0; e < 2; e++) {
        const end = ends[e], endName = e === 0 ? "B" : "T";
        const P = px(end);
        // distance point-to-segment in px
        const vx = PT.x - PB.x, vy = PT.y - PB.y;
        const wx = P.x - PB.x, wy = P.y - PB.y;
        const L2 = vx * vx + vy * vy;
        let t = L2 > 1e-9 ? (wx * vx + wy * vy) / L2 : 0; t = Math.max(0, Math.min(1, t));
        const cx = PB.x + t * vx, cy = PB.y + t * vy;
        const d = Math.hypot(P.x - cx, P.y - cy);
        if (d < minPx) { minPx = d; wherePx = `strut${ka}.${ia}${endName} vs strut${kb}.${ib}`; }
    }
}
console.log(`PROJECTED min strut-end to other-strut-axis gap at gameplay 18m: ${minPx.toFixed(1)} px (${wherePx})`);
console.log(`strut projected diameter ≈ ${(2 * STRUT_R * 720 / (2 * 18 * Math.tan((42 * Math.PI / 180) / 2))).toFixed(1)} px — gap is ${minPx / (2 * STRUT_R * 720 / (2 * 18 * Math.tan((42 * Math.PI / 180) / 2))).toFixed(2)}x strut width`);
