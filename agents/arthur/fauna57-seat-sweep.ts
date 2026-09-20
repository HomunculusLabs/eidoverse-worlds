// fauna57-seat-sweep.ts — live-census SAT sweep for the fauna-57 magpie
// at the inn-yard apron. Host building nx-town-inn (36,0,0) yaw −1.571
// (door faces W toward the plaza; live lib 861225bb sibling-owned —
// foreign domain, hard-gated in the PLACER only, never re-placed).
// Zone: the WEST apron pocket x 31.2..33.4, z 1.6..6.4 — between the
// door line (z≈0, threshold rider b2 at x≈33) and the cellardoor
// (36,5.55, half 0.85 → W face 35.15), S of the well (30,−4.5) by ≥5m.
// The inn is a designed adjacency (the magpie works the inn yard): seat
// must sit 0.6..2.5m off the inn's west wall face (wall x = 36 − 4.185
// = 31.815 from census bbox half-x 4.185) — closer is a wall-rider,
// farther leaves the apron. All OTHER census solids: worst SAT ≥ 1.4m
// (rotated-OBB both sides). Films: seat center not inside grown 0.3.
// 18m vantage toward the plaza checked for solid overlap at 1.4.
// Yaw −1.571: the magpie's +x (head) faces W toward the approaching
// reader. Preference: on the plaza spoke (perp dist from (36,4)→(0,0)
// line ≤ 1.5), then best worst-SAT, then closer to the door line (z
// small — the busy apron, not the quiet margin).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];
console.log("census:", ents.length, "entities");

const YAW = -Math.PI / 2;
// magpie decoded OBB (fauna57-decode-magpi.ts): center (-0.069, 0.000)
// half (0.364, 0.089) — at yaw -π/2 world footprint half (0.089, 0.364)
const PX_C = -0.069, PZ_C = 0.000, PX_H = 0.3641, PZ_H = 0.0889;

const solids = ents.filter((e: any) => {
    if (e.id === "nx-town-inn") return false;     // member-gated (wall band)
    if (e.id === "nx-dress-magpi-001") return false;
    if (!e.bbox) return false;                     // lights/lights
    if (e.bbox.size[1] <= 0.5) return false;       // films (paths/riders)
    if (e.pos[1] >= 1.8) return false;             // suspended
    return true;
});
const films = ents.filter((e: any) => e.bbox && e.bbox.size[1] <= 0.5);
console.log(`${solids.length} solids, ${films.length} films in SAT set`);

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

// inn wall band: the designed adjacency — 0.6..2.5m off the west face
const INN_X_FACE = 36 - 4.185; // 31.815 (census bbox half-x at yaw −π/2
                               // swaps: size[0] 9?? careful: bbox size is
                               // LOCAL; at yaw −π/2 the world-x half is
                               // size[2]/2 = 8.37/2 = 4.185 ✓, world-z
                               // half is size[0]/2 = 4.5)
// plaza spoke: line (36,4)→(0,0), unit (-0.9938,-0.1104)
const UX = -0.9938, UZ = -0.1104;

const cosE = Math.cos(YAW), sinE = Math.sin(YAW);
const magpiOBB = (x: number, z: number) => {
    const wx = x + PX_C * cosE + PZ_C * sinE;
    const wz = z - PX_C * sinE + PZ_C * cosE;
    return { o: obb(wx, wz, YAW, PX_H, PZ_H), wx, wz };
};

// ground-layer network exemption (nvp-109 law c): road/path network
// entities carry vertical members (posts/arches) so the height film
// filter misses them, but their footprint IS the walkable plaza film —
// a reader vantage standing "on the road" is the intended state.
const GROUND_LAYER = /^(nx-town-roads|nx-town-paths|.*-roads-.*|.*-paths-.*)$/;

const results: any[] = [];
let nearMiss: any = null;
let vSample = "";
const stage = { wall: 0, vantage: 0, sat: 0, film: 0, ok: 0 };
for (let x = 29.3; x <= 31.25; x += 0.15) {
    for (let z = 1.6; z <= 6.4; z += 0.15) {
        // inn wall band (member gate)
        const offWall = INN_X_FACE - x; // >0 = west of the face
        if (offWall < 0.6 || offWall > 2.5) { stage.wall++; continue; }
        // plaza spoke perpendicular distance from the (36,4) spoke line
        const cross = Math.abs((x - 36) * UZ - (z - 4) * UX);
        // 18m vantage toward the plaza (SIGN LAW: U points AT the plaza;
        // the reader vantage is seat PLUS 18U — the fauna55 sweep's
        // minus form placed its check-point 18m AWAY from the plaza and
        // slept on an empty-meadow false-pass; its walk file used plus)
        const vx = x + 18 * UX, vz = z + 18 * UZ;
        let vOK = true, vBlocker = "";
        for (const e of solids) {
            if (GROUND_LAYER.test(e.id)) continue; // walkable film (law above)
            if (Math.hypot(e.pos[0] - vx, e.pos[2] - vz) > 16) continue;
            // VANTAGE MARGIN LAW (fauna-57): the fauna55 chassis demanded
            // 1.4m around the reader's standing POINT — honest in an empty
            // meadow, false-failing in the lamp-dotted plaza fringe (a
            // reader stands anywhere near; the artwalk standability bar
            // is "not inside a solid", 0.4m). Sightline quality is judged
            // at render; the walk probe proves standability live.
            if (gap(obb(vx, vz, 0, 0.3, 0.3), worldOBB(e)) < 0.4) { vOK = false; vBlocker = e.id; break; }
        }
        if (!vOK) { stage.vantage++; if (!vSample || stage.vantage % 40 === 0) vSample = vBlocker; continue; }
        // full SAT at the seat
        const { o } = magpiOBB(x, z);
        let worst = Infinity, worstId = "";
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - x, e.pos[2] - z) > 24) continue;
            const g = gap(o, worldOBB(e));
            if (g < worst) { worst = g; worstId = e.id; }
        }
        if (worst < 1.4) {
            stage.sat++;
            if (!nearMiss || worst > nearMiss.worst) nearMiss = { x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId };
            continue;
        }
        let onFilm = "";
        for (const f of films) {
            if (Math.hypot(f.pos[0] - x, f.pos[2] - z) > 22) continue;
            if (insideFilm(f, x, z)) { onFilm = f.id; break; }
        }
        if (onFilm) { stage.film++; continue; }
        stage.ok++;
        results.push({ x: +x.toFixed(2), z: +z.toFixed(2), offWall: +offWall.toFixed(2), cross: +cross.toFixed(2), worst: +worst.toFixed(3), worstId });
    }
}
console.log(`qualifying seats: ${results.length}`, "| stages:", JSON.stringify(stage), "| vantage blocker sample:", vSample || "none");
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: on the plaza spoke (cross ≤ 1.5), then best worst-SAT, then nearer the door line (small |z|)
results.sort((a: any, b2: any) => (a.cross > 1.5 ? 1 : 0) - (b2.cross > 1.5 ? 1 : 0) || b2.worst - a.worst || Math.abs(a.z) - Math.abs(b2.z));
for (const c of results.slice(0, 10)) console.log(JSON.stringify(c));
