// next-place-struct81.ts — struct-81: REEDPOOL water-cure reseat (survey-40
// native VOID-READ closed at source). SAME entity nx-struct-reedpool, SAME
// exact tuple (city-5 SE S-edge seat) — materials-only change: water plain
// mat -> screwwell emissive idiom, brass tips -> amber accent idiom. All six
// mesh envelopes proven byte-identical (strict-subset class reseat: same
// collider, same SAT set). Live comp bag EMPTY both sides (comp-wipe law
// trivial). Old lib store/d3a81b79cb6fe58c.glb (struct-6 build) accepted at
// the exact tuple for one-way migration to the cured bytes (struct-66
// chassis law); any OTHER live tuple remains hard drift.
// YAW IS RADIANS ON THE WIRE (models.js:77) — reedpool seat yaw 0.
// Two-pass chassis (struct-80): hash gate -> tuple/lib gate -> SAT preflight
// vs FRESH census -> upload (429 pacing, shared 4/min) -> remove+spawn ->
// tuple verify -> idempotent rerun prints zero verbs.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [9.723, -0.05907, -90.982] as const;
const YAW = 0;
const m = {
    id: "nx-struct-reedpool",
    file: "village_reedpool3.glb",
    sha: "7d770620bb1b7bdcfef7000db14d8cb53be3647b9664ce93374053745bc84af1",
    oldLib: "store/d3a81b79cb6fe58c.glb",
    // local-frame bbox == live census bbox (envelope byte-identical by decode)
    bbox: { min: [-5.187, -0.02, -4], max: [5.187, 2.635, 4] },
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
    // STANDING-PRECEDENT EXEMPTION (exemption-ladder tier a): the angler is
    // city-5's DESIGNED companion on this seat (CITY-PLAN register row 44,
    // sweep-42 E4 precedent; sweep-83's battery classifies this pair
    // accepted — its SAT exit names only R-121). Measured standing contact,
    // struct81-pair-clearance.py: square-proxy gap -1.807 (angler fat AABB:
    // bench+figure+rod reach 6.28x3.06); TRUE ellipse(water+rim a=4.55
    // b=3.05)-vs-AABB corner (-3.38,+/-1.53) INSIDE — the rod overhangs the
    // west water tip by design (angler fishes INTO the pool). This reseat
    // is materials-only with all six mesh envelopes proven byte-identical,
    // so the standing contact cannot change; any OTHER sub-1.4 neighbor
    // still hard-fails below.
    if (e.id === "nx-struct-angler") continue;
    const bb = e.bbox;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;       // ground layer (roads/paths films)
    const g = gap(T, obb(e.pos, e.yaw ?? 0, bb));
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < 1.4) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight worst: ${worstId} ${worstGap.toFixed(2)} (fresh ${Object.keys(before).length}-entity set)`);
const exist = before[m.id];
if (!exist) die(`${m.id} absent — expected live at the pinned tuple (reseat chassis, not first placement)`);
const tupleOk = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp);
if (!tupleOk || ![m.oldLib, wantLib].includes(exist.lib)) die(`${m.id} live tuple/lib drift (reseat demands exact tuple + known lib)`);
let verbs: Array<[string, any]> = [];
if (exist.lib !== wantLib) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-81`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`${m.id} upload ${r.status}`);
    }
    if (lib !== wantLib) die(`${m.id} upload path ${lib}`);
    verbs = [["remove", { id: m.id }], ["spawn", { id: m.id, lib: wantLib, pos: POS, yaw: YAW, scale: 1 }]];
}
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct81-reedpool", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
else console.log(`${m.id} already live on cured bytes at pinned tuple — no verbs`);
const after = await geom();
const e = after[m.id];
if (!(e?.lib === wantLib && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: wantLib, pos: POS, yaw: YAW, compKeys: Object.keys(m.comp), verbs: verbs.length, worstGap: +worstGap.toFixed(2), worstId }));
