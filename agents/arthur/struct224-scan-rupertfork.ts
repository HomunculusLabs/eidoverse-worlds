// struct224-scan-rupertfork.ts — SEAT SCAN for nx-struct-rupertfork v11
// (banked sha 8013175fb28a0df1…, struct-223 committed carry: "placement =
// struct-224 committed carry: fresh census scan (8m NN law, district soft cap
// 6, Math Avenue eligibility; procession continues past newtonspheres r430),
// yaw law (the gate faces read obliquely per struct-104 …), terrain preflight
// over the TRUE rotated footprint, hash-gated plain spawn nx-struct-rupertfork,
// comp {}. Folly class … — no walk owed; if seated walkable around, a circuit
// walk at placement."). bun fetch /geom (nv-loop law: never curl|python3).
//
// RUPERTFORK v11 ENVELOPE (struct223-decode re-run this tick, ALL PASS 18/18):
// 10.96 x 5.14 x 10.96, ORIGIN-CENTERED symmetric square footprint (local
// bbox x[-5.48,5.48] z[-5.48,5.48] — probe S6: "the plug sits wholly within:
// symmetric fins-dominated bbox (seat with the TRUE bbox)"). The target is a
// rotated SQUARE OBB — exact OBB-vs-OBB SAT (4 axes, max-gap law), no
// disc-exact needed for the TARGET. Disc NEIGHBORS (newtonspheres dais r5.0)
// are conservatively proxied by their square bbox — dead-corner inflation
// ~2m/side worst case, acceptable here (see yaw law below).
//
// YAW LAW, re-derived from source this tick (carry-note arithmetic corrected,
// named honestly): root is IDENTITY (struct-188), bore NN = norm(1,0,1) =
// local az45.0 at yaw 0, +mouth (nose/plug end) facing az45 — so "the span
// runs az4/184 at yaw 0" in the struct-223 carry note does not cohere with
// the decoded frame (45.0 vs 4). The PRINCIPLE stands (gate faces oblique per
// struct-104; near mouth toward the approach): walker approaches outbound
// az94, anti-travel az274; the documented procession convention (struct-219
// newtonspheres yaw 146deg, +Z at anti-travel+30deg east) gives near-mouth az
// 274+30 = 304 => yaw_deg = 304-45 = 259 => YAW = 4.520405 rad. Obliquity
// check: mouth-to-travel angle = 50deg (oblique band, struct-104 ~40deg
// class); flank normals az34/214 (broadside 60deg off travel).
//
// ON-LINE 10m step INFEASIBLE (arithmetic, pre-scan): center distance needed
// >= 5.48 (half-span) + 5.0 (newtonspheres dais r) + 1.4 (law) = 11.88m, but
// the procession rhythm is 10.0m — the scan searches r435-460 on-axis +
// lateral stagger for the lawful minimum-break seat.
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
    "nephroid","folium","rhodonea","versiera","elliptic","mandelbrot","viviani","morley","arbelos","lunes","oloid","sphericon","newtonspheres","rupert"];
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
const island = maths.filter(m => m.r >= 135 && m.r <= 470 && Math.abs(((m.az - center + 540) % 360) - 180) <= 10).sort((a, b) => a.r - b.r);
console.log(`\nisland + far procession (r135-470, axis ±10°): ${island.length} members, r-order tail:`);
for (const m of island.slice(-8)) console.log(`  ${m.id.padEnd(28)} r${m.r.toFixed(1).padStart(6)} az${m.az.toFixed(1).padStart(6)}`);
const farProc = island.filter(m => m.r >= 380);
console.log(`far-procession district segment (r>=380): ${farProc.length} standing (soft cap 6 incl. rupertfork -> ${farProc.length + 1})`);

