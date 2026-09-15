// struct177-diag-clebsch.ts — DIAGNOSTIC after struct177-scan found 0 lawful
// band seats. Finer grid (0.5° az, 1.25m r) over band r55-130 AND the Math
// terminal-island window r135-170 (CITY-PLAN-V2: avenue = walk r55-130 +
// terminal island r140-170; 20m+ clearance from everything else between
// avenues). Reports the BINDING constraint at the best near-misses so the
// decision is arithmetic, not iteration. Yaw 40 (committed oblique law) and
// yaw 30 (fallback oblique; square footprint SAT shrinks 3.874->3.757).
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

const MATH = ["kochgarden","penrose","hydro","hygro","pyth","ptolemy","hypoth","crossing",
    "penrose2","sierpinski","geodesic","apollon","tensegrity","sundial","watershed",
    "catenoid","hilbert","dodecahedron","lorenz","chladni","voronoi","zeno",
    "borromean","brachistochrone","galtonboard","clothoid","peaucellier",
    "harmonickiss","gyroid","enneper","boy","seifert","villarceau","unduloid",
    "tesseract","rule30","sunflowerdial","costa","moebius","klein","kuen","catalan"];
const isMath = (id: string) => id.startsWith("nx-struct-") && !id.endsWith("-l") && MATH.some(k => id.includes(k));
const raz = (x: number, z: number) => { const a = Math.atan2(z, x) * 180 / Math.PI; return a < 0 ? a + 360 : a; };
const maths = ents.filter(e => isMath(e.id)).map(e => ({ id: e.id, r: Math.hypot(e.pos[0], e.pos[2]), az: raz(e.pos[0], e.pos[2]) }));
let center = 0, bestCount = -1;
for (let c = 0; c < 360; c += 0.5) {
    const n = maths.filter(m => Math.abs(((m.az - c + 540) % 360) - 180) <= 10).length;
    if (n > bestCount) { bestCount = n; center = c; }
}
console.log(`axis ${center.toFixed(1)} (${bestCount} forms); forms in band+terminal window:`);

// what stands in the math wedge r55..175 (the composition context)
for (const m of maths.filter(m => m.r >= 55 && m.r <= 175).sort((a, b) => a.r - b.r))
    console.log(`  ${m.id.padEnd(34)} r${m.r.toFixed(1).padStart(6)} az${m.az.toFixed(1).padStart(6)}`);

const HX = 5.50 / 2, HZ = 5.50 / 2;
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const walkers = ents.filter(e => (e.id.startsWith("nx-approach-") && !e.id.includes("lamp")) || /nx-town-(paths|roads)/.test(e.id));
function gates(pos: number[], yaw: number) {
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    const wcx = pos[0], wcz = pos[2];
    const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
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
        const g = Math.max(Math.abs(wcx - ecxW) - (EW + ew), Math.abs(wcz - eczW) - (ED + ed));
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

for (const yawDeg of [40, 30]) {
    const yaw = yawDeg * Math.PI / 180;
    console.log(`\n=== yaw ${yawDeg}° ===`);
    for (const [lo, hi, label] of [[55, 130, "BAND r55-130"], [135, 170, "TERMINAL r135-170"]] as [number, number, string][]) {
        const scored: any[] = [];
        for (let r = lo; r <= hi; r += 1.25) {
            for (let da = -10; da <= 10; da += 0.5) {
                const az = center + da;
                const a = az * Math.PI / 180;
                const pos = [r * Math.cos(a), 0, r * Math.sin(a)];
                const g = gates(pos, yaw);
                const lawful = g.nnB >= NN_LAW && g.satW >= LAW && g.wk >= 3.0;
                // score: lawful-first (by min margin), then near-miss rank
                const margin = Math.min(g.nnB - NN_LAW, g.satW - LAW, g.wk - 3.0);
                scored.push({ r, az, lawful, margin, ...g, pos });
            }
        }
        const lawful = scored.filter(s => s.lawful).sort((a, b) => b.margin - a.margin);
        console.log(`${label}: ${lawful.length} lawful of ${scored.length}`);
        for (const s of lawful.slice(0, 6))
            console.log(`  LAWFUL r${s.r.toFixed(2)} az${s.az.toFixed(1)} NN ${s.nnB.toFixed(2)} (${s.nnId}) SAT ${s.satW.toFixed(2)} (${s.satId}) walk ${s.wk.toFixed(2)} (${s.wkId}) margin ${s.margin.toFixed(2)}`);
        if (!lawful.length) {
            const near = scored.sort((a, b) => b.margin - a.margin).slice(0, 5);
            console.log(`  best near-misses (margin-sorted):`);
            for (const s of near)
                console.log(`   r${s.r.toFixed(2)} az${s.az.toFixed(1)} margin ${s.margin.toFixed(2)} — NN ${s.nnB.toFixed(2)} (${s.nnId}) SAT ${s.satW.toFixed(2)} (${s.satId}) walk ${s.wk.toFixed(2)} (${s.wkId})`);
        }
    }
}
