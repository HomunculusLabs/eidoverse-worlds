// next-place-struct158.ts — struct-158: THE UNDULOID STOUP placement
// (R11-4, struct-157 arc: banked sha 3a9b92b8aeb3722da76ba4fc0f9091d7ad7
// 101996f7f338cdbcb8a2d97db9a29 = ACCEPTED v2 water-fixed bytes, decode
// ALL PASS 17/17 re-verified THIS tick; native judgment COMPLETE 3/3:
// gameplay 18m PASS, night PASS (v2, water cool-sheen), front 8m 3/4 with
// water-value watch item disclosed (day-front marginal, night-confirmed)).
// SEAT: struct158-scan-unduloid az120 R=110 yaw=-120deg LAWFUL (fresh
// census 324: worst-solid 2.53 law 1.4, NN spiralfolly 53.64 law 8.0,
// film/walk/rim green; under-served E-district rotation per CITY-PLAN
// Amendment 1 — outer-ring E=2 vs W=6/N=12/S=24 re-derived fresh;
// "waterfront-adjacent" disposition preference overridden: reedpool sits
// in 2x-over-cap N — disclosed in scan header).
// Terrain struct158-terrain at FINAL pose: 9pt spread 8.3mm flat,
// PY = lowest = -0.031702.
// YAW -120deg RADIANS (wire-yaw-is-radians law, struct-80): bead string
// (local x) seats TANGENT to the ring — the az120 plaza spoke reads the
// full 5-bead broadside (struct-104 planar-figure class, chain law proven
// in scan header). Envelope 6.57 x 1.30 x 2.20 x/z ORIGIN-CENTERED
// (decode-derived). NEW entity nx-struct-unduloid (scan verified absent,
// fresh 324). Folly class: no entry advertised — no walk owed (zeno..boy
// family precedent). Comps: NONE (amber drip bead is emissive material
// inside the GLB, KEEP glow; water gleam is material emissive; comp {}).
// Two-pass chassis (struct-88..157 proven); fresh-only placer — rerun
// dies zero-verbs (idempotency form).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [95.262794, -0.031702, 55.000000] as const;
const YAW = -120 * Math.PI / 180; // -2.0943951023931953 rad
const m = {
    id: "nx-struct-unduloid",
    file: "village_unduloid3.glb",
    sha: "3a9b92b8aeb3722da76ba4fc0f9091d7ad7101996f7f338cdbcb8a2d97db9a29",   // v2 water-fixed banked (struct-157), decode 17/17 ALL PASS re-verified this tick
    bbox: { min: [-3.285, 0, -1.10], max: [3.285, 1.30, 1.10] }, // decode envelope 6.57x1.30x2.20, origin-centered x/z
    comp: {} as Record<string, never>,
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
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
const FILM = /nx-struct-(kochgarden|penrose|hydro|hygro|pyth|ptolemy|hypoth|crossing|penrose2|sierpinski|geodesic|apollon|tensegrity|sundial|watershed)/;
const LAW = 1.4;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const WCX = POS[0] + CX * cs + CZ * sn;
const WCZ = POS[2] - CX * sn + CZ * cs;
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
console.log(`center-corrected SAT basis: world center (${WCX.toFixed(3)}, ${WCZ.toFixed(3)}) grown half ${EW.toFixed(3)}x${ED.toFixed(3)} (yaw ${YAW.toFixed(4)} rad)`);
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
    u.searchParams.set("name", `commons-next ${m.id} struct-158`);
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
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct158-unduloid", avatar: cfg.avatar, token: cfg.joinToken })));
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
if (!(live.pos.every((n: number, i2: number) => near(n, POS[i2])) && near(live.yaw, YAW) && live.scale === 1 && live.lib === wantLib)) die(`tuple verify failed: ${JSON.stringify({ pos: live.pos, yaw: live.yaw, lib: live.lib })}`);
console.log(`PLACED_VERIFIED ${m.id} pos [${live.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${live.yaw.toFixed(6)} lib ${live.lib} comp ${JSON.stringify(live.comp ?? {})} (census ${Object.keys(after).length})`);
process.exit(0);
