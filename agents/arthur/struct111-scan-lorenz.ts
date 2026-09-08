// struct111-scan-lorenz.ts — film-guarded sitescan for the R10-12 Lorenz.
// Laws: SAT >= 1.4 vs non-film entities (center-corrected), film clearance
// >= 4.0 (vs guarded film entities), walking-line >= 3.0 (roads/paths
// footprints), r >= 60 (CITY-PLAN closed band r33-55).
// Guard set = R10 math family films (koch/penrose/honeycomb/sierpinski/
// geodesic) + all <=0.5m-height films; solids auto-included via bbox.
// TRUE decoded envelope local (decode PASS, world-frame): x[-2.65..2.68]
// z[-3.51..3.57] y[0..7.04]; center offset (0.015, 0.03), half-extents
// HX 2.67 HZ 3.54.
// TARGET SEAT: az184 r140 — the S mathematics axis at its own 10m cadence
// (dial r71 -> koch r90 -> hilbert r100 -> dodeca r110 -> wall r120 ->
// tesseract r130 -> LORENZ r140): the storm past the hypercube.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const HX = 2.67, HZ = 3.54;
const CX = 0.015, CZ = 0.03; // local bbox center offset
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
if (ents.some((e: any) => e.id === "nx-struct-lorenz")) throw Error("nx-struct-lorenz already live");
console.log(`sets: solids ${solids.length} films ${films.length} walks ${walks.length}`);
type Seat = { az: number; rad: number; x: number; z: number; sat: number; satId: string; film: number; filmId: string; walk: number };
const seats: Seat[] = [];
for (let az = 0; az < 360; az += 2) {
    for (let rad = 60; rad <= 150; rad += 2.5) {
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
// the target: nearest lawful seat to az184 r140 (the S-axis cadence seat)
const TARGET = { az: 184, rad: 140 };
const byDist = seats.map(s => ({ s, dist: Math.hypot(s.x - TARGET.rad * Math.sin(TARGET.az * Math.PI / 180), s.z - -TARGET.rad * Math.cos(TARGET.az * Math.PI / 180)) }))
    .sort((a, b) => a.dist - b.dist);
if (!byDist.length) throw Error("no lawful seat in 60..150 ring");
console.log("\nnearest lawful seats to az184 r140:");
for (const { s, dist } of byDist.slice(0, 6)) {
    console.log(`  az${s.az} r${s.rad} (${s.x.toFixed(2)}, ${s.z.toFixed(2)}) dist-to-target ${dist.toFixed(1)} | SAT ${s.sat.toFixed(2)} ${s.satId} | film ${s.film.toFixed(2)} ${s.filmId} | walk ${s.walk.toFixed(1)}`);
}
// best SAT margin anywhere in the S semicircle (az 150-220)
const sBest = seats.filter(s => s.az >= 150 && s.az <= 220).sort((a, b) => b.sat - a.sat)[0];
if (sBest) console.log(`\nS-semicircle best SAT: az${sBest.az} r${sBest.rad} (${sBest.x.toFixed(2)}, ${sBest.z.toFixed(2)}) SAT ${sBest.sat.toFixed(2)} ${sBest.satId} film ${sBest.film.toFixed(2)} walk ${sBest.walk.toFixed(1)}`);
