// next-place-struct92.ts — struct-92: FIFTH BENCH placement (R9-3).
// RECOVERY TICK (artwalk-32 class pre-place interruption): sibling struct
// window 2026-09-07 19:27-19:36 built mkv3-fifthbench + renders then died
// pre-placement; this tick verified determinism (rebuild ×2 byte-identical),
// judged v1 (ZAI: 4/5, one-freq illegible), applied ONE source change
// (SEG 64→128, quantization fix), judged v2 5/5 + 5/5 + 4/4 — placing v2.
// NEW entity nx-struct-fifthbench (census-verified absent each run).
// Seat: (-23.5, -0.04, -51.0) yaw -0.4328 rad — SW contemplative-walk
// threshold, az-114.7 r56.2. v1 seat (-34.8,51.4 NW) REJECTED by the SAT
// gate (lavender-0040 -3.62 / echoarch 0.43); annulus scan (1767 lawful
// seats) ranked this the strongest gap anywhere: worst neighbor 7.44.
// Nearest standing: mile-sw-005 12.6m, mile-sw-013 13.5m, seed-0034 15.1m.
// Ends 6.95m/13.05m off the az-125 SW walk ray (beside the line, Bill's
// lamp law). Long axis TANGENTIAL (local +x → world (0.908,-0.420)): the
// 3:2 elevation reads face-on from the SW walk — the contract read
// (struct-91 dialect). SW district = the mathematical-quiet family's home
// (observatory/skymirror/labyrinths/stillwind) — the fifth seat joins it.
// TRUE decoded envelope v2: local x ±6.06, y 0..0.687, z ±0.25 (symmetric,
// no center offset; decode + review-stats agree). Terrain 9pt spread 7.0mm,
// mean PY 0.0450 (seated-on-grade ribbon class, absorbed by 0.42 nulls).
// SAT: yaw-grown AABB vs census AABBs, BOTH sides center-offset corrected
// (struct-80 census-local-bbox law). Comps: NONE (bead is emissive
// material, glow_fb KEEP). Two-pass chassis (struct-88/90/91 proven).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-23.5, -0.04, -51.0] as const;
const YAW = -0.4328;
const m = {
    id: "nx-struct-fifthbench",
    file: "village_fifthbench3.glb",
    sha: "62f33173ccdae1074122d38006b9e7ef22a4e10569826c4f8ba28a28055a58b2",
    bbox: { min: [-6.06, 0, -0.25], max: [6.06, 0.687, 0.25] },
    comp: {} as Record<string, never>,
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
function canon(v: any): any { return Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, [v[k]].flat().map(canon)[0]])) : v; }
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
// ---- SAT preflight vs FRESH live set (films exempt by height + id; lamps vertical, kept) ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const LAW = 1.4;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const WCX = POS[0] + CX * cs + CZ * sn;
const WCZ = POS[2] - CX * sn + CZ * cs;
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
console.log(`center-corrected SAT basis: world center (${WCX.toFixed(3)}, ${WCZ.toFixed(3)}) grown half ${EW.toFixed(3)}x${ED.toFixed(3)}`);
const before = await geom();
let worstGap = Infinity, worstId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue;
    const bb = e.bbox;
    if (!bb) continue;                       // lights carry no bbox
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue; // ground films
    if (GROUND.test(e.id)) continue;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0;
    const cy = Math.cos(ey), sy = Math.sin(ey);
    const ecxW = e.pos[0] + ecx * cy + ecz * sy;
    const eczW = e.pos[2] - ecx * sy + ecz * cy;
    const ew = hx * Math.abs(cy) + hz * Math.abs(sy), ed = hx * Math.abs(sy) + hz * Math.abs(cy);
    const dx = Math.abs(WCX - ecxW), dz = Math.abs(WCZ - eczW);
    const g = Math.max(dx - (EW + ew), dz - (ED + ed));   // max separating axis
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight worst: ${worstId} ${worstGap.toFixed(2)} (fresh ${Object.keys(before).length}-entity set, center-corrected)`);
const exist = before[m.id];
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp) && exist.lib === wantLib)) die(`${m.id} live tuple drift (expected absent or exact)`);
let verbs: Array<[string, any]> = [];
if (!exist || exist.lib !== wantLib) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-92`);
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct92-fifth", avatar: cfg.avatar, token: cfg.joinToken })));
    ws.on("message", (raw: any) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "snapshot" && !joined) { joined = true; console.log(`joined ${WORLD} (${Object.keys(msg.entities ?? {}).length} entities)`); }
    });
    ws.on("error", reject);
    const closer = setInterval(() => {
        if (i >= verbs.length) { clearInterval(paced); clearInterval(closer); clearTimeout(timer); ws.close(); resolve(); }
    }, 500);
});
await sleep(1500);
const after = await geom();
const live = after[m.id] ?? die(`${m.id} absent after verbs`);
if (!(live.pos.every((n: number, i: number) => near(n, POS[i])) && near(live.yaw, YAW) && live.scale === 1 && live.lib === wantLib)) die(`tuple verify failed: ${JSON.stringify({ pos: live.pos, yaw: live.yaw, lib: live.lib })}`);
console.log(`PLACED_VERIFIED ${m.id} pos [${live.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${live.yaw.toFixed(4)} lib ${live.lib} comp ${JSON.stringify(live.comp ?? {})} (census ${Object.keys(after).length})`);
process.exit(0);
