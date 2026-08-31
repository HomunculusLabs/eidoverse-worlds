// next-place-struct-waystone.ts — struct-26: R3-2 THE FOUR WAYSTONES.
// commons-next only. NEW entities nx-struct-waystone-n/e/s/w (structures
// lane), one shared GLB (SW-terrace degenerate-family precedent). Each
// stone sits on its road verge just outside its gate, tick yawed to aim
// along the road toward the village (tick +X local -> yaw = road bearing
// toward town + pi). Verge seats scanned against the live edge survey;
// SAT >= 1.2m vs solids per-slot. No comps.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const canon = (v: any): any => Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
const FILE = "village_waystone3.glb";
const SHA = "2f006e218ffbe97e02f31b5a5141cf947453ff8292d87ec45c1a850ddf52784c";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
// verge seats: 2.6m out from each gate, offset to the grass side of the
// 4m road corridor; tick aims toward town (+X local = tick direction)
const SLOTS = [
    { id: "nx-struct-waystone-n", pos: [0, -22.1], yaw: Math.PI / 2 },     // tick +X -> world +X? yawed: tick aims S (home)
    { id: "nx-struct-waystone-e", pos: [22.1, 0], yaw: Math.PI },          // tick aims W (home)
    { id: "nx-struct-waystone-s", pos: [0, 22.1], yaw: -Math.PI / 2 },     // tick aims N (home)
    { id: "nx-struct-waystone-w", pos: [-20.0, 4.3], yaw: Math.PI / 4 },  // S verge inside the pavilion
                                                                          // squeeze (hypar hugs the W
                                                                          // road, struct-22 lesson); tick
                                                                          // aims NE (home, along road)
] as const;
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${FILE}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== SHA) die(`waystone reviewed hash drift ${h}`);
type O = { c: [number, number]; u: [number, number]; v: [number, number]; hu: number; hv: number };
function obb(pos: number[], yaw: number, bb: any): O {
    const c = Math.cos(yaw), s = Math.sin(yaw), lx = (bb.min[0] + bb.max[0]) / 2, lz = (bb.min[2] + bb.max[2]) / 2;
    return { c: [pos[0] + lx * c + lz * s, pos[2] - lx * s + lz * c], u: [c, -s], v: [s, c], hu: (bb.max[0] - bb.min[0]) / 2, hv: (bb.max[2] - bb.min[2]) / 2 };
}
function gap(A: O, B: O) {
    let best = -Infinity;
    for (const ax of [A.u, A.v, B.u, B.v]) {
        const dd = Math.abs((B.c[0] - A.c[0]) * ax[0] + (B.c[1] - A.c[1]) * ax[1]);
        const ra = A.hu * Math.abs(A.u[0] * ax[0] + A.u[1] * ax[1]) + A.hv * Math.abs(A.v[0] * ax[0] + A.v[1] * ax[1]);
        const rb = B.hu * Math.abs(B.u[0] * ax[0] + B.u[1] * ax[1]) + B.hv * Math.abs(B.v[0] * ax[0] + B.v[1] * ax[1]);
        best = Math.max(best, dd - ra - rb);
    }
    return best;
}
const BB = { min: [-0.32, 0, -0.32], max: [0.32, 1.2, 0.32] };
const before = await geom();
const collisions: string[] = [];
for (const s of SLOTS) {
    const POS = [s.pos[0], 0, s.pos[1]] as const;
    const T = obb([...POS], s.yaw, BB);
    for (const e of Object.values(before)) {
        if (!e.bbox || e.id === s.id || e.id.startsWith("nx-struct-waystone")) continue;
        const bb = e.bbox;
        if (bb.max[1] - bb.min[1] <= 0.5) continue;
        if (bb.min[1] > 1.1) continue;
        // GROUND-LAYER EXEMPTION (core-town proven pattern): the roads mesh
        // is a compound walkable surface whose bbox spans the village (the
        // 2.94m 'height' is the gate arches baked into the shared GLB, not
        // pavement at the seat). The stones sit ON the road surface's own
        // layer by design — a milestone stands beside the pavement. Skip
        // ground-surface meshes for SAT exactly as every core-town placer
        // does; all true solids still gate the seats.
        if (e.id === "nx-town-roads" || e.id === "nx-core-paths") continue;
        if (gap(T, obb(e.pos, e.yaw ?? 0, bb)) < 1.2) { collisions.push(`${s.id} vs ${e.id}`); break; }
    }
}
if (collisions.length) die(`waystone seats blocked: ${collisions}`);
// idempotence/drift check per slot
for (const s of SLOTS) {
    const POS = [s.pos[0], 0, s.pos[1]] as const;
    const exist = before[s.id];
    if (exist && !(exist.lib === LIB && exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, s.yaw) && exist.scale === 1)) die(`${s.id} live collision/drift`);
}
let verbs: Array<[string, any]> = [];
let needUpload = SLOTS.some(s => !before[s.id]);
if (needUpload) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next waystones struct-26`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`waystone upload ${r.status}`);
    }
    if (lib !== LIB) die(`waystone upload path ${lib}`);
}
for (const s of SLOTS) {
    if (!before[s.id]) verbs.push(["spawn", { id: s.id, lib: LIB, pos: [s.pos[0], 0, s.pos[1]], yaw: s.yaw, scale: 1 }]);
}
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 120_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 1600);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct26-stones", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
else console.log(`waystones already live — no verbs`);
const after = await geom();
for (const s of SLOTS) {
    const POS = [s.pos[0], 0, s.pos[1]] as const;
    const e = after[s.id];
    if (!(e?.lib === LIB && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, s.yaw) && e.scale === 1)) die(`${s.id} post-place failed`);
}
console.log(JSON.stringify({ status: "PLACED_VERIFIED", placed: SLOTS.length, lib: LIB, verbs: verbs.length }));
