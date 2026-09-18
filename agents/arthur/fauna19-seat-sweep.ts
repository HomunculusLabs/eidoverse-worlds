// fauna19-seat-sweep.ts — live-census SAT sweep for the fauna-19 stable
// horses on the livery east lawn (seat-scan law: derive empirically, never
// from plan prose). OBB from the DECODE envelope (local x −1.500..1.600,
// z −1.509..1.832 → center (0.050, 0.1615), half (1.550, 1.6715)), rotated
// by candidate yaw. Exemptions: films/riders (bbox height ≤ 0.5), suspended
// decor (y ≥ 2 base), lights (no bbox). Constraint: worst solid gap ≥ 1.4m
// (sub-1.4 pinch law). Preference: closest to the stable's east face (the
// yard reads as the stable's own), then closest to the road line z 0.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// my decoded OBB
const CX = 0.050, CZ = 0.1615, HW = 1.550, HD = 1.6705;
const YAW = -1.75;

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-shorse-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films/rider films
    if (e.pos[1] >= 1.8) return false;             // suspended decor (b8 rail y2.22)
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
for (let x = 46.5; x <= 53.0; x += 0.25) {
    for (let z = -4.5; z <= 3.5; z += 0.25) {
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
// preference: closest to the stable's east face (yard), tie-break toward road z 0
const stable = ents.find((e: any) => e.id === "nx-town-stable");
results.sort((a: any, b: any) => (Math.hypot(a.x - stable.pos[0], a.z - stable.pos[2]) + Math.abs(a.z) * 0.25) - (Math.hypot(b.x - stable.pos[0], b.z - stable.pos[2]) + Math.abs(b.z) * 0.25));
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
