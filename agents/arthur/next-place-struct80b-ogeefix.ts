// next-place-struct80b-ogeefix.ts — struct-80b: OGEE GATE yaw-unit repair.
// struct-77's placer sent yaw -32.68 (its own comment says "deg") but wire
// yaw is RADIANS, applied verbatim to rotation.y (models.js:77, fold.js) —
// the gate stands at effective 287.6deg instead of the designed 327.3deg
// (opening axis on the NE lane-002 tangent, the pose struct-77's own SAT
// scan approved at +5.37 conservative). Fix: re-place SAME id at the SAME
// pos with yaw -0.5703735995517468 rad (= -32.68deg), comp {} both sides
// (verified live), same lib store/32039b5a7fb9da30.glb. Spawn does NOT
// move a standing entity: remove then spawn over the same WS.
// Idempotent: second run sees the exact pinned tuple and emits zero verbs.
import { readFileSync } from "node:fs";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [22.71, -0.0025, 65.75] as const;
const YAW = -0.5703735995517468; // -32.68deg in radians
const m = {
    id: "nx-struct-ogeegate",
    lib: "store/32039b5a7fb9da30.glb",
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
const before = await geom();
const exist = before[m.id];
if (!exist) die(`${m.id} missing — this is a repair reseat, not a first placement`);
const alreadyExact = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp) && exist.lib === m.lib;
if (alreadyExact) {
    console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: m.lib, pos: POS, yaw: YAW, verbs: 0, note: "already at pinned tuple — idempotent no-op" }));
} else {
    if (!(exist.pos.every((n: number, i: number) => near(n, POS[i])) && exist.lib === m.lib && exist.scale === 1)) die(`${m.id} unexpected live state (pos/lib/scale drifted): pos=${exist.pos} lib=${exist.lib} — aborting, re-derive`);
    console.log(`live yaw ${exist.yaw} -> fix ${YAW} rad (unit repair, same pos/lib)`);
    const verbs: Array<[string, any]> = [
        ["remove", { id: m.id }],
        ["spawn", { id: m.id, lib: m.lib, pos: POS, yaw: YAW, scale: 1 }],
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
        ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct80-ogeefix", avatar: cfg.avatar, token: cfg.joinToken }));
        ws.onerror = () => reject(Error("websocket error"));
        ws.onmessage = (ev: any) => {
            const x = JSON.parse(ev.data);
            if (x.type === "error") reject(Error(`server ${x.error}`));
            else if (x.type === "snapshot") joined = true;
        };
    });
    const after = await geom();
    const e = after[m.id];
    if (!(e?.lib === m.lib && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
    console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: m.lib, pos: POS, yaw: YAW, verbs: verbs.length }));
}
