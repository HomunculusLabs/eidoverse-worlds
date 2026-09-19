// struct240-debug-orchard.ts — diagnose the probe-vs-placer SAT
// disagreement at az150 r76.5: probe's conservative radial skip read
// orchard-0020 as clear (>=3.68 class), placer's exact icosagon-vs-OBB
// polyGap says 0.64. Print cd, radBound, conservative value, exact gap,
// corner arrays, and the H polygon so the wrong computation is named.
import { readFileSync } from "node:fs";
const CFG = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = CFG.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const E = Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
console.log(`census ${Object.keys(E).length}`);

const POS = [-66.250943, 0.004762, 38.25];
const YAW = 1.570796, R = 2.90, N = 20;
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const LOC = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    return [R * Math.cos(a), R * Math.sin(a)] as [number, number];
});
const H: [number, number][] = LOC.map(([lx, lz]) => [POS[0] + lx * cy + lz * sy, POS[2] - lx * sy + lz * cy] as [number, number]);

function polyGap(A: [number, number][], B: [number, number][]): number {
    const axes: [number, number][] = [];
    for (const P of [A, B]) for (let i = 0; i < P.length; i++) {
        const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length];
        const ex = x2 - x1, ey = y2 - y1, L = Math.hypot(ex, ey) || 1;
        axes.push([-ey / L, ex / L]);
    }
    let best = -1e9;
    for (const [ax, ay] of axes) {
        const aMin = Math.min(...A.map(p => p[0] * ax + p[1] * ay)), aMax = Math.max(...A.map(p => p[0] * ax + p[1] * ay));
        const bMin = Math.min(...B.map(p => p[0] * ax + p[1] * ay)), bMax = Math.max(...B.map(p => p[0] * ax + p[1] * ay));
        best = Math.max(best, Math.max(bMin - aMax, aMin - bMax));
    }
    return best;
}

for (const id of ["nx-cultivation-orchard-0020", "nx-dress-nw-dryingracks-001", "nx-cultivation-lavender-0027", "nx-cultivation-lavender-0006", "nx-cultivation-orchard-0033"]) {
    const e = E[id];
    if (!e) { console.log(`${id}: ABSENT`); continue; }
    const bb = e.bbox;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0, ecy = Math.cos(ey), esy = Math.sin(ey);
    const C: [number, number][] = [[hx, hz], [hx, -hz], [-hx, -hz], [-hx, hz]].map(([lx, lz]) =>
        [e.pos[0] + ecx * ecy + lz * esy + lx * ecy, e.pos[2] - ecx * esy + lz * ecy - lx * esy] as [number, number]);
    const g = polyGap(H, C);
    const cd = Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]);
    const rb = Math.hypot(ecx, ecz) + Math.hypot(hx, hz);
    console.log(`\n${id}:`);
    console.log(`  pos (${e.pos[0].toFixed(3)}, ${e.pos[2].toFixed(3)}) yaw ${ey.toFixed(6)} bbox size [${bb.size.map((n: number) => n.toFixed(2)).join(",")}] center [${(bb.center ?? [0, 0, 0]).map((n: number) => n.toFixed(2)).join(",")}]`);
    console.log(`  cd ${cd.toFixed(3)} radBound ${rb.toFixed(3)} conservative cd-R-rb ${(cd - R - rb).toFixed(3)} (>=1.4 => probe would SKIP)`);
    console.log(`  EXACT polyGap ${g.toFixed(3)}`);
    console.log(`  corners: ${C.map(c => `(${c[0].toFixed(2)},${c[1].toFixed(2)})`).join(" ")}`);
}

// ground-truth cross-check: brute-force min distance between H polygon
// and the orchard OBB polygon via dense edge sampling (independent of
// polyGap's SAT math)
const oc = E["nx-cultivation-orchard-0020"];
if (oc) {
    const bb = oc.bbox;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = oc.yaw ?? 0, ecy = Math.cos(ey), esy = Math.sin(ey);
    const C: [number, number][] = [[hx, hz], [hx, -hz], [-hx, -hz], [-hx, hz]].map(([lx, lz]) =>
        [oc.pos[0] + ecx * ecy + lz * esy + lx * ecy, oc.pos[2] - ecx * esy + lz * ecy - lx * esy] as [number, number]);
    const seg = (P: [number, number][], n: number) => {
        const pts: [number, number][] = [];
        for (let i = 0; i < P.length; i++) {
            const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length];
            for (let k = 0; k < n; k++) pts.push([x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n]);
        }
        return pts;
    };
    const A = seg(H, 64), B = seg(C, 64);
    let mind = 1e9;
    for (const a of A) for (const b of B) mind = Math.min(mind, Math.hypot(a[0] - b[0], a[1] - b[1]));
    // containment check: any orchard corner inside H, or H corner inside orchard
    const inside = (p: [number, number], P: [number, number][]) => {
        let c = false;
        for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
            const [xi, zi] = P[i], [xj, zj] = P[j];
            if ((zi > p[1]) !== (zj > p[1]) && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi) c = !c;
        }
        return c;
    };
    console.log(`\nBRUTE-FORCE orchard-0020: min edge-to-edge dist ${mind.toFixed(3)}`);
    console.log(`  orchard corners inside H: ${C.filter(c => inside(c, H)).length}/4; H corners inside orchard: ${H.filter(c => inside(c, C)).length}/${H.length}`);
}
