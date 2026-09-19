// next-place-struct260.ts — FRESH SPAWN: nx-struct-trico v1 (THE
// TRUNCATED ICOSIDODECAHEDRON, The Knife Meets the Golden Parent) at the
// S-SW band fifth form, az175.5 r104.5 margin+constellation seat
// (struct-259 committed carry). Bank pin: sha c55817dc… deterministic
// x2 (struct-259 tick) + on-disk re-verified THIS tick (sha256 match),
// decode 8/8 ALL PASS on v1 (struct-259 tick: 3 nodes trico_iron +
// trico_stone + glow KEEP glow_trico_12 incl. finial stem).
//
// SEAT (struct260-scan-trico, fresh 395-entity census, SELFTEST
// RED->GREEN PASS; margin filter >= 2.2 per struct-248/254/256/258
// real-margin law): az175.5 r104.5 (-104.178, 8.199) — the S-SW
// octant band's fifth form by floor() arithmetic (millrace az175 r77 +
// csaszar az163 r66 + ico az150 r75 + tcube az165.5 r100 standing;
// az180 forms screwwell/nodoid belong to oct4; soft cap 6, + trico ->
// 5 NO exceedance); under-served octant az135-180 selected by the audit
// (5-way tie at 4 forms broken toward the S-SW band where the trico
// composes with the tcube — the knife's first cut on the cube — at
// 18.32m, and the ico — whose dual census the trico carries as its own
// — at ~24m). The raw scan's innermost lawful seats (r66-71 az169.5-171,
// gap 1.41-1.56) were REJECTED by the margin filter (struct-248
// no-margin class). 62-gon-exact SAT worst 4.17 vs nx-moonmoth-001
// (radial; law 1.4).
//
// YAW LAW (procession convention, struct-217..259): local az α -> world
// az (α - yaw). Judged reading face local az90 at anti-travel az355.5 +
// 30deg east lean (struct-104 band) -> yaw_deg = -120 - 175.5 = -295.5
// -> 64.50deg -> YAW = 1.125737 rad. The trico is DECAGON-DOWN 5-fold
// (probe T7: bottom decagon FLAT, snap face dead-on +X, 72deg symmetry)
// — disclosed: the oblique-lean band puts the yaw 7.5deg off the 72deg
// lattice (the trcubo-class exact-mod bonus does NOT apply); the 5-fold
// family reads its parent-face decagons at any azimuth (tico/tdodec/
// rico placed likewise under the same convention) and the judged
// framing is preserved.
//
// Terrain (struct260-terrain-trico.ts, THIS tick): 125pt over the TRUE
// rotated 62-gon (center + 62 verts + 62 edge-mids), spread 7.7mm,
// PY = lowest = 0.010676 (the dais-sole-at-grade build absorbs the
// spread).
//
// TARGET = TRUE rotated 62-GON (R3.80, N62, corners on axes): exact
// 62-gon-vs-OBB polygon SAT (max-gap law) + 62-gon-vs-disc point
// distance for the dais family (struct-19 exact-geometry law). Build
// envelope 7.60x8.27x7.59 == the dais itself — the model's widest
// horizontal extent IS the dais corners +/-3.800 on x (apothem 3.795
// on z), so the solid NEVER overhangs and the 62-gon IS the true
// ground footprint. Chassis: next-place-struct258.ts (proven
// fresh-spawn).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-104.177861, 0.010676, 8.198976] as const; // PY from terrain preflight this tick
const YAW = 64.5 * Math.PI / 180; // 64.50 deg — procession convention (reading face at anti-travel+30 east)
const m = {
    id: "nx-struct-trico",
    file: "village_trico3.glb",
    sha: "c55817dcf37c1e21eefde0003a12e00e25f6bafae3c8998a613598b34e6295df", // struct-259 v1 bank pin; on-disk re-verified THIS tick
    pr: 3.80, // decode D2: 62-gon dais circumradius; build envelope == dais — no overhang
    comp: {} as Record<string, never>, // 12 beads emissive-in-GLB (glow_trico_12 KEEP) — no companion verb
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
// ---- 62-gon-exact SAT + NN preflight at the FINAL pose vs FRESH live set ----
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const LAW = 1.4, NN_LAW = 8.0;
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const LOC = Array.from({ length: 62 }, (_, i) => {
    const a = (i / 62) * Math.PI * 2;
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
        g = pointPolyDist(e.pos[0], e.pos[2], H) - discR; // exact 62-gon-vs-disc (struct-19 law)
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
        g = polyGap(H, C); // exact 62-gon-vs-OBB, max-gap law
        nExact++;
    }
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`SAT ${e.id}(${g.toFixed(2)})`);
}
// ---- struct-240 NaN LAW, placer form (self-catch this tick): the bare
// nExact===0 die false-fires at a genuinely isolated seat (every
// neighbor legally radial-skipped — this seat's nearest solid is 4.17m
// out via the conservative bound). The STRONGER check is the scan's
// RED control run in-placer: fire the exact path at a standing solid's
// own center (guaranteed overlap) and demand a sub-law gap; NaN
// evaluations would still increment nExact, so only the RED control
// actually proves the path refuses. Gate = RED PASS + non-vacuous
// total coverage (exact+radial+disc > 0). Verified by machine before
// patching; scan SELFTEST this tick passed the same control. ----
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
console.log(`62-gon-exact SAT worst: ${worstId} ${worstGap.toFixed(2)} — fresh ${Object.keys(before).length}-entity set [exact ${nExact} radial ${nRadial} disc ${nDisc} exempt ${nExempt}]`);
// ---- upload (content-addressed; shared budget, 429 backoff) ----
let lib = "";
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("as", "model");
    u.searchParams.set("name", `commons-next ${m.id} struct-260 trico v1`);
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct260-place", avatar: cfg.avatar, token: cfg.joinToken })));
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
