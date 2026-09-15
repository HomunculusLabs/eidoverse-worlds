// struct179-select-menger.ts — SEAT SELECTION for nx-struct-menger v2 from
// the struct179 scan findings. Composition law (CITY-PLAN-V2 + struct-177
// island precedent + city-104..110 alternating-flank cadence):
//   - the az94 procession line has NO lawful on-axis slot in r170-180
//     (peaucellier r168.6 <-> zeno r179.9 center gap 11.3m < 2x8m NN);
//   - the island's established rhythm is the stagger zigzag: clebsch E-flank
//     (az90.5 r142, lateral 8.7m, radial slot lorenz140<->chladni150);
//   - alternating-flank cadence => the menger takes the W-FLANK mirror:
//     az > procession line, radial slot chladni150 <-> voronoi160, lateral
//     from the procession line ~7-13m (clebsch-width).
// Constraint grid az 95.5-100.5 x r 150-158, all laws (NN>=8, SAT>=1.4 at
// yaw 40 oblique, walk>=3). Pick best-by-SAT. Print the az90/r172
// rank-continuation alternative for the record.
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

const PROC = 94.0; // procession line azimuth (measured struct179-scan: 140..250 forms all az94±0.4)
const HX = 5.760 / 2, HZ = 5.760 / 2, CX = 0, CZ = 0; // menger envelope symmetric, origin-centered
const YAW = 40 * Math.PI / 180;
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

// W-flank mirror grid
const keep: any[] = [];
for (let az = 95.5; az <= 100.5; az += 0.5) {
    for (let r = 150; r <= 158; r += 0.5) {
        const pos = pol(r, az);
        const { n, id: nid } = nn(pos);
        if (n < NN_LAW) continue;
        const { g, id: gid } = satGap(pos);
        if (g < LAW) continue;
        const { w, id: wid } = walkClear(pos);
        if (w < 3.0) continue;
        const latM = (az - PROC) * Math.PI / 180 * r;
        if (latM < 7 || latM > 13) continue; // clebsch-width lateral (8.7m precedent)
        keep.push({ az, r, latM, n, nid, g, gid, w, wid, pos });
    }
}
keep.sort((a, b) => b.g - a.g);
console.log(`\nW-flank mirror grid lawful seats: ${keep.length}`);
for (const c of keep.slice(0, 8))
    console.log(`  az${c.az.toFixed(1)} r${c.r.toFixed(1).padStart(6)} lat ${c.latM.toFixed(1)}m  NN ${c.n.toFixed(2)} (${c.nid})  SAT ${c.g.toFixed(2)} (${c.gid})  walk ${c.w.toFixed(2)}  pos (${c.pos[0].toFixed(3)},${c.pos[2].toFixed(3)})`);
if (!keep.length) { console.log("NO LAWFUL W-FLANK SEAT — fall back to scan-wide stagger list"); process.exit(3); }
// rhythm preference: radial midpoint of the chladni<->voronoi slot is r155;
// among lawful seats prefer smallest |r-155| then best SAT.
keep.sort((a, b) => (Math.abs(a.r - 155) - Math.abs(b.r - 155)) || (b.g - a.g));
const best = keep[0];
console.log(`\nSELECTED (W-flank mirror of clebsch, radial slot chladni150<->voronoi160):`);
console.log(`  az ${best.az.toFixed(1)} r ${best.r.toFixed(1)} lat ${best.latM.toFixed(1)}m of procession line`);
console.log(`  POS = [${best.pos[0].toFixed(6)}, PY, ${best.pos[2].toFixed(6)}]  yaw ${YAW} (40° oblique)`);
console.log(`  NN ${best.n.toFixed(2)} vs ${best.nid} | SAT ${best.g.toFixed(2)} vs ${best.gid} | walk ${best.w.toFixed(2)}`);
// record alternative: az90/r172 rank-continuation
const alt = pol(172, 90);
const altN = nn(alt), altS = satGap(alt), altW = walkClear(alt);
console.log(`\nrecord alternative (az90/r172 stagger-rank continuation past peaucellier):`);
console.log(`  NN ${altN.n.toFixed(2)} (${altN.id}) | SAT ${altS.g.toFixed(2)} (${altS.id}) | walk ${altW.w.toFixed(2)} — lawful but weaker rhythm (extends clebsch's rank into a 2-member line; zigzag cadence preferred)`);
