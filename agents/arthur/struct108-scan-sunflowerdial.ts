// struct108-scan-sunflowerdial.ts — film-guarded sitescan for the R10-9
// sunflower dial. Laws: SAT >= 1.4 vs non-film entities (center-corrected,
// yaw-grown), film clearance >= 4.0 (vs guarded film entities), walking-line
// >= 3.0 (roads/paths footprints), r >= 60 (CITY-PLAN closed band r33-55).
// Guard set = R10 math family films (koch/penrose/honeycomb/sierpinski/
// geodesic) + standing solids catenoid/hilbertlabyrinth/dodecahedron auto-
// included via bbox (solids set).
// TRUE decoded envelope local: x[-3.674, 3.846] z[-1.909, 1.420] y[0, 8.210]
// → center offset (0.086, -0.244), half 3.760 x 1.665; conservative square
// half 3.85 (round head, near-symmetric).
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const HX = 3.85, HZ = 3.85;
const FILM = /nx-struct-(kochgarden|penrose|honeycomb|sierpinski|geodesic)/;
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = (d.entities ?? []) as any[];
console.log(`census ${ents.length}`);
function worldRect(e: any) {
    const bb = e.bbox;
    if (!bb) return null;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0;
    const cy = Math.cos(ey), sy = Math.sin(ey);
    return {
        cx: e.pos[0] + ecx * cy + ecz * sy,
        cz: e.pos[2] - ecx * sy + ecz * cy,
        w: hx * Math.abs(cy) + hz * Math.abs(sy),
        d: hx * Math.abs(sy) + hz * Math.abs(cy),
    };
}
const gap2 = (ax: number, az: number, aw: number, ad: number, b: { cx: number; cz: number; w: number; d: number }) =>
    Math.max(Math.abs(ax - b.cx) - (aw + b.w), Math.abs(az - b.cz) - (ad + b.d));
const solids: Array<{ id: string; r: ReturnType<typeof worldRect> }> = [];
const films: Array<{ id: string; r: ReturnType<typeof worldRect> }> = [];
const walks: Array<{ id: string; r: ReturnType<typeof worldRect> }> = [];
for (const e of ents) {
    const rect = worldRect(e);
    if (!rect) continue;
    if (FILM.test(e.id) || (e.bbox.max[1] - e.bbox.min[1]) <= 0.5) films.push({ id: e.id, r: rect });
    else if (GROUND.test(e.id)) walks.push({ id: e.id, r: rect });
    else solids.push({ id: e.id, r: rect });
}
if (ents.some((e: any) => e.id === "nx-struct-sunflowerdial")) throw Error("nx-struct-sunflowerdial already live");
console.log(`sets: solids ${solids.length} films ${films.length} walks ${walks.length}`);
type Seat = { az: number; rad: number; x: number; z: number; sat: number; satId: string; film: number; filmId: string; walk: number };
const seats: Seat[] = [];
for (let az = 0; az < 360; az += 2) {
    for (let rad = 60; rad <= 120; rad += 2.5) {
        const t = az * Math.PI / 180;
        const x = rad * Math.sin(t), z = -rad * Math.cos(t);
        let sat = Infinity, satId = "", film = Infinity, filmId = "";
        for (const s of solids) { const g = gap2(x, z, HX, HZ, s.r!); if (g < sat) { sat = g; satId = s.id; } }
        for (const f of films) { const g = gap2(x, z, HX, HZ, f.r!); if (g < film) { film = g; filmId = f.id; } }
        let walk = Infinity;
        for (const w of walks) { const g = gap2(x, z, HX, HZ, w.r!); if (g < walk) walk = g; }
        if (sat >= 1.4 && film >= 4.0 && walk >= 3.0) seats.push({ az, rad, x, z, sat, satId, film, filmId, walk });
    }
}
console.log(`lawful seats: ${seats.length}`);
// priority: W shoulder cluster az 130..205 (pollinator triad) with best
// honeycomb proximity, then best SAT margin overall
const triad = seats.filter(s => s.az >= 228 && s.az <= 272)
    .sort((a, b) => (b.film) - (a.film) || (b.sat) - (a.sat)).slice(0, 8);
console.log("W-shoulder triad candidates (az 228..272, honeycomb az~250 r56 shoulder):");
for (const s of triad) console.log(`  az${s.az} r${s.rad.toFixed(1)} (${s.x.toFixed(2)}, ${s.z.toFixed(2)}) sat +${s.sat.toFixed(2)} vs ${s.satId} | film +${s.film.toFixed(2)} vs ${s.filmId} | walk +${s.walk.toFixed(2)}`);
const best = seats.slice().sort((a, b) => (b.sat + b.film) - (a.sat + a.film)).slice(0, 5);
console.log("best overall (any az):");
for (const s of best) console.log(`  az${s.az} r${s.rad.toFixed(1)} (${s.x.toFixed(2)}, ${s.z.toFixed(2)}) sat +${s.sat.toFixed(2)} vs ${s.satId} | film +${s.film.toFixed(2)} vs ${s.filmId} | walk +${s.walk.toFixed(2)}`);
