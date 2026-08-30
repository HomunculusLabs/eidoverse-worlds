// next-refine-shelltower.ts — struct-17 REFINE: Shell Tower floating base.
// Re-place nx-struct-shelltower at its EXACT standing tuple with the new
// hash (six footing pads under the first ribbon turn) + re-apply the crown
// socket comp (comp-wipe law). Pose-gated; idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-2.65, -0.05202600128766878, -37.91] as const;
const YAW = 0.06978887730267769;
const m = {
    id: "nx-struct-shelltower",
    file: "village_shelltower3.glb",
    sha: "bfdb1792374586e6ef7aba87cf09991848c750b0debe62d2936a9e54aee7fce5",
    bbox: { min: [-4.05, -0.0, -4.05], max: [4.05, 8.07, 4.05] },
    comp: { sockets: { crown: { pos: [0, 7.45, 0], yaw: 0 } } },
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const canon = (v: any): any => Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`hash drift ${h}`);
const before = await geom();
const exist = before[m.id];
if (!exist) die(`${m.id} not live — refine tick requires the standing entity`);
if (!(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1)) die(`${m.id} tuple drift — refusing`);
let verbs: Array<[string, any]> = [];
const needComp = !eq(exist.comp ?? {}, m.comp);
if (exist.lib !== `store/${m.sha.slice(0, 16)}.glb`) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-17 refine`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== `store/${m.sha.slice(0, 16)}.glb`) die(`upload path ${lib}`);
    verbs = [["spawn", { id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, pos: POS, yaw: YAW, scale: 1 }]];
}
if (exist.lib !== `store/${m.sha.slice(0, 16)}.glb` || needComp)
        verbs.push(["comp", { id: m.id, type: "sockets", data: { crown: { pos: [0, 7.45, 0], yaw: 0 } } }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct17-refine", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
else console.log("already refined — no verbs");
const after = await geom();
const e = after[m.id];
if (!(e?.lib === `store/${m.sha.slice(0, 16)}.glb` && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`post-place failed`);
console.log(JSON.stringify({ status: "REFINED_VERIFIED", id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, verbs: verbs.length }));
