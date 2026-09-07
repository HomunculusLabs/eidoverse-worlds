// sw-dress97-place.ts — dress-97 placement: hash-gated placer for the SW
// contemplative seats (nx-dress-sw-seats-001) at (-57.0, -72.5) yaw
// 156.70deg (local +z faces the labyrinth — the watching orientation).
// Concept: the devotional line's WATCHING place — after the bell-post bend,
// before the labyrinth: rest, face the maze. Two staggered water-worn slab
// benches (prayer-stone river idiom, NOT dress-6's matched mason-pedestal
// NE benches) + pale cushion stone (the in-use tell) + kicked fragments.
//
// Siting evidence (this tick, FRESH census 280, dress97-scan.ts):
// 1516 legal poses in the bellpost-labyrinth pocket; winner (-57.0, -72.5):
// SAT min +2.189m vs nx-dress-sw-bellpost-001 (worst), all other solids
// clear, no sub-1.4m adjacency, no exemption ladder needed; walking-line
// clearance 7.22m (min of both segments); approach cones CLEAR for every
// r>=35 solid (labyrinth judged against the devotional corridor axis az
// 12.3deg); rim corners 91.1..94.8 in [66,108] — CITY-PLAN district band
// r70-100 honored. Terrain (dress97-terrain.ts): -0.0214..-0.0263 (5mm
// spread) -> py pinned to worst corner -0.0263.
// Static, no comps — spawn-only family. SW lamp spend 0 of 3.
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt),
// rim, cone law, post-place tuple verify, idempotent rerun. dress-86/91 chassis.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_sw_seats1.glb`;
const SHA = "cb34bd36bf9ce02d74f374cc3ba0b6ebcc50479512151e47bb81328021ace695";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-sw-seats-001";
const POS = [-57.0, -0.0263, -72.5], YAW = 156.70 * Math.PI / 180;
// v4 decode envelope: x -1.123..2.261, z -0.312..1.281
const HALF = { x: 1.6923, z: 0.7968 }, CLOCAL = { x: 0.5690, z: 0.4844 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-dress-sw-bellpost-001", "nx-temple-labyrinth-0038",
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
for (const b of BLOCKERS) if (!before[b]) die(`siting blocker ${b} missing from live census — census epoch changed, re-derive`);
const e = before[ID];
if (e && !(e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1)) die(`${ID} collision/drift`);

// SAT preflight vs fresh live set
const A = obb(POS, YAW, HALF, CLOCAL);
const adjacencies: string[] = [];
for (const [id, ent] of Object.entries(before)) {
    if (id === ID || !ent.lib || !ent.pos) continue;
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
console.log(`SAT preflight clear; no sub-1.4m adjacency`);

// cone law: our seat must not sit inside any solid's approach cone
for (const [id, ent] of Object.entries(before)) {
    if (id === ID || !ent.lib || !ent.pos) continue;
    const bb = ent.bbox;
    if (!bb || !bb.size) continue;
    if (bb.max[1] - bb.min[1] <= 0.5) continue;
    let axisAz = Math.atan2(-ent.pos[0], -ent.pos[2]); // to plaza
    if (id.startsWith("nx-temple-labyrinth")) axisAz = 12.3 * Math.PI / 180; // devotional corridor
    if (inCone(ent.pos[0], ent.pos[2], axisAz, POS[0], POS[2]))
        die(`seat inside ${id} approach cone`);
}
console.log(`approach cones clear`);

// district rim law
{
    const cos = Math.cos(YAW), sin = Math.sin(YAW);
    const cs: [number, number][] = [[-HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [-HALF.x + CLOCAL.x, HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, HALF.z + CLOCAL.z]];
    const rs = cs.map(([lx, lz]) => Math.hypot(POS[0] + lx * cos + lz * sin, POS[2] - lx * sin + lz * cos));
    const lo = Math.min(...rs), hi = Math.max(...rs);
    if (lo < 66 || hi > 108) die(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} outside [66,108]`);
    console.log(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} ∈ [66,108]`);
}

// upload (content-addressed; 429 backoff for the shared 4/min fleet budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next SW seats dress-97");
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
        ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-sw-dress97-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
