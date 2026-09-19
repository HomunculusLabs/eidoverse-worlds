// struct238-seatprobe-co.ts — focused seat probe: E band az2-4.5 × r94-100,
// composing the E-axis procession's FIFTH station (ruledtower az0 r58 ->
// ssd az9 r66 -> tetrahelix az4 r76 -> rt az359.5 r87.5 -> co az~3.5 r~96,
// rhythm 8/10/13/10m) AND the E octant band (ssd + tetrahelix the octant's
// forms; + co -> 3, soft cap 6 NO exceedance). Prints NN / dodecagon-exact
// SAT gap / walk-clear + composition distances at each candidate with the
// yaw law applied, so the final seat is chosen on real numbers (marginal-gap
// seats rejected at selection, not at the placer).
import { readFileSync } from "node:fs";
const CFG = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = CFG.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

async function geom(): Promise<Record<string, any>> {
    const r = await fetch(`${base}/geom?world=commons-next`);
    if (!r.ok) throw Error(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const E = await geom();
const ents = Object.values(E);
console.log(`fresh census: ${ents.length} entities`);

const R = 4.05, N = 12;
const LOC = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    return [R * Math.cos(a), R * Math.sin(a)] as [number, number];
});
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
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
function pointPolyDist(px: number, pz: number, P: [number, number][]): number {
    let inside = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [xi, zi] = P[i], [xj, zj] = P[j];
        if ((zi > pz) !== (zj > pz) && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) inside = !inside;
    }
    if (inside) return 0;
    let d = 1e9;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [xi, zi] = P[i], [xj, zj] = P[j];
        const ex = xj - xi, ez = zj - zi, L2 = ex * ex + ez * ez || 1;
        const t = Math.max(0, Math.min(1, ((px - xi) * ex + (pz - zi) * ez) / L2));
        d = Math.min(d, Math.hypot(px - (xi + t * ex), pz - (zi + t * ez)));
    }
    return d;
}
const radBound = new Map<string, number>();
for (const e of ents) {
    const bb = e.bbox;
    if (!bb || (bb.max && (bb.max[1] - bb.min[1]) <= 0.5)) continue;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = (bb.size ?? [0, 0, 0])[0] / 2, hz = (bb.size ?? [0, 0, 0])[2] / 2;
    radBound.set(e.id, Math.hypot(ecx, ecz) + Math.hypot(hx, hz));
}
function satWorst(pos: number[], yaw: number) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const H = LOC.map(([lx, lz]) => [pos[0] + lx * cy + lz * sy, pos[2] - lx * sy + lz * cy] as [number, number]);
    let worst = 1e9, wid = "";
    for (const e of ents) {
        if (GROUND.test(e.id)) continue;
        const discR = DISC_N[e.id];
        if (discR !== undefined) {
            const g = pointPolyDist(e.pos[0], e.pos[2], H) - discR;
            if (g < worst) { worst = g; wid = e.id; }
            continue;
        }
        const rb = radBound.get(e.id);
        if (rb === undefined) continue;
        const cd = Math.hypot(e.pos[0] - pos[0], e.pos[2] - pos[2]);
        if (cd - R - rb >= 1.4) { if (cd - R - rb < worst) { worst = cd - R - rb; wid = `${e.id}(radial)`; } continue; }
        const bb = e.bbox, ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
        const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
        const ey = e.yaw ?? 0, ecy = Math.cos(ey), esy = Math.sin(ey);
        const C: [number, number][] = [[hx, hz], [hx, -hz], [-hx, -hz], [-hx, hz]].map(([lx, lz]) =>
            [e.pos[0] + ecx * ecy + lz * esy + lx * ecy, e.pos[2] - ecx * esy + lz * ecy - lx * esy] as [number, number]);
        const g = polyGap(H, C);
        if (g < worst) { worst = g; wid = e.id; }
    }
    return { g: worst, id: wid };
}
function nn(pos: number[]) {
    let best = 1e9, bid = "";
    for (const e of ents) {
        if (!e.id.startsWith("nx-struct-") || e.id.endsWith("-l")) continue;
        const d = Math.hypot(e.pos[0] - pos[0], e.pos[2] - pos[2]);
        if (d < best) { best = d; bid = e.id; }
    }
    return { n: best, id: bid };
}
const walkers = ents.filter(e => (e.id.startsWith("nx-approach-") && !e.id.includes("lamp")) || /nx-town-(paths|roads)/.test(e.id));
function walkClear(pos: number[]) {
    let worst = 1e9, wid = "";
    for (const e of walkers) {
        const bb = e.bbox || {} as any;
        const hx = ((bb.size ?? [0, 0, 0])[0]) / 2, hz = ((bb.size ?? [0, 0, 0])[2]) / 2;
        const d = Math.hypot(e.pos[0] - pos[0], e.pos[2] - pos[2]) - Math.max(hx, hz);
        if (d < worst) { worst = d; wid = e.id; }
    }
    return { w: worst, id: wid };
}
const yawFor = (azDeg: number) => (((-120 - azDeg) % 360) + 360) % 360 * Math.PI / 180;
const rt = E["nx-struct-rt"], thx = E["nx-struct-tetrahelix"], ssd = E["nx-struct-ssd"];

console.log(`\nseat probe az2-4.5 x r94-100 (hard law NN>=8 gap>=1.4 walk>=3; prefer gap>=1.6, NN in 10-20 band):`);
for (let az = 2; az <= 4.5; az += 0.5) {
    for (let r = 94; r <= 100; r += 0.5) {
        const a = az * Math.PI / 180;
        const pos = [r * Math.cos(a), 0, r * Math.sin(a)];
        const { n, id: nid } = nn(pos);
        const { g, id: gid } = satWorst(pos, yawFor(az));
        const { w, id: wid } = walkClear(pos);
        const dRt = rt ? Math.hypot(rt.pos[0] - pos[0], rt.pos[2] - pos[2]) : NaN;
        const dThx = thx ? Math.hypot(thx.pos[0] - pos[0], thx.pos[2] - pos[2]) : NaN;
        const dSsd = ssd ? Math.hypot(ssd.pos[0] - pos[0], ssd.pos[2] - pos[2]) : NaN;
        const ok = n >= 8 && g >= 1.4 && w >= 3;
        const good = n >= 10 && g >= 1.6 && n <= 24;
        console.log(`  az${az.toFixed(1).padStart(5)} r${r.toFixed(1).padStart(5)} ${ok ? (good ? "GOOD" : "ok  ") : "REJ "} NN ${n.toFixed(2).padStart(5)} (${nid.padEnd(24)}) gap ${g.toFixed(2).padStart(5)} (${gid.padEnd(30)}) walk ${w.toFixed(2).padStart(5)} dRT ${dRt.toFixed(1)} dTHX ${dThx.toFixed(1)} dSSD ${dSsd.toFixed(1)} pos (${pos[0].toFixed(3)},${pos[2].toFixed(3)}) yaw ${yawFor(az).toFixed(6)}`);
    }
}
