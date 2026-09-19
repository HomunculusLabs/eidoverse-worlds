// fauna28-seat-sweep.ts — peahen seat near the re-seated peacock
// (−43.3, 69.7) yaw −2.318 (fauna-27). Village logic: he displays TO
// her — the pair reads when the stroll reader sees display + audience
// in one frame, so the seat ranks BETWEEN the peacock and his closest
// stroll-line point (dot > 0.35), at kinship range.
// Gates: SAT ≥1.4m vs ALL solids INCLUDING the peacock's decoded OBB
// (rooster/donkey flock-adjacency precedent: pair adjacency still
// honors the solid lane law); lavender bed rectangles ≥0.25m (fauna-27
// gate); stroll polyline ≥1.0m (lamp-in-path law).
// Yaw: her flank (the sagittal fan + cream arc contract view) faces the
// reader → facing ⊥ the stroll-line direction d=(0.44,0.90) → yaw ∈
// {2.024, −1.117}; the sign is chosen so her head (+z) has a positive
// component toward the reader (the arc presents).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// peahen decoded OBB (v19 envelope): local x −0.1195..0.1195, z
// −0.347..0.391 → center (0, 0.022), half (0.12, 0.369)
const CX = 0, CZ = 0.022, HW = 0.12, HD = 0.369;
// peacock decoded OBB (fauna-27, unchanged bytes)
const PK = { x: -43.3, z: 69.7, yaw: -2.318, cx: 0.022, cz: -0.1225, hw: 0.903, hd: 0.6175 };

const BEDS = ["nx-cultivation-lavender-0040", "nx-cultivation-lavender-0027"];
const bedEnts = BEDS.map(id => ents.find((e: any) => e.id === id)).filter(Boolean);
if (bedEnts.length !== 2) throw Error(`bed census incomplete: ${bedEnts.length}/2`);

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-peahen-001") return false;
    if (!e.bbox) return false;
    if (e.bbox.size[1] <= 0.5) return false;       // films/rider films
    if (e.pos[1] >= 1.8) return false;             // suspended decor
    if (BEDS.includes(e.id)) return false;         // beds: rectangle gate
    return true;
});
console.log(`census ${ents.length} entities, ${solids.length} solids in SAT set, ${bedEnts.length} bed rectangles`);

const obb = (wx: number, wz: number, yaw: number, hw: number, hd: number) => {
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    return { x: wx, z: wz, yaw, hw, hd, ax: [cos, -sin] as [number, number], az: [sin, cos] as [number, number] };
};
const gap = (a: any, b: any) => {
    const dx = a.x - b.x, dz = a.z - b.z;
    const axes: [number, number][] = [a.ax, a.az, b.ax, b.az];
    let best = -Infinity;
    for (const [ux, uz] of axes) {
        const pa = a.hw * Math.abs(a.ax[0] * ux + a.ax[1] * uz) + a.hd * Math.abs(a.az[0] * ux + a.az[1] * uz);
        const pb = b.hw * Math.abs(b.ax[0] * ux + b.ax[1] * uz) + b.hd * Math.abs(b.az[0] * ux + b.az[1] * uz);
        const g = Math.abs(dx * ux + dz * uz) - pa - pb;
        if (g > best) best = g;
    }
    return best;
};

const bedObjs = bedEnts.map((e: any) => {
    const b = e.bbox;
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const wx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const wz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    return { id: e.id, o: obb(wx, wz, e.yaw, b.size[0] / 2, b.size[2] / 2) };
});

