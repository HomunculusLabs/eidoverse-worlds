// struct145-scan-tensegrity.ts — siting scan for THE TENSEGRITY NEEDLE
// (struct-142/143/144 arc: v3 banked sha af2bdf599bfb3d90..., ACCEPTED,
// NOT placed — native re-judge gates the placement; this scan is the LOCAL
// PREP half of the placement contract authored this tick so the first
// native-up tick is a single upload+verb away).
//
// R11 LAWS (CITY-PLAN Amendment 1, binding):
//   - UNDER-SERVED RAY rotation: re-derive district counts fresh this scan
//     (struct-137 measured W 9 vs N 23 / S 30 / E 10, then seated BOY W r100
//     -> W outer-ring 6/6 at soft cap). Selection prefers an under-served
//     district below cap.
//   - NN floor >= 8.0m center-to-center vs EVERY nx-struct-* entity.
//   - per-district soft cap 6 (wedge count in-script, post-scan check).
//   - band r33-55 CLOSED (CITY-PLAN relocation law at plan head).
//
// Standing chassis laws (struct-129..137): SAT >= 1.4 vs non-film
// (center-corrected), film >= 4.0, walking-line >= 3.0, rim >= 60.
//
// TRUE decoded envelope (struct142-decode-tensegrity ALL PASS 13/13 on v3):
// 3.90 x 7.08 x 3.90, slab plan 3.9 ORIGIN-CENTERED => HX = HZ = 1.95,
// CX = CZ = 0. Height 7.08 > 0.5 = solid. YAW 0 (3-fold symmetric form:
// 3 struts/stage, +60 deg/stage, anchors at theta_i - 60 deg).
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const HX = 1.95, HZ = 1.95;
const CX = 0, CZ = 0; // origin-centered envelope (decode-derived: slab plan)
const FILM = /nx-struct-(kochgarden|penrose|hydro|hygro|pyth|ptolemy|hypoth|crossing|penrose2|sierpinski|geodesic|apollon|tensegrity|sundial|watershed)/;
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = (d.entities ?? []) as any[];
console.log(`census ${ents.length}`);

// district wedge counts (R11 under-served rotation input): quadrants N/E/S/W
// by atan2 bearing; N = az 315..45, E = 45..135, S = 135..225, W = 225..315.
const wedge: Record<string, string[]> = { N: [], E: [], S: [], W: [] };
for (const e of ents) {
    if (!/^nx-struct-/.test(e.id) || /-l$/.test(e.id)) continue;
    let azd = Math.atan2(e.pos[0], -e.pos[2]) * 180 / Math.PI;
    if (azd < 0) azd += 360;
    const q = azd >= 315 || azd < 45 ? "N" : azd < 135 ? "E" : azd < 225 ? "S" : "W";
    wedge[q].push(e.id);
}
for (const q of ["N", "E", "S", "W"]) console.log(`wedge ${q}: ${wedge[q].length} struct forms (cap 6 soft)`);

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
const YAW = 0; // 3-fold symmetric
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const EW = HX * Math.abs(cy) + HZ * Math.abs(sy); // 1.95
const ED = HX * Math.abs(sy) + HZ * Math.abs(cy); // 1.95
const RADII = [60, 64, 70, 76, 82, 88, 94, 100, 110, 120, 130];
type Seat = { az: number; R: number; worstSol: number; nn: number; PX: number; PZ: number };
const lawfulSeats: Seat[] = [];
for (let azd = 0; azd < 360; azd += 15) {
    const az = azd * Math.PI / 180;
    for (const R of RADII) {
        const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
        const PX = AX - (CX * cy + CZ * sy);
        const PZ = AZ - (-CX * sy + CZ * cy);
        let worstSol = Infinity, nn = Infinity, nnId = "";
        const bad: string[] = [];
        for (const e of ents) {
            if (e.id === "nx-struct-tensegrity") continue; // self (absent, guard)
            if (/^nx-struct-/.test(e.id)) {
                const dd = Math.hypot(e.pos[0] - AX, e.pos[2] - AZ);
                if (dd < nn) { nn = dd; nnId = e.id; }
                if (dd < 8.0) bad.push(`NN ${e.id}(${dd.toFixed(2)})`);
            }
            const rc = worldRect(e);
            if (!rc) continue;
            const bb = e.bbox;
            const isFilm = (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) || FILM.test(e.id);
            const isGround = GROUND.test(e.id);
            const dx = Math.abs(AX - rc.cx), dz = Math.abs(AZ - rc.cz);
            const gap = Math.max(dx - (EW + rc.w), dz - (ED + rc.d));
            if (isFilm) { if (gap < 4.0) bad.push(`FILM ${e.id}(${gap.toFixed(2)})`); continue; }
            if (isGround) { if (gap < 3.0) bad.push(`WALK ${e.id}(${gap.toFixed(2)})`); continue; }
            if (gap < worstSol) worstSol = gap;
            if (gap < 1.4) bad.push(`SAT ${e.id}(${gap.toFixed(2)})`);
        }
        const rr = Math.hypot(AX, AZ);
        if (rr < 60) bad.push(`rim ${rr.toFixed(1)} < 60`);
        if (bad.length === 0) {
            lawfulSeats.push({ az: azd, R, worstSol, nn, PX, PZ });
            console.log(`LAWFUL az${azd} R=${R} POS(${PX.toFixed(4)}, ${PZ.toFixed(4)}) | worst-solid ${worstSol.toFixed(2)} | NN ${nnId} ${nn.toFixed(2)}`);
        }
    }
}
if (!lawfulSeats.length) { console.log("NO LAWFUL SEAT in full sweep — hold fail-closed"); process.exit(2); }
// selection: under-served district first (fewest forms, under cap), then
// SMALLER radius (closer = seen), then max NN margin.
const distRank = new Map<string, number>();
const order = Object.entries(wedge).sort((a, b) => a[1].length - b[1].length);
order.forEach(([q], i) => distRank.set(q, i));
function seatAz(a: number) { return a >= 315 || a < 45 ? "N" : a < 135 ? "E" : a < 225 ? "S" : "W"; }
lawfulSeats.sort((a, b) =>
    (distRank.get(seatAz(a.az))! - distRank.get(seatAz(b.az))!) ||
    (a.R - b.R) || (b.nn - a.nn));
console.log(`\n${lawfulSeats.length} lawful stations. District load order: ${order.map(([q, v]) => `${q}=${v.length}`).join(" ")}`);
console.log(`Top by (under-served district, small R, max NN):`);
for (const s of lawfulSeats.slice(0, 8)) console.log(`  az${s.az}(${seatAz(s.az)}) R=${s.R} POS(${s.PX.toFixed(4)}, ${s.PZ.toFixed(4)}) worst-solid ${s.worstSol.toFixed(2)} NN ${s.nn.toFixed(2)}`);
const best = lawfulSeats[0];
const q = seatAz(best.az);
console.log(`\nSELECTED az${best.az} (${q}, ${wedge[q].length} forms pre-seat) R=${best.R} — entity POS (${best.PX.toFixed(4)}, PY, ${best.PZ.toFixed(4)}), worst-solid ${best.worstSol.toFixed(2)}, NN ${best.nn.toFixed(2)}; post-seat wedge ${wedge[q].length + 1} vs cap 6`);
