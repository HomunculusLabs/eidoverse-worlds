// se-dress94-place.ts — dress-94 placement: hash-gated placer for the SE
// moss bowls (nx-dress-se-mossbowls-001) at (61.31, 0.0083, -55.20) yaw -45°
// in the forest-0057 edge margin, az -42 r 82.5, spokeOff 4.3m.
//
// Siting evidence (this tick, fresh census 276 + v11 bytes 6d598bd5): scan
// pose chosen concept-first (damp hollow at the forest edge) over the
// tightest-gap seat — SAT minGap 1.71 vs nx-wild-forest-0057 (fat forest
// bbox, ordinary SAT pass), 1.77 vs nx-dress-se-cairn-001, cairn cluster
// az -50 avoided so both identities stay clean; rim corners 79.0..93.4 ∈
// [70,100] (city-plan district band); approach-cone law: piece h 0.407 <
// knee — below-knee exemption, cone count disclosed in the scan (229 poses
// would have died an over-height piece); terrain 5-pt spread 5.9mm, py
// pinned to worst corner +0.0083.
//
// Orientation: approach face (local -z, broken lip + spill) -> world az
// 135°, toward the SE spoke walker (spokeOff 4.3m).
//
// Static, no comps — spawn-only family; SE lamp spend 0 of 8 (pool emissive
// is MESH emissive, dress-79 precedent). Gates: exact SHA, live
// blocker-epoch guard, entity collision/drift, 2D footprint SAT vs FRESH
// live set (thin ground films h<=0.5 exempt), rim, post-place tuple verify,
// idempotent rerun. dress-84 chassis.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_se_mossbowls1.glb`;
const SHA = "6d598bd526ba392958871ec1c94b1e2336b8a2e761cace534ad6d385e79a0069";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-se-mossbowls-001";
const POS = [61.31, 0.0083, -55.20], YAW = -45 * Math.PI / 180; // -0.7853981633974483
// local bbox (v11 decode): x -1.5336..1.7040 (center +0.0852, half 1.6188),
// z -1.1902..1.5656 (center +0.1877, half 1.3779)
const HALF = { x: 1.6188, z: 1.3779 }, CLOCAL = { x: 0.0852, z: 0.1877 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-wild-forest-0057", "nx-wild-cairn-0047", "nx-wild-forest-0031"];

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
// district rim law (annulus + city-plan district band)
{
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const cs: [number, number][] = [[-HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [-HALF.x + CLOCAL.x, HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, HALF.z + CLOCAL.z]];
  const rs = cs.map(([lx, lz]) => Math.hypot(POS[0] + lx * cos + lz * sin, POS[2] - lx * sin + lz * cos));
  const lo = Math.min(...rs), hi = Math.max(...rs);
  if (lo < 70 || hi > 100) die(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} outside city-plan district band [70,100]`);
  console.log(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} ∈ [70,100]`);
}

// upload (content-addressed; 429 backoff for the shared 4/min fleet budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next SE moss bowls dress-94");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-se-dress94-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
