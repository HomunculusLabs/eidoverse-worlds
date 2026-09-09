// struct129-scan-peaucellier.ts — re-seat scan (struct-128 next-tick plan):
// contract seat az184 r170 BLOCKED (nx-struct-zeno radial half 8.38, SAT
// 1.07 < 1.4), so scan a radius ladder toward voronoi and take the LAWFUL
// seat CLOSEST to r170. Laws copied from the struct-128/125/122/120/118/
// 115 chassis: SAT >= 1.4 vs non-film (center-corrected), film >= 4.0,
// walking-line >= 3.0, r >= 60. TRUE decoded envelope (struct128-decode
// ALL PASS 20/20): local x[-2.20..4.80] z[-0.80..0.25] = 7.00x1.05 depth,
// half-extents HX 3.50 HZ 0.525, envelope center local (+1.30, -0.275) —
// NOT origin-centered (pitfall-10). Height 4.20 > 0.5 = solid.
// YAW pi (S-axis planar-exhibit family: zeno/borromean/galton/clothoid all
// yaw pi, live-census verified) — web face toward the village approach.
// Entity POS seats the form-CENTER on the axis point (center-corrected).
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const HX = 3.50, HZ = 0.525;
const CX = 1.30, CZ = -0.275; // local envelope center offset (decode-derived)
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
const EW = HX * Math.abs(cy) + HZ * Math.abs(sy); // 3.50 (tangent width)
const ED = HX * Math.abs(sy) + HZ * Math.abs(cy); // 0.525 (radial depth half)
let best: { R: number; worstSol: number; PX: number; PZ: number } | null = null;
for (const R of [170, 169, 168, 167, 166, 165]) { // closest-to-contract first
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
console.log(`\nSELECTED R=${best.R} (lawful seat closest to contract r170) — entity POS (${best.PX.toFixed(4)}, PY, ${best.PZ.toFixed(4)}), worst-solid margin ${best.worstSol.toFixed(2)}`);
