// next-place-struct213.ts — FRESH SPAWN: nx-struct-lunes v1 beyond the
// Math Avenue procession (on-line continuation past arbelos).
// struct-212's committed carry contract executed: "placement = struct-213
// carry (Math Avenue procession past arbelos r390, 8m NN law, oblique 214deg
// convention, hash-gated spawn nx-struct-lunes, comp {})".
//
// SEAT (struct213-scan + struct213-select, this tick): procession az94
// continues ... -> mandelbrot360 -> viviani370 -> morley380 -> arbelos390;
// the lunes takes the NEXT ON-LINE STEP az94.0 r400.0 (10.0m == the
// ...->viviani->morley->arbelos rhythm). NN 10.00 vs nx-struct-arbelos
// (law 8.0), SAT 5.36 vs nx-struct-arbelos at FINAL yaw 214deg (law 1.4).
// YAW LAW: 3.735004599267865 (214deg) puts the +Z face normal at az304 —
// 30 deg off the az274 anti-travel sightline, east lean (the
// melencolia/fourier/cissoid/quadratrix/archispiral/nephroid/folium/
// rhodonea/versiera/elliptic/mandelbrot/viviani/morley/arbelos/lunes
// oblique band). The outbound walker reads the construction face
// obliquely on approach. Terrain 9pt spread 7.2mm, PY = -0.031168
// (struct213-terrain-lunes.ts; 8cm cradle embed absorbs the spread).
//
// Chassis: next-place-struct211 (arbelos fresh-spawn, proven) — entity
// ABSENT before (banked-not-placed), hash-gated upload (content-addressed,
// 429 backoff, shared budget), SAT/NN preflight re-run at FINAL pose vs the
// FRESH live set (SYMMETRIC curb-long footprint 7.528x0.900, center (0,0)),
// paced spawn, post-place tuple verify. Idempotent: live lib == sha AND
// tuple exact -> zero verbs.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-27.902589, -0.031168, 399.025620] as const;
const YAW = 3.735004599267865;
const m = {
    id: "nx-struct-lunes",
    file: "village_lunes3.glb",
    sha: "41af82ec0c20af4c1f7a2746b50da11e89a29e6a97f13e45833ca51c32a325e9", // struct-212 v1 bank pin; re-verified on disk this tick (shasum -a 256)
    bbox: { min: [-3.764, 0, -0.45], max: [3.764, 3.590, 0.45] }, // struct-212 decoded envelope 7.528x3.590x0.900 SYMMETRIC (triangle + lunes + arc + curb)
    comp: {} as Record<string, never>, // sole night bead emissive-in-GLB (glow KEEP) — no companion verb
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
// ---- SAT + NN preflight at the FINAL pose vs FRESH live set (no self yet) ----
// SYMMETRIC footprint law: envelope bbox-center sits at local (0,0).
const GROUND = /nx-town-roads|nx-town-paths|nx-dress-sw-moss|nx-approach-(?!.*lamp)/;
const LAW = 1.4, NN_LAW = 8.0;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const WCX = POS[0] + CX * cs + CZ * sn, WCZ = POS[2] - CX * sn + CZ * cs;
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
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
    const ey = e.yaw ?? 0;
    const cy = Math.cos(ey), sy = Math.sin(ey);
    const ecxW = e.pos[0] + ecx * cy + ecz * sy, eczW = e.pos[2] - ecx * sy + ecz * cy;
    const ew = hx * Math.abs(cy) + hz * Math.abs(sy), ed = hx * Math.abs(sy) + hz * Math.abs(cy);
    const g = Math.max(Math.abs(WCX - ecxW) - (EW + ew), Math.abs(WCZ - eczW) - (ED + ed));
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`SAT ${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} spawn blocked: ${collisions.join(", ")}`);
console.log(`NN floor: ${nnId} ${nn.toFixed(2)} (law ${NN_LAW})`);
console.log(`SAT preflight (symmetric footprint ${EW.toFixed(2)}x${ED.toFixed(2)} at yaw ${YAW.toFixed(4)}) worst: ${worstId} ${worstGap.toFixed(2)} — fresh ${Object.keys(before).length}-entity set`);
// ---- upload (content-addressed; shared budget, 429 backoff) ----
let lib = "";
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-213 lunes v1`);
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
    ["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: YAW, scale: 1, comp: m.comp }],
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct213-place", avatar: cfg.avatar, token: cfg.joinToken })));
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