// stroll polyline (fauna-27): stile → dovecote → rows
const STILE: [number, number] = [-45.25, 54.45], DOVE: [number, number] = [-50.5, 62.55], ROWS: [number, number] = [-48.06, 67.53];
const segDist = (px: number, pz: number): number => {
    const segs: Array<[[number, number], [number, number]]> = [[STILE, DOVE], [DOVE, ROWS]];
    let best = Infinity;
    for (const [[ax, az], [bx, bz]] of segs) {
        const dx = bx - ax, dz = bz - az;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
        const dd = Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
        if (dd < best) best = dd;
    }
    return best;
};
const closestStroll = (px: number, pz: number): [number, number] => {
    const segs: Array<[[number, number], [number, number]]> = [[STILE, DOVE], [DOVE, ROWS]];
    let best = Infinity, bx = 0, bz = 0;
    for (const [[ax, az], [cxx, czz]] of segs) {
        const dx = cxx - ax, dz = czz - az;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
        const qx = ax + t * dx, qz = az + t * dz;
        const dd = Math.hypot(px - qx, pz - qz);
        if (dd < best) { best = dd; bx = qx; bz = qz; }
    }
    return [bx, bz];
};

// peacock world OBB
const pkCos = Math.cos(PK.yaw), pkSin = Math.sin(PK.yaw);
const pkWx = PK.x + PK.cx * pkCos + PK.cz * pkSin, pkWz = PK.z - PK.cx * pkSin + PK.cz * pkCos;
const pkObb = obb(pkWx, pkWz, PK.yaw, PK.hw, PK.hd);

// flank-to-reader yaw: reader approaches from the rows end (WNW); the
// true profile presentation is ⊥ the READER DIRECTION (−0.98, 0.195),
// not ⊥ the line tangent — facing (0.195, 0.980) is 90° to the reader
// (arc fully presented, head pointing left-of-reader). yaw = 0.196.
const YAW_A = 0.196, YAW_B = 3.338;

const results: any[] = [];
for (let x = -47.0; x <= -39.5; x += 0.1) {
    for (let z = 66.0; z <= 73.5; z += 0.1) {
        const rdx = x - PK.x, rdz = z - PK.z;
        const rd = Math.hypot(rdx, rdz);
        if (rd < 1.4 || rd > 3.5) continue;        // kinship range
        // between peacock and his reader
        const [sx, sz] = closestStroll(PK.x, PK.z);
        const rdirx = sx - PK.x, rdirz = sz - PK.z, rlen = Math.hypot(rdirx, rdirz) || 1;
        const dot = (rdx / rd) * (rdirx / rlen) + (rdz / rd) * (rdirz / rlen);
        if (dot < 0.35) continue;
        // stroll gate
        if (segDist(x, z) < 1.0) continue;
        // bed gate + SAT at the flank yaw (worst of the two candidates)
        let worstAll = Infinity, worstId = "", bedWorst = Infinity;
        for (const YAW of [YAW_A, YAW_B]) {
            const cos = Math.cos(YAW), sin = Math.sin(YAW);
            const wx = x + CX * cos + CZ * sin, wz = z - CX * sin + CZ * cos;
            const me = obb(wx, wz, YAW, HW, HD);
            for (const bd of bedObjs) {
                const g = gap(me, bd.o);
                if (g < bedWorst) bedWorst = g;
            }
            let pkGap = gap(me, pkObb);
            if (pkGap < worstAll) { worstAll = pkGap; worstId = "nx-dress-peacock-001"; }
            for (const e of solids) {
                if (e.id === "nx-dress-peacock-001") continue;
                if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 18) continue;
                const b = e.bbox;
                const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
                const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
                const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
                const g = gap(me, obb(ewx, ewz, e.yaw, b.size[0] / 2, b.size[2] / 2));
                if (g < worstAll) { worstAll = g; worstId = e.id; }
            }
        }
        if (bedWorst < 0.25) continue;
        if (worstAll < 1.4) continue;
        results.push({ x: +x.toFixed(2), z: +z.toFixed(2), worst: +worstAll.toFixed(3), worstId, bedClear: +bedWorst.toFixed(3), stroll: +segDist(x, z).toFixed(2), dot: +dot.toFixed(2), dist: +rd.toFixed(2) });
    }
}
console.log(`qualifying seats (SAT ≥1.4m incl. peacock, beds +0.25m, stroll ≥1.0m): ${results.length}`);
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// rank: reader-between first, then kinship closeness
results.sort((a: any, b: any) => (b.dot - a.dot) || (a.dist - b.dist));
for (const c of results.slice(0, 10)) console.log(JSON.stringify(c));
