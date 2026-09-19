// fauna42-seat-sweep.ts — live-census SAT sweep for the fauna-42
// hedgehog at the garden cottage's QUIET NW back margin (FAUNA-PLAN row
// 28: band centered (−29,22), N fallback (−26,24.5); the mosaic 0052
// ground film spans x −49.5..−28.5, z 12..33 — forage BESIDE art,
// never on it, sheep law; band kept x > −28.5 via the film-containment
// check grown +0.3m). Hog solid OBB from the DECODE hog-subtree envelope
// (90521087: local x −0.189..0.231, z ±0.144 → center (+0.021, 0),
// half (0.21, 0.145); the leaf litter is a 4mm film, solid-solid law).
// Yaw swept to face the plaza center (0,0) — rootling oblique to the
// cottage wall, presented to the reader rounding the garden (fauna38
// chassis). Exemptions: films (height ≤ 0.5), suspended (pos.y ≥ 1.8),
// lights (no bbox). Constraints: worst solid gap ≥ 1.4m AND the hog
// center NOT inside any film OBB. Preference: closest to the row-28
// band center (−29,22), tie-break plaza-ward.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// hog decoded OBB (half-extents), center offset in entity-local
const CX = 0.021, CZ = 0.0, HW = 0.21, HD = 0.145;
const BAND = { x: -29, z: 22 };

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-hog-001") return false;
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
// film containment: is point p inside the yawed film OBB (grown 0.3m)?
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
for (let x = -34.0; x <= -25.5; x += 0.25) {
    for (let z = 19.5; z <= 28.0; z += 0.25) {
        // yaw: hog +x (facing) toward the plaza center — reader approach side
        const yaw = Math.atan2(-(0 - z), 0 - x);
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
        results.push({ x: +x.toFixed(2), z: +z.toFixed(2), yaw: +yaw.toFixed(3), worst: +worst.toFixed(3), worstId, dBand: +Math.hypot(x - BAND.x, z - BAND.z).toFixed(2) });
    }
}
console.log(`qualifying seats (gap ≥ 1.4m, film-clear): ${results.length}`);
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: closest to the row-28 band center (the quiet-margin story),
// tie-break plaza-ward
results.sort((a: any, b: any) => (a.dBand + Math.hypot(a.x, a.z) * 0.15) - (b.dBand + Math.hypot(b.x, b.z) * 0.15));
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
