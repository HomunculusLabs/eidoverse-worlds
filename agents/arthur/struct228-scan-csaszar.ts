// struct228-scan-csaszar.ts — SEAT SCAN for nx-struct-csaszar v3
// (banked sha 299e6d7d0c0d9c15…, struct-227 committed carry: "placement =
// struct-228 committed carry: fresh census scan — per struct-226's standing
// recommendation the E quadrant (az135-180) is the under-served district
// (1 form vs az90-135's 20+), seat there with 8m NN + soft-cap audit,
// heptagon TRUE-box SAT (not square-bbox — struct-19 disc law class), yaw
// law (oblique read, procession convention if E-spoke), terrain preflight
// over the TRUE rotated heptagon, hash-gated plain spawn nx-struct-csaszar,
// comp {}. Folly class — no walk owed beyond a ground circuit at placement.")
//
// NAMING HONESTY (recorded, binds this block): struct-226/227's carry called
// az135-180 "the E quadrant" — that is a dialect slip, NOT the law. The LAW
// is the az range 135-180 (math atan2(z,x), +x=E-axis spoke, +z=S side per
// the village's own anchors). By compass this band is the SW/W reach (the
// millrace lives here at az175 r77, city-4: "NW quadrant W shoulder"). This
// scan seats in the az RANGE the carry committed to; no compass claim.
//
// TARGET GEOMETRY (struct227-probe T9 + decode D2/D7): footprint = the
// heptagonal plinth, circumradius R2.75, cage max radial reach 2.169 < apothem
// 2.478−0.25 — cage stays INSIDE the plinth. Local vertex azimuths
// az_i = 270 − i*(360/7) deg (i=0 at 270 = the foot-apex vertex, aimed −z).
// TRUE analytic box 5.36x2.34x5.23 (x[−2.681,2.681] z[−2.750,2.478]) is
// ASYMMETRIC — the square-bbox proxy would false-fail exactly as struct-19's
// disc did; SAT below is EXACT heptagon-vs-OBB (convex polygon SAT, 9 axes)
// and heptagon-vs-disc (point-to-polygon distance) for the dais family.
//
// YAW LAW (procession convention, struct-217/219/224, cross-checked): world
// az of local az α = α − yaw. Judged-PASS gameplay framing was the render
// rig's +z face (camera local az90). Put local az90 at anti-travel az
// (seat_az+180) + 30deg oblique lean -> yaw_deg = 90 − (seat_az+210) =
// −120 − seat_az (mod 360). Control: seat az94 -> 146deg == struct-219's
// recorded newtonspheres yaw exactly. The K7 cage is ASYMMETRIC (no fold to
// preserve) — the yaw protects the judged read, nothing else.
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

// ---- district audit: struct forms by octant (soft cap 6, R11 law) ----
const raz = (x: number, z: number) => { const a = Math.atan2(z, x) * 180 / Math.PI; return a < 0 ? a + 360 : a; };
const forms = ents.filter(e => e.id.startsWith("nx-struct-") && !e.id.endsWith("-l"));
const band = forms.filter(e => { const az = raz(e.pos[0], e.pos[2]); const r = Math.hypot(e.pos[0], e.pos[2]); return r >= 66 && az >= 135 && az <= 185; });
console.log(`\ncommitted band az135-185 r66+: ${band.length} struct forms standing (soft cap 6; + csaszar -> ${band.length + 1})`);
for (const b of band) console.log(`  ${b.id.padEnd(28)} r${Math.hypot(b.pos[0], b.pos[2]).toFixed(1).padStart(6)} az${raz(b.pos[0], b.pos[2]).toFixed(1).padStart(6)}`);

// ---- target: TRUE rotated heptagon ----
const R = 2.75;
const LOC = Array.from({ length: 7 }, (_, i) => {
    const az = (270 - i * 360 / 7) * Math.PI / 180;
    return [R * Math.cos(az), R * Math.sin(az)] as [number, number];
});
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;

