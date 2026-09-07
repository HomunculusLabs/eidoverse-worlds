// dress108-scan-hookrow.ts — siting scan for nx-dress-sw-lanternhook-001
// (SW lantern hook row, round-3 item 19). Concept: CARE infrastructure on
// the devotional line — hooks where the nightly lantern is hung while the
// line is tended, row parallel to the walking line, hooks on the path side.
// Scan domain: SW quadrant r70-100 (CITY-PLAN band), grid 0.5m. Gates:
// 2D OBB SAT >=1.4m vs fresh live solids (true v3 decode dims, asymmetric
// local center), walking-line clearance 1.75..4m (NEAR the line — care
// infrastructure, not remote), approach cones (18m, 25deg half-angle, axis
// to plaza; labyrinth axis = devotional corridor az 12.3deg), rim [66,108].
// Row local +x along the walking line; local -z (hook side) toward the
// corridor. Read-only; prints legal poses ranked concept-first.
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

// v3 decode: envelope x -0.201..5.549, z -0.468..0.433
const HALF = { x: 2.8746, z: 0.4507 }, CLOCAL = { x: 2.6740, z: -0.0173 };

type OBB = { cx: number, cz: number, ux: number[], uz: number[], hu: number[] };
function obb(pos: number[], yaw: number, half: { x: number, z: number }, c: { x: number, z: number }): OBB {
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    return {
        cx: pos[0] + c.x * cos + c.z * sin,
        cz: pos[2] - c.x * sin + c.z * cos,
        ux: [cos, -sin], uz: [sin, cos],
        hu: [half.x, half.z],
    };
}
const radius = (o: OBB, ax: number[]) =>
    Math.abs(ax[0] * o.ux[0] + ax[1] * o.ux[1]) * o.hu[0] +
    Math.abs(ax[0] * o.uz[0] + ax[1] * o.uz[1]) * o.hu[1];
function satGap(a: OBB, b: OBB): number {
    const dx = b.cx - a.cx, dz = b.cz - a.cz;
    let gap = -Infinity;
    for (const ax of [a.ux, a.uz, b.ux, b.uz]) {
        const g = Math.abs(dx * ax[0] + dz * ax[1]) - radius(a, ax) - radius(b, ax);
        if (g > gap) gap = g;
    }
    return gap;
}
const distToSeg = (px: number, pz: number, ax: number, az: number, bx: number, bz: number) => {
    const abx = bx - ax, abz = bz - az;
    const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / (abx * abx + abz * abz)));
    return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
};

const r = await fetch(`${base}/geom?world=commons-next`);
if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
const d: any = await r.json();
const ents = d.entities ?? [];
console.error(`census ${ents.length}`);

// solids: bbox-bearing non-film entities
const solids: { id: string, pos: number[], yaw: number, bb: any }[] = [];
for (const e of ents) {
    if (!e.pos || !e.lib) continue;
    const bb = e.bbox;
    if (!bb || !bb.size) continue;
    if (bb.max[1] - bb.min[1] <= 0.5) continue; // ground film exempt
    solids.push({ id: e.id, pos: e.pos, yaw: e.yaw ?? 0, bb });
}

// walking line: plaza edge (0,-33) -> bend apex (-47.4,-62.4) -> labyrinth-0038 (-51.93,-83.11)
const LAB = [-51.93, -83.11];
const SEGS: [number, number, number, number][] = [[0, -33, -47.4, -62.4], [-47.4, -62.4, LAB[0], LAB[1]]];

// yaw: row local +x runs along the walking-line direction. Local -z (hook
// side) faces the corridor -> choose the yaw whose local -z normal points
// to the NEAREST line segment point. For each candidate we compute the
// line direction az (bearing of travel toward the labyrinth), then pick the
// side sign that puts local -z toward the line.
const lineDirAt = (x: number, z: number) => {
    // bearing of the walking direction near (x,z): toward bend then toward lab
    const dBend = Math.hypot(x + 47.4, z + 62.4);
    const dir = dBend < 6
        ? [LAB[0] + 47.4, LAB[1] + 62.4]
        : [-47.4 - 0, -62.4 + 33];
    return Math.atan2(dir[0], dir[1]);
};
const yawFor = (x: number, z: number) => {
    // nearest point on the line
    let best = Infinity, nx = 0, nz = 0;
    for (const [ax, az, bx, bz] of SEGS) {
        const abx = bx - ax, abz = bz - az;
        const t = Math.max(0, Math.min(1, ((x - ax) * abx + (z - az) * abz) / (abx * abx + abz * abz)));
        const px = ax + abx * t, pz = az + abz * t;
        const dd = Math.hypot(x - px, z - pz);
        if (dd < best) { best = dd; nx = px; nz = pz; }
    }
    const travelAz = lineDirAt(nx, nz);
    // yaw with local +x = travel direction: local +x world dir = (cos yaw, -sin yaw)
    // want (cos yaw, -sin yaw) = (sin travelAz, cos travelAz)  [dir vector from az]
    // cos yaw = sin travelAz, sin yaw = -cos travelAz
    let yaw = Math.atan2(-Math.cos(travelAz), Math.sin(travelAz));
    // local -z world dir = (sin yaw?, ...) -> check side: local -z maps to
    // (-sin? ) — compute directly: local (0,-1): wx = -(-1)*? Using
    // wx = px + lx*cos + lz*sin, wz = pz - lx*sin + lz*cos with (lx,lz)=(0,-1):
    // dir = (-sin, -cos)? No: wx dir = lz*sin = -sin; wz dir = lz*cos = -cos.
    // So local -z world dir = (-sin yaw, -cos yaw). Dot with (nx - x, nz - z):
    const dotSide = (-Math.sin(yaw)) * (nx - x) + (-Math.cos(yaw)) * (nz - z);
    if (dotSide < 0) yaw += Math.PI; // flip so hook side faces the line
    return yaw;
};

