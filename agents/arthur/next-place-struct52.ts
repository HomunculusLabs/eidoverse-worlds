// next-place-struct52.ts — struct-52: beacon SLIT LIT-WINDOW fix re-place.
// Same entity, same exact pose as struct-11: remove+spawn reseat (comp bag
// empty before and after — census null — so no comp reapply needed). Hash
// gate: 03d278be (was f5076e00). Companion light nx-struct-beacon-l is a
// SEPARATE entity: untouched by the reseat, but verified post-place and
// restored at its committed pin if absent (struct-11 light-verb idiom).
// Site/SAT gates unchanged (identical census bbox, identical tuple):
// E approach (40.8, PY, -16.48) yaw 0. Honest collider: 3.1x3.1x8.7
// furniture-solid tower (9.61 m2 < 16 -> solid, not enterable — by design).
// Two-pass chassis: hash gate -> fresh live SAT w/ exemptions -> upload
// with 429 pacing -> remove+spawn -> post-place tuple verify -> idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [40.8, -0.04397324965628428, -16.48] as const;
const YAW = 0;
const m = {
    id: "nx-struct-beacon",
    lightId: "nx-struct-beacon-l",
    lightPos: [40.8, 7.3, -16.48] as const, // lantern room center, world
    lightColor: 0xffc98a, lightIntensity: 1.5, lightRange: 9.0,
    file: "village_beacon3.glb",
    sha: "03d278be726778773541f77d47207ead58a56af88d22b274ac46ffcd132a04fb",
    bbox: { min: [-1.55, -0.0, -1.55], max: [1.55, 8.7, 1.55] },
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`${m.id} reviewed hash drift ${h}`);
const wantLib = () => `store/${m.sha.slice(0, 16)}.glb`;

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
    if (!e.bbox || e.id === m.id || e.id === m.lightId) continue;
    const bb = e.bbox;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;       // ground layer
    if (bb.min[1] > 8.5) continue;                     // suspended decor (above our 8.7 top)
    if (gap(T, obb(e.pos, e.yaw ?? 0, bb)) < 1.4) collisions.push(e.id);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions}`);
const exist = before[m.id];
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp))) die(`${m.id} live tuple drift (reseat refuses to move)`);
const light = before[m.lightId];
const lightOK = !!light && light.kind === "light" && light.pos.every((n: number, i: number) => near(n, m.lightPos[i]));

let verbs: Array<[string, any]> = [];
if (!exist || exist.lib !== wantLib()) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-52`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`${m.id} upload ${r.status}`);
    }
    if (lib !== wantLib()) die(`${m.id} upload path ${lib}`);
    // reseat: remove standing id, then spawn new bytes at the exact tuple
    verbs = exist
        ? [["remove", { id: m.id }], ["spawn", { id: m.id, lib: wantLib(), pos: POS, yaw: YAW, scale: 1 }]]
        : [["spawn", { id: m.id, lib: wantLib(), pos: POS, yaw: YAW, scale: 1 }]];
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct52-beacon", avatar: cfg.avatar, token: cfg.joinToken }));
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
if (!(e?.lib === wantLib() && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
const l2 = after[m.lightId];
if (!(!!l2 && l2.kind === "light" && l2.pos.every((n: number, i: number) => near(n, m.lightPos[i])))) die(`${m.lightId} post-place light failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lightId: m.lightId, lib: wantLib(), pos: POS, yaw: YAW, verbs: verbs.length }));
