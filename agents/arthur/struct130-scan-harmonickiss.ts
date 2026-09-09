// struct130-scan-harmonickiss.ts — seat scan for THE HARMONIC KISS
// (struct-130 build tick, R10-21): az184 r230 yaw-pi, S mathematics axis
// past clothoid r220 (10m cadence). Laws from struct-129/125/122/120/118/115
// chassis: SAT >= 1.4 vs non-film (center-corrected), film >= 4.0,
// walking-line >= 3.0, r >= 60. TRUE decoded envelope (struct130-decode ALL
// PASS 17/17): 3.00 x 6.40 x 3.00, ORIGIN-CENTERED x/z (decode: x/z both
// +/-1.5, CX=CZ=0 — no pitfall-10 offset this cast). Height 6.40 > 0.5 =
// solid. YAW pi (S-axis exhibit family: zeno/borromean/galton/clothoid/
// peaucellier all yaw pi) — though the form is axisymmetric (yaw legally
// irrelevant), seated yaw-pi for family census consistency.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const HX = 1.5, HZ = 1.5;
const CX = 0, CZ = 0; // origin-centered (decode-derived)
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
const YAW = Math.PI;
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const EW = HX * Math.abs(cy) + HZ * Math.abs(sy); // 1.5 tangent width
const ED = HX * Math.abs(sy) + HZ * Math.abs(cy); // 1.5 radial depth half
let best: { R: number; worstSol: number; PX: number; PZ: number } | null = null;
for (const R of [230, 229, 228, 227, 226, 225, 224, 223, 222, 221]) { // contract first, then ladder
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
        if (dx > rc.w + EW + 4 || dz > rc.d + ED + 4) continue;  // broad-phase
        const gx = dx - (rc.w + EW), gz = dz - (rc.d + ED);
        const gap = Math.max(gx, gz);
        if (isGround) continue;
        if (isFilm) {
            if (gap < worstFilm.g) worstFilm = { id: e.id, g: gap };
            if (gap < 4.0) bad.push(`film ${e.id} ${gap.toFixed(2)} < 4.0`);
        } else if (/walk|lane|path|road/.test(e.id)) {
            if (gap < worstWalk.g) worstWalk = { id: id(e), g: gap };
            if (gap < 3.0) bad.push(`walk ${e.id} ${gap.toFixed(2)} < 3.0`);
        } else {
            if (gap < worstSol.g) worstSol = { id: e.id, g: gap };
            if (gap < 1.4) bad.push(`solid ${e.id} ${gap.toFixed(2)} < 1.4`);
        }
    }
    const ok = bad.length === 0 && R >= 60;
    console.log(`R=${R}: ${ok ? "LAWFUL" : "BLOCKED"} worst-solid ${worstSol.id} ${worstSol.g === Infinity ? "∞" : worstSol.g.toFixed(2)} | worst-film ${worstFilm.id} ${worstFilm.g === Infinity ? "∞" : worstFilm.g.toFixed(2)} | worst-walk ${worstWalk.id} ${worstWalk.g === Infinity ? "∞" : worstWalk.g.toFixed(2)}${bad.length ? " | " + bad.join("; ") : ""}`);
    if (ok && !best) best = { R, worstSol: worstSol.g, PX, PZ };
}
if (!best) { console.log("NO LAWFUL SEAT in ladder"); process.exit(1); }
console.log(`\nSELECTED R=${best.R} — entity POS (${best.PX.toFixed(6)}, PY, ${best.PZ.toFixed(6)}) yaw ${YAW}`);
console.log(`worst solid margin ${best.worstSol === Infinity ? "∞" : best.worstSol.toFixed(2)}`);
