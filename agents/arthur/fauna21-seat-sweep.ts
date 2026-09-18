// fauna21-seat-sweep.ts — live-census SAT sweep for the fauna-21 dairy
// cows in the fauna-20 candidate zone (meadow E of the pig sty, center
// ~(24, 40.75); 6.4m clear of solids per census). OBB from the DECODE
// envelope (local x −1.700..1.400, z −1.150..1.864 → center (−0.150,
// +0.357), half (1.550, 1.507)), rotated by candidate yaw. Exemptions:
// films/riders (bbox height ≤ 0.5), suspended decor (y ≥ 2 base), lights
// (no bbox). Constraint: worst solid gap ≥ 1.4m (sub-1.4 pinch law).
// Preference: closest to the fauna-20 zone center, tie-break toward the
// mosaic-row visitor line (z smaller = closer to the NE visitor line).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// my decoded OBB
const CX = -0.150, CZ = 0.357, HW = 1.550, HD = 1.507;
const YAW = 0.66;

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-cow-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films/rider films
    if (e.pos[1] >= 1.8) return false;             // suspended decor
    return true;
});
console.log(`census ${ents.length} entities, ${solids.length} solids in SAT set`);

const obb = (wx: number, wz: number, yaw: number, hw: number, hd: number) => {
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    return { x: wx, z: wz, yaw, hw, hd, ax: [cos, -sin] as [number, number], az: [sin, cos] as [number, number] };
};
const gap = (a: any, b: any) => {
    const dx = a.x - b.x, dz = a.z - b.z;
    const axes: [number, number][] = [a.ax, a.az, b.ax, b.az];
    let best = -Infinity;
    for (const [ux, uz] of axes) {
        const pa = a.hw * Math.abs(a.ax[0] * ux + a.ax[1] * uz) + a.hd * Math.abs(a.az[0] * ux + a.az[1] * uz);
        const pb = b.hw * Math.abs(b.ax[0] * ux + b.ax[1] * uz) + b.hd * Math.abs(b.az[0] * ux + b.az[1] * uz);
        const g = Math.abs(dx * ux + dz * uz) - pa - pb;
        if (g > best) best = g;
    }
    return best;
};

const results: any[] = [];
for (let x = 21.0; x <= 27.5; x += 0.25) {
    for (let z = 38.0; z <= 43.5; z += 0.25) {
        const cos = Math.cos(YAW), sin = Math.sin(YAW);
        const wx = x + CX * cos + CZ * sin, wz = z - CX * sin + CZ * cos;
        const me = obb(wx, wz, YAW, HW, HD);
        let worst = Infinity, worstId = "";
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 18) continue;
            const b = e.bbox;
            const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
            const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
            const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
            const g = gap(me, obb(ewx, ewz, e.yaw, b.size[0] / 2, b.size[2] / 2));
            if (g < worst) { worst = g; worstId = e.id; }
        }
        if (worst >= 1.4) results.push({ x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId });
    }
}
console.log(`qualifying seats (gap ≥ 1.4m): ${results.length}`);
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: closest to the fauna-20 candidate center (24, 40.75)
results.sort((a: any, b: any) => (Math.hypot(a.x - 24, a.z - 40.75) + Math.abs(a.z - 40.75) * 0.15) - (Math.hypot(b.x - 24, b.z - 40.75) + Math.abs(b.z - 40.75) * 0.15));
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
