// struct107-scan-dodecahedron.ts — film-guarded sitescan for the R10-8
// dodecahedron. Laws: SAT >= 1.4 vs non-film entities (center-corrected,
// yaw-grown), film clearance >= 4.0 (vs guarded film entities), walking-line
// >= 3.0 (roads/paths footprints), r >= 60 (CITY-PLAN closed band r33-55).
// Guard set = R10 math family films (koch/penrose/honeycomb/sierpinski/
// geodesic) + catenoid + hilbertlabyrinth standing solids.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
// TRUE decoded envelope v2c local: x/z ±3.149 centered, y 0..5.739
const HX = 3.149, HZ = 3.149;
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
// pre-classify
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
if (ents.some((e: any) => e.id === "nx-struct-dodecahedron")) throw Error("nx-struct-dodecahedron already live");
console.log(`sets: solids ${solids.length} films ${films.length} walks ${walks.length}`);
// sweep: az 0..358 step 2, r 60..120 step 2.5 (az convention x=r·sin, z=−r·cos)
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
// prefer the S mathematics axis (az 170..200) — rank by |az-184| then rad
const sAxis = seats.filter(s => s.az >= 168 && s.az <= 200).sort((a, b) => Math.abs(a.az - 184) - Math.abs(b.az - 184) || a.rad - b.rad);
console.log("S-axis candidates (az 168-200):");
for (const s of sAxis.slice(0, 12))
    console.log(`  az${s.az} r${s.rad} (${s.x.toFixed(2)},${s.z.toFixed(2)}) SAT ${s.sat.toFixed(2)} (${s.satId}) film ${s.film.toFixed(2)} (${s.filmId}) walk ${s.walk.toFixed(2)}`);
// overall widest SAT fallback
const wide = [...seats].sort((a, b) => b.sat - a.sat).slice(0, 5);
console.log("widest-SAT anywhere:");
for (const s of wide)
    console.log(`  az${s.az} r${s.rad} (${s.x.toFixed(2)},${s.z.toFixed(2)}) SAT ${s.sat.toFixed(2)} (${s.satId}) film ${s.film.toFixed(2)}`);
