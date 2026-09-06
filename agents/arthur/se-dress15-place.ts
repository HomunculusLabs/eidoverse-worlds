// se-dress15-place.ts — dress-15 hash-gated RESEAT placer: SE cairn waymark
// (nx-dress-se-cairn-001) upgraded in place per improve shard row 32.
// v4 build (sha 59031a0c…): squat rebalance + per-course banding + base
// skirt. Same pose as dress-7 (58.70, 0.0076, -58.70) yaw -45deg — the
// reseat is a lib swap at the exact tuple, NOT a re-site.
//
// RESEAT LAW (struct-36 / improve-10 precedent): the entity is LIVE at the
// dress-7 tuple (lib bc601ed2, this exact pos/yaw). Migration gate accepts
// ONLY that exact known old tuple; anything else = real drift -> die.
// Remove verb then spawn verb over ONE join WebSocket (proven pacing:
// one snapshot per join — schedule ALL verbs by timer after the first
// snapshot, never wait for a second). Re-place wipes comps: live bag is
// EMPTY (static unlit spawn-only family, dress-7 record) — verified before
// the verb and asserted empty after.
//
// NAMED exemption (source-true, re-derived THIS tick for the fatter v4
// footprint): nx-wild-forest-0044 census bbox is a fat compound OBB
// (14x15m). Walking-band occupancy decode of live-pinned bytes (lib
// 43e4c8c3 == local retex copy, verified fresh): 130 occupied 1m cells.
// v4 OBB (half 0.911/0.746, center-offset 0.076/-0.082 at this pose)
// exact clearance to nearest occupied cell: 2.427m >= 1.4m pinch law
// (dress15-cairn-clearance.ts). Exempt for forest-0044 ONLY at this pose.
//
// Gates: exact SHA, live blocker-epoch guard, migration tuple gate, 2D
// footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt;
// solid-solid 1.4m pinch law), 18m arrival-cone check, rim-corner law
// (v4 corners 82.35..83.85 in [66,108]). Idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_se_cairn1.glb`;
const SHA = "59031a0cf3e396f9b9e21ee5413112ebcf5d589f4361264a5fbf9fe0f0fb4221";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-se-cairn-001";
const POS = [58.70, 0.0076, -58.70], YAW = -45 * Math.PI / 180;
// local bbox (v4 decode): x -0.835..0.987, z -0.828..0.664, y -0.071..2.307
const HALF = { x: 0.911, z: 0.746 }, CLOCAL = { x: 0.076, z: -0.082 };
// the ONE known-good prior tuple this reseat migrates from (dress-7):
const OLD_LIB = "store/bc601ed2dfc33fa0.glb";
// siting blockers — all must be live
const BLOCKERS = ["nx-wild-forest-0044", "nx-dress-se-stones-001", "nx-wild-cairn-0043",
  "nx-wild-forest-0057"];
const EXEMPT_SAT = new Set(["nx-wild-forest-0044"]);

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number, b: readonly number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));

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
// migration gate: live entity must be EITHER already at the NEW tuple
// (idempotent rerun) OR at the exact known OLD dress-7 tuple. Anything
// else is drift — die.
if (e) {
  const atNew = e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
  const atOld = e.lib === OLD_LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
  if (!atNew && !atOld) die(`${ID} drift: lib ${e.lib} pos ${JSON.stringify(e.pos)} yaw ${e.yaw}`);
  const comps = (e as any).comps ?? (e as any).components ?? {};
  if (Object.keys(comps).length) die(`${ID} carries comps ${JSON.stringify(Object.keys(comps))} — re-place would wipe; capture+reapply required, not an empty-bag reseat`);
}

// SAT + rim + arrival-cone preflight vs fresh live set (v4 footprint)
const A = obb(POS, YAW, HALF, CLOCAL);
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
  if (EXEMPT_SAT.has(id)) { adjacencies.push(`${id}: EXEMPT (source-true 2.427m, see header)`); continue; }
  const B = obb(ent.pos, ent.yaw ?? 0,
    { x: bb.size[0] / 2, z: bb.size[2] / 2 },
    { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
  const g = satGap(A, B);
  if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
  if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
console.log("SAT preflight:", adjacencies.length ? adjacencies.join(", ") : "clear, no sub-1.4m adjacency");

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
u.searchParams.set("name", "commons-next SE district cairn waymark dress-15 v4");
u.searchParams.set("by", cfg.id);
let uploaded = "";
for (let attempt = 1; attempt <= 6; attempt++) {
  const r = await fetch(u, { method: "POST", body: bytes });
  if (r.ok) { uploaded = (await r.json()).path; break; }
  if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
  die(`upload HTTP ${r.status}`);
}
if (uploaded !== LIB) die(`upload returned ${uploaded}, expected ${LIB}`);

// reseat verbs: remove then spawn over ONE join WebSocket, both scheduled
// from the FIRST snapshot by timer (one snapshot per join — server law).
// Paced 1000ms apart, well clear of the 12-verbs/4s fleet limit.
const needVerbs = !e || e.lib !== LIB;
if (needVerbs) {
  const ws = new WebSocket(cfg.url);
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 60_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress15-place", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") {
        setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "remove", args: { id: ID } })), 800);
        setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: 1 } })), 1800);
        setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 3200);
      }
    };
  });
} else console.log(`${ID} already live at NEW tuple — no verbs`);

// post-place verify (tuple + empty comp bag)
const after = await geom();
const ea = after[ID];
if (!(ea?.lib === LIB && vec(ea.pos, POS) && near(ea.yaw ?? 0, YAW) && (ea.scale ?? 1) === 1)) die(`${ID} post-place failed: ${JSON.stringify(ea)}`);
const ac = ea.comps ?? ea.components ?? {};
if (Object.keys(ac).length) die(`${ID} post-place comp bag not empty: ${JSON.stringify(Object.keys(ac))}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, pos: POS, yaw: YAW, verbs: needVerbs ? 2 : 0 }));
