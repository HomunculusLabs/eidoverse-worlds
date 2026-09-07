// city8-scan-observatory.ts — seat scanner for CITY-PLAN row: nx-struct-observatory
// -> SW contemplative. EXACT disc-vs-OBB geometry (struct-19 law: the
// observatory is a round drum R=3.37 with true-bbox center offset c(0,0.34);
// square-SAT inflates a 6.74m disc into 2.4m of dead corners and false-fails).
// Solid-solid 1.4 law vs census solids (h>0.5); ground films exempt (height
// prong); quadrant-strict SW corners; rim [66,108]; walk-line distances
// (devotional corridor, labyrinth approaches, W spoke, moongate axis).
// Read-only: fetches FRESH census, prints lawful seats ranked worst-gap desc.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const R = 3.37;                 // drum radius (true bbox 6.74/2)
const CX = 0, CZ = 0.34;        // true bbox center offset (local)
const HALF = { x: 3.37, zLow: -3.32, zHigh: 4.0 }; // true local corners
const SELF = "nx-struct-observatory", LIGHT = "nx-struct-observatory-l";
const r = await fetch(`${base}/geom?world=${WORLD}`);
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities ?? [];
console.error(`census ${ents.length}`);
type OBB = { id: string; u: [number, number]; v: [number, number]; c: [number, number]; hu: number; hv: number; h: number };
const solids: OBB[] = [];
for (const e of ents) {
    if (e.id === SELF || e.id === LIGHT) continue;
    const bb = e.bbox; if (!bb?.size) continue;
    if (Math.max(Math.abs(bb.size[0]), Math.abs(bb.size[2])) < 0.001) continue;
    if (bb.size[1] <= 0.5) continue;            // ground film (height prong)
    if ((bb.min?.[1] ?? 0) > 4.5) continue;     // suspended above our 4.47 top
    const y = e.yaw ?? 0, cc = bb.center ?? [0, 0, 0];
    const c = Math.cos(y), s = Math.sin(y);
    solids.push({ id: e.id, u: [c, -s], v: [s, c], c: [e.pos[0] + cc[0] * c + cc[2] * s, e.pos[2] - cc[0] * s + cc[2] * c], hu: bb.size[0] / 2, hv: bb.size[2] / 2, h: bb.size[1] });
}
console.error(`collision set: ${solids.length} solids`);
// exact disc-vs-OBB signed clearance (negative = penetration)
function discGap(discX: number, discZ: number, o: OBB): number {
    const dx = discX - o.c[0], dz = discZ - o.c[1];
    const du = Math.abs(dx * o.u[0] + dz * o.u[1]) - o.hu;
    const dv = Math.abs(dx * o.v[0] + dz * o.v[1]) - o.hv;
    if (du <= 0 && dv <= 0) return -Math.min(du, dv) - R; // inside: penetration minus R
    const dist = Math.hypot(Math.max(du, 0), Math.max(dv, 0));
    return dist - R;
}
const seg = (px: number, pz: number, a: [number, number], b: [number, number]) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(px - (a[0] + t * dx), pz - (a[1] + t * dz));
};
const WALKS: Array<[string, [number, number], [number, number]]> = [
    ["devotional-corridor", [-45.638, -54.4], [-57, -72.5]],
    ["labyrinth0038-approach", [-57, -72.5], [-51.932, -83.1]],
    ["labyrinth0025-approach", [-45.638, -54.4], [-79.284, -57.6]],
    ["W-spoke", [0, 0], [-95, 0]],
    ["moongate-axis", [0, 0], [-43.84, -43.8]],
];
// sanity control (struct-19 law): a 4x4 c(0,0) disc at the soundmirror's
// proven seat (35.46,-55.66) must clear its neighbors (it does live) —
// validates the discGap sign convention against ground truth.
{
    let worst = 1e9, wid = "";
    for (const o of solids) { if (o.id === "nx-struct-soundmirror") continue; const g = discGap(35.46, -55.66, o); if (g < worst) { worst = g; wid = o.id; } }
    console.error(`CONTROL soundmirror-seat disc worst ${worst.toFixed(3)} vs ${wid} (expect > 0)`);
}
type Seat = { x: number; z: number; r: number; az: number; yaw: number; gap: number; who: string; walks: number; minCornerR: number; maxCornerR: number };
const seats: Seat[] = [];
for (let azDeg = 181; azDeg <= 269; azDeg += 0.5) {
    for (let rr = 66; rr <= 104; rr += 0.5) {
        const az = azDeg * Math.PI / 180;
        const px = rr * Math.cos(az), pz = rr * Math.sin(az); // register az = atan2(z,x): 0=E(+x), 180=W(-x), 270=N(-z); SW = 181..269
        const yaw = Math.atan2(-px, -pz);                       // radial-inward door read
        const c = Math.cos(yaw), s = Math.sin(yaw);
        // disc center world (true offset)
        const dcx = px + CX * c + CZ * s, dcz = pz - CX * s + CZ * c;
        // quadrant-strict + rim on TRUE corners
        let ok = true, minR = 1e9, maxR = -1e9;
        for (const lx of [-HALF.x, HALF.x]) for (const lz of [HALF.zLow, HALF.zHigh]) {
            const wx = px + lx * c + lz * s, wz = pz - lx * s + lz * c;
            if (wx >= -1 || wz >= -1) { ok = false; break; }   // SW quadrant-strict (1mm grace)
            const rad = Math.hypot(wx, wz);
            minR = Math.min(minR, rad); maxR = Math.max(maxR, rad);
        }
        if (!ok || minR < 66 || maxR > 108) continue;
        let worst = 1e9, who = "";
        for (const o of solids) { const g = discGap(dcx, dcz, o); if (g < worst) { worst = g; who = o.id; } }
        if (worst < 1.4) continue;
        let walkMin = 1e9;
        for (const lx of [-HALF.x, HALF.x]) for (const lz of [HALF.zLow, HALF.zHigh]) {
            const wx = px + lx * c + lz * s, wz = pz - lx * s + lz * c;
            for (const [, a, b] of WALKS) walkMin = Math.min(walkMin, seg(wx, wz, a, b));
        }
        seats.push({ x: px, z: pz, r: rr, az: azDeg, yaw, gap: worst, who, walks: walkMin, minCornerR: minR, maxCornerR: maxR });
    }
}
console.error(`lawful seats: ${seats.length}`);
// rank: prefer walk-clear (>=3m) seats, then max worst-gap, then closer to
// devotional ensemble az~228-232 for thematic adjacency.
const walkClear = seats.filter(s => s.walks >= 3.0);
console.error(`walk-clear (>=3m): ${walkClear.length}`);
const rank = (s: Seat) => -(s.gap + Math.min(s.walks, 8) / 4) - (s.az >= 215 && s.az <= 245 ? 1.5 : 0) - Math.max(0, (88 - Math.abs(s.r - 84)) / 20);
const pool = (walkClear.length ? walkClear : seats).sort((a, b) => rank(b) - rank(a)).slice(0, 500);
for (const s of pool) console.log(JSON.stringify({ x: +s.x.toFixed(3), z: +s.z.toFixed(3), az: s.az, r: s.r, yawDeg: +(s.yaw * 180 / Math.PI).toFixed(2), worstGap: +s.gap.toFixed(3), vs: s.who, walkMin: +s.walks.toFixed(2), rim: [ +s.minCornerR.toFixed(2), +s.maxCornerR.toFixed(2) ] }));