// rupertfork v11 footprint: rotated SQUARE OBB half 5.48 (decode D8/probe S6).
const HALF = 5.48;
// YAW LAW (re-derived, rotation direction CORRECTED this tick): skill map is
// local az α -> world az (α − yaw) (verified against struct-219: yaw 146° put
// local +Z az90 at world az304 = 90−146 ✓). Mouth is LOCAL az45 (bore NN) ->
// world mouth az = 45 − yaw_deg. Convention (struct-217/219): near mouth at
// anti-travel az274 + 30° east lean = az304 -> yaw_deg = 45 − 304 = −259 ≡ 101.
// YAW = 101° = 1.762783 rad. Resulting reads: near mouth az304 (30° oblique to
// the az274 viewer — struct-104 oblique band), far mouth az124 (30° off the
// outbound az94 lookback), wall faces az259/349 (oblique diamonds both ways).
// The earlier in-tick draft (yaw 259°, from world = local + yaw) was WRONG and
// is named here honestly; the SAT numbers below are re-run at the corrected yaw.
const YAW = 1.762783;
// DISC NEIGHBORS (struct-19 law, both directions): the procession family are
// ~10m DAIS forms — newtonspheres dais r5.0 exact (struct218-decode D2). A
// square-bbox proxy on a round neighbor FALSE-PASSES on-line seats (r442:
// proxy gap 1.52 vs disc-exact 0.87). Exact square-vs-disc for the known disc:
// signed distance from disc center to the candidate square OBB, minus r.
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
// exact OBB-vs-OBB SAT (skill axis convention: local x -> (cos,-sin), z -> (sin,cos));
// gap = max over the 4 separating axes of (centerDist - projR_A - projR_B).
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
        let g = -1e9;
        for (const a of [ax, az, bx, bz]) {
            const proj = Math.abs(dx * a[0] + dz * a[1]);
            const rA = Math.abs(ax[0] * a[0] + ax[1] * a[1]) * HALF + Math.abs(az[0] * a[0] + az[1] * a[1]) * HALF;
            const rB = Math.abs(bx[0] * a[0] + bx[1] * a[1]) * hx + Math.abs(bz[0] * a[0] + bz[1] * a[1]) * hz;
            g = Math.max(g, Math.hypot(dx, dz) - 0 - (proj >= 0 ? proj : proj) - 0); // placeholder; replaced below
        }
        // proper SAT: for each axis, gap_axis = |d·a| - rA - rB (negative = overlap on that axis);
        // boxes separate iff ANY axis gap > 0; report the MAX axis gap.
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

// scan the far band r435-460 past newtonspheres (r430, placed struct-219)
// along the procession. On-line 10m step is INFEASIBLE (11.88m needed) —
// lawful minimum-break + lateral stagger both searched.
const cands: any[] = [];
for (let i = 0; i <= 50; i++) {
    const r = 435 + i * 0.5;
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
console.log(`\nlawful candidates (r435-460, OBB-SAT exact): ${cands.length} (NN>=8, gap>=1.4, walk>=3)`);
for (const c of cands.slice(0, 10))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
const corridorBearing = farProc.length >= 2
    ? farProc.slice(-2).reduce((s, m) => s + m.az, 0) / 2   // tail bearing (94.0 — the true line)
    : center;
console.log(`\nprocession tail bearing (on-line anchor): ${corridorBearing.toFixed(1)} deg (density center ${center.toFixed(1)} is NOT the line — v-tail members all az94.0)`);
const corridor = cands.filter(c => Math.abs(((c.az - corridorBearing + 540) % 360) - 180) <= 1.5).sort((a, b) => a.r - b.r);
console.log(`\naxis corridor (±1.5° of ${center.toFixed(1)}): ${corridor.length} lawful, inner-first:`);
for (const c of corridor.slice(0, 8))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
const stagger = cands.filter(c => Math.abs(((c.az - center + 540) % 360) - 180) > 2.5);
const lat = (c: any) => Math.abs(((c.az - center + 540) % 360) - 180) * Math.PI / 180 * c.r;
stagger.sort((a, b) => lat(a) - lat(b));
console.log(`\nstagger/flank seats (off-axis >=2.5°): ${stagger.length}, nearest-lateral first:`);
for (const c of stagger.slice(0, 12))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  lat ${lat(c).toFixed(1)}m  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
if (!cands.length) { console.log("NO LAWFUL SEAT in band — escalate options"); process.exit(3); }
