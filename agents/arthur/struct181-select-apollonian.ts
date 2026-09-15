// struct181-select-apollonian.ts — SEAT SELECTION for nx-struct-apollonian
// v1 from the struct181 scan findings. Composition law (CITY-PLAN-V2 +
// struct-177/179 island precedent + city-104..110 alternating-flank cadence):
//   - island procession on-axis az94: lorenz140 -> chladni150 -> voronoi160
//     -> peaucellier168.6 (continues zeno179.9 -> enneper250 beyond);
//   - stagger zigzag: clebsch E-flank az90.5 r142 lat 8.7m (slot
//     lorenz<->chladni), menger W-flank az98.5 r155 lat 12.2m (slot
//     chladni<->voronoi);
//   - alternating-flank cadence => apollonian takes the E-FLANK return,
//     radial slot voronoi160 <-> peaucellier168.6 (dead-mid r164.3),
//     lateral from the az94 procession line ~7-13m (clebsch/menger width).
// NOTE: scan "lat" column is measured from the density axis 91.0; here
// lateral is measured from the PROCESSION line az94.0 (the 8.7/12.2
// precedent figures) — recomputed, never transcribed.
// Constraint grid az 89.0-92.5 x r 160-170, all laws (NN>=8, SAT>=1.4 at
// yaw 50 oblique, walk>=3). Pick by |r-164.3| then best SAT. Print the
// az90/r172 corridor alternative for the record.
import { readFileSync } from "node:fs";
const CFG = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = CFG.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

async function geom(): Promise<Record<string, any>> {
    const r = await fetch(`${base}/geom?world=commons-next`);
    if (!r.ok) throw Error(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const E = await geom();
const ents = Object.values(E);
console.log(`fresh census: ${ents.length} entities`);

const PROC = 94.0; // procession line azimuth (struct179-scan + this tick's struct181-scan: island forms all az94±0.4)
const SLOT_MID = 164.3; // dead-mid voronoi r160.0 <-> peaucellier r168.6
const HX = 0.700 / 2, HZ = 4.800 / 2, CX = 0, CZ = 0; // apollonian envelope symmetric, origin-centered (decode D5 this tick)
const YAW = 50 * Math.PI / 180; // struct-104 oblique-read law: face normal 40deg off the avenue walk line
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
function satGap(pos: number[]) {
    const wcx = pos[0], wcz = pos[2];
    let worst = 1e9, wid = "";
    for (const e of ents) {
        const bb = e.bbox;
        if (!bb) continue;
        if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;
        if (GROUND.test(e.id)) continue;
        const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
        const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
        const ey = e.yaw ?? 0, cy = Math.cos(ey), sy = Math.sin(ey);
        const ecxW = e.pos[0] + ecx * cy + ecz * sy, eczW = e.pos[2] - ecx * sy + ecz * cy;
        const eww = hx * Math.abs(cy) + hz * Math.abs(sy), edd = hx * Math.abs(sy) + hz * Math.abs(cy);
        const g = Math.max(Math.abs(wcx - ecxW) - (EW + eww), Math.abs(wcz - eczW) - (ED + edd));
        if (g < worst) { worst = g; wid = e.id; }
    }
    return { g: worst, id: wid };
}
function nn(pos: number[]) {
    let best = 1e9, bid = "";
    for (const e of ents) {
        if (!e.id.startsWith("nx-struct-") || e.id.endsWith("-l")) continue;
        const d = Math.hypot(e.pos[0] - pos[0], e.pos[2] - pos[2]);
        if (d < best) { best = d; bid = e.id; }
    }
    return { n: best, id: bid };
}
const walkers = ents.filter(e => (e.id.startsWith("nx-approach-") && !e.id.includes("lamp")) || /nx-town-(paths|roads)/.test(e.id));
function walkClear(pos: number[]) {
    let worst = 1e9, wid = "";
    for (const e of walkers) {
        const bb = e.bbox || {} as any;
        const hx = ((bb.size ?? [0, 0, 0])[0]) / 2, hz = ((bb.size ?? [0, 0, 0])[2]) / 2;
        const d = Math.hypot(e.pos[0] - pos[0], e.pos[2] - pos[2]) - Math.max(hx, hz);
        if (d < worst) { worst = d; wid = e.id; }
    }
    return { w: worst, id: wid };
}
const pol = (r: number, azDeg: number) => [r * Math.cos(azDeg * Math.PI / 180), 0, r * Math.sin(azDeg * Math.PI / 180)];

// E-flank return grid: lateral from procession line 7-13m (E side = az < 94)
const keep: any[] = [];
for (let az = 89.0; az <= 92.75; az += 0.25) {
    for (let r = 160; r <= 170; r += 0.25) {
        const pos = pol(r, az);
        const latM = (PROC - az) * Math.PI / 180 * r;
        if (latM < 7 || latM > 13) continue;
        const { n, id: nid } = nn(pos);
        if (n < NN_LAW) continue;
        const { g, id: gid } = satGap(pos);
        if (g < LAW) continue;
        const { w, id: wid } = walkClear(pos);
        if (w < 3.0) continue;
        keep.push({ az, r, latM, n, nid, g, gid, w, wid, pos });
    }
}
keep.sort((a, b) => b.g - a.g);
console.log(`\nE-flank return grid lawful seats: ${keep.length}`);
for (const c of keep.slice(0, 8))
    console.log(`  az${c.az.toFixed(2)} r${c.r.toFixed(2).padStart(7)} lat ${c.latM.toFixed(1)}m  NN ${c.n.toFixed(2)} (${c.nid})  SAT ${c.g.toFixed(2)} (${c.gid})  walk ${c.w.toFixed(2)}  pos (${c.pos[0].toFixed(3)},${c.pos[2].toFixed(3)})`);
if (!keep.length) { console.log("NO LAWFUL E-FLANK SEAT — fall back to scan-wide stagger list"); process.exit(3); }
// rhythm preference: radial dead-mid of the voronoi<->peaucellier slot is
// r164.3; among lawful seats prefer smallest |r-164.3| then best SAT.
keep.sort((a, b) => (Math.abs(a.r - SLOT_MID) - Math.abs(b.r - SLOT_MID)) || (b.g - a.g));
const best = keep[0];
console.log(`\nSELECTED (E-flank return, radial slot voronoi160<->peaucellier168.6):`);
console.log(`  az ${best.az.toFixed(2)} r ${best.r.toFixed(2)} lat ${best.latM.toFixed(1)}m of procession line (az94)`);
console.log(`  POS = [${best.pos[0].toFixed(6)}, PY, ${best.pos[2].toFixed(6)}]  yaw ${YAW} (50° oblique)`);
console.log(`  NN ${best.n.toFixed(2)} vs ${best.nid} | SAT ${best.g.toFixed(2)} vs ${best.gid} | walk ${best.w.toFixed(2)}`);
// record alternative: az90/r172 corridor continuation past peaucellier
const alt = pol(172, 90);
const altN = nn(alt), altS = satGap(alt), altW = walkClear(alt);
console.log(`\nrecord alternative (az90/r172 corridor continuation past peaucellier):`);
console.log(`  NN ${altN.n.toFixed(2)} (${altN.id}) | SAT ${altS.g.toFixed(2)} (${altS.id}) | walk ${altW.w.toFixed(2)} — lawful but weaker rhythm (on-axis beyond the stagger zone; zeno r179.9 already continues the rank; zigzag cadence preferred)`);
