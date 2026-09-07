// nw-dress88-place.ts — dress-88 placement: hash-gated placer for the NW
// herb-drying racks (nx-dress-nw-dryingracks-001, dress-87 build v2) at
// (-59.0, 33.0) yaw 2.3562 — the NW approach lane's WEST flank at
// lavender-0027's south edge: the field-mouth headland where the walker
// leaves the paved lane for the cultivation district.
//
// Siting evidence (this tick, FRESH census 271):
// - dress-87's hand-derived pocket (-36.5, 57.5) DEAD on fresh verification
//   (third consecutive hand-pocket failure — dress-85/86/88 pattern): SAT
//   1.31m vs nx-dress-nw-hedge-001, inside the 1.4m pinch law.
// - Full-NW-annulus re-derivation (22,954 cells, free yaw, coverage asserted
//   — first scan grid covered only a diagonal strip and read 0-legal, a
//   pitfall-7 coverage bug): 6,076 legal cells; corridor band (|lat|<=20 off
//   az-45 spoke) holds 214. Family A (lavender-0053, (-20,72.5)) rejected on
//   register — 13m from nx-struct-ninesbridge, 15.5m from nx-struct-echoarch:
//   struct N-spoke landmark crowding, wrong family for dressing. Family B
//   (lavender-0006, (-69.5,19.5)) 30m+ off any walking line — invisible.
//   Winner: corridor end, lane W flank at lavender-0027's south edge.
// - SAT at final pose: nx-approach-nw-lane-001 +5.23m (worst), milestones
//   +7.7m, orchard-0020 +10.4m, skeps +11.9m — nothing sub-1.4m, no
//   exemption ladder. Rack fully OUTSIDE every cultivation plot OBB with
//   2.17m clearance (headland piece, not on crop rows — plots are thin films
//   so plain SAT cannot catch this; explicit corner-distance check).
// - Rim corners 66.3..68.9 ∈ [66,108] ✓. Cone law: no r>=35 solid within
//   18m/25deg of its plaza-ward axis at this pose (nearest milestones 7.7m
//   SAT but >25deg off-axis; scan-checked).
// - Terrain 5-pt (dress88-terrain.ts): corners -0.0009..0.0103 (11mm
//   spread) -> py pinned to worst corner -0.0009.
// - Orientation: yaw 2.3562 = long axis parallel to the field rows
//   (lavender-0027 yaw); hung bundles face the walking lane (local -z ->
//   world az ~45, toward the lane edge 5.4m away).
//
// Static, no comps — spawn-only family; no light anchors (empty comp bag by
// design). NW lamp spend 0 of 2.
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt), rim,
// post-place tuple verify, idempotent rerun. dress-76/84/86 chassis.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_nw_dryingracks1.glb`;
const SHA = "f0343efb6e7ab0fa3e20fdfca05126f9a57cab3e2841f8023545306fdad1ebff";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-nw-dryingracks-001";
const POS = [-59.0, -0.0009, 33.0], YAW = 2.3562;
// local bbox (v2 decode): x -2.244..2.032 (center -0.106, half 2.138),
// z -0.724..0.731 (center +0.0035, half 0.7275)
const HALF = { x: 2.138, z: 0.7275 }, CLOCAL = { x: -0.106, z: 0.0035 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-approach-nw-lane-001", "nx-cultivation-lavender-0027",
  "nx-mile-nw-001", "nx-mile-nw-002"];

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

// 2D OBB SAT, max separating-axis gap (axis convention align-1:
// local-x -> (cos,-sin), local-z -> (sin,cos); positive = separated).
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
u.searchParams.set("name", "commons-next NW drying racks dress-88");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-nw-dress88-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
