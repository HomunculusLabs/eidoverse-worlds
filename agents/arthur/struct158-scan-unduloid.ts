// struct158-scan-unduloid.ts — siting scan for THE UNDULOID STOUP
// (struct-157 arc: banked sha 3a9b92b8aeb3722da76ba4fc0f9091d7ad7101996f7f
// 338cdbcb8a2d97db9a29 = ACCEPTED v2 water-fixed bytes, decode ALL PASS
// 17/17 re-verified THIS tick on disk bytes; native judgment 3/3 complete:
// gameplay 18m + night (v2) + front 8m (v2, water-value watch item
// disclosed). This scan is the placement contract's seat selection.)
//
// R11 LAWS (CITY-PLAN Amendment 1, binding):
//   - UNDER-SERVED RAY rotation: district counts re-derived fresh in THIS
//     scan (struct-157-era census 324: outer-ring E=2 / W=6 / N=12 / S=24;
//     all-radii E=10 / W=10 / N=21 / S=30). Selection prefers the
//     under-served district below soft cap.
//   - NN floor >= 8.0m center-to-center vs EVERY nx-struct-* entity.
//   - per-district soft cap 6 (wedge count in-script, post-scan check).
//   - band r33-55 CLOSED (CITY-PLAN relocation law at plan head).
//   - DISPOSITION PREFERENCE OVERRIDE (disclosed): struct-157 disposition
//     suggested "waterfront-adjacent" — the only open water (reedpool
//     az6 r91.5) sits in N, which is 2x over cap (12/6 outer-ring).
//     Amendment-1 rotation outranks the disposition preference; seated in
//     the under-served district instead.
//
// Standing chassis laws (struct-129..156): SAT >= 1.4 vs non-film
// (center-corrected), film >= 4.0, walking-line >= 3.0, rim >= 60.
//
// TRUE decoded envelope (struct157-decode-unduloid ALL PASS 17/17, this
// tick): 6.57(x) x 1.30(y) x 2.20(z), x/z ORIGIN-CENTERED => HX = 3.285,
// HZ = 1.10, CX = CZ = 0. Height 1.30 > 0.5 = solid (not a film).
// YAW LAW (struct-104 planar-figure class, adapted for a chain of
// revolution): the bead string runs along local x; yaw = -az seats the
// string TANGENT to the ring so the plaza radial approach reads the full
// 5-bead broadside (end-on collapses the chain to one bulge). Verify:
// local x -> (cos yaw, -sin yaw); radial az -> (sin az, -cos az);
// dot = cos yaw sin az + sin yaw cos az = sin(az+yaw) = 0 at yaw = -az.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const HX = 3.285, HZ = 1.10;
const CX = 0, CZ = 0; // origin-centered envelope (decode-derived)
const SELF = "nx-struct-unduloid";
const FILM = /nx-struct-(kochgarden|penrose|hydro|hygro|pyth|ptolemy|hypoth|crossing|penrose2|sierpinski|geodesic|apollon|tensegrity|sundial|watershed)/;
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = (d.entities ?? []) as any[];
console.log(`census ${ents.length}`);

