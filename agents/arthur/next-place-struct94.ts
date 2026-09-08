// next-place-struct94.ts — struct-94: NEEDLEREST shared-bytes cure (refine).
// The deferred half of the struct-93 halt cure: nx-struct-needlerest
// (city-9 seat, az81.5 r69.5, bench-axis yaw law 171.5deg = 2.99324 rad)
// still pins the defect bytes store/bb227fd6… — decode-proven (struct-93
// struct93-decode-halt.ts, ALL PASS) to be 4/4 material-LESS primitives,
// i.e. the SAME Sev-4 value-crush root cause halt had: loader-default
// near-black paint across every member, dead night read.
// CURE = the halt-cured bytes store/cdaf7c1f40208a5b.glb (texMat lanes
// halt_timber/stone/iron + halt_brass emissive 0x9a6a28@0.75, stud
// re-seated proud), judged native 4/4 PASS approach + night
// one-quiet-point in struct-93 (reviews/struct93-halt/) — the judgment is
// ON THESE EXACT BYTES, sha-verified at the top of this placer.
// ZERO-UPLOAD law (d): content-addressed store — halt already stands on
// the cure lib, verified in the SAME fresh census that feeds SAT. If the
// sibling pin is absent, fall back to upload (fail closed, never skip).
// RE-PLACE: SAME id, SAME exact standing tuple (10.273, 0.0028985, 68.737)
// yaw 2.9932396671702755 — remove+spawn (spawn alone leaves a standing
// entity's lib untouched). Comps {} live (comp-wipe law: nothing to
// restore). bbox parity EXACT old→new (material-only change, SAT-neutral).
// SAT: exact rotated OBB gap, both sides center-corrected (struct-80 law).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [10.273, 0.0028985188967211428, 68.737] as const;
const YAW = 2.9932396671702755;
const m = {
    id: "nx-struct-needlerest",
    file: "village_wayfarershalt3.glb",
    sha: "cdaf7c1f40208a5b49b088a7e92b7cc0763d794a8fc8d27eea76a0523bea5574",
    bbox: { min: [-2.2, 0, -1.079], max: [2.2, 2.631, 1.779] },
    comp: {} as Record<string, never>,
} as const;
const SIBLING = "nx-struct-halt"; // the standing entity that carries the cure lib
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
// ---- SAT preflight vs FRESH live set — EXACT rotated OBB gap (struct-29/47
// chassis), both sides center-corrected (struct-80 law). Ground films and
// walkable networks exempt (same exemption set as struct-93).
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-(?!.*lamp)|nx-dress-sw-moss/;
const LAW = 1.4;
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
let worstGap = Infinity, worstId = "";
const collisions: string[] = [];
for (const e of Object.values(before)) {
    if (e.id === m.id) continue;
    const bb = e.bbox;
    if (!bb) continue;                       // lights carry no bbox
    if (bb.max && (bb.max[1] - bb.min[1]) <= 0.5) continue; // ground films
    if (GROUND.test(e.id)) continue;
    const g = gap(T, obb(e.pos, e.yaw ?? 0, bb));
    if (g < worstGap) { worstGap = g; worstId = e.id; }
    if (g < LAW) collisions.push(`${e.id}(${g.toFixed(2)})`);
}
if (collisions.length) die(`${m.id} seat blocked (<1.4m clear): ${collisions.join(", ")}`);
console.log(`SAT preflight worst: ${worstId} ${worstGap.toFixed(2)} (fresh ${Object.keys(before).length}-entity set, center-corrected)`);
const exist = before[m.id];
if (exist && !(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1)) die(`${m.id} live tuple drift — abort, re-derive before any verb`);
if (!exist) die(`${m.id} absent live — this placer is a cure re-place, not a fresh siting`);
// ---- ZERO-UPLOAD gate (law d): sibling must stand on the cure lib in THIS
// fresh census; otherwise upload the pinned bytes ourselves (fail closed).
const sib = before[SIBLING];
const siblingCarriesCure = sib && sib.lib === wantLib;
console.log(`zero-upload gate: ${SIBLING} lib ${sib?.lib ?? "ABSENT"} ${siblingCarriesCure ? "== wantLib -> no upload" : "!= wantLib -> uploading pinned bytes"}`);
let verbs: Array<[string, any]> = [];
if (exist.lib === wantLib) {
    console.log("already live with exact lib — no verbs");
} else {
    // cure re-place: remove then spawn (spawn alone leaves a standing
    // entity's lib untouched — proven remove+spawn chassis artwalk-22/city9)
    verbs.push(["remove", { id: m.id }]);
    verbs.push(["spawn", { id: m.id, lib: wantLib, pos: [...POS], yaw: YAW, scale: 1, comp: m.comp }]);
}
if (verbs.length && !siblingCarriesCure) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-94`);
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
}
if (verbs.length) {
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
        }, 600);
        ws.on("open", () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct94-needlerest", avatar: cfg.avatar, token: cfg.joinToken })));
        ws.on("message", (raw: any) => {
            const msg = JSON.parse(raw.toString());
            if (msg.type === "snapshot" && !joined) { joined = true; console.log(`joined ${WORLD} (${Object.keys(msg.entities ?? {}).length} entities)`); }
        });
        ws.on("error", reject);
        const closer = setInterval(() => {
            if (i >= verbs.length) { clearInterval(paced); clearInterval(closer); clearTimeout(timer); ws.close(); resolve(); }
        }, 500);
    });
} else console.log("no verbs needed");
await sleep(1500);
const after = await geom();
const live = after[m.id] ?? die(`${m.id} absent after verbs`);
if (!(live.pos.every((n: number, i: number) => near(n, POS[i])) && near(live.yaw, YAW) && live.scale === 1 && live.lib === wantLib && eq(live.comp ?? {}, m.comp))) die(`tuple verify failed: ${JSON.stringify({ pos: live.pos, yaw: live.yaw, lib: live.lib, comp: live.comp })}`);
console.log(`PLACED_VERIFIED ${m.id} pos [${live.pos.map((n: number) => n.toFixed(4)).join(", ")}] yaw ${live.yaw.toFixed(4)} lib ${live.lib} comp ${JSON.stringify(live.comp ?? {})} (census ${Object.keys(after).length})`);
process.exit(0);
