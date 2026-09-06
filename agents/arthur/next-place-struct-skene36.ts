// next-place-struct-skene36.ts — struct-36: SKENE WALL lib upgrade (improve
// round-1 row 11 fix: wall-body void). commons-next only, nx-struct-skene
// (structures lane). Lib upgrade at the EXACT standing tuple — remove then
// spawn over one WS (improve-6/8 precedent), empty comp bag both sides.
// sha 3a62ee83d559b3fa… (live) -> df7f7c434c0b87b2… (candidate, deterministic
// x2). SAT preflight vs fresh live set with the standing exemptions; bbox
// x/z byte-identical, y 2.03->2.07 (finial bead 0.07->0.11).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-23.32, 0.044719111122435394, 48.05] as const;
const YAW = Math.PI;
const OLD = { id: "nx-struct-skene", lib: "store/3a62ee83d559b3fa.glb", bbox: { min: [-4.83, -0.0, -0.26], max: [4.83, 2.03, 1.01] } };
const m = {
    id: "nx-struct-skene",
    file: "village_skene3.glb",
    sha: "df7f7c434c0b87b2e7aa5e9d8423299edcb40944d4d5a42df9291aea76a7f157",
    bbox: { min: [-4.83, -0.0, -0.26], max: [4.83, 2.07, 1.01] },
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
if (h !== m.sha) die(`${m.id} reviewed hash drift ${h}`);
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
const before = await geom();
const live = before[m.id];
if (!live) die(`${m.id} not live — this is an upgrade placer, not a fresh seat`);
// idempotent rerun: already at the new lib at the exact tuple -> zero verbs
if (live.lib === `store/${m.sha.slice(0, 16)}.glb`) {
    if (!(live.pos.every((n: number, i: number) => near(n, POS[i])) && near(live.yaw, YAW) && live.scale === 1 && eq(live.comp ?? {}, m.comp))) die(`${m.id} live drift at new lib`);
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", id: m.id, lib: live.lib }));
    process.exit(0);
}
// otherwise live must be the EXACT old contract (pos/yaw/scale/comp) — any other drift hard-fails
if (!(live.lib === OLD.lib && live.pos.every((n: number, i: number) => near(n, POS[i])) && near(live.yaw, YAW) && live.scale === 1 && eq(live.comp ?? {}, m.comp))) die(`${m.id} live drift vs struct-14 contract: ${live.lib} ${live.pos}`);
// SAT preflight: NEW bbox at the same pose vs fresh live set (self excluded)
const T = obb([...POS], YAW, m.bbox);
const collisions: string[] = [];
// STANDING-PRECEDENT fat-bbox exemption (struct-19/struct-26 class, measured
// this tick): nx-approach-nw-lane-001's AABB is a fat proxy for a diagonal paver
// strip + baked lamps — true nearest lane vertex is 19.37m from the skene
// OBB (wlamp_pan_1 at (-47.52, 46.81), decode of exact live bytes d46a60fb).
// The empty AABB corner at x -29.4 is void; the skene west pier ends -28.49.
const SAT_EXEMPT = new Set(["nx-approach-nw-lane-001"]);
for (const e of Object.values(before)) {
    if (!e.bbox || e.id === m.id) continue;
    if (SAT_EXEMPT.has(e.id)) continue;          // named fat-bbox exemption
    const bb = e.bbox;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;       // ground layer
    if (bb.min[1] > 1.9) continue;                     // suspended decor
    if (gap(T, obb(e.pos, e.yaw ?? 0, bb)) < 1.4) collisions.push(e.id);
}
if (collisions.length) die(`skene seat blocked (<1.4m clear): ${collisions}`);

// upload candidate bytes (content-addressed; 429-paced)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next ${m.id} struct-36`);
u.searchParams.set("by", cfg.id);
let lib = "";
for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
    die(`${m.id} upload ${r.status}`);
}
if (lib !== `store/${m.sha.slice(0, 16)}.glb`) die(`${m.id} upload path ${lib}`);

// remove then spawn over ONE WebSocket (proven reseat shape)
await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, sent = 0;
    const verbs = [
        ["remove", { id: m.id }],
        ["spawn", { id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, pos: POS, yaw: YAW, scale: 1 }],
    ] as Array<[string, any]>;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || sent >= verbs.length) return;
        const [verb, args] = verbs[sent++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (sent === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 1600);
    }, 700);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct36-skene", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});

const after = await geom();
const e = after[m.id];
if (!(e?.lib === `store/${m.sha.slice(0, 16)}.glb` && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: e.lib, pos: POS, yaw: YAW, verbs: 2 }));
