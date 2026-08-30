// struct-sat-preflight.ts — read-only candidate sweep for structures-lane
// siting. Rotated SAT (align-1 convention) against the LIVE census with the
// standing ground-layer + suspended-decor exemptions. No verbs, no uploads.
// Usage: bun struct-sat-preflight.ts <label> <hx> <hz> [degMin degMax rMin rMax [degStep rStep]]
import { readFileSync } from "node:fs";

const [label, hxS, hzS, dMinS, dMaxS, rMinS, rMaxS, dStepS, rStepS] = process.argv.slice(2);
const HU = +hxS, HV = +hzS;
const dMin = +(dMinS ?? 292), dMax = +(dMaxS ?? 340), rMin = +(rMinS ?? 28), rMax = +(rMaxS ?? 62);
const dStep = +(dStepS ?? 2), rStep = +(rStepS ?? 2);

type O = { c: [number, number]; u: [number, number]; v: [number, number]; hu: number; hv: number; id: string; susp: boolean };
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

function obb(id: string, pos: number[], yaw: number, bb: any, susp = false): O {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const cx = (bb.min[0] + bb.max[0]) / 2, cz = (bb.min[2] + bb.max[2]) / 2;
    return { id, susp, c: [pos[0] + cx * c + cz * s, pos[2] - cx * s + cz * c], u: [c, -s], v: [s, c], hu: (bb.max[0] - bb.min[0]) / 2, hv: (bb.max[2] - bb.min[2]) / 2 };
}
function gap(A: O, B: O): number {
    let best = -Infinity;
    for (const ax of [A.u, A.v, B.u, B.v]) {
        const dd = Math.abs((B.c[0] - A.c[0]) * ax[0] + (B.c[1] - A.c[1]) * ax[1]);
        const ra = A.hu * Math.abs(A.u[0] * ax[0] + A.u[1] * ax[1]) + A.hv * Math.abs(A.v[0] * ax[0] + A.v[1] * ax[1]);
        const rb = B.hu * Math.abs(B.u[0] * ax[0] + B.u[1] * ax[1]) + B.hv * Math.abs(B.v[0] * ax[0] + B.v[1] * ax[1]);
        best = Math.max(best, dd - ra - rb);
    }
    return best;
}

const res = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!res.ok) throw new Error(`geom ${res.status}`);
const data: any = await res.json();
const others: O[] = [];
for (const e of data.entities ?? []) {
    if (!e.bbox) continue;
    if (e.id.startsWith("nx-struct-")) continue;
    const bb = e.bbox;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;   // ground layer
    const susp = bb.min[1] > 4.5;                  // suspended decor
    others.push(obb(e.id, e.pos, e.yaw ?? 0, bb, susp));
}

const results: any[] = [];
for (let deg = dMin; deg <= dMax; deg += dStep) {
    for (let r = rMin; r <= rMax; r += rStep) {
        const a = deg * Math.PI / 180;
        const px = r * Math.cos(a), pz = r * Math.sin(a);
        const T: O = { id: "target", c: [px, pz], u: [1, 0], v: [0, 1], hu: HU, hv: HV };
        let minGap = Infinity, worst = "";
        for (const o of others) {
            if (o.susp) continue;
            const g = gap(T, o);
            if (g < minGap) { minGap = g; worst = o.id; }
        }
        const row = { deg, r, x: +px.toFixed(2), z: +pz.toFixed(2), minGap: +minGap.toFixed(2), worst };
        if (minGap >= 1.4) results.push(row);
        else results.push({ ...row, FAIL: true });
    }
}
results.sort((p, q) => q.minGap - p.minGap);
console.log(`${label}: passing candidates (gap>=1.4m): ${results.length}`);
console.log("--- best gap ---");
for (const c of results.slice(0, 6)) console.log(JSON.stringify(c));
const near = [...results].sort((p, q) => (p.r - q.r) || (q.minGap - p.minGap));
console.log("--- nearest-in ---");
for (const c of near.slice(0, 10)) console.log(JSON.stringify(c));
export {};
