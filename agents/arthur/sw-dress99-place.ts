// sw-dress99-place.ts — dress-99 placement: hash-gated placer for the SW
// offering niche (nx-dress-sw-offering-001), dress-98's deferred v3 candidate
// b41efb63, CONFIRMED this tick by native re-judge on exact bytes.
// Concept: the devotional line's OFFERING place — the circling walker's
// first touch of the maze boundary: single taller jamb stone in the
// source-true ring-7 wall family + wide pale capstone-dish + pale crest
// river-stone + hand-height shelf + 2-stack mini-cairn at the foot.
//
// Siting evidence (this tick): anchor RE-DERIVED fresh vs live host tuple
// (dress98-anchor.ts rerun: host nx-temple-labyrinth-0038 lib 2d3d2032d3e806f8
// EXACT, census 281): seat local 214deg r7.06 -> world (-45.002, -84.456)
// riderYaw 1.7622 rad (101.0deg, outward radial), r 95.69 in CITY-PLAN band
// [70,100]. Seats cone diff 98.3deg @ 16.99m (need >25). Decode-true OBB:
// half 0.4405 x 0.3021, clocal (-0.0039, 0.1143), envelope y -0.006..1.084.
// Terrain (dress99-terrain.ts): -0.0306..-0.0312 (0.6mm spread) -> py -0.03119.
// Static unlit — spawn-only, no comps. SW lamp spend 0 of 3.
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt; HOST
// exempt as rider-on-host designed concentric mount — anchor is positional
// proof, host epoch-guarded), rim, cone law, post-place tuple verify,
// idempotent rerun. dress-97/86/91 chassis.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_sw_offering1.glb`;
const SHA = "b41efb63746c2450dc094e126dfe09b791f4130811a34096e29b61fe2f107f0b";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-sw-offering-001";
const HOST = "nx-temple-labyrinth-0038";
const HOST_LIB = "store/2d3d2032d3e806f8.glb";
const POS = [-45.002, -0.03119, -84.456], YAW = 1.7622;
// v3 decode envelope (dress99-decode-offering.ts, exact bytes):
// x -0.444..0.437, z -0.188..0.416 -> half/clocal below
const HALF = { x: 0.4405, z: 0.3021 }, CLOCAL = { x: -0.0039, z: 0.1143 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = [HOST, "nx-dress-sw-bellpost-001", "nx-dress-sw-seats-001",
  "nx-dress-sw-prayer-001", "nx-dress-sw-gravel-001", "nx-dress-sw-incense-001"];

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: readonly number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));

