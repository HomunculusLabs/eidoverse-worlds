// next-place-struct85.ts — struct-85: CHAIN VAULT placement (R8-2, ESE
// threshold band az110 r56 — the empty arc between ruledtower az90 and
// forest-0031 az108; first candidate az102 r64 died at my own SAT gate:
// forest-0031's true grown bbox, fat-clump class; mouth facing plaza,
// yaw -1.2217 rad = facing az -70 dead-on).
// NEW entity nx-struct-chainvault (census-verified absent, fresh 289).
// Seat: (52.6, -0.0572, -13.3) yaw -1.2217 — nearest neighbors snagdead
// +4.78, forest-0031 +4.74; no approach legs exist in this band (fresh).
// TRUE decoded envelope (local): x -3.80..3.80 (span), z -3.62..3.62
// (length, mouths open both ends), y 0..2.873.
// Terrain 9pt spread 4.0mm, PY -0.0572.
// SAT: yaw-grown AABB vs census AABBs (rotated rectangle, both half-extents).
// Comps: NONE (static vault; crown bead is emissive material, not comp).
// YAW IS RADIANS ON THE WIRE (models.js:77 verbatim to rotation.y).
// Two-pass chassis (struct-82/84 proven): hash gate -> live absence -> SAT
// preflight vs FRESH census -> upload (429 pacing, shared 4/min) -> spawn
// -> tuple verify -> idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [52.6, -0.0478, -19.2] as const;
const YAW = -1.2217;
const m = {
    id: "nx-struct-chainvault",
    file: "village_chainvault3.glb",
    sha: "8fecf67df7d3397010766bfb7cd69358c40ce89d1b4a588f3be5c1dfb254c917",
    bbox: { min: [-3.8, 0, -3.62], max: [3.8, 2.873, 3.62] },
    comp: {} as Record<string, never>,
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
// ---- SAT preflight vs FRESH live set: yaw-grown AABB vs AABBs ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-|nx-dress-sw-moss/;
const HX = 3.8, HZ = 3.62, LAW = 1.4;
const cs = Math.abs(Math.cos(YAW)), sn = Math.abs(Math.sin(YAW));
const EW = HX * cs + HZ * sn, ED = HX * sn + HZ * cs;   // my grown half-extents
const before = await geom();
let worstGap = Infinity, worstId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue;
    const bb = e.bbox;
    if (!bb) continue;                       // lights carry no bbox
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue; // ground films
    if (GROUND.test(e.id)) continue;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const cy = Math.abs(Math.cos(e.yaw ?? 0)), sy = Math.abs(Math.sin(e.yaw ?? 0));
    const ew = hx * cy + hz * sy, ed = hx * sy + hz * cy;
    const dx = Math.abs(POS[0] - e.pos[0]), dz = Math.abs(POS[2] - e.pos[2]);
    const g = Math.max(dx - (EW + ew), dz - (ED + ed));   // max separating axis
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight worst: ${worstId} ${worstGap.toFixed(2)} (fresh ${Object.keys(before).length}-entity set, grown AABB ${EW.toFixed(2)}x${ED.toFixed(2)})`);
const exist = before[m.id];
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp) && exist.lib === wantLib)) die(`${m.id} live tuple drift (expected absent or exact)`);
let verbs: Array<[string, any]> = [];
if (!exist || exist.lib !== wantLib) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-85`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = ((await r.json()) as any).path; break; }
        if (r.status === 429 && a < 5) { console.log(`429 upload, backoff ${a * 30}s`); await sleep(a * 30000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== wantLib) die(`upload path ${lib}`);
    console.log(`upload OK ${lib}`);
    verbs.push(["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: YAW, scale: 1, comp: m.comp }]);
} else {
    console.log("already live with exact lib — no verbs");
}
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const { WebSocket } = require("ws") as typeof import("ws");
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        console.log(`verb: ${verb}`);
    }, 600);
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct85-chainvault", avatar: cfg.avatar, token: cfg.joinToken })));
    ws.on("message", (raw: any) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "snapshot" && !joined) { joined = true; console.log(`joined ${WORLD} (${Object.keys(msg.entities ?? {}).length} entities)`); }
    });
    ws.on("error", reject);
    setInterval(() => {
        if (i >= verbs.length) { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }
    }, 500);
});
await sleep(1500);
const after = await geom();
const live = after[m.id] ?? die(`${m.id} absent after verbs`);
if (!(live.pos.every((n: number, i: number) => near(n, POS[i])) && near(live.yaw, YAW) && live.scale === 1 && live.lib === wantLib)) die(`tuple verify failed: ${JSON.stringify({ pos: live.pos, yaw: live.yaw, lib: live.lib })}`);
console.log(`PLACED_VERIFIED ${m.id} pos [${live.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${live.yaw.toFixed(4)} lib ${live.lib} comp ${JSON.stringify(live.comp ?? {})} (census ${Object.keys(after).length})`);
