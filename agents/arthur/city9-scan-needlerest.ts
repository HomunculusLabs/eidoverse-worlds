// city9-scan-needlerest.ts — seat scanner for CITY-PLAN row:
// nx-struct-needlerest (r47.5 off-spoke) -> NE craft threshold.
// Target = wayfarer's halt shared lib bb227fd6 (degenerate pair with
// nx-struct-halt). TRUE live bbox (dress-80 law): 4.4 x 2.631 x 2.859,
// local z-center offset +0.35. Yaw law from CURRENT live pose:
// yaw = az + 90deg exactly (7.33 rad = az(-30.09deg)+90.07deg; halt holds
// same axis mod 180) — preserves bench-to-walk read.
// Solid-solid 1.4m law vs census solids (h>0.5); ground films exempt
// (height prong); network layers excluded by explicit id set
// (nvp-109 two-prong law — approach lanes carry 2.66m posts inside a
// walkable film bbox); lights auto-skip (size 0). Read-only: fetches
// FRESH census. Prints lawful seats ranked, plus a sign-validation
// control at the CURRENT live seat (struct-32 recorded 2.19m vs h4).
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
// true local bbox of the halt GLB (from live census, needlerest entity)
const LMIN = { x: -2.2, z: -1.079 }, LMAX = { x: 2.2, z: 1.779 };
const CX = (LMIN.x + LMAX.x) / 2, CZ = (LMIN.z + LMAX.z) / 2; // (0, +0.35)
const HX = (LMAX.x - LMIN.x) / 2, HZ = (LMAX.z - LMIN.z) / 2; // 2.2, 1.4295
const SELF = "nx-struct-needlerest";
const NETWORKS = new Set(["nx-town-roads", "nx-core-paths",
    "nx-approach-ne-lane-002", "nx-approach-nw-lane-001", "nx-approach-sw-lane-003"]);
const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities ?? [];
console.error(`census ${ents.length}`);
type OBB = { id: string; u: [number, number]; v: [number, number]; c: [number, number]; hu: number; hv: number; h: number };
const solids: OBB[] = [];
for (const e of ents) {
    if (e.id === SELF) continue;
    if (NETWORKS.has(e.id)) continue;                 // network layer (explicit id set)
    const bb = e.bbox; if (!bb?.size) continue;
    if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue; // lights
    if (bb.size[1] <= 0.5) continue;                  // ground film (height prong)
    if ((bb.min?.[1] ?? 0) > 2.7) continue;           // suspended above halt top 2.631
    const y = e.yaw ?? 0, cc = bb.center ?? [0, 0, 0];
    const c = Math.cos(y), s = Math.sin(y);
    solids.push({ id: e.id, u: [c, -s], v: [s, c], c: [e.pos[0] + cc[0] * c + cc[2] * s, e.pos[2] - cc[0] * s + cc[2] * c], hu: bb.size[0] / 2, hv: bb.size[2] / 2, h: bb.size[1] });
}
console.error(`collision set: ${solids.length} solids`);
// exact OBB-vs-OBB SAT gap (max separating axis; positive = separated)
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
function targetOBB(px: number, pz: number, yaw: number): OBB {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return { id: SELF, u: [c, -s], v: [s, c], c: [px + CX * c + CZ * s, pz - CX * s + CZ * c], hu: HX, hv: HZ, h: 2.631 };
}
// CONTROL: sign-validate at the CURRENT live seat (41.1,-23.8) yaw 7.33
// — struct-32 recorded min gap 2.19m past artwalk h4.
{
    const t = targetOBB(41.1, -23.8, 7.33);
    let worst = 1e9, wid = "";
    for (const o of solids) { const g = satGap(t, o); if (g < worst) { worst = g; wid = o.id; } }
    console.error(`CONTROL current-seat worst ${worst.toFixed(3)} vs ${wid} (expect ~2.19 vs nx-artwalk-h4)`);
}
const seg = (px: number, pz: number, a: [number, number], b: [number, number]) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(px - (a[0] + t * dx), pz - (a[1] + t * dz));
};
// walk lines: NE threshold + district interior + E-spoke processional
const WALKS: Array<[string, [number, number], [number, number]]> = [
    ["NE-threshold-outer", [40.79, 27.01], [16.7, 68.3]],   // mile-004 -> mile-009
    ["NE-threshold-inner", [20.57, 70.79], [24.3, 84.6]],   // mile-010 -> hamlet-0054
    ["bench-to-interior", [14.23, 73.13], [24.3, 84.6]],
    ["E-spoke", [0, 0], [60, 8]],
];
type Seat = { x: number; z: number; r: number; az: number; yaw: number; gap: number; who: string; walks: number; minR: number; maxR: number };
const seats: Seat[] = [];
for (let azDeg = 45; azDeg <= 110; azDeg += 0.5) {
    for (let rr = 66; rr <= 104; rr += 0.5) {
        const az = azDeg * Math.PI / 180;
        const px = rr * Math.cos(az), pz = rr * Math.sin(az);
        const yaw = az + Math.PI / 2;                // bench-axis law (az+90deg)
        const t = targetOBB(px, pz, yaw);
        // quadrant-strict NE on TRUE corners + rim law
        let ok = true, minR = 1e9, maxR = -1e9;
        for (const lx of [LMIN.x, LMAX.x]) for (const lz of [LMIN.z, LMAX.z]) {
            const c = Math.cos(yaw), s = Math.sin(yaw);
            const wx = px + lx * c + lz * s, wz = pz - lx * s + lz * c;
            if (wx <= 1 || wz <= 1) { ok = false; break; }  // NE quadrant-strict (1m grace)
            const rad = Math.hypot(wx, wz);
            minR = Math.min(minR, rad); maxR = Math.max(maxR, rad);
        }
        if (!ok || minR < 66 || maxR > 108) continue;
        let worst = 1e9, who = "";
        for (const o of solids) { const g = satGap(t, o); if (g < worst) { worst = g; who = o.id; } }
        if (worst < 1.4) continue;
        let walkMin = 1e9;
        const c2 = Math.cos(yaw), s2 = Math.sin(yaw);
        for (const lx of [LMIN.x, LMAX.x]) for (const lz of [LMIN.z, LMAX.z]) {
            const wx = px + lx * c2 + lz * s2, wz = pz - lx * s2 + lz * c2;
            for (const [, a, b] of WALKS) walkMin = Math.min(walkMin, seg(wx, wz, a, b));
        }
        seats.push({ x: px, z: pz, r: rr, az: azDeg, yaw, gap: worst, who, walks: walkMin, minR, maxR });
    }
}
console.error(`lawful seats: ${seats.length}`);
// rank: walk-clear (>=2.5m from walk lines), max worst-gap, az near 76 (threshold), r 66-84
const walkClear = seats.filter(s => s.walks >= 2.5);
console.error(`walk-clear (>=2.5m): ${walkClear.length}`);
const rank = (s: Seat) => -(s.gap) - Math.abs(s.az - 76) * 0.15 - Math.max(0, Math.abs(s.r - 74)) * 0.05 - (s.walks >= 2.5 ? 0 : 5);
const pool = seats.sort((a, b) => rank(b) - rank(a)).slice(0, 60);
for (const s of pool) console.log(JSON.stringify({ x: +s.x.toFixed(3), z: +s.z.toFixed(3), az: s.az, r: s.r, yawDeg: +(((s.yaw * 180 / Math.PI) % 360 + 360) % 360).toFixed(2), worstGap: +s.gap.toFixed(3), vs: s.who, walkMin: +s.walks.toFixed(2), rim: [+s.minR.toFixed(2), +s.maxR.toFixed(2)] }));
