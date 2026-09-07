// sw-dress91-place.ts — dress-91 RESEAT of nx-dress-sw-bellpost-001 (survey-29
// bellpost cure): same tuple lib-swap 1ea38f61 (v2/v4 bytes) -> fe682869 (v6),
// remove+spawn over one join WS (artwalk-33 law: spawn does NOT move an
// existing entity). Siting unchanged from dress-86 (outside the devotional
// bend, (-54.0, -69.8) yaw -24.7° bisector of the inbound/outbound bearings);
// all dress-86 siting evidence carries (walking-line clearance 4.83m, terrace
// +2.88 / labyrinth +3.15 / prayer +3.32 margins at the OLD dims — re-gated
// FRESH here against the v6 dims below).
//
// v6 decode (TRUE dims, accessor min/max): x -0.551..1.106 (center +0.2775,
// half 0.8285), z -0.499..0.601 (center +0.051, half 0.550). The arm now
// reaches local +x 0.92 (matches the seated orientation contract: local +x
// (bell arm) -> world az ~-115°, across the bend gap — the v2-v4 +z arm was
// the foreshortening root cause of the lamp/torch read).
//
// Gates: exact SHA, live blocker-epoch guard, entity migration gate (live
// must be the KNOWN old pin or the new pin — any other tuple = drift die),
// 2D footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt), rim
// [66,108], post-place tuple verify, idempotent 0-verb rerun.
// Static, no comps — spawn-only family; SW lamp spend 0 of 3.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_sw_bellpost1.glb`;
const SHA = "fe682869f9a759aff6ff0298ab28802800bf18681da0a7bb07e0280b56e2a57a";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const OLD_LIB = "store/1ea38f613295a46a.glb"; // dress-86 seated bytes (v2/v4)
const ID = "nx-dress-sw-bellpost-001";
const POS = [-54.0, -0.0294, -69.8], YAW = -24.7 * Math.PI / 180;
// local bbox (v6 decode): x -0.551..1.106 (center +0.2775, half 0.8285),
// z -0.499..0.601 (center +0.051, half 0.550)
const HALF = { x: 0.8285, z: 0.550 }, CLOCAL = { x: 0.2775, z: 0.051 };
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
const atNewPin = !!(e && e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1);
const atOldPin = !!(e && e.lib === OLD_LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1);
if (e && !atNewPin && !atOldPin) die(`${ID} drift: live ${e.lib} @ ${JSON.stringify(e.pos)} yaw ${e.yaw} — not the known old pin nor the new pin`);

// SAT preflight vs fresh live set (excluding our own entity while it stands)
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
console.log(`SAT preflight clear (v6 dims); no sub-1.4m adjacency`);
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
u.searchParams.set("name", "commons-next SW bell post dress-91 v6");
u.searchParams.set("by", cfg.id);
let uploaded = "";
for (let attempt = 1; attempt <= 6; attempt++) {
  const r = await fetch(u, { method: "POST", body: bytes });
  if (r.ok) { uploaded = (await r.json()).path; break; }
  if (r.status === 429 && attempt < 6) { await sleep(25_000); continue; }
  die(`upload HTTP ${r.status}`);
}
if (uploaded !== LIB) die(`upload returned ${uploaded}, expected ${LIB}`);

// reseat: remove + spawn over one join WS (first-snapshot timer law) unless
// already standing at the NEW pin (idempotent rerun = zero verbs)
if (!atNewPin) {
  const ws = new WebSocket(cfg.url);
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("verb timeout")); }, 60_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-sw-dress91-place", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("websocket error")); };
    ws.onmessage = (ev: any) => {
      const m = JSON.parse(ev.data);
      if (m.type === "error") { clearTimeout(timer); reject(new Error(`server ${JSON.stringify(m).slice(0, 240)}`)); return; }
      if (m.type === "snapshot") {
        // ONE snapshot per join: schedule ALL verbs by timer, 1000ms apart
        setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "remove", args: { id: ID } })), 800);
        setTimeout(() => ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: ID, lib: LIB, pos: POS, yaw: YAW, scale: 1 } })), 1800);
        setTimeout(() => { clearTimeout(timer); try { ws.close(); } catch {} resolve(); }, 3600);
      }
    };
  });
} else console.log(`${ID} already live at NEW pin — no verbs`);

// post-place verify
const after = await geom();
const ea = after[ID];
if (!(ea?.lib === LIB && vec(ea.pos, POS) && near(ea.yaw ?? 0, YAW) && (ea.scale ?? 1) === 1)) die(`${ID} post-place failed: ${JSON.stringify(ea)}`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", lib: LIB, entity: ID, pos: POS, yaw: YAW, verbs: atNewPin ? 0 : 2, comps: ea.comps ?? null }));
