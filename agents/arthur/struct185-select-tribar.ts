// struct185-select-tribar.ts — SEAT SELECTION for nx-struct-tribar v2 from
// the struct185 scan findings. Composition law (CITY-PLAN-V2 + struct-184
// committed carry):
//   - terminal island r140-179.9 stands at 8 members (cap 5-9): lorenz/
//     chladni/voronoi/peaucellier on-axis az94 + clebsch/menger/apollonian/
//     melencolia flanks — NOT a 9th island member.
//   - the az94 procession continues past them: zeno 179.9 -> borromean 190
//     -> brachistochrone 196.3 -> galtonboard 210.4 -> clothoid 219.8 ->
//     harmonickiss 230 -> gyroid 240 -> enneper 250 (~10m steps).
//   - TRIBAR YAW LAW (struct-184): the closure vantage (+Z face normal)
//     must aim DOWN a walk line — the design eye (E at 18m on the normal
//     axis) must sit ON the procession walk for the sustained closed read
//     (probe L6: reads closed 12-30m, sub-beam-width gaps). A flank seat
//     puts the normal ~parallel to the walk (never crosses) — ON-LINE only.
//   - on-line NN: every inter-form gap <=14.1m < 16 (8m law both sides) =>
//     the only lawful on-line seat is the NEXT PROCESSION STEP past
//     enneper: az94 r260 (10.0m step == gyroid->enneper rhythm, NN 10.0).
//   - YAW: normal_az = 90 - yaw_deg (melencolia convention, verified vs
//     live 145deg -> az305). Normal az274 (seat at az94 -> plaza direction
//     = az274, exactly along the line) => yaw = 176 deg. Approach from the
//     village reads CLOSED; the walk-past reveal opens the figure.
// Grid az 93.0-95.0 x r 256-266, all laws (NN>=8, SAT>=1.4 at FINAL yaw
// 176deg, walk>=3). Prefer az 94.0 dead-on, then r nearest 260 (rhythm).
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

const PROC = 94.0;      // procession line azimuth (this tick's scan: all on-axis forms az94±0.4)
const STEP_R = 260.0;   // next procession step: enneper 250 + 10.0 (gyroid->enneper rhythm)
const HX = 4.150 / 2, HZ = 1.973 / 2, CX = 0, CZ = 0; // tribar envelope symmetric, origin-centered (decode D6 re-run ALL PASS this tick)
const YAW = 176 * Math.PI / 180; // FINAL yaw: normal az274 = 90 - 176, aimed back down the line toward the plaza
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

// on-line continuation grid: az 93.0-95.0 (dead-on procession ±1°), r 256-266
const keep: any[] = [];
for (let az = 93.0; az <= 95.0 + 1e-9; az += 0.25) {
    for (let r = 256; r <= 266; r += 0.25) {
        const pos = pol(r, az);
        const { n, id: nid } = nn(pos);
        if (n < NN_LAW) continue;
        const { g, id: gid } = satGap(pos);
        if (g < LAW) continue;
        const { w, id: wid } = walkClear(pos);
        if (w < 3.0) continue;
        keep.push({ az, r, n, nid, g, gid, w, wid, pos });
    }
}
keep.sort((a, b) => b.g - a.g);
console.log(`\non-line continuation grid lawful seats: ${keep.length}`);
for (const c of keep.slice(0, 8))
    console.log(`  az${c.az.toFixed(2)} r${c.r.toFixed(2).padStart(7)}  NN ${c.n.toFixed(2)} (${c.nid})  SAT ${c.g.toFixed(2)} (${c.gid})  walk ${c.w.toFixed(2)}  pos (${c.pos[0].toFixed(3)},${c.pos[2].toFixed(3)})`);
if (!keep.length) { console.log("NO LAWFUL ON-LINE SEAT — escalate options (beyond-enneper band exhausted)"); process.exit(3); }
// rhythm preference: az dead-on 94.0, then r nearest the 260.0 step, then best SAT
keep.sort((a, b) => (Math.abs(a.az - PROC) - Math.abs(b.az - PROC)) || (Math.abs(a.r - STEP_R) - Math.abs(b.r - STEP_R)) || (b.g - a.g));
const best = keep[0];
console.log(`\nSELECTED (procession continuation, on-line):`);
console.log(`  az ${best.az.toFixed(2)} r ${best.r.toFixed(2)} — step ${((best.r - 250).toFixed(2))}m past enneper (gyroid->enneper rhythm 10.0)`);
console.log(`  POS = [${best.pos[0].toFixed(6)}, PY, ${best.pos[2].toFixed(6)}]  yaw ${YAW} (176deg — normal az274, back down the line toward the plaza; approach reads CLOSED)`);
console.log(`  NN ${best.n.toFixed(2)} vs ${best.nid} | SAT ${best.g.toFixed(2)} vs ${best.gid} | walk ${best.w.toFixed(2)}`);
// record alternative for the plan: the E-flank return at az90.5 r185
// (cadence-true but design-weak: normal ~parallel to the walk, closure
// vantage never crossed by the procession walker)
const alt = pol(185, 90.5);
const altN = nn(alt), altS = satGap(alt), altW = walkClear(alt);
console.log(`\nrecord alternative (az90.5/r185 E-flank of zeno<->borromean gap):`);
console.log(`  NN ${altN.n.toFixed(2)} (${altN.id}) | SAT ${altS.g.toFixed(2)} (${altS.id}) | walk ${altW.w.toFixed(2)} — lawful but REJECTED for the design: normal ~parallel to the walk line, the walker never crosses the closure vantage (yaw law demands on-line)`);
