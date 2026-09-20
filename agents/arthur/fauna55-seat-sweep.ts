// fauna55-seat-sweep.ts — live-census SAT sweep for the fauna-55
// pheasants at the SE wild-edge meadow. Anchor host =
// nx-dress-se-snagdead-001 (60.6,-30) yaw -2.356, live lib 7ac83203 ==
// local bytes (verified this tick). The snag's census bbox
// (1.81×6.69×1.74) is compound-fat: its LOCAL-Z long axis runs along
// (±0.707,±0.707) NE-SW after yaw (crown shards + hollow), so the
// effective ground disc = rotated-OBB half-diagonal 3.465 + 0.35
// margin = 3.815 (source decode: flare r0.78 + debris r0.95 + roots
// r0.9 at the base; crown y>4.7). Member gate: seat center ≥ 3.815m
// from the snag center (the designed anchor adjacency — birds BESIDE
// their snag, never under its crown). All OTHER census solids: worst
// SAT gap ≥ 1.4m. Films: seat center not inside grown 0.3. The 18m
// reader spoke runs from the seat toward the plaza (unit (−0.897,
// +0.442) — the plaza→snag bearing); vantage checked for solid
// overlap at 1.4 (walk probe proves it after). Preference: spoke
// alignment |cross| ≤ 4.0m, then best worst-SAT, then nearer the
// snag (anchor kinship).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

const SNAG = ents.find((e: any) => e.id === "nx-dress-se-snagdead-001");
if (!SNAG) throw Error("snag absent");
const SX = SNAG.pos[0], SZ = SNAG.pos[2], SYAW = SNAG.yaw;
const bb = SNAG.bbox;
const ecx = (bb.min[0] + bb.max[0]) / 2, ecz = (bb.min[2] + bb.max[2]) / 2;
const scx = SX + ecx * Math.cos(SYAW) + ecz * Math.sin(SYAW);
const scz = SZ - ecx * Math.sin(SYAW) + ecz * Math.cos(SYAW);
const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
const SNAG_R = Math.hypot(hx, hz) + 0.35; // rotated half-diagonal + margin
console.log(`snag center world (${scx.toFixed(2)},${scz.toFixed(2)}) half (${hx},${hz}) → effective disc r ${SNAG_R.toFixed(3)}`);

// pheas decoded OBB (v2): center (-0.0110, 0.1659) half (0.4710, 0.4763)
const PX_C = -0.0110, PZ_C = 0.1659, PX_H = 0.4710, PZ_H = 0.4763;

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-se-snagdead-001") return false; // member-gated (disc)
    if (e.id === "nx-dress-pheas-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films
    if (e.pos[1] >= 1.8) return false;             // suspended
    return true;
});
const films = ents.filter((e: any) => e.bbox && e.bbox.size[1] <= 0.5);
console.log(`census ${ents.length} entities, ${solids.length} solids, ${films.length} films in SAT set`);

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
const worldOBB = (e: any) => {
    const b = e.bbox;
    const cx = (b.min[0] + b.max[0]) / 2, cz = (b.min[2] + b.max[2]) / 2;
    const wx = e.pos[0] + cx * Math.cos(e.yaw) + cz * Math.sin(e.yaw);
    const wz = e.pos[2] - cx * Math.sin(e.yaw) + cz * Math.cos(e.yaw);
    return obb(wx, wz, e.yaw, b.size[0] / 2, b.size[2] / 2);
};
const insideFilm = (e: any, px2: number, pz2: number) => {
    const b = e.bbox;
    const ecx2 = (b.min[0] + b.max[0]) / 2, ecz2 = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx2 * Math.cos(e.yaw) + ecz2 * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx2 * Math.sin(e.yaw) + ecz2 * Math.cos(e.yaw);
    const dx = px2 - ewx, dz = pz2 - ewz;
    const cos = Math.cos(e.yaw), sin = Math.sin(e.yaw);
    const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
    return Math.abs(lx) <= b.size[0] / 2 + 0.3 && Math.abs(lz) <= b.size[2] / 2 + 0.3;
};

