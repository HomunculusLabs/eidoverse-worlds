// ne-dress142-place.ts — dress-142 survey-57 cure re-place (improve-13
// migration class): nx-dress-ne-timberyard-001 same-tuple refinement
// v5 10b449fa -> v9 dfafb8c8 (native 18m PASS + close PASS this tick).
// Pose UNCHANGED from dress-83: (76.7, -0.006, 69.4) yaw -2.35619 —
// same identity face (+z caps toward plaza bisector), same py (same
// terrain, 5pt spread was 10mm at dress-83). TRUE v9 decode dims:
// x -1.564..1.564, z -0.900..1.790, center (0, 0.445), height 1.646.
// Migration law: live entity must stand at the EXACT old tuple+lib
// (10b449fa) or the exact new tuple+lib (idempotent rerun) — anything
// else is real drift and dies. Two verbs (remove, spawn 700ms apart).
// Static, no comps (comp bag {} both sides — census-verified this tick),
// no lamp draw (NE 0 of 10).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_ne_timberyard1.glb`;
const SHA = "dfafb8c800cf6e903ec3d4eb00996c6a2ae799a436ea794933d457d37e675785";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const OLD_LIB = "store/10b449fa8338015e.glb";
const ID = "nx-dress-ne-timberyard-001";
const POS = [76.7, -0.006, 69.4], YAW = -2.356194490192345;
// local bbox (v9 true decode): x -1.564..1.564, z -0.9..1.79 (center z 0.445)
const HALF = { x: 1.564, z: 1.345 }, CLOCAL = { x: 0, z: 0.445 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-craft-cloister-0016", "nx-craft-hamlet-0028", "nx-craft-cloister-0029"];

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
const atOld = e && e.lib === OLD_LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
const atNew = e && e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
if (!e) die(`${ID} missing from live census — expected live at old tuple for migration`);
if (!atOld && !atNew) die(`${ID} collision/drift: lib ${e.lib} pos ${JSON.stringify(e.pos)} yaw ${e.yaw}`);
if (atNew) console.log(`${ID} already live at NEW tuple — idempotent, no verbs`);
if (atOld) console.log(`${ID} live at OLD v5 tuple — sanctioned remove+spawn migration to v9`);

// SAT preflight vs fresh live set (own entity excluded — same slot)
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
console.log("SAT preflight clear; sub-1.4m solid adjacencies:", adjacencies.length ? adjacencies.join(", ") : "none");
// district rim law [66,108] — v9 true dims
{
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  const cs: [number, number][] = [[-1.564, -0.9], [1.564, -0.9], [-1.564, 1.79], [1.564, 1.79]];
  const rs = cs.map(([lx, lz]) => Math.hypot(POS[0] + lx * cos + lz * sin, POS[2] - lx * sin + lz * cos));
  const lo = Math.min(...rs), hi = Math.max(...rs);
  if (lo < 66 || hi > 108) die(`rim corners ${lo.toFixed(2)}..${hi.toFixed(2)} outside [66,108]`);
  console.log(`rim corners ${lo.toFixed(2)}..${hi.toFixed(2)} in [66,108]`);
}

// upload (content-addressed; 429 backoff for the shared 4/min fleet budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next NE timber yard dress-142 v9");
u.searchParams.set("by", cfg.id);
let uploaded = "";
if (atNew) {
  uploaded = LIB; // idempotent path — bytes already in store, skip upload
} else {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { uploaded = (await r.json()).path; break; }
    if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
    die(`upload HTTP ${r.status}`);
  }
  if (uploaded !== LIB) die(`upload returned ${uploaded}, expected ${LIB}`);
}

// remove+spawn migration (artwalk-33/proven next-place-artwalk-b22 shape:
// BOTH verbs scheduled off the FIRST snapshot by timer, then close after
// the last + margin — the server sends one snapshot per join, not per verb)
if (atOld) {
  const ws = new WebSocket(cfg.url);
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 60_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress142-place", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") {
        setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "remove", args: { id: ID } })), 800);
        setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: 1 } })), 1500);
        setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 3300);
      }
    };
  });
}

// post-place verify
await sleep(1200);
const after = await geom();
const ea = after[ID];
if (!(ea?.lib === LIB && vec(ea.pos, POS) && near(ea.yaw ?? 0, YAW) && (ea.scale ?? 1) === 1)) die(`${ID} post-place failed: ${JSON.stringify(ea)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, pos: POS, yaw: YAW, verbs: atNew ? 0 : 2 }));
