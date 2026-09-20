// fauna71-seat-sweep.ts — live-census SAT sweep for the fauna-71 field
// vole (FAUNA-PLAN row 45): the kestrel's hover field, between the perch
// post (kestrel entity 57.5,−24, its ground furniture = post+tufts OBB)
// and the pheasant seat (55.75,−30.5), on the PLAZA-SPOKE reader side
// (18m reader vantage world (40.9,−17.1) — fauna-65's own vantage).
// Vole solid OBB from the DECODE full-entity envelope (c3fc46e1: W 0.781
// D 0.475; entity-local center (−0.2095, 0) → CX −0.2095, CZ 0, HW 0.391,
// HD 0.238). Yaw swept to face the reader point. Exemptions: films
// (height ≤ 0.5), suspended (pos.y ≥ 1.8), lights (no bbox). Constraints:
// worst solid gap ≥ 1.4m AND center NOT inside any film OBB grown 0.3m.
// Preference: closest to the band center (54.5,−24.5), tie-break
// plaza-ward. The kestrel entity itself is a SOLID (post+tufts) — the
// ≥1.4m law applies to it too (the vole feeds NEAR its predator's hover,
// never under the post).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// vole decoded full-entity OBB (half-extents + center offset, entity-local)
const CX = -0.2095, CZ = 0, HW = 0.391, HD = 0.238;
const BAND = { x: 54.5, z: -24.5 };
const READER = { x: 40.9, z: -17.1 };
// r9 (judge scope FAIL decomposed): the reader-facing yaw put the RUN
// edge-on to the spoke (a 0.72 lane receding dead-away projects to a
// sliver — struct-104 face-on law). FIX: FIXED OBLIQUE YAW — the vole+
// run composition reads at ~40° to the walking line (same cure class as
// the slidingladder yaw-only re-seat); the vole presents its 3/4 profile.
const FIXYAW = -1.863;

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-vole-001") return false;
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
const stages = { wall: 0, vantage: 0, sat: 0, film: 0, ok: 0 };
for (let x = 50.5; x <= 57.0; x += 0.25) {
    for (let z = -28.5; z <= -20.0; z += 0.25) {
        // FIXED oblique yaw (r9) — no per-seat facing derivation
        const yaw = FIXYAW;
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
            stages.sat++;
            if (!nearMiss || worst > nearMiss.worst) nearMiss = { x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId };
            continue;
        }
        let onFilm = "";
        for (const f of films) {
            if (Math.hypot(f.pos[0] - x, f.pos[2] - z) > 22) continue;
            if (insideFilm(f, x, z)) { onFilm = f.id; break; }
        }
        if (onFilm) { stages.film++; continue; }
        stages.ok++;
        results.push({ x: +x.toFixed(2), z: +z.toFixed(2), yaw: +yaw.toFixed(3), worst: +worst.toFixed(3), worstId, dBand: +Math.hypot(x - BAND.x, z - BAND.z).toFixed(2) });
    }
}
console.log(`stages: ${JSON.stringify(stages)}`);
console.log(`qualifying seats (gap ≥ 1.4m, film-clear): ${results.length}`);
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: closest to the band center (the hover field mid), tie-break
// plaza-ward (smaller r) — the vole reads best under the hover, on the spoke
results.sort((a: any, b: any) => (a.dBand - b.dBand) || (Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z)));
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
