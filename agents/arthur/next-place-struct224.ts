// next-place-struct224.ts — FRESH SPAWN: nx-struct-rupertfork v11 beyond the
// Math Avenue procession (on-line continuation past newtonspheres).
// struct-223's committed carry contract executed: "placement = struct-224
// committed carry: fresh census scan (8m NN law, district soft cap 6, Math
// Avenue eligibility; procession continues past newtonspheres r430), yaw law
// (the gate faces read obliquely per struct-104; …), terrain preflight over
// the TRUE rotated footprint, hash-gated plain spawn nx-struct-rupertfork,
// comp {}. Folly class by presentation … — no walk owed; if seated walkable
// around, a circuit walk at placement."
//
// SEAT (struct224-scan, fresh 360 census): procession az94 continues ...
// -> morley380 -> arbelos390 -> lunes400 -> oloid410 -> sphericon420 ->
// newtonspheres430; rupertfork takes az94.0 r445.0 — ON-LINE exact, the
// procession line kept dead-on (CITY-PLAN "one coherent procession" law).
// The 10m rhythm is honestly widened to 15m: the v11 square span's
// half-diagonal (5.48*sqrt2 = 7.754m) + dais r5.0 + law 1.4m forces center
// distance >= 14.15m — the first whole-meter lawful step is r445.0
// (rupertfork is the far procession's largest form; disclosed). NN 15.00 vs
// nx-struct-newtonspheres (law 8.0), square-vs-disc EXACT gap 2.25 (law 1.4).
//
// YAW LAW (rotation direction corrected + verified against struct-219 this
// tick): local az α -> world az (α − yaw). Mouth = local az45 (bore NN
// toward the +x,+z corner) -> world mouth az = 45 − 101 = −56 ≡ 304 =
// anti-travel az274 + 30° east lean — the documented procession convention
// (struct-217 sphericon 214°, struct-219 newtonspheres 146°). Reads: near
// mouth 30° oblique to the approaching viewer; far mouth az124 (30° off the
// outbound lookback); wall faces az259/349 — oblique diamonds both ways.
//
// Terrain (struct224-terrain-rupertfork.ts, this tick): 9pt over the TRUE
// rotated square (center + 4 corners + 4 edge-mids at yaw), spread 16.0mm,
// PY = lowest = -0.046430 (mid+z; embed absorbs).
//
// Chassis: next-place-struct219 (newtonspheres fresh-spawn, proven) with the
// target as a rotated SQUARE OBB (half 5.48, decode D8/probe S6 symmetric
// origin-centered footprint — "seat with the TRUE bbox"): 4-axis OBB-SAT
// max-gap law for square neighbors; EXACT square-vs-disc override for the
// known disc neighbors (newtonspheres/sphericon dais r5.0 — struct-19 law;
// a square-bbox proxy on a round neighbor FALSE-PASSES on-line seats:
// r442 proxy 1.52 vs disc-exact 0.87).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-31.041631, -0.0, 443.916002] as const; // PY patched from terrain preflight below
const YAW = 1.762783;
const m = {
    id: "nx-struct-rupertfork",
    file: "village_rupertfork3.glb",
    sha: "8013175fb28a0df1a2a90d267c6d7b7109a157adc4b3bbc0c6e79ccf4b1fb7a9", // struct-223 v11 bank pin; deterministic x2 + on-disk re-verified THIS tick
    half: 5.48, // decode D8 / probe S6: 10.96 x 5.14 x 10.96 origin-centered square footprint
    comp: {} as Record<string, never>, // four warm beads emissive-in-GLB (glow_rf_1 KEEP) — no companion verb
} as const;
// terrain preflight (struct224-terrain-rupertfork.ts, this tick): 9pt rotated
// square, 16.0mm spread; PY = lowest sample.
const TERRAIN_PY = -0.046430;
if (Math.abs(POS[1] - TERRAIN_PY) > 1e-9) { console.log(`PY from terrain preflight = ${TERRAIN_PY} (patched constant)`); }
(POS as any)[1] = TERRAIN_PY;
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
// idempotent form: already seated v11 at exact tuple -> zero verbs
if (before[m.id] && before[m.id].lib === wantLib && near(before[m.id].pos[0], POS[0]) && near(before[m.id].pos[1], POS[1], 1e-4) && near(before[m.id].pos[2], POS[2]) && near(before[m.id].yaw ?? 0, YAW, 1e-6)) {
    console.log(`ALREADY_SEATED ${m.id} ${wantLib} — no verbs`);
    process.exit(0);
}
// fresh-spawn contract: entity ABSENT (banked, never placed)
if (before[m.id]) die(`${m.id} present as ${before[m.id].lib} — this placer is the fresh-spawn chassis, reseat chassis required instead`);
console.log(`fresh census ${Object.keys(before).length}: ${m.id} ABSENT (fresh-spawn contract)`);
// ---- OBB-SAT + NN preflight at the FINAL pose vs FRESH live set (no self yet) ----
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const LAW = 1.4, NN_LAW = 8.0;
const DISC_N: Record<string, number> = { "nx-struct-newtonspheres": 5.0, "nx-struct-sphericon": 5.0 };
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const ax = [cy, -sy], az = [sy, cy]; // target local axes in world (skill convention)
let worstGap = Infinity, worstId = "", nn = Infinity, nnId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (/^nx-struct-/.test(e.id) && !/-l$/.test(e.id)) {
        const dd = Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]);
        if (dd < nn) { nn = dd; nnId = e.id; }
        if (dd < NN_LAW) collisions.push(`NN ${e.id}(${dd.toFixed(2)})`);
    }
    const bb = e.bbox;
    if (!bb) continue;
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;
    if (GROUND.test(e.id)) continue;
    let g: number;
    const discR = DISC_N[e.id];
    if (discR !== undefined) {
        // exact square-vs-disc (struct-19 law, both directions)
        const dx = POS[0] - e.pos[0], dz = POS[2] - e.pos[2];
        const du = Math.abs(dx * ax[0] + dz * ax[1]) - m.half;
        const dv = Math.abs(dx * az[0] + dz * az[1]) - m.half;
        g = Math.hypot(Math.max(du, 0), Math.max(dv, 0)) - discR;
    } else {
        const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
        const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
        const ey = e.yaw ?? 0, ecy = Math.cos(ey), esy = Math.sin(ey);
        const ecxW = e.pos[0] + ecx * ecy + ecz * esy, eczW = e.pos[2] - ecx * esy + ecz * ecy;
        const bx = [ecy, -esy], bz = [esy, ecy];
        const dx = POS[0] - ecxW, dz = POS[2] - eczW;
        g = -1e9; // max-gap law: any positive axis separates
        for (const a of [ax, az, bx, bz]) {
            const dist = Math.abs(dx * a[0] + dz * a[1]);
            const rA = Math.abs(ax[0] * a[0] + ax[1] * a[1]) * m.half + Math.abs(az[0] * a[0] + az[1] * a[1]) * m.half;
            const rB = Math.abs(bx[0] * a[0] + bx[1] * a[1]) * hx + Math.abs(bz[0] * a[0] + bz[1] * a[1]) * hz;
            g = Math.max(g, dist - rA - rB);
        }
    }
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`SAT ${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} spawn blocked: ${collisions.join(", ")}`);
console.log(`NN floor: ${nnId} ${nn.toFixed(2)} (law ${NN_LAW})`);
console.log(`OBB-SAT preflight (square half ${m.half}, disc-exact for dais family) worst: ${worstId} ${worstGap.toFixed(2)} — fresh ${Object.keys(before).length}-entity set`);
// ---- upload (content-addressed; shared budget, 429 backoff) ----
let lib = "";
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-224 rupertfork v11`);
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct224-place", avatar: cfg.avatar, token: cfg.joinToken })));
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
