// sw-dress4-place.ts — dress-4 hash-gated placer: SW CONTEMPLATIVE raked
// gravel path (nx-dress-sw-gravel-001). Siting: continues the SW approach
// leg (az 217.25) radially outward from its terminus r71 into the temple
// grounds — center pol(74.7,217.25)=(-45.22,-59.46), yaw 127.25deg
// (local +x = outward walking direction), py -0.05 (terrain preflight
// -0.053/-0.048/-0.039 across the span, d14mm). Local bbox (v7 decode):
// x -3.623..3.64, z -1.184..1.309, y -0.1..0.372 — ground film (h<=0.5).
// Rim corners 71.0..78.5 inside [66,108]. SAT vs fresh census: min real
// gap 2.62m (temple-terrace-0049); no sub-1.4m solid adjacency.
// NAMED EXEMPTION — nx-approach-sw-lane-003: the leg GLB is authored in
// WORLD coordinates (entity pos [0,0,0] yaw 0, mkv3-sw-approach3.ts), so
// its census bbox is a fat axis-aligned compound (28.5 x 37.4m) that
// SAT-overlaps everything near the corridor. Source-true: the lane's last
// paver sits at r71 on this exact centerline; this path starts at r71.2 —
// collinear, end-to-end, both h<=0.5 walking surfaces; nearest solid
// (lamp post, r55.4) is 15.8m from this path's near end. Same fat-bbox
// exemption precedent as dress-1 (lane bed, source-true clearance).
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt per
// nvp-109..132; solid-solid 1.4m pinch law), 18m arrival-cone check,
// rim-corner law. Static, unlit — no comps, no lamp budget spend.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_sw_gravel1.glb`;
const SHA = "fd21de9ff797e249974481dbce662955a6fd3330846ddece243792d79abb8be5";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-sw-gravel-001";
const POS = [-45.22, -0.05, -59.46], YAW = 127.25 * Math.PI / 180;
// local bbox (v7 decode): x -3.623..3.64, z -1.184..1.309
const HALF = { x: 3.63, z: 1.25 }, CLOCAL = { x: 0.009, z: 0.063 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-approach-sw-lane-003", "nx-temple-seed-0021", "nx-temple-terrace-0049"];

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
    // NAMED fat-bbox exemption: see header. Only this exact id, only its
    // world-coords compound artifact; any OTHER overlap still hard-fails.
    if (id === "nx-approach-sw-lane-003") continue;
    const B = obb(ent.pos, ent.yaw ?? 0,
        { x: bb.size[0] / 2, z: bb.size[2] / 2 },
        { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
    const g = satGap(A, B);
    if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
    if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
console.log("SAT preflight clear; sub-1.4m solid adjacencies:", adjacencies.length ? adjacencies.join(", ") : "none");

// arrival-cone check: no solid work with this path inside its plaza-ward 25deg/18m cone
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
u.searchParams.set("name", "commons-next SW district raked gravel path dress-4");
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
        ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress4-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
