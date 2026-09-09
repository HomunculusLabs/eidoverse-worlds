// struct128-scan-peaucellier.ts — film-guarded sitescan for the R10-20
// Peaucellier Invertor (deferred contract from struct-127, executed by
// struct-128). Laws copied from the struct-125/122/120/118/115 chassis:
// SAT >= 1.4 vs non-film entities (center-corrected), film clearance
// >= 4.0, walking-line >= 3.0, r >= 60 (CITY-PLAN closed band r33-55).
// TRUE decoded envelope (struct128-decode-peaucellier ALL PASS 20/20,
// from bytes): local x[-2.20..4.80] z[-0.80..0.25] y[0..4.20] =
// 7.00x4.20x1.05; half-extents HX 3.50 HZ 0.525; envelope center local
// (+1.30, -0.275) — NOT origin-centered (pitfall-10).
// Envelope height 4.20 > 0.5 = solid, not film.
// TARGET SEAT: az184 r170 — the S mathematics walk's [20m HOLE] between
// voronoi r160 and zeno r180 (struct-127 fresh census): restores the
// walk's 10m cadence.
// YAW LAW (live-census family precedent): the S-axis planar exhibits sit
// FACE-ON to the village approach — zeno r180 yaw pi, borromean r190 yaw
// pi, galton r210 yaw pi, clothoid r220 yaw pi. The machine plane is the
// same wide-panel family. CAND_A yaw pi (contract seat): web face toward
// the village approach. CAND_B yaw 0 scanned for the record only.
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
// CAND_A yaw pi (contract seat: web face toward village), CAND_B yaw 0 (record only).
const az = 184 * Math.PI / 180, R = 170;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
for (const [name, YAW] of [["CAND_A(yaw=pi, face village-side CONTRACT SEAT)", Math.PI], ["CAND_B(yaw=0, record only)", 0]] as const) {
    // entity POS such that form-CENTER sits on the axis point
    const cy = Math.cos(YAW), sy = Math.sin(YAW);
    const PX = AX - (CX * cy + CZ * sy);
    const PZ = AZ - (-CX * sy + CZ * cy);
    const WCX = AX, WCZ = AZ; // by construction
    const EW = HX * Math.abs(cy) + HZ * Math.abs(sy), ED = HX * Math.abs(sy) + HZ * Math.abs(cy);
    console.log(`\n${name}: seat entity POS (${PX.toFixed(4)}, PY, ${PZ.toFixed(4)}) yaw ${YAW.toFixed(4)} rad; world center (${WCX.toFixed(3)}, ${WCZ.toFixed(3)}) grown half ${EW.toFixed(3)}x${ED.toFixed(3)}`);
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
    if (bad.length) console.log(`BLOCKED: ${bad.join(", ")}`);
    else console.log("SCAN LAWFUL");
}
