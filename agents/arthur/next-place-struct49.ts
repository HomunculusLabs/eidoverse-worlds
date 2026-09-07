// next-place-struct49.ts — struct-49: R4-2 THE BRIDGE OF NINES placement
// (recovery of interrupted pre-place window, artwalk-32 class: build +
// review frames landed on disk 20:05-20:11, live untouched, no ledger —
// placed fresh this tick, interruption named here).
// commons-next only. Entity nx-struct-ninesbridge (structures lane).
// Two-pass chassis: hash gate -> fresh live SAT w/ exemptions -> upload
// with 429 pacing -> spawn -> post-place tuple verify -> idempotent.
// Site: S-axis spoke, center (-7.28, PY, 69.62), yaw -1.67552 — span
// ALONG the plaza->S axis so the north stair meets the village-side walk
// line and the crossing is made over the deck (the iron spine makes the
// arcade solid at grade: recesses, not passages — by design).
// Pre-scan (placer-law math, census epoch this tick): min gap 7.33m to
// nx-struct-echoarch; all entities >= 1.4m. Terrain 5-point spread on the
// true final-pose axis: 12mm over 29m (flat).
// Gates honest: 24.3 x 3.1 = 75.3m2 >= 16, height 2.47 >= 2.2 -> real
// trimesh, walkable deck. Stair rises 0.2133 <= 0.25 threshold law. Deck
// walk lane ~1.5m clear between parapets >= 1.4.
// Empty comp bag (static folly). No existing id expected — first placement.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-7.28, 0.02764016019864407, 69.62] as const;
const YAW = -1.67552; // span along the S axis; north stair faces the village
const m = {
    id: "nx-struct-ninesbridge",
    file: "village_ninesbridge3.glb",
    sha: "1e4e84e98900d89c5a67f17198581225c63fa23328c0c16de93ac05e3b44f2fc",
    bbox: { min: [-12.15, -0.0, -1.55], max: [12.15, 2.47, 1.55] },
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
// Gates honest: 75.3m2 >= 16, 2.47 >= 2.2 -> real trimesh.
if (!((24.3 * 3.1) >= 16 && 2.47 >= 2.2)) die("room gate law drift");

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
const T = obb([...POS], YAW, m.bbox);
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (!e.bbox || e.id === m.id) continue;
    const bb = e.bbox;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;       // ground layer
    if (bb.min[1] > 4.5) continue;                     // suspended decor
    if (gap(T, obb(e.pos, e.yaw ?? 0, bb)) < 1.4) collisions.push(e.id);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions}`);
const exist = before[m.id];
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp))) die(`${m.id} live tuple drift (reseat refuses to move)`);
const wantLib = `store/${m.sha.slice(0, 16)}.glb`;

let verbs: Array<[string, any]> = [];
if (!exist || exist.lib !== wantLib) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-49`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`${m.id} upload ${r.status}`);
    }
    if (lib !== wantLib) die(`${m.id} upload path ${lib}`);
    // first placement: plain spawn (no standing id to remove)
    verbs = exist
        ? [["remove", { id: m.id }], ["spawn", { id: m.id, lib: wantLib, pos: POS, yaw: YAW, scale: 1 }]]
        : [["spawn", { id: m.id, lib: wantLib, pos: POS, yaw: YAW, scale: 1 }]];
}
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct49-ninesbridge", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
else console.log(`${m.id} already live — no verbs`);

const after = await geom();
const e = after[m.id];
if (!(e?.lib === `store/${m.sha.slice(0, 16)}.glb` && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, pos: POS, yaw: YAW, verbs: verbs.length }));
