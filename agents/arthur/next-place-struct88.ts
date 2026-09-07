// next-place-struct88.ts — struct-88: CONOID FAN placement (R8-3 deferred
// placement executed queue-law FIRST; site az28 r55 NE interstice from
// struct-87's fresh-291 scan, best of 96 candidates gap +4.66 walk 7.25m).
// NEW entity nx-struct-conoidfan (census-verified absent each run).
// Seat: (25.82, -0.0154, 48.56) yaw -1.0821 rad.
//   STRUCT-87 PLAN YAW SELF-CATCH: plan recorded "+1.0821 (beam axis radial
//   outward)" — sign slip. Compass az here = atan2(x,z): radial outward at
//   az28 = (sin28, cos28) = (0.469, 0.883). Local +x maps to (cosY, -sinY),
//   so radial-outward requires cosY=0.469, sinY=-0.883 -> Y = -1.0821 rad.
//   At the plan's +1.0821 the beam pointed az-62-away (SW of S). This placer
//   uses the corrected -1.0821; recorded in plan + ledger.
// TRUE decoded envelope (fresh decode this tick, accessor min/max + node
// translation): local x -0.85..5.40, y 0..4.73, z -3.37..3.37.
//   LOCAL CENTER OFFSET cx=+2.275, cz=0 (asymmetric bbox law, H-3 class):
//   world center = (26.892, 50.567) — verified == mean of the 4 hand-rotated
//   corners (26.89, 50.565). SAT runs on the grown AABB around THAT center.
// Terrain 6pt true-corner re-probe (struct88b, yaw-corrected): spread 20.6mm,
// corner-mean PY -0.0154 (S side ~2cm low; stepped posts absorb).
// SAT: yaw-grown AABB vs census AABBs, BOTH sides center-offset corrected
// (census bbox.center is LOCAL-frame — struct-80 law; neighbor world center =
// pos + rotate(local center, neighbor yaw)).
// Comps: NONE (static pavilion; mast-head bead is emissive material).
// YAW IS RADIANS ON THE WIRE (models.js:77).
// Two-pass chassis (struct-82/84/85 proven): hash gate -> live absence -> SAT
// preflight vs FRESH census -> upload (429 pacing, shared 4/min) -> spawn
// -> tuple verify -> idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [25.82, -0.0154, 48.56] as const;
const YAW = -1.0821;
const m = {
    id: "nx-struct-conoidfan",
    file: "village_conoidfan3.glb",
    sha: "c75f8dfbbe2cf9f6b367eedb957e816b74958ffb87e262dd4a5d3965e39f0c1f",
    bbox: { min: [-0.85, 0, -3.37], max: [5.4, 4.73, 3.37] },
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
// ---- SAT preflight vs FRESH live set: yaw-grown AABB vs AABBs, center-corrected ----
// GROUND exempts path/road FILMS only. Approach LAMPS are vertical members:
// blanket nx-approach- exemption inherited from struct-85 would silently skip
// lamp-002-l, whose grown-AABB pinch vs this fan is 1.10-1.20m (< 1.4 law).
// Named admission instead (struct-19 ALLOWED_ADJACENT law, measured value):
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
// nx-approach-ne-lamp-002-l (32.89, 50.15): post vs fan TIP RAIL CORNER
// (decoded true geometry, world (31.33, 51.73)) = 2.22m clear > 1.4m;
// grown-AABB pinch 1.10-1.20m is the 6.7m-long fan's fat-box artifact;
// walk circuit e-leg passed the post at >= 1.58m live (struct88-walk).
const ALLOWED_ADJACENT = new Set(["nx-approach-ne-lamp-002-l"]);
const LAW = 1.4;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
// village spawn transform: wx = px + lx*cos + lz*sin ; wz = pz - lx*sin + lz*cos
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
    if (ALLOWED_ADJACENT.has(e.id)) continue;  // named admission, see header
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
    u.searchParams.set("name", `commons-next ${m.id} struct-88`);
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct88-conoidfan", avatar: cfg.avatar, token: cfg.joinToken })));
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
