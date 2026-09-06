// ne-dress9-place.ts — dress-9 hash-gated placer: NE firewood woodstack
// (nx-dress-ne-woodstack-001) against craft-hamlet-0028's plaza-ward flank
// (local +z wall, source-decoded plane z=+6.51), center (59.708, 51.781),
// yaw -135deg (asset local +z = hamlet local +z = plaza-ward; pale end
// caps face the approach). Siting math + terrain preflight in
// DRESSING-PLAN.md dress-9.
// Final footprint (v5 decode): x -1.5..1.5, z -0.75..1.32 (center +0.285),
// y -0.092..1.145. Rim corners 77.91..80.18 in [66,108]. Terrain flat
// (py -0.032, d2mm across corners).
// Gates: exact SHA, live blocker-epoch guard, entity collision/drift,
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt).
//
// SAT exemptions (exemption ladder, numbers from source decode):
// 1. HOST nx-craft-hamlet-0028 (fat compound OBB, source-true plan is a
//    14.0 x 13.4 L-shell): local file agents/arthur/mason/glb-retex/
//    work_1648_hamlet.glb, sha 032b6e24f4c4a142… == live lib prefix
//    (verified this tick). Source-decode bbox x -6.923..7.064,
//    z -6.913..6.51. The flank WALL plane is local z = +6.51; the stack
//    sits at lcz = 6.51 + 1.035 + 1.5 = 9.045 — REAL source-true gap to
//    the wall 1.5m, stack fully OUTSIDE the plan footprint. Back-to-wall
//    class, dress-1/dress-5 host precedent.
// 2. nx-craft-statuary-0026 / -0039: census bbox 11.84 x 11.84 square is
//    a fat proxy — source-true geometry is a DISC r5.92 (struct-19 law:
//    square-bbox SAT inflates a round work by ~2.5m of dead corners).
//    Exact disc-vs-OBB clearance computed in-placer: >= +2.96m both.
// Static, unlit — no comps, spends no lamp budget. Idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_ne_woodstack1.glb`;
const SHA = "c832da5d691befe24b2e4b8adf098b0b486262f6b9604df99059322ec29a7d7b";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-ne-woodstack-001";
const POS = [59.708, -0.032, 51.781], YAW = -135 * Math.PI / 180;
// local bbox (v5 decode): x -1.5..1.5, z -0.75..1.32, y -0.092..1.145
const HALF = { x: 1.5, z: 1.035 }, CLOCAL = { x: 0.0, z: 0.285 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-craft-hamlet-0028", "nx-craft-statuary-0026",
  "nx-craft-statuary-0039", "nx-craft-cloister-0016"];
// source-true round works near this site: exact disc-vs-OBB, not square SAT
const DISCS: Record<string, number> = {
  "nx-craft-statuary-0026": 5.92,
  "nx-craft-statuary-0039": 5.92,
};
// host: back-to-wall flank class, source-true exemption (header above)
const HOST_EXEMPT = "nx-craft-hamlet-0028";

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
// exact disc-vs-OBB signed clearance (struct-19 law): overlap iff dist < R
function discClear(a: OBB, cx: number, cz: number, R: number): number {
  const dx = cx - a.cx, dz = cz - a.cz;
  const du = Math.abs(dx * a.ux[0] + dz * a.ux[1]) - a.hu[0];
  const dv = Math.abs(dx * a.uz[0] + dz * a.uz[1]) - a.hu[1];
  return Math.hypot(Math.max(du, 0), Math.max(dv, 0)) - R;
}

const bytes = readFileSync(FILE);
const hash = createHash("sha256").update(bytes).digest("hex");
if (hash !== SHA) die(`reviewed hash mismatch: ${hash}`);

const before = await geom();
for (const b of BLOCKERS) if (!before[b]) die(`siting blocker ${b} missing from live census — census epoch changed, re-derive`);
const e = before[ID];
if (e && !(e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1)) die(`${ID} collision/drift`);

// SAT preflight vs fresh live set.
const A = obb(POS, YAW, HALF, CLOCAL);
const adjacencies: string[] = [];
for (const [id, ent] of Object.entries(before)) {
  if (id === ID || !ent.lib || !ent.pos) continue;
  const bb = ent.bbox;
  if (!bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin ground film — SAT-exempt class
  if (id === HOST_EXEMPT) continue;           // source-true back-to-wall exemption (header)
  if (id in DISCS) {                          // exact disc-vs-OBB for round works
    const g = discClear(A, ent.pos[0], ent.pos[2], DISCS[id]);
    if (g < 0) die(`disc overlap vs ${id}: clearance ${g.toFixed(3)}m`);
    if (g < 1.4) adjacencies.push(`${id}(disc): ${g.toFixed(3)}m`);
    continue;
  }
  const B = obb(ent.pos, ent.yaw ?? 0,
    { x: bb.size[0] / 2, z: bb.size[2] / 2 },
    { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
  const g = satGap(A, B);
  if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
  if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
console.log("SAT preflight clear; sub-1.4m solid adjacencies:", adjacencies.length ? adjacencies.join(", ") : "none");

// upload (content-addressed; 429 backoff for the shared 4/min fleet budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next NE district woodstack dress-9");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress9-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
