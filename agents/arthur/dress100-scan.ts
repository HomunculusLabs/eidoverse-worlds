// dress100-scan.ts — siting scan for nx-dress-nw-fieldcross-001 (NW fieldcross, item 5).
// Concept: ONE maintained field-crossing through orchard-0033's NW edge —
// the in/out gap in the district's densest orchard wall. Two plank stiles
// straddling the edge (outside + inside), hedgerow stubs flanking the outer
// stile, mown-gap strip through the break.
// Scan domain: NW quadrant, r band honored via rim-corners gate. Poses
// anchored to orchard-0033's four edges (mid-edge only — trunk-pair spans
// are 17.6m; corners are trunk-blocked). Yaw normal to the edge.
// Gates: 2D OBB SAT >= 1.4m vs fresh live solids (true dims, center
// offset), walking-line clearance, approach cones (18m, 25deg), rim
// corners within CITY-PLAN district band r70-100. Read-only.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

// PLANNED dims (pre-build scan; placer re-gates on TRUE decode dims —
// dress-80 law). Stile pair + stubs: footprint along-edge ~5.8m, depth ~2.3m.
// Local frame: +z = crossing direction (through the gap, toward orchard center).
const HALF = { x: 2.9, z: 1.15 }, CLOCAL = { x: 0, z: 0 };

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

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
const d: any = await r.json();
const ents = d.entities ?? [];
console.error(`census ${ents.length}`);

// Orchard pin (epoch guard)
const ORCH = ents.find((e: any) => e.id === "nx-cultivation-orchard-0033");
if (!ORCH) throw new Error("orchard-0033 missing from census");
if (ORCH.lib !== "store/55fdc827f0bbcbf4.glb") throw new Error(`orchard lib drift: ${ORCH.lib}`);
const OX = ORCH.pos[0], OZ = ORCH.pos[2], OYAW = ORCH.yaw;
console.error(`orchard-0033 @ (${OX.toFixed(2)}, ${OZ.toFixed(2)}) yaw ${OYAW.toFixed(5)}`);

// solids: bbox-bearing non-film entities
const solids: { id: string, pos: number[], yaw: number, bb: any }[] = [];
for (const e of ents) {
    if (!e.pos || !e.lib) continue;
    const bb = e.bbox;
    if (!bb || !bb.size) continue;
    if (bb.max[1] - bb.min[1] <= 0.5) continue; // ground film exempt
    solids.push({ id: e.id, pos: e.pos, yaw: e.yaw ?? 0, bb });
}
console.error(`solids ${solids.length}`);

// walking lines that matter near the orchard (from plan history):
// NW approach lane outer end (-59, 33) -> skep row (-53.6, 54.5); field paths
// implied, not paved. We gate on the approach lane line only (segment).
const SEGS: [number, number, number, number][] = [
    [-45.4, 35.8, -53.6, 54.5],  // mile-nw-001 -> skeps (approx lane)
    [-48.0, 46.7, -50.8, 47.5],  // lamp-002 -> mile-008 area
];

const cosO = Math.cos(OYAW), sinO = Math.sin(OYAW);
const L2W = (lx: number, lz: number): [number, number] => [OX + lx * cosO + lz * sinO, OZ - lx * sinO + lz * cosO];

const inCone = (ex: number, ez: number, axisAz: number, px: number, pz: number) => {
    const dist = Math.hypot(px - ex, pz - ez);
    if (dist > 18) return false;
    const bearing = Math.atan2(px - ex, pz - ez);
    let diff = Math.abs(bearing - axisAz);
    while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
    return diff < (25 * Math.PI / 180);
};

