// waysign-place-kiln-2.ts — waysign-10: nx-sign-kiln-001 re-place (remove+
// spawn, same pose) with the R2-3 emblem-fixed GLB. commons-next only.
// Waysign domain (nx-sign-*); host nx-town-kiln is read-only
// (artwalk-39 host truth re-verified THIS tick: live lib 4d8ef8fc = local
// village_kiln3.glb exact; sign anchor host-local (0,2.45,0.86) — straps
// circle the upper drum, board hangs past+above the b12 film — unchanged
// from waysign-3).
// SAT-NEUTRAL: decoded envelope x[±0.888] z[−1.748,0.665] y-ext 0.977
// BYTE-IDENTICAL to the standing build (live census bbox [1.776,0.977,2.413]
// matches); all v5 edits are inside the bone face envelope. Comp bag {}
// both sides (fresh census this tick). Standing pin gate: live lib must be
// the waysign-3 baseline be3d8504… at the exact standing tuple, or already
// the new pin (idempotent).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [30.470617220544632, 2.45, 38.32224350035126] as const;
const YAW = -2.4784945651581642;
const SHA = "ecbad90311fc9bff";
const PREV = "be3d85045b3351010af28922f53267821ef3d51fdfbacfd674bdf8b134e507b5";
const HOST = "nx-town-kiln";
const HOST_LIB = "store/4d8ef8fc0b0955de.glb";
const ID = "nx-sign-kiln-001";
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_sign_kiln3.glb`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== "ecbad90311fc9bff5b5a59c20ec79b432bf35f109304394a51e590c0c0ed30c3") die(`${ID} hash drift ${h}`);
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
u.searchParams.set("name", `commons-next ${ID} waysign-10`);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-waysign-10-kiln", avatar: cfg.avatar, token: cfg.joinToken }));
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
