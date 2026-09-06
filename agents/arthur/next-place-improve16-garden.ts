// next-place-improve16-garden.ts — improve-16: nx-town-garden-cottage
// re-place (remove+spawn, exact standing tuple) with the fixed GLB.
// commons-next only. Comp bag {} (census-fresh this tick). Rider
// nx-artwalk-b17-garden-seed-lattice and light companion
// nx-town-garden-cottage-l are separate entities — untouched. Live pin gate:
// baseline 872aec35e3aa43b3 at the exact standing tuple, or the new pin
// (idempotent rerun). SAT preflight vs fresh census for the two post-cap
// corner growths (0.105m, away from the carousel side).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-26, 0.0009494488404761625, 19] as const;
const YAW = 2.2004415094410525;
const SHA = "cee52aca03429a62";
const PREV = "872aec35e3aa43b3";
const ID = "nx-town-garden-cottage";
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_garden_cottage.glb`));
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
    if (Object.keys(exist.comp ?? {}).length) die(`${ID} unexpected comp bag on rerun`);
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", id: ID, lib: liveLib, pos: POS, yaw: YAW, verbs: 0 }));
    process.exit(0);
}
if (Object.keys(exist.comp ?? {}).length) die(`${ID} expected empty comp bag, found ${JSON.stringify(Object.keys(exist.comp))} — capture/reapply needed`);
// SAT preflight — struct-19 law: round works need exact disc-vs-OBB, never
// the square proxy (my first square gate read gap 0 = pure inflation
// artifact). Carousel base-ring disc R 3.29 at garden-local (−3.903, 7.055):
// standing clearance 1.065m (artwalk-27 historical pin 1.061, 4mm agree) —
// ALLOWED_ADJACENT (standing since placement; four sweep tier-2 walk cycles
// 0.355m through the area). Binding face is +z (UNCHANGED by this edit;
// growth is −x/−z, opposite the carousel). Gate = regression only.
const gal = before["nx-carousel"];
if (gal) {
    const cg = Math.cos(YAW), sg = Math.sin(YAW);
    const dx = gal.pos[0] - POS[0], dz = gal.pos[2] - POS[2];
    const lx = dx * cg - dz * sg, lz = dx * sg + dz * cg;
    const R = 3.29; // carousel base ring (artwalk-27 measurement class)
    const cx = -0.3, cz = -0.55, hx = 4.75, hz = 3.25; // post-growth halves (−x grows only; +z binding face UNCHANGED) + bbox-center offset
    const du = Math.abs(lx - cx) - hx, dv = Math.abs(lz - cz) - hz;
    const dist = Math.hypot(Math.max(du, 0), Math.max(dv, 0));
    const gap = dist - R;
    console.log(JSON.stringify({ sat_preflight: "carousel disc-vs-OBB (base ring)", gap: +gap.toFixed(3), allowed_adjacent: 1.061, binding_face: "+z unchanged" }));
    if (gap < 1.061 - 0.05) die(`carousel clearance regression: ${gap.toFixed(3)} vs allowed 1.061`);
}
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next ${ID} improve-16`);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-improve16-garden", avatar: cfg.avatar, token: cfg.joinToken }));
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
const riders = ["nx-artwalk-b17-garden-seed-lattice", "nx-town-garden-cottage-l"].map((id) => after[id] ? { id, pos: after[id].pos, lib: after[id].lib } : { id, missing: true });
if (riders.some((r: any) => r.missing)) die(`companion/rider missing after re-place: ${JSON.stringify(riders)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: now.lib, pos: now.pos, yaw: now.yaw, verbs: verbs.length, riders }, null, 1));
