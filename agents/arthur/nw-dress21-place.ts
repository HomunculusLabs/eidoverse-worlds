// nw-dress21-place.ts — dress-21 hash-gated RESEAT placer: NW hedgerow
// (nx-dress-nw-hedge-001) upgraded in place per improve shard row 38
// (native rejudge on exact live v2 bytes CONFIRMED "lone stub riser reads
// isolated post/snag" + "stray cube reads dropped debris"; the v3 mid-gap
// DROP was WRONG — unprompted zoomed native look + survey-6's independent
// native confirm both read the break as missing mass, zero aperture
// furniture legible at 18m). v4 build (sha 3d5c7d44…): stub + nubs
// REMOVED (minimalism law), both foot stones tucked flush, AND the gap
// re-dressed in the lane's proven aperture-tell idiom (dress-11 stile
// caps / dress-18 gap flags / dress-19 post caps): pale CUTWOOD cut-
// pleacher end plates proud on both hedge end faces, kerbs re-valued
// PALE_STONE (dress-5 plinth value) and chunked fore/aft (dogleg), step
// re-valued pale. Judged: zoomed unprompted gap read FLIPPED to (a)
// intentional passage (native), gameplay 4/4 (native), close 3/3 (ZAI
// fallback — native 1210 ×2, disclosed). Same pose as the dress-1 tuple
// (−35.34, 0.04, 62.14) yaw −2.36 — a lib swap at the exact tuple, NOT a
// re-site.
//
// RESEAT LAW (struct-36 / dress-15/18/19/20 precedent): the entity is LIVE
// at the dress-1 tuple (this exact pos/yaw; lib chain f595e862 → a80e9121
// from this tick's intermediate v3 reseat). Migration gate accepts ONLY a
// known-old lib at the exact tuple (or the NEW tuple for idempotent
// rerun); anything else = drift -> die. Remove then spawn over ONE join
// WebSocket, both scheduled from the FIRST snapshot by timer (one snapshot
// per join — server law), paced 1000ms apart. Re-place wipes comps: live
// bag is EMPTY (static unlit spawn-only family, dress-1 record + fresh
// census this tick) — asserted empty before the verb and after.
//
// Footprint: v4 bbox x −3.3..3.3 (center 0), z −0.55..0.55 (center 0),
// y 0..1.51 — IDENTICAL to v3's decode and STRICTLY CONTAINED in the v2
// footprint (x same, z narrower, y lower), so every dress-1 siting
// relationship (arrival cones, rim) holds a fortiori; SAT re-derives
// fresh vs the live set with the constants below. (v2 local: x −3.3..3.3,
// z −0.885..0.95.)
//
// SAT exemption (inherited from dress-1, tier-b gap-bounded): the approach
// lane nx-approach-nw-lane-001 census bbox is a fat compound OBB (lamps
// baked in) spanning the winding lane; source-true vertex decode pinned in
// dress-hedge1-lane-decode.ts proved 17.6m real clearance at this pose.
// Real drift against the lane still fails the epoch/blocker gate.
// Gates: exact SHA, live blocker-epoch guard, migration tuple gate, 2D
// footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt;
// solid-solid 1.4m pinch law), rim-corner law. Idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_nw_hedge1.glb`;
const SHA = "3d5c7d44351e5076ddbe7ac785a1d904633c16f5d70eb5bb118c03ce31c713ce";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-nw-hedge-001";
const POS = [-35.34, 0.04, 62.14], YAW = -2.36;
// local bbox (v3 decode): x −3.3..3.3, z −0.55..0.55, y 0..1.51
const HALF = { x: 3.3, z: 0.55 }, CLOCAL = { x: 0, z: 0 };
// the known-good prior libs this reseat migrates from (dress-1; then this
// tick's intermediate v3): both at the exact same tuple.
const OLD_LIBS = ["store/f595e862465c49e0.glb", "store/a80e91213feaacd5.glb"];
// siting blockers (dress-1 pose contract) — all must be live
const BLOCKERS = ["nx-cultivation-lavender-0040", "nx-struct-echoarch", "nx-cultivation-orchard-0046",
  "nx-approach-nw-lane-001", "nx-approach-nw-lamp-002-l"];
// fat compound lane OBB (tier-b named exemption, numbers above)
const LANE_FAT_BBOX_EXEMPT = "nx-approach-nw-lane-001";

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
// (idempotent rerun) OR at the exact known OLD dress-1 tuple. Anything
// else is drift — die.
if (e) {
  const atNew = e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
  const atOld = OLD_LIBS.includes(e.lib) && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
  if (!atNew && !atOld) die(`${ID} drift: lib ${e.lib} pos ${JSON.stringify(e.pos)} yaw ${e.yaw}`);
  const comps = (e as any).comps ?? (e as any).components ?? {};
  if (Object.keys(comps).length) die(`${ID} carries comps ${JSON.stringify(Object.keys(comps))} — re-place would wipe; capture+reapply required, not an empty-bag reseat`);
}

// SAT + rim preflight vs fresh live set (v3 footprint)
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
  if (id === LANE_FAT_BBOX_EXEMPT) continue;  // tier-b named exemption (header)
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
u.searchParams.set("name", "commons-next NW district hedgerow dress-21 v3");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress21-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
