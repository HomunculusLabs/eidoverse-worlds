// city14-scan-kiln.ts — seat scanner for CITY-PLAN row 51:
// nx-town-kiln (r49.8 off-spoke) -> village ring (compress inward), wave 3.
// Host TRUE live bbox (dress-80 law, census 2026-09-07): size 4.878 x 3.034 x
// 3.008, local center (0.211, 0.204); kiln OLD (31,0,39) yaw -2.47849
// [az51.5 r49.8 processional band]. Entourage rides host-local:
//   b12 heat contours  (0, 1.15)   size 1.55 x 0.125  ctr z +0.057
//   sign-kiln-001     (0, 0.86)    size 1.776 x 2.413 ctr z -0.542
//   kiln-l light      (+1.2546, -0.7975) (not a SAT body; size 0)
// YAW LAW: old yaw -2.47849 == az(51.45deg)+180 == radial-inward within
// 0.0093 rad — local +z (fire mouth, b12 field) faces the plaza. Destination
// yaw = TH_OLD + (AZ_OLD - AZ_NEW) preserves the read (city-13 idiom).
// Composition intent (city-12/13 arc): production arc woodyard az62.7 ->
// kiln -> charcoal az50.2 r35.5 — kiln stays on its OWN azimuth, inner.
// Solid-solid 1.4m law vs census solids (h>0.5); ground films exempt
// (height prong); network layers by explicit id set (nvp-109 two-prong law);
// lights auto-skip (size 0). Read-only: fetches FRESH census.
// Walk lines: lane-002 beads (hardcoded from census decode, city-12 class),
// ring-road rim (min corner r >= 20.7), E-axis z=0 clearance >= 3,
// mosaic-0036 film margin >= 2.5 (city-13 gate class). Prints lawful seats
// ranked + control sign-validation at CURRENT live kiln seat.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://", "").replace("/ws", "");
// true local envelopes (host-local frame, centers included)
const KILN = { hx: 2.439, hz: 1.504, cx: 0.211, cz: 0.204 };
const B12 = { hx: 0.775, hz: 0.0625, cx: 0, cz: 1.15 + 0.057 };
const SIGN = { hx: 0.888, hz: 1.2065, cx: 0, cz: 0.86 - 0.542 };
const TH_OLD = -2.4784945651581642, HOST_OLD: [number, number] = [31, 39];
const SELF = "nx-town-kiln";
const NETWORKS = new Set(["nx-town-roads", "nx-core-paths",
    "nx-approach-ne-lane-002", "nx-approach-nw-lane-001", "nx-approach-sw-lane-003"]);
const GROUND = new Set(["nx-town-streetlamps", "nx-gallery-mosaic-0036", "nx-gallery-mosaic-0048",
    "nx-gallery-mosaic-0052", "nx-gallery-mosaic-0059", ...NETWORKS]);
