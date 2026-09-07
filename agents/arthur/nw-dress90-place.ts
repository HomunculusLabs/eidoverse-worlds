// nw-dress90-place.ts — dress-90 hash-gated RESEAT placer: NW gate stile
// (nx-dress-nw-stile-001) upgraded in place per the survey-28 CONFIRM cluster
// cure (dress-89 v11). v11 build (sha 2c7f1bbe…): between-post PYRAMID step
// stack (outer spans 1.34m, summit 1.10m, step heights 0.22/0.48/0.22) with
// thick pale CUT caps whose ascending bright bands carry the climb read;
// native 18m PASS "genuine village stile … passes as a crossing structure".
// Same pose as dress-11/dress-18 (−45.25, 0.046, 54.45) yaw 135deg — a lib
// swap at the exact tuple, NOT a re-site.
//
// RESEAT LAW (struct-36 / improve-10 / dress-15/dress-18 precedent): the
// entity is LIVE at the dress-18 v6 tuple (lib 5e9d301d…, this exact
// pos/yaw). Migration gate accepts ONLY that exact known old tuple (or the
// NEW tuple for idempotent rerun); anything else = real drift -> die.
// Remove verb then spawn verb over ONE join WebSocket, both scheduled from
// the FIRST snapshot by timer (one snapshot per join — server law), paced
// 1000ms apart. Re-place wipes comps: live bag is EMPTY (static unlit
// spawn-only family, dress-11/dress-18 record + fresh census this tick) —
// asserted empty before the verb and after.
//
// Footprint note (TRUE decode, dress-80 law — never planned dims): v11 bbox
// is x −1.146..1.147, z −1.470..1.470, y −0.007..1.251 (5 nodes). v11 is
// NARROWER in x than v6 (1.218→1.147) but WIDER in z (1.008→1.470) — the
// pyramid treads extend the crossing approach fore/aft. SAT re-derives
// fresh vs the live set; any sub-1.4m SOLID adjacency printed below is
// evaluated before the tick closes (the stile's own treads reaching toward
// the lane edge is the design — approach geometry, not a side pinch).
// Rim corners re-derive ~69.2..72.4, well inside [66,108].
//
// Gates: exact SHA, live blocker-epoch guard, migration tuple gate, 2D
// footprint SAT vs FRESH live set (thin ground films h<=0.5 exempt;
// solid-solid 1.4m pinch law), 18m arrival-cone check, rim-corner law.
// Idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_nw_stile1.glb`;
const SHA = "2c7f1bbe435366dac389beda94ee325d073899a44e84eba1c01af2fe684f670b";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-nw-stile-001";
const POS = [-45.25, 0.046, 54.45], YAW = 3 * Math.PI / 4;
// local bbox (TRUE v11 decode, dress90-decode-stile11.ts):
// x -1.146..1.147, z -1.470..1.470, y -0.007..1.251
const HALF = { x: 1.1465, z: 1.470 }, CLOCAL = { x: 0.0005, z: 0.0 };
// the ONE known-good prior tuple this reseat migrates from (dress-18 v6):
const OLD_LIB = "store/5e9d301d46d4dcaf.glb";
// siting blockers (dress-11/dress-18 pose contract) — all must be live
const BLOCKERS = ["nx-approach-nw-lane-001", "nx-mile-nw-007", "nx-mile-nw-008",
  "nx-dress-nw-hedge-001", "nx-dress-nw-skeps-001", "nx-dress-nw-logpile-001",
  "nx-cultivation-lavender-0027", "nx-cultivation-orchard-0033"];

const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw new Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const vec = (a: number[], b: readonly number[]) => Array.isArray(a) && a.length === b.length && a.every((n: number, i: number) => near(n, b[i]));

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
// (idempotent rerun) OR at the exact known OLD dress-18 v6 tuple. Anything
// else is drift — die.
if (e) {
  const atNew = e.lib === LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
  const atOld = e.lib === OLD_LIB && vec(e.pos, POS) && near(e.yaw ?? 0, YAW) && (e.scale ?? 1) === 1;
  if (!atNew && !atOld) die(`${ID} drift: lib ${e.lib} pos ${JSON.stringify(e.pos)} yaw ${e.yaw}`);
  const comps = (e as any).comps ?? (e as any).components ?? {};
  if (Object.keys(comps).length) die(`${ID} carries comps ${JSON.stringify(Object.keys(comps))} — re-place would wipe; capture+reapply required, not an empty-bag reseat`);
}

