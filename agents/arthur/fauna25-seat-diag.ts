// fauna25-seat-diag.ts — who blocks the orchard zone? Print the top
// blocker ids by frequency over the sweep grid + the best (max) worst-gap
// found, to classify: real solids vs network-bbox envelope (orchard-rows
// carries ONE bbox spanning 14.5m of trunks — pitfall 0b class).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

const CX = 0.022, CZ = -0.1225, HW = 0.903, HD = 0.6175;
const YAW = 2.58;

const solids = ents.filter((e: any) => {
    if (!e.bbox) return false;
    if (e.bbox.size[1] <= 0.5) return false;
    if (e.pos[1] >= 1.8) return false;
    return true;
});

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

const counts = new Map<string, number>();
let bestWorst = -Infinity, bestAt = "";
for (let x = -58.0; x <= -40.0; x += 0.25) {
    for (let z = 52.0; z <= 70.0; z += 0.25) {
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
        counts.set(worstId, (counts.get(worstId) ?? 0) + 1);
        if (worst > bestWorst) { bestWorst = worst; bestAt = `(${x.toFixed(2)}, ${z.toFixed(2)}) vs ${worstId}`; }
    }
}
console.log("top blockers by grid-point count:");
for (const [id, n] of [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(`  ${id}: ${n}`);
console.log(`best worst-gap over grid: ${bestWorst.toFixed(3)} at ${bestAt}`);
// blocker detail
for (const id of [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0])) {
    const e = ents.find((x: any) => x.id === id);
    if (e) console.log(`detail ${id}: pos ${JSON.stringify(e.pos)} yaw ${e.yaw?.toFixed(3)} bbox ${JSON.stringify(e.bbox?.size)} lib ${e.lib}`);
}