const MOVING = new Set([SELF, "nx-artwalk-b12-kiln-heat-contours", "nx-sign-kiln-001", "nx-town-kiln-l"]);
const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities ?? [];
console.error(`census ${ents.length}`);
type OBB = { id: string; u: [number, number]; v: [number, number]; c: [number, number]; hu: number; hv: number; h: number };
const solids: OBB[] = [];
for (const e of ents) {
    if (MOVING.has(e.id)) continue;
    if (NETWORKS.has(e.id)) continue;
    const bb = e.bbox; if (!bb?.size) continue;
    if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue; // lights
    if (bb.size[1] <= 0.5) continue;                  // ground film (height prong)
    const y = e.yaw ?? 0, cc = bb.center ?? [0, 0, 0];
    const c = Math.cos(y), s = Math.sin(y);
    solids.push({ id: e.id, u: [c, -s], v: [s, c], c: [e.pos[0] + cc[0] * c + cc[2] * s, e.pos[2] - cc[0] * s + cc[2] * c], hu: bb.size[0] / 2, hv: bb.size[2] / 2, h: bb.size[1] });
}
console.error(`collision set: ${solids.length} solids`);
function satGap(A: OBB, B: OBB): number {
    let best = -Infinity;
    for (const ax of [A.u, A.v, B.u, B.v]) {
        const dd = Math.abs((B.c[0] - A.c[0]) * ax[0] + (B.c[1] - A.c[1]) * ax[1]);
        const ra = A.hu * Math.abs(A.u[0] * ax[0] + A.u[1] * ax[1]) + A.hv * Math.abs(A.v[0] * ax[0] + A.v[1] * ax[1]);
        const rb = B.hu * Math.abs(B.u[0] * ax[0] + B.u[1] * ax[1]) + B.hv * Math.abs(B.v[0] * ax[0] + B.v[1] * ax[1]);
        best = Math.max(best, dd - ra - rb);
    }
    return best;
}
function seatObbs(azDeg: number, rad: number) {
    const az = azDeg * Math.PI / 180;
    const px = rad * Math.cos(az), pz = rad * Math.sin(az);
    const yaw = TH_OLD + (Math.atan2(HOST_OLD[1], HOST_OLD[0]) - az);
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const mk = (b: typeof KILN): OBB => ({ id: "", u: [c, -s], v: [s, c], c: [px + b.cx * c + b.cz * s, pz - b.cx * s + b.cz * c], hu: b.hx, hv: b.hz, h: 0 });
    return { px, pz, yaw, obbs: [mk(KILN), mk(B12), mk(SIGN)] };
}
// control: sign-validate scanner arithmetic at CURRENT live seat (expect
// small positive gaps to nearest solids; the standing seat is lawful)
{
    const live = seatObbs(51.5, 49.79); // az51.5 r49.79 == (31,39) to 0.05m
    let worst = Infinity, wid = "";
    for (const t of live.obbs) for (const o of solids) { const g = satGap(t, o); if (g < worst) { worst = g; wid = o.id; } }
    console.error(`CONTROL live-seat worst gap ${worst.toFixed(3)} vs ${wid} (standing seat; small positive expected — b12/sign concentric bands excluded via center/height, charcoal 4.2m off)`);
}
// ring-road / walkline geometry
const BEADS: Array<[number, number]> = [[23.88, 15.73], [31.46, 21.09], [38.88, 26.57], [40.96, 32.95], [38.76, 40.75], [33.84, 48.56], [28.78, 56.29], [23.79, 64.07]];
const MOSAIC36 = { c: [38.971, 22.5], h: 10.51 }; // az30 r45 film, center + half-extent (axis-aligned)
const seg = (p: [number, number], a: [number, number], b: [number, number]) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dz));
};
const cornerPts = (o: OBB): Array<[number, number]> => {
    const out: Array<[number, number]> = [];
    for (const lx of [-o.hu, o.hu]) for (const lz of [-o.hv, o.hv]) out.push([o.c[0] + lx * o.u[0] + lz * o.v[0], o.c[1] + lx * o.u[1] + lz * o.v[1]]);
    return out;
};
const results: any[] = [];
for (let az = 30; az <= 75; az += 0.5) {
    for (let rad = 24; rad <= 32; rad += 0.5) {
        const { px, pz, yaw, obbs } = seatObbs(az, rad);
        let worst = Infinity, wid = "";
        let ok = true;
        for (const t of obbs) {
            for (const o of solids) {
                const g = satGap(t, o);
                if (g < worst) { worst = g; wid = o.id; }
                if (g < 1.4) { ok = false; break; }
            }
            if (!ok) break;
        }
        if (!ok) continue;
        const corners = obbs.flatMap(cornerPts);
        const radii = corners.map(p => Math.hypot(p[0], p[1]));
        const rmin = Math.min(...radii), rmax = Math.max(...radii);
        if (rmin < 20.7 || rmax > 33) continue;    // ring-road outer edge + rim law
        const wl = Math.min(...corners.map(p => Math.min(...BEADS.slice(1).map((b, i) => seg(p, BEADS[i], b)))));
        if (wl < 3.0) continue;                     // lane-002 clearance (else walk owed)
        const zax = Math.min(...corners.map(p => Math.abs(p[1])));
        if (zax < 3.0) continue;                    // E-axis walking line
        const md = Math.min(...corners.map(p => Math.max(Math.abs(p[0] - MOSAIC36.c[0]), Math.abs(p[1] - MOSAIC36.c[1])) - MOSAIC36.h));
        if (md < 2.5) continue;                     // mosaic film design margin
        results.push({ az, r: rad, px: +px.toFixed(3), pz: +pz.toFixed(3), yawDeg: +(yaw * 180 / Math.PI).toFixed(2), worst: +worst.toFixed(3), vs: wid, lane: +wl.toFixed(2), rim: `${rmin.toFixed(2)}..${rmax.toFixed(2)}` });
    }
}
results.sort((a, b) => b.worst - a.worst);
console.log(JSON.stringify({ lawful: results.length, top: results.slice(0, 20) }, null, 1));
