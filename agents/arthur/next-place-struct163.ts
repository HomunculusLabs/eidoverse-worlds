// next-place-struct163.ts — SAME-TUPLE LIB UPGRADE: nx-struct-unduloid v2 -> v3
// (meniscus dome). struct-162's committed carry contract executed: "re-place
// SAME id nx-struct-unduloid at exact current tuple [95.262794,-0.031702,55]
// yaw -2.0943951023931953, remove+spawn reseat chassis (artwalk-33 class),
// hash-gated 014ed586a083a4df, comp bag {} before==after, fresh SAT at final
// pose, idempotent rerun, census pin re-read. Folly class — no walk owed."
//
// Chassis: next-place-struct161 (boy reseat) — verify retiring live v1 tuple
// FIRST, SAT/NN at the FINAL pose vs fresh live set EXCLUDING self,
// hash-gated upload (429 backoff, shared budget), remove+spawn over one WS
// (paced), post-place tuple verify. Idempotent: live lib already == v3 sha
// AND tuple exact -> zero verbs.
//
// Envelope UNCHANGED 6.57x1.30x2.20 (struct-162 decoder law 18/18, byte-tied
// to sha 014ed586a083a4df verified on disk this tick) — same footprint class
// as the standing v1, so the same-tuple reseat is footprint-neutral.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const OLD_LIB = "store/3a9b92b8aeb3722d.glb";
const POS = [95.262794, -0.031702, 55.0] as const; // exact standing tuple (struct-158 seat, verified live this tick)
const YAW = -2.0943951023931953;
const m = {
    id: "nx-struct-unduloid",
    file: "village_unduloid3.glb",
    sha: "014ed586a083a4df52f94bdf87fd4b924c274c16083264cfd33975bf1cf27732",
    bbox: { min: [-3.2835, 0, -1.1], max: [3.2835, 1.3, 1.1] }, // decode envelope 6.57x1.30x2.20, x/z origin-centered
    comp: {} as Record<string, never>, // no comps; amber bead = emissive-in-GLB
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number, eps = 1e-4) => Math.abs(a - b) < eps;
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`${m.id} local hash drift ${h}`);
const wantLib = `store/${m.sha.slice(0, 16)}.glb`;
const before = await geom();
const live = before[m.id] ?? die(`${m.id} ABSENT — this placer re-seats a standing entity only (fresh ${Object.keys(before).length})`);
// idempotent form: already v3 + exact tuple -> zero verbs
if (live.lib === wantLib && near(live.pos[0], POS[0]) && near(live.pos[1], POS[1], 1e-4) && near(live.pos[2], POS[2], 1e-4) && near(live.yaw, YAW, 1e-6)) {
    console.log(`ALREADY_SEATED ${m.id} v3 ${wantLib} — no verbs`);
    process.exit(0);
}
// the contract being retired: exact v1 tuple (fresh live read this tick:
// pos [95.262794,-0.031702,55] yaw -2.0944 lib 3a9b92b8aeb3722d, comp {})
if (!(near(live.pos[0], POS[0], 1e-4) && near(live.pos[1], POS[1], 1e-4) && near(live.pos[2], POS[2], 1e-4) && near(live.yaw, YAW, 1e-6) && live.lib === OLD_LIB))
    die(`live tuple is not the expected v1 contract: ${JSON.stringify({ pos: live.pos, yaw: live.yaw, lib: live.lib })}`);
