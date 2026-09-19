// next-place-struct248.ts — FRESH SPAWN: nx-struct-tret v2 (THE TRUNCATED
// TETRAHEDRON, the Balanced Remainder) at the E band fourth form,
// az26.5 r102.0 constellation seat (struct-247 committed carry).
// Bank pin: sha f21b1cd5… deterministic x2 (struct-247 tick) + on-disk
// re-verified THIS tick (mtime-verified 07:21, sha256 match), decode 8/8
// ALL PASS on v2 (struct-247 tick, v2 contract: 3 nodes tret_stone +
// tret_iron + glow KEEP glow_tret_4 incl. finial stem).
//
// SEAT (struct248-scan-tret, fresh 383-entity census, SELFTEST
// RED->GREEN PASS): az26.5 r102.0 (91.28, 45.51) — the E octant band's
// fourth form (ssd az9 r66 + tetrahelix az4 r76 + co az3.5 r96.5
// standing; soft cap 6, NO exceedance); the E approach lane holds the
// inner corridor so the innermost LAWFUL constellation seat with real
// margin (r101 az27 gap 1.45 rejected — 0.05 over law; one 0.5m step
// buys 2.11). NN 39.94 to nx-struct-co (law 8). 8-gon-exact SAT worst
// 2.11 (law 1.4). Walk-clear 73.41.
//
// YAW LAW (procession convention, struct-217/219/224/228/232/234/236/
// 238/240/242/244): local az α -> world az (α - yaw). Judged reading
// face local az90 at anti-travel az206.5 + 30deg east lean (struct-104
// oblique band) -> yaw_deg = -120 - 26.5 = -146.5 -> 213.50deg ->
// YAW = 3.726278 rad. The tret is triangle-down 3-fold about the
// vertical axis (probe T7: 120° symmetry exact) — the yaw is exact
// mod 120deg and protects the judged read.
//
// Terrain (struct248-terrain-tret.ts, THIS tick): 17pt over the TRUE
// rotated 8-gon (center + 8 verts + 8 edge-mids), spread 16.0mm,
// PY = lowest = -0.024869 (the dais-sole-at-grade build absorbs the
// spread).
//
// TARGET = TRUE rotated 8-GON (R4.70, N8, corners on axes): exact
// 8-gon-vs-OBB polygon SAT (max-gap law) + 8-gon-vs-disc point
// distance for the dais family (struct-19 exact-geometry law). Solid
// max horizontal reach + rod 4.232 <= dais apothem 4.342 (probe T7) —
// the solid NEVER overhangs the dais, so the 8-gon IS the true ground
// footprint, no overhang. Chassis: next-place-struct246.ts (proven
// fresh-spawn).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [91.283305, -0.024869, 45.512177] as const; // PY from terrain preflight this tick
const YAW = 213.5 * Math.PI / 180; // 213.50 deg — procession convention (reading face at anti-travel+30 east)
const m = {
    id: "nx-struct-tret",
    file: "village_tret3.glb",
    sha: "f21b1cd567f185668bc052b4a6a108305a36ab425d678479e8ef09e14613a7f2", // struct-247 v2 bank pin; on-disk re-verified THIS tick
    pr: 4.70, // decode D2: 8-gon dais circumradius; solid reach+rod 4.232 <= apothem 4.342 (probe/mk contract — no overhang)
    comp: {} as Record<string, never>, // 4 beads emissive-in-GLB (glow_tret_4 KEEP) — no companion verb
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
// ---- 8-gon-exact SAT + NN preflight at the FINAL pose vs FRESH live set ----
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const LAW = 1.4, NN_LAW = 8.0;
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const LOC = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
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
        g = pointPolyDist(e.pos[0], e.pos[2], H) - discR; // exact 8-gon-vs-disc (struct-19 law)
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
        g = polyGap(H, C); // exact 8-gon-vs-OBB, max-gap law
        nExact++;
    }
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`SAT ${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} spawn blocked: ${collisions.join(", ")}`);
if (nExact === 0) die(`${m.id} preflight vacuous: zero exact-SAT evaluations (NaN/coverage class)`);
console.log(`NN floor: ${nnId} ${nn.toFixed(2)} (law ${NN_LAW})`);
console.log(`8-gon-exact SAT worst: ${worstId} ${worstGap.toFixed(2)} — fresh ${Object.keys(before).length}-entity set [exact ${nExact} radial ${nRadial} disc ${nDisc} exempt ${nExempt}]`);
// ---- upload (content-addressed; shared budget, 429 backoff) ----
let lib = "";
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("as", "model");
    u.searchParams.set("name", `commons-next ${m.id} struct-248 tret v2`);
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct248-place", avatar: cfg.avatar, token: cfg.joinToken })));
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
