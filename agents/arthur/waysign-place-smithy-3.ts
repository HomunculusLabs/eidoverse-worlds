// waysign-place-smithy-3.ts — waysign-16: nx-sign-smithy re-place (remove+
// spawn, same pose) with the v3 brace-fixed GLB. commons-next only. Waysign
// domain (nx-sign-*); host nx-court read-only. Host truth re-verified fresh
// this tick (census 15:2x): live lib 59534b10, sign at
// [23.777264, -1.59e-08, -10.831475] yaw -0.90756 — the exact waysign-8
// pin, unchanged. SAT-NEUTRAL: envelope x/z byte-identical (decode:
// x [-0.03,0.70] z [-0.12,0.12] both builds); y-max SHRINKS 2.561->2.450
// (the floating v2 brace tip removed). Comp bag {} both sides (fresh
// census this tick). Standing pin gate: live lib must be the waysign-8
// emblem-fix pin 62a8c7fc… at the exact tuple, or already v3 (idempotent).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [23.777264390384975, -1.5946487083102603e-08, -10.831474824789108] as const;
const YAW = -0.90756;
const SHA = "3522e5ab0c3a5100";
const PREV = "62a8c7fc94ff77ff9a443b51efe7f04cbf68016037498e556cb0b45c4a07822d";
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
if (h !== "3522e5ab0c3a5100bc2afadf0bf33126a9e8ecd905e542544e495fd7184d80a6") die(`${ID} hash drift ${h}`);
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
u.searchParams.set("name", `commons-next ${ID} waysign-16`);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-waysign-16-smithy", avatar: cfg.avatar, token: cfg.joinToken }));
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
