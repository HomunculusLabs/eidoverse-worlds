// struct183-scan-melencolia.ts — SEAT SCAN for nx-struct-melencolia v3
// (banked sha fb06138e4009a883..., struct-182 committed carry: "placement =
// struct-183 committed carry: fresh census scan (8m NN, district caps, Math
// Avenue eligibility per CITY-PLAN-V2 — r55-130 PROVEN SATURATED; terminal
// island r140-170 now 7 members within the 5-9 cap, avenue procession
// continues past them), oblique-yaw law (face +Z must sit 30-40deg off the
// walk, struct-104), terrain preflight, hash-gated plain spawn
// nx-struct-melencolia, comp {}").
// bun fetch /geom (nv-loop law: never curl|python3 — 403).
//
// MELENCOLIA ENVELOPE (struct182-decode re-run ALL PASS this tick, D5):
// 3.20 x 3.75 x 0.95 — x = WIDTH (face normal +Z), z = DEPTH 0.95,
// origin-centered (CX=CZ=0). At yaw 0 the face reads face-on down the +Z
// avenue walk (struct-104 class); oblique-read law => face normal 30-40deg
// off the approach normal. W-FLANK seat (walker on the -Z side, +Z offset
// from the procession): yaw 145deg = 2.530727415391778 rad puts the face
// normal (sin145, cos145) = (+0.574, -0.819) at 35.0deg off (0,-1) — face
// toward the approaching walker, oblique to the sightline. SAT footprint at
// FINAL pose yaw 145deg.
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
    "harmonickiss","gyroid","enneper","boy","seifert","villarceau","unduloid",
    "tesseract","rule30","sunflowerdial","costa","moebius","klein","kuen","catalan","clebsch",
    "menger","apollonian"];
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
// terminal island read: math forms r135-260 (island r140-170 + the far
// procession gyroid/enneper), az within the ±10° window.
const island = maths.filter(m => m.r >= 135 && m.r <= 260 && Math.abs(((m.az - center + 540) % 360) - 180) <= 10).sort((a, b) => a.r - b.r);
console.log(`\nterminal island + far procession (r135-260, axis ±10°): ${island.length} members, r-order:`);
for (const m of island) console.log(`  ${m.id.padEnd(28)} r${m.r.toFixed(1).padStart(6)} az${m.az.toFixed(1).padStart(6)}`);

// melencolia footprint: envelope 3.20x3.75x0.95 SYMMETRIC (CX=CZ=0);
// HX = width/2, HZ = depth/2
const HX = 3.200 / 2, HZ = 0.950 / 2, CX = 0, CZ = 0;
const YAW = 145 * Math.PI / 180; // struct-104 oblique-read law: face normal 35deg off -Z approach normal, face toward walker
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

// scan the terminal island band r138-180 at fine azimuth resolution within
// the axis ±10° law (stagger + corridor both legal there; past peaucellier
// the zeno gap r179.9 is the outer NN bound).
const cands: any[] = [];
for (let i = 0; i <= 42; i++) {
    const r = 138 + i;
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
console.log(`\nlawful island candidates: ${cands.length} (NN>=8, SAT>=1.4 @yaw145, walk>=3)`);
for (const c of cands.slice(0, 10))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  SAT ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
// corridor view (±1.5° of axis = on-axis procession slots), outer-first
const corridor = cands.filter(c => Math.abs(((c.az - center + 540) % 360) - 180) <= 1.5).sort((a, b) => b.r - a.r);
console.log(`\naxis corridor (±1.5° of ${center.toFixed(1)}): ${corridor.length} lawful, outer-first:`);
for (const c of corridor.slice(0, 8))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  SAT ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
// stagger view: candidates OFF-axis by >=2.5° (flank seats), lateral distance
// from the procession line printed for stagger reasoning.
const stagger = cands.filter(c => Math.abs(((c.az - center + 540) % 360) - 180) > 2.5);
const lat = (c: any) => Math.abs(((c.az - center + 540) % 360) - 180) * Math.PI / 180 * c.r;
stagger.sort((a, b) => lat(a) - lat(b)); // struct-179 fix carried: real lateral sort
console.log(`\nstagger/flank seats (off-axis >=2.5°): ${stagger.length}, nearest-lateral first:`);
for (const c of stagger.slice(0, 12))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  lat ${lat(c).toFixed(1)}m  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  SAT ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
if (!cands.length) { console.log("NO LAWFUL SEAT in island band — escalate options"); process.exit(3); }
