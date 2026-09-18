// struct219-scan-newtonspheres.ts — SEAT SCAN for nx-struct-newtonspheres v1
// (banked sha f8016bfab73aff2c..., struct-218 committed carry: "placement =
// struct-219 committed carry: fresh census scan (8m NN law, district soft cap
// 6, Math Avenue eligibility; procession continues past sphericon r420), yaw
// law (disc inlay reads from the approach side), terrain preflight over the
// TRUE rotated footprint (10.0m disc — 5pt + center minimum, disc-vs-OBB
// exact geometry per struct-19 law: square-bbox SAT can never pass a 10m disc
// near neighbors), hash-gated plain spawn nx-struct-newtonspheres, comp {}.
// Folly class (probe L4 seals the center) — rim circuit walk owed at
// placement."). bun fetch /geom (nv-loop law: never curl|python3 — 403).
//
// NEWTONSPHERES ENVELOPE (struct218-decode ALL PASS 9/9 + non-vacuous RED,
// re-run this tick): 10.000 x 5.519 x 10.000, origin-centered disc
// ([-5,5]x[0,5.519]x[-5,5]), min y = 0. DAIS_R = 5.0 exact — the footprint
// is a DISC, so SAT is exact disc-vs-OBB (struct-19 law): signed distance
// from candidate center to each neighbor's yawed OBB footprint; gap =
// dist - 5.0; overlap when dist < 5.0. Yaw only rotates the inlay + the
// sphere arrangement (dais is a perfect cylinder) — no SAT yaw-dependence;
// yaw pinned by the READ law in the placer header, not by this scan.
// Chassis: struct217-scan-sphericon.ts (proven), SAT replaced disc-exact.
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
    "nephroid","folium","rhodonea","versiera","elliptic","mandelbrot","viviani","morley","arbelos","lunes","oloid","sphericon"];
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
// far procession read: math forms r135-450 (island + procession), az ±10°.
const island = maths.filter(m => m.r >= 135 && m.r <= 450 && Math.abs(((m.az - center + 540) % 360) - 180) <= 10).sort((a, b) => a.r - b.r);
console.log(`\nisland + far procession (r135-450, axis ±10°): ${island.length} members, r-order tail:`);
for (const m of island.slice(-10)) console.log(`  ${m.id.padEnd(28)} r${m.r.toFixed(1).padStart(6)} az${m.az.toFixed(1).padStart(6)}`);

// newtonspheres footprint: DISC r 5.0 (dais exact, decode D2).
const DISC_R = 5.0;
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
// EXACT disc-vs-OBB (struct-19 law): dist from candidate center to the
// neighbor's yawed OBB footprint in the neighbor's local frame; gap = dist - DISC_R.
function discGap(pos: number[]) {
    let worst = 1e9, wid = "";
    for (const e of ents) {
        const bb = e.bbox;
        if (!bb) continue;
        if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;   // surface films
        if (GROUND.test(e.id)) continue;                          // ground-layer exemption
        const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
        const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
        const ey = e.yaw ?? 0, cy = Math.cos(ey), sy = Math.sin(ey);
        const ecxW = e.pos[0] + ecx * cy + ecz * sy, eczW = e.pos[2] - ecx * sy + ecz * cy;
        // neighbor local axes in world (skill axis convention):
        const ux = [cy, -sy];   // local x -> (cos, -sin)
        const uz = [sy, cy];    // local z -> (sin, cos)
        const dx = pos[0] - ecxW, dz = pos[2] - eczW;
        const du = Math.abs(dx * ux[0] + dz * ux[1]) - hx;
        const dv = Math.abs(dx * uz[0] + dz * uz[1]) - hz;
        const dist = Math.hypot(Math.max(du, 0), Math.max(dv, 0));   // 0 inside the OBB
        const g = dist - DISC_R;
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

// scan the far band r422-448 past sphericon (r420, placed struct-217) along
// the procession — the next ON-LINE step; the rhythm ...->lunes400->
// oloid410->sphericon420 is 10.0m, putting the next on-line step at r430.
const cands: any[] = [];
for (let i = 0; i <= 26; i++) {
    const r = 422 + i;
    for (let da = -10; da <= 10; da += 1) {
        const a = ((center + da) % 360) * Math.PI / 180;
        const pos = [r * Math.cos(a), 0, r * Math.sin(a)];
        const { n, id: nid } = nn(pos);
        if (n < NN_LAW) continue;
        const { g, id: gid } = discGap(pos);
        if (g < LAW) continue;
        const { w, id: wid } = walkClear(pos);
        if (w < 3.0) continue;
        cands.push({ r, az: +((center + da) % 360).toFixed(1), n, nid, g, gid, w, wid, pos });
    }
}
cands.sort((a, b) => b.g - a.g);
console.log(`\nlawful on-axis-continuation candidates (r422-448, disc-vs-OBB EXACT): ${cands.length} (NN>=8, gap>=1.4, walk>=3)`);
for (const c of cands.slice(0, 10))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
// corridor view (±1.5° of axis = on-axis procession slots), inner-first
// (rhythm: continue the procession from sphericon outward in measured steps).
const corridor = cands.filter(c => Math.abs(((c.az - center + 540) % 360) - 180) <= 1.5).sort((a, b) => a.r - b.r);
console.log(`\naxis corridor (±1.5° of ${center.toFixed(1)}): ${corridor.length} lawful, inner-first:`);
for (const c of corridor.slice(0, 8))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
// flank view: candidates OFF-axis >=2.5° (stagger seats), lateral distance
// from the procession line printed for stagger reasoning.
const stagger = cands.filter(c => Math.abs(((c.az - center + 540) % 360) - 180) > 2.5);
const lat = (c: any) => Math.abs(((c.az - center + 540) % 360) - 180) * Math.PI / 180 * c.r;
stagger.sort((a, b) => lat(a) - lat(b)); // struct-179 fix carried: real lateral sort
console.log(`\nstagger/flank seats (off-axis >=2.5°): ${stagger.length}, nearest-lateral first:`);
for (const c of stagger.slice(0, 12))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  lat ${lat(c).toFixed(1)}m  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
if (!cands.length) { console.log("NO LAWFUL SEAT in band — escalate options"); process.exit(3); }
