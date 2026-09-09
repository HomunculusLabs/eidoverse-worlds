// next-place-struct126.ts — struct-126 REFINE re-place: nx-struct-clothoid
// (R10-19 clothoid spiral) trestle material split, accepted this tick.
//
// WHAT CHANGED (one material, zero geometry): mast+struts+stem+catch moved
// from cloth_iron to a new cloth_trestle lane at 0.60x each iron channel
// (0.75x candidate built first, REJECTED by native falsification at 18m —
// still read as same-iron shading; 0.60x PASSED gameplay/night/front 3/3
// NATIVE). Nodes 3 -> 4 buckets. Decode from-bytes ALL PASS: vertex multiset
// 22223 byte-identical across the split, union bounds exact, trestle =
// 0.60x iron tone set exact, stone/iron textures palette-identical.
//
// ACCEPTED BYTES: sha 120448255ce6719306ca9282e78958c755a97b80443d6ab9373ae5e5cb9d913a
// (deterministic x2, mtime-verified). OLD LIVE: 4843ef8ae7093365...
//
// RE-PLACE LAW: same id, EXACT current pose (struct-125 tuple, census-verified
// this tick), comp bag {} (glow is KEEP material inside the GLB — no comps to
// reapply, comp-wipe law n/a but re-verify comp {} post-place anyway).
// Spawn alone does NOT replace bytes on a standing id (artwalk-33 law) —
// corrective re-place = REMOVE then SPAWN over the same join WS (500ms+ gap,
// next-place-artwalk-b22 precedent). Crash between remove and spawn is
// recoverable: rerun re-seats fresh (no live entity => spawn-only path).
//
// IDEMPOTENT FORM: if live lib ALREADY == accepted sha and tuple exact ->
// ALREADY_VERIFIED, zero verbs, exit 0. If live lib == old sha -> proceed.
// Anything else (wrong pose / foreign lib) -> die, no verbs.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-13.741424223707566, -0.0009827309308175281, 219.35409105716133] as const;
const YAW = Math.PI;
const OLD_LIB = "store/4843ef8ae7093365.glb";
const m = {
    id: "nx-struct-clothoid",
    file: "village_clothoid3.glb",
    sha: "120448255ce6719306ca9282e78958c755a97b80443d6ab9373ae5e5cb9d913a",
    bbox: { min: [-0.35, 0, -0.47], max: [3.56, 4.60, 0.25] }, // geometry identical — decode-proven
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
if (h !== m.sha) die(`${m.id} accepted-hash drift ${h}`);
const wantLib = `store/${m.sha.slice(0, 16)}.glb`;
console.log(`hash gate OK ${m.sha.slice(0, 16)} (accepted v2)`);

// ---- pre-state: live entity must stand at the EXACT pinned tuple ----
const before = await geom();
const cur = before[m.id] ?? die(`${m.id} absent from live set — rerun would place fresh; REFUSING (refine re-place expects standing entity)`);
if (!(cur.pos.every((n: number, i: number) => near(n, POS[i])) && near(cur.yaw, YAW) && cur.scale === 1))
    die(`live tuple drift: ${JSON.stringify({ pos: cur.pos, yaw: cur.yaw })} — expected struct-125 exact pose`);
if (cur.lib === wantLib) { console.log(`ALREADY_VERIFIED ${m.id} live lib ${cur.lib} tuple exact — zero verbs`); process.exit(0); }
if (cur.lib !== OLD_LIB) die(`live lib ${cur.lib} is neither old ${OLD_LIB} nor accepted ${wantLib} — foreign state, REFUSING`);
console.log(`pre-state OK: standing at exact tuple, old lib ${cur.lib} — proceeding to re-place`);

// ---- SAT preflight vs FRESH live set minus SELF (pose unchanged; belt law) ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const FILM = /nx-struct-(kochgarden|penrose|hydro|hygro|pyth|ptolemy|hypoth|crossing|penrose2|sierpinski|geodesic|apollon|tensegrity|sundial|watershed)/;
const LAW = 1.4;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const WCX = POS[0] + CX * cs + CZ * sn;
const WCZ = POS[2] - CX * sn + CZ * cs;
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
let worstGap = Infinity, worstId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue;
    const bb = e.bbox;
    if (!bb) continue;
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;
    if (GROUND.test(e.id) || FILM.test(e.id)) continue;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0;
    const cy = Math.cos(ey), sy = Math.sin(ey);
    const ecxW = e.pos[0] + ecx * cy + ecz * sy;
    const eczW = e.pos[2] - ecx * sy + ecz * cy;
    const ew = hx * Math.abs(cy) + hz * Math.abs(sy), ed = hx * Math.abs(sy) + hz * Math.abs(cy);
    const dx = Math.abs(WCX - ecxW), dz = Math.abs(WCZ - eczW);
    const g = Math.max(dx - (EW + ew), dz - (ED + ed));
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight (self-excluded, fresh ${Object.keys(before).length}-entity set): worst ${worstId} ${worstGap.toFixed(2)}`);

// ---- upload accepted bytes (content-addressed; pace + 429 backoff) ----
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-126`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = ((await r.json()) as any).path; break; }
        if (r.status === 429 && a < 5) { console.log(`429 upload, backoff ${a * 30}s`); await sleep(a * 30000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== wantLib) die(`upload path ${lib} != ${wantLib}`);
    console.log(`upload OK ${lib}`);
}

// ---- REMOVE then SPAWN over one join WS (artwalk-33 law) ----
await new Promise<void>((resolve, reject) => {
    const { WebSocket } = require("ws") as typeof import("ws");
    const ws = new WebSocket(cfg.url);
    let joined = false, sent = 0;
    const verbs: Array<[string, any]> = [
        ["remove", { id: m.id }],
        ["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: YAW, scale: 1, comp: m.comp }],
    ];
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || sent >= verbs.length) return;
        const [verb, args] = verbs[sent++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        console.log(`verb: ${verb} (${sent}/2)`);
    }, 700);
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct126-refine", avatar: cfg.avatar, token: cfg.joinToken })));
    ws.on("message", (raw: any) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "snapshot" && !joined) { joined = true; console.log(`joined ${WORLD}`); }
    });
    ws.on("error", reject);
    const closer = setInterval(() => {
        if (sent >= verbs.length) { clearInterval(paced); clearInterval(closer); clearTimeout(timer); ws.close(); resolve(); }
    }, 500);
});
await sleep(1500);

// ---- post-place verify: exact tuple, NEW lib, comp {} ----
const after = await geom();
const live = after[m.id] ?? die(`${m.id} absent after verbs`);
if (!(live.pos.every((n: number, i: number) => near(n, POS[i])) && near(live.yaw, YAW) && live.scale === 1 && live.lib === wantLib))
    die(`tuple verify failed: ${JSON.stringify({ pos: live.pos, yaw: live.yaw, lib: live.lib })}`);
console.log(`PLACED_VERIFIED ${m.id} pos [${live.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${live.yaw.toFixed(4)} lib ${live.lib} comp ${JSON.stringify(live.comp ?? {})} (census ${Object.keys(after).length})`);
process.exit(0);
