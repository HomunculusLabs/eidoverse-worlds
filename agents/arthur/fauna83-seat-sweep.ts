// fauna83-seat-sweep.ts — live-census SAT sweep for the fauna-83 European
// mole (FAUNA-PLAN row 52): the garden cottage's W/SW working margin —
// the band between the cottage skirt and the mosaic 0052 film edge (the
// plan's first-choice zone center (-29,22)). Mole solid OBB from the
// DECODE full-entity envelope (v4 94fce52e: W 0.654 D 0.202; x span
// -0.465..0.189 -> CX -0.138, HW 0.327, HD 0.101). FIXED yaw 2.2004 (the
// cottage's own facing — the dig line runs along the margin, nose ESE
// toward open ground, works trailing WSW). Gates: SAT >= 1.4m vs every
// solid (cottage INCLUDED — the working margin sits outside the skirt,
// unlike the rat's wall-hug); molehills never ON art (mosaic film
// center-containment, sheep law); fauna co-residents (wrabbit/hog)
// treated as SOLIDS regardless of height (never seat on a neighbor
// animal); reader lines (plaza spoke + gallery-line lane) kept >= 0.35m.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(20_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents = d.entities as any[];

// mole decoded full-entity OBB (v4 94fce52e)
const CX = -0.138, CZ = 0, HW = 0.327, HD = 0.101;
const FIXYAW = 2.2004;
const ANCHOR = { x: -29, z: 22 }; // the plan's first-choice zone center
const FAUNA = new Set(["nx-dress-wrabbit-001", "nx-dress-hog-001"]);

const lineDist = (px: number, pz: number, a: [number, number], b: [number, number]) => {
    const ax = a[0], az = a[1], bx = b[0], bz = b[1];
    const dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
};
// reader lines: the plaza spoke off the cottage front + the gallery-line
// lane (the NW margin's true approach, hog fauna-42 law d)
const LANE1: [number, number][] = [[-26, 19], [0, 0]];        // plaza spoke
const LANE2: [number, number][] = [[-27.5, 26.5], [-19, 32]]; // gallery-line lane NW

const solids = ents.filter((e: any) => {
    if (e.id === "nx-dress-mole-001") return false;
    if (FAUNA.has(e.id)) return true;             // neighbor animals = solids
    if (!e.bbox) return false;
    if (e.bbox.size[1] <= 0.5) return false;      // films
    if (e.pos[1] >= 1.8) return false;            // suspended decor
    return true;
});
const films = ents.filter((e: any) => e.bbox && e.bbox.size[1] <= 0.5 && e.id !== "nx-dress-hog-001");
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
const stages = { sat: 0, film: 0, lane: 0, ok: 0 };
for (let x = -34; x <= -24; x += 0.25) {
    for (let z = 15; z <= 27; z += 0.25) {
        const yaw = FIXYAW;
        const cos = Math.cos(yaw), sin = Math.sin(yaw);
        const wx = x + CX * cos + CZ * sin, wz = z - CX * sin + CZ * cos;
        let worst = Infinity, worstId = "";
        for (const e of solids) {
            if (Math.hypot(e.pos[0] - wx, e.pos[2] - wz) > 25) continue;
            if (!e.bbox) continue;
            const b = e.bbox;
            const ecx = (b.min[0] + b.max[0]) / 2, ecz = (b.min[2] + b.max[2]) / 2;
            const ewx = e.pos[0] + ecx * Math.cos(e.yaw) + ecz * Math.sin(e.yaw);
            const ewz = e.pos[2] - ecx * Math.sin(e.yaw) + ecz * Math.cos(e.yaw);
            const g = gap(obb(wx, wz, yaw, HW, HD), obb(ewx, ewz, e.yaw, b.size[0] / 2, b.size[2] / 2));
            if (g < worst) { worst = g; worstId = e.id; }
        }
        if (worst < 1.4) {
            stages.sat++;
            if (!nearMiss || worst > nearMiss.worst) nearMiss = { x: +x.toFixed(2), z: +z.toFixed(2), worst: +worst.toFixed(3), worstId };
            continue;
        }
        let onFilm = "";
        for (const f of films) {
            if (Math.hypot(f.pos[0] - x, f.pos[2] - z) > 28) continue;
            if (insideFilm(f, x, z)) { onFilm = f.id; break; }
        }
        if (onFilm) { stages.film++; continue; }
        const lane1 = lineDist(x, z, LANE1[0], LANE1[1]);
        const lane2 = lineDist(x, z, LANE2[0], LANE2[1]);
        const laneMin = Math.min(lane1, lane2);
        if (laneMin < 0.35) { stages.lane++; continue; }
        stages.ok++;
        results.push({ x: +x.toFixed(2), z: +z.toFixed(2), yaw: +yaw.toFixed(4), worst: +worst.toFixed(3), worstId, lane1: +lane1.toFixed(2), lane2: +lane2.toFixed(2), dAnchor: +Math.hypot(x - ANCHOR.x, z - ANCHOR.z).toFixed(2) });
    }
}
console.log(`stages: ${JSON.stringify(stages)}`);
console.log(`qualifying seats (SAT >=1.4, film-clear, lane >=0.35): ${results.length}`);
if (nearMiss) console.log("best near-miss (SAT-failed only):", JSON.stringify(nearMiss));
if (!results.length) throw Error("no qualifying seat in the sweep zone");
// preference: closest to the plan's first-choice zone center
results.sort((a: any, b: any) => (a.dAnchor - b.dAnchor) || (Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z)));
for (const c of results.slice(0, 8)) console.log(JSON.stringify(c));
