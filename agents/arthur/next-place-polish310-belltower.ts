// next-place-polish310-belltower.ts — polish-310: nx-town-belltower rope
// thicken re-place (remove+spawn, exact standing tuple). polish-308 chassis
// verbatim with pins advanced: PREV 3e4f470b (polish-308 crown bell-gold,
// current live) -> SHA b0b1e276 (rope family 0.018->0.030 / knot 0.035->0.055
// / tail 0.014->0.024, 6 segments). Same hemp material, same positions:
// footprint, bbox height 7.9, ladder comp box all unchanged. Ladder comp
// captured-before-spawn and replayed verbatim; rider b5 verified standing
// post-place. commons-next only.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [6.5, 0, 6.5] as const;
const YAW = -2.356194490192345;
const SHA = "b0b1e2766e145c02";
const PREV = "3e4f470b38d94bb7";
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
// SAT preflight: same-tuple re-place, rope-only thickness change; footprint
// 3.4 and height 7.9 both unchanged from the polish-308 build — explicit
// bbox gate so SAT assumptions are provably current.
(function satSanity() {
    const bb = exist.bbox;
    if (!bb || Math.abs(bb.size[0] - 3.4) > 0.05 || Math.abs(bb.size[2] - 3.4) > 0.05 || Math.abs(bb.size[1] - 7.9) > 0.05)
        die(`${ID} live bbox unexpected ${JSON.stringify(bb?.size)} — SAT assumptions stale`);
    console.log(JSON.stringify({ sat_preflight: "same-tuple re-place, rope-only, bbox unchanged", live_bbox: bb.size }));
})();
// CAPTURE the complete live comp bag BEFORE spawn (re-place wipes comps).
const liveBag = exist.comp ?? {};
const bagKeys = Object.keys(liveBag).sort();
if (JSON.stringify(bagKeys) !== JSON.stringify(["ladder"])) die(`${ID} unexpected live comp bag ${JSON.stringify(bagKeys)} — recapture needed`);
if (JSON.stringify(liveBag.ladder?.min) !== JSON.stringify(LADDER.min) || JSON.stringify(liveBag.ladder?.max) !== JSON.stringify(LADDER.max))
    die(`${ID} live ladder box drifted ${JSON.stringify(liveBag.ladder)}`);
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next ${ID} polish-310`);
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
    ["comp", { id: ID, type: "ladder", data: liveBag.ladder }],
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-polish310-belltower", avatar: cfg.avatar, token: cfg.joinToken }));
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
const nb = now.bbox;
if (!nb || Math.abs(nb.size[1] - 7.9) > 0.06) die(`${ID} post-place bbox height ${JSON.stringify(nb?.size)} want 7.9`);
const rider = after["nx-artwalk-b5-belltower-rings"] ? { id: "nx-artwalk-b5-belltower-rings", pos: after["nx-artwalk-b5-belltower-rings"].pos, lib: after["nx-artwalk-b5-belltower-rings"].lib } : { id: "nx-artwalk-b5-belltower-rings", missing: true };
if ((rider as any).missing) die(`rider b5 missing after re-place: ${JSON.stringify(rider)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: now.lib, pos: now.pos, yaw: now.yaw, bbox: nb.size, compKeys: Object.keys(bag), ladder: bag.ladder, verbs: verbs.length, rider }, null, 1));
