// sw-dress86-place.ts — dress-86 placement: hash-gated placer for the SW
// bell post (nx-dress-sw-bellpost-001) at (-54.0, -69.8) yaw -24.7°, outside
// the devotional-line bend (gravel az 53 -> labyrinth az 233; bend apex
// (-47.4, -62.4); piece 9.9m beyond the bend on the outside edge, facing the
// bisector of the two approach bearings). Siting math + re-site scan in
// DRESSING-PLAN.md dress-86.
//
// Siting evidence (this tick, FRESH census 270, /tmp/dress86-census.json):
// dress-85's hand pocket (-44.6,-68.8) DEAD on fresh SAT (-3.13m overlap vs
// terrace-0049) AND inside the labyrinth's 18m approach cone (16.1m, 4.9°
// off the true devotional axis — the dress-85 derivation had checked only
// the prayer cone). 0.3m-grid scan of the bend neighborhood (outside-bend
// filter, ≥3.2m from both walking-line segments, rim, cone law incl. the
// labyrinth's devotional axis) found 49 legal poses; winner (-54.0,-69.8):
// walking-line clearance 4.83m (min of both segments), SAT margins at
// yaw -24.7°: terrace-0049 +2.88m, labyrinth-0038 +3.15m, prayer-001
// +3.32m, approach-sw-lane-003 +10.79m (nothing sub-1.4m; no exemption
// ladder needed); disc clearances (struct-19 law): seed-0021 +14.10m,
// seed-0034 +24.39m, labyrinth +6.88m; approach cones CLEAR for every
// r≥35 solid (labyrinth judged against its true devotional axis, not
// work->origin); rim corners at final yaw 87.4..88.9 ∈ [66,108].
// Terrain 5-pt (dress86-terrain.ts): -0.0282..-0.0294 (1.2mm spread) ->
// py pinned to worst corner -0.0294.
//
// Orientation: local +x (bell arm) -> world az ~-115°, pointing across the
// bend gap toward the open field (NE-ward); local -z (mouth face normal)
// -> world az ~215°; inbound walker at az -37.3 sees the mouth ~53° off
// frontal — passing read; outbound at az -12.3 sees it near-full frontal.
// Yaw -24.7° = bisector of the two approach bearings (-37.3, -12.3).
//
// Static, no comps — spawn-only family; bell carries mesh-emissive 0.22
// (polish-273 class, zero lamp draw). SW lamp spend 0 of 3.
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt), rim,
// post-place tuple verify, idempotent rerun. dress-76/84 chassis.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_sw_bellpost1.glb`;
const SHA = "1ea38f613295a46a889608b912fa1779d8ce53a7175d0b96ec8e095b94ce8437";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-sw-bellpost-001";
const POS = [-54.0, -0.0294, -69.8], YAW = -24.7 * Math.PI / 180;
// local bbox (v4 decode): x -0.551..0.549 (center -0.001, half 0.550),
// z -0.499..0.871 (center +0.186, half 0.685)
const HALF = { x: 0.550, z: 0.685 }, CLOCAL = { x: -0.001, z: 0.186 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-temple-terrace-0049", "nx-temple-labyrinth-0038",
  "nx-dress-sw-prayer-001", "nx-dress-sw-gravel-001"];

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
u.searchParams.set("name", "commons-next SW bell post dress-86");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-sw-dress86-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
