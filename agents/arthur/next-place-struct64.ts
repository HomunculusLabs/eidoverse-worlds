// next-place-struct64.ts — struct-64: ELLIPSE COURT v2 first placement.
// NEW entity (census-verified absent this tick, 271 entities): one spawn.
// Hash gate: 2aa37e9d (v2 half-bay offset, judged this tick — ZAI fallback
// 5/5 PASS on final bytes: colonnade-room read, ring continuous, grounded,
// end bays open, foci pins at (186,408)/(766,407); native 1210 x2 + paced
// retry disclosed; v1 material flag pitfall-5 INVALIDATED vs accepted
// ninesbridge byte-identical lanes).
// TRUE decoded envelope (local): x ±6.97 major / z ±4.475 minor / y ≤ 3.09.
// yaw π/2 → major axis on world Z (N–S walk-through), minor on X.
// SAT preflight (fresh census this tick, conservative full-ellipse OBB):
//   ZERO entities within 8m — no exemptions needed.
// Terrain: 7-point preflight, 16.4mm spread, PY −0.0476 at center.
// Two-pass chassis: hash gate -> live absence check -> upload (429 pacing,
// shared 4/min fleet budget) -> spawn -> post-place tuple verify ->
// idempotent rerun (zero verbs).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [0, -0.0476, -47] as const;
const YAW = Math.PI / 2;
const m = {
    id: "nx-struct-ellipsecourt",
    file: "village_ellipsecourt3.glb",
    sha: "2aa37e9d29ba43f27d9f02f8872d9de4326d194860e45ef777172a4247c27bc1",
    comp: {},
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
const wantLib = () => `store/${m.sha.slice(0, 16)}.glb`;
const before = await geom();
const exist = before[m.id];
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp) && exist.lib === wantLib())) die(`${m.id} live tuple drift (expected absent)`);
let verbs: Array<[string, any]> = [];
if (!exist || exist.lib !== wantLib()) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-64`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`${m.id} upload ${r.status}`);
    }
    if (lib !== wantLib()) die(`${m.id} upload path ${lib}`);
    verbs = exist
        ? [["remove", { id: m.id }], ["spawn", { id: m.id, lib: wantLib(), pos: POS, yaw: YAW, scale: 1 }]]
        : [["spawn", { id: m.id, lib: wantLib(), pos: POS, yaw: YAW, scale: 1 }]];
} else console.log(`${m.id} already live at target lib — no verbs`);
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 1600);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct64-court", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
else console.log(`${m.id} already live — no verbs`);
const after = await geom();
const e = after[m.id];
if (!(e?.lib === wantLib() && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib(), pos: POS, yaw: YAW, verbs: verbs.length }));
