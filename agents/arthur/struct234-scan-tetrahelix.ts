// struct234-scan-tetrahelix.ts — SEAT SCAN for nx-struct-tetrahelix v2
// (banked sha 87dfb8b6…, struct-233 committed carry: "fresh census scan —
// under-served band/district selection, 8m NN + per-district soft-cap audit,
// hexagon-exact polygon SAT (struct-19 disc law class — never square-bbox),
// oblique-yaw law (struct-104 band), terrain preflight over the TRUE rotated
// hexagon, hash-gated plain spawn nx-struct-tetrahelix, comp {}. Folly class
// — ground circuit walk at placement, no door.")
//
// TARGET GEOMETRY (struct233-probe T8 + decode D2/D7): ground footprint =
// the SIX-sided dais (the tetrahedron's six edges made stone), circumradius
// R2.2, PLINTH_ROT=0 → corners ON the axes; TRUE box x ±2.200 z ±1.905.
// The column's bead reach ≤ dais apothem 1.905 (probe T8 law) — the cage
// NEVER overhangs the dais, so the hexagon IS the true ground footprint
// (no overhang disclosure needed). SAT below is EXACT hexagon-vs-OBB
// (convex polygon SAT, 10 axes, max-gap law) and hexagon-vs-disc
// (point-to-polygon distance) for the dais family.
//
// YAW LAW (procession convention, struct-217/219/224/228/232): world az of
// local az α = α − yaw. Judged-PASS gameplay framing was the render rig's
// +z face (camera local az90). Put local az90 at anti-travel az
// (seat_az+180) + 30deg oblique lean (struct-104 band) -> yaw_deg =
// 90 − (seat_az+210) = −120 − seat_az (mod 360). The tetrahelix is CHIRAL
// (no rotational symmetry — the dais hexagon is 6-fold but the column is
// not), so the yaw protects the judged read exactly.
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

// ---- district audit: struct forms by octant (R11 law: >=8m NN, soft cap 6,
// rotate to under-served district) ----
const raz = (x: number, z: number) => { const a = Math.atan2(z, x) * 180 / Math.PI; return a < 0 ? a + 360 : a; };
const forms = ents.filter(e => e.id.startsWith("nx-struct-") && !e.id.endsWith("-l"));
const octCounts = new Array(8).fill(0) as number[];
for (const f of forms) {
    const r = Math.hypot(f.pos[0], f.pos[2]);
    if (r < 66) continue; // district ring only (core band r33-55 CLOSED, struct law)
    octCounts[Math.floor(raz(f.pos[0], f.pos[2]) / 45)]++;
}
console.log(`\ndistrict octant audit (r66+, struct forms, soft cap 6 per district):`);
const octNames = ["az0-45 (E)", "az45-90 (E-SE)", "az90-135 (SE-S)", "az135-180 (S-SW)", "az180-225 (SW-W)", "az225-270 (W-NW)", "az270-315 (NW-N)", "az315-360 (N-E)"];
for (let i = 0; i < 8; i++) console.log(`  oct${i} ${octNames[i].padEnd(16)} ${octCounts[i]} forms`);
let minOct = 0;
for (let i = 1; i < 8; i++) if (octCounts[i] < octCounts[minOct]) minOct = i;
const azLo = minOct * 45, azHi = azLo + 45;
console.log(`\nunder-served octant: ${octNames[minOct]} (${octCounts[minOct]} forms) -> scan band az${azLo}-${azHi}`);
const band = forms.filter(e => { const az = raz(e.pos[0], e.pos[2]); return Math.hypot(e.pos[0], e.pos[2]) >= 66 && az >= azLo && az <= azHi; });
console.log(`band forms standing: ${band.length} (soft cap 6; + tetrahelix -> ${band.length + 1}${band.length + 1 > 6 ? " EXCEEDS" : ""})`);
for (const b of band) console.log(`  ${b.id.padEnd(28)} r${Math.hypot(b.pos[0], b.pos[2]).toFixed(1).padStart(6)} az${raz(b.pos[0], b.pos[2]).toFixed(1).padStart(6)}`);

// ---- target: TRUE rotated hexagon (R2.2, ROT=0 corners on axes) ----
const R = 2.2, N = 6;
const LOC = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    return [R * Math.cos(a), R * Math.sin(a)] as [number, number];
});
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const LAW = 1.4, NN_LAW = 8.0;
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;

function hexVerts(pos: number[], yaw: number): [number, number][] {
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
    const H = hexVerts(pos, yaw);
    let worst = 1e9, wid = "";
    for (const e of ents) {
        if (GROUND.test(e.id)) continue; // ground-layer exemption
        const discR = DISC_N[e.id];
        if (discR !== undefined) {
            const g = pointPolyDist(e.pos[0], e.pos[2], H) - discR; // exact hexagon-vs-disc
            if (g < worst) { worst = g; wid = e.id; }
            continue;
        }
        const C = obbCorners(e);
        if (!C) continue;
        const g = polyGap(H, C); // exact hexagon-vs-OBB, max-gap law
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

// scan the under-served band, r66-115
const cands: any[] = [];
for (let i = 0; i <= 98; i++) {
    const r = 66 + i * 0.5;
    for (let da = azLo; da <= azHi; da += 0.5) {
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
console.log(`\nlawful candidates az${azLo}-${azHi} r66-115 (hexagon-exact SAT): ${cands.length} (NN>=8, gap>=1.4, walk>=3)`);
cands.sort((a, b) => (a.r - b.r) || (a.az - b.az));
for (const c of cands.slice(0, 14))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);

// constellation preference: near the band's own standing forms at
// conversational distance (18-40m to the nearest 1-2 forms) — a composed
// shelf, not a singleton in an empty field (struct-228/232 precedent).
const consts = cands.filter(c => {
    const nears = band.map(b => Math.hypot(c.pos[0] - b.pos[0], c.pos[2] - b.pos[2])).sort((x, y) => x - y);
    return nears.length === 0 || (nears[0] >= 18 && nears[0] <= 40);
});
consts.sort((a, b) => (a.r - b.r) || (a.az - b.az));
console.log(`\nconstellation seats (18-40m to nearest band form): ${consts.length}, inner-first:`);
for (const c of consts.slice(0, 10))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  NN ${c.n.toFixed(2).padStart(5)} (${c.nid})  gap ${c.g.toFixed(2).padStart(5)} (${c.gid})  walk ${c.w.toFixed(2).padStart(5)}  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);

// fallback view: widest-gap seats band-wide
console.log(`\nband-wide widest-gap (top 5):`);
for (const c of [...cands].sort((a, b) => b.g - a.g).slice(0, 5))
    console.log(`  r${c.r.toFixed(1).padStart(6)} az${c.az.toFixed(1).padStart(6)}  gap ${c.g.toFixed(2)} (${c.gid})  pos (${c.pos[0].toFixed(2)},${c.pos[2].toFixed(2)})`);
if (!cands.length) { console.log("NO LAWFUL SEAT in band — widen or escalate"); process.exit(3); }
