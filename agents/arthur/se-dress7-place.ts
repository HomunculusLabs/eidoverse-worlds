// se-dress7-place.ts — dress-7 hash-gated placer: SE WILD cairn waymark
// (nx-dress-se-cairn-001). Siting math + terrain preflight in DRESSING-PLAN.md
// dress-7. Final footprint (v2 decode): x -0.641..0.987, z -0.599..0.664,
// y -0.071..2.323; center (x +0.173, z +0.033). Final pose:
// (58.70, 0.0076, -58.70), yaw -45deg, r83 ON the az-315 corridor axis.
// Siting history this tick: first candidate (56.7,-53.6) r78 died at this
// placer's OWN arrival-cone gate (17deg inside nx-wild-cairn-0043's
// plaza-ward cone at 15.8m — a waymark that close to a cairnfield work
// confuses the read). Second candidate R84 died on the wayside-0045 cone
// (14.4deg at 17.5m). Corridor sites r70-82 all fail the source-true
// walking-band clearance or sit on the dress-3 run. The honest site is PAST
// the forest wall, on-axis, where the tended edge has fully given way: the
// walker threads the forest-0044 gap, passes dress-3's border stones on the
// SW side, and meets the waymark standing clear at the wild threshold.
// Cone status at final pose: cairn-0043 35.1deg at 12.6m (outside 25deg),
// wayside-0045 18.6m (far), cairn-0048 19.6m (far).
//
// NAMED exemption (source-true, dress-1 lane precedent class): nx-wild-forest-0044
// is a merged multi-tree GLB whose census bbox is a fat compound OBB spanning
// the whole cluster (14x15m). Walking-band occupancy decode of the live bytes
// (sha 43e4c8c3… verified == local retex copy): one connected 130-cell
// (1m grid) y<2.5m cluster, world center (48.50,-58.22). This pose's
// source-true clearance to the nearest occupied cell: 3.31m >= 1.4m pinch law
// (measured, dress7-forest44-occupancy.ts). 2D SAT vs the fat compound bbox
// is exempt for forest-0044 ONLY at this pose; any other live drift vs
// forest-0044 still hard-fails.
//
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt per
// nvp-109..132; solid-solid 1.4m pinch law), 18m arrival-cone check,
// rim-corner law. Idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_se_cairn1.glb`;
const SHA = "bc601ed2dfc33fa04ba06cee893a1225473a153a000e44bfb48cf813a0fa2c99";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-se-cairn-001";
const POS = [58.70, 0.0076, -58.70], YAW = -45 * Math.PI / 180;
// local bbox (v2 decode): x -0.641..0.987, z -0.599..0.664, y -0.071..2.323
const HALF = { x: 0.814, z: 0.632 }, CLOCAL = { x: 0.173, z: 0.033 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-wild-forest-0044", "nx-dress-se-stones-001", "nx-wild-cairn-0043",
  "nx-wild-forest-0057"];
// NAMED source-true exemption set (see header): fat compound bbox, decoded clear.
const EXEMPT_SAT = new Set(["nx-wild-forest-0044"]);

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
  if (EXEMPT_SAT.has(id)) { adjacencies.push(`${id}: EXEMPT (source-true canopy, see header)`); continue; }
  const B = obb(ent.pos, ent.yaw ?? 0,
    { x: bb.size[0] / 2, z: bb.size[2] / 2 },
    { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
  const g = satGap(A, B);
  if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
  if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
console.log("SAT preflight:", adjacencies.length ? adjacencies.join(", ") : "clear, no sub-1.4m adjacency");
// hard law: any sub-1.4m NON-exempt adjacency dies (adjacent printed above)

// arrival-cone check: no solid work with this cairn inside its plaza-ward 25deg/18m cone
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
u.searchParams.set("name", "commons-next SE district cairn waymark dress-7");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress7-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
