// struct2-sat-preflight.ts — read-only candidate sweep for the Observatory.
// Rotated SAT (align-1 convention) against the LIVE census, with the standing
// ground-layer + suspended-decor exemptions. No verbs, no uploads.
import { readFileSync } from "node:fs";

type O = { c: [number, number]; u: [number, number]; v: [number, number]; hu: number; hv: number; id: string; susp: boolean };
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

// Observatory target OBB from the decoded group bbox (local, centered by
// bbox center — the shell is near-symmetric; meridian feet are inside R).
const BB = { min: [-3.37, -0.0, -3.32], max: [3.37, 4.466, 4.0] };
const lx = (BB.min[0] + BB.max[0]) / 2, lz = (BB.min[2] + BB.max[2]) / 2;
const HU = (BB.max[0] - BB.min[0]) / 2, HV = (BB.max[2] - BB.min[2]) / 2;

function obb(id: string, pos: number[], yaw: number, bb: any, susp = false): O {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const cx = (bb.min[0] + bb.max[0]) / 2, cz = (bb.min[2] + bb.max[2]) / 2;
    return {
        id, susp,
        c: [pos[0] + cx * c + cz * s, pos[2] - cx * s + cz * c],
        u: [c, -s], v: [s, c],
        hu: (bb.max[0] - bb.min[0]) / 2, hv: (bb.max[2] - bb.min[2]) / 2,
    };
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
    const h = bb.max[1] - bb.min[1];
    // ground-layer exemption: thin flat layers (paths/roads)
    if (h <= 0.5) continue;
    // suspended-decor exemption: hanging above our roofline
    const susp = bb.min[1] > 4.5;
    others.push(obb(e.id, e.pos, e.yaw ?? 0, bb, susp));
}

// Candidate sweep: NW quadrant, r 28..62, every 2deg/2m
const results: any[] = [];
for (let deg = 292; deg <= 340; deg += 2) {
    for (let r = 28; r <= 62; r += 2) {
        const a = deg * Math.PI / 180;
        const px = r * Math.cos(a), pz = r * Math.sin(a);
        const T: O = { id: "target", c: [px + lx, pz + lz], u: [1, 0], v: [0, 1], hu: HU, hv: HV };
        let minGap = Infinity, worst = "";
        for (const o of others) {
            if (o.susp) continue;
            const g = gap(T, o);
            if (g < minGap) { minGap = g; worst = o.id; }
        }
        if (minGap >= 1.4) results.push({ deg, r, x: +px.toFixed(2), z: +pz.toFixed(2), minGap: +minGap.toFixed(2), worst });
    }
}
results.sort((p, q) => (q.minGap - p.minGap));
console.log(`passing candidates (gap>=1.4m): ${results.length}`);
console.log("--- best gap ---");
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
const near = [...results].sort((p, q) => (p.r - q.r) || (q.minGap - p.minGap));
console.log("--- nearest-in ---");
for (const c of near.slice(0, 8)) console.log(JSON.stringify(c));
const wedge = results.filter(c => c.deg >= 292 && c.deg <= 310 && c.r <= 50).sort((p, q) => (p.r - q.r) || (q.minGap - p.minGap));
console.log("--- NW wedge (292-310deg, r<=50) ---");
for (const c of wedge) console.log(JSON.stringify(c));
export {};
