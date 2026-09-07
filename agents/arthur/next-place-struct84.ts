// next-place-struct84.ts — struct-84: REULEAUX ROTOR placement (R8-1,
// authored+judged struct-83, deferred to THIS tick queue-law FIRST).
// NEW entity nx-struct-reuleauxrotor (census-verified absent, fresh 287).
// Seat: (-12, -0.0373, -64.5) yaw 0 — the pendulum's WEST mirror at the S
// threshold (pendulum E at (13.16,-60.59) swings, rotor W turns: kinetic
// pair flanking the catenarygate's outbound view, >=10m off the walking
// axis both sides; exact-mirror point rejected: 1.85m to the SW approach
// lane envelope). S-procession membership: waterstair r32, catenarygate
// r60.5, pendulum r62 E, rotor r65.6 W — no watermark clash (moongate/
// whisperhorn own SW).
// TRUE decoded envelope (local): x -1.75..1.75, z -1.75..1.75 (plinth
// 3.5x3.5), y 0..3.29, origin-centered (no H-3 offset).
// Terrain 9pt spread 5.6mm, PY -0.0373.
// SAT: rotor OBB 3.5x3.5 yaw 0 vs census OBBs (fresh set). Comps: BOTH
// motion comps from struct83-rotor-comp.json sidecar (no hand
// transcription): pwheel_rr path (240pt deltoid, 0.022935 m/s, loop,
// face:false) + sails spin (z, +2.5 deg/s) — both linear in server t,
// T=144s, phase-locked by construction.
// YAW IS RADIANS ON THE WIRE (models.js:77 verbatim to rotation.y).
// Two-pass chassis (struct80/81/82 proven): hash gate -> live absence ->
// SAT preflight vs FRESH census -> upload (429 pacing, shared 4/min) ->
// spawn -> comp re-apply -> tuple verify -> idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-12, -0.0373, -64.5] as const;
const YAW = 0;
const COMP = JSON.parse(readFileSync(`${ROOT}/agents/arthur/struct83-rotor-comp.json`, "utf8")) as Record<string, any>;
const m = {
    id: "nx-struct-reuleauxrotor",
    file: "village_reuleauxrotor3.glb",
    sha: "670e397cb6422ee20205a541389a64fa1cea982acdbc99f20ecdb3a6e2623038",
    bbox: { min: [-1.75, 0, -1.75], max: [1.75, 3.29, 1.75] },
    comp: COMP,
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
// sidecar sanity: 2 comps, path has 240 points, spin z
if (Object.keys(COMP).length !== 2) die(`sidecar comp count ${Object.keys(COMP).length}`);
const path = COMP["motion:pwheel_rr"], spin = COMP["motion:sails"];
if (!path || path.type !== "path" || path.points?.length !== 240) die(`sidecar path bad`);
if (!spin || spin.type !== "spin" || spin.axis !== "z") die(`sidecar spin bad`);
// ---- SAT preflight vs FRESH live set: rotor OBB vs yaw-rotated OBBs ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-|nx-dress-sw-moss/;
const RX = 1.75, RZ = 1.75, LAW = 1.4;
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
    // neighbor local-bbox center offset rotates with yaw (H-3 / align-1 law)
    const cx = (bb.min[0] + bb.max[0]) / 2, cz = (bb.min[2] + bb.max[2]) / 2;
    const yaw = e.yaw ?? 0;
    const nx = e.pos[0] + cx * Math.cos(yaw) + cz * Math.sin(yaw);
    const nz = e.pos[2] - cx * Math.sin(yaw) + cz * Math.cos(yaw);
    const minx = nx - ew, maxx = nx + ew, minz = nz - ed, maxz = nz + ed;
    const qx = Math.max(minx, Math.min(POS[0], maxx)), qz = Math.max(minz, Math.min(POS[2], maxz));
    const g = Math.hypot(POS[0] - qx, POS[2] - qz) - RX; // OBB-vs-AABB dist to rotor disc
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight worst: ${worstId} ${worstGap.toFixed(2)} (fresh ${Object.keys(before).length}-entity set, rotor OBB 3.5x3.5)`);
const exist = before[m.id];
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp) && exist.lib === wantLib)) die(`${m.id} live tuple drift (expected absent or exact)`);
let verbs: Array<[string, any]> = [];
if (!exist || exist.lib !== wantLib) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-84`);
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
    verbs.push(["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: YAW, scale: 1, comp: {} }]);
} else {
    console.log("already live with exact lib — no spawn verb");
}
// comp-wipe law: spawn wipes comps, so always (re)apply after any spawn;
// if already live, only when the live bag differs (struct-80 chassis)
const compWas = exist?.comp ?? {};
const needComps = verbs.some(v => v[0] === "spawn") || !eq(compWas, m.comp);
if (needComps) for (const [type, data] of Object.entries(m.comp)) verbs.push(["comp", { id: m.id, type, data }]);
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const { WebSocket } = require("ws") as typeof import("ws");
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        console.log(`verb: ${verb} ${args.id} ${args.type ?? ""}`);
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 1600);
    }, 650);
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct84-reuleauxrotor", avatar: cfg.avatar, token: cfg.joinToken })));
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
console.log(`PLACED_VERIFIED ${m.id} @ (${POS.join(", ")}) yaw ${YAW} lib ${wantLib} comp ${Object.keys(m.comp).join("+")} — census ${Object.keys(after).length}`);
