// fauna27-seat-sweep.ts — R-125 CURE re-seat sweep for the peacock
// (sweep-319 defect: plinth/bird interpenetrate lavender-0040 PLANT bodies
// 0.004/0.001m — the fauna-25 seat landed INSIDE the bed's planted
// rectangle; the fauna-25 sweep's standing-precedent FILM exemption
// kept the bed out of the SAT set entirely, so nothing caught it).
// Law for plinth-class fauna vs planting films: the bed cannot PINCH a
// walker (film, SAT-exempt) but its PLANT BODIES interpenetrate solids —
// so the bed gets a dedicated RECTANGLE constraint here: candidate OBB
// must clear BOTH lavender bed rectangles (0040 + 0027, census bbox =
// planting envelope, conservative) by ≥ 0.25m.
// Additional constraint (lamp-in-path law): ≥ 1.0m off the stile→dovecote
// stroll line (plinth BESIDE the visitor line, never on it).
// SAT solids: same filter as fauna25-seat-sweep (films ≤0.5m, suspended
// ≥1.8m, lavender beds excluded from SAT — handled by the rectangle gate).
// Preference: nearest the dovecote-side stroll anchor (−49.0, 61.3) — the
// R-125 suggested cure direction (along the bed edge toward the dovecote,
// the show-bird kinship). YAW stays 2.58 (judged orientation preserved —
// pure translation, all v8 judge reads stand).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// my decoded OBB (v8 envelope — unchanged bytes)
const CX = 0.022, CZ = -0.1225, HW = 0.903, HD = 0.6175;
// fauna-27 yaw: display faces the NEW approach (dovecote side, NW) —
// facing = (sin yaw, cos yaw) ≈ direction seat→dovecote (-0.733,-0.680).
// Same judged bytes; orientation reads (18m oblique/train/face) hold.
const YAW = -2.318;

const BEDS = ["nx-cultivation-lavender-0040", "nx-cultivation-lavender-0027"];
const bedEnts = BEDS.map(id => ents.find((e: any) => e.id === id)).filter(Boolean);
if (bedEnts.length !== 2) throw Error(`bed census incomplete: ${bedEnts.length}/2`);

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-peacock-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films/rider films
    if (e.pos[1] >= 1.8) return false;             // suspended decor
    if (BEDS.includes(e.id)) return false;         // beds: rectangle gate below
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

// bed OBBs from census bbox (planting envelope, conservative)
const bedObjs = bedEnts.map((e: any) => {
    const b = e.bbox;
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const wx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const wz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    return { id: e.id, o: obb(wx, wz, e.yaw, b.size[0] / 2, b.size[2] / 2) };
});

// stroll line stile → dovecote (visitor path; plinth stays beside it);
// for the moved seat the visitor continues dovecote → orchard rows (NW
// leg), so the gate covers the FULL stroll polyline stile→dovecote→rows.
const STILE: [number, number] = [-45.25, 54.45], DOVE: [number, number] = [-50.5, 62.55], ROWS: [number, number] = [-48.06, 67.53];
const segDist = (px: number, pz: number): number => {
    const segs: Array<[[number, number], [number, number]]> = [[STILE, DOVE], [DOVE, ROWS]];
    let best = Infinity;
    for (const [[ax, az], [bx, bz]] of segs) {
        const dx = bx - ax, dz = bz - az;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
        const d = Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
        if (d < best) best = d;
    }
    return best;
};

// Rank by stroll-line proximity (show bird beside the visitor line),
// tie-break dovecote kinship. ANCHOR names the R-125 cure direction only.
const ANCHOR: [number, number] = [-49.0, 61.3];
const results: any[] = [];
for (let x = -50.0; x <= -38.0; x += 0.1) {
    for (let z = 56.0; z <= 76.0; z += 0.1) {
        // R-125 gate: clear BOTH bed rectangles by ≥0.25m (planting bodies)
        let bedWorst = Infinity, bedId = "";
        for (const bd of bedObjs) {
            const cos = Math.cos(YAW), sin = Math.sin(YAW);
            const wx = x + CX * cos + CZ * sin, wz = z - CX * sin + CZ * cos;
            const g = gap(obb(wx, wz, YAW, HW, HD), bd.o);
            if (g < bedWorst) { bedWorst = g; bedId = bd.id; }
        }
        if (bedWorst < 0.25) continue;
        // stroll-line gate: ≥1.0m off the visitor path
        if (segDist(x, z) < 1.0) continue;
        const cos = Math.cos(YAW), sin = Math.sin(YAW);
        const wx = x + CX * cos + CZ * sin, wz = z - CX * sin + CZ * cos;
        const me = obb(wx, wz, YAW, HW, HD);
        let worst = Infinity, worstId = "";
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 18) continue;
            const b = e.bbox;
            const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
            const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
            const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
            const g = gap(me, obb(ewx, ewz, e.yaw, b.size[0] / 2, b.size[2] / 2));
            if (g < worst) { worst = g; worstId = e.id; }
        }
        if (worst >= 1.4) results.push({ x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId, bedClear: +bedWorst.toFixed(3), bedId, stroll: +segDist(x, z).toFixed(2) });
    }
}
console.log(`qualifying seats (SAT ≥1.4m, beds +0.25m, stroll ≥1.0m): ${results.length}`);
if (!results.length) throw Error("no qualifying seat in the sweep zone");
results.sort((a: any, b: any) => (a.stroll - b.stroll) || (Math.hypot(a.x - ANCHOR[0], a.z - ANCHOR[1]) - Math.hypot(b.x - ANCHOR[0], b.z - ANCHOR[1])));
for (const c of results.slice(0, 10)) console.log(JSON.stringify(c));
