// fauna45-seat-sweep.ts — live-census SAT sweep for the fauna-45
// harvest mouse at the harvest-cart grass verge (FAUNA-PLAN row 30:
// FIRST anchor "the harvest cart / dyehouse edge" — cart chosen at
// build tick; nx-dress-harvestcart stands (12,0,36) yaw −2.6 with the
// artwalk sheaf-tally rider ON it, entity-domain law: the mouse goes
// in the GRASS BESIDE, never a rider). Zone: the meadow verge S/SSW of
// the cart, band center (11, 33.5). Mouse solid OBB from the DECODE
// full-entity envelope (18dc514a: local min [−0.155,−0.002,−0.089] max
// [0.078,0.408,0.103] → center (−0.039, 0.007), half (0.117, 0.096)).
// Yaw swept to face the mosaic-row reader point (12.9, 43.2) — the
// meadow's NE visitor line (pig law: heads NE toward the reader).
// Exemptions: films (height ≤ 0.5), suspended (pos.y ≥ 1.8), lights
// (no bbox). Constraints: worst solid gap ≥ 1.4m AND the mouse center
// NOT inside any film OBB grown 0.3m. Preference: closest to the band
// center (11, 33.5), tie-break plaza-ward.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// mouse decoded full-entity OBB (half-extents + center offset, entity-local)
const CX = -0.039, CZ = 0.007, HW = 0.117, HD = 0.096;
const BAND = { x: 11, z: 33.5 };
const READER = { x: 12.9, z: 43.2 };

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-hmou-001") return false;
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
for (let x = 6.5; x <= 16.5; x += 0.25) {
    for (let z = 29.5; z <= 36.0; z += 0.25) {
        // yaw: mouse +x (facing) toward the mosaic-row reader point —
        // hog-verified law: facing = (cos yaw, −sin yaw) ⇒ yaw = atan2(−dz, dx)
        const yaw = Math.atan2(-(READER.z - z), READER.x - x);
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
// preference: r4 composite re-seat — MAXIMIZE distance from the cart
// (12,36) subject to dBand ≤ 2.0 (stay on the verge story), tie-break
// plaza-ward. The (11,33.5) seat projected the tuft against the cart's
// front wheel from the spoke vantage ("sprouts from the wheel").
for (const c of results) c.dCart = +Math.hypot(c.x - 12, c.z - 36).toFixed(2);
results.sort((a: any, b: any) => (b.dCart - a.dCart) || (a.dBand + Math.hypot(a.x, a.z) * 0.15) - (b.dBand + Math.hypot(b.x, b.z) * 0.15));
const elig = results.filter((c: any) => c.dBand <= 2.0);
for (const c of (elig.length ? elig : results).slice(0, 8)) console.log(JSON.stringify(c));
