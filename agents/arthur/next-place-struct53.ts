// next-place-struct53.ts — struct-53: waterstair WATER MATERIAL cure re-place.
// Same entity, same exact pose as struct-16: remove+spawn reseat (comp null
// before and after — census shows no comps — so no comp reapply needed).
// Hash gate: 4acda521 (was 3ffa182c). Materials-only change: POSITION blobs
// proven byte-identical (envelope strict subset of the standing bbox) —
// SAT-neutral reseat, same collision set as struct-16's placement.
// Cure class: struct-38 (plain mat() exports NO glTF material -> loader-
// default near-black water; survey-17/18 Sev 3 "dark band reads void").
// Two-pass chassis: hash gate -> live tuple drift check -> upload with 429
// pacing -> remove+spawn -> post-place tuple verify -> idempotent rerun.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [0, -0.03222645164101495, -32] as const;
const YAW = 0;
const m = {
    id: "nx-struct-waterstair",
    file: "village_waterstair3.glb",
    sha: "4acda52181875ffd4f61f237840a649297f518bdda3982f44eb8873e67d90298",
    bbox: { min: [-1.825, -0.9, -0.2], max: [1.825, 0.795, 3.6] }, // envelope proven identical
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
// reseat refuses to move: exact tuple or nothing
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp))) die(`${m.id} live tuple drift (reseat refuses to move)`);
let verbs: Array<[string, any]> = [];
if (!exist || exist.lib !== wantLib()) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-53`);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct53-waterstair", avatar: cfg.avatar, token: cfg.joinToken }));
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
