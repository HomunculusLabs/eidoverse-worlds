// struct118-scan-borromean.ts — film-guarded sitescan for the R10-16
// Borromean Rings seat (deferred contract from struct-117). Laws copied from
// the struct-115/112/114 chassis: SAT >= 1.4 vs non-film entities
// (center-corrected), film clearance >= 4.0, walking-line >= 3.0, r >= 60
// (CITY-PLAN closed band r33-55).
// Guard set = R10 math family films + all <=0.5m-height films; solids
// auto-included via bbox.
// TRUE decoded envelope local x[-2.11..2.11] z[-2.30..2.30] y[0..4.533]
// (struct-117 decode-verified envelope 4.22x4.53x4.60); half-extents
// HX 2.11 HZ 2.30; envelope center local (0, 0) (dais-concentric build);
// envelope height 4.533 > 0.5 = solid, not film.
// TARGET SEAT: az184 r190 — the S mathematics axis extends past the zeno
// gates (r180): dial r71 -> koch r90 -> hilbert r100 -> dodeca r110 ->
// wall r120 -> tesseract r130 -> lorenz r140 -> chladni r150 -> voronoi
// r160 -> zeno r180 -> BORROMEAN r190: the rings past the gates that never
// finish. Yaw pi (approach-facing read, struct-115 precedent; form is
// 3-fold symmetric so exact dip alignment is aesthetic, not structural).
// The dais center seats ON the axis point.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const HX = 2.11, HZ = 2.30;
const CX = 0, CZ = 0; // local bbox center offset (dais-concentric)
const YAW = Math.PI;
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
// az184 r190 seat; dais center on the axis point.
const az = 184 * Math.PI / 180, R = 190;
const PX = R * Math.sin(az), PZ = -R * Math.cos(az);
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const WCX = PX + CX * cy + CZ * sy;
const WCZ = PZ - CX * sy + CZ * cy;
const EW = HX * Math.abs(cy) + HZ * Math.abs(sy), ED = HX * Math.abs(sy) + HZ * Math.abs(cy);
console.log(`seat entity POS (${PX.toFixed(3)}, PY, ${PZ.toFixed(3)}) yaw ${YAW.toFixed(4)} rad; world center (${WCX.toFixed(3)}, ${WCZ.toFixed(3)}) grown half ${EW.toFixed(3)}x${ED.toFixed(3)}`);
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
    const dx = Math.abs(WCX - rc.cx), dz = Math.abs(WCZ - rc.cz);
    const gap = Math.max(dx - (EW + rc.w), dz - (ED + rc.d));
    if (isFilm) { if (gap < worstFilm.g) worstFilm = { id: e.id, g: gap }; if (gap < 4.0) bad.push(`FILM ${e.id}(${gap.toFixed(2)})`); continue; }
    if (isGround) { if (gap < worstWalk.g) worstWalk = { id: e.id, g: gap }; if (gap < 3.0) bad.push(`WALK ${e.id}(${gap.toFixed(2)})`); continue; }
    if (gap < worstSol.g) worstSol = { id: e.id, g: gap };
    if (gap < 1.4) bad.push(`SAT ${e.id}(${gap.toFixed(2)})`);
}
const rr = Math.hypot(WCX, WCZ);
if (rr < 60) bad.push(`rim ${rr.toFixed(1)} < 60`);
console.log(`worst solid: ${worstSol.id} ${worstSol.g.toFixed(2)} (law 1.4) | worst film: ${worstFilm.id} ${worstFilm.g.toFixed(2)} (law 4.0) | worst walk: ${worstWalk.id} ${worstWalk.g.toFixed(2)} (law 3.0) | rim ${rr.toFixed(1)}`);
if (bad.length) { console.log(`BLOCKED: ${bad.join(", ")}`); process.exit(1); }
console.log("SCAN LAWFUL");
