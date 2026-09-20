// fauna73-seat-sweep.ts — live-census SAT sweep for the fauna-73 brown
// hare (FAUNA-PLAN row 47): the SW meadow S reach, FIRST-CHOICE zone
// center (-24,-42) (fauna-72's own co-resident table: nearest solid
// milestone sw-005 4.1m, donkey 8.1m, sheep 11.1m — the S reach is the
// village's quietest open grass on a reader line), SECOND the N gallery
// margin (-26,30). Hare solid OBB from the DECODE full-entity envelope
// (15f5da90: CX 0.0525 CZ -0.0695, HW 0.777, HD 0.4155). Facing derived
// per seat: nose (+x) toward the 18m reader vantage (seat + 18U, U =
// unit vector to plaza — fauna-61 clean-slate law). Exemptions: films
// (height ≤ 0.5), suspended (pos.y ≥ 1.8), lights (no bbox).
// Constraints: worst solid gap ≥ 1.4m AND center NOT inside any film
// OBB grown 0.3m. Preference: closest to the zone center, tie-break
// plaza-ward (smaller r).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// hare decoded full-entity OBB (half-extents + center offset, entity-local)
const CX = 0.0525, CZ = -0.0695, HW = 0.777, HD = 0.4155;
const ZONES = [
  { name: "sw-south", x0: -30.0, x1: -18.0, z0: -48.0, z1: -36.0, cx: -24, cz: -42 },
  { name: "n-gallery", x0: -30.0, x1: -22.0, z0: 26.0, z1: 34.0, cx: -26, cz: 30 },
];

const solids = ents.filter((e: any) => {
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
const stages = { sat: 0, film: 0, ok: 0 };
for (const Z of ZONES) {
  for (let x = Z.x0; x <= Z.x1; x += 0.25) {
    for (let z = Z.z0; z <= Z.z1; z += 0.25) {
        // facing: nose (+x local) toward the 18m plaza-ward reader vantage
        const Ux = -x / Math.hypot(x, z), Uz = -z / Math.hypot(x, z);
        const yaw = Math.atan2(Ux, -Uz);
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
            if (!nearMiss || worst > nearMiss.worst) nearMiss = { zone: Z.name, x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId };
            continue;
        }
        let onFilm = "";
        for (const f of films) {
            if (Math.hypot(f.pos[0] - x, f.pos[2] - z) > 22) continue;
            if (insideFilm(f, x, z)) { onFilm = f.id; break; }
        }
        if (onFilm) { stages.film++; continue; }
        stages.ok++;
        results.push({ zone: Z.name, x: +x.toFixed(2), z: +z.toFixed(2), yaw: +yaw.toFixed(3), worst: +worst.toFixed(3), worstId, dZone: +Math.hypot(x - Z.cx, z - Z.cz).toFixed(2), r: +Math.hypot(x, z).toFixed(2) });
    }
  }
}
console.log(`stages: ${JSON.stringify(stages)}`);
console.log(`qualifying seats (gap ≥ 1.4m, film-clear): ${results.length}`);
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zones");
// preference: closest to the first-choice zone center (SW S reach),
// then plaza-ward (smaller r)
const sw = results.filter(q => q.zone === "sw-south");
const pool = sw.length ? sw : results;
pool.sort((a: any, b: any) => (a.dZone - b.dZone) || (a.r - b.r));
console.log("POOL:", pool[0].zone);
for (const c of pool.slice(0, 8)) console.log(JSON.stringify(c));
