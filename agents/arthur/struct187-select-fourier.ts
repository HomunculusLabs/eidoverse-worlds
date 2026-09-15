// struct187-select-fourier.ts — SEAT SELECTION for nx-struct-fourier v1 from
// the struct187 scan findings. Composition law (CITY-PLAN-V2 + struct-186
// committed carry):
//   - terminal island r140-179.9 stands at 8 members (cap 5-9) — NOT a 9th.
//   - the az94 procession continues past them: zeno 179.9 -> borromean 190
//     -> brachistochrone 196.3 -> galtonboard 210.4 -> clothoid 219.8 ->
//     harmonickiss 230 -> gyroid 240 -> enneper 250 -> tribar 260 (~10m steps).
//   - FOURIER YAW LAW (struct-186 carry, struct-104 oblique-read): the
//     readable register is the broad ladder face (+Z normal) — it must sit
//     30-40 deg OFF the walk line, never face-on/parallel (a 7.2m flat face
//     dead-on reads as a wall; oblique gives the rung stack dimension).
//     FINAL YAW 141 deg -> +Z normal az309 = 35 deg off the az274
//     anti-travel sightline: the outbound walker reads the face obliquely
//     on approach (melencolia/apollonian 35-40 deg precedent band). The
//     ladder SPAN (local x, 7.2m) then runs az39/219 — 55 deg off the walk,
//     both registers visible in one pass.
//   - on-line NN: tribar (r260) is the only neighbor within 8m-law reach;
//     next on-line step = az94.0 r270.0 (10.0m step == enneper->tribar
//     rhythm, NN 10.0 clean both sides).
// Grid az 93.0-95.0 x r 266-274, all laws (NN>=8, SAT>=1.4 at FINAL yaw
// 141deg, walk>=3). Prefer az 94.0 dead-on, then r nearest 270 (rhythm),
// then best SAT.
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
const STEP_R = 270.0;   // next procession step: tribar 260 + 10.0 (enneper->tribar rhythm)
const HX = 7.200 / 2, HZ = 0.600 / 2, CX = 0, CZ = 0; // fourier envelope symmetric, origin-centered (decode D6 re-run ALL PASS this tick)
const YAW = 141 * Math.PI / 180; // FINAL yaw: normal az309 = 90 - 141, 35 deg off the az274 anti-travel sightline
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

// on-line continuation grid: az 93.0-95.0 (dead-on procession ±1°), r 266-274
const keep: any[] = [];
for (let az = 93.0; az <= 95.0 + 1e-9; az += 0.25) {
    for (let r = 266; r <= 274; r += 0.25) {
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
console.log(`\non-line continuation grid lawful seats (FINAL yaw 141deg): ${keep.length}`);
for (const c of keep.slice(0, 8))
    console.log(`  az${c.az.toFixed(2)} r${c.r.toFixed(2).padStart(7)}  NN ${c.n.toFixed(2)} (${c.nid})  SAT ${c.g.toFixed(2)} (${c.gid})  walk ${c.w.toFixed(2)}  pos (${c.pos[0].toFixed(3)},${c.pos[2].toFixed(3)})`);
if (!keep.length) { console.log("NO LAWFUL ON-LINE SEAT — escalate options (beyond-tribar band exhausted)"); process.exit(3); }
// rhythm preference: az dead-on 94.0, then r nearest the 270.0 step, then best SAT
keep.sort((a, b) => (Math.abs(a.az - PROC) - Math.abs(b.az - PROC)) || (Math.abs(a.r - STEP_R) - Math.abs(b.r - STEP_R)) || (b.g - a.g));
const best = keep[0];
console.log(`\nSELECTED (procession continuation, on-line):`);
console.log(`  az ${best.az.toFixed(2)} r ${best.r.toFixed(2)} — step ${((best.r - 260).toFixed(2))}m past tribar (enneper->tribar rhythm 10.0)`);
console.log(`  POS = [${best.pos[0].toFixed(6)}, PY, ${best.pos[2].toFixed(6)}]  yaw ${YAW} (141deg — normal az309, 35deg off the az274 anti-travel sightline; approach reads the ladder face obliquely)`);
console.log(`  NN ${best.n.toFixed(2)} vs ${best.nid} | SAT ${best.g.toFixed(2)} vs ${best.gid} | walk ${best.w.toFixed(2)}`);
// record alternative for the plan: the mirror-oblique yaw 211deg (normal az239,
// west lean) — equally lawful 35deg band, east lean chosen to match the
// melencolia x>0 convention
const altYaw = 211 * Math.PI / 180;
const acs = Math.cos(altYaw), asn = Math.sin(altYaw);
const aEW = HX * Math.abs(acs) + HZ * Math.abs(asn), aED = HX * Math.abs(asn) + HZ * Math.abs(acs);
function satGapAlt(pos: number[]) {
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
        const g = Math.max(Math.abs(wcx - ecxW) - (aEW + eww), Math.abs(wcz - eczW) - (aED + edd));
        if (g < worst) { worst = g; wid = e.id; }
    }
    return { g: worst, id: wid };
}
const alt = best.pos;
const altS = satGapAlt(alt);
console.log(`\nrecord alternative (mirror-oblique yaw 211deg, normal az239 west lean):`);
console.log(`  SAT ${altS.g.toFixed(2)} (${altS.id}) — equally lawful 35deg band; east lean (141deg) chosen to match the melencolia x>0 convention`);