async function geom() {
  const r = await fetch(`${base}/geom?world=${WORLD}`);
  if (!r.ok) die(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

// 2D OBB SAT, max separating-axis gap (align-1 convention)
type OBB = { cx: number, cz: number, ux: number[], uz: number[], hu: number[] };
function obb(pos: number[], yaw: number, half: { x: number, z: number }, c: { x: number, z: number }): OBB {
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    return {
        cx: pos[0] + c.x * cos + c.z * sin,
        cz: pos[2] - c.x * sin + c.z * cos,
        ux: [cos, -sin], uz: [sin, cos],
        hu: [half.x, half.z],
    };
}
const radius = (o: OBB, ax: number[]) =>
    Math.abs(ax[0] * o.ux[0] + ax[1] * o.ux[1]) * o.hu[0] +
    Math.abs(ax[0] * o.uz[0] + ax[1] * o.uz[1]) * o.hu[1];
function satGap(a: OBB, b: OBB): number {
    const dx = b.cx - a.cx, dz = b.cz - a.cz;
    let gap = -Infinity;
    for (const ax of [a.ux, a.uz, b.ux, b.uz]) {
        const g = Math.abs(dx * ax[0] + dz * ax[1]) - radius(a, ax) - radius(b, ax);
        if (g > gap) gap = g;
    }
    return gap;
}

// approach cone: 18m, 25deg half-angle
const inCone = (ex: number, ez: number, axisAz: number, px: number, pz: number) => {
    const dist = Math.hypot(px - ex, pz - ez);
    if (dist > 18) return false;
    const bearing = Math.atan2(px - ex, pz - ez);
    let diff = Math.abs(bearing - axisAz);
    while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
    return diff < (25 * Math.PI / 180);
};

const bytes = readFileSync(FILE);
const hash = createHash("sha256").update(bytes).digest("hex");
if (hash !== SHA) die(`reviewed hash mismatch: ${hash}`);

const before = await geom();
const host = before[HOST];
if (!host || host.lib !== HOST_LIB) die(`host ${HOST} missing or lib drift: ${host?.lib}`);
if (!vec(host.pos, [-51.932088, -0.019688843285594615, -83.108713]) || !(Math.abs((host.yaw ?? 0) - -2.35619449) < 1e-6)) die(`host tuple drift: ${JSON.stringify(host)}`);
for (const b of BLOCKERS) if (!before[b]) die(`siting blocker ${b} missing from live census — census epoch changed, re-derive`);
const e = before[ID];
if (e && !(e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1)) die(`${ID} collision/drift`);

// SAT preflight vs fresh live set
const A = obb(POS, YAW, HALF, CLOCAL);
const adjacencies: string[] = [];
for (const [id, ent] of Object.entries(before)) {
    if (id === ID || !ent.lib || !ent.pos) continue;
    // HOST exemption (rider-on-host designed concentric mount): the jamb back
    // face embeds into the ring-7 wall by design; the anchor was derived
    // positionally from the host's SERVED bytes at this exact tuple (guarded
    // above) — a bbox-vs-rider SAT against the fat maze bbox is meaningless
    // here (artwalk host-rider chassis). Sibling labyrinth entities 0025/
    // 0051/0004 are separate entities and SAT normally below.
    if (id === HOST) continue;
    const bb = ent.bbox;
    if (!bb || !bb.size) continue;
    if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin ground film — SAT-exempt class
    const B = obb(ent.pos, ent.yaw ?? 0,
        { x: bb.size[0] / 2, z: bb.size[2] / 2 },
        { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
    const g = satGap(A, B);
    if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
    if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
if (adjacencies.length) die(`unexplained sub-1.4m solid adjacency: ${adjacencies.join(", ")}`);
console.log(`SAT preflight clear (host exempt: designed mount); no sub-1.4m adjacency`);

// cone law: our piece must not sit inside any solid's approach cone
for (const [id, ent] of Object.entries(before)) {
    if (id === ID || !ent.lib || !ent.pos) continue;
    const bb = ent.bbox;
    if (!bb || !bb.size) continue;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;
    let axisAz = Math.atan2(-ent.pos[0], -ent.pos[2]); // to plaza
    if (id.startsWith("nx-temple-labyrinth")) axisAz = 12.3 * Math.PI / 180; // devotional corridor
    if (inCone(ent.pos[0], ent.pos[2], axisAz, POS[0], POS[2]))
        die(`piece inside ${id} approach cone`);
}
console.log(`approach cones clear`);

// district rim law
{
    const cos = Math.cos(YAW), sin = Math.sin(YAW);
    const cs: [number, number][] = [[-HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [-HALF.x + CLOCAL.x, HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, HALF.z + CLOCAL.z]];
    const rs = cs.map(([lx, lz]) => Math.hypot(POS[0] + lx * cos + lz * sin, POS[2] - lx * sin + lz * cos));
    const lo = Math.min(...rs), hi = Math.max(...rs);
    if (lo < 66 || hi > 108) die(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} outside [66,108]`);
    if (lo < 70 || hi > 100) die(`CITY-PLAN band: rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} outside [70,100]`);
    console.log(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} ∈ [66,108] and CITY-PLAN [70,100]`);
}

// upload (content-addressed; 429 backoff for the shared 4/min fleet budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next SW offering niche dress-99");
u.searchParams.set("by", cfg.id);
let uploaded = "";
for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { uploaded = (await r.json()).path; break; }
    if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
    die(`upload HTTP ${r.status}`);
}
if (uploaded !== LIB) die(`upload returned ${uploaded}, expected ${LIB}`);

// spawn verb (single, paced; only if not already live at the exact tuple)
if (!before[ID]) {
    const ws = new WebSocket(cfg.url);
    await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 60_000);
        ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-sw-dress99-place", avatar: cfg.avatar, token: cfg.joinToken }));
        ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
        ws.onmessage = (ev: any) => {
            const m = JSON.parse(ev.data);
            if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
            if (m.type === "snapshot") {
                setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: 1 } })), 800);
                setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 2600);
            }
        };
    });
} else console.log(`${ID} already live at exact tuple — no verbs`);

// post-place verify
const after = await geom();
const ea = after[ID];
if (!(ea?.lib === LIB && vec(ea.pos, POS) && near(ea.yaw ?? 0, YAW) && (ea.scale ?? 1) === 1)) die(`${ID} post-place failed: ${JSON.stringify(ea)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, pos: POS, yaw: YAW, verbs: before[ID] ? 0 : 1 }));
