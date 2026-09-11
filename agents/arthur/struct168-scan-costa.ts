// struct168-scan-costa.ts — SEAT SCAN for nx-struct-costa v2 (banked sha
// 4bd697873ffaabf0, struct-167 committed carry: "Math Avenue band, fresh
// scan, 8m NN"). bun fetch /geom (nv-loop law: never curl|python3 — 403).
// Empirical Math Avenue wedge derived from the standing math-family structs
// themselves (CITY-PLAN-V2: 28 forms "in the 184±20 wedge" — verified
// against live tuples, not assumed); candidates r55-130 in the ±10 band,
// gated 8m NN vs ALL nx-struct-*, SAT 1.4 vs bbox'd solids (Costa footprint
// 3.16x3.16 origin-centered, struct-166 decode law), walking-line clearance
// >= 3m. Best seat by SAT gap, full evidence printed.
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
    "tesseract","rule30","sunflowerdial","costa","moebius","klein"];
const isMath = (id: string) => id.startsWith("nx-struct-") && !id.endsWith("-l") && MATH.some(k => id.includes(k));
const raz = (x: number, z: number) => { const a = Math.atan2(z, x) * 180 / Math.PI; return a < 0 ? a + 360 : a; };

const maths = ents.filter(e => isMath(e.id)).map(e => ({ id: e.id, r: Math.hypot(e.pos[0], e.pos[2]), az: raz(e.pos[0], e.pos[2]) }));
maths.sort((a, b) => a.az - b.az);
console.log(`\nmath-family structs standing: ${maths.length}`);
const azs = maths.map(m => m.az * Math.PI / 180);
// density-window center, NOT circular mean: strays at az 0/30/296/315 drag the
// mean off the true axis (cluster core 88-94); the band law keys the avenue
// axis = center of the widest 20° window holding the most math forms.
let center = 0, bestCount = -1;
for (let c = 0; c < 360; c += 0.5) {
    const n = maths.filter(m => Math.abs(((m.az - c + 540) % 360) - 180) <= 10).length;
    if (n > bestCount) { bestCount = n; center = c; }
}
console.log(`avenue axis (20° density window, ${bestCount} forms): ${center.toFixed(1)} deg | r55-130 band = axis ±10`);
const inBand = (a: number) => { const d = Math.abs(((a - center + 540) % 360) - 180); return d <= 10; };
const rs = maths.filter(m => m.r >= 55 && m.r <= 130);
console.log(`math forms inside r55-130: ${rs.length}${rs.length ? `; az ${rs.map(m => m.az.toFixed(0)).join(",")}` : ""}`);

const HX = 3.16 / 2, HZ = 3.16 / 2, LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
function satGap(pos: number[], yaw: number, exclude: string[] = []) {
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    const ew = HX * Math.abs(cs) + HZ * Math.abs(sn), ed = HX * Math.abs(sn) + HZ * Math.abs(cs);
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
        const g = Math.max(Math.abs(pos[0] - ecxW) - (ew + eww), Math.abs(pos[2] - eczW) - (ed + edd));
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

const cands: any[] = [];
for (let i = 0; i <= 30; i++) {
    const r = 55 + 2.5 * i;
    for (let da = -9; da <= 9; da += 2) {
        const a = ((center + da) % 360) * Math.PI / 180;
        const pos = [r * Math.cos(a), 0, r * Math.sin(a)];
        const { n, id: nid } = nn(pos);
        if (n < NN_LAW) continue;
        const { g, id: gid } = satGap(pos, 0);
        if (g < LAW) continue;
        const { w, id: wid } = walkClear(pos);
        if (w < 3.0) continue;
        cands.push({ r, az: (center + da) % 360, n, nid, g, gid, w, wid, pos });
    }
}
cands.sort((a, b) => b.g - a.g);
console.log(`\nlawful candidates: ${cands.length} (NN>=8, SAT>=1.4, walk>=3)`);
for (const c of cands.slice(0, 8))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  SAT ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)} (${c.wid})  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
// corridor view: candidates within ±4° of axis, outer-first (avenue extends outward)
const corridor = cands.filter(c => Math.abs(((c.az - center + 540) % 360) - 180) <= 4).sort((a, b) => b.r - a.r);
console.log(`\naxis corridor (±4° of ${center.toFixed(1)}): ${corridor.length} lawful, outer-first:`);
for (const c of corridor.slice(0, 8))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  SAT ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
if (!cands.length) { console.log("NO LAWFUL SEAT in band — escalate options"); process.exit(3); }
const b = corridor.length ? corridor[0] : cands[0];
console.log(`\nBEST SEAT: r${b.r.toFixed(1)} az${b.az.toFixed(1)} pos [${b.pos[0].toFixed(6)}, PY, ${b.pos[2].toFixed(6)}] yaw 0`);
console.log(`  NN ${b.n.toFixed(2)} vs ${b.nid} | SAT ${b.g.toFixed(2)} vs ${b.gid} | walk ${b.w.toFixed(2)} vs ${b.wid}`);