const results: any[] = [];
// pose candidates: angular sweep around the orchard perimeter, 5deg steps,
// crossing frame yaw = inward normal (local +z toward orchard center)
for (let t = 0; t < 360; t += 5) {
    const lx = 6.9 * Math.sin(t * Math.PI / 180), lz = 6.9 * Math.cos(t * Math.PI / 180);
    const yawW = OYAW + Math.atan2(-lx, -lz);
    const [wx, wz] = L2W(lx, lz);
    // small along-edge jitter for fine positioning
    for (let along = -0.5; along <= 0.5; along += 0.25) {
        const cosP = Math.cos(yawW), sinP = Math.sin(yawW);
        const cx = wx + along * cosP, cz = wz - along * sinP;
        // TRUNK GUARD (source-true): piece OBB must clear all four trunk
        // columns (r 0.45 at local (±6.24,±6.24)) by >= 1.4m — a stile riding
        // into a trunk is a pinch, and the tree dies (0b law: census bbox
        // overlap means nothing; the trunks are the real geometry).
        let trunkBlocked = false;
        for (const [tx, tz] of [[-6.24, -6.24], [-6.24, 6.24], [6.24, -6.24], [6.24, 6.24]]) {
            const [twx, twz] = L2W(tx, tz);
            // trunk center vs piece OBB: signed distance in piece frame
            const dx = twx - cx, dz = twz - cz;
            const pu = Math.abs(dx * cosP + dz * (-sinP));   // along piece local x
            const pv = Math.abs(dx * sinP + dz * cosP);      // along piece local z
            const outside = Math.max(pu - HALF.x, 0) ** 2 + Math.max(pv - HALF.z, 0) ** 2;
            const clear = Math.sqrt(outside) - 0.45;         // trunk radius
            if (clear < 1.4) { trunkBlocked = true; break; }
        }
        if (trunkBlocked) continue;
        const A = obb([cx, 0, cz], yawW, HALF, CLOCAL);
        let minSat = Infinity, worst = "";
        let blocked = false;
        for (const s of solids) {
            const B = obb(s.pos, s.yaw, { x: s.bb.size[0] / 2, z: s.bb.size[2] / 2 },
                { x: (s.bb.min[0] + s.bb.max[0]) / 2, z: (s.bb.min[2] + s.bb.max[2]) / 2 });
            const g = satGap(A, B);
            if (s.id === "nx-cultivation-orchard-0033") {
                // designed mount: piece must sit ON the edge (overlap with the
                // orchard bbox expected — hedge/fence film rides the edge)
                if (g > 0.1) { blocked = true; worst = "orchard(off-edge)"; break; }
                continue;
            }
            if (g < minSat) { minSat = g; worst = s.id; }
            if (g < 1.4) { blocked = true; worst = s.id; break; }
        }
        if (blocked) continue;
        // rim corners
        const cs: [number, number][] = [[-HALF.x, -HALF.z], [HALF.x, -HALF.z], [-HALF.x, HALF.z], [HALF.x, HALF.z]];
        const rs = cs.map(([lx, lz]) => Math.hypot(cx + lx * cosP + lz * sinP, cz - lx * sinP + lz * cosP));
        const rimLo = Math.min(...rs), rimHi = Math.max(...rs);
        if (rimLo < 70 || rimLo > 108 || rimHi > 108) continue;
        // walking lines
        const lineClear = Math.min(...SEGS.map(([ax, az, bx, bz]) => distToSeg(cx, cz, ax, az, bx, bz)));
        if (lineClear < 1.4) continue;
        // cones (piece vs every solid's approach cone)
        let coneHit = false;
        for (const s of solids) {
            if (s.id === "nx-cultivation-orchard-0033") continue;
            const axisAz = Math.atan2(-s.pos[0], -s.pos[2]); // to plaza
            if (inCone(s.pos[0], s.pos[2], axisAz, cx, cz)) { coneHit = true; break; }
        }
        if (coneHit) continue;
        results.push({ deg: t, x: +cx.toFixed(2), z: +cz.toFixed(2), yaw: yawW, along, minSat: +minSat.toFixed(3), worst, lineClear: +lineClear.toFixed(2), rimLo: +rimLo.toFixed(1), rimHi: +rimHi.toFixed(1) });
    }
}
console.error(`legal poses: ${results.length}`);
for (const p of results)
    console.log(JSON.stringify({ ...p, yawDeg: +(p.yaw * 180 / Math.PI).toFixed(2) }));
