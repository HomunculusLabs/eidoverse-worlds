// next-place-improve17-belltower.ts — improve-17: nx-town-belltower
// re-place (remove+spawn, exact standing tuple) with the fixed GLB + the
// engine-1 ladder comp. commons-next only. Comp bag {} at baseline (census
// 17:30, this tick re-verified fresh). Rider nx-artwalk-b5-belltower-rings
// is a separate entity — untouched; keep-out differential proven identical
// at decode (83-char zone, nonzero). NO light companion entity exists.
// Live pin gate: baseline 30407b959aa14962 at the exact standing tuple, or
// the new pin (idempotent rerun expects the ladder comp present).
// Ladder comp (engine-1): entity-local AABB over the climb plane — stringers
// x −0.87/−0.63, rungs y 0.725..5.0, climb plane z 1.10. Box generously
// wraps the climber body: min[−0.98, 0.30, 0.98] max[−0.52, 5.15, 1.22]
// (clear of the belfry floor edge ±1.05). LOCAL coords — client applies
// yaw; server folds blindly (client not yet deployed; deploy is Bill's).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [6.5, 0, 6.5] as const;
const YAW = -2.356194490192345;
const SHA = "2419fbc53a1d65e1";
const PREV = "30407b959aa14962";
const ID = "nx-town-belltower";
const LADDER = { min: [-0.98, 0.30, 0.98], max: [-0.52, 5.15, 1.22] };
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_belltower3.glb`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h.slice(0, 16) !== SHA) die(`${ID} hash drift ${h}`);
const before = await geom();
const exist = before[ID];
if (!exist) die(`${ID} not standing — this placer only reseats`);
const liveLib = exist.lib;
const atPin = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1;
if (!atPin) die(`${ID} live pose drift: pos=${exist.pos} yaw=${exist.yaw} scale=${exist.scale}`);
if (!(liveLib === `store/${PREV.slice(0, 16)}.glb` || liveLib === `store/${SHA}.glb`))
    die(`${ID} live lib drift: ${liveLib}`);
if (liveLib === `store/${SHA}.glb`) {
    const bag = exist.comp ?? {};
    if (!(bag.ladder && JSON.stringify(bag.ladder.min) === JSON.stringify(LADDER.min) && JSON.stringify(bag.ladder.max) === JSON.stringify(LADDER.max)))
        die(`${ID} rerun expected ladder comp at the pinned box, found ${JSON.stringify(bag)}`);
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", id: ID, lib: liveLib, pos: POS, yaw: YAW, verbs: 0 }));
    process.exit(0);
}
if (Object.keys(exist.comp ?? {}).length) die(`${ID} expected empty comp bag, found ${JSON.stringify(Object.keys(exist.comp))} — capture/reapply needed`);
// SAT preflight: bbox unchanged (decode E1) and tuple unchanged → same-tuple
// re-place; the standing world placement already passed every placement gate
// (r10 plaza ring, core placement era). Fresh-census sanity: nearest core
// neighbor (carousel r8 disc R 3.29 at belltower-local (~0,−1.2) approx) —
// historical standing geometry; this edit changes nothing horizontal.
// Explicit skip is NOT waved: verify no NEW overlap via live bbox set.
(function satSanity() {
    const bb = exist.bbox;
    if (!bb || Math.abs(bb.size[0] - 3.4) > 0.05 || Math.abs(bb.size[2] - 3.4) > 0.05 || Math.abs(bb.size[1] - 7.6) > 0.05)
        die(`${ID} live bbox unexpected ${JSON.stringify(bb?.size)} — SAT assumptions stale`);
    console.log(JSON.stringify({ sat_preflight: "same-tuple re-place, bbox identical (decode E1)", live_bbox: bb.size }));
})();
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next ${ID} improve-17`);
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
    ["comp", { id: ID, type: "ladder", data: LADDER }],
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-improve17-belltower", avatar: cfg.avatar, token: cfg.joinToken }));
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
if (!bag.ladder) die(`${ID} ladder comp missing after comp verb`);
if (JSON.stringify(bag.ladder.min) !== JSON.stringify(LADDER.min) || JSON.stringify(bag.ladder.max) !== JSON.stringify(LADDER.max))
    die(`${ID} ladder comp drift ${JSON.stringify(bag.ladder)}`);
const rider = after["nx-artwalk-b5-belltower-rings"] ? { id: "nx-artwalk-b5-belltower-rings", pos: after["nx-artwalk-b5-belltower-rings"].pos, lib: after["nx-artwalk-b5-belltower-rings"].lib } : { id: "nx-artwalk-b5-belltower-rings", missing: true };
if ((rider as any).missing) die(`rider b5 missing after re-place: ${JSON.stringify(rider)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: now.lib, pos: now.pos, yaw: now.yaw, compKeys: Object.keys(bag), ladder: bag.ladder, verbs: verbs.length, rider }, null, 1));
