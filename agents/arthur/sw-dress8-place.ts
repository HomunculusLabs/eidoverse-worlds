// sw-dress8-place.ts — dress-8 hash-gated placer: SW CONTEMPLATIVE prayer
// stones (nx-dress-sw-prayer-001). Siting: on the az-232.725 SW corridor,
// PAST the raked gravel path (dress-4, ends r78.5) at the edge of the open
// walking line — pause place before the labyrinth ring. Entity origin
// (-52.26, -64.53), yaw 127.25deg (local +z faces the path/CW side), py
// -0.032 (terrain preflight -0.0315..-0.0342 across OBB corners, d3mm).
// Local bbox (v3 decode): x -1.41..1.186, z -1.082..1.602, y -0.058..1.251
// — solid (h 1.31, NOT a ground film). OBB center (-51.985, -64.598),
// half x 1.298, half z 1.342, asset-bbox center local (-0.112, +0.26).
// SAT vs fresh census (255 entities): min gap +4.218m (nx-temple-terrace-
// 0049), no sub-1.4m solid adjacency; arrival cones clear (labyrinth-0038
// 15.6m at >25deg, nearest cone-bearing works outside every plaza-ward
// wedge). Rim corners 81.59..84.26 inside [66,108]. Approach lane pavers
// end r71.6 (source decode: lane bbox radial max 71.6) — this pose has NO
// lane contact; the fat world-coords lane compound is exempt from 2D SAT
// per dress-1/dress-4 precedent (guard retained for epoch shifts).
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt per
// nvp-109..132; solid-solid 1.4m pinch law), 18m arrival-cone check,
// rim-corner law. Static, unlit — no comps, no lamp budget spend
// (SW budget 3, used 0).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_sw_prayer1.glb`;
const SHA = "5074600fc869789d23c08fc1f0bfc5529b66b7a46d43ec7494eab0198442ae7a";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-sw-prayer-001";
const POS = [-52.26, -0.032, -64.53], YAW = 127.25 * Math.PI / 180;
// local bbox (v3 decode): x -1.41..1.186, z -1.082..1.602
const HALF = { x: 1.298, z: 1.342 }, CLOCAL = { x: -0.112, z: 0.26 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-approach-sw-lane-003", "nx-dress-sw-gravel-001", "nx-temple-terrace-0049", "nx-temple-labyrinth-0038"];

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

// 2D OBB SAT, max separating-axis gap (axis convention align-1).
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

const bytes = readFileSync(FILE);
const hash = createHash("sha256").update(bytes).digest("hex");
if (hash !== SHA) die(`reviewed hash mismatch: ${hash}`);

const before = await geom();
for (const b of BLOCKERS) if (!before[b]) die(`siting blocker ${b} missing from live census — census epoch changed, re-derive`);
const e = before[ID];
if (e && !(e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1)) die(`${ID} collision/drift`);

// SAT + rim + arrival-cone preflight vs fresh live set
const A = obb(POS, YAW, HALF, CLOCAL);
// rim corner law: every OBB corner inside [66, 108]
{
    const cos = Math.cos(YAW), sin = Math.sin(YAW);
    for (const [su, sv] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
        const lx = CLOCAL.x + su * HALF.x, lz = CLOCAL.z + sv * HALF.z;
        const wx = POS[0] + lx * cos + lz * sin, wz = POS[2] - lx * sin + lz * cos;
        const r = Math.hypot(wx, wz);
        if (r < 66 || r > 108) die(`rim corner violation at (${wx.toFixed(2)}, ${wz.toFixed(2)}) r=${r.toFixed(2)}`);
    }
}
const adjacencies: string[] = [];
for (const [id, ent] of Object.entries(before)) {
    if (id === ID || !ent.lib || !ent.pos) continue;
    const bb = ent.bbox;
    if (!bb || !bb.size) continue;
    if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin ground film — SAT-exempt class
    // NAMED fat-bbox exemption: see header (lane authored in world coords;
    // pavers end r71.6, no contact with this r83 pose).
    if (id === "nx-approach-sw-lane-003") continue;
    const B = obb(ent.pos, ent.yaw ?? 0,
        { x: bb.size[0] / 2, z: bb.size[2] / 2 },
        { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
    const g = satGap(A, B);
    if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
    if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
console.log("SAT preflight clear; sub-1.4m solid adjacencies:", adjacencies.length ? adjacencies.join(", ") : "none");

// arrival-cone check: no solid work with this pose inside its plaza-ward 25deg/18m cone
for (const [id, ent] of Object.entries(before)) {
    if (id === ID || !ent.lib || !ent.pos) continue;
    const bb = ent.bbox;
    if (!bb || !bb.size || bb.max[1] - bb.min[1] <= 0.5) continue;
    const px = ent.pos[0], pz = ent.pos[2], L = Math.hypot(px, pz);
    if (L < 1e-6) continue;
    const wx = POS[0] - px, wz = POS[2] - pz;
    if (Math.hypot(wx, wz) > 18) continue;
    const dot = (wx * (-px / L) + wz * (-pz / L)) / Math.hypot(wx, wz);
    const ang = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
    if (ang <= 25) die(`arrival-cone violation vs ${id}: ${ang.toFixed(1)}deg`);
}

// upload (content-addressed; 429 backoff for the shared 4/min fleet budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next SW district prayer stones dress-8");
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
        ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress8-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