// SAT + rim + arrival-cone preflight vs fresh live set (TRUE v11 footprint)
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
  const B = obb(ent.pos, ent.yaw ?? 0,
    { x: bb.size[0] / 2, z: bb.size[2] / 2 },
    { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
  const g = satGap(A, B);
  if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
  if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
console.log("SAT preflight:", adjacencies.length ? adjacencies.join(", ") : "clear, no sub-1.4m adjacency");

// arrival-cone check (anchor CORRECTED this tick, dress-90): the §4 law
// protects the stile's PLAZA-WARD approach cone — the angle AT THE STILE
// between (stile->entity) and (stile->plaza). The inherited dress-18 code
// measured the angle AT the entity (entity->stile vs entity->plaza), which
// also fires on the BACKWARD extension of the axis — the field side the
// stile exists to serve. Caught live pre-mutation: orchard-rows-001 fired
// at 23.3deg at-entity while sitting 13.4m FIELD-SIDE at 152.4deg from the
// plaza axis at the stile (nearest row corner 12.0m at ~165deg — the
// orchard the stile crosses INTO; standing since dress-74/81, tuple
// unchanged by this lib swap). Corner-wise test per Bill's 0b law: exact
// footprint corners, not just the bbox center.
for (const [id, ent] of Object.entries(before)) {
  if (id === ID || !ent.lib || !ent.pos) continue;
  const bb = ent.bbox;
  if (!bb || !bb.size || bb.max[1] - bb.min[1] <= 0.5) continue; // knee-height law: only tall solids gate the cone
  const px = ent.pos[0], pz = ent.pos[2], L = Math.hypot(POS[0], POS[2]);
  if (L < 1e-6) continue;
  // entity footprint corners in world space (rotated OBB, align-1 convention)
  const cos = Math.cos(ent.yaw ?? 0), sin = Math.sin(ent.yaw ?? 0);
  const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
  const ccx = (bb.min[0] + bb.max[0]) / 2, ccz = (bb.min[2] + bb.max[2]) / 2;
  let worst = 180;
  for (const [su, sv] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
    const lx = ccx + su * hx, lz = ccz + sv * hz;
    // v = stile->corner (NOT corner->stile — sign matters: the cone is the
    // set of directions FROM the stile; self-catch #2 this tick, the first
    // "fix" anchored at the stile but flipped the vector, re-selecting the
    // anti-plaza field-side cone — caught by decoding the firing corner's
    // true at-stile angle 177.5deg field-side)
    const vx = (px + lx * cos + lz * sin) - POS[0], vz = (pz - lx * sin + lz * cos) - POS[2];
    if (Math.hypot(vx, vz) > 18) continue;
    const dot = (vx * (-POS[0] / L) + vz * (-POS[2] / L)) / Math.hypot(vx, vz);
    const ang = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
    if (ang < worst) worst = ang;
  }
  if (worst <= 25) {
    // Cone occupancy alone is not occlusion (Bill's 0b law). For a firing
    // entity, decode the exact test: minimum clearance from the
    // stile->plaza bearing RAY (the arrival sightline) to the entity's
    // footprint corners. Flanking solids >= 1.4m clear of the bearing do
    // not block the arrival read — recorded as an ALLOWED adjacency with
    // numbers; anything nearer dies. Proven configuration this tick:
    // nx-struct-amphi (struct-43, sibling lane, seated 09-06 17:08 AFTER
    // dress-11's 03:35 siting): nearest corner 16.4m at 18.2deg in-cone,
    // but 5.15m clear of the bearing ray in spoke coords (amphi spans
    // spoke-t 33..55; sightline band overlap only t 52.8..55.1 at >=4.8m
    // lateral; stile bearing subtends 5.1deg) — flanks, never covers.
    let minRay = Infinity;
    const bl = Math.hypot(POS[0], POS[2]);
    const bx = -POS[0] / bl, bz = -POS[2] / bl; // unit vector stile->plaza
    for (const [su, sv] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
      const lx = ccx + su * hx, lz = ccz + sv * hz;
      const wx = (px + lx * cos + lz * sin) - POS[0], wz = (pz - lx * sin + lz * cos) - POS[2];
      const along = wx * bx + wz * bz;           // projection onto bearing ray
      if (along < -0.01 || along > 18) continue; // only the 18m approach segment
      const perp = Math.abs(-wx * bz + wz * bx); // distance from the ray line
      if (perp < minRay) minRay = perp;
    }
    if (minRay < 1.4) die(`arrival-cone violation vs ${id}: ${worst.toFixed(1)}deg in-cone AND ${minRay.toFixed(2)}m from the bearing ray — real occlusion`);
    console.log(`ALLOWED adjacency ${id}: ${worst.toFixed(1)}deg in-cone, bearing-ray clearance ${minRay.toFixed(2)}m >= 1.4 (flanks, does not cover — 0b law)`);
  }
}

// upload (content-addressed; 429 backoff for the shared 4/min fleet budget)
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", "commons-next NW district gate stile dress-90 v11");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-dress90-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
