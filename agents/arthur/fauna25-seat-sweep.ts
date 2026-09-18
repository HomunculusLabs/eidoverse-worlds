// fauna25-seat-sweep.ts — live-census SAT sweep for the fauna-25 peacock
// in the orchard-edge meadow zone (plan's first-choice candidate: show
// birds belong where visitors stroll — beside the dovecote at (−50.5,
// 62.55) yaw 2.577 and the stile visitor approach; the doves' show-bird
// kin joins the stroll line). OBB from the v8 DECODE envelope: local x
// −0.881..0.925, z −0.740..0.495 → center (+0.022, −0.1225), half
// (0.903, 0.6175), rotated by candidate yaw 2.58 (display faces the
// visitor approach like the dovecote; the train sweeps local −z, away
// from the reader — the dome reads). Exemptions: films/riders (bbox
// height ≤ 0.5), suspended decor (y ≥ 1.8 base), lights (no bbox).
// Constraint: worst solid gap ≥ 1.4m (sub-1.4 pinch law). Preference:
// closest to the dovecote's stroll line midpoint between dovecote and
// stile approach, tie-break S (open meadow side).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// my decoded OBB (v8 envelope)
const CX = 0.022, CZ = -0.1225, HW = 0.903, HD = 0.6175;
const YAW = 2.58;

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-peacock-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films/rider films
    if (e.pos[1] >= 1.8) return false;             // suspended decor
    // STANDING-PRECEDENT FILM EXEMPTION (fauna-16/17 register, dovecote
    // seat): lavender row networks are walkable planting films — the
    // dovecote tick classified lavender-0040 "film 0.60m"; the 0.5m
    // height proxy false-blocks at 0.55. Same builder family = same
    // class for 0027. Orchard-0033 stays SOLID (its 14.5m box is crown
    // overhead BUT carries real 1.85m espalier rows inside — the
    // register's own decode).
    if (e.id === "nx-cultivation-lavender-0040" || e.id === "nx-cultivation-lavender-0027") return false;
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
        if (worst >= 1.4) results.push({ x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId });
    }
}
console.log(`qualifying seats (gap ≥ 1.4m): ${results.length}`);
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: closest to the stroll anchor E-SE of the dovecote on the
// stile line (−47.5, 60.0), tie-break S (open meadow)
results.sort((a: any, b: any) => (Math.hypot(a.x - -47.5, a.z - 60.0) - Math.hypot(b.x - -47.5, b.z - 60.0)) || (b.z - a.z));
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
