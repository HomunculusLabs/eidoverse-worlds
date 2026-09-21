// fauna81-seat-sweep.ts — live-census SAT sweep for the fauna-81 brown
// rat (FAUNA-PLAN row 51): the coop's W/S corner band — the wall-run
// seat class (the vole grass-run law applied to masonry: the run hugs
// the coop's own wall base). Rat solid OBB from the DECODE full-entity
// envelope (a6f956cc: W 0.694 D 0.272; entity-local center (−0.174,0)
// → CX −0.174, CZ 0, HW 0.347, HD 0.136). FIXED yaw −2.35 (oblique to
// the walking line, vole r9 law; the run reads at ~40° to the reader).
// HOST-GATE: gap vs the coop itself in [0.30,0.60] — the WALL HUG is the
// seat's own law (a wall-run sits at its wall; the coop is the host, so
// the 1.4m law yields to the hug band, hens-vs-flock/kestrel-post class).
// Other solids: worst gap ≥ 1.4m. Films (h ≤ 0.5): center not inside
// grown 0.3m. WALKING-LINE preference: keep ≥0.35m off the two reader
// lines (plaza spoke WNW; rooster→ramp yard line) — the rat runs BESIDE
// the lane, never on it (lamp-in-path law).
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// rat decoded full-entity OBB (half-extents + center offset, entity-local)
// v9 (9b1cb0d6): lane spans −0.705..+0.55 → CX −0.0775, HW 0.6275, HD 0.15
const CX = -0.0775, CZ = 0, HW = 0.6275, HD = 0.15;
const HOST = "nx-dress-coop";
const ANCHOR = { x: 36.0, z: -7.7 }; // the W/S corner
const FIXYAW = -2.35;
// reader lines (kept-off band 0.35m): plaza spoke + the yard line
const lineDist = (px: number, pz: number, a: [number, number], b: [number, number]) => {
    const ax = a[0], az = a[1], bx = b[0], bz = b[1];
    const dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
};
const LANE1: [number, number][] = [[31.25, -9], [36.43, -7.06]]; // rooster -> ramp base
const LANE2: [number, number][] = [[35.5, -7.5], [17.5, -3.6]];  // plaza spoke WNW

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-rat-001") return false;
    if (!e.bbox) return false;                     // lights/riders
    if (e.bbox.size[1] <= 0.5) return false;       // films/rider films
    if (e.pos[1] >= 1.8) return false;             // suspended decor
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
const insideFilm = (e: any, px: number, pz: number) => {
    const b = e.bbox;
    const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
    const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
    const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
    const dx = px - ewx, dz = pz - ewz;
    const cos = Math.cos(e.yaw), sin = Math.sin(e.yaw);
    const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
    return Math.abs(lx) <= b.size[0] / 2 + 0.3 && Math.abs(lz) <= b.size[2] / 2 + 0.3;
};

const results: any[] = [];
let nearMiss: any = null;
const stages = { sat: 0, film: 0, hug: 0, lane: 0, ok: 0 };
for (let x = 35.2; x <= 40.2; x += 0.25) {
    for (let z = -9.0; z <= -5.0; z += 0.25) {
        const yaw = FIXYAW;
        const cos = Math.cos(yaw), sin = Math.sin(yaw);
        const wx = x + CX * cos + CZ * sin, wz = z - CX * sin + CZ * cos;
        let worst = Infinity, worstId = "", hostGap = Infinity;
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 20) continue;
            const b = e.bbox;
            const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
            const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
            const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
            const g = gap(obb(wx, wz, yaw, HW, HD), obb(ewx, ewz, e.yaw, b.size[0] / 2, b.size[2] / 2));
            if (e.id === HOST) { hostGap = g; continue; }
            if (g < worst) { worst = g; worstId = e.id; }
        }
        if (worst < 1.4) {
            stages.sat++;
            if (!nearMiss || worst > nearMiss.worst) nearMiss = { x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId };
            continue;
        }
        let onFilm = "";
        for (const f of films) {
            if (Math.hypot(f.pos[0] - x, f.pos[2] - z) > 22) continue;
            if (insideFilm(f, x, z)) { onFilm = f.id; break; }
        }
        if (onFilm) { stages.film++; continue; }
        if (hostGap < 0.30 || hostGap > 0.60) { stages.hug++; continue; } // the wall-hug band
        const lane1 = lineDist(x, z, LANE1[0], LANE1[1]);
        const lane2 = lineDist(x, z, LANE2[0], LANE2[1]);
        const laneMin = Math.min(lane1, lane2);
        if (laneMin < 0.35) { stages.lane++; continue; }
        stages.ok++;
        results.push({ x: +x.toFixed(2), z: +z.toFixed(2), yaw: +yaw.toFixed(3), worst: +worst.toFixed(3), worstId, hostGap: +hostGap.toFixed(3), lane1: +lane1.toFixed(2), lane2: +lane2.toFixed(2), dAnchor: +Math.hypot(x - ANCHOR.x, z - ANCHOR.z).toFixed(2) });
    }
}
console.log(`stages: ${JSON.stringify(stages)}`);
console.log(`qualifying seats (SAT ≥1.4 non-host, film-clear, hug [0.30,0.60], lane ≥0.35): ${results.length}`);
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: closest to the W/S corner anchor, tie-break plaza-ward
results.sort((a: any, b: any) => (a.dAnchor - b.dAnchor) || (Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z)));
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
