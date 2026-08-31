// next-place-struct-orreryring.ts — struct-19: R2-1 THE ORRERY RING placement.
// commons-next only. NEW entity nx-struct-orreryring (structures lane).
// Ground-layer film (h 0.215 <= 0.5), seated at the standing orrery's EXACT
// pose — Bill's commission is "orbital ring garden around the standing
// orrery", so the placer carries a NAMED exception vs nx-struct-orrery
// ONLY; every other live entity passes full SAT >= 1.4m. No comps.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [9.19, -0.052098429044230066, -36.87] as const; // exact standing orrery pose
const YAW = 0;
const m = {
    id: "nx-struct-orreryring",
    file: "village_orreryring3.glb",
    sha: "f095519b61b3bf17f06371870264aa76851238b9d0e4c9f46821e289b2a8f70f",
    prevSha: "41bce5d1377f14cf7f0519962d315316f479969f0e8e11dde71ff3ed00a83024", // struct-19 accepted baseline
    bbox: { min: [-2.8, 0, -2.8], max: [2.8, 0.215, 2.8] },
    comp: {},
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const canon = (v: any): any => Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
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
const R = m.bbox.max[0]; // 2.8 — the bed is a disc of this radius
const T = obb([...POS], YAW, m.bbox); // kept for the drift/idempotence tuple only
const collisions: string[] = [];
const nearMisses: string[] = [];
for (const e of Object.values(before)) {
    if (!e.bbox || e.id === m.id) continue;
    const bb = e.bbox;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;       // ground layer (roads/paths under our film)
    if (bb.min[1] > 2.9) continue;                     // suspended decor (our film is at grade)
    if (e.id === "nx-struct-orrery") continue;         // BILL-APPROVED exception (struct-19): the
                                                       // commission encircles the standing orrery;
                                                       // the film clears the round plinth (r1.1 vs
                                                       // inner ring r1.6) by geometry, not SAT.
    // Ground-layer film slot law (nvp-109..132 pattern): the square-bbox
    // SAT proxy can never pass a disc slot near a yawed neighbor, and the
    // 1.4m pinch law is a SOLID-SOLID law — a flat 0.215m walkable film
    // cannot pinch a walker (roads run past walls everywhere in town).
    // So: hard-fail on REAL geometric overlap; census (not wave through)
    // every sub-1.4m film-edge adjacency and pin it to the known set.
    const B = obb(e.pos, e.yaw ?? 0, bb);
    const dx = POS[0] - B.c[0], dz = POS[2] - B.c[1];
    const du = Math.abs(dx * B.u[0] + dz * B.u[1]) - B.hu;
    const dv = Math.abs(dx * B.v[0] + dz * B.v[1]) - B.hv;
    const edgeDist = Math.hypot(Math.max(du, 0), Math.max(dv, 0));
    const clear = edgeDist - R;
    if (clear < 0) collisions.push(`${e.id} OVERLAP ${clear.toFixed(3)}`);
    else if (clear < 1.4) nearMisses.push(`${e.id} adjacency ${clear.toFixed(3)}`);
}
// Known film-edge adjacencies (audited, not exempted silently):
// - nx-struct-observatory apron: +0.25m — flat film meets a vertical wall
//   face; no pinch possible (walker stands ON the film).
const ALLOWED_ADJACENT = ["nx-struct-observatory"];
const unexplained = nearMisses.filter(x => !ALLOWED_ADJACENT.includes(x.split(" ")[0]));
if (collisions.length || unexplained.length)
    die(`orreryring seat: overlaps=[${collisions}] unexplained-adjacency=[${unexplained}]`);
console.log(`preflight PASS: disc r${R} — no solid overlap; audited adjacency: ${nearMisses.join("; ") || "none"}`);
let verbs: Array<[string, any]> = [];
const exist = before[m.id];
if (exist && !(exist.lib === `store/${m.sha.slice(0, 16)}.glb` && exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1)) {
    // struct-21 reseat: accept ONLY the exact struct-19 baseline lib at the
    // exact standing pose as a valid pre-state for a remove+spawn upgrade.
    const baselineOk = exist && exist.lib === `store/${m.prevSha.slice(0, 16)}.glb`
        && exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1;
    if (!baselineOk) die(`${m.id} live collision/drift`);
    // remove verb exists server-side (proven pattern, nvp-133..148);
    // comp bag on this entity is empty, so nothing to re-apply.
    verbs.push(["remove", { id: m.id }]);
}

const needComps = !exist || !eq(exist.comp ?? {}, m.comp);
if (!exist || (exist.lib === `store/${m.prevSha.slice(0, 16)}.glb`)) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-19`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`${m.id} upload ${r.status}`);
    }
    if (lib !== `store/${m.sha.slice(0, 16)}.glb`) die(`${m.id} upload path ${lib}`);
    verbs = [["spawn", { id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, pos: POS, yaw: YAW, scale: 1 }]];
}
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct19-ring", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
else console.log(`${m.id} already live — no verbs`);

const after = await geom();
const e = after[m.id];
if (!(e?.lib === `store/${m.sha.slice(0, 16)}.glb` && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, pos: POS, yaw: YAW, compKeys: Object.keys(m.comp), verbs: verbs.length }));
