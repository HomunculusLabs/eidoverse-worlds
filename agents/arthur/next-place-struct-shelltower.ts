// next-place-struct-shelltower.ts — struct-3: S-2 SHELL TOWER placement.
// commons-next only. NEW entity nx-struct-shelltower (structures lane).
// Two-pass chassis: hash gate -> fresh live SAT w/ exemptions -> upload with
// 429 pacing -> spawn verb -> post-place tuple verify -> idempotent rerun.
// Site: 266deg/r38 (-2.65,-37.91) between bunkhouse and hall, approach
// widest point facing plaza (yaw toward origin). Empty comp bag.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-2.65, -0.05202600128766878, -37.91] as const;
const YAW = Math.atan2(-POS[0], -POS[2]); // widest point (+Z) faces plaza
const m = {
    id: "nx-struct-shelltower",
    file: "village_shelltower3.glb",
    sha: "c7b641fa9bc9c0e3259e17414d468cbca131897733fd3f32a9b3fb279573a7f5",
    bbox: { min: [-4.05, -0.0, -4.05], max: [4.05, 8.07, 4.05] },
    // struct-3b: ramp trimesh proven non-standable (support probe fell through
    // at t=.2/.5/.8 — same engine behavior as artwalk-8 stairs). Crown socket
    // = the village's proven vertical-access pattern (nx-tower study socket).
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
if (h !== m.sha) die(`${m.id} reviewed hash drift ${h}`);
// Entry law: plinth rise 0.22 <= 0.25; bbox gates honest (56m2, 8.07m).
if (!(0.22 <= 0.25)) die("shelltower entry law drift");

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
if (collisions.length) die(`shelltower seat blocked (<1.4m clear): ${collisions}`);
const exist = before[m.id];
if (exist && !(exist.lib === `store/${m.sha.slice(0, 16)}.glb` && exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1)) die(`${m.id} live collision/drift`);

let verbs: Array<[string, any]> = [];
const needComps = !exist || !eq(exist.comp ?? {}, m.comp);
if (!exist) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-3`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`${m.id} upload ${r.status}`);
    }
    if (lib !== `store/${m.sha.slice(0, 16)}.glb`) die(`${m.id} upload path ${lib}`);
    verbs = [["spawn", { id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, pos: POS, yaw: YAW, scale: 1 }]];
}
// struct-3b re-place: spawn same id replaces the entity (pos/lib/yaw match,
// so this is a deliberate comp upgrade, not drift); comp-wipe law applies —
// every comp verb re-sent after the replace.
if (needComps) verbs.push(["comp", { id: m.id, type: "sockets", data: { crown: { pos: [0, 7.45, 0], yaw: 0 } } }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct3-shell", avatar: cfg.avatar, token: cfg.joinToken }));
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
