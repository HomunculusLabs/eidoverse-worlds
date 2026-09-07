// next-place-struct80.ts — struct-80: SCREW WELL first placement (R7-1, W spoke).
// NEW entity nx-struct-screwwell (census-verified absent, fresh 284 census).
// Seat: (-88, 0.017, 0) yaw π (180deg radial, W spoke) — the water-power
// procession: millrace (grinding, az 175 r 77) 11m inboard, screw well
// (lifting) outboard, both on the W spoke. Screw axis local +x; at yaw π the
// SUMP (local x 0) sits world +x = r 88, the HEAD (local x 6.06) r 94 —
// water climbs AWAY from the plaza, cascade returns toward the millrace.
// TRUE decoded envelope (local): x -0.15..6.06, z -3.575..1.55, y 0..4.04.
// Seat scan (struct-80, rotation-grown conservative, LOCAL-frame bbox
// transform law — struct-77's scan chassis had a world-center bug fixed this
// tick): worst neighbor nx-temple-terrace-0035 +7.89 conservative; rim
// [87.9, 94.1] legal. Terrain 9pt TRUE-envelope spread 8.3mm, PY 0.017.
// Comp: motion:well_screw {type:"spin", axis:"y", degPerSec:-12} — LOCAL
// frame of the well_screw group (position A0, rotation.z -50deg), pwheel
// spin class; apparent-climb law (RH helicoid + negative spin).
// YAW IS RADIANS ON THE WIRE (models.js:77 applies ent.yaw verbatim to
// rotation.y; struct-77's degree-unit bug found+fixed this tick — do not
// send degrees).
// Two-pass chassis (struct77 proven): hash gate -> live absence -> SAT
// preflight vs FRESH census -> upload (429 pacing, shared 4/min) -> spawn
// -> comp -> tuple verify -> idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-88, 0.017, 0] as const;
const YAW = Math.PI;
const m = {
    id: "nx-struct-screwwell",
    file: "village_screwwell3.glb",
    sha: "6fbaede8dbe95f0df10ad7779f8e553d6c14d7161e0fc0bac9ad657458bdf2e0",
    bbox: { min: [-0.15, 0, -3.575], max: [6.06, 4.04, 1.55] },
    comp: { "motion:well_screw": { type: "spin", axis: "y", degPerSec: -12 } },
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
const wantLib = `store/${m.sha.slice(0, 16)}.glb`;
// ---- SAT preflight vs FRESH live set (fetched now, not scan-time) ----
type O2 = { c: [number, number]; u: [number, number]; v: [number, number]; hu: number; hv: number };
function obb(pos: number[], yaw: number, bb: any): O2 {
    const c = Math.cos(yaw), s = Math.sin(yaw), lx = (bb.min[0] + bb.max[0]) / 2, lz = (bb.min[2] + bb.max[2]) / 2;
    return { c: [pos[0] + lx * c + lz * s, pos[2] - lx * s + lz * c], u: [c, -s], v: [s, c], hu: (bb.max[0] - bb.min[0]) / 2, hv: (bb.max[2] - bb.min[2]) / 2 };
}
function gap(A: O2, B: O2) {
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
let worstGap = Infinity, worstId = "";
for (const e of Object.values(before)) {
    if (!e.bbox || e.id === m.id) continue;
    const bb = e.bbox;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;       // ground layer (roads/paths films)
    const g = gap(T, obb(e.pos, e.yaw ?? 0, bb));
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < 1.4) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight worst: ${worstId} ${worstGap.toFixed(2)} (fresh ${Object.keys(before).length}-entity set)`);
const exist = before[m.id];
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp) && exist.lib === wantLib)) die(`${m.id} live tuple drift (expected absent or exact)`);
let verbs: Array<[string, any]> = [];
if (!exist || exist.lib !== wantLib) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-80`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`${m.id} upload ${r.status}`);
    }
    if (lib !== wantLib) die(`${m.id} upload path ${lib}`);
    verbs = exist
        ? [["remove", { id: m.id }], ["spawn", { id: m.id, lib: wantLib, pos: POS, yaw: YAW, scale: 1 }]]
        : [["spawn", { id: m.id, lib: wantLib, pos: POS, yaw: YAW, scale: 1 }]];
}
const compWas = exist?.comp ?? {};
const needComps = !eq(compWas, m.comp) || verbs.length > 0; // re-place wipes comps
if (needComps) for (const [type, data] of Object.entries(m.comp)) verbs.push(["comp", { id: m.id, type, data }]);
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct80-screwwell", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
else console.log(`${m.id} already live at pinned tuple — no verbs`);
const after = await geom();
const e = after[m.id];
if (!(e?.lib === wantLib && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib, pos: POS, yaw: YAW, compKeys: Object.keys(m.comp), verbs: verbs.length, worstGap: +worstGap.toFixed(2), worstId }));
