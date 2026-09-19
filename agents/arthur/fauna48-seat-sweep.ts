// fauna48-seat-sweep.ts — live-census SAT sweep for the fauna-48 house
// sparrows at the windmill apron (FAUNA-PLAN row 32: the OPEN double east
// door's spilled-grain apron; door mouth world ≈ (−37.4, 0), lane = the
// door's z∈[−0.9,0.9] corridor — the sweep EXCLUDES it so visitors keep
// the approach; host = nx-town-windmill at (−40,0,0) yaw π/2, live OBB
// x∈[−45.49,−36.79] z∈[−3.257,3.257]). Sparrow solid OBB from the v2
// DECODE full-entity envelope (3448cd77: local x [−0.251,0.351] z
// [−0.153,0.224] → center (0.050, 0.0355), half (0.301, 0.1885)).
// Yaw swept to face the door mouth (−37.4, 0) — the birds face the mill
// door they feed at. Exemptions: films (height ≤ 0.5), suspended
// (pos.y ≥ 1.8), lights (no bbox). Constraints: worst solid gap ≥ 1.4m
// AND the sparrow center NOT inside any film OBB grown 0.3m AND the
// seat OUT of the door lane (|z| > 1.35 — 1.4m clear of the lane edge
// 0.9) AND x > −35.7 (the near-edge bound; the gallery edge −36.79 +
// 1.4 gap − 0.5 margin... encoded as the SAT itself). Preference:
// closest to the door-mouth grain story (dMin = hypot(x+37.4, z·0.6)
// — lateral distance counts less than depth), tie-break reader-ward.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// sparrow decoded full-entity OBB (half-extents + center offset, entity-local)
const CX = 0.050, CZ = 0.0355, HW = 0.301, HD = 0.1885;
const DOOR = { x: -37.4, z: 0 };

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-sparrow-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films/rider films
    if (e.pos[1] >= 1.8) return false;             // suspended decor
    return true;
});
const films = ents.filter((e: any) => e.bbox && e.bbox.size[1] <= 0.5);
console.log(`census ${ents.length} entities, ${solids.length} solids, ${films.length} films in SAT set`);

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
const insideFilm = (e: any, px: number, pz: number) => {
    const b = e.bbox;
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    const dx = px - ewx, dz = pz - ewz;
    const cos = Math.cos(e.yaw), sin = Math.sin(e.yaw);
    const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
    return Math.abs(lx) <= b.size[0] / 2 + 0.3 && Math.abs(lz) <= b.size[2] / 2 + 0.3;
};

const results: any[] = [];
let nearMiss: any = null;
for (let x = -36.4; x <= -34.0; x += 0.25) {
    for (let z = -2.2; z <= 2.2; z += 0.25) {
        if (Math.abs(z) <= 1.35) continue;          // door-lane exclusion (lane edge 0.9 + clear 0.45)
        // yaw: sparrow +x (facing) toward the door mouth —
        // facing = (cos yaw, −sin yaw) ⇒ yaw = atan2(−dz, dx)
        const yaw = Math.atan2(-(DOOR.z - z), DOOR.x - x);
        const cos = Math.cos(yaw), sin = Math.sin(yaw);
        const wx = x + CX * cos + CZ * sin, wz = z - CX * sin + CZ * cos;
        let worst = Infinity, worstId = "";
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 20) continue;
            const b = e.bbox;
            const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
            const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
            const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
            const g = gap(obb(wx, wz, yaw, HW, HD), obb(ewx, ewz, e.yaw, b.size[0] / 2, b.size[2] / 2));
            if (g < worst) { worst = g; worstId = e.id; }
        }
        if (worst < 1.4) {
            if (!nearMiss || worst > nearMiss.worst) nearMiss = { x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId };
            continue;
        }
        let onFilm = "";
        for (const f of films) {
            if (Math.hypot(f.pos[0] - x, f.pos[2] - z) > 22) continue;
            if (insideFilm(f, x, z)) { onFilm = f.id; break; }
        }
        if (onFilm) continue;
        results.push({ x: +x.toFixed(2), z: +z.toFixed(2), yaw: +yaw.toFixed(3), worst: +worst.toFixed(3), worstId });
    }
}
console.log(`qualifying seats (gap ≥ 1.4m, film-clear, lane-clear): ${results.length}`);
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: the grain story — close to the door mouth, lateral counted
// at 0.6 weight (the spill spreads along the face); tie-break reader-ward
// (closer to the gate-w road at z 0... actually the road runs E at z 0 —
// tie-break SOUTH, the calmer side away from the N field edge)
for (const c of results) c.story = +(Math.hypot(c.x - DOOR.x, (c.z - DOOR.z) * 0.6)).toFixed(2);
results.sort((a: any, b: any) => a.story - b.story || a.z - b.z);
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