// district wedge counts (R11 under-served rotation input)
const wedge: Record<string, string[]> = { N: [], E: [], S: [], W: [] };
for (const e of ents) {
    if (!/^nx-struct-/.test(e.id) || /-l$/.test(e.id)) continue;
    let azd = Math.atan2(e.pos[0], -e.pos[2]) * 180 / Math.PI;
    if (azd < 0) azd += 360;
    const q = azd >= 315 || azd < 45 ? "N" : azd < 135 ? "E" : azd < 225 ? "S" : "W";
    wedge[q].push(e.id);
}
const wedgeOuter: Record<string, number> = { N: 0, E: 0, S: 0, W: 0 };
for (const e of ents) {
    if (!/^nx-struct-/.test(e.id) || /-l$/.test(e.id)) continue;
    const rr = Math.hypot(e.pos[0], e.pos[2]);
    if (rr < 60) continue;
    let azd = Math.atan2(e.pos[0], -e.pos[2]) * 180 / Math.PI;
    if (azd < 0) azd += 360;
    const q = azd >= 315 || azd < 45 ? "N" : azd < 135 ? "E" : azd < 225 ? "S" : "W";
    wedgeOuter[q]++;
}
for (const q of ["N", "E", "S", "W"]) console.log(`wedge ${q}: ${wedge[q].length} struct forms (soft cap 6) | outer-ring r>=60: ${wedgeOuter[q]}`);

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
const RADII = [60, 64, 70, 76, 82, 88, 94, 100, 110, 120, 130];
type Seat = { az: number; R: number; yaw: number; worstSol: number; nn: number; PX: number; PZ: number };
const lawfulSeats: Seat[] = [];
for (let azd = 0; azd < 360; azd += 15) {
    const az = azd * Math.PI / 180;
    const YAW = -az; // tangent law (struct-104 class, see header)
    const cy = Math.cos(YAW), sy = Math.sin(YAW);
    const EW = HX * Math.abs(cy) + HZ * Math.abs(sy);
    const ED = HX * Math.abs(sy) + HZ * Math.abs(cy);
    for (const R of RADII) {
        const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
        const PX = AX - (CX * cy + CZ * sy);
        const PZ = AZ - (-CX * sy + CZ * cy);
        let worstSol = Infinity, nn = Infinity, nnId = "";
        const bad: string[] = [];
        for (const e of ents) {
            if (e.id === SELF) continue; // self (absent, guard)
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
            lawfulSeats.push({ az: azd, R, yaw: YAW, worstSol, nn, PX, PZ });
            console.log(`LAWFUL az${azd} R=${R} yaw=${(-YAW * 180 / Math.PI).toFixed(0)} POS(${PX.toFixed(4)}, ${PZ.toFixed(4)}) | worst-solid ${worstSol.toFixed(2)} | NN ${nnId} ${nn.toFixed(2)}`);
        }
    }
}
if (!lawfulSeats.length) { console.log("NO LAWFUL SEAT in full sweep — hold fail-closed"); process.exit(2); }
// selection: under-served district first (fewest outer-ring forms, under
// cap), then SMALLER radius (closer = seen), then max NN margin.
const distRank = new Map<string, number>();
const order = Object.entries(wedgeOuter).sort((a, b) => a[1] - b[1]);
order.forEach(([q], i) => distRank.set(q, i));
function seatAz(a: number) { return a >= 315 || a < 45 ? "N" : a < 135 ? "E" : a < 225 ? "S" : "W"; }
lawfulSeats.sort((a, b) =>
    (distRank.get(seatAz(a.az))! - distRank.get(seatAz(b.az))!) ||
    (a.R - b.R) || (b.nn - a.nn));
console.log(`\n${lawfulSeats.length} lawful stations. District outer-ring load order: ${order.map(([q, v]) => `${q}=${v}`).join(" ")}`);
console.log(`Top by (under-served district, small R, max NN):`);
for (const s of lawfulSeats.slice(0, 8)) console.log(`  az${s.az}(${seatAz(s.az)}) R=${s.R} yaw=${(-s.yaw * 180 / Math.PI).toFixed(0)} POS(${s.PX.toFixed(4)}, ${s.PZ.toFixed(4)}) worst-solid ${s.worstSol.toFixed(2)} NN ${s.nn.toFixed(2)}`);
const best = lawfulSeats[0];
const q = seatAz(best.az);
console.log(`\nSELECTED az${best.az} (${q}, ${wedgeOuter[q]} outer-ring forms pre-seat) R=${best.R} yaw=${(-best.yaw * 180 / Math.PI).toFixed(0)}deg — entity POS (${best.PX.toFixed(6)}, PY, ${best.PZ.toFixed(6)}), worst-solid ${best.worstSol.toFixed(2)}, NN ${best.nn.toFixed(2)}; post-seat ${q} wedge ${wedge[q].length + 1} forms / soft cap 6`);
