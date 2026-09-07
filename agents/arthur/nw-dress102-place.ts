// nw-dress102-place.ts — dress-102 placement: hash-gated placer for the NW
// fieldcross (nx-dress-nw-fieldcross-001, dress-101 build v7) at
// lavender-0053's W end.
//
// Siting contract (dress-100/101, this tick closes it):
// - Host bed nx-cultivation-lavender-0053 live at (-24.825, 77.243) yaw
//   2.3562 (+135deg); its W end faces the field. The crossing's corridor
//   (local z 0 -> -6.685, mown walk-line local x +0.2336) threads the bed
//   end: piece local +z (z<=0 by v7 boundary clamp) mounts FLUSH to the
//   bed's W face — designed -0.002m host gap, dress-99 flush-mount class.
// - Pose (-17.845, 84.294) yaw -2.35619 (-135deg exactly), derived
//   dress-100, re-gated dress-101 (TRUE v7 dims after the boundary clamp)
//   and re-verified THIS tick vs a fresh 283-entity census (host flush
//   -0.002, rim 85.457..91.037, ninesbridge/echoarch cones clear).
// - Terrain preflight (next-terrain-dress102-fieldcross.ts, THIS tick):
//   corners -0.0023..0.0106 (12.9mm spread) -> py pinned to worst corner
//   -0.0023. Walk line flat (0.0009..0.0053).
//
// Build v7: sha 7750e9b7... (deterministic x2 THIS tick). 8 nodes, 1320
// verts, dims 2.153x6.689, static unlit, no light anchors, empty comp bag
// by design. NW lamp spend 0 of 2.
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt),
// ONE named tier-b gap-bounded exemption (host flush, artwalk-34/36/37
// ladder), rim [66,108] + CITY-PLAN band r70-100, arrival-cone bearing-ray
// re-check (dress-90 law), post-place tuple verify, idempotent rerun.
// dress-95/96 chassis, spawn-only (NEW entity, no comp pass).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_nw_fieldcross1.glb`;
const SHA = "7750e9b717f2b39a61fab4241d9f7da1b7d25611805387888f81b3b609c62d9c";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-nw-fieldcross-001";
const POS: [number, number, number] = [-17.845, -0.0023, 84.294], YAW = -2.356194490192345;
// local bbox (v7 TRUE decode, boundary-clamped): x -0.843..+1.310,
// z -6.685..+0.004 — same constants as dress101-pregate.py so the pinned
// expectations match bit-for-bit
const HALF = { x: 1.0766, z: 3.3425 }, CLOCAL = { x: 0.2336, z: -3.3425 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-cultivation-lavender-0053", "nx-struct-ninesbridge",
  "nx-struct-echoarch"];

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

// 2D OBB SAT, max separating-axis gap (axis convention align-1)
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
// dress-102 NAMED tier-b gap-bounded exemption (artwalk-34/36/37 ladder):
// the ONLY sub-1.4m seam is the HOST BED itself — lavender-0053's bbox
// (h 0.55, just over the film threshold) reads -0.002 vs the crossing
// because v7 boundary-clamps every corridor loop to local z<=0: the piece
// ENDS at the bed's W face by design (dress-99 flush-mount class; the
// dress-100 concept seats the crossing AT the bed end so the mown line
// continues into the bed's real center trench). Not a wall contact: bed
// plant mass starts above py 0.15, crossing base at py -0.0023, and the
// corridor is the walkable gap itself. Pin is exact-match ±0.01m: any
// REAL drift against the bed hard-fails.
const EXEMPT: Record<string, number> = {
  "nx-cultivation-lavender-0053": -0.002,
};
for (const [id, ent] of Object.entries(before)) {
  if (id === ID || !ent.lib || !ent.pos) continue;
  const bb = ent.bbox;
  if (!bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin ground film — SAT-exempt class
  const B = obb(ent.pos, ent.yaw ?? 0,
    { x: bb.size[0] / 2, z: bb.size[2] / 2 },
    { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
  const g = satGap(A, B);
  if (id in EXEMPT) {
    if (Math.abs(g - EXEMPT[id]) > 0.01) die(`${id} tier-b pin drift: gap ${g.toFixed(3)} vs pinned ${EXEMPT[id]}`);
    continue; // gap-bounded exact-match exemption holds
  }
  if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
  if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
if (adjacencies.length) die(`unexplained sub-1.4m solid adjacency: ${adjacencies.join(", ")}`);
console.log(`SAT preflight clear (1 named tier-b exemption: host flush); no other sub-1.4m adjacency`);

// district rim law + CITY-PLAN band r70-100 (law 1 header, DRESSING-PLAN)
{
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const cs: [number, number][] = [[-HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, -HALF.z + CLOCAL.z], [-HALF.x + CLOCAL.x, HALF.z + CLOCAL.z], [HALF.x + CLOCAL.x, HALF.z + CLOCAL.z]];
  const rs = cs.map(([lx, lz]) => Math.hypot(POS[0] + lx * cos + lz * sin, POS[2] - lx * sin + lz * cos));
  const lo = Math.min(...rs), hi = Math.max(...rs);
  if (lo < 66 || hi > 108) die(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} outside [66,108]`);
  if (lo < 70) die(`rim low corner ${lo.toFixed(1)} inside CITY-PLAN closed band r<70`);
  console.log(`rim corners ${lo.toFixed(1)}..${hi.toFixed(1)} ∈ [66,108] and CITY-PLAN band`);
}

// arrival-cone re-check (dress-90 law, fresh live tuples)
for (const wid of ["nx-struct-ninesbridge", "nx-struct-echoarch"]) {
  const w = before[wid];
  if (!w?.pos) continue;
  const wyaw = w.yaw ?? 0;
  const fx = Math.sin(wyaw), fz = Math.cos(wyaw);
  const dx = A.cx - w.pos[0], dz = A.cz - w.pos[2];
  const dist = Math.hypot(dx, dz);
  const bearing = Math.atan2(dx, dz), facing = Math.atan2(fx, fz);
  let off = bearing - facing;
  while (off > Math.PI) off -= 2 * Math.PI;
  while (off < -Math.PI) off += 2 * Math.PI;
  if (Math.abs(off) <= 25 * Math.PI / 180 && dist <= 18) die(`${wid} approach cone violated: off ${(off * 180 / Math.PI).toFixed(1)}deg @ ${dist.toFixed(2)}m`);
}
console.log(`arrival cones clear (ninesbridge, echoarch)`);

// upload (content-addressed; 429 backoff for the shared 4/min fleet budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next NW fieldcross dress-101 v7");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-nw-dress102-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
