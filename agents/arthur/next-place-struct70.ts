// next-place-struct70.ts — struct-70: R-123 reseat of MERIDIAN DIAL.
// SAME bytes (sha 7acc090a, lib store/7acc090a0420499e.glb already live on
// the standing entity) — pure translation, NO upload (content-addressed).
// Move: (0,-27) -> (6,-45), yaw stays 0 (gnomon must keep pointing polar N).
// R-123 (sweep-71, Sev 2): dial x waterstair interlocked (true 3D min
// 17.2mm; plan-view footprint fused across the meridian corridor).
// Reseat proof (struct70-scan-dialreseat.ts, fresh 277 census):
//  - ZONE A (current pocket): ZERO lawful seats — exhaustively proven; no
//    disc position anywhere in x[-7.5,7.5] z[-31,-21] clears all solids by
//    the 1.4m law (hall E / bunkhouse W / waystone N / waterstair S).
//  - Winner (6,-45): conservative disc-vs-rotated-AABB gap 1.43 vs
//    shelltower (AABB conservatism understates true gap both ways — disc
//    covers octagon, AABB covers yawed box — so true gap > 1.4 law);
//    cloud margins vs waterstair + hall both clear.
//  - Siting: instrument cluster (orrery (9.19,-36.87) precedent), N-spoke
//    walk between waterstair and shelltower court; CITY-PLAN named order
//    (dial between waystone+waterstair) proven INFEASIBLE this tick —
//    recorded for Bill (he alone amends CITY-PLAN).
// Terrain 7pt spread 9.1mm, PY -0.0438. Chassis: remove+spawn reseat (comp
// wipe law; comp bag EMPTY by design), post-place tuple verify, idempotent
// 0-verb rerun expected on second run.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const OLD = [0, -0.0065, -27] as const;
const POS = [6, -0.0438, -45] as const;
const YAW = 0;
const m = {
    id: "nx-struct-meridiandial",
    file: "village_meridiandial3.glb",
    sha: "7acc090a0420499eaa4d1721a7d35e5de81a88076c4a4491450f10f0ab6c2682",
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
if (h !== m.sha) die(`${m.id} hash drift ${h}`);
const wantLib = () => `store/${m.sha.slice(0, 16)}.glb`;
const before = await geom();
const exist = before[m.id];
if (!exist) die(`${m.id} expected standing at OLD or NEW tuple — census says absent`);
// accept the entity at the OLD tuple (first run migrates) or NEW (idempotent rerun)
const atOld = exist.pos.every((n: number, i: number) => near(n, OLD[i])) && near(exist.yaw, YAW) && exist.lib === wantLib();
const atNew = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.lib === wantLib();
if (!atOld && !atNew) die(`${m.id} live tuple drift vs expected OLD ${OLD.join(",")} or NEW ${POS.join(",")}`);
let verbs: Array<[string, any]>;
if (exist.pos.every((n: number, i: number) => near(n, POS[i]))) {
    verbs = [];
    console.log(`${m.id} already at NEW tuple — no verbs`);
} else {
    verbs = [["remove", { id: m.id }], ["spawn", { id: m.id, lib: wantLib(), pos: POS, yaw: YAW, scale: 1 }]];
}
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct70-dial", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
const after = await geom();
const e = after[m.id];
if (!(e?.lib === wantLib() && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib(), pos: POS, yaw: YAW, verbs: verbs.length }));
