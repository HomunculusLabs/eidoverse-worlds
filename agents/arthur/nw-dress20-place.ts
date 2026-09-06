// nw-dress20-place.ts — dress-20 hash-gated RESEAT placer: NW skeps
// (nx-dress-nw-skeps-001) upgraded in place per improve shard row 37
// (native rejudge on exact live bytes CONFIRMED "plank reads debris" +
// "boulder value-fuses with skep 2 as near-black intruder"; v4 clumps +
// v4 in-row boulder root-caused at source). v6 build (sha 87d2dd16…):
// spill clumps REMOVED (2nd failed accent; minimalism law — out, not up),
// wind-break boulder moved past the row's left end (x −2.75, behind-line
// z −1.85), shrunk r0.36, sunk to top ~0.57 (below every skep top ~0.81),
// lightened ROCK→ROCK_LT plinth-family stone. Same pose as dress-5
// (−53.566, 0.038, 54.5) yaw 135° — a lib swap at the exact tuple, NOT a
// re-site.
//
// RESEAT LAW (struct-36 / dress-15/18/19 precedent): the entity is LIVE
// at the dress-5 tuple (lib 806f2c4e02e1d29e, this exact pos/yaw).
// Migration gate accepts ONLY that exact known old tuple (or the NEW
// tuple for idempotent rerun); anything else = drift -> die. Remove then
// spawn over ONE join WebSocket, both scheduled from the FIRST snapshot
// by timer (one snapshot per join — server law), paced 1000ms apart.
// Re-place wipes comps: live bag is EMPTY (static unlit spawn-only
// family, dress-5 record + fresh census this tick) — asserted empty
// before the verb and after.
//
// Footprint: v6 bbox x −3.089..2.32 (center −0.385), z −2.197..0.55
// (center −0.824), y −0.14..0.81. x/z envelope CHANGED vs v4 (clumps gone
// right, boulder out left) — SAT re-derives fresh vs the live set with the
// v6 constants below. (v4 local: x −2.22..3.54, z −2.34..1.12.)
//
// SAT exemptions (inherited from dress-5, re-verified live this tick):
// 1. HOST nx-cult-orchard-0033 (fat compound canopy OBB): the skep row
//    stands on the orchard's SE-facing edge line — dress-5's standing
//    precedent class (dressing grounds AT the host it serves). Census
//    bbox is a fat canopy proxy; the row is 1.5m+ outside the real
//    canopy extent at the standing pose.
// 2. Host-pair light companion nx-approach-nw-lane-001 lights: thin
//    ground-layer class, SAT-exempt by the standing ground-film rule.
// Gates: exact SHA, live blocker-epoch guard, migration tuple gate, 2D
// footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt;
// solid-solid 1.4m pinch law), rim-corner law. Idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_nw_skeps1.glb`;
const SHA = "87d2dd169f2164147c679a7dc7eebc8d30e3024ef52d1aaa694608d15218e972";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-nw-skeps-001";
// YAW is the dress-5 LIVE literal 2.3562 (spawned rounded, NOT full 3π/4
// 2.35619449…, Δ5.5e-6) — the reseat preserves the standing tuple bit-exact.
const POS = [-53.566, 0.038, 54.5], YAW = 2.3562;
// local bbox (v6 decode): x −3.089..2.32, z −2.197..0.55, y −0.14..0.81
const HALF = { x: 2.7045, z: 1.3735 }, CLOCAL = { x: -0.3845, z: -0.8235 };
// the ONE known-good prior tuple this reseat migrates from (dress-5):
const OLD_LIB = "store/806f2c4e02e1d29e.glb";
// siting blockers (dress-5 pose contract) — all must be live
const BLOCKERS = ["nx-cultivation-orchard-0033", "nx-dress-nw-hedge-001", "nx-approach-nw-lane-001"];
// host: standing dress-5 back-to-edge precedent (header above)
const HOST_EXEMPT = "nx-cultivation-orchard-0033";

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: any, b: readonly number[]) => Array.isArray(a) && a.length === b.length && a.every((n: any, i: number) => near(n, b[i]));

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
// (idempotent rerun) OR at the exact known OLD dress-5 tuple. Anything
// else is drift — die.
if (e) {
  const atNew = e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
  const atOld = e.lib === OLD_LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
  if (!atNew && !atOld) die(`${ID} drift: lib ${e.lib} pos ${JSON.stringify(e.pos)} yaw ${e.yaw}`);
  const comps = (e as any).comps ?? (e as any).components ?? {};
  if (Object.keys(comps).length) die(`${ID} carries comps ${JSON.stringify(Object.keys(comps))} — re-place would wipe; capture+reapply required, not an empty-bag reseat`);
}

// SAT + rim preflight vs fresh live set (v6 footprint)
const A = obb(POS, YAW, HALF, CLOCAL);
{
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  let mn = Infinity, mx = -Infinity;
  for (const [su, sv] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
    const lx = CLOCAL.x + su * HALF.x, lz = CLOCAL.z + sv * HALF.z;
    const wx = POS[0] + lx * cos + lz * sin, wz = POS[2] - lx * sin + lz * cos;
    const r = Math.hypot(wx, wz);
    mn = Math.min(mn, r); mx = Math.max(mx, r);
  }
  if (mn < 66 || mx > 108) die(`rim corners ${mn.toFixed(2)}..${mx.toFixed(2)} outside [66,108]`);
  console.log(`rim corners ${mn.toFixed(2)}..${mx.toFixed(2)} in [66,108]`);
}
const adjacencies: string[] = [];
for (const [id, ent] of Object.entries(before)) {
  if (id === ID || !ent.lib || !ent.pos) continue;
  const bb = ent.bbox;
  if (!bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin ground film — SAT-exempt class
  if (id === HOST_EXEMPT) continue;           // standing dress-5 host-edge exemption (header)
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
u.searchParams.set("name", "commons-next NW district skeps dress-20 v6");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress20-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
