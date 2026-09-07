// sw-dress108-lanternhook-place.ts — dress-108/109 placement: hash-gated
// placer for the SW lantern hook row (nx-dress-sw-lanternhook-001, v5 sha
// 639c5480…) at (-57.0, PY, -70.0) yaw 282.34° on the devotional
// corridor's W flank.
//
// Siting evidence (dress-108 corridor scan at v4 constants — full-quadrant
// 0.5m sweep, labyrinth DISC law, struct-19 class — round work tested as
// an exact annulus r_out 7.03 + solid-solid 1.4m, never its fat 13.1m
// square OBB whose dead corners inflate ~2.5m/side): 99 legal poses;
// final pose (-57.0,-70.0) yaw 282.34° re-gated analytically at TRUE v5
// constants below — disc +6.61m, worst box-SAT +1.56m (seats), line 7.75m,
// rim 86.4..90.6 ∈ [70,100] (city-plan district band), approach cones
// clear. v5 envelope is STRICTLY CONTAINED in the certified v4 OBB
// (x-max 3.914<4.149, z-max 0.395<0.423). Terrain re-pinned THIS tick
// (dress-109) at the v5 OBB corners: 7-pt spread 3.96mm, worst corner
// -0.030565 -> PY.
//
// v4→v5 judge arc (dress-109): v4 judged 4/4+4/4 under ZAI fallback with a
// native-confirm debt; native confirm on close4 FAILED (factory blocks +
// 2-post read) — the 2-post/dead-gap read was a FRAMING ARTIFACT (close4's
// camera at post-1's shoulder, 42° FOV at 4.2m crops post 3; closewide view
// added, 3 posts confirmed), but the clone read was REAL: identical
// 4-course stacks with mm-scale jitter are clones at read distance
// (dress-97 worn-slab law — the judge sees the silhouette, not the bevel).
// v5: per-post course profiles 4/3/5, heights 0.90/0.85/0.95, distinct
// dressing configs — native closewide 4/4 + approach18 4/4 PASS.
//
// Hooks EMPTY by policy (lanterns pend Bill's SW lamp a/b/c; hooks spend
// zero lamp budget, zero light, zero emissive). Static, no comps —
// spawn-only family; SW lamp spend 0 of 3. Gates: exact SHA, live
// blocker-epoch guard, entity collision/drift, 2D footprint SAT vs FRESH
// live set (thin ground films h<=0.5 exempt; labyrinth via disc law),
// ALLOWED_ADJACENT with measured values, rim, post-place tuple verify,
// idempotent rerun. dress-107/99 chassis.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const WORLD = "commons-next";
const FILE = `${ROOT}/agents/arthur/assets/village_dress_sw_lanternhook1.glb`;
const SHA = "639c54800d2e58567a17f84c08c12474a2de65b227b341d3c15e08899b76eb22";
const LIB = `store/${SHA.slice(0, 16)}.glb`;
const ID = "nx-dress-sw-lanternhook-001";
const POS = [-57.0, -0.030565, -70.0], YAW = 4.927732279782902; // 282.34deg — hooks (local -z) face E toward the corridor
// local bbox (v5 decode): x -0.201..3.914 (center +1.8564, half 2.0579),
// z -0.448..0.395 (center -0.0263, half 0.4216)
const HALF = { x: 2.0579, z: 0.4216 }, CLOCAL = { x: 1.8564, z: -0.0263 };
// siting blockers this pose was derived against — all must be live
const BLOCKERS = ["nx-temple-labyrinth-0038", "nx-temple-terrace-0049", "nx-dress-sw-bellpost-001", "nx-dress-sw-seats-001"];
// labyrinth: exact ring (struct-19 disc law). ring_outer from live bbox
// max corner radius 6.99 + tol; annulus wall solid.
const LAB = { id: "nx-temple-labyrinth-0038", ring_outer: 7.03 };
// named sub-1.4m film-edge adjacencies (none expected; populated only with
// measured values + reason if the fresh set shifts)

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
// disc-vs-OBB exact (struct-19): signed distance from disc center to the
// OBB's edge box; overlap when < R.
const discGap = (cx: number, cz: number, o: OBB, R: number) => {
  const dx = cx - o.cx, dz = cz - o.cz;
  const du = Math.abs(dx * o.ux[0] + dz * o.ux[1]) - o.hu[0];
  const dv = Math.abs(dx * o.uz[0] + dz * o.uz[1]) - o.hu[1];
  const dist = Math.hypot(Math.max(du, 0), Math.max(dv, 0));
  return dist - R;
};

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
  if (id === LAB.id) {
    // exact disc law (struct-19): the labyrinth is a round wall annulus;
    // its 13.1m square OBB inflates ~2.5m of dead corners per side
    const lp = ent.pos as number[];
    const g = discGap(lp[0], lp[2], A, LAB.ring_outer);
    if (g < 1.4) adjacencies.push(`${id} (disc): ${g.toFixed(3)}m`);
    continue;
  }
  const B = obb(ent.pos, ent.yaw ?? 0,
    { x: bb.size[0] / 2, z: bb.size[2] / 2 },
    { x: (bb.min[0] + bb.max[0]) / 2, z: (bb.min[2] + bb.max[2]) / 2 });
  const g = satGap(A, B);
  if (g < 0) die(`SAT overlap vs ${id}: gap ${g.toFixed(3)}m`);
  if (g < 1.4) adjacencies.push(`${id}: ${g.toFixed(3)}m`);
}
if (adjacencies.length) die(`unexplained sub-1.4m solid adjacency: ${adjacencies.join(", ")}`);
console.log(`SAT preflight clear; no sub-1.4m adjacency (labyrinth via disc law)`);
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
u.searchParams.set("name", "commons-next SW lantern hook row dress-108");
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
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-sw-dress108-place", avatar: cfg.avatar, token: cfg.joinToken }));
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
