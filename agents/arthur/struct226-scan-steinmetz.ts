// struct226-scan-steinmetz.ts — SEAT SCAN for nx-struct-steinmetz v1
// (banked sha c3d56ac8f8eceacd…, struct-225 committed carry: "placement =
// struct-226 committed carry: fresh census scan (8m NN law, district soft cap
// 6, Math Avenue az94 on-line continuation past rupertfork r445 — rhythm law:
// procession steps 15m from rupertfork per struct-224's widened rhythm), YAW
// LAW (construction face reads obliquely per struct-104; the 5.8m square runs
// its face 30deg off the anti-travel sightline, east lean, procession
// convention), terrain preflight over the TRUE rotated footprint, hash-gated
// plain spawn nx-struct-steinmetz, comp {}. Folly class — no walk owed;
// circuit walk at placement if seated walkable."). bun fetch /geom.
//
// STEINMETZ v1 ENVELOPE (struct225-decode re-run this tick, ALL PASS 8/8):
// 5.8 x 4.578 x 5.8, ORIGIN-CENTERED symmetric square footprint (decode D7:
// min [-2.9,0,-2.9] max [2.9,4.578,2.9]). Target = rotated SQUARE OBB —
// 4-axis OBB-SAT max-gap law; disc neighbors (dais family r5.0) exact.
//
// YAW LAW (procession convention, struct-217/219/224): local az α -> world az
// (α − yaw). The square courses + square plinth face local az0/90/180/270;
// put local az90 (a construction face, the joint-meridian face) at world az304
// = anti-travel az274 + 30° east lean -> yaw_deg = 90 − 304 = −214 ≡ 146 ->
// YAW = 2.548181 rad (the struct-219 newtonspheres yaw — family precedent;
// 4-fold symmetric so 146 ≡ 56 mod 90, convention-literal kept).
//
// SEAT (analytic pre-scan): rupertfork r445 + 15m rhythm -> r460 az94 ON-LINE
// EXACT. NN 15.00 to rupertfork (law 8). Projected SAT along the az94 line:
// rupertfork half-projection 6.71 + steinmetz 3.96 = 10.67 < 15 -> line-axis
// gap ~4.3; full 4-axis exact below. Soft-cap note: far-procession r>=380
// segment counts 7 standing (incl. rupertfork) -> steinmetz makes 8 vs the
// R11 SOFT cap 6 — disclosed, struct-224 precedent (7th placed under the same
// carry shape); the CITY-PLAN "one coherent procession" composition law +
// the widened 15m rhythm carry the decision; hard laws (NN 8, SAT 1.4, walk
// 3.0) all enforced below.
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
    "harmonickaiss","gyroid","enneaper","boy","seifert","villarceau","unduloid",
    "tesseract","rule30","sunflowerdial","costa","moebius","klein","kuen","catalan","clebsch",
    "menger","apollonian","melencolia","tribar","fourier","cissoid","quadratrix","archispiral",
    "nephroid","folium","rhodonea","versiera","elliptic","mandelbrot","viviani","morley","arbelos","lunes","oloid","sphericon","newtonspheres","rupert","steinmetz"];
const isMath = (id: string) => id.startsWith("nx-struct-") && !id.endsWith("-l") && MATH.some(k => id.includes(k));
const raz = (x: number, z: number) => { const a = Math.atan2(z, x) * 180 / Math.PI; return a < 0 ? a + 360 : a; };

const maths = ents.filter(e => isMath(e.id)).map(e => ({ id: e.id, r: Math.hypot(e.pos[0], e.pos[2]), az: raz(e.pos[0], e.pos[2]) }));
maths.sort((a, b) => a.az - b.az);
console.log(`\nmath-family structs standing: ${maths.length}`);
let center = 0, bestCount = -1;
for (let c = 0; c < 360; c += 0.5) {
    const n = maths.filter(m => Math.abs(((m.az - c + 540) % 360) - 180) <= 10).length;
    if (n > bestCount) { bestCount = n; center = c; }
}
console.log(`avenue axis (20° density window, ${bestCount} forms): ${center.toFixed(1)} deg`);
const island = maths.filter(m => m.r >= 135 && m.r <= 480 && Math.abs(((m.az - center + 540) % 360) - 180) <= 10).sort((a, b) => a.r - b.r);
console.log(`\nisland + far procession (r135-480, axis ±10°): ${island.length} members, r-order tail:`);
for (const m of island.slice(-8)) console.log(`  ${m.id.padEnd(28)} r${m.r.toFixed(1).padStart(6)} az${m.az.toFixed(1).padStart(6)}`);
const farProc = island.filter(m => m.r >= 380);
console.log(`far-procession district segment (r>=380): ${farProc.length} standing (soft cap 6; + steinmetz -> ${farProc.length + 1} — SOFT-CAP EXCEEDANCE disclosed, struct-224 precedent, procession composition law carries)`);

