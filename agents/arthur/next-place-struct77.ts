// next-place-struct77.ts — struct-77: OGEE GATE first placement (R6-3, NE
// craft threshold). NEW entity (census-verified absent, fresh 282 census).
// Seat: (22.71, -0.0025, 65.75) yaw -32.68deg — straddles the NE lane-002
// path 2.0m beyond bead b14 (the lane's last bone pillar, local z=-2.0,
// clear of the 1.5m passage depth); opening axis on the lane tangent
// t=(-0.5399,0.8417); rim [66.77,72.38] legal; brass kalasha becomes the
// warm terminus of the approach bead line.
// Hash gate: 32039b5a (v4 kalasha terminal stone; NATIVE night 3/3 PASS +
// ZAI close EMBEDDED + native gameplay 4/5-with-resolution-residual
// disclosed; x2 deterministic).
// TRUE decoded envelope (local): x -2.93..2.93, z -0.82..0.82, y 0..6.089.
// SAT (fresh 282 census conservative scan, struct-70 law): on-spoke/window
// worst neighbor approach-ne-lane-002 +5.37 conservative (ground film; bead
// b14 exact-clear by construction). Terrain 7pt spread 7mm.
// Two-pass chassis (struct73 proven): hash gate -> live absence -> upload
// (429 pacing, shared 4/min) -> spawn -> tuple verify -> idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [22.71, -0.0025, 65.75] as const;
const YAW = -32.68;
const m = {
    id: "nx-struct-ogeegate",
    file: "village_ogeegate3.glb",
    sha: "32039b5a7fb9da302abc9f0858eb3fdf17eeb0c9dc7827857117f89d69388ecc",
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
    u.searchParams.set("name", `commons-next ${m.id} struct-77`);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct77-gate", avatar: cfg.avatar, token: cfg.joinToken }));
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
