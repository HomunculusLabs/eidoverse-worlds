// next-place-struct107.ts — struct-107: DODECAHEDRON placement (R10-8,
// deferred contract from struct-106 executed this tick; night-bead contract
// resolved first: v1 occlusion cured by v2c stone obelisk spire + brass
// bead, native night PASS + day finial PASS on the pinned bytes).
// NEW entity nx-struct-dodecahedron (census-verified absent, fresh 306 this
// tick). Seat: az184 r110 (-7.67, PY, 109.73) yaw π — the S mathematics
// axis extends at the standing 10m cadence (koch az184 r90 → hilbert az184
// r100 → dodeca az184 r110); door (local +z) faces the village N approach
// (struct-105 entry law). r110 outside closed r33-55 band (CITY-PLAN law).
// Scan SAT worst nx-struct-hilbertlabyrinth +2.61 (law 1.4, fresh 306-entity
// census, film-guarded incl. the R10 math family films), walk lines 35.8m,
// film clearance 13.6m (kochgarden). Terrain 9pt spread 9.9mm, lowest
// rim-sw -0.028895 = PY. TRUE decoded envelope local: x/z ±3.149 centered,
// y 0..5.739 (bead crest). Comps: NONE (bead emissive material, glow_dd_1
// KEEP; spire/socket stone KEEP). Two-pass chassis (struct-88..105 proven);
// rerun idempotent (zero verbs).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-7.67, -0.028895247759680578, 109.73] as const;
const YAW = Math.PI;
const m = {
    id: "nx-struct-dodecahedron",
    file: "village_dodecahedron3.glb",
    sha: "671b99124ba551829f1cb1d76ef29944c80a433007f334a80e8f9aa8b5addad9",
    bbox: { min: [-3.149, 0, -3.149], max: [3.149, 5.739, 3.149] },
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
// ---- SAT preflight vs FRESH live set (films exempt by height + film-guard id) ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const FILM = /nx-struct-(kochgarden|penrose|honeycomb|sierpinski|geodesic)/; // R10 math family films (scan guard set)
const LAW = 1.4;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const WCX = POS[0] + CX * cs + CZ * sn;
const WCZ = POS[2] - CX * sn + CZ * cs;
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
console.log(`center-corrected SAT basis: world center (${WCX.toFixed(3)}, ${WCZ.toFixed(3)}) grown half ${EW.toFixed(3)}x${ED.toFixed(3)}`);
const before = await geom();
if (before[m.id]) die(`${m.id} already live — this placer places fresh only`);
let worstGap = Infinity, worstId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue;
    const bb = e.bbox;
    if (!bb) continue;                       // lights carry no bbox
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue; // ground films
    if (GROUND.test(e.id) || FILM.test(e.id)) continue;
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
const verbs: Array<[string, any]> = [];
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-107`);
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct107-dodeca", avatar: cfg.avatar, token: cfg.joinToken })));
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
