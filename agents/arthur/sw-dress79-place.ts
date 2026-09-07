// sw-dress79-place.ts — dress-79 hash-gated placer: SW CONTEMPLATIVE incense
// stand (nx-dress-sw-incense-001). FINAL siting (re-sited after the first
// live placement exposed a 0.828m terrace-0049 pinch — census bboxes are
// LOCAL-space with large center offsets; hand-SAT assuming center=pos was
// wrong, probe discipline): on the az-232.725 SW corridor, r82.4, off −7.0
// (CW side) — the censer stands 4.6m behind/abreast the dress-8 prayer
// mound (r83, off −2.53), forming ONE devotional station: mound fronting
// the walking line, censer behind it, bowl+ember cresting the mound
// silhouette from the line (eye 1.65m clears the 1.25m mound at 2.5m).
// Full-set scan (182 solids): worst adjacency prayer +2.64m, line clearance
// 6.24m, rim 83.5, cones clear. Entity origin (−55.475, −61.329), yaw
// −52.75° (local +z faces the walking line), py −0.0316 (terrain preflight
// −0.0297..−0.0316 across OBB corners, 2mm spread).
// Local bbox (v2 decode): x −0.761..0.759, z −0.770..0.750, y −0.014..1.286
// (furniture-scale 2.31 m² solid). OBB half x/z 0.760, asset-bbox center
// local (−0.001, −0.010). Approach lane pavers end r71.6 (dress-8 source
// decode) — no lane contact; fat world-coords lane compound exempt from 2D
// SAT per dress-8/dress-1 precedent (guard retained for epoch shifts).
// MIGRATION: entity live at the superseded first-siting tuple
// (−46.69, −0.0349, −65.0) — this placer reseats via remove+spawn (2 verbs,
// 1000ms apart, proven next-place-artwalk-b22 pattern). Gates: exact SHA,
// live blocker-epoch guard, entity collision/drift (old tuple or NEW only),
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt per
// nvp-109..132; solid-solid 1.4m pinch law), 18m arrival-cone check,
// rim-corner law. Static, unlit — no comps, no lamp budget spend (mesh-ember
// emissive only, dress-76 precedent; SW budget 3, used 0).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_sw_incense1.glb`;
const SHA = "c66c4fbfd0adb07bc6901113926295aef454babe75c434a6c2992c041fa164e0";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-sw-incense-001";
const POS = [-55.475, -0.0316, -61.329], YAW = -52.75 * Math.PI / 180;
// superseded first siting (live until this reseat runs) — the only other
// lawful live tuple for this entity
const OLD = { pos: [-46.69, -0.0349, -65.0], yaw: -52.75 * Math.PI / 180 };
// local bbox (v2 decode): x -0.761..0.759, z -0.770..0.750
const HALF = { x: 0.760, z: 0.760 }, CLOCAL = { x: -0.001, z: -0.010 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-approach-sw-lane-003", "nx-dress-sw-gravel-001", "nx-dress-sw-prayer-001", "nx-temple-terrace-0049"];

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
// migration gate: live at the exact NEW tuple (idempotent), the superseded
// OLD tuple (reseat path), or absent (fresh) — anything else = drift
if (e && !(
    (e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1) ||
    (e.lib === LIB && vec(e.pos, OLD.pos) && near(e.yaw ?? 0, OLD.yaw) && (e.scale ?? 1) === 1)
)) die(`${ID} collision/drift`);
// SAT must exclude the OLD-pose footprint when the entity still stands there
const reseat = !!e && !vec(e.pos, POS);
if (reseat && !(e.lib === LIB)) die(`${ID} at old pose with foreign lib`);

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
    // pavers end r71.6, no contact with this r80 pose).
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
u.searchParams.set("name", "commons-next SW district incense stand dress-79");
u.searchParams.set("by", cfg.id);
let uploaded = "";
for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { uploaded = (await r.json()).path; break; }
    if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
    die(`upload HTTP ${r.status}`);
}
if (uploaded !== LIB) die(`upload returned ${uploaded}, expected ${LIB}`);

// verbs: remove+spawn reseat if live at OLD tuple (paced 1000ms); plain
// spawn if absent; no verbs if already live at the exact NEW tuple
if (reseat || !before[ID]) {
    const ws = new WebSocket(cfg.url);
    await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 60_000);
        ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress79-place", avatar: cfg.avatar, token: cfg.joinToken }));
        ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
        ws.onmessage = (ev: any) => {
            const m = JSON.parse(ev.data);
            if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
            if (m.type === "snapshot") {
                if (reseat) setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "remove", args: { id: ID } })), 800);
                setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: 1 } })), reseat ? 1800 : 800);
                setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, reseat ? 3600 : 2600);
            }
        };
    });
} else console.log(`${ID} already live at exact tuple — no verbs`);

// post-place verify
const after = await geom();
const ea = after[ID];
if (!(ea?.lib === LIB && vec(ea.pos, POS) && near(ea.yaw ?? 0, YAW) && (ea.scale ?? 1) === 1)) die(`${ID} post-place failed: ${JSON.stringify(ea)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, pos: POS, yaw: YAW, verbs: reseat ? 2 : before[ID] ? 0 : 1 }));
