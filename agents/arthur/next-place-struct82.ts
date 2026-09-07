// next-place-struct82.ts — struct-82: WHISPER HORN placement (R7-2, SW
// contemplative r89, skymirror companion + moongate outbound axis).
// NEW entity nx-struct-whisperhorn (census-verified absent, fresh 286).
// Seat: (-64.02, -0.028, -61.82) yaw 0 — azimuthally symmetric (bell-up),
// no yaw read dependence. Composition: the skymirror (watches the sky,
// 6.2m away, gap +2.36 exact disc-vs-AABB) and the horn ANSWERS it; both
// skyward instruments in the whisper-native contemplative district; on
// the moongate's outbound axis (3.3deg off at 27m — the horn crowns the
// view through the SW ring gate).
// TRUE decoded envelope (local): x -2.05..2.05, z -2.05..2.05 (DISC r 2.05
// — base slab, full circles), y 0..2.746.
// Terrain 9pt spread 4.3mm, PY -0.028.
// SAT: EXACT disc r 2.05 vs census AABBs (struct-19 law — square proxy
// inflates a round work by dead corners); worst expected nx-struct-skymirror
// +2.36. Comps: NONE (brass lip is material, not comp).
// YAW IS RADIANS ON THE WIRE (models.js:77 verbatim to rotation.y).
// Two-pass chassis (struct80/81 proven): hash gate -> live absence -> SAT
// preflight vs FRESH census -> upload (429 pacing, shared 4/min) -> spawn
// -> tuple verify -> idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-64.02, -0.028, -61.82] as const;
const YAW = 0;
const m = {
    id: "nx-struct-whisperhorn",
    file: "village_whisperhorn3.glb",
    sha: "b6e48e4622f101087cace1e21d2b7e0f933b043f744e8dcf793b939a451cbc7c",
    bbox: { min: [-2.05, 0, -2.05], max: [2.05, 2.746, 2.05] },
    comp: {} as Record<string, never>,
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
function canon(v: any): any { return Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v; }
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`${m.id} reviewed hash drift ${h}`);
const wantLib = `store/${m.sha.slice(0, 16)}.glb`;
// ---- SAT preflight vs FRESH live set: EXACT disc vs yaw-grown AABBs ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-|nx-dress-sw-moss/;
const R = 2.05, LAW = 1.4;
const before = await geom();
let worstGap = Infinity, worstId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue;
    const bb = e.bbox;
    if (!bb) continue;                       // lights carry no bbox
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue; // ground films
    if (GROUND.test(e.id)) continue;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const cy = Math.abs(Math.cos(e.yaw ?? 0)), sy = Math.abs(Math.sin(e.yaw ?? 0));
    const ew = hx * cy + hz * sy, ed = hx * sy + hz * cy;
    const minx = e.pos[0] - ew, maxx = e.pos[0] + ew, minz = e.pos[2] - ed, maxz = e.pos[2] + ed;
    const qx = Math.max(minx, Math.min(POS[0], maxx)), qz = Math.max(minz, Math.min(POS[2], maxz));
    const g = Math.hypot(POS[0] - qx, POS[2] - qz) - R; // disc vs AABB, exact
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight worst: ${worstId} ${worstGap.toFixed(2)} (fresh ${Object.keys(before).length}-entity set, exact disc r ${R})`);
const exist = before[m.id];
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp) && exist.lib === wantLib)) die(`${m.id} live tuple drift (expected absent or exact)`);
let verbs: Array<[string, any]> = [];
if (!exist || exist.lib !== wantLib) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-82`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = ((await r.json()) as any).path; break; }
        if (r.status === 429 && a < 5) { console.log(`429 upload, backoff ${a * 30}s`); await sleep(a * 30000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== wantLib) die(`upload path ${lib}`);
    console.log(`upload OK ${lib}`);
    verbs.push(["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: YAW, scale: 1, comp: m.comp }]);
} else {
    console.log("already live with exact lib — no verbs");
}
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const { WebSocket } = require("ws") as typeof import("ws");
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        console.log(`verb: ${verb} ${args.id}`);
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 1600);
    }, 650);
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct82-whisperhorn", avatar: cfg.avatar, token: cfg.joinToken })));
    ws.on("error", (e: any) => { clearTimeout(timer); reject(e); });
    ws.on("message", (ev: any) => {
        const x = JSON.parse(ev.toString());
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    });
});
await sleep(1200);
// ---- post-place tuple verify ----
const after = await geom();
const live = after[m.id];
if (!live) die(`${m.id} absent after place`);
if (!live.pos.every((n: number, i: number) => near(n, POS[i]))) die(`pos drift ${live.pos}`);
if (!near(live.yaw ?? 0, YAW)) die(`yaw drift ${live.yaw}`);
if (live.lib !== wantLib) die(`lib drift ${live.lib}`);
if (!eq(live.comp ?? {}, m.comp)) die(`comp drift ${JSON.stringify(live.comp)}`);
console.log(`PLACED_VERIFIED ${m.id} @ (${POS.join(", ")}) yaw ${YAW} lib ${wantLib} comp {} — census ${Object.keys(after).length}`);
