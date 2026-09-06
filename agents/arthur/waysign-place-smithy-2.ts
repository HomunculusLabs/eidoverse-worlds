// waysign-place-smithy-2.ts — waysign-8: nx-sign-smithy re-place (remove+
// spawn, same pose) with the emblem-fixed GLB. commons-next only. Waysign
// domain (nx-sign-*); host nx-court is read-only (artwalk-39 host-truth
// re-derived THIS tick: live lib 59534b10 = local village_court3.glb exact;
// sign hangs on the court END WALL, court-local (6.131,-1.399), plate flush
// on wall face x=6.10 in the timber band y<2.915 — wall station verified in
// the CURRENT host decode before this edit).
// SAT-NEUTRAL: plan envelope x[-0.03,0.70] z[±0.12] byte-identical to the
// standing build (improve-6 precedent); only y grows 2.45→2.561, still under
// the court eave. Comp bag {} both sides (fresh census this tick).
// Standing pin gate: live lib must be the heritage baseline d8df9400… at the
// exact standing tuple, or already the new pin (idempotent).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [23.777264390384975, -1.5946487083102603e-08, -10.831474824789108] as const;
const YAW = -0.90756;
const SHA = "62a8c7fc94ff77ff";
const PREV = "d8df94003084af390e4f6ef0e15f5d13ade33f8e98ad101b7b0408a9dda577e0";
const HOST = "nx-court";
const HOST_LIB = "store/59534b10122e6b47.glb";
const ID = "nx-sign-smithy";
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_sign_smithy.glb`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== "62a8c7fc94ff77ff9a443b51efe7f04cbf68016037498e556cb0b45c4a07822d") die(`${ID} hash drift ${h}`);
const before = await geom();
const host = before[HOST];
if (!host || host.lib !== HOST_LIB) die(`host ${HOST} lib drift: ${host?.lib}`); // artwalk-39: host truth re-verified
const exist = before[ID];
if (!exist) die(`${ID} not standing — this placer only reseats`);
const liveLib = exist.lib;
const atPin = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1;
if (!atPin) die(`${ID} live pose drift: pos=${exist.pos} yaw=${exist.yaw} scale=${exist.scale}`);
if (!(liveLib === `store/${PREV.slice(0, 16)}.glb` || liveLib === `store/${SHA}.glb`))
    die(`${ID} live lib drift: ${liveLib}`);
if (liveLib === `store/${SHA}.glb`) {
    if (Object.keys(exist.comp ?? {}).length) die(`${ID} unexpected comp bag on rerun`);
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", id: ID, lib: liveLib, pos: POS, yaw: YAW, compKeys: [], verbs: 0 }));
    process.exit(0);
}
if (Object.keys(exist.comp ?? {}).length) die(`${ID} expected empty comp bag, found ${JSON.stringify(Object.keys(exist.comp))} — capture/reapply needed`);
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next ${ID} waysign-8`);
u.searchParams.set("by", cfg.id);
let lib = "";
for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await sleep(25_000); continue; } // shared 4/min/IP budget
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-waysign-8-smithy", avatar: cfg.avatar, token: cfg.joinToken }));
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
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: `store/${SHA}.glb`, pos: POS, yaw: YAW, compKeys: [], verbs: 2 }));
