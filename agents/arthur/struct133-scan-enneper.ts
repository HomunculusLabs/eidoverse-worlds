// struct133-scan-enneper.ts — siting scan for THE ENNEPER (struct-133,
// R10-23): S-walk cadence az184 r250 (gyroid r240 -> ENNEPER r250, 10m
// cadence). Laws copied from the struct-129/130/132 chassis: SAT >= 1.4
// vs non-film (center-corrected), film >= 4.0, walking-line >= 3.0, r >= 60.
// TRUE decoded envelope (struct133-decode ALL PASS 25/25): 5.80 x 6.20 x 5.80
// ORIGIN-CENTERED x/z — x[-2.90..2.90] z[-2.90..2.90], so HX = HZ = 2.90,
// CX = CZ = 0 (decode-derived, verified). Height 6.20 > 0.5 = solid.
// YAW pi (S-axis exhibit family: zeno/borromean/galton/clothoid/peaucellier/
// harmonickiss/gyroid all yaw pi, live-census verified). Entity POS seats the
// form-CENTER on the axis point (origin-centered => PX=AX).
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const HX = 2.90, HZ = 2.90;
const CX = 0, CZ = 0; // origin-centered envelope (decode-derived this tick)
const FILM = /nx-struct-(kochgarden|penrose|hydro|hygro|pyth|ptolemy|hypoth|crossing|penrose2|sierpinski|geodesic|apollon|tensegrity|sundial|watershed)/;
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
const az = 184 * Math.PI / 180;
const YAW = Math.PI; // family yaw, fixed this scan
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const EW = HX * Math.abs(cy) + HZ * Math.abs(sy); // 2.90 (tangent width)
const ED = HX * Math.abs(sy) + HZ * Math.abs(cy); // 2.90 (radial depth half)
let best: { R: number; worstSol: number; PX: number; PZ: number } | null = null;
for (const R of [250, 249, 248, 247, 246, 245]) { // closest-to-contract first
    const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
    const PX = AX - (CX * cy + CZ * sy);
    const PZ = AZ - (-CX * sy + CZ * cy);
    let worstSol = { id: "", g: Infinity };
    let worstFilm = { id: "", g: Infinity };
    let worstWalk = { id: "", g: Infinity };
    const bad: string[] = [];
    for (const e of ents) {
        const rc = worldRect(e);
        if (!rc) continue;
        const bb = e.bbox;
        const isFilm = (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) || FILM.test(e.id);
        const isGround = GROUND.test(e.id);
        const dx = Math.abs(AX - rc.cx), dz = Math.abs(AZ - rc.cz);
        const gap = Math.max(dx - (EW + rc.w), dz - (ED + rc.d));
        if (isFilm) { if (gap < worstFilm.g) worstFilm = { id: e.id, g: gap }; if (gap < 4.0) bad.push(`FILM ${e.id}(${gap.toFixed(2)})`); continue; }
        if (isGround) { if (gap < worstWalk.g) worstWalk = { id: e.id, g: gap }; if (gap < 3.0) bad.push(`WALK ${e.id}(${gap.toFixed(2)})`); continue; }
        if (gap < worstSol.g) worstSol = { id: e.id, g: gap };
        if (gap < 1.4) bad.push(`SAT ${e.id}(${gap.toFixed(2)})`);
    }
    const rr = Math.hypot(AX, AZ);
    if (rr < 60) bad.push(`rim ${rr.toFixed(1)} < 60`);
    const lawful = bad.length === 0;
    console.log(`R=${R} POS(${PX.toFixed(4)}, PY, ${PZ.toFixed(4)}) yaw pi | worst solid: ${worstSol.id} ${worstSol.g.toFixed(2)} (law 1.4) | worst film: ${worstFilm.id} ${worstFilm.g.toFixed(2)} (law 4.0) | worst walk: ${worstWalk.id} ${worstWalk.g.toFixed(2)} (law 3.0) | rim ${rr.toFixed(1)} | ${lawful ? "SCAN LAWFUL" : "BLOCKED: " + bad.join(", ")}`);
    if (lawful && !best) best = { R, worstSol: worstSol.g, PX, PZ };
}
if (!best) { console.log("NO LAWFUL SEAT in ladder — hold fail-closed, surface off-axis option"); process.exit(2); }
console.log(`\nSELECTED R=${best.R} (lawful seat closest to contract r250) — entity POS (${best.PX.toFixed(4)}, PY, ${best.PZ.toFixed(4)}), worst-solid margin ${best.worstSol.toFixed(2)}`);
