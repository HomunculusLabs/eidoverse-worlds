// next-place-struct274.ts — FRESH SPAWN: nx-struct-tetrakis v1 (THE
// TETRAKIS HEXAHEDRON, Six Doors Read Through the Looking Glass, the
// toct's polar-reciprocal dual) at the N-E-band sixth form, az334.0
// r104.0 margin+constellation seat (struct-273 committed carry). Bank
// pin: sha f2e8a62a… deterministic x3 (struct-273 tick) + on-disk
// re-verified THIS tick (sha256 match, byte-identical, no rebuild).
//
// SEAT (struct274-scan-tetrakis, fresh 407-entity census, SELFTEST
// RED->GREEN PASS: exact-SAT fired at nx-craft-statuary-0026's own
// center reported -9.370, guaranteed overlap refused; coverage exact 1
// / radial 306 / disc 2 / exempt 4): octant audit prints the R11 map
// (E oct0 6 AT CAP; oct2 SE-S 46 — the mosaic-district band; SW oct4
// 6 AT CAP after struct-272; every other octant 5). COMMITTED BAND
// (struct-273 directive, per struct-272's closing law): N-E az315-360
// beside parent toct (5 standing — vesicawindow az357.5 r70.1, rt
// az359.5 r87.5, toct az348.5 r66, trcubo az349 r104.5, dtria az327.5
// r89.5; + tetrakis -> 6, soft cap 6, NO exceedance — at cap,
// disclosed). Selected: az334.0 r104.0 (93.474581, -45.590599) —
// innermost margin+constellation seat, gap 2.53 vs nx-wild-cairn-0047.
// NN 18.16 to nx-struct-dtria (law 8; composed with dtria@18.2 +
// trcubo@27.2 — the N-E Catalan kin shelf: the dual standing beside
// the deltoidal icositetrahedron and the trcubo across the same NE
// walk, the cube's door-frame surfacing through the cut).
//
// YAW LAW (procession convention, struct-217..273): local az α -> world
// az (α - yaw). Judged reading face local az90 at anti-travel az154
// + 30deg east lean (struct-104 oblique band) -> yaw_deg = -120 -
// 334.0 = -454.0 -> 266.00deg -> YAW = 4.642576 rad. DISCLOSED: the
// tetrakis is a 3-FOLD hex-rank point-down seat (probe T7: foot hex
// point on-axis, one upper door-ghost apex dead-on az 0, sq triads
// 60-deg interleaved) and the oblique-lean band puts the yaw 266 mod
// 120 = 26deg off the 120deg lattice — the exact-mod bonus does NOT
// apply; the panelled-solid family reads at any azimuth (trico/SSD/
// gsd/gdodec/gicosa/dtria/deltoid/triakis precedent) and the judged
// framing is preserved.
//
// Terrain (struct274-terrain-tetrakis.ts, THIS tick): 49pt over the
// TRUE rotated 24-gon (center + 24 verts + 24 edge-mids), spread
// 8.4mm, PY = lowest = -0.019616 (the dais-sole-at-grade build
// absorbs the spread).
//
// TARGET = TRUE rotated 24-GON (circumradius 3.45, N24, CORNERS-ON-AXES
// per probe ROT=0; decode D2 TRUE box +/-3.450; apothem 3.420 >=
// reach+rod 3.313 — apothem-first, struct-247): exact 24-gon-vs-OBB
// polygon SAT (max-gap law) + 24-gon-vs-disc point distance for the
// dais family (struct-19 exact-geometry law). Build envelope
// 6.90x8.67x6.90 — the solid NEVER overhangs the dais (probe T8
// immersion: fully inside, worst poke -0.012), so the 24-gon IS the
// true ground footprint. Chassis: next-place-struct272.ts (proven
// fresh-spawn, incl. the struct-260 placer RED-control fix; RED
// corner list copied verbatim + inspected pre-run — struct-266/268/
// 270 copy-error class).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [93.474581, -0.019616, -45.590599] as const; // PY from terrain preflight this tick
const YAW = 266.0 * Math.PI / 180; // 266.00 deg — procession convention (reading face at anti-travel+30 east)
const m = {
    id: "nx-struct-tetrakis",
    file: "village_tetrakis3.glb",
    sha: "f2e8a62adf84c7c854f9be64948b833ae611dfe6b13d83ae15b65dd09265434a", // struct-273 v1 bank pin; on-disk re-verified THIS tick
    pr: 3.45, // decode D2: 24-gon dais circumradius; build envelope == dais — no overhang
    comp: {} as Record<string, never>, // 7 beads emissive-in-GLB (glow_tetrakis_7 KEEP) — no companion verb
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number, eps = 1e-4) => Math.abs(a - b) < eps;
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`${m.id} local hash drift ${h}`);
const wantLib = `store/${m.sha.slice(0, 16)}.glb`;
const before = await geom();
// idempotent form: already seated v1 at exact tuple -> zero verbs
if (before[m.id] && before[m.id].lib === wantLib && near(before[m.id].pos[0], POS[0]) && near(before[m.id].pos[1], POS[1], 1e-4) && near(before[m.id].pos[2], POS[2]) && near(before[m.id].yaw ?? 0, YAW, 1e-6)) {
    console.log(`ALREADY_SEATED ${m.id} ${wantLib} — no verbs`);
    process.exit(0);
}
// fresh-spawn contract: entity ABSENT (banked, never placed)
if (before[m.id]) die(`${m.id} present as ${before[m.id].lib} — this placer is the fresh-spawn chassis, reseat chassis required instead`);
console.log(`fresh census ${Object.keys(before).length}: ${m.id} ABSENT (fresh-spawn contract)`);
// ---- 24-gon-exact SAT + NN preflight at the FINAL pose vs FRESH live set ----
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const LAW = 1.4, NN_LAW = 8.0;
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const LOC = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2; // TRUE corners-on-axes phase (ROT=0 class)
    return [m.pr * Math.cos(a), m.pr * Math.sin(a)] as [number, number];
});
const H: [number, number][] = LOC.map(([lx, lz]) => [POS[0] + lx * cy + lz * sy, POS[2] - lx * sy + lz * cy] as [number, number]);
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
let worstGap = Infinity, worstId = "", nn = Infinity, nnId = "";
const collisions: string[] = [];
let nExact = 0, nRadial = 0, nDisc = 0, nExempt = 0;
for (const e of Object.values(before)) {
    if (/^nx-struct-/.test(e.id) && !/-l$/.test(e.id)) {
        const dd = Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]);
        if (dd < nn) { nn = dd; nnId = e.id; }
        if (dd < NN_LAW) collisions.push(`NN ${e.id}(${dd.toFixed(2)})`);
    }
    const bb = e.bbox;
    if (!bb) continue;
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;
    if (GROUND.test(e.id)) { nExempt++; continue; }
    let g: number;
    const discR = DISC_N[e.id];
    if (discR !== undefined) {
        g = pointPolyDist(e.pos[0], e.pos[2], H) - discR; // exact 24-gon-vs-disc (struct-19 law)
        nDisc++;
    } else {
        const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
        const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
        const cd = Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]);
        const rb = Math.hypot(ecx, ecz) + Math.hypot(hx, hz);
        if (cd - m.pr - rb >= LAW) { if (cd - m.pr - rb < worstGap) { worstGap = cd - m.pr - rb; worstId = `${e.id}(radial)`; } nRadial++; continue; } // conservative skip
        const ey = e.yaw ?? 0, ecy = Math.cos(ey), esy = Math.sin(ey);
        const C: [number, number][] = [[hx, hz], [hx, -hz], [-hx, -hz], [-hx, hz]].map(([lx, lz]) =>
            [e.pos[0] + ecx * ecy + lz * esy + lx * ecy, e.pos[2] - ecx * esy + lz * ecy - lx * esy] as [number, number]);
        g = polyGap(H, C); // exact 24-gon-vs-OBB, max-gap law
        nExact++;
    }
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`SAT ${e.id}(${g.toFixed(2)})`);
}
// ---- struct-240 NaN LAW, placer form (struct-260 fix): the bare
// nExact===0 die false-fires at a genuinely isolated seat (every
// neighbor legally radial-skipped). The STRONGER check is the scan's
// RED control run in-placer: fire the exact path at a standing solid's
// own center (guaranteed overlap, precondition |ecx|<=hx && |ecz|<=hz)
// and demand a sub-law gap; NaN evaluations would still increment
// nExact, so only the RED control actually proves the path refuses.
// Gate = RED PASS + non-vacuous total coverage (exact+radial+disc>0). ----
{
    let solid: any = null;
    for (const e of Object.values(before)) {
        const bb = e.bbox;
        if (!bb || (bb.max && (bb.max[1] - bb.min[1]) <= 0.5)) continue;
        if (GROUND.test(e.id) || DISC_N[e.id] !== undefined) continue;
        if (Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]) < 40) continue; // RED control may not move the live pose — pick a distant solid
        if (Math.hypot(e.pos[0], e.pos[2]) < 30) continue;
        // guaranteed-overlap precondition: the polygon is centered at the
        // entity ORIGIN, so overlap is guaranteed only if the origin lies
        // inside the (possibly bbox-center-offset) OBB — local test
        // |ecx| <= hx && |ecz| <= hz (inverse transform at dx=dz=0).
        const ebb = e.bbox, eecx = ebb.center ? ebb.center[0] : 0, eecz = ebb.center ? ebb.center[2] : 0;
        const ehx = ebb.size[0] / 2, ehz = ebb.size[2] / 2;
        if (Math.abs(eecx) > ehx || Math.abs(eecz) > ehz) continue;
        solid = e; break;
    }
    if (!solid) die(`${m.id} preflight vacuous: no distant standing solid for the RED control`);
    const scy = Math.cos(solid.yaw ?? 0), ssy = Math.sin(solid.yaw ?? 0);
    const RH: [number, number][] = LOC.map(([lx, lz]) => [solid.pos[0] + lx * scy + lz * ssy, solid.pos[2] - lx * ssy + lz * scy] as [number, number]);
    const rbb = solid.bbox, recx = rbb.center ? rbb.center[0] : 0, recz = rbb.center ? rbb.center[2] : 0;
    const rhx = rbb.size[0] / 2, rhz = rbb.size[2] / 2;
    const RC: [number, number][] = [[rhx, rhz], [rhx, -rhz], [-rhx, -rhz], [-rhx, rhz]].map(([lx, lz]) =>
        [solid.pos[0] + recx * scy + lz * ssy + lx * scy, solid.pos[2] - recx * ssy + lz * scy - lx * ssy] as [number, number]);
    const rg = polyGap(RH, RC);
    console.log(`SELFTEST RED->GREEN: exact-SAT at ${solid.id}'s own center -> gap ${rg.toFixed(3)}`);
    if (!(rg < LAW)) die(`${m.id} preflight RED control FAIL: exact-SAT path did not refuse a guaranteed overlap (gap ${rg}) — NaN/vacuous class`);
    console.log(`SELFTEST PASS: the exact path refuses a known-overlap seat`);
}
if (collisions.length) die(`${m.id} spawn blocked: ${collisions.join(", ")}`);
if (nExact + nRadial + nDisc === 0) die(`${m.id} preflight vacuous: zero coverage of any class (exact ${nExact} radial ${nRadial} disc ${nDisc})`);
console.log(`NN floor: ${nnId} ${nn.toFixed(2)} (law ${NN_LAW})`);
console.log(`24-gon-exact SAT worst: ${worstId} ${worstGap.toFixed(2)} — fresh ${Object.keys(before).length}-entity set [exact ${nExact} radial ${nRadial} disc ${nDisc} exempt ${nExempt}]`);
// ---- upload (content-addressed; shared budget, 429 backoff) ----
let lib = "";
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("as", "model");
    u.searchParams.set("name", `commons-next ${m.id} struct-274 tetrakis v1`);
    u.searchParams.set("by", cfg.id);
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = ((await r.json()) as any).path; break; }
        if (r.status === 429 && a < 5) { console.log(`429 upload, backoff ${a * 30}s`); await sleep(a * 30000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== wantLib) die(`upload path ${lib}`);
    console.log(`upload OK ${lib}`);
}
// ---- spawn over one WS (paced) ----
const verbs: Array<[string, any]> = [
    ["spawn", { id: m.id, lib: wantLib, pos: [POS[0], POS[1], POS[2]], yaw: YAW, scale: 1, comp: m.comp }],
];
await new Promise<void>((resolve, reject) => {
    const { WebSocket } = require("ws") as typeof import("ws");
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        console.log(`verb: ${verb}`);
    }, 1200);
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct274-place", avatar: cfg.avatar, token: cfg.joinToken })));
    ws.on("message", (raw: any) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "snapshot" && !joined) { joined = true; console.log(`joined ${WORLD} (${Object.keys(msg.entities ?? {}).length} entities)`); }
    });
    ws.on("error", reject);
    const closer = setInterval(() => {
        if (i >= verbs.length) { clearInterval(paced); clearInterval(closer); clearTimeout(timer); ws.close(); resolve(); }
    }, 500);
});
await sleep(1500);
// ---- post-place verify at the FINAL pose ----
const after = await geom();
const now = after[m.id] ?? die(`${m.id} absent after verbs`);
if (!(near(now.pos[0], POS[0], 1e-4) && near(now.pos[2], POS[2], 1e-4) && near(now.pos[1], POS[1], 1e-4) && near(now.yaw ?? 0, YAW, 1e-6) && now.scale === 1 && now.lib === wantLib))
    die(`tuple verify failed: ${JSON.stringify({ pos: now.pos, yaw: now.yaw, lib: now.lib })}`);
console.log(`PLACED_VERIFIED ${m.id} pos [${now.pos.map((n: number) => n.toFixed(6)).join(", ")}] yaw ${now.yaw} lib ${now.lib} comp ${JSON.stringify(now.comp ?? {})} (census ${Object.keys(after).length})`);
process.exit(0);