function heptVerts(pos: number[], yaw: number): [number, number][] {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    return LOC.map(([lx, lz]) => [pos[0] + lx * cy + lz * sy, pos[2] - lx * sy + lz * cy] as [number, number]);
}
// exact convex polygon SAT: axes = edge normals of both polys; max-gap law.
function polyGap(A: [number, number][], B: [number, number][]): number {
    const axes: [number, number][] = [];
    for (const P of [A, B]) for (let i = 0; i < P.length; i++) {
        const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length];
        const ex = x2 - x1, ey = y2 - y1, L = Math.hypot(ex, ey) || 1;
        axes.push([-ey / L, ex / L]);
    }
    let best = -1e9;
    for (const [ax, ay] of axes) {
        const aMin = Math.min(...A.map(p => p[0] * ax + p[1] * ay)), aMax = Math.max(...A.map(p => p[0] * ax + p[1] * ay));
        const bMin = Math.min(...B.map(p => p[0] * ax + p[1] * ay)), bMax = Math.max(...B.map(p => p[0] * ax + p[1] * ay));
        best = Math.max(best, Math.max(bMin - aMax, aMin - bMax));
    }
    return best;
}
function pointPolyDist(px: number, pz: number, P: [number, number][]): number {
    // 0 if inside (convex, CCW/CW agnostic ray test), else min edge distance
    let inside = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [xi, zi] = P[i], [xj, zj] = P[j];
        if ((zi > pz) !== (zj > pz) && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) inside = !inside;
    }
    if (inside) return 0;
    let d = 1e9;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [xi, zi] = P[i], [xj, zj] = P[j];
        const ex = xj - xi, ez = zj - zi, L2 = ex * ex + ez * ez || 1;
        const t = Math.max(0, Math.min(1, ((px - xi) * ex + (pz - zi) * ez) / L2));
        d = Math.min(d, Math.hypot(px - (xi + t * ex), pz - (zi + t * ez)));
    }
    return d;
}
function obbCorners(e: any): [number, number][] | null {
    const bb = e.bbox;
    if (!bb) return null;
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) return null; // surface films
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0, cy = Math.cos(ey), sy = Math.sin(ey);
    return [[hx, hz], [hx, -hz], [-hx, -hz], [-hx, hz]].map(([lx, lz]) =>
        [e.pos[0] + ecx * cy + lz * sy + lx * cy, e.pos[2] - ecx * sy + lz * cy + lx * (-sy)] as [number, number]);
}
function satWorst(pos: number[], yaw: number) {
    const H = heptVerts(pos, yaw);
    let worst = 1e9, wid = "";
    for (const e of ents) {
        if (GROUND.test(e.id)) continue; // ground-layer exemption
        const discR = DISC_N[e.id];
        if (discR !== undefined) {
            const g = pointPolyDist(e.pos[0], e.pos[2], H) - discR; // exact heptagon-vs-disc
            if (g < worst) { worst = g; wid = e.id; }
            continue;
        }
        const C = obbCorners(e);
        if (!C) continue;
        const g = polyGap(H, C); // exact heptagon-vs-OBB, 9-axis max-gap
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
const yawFor = (azDeg: number) => (((-120 - azDeg) % 360) + 360) % 360 * Math.PI / 180;

// scan the committed band az135-185, r66-115
const cands: any[] = [];
for (let i = 0; i <= 98; i++) {
    const r = 66 + i * 0.5;
    for (let da = 135; da <= 185; da += 0.5) {
        const a = da * Math.PI / 180;
        const pos = [r * Math.cos(a), 0, r * Math.sin(a)];
        const { n, id: nid } = nn(pos);
        if (n < NN_LAW) continue;
        const { g, id: gid } = satWorst(pos, yawFor(da));
        if (g < LAW) continue;
        const { w, id: wid } = walkClear(pos);
        if (w < 3.0) continue;
        cands.push({ r, az: da, n, nid, g, gid, w, wid, pos });
    }
}
console.log(`\nlawful candidates az135-185 r66-115 (heptagon-exact SAT): ${cands.length} (NN>=8, gap>=1.4, walk>=3)`);
cands.sort((a, b) => b.g - a.g);
for (const c of cands.slice(0, 12))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);

// constellation preference: near the standing W-shoulder pair (millrace az175
// r77, screwwell az180 r88) at conversational distance (18-40m to either) —
// the band reads as a composed shelf, not a singleton in an empty field.
const consts = cands.filter(c => {
    const dm = Math.hypot(c.pos[0] + 76.707, c.pos[2] - 6.711);   // millrace head anchor (city-4 tuple)
    const ds = Math.hypot(c.pos[0] - (-88.0), c.pos[2] - 0.0);    // screwwell az180 r88 (approx center)
    return dm >= 18 && dm <= 40 && ds >= 18 && ds <= 40;
});
consts.sort((a, b) => (a.r - b.r) || (a.az - b.az));
console.log(`\nconstellation seats (18-40m to BOTH millrace + screwwell): ${consts.length}, inner-first:`);
for (const c of consts.slice(0, 10))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);

// fallback view: widest-gap seats band-wide
console.log(`\nband-wide widest-gap (top 5):`);
for (const c of cands.slice(0, 5).map(c => ({ ...c, yawDeg: +(((-120 - c.az) % 360 + 360) % 360).toFixed(2) })))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)} yaw ${String(c.yawDeg).padStart(6)}deg  gap ${c.g.toFixed(2)} (${c.gid})  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
if (!cands.length) { console.log("NO LAWFUL SEAT in band — escalate options"); process.exit(3); }