// steinmetz v1 footprint: rotated SQUARE OBB half 2.9 (decode D7).
const HALF = 2.9;
const YAW = 2.548181; // 146 deg — procession convention (face at anti-travel+30 east)
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
// exact OBB-vs-OBB SAT (skill axis convention: local x -> (cos,-sin), z -> (sin,cos));
// gap = max over the 4 separating axes of (axisDist - projR_A - projR_B).
function obbGap(pos: number[], yaw: number) {
    let worst = 1e9, wid = "";
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const ax = [cy, -sy], az = [sy, cy]; // target axes in world
    for (const e of ents) {
        const bb = e.bbox;
        if (!bb) continue;
        if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;   // surface films
        if (GROUND.test(e.id)) continue;                          // ground-layer exemption
        const discR = DISC_N[e.id];
        if (discR !== undefined) {
            // exact square-vs-disc: dist from disc center to the candidate square
            const dx = pos[0] - e.pos[0], dz = pos[2] - e.pos[2];
            const du = Math.abs(dx * ax[0] + dz * ax[1]) - HALF;
            const dv = Math.abs(dx * az[0] + dz * az[1]) - HALF;
            const dist = Math.hypot(Math.max(du, 0), Math.max(dv, 0));
            const g = dist - discR;
            if (g < worst) { worst = g; wid = e.id; }
            continue;
        }
        const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
        const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
        const ey = e.yaw ?? 0, ecy = Math.cos(ey), esy = Math.sin(ey);
        const ecxW = e.pos[0] + ecx * ecy + ecz * esy, eczW = e.pos[2] - ecx * esy + ecz * ecy;
        const bx = [ecy, -esy], bz = [esy, ecy]; // neighbor axes in world
        const dx = pos[0] - ecxW, dz = pos[2] - eczW;
        let best = -1e9;
        for (const a of [ax, az, bx, bz]) {
            const dist = Math.abs(dx * a[0] + dz * a[1]);
            const rA = Math.abs(ax[0] * a[0] + ax[1] * a[1]) * HALF + Math.abs(az[0] * a[0] + az[1] * a[1]) * HALF;
            const rB = Math.abs(bx[0] * a[0] + bx[1] * a[1]) * hx + Math.abs(bz[0] * a[0] + bz[1] * a[1]) * hz;
            best = Math.max(best, dist - rA - rB);
        }
        if (best < worst) { worst = best; wid = e.id; }
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

// scan the band r450-475 past rupertfork (r445, placed struct-224) along the
// procession. Rhythm law: 15m step from rupertfork -> r460 on-line preferred.
const cands: any[] = [];
for (let i = 0; i <= 50; i++) {
    const r = 450 + i * 0.5;
    for (let da = -10; da <= 10; da += 0.5) {
        const a = ((center + da) % 360) * Math.PI / 180;
        const pos = [r * Math.cos(a), 0, r * Math.sin(a)];
        const { n, id: nid } = nn(pos);
        if (n < NN_LAW) continue;
        const { g, id: gid } = obbGap(pos, YAW);
        if (g < LAW) continue;
        const { w, id: wid } = walkClear(pos);
        if (w < 3.0) continue;
        cands.push({ r, az: +((center + da) % 360).toFixed(1), n, nid, g, gid, w, wid, pos });
    }
}
cands.sort((a, b) => b.g - a.g);
console.log(`\nlawful candidates (r450-475, OBB-SAT exact): ${cands.length} (NN>=8, gap>=1.4, walk>=3)`);
for (const c of cands.slice(0, 10))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
const corridorBearing = farProc.length >= 2
    ? farProc.slice(-2).reduce((s, m) => s + m.az, 0) / 2   // tail bearing (94.0 — the true line)
    : center;
console.log(`\nprocession tail bearing (on-line anchor): ${corridorBearing.toFixed(1)} deg`);
const corridor = cands.filter(c => Math.abs(((c.az - corridorBearing + 540) % 360) - 180) <= 1.5).sort((a, b) => a.r - b.r);
console.log(`\naxis corridor (±1.5° of ${corridorBearing.toFixed(1)}): ${corridor.length} lawful, inner-first:`);
for (const c of corridor.slice(0, 8))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
const stagger = cands.filter(c => Math.abs(((c.az - center + 540) % 360) - 180) > 2.5);
const lat = (c: any) => Math.abs(((c.az - center + 540) % 360) - 180) * Math.PI / 180 * c.r;
stagger.sort((a, b) => lat(a) - lat(b));
console.log(`\nstagger/flank seats (off-axis >=2.5°): ${stagger.length}, nearest-lateral first:`);
for (const c of stagger.slice(0, 12))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  lat ${lat(c).toFixed(1)}m  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
if (!cands.length) { console.log("NO LAWFUL SEAT in band — escalate options"); process.exit(3); }
