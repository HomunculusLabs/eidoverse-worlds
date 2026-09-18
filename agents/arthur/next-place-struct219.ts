// next-place-struct219.ts — FRESH SPAWN: nx-struct-newtonspheres v1 beyond the
// Math Avenue procession (on-line continuation past sphericon).
// struct-218's committed carry contract executed: "placement = struct-219
// committed carry: fresh census scan (8m NN law, district soft cap 6, Math
// Avenue eligibility; procession continues past sphericon r420), yaw law
// (disc inlay reads from the approach side), terrain preflight over the TRUE
// rotated footprint (10.0m disc — 5pt + center minimum, disc-vs-OBB exact
// geometry per struct-19 law: square-bbox SAT can never pass a 10m disc near
// neighbors), hash-gated plain spawn nx-struct-newtonspheres, comp {}.
// Folly class (probe L4 seals the center) — rim circuit walk owed at
// placement."
//
// SEAT (struct219-scan, fresh 355 census): procession az94 continues ... ->
// lunes400 -> oloid410 -> sphericon420; the newtonspheres takes the NEXT
// ON-LINE STEP az94.0 r430.0 (10.0m == the standing rhythm). NN 10.00 vs
// nx-struct-sphericon (law 8.0), disc-exact gap 2.28 vs nx-struct-sphericon
// at FINAL pose (law 1.4) — 553 lawful band candidates.
//
// YAW LAW (inlay reads from the approach side, procession east-lean
// convention): the seven inlay discs sit at local +Z (INLAY_C 3.90); the
// outbound walker approaches along az94 from the az274 side. YAW 2.548181
// (146 deg) puts local +Z at world az304 (skill transform: +Z -> (sin y,
// cos y); az = atan2(cos146, sin146) = 304.0) = anti-travel az274 + 30 deg
// EAST lean — the oblique-read convention (struct-104 class; the documented
// procession convention). The dais silhouette is a perfect cylinder, so SAT
// is yaw-independent; only the inlay + icosa arrangement rotate.
// Terrain (struct219-terrain-newtonspheres.ts): 9pt over the TRUE disc rim
// (r5.0, yaw-independent), PY = lowest (embed absorbs).
//
// Chassis: next-place-struct217 (sphericon fresh-spawn, proven) — entity
// ABSENT before (banked-not-placed), hash-gated upload (content-addressed,
// 429 backoff, shared budget), DISC-EXACT SAT/NN preflight re-run at the
// FINAL pose vs the FRESH live set, paced spawn, post-place tuple verify.
// Idempotent: live lib == sha AND tuple exact -> zero verbs.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-29.995283, -0.0, 428.952541] as const; // PY patched from terrain preflight below
const YAW = 2.548181;
const m = {
    id: "nx-struct-newtonspheres",
    file: "village_newtonspheres3.glb",
    sha: "f8016bfab73aff2c2b50180f8350503f3f1982d996c66ffb999ed8944b44397b", // struct-218 v1 bank pin; re-verified on disk this tick (shasum -a 256)
    discR: 5.0, // decode D2: dais r 5.000 exact — the footprint is a DISC
    comp: {} as Record<string, never>, // heart glow emissive-in-GLB (glow_ns_1 KEEP) — no companion verb
} as const;
// terrain preflight (struct219-terrain-newtonspheres.ts, this tick): 9pt
// spread over the true disc rim; PY = lowest sample.
const TERRAIN_PY = -0.045211; // struct219-terrain-newtonspheres.ts this tick: 9pt disc-rim spread 7.2mm, lowest -0.045211 (embed absorbs)
if (Math.abs(POS[1] - TERRAIN_PY) > 1e-9) { console.log(`PY from terrain preflight = ${TERRAIN_PY} (patched constant)`); }
POS[1] = TERRAIN_PY;
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
// ---- DISC-EXACT SAT + NN preflight at the FINAL pose vs FRESH live set (no self yet) ----
// struct-19 law: a disc seat never passes square-bbox SAT — use exact
// disc-vs-OBB signed distance (neighbor local axes per the skill convention:
// local x -> (cos, -sin), local z -> (sin, +cos)).
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const LAW = 1.4, NN_LAW = 8.0;
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
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0, cy = Math.cos(ey), sy = Math.sin(ey);
    const ecxW = e.pos[0] + ecx * cy + ecz * sy, eczW = e.pos[2] - ecx * sy + ecz * cy;
    const ux = [cy, -sy], uz = [sy, cy];
    const dx = POS[0] - ecxW, dz = POS[2] - eczW;
    const du = Math.abs(dx * ux[0] + dz * ux[1]) - hx;
    const dv = Math.abs(dx * uz[0] + dz * uz[1]) - hz;
    const dist = Math.hypot(Math.max(du, 0), Math.max(dv, 0));
    const g = dist - m.discR;
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`SAT ${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} spawn blocked: ${collisions.join(", ")}`);
console.log(`NN floor: ${nnId} ${nn.toFixed(2)} (law ${NN_LAW})`);
console.log(`disc-exact SAT preflight (disc r ${m.discR}) worst: ${worstId} ${worstGap.toFixed(2)} — fresh ${Object.keys(before).length}-entity set`);
// ---- upload (content-addressed; shared budget, 429 backoff) ----
let lib = "";
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-219 newtonspheres v1`);
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct219-place", avatar: cfg.avatar, token: cfg.joinToken })));
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