// the plaza reader spoke: unit (S→plaza) = (-0.897, +0.442)
const UX = -0.897, UZ = 0.442;
// yaw of the entity: +x faces NW toward the plaza reader (cock at −0.85
// internal → entity yaw faces the spoke): facing=(cos,sin) of yaw == spoke
const YAW_E = Math.atan2(UX, UZ) - Math.PI / 2 + Math.PI; // see derivation below
// Direct derivation: we want entity +x world direction ≈ (UX', UZ') where
// the COCK's facing (his local (0.66,-0.75) at internal yaw -0.85) lands
// on the spoke (−0.897, +0.442). Cock facing in entity frame:
// (cos(−0.85)·cos(−0.85)−0·sin(−0.85), ...) — simpler: cock faces local
// direction (cos(-0.85), −sin(-0.85)) = (0.6600, 0.7510)?? No:
// facing local dir for +x-forward bird at internal yaw ψ is
// (cos ψ, −sin ψ) = (0.660, +0.751) in (x,z). Entity yaw Y rotates
// local→world: wx = cos Y·lx + sin Y·lz; wz = −sin Y·lx + cos Y·lz.
// Solve Y so that (0.660,0.751) ↦ (−0.897,0.442): angle of local vector
// θl = atan2(lz, lx)... use complex: local angle α = atan2(0.751, 0.660)
// = 0.850 rad; world angle β = atan2(0.442, −0.897) = 2.685 rad. Under
// the village transform, world angle = α − Y (x=cos stays, z sign) —
// verify: Y=0 → world dir (cos α, sin α) = local. So Y = α − β =
// 0.850 − 2.685 = −1.835.
const YAW = -1.835;
console.log(`entity yaw ${YAW.toFixed(3)} → cock faces world (${(Math.cos(-0.85) * Math.cos(YAW) + -Math.sin(-0.85) * Math.sin(YAW)).toFixed(3)}, ${(-Math.cos(-0.85) * Math.sin(YAW) + -Math.sin(-0.85) * Math.cos(YAW)).toFixed(3)}) — want ≈ (-0.897, +0.442)`);

const cosE = Math.cos(YAW), sinE = Math.sin(YAW);
const pheasOBB = (x: number, z: number) => {
    const wx = x + PX_C * cosE + PZ_C * sinE;
    const wz = z - PX_C * sinE + PZ_C * cosE;
    return { o: obb(wx, wz, YAW, PX_H, PZ_H), wx, wz };
};

const results: any[] = [];
let nearMiss: any = null;
for (let x = 49.5; x <= 59.0; x += 0.25) {
    for (let z = -34.5; z <= -26.5; z += 0.25) {
        // snag member gate (disc)
        const dSnag = Math.hypot(x - scx, z - scz);
        if (dSnag < SNAG_R) continue;
        // spoke alignment: perpendicular distance from the snag→plaza spoke line
        const cross = Math.abs((x - SX) * UZ - (z - SZ) * UX); // |cross| = perp dist
        // 18m vantage point on the spoke side
        const vx = x - 18 * UX, vz = z - 18 * UZ;
        let vOK = true;
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - vx, e.pos[2] - vz) > 16) continue;
            if (gap(obb(vx, vz, 0, 0.3, 0.3), worldOBB(e)) < 1.4) { vOK = false; break; }
        }
        if (!vOK) continue;
        // full SAT at the seat
        const { o, wx, wz } = pheasOBB(x, z);
        let worst = Infinity, worstId = "";
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 24) continue;
            const g = gap(o, worldOBB(e));
            if (g < worst) { worst = g; worstId = e.id; }
        }
        if (worst < 1.4) {
            if (!nearMiss || worst > nearMiss.worst) nearMiss = { x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId };
            continue;
        }
        let onFilm = "";
        for (const f of films) {
            if (Math.hypot(f.pos[0] - x, f.pos[2] - z) > 22) continue;
            if (insideFilm(f, x, z)) { onFilm = f.id; break; }
        }
        if (onFilm) continue;
        results.push({ x: +x.toFixed(2), z: +z.toFixed(2), dSnag: +dSnag.toFixed(2), cross: +cross.toFixed(2), worst: +worst.toFixed(3), worstId });
    }
}
console.log(`qualifying seats: ${results.length}`);
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: on-spoke (cross ≤ 4.0), then best worst-SAT, then nearer the snag
results.sort((a: any, b2: any) => (a.cross > 4.0 ? 1 : 0) - (b2.cross > 4.0 ? 1 : 0) || b2.worst - a.worst || a.dSnag - b2.dSnag);
for (const c of results.slice(0, 10)) console.log(JSON.stringify(c));
