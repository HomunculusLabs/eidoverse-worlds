// next-place-improve34-longhouse.ts — improve-34: nx-town-longhouse
// re-place (remove+spawn, exact standing tuple) with the identity-cured GLB.
// commons-next only. Comp bag {} at baseline (fresh census this tick);
// re-place wipes comps on THIS entity only — bag re-check after is empty.
// Riders are separate entities, untouched, verified standing after:
//   nx-artwalk-b19-longhouse-feast-count (host-local porch-roof edge,
//   slab-band keep-out differential 0==0 verts at audit) and
//   nx-town-longhouse-l (light companion).
// Live pin gate: baseline e3adcd3de790f147 at the exact standing tuple,
// or the new pin c4aaa7833a1336ac (idempotent rerun: zero verbs).
// SAT: same-tuple re-place where the edit is envelope-subset — new
// envelope x ±4.7 / z −2.923..4.301 UNCHANGED (floor extents), y max
// 5.245 < 5.369 strict subset; no new overlap can arise. Live bbox gates.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [9, 0, 26] as const;
const YAW = -2.828368080172068;
const SHA = "c4aaa7833a1336ac";
const PREV = "e3adcd3de790f147";
const ID = "nx-town-longhouse";
const RIDERS = ["nx-artwalk-b19-longhouse-feast-count", "nx-town-longhouse-l"];
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_longhouse3.glb`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h.slice(0, 16) !== SHA) die(`${ID} hash drift ${h}`);
const before = await geom();
const exist = before[ID];
if (!exist) die(`${ID} not standing — this placer only reseats`);
const liveLib = exist.lib;
const atPin = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1;
if (!atPin) die(`${ID} live pose drift: pos=${exist.pos} yaw=${exist.yaw} scale=${exist.scale}`);
if (!(liveLib === `store/${PREV}.glb` || liveLib === `store/${SHA}.glb`))
    die(`${ID} live lib drift: ${liveLib}`);
if (liveLib === `store/${SHA}.glb`) {
    const bag = exist.comp ?? {};
    if (Object.keys(bag).length) die(`${ID} rerun expected empty comp bag, found ${JSON.stringify(bag)}`);
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", id: ID, lib: liveLib, pos: POS, yaw: YAW, verbs: 0 }));
    process.exit(0);
}
if (Object.keys(exist.comp ?? {}).length) die(`${ID} expected empty comp bag, found ${JSON.stringify(Object.keys(exist.comp))} — capture/reapply needed`);
// Live bbox gate: standing bbox must match the baseline decode before we
// trust the subset argument (x 9.4, z size 7.224 min −2.923 — the horn-cured
// improve-20 extents this edit preserves exactly).
(function satSanity() {
    const bb = exist.bbox;
    if (!bb || Math.abs(bb.size[0] - 9.4) > 0.05 || Math.abs(bb.size[2] - 7.224) > 0.05)
        die(`${ID} live bbox unexpected ${JSON.stringify(bb?.size)} — SAT assumptions stale`);
    console.log(JSON.stringify({ sat_preflight: "same-tuple re-place, new envelope x/z EQUAL + y strict subset (5.245 < 5.369)", live_bbox: bb.size, live_min_z: bb.min[2] }));
})();
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next ${ID} improve-34`);
u.searchParams.set("by", cfg.id);
let lib = "";
for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
    die(`${ID} upload ${r.status}`);
}
if (lib !== `store/${SHA}.glb`) die(`${ID} upload path ${lib} want ${SHA}`);
const verbs: Array<[string, any]> = [
    ["remove", { id: ID }],
    ["spawn", { id: ID, lib: `store/${SHA}.glb`, pos: POS, yaw: YAW, scale: 1 }],
];
await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 1600);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-improve34-longhouse", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
const after = await geom();
const now = after[ID];
if (!now) die(`${ID} gone after re-place`);
if (now.lib !== `store/${SHA}.glb`) die(`${ID} post-place lib ${now.lib}`);
if (!now.pos.every((n: number, i: number) => near(n, POS[i])) || !near(now.yaw, YAW)) die(`${ID} post-place pose drift ${now.pos} ${now.yaw}`);
const bag = now.comp ?? {};
if (Object.keys(bag).length) die(`${ID} comp bag not empty after re-place: ${JSON.stringify(bag)}`);
const nb = now.bbox;
if (!nb || Math.abs(nb.size[2] - 7.224) > 0.05 || Math.abs(nb.min[2] - (-2.923)) > 0.05)
    die(`${ID} post-place bbox z unexpected: ${JSON.stringify(nb)}`);
if (nb.max[1] > 5.369 + 0.01) die(`${ID} post-place y-max not subset: ${JSON.stringify(nb)}`);
const riders: any = {};
for (const rid of RIDERS) {
    const r = after[rid];
    if (!r) die(`rider/companion ${rid} missing after re-place`);
    riders[rid] = { lib: r.lib, pos: r.pos };
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: now.lib, pos: now.pos, yaw: now.yaw, compKeys: Object.keys(bag), bbox: nb.size, min_z: nb.min[2], verbs: verbs.length, riders }, null, 1));
