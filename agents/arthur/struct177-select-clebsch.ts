// struct177-select-clebsch.ts — DESIGN-RANKED seat selection for the Clebsch
// in the Math terminal island (r140-170). Band saturation proven (struct177-
// scan 0/2501 + struct177-diag near-miss analysis: NN floor vs kuen 7.67 at
// the only SAT-passing pocket; the avenue walk r55-130 is FULL at 8m NN for a
// 5.5m form). Island law: 5-9 objects (currently 5: lorenz 140, chladni 150,
// voronoi 160, peaucellier 168.6, all az94 on-axis procession) — the Clebsch
// = 6th member, FIRST STAGGER, continuing the band's alternating-flank
// cadence (last band stagger catalan az100 W -> next E-side az84-89), rhythm
// slot r142-148 between lorenz and chladni, axis corridor az92-96 kept clear
// for the procession walk. Gates identical to scan/diag (NN 8, SAT 1.4 @yaw40,
// walk 3). Rank: (1) rhythm-slot membership, (2) E-flank membership,
// (3) SAT margin.
import { readFileSync } from "node:fs";
const CFG = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = CFG.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
async function geom(): Promise<Record<string, any>> {
    const r = await fetch(`${base}/geom?world=commons-next`);
    if (!r.ok) throw Error(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e]));
}
const E = await geom();
const ents = Object.values(E);
console.log(`fresh census: ${ents.length} entities`);

const AXIS = 94.0; // island procession line (lorenz/chladni/voronoi/peaucellier)
const HX = 5.50 / 2, HZ = 5.50 / 2;
const YAW = 40 * Math.PI / 180;
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const walkers = ents.filter(e => (e.id.startsWith("nx-approach-") && !e.id.includes("lamp")) || /nx-town-(paths|roads)/.test(e.id));
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
function gates(pos: number[]) {
    let satW = 1e9, satId = "", nnB = 1e9, nnId = "", wk = 1e9, wkId = "";
    for (const e of ents) {
        if (/^nx-struct-/.test(e.id) && !/-l$/.test(e.id)) {
            const d = Math.hypot(e.pos[0] - pos[0], e.pos[2] - pos[2]);
            if (d < nnB) { nnB = d; nnId = e.id; }
        }
        const bb = e.bbox;
        if (!bb) continue;
        if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;
        if (GROUND.test(e.id)) continue;
        const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
        const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
        const ey = e.yaw ?? 0, cy = Math.cos(ey), sy = Math.sin(ey);
        const ecxW = e.pos[0] + ecx * cy + ecz * sy, eczW = e.pos[2] - ecx * sy + ecz * cy;
        const ew = hx * Math.abs(cy) + hz * Math.abs(sy), ed = hx * Math.abs(sy) + hz * Math.abs(cy);
        const g = Math.max(Math.abs(pos[0] - ecxW) - (EW + ew), Math.abs(pos[2] - eczW) - (ED + ed));
        if (g < satW) { satW = g; satId = e.id; }
    }
    for (const e of walkers) {
        const bb = e.bbox || {} as any;
        const hx = ((bb.size ?? [0, 0, 0])[0]) / 2, hz = ((bb.size ?? [0, 0, 0])[2]) / 2;
        const d = Math.hypot(e.pos[0] - pos[0], e.pos[2] - pos[2]) - Math.max(hx, hz);
        if (d < wk) { wk = d; wkId = e.id; }
    }
    return { satW, satId, nnB, nnId, wk, wkId };
}
const scored: any[] = [];
for (let r = 140; r <= 170; r += 0.5) {
    for (let da = -10; da <= -3; da += 0.5) { // E-flank only (az 84..91), axis corridor 92-96 excluded
        const az = AXIS + da;
        const a = az * Math.PI / 180;
        const pos = [r * Math.cos(a), 0, r * Math.sin(a)];
        const g = gates(pos);
        if (g.nnB < NN_LAW || g.satW < LAW || g.wk < 3.0) continue;
        const inRhythm = r >= 142 && r <= 148; // between lorenz 140 and chladni 150
        scored.push({ r, az, inRhythm, lat: (az - AXIS > 0 ? az - AXIS : az - AXIS) * r * Math.PI / 180, ...g, pos });
    }
}
scored.sort((a, b) => (Number(b.inRhythm) - Number(a.inRhythm)) || (b.lat - a.lat) || (b.satW - a.satW)); // lat negative on E flank: descending = closest to corridor
console.log(`lawful E-flank island seats: ${scored.length}`);
console.log(`\ntop rhythm-slot (r142-148) seats, closest-to-corridor first:`);
const rhythm = scored.filter(s => s.inRhythm);
for (const s of rhythm.slice(0, 8))
    console.log(`  r${s.r.toFixed(1)} az${s.az.toFixed(1)} lat ${(-s.lat).toFixed(1)}m  NN ${s.nnB.toFixed(2)} (${s.nnId})  SAT ${s.satW.toFixed(2)} (${s.satId})  walk ${s.wk.toFixed(1)}  pos [${s.pos[0].toFixed(6)}, ${s.pos[2].toFixed(6)}]`);
if (!rhythm.length) { console.log("NO rhythm-slot seat — widen"); process.exit(3); }
const b = rhythm[0];
console.log(`\nSELECTED: r${b.r.toFixed(1)} az${b.az.toFixed(1)} pos [${b.pos[0].toFixed(6)}, PY, ${b.pos[2].toFixed(6)}] yaw 0.6981317 (40° oblique)`);
console.log(`  NN ${b.nnB.toFixed(2)} vs ${b.nnId} | SAT ${b.satW.toFixed(2)} vs ${b.satId} | lateral ${(-b.lat).toFixed(1)}m E of procession line`);