// cone check: 18m, 25deg half-angle. axis: entity->plaza; labyrinth -> corridor
const inCone = (ex: number, ez: number, axisAz: number, px: number, pz: number) => {
    const dist = Math.hypot(px - ex, pz - ez);
    if (dist > 18) return false;
    const bearing = Math.atan2(px - ex, pz - ez);
    let diff = Math.abs(bearing - axisAz);
    while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
    return diff < (25 * Math.PI / 180);
};

const results: { x: number, z: number, r: number, yaw: number, minSat: number, worst: string, lineClear: number, rimLo: number, rimHi: number }[] = [];
for (let x = -95; x <= -40; x += 0.5) {
    for (let z = -98; z <= -40; z += 0.5) {
        const rad = Math.hypot(x, z);
        if (rad < 70 || rad > 100) continue;
        const yaw = yawFor(x, z);
        const A = obb([x, 0, z], yaw, HALF, CLOCAL);
        let minSat = Infinity, worst = "";
        let blocked = false;
        for (const s of solids) {
            const B = obb(s.pos, s.yaw, { x: s.bb.size[0] / 2, z: s.bb.size[2] / 2 },
                { x: (s.bb.min[0] + s.bb.max[0]) / 2, z: (s.bb.min[2] + s.bb.max[2]) / 2 });
            const g = satGap(A, B);
            if (g < minSat) { minSat = g; worst = s.id; }
            if (g < 1.4) { blocked = true; break; }
        }
        if (blocked) continue;
        const lineClear = Math.min(...SEGS.map(([ax, az, bx, bz]) => distToSeg(x, z, ax, az, bx, bz)));
        if (lineClear < 1.75 || lineClear > 4.0) continue;
        // cones
        let coneHit = false;
        for (const s of solids) {
            let axisAz = Math.atan2(-s.pos[0], -s.pos[2]); // to plaza
            if (s.id.startsWith("nx-temple-labyrinth")) axisAz = 12.3 * Math.PI / 180;
            if (inCone(s.pos[0], s.pos[2], axisAz, x, z)) { coneHit = true; break; }
        }
        if (coneHit) continue;
        // rim corners
        const cos = Math.cos(yaw), sin = Math.sin(yaw);
        const cs: [number, number][] = [[-HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [-HALF.x + CLOCAL.x, HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, HALF.z + CLOCAL.z]];
        const rs = cs.map(([lx, lz]) => Math.hypot(x + lx * cos + lz * sin, z - lx * sin + lz * cos));
        const rimLo = Math.min(...rs), rimHi = Math.max(...rs);
        if (rimLo < 66 || rimHi > 108) continue;
        results.push({ x, z, r: rad, yaw, minSat, worst, lineClear, rimLo, rimHi });
    }
}
console.error(`legal poses: ${results.length}`);
// concept-first ranking: between bellpost (-54,-69.8) and seats (-57,-72.5)
// preferred -> target midpoint (-55.5,-71.2), line clear ~2.5m
const score = (p: typeof results[0]) =>
    Math.hypot(p.x + 55.5, p.z + 71.2) * 1.0 + Math.abs(p.lineClear - 2.5) * 1.5;
results.sort((a, b) => score(a) - score(b));
for (const p of results.slice(0, 12))
    console.log(JSON.stringify({ ...p, yawDeg: +(p.yaw * 180 / Math.PI).toFixed(2), minSat: +p.minSat.toFixed(3), lineClear: +p.lineClear.toFixed(2), rimLo: +p.rimLo.toFixed(1), rimHi: +p.rimHi.toFixed(1) }));
