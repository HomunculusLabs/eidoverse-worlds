// next-refine-observatory-44.ts — struct-44 / improve row 25: close the
// drum's front bay above the door lintel (drum_head band 2.62→3.4).
// Re-place nx-struct-observatory at its EXACT current tuple with the new
// hash. Comp bag: empty before, stays empty. Companion light
// nx-struct-observatory-l already standing — verified, light verb only if
// missing. Idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [16.48, -0.052440113834802064, -40.8] as const;
const YAW = -0.3838824615170976;
const m = {
    id: "nx-struct-observatory",
    lightId: "nx-struct-observatory-l",
    lightPos: [16.48, 1.5, -40.8] as const,
    lightColor: 0xffc98a, lightIntensity: 1.1, lightRange: 7.0,
    file: "village_observatory3.glb",
    sha: "3d9d6ae17804c83da4aa2fe1075c2925518df10e75abc69cf20b09087f4d6624",
    comp: {},
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
if (!(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp))) die(`${m.id} tuple drift — refusing`);
const light = before[m.lightId];
const lightOK = !!light && light.kind === "light" && light.pos.every((n: number, i: number) => near(n, m.lightPos[i]));

let verbs: Array<[string, any]> = [];
if (exist.lib !== `store/${m.sha.slice(0, 16)}.glb`) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-44 row-25 bay closure`);
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
    // comp-wipe law: re-apply every comp (none — empty bag)
}
if (!lightOK) verbs.push(["light", { id: m.lightId, pos: m.lightPos, color: m.lightColor, intensity: m.lightIntensity, range: m.lightRange }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct44-refine", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
else console.log("already placed — no verbs");
const after = await geom();
const e = after[m.id];
if (!(e?.lib === `store/${m.sha.slice(0, 16)}.glb` && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`post-place failed`);
const l2 = after[m.lightId];
if (!(!!l2 && l2.kind === "light" && l2.pos.every((n: number, i: number) => near(n, m.lightPos[i])))) die(`light post-place failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, lightId: m.lightId, verbs: verbs.length }));