console.log(`live v1 contract verified: ${live.lib} pos [${live.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${live.yaw.toFixed(4)} comp ${JSON.stringify(live.comp ?? {})}`);
// ---- SAT + NN preflight at the FINAL pose vs FRESH live set, EXCLUDING self ----
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const FILM = /nx-struct-(kochgarden|penrose|hydro|hygro|pyth|ptolemy|hypoth|crossing|penrose2|sierpinski|geodesic|apollon|tensegrity|sundial|watershed)/;
const LAW = 1.4;
const CX = (m.bbox.min[0] + m.bbox.max[0]) / 2, CZ = (m.bbox.min[2] + m.bbox.max[2]) / 2;
const HX = (m.bbox.max[0] - m.bbox.min[0]) / 2, HZ = (m.bbox.max[2] - m.bbox.min[2]) / 2;
const cs = Math.cos(YAW), sn = Math.sin(YAW);
const WCX = POS[0] + CX * cs + CZ * sn, WCZ = POS[2] - CX * sn + CZ * cs;
const EW = HX * Math.abs(cs) + HZ * Math.abs(sn), ED = HX * Math.abs(sn) + HZ * Math.abs(cs);
let worstGap = Infinity, worstId = "", nn = Infinity, nnId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue; // our own retiring entity
    if (/^nx-struct-/.test(e.id) && !/-l$/.test(e.id)) {
        const dd = Math.hypot(e.pos[0] - POS[0], e.pos[2] - POS[2]);
        if (dd < nn) { nn = dd; nnId = e.id; }
        if (dd < 8.0) collisions.push(`NN ${e.id}(${dd.toFixed(2)})`);
    }
    const bb = e.bbox;
    if (!bb) continue;
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue;
    if (GROUND.test(e.id) || FILM.test(e.id)) continue;
    const ecx = bb.center ? bb.center[0] : 0, ecz = bb.center ? bb.center[2] : 0;
    const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
    const ey = e.yaw ?? 0;
    const cy = Math.cos(ey), sy = Math.sin(ey);
    const ecxW = e.pos[0] + ecx * cy + ecz * sy, eczW = e.pos[2] - ecx * sy + ecz * cy;
    const ew = hx * Math.abs(cy) + hz * Math.abs(sy), ed = hx * Math.abs(sy) + hz * Math.abs(cy);
    const dx = Math.abs(WCX - ecxW), dz = Math.abs(WCZ - eczW);
    const g = Math.max(dx - (EW + ew), dz - (ED + ed));
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`SAT ${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} re-seat blocked: ${collisions.join(", ")}`);
console.log(`NN floor: ${nnId} ${nn.toFixed(2)} (law 8.0)`);
console.log(`SAT preflight (v3 ${EW.toFixed(2)}x${ED.toFixed(2)} footprint at final pose) worst: ${worstId} ${worstGap.toFixed(2)} — fresh ${Object.keys(before).length}-entity set, self excluded`);
// ---- upload v3 (content-addressed; shared 4/min budget, 429 backoff) ----
let lib = "";
{
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-163 v3 meniscus`);
    u.searchParams.set("by", cfg.id);
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = ((await r.json()) as any).path; break; }
        if (r.status === 429 && a < 5) { console.log(`429 upload, backoff ${a * 30}s`); await sleep(a * 30000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== wantLib) die(`upload path ${lib}`);
    console.log(`upload OK ${lib}`);
}
// ---- remove (v2) then spawn (v3) over one WS (paced) ----
const verbs: Array<[string, any]> = [
    ["remove", { id: m.id }],
    ["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: YAW, scale: 1, comp: m.comp }],
];
await new Promise<void>((resolve, reject) => {
    const { WebSocket } = require("ws") as typeof import("ws");
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        console.log(`verb: ${verb}`);
    }, 1200); // remove->spawn needs real spacing (artwalk-33 law; 1200 for shared-burst margin)
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct163-reseat", avatar: cfg.avatar, token: cfg.joinToken })));
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
// ---- post-place verify at the FINAL pose ----
const after = await geom();
const now = after[m.id] ?? die(`${m.id} absent after verbs`);
if (!(near(now.pos[0], POS[0], 1e-4) && near(now.pos[2], POS[2], 1e-4) && near(now.pos[1], POS[1], 1e-4) && near(now.yaw, YAW, 1e-6) && now.scale === 1 && now.lib === wantLib))
    die(`tuple verify failed: ${JSON.stringify({ pos: now.pos, yaw: now.yaw, lib: now.lib })}`);
console.log(`REPLACED_VERIFIED ${m.id} pos [${now.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${now.yaw.toFixed(4)} lib ${now.lib} comp ${JSON.stringify(now.comp ?? {})} (census ${Object.keys(after).length})`);
process.exit(0);
