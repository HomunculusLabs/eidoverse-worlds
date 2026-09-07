// improve33-place-windmill.ts — improve-33 EXECUTION reseat: nx-town-windmill
// remove+spawn at the exact standing tuple with the sail-cure GLB (sha
// 369c572480b0e786…, deterministic ×2). commons-next only. Comp bag captured
// fresh pre-place and re-applied verbatim post-spawn (comp-wipe law — census
// hint says a sails motion comp may exist). SAT-neutral: envelope element-
// equal to the live build (audit improve33-decode-windmill.ts). Riders
// nx-artwalk-b10… + nx-sign-mill-001 are separate entities — verified standing
// pre- and post-place, untouched.
// Standing-pin gate: live lib must be 0993836012d1b17d at the exact standing
// tuple, or already the new pin (idempotent rerun).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-40, 0, 0] as const;
const YAW = 1.5707963267948966;
const SHA = "369c572480b0e786";
const PREV = "0993836012d1b17d";
const ID = "nx-town-windmill";
const RIDER = "nx-artwalk-b10-windmill-four-wind-crown";
const SIGN = "nx-sign-mill-001";
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_windmill3.glb`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h.slice(0, 16) !== SHA) die(`${ID} hash drift ${h}`);
const before = await geom();
const exist = before[ID];
if (!exist) die(`${ID} not standing — this placer only reseats`);
if (!(before[RIDER] && before[SIGN])) die(`rider/sign not standing pre-place (rider:${!!before[RIDER]} sign:${!!before[SIGN]})`);
const liveLib = exist.lib;
const atPin = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1;
if (!atPin) die(`${ID} live pose drift: pos=${exist.pos} yaw=${exist.yaw} scale=${exist.scale}`);
if (!(liveLib === `store/${PREV.slice(0, 16)}.glb` || liveLib === `store/${SHA}.glb`))
    die(`${ID} live lib drift: ${liveLib}`);
if (liveLib === `store/${SHA}.glb`) {
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", id: ID, lib: liveLib, pos: POS, yaw: YAW, riderStanding: true, signStanding: true, verbs: 0 }));
    process.exit(0);
}
// comp bag capture (comp-wipe law): whatever is live, re-apply verbatim.
// The census entity carries comp as an OBJECT ({}) when empty — coerce
// to array strictly (the artwalk-32 class lesson: first run died at
// for-of on {} AFTER upload, verbs never sent).
const compBag: any[] = Array.isArray(exist.comp) ? exist.comp
    : Array.isArray(exist.comps) ? exist.comps
    : [];
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next ${ID} improve-33`);
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
for (const comp of compBag) verbs.push(["comp", { id: ID, ...comp }]);
const verbs2 = verbs.length;
await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 120_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 1600);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-improve33-windmill", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
const after = await geom();
const e = after[ID];
if (!(e?.lib === `store/${SHA}.glb` && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1))
    die(`${ID} post-place failed`);
const bagAfter = JSON.stringify(Array.isArray(e.comp) ? e.comp : Array.isArray(e.comps) ? e.comps : []);
const bagWant = JSON.stringify(compBag);
if (bagAfter !== bagWant) die(`${ID} comp bag mismatch after re-place: ${bagAfter} vs ${bagWant}`);
if (!after[RIDER]) die(`${ID} rider b10 gone after reseat`);
if (!after[SIGN]) die(`${ID} sign gone after reseat`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: `store/${SHA}.glb`, pos: POS, yaw: YAW, comps: compBag.length, rider: RIDER, sign: SIGN, verbs: verbs2 }));
