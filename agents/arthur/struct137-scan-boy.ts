// struct137-scan-boy.ts — siting scan for THE BOY'S SURFACE placement
// (struct-136 build accepted sha 8c25b66573954418, deferred placement
// executed this tick per R11 cadence: build+judge one tick, place next).
//
// R11 LAWS (CITY-PLAN Amendment 1, binding):
//   - UNDER-SERVED RAY rotation: az184 carries 17 forms — rotate. NOT
//     enneper r250 -> r260. v2 of this scan: FULL 360 sweep (az 0..345
//     step 15) x district-ring radii — five hand-picked rays all failed
//     lawful ladders, so under-served selection must see the whole circle.
//   - NN floor >= 8.0m center-to-center vs EVERY nx-struct-* entity
//     (Amendment 1; struct-134 measured register min 6.31 = legacy pair,
//     disclosed, not a target).
//   - per-district soft cap 6: verified post-scan by wedge count.
//   - band r33-55 CLOSED (CITY-PLAN relocation law at plan head).
//
// Standing chassis laws (struct-129/130/132/133): SAT >= 1.4 vs non-film
// (center-corrected), film >= 4.0, walking-line >= 3.0, rim >= 60.
//
// TRUE decoded envelope (struct136-decode-boy ALL PASS 30/30):
// 6.98 x 7.02 x 6.98, slab plan 6.98 ORIGIN-CENTERED => HX = HZ = 3.49,
// CX = CZ = 0. Height 7.02 > 0.5 = solid. YAW pi (family yaw).
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const HX = 3.49, HZ = 3.49;
const CX = 0, CZ = 0; // origin-centered envelope (decode-derived: slab plan)
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
const YAW = Math.PI; // family yaw, fixed this scan
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const EW = HX * Math.abs(cy) + HZ * Math.abs(sy); // 3.49
const ED = HX * Math.abs(sy) + HZ * Math.abs(cy); // 3.49
const RADII = [64, 70, 76, 82, 88, 94, 100, 110, 120, 130];
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
// selection: prefer SMALLER radius (closer to the village = actually seen),
// then max NN margin. Sort and show top 8.
lawfulSeats.sort((a, b) => (a.R - b.R) || (b.nn - a.nn));
console.log(`\n${lawfulSeats.length} lawful stations. Top by (small R, max NN):`);
for (const s of lawfulSeats.slice(0, 8)) console.log(`  az${s.az} R=${s.R} POS(${s.PX.toFixed(4)}, ${s.PZ.toFixed(4)}) worst-solid ${s.worstSol.toFixed(2)} NN ${s.nn.toFixed(2)}`);
const best = lawfulSeats[0];
console.log(`\nSELECTED az${best.az} R=${best.R} — entity POS (${best.PX.toFixed(4)}, PY, ${best.PZ.toFixed(4)}), worst-solid ${best.worstSol.toFixed(2)}, NN ${best.nn.toFixed(2)}`);
