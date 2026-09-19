// next-place-struct244.ts — FRESH SPAWN: nx-struct-tico v2 (THE TRUNCATED
// ICOSAHEDRON, C60, the football — Euler's Twelve) at the W-NW band third
// form, az264.5 r66 constellation seat (struct-243 committed carry).
// Bank pin: sha 5b8401b0… deterministic x2 + on-disk re-verified THIS
// tick (rebuild exits 0/0 both runs, envelope line == probe contract
// 6.60x6.29x6.60, mtime-verified), decode 8/8 ALL PASS (struct-243 tick,
// v2 contract: 3 nodes stone+iron+glow KEEP glow_tico_12).
//
// SEAT (struct244-scan-tico, fresh 379-entity census, SELFTEST
// RED->GREEN PASS): az264.5 r66.0 (-6.33, -65.70) — the W-NW octant
// band's third form (city-relocated skymirror az228 r89.5 + observatory
// az245.5 r96 standing; soft cap 6, NO exceedance) AND the innermost
// constellation seat with widest margin. NN 15.17 to nx-struct-
// ellipsecourt (law 8). 32-gon-exact SAT worst 3.58 (law 1.4).
// Walk-clear 37.41.
//
// YAW LAW (procession convention, struct-217/219/224/228/232/234/236/
// 238/240/242): local az α -> world az (α - yaw). Judged reading face
// local az90 at anti-travel az84.5 + 30deg east lean (struct-104
// oblique band) -> yaw_deg = -120 - 264.5 = -384.5 -> 335.50deg ->
// YAW = 5.855580 rad. The tico is 72°-symmetric about the pentagon axis
// (5-fold seat) — the yaw is exact mod 72deg and protects the judged
// read.
//
// Terrain (struct244-terrain-tico.ts, THIS tick): 65pt over the TRUE
// rotated 32-gon (center + 32 verts + 32 edge-mids), spread 13.1mm,
// PY = lowest = -0.033640 (the dais-sole-at-grade build absorbs the
// spread).
//
// TARGET = TRUE rotated 32-GON (R3.30, N32, corners on axes): exact
// 32-gon-vs-OBB polygon SAT (max-gap law) + 32-gon-vs-disc point
// distance for the dais family (struct-19 exact-geometry law). Ball max
// horizontal reach + bead 3.189 <= dais apothem 3.284 (probe T7) — the
// ball NEVER overhangs the dais, so the 32-gon IS the true ground
// footprint, no overhang. Chassis: next-place-struct242.ts (proven
// fresh-spawn).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-6.325820, -0.033640, -65.696149] as const; // PY from terrain preflight this tick
const YAW = 5.855580; // 335.50 deg — procession convention (reading face at anti-travel+30 east)
const m = {
    id: "nx-struct-tico",
    file: "village_tico3.glb",
    sha: "5b8401b007528533884d1e00414386ec80adba7f21ac9b20b63e8064bb1d0742", // struct-243 v2 bank pin; x2 + on-disk re-verified THIS tick
    pr: 3.30, // decode D2: 32-gon dais circumradius; ball reach+bead 3.189 <= apothem 3.284 (probe/mk contract — no overhang)
    comp: {} as Record<string, never>, // 12 beads emissive-in-GLB (glow_tico_12 KEEP) — no companion verb
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
// idempotent form: already seated v2 at exact tuple -> zero verbs
if (before[m.id] && before[m.id].lib === wantLib && near(before[m.id].pos[0], POS[0]) && near(before[m.id].pos[1], POS[1], 1e-4) && near(before[m.id].pos[2], POS[2]) && near(before[m.id].yaw ?? 0, YAW, 1e-6)) {
    console.log(`ALREADY_SEATED ${m.id} ${wantLib} — no verbs`);
    process.exit(0);
}
// fresh-spawn contract: entity ABSENT (banked, never placed)
if (before[m.id]) die(`${m.id} present as ${before[m.id].lib} — this placer is the fresh-spawn chassis, reseat chassis required instead`);
console.log(`fresh census ${Object.keys(before).length}: ${m.id} ABSENT (fresh-spawn contract)`);
// ---- 32-gon-exact SAT + NN preflight at the FINAL pose vs FRESH live set ----
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const LAW = 1.4, NN_LAW = 8.0;
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const LOC = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
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
        const aMin = Math.min(...A.map(p => p[0] * ax + p[1] * ay)), aMax = Math.max(...A.map(p => p[0] * ax + p * ay));
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
        g = pointPolyDist(e.pos[0], e.pos[2], H) - discR; // exact 32-gon-vs-disc (struct-19 law)
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
        g = polyGap(H, C); // exact 32-gon-vs-OBB, max-gap law
        nExact++;
    }
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`SAT ${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} spawn blocked: ${collisions.join(", ")}`);
if (nExact === 0) die(`${m.id} preflight vacuous: zero exact-SAT evaluations (NaN/coverage class)`);
console.log(`NN floor: ${nnId} ${nn.toFixed(2)} (law ${NN_LAW})`);
console.log(`32-gon-exact SAT worst: ${worstId} ${worstGap.toFixed(2)} — fresh ${Object.keys(before).length}-entity set [exact ${nExact} radial ${nRadial} disc ${nDisc} exempt ${nExempt}]`);
// ---- upload (content-addressed; shared budget, 429 backoff) ----
let lib = "";
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("as", "model");
    u.searchParams.set("name", `commons-next ${m.id} struct-244 tico v2`);
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct244-place", avatar: cfg.avatar, token: cfg.joinToken })));
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
