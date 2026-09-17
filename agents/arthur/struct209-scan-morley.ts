// struct209-scan-morley.ts — SEAT SCAN for nx-struct-morley v1
// (banked sha a95b12958e032f69..., struct-208 committed carry: "placement =
// struct-209 carry (Math Avenue procession past viviani r370, 8m NN law,
// oblique 214deg convention, hash-gated spawn nx-struct-morley, comp {})").
// bun fetch /geom (nv-loop law: never curl|python3 — 403).
//
// MORLEY ENVELOPE (struct208-decode re-run ALL PASS 9/9 this tick, D8):
// 4.557 x 5.430 x 0.900 — x = width 4.557 (the long curb), y = HEIGHT 5.430,
// z = DEPTH 0.900, origin-centered ([-2.278,2.278]x[0,5.430]x[-0.450,0.450],
// drift 0.00mm), min y = 0. Footprint 4.557 x 0.900 (curb-long).
// Scan basis yaw = procession azimuth (select re-derives and pins the final
// oblique yaw + the placer re-runs SAT at FINAL pose).
// Chassis: struct207-scan-viviani.ts (proven).
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

const MATH = ["kochgarden","penrose","hydro","hygro","pyth","ptolemy","hypoth","crossing",
    "penrose2","sierpinski","geodesic","apollon","tensegrity","sundial","watershed",
    "catenoid","hilbert","dodecahedron","lorenz","chladni","voronoi","zeno",
    "borromean","brachistochrone","galtonboard","clothoid","peaucellier",
    "harmonickiss","gyroid","enneaper","boy","seifert","villarceau","unduloid",
    "tesseract","rule30","sunflowerdial","costa","moebius","klein","kuen","catalan","clebsch",
    "menger","apollonian","melencolia","tribar","fourier","cissoid","quadratrix","archispiral",
    "nephroid","folium","rhodonea","versiera","elliptic","mandelbrot","viviani","morley"];
const isMath = (id: string) => id.startsWith("nx-struct-") && !id.endsWith("-l") && MATH.some(k => id.includes(k));
const raz = (x: number, z: number) => { const a = Math.atan2(z, x) * 180 / Math.PI; return a < 0 ? a + 360 : a; };

const maths = ents.filter(e => isMath(e.id)).map(e => ({ id: e.id, r: Math.hypot(e.pos[0], e.pos[2]), az: raz(e.pos[0], e.pos[2]) }));
maths.sort((a, b) => a.az - b.az);
console.log(`\nmath-family structs standing: ${maths.length}`);
// density-window center (costa law: widest 20° window holding the most math
// forms), NOT circular mean.
let center = 0, bestCount = -1;
for (let c = 0; c < 360; c += 0.5) {
    const n = maths.filter(m => Math.abs(((m.az - c + 540) % 360) - 180) <= 10).length;
    if (n > bestCount) { bestCount = n; center = c; }
}
console.log(`avenue axis (20° density window, ${bestCount} forms): ${center.toFixed(1)} deg`);
// far procession read: math forms r135-385 (island + procession), az ±10°.
const island = maths.filter(m => m.r >= 135 && m.r <= 385 && Math.abs(((m.az - center + 540) % 360) - 180) <= 10).sort((a, b) => a.r - b.r);
console.log(`\nisland + far procession (r135-385, axis ±10°): ${island.length} members, r-order:`);
for (const m of island) console.log(`  ${m.id.padEnd(28)} r${m.r.toFixed(1).padStart(6)} az${m.az.toFixed(1).padStart(6)}`);

// morley footprint: envelope 4.557x5.430x0.900 SYMMETRIC (D8 x/z centers
// 0.00mm drift); the curb is the long axis (x 4.557), depth 0.900.
const HX = 4.557 / 2, HZ = 0.900 / 2, CX = 0, CZ = 0;
// scan basis yaw: procession azimuth (select pins the FINAL oblique yaw;
// the placer re-runs SAT/NN at the FINAL pose vs a fresh set).
const YAW = center * Math.PI / 180;
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const ctr = (pos: number[]) => [pos[0] + CX * cs + CZ * sn, pos[2] - CX * sn + CZ * cs];
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
function satGap(pos: number[], exclude: string[] = []) {
    const [wcx, wcz] = ctr(pos);
    let worst = 1e9, wid = "";
    for (const e of ents) {
        if (exclude.includes(e.id)) continue;
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
function nn(pos: number[], exclude: string[] = []) {
    let best = 1e9, bid = "";
    for (const e of ents) {
        if (!e.id.startsWith("nx-struct-") || e.id.endsWith("-l")) continue;
        if (exclude.includes(e.id)) continue;
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

// scan the far band r372-400 past viviani (r370, placed struct-207) along
// the procession — the next ON-AXIS slot; the morley is a curb-long folly
// (4.557 x 0.900), on-line continuation keeps the procession reading.
// 10.0m step == the cissoid->...->elliptic->mandelbrot->viviani rhythm
// puts the next on-line step at r380.
const cands: any[] = [];
for (let i = 0; i <= 28; i++) {
    const r = 372 + i;
    for (let da = -10; da <= 10; da += 1) {
        const a = ((center + da) % 360) * Math.PI / 180;
        const pos = [r * Math.cos(a), 0, r * Math.sin(a)];
        const { n, id: nid } = nn(pos);
        if (n < NN_LAW) continue;
        const { g, id: gid } = satGap(pos);
        if (g < LAW) continue;
        const { w, id: wid } = walkClear(pos);
        if (w < 3.0) continue;
        cands.push({ r, az: +((center + da) % 360).toFixed(1), n, nid, g, gid, w, wid, pos });
    }
}
cands.sort((a, b) => b.g - a.g);
console.log(`\nlawful on-axis-continuation candidates (r372-400): ${cands.length} (NN>=8, SAT>=1.4 @basis-yaw, walk>=3)`);
for (const c of cands.slice(0, 10))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  SAT ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
// corridor view (±1.5° of axis = on-axis procession slots), inner-first
// (rhythm: continue the procession from viviani outward in measured steps)
const corridor = cands.filter(c => Math.abs(((c.az - center + 540) % 360) - 180) <= 1.5).sort((a, b) => a.r - b.r);
console.log(`\naxis corridor (±1.5° of ${center.toFixed(1)}): ${corridor.length} lawful, inner-first:`);
for (const c of corridor.slice(0, 8))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  SAT ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
// flank view: candidates OFF-axis >=2.5° (stagger seats), lateral distance
// from the procession line printed for stagger reasoning.
const stagger = cands.filter(c => Math.abs(((c.az - center + 540) % 360) - 180) > 2.5);
const lat = (c: any) => Math.abs(((c.az - center + 540) % 360) - 180) * Math.PI / 180 * c.r;
stagger.sort((a, b) => lat(a) - lat(b)); // struct-179 fix carried: real lateral sort
console.log(`\nstagger/flank seats (off-axis >=2.5°): ${stagger.length}, nearest-lateral first:`);
for (const c of stagger.slice(0, 12))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  lat ${lat(c).toFixed(1)}m  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  SAT ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
if (!cands.length) { console.log("NO LAWFUL SEAT in band — escalate options"); process.exit(3); }
